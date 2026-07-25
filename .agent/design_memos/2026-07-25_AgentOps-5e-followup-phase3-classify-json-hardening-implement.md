# Implementation memo · AgentOps-5e-followup-phase3-classify-json-hardening-implement

- **date**: 2026-07-25
- **loop**: AgentOps-5e-followup-phase3-classify-json-hardening-implement
- **parent_loop**: AgentOps-5e-followup-phase3-classify-json-hardening-design (`2026-07-24_run_11`)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_11_DECISION.md`
- **task**: `.agent/tasks/2026-07-25_run_01_TASK.md`
- **cost this loop**: **$0 provider cost** · 0 real API calls · 0 network calls · 0 fixture reruns

## 1 · Purpose

Implement the approved Phase 3 classify JSON hardening: replace the
current `generateText` + manual `JSON.parse(raw)` architecture on
`/api/classify` with `generateObject` + strict Zod validation,
`maxRetries: 0`, no `experimental_repairText`, sanitized client
errors, redacted server observability, and correlation ID. Add `zod`
as a direct project dependency. Ship deterministic mocked tests only
— no paid provider call, no Fixture rerun.

## 2 · Approved design

`.agent/decisions/2026-07-24_run_11_DECISION.md` §"Selected option"
(Option A) and `.agent/design_memos/2026-07-24_AgentOps-5e-followup-phase3-classify-json-hardening-design.md`
§17 / §22 / §32. All bindings honored: validation only · duplicate
refinement · whitespace-only rejection · unknown keys rejected · one
provider call per request · no retry · no repair · no fallback
provider · no silent transforms · sanitized errors · redacted logging
· correlation ID · field/type-compatible success (not byte-identical).

## 3 · Scope

- `package.json` — add `zod: ^4.4.3` to `dependencies`
- `package-lock.json` — auto-updated
- `src/app/api/classify/route.ts` — rewrite as thin wrapper (32 lines executable)
- `src/lib/classify-schema.mjs` — **new** · Zod validation-only schema
- `src/lib/classify-handler.mjs` — **new** · pure ESM, dependency-injected
- `scripts/test-classify-schema.mjs` — **new** · 19 deterministic tests
- `scripts/test-classify-route.mjs` — **new** · 32 deterministic tests (route + privacy + compatibility + static assertions)
- `.agent/tasks/2026-07-25_run_01_TASK.md`
- `.agent/design_memos/2026-07-25_AgentOps-5e-followup-phase3-classify-json-hardening-implement.md`
- `.agent/run_reports/2026-07-25_run_01_RUN_REPORT.md`

## 4 · Out of scope

- Any real provider call · any paid API · any Fixture rerun
- `src/lib/prompts.ts` (deliberately untouched · verified 0-line diff)
- QI checker · structural checker · harness · report-regression-local
- Baselines · fixtures · regression runs · `.agent/scripts/**`
- Workflows · env · `vercel.json` · pipeline
- Any dependency other than `zod`
- Phase 4 / 5 / 6 · blocking promotion · `AgentOps-5f-promote`
- Push · deploy · production testing · DECISION

## 5 · Dependency change

- `zod` declared range: **`^4.4.3`**
- Resolved version: **4.4.3** (matches already-resolved transitive; `npm install --package-lock-only` reported `up to date in 641ms` — no network install)
- Lockfile delta: +68 -1 lines (adds root `dependencies.zod` reference; adds top-level `node_modules/zod` package block; no unrelated package upgrade)
- **No other dependency added**

## 6 · Schema implementation

`src/lib/classify-schema.mjs` (74 lines · pure ESM):

- Exports: `classificationSchema` (Zod object), `ARCHETYPE_VALUES` (8-element array), `SENIORITY_VALUES` (6-element array), `COMPANY_PREFERENCES_MAX_ITEMS` (10), `COMPANY_PREFERENCE_ITEM_MAX_CHARS` (200), `REASONING_MAX_CHARS` (2000)
- **Validation only** — no `.transform()`, no `.default()`, no coercion, no preprocessing
- `archetype`: `z.enum(ARCHETYPE_VALUES)` · required
- `company_preferences`: `z.array(z.string().min(1).max(200)).min(0).max(10).refine(new Set(arr).size === arr.length, ...)` — exact-duplicate REJECT via refinement · case-different values remain distinct (Set uses exact string equality)
- `level_hint`: `z.enum(SENIORITY_VALUES)` · required · no default
- `reasoning`: `z.string().min(1).max(2000).refine(s => s.trim().length > 0, ...)` — whitespace-only REJECT via refinement · **no trim mutation** (the `.trim()` inside the refinement is read-only)
- Object: `.strict()` — unknown top-level keys REJECT

## 7 · Route implementation

`src/app/api/classify/route.ts` (**32 lines executable**, plus header docstring):

- Imports `generateObject` from `ai`, `anthropic` from `@ai-sdk/anthropic`, `classifySystemPrompt` from `@/lib/prompts` (unchanged), `handleClassify` from `@/lib/classify-handler.mjs`
- Exports `maxDuration = 30` (Next.js function timeout — unchanged)
- Exports `POST(req: Request): Promise<Response>` — delegates to `handleClassify` with real deps: `{generateObject, model: anthropic(MODEL), systemPrompt, generateCorrelationId, logger: serverLogger}`
- `generateCorrelationId` uses `globalThis.crypto.randomUUID()` (Node 22 global · no new dep)
- `serverLogger(event: object)` writes `JSON.stringify(event) + "\n"` to `process.stderr` inside a `try/catch` (logging must never throw)
- **All classify logic lives in the .mjs handler** — the route is a thin dependency-wiring layer

## 8 · Request validation

- `req.json()` failure → `invalid_request_json` (400)
- `body.target` non-string / empty / whitespace-only / `> 8000` chars → `invalid_request_shape` (400)
- Target-length check uses `.trim().length` at validation time (read-only, not a mutation of stored state)
- Client failure body never echoes the request payload

## 9 · Provider invocation

Single `deps.generateObject({...})` call site in the handler. Options passed:

- `model: deps.model`
- `schema: classificationSchema` (or `deps.schema` for tests)
- `schemaName: "Classification"`
- `schemaDescription: "Classification of a user's target role into an AI engineering archetype."`
- `system: deps.systemPrompt`
- `messages: [{role: "user", content: \`User says they want: "${targetRaw}"\`}]`
- `maxRetries: 0`
- `experimental_repairText` intentionally **omitted**

## 10 · One-call policy

- Static: `grep -c 'deps\.generateObject\s*(' src/lib/classify-handler.mjs` → **1** (asserted by T43)
- Static: `grep -c 'generateText\s*(' src/app/api/classify/route.ts` → **0** (asserted by T43)
- Dynamic: T20 verifies exactly 1 invocation via spy counter
- Dynamic: T23 waits a tick after success and re-asserts count remains 1

## 11 · Retry policy

- **`maxRetries: 0`** passed on every call (T21 asserts via spy)
- No retry loop in route or handler (T42 asserts via `for.*generateObject` / `while.*generateObject` / `catch.*retry` regex)
- No second provider invocation on any code path (T23)
- No `experimental_repairText` (T22 dynamic + T44 static)

## 12 · Error taxonomy

Implemented in `classifyProviderError()` + `CATEGORY_HTTP` / `CATEGORY_CLIENT_MESSAGE` maps:

| category | HTTP | trigger |
|---|---|---|
| `invalid_request_json` | 400 | `req.json()` throws |
| `invalid_request_shape` | 400 | `target` missing / empty / whitespace-only / oversized |
| `provider_rate_limited` | 429 | provider error with `.status = 429` |
| `provider_timeout` | 504 | provider error with `.name = "AbortError"` OR `.code ∈ {ETIMEDOUT, ECONNABORTED}` OR `.status = 504` |
| `provider_request_failed` | 502 | any other provider throw (conservative default; typed-instance check for `NoObjectGeneratedError`/`NoOutputGeneratedError` promotes to `structured_output_invalid`) |
| `structured_output_invalid` | 502 | `NoObjectGeneratedError` / `NoOutputGeneratedError` from SDK |
| `schema_validation_failed` | 502 | defense-in-depth: SDK returns success but re-parse fails our local schema |
| `internal_error` | 500 | not currently reached — reserved for future explicit throws |

## 13 · Client error contract

Every non-2xx response body:

```
{ "error": "<short human-readable>", "category": "<taxonomy key>", "correlation_id": "<server-generated>" }
```

**Never contains** `raw` · `detail` · target text · provider internals · stack trace (verified by T32 · T33 · T34 · T35 · T36).

## 14 · Correlation ID

- Server-generated per request via `crypto.randomUUID()` (Node 22 global · no new dep)
- Included in every non-2xx client body (T36)
- Stamped on every server log event via `logBase.correlation_id` (T37)
- No user-derived content in the ID

## 15 · Server observability

Structured JSON-lines logger writes to `process.stderr`. Every log event includes:

- `event` (one of six enum values) · `ts` · `route: "/api/classify"` · `provider: "anthropic"` · `correlation_id`
- Where applicable: `duration_ms` · `http_status` · `error_category` · `usage.input_tokens` · `usage.output_tokens` · `finish_reason` · `warnings_count`
- On `schema_validation_failed` / `structured_output_invalid` with Zod issues: `schema_issue_paths` (Zod `.path` only) · `schema_expected_type_names` · `schema_received_type_names` · `structured_output_rejected: true`

## 16 · Privacy

- **Never** returns raw model output to client (T32 · T33)
- **Never** logs full `target` (T34)
- **Never** logs raw model output at any level by default (T35)
- Schema issue logs contain the Zod `.path` array only — NEVER the offending values (T38)
- Optional restricted diagnostic mode: **NOT implemented** — deferred per the design ("may remain deferred; default production logging is the requirement")
- Bounded metric fields (`model_output_char_count` / `model_output_sha256`) are **NOT emitted** when the typed SDK error does not safely expose the text — privacy over metric (T39)

## 17 · Success compatibility

- Success body preserves exactly `{archetype, company_preferences, level_hint, reasoning}` (T17 · T18)
- Field types preserved: enum-constrained strings · string-array · string (T19)
- `page.tsx` reads only `Classification` fields on success and `err.error` on failure — verified via static inspection (T40): no `err.raw` reference

## 18 · Schema tests

`scripts/test-classify-schema.mjs` — **19 tests**:

- **T1-T12** valid + invalid archetype + wrong preferences type + too many preferences + overlong preference + exact-duplicate REJECT + case-different ACCEPT + invalid level_hint + whitespace-only REJECT + overlong reasoning + unknown key REJECT + missing required key
- **T13/T13b** returned strings NOT silently trimmed (reasoning + preferences items)
- **T14** duplicates REJECTED, not silently removed
- **T15** enum values NOT normalized
- **T16** missing field NOT filled with default
- **SANITY × 2** ARCHETYPE_VALUES / SENIORITY_VALUES match TypeScript types

## 19 · Route tests

`scripts/test-classify-route.mjs` — **32 tests** (T17-T47):

- **T17-T23** success path: 200 · exact 4 fields · field types · exactly 1 invocation · `maxRetries: 0` passed · `experimental_repairText` absent · no second call
- **T24-T25b** request-validation failures: invalid JSON · empty target · missing target
- **T26-T31** provider failures: generic throw · AbortError · status 429 · NoObjectGeneratedError · wrong-shape re-parse · internal exception
- **T32-T35** privacy: raw absent from success body · raw absent from 502 body · target absent from logs · raw model output absent from logs
- **T36-T39** correlation & schema paths: correlation_id in error body · correlation_id in every log · schema issue paths without offending values · optional metrics safely omitted
- **T40** page consumer static: reads only `err.error`, not `err.raw`
- **T41-T47** static assertions: `JSON.parse(raw)` REMOVED · no retry loop · exactly one call site · `experimental_repairText` absent from code · **`zod` in package.json dependencies** · QI/structural/harness files exist · schema `.strict()` retained

Total including schema suite: **51 tests · all mocked · zero real provider · zero network**.

## 20 · Static assertions

Comment-aware source inspection (`stripComments()` helper strips `//` and `/* ... */` before pattern matching, allowing docstring references to banned identifiers without spurious failures):

- `JSON.parse(raw)` — regex absent from route + handler code
- `experimental_repairText` — string absent from route + handler code · additionally: absent as an object-property key on the `generateObject` call site
- Retry loops — no `for.*generateObject` / `while.*generateObject` / `catch.*retry` patterns
- Exactly 1 `deps.generateObject(` call site in handler
- `generateText(` absent from route
- `zod` present in `package.json.dependencies`

## 21 · Existing regression preservation

Re-ran after implementation:

- `scripts/test-structural-evidence-check.mjs` → **40 / 40 PASS**
- `scripts/test-structural-evidence-integration.mjs` → **26 / 26 PASS**

Forbidden zones verified 0-line diff:

- `src/lib/prompts.ts` · `scripts/quote-integrity-check.mjs` · `scripts/structural-evidence-check.mjs` · `scripts/lib/structural-evidence-integration.mjs` · `scripts/report-regression-local.mjs`
- `.agent/regression_baselines/` · `.agent/regression_fixtures/` · `.agent/regression_runs/` · `.agent/scripts/`
- `vercel.json` · `.github/`

## 22 · Typecheck

`npx tsc --noEmit` → exit **0**.

(One tsc iteration flagged a `Record<string, unknown>` vs `object` mismatch on the route's `serverLogger` signature vs the handler's JSDoc; resolved by aligning route signature to `(event: object) => void`.)

## 23 · Performance / cost

- Provider calls per classify: **1** (unchanged from current successful path)
- Delta vs current successful path: ~0 (same Anthropic endpoint; structured-output request constraints applied)
- Token delta: ~50-150 tokens for schema description in request; response tokens similar or slightly smaller
- No retry cost · no repair call cost · `maxDuration` unchanged (30s)
- **This implementation loop cost**: **$0 provider cost** (all tests mocked; no real API call)

## 24 · Residual risks

- **`generateObject` × Anthropic Sonnet 4.6 real-world behavior** is not exercised by this loop — deterministic mocked tests only. Real behavior will be tested under the separately gated Fixture B completion run (which is NOT authorized by this loop). Reviewers must weigh whether to gate that rerun on additional integration testing.
- **`maxRetries: 0` removes transport retry cushion** — this is deliberate per design. A transient Anthropic 429 or 5xx will propagate as our sanitized 429/502/504 immediately.
- **Provider-error classification is conservative**: unknown provider errors fall back to `provider_request_failed` (502). If a provider error carries a specific status/code not covered (e.g. Anthropic-specific `.type = "overloaded_error"`), it would be classified as generic 502. A future observability loop can extend the classification if needed.
- **Optional restricted diagnostic mode is NOT implemented** — deferred per design. If a future incident requires deeper server-side inspection, a separate loop can add it under an explicit configuration flag.
- **Prompt in `src/lib/prompts.ts` is unchanged**. It still contains "Return ONE JSON object, no prose" which is now redundant under `generateObject`. This does not cause any incorrectness — the extra instruction is harmless — but a future minor prompt-cleanup loop could remove it (must be semantically equivalent).
- **Node runtime dependency**: `crypto.randomUUID()` requires Node 19+ or modern Web Crypto. The repo runs on Node 22, so this is fine. If deployed to an environment with an older Node, would need a shim.

## 25 · Rollback

- Revert 3 commits (impl + tests + governance) — reverts `package.json` / lockfile Zod addition · route rewrite · new schema/handler/test files.
- No baseline / prompt / harness / telemetry / legacy / process-exit change to reverse.
- Zero downstream impact.

## 26 · Boundaries respected

- ✅ **No paid provider call** · no Anthropic · no OpenAI · no `/api/classify` real invocation · no `/api/generate-report` invocation
- ✅ **No Fixture A rerun · no Fixture B rerun · no report-regression-local invocation**
- ✅ **No dev server started this loop · no browser · no Playwright**
- ✅ **No dependency added other than `zod ^4.4.3`** (no unrelated package upgrade; `npm install --package-lock-only` `up to date in 641ms`)
- ✅ **No retry / no `experimental_repairText` / no repair / no fallback provider** — exactly 1 provider call per request
- ✅ **No silent transforms** (validation only; T13/T13b/T14/T15/T16 assert this dynamically; refinements read but never mutate)
- ✅ **No baseline mutation** · no baseline eligibility change
- ✅ **No prompt change** (`src/lib/prompts.ts` 0-line diff)
- ✅ **No QI checker / structural checker / harness change** (all 0-line diff)
- ✅ **No `.agent/scripts/**` / `.agent/regression_baselines/**` / `.agent/regression_fixtures/**` / `.agent/regression_runs/**` change** (all 0-line diff)
- ✅ **No workflow / env / `vercel.json` / pipeline change** (all 0-line diff)
- ✅ **No legacy verdict / process-exit / telemetry-semantic change**
- ✅ **No promotion · no blocking · no `AgentOps-5f-promote` · no Phase 4/5/6**
- ✅ **No push · no deploy · no DECISION in this turn**
- ✅ Fixture B rerun remains **UNAUTHORIZED**
- ✅ **Cost this loop: $0 provider cost · 0 real API calls · 0 network calls**
