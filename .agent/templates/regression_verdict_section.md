# Regression verdict — reusable RUN_REPORT section

> **Introduced by**: AgentOps-3f (2026-07-12).
> **Canonical source**: `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`.
> **Purpose**: Standalone reusable snippet. Paste this section verbatim
> into any RUN_REPORT whose base template does not yet carry it. The
> field order below is canonical — do not reorder without a new
> DECISION.

---

## Regression verdict

- **regression_required**: `yes` | `no`
- **reason_required_or_not**: <1-3 sentences>
- **harness_used**: `yes` | `no`
- **harness_command**: `node scripts/report-regression-local.mjs` (or exact command)
- **fixture_ids**: `A` (or comma-separated list, e.g. `A, B`)
- **target_environment**: `http://localhost:3000` (never production)
- **latest_run_id**: `YYYYMMDDTHHMMSSZ_fixture-<X>` (or `n/a`)
- **verdict**: `green` | `amber` | `red` | `unavailable` | `not_required` | `skipped_with_reason`
- **exit_code**: 0 (green) | 1 (red) | 2 (amber) | `n/a`
- **artifact_paths**: `.agent/regression_runs/<run-id>/{metadata,structural_checks,verdict}.*`
- **report_char_count**: <integer> or `n/a`
- **capture_scope**: e.g. `main section` | `body_fallback` | `n/a`
- **fallback_used**: `true` | `false` | `n/a`
- **red_checks_failed**: <count>
- **amber_checks_failed**: <count>
- **cost_measured**: `yes` | `no`
- **estimated_cost**: e.g. `≈ $0.05` or `n/a`
- **duration_ms**: <integer> or `n/a`
- **baseline_promoted**: `yes` | `no` (default `no` while baseline promotion deferred)
- **production_target_used**: `yes` | `no` (must be `no` for the harness)
- **reviewer_action_required**: e.g. `human + ChatGPT review of amber` | `none` | `fix red before push`
- **push_implication**: `push eligible after human approval` | `no push until reviewed` | `no push; fix/revert first` | `no automatic push; human decides` | `normal process` | `conditional on approved skip`

---

## Regression state vocabulary

Use exactly one of these values in `verdict`:

- **`not_required`**: Task cannot affect generated report content /
  structure / evidence / streaming / export. Must explain in
  `reason_required_or_not`.
- **`unavailable`**: Regression should have been run, but harness or
  environment was unavailable. Must explain cause.
- **`required_green`** (shortcut: `green`): Regression required, was
  run, produced green (exit 0), all red + amber passed,
  `fallback_used=false`.
- **`required_amber`** (shortcut: `amber`): Regression required, was
  run, produced amber (exit 2). At least one amber failed; no red
  failed; body fallback not used.
- **`required_red`** (shortcut: `red`): Regression required, was run,
  produced red (exit 1). At least one red-level check failed.
- **`skipped_with_reason`**: Regression required by rule, but human
  explicitly approved a skip. Must include recorded reason and DECISION
  acknowledgement.

## Push implication rules

Derive `push_implication` from `verdict` + `regression_required`:

- `regression_required=yes` AND `verdict ∈ {green, required_green}` →
  **push eligible after human approval**.
- `verdict ∈ {amber, required_amber}` → **no push until reviewed**.
  Amber may be measurement noise or real regression — DECISION file
  must call it explicitly.
- `verdict ∈ {red, required_red}` → **no push; fix or revert first**.
  Never override a red without an explicit DECISION acknowledging the
  specific red check.
- `verdict = unavailable` → **no automatic push; human decides**. Do
  not pretend green when harness could not run.
- `regression_required=no` → **normal process**. Must explain why not
  required.
- `verdict = skipped_with_reason` → **only if human explicitly approved
  skip**. Recorded reason must appear in both RUN_REPORT and DECISION.
  Queue a follow-up regression run in the next appropriate loop.

## When regression is required

**Required** (report-affecting):
- Prompt changes (`src/lib/prompts.ts` etc.)
- Model / provider selection changes
- Report generation route changes (`src/app/api/generate-report/route.ts`)
- Report renderer changes (`src/app/page.tsx` markdown / streaming /
  sentinel)
- Resume / PDF parsing input changes
- Eval / report-quality changes
- Retrieval / corpus selection changes (`src/data/**`, snapshot bumps)
- Source / corpus promotion visible via `src/data/web_bundle.json`
- Anything that plausibly changes what the report says or how it renders

**Not required**:
- `.agent/**` docs (this section itself is `.agent/`-only)
- Design memos, daily summaries, protocol changes
- Pipeline-repo-only changes that do NOT feed into `src/data/`
- Tests / harness scripts (unless they change what regression measures)

**Not sufficient alone** (require additional sign-off on top of green):
- Red-zone classifier / prompt / schema changes → need prior human
  approval in a red DECISION.
- Legal / compliance data-source changes → need legal/compliance
  sign-off.
- Production deployment decisions → production is never targeted by
  the harness; green localhost ≠ certified production.

---

**Reference**: full protocol in
`.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`.
Template embedded in
`.agent/templates/run_report_template.md`. Planner-side companion in
`.agent/templates/planner_regression_guidance.md`.
