#!/usr/bin/env node
// AgentOps-5e-followup-phase3-classify-json-hardening-implement.
// Deterministic tests for `src/lib/classify-schema.mjs`.
//
// - Node stdlib only. No new dependency (imports Zod via the schema).
// - Zero network. Zero real provider calls.
// - Verifies validation-only policy: no trim / no lowercase / no dedup /
//   no defaults / no coercion / no enum normalization / no repair / no
//   semantic rewriting. Duplicate refinement rejects exact duplicates
//   without silently removing them. Whitespace-only reasoning is
//   rejected without silent trim.

import assert from "node:assert/strict";
import process from "node:process";
import {
  classificationSchema,
  ARCHETYPE_VALUES,
  SENIORITY_VALUES,
  COMPANY_PREFERENCES_MAX_ITEMS,
  COMPANY_PREFERENCE_ITEM_MAX_CHARS,
  REASONING_MAX_CHARS,
} from "../src/lib/classify-schema.mjs";

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

function validClassification(overrides = {}) {
  return {
    archetype: "applied_ai",
    company_preferences: ["Anthropic", "Cohere"],
    level_hint: "senior",
    reasoning: "User wants applied AI at frontier labs, shipping RAG + evals.",
    ...overrides,
  };
}

// -------- T1 valid object --------
test("T1 · valid complete Classification accepted", () => {
  const r = classificationSchema.safeParse(validClassification());
  assert.equal(r.success, true, `errors: ${JSON.stringify(r.error?.issues)}`);
  assert.deepEqual(
    Object.keys(r.data).sort(),
    ["archetype", "company_preferences", "level_hint", "reasoning"].sort(),
  );
});

// -------- T2 invalid archetype --------
test("T2 · invalid archetype (not in enum) rejected", () => {
  const r = classificationSchema.safeParse(
    validClassification({ archetype: "not_a_real_archetype" }),
  );
  assert.equal(r.success, false);
  const paths = r.error.issues.map((i) => i.path.join("."));
  assert.ok(paths.includes("archetype"), `paths: ${paths.join(",")}`);
});

// -------- T3 wrong company_preferences type --------
test("T3 · company_preferences: non-array type rejected", () => {
  const r = classificationSchema.safeParse(
    validClassification({ company_preferences: "Anthropic" }),
  );
  assert.equal(r.success, false);
});

// -------- T4 too many preferences --------
test("T4 · company_preferences: >10 items rejected", () => {
  const prefs = Array.from(
    { length: COMPANY_PREFERENCES_MAX_ITEMS + 1 },
    (_, i) => `Company${i}`,
  );
  const r = classificationSchema.safeParse(
    validClassification({ company_preferences: prefs }),
  );
  assert.equal(r.success, false);
});

// -------- T5 overlong preference --------
test("T5 · company_preferences: item > per-item max chars rejected", () => {
  const oversized = "A".repeat(COMPANY_PREFERENCE_ITEM_MAX_CHARS + 1);
  const r = classificationSchema.safeParse(
    validClassification({ company_preferences: [oversized] }),
  );
  assert.equal(r.success, false);
});

// -------- T6 exact duplicate REJECTED (deterministic refinement) --------
test("T6 · exact-duplicate company_preferences REJECTED via refinement", () => {
  const r = classificationSchema.safeParse(
    validClassification({ company_preferences: ["Anthropic", "Anthropic"] }),
  );
  assert.equal(r.success, false);
  const paths = r.error.issues.map((i) => i.path.join("."));
  assert.ok(
    paths.some((p) => p.startsWith("company_preferences")),
    `paths: ${paths.join(",")}`,
  );
});

// -------- T7 case-different values ACCEPTED (remain distinct) --------
test("T7 · case-different company_preferences ACCEPTED as distinct", () => {
  const r = classificationSchema.safeParse(
    validClassification({ company_preferences: ["anthropic", "Anthropic"] }),
  );
  assert.equal(r.success, true, `errors: ${JSON.stringify(r.error?.issues)}`);
  // Confirm both values are preserved AS-IS (no lowercase, no dedup).
  assert.deepEqual(r.data.company_preferences, ["anthropic", "Anthropic"]);
});

// -------- T8 invalid level_hint --------
test("T8 · invalid level_hint (not in enum) rejected", () => {
  const r = classificationSchema.safeParse(
    validClassification({ level_hint: "vp_of_vibes" }),
  );
  assert.equal(r.success, false);
});

