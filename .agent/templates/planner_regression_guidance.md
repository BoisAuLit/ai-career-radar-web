# Codex planner · regression guidance

> **Introduced by**: AgentOps-3f (2026-07-12).
> **Canonical source**: `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`.
> **Purpose**: Formalize how the Codex read-only daily planner
> (specified in AgentOps-3b, not yet implemented) must consume
> regression state. When the planner lands, its output must comply
> with this template.
> **Status**: Spec-only. No code implements this yet. The Codex
> planner spec lives at
> `.agent/design_memos/2026-07-11_AgentOps-3b_codex_read_only_daily_planner.md`.

## Read-only inputs

Codex may read (never write) the following:

- `.agent/regression_runs/<latest>/metadata.json` — canonical machine
  state (committed).
- `.agent/regression_runs/<latest>/structural_checks.json` — per-check
  detail (committed).
- `.agent/regression_runs/<latest>/verdict.md` — human-readable
  summary (committed).
- Latest RUN_REPORT's `## Regression verdict` section under
  `.agent/run_reports/`.

Codex must **never** trigger a regression run itself. Regression is a
human-initiated loop.

## Rules (10 · numbered to match design memo §6)

1. **Read the latest regression state** if available. If nothing is
   available under `.agent/regression_runs/`, treat as
   `unavailable`.
2. **Do not mark regression `green`** if the state is
   `unavailable`, `skipped_with_reason`, or older than 24 hours for
   a report-affecting change queue.
3. **Recommend fix or revert over new feature work** when the latest
   required regression is `red`. Do not enqueue new features while
   a red is unresolved.
4. **Escalate `amber`** by placing an explicit "amber blocking push"
   flag at the top of the daily planner header. Amber never lives
   silently in the middle of the day plan.
5. **May proceed** when regression is `not_required` for doc-only
   work (design memos, daily summaries, protocol changes like the
   one that introduced this template).
6. **Include one line in each recommended next task**:
   `Regression requirement: required / not required / unavailable / skipped_with_reason` and a **short reason** (why this task is or isn't report-affecting).
7. **Include the stop condition** in every daily planner report:
   `Do not push report-affecting changes without green regression or explicit human override.`
8. **Committed `metadata.json` is authoritative** over human-written
   RUN_REPORT prose when they disagree. JSON is state; prose is
   commentary. If the two conflict, Codex must:
   (a) call the conflict out in the daily planner header, and
   (b) recommend a human review loop, not a fix loop.
9. **Never trigger a regression run** yourself. Regression is
   human-initiated. Codex may only *recommend* a human run one.
10. **Flag drift**: if `metadata.json`'s `git_commit_sha` is older
    than the current `main` HEAD by more than one loop
    (approximately: more than one merge commit gap), note
    `regression state stale, next required loop should re-run`
    in the daily planner header.

## Required daily planner output shape

Every daily planner report Codex produces (once implemented) must
include a top-level section named exactly `## Regression state`
with the following fields:

- **latest_run_id**: from `metadata.json`, or `unavailable`.
- **latest_verdict**: `green` | `amber` | `red` | `unavailable` |
  `stale` | `not_applicable`.
- **latest_run_git_commit_sha**: from `metadata.json`.
- **current_main_head**: current `main` HEAD short SHA.
- **drift**: `none` | `<n>-loops-behind`.
- **push_gate_status**: derived push implication in one phrase
  (mirrors the RUN_REPORT rule set).
- **stop_condition_reminder**: the literal sentence from rule 7
  above.

## Interaction with RUN_REPORT protocol

- Codex consumes RUN_REPORT `## Regression verdict` sections as
  read-only input.
- Codex must **not rewrite** RUN_REPORTs. If a RUN_REPORT is
  missing the section, Codex should flag it as a protocol
  violation, not silently patch.
- The Codex daily planner report is itself a `.agent/` doc, so
  producing one is `regression_required=no` — Codex should record
  that at the top of its output for clarity.

## Baseline / fixture / production caveats

- Codex must treat the "latest green run" as a **validated run
  artifact**, not an official baseline, until a baseline is
  explicitly promoted (separate human loop). Do not use the phrase
  "baseline" in daily planner output unless
  `metadata.json`'s `baseline_promoted=true` (currently always
  `false`).
- Codex must not recommend running Fixtures B-E in a single day
  batch. Recommend one new fixture per loop maximum.
- Codex must never recommend production regression until an
  explicit production-testing DECISION exists. Until then, the only
  legal target is `http://localhost:3000`.

## Non-goals for the Codex planner

- **Never write** to any file in the repo.
- **Never run** the harness, the collector, or any LLM call.
- **Never approve** a `skipped_with_reason` on the human's behalf.
  Only Bohao can approve a skip.
- **Never mark** a red as "acceptable" without a linked human
  DECISION.
- **Never bump** `baseline_promoted` — that requires a separate
  human-owned promotion loop.

## Change control

This file is protocol, not code. Modifying it requires a new
AgentOps loop (`AgentOps-3f-tune` or equivalent) with its own TASK
+ RUN_REPORT + DECISION. Do not edit in place during unrelated
loops.
