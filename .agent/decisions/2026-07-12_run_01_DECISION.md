# DECISION · AgentOps-3c benchmark resume fixtures

> Authored by ChatGPT (human-mediated) after
> reading the RUN_REPORT, the README, and all
> 5 fixture files. Scaffolded by
> `python .agent/scripts/new_decision.py
> --task-id 2026-07-12_run_01` (**twenty-
> second full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-12_run_01_DECISION`
- **based_on_run_report**:
  `.agent/run_reports/2026-07-12_run_01_RUN_REPORT.md`
- **based_on_prior_decisions**:
  `.agent/decisions/2026-07-11_run_01_DECISION.md`
  (AgentOps-3b · endorsed 3c as default
  next code loop, strictly separate from
  3d) ·
  `.agent/decisions/2026-07-08_run_01_DECISION.md`
  (AgentOps-3a · named the 5-fixture
  suite A-E in §7.2).

## Verdict

`approve`

## Reasoning summary

AgentOps-3c successfully creates the
**first stable synthetic benchmark resume
fixture suite** for future real-report
regression testing. The task is
appropriately scoped as **green and
Markdown-only**. It creates a README plus
**five differentiated synthetic benchmark
resumes A-E** under
`.agent/regression_fixtures/`:

- **A** senior backend SWE → Applied AI
  Engineer,
- **B** full-stack product engineer → AI
  Product Engineer,
- **C** data engineer → LLM
  Infrastructure Engineer,
- **D** ML-adjacent SWE → Agent
  Engineer,
- **E** traditional enterprise SWE →
  Applied AI / AI transition.

Each fixture includes an 8-field
metadata block plus seven structural
sections (Target role input, Resume
input, Expected strengths, Expected
gaps, Expected high-leverage next
action, Regression notes, Must not
happen). The fixtures are **synthetic**,
**privacy-safe**, and **stable enough
to become future inputs** for the
report regression harness scoped in
AgentOps-3d (design) and 3e (prototype).

**No report generation, no LLM / API
call, no Playwright harness, no
planner implementation, no runtime
source changes, no
`.agent/scripts/**` changes, no
pipeline changes, no collector /
corpus refresh, no OpenAI API in
Q7-blocked senses, no GitHub Actions
changes, no push / deploy occurred**.

Independent verification against the
local tree (both commits: `bef155e` +
`e34ca4c`):

- **Scope** (`git diff --name-only
  origin/main..HEAD`) = exactly the 8
  approved paths (1 TASK + 1 README +
  5 fixtures + 1 RUN_REPORT).
- **README** contains the 7 required
  sections (Purpose · Privacy and
  safety · Fixture list · How future
  harness should use these fixtures ·
  What these fixtures are not ·
  Versioning policy · Future
  expansion). The Versioning policy
  (§6) pins "fixture changes only
  ship through explicit TASK +
  RUN_REPORT + DECISION loop — no
  drive-by edits" and `version: 1`
  on all fixtures.
- **5 fixtures** each contain the
  8-field metadata (`fixture_id`,
  `version`, `synthetic: true`,
  `target_transition`, `target_role`,
  `intended_difficulty`,
  `primary_gap_theme`,
  `last_updated`) and the 7 required
  H2 sections.
- **Word-count band**: all 5 Resume
  input bodies land inside the
  700-1100 target (A=750, B=748,
  C=732, D=702, E=718).
- **Structural counts**: Expected
  strengths and Expected gaps each
  hold 5 items per fixture (within
  the 4-6 spec band).
- **Grep sanity**: all 8 required
  patterns return exactly 5 matches
  each; `^- synthetic: true`
  matches all 5 fixture metadata
  blocks with the plain-text
  format (not `` `true` `` — the
  earlier backtick formatting was
  swept before commit).
- **Privacy scan**: `grep -R -E
  "@gmail|@hotmail|@yahoo|arthur130237"
  .agent/regression_fixtures`
  returns zero hits. The single
  "Bohao" mention in the README is
  a declaration of absence ("No
  Bohao (project author) résumé
  content is included"), not
  attribution.
- **Synthetic company names**:
  Northstar Systems, Atlas Retail
  Cloud, Meridian DataWorks,
  Halcyon Health, Beacon
  Analytics, Cascade Digital,
  Ridgeline Foundry, Solstice
  Labs, Silverleaf Assurance
  Systems, Braxton Care Systems —
  all fictional. No real user's
  résumé content is quoted.
- **Forbidden empty diffs**:
  `src/**` ✓, `src/data/**` ✓,
  `src/lib/**` ✓, `src/app/api/**`
  ✓, `.agent/scripts/**` ✓
  (**hard rule**),
  `.agent/policies/**` ✓,
  `.agent/templates/**` ✓,
  `.agent/blockers.md` ✓,
  `.agent/automation_queue.md`
  ✓, **`.agent/planner_reports/**`
  ✓ (still empty — the
  AgentOps-3b memo's §14 mock
  remains embedded)**,
  `.github/workflows/**` ✓,
  `package.json` ✓,
  `package-lock.json` ✓,
  `.env*` ✓, `vercel.json` /
  `.vercel/**` ✓.
- **Pipeline repo** untouched —
  HEAD `b019786` at start AND
  end.
- **No collector invocation**.
  **No LLM call** by this task
  (no `anthropic` / `openai` HTTP
  invocation).
- **No new npm dependency**.
- **No runner / daemon / cron /
  scheduler / GH Actions / Codex
  config / Claude config /
  OpenAI SDK / manual deploy**
  anywhere.
- **Queue + blockers**:
  `automation_queue.md` and
  `blockers.md` not touched.
  QUEUE-0002 still
  `blocked_pending_human` red.
  BLK-0001 / BLK-0002 / BLK-0003
  all still `open`.

All 27 TASK acceptance criteria are
demonstrably met per RUN_REPORT.
Approving on technical execution +
fixture quality. Push to `origin/main`
remains a separate human-approval
gate. This push is **user-visibly a
no-op** — `.agent/`-only.

## Approved direction

- **Approve AgentOps-3c benchmark
  resume fixtures.**
- **Keep these fixtures as stable
  benchmark inputs** for future
  report regression testing (README
  §1 + §6).
- **Do not modify fixtures
  casually.** Future fixture edits
  require **explicit TASK +
  RUN_REPORT + DECISION** loop; no
  drive-by edits (README §6
  Versioning policy). A cosmetic
  typo fix does not require a
  version bump; a semantic change
  (target role, persona shape,
  primary gap theme) does.
- **Use these fixtures later in
  AgentOps-3d / 3e** to design and
  prototype report regression
  testing. The harness reads
  fixtures + drives the deployed
  product; the fixtures themselves
  do not run the product.
- **Do NOT run report generation
  in this task.** Baselines are
  established by the first
  harness run after 3e ships,
  not now.
- **Do NOT implement report
  regression harness in this
  task.**
- **Default next loop after
  push / cleanup**:
  **AgentOps-3d · report
  regression harness design
  memo** (yellow-adjacent, memo-
  only, pins Playwright CLI vs
  MCP + verdict algorithm +
  per-check thresholds).
- **AgentOps-3d must remain a
  separate loop** and should NOT
  be bundled with pushing
  AgentOps-3c.

## Fixture summary

- **A — senior backend SWE →
  Applied AI Engineer**: tests
  whether the report recognizes
  strong production / backend
  skill while identifying **RAG
  + eval + prompt/model debugging
  gaps**. Baseline
  characteristics: 8-year
  production ownership;
  distributed-systems fluency;
  concrete-but-toy LLM
  exposure. Intended difficulty:
  medium.
- **B — full-stack product
  engineer → AI Product
  Engineer**: tests whether the
  report recognizes
  product / UX / shipping
  strengths while identifying
  **agent design + tool calling
  + eval loops + LLM reliability
  gaps**. Baseline: 6-year
  frontend/backend shipping;
  A/B testing + analytics
  discipline; workflow-
  suggestions beta with no eval
  loop. Intended difficulty:
  medium.
- **C — data engineer → LLM
  Infrastructure Engineer**:
  tests whether the report
  recognizes **data-pipeline
  strength** while identifying
  **serving + embeddings infra
  + retrieval + model gateway +
  eval platform gaps**.
  Baseline: 7-year pipeline
  ownership; Kafka + Flink +
  Kubernetes; some
  vLLM + pgvector local
  tinkering; no production GPU
  serving. Intended difficulty:
  medium-hard.
- **D — ML-adjacent SWE →
  Agent Engineer**: tests
  whether the report recognizes
  **ML tooling + Python
  strengths** while identifying
  **stateful agent
  orchestration + tool schemas
  + human-in-the-loop + safety
  + eval gaps**. Baseline:
  6-year ML tooling; feature
  stores + labeling tools +
  notebook-to-production CLI;
  weekend agent prototypes.
  Intended difficulty: medium.
- **E — traditional enterprise
  SWE → AI transition**: tests
  whether the report is **fair
  but clear** for a strong
  non-AI enterprise SWE and
  recommends **a staged AI
  transition path** without
  being condescending.
  Baseline: 9-year Java /
  Spring / Oracle DB / IBM MQ;
  contract testing + mutation
  testing + regulator audits;
  200-line Python side script.
  Intended difficulty: hard.

## Risks found

1. **Fixtures are synthetic and
   may not cover all real user
   profiles.** Severity:
   **acceptable by design** —
   synthetic-only is a privacy
   requirement (README §2).
   Mitigation: real-user
   feedback loops via feedback
   mailto stay orthogonal;
   fixtures exist to detect
   *regressions*, not to
   *prove breadth*.
2. **Five fixtures are a good
   v1 but not enough for
   long-term report-quality
   assurance.** Severity:
   **acceptable**. Mitigation:
   README §7 pins expansion
   through separate
   scope-and-approve loops
   (AgentOps-3g or similar).
   No completeness anxiety
   this loop.
3. **Fixture quality can
   affect future regression
   conclusions**, so careless
   edits would be risky.
   Severity: **medium**.
   Mitigation: README §6
   Versioning policy pins
   the edit-through-DECISION
   requirement; `version: 1`
   pinned on every fixture so
   future edits force
   deliberate version-bump
   discipline.
4. **Future harness must not
   overfit to these five
   fixtures.** Severity:
   **medium**. Mitigation:
   AgentOps-3d design memo
   should include a "harness
   generalization" section;
   AgentOps-3a §7.4 future
   checks (rubric score,
   diff vs baseline) are
   inherently
   fixture-shape-agnostic.
5. **These fixtures do not
   yet generate reports or
   baselines.** Severity:
   **n/a by design** —
   baselines are 3e/3f
   scope.
6. **These fixtures do not
   yet test quote
   integrity.** Severity:
   **n/a by design** —
   Candidate 2 handles quote
   integrity independently.
7. **These fixtures do not
   yet test report quality
   automatically.**
   Severity: **n/a by
   design** — that's 3e's
   scope.
8. **These fixtures do not
   yet measure cost or
   latency.** Severity:
   **n/a by design** —
   cost/latency measurement
   is 3e telemetry scope.
9. **Future report
   comparisons will be
   nondeterministic once LLM
   calls are introduced.**
   Severity: **medium**.
   Mitigation: AgentOps-3a
   §7.3 structural checks +
   §7.4 rubric-based checks
   are designed for
   nondeterministic
   comparison; naive text
   diff is off the table.
10. **Generated report
    artifacts should not be
    committed wholesale**
    without a separate
    storage policy.
    Severity: **medium**.
    Mitigation: AgentOps-3a
    DECISION answer #7 +
    AgentOps-3b DECISION
    answer #7 both pin
    "summaries only
    committed; full
    artifacts external".
    AgentOps-3d design memo
    will re-confirm.
11. **Future Playwright
    harness must remain
    separate and explicitly
    approved.** Severity:
    **hard rule**.
    Mitigation: no
    Playwright code lands
    until AgentOps-3e's
    TASK + DECISION opens
    it; even then, one
    fixture first per
    AgentOps-3a DECISION
    answer #4.
12. **Future regression
    harness must use
    structural / rubric
    checks, not naive text
    diff alone.**
    Severity: **medium**.
    Mitigation: AgentOps-
    3a §7.3 + §7.4 pin
    the check families.
    AgentOps-3d will
    finalize thresholds.
13. **Fixture expansion
    should remain
    synthetic and privacy-
    safe.** Severity:
    **hard rule**.
    Mitigation: README §7
    reiterates.
14. **No production
    testing should be
    triggered by these
    fixtures alone.**
    Severity: **hard
    rule**. Mitigation:
    AgentOps-3a DECISION
    answer #2 pins
    "production-target
    harness only with
    explicit per-run
    approval"; fixtures
    themselves don't
    trigger anything.
15. **BLK-0001 / BLK-0002
    / BLK-0003 remain
    open and unaffected.**
    This DECISION does
    not lift any of them.
    Severity: **hard
    rule**.

## Red-zone flags

`none` for AgentOps-3c.

No `src/lib/prompts.ts`, no
`src/lib/anthropic.ts` (not
present), no `src/data/web_bundle.json`,
no `src/lib/corpus.ts`, no
`src/app/api/**`, no `package.json`,
no `package-lock.json`, no
`.env*`, no `vercel.json`, no
`.vercel/**`, no
`.github/workflows/**` changed. No
pipeline-repo file changed at all.
No Codex CLI config, Claude Code
config, or OpenAI SDK introduced.
No `.agent/scripts/**` edited
(hard rule per Q3-Q8 of
AgentOps-2c DECISION). No
executable runner / shell script /
config / cron / hook file created
anywhere. No collector invocation.
No LLM call. No new npm
dependency. No manual deploy. **No
planner implementation. No
`.agent/planner_reports/**`
file. No report generation.
No Playwright harness. No
benchmark baseline reports.**

## Required fixes

`none`

Scope is clean (8 paths, all
approved), the fixtures hit every
structural requirement (5 fixtures
× 8 metadata fields × 7 body
sections; Resume input bodies all
in 700-1100 band; 5 items each in
Expected strengths and Expected
gaps; grep sanity 5/5 on all 8
required patterns; personal-data
scan 0 hits), the privacy posture
is explicit (README §2 +
Versioning §6), and no forbidden /
red-zone / pipeline / runner /
OpenAI / config / executable /
`.agent/scripts` / prompts /
runtime-selection / data path was
touched. All 27 TASK acceptance
criteria are demonstrably met per
RUN_REPORT.

## Non-blocking follow-ups

- **After DECISION approval and
  push** → create/extend the daily
  summary. Extend
  `.agent/daily_summaries/2026-07-12_SUMMARY.md`
  with an AgentOps-3c section
  documenting the 3 commits (impl,
  RUN_REPORT, this DECISION), the
  5 personas, and the "3d is
  next" direction.
- **Next default loop**:
  **AgentOps-3d · report
  regression harness design
  memo**.
- **AgentOps-3d should design
  how the harness uses these
  fixtures** — mechanically (which
  Playwright locators + fill
  patterns), semantically (which
  §7.3 / §7.4 checks apply to
  which fixture), and
  operationally (verdict
  computation + threshold table
  + baseline storage).
- **Later**: **AgentOps-3e ·
  local Playwright regression
  prototype**, starting with
  one fixture (per AgentOps-3a
  DECISION answer #4).
- **Do NOT run report
  generation in this task.**
- **Do NOT create baseline
  reports in this task.**
- **Do NOT implement
  Playwright harness in this
  task.**
- **Do NOT implement Codex
  planner in this task.**
- **Do NOT create
  `.agent/planner_reports/`
  in this task.**
- **Do NOT modify
  `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline
  files.**
- **Do NOT run collector.**
- **Do NOT refresh corpus.**
- **Do NOT introduce OpenAI
  API** in Q7-blocked senses.
- **Do NOT modify GitHub
  Actions.**
- **Do NOT push until
  explicit human approval.**

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
   (`bef155e` impl + `e34ca4c`
   RUN_REPORT + this DECISION); push
   requires Bohao's explicit
   "push AgentOps-3c" instruction.
   This push is user-visibly a NO-OP
   — `.agent/`-only.
3. Do NOT deploy manually. Vercel
   auto-deploy from the eventual
   push handles this, but produces
   no user-visible change.
4. Do NOT start AgentOps-3d yet.
5. Do NOT implement report
   regression harness.
6. Do NOT run report generation.
7. Do NOT call Anthropic / OpenAI
   APIs.
8. Do NOT implement Codex
   planner.
9. Do NOT create
   `.agent/planner_reports/`.
10. Do NOT modify
    `.agent/scripts/**`. Hard
    rule per AgentOps-2c Q3-Q8.
11. Do NOT modify `src/**`.
12. Do NOT modify pipeline
    files.
13. Do NOT run collector. No
    `python -m scripts.collector
    …`, no `dry-run`, no
    `clean-preview`, no `run`.
14. Do NOT refresh corpus.
15. Do NOT modify GitHub
    Actions.
16. Do NOT modify runtime
    model selection
    (`src/app/api/**` stays
    frozen).
17. Do NOT modify prompts
    (`src/lib/prompts.ts` stays
    frozen).
18. Do NOT add any new npm
    dependency or `package.json`
    entry.
19. Do NOT lift any of the 3
    open blockers (BLK-0001 /
    BLK-0002 / BLK-0003) without
    explicit written human
    resolution.

The next likely promote step is:
- `git push origin main` from the
  web repo (3 commits land on
  `origin/main`: `bef155e` +
  `e34ca4c` + this DECISION).
  Vercel auto-deploys but
  produces no user-visible
  change.
- Then extend
  `.agent/daily_summaries/2026-07-12_SUMMARY.md`
  with an AgentOps-3c section;
  commit + push.
- Then, per this DECISION's
  §non-blocking-followups, the
  natural next TASK is
  **AgentOps-3d · report
  regression harness design
  memo**. Bohao's explicit
  "start AgentOps-3d" message
  opens it.

Wait for Bohao's explicit
"push AgentOps-3c" before doing
anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of
  `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which will deliver 3 commits —
  `bef155e` (impl), `e34ca4c`
  (RUN_REPORT), and this DECISION
  commit once it lands). This
  push triggers Vercel auto-
  deploy but is **user-visibly a
  no-op** — no runtime code path
  or product surface changed;
  only `.agent/`-only content
  (7 files: TASK + README + 5
  fixtures + RUN_REPORT) plus
  this DECISION lands.
- Authoring the daily summary
  cleanup commit.
- Starting AgentOps-3d, 3e, 3f
  in any order.
- Any Playwright harness
  implementation.
- Any planner implementation.
- Any pipeline file edit.
- Any `src/data/**` edit.
- Any collector run.
- Any corpus refresh.
- Any `.agent/scripts/**` mod.
- Any AgentOps-2* work (per
  Q10 pause).
- Any runtime model-selection
  change.
- Any prompt change.
- Any new npm dependency or
  `package-lock.json` change.
- Any G2.1d (red) work.
- Any OpenAI API usage in
  Q7 blocked sense.
- Any manual `vercel deploy`.
- Any `.agent/policies/**` /
  `.agent/templates/**` edit.
- Lifting any of the 3 open
  blockers (BLK-0001 /
  BLK-0002 / BLK-0003).

> Verdict is `approve` for
> technical execution captured in
> the RUN_REPORT + the 6 fixture
> files (README + 5 personas).
> Standing policy treats any
> `main` push as a human gate.
> This push is user-visibly a
> no-op — only `.agent/`
> documentation lands.
>
> Approving this DECISION:
>
> - Records the 5-fixture suite
>   (A-E) + README as
>   `reviewed_approved` inputs
>   for the future report
>   regression harness.
> - Endorses the privacy /
>   safety posture (synthetic-
>   only, no PII, no user
>   résumé content, synthetic
>   company names).
> - Endorses the versioning
>   policy (README §6):
>   fixture changes only
>   through explicit TASK +
>   RUN_REPORT + DECISION.
> - Records the "no report
>   generation in 3c"
>   boundary the AgentOps-3b
>   DECISION pinned and this
>   loop respected.
> - Endorses **AgentOps-3d ·
>   report regression harness
>   design memo** as the
>   natural next code loop.
> - Records the boundary:
>   "AgentOps-3d must remain
>   a separate loop and must
>   NOT be bundled with
>   pushing 3c".
>
> Approving does NOT approve:
> (a) starting AgentOps-3d yet
> — each phase is its own
> TASK + DECISION, (b)
> implementing the Playwright
> harness in any form, (c)
> implementing the Codex
> planner, (d) running report
> generation against the
> fixtures, (e) creating
> baseline reports, (f) any
> pipeline file edit, (g)
> any bundle swap, (h) any
> collector run, (i) any
> prompt / model / API-route
> change, (j) any
> `.agent/scripts/**` mod,
> (k) any OpenAI API usage
> in Q7-blocked senses, (l)
> G2.1d, (m) lifting any of
> the 3 open blockers, (n)
> any `.agent/policies/**`
> or `.agent/templates/**`
> edit. Each of those
> remains its own explicit
> human decision. The next
> step is Bohao's explicit
> call on the push.
