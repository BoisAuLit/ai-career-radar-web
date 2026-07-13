#!/usr/bin/env node
/**
 * scripts/report-regression-local.mjs
 *
 * AgentOps-3e minimal local Playwright report regression prototype.
 *
 * Reads Fixture A from `.agent/regression_fixtures/`, drives a headless
 * Chromium session against `http://localhost:3000`, generates one real
 * report through the running Next.js app, runs structural / fixture-specific
 * / operational checks, and writes a small committed verdict.
 *
 * Reference: `.agent/design_memos/2026-07-12_AgentOps-3d_report_regression_harness_design.md`.
 *
 * Invariants (do not violate):
 *   - Localhost target only. Non-localhost hosts are hard-rejected.
 *   - Fixture A only. No parallel fixtures.
 *   - One real generation per run (cost cap by policy, not measurement).
 *   - No `.env*` read.
 *   - No OpenAI / Anthropic API HTTP call from this script.
 *   - No `.agent/scripts/**` edit. Script lives under repo-root `scripts/`.
 *   - Large artifacts (report.md, screenshot.png) → local scratchpad only.
 *   - Verdict + metadata + structural_checks go under
 *     `.agent/regression_runs/<run-id>/` and DO get committed.
 *
 * Exit codes:
 *   0 = green
 *   1 = red
 *   2 = amber
 */

import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const FIXTURE_PATH = path.join(
  REPO_ROOT,
  ".agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md",
);

const BASE_URL = process.env.REPORT_REGRESSION_BASE_URL || "http://localhost:3000";
const ALLOWED_HOSTS = new Set(["localhost", "127.0.0.1"]);

const SOFT_LATENCY_MS = 120_000;
const HARD_LATENCY_MS = 240_000;
const REPORT_LEN_SOFT_MIN = 1500;
const REPORT_LEN_SOFT_MAX = 6000;

// Required section markers used to score capture candidates and
// (separately) to run structural section checks. Same list on both
// sides so a candidate that passes scoring is also the candidate that
// gets structurally checked.
const REPORT_SECTION_MARKERS = [
  "Target role",
  "What you already have",
  "Top 5 gaps",
  "Over-prioritizing",
  "Highest-leverage next action",
];
const EVIDENCE_APPENDIX_RE = /evidence appendix|## evidence/i;

// Candidate selectors, ordered from most likely to contain only the
// report region to least likely. `extractReportText` enumerates each
// selector's matches, scores by marker coverage, and picks the shortest
// fully-qualified candidate. Falls back to `body` only if nothing
// qualifies — in that case verdict is forced to at least AMBER via
// the `report_capture_scope_not_body` check.
const CANDIDATE_SELECTORS = [
  "[data-testid*='report']",
  "[data-report]",
  "article",
  "main section",
  "main",
  "section",
  "div[class*='prose']",
  "div[class*='markdown']",
  "div[class*='report']",
];
const MIN_CANDIDATE_LENGTH = 500;

// UTC timestamp in YYYYMMDDTHHMMSSZ form.
function utcRunStamp() {
  const iso = new Date().toISOString();
  return iso
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function assertLocalhost(baseUrl) {
  let host;
  try {
    host = new URL(baseUrl).hostname;
  } catch {
    throw new Error(`Invalid base URL: ${baseUrl}`);
  }
  if (!ALLOWED_HOSTS.has(host)) {
    throw new Error(
      `Refusing non-localhost target: ${host}. Allowed hosts: ${[...ALLOWED_HOSTS].join(", ")}.`,
    );
  }
  return host;
}

// Parse a fixture Markdown file into named sections keyed by H2 header.
function parseFixture(text) {
  const lines = text.split(/\r?\n/);
  const sections = {};
  let currentKey = "_preamble";
  const buf = new Map();
  buf.set(currentKey, []);
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)\s*$/);
    if (m) {
      currentKey = m[1].trim();
      if (!buf.has(currentKey)) buf.set(currentKey, []);
    } else {
      buf.get(currentKey).push(line);
    }
  }
  for (const [k, arr] of buf) sections[k] = arr.join("\n").trim();

  const meta = {};
  for (const line of (sections["Metadata"] || "").split("\n")) {
    const m = line.match(/^-\s+([a-z_]+):\s*(.*)$/i);
    if (m) meta[m[1].trim()] = m[2].replace(/^`|`$/g, "").trim();
  }

  return {
    metadata: meta,
    targetRole: sections["Target role input"] || "",
    resume: sections["Resume input"] || "",
    expectedStrengths: parseBullets(sections["Expected strengths"] || ""),
    expectedGaps: parseBullets(sections["Expected gaps"] || ""),
    expectedNextAction:
      sections["Expected high-leverage next action"] || "",
    mustNotHappen: parseBullets(sections["Must not happen"] || ""),
  };
}

