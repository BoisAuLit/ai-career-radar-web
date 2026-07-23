# DECISION · AgentOps-5e · Baseline quote-integrity schema fold · design approval

## Metadata

- **decision_id**: `2026-07-23_run_05_DECISION`
- **date**: 2026-07-23
- **based_on_run_report**: `.agent/run_reports/2026-07-23_run_05_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-23_run_05_TASK.md`
- **based_on_design_memo**: `.agent/design_memos/2026-07-23_AgentOps-5e_baseline_quote_integrity_schema_fold.md`
- **based_on_findings**: `.agent/findings/2026-07-23_baseline_quote_integrity_schema_inventory.json`
- **loop**: AgentOps-5e
- **parent_decision**: `.agent/decisions/2026-07-23_run_04_DECISION.md` (AgentOps-5d-cosmetic)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (design-only approval · push and any migration require separate human GO)
- **required_fixes**: **none**

## Reasoning summary

AgentOps-5e successfully completed a **$0 inspection / design pass** for
explicitly representing quote-integrity state in regression baseline
metadata. Current Fixture A and B baselines contain only prose notes
stating that quote integrity is not yet a gate, which is not
machine-checkable and does not clearly encode evaluation status,
schema version, grandfathering, blocking policy, or promotion
eligibility.

The design recommends a **backward-compatible `quote_integrity` block
directly inside `baseline_metadata.json`**, with `evaluation_status`
separated from `verdict` and with policy, grandfathering,
evaluator-version, lineage, and promotion fields represented
explicitly. Detailed quote-integrity counts and findings remain in
immutable source-run artifacts rather than being duplicated into
baseline metadata.

The design defines invariants, a promotion-eligibility model,
exact-match schema compatibility by default, and a controlled migration
path for existing A/B baselines. **No baseline, schema, runtime,
harness, checker, source, pipeline, threshold, fixture, or production
changes occurred.**

## Approved direction

- Approve the AgentOps-5e schema design.
- **Select Option A**: add a flat `quote_integrity` block directly to
  `baseline_metadata.json`.
- **Reject** a separate global registry as the primary source of truth.
- **Reject** docs-only representation.
- Keep detailed counts, red/amber reasons, and sample items in source
  `quote_integrity_summary.json` artifacts.
- Keep `evaluation_status` and `verdict` as separate dimensions.
- Keep `blocking_mode` explicit.
- Keep `grandfathered` and `grandfather_reason` explicit.
- Keep `schema_version` and `checker_commit` explicit for evaluated
  baselines.
- Use exact schema-version match by default.
- Require explicit DECISION compatibility allowlists for schema drift.
- Do NOT infer compatibility from semantic-looking version strings.
- Do NOT silently change `blocking_mode`.
- Do NOT treat legacy GREEN as equivalent to quote-integrity
  eligibility.
- Do NOT mutate or promote baselines in this DECISION loop.
- Keep quote integrity **telemetry-only**.
- Do NOT start AgentOps-5f-promote.

## Approved schema

