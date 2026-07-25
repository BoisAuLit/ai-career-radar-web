# Design memo · AgentOps-5e-followup-phase3-classify-json-hardening-design · generateObject-based hardening for `/api/classify`

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-phase3-classify-json-hardening-design
- **parent_loop**: AgentOps-5e-followup-phase3-fixture-b-classify-502-diagnostics-design (`2026-07-24_run_10` · root cause confirmed)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_10_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_11_TASK.md`
- **findings**: `.agent/findings/2026-07-24_classify_json_hardening_inventory.json`
- **cost this loop**: **$0**

## 1 · Purpose

Design (do NOT implement) a deterministic structured-output and runtime-validation strategy for `/api/classify` that eliminates malformed free-form JSON as a failure class without adding retries or a second provider call. Zero-cost inspection of installed AI SDK version and API surface, schema design, option comparison, provider-call / retry / error / observability / privacy policies, response-compatibility analysis, deterministic test matrix, migration plan, and completion-run prerequisites.

## 2 · Background

Phase 3 execution (`2026-07-24_run_09`) surfaced an `/api/classify` HTTP 502 for Fixture B. Diagnostics (`2026-07-24_run_10`) confirmed root cause: Anthropic Sonnet 4.6 returned malformed free-form JSON (`"company_preferences [],` at line 3 col 27), and the classify route's only explicit 502 branch (route.ts L42-49) correctly caught the `JSON.parse` failure. Not a Phase 2 integration defect. The diagnostics DECISION authorized this hardening-design loop as $0 inspection only, prohibited any Fixture B rerun, and explicitly biased toward native schema-constrained structured output over prompt-only or retry-based fixes.

## 3 · Confirmed failure mode

- **Component**: `/api/classify` (`src/app/api/classify/route.ts`, 53 lines)
- **Provider / model**: Anthropic `claude-sonnet-4-6`
- **Failure class**: probabilistic LLM free-form JSON malformation (specific instance: dropped `":` between key and value)
- **Route response on failure**: HTTP 502 · body `{ error: "Classifier returned invalid JSON", detail: <parse error>, raw: <first ~500 chars of raw LLM text> }`
- **Explicit 502 paths in route**: exactly **one** (L42-49) · triggered iff `JSON.parse(raw)` throws

## 4 · Scope

Design only. Produce TASK, findings JSON, this memo, RUN_REPORT. **Zero cost.**

## 5 · Out of scope

- Implementation (any code / test / fixture / prompt change)
- Fixture A or Fixture B rerun
- Any paid API call (Anthropic / OpenAI / any)
- Any dev-server classify or generate request
- Baseline mutation · baseline eligibility change
- Telemetry semantic change · legacy verdict / process-exit change
- Promotion · blocking mode change · `AgentOps-5f-promote`
- Phase 4 / 5 / 6
- Dependency addition (unless design proves genuinely necessary)

## 6 · Installed dependency versions (inspected via `package.json`, `package-lock.json`, and `node_modules/*/package.json`)

- **`ai`**: declared `^6.0.182` · resolved **6.0.182** · types `./dist/index.d.ts`
- **`@ai-sdk/anthropic`**: declared `^3.0.77` · resolved **3.0.77**
- **`@ai-sdk/provider`**: resolved **3.0.10**
- **`@ai-sdk/provider-utils`**: resolved **4.0.27**
- **`@ai-sdk/gateway`**: resolved **3.0.114**
- **`@ai-sdk/react`**: declared `^3.0.184` · resolved **3.0.184**
- **`zod`**: **not in direct dependencies** · resolved **4.4.3** (transitive via `ai` / `@ai-sdk/*`)
- **Next.js**: 16.2.6 (from dev server startup line)

## 7 · Structured-output API inventory (from installed types)

Confirmed via inspection of `node_modules/ai/dist/index.d.ts`:

- **`generateObject<SCHEMA>({ model, schema, schemaName?, schemaDescription?, system?, prompt?, messages?, output?: 'object'|'array'|'enum'|'no-schema', maxRetries?, abortSignal?, timeout?, experimental_repairText?, ... })`** → `Promise<GenerateObjectResult<Object>>`
  - Result shape: `{ object: <typed>, reasoning?, finishReason, usage, warnings, request, response, ... }`
  - Throws `NoObjectGeneratedError` on schema-validation failure
- **`Output` (via `output as Output`)** — usable with `generateText({ output: Output.object({schema}) })`
- **`NoObjectGeneratedError`** class — has `.text`, `.response`, `.finishReason`, `.isInstance()`
- **`NoOutputGeneratedError`** class — thrown when no output at all is produced
- **`RetryError`** — for retry-budget exhaustion
- **`zodSchema`** helper — converts Zod schema into `FlexibleSchema`
- **`jsonSchema`** helper — accepts JSON Schema draft object (Zod-free alternative)

**Retry semantics**: `maxRetries` default is **2** (transport-level retry on 429/5xx/timeout only). Does NOT re-invoke the model on schema failure. **Our design sets `maxRetries: 0`** to enforce strict one-call policy.

**Repair semantics**: `experimental_repairText` is opt-in — invoked with raw text on parse failure before throwing. **Our design does NOT set it.**

### Guarantee clarification

`generateObject` validates model output against the supplied schema at the SDK boundary. For providers with native structured-output support, the SDK requests structured output; for providers without, the SDK requests JSON and validates. Either way, invalid or missing structured output surfaces as a **typed failure** (`NoObjectGeneratedError` / `NoOutputGeneratedError`), not as raw text that must be parsed by application code.

**We do NOT claim**:
- that the provider itself guarantees native JSON-schema enforcement in every execution mode
- that invalid or malformed structured output can never occur

**We DO claim**:
- the application no longer performs manual `JSON.parse` on unrestricted free-form provider text
- the SDK structured-output layer produces or validates the object against the supplied schema
- invalid structured output is surfaced as a typed failure
- the route handles that typed failure safely (sanitized 502 with `structured_output_invalid` category)
- residual provider/SDK structured-output failure remains possible but no longer produces the current raw-JSON parsing architecture

## 8 · Current classify route contract

- **Path**: `src/app/api/classify/route.ts`
- **Request**: `POST /api/classify` · body `{ target: string }` · trimmed; empty → **400** `{error: "Missing 'target' in request body"}`
- **Success response**: **200** · body `{ archetype, company_preferences, level_hint, reasoning }` (== `Classification`)
- **Failure responses**:
  - **502** (JSON parse failure, L42-49): `{ error: 'Classifier returned invalid JSON', detail: <parse msg>, raw: <~500 chars> }`
  - **500** (Next.js default) if `req.json()` throws or `generateText` throws unhandled
- Route exports `maxDuration = 30`; no explicit inner timeouts

## 9 · Current caller expectations

- **Primary caller**: `src/app/page.tsx` L549-559
  - Success path reads: `archetype`, `company_preferences`, `level_hint`, `reasoning` (via `Classification` type cast)
  - Failure path reads: **only `err.error`** (via `err.error || \`classify failed (${cRes.status})\``)
  - Does NOT read: `err.detail`, `err.raw`
- **Regression harness**: watches DOM state (`Retry` button appearance) + status code · does not functionally read response body
- **`network_diagnostics.events[0].body_excerpt`**: harness captures response body diagnostically, but nothing depends on specific fields
- **Consequence**: **safe to remove `raw` and `detail` from client-visible failure body** and add `category` + `correlation_id` without breaking any caller

## 10 · Classification schema (defined; not implemented)

Shape `{ archetype, company_preferences, level_hint, reasoning }`.

## 11 · Schema constraints

**Overall policy: VALIDATION ONLY.** No transforms of any kind. No trim, no lowercase, no dedup, no defaults, no enum normalization, no coercion, no repair, no semantic rewriting, no silent removal of duplicate entries, no silent stripping of unknown keys. All non-conforming output must fail schema validation and be surfaced as a typed failure via the route's error taxonomy.

