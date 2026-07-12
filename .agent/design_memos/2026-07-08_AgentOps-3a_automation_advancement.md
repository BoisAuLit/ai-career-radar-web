# AgentOps-3a · Automation Advancement System

> Design-only memo. No runner. No harness. No
> planner script. No benchmark fixture code.
> Task: `.agent/tasks/2026-07-08_run_01_TASK.md`.
> Successor to AgentOps-2b
> (`.agent/design_memos/2026-06-29_AgentOps-2b_automation_runner_design.md`)
> and AgentOps-2c
> (`.agent/design_memos/2026-06-30_AgentOps-2c_supervised_runner_dry_run_design.md`).
> Written under the strategic-pause exit approved
> by Bohao's 2026-07-11 message.

## Status

- **Type**: design memo
- **Version**: draft_for_human_chatgpt_review
- **Scope**: `.agent/`-only. No `src/**`,
  `src/data/**`, prompts, API routes, pipeline,
  `.github/workflows/**`, `.agent/scripts/**`,
  or `.agent/policies/**` change.
- **Depends on**: AgentOps-2b (Option B),
  AgentOps-2c (Shape B narrow envelope, Q7,
  Q10), P2.1a (real-report quality audit),
  Candidate 1 (stream sentinel), Candidate 4
  (empty-PDF gate), E2E smoke test (2026-07-08).
- **Standing blockers**: BLK-0001 · BLK-0002 ·
  BLK-0003 remain `open`. Q10 pause of
  AgentOps-2* implementation continues; this
  memo does not lift it.

## 1. Goal

Bohao's stated aim, restated in concrete terms:
**cut the daily manual involvement in AI Career
Radar from "hours of hands-on driving" to
"5-15 minutes of major decision approvals",
without letting AI-generated changes silently
degrade the report the product is here to
deliver.**

The system this memo sketches must:

- **Reduce daily manual effort**: allow tangible
  progress during Bohao's sleep and work hours,
  not only during his active dev sessions.
- **Keep humans on the highest-leverage
  decisions**: Bohao + ChatGPT make the daily
  major calls (strategic direction, red/yellow
  approvals, final push), not the mechanical
  ones.
- **Turn Codex into a planner / reviewer**:
  Codex inspects repo state, prior reports,
  open blockers, validation results, and
  proposes the *next* action — but does not
  execute it initially.
- **Keep Claude Code as the implementation
  executor**: Claude Code executes explicitly
  approved TASKs, runs validation, writes
  RUN_REPORT + DECISION drafts, commits, and
  waits for human approval — same shape as the
  current TASK/RUN_REPORT/DECISION loop, just
  more of the "propose next" step handled by
  Codex.
- **Introduce a real-report regression harness
  as a required quality gate**: automation
  velocity must not come at the cost of
  silently regressing the generated report.
  Any product change that could touch
  generated-report quality goes through a
  Playwright-driven benchmark before it is
  eligible for push approval.

The design principle underneath all of this is
the same one that shaped Candidate 1 (transport-
level sentinel) and Candidate 4 (client-side
gate): **make failure modes visible, not
silent**. Automation without visibility is a
faster way to ship regressions.

## 2. Current state

Achieved as of 2026-07-08 daily summary
(head of `.agent/daily_summaries/2026-07-08_SUMMARY.md`):

- ✅ **Supervised TASK → RUN_REPORT → DECISION
  → push loop works.** 19 completed dogfood
  loops through Candidate 4 DECISION
  (`d30821e`). The helper triple
  (`new_task.py` / `new_run_report.py` /
  `new_decision.py`) is stable and lives
  under `.agent/scripts/` (hard-rule
  frozen per AgentOps-2c Q3-Q8).
- ✅ **Claude Code as executor works well.**
  P2.0a/b/c, P2.1a, Candidate 1, Candidate
  4 all shipped through this loop; E2E
  smoke test confirmed real-browser
  behavior for the two Candidate loops.
- ✅ **ChatGPT + human as decision layer
  works well.** Every DECISION file in
  `.agent/decisions/` is ChatGPT-authored
  (human-mediated). Turnaround is fast;
  quality of review is high enough that
  no substantive fix has ever been
  requested post-DECISION.
- ⏸ **Codex planner layer is not yet
  active.** AgentOps-2b picked Option B
  as the *future* direction; AgentOps-2c
  picked Shape B as the *future*
  prototype. Neither has been built.
- ⏸ **Automation-infra remains paused
  per AgentOps-2c Q10.** Product work
  (P2.0/P2.1) has been the focus since
  2026-06-30. AgentOps-3 is a fresh
  scoping track authorized 2026-07-11;
  it does not resume the paused
  runner-implementation track.
