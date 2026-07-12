# Benchmark A · Senior backend SWE → Applied AI Engineer

## Metadata

- fixture_id: `A`
- version: `1`
- synthetic: true
- target_transition: `senior backend / platform SWE → Applied AI Engineer at a frontier AI product company`
- target_role: `Applied AI Engineer building customer-facing LLM features`
- intended_difficulty: `medium`
- primary_gap_theme: `production RAG + LLM evals + prompt/model debugging`
- last_updated: `2026-07-12`

## Target role input

Applied AI Engineer at a frontier AI product
company like Anthropic, Cohere, or a
similar frontier lab. I want to ship
customer-facing LLM features to production —
RAG retrieval + evals + prompt engineering +
model behavior debugging. I do NOT want to
do fundamental research and I do NOT want a
purely deploy-only infra role. My interest
is where the product surface meets the LLM,
not the training loop.

## Resume input

Backend / platform engineer with 8 years of
production experience across two mid-to-large
companies. Comfortable owning services from
design through incident response. Interested
in moving into applied AI work over the next
year.

EXPERIENCE

Senior Software Engineer · Northstar Systems ·
2020 - 2026 · 6 years
- Owned the checkout billing platform in Go
  and Kubernetes, processing ~1.2M orders per
  day at P99 sub-250ms. Ran the on-call
  rotation for 3 years; wrote 22 blameless
  incident retros during that tenure.
- Led migration from a monolith to five
  focused services, cutting incident count by
  60% year over year for two consecutive
  years. Managed a 14-month migration plan
  with 3 named rollback checkpoints and
  zero customer-visible outage windows.
- Designed and shipped a feature-flagging and
  gradual-rollout framework used by 40+
  engineers across the product org. Wrote
  the internal RFC template that became the
  eng-wide standard for architecture
  reviews.
- Built the internal metrics / logging /
  tracing SDK layered on top of OpenTelemetry
  and Prometheus; wrote the SRE playbooks
  and the cost-attribution dashboard that
  the finance team uses monthly.
- Started an internal book club on "LLM
  systems in production"; prototyped a
  document-retrieval assistant for the
  support team using an off-the-shelf vector
  store and a hosted embedding API. Never
  productionized because we couldn't agree on
  eval methodology — a gap I feel keenly.
- Owned the SLO / error-budget program
  across 8 services after a leadership
  hand-off; ratified the "stop-the-line"
  policy that pauses launches when
  error-budget burn crosses threshold.
- Represented the platform team in 12
  cross-org architecture reviews per year;
  drove three of them to explicit
  "not-now" decisions after cost-benefit
  analysis.
- Mentored four junior engineers on
  distributed-systems fundamentals and
  observability review; two are now
  mid-level with their own ownership
  scope.

Software Engineer · Atlas Retail Cloud · 2018
- 2020 · 2 years
- Owned the pricing service (Python 3, Django,
  Postgres, Redis) — median tail-latency
  reduction from 700ms to 90ms via async
  batching + cache-warm strategy. Wrote the
  service's capacity-planning model that
  finance still uses for headroom review.
- Shipped the internal A/B testing dashboard
  on top of Django admin; used by
  product managers for 30+ launches during my
  tenure. Reduced test-setup time from ~4
  hours to ~30 minutes.
- Wrote incident post-mortems that were
  reused as the org-wide template for
  blameless retros. Two of my post-mortems
  landed in the company-wide "reliability
  handbook" the SRE team maintains.
- Owned the Postgres schema-review process
  for the ecommerce team; reviewed ~90
  migrations without a production
  regression during my two years.

SKILLS

- Languages: Go (6y), Python (8y), TypeScript
  (3y, mostly internal tools), SQL.
- Runtime: Kubernetes (5y), Docker, Terraform,
  AWS (EC2/RDS/SQS/SNS/S3), GCP (BigQuery,
  GCS, Cloud Run).
- Data: Postgres (schema design +
  performance tuning), Redis, Kafka,
  ClickHouse for internal analytics, Spark
  for batch reporting.
- Observability: OpenTelemetry, Prometheus,
  Grafana, PagerDuty, SLO management.
- AI-adjacent side work: hosted embedding
  APIs (used from a Python service),
  pgvector for the support-assistant
  prototype, LangChain briefly for a demo,
  prompt iteration by hand in a notebook. No
  production LLM system I own.
