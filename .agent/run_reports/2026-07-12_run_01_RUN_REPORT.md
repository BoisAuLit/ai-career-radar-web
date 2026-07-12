# RUN REPORT · AgentOps-3c benchmark resume fixtures

> Authored by Claude Code after executing the TASK. Forms the input for the
> next DECISION file.

## Metadata

- **run_id**: `2026-07-12_run_01`
- **task**:
  `.agent/tasks/2026-07-12_run_01_TASK.md`
- **based_on_prior_decisions**:
  `.agent/decisions/2026-07-11_run_01_DECISION.md`
  (AgentOps-3b · endorsed 3c as
  default next code loop, strictly
  separate from 3d) ·
  `.agent/decisions/2026-07-08_run_01_DECISION.md`
  (AgentOps-3a · named the 5-fixture
  suite A-E in §7.2).
- **repo**:
  `/Users/bohaoli/Desktop/ai-career-radar-web`
- **pipeline_repo** (read-only sanity):
  `/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`
- **implementation_commit**: `bef155e`
- **status**: complete, awaiting DECISION
- **push_state**: NOT pushed; 1 web
  commit ahead of `origin/main` at
  impl-commit time → 2 after this
  RUN_REPORT commit lands.

## Objective (from TASK)

Create a small, stable synthetic
benchmark resume fixture suite (5
personas A-E + README) under
`.agent/regression_fixtures/` for
future real-report regression testing.
Green Markdown-only work. No LLM call,
no report generation, no Playwright,
no runner, no planner implementation.

## Files created

| file | purpose | size |
|---|---|---|
| `.agent/tasks/2026-07-12_run_01_TASK.md` | TASK spec | ~330 lines |
| `.agent/regression_fixtures/README.md` | Purpose · privacy · fixture list · harness usage · non-goals · versioning · expansion | ~140 lines |
| `.agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md` | Fixture A: senior backend SWE → Applied AI Engineer | Resume input 750 words |
| `.agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md` | Fixture B: full-stack product engineer → AI Product Engineer | Resume input 748 words |
| `.agent/regression_fixtures/benchmark_C_data_to_llm_infra.md` | Fixture C: data engineer → LLM Infrastructure Engineer | Resume input 732 words |
| `.agent/regression_fixtures/benchmark_D_ml_adjacent_to_agent_engineer.md` | Fixture D: ML-adjacent SWE → Agent Engineer | Resume input 702 words |
| `.agent/regression_fixtures/benchmark_E_enterprise_to_ai_transition.md` | Fixture E: traditional enterprise SWE → AI transition | Resume input 718 words |

Total: **7 new files** (TASK + README
+ 5 fixtures) under
`.agent/`-only paths.

## Fixture directory

`.agent/regression_fixtures/`
(newly created; not previously
present in the repo).

## Summary of each benchmark A-E

### Fixture A · Senior backend SWE → Applied AI Engineer

- **Persona**: 8 years production
  backend / platform experience.
  Owned checkout billing platform,
  SRE playbooks, feature-flag
  framework, incident response.
  Limited LLM depth: prototyped
  support-assistant + weekly-PR
  summarizer but never
  productionized.
- **Target role**: Applied AI
  Engineer at a frontier AI product
  company building customer-facing
  LLM features (RAG + evals +
  prompt engineering + model
  behavior debugging).
- **Primary gap theme**: production
  RAG + LLM evals + prompt/model
  debugging.
- **Intended difficulty**: medium.
- **Useful for future regression
  testing because**: canonical
  "strong senior engineer, weak
  applied-AI operational depth"
  case. Tests whether the report
  correctly recognizes production-
  ownership signal, avoids
  recommending beginner Python
  courses, and produces concrete
  RAG/eval next-step language.

### Fixture B · Full-stack product engineer → AI Product Engineer

- **Persona**: 6 years product-
  shipping across consumer + B2B
  SaaS. React/Next.js/Node/A/B
  testing/analytics fluency. Some
  LLM prototype exposure but no
  eval loop shipped.
- **Target role**: AI Product
  Engineer at an AI-first Series
  B/C scaleup — workflow
  automation + agentic product
  features.
- **Primary gap theme**: agent
  design + tool calling + eval
  loops + LLM failure-mode
  debugging.
- **Intended difficulty**: medium.
- **Useful for future regression
  testing because**: covers the
  product-eng → AI-product
  transition. Tests whether the
  report distinguishes
  `applied_ai` vs
  `agent_engineering` archetype
  language and recommends
  concrete agentic-demo work.