- ⛔ **Blockers remain open.** BLK-0001
  (G2.1d red-zone), BLK-0002 (full
  automation activation), BLK-0003
  (OpenAI API standing Q7-scoped) all
  still `open`.
- ⛔ **OpenAI API remains blocked** in
  the SDK / key / HTTP / import / CI
  secret / background-token / automation
  token senses. Codex CLI via ChatGPT
  sign-in is the sanctioned Codex
  channel per AgentOps-2b Q7.
- ⛔ **No full automation yet.** No cron,
  no scheduler, no daemon, no GitHub
  Actions runner is dispatching AI
  work; the pipeline repo's daily
  Greenhouse/Ashby cron is a separate
  concern and remains untouched by
  this memo.

## 3. Target architecture

### 3.1 Roles

- **Human (Bohao)** — final approver for
  every push, deploy, red-zone action, and
  blocker resolution. Sets strategic
  direction. Reads a **daily executive
  digest** in 5-15 minutes.
- **ChatGPT** — advisor / manual reviewer.
  Writes DECISION files, sharpens plans,
  reads reports adversarially. Not
  unattended.
- **Codex** — **NEW role from 3a onward**.
  Read-only planner / reviewer / decision
  recommender. Reads repo state, prior
  RUN_REPORT / DECISION / daily-summary
  history, `automation_queue.md`,
  `blockers.md`, validation results.
  Proposes the next single task. Later
  phases may extend to TASK-draft
  authorship. Never executes; never
  pushes; never deploys.
- **Claude Code** — implementation
  executor. Executes approved TASKs,
  runs validation, calls the real-
  report regression harness when
  required, writes RUN_REPORT, drafts
  DECISION, commits. Waits for human
  push approval.
- **Playwright report-regression
  harness** — **NEW component from 3d
  onward**. Visits the deployed site (or
  local dev, in early phases). Uploads a
  fixed benchmark-resume set. Generates
  real reports. Records markdown +
  screenshots + metadata + cost + latency.
  Compares against last-known-good
  baseline and rubric. Produces
  green / amber / red verdict.
- **GitHub / Vercel** — code hosting +
  auto-deploy. Vercel deploys on every
  `origin/main` push. GitHub Actions
  remains untouched by this memo (memo
  does not add or modify workflows).

### 3.2 Text-diagram daily flow

```
                        HUMAN GOAL / DAILY APPROVAL
                                    │
                                    ▼
     ┌──────────────────────────────────────────────────┐
     │  CODEX read-only daily planner (3b onward)       │
     │  reads: git log · .agent/{tasks,run_reports,     │
     │         decisions,daily_summaries,blockers,      │
     │         automation_queue}                        │
     │  outputs: proposed 1 next TASK · risk class ·    │
     │           regression required? · why-not-others  │
     └──────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌──────────────────────────────────────────────────┐
     │  HUMAN + CHATGPT approve TASK class              │
     │  (5-15 min executive digest read)                │
     └──────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌──────────────────────────────────────────────────┐
     │  CLAUDE CODE executes approved TASK              │
     │  · implements narrow scoped change               │
     │  · runs build / lint / drift check               │
     │  · runs Playwright regression harness if         │
     │    §8 gate says required                         │
     │  · writes RUN_REPORT with harness verdict        │
     │  · commits impl + RUN_REPORT                     │
     │  · stops before push                             │
     └──────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌──────────────────────────────────────────────────┐
     │  CHATGPT drafts DECISION · human reviews         │
     └──────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌──────────────────────────────────────────────────┐
     │  HUMAN approves push · Claude pushes             │
     │  Vercel auto-deploys                             │
     │  Claude appends daily summary + push cleanup     │
     └──────────────────────────────────────────────────┘
```

Every arrow above is a **hand-off with a
written artifact**; no arrow is a silent
call. That is the invariant.

## 4. Automation phases

Six phases, sequential, each with an explicit
"what's allowed" and "what's still forbidden"
line. No phase enables auto-push, auto-deploy,
or auto-red-zone-approval.

- **3a — this memo. Design only.**
  - Allowed: `.agent/` design memo + TASK +
    RUN_REPORT + DECISION for this loop.
  - Forbidden: any runner, harness, planner,
    or fixture code. Any `.agent/scripts/**`
    edit. Any `src/**` edit.

