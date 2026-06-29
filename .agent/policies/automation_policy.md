# Codex + Claude Code automation policy

> **Status**: load-bearing operating contract for the *future*
> Codex CLI + Claude Code automation model.
> **This document does NOT make automation run.** It defines the rules
> a runner must follow once one is built. No runner, daemon, scheduler,
> cron, or workflow exists today.
> **Authored under TASK** `2026-06-28_run_04` (AgentOps-2a).
> **Version**: 1 (initial).

---

## 1. Purpose

This policy governs the planned automation model for AI Career Radar.
It defines:

- the **A/B time model** (Automation Time vs Non-Automation Time),
- the **roles** of Human, ChatGPT Chat, Codex CLI, Claude Code,
  GitHub, GitHub Actions, and OpenAI API,
- the **risk policy** (Green / Yellow / Red) and what each level
  allows,
- the **automation window report** format and storage location,
- the **queue** and **blockers** files, and how Codex picks work,
- the **daily review workflow** between Human and ChatGPT Chat,
- the **stop conditions** automation must obey, and
- the **non-goals** that intentionally remain out of scope.

It is the load-bearing reference for every future automation TASK.
When something in a TASK conflicts with this policy, this policy
wins; surface the conflict in the RUN_REPORT.

It is also the precedent for the cross-tool boundary: Codex CLI plans,
Claude Code executes, ChatGPT Chat reviews with the human, and OpenAI
API stays out.

---

## 2. A/B time model

### A · Automation Time

Three windows:

- **WORKDAY_WINDOW** — weekdays Monday–Friday, roughly 09:00–19:00,
  while the human is working but not actively driving the AgentOps
  loop.
- **SLEEP_WINDOW** — every day, roughly 01:00–09:00.
- **WEEKEND_WINDOW** — all day Saturday and Sunday.

During Automation Time:

- **Codex CLI** is the planner / reviewer / decision proposer.
- **Claude Code** is the coding executor.
- Work should proceed **without disturbing the human**.
- Green and low-yellow tasks may be progressed end-to-end.
- Red-zone tasks must STOP and be written to
  `.agent/blockers.md`.
- Merge / push / deploy must follow §6 (risk policy) and §10 (daily
  review).

### B · Non-Automation Time

One short daily window:

- Targeted ≤ 30 minutes/day.
- **Human + ChatGPT Chat** review the latest automation report.
- Decisions made here: approve merge/push, request changes, change
  direction, escalate to a design memo, unblock a blocker, stop a
  risky path.
- This is the only authorized window for **red-zone approvals**.

Automation MUST NOT run during Non-Automation Time unless the human
has explicitly extended the window in writing.

---

## 3. Roles

### Human Owner (Bohao)

- Final product owner.
- Final red-zone approver.
- Final merge / push / deploy approver for risky work.
- Reviews automation reports with ChatGPT Chat during Non-Automation Time.
- Sets high-level direction; revises queue priorities; opens design memos.

### ChatGPT Chat

- External reviewer / strategist.
- Used during Non-Automation Time.
- Helps the human inspect automation results, understand what
  happened, and make high-level decisions.
- **Not** an unattended local execution agent.
- Does not push, merge, or deploy.

### Codex CLI

- Automation planner / reviewer / decision proposer during Automation Time.
- Reads: daily summaries, `.agent/automation_queue.md`,
  `.agent/blockers.md`, existing TASK / RUN_REPORT / DECISION files,
  this policy.
- Selects Green or low-Yellow tasks during Automation Time.
- Reviews Claude Code output (RUN_REPORTs, diffs).
- Writes blockers for risky items it cannot decide.
- **Must use GPT-5.5** with reasoning effort **high** for
  planning/review/decision work.
- **Does not default to extra-high** reasoning effort (cost/latency
  discipline).
- **Cannot grant final red-zone approval.**
- **Never** introduces OpenAI API or any new external service.
- **Never** creates uncontrolled autonomous loops.

### Claude Code

- Coding executor during Automation Time.
- Reads the TASK file before editing.
- Stays inside `allowed_files` and avoids every `forbidden_files`
  entry.
- Runs the TASK's `validation_commands`.
- Writes a RUN_REPORT after execution.
- May draft a DECISION; the human or ChatGPT confirms it.
- **Must not push / deploy without explicit approval.**
- **Must not** run classifier / extractor / collection / any
  `python -m scripts.collector …` unless the TASK explicitly allows.
- **Must use quota on valuable project work**, not on make-work
  refactors.

### GitHub / origin

- Source of truth for approved history.
- Push only when the approval policy allows.

### GitHub Actions

- Existing approved background automation only (pipeline daily cron).
- **Not** the decision loop.
- No new workflow / cron without an explicit red-zone approval cycle.

### OpenAI API

