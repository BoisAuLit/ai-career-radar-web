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
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execSync, spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
// Fixture registry. `--fixture A` (default) preserves the AgentOps-3 A behavior
// exactly. `--fixture B` was added in AgentOps-4a (2026-07-19_run_01) for
// gradual coverage expansion. Each entry carries its own must-not-happen
// literal list and recommendation-match keywords so B does not overfit A's
// gap theme. Capture logic + length thresholds are shared across fixtures.
const FIXTURE_TABLE = {
  A: {
    path: ".agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md",
    mustNotLiterals: [
      "learn python",
      "beginner python",
      "as an ai language model",
    ],
    recommendationKeywords: ["rag", "eval", "retrieval"],
  },
  B: {
    path: ".agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md",
    mustNotLiterals: [
      "learn react",
      "beginner react",
      "beginner typescript",
      "as an ai language model",
    ],
    recommendationKeywords: [
      "agent",
      "tool call",
      "tool-call",
      "eval",
      "telemetry",
    ],
  },
};

// Strict CLI parser (AgentOps-5d-cosmetic).
// Runs BEFORE any side effect (assertLocalhost / mkdir / dev-server /
// browser / API). --help and -h print usage and exit 0. Any unknown flag,
// missing --fixture value, unsupported fixture id, duplicated --fixture,
// or unexpected positional argument prints an error, prints usage to
// stderr, and exits 2. On success returns { fixtureId }.
function printUsage(stream) {
  const supported = Object.keys(FIXTURE_TABLE).join(", ");
  stream.write(
    [
      "Usage:",
      "  node scripts/report-regression-local.mjs [--fixture A|B]",
      "",
      "Options:",
      `  --fixture <id>   Run one supported regression fixture (${supported})`,
      "  -h, --help       Show this help and exit",
      "",
    ].join("\n"),
  );
}

function fatalCli(message) {
  process.stderr.write(`report-regression-local: ${message}\n`);
  printUsage(process.stderr);
  process.exit(2);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let fixtureId = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      printUsage(process.stdout);
      process.exit(0);
    }
    if (a === "--fixture") {
      const val = args[i + 1];
      if (val === undefined || val.startsWith("--")) {
        return fatalCli(`--fixture requires a value (one of: ${Object.keys(FIXTURE_TABLE).join(", ")})`);
      }
      const candidate = val.toUpperCase();
      if (!FIXTURE_TABLE[candidate]) {
        return fatalCli(`Unknown fixture: ${val}. Supported: ${Object.keys(FIXTURE_TABLE).join(", ")}`);
      }
      if (fixtureId !== null && fixtureId !== candidate) {
        return fatalCli(`Conflicting --fixture values: ${fixtureId} vs ${candidate}`);
      }
      fixtureId = candidate;
      i++;
      continue;
    }
    if (a.startsWith("--") || a.startsWith("-")) {
      return fatalCli(`Unknown flag: ${a}`);
    }
    return fatalCli(`Unexpected positional argument: ${a}`);
  }
  // Preserve prior contract: no --fixture defaults to A (used by baseline
  // commits and existing 5c-integrate/5d/5d-stability/5d-b-timeout-diagnostics
  // documented run pattern).
  return { fixtureId: fixtureId ?? "A" };
}

const BASE_URL = process.env.REPORT_REGRESSION_BASE_URL || "http://localhost:3000";
const ALLOWED_HOSTS = new Set(["localhost", "127.0.0.1"]);

const SOFT_LATENCY_MS = 120_000;
const HARD_LATENCY_MS = 240_000;
const REPORT_LEN_SOFT_MIN = 1500;
// Widened from 6000 to 14000 in AgentOps-3e-tune-2 (2026-07-12_run_05).
// The 6000 upper bound was calibrated for whole-body capture (~17k chars).
// After AgentOps-3e-tune narrowed capture to a report-specific candidate
// (`main section` scope, ~11k chars for Fixture A), the 6000 max produced
// a false AMBER on `report_length_in_soft_band`. 14000 gives headroom for
// natural variance in report length while still catching runaway or empty
// outputs.
const REPORT_LEN_SOFT_MAX = 14000;

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

