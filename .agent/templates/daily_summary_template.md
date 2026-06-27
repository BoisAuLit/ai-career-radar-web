# Daily Summary · YYYY-MM-DD

> End-of-day rollup. Authored by the human or, in later phases, by the OpenAI
> API reviewer reading the day's DECISION files.

## Metadata

- **date**: `YYYY-MM-DD`

## Tasks attempted

> Every `.agent/tasks/YYYY-MM-DD_*` file written today. Title + risk level.

| task_id | title | risk |
|---|---|---|
| `YYYY-MM-DD_run_01` | <title> | green/yellow/red |
| `YYYY-MM-DD_run_02` | <title> | green/yellow/red |

## Tasks completed

> Subset of "attempted" where the matching DECISION verdict was `approve` or `open_next_task`.

| task_id | verdict |
|---|---|
| `YYYY-MM-DD_run_01` | approve |
| `YYYY-MM-DD_run_02` | request_changes |

## Commits created

> Every commit hash + subject created across all today's runs. Branch noted.

- `<short-hash>` <subject> · branch `agent/<task_id>`
- `<short-hash>` <subject> · branch `agent/<task_id>`

## Build status

> Aggregate. `all-pass` | `mixed` | `some-failed`. Note the failing tasks.

`all-pass` (or: `mixed — run_03 build failed; rolled back`)

## Open risks

> Risks raised in today's DECISIONs that have not yet been mitigated.

- <risk 1: which task surfaced it + current status>
- <risk 2>

## Recommended next-day tasks

> Pre-drafted TASK titles + risk levels for tomorrow. The human can promote
> any of these into a real TASK file by copying into `.agent/tasks/`.

1. `<title>` — risk `<level>` — depends on: `<prior task_id if any>`
2. `<title>` — risk `<level>`

## Human decisions needed

> Open questions or red-zone approvals waiting on the human.

- <decision needed 1>
- <decision needed 2>
