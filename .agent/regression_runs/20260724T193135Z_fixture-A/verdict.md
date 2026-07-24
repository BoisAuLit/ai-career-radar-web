# Verdict · 20260724T193135Z_fixture-A

- **Verdict**: **GREEN**
- **Exit code**: 0
- **Fixture**: A (v1)
- **Duration**: 64535 ms
- **Capture scope**: `main section` (strategy=`shortest-qualified-candidate`, fallback=false)
- **Report length (selected scope)**: 9339 chars
- **Page body length**: 16047 chars
- **Candidates scanned / qualified**: 9 / 2
- **Commit**: f073c4f46ec2e6ae0186bd7d249bd51d5ddbd3b5
- **Corpus snapshot**: May 14, 2026
- **Model**: Claude Sonnet 4.6

## Red checks failed

_none_

## Amber checks failed

_none_

## Legacy regression verdict

- **Verdict**: **GREEN** (source of truth for process exit)
- **Exit code**: 0
- Telemetry sections below (quote integrity, structural evidence, combined) do NOT affect this verdict.

## Quote integrity telemetry

- **Verdict**: **AMBER**
- **Summary**: `.agent/regression_runs/20260724T193135Z_fixture-A/quote_integrity_summary.json`
- **Red reasons**: 0
- **Amber reasons**: 1
- **Blocking mode**: `telemetry_only` — telemetry only in this integration loop; does not change the report-regression GREEN/AMBER/RED exit code. Promoting to blocking requires a separate DECISION.
- Quote-integrity telemetry does NOT affect the legacy verdict.

## Structural evidence telemetry

- **Verdict**: **RED**
- **Evaluation status**: `completed`
- **Exit code**: 1
- **Duration**: 26 ms
- **Checker hash**: `sha256:eb6193d9ea677cd8d5a6ca708b45b8b77480f38d30b8be17e23059bddf53cc73`
- **Summary**: `.agent/regression_runs/20260724T193135Z_fixture-A/structural_evidence_summary.json`
- **Context**: `.agent/regression_runs/20260724T193135Z_fixture-A/structural_evidence_context.json`
- **Capture scope**: `main section` → context.`main section` · **capture_complete**: true · **fallback_used**: false
- **Red reasons**: 3 — gap_section_missing_or_unrecognized; citation_line_count=0_lt_5; evidence_appendix_missing
- **Amber reasons**: 0
- **Not-evaluable reasons**: 0
- **Tool error**: _none_
- **Blocking mode**: `telemetry_only` — Structural-evidence telemetry does NOT affect the legacy verdict.
- A RED telemetry state MUST remain visibly RED even when the legacy verdict is GREEN.

## Combined telemetry

- **Combined verdict**: **RED**
- **Display only**: yes — combined telemetry is display-only.
- Combined telemetry does NOT affect the legacy verdict.
- Combined telemetry does NOT affect the harness process exit.
- Do NOT describe the overall run simply as GREEN when telemetry contains RED.

## Network diagnostics

- **Completion state**: `success`
- **Elapsed to completion**: 63015 ms
- **Diagnostics**: `.agent/regression_runs/20260724T193135Z_fixture-A/network_diagnostics.json`
- **First non-2xx**: _none_
- **Application error detected**: no
- **Visible error excerpt**: _none_
- **Thresholds**: unchanged (`HARD_LATENCY_MS=240000`, `SOFT_LATENCY_MS=120000`)

## Artifacts

- Committed: `.agent/regression_runs/20260724T193135Z_fixture-A/{metadata.json,structural_checks.json,verdict.md,quote_integrity_summary.json,structural_evidence_summary.json,structural_evidence_context.json,network_diagnostics.json}`
- Scratchpad: `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260724T193135Z_fixture-A/report.md`, `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260724T193135Z_fixture-A/report.png`
