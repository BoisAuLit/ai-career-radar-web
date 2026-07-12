# Benchmark C · Data engineer → LLM Infrastructure Engineer

## Metadata

- fixture_id: `C`
- version: `1`
- synthetic: true
- target_transition: `data engineer → LLM Infrastructure Engineer`
- target_role: `LLM Infrastructure Engineer working on retrieval, serving, model gateway, and evaluation platform`
- intended_difficulty: `medium-hard`
- primary_gap_theme: `low-latency serving + embeddings infra + retrieval infra + model routing + eval infra`
- last_updated: `2026-07-12`

## Target role input

LLM Infrastructure Engineer role at a
foundation-model or serving-infra company. I
want to work on the layer that sits under
customer-facing product code — retrieval
services, serving stacks, model gateways,
routing / fallback strategies, and the
internal evaluation platform. I do not want
model-training research; I want the systems
that make LLMs reliable in production.

## Resume input

Data engineer with 7 years of pipeline +
platform experience across a media analytics
company and a mid-size fintech. Comfortable
owning the ingest → transform → serve chain
for internal analytics and increasingly for
low-latency product surfaces.

EXPERIENCE

Senior Data Engineer · Beacon Analytics ·
2022 - 2026 · 4 years
- Owned the customer-facing analytics
  pipeline: 12 Spark jobs + 30 dbt models +
  a Postgres-backed serving API. Peak
  throughput ~2 TB/day. Ran the on-call
  rotation for the data platform for 2
  years and wrote 18 post-mortems that
  the SRE team now cites in cross-team
  training.
- Cut end-to-end freshness from 6 hours to
  35 minutes by re-architecting the ingest
  layer around Kafka + a small Flink job for
  windowed aggregations. The re-arch
  proposal RFC became the template the
  data team uses for major migrations.
- Built the data-quality contract system
  used to gate 40+ downstream reports; wrote
  the runbook + on-call rotation for
  data-pipeline incidents. The contract
  system caught 6 silent-bad-data
  incidents in its first 4 months.
- Wrote a small Kubernetes-native "job
  supervisor" (Python + kubectl SDK) that
  handled retries and back-off for the
  ingest workers. Ran in production for
  18 months with zero manual restart
  events.
- Introduced Great Expectations + Elementary
  as the standard for expectations +
  observability across the analytics team.
- Represented the data platform in the
  cross-org architecture review for the
  first production LLM feature the
  company shipped (a lightweight query-
  suggestion service). Was not the
  builder but wrote the reliability +
  observability requirements.
- Mentored 3 mid-level engineers on
  data-pipeline reliability + Spark
  performance tuning.

Data Engineer · Cascade Digital · 2019 -
2022 · 3 years
- Built the customer-360 warehouse (Airflow
  + dbt + BigQuery); 350+ tables at
  handover.
- Owned batch ETL for the campaign
  attribution pipeline; delivered 30-50%
  cost reduction through partition
  pruning + column pruning across the
  most-queried tables.
- Wrote the internal SQL style guide + the
  data-model review checklist.

SKILLS

- Batch: Spark (5y, PySpark + Spark SQL),
  Flink (2y), dbt (4y), Airflow (5y).
- Data warehouses: BigQuery, Snowflake,
  Postgres (analytics + OLTP), ClickHouse.
- Streaming: Kafka (3y, incl. Schema
  Registry + Debezium CDC), a bit of
  Kinesis.
- Serving: internal Postgres-backed API
  layers, one FastAPI service used as a
  metrics-serving endpoint at ~200 RPS.
- Cloud + infra: GCP (BigQuery + GKE + Pub/
  Sub), AWS (S3 + EMR + Kinesis + Redshift),
  Terraform, Kubernetes (comfortable, not
  deep on operator patterns).
- Python (7y, primarily services + Spark
  jobs + tooling), Scala (~1y, mostly Spark
  jobs), SQL fluently.
- Observability: OpenTelemetry-flavored
  tracing for the Python services, Grafana
  + Prometheus for infra, Great
  Expectations + Elementary for data.
- LLM-adjacent exposure: read through the
  vLLM + TGI serving docs; ran vLLM in a
  local test cluster for two weeks;
  installed pgvector on Postgres and
  benchmarked against Weaviate on a small
  corpus. No production serving stack owned.

