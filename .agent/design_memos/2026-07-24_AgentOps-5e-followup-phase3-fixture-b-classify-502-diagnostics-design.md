# Design memo · AgentOps-5e-followup-phase3-fixture-b-classify-502-diagnostics-design · classify-502 root cause confirmed

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-phase3-fixture-b-classify-502-diagnostics-design
- **parent_loop**: AgentOps-5e-followup-baseline-lint-integrate-phase3-execute (`2026-07-24_run_09` · Phase 3 PAUSE)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_09_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_10_TASK.md`
- **findings**: `.agent/findings/2026-07-24_fixture_b_classify_502_diagnostics_inventory.json`
- **cost this loop**: **$0**

## 1 · Purpose

Determine the root cause of the Fixture B pre-generation `/api/classify` HTTP 502 observed in run `20260724T193349Z_fixture-B` **from existing evidence only**, without rerunning the fixture, changing any code, or making any external API call. Produce a hypothesis-ranked report, a diagnosis-confidence classification, and a bounded next-step design.

## 2 · Background

Phase 3 controlled A/B execution completed with Fixture A end-to-end integration PASS and Fixture B pre-generation failure-path handling PASS but end-to-end report integration NOT_EVALUABLE due to the classify 502. The subsequent PAUSE DECISION (`2026-07-24_run_09_DECISION.md`) explicitly authorized this diagnostics-design loop as the next direction — inspection only, `$0`, no rerun.

## 3 · Phase 3 paused state

- Fixture A: legacy GREEN · QI AMBER · structural RED · combined RED · process exit 0 · telemetry preserved legacy semantics.
- Fixture B: legacy RED · QI blocked_no_report · structural not_run · combined not_evaluable · process exit 1 · `/api/classify` HTTP 502 · `/api/generate-report` never called.
- Phase 2 structural telemetry integration defect: **not found**.
- Legacy `checks[]` count: actual **30** (prior "25" assumption stale, corrected in `2026-07-24_run_09_DECISION.md`).
- Estimated total cost of run_09: ~$0.05 (harness `cost_measured=false`; not directly measured).
- No future Fixture B run is currently authorized.

## 4 · Scope

Design and inspection only. Zero-cost. Produce TASK, findings JSON, this memo, RUN_REPORT.

## 5 · Out of scope

- Rerun of Fixture A or Fixture B
- Any paid API call (Anthropic / OpenAI / other)
- Any code / test / fixture / prompt / checker / harness / R1 / R2 / threshold / retry / logging change
- Any baseline mutation
- Any telemetry-semantic or legacy-verdict / process-exit change
- Phase 4 / Phase 5 / Phase 6 / `AgentOps-5f-promote`
- Blocking-mode promotion (QI or structural)
- Any implementation of the classify hardening options identified in § 25

## 6 · Fixture B failure summary

- **Route**: `/api/classify`
- **Status**: **502** (Bad Gateway) — returned by the route itself
- **Duration**: 3.6s application-code, 4561ms wall (Playwright capture overhead)
- **Retries**: **0** (no retry logic exists in the route or harness)
- **Report generated**: **no** (`/api/generate-report` was never called)
- **Response body**: `{"error":"Classifier returned invalid JSON","detail":"Bad control character in string literal in JSON at position 57 (line 3 column 27)","raw":"{\n \"archetype\": \"applied_ai\",\n \"company_preferences [],\n ..."}` (truncated at ~500 chars by harness)
- **Root cause (confirmed)**: Anthropic Sonnet 4.6 emitted a JSON completion in which the second key was written as `"company_preferences [],` — missing the closing quote and the `":` separator between key and value. The classify route's single explicit 502 branch (source `src/app/api/classify/route.ts` lines 42-49) correctly caught the `JSON.parse` failure and returned it verbatim.

## 7 · Exact timeline (UTC)

- **19:31:20** — `nohup npm run dev` started (PID 74612)
- **19:31:21** — Next.js Ready in 246ms · port 3000
- **19:31:35** — Fixture A harness invocation begins
- **19:31:35+** — `GET / 200` (211ms) · `GET /api/companies 200` (46ms) · `POST /api/classify 200 in 4.4s` (application-code 4.3s) — Fixture A classify SUCCESS
- **19:31:40 ~** — `POST /api/generate-report 200 in 58s` — Fixture A generation SUCCESS
- **19:32:41** — Fixture A ends (exit 0)
- **19:33:49.386** — Fixture B harness invocation begins
- **19:33:49+** — `GET / 200` (30ms) · `GET /api/companies 200` (3ms cache hit)
- **19:33:53** — `POST /api/classify 502 in 3.6s` (application-code 3.6s) — Fixture B classify FAILURE (harness captures `first_failure_elapsed_ms = 4561`)
- **19:33:54** — Fixture B ends (exit 1 · legacy RED · `completion_state: application_error`)
- **19:33:57~** — dev server killed

## 8 · Network diagnostics

`.agent/regression_runs/20260724T193349Z_fixture-B/network_diagnostics.json` (schema `0.1-b-timeout-diagnostics`) captured:

- `completion_state: application_error` · `completion_elapsed_ms: 3840`
- `first_failure_elapsed_ms: 4561`
- `first_non_2xx_url: http://localhost:3000/api/classify` · `first_non_2xx_status: 502`
- `generate_route_status: null` (proves `/api/generate-report` was never invoked)
- `events[0].body_excerpt` — the exact classify 502 body, truncated at 500 chars. This is the single most important artifact for this diagnosis.
- `visible_error_excerpt` — DOM text captured from the app's user-facing error banner ("Something went wrong Please try again..."). **This is NOT the API body**; it's the page HTML the harness saw when the "Retry" button appeared. The real API body is in `events[0].body_excerpt`.