- **Deferred.** Do not use for now.
- No SDK, no API key, no `.env` entry, no HTTP request to OpenAI
  endpoints, no billing setup.
- Re-evaluating this stance requires its own AgentOps-N design memo +
  human approval. Not in scope here.

---

## 4. Codex CLI operating rules

- **Model**: GPT-5.5.
- **Reasoning effort**: `high` for planning/review/decision tasks.
  Do **not** default to `extra-high` (cost/latency).
- **Task selection**: choose from `.agent/automation_queue.md`.
- **Closing > opening**: prefer closing existing loops (open
  RUN_REPORTs → DECISIONs, pending promotes) before starting new work.
- **Productivity during Automation Time**: continue safe
  Green / low-Yellow work without disturbing the human.
- **Blocked path handling**: when blocked, write the blocker to
  `.agent/blockers.md` (per §9) and switch to another safe queued
  task — do not loop on the blocked item.
- **No silent scope expansion**. If a TASK needs more than its
  `allowed_files`, write a blocker and stop the task.
- **Never** modify red-zone files (see §6).
- **Never** approve red-zone work. That is a human-only action.
- **Never** introduce OpenAI API or new external services.
- **Never** create uncontrolled "run forever" loops. Every Automation
  window has a defined end; stop at end-of-window even if work remains.

---

## 5. Claude Code operating rules

- **Read the TASK first.** Do not edit until the TASK is open.
- Stay within `allowed_files`.
- Run the TASK's `validation_commands`.
- Write a RUN_REPORT after execution using the standard template.
- **Stop** if a forbidden file would need to change.
- **Stop** if any validation fails.
- **Stop** if the repo state is dirty unexpectedly.
- **Do not** run classifier / extractor / collection unless the TASK
  explicitly allows.
- **Do not** push / deploy / merge to `main` / open red-zone files
  without explicit human approval.
- **Use quota on valuable work**: prefer closing a real loop over
  cosmetic refactors. If there's nothing valuable to do, idle is fine
  — don't burn cycles on busywork.

---

## 6. Green / Yellow / Red risk policy

| Level | Examples | Automation can… |
|---|---|---|
| **Green** | docs · `.agent/*` · daily summaries · diagrams · small local helper scripts · README updates | Execute end-to-end within an Automation Window; commit + push may be allowed within the window IF the queue item explicitly says so. |
| **Yellow** | eval sets · taxonomy docs · non-runtime data/docs · small UI changes · local validation scripts | Execute + write RUN_REPORT + draft DECISION; **merge + push waits for Non-Automation Time human approval** unless the queue item explicitly says otherwise. |
| **Red** | `classifier.py` · `extraction.py` · `corpus/schema/**` · prompts · `src/lib/prompts.ts` · `sources.yaml` · `.github/workflows/**` · cron · generated corpus · production bundle · model selection · deployment config · auth / payment / database · OpenAI API introduction · autonomous daemon / unattended scheduler | **STOP.** Write blocker. Wait for human + ChatGPT review during Non-Automation Time. No exceptions. |

Codex CLI must classify every queue item against this table before
selecting it. If a task's actual scope discovered during execution
escalates Yellow → Red, Claude Code stops, Codex writes a blocker,
the loop moves on.

---

## 7. Automation window report policy

Every Automation Window must **produce or update** a report at:

```
.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md
```

### Allowed `<WINDOW>` names

- `SLEEP_WINDOW`
- `WORKDAY_WINDOW`
- `WEEKEND_WINDOW`
- `MANUAL_DRY_RUN` (used by humans for one-off dry runs of the policy
  before automation is real)

### Report requirements

Use `.agent/templates/automation_window_report_template.md`. The
report must include, at minimum:

- metadata (report_id / date / window_name / window_type / time_range
  / generated_by / reviewed_by / status)
- goals selected by Codex
- tasks attempted
- tasks completed
- commits created (per repo)
- files changed (per repo)
- validation results
- Claude Code usage summary (if available)
- Codex review summary
- red-zone encounters
- blockers created or updated
- failed validations
- merge / push / deploy status (per repo)
- human decisions requested
- suggested ChatGPT review questions
- next recommended automation tasks
- safety audit
- final status

A report is the **only** acceptable output for "what happened in this
window". No report → no merge / push / deploy is approved for that
window.

---

## 8. Queue policy

`.agent/automation_queue.md` is the backlog Codex reads. Codex MUST
NOT execute work that is not present in the queue (the queue is the
authorization surface).

### Queue item schema

Each item includes:

- `id` (`QUEUE-NNNN`)
- `title`
- `priority` (`high` / `med` / `low`)
- `risk` (`green` / `yellow` / `red`)
- `target_repo` (`web` / `pipeline`)
- `allowed_files` (rough scope; the real allowed list lives in the
  eventual TASK file)
