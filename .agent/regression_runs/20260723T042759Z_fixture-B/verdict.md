# Verdict · 20260723T042759Z_fixture-B

- **Verdict**: **RED**
- **Exit code**: 1
- **Fixture**: B (v1)
- **Duration**: 240992 ms
- **Capture scope**: `unset` (strategy=`unset`, fallback=false)
- **Report length (selected scope)**: 0 chars
- **Page body length**: 0 chars
- **Candidates scanned / qualified**: 0 / 0
- **Commit**: 0678b5b5377c1dd61e630f0490bfbd8cf8898145
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
- `duration_under_hard_threshold` (operational) — duration_ms=240992 hard=240000

## Amber checks failed

- `report_length_in_soft_band` (structural) — chars=0 band=1500-14000
- `action_bar_buttons_present` (structural) — Copy report=false; Download=false; Eval this report=false; Start over=true
- `at_least_2_strengths_reflected` (fixture) — hits=0/5
- `at_least_2_gaps_reflected` (fixture) — hits=0/5
- `recommendation_roughly_matches_expected` (fixture) — keywords=[agent,tool call,tool-call,eval,telemetry] hits=[]
- `duration_under_soft_threshold` (operational) — duration_ms=240992 soft=120000
- `quote_integrity_checker_executed` (quote_integrity) — mode=telemetry_only verdict=blocked_no_report
- `quote_integrity_summary_written` (quote_integrity) — .agent/regression_runs/20260723T042759Z_fixture-B/quote_integrity_summary.json

## Quote integrity

- **Verdict**: **BLOCKED_NO_REPORT**
- **Summary**: `.agent/regression_runs/20260723T042759Z_fixture-B/quote_integrity_summary.json`
- **Red reasons**: 0
- **Amber reasons**: 0
- **Blocking mode**: `telemetry_only` — telemetry only in this integration loop; does not change the report-regression GREEN/AMBER/RED exit code. Promoting to blocking requires a separate DECISION.

## Artifacts

- Committed: `.agent/regression_runs/20260723T042759Z_fixture-B/{metadata.json,structural_checks.json,verdict.md,quote_integrity_summary.json}`
- Scratchpad: `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260723T042759Z_fixture-B/report.md`, `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260723T042759Z_fixture-B/report.png`
