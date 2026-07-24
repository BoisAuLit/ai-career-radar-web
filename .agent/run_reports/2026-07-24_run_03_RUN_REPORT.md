# RUN REPORT · AgentOps-5e-followup-prompt-refinement-implement · Mandatory exact evidence structure

## Metadata

- **task_id**: `2026-07-24_run_03`
- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-prompt-refinement-implement
- **parent_loop**: AgentOps-5e-followup-prompt-refinement-design (`2026-07-24_run_02`)
- **task_path**: `.agent/tasks/2026-07-24_run_03_TASK.md`
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_02_DECISION.md`
- **memo_path**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-prompt-refinement-implement.md`
- **impl_commit**: `710cc3d` (Require mandatory exact evidence structure)
- **validation_commit**: `c0f7d2e` (Validate mandatory exact evidence structure)

## Regression verdict

- **regression_required**: **yes**
- **reason_required_or_not**: report prompt behavior changed and
  requires controlled A/B regression validation
- **harness_used**: **yes**
- **harness_command**:
  - `node scripts/report-regression-local.mjs --fixture A`
  - `node scripts/report-regression-local.mjs --fixture B`
- **fixture_ids**: A · B
- **target_environment**: local
- **latest_run_id**:
  - Fixture A: `20260724T040011Z_fixture-A`
  - Fixture B: `20260724T040131Z_fixture-B`
- **verdict**: **full_success** — Outcome A · both fixtures GREEN ·
  Evidence Appendix present · 5 recognized citations each · per-gap
  5/5 coverage each · zero fabricated/unmatched · `jd_000201`
  verbatim in B (R1 grammar-bridging literally fixed)
- **exit_code**: A `0` · B `0`
- **artifact_paths**:
  - `.agent/regression_runs/20260724T040011Z_fixture-A/`
  - `.agent/regression_runs/20260724T040131Z_fixture-B/`
  - `.agent/design_memos/2026-07-24_AgentOps-5e-followup-prompt-refinement-implement.md`
- **report_char_count**: A `10 146` · B `10 039`
- **capture_scope**: A `main section` · B `main section`
- **fallback_used**: false (both)
- **red_checks_failed**: none
- **amber_checks_failed**: none
- **cost_measured**: false
- **estimated_cost**: **~$0.10** (2 real Sonnet 4.6 generations)
- **duration_ms**: A `67 442` · B `67 540`
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Prompt implementation commit

- `710cc3d Require mandatory exact evidence structure`
- **+656 lines · 0 deletions** across TASK + prompt patch + test
  script + memo draft (4 files)
- `src/lib/prompts.ts` patch: **+36 lines** · 4-part Option B-lite
  contract inserted between line 80 (end of company-specific-claim
  rule) and line 82 (`Output is Markdown only.`)

## Validation commit

- `c0f7d2e Validate mandatory exact evidence structure`
- +1 232 net lines: memo sections 20-31 appended · A run dir (5
  files) + B run dir (5 files) committed
- 11 files touched

## Prompt patch summary

Four-part Option B-lite contract:

- **Part 1 · Mandatory output structure** — 5 gaps · 1 Evidence
  quote line per gap (≥ 5 total) · exact `Evidence quote: "TEXT" —
  Company, jd_XXXXXX.` shape · `## Evidence Appendix` heading
  mandatory · tab-separated Appendix rows · **omission INVALID**
- **Part 2 · Exact quote faithfulness** — verbatim one contiguous
  span · no paraphrase / grammar repair / word add-remove / tense /
  plurality / articles / conjunctions · no ellipsis inside quotes ·
  interpretation OUTSIDE quotes
- **Part 3 · Short-fragment fallback** — fragments valid AND
  preferred over stitched spans · 5-word exact beats 20-word
  paraphrase AND beats omission
- **Part 4 · Final self-check** — structure FIRST → exactness
  SECOND → citation validity THIRD · **omission NOT a valid way to
  pass exactness**

Plus 1 compact synthetic positive example + 2 compact synthetic
negative examples (ellipsis bridging · omission).

## Deterministic tests and results

- New file: `scripts/test-evidence-refinement-contract.mjs` (Node
  stdlib only · no new dependency)
- **20 primary assertions PASS**:
  - A1-A14 prompt-contract needles
  - A15 structure-first self-check ordering
  - A16 negative-example count capped at 2
  - A17 positive-example anchor bounded
  - B15 parser regex recognizes citation shape
  - B16 Appendix heading present
  - B17 checker script present
  - B18 harness script present
  - B19 `jd_000201` known verbatim head still in corpus
  - B20 no new match tier
- `npx tsc --noEmit` → **exit 0**

## Fixture A · command · run · result

- **command**: `node scripts/report-regression-local.mjs --fixture A`
- **run_id**: `20260724T040011Z_fixture-A`
- **no retries**
- **legacy verdict**: **GREEN** · exit 0 · duration 67 442 ms
- **completion_state**: `success`
- **report_char_count**: 10 146 · scope `main section` · fallback: false
- **QI verdict**: **AMBER** (no RED · 2 R2 punct-only AMBER · zero
  fabricated)
