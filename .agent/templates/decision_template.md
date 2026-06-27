# DECISION · <task title>

> Authored by ChatGPT (or, in later AgentOps phases, the OpenAI API reviewer)
> after reading the RUN_REPORT. Determines whether the run is accepted,
> needs changes, must stop, or feeds directly into the next TASK.

## Metadata

- **decision_id**: `YYYY-MM-DD_run_XX` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/YYYY-MM-DD_run_XX_RUN_REPORT.md`

## Verdict

> Exactly one:

- `approve` — RUN_REPORT is acceptable; if `human_approval_needed` is no, proceed to next task.
- `request_changes` — RUN_REPORT has fixable issues; do NOT merge; executor should re-run with `required_fixes`.
- `stop` — abort this thread of work; do not iterate.
- `open_next_task` — RUN_REPORT is acceptable AND a follow-up task is now defined below; proceed to step 1 of the loop.

## Reasoning summary

<3-5 sentences. Why this verdict. What signal in the RUN_REPORT drove it.>

## Risks found

> Risks raised by the RUN_REPORT plus any the reviewer noticed independently.
> Empty list is fine if there are none — say so explicitly.

- <risk 1: description + severity (low / med / high)>
- <risk 2>

## Red-zone flags

> Any red-zone path (`.agent/policies/agent_policy.md` §4) touched by this
> run, listed regardless of whether it was pre-approved.

- `none` (or: `package.json` — but this was a script-only edit, pre-approved in TASK)

## Required fixes

> Only present when verdict is `request_changes`. Concrete diff-level
> instructions the executor must apply before re-submitting.

- <fix 1>
- <fix 2>

## Next task prompt for Claude

> Only present when verdict is `open_next_task` OR `approve` with a follow-up.
> A complete TASK-template-ready prompt the human can paste to Claude Code,
> or save as `.agent/tasks/<next_task_id>_TASK.md`.

```markdown
# TASK · <next task title>
...
```

## Human approval needed

`yes` | `no`

> `yes` if:
> - Verdict is `approve` for a task that touched red-zone files.
> - Verdict is `open_next_task` and the next task is Red.
> - Verdict is `stop` for a reason the human should sign off on (e.g. a previously approved direction needs to be reversed).
>
> When `yes`, do not execute the `next_task_prompt_for_claude` until the
> human explicitly approves in writing.
