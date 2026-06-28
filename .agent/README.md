# AgentOps · file-based collaboration protocol

This directory is the **shared memory** between the human product owner, ChatGPT,
the (future) OpenAI API automation engine, and Claude Code. All cross-actor
communication for non-trivial work flows through files in here so the audit
trail is git-tracked and reviewable.

This is **AgentOps-0**: the file protocol only. No automation engine is wired
up yet.

---

## The loop

```
1. Human or ChatGPT writes TASK file        → .agent/tasks/YYYY-MM-DD_run_XX_TASK.md
2. Claude Code reads TASK + executes it
3. Claude Code writes RUN_REPORT            → .agent/run_reports/YYYY-MM-DD_run_XX_RUN_REPORT.md
4. ChatGPT (or future OpenAI API) reads
   RUN_REPORT and writes DECISION           → .agent/decisions/YYYY-MM-DD_run_XX_DECISION.md
5. Human approves any red-zone action
   surfaced in the DECISION
6. If approved, loop returns to step 1 with
   the next TASK (often pre-drafted in
   the DECISION file)
```

End-of-day:

```
7. Human (or future OpenAI API) writes      → .agent/daily_summaries/YYYY-MM-DD_SUMMARY.md
   a rollup summarizing the day's tasks,
   risks, and recommended next-day work
```

## Roles

| Actor | Responsibility |
|---|---|
| **Human** | Product owner. Final approver for red-zone actions. Decides merge / deploy / cron / prompt / model changes. Reviews major product quality. |
| **ChatGPT Desktop/Web** | High-level advisor. Workflow designer. Architecture reviewer. Manual reviewer when needed. **Not** the unattended automation engine. |
| **OpenAI API** *(future)* | Planner/reviewer automation engine. Reads TASK / RUN_REPORT / policy; writes DECISION; in later phases may also generate the next TASK. **Not enabled in AgentOps-0.** |
| **Claude Code** | Executor. Reads TASK; edits code; runs build/tests; writes RUN_REPORT; commits on a branch. **Not** the final decision-maker. |
| **GitHub repo** | Shared memory. Audit trail. Stores TASK, RUN_REPORT, DECISION, and daily summaries. |

## File-naming convention

```
.agent/tasks/YYYY-MM-DD_run_XX_TASK.md
.agent/run_reports/YYYY-MM-DD_run_XX_RUN_REPORT.md
.agent/decisions/YYYY-MM-DD_run_XX_DECISION.md
.agent/daily_summaries/YYYY-MM-DD_SUMMARY.md
```

- `XX` is a zero-padded sequence number within the day (`01`, `02`, …).
- Same `YYYY-MM-DD_run_XX` prefix ties a TASK ↔ RUN_REPORT ↔ DECISION triple together.
- Daily summaries don't have a run number.

## What's in this directory

```
.agent/
├─ README.md                         ← this file
├─ policies/
│  └─ agent_policy.md                ← roles, risk levels, safety rules, red-zone files
├─ templates/
│  ├─ task_template.md
│  ├─ run_report_template.md
│  ├─ decision_template.md
│  └─ daily_summary_template.md
├─ examples/
│  ├─ 2026-06-27_run_01_TASK.example.md
│  ├─ 2026-06-27_run_01_RUN_REPORT.example.md
│  └─ 2026-06-27_run_01_DECISION.example.md
├─ scripts/
│  ├─ new_task.py                    ← scaffolds the next TASK file
│  ├─ new_run_report.py              ← scaffolds the matching RUN_REPORT
│  ├─ new_decision.py                ← scaffolds the matching DECISION
│  └─ _common.py                     ← shared arg-resolution helper (not a CLI)
├─ tasks/                            ← real tasks land here
├─ run_reports/                      ← real run reports land here
├─ decisions/                        ← real decisions land here
└─ daily_summaries/                  ← end-of-day rollups
```

## Helper scripts

Small local utilities to remove manual ritual at the start of a TASK.
All helpers are **Python standard library only**, **local-only**, and
**never invoke** git / npm / vercel / gh / Claude / OpenAI / HTTP /
external commands. They write files only; the human commits.

### `new_task.py` — scaffold the next TASK file

Generates `.agent/tasks/YYYY-MM-DD_run_XX_TASK.md` from
`templates/task_template.md`, auto-incrementing the run number for the
given date. Refuses to overwrite an existing file. Prints the created
path on stdout.

```bash
# next TASK for today
python .agent/scripts/new_task.py

# pick a specific date
python .agent/scripts/new_task.py --date 2026-06-27

# pre-fill the title and risk fields
python .agent/scripts/new_task.py --date 2026-06-27 \
    --title "P1.8 report shell cleanup" --risk yellow

# pin to a specific run number — refuses if that slot already exists
python .agent/scripts/new_task.py --date 2026-06-27 --run 5

# --help for the full flag list
python .agent/scripts/new_task.py --help
```