## 9 · Server-log findings

`/tmp/acr-dev-server.log` (25 lines, 1249 bytes, still present at diagnostics time):

- 7 relevant access-log lines covering both fixtures' HTTP sequences.
- Fixture B's failing line: `POST /api/classify 502 in 3.6s (next.js: 1122µs, application-code: 3.6s)`.
- **No application-level error log entries.** The classify route has zero `console.error` / `console.log` in its 502 branch. Diagnosability relies entirely on the harness's `network_diagnostics.events[0].body_excerpt`.
- No 429, no 5xx from Anthropic surfaced as an SDK exception, no ECONNRESET / ETIMEDOUT / "fetch failed", no Next.js recompile between A and B.
- No memory / restart / OOM signal.

## 10 · Classify route architecture

`src/app/api/classify/route.ts` (53 lines):

- Exports `async POST(req: Request)`.
- `export const maxDuration = 30` (Next.js function timeout ceiling — well above the 3.6s observed).
- Uses `@ai-sdk/anthropic` + `ai` SDK's `generateText`.
- Model: `"claude-sonnet-4-6"` (constant).
- System prompt: `classifySystemPrompt()` from `@/lib/prompts`.
- No abort controllers. No custom timeouts. No retry. No logging.
- No local dependency beyond `@/lib/prompts` (pure string builder) and `@/lib/types` (types only).
- No database, no filesystem, no other internal route call.

## 11 · Request parsing

`const body: { target?: string } = await req.json()` (line 11).

- Failure mode: malformed JSON body → unhandled `SyntaxError` → Next.js returns **500** (not 502).
- We observed 502, so `req.json()` succeeded.

## 12 · Request validation

`const target = (body.target || "").trim(); if (!target) return 400` (line 12-18).

- Failure mode: missing / empty target → **400**.
- We observed 502, so target was non-empty.

## 13 · External dependencies

- **Yes, the classify route DOES call Anthropic.** Every classify request incurs one Sonnet 4.6 short-prompt completion.
- SDK path: `generateText({ model: anthropic(MODEL), system: classifySystemPrompt(), messages: [...] })`.
- No secondary provider · no OpenAI · no internal route call · no database.
- This resolves Q1/Q2/Q10 in `2026-07-24_run_08_DECISION.md`'s design memo: classify IS a paid-provider call. The prior "Fixture B: $0" narrative is technically true only for `/api/generate-report`, not for the classify layer.

## 14 · Timeout behavior

- Route-level `maxDuration = 30` seconds.
- No `AbortController` on the `generateText` call.
- No configured SDK timeout in the route.
- Observed 3.6s application-code is consistent with a normal (successful) Anthropic Sonnet 4.6 short-prompt round trip. Fixture A's classify took 4.3s. Nothing near any timeout was reached.

## 15 · Error mapping

- **400** — empty `target` field (line 13-18).
- **502** — `JSON.parse(raw)` throws in the try/catch on lines 39-50 (only explicit 502 branch in the route).
- **500 (implicit / uncaught)** — anything else that throws before the try/catch: `req.json()` failure, `generateText` rejection (Anthropic API error, network failure, auth failure). These would propagate as unhandled rejections and Next.js would return 500.

