# Benchmark B · Full-stack product engineer → AI Product Engineer

## Metadata

- fixture_id: `B`
- version: `1`
- synthetic: true
- target_transition: `full-stack product engineer → AI Product Engineer at an AI-first scaleup`
- target_role: `AI Product Engineer building workflow automation and agentic product features`
- intended_difficulty: `medium`
- primary_gap_theme: `agent design + tool calling + eval loops + LLM failure-mode debugging`
- last_updated: `2026-07-12`

## Target role input

AI Product Engineer at an AI-first Series B
or C scaleup. I want to build user-facing
AI product features — workflow automation,
lightweight agentic behaviors, features
where the LLM's output becomes part of the
UI a user actually clicks through.
Adjacent-to-agent work is fine and
interesting. I'm not looking for
research-heavy or infra-only positions. I
care about product outcomes and shipping
speed.

## Resume input

Full-stack product engineer with 6 years of
end-to-end shipping experience across
consumer and B2B SaaS. Comfortable owning a
feature from PRD through analytics
retrospective. Interested in moving into an
AI-product-shaped role.

EXPERIENCE

Senior Product Engineer · Meridian
DataWorks · 2022 - 2026 · 4 years
- Shipped the onboarding experience for
  Meridian's flagship B2B analytics
  product; grew activation from 24% to 51%
  over 18 months through iterative UX +
  small backend improvements. Ran the
  weekly activation-metric review with
  product + design; drove 8 of the top-12
  identified onboarding fixes to ship.
- Owned the pricing-page and paywall
  experience, running 30+ A/B tests using
  a self-built experimentation harness on
  top of GrowthBook. Wrote the internal
  guide on "how to design a paywall test
  that won't lie to you".
- Prototyped an internal "workflow
  suggestions" feature that uses a hosted
  LLM to propose next-step actions inside
  a customer's dashboard. Shipped as a
  beta to 200 accounts; positive
  qualitative feedback, but no eval loop
  and no formal accuracy measurement.
  Retrospective: I now think the beta
  should not have shipped without at
  least a groundedness eval.
- Rewrote the frontend design system from
  a mishmash of one-off components to a
  Tailwind + Radix + shadcn-flavored kit
  used across three product surfaces.
  Reduced average page-ship time from
  ~3 days to ~1 day for new marketing
  routes.
- Owned the mobile-web performance
  workstream for two quarters; brought
  P75 LCP from 3.4s to 1.8s via
  bundle-splitting + image optimization
  + a small SSR migration.
- Ran the internal weekly product-eng
  guild; contributed to hiring loops for
  10 senior product-eng candidates.
- Presented "shipping AI features
  without an eval loop is a bug" at
  the internal all-hands after the
  workflow-suggestions beta.

Product Engineer · Halcyon Health · 2020 -
2022 · 2 years
- Built the patient-portal booking flow
  (React + Node + Postgres); 300k+ monthly
  active users at exit. Handled the
  HIPAA-adjacent audit-trail requirements
  end-to-end with the compliance team.
- Instrumented a full session-replay +
  event-tracking pipeline used to
  prioritize the top 20 UX issues each
  quarter. Wrote the internal "how to
  read session replay without lying to
  yourself" guide adopted by the whole
  product team.
- Shipped a small ML-adjacent feature:
  intent classification for support
  tickets, using a third-party classifier
  API. Not owned end-to-end; I integrated
  it but did not train or evaluate it.
- Owned the accessibility remediation
  workstream for the booking flow;
  brought WCAG audit findings from 47
  to 3 in a single quarter.

SKILLS

- Frontend: React (6y), Next.js (4y),
  TypeScript (5y), Tailwind, Radix,
  shadcn, tRPC, TanStack Query.
- Backend: Node.js (6y), Express, Fastify,
  Prisma, Postgres, Redis, background
  queues (BullMQ). Some Go for one small
  billing service.
- Product craft: Amplitude / Mixpanel /
  PostHog analytics, session replay,
  A/B testing (GrowthBook + custom
  harness), SQL for weekly product-metric
  digs.
