# Promotion Decision Pointer · fixture-B_20260719T054151Z_current

> This file is a **pending pointer**, not a fake approval. It exists so
> readers of the baseline directory can find the authoritative DECISION
> file once it lands. Do NOT treat this as human-approved baseline
> before that DECISION is committed.

## Status

**PENDING DECISION** at the time this file was written.

## Proposal

- **Baseline promotion candidate**: `20260719T054151Z_fixture-B`
- **Proposed baseline path**:
  `.agent/regression_baselines/fixture-B/current/`
- **Proposed baseline_id**:
  `fixture-B_20260719T054151Z_current`
- **Proposed baseline_status**: `current`
- **Proposed supersedes**: `null` (first Fixture B baseline)

## Proposer

- Proposed by: this loop's TASK
  (`.agent/tasks/2026-07-19_run_03_TASK.md`).
- Executor: Claude Code (checkpoint mode).

## Approval requirement

Final approval requires the DECISION file at:
`.agent/decisions/2026-07-19_run_03_DECISION.md`

with `verdict = approve` and Bohao's explicit per-turn acknowledgement.

Until that DECISION is committed and pushed, this is a **pending
baseline promotion artifact**, not a human-approved baseline.

## Scope this promotion does NOT cover

- **Not a Fixture C / D / E baseline.** Only B. Fixtures C, D, E remain
  without any baseline. Each would need its own explicit promotion loop
  (per AgentOps-3g memo §13).
- **Not a production baseline.** The harness hard-rejects non-localhost
  hosts (per AgentOps-3g memo §14). Production regression / smoke
  coverage requires a separate explicit DECISION.
- **Not semantic equivalence.** v1 comparison is metadata/structure-only
  (per AgentOps-3g memo §11).
- **Not a quote integrity gate.** Deferred later quality upgrade (per
  AgentOps-3g memo §16 item 6).
- **Does not authorize uploaded PDF ingestion.** The 20 uploaded PDFs
  remain external material; a separate resume-fixture-intake design
  loop with anonymization + storage policy DECISION is required before
  any PDF-derived artifact lands in the repo.

## Do NOT

- Do NOT treat this file as human-approved baseline before DECISION.
- Do NOT flip `promoted_by` in `baseline_metadata.json` to a name that
  implies human approval before DECISION lands.
- Do NOT bundle promotion approval with any other loop.

## Demotion authority

Only Bohao may demote this baseline, via an explicit new DECISION (per
AgentOps-3g memo §10 and AgentOps-3f skip-approval discipline).
Claude/Codex may recommend demotion but cannot approve it.

## What lands after DECISION

Once `.agent/decisions/2026-07-19_run_03_DECISION.md` is committed with
`verdict = approve`, this file should be understood alongside that
DECISION as the paired promotion record. `baseline_metadata.json`'s
`promoted_by` may be updated (in a separate acknowledgement loop) from
`"Bohao pending DECISION"` to `"Bohao via DECISION
2026-07-19_run_03_DECISION"` with the DECISION timestamp — same
pattern that AgentOps-3g-2 used for Fixture A.
