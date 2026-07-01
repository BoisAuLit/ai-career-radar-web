# AgentOps-2c · Supervised Runner Dry-Run Design Memo

> Design only. No runner, prototype, or executable file is
> created or activated by this memo. The document narrows
> AgentOps-2b's Option B (Local supervised runner, dry-run
> only) to a specific dry-run shape so Human + ChatGPT can
> evaluate whether — and how — to eventually implement a
> report-only prototype in a separate downstream loop.

## Title / Status

- **Title**: AgentOps-2c · Supervised Runner Dry-Run Design Memo
- **Status**: `draft_for_human_chatgpt_review`
- **Date**: 2026-06-30
- **Scope**: design only
- **Non-goal**: no runner implementation. No prototype code. No
  `.agent/scripts/**` edit. No daemon / scheduler / cron / GH
  Actions workflow / Codex CLI config / Claude Code config /
  OpenAI API introduction / app code change / pipeline-repo
  change.
- **Authored under TASK**: `2026-06-30_run_01`
- **Authoring loop**: 9th full dogfood loop of the helper triple
  (`new_task.py` / `new_run_report.py` / `new_decision.py`).
- **Direct predecessors**:
  - `.agent/design_memos/2026-06-29_AgentOps-2b_automation_runner_design.md`
    (parent memo scoping the whole runner concept)
  - AgentOps-2b DECISION `2026-06-29_run_03_DECISION.md` — Q1
    = Option B, Q7 = Codex CLI via ChatGPT sign-in OK
  - `.agent/policies/automation_policy.md` (v1.1)
  - `.agent/templates/automation_window_report_template.md`
    (with Executive Digest)
  - `.agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md`
    (proved reporting contract)
- **What this memo IS**: a description of a *specific*
  future dry-run shape under Option B, plus a comparison of
  two candidate implementation shapes for it (pure manual
  procedure vs. non-executing local planner), with a
  recommended safest first experiment.
- **What this memo is NOT**: an implementation, an approval
  to write a prototype, a permission slip to invoke Codex /
  Claude automatically, or a promotion of any blocker.

## Problem statement

AgentOps-2b chose **Option B** (Local supervised runner,
dry-run only) as the next automation-infra direction. Before
any implementation, we need a concrete shape for what the
dry-run does — otherwise "supervised dry-run" is ambiguous
enough that an implementation TASK could drift into
something more permissive than intended.

The goal of the dry-run is to **prove the
planning/reporting loop** — that a runner-shaped consumer of
the AgentOps protocol (policy + queue + blockers + report
template) can produce a useful window report — **not** to
prove code execution. The dry-run authored by AgentOps-2c
must:

1. **Not execute product code.** Neither Codex nor Claude
   Code is invoked automatically by the dry-run. Human
   invokes both interactively during review, if at all.
2. **Not push or deploy.** The dry-run's output is
   local files; humans push during B-time.
3. **Not call OpenAI API in any blocked sense** per Q7.
   Codex CLI usage remains via Bohao's ChatGPT sign-in,
   invoked interactively (not scripted).
4. **Read enough state to be useful.** Policy, queue,
   blockers, latest daily summary, latest window report,
   git status. Read-only.
5. **Produce one artifact.** A single automation window
   report in
   `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md`,
   starting with the Executive Digest, that a human can
   review in ~30 seconds and decide whether the *proposed
   next TASK* is worth executing manually.

Human wants A-time automation *eventually*, but full
automation remains blocked by BLK-0002; the dry-run designed
here is one prerequisite (of several) toward eventually
lifting it. **This memo does not lift BLK-0002.**

## Existing foundation

The dry-run has all the protocol it needs to consume; no
new protocol is invented:

- **`.agent/policies/automation_policy.md` v1.1** — the
  operating contract. §6 red / yellow / green. §7 report
  requirements. §11 stop conditions. §12 non-goals.
- **`.agent/templates/automation_window_report_template.md`**
  — 20 H2 sections including the new Executive Digest at
  the top (10 numbered fields, ≤10 lines).
