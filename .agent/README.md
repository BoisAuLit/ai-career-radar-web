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
├─ tasks/                            ← real tasks land here
├─ run_reports/                      ← real run reports land here
├─ decisions/                        ← real decisions land here
└─ daily_summaries/                  ← end-of-day rollups
```

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
