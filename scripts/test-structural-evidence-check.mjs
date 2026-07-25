#!/usr/bin/env node
// AgentOps-5e-followup-baseline-lint-implement · phase 1 deterministic tests.
//
// - Node stdlib only. No new dependency.
// - Generates synthetic report fixtures under
//   scripts/fixtures/structural-evidence/ at test time.
// - Invokes scripts/structural-evidence-check.mjs as a child process.
// - Uses temporary output paths under os tmpdir; no report fixture is
//   modified after generation.
// - Verifies exit code, verdict, key counts, and network/LLM/rewrite
//   invariants.

import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import process from "node:process";

const CLI = resolve("scripts/structural-evidence-check.mjs");
const FIXTURE_DIR = resolve("scripts/fixtures/structural-evidence");
const TMP_ROOT = join(tmpdir(), `structural-evidence-test-${process.pid}`);

if (!existsSync(FIXTURE_DIR)) mkdirSync(FIXTURE_DIR, { recursive: true });
if (!existsSync(TMP_ROOT)) mkdirSync(TMP_ROOT, { recursive: true });

// -------- Synthetic report builder --------
function skeleton({
  header = "# Personal Gap Report — synthetic\n\nSome introduction.\n\n## Target role\nAI Engineer, applied_ai.\n\n## What you already have — don't re-learn this\n- Python\n- SQL\n",
  gapsCount = 5,
  citationsPerGap = null, // array of arrays: [[gap1 citations], [gap2 citations], ...]
  appendix = null, // string or null
  malformedCitationInGap = null, // {gap: n, text: '...'}
  truncated = false,
  empty = false,
} = {}) {
  if (empty) return "";
  const parts = [header];
  if (gapsCount > 0) {
    parts.push("\n## Your top 5 gaps, ranked\n");
    for (let i = 1; i <= gapsCount; i++) {
      parts.push(`\n${i}. Gap topic ${i}\n`);
      parts.push(`- Skill name — 50% of applied_ai JDs\n`);
      parts.push(`- Why it's a gap for THIS user (missing from resume)\n`);
      parts.push(`- Suggested first step this week\n`);
      const cits = citationsPerGap ? citationsPerGap[i - 1] || [] : [defaultCitationForGap(i)];
      for (const c of cits) parts.push(`${c}\n`);
      if (malformedCitationInGap && malformedCitationInGap.gap === i) {
        parts.push(`${malformedCitationInGap.text}\n`);
      }
    }
  }
  parts.push("\n## Skills you might be over-prioritizing\nNothing flagged.\n");
  parts.push("\n## Your single highest-leverage next action\nReassess in 4 weeks.\n");
  if (appendix !== null) parts.push(`\n${appendix}\n`);
  if (truncated) parts.push("\n<!-- STRUCTURAL_EVIDENCE_TRUNCATED -->\n");
  return parts.join("");
}

function defaultCitationForGap(n) {
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
  const header = "## Evidence Appendix\n";
  const body = rows.map((r) => `${r.jd_id}\t${r.company}\t${r.title}`).join("\n");
  return header + body;
}

function pipeAppendix(rows) {
  const header = "## Evidence Appendix\n";
  const body = rows.map((r) => `${r.jd_id} | ${r.company} | ${r.title}`).join("\n");
  return header + body;
}

// -------- Test harness --------
let passed = 0;
let failed = 0;
const failures = [];

function invoke(reportPath, outputPath, extraArgs = []) {
  const res = spawnSync(process.execPath, [CLI, "--report", reportPath, "--output", outputPath, ...extraArgs], {
    encoding: "utf8",
  });
  let artifact = null;
  if (existsSync(outputPath)) {
    try {
      artifact = JSON.parse(readFileSync(outputPath, "utf8"));
    } catch (e) {
      artifact = { _parse_error: e.message };
    }
  }
  return { exitCode: res.status, stdout: res.stdout, stderr: res.stderr, artifact };
}

function writeContextFixture(name, obj) {
  const p = join(TMP_ROOT, `${name}.context.json`);
  writeFileSync(p, JSON.stringify(obj, null, 2), "utf8");
  return p;
}

function completeCaptureContext(overrides = {}) {
  return {
    schema_version: "0.1-phase2",
    capture_scope: "main section",
    fallback_used: false,
    completion_state: "success",
    capture_complete: true,
    report_capture_error: null,
    report_char_count: 4200,
    expected_sections_captured: true,
    source: "report-regression-local",
    ...overrides,
  };
}

function writeFixture(name, contents) {
  const p = join(FIXTURE_DIR, `${name}.md`);
  writeFileSync(p, contents, "utf8");
  return p;
}

function tmpOut(name) {
  return join(TMP_ROOT, `${name}.json`);
}

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

// -------- GREEN --------
test("G1 · 5 gaps · 5 unique jd_ids", () => {
  const report = skeleton({
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
      { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
    ]),
  });
  const rp = writeFixture("G1_five_unique", report);
  const op = tmpOut("G1");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 0, `expected exit 0, got ${r.exitCode}. stderr: ${r.stderr}`);
  assert.ok(r.artifact, "artifact missing");
  assert.equal(r.artifact.verdict, "green");
  assert.equal(r.artifact.recognized_citation_line_count, 5);
  assert.equal(r.artifact.covered_gap_count, 5);
  assert.equal(r.artifact.unique_cited_jd_count, 5);
  assert.equal(r.artifact.appendix.present, true);
  assert.equal(r.artifact.appendix.row_count, 5);
  assert.equal(r.artifact.network_used, false);
  assert.equal(r.artifact.llm_used, false);
  assert.equal(r.artifact.source_rewritten, false);
});

test("G2 · canonical Fixture A pattern · 5 lines · 4 unique jds (repeat across DIFFERENT gaps) · GREEN", () => {
  // gaps 1 and 5 both cite jd_100001 with DIFFERENT valid spans.
  const cits = [
    ['Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.'],
    ['Evidence quote: "hands-on production experience with LLM tool use" — NovaAI, jd_100002.'],
    ['Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.'],
    ['Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.'],
    ['Evidence quote: "distributed inference tuning" — ExampleCo, jd_100001.'], // reuse jd_100001
  ];
  const report = skeleton({
    citationsPerGap: cits,
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
    ]),
  });
  const rp = writeFixture("G2_canonical_5_5_4_4", report);
  const op = tmpOut("G2");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "green", `verdict=${r.artifact.verdict} red=${JSON.stringify(r.artifact.red_reasons)} amber=${JSON.stringify(r.artifact.amber_reasons)}`);
  assert.equal(r.artifact.recognized_citation_line_count, 5);
  assert.equal(r.artifact.covered_gap_count, 5);
  assert.equal(r.artifact.unique_cited_jd_count, 4);
  assert.equal(r.artifact.appendix.row_count, 4);
  // no AMBER merely due to repeated jd across gaps
  const ambers = r.artifact.amber_reasons || [];
  for (const a of ambers) {
    assert.ok(!/repeated_jd/i.test(a), `unexpected AMBER for repeated jd: ${a}`);
  }
});

