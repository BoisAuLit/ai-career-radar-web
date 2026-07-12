# Benchmark D · ML-adjacent SWE → Agent Engineer

## Metadata

- fixture_id: `D`
- version: `1`
- synthetic: true
- target_transition: `ML-adjacent internal-tools SWE → Agent Engineer`
- target_role: `Agent Engineer building reliable tool-using agents for business workflows`
- intended_difficulty: `medium`
- primary_gap_theme: `stateful agent orchestration + tool schemas + evals + reliability + human-in-the-loop`
- last_updated: `2026-07-12`

## Target role input

Agent Engineer role at a company shipping
tool-using agents to real business
workflows. I want to build reliable agents
that call tools, keep state across a
session, degrade gracefully, and are
inspectable by humans. Willing to work
across the eval, tool-schema, and
reliability sides. Not looking for a
research role or a pure infra role.

## Resume input

ML-adjacent internal-tools engineer with 6
years of experience across a computer
vision startup and a mid-size ecommerce
company's ML platform team. Comfortable
being the SWE who makes ML researchers +
data scientists faster; interested in
moving into production agent engineering.

EXPERIENCE

Senior Software Engineer, ML Tooling ·
Ridgeline Foundry · 2022 - 2026 · 4 years
- Owned the internal experiment-tracking
  + model-registry service used by 25
  data scientists (Python, FastAPI,
  Postgres, Redis, S3, MLflow-flavored
  schema). Ran the biweekly office hours
  where researchers debugged their
  pipelines against the registry.
- Built the internal labeling tool used
  for weekly labeling sessions across 3
  product surfaces; ~40k annotations
  processed per month at peak. Designed
  the reviewer-disagreement UI that made
  gold-label quality inspectable for
  the first time.
- Shipped a feature store on top of
  Postgres + a small vector-search
  layer via pgvector, used by 8 batch +
  online ML services. Wrote the online-
  offline consistency test suite that
  runs on every deploy.
- Built the "notebook to production"
  workflow: a CLI that packages a
  notebook + a small config into a
  deployable service running on
  Kubernetes with retries + health
  checks. Adopted by 15 researchers.
  Reduced average time-from-notebook-
  to-staging from ~2 weeks to ~2 days.
- Wrote the internal Python style guide
  and a short "getting ML models to
  production" playbook that is now the
  team's onboarding baseline.
- Owned the retirement of two
  never-really-worked internal
  services after a cost review — hard
  but necessary, and became my model
  for "propose to delete before
  proposing to build".
- Mentored 3 research-side engineers
  on production-shaped Python.

Software Engineer · Solstice Labs (CV
startup) · 2020 - 2022 · 2 years
- Built the annotation-quality
  dashboard used to gate model
  releases; visualization + SQL over
  ClickHouse.
- Shipped an internal API for
  scheduling training jobs against a
  small on-prem GPU cluster; retries,
  spot-preemption handling, artifact
  linking.
- Wrote a small experiment-config DSL
  used across the CV team; adopted for
  ~200 experiments over 18 months.

SKILLS

- Python (6y): FastAPI, pydantic,
  SQLAlchemy, click, asyncio;
  comfortable with async patterns +
  worker pools.
- Data + ML tooling: MLflow,
  Weights & Biases (heavy user, but not
  admin), Optuna, DVC, feature-store
  patterns.
- Kubernetes (4y, comfortable): Helm,
  kustomize, operator patterns at a
  reader level.
- Cloud: AWS (S3, ECS, RDS, EKS), GCP
  (BigQuery, GCS, GKE).
- Databases: Postgres (schema design +
  performance tuning), Redis,
  ClickHouse for analytics.
- LLM-adjacent: prototyped a "code-
  review assistant" internal tool
  using a hosted LLM API + a small
  RAG index over the org's runbook
  wiki. Working but not production-
  hardened. Comfortable reading
  LangChain + LlamaIndex source at
  orientation level. No production
  tool-using agent I own.
- Human-in-the-loop: designed the
  reviewer UI for the labeling tool;
  used to seeing where humans
  disagree with model output.

PROJECTS (SIDE)

