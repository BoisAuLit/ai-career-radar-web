# AgentOps-2b · Automation Runner Design Memo

> Design only. No runner is created or activated by this memo. The
> document scopes a *hypothetical future* automation runner
> coordinating Codex CLI as planner/reviewer and Claude Code as
> coding executor, so that Human + ChatGPT can evaluate whether to
> proceed to an implementation TASK in a separate downstream loop.

## Title / Status

- **Title**: AgentOps-2b · Automation Runner Design Memo
- **Status**: `draft_for_human_chatgpt_review`
- **Date**: 2026-06-29
- **Scope**: design only
- **Non-goal**: no runner implementation. No daemon, scheduler,
  cron, GitHub Actions workflow, Codex CLI config edit, Claude
  Code config edit, OpenAI API integration, app code change, or
  pipeline-repo change.
- **Authored under TASK**: `2026-06-29_run_03`
- **Authoring loop**: 8th full dogfood loop of the helper triple
  (`new_task.py` / `new_run_report.py` / `new_decision.py`).
- **Predecessor docs**:
  `.agent/policies/automation_policy.md` (v1.1),
  `.agent/templates/automation_window_report_template.md` (with
  the Executive Digest),
  `.agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md`
  (first hand-authored window report under the contract).
- **What this memo IS**: a description of *what* a future runner
  would do, *what* it would not do, and a comparison of
  implementation paths so Bohao + ChatGPT can choose the next
  step.
- **What this memo is NOT**: an implementation, an approval, a
  promotion of any blocker, or a permission slip for any
  Automation Window to open.

## Problem statement

Bohao wants **A-time automation**: periods of the day when work
continues without his direct keystrokes. Concretely, three classes
of A-time windows have been sketched out in
`automation_policy.md` §2:

- `SLEEP_WINDOW` — overnight, low-risk maintenance and refactors
- `WORKDAY_WINDOW` — short slices during the workday when Bohao
  is in meetings or other-context work
- `WEEKEND_WINDOW` — longer slices on Saturday / Sunday for
  larger, still-bounded tasks

Outside those windows is **B-time** (Non-Automation Time), when
Bohao + ChatGPT review what A-time produced and decide what
A-time should do next.

The proposed role split:

- **Codex CLI** (GPT-5.5, reasoning effort `high`) acts as
  planner / reviewer / decision proposer. It reads the policy,
  queue, blockers, and latest reports; selects a candidate task;
  drafts a TASK file; reviews Claude Code's RUN_REPORT against
  the policy; proposes a DECISION verdict. It does NOT execute
  code edits, does NOT approve red-zone work, does NOT push, and
  does NOT lift blockers.
- **Claude Code** acts as coding executor. It reads the TASK,
  edits only allowed files, runs validations, commits if policy
  allows, writes a RUN_REPORT. It does NOT push or deploy unless
  the policy explicitly allows it for the task class, and even
  then it stops short of opening any human-decision gate.
- **Human + ChatGPT** do short B-time reviews: read the
  Executive Digest of the latest window report, scan blockers
  and Human decisions requested, approve or reject any red-zone
  unblock or push that the runner surfaced, then set the next
  Automation Window's intent.

The system must:

1. **Avoid going off-track.** Every Automation Window must
   either advance a clearly-scoped task or stop cleanly with a
   blocker. The runner must refuse to invent work outside the
   queue.
2. **Produce readable automation reports.** Every window must
   produce one
   `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md` that
   begins with the new 10-line Executive Digest, so B-time
   review takes ~30 seconds per window in the common case.
3. **Be revertable.** No window's output should ever be
   irreversible — no production deploy, no destructive git
   operation, no API spend without prior approval.
4. **Be small.** The runner itself must be the smallest piece
   of code that achieves the above. Premature abstraction is
   anti-safety: more orchestration surface area means more
   places to drift.

This memo evaluates whether to build such a runner now, and if
so, in which shape.

## Existing foundation

The protocol layer needed to support an automation runner already
exists. The runner does not need to invent any of these — it
needs to *obey* them:

- **AgentOps TASK / RUN_REPORT / DECISION protocol** — every
  unit of work is a TASK file scaffolded by `new_task.py`, a
  matching RUN_REPORT scaffolded by `new_run_report.py`, and a
  matching DECISION scaffolded by `new_decision.py`. The runner
  must produce all three for every task it processes.