// AgentOps-5c-integrate: invoke scripts/quote-integrity-check.mjs
// synchronously against the just-saved scratchpad report + cleaned served
// corpus. Returns a normalized envelope for metadata / structural_checks /
// verdict.md. Never throws — failures land in the returned envelope with
// verdict "blocked_no_report" / "blocked_no_corpus" / "checker_error".
// Telemetry-only in this loop: does not change the harness exit code.
function runQuoteIntegrity({
  repoRoot,
  reportPath,
  reportSaved,
  corpusPath,
  outPath,
  fixtureId,
  runId,
}) {
  const summaryRel = path.relative(repoRoot, outPath);
  const base = {
    checkerExecuted: false,
    summaryWritten: false,
    summary_path: summaryRel,
    verdict: "unknown",
    schema_version: null,
    counts: {},
    red_reasons: [],
    amber_reasons: [],
    blocking_mode: "telemetry_only",
    errorExcerpt: null,
  };
  if (!reportSaved || !existsSync(reportPath)) {
    return { ...base, verdict: "blocked_no_report" };
  }
  if (!existsSync(corpusPath)) {
    return { ...base, verdict: "blocked_no_corpus" };
  }
  let res;
  try {
    res = spawnSync(
      process.execPath,
      [
        path.join(repoRoot, "scripts/quote-integrity-check.mjs"),
        "--report", reportPath,
        "--corpus", corpusPath,
        "--out", outPath,
        "--fixture", fixtureId,
        "--source-run-id", runId,
      ],
      { encoding: "utf8", cwd: repoRoot },
    );
  } catch (err) {
    return { ...base, verdict: "checker_error", errorExcerpt: String(err.message || err).slice(0, 500) };
  }
  if (res.status !== 0) {
    const stderr = (res.stderr || "").slice(0, 500);
    return { ...base, checkerExecuted: true, verdict: "checker_error", errorExcerpt: stderr };
  }
  const summaryWritten = existsSync(outPath);
  if (!summaryWritten) {
    return { ...base, checkerExecuted: true, verdict: "checker_error", errorExcerpt: "summary_not_written" };
  }
  try {
    const parsed = JSON.parse(readFileSync(outPath, "utf8"));
    return {
      checkerExecuted: true,
      summaryWritten: true,
      summary_path: summaryRel,
      verdict: parsed.verdict || "unknown",
      schema_version: parsed.schema_version || null,
      counts: parsed.counts || {},
      red_reasons: Array.isArray(parsed.red_reasons) ? parsed.red_reasons : [],
      amber_reasons: Array.isArray(parsed.amber_reasons) ? parsed.amber_reasons : [],
      blocking_mode: "telemetry_only",
      errorExcerpt: null,
    };
  } catch (err) {
    return { ...base, checkerExecuted: true, summaryWritten, verdict: "checker_error", errorExcerpt: `parse_error: ${err.message}`.slice(0, 500) };
  }
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
  // parseArgs() runs BEFORE any I/O side effect. --help/-h exit 0 here;
  // invalid CLI arguments exit 2 without creating a run dir, starting a
  // dev server, launching a browser, or making any API call.
  const { fixtureId } = parseArgs();

  assertLocalhost(BASE_URL);
  const fixtureCfg = FIXTURE_TABLE[fixtureId];
  const fixturePath = path.join(REPO_ROOT, fixtureCfg.path);
  const fixtureText = await readFile(fixturePath, "utf8");
  const fixture = parseFixture(fixtureText);

  const runId = `${utcRunStamp()}_fixture-${fixtureId}`;
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

  // ─── Network diagnostics (AgentOps-5d-b-timeout-diagnostics) ─────────
  // Additive-only observability. Captures `requestfailed` events and any
  // response with status >= 400, using a strict safe-header allowlist and
  // sanitized body excerpt. Does NOT touch thresholds, retry logic, or the
  // app runtime.
  const SAFE_HEADERS_ALLOWLIST = [
    "request-id",
    "x-request-id",
    "anthropic-request-id",
    "cf-ray",
    "traceparent",
    "x-vercel-id",
    "x-amzn-trace-id",
    "retry-after",
  ];
  const networkEvents = [];
  let firstNon2xxUrl = null;
  let firstNon2xxStatus = null;
  let firstFailureElapsedMs = null;
  let generateRouteStatus = null;

  page.on("requestfailed", (request) => {
    try {
      networkEvents.push({
        event_type: "requestfailed",
        elapsed_ms: Date.now() - t0,
        url: request.url(),
        method: request.method(),
        resource_type: request.resourceType(),
        failure_reason: request.failure()?.errorText || null,
      });
    } catch {
      /* ignore observability errors */
    }
  });

  page.on("response", async (response) => {
    let status;
    try {
      status = response.status();
    } catch {
      return;
    }
    if (status < 400) return;
    const url = response.url();
    const request = response.request();
    let method = "";
    let resourceType = "";
    try {
      method = request.method();
      resourceType = request.resourceType();
    } catch {
      /* keep empty */
    }
    let selectedHeaders = {};
    try {
      const raw = response.headers();
      for (const key of SAFE_HEADERS_ALLOWLIST) {
        if (raw[key]) selectedHeaders[key] = String(raw[key]).slice(0, 200);
      }
    } catch {
      /* keep empty */
    }
    let bodyExcerpt = "";
    try {
      const body = await response.text();
      bodyExcerpt = (body || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 500);
    } catch (err) {
      bodyExcerpt = `body_excerpt_error: ${String(err?.message || err).slice(0, 200)}`;
    }
    const elapsed_ms = Date.now() - t0;
    let statusText = null;
    try {
      statusText = response.statusText ? response.statusText() : null;
    } catch {
      statusText = null;
    }
    networkEvents.push({
      event_type: "non_2xx_response",
      elapsed_ms,
      url,
      status,
      status_text: statusText,
      method,
      resource_type: resourceType,
      selected_headers: selectedHeaders,
      body_excerpt: bodyExcerpt,
    });
    if (firstNon2xxUrl === null) {
      firstNon2xxUrl = url;
      firstNon2xxStatus = status;
      firstFailureElapsedMs = elapsed_ms;
    }
    if (url.includes("/api/generate-report") && generateRouteStatus === null) {
      generateRouteStatus = status;
    }
  });

  const checks = [];

  let pageLoaded = false;
  let resumeFilled = false;
  let targetFilled = false;
  let generateClicked = false;
  let doneReached = false;
  let completionState = "not_started";
  let completionElapsedMs = 0;
  let visibleErrorExcerpt = null;
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

    // Wait for done state (Copy report button appears in action bar) OR
    // application error state (Retry button appears in error panel). Race
    // between the two so an early stage:"error" transition is not masked as
    // a 240s timeout. Threshold unchanged (HARD_LATENCY_MS still 240s).
    const waitStart = Date.now();
    const successPromise = page
      .waitForSelector('button:has-text("Copy report")', {
        timeout: HARD_LATENCY_MS,
      })
      .then(() => ({ type: "success" }))
      .catch(() => null);
    const errorPromise = page
      .waitForSelector('button:has-text("Retry")', {
        timeout: HARD_LATENCY_MS,
      })
      .then(() => ({ type: "error" }))
      .catch(() => null);
    const raceResult = await Promise.race([successPromise, errorPromise]);
    completionElapsedMs = Date.now() - waitStart;
    if (raceResult?.type === "success") {
      doneReached = true;
      completionState = "success";
    } else if (raceResult?.type === "error") {
      doneReached = false;
      completionState = "application_error";
      // Capture a small sanitized excerpt of the visible error panel text.
      try {
        const bodyText = await page.locator("body").innerText();
        const idx = bodyText.indexOf("Retry");
        if (idx >= 0) {
          const before = Math.max(0, idx - 400);
          const after = Math.min(bodyText.length, idx + 60);
          visibleErrorExcerpt = bodyText
            .slice(before, after)
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 500);
        }
      } catch {
        /* ignore excerpt errors */
      }
      consoleErrors.push(
        `applicationErrorDetected: retry button visible after ${completionElapsedMs}ms`,
      );
    } else {
      completionState = "hard_timeout";
      consoleErrors.push(
        `waitForDoneFailed: neither Copy report nor Retry appeared within ${HARD_LATENCY_MS}ms`,
      );
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

  // ─── Quote integrity (AgentOps-5c-integrate · telemetry only) ─────────
  // Invokes scripts/quote-integrity-check.mjs against the just-saved
  // scratchpad report.md and the cleaned served corpus. The resulting
  // quote_integrity_summary.json is committed under the run directory
  // alongside metadata/structural_checks/verdict. Blocking mode is
  // "telemetry_only" this loop — a red quote-integrity verdict does NOT
  // change the harness exit code. R1/R2 policy lives inside the checker.
  const quoteIntegrity = runQuoteIntegrity({
    repoRoot: REPO_ROOT,
    reportPath: scratchReportPath,
    reportSaved: Boolean(reportText),
    corpusPath: path.join(REPO_ROOT, "src/data/web_bundle.json"),
    outPath: path.join(runDir, "quote_integrity_summary.json"),
    fixtureId,
    runId,
  });

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
  // Literal list is fixture-specific (see FIXTURE_TABLE). We still guard
  // each literal against the fixture's own `## Must not happen` section so
  // an accidental broader list cannot force a false red.
  const mustNotHits = [];
  const mustNotLiterals = fixtureCfg.mustNotLiterals;
  for (const item of fixture.mustNotHappen) {
    for (const lit of mustNotLiterals) {
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

  // Recommendation match (heuristic). Fixture-specific keyword list keeps A
  // (RAG/eval/retrieval) untouched and lets B look for agent/tool-call/eval/
  // telemetry keywords. Conservative: only requires any one keyword.
  const lowerReport = reportText.toLowerCase();
  const recKeywords = fixtureCfg.recommendationKeywords;
  const recHits = recKeywords.filter((k) => lowerReport.includes(k));
  checks.push({
    key: "recommendation_roughly_matches_expected",
    bucket: "fixture",
    level: "amber",
    pass: recHits.length > 0,
    detail: `keywords=[${recKeywords.join(",")}] hits=[${recHits.join(",")}]`,
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

  // Quote-integrity telemetry checks (AgentOps-5c-integrate).
  // All 5 sit in bucket "quote_integrity" at level "amber" so a failure
  // never escalates to RED via the existing classify() rollup. Promotion
  // to blocking (level "red") requires a separate DECISION.
  checks.push({
    key: "quote_integrity_checker_executed",
    bucket: "quote_integrity",
    level: "amber",
    pass: quoteIntegrity.checkerExecuted,
    detail: `mode=${quoteIntegrity.blocking_mode} verdict=${quoteIntegrity.verdict}${quoteIntegrity.errorExcerpt ? ` err="${quoteIntegrity.errorExcerpt}"` : ""}`,
  });
  checks.push({
    key: "quote_integrity_summary_written",
    bucket: "quote_integrity",
    level: "amber",
    pass: quoteIntegrity.summaryWritten,
    detail: quoteIntegrity.summary_path,
  });
  checks.push({
    key: "quote_integrity_verdict_recorded",
    bucket: "quote_integrity",
    level: "amber",
    pass: Boolean(quoteIntegrity.verdict),
    detail: `verdict=${quoteIntegrity.verdict}`,
  });
  checks.push({
    key: "quote_integrity_red_reasons_count",
    bucket: "quote_integrity",
    level: "amber",
    pass: true,
    detail: `count=${quoteIntegrity.red_reasons.length}`,
  });
  checks.push({
    key: "quote_integrity_amber_reasons_count",
    bucket: "quote_integrity",
    level: "amber",
    pass: true,
    detail: `count=${quoteIntegrity.amber_reasons.length}`,
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
    report_length_soft_min: REPORT_LEN_SOFT_MIN,
    report_length_soft_max: REPORT_LEN_SOFT_MAX,
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
        "quote_integrity_summary.json",
        "network_diagnostics.json",
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
    completion_state: completionState,
    completion_elapsed_ms: completionElapsedMs,
    network_diagnostics_path: `.agent/regression_runs/${runId}/network_diagnostics.json`,
    application_error_detected: completionState === "application_error",
    application_error_excerpt: visibleErrorExcerpt,
    first_non_2xx_url: firstNon2xxUrl,
    first_non_2xx_status: firstNon2xxStatus,
    first_failure_elapsed_ms: firstFailureElapsedMs,
    quote_integrity: {
      enabled: true,
      checker_path: "scripts/quote-integrity-check.mjs",
      summary_path: quoteIntegrity.summary_path,
      verdict: quoteIntegrity.verdict,
      schema_version: quoteIntegrity.schema_version,
      counts: quoteIntegrity.counts,
      red_reasons: quoteIntegrity.red_reasons,
      amber_reasons: quoteIntegrity.amber_reasons,
      blocking_mode: quoteIntegrity.blocking_mode,
    },
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

  // ─── Network diagnostics artifact (AgentOps-5d-b-timeout-diagnostics) ──
  const statusesHistogram = {};
  let requestfailedCount = 0;
  let non2xxCount = 0;
  for (const ev of networkEvents) {
    if (ev.event_type === "requestfailed") {
      requestfailedCount++;
    } else if (ev.event_type === "non_2xx_response") {
      non2xxCount++;
      const key = String(ev.status);
      statusesHistogram[key] = (statusesHistogram[key] || 0) + 1;
    }
  }
  const networkDiagnostics = {
    schema_version: "0.1-b-timeout-diagnostics",
    fixture_id: fixtureId,
    run_id: runId,
    started_at: startedAt,
    completion_state: completionState,
    completion_elapsed_ms: completionElapsedMs,
    error_state_detected: completionState === "application_error",
    visible_error_excerpt: visibleErrorExcerpt,
    events: networkEvents,
    summary: {
      requestfailed_count: requestfailedCount,
      non_2xx_count: non2xxCount,
      statuses: statusesHistogram,
      first_failure_elapsed_ms: firstFailureElapsedMs,
      generate_route_status: generateRouteStatus,
    },
  };
  await writeFile(
    path.join(runDir, "network_diagnostics.json"),
    JSON.stringify(networkDiagnostics, null, 2),
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
    "## Quote integrity",
    "",
    `- **Verdict**: **${(quoteIntegrity.verdict || "unknown").toUpperCase()}**`,
    `- **Summary**: \`${quoteIntegrity.summary_path}\``,
    `- **Red reasons**: ${quoteIntegrity.red_reasons.length}`,
    `- **Amber reasons**: ${quoteIntegrity.amber_reasons.length}`,
    `- **Blocking mode**: \`${quoteIntegrity.blocking_mode}\` — telemetry only in this integration loop; does not change the report-regression GREEN/AMBER/RED exit code. Promoting to blocking requires a separate DECISION.`,
    "",
    "## Network diagnostics",
    "",
    `- **Completion state**: \`${completionState}\``,
    `- **Elapsed to completion**: ${completionElapsedMs} ms`,
    `- **Diagnostics**: \`.agent/regression_runs/${runId}/network_diagnostics.json\``,
    `- **First non-2xx**: ${firstNon2xxUrl ? `\`${firstNon2xxUrl}\` (status ${firstNon2xxStatus}, elapsed_ms=${firstFailureElapsedMs})` : "_none_"}`,
    `- **Application error detected**: ${completionState === "application_error" ? "yes" : "no"}`,
    visibleErrorExcerpt ? `- **Visible error excerpt**: \`${visibleErrorExcerpt.replace(/`/g, "'")}\`` : "- **Visible error excerpt**: _none_",
    `- **Thresholds**: unchanged (\`HARD_LATENCY_MS=${HARD_LATENCY_MS}\`, \`SOFT_LATENCY_MS=${SOFT_LATENCY_MS}\`)`,
    "",
    "## Artifacts",
    "",
    `- Committed: \`.agent/regression_runs/${runId}/{${(() => {
      // AgentOps-5d-cosmetic: list only files actually written for this run.
      // metadata/structural/verdict are always written before this string is
      // built. quote_integrity_summary and network_diagnostics are optional.
      const written = ["metadata.json", "structural_checks.json", "verdict.md"];
      if (existsSync(path.join(runDir, "quote_integrity_summary.json"))) {
        written.push("quote_integrity_summary.json");
      }
      if (existsSync(path.join(runDir, "network_diagnostics.json"))) {
        written.push("network_diagnostics.json");
      }
      return written.join(",");
    })()}}\``,
    `- Scratchpad: \`${scratchReportPath}\`, \`${scratchScreenshotPath}\``,
    "",
  ].join("\n");

  await writeFile(path.join(runDir, "verdict.md"), verdictMd, "utf8");

  await browser.close();

  // ─── Summary line ─────────────────────────────────────────────────────
  console.log(
    `report-regression-local · run_id=${runId} fixture=${fixtureId} verdict=${classification.verdict.toUpperCase()} exit=${classification.exit} scope=${capture.scope} chars=${reportCharCount} body_chars=${capture.pageBodyCharCount} candidates=${capture.candidateCount}/${capture.qualifiedCount} duration_ms=${durationMs}`,
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
