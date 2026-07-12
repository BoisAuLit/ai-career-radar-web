# AgentOps-3d · Report Regression Harness Design

> Design-only memo. No harness code. No Playwright
> run. No report generation. No baseline
> artifact. No `.agent/regression_runs/`
> directory. No `.agent/scripts/**` edit.
> Successor to AgentOps-3c
> (`.agent/design_memos/`-adjacent — fixtures
> under `.agent/regression_fixtures/`).
> Task: `.agent/tasks/2026-07-12_run_02_TASK.md`.

## Status

- **Type**: design memo
- **Version**: draft_for_human_chatgpt_review
- **Scope**: `.agent/`-only. No `src/**`,
  `src/data/**`, prompts, API routes,
  pipeline, `.github/workflows/**`,
  `.agent/scripts/**`, `.agent/policies/**`,
  `.agent/templates/**`, `.agent/blockers.md`,
  `.agent/automation_queue.md`,
  `.agent/regression_fixtures/**`,
  `.agent/planner_reports/**`,
  `.agent/regression_runs/**`, benchmark,
  harness, or runner code change.
- **Depends on**: AgentOps-3a phased rollout,
  AgentOps-3b Codex planner spec,
  AgentOps-3c fixtures A-E, Candidate 1
  stream sentinel, Candidate 4 empty-PDF
  gate, 2026-07-08 E2E smoke test.
- **Standing blockers**: BLK-0001 ·
  BLK-0002 · BLK-0003 all remain `open`.
  Q10 pause on AgentOps-2 runner
  implementation continues.

## 1. Purpose

Bohao's automation vision extends beyond
"more code, faster." He wants
**automation that also checks whether the
report the product exists to deliver
is getting better or worse.** Codex-
proposed and Claude-executed changes
must ship through a **quality gate**
that generates real reports, inspects
them, and refuses to greenlight a push
when the report has silently regressed.

The report regression harness is that
gate. It is:

- **A quality gate** for future automated
  development — not a general test suite.
- A tool that **reduces human review
  burden** while **preventing AI agents
  from drifting** the report generator
  in ways structural tests miss.
- **Fixture-based** — inputs are the 5
  synthetic personas from AgentOps-3c,
  never real users, never PII.
- **Local-first** — Stage 1 targets
  `http://localhost:3000`; production
  never runs without explicit per-run
  human approval.
- **Not implemented in this task.** 3d
  pins the design; 3e prototypes one
  fixture; 3f integrates the verdict
  into the RUN_REPORT / daily digest.

Design intent underneath all of this:
**make report-quality drift visible.**
Same principle behind Candidate 1
(transport-level sentinel) and
Candidate 4 (client-side gate). The
harness makes report drift equally
inspectable.

## 2. Current state

- ✅ **Candidate 1** stream sentinel
  implemented + E2E validated
  (2026-07-07/-08).
- ✅ **Candidate 4** empty-PDF gate
  implemented + E2E validated
  (2026-07-07/-08).
- ✅ **AgentOps-3a** automation
  advancement memo complete (2026-07-08
  DECISION `7a1bdfd`).
- ✅ **AgentOps-3b** Codex read-only
  planner spec complete (2026-07-11
  DECISION `4b99181`).
- ✅ **AgentOps-3c** benchmark fixtures
  A-E complete (2026-07-12 DECISION
  `b284831`).
- ⏸ **No harness exists yet.**
- ⏸ **No baseline reports exist yet.**
  Nothing has generated a report
  against any fixture inside a
  harness.
- ⏸ **No planner implementation
  exists yet.** AgentOps-3b is
  spec-only.
- ⛔ **Automation-infra remains
  paused** per AgentOps-2c Q10.
- ⛔ **BLK-0001 / BLK-0002 /
  BLK-0003 remain `open`**. G2.1d
  blocked. Full automation
  activation blocked. OpenAI API
  in Q7-blocked senses blocked.
- ⛔ **`.agent/scripts/**` hard
  rule** per AgentOps-2c Q3-Q8
  remains in force.

## 3. Design principles

Ten pinned principles the harness
must honor from v1 through v-later.

- **Local-first.** Prototype +
  first year run against
  `http://localhost:3000`. No
  production target until an
  explicit per-run DECISION says
  so.
- **Fixture-based.** Every run
  reads inputs from
  `.agent/regression_fixtures/`.
  Nothing is generated on the fly.