PROJECTS (SIDE)

- Weekend prototype: a "SQL question
  answering" tool over the Beacon
  warehouse schema using a hosted LLM
  API + a small RAG index over dbt docs.
  Worked; retired after 3 weeks because
  I could not defend the retrieval-
  precision numbers to myself.
- Notes on the "Attention is All You Need"
  → Llama-family lineage. Understand the
  serving-layer constraints (KV cache,
  batching, quantization) at the level of
  a well-read reader, not an
  implementer.
- Comfortable reading vLLM / TGI / Triton
  source code for orientation, but I
  have not shipped a production model
  gateway or built a routing policy.
- Ran a local vLLM cluster on a spare
  workstation with two consumer GPUs
  for two weeks; measured throughput
  drops when the KV cache pressure
  crossed threshold. Notes-only; no
  productionization.
- Following the OpenLLMetry + LangSmith
  documentation to understand the eval-
  platform side; have not integrated
  either into a real service.

EDUCATION

- MSc Computer Science · a large public
  research university · 2019, thesis on
  distributed query planning.

WHAT I WANT NEXT

- Move from the batch + serving-side of
  the data platform into the LLM
  infrastructure layer. Retrieval infra,
  serving infra, evaluation platform,
  model routing. I already own the
  pipeline / observability / Kubernetes
  foundation the target role needs; I
  know I'm behind on the GPU / KV-cache
  / batching / eval-platform side. I
  want a role that lets me level up
  there while contributing on the
  reliability side from day one.

## Expected strengths

- Pipeline reliability + data-quality
  discipline: rare and valuable inside
  LLM infra teams that need per-
  version eval + regression tracking.
- Kubernetes + Terraform + Kafka
  foundation transfers cleanly to
  serving infra + model gateways.
- Observability practice: OpenTelemetry
  + Prometheus + Grafana + Great
  Expectations is directly useful for
  eval-platform + serving telemetry.
- Comfort with high-throughput /
  low-latency serving APIs on FastAPI
  and Postgres.
- Some concrete embeddings +
  serving-adjacent tinkering (pgvector +
  vLLM local) so not cold-start.

## Expected gaps

- No production GPU-serving experience:
  no KV-cache tuning, no batching /
  scheduling, no quantization strategy
  owned.
- No production vector DB / retrieval
  infra owned: pgvector + Weaviate
  benchmark was toy-level.
- No model-gateway design: routing,
  fallback, cost-based load shaping,
  circuit breakers.
- No production eval platform: no
  golden-set discipline, no A/B eval
  regressions caught before rollout.
- Limited exposure to the model-side
  half of the stack (weight
  management, embedding-model
  lifecycle, drift detection).

## Expected high-leverage next action

Build an embedding + retrieval + eval
service on a small realistic dataset:
FastAPI + pgvector for the retrieval,
a minimal reranker, a golden-set + a
groundedness eval, plus a public
dashboard showing rolling recall +
latency. Deploy behind a domain,
instrument with tracing, write a short
public retro. 6-8 weeks. This maps
onto the LLM-infra hiring signal
without needing a GPU cluster.

## Regression notes

- Report should recognize the pipeline
  foundation and NOT recommend "learn
  SQL" or "learn Python".
- Report should surface the archetype
  as `llm_infra` and lean into serving
  + retrieval language.
- Report should NOT hallucinate that
  the candidate has shipped a
  production GPU cluster or model
  gateway.
- Report length band: 1500-6000
  chars.
- Cost budget: ~$0.05.
- Latency budget: 60s.
- Reassess-in-[N-weeks] closing
  paragraph required.
- Every gap must have an evidence
  quote.

## Must not happen

- Recommending a beginner Python or
  SQL course.
- Naming a real inference-serving
  company's internal stack as fact
  (e.g. "Together AI runs on X").
- Trend claims ("KV-cache batching is
  rising").
- Empty sections.
- Recommending model training as the
  next action when target is
  explicitly infra.
- Copy that reads as generic career
  advice ("focus on your strengths")
  without concrete deliverables.
- Stream truncation without the
  Candidate 1 sentinel → mark red.