- **`archetype`** — enum of 8 (`applied_ai` · `agent_engineering` · `llm_infra` · `eval` · `research_engineer` · `forward_deployed` · `ml_engineer` · `other`) · required · **NO transform**
- **`company_preferences`** — string array · required · min 0 · **max 10** items · per-item [1, 200] chars · **NO trim** · **NO dedup transform** · **duplicate policy: REJECT** via deterministic refinement (exact-duplicate entries fail validation) · **case-different values REMAIN DISTINCT** (e.g. `'anthropic'` vs `'Anthropic'` both accepted; product contract does not forbid this)
- **`level_hint`** — enum of 6 (`junior` · `mid` · `senior` · `staff` · `principal` · `unknown`) · required · **NO default** (missing → schema failure)
- **`reasoning`** — string · required · [1, 2000] chars · **NO trim transform** · **whitespace-only strings REJECTED** via deterministic refinement (NOT silently rewritten)
- **Unknown-key policy**: **STRICT REJECTION** (`.strict()` in Zod or `additionalProperties: false` in JSON Schema) — unknown keys are NOT silently dropped
- **Coercion**: NONE — wrong-type field fails schema validation
- **Defaulting**: NONE — no silent defaults; missing required field fails schema validation
- **Transform**: NONE — the schema performs validation only

**Correction note**: an earlier draft of this section proposed silent trim + case-insensitive dedup for `company_preferences` and silent trim for `reasoning`. Corrected here per reviewer feedback: no transforms are permitted; all deviations must be surfaced as validation failures.

## 12 · Option A — `generateObject` with strict schema (**PREFERRED**)

**Malformed-JSON prevention**: STRONG (SDK enforces schema; malformed → `NoObjectGeneratedError` not free-form parse) · **provider calls**: 1 (`maxRetries: 0`) · **hidden retries**: none · **complexity**: LOW · **SDK compatibility**: confirmed for `ai@6.0.182` · **deterministic**: STRONG · **privacy**: NEUTRAL · **testability**: HIGH · **residual failures**: provider transport errors → mapped to sanitized 429/502/504; wrong-shape valid JSON → NoObjectGeneratedError · **production risk**: LOW · **recommendation**: **PREFERRED**.

## 13 · Option B — `generateText` + strict runtime schema + no repair (FALLBACK)

**Malformed-JSON prevention**: MODERATE (free-form parse still possible before schema check) · other properties similar to Option A · **residual failures**: the primary failure class from run_09 could still occur · **recommendation**: **FALLBACK ONLY** if a specific incompatibility rules out Option A during implementation-loop inspection.

## 14 · Option C — `generateText` + bounded local JSON extraction / repair (REJECT)

**Deterministic**: WEAK · **production risk**: MODERATE-HIGH · **residual failures**: silent semantic drift (repair could change archetype), prompt-injection surface · **recommendation**: **REJECT** — violates "no silent semantic repair" policy.

## 15 · Option D — Prompt-only hardening (REJECT)

**Malformed-JSON prevention**: WEAK — probabilistic models still fail JSON compliance regardless of prompt strength · **recommendation**: **REJECT** — insufficient by policy.

## 16 · Option E — Retry provider after malformed output (REJECT)

**Provider calls**: 2+ per failure · **cost doubles per failure** · **hides underlying model weakness** · **recommendation**: **REJECT** — violates "no automatic model retry" and "one provider call per classify request" policies.

## 17 · Selected option

- **Primary**: **Option A** — `generateObject` with a direct **Zod** schema (validation only), `maxRetries: 0`, no `experimental_repairText`
- **Fallback**: **Option B** — `generateText` + strict runtime **Zod** validation + no repair + no retry. Reserved for the specific case where a demonstrated `generateObject` × `@ai-sdk/anthropic` incompatibility is discovered before the code change lands.
- **Schema input choice**: **Zod**, imported directly as `import { z } from "zod"`. Passed to `generateObject` as `schema: <ZodSchema>`. The `jsonSchema()` helper is documented as a fallback path but is **not** a co-primary option.

### Dependency strategy (definitive)

