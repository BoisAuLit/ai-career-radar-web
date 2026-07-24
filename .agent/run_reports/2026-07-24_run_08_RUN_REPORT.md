# RUN REPORT · AgentOps-5e-followup-baseline-lint-integrate-phase3-design · Phase 3 controlled A/B validation design

## Metadata

- **task_id**: `2026-07-24_run_08`
- **date**: `2026-07-24`
- **run_number**: `08`
- **branch**: `main` (design-only; no branch created)
- **loop**: AgentOps-5e-followup-baseline-lint-integrate-phase3-design
- **parent_loop**: AgentOps-5e-followup-baseline-lint-integrate-implement (`2026-07-24_run_07`)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_07_DECISION.md`
- **task_path**: `.agent/tasks/2026-07-24_run_08_TASK.md`
- **findings_path**: `.agent/findings/2026-07-24_structural_phase3_validation_plan.json`
- **memo_path**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-phase3-design.md`
- **impl_commit**: pending (design bundle + this RUN_REPORT)

## Commits

Pending. This turn will produce two commits:

- `<hash1>` Design structural telemetry Phase 3 validation (TASK + findings + memo)
- `<hash2>` Add RUN_REPORT 2026-07-24_run_08

## Regression verdict

- **regression_required**: **no**
- **reason_required_or_not**: Phase 3 controlled validation design
  only; no generation, no implementation, no baseline mutation, no
  runtime behavior change.
- **harness_used**: **no**
- **harness_command**: not_run
- **fixture_ids**: none (design only; future runs specify A and B)
- **target_environment**: local design inspection
- **latest_run_id**: `not_applicable`
- **verdict**: `not_required`
- **exit_code**: `not_applicable`
- **artifact_paths**:
  - `.agent/tasks/2026-07-24_run_08_TASK.md`
  - `.agent/findings/2026-07-24_structural_phase3_validation_plan.json`
  - `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-phase3-design.md`
  - `.agent/run_reports/2026-07-24_run_08_RUN_REPORT.md`
- **report_char_count**: `not_applicable`
- **capture_scope**: `not_applicable`
- **fallback_used**: `not_applicable`
- **red_checks_failed**: `not_applicable`
- **amber_checks_failed**: `not_applicable`
- **cost_measured**: **true**
- **estimated_cost**: **$0** (this loop is design-only)
- **future_phase3_estimated_cost**: **~$0.10**
- **future_phase3_hard_cap**: **$0.15 total** · $0.075 per run
- **duration_ms**: `not_applicable`
- **baseline_promoted**: **no**
- **production_target_used**: **no**
- **reviewer_action_required**: human + ChatGPT review, then DECISION,
  then **separate explicit cost-approved GO** for Phase 3 execution.
- **push_implication**: no push until DECISION.

## TASK

`.agent/tasks/2026-07-24_run_08_TASK.md` — objective: design (not run)
two-run controlled A/B validation of Phase 2 harness integration with
explicit cost, stop conditions, artifact matrix, acceptance criteria,
retention policy, and future RUN_REPORT / DECISION requirements. $0.

## Findings

`.agent/findings/2026-07-24_structural_phase3_validation_plan.json`
(schema `0.1-design`) — 12 top-level keys covering objective ·
run_count · fixtures · commands · cost_envelope · stop_conditions ·
expected_artifacts · acceptance_criteria (5 sub-blocks) ·
comparison_fields · post_run_review · retention_policy ·
future_run_report_requirements · future_decision_outcomes ·
policy_resolutions (Q1-Q20) · risks · open_questions ·
boundaries_respected.

## Design memo

`.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-phase3-design.md`
— 34 sections covering purpose · background · Phase 2 final state ·
scope · out-of-scope · Phase 3 objective · run count · fixture
selection · exact commands · cost envelope · stop conditions ·
artifact matrix · legacy / QI / structural / combined acceptance ·
integration success criteria · product-vs-integration failure
distinction · A/B comparison · capture / metadata / verdict.md review
· error handling · no-retry policy · retention policy · future
RUN_REPORT / DECISION · no-promotion policy · rollout boundaries ·
Q1-Q20 policy resolutions · risks · open questions · recommendations
· boundaries respected.

## Exact future run count

- **2 paid generations total** (Fixture A × 1 + Fixture B × 1)
- **0 retries** (automatic or manual)
- **0 additional fixtures** (no C / D / E)
- **0 paid debug generations**
- **0 third validation runs** in the same approval

## Fixtures

- **A** — `.agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md` (primary: Backend → Applied AI)
- **B** — `.agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md` (secondary: Fullstack → AI product)