- **`automation_policy.md` v1.1** — load-bearing contract. 13
  sections + change control. §6 Green / Yellow / Red. §11 Stop
  conditions (12 of them). §12 Non-goals. The runner is
  governed entirely by this file; if the runner needs to do
  something not allowed by the policy, the policy must change
  first (yellow TASK), not the runner.
- **`automation_window_report_template.md` (with Executive
  Digest)** — every window report follows this shape. The
  Executive Digest is required, 10 numbered fields, ≤10 lines
  total, designed for 30-second B-time skim.
- **`automation_queue.md`** — Codex backlog. The runner reads
  this; the queue is the authorization surface. No queue item →
  no runner work.
- **`blockers.md`** — items waiting for human + ChatGPT review.
  The runner must never resolve a blocker on its own and must
  treat any open blocker as a hard refusal for matching work.
- **`.agent/daily_summaries/`** — end-of-day rollup. The runner
  is not in the loop for these (Human + ChatGPT writes them),
  but the runner should read the most recent one as starting
  context.
- **MANUAL_DRY_RUN (2026-06-29 `475b116`)** — one hand-authored
  window report proves the report shape is reviewable in
  practice. It did NOT prove the execution contract.
- **Executive Digest added (2026-06-29 `6c51db6`)** — the
  reporting contract is now optimized for B-time skim.
- **No full automation active yet** — BLK-0002 explicitly blocks
  activation. The runner described here is the *next layer*
  toward eventually lifting BLK-0002, not a substitute for it.

In short: the protocol is real and stable. What's missing is the
piece that *uses* it without a human typing every prompt.

## Proposed future runner responsibilities

A future runner (a hypothetical `agent_runner` — name TBD; this
memo deliberately avoids naming the file because **no file is
created**) would, when invoked at the start of a window, do
approximately this sequence:

1. **Read policy** — load
   `.agent/policies/automation_policy.md`. Verify policy
   version is recognized; if version is newer than the runner
   was last updated for, refuse and emit a blocker.
2. **Read queue + blockers** — load
   `.agent/automation_queue.md` and `.agent/blockers.md`.
   Build the working set of currently-actionable items: every
   queue item whose `status` is `candidate` or `in_progress`,
   minus any item whose `risk` is `red`, minus any item that
   names a blocker in its `reason blocked` / `next_action`
   that is currently `open`.
3. **Read latest daily summary + latest window report** — load
   the most recent
   `.agent/daily_summaries/YYYY-MM-DD_SUMMARY.md` and the most
   recent
   `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md` for
   recent-state context (so the runner does not redo work
   already shipped).
4. **Select one safe task** — prefer existing `in_progress` /
   `in_review` cleanup work; otherwise pick the
   highest-priority green or low-yellow `candidate`. Hard
   refusals: red items, items naming an open blocker, items
   targeting forbidden files per policy §6.
5. **Ask Codex CLI to plan/review** — Codex drafts a TASK file
   (scaffolded by `new_task.py`), reviews scope, lists allowed /
   forbidden files, and proposes acceptance criteria + stop
   conditions. Codex must NOT execute code edits.
6. **Ask Claude Code to execute** — Claude reads the TASK,
   edits only allowed files, runs validations, commits on
   `main` (or a branch, per policy §5).
7. **Ensure TASK and RUN_REPORT exist** — refuse to commit
   anything if either is missing.
8. **Produce an automation window report** — emit
   `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md`
   starting with the 10-line Executive Digest, followed by the
   18 other template H2 sections. This is the artifact B-time
   review reads.
9. **Stop on red-zone or uncertainty** — any time the runner
   sees a red-zone file, an open blocker, or an uncertain
   risk classification, it MUST stop and add a blocker (or
   reference an existing one) — not try to "be helpful."
10. **Leave decisions for Human + ChatGPT** — the runner never
    pushes, never deploys, never approves red work, never
    lifts a blocker, and never opens an Automation Window
    without explicit prior approval for that day's class of
    window.

**Important — this memo does NOT build this runner.** The above
is a behavioral description for evaluation only.

## Codex CLI role in future runner

- **Model**: GPT-5.5
- **Reasoning effort**: `high` by default. Never `extra-high`
  by default (per policy §4 — `extra-high` is reserved for
  cases where a `high` attempt has demonstrably failed and the
  retry is logged in the window report).
