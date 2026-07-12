# RUN REPORT · AgentOps-3d report regression harness design memo

> Authored by Claude Code after executing the TASK. Forms the input for the
> next DECISION file.

## Metadata

- **run_id**: `2026-07-12_run_02`
- **task**:
  `.agent/tasks/2026-07-12_run_02_TASK.md`
- **design_memo**:
  `.agent/design_memos/2026-07-12_AgentOps-3d_report_regression_harness_design.md`
- **based_on_prior_decisions**:
  `.agent/decisions/2026-07-12_run_01_DECISION.md`
  (AgentOps-3c · endorsed 3d as
  default next code loop) ·
  `.agent/decisions/2026-07-11_run_01_DECISION.md`
  (AgentOps-3b · Codex planner spec
  + 10 answers) ·
  `.agent/decisions/2026-07-08_run_01_DECISION.md`
  (AgentOps-3a · phased rollout + 13
  answers).
- **repo**:
  `/Users/bohaoli/Desktop/ai-career-radar-web`
- **pipeline_repo** (read-only sanity):
  `/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`
- **implementation_commit**: `ac3b4cf`
- **status**: complete, awaiting DECISION
- **push_state**: NOT pushed; 1 web
  commit ahead of `origin/main` at
  impl-commit time → 2 after this
  RUN_REPORT commit lands.

## Objective (from TASK)

Design — without implementing — the
**report regression harness** that
will automate real AI Career Radar
report generation + evaluation. Pin
how AgentOps-3c fixtures A-E are
consumed, Playwright CLI vs MCP
recommendation, local-first target
strategy, artifact storage, baseline
policy, structural + rubric +
operational checks, verdict algorithm,
thresholds / budgets, nondeterminism
handling, integration with future
Codex planner + Claude Code executor.

## Files changed

| file | change |
|---|---|
| `.agent/tasks/2026-07-12_run_02_TASK.md` | **new** — TASK spec |
| **`.agent/design_memos/2026-07-12_AgentOps-3d_report_regression_harness_design.md`** | **new · 1420 lines · 23 H2** (22 required + `Status`) |
| `.agent/run_reports/2026-07-12_run_02_RUN_REPORT.md` | new (this file) |

Total scope: **3 `.agent/` files**.
No `src/**`, `src/data/**`, prompts,
API routes, pipeline,
`.github/workflows/**`,
`.agent/scripts/**`,
`.agent/policies/**`,
`.agent/templates/**`,
`.agent/blockers.md`,
`.agent/automation_queue.md`,
`.agent/regression_fixtures/**`,
`.agent/planner_reports/**`,
`.agent/regression_runs/**`,
harness code, runner code, or
runtime change.

## Summary of regression harness design

- **Quality gate for future
  automated development.** Not a
  general test suite. Prevents
  Codex-proposed + Claude-
  executed changes from silently
  degrading the report generator.
- **Fixture-based, synthetic-
  only, local-first, deterministic-
  inputs / nondeterministic-
  outputs.** 10 design principles
  pinned in §3.
- **v1 prototype uses one
  fixture** (Fixture A default) —
  per AgentOps-3a DECISION answer
  #4. Expands to A-E only after
  3f integration.
- **Playwright CLI**, not MCP,
  for v1.
- **Local target only** (Stage 1
  `http://localhost:3000`) until
  a per-run DECISION says
  otherwise.
- **18-step future harness flow**
  from preflight through
  verdict + artifact summary +
  stop.
- **Baseline promotion through
  TASK + RUN_REPORT + DECISION
  only.** No auto-promotion. No
  naive text diff.
- **v1 checks** in 3 buckets
  (structural / fixture-specific
  / operational).
- **Three-tier verdict**:
  green / amber / red with
  concrete criteria (§12).
- **v1 budgets**: $25/month
  cap, $0.25 per-run hard cap,
  120s soft / 240s hard
  latency.
- **Codex planner
  integration** per AgentOps-
  3b §10 5-state model.
- **Claude Code integration**:
  runs harness only when
  explicitly instructed; writes
  verdict into RUN_REPORT;
  never auto-pushes; never
  promotes baseline.

## Playwright CLI vs MCP recommendation

**v1 uses Playwright CLI.**

Rationale (§5.3):

- **Reproducibility > interactivity**
  for a regression gate.
