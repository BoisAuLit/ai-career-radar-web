# DECISION · AgentOps-5e-followup-phase3-fixture-b-classify-502-diagnostics-design · Fixture B /api/classify HTTP 502 root cause confirmed

## Metadata

- **decision_id**: `2026-07-24_run_10_DECISION`
- **date**: 2026-07-24
- **based_on_run_report**: `.agent/run_reports/2026-07-24_run_10_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-24_run_10_TASK.md`
- **based_on_findings**: `.agent/findings/2026-07-24_fixture_b_classify_502_diagnostics_inventory.json`
- **based_on_memo**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-phase3-fixture-b-classify-502-diagnostics-design.md`
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_09_DECISION.md`
- **loop**: AgentOps-5e-followup-phase3-fixture-b-classify-502-diagnostics-design
- **parent_loop**: AgentOps-5e-followup-baseline-lint-integrate-phase3-execute (`2026-07-24_run_09`)
- **design_commit**: `3c627a1` (Design Fixture B classify 502 diagnostics)
- **run_report_commit**: `b8f651f` (Add RUN_REPORT 2026-07-24_run_10)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (this DECISION approves the diagnostics; any subsequent hardening implementation, any paid rerun, and any push all require separate explicit human GO)
- **required_fixes**: **none for the diagnostics design**

## Outcome classification

**Fixture B `/api/classify` HTTP 502 root cause confirmed.**

## Reasoning summary

Existing run artifacts and source inspection identify the exact
failure. Fixture B's classify request successfully reached Anthropic
Sonnet 4.6, but the model returned malformed JSON with a missing
closing quote and colon between the `company_preferences` key and its
array value. `JSON.parse(raw)` failed, and the classify route's only
explicit 502 branch returned the observed
`"Classifier returned invalid JSON"` response. The failure was **not**
caused by Fixture B payload shape or size, timeout behavior, proxy
infrastructure, Next.js, request parsing, or Phase 2 structural
telemetry integration.

## Root cause

- **component**: `/api/classify`
- **provider / model**: Anthropic `claude-sonnet-4-6`
- **failure**: malformed free-form JSON completion
- **malformed fragment (line 3, column 27 of the model output)**: `"company_preferences [],`
- **expected fragment**: `"company_preferences": [],`
- **route behavior**: `JSON.parse(raw)` threw
- **HTTP behavior**: route returned its **explicit 502** invalid-JSON response (source `src/app/api/classify/route.ts` lines 42-49)
- **diagnosis confidence**: **`root_cause_confirmed`**

## Request path (confirmed by evidence)