- **Identity**: planner / reviewer / decision proposer.
- **Inputs**: policy, queue, blockers, latest reports, current
  repo state.
- **Outputs**: drafted TASK files, proposed DECISION verdicts,
  new blockers when work is unsafe.
- **Hard constraints**:
  - MUST NOT execute code edits, file writes (other than
    scaffolded TASK / DECISION files), git operations, npm /
    pip installs, or any LLM call outside its own session.
  - MUST NOT approve red-zone work — must instead emit a
    blocker and surface a Human decision request.
  - MUST NOT introduce OpenAI API SDK, key, `.env` entry, or
    HTTP call (BLK-0003 standing block).
  - MUST NOT modify Codex CLI config, Claude Code config, or
    any `.github/workflows/**` file.
  - MUST NOT lift any existing blocker.
  - MUST write blockers (rather than escalate unsafely) when
    encountering ambiguity.
- **Refusal behavior**: if asked to do work outside the policy,
  Codex writes a blocker explaining the request, marks itself
  as awaiting Human + ChatGPT decision, and stops.

## Claude Code role in future runner

- **Identity**: coding executor.
- **Inputs**: a TASK file written by Codex (or by Human +
  ChatGPT during B-time).
- **Outputs**: edited files (only within `allowed_files`),
  validation outputs, RUN_REPORT, optional commit on `main` or
  branch per policy §5.
- **Hard constraints**:
  - MUST read the TASK in full before any edit.
  - MUST edit only files listed in `allowed_files`. Any file
    in `forbidden_files`, in policy §6 red-zone, or
    unmentioned → stop and surface in RUN_REPORT.
  - MUST run the validation commands listed in the TASK.
  - MUST write a RUN_REPORT before committing anything.
  - MUST NOT push or deploy unless the policy AND the TASK
    explicitly allow it (and even then, must defer the push
    decision to the runner's final-step approval gate).
  - MUST NOT introduce OpenAI API SDK / key / HTTP.
  - MUST NOT modify any Codex / Claude config.
  - MUST stop on the first forbidden file appearing in `git
    status`, the first failed validation, the first policy §11
    stop condition.
- **Refusal behavior**: surface in RUN_REPORT as
  `ready_for_review: no` + `requires_human_decision: yes`,
  describe what would have been needed.

## Human + ChatGPT B-time review

The whole point of Executive Digest + window report contract is
to make B-time review fast and unambiguous. The proposed B-time
flow:

1. **Read the Executive Digest** of the latest window report
   first. ~30 seconds. If everything is green / nothing
   blocked / no human decision requested, proceed to step 5.
2. **Inspect Blockers section** if `Open blockers` > 0 or
   includes a new ID (`<N> new this window`).
3. **Inspect Human decisions requested** section if `Human
   decisions needed` > 0. Each item is "approve / reject /
   defer". Default to "defer" if uncertain.
4. **Decide next direction**:
   - approve any push / merge / deploy the runner surfaced
   - approve or reject red-zone unblock requests (these
     require ChatGPT cross-check; Bohao does not act alone
     on red unblocks)
   - set the next Automation Window's intent (one sentence of
     "next: prefer queue items related to X" — the runner
     uses this as a tiebreaker in step 4 of its sequence)
5. **Write the daily summary** at end of day (or have ChatGPT
   draft it from the per-window reports). Use the same
   Executive Digest at the top of each window-section in the
   daily summary, so the daily summary itself is skimmable.

B-time also remains the only time when:
- new red-zone TASKs are *approved* (the runner can write a
  blocker requesting red work; only B-time can approve)
- blockers are *resolved* (BLK-0001 / BLK-0002 / BLK-0003 or
  any future blocker; runner can only `open` them, never
  `resolve`)
- the policy file itself (`automation_policy.md`) is amended
- Codex CLI / Claude Code config is changed

## Automation window report contract

Every Automation Window must produce exactly one report at
`.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md`, using the
template `automation_window_report_template.md` (v1.1+) and
starting with the new **Executive Digest**:

1. Window verdict (`ready_for_review` / `reviewed_approved` /
   `reviewed_changes_requested` / `blocked` / `aborted`)
2. Main outcome — one sentence
3. Tasks completed — `<N>` of `<M>`
4. Commits created — `<N>` total · `<W>` web · `<P>` pipeline ·
   push status