- **Synthetic-only.** Never
  ingests a real user's résumé.
  Privacy boundary is
  non-negotiable.
- **Deterministic inputs,
  nondeterministic outputs.**
  Same fixture in; different
  bytes out; that's OK; the
  harness handles it (§14).
- **Structural checks before
  semantic judging.** Cheap
  string / heading / length
  assertions run first; expensive
  rubric checks run only after
  cheap ones pass.
- **Low cost first.** $25/month
  budget cap; $0.25 per-run
  hard cap; 1 fixture in v1.
- **No production target without
  explicit approval.** Even
  after harness is stable,
  every prod run is a separate
  DECISION.
- **No auto-push.** Verdict
  gates push approval; verdict
  never *causes* a push.
- **No auto-deploy.** Vercel
  auto-deploys on push; the
  harness never triggers a
  Vercel deploy directly.
- **Green / amber / red
  verdicts.** Same vocabulary as
  AgentOps-3a §8, AgentOps-3b
  §10. No hidden middle-state.
- **Artifact discipline.**
  Commit only summaries; keep
  large binaries out of the
  repo (§8).
- **Human + ChatGPT remain
  final review layer.** Green
  makes push *eligible*; only
  humans make it *happen*.

## 4. Fixture usage

The AgentOps-3c fixture suite lives at
`.agent/regression_fixtures/`:

- **A** — senior backend SWE →
  Applied AI Engineer. Tests
  production/backend foundation vs
  RAG/eval/prompt-debugging gaps.
  Difficulty **medium**.
- **B** — full-stack product
  engineer → AI Product Engineer.
  Tests product/UX/shipping
  strength vs
  agent/tool-calling/eval/
  reliability gaps. Difficulty
  **medium**.
- **C** — data engineer → LLM
  Infrastructure Engineer. Tests
  data-pipeline strength vs
  serving / embeddings /
  retrieval / model-gateway /
  eval-platform gaps. Difficulty
  **medium-hard**.
- **D** — ML-adjacent SWE →
  Agent Engineer. Tests ML
  tooling / Python strength vs
  stateful-agent / tool-schema /
  eval gaps. Difficulty
  **medium**.
- **E** — traditional enterprise
  SWE → AI transition. Tests
  fair-but-clear handling of
  strong non-AI SWE + staged
  transition recommendation.
  Difficulty **hard**.

### v1 fixture usage rules

- **Prototype (3e) starts with ONE
  fixture only** — per AgentOps-3a
  DECISION answer #4. Default
  choice: **Fixture A** (medium
  difficulty; senior backend →
  Applied AI matches the target
  hero copy). 3e's TASK may
  choose differently but must
  justify.
- **Expands to A-E** after 3e
  stabilizes and 3f integrates
  verdict into RUN_REPORT.
- **Fixtures are inputs**: `##
  Resume input` pasted into the
  résumé `<textarea>` (id
  `#resume`); `## Target role
  input` pasted into the
  target-role `<textarea>`
  (Playwright locator on the
  placeholder-based selector).
- **`## Expected strengths`,
  `## Expected gaps`, `## Must
  not happen`, `## Regression
  notes`, `## Expected high-
  leverage next action` are
  **evaluation-side inputs** —
  the harness uses them to
  compute the rubric verdict, not
  as UI inputs.
- **Fixtures are read-only
  during a harness run.** No
  mutation. Fixture edits ship
  through AgentOps-3c-style
  loops per README §6.

## 5. Playwright CLI vs Playwright MCP

Two candidate execution channels for
harness runs.

### 5.1 Playwright CLI / test script

- Node script driving a headless
  Chromium session. Same shape as
  the 2026-07-08 E2E smoke test
  and `npm run screenshot`.
- **Reliability**: high —
  deterministic across runs given
  the same inputs. Playwright
  installs a pinned Chromium.
- **Reproducibility**: high —
  same script + same fixture
  yields same DOM interactions.
- **CI / local fit**: excellent
  for local; equally clean if we
  later add CI (out of scope).
- **Artifact capture**: strong
  primitives (`page.screenshot`,
  `.innerText`, `.pdf`, network
  logs).
- **Agent control**: none by
  design — the script is what
  runs.
- **Debugging**: `headed: true`
  + `slowMo` + traces.
- **Risk of autonomous
  browsing**: none — script is
  deterministic.