Both already registered in `FIXTURE_TABLE` (harness lines 53-74).

## Exact future commands

**Prerequisite** (separate terminal):

```
cd /Users/bohaoli/Desktop/ai-career-radar-web
npm run dev   # wait for `Ready in Xms`
```

**Run A** (foreground):

```
cd /Users/bohaoli/Desktop/ai-career-radar-web
node scripts/report-regression-local.mjs --fixture A
```

**Run B** (foreground, only after A completes and stop conditions checked):

```
cd /Users/bohaoli/Desktop/ai-career-radar-web
node scripts/report-regression-local.mjs --fixture B
```

**No new flags. No env-var toggles. No custom output paths.**

## Cost estimate and cap

- **Expected total**: **~$0.10** (Sonnet 4.6 via existing app path)
- **Expected per run**: **~$0.05**
- **Hard per-run cap**: **$0.075**
- **Hard total cap**: **$0.15**
- **No paid debug calls · no OpenAI · no additional provider.**
- Cost measurement: runtime cost accounting where available; otherwise external ledger entry attached to Phase 3 RUN_REPORT.
- Cap-exceeded → stop · do not continue to B · do not retry · surface actual usage · DECISION = `revise` or `pause`.

## Stop conditions

14 items (see memo § 11 / findings `stop_conditions[]`):

- external generation failure · legacy checks[] shape change · structural result in `classify()` · process-exit semantics change · baseline file change · report.md rewrite · unexpected paid retry · per-run cost cap exceeded · total projected cost cap exceeded · provider 4xx/5xx with unclear cost · structural summary schema failure · missing/malformed `metadata.combined_telemetry` · `affected_legacy_verdict !== false` · any forbidden file changed.

## Expected artifacts (7 per run)

1. `metadata.json` (with `structural_evidence` + `combined_telemetry` blocks)
2. `verdict.md` (4 sibling sections with required wording)
3. `structural_checks.json` (legacy 25-check list only)
4. `quote_integrity_summary.json`
5. `structural_evidence_summary.json`
6. `structural_evidence_context.json` (schema `0.1-phase2`)
7. `network_diagnostics.json`

Scratchpad-only (never committed): `report.md`, `report.png`.

## Acceptance criteria

- **Legacy**: verdict from `classify(checks)` only · legacy checks[] unchanged · process exit only from legacy classification · no telemetry in checks[].
- **QI**: `quote_integrity_summary.json` exists · QI verdict recorded · `blocking_mode = telemetry_only` · R1/R2 unchanged · no legacy effect.
- **Structural**: `structural_evidence_summary.json` + context exist · `checker_hash` valid SHA-256 · verdict in expected set · exit ↔ verdict cross-check honored · `blocking_mode = telemetry_only` · `affected_legacy_verdict = false`.
- **Combined**: precedence `tool_error > red > amber > not_evaluable > green` · `display_only = true` · `affected_legacy_verdict = false` · `affected_process_exit = false` · never in checks[] · verdict.md does not hide RED.
- **Integration**: both runs meet integration.pass_requires_both_runs (14 items).

## Integration-success definition

Both runs meet the 14-item `acceptance_criteria.integration.pass_requires_both_runs` list.

## Product-failure vs integration-failure distinction

**Product failure** (structural RED/AMBER, QI RED, missing sections in
the generated report) is a **valid signal** that the underlying report
generator has quality issues. It does NOT fail Phase 3 integration
provided:

- The signal is accurately reflected in metadata + verdict.md.
- The signal remains visible (not masked as GREEN or not_evaluable).
- The signal does not alter legacy verdict or process exit.
- All 7 artifacts are internally consistent.

**Integration failure** occurs only when the harness/helper/validator
subsystem itself misbehaves (see memo § 18 for the 11-item list).

## A/B comparison fields

25 fields (see findings `comparison_fields[]`): duration ·
report_char_count · capture scopes · fallback_used · capture_complete
· all four verdicts (legacy, QI, structural, combined) · process exit
· citation counts · gap coverage · Appendix consistency · structural
reasons lists · structural tool_error · measured cost per run + total.

## Retention policy

- 7 governance artifacts per run committed under `.agent/regression_runs/<run-id>/`.
- `report.md` + `report.png` stay in `$TMPDIR/acr-regression-runs/<run-id>/` (never committed).
- No baseline promotion · no baseline copy · no proprietary content in governance.

## Future RUN_REPORT requirements

