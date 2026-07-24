#!/usr/bin/env node
// AgentOps-5e-followup-prompt-tune-implement · deterministic $0 test.
// - No network, no LLM, no dev server.
// - Node stdlib only (readFileSync, assert). No new dependency.
// - Reads src/lib/prompts.ts as raw text and asserts required
//   evidence-quote-verbatim contract clauses are present.
// - Reads src/data/web_bundle.json and asserts the jd_000201
//   source_phrase_head_120 exact span still exists in the corpus body.
// - Prompt module import is intentionally not attempted:
//   src/lib/prompts.ts is TypeScript and would require a bundler; the
//   contract clauses are string literals so source-level substring
//   assertions test the exact thing that ends up in the model prompt.
// - Checker behavior preservation (grammar-added negative,
//   non-contiguous bridging, R2 preservation, no-new-tier) is asserted
//   by static file-hash inspection at the memo level — the checker
//   file itself is NOT modified in this loop and its hash is recorded
//   in the implementation memo.

import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const PROMPT_PATH = "src/lib/prompts.ts";
const CORPUS_PATH = "src/data/web_bundle.json";

const promptSrc = readFileSync(PROMPT_PATH, "utf8");
const corpus = JSON.parse(readFileSync(CORPUS_PATH, "utf8"));

// ---- A · prompt contract assertions ----

// Anchor line so we assert against the new block, not the pre-existing
// "quoting language from a specific JD" line 79.
const anchor = "CRITICAL — evidence-quote-verbatim rule";
assert.ok(
  promptSrc.includes(anchor),
  "A0: evidence-quote-verbatim rule block anchor is missing",
);

const promptChecks = [
  {
    id: "A1_verbatim_contiguous",
    needle: "copied verbatim from ONE contiguous span",
  },
  {
    id: "A2_no_paraphrase_no_grammar_repair",
    needle: "Do NOT paraphrase or repair grammar",
  },
  {
    id: "A3_no_add_remove_change_words",
    needle: "add, remove, or change words, tense, plurality, articles, or conjunctions",
  },
  {
    id: "A4_incomplete_fragments_allowed",
    needle: "Grammatically incomplete source fragments are allowed",
  },
  {
    id: "A5_no_ellipsis_bridging",
    needle: "Do NOT use ellipsis",
  },
  {
    id: "A6_self_check_required",
    needle: "verify that every quoted string occurs exactly",
  },
  {
    id: "A7_interpretation_outside_quotes",
    needle: "OUTSIDE the quotation marks",
  },
];

for (const c of promptChecks) {
  assert.ok(promptSrc.includes(c.needle), `${c.id}: missing needle "${c.needle}"`);
  console.log(`PASS ${c.id}`);
}

// ---- B · corpus source-span exact-match assertion for jd_000201 ----

const records = Array.isArray(corpus) ? corpus : corpus.records || [];
const rec = records.find((r) => r && r.id === "jd_000201");
assert.ok(rec, "B1_pre: corpus record jd_000201 not found");
const body = String(rec.body || "");

// Known 117-char verbatim head that the checker's ellipsis-fragment
// tier reported as "verbatim" in 3/4 prior controlled runs.
const KNOWN_HEAD_117 =
  "Evaluate and select ML approaches for specific problems: when to use LLM prompting vs. fine-tuning (QLoRA), classical";

assert.ok(
  body.includes(KNOWN_HEAD_117),
  "B1: jd_000201 known verbatim head does not appear in web_bundle body",
);
console.log("PASS B1_jd_000201_exact_span_present");

// Negative example — grammar-added article variant must NOT appear.
const GRAMMAR_ADDED =
  "Evaluate and select ML approaches for THE specific problems";
assert.ok(
  !body.includes(GRAMMAR_ADDED),
  "B2: unexpected grammar-added variant exists in corpus (would break negative-case invariant)",
);
console.log("PASS B2_grammar_added_negative_not_in_corpus");

// ---- Summary ----
console.log(
  `\nOK · ${promptChecks.length + 2} assertions passed · $0 · no network / LLM / dev server invoked`,
);