- **Zero new dependency** —
  Playwright is already a
  devDependency (used in
  `npm run screenshot` +
  2026-07-08 E2E smoke test).
- **Zero new configuration burden.**
- **Matches** the shape of the
  E2E smoke test that already
  worked.
- **MCP** is a real option for
  interactive debugging of a
  failing run — but that's a
  post-verdict human tool, not
  the primary gate.

## Local vs production strategy

Three stages, sequential per
DECISION:

- **Stage 1 · Local dev** (v1
  default). Target
  `http://localhost:3000`. No
  production calls.
- **Stage 2 · Local preview
  build** (future optional).
- **Stage 3 · Production
  smoke** (never automatic;
  every prod run is a separate
  DECISION per AgentOps-3a
  answer #2).

## Fixture usage A-E

- **A** senior backend →
  Applied AI (medium; RAG +
  eval + prompt debugging
  gaps).
- **B** full-stack → AI
  Product (medium; agent +
  tool calling + eval
  gaps).
- **C** data eng → LLM Infra
  (medium-hard; serving +
  retrieval + eval infra
  gaps).
- **D** ML-adjacent → Agent
  Engineer (medium;
  stateful orchestration +
  tool schemas + evals).
- **E** enterprise SWE → AI
  transition (hard;
  foundational AI stack
  gaps).

v1 prototype uses **one
fixture** (Fixture A
default). Expands to A-E in
later phases. Fixture bodies
are **read-only during a
run**; edits ship through
AgentOps-3c-style loops per
README §6.

## Artifact storage proposal

Directory layout (target,
not created by this
loop):

- `.agent/regression_runs/YYYY-MM-DDTHHMMSS_fixture-<id>/`
  - `report.md` — verbatim
    streamed markdown
  - `report.png` —
    full-page screenshot
  - `metadata.json` —
    timestamp / SHA /
    duration / cost / etc.
  - `structural_checks.json`
    — pass/fail per §10.1
  - `rubric.md` — human-
    readable rubric
  - `verdict.md` — final
    green/amber/red +
    reasoning

**Commit policy**: v1
commits only
**`verdict.md` +
`metadata.json`** (small,
auditable, useful in
planner references). Large
artifacts stay local
scratchpad. Retention
policy is a §21 open
decision.

## Baseline policy

- **Last-known-good**
  regression run per
  fixture.
- **NOT** an exact-text
  baseline (LLM
  nondeterminism).
- **Structural + rubric
  signals** are the
  compared quantities.
- **Baseline promotion
  through TASK +
  RUN_REPORT +
  DECISION only**. No
  auto-promotion. No
  "green = new baseline"
  shortcut.
- **First baseline**
  created by supervised
  run in 3e with explicit
  human sign-off.

## v1 checks

Three buckets:

### Structural (§10.1)

- Report reaches `done`
  within budget
- No incomplete banner
  (Candidate 1
  sentinel)
- Non-empty body
- 5 expected H2 section
  headers in order
- Top 5 gaps with ≥5
  numbered items
- Highest-leverage
  next action ends with
  "Reassess in ..."
- Evidence Appendix
  with ≥1 cited JD
- ≥1 evidence quote
  per gap
- Length in soft band
- No empty sections
- Action bar buttons
  present
- No visible error
  message

### Fixture-specific (§10.2)

- ≥2 Expected strengths
  reflected
- ≥2 Expected gaps
  reflected
- **Zero** Must-not-
  happen items matched
- Recommended action
  roughly matches
  Expected high-leverage
  next action

### Operational (§10.3)

- Latency below soft +
  hard thresholds
- Cost below per-run
  cap
- No network / runtime
  errors
- No fatal console
  errors
- No unexpected
  navigation

## Deferred checks

Documented with reasons in
§11:

- Quote substring
  integrity (Candidate 2
  scope)
- Multi-judge semantic
  eval (cost — deferred
  per AgentOps-3b answer
  #11)
- Exact baseline
  semantic diff (needs
  rubric agent)
- Trend awareness (needs
  time series)
- Deep hallucination
  detection (semantic
  layer)
- Production scheduled
  runs (never
  auto-triggered)
- Cross-browser (Firefox
  / WebKit)
- Mobile viewport
- Full A-E gating from
  day one

## Verdict algorithm

Three-tier (§12):

- **Green**: all
  structural pass + no
  incomplete banner +
  zero must-not-happen +
  cost/latency in budget
  + no major regression
  vs baseline.
- **Amber**: minor
  section drift OR weak
  recommendation OR
  missing one expected
  strength/gap OR
  length outside soft
  band OR eval
  inconclusive OR
  cost/latency slightly
  high OR baseline
  uncertain (but no red
  trigger).
- **Red**: generation
  fails OR incomplete
  banner OR missing
  core section OR empty
  report OR no Evidence
  Appendix OR must-not-
  happen matched OR
  major regression vs
  baseline OR cost
  spike above hard cap
  OR forbidden repo
  diff during run.

## Thresholds and budgets

Proposed v1 numbers,
tunable through future
DECISION:

- **1 fixture in v1**
  (Fixture A default).
- **Max 1 real
  generation per
  prototype run.**
- **Monthly budget**:
  **$25** (AgentOps-3a
  answer #3
  reconfirmed).
- **Per-run cost cap**:
  **$0.25**.
- **Latency**: **120s
  soft / 240s hard**.
- **Report length soft
  band**: 1500-6000
  chars.
- **Report length hard
  band**: 500-15000
  chars.
- **No 3-judge eval in
  v1** (AgentOps-3b
  answer #11).
- **Chromium only in
  v1**; **headless in
  automation**
  (AgentOps-3b answer
  #12).

## Nondeterminism handling

- **No exact-text
  baseline diff.**
- **Stable inputs +
  structural + rubric +
  baseline signals** are
  the compared
  quantities.
- **Metadata capture**
  (model, corpus
  snapshot, commit SHA,
  fixture version) so
  drifts correlate with
  changes.
- **Large unexplained
  changes = amber
  until reviewed** (fail
  toward review, not
  toward silent
  approval).
- **Multiple runs per
  fixture** deferred to
  v-later if cost
  allows.

## Integration with Codex planner

Per AgentOps-3b §10
5-state mapping:

- **A. Unavailable
  (current)** → mark
  "unavailable; not
  auto-verifiable".
- **B. Not required**
  → task class doesn't
  touch generated-
  report quality.
- **C. Green +
  required** → mark
  "required; last
  verdict green; run
  before push".
- **D. Amber last
  verdict** → escalate;
  do NOT auto-recommend
  proceeding.
- **E. Red last
  verdict** → recommend
  fix / revert, never
  new-feature work.

Codex must **not** run
harness in v1.

## Integration with Claude Code

- Runs harness only
  when explicitly
  instructed.
- Writes RUN_REPORT
  with `## Regression
  verdict` section.
- Stops at RUN_REPORT
  / DECISION depending
  on prompt.
- Never auto-pushes
  after green verdict.
- Never promotes
  baseline without
  human approval.
- Does not change
  fixtures without a
  separate loop.

## Open decisions

Memo §21 lists **14
concrete yes/no
questions** with memo
defaults for Bohao +
ChatGPT to pin before
3e opens. Above the ≥12
required in the TASK.

Key defaults:
- Playwright CLI (not
  MCP)
- Verdict + metadata
  in-repo; large
  artifacts scratchpad
- `report.md`
  local-only in v1
- Human promotes
  baseline
- Fixture A first
- $0.25 per-run cap
- 120s / 240s
  latency
- No Eval click in
  v1
- Screenshot required
  in v1
- Harness runs on
  report-affecting
  tasks only
- Codex reads
  regression before
  recommending next
  task
- No automated
  production tests
- Keep last 30 runs
  in scratchpad
- Fail on unknown
  fixture version

## Validation

### Memo structural check

```
$ wc -l .agent/design_memos/2026-07-12_AgentOps-3d_report_regression_harness_design.md
    1420
$ grep -c "^## " .agent/design_memos/2026-07-12_AgentOps-3d_report_regression_harness_design.md
23
```

- 1420 lines (well-scoped
  for a memo covering 22
  sections + `Status`
  header).
- 23 H2 = 22 required + 1
  `Status`. All 22
  required sections
  present in order.

### Diff audit

```
$ git status  (before RUN_REPORT commit)
Changes not staged for commit: (none)
Untracked files: (none — impl commit ac3b4cf
already landed)

$ git diff --name-only origin/main..HEAD
.agent/design_memos/2026-07-12_AgentOps-3d_report_regression_harness_design.md
.agent/tasks/2026-07-12_run_02_TASK.md

# after this RUN_REPORT commit:
+ .agent/run_reports/2026-07-12_run_02_RUN_REPORT.md
```

Total AgentOps-3d scope
after RUN_REPORT commit
= **3 `.agent/` files**.

## Forbidden-file audit

| bucket | status |
|---|---|
| `src/**` (any file) | ✓ CLEAN |
| `src/data/**` | ✓ CLEAN |
| `src/lib/**` | ✓ CLEAN |
| `src/app/api/**` | ✓ CLEAN |
| **`.agent/scripts/**` (hard rule)** | ✓ CLEAN |
| `.agent/policies/**` | ✓ CLEAN |
| `.agent/templates/**` | ✓ CLEAN |
| `.agent/blockers.md` | ✓ CLEAN |
| `.agent/automation_queue.md` | ✓ CLEAN |
| **`.agent/regression_fixtures/**` (frozen)** | ✓ CLEAN |
| **`.agent/planner_reports/**` (still empty)** | ✓ CLEAN |
| **`.agent/regression_runs/**` (not created)** | ✓ CLEAN |
| `.github/workflows/**` | ✓ CLEAN |
| `package.json` | ✓ CLEAN |
| `package-lock.json` | ✓ CLEAN |
| `.env*` | ✓ CLEAN |
| `vercel.json` / `.vercel/**` | ✓ CLEAN |
| Codex / Claude config | ✓ CLEAN |
| **Pipeline repo any file** | ✓ CLEAN (HEAD `b019786` at start AND end) |
| Pipeline `sources.yaml` | ✓ CLEAN |
| Pipeline `corpus/**` | ✓ CLEAN |
| Pipeline `scripts/collector/**` | ✓ CLEAN |
| Pipeline `.github/workflows/**` | ✓ CLEAN |

## Confirmation — no runtime work

- **No implementation**.
  Memo is spec-only.
- **No Playwright run** —
  no `npm run
  screenshot`, no `npx
  playwright`, no
  `page.goto`.
- **No report
  generation** — no
  `curl`, no `fetch`
  against
  `/api/generate-report`.
- **No LLM / API calls**
  — no `anthropic` /
  `openai` HTTP
  invocation by this
  task.
- **No baseline
  artifacts** created.
- **No screenshots**
  produced.
- **`.agent/regression_runs/`
  NOT created**.
- **No `.agent/scripts/**`
  change**.
- **No `src/**` change**.
- **No pipeline
  change**.
- **No collector
  run**.
- **No new npm
  dependency**.
- **No `.github/workflows/**`
  edit**.
- **No `package.json` /
  lockfile edit**.
- **No `.env*` /
  `vercel.json` /
  `.vercel/**`
  change**.
- **No manual `vercel
  deploy`**.
- **No push**.
- **No blocker
  resolved**. BLK-0001
  / BLK-0002 /
  BLK-0003 all still
  `open`.

## Acceptance criteria — all 34 items PASS

- [x] Memo file exists at
      required path. ✓
- [x] Memo contains all 22
      required sections
      in order. ✓ (23 H2 =
      22 required +
      `Status`)
- [x] §4 explains fixture
      usage A-E + v1
      one-fixture rule. ✓
- [x] §5 recommends
      Playwright CLI for
      v1. ✓
- [x] §6 defines 3 target
      stages. ✓
- [x] §7 lists 18-step
      harness flow. ✓
- [x] §8 pins
      regression_runs
      layout +
      commit-vs-local
      policy. ✓
- [x] §9 pins baseline
      promotion through
      DECISION. ✓
- [x] §10 lists v1
      checks in 3
      buckets. ✓
- [x] §11 lists deferred
      checks with
      reasons. ✓
- [x] §12 defines
      green/amber/red
      criteria. ✓
- [x] §13 pins
      thresholds. ✓
- [x] §14 explains
      nondeterminism
      strategy. ✓
- [x] §15 5-state Codex
      integration. ✓
- [x] §16 Claude Code
      integration. ✓
- [x] §17 required /
      optional / not-
      sufficient buckets. ✓
- [x] §18 failure
      handling. ✓
- [x] §19 security +
      privacy. ✓
- [x] §20 3e/3f/later
      roadmap. ✓
- [x] §21 lists ≥12
      open decisions
      (14 total). ✓
- [x] §22 single
      recommendation
      (approve + next =
      3e). ✓
- [x] Memo does NOT
      recommend lifting
      any blockers. ✓
- [x] Memo does NOT
      recommend OpenAI
      API. ✓
- [x] Memo does NOT
      recommend
      `.agent/scripts/**`
      edits. ✓
- [x] Memo does NOT
      recommend G2.1d. ✓
- [x] Memo does NOT
      create standalone
      regression run
      artifact. ✓
- [x] No `src/**` files
      modified. ✓
- [x] No `src/data/**`
      files modified. ✓
- [x] No prompt / API /
      model files
      modified. ✓
- [x] No pipeline repo
      modification. ✓
- [x] No collector
      invocation. ✓
- [x] **No Playwright
      run.** ✓
- [x] **No report
      generation.** ✓
- [x] **No LLM /
      API call.** ✓
- [x] No baseline
      artifact created. ✓
- [x] No screenshot
      created. ✓
- [x] No
      `.agent/regression_runs/`
      created. ✓
- [x] No
      `.agent/scripts/**`
      diff. ✓
- [x] No push, no
      manual deploy. ✓

## Blockers touched: none

- **BLK-0001** — still
  `open`.
- **BLK-0002** — still
  `open`.
- **BLK-0003** — still
  `open`.
- QUEUE-0002 (G2.1d) —
  still
  `blocked_pending_human`.

## Automation window activity

`none`. Automation-infra
paused per AgentOps-2c
Q10.

## Repo status

### Web

```
$ git log --oneline -6
ac3b4cf Add AgentOps-3d regression harness design   ← this loop (impl)
685769c Update daily summary for AgentOps-3c
b284831 Add DECISION 2026-07-12_run_01
e34ca4c Add RUN_REPORT 2026-07-12_run_01
bef155e Add benchmark resume fixtures
63e8979 Update daily summary for AgentOps-3b
```

Web ahead of `origin/main`
by **1 commit** at impl-
commit time. After this
RUN_REPORT commit lands
the branch will be ahead
by **2 commits**.

### Pipeline

```
$ git status
On branch main · up to date with 'origin/main' · clean

$ git log --oneline -3
b019786 Add G2.1 taxonomy eval set
f833bfd Add G2.1 taxonomy spec
65c3f9b Daily automated collection · 2026-06-28
```

Pipeline **untouched**.
HEAD = `b019786` at run
start AND end.

## Recommendation

**Human + ChatGPT review**
this RUN_REPORT + the
1420-line memo → then
write DECISION via
`python .agent/scripts/new_decision.py
--task-id 2026-07-12_run_02`.

Suggested DECISION verdict
shape: `approve`,
`human_approval_needed:
yes` (for the eventual
push; user-visibly a
no-op — `.agent/`-only,
same class as P2.0a,
P2.1a, AgentOps-2b/2c/
3a/3b/3c memos).

Approving this DECISION:

- Records the AgentOps-3d
  memo as a
  `reviewed_approved`
  design + spec for the
  report regression
  harness.
- Endorses **Playwright
  CLI for v1** (not
  MCP).
- Endorses **local-first
  target strategy**
  (Stage 1 only in v1).
- Endorses **one-
  fixture v1 prototype**
  (Fixture A default).
- Endorses the 3-bucket
  v1 checks and the
  three-tier verdict
  algorithm.
- Records the 14 §21
  open-decision defaults
  so future TASKs can
  cite them.
- Endorses **AgentOps-
  3e · minimal local
  Playwright regression
  prototype** as the
  natural next code
  loop.
- Records the boundary:
  "3e must remain a
  separate loop, not
  bundled with 3d
  push".

Approving does NOT
approve: (a) starting
AgentOps-3e yet, (b)
implementing the
harness in any form,
(c) creating
`.agent/regression_runs/`
directly, (d) any
production target, (e)
any Playwright MCP,
(f) any baseline
promotion, (g) any
prompt / model /
API-route change, (h)
any
`.agent/scripts/**`
mod, (i) any OpenAI
API usage in
Q7-blocked senses,
(j) G2.1d, (k)
lifting any of the 3
open blockers, (l)
bundling 3e + 3f into
one loop.
