# Design memo · AgentOps-5e-migrate · Baseline quote-integrity block metadata-only migration

- **date**: 2026-07-23
- **loop**: AgentOps-5e-migrate
- **implementation_commit**: `d27132b`
- **authorizing_decision**: `.agent/decisions/2026-07-23_run_05_DECISION.md`
- **planned_decision_id**: `2026-07-23_run_06_DECISION`
- **cost**: **$0**

## 1 · Purpose

Retrofit the two current baseline `baseline_metadata.json` files
(Fixture A + Fixture B) with the approved `quote_integrity` block
using **grandfathered + `not_evaluated`** truth values only. Make the
already-known grandfathered status of the two current baselines
**machine-checkable** by adding a structured block instead of a prose
`notes[]` entry.

This is a **metadata-only migration**. It records already-known truth.
**It is NOT quote-integrity evaluation. It is NOT baseline promotion.
It does NOT imply A/B passed the checker.**

## 2 · Approved grandfathering exception

Migration is authorized by the AgentOps-5e design DECISION
(`2026-07-23_run_05_DECISION`), which introduced a narrow exception
to the frozen-baseline rule established in `2026-07-21_run_01_DECISION`
(AgentOps-5a #4):

- Only `fixture-A/current/baseline_metadata.json` and
  `fixture-B/current/baseline_metadata.json` may be changed
- Only the new `quote_integrity` block may be added
- No existing metadata field may be changed
- No baseline report, screenshot, verdict, manifest, pointer, or
  source-run artifact may change
- Values must represent `not_evaluated` and grandfathered truth only
- Migration must be reviewable and reversible
- Migration must **not** be described as QI evaluation or baseline
  promotion

## 3 · Scope

Exactly **3** implementation files in commit `d27132b`:

- `.agent/tasks/2026-07-23_run_06_TASK.md` (new · scope declaration)
- `.agent/regression_baselines/fixture-A/current/baseline_metadata.json`
  (mutation: append `quote_integrity` block; only 1 pre-existing byte
  changes: `]` → `],` closing the `notes[]` array)
- `.agent/regression_baselines/fixture-B/current/baseline_metadata.json`
  (same mutation shape)

**TASK is the only non-baseline implementation artifact in `d27132b`.**

## 4 · Files changed

- `.agent/tasks/2026-07-23_run_06_TASK.md`
- `.agent/regression_baselines/fixture-A/current/baseline_metadata.json`
- `.agent/regression_baselines/fixture-B/current/baseline_metadata.json`

## 5 · Pre-migration state

Reconstructed from `origin/main` (`ba94023`) via
`git show origin/main:<path>`:

| fixture | bytes | top-level keys | notes items |
|---|---|---|---|
| A | 1820 | 34 | 9 |
| B | 2020 | 35 | 11 |

Both files parse as valid JSON. Neither contained a structured
`quote_integrity` field. QI status was only expressible as the prose
`notes[]` entry `"Quote integrity not yet a gate."`.

## 6 · Added quote_integrity block

Identical block appended to both files (after `notes[]`, before the
top-level closing `}`):

```json
"quote_integrity": {
  "evaluation_status": "not_evaluated",
  "verdict": null,
  "schema_version": null,
  "checker_commit": null,
  "blocking_mode": "telemetry_only",
  "grandfathered": true,
  "grandfather_reason": "pre_quote_integrity_baseline",
  "evaluated_run_id": null,
  "evaluated_at": null,
  "summary_path": null,
  "promotion_eligibility": "requires_review",
  "promotion_reasons": [
    "grandfathered_pre_quote_integrity_baseline",
    "quote_integrity_not_evaluated"
  ],
  "reviewed_by": [],
  "decision_id": "2026-07-23_run_06_DECISION"
}
```

14 fields exactly as approved in `2026-07-23_run_05_DECISION` §
"Approved schema".

## 7 · Why evaluation_status is not_evaluated

The current A and B baseline reports were **never processed by the
quote-integrity checker** at the time of promotion. Both baselines
predate the checker (`0.3-r2-terminal-punctuation`) becoming part of
the harness envelope. The DECISION explicitly requires
`evaluation_status = not_evaluated` for grandfathered baselines. Any
other value would falsely claim an evaluation that did not occur.

Invariant I10 (`baseline metadata must not claim a QI result that
was never evaluated`) is enforced by this choice.

## 8 · Why this is not quote-integrity evaluation

Migration adds only status metadata that describes the **absence** of
evaluation. It:

- **Does not** run the checker
- **Does not** write a `quote_integrity_summary.json` for either
  baseline
- **Does not** assign a `verdict` (verdict is `null`)
- **Does not** name a `schema_version` (`null`)
- **Does not** name a `checker_commit` (`null`)
- **Does not** name an `evaluated_run_id` (`null`)
- **Does not** name an `evaluated_at` (`null`)

The block explicitly declares: *no evaluation has occurred*.

## 9 · Why this is not baseline promotion

Migration does not:

- create a new baseline directory
- update `baseline_status`
- update `supersedes_baseline_id`
- update `promoted_at` / `promoted_by` / `promotion_decision_path`
- change legacy `verdict`
- change `source_run_id` or `source_run_artifact_path`
- change any report / verdict / summary / manifest / structural check
  file
- change `source_run_id.txt`
- promote to `blocking_mode = blocking`

The migration only records the already-known grandfathered status of
existing baselines.

## 10 · Existing-field preservation proof

**Method**: reconstruct pre-migration state from `origin/main`,
compare after removing the new block, run `assert.deepStrictEqual`.

**Result** (both fixtures):

```
Fixture A: deepStrictEqual PASS
Fixture A: existing top-level fields preserved = 34
Fixture A: quote_integrity fields = 14
Fixture B: deepStrictEqual PASS
Fixture B: existing top-level fields preserved = 35
Fixture B: quote_integrity fields = 14
```

Notes-array preservation:

- Fixture A: 9 notes preserved · last entry `"Quote integrity not yet
  a gate."` unchanged
- Fixture B: 11 notes preserved · last entry `"Uploaded 20 PDFs not
  ingested."` unchanged

All promotion / source / stability metadata (`baseline_id`,
`source_run_id`, `promoted_at`, `promoted_by`,
`promotion_decision_path`, `harness_script_commit`, `verdict`,
`exit_code`, `capture_scope`, `report_char_count`, `duration_ms`,
`stability_*`, `previous_green_*`, `production_target_used`, and all
others) remained byte-identical.

## 11 · Exact quote_integrity semantic validation

**Method**: `assert.deepStrictEqual` each `quote_integrity` block
against the exact object approved in `2026-07-23_run_05_DECISION`.

**Result**:

```
Fixture A exact block PASS
Fixture B exact block PASS
```

## 12 · JSON validation

All four snapshots (pre/post × A/B) parse as valid JSON:

- pre-A: 34 top-level keys
- post-A: 35 top-level keys (34 + `quote_integrity`)
- pre-B: 35 top-level keys
- post-B: 36 top-level keys (35 + `quote_integrity`)

## 13 · Consumer compatibility inspection

**Method**: `rg` for `baseline_metadata`, `regression_baselines`, and
`quote_integrity` across `scripts`, `src`, and `.agent` (excluding
`regression_runs`, `quote_integrity_runs`, and text artifact
directories).

**Findings**:

- `scripts/report-regression-local.mjs` references
  `quote_integrity_summary.json`, run-level `metadata.quote_integrity`
  writes, and structural-check bucket writes. It does **not** read
  `baseline_metadata.json` at all.
- `scripts/quote-integrity-check.mjs` writes
  `quote_integrity_summary.json` for per-run source runs. It does
  **not** read `baseline_metadata.json`.
- No `src/**` reference to `baseline_metadata` or
  `regression_baselines`.
- No `additionalProperties`, `Ajv`, or strict JSON-schema enforcement
  anywhere in the code paths.
- No enumeration of exact top-level baseline keys.
- No whole-object comparison of baseline metadata anywhere.

**Conclusion**: **compatible**. `baseline_metadata.json` currently
has zero runtime code consumers. It is a git-tracked
human-referenced artifact. The new optional top-level
`quote_integrity` key introduces no compatibility risk.

## 14 · Diff audit

`git diff --name-only origin/main..HEAD -- .agent/regression_baselines`
returns exactly:

- `.agent/regression_baselines/fixture-A/current/baseline_metadata.json`
- `.agent/regression_baselines/fixture-B/current/baseline_metadata.json`

`git diff --stat`: 40 insertions, 2 deletions (the two deletions are
`]` → `],` — appending a required JSON comma after `notes[]`).

Sibling baseline files verified unchanged for both fixtures:

- `baseline_structural_checks.json`
- `baseline_summary.md`
- `baseline_verdict.md`
- `promotion_decision.md`
- `source_run_id.txt`

## 15 · Reversibility

- Implementation commit: `d27132b`
- Rollback: `git revert d27132b` (single-commit revert)
- Pre-push: revert erases the block entirely and restores original
  files byte-for-byte
- No downstream artifact depends on the new block (no code reads
  `baseline_metadata.json`)

## 16 · What was intentionally not changed

- No other baseline files
- No non-current baseline directories
- No `.agent/regression_runs/**` or `.agent/quote_integrity_runs/**`
- No `.agent/regression_fixtures/**`
- No `.agent/scripts/**` (hard rule per AgentOps-2c Q3-Q8)
- No `src/**`
- No `scripts/report-regression-local.mjs`
- No `scripts/quote-integrity-check.mjs`
- No pipeline files
- No thresholds (`HARD_LATENCY_MS = 240_000`,
  `SOFT_LATENCY_MS = 120_000` unchanged)
- No `package.json` / lockfile / workflow / env / Vercel config
- No `report.md`, screenshot, long quote, secret, auth, cookie, or
  payload committed

## 17 · Risks

1. `decision_id` value (`2026-07-23_run_06_DECISION`) is a **predicted
   id** for the DECISION that will authorize this loop. Aligns with
   the AgentOps helper convention (task_id === DECISION prefix). If
   the eventual DECISION is filed under a different id, the block
   must be corrected before push.
2. Migration touches frozen baseline metadata — approved only via the
   narrow exception in `2026-07-23_run_05_DECISION`. Any future
   migration must re-obtain a similar exception.
3. Existing consumers must tolerate the new optional block. Currently
   there are none — but any future consumer must be additive-tolerant.
4. `reviewed_by` remains `[]`. Do not populate with invented reviewer
   identities.
5. `schema_version` remains `null` for both baselines. If future
   promotion machinery treats `null` as an implicit-current match,
   invariant I11 (`schema drift requires explicit compatibility
   approval or re-evaluation`) will be silently violated. Guard
   against this.
6. Current A/B baselines remain `requires_review` under the promotion
   eligibility tree. A future promotion candidate must resolve this
   explicitly rather than being auto-promoted.
7. Quote integrity remains **telemetry-only**. Migration does not
   change `blocking_mode` in the harness.
8. NVIDIA `jd_000201` R1 grammar-bridging RED remains unresolved — a
   separate prompt-tune loop is still outstanding.
9. C/D/E have not received real generated regression runs.
10. Uploaded 20 PDFs remain out of scope.
11. BLK-0001 / BLK-0002 / BLK-0003 remain `open`.

## 18 · Recommended next loop

**Handoff / pause** for human + ChatGPT review of this loop, then
create DECISION (`2026-07-23_run_06_DECISION`). After DECISION land +
push:

- Option: **AgentOps-5e-followup-prompt-tune** (address R1 grammar
  bridging so future evaluated promotions are not blocked by RED).
- Option: **wait for a real baseline candidate** to exercise
  `evaluated` state under the new schema.
- Option: **broader consumer wiring** to make the new block
  load-bearing (would need a separate design loop).

**Do NOT start AgentOps-5f-promote yet.**

## 19 · Boundaries respected

- ✅ no generation
- ✅ no harness / Playwright / dev server
- ✅ no LLM / API calls
- ✅ no baseline promotion
- ✅ no `src/**` / checker / harness changes
- ✅ no `.agent/scripts/**` changes
- ✅ no pipeline changes
- ✅ no threshold changes
- ✅ no `package.json` / lockfile / workflow / env / Vercel changes
- ✅ no `report.md` / screenshot / long quote / secret committed
- ✅ no PDFs
- ✅ no OpenAI API
- ✅ no LLM judge · no edit-distance
- ✅ no C/D/E · no A-E
- ✅ **quote integrity remains telemetry-only**
- ✅ **no blocking promotion**
- ✅ **no manual deploy**
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains blocked_pending_human
- ✅ Q10 pause unchanged
- ✅ Codex planner spec-only
- ✅ **cost $0**
