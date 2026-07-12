# Benchmark E · Traditional enterprise SWE → AI transition

## Metadata

- fixture_id: `E`
- version: `1`
- synthetic: true
- target_transition: `traditional enterprise SWE → Software Engineer transitioning into Applied AI / AI Engineer roles`
- target_role: `Software Engineer transitioning into Applied AI / AI Engineer roles`
- intended_difficulty: `hard`
- primary_gap_theme: `foundational AI stack (Python AI ecosystem + LLM APIs + embeddings + RAG + evals + AI product experience)`
- last_updated: `2026-07-12`

## Target role input

I want to transition from a traditional
enterprise Java / Spring shop into an
Applied AI or AI Engineer role at a
mid-size or scaleup company. I know I have
strong reliability + maintainability
instincts and weak modern-AI-stack
exposure. I'm looking for a role that
values the durable engineering side while
being explicit that I need a 6-12 month
ramp on Python AI stack, LLM APIs,
embeddings, RAG, and eval discipline. I
would prefer a company that has an
existing junior/mid AI mentor rather than
a place expecting me to be senior on AI
from day one.

## Resume input

Enterprise software engineer with 9 years of
experience across a mid-sized insurance
group and a healthcare-adjacent B2B
company. Comfortable with regulated
environments, long integration cycles, and
long-lived systems. Interested in a
staged transition into Applied AI /
AI Engineer roles.

EXPERIENCE

Senior Software Engineer · Silverleaf
Assurance Systems · 2021 - 2026 · 5 years
- Owned the policy-lifecycle service
  (Java 17 + Spring Boot + Oracle DB +
  IBM MQ) for a mid-sized insurance
  group. 1.4M policies under management.
  Ran the on-call rotation for 3 years
  and wrote 25+ post-mortems that
  became the org's blameless-retro
  template.
- Led the migration off a 12-year-old
  monolith to a domain-per-service
  layout; the migration took 20 months
  and shipped without a customer-visible
  outage. Wrote the migration playbook +
  the phased rollout / rollback
  strategy with named per-phase
  rollback checkpoints.
- Introduced pact-based contract testing
  and mutation testing to the team;
  became the org's standard for
  regulated integrations. Wrote the
  internal training deck that all new
  hires now go through.
- Built the internal reliability
  dashboard on top of Grafana +
  Splunk-flavored logs; used by 6
  product teams during their
  post-incident retros.
- Represented the team in 8 regulator
  audits over 5 years; wrote the
  audit-trail specification the
  compliance team now uses across
  every product line.
- Owned the "third-party integration
  reliability" workstream — bounded
  every integration with a circuit
  breaker + retry policy + SLA
  telemetry.
- Mentored 6 junior engineers on
  domain-driven design + defensive
  programming for regulated
  workflows. Two became tech leads on
  other teams.

Software Engineer · Braxton Care Systems ·
2017 - 2021 · 4 years
- Built the claims-intake service
  (Java 11 + Spring + Postgres); ran the
  performance-tuning + capacity-planning
  workstream for two consecutive
  quarters.
- Owned the SSO + audit-trail
  integrations across three
  compliance-relevant products.
- Wrote the integration-test harness
  that became the org's standard.

SKILLS

- Languages: Java (9y, incl. Java 17 +
  Spring Boot 3), Kotlin (~1y), SQL
  fluently, Groovy for Gradle scripts.
  Python only at "read + tweak a
  script" level.
- Runtimes: JVM performance tuning
  (GC, heap profiling), Spring
  Framework, Micronaut briefly.
- Databases: Oracle DB (deep),
  Postgres, in-memory caches, IBM MQ
  + Kafka for enterprise
  integrations.
- Cloud: AWS at a "enterprise
  migration" level — VPCs, transit
  gateways, RDS, EKS, IAM, KMS,
  audit-log configurations. GCP
  familiarity at a reader level.
- Testing: JUnit + AssertJ +
  Testcontainers + Pact + mutation
  testing (PITest); wrote a lot of
  code review + review-culture
  material.
- Observability: Grafana + Splunk-
  flavored logs + JMX metrics.
  OpenTelemetry at a "started
  reading" level.
- Practices: incident response,
  contract testing, phased
  migration, compliance-friendly
  release trains, mentorship.
- AI-adjacent: none owned in
  production. Read Grus's "Data
  Science from Scratch" and the
  first two chapters of Chip Huyen's
  "AI Engineering". Wrote a small
  Python side script (200 lines) that
  batches Slack summaries via a
  hosted LLM API; used it once for a
  personal experiment. That's the
  entire body of hands-on LLM
  experience.

