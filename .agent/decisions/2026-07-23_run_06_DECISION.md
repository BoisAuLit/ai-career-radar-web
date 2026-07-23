# DECISION · AgentOps-5e-migrate · Baseline quote-integrity metadata migration

## Metadata

- **decision_id**: `2026-07-23_run_06_DECISION`
- **date**: 2026-07-23
- **based_on_run_report**: `.agent/run_reports/2026-07-23_run_06_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-23_run_06_TASK.md`
- **based_on_design_memo**: `.agent/design_memos/2026-07-23_AgentOps-5e-migrate.md`
- **authorizing_decision**: `.agent/decisions/2026-07-23_run_05_DECISION.md`
- **implementation_commit**: `d27132b`
- **memo_commit**: `899e3d8`
- **run_report_commit**: `aad1de7`
- **loop**: AgentOps-5e-migrate
- **parent_loop**: AgentOps-5e (`2026-07-23_run_05`)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (design-only approval; push and
  any subsequent loop require separate human GO)
- **required_fixes**: **none**

## Reasoning summary

AgentOps-5e-migrate correctly executed the explicitly authorized
narrow metadata-only grandfathering exception for the current
Fixture A and Fixture B regression baselines. **Exactly two
`baseline_metadata.json` files were modified**, with the approved
`quote_integrity` block added using identical grandfathered and
`not_evaluated` values. **No existing metadata field changed**:
reconstructed pre-migration objects were **deeply equal** to
post-migration objects after removing the newly added
`quote_integrity` block for both fixtures. Both metadata files and
their reconstructed pre-migration versions parsed successfully, and
the full `quote_integrity` blocks matched the approved object exactly.
**Ten sibling baseline artifacts remained unchanged.** No
quote-integrity evaluation, baseline promotion, generation, harness
execution, Playwright, dev server, LLM/API call, runtime change,
checker change, harness change, source change, pipeline change, or
deployment occurred. **The migration records already-known historical
truth and does not imply that Fixture A or Fixture B passed the
quote-integrity checker.**

## Approved direction

- Approve AgentOps-5e-migrate.
- Accept the narrow grandfathering exception as properly executed.
- Accept the `quote_integrity` blocks added to the current A and B
  baseline metadata.
- Accept `evaluation_status = not_evaluated`.
- Accept `verdict = null`.
- Accept `schema_version = null`.
- Accept `checker_commit = null`.
- Accept `blocking_mode = telemetry_only`.
- Accept `grandfathered = true`.
- Accept `grandfather_reason = "pre_quote_integrity_baseline"`.
- Accept `evaluated_run_id = null`.
- Accept `evaluated_at = null`.
- Accept `summary_path = null`.
- Accept `promotion_eligibility = "requires_review"`.
- Accept the two approved `promotion_reasons`.
- Accept `reviewed_by = []`.
- Accept `decision_id = "2026-07-23_run_06_DECISION"`.
- Preserve existing notes and all existing metadata fields.
- Do **not** describe this migration as quote-integrity evaluation.
- Do **not** describe this migration as baseline promotion.
- Do **not** imply A/B passed the checker.
- Keep quote integrity **telemetry-only**.
- Do **not** begin AgentOps-5f-promote.

## Migration scope

**Changed baseline files (exactly 2)**:

- `.agent/regression_baselines/fixture-A/current/baseline_metadata.json`
- `.agent/regression_baselines/fixture-B/current/baseline_metadata.json`

**Non-baseline artifacts**:

- `.agent/tasks/2026-07-23_run_06_TASK.md`
- `.agent/design_memos/2026-07-23_AgentOps-5e-migrate.md`
- `.agent/run_reports/2026-07-23_run_06_RUN_REPORT.md`

**No other baseline files changed.**

## Exact quote_integrity block

