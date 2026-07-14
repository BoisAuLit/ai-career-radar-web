# Promotion Decision Pointer · fixture-A_20260714T025246Z_current

> This file is a **pending pointer**, not a fake approval. It exists so
> readers of the baseline directory can find the authoritative DECISION
> file once it lands. Do NOT treat this as human-approved baseline
> before that DECISION is committed.

## Status

**PENDING DECISION** at the time this file was written.

## Proposal

- **Baseline promotion candidate**: `20260714T025246Z_fixture-A`
- **Proposed baseline path**:
  `.agent/regression_baselines/fixture-A/current/`
- **Proposed baseline_id**:
  `fixture-A_20260714T025246Z_current`
- **Proposed baseline_status**: `current`
- **Proposed supersedes**: `null` (first Fixture A baseline)

## Proposer

- Proposed by: this loop's TASK
  (`.agent/tasks/2026-07-12_run_09_TASK.md`).
- Executor: Claude Code (checkpoint mode).

## Approval requirement

Final approval requires the DECISION file at:
`.agent/decisions/2026-07-12_run_09_DECISION.md`

with `verdict = approve` and Bohao's explicit per-turn acknowledgement.

Until that DECISION is committed and pushed, this is a **pending
baseline promotion artifact**, not a human-approved baseline.

## Do NOT

- Do NOT treat this file as human-approved baseline before DECISION.
- Do NOT flip `promoted_by` in `baseline_metadata.json` to a name that
  implies human approval before DECISION lands.
- Do NOT bundle promotion approval with any other loop.

## What lands after DECISION

Once `.agent/decisions/2026-07-12_run_09_DECISION.md` is committed with
`verdict = approve`, this file should be understood alongside that
DECISION as the paired promotion record. `baseline_metadata.json`'s
`promoted_by` may be updated (in a separate acknowledgement loop) from
`"Bohao pending DECISION"` to `"Bohao"` with the DECISION timestamp,
if desired.