- `forbidden_files` (likewise)
- `expected_output`
- `validation` (what passes / fails proves done)
- `status` (`candidate` / `in_progress` / `done` / `blocked_pending_human` / `deferred`)
- `next_action` (one-liner)

Queue items are not full TASK files. Codex still drafts a TASK from a
queue item before execution (or the human does it manually).

---

## 9. Blockers policy

`.agent/blockers.md` stores items automation cannot decide. Codex
appends; the human resolves during Non-Automation Time.

### Blocker schema

- `blocker_id` (`BLK-NNNN`)
- `date` (when raised)
- `source_task_or_window` (TASK id or window report id)
- `repo` (`web` / `pipeline` / `both` / `n/a`)
- `risk` (`yellow` / `red`)
- `reason_blocked`
- `exact_human_decision_needed` (one sentence)
- `suggested_chatgpt_review_question` (verbatim text to paste into ChatGPT Chat)
- `current_status` (`open` / `resolved` / `wont-do`)

A blocker is **resolved** only by:
1. The human (or human + ChatGPT) writing a DECISION-like resolution,
2. Updating `current_status: resolved`, and
3. Moving the entry from "Open" to "Resolved" section.

---

## 10. Daily review workflow

At the start of Non-Automation Time:

1. Human opens the **latest** automation report under
   `.agent/automation_runs/`.
2. Human pastes the report (or the relevant section) into **ChatGPT Chat**.
3. Human + ChatGPT review and decide one or more of:
   - **Approve merge / push** for an explicitly-blocked promotion.
   - **Request changes** (open a new TASK to fix what the report flagged).
   - **Change priorities** (edit `automation_queue.md`).
   - **Escalate to design memo** (open `.agent/design_memos/...` for a
     bigger question).
   - **Unblock a blocker** (move from Open → Resolved with a recorded
     decision).
   - **Stop a risky path** (mark queue item `deferred` or `wont-do`).
4. Human commits any changes to `.agent/` and pushes.

This loop is the only mechanism by which red-zone work advances and
the only mechanism by which long-term direction shifts.

---

## 11. Stop conditions

Automation MUST stop and write a blocker when any of:

- A **red-zone** file would need to change.
- The repo state is **dirty unexpectedly** (untracked / uncommitted
  before the run starts).
- A **validation fails**.
- A **branch cannot fast-forward** to its expected parent.
- **Scope expands** beyond the TASK's `allowed_files` /
  `forbidden_files`.
- **Generated corpus** would change unexpectedly.
- **Prompt / schema / classifier / extractor / source / cron** would
  change.
- **OpenAI API** would be needed.
- **Deployment** would be triggered manually.
- **Codex or Claude Code expresses low confidence** ("I'm unsure if X
  is the right call"). Treat uncertainty as a blocker, not as a
  judgment call.
- The task lacks a **clear TASK file** to anchor scope.
- A non-trivial task has **no validation defined**.

When automation stops, it:
1. Records the stop reason in the current window's report.
2. Appends a blocker to `.agent/blockers.md`.
3. Selects another safe queued task (if any) and continues — does
   not retry the stopped path.

---

## 12. Non-goals (explicit)

This policy intentionally does **NOT** cover, enable, or imply:

- ❌ **OpenAI API usage.** No SDK, no key, no HTTP, no billing.
- ❌ **Autonomous daemon.** No long-running background process.
- ❌ **GitHub Actions expansion.** Daily cron is the only existing
  workflow; no new workflows.
- ❌ **Cron changes.** No new cron jobs, no schedule edits.
- ❌ **Production deploy automation.** Vercel auto-deploy on push is
  the existing behavior; nothing new added.
- ❌ **Red-zone auto-approval.** Red-zone work is human-only.
- ❌ **Replacement of human final ownership.**
- ❌ **Uncontrolled "run forever" loops.** Every window has a defined
  end.
- ❌ **Codex CLI config mutation.** Configuration of the Codex CLI
  itself is out of scope here.
- ❌ **Claude Code config mutation.** Same.
- ❌ **Automation runner implementation.** This policy describes
  behavior; building the runner is a future AgentOps-2b TASK, separate
  approval.

---

## 13. Change control

Changes to this policy must go through the AgentOps loop:

1. New TASK under `.agent/tasks/YYYY-MM-DD_run_NN_TASK.md`.
2. Risk level **at least `yellow`** (changes to the policy itself
   shift how every subsequent automation run is judged).
3. Policy edits committed on a branch (or directly to `main` for
   simple wording fixes — record the policy version line).
4. RUN_REPORT + DECISION.
5. Human approval gate before merge + push.

When this file changes, bump the "Version" line at the top.

---

**End of automation policy · v1 · 2026-06-28**

Forward-reference: AgentOps-2b will scope the smallest safe automation
runner that obeys this policy.
