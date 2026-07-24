# Verdict · 20260724T040011Z_fixture-A

- **Verdict**: **GREEN**
- **Exit code**: 0
- **Fixture**: A (v1)
- **Duration**: 67442 ms
- **Capture scope**: `main section` (strategy=`shortest-qualified-candidate`, fallback=false)
- **Report length (selected scope)**: 10146 chars
- **Page body length**: 16831 chars
- **Candidates scanned / qualified**: 9 / 2
- **Commit**: 710cc3d283fc5cdf83b75ced83d3ef48d38cd034
- **Corpus snapshot**: May 14, 2026
- **Model**: Claude Sonnet 4.6

## Red checks failed

_none_

## Amber checks failed

_none_

## Quote integrity

- **Verdict**: **AMBER**
- **Summary**: `.agent/regression_runs/20260724T040011Z_fixture-A/quote_integrity_summary.json`
- **Red reasons**: 0
- **Amber reasons**: 2
- **Blocking mode**: `telemetry_only` — telemetry only in this integration loop; does not change the report-regression GREEN/AMBER/RED exit code. Promoting to blocking requires a separate DECISION.

## Network diagnostics

- **Completion state**: `success`
- **Elapsed to completion**: 66127 ms
- **Diagnostics**: `.agent/regression_runs/20260724T040011Z_fixture-A/network_diagnostics.json`
- **First non-2xx**: _none_
- **Application error detected**: no
- **Visible error excerpt**: _none_
- **Thresholds**: unchanged (`HARD_LATENCY_MS=240000`, `SOFT_LATENCY_MS=120000`)

## Artifacts

- Committed: `.agent/regression_runs/20260724T040011Z_fixture-A/{metadata.json,structural_checks.json,verdict.md,quote_integrity_summary.json,network_diagnostics.json}`
- Scratchpad: `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260724T040011Z_fixture-A/report.md`, `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260724T040011Z_fixture-A/report.png`
