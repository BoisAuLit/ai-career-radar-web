# RUN REPORT · AgentOps-5e · Baseline quote-integrity schema fold · inspection & design only

## Metadata

- **task_id**: `2026-07-23_run_05`
- **date**: 2026-07-23
- **loop**: AgentOps-5e
- **parent_loop**: AgentOps-5d-cosmetic (`2026-07-23_run_04`)
- **task_path**: `.agent/tasks/2026-07-23_run_05_TASK.md`
- **design_memo_path**: `.agent/design_memos/2026-07-23_AgentOps-5e_baseline_quote_integrity_schema_fold.md`
- **findings_json_path**: `.agent/findings/2026-07-23_baseline_quote_integrity_schema_inventory.json`
- **impl_commit**: `d6d792f` (Design baseline quote integrity schema)

## Regression verdict

- **regression_required**: no
- **reason_required_or_not**: inspection / design-only baseline
  schema work; no runtime, checker, harness, or baseline mutation
- **harness_used**: no
- **harness_command**: not_run
- **fixture_ids**: none generated
- **target_environment**: local inspection
- **latest_run_id**: not_applicable
- **verdict**: `not_required`
- **exit_code**: not_applicable
- **artifact_paths**:
  - `.agent/tasks/2026-07-23_run_05_TASK.md`
  - `.agent/design_memos/2026-07-23_AgentOps-5e_baseline_quote_integrity_schema_fold.md`
  - `.agent/findings/2026-07-23_baseline_quote_integrity_schema_inventory.json`
- **report_char_count**: not_applicable
- **capture_scope**: not_applicable
- **fallback_used**: not_applicable
- **red_checks_failed**: not_applicable
- **amber_checks_failed**: not_applicable
- **cost_measured**: **true** (nothing to measure)
- **estimated_cost**: **$0**
- **duration_ms**: not_applicable
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Baseline files inspected

- `.agent/regression_baselines/fixture-A/current/{baseline_metadata.json,
  baseline_structural_checks.json, baseline_summary.md,
  baseline_verdict.md, promotion_decision.md, source_run_id.txt}`
- `.agent/regression_baselines/fixture-B/current/` (same 6 files)
- **Read-only inspection only. Neither directory modified.**

## Current A/B representation

- Both baselines have **34-35 metadata fields** including run
  identifiers, promotion metadata, legacy verdict, stability
  fields, and `notes[]`.
- **QI status is represented ONLY as a `notes[]` string**:
  `"Quote integrity not yet a gate."`
- **No structured QI fields exist**: no `evaluation_status`, no
  `checker_schema_version`, no `grandfathered` boolean, no
  `blocking_mode`, no `promotion_eligibility`.
- **QI status is not machine-checkable** in current baselines.

## Recommended state model

Two orthogonal dimensions, kept separate:

- `evaluation_status`: `not_evaluated | evaluated | blocked | error`
- `verdict`: `green | amber | red | null`

Plus two policy fields:

- `blocking_mode`: `telemetry_only | blocking`
- `grandfathered`: `true | false`

Grandfathered baselines get `evaluation_status = not_evaluated`
and `grandfathered = true` (see §8 of design memo).

## Recommended schema

Flat `quote_integrity` block in `baseline_metadata.json`
(backward-compatible):

```json
{
  "quote_integrity": {
    "evaluation_status": "not_evaluated | evaluated | blocked | error",
    "verdict": "green | amber | red | null",
    "schema_version": "string | null",
    "checker_commit": "string | null",
    "blocking_mode": "telemetry_only | blocking",
    "grandfathered": true,
    "grandfather_reason": "pre_quote_integrity_baseline",
    "evaluated_run_id": "string | null",
    "evaluated_at": "iso-8601 | null",
    "summary_path": "string | null",
    "promotion_eligibility": "eligible | ineligible | requires_review",
    "promotion_reasons": ["string"],
    "reviewed_by": ["string"],
    "decision_id": "string | null"
  }
}
```

See design memo §9-§10 for field-by-field rationale.

## Recommended architecture

**Option A**: add `quote_integrity` block directly to
`baseline_metadata.json`. (Alternatives B / C / D considered and
rejected in memo §16-§17.)

## Migration recommendation

**Separate AgentOps-5e-migrate loop** (NOT this loop) to retrofit
A + B baseline files with the block using grandfathered values:

- `evaluation_status = not_evaluated`
- `verdict = null`
- `schema_version = null`
- `grandfathered = true`
- `grandfather_reason = "pre_quote_integrity_baseline"`
- `blocking_mode = telemetry_only`
- `promotion_eligibility = requires_review`
- `decision_id = <link to future 5e-migrate DECISION>`