- **Integration with Claude
  Code**: high — Claude runs
  the script via `npm run
  <script-name>`.
- **Cost / complexity**: low —
  Playwright is already a
  devDependency (`package.json`).
  Zero new dependency.

### 5.2 Playwright MCP server

- Model Context Protocol server
  exposes Playwright to LLMs.
  Codex or Claude can *drive*
  the browser interactively.
- **Reliability**: variable
  — depends on the LLM's
  moment-to-moment reasoning.
- **Reproducibility**: lower
  — same fixture, different
  browsing path is possible.
- **CI / local fit**: local
  mainly.
- **Artifact capture**: strong,
  but agent decides what to
  capture.
- **Agent control**: high
  — this is the point.
- **Debugging**: good for
  ad-hoc; harder to bisect a
  regression.
- **Risk of autonomous
  browsing**: real — an LLM
  driver could visit
  arbitrary pages, get
  distracted, or click
  something unexpected.
- **Integration with Claude
  Code**: possible; needs
  MCP configuration Bohao
  currently does not maintain.
- **Cost / complexity**:
  medium-high — new
  configuration + LLM-time
  cost per run.

### 5.3 Recommendation

**v1 uses Playwright CLI**, not MCP.
Rationale:

- Reproducibility >
  interactivity for a regression
  gate. Regression tests must be
  deterministic to be useful.
- Zero new dependency (Playwright
  already in `devDependencies`).
- Zero new configuration burden.
- Matches the shape of the
  2026-07-08 E2E smoke test that
  already worked.
- MCP is a real option for
  **interactive debugging** of a
  failing run — but that's a
  post-verdict human tool, not
  the primary gate.
- **This TASK must not implement
  either channel.** The
  recommendation lives in the
  memo; the 3e TASK opens the
  first prototype.

## 6. Target environment strategy

Three explicitly-named stages.
Progression through stages is a
separate DECISION per stage; no
auto-promotion.

### Stage 1 · Local dev (v1 default)

- Bohao runs `npm run dev` manually
  (or a future supervised script).
- Harness targets
  `http://localhost:3000`.
- No production calls. No prod
  data.
- Every 3e / 3f run stays here
  until explicitly promoted.

### Stage 2 · Local preview build (future)

- Optional: `next build && next
  start` locally to catch
  build-vs-dev drift.
- Runs against the built bundle
  before deciding whether
  local-dev green implies
  local-prod green.
- Never contacted from CI in the
  default plan.

### Stage 3 · Production smoke (only with per-run explicit approval)

- Targets the live URL.
- Requires explicit per-run
  DECISION per AgentOps-3a
  DECISION answer #2.