- **3b — Codex read-only daily planner.**
  - Allowed: Codex (via ChatGPT sign-in per
    Q7) reads the whole repo + all `.agent/*`
    artifacts and produces a **daily planner
    report** at
    `.agent/planner_reports/YYYY-MM-DD_PLANNER.md`.
    Report is authored by hand-invoking
    Codex locally; no scheduler. Codex has
    zero write authority on any file it did
    not itself create in the
    `planner_reports/` directory.
  - Forbidden: TASK-draft authorship,
    `.agent/scripts/**` edit, any `src/**`
    edit, any push, any red-zone approval,
    any OpenAI API in Q7-blocked senses.

- **3c — Codex proposes TASK drafts.**
  - Allowed: Codex may scaffold a proposed
    TASK file under
    `.agent/tasks_draft/YYYY-MM-DD_run_XX_TASK_DRAFT.md`
    (note the `tasks_draft/` directory, not
    the real `tasks/`). Human + ChatGPT
    review the draft; if approved, human
    manually promotes it into the real
    `tasks/` directory (or asks Claude Code
    to promote). Draft directory is a new
    convention.
  - Forbidden: writing directly into
    `.agent/tasks/`, any execution, any
    push, `.agent/scripts/**` edit.

- **3d — Claude Code executes pre-approved
  green/yellow tasks and stops at RUN_REPORT.**
  - Allowed: Claude Code takes a
    green-or-yellow TASK from a promoted
    file, implements narrowly, runs build /
    lint / drift check, writes RUN_REPORT,
    commits impl + RUN_REPORT. **No push.**
    Applies §8 quality-gate rules to decide
    whether the regression harness must
    run before RUN_REPORT is considered
    complete.
  - Forbidden: red-zone TASKs (must remain
    human-only), any push, any deploy, any
    `.agent/scripts/**` edit, any prompt
    change, any model-selection change.

- **3e — Real-report regression harness
  becomes a required quality gate for the
  task classes named in §8.**
  - Allowed: Claude Code runs the harness
    (see §7) and attaches its verdict
    (green / amber / red) to the RUN_REPORT.
    Amber and red block push approval
    until human + ChatGPT review.
  - Forbidden: any TASK class that touches
    generated-report quality without
    invoking the harness; any push while
    harness verdict is red; any harness
    invocation against production without
    explicit approval.

- **3f — Limited auto-scheduling during
  automation time.**
  - Allowed: Codex planner + Claude
    executor may run inside a bounded
    time window (e.g. sleep-window) on
    an explicitly white-listed queue item.
    All output remains gated by human
    push approval the next morning.
  - Forbidden: **any red-zone change**,
    **any push**, **any deploy without
    human approval**, any OpenAI-API
    usage in Q7-blocked senses, any
    blocker resolution, any G2.1d work,
    any pipeline-file edit.

Phases 3b → 3f each need their own separate
TASK + RUN_REPORT + DECISION loop. This memo
does not open any of them; §14 lists them.

## 5. Codex planner responsibilities

### 5.1 Codex can eventually (across 3b-3f)

- Summarize current repo state (`git log`,
  `git status`, current branch).
- Read latest daily summaries.
- Read open blockers (`blockers.md`) and the
  automation queue (`automation_queue.md`).
- Read the last N `RUN_REPORT` and `DECISION`
  files to understand recent trajectory.
- Read `.agent/design_memos/*` for standing
  design context.
- **Propose next one task** — a single-default
  recommendation with a written justification.
- Classify the proposed task's **risk**:
  green / yellow / red per §9.
- Explain why NOT doing the other candidate
  tasks (§16-style single-default with
  runners-up).
- Identify required validations (`npm run
  build`, `npm run lint`,
  `npm run check:web-bundle-stats`, screenshot,
  regression harness).
- Decide whether the **report-regression test
  is required** by §8 gate rules.
- Produce a **daily planner report**
  (§12 artifact) in Markdown.

### 5.2 Codex cannot

- Modify files (initially — in 3b) except
  the planner report it just authored.
- Call OpenAI API through app / pipeline /
  automation-runner code (BLK-0003 Q7-blocked
  senses).
- Push to any branch on any repo.
- Deploy anywhere.
- Edit red-zone files (§9).
- Unblock blockers (BLK-0001 / 2 / 3).
- Run the collector.
- Refresh corpus.
- Change prompts (`src/lib/prompts.ts`
  frozen).
- Change model selection.
- Modify `.agent/scripts/**` (hard rule).
- Auto-approve its own proposals — every
  planner report is a *draft*, not an
  execution ticket.

## 6. Claude Code executor responsibilities

### 6.1 Claude Code can (across current
loop + 3d onward)

- Execute explicitly approved TASKs.
- Implement narrow scoped changes matching
  the TASK's allowed-files list.
