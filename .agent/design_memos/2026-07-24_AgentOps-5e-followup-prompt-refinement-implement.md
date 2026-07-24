# Design memo · AgentOps-5e-followup-prompt-refinement-implement · Mandatory exact evidence structure

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-prompt-refinement-implement
- **parent_loop**: AgentOps-5e-followup-prompt-refinement-design (`2026-07-24_run_02` · approved)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_02_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_03_TASK.md`
- **initial_cost**: **$0** (implementation only) · **paid A+B target**: ~$0.10

## 1 · Purpose

Implement the approved **Option B-lite** prompt contract in
`src/lib/prompts.ts::reportSystemPrompt`, add deterministic $0
tests, and run Fixture A + Fixture B exactly once each with no
retries. Validate whether the refined prompt produces a healthy
evidence apparatus (Appendix + ≥ 5 recognized citations + per-gap
coverage) AND exact contiguous quotes.

## 2 · Approved scope

- Prompt-only edit to `src/lib/prompts.ts::reportSystemPrompt`.
- New deterministic $0 test at
  `scripts/test-evidence-refinement-contract.mjs` (Node stdlib only).
- Fixture A × 1 · Fixture B × 1 · **no retries**.
- Committed run artifacts: `metadata.json`,
  `structural_checks.json`, `verdict.md`,
  `quote_integrity_summary.json` (if written),
  `network_diagnostics.json` (if written).

## 3 · Prior negative experiment

The earlier `AgentOps-5e-followup-prompt-tune-implement`
(`2026-07-24_run_01`) added a verbatim / no-paraphrase / self-check
block. Fixture A + Fixture B both completed legacy GREEN but dropped
Evidence Appendix and produced **0** recognized `Evidence quote:`
citations. `jd_000201` was avoided, not repaired. Rolled back in
commit `3957e87`. DECISION verdict was `revise`. That analysis
directly motivates the Option B-lite structure-plus-exactness design
this loop implements.

## 4 · Prompt changes

Insertion between line 80 (end of company-specific-claim rule) and
line 82 (`Output is Markdown only.`) of
`src/lib/prompts.ts::reportSystemPrompt`. **+36 lines · 0 deletions.**

Four compact parts (semantic wording — exact bytes in the diff):

- **Part 1 — Mandatory output structure**: 5 numbered gaps · 1
  Evidence quote line per gap (≥ 5 total) · exact `Evidence quote:
  "TEXT" — Company, jd_XXXXXX.` shape · mandatory
  `## Evidence Appendix` heading · tab-separated
  `jd_id\tcompany\ttitle` rows · **omission INVALID**.
- **Part 2 — Exact quote faithfulness**: verbatim single contiguous
  span · no paraphrase · no grammar repair · no word/tense/plurality
  changes · no ellipsis inside quotes · interpretation OUTSIDE quotes.
- **Part 3 — Short-fragment fallback**: fragments valid AND
  preferred over stitched spans · 5-word exact beats 20-word
  paraphrase AND beats omission.
- **Part 4 — Final self-check** (in this order): (1) **Structure**
  first (5 gaps · 5 lines · Appendix) · (2) **Exactness** second
  (character-for-character · no ellipsis · no repair) · (3)
  **Citation validity** third (jd_id exists · Appendix
  representation). **Omission is NOT a valid way to pass exactness.**

Plus one compact synthetic positive example
(`Evidence quote: "agentic RAG at scale" — ExampleCo, jd_999999.`)
and 2 compact synthetic negative examples (ellipsis bridging ·
omission).

## 5 · Mandatory structural contract

- Exactly 5 ranked gaps
- 1 Evidence quote line per gap (≥ 5 parser-recognized total, never
  clumped)
- Exact `Evidence quote: "TEXT" — Company, jd_XXXXXX.` shape
- `## Evidence Appendix` heading mandatory
- Tab-separated `jd_id\tcompany\ttitle` rows (dedupe)
- Omission of any of the above = **INVALID output**

## 6 · Exactness contract

- Verbatim from ONE contiguous span
- No paraphrase / grammar repair / word add-remove / tense /
  plurality / articles / conjunctions
- No ellipsis inside quotes
- Interpretation OUTSIDE quotes

## 7 · Short-fragment fallback

- Fragments valid AND preferred over stitched spans
- 5-word exact beats 20-word paraphrase
- **5-word exact ALSO beats omission** — closes the omission escape
  path

## 8 · Self-check ordering

1. **Structure** (5 gaps · 5 lines · Appendix)
2. **Exactness** (character-for-character · no ellipsis · no repair)
3. **Citation validity** (jd_id exists · Appendix representation)

**Omission is NOT a valid way to pass exactness.**

## 9 · Positive example

```
Evidence quote: "agentic RAG at scale" — ExampleCo, jd_999999.
```

Interpretation appears OUTSIDE the quote. Appendix row appears
once as `jd_999999\tExampleCo\tSenior AI Engineer`.

Synthetic values (`jd_999999` / `ExampleCo`) chosen to prevent
overfitting to any real corpus record.

## 10 · Negative examples

Exactly 2, compact, synthetic:

1. **Ellipsis bridging** (invalid):
   `Evidence quote: "agentic RAG at scale ... hands-on production"
   — ExampleCo, jd_999999.` — combines two non-contiguous source
   spans.
2. **Omission** (invalid): under gap 3, no Evidence quote line at
   all, or Evidence Appendix missing entirely — fails the mandatory
   structure even if every remaining quote is exact.

**No third negative example.**

## 11 · Canonical Appendix format

**Tab-separated**: `jd_id\tcompany\ttitle`

Matches `extractAppendix` in `scripts/quote-integrity-check.mjs`
(primary parser path: `line.split("\t").map(p => p.trim()).filter(Boolean)`
with `parts.length >= 3` and `/^jd_/i.test(parts[0])`).

