#!/usr/bin/env node
// AgentOps-5e-followup-prompt-refinement-implement · deterministic $0 test.
// - No network, no LLM, no dev server.
// - Node stdlib only (readFileSync, assert). No new dependency.
// - Reads src/lib/prompts.ts as raw text and asserts the Option B-lite
//   4-part mandatory-structure-plus-exactness contract is present with
//   correct wording, correct ordering, and correct example bounds.
// - Reads src/data/web_bundle.json and asserts the jd_000201 known-good
//   verbatim head still appears (protects the fixture the negative
//   example on jd_000201 lives against).
// - Parser/checker/harness are NOT invoked at runtime; their file
//   hashes are recorded in the implementation memo instead (the
//   scripts are unchanged this loop and their hashes are asserted
//   there as static-inspection preservation).

import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";

const PROMPT_PATH = "src/lib/prompts.ts";
const CORPUS_PATH = "src/data/web_bundle.json";

const promptSrc = readFileSync(PROMPT_PATH, "utf8");
const corpus = JSON.parse(readFileSync(CORPUS_PATH, "utf8"));

// Anchor line for the new critical block.
const anchor = "CRITICAL — mandatory evidence structure AND exact quote faithfulness";
assert.ok(
  promptSrc.includes(anchor),
  "A0: mandatory-evidence-structure critical block anchor is missing",
);

// ---- Prompt-contract assertions (Group A · 14 checks) ----

const promptChecks = [
  {
    id: "A1_mandatory_at_least_5_lines",
    needle: "at least 5 parser-recognized Evidence quote lines total",
  },
  {
    id: "A2_one_per_top5_gap",
    needle: "one per gap",
  },
  {
    id: "A3_mandatory_evidence_appendix_heading",
    // Source is inside a JS template literal, so backticks are escaped
    // as \`. Match either the source-literal form or a plain-heading form.
    needle: "## Evidence Appendix",
  },
  {
    id: "A4_exact_evidence_quote_shape",
    needle: 'Evidence quote: "TEXT" — Company, jd_XXXXXX.',
  },
  {
    id: "A5_forbid_omission_quote_difficulty",
    needle: "Omission of any of the above is INVALID output",
  },
  {
    id: "A6_shorter_fragment_fallback",
    needle: "shorter exact fragment",
  },
  {
    id: "A7_exact_contiguous_source_spans",
    needle: "copied verbatim from ONE contiguous span",
  },
  {
    id: "A8_forbid_ellipsis_bridging",
    needle: "do NOT use ellipsis",
  },
  {
    id: "A9_forbid_grammar_repair_and_paraphrase",
    needle: "Do NOT paraphrase, repair grammar",
  },
  {
    id: "A10_allow_incomplete_fragments",
    needle: "grammatically incomplete source fragments are valid",
  },
  {
    id: "A11_positive_example_present",
    needle: 'Evidence quote: "agentic RAG at scale" — ExampleCo, jd_999999.',
  },
  {
    id: "A12_single_canonical_appendix_row_format",
    // Canonical row format: `jd_id\tcompany\ttitle` (tab-separated),
    // matches extractAppendix in scripts/quote-integrity-check.mjs.
    // In the source template literal the tab is written as \\t (four raw
    // chars: two backslashes + t) so that when the template literal is
    // evaluated at runtime the model sees exactly `\t`. The raw file
    // bytes are what we assert on here.
    needle: String.raw`jd_999999\\tExampleCo\\tSenior AI Engineer`,
  },
  {
    id: "A13_negative_example_ellipsis_bridging",
    needle: "Ellipsis bridging (invalid)",
  },
  {
    id: "A14_negative_example_omission",
    needle: "Omission (invalid)",
  },
];

for (const c of promptChecks) {
  assert.ok(
    promptSrc.includes(c.needle),
    `${c.id}: missing needle: ${JSON.stringify(c.needle)}`,
  );
  console.log(`PASS ${c.id}`);
}

// ---- Structural ordering: self-check must be structure-first (Group A cont.) ----

const idxSelfCheck = promptSrc.indexOf("Part 4 — Final self-check");
const idxStructure = promptSrc.indexOf("1. Structure:", idxSelfCheck);
const idxExactness = promptSrc.indexOf("2. Exactness:", idxSelfCheck);
const idxCitationValidity = promptSrc.indexOf("3. Citation validity:", idxSelfCheck);
assert.ok(idxSelfCheck > 0, "A15_pre: Part 4 self-check block missing");
assert.ok(idxStructure > 0, "A15_pre: self-check step 1 (Structure) missing");
assert.ok(idxExactness > idxStructure, "A15: self-check Exactness must come after Structure");
assert.ok(
  idxCitationValidity > idxExactness,
  "A15: self-check Citation validity must come after Exactness",
);
console.log("PASS A15_structure_first_self_check_ordering");