- Run validation (`npm run build`, `npm run
  lint`, `npm run check:web-bundle-stats`,
  `npm run screenshot`).
- Run the report-regression harness (§7)
  when §8 requires it.
- Write RUN_REPORT including the harness
  verdict.
- Write DECISION *drafts* — final DECISION
  remains ChatGPT-authored (human-mediated).
- Commit implementation + reports.
- Wait for human push approval.
- Extend daily summary during push cleanup.

### 6.2 Claude Code cannot

- Decide new product direction alone.
- Push without explicit approval.
- Deploy manually (`vercel deploy`, etc.).
- Modify forbidden files listed in TASK.
- Start a new TASK without human instruction.
- Resolve blockers (BLK-0001 / 2 / 3).
- Run collector or refresh corpus unless
  explicitly approved.
- Introduce OpenAI API (BLK-0003 Q7-blocked
  senses).
- Modify `.agent/scripts/**` (hard rule per
  AgentOps-2c Q3-Q8).
- Change prompts (`src/lib/prompts.ts`).
- Change model selection.
- Modify GitHub Actions.
- Bypass a red harness verdict — must stop
  and write an incident note per §11.

## 7. Real-report regression harness

This is the load-bearing invariant of the
whole system. Automation without semantic
verification is a faster path to
regressions. The harness makes generated-
report quality **inspectable at every
push-gate boundary** for any change that
could touch it.

### 7.1 Mechanics

- **Runner**: Playwright CLI (already a
  devDependency; used in `npm run
  screenshot` and the 2026-07-08 E2E
  smoke test). Optionally Playwright
  MCP in a future phase; not required.
- **Target**: first version runs against
  **local `npm run dev`** at
  `http://localhost:3000`. Later phases
  may extend to the production
  `origin/main`-deployed URL via
  explicit human approval per run
  (production is a red-adjacent target).
- **Input**: a fixed set of synthetic
  benchmark resumes (§7.3) + stable
  target-role strings. No user resumes
  and no PII ever enter the harness.
- **Output per run**:
  - `report.md` (verbatim streamed
    markdown).
  - `report.png` (full-page screenshot
    of the report card).
  - `metadata.json` — timestamp,
    branch, commit SHA, duration_ms,
    n_chars, sections_detected,
    incomplete_banner_flag,
    action_bar_buttons_visible.
  - `cost.json` — approximate API cost
    based on token estimates (small
    utility; see §15 open decision on
    accuracy).
  - `verdict.md` — green / amber / red
    with per-check reasoning.
- **Comparison target**: a
  `baseline/` directory containing the
  last-known-good `report.md` and
  `metadata.json` for each benchmark
  resume. Location decided in §15.

### 7.2 First benchmark suite (§7.3 fixtures
will be authored in a later phase, NOT this
loop; naming pinned here)

- **Resume A** · senior backend SWE
  → Applied AI Engineer at a frontier
  lab. Target: "Applied AI at
  Anthropic; ship LLM features to
  production; not research."
- **Resume B** · full-stack engineer
  → AI Product Engineer at a well-
  funded scaleup. Target: "AI product
  engineer at a Series B scaleup;
  build user-facing AI features end
  to end."
- **Resume C** · data engineer
  → LLM Infra Engineer. Target:
  "LLM inference infra; GPU
  optimization; serving stack."
- **Resume D** · ML-adjacent SWE
  → Agent Engineer. Target:
  "Multi-step agentic workflows,
  tool use, orchestration."
- **Resume E** · traditional
  enterprise SWE → AI transition.
  Target: "Move from monolith
  enterprise Java into an AI-adjacent
  role at a mid-size company."

The suite is small on purpose. 5 resumes
cover the 8 archetypes at reasonable
breadth (applied_ai, agent_engineering,
llm_infra, plus two archetype-boundary
cases). Version 2 can expand later after
observing what fails.

### 7.3 First-version minimum checks
(applied per run, per resume)

- ✅ Report reaches `stage === "done"`
  within a latency budget (§15 sets the
  value).
- ✅ **No incomplete banner** — verifies
  Candidate 1 sentinel arrived.
- ✅ Has expected sections: exactly the
  5 markdown H2s in the
  `src/lib/prompts.ts` template order
  (Target role / What you already have
  / Top 5 gaps / Over-prioritizing /
  Highest-leverage next action).
- ✅ Has **Top 5 gaps** section with
  ≥ 5 numbered gap items.
- ✅ Has **Highest-leverage next action**
  section ending with "Reassess in [N
  weeks]" language.
- ✅ Has **Evidence Appendix** listing
  cited `jd_id + company + title`.