Requires explicit **"grandfathering exception"** clause in that
DECISION per 5a DECISION #4 (which says grandfathered baselines
are frozen). This migration only records already-known truth · does
not re-classify anything.

## Promotion eligibility model

Fixed decision tree computes `promotion_eligibility`:

- **Hard blockers → `ineligible`**: legacy_verdict != green ·
  `not_evaluated` / `blocked` / `error` states · red under
  `blocking_mode = blocking` · missing source_run · missing
  promotion_decision_path.
- **Review required → `requires_review`**: red under
  `telemetry_only` · amber · schema_version drift from current ·
  grandfathered = true.
- **Non-blocking warnings**: `terminal_punctuation_only_matches > 0` ·
  `appendix_entries_not_cited > 0` (still `eligible`).

**All current A + B baselines evaluate to `requires_review`**
under this tree (grandfathered).

## Schema compatibility recommendation

**Exact match by default.** Explicit opt-in allowlist per DECISION
for cross-version reuse. Never infer semver compatibility from
schema-version strings.

## Open questions with recommendations (5 items)

- **Q1** — direct baseline metadata block vs registry:
  **Option A** (block in `baseline_metadata.json`).
- **Q2** — retroactive A + B annotation vs leave frozen:
  **retrofit under a separate AgentOps-5e-migrate DECISION**.
- **Q3** — telemetry-only red eligibility: **`requires_review`
  with human sign-off under telemetry_only only** (always
  ineligible if blocking_mode = blocking).
- **Q4** — checker schema compatibility rule: **exact match by
  default, explicit opt-in allowlist per DECISION**.
- **Q5** — prompt/format remediation prerequisite: **case-by-case
  in DECISION · do NOT auto-promote red · R1 remediation strongly
  preferred before first 5f-promote**.

## Confirmations

- **No generation** ✅ (no `--fixture A/B/C/D/E` run)
- **No harness / Playwright** ✅ (no `report-regression-local.mjs`
  invocation this loop)
- **No LLM / API calls** ✅ (no Anthropic · no OpenAI)
- **No baseline / schema mutation** ✅ (baseline files untouched ·
  design is spec-only)
- **No code changes** ✅ (harness + checker + `src/**` unchanged)
- **No threshold mutation** ✅ (`HARD_LATENCY_MS = 240_000` ·
  `SOFT_LATENCY_MS = 120_000`)
- **No `src/**` changes** ✅
- **No checker changes** ✅ (`scripts/quote-integrity-check.mjs`
  unchanged)
- **No pipeline changes** ✅ (`b019786` 起终一致)
- **No OpenAI API** ✅ (BLK-0003 unchanged)
- **No LLM judge** ✅
- **No edit-distance** ✅
- **No C/D/E** ✅
- **No A-E full suite** ✅
- **No uploaded PDFs** ✅
- **No `.agent/scripts/**` changes** ✅ (hard rule per AgentOps-2c Q3-Q8)
- **No `.agent/regression_baselines/**` changes** ✅
- **No `.agent/regression_fixtures/**` changes** ✅
- **No prior `.agent/regression_runs/**` mutation** ✅
- **No prior `.agent/quote_integrity_runs/**` mutation** ✅
- **No `report.md` / screenshot / full report body / long quote
  excerpts / secrets / auth / cookies / payloads committed** ✅
- **No `.env*` / `vercel.json` / Codex-Claude config changes** ✅
- **No `package.json` / lockfile / GH Actions changes** ✅
- **No production target** ✅
- **No manual deploy** ✅
- **Quote integrity remains telemetry-only** ✅
- **No blocking promotion** ✅ (still requires separate DECISION)
- BLK-0001 / BLK-0002 / BLK-0003 remain `open` ✅
- QUEUE-0002 G2.1d remains `blocked_pending_human` ✅
- Q10 pause unchanged ✅ · Codex planner spec-only ✅ ·
  `.agent/planner_reports/` empty ✅
- **Cost**: **$0** ✅

## Recommended next loop

Executor mild preference: **AgentOps-5e-migrate**
- **$0**
- Retrofit A + B `baseline_metadata.json` with the `quote_integrity`
  block using the grandfathered values in §12/§17 of the design
  memo.
- Requires explicit "grandfathering exception" clause in that
  DECISION per 5a DECISION #4.
- **No runtime activity.** **No baseline QI verdict claimed.**
  **No schema version claimed.** Only records the already-known
  fact that the baselines are grandfathered / not_evaluated /
  telemetry-only.

**Alternative**: **handoff / pause** — wait for human to decide
whether to (a) run 5e-migrate now, (b) prioritize a prompt-tune
loop for R1 first, or (c) skip 5e-migrate entirely and only apply
the schema going forward.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT implement schema.** **Do NOT mutate
baselines.** **Do NOT start prompt-tune / 5e-migrate / 5f-promote.**
