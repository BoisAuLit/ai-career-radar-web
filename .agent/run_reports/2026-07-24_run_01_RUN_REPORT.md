# RUN REPORT · AgentOps-5e-followup-prompt-tune-implement · Exact evidence quote contract

## Metadata

- **task_id**: `2026-07-24_run_01`
- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-prompt-tune-implement
- **parent_loop**: AgentOps-5e-followup-prompt-tune (`2026-07-23_run_07`)
- **task_path**: `.agent/tasks/2026-07-24_run_01_TASK.md`
- **authorizing_decision**: `.agent/decisions/2026-07-23_run_07_DECISION.md`
- **memo_path**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-prompt-tune-implement.md`
- **impl_commit**: `11c581c` (Enforce exact evidence quotes in report prompt)
- **validation_commit**: `fbcc766` (Validate exact evidence quote prompt)

## Regression verdict

- **regression_required**: **yes**
- **reason_required_or_not**: prompt behavior changed and requires
  controlled A/B regression validation
- **harness_used**: **yes**
- **harness_command**:
  - `node scripts/report-regression-local.mjs --fixture A`
  - `node scripts/report-regression-local.mjs --fixture B`
- **fixture_ids**: A · B
- **target_environment**: local
- **latest_run_id**:
  - Fixture A: `20260724T010632Z_fixture-A`
  - Fixture B: `20260724T010756Z_fixture-B`
- **verdict**: **partial** — legacy GREEN on both fixtures; quote-
  integrity **RED** on both (new red_reason: Evidence Appendix
  missing); `fabricated_or_unmatched_quotes = 0`; `jd_000201` not
  cited by either run under the new prompt
- **exit_code**: A `0` · B `0`
- **artifact_paths**:
  - `.agent/regression_runs/20260724T010632Z_fixture-A/`
  - `.agent/regression_runs/20260724T010756Z_fixture-B/`
  - `.agent/design_memos/2026-07-24_AgentOps-5e-followup-prompt-tune-implement.md`
- **report_char_count**: A `11 298` · B `10 466`
- **capture_scope**: A `main section` · B `main section`
- **fallback_used**: false (both)
- **red_checks_failed**:
  - both: `contains_evidence_appendix` (level `red`)
- **amber_checks_failed**: none
- **cost_measured**: false
- **estimated_cost**: **~$0.10** (2 real Sonnet 4.6 generations)
- **duration_ms**: A `78 283` · B `65 197`
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Prompt patch summary

- File: `src/lib/prompts.ts::reportSystemPrompt`
- Insertion between line 80 (end of company-specific-claim rule) and
  line 82 (`Output is Markdown only.`).
- **+8 lines · 0 deletions**.
- Adds a "CRITICAL — evidence-quote-verbatim rule" block with 6
  clauses (verbatim single contiguous span · no paraphrase / grammar
  repair / word add-remove / tense / plurality / articles /
  conjunctions · no ellipsis inside quote · fragments allowed ·
  interpretation outside quotes · pre-submit exact-substring
  self-check).

## Deterministic tests and results

- New file: `scripts/test-evidence-quote-contract.mjs` · Node stdlib
  only · no new dependency
- **9 / 9 assertions PASS**:
  - A1_verbatim_contiguous ✅
  - A2_no_paraphrase_no_grammar_repair ✅
  - A3_no_add_remove_change_words ✅
  - A4_incomplete_fragments_allowed ✅
  - A5_no_ellipsis_bridging ✅
  - A6_self_check_required ✅
  - A7_interpretation_outside_quotes ✅
  - B1_jd_000201_exact_span_present ✅
  - B2_grammar_added_negative_not_in_corpus ✅
- Checker behavior preservation asserted by **static hash inspection**
  in memo § 6 (`scripts/quote-integrity-check.mjs` hash `105ce8a`
  unchanged · `scripts/report-regression-local.mjs` hash `4abfd9f`
  unchanged).
- TypeScript typecheck: `npx tsc --noEmit` → **exit 0**.

## Fixture A

- run_id: `20260724T010632Z_fixture-A`
- command: `node scripts/report-regression-local.mjs --fixture A`
- **no retries**
- legacy verdict: **GREEN** · exit 0 · duration 78 283 ms
- completion_state: `success`
- report_char_count: 11 298 · scope: main section · fallback_used: false
- **QI verdict**: **RED**
- QI red_reasons: `["Evidence Appendix missing while report contains evidence/citation language"]`
- QI amber_reasons: `[]`
- QI counts:
  - `quote_candidates`: **19**
  - `evidence_entries`: **0**
  - `evidence_quotes_with_citation`: **0**
  - `verbatim_matches`: 0
  - `normalized_matches`: 0
  - `case_insensitive_matches`: 0
  - `ellipsis_fragment_matches`: 0
  - `terminal_punctuation_only_matches`: **0**
  - `fabricated_or_unmatched_quotes`: **0** ✅
  - `appendix_entries_not_cited`: 0
- `jd_000201` result: **not cited** in this run
- Network diagnostics: `requestfailed_count = 0` · `non_2xx_count = 0` · no console errors

## Fixture B

- run_id: `20260724T010756Z_fixture-B`
- command: `node scripts/report-regression-local.mjs --fixture B`
- **no retries**
- legacy verdict: **GREEN** · exit 0 · duration 65 197 ms (well
  under 240 s hard threshold · prior 5d 502/timeout **did NOT
  reproduce**)
- completion_state: `success`
- report_char_count: 10 466 · scope: main section · fallback_used: false
- **QI verdict**: **RED**
- QI red_reasons: `["Evidence Appendix missing while report contains evidence/citation language"]`
- QI amber_reasons: `[]`
- QI counts:
  - `quote_candidates`: **21**
  - `evidence_entries`: **0**
  - `evidence_quotes_with_citation`: **0**
  - `verbatim_matches`: 0
  - `normalized_matches`: 0
  - `case_insensitive_matches`: 0
  - `ellipsis_fragment_matches`: 0
  - `terminal_punctuation_only_matches`: **0**
  - `fabricated_or_unmatched_quotes`: **0** ✅
  - `appendix_entries_not_cited`: 0
- `jd_000201` result: **not cited** in this run (5d-b-timeout-
  diagnostics run cited it as R1 RED; new run does not cite it)
- Network diagnostics: `requestfailed_count = 0` · `non_2xx_count = 0` · no console errors

## Before / after comparison (key rows)

| metric | prior A (5d-stab) | new A | prior B (5d-diag) | new B |
|---|---|---|---|---|
| legacy verdict | GREEN | GREEN | GREEN | GREEN |
| exit code | 0 | 0 | 0 | 0 |
| duration_ms | 66 800 | 78 283 | 65 400 | 65 197 |
| report chars | 10 089 | 11 298 | 9 701 | 10 466 |
| Evidence Appendix present | **YES** | **NO** ← regression | **YES** | **NO** ← regression |
| QI verdict | amber | red (new reason) | red | red (new reason) |
| evidence_entries (cited) | 5 | **0** ← regression | 5 | **0** ← regression |
| fabricated_or_unmatched | 0 | **0** ✅ | 1 | **0** ✅ |
| R2 fires | 2 | 0 | 1 | 0 |
| appendix_entries_not_cited | 1 (jd_000310) | 0 | 1 (jd_000310) | 0 |
| jd_000201 result | not cited | not cited | R1 RED | **not cited** |

## `jd_000201` before / after

- **Before**: cited across 4 controlled runs (5c, 5c-integrate, 5d-R2,
  5d-b-timeout-diagnostics) as R1 RED (`non_contiguous_bridging` with
  120-char verbatim head + 34-char unmatched tail after ellipsis).
- **After (new A)**: not cited.
- **After (new B)**: not cited.
- **Interpretation**: R1 grammar-bridging **did not reproduce**, but
  **not** because the fix demonstrably worked on the specific quote
  — because the model no longer emits any `Evidence quote: "TEXT" —
  Company, jd_XXXXXX.` citations under the new prompt.

## All fabricated / unmatched findings

- **Zero fabricated / unmatched** quotes in either fixture. ✅
- Zero because no cited-format quotes were emitted for the checker to
  evaluate.

## R2 results

- Both new runs: `terminal_punctuation_only_matches = 0`.
- Not evidence of a checker regression — checker file hash unchanged
  (`105ce8a`). Consistent with zero recognized citation-format
  quotes.
- R2 tier logic intact.

## Appendix results

- **Evidence Appendix MISSING** from both new A and new B reports
  (structural check `contains_evidence_appendix` emits `red`).
- Prior A + B runs consistently contained an Evidence Appendix.
- **This is a real product regression** driven by the prompt patch.
- Not a checker change: the `extractAppendix` logic is unchanged
  (harness hash `4abfd9f`).

## Legacy structure results

- Legacy 25-check verdict: **GREEN** for both A and B.
- All legacy structural checks pass except `contains_evidence_appendix`
  (which flags red but does not currently flip the legacy exit code).

## Operational / network results

- No network failures on either fixture.
- No console errors.
- No non-2xx responses.
- Fixture B **completed in 65 s** — prior 5d B 502 timeout did **not**
  reproduce.
- Completion state `success` on both.

## Outcome classification

**Outcome B — Partial** (leaning toward **Outcome C — Prompt
ineffective**).

Positives:

- ✅ `jd_000201` no longer R1 RED (via non-citation, not via fix)
- ✅ `fabricated_or_unmatched_quotes = 0` on both fixtures
- ✅ R1 unchanged (checker file hash unchanged)
- ✅ R2 unchanged (checker file hash unchanged)
- ✅ Legacy verdict GREEN on both
- ✅ A + B both complete
- ✅ No baseline mutation · no promotion · QI telemetry-only
- ✅ Fixture B 502 did not reproduce

Negatives (real regressions):

- ❌ **Evidence Appendix disappeared** from both fixtures
- ❌ **`Evidence quote:` citation format collapsed to 0** in both
  fixtures
- ❌ Audit trail (traceable evidence quotes) has been **weakened**

**Assessment**: the prompt patch was **over-corrective**. Combined
verbatim requirement + ellipsis prohibition + exact-substring
self-check made the model cautious enough that it dropped the
recognized citation apparatus rather than risk emitting a non-exact
quote. **Structural regression outweighs the technical disappearance
of the specific `jd_000201` R1 RED.**

## Actual cost estimate

- Implementation + tests + typecheck: **$0**.
- Paid A + B validation: **~$0.10 total** (2 real Sonnet 4.6
  generations at ~$0.05 each).
- **Total loop cost: ~$0.10.**

## What did not change

- **`scripts/quote-integrity-check.mjs`**: hash `105ce8a` pre and post
- **`scripts/report-regression-local.mjs`**: hash `4abfd9f` pre and post
- **R1 / R2** checker tier logic: unchanged
- **Thresholds**: `HARD_LATENCY_MS = 240_000` · `SOFT_LATENCY_MS = 120_000`
- **Baseline metadata**: unchanged (no mutation)
- **Baseline promotion**: none
- **QI blocking mode**: `telemetry_only` preserved
- **Pipeline**: `b019786` 起终一致
- **Model / provider**: `claude-sonnet-4-6` unchanged
- **Markdown / citation format contract**: unchanged in the prompt
  (but model choice regressed away from it — see § 22 in memo)

## Boundary confirmations

- ✅ Only `src/lib/prompts.ts` modified (prompt patch · +8 lines)
- ✅ Only `scripts/test-evidence-quote-contract.mjs` added
- ✅ No `.agent/scripts/**` change (hard rule)
- ✅ Fixture A ran exactly once · Fixture B ran exactly once ·
  **no retries** · no C/D/E · no A-E
- ✅ No baseline mutation · no baseline promotion · no blocking
  promotion · no `AgentOps-5f-promote`
- ✅ QI remains telemetry-only
- ✅ No `.env*` · `vercel.json` · `package.json` · lockfile ·
  workflow changes
- ✅ No `report.md` · screenshot · full body · long quote · secret
  committed
- ✅ No PDFs · no OpenAI · no LLM judge · no edit-distance · no
  fuzzy · no post-generation quote replacement
- ✅ No production · no manual deploy · no push
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human` · Q10 pause unchanged ·
  Codex planner spec-only

## Recommended next loop

**A follow-up prompt refinement design loop** (**$0** inspection /
design first · then optional paid validation) that:

- preserves the verbatim contract
- **explicitly reinforces** that Evidence Appendix + `Evidence
  quote: "TEXT" — Company, jd_XXXXXX.` citation format MUST still
  be produced
- allows shorter fragments explicitly (5-word exact fragments are
  acceptable and preferred over silently dropping the citation
  format)
- **removes / softens** the ellipsis prohibition wording that may
  have been read as "if unsure, don't cite"
- considers escalating to **Option B** (separate `Quote:` and
  `Interpretation:` sub-fields) if a second prompt-only refinement
  still fails to preserve appendix + citation format

**Alternative**: `git revert 11c581c fbcc766` and hand off to
human to decide whether to iterate the prompt (~$0.10 next attempt)
or pause the tuning arc.

**Do NOT** start AgentOps-5f-promote.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT rerun A or B.** **Do NOT modify prompt
again after observing results.** **Do NOT modify checker.** **Do
NOT loosen R1 / R2.** **Do NOT mutate baselines.** **Do NOT promote
QI.** **Do NOT start `AgentOps-5f-promote`.**