function parseBullets(text) {
  return text
    .split(/\n(?=-\s)/)
    .map((s) => s.trim().replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

function safeGitSha() {
  try {
    return execSync("git rev-parse HEAD", { cwd: REPO_ROOT })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

async function readWebBundleStatsField(field) {
  try {
    const src = await readFile(
      path.join(REPO_ROOT, "src/lib/web-bundle-stats.ts"),
      "utf8",
    );
    const m = src.match(new RegExp(`\\b${field}\\s*:\\s*"([^"]*)"`));
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function readModelDisplayField(field) {
  try {
    const src = await readFile(
      path.join(REPO_ROOT, "src/lib/models-display.ts"),
      "utf8",
    );
    const m = src.match(new RegExp(`\\b${field}\\s*:\\s*"([^"]*)"`));
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

// Keyword heuristic: does `haystack` contain any of the provided phrase's
// distinctive tokens? Returns the first token hit or null.
function anyTokenHit(haystack, phrase) {
  const stop = new Set([
    "a",
    "an",
    "and",
    "the",
    "of",
    "for",
    "in",
    "to",
    "as",
    "is",
    "on",
    "or",
    "with",
    "by",
    "at",
    "from",
    "into",
    "not",
    "no",
  ]);
  const tokens = phrase
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 5 && !stop.has(t));
  for (const tok of tokens) {
    if (haystack.toLowerCase().includes(tok)) return tok;
  }
  return null;
}

// Given a Playwright `page`, enumerate CANDIDATE_SELECTORS, score each
// match by presence of the required section markers + Evidence Appendix,
// and return the shortest fully-qualified candidate (all 5 markers +
// evidence). Falls back to `body.innerText()` if none qualify.
//
// Returns:
//   {
//     text,                          // the extracted report text
//     scope,                         // e.g. "section", or "body_fallback"
//     strategy,                      // "shortest-qualified-candidate" | "body-fallback"
//     candidateCount,                // total DOM nodes scanned
//     qualifiedCount,                // how many had all 5 markers + evidence
//     selectedLength,                // chars of chosen text
//     selectedMarkerHits,            // 0..REPORT_SECTION_MARKERS.length
//     selectedHasEvidence,           // bool
//     pageBodyCharCount,             // body.innerText() length (for observability)
//     fallbackUsed,                  // true iff strategy === "body-fallback"
//     debugTop3,                     // small array for RUN_REPORT / debugging
//   }
async function extractReportText(page) {
  const bodyText = await page.locator("body").innerText();
  const pageBodyCharCount = bodyText.length;

  const seen = new Set();
  const candidates = [];

  for (const selector of CANDIDATE_SELECTORS) {
    let handles;
    try {
      handles = await page.locator(selector).all();
    } catch {
      continue;
    }
    for (const handle of handles) {
      let text;
      try {
        text = await handle.innerText();
      } catch {
        continue;
      }
      if (!text || text.length < MIN_CANDIDATE_LENGTH) continue;
      // Skip near-duplicates keyed by (length, prefix).
      const key = `${text.length}:${text.slice(0, 64)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const lower = text.toLowerCase();
      const markerHits = REPORT_SECTION_MARKERS.filter((m) =>
        lower.includes(m.toLowerCase()),
      ).length;
      const hasEvidence = EVIDENCE_APPENDIX_RE.test(text);
      candidates.push({
        selector,
        text,
        length: text.length,
        markerHits,
        hasEvidence,
      });
    }
  }

  const qualified = candidates.filter(
    (c) => c.markerHits === REPORT_SECTION_MARKERS.length && c.hasEvidence,
  );

  const debugTop3 = candidates
    .slice()
    .sort((a, b) => b.markerHits - a.markerHits || a.length - b.length)
    .slice(0, 3)
    .map((c) => ({
      selector: c.selector,
      length: c.length,
      markerHits: c.markerHits,
      hasEvidence: c.hasEvidence,
    }));

  if (qualified.length > 0) {
    qualified.sort((a, b) => a.length - b.length);
    const chosen = qualified[0];
    return {
      text: chosen.text,
      scope: chosen.selector,
      strategy: "shortest-qualified-candidate",
      candidateCount: candidates.length,
      qualifiedCount: qualified.length,
      selectedLength: chosen.length,
      selectedMarkerHits: chosen.markerHits,
      selectedHasEvidence: chosen.hasEvidence,
      pageBodyCharCount,
      fallbackUsed: false,
      debugTop3,
    };
  }

  // Fallback: no candidate contained all 5 markers + evidence. Return
  // body text so downstream section checks can still run, but flag the
  // fallback so `report_capture_scope_not_body` fires amber.
  const lowerBody = bodyText.toLowerCase();
  const bodyMarkerHits = REPORT_SECTION_MARKERS.filter((m) =>
    lowerBody.includes(m.toLowerCase()),
  ).length;
  return {
    text: bodyText,
    scope: "body_fallback",
    strategy: "body-fallback",
    candidateCount: candidates.length,
    qualifiedCount: 0,
    selectedLength: bodyText.length,
    selectedMarkerHits: bodyMarkerHits,
    selectedHasEvidence: EVIDENCE_APPENDIX_RE.test(bodyText),
    pageBodyCharCount,
    fallbackUsed: true,
    debugTop3,
  };
}

function classify(checks) {
  const red = [];
  const amber = [];
  for (const c of checks) {
    if (c.level === "red" && !c.pass) red.push(c);
    if (c.level === "amber" && !c.pass) amber.push(c);
  }
  if (red.length) return { verdict: "red", exit: 1, red, amber };
  if (amber.length) return { verdict: "amber", exit: 2, red, amber };
  return { verdict: "green", exit: 0, red: [], amber: [] };
}

async function main() {
  // ─── Preflight ────────────────────────────────────────────────────────
  assertLocalhost(BASE_URL);

  const fixtureText = await readFile(FIXTURE_PATH, "utf8");
  const fixture = parseFixture(fixtureText);

  const runId = `${utcRunStamp()}_fixture-A`;
  const runDir = path.join(REPO_ROOT, ".agent/regression_runs", runId);
  await mkdir(runDir, { recursive: true });

  const scratchDir = path.join(
    os.tmpdir(),
    "acr-regression-runs",
    runId,
  );
  await mkdir(scratchDir, { recursive: true });

  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  const gitSha = safeGitSha();
  const corpusSnapshot = await readWebBundleStatsField("corpusSnapshotDate");
  const modelDisplay = await readModelDisplayField("generationModel");

  // ─── Browser session ──────────────────────────────────────────────────
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(`console.error: ${m.text()}`);
  });

  const checks = [];

  let pageLoaded = false;
  let resumeFilled = false;
  let targetFilled = false;
  let generateClicked = false;
  let doneReached = false;
  let incompleteBannerVisible = false;
  let reportText = "";
  let reportCharCount = 0;
  let capture = {
    text: "",
    scope: "unset",
    strategy: "unset",
    candidateCount: 0,
    qualifiedCount: 0,
    selectedLength: 0,
    selectedMarkerHits: 0,
    selectedHasEvidence: false,
    pageBodyCharCount: 0,
    fallbackUsed: false,
    debugTop3: [],
  };

  try {
    // page loaded ─────────────────────────────────────────────────────
    await page.goto(BASE_URL, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    pageLoaded = true;

    // resume + target fill ────────────────────────────────────────────
    await page.locator("#resume").fill(fixture.resume);
    resumeFilled = true;
    await page
      .locator('textarea[placeholder*="role"]')
      .first()
      .fill(fixture.targetRole);
    targetFilled = true;

    // click Generate ──────────────────────────────────────────────────
    await page
      .getByRole("button", { name: /Generate.*report/i })
      .first()
      .click();
    generateClicked = true;

    // Wait for done state (Copy report button appears in action bar).
    try {
      await page.waitForSelector('button:has-text("Copy report")', {
        timeout: HARD_LATENCY_MS,
      });
      doneReached = true;
    } catch (err) {
      consoleErrors.push(`waitForDoneFailed: ${err.message}`);
    }

    // Detect incomplete banner (Candidate 1 sentinel).
    if (doneReached) {
      incompleteBannerVisible = await page
        .getByText("may be incomplete")
        .isVisible()
        .catch(() => false);
    }

    // Capture report text — marker-scored candidate strategy. See
    // `extractReportText` for the algorithm. Falls back to body only
    // when no candidate contains all 5 section markers + evidence.
    if (doneReached) {
      capture = await extractReportText(page);
      reportText = capture.text;
      reportCharCount = capture.selectedLength;
    }
  } catch (err) {
    consoleErrors.push(`fatal: ${err.message}`);
  }

  const finishedAt = new Date().toISOString();
  const durationMs = Date.now() - t0;

  // Save large artifacts to scratchpad (not repo).
  const scratchReportPath = path.join(scratchDir, "report.md");
  const scratchScreenshotPath = path.join(scratchDir, "report.png");
  try {
    if (reportText) await writeFile(scratchReportPath, reportText, "utf8");
    if (doneReached) {
      await page.screenshot({ path: scratchScreenshotPath, fullPage: true });
    }
  } catch (err) {
    consoleErrors.push(`artifact-save: ${err.message}`);
  }

  // ─── Structural checks ────────────────────────────────────────────────
  checks.push({
    key: "page_loaded",
    bucket: "structural",
    level: "red",
    pass: pageLoaded,
  });
  checks.push({
    key: "resume_filled",
    bucket: "structural",
    level: "red",
    pass: resumeFilled,
  });
  checks.push({
    key: "target_filled",
    bucket: "structural",
    level: "red",
    pass: targetFilled,
  });
  checks.push({
    key: "generate_clicked",
    bucket: "structural",
    level: "red",
    pass: generateClicked,
  });
  checks.push({
    key: "done_state_reached",
    bucket: "structural",
    level: "red",
    pass: doneReached,
  });
  checks.push({
    key: "incomplete_banner_absent",
    bucket: "structural",
    level: "red",
    pass: !incompleteBannerVisible,
  });
  checks.push({
    key: "report_non_empty",
    bucket: "structural",
    level: "red",
    pass: reportCharCount > 0,
  });

  // Capture-scope observability. `report_text_capture_success` is red
  // if we could not extract any text at all. `report_capture_scope_not_body`
  // is amber and fires when we had to fall back to body — the report
  // itself is still there, but the length/section metrics below are then
  // measured against the whole page, which is why we force at least AMBER.
  checks.push({
    key: "report_text_capture_success",
    bucket: "structural",
    level: "red",
    pass: capture.selectedLength > 0,
    detail: `scope=${capture.scope} strategy=${capture.strategy} candidates=${capture.candidateCount} qualified=${capture.qualifiedCount}`,
  });
  checks.push({
    key: "report_capture_scope_not_body",
    bucket: "structural",
    level: "amber",
    pass: !capture.fallbackUsed,
    detail: `scope=${capture.scope} fallback_used=${capture.fallbackUsed} page_body_chars=${capture.pageBodyCharCount}`,
  });

  const sectionHeaders = [
    "Target role",
    "What you already have",
    "top 5 gaps",
    "over-prioritizing",
    "highest-leverage next action",
  ];
  for (const header of sectionHeaders) {
    checks.push({
      key: `contains_section_${header.replace(/\s+/g, "_").toLowerCase()}`,
      bucket: "structural",
      level: "red",
      pass: reportText.toLowerCase().includes(header.toLowerCase()),
    });
  }
  checks.push({
    key: "contains_evidence_appendix",
    bucket: "structural",
    level: "red",
    pass: /evidence appendix|## evidence/i.test(reportText),
  });

  // Report length band (soft = amber).
  const lengthInSoftBand =
    reportCharCount >= REPORT_LEN_SOFT_MIN &&
    reportCharCount <= REPORT_LEN_SOFT_MAX;
  checks.push({
    key: "report_length_in_soft_band",
    bucket: "structural",
    level: "amber",
    pass: lengthInSoftBand,
    detail: `chars=${reportCharCount} band=${REPORT_LEN_SOFT_MIN}-${REPORT_LEN_SOFT_MAX}`,
  });

  // Action bar buttons (soft = amber).
  const actionButtons = ["Copy report", "Download", "Eval this report", "Start over"];
  const buttonHits = [];
  for (const label of actionButtons) {
    const visible = await page
      .getByRole("button", { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") })
      .first()
      .isVisible()
      .catch(() => false);
    buttonHits.push({ label, visible });
  }
  checks.push({
    key: "action_bar_buttons_present",
    bucket: "structural",
    level: "amber",
    pass: buttonHits.filter((b) => b.visible).length >= 3,
    detail: buttonHits.map((b) => `${b.label}=${b.visible}`).join("; "),
  });

  // ─── Fixture-specific checks ──────────────────────────────────────────
  const strengthsHit = fixture.expectedStrengths.filter((s) =>
    anyTokenHit(reportText, s),
  );
  checks.push({
    key: "at_least_2_strengths_reflected",
    bucket: "fixture",
    level: "amber",
    pass: strengthsHit.length >= 2,
    detail: `hits=${strengthsHit.length}/${fixture.expectedStrengths.length}`,
  });

  const gapsHit = fixture.expectedGaps.filter((g) => anyTokenHit(reportText, g));
  checks.push({
    key: "at_least_2_gaps_reflected",
    bucket: "fixture",
    level: "amber",
    pass: gapsHit.length >= 2,
    detail: `hits=${gapsHit.length}/${fixture.expectedGaps.length}`,
  });

  // Must-not-happen: distinctive tokens matched against report text.
  const mustNotHits = [];
  for (const item of fixture.mustNotHappen) {
    // conservative literal-substring check for a few hand-picked hard rules
    const literals = [
      "learn python",
      "beginner python",
      "as an ai language model",
    ];
    for (const lit of literals) {
      if (item.toLowerCase().includes(lit) && reportText.toLowerCase().includes(lit)) {
        mustNotHits.push(lit);
      }
    }
  }
  checks.push({
    key: "must_not_happen_absent",
    bucket: "fixture",
    level: "red",
    pass: mustNotHits.length === 0,
    detail: mustNotHits.length
      ? `matched: ${mustNotHits.join(", ")}`
      : "no matches",
  });

  // Recommendation match (heuristic).
  const recAction = fixture.expectedNextAction.toLowerCase();
  const recMatch =
    reportText.toLowerCase().includes("rag") ||
    reportText.toLowerCase().includes("eval") ||
    (recAction.includes("rag") && reportText.toLowerCase().includes("retrieval"));
  checks.push({
    key: "recommendation_roughly_matches_expected",
    bucket: "fixture",
    level: "amber",
    pass: recMatch,
    detail: "heuristic match on RAG/eval/retrieval keywords",
  });

  // ─── Operational checks ───────────────────────────────────────────────
  checks.push({
    key: "duration_under_soft_threshold",
    bucket: "operational",
    level: "amber",
    pass: durationMs < SOFT_LATENCY_MS,
    detail: `duration_ms=${durationMs} soft=${SOFT_LATENCY_MS}`,
  });
  checks.push({
    key: "duration_under_hard_threshold",
    bucket: "operational",
    level: "red",
    pass: durationMs < HARD_LATENCY_MS,
    detail: `duration_ms=${durationMs} hard=${HARD_LATENCY_MS}`,
  });
  checks.push({
    key: "no_fatal_playwright_error",
    bucket: "operational",
    level: "red",
    pass: !consoleErrors.some((e) => e.startsWith("fatal:")),
  });
  checks.push({
    key: "no_production_target",
    bucket: "operational",
    level: "red",
    pass: ALLOWED_HOSTS.has(new URL(BASE_URL).hostname),
  });

  const classification = classify(checks);

  const metadata = {
    run_id: runId,
    fixture_id: fixture.metadata.fixture_id || "A",
    fixture_version: fixture.metadata.version || "1",
    base_url: BASE_URL,
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: durationMs,
    git_commit_sha: gitSha,
    corpus_snapshot_date: corpusSnapshot,
    model_display: modelDisplay,
    report_char_count: reportCharCount,
    page_body_char_count: capture.pageBodyCharCount,
    capture_scope: capture.scope,
    capture_strategy: capture.strategy,
    candidate_count: capture.candidateCount,
    qualified_candidate_count: capture.qualifiedCount,
    selected_candidate_char_count: capture.selectedLength,
    selected_candidate_marker_count: capture.selectedMarkerHits,
    selected_candidate_has_evidence: capture.selectedHasEvidence,
    fallback_used: capture.fallbackUsed,
    capture_debug_top3: capture.debugTop3,
    verdict: classification.verdict,
    exit_code: classification.exit,
    cost_measured: false,
    cost_cap_enforced_by: "single_generation_limit",
    artifact_policy: {
      committed: [
        "metadata.json",
        "structural_checks.json",
        "verdict.md",
      ],
      local_scratchpad: [
        "report.md",
        "report.png",
      ],
    },
    scratch_paths: {
      report_md: scratchReportPath,
      screenshot_png: scratchScreenshotPath,
    },
    console_errors: consoleErrors.slice(0, 10),
  };

  await writeFile(
    path.join(runDir, "metadata.json"),
    JSON.stringify(metadata, null, 2),
    "utf8",
  );

  await writeFile(
    path.join(runDir, "structural_checks.json"),
    JSON.stringify(checks, null, 2),
    "utf8",
  );

  const verdictMd = [
    `# Verdict · ${runId}`,
    "",
    `- **Verdict**: **${classification.verdict.toUpperCase()}**`,
    `- **Exit code**: ${classification.exit}`,
    `- **Fixture**: ${metadata.fixture_id} (v${metadata.fixture_version})`,
    `- **Duration**: ${durationMs} ms`,
    `- **Capture scope**: \`${capture.scope}\` (strategy=\`${capture.strategy}\`, fallback=${capture.fallbackUsed})`,
    `- **Report length (selected scope)**: ${reportCharCount} chars`,
    `- **Page body length**: ${capture.pageBodyCharCount} chars`,
    `- **Candidates scanned / qualified**: ${capture.candidateCount} / ${capture.qualifiedCount}`,
    `- **Commit**: ${gitSha ?? "unknown"}`,
    `- **Corpus snapshot**: ${corpusSnapshot ?? "unknown"}`,
    `- **Model**: ${modelDisplay ?? "unknown"}`,
    "",
    "## Red checks failed",
    "",
    classification.red.length === 0
      ? "_none_"
      : classification.red
          .map(
            (c) =>
              `- \`${c.key}\` (${c.bucket})${c.detail ? ` — ${c.detail}` : ""}`,
          )
          .join("\n"),
    "",
    "## Amber checks failed",
    "",
    classification.amber.length === 0
      ? "_none_"
      : classification.amber
          .map(
            (c) =>
              `- \`${c.key}\` (${c.bucket})${c.detail ? ` — ${c.detail}` : ""}`,
          )
          .join("\n"),
    "",
    "## Artifacts",
    "",
    `- Committed: \`.agent/regression_runs/${runId}/{metadata.json,structural_checks.json,verdict.md}\``,
    `- Scratchpad: \`${scratchReportPath}\`, \`${scratchScreenshotPath}\``,
    "",
  ].join("\n");

  await writeFile(path.join(runDir, "verdict.md"), verdictMd, "utf8");

  await browser.close();

  // ─── Summary line ─────────────────────────────────────────────────────
  console.log(
    `report-regression-local · run_id=${runId} fixture=A verdict=${classification.verdict.toUpperCase()} exit=${classification.exit} scope=${capture.scope} chars=${reportCharCount} body_chars=${capture.pageBodyCharCount} candidates=${capture.candidateCount}/${capture.qualifiedCount} duration_ms=${durationMs}`,
  );
  if (classification.red.length) {
    console.log(
      `  red: ${classification.red.map((c) => c.key).join(", ")}`,
    );
  }
  if (classification.amber.length) {
    console.log(
      `  amber: ${classification.amber.map((c) => c.key).join(", ")}`,
    );
  }
  console.log(`  committed artifacts under: .agent/regression_runs/${runId}/`);
  console.log(`  scratchpad: ${scratchDir}`);

  process.exit(classification.exit);
}

main().catch((err) => {
  console.error("report-regression-local: fatal error");
  console.error(err);
  process.exit(1);
});
