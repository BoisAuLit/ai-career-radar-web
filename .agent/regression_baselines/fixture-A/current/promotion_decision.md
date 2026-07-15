# Promotion Decision · fixture-A_20260714T025246Z_current

## Status

**APPROVED** by DECISION.

## Decision reference

- **Approval DECISION**:
  `.agent/decisions/2026-07-12_run_09_DECISION.md`
- **Approver**: Bohao (per-turn human approval recorded in the
  DECISION file)
- **Approval scope**: this specific baseline
  (`fixture-A_20260714T025246Z_current`) only

## What is now official

- **Baseline ID**: `fixture-A_20260714T025246Z_current`
- **Baseline path**:
  `.agent/regression_baselines/fixture-A/current/`
- **Baseline status**: `current`
- **Source run**: `20260714T025246Z_fixture-A`
- **Fixture**: `A` (v1 · synthetic ·
  `benchmark_A_backend_to_applied_ai.md`)

This baseline becomes the current official Fixture A baseline **once
this DECISION and the baseline files are pushed to `origin/main`**.
Until push, it is a locally-approved baseline candidate.

## Scope this DECISION does NOT approve

- **Not a B-E baseline.** Fixtures B, C, D, E remain without any
  baseline. Each of those fixtures would need its own explicit
  promotion loop (per AgentOps-3g memo §13).
- **Not a production baseline.** The harness hard-rejects
  non-localhost hosts (per AgentOps-3g memo §14). Production
  regression / smoke coverage requires a separate explicit DECISION.
- **Not semantic equivalence.** v1 comparison is
  metadata/structure-only (per AgentOps-3g memo §11). No LLM-judge
  diff, no embedding similarity, no exact text diff.
- **Not a quote integrity gate.** Quote integrity is a deferred
  later quality upgrade (per AgentOps-3g memo §16 item 6).

## Demotion authority

Only Bohao may demote this baseline, via an explicit new DECISION
(per AgentOps-3g memo §10 and AgentOps-3f skip-approval discipline).
Claude/Codex may recommend demotion but cannot approve it.

## Related documents

- **Approval DECISION**:
  `.agent/decisions/2026-07-12_run_09_DECISION.md`
- **RUN_REPORT**:
  `.agent/run_reports/2026-07-12_run_09_RUN_REPORT.md`
- **TASK**: `.agent/tasks/2026-07-12_run_09_TASK.md`
- **Baseline design memo**:
  `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`
- **Stability re-run DECISION**:
  `.agent/decisions/2026-07-12_run_08_DECISION.md`
- **Verdict protocol integration memo**:
  `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`
