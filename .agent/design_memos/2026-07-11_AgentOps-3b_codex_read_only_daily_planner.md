# AgentOps-3b · Codex Read-Only Daily Planner

> Design-only memo. No planner code. No runner.
> No `.agent/scripts/**` edit. No standalone
> planner report file. Successor to AgentOps-3a
> (`.agent/design_memos/2026-07-08_AgentOps-3a_automation_advancement.md`).
> Task: `.agent/tasks/2026-07-11_run_01_TASK.md`.

## Status

- **Type**: design + spec memo
- **Version**: draft_for_human_chatgpt_review
- **Scope**: `.agent/`-only. No `src/**`,
  `src/data/**`, prompts, API routes,
  pipeline, `.github/workflows/**`,
  `.agent/scripts/**`, `.agent/policies/**`,
  `.agent/templates/**`, `.agent/blockers.md`,
  `.agent/automation_queue.md`,
  `.agent/planner_reports/**`, or any
  benchmark-fixture / runner / harness /
  daemon file change.
- **Depends on**: AgentOps-3a memo +
  DECISION (13 initial answers to open
  decisions), AgentOps-2b Q7 (Codex CLI
  via ChatGPT sign-in is sanctioned),
  AgentOps-2c Q3-Q8 (`.agent/scripts/**`
  hard rule) + Q10 (automation-infra
  pause holds).
- **Standing blockers**: BLK-0001 ·
  BLK-0002 · BLK-0003 all remain `open`.
  Q10 pause on AgentOps-2 runner
  implementation continues; AgentOps-3
  remains a strategic-scoping track.

## 1. Purpose

Codex, invoked read-only via the ChatGPT
sign-in channel, becomes the first
automation-side actor in the AgentOps-3
system. Its job is narrow and modest:
**turn Bohao's daily "what should I do next
and why" into a written planner report
that Bohao + ChatGPT can review in 5-15
minutes.**

Explicit boundaries:

- Codex **reduces the daily manual
  planning burden**, not the review or
  approval burden. Bohao + ChatGPT
  remain the ones deciding what
  actually happens.
- Codex **does not replace human +
  ChatGPT judgment**. Every planner
  report is a *draft recommendation*
  the human is free to override,
  redirect, or discard.
- Codex **produces a short daily
  planner report** at
  `.agent/planner_reports/YYYY-MM-DD_CODEX_DAILY_PLANNER.md`
  in the future (see §6 for the
  planner-writes-report vs
  human-writes-report split); v1 output
  format is defined in §7.
- Codex **recommends exactly one next
  action** (with one alternative if
  the human wants a different
  direction — see §9 rule 10). Bundled
  multi-task recommendations are
  explicitly forbidden.
- Codex **remains read-only** in v1.
  No file mutation except (in a later
  phase, gated by a separate DECISION)
  writing to `.agent/planner_reports/`.
  Never writes into `.agent/tasks/`,
  never invokes Claude Code, never
  pushes, never deploys.

This mirrors the design principle behind
Candidate 1's stream sentinel and
Candidate 4's empty-PDF gate:
**visibility before automation.** The
planner report becomes a written
artifact at every hand-off; nothing is
silent.

## 2. Current automation state

Achieved as of 2026-07-11 daily summary
(`.agent/daily_summaries/2026-07-11_SUMMARY.md`):

- ✅ **AgentOps-3a approved and pushed**
  (`74939b6` + `36acd82` + `7a1bdfd` +
  cleanup `80b3247`). Phased 3a → 3f
  rollout endorsed. 13 initial answers
  to §15 open decisions recorded in
  the DECISION.
- ✅ **Claude Code executor loop is
  mature.** 20 completed dogfood loops
  through the AgentOps-3a DECISION.
  The helper triple stays under
  `.agent/scripts/` (hard-rule
  frozen).
- ✅ **ChatGPT + human decision loop
  is mature.** Every DECISION file is
  ChatGPT-authored (human-mediated).
  No substantive fix has been
  requested post-DECISION on any of
  the 20 loops.
- ⏸ **Codex is not yet active.** 3b
  is the first loop that scopes
  Codex's role.
- ⏸ **Automation-infra remains
  paused** per AgentOps-2c Q10. No
  cron, scheduler, daemon, or
  GitHub-Actions runner dispatching
  AI work.
