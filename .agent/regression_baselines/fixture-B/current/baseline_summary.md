# Baseline summary · fixture-B_20260719T054151Z_current

Concise human-readable overview of the first official Fixture B
regression baseline. Machine-readable data lives in
`baseline_metadata.json` and `baseline_structural_checks.json` in this
directory.

## Identity

- **baseline_id**: `fixture-B_20260719T054151Z_current`
- **source_run_id**: `20260719T054151Z_fixture-B`
- **fixture**: B · synthetic · `benchmark_B_fullstack_to_ai_product.md`
- **source run artifact path**:
  `.agent/regression_runs/20260719T054151Z_fixture-B/`
- **source commit sha at run time**: `0341461`
- **harness commit at run time**: `0341461` (harness state includes
  AgentOps-4a `--fixture` support)
- **corpus snapshot at run time**: `May 14, 2026`
- **model at run time**: `Claude Sonnet 4.6`

## Provenance

- **Promoted from second consecutive GREEN** (mirrors AgentOps-3g-2
  workflow for Fixture A).
- **Previous B GREEN run id**: `20260719T045622Z_fixture-B`
  (10407 chars · 67719 ms · AgentOps-4a)
- **Current baseline B GREEN run id**:
  `20260719T054151Z_fixture-B` (10445 chars · 67608 ms ·
  AgentOps-4a-stability)
- Stability delta (chars): **+38 · +0.4%** (well within ±30%
  pre-declared band).
- Stability delta (duration): **−111 ms · −0.2% / 0.998×** (well
  within 2× pre-declared band).

## Result

- **verdict**: **GREEN**
- **exit_code**: **0**
- **25 / 25 checks passed** (15 red · 9 amber · 4 fixture-specific ·
  4 operational)
- **capture_scope**: `main section`
- **fallback_used**: `false`
- **report_char_count**: 10445 (in 1500-14000 band)
- **duration_ms**: 67608 (well below 120000 soft, 240000 hard)
- **must_not_happen matches**: 0 (B literal list clean)
- **Candidate 1 sentinel intact** (incomplete banner absent)
- **5 / 5 required section markers + Evidence Appendix** present in
  selected scope
- **Fixture-specific recommendation keywords hit**: 5/5 —
  `agent`, `tool call`, `tool-call`, `eval`, `telemetry`
- **Identical keyword hit set** between the two Fixture B GREEN
  runs (zero keyword drift)

## What is committed

- Baseline layer (this directory):
  `baseline_metadata.json`, `baseline_verdict.md`,
  `baseline_structural_checks.json`, `source_run_id.txt`,
  `promotion_decision.md`, `baseline_summary.md`.
- Source run layer (kept unchanged):
  `.agent/regression_runs/20260719T054151Z_fixture-B/{metadata.json,
  structural_checks.json, verdict.md}`.

## What is NOT committed

- **Full `report.md`** — scratchpad-only. Location for local audit:
  `/var/folders/xx/…/T/acr-regression-runs/20260719T054151Z_fixture-B/report.md`.
- **Screenshot `report.png`** — scratchpad-only, same path.
- Rationale: AgentOps-3g memo §7 + §15 (v1 policy · same as A
  baseline).

## Intended use

Official narrow **Fixture B** baseline for **local** report
regression comparison — the AI Product / agent-tooling archetype
counterpart to Fixture A. Future runs may compare their metadata /
structural checks against this baseline to detect drift. v1
comparison is metadata/structure-only (report length band, section
presence, marker count, capture scope, duration bounds) — no exact
text diff, no semantic similarity, no quote integrity yet (memo §11).

## Limitations

- **Fixture B only.** B does not cover A / C / D / E.
- **Localhost only.** Harness hard-rejects non-localhost hosts;
  production baseline is separately deferred (memo §14).
- **No C/D/E coverage.**
- **No A-E full suite coverage.**
- **No production coverage.**
- **No semantic diff / no quote integrity gate.** Deferred quality
  upgrades (memo §11 · §16 item 6).
- **v1 storage policy**: `report.md` and screenshots are never
  baseline-committed. Change requires a separate storage-policy
  DECISION.
- **Uploaded 20 PDFs not ingested.** Separate resume-fixture-intake
  design loop needed (with anonymization + storage policy DECISION)
  before any file lands in the repo.

## Related documents

- Design memo:
  `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`
- Checklist:
  `.agent/templates/baseline_promotion_checklist.md`
- Fixture B first-run RUN_REPORT:
  `.agent/run_reports/2026-07-19_run_01_RUN_REPORT.md`
- Fixture B stability RUN_REPORT:
  `.agent/run_reports/2026-07-19_run_02_RUN_REPORT.md`
- Fixture B stability DECISION:
  `.agent/decisions/2026-07-19_run_02_DECISION.md`
- Verdict protocol integration memo:
  `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`
- Fixture A baseline (structure reference · read-only):
  `.agent/regression_baselines/fixture-A/current/`