test("G3 · 5 gaps · one gap with two DIFFERENT valid citations · GREEN (non-redundant extras allowed)", () => {
  const cits = [
    ['Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.', 'Evidence quote: "orchestration of tool-use agents" — NovaAI, jd_100002.'],
    ['Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.'],
    ['Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.'],
    ['Evidence quote: "distributed inference tuning" — Draft, jd_100005.'],
    ['Evidence quote: "fine-tuning open-source models" — Draft, jd_100005.'],
  ];
  const report = skeleton({
    citationsPerGap: cits,
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
      { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
    ]),
  });
  const rp = writeFixture("G3_two_citations_gap1", report);
  const op = tmpOut("G3");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "green", `verdict=${r.artifact.verdict} red=${JSON.stringify(r.artifact.red_reasons)} amber=${JSON.stringify(r.artifact.amber_reasons)}`);
  assert.equal(r.artifact.recognized_citation_line_count, 6);
});

test("G4 · deduped Appendix rows (same jd once even though cited multiple times) · GREEN", () => {
  const report = skeleton({
    citationsPerGap: [
      ['Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.'],
      ['Evidence quote: "hands-on production" — NovaAI, jd_100002.'],
      ['Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.'],
      ['Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.'],
      ['Evidence quote: "distributed inference tuning" — ExampleCo, jd_100001.'],
    ],
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
    ]),
  });
  const rp = writeFixture("G4_deduped_appendix", report);
  const op = tmpOut("G4");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "green");
  assert.equal(r.artifact.appendix.row_count, 4);
  assert.equal(r.artifact.unique_cited_jd_count, 4);
});

// -------- RED --------
test("R1 · missing Appendix · RED · exit 1", () => {
  const report = skeleton({ appendix: null });
  const rp = writeFixture("R1_missing_appendix", report);
  const op = tmpOut("R1");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /appendix_missing/.test(x)));
});

test("R2 · zero citations · RED", () => {
  const report = skeleton({
    citationsPerGap: [[], [], [], [], []],
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
    ]),
  });
  const rp = writeFixture("R2_zero_citations", report);
  const op = tmpOut("R2");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /citation_line_count=0/.test(x)));
});

test("R3 · 4 citation lines · RED", () => {
  const report = skeleton({
    citationsPerGap: [
      ['Evidence quote: "a" .. wait invalid'], // will not match; use a valid one below via override
    ],
  });
  // Simpler: 4 gaps with citations, 1 uncovered.
  const report2 = skeleton({
    citationsPerGap: [
      ['Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.'],
      ['Evidence quote: "hands-on production" — NovaAI, jd_100002.'],
      ['Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.'],
      ['Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.'],
      [],
    ],
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
    ]),
  });
  const rp = writeFixture("R3_four_citations", report2);
  const op = tmpOut("R3");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /citation_line_count=4/.test(x)));
});

test("R4 · 5 citation lines concentrated in fewer than 5 gaps · RED", () => {
  const report = skeleton({
    citationsPerGap: [
      [
        'Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.',
        'Evidence quote: "hands-on production experience with LLM tool use" — NovaAI, jd_100002.',
        'Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.',
      ],
      [
        'Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.',
        'Evidence quote: "fine-tuning open-source models" — Draft, jd_100005.',
      ],
      [],
      [],
      [],
    ],
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
      { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
    ]),
  });
  const rp = writeFixture("R4_concentrated", report);
  const op = tmpOut("R4");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /uncovered_gaps/.test(x)));
});

test("R5 · one uncovered gap · RED", () => {
  const report = skeleton({
    citationsPerGap: [
      ['Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.'],
      ['Evidence quote: "hands-on production" — NovaAI, jd_100002.'],
      [],
      ['Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.'],
      ['Evidence quote: "fine-tuning open-source models" — Draft, jd_100005.'],
    ],
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
      { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
    ]),
  });
  const rp = writeFixture("R5_uncovered_gap", report);
  const op = tmpOut("R5");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /uncovered_gaps=3/.test(x)));
});

test("R6 · body citation missing from Appendix · RED", () => {
  const report = skeleton({
    citationsPerGap: [
      ['Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.'],
      ['Evidence quote: "hands-on production" — NovaAI, jd_100002.'],
      ['Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.'],
      ['Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.'],
      ['Evidence quote: "fine-tuning open-source models" — Draft, jd_100005.'],
    ],
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
      // jd_100005 missing on purpose
    ]),
  });
  const rp = writeFixture("R6_missing_from_appendix", report);
  const op = tmpOut("R6");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /missing_from_appendix/.test(x)));
});

test("R7 · malformed citation format · RED", () => {
  const report = skeleton({
    citationsPerGap: [
      ['Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.'],
      ['Evidence quote: "hands-on production" — NovaAI, jd_100002.'],
      ['Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.'],
      ['Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.'],
      ['Evidence quote: "fine-tuning open-source models" — Draft, jd_100005.'],
    ],
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
      { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
    ]),
    malformedCitationInGap: { gap: 3, text: 'Evidence quote: "no jd id here"' },
  });
  const rp = writeFixture("R7_malformed_citation", report);
  const op = tmpOut("R7");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /malformed_required_citation_line/.test(x)));
});

test("R8 · malformed Appendix row · RED", () => {
  const report = skeleton({
    appendix: "## Evidence Appendix\njd_100001 — no tabs here — ExampleCo\njd_100002\tNovaAI\tML Solutions\njd_100003\tHelixLabs\tLLM Ops\njd_100004\tZenith\tApplied Research\njd_100005\tDraft\tFine-tuning Lead",
  });
  const rp = writeFixture("R8_malformed_appendix_row", report);
  const op = tmpOut("R8");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /malformed_appendix_rows/.test(x)));
});

test("R9 · only 4 gaps · RED", () => {
  const report = skeleton({
    gapsCount: 4,
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
    ]),
  });
  const rp = writeFixture("R9_four_gaps", report);
  const op = tmpOut("R9");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /observed_gap_count_4_not_5/.test(x)));
});