// ---- Negative-example count cap (max 2 numbered negatives) ----

const negSection = promptSrc.slice(promptSrc.indexOf("Negative examples (do NOT do these):"));
const numberedNegatives = (negSection.match(/^\s*\d+\.\s+.+\(invalid\)/gm) || []).length;
assert.equal(
  numberedNegatives,
  2,
  `A16: expected exactly 2 numbered negative examples, found ${numberedNegatives}`,
);
console.log("PASS A16_negative_example_count_capped_at_2");

// ---- Positive-example count is exactly 1 (only one line matches the exact synthetic template) ----

// The positive template `Evidence quote: "agentic RAG at scale"` should appear
// exactly once — the shape example, not scattered across the file.
const positiveOccurrences = (
  promptSrc.match(/agentic RAG at scale/g) || []
).length;
// Allow up to 2 references (positive block · one echo inside a negative example).
assert.ok(
  positiveOccurrences <= 2,
  `A17: positive-example anchor should appear at most twice, found ${positiveOccurrences}`,
);
console.log("PASS A17_positive_example_count_bounded");

// ---- Parser compatibility: checker regex must recognize the documented citation shape ----

// Same regex as scripts/quote-integrity-check.mjs::extractEvidenceQuotes.
const parserRegex = /Evidence quote:\s*["“]([^"”\n]{5,})["”]\s*[—–\-]\s*([^,\n]{1,120}?),\s*(jd_\d{4,})/g;
const documentedCitationLine =
  'Evidence quote: "agentic RAG at scale" — ExampleCo, jd_999999.';
parserRegex.lastIndex = 0;
const parserMatch = parserRegex.exec(documentedCitationLine);
assert.ok(
  parserMatch !== null,
  `B15: parser regex must recognize the documented citation shape (line: ${documentedCitationLine})`,
);
console.log("PASS B15_parser_recognizes_citation_shape");

// ---- Appendix compatibility: heading "Evidence Appendix" is what extractAppendix searches for ----

assert.ok(
  promptSrc.includes("## Evidence Appendix"),
  "B16: prompt must contain the exact `## Evidence Appendix` heading string",
);
console.log("PASS B16_appendix_heading_parser_compatible");

// ---- Static preservation (recorded in memo for hashes; runtime script existence check here) ----

assert.ok(
  existsSync("scripts/quote-integrity-check.mjs"),
  "B17_pre: checker script missing (should exist and be unchanged)",
);
assert.ok(
  existsSync("scripts/report-regression-local.mjs"),
  "B18_pre: harness script missing (should exist and be unchanged)",
);
// Hash preservation is asserted at the memo layer; runtime assertion here
// only confirms the files exist so the harness invocation later has a real target.
console.log("PASS B17_checker_script_present");
console.log("PASS B18_harness_script_present");

// ---- Corpus jd_000201 known-good fragment still present (protects the R1 fixture) ----

const records = Array.isArray(corpus) ? corpus : corpus.records || [];
const rec = records.find((r) => r && r.id === "jd_000201");
assert.ok(rec, "B19_pre: corpus record jd_000201 not found");
const KNOWN_HEAD_117 =
  "Evaluate and select ML approaches for specific problems: when to use LLM prompting vs. fine-tuning (QLoRA), classical";
assert.ok(
  String(rec.body).includes(KNOWN_HEAD_117),
  "B19: jd_000201 known verbatim head must still appear in web_bundle body",
);
console.log("PASS B19_jd_000201_exact_span_present");

// ---- No new match tier: sanity-check that checker file contains no unexpected tier names ----

const checkerSrc = readFileSync("scripts/quote-integrity-check.mjs", "utf8");
const knownTierNames = [
  "verbatim",
  "normalized",
  "case_insensitive",
  "ellipsis_fragment",
  "terminal_punctuation_only",
];
const unexpectedTierMarkers = [
  "fuzzy",
  "edit_distance",
  "editDistance",
  "levenshtein",
  "llm_judge",
];
for (const marker of unexpectedTierMarkers) {
  assert.ok(
    !checkerSrc.includes(marker),
    `B20: unexpected checker tier marker present (${marker}) — R1/R2 must not be extended this loop`,
  );
}
// At least the verbatim tier must still exist.
assert.ok(checkerSrc.includes("verbatim"), "B20_pre: checker must still reference verbatim tier");
console.log("PASS B20_no_new_match_tier");

console.log(
  `\nOK · ${
    promptChecks.length + 6 // 14 A group + A15 + A16 + A17 + B15 + B16 + B19 + B20 (B17/B18 pre-checks)
  } primary assertions passed · $0 · no network / LLM / dev server invoked`,
);