```json
{
  "quote_integrity": {
    "evaluation_status": "not_evaluated | evaluated | blocked | error",
    "verdict": "green | amber | red | null",
    "schema_version": "string | null",
    "checker_commit": "string | null",
    "blocking_mode": "telemetry_only | blocking",
    "grandfathered": "boolean",
    "grandfather_reason": "string | null",
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

## Field policy

- **evaluation_status** — required
- **verdict** — required but nullable
- **schema_version** — required for `evaluated`; `null` for
  `not_evaluated`
- **checker_commit** — required for future evaluated promotions where
  available; `null` for grandfathered `not_evaluated` baselines
- **blocking_mode** — required
- **grandfathered** — required
- **grandfather_reason** — required when `grandfathered = true`
- **evaluated_run_id** — required for `evaluated`; `null` otherwise
- **evaluated_at** — required for `evaluated`; `null` otherwise
- **summary_path** — required for `evaluated` when summary exists;
  `null` otherwise
- **promotion_eligibility** — required
- **promotion_reasons** — required array
- **reviewed_by** — required array, **but do not invent reviewers**
- **decision_id** — required for migration / promotion decisions

**Do NOT copy into baseline metadata**:
- quote counts
- red reasons
- amber reasons
- sample items
- long excerpts
- full quote-integrity summaries

## State model

- **`evaluation_status`**: `not_evaluated | evaluated | blocked | error`
- **`verdict`**: `green | amber | red | null`
- **Policy dimensions**: `blocking_mode` · `grandfathered`

## Required invariants

1. `not_evaluated` must have `verdict = null`.
2. `evaluated` must have non-null `verdict`, `schema_version`,
   `evaluated_run_id`, and evaluation evidence.
3. `blocked` source runs cannot be promoted.
4. `checker-error` source runs cannot be promoted.
5. Legacy GREEN does not imply quote-integrity eligibility.
6. Red under `blocking` mode is ineligible.
7. Red under `telemetry_only` requires explicit review.
8. `grandfathered = true` requires a `grandfather_reason`.
9. Evaluated promoted baselines must point to immutable source
   artifacts and a DECISION.
10. Baseline metadata must not claim a QI result that was never
    evaluated.
11. Schema drift requires explicit compatibility approval or
    re-evaluation.
12. Blocking mode must never change silently.

## Promotion eligibility

### Hard blockers → `ineligible`

- Legacy verdict is not GREEN
- `evaluation_status` is `not_evaluated` for a new non-grandfathered
  promotion
- `evaluation_status` is `blocked`
- `evaluation_status` is `error`
- Report does not exist
- Missing immutable source run
- Missing promotion DECISION
- Quote-integrity RED while `blocking_mode = blocking`

### Requires review

- `grandfathered = true`
- Quote-integrity RED under `telemetry_only`
- Quote-integrity AMBER
- Accepted schema drift
- Compatibility allowlist required
- Prompt / format concerns remain

### Non-blocking warnings

- Terminal-punctuation-only R2 match
- Appendix entry not cited
- Other explicitly non-blocking telemetry findings

## Current A + B recommendation

- Current Fixture A and B baselines remain **valid grandfathered
  historical baselines**.
- They must **not** be described as quote-integrity **evaluated**.
- Their current state should later be represented as:
  - `evaluation_status`: `not_evaluated`
  - `verdict`: `null`
  - `schema_version`: `null`
  - `checker_commit`: `null`
  - `blocking_mode`: `telemetry_only`
  - `grandfathered`: `true`
  - `grandfather_reason`: `"pre_quote_integrity_baseline"`
  - `evaluated_run_id`: `null`
  - `evaluated_at`: `null`
  - `summary_path`: `null`
  - `promotion_eligibility`: `requires_review`
  - `promotion_reasons`:
    - `"grandfathered_pre_quote_integrity_baseline"`
    - `"quote_integrity_not_evaluated"`
  - `reviewed_by`: `[]`
  - `decision_id`: the future AgentOps-5e-migrate DECISION id

### Important

- The future migration **records already-known truth**.
- It does **NOT** retroactively evaluate or reclassify A / B quote
  integrity.
- It does **NOT** promote a new baseline.
- It does **NOT** alter baseline report content.
- It does **NOT** imply current A / B baselines passed the checker.

## Grandfathering exception

Authorize a future **separate `AgentOps-5e-migrate` DECISION** to make
a narrow metadata-only exception to the normal frozen-baseline rule
(established in `2026-07-21_run_01_DECISION` — AgentOps-5a #4):

- Only `fixture-A/current/baseline_metadata.json` and
  `fixture-B/current/baseline_metadata.json` may be changed.
- Only the new `quote_integrity` block may be added.
- No existing metadata field may be changed.
- No baseline report, screenshot, verdict, manifest, pointer, or
  source-run artifact may be changed.
- Values must represent `not_evaluated` and grandfathered truth only.
- Migration must be reviewable and reversible.
- Migration must **not** be described as QI evaluation or baseline
  promotion.

## Schema compatibility

- Exact `schema_version` match by default.
- Compatibility may be granted only through explicit DECISION.
- Do NOT infer semantic compatibility from version naming.
- `checker_commit` should be retained for auditability.
- Old grandfathered baselines may remain grandfathered without
  retroactive evaluation.
- Future `blocking_mode` changes require a **separate policy
  DECISION**.

## Source of truth

- **`baseline_metadata.json`** — baseline-level QI state, policy,
  grandfathering, eligibility, and references
- **Source run metadata** — run identity, legacy result, report state,
  completion state
- **`quote_integrity_summary.json`** — detailed checker findings and
  counts
- **DECISION** — compatibility, migration, promotion, human approval,
  exceptions
- **Harness / checker** — current implementation behavior, not
  historical baseline truth

## Open-question resolutions

**Q1. Metadata block or registry?**
- **Choose direct `baseline_metadata.json` block.**

**Q2. Retrofit A / B or leave unchanged?**
- Retrofit only through separate **AgentOps-5e-migrate DECISION** using
  the explicit grandfathering exception.
- **No mutation in the current design loop.**

**Q3. Can telemetry-only RED be promoted?**
- **Never automatically.**
- It is `requires_review` under `telemetry_only`.
- It is `ineligible` under `blocking` mode.
- **Human approval and explicit reasoning are required.**

**Q4. Schema compatibility rule?**
- **Exact match by default.**
- **Explicit DECISION allowlist for exceptions.**

**Q5. Must prompt / format remediation happen before promotion?**
- **Decide case by case**, but R1 remediation is strongly preferred
  before the first quote-integrity-aware promotion.
- **Do NOT auto-promote a RED source run.**

## Recommended next loop

**`AgentOps-5e-migrate`**

### Scope

- **$0**.
- Metadata-only migration.
- Add the approved `quote_integrity` block to:
  - `fixture-A/current/baseline_metadata.json`
  - `fixture-B/current/baseline_metadata.json`
- Use grandfathered + `not_evaluated` values only.
- Preserve every existing field byte-for-byte where practical, except
  deterministic JSON formatting required to add the block.
- Do NOT modify other baseline files.
- Do NOT evaluate quote integrity.
- Do NOT promote baselines.
- Do NOT run generation.
- Do NOT run harness / Playwright.
- Do NOT call LLM / API.
- Do NOT modify `src`, checker, harness, pipeline, thresholds,
  prompts, or model selection.
- Include validation proving only two `baseline_metadata.json` files
  changed.
- Requires separate **TASK**, **RUN_REPORT**, **DECISION**, and
  **explicit human approval**.

## Risks found

1. Migration touches frozen baseline metadata and therefore requires
   the explicit grandfathering exception.
2. Direct metadata mutation must not be confused with evaluation.
3. Existing consumers must tolerate the new optional block.
4. JSON formatting may produce noisy diffs if not handled carefully.
5. `reviewed_by` must not contain invented reviewer identities.
6. `schema_version` must remain `null` for `not_evaluated` baselines.
7. Current A / B baselines remain `requires_review`.
8. Quote integrity remains telemetry-only.
9. R1 grammar-bridging issue remains unresolved.
10. C / D / E have not been real-run.
11. Uploaded PDFs remain out of scope.
12. BLK-0001 / BLK-0002 / BLK-0003 remain open.

## Non-blocking follow-ups

- **Push AgentOps-5e design after human approval.**
- Update daily summary after push.
- Then start `AgentOps-5e-migrate`.
- **Do NOT implement migration before design DECISION is pushed.**
- **Do NOT run generation.**
- **Do NOT mutate baselines outside the approved migration scope.**
- **Do NOT start prompt-tune or AgentOps-5f-promote yet.**
- **Do NOT introduce OpenAI API.**
- **Do NOT modify `src` or pipeline.**

## Stop condition

DECISION written and committed. **Do NOT push.** Wait for explicit
human GO before pushing AgentOps-5e design commits and before starting
`AgentOps-5e-migrate`.