- ✅ ≥ 1 evidence quote per gap section
  (heuristic: quoted spans with the
  emerald blockquote styling).
- ✅ Report length within an expected
  band (e.g. 1500-6000 chars, tuned
  after first run).
- ✅ No obvious generic filler ("As an
  AI language model", "In today's
  fast-paced world", etc. — small
  denylist).
- ✅ No empty sections.
- ✅ Cost below the per-run budget
  (§15 sets it).
- ✅ Latency below the per-run budget
  (§15 sets it).
- ✅ Eval button still present in the
  action bar (Candidate 1 held).

### 7.4 Future checks (§10 planner will
promote these one at a time)

- Quote substring integrity — every
  quoted span appears verbatim in one
  of the 5 supplied JD bodies. (This
  is the standalone Candidate 2 loop
  scoped in P2.1a §9; §7.4 folds its
  result into the harness eventually.)
- Semantic rubric score — an
  LLM-judge that scores each
  benchmark report against a
  rubric. Costly; needs monthly
  budget answer (§15).
- Regression vs baseline — a diff
  algorithm on section-by-section
  content (not char-level) that
  flags material shifts.
- Recommendation specificity —
  reused from `src/lib/eval-report.ts`
  Haiku judge; possibly inline the
  eval flow.
- Role-alignment check — does the
  archetype tag match the target
  intent?
- Trend-awareness check — has the
  report drifted into "rising /
  falling / emerging" language
  the prompt forbids?
- Hallucination detection —
  substring-search for the
  named-forbidden-companies list
  in `src/lib/prompts.ts:72-80`.

## 8. Quality gates

### 8.1 When regression is required

- ✅ **Any change to report generation
  logic** (`src/app/api/generate-report/**`,
  the streaming path).
- ✅ **Any prompt change** (`src/lib/prompts.ts`
  — a red-zone file; regression is
  required IN ADDITION to human red-zone
  approval).
- ✅ **Any model change** (either the
  generator model constant in
  `src/app/api/generate-report/route.ts:17`
  or the judge model in
  `src/lib/eval-report.ts:8`).
- ✅ **Any corpus retrieval change**
  (`src/lib/corpus.ts` — pick logic,
  archetype filter, evidence selection).
- ✅ **Any PDF / resume input change**
  (`src/app/api/extract-pdf/**`,
  `src/lib/extract-pdf.ts`, PDF gate).
- ✅ **Any report renderer change**
  (`src/app/page.tsx` markdown-render
  path, `<ReactMarkdown>` config,
  Candidate 1 sentinel logic, action
  bar).
- ✅ **Any bundle swap or corpus
  refresh** (per P2.0a §7 gates —
  regression is required alongside
  the memo's arithmetic thresholds).

### 8.2 When regression is optional

- 🟡 `.agent`-only changes.
- 🟡 Docs / README-only changes.
- 🟡 Copy tweaks that don't touch the
  report renderer (e.g. hero copy,
  methodology copy, sample-report
  copy).
- 🟡 UX gates that clearly don't
  affect generated content (e.g.
  Candidate 4's client-only empty-
  PDF gate ran with `npm run
  screenshot` only, not the
  regression harness; that was the
  right call because it doesn't
  touch report generation).

### 8.3 When regression is forbidden

- 🔴 On a dirty repo (`git status`
  not clean).
- 🔴 Against production without
  explicit per-run human approval.
- 🔴 With any harness output
  written to a red-zone path
  (e.g. never write into
  `src/data/**`).
- 🔴 During a red-zone TASK before
  the human approval has been
  captured in a DECISION file.

### 8.4 Gate verdicts

- **Green** — every check passes;
  RUN_REPORT records the verdict;
  push approval remains available.
- **Amber** — one or more checks
  softly fail (e.g. cost is above
  budget by <10%; report length is
  slightly out of band); Human +
  ChatGPT review REQUIRED; push
  approval is possible but must be
  explicit.
- **Red** — one or more checks
  hard-fail (incomplete banner
  appeared; a section missing;
  a forbidden trend claim
  present); **push MUST NOT
  proceed**; the TASK either
  fixes or reverts. Claude Code
  writes an incident note per
  §11.

## 9. Risk classification

Uses the vocabulary from
`.agent/policies/agent_policy.md` §2
and `.agent/policies/automation_policy.md`
§6.

### 9.1 Green (widened to include
automation-3 artifacts)

- Docs / READMEs.
- `.agent/daily_summaries/` entries.
- `.agent/planner_reports/` entries
  (new directory, 3b onward).