21 required items (see findings `future_run_report_requirements[]`):
cost approval reference · exact commands as run · both run IDs · total
API cost · no-retry confirmation · duration/exit/legacy/QI/structural/
combined verdict per run · capture context per run · 7×2 artifact
matrix · metadata + verdict.md consistency · 0-line baseline diff ·
per-run SHA-256 checker_hash · per-run harness git SHA · no-report-
rewrite confirmation · integration pass/fail per run + overall ·
anomalies · recommended next step.

## Future DECISION outcomes

- **`approve`** — integration correct on both runs · no defect · no
  legacy/process-exit coupling · cost within cap · no forbidden file
  mutated. **Does NOT auto-authorize Phase 4/5/6/blocking/5f-promote.**
- **`revise`** — integration defect (metadata inconsistency ·
  capture-context error · tool-error handling defect · masking ·
  unexpected retry · cost issue).
- **`pause`** — external outage or app failure prevents meaningful
  evaluation · results insufficient but no clear defect.

## No-promotion policy

Explicit restatement (from run_06 + run_07 DECISIONs): a successful
Phase 3 authorizes only controlled evidence for a future DECISION. It
does NOT authorize baseline migration (Phase 4), structural lint
blocking mode (Phase 6), QI blocking mode, baseline eligibility
changes, Phase 5 stability runs, `AgentOps-5f-promote`, or auto-
approval of additional paid runs.

## Policy resolutions (Q1-Q20)

- **Q1** 2 paid runs · **Q2** A + B (no C/D/E) · **Q3** no retry · **Q4** ~$0.10 · **Q5** $0.15 hard cap ($0.075/run) · **Q6** 14 stop conditions · **Q7** `node scripts/report-regression-local.mjs --fixture A|B` + `npm run dev` prereq · **Q8** 14-item integration success · **Q9** structural RED does NOT fail Phase 3 (product-quality signal) · **Q10** QI AMBER does NOT fail Phase 3 · **Q11** telemetry does NOT affect legacy verdict · **Q12** telemetry does NOT affect process exit · **Q13** no baseline change · **Q14** no report rewrite · **Q15** 7 governance artifacts committed; report.md + screenshot scratchpad only · **Q16** does NOT authorize Phase 4 · **Q17** does NOT authorize blocking · **Q18** does NOT authorize 5f-promote · **Q19** A external failure → do not retry, do not run B, DECISION = pause/revise · **Q20** cost cap exceeded → stop, do not continue B, DECISION = revise/pause.

## No generation

- No browser launched. No dev server started. No Playwright invoked.
- No LLM/API call. No Anthropic. No OpenAI.
- No report generation. No fixture run.

## No paid call

- $0 incremental this turn.
- Zero paid generation authorized in this loop.

## No code changes

- `scripts/**` unchanged.
- `src/**` unchanged.
- `.agent/scripts/**` unchanged.
- Prompts unchanged.
- Tests unchanged.

## No baseline mutation

- `.agent/regression_baselines/**` unchanged.
- `.agent/regression_runs/**` unchanged.
- `.agent/regression_fixtures/**` unchanged.

## Cost $0 for this loop

## Recommended next step

**Human + ChatGPT review** memo (34 sections) + findings JSON + this
RUN_REPORT. If aligned, say **"create DECISION for
AgentOps-5e-followup-baseline-lint-integrate-phase3-design"** →
executor writes DECISION (mild preference: `approve` design ·
`required_fixes: none` · `human_approval_needed: yes`; grants Phase 3
plan approval but explicitly does NOT release Phase 3 execution
without a **separate cost-approved human GO**).

After the Phase 3 design DECISION lands, a **separate turn** with
explicit cost approval will:

1. `npm run dev` in a separate terminal
2. `node scripts/report-regression-local.mjs --fixture A`
3. Check stop conditions
4. `node scripts/report-regression-local.mjs --fixture B`
5. Author Phase 3 RUN_REPORT
6. Author Phase 3 DECISION

**Do NOT** in this loop or the Phase 3 design DECISION loop: run
Fixture A · run Fixture B · start dev server · make any paid call ·
mutate baselines · promote structural or QI telemetry · start Phase
4 / Phase 5 / Phase 6 / `AgentOps-5f-promote`.

## Alternatives

- Revise: adjust cost cap · adjust stop conditions · fold in a
  third fixture or a controlled dry-run capture (`completion_state`
  probe without paid API — would require harness changes and is
  therefore explicitly out of scope for this design).
- Handoff / pause.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.** **Do
NOT push.** **Do NOT run A/B.** **Do NOT make any paid API call.** **Do
NOT mutate baselines.** **Do NOT promote anything.** **Do NOT start
Phase 4.** **Do NOT start `AgentOps-5f-promote`.**