**Only this one format is offered to the model.** The alternate
2-space / pipe-separated parser paths remain unchanged in the checker
but are not exposed to the model as options.

## 12 · Parser / checker / harness preservation

Pre-change file hashes (recorded before edit):

| file | git blob hash (pre) | expected hash (post) |
|---|---|---|
| `src/lib/prompts.ts` | `2a3371c` | changes (patch applied) |
| `scripts/quote-integrity-check.mjs` | `105ce8a` | **unchanged** |
| `scripts/report-regression-local.mjs` | `4abfd9f` | **unchanged** |

Verified by post-implementation `git hash-object` (see § 14).

Also unchanged:

- `extractEvidenceQuotes` regex
- `extractAppendix` regex
- `matchTiered` / `matchEllipsisFragments` /
  `matchTerminalPunctuationOnly` tier logic
- R1 strict exact-contiguous
- R2 8-condition terminal-punctuation-only
- Thresholds `HARD_LATENCY_MS = 240_000` · `SOFT_LATENCY_MS =
  120_000`
- Markdown shape · citation syntax · Appendix heading

## 13 · Deterministic tests

New file: `scripts/test-evidence-refinement-contract.mjs`

- Node stdlib only · no new dependency
- **20 primary assertions** (14 Group-A prompt-contract + 3
  additional Group-A structural-ordering / example-count · 3 Group-B
  parser-compat + 3 static-preservation)
- Runs with `node scripts/test-evidence-refinement-contract.mjs`

### Group A · prompt contract (14 checks)

A1-A14: at least 5 lines · one per top-5 gap · Appendix heading ·
exact citation shape · omission forbidden · shorter-fragment
fallback · verbatim contiguous · no ellipsis · no paraphrase / no
grammar repair · fragments allowed · positive example present ·
single canonical Appendix row format · 2 negative examples.

### Group A · structural checks (3 additional)

A15 self-check ordering (Structure < Exactness < Citation) · A16
exactly 2 numbered negatives · A17 positive-example anchor bounded.

### Group B · compatibility + preservation (6 checks)

B15 parser regex recognizes documented citation shape · B16 Appendix
heading present · B17 checker script present · B18 harness script
present · B19 `jd_000201` known verbatim head still in corpus · B20
no new match tier (no fuzzy / edit_distance / llm_judge markers).

### Result

```
PASS A1-A17 (17 group-A)
PASS B15-B20 (6 group-B)

OK · 20 primary assertions passed · $0 · no network / LLM / dev server invoked
```

## 14 · Static validation

- `node scripts/test-evidence-refinement-contract.mjs` → **20 / 20
  PASS** (see § 13).
- `npx tsc --noEmit` → **exit 0** (TypeScript typecheck clean).
- No new dependency added · no `package.json` change · no lockfile
  change.

## 15 · Paid validation plan

- Run **Fixture A exactly once** via
  `node scripts/report-regression-local.mjs --fixture A`.
- Run **Fixture B exactly once** via
  `node scripts/report-regression-local.mjs --fixture B`.
- **No retries** on either.
- Capture: run id · exit code · duration · completion_state · legacy
  verdict · report_char_count · capture_scope · fallback_used ·
  Appendix presence · recognized `evidence_entries` count ·
  per-gap citation coverage · QI verdict ·
  `fabricated_or_unmatched` count · R2 count ·
  `appendix_entries_not_cited` count · `jd_000201` status · network
  diagnostics · console errors.

## 16 · Cost boundary

- Implementation + tests + typecheck: **$0**.
- Paid A + B validation: **~$0.10 total estimate** (2 real Sonnet
  4.6 generations at ~$0.05 each).
- **No retries** even on operational failure.

## 17 · Baseline policy

- **No baseline mutation.**
- **No baseline promotion.**
- No `.agent/regression_baselines/**` change.
- No `.agent/quote_integrity_runs/**` mutation.

## 18 · Rollback plan

- Implementation commit reversal:
  `git revert <impl commit>` — undoes prompt patch + test script
  atomically.
- Validation commit reversal:
  `git revert <validation commit>` — removes committed run artifacts
  + memo completions.
- Pre-push · zero side effects on prompted users (no production
  deploy).

## 19 · Boundaries respected

- ✅ Only `src/lib/prompts.ts` modified (prompt patch · +36 lines)
- ✅ Only `scripts/test-evidence-refinement-contract.mjs` added
  (new deterministic $0 test)
- ✅ `scripts/quote-integrity-check.mjs` unchanged (hash `105ce8a`)
- ✅ `scripts/report-regression-local.mjs` unchanged (hash `4abfd9f`)
- ✅ No `.agent/scripts/**` change (hard rule per AgentOps-2c Q3-Q8)
- ✅ No R1 / R2 relaxation
- ✅ No fuzzy · no edit-distance · no LLM judge · no post-generation
  replacement · no silent quote rewriting
- ✅ No new match tier
- ✅ No Markdown / citation syntax change
- ✅ No Appendix heading change
- ✅ No model / provider change (still `claude-sonnet-4-6`)
- ✅ No API-route change
- ✅ No structural validator created (deferred to separate loop)
- ✅ No automatic regeneration / retry behavior
- ✅ No baseline mutation · no baseline promotion
- ✅ No pipeline change · no `.env*` · no `vercel.json` · no
  `package.json` · no lockfile · no workflow
- ✅ No threshold change
- ✅ No C/D/E · no A-E · no PDFs · no OpenAI API
- ✅ QI remains telemetry-only · no blocking promotion · no
  `AgentOps-5f-promote`
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human`

*(Sections 20-31 will be appended after Fixture A + B runs.)*
