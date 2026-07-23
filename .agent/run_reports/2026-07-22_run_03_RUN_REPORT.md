# RUN REPORT · AgentOps-5d · Controlled A + B generation with quote-integrity checker attached

## Metadata

- **task_id**: `2026-07-22_run_03`
- **date**: 2026-07-22 (executor turn spanned into 2026-07-23 UTC)
- **loop**: AgentOps-5d
- **parent_loop**: AgentOps-5c-integrate (`2026-07-22_run_02`)
- **prior_decisions**:
  - `.agent/decisions/2026-07-21_run_01_DECISION.md` (5a approve)
  - `.agent/decisions/2026-07-21_run_02_DECISION.md` (5b approve · 5c refinements)
  - `.agent/decisions/2026-07-21_run_03_DECISION.md` (5c approve · R1 keep RED · R2 approve)
  - `.agent/decisions/2026-07-22_run_01_DECISION.md` (5d-R2 approve · R2 ships)
  - `.agent/decisions/2026-07-22_run_02_DECISION.md` (5c-integrate approve · telemetry-only locked)
- **task_path**: `.agent/tasks/2026-07-22_run_03_TASK.md`
- **findings_memo_path**: `.agent/design_memos/2026-07-22_AgentOps-5d_controlled_AB_generation_with_quote_integrity.md`
- **impl_commit**: `262591d` (Run controlled AB quote integrity regression)
- **A_run_id**: `20260723T035644Z_fixture-A`
- **A_artifact_dir**: `.agent/regression_runs/20260723T035644Z_fixture-A/`
- **B_run_id**: `20260723T035828Z_fixture-B`
- **B_artifact_dir**: `.agent/regression_runs/20260723T035828Z_fixture-B/`

## Regression verdict

- **regression_required**: yes
- **reason_required_or_not**: controlled generated regression to
  validate quote-integrity harness-envelope integration in-situ
- **harness_used**: yes
- **harness_command**:
  - `node scripts/report-regression-local.mjs --fixture A`
  - `node scripts/report-regression-local.mjs --fixture B`
- **fixture_ids**: `A`, `B`
- **target_environment**: local (`http://localhost:3000` via `npm run dev`)
- **latest_run_id**:
  - A: `20260723T035644Z_fixture-A`
  - B: `20260723T035828Z_fixture-B`
- **verdict**:
  - **legacy report regression A**: **GREEN** (exit 0)
  - **legacy report regression B**: **RED** (exit 1) — generation
    timed out at harness hard threshold (241 s vs 240 s hard)
  - **`quote_integrity_verdict` A**: **`red`** (telemetry-only)
  - **`quote_integrity_verdict` B**: **`blocked_no_report`**
    (wrapper failure-handling path)
- **exit_code**: A = 0 · B = 1
- **artifact_paths**:
  - `.agent/regression_runs/20260723T035644Z_fixture-A/{metadata.json,structural_checks.json,verdict.md,quote_integrity_summary.json}`
  - `.agent/regression_runs/20260723T035828Z_fixture-B/{metadata.json,structural_checks.json,verdict.md}` (no `quote_integrity_summary.json` · correct per wrapper failure-handling)
  - `.agent/design_memos/2026-07-22_AgentOps-5d_controlled_AB_generation_with_quote_integrity.md`
- **report_char_count**: A = **11 341** · B = **0**
- **capture_scope**: A = `main section` · B = `unset`
- **fallback_used**: A = false · B = false
- **red_checks_failed** (legacy only):
  - A: **_none_**
  - B: `done_state_reached` · `report_non_empty` · `report_text_capture_success` · `contains_section_target_role` · `contains_section_what_you_already_have` · `contains_section_top_5_gaps` · `contains_section_over-prioritizing` · `contains_section_highest-leverage_next_action` · `contains_evidence_appendix` · `duration_under_hard_threshold`
- **amber_checks_failed** (legacy only):
  - A: **_none_**
  - B: `report_length_in_soft_band` · `action_bar_buttons_present` · `at_least_2_strengths_reflected` · `at_least_2_gaps_reflected` · `recommendation_roughly_matches_expected` · `duration_under_soft_threshold`
- **quote_integrity red reasons** (separately):
  - A: `Evidence Appendix missing while report contains evidence/citation language` · `cited in evidence but missing from appendix: jd_000347, jd_000089, jd_000042, jd_000173`
  - B: none (checker did not run · `blocked_no_report`)
