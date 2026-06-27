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