- Built a "PR reviewer agent" as a
  weekend project: 2 tool calls
  (fetch diff, fetch related files),
  a single LLM call, output as a
  Markdown comment. Runs manually on
  my machine, not shipped anywhere.
  Aware that the reliability posture
  (no retries, no idempotency, no
  eval) makes it a demo, not a
  production artifact.
- Notes on OpenAI's + Anthropic's
  function / tool-calling APIs;
  aware of the reliability failure
  modes (over-eager tool calls,
  premature stopping) at reader
  level. Have not built a golden
  runbook for any of them.
- Working through the "AI Engineering"
  book by Chip Huyen for the
  agent-eval discipline. Halfway
  through as of the past month.
- Following two open-source agent
  frameworks (LangGraph, AutoGen) at
  reader level; understand the state
  machine + tool-registry patterns
  but have not shipped anything
  against them.
- Small personal experiment:
  wrote a "browser-notes agent"
  with 3 tools over 2 weekends;
  killed it after realizing I
  had no way to grade its output
  besides eyeballing.

EDUCATION

- BSc Computer Science + Statistics
  minor · a large public university ·
  2020.

WHAT I WANT NEXT

- Move from internal-tools ML
  engineering into a role owning
  customer-facing agents. I want to
  own the design + reliability +
  eval of the agent, not just the
  tooling around it. I know I'm
  behind on stateful multi-step
  agent design, tool-schema
  discipline, agent-specific eval
  patterns, and reliability under
  concurrent tool calls.

## Expected strengths

- Deep familiarity with ML researcher
  workflows: helps the candidate
  design tool schemas + eval
  interfaces that data scientists
  will actually use.
- Feature-store + pgvector +
  labeling-tool background maps
  cleanly onto agent-eval + agent-
  observability infra.
- Python + FastAPI + async +
  worker-pool comfort is exactly the
  agent-runtime substrate.
- Human-in-the-loop instinct from
  the labeling-quality dashboard —
  rare and useful for agent
  reviewer UIs.
- Some concrete tool-calling
  prototypes (code-review + PR
  reviewer) so the transition isn't
  cold-start.

## Expected gaps

- No production stateful agent
  owned: no session-state pattern,
  no memory strategy, no plan/
  reflection loop.
- No tool-schema discipline: no
  versioned tool schemas, no
  contract tests against tool APIs,
  no drift handling.
- No agent-specific evals: no
  per-tool eval, no end-to-end
  workflow eval, no golden runbook
  set.
- Reliability: no experience with
  concurrent tool-call race
  conditions, retries with
  idempotency keys, fallback
  strategies for tool failures.
- Human-in-the-loop patterns for
  agents specifically (not just
  labeling): approvals, edit-
  before-execute, provenance.

## Expected high-leverage next action

Build a multi-tool agent for a real
business workflow (e.g. a
"customer-refund-triage" agent
calling 3-4 tools), include a
golden-runbook eval suite, add
fallback behavior for each tool
failure mode, ship to a public URL
with tracing + human-review UI,
write a short retro. 6-8 weeks. This
covers the tool-schema + eval +
reliability + human-in-the-loop
skill quadrant simultaneously.

## Regression notes

- Report should identify the
  archetype as `agent_engineering`
  and lean on tool-calling +
  orchestration language.
- Report should recognize the
  labeling-tool + feature-store
  background as directly relevant,
  not dismiss it as "just
  tooling".
- Report should NOT hallucinate
  that the candidate has shipped a
  production agent.
- Report length band: 1500-6000
  chars.
- Cost budget: ~$0.05.
- Latency budget: 60s.
- Reassess-in-[N-weeks] closing
  paragraph required.
- Evidence quotes per gap.

## Must not happen

- Recommending "learn Python" or
  "learn Kubernetes".
- Naming a specific real
  agent-focused company's internal
  orchestration framework as fact.
- Trend claims ("agents are the
  future").
- Empty sections.
- Recommending a research role or
  a data-science bootcamp — the
  target is explicitly agent
  engineering.
- Copy that overlaps with the
  sample-report page verbatim.
- Stream truncation without the
  Candidate 1 sentinel → mark red.
