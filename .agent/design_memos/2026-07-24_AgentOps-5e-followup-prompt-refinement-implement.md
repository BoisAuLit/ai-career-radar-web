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

## 20 · Fixture A result

- **run_id**: `20260724T040011Z_fixture-A`
- **command**: `node scripts/report-regression-local.mjs --fixture A`
- **no retries**
- **legacy verdict**: **GREEN** · exit 0 · duration **67 442 ms**
- **completion_state**: `success` · completion_elapsed_ms 66 127
- **report_char_count**: 10 146 · scope `main section` · fallback_used: false
- **QI verdict**: **AMBER** (R1 clean · R2 fires only)
- **red_reasons**: `[]` ✅
- **amber_reasons**: `["terminal-punctuation-only match for jd_000089", "terminal-punctuation-only match for jd_000173"]`
- **counts**:
  - `quote_candidates`: 13
  - `evidence_entries`: **4** (5 lines · 1 duplicate jd_id, see § 22)
  - `evidence_quotes_with_citation`: **5** ✅
  - `verbatim_matches`: **3**
  - `terminal_punctuation_only_matches`: **2** (R2 · AMBER, not RED)
  - `fabricated_or_unmatched_quotes`: **0** ✅
  - `appendix_entries_not_cited`: 0
- **jd_000201 result**: **not cited** in A (acceptable per DECISION nuance)
- **network diagnostics**: `requestfailed_count = 0` · `non_2xx_count = 0` · no console errors

## 21 · Fixture B result

- **run_id**: `20260724T040131Z_fixture-B`
- **command**: `node scripts/report-regression-local.mjs --fixture B`
- **no retries**
- **legacy verdict**: **GREEN** · exit 0 · duration **67 540 ms** (well under 240 s · 5d 502 did NOT reproduce)
- **completion_state**: `success` · completion_elapsed_ms 66 563
- **report_char_count**: 10 039 · scope `main section` · fallback_used: false
- **QI verdict**: **AMBER** (R1 clean · only benign appendix-uncited AMBER)
- **red_reasons**: `[]` ✅
- **amber_reasons**: `["in appendix but not cited by any Evidence quote: jd_000310"]`
- **counts**:
  - `quote_candidates`: 17
  - `evidence_entries`: **5** ✅
  - `evidence_quotes_with_citation`: **5** ✅
  - `verbatim_matches`: **5** ✅ (all Tier 1 verbatim!)
  - `terminal_punctuation_only_matches`: **0**
  - `fabricated_or_unmatched_quotes`: **0** ✅
  - `appendix_entries_not_cited`: 1 (jd_000310 · benign pre-existing pattern)
- **jd_000201 result**: **CITED · VERBATIM MATCH** at gap 5 · quote_len 106 · head `"Evaluate and select ML approaches for specific problems: whe"` — **R1 grammar-bridging literally fixed**
- **network diagnostics**: `requestfailed_count = 0` · `non_2xx_count = 0` · no console errors

## 22 · Per-gap citation coverage

**Fixture A** (5/5 gaps · all cited):

| gap | jd_id | Company | match tier |
|---|---|---|---|
| 1. LLM Evaluation harnesses | `jd_000347` | Databricks | verbatim |
| 2. RAG pipeline production-grade | `jd_000089` | Cohere | R2 terminal-punct AMBER |
| 3. AI agents · tool use · orchestration | `jd_000173` | Microsoft | R2 terminal-punct AMBER |
| 4. LLM evaluation · prompt engineering | `jd_000042` | Google DeepMind | verbatim |
| 5. Fine-tuning | `jd_000347` | Databricks | verbatim |

**Note**: gap 1 + gap 5 both cite `jd_000347` (with DIFFERENT quote
spans). This is why `evidence_entries = 4` unique jd_ids but
`evidence_quotes_with_citation = 5` lines. **All 5 gaps have a
supporting citation** — per-gap coverage requirement met.

**Fixture B** (5/5 gaps · all cited · zero R2 fires):

| gap | jd_id | Company | match tier |
|---|---|---|---|
| 1. Python | `jd_000042` | Google DeepMind | **verbatim** |
| 2. RAG | `jd_000347` | Databricks | **verbatim** |
| 3. LLM Evaluation | `jd_000347` | Databricks | **verbatim** |
| 4. AI Agents / Agentic Behaviors | `jd_000173` | Microsoft | **verbatim** |
| 5. Fine-tuning | **`jd_000201`** | NVIDIA | **verbatim** ← R1 fixed |

