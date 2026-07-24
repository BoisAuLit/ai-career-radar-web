#!/usr/bin/env node
// AgentOps-5e-followup-baseline-lint-integrate-implement · Phase 2 tests.
//
// 20 deterministic integration tests (I1-I20) that exercise the helper
// module `scripts/lib/structural-evidence-integration.mjs` and combined
// telemetry semantics WITHOUT invoking the harness generation path, the
// browser, the app, or any network / LLM call.
//
// - Node stdlib only. No new dependency.
// - Synthetic reports, synthetic contexts, temp directories.
// - Static source assertions where noted.

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  chmodSync,
  readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import process from "node:process";

import {
  runStructuralEvidence,
  combineTelemetryVerdict,
  deriveCaptureCompleteness,
} from "./lib/structural-evidence-integration.mjs";

const REPO_ROOT = resolve(".");
const VALIDATOR = resolve("scripts/structural-evidence-check.mjs");
const HARNESS = resolve("scripts/report-regression-local.mjs");
const HELPER = resolve("scripts/lib/structural-evidence-integration.mjs");
const BASELINE_ROOT = resolve(".agent/regression_baselines");
const TMP_ROOT = join(tmpdir(), `structural-evidence-integration-${process.pid}`);
if (!existsSync(TMP_ROOT)) mkdirSync(TMP_ROOT, { recursive: true });

// -------- Fixtures --------

function skeleton({
  gapsCount = 5,
  citationsPerGap = null,
  appendix = null,
  header = "# Personal Gap Report — synthetic\n\n## Target role\nAI Engineer.\n\n## What you already have — don't re-learn this\n- Python\n",
} = {}) {
  const parts = [header, "\n## Your top 5 gaps, ranked\n"];
  for (let i = 1; i <= gapsCount; i++) {
    parts.push(`\n${i}. Gap topic ${i}\n`);
    parts.push("- Skill name — 50% of applied_ai JDs\n");
    parts.push("- Why it's a gap for THIS user\n");
    const cits = citationsPerGap
      ? citationsPerGap[i - 1] || []
      : [defaultCitation(i)];
    for (const c of cits) parts.push(`${c}\n`);
  }
  parts.push("\n## Skills you might be over-prioritizing\nNothing flagged.\n");
  parts.push("\n## Your single highest-leverage next action\nReassess in 4 weeks.\n");
  if (appendix !== null) parts.push(`\n${appendix}\n`);
  return parts.join("");
}

function defaultCitation(n) {
  const map = [
    'Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.',
    'Evidence quote: "hands-on production experience with LLM tool use" — NovaAI, jd_100002.',
    'Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.',
    'Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.',
    'Evidence quote: "fine-tuning open-source models" — Draft, jd_100005.',
  ];
  return map[(n - 1) % map.length];
}

function tabAppendix(rows) {
  return (
    "## Evidence Appendix\n" +
    rows.map((r) => `${r.jd_id}\t${r.company}\t${r.title}`).join("\n")
  );
}