5. Repos touched — `web` / `pipeline` / `both` / `none`
6. Validation — `pass` / `fail` / `partial` · failed count
7. Red-zone / forbidden audit — encounters + forbidden diff count
8. Open blockers — count + IDs + new this window count
9. Human decisions needed — count
10. Safest next action — one sentence

Followed by the 18 other template H2 sections (Metadata,
Executive summary, Goals selected by Codex, Tasks attempted,
Tasks completed, Commits created, Files changed, Validation
results, Claude Code usage summary, Codex review summary,
Red-zone encounters, Blockers created or updated, Failed
validations, Merge / push / deploy status, Human decisions
requested, Suggested ChatGPT review questions, Next recommended
automation tasks, Safety audit, Final status).

The runner MUST emit the report even if the window did nothing
useful — an empty window report saying "0 commits, 0 tasks
attempted, 1 blocker preventing all candidates" is informative
and respects the contract.

## Queue selection rules

The runner picks at most ONE task per window invocation (it can
loop within a window only if each iteration is also a single
clearly-scoped task; the simpler choice is one task per window).

**Preference order**:

1. **Existing `in_progress` / `in_review` cleanup** — close out
   loops opened in prior windows before opening new ones.
   Prevents drift.
2. **Green `candidate`** — `.agent/` only, no app code, no
   pipeline. Smallest possible diffs.
3. **Low-yellow `candidate`** — `.agent/policies/**` edits
   (small, scoped), template amendments, daily summary updates.
   Yellow but not red.
4. **Higher-yellow `candidate`** — app code (`src/**`) changes
   that touch UI-only files (e.g. P1.7b hero numbers). Allowed
   in principle but with caution; runner should require both
   "smallest possible scope" + "validation passes locally"
   before committing.

**Never auto-select**:

- Red `candidate` or any item with `risk: red` — Codex must
  refuse on its own, regardless of `status`.
- `blocked_pending_human` items — these are explicitly waiting
  for human + ChatGPT.
- Items whose `reason blocked` names an open blocker.
- **QUEUE-0002 G2.1d** specifically — while BLK-0001 is `open`,
  the runner MUST refuse to draft a TASK for this item even if
  asked.
- Any item that would introduce OpenAI API while BLK-0003 is
  `open`.
- Any item that requires `git push` to a remote the runner
  doesn't have approval to push to.
- Any item that would activate a real Automation Window (the
  runner is what opens windows; opening a window is not itself
  a queue item).

## Blocker handling

The runner's blocker behavior:

- **Read** `.agent/blockers.md` at every window invocation.
- **Refuse** any candidate work that names a currently `open`
  blocker in its `reason blocked` or `forbidden_files`.
- **Add** new blockers (status `open`) when work cannot
  proceed safely. Each new blocker MUST include the same
  schema as the existing 3: id, title, risk, opened_by, opened_at,
  reason, exact_human_decision_needed,
  suggested_chatgpt_review_question.
- **Never resolve** an existing blocker. Blocker resolution is
  Human + ChatGPT B-time only. The runner may *propose* a
  resolution in a new TASK that requests human decision, but
  the resolution itself is human-only.

Specifically, the 3 standing blockers as of this memo:

- **BLK-0001** (G2.1d red-zone approval) — runner must refuse
  G2.1d TASK drafting.
- **BLK-0002** (full automation activation) — runner refuses to
  open any real `SLEEP_WINDOW` / `WORKDAY_WINDOW` /
  `WEEKEND_WINDOW` until BLK-0002 is explicitly resolved.
  Crucially: **the runner does not "open" windows on its own;
  Bohao does (by invoking it).** The blocker is a check on
  Bohao plus a check on the runner.
- **BLK-0003** (OpenAI API standing block) — runner refuses
  any task proposing OpenAI API usage. Standing block, open by
  design.

## Stop conditions

In addition to all 12 stop conditions in `automation_policy.md`
§11, the runner specifically halts on:

- **Red-zone file needed** — any red-zone path (per policy §6)
  appears in a TASK's `allowed_files` or in the diff. Stop;
  emit blocker.
- **Repo dirty unexpectedly** — uncommitted changes at window
  start that the runner did not author. Stop; do not edit
  anything; surface in window report.
- **Validation fails** — any validation command in the TASK
  returns non-zero. Stop; do not commit; surface in window
  report and RUN_REPORT.
- **Branch cannot fast-forward** — `git pull --ff-only` would
  fail. Stop; do not force; emit blocker.