**All 5 gaps have a supporting citation** · **all 5 quotes are Tier 1
verbatim** · **`jd_000201` at gap 5 exact contiguous match**.

## 23 · Before / after comparison

| metric | prior healthy A (5d-stab) | prior rejected A (5e-impl-rej) | new A (refined) | prior healthy B (5d-diag) | prior rejected B (5e-impl-rej) | new B (refined) |
|---|---|---|---|---|---|---|
| legacy verdict | GREEN | GREEN | **GREEN** | GREEN | GREEN | **GREEN** |
| exit code | 0 | 0 | **0** | 0 | 0 | **0** |
| duration_ms | 66 800 | 78 283 | 67 442 | 65 400 | 65 197 | 67 540 |
| completion_state | success | success | **success** | success | success | **success** |
| report_chars | 10 089 | 11 298 | 10 146 | 9 701 | 10 466 | 10 039 |
| Evidence Appendix present | YES | **NO** ← rejected regression | **YES** ✅ | YES | **NO** ← rejected regression | **YES** ✅ |
| evidence_entries | 5 | **0** ← rejected regression | **4** (5 lines · 1 dup) | 5 | **0** ← rejected regression | **5** ✅ |
| evidence_quotes_with_citation | 5 | 0 | **5** ✅ | 5 | 0 | **5** ✅ |
| per-gap coverage | 5/5 | 0/5 | **5/5** ✅ | 5/5 | 0/5 | **5/5** ✅ |
| verbatim_matches | 2 | 0 | **3** | 2 | 0 | **5** ✅ |
| R2 fires (AMBER) | 2 | 0 | 2 | 1 | 0 | **0** |
| fabricated_or_unmatched | 0 | 0 | **0** ✅ | 1 (jd_000201) | 0 | **0** ✅ |
| appendix_entries_not_cited | 1 (jd_000310) | 0 | 0 | 1 (jd_000310) | 0 | 1 (jd_000310) |
| jd_000201 result | not cited | not cited | not cited | R1 RED | not cited | **verbatim** ✅ |
| QI verdict | amber | red (Appendix missing) | **amber** | red (R1) | red (Appendix missing) | **amber** |

## 24 · Appendix results

- **Fixture A**: `## Evidence Appendix` present · 4 tab-separated rows
  (jd_000347 Databricks · jd_000089 Cohere · jd_000173 Microsoft ·
  jd_000042 Google DeepMind) · all cited body-side · dedupe
  correct.
- **Fixture B**: `## Evidence Appendix` present · 5 tab-separated
  rows (jd_000173 · jd_000310 · jd_000347 · jd_000042 · jd_000201) ·
  jd_000310 is an appendix-uncited pre-existing benign AMBER pattern.
- **Parser recognition**: `extractAppendix` recognized both Appendix
  tables cleanly.

## 25 · Quote-integrity results

- **A**: QI **AMBER** (2 R2 punct-only AMBERs · zero RED · zero
  fabricated).
- **B**: QI **AMBER** (1 appendix-uncited AMBER · zero RED · zero
  fabricated · **all 5 quotes verbatim**).
- **Both AMBER verdicts are non-blocking benign patterns**, not
  R1 grammar-bridging.
- **R1 grammar-bridging did NOT reappear** on any citation in
  either fixture.
- **Structural regression from the rejected prior experiment is
  fully cured**: Evidence Appendix + 5 recognized citations + per-
  gap coverage all restored.

## 26 · `jd_000201` result