// -------- T9 whitespace-only reasoning REJECTED (refinement, no trim) --------
test("T9 · whitespace-only reasoning REJECTED via refinement", () => {
  const r = classificationSchema.safeParse(
    validClassification({ reasoning: "   \t\n  " }),
  );
  assert.equal(r.success, false);
  const paths = r.error.issues.map((i) => i.path.join("."));
  assert.ok(paths.includes("reasoning"), `paths: ${paths.join(",")}`);
});

// -------- T10 overlong reasoning --------
test("T10 · overlong reasoning (> max chars) rejected", () => {
  const overlong = "x".repeat(REASONING_MAX_CHARS + 1);
  const r = classificationSchema.safeParse(
    validClassification({ reasoning: overlong }),
  );
  assert.equal(r.success, false);
});

// -------- T11 unknown key REJECTED (strict object) --------
test("T11 · extra unknown top-level key REJECTED (strict object)", () => {
  const withExtra = { ...validClassification(), extra_key: "surprise" };
  const r = classificationSchema.safeParse(withExtra);
  assert.equal(r.success, false);
});

// -------- T12 missing required key --------
test("T12 · missing required key rejected", () => {
  const v = validClassification();
  delete v.reasoning;
  const r = classificationSchema.safeParse(v);
  assert.equal(r.success, false);
});

// -------- T13 no silent trim on strings --------
test("T13 · returned reasoning is NOT silently trimmed", () => {
  const padded = "  Applied AI reasoning with padding.  ";
  const r = classificationSchema.safeParse(
    validClassification({ reasoning: padded }),
  );
  assert.equal(r.success, true);
  assert.equal(r.data.reasoning, padded, "reasoning must NOT be trimmed");
});

test("T13b · returned company_preferences items are NOT silently trimmed", () => {
  const padded = "  Anthropic  ";
  const r = classificationSchema.safeParse(
    validClassification({ company_preferences: [padded] }),
  );
  assert.equal(r.success, true);
  assert.equal(
    r.data.company_preferences[0],
    padded,
    "preference item must NOT be trimmed",
  );
});

// -------- T14 no silent dedup --------
test("T14 · duplicates are REJECTED, not silently removed", () => {
  const r = classificationSchema.safeParse(
    validClassification({
      company_preferences: ["Anthropic", "Cohere", "Anthropic"],
    }),
  );
  assert.equal(r.success, false, "duplicates must fail validation");
  // (T7 already asserts case-different values are preserved.)
});

// -------- T15 no enum normalization --------
test("T15 · enum values are NOT normalized (case-variant rejected, not coerced)", () => {
  const r = classificationSchema.safeParse(
    validClassification({ archetype: "Applied_AI" }),
  );
  assert.equal(r.success, false, "case-variant enum must fail (no normalization)");
});

// -------- T16 no defaults inserted --------
test("T16 · missing optional-looking field is NOT filled with a default", () => {
  const v = { ...validClassification() };
  delete v.company_preferences;
  const r = classificationSchema.safeParse(v);
  assert.equal(r.success, false, "missing required field must fail (no defaulting)");
});

// -------- Sanity: enum values match TypeScript types in src/lib/types.ts --------
test("SANITY · ARCHETYPE_VALUES has 8 entries matching Archetype type", () => {
  assert.equal(ARCHETYPE_VALUES.length, 8);
  for (const v of [
    "applied_ai",
    "agent_engineering",
    "llm_infra",
    "eval",
    "research_engineer",
    "forward_deployed",
    "ml_engineer",
    "other",
  ]) {
    assert.ok(ARCHETYPE_VALUES.includes(v), `missing ${v}`);
  }
});

test("SANITY · SENIORITY_VALUES has 6 entries matching Seniority type", () => {
  assert.equal(SENIORITY_VALUES.length, 6);
  for (const v of ["junior", "mid", "senior", "staff", "principal", "unknown"]) {
    assert.ok(SENIORITY_VALUES.includes(v), `missing ${v}`);
  }
});

// -------- Summary --------
process.stdout.write(
  `\nCLASSIFY-SCHEMA TESTS: ${passed} passed, ${failed} failed\n`,
);
if (failed > 0) {
  for (const f of failures) process.stderr.write(`\n--- FAIL ${f.name} ---\n${f.err}\n`);
  process.exit(1);
}
process.exit(0);
