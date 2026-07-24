# Design memo · AgentOps-5e-followup-prompt-tune-implement · Exact evidence quote contract

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-prompt-tune-implement
- **parent_loop**: AgentOps-5e-followup-prompt-tune (`2026-07-23_run_07`)
- **authorizing_decision**: `.agent/decisions/2026-07-23_run_07_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_01_TASK.md`
- **initial_cost**: **$0** (implementation only) · **paid A+B target**: ~$0.10

## 1 · Purpose

Apply the approved prompt-only exact-evidence-quote contract to
`src/lib/prompts.ts::reportSystemPrompt`, add deterministic $0
validation, and run Fixture A + Fixture B exactly once each with no
retries. Validate whether the recurring `jd_000201` R1 failure
disappears without weakening the checker or breaking report
structure.

## 2 · Approved scope

- `src/lib/prompts.ts` — single, minimal, non-redundant patch
- `scripts/test-evidence-quote-contract.mjs` — new deterministic $0
  test script (Node stdlib only)
- Fixture A × 1 · Fixture B × 1 · no retries
- Committed run artifacts: `metadata.json`, `structural_checks.json`,
  `verdict.md`, `quote_integrity_summary.json` (if written),
  `network_diagnostics.json` (if written)

## 3 · Prompt patch

Inserted immediately after the company-specific-claim rule block
(line 80) and before "Output is Markdown only." (line 82):

```
CRITICAL — evidence-quote-verbatim rule (read twice):
- Every quoted Evidence span MUST be copied verbatim from ONE
  contiguous span of the cited job description body.
- Do NOT paraphrase or repair grammar inside quotation marks. Do
  NOT add, remove, or change words, tense, plurality, articles, or
  conjunctions.
- Do NOT combine separated source fragments inside quotation marks.
  Do NOT use ellipsis ("...") inside a quote to skip source text —
  either quote one contiguous span or emit two separate quoted spans.
- A quote does not need to be a complete sentence. Grammatically
  incomplete source fragments are allowed and preferred over
  stitched-together spans; a short exact fragment beats a longer
  paraphrased sentence.
- Put all interpretation and grammatical framing OUTSIDE the
  quotation marks.
- Before finalizing, verify that every quoted string occurs exactly
  (character-for-character) in the supplied body text for the cited
  jd_id. If it does not, shorten or replace it with an exact
  contiguous source span.
```

## 4 · Exact insertion point

- File: `src/lib/prompts.ts`
- Function: `reportSystemPrompt`
- Position: between existing lines 80 and 82 (after
  `company-specific-claim rule` block; before
  `Output is Markdown only.`)
- Diff shape: **+8 lines · 0 deletions**

## 5 · Preserved output format

- Existing Markdown label preserved:
  `Evidence quote: "TEXT" — Company, jd_XXXXXX.`
- Evidence Appendix behavior preserved.
- No structured JSON generation introduced.
- No new output schema.
- Section boundaries and citation format unchanged.

## 6 · Checker / parser / harness preservation

Pre-change file hashes (recorded before edit):

| file | git blob hash |
|---|---|
| `src/lib/prompts.ts` (pre) | `2a3371c` |
| `scripts/quote-integrity-check.mjs` | `105ce8a` |
| `scripts/report-regression-local.mjs` | `4abfd9f` |

Post-change (expected unchanged for checker + harness):

- `scripts/quote-integrity-check.mjs`: **untouched** — verify by
  `git diff origin/main..HEAD -- scripts/quote-integrity-check.mjs`
  is empty
- `scripts/report-regression-local.mjs`: **untouched** — same check
- R1 / R2 tier logic: **unchanged** (no code change to matcher)
- Thresholds: `HARD_LATENCY_MS = 240_000` · `SOFT_LATENCY_MS = 120_000`
  **unchanged**

## 7 · Deterministic tests

New file: `scripts/test-evidence-quote-contract.mjs`

- Runs with `node scripts/test-evidence-quote-contract.mjs`
- **9 assertions** · Node stdlib only · **no new dependency**
- No network, no LLM, no dev server invoked

### Group A · prompt contract (7 assertions)