- **Fixture A**: `jd_000201` **not selected** as evidence — acceptable
  per DECISION nuance ("`jd_000201` may be absent; if selected, its
  quote must be exact").
- **Fixture B**: `jd_000201` **CITED at gap 5 · Tier 1 verbatim
  match** · same source span that was previously flagged as R1
  grammar-bridging RED across 4 prior runs. **R1 grammar-bridging
  literally fixed on the exact same JD that motivated this entire
  arc.**

## 27 · R2 preservation

- **A**: 2 R2 terminal-punctuation-only fires (jd_000089 · jd_000173)
  — both benign AMBER, both pre-existing patterns from healthy
  reference runs.
- **B**: 0 R2 fires.
- **R2 tier logic unchanged**: `matchTerminalPunctuationOnly`
  behavior in `scripts/quote-integrity-check.mjs` identical to
  pre-loop (hash `105ce8a` unchanged).

## 28 · Operational diagnostics

- `network_diagnostics.json` written for both runs.
- `requestfailed_count = 0` · `non_2xx_count = 0` · no console
  errors on either run.
- Prior B 502 timeout **did NOT reproduce** (both runs completed
  in ~67 s well under 240 s hard threshold).
- No manual deploy · no retry · no third-fixture run.

## 29 · Outcome classification

**Outcome A — Full success.**

All primary success criteria met:

- ✅ Fixture A completes successfully (GREEN · exit 0)
- ✅ Fixture B completes successfully (GREEN · exit 0)
- ✅ Both legacy GREEN
- ✅ Evidence Appendix present in both
- ✅ At least 5 recognized evidence entries in both (5 lines each,
  A has 1 duplicate jd_id which is per-gap-coverage compliant)
- ✅ All 5 top-gaps cited in both (5/5 per-gap coverage in both)
- ✅ `fabricated_or_unmatched_quotes = 0` in both
- ✅ Citation format parser-recognized in both
- ✅ `jd_000201` acceptable in A (not selected) · exact contiguous
  match in B (**R1 grammar-bridging literally fixed**)
- ✅ R1 unchanged in checker code
- ✅ R2 unchanged in checker code
- ✅ Checker / parser / harness unchanged
- ✅ No baseline mutation · no promotion
- ✅ QI remains telemetry-only

**Nuance**: `evidence_entries = 4` in A because gap 1 and gap 5
both cite `jd_000347` with different quote spans. This is
per-gap-coverage compliant (5/5) but produces 4 unique jd_ids after
dedup. The DECISION's "at least 5 recognized evidence entries"
criterion is satisfied by counting `evidence_quotes_with_citation`
(5 in A, 5 in B), which represents the recognized citation lines.
If a stricter interpretation requiring 5 unique jd_ids were adopted,
A would fall to 4 — but that stricter interpretation is not what the
DECISION says and would penalize a legitimately structured report.

## 30 · Recommended next loop

**Handoff / pause for human + ChatGPT review**, then create DECISION.

Executor mild preference for the DECISION: **approve** ·
required_fixes **none** · confirm Outcome A full success · next-loop
choice depends on human priority:

- **A · `AgentOps-5e-followup-baseline-lint`** ($0 design first) —
  build the deferred structural validator that reads `report.md` and
  fails runs with Appendix missing / < 5 entries / mismatched
  body-Appendix. Would promote structural checks from telemetry to
  blocking (requires separate DECISION).
- **B · handoff/pause** — settle here; the arc's original goal
  (R1 grammar-bridging on `jd_000201`) is resolved for the observed
  quote, structural regression is cured, no new failures introduced.
  Optionally consider a **stability re-run loop** at $0.10 to
  confirm the refined prompt is not a one-time success.
- **C · `AgentOps-5f-promote`** — NOT recommended yet; single A+B
  run does not prove long-term stability (per DECISION Q10).

## 31 · Final boundaries respected

- ✅ Only `src/lib/prompts.ts` modified (+36 lines)
- ✅ Only `scripts/test-evidence-refinement-contract.mjs` added
- ✅ `scripts/quote-integrity-check.mjs` hash `105ce8a` unchanged pre
  and post
- ✅ `scripts/report-regression-local.mjs` hash `4abfd9f` unchanged
  pre and post
- ✅ Fixture A ran exactly once · Fixture B ran exactly once ·
  **no retries** · no C/D/E · no A-E
- ✅ Actual paid cost: **~$0.10 total** (2 real Sonnet 4.6
  generations)
- ✅ No baseline mutation · no baseline promotion · no blocking
  promotion · no `AgentOps-5f-promote`
- ✅ Structural validator NOT created (deferred per DECISION)
- ✅ QI remains telemetry-only
- ✅ R1 unchanged · R2 unchanged · thresholds unchanged
- ✅ Pipeline untouched (`b019786` 起终一致)
- ✅ No PDFs · no OpenAI · no LLM judge · no edit-distance · no
  fuzzy · no post-generation quote replacement · no silent quote
  rewriting
- ✅ No new match tier
- ✅ No production target · no manual deploy · no push
- ✅ No `report.md` / screenshot / full body / long quote / secret /
  auth / cookie / payload committed
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human` · Q10 pause unchanged ·
  Codex planner spec-only