- **`.agent/automation_queue.md`** — Codex/Claude
  authorization surface. As of AgentOps-2b completion:
  QUEUE-0001 done, QUEUE-0002 blocked_pending_human red,
  QUEUE-0003/0004/0005 candidates, QUEUE-0006 done,
  QUEUE-0007 done, QUEUE-0008 blocked_pending_human (this
  TASK transitions it to in_review).
- **`.agent/blockers.md`** — 3 initial open blockers:
  BLK-0001 (G2.1d), BLK-0002 (full automation activation),
  BLK-0003 (OpenAI API standing, scope clarified by Q7).
- **`.agent/daily_summaries/**`** — 4 daily summaries
  (2026-06-27 through 2026-06-30) provide historical
  context.
- **AgentOps TASK / RUN_REPORT / DECISION protocol** — 9
  full loops dogfooded so far; the helper triple
  (`new_task.py` / `new_run_report.py` / `new_decision.py`)
  scaffolds all three.
- **MANUAL_DRY_RUN (`475b116`)** — first hand-authored
  window report; proved reporting contract shape works.
- **AgentOps-2b memo (`baf2781`)** — parent scoping memo;
  Q1 = Option B, Q7 = Codex CLI sign-in OK.
- **QUEUE-0008 (blocked_pending_human → in_review this
  TASK)** — the placeholder for this AgentOps-2c work.

## Option B definition

**Option B** (from AgentOps-2b memo) means:

- **local** — runs on Bohao's Mac, not in CI, not on a
  remote server. No `.github/workflows/**` edit. No cron.
  No systemd / launchd. No cloud function.
- **supervised** — Bohao is in the room when it runs. Not
  a background daemon. Not a scheduler.
- **dry-run** — does not execute the tasks it proposes.
  Reads state; produces a report; stops.
- **non-executing by default** — never invokes Codex CLI
  as a subprocess. Never invokes Claude Code as a
  subprocess. Never spawns any tool that would edit files
  or make LLM calls on its own.
- **report-producing** — its sole output is one automation
  window report per invocation, using the existing
  template.
- **reads repo state and `.agent/` metadata** — no HTTP,
  no LLM call, no external network access.
- **does not modify product code** — never touches
  `src/**`, `src/lib/prompts.ts`, `src/data/web_bundle.json`,
  `package.json`, `package-lock.json`, `.env*`,
  `vercel.json`, `.vercel/**`, `.github/workflows/**`.
- **does not call OpenAI API** in any Q7 blocked sense
  (no key / SDK / HTTP / import / CI secret / background
  token).
- **does not start Claude Code automatically** — Bohao
  invokes Claude Code manually if he decides to act on
  the dry-run's proposal.
- **does not push** — the dry-run's own commit (if any)
  stays local; Bohao pushes during B-time.
- **does not deploy** — no `vercel deploy` invocation.
  Vercel's auto-deploy trigger from a `.agent/`-only web
  push is non-disruptive but is not the dry-run's action.

If the dry-run ever wants to violate any bullet above, it
must instead **stop and emit a blocker**.

## Allowed reads

The future dry-run may read (all locally, no network):

- `.agent/policies/automation_policy.md` (contract)
- `.agent/templates/automation_window_report_template.md`
  (report shape)
- `.agent/automation_queue.md` (authorization surface)
- `.agent/blockers.md` (refusal surface)
- The most recent
  `.agent/daily_summaries/YYYY-MM-DD_SUMMARY.md` (recent
  state)
- The most recent
  `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md`
  (so the dry-run does not redo work from the last
  window)
- The most recent 3-5 TASK / RUN_REPORT / DECISION files
  under `.agent/tasks/` / `.agent/run_reports/` /
  `.agent/decisions/` (recent completed / in-flight
  work)
- `git status` output (unstaged / staged changes)
- `git log --oneline -N` output (recent commit history,
  short summaries only)
- Pipeline repo: `git status` and `git rev-parse HEAD`
  ONLY (verify pipeline HEAD is unchanged; do NOT read
  pipeline file contents unless a future TASK explicitly
  allows it)
