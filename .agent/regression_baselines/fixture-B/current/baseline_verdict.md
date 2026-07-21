# Baseline Verdict · fixture-B_20260719T054151Z_current

- **baseline_id**: `fixture-B_20260719T054151Z_current`
- **source_run_id**: `20260719T054151Z_fixture-B`
- **fixture_id**: `B` (v1 · synthetic)
- **fixture_version**: `benchmark_B_fullstack_to_ai_product.md`
- **baseline_status**: **`current`**
- **source verdict**: **GREEN**
- **exit_code**: **0**
- **Duration**: 67608 ms (≈ 67.6 s)
- **Capture scope**: `main section` (strategy=`shortest-qualified-candidate`, fallback=false)
- **Report length (selected scope)**: 10445 chars
- **Report length soft band**: 1500 – 14000
- **Page body length (obs)**: 17007 chars
- **Candidates scanned / qualified**: 8 / 2
- **Source commit sha**: `0341461ab008db20277d9d3f59bddd7b400f0eb4`
- **Harness commit**: `0341461` (harness state includes AgentOps-4a
  `--fixture` support)
- **Corpus snapshot**: May 14, 2026
- **Model**: Claude Sonnet 4.6

## Red checks failed

_none_

## Amber checks failed

_none_

## All 25 checks passed

15/15 red · 9/9 amber · 4/4 fixture-specific · 4/4 operational.

## Fixture-specific signal highlights

- `must_not_happen_absent`: **no matches** on B literal list
  (`learn react`, `beginner react`, `beginner typescript`,
  `as an ai language model`).
- `recommendation_roughly_matches_expected`: **5/5** hits on B
  keyword set (`agent`, `tool call`, `tool-call`, `eval`,
  `telemetry`). Same set that hit in the first B run — zero keyword
  drift between the two Fixture B GREENs.
- `at_least_2_strengths_reflected`: **5/5** strengths hit.
- `at_least_2_gaps_reflected`: **5/5** gaps hit.

## Stability context (second consecutive B GREEN)

- Previous B GREEN run: `20260719T045622Z_fixture-B` (10407 chars ·
  67719 ms).
- This baseline source (B stability): 10445 chars · 67608 ms.
- Delta: chars **+0.4%** · duration **−0.2% / 0.998×**.
- Both within pre-declared tolerance bands (±30% chars · 2×
  duration).
- Fixture-specific keyword hit patterns identical between runs.

## Committed artifacts

- **Baseline files** (this directory ·
  `.agent/regression_baselines/fixture-B/current/`):
  - `baseline_metadata.json`
  - `baseline_verdict.md` (this file)
  - `baseline_structural_checks.json`
  - `source_run_id.txt`
  - `promotion_decision.md`
  - `baseline_summary.md`
- **Source run artifacts** (kept unchanged ·
  `.agent/regression_runs/20260719T054151Z_fixture-B/`):
  - `metadata.json`
  - `structural_checks.json`
  - `verdict.md`

## NOT committed (v1 policy)

- Full `report.md` — kept in scratchpad only
  (`/var/folders/xx/…/T/acr-regression-runs/20260719T054151Z_fixture-B/report.md`).
- Screenshot `report.png` — kept in scratchpad only.
- Rationale: AgentOps-3g memo §7 + §15. Baseline layer stays
  lightweight and diff-friendly; large binary/prose artifacts are
  local-only. Same policy as Fixture A baseline.

## Approval status

**APPROVED** by DECISION
`.agent/decisions/2026-07-19_run_03_DECISION.md`
(`verdict = approve` · Bohao's explicit per-turn acknowledgement).
See `promotion_decision.md` in this directory for the full approval
record.

- Source verdict: **GREEN** · exit_code **0** · red = _none_ ·
  amber = _none_ (unchanged).
- Full `report.md` is **not committed** in v1 (kept in scratchpad).
- Screenshot is **not committed** in v1 (kept in scratchpad).