- **`zod` will become a DIRECT project dependency** in the implementation loop.
- **Rationale**: the classify route will directly `import { z } from "zod"`. A source file must not rely on a package that is only transitively hoisted. Explicit dependency ownership is required for auditability, security scanning, and lockfile stability.
- **Target range**: `^4.4.3` (matches the already-resolved transitive version 4.4.3; a narrower range may be selected by the implementation-loop DECISION).
- **When added**: **Implementation loop only.** This design loop does NOT touch `package.json` or `package-lock.json`.
- **Expected scope delta in implementation loop**: `package.json` (add `zod` to `dependencies`) and `package-lock.json` (auto-updated).

**Correction note**: an earlier draft left the choice between Zod and `jsonSchema()` unresolved and marked the dependency as "optional." Corrected here per reviewer feedback: Zod is the definitive schema input, and its addition to direct dependencies is required at implementation time.

## 18 · Provider-call policy

- **Exactly 1 provider call per `/api/classify` request**
- **`maxRetries: 0`** explicitly set (overrides SDK default of 2)
- **No abort controller** in classify (short prompt; ~4s round-trip; `maxDuration=30s` at Next.js layer is sufficient)
- **No timeout inside SDK call** (avoid double-timeout complexity)
- **No manual retry** in route code
- **No second model call** for repair
- **No fallback provider call**
- **No recursive generation**

## 19 · Retry analysis

- **SDK transport retries** (default 2): retry the **same** request on transient provider errors (429/5xx/timeouts). NOT model regeneration.
- **Our choice**: set to **0** to make provider-call count exactly 1 per request.
- **Consequence**: transient Anthropic 429 or 5xx will surface as our sanitized 429/502/504 immediately — no hidden retries. Acceptable because our regression harness is not real-time production traffic.
- **`experimental_repairText`**: opt-in only. **We do NOT set it.** Any repair behavior would be silent and violate policy.

## 20 · Error taxonomy

| category | HTTP | client message | retryable | correlation_id | server severity | raw retained server-side | raw returned to client |
|---|---|---|---|---|---|---|---|
| `invalid_request_json` | 400 | "Invalid request body." | no | yes | warn | no | no |
| `invalid_request_shape` | 400 | "Missing or invalid required field." | no | yes | warn | no | no |
| `provider_request_failed` | 502 | "Upstream classifier unavailable." | yes | yes | error | error message only | no |
| `provider_timeout` | 504 | "Upstream classifier timed out." | yes | yes | warn | no | no |
| `provider_rate_limited` | 429 | "Rate limited. Try again shortly." | yes | yes | warn | no | no |
| `structured_output_invalid` | 502 | "Classifier returned an invalid response." | no | yes | error | bounded (~500 chars, redacted) | **no** |
| `schema_validation_failed` | 502 | "Classifier response did not match required shape." | no | yes | error | field-summary only | **no** |
| `internal_error` | 500 | "Internal server error." | no | yes | error | error class + stack (server logs) | no |

`structured_output_invalid` replaces today's `"Classifier returned invalid JSON"` 502; `raw` is dropped from the client response.

## 21 · HTTP status mapping

- Current implicit **500** for `req.json()` / `generateText` failures → future explicit **400** (invalid body) or **502/504/429** (provider error taxonomy)
- Current explicit **502** for JSON parse failure → future explicit **502** for `structured_output_invalid` (same status, different body)
- Empty target → **400** (unchanged)
- Success → **200** (unchanged)

## 22 · Client error contract

- **Success body**: `{ archetype, company_preferences, level_hint, reasoning }` — unchanged
- **Failure body**: `{ error: <short string>, category: <enum>, correlation_id: <string> }` — replaces current `{ error, detail, raw }`
- Caller (`page.tsx`) reads only `err.error`; both fields are preserved in the new shape
- Regression harness: no functional dependency on body content; only status + DOM state

## 23 · Server-side observability