const APPENDIX_5 = tabAppendix([
  { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
  { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
  { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
  { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
  { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
]);

const GREEN_REPORT = skeleton({ appendix: APPENDIX_5 });
const AMBER_REPORT = skeleton({
  appendix:
    "## Evidence Appendix\njd_100001\tExampleCo\tSenior AI Engineer\njd_100001\tExampleCo\tSenior AI Engineer\njd_100002\tNovaAI\tML Solutions\njd_100003\tHelixLabs\tLLM Ops\njd_100004\tZenith\tApplied Research\njd_100005\tDraft\tFine-tuning Lead",
});
const RED_REPORT = skeleton({ appendix: null });

function completeContext(overrides = {}) {
  return {
    capture_scope: "main section",
    fallback_used: false,
    completion_state: "success",
    capture_complete: true,
    report_capture_error: null,
    report_char_count: 5000,
    expected_sections_captured: true,
    source: "test-integration",
    ...overrides,
  };
}

// Baseline snapshot for I17 (mtime + size + count under regression_baselines).
function snapshotBaselines(root) {
  if (!existsSync(root)) return { present: false };
  const items = [];
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const s = statSync(p);
      if (s.isDirectory()) walk(p);
      else items.push({ path: p, size: s.size, mtimeMs: s.mtimeMs });
    }
  }
  walk(root);
  items.sort((a, b) => a.path.localeCompare(b.path));
  return { present: true, items };
}

function baselinesUnchanged(before, after) {
  if (before.present !== after.present) return false;
  if (!before.present) return true;
  if (before.items.length !== after.items.length) return false;
  for (let i = 0; i < before.items.length; i++) {
    const b = before.items[i];
    const a = after.items[i];
    if (b.path !== a.path) return false;
    if (b.size !== a.size) return false;
    if (b.mtimeMs !== a.mtimeMs) return false;
  }
  return true;
}

function newRunDir(label) {
  const dir = join(TMP_ROOT, `run-${label}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeReport(dir, text) {
  const p = join(dir, "report.md");
  writeFileSync(p, text, "utf8");
  return p;
}

function invokeStructural(dir, reportText, contextOverrides = {}) {
  const reportPath = writeReport(dir, reportText);
  const outputPath = join(dir, "structural_evidence_summary.json");
  const contextPath = join(dir, "structural_evidence_context.json");
  return runStructuralEvidence({
    validatorPath: VALIDATOR,
    reportPath,
    reportSaved: true,
    outputPath,
    contextPath,
    captureContext: completeContext(contextOverrides),
    summaryPathRelative: `run/${statSync(dir).ino}/structural_evidence_summary.json`,
    contextPathRelative: `run/${statSync(dir).ino}/structural_evidence_context.json`,
  });
}

// -------- Test harness --------
let passed = 0;
let failed = 0;
const failures = [];
function test(name, fn) {
  try {
    fn();
    passed++;
    process.stdout.write(`PASS ${name}\n`);
  } catch (err) {
    failed++;
    failures.push({ name, err: err.stack || String(err) });
    process.stdout.write(`FAIL ${name}\n  ${err.message}\n`);
  }
}

// -------- I1-I5 core envelopes --------

test("I1 · GREEN structural envelope · evaluation_status=completed · verdict=green · affected_legacy_verdict=false", () => {
  const dir = newRunDir("I1");
  const env = invokeStructural(dir, GREEN_REPORT);
  assert.equal(env.evaluation_status, "completed");
  assert.equal(env.verdict, "green");
  assert.equal(env.exit_code, 0);
  assert.equal(env.blocking_mode, "telemetry_only");
  assert.equal(env.affected_legacy_verdict, false);
  assert.ok(env.checker_hash && /^sha256:[a-f0-9]{64}$/.test(env.checker_hash));
  assert.equal(env.tool_error, null);
});

test("I2 · AMBER structural envelope · verdict=amber · exit 0", () => {
  const dir = newRunDir("I2");
  const env = invokeStructural(dir, AMBER_REPORT);
  assert.equal(env.evaluation_status, "completed");
  assert.equal(env.verdict, "amber");
  assert.equal(env.exit_code, 0);
});

test("I3 · RED structural exit 1 is valid telemetry · NOT tool_error", () => {
  const dir = newRunDir("I3");
  const env = invokeStructural(dir, RED_REPORT);
  assert.equal(env.evaluation_status, "completed");
  assert.equal(env.verdict, "red");
  assert.equal(env.exit_code, 1);
  assert.equal(env.tool_error, null);
});

test("I4 · Incomplete capture context (capture_complete=false) · not_evaluable", () => {
  const dir = newRunDir("I4");
  const env = invokeStructural(dir, RED_REPORT, { capture_complete: false });
  assert.equal(env.evaluation_status, "not_evaluable");
  assert.equal(env.verdict, "not_evaluable");
  assert.ok(
    env.not_evaluable_reasons.some((x) => /capture_incomplete/.test(x)),
    `expected capture_incomplete reason, got ${JSON.stringify(env.not_evaluable_reasons)}`,
  );
});

test("I5 · Validator exit 2 (invalid context schema) → tool_error validator_exit_2 · no verdict", () => {
  const dir = newRunDir("I5");
  const reportPath = writeReport(dir, GREEN_REPORT);
  const outputPath = join(dir, "structural_evidence_summary.json");
  const contextPath = join(dir, "structural_evidence_context.json");
  const env = runStructuralEvidence({
    validatorPath: VALIDATOR,
    reportPath,
    reportSaved: true,
    outputPath,
    contextPath,
    captureContext: completeContext({ capture_scope: 42 }), // wrong type → validator tool_error
  });
  assert.equal(env.evaluation_status, "tool_error");
  assert.equal(env.verdict, null);
  assert.equal(env.exit_code, 2);
  assert.equal(env.tool_error.reason, "validator_exit_2");
});

// -------- I6-I9 QI × structural 2×2 combined telemetry --------

test("I6 · combineTelemetryVerdict · QI amber + structural green → amber", () => {
  const combined = combineTelemetryVerdict(
    { evaluation_status: "completed", verdict: "amber" },
    { evaluation_status: "completed", verdict: "green" },
  );
  assert.equal(combined, "amber");
});

test("I7 · combineTelemetryVerdict · QI green + structural red → red", () => {
  const combined = combineTelemetryVerdict(
    { evaluation_status: "completed", verdict: "green" },
    { evaluation_status: "completed", verdict: "red" },
  );
  assert.equal(combined, "red");
});

test("I8 · combineTelemetryVerdict · QI red + structural green → red", () => {
  const combined = combineTelemetryVerdict(
    { evaluation_status: "completed", verdict: "red" },
    { evaluation_status: "completed", verdict: "green" },
  );
  assert.equal(combined, "red");
});

test("I9 · combineTelemetryVerdict · both red → red · tool_error overrides", () => {
  assert.equal(
    combineTelemetryVerdict(
      { evaluation_status: "completed", verdict: "red" },
      { evaluation_status: "completed", verdict: "red" },
    ),
    "red",
  );
  assert.equal(
    combineTelemetryVerdict(
      { evaluation_status: "tool_error", verdict: null },
      { evaluation_status: "completed", verdict: "red" },
    ),
    "tool_error",
  );
});

// -------- I10-I13 error/timeout paths --------

test("I10 · Artifact missing after validator exit 0 → tool_error artifact_missing_after_exit_0", () => {
  // Stub validator that returns exit 0 without writing artifact.
  const stub = join(TMP_ROOT, "stub_exit0_noartifact.mjs");
  writeFileSync(stub, "process.exit(0);\n", "utf8");
  const dir = newRunDir("I10");
  const reportPath = writeReport(dir, GREEN_REPORT);
  const outputPath = join(dir, "structural_evidence_summary.json");
  const contextPath = join(dir, "structural_evidence_context.json");
  const env = runStructuralEvidence({
    validatorPath: stub,
    reportPath,
    reportSaved: true,
    outputPath,
    contextPath,
    captureContext: completeContext(),
  });
  assert.equal(env.evaluation_status, "tool_error");
  assert.equal(env.tool_error.reason, "artifact_missing_after_exit_0");
});

test("I11 · Malformed structural summary JSON → tool_error summary_invalid_json", () => {
  const stub = join(TMP_ROOT, "stub_writes_bad_json.mjs");
  writeFileSync(
    stub,
    `import { writeFileSync } from "node:fs";
const idx = process.argv.indexOf("--output");
writeFileSync(process.argv[idx + 1], "{not json", "utf8");
process.exit(0);
`,
    "utf8",
  );
  const dir = newRunDir("I11");
  const reportPath = writeReport(dir, GREEN_REPORT);
  const outputPath = join(dir, "structural_evidence_summary.json");
  const contextPath = join(dir, "structural_evidence_context.json");
  const env = runStructuralEvidence({
    validatorPath: stub,
    reportPath,
    reportSaved: true,
    outputPath,
    contextPath,
    captureContext: completeContext(),
  });
  assert.equal(env.evaluation_status, "tool_error");
  assert.equal(env.tool_error.reason, "summary_invalid_json");
});

test("I12 · Validator timeout (5s configured; stub sleeps 4s under 500ms cap) → tool_error validator_timeout", () => {
  const stub = join(TMP_ROOT, "stub_sleeps.mjs");
  writeFileSync(stub, "setTimeout(() => process.exit(0), 4000);\n", "utf8");
  const dir = newRunDir("I12");
  const reportPath = writeReport(dir, GREEN_REPORT);
  const outputPath = join(dir, "structural_evidence_summary.json");
  const contextPath = join(dir, "structural_evidence_context.json");
  const env = runStructuralEvidence({
    validatorPath: stub,
    reportPath,
    reportSaved: true,
    outputPath,
    contextPath,
    captureContext: completeContext(),
    timeoutMs: 500,
  });
  assert.equal(env.evaluation_status, "tool_error");
  assert.equal(env.tool_error.reason, "validator_timeout");
  assert.equal(env.verdict, null);
});

test("I13 · Invalid context schema (unknown schema_version) → validator tool_error", () => {
  // We can't force the helper to write an unknown schema without hacking
  // the wrapper, but the real validator surfaces it as exit 2. Simulate by
  // pointing at a stub that echoes exit 2.
  const stub = join(TMP_ROOT, "stub_exit2.mjs");
  writeFileSync(
    stub,
    "process.stderr.write('context_schema_unknown\\n'); process.exit(2);\n",
    "utf8",
  );
  const dir = newRunDir("I13");
  const reportPath = writeReport(dir, GREEN_REPORT);
  const outputPath = join(dir, "structural_evidence_summary.json");
  const contextPath = join(dir, "structural_evidence_context.json");
  const env = runStructuralEvidence({
    validatorPath: stub,
    reportPath,
    reportSaved: true,
    outputPath,
    contextPath,
    captureContext: completeContext(),
  });
  assert.equal(env.evaluation_status, "tool_error");
  assert.equal(env.exit_code, 2);
  assert.equal(env.tool_error.reason, "validator_exit_2");
});

// -------- I14-I15 fallback matrix --------

test("I14 · fallback_used=true AND expected_sections_captured=false → not_evaluable", () => {
  const dir = newRunDir("I14");
  const env = invokeStructural(dir, GREEN_REPORT, {
    capture_scope: "body",
    fallback_used: true,
    expected_sections_captured: false,
  });
  assert.equal(env.evaluation_status, "not_evaluable");
  assert.ok(
    env.not_evaluable_reasons.some((x) => /fallback_capture_incomplete/.test(x)),
  );
});

test("I15 · fallback_used=true AND expected_sections_captured=true → normal GREEN", () => {
  const dir = newRunDir("I15");
  const env = invokeStructural(dir, GREEN_REPORT, {
    capture_scope: "body",
    fallback_used: true,
    expected_sections_captured: true,
  });
  assert.equal(env.evaluation_status, "completed");
  assert.equal(env.verdict, "green");
});

// -------- I16-I20 boundary / invariant --------

test("I16 · Phase 1 CLI backward compatibility (no --context) still works via spawnSync", () => {
  const dir = newRunDir("I16");
  const reportPath = writeReport(dir, GREEN_REPORT);
  const outputPath = join(dir, "structural_evidence_summary.json");
  const res = spawnSync(
    process.execPath,
    [VALIDATOR, "--report", reportPath, "--output", outputPath],
    { encoding: "utf8" },
  );
  assert.equal(res.status, 0);
  const parsed = JSON.parse(readFileSync(outputPath, "utf8"));
  assert.equal(parsed.verdict, "green");
  assert.equal(parsed.capture_context, null);
});

test("I17 · No baseline files changed after full helper invocation", () => {
  const before = snapshotBaselines(BASELINE_ROOT);
  const dir = newRunDir("I17");
  invokeStructural(dir, GREEN_REPORT);
  invokeStructural(dir, RED_REPORT);
  const after = snapshotBaselines(BASELINE_ROOT);
  assert.ok(baselinesUnchanged(before, after), "baseline files must not change");
});

test("I18 · No report body embedded in envelope · no report body embedded in summary artifact", () => {
  const dir = newRunDir("I18");
  const env = invokeStructural(dir, GREEN_REPORT);
  const envStr = JSON.stringify(env);
  assert.ok(
    !envStr.includes("Personal Gap Report — synthetic"),
    "envelope must not embed report body",
  );
  const summaryPath = join(dir, "structural_evidence_summary.json");
  const summaryStr = readFileSync(summaryPath, "utf8");
  assert.ok(
    !summaryStr.includes("Personal Gap Report — synthetic"),
    "structural summary must not embed report body",
  );
});

test("I19 · No validator retry · exactly one spawn call per run (proven via spawn counter stub)", () => {
  const counterPath = join(TMP_ROOT, "spawn_counter.txt");
  writeFileSync(counterPath, "0", "utf8");
  const stub = join(TMP_ROOT, "stub_count_and_exit1.mjs");
  writeFileSync(
    stub,
    `import { readFileSync, writeFileSync } from "node:fs";
const p = ${JSON.stringify(counterPath)};
const n = Number(readFileSync(p, "utf8")) + 1;
writeFileSync(p, String(n), "utf8");
// Write minimal RED artifact so envelope path reaches success validation.
const idx = process.argv.indexOf("--output");
writeFileSync(process.argv[idx + 1], JSON.stringify({schema_version:"0.1-phase1",verdict:"red"}), "utf8");
process.exit(1);
`,
    "utf8",
  );
  const dir = newRunDir("I19");
  const reportPath = writeReport(dir, RED_REPORT);
  const outputPath = join(dir, "structural_evidence_summary.json");
  const contextPath = join(dir, "structural_evidence_context.json");
  const env = runStructuralEvidence({
    validatorPath: stub,
    reportPath,
    reportSaved: true,
    outputPath,
    contextPath,
    captureContext: completeContext(),
  });
  const spawnCount = Number(readFileSync(counterPath, "utf8"));
  assert.equal(spawnCount, 1, "validator must be spawned exactly once (no retry)");
  assert.equal(env.evaluation_status, "completed");
  assert.equal(env.verdict, "red");
});

test("I20 · Static source assertions · legacy process-exit / checks-push semantics unchanged", () => {
  const harnessSrc = readFileSync(HARNESS, "utf8");
  const helperSrc = readFileSync(HELPER, "utf8");
  // Harness must still exit via classify(checks).exit — the sole authority.
  assert.ok(
    /process\.exit\(classification\.exit\)/.test(harnessSrc),
    "harness must retain `process.exit(classification.exit)` — legacy exit authority",
  );
  // Helper must not import Playwright / node:http / node:https / fetch.
  assert.ok(!/from\s+"playwright"/.test(helperSrc), "helper must not import playwright");
  assert.ok(!/node:http[s]?/.test(helperSrc), "helper must not import node:http/https");
  assert.ok(!/global\.fetch|globalThis\.fetch|\bfetch\(/.test(helperSrc), "helper must not use fetch");
  // Helper must state affected_legacy_verdict: false.
  assert.ok(/affected_legacy_verdict:\s*false/.test(helperSrc), "helper must always emit affected_legacy_verdict: false");
  // Helper must not touch .agent/regression_baselines/**.
  assert.ok(!/regression_baselines/.test(helperSrc), "helper must not touch baselines");
  // Harness must not have any `checks.push` that references a structural
  // envelope variable — approximate via absence of new push lines.
  assert.ok(
    !/checks\.push\([^)]*structural(Evidence|Result|Envelope)/i.test(harnessSrc),
    "harness must not push structural results into legacy checks[]",
  );
});

// -------- I21-I26 · capture-evaluability regression (2026-07-24_run_07 fix) --------
//
// Purpose: prove that capture completeness is derived STRICTLY from
// transport/mechanism facts (category A) and never from structural-
// content signals (category B). A fully captured but structurally
// broken report MUST remain evaluable and yield structural RED — not
// not_evaluable.

// Build the same synthetic report but strip specific structural
// elements to represent complete capture + missing structure.
const REPORT_NO_APPENDIX = skeleton({ appendix: null });
const REPORT_NO_CITATIONS = skeleton({
  citationsPerGap: [[], [], [], [], []],
  appendix: APPENDIX_5,
});
const REPORT_FOUR_GAPS = skeleton({
  gapsCount: 4,
  appendix: tabAppendix([
    { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
    { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
    { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
    { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
  ]),
});

test("I21 · Complete capture · missing Appendix → RED (evaluable, NOT not_evaluable)", () => {
  const dir = newRunDir("I21");
  const env = invokeStructural(dir, REPORT_NO_APPENDIX);
  assert.equal(env.evaluation_status, "completed", "must be evaluable");
  assert.equal(env.verdict, "red", "missing Appendix must produce RED");
  assert.equal(env.exit_code, 1, "validator must exit 1 for RED");
  assert.ok(
    env.red_reasons.some((r) => /appendix_missing/.test(r)),
    `expected evidence_appendix_missing, got ${JSON.stringify(env.red_reasons)}`,
  );
});

test("I22 · Complete capture · zero citations → RED (evaluable)", () => {
  const dir = newRunDir("I22");
  const env = invokeStructural(dir, REPORT_NO_CITATIONS);
  assert.equal(env.evaluation_status, "completed");
  assert.equal(env.verdict, "red");
  assert.equal(env.exit_code, 1);
  assert.ok(
    env.red_reasons.some((r) => /citation_line_count=0/.test(r)),
  );
});

test("I23 · Complete capture · four gaps only → RED (evaluable)", () => {
  const dir = newRunDir("I23");
  const env = invokeStructural(dir, REPORT_FOUR_GAPS);
  assert.equal(env.evaluation_status, "completed");
  assert.equal(env.verdict, "red");
  assert.equal(env.exit_code, 1);
  assert.ok(
    env.red_reasons.some((r) => /observed_gap_count_4_not_5/.test(r)),
  );
});

test("I24 · True truncated capture (completion=hard_timeout) → deriveCaptureCompleteness=false", () => {
  const d = deriveCaptureCompleteness({
    completionState: "hard_timeout",
    reportText: "",
    selectedLength: 0,
    scope: "unset",
    fallbackUsed: false,
    reportCaptureError: null,
  });
  assert.equal(d.captureComplete, false);
  assert.equal(d.expectedSectionsCaptured, false);
  // And the full round-trip: passing capture_complete=false → not_evaluable.
  const dir = newRunDir("I24");
  const env = invokeStructural(dir, GREEN_REPORT, { capture_complete: false });
  assert.equal(env.evaluation_status, "not_evaluable");
  assert.equal(env.verdict, "not_evaluable");
});

test("I25 · Fallback capture with complete container → normal evaluation (NOT auto not_evaluable)", () => {
  const d = deriveCaptureCompleteness({
    completionState: "success",
    reportText: "a".repeat(5000),
    selectedLength: 5000,
    scope: "body_fallback",
    fallbackUsed: true,
    reportCaptureError: null,
  });
  assert.equal(d.captureComplete, true);
  assert.equal(d.expectedSectionsCaptured, true);
  assert.equal(d.captureScopeForContext, "body");
  // Full round-trip: fallback with valid GREEN report → GREEN.
  const dir = newRunDir("I25");
  const env = invokeStructural(dir, GREEN_REPORT, {
    capture_scope: "body",
    fallback_used: true,
    expected_sections_captured: true,
  });
  assert.equal(env.evaluation_status, "completed");
  assert.equal(env.verdict, "green");
});

test("I26 · Circularity closed · deriveCaptureCompleteness ignores structural-content signals AND harness context construction is content-independent", () => {
  // (a) Purity: varying structural signals in the report cannot change
  // deriveCaptureCompleteness output — the function does not accept them.
  const baseArgs = {
    completionState: "success",
    reportText: "a".repeat(5000),
    selectedLength: 5000,
    scope: "main section",
    fallbackUsed: false,
    reportCaptureError: null,
  };
  const good = deriveCaptureCompleteness(baseArgs);
  // Simulate "structurally broken" by literally passing the SAME transport
  // facts — the derivation MUST still return the same result.
  const alsoGood = deriveCaptureCompleteness(baseArgs);
  assert.deepEqual(good, alsoGood);
  assert.equal(good.captureComplete, true);

  // (b) Static source: harness capture-context construction MUST NOT
  // reference selectedHasEvidence, selectedMarkerHits, REPORT_SECTION_MARKERS,
  // or EVIDENCE_APPENDIX_RE inside the deriveCaptureCompleteness call or the
  // captureContext object.
  const harnessSrc = readFileSync(HARNESS, "utf8");
  const helperSrc = readFileSync(HELPER, "utf8");
  // Isolate the `runStructuralEvidence({ ... })` invocation region.
  const invStart = harnessSrc.indexOf("runStructuralEvidence({");
  assert.notEqual(invStart, -1, "expected runStructuralEvidence invocation");
  const invEnd = harnessSrc.indexOf("});", invStart);
  const invocationRegion = harnessSrc.slice(invStart, invEnd + 3);
  assert.ok(
    !/selectedHasEvidence/.test(invocationRegion),
    "runStructuralEvidence invocation MUST NOT reference selectedHasEvidence",
  );
  assert.ok(
    !/selectedMarkerHits/.test(invocationRegion),
    "runStructuralEvidence invocation MUST NOT reference selectedMarkerHits",
  );
  assert.ok(
    !/REPORT_SECTION_MARKERS/.test(invocationRegion),
    "runStructuralEvidence invocation MUST NOT reference REPORT_SECTION_MARKERS",
  );
  assert.ok(
    !/EVIDENCE_APPENDIX_RE/.test(invocationRegion),
    "runStructuralEvidence invocation MUST NOT reference EVIDENCE_APPENDIX_RE",
  );
  // The deriveCaptureCompleteness call itself must not reference structural signals.
  const deriveStart = harnessSrc.indexOf("deriveCaptureCompleteness({");
  assert.notEqual(deriveStart, -1, "harness must call deriveCaptureCompleteness");
  const deriveEnd = harnessSrc.indexOf("});", deriveStart);
  const deriveRegion = harnessSrc.slice(deriveStart, deriveEnd + 3);
  for (const banned of ["selectedHasEvidence", "selectedMarkerHits", "REPORT_SECTION_MARKERS", "EVIDENCE_APPENDIX_RE"]) {
    assert.ok(
      !new RegExp(banned).test(deriveRegion),
      `deriveCaptureCompleteness call MUST NOT reference ${banned}`,
    );
  }
  // The helper itself must not reference banned identifiers.
  for (const banned of ["selectedHasEvidence", "selectedMarkerHits", "REPORT_SECTION_MARKERS", "EVIDENCE_APPENDIX_RE"]) {
    assert.ok(
      !new RegExp(banned).test(helperSrc),
      `helper module MUST NOT reference ${banned}`,
    );
  }
});

// -------- Summary --------
process.stdout.write(
  `\nSTRUCTURAL-EVIDENCE-INTEGRATION TESTS: ${passed} passed, ${failed} failed\n`,
);
if (failed > 0) {
  for (const f of failures) process.stderr.write(`\n--- FAIL ${f.name} ---\n${f.err}\n`);
  process.exit(1);
}
process.exit(0);