- Selected queue item metadata (only when the dry-run has
  selected a candidate to write up)

**No file outside `.agent/` (in the web repo) and no file
at all in the pipeline repo may be read by the dry-run
without a subsequent TASK explicitly allowing it.**

## Allowed writes

The future dry-run may write only:

- `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md`
  (the primary artifact; MUST start with the Executive
  Digest per §7 policy + template)
- `.agent/run_reports/YYYY-MM-DD_run_NN_RUN_REPORT.md`
  — ONLY if the dry-run is itself wrapped in an AgentOps
  TASK (i.e. the dry-run's own execution is a TASK; then
  it produces a RUN_REPORT for its own execution). This
  is expected: the dry-run is a task under the AgentOps
  protocol.
- `.agent/automation_queue.md` — status-note updates
  ONLY under explicit TASK approval. The dry-run may
  *propose* a queue transition in its window report but
  must not perform the transition itself unless the TASK
  it's running under explicitly authorizes it. Even then,
  it may transition only `candidate` ↔ `in_review` (never
  `done`, never `blocked_pending_human` → any other
  status, never touch red items).
- **No product files.** `src/**`, `package*.json`,
  `.env*`, `vercel.json`, `.vercel/**`,
  `.github/workflows/**`.
- **No pipeline files.**
- **No scripts.** `.agent/scripts/**` is off-limits.
- **No configs.** Codex CLI, Claude Code, Vercel, etc.
- **No policy or template edits.**

## Explicitly forbidden actions

The future dry-run must not:

- Edit `src/**` in any way
- Edit any file in the pipeline repo
- Edit `.agent/scripts/**` (helper scripts are frozen)
- Create runner code / executable file / shell script
- Execute Claude Code automatically (as a subprocess or
  via any programmatic API)
- Execute Codex CLI automatically using an API key
  (Codex CLI via Bohao's ChatGPT sign-in is a
  human-interactive action; the dry-run does not
  script it)
- Call OpenAI API in any Q7 blocked sense (no key, no
  SDK, no HTTP to `api.openai.com`, no import, no CI
  secret, no background token)
- Run `npm run …` / `npm install` unless separately
  approved in a subsequent TASK
- Run `python -m scripts.collector …` (pipeline
  collector) or any classifier / extractor / source
  invocation
- Commit automatically. Even if a commit is warranted
  (e.g. the window report itself), the dry-run's TASK
  must explicitly authorize the commit and Bohao must
  see the diff before commit.
- Push
- Deploy
- Change `.github/workflows/**` or any cron
- Resolve blockers. Even if a blocker looks stale, only
  Human + ChatGPT resolves it.
- Start G2.1d. QUEUE-0002 stays `blocked_pending_human`
  regardless of anything the dry-run finds.
- Open any real Automation Window
  (SLEEP_WINDOW / WORKDAY_WINDOW / WEEKEND_WINDOW) —
  BLK-0002 remains `open`. The dry-run *proposes*; it
  does not *activate*.

## Dry-run flow proposal

The future dry-run, when invoked (manually, by Bohao or
by Claude Code as an authored TASK), executes this
sequence:

1. **Preflight repo status.** Verify web repo is clean
   (or has only expected in-flight edits from the
   currently-running dry-run TASK). Verify pipeline HEAD
   = expected `origin/main`. If dirty unexpectedly →
   stop; do not modify anything; emit report noting
   dirty state.
2. **Read policy.** Load `automation_policy.md` v1.1.
   Verify version is recognized; if unrecognized → stop
   and emit blocker (or note in report).
3. **Read queue.** Load `automation_queue.md`. Build the
   working set of actionable items (see §Queue
   selection logic below).
4. **Read blockers.** Load `blockers.md`. Every open
   blocker becomes a refusal on matching work.
5. **Choose candidate queue item WITHOUT executing it.**
   Apply the queue selection logic; pick at most ONE
   candidate. If no candidate is safe → emit report
   noting "0 candidates" (informative empty window
   report).