- **quote_integrity amber reasons** (separately):
  - A: `terminal-punctuation-only match for jd_000089` · `terminal-punctuation-only match for jd_000173`
  - B: none (checker did not run · `blocked_no_report`); the 2 amber
    `quote_integrity_*` structural checks that failed are
    `quote_integrity_checker_executed` and
    `quote_integrity_summary_written`, both correct given the
    missing report
- **cost_measured**: false
- **estimated_cost**: **~$0.05-$0.10** (A: ~$0.05, B: ~$0.02-$0.05)
- **duration_ms**: A = 76 444 · B = 240 964
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Did Fixture A pass artifact checks?

**Yes.** All 20 required post-A checks passed (see findings memo §5
for the full table). Legacy verdict GREEN with 0 red / 0 amber
under the 25-check envelope. `metadata.quote_integrity` populated,
`quote_integrity_summary.json` written (~4.8 KB · v0.3), 5
`bucket: "quote_integrity"` structural entries added, `verdict.md`
`## Quote integrity` section present with explicit
`telemetry_only` prose. `report.md` and screenshots stayed
scratchpad-only.

## Was Fixture B run?

**Yes.** Since Fixture A passed the required artifact checks per
the DECISION-approved stop rule, Fixture B was invoked.

## Did Fixture B pass artifact checks?

**Partially, and honestly.** The wrapper's **failure-handling
path** worked exactly as designed. Fixture B's generation timed out
before producing a report, so:

- Legacy 25-check verdict: **RED** (exit 1) driven by structural
  reds + operational hard-threshold. Not caused by quote-integrity
  in any way.
- Wrapper detected `reportSaved=false` and correctly returned
  `verdict: "blocked_no_report"` with `schema_version=null`, empty
  counts, empty reasons.
- `quote_integrity_summary.json` was NOT written — this is
  **correct per the 5c-integrate failure-handling spec** (when
  there is no report, the wrapper short-circuits and does not
  invoke the checker).
- `metadata.quote_integrity.enabled=true`,
  `blocking_mode="telemetry_only"`,
  `verdict="blocked_no_report"` — all present and correct.
- 5 `bucket: "quote_integrity"` structural entries present, all
  `level: "amber"`. Two of them (`checker_executed`,
  `summary_written`) pass=false, as expected.
- `verdict.md` `## Quote integrity` section present with verdict
  `BLOCKED_NO_REPORT` and the same telemetry-only prose.

The only cosmetic inaccuracy: `verdict.md`'s `## Artifacts` line
lists `quote_integrity_summary.json` in the committed set even
though B did not write one. Documented; suggested as a cosmetic
follow-up.

## Legacy regression verdicts

- **A**: GREEN · exit 0.
- **B**: RED · exit 1.

## `quote_integrity_verdict`s

- **A**: `red` (telemetry-only).
- **B**: `blocked_no_report` (wrapper failure-handling path).

## `quote_integrity_summary` paths

- **A**: `.agent/regression_runs/20260723T035644Z_fixture-A/quote_integrity_summary.json`
  (~4 800 B · schema `0.3-r2-terminal-punctuation`)
- **B**: intentionally not written (blocked_no_report)

## `metadata.quote_integrity` block verification

Verified for both runs — see findings memo §5 (A) and §11 (B).
Both blocks include `enabled: true`, `blocking_mode:
"telemetry_only"`, and a well-formed `verdict`. A's block includes
14-key `counts`, 2 `red_reasons`, 2 `amber_reasons`. B's block is
correctly minimal for `blocked_no_report`.

## `structural_checks.json` `quote_integrity` bucket verification

Verified for both runs. Both include 5
`bucket: "quote_integrity"` entries at `level: "amber"`
(`checker_executed`, `summary_written`, `verdict_recorded`,
`red_reasons_count`, `amber_reasons_count`). Legacy classify()
rollup unaffected.

## `verdict.md` `## Quote integrity` section verification

Present and correct in both A (`RED`) and B (`BLOCKED_NO_REPORT`).
Both include the explicit `telemetry_only` prose stating that
promoting to blocking requires a separate DECISION.

## Telemetry-only behavior confirmation

**Confirmed.** Both runs are proof-by-contradiction:

- A: legacy GREEN despite quote_integrity `red` → telemetry-only
  respected.
- B: legacy RED driven entirely by structural + operational
  legacy checks; the two amber `quote_integrity_*` failures did
  not escalate the rollup or affect exit code.

## Did quote_integrity RED affect exit code?