test("R10 · 6 gaps · RED", () => {
  const report = skeleton({
    gapsCount: 6,
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
      { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
    ]),
  });
  const rp = writeFixture("R10_six_gaps", report);
  const op = tmpOut("R10");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /observed_gap_count_6_not_5/.test(x)));
});

test("R11 · conflicting duplicate Appendix rows · RED", () => {
  const report = skeleton({
    appendix: "## Evidence Appendix\njd_100001\tExampleCo\tSenior AI Engineer\njd_100001\tOtherCorp\tDifferent Title\njd_100002\tNovaAI\tML Solutions\njd_100003\tHelixLabs\tLLM Ops\njd_100004\tZenith\tApplied Research\njd_100005\tDraft\tFine-tuning Lead",
  });
  const rp = writeFixture("R11_conflicting_appendix", report);
  const op = tmpOut("R11");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.verdict, "red");
  assert.ok(r.artifact.red_reasons.some((x) => /conflicting_appendix_rows/.test(x)));
});

// -------- AMBER --------
test("A1 · uncited Appendix entry · AMBER", () => {
  const report = skeleton({
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
      { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
      { jd_id: "jd_100006", company: "OrphanCo", title: "Uncited Role" },
    ]),
  });
  const rp = writeFixture("A1_uncited_appendix", report);
  const op = tmpOut("A1");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "amber");
  assert.ok(r.artifact.amber_reasons.some((x) => /appendix_entries_not_cited/.test(x)));
});

test("A2 · duplicate identical Appendix row · AMBER", () => {
  const report = skeleton({
    appendix: "## Evidence Appendix\njd_100001\tExampleCo\tSenior AI Engineer\njd_100001\tExampleCo\tSenior AI Engineer\njd_100002\tNovaAI\tML Solutions\njd_100003\tHelixLabs\tLLM Ops\njd_100004\tZenith\tApplied Research\njd_100005\tDraft\tFine-tuning Lead",
  });
  const rp = writeFixture("A2_duplicate_row", report);
  const op = tmpOut("A2");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "amber");
  assert.ok(r.artifact.amber_reasons.some((x) => /duplicate_identical_appendix_rows/.test(x)));
});

test("A3 · identical duplicate citation within same gap · AMBER (NOT cross-gap reuse)", () => {
  const report = skeleton({
    citationsPerGap: [
      ['Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.', 'Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.'],
      ['Evidence quote: "hands-on production" — NovaAI, jd_100002.'],
      ['Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.'],
      ['Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.'],
      ['Evidence quote: "fine-tuning open-source models" — Draft, jd_100005.'],
    ],
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
      { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
    ]),
  });
  const rp = writeFixture("A3_within_gap_duplicate", report);
  const op = tmpOut("A3");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "amber");
  assert.ok(r.artifact.amber_reasons.some((x) => /identical_duplicate_citation_within_gap/.test(x)));
});

test("A4 · more than 5 citations with redundant extras · AMBER", () => {
  const report = skeleton({
    citationsPerGap: [
      ['Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.', 'Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.'],
      ['Evidence quote: "hands-on production" — NovaAI, jd_100002.'],
      ['Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.'],
      ['Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.'],
      ['Evidence quote: "fine-tuning open-source models" — Draft, jd_100005.'],
    ],
    appendix: tabAppendix([
      { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
      { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
      { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
      { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
      { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
    ]),
  });
  const rp = writeFixture("A4_redundant_excess", report);
  const op = tmpOut("A4");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "amber");
  assert.ok(r.artifact.amber_reasons.some((x) => /redundant_excess_citations_total/.test(x)));
});

// -------- NOT_EVALUABLE --------
test("N1 · empty captured body · not_evaluable", () => {
  const rp = writeFixture("N1_empty", "");
  const op = tmpOut("N1");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "not_evaluable");
  assert.ok(r.artifact.not_evaluable_reasons.some((x) => /empty/.test(x)));
});

test("N2 · explicit truncation marker · not_evaluable", () => {
  const report = "# Truncated report\n\n## Your top 5 gaps, ranked\n\n1. Only one gap here...\n\n<!-- STRUCTURAL_EVIDENCE_TRUNCATED -->\n";
  const rp = writeFixture("N2_truncated", report);
  const op = tmpOut("N2");
  const r = invoke(rp, op);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "not_evaluable");
  assert.ok(r.artifact.not_evaluable_reasons.some((x) => /truncation/.test(x)));
});

// -------- TOOL ERROR --------
test("E1 · missing report path · exit 2 · nothing written", () => {
  const missing = join(TMP_ROOT, "does-not-exist.md");
  const op = tmpOut("E1");
  const r = invoke(missing, op);
  assert.equal(r.exitCode, 2);
  assert.equal(r.artifact, null, "no artifact should be written on tool_error");
});

test("E3 · invalid arguments · exit 2", () => {
  const res = spawnSync(process.execPath, [CLI, "--nope"], { encoding: "utf8" });
  assert.equal(res.status, 2);
});

test("E3b · missing required --output · exit 2", () => {
  const res = spawnSync(process.execPath, [CLI, "--report", "/tmp/foo"], { encoding: "utf8" });
  assert.equal(res.status, 2);
});

// -------- Cross-cutting invariants --------
test("INV · no fixture file modified by CLI (checked via mtime on G1)", () => {
  const rp = join(FIXTURE_DIR, "G1_five_unique.md");
  const before = statSync(rp).mtimeMs;
  invoke(rp, tmpOut("INV_G1"));
  const after = statSync(rp).mtimeMs;
  assert.equal(after, before, "fixture mtime changed — CLI must not modify input");
});

test("INV · G1 artifact does not embed full report body", () => {
  const op = tmpOut("INV_G1_body");
  const r = invoke(join(FIXTURE_DIR, "G1_five_unique.md"), op);
  const txt = JSON.stringify(r.artifact);
  assert.ok(!txt.includes("Personal Gap Report — synthetic"), "artifact must not embed full report content");
  assert.equal(r.artifact.network_used, false);
  assert.equal(r.artifact.llm_used, false);
  assert.equal(r.artifact.source_rewritten, false);
});

// -------- CONTEXT MODE (Phase 2) --------
// Baseline: a healthy GREEN report reused across context tests to prove
// context does not alter classification of otherwise-valid captures.
const GREEN_BASELINE = skeleton({
  appendix: tabAppendix([
    { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
    { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
    { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
    { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
    { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
  ]),
});
const RED_MISSING_APPENDIX = skeleton({ appendix: null });

test("CTX1 · valid complete context + GREEN report · verdict GREEN · capture_context recorded", () => {
  const rp = writeFixture("CTX1_report", GREEN_BASELINE);
  const cp = writeContextFixture("CTX1", completeCaptureContext());
  const op = tmpOut("CTX1");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "green");
  assert.ok(r.artifact.capture_context, "capture_context missing on success");
  assert.equal(r.artifact.capture_context.schema_version, "0.1-phase2");
  assert.equal(r.artifact.capture_context.capture_scope, "main section");
  assert.equal(r.artifact.capture_context.capture_complete, true);
});

test("CTX2 · capture_complete=false · not_evaluable (never RED)", () => {
  const rp = writeFixture("CTX2_report", RED_MISSING_APPENDIX);
  const cp = writeContextFixture(
    "CTX2",
    completeCaptureContext({ capture_complete: false }),
  );
  const op = tmpOut("CTX2");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "not_evaluable");
  assert.ok(
    r.artifact.not_evaluable_reasons.some((x) => /capture_incomplete/.test(x)),
  );
});

test("CTX3 · completion_state=application_error · not_evaluable", () => {
  const rp = writeFixture("CTX3_report", GREEN_BASELINE);
  const cp = writeContextFixture(
    "CTX3",
    completeCaptureContext({ completion_state: "application_error" }),
  );
  const op = tmpOut("CTX3");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "not_evaluable");
  assert.ok(
    r.artifact.not_evaluable_reasons.some((x) => /application_error/.test(x)),
  );
});

test("CTX4 · report_capture_error non-null · not_evaluable", () => {
  const rp = writeFixture("CTX4_report", GREEN_BASELINE);
  const cp = writeContextFixture(
    "CTX4",
    completeCaptureContext({ report_capture_error: "timeout_extract" }),
  );
  const op = tmpOut("CTX4");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "not_evaluable");
  assert.ok(
    r.artifact.not_evaluable_reasons.some((x) =>
      /report_capture_error/.test(x),
    ),
  );
});

test("CTX5 · unknown capture_scope · not_evaluable (NOT silently evaluable)", () => {
  const rp = writeFixture("CTX5_report", GREEN_BASELINE);
  const cp = writeContextFixture(
    "CTX5",
    completeCaptureContext({ capture_scope: "sidebar" }),
  );
  const op = tmpOut("CTX5");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "not_evaluable");
  assert.ok(
    r.artifact.not_evaluable_reasons.some((x) =>
      /unknown_capture_scope/.test(x),
    ),
  );
});

test("CTX6 · fallback_used=true AND expected_sections_captured=false · not_evaluable", () => {
  const rp = writeFixture("CTX6_report", GREEN_BASELINE);
  const cp = writeContextFixture(
    "CTX6",
    completeCaptureContext({
      capture_scope: "body",
      fallback_used: true,
      expected_sections_captured: false,
    }),
  );
  const op = tmpOut("CTX6");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "not_evaluable");
  assert.ok(
    r.artifact.not_evaluable_reasons.some((x) =>
      /fallback_capture_incomplete/.test(x),
    ),
  );
});

test("CTX7 · fallback_used=true AND expected_sections_captured=true · normal evaluation (GREEN)", () => {
  const rp = writeFixture("CTX7_report", GREEN_BASELINE);
  const cp = writeContextFixture(
    "CTX7",
    completeCaptureContext({
      capture_scope: "body",
      fallback_used: true,
      expected_sections_captured: true,
    }),
  );
  const op = tmpOut("CTX7");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "green");
});