- Read-only audits (like this memo).
- Design memos (like this memo).
- Small utility scripts strictly
  outside `.agent/scripts/**` and
  outside `src/**` — with the
  caveat that ANY new script under
  `scripts/` needs a separate
  TASK + DECISION (compare to
  `scripts/check-web-bundle-stats.mjs`
  which shipped via P2.0c).

### 9.2 Yellow

- User-visible UI copy edits
  (P1.7/P1.8 series).
- Small client-side UX changes
  (Candidate 4).
- Report renderer tweaks
  (Candidate 1's `page.tsx`
  half).
- Eval helper tweaks that don't
  change the judge model.
- Benchmark-harness code once
  built.
- Regression-harness verdict
  logic (once built).
- New `.agent/scripts/**`
  candidate — **hard rule per
  AgentOps-2c Q3-Q8 keeps this
  frozen without an explicit
  human decision to unfreeze,
  which is itself a separate
  TASK**.

### 9.3 Red

- Prompt changes (`src/lib/prompts.ts`).
- Model-selection changes (either
  the Sonnet generator or the
  Haiku judge).
- Classifier / extractor logic.
- Corpus promotion / bundle
  swap.
- `sources.yaml`.
- `.github/workflows/**` /
  cron changes.
- Automation runner
  implementation (BLK-0002).
- OpenAI API introduction
  (BLK-0003 Q7-blocked senses).
- Deploy / auth / payment /
  DB-schema changes.
- Anything that could broadly
  affect generated report
  quality without going through
  §8.1's regression gate.
- Codex CLI or Claude Code
  config mutation.

## 10. Human daily interaction model

Bohao's daily surface, delivered by the
Codex planner (3b onward):

**Executive digest (10-15 line block)**:

- Yesterday's completed loops (task
  IDs + one-line result).
- Current repo status (branch,
  ahead-by, clean/dirty).
- Green / amber / red issues (open
  blockers, deferred queue items,
  any red harness verdicts).
- Proposed next TASK (single default
  + one-line reason).
- Regression-test summary if the
  proposed TASK requires it (§7
  benchmark suite subset + expected
  duration + expected cost).
- Blockers list (open only).
- Specific yes/no decisions Bohao
  needs to make today.

**Goal: 5-15 minutes / day.** Not
hours. If the digest cannot fit
into 15 minutes of reading, it
means Codex is dumping raw
material — the answer is to
tighten the digest, not expand
the reader's time.

## 11. Failure handling

### 11.1 Failure classes

- Build fail.
- Lint introduces a new class of
  error not in the frozen
  baseline (37 pre-existing).
- Screenshot fail.
- Regression harness returns
  **amber** or **red**.
- API cost spike (per-run cost
  > budget).
- Latency spike (per-run
  duration > budget).
- Generated report incomplete
  (Candidate 1 banner fires
  during a benchmark run).
- Semantic report-quality
  regression vs baseline (§7.4
  once available).
- Dirty repo detected mid-loop.
- Unexpected forbidden-file
  diff detected.
- Push / deploy mismatch (e.g.
  Vercel deploy failed but
  `origin/main` moved).

### 11.2 Response protocol

- **Stop.** Do not proceed to
  RUN_REPORT completion.
- **Write an incident note**:
  `.agent/incidents/YYYY-MM-DD_INCIDENT_<slug>.md`
  (new directory). Include
  failure class, timestamp,
  affected artifacts, git SHA,
  harness output pointer,
  recommended next action
  (fix / revert / defer).
- **Do not push.**
- **Ask human.** The daily
  digest surfaces the
  incident at the top of the
  next morning's digest.
- **Propose fix or revert.**
  Fix: a follow-up TASK with
  the same shape as P2.0b's
  precision-fix (`e3fbbab`).
  Revert: `git revert
  <impl_commit>
  <run_report_commit>` after
  push approval.

## 12. Required artifacts

Directories and file conventions
this system needs (some already
exist; some are new; none are
created by this memo):

- Existing:
  - `.agent/tasks/` — TASK files.
  - `.agent/run_reports/` —
    RUN_REPORT files.
  - `.agent/decisions/` —
    DECISION files.
  - `.agent/daily_summaries/` —
    daily rollups.
  - `.agent/design_memos/` —
    design memos (this one).
  - `.agent/blockers.md` — open
    blockers.
  - `.agent/automation_queue.md`
    — queue state.
  - `.agent/policies/**` +
    `.agent/templates/**`.