- **Scope expands beyond TASK** — the runner notices a file
  edit would land outside `allowed_files`. Stop *before* the
  edit.
- **No TASK** — work attempted without a TASK file matching the
  current `task_id`. Hard stop.
- **No validation** — TASK has empty `validation_commands`.
  Hard stop (a no-validation TASK is by definition unverifiable).
- **Unclear risk classification** — Codex cannot decide
  green/yellow/red within `high` reasoning. Stop; emit
  blocker.
- **Generated corpus would change** — any path under
  `corpus/state/`, `corpus/web_bundle*.json`, `corpus/_inbox`,
  `corpus/raw/`, `corpus/processed/`, `corpus/runs/`,
  `corpus/evals/golden_set/` would be touched. Stop; emit
  blocker.
- **Prompt / schema / classifier / extractor / source / cron
  would change** — `src/lib/prompts.ts`,
  `scripts/collector/classifier.py`,
  `scripts/collector/extraction.py`, `corpus/schema/**`,
  `sources.yaml`, `.github/workflows/**`. Stop; emit blocker.
- **Push / deploy needed without approval** — the TASK calls
  for a push or deploy that has not been pre-approved. Stop;
  do not push; surface in window report as a Human decision
  request.
- **Codex / Claude uncertainty** — either model's response
  expresses meaningful uncertainty about safety. Stop; emit
  blocker.

## Merge / push / deploy rules

- **Green `.agent/`-only**: MAY be candidates for automatic
  *commit* on `main`. Push should still be conservative
  initially — the first ~10 Automation Windows should commit
  locally and let Bohao manually push during B-time. Once
  there's a track record, the runner can push under tight
  rules (e.g. only Friday WEEKEND_WINDOW for Sleep
  results).
- **Yellow**: requires RUN_REPORT + DECISION, and often Human
  approval. Runner MAY commit; runner MUST NOT push.
- **Red**: NEVER auto-pushes. NEVER auto-commits. Codex /
  Claude must both refuse on their own per policy §4 / §5 /
  §6.
- **Deploy**: NEVER manual unless Human approves in writing.
  Vercel auto-deploy from a `.agent/`-only push is
  non-disruptive (served bundle byte-identical, as observed in
  every recent web push), but this is true ONLY when no
  `src/**` / `package*.json` / `vercel.json` / `.vercel/**` /
  `.env*` is in the push. The runner MUST verify this
  invariant before any push and abort if it fails.
- **Web push triggers Vercel auto-deploy**: the runner should
  treat any web `main` push as potentially deploy-triggering
  and apply the no-src invariant. Pipeline `main` push does
  not trigger Vercel (pipeline is a separate repo, no Vercel
  project).

## Failure modes and mitigations