test("CTX8 · unknown schema_version · tool_error exit 2 · no artifact", () => {
  const rp = writeFixture("CTX8_report", GREEN_BASELINE);
  const cp = writeContextFixture(
    "CTX8",
    completeCaptureContext({ schema_version: "0.2-future" }),
  );
  const op = tmpOut("CTX8");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 2);
  assert.equal(r.artifact, null);
  assert.ok(/context_schema_unknown/.test(r.stderr));
});

test("CTX9 · missing required field · tool_error exit 2", () => {
  const rp = writeFixture("CTX9_report", GREEN_BASELINE);
  const badCtx = completeCaptureContext();
  delete badCtx.expected_sections_captured;
  const cp = writeContextFixture("CTX9", badCtx);
  const op = tmpOut("CTX9");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 2);
  assert.equal(r.artifact, null);
  assert.ok(/context_missing_field/.test(r.stderr));
});

test("CTX10 · invalid field type · tool_error exit 2", () => {
  const rp = writeFixture("CTX10_report", GREEN_BASELINE);
  const cp = writeContextFixture(
    "CTX10",
    completeCaptureContext({ fallback_used: "yes" }),
  );
  const op = tmpOut("CTX10");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 2);
  assert.equal(r.artifact, null);
  assert.ok(/context_invalid_field_type/.test(r.stderr));
});

test("CTX11 · explicit context suppresses synthetic truncation marker", () => {
  const withMarker =
    GREEN_BASELINE + "\n<!-- STRUCTURAL_EVIDENCE_TRUNCATED -->\n";
  const rp = writeFixture("CTX11_marker_but_context_complete", withMarker);
  const cp = writeContextFixture("CTX11", completeCaptureContext());
  const op = tmpOut("CTX11");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 0);
  assert.equal(
    r.artifact.verdict,
    "green",
    "explicit context must override synthetic marker",
  );
});

test("CTX12 · standalone mode (no --context) remains backward-compatible", () => {
  const rp = writeFixture("CTX12_standalone", GREEN_BASELINE);
  const op = tmpOut("CTX12");
  const r = invoke(rp, op); // no --context
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.verdict, "green");
  assert.equal(r.artifact.capture_context, null);
});

test("CTX13 · malformed context JSON · tool_error exit 2", () => {
  const rp = writeFixture("CTX13_report", GREEN_BASELINE);
  const cp = join(TMP_ROOT, "CTX13.context.json");
  writeFileSync(cp, "{not json", "utf8");
  const op = tmpOut("CTX13");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 2);
  assert.equal(r.artifact, null);
  assert.ok(/context_invalid_json/.test(r.stderr));
});

test("CTX14 · missing --context file · tool_error exit 2", () => {
  const rp = writeFixture("CTX14_report", GREEN_BASELINE);
  const cp = join(TMP_ROOT, "CTX14_absent.context.json");
  const op = tmpOut("CTX14");
  const r = invoke(rp, op, ["--context", cp]);
  assert.equal(r.exitCode, 2);
  assert.equal(r.artifact, null);
  assert.ok(/context_unreadable/.test(r.stderr));
});