| id | asserts |
|---|---|
| A1 | `"copied verbatim from ONE contiguous span"` present |
| A2 | `"Do NOT paraphrase or repair grammar"` present |
| A3 | `"add, remove, or change words, tense, plurality, articles, or conjunctions"` present |
| A4 | `"Grammatically incomplete source fragments are allowed"` present |
| A5 | `"Do NOT use ellipsis"` present |
| A6 | `"verify that every quoted string occurs exactly"` present |
| A7 | `"OUTSIDE the quotation marks"` present |

### Group B · corpus source-span exact-match (2 assertions)

| id | asserts |
|---|---|
| B1 | known 117-char verbatim head appears in `web_bundle.json` `jd_000201.body` |
| B2 | grammar-added variant "for THE specific problems" does NOT appear in corpus |

### Checker behavior preservation (static inspection)

Not asserted at runtime because the checker CLI is not importable as
a library and refactoring is out of scope. Instead:

- Checker file hash pinned in § 6 above → **unchanged pre/post** →
  R1, R2, ellipsis-fragment matcher, and terminal-punctuation-only
  tier logic guaranteed unchanged.
- No new matching tier added to the checker.

### Result

```
PASS A1 · A2 · A3 · A4 · A5 · A6 · A7 · B1 · B2
OK · 9 assertions passed · $0 · no network / LLM / dev server invoked
```

## 8 · Static validation

- `npx tsc --noEmit` → **exit 0** (TypeScript typecheck clean)
- No new dependency added · no `package.json` change · no lockfile
  change
- Deterministic tests all pass (§ 7)

## 9 · Paid validation plan

- Run **Fixture A exactly once** via
  `node scripts/report-regression-local.mjs --fixture A`
- Run **Fixture B exactly once** via
  `node scripts/report-regression-local.mjs --fixture B`
- **No retries** on either.
- Capture: run id · exit code · duration · completion_state · legacy
  verdict · report_char_count · capture_scope · fallback_used ·
  Appendix presence · QI verdict · fabricated_or_unmatched count ·
  terminal_punctuation_only count · appendix_entries_not_cited count ·
  `jd_000201` result · network diagnostics · console errors.

## 10 · Cost boundary

- Implementation + tests + typecheck: **$0**.
- Paid A + B validation: **~$0.10 total estimate** (2 real Sonnet
  4.6 generations at ~$0.05 each).
- **No retries** even on failure.
- If A or B fails operationally, run the other and document; do not
  reflow budget.

## 11 · Baseline policy

- **No baseline mutation.**
- **No baseline promotion.**
- No `.agent/regression_baselines/**` change.
- No `.agent/quote_integrity_runs/**` mutation.

## 12 · Rollback plan

- Implementation commit reversal: `git revert <impl commit>` — undoes
  prompt patch + test script atomically.
- Validation commit reversal: `git revert <validation commit>` —
  removes committed run artifacts + memo completions.
- Pre-push · zero side effects on prompted users (no production
  deploy).

## 13 · Boundaries respected

- ✅ Only `src/lib/prompts.ts` modified (prompt patch)
- ✅ Only `scripts/test-evidence-quote-contract.mjs` added (new file
  under `scripts/`)
- ✅ `scripts/quote-integrity-check.mjs` unchanged (hash `105ce8a`)
- ✅ `scripts/report-regression-local.mjs` unchanged (hash `4abfd9f`)
- ✅ No `.agent/scripts/**` change (hard rule per AgentOps-2c Q3-Q8)
- ✅ No R1 / R2 relaxation
- ✅ No fuzzy · no edit-distance · no LLM judge · no post-generation
  replacement · no silent quote rewriting
- ✅ No Markdown / citation format change
- ✅ No model / provider change (still `claude-sonnet-4-6`)
- ✅ No API-route change
- ✅ No baseline mutation · no baseline promotion
- ✅ No pipeline change · no `.env*` · no `vercel.json` · no
  `package.json` · no lockfile · no workflow
- ✅ No threshold change · no retry behavior added
- ✅ No C/D/E · no A-E · no PDFs · no OpenAI API
- ✅ QI remains telemetry-only · no blocking promotion · no
  `AgentOps-5f-promote`
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human`
