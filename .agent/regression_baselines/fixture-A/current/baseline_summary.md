# Baseline summary · fixture-A_20260714T025246Z_current

Concise human-readable overview of the first official Fixture A regression
baseline. Machine-readable data lives in `baseline_metadata.json` and
`baseline_structural_checks.json` in this directory.

## Identity

- **baseline_id**: `fixture-A_20260714T025246Z_current`
- **source_run_id**: `20260714T025246Z_fixture-A`
- **fixture**: A · synthetic · `benchmark_A_backend_to_applied_ai.md`
- **source run artifact path**:
  `.agent/regression_runs/20260714T025246Z_fixture-A/`
- **source commit sha at run time**: `451bb7f`
- **harness commit at run time**: `d393db9`
- **corpus snapshot at run time**: `May 14, 2026`
- **model at run time**: `Claude Sonnet 4.6`

## Provenance

- **Promoted from second consecutive GREEN.**
- **Previous GREEN run id**: `20260713T014957Z_fixture-A`
  (11773 chars · 75804 ms)
- **Current baseline GREEN run id**: `20260714T025246Z_fixture-A`
  (9837 chars · 66610 ms)
- Stability delta (chars): −1936 (−16.4% · within ±30% pre-declared
  band).
- Stability delta (duration): −9194 ms (−12.1% · 0.88× · well within
  2× pre-declared band).

## Result

- **verdict**: **GREEN**
- **exit_code**: **0**
- **25 / 25 checks passed** (15 red · 9 amber · 4 fixture-specific ·
  4 operational)
- **capture_scope**: `main section`
- **fallback_used**: `false`
- **report_char_count**: 9837 (in 1500–14000 band)
- **duration_ms**: 66610 (well below 120000 soft, 240000 hard)
- **must_not_happen matches**: 0
- **Candidate 1 sentinel intact** (incomplete banner absent)
- **5 / 5 required section markers + Evidence Appendix** present in
  selected scope

## What is committed

- Baseline layer (this directory):
  `baseline_metadata.json`, `baseline_verdict.md`,
  `baseline_structural_checks.json`, `source_run_id.txt`,
  `promotion_decision.md`, `baseline_summary.md`.
- Source run layer (kept unchanged):
  `.agent/regression_runs/20260714T025246Z_fixture-A/{metadata.json,
  structural_checks.json, verdict.md}`.

## What is NOT committed

- **Full `report.md`** — scratchpad-only. Location for local audit:
  `/var/folders/xx/…/T/acr-regression-runs/20260714T025246Z_fixture-A/report.md`.
- **Screenshot `report.png`** — scratchpad-only, same path.
- Rationale: AgentOps-3g memo §7 + §15 (v1 policy).

## Intended use

Official narrow **Fixture A** baseline for **local** report regression
comparison. Future runs may compare their metadata / structural checks
against this baseline to detect drift. v1 comparison is
metadata/structure-only (report length band, section presence, marker
count, capture scope, duration bounds) — no exact text diff, no
semantic similarity, no quote integrity yet (memo §11).

## Limitations

- **Fixture A only.** B-E have not been real-run yet; they carry no
  baseline.
- **Localhost only.** Harness hard-rejects non-localhost hosts;
  production baseline is separately deferred (memo §14).
- **No semantic diff / no quote integrity gate.** Those are deferred
  quality upgrades (memo §11 · §16 item 6).
- **v1 storage policy**: `report.md` and screenshots are never
  baseline-committed. Change requires a separate storage-policy
  DECISION.
- **Single fixture, single archetype** — a GREEN here does not imply
  reports are good for all engineer archetypes.

## Related documents

- Design memo:
  `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`
- Checklist:
  `.agent/templates/baseline_promotion_checklist.md`
- Stability re-run RUN_REPORT:
  `.agent/run_reports/2026-07-12_run_08_RUN_REPORT.md`
- Stability re-run DECISION:
  `.agent/decisions/2026-07-12_run_08_DECISION.md`
- Verdict protocol integration memo:
  `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`