- **request body parsing** (`req.json()`): **succeeded**
- **request shape** (`{ target: <string> }`): **valid**
- **request validation** (target non-empty): **succeeded**
- **Anthropic classify call**: **occurred** (application-code 3.6s consistent with successful Sonnet 4.6 short-prompt round trip)
- **model semantic classification**: **apparently completed** (raw output correctly identified `"archetype": "applied_ai"` for Fixture B's target text)
- **model formatting**: **failed** (dropped `":` between key and value)
- **`/api/generate-report` call**: **did not occur** (`generate_route_status: null` in network diagnostics; no such line in dev server log)

## Ruled-out hypotheses

- Fixture B payload-shape defect (A and B payloads structurally identical: `{target:<string>}` ~450 bytes)
- Payload-size defect (~450 bytes, well under any conceivable limit)
- Malformed incoming request JSON (would produce 500, not 502)
- Relevant ~4.5-second timeout (no such timeout in the route or SDK call; Fixture A's classify took 4.4s and succeeded)
- Proxy-generated 502 (localhost target; Next.js reports `application-code: 3.6s`, meaning the route function itself responded)
- Turbopack / Next.js transient compilation failure (would fail well before 3.6s; no recompile between A and B in the log)
- Anthropic provider outage response (would surface as an SDK exception → 500, not 502)
- Anthropic capacity or rate-limit response (same — would be 500, not 502; A succeeded 2 minutes earlier with no 429s in log)
- Internal report-generation failure (`/api/generate-report` was never invoked)
- Phase 2 structural telemetry integration defect (structural + combined telemetry never entered `checks[]`; `affected_legacy_verdict=false`; process exit legacy-controlled)

## Cost correction (required for later governance propagation)

- **Prior statement**: "Fixture B made no Anthropic call and cost $0" (implied by `Fixture B: $0` in `.agent/run_reports/2026-07-24_run_09_RUN_REPORT.md`, `.agent/decisions/2026-07-24_run_09_DECISION.md`, and `.agent/daily_summaries/2026-07-24_SUMMARY.md`).
- **Corrected statement**: Fixture B **did** make an Anthropic call through `/api/classify`.
- **Fixture B `/api/generate-report` cost**: **$0** (route was never called).
- **Fixture B `/api/classify` cost**: **incurred but not measured by the harness** (~3.6s Sonnet 4.6 short-prompt completion; harness `metadata.cost_measured=false`).
- **Exact provider cost**: **unknown**.
- **Future governance wording rule**: do **NOT** state Fixture B's total provider cost was exactly $0. State classify-layer cost as "incurred but unmeasured" and generate-report-layer cost as $0.
- **Propagation requirement**: this DECISION requires that the next push/cleanup turn update `.agent/daily_summaries/2026-07-24_SUMMARY.md` to reflect this cost correction alongside the diagnostics outcome.
- **Current diagnostics-loop cost**: **$0** (no LLM/API call, no browser, no dev server started this loop).

## Observability finding

- The classify route emits **no application-level log** for its explicit 502 path (no `console.error` / `console.log` on the JSON.parse-catch branch).
- Diagnosis was possible only because the harness's `network_diagnostics.events[0].body_excerpt` retained the API response body (up to 500 chars, with HTML tags stripped and whitespace normalized).
- `network_diagnostics.visible_error_excerpt` is DOM error-banner text ("Something went wrong Please try again…") — **NOT** the authoritative API response body.
- `network_diagnostics.events[0].body_excerpt` is the **authoritative API response excerpt**.
- Any future `/api/classify` 502 that occurs **outside** a harness run (e.g. from a real user) would not leave a diagnosable trace on the server side.

## Security and privacy finding

The classify route currently returns the first ~500 chars of the raw
Anthropic model output in its 502 response body (via the `raw` field).

- This helped THIS diagnosis (we could observe the exact malformation).
- **Do NOT change this behavior in this DECISION-only turn.**
- The subsequent hardening design should explicitly evaluate:
  - whether raw model output should be returned to clients at all,
  - whether it may contain user-derived or sensitive content in other scenarios,
  - whether server-side redacted logging is safer,
  - whether client responses should include only a correlation ID plus a sanitized error message.

## Architecture finding

The classify route currently depends on:

- free-form text generation (`generateText`)
- prompt-side compliance for JSON shape
- manual `JSON.parse(raw)` with markdown-fence stripping

This chain allows probabilistic formatting failures **even when the
semantic classification is correct** (as observed: Sonnet 4.6 chose
`"applied_ai"` correctly for Fixture B but dropped a `":` in the
next key). Any future implementation loop should replace this chain
with schema-constrained structured output.

## Selected next direction

**`AgentOps-5e-followup-phase3-classify-json-hardening-design`** — a
separate **$0** design / inspection loop.

### Recommended approach

Design (do not implement) a deterministic hardening path **before**
rerunning Fixture B. The design must compare at least:

- **Option A** — Use schema-constrained structured generation through
  the currently installed AI SDK's supported structured-output API
  (e.g. `generateObject({ schema })` or the current equivalent for the
  installed `ai` and `@ai-sdk/anthropic` versions).
- **Option B** — Keep `generateText` but validate through a strict
  runtime schema and perform a bounded local JSON extraction / repair
  step.
- **Option C** — Strengthen the prompt only.
- **Option D** — Retry malformed model output.

### Recommended bias for the hardening design

- **Prefer** native schema-constrained structured output (Option A).
- **Reject retry** (Option D) as the primary fix — it would consume
  additional paid tokens per malformed response and hide the
  underlying formatting weakness without eliminating it.
- **Reject prompt-only** (Option C) as insufficient — probabilistic
  models can still fail JSON compliance regardless of prompt strength.
- **Avoid silent semantic repair** — over-eager JSON repair heuristics
  can mask real model errors and produce unauditable classifications.
- **Preserve deterministic validation** — every accepted classification
  must satisfy an explicit schema at runtime.
- **No additional model call on parse failure.**
- **One classify provider call per request.**

### Investigation requirement

The hardening design **must** investigate the actual installed AI SDK
version and the current officially supported structured-output API
before selecting exact implementation syntax. Version drift between
memo and installed packages is a real risk; the design should confirm
the API surface it plans to use rather than relying on general
knowledge.

## Hardening design requirements

The `AgentOps-5e-followup-phase3-classify-json-hardening-design` loop
must satisfy:

- **$0** (design and inspection only)
- **No Fixture B rerun** · **no Fixture A rerun** · **no paid API call**
- **No implementation**
- Inspect current `ai` and `@ai-sdk/anthropic` package versions and
  types
- Define a **strict Classification schema**:
  - `archetype` (enum of the 8 archetype keys defined in
    `@/lib/prompts` + `"other"`)
  - `company_preferences` (string array, possibly bounded length)
  - `level_hint` (enum: `junior | mid | senior | staff | principal | unknown`)
  - `reasoning` (string, bounded length)
- Define enum constraints for `archetype` and `level_hint`
- Define array constraints (item type, length bounds) for
  `company_preferences`
- Define maximum string sizes where appropriate (defensive against
  runaway responses)
- Define safe server-side error handling (structured `console.error`
  with correlation ID; no secrets, no keys, no full raw echo)
- Define sanitized client error response (correlation ID + generic
  message; do not echo raw model output)
- Define server-side diagnostics strategy (what to log, where, at
  what verbosity)
- Define deterministic unit tests for the classify route (mocked
  provider path; covers success, invalid-JSON pathway if still
  reachable, wrong-shape pathway, empty target, malformed body)
- Preserve classify route behavior expected by callers (page.tsx +
  regression harness) at the response-shape level (the `Classification`
  object shape returned on success)
- Preserve generation / report-harness semantics
- **No baseline changes** · **no telemetry changes** · **no legacy-verdict
  change** · **no process-exit change**

## Fixture B completion-run authorization

- **Not granted.**
- **No Fixture B rerun now.**
- **No Fixture A rerun.**
- **No paid validation call.**

A future Fixture B completion run requires **all** of the following
in sequence:

1. Hardening design loop (this DECISION authorizes it as $0
   design/inspection).
2. Hardening DECISION.
3. Hardening implementation and deterministic tests (a further loop
   under its own design + DECISION).
4. Implementation DECISION.
5. **Separate explicit human cost-approved GO** for the rerun.
6. Fixture B **exactly once**.
7. **No retry.**

## Alternative path (not authorized here)

A reviewer may later choose to rerun Fixture B as-is while accepting
the probabilistic-recurrence risk (skipping the hardening loop). This
diagnostics DECISION does **not** authorize that path, and no paid
call is authorized under this DECISION regardless of path.

## No-change boundaries (for this DECISION turn)

- **No code change** in the diagnostics design
- **No prompt change**
- **No checker change** (QI or structural)
- **No R1 / R2 change** · **no new QI tier**
- **No harness change**
- **No baseline mutation**
- **No legacy-verdict change**
- **No process-exit change**
- **No telemetry-semantic change**
- **No promotion** · no blocking · no `AgentOps-5f-promote`
- **No Phase 4 / 5 / 6**

## Not authorized

- Fixture B rerun
- Fixture A rerun
- Classify hardening implementation
- Prompt modification
- JSON-repair implementation
- Retry logic
- Paid API call
- Baseline migration
- Blocking promotion
- Further Phase 3 execution
- Any modification of `scripts/**` / `src/**` / prompts / QI checker /
  structural checker / harness / `.agent/scripts/**` / package /
  lockfile / workflows / env / `vercel.json` / pipeline
- Push · deploy · production testing

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT rerun any fixture.** **Do NOT start a dev server.** **Do NOT
make any paid API call.** **Do NOT modify code.** **Do NOT mutate
baselines.** **Do NOT authorize a completion run.** **Do NOT start
Phase 4 / 5 / 6.** **Do NOT start `AgentOps-5f-promote`.** **Do NOT
implement classify hardening** — that is a separate future design +
implementation loop.
