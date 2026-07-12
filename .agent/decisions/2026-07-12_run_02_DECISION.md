# DECISION · AgentOps-3d report regression harness design memo

> Authored by ChatGPT (human-mediated) after
> reading the RUN_REPORT and the full 1420-line
> memo. Scaffolded by
> `python .agent/scripts/new_decision.py
> --task-id 2026-07-12_run_02` (**twenty-third
> full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-12_run_02_DECISION`
- **based_on_run_report**:
  `.agent/run_reports/2026-07-12_run_02_RUN_REPORT.md`
- **based_on_design_memo**:
  `.agent/design_memos/2026-07-12_AgentOps-3d_report_regression_harness_design.md`
- **based_on_prior_decisions**:
  `.agent/decisions/2026-07-12_run_01_DECISION.md`
  (AgentOps-3c · fixtures A-E landed) ·
  `.agent/decisions/2026-07-11_run_01_DECISION.md`
  (AgentOps-3b · Codex planner spec + 10
  answers) ·
  `.agent/decisions/2026-07-08_run_01_DECISION.md`
  (AgentOps-3a · phased rollout + 13
  answers).

## Verdict

`approve`

## Reasoning summary

AgentOps-3d successfully **designs the future
report regression harness without prematurely
implementing it**. The memo correctly treats
report regression as a **quality gate for
the automation advancement system**: the
goal is not merely to let AI agents produce
code, but to **automatically test whether
real AI Career Radar reports improve or
regress**.

The design appropriately:

- **Uses the AgentOps-3c synthetic
  fixtures** (5 personas A-E) rather than
  any real user data.
- **Starts with local-only execution**
  (`http://localhost:3000`).
- **Recommends Playwright CLI rather than
  MCP** for reproducibility (§5).
- **Starts with one fixture only**
  (Fixture A default) per AgentOps-3a
  DECISION answer #4.
- **Avoids baseline promotion** in the
  first prototype.
- **Defines green / amber / red
  verdicts** with concrete criteria
  (§12).
- **Proposes artifact and baseline
  policies** (§8-§9) — commit only
  summaries in v1; large artifacts stay
  scratchpad; baseline promotion
  through TASK + RUN_REPORT + DECISION
  only.
- **Defines v1 structural / fixture-
  specific / operational checks** (§10).
- **Handles LLM nondeterminism** without
  naive text diff (§14 — structural +
  rubric + baseline signals only).
- **Defines how results feed Codex
  planner reports** (§15, per
  AgentOps-3b §10 5-state mapping)
  **and Claude Code RUN_REPORTs**
  (§16).

The task remained **strictly design-only**:

- **No Playwright run** — no
  `page.goto`, no
  `page.screenshot`, no
  `Playwright` invocation.
- **No report generation** — no
  `curl` / `fetch` against
  `/api/generate-report`.
- **No LLM / API call** by this
  task.
- **No baseline artifact** created.
- **No screenshot** produced.
- **No `.agent/regression_runs/`
  directory** created.
- **No `.agent/scripts/**` change**
  (hard rule per AgentOps-2c
  Q3-Q8).
- **No runtime source change**
  (`src/**` empty diff).
- **No pipeline change** (HEAD
  `b019786` at start and end).
- **No collector / corpus refresh.**
- **No OpenAI API in Q7-blocked
  senses.**
- **No GitHub Actions change.**
- **No push / deploy.**

Independent verification against the local
tree (both commits: `ac3b4cf` + `0d60bdc`):

- **Scope** (`git diff --name-only
  origin/main..HEAD`) = exactly the 3
  approved paths.
- **Memo structural check**: 1420 lines
  (comparable to AgentOps-3a's 1175 and
  AgentOps-3b's 1258). 23 H2 sections =
  22 required + 1 `Status` header.
- **All 22 required sections present in
  order**: Purpose · Current state ·
  Design principles · Fixture usage ·
  Playwright CLI vs Playwright MCP ·
  Target environment strategy · Future
  harness flow · Artifact storage
  design · Baseline policy · Checks v1 ·
  Checks deferred · Verdict algorithm ·
  Thresholds and budgets · Nondeterminism
  handling · Integration with Codex
  planner · Integration with Claude
  Code · When regression is required ·
  Failure handling · Security and
  privacy · Implementation roadmap after
  3d · Open decisions · Recommendation.
- **§4** covers all 5 fixtures A-E +
  pins v1-one-fixture rule (Fixture A
  default).
- **§5** recommends Playwright CLI for
  v1; defers MCP to interactive
  debugging.
- **§6** defines 3 target-environment
  stages (local dev / local preview
  build / production smoke).
- **§7** lists the 18-step future
  harness flow.
- **§8** pins the `.agent/regression_runs/`
  layout + commit-vs-local policy
  (verdict + metadata committed; large
  artifacts scratchpad).
- **§9** pins baseline promotion
  through TASK + RUN_REPORT + DECISION
  only.
- **§10** lists v1 checks in 3
  buckets (structural 11 items /
  fixture-specific 4 items /
  operational 5 items).
- **§11** lists 9 deferred checks
  with reasons.
- **§12** defines green / amber /
  red verdict criteria.
- **§13** pins thresholds ($25 /
  month, $0.25 per-run, 120s soft /
  240s hard latency, 1 fixture).
- **§14** covers nondeterminism
  strategy (no exact-text diff;
  large unexplained changes = amber).
- **§15** maps 5 states (A
  unavailable / B not required / C
  green + required / D amber
  escalate / E red fix-or-revert).
- **§16** pins Claude Code
  integration (runs only when
  instructed; verdict in RUN_REPORT;
  never auto-push; never promote
  baseline).
- **§17** buckets required /
  optional / not-sufficient-alone.
- **§18** failure handling with
  incident-note reference.
- **§19** security + privacy
  (synthetic only; no secrets; no
  `.env` reading; no production
  automation without approval).
- **§20** stages 3e / 3f / later.
- **§21** lists **14** open
  decisions (above the 12 required
  in the TASK) with memo defaults.
- **§22** makes a single opinionated
  recommendation (approve + next
  loop = AgentOps-3e).
- **Forbidden empty diffs**: `src/**`
  ✓, `src/data/**` ✓, `src/lib/**`
  ✓, `src/app/api/**` ✓,
  `.agent/scripts/**` ✓ (**hard
  rule**), `.agent/policies/**` ✓,
  `.agent/templates/**` ✓,
  `.agent/blockers.md` ✓,
  `.agent/automation_queue.md` ✓,
  **`.agent/regression_fixtures/**`
  ✓ (frozen)**,
  **`.agent/planner_reports/**` ✓
  (still empty)**,
  **`.agent/regression_runs/**` ✓
  (not created)**,
  `.github/workflows/**` ✓,
  `package.json` ✓,
  `package-lock.json` ✓, `.env*`
  ✓, `vercel.json` / `.vercel/**`
  ✓.
- **Pipeline repo** untouched — HEAD
  `b019786` at start AND end.
- **No collector invocation**. **No
  LLM call** by this task. **No new
  npm dependency**.
- **No runner / daemon / cron /
  scheduler / GH Actions / Codex
  config / Claude config / OpenAI
  SDK / manual deploy** anywhere.
- **Queue + blockers**:
  `automation_queue.md` and
  `blockers.md` not touched.
  QUEUE-0002 still
  `blocked_pending_human` red.
  BLK-0001 / BLK-0002 / BLK-0003
  all still `open`.

All 34 TASK acceptance criteria are
demonstrably met per RUN_REPORT.
Approving on technical execution + memo
design quality. Push to `origin/main`
remains a separate human-approval gate.
This push is **user-visibly a no-op** —
`.agent/`-only.

## Approved direction

- **Approve AgentOps-3d report
  regression harness design**.
- **Use Playwright CLI, not MCP,
  for the first prototype**
  (reproducibility over
  interactivity).
- **Use local target only for v1**
  (`http://localhost:3000`).
- **Start AgentOps-3e with one
  fixture only** (default
  **Fixture A**).
- **Do not run production tests
  in v1.**
- **Do not promote baselines in
  the first prototype.**
- **Do not use exact full-text
  diff as the primary regression
  signal.**
- **Use structural checks,
  fixture-specific checks, and
  operational checks first**
  (§10 3-bucket structure).
- **Use green / amber / red
  verdicts.**
- **Red verdict blocks push.**
- **Amber verdict escalates to
  Human + ChatGPT.**
- **Store only lightweight
  verdict / metadata in repo
  initially**; keep large
  artifacts local / scratchpad
  unless storage policy is
  separately approved.
- **Default next loop** after
  push / cleanup:
  **AgentOps-3e minimal local
  Playwright regression
  prototype**.
- **AgentOps-3e must be a
  separate loop** and should NOT
  be bundled with this DECISION
  or push.

## Initial answers to §21 open decisions

Recorded here so future TASKs can
point at this DECISION rather than
re-litigating.

1. **Playwright CLI or MCP for v1**:
   **Playwright CLI**.
2. **Artifact location**:
   `verdict.md` and `metadata.json`
   may be committed to
   `.agent/regression_runs/` later;
   large artifacts (`report.md`,
   `report.png`,
   `structural_checks.json`,
   `rubric.md`) should stay
   local / scratchpad in v1.
3. **`report.md` commit policy**:
   **local-only in v1** unless
   separately approved for a
   specific run.
4. **Baseline promotion**:
   **human-only via TASK +
   RUN_REPORT + DECISION**.
5. **First fixture**:
   **Fixture A** (senior backend
   → Applied AI Engineer;
   medium difficulty).
6. **Per-run budget**: **$0.25
   hard cap** (5× baseline
   Sonnet 4.6 cost).
7. **Latency threshold**:
   **120s soft / 240s hard**.
8. **Click Eval button in v1**:
   **no** (cost doubles;
   defers to future TASK
   after the harness soaks).
9. **Screenshot in v1**:
   **captured but not
   necessarily committed**
   (per answer #2 policy).
10. **When harness runs**:
    **report-affecting tasks
    only** (§17.1 required
    list), not every push.
11. **Codex reads verdict
    before recommending**:
    **yes**, once verdict
    summaries are available.
    Before then, Codex marks
    A-state "unavailable"
    per §15.
12. **Production testing in
    v1**: **no** — never
    automatically. Every prod
    run is a separate
    DECISION.
13. **Retention policy**:
    **large artifacts local /
    scratchpad first; commit
    only lightweight summaries
    unless approved**. Memo
    default: last 30 runs
    kept in scratchpad;
    verdict + metadata
    committed for all.
14. **Unknown fixture version
    handling**:
    **force amber pending
    review** — mismatch
    between fixture
    `version:` field and
    the harness's expected
    version forces the
    human loop.

Any of these answers can be
revisited in a future TASK +
DECISION loop; they are named
here so the future 3e-
implementation TASK can cite
them by number.

## Risks found

1. **Future harness
   implementation will run real
   LLM calls** and can incur
   cost. Severity: **medium**.
   Mitigation: §13 budget caps
   ($25/mo, $0.25/run); §18
   cost-spike abort; harness
   short-circuits on hard-cap
   breach.
2. **LLM report output is
   nondeterministic**, so naive
   text diff is unsafe.
   Severity: **acceptable by
   design** — §14 explicitly
   forbids exact-text diff;
   structural + rubric +
   baseline signals are the
   compared quantities.
3. **One-fixture v1 will not
   cover the full product
   surface.** Severity:
   **acceptable by design**.
   Mitigation: 3e prototype
   proves mechanics; A-E
   expansion is a later
   phase per §20.
4. **Fixture A can prove the
   mechanics but cannot prove
   broad quality.** Severity:
   **acceptable** — this is
   the same reason 3e is only
   the prototype phase; A-E
   gating waits until 3f
   integrates verdict into
   templates.
5. **Structural checks can
   miss subtle semantic
   regressions.** Severity:
   **medium**. Mitigation:
   §11 defers semantic
   rubric to a future check
   after the structural
   layer soaks; large
   unexplained changes → §14
   amber-until-reviewed.
6. **Fixture-specific rubric
   checks may be brittle** if
   implemented too literally.
   Severity: **medium**.
   Mitigation: §10.2 uses
   heuristic noun-phrase
   matching rather than
   exact-string matching;
   3e prototype will
   surface brittle cases
   for tuning.
7. **Screenshot / report
   artifacts can bloat the
   repo** if committed
   wholesale. Severity:
   **medium**. Mitigation:
   §8 commit policy pins
   verdict + metadata only;
   large artifacts stay
   scratchpad; answer #13
   retention policy.
8. **Baseline promotion can
   create false confidence
   if not human-reviewed.**
   Severity: **medium**.
   Mitigation: §9 pins
   promotion through TASK +
   RUN_REPORT + DECISION
   only; no auto-promotion.
9. **Production testing
   must not be automatic.**
   Severity: **hard rule**.
   Mitigation: answer #12
   above; AgentOps-3a
   answer #2; §6 Stage 3.
10. **Red verdicts must
    block push**, otherwise
    the harness becomes
    cosmetic. Severity:
    **hard rule**.
    Mitigation: §18 red-
    blocks-push; verdict
    integration into
    RUN_REPORT + Codex
    planner §15 state E
    fix-or-revert.
11. **Amber verdicts must
    escalate** instead of
    being ignored.
    Severity: **hard rule**.
    Mitigation: §18 amber
    requires human +
    ChatGPT review; Codex
    §15 state D escalate.
12. **Cost and latency
    thresholds may need
    tuning** after first
    real runs. Severity:
    **low**. Mitigation:
    §13 numbers are
    explicitly labelled
    "tunable through a
    future DECISION".
13. **Playwright scripts
    must not be placed under
    `.agent/scripts/**`**
    while that hard rule
    remains in force.
    Severity: **hard rule**.
    Mitigation: memo §20.1
    pins 3e harness script
    under repo-root
    `scripts/` (same
    convention as
    `scripts/screenshot.mjs`,
    `scripts/check-web-bundle-stats.mjs`).
14. **AgentOps-3e
    implementation will
    need a separate
    TASK + DECISION.**
    Severity: **acceptable
    by design**. Mitigation:
    memo §22 pins 3e as a
    strictly separate loop.
15. **BLK-0001 / BLK-0002
    / BLK-0003 remain open
    and unaffected.** This
    DECISION does not lift
    any of them. Severity:
    **hard rule**.

## Red-zone flags

`none` for AgentOps-3d.

No `src/lib/prompts.ts`, no
`src/lib/anthropic.ts` (not
present), no
`src/data/web_bundle.json`, no
`src/lib/corpus.ts`, no
`src/app/api/**`, no
`package.json`, no
`package-lock.json`, no
`.env*`, no `vercel.json`, no
`.vercel/**`, no
`.github/workflows/**` changed.
No pipeline-repo file changed at
all. No Codex CLI config, Claude
Code config, or OpenAI SDK
introduced. No `.agent/scripts/**`
edited (hard rule per Q3-Q8 of
AgentOps-2c DECISION). No
executable runner / shell script
/ config / cron / hook file
created anywhere. No collector
invocation. No LLM call. No new
npm dependency. No manual deploy.
**No harness implementation. No
Playwright run. No report
generation. No baseline artifact.
No screenshot. No
`.agent/regression_runs/`
directory.**

## Required fixes

`none`

Scope is clean (3 paths, all
approved), memo hits every
structural requirement (22
top-level sections + Status
header = 23 grep count, 1420
lines, 14 open decisions above
the 12 required, 5-fixture
usage covered, 3-target-stage
strategy, 18-step harness flow,
3-bucket check layout, 3-tier
verdict, concrete thresholds,
nondeterminism strategy,
5-state Codex integration,
Claude Code boundary, required
/ optional / not-sufficient
buckets, failure handling,
security + privacy, 3e/3f/
later roadmap, single default
in §22), the phased rollout is
appropriately conservative,
and no forbidden / red-zone /
pipeline / runner / OpenAI /
config / executable /
`.agent/scripts` / prompts /
runtime-selection / data path
was touched. All 34 TASK
acceptance criteria are
demonstrably met per
RUN_REPORT.

## Non-blocking follow-ups

- **After DECISION approval
  and push** → create/update
  daily summary. Extend
  `.agent/daily_summaries/2026-07-12_SUMMARY.md`
  (or create a fresh
  `2026-07-13_SUMMARY.md`)
  with an AgentOps-3d
  section documenting the 3
  commits, the memo's key
  recommendations, and the
  14 initial answers above.
- **Next default loop**:
  **AgentOps-3e minimal
  local Playwright
  regression prototype**.
- **AgentOps-3e should use
  one fixture only, likely
  Fixture A**.
- **AgentOps-3e should use
  Playwright CLI, not MCP**.
- **AgentOps-3e should
  target localhost only**.
- **AgentOps-3e should not
  promote a baseline**.
- **AgentOps-3e should not
  test production**.
- **AgentOps-3e should not
  auto-push or auto-deploy**.
- **AgentOps-3e should not
  edit `.agent/scripts/**`**
  unless separately approved
  (harness script lives
  under repo-root
  `scripts/`).
- **Do NOT implement the
  harness in this TASK.**
- **Do NOT run Playwright
  in this TASK.**
- **Do NOT run report
  generation in this
  TASK.**
- **Do NOT call
  Anthropic / OpenAI APIs
  in this TASK.**
- **Do NOT create baseline
  reports in this TASK.**
- **Do NOT create
  screenshots in this
  TASK.**
- **Do NOT create
  `.agent/regression_runs/`
  in this TASK.**
- **Do NOT implement Codex
  planner in this TASK.**
- **Do NOT create
  `.agent/planner_reports/`
  in this TASK.**
- **Do NOT modify
  `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline
  files.**
- **Do NOT run collector.**
- **Do NOT refresh corpus.**
- **Do NOT introduce
  OpenAI API** in
  Q7-blocked senses.
- **Do NOT modify GitHub
  Actions.**
- **Do NOT push until
  explicit human
  approval.**

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo.
   Stay on `main` of the pipeline
   repo.
2. Do NOT push either repo. The web
   repo will be ahead of origin/main
   by 3 commits at that point
   (`ac3b4cf` impl + `0d60bdc`
   RUN_REPORT + this DECISION); push
   requires Bohao's explicit
   "push AgentOps-3d" instruction.
   This push is user-visibly a
   NO-OP — `.agent/`-only.
3. Do NOT deploy manually. Vercel
   auto-deploy from the eventual
   push handles this, but produces
   no user-visible change.
4. Do NOT start AgentOps-3e yet.
5. Do NOT implement report
   regression harness.
6. Do NOT run Playwright.
7. Do NOT run report generation.
8. Do NOT call Anthropic / OpenAI
   APIs.
9. Do NOT create baseline reports.
10. Do NOT create screenshots.
11. Do NOT create
    `.agent/regression_runs/`.
12. Do NOT implement Codex
    planner.
13. Do NOT create
    `.agent/planner_reports/`.
14. Do NOT modify
    `.agent/scripts/**`. Hard
    rule per AgentOps-2c Q3-Q8.
15. Do NOT modify `src/**`.
16. Do NOT modify pipeline
    files.
17. Do NOT run collector. No
    `python -m scripts.collector
    …`, no `dry-run`, no
    `clean-preview`, no
    `run`.
18. Do NOT refresh corpus.
19. Do NOT modify GitHub
    Actions.
20. Do NOT modify runtime
    model selection
    (`src/app/api/**` stays
    frozen).
21. Do NOT modify prompts
    (`src/lib/prompts.ts`
    stays frozen).
22. Do NOT add any new npm
    dependency or
    `package.json` entry.
23. Do NOT lift any of the 3
    open blockers (BLK-0001 /
    BLK-0002 / BLK-0003)
    without explicit written
    human resolution.
24. Do NOT bundle 3e and 3f
    into one loop.

The next likely promote step is:
- `git push origin main` from
  the web repo (3 commits land
  on `origin/main`: `ac3b4cf` +
  `0d60bdc` + this DECISION).
  Vercel auto-deploys but
  produces no user-visible
  change.
- Then extend / create the
  daily summary with an
  AgentOps-3d section;
  commit + push.
- Then, per this DECISION's
  §non-blocking-followups,
  the natural next TASK is
  **AgentOps-3e minimal
  local Playwright
  regression prototype**.
  Bohao's explicit
  "start AgentOps-3e"
  message opens it.

Wait for Bohao's explicit
"push AgentOps-3d" before
doing anything state-
changing.
```

## Human approval needed

`yes` — required before:

- Web repo push
  (`origin/main` of
  `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which will deliver 3
  commits — `ac3b4cf`
  (impl), `0d60bdc`
  (RUN_REPORT), and this
  DECISION commit once it
  lands). This push
  triggers Vercel
  auto-deploy but is
  **user-visibly a no-op**
  — no runtime code path
  or product surface
  changed; only
  `.agent/`-only
  documentation lands.
- Authoring the daily
  summary cleanup commit.
- Starting AgentOps-3e,
  3f in any order.
- Any harness / runner /
  Playwright / planner
  implementation.
- Any pipeline file edit.
- Any `src/data/**` edit.
- Any collector run.
- Any corpus refresh.
- Any `.agent/scripts/**`
  mod.
- Any AgentOps-2* work
  (per Q10 pause).
- Any runtime model-
  selection change.
- Any prompt change.
- Any new npm dependency
  or `package-lock.json`
  change.
- Any G2.1d (red) work.
- Any OpenAI API usage
  in Q7 blocked sense.
- Any manual `vercel
  deploy`.
- Any
  `.agent/policies/**`
  or `.agent/templates/**`
  edit.
- Lifting any of the 3
  open blockers.

> Verdict is `approve` for
> technical execution
> captured in the
> RUN_REPORT + the
> 1420-line memo.
> Standing policy treats
> any `main` push as a
> human gate. This push is
> user-visibly a no-op —
> only `.agent/`
> documentation lands.
>
> Approving this DECISION:
>
> - Records the
>   AgentOps-3d memo as a
>   `reviewed_approved`
>   spec for the report
>   regression harness.
> - Endorses **Playwright
>   CLI for v1** (not
>   MCP).
> - Endorses **local-
>   first target strategy**
>   (Stage 1 only in v1).
> - Endorses **one-
>   fixture v1 prototype**
>   (Fixture A default).
> - Endorses the 3-bucket
>   v1 checks (structural
>   / fixture-specific /
>   operational) and the
>   three-tier verdict
>   algorithm.
> - Records the 14 §21
>   open-decision answers
>   above so future TASKs
>   can cite them by
>   number.
> - Records the
>   invariants: **red
>   blocks push**;
>   **amber escalates**;
>   **baseline promotion
>   through DECISION
>   only**;
>   **`.agent/scripts/**`
>   remains under hard
>   rule**;
>   **production never
>   auto-tested**.
> - Endorses
>   **AgentOps-3e ·
>   minimal local
>   Playwright regression
>   prototype** as the
>   natural next code
>   loop.
> - Records the
>   boundary:
>   "AgentOps-3e must
>   remain a separate
>   loop, not bundled
>   with 3d push".
>
> Approving does NOT
> approve: (a) starting
> AgentOps-3e yet, (b)
> implementing the
> harness in any form,
> (c) creating
> `.agent/regression_runs/`
> directly, (d) any
> production target,
> (e) any Playwright
> MCP, (f) any baseline
> promotion, (g) any
> prompt / model /
> API-route change, (h)
> any `.agent/scripts/**`
> mod, (i) any OpenAI
> API usage in
> Q7-blocked senses,
> (j) G2.1d, (k)
> lifting any of the 3
> open blockers, (l)
> bundling 3e + 3f
> into one loop.
> Each of those remains
> its own explicit
> human decision. The
> next step is Bohao's
> explicit call on the
> push.