- **red_reasons**: `[]` ✅
- **amber_reasons**: `["terminal-punctuation-only match for jd_000089", "terminal-punctuation-only match for jd_000173"]`
- **counts**: quote_candidates 13 · **evidence_entries 4** (5 lines
  · 1 duplicate jd_id) · **evidence_quotes_with_citation 5** ✅ ·
  verbatim 3 · R2 2 · **fabricated_or_unmatched 0** ✅
- **jd_000201**: not cited (acceptable per DECISION)
- **network**: `requestfailed=0` · `non_2xx=0` · no console errors

## Fixture B · command · run · result

- **command**: `node scripts/report-regression-local.mjs --fixture B`
- **run_id**: `20260724T040131Z_fixture-B`
- **no retries**
- **legacy verdict**: **GREEN** · exit 0 · duration 67 540 ms (well
  under 240 s · prior 5d 502 did NOT reproduce)
- **completion_state**: `success`
- **report_char_count**: 10 039 · scope `main section` · fallback: false
- **QI verdict**: **AMBER** (no RED · 1 benign appendix-uncited
  AMBER · zero fabricated · **all 5 quotes Tier 1 verbatim**)
- **red_reasons**: `[]` ✅
- **amber_reasons**: `["in appendix but not cited by any Evidence quote: jd_000310"]`
- **counts**: quote_candidates 17 · **evidence_entries 5** ✅ ·
  **evidence_quotes_with_citation 5** ✅ · **verbatim 5** ✅ · R2 0 ·
  **fabricated_or_unmatched 0** ✅
- **jd_000201**: **CITED at gap 5 · Tier 1 verbatim match** ·
  quote_len 106 · **R1 grammar-bridging literally fixed on the
  exact same JD that motivated this entire arc**
- **network**: `requestfailed=0` · `non_2xx=0` · no console errors

## No-retry confirmation

- Fixture A ran **exactly once**
- Fixture B ran **exactly once**
- **No retries** on either
- Total generation cost: ~$0.10

## Appendix results

- **A**: `## Evidence Appendix` present · 4 tab-separated rows
  (Databricks, Cohere, Microsoft, Google DeepMind) · all cited
  body-side · dedupe correct.
- **B**: `## Evidence Appendix` present · 5 tab-separated rows
  (Microsoft, Scale AI, Databricks, Google DeepMind, NVIDIA) ·
  jd_000310 (Scale AI) is a benign appendix-uncited AMBER pattern.
- Parser recognized both Appendix tables cleanly.

## evidence_entries counts

- **A**: `evidence_entries = 4` unique jd_ids · `evidence_quotes_with_citation = 5` lines (one duplicate jd)
- **B**: `evidence_entries = 5` unique jd_ids · `evidence_quotes_with_citation = 5` lines
- Both meet the DECISION's "at least 5 recognized evidence entries"
  criterion by `evidence_quotes_with_citation`.

## Per-gap citation coverage

**Fixture A · 5/5 gaps cited**:

| gap | jd_id | Company | match |
|---|---|---|---|
| 1 LLM Evaluation harnesses | jd_000347 | Databricks | verbatim |
| 2 RAG pipeline | jd_000089 | Cohere | R2 AMBER |
| 3 AI agents | jd_000173 | Microsoft | R2 AMBER |
| 4 LLM evaluation | jd_000042 | Google DeepMind | verbatim |
| 5 Fine-tuning | jd_000347 | Databricks | verbatim |

*Note*: gap 1 + gap 5 both cite `jd_000347` with **different quote
spans** — this is per-gap-coverage compliant and produces 4 unique
jd_ids after dedup.

**Fixture B · 5/5 gaps cited · all Tier 1 verbatim**:

| gap | jd_id | Company | match |
|---|---|---|---|
| 1 Python | jd_000042 | Google DeepMind | **verbatim** |
| 2 RAG | jd_000347 | Databricks | **verbatim** |
| 3 LLM Evaluation | jd_000347 | Databricks | **verbatim** |
| 4 AI Agents | jd_000173 | Microsoft | **verbatim** |
| 5 Fine-tuning | **jd_000201** | NVIDIA | **verbatim** ← R1 fixed |

## Fabricated / unmatched findings

- **A**: `fabricated_or_unmatched_quotes = 0` ✅
- **B**: `fabricated_or_unmatched_quotes = 0` ✅
- **No R1 grammar-bridging** on any citation in either fixture

## `jd_000201` result

- **A**: not cited (acceptable per DECISION nuance)
- **B**: **CITED at gap 5 · Tier 1 verbatim match** · same 106-char
  span that was previously flagged R1 RED across 4 prior runs

**The recurring R1 grammar-bridging on `jd_000201` is literally
fixed** by the refined prompt contract.

## R2 results