- Practices: on-call rotation lead,
  incident-review facilitator, distributed-
  systems design reviews, migration
  planning, SRE mentorship.

PROJECTS (SIDE)

- Weekend read-through of the OpenAI /
  Anthropic prompt-engineering guides;
  wrote a short internal note comparing
  approaches to conditional / few-shot /
  chain-of-thought patterns and how they
  fail under long-context.
- Built a small CLI (~800 lines Python) that
  summarizes weekly PR queues using a
  hosted LLM API for personal use. Not
  shared publicly; had a bug for two months
  where it silently truncated large PRs and
  I only noticed when the summary got
  suspiciously short.
- Read "Designing Machine Learning Systems"
  and "Chip Huyen's AI Engineering" —
  taking notes but I have not shipped an
  eval harness or a RAG system in
  production.
- Attended two virtual meetups on LLM eval
  patterns; joined a small Discord group
  discussing groundedness metrics.

EDUCATION

- BSc Computer Science · A well-regarded
  state university · 2018.

WHAT I WANT NEXT

- I want to spend the next 6-12 months
  moving from strong backend infra
  ownership to an Applied AI role at a
  frontier product company. I don't want to
  do model training work; I want to ship
  LLM features that customers use — RAG,
  evals, prompt engineering, debugging the
  model's outputs against real data. I
  think my production discipline is a
  competitive advantage; I know I'm behind
  on the evals + retrieval + prompt-iteration
  operational depth that the target roles
  seem to expect.

## Expected strengths

- Deep production ownership: on-call,
  incident response, SLOs, migration planning
  — Applied AI teams need this and it's often
  scarce.
- Distributed-systems fluency: services at
  scale, queueing, storage — directly
  transfers to LLM serving + retrieval infra
  boundaries.
- Backend + Python + Go breadth: covers the
  common Applied AI stack.
- Mentorship + review culture: reads as a
  senior signal.
- Some concrete LLM exposure (support-
  assistant prototype + weekly-PR
  summarizer) so the transition isn't
  cold-start.

## Expected gaps

- No production RAG system owned end-to-end
  (retrieval quality, chunking strategy,
  reranking, freshness).
- No formal LLM eval harness (offline
  groundedness / specificity / actionability
  or equivalent).
- Limited prompt-iteration operational
  discipline — no prompt/experiment
  registry, no golden-set discipline.
- No vector-search depth (pgvector demo is
  toy-level; no ANN index tuning, no hybrid
  BM25+vector, no reranking).
- Model-behavior debugging: no experience
  with structured behavior tests or eval-
  gated rollouts.

## Expected high-leverage next action

A production-shaped applied-AI portfolio
project: build and deploy a customer-facing
RAG assistant on a small real dataset,
instrument it with a golden-set eval and a
minimal prompt-registry, ship it to a
public URL with `pgvector` + a hosted
embedding + a hosted generation API, and
write a short public retro on the eval
outcomes. Time-bound to 6-8 weeks.

## Regression notes

- Report should recognize that this
  candidate is **not a beginner** and
  avoid recommending "learn Python" or
  "read an intro book".
- Report must include per-gap evidence
  quotes from the supplied JDs.
- Report should NOT hallucinate that the
  candidate has shipped a production RAG
  system.
- Report should reference **applied_ai**
  archetype language explicitly.
- Report length band: 1500-6000 chars.
- Report must end with "Reassess in
  [N weeks] after you've shipped [X]".
- Cost budget per generation: ~$0.05
  (soft ceiling; harness records actual).
- Latency budget: 60s from click Generate
  to `stage === "done"`.

## Must not happen

- Claiming the candidate has NO backend
  experience.
- Recommending a beginner Python course.
- Naming a specific real company's internal
  stack as a fact (e.g. "Anthropic
  engineers ship on AWS") — this violates
  the prompt's forbidden training-data
  leakage rule.
- Trend claims like "RAG is rising" or
  "evals are growing in demand" — the
  corpus is a single point in time.
- Recommending research work
  (papers-first) — the target explicitly
  asks for applied.
- Empty sections or fewer than 5 gaps in
  the "top 5 gaps" section.
- The generation stream truncating without
  the Candidate 1 sentinel — if the
  incomplete banner appears, harness must
  mark **red**.