### Fixture C · Data engineer → LLM Infrastructure Engineer

- **Persona**: 7 years pipeline +
  serving platform experience.
  Spark, Flink, dbt, Kafka,
  Kubernetes, Postgres-backed
  serving APIs. Some vLLM +
  pgvector local tinkering. No
  production GPU serving or
  model gateway owned.
- **Target role**: LLM
  Infrastructure Engineer —
  retrieval, serving, model
  gateway, eval platform.
- **Primary gap theme**: low-
  latency serving + embeddings
  infra + retrieval infra +
  model routing + eval infra.
- **Intended difficulty**:
  medium-hard.
- **Useful for future regression
  testing because**: exercises
  the `llm_infra` archetype +
  the "translate pipeline
  reliability into LLM infra
  reliability" story. Tests
  whether the report avoids
  suggesting "learn SQL" and
  correctly flags the GPU +
  KV-cache gap.

### Fixture D · ML-adjacent SWE → Agent Engineer

- **Persona**: 6 years ML
  tooling + internal-tools
  engineering. Feature stores,
  labeling tools, notebook-to-
  production CLI, MLflow
  registry. Some weekend
  tool-calling prototypes.
  Limited stateful-agent
  production experience.
- **Target role**: Agent
  Engineer building reliable
  tool-using agents for
  business workflows.
- **Primary gap theme**:
  stateful agent orchestration
  + tool schemas + evals +
  reliability + human-in-the-
  loop.
- **Intended difficulty**:
  medium.
- **Useful for future regression
  testing because**: covers
  the `agent_engineering`
  archetype cleanly. Tests
  whether the report
  identifies tool-schema
  discipline + agent-eval
  patterns + reliability
  under concurrent tool
  calls.

### Fixture E · Traditional enterprise SWE → AI transition

- **Persona**: 9 years enterprise
  Java / Spring / Oracle DB /
  IBM MQ. Migration playbooks,
  contract testing, mutation
  testing, regulator audits.
  Minimal AI experience — one
  200-line Python side script
  using a hosted LLM API.
- **Target role**: Software
  Engineer transitioning into
  Applied AI / AI Engineer
  roles.
- **Primary gap theme**:
  foundational AI stack —
  Python AI ecosystem + LLM
  APIs + embeddings + RAG +
  evals + AI product
  experience.
- **Intended difficulty**:
  hard.
- **Useful for future regression
  testing because**: tests
  whether the report avoids
  being condescending about
  enterprise Java, respects
  the candidate's explicit
  "I know I'm behind" framing,
  and recommends a staged 4-8
  week transition project
  rather than "learn
  everything first" paralysis.

## Privacy and safety statement

- **All 5 fixtures are fully
  synthetic.** No real person's
  résumé content, no real
  personal identifiers.
- **No real names** — no
  candidate-named individuals in
  any fixture. Company names are
  synthetic (Northstar Systems,
  Atlas Retail Cloud, Meridian
  DataWorks, Halcyon Health,
  Beacon Analytics, Cascade
  Digital, Ridgeline Foundry,
  Solstice Labs, Silverleaf
  Assurance Systems, Braxton
  Care Systems).
- **No real email addresses**
  (`@gmail`, `@hotmail`,
  `@yahoo`, `@arthur130237` all
  return zero hits across the
  fixture directory).
- **No real phone numbers, no
  real addresses.**