(Equivalent to "Risks" in some templates. Listed here per the
TASK's required section.)

- **Agent drift** — the runner picks tasks not in the queue
  because they "seem useful". *Mitigation*: queue is the
  authorization surface; runner refuses out-of-queue work; any
  drift is visible in the window report's "Goals selected by
  Codex" section.
- **Excessive Claude Code quota burn** — runner consumes
  multi-hour Claude Code budget per window. *Mitigation*: per
  policy §11 stop conditions, runner stops on the first
  failed validation / red-zone / forbidden file; window report
  records token estimate (`unavailable` until Claude Code
  exposes a meter); B-time reviewer rejects windows whose
  token spend is disproportionate to outcome.
- **Red-zone mutation** — runner edits a red-zone file by
  accident. *Mitigation*: Claude Code MUST stop on the first
  red-zone path in `git status`; window report's Safety Audit
  surfaces this as an unchecked box; B-time reviewer
  reverts before any push.
- **Unclear queue state** — Codex picks an item whose status
  is ambiguous (`in_progress` left over from a prior
  half-completed task). *Mitigation*: cleanup-first preference
  (rule 1 in Queue selection); runner refuses to start new
  work while leftover `in_progress` exists; surfaces in
  Executive Digest.
- **Long reports** — Codex writes a 2000-line window report
  that obscures the verdict. *Mitigation*: Executive Digest
  is ≤10 lines; DECISION reviewer rejects digests > 12 lines;
  hard-cap on report length surfaced as a stop condition.
- **False sense of safety after manual dry-run** — Bohao +
  ChatGPT approved one MANUAL_DRY_RUN and overestimates how
  much that proves. *Mitigation*: this memo explicitly lists
  the gap (MANUAL_DRY_RUN proved the *reporting* contract,
  not the *execution* contract); the recommended next step is
  NOT a runner implementation.
- **Accidental push / deploy** — runner pushes without
  approval. *Mitigation*: runner never pushes by default;
  even when pushing is enabled for a window class, runner
  must verify the no-src invariant; window report surfaces
  every push as a Human decision item.
- **Hidden config changes** — runner edits `~/.codex/config.toml`
  or `.claude/settings.json`. *Mitigation*: explicit hard
  refusal in Codex role + Claude role + policy §6 red-zone;
  Safety Audit checkbox checks for any config diff.
- **OpenAI API introduction** — runner installs `openai` SDK
  or adds a key. *Mitigation*: BLK-0003 standing block;
  runner refuses any task naming OpenAI; Safety Audit
  explicitly checks for SDK / key / `.env` / HTTP.
- **G2.1d accidentally started too early** — runner drafts a
  G2.1d TASK because the eval set is now live. *Mitigation*:
  BLK-0001 + QUEUE-0002 `blocked_pending_human` + queue rule
  "Never auto-select QUEUE-0002 G2.1d while BLK-0001 is open"
  — Codex's first responsibility is to read the blocker file.

## Implementation options

### Option A — No runner yet, manual Codex / Claude discipline

**What it is**: Status quo. Bohao continues to drive every
TASK / RUN_REPORT / DECISION manually, with Codex / Claude
invoked per-step as today (Bohao prompts each step in their
respective CLIs / interfaces).

**Pros**:

- Zero new code surface.
- Zero new failure modes beyond what already exists.
- Zero new approval surface.
- The protocol already works (5 full loops in 3 days).

**Cons**:

- No actual A-time automation. Bohao must be in the loop for
  every step.
- Doesn't make progress toward eventually lifting BLK-0002.

**Risk**: lowest.

**Verdict**: This is the **safest minimal option**. It is a
valid choice indefinitely; the only reason to leave it is if
the marginal cost of manual driving exceeds the marginal
safety benefit, which is a judgment call only Bohao can make.

### Option B — Local supervised runner, dry-run only

**What it is**: A small local Python script (or similar) that
reads the queue, proposes a TASK, writes the window report — but
does **NOT** invoke Claude Code or Codex CLI as subprocesses.
Bohao sees the proposed TASK and the projected report, then
manually invokes Claude / Codex if happy. The runner is
literally a planning / paperwork helper.

**Pros**:

- Demonstrates the runner-shaped workflow without any
  execution risk.
- Forces the policy + queue + reporting contract through a
  real consumer (the runner) and surfaces template /
  policy gaps before they cost anything.
- Reuses the existing helper-script pattern (`new_task.py` /
  etc. — Python stdlib only, no external deps).
- Easy to revert (one script + maybe one queue entry).

**Cons**:

- Still no actual A-time automation.
- Adds ~150-400 lines of new code surface in `.agent/scripts/`.
- Risk of growing organically into Option C without a clean
  approval gate.

**Risk**: low. Same risk class as the existing
`new_task.py` family.

**Verdict**: This is a **good next experiment** if the answer
to "should we eventually automate?" is yes. It's the smallest
real step toward Option C without committing to Option C.

### Option C — Local automation orchestrator with hard gates

**What it is**: A local script (probably Python) that can
invoke Codex CLI and Claude Code as subprocesses (or via
their respective HTTP APIs if those exist and are
explicitly approved — note: the Anthropic / Codex inference
APIs are NOT the same as the OpenAI API standing block; this
distinction needs explicit Human + ChatGPT clarification
before Option C ships). The orchestrator handles the full
sequence in the "Proposed future runner responsibilities"
section. Limited to green and low-yellow tasks. Writes the
window report with Executive Digest. Stops hard on blockers,
red-zone, validation failures, or scope expansion.

**Pros**:

- Actual A-time automation.
- Demonstrates the execution contract end-to-end.
- Bounded by policy + hard gates.

**Cons**:

- ~500-1500 lines of new code surface.
- Real risk of agent drift if the hard gates are wrong.
- Real risk of Claude Code quota burn if the runner
  iterates badly.
- Real risk of accidentally pushing if the no-src
  invariant check is wrong.
- Probably needs an additional design memo (AgentOps-2c) to
  scope the script's *internal* behavior in more detail
  than this overview.

**Risk**: medium-high. The orchestrator IS the execution
contract.

**Verdict**: This is **the eventual goal** but is too big a
jump from the current state. It should be preceded by
Option B + MANUAL_DRY_RUN-2 + an AgentOps-2c design memo
that drills into the orchestrator's loop, error handling,
and quota / cost guardrails.

### Option D — GitHub Actions or cron automation

**What it is**: Use `.github/workflows/**` cron triggers or
local `cron` jobs to invoke an automation runner on a
schedule, without Bohao manually opening windows.

**Pros**:

- True scheduled automation. Sleep window literally fires
  on time.

**Cons**:

- Violates `automation_policy.md` §12 Non-goals (no new
  GitHub Actions, no autonomous daemon, no cron expansion).
- Violates BLK-0002 (full automation activation) by
  definition.
- Adds GitHub Actions surface area, which is a yellow-to-red
  jump per §6.
- Adds Vercel deploy risk if any push lands.

**Risk**: high. **Explicitly recommended against.**

**Verdict**: **Not recommended now.** Should be revisited
only after Options A / B / C are exhausted AND BLK-0002 is
explicitly resolved AND a separate design memo justifies it.
Even then, the right shape is probably "manually-triggered
GitHub Actions for *Bohao* to invoke from his phone", not
"cron-scheduled autonomous runs."

## Recommended path

The next step is **NOT** a runner implementation in any form.

The recommended next step is **either**:

(a) **MANUAL_DRY_RUN-2** — a second hand-authored window
    report using the new Executive Digest format. Cheaper than
    Option B; validates the digest end-to-end. Green,
    `.agent/automation_runs/` only.

(b) **AgentOps-2c · supervised runner dry-run design** — a
    separate design memo that drills into Option B's
    *internal* loop: which file does the runner read first,
    how does it write the proposed TASK file without
    invoking `new_task.py` (or with it), what does the
    proposed window report look like before any tool runs,
    how does Bohao reject a proposal cleanly. This memo
    would NOT build the runner; it would scope a yet-more-
    detailed design before any code is written.

(c) **Return to product work** — P1.7b (hero mock numbers)
    or P1.7c (model-string SSOT). The automation foundation
    is documented; product work has higher direct-impact ROI
    at this point and doesn't increase automation surface
    area.

**Default recommendation**: Option (c), with (a) as a
secondary if Bohao wants to validate the digest before
sleeping the automation thread for a while.

**Implementation TASK for any option above is a separate
TASK + DECISION**, not part of this memo. If the chosen
path is Option B or C eventually, it goes through:

1. A scoping TASK (AgentOps-2c or similar) that drafts the
   runner's internal design.
2. A separate implementation TASK that writes the runner
   code.
3. A separate DECISION on that implementation.
4. A separate human approval for the first real Automation
   Window opening (which would also require BLK-0002 to be
   explicitly resolved).

## Risks and mitigations

(Summary form; full list in "Failure modes and mitigations"
above.)

1. **Agent drift** → queue authorization surface, refusal on
   out-of-queue work.
2. **Excessive Claude Code quota burn** → hard stop conditions,
   token estimate in window report, B-time review rejects
   disproportionate spends.
3. **Red-zone mutation** → Claude Code stops on first red-zone
   path in `git status`; Safety Audit surfaces unchecked
   boxes; B-time reverts.
4. **Unclear queue state** → cleanup-first preference; runner
   refuses new work while leftover `in_progress` exists.
5. **Long reports** → Executive Digest ≤10 lines; reviewer
   rejects > 12 lines.
6. **False sense of safety after MANUAL_DRY_RUN** → explicit
   in this memo; recommended next step is NOT a runner
   implementation.
7. **Accidental push / deploy** → runner never pushes by
   default; no-src invariant check; window report surfaces
   every push as Human decision.
8. **Hidden config changes** → hard refusal in Codex role +
   Claude role + policy §6 red-zone; Safety Audit checks for
   config diffs.
9. **OpenAI API introduction** → BLK-0003 standing block;
   runner refuses any task naming OpenAI.
10. **G2.1d accidentally started too early** → BLK-0001 +
    QUEUE-0002 `blocked_pending_human` + explicit queue rule
    "never auto-select QUEUE-0002 while BLK-0001 is open".

## Explicit non-goals

This memo and any future TASK that adopts it MUST observe:

- **No code in this task.** No runner. No daemon. No
  scheduler. No cron. No GitHub Actions workflow. No
  executable shell script. No config file that enables
  automatic execution.
- **No OpenAI API.** No SDK install, no key, no `.env`
  entry, no HTTP call. BLK-0003 standing block.
- **No Codex CLI config edit.** `~/.codex/config.toml` and
  any equivalents are untouched.
- **No Claude Code config edit.** `~/.claude/settings.json` /
  project `.claude/settings.json` untouched.
- **No app code change.** `src/**` / `package*.json` /
  `vercel.json` / `.vercel/**` / `.env*` untouched.
- **No pipeline-repo code change.** Pipeline read-only.
- **No full automation activation.** BLK-0002 remains
  `open`; this memo does not propose its resolution.
- **No G2.1d.** BLK-0001 remains `open`; QUEUE-0002 remains
  `blocked_pending_human`; runner must refuse to draft
  G2.1d TASK.
- **No blocker resolution.** BLK-0001 / BLK-0002 / BLK-0003
  all remain `open` regardless of any DECISION on this memo.
- **No push by this TASK.** This memo's matching commit
  stack waits on explicit human "push AgentOps-2b memo"
  before going to `origin/main`.
- **No deploy.** Vercel auto-trigger from a `.agent/`-only
  web push is non-disruptive; that's not a manual deploy.
  Manual `vercel deploy` is NOT invoked.

## Decision questions for Human + ChatGPT

1. **Is the recommended path Option (a) MANUAL_DRY_RUN-2, (b)
   AgentOps-2c design memo, or (c) return to product work
   (P1.7b / P1.7c)?** Default recommendation is (c) with (a)
   as secondary.
2. **If (b) AgentOps-2c, should it scope Option B (supervised
   dry-run runner) or Option C (orchestrator with hard
   gates)?** Recommendation: B first.
3. **What is the maximum allowed autonomy in the first real
   automation test?** Specifically: should the first test
   ever call Codex / Claude as a subprocess, or always wait
   for Bohao to manually invoke them after seeing the
   proposed TASK?
4. **Should automatic push EVER be allowed for green
   `.agent/`-only work?** Or should the runner always
   commit-only and let Bohao push during B-time?
5. **How much Claude Code quota should be consumed per
   window?** A budget per WORKDAY_WINDOW vs SLEEP_WINDOW vs
   WEEKEND_WINDOW would help the runner choose tasks
   appropriately. (Token meter currently `unavailable` —
   budget would be by wall-clock-time and / or commit count
   until that lands.)
6. **What report length is acceptable for B-time review?**
   The Executive Digest is ≤10 lines; the full report can
   be longer. Should there be a hard cap (e.g. 600 lines)
   beyond which the report is rejected on principle?
7. **Distinction between OpenAI API (BLK-0003) and Codex CLI's
   underlying inference API**: Codex CLI uses OpenAI infra
   under the hood. Does BLK-0003 cover Codex's invocations
   too (in which case Codex CLI usage is itself blocked,
   contradicting the whole memo), or only direct OpenAI
   SDK / HTTP calls from app/pipeline code (the current
   intended reading)? Needs explicit clarification before
   any Option B/C implementation TASK.
8. **Pipeline-repo automation**: this memo focuses on the
   web repo's `.agent/`. Should Option B/C ever touch the
   pipeline repo? If yes, it crosses BLK-0001-adjacent
   territory (pipeline `corpus/`, classifier prompt, etc.)
   and probably warrants its own separate design memo.

## Acknowledgements / Sanity checklist

This memo:

- Cites policy §6 / §11 / §12 / §13 explicitly.
- Cites the Executive Digest contract as the required top
  section of every future window report.
- Cites BLK-0001 / BLK-0002 / BLK-0003 as currently `open`
  and not lifted by this memo.
- Cites QUEUE-0002 G2.1d as currently `blocked_pending_human`
  and not unblocked by this memo.
- Cites the MANUAL_DRY_RUN (`475b116`) as proof of *reporting*
  contract only, not *execution* contract.
- Lists ≥4 implementation options with explicit safest
  minimal (A) and explicit not-recommended (D).
- Lists ≥10 risks with mitigations.
- Lists ≥8 decision questions for Human + ChatGPT.
- Recommends a next step that is **not** a runner
  implementation.
- Creates **no executable file**.
