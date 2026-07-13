# Baseline promotion checklist

> **Introduced by**: AgentOps-3g (2026-07-12).
> **Canonical source**:
> `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`.
> **Purpose**: Concise, scannable checklist for the human-authored
> promotion loop. Every item must be checked before promotion. If any
> is `no`, do NOT promote — either fix or defer.
> **Scope**: v1 · Fixture A · localhost · Playwright CLI.

## Candidate identification

- [ ] Candidate run id: `<YYYYMMDDTHHMMSSZ_fixture-X>`
- [ ] Fixture id / version: `<A>` / `<v1>`
- [ ] Source commit SHA: `<full 40-hex>`
- [ ] Harness script commit at time of run: `<short-hex>`

## Verdict eligibility (§5 of design memo)

- [ ] `verdict == green`
- [ ] `exit_code == 0`
- [ ] `capture_scope` is NOT `body_fallback`
- [ ] `fallback_used == false`
- [ ] All red-level checks pass
- [ ] All amber-level checks pass
- [ ] All fixture-specific checks pass
- [ ] All operational checks pass

## Safety + hygiene

- [ ] `no_production_target` red check passed (localhost only)
- [ ] No baseline promotion attempted in the source run itself
- [ ] Source commit had no forbidden repo diff
- [ ] No `.env*` was read by the harness
- [ ] No secrets or real user data in artifacts (fixture synthetic)
- [ ] `metadata.json` ≤ 5 KB, `structural_checks.json` ≤ 10 KB,
      `verdict.md` ≤ 3 KB
- [ ] Full `report.md` NOT committed
- [ ] Screenshot NOT committed
- [ ] Cost within bound (`estimated_cost ≤ $0.25`,
      `duration_ms < 240_000`)

## Governance

- [ ] Dedicated promotion TASK exists
      (`.agent/tasks/YYYY-MM-DD_run_XX_TASK.md`)
- [ ] Promotion RUN_REPORT drafted
- [ ] Promotion DECISION drafted with `verdict = approve`
- [ ] `promotion_decision_path` recorded in
      `baseline_metadata.json`
- [ ] Human (Bohao) explicit approval received this turn
- [ ] Baseline `notes` field reviewed for PII / secrets
- [ ] Demotion triggers (§10 of design memo) considered

## Post-promotion

- [ ] Baseline files created under
      `.agent/regression_baselines/fixture-<X>/current/`
- [ ] `baseline_status = "current"` set
- [ ] Any prior baseline moved to
      `.agent/regression_baselines/fixture-<X>/<old-id>/` with
      `baseline_status = "superseded"` and cross-reference recorded
- [ ] Push landed via standard cleanup loop
- [ ] Daily summary updated with baseline promotion record