**No.** On Fixture A, exit code was 0 despite `quote_integrity_verdict
= "red"`. On Fixture B, exit code was 1 because of legacy structural
reds, not because of `quote_integrity_verdict`.

## Cost estimate

**~$0.05-$0.10 Anthropic** total (two real generations, one partial
due to hard-threshold timeout). Within the DECISION-approved
envelope.

## Validation results

Impl commit `262591d` staged exactly the expected files (9 files
across 2 run directories + TASK + memo). No forbidden files staged.
Web `main` was clean pre-impl (aligned with `origin/main` at
`5918580`); after impl commit, ahead by 1. Pipeline `HEAD` unchanged
at `b019786` throughout. Both prior 5c and 5d-R2 quote-integrity
artifacts remain frozen and unchanged.

## Forbidden-file audit · all clean

| target | status |
|---|---|
| `src/**` | ✅ untouched |
| `scripts/report-regression-local.mjs` | ✅ untouched (unchanged since 5c-integrate) |
| `scripts/quote-integrity-check.mjs` | ✅ untouched (unchanged since 5d-R2) |
| `.agent/scripts/**` | ✅ untouched (hard rule) |
| `.agent/regression_baselines/**` | ✅ untouched (A + B grandfathered) |
| `.agent/regression_fixtures/**` | ✅ untouched |
| Prior `.agent/regression_runs/**` entries | ✅ untouched |
| 5c artifact `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/**` | ✅ frozen |
| 5d-R2 artifact `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/**` | ✅ frozen |
| 5c-integrate artifact `.agent/quote_integrity_runs/20260722T_AGENTOPS5C_INTEGRATE_fixture-B/**` | ✅ frozen |
| pipeline any file | ✅ untouched (`b019786` 起终一致) |
| `.github/workflows/**` | ✅ untouched |
| `package.json` / `package-lock.json` | ✅ untouched |
| `.env*` | ✅ not read by this script (dev server reads at startup) |
| `vercel.json` | ✅ untouched |
| Codex / Claude config | ✅ untouched |
| Uploaded 20 PDFs | ✅ not ingested |
| `report.md` / `*.png` committed | ✅ none (scratchpad-only) |
| Full report body / long quote excerpts committed | ✅ none |

## Confirmations

- **No baseline mutation** ✅ (A + B `current` unchanged)
- **No baseline promotion** ✅
- **No C/D/E** ✅
- **No A-E full suite** ✅
- **No uploaded PDFs** ✅
- **No OpenAI API** ✅ (BLK-0003 unchanged)
- **No LLM judge** ✅
- **No edit-distance** ✅
- **No production target** ✅
- **No pipeline changes** ✅ (`b019786` 起终一致)
- **No push** (waiting on DECISION) ✅
- **No manual deploy** ✅
- **Quote-integrity remained telemetry-only** ✅
- BLK-0001 / BLK-0002 / BLK-0003 remain `open` ✅
- QUEUE-0002 G2.1d remains `blocked_pending_human` ✅
- Q10 pause unchanged ✅
- Codex planner remains spec-only ✅
- `.agent/planner_reports/` remains empty ✅
- **Cost**: ~**$0.05-$0.10 Anthropic** ✅
- **Wrapper worked in-situ**: ✅ on both A (checker executed successfully) and B (blocked_no_report path taken correctly)
- **Preflight accidental Fixture A run**: cleaned up via `rm -rf`, never committed. Documented in findings memo §14.

## Recommendation

**Human + ChatGPT review** the findings memo (22 sections) + this
RUN_REPORT + the two committed run directories. Then write DECISION
for `2026-07-22_run_03`. Recommended DECISION posture: **approve**.
Required fixes: **none**.

Recommended next loop:

- **AgentOps-5d-stability** — one more Fixture A + one more Fixture B
  controlled run to check whether the Fixture B generation timeout
  was one-off or reproducible. Cost ~$0.10. No baseline mutation.
  Telemetry-only preserved.

Later loops (in preferred order):

- **AgentOps-5d-cosmetic** — small harness UX fixes: `--help`
  short-circuit · `## Artifacts` list only actually-written files.
  $0. No generation.
- **AgentOps-5e** — decide whether to fold `quote_integrity_*`
  fields into baseline metadata schema.
- **AgentOps-5f-promote** — promote quote-integrity to blocking
  (start narrow: one structural check at `level: "red"`).

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT promote baselines.** **Do NOT start
5d-stability.** **Do NOT run harness generation again.** **Do NOT
call Anthropic/OpenAI.**
