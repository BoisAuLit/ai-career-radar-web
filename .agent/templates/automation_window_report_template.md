# Automation window report · `<report_id>`

> Copy this template to
> `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md` at the start
> of an Automation Window, fill as the window runs, close at end of
> window. **Required**: every Automation Window produces or updates
> exactly one such report. See
> `.agent/policies/automation_policy.md` §7.
>
> This report is the human's primary input during Non-Automation Time.
> Optimize for **easy paste into ChatGPT Chat**: keep sections short,
> use tables, name every commit hash, link every file path.

## Metadata

- **report_id**: `YYYY-MM-DD_<WINDOW>_REPORT`
- **date**: `YYYY-MM-DD`
- **window_name**: one of `SLEEP_WINDOW` / `WORKDAY_WINDOW` / `WEEKEND_WINDOW` / `MANUAL_DRY_RUN`
- **window_type**: `automation` (the first three) or `manual_dry_run`
- **time_range**: `HH:MM` local start → `HH:MM` local end
- **generated_by**: `codex_cli + claude_code` (or `human_manual` for a dry run)
- **reviewed_by**: filled by the human after Non-Automation Time
  review (`bohao`, `bohao + chatgpt`, etc.)
- **status**: `in_progress` / `ready_for_review` / `reviewed_approved` / `reviewed_changes_requested` / `aborted`

## Executive summary

> 3-5 sentences a human can read in 30 seconds. What was attempted,
> what shipped, what's blocked, what needs the human's call.

## Goals selected by Codex

> List of queue items Codex chose for this window, with rationale.

| queue_id | title | priority | risk | rationale |
|---|---|---|---|---|
| `QUEUE-0042` | … | high | yellow | "Closes existing G2.1c follow-up loop." |

## Tasks attempted

| task_id | title | risk | repo | result |
|---|---|---|---|---|
| `2026-06-29_run_01` | … | yellow | web | completed |
| `2026-06-29_run_02` | … | red | pipeline | blocked (BLK-0007) |

## Tasks completed

> Subset of "attempted" where the matching DECISION verdict was
> `approve` or `open_next_task`.

| task_id | verdict | notes |
|---|---|---|

## Commits created

**Web repo** (`/Users/bohaoli/Desktop/ai-career-radar-web`):
- `<short-hash>` <subject> · branch `<branch>` · merged/pushed `yes/no`

**Pipeline repo** (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`):
- `<short-hash>` <subject> · branch `<branch>` · merged/pushed `yes/no`

(`none` if no commit was created.)

## Files changed

> Per repo. Tight `git diff --stat`-style.

```
<repo> · <branch>
 path/to/file        | <N> ++/--
 path/to/other       | <N> ++/--
```

## Validation results

> One row per TASK or sub-step that ran a validation.

| what | command | result | notes |
|---|---|---|---|
| build | `npm run build` | pass | 14 routes · TS clean |
| eval JSONL parse | `python validator.py` | pass | 37 rows · 0 quote misses |
| spec sanity | `wc -l corpus/taxonomy/G2.1_spec.md` | 543 | — |

## Claude Code usage summary

> Optional but encouraged. Token / cost estimate per task if Claude
> Code reports it; otherwise note `unavailable`.

| task_id | tokens (approx) | cost (approx USD) | notes |
|---|---|---|---|

## Codex review summary

> What Codex flagged when reviewing Claude Code's output. One bullet
> per finding.

- ✅ `<task_id>` — clean diff, scope respected.
- ⚠ `<task_id>` — over-included one unrelated file; fixed by reverting that hunk.
- 🛑 `<task_id>` — red-zone encounter; blocker created.

## Red-zone encounters

> Every time automation hit a Red-policy boundary during this window.

| time | task | red-zone path | blocker_id |
|---|---|---|---|
| 03:14 | `…_run_02` | `corpus/schema/extracted.schema.json` | `BLK-0007` |

`0` is the happy path. Anything > 0 must produce blockers.

## Blockers created or updated

> Append to `.agent/blockers.md`. Cross-reference here.

| blocker_id | reason | risk | human_decision_needed |
|---|---|---|---|

## Failed validations

> Every failed validation, with command + first 5 lines of output.

```
<task_id> · <command>
<top of error output>
```

`(none)` is fine.

## Merge / push / deploy status

| repo | branch | merged into main? | pushed to origin? | Vercel deploy? |
|---|---|---|---|---|
| web | `agent/<id>` | yes | yes | auto (non-disruptive) |
| pipeline | `agent/<id>` | **NO — awaiting human approval** | no | n/a |

## Human decisions requested

> Numbered list. Each item must be answerable with "approve / reject
> / defer" + an optional one-line note.

1. Approve merge + push of pipeline branch `agent/<id>`?
2. Promote `BLK-0007` to a yellow TASK for `<…>`?
3. Revise queue priorities (move `QUEUE-0042` ahead of `QUEUE-0041`)?

## Suggested ChatGPT review questions

> Copy-paste-ready prompts the human can send into ChatGPT Chat.

```
> Review the automation window report at
> .agent/automation_runs/<report_id>.md. Flag any decision that
> looks risky given the AgentOps policy at
> .agent/policies/automation_policy.md, and propose a verdict for
> each of the human-decision items.
```

## Next recommended automation tasks

> Codex's draft of what should run next (next window, or next session).

| order | candidate | risk | rationale |
|---|---|---|---|
| 1 | `QUEUE-0043` | yellow | "Closes G2.1d eval set follow-up." |
| 2 | new TASK from `BLK-0007` | red | "Pending human GO." |

## Safety audit

> A small per-window audit. Mirror of the policy §6 / §11.

- [ ] No red-zone file changed without prior human approval
- [ ] No forbidden file changed in any task this window
- [ ] No `python -m scripts.collector …` invoked unless TASK explicitly allowed
- [ ] No LLM call beyond Claude Code / Codex CLI standard usage
- [ ] No new GitHub Actions / cron / workflow
- [ ] No new deps (npm or python)
- [ ] No OpenAI API SDK / key / HTTP usage
- [ ] No force push / history rewrite / destructive reset
- [ ] No manual deploy
- [ ] No autonomous loop / daemon / scheduler created

Any unchecked box → escalate in "Human decisions requested" above.

## Final status

`ready_for_review` | `reviewed_approved` | `reviewed_changes_requested` | `aborted`

> Human appends their review verdict here once they read with ChatGPT
> Chat. Once `reviewed_approved`, the next Automation Window may open.