We observed 502, so we can rule out req.json / generateText failures.

## 16 · Explicit 502 paths

**Exactly one.** Lines 42-49:

```
return Response.json(
  {
    error: "Classifier returned invalid JSON",
    detail: e instanceof Error ? e.message : String(e),
    raw,
  },
  { status: 502 },
);
```

Triggered iff `JSON.parse(raw)` throws where `raw` is the (possibly markdown-fence-stripped) Anthropic response text.

## 17 · Fixture A/B request comparison

| field | Fixture A | Fixture B |
|---|---|---|
| file path | `benchmark_A_backend_to_applied_ai.md` | `benchmark_B_fullstack_to_ai_product.md` |
| file size (bytes) | 8879 | 8294 |
| file SHA-256 | `795f7fdf…` | `335414d7…` |
| `target` char count | 405 | 404 |
| `target` line count | 10 | 11 |
| target semantic | Applied AI Engineer @ Anthropic/Cohere · RAG + evals | AI Product Engineer @ AI-first Series B/C scaleup · agentic |
| control characters in target | none | none |
| classify result | **200** (parsed correctly) | **502** (LLM output malformed) |

Payload construction path (identical for both):

1. `scripts/report-regression-local.mjs` line 240: `targetRole: sections["Target role input"] || ""`
2. line 721: `.fill(fixture.targetRole)` (Playwright fills the app's target textarea)
3. `src/app/page.tsx` line 549-553: `fetch("/api/classify", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ target }) })`
4. Route line 11: `const body: { target?: string } = await req.json();`

**No structural difference in how A and B are constructed and sent.** The fixture markdown → target → JSON payload path is identical.

## 18 · Payload size and shape

- Both fixtures produce `{ target: <string> }` payloads of ~450 bytes.
- Both are well under any conceivable Anthropic input-token limit (Sonnet 4.6 handles 200k+ tokens; this is under 200 tokens).
- No binary content · no NUL / control chars.

## 19 · Existing test coverage

- **Zero.** No unit or integration test targets `/api/classify` directly.
- The Playwright harness `scripts/report-regression-local.mjs` is the sole exerciser and calls classify only via the app frontend.
- Uncovered failure modes: malformed body → 500 · empty target → 400 · Anthropic non-JSON output → 502 (the observed case) · Anthropic markdown-fenced JSON → depends on the fence stripping (only handles opening ```) · Anthropic returns valid JSON with wrong shape → currently succeeds silently (Classification cast is unchecked at runtime) · Anthropic API error → 500 (unhandled) · Anthropic timeout → 500 (unhandled) · 429 rate limit → 500 (unhandled).

## 20 · Historical 502 comparison

- Prior Fixture B failures (`20260723T035828Z_fixture-B` and `20260723T042759Z_fixture-B`) pre-date the network_diagnostics schema and are not directly comparable.
- The AgentOps-5d-b-timeout-diagnostics loop (2026-07-23) addressed hangs on `/api/generate-report`, not classify.
- **This is the first documented `/api/classify` 502 in the repository's Phase 2/3 governance record.**

## 21 · Hypothesis ranking

| id | hypothesis | confidence | confirmed? |
|---|---|---|---|
| **H2** | **Local classify route reached its 502 branch because Anthropic returned malformed JSON.** | **high** | **YES** |
| H1 | Transient Anthropic-side / provider-side failure | low | ruled out (would produce 500, not 502) |
| H3 | Fixture B payload violates undocumented assumption | low | ruled out (A/B payloads structurally identical) |
| H4 | Payload size / parsing issue | low | ruled out (450 bytes) |
| H5 | Configured timeout near 4.5s | low | ruled out (no such timeout; A took 4.4s and succeeded) |
| H6 | Resource / process state after A | low | ruled out (no restart / recompile; A→B GET requests fine) |
| H7 | Rate / capacity issue | low | ruled out (would surface as 500) |
| H8 | Internal route dependency failed | low | ruled out (classify has no internal deps) |
| H9 | Next.js / Turbopack transient compile failure | low | ruled out (would fail well before 3.6s) |
| H10 | Proxy / network-layer error | low | ruled out (localhost; app-code duration matches route) |

## 22 · Leading hypothesis

**H2 · confirmed.**

Full evidence chain:

1. Captured 502 body verbatim contains the strings `"Classifier returned invalid JSON"` and the `error` / `detail` / `raw` field structure — these appear in source code at `src/app/api/classify/route.ts` lines 42-49 and nowhere else in the codebase.
2. The captured `raw` field shows Sonnet 4.6's actual output starting with `{\n "archetype": "applied_ai",\n "company_preferences [],\n ...`. The model chose the correct archetype for Fixture B's target text; the failure is in JSON formatting, not classification semantics.
3. The malformation at position 57 line 3 column 27 (`"company_preferences [],` — missing closing quote + colon) matches exactly what the response's `detail` field ("Bad control character in string literal in JSON at position 57 (line 3 column 27)") identifies.
4. Application-code duration of 3.6s is consistent with a successful Anthropic round-trip; Fixture A's successful classify took 4.3s, so the SDK/network layer was functioning normally.

## 23 · Contradicting evidence

**None.** Every field of the captured 502 body matches the route's own error-branch output, and the parse-error position matches the observable malformation in the raw text.

## 24 · Diagnosis confidence

**`root_cause_confirmed`.**

Residual unknowns (out of this loop's scope):

- The *rate* at which Sonnet 4.6 emits malformed JSON on semantically similar classify prompts. Requires many trials to characterize.
- Whether a specific prompt-refinement, schema-constrained decoding call, or JSON-repair helper would eliminate this class of failure. A future implementation loop's question.

## 25 · Zero-cost diagnostic options

Six options were considered (see findings JSON `diagnostic_options[]`):

- **A** · add structured error logging in the classify 502 branch
- **B** · deterministic unit test using synthetic malformed LLM outputs
- **C** · extract a pure JSON-repair helper (with tolerant retry)
- **D** · switch classify to `generateObject({ schema })` (constrained decoding)
- **E** · route-level integration test with stubbed provider
- **F** · passive dev-server reproduction without provider calls (no added value — we already know the request-parsing path is fine)

**Ranking**: D (root-cause fix) > B (defensive test coverage) > E (broader coverage) > A (marginal — we already have body_excerpt) > C (repair heuristics are fragile) > F (skip).

**All six options require code changes** and would happen under a **separate implementation loop**, not this diagnostics-design loop. This loop implements none of them.

## 26 · Selected next action

**No additional zero-cost diagnostic is needed for THIS incident.**

The root cause is confirmed from existing evidence. Next governance step: author the diagnostics DECISION (verdict `approve` for the diagnostics work · outcome `root_cause_confirmed`).

Two subsequent paths, each requiring its own separate design + DECISION + explicit approval:

1. **Classify hardening** — implement Option D (`generateObject({ schema })`) and add unit tests (Option B or E). Estimated design $0; small implementation cost (~$0.01 for one validation call).
2. **Phase 3 completion rerun** — a newly authorized Fixture B run with a fresh cost-approved GO. The reviewer must decide whether to gate this on the hardening fix (path 2a) or accept the residual probabilistic-recovery risk (path 2b).

## 27 · Privacy and retention

- The classify 502 response body echoes the first ~500 chars of the raw LLM text back to the client. Content is the model's own classifier reasoning about the user's target — not user secrets, not API keys.
- Acceptable in a local harness diagnostic context.
- A future hardening loop should consider whether the production route should redact or bound this echo for public safety.
- **No `report.md`, no screenshot, no proprietary generated body, no secret is committed by this loop.**
- Findings JSON includes a bounded ~500-char excerpt of the 502 body (needed to demonstrate the diagnosis). That excerpt originates from harness-captured `network_diagnostics.json` which is already committed — this loop does not expose new data.

## 28 · Future implementation boundary

Any implementation loop responding to this diagnosis must:

- Have its own TASK, design memo, RUN_REPORT, DECISION.
- State whether it is a design-only or a code-change loop.
- If code change: enumerate exact files, expected line delta, tests, and a rollback plan.
- Explicitly disclaim: **no baseline mutation · no legacy-verdict / process-exit change · no promotion · no `AgentOps-5f-promote`.**
- Explicitly gate any paid validation call under separate human cost approval.

## 29 · Fixture B completion prerequisites

Before a newly authorized Fixture B completion run:

- The diagnostics DECISION is approved.
- The reviewer has explicitly chosen path 2a (hardening first) or path 2b (rerun as-is on probabilistic-recovery assumption), with a written acceptance of the associated residual risk.
- Under 2a: the hardening implementation is complete, reviewed, and committed before B is rerun.
- Under 2b: the reviewer accepts that a second identical failure is possible and that no further rerun will be authorized in the same approval.
- Separate explicit human cost approval (fresh $0.075 per-run cap and $0.15 total cap).
- Fixture B **exactly once**. **No retry.**
- No Fixture A rerun unless separately approved.
- Fresh run ID and fresh Phase 3 RUN_REPORT + DECISION.
- No baseline mutation. No blocking promotion. No Phase 4 / 5 / 6.

## 30 · Future DECISION outcomes

For **this diagnostics design loop's** upcoming DECISION:

- **`approve`** — diagnostics plan is sufficient and bounded; outcome for the incident is `root_cause_confirmed`.
- **`revise`** — design misses a plausible 502 path or permits unsafe execution.
- **`pause`** — necessary logs / artifacts are missing and no useful zero-cost next action exists.

For a **later diagnostics-execution / hardening loop's** DECISION:

- **confirmed transient (H1)** — would justify considering a new B completion run without code change.
- **confirmed local bug** — would require a separate implementation / fix loop before rerun.
- **suspected payload defect** — would require deterministic reproduction / test loop.
- **insufficient evidence** — would require instrumentation loop before any paid rerun.

(Current outcome maps to a fourth category: **confirmed probabilistic upstream output failure** — a hardening loop is defensively recommended but not mandatory; reviewer decides.)

## 31 · Policy resolutions

All Q1-Q20 answered in findings JSON `policy_resolutions{}`. Highlights:

- Q1: `/api/generate-report` never called for B.
- **Q2: Anthropic WAS called** for the classify layer (~3.6s completion). Prior "Fixture B: $0" narrative is technically wrong at the classify layer. Corrected.
- Q3: 502 came from classify route itself (not upstream proxy).
- Q4: exactly one explicit 502 branch (lines 42-49).
- Q5: no stack trace was logged; only harness-captured body_excerpt reveals the cause.
- Q13: **root cause CAN be confirmed from existing evidence — YES.**
- Q14: leading hypothesis H2.
- Q17: no code modification needed for the diagnosis.
- Q18: paid rerun is conditional — depends on reviewer priorities.
- Q19: **Fixture B rerun remains unauthorized** by this loop.
- Q20: no Phase 4 / 5 / 6 / promotion authorization.

## 32 · Risks

10 risks (findings JSON `risks[]`):

1. Root cause is probabilistic; rerun outcome cannot be predicted with certainty.
2. Response body echoes ~500 chars of raw LLM text — low sensitivity but worth production-hardening consideration.
3. Prior cost narrative needs correction (classify DOES cost).
4. Zero application-level logging on the 502 path; only harness-captured body_excerpt made diagnosis possible.
5. Zero test coverage for the classify route.
6. Fixture B has failed twice historically (different failure modes) — stability signal worth noting.
7. Unhandled Anthropic errors (429, timeout, network) would surface as 500, not 502 — silently harder to distinguish from unrelated 500s.
8. The classify route's Classification cast is unchecked at runtime — a valid-JSON-but-wrong-shape output would silently succeed.
9. `raw` echo may exceed typical error-body size expectations of some clients.
10. No monitoring / alerting on classify 502 rate; each incident requires manual harness reproduction to detect.

## 33 · Open questions

None. All 20 policy resolutions selected in § 31 / findings JSON.

## 34 · Boundaries respected

- ✅ no rerun of A or B
- ✅ no paid API call · no Anthropic · no OpenAI · no `/api/generate-report` invocation · no `/api/classify` invocation
- ✅ no dev server started in this loop (used the pre-existing `/tmp/acr-dev-server.log` from run_09 execution)
- ✅ no code change · no `src/**` / `scripts/**` / `.agent/scripts/**` change
- ✅ no prompt change
- ✅ no test added this loop
- ✅ no fixture change
- ✅ no checker / harness change
- ✅ no R1 / R2 change · no new QI tier
- ✅ no baseline mutation · no baseline eligibility change
- ✅ no telemetry-semantic change · no legacy-verdict / process-exit change
- ✅ no retry added · no threshold change
- ✅ no logging code added in this loop
- ✅ no `package.json` / lockfile / workflow / env / `vercel.json` change
- ✅ no pipeline change
- ✅ no push · no deploy
- ✅ no Phase 4 / 5 / 6 · no `AgentOps-5f-promote`
- ✅ no C / D / E · no A-E · no PDF ingestion · no OpenAI · BLK-0001/2/3 remain open · G2.1d blocked · Codex spec-only
- ✅ no `report.md` / screenshot / long quote / secret committed · no log copied into repo
- ✅ **cost this loop $0**
- ✅ **Fixture B rerun remains unauthorized**