- ⛔ **No auto-execution.** Codex may
  not invoke Claude Code. Claude
  Code may not push or deploy
  without explicit human approval.
- ⛔ **Report regression harness is
  a future quality gate.** 3d
  designs it, 3e prototypes it. Not
  active yet. Planner must degrade
  gracefully when the harness is
  absent (§10).

## 3. Planner operating mode

v1 planner operating mode — pinned in this
memo:

- **Manual invocation only.** Bohao
  starts a Codex CLI session (ChatGPT
  sign-in, per AgentOps-2b Q7 — not
  OpenAI API in any Q7-blocked sense)
  and instructs Codex to produce the
  day's planner report. AgentOps-3a
  DECISION answer #1 pins this: "manual
  first, not scheduled".
- **No schedule.** No cron entry, no
  `at`-job, no launchd, no GitHub
  Actions workflow. If Bohao doesn't
  invoke Codex on a given day, no
  planner report exists for that day.
- **No daemon.** No long-lived process
  watching the repo.
- **No background loop.** Codex does
  not re-invoke itself.
- **No file edits except the future
  planner report output** (§6). No
  modification of TASK / RUN_REPORT /
  DECISION / summary / blockers /
  queue / policy / template /
  memo files.
- **No direct Claude invocation.**
  Codex may propose a Claude Code
  prompt (see §11), never execute one.
- **No direct TASK creation.** Codex
  may not write anywhere under
  `.agent/tasks/`. Future phases may
  extend this to `.agent/tasks_draft/`
  only, per AgentOps-3a DECISION
  answer #9.
- **No push.** Codex has no `git
  push` in its allowed-commands list
  (§5).
- **No deploy.** No `vercel deploy`,
  no `npm run deploy`, no manual
  deployment command anywhere.
- **No OpenAI API setup through repo
  code.** BLK-0003 Q7-blocked senses
  remain in force. Codex CLI's own
  ChatGPT-sign-in inference is a
  separate channel that does not
  trigger BLK-0003 (per AgentOps-2b
  Q7).

## 4. Allowed read inputs

### 4.1 Codex MAY read

- `git status` and `git log --oneline`
  in both the web repo and the
  pipeline repo (see §5 command
  list).
- `.agent/daily_summaries/**` — full
  history is useful for trajectory
  awareness.
- `.agent/tasks/**` — most recent
  N=10 TASK files by default; full
  history if planner needs to trace
  a specific decision.
- `.agent/run_reports/**` — most
  recent N=10 for validation-status
  awareness (build/lint/screenshot/drift
  results, harness verdicts once
  they exist).
- `.agent/decisions/**` — most
  recent N=10 for verdict trend.
- `.agent/design_memos/**` — all
  memos for AgentOps-2b, 2c, 3a,
  3b, plus product design memos
  (P2.0a, P2.1a).
- `.agent/blockers.md` — every
  planner run reads this in full.
- `.agent/automation_queue.md` —
  every planner run reads this
  in full.
- `.agent/policies/**` — full read
  is required so recommendations
  align with the standing risk
  vocabulary.
- `.agent/templates/**` — for
  understanding the target shape of
  future artifacts.
- `.agent/README.md` — one-time
  onboarding read; subsequent runs
  can skip.
- `package.json` — metadata only
  (script names, dep list). Not
  the whole file every run —
  planner uses it to check what
  `npm run` commands are
  available.
- **Selected source files
  read-only, only when needed to
  understand task impact.** E.g.
  if the candidate task is
  "banner copy tune", planner
  may `head` the relevant
  `page.tsx` region to see the
  current copy. Never full-file
  reads unless justified.

### 4.2 Codex should NOT read unless
explicitly needed

- **Large generated corpus files**
  (`src/data/web_bundle.json`, ~1.4 MB;
  `src/data/web_bundle_pipeline.json`,
  ~2.1 MB). Metadata via
  `python3 -c "import json; …"`
  one-liner is fine; full contents
  are not.
- **Private env files** — `.env*` in
  either repo. Never read.
- **Secrets** — any file matching
  `**/secrets*` or `**/credentials*`.
- **Local scratchpad artifacts with
  sensitive data** — the E2E test's
  `resume_text.pdf` in the
  scratchpad is a synthetic
  benchmark, but the scratchpad
  can also contain personal
  material; treat as
  read-forbidden unless explicitly
  named.
