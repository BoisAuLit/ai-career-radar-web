# RUN REPORT · <task title>

> Authored by Claude Code after executing the TASK. Forms the input for the
> next DECISION file.

## Metadata

- **task_id**: `YYYY-MM-DD_run_XX` (must match the TASK file)
- **date**: `YYYY-MM-DD`
- **run_number**: `XX`
- **branch**: `agent/<task_id>` (or the actual branch if different — say so)

## Commits

> List every commit made during this run. Hash + first line of message.
> `none` if no commit was created.

- `<short-hash>` <commit subject>
- `<short-hash>` <commit subject>

## Files changed

> Output of `git diff --stat <base>..HEAD`. Every modified / added / deleted
> file, with line counts.

```
 path/to/file.tsx | 42 +++++++++++++-------
 path/to/other.md | 12 ++++++--
 2 files changed, 38 insertions(+), 16 deletions(-)
```

## Summary

<3-6 sentences describing what was done, what worked, what didn't. Plain
language; specifics over hand-waving.>

## Regression verdict

> Introduced by AgentOps-3f (2026-07-12). Every RUN_REPORT includes this
> section. For non-report-affecting tasks, set `regression_required: no`
> and explain why. Field-level guidance:
> `.agent/templates/regression_verdict_section.md`. Full protocol:
> `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`.

- **regression_required**: `yes` | `no`
- **reason_required_or_not**: <1-3 sentences>
- **harness_used**: `yes` | `no`
- **harness_command**: `node scripts/report-regression-local.mjs` (or exact command)
- **fixture_ids**: `A` (or comma-separated list)
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

> **Push implication rules** (do not edit; identical to §7 of the 3f memo):
>
> - `required_green` + no other blockers → push eligible after human approval.
> - `required_amber` → no push until reviewed.
> - `required_red` → no push; fix/revert first.
> - `unavailable` → no automatic push; human decides.
> - `not_required` → normal process (explain reason above).
> - `skipped_with_reason` → only if human explicitly approved skip.

## Constraints checked

> Walk through the TASK's `forbidden_files` list and explicitly affirm or deny.

- [ ] `.github/workflows/*` — untouched
- [ ] `src/lib/prompts.ts` — untouched
- [ ] `src/data/web_bundle.json` — untouched
- [ ] `package.json` — untouched (or: "modified to add `<script_name>` npm script — non-dep change, Yellow under policy §4")
- [ ] `.env*` — untouched
- [ ] pipeline repo files — untouched (none accessed)
- [ ] No new dependencies added

## Red-zone check

> Independently audit against `.agent/policies/agent_policy.md` §4 red-zone list.

- Red-zone files modified this run: `none` (or list)
- Approval reference for any red-zone modification: `<message / DECISION ref>` (or N/A)

## Validation results

> Output of the TASK's `validation_commands`, summarized.

```
$ git status   (before)
clean

$ npm run build
✓ Compiled in 1.8s

$ git status   (after)
2 files modified
```

## Build result

`pass` | `fail` | `not-run` (with reason)

If `fail`, paste the error and stop.

## Tests result

`pass` | `fail` | `n/a` (with reason; e.g. "no tests in this directory")

## Screenshots (if any)

> List paths under `temporary/screenshots/` produced by `npm run screenshot`,
> or any other artifacts. Note what visual change they confirm.

- `temporary/screenshots/desktop/sample-report.png` — confirms new pull-quote styling

## Risks

> What could go wrong with the changes that the DECISION reviewer should
> know about.

- <risk 1: what + likelihood + blast radius>
- <risk 2>

## Follow-up recommendations

> Concrete suggestions for the next TASK. The DECISION will likely pick from
> this list.

- <next-step suggestion 1>
- <next-step suggestion 2>

## Ready for review

`yes` | `no`

> `no` means the task was aborted (build failed, red-zone hit, etc.) — explain why.

## Requires human decision

`yes` | `no`

> `yes` if any of:
> - A red-zone file was touched (regardless of prior approval).
> - The build or tests failed.
> - A `forbidden_files` entry was modified.
> - The change visibly affects production behavior.
> - The task hit a Hard Stop (policy §3).
