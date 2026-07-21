# Promotion Decision · fixture-B_20260719T054151Z_current

## Status

**APPROVED** by DECISION.

## Decision reference

- **Approval DECISION**:
  `.agent/decisions/2026-07-19_run_03_DECISION.md`
- **Approver**: Bohao (per-turn human approval recorded in the
  DECISION file)
- **Approval scope**: this specific baseline
  (`fixture-B_20260719T054151Z_current`) only

## What is now official

- **Baseline ID**: `fixture-B_20260719T054151Z_current`
- **Baseline path**:
  `.agent/regression_baselines/fixture-B/current/`
- **Baseline status**: `current`
- **Source run**: `20260719T054151Z_fixture-B`
- **Fixture**: `B` (v1 · synthetic ·
  `benchmark_B_fullstack_to_ai_product.md`)

This baseline becomes the current official Fixture B baseline **once
this DECISION and the baseline files are pushed to `origin/main`**.
Until push, it is a locally-approved baseline candidate.

## Scope this DECISION does NOT approve

- **Not a Fixture C / D / E baseline.** Only B. Fixtures C, D, E
  remain without any baseline. Each of those fixtures would need its
  own explicit promotion loop (per AgentOps-3g memo §13). Same
  discipline used for Fixture A → Fixture B expansion.
- **Not an A-E full-suite baseline.** Only B; A already has its own
  separate baseline. Full suite would require its own scale-out
  DECISION.
- **Not a production baseline.** The harness hard-rejects
  non-localhost hosts (per AgentOps-3g memo §14). Production
  regression / smoke coverage requires a separate explicit DECISION.
- **Not semantic equivalence.** v1 comparison is
  metadata/structure-only (per AgentOps-3g memo §11). No LLM-judge
  diff, no embedding similarity, no exact text diff.
- **Not a quote integrity gate.** Quote integrity is a deferred
  later quality upgrade (per AgentOps-3g memo §16 item 6).
- **Does not authorize uploaded PDF ingestion.** The 20 uploaded PDFs
  remain external material; a separate resume-fixture-intake design
  loop with anonymization + storage policy DECISION is required
  before any PDF-derived artifact lands in the repo.

## Demotion authority

Only Bohao may demote this baseline, via an explicit new DECISION
(per AgentOps-3g memo §10 and AgentOps-3f skip-approval discipline).
Claude/Codex may recommend demotion but cannot approve it.

## Related documents

- **Approval DECISION**:
  `.agent/decisions/2026-07-19_run_03_DECISION.md`
- **RUN_REPORT**:
  `.agent/run_reports/2026-07-19_run_03_RUN_REPORT.md`
- **TASK**: `.agent/tasks/2026-07-19_run_03_TASK.md`
- **Baseline design memo**:
  `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`
- **Fixture B first-run DECISION**:
  `.agent/decisions/2026-07-19_run_01_DECISION.md`
- **Fixture B stability DECISION**:
  `.agent/decisions/2026-07-19_run_02_DECISION.md`
- **Verdict protocol integration memo**:
  `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`
- **Fixture A baseline (structure reference · read-only)**:
  `.agent/regression_baselines/fixture-A/current/`