- **User private résumé** — no user
  résumé ever enters the planner's
  context. This is the strict
  privacy boundary matching
  AgentOps-3a §7.
- **Node_modules** — never traverse.

## 5. Allowed commands

### 5.1 Codex MAY run

**Read-only inspection**:

- `git status`
- `git log --oneline -N` (with a
  reasonable N ≤ 30)
- `git diff --name-only origin/main..HEAD`
- `git rev-list --left-right --count origin/main...main`
- `git show --stat <SHA>` (for a
  specific commit that's relevant)
- `find` / `ls` scoped to `.agent/`
  or the repo root (never
  system-wide `find /`)
- `grep` / `ripgrep` scoped to
  `.agent/` or specific
  directories
- `cat` / `head` / `tail` / `wc` on
  `.agent/**` files
- `sed -n 'A,Bp' file` for pinpoint
  reads (no in-place edits)
- `python3 -c "import json; print(…)"`
  for reading bundle metadata
  (matches P2.0a's read pattern);
  never reads full record arrays
- `date` for timestamping the
  planner report
- Codex CLI's own file-inspection
  commands (via ChatGPT sign-in)

### 5.2 Codex must NOT run

**All state-changing operations**:

- `git add` / `commit` / `push` /
  `reset` / `checkout` / `merge` /
  `rebase` / `revert` / `stash` /
  `tag` / `branch -D`
- `git clone` (already-cloned repos
  are the working set)
- `npm install` / `npm ci` /
  `npm uninstall` / `npm update` /
  `yarn` / `pnpm` anything
- `npm run build` unless
  **explicitly requested** by
  Bohao for a specific planner run
  (default: skip; the planner uses
  the last RUN_REPORT's build
  status)
- `npm run dev` (never — dev
  server is user-driven)
- `npm run screenshot` (matches
  §5.1 read-only intent but is a
  Playwright browser
  invocation; disallow to keep
  Codex strictly zero-side-
  effect)
- `npm run check:web-bundle-stats`
  is allowed **only** as a
  read-only verification when
  planner is investigating a
  drift-related task
- `npm run collect` / `python -m
  scripts.collector …` (pipeline
  repo; matches AgentOps-2c
  no-collector rule)
- `vercel deploy` / `vercel …`
  anything
- Any script that modifies repo
  state under `.agent/scripts/**`
  (hard rule)
- Any command touching `.env*` /
  secrets
- Any OpenAI API or Anthropic API
  HTTP call (Codex CLI's own
  ChatGPT-sign-in inference is a
  separate channel not in scope
  here)
- Any Playwright report
  generation in 3b (that's 3e's
  scope)

## 6. Future write output

### 6.1 Output directory

`.agent/planner_reports/` (new
directory; matches AgentOps-3a
DECISION answer #13).

### 6.2 File naming

```
.agent/planner_reports/YYYY-MM-DD_CODEX_DAILY_PLANNER.md
```

Example: `.agent/planner_reports/2026-07-12_CODEX_DAILY_PLANNER.md`.

### 6.3 In 3b, DO NOT create actual
planner report

- No `.agent/planner_reports/*.md`
  file lands via this loop.
- §14 embeds a **mock example** as
  a fenced Markdown block inside
  this memo, NOT as a standalone
  file. This keeps the 3b commit
  scope to exactly TASK + memo +
  RUN_REPORT.

### 6.4 Who writes the report

- In v1 (post-3b DECISION-driven
  Codex invocation): **Codex
  writes it via the ChatGPT sign-in
  channel.** Bohao invokes the
  session, points Codex at this
  memo, and asks for the day's
  planner report. Codex's write
  happens inside its own session
  buffer that Bohao then saves
  (via file save UI or by asking
  Codex to write via `Write`
  file-tool if allowed).
- **Whether Codex may use file-
  write tools directly to
  `.agent/planner_reports/`** is
  an open decision (§16 #7).
  Default until decided: Bohao
  hand-saves the buffer to disk.

## 7. Planner report schema

The planner report must contain exactly
these 14 subsections in order. Format
is Markdown with H2 headers. Total
length target: ≤ 100 lines / ≤ 15
minutes of human review.

1. **Date / repo status.** ISO date,
   web repo branch + ahead/behind
   status, pipeline repo branch +
   ahead/behind, cleanliness of both
   working trees.
2. **Yesterday / recent completed
   work.** 1-3 lines summarizing the
   most recent loops that landed on
   `origin/main`. Extract from
   `.agent/daily_summaries/` +
   `git log`.
3. **Current blockers.** Verbatim
   status of BLK-0001 / BLK-0002 /
   BLK-0003 (all open in this
   snapshot). Any newly-added
   blocker.
4. **Current automation phase.**
   Which AgentOps-3 phase we're at
   (3a done, 3b in progress, or
   whichever is current).
5. **Product state.** One-line
   pointers to the latest product
   surfaces (e.g. "homepage carries
   Corpus snapshot: May 14, 2026;
   Candidate 1 stream sentinel +
   Candidate 4 empty-PDF gate
   live").
6. **Candidate next tasks.**
   **2-4 candidates** with title +
   risk classification + one-line
   rationale. Excludes tasks
   blocked by BLK-0001 / 2 / 3.
7. **Recommended single next
   task.** Exactly one default.
   Names title + risk + estimated
   scope in files/lines.
8. **Why this task and why not
   the alternatives.** ≤ 3 lines
   for the default, ≤ 2 lines
   dismissing each other
   candidate.
9. **Risk classification** of
   the recommended task
   (green / yellow / red), citing
   the vocabulary from §8.
10. **Required validation.**
    Which of `npm run build` /
    `npm run lint` /
    `npm run check:web-bundle-stats`
    / `npm run screenshot` /
    regression harness the
    recommended task will need.
11. **Whether report regression
    is required.** Yes / no with
    reason. Follows §10's
    5-state logic.
12. **Human decisions needed.**
    Any yes/no question Bohao
    must answer before Claude
    Code can execute. Ideally
    a single line: "Start
    <task-name>? y/n".
13. **Exact Claude Code prompt
    if approved.** A code-fence
    block that Bohao can copy-
    paste into Claude Code
    verbatim. Same format as
    the "Start XXX" messages
    Bohao already sends today,
    e.g.
    `"Start AgentOps-3c:
    benchmark resume fixtures.
    Context: … Goal: … Do NOT:
    …"`
14. **Stop conditions /
    forbidden actions.** Any
    action Claude Code must NOT
    take even if the human
    approves the task —
    typically the standing
    "Do NOTs" set from every
    push in the last 20 loops.

Target total: **≤ 15 minutes of
human + ChatGPT review time**. If the
report cannot fit into 15 minutes,
the answer is to tighten the report,
not expand Bohao's day.

## 8. Risk classification rules

Uses the vocabulary from
`.agent/policies/agent_policy.md` §2 +
`.agent/policies/automation_policy.md`
§6, plus the AgentOps-3a §9
extension.

### 8.1 Green

- Docs / READMEs.
- `.agent/daily_summaries/` entries.
- `.agent/planner_reports/` entries
  (this memo's new directory).
- Read-only audits (like this memo
  and its predecessors).
- Design memos (this memo qualifies).
- **Benchmark fixture Markdown
  files** — 5 resume fixtures A-E
  under `.agent/regression_fixtures/`
  per AgentOps-3a §14 candidate #2
  are green because they have zero
  runtime impact.

### 8.2 Yellow

- User-visible UI copy edits
  (P1.7 / P1.8 series).
- Small client-side UX changes
  (Candidate 4 pattern).
- Report renderer tweaks
  (Candidate 1 `page.tsx` half).
- Eval helper tweaks that don't
  change the judge model.
- **Planner spec** (this loop).
- **Regression harness
  prototype** (3e's future
  script).

### 8.3 Red

- Prompt changes
  (`src/lib/prompts.ts` —
  frozen).
- Model-selection changes
  (Sonnet generator or Haiku
  judge).
- Classifier / extractor
  logic.
- Corpus promotion / bundle
  swap.
- `sources.yaml` (pipeline).
- `.github/workflows/**` /
  cron changes.
- Automation runner
  implementation (BLK-0002
  gated).
- OpenAI API introduction
  (BLK-0003 Q7-blocked
  senses).
- Deploy / auth / payment /
  DB-schema.
- Anything that could broadly
  affect generated report
  quality without going
  through the §10 regression
  gate.
- Codex CLI or Claude Code
  config mutation.

## 9. Next-task recommendation algorithm

Codex applies this algorithm every
planner invocation. All 12 steps are
sequential and pinned.

1. **Check repo cleanliness.** If
   either repo is dirty or has an
   unexpected ahead/behind count,
   short-circuit and recommend
   "resolve dirty state before new
   work" — no candidate list.
2. **Check blockers.** Read
   `.agent/blockers.md`. If a new
   blocker exists, surface it in
   the report; do not recommend
   tasks that its `blocks` field
   forbids.
3. **Check last completed loop.**
   Latest DECISION verdict and
   push state.
4. **Check active phase from
   daily summaries + design
   memos.** Determine which
   AgentOps-3 phase (3a done, 3b
   or 3c next, etc.) or which
   product line (P2.x, Candidate
   N) is active.
5. **Generate 2-4 candidate
   next tasks.** Draw from:
   AgentOps-3 phased roadmap
   (§14 of AgentOps-3a memo),
   P2.1a §9 candidate list
   (Candidate 2, 5),
   `.agent/automation_queue.md`
   pending items, and any
   fresh Bohao-stated goal.
6. **Reject tasks blocked by
   BLK-0001 / 2 / 3.** G2.1d
   never appears in the
   candidate list until
   BLK-0001 resolves.
   Full-automation activation
   never appears until
   BLK-0002 resolves. OpenAI-
   API tasks (in Q7-blocked
   senses) never appear
   until BLK-0003 resolves.
7. **Prefer the smallest task
   that advances the current
   phase.** All else equal,
   green > yellow > red;
   fewer files > more files;
   design > implementation
   when the prior phase's
   spec is incomplete.
8. **Prefer design/spec
   before implementation for
   automation
   infrastructure.**
   AgentOps-3d before 3e;
   AgentOps-3b before Codex
   file-writes (§16 #7).
9. **Recommend exactly one
   default task.** No
   bundling. §7's Recommended
   section names one.
10. **Provide one
    alternative** if the
    human wants a different
    direction. §7's
    Why-not-alternatives
    section names one
    runner-up.
11. **Never recommend
    bundled multi-task
    execution.** Two loops
    is two DECISIONs.
12. **Never recommend
    red-zone work without
    explicit human
    setup.** If a red-zone
    task is a candidate,
    the report says so
    plainly and asks Bohao
    to explicitly stage
    the blocker resolution
    before Claude Code
    starts.

## 10. Integration with report regression harness

Codex must reason about the
regression harness's status even
before the harness exists. Five
states cover all combinations:

- **A. Harness unavailable
  (current state through 3d).**
  Codex marks §11 of the
  planner report as "regression
  harness unavailable — this
  task's product-quality
  impact is not
  auto-verifiable". Codex must
  NOT pretend coverage
  exists. §7's Required
  validation section lists
  the manual validations
  (build / lint / drift /
  screenshot) that stand in.
- **B. Harness exists but not
  required by this task.**
  If §8.1 of AgentOps-3a
  says regression is
  optional (`.agent`-only
  edits, docs, non-report
  copy), planner marks §11
  as "not required — task
  class does not touch
  generated-report
  quality".
- **C. Last regression
  verdict is green and this
  task requires
  regression.** Planner
  marks §11 as
  "required; last verdict
  green (SHA
  <baseline-sha>); run
  before push approval".
- **D. Last regression
  verdict is amber and
  this task requires
  regression.** Planner
  escalates: §12 human-
  decision list gets a
  new question "Amber
  verdict outstanding on
  <fixture> — approve
  proceeding, request
  re-run, or defer?"
  Codex does NOT
  auto-recommend
  proceeding.
- **E. Last regression
  verdict is red.** Codex
  MUST recommend a
  **fix or revert task**,
  never a new-feature
  task. §7's Recommended
  section names the fix;
  §8-Why explains that
  new work is blocked
  until the red is
  cleared. This aligns
  with AgentOps-3a
  DECISION answer #6
  (red auto-blocks
  push).

## 11. Interaction with Claude Code

- Codex **may propose a Claude
  Code prompt** — that's §7's
  §13 subsection.
- Codex **may not execute it**.
  No `claude-code` CLI
  invocation, no MCP call, no
  `Bash`-tool that starts
  Claude.
- Codex **may not start
  Claude automatically.** No
  scheduled hand-off.
- Codex **may not write TASK
  directly in v1** —
  AgentOps-3a DECISION answer
  #9 pins this.
- Codex **may later write to
  `.agent/tasks_draft/`
  only** after a separate
  DECISION (matches AgentOps-
  3a §4 phase 3c). Even
  then, promotion into
  `.agent/tasks/` is a
  human action.
- **Claude Code remains
  responsible for actual
  TASK / RUN_REPORT
  implementation after human
  approval.** The current
  loop shape (Bohao's "Start
  X" message → Claude
  scaffolds TASK → executes
  → drafts RUN_REPORT →
  ChatGPT authors DECISION →
  Bohao approves push)
  continues unchanged.

## 12. Human + ChatGPT daily workflow

The target daily flow, once 3b
DECISION approves and Codex is
active:

1. Bohao invokes Codex CLI
   (ChatGPT sign-in) and asks
   for the day's planner
   report.
2. Codex reads §4 inputs,
   applies §9 algorithm,
   outputs the §7 planner
   report to a buffer.
3. Bohao saves the buffer to
   `.agent/planner_reports/YYYY-MM-DD_CODEX_DAILY_PLANNER.md`
   (or Codex writes directly
   once §16 #7 is decided).
4. Bohao sends the planner
   report to ChatGPT for
   review.
5. ChatGPT reviews and
   adjusts — challenges the
   recommendation, suggests
   a different candidate,
   sharpens the Claude prompt,
   or approves as-is.
6. Bohao **approves one next
   action** (the default
   recommendation, the
   alternative, or a
   third option ChatGPT
   proposed).
7. Bohao sends the approved
   §13 prompt to Claude Code
   (same shape as the
   "Start X" messages the
   last 20 loops used).
8. Claude Code executes
   the approved task.
9. Claude Code stops at
   RUN_REPORT or DECISION
   depending on the
   prompt's stop
   instruction.
10. Bohao + ChatGPT
    approve push.
11. Claude Code pushes,
    extends daily summary,
    commits + pushes
    cleanup.

**Target human time: 5-15
minutes per day** — reading
the planner report, sending
to ChatGPT, approving one
action, approving push.
Everything else remains
Claude's execution work.

## 13. Stop conditions

Codex must stop and recommend
human review — do not silently
proceed — if any of these
happen:

- Repo dirty unexpectedly
  (either web or pipeline).
- Local ahead / behind
  unexpected (e.g. web is
  behind `origin/main`; a
  Vercel deploy landed
  outside our workflow).
- Forbidden-file diff
  exists on `origin/main`
  that Codex can't explain
  from the last DECISION.
- Blocker conflict — a
  candidate task collides
  with an open blocker
  Codex missed.
- Task appears red-zone
  and no separate blocker
  resolution TASK is in
  progress.
- Prompt / model / data /
  pipeline touched
  unexpectedly (e.g. a
  hand-edit landed on
  `main` that Codex
  didn't expect).
- Regression harness
  verdict is red or
  amber (§10 D/E).
- Cost spike detected
  in metadata (once the
  harness is emitting
  cost.json).
- Ambiguous next step —
  multiple equally-good
  candidates and no
  policy resolves them.
- Missing required
  context — e.g. the
  latest daily summary
  is > 3 days old and
  no fresh push in the
  interim; Codex can't
  guess the current
  strategic direction.
- User goal conflicts
  with policy — e.g.
  Bohao asks for a
  task that would
  violate a standing
  guardrail.

In every stop case, Codex
writes what it stopped on
into §12 of the planner
report and does not
recommend a task.

## 14. Example daily planner report

Below is a **mock example** for
the current 2026-07-11 state.
It recommends **AgentOps-3c
benchmark resume fixtures** as
the default next task after 3b,
because the report regression
harness (3d/3e) needs stable
benchmark inputs before it can
be designed concretely.

The mock is embedded inside
this memo intentionally — no
standalone file at
`.agent/planner_reports/`
lands via this loop.

```markdown
# Codex Daily Planner Report · 2026-07-12

## 1. Date / repo status
- Date: 2026-07-12
- Web repo: `main` = `origin/main` at
  `<sha-after-3b-push>` · clean
- Pipeline repo: `main` = `origin/main`
  = `b019786` · clean

## 2. Yesterday / recent completed work
- AgentOps-3b Codex read-only planner
  spec pushed (2026-07-11).
- Codex is now scoped but not active.
  Claude Code loop unchanged.

## 3. Current blockers
- BLK-0001 · G2.1d red-zone — `open`.
- BLK-0002 · full automation
  activation — `open`.
- BLK-0003 · OpenAI API standing
  Q7-scoped — `open`.
- No new blockers.

## 4. Current automation phase
AgentOps-3b done. Next phase in
memo §14 roadmap: AgentOps-3c
benchmark resume fixtures.

## 5. Product state
- Homepage: `Corpus snapshot: May 14,
  2026` chip live (P2.0b);
  Candidate 1 stream sentinel +
  Candidate 4 empty-PDF gate live.
- Real-report entrance reliability
  materially stronger per E2E
  smoke test.

## 6. Candidate next tasks
- **A. AgentOps-3c benchmark resume
  fixtures** — green. 5 synthetic
  personas A-E as Markdown files.
  Zero runtime impact.
- **B. AgentOps-3d report regression
  harness design memo** — yellow.
  Depends on 3c fixtures to point
  at concretely.
- **C. Candidate 2 quote-integrity
  substring check on eval path** —
  yellow. Independent product
  reliability loop.
- **D. Candidate 5 sample-vs-real
  audit** — green (memo half).

## 7. Recommended single next task
**AgentOps-3c · benchmark resume
fixtures.**
Files: `.agent/regression_fixtures/{A,B,C,D,E}.md`
+ `README.md`. ~200-400 lines total.

## 8. Why this task and why not the
alternatives
Default: 3c unblocks 3d's design (a
harness spec needs concrete fixtures
to reference).
- B (3d) → needs 3c first per memo
  §14.
- C (Candidate 2) → independent from
  the AgentOps-3 track; can slot in
  between 3c and 3d if desired but
  not this cycle's default.
- D (Candidate 5) → soak-later per
  Candidate 1/4 DECISIONs.

## 9. Risk classification
Green (per AgentOps-3b §8.1). Zero
runtime impact.

## 10. Required validation
- `git diff --name-only` — confirm
  only `.agent/regression_fixtures/**`
  changed.
- No build required (Markdown only).
- No screenshot required.
- No drift check required.

## 11. Whether report regression is
required
State A (harness unavailable). Not
required because task class is green
Markdown fixtures. §10-A applies.

## 12. Human decisions needed
- Start AgentOps-3c benchmark
  resume fixtures? y/n

## 13. Exact Claude Code prompt if
approved
```
Start AgentOps-3c: benchmark
resume fixtures.
Context: AgentOps-3a and
AgentOps-3b are approved and
pushed. …
Goal: Create 5 synthetic resume
fixtures A-E …
Do NOT: implement Codex planner,
implement Playwright harness,
modify src/**, modify
.agent/scripts/**, run
collector, push, deploy, …
```

## 14. Stop conditions / forbidden
actions
- Do not exceed 5 fixture files +
  1 README.
- Do not include any real user
  résumé content.
- Do not touch any red-zone
  file.
- Stop if `git status` shows
  anything outside
  `.agent/regression_fixtures/`
  or `.agent/tasks/` or
  `.agent/run_reports/`.
```

Note the mock is under the ≤ 100-line
target and the Human decisions
section reduces to a single yes/no.
That's the tone every real planner
report should aim for.

## 15. Acceptance criteria for future 3b implementation

When a future TASK implements the
first actual Codex planner
invocation (this memo does NOT open
that TASK), the run must prove:

- ✅ Codex can read repo state via
  the allowed §5.1 commands only.
- ✅ Codex can summarize the
  latest `.agent/` state
  (last N daily summaries, last
  N RUN_REPORTs, last N
  DECISIONs) in ≤ 20 lines.
- ✅ Codex can identify all open
  blockers verbatim from
  `.agent/blockers.md`.
- ✅ Codex can produce a
  §7-compliant planner report
  (14 subsections, ≤ 100
  lines).
- ✅ Codex recommends exactly one
  task (§9 rule 9).
- ✅ Codex avoids blocked / red-
  zone tasks (§9 rules 6, 12).
- ✅ Codex does not modify any
  runtime code.
- ✅ Codex does not push or
  deploy.
- ✅ Codex does not create a
  TASK file directly (§11).
- ✅ Codex output stays within
  5-15 minutes of human review
  (per §12 target).
- ✅ Codex's planner report
  cites at least: current
  git SHA, current
  blockers-md contents,
  last DECISION verdict,
  the memo section justifying
  its recommendation.
- ✅ Codex's forbidden-command
  list (§5.2) is never
  invoked.
- ✅ Codex writes at most one
  file: the planner report
  itself (if §16 #7 is
  answered yes) or nothing
  (if answered no; Bohao
  hand-saves).

## 16. Open decisions

Decisions for Bohao + ChatGPT
before a future 3b-implementation
TASK opens:

1. **Should the planner report be
   generated by Codex CLI
   manually first?** Memo default:
   yes (aligns with AgentOps-3a
   DECISION answer #1).
2. **Should planner reports be
   committed to the repo or
   treated as scratchpad until
   stable?** Memo default: commit
   to `.agent/planner_reports/`
   from day 1 for auditability;
   size is small (~100 lines
   Markdown).
3. **Should Codex output an
   exact Claude Code prompt in
   every report?** Memo default:
   yes (§7 §13). Matches the
   "Start X" message shape
   Bohao already sends.
4. **Should planner reports
   include budget / cost
   status?** Memo default: yes,
   once the regression harness
   exists (§10 harness state
   determines cost visibility).
   Before that, cost stays
   qualitative.
5. **Should the planner check
   Vercel deployment status in
   the future?** Memo default:
   yes eventually — the planner
   should flag "last push
   deployed cleanly at
   <url> · Vercel returned 200
   on homepage" as part of §1.
   Deferred to 3f.
6. **Should the planner use
   production E2E status once
   the harness exists?** Memo
   default: yes but read-only.
   Never triggers a
   production-target regression
   run from the planner itself
   (per AgentOps-3a DECISION
   answer #2).
7. **When can Codex write
   directly to
   `.agent/tasks_draft/`?**
   Memo default: not until
   AgentOps-3c or 3d has
   shipped. In 3b's scope,
   Codex writes nothing except
   (optionally) its planner
   report file. This preserves
   AgentOps-3a DECISION
   answer #9.
8. **What is the maximum
   number of candidate tasks
   per planner report?**
   Memo default: 2-4. Fewer
   than 2 gives the reader no
   comparison; more than 4
   inflates review time.
9. **Should the planner
   report be in English or
   Chinese?** Memo default:
   English for the schema
   headers (aligns with
   `.agent/templates/*`),
   with narrative in the
   language Bohao prefers
   day-to-day. Fits the
   memory rule "respond in
   中文 by default; English
   OK for code identifiers,
   technical terms, and
   existing artifact
   contents".
10. **Should ChatGPT be
    considered the final
    reviewer of the planner
    report?** Memo default:
    yes for content, no for
    approval (Bohao remains
    the approver). ChatGPT
    can request changes,
    sharpen the recommendation,
    or propose a different
    candidate; Bohao decides.

## 17. Recommendation

**Approve Codex read-only
planner as the next
automation layer.** Start
manual-only per AgentOps-3a
DECISION answer #1. In 3b,
**do not implement the
planner** — this memo is
scope-and-approve for the
spec; a future TASK opens
the first Codex-authored
planner report against this
spec.

Next concrete recommended
loop after 3b: **AgentOps-3c
· benchmark resume fixtures**
(green, 5 synthetic Markdown
personas + README under
`.agent/regression_fixtures/`).
That work is independent of
Codex activation and can
proceed while Bohao +
ChatGPT decide the §16
open decisions here.

Then, in order: **AgentOps-3d
· report regression harness
design memo** (yellow,
memo-only) → **AgentOps-3e ·
minimal local Playwright
regression prototype**
(yellow, one fixture) →
**AgentOps-3f · integrate
regression result into
RUN_REPORT template + daily
digest**.

**Do NOT enable
auto-execution.** Codex
proposes; humans approve;
Claude executes.

**Do NOT enable auto-push.**
Every push remains a
Bohao-gated action.

**Do NOT edit
`.agent/scripts/**` yet.**
The hard rule per
AgentOps-2c Q3-Q8 stays in
force until a separate
DECISION explicitly lifts
it.

**Explicitly NOT the
default**: G2.1d (BLK-0001),
any OpenAI API introduction
(BLK-0003 Q7-blocked
senses), any automation
runner implementation
before AgentOps-3e settles,
any production-target
harness run, any bundle
swap, any prompt / model /
API-route change, any
sample-vs-real visual
audit (Candidate 5 remains
a soak-later decision).
