# Verdict · 20260724T193349Z_fixture-B

- **Verdict**: **RED**
- **Exit code**: 1
- **Fixture**: B (v1)
- **Duration**: 4778 ms
- **Capture scope**: `unset` (strategy=`unset`, fallback=false)
- **Report length (selected scope)**: 0 chars
- **Page body length**: 0 chars
- **Candidates scanned / qualified**: 0 / 0
- **Commit**: f073c4f46ec2e6ae0186bd7d249bd51d5ddbd3b5
- **Corpus snapshot**: May 14, 2026
- **Model**: Claude Sonnet 4.6

## Red checks failed

- `done_state_reached` (structural)
- `report_non_empty` (structural)
- `report_text_capture_success` (structural) — scope=unset strategy=unset candidates=0 qualified=0
- `contains_section_target_role` (structural)
- `contains_section_what_you_already_have` (structural)
- `contains_section_top_5_gaps` (structural)
- `contains_section_over-prioritizing` (structural)
- `contains_section_highest-leverage_next_action` (structural)
- `contains_evidence_appendix` (structural)

## Amber checks failed

- `report_length_in_soft_band` (structural) — chars=0 band=1500-14000
- `action_bar_buttons_present` (structural) — Copy report=false; Download=false; Eval this report=false; Start over=true
- `at_least_2_strengths_reflected` (fixture) — hits=0/5
- `at_least_2_gaps_reflected` (fixture) — hits=0/5
- `recommendation_roughly_matches_expected` (fixture) — keywords=[agent,tool call,tool-call,eval,telemetry] hits=[]
- `quote_integrity_checker_executed` (quote_integrity) — mode=telemetry_only verdict=blocked_no_report
- `quote_integrity_summary_written` (quote_integrity) — .agent/regression_runs/20260724T193349Z_fixture-B/quote_integrity_summary.json

## Legacy regression verdict

- **Verdict**: **RED** (source of truth for process exit)
- **Exit code**: 1
- Telemetry sections below (quote integrity, structural evidence, combined) do NOT affect this verdict.

## Quote integrity telemetry

- **Verdict**: **BLOCKED_NO_REPORT**
- **Summary**: `.agent/regression_runs/20260724T193349Z_fixture-B/quote_integrity_summary.json`
- **Red reasons**: 0
- **Amber reasons**: 0
- **Blocking mode**: `telemetry_only` — telemetry only in this integration loop; does not change the report-regression GREEN/AMBER/RED exit code. Promoting to blocking requires a separate DECISION.
- Quote-integrity telemetry does NOT affect the legacy verdict.

## Structural evidence telemetry

- **Verdict**: **NOT_RUN**
- **Evaluation status**: `not_run`
- **Exit code**: _null_
- **Duration**: 0 ms
- **Checker hash**: `_none_`
- **Summary**: `_none_`
- **Context**: `_none_`
- **Capture scope**: `unset` → context.`main section` · **capture_complete**: false · **fallback_used**: false
- **Red reasons**: 0
- **Amber reasons**: 0
- **Not-evaluable reasons**: 1 — report_md_not_saved
- **Tool error**: _none_
- **Blocking mode**: `telemetry_only` — Structural-evidence telemetry does NOT affect the legacy verdict.
- A RED telemetry state MUST remain visibly RED even when the legacy verdict is GREEN.

## Combined telemetry

- **Combined verdict**: **NOT_EVALUABLE**
- **Display only**: yes — combined telemetry is display-only.
- Combined telemetry does NOT affect the legacy verdict.
- Combined telemetry does NOT affect the harness process exit.
- Do NOT describe the overall run simply as GREEN when telemetry contains RED.

## Network diagnostics

- **Completion state**: `application_error`
- **Elapsed to completion**: 3840 ms
- **Diagnostics**: `.agent/regression_runs/20260724T193349Z_fixture-B/network_diagnostics.json`
- **First non-2xx**: `http://localhost:3000/api/classify` (status 502, elapsed_ms=4561)
- **Application error detected**: yes
- **Visible error excerpt**: `nce × proximity to your current resume. 3 Evidence from real JDs Direct quotes from five matching job posts, with company + ID tags. 4 One project to build next Single highest-leverage deliverable, time-bounded, named tools. + Optional company deep-dive Contrast a specific company's JDs against the industry baseline. Something went wrong Please try again. The raw error is below for debugging. ↻ Retry ↺ Start over Show raw error (for debugging) How it wor`
- **Thresholds**: unchanged (`HARD_LATENCY_MS=240000`, `SOFT_LATENCY_MS=120000`)

## Artifacts

- Committed: `.agent/regression_runs/20260724T193349Z_fixture-B/{metadata.json,structural_checks.json,verdict.md,network_diagnostics.json}`
- Scratchpad: `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260724T193349Z_fixture-B/report.md`, `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260724T193349Z_fixture-B/report.png`