```json
{
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

## Validation summary

- Fixture A pre-migration JSON parse: **PASS**
- Fixture A post-migration JSON parse: **PASS**
- Fixture B pre-migration JSON parse: **PASS**
- Fixture B post-migration JSON parse: **PASS**
- Fixture A exact `quote_integrity` block: **PASS**
- Fixture B exact `quote_integrity` block: **PASS**
- Fixture A `deepStrictEqual` after removing `quote_integrity`:
  **PASS**
- Fixture B `deepStrictEqual` after removing `quote_integrity`:
  **PASS**
- Fixture A existing top-level fields preserved: **34**
- Fixture B existing top-level fields preserved: **35**
- Fixture A notes array unchanged
- Fixture B notes array unchanged
- promotion metadata unchanged
- source-run identifiers unchanged
- stability metadata unchanged

## Sibling baseline audit

Unchanged for both A and B:

- `baseline_structural_checks.json`
- `baseline_summary.md`
- `baseline_verdict.md`
- `promotion_decision.md`
- `source_run_id.txt`

**Total sibling files verified unchanged: 10.**

## Consumer compatibility

- **No current `scripts/**` or `src/**` code consumer** of
  `baseline_metadata.json` was found.
- No `Ajv`, `additionalProperties` restriction, strict schema
  validator, or exact top-level-key comparison was found.
- Current inspected repository consumers therefore **present no
  identified compatibility blocker**.
- **Do not state that compatibility risk is universally zero.**
  Future external consumers or newly added strict consumers were
  not covered by this inspection.
- Any future consumer should treat `quote_integrity` as an
  **optional backward-compatible top-level block** until all
  baselines carry it.

## Semantic interpretation

- Fixture A remains a **grandfathered historical baseline**.
- Fixture B remains a **grandfathered historical baseline**.
- Fixture A remains **quote-integrity not evaluated**.
- Fixture B remains **quote-integrity not evaluated**.
- Both remain **`requires_review`**.
- The migration records **historical truth only**.
- The migration does **not** reclassify prior runs.
- The migration does **not** copy findings from newer controlled runs
  into older baselines.
- The migration does **not** create a new source run.
- The migration does **not** promote either baseline.
- The migration does **not** change blocking policy.
- **Quote integrity remains telemetry-only.**

## Grandfathering exception result

- Only the two approved current `baseline_metadata.json` files
  changed.
- Only a `quote_integrity` block was added.
- Existing fields remained logically identical
  (`deepStrictEqual` PASS × 2).
- No report, screenshot, verdict, structural check, promotion
  decision, pointer, or source-run artifact changed.
- The migration is reviewable.
- The migration is reversible.
- **Implementation rollback**: `git revert d27132b`

## What did not happen

- no quote-integrity evaluation
- no baseline promotion
- no generation
- no fixture execution
- no Playwright
- no dev server
- no Anthropic call
- no OpenAI call
- no report generation
- no checker execution
- no harness execution
- no `src` changes
- no checker changes
- no harness changes
- no threshold changes
- no pipeline changes
- no production deployment
- no blocking promotion

## Risks remaining

1. Current A/B baselines remain `not_evaluated` and require review.
2. The new block is not yet actively enforced by a baseline lint or
   promotion-checking tool.
3. Future external or strict consumers may need explicit optional-
   field support.
4. `reviewed_by` is intentionally empty and does not by itself record
   an individual reviewer.
5. R1 grammar-bridging issue for `jd_000201` remains unresolved.
6. Error-state fail-fast remains dynamically unexercised.
7. Exact source of prior transient 502 remains unknown.
8. C/D/E do not have real generated regression runs.
9. Quote integrity remains telemetry-only.
10. BLK-0001 / BLK-0002 / BLK-0003 remain `open`.

## Recommended next direction

**Do not begin AgentOps-5f-promote.**

### Preferred next substantive loop

A **dedicated prompt / format inspection and tuning design loop**
for the recurring R1 grammar-bridging issue, especially
`jd_000201`.

Initial scope:

- inspection and design first
- do **not** silently loosen R1
- determine whether the generated quote changes grammar around an
  otherwise sourced phrase
- inspect prompt and output format requirements
- design a fix that requires evidence quotes to be exact contiguous
  source text
- preserve R2 terminal-punctuation allowance
- keep quote integrity telemetry-only
- no promotion until controlled validation succeeds
- paid A/B validation requires a separate explicit decision and cost
  approval

### Alternative future loop

**Baseline QI lint / promotion eligibility checker design**:

- reads the new `quote_integrity` block
- validates invariants
- does not mutate baselines
- **$0** design / implementation possible
- should occur before broad automated promotion

### Do not

- start AgentOps-5f-promote
- promote QI to blocking
- automatically promote a telemetry-only RED run
- mutate other baseline artifacts
- retroactively evaluate A/B baselines
- silently loosen R1 / R2

## Non-blocking follow-ups

- **Push AgentOps-5e-migrate after explicit human approval.**
- Update the daily summary after push.
- Then pause for human choice between:
  1. prompt / format R1 inspection and design
  2. baseline QI lint / promotion checker
- **Keep quote integrity telemetry-only.**
- **Do not run fixtures during cleanup.**
- **Do not introduce OpenAI API.**
- **Do not modify pipeline.**

## Stop condition

DECISION written and committed. **Do NOT push.** Wait for explicit
human GO before pushing AgentOps-5e-migrate commits and before
starting the next substantive loop.