- Cloud: AWS (Amplify, Lambda, RDS,
  Cognito), Vercel for personal projects.
- AI adjacent: prototyped the "workflow
  suggestions" feature above; used a
  hosted embedding + generation API from a
  Node service. Wrote prompts by hand.
  Have played with Cursor for weeks. No
  evals shipped, no tool-calling agents
  owned in production, no LLM
  observability I built.
- Design fluency: comfortable in Figma
  enough to pair with a designer without
  needing pixel handoffs.

PROJECTS (SIDE)

- Read through the Anthropic + OpenAI
  agent / tool-calling documentation over
  4 weekends. Notes-only; no shipped
  demo yet. Have working knowledge of the
  common failure modes (premature stop,
  over-eager tool call, hallucinated
  tool schema).
- Built a personal "meeting notes
  organizer" using Next.js + a hosted LLM
  API; used it for a month; never shared
  publicly. Discovered mid-project that
  I was silently dropping the last chunk
  of every transcript longer than 45
  minutes because of a lazy chunking
  heuristic.
- Casual reader of AI-eng newsletters
  (Latent Space, Simon Willison's blog);
  aware of the "evals matter" refrain but
  have not built one. Following a couple
  of open-source eval frameworks
  (promptfoo, phoenix) but have not
  wired them up.

EDUCATION

- BA Cognitive Science · a small liberal
  arts college · 2020. Minor in
  computer science.

WHAT I WANT NEXT

- Move into an AI Product Engineer role at
  a Series B or C AI-first company where
  I can pair the product-shipping
  instincts I already have with real
  agentic + eval + LLM-observability
  depth. I'm not chasing model training. I
  want to be the person who ships the
  feature the user actually clicks
  through — with the reliability +
  eval discipline the target teams
  demand.

## Expected strengths

- Product-shipping instinct across
  frontend + backend + analytics — rare
  and valuable in AI Product Engineer
  postings.
- A/B testing + activation-metric
  discipline: important for LLM-feature
  rollouts where user-visible quality is
  the KPI.
- Has already prototyped an LLM feature
  in production, so isn't cold-start.
- Design fluency + working relationship
  with designers reduces friction on
  user-facing AI features.
- Node + TypeScript + React stack matches
  common AI-product-scaleup stacks.

## Expected gaps

- No production agent (tool-calling,
  multi-step, stateful) owned end-to-
  end.
- No LLM eval loop shipped — no offline
  eval, no golden set, no rubric-graded
  regression protection.
- LLM observability: no tracing,
  no per-request cost attribution, no
  per-prompt error-mode dashboards
  owned.
- Prompt-registry / prompt-experimentation
  discipline: absent.
- Retrieval systems depth (vector search,
  hybrid retrieval, reranking, freshness
  loops): limited to prototype level.

## Expected high-leverage next action

Ship a public agentic workflow demo (2 or
3 tool calls, stateful across the
session) with an eval harness that
graders can inspect, deploy it to a
public URL, wire cost + latency
telemetry through a hosted trace tool,
and write a short retro on the eval
regressions found. 6-8 weeks. This maps
directly onto the AI Product Engineer
hiring signal.

## Regression notes

- Report should recognize the product-
  craft foundation and NOT recommend
  "learn React".
- Report must cite the applied_ai OR
  agent_engineering archetype
  explicitly.
- Report should NOT hallucinate that
  the candidate has shipped a
  production agent.
- Report length band: 1500-6000 chars.
- Cost budget: ~$0.05.
- Latency budget: 60s.
- Reassess-in-[N-weeks] closing
  paragraph required.
- Evidence quotes must come from real
  JDs supplied to the model.

## Must not happen

- Recommending a beginner React or
  TypeScript course.
- Naming a real company's internal
  agent stack as fact.
- Trend claims ("agent engineering is
  rising fast").
- Empty sections or missing gap
  numbering.
- Recommending research-heavy work
  when the target is explicitly
  product.
- Copy that overlaps with the sample-
  report page verbatim — the report
  must be user-specific.
- Stream truncation without the
  Candidate 1 sentinel → mark red.