- **Correlation ID**: server-generated per request; 16-char base32 or ULID; included in every server log line for the request AND in every non-2xx client body
- **Event names**: `classify.request.received` · `classify.provider.request.start` · `classify.provider.response.received` · `classify.schema.validation.result` · `classify.response.sent` · `classify.error`
- **Always permitted log fields**:
  - `ts` · `level` · `event` · `correlation_id` · `route` · `provider` · `model` · `duration_ms`
  - `usage.input_tokens` · `usage.output_tokens` · `finish_reason` · `warnings_count`
  - `error_category` · `http_status`
  - `schema_issue_paths` (Zod issue array's `path` fields only — a JSON pointer / dotted path; **NOT the offending values**)
  - `schema_expected_type_names` · `schema_received_type_names`
  - `model_output_char_count`
  - `model_output_sha256` (hex — a stable content fingerprint of the raw model output; NOT the output itself)
  - `output_existed` (boolean) · `structured_output_rejected` (boolean)
- **Token usage**: recorded from `GenerateObjectResult.usage` at info level

## 24 · Privacy and redaction

### Not logged by default

- Raw model output
- Raw malformed-output excerpt
- Full `target` text
- Full `reasoning` field
- `company_preferences` values
- Request headers
- API keys
- Complete provider response

### Optional restricted diagnostic mode

- **Status**: **DISABLED BY DEFAULT**
- **Activation**: must be explicitly configured (environment flag or admin toggle designed in a separate loop — not enabled in normal production)
- **Scope**: server-side only
- **Bound**: tightly bounded (e.g. length cap · SHA-256 header · REDACTED user-derived content)
- **Never returned to client**
- **Never persists sensitive user-derived content long-term**

### Client response

- Always: `{ error, category, correlation_id }`
- Never contains: `raw` · `detail` containing provider output · any user-derived content

**Correction note**: an earlier draft permitted a default ~500-char raw-output excerpt at ERROR level. Corrected here per reviewer feedback: schema issue paths + expected/received type names + output char count + SHA-256 hash are sufficient to identify the failure class deterministically without exposing model text. Raw output is NOT logged in default production observability. The selected Option A design does NOT require raw-output logging for normal diagnosability.

## 25 · Response compatibility

**Compatibility flavor**: **FIELD-COMPATIBLE** and **TYPE-COMPATIBLE** (also called **CONTRACT-COMPATIBLE** / **SEMANTICALLY COMPATIBLE** for existing callers). **NOT byte-identical.**

### Explicitly NOT guaranteed

- JSON property ordering
- Whitespace in serialized output
- Byte-identical serialization
- Internal SDK serialization behavior

### Explicitly guaranteed

- Success status code **200**
- Success body parses to an object containing **exactly the four fields**: `archetype`, `company_preferences`, `level_hint`, `reasoning`
- Field types: `archetype` string ∈ `Archetype` enum · `company_preferences` string[] · `level_hint` string ∈ `Seniority` enum · `reasoning` string
- No additional fields on success

### Other changes

- **Removed client-visible fields**: `raw`, `detail` (from current 502 body)
- **Added client-visible fields**: `category`, `correlation_id` (added to all non-2xx bodies)
- **Status code changes**: `req.json()` failure moves from implicit 500 to explicit 400; provider errors move from implicit 500 to explicit 429 / 502 / 504 per category
- **Caller impact**: NONE — `page.tsx:555` reads only `err.error` which remains present
- **Harness impact**: NONE — `application_error` classification derives from DOM Retry button + `first_non_2xx_status`, not from body content
- **`network_diagnostics.events[0].body_excerpt`** will now capture the sanitized 502 body (short, structured, no raw model output)

### Test guidance

Compatibility tests **must PARSE** the response and assert fields + types. They **must NOT** compare raw bytes or JSON property order.

**Correction note**: an earlier draft claimed "success shape unchanged (byte-compatible)" and "success field byte-shape compat." Corrected here per reviewer feedback: the design guarantees field/type contract compatibility, not byte-identical serialization.

## 26 · Deterministic test plan

**At least 37 tests total, all mocked · zero real provider call · zero network call**. Categories:

- **Schema (T1-T10 + T10a/T10b/T10c)**: valid complete · invalid archetype · non-array company_preferences · too many company preferences · overlong preference · invalid level_hint · empty reasoning (`''`) · overlong reasoning (>2000) · extra unknown key · missing required key · **T10a duplicate refinement** (exact-duplicate company_preferences → REJECT) · **T10b case-different** (`'anthropic'` vs `'Anthropic'` both accepted) · **T10c whitespace-only reasoning** → REJECT via refinement (not silently trimmed).
- **No-transform assertions (T-NOTRANS-1..4)**: returned strings are NOT silently trimmed · duplicates NOT silently removed · enum values NOT normalized · defaults NOT inserted.
- **Route success (T11-T14 + T14a)**: 200 with Classification body · **field-compatible + type-compatible** (parse-and-assert only; no byte-identical comparison) · exactly one provider invocation · **`maxRetries: 0`** passed to `generateObject` options (spy) · **`experimental_repairText` absent** from options.
- **Route failure (T15-T20)**: provider generic throw → 502 `provider_request_failed` · timeout throw → 504 · rate-limit throw → 429 · `NoObjectGeneratedError` → 502 `structured_output_invalid` (no raw in body) · `NoOutputGeneratedError` → 502 `structured_output_invalid` · internal exception → 500.
- **Privacy (T21-T24 + T21a)**: raw output NOT in any client body · **raw output NOT in ordinary (default-mode) server logs** · full target NOT logged · correlation_id in every non-2xx client body · logs on structured_output_invalid contain schema_issue_paths + expected/received type names + model_output_char_count + model_output_sha256 (NOT raw values).
- **Compatibility (T25-T28)**: page.tsx success path **parses response and reads fields** (no raw-bytes snapshot) · harness records classify failure correctly given sanitized 502 · process.exit + Phase 2 telemetry unchanged (re-run `scripts/test-structural-evidence-integration.mjs`) · no baseline file mutation (mtime snapshot).
- **Fixture-shaped synthetic (T29-T31)**: A-shaped target valid · B-shaped target valid · B-like with empty `company_preferences` valid.
- **Static assertions (T32 + T32a/b/c/d)**: **T32** `JSON.parse(raw)` REMOVED from route · **T32a** `experimental_repairText` NOT present · **T32b** no application-level retry loop · **T32c** exactly ONE `generateObject(` / `generateText(` invocation in route · **T32d** `zod` listed in `package.json` `dependencies` (direct dep — read `package.json` in the test and assert key presence).

## 27 · Fixture-shaped synthetic tests

T29-T31 use synthetic target strings modeled on A / B fixtures but with all real user content redacted; the model call is mocked to return well-formed Classification objects; tests confirm the schema + route accept the shape and produce **field-compatible + type-compatible** success bodies. Static assertion T32 (`grep -F "JSON.parse(raw)" src/app/api/classify/route.ts` → 0 matches) confirms the free-form parse path is truly removed; T32a-d cover the other invariants.

## 28 · Migration plan (Phases H1-H7)

- **H1** · Add `src/lib/classify-schema.ts` + T1-T10 tests. No route change.
- **H2** · Rewrite classify route: `generateObject({ schema, model, system, prompt, maxRetries: 0 })`. Remove `JSON.parse` and markdown-fence strip. Preserve success response shape.
- **H3** · Sanitize client error contract: `{error, category, correlation_id}`. Add structured server-side console.error with bounded metadata + correlation ID.
- **H4** · Update route tests (T11-T20) with mocked `generateObject`; add caller-compatibility test (T25) if desired.
- **H5** · Deterministic local validation: `node --check`, `npx tsc --noEmit`, run all new + preserved tests. Confirm structural-evidence + integration test suites still 66/66.
- **H6** · Implementation DECISION (approve / revise / pause). No push until approved.
- **H7** · Under **separate** cost-approved GO: Fixture B rerun (once) to complete Phase 3.

## 29 · Implementation scope

**Expected files (implementation loop)**:

- `src/app/api/classify/route.ts` (rewrite)
- `src/lib/classify-schema.ts` (new · Zod schema module)
- `scripts/test-classify-route.mjs` (new · T11-T32 mocked)
- `scripts/test-classify-schema.mjs` (new · T1-T10 + T10a/b/c + T-NOTRANS-1..4 pure)
- `.agent/tasks/<next>_TASK.md` · `.agent/design_memos/<next-impl>.md` (optional) · `.agent/run_reports/<next>_RUN_REPORT.md` · `.agent/decisions/<next>_DECISION.md`

**Package files changed in the implementation loop (REQUIRED)**:

- `package.json` — **REQUIRED**: add `zod` (recommended range `^4.4.3`, matches already-resolved transitive 4.4.3) to `dependencies`. Definitive declaration for a direct import.
- `package-lock.json` — **REQUIRED**: auto-updated by the standard `npm install` (or `npm i --package-lock-only`) that follows the `package.json` edit. Implementation-loop DECISION must approve the diff explicitly.

**Package files in THIS design loop**: UNCHANGED (this design loop does not touch `package.json` or `package-lock.json`).

**Explicitly forbidden**: `src/lib/prompts.ts` (evaluate in implementation loop; keep semantically equivalent if touched at all) · `scripts/quote-integrity-check.mjs` · `scripts/structural-evidence-check.mjs` · `scripts/lib/structural-evidence-integration.mjs` · `scripts/report-regression-local.mjs` (should not need change; verify) · baselines · fixtures · regression runs · `.agent/scripts/**` · workflows / env / vercel.json · pipeline.

## 30 · Performance and cost

- Provider calls per classify: **1** (unchanged from current successful path)
- Delta vs current successful path: approximately zero — same Anthropic API endpoint with structured-output request constraints
- Token delta estimate: system prompt likely adds ~50-150 tokens for schema description; response tokens similar or slightly smaller (no scaffolding around JSON)
- No retry cost · no repair call cost
- `maxDuration` unchanged at 30 seconds
- Latency estimate: same order as current successful path (~4s app-code)
- Future cost recording: attach `GenerateObjectResult.usage` to future RUN_REPORTs when instrumentation is added (out of this design's scope)

## 31 · Security acceptance

- Raw model output removed from client error responses ✅
- No user-derived full input logged ✅
- No API keys or headers logged ✅
- Correlation ID available in every non-2xx client body ✅
- Logs bounded and redacted ✅
- Schema errors do not reveal provider internals unnecessarily ✅
- Client receives actionable but sanitized message ✅

## 32 · Implementation acceptance criteria

Future implementation is acceptable **only if**:

- installed SDK API used exactly as documented in installed types (generateObject signature match)
- manual `JSON.parse` of unrestricted free-form provider text REMOVED
- strict Classification schema enforced (all enums · all string bounds · all array bounds · strict object mode) — **VALIDATION ONLY, no transforms**
- **no silent transforms**: no trim · no lowercase · no dedup · no defaults · no coercion · no enum normalization · no semantic rewriting · no silent removal of duplicate entries · no silent stripping of unknown keys
- **duplicate policy**: exact-duplicate `company_preferences` entries REJECTED via deterministic refinement (not silently removed); case-different values remain distinct
- **whitespace-only reasoning** REJECTED via deterministic refinement (not silently trimmed or rewritten)
- **unknown top-level keys** REJECTED (not silently dropped)
- exactly one provider call (`maxRetries: 0`)
- no application retry · no second `generateObject` / `generateText` call · no manual retry loop
- no silent semantic repair (`experimental_repairText` not used; no custom repair logic)
- success response contract: **FIELD-COMPATIBLE and TYPE-COMPATIBLE** (not byte-identical)
- failure response sanitized (`raw` + `detail` removed from client body; `category` + `correlation_id` added; `error` preserved)
- diagnostics server-side and redacted: schema issue paths + expected/received type names + model output char count + SHA-256 hash logged; raw output NOT logged by default; optional restricted diagnostic mode disabled by default
- `correlation_id` present on every non-2xx client body AND every server log line for the request
- `zod` declared as **DIRECT** dependency in `package.json` (implementation-loop change); target range `^4.4.3`
- at least 37 deterministic tests pass (T1-T10 + T10a/b/c + T-NOTRANS-1..4 + T11-T14/T14a + T15-T20 + T21-T24/T21a + T25-T28 + T29-T31 + T32/T32a-d), all mocked
- no real API call in tests · no network call in tests
- no baseline / telemetry / legacy / process-exit change

## 33 · Completion-run prerequisites

Before any new Fixture B run: hardening design DECISION approved → hardening implementation loop completed (own TASK + memo + RUN_REPORT + DECISION) → implementation DECISION approved → tests pass → code pushed → separate explicit human cost-approved GO → Fixture B **exactly once** → no retry → new Phase 3 RUN_REPORT + reassessment.

## 34 · Future DECISION outcomes

**Hardening design DECISION**:
- **approve** — selected option supported and bounded; schema, error contract, privacy, tests adequate
- **revise** — SDK syntax unsupported or uncertain; hidden retries unresolved; response compat unresolved; privacy/logging incomplete
- **pause** — installed SDK/provider lacks suitable structured-output support and no safe bounded alternative established (would trigger fallback path C/D re-evaluation)

**Hardening implementation DECISION** (later):
- **approve** — 32 deterministic tests pass; one-call verified; raw exposure removed; no regressions
- **revise** — compatibility or privacy defect; hidden retry; free-text parse remains; tests insufficient

## 35 · Policy resolutions (Q1-Q20)

All answered in findings JSON `policy_resolutions{}`. Highlights: **Q1** ai 6.0.182 · **Q2** @ai-sdk/anthropic 3.0.77 · **Q3** zod 4.4.3 (transitive today; DIRECT dep required at implementation) · **Q4** generateObject primary · **Q5** yes · **Q6** not deprecated · **Q7** Output.object supported but generateObject cleaner · **Q8** no auto model retry on parse failure · **Q9** yes Zod supported · **Q10** NoObjectGeneratedError · **Q11** success field/type compat yes (not byte-identical) · **Q12** never return raw · **Q13** **DEFINITIVE YES — add zod as DIRECT dep in implementation loop** · **Q14** Option A (generateObject + strict Zod, validation only) · **Q15** fallback B (generateText + strict Zod validation, no repair, no retry) · **Q16** 1 call · **Q17** no retries · **Q18** no silent repair · **Q19** B rerun NOT authorized · **Q20** no Phase 4/5/6/promotion authorized.

## 36 · Risks

10 risks documented in findings JSON `risks[]`. Key items: SDK-Anthropic provider interaction for specific schema shapes (mitigated by shallow 4-field schema) · potential need for explicit verification of provider structured-output support during implementation · zero-new-direct-dep tradeoff (Zod vs jsonSchema helper) · removing `raw` from 502 body loses one debugging lever (mitigated by bounded server-side excerpt with correlation ID) · classify system prompt may need minor edit (must be semantically equivalent if touched) · `maxRetries: 0` removes transport retry cushion · `reasoning` 2000-char + `company_preferences` 10-item bounds are estimates and may need calibration during implementation.

## 37 · Open questions

None. All 20 policy questions resolved in § 35 / findings JSON.

## 38 · Boundaries respected

- ✅ design only · no implementation
- ✅ no rerun · no provider call · no paid API
- ✅ no code / test / fixture / prompt / checker / harness / R1 / R2 / threshold / retry / logging change
- ✅ no baseline mutation · no baseline eligibility change
- ✅ no telemetry semantic change · no legacy verdict / process-exit change
- ✅ no promotion · no blocking · no `AgentOps-5f-promote` · no Phase 4 / 5 / 6
- ✅ no dependency addition in this design loop (any addition would require explicit approval in the implementation loop)
- ✅ no `report.md` / screenshot / long quote / secret committed · no log copied into repo
- ✅ **one provider call · no retries · no silent repair · raw output not returned to client in selected design**
- ✅ **Fixture B rerun remains UNAUTHORIZED**
- ✅ BLK-0001/2/3 remain open · G2.1d blocked_pending_human · Q10 pause · Codex planner spec-only
- ✅ **cost this loop $0**