6. **Produce proposed TASK outline.** Draft what a
   TASK for this item WOULD look like:
   `title`, `objective`, proposed `allowed_files`,
   proposed `forbidden_files`, proposed `risk`,
   proposed `validation`. Do NOT scaffold a real TASK
   file (that's a separate manual step Bohao does after
   review).
7. **Produce risk classification.** Green / Yellow /
   Red per policy §6. If the classification is
   uncertain → stop with a blocker.
8. **Produce blocked/allowed decision.** State whether
   the proposed TASK is *safe to execute manually* by
   Bohao + Claude Code, given current queue + blocker
   state.
9. **Produce automation window report** at
   `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md`
   starting with the 10-line Executive Digest. Follows
   the template exactly.
10. **Stop for Human + ChatGPT review.** Do nothing
    else. No commit unless the dry-run's own TASK
    explicitly authorized the report commit AND Bohao
    saw the diff.

## Report output contract

The dry-run's report MUST use
`.agent/templates/automation_window_report_template.md`
and include, in order:

- **Executive Digest** (top; 10 numbered fields,
  ≤10 lines):
  1. Window verdict (usually `ready_for_review`)
  2. Main outcome (usually "proposed next TASK for
     QUEUE-NNNN")
  3. Tasks completed (typically 0 — the dry-run
     doesn't execute)
  4. Commits created (typically 0 or 1)
  5. Repos touched (usually `web` only)
  6. Validation (usually `n/a — dry-run` or `pass —
     policy/queue/blockers parsed`)
  7. Red-zone / forbidden audit
  8. Open blockers (count + IDs)
  9. Human decisions needed
  10. Safest next action (usually "review this report
      and manually execute the proposed TASK if safe")
- Metadata
- Executive summary
- Proposed task (specifically: the outline drafted in
  step 6 of the flow)
- Why selected (the queue rules that led to this pick)
- Why safe or blocked (policy rules that
  allow/refuse it)
- Files it would touch (the proposed `allowed_files`)
- Validation it would require (the proposed
  `validation_commands`)
- Blockers (current 3 + any new)
- Human decisions needed
- Safest next action

The report MUST be ≤600 lines (hard cap). Anything
that doesn't fit belongs in the linked underlying files
(policy, queue, blockers) — not in the report.

## Queue selection logic

Same rules as AgentOps-2b memo's Queue selection §
(unchanged; restated for AgentOps-2c's dry-run
consumer):

**Preference order** (dry-run picks at most one):

1. **Existing `in_review` cleanup** — close pending
   review loops first. (E.g. QUEUE-0008 as of this memo
   until its DECISION lands.)
2. **Green `candidate`** — `.agent/`-only, minimal
   diff. (None currently.)
3. **Low-yellow `candidate`** — `.agent/policies/`
   edits, template amendments, daily summary updates.
   (None currently.)
4. **Higher-yellow `candidate`** — app-code UI-only.
   (QUEUE-0003 P1.7b, QUEUE-0004 P1.7c pending risk
   classification.)

**Never auto-select**:

- Red items (any `risk: red`, e.g. QUEUE-0002 G2.1d
  while BLK-0001 open)
- `blocked_pending_human` items (e.g. QUEUE-0002)
- Items whose `reason blocked` / `next_action` names an
  open blocker
- **QUEUE-0002 G2.1d** — hardcoded refusal while
  BLK-0001 open
- **OpenAI-related work** — any task naming OpenAI in
  Q7 blocked sense while BLK-0003 open
- **Full automation activation** — while BLK-0002 open
- Items requiring `git push` to a remote the dry-run
  isn't authorized to push to (dry-run is never
  authorized to push)
- Any item that would activate a real Automation Window
  (opening windows is a human action; the dry-run
  proposes, does not open)

## Blocker handling

The dry-run's blocker behavior:

- **Read `blockers.md` on every invocation.**
- **Blockers are read-only by default.** The dry-run
  does not resolve, close, or downgrade any blocker.
- **The dry-run may suggest a NEW blocker** by drafting
  it in its window report's "Blockers" section. Bohao
  or ChatGPT reviews the suggestion; if approved, a
  separate manual step (or the dry-run's own TASK if
  authorized) adds the blocker to `blockers.md`.
- **BLK-0001 (G2.1d red-zone approval)** remains open;
  dry-run refuses to draft any G2.1d TASK.
- **BLK-0002 (full automation activation)** remains
  open; dry-run refuses to propose opening any real
  Automation Window.
- **BLK-0003 (OpenAI API standing, Q7-scoped)** remains
  open; dry-run refuses to propose any OpenAI API
  usage in the blocked senses. Codex CLI via ChatGPT
  sign-in is not affected by BLK-0003 per Q7, but
  invoking Codex CLI is still a *human* action; the
  dry-run does not script it.
- **Any proposed blocker resolution** must go to
  Human + ChatGPT B-time review; the dry-run never
  resolves.

## Human + ChatGPT review process

After the dry-run's window report lands (locally, not
pushed):

1. **Human opens the report** at
   `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md`.
2. **Human reads the Executive Digest** — ~30 seconds.
   If everything is `ready_for_review`, 0 red-zone
   encounters, 0 new blockers, 0 human decisions
   needed, and the safest-next-action line is a
   reasonable next TASK, Human can proceed to step 5.
3. **Human sends the full report to ChatGPT** (paste,
   or drop file). ChatGPT does an adversarial pass:
   any risk missed? any hidden red-zone touch? does
   the proposed TASK's `allowed_files` list actually
   avoid every forbidden pattern?
4. **Human + ChatGPT decide** whether the proposed
   next TASK is safe. Default to "defer" if uncertain.
   Options:
   - **approve** the proposed TASK → Bohao invokes
     Claude Code manually with the outlined TASK as
     the prompt (still not automated; the dry-run
     proposed, Bohao executes).
   - **reject** the proposed TASK → the dry-run's
     candidate stays in the queue with a note; the
     dry-run picks the next candidate on the next
     invocation.
   - **defer** → the report sits until Bohao returns
     to it.
5. **No action occurs unless Human explicitly
   approves.** The dry-run itself never advances the
   protocol beyond its own report.

## Failure modes and mitigations

1. **Stale queue.** The dry-run picks an item that's
   already been completed manually since the last
   queue edit. *Mitigation*: reading the most recent
   daily summary + most recent window report at
   preflight; refusing to draft a TASK for any item
   whose `status` doesn't match its actual state.
2. **Dirty repo at dry-run start.** Uncommitted changes
   from Bohao's B-time work. *Mitigation*: dry-run
   stops on dirty repo at preflight; report notes it;
   Bohao commits or stashes before re-invoking.
3. **Ambiguous risk classification.** Codex-would-say
   yellow, Claude-would-say red — the dry-run can't
   decide. *Mitigation*: default to the higher risk;
   emit a blocker; stop; report notes the ambiguity.
4. **Too-long report.** Dry-run bloats the report past
   600 lines. *Mitigation*: hard cap in the template
   note; DECISION reviewer rejects any report > 600
   lines on principle.
5. **False sense of automation readiness.** A
   successful dry-run report makes Bohao overconfident
   that real automation is safe. *Mitigation*: this
   memo + the report template both explicitly frame
   the dry-run as *proving the planning contract, not
   the execution contract*. Real Automation Window
   opening is a separate BLK-0002 gate.
6. **Codex / Claude role confusion.** The dry-run
   accidentally starts to look like it's Codex or
   Claude itself, not a proposer for them.
   *Mitigation*: the dry-run's output is a *proposal*
   for a TASK; Bohao (or Claude Code) manually
   scaffolds the TASK using `new_task.py`; Codex /
   Claude only enter when Bohao invokes them.
7. **Hidden OpenAI API dependency.** A proposed TASK
   names Codex or Claude, and it turns out to require
   an OpenAI API path that BLK-0003 blocks.
   *Mitigation*: dry-run explicitly checks the
   proposed TASK's allowed_files and rationale
   against Q7's blocked-sense list; any match → stop
   and emit blocker.
8. **Accidental proposal of red task.** Dry-run's
   selection logic misfires and picks a red item.
   *Mitigation*: hardcoded refusals in Queue
   selection logic + preflight explicitly rejects
   red / blocked items before the selection step.
9. **Pipeline drift.** Dry-run assumes pipeline HEAD
   is `b019786` but daily cron shifted it.
   *Mitigation*: dry-run reads pipeline `git status`
   + `rev-parse HEAD`, notes the actual HEAD in the
   report; if HEAD moved unexpectedly, dry-run
   stops rather than proposing web tasks that
   assume old pipeline state.
10. **Vercel auto-deploy risk if web push later
    happens.** Even though the dry-run doesn't push,
    Bohao pushing based on the dry-run's proposal
    could trigger Vercel. *Mitigation*: report's
    "Files it would touch" section must be verified
    to contain no `src/**` / `package*.json` /
    `vercel.json` / `.vercel/**` / `.env*` before any
    manual push; the report itself surfaces this as
    a Human decision item.

## Safety gates

Hard gates the dry-run refuses to cross:

- **No dirty repo.** Stop at preflight if `git status`
  shows unexpected changes.
- **No red task.** Stop if the selection logic picks
  anything with `risk: red`.
- **No blocked task.** Stop if the selection logic
  picks an item naming an open blocker.
- **No OpenAI API.** Stop if the proposed TASK
  requires OpenAI in any Q7 blocked sense.
- **No runner code.** Stop if the proposed TASK would
  create an executable file / scheduler / cron.
- **No `.agent/scripts/**` edit.** Stop if the
  proposed TASK would touch a helper script.
- **No app / pipeline files** in the proposed TASK's
  `allowed_files` unless the task class explicitly
  allows it (yellow UI-only web work) AND the diff
  proves to be small (post-review).
- **No push / deploy.** Dry-run never pushes; never
  deploys; never triggers Vercel.
- **No hidden config changes.** Stop if the proposed
  TASK would touch `~/.codex/config.toml`,
  `.claude/settings.json`, or any similar config.
- **No G2.1d.** Hardcoded refusal.
- **No full automation.** Dry-run never activates a
  real Automation Window.

## Candidate implementation shapes for a later task

To be clear, **AgentOps-2c does not build any of these.**
These are shapes a *separate* future implementation TASK
would choose from. Comparison provided for Human +
ChatGPT to pick a direction.

### Shape A — Pure manual procedure (no script)

**What it is**: Bohao (or Claude Code as an authored
TASK) manually performs the 10-step dry-run flow above,
writing the window report by hand. Same as
MANUAL_DRY_RUN was for the reporting contract.

**Pros**:

- Zero new code surface.
- Zero new failure modes.
- Reuses the existing MANUAL_DRY_RUN precedent exactly.

**Cons**:

- Every dry-run takes ~30-60 minutes of Bohao's time.
- Doesn't demonstrate that a script-shaped consumer
  could work — which was the whole point of Option B.

**Risk**: lowest.

**Verdict**: Valid as a fallback if Shape B proves too
risky. But it's essentially a repeat of MANUAL_DRY_RUN
with a different theme (planning instead of
reporting) — the marginal learning is smaller than
Shape B.

### Shape B — Non-executing local planner (Python stdlib)

**What it is**: A small Python script under
`.agent/scripts/` (~200-400 lines, stdlib only, same
pattern as `new_task.py` / `new_run_report.py` /
`new_decision.py`) that reads policy / queue /
blockers / latest daily summary / latest window
report, applies the queue selection logic, drafts the
proposed TASK outline as text (does NOT scaffold a
real TASK file), and writes ONE window report to
`.agent/automation_runs/`. Never invokes any
subprocess. Never makes any LLM call. Never touches
`src/**`. Never pushes.

**Pros**:

- Demonstrates the runner-shaped workflow with real
  code.
- Reuses the stdlib-only, no-side-effect helper
  pattern that has been dogfooded across 9 loops.
- Would-be automation loop is exercisable without any
  Codex / Claude / API risk.
- Small enough to review manually (~200-400 lines).

**Cons**:

- Adds ~200-400 lines of new code surface in
  `.agent/scripts/`.
- **Requires a separate future TASK** to author (and
  a DECISION to review) — AgentOps-2c doesn't build
  it. **AgentOps-2c is the SCOPE memo for it, not the
  implementation.**
- Risk of scope creep: the script grows into
  something that invokes Codex/Claude "just a little"
  and drifts toward Option C.

**Risk**: low. Same risk class as the existing
`new_task.py` / `new_run_report.py` /
`new_decision.py` triple — reads files, writes one
file, no external calls.

**Verdict**: **This is the safest useful next
experiment.** Recommended for the first
post-AgentOps-2c implementation, in its own separate
TASK + DECISION.

### Shape C — Codex-authenticated local interactive session only

**What it is**: A minimal helper that just launches
Codex CLI in interactive mode (via Bohao's ChatGPT
sign-in) with a preformatted prompt bundling the
policy + queue + blockers + latest reports. Codex
proposes a TASK in-session; Bohao reads the proposal
and copies it into a real TASK file if he likes it.

**Pros**:

- No script logic; just prompt-assembly and launch.
- Uses Codex's reasoning to select and shape the
  proposed TASK — potentially better than a hand-
  coded selection heuristic.

**Cons**:

- Requires Codex CLI to be installed and configured.
- Depends on Bohao being in the room to interact with
  Codex.
- The "prompt-assembly" logic still lives somewhere
  (a script or a manual template) — same code-surface
  problem as Shape B without Shape B's structured
  output.
- Blurs the line between "Codex CLI as a Q7-allowed
  interactive tool" and "Codex CLI as an automated
  planner" — surfaces the risk of scope creep on Q7.

**Risk**: medium. The Q7 boundary needs unusually
careful enforcement.

**Verdict**: **Not recommended for the first
experiment.** Could be considered after Shape B has
been reviewed for a few dry-runs. Or, if Shape B
proves too rigid, Shape C might be a useful next
iteration.

### Shape D — Claude Code only simulation

**What it is**: Bohao invokes Claude Code with a
prompt like "act as the AgentOps-2c dry-run: read the
policy / queue / blockers, propose the next TASK,
write the window report to
`.agent/automation_runs/...`". Claude Code, as an
authored TASK, does the read/plan/report loop
directly.

**Pros**:

- Zero new code surface.
- Uses Claude Code's existing safety guarantees (only
  edits `allowed_files` etc.).