// ==========================================================================
// AgentOps-5e-followup-phase3-structural-rendered-text-contract-implement
// Rendered-text contract tests (RTC).
//
// Motivation: harness captures browser innerText via
// page.locator(...).innerText(). ReactMarkdown renders `## X` as `<h2>X</h2>`,
// so innerText contains `X` with no leading `##`. The current checker
// required literal `##`, so it never matched rendered-text captures.
// These tests add both accept- and reject-cases for the rendered-text
// grammar, plus reinforce that Markdown-source grammar keeps working.
// Grammar is deterministic, complete-line, exact-phrase, approved
// suffixes only. No fuzzy / edit-distance / substring / LLM matching.
// ==========================================================================

function renderedGapHeading(suffix = "") {
  return `Your top 5 gaps${suffix}`;
}

// Builds a rendered-text report (no `## ` prefixes anywhere) using the
// same section names, gap numbering, citation shape, and appendix
// structure the harness observes on real captures.
function renderedReport({
  gapHeadingLine = "Your top 5 gaps, ranked",
  appendixHeadingLine = "Evidence Appendix",
  appendixRows = null, // array of {jd_id, company, title} OR raw string OR null (omit)
  appendixSeparator = "tab", // "tab" | "pipe" | "pipe-outer" | "multispace"
  citations = null, // 5-item array; default matches jd_100001..jd_100005 rows
} = {}) {
  const cits =
    citations || [
      'Evidence quote: "agentic RAG at scale" — ExampleCo, jd_100001.',
      'Evidence quote: "hands-on production experience with LLM tool use" — NovaAI, jd_100002.',
      'Evidence quote: "shipping evaluation harnesses" — HelixLabs, jd_100003.',
      'Evidence quote: "prompt engineering for retrieval" — Zenith, jd_100004.',
      'Evidence quote: "fine-tuning open-source models" — Draft, jd_100005.',
    ];
  const defaultRows = [
    { jd_id: "jd_100001", company: "ExampleCo", title: "Senior AI Engineer" },
    { jd_id: "jd_100002", company: "NovaAI", title: "ML Solutions" },
    { jd_id: "jd_100003", company: "HelixLabs", title: "LLM Ops" },
    { jd_id: "jd_100004", company: "Zenith", title: "Applied Research" },
    { jd_id: "jd_100005", company: "Draft", title: "Fine-tuning Lead" },
  ];
  const rows = appendixRows === null ? defaultRows : appendixRows;
  let appendixBlock = "";
  if (rows === undefined) {
    appendixBlock = "";
  } else if (typeof rows === "string") {
    appendixBlock = `\n${appendixHeadingLine}\n${rows}\n`;
  } else if (Array.isArray(rows)) {
    const body = rows
      .map((r) => {
        if (appendixSeparator === "tab") return `${r.jd_id}\t${r.company}\t${r.title}`;
        if (appendixSeparator === "pipe") return `${r.jd_id} | ${r.company} | ${r.title}`;
        if (appendixSeparator === "pipe-outer") return `| ${r.jd_id} | ${r.company} | ${r.title} |`;
        if (appendixSeparator === "multispace") return `${r.jd_id}  ${r.company}  ${r.title}`;
        throw new Error(`unknown separator ${appendixSeparator}`);
      })
      .join("\n");
    appendixBlock = `\n${appendixHeadingLine}\n${body}\n`;
  }
  return (
    "Personal Gap Report — synthetic\n\n" +
    "Some introduction.\n\n" +
    "Target role\n" +
    "AI Engineer, applied_ai.\n\n" +
    "What you already have — don't re-learn this\n" +
    "- Python\n" +
    "- SQL\n\n" +
    `${gapHeadingLine}\n\n` +
    cits
      .map(
        (c, i) =>
          `${i + 1}. Gap topic ${i + 1}\n` +
          `- Skill name — 50% of applied_ai JDs\n` +
          `- Why it's a gap for THIS user (missing from resume)\n` +
          `- Suggested first step this week\n` +
          `${c}\n`,
      )
      .join("\n") +
    "\nSkills you might be over-prioritizing\nNothing flagged.\n\n" +
    "Your single highest-leverage next action\nReassess in 4 weeks.\n" +
    appendixBlock
  );
}

// -------- RTC · gap heading (rendered form) --------

