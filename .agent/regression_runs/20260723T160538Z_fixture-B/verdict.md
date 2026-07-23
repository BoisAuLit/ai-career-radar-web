# Verdict · 20260723T160538Z_fixture-B

- **Verdict**: **GREEN**
- **Exit code**: 0
- **Fixture**: B (v1)
- **Duration**: 65430 ms
- **Capture scope**: `main section` (strategy=`shortest-qualified-candidate`, fallback=false)
- **Report length (selected scope)**: 9701 chars
- **Page body length**: 16301 chars
- **Candidates scanned / qualified**: 8 / 2
- **Commit**: c9c0eabb26e18be95e18fd76747e76560edd70f6
- **Corpus snapshot**: May 14, 2026
- **Model**: Claude Sonnet 4.6

## Red checks failed

_none_

## Amber checks failed

_none_

## Quote integrity

- **Verdict**: **RED**
- **Summary**: `.agent/regression_runs/20260723T160538Z_fixture-B/quote_integrity_summary.json`
- **Red reasons**: 1
- **Amber reasons**: 2
- **Blocking mode**: `telemetry_only` — telemetry only in this integration loop; does not change the report-regression GREEN/AMBER/RED exit code. Promoting to blocking requires a separate DECISION.

## Network diagnostics

- **Completion state**: `success`
- **Elapsed to completion**: 64072 ms
- **Diagnostics**: `.agent/regression_runs/20260723T160538Z_fixture-B/network_diagnostics.json`
- **First non-2xx**: _none_
- **Application error detected**: no
- **Visible error excerpt**: _none_
- **Thresholds**: unchanged (`HARD_LATENCY_MS=240000`, `SOFT_LATENCY_MS=120000`)

## Artifacts

- Committed: `.agent/regression_runs/20260723T160538Z_fixture-B/{metadata.json,structural_checks.json,verdict.md,quote_integrity_summary.json,network_diagnostics.json}`
- Scratchpad: `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260723T160538Z_fixture-B/report.md`, `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260723T160538Z_fixture-B/report.png`