- Read-only Vercel deploy status
  MAY be checked (per AgentOps-
  3b DECISION answer #6).
- **Never** auto-triggers a
  production regression run.
- **Never** batches multiple
  fixtures against production
  without individual approval.

## 7. Future harness flow

Eighteen sequential steps a harness
run executes. The 3e prototype
implements a subset (§20); §7 pins
the target shape.

1. **Preflight clean repo**: `git
   status` must be clean on the
   web repo. If dirty, abort with
   an incident note.
2. **Confirm allowed target
   environment**: verify Stage 1
   / 2 / 3 selection matches an
   approved DECISION.
3. **Start or connect to local
   app**: assume `npm run dev`
   is already running (Bohao's
   supervised session); or, in
   later phases, start it as a
   subprocess with explicit
   cleanup on exit.
4. **Load fixture**: read one
   fixture file from
   `.agent/regression_fixtures/`,
   parse the `## Resume input`
   and `## Target role input`
   sections, and the evaluation-
   side sections.
5. **Fill résumé**: paste the
   parsed résumé text into the
   `#resume` textarea via
   Playwright locator.
6. **Fill target role**: paste
   the target text into the
   target textarea (locator
   pattern matches the
   E2E smoke test).
7. **Generate report**: click
   the Generate button
   (`page.getByRole("button", {
   name: /Generate.*report/i })`).
8. **Wait for done state**:
   wait until the Copy button
   appears in the report card
   action bar (matches 2026-07-
   08 E2E pattern).
9. **Detect incomplete
   banner**: check whether the
   Candidate 1 amber banner
   `"may be incomplete"` is
   visible. If yes → immediate
   RED verdict.
10. **Capture markdown
    report**: grab the raw
    streamed markdown from the
    client's `report` state
    (or read the DOM's
    `<ReactMarkdown>` container
    innerText as a fallback).
11. **Capture screenshot**:
    full-page
    `page.screenshot({ fullPage:
    true })` to
    `report.png`.
12. **Capture metadata**:
    timestamp, commit SHA
    (from `git rev-parse
    HEAD`), fixture id,
    corpus snapshot date
    (from `WEB_BUNDLE_STATS`),
    generation duration in
    milliseconds.
13. **Optionally click Eval
    button**: v1 skips this
    (per AgentOps-3b DECISION
    answer #11 and to keep
    budget low); v-later may
    click it and capture the
    3-judge scores.
14. **Run structural checks**
    (§10 structural bucket).
15. **Run rubric checks**
    (§10 fixture-specific
    bucket).
16. **Compare to last-known-
    good baseline**: fetch
    the baseline artifact
    for the same fixture id;
    diff structural + rubric
    signals; classify as
    Green / Amber / Red per
    §12.
17. **Produce verdict**:
    write `verdict.md`
    containing green / amber
    / red + per-check
    reasoning.
18. **Write artifact
    summary + stop**: write
    lightweight summary to
    `.agent/regression_runs/<run-id>/`
    (per §8); NEVER push;
    NEVER deploy.

## 8. Artifact storage design

### 8.1 Directory layout (target)

`.agent/regression_runs/`
(new directory; not created by
this TASK; created by 3e / 3f as
authorized).

Per-run subdirectory:

`.agent/regression_runs/YYYY-MM-DDTHHMMSS_fixture-<id>/`

Contents inside each run
subdirectory:

- `report.md` — verbatim
  streamed markdown.
- `report.png` — full-page
  screenshot.
- `metadata.json` — timestamp,
  branch, commit SHA,
  duration_ms, n_chars,
  sections_detected,
  incomplete_banner_flag,
  action_bar_buttons_visible,
  cost_estimate_usd,
  corpus_snapshot,
  fixture_id, fixture_version.
- `structural_checks.json` —
  pass/fail per §10 structural
  check.
- `rubric.md` — human-readable
  rubric result vs fixture's
  Expected/Must-not-happen.
- `verdict.md` — green / amber
  / red + per-check reasoning.

### 8.2 Commit vs local-only

Per AgentOps-3a DECISION
answer #7 + AgentOps-3b
DECISION answer #7:

- **v1 commits only
  `verdict.md` +
  `metadata.json`** — small,
  auditable, useful in
  planner-report references.
- **`report.md`, `report.png`,
  `structural_checks.json`,
  `rubric.md` stay
  scratchpad / external**
  by default. Bohao can
  commit them per-run if he
  wants a specific
  snapshot preserved.
- **Never** commit
  screenshots that could
  reveal secrets (highly
  unlikely from a
  résumé fixture, but the
  rule stands).
- **Never** commit real
  user résumé content or
  private data.
- Full-artifact retention
  is a scratchpad or
  external-bucket decision
  scoped in 3f.

## 9. Baseline policy

### 9.1 What a baseline is

The **last-known-good** regression
run for a given fixture. Consists
of:

- The metadata JSON.
- The structural + rubric verdict.
- **Not** an exact-text baseline
  of the report body — that would
  break under LLM
  nondeterminism.

### 9.2 How baselines are promoted

- **First baseline**: created by
  a supervised run in 3e with
  explicit human sign-off. Only
  after the harness has produced
  a green verdict and Bohao +
  ChatGPT have reviewed the
  underlying report content.
- **Promotion**: subsequent
  baselines are promoted through
  **TASK + RUN_REPORT +
  DECISION** loops. No
  auto-promotion. No "green =
  new baseline" shortcut.
- **Rollback**: if a baseline is
  later found to have been
  based on a bad report, roll
  back through a DECISION-
  gated revert.
- **Semantic diff, not text
  diff**: baseline comparisons
  use structural + rubric
  signals, not naive text
  equality (§14).

## 10. Checks v1

Three buckets. All checks in a
bucket run in order.

### 10.1 Structural

- Report reaches
  `stage === "done"` within
  the latency budget (§13).
- **No incomplete banner**
  (`stage === "done" &&
  reportIncomplete === false`).
- Report body is non-empty
  (character count > 0 after
  trimming).
- All **5 expected H2
  section headers** appear in
  order per
  `src/lib/prompts.ts` (Target
  role / What you already have
  / Top 5 gaps / Over-
  prioritizing / Highest-
  leverage next action).
- **Top 5 gaps section**
  contains ≥5 numbered gap
  items.
- **Highest-leverage next
  action** contains
  `"Reassess in"` language.
- **Evidence Appendix**
  appears with ≥1 cited JD
  (jd_id + company + title).
- ≥1 evidence quote per gap
  (heuristic: blockquote
  styling / `"..."`
  patterns).
- Report length within a
  soft band (e.g.
  1500-6000 chars, tuned
  in 3e).
- No empty sections.
- Action bar buttons still
  present after
  generation: `📋 Copy`,
  `⬇️ Download`, `📊 Eval`,
  `↺ Start over`.
- No obvious error
  message on the report
  card.

### 10.2 Fixture-specific

- ≥2 of the fixture's
  `## Expected strengths`
  are reflected in the
  report body (heuristic
  string match on the
  strength's noun
  phrases).
- ≥2 of the fixture's
  `## Expected gaps` are
  reflected in the
  report body.
- **Zero** items from
  `## Must not happen`
  appear in the report
  body (case-insensitive
  substring; e.g. "learn
  Python" for a
  candidate who lists
  Python; "DeepMind uses
  JAX" for any fixture).
- The recommended
  high-leverage next
  action **roughly**
  matches the shape of
  the fixture's
  `## Expected high-
  leverage next action`
  (heuristic keywords;
  full semantic match
  is a future check).

### 10.3 Operational

- Latency below the soft
  threshold; below the
  hard threshold (§13).
- Cost below the per-run
  cap if measurable
  (§13).
- No network / runtime
  errors surfaced in the
  DOM.
- No fatal console
  errors captured by the
  Playwright console
  listener.
- No unexpected
  navigation events
  during the run.

## 11. Checks deferred

Explicitly deferred with reasons.

- **Quote substring
  integrity** — verify every
  quoted span appears
  verbatim in one of the 5
  supplied JD bodies. This
  is Candidate 2's scope
  (P2.1a §9 candidate 2)
  and folds into the
  harness later.
- **Multi-judge semantic
  eval** — running the
  Haiku 3-judge eval
  automatically per run
  doubles cost; deferred
  per AgentOps-3a DECISION
  answer #11.
- **Exact baseline
  semantic diff** — needs
  a rubric agent + prompt;
  scope for a later
  DECISION.
- **Trend awareness** —
  no time-series signal
  yet; needs multiple runs
  first.
- **Deep hallucination
  detection** — beyond the
  §10.2 must-not-happen
  substring; a v-later
  semantic layer.
- **Production scheduled
  runs** — never
  auto-triggered.
- **Cross-browser
  testing** — Chromium is
  fine for v1; Firefox /
  WebKit deferred until
  Chromium regressions
  are observed.
- **Mobile report
  regression** — screen-
  shot at multiple
  viewports is a v-
  later concern.
- **Full A-E gating from
  day one** — 3e uses one
  fixture; A-E is a
  post-3f expansion.

## 12. Verdict algorithm

Three-tier classification. Every
run terminates in exactly one
verdict.

### 12.1 Green

All of:

- Every structural check in §10.1
  passes.
- No incomplete banner.
- Zero must-not-happen items
  matched.
- Cost within budget; latency
  within soft threshold.
- No major regression vs the last-
  known-good baseline (baseline
  comparison passes: all
  structural buckets pass,
  fixture-specific bucket ≥
  baseline).

### 12.2 Amber

Any of (but no red trigger):

- Minor section wording drift
  (e.g. one strength/gap phrasing
  differs materially from
  baseline).
- Weak recommendation (§10.2
  high-leverage-action check
  soft-fails).
- Missing one expected strength
  or one expected gap.
- Report length outside the
  soft band but inside the
  hard band.
- Eval inconclusive if
  invoked (v-later).
- Cost / latency slightly high
  (< hard cap).
- Baseline comparison
  uncertain (e.g. baseline
  missing structural signal
  the current run has, or
  vice versa).

### 12.3 Red

Any of:

- Generation fails.
- Incomplete banner appears.
- Missing core section from
  the 5-section list.
- Empty report.
- No Evidence Appendix.
- Hallucinated unsupported
  claims obvious in the
  §10.2 must-not-happen
  check.
- ≥1 must-not-happen item
  matched.
- Major regression vs
  baseline (multiple
  structural or fixture-
  specific checks worse
  than baseline).
- Cost spike above hard cap.
- Forbidden repo diff (git
  status non-clean or
  unexpected file changed
  during the run).

## 13. Thresholds and budgets

Proposed v1 numbers, all
tunable through a future
DECISION.

- **1 fixture in v1
  prototype** (3e). Default
  Fixture A.
- **Max 1 real generation
  per prototype run** (3e
  scope; avoid batch runs).
- **Monthly automated
  regression budget**:
  **$25** (AgentOps-3a
  DECISION answer #3
  reconfirmed).
- **Hard per-run cost
  cap**: **$0.25** — 5×
  the Sonnet 4.6 baseline
  (~$0.05). Above this,
  abort with a red
  verdict + incident note.
- **Soft latency
  threshold**: **120s** —
  double the current
  60s cost/time strip.
- **Hard latency cap**:
  **240s** — beyond this,
  abort with red.
- **Report length soft
  band**: **1500-6000
  chars** — tuned in 3e
  based on first
  observations.
- **Report length hard
  band**: **500-15000
  chars**.
- **No 3-judge eval in
  v1** (per AgentOps-3b
  DECISION answer #11).
- **Chromium only in
  v1**.
- **Headless in
  automation** (per
  AgentOps-3b DECISION
  answer #12); headed only
  for on-demand
  debugging.

## 14. Nondeterminism handling

LLM outputs vary between
runs. The harness embraces
this rather than fighting
it.

- **No exact-text baseline
  diff.** Comparisons are
  structural + rubric,
  never `report.md ==
  baseline.md`.
- **Stable inputs +
  structural signals +
  rubric signals +
  baseline signals** are
  the compared quantities.
- **Metadata capture**:
  every run stores model
  name, model version,
  fixture id, fixture
  version, corpus snapshot
  date, commit SHA,
  duration_ms — so
  future analysis can
  correlate drifts with
  the change that
  introduced them.
- **Large unexplained
  changes** are treated
  as **amber until
  reviewed**. Better a
  false positive
  reviewed by a human
  than a silent
  regression.
- **Multiple runs per
  fixture** are a
  v-later feature; if
  cost allows, three
  runs and majority
  vote could smooth the
  signal. Not in v1.
- **Never** treat a
  single random-seed
  difference as a
  reason to fail.

## 15. Integration with Codex planner

Per AgentOps-3b §10 5 states,
Codex reads the latest verdict
summary when producing the
daily planner report. Verbatim
mapping:

- **A. Harness unavailable
  (current)** — Codex marks
  §11 of the planner report
  as "regression harness
  unavailable — this task's
  product-quality impact
  is not auto-verifiable".
- **B. Not required** — task
  class is `.agent`-only,
  docs, or non-report
  copy. No harness run
  needed.
- **C. Green last verdict +
  required by task class** —
  "required; last verdict
  green on <fixture>
  <baseline-sha>; run
  before push approval".
- **D. Amber last verdict**
  — escalate to §12
  human-decision list;
  Codex does NOT auto-
  recommend proceeding.
- **E. Red last verdict**
  — Codex MUST recommend
  a **fix or revert**
  task, never a new-
  feature task.

**Codex must not run the
harness itself in v1.** The
harness runs under Claude
Code (§16) or Bohao's
manual invocation.

## 16. Integration with Claude Code

- **Claude Code may run
  harness only when
  explicitly instructed.**
  Same shape as "start
  Candidate 1" / "start
  AgentOps-3c" messages
  Bohao already uses.
- **Claude Code writes
  RUN_REPORT** including
  the regression verdict
  as its own section
  (`## Regression
  verdict`).
- **Claude Code stops at
  RUN_REPORT / DECISION**
  depending on the
  prompt's stop
  instruction.
- **Claude Code never
  auto-pushes** after a
  green verdict — push
  approval remains a
  separate human step.
- **Claude Code never
  promotes baseline
  without human
  approval** — baseline
  promotion is a
  separate DECISION.
- **Claude Code does not
  change fixtures**
  without a separate
  loop (README §6 of
  the fixture
  directory).

## 17. When regression is required

Aligned with AgentOps-3a §8.

### 17.1 Required

- Prompt changes
  (`src/lib/prompts.ts` —
  red-zone; regression
  required in addition
  to human red-zone
  approval).
- Model changes (Sonnet
  generator or Haiku
  judge in
  `src/lib/eval-report.ts`).
- `generate-report`
  route changes.
- Report renderer
  changes (`src/app/page.tsx`
  markdown-render path,
  Candidate 1 sentinel
  logic).
- Corpus retrieval
  changes
  (`src/lib/corpus.ts`).
- Source / corpus
  promotion (any bundle
  swap).
- PDF / résumé input
  changes
  (`src/app/api/extract-pdf/**`
  or client-gate
  changes).
- Eval / report-
  quality changes
  (`src/lib/eval-report.ts`).

### 17.2 Optional

- `.agent`-only docs.
- Design memos.
- Daily summaries.
- Non-runtime docs.

### 17.3 Not sufficient alone for

- Red-zone changes —
  still need human red-
  zone approval on top
  of a green verdict.
- Legal / compliance
  data-source changes
  — separate review
  path.
- Production deployment
  decisions — Vercel
  auto-deploy is a
  reflection of push;
  regression verdict
  gates the push, not
  the deploy directly.

## 18. Failure handling

- **Red verdict blocks
  push.** Non-negotiable.
- **Amber verdict requires
  human + ChatGPT
  review** before push.
- **Dirty repo aborts**
  the harness run.
- **Forbidden diff
  aborts** — any file
  changed during a run
  outside the run
  directory triggers
  abort.
- **API cost spike
  aborts** — if the
  running total crosses
  the per-run hard cap,
  the run stops and
  writes an incident
  note.
- **Generation timeout
  aborts** — beyond the
  240s hard cap.
- **Missing artifact
  aborts** — if a
  required artifact
  (metadata.json,
  verdict.md) cannot
  be written, the run
  fails cleanly with
  an incident note.
- **Incident note
  written** to
  `.agent/incidents/YYYY-MM-DD_INCIDENT_<slug>.md`
  (new directory
  introduced by
  AgentOps-3a §11;
  first incident note
  ships with 3e or
  later — 3d does not
  create this
  directory).
- **Fix / revert
  recommended before
  new feature work**
  — matches Codex §15
  state E.

## 19. Security and privacy

- **Fixtures are
  synthetic** — no
  real user résumé
  content ever enters
  the harness (README
  §2 of the fixture
  directory; AgentOps-
  3c DECISION).
- **No private user
  résumé** ingested.
- **No secrets** in
  fixtures or
  captured artifacts.
- **No `.env`
  reading** — the
  harness does not
  parse `.env.local`;
  it assumes `npm run
  dev` inherits the
  Anthropic API key
  through the normal
  Next.js runtime.
- **No committing
  screenshots with
  secrets** — the
  screenshot pipeline
  reviews the DOM
  before saving.
- **No external
  job-board scraping**
  — the harness only
  drives
  `http://localhost:3000`.
- **No production
  automation** without
  a per-run explicit
  human DECISION (§6
  Stage 3).
- **No captured
  artifact ever
  contains a real
  person's
  identifier** — even
  incidentally in a
  URL query string.

## 20. Implementation roadmap after 3d

### 20.1 3e — Minimal local Playwright regression prototype

- **Yellow**.
- **One fixture only** (Fixture
  A default).
- **Manual run only** — Bohao
  invokes it.
- **No `.agent/scripts/**`
  edit** if the hard rule is
  still in force (the harness
  script lives under
  `scripts/` at the repo root,
  same convention as
  `scripts/screenshot.mjs` and
  `scripts/check-web-bundle-stats.mjs`).
- **Writes local scratch or
  `.agent/regression_runs/`**
  only if approved by the 3e
  DECISION. Default: local
  scratchpad; commit only
  `verdict.md` + `metadata.json`
  after human review.
- **No CI integration**.
- **Playwright CLI**, not MCP
  (§5).
- **Local target only** (§6
  Stage 1).
- **No baseline promotion in
  the first prototype** — the
  first green run informs but
  does not promote.

### 20.2 3f — Verdict into RUN_REPORT + planner reports

- **Green / yellow**.
- Update
  `.agent/templates/run_report_template.md`
  to include a `## Regression
  verdict` section (protocol
  change; always yellow per
  AgentOps-0 README).
- Update Codex planner report
  schema (AgentOps-3b §7)
  §11 to consume verdict
  summaries.
- **Still no auto-push.**

### 20.3 Later phases

- Expand harness to A-E.
- Add baseline promotion
  policy (formal DECISION-
  gated).
- Add **quote integrity
  check** (Candidate 2
  scope).
- Add **semantic rubric**
  (LLM judge with a fixed
  prompt; needs budget
  answer).
- **Consider** production
  smoke (§6 Stage 3).

## 21. Open decisions

At least 12 concrete yes/no
questions for Bohao + ChatGPT
to pin before 3e opens.

1. **Playwright CLI or MCP for
   v1?** Memo default: **CLI**.
2. **Where exactly should
   artifacts live?** Options:
   `.agent/regression_runs/`
   (in-repo), `temporary/`
   (scratchpad, gitignored),
   external bucket. Memo
   default: `verdict.md` +
   `metadata.json` in
   `.agent/regression_runs/`;
   large artifacts in
   scratchpad.
3. **Should generated
   `report.md` be committed
   or local-only in v1?**
   Memo default: **local-
   only in v1**; commit
   only if a specific
   run merits preservation.
4. **Who promotes
   baseline?** Memo
   default: **Human** via
   TASK + DECISION.
5. **What is the exact
   first fixture?** Memo
   default: **Fixture A**;
   3e TASK may override.
6. **What is the per-run
   budget?** Memo
   default: **$0.25**.
7. **What latency
   threshold is
   acceptable?** Memo
   default: **120s
   soft / 240s hard**.
8. **Should the Eval
   button be clicked in
   v1?** Memo default:
   **no** (cost doubles;
   AgentOps-3b answer
   #11).
9. **Should screenshot be
   required in v1?** Memo
   default: **yes**
   (cheap; captures a
   lot of context).
10. **Should the harness
    run before every push
    or only report-
    affecting tasks?**
    Memo default:
    **report-affecting
    only** (§17.1
    required list).
11. **Should Codex read
    regression results
    before recommending
    the next task?**
    Memo default:
    **yes** (§15
    5-state mapping).
12. **Should production
    ever be tested
    automatically?**
    Memo default: **no**
    — every prod run is
    a separate DECISION
    per AgentOps-3a
    answer #2.
13. **What is the
    initial retention
    policy for
    generated
    artifacts?** Memo
    default: keep the
    last 30 runs in
    scratchpad; commit
    verdict/metadata
    for all.
14. **Should the harness
    fail on unknown
    fixture version?**
    Memo default:
    **yes** — mismatch
    between fixture
    `version:` field
    and the harness's
    expected version
    forces an amber
    verdict pending
    human review.

## 22. Recommendation

**Approve this memo as the
design + spec for the report
regression harness.** Then the
next code loop is:

- **AgentOps-3e · minimal
  local Playwright regression
  prototype**.
- **One fixture only**
  (Fixture A default).
- **Playwright CLI**, not
  MCP.
- **Local target only**
  (Stage 1;
  `http://localhost:3000`).
- **No baseline promotion**
  in the first prototype.
- **No production target.**
- **No automatic push /
  deploy.**
- **No `.agent/scripts/**`
  edits** unless separately
  approved.
- **No OpenAI API or
  collector / corpus work.**

Rationale:

- Design-before-code is the
  shape that made AgentOps-
  2b/2c, P2.0a, P2.1a, and
  3a/3b reviewable. Same
  pattern applies here.
- Local-first, one-fixture,
  Playwright-CLI, no-
  baseline-promotion is the
  smallest useful next
  step. Everything larger
  (A-E gating, production
  target, semantic rubric,
  MCP, auto-baseline) is a
  future TASK once we've
  seen how the first
  prototype actually
  behaves.
- Verdict integration into
  RUN_REPORT + planner
  (3f) waits until the
  first prototype has
  produced its first
  verdict — no point
  wiring templates to a
  contract we haven't
  tested.

**Explicitly NOT the
default**: G2.1d (BLK-0001),
any OpenAI API introduction
(BLK-0003 Q7-blocked
senses), any
`.agent/scripts/**` edit,
any A-E gating in the first
prototype, any production
target, any Playwright MCP,
any auto-baseline
promotion, any push after a
green verdict without human
approval, any bundling of
3e + 3f into one loop.
