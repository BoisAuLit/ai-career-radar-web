# RUN REPORT · AgentOps-2a · Codex + Claude Code automation policy

> Implementation of TASK `2026-06-28_run_04`. Web-repo only —
> pipeline repo untouched. Policy / documentation only — no runner,
> no daemon, no scheduler, no cron, no GitHub Actions changes, no
> Codex/Claude config mutation, no OpenAI API integration.
> Scaffolded by `python .agent/scripts/new_run_report.py --task-id
> 2026-06-28_run_04`.

## Metadata

- **task_id**: `2026-06-28_run_04` (must match the TASK file)
- **date**: `2026-06-28`
- **run_number**: `04`
- **branch**: web repo `main` (no branch cut — this is a yellow doc
  task and the prior protocol established that policy/doc commits to
  `main` directly are acceptable; the TASK file likewise was committed
  to `main` in `5189c07`)

## Commits

**Web repo (`/Users/bohaoli/Desktop/ai-career-radar-web`):**
- `5189c07` Add TASK 2026-06-28_run_04 (already on `main` before this run)
- `798bf69` Add Codex Claude automation policy (this run's impl)
- *(forthcoming)* Add RUN_REPORT 2026-06-28_run_04 (this file)

**Pipeline repo (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`):**
- `none` (pipeline repo not touched)

## Files changed

**Web repo (this run, vs `HEAD` at run start):**

```
 .agent/README.md                                           |  28 ++++++++++++++++++++++++---
 .agent/automation_queue.md                                 | 168 ++++++++++++++++++++++++++
 .agent/blockers.md                                         | 113 +++++++++++++++++++
 .agent/policies/automation_policy.md                       | 402 +++++++++++++++++++++++++++++++++++++++++
 .agent/templates/automation_window_report_template.md      | 188 ++++++++++++++++++++++++++
 .agent/run_reports/2026-06-28_run_04_RUN_REPORT.md         | <this file>
 6 files changed, 896 insertions(+), 3 deletions(-)
```

**Pipeline repo:** no diff. Confirmed via `git status` on
`main` — `nothing to commit, working tree clean` at run start and
end; HEAD = `b019786` at both points.

## Summary

Implemented AgentOps-2a per TASK `2026-06-28_run_04`. Created 4 new
files and made one small additive edit to `.agent/README.md`:

- **`.agent/policies/automation_policy.md`** (402 lines) — the
  load-bearing operating contract for the future Codex CLI + Claude
  Code automation model. 12 sections + a Change Control coda: Purpose,
  A/B time model (SLEEP_WINDOW / WORKDAY_WINDOW / WEEKEND_WINDOW /
  Non-Automation Time), Roles (Human / ChatGPT Chat / Codex CLI /
  Claude Code / GitHub / GitHub Actions / OpenAI API deferred), Codex
  CLI operating rules (GPT-5.5, reasoning `high`, never `extra-high`),
  Claude Code operating rules, Green/Yellow/Red risk policy (with
  table), Automation window report policy (path schema, required
  fields), Queue policy, Blockers policy, Daily review workflow, Stop
  conditions, Non-goals (no OpenAI API, no autonomous daemon, no GH
  Actions expansion, no cron changes, no production deploy
  automation, no red-zone auto-approval).
- **`.agent/templates/automation_window_report_template.md`** (188
  lines) — per-window report shape. Metadata + Executive summary +
  Goals + Tasks attempted/completed + Commits per repo + Files
  changed per repo + Validation + Claude usage summary + Codex
  review + Red-zone encounters + Blockers + Failed validations +
  Merge/push/deploy status + Human decisions requested + Suggested
  ChatGPT questions + Next recommended tasks + Safety audit + Final
  status. Designed to be copy-paste-friendly into ChatGPT Chat.
- **`.agent/automation_queue.md`** (168 lines) — Codex backlog with
  schema + 6 seed items: QUEUE-0001 AgentOps-2a (`in_progress`,
  yellow), QUEUE-0002 G2.1d classifier prompt + scoring dry-run
  (`blocked_pending_human`, red), QUEUE-0003 P1.7b hero mock numbers
  (`candidate`, yellow), QUEUE-0004 P1.7c model-string SSOT
  (`candidate`, yellow/red TBD — explicit "classify before drafting"
  guidance), QUEUE-0005 `check_loop.py` audit helper (`deferred`,
  green), QUEUE-0006 MANUAL_DRY_RUN report (`candidate`, green).
- **`.agent/blockers.md`** (113 lines) — schema + 3 initial open
  blockers: BLK-0001 G2.1d red-zone approval, BLK-0002 full automation
  activation, BLK-0003 standing OpenAI API block. Resolved section
  is currently empty.
- **`.agent/README.md`** (+25 / −3) — directory tree extended to
  list `automation_policy.md`, `automation_window_report_template.md`,
  `automation_queue.md`, `blockers.md`, `design_memos/` (existed),
  `automation_runs/` (created lazily). Added "Automation policy
  (AgentOps-2a)" section linking the four new files.

This is **documentation only**. Nothing in this commit makes
automation run. There is no runner, no daemon, no scheduler, no new
GitHub Actions workflow, no cron job, no OpenAI API call, no Codex
CLI config edit, no Claude Code config edit, no new dependency.

The policy is a contract a future runner must obey (AgentOps-2b will
scope that runner separately).

## Constraints checked

### Web repo

- [x] `src/**` — untouched (`git diff --stat HEAD -- src/` empty)
- [x] `src/lib/prompts.ts` — untouched
- [x] `src/data/web_bundle.json` — untouched
- [x] `package.json` / `package-lock.json` — untouched
- [x] `.github/workflows/**` — untouched
- [x] `.env*` — untouched
- [x] `vercel.json` / `.vercel/**` — untouched

### Pipeline repo

- [x] **All files** — untouched. Pipeline `git status` clean at start
      and end of run; HEAD unchanged at `b019786`. No `cd` into the
      pipeline repo for edit purposes; only one read-only status check.

### Tool config and external integrations

- [x] **OpenAI API SDK / key / `.env` entry / HTTP call** — none
      introduced. The policy file mentions "OpenAI API" only in
      `deferred` / `non-goals` / blocker context.
- [x] **Codex CLI config** (`~/.codex/config.toml`, etc.) — not edited.
- [x] **Claude Code config** (`~/.claude/settings.json`, project
      `.claude/settings.json`) — not edited.
- [x] **New GitHub Actions / workflow files** — none added.
- [x] **New cron jobs** — none added.
- [x] **New deployment hooks** — none added.
- [x] **New npm dependencies** — none added.
- [x] **New Python dependencies** — none added.
- [x] **`python -m scripts.collector …` invocation** — never invoked.
- [x] **`npm run …` invocation** — never invoked (no build needed).
- [x] **LLM call** — no `anthropic` / `openai` SDK invocation by this
      run (the policy file *describes* future LLM usage but does not
      perform any).

## Red-zone check

- Red-zone files modified this run: **none**.
- Approval reference: N/A. The new files all land under `.agent/`,
  which is yellow per `agent_policy.md` §2. The DECISION reviewer
  should still gate any push of `main` as a separate human approval
  step per policy.

## Validation results

```
=== file presence + sizes ===
.agent/policies/automation_policy.md                  402 lines / 14,610 bytes
.agent/templates/automation_window_report_template.md 188 lines /  6,102 bytes
.agent/automation_queue.md                            168 lines /  7,827 bytes
.agent/blockers.md                                    113 lines /  4,963 bytes
.agent/README.md                                      +25 / -3   (additive edit)
TOTAL: 871 new + 25 added = 896 line insertions, 3 line deletions

=== git diff --stat (before commit) ===
 .agent/README.md | 28 ++++++++++++++++++++++++---

=== git status --short (before commit) ===
 M .agent/README.md
?? .agent/automation_queue.md
?? .agent/blockers.md
?? .agent/policies/automation_policy.md
?? .agent/templates/automation_window_report_template.md

=== forbidden audit (vs HEAD pre-commit) ===
all 8 web forbidden paths: unchanged ✓

=== sanity grep: no implementation-style section headings ===
"## Cron job"                  : not present ✓
"## Implementation runner"     : not present ✓
"## Daemon"                    : not present ✓
"## OpenAI integration"        : not present ✓

(The strings "cron", "daemon", "OpenAI API", "GitHub Actions" DO appear
in the policy — exclusively in non-goal / prohibited / blocker
contexts, which is correct. Their presence as prohibition language
proves the policy explicitly forbids them, not that they were
implemented.)

=== file references intact ===
All 4 .agent/ files linked from README.md exist and resolve.

=== post-commit git log ===
798bf69 Add Codex Claude automation policy   ← impl
5189c07 Add TASK 2026-06-28_run_04            ← TASK (committed earlier)
```

## Build result

`not-run` — documentation-only change. No app code, no Python module,
nothing that compiles or executes. The TASK explicitly waived
`npm run build`.

## Tests result

`structural validation only` — no automated test framework added.
Manual structural checks performed and recorded above: file presence,
line counts, schema completeness (12 policy sections, 17 report
sections, queue schema fields, blocker schema fields, 6 seed queue
items at the listed statuses, 3 initial blockers all `open`),
forbidden-files diff = empty, no implementation-style section
headings, all README-linked files exist.

## Screenshots

`n/a` — text-only protocol work.

## Risks

1. **Policy is load-bearing but unverified.** This is v1; the rules
   feel right at the desk but no real Automation Window has obeyed
   them yet. Severity: **medium** / **accepted**. Mitigation: queue
   item `QUEUE-0006` (MANUAL_DRY_RUN report) exists specifically to
   stress-test the contract end-to-end before any real runner is
   built.
2. **Codex CLI rules describe model + reasoning effort but no
   enforcement.** The policy says "GPT-5.5, reasoning effort `high`,
   never `extra-high`" but doesn't have a knob that enforces it. The
   human + Codex operator must respect the contract by inspection.
   Severity: **low**. Mitigation: each window report's "Codex review
   summary" section can note any deviation. Long-term, AgentOps-2b's
   runner could surface a config check; out of scope here.
3. **Queue authorization surface concentrates risk.** The policy
   says Codex "MUST NOT execute work that is not present in the queue"
   — but the queue itself is just a markdown file in the same repo.
   A bad edit could authorize unsafe work. Severity: **low**.
   Mitigation: queue edits go through `git commit` history (`git log
   -- .agent/automation_queue.md` is the audit trail); a future
   `check_loop.py`-style script could diff queue changes against the
   prior version.
4. **Blockers and queue have no auto-eviction.** A blocker that's
   resolved in spirit but not formally moved to "Resolved" will sit
   in "Open" indefinitely; a queue item that's been forgotten won't
   auto-expire. Severity: **low**. Mitigation: the daily review
   workflow (§10) is the human-driven cleanup channel; if it becomes
   painful, a tiny audit script is the right tool (queue item
   `QUEUE-0005` covers a related case).
5. **OpenAI API blocker (`BLK-0003`) is a "standing" block.** Marked
   `open` indefinitely. This is intentional — any OpenAI API
   introduction must reference and resolve this blocker. Severity:
   **n/a** (by design).

## Follow-up recommendations

- **Next: human + ChatGPT review of this RUN_REPORT.** Then DECISION
  via `python .agent/scripts/new_decision.py --task-id 2026-06-28_run_04`.
  Approval gates a normal `git push origin main`.
- **Then: MANUAL_DRY_RUN report** (`QUEUE-0006`). A hand-filled
  example automation window report against a real recent day (e.g.
  today) validates the contract without needing a runner.
- **Then: AgentOps-2b scoping** — smallest safe automation runner
  that obeys this policy. Likely a small CLI that wraps Codex + Claude
  Code interactions and writes the window report. Out of scope here.

## Ready for review

`yes`

## Requires human decision

`yes` — required before push of `main` (this commit + the prior
unpushed `5189c07` AgentOps-2a TASK commit both wait on human GO
before going to `origin/main`).

> Verdict is technical-execution-only for now. Standing policy treats
> any `main` push as a human gate. Approval also gates the next steps:
> opening a DECISION file, drafting the MANUAL_DRY_RUN queue item
> follow-up, and any actual Automation Window opening. None of those
> happen until the human + ChatGPT review this report.