test("RTC01 · rendered exact gap heading accepted", () => {
  const rp = writeFixture("RTC01", renderedReport({ gapHeadingLine: "Your top 5 gaps" }));
  const r = invoke(rp, tmpOut("RTC01"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.ok(r.artifact);
  assert.equal(r.artifact.verdict, "green");
  assert.equal(r.artifact.observed_gap_count, 5);
  assert.equal(r.artifact.recognized_citation_line_count, 5);
});

test("RTC02 · rendered heading with approved suffix ', ranked' accepted", () => {
  const rp = writeFixture("RTC02", renderedReport({ gapHeadingLine: "Your top 5 gaps, ranked" }));
  const r = invoke(rp, tmpOut("RTC02"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.verdict, "green");
});

test("RTC03 · rendered heading with full approved suffix accepted", () => {
  const rp = writeFixture(
    "RTC03",
    renderedReport({ gapHeadingLine: "Your top 5 gaps, ranked (5 numbered items)" }),
  );
  const r = invoke(rp, tmpOut("RTC03"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.verdict, "green");
});

// -------- RTC · gap heading (Markdown-source form still works) --------

test("RTC04 · markdown-source exact gap heading still accepted", () => {
  // Same content but keep `## ` on the gap heading; rest still rendered-ish.
  const body = renderedReport({ gapHeadingLine: "## Your top 5 gaps" });
  const rp = writeFixture("RTC04", body);
  const r = invoke(rp, tmpOut("RTC04"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.verdict, "green");
});

test("RTC05 · markdown-source heading with approved suffix still accepted", () => {
  const body = renderedReport({ gapHeadingLine: "## Your top 5 gaps, ranked (5 numbered items)" });
  const rp = writeFixture("RTC05", body);
  const r = invoke(rp, tmpOut("RTC05"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.verdict, "green");
});

// -------- RTC · gap heading rejection --------

test("RTC06 · wrong semantic heading rejected", () => {
  const rp = writeFixture("RTC06", renderedReport({ gapHeadingLine: "Your biggest weaknesses" }));
  const r = invoke(rp, tmpOut("RTC06"));
  assert.equal(r.exitCode, 1);
  assert.ok(r.artifact.red_reasons.includes("gap_section_missing_or_unrecognized"));
});

test("RTC07 · partial phrase 'Top 5 gaps' rejected", () => {
  const rp = writeFixture("RTC07", renderedReport({ gapHeadingLine: "Top 5 gaps" }));
  const r = invoke(rp, tmpOut("RTC07"));
  assert.equal(r.exitCode, 1);
  assert.ok(r.artifact.red_reasons.includes("gap_section_missing_or_unrecognized"));
});

test("RTC08 · prose sentence containing phrase rejected", () => {
  const rp = writeFixture(
    "RTC08",
    renderedReport({ gapHeadingLine: "Below are Your top 5 gaps" }),
  );
  const r = invoke(rp, tmpOut("RTC08"));
  assert.equal(r.exitCode, 1);
  assert.ok(r.artifact.red_reasons.includes("gap_section_missing_or_unrecognized"));
});

test("RTC09 · trailing prose 'are listed below' rejected", () => {
  const rp = writeFixture(
    "RTC09",
    renderedReport({ gapHeadingLine: "Your top 5 gaps are listed below" }),
  );
  const r = invoke(rp, tmpOut("RTC09"));
  assert.equal(r.exitCode, 1);
  assert.ok(r.artifact.red_reasons.includes("gap_section_missing_or_unrecognized"));
});

test("RTC10 · unsupported suffix 'for this year' rejected", () => {
  const rp = writeFixture(
    "RTC10",
    renderedReport({ gapHeadingLine: "Your top 5 gaps for this year" }),
  );
  const r = invoke(rp, tmpOut("RTC10"));
  assert.equal(r.exitCode, 1);
  assert.ok(r.artifact.red_reasons.includes("gap_section_missing_or_unrecognized"));
});

test("RTC11 · phrase embedded in paragraph rejected", () => {
  const rp = writeFixture(
    "RTC11",
    renderedReport({
      gapHeadingLine: "Based on the analysis, Your top 5 gaps, ranked, are shown below",
    }),
  );
  const r = invoke(rp, tmpOut("RTC11"));
  assert.equal(r.exitCode, 1);
  assert.ok(r.artifact.red_reasons.includes("gap_section_missing_or_unrecognized"));
});

test("RTC12 · non-H2 markdown level '# Your top 5 gaps' rejected", () => {
  // Policy: accept only exact `## ` Markdown prefix (or no prefix); reject
  // other heading levels to keep the grammar narrow.
  const rp = writeFixture(
    "RTC12",
    renderedReport({ gapHeadingLine: "# Your top 5 gaps" }),
  );
  const r = invoke(rp, tmpOut("RTC12"));
  assert.equal(r.exitCode, 1);
  assert.ok(r.artifact.red_reasons.includes("gap_section_missing_or_unrecognized"));
});

test("RTC13 · non-H2 markdown level '### Your top 5 gaps' rejected", () => {
  const rp = writeFixture(
    "RTC13",
    renderedReport({ gapHeadingLine: "### Your top 5 gaps" }),
  );
  const r = invoke(rp, tmpOut("RTC13"));
  assert.equal(r.exitCode, 1);
});

test("RTC14 · leading/trailing whitespace tolerated on rendered heading line", () => {
  // Deterministic policy: trim leading/trailing whitespace on the line
  // before matching (mirrors how innerText may include incidental spaces).
  const rp = writeFixture(
    "RTC14",
    renderedReport({ gapHeadingLine: "   Your top 5 gaps, ranked   " }),
  );
  const r = invoke(rp, tmpOut("RTC14"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.verdict, "green");
});

// -------- RTC · appendix heading --------

test("RTC15 · rendered 'Evidence Appendix' heading accepted", () => {
  const rp = writeFixture(
    "RTC15",
    renderedReport({ appendixHeadingLine: "Evidence Appendix" }),
  );
  const r = invoke(rp, tmpOut("RTC15"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.appendix.present, true);
  assert.equal(r.artifact.appendix.row_count, 5);
});

test("RTC16 · markdown-source '## Evidence Appendix' still accepted", () => {
  const rp = writeFixture(
    "RTC16",
    renderedReport({ appendixHeadingLine: "## Evidence Appendix" }),
  );
  const r = invoke(rp, tmpOut("RTC16"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.appendix.present, true);
});

test("RTC17 · prose mention 'See the Evidence Appendix below.' rejected", () => {
  // Prose mention must not activate appendix detection. Build a report
  // that has NO appendix heading line and only contains the phrase
  // mid-sentence. Assert appendix.present=false and RED via
  // evidence_appendix_missing.
  const body =
    "Personal Gap Report — synthetic\n\n" +
    "Target role\nAI Engineer.\n\n" +
    "What you already have — don't re-learn this\n- Python\n\n" +
    "Your top 5 gaps, ranked\n" +
    [1, 2, 3, 4, 5]
      .map(
        (i) =>
          `\n${i}. Gap topic ${i}\n- Skill — 50%\nEvidence quote: "content ${i}" — Co${i}, jd_10000${i}.\n`,
      )
      .join("") +
    "\nSkills you might be over-prioritizing\nNothing flagged.\n\n" +
    "Your single highest-leverage next action\n" +
    "Reassess in 4 weeks. See the Evidence Appendix below for context.\n";
  const rp = writeFixture("RTC17", body);
  const r = invoke(rp, tmpOut("RTC17"));
  assert.equal(r.exitCode, 1, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.appendix.present, false);
  assert.ok(r.artifact.red_reasons.includes("evidence_appendix_missing"));
});

test("RTC18 · unrelated 'Supporting Evidence Appendix' rejected", () => {
  const rp = writeFixture(
    "RTC18",
    renderedReport({ appendixHeadingLine: "Supporting Evidence Appendix" }),
  );
  const r = invoke(rp, tmpOut("RTC18"));
  assert.equal(r.exitCode, 1);
  assert.ok(r.artifact.red_reasons.includes("evidence_appendix_missing"));
});

test("RTC19 · extra suffix 'Evidence Appendix Notes' rejected", () => {
  const rp = writeFixture(
    "RTC19",
    renderedReport({ appendixHeadingLine: "Evidence Appendix Notes" }),
  );
  const r = invoke(rp, tmpOut("RTC19"));
  assert.equal(r.exitCode, 1);
  assert.ok(r.artifact.red_reasons.includes("evidence_appendix_missing"));
});

// -------- RTC · appendix rows --------

test("RTC20 · tab-separated rows still accepted", () => {
  const rp = writeFixture("RTC20", renderedReport({ appendixSeparator: "tab" }));
  const r = invoke(rp, tmpOut("RTC20"));
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.appendix.row_count, 5);
});

test("RTC21 · multi-space (2+ spaces) rows accepted", () => {
  const rp = writeFixture("RTC21", renderedReport({ appendixSeparator: "multispace" }));
  const r = invoke(rp, tmpOut("RTC21"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.appendix.row_count, 5);
});

test("RTC22 · pipe-separated rows (outer delimiters) accepted", () => {
  const rp = writeFixture("RTC22", renderedReport({ appendixSeparator: "pipe-outer" }));
  const r = invoke(rp, tmpOut("RTC22"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.appendix.row_count, 5);
});

test("RTC23 · pipe-separated rows (no outer delimiters) accepted", () => {
  const rp = writeFixture("RTC23", renderedReport({ appendixSeparator: "pipe" }));
  const r = invoke(rp, tmpOut("RTC23"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.appendix.row_count, 5);
});

test("RTC24 · two-column row rejected as malformed", () => {
  const raw =
    "jd_100001\tExampleCo\n" +
    "jd_100002\tNovaAI\n" +
    "jd_100003\tHelixLabs\n" +
    "jd_100004\tZenith\n" +
    "jd_100005\tDraft\n";
  const rp = writeFixture("RTC24", renderedReport({ appendixRows: raw }));
  const r = invoke(rp, tmpOut("RTC24"));
  // No canonical rows → checker treats as malformed jd-like lines and
  // appendix as empty (or malformed). Verdict is RED via appendix defect.
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.appendix.present, true);
  const isBad =
    r.artifact.appendix.row_count === 0 ||
    (r.artifact.appendix.malformed_rows && r.artifact.appendix.malformed_rows.length > 0);
  assert.ok(isBad, `expected malformed/empty rows; got ${JSON.stringify(r.artifact.appendix)}`);
});

test("RTC25 · four-column row rejected", () => {
  const raw =
    "jd_100001\tExampleCo\tSenior AI Engineer\tExtraField\n" +
    "jd_100002\tNovaAI\tML Solutions\tExtraField\n";
  const rp = writeFixture("RTC25", renderedReport({ appendixRows: raw }));
  const r = invoke(rp, tmpOut("RTC25"));
  assert.equal(r.exitCode, 1);
  const isBad =
    r.artifact.appendix.row_count === 0 ||
    (r.artifact.appendix.malformed_rows && r.artifact.appendix.malformed_rows.length > 0);
  assert.ok(isBad);
});

test("RTC26 · invalid jd_id rejected", () => {
  const raw =
    "jd_1\tExampleCo\tSenior AI Engineer\n" + // too few digits
    "notjd_100002\tNovaAI\tML Solutions\n";
  const rp = writeFixture("RTC26", renderedReport({ appendixRows: raw }));
  const r = invoke(rp, tmpOut("RTC26"));
  assert.equal(r.exitCode, 1);
  // No valid rows parsed
  assert.equal(r.artifact.appendix.row_count, 0);
});

test("RTC27 · empty company field rejected", () => {
  const raw =
    "jd_100001\t\tSenior AI Engineer\n" +
    "jd_100002\t\tML Solutions\n";
  const rp = writeFixture("RTC27", renderedReport({ appendixRows: raw }));
  const r = invoke(rp, tmpOut("RTC27"));
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.appendix.row_count, 0);
});

test("RTC28 · empty title field rejected", () => {
  const raw =
    "jd_100001\tExampleCo\t\n" +
    "jd_100002\tNovaAI\t\n";
  const rp = writeFixture("RTC28", renderedReport({ appendixRows: raw }));
  const r = invoke(rp, tmpOut("RTC28"));
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.appendix.row_count, 0);
});

test("RTC29 · prose with incidental multiple spaces NOT counted as row", () => {
  // A paragraph after the appendix heading with double-spaces must not be
  // mis-parsed as a row. Adding 5 valid tab-separated rows so overall
  // report is GREEN; the prose is decorative.
  const raw =
    "This  is  a  short  prose  paragraph.\n" +
    "jd_100001\tExampleCo\tSenior AI Engineer\n" +
    "jd_100002\tNovaAI\tML Solutions\n" +
    "jd_100003\tHelixLabs\tLLM Ops\n" +
    "jd_100004\tZenith\tApplied Research\n" +
    "jd_100005\tDraft\tFine-tuning Lead\n";
  const rp = writeFixture("RTC29", renderedReport({ appendixRows: raw }));
  const r = invoke(rp, tmpOut("RTC29"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.appendix.row_count, 5);
});

test("RTC30 · GFM separator row |---|---|---| rejected", () => {
  const raw =
    "| jd_id | company | title |\n" +
    "|---|---|---|\n" +
    "| jd_100001 | ExampleCo | Senior AI Engineer |\n" +
    "| jd_100002 | NovaAI | ML Solutions |\n" +
    "| jd_100003 | HelixLabs | LLM Ops |\n" +
    "| jd_100004 | Zenith | Applied Research |\n" +
    "| jd_100005 | Draft | Fine-tuning Lead |\n";
  const rp = writeFixture("RTC30", renderedReport({ appendixRows: raw }));
  const r = invoke(rp, tmpOut("RTC30"));
  assert.equal(r.exitCode, 0, `stderr: ${r.stderr}`);
  assert.equal(r.artifact.appendix.row_count, 5);
  // Separator row must NOT appear as a data row.
  assert.equal(
    r.artifact.appendix.jd_ids.includes("---"),
    false,
    "separator row leaked into jd_ids",
  );
});

test("RTC31 · pipe row where company contains extra pipe rejected as malformed", () => {
  // `| jd_100001 | Anthropic|Cohere | AI Engineer |` splits to 4 fields
  // after pipe removal → rejected. Provide otherwise-valid data.
  const raw =
    "| jd_100001 | Anthropic|Cohere | AI Engineer |\n" +
    "| jd_100002 | NovaAI | ML Solutions |\n" +
    "| jd_100003 | HelixLabs | LLM Ops |\n" +
    "| jd_100004 | Zenith | Applied Research |\n" +
    "| jd_100005 | Draft | Fine-tuning Lead |\n";
  const rp = writeFixture("RTC31", renderedReport({ appendixRows: raw }));
  const r = invoke(rp, tmpOut("RTC31"));
  // Ambiguous row must not silently expand — either rejected as malformed
  // or not counted. Remaining 4 rows still valid so verdict may be RED
  // (row count 4 < 5 expected) but the key assertion is that the bad row
  // does NOT appear as a valid entry.
  assert.ok(
    !r.artifact.appendix.jd_ids.includes("Anthropic") &&
      !r.artifact.appendix.jd_ids.includes("Cohere"),
    "extra pipe field leaked into jd_ids",
  );
});

// -------- RTC · citation scoping --------

test("RTC32 · 5 citations inside rendered gap section counted", () => {
  const rp = writeFixture("RTC32", renderedReport({ gapHeadingLine: "Your top 5 gaps, ranked" }));
  const r = invoke(rp, tmpOut("RTC32"));
  assert.equal(r.exitCode, 0);
  assert.equal(r.artifact.recognized_citation_line_count, 5);
});

test("RTC33 · citations outside gap section not counted toward recognized_citation_line_count", () => {
  // Build a report where the gap section has no citations but the
  // appendix area contains lines that look like Evidence quote:. Confirm
  // citations in gap section = 0 → RED via citation threshold.
  const noCitationsInGaps = ["", "", "", "", ""];
  const body =
    renderedReport({
      gapHeadingLine: "Your top 5 gaps, ranked",
      citations: noCitationsInGaps,
    }) +
    '\nEvidence quote: "outside gap" — ExampleCo, jd_100001.\n' +
    'Evidence quote: "outside gap 2" — NovaAI, jd_100002.\n' +
    'Evidence quote: "outside gap 3" — HelixLabs, jd_100003.\n' +
    'Evidence quote: "outside gap 4" — Zenith, jd_100004.\n' +
    'Evidence quote: "outside gap 5" — Draft, jd_100005.\n';
  const rp = writeFixture("RTC33", body);
  const r = invoke(rp, tmpOut("RTC33"));
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.recognized_citation_line_count, 0);
  assert.ok(r.artifact.red_reasons.some((x) => x.startsWith("citation_line_count=")));
});

test("RTC34 · fewer than 5 citations remains RED", () => {
  // Note: EVIDENCE_QUOTE_REGEX requires the inner quoted content to be
  // at least 5 characters; use full-length quote strings so all three
  // citations are recognized (short strings like "one" would fail the
  // regex and give a misleading count, not a broadening bug).
  const only3 = [
    'Evidence quote: "agentic retrieval work" — ExampleCo, jd_100001.',
    'Evidence quote: "hands-on tool use" — NovaAI, jd_100002.',
    'Evidence quote: "shipping evals" — HelixLabs, jd_100003.',
    "",
    "",
  ];
  const rp = writeFixture(
    "RTC34",
    renderedReport({ gapHeadingLine: "Your top 5 gaps, ranked", citations: only3 }),
  );
  const r = invoke(rp, tmpOut("RTC34"));
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.recognized_citation_line_count, 3);
});

test("RTC35 · invalid citation syntax remains uncounted", () => {
  // Malformed shape — missing quotes and jd_ID structure. Should not count.
  const badCitations = [
    "Evidence: agentic RAG at scale — ExampleCo, jd_100001.",
    "Evidence: hands on — NovaAI, jd_100002.",
    "Evidence: shipping harnesses — HelixLabs, jd_100003.",
    "Evidence: prompt engineering — Zenith, jd_100004.",
    "Evidence: fine-tuning — Draft, jd_100005.",
  ];
  const rp = writeFixture(
    "RTC35",
    renderedReport({ gapHeadingLine: "Your top 5 gaps, ranked", citations: badCitations }),
  );
  const r = invoke(rp, tmpOut("RTC35"));
  assert.equal(r.exitCode, 1);
  assert.equal(r.artifact.recognized_citation_line_count, 0);
});

// -------- RTC · non-broadening / determinism guards --------

test("RTC36 · gap section without body citations still RED even if appendix is valid", () => {
  const rp = writeFixture(
    "RTC36",
    renderedReport({
      gapHeadingLine: "Your top 5 gaps, ranked",
      citations: ["", "", "", "", ""],
    }),
  );
  const r = invoke(rp, tmpOut("RTC36"));
  assert.equal(r.exitCode, 1);
});

test("RTC37 · citation regex byte-identical (structural checker source unchanged)", () => {
  // Guard: exact literal must not drift. Reads the source line directly.
  const src = readFileSync(resolve("scripts/structural-evidence-check.mjs"), "utf8");
  // The literal appears near the top of the file. Assert exact substring.
  const expected =
    'const EVIDENCE_QUOTE_REGEX =\n' +
    '  /Evidence quote:\\s*["“]([^"”\\n]{5,})["”]\\s*[—–\\-]\\s*([^,\\n]{1,120}?),\\s*(jd_\\d{4,})/g;';
  assert.ok(
    src.includes(expected),
    "EVIDENCE_QUOTE_REGEX literal changed — citation regex must remain byte-identical",
  );
});

test("RTC38 · thresholds byte-identical (5 gaps, 5 citations)", () => {
  const src = readFileSync(resolve("scripts/structural-evidence-check.mjs"), "utf8");
  assert.ok(
    src.includes("const REQUIRED_GAP_COUNT = 5;"),
    "REQUIRED_GAP_COUNT constant changed or removed",
  );
  assert.ok(
    src.includes("const MIN_CITATION_LINE_COUNT = 5;"),
    "MIN_CITATION_LINE_COUNT constant changed or removed",
  );
});

test("RTC39 · structural blocking_mode remains telemetry_only", () => {
  const rp = writeFixture("RTC39", renderedReport({ gapHeadingLine: "Your top 5 gaps, ranked" }));
  const r = invoke(rp, tmpOut("RTC39"));
  assert.equal(r.artifact.blocking_mode, "telemetry_only");
});

test("RTC40 · network_used and llm_used remain false on rendered reports", () => {
  const rp = writeFixture("RTC40", renderedReport({ gapHeadingLine: "Your top 5 gaps, ranked" }));
  const r = invoke(rp, tmpOut("RTC40"));
  assert.equal(r.artifact.network_used, false);
  assert.equal(r.artifact.llm_used, false);
  assert.equal(r.artifact.source_rewritten, false);
});

// -------- Summary --------
process.stdout.write(`\nSTRUCTURAL-EVIDENCE-CHECK TESTS: ${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  for (const f of failures) process.stderr.write(`\n--- FAIL ${f.name} ---\n${f.err}\n`);
  process.exit(1);
}
process.exit(0);