- **No Bohao (project author)
  résumé content** — the
  README's single mention of
  "No Bohao" is a *disclaimer*
  ("no Bohao resume content
  included"), not attribution.
- **No user private data.**
- **No generated reports, no
  screenshots, no LLM
  output.** Fixtures are
  strictly *inputs*.
- **No API calls, no LLM
  invocations, no
  Playwright** performed by
  this loop.

## Validation results

### Directory + file inventory

```
$ ls .agent/regression_fixtures/
README.md
benchmark_A_backend_to_applied_ai.md
benchmark_B_fullstack_to_ai_product.md
benchmark_C_data_to_llm_infra.md
benchmark_D_ml_adjacent_to_agent_engineer.md
benchmark_E_enterprise_to_ai_transition.md
```

Six files total: 1 README + 5
fixtures. Matches the TASK's
allowed-files list exactly.

### Per-fixture Resume-input body word count

Measured as the block between
`## Resume input` and
`## Expected strengths`:

| fixture | words | in-band (700-1100)? |
|---|---|---|
| A | 750 | ✅ |
| B | 748 | ✅ |
| C | 732 | ✅ |
| D | 702 | ✅ |
| E | 718 | ✅ |

All 5 fixtures comfortably within
the 700-1100 target. Nothing near
the 1100 upper cap.

### Grep hit counts (each expected: 5)

```
$ grep -R "^- synthetic: true" .agent/regression_fixtures | wc -l
5

$ grep -R "^## Resume input" .agent/regression_fixtures | wc -l
5

$ grep -R "^## Target role input" .agent/regression_fixtures | wc -l
5

$ grep -R "^## Must not happen" .agent/regression_fixtures | wc -l
5

$ grep -R "^## Expected strengths" .agent/regression_fixtures | wc -l
5

$ grep -R "^## Expected gaps" .agent/regression_fixtures | wc -l
5

$ grep -R "^## Regression notes" .agent/regression_fixtures | wc -l
5

$ grep -R "^## Expected high-leverage next action" .agent/regression_fixtures | wc -l
5
```

All 8 required heading + metadata
grep patterns return exactly 5
matches (one per fixture).
`^-` anchor on the metadata grep
excludes the README's fixture-list
mentions.

### Personal-data scan

```
$ grep -R -E "@gmail|@hotmail|@yahoo|arthur130237" .agent/regression_fixtures
(no output)
```

The scan produces no output. The
earlier "Bohao" hit was the
README's disclaimer line "No
Bohao (project author) resume
content is included", which is a
declaration of absence, not
identifying content.

### Diff audit

```
$ git status --short (before RUN_REPORT commit)
?? .agent/regression_fixtures/
?? .agent/tasks/2026-07-12_run_01_TASK.md

$ git diff --name-only origin/main..HEAD (after impl commit bef155e)
.agent/regression_fixtures/README.md
.agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md
.agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md
.agent/regression_fixtures/benchmark_C_data_to_llm_infra.md
.agent/regression_fixtures/benchmark_D_ml_adjacent_to_agent_engineer.md
.agent/regression_fixtures/benchmark_E_enterprise_to_ai_transition.md
.agent/tasks/2026-07-12_run_01_TASK.md
```

Exactly the 7 expected paths. After
this RUN_REPORT commits, 8 paths
under `.agent/`-only.

## Forbidden-file audit

Verified against `git diff
--name-only origin/main..HEAD` for
the AgentOps-3c impl commit scope
(`bef155e`).

| bucket | status |
|---|---|
| `src/**` | ✓ CLEAN |
| `src/data/**` | ✓ CLEAN |
| `src/lib/**` | ✓ CLEAN |
| `src/app/api/**` | ✓ CLEAN |
| **`.agent/scripts/**` (hard rule)** | ✓ CLEAN |
| `.agent/policies/**` | ✓ CLEAN |
| `.agent/templates/**` | ✓ CLEAN |
| `.agent/blockers.md` | ✓ CLEAN |
| `.agent/automation_queue.md` | ✓ CLEAN |
| `.agent/planner_reports/**` | ✓ CLEAN (still empty; no file created) |
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

## Confirmation — no runtime work done

- **No generated reports** created.
- **No screenshots** produced.
- **No report regression harness**
  implemented.
- **No LLM / API call** by this
  task (no `anthropic` /
  `openai` HTTP invocation).
- **No planner implementation.**
- **No `.agent/scripts/**`
  change** (hard rule).
- **No `src/**` change.**
- **No pipeline repo change.**
- **No collector run.**
- **No corpus refresh.**
- **No new npm dependency.**
- **No `.github/workflows/**`
  edit.**
- **No `package.json` /
  lockfile edit.**
- **No `.env*` /
  `vercel.json` /
  `.vercel/**` change.**
- **No manual `vercel
  deploy`.**
- **No push.**
- **No blocker resolved.**
  BLK-0001 / BLK-0002 /
  BLK-0003 all still
  `open`.
- **`.agent/planner_reports/`
  remains empty** — the
  AgentOps-3b memo's §14 mock
  is still embedded inside the
  memo, not spun out into a
  standalone file.
- **Playwright not invoked**
  by this loop.

## Acceptance criteria — all 27 items PASS

- [x] `.agent/regression_fixtures/`
      directory exists. ✓
- [x] `.agent/regression_fixtures/README.md`
      exists with all 7 required
      sections. ✓
- [x] All 5 fixture files A-E
      exist. ✓
- [x] Each fixture has 8-field
      Metadata. ✓
- [x] Each fixture contains all 7
      required section headers. ✓
- [x] Each fixture's Resume input
      body is 700-1100 words
      (A=750, B=748, C=732, D=702,
      E=718). ✓
- [x] Each fixture's Expected
      strengths has 4-6 items. ✓
      (All fixtures have 5.)
- [x] Each fixture's Expected
      gaps has 4-6 items. ✓
      (All fixtures have 5.)
- [x] All fixtures use synthetic
      company names only. ✓
- [x] No real emails, phone
      numbers, addresses, or
      personal identifiers. ✓
- [x] No fixture mentions Bohao
      (except README's
      disclaimer). ✓
- [x] No fixture contains
      generated report, screenshot,
      or LLM output. ✓
- [x] `grep synthetic: true` = 5. ✓
- [x] `grep ## Resume input` = 5. ✓
- [x] `grep ## Target role input`
      = 5. ✓
- [x] `grep ## Must not happen`
      = 5. ✓
- [x] No `src/**` files
      modified. ✓
- [x] No `src/data/**` files
      modified. ✓
- [x] No prompt / model / API
      files modified. ✓
- [x] No pipeline repo
      modification. ✓
- [x] No `.agent/scripts/**`
      diff. ✓
- [x] No
      `.agent/planner_reports/**`
      diff. ✓
- [x] No collector
      invocation. ✓
- [x] No LLM call. ✓
- [x] No new npm dependency. ✓
- [x] No push, no manual
      deploy. ✓
- [x] Pipeline HEAD
      `b019786` at start AND
      end. ✓

## Blockers touched: none

- **BLK-0001** (G2.1d) —
  still `open`.
- **BLK-0002** (full
  automation activation) —
  still `open`.
- **BLK-0003** (OpenAI API
  standing Q7-scoped) —
  still `open`.
- QUEUE-0002 (G2.1d) —
  still
  `blocked_pending_human`.

## Automation window activity

`none`. Automation-infra
remains paused per
AgentOps-2c Q10.

## Repo status

### Web

```
$ git log --oneline -6
bef155e Add benchmark resume fixtures   ← this loop (impl)
63e8979 Update daily summary for AgentOps-3b
4b99181 Add DECISION 2026-07-11_run_01
62aa016 Add RUN_REPORT 2026-07-11_run_01
3dfc6eb Add AgentOps-3b Codex planner spec
80b3247 Update daily summary for AgentOps-3a
```

Web ahead of `origin/main` by
**1 commit** at impl-commit
time. After this RUN_REPORT
commit lands the branch will be
ahead by **2 commits**.

### Pipeline

```
$ git status
On branch main · up to date with 'origin/main' · clean

$ git log --oneline -3
b019786 Add G2.1 taxonomy eval set
f833bfd Add G2.1 taxonomy spec
65c3f9b Daily automated collection · 2026-06-28
```

Pipeline **untouched**. HEAD =
`b019786` at run start AND end.

## Recommendation

**Human + ChatGPT review** this
RUN_REPORT + all 6 fixture files
→ then write DECISION via
`python .agent/scripts/new_decision.py
--task-id 2026-07-12_run_01`.

Suggested DECISION verdict shape:
`approve`, `human_approval_needed:
yes` (for the eventual push;
user-visibly a no-op —
`.agent/`-only, same class as
P2.0a, P2.1a, AgentOps-2b/2c/3a/3b
memos).

Approving this DECISION:

- Records the 5-fixture suite as
  `reviewed_approved` inputs for
  the future report regression
  harness.
- Endorses the privacy/safety
  posture (synthetic-only, no PII,
  no user résumé content).
- Endorses fixture versioning
  policy (README §6): fixture
  changes only through explicit
  TASK + RUN_REPORT + DECISION.
- Records the "no report
  generation in 3c" boundary the
  AgentOps-3b DECISION pinned.
- Endorses **AgentOps-3d ·
  report regression harness
  design memo** as the natural
  next code loop (memo-only,
  pins Playwright CLI vs MCP +
  verdict algorithm +
  thresholds).

Approving does NOT approve:
(a) starting AgentOps-3d yet —
each phase is its own TASK +
DECISION, (b) implementing the
Playwright harness in any form,
(c) implementing the Codex
planner, (d) running report
generation against the
fixtures, (e) any pipeline file
edit, (f) any bundle swap, (g)
any collector run, (h) any
prompt / model / API-route
change, (i) any
`.agent/scripts/**` mod, (j)
any OpenAI API usage in
Q7-blocked senses, (k) G2.1d,
(l) lifting any of the 3 open
blockers.