PROJECTS (SIDE)

- Working through a self-directed
  4-week "Python for enterprise
  engineers" reading list (mostly
  the standard library + FastAPI +
  pydantic + async patterns);
  building small CLIs to solidify
  the standard library + typing +
  packaging.
- Read the Anthropic + OpenAI
  intro docs on prompt
  engineering; wrote a personal
  page of notes and a small
  side-by-side comparison of
  their function-calling
  conventions.
- Aware of RAG at the "read a
  blog post" level. Have not
  implemented one but understand
  the retrieval-quality vs
  latency-cost tradeoffs at a
  conceptual level.
- Attended one online workshop on
  "LLM apps for enterprise
  engineers"; useful framing but
  no shipped artifact yet.
- Following two AI-adjacent
  newsletters and one podcast
  weekly; taking careful notes
  on where enterprise-style
  concerns (auditability,
  compliance, rollback) map onto
  LLM-app design.

EDUCATION

- BSc Software Engineering · a
  regional university · 2017.
- Various vendor certifications
  (Oracle DBA associate, AWS
  Solutions Architect Associate).

WHAT I WANT NEXT

- Move into an Applied AI / AI
  Engineer role over the next 6-12
  months. I'm realistic that I'm
  starting behind on the modern AI
  stack; I'm hoping the target
  employer values the reliability +
  compliance-friendly + long-lived-
  systems side enough to sponsor
  the ramp on the AI side. I do not
  want to make a research
  transition. I want to keep
  shipping.

## Expected strengths

- Durable engineering fundamentals:
  reliability, contract testing,
  compliance-friendly rollout —
  scarce inside fast-moving AI
  scaleups and directly
  transferable.
- Migration + rollback + phased-
  release muscle: valuable for
  gradual LLM-feature rollouts.
- Testing culture: Pact +
  Testcontainers + mutation
  testing translates directly to
  the eval-first / regression-
  gated posture LLM teams want.
- Mentorship of junior engineers
  reads as a senior signal.
- Some concrete LLM API exposure
  (Slack-summaries script) so not
  cold-start.

## Expected gaps

- No production Python AI stack
  experience (FastAPI + PyTorch
  ecosystem at a beyond-toy level).
- No embeddings / RAG owned in
  production.
- No LLM eval discipline shipped
  (offline eval, golden set,
  rubric-graded regression).
- No modern AI product experience:
  no prompt registry, no LLM
  observability, no cost /
  latency shaping owned.
- Limited hands-on with LangChain /
  LlamaIndex / hosted embeddings —
  needs to build the working
  vocabulary + operational
  intuition.

## Expected high-leverage next action

A staged 6-8 week transition project:
Week 1-2 build a text-only RAG demo
in FastAPI + `pgvector` + a hosted
embedding + generation API against a
small realistic dataset. Week 3-4
add an eval harness (golden set +
groundedness eval) with a public
dashboard. Week 5-6 deploy on
Fly.io + wire tracing +
cost/latency budgets + write a
public retro. Public GitHub +
deployed URL. Emphasis on
production-shape (rollback,
regression guard, cost telemetry)
that reflects the enterprise
background.

## Regression notes

- Report must NOT be excessively
  harsh — the target explicitly
  asks for a company that values
  the durable side.
- Report should recognize the
  reliability + testing +
  regulated-environment
  foundations as strengths, not
  liabilities.
- Report should identify
  foundational AI gaps clearly,
  including the specific "start
  with Python AI stack" step.
- Report should suggest a staged
  4-8 week project, not a
  "learn everything in AI first"
  paralysis.
- Report should reference
  `applied_ai` archetype language.
- Report length band: 1500-6000
  chars.
- Cost budget: ~$0.05.
- Latency budget: 60s.
- Reassess-in-[N-weeks] closing
  paragraph required.

## Must not happen

- Recommending "learn to program"
  or "learn Java" (candidate is a
  9-year veteran).
- Being condescending about the
  enterprise Java background.
- Naming a specific real
  insurance-tech or healthcare-
  tech company's internal AI
  stack as fact.
- Trend claims ("AI is booming").
- Empty sections or missing gap
  numbering.
- Recommending a full-time
  Master's degree as the primary
  next action.
- Copy that overlaps verbatim
  with the sample-report page.
- Stream truncation without the
  Candidate 1 sentinel → mark
  red.