- Every dry-run is itself an AgentOps TASK with a
  matching RUN_REPORT and DECISION.

**Cons**:

- Uses Claude Code tokens (real quota) for each
  dry-run, even though the dry-run doesn't touch
  product code.
- The dry-run is an LLM call, not a deterministic
  file-reader — small risk of hallucination
  (misreading policy, inventing queue items).
- Same as Shape A in that it's manual but with LLM
  variance.

**Risk**: low-medium. Same risk class as authoring
this memo (yellow, no execution).

**Verdict**: **This is essentially what
MANUAL_DRY_RUN-2 would be** — a Claude-authored
window report using the new Executive Digest. Worth
doing at least once as a validation of the digest,
independently of AgentOps-2c's implementation
choice.

## Recommendation

**First experiment for AgentOps-2c should be Shape B**
(non-executing local planner script, Python stdlib) —
but only after a separate implementation TASK + DECISION
approves it. AgentOps-2c itself does NOT build Shape B.

Explicit properties the first experiment MUST have:

- Non-executing report-only dry-run.
- Never calls Codex or Claude automatically.
- Manually invoked by Bohao (or by Claude Code as an
  authored TASK — Shape D as an ad-hoc first
  MANUAL_DRY_RUN-2-style exercise is also fine).
- Generates ONE report from existing queue / blockers /
  policy at
  `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md`.
