# Baseline Verdict · fixture-A_20260714T025246Z_current

- **baseline_id**: `fixture-A_20260714T025246Z_current`
- **source_run_id**: `20260714T025246Z_fixture-A`
- **fixture_id**: `A` (v1 · synthetic)
- **fixture_version**: `benchmark_A_backend_to_applied_ai.md`
- **baseline_status**: **`current`**
- **source verdict**: **GREEN**
- **exit_code**: **0**
- **Duration**: 66610 ms (≈ 66.6 s)
- **Capture scope**: `main section` (strategy=`shortest-qualified-candidate`, fallback=false)
- **Report length (selected scope)**: 9837 chars
- **Report length soft band**: 1500 – 14000
- **Page body length (obs)**: 16569 chars
- **Candidates scanned / qualified**: 9 / 2
- **Source commit sha**: `451bb7fc0ef0c4835ab22e76ff82d304e02d4f78`
- **Harness commit**: `d393db9`
- **Corpus snapshot**: May 14, 2026
- **Model**: Claude Sonnet 4.6

## Red checks failed

_none_

## Amber checks failed

_none_

## All 25 checks passed

15/15 red · 9/9 amber · 4/4 fixture-specific · 4/4 operational.

## Committed artifacts

- **Baseline files** (this directory ·
  `.agent/regression_baselines/fixture-A/current/`):
  - `baseline_metadata.json`
  - `baseline_verdict.md` (this file)
  - `baseline_structural_checks.json`
  - `source_run_id.txt`
  - `promotion_decision.md`
  - `baseline_summary.md`
- **Source run artifacts** (kept · `.agent/regression_runs/20260714T025246Z_fixture-A/`):
  - `metadata.json`
  - `structural_checks.json`
  - `verdict.md`

## NOT committed (v1 policy)

- Full `report.md` — kept in scratchpad only
  (`/var/folders/xx/…/T/acr-regression-runs/20260714T025246Z_fixture-A/report.md`).
- Screenshot `report.png` — kept in scratchpad only.
- Rationale: AgentOps-3g memo §7 + §15. Baseline layer stays
  lightweight and diff-friendly; large binary/prose artifacts are
  local-only.

## Approval status

**APPROVED** by DECISION
`.agent/decisions/2026-07-12_run_09_DECISION.md`
(`verdict = approve` · Bohao's explicit per-turn acknowledgement).
See `promotion_decision.md` in this directory for the full approval
record.

- Full `report.md` is **not committed** in v1 (kept in scratchpad).
- Screenshot is **not committed** in v1 (kept in scratchpad).