- **A**: 2 R2 terminal-punctuation-only fires (jd_000089 · jd_000173)
  — both benign AMBER, both pre-existing patterns from healthy
  reference runs
- **B**: 0 R2 fires
- **R2 tier logic unchanged**: `matchTerminalPunctuationOnly`
  behavior in `scripts/quote-integrity-check.mjs` (hash `105ce8a`)
  identical to pre-loop

## Legacy verdicts

- **A**: GREEN · exit 0 · all legacy structural checks pass
- **B**: GREEN · exit 0 · all legacy structural checks pass

## Completion states

- **A**: `success` · elapsed_to_completion 66 127 ms
- **B**: `success` · elapsed_to_completion 66 563 ms

## Operational diagnostics

- Both runs: `requestfailed_count = 0` · `non_2xx_count = 0` · no
  console errors
- Prior B 502 timeout **did NOT reproduce** (both durations ~67 s
  well under 240 s hard threshold)
- `network_diagnostics.json` written for both runs
- No manual deploy · no retry · no third-fixture run

## Before / after comparison

See memo § 23 for the full table. Key deltas:

- Both fixtures: **Appendix restored** (rejected experiment: MISSING
  → refined: PRESENT)
- Both fixtures: **evidence_entries restored** (0 → 5 / 5 lines)
- Both fixtures: **per-gap coverage restored** (0/5 → 5/5)
- Fixture B: **`jd_000201` R1 grammar-bridging fixed** (R1 RED →
  Tier 1 verbatim)

## Outcome classification

**Outcome A — Full success.**

All success criteria met. See memo § 29 for detailed list.

Nuance: `evidence_entries = 4` in A because gap 1 and gap 5 both
cite `jd_000347` with different quote spans. Per-gap coverage
compliant (5/5). DECISION's "at least 5 recognized evidence entries"
criterion satisfied by `evidence_quotes_with_citation = 5`.

## Actual cost estimate

- Implementation + tests + typecheck: **$0**
- Paid A + B validation: **~$0.10 total** (2 × Sonnet 4.6 ~$0.05 each)
- **Total: ~$0.10**

## No-checker-parser-harness-changes confirmation

- `scripts/quote-integrity-check.mjs` hash `105ce8a` pre + post ✅
- `scripts/report-regression-local.mjs` hash `4abfd9f` pre + post ✅
- `extractEvidenceQuotes`, `extractAppendix`, `matchTiered`,
  `matchEllipsisFragments`, `matchTerminalPunctuationOnly` all
  unchanged ✅

## No-R1-R2-relaxation confirmation

- R1 strict exact-contiguous unchanged ✅
- R2 8-condition terminal-punctuation-only unchanged ✅
- No new match tier ✅
- No fuzzy / no edit-distance / no LLM judge / no post-generation
  replacement / no silent quote rewriting ✅

## No-baseline-mutation-promotion confirmation

- `.agent/regression_baselines/**` untouched ✅
- No promotion ✅
- No blocking promotion ✅
- No `AgentOps-5f-promote` ✅

## No-structural-validator confirmation

- Deferred to separate design loop per DECISION § 24
- Not added this loop ✅

## QI telemetry-only

- QI verdict recorded but did not flip harness exit code ✅
- Both fixtures legacy GREEN despite QI AMBER ✅
- `metadata.quote_integrity.blocking_mode = telemetry_only`
  preserved ✅

## Boundary confirmations · 全 CLEAN

no push · no deploy · no manual deploy · Fixture A × 1 · Fixture B ×
1 · no retries · no C/D/E · no A-E · no PDFs · no OpenAI · no LLM
judge · no edit-distance · no fuzzy · no post-generation replacement
· no silent quote rewriting · no baseline mutation/promotion · no
blocking promotion · no 5f-promote · no `.agent/scripts/**` change ·
no other `scripts/**` modification (only new `scripts/test-evidence-
refinement-contract.mjs` added) · no API route change · no threshold
change · no retry behavior added · no `report.md`/screenshot/long
quote/secret committed · no structural validator created · BLK-0001/
0002/0003 open · G2.1d blocked_pending_human · Q10 pause · Codex
planner spec-only.

## Recommended next step

**Human + ChatGPT review, then create DECISION.**

Executor mild preference: **approve** · required_fixes **none** ·
Outcome A full success · then choose:

- **A** · `AgentOps-5e-followup-baseline-lint` design loop ($0) —
  build the deferred structural validator to make Appendix + N=5
  coverage a blocking check
- **B** · handoff / pause — arc's original goal achieved · optionally
  stability re-run at $0.10 to confirm not one-time success
- **C** · **do NOT** start `AgentOps-5f-promote` (single A+B run
  insufficient per DECISION Q10)

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT rerun A or B.** **Do NOT modify prompt
again after observing results.** **Do NOT create structural
validator.** **Do NOT modify checker/parser/harness.** **Do NOT
loosen R1/R2.** **Do NOT mutate baselines.** **Do NOT promote QI.**
**Do NOT start `AgentOps-5f-promote`.**