The script never auto-commits. Once it prints a path, open that file,
fill in the remaining `<placeholder>` fields, then `git add` + commit
when the TASK is ready for execution.

By default the run number auto-increments — bare reruns just create
`run_02`, `run_03`, etc. Use `--run NN` if you want the script to
refuse on collision instead.

### `new_run_report.py` — scaffold the matching RUN_REPORT file

Generates `.agent/run_reports/YYYY-MM-DD_run_XX_RUN_REPORT.md` from
`templates/run_report_template.md`, with the metadata block (`task_id`,
`date`, `run_number`, `branch`) auto-substituted. Refuses to overwrite
an existing file. Prints the created path on stdout.

```bash
# pass the task_id directly (preferred form)
python .agent/scripts/new_run_report.py --task-id 2026-06-28_run_01

# or pass date + run separately
python .agent/scripts/new_run_report.py --date 2026-06-28 --run 1

# --help for the full flag list
python .agent/scripts/new_run_report.py --help
```

### `new_decision.py` — scaffold the matching DECISION file

Generates `.agent/decisions/YYYY-MM-DD_run_XX_DECISION.md` from
`templates/decision_template.md`, with `decision_id` and
`based_on_run_report` auto-substituted (the latter points at the
conventional `.agent/run_reports/{task_id}_RUN_REPORT.md` location).
Refuses to overwrite. Prints the created path on stdout.

```bash
# pass the task_id directly (preferred form)
python .agent/scripts/new_decision.py --task-id 2026-06-28_run_01

# or pass date + run separately
python .agent/scripts/new_decision.py --date 2026-06-28 --run 1

# --help for the full flag list
python .agent/scripts/new_decision.py --help
```

### Shared internals

`new_run_report.py` and `new_decision.py` share their argument-parsing
helper via `.agent/scripts/_common.py` (single underscore prefix → not
invoked as a CLI itself). All three files stay standard-library-only
and never spawn external processes.

## What is intentionally NOT in AgentOps-0

These are real options for later phases, but were deliberately excluded from this
first iteration to keep the protocol small and human-reviewable:

- **OpenAI API integration** as the auto-reviewer / auto-planner. The DECISION
  step is currently filled by a human or ChatGPT manually pasting. The file
  format is API-ready so wiring it up later is a one-component swap.
- **GitHub `@claude` mentions / Claude Code GitHub Actions**. Convenient, but
  ties execution to GitHub webhook events and reduces local control. Defer
  until the file protocol's review patterns are stable.
- **OpenClaw, Electron desktop wrapper, or any custom UI**. Premature surface
  area before the underlying protocol has proven useful.
- **Daemons or autonomous loops**. Every turn currently has a human checkpoint
  before the next TASK fires. No timer-driven execution.
- **Anything that touches the corpus pipeline, cron, prompts, or model
  selection**. The web repo's `.agent/` directory governs web-repo work only.

When any of these is ready to add, it goes in as **AgentOps-1**, **AgentOps-2**,
etc., each with its own design memo.

## How to use it day-to-day

**Pure-Claude turn (most common):**
1. Open ChatGPT, draft a TASK using `templates/task_template.md`.
2. Save it as `.agent/tasks/<date>_run_<N>_TASK.md` and `git add`.
3. Tell Claude Code: *"Execute task `.agent/tasks/<file>`."*
4. Claude reads, runs, writes RUN_REPORT in `.agent/run_reports/`.
5. Paste the RUN_REPORT back to ChatGPT; ChatGPT writes the DECISION
   (using `templates/decision_template.md`) and tells you whether to
   approve / request changes / move to the next task.
6. Save the DECISION in `.agent/decisions/` and `git add`.

**Red-zone action:**
- If the DECISION flags `human_approval_needed`, do NOT run anything. Read
  the DECISION's `red_zone_flags` and `required_fixes` first. Approve
  explicitly in your next message to Claude.

**End of day:**
- Have ChatGPT (or yourself) read all `.agent/decisions/<date>_*.md` and
  write `.agent/daily_summaries/<date>_SUMMARY.md`.

## Iterating on the protocol

The policy and templates live in git. When they need to change:

1. Open a TASK that touches `.agent/policies/` or `.agent/templates/`.
2. Mark it as **Yellow** (changes to the protocol itself are never Green —
   they shift how every subsequent task is judged).
3. Show the diff in the RUN_REPORT.
4. Human approves; commit; the new policy takes effect from the next TASK.

Do not silently edit the policy mid-task.
