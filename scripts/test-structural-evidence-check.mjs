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

// -------- Summary --------
process.stdout.write(`\nSTRUCTURAL-EVIDENCE-CHECK TESTS: ${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  for (const f of failures) process.stderr.write(`\n--- FAIL ${f.name} ---\n${f.err}\n`);
  process.exit(1);
}
process.exit(0);