- **New (introduced conceptually
  by this memo; created by
  later TASKs)**:
  - `.agent/planner_reports/` —
    Codex daily planner reports
    (3b).
  - `.agent/tasks_draft/` —
    Codex-authored TASK drafts
    before human promotion (3c).
  - `.agent/incidents/` —
    incident notes (§11).
  - `.agent/regression_runs/` —
    per-run regression output
    (report.md, report.png,
    metadata.json, cost.json,
    verdict.md).
  - `.agent/regression_baselines/`
    — last-known-good baselines
    (§7.1); location subject to
    §15 open decision on repo
    vs external.
  - `.agent/regression_fixtures/`
    — 5 benchmark resumes A-E
    (see §7.2).

## 13. Permissions matrix

Rows = actors. Columns compressed:
`Read repo` / `Write files` /
`Push` / `Deploy` / `Approve
red-zone` / `Run LLM calls (in
Q7-blocked senses)` / `Run
collector` / `Modify prompts` /
`Modify .agent/scripts/**` /
`Create TASK` / `Draft
RUN_REPORT` / `Draft DECISION`.

| Actor | Read repo | Write files | Push | Deploy | Approve red-zone | LLM (Q7-blocked) | Collector | Prompts | .agent/scripts/** | Create TASK | Draft RUN_REPORT | Draft DECISION |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Human** | ✅ | ✅ | ✅ (final) | ✅ (final) | ✅ **only they** | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ manual | ✅ manual |
| **ChatGPT** | ✅ (via human paste) | ❌ direct | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ manual dictation | ❌ direct | ✅ **primary** |
| **Codex** (3b) | ✅ read-only | ✅ only `.agent/planner_reports/` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Codex** (3c) | ✅ | ✅ + `.agent/tasks_draft/` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ draft only | ❌ | ❌ |
| **Claude Code** | ✅ | ✅ per TASK allowlist | ❌ (needs approval) | ❌ | ❌ | ❌ | ❌ unless explicit | ❌ | ❌ (hard rule) | ✅ if instructed | ✅ **primary** | ⚠️ draft |
| **Playwright harness** | ✅ read config | ✅ only `.agent/regression_runs/` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **GitHub / Vercel** | ✅ CI | ✅ CI artifacts on GH | ❌ (mirrors human) | ✅ on push (auto) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

Legend: ✅ = allowed; ❌ = forbidden; ⚠️ = restricted / draft-only /
requires explicit context.

Notable invariants:

- Only **Human** ever approves
  red-zone.
- Only **Claude Code** and
  **GitHub/Vercel** can write to
  more than one directory in
  `.agent/*`, and Claude's
  writes are gated by TASK
  allowlist.
- No actor except Human can
  push to `main`. Vercel
  deploys as a *reflection* of
  pushed state; it does not
  originate deploys.
- Codex never invokes OpenAI
  API in the Q7-blocked
  senses; Codex CLI via
  ChatGPT sign-in is a
  separate channel that is
  allowed per AgentOps-2b Q7.

## 14. Implementation roadmap

Five concrete next TASKs after
this memo. **None** are started
by this loop. Each is its own
separate scope-and-approve
cycle.

1. **AgentOps-3b · Codex
   read-only daily planner
   design + spec.** Yellow.
   Files: new memo
   `.agent/design_memos/2026-XX-XX_AgentOps-3b_codex_planner_spec.md`.
   Deliverable: exact input
   set Codex reads, exact
   output shape at
   `.agent/planner_reports/`,
   invocation channel
   (Codex CLI via ChatGPT
   sign-in). No planner code
   built.
2. **AgentOps-3c · Benchmark
   resume suite as static
   synthetic fixtures.** Green.
   Files: new
   `.agent/regression_fixtures/{A,B,C,D,E}.md`
   + a small `README.md`
   describing each persona's
   design. No harness code
   built.
3. **AgentOps-3d · Report
   regression harness design
   memo.** Yellow-adjacent.
   Files: new memo pinning
   Playwright CLI vs MCP,
   local vs prod target,
   verdict-computation
   algorithm, per-check
   thresholds. Still no
   code.
4. **AgentOps-3e · Minimal
   local Playwright report-
   regression prototype.**
   Yellow. Files: new script
   under `scripts/` (not
   `.agent/scripts/**`)
   producing verdict.md
   against a single benchmark
   resume. Node stdlib +
   already-installed
   Playwright. Zero new
   dependency.
5. **AgentOps-3f · Integrate
   regression result into
   the RUN_REPORT template
   and daily digest.**
   Green/yellow. Files:
   `.agent/templates/run_report_template.md`
   (§Regression section) +
   Codex planner's digest
   contract. `.agent/policies/**`
   may need a small edit;
   that itself needs its own
   red-zone-adjacent
   approval per AgentOps-0's
   "protocol changes are
   always yellow" rule.

## 15. Open decisions for human + ChatGPT

At least 10 concrete yes/no
questions. Bohao + ChatGPT
should pin the answers before
3b begins.

1. **Should the Codex planner
   run manually (invoked by
   Bohao when he's ready) or
   scheduled?** Recommendation:
   manual first (aligns with
   AgentOps-2c Q10 "no
   scheduler"); revisit
   after 3d.
2. **Should benchmark reports
   run against local dev or
   production first?**
   Recommendation: local dev
   first; production later
   with explicit per-run
   approval.
3. **What is the monthly API
   budget for automated
   regression?** Options:
   $10 / $25 / $50 / other.
   Impacts §7.4 semantic
   rubric feasibility.
4. **How many benchmark
   resumes in v1?** Memo
   proposes 5 (A-E); is that
   the right number or does
   Bohao want 3 to start?
5. **Can Claude Code run
   real LLM calls (i.e.
   invoke `/api/generate-
   report` end-to-end)
   during automation time?**
   Or only during
   supervised sessions?
   Currently supervised
   only.
6. **Should a red harness
   verdict block push
   automatically or just
   flag it in the digest?**
   Recommendation: block
   automatically (align
   with §11).
7. **Where should baselines
   be stored?** Options:
   (a) `.agent/regression_baselines/`
   in repo, (b) external
   S3-style bucket, (c)
   local dir under
   `temporary/`. Impacts
   repo bloat.
8. **Should generated
   benchmark reports be
   committed each run or
   stored outside repo?**
   Recommendation: outside
   repo (scratchpad or
   external); commit only
   the verdict.md +
   metadata.json summary.
9. **When, if ever, can
   Codex create TASK
   files directly in
   `.agent/tasks/`
   (bypassing
   `tasks_draft/`)?** Memo
   default: never in 3a-3d;
   review in 3f.
10. **Which task classes
    are allowed during
    sleep / work
    automation time?**
    Recommendation:
    Green + narrow Yellow
    only; explicit
    per-item whitelist
    in the queue.
11. **Should the harness
    also record the
    3-judge eval scores
    (`src/lib/eval-report.ts`)
    for each benchmark
    run?** Trade-off:
    doubles cost per
    run; catches
    regressions the
    minimum-check list
    misses.
12. **What is the
    Playwright headed vs
    headless posture?**
    Headless in
    automation; headed
    on-demand for
    Bohao's debugging.
13. **Does the daily
    executive digest
    live in
    `.agent/planner_reports/`
    or in a new
    `.agent/executive_digests/`
    directory?**
    Recommendation:
    fold into
    `planner_reports/`;
    the digest IS the
    planner report.

## 16. Recommendation

**Start with AgentOps-3b (Codex
read-only daily planner design
+ spec).** In parallel — as a
strictly separate loop — draft
**AgentOps-3c (benchmark resume
suite as static fixtures)** so
the harness has inputs before
its own design memo (3d) is
written. Do NOT enable
auto-execution or auto-push in
either loop. Do NOT build the
regression harness before its
design memo (3d) lands. Do NOT
lift any of the 3 open
blockers. Do NOT introduce
OpenAI API in Q7-blocked
senses. Do NOT modify
`.agent/scripts/**`. Do NOT
resume automation-infra as
implementation before Bohao
explicitly says so.

Rationale:

- Codex-planner-read-only is
  the **lowest-risk useful
  step forward** that
  materially reduces manual
  effort (Bohao stops
  eyeballing `git log` +
  daily summaries +
  automation queue by
  hand).
- Benchmark fixtures are
  **strictly green
  design-only content**
  (5 Markdown resumes with
  a README). They have zero
  runtime impact, can be
  authored in parallel
  without touching the
  planner track, and become
  the input the harness
  design memo (3d) can
  point at concretely.
- Design-before-code stays
  faithful to the shape
  that made AgentOps-2b /
  2c / P2.0a / P2.1a
  reviewable. Every prior
  major track went
  memo-first; the ones that
  did most reliably shipped
  clean.
- Regression-harness code
  (3e) waits until 3d has
  pinned thresholds; the
  worst outcome is a
  harness that flags too
  many false positives or
  too few true positives
  because the checks
  weren't grounded.

**Explicitly NOT the default**:
G2.1d (BLK-0001), any OpenAI
API introduction (BLK-0003
Q7-blocked senses), any
`.agent/scripts/**` edit, any
runner implementation before
its design settles, any
production-target harness
before local settles, any
sample-vs-real visual audit
(Candidate 5 remains a
soak-later decision).