- Does not commit automatically (Bohao sees the diff).
- Does not push.
- Not scheduled (no cron, no systemd, no launchd, no
  GH Actions).
- Requires **another TASK + DECISION** before *any*
  implementation of Shape B.

**Optionally** before the Shape B implementation
TASK, run one **MANUAL_DRY_RUN-2** (Shape D) to
exercise the new Executive Digest end-to-end with a
Claude-authored report. This is not strictly
required, but it's cheap (green, single file) and
validates the digest before Shape B's script is
written to emit the same shape.

## Decision questions for Human + ChatGPT

1. **Should AgentOps-2c remain manual report-only**
   (Shape A / Shape D) indefinitely, or should we
   proceed to a small Shape B script implementation
   after this DECISION?
2. **Should any local script (Shape B) be allowed
   later?** If yes, in `.agent/scripts/` or somewhere
   else?
3. **Should the first prototype (Shape B or D) be
   allowed to write `.agent/automation_runs/` only,
   or also `.agent/run_reports/` (for its own
   execution's RUN_REPORT)?**
4. **Should the first prototype be allowed to update
   queue `status`** (e.g. transition `candidate` →
   `in_review` when it picks an item)? Or is queue
   editing exclusively Human-during-B-time?
5. **Should the first prototype be allowed to
   scaffold TASK drafts** (via `new_task.py` or
   equivalent), or only to *describe* what a TASK
   would look like?
6. **Should the first prototype be allowed to call
   Codex CLI interactively** (Shape C-like fallback)
   if Shape B's heuristic proves insufficient?
7. **Should the first prototype be allowed to invoke
   Claude Code**, even in dry-run mode? Default is
   "no" per this memo; explicit override needed.
8. **Should any commit be allowed** by the first
   prototype? The safest default is "no — Bohao
   reviews the diff and commits manually"; but for
   the window report itself, an auto-commit under
   TASK-approved conditions might be acceptable.
9. **What max report length is acceptable** for
   B-time review? This memo proposes ≤600 lines
   (matches the AgentOps-2b memo cap). Confirm or
   revise.
10. **What is the next product task after the
    automation foundation is documented?** Options:
    P1.7b (hero mock numbers), P1.7c (model-string
    SSOT), or something entirely new. The
    automation-infra track has 5 completed loops in
    3 days (MANUAL_DRY_RUN + Executive Digest +
    AgentOps-2a policy update + AgentOps-2b memo +
    this AgentOps-2c memo); a product-work loop
    would be a healthy shift.

## Acknowledgements / Sanity checklist

This memo:

- Cites AgentOps-2b DECISION Q1 (Option B) and Q7
  (Codex CLI vs BLK-0003) as load-bearing prior
  decisions.
- Scopes ONLY Option B; does not re-litigate
  Options A / C / D from AgentOps-2b.
- Cites BLK-0001 / BLK-0002 / BLK-0003 as currently
  `open`; does not lift any.
- Cites QUEUE-0002 G2.1d as currently
  `blocked_pending_human`; does not unblock.
- Cites QUEUE-0008 as `blocked_pending_human` at
  memo authoring start; the TASK's queue edit
  transitions it to `in_review` for this DECISION
  loop.
- Lists 4 candidate implementation shapes (A / B /
  C / D) with explicit safest recommendation
  (Shape B, in a separate future TASK).
- Lists 10 failure modes with mitigations.
- Lists 10 decision questions for Human + ChatGPT.
- Recommends a first experiment that is
  non-executing, report-only, manually invoked,
  commit-optional, no push, no schedule.
- Creates **no executable file** anywhere in the
  repo.
- Does NOT modify `.agent/scripts/**`.
- Does NOT introduce OpenAI API in any Q7 blocked
  sense.
- Does NOT touch any file outside the AgentOps-2c
  memo path, the matching TASK path, the matching
  RUN_REPORT path, and (optionally) the
  automation_queue.md status transition for
  QUEUE-0008.
