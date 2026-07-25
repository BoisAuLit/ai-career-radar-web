# RUN REPORT · AgentOps-5e-followup-phase3-classify-json-hardening-design · Option A (`generateObject`) selected

## Metadata

- **task_id**: `2026-07-24_run_11`
- **date**: `2026-07-24`
- **run_number**: `11`
- **branch**: `main` (design-only; no branch created)
- **loop**: AgentOps-5e-followup-phase3-classify-json-hardening-design
- **parent_loop**: AgentOps-5e-followup-phase3-fixture-b-classify-502-diagnostics-design (`2026-07-24_run_10`)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_10_DECISION.md`
- **task_path**: `.agent/tasks/2026-07-24_run_11_TASK.md`
- **findings_path**: `.agent/findings/2026-07-24_classify_json_hardening_inventory.json`
- **memo_path**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-phase3-classify-json-hardening-design.md`

## Commits

Pending. This turn will produce two commits:

- `<hash1>` Design classify JSON hardening
- `<hash2>` Add RUN_REPORT 2026-07-24_run_11

## Regression verdict

- **regression_required**: **no**
- **reason_required_or_not**: classify JSON hardening design only; no implementation, provider call, baseline, telemetry, or runtime behavior changed
- **harness_used**: **no**
- **harness_command**: `not_run`
- **fixture_ids**: none
- **target_environment**: local source, dependency, type, and test inspection
- **latest_run_id**: `20260724T193349Z_fixture-B` (the failed run whose failure this design responds to)
- **verdict**: `not_required`
- **exit_code**: `not_applicable`
- **artifact_paths**:
  - `.agent/tasks/2026-07-24_run_11_TASK.md`
  - `.agent/findings/2026-07-24_classify_json_hardening_inventory.json`
  - `.agent/design_memos/2026-07-24_AgentOps-5e-followup-phase3-classify-json-hardening-design.md`
- **report_char_count**: `not_applicable`
- **capture_scope**: `not_applicable`
- **fallback_used**: `not_applicable`
- **cost_measured**: **true** (this design loop)
- **estimated_cost**: **$0**
- **paid_api_calls**: **0**
- **baseline_promoted**: **no**
- **production_target_used**: **no**
- **reviewer_action_required**: human + ChatGPT review, then hardening design DECISION
- **push_implication**: no push until DECISION

## TASK

`.agent/tasks/2026-07-24_run_11_TASK.md` — design a deterministic structured-output + runtime-validation strategy for `/api/classify` that eliminates malformed free-form JSON as a failure class without adding retries or a second provider call. $0.

## Inspected versions and types

- **`ai`** 6.0.182 · `@ai-sdk/anthropic` 3.0.77 · `@ai-sdk/provider` 3.0.10 · `@ai-sdk/provider-utils` 4.0.27 · `@ai-sdk/gateway` 3.0.114 · `@ai-sdk/react` 3.0.184 · **`zod`** 4.4.3 (**transitive** via `ai` / `@ai-sdk/*`; not in direct deps) · **Next.js** 16.2.6
- Source of truth: `package.json`, `package-lock.json`, `node_modules/ai/dist/index.d.ts`, `node_modules/ai/package.json`, `node_modules/zod/package.json`

## Selected exact structured-output API

- **`generateObject<SCHEMA>({ model, schema, schemaName?, schemaDescription?, system?, prompt?, messages?, output?: 'object'|'array'|'enum'|'no-schema', maxRetries?, abortSignal?, timeout?, experimental_repairText?, ... }) → Promise<GenerateObjectResult<Object>>`**
  - Result: `{ object: <typed>, reasoning?, finishReason, usage, warnings, request, response, ... }`
  - Throws `NoObjectGeneratedError` on schema-validation failure
- Fallback API considered: `generateText({ output: Output.object({schema}) })` — supported but cleaner to use `generateObject` for a route with no tool calls
- Related exports: `NoObjectGeneratedError`, `NoOutputGeneratedError`, `RetryError`, `zodSchema`, `jsonSchema`

### Guarantee clarification

`generateObject` validates output at the SDK boundary. For providers with native structured-output support, the SDK requests it; for providers without, the SDK requests JSON and validates. Either way, invalid/missing structured output surfaces as a **typed failure** (`NoObjectGeneratedError` / `NoOutputGeneratedError`), NOT as raw text parsed by application code.

- We do NOT claim the provider itself guarantees native JSON-schema enforcement in every execution mode.
- We do NOT claim invalid structured output can never occur.
- We DO claim: the application no longer performs manual `JSON.parse` on unrestricted free-form provider text · the SDK layer produces/validates against the schema · invalid output is surfaced as a typed failure · the route handles that typed failure safely · residual structured-output failure remains possible but no longer produces the current raw-JSON parsing architecture.

## Schema (VALIDATION ONLY — no transforms)

**Overall policy**: validation only. No trim, no lowercase, no dedup, no defaults, no coercion, no enum normalization, no semantic rewriting, no silent removal of duplicates, no silent stripping of unknown keys. All deviations surface as typed schema failures.

- `archetype` — enum of 8 (`applied_ai` · `agent_engineering` · `llm_infra` · `eval` · `research_engineer` · `forward_deployed` · `ml_engineer` · `other`) · required · **NO transform**
- `company_preferences` — string array · min 0 · **max 10** items · per-item [1, 200] chars · **NO trim** · **NO dedup transform** · **duplicate policy: REJECT** via deterministic refinement · **case-different values remain distinct** (`'anthropic'` vs `'Anthropic'` both accepted)
- `level_hint` — enum of 6 (`junior` · `mid` · `senior` · `staff` · `principal` · `unknown`) · required · **NO default**
- `reasoning` — string · required · [1, 2000] chars · **NO trim transform** · **whitespace-only strings REJECTED** via refinement
- **STRICT object** (`.strict()` / `additionalProperties: false`) — unknown keys REJECTED · no coercion · no defaulting · **NO transforms**

**Correction note**: earlier draft proposed silent trim + case-insensitive dedup + trimmed reasoning. Corrected here per reviewer feedback: validation only.

## Option comparison

- **A** — `generateObject` with strict schema — **PREFERRED** (root-cause fix)
- **B** — `generateText` + strict runtime schema + no repair — FALLBACK only
- **C** — `generateText` + bounded local JSON repair — REJECT (silent semantic drift)
- **D** — prompt-only hardening — REJECT (insufficient by policy)
- **E** — retry provider after malformed output — REJECT (violates one-call policy)

## Provider-call policy

- **1 call per request** · `maxRetries: 0` explicit · no abort controller · no inner SDK timeout · no manual retry · no repair · no fallback provider · no recursion
- Transport retry (SDK default 2) explicitly disabled to enforce strict one-call

## Error taxonomy

8 categories: `invalid_request_json` (400) · `invalid_request_shape` (400) · `provider_request_failed` (502) · `provider_timeout` (504) · `provider_rate_limited` (429) · `structured_output_invalid` (502) · `schema_validation_failed` (502) · `internal_error` (500). All non-2xx include `correlation_id`. Raw model output NEVER returned to client.

## Privacy plan (default production)

- **Never** return raw model output to client
- Client bodies contain ONLY: `error` · `category` · `correlation_id`
- **Never** log raw model output in default server logs
- **Never** log full `target` · full `reasoning` · `company_preferences` values · API keys · headers
- Bounded server-side raw-output excerpt is available ONLY via an **optional restricted diagnostic mode** — **disabled by default** · requires explicit activation · scope server-side only · never returned to client · never persists sensitive user-derived content long-term

**Correction note**: earlier draft permitted a default ~500-char raw excerpt at ERROR. Corrected here per reviewer feedback: schema issue paths + expected/received type names + output char count + SHA-256 hash together identify the failure class deterministically without exposing model text.

## Observability plan (default)

- Server-generated `correlation_id` per request (16-char base32 or ULID) · stamped on every server log line + returned in every non-2xx client body
- Event names: `classify.request.received` · `classify.provider.request.start` · `classify.provider.response.received` · `classify.schema.validation.result` · `classify.response.sent` · `classify.error`
- **Always-permitted log fields**: `ts` · `level` · `event` · `correlation_id` · `route` · `provider` · `model` · `duration_ms` · `usage.input_tokens` · `usage.output_tokens` · `finish_reason` · `warnings_count` · `error_category` · `http_status` · **`schema_issue_paths`** (Zod issue `.path` only — JSON pointer / dotted path; NOT offending values) · **`schema_expected_type_names`** · **`schema_received_type_names`** · **`model_output_char_count`** · **`model_output_sha256`** (hex fingerprint; NOT the output itself) · `output_existed` · `structured_output_rejected`
- Token usage from `GenerateObjectResult.usage` recorded at info level

## Response compatibility

**Flavor**: **FIELD-COMPATIBLE and TYPE-COMPATIBLE** (contract-compatible / semantically compatible for existing callers). **NOT byte-identical.**

- **Explicitly NOT guaranteed**: JSON property ordering · whitespace · byte-identical serialization · internal SDK serialization behavior
- **Explicitly guaranteed**: success status 200 · exactly 4 fields (`archetype`, `company_preferences`, `level_hint`, `reasoning`) with correct types · no additional fields on success
- **Failure body**: **removed** `raw` + `detail` · **added** `category` + `correlation_id` · `error` preserved
- **Caller impact**: NONE — `src/app/page.tsx:555` reads only `err.error` (verified)
- **Harness impact**: NONE — classifies via status code + DOM state, not body content
- **Status changes**: `req.json()` fail 500 → 400 · provider errors 500 → 429/502/504 per category · empty target 400 unchanged · success 200 unchanged · structured_output_invalid 502 unchanged (body content differs)
- **Test guidance**: compatibility tests PARSE the response and assert fields + types; do NOT compare raw bytes or JSON property order

**Correction note**: earlier draft said "success shape unchanged (byte-compatible)" and used "byte-shape compat" language. Corrected here per reviewer feedback: field + type compatibility only, not byte-identical.

## Deterministic test matrix (at least 37 tests · all mocked · no real provider call · no network)

- **Schema (T1-T10 + T10a/b/c)**: valid · invalid archetype · non-array preferences · too many preferences · overlong preference · invalid level_hint · empty reasoning · overlong reasoning · unknown key · missing required key · **T10a exact-duplicate preferences REJECTED via refinement** · **T10b case-different values ACCEPTED** (`'anthropic'` vs `'Anthropic'`) · **T10c whitespace-only reasoning REJECTED via refinement** (not silently trimmed)
- **No-transform assertions (T-NOTRANS-1..4)**: strings NOT silently trimmed · duplicates NOT silently removed · enum values NOT normalized · defaults NOT inserted
- **Route success (T11-T14 + T14a)**: 200 body · **field-compatible + type-compatible** (parse-and-assert; no byte-identical) · exactly one invocation · `maxRetries: 0` passed to options (spy) · **`experimental_repairText` absent** from options (spy)
- **Route failure (T15-T20)**: provider throw · timeout throw · rate-limit throw · `NoObjectGeneratedError` · `NoOutputGeneratedError` · internal exception
- **Privacy (T21-T24 + T21a)**: raw NOT in client body · **raw NOT in ordinary (default-mode) server logs** · target NOT logged · correlation_id in body · logs contain schema issue paths + expected/received type names + `model_output_char_count` + `model_output_sha256` (not raw values)
- **Compatibility (T25-T28)**: page.tsx success path parses response and reads fields (no raw-bytes snapshot) · harness classify-failure recording · Phase 2 telemetry unchanged (rerun structural-evidence integration tests) · no baseline mtime change
- **Fixture-shaped synthetic (T29-T31)**: A-shaped valid · B-shaped valid · B-like empty-preferences valid
- **Static assertions (T32 + T32a/b/c/d)**: `JSON.parse(raw)` REMOVED · `experimental_repairText` NOT present · no application-level retry loop · exactly ONE `generateObject(` / `generateText(` invocation in route · **`zod` listed in `package.json` `dependencies`** (direct dep)

**Correction note**: earlier draft listed 32 tests without duplicate-refinement, whitespace-only, no-transform assertions, `experimental_repairText` absence, raw-not-in-logs, or the Zod-direct-dep static assertion. Corrected here per reviewer feedback.

## Migration plan (Phases H1-H7)

H1 add schema module + T1-T10 · H2 rewrite route to `generateObject` · H3 sanitize client errors + structured logging · H4 update route tests · H5 deterministic local validation (`node --check`, `npx tsc --noEmit`, run test suites, confirm 66/66 preserved) · H6 implementation DECISION · H7 **only** under separate cost-approved GO → Fixture B rerun (once).

## Implementation scope

**Expected files** (implementation loop): `src/app/api/classify/route.ts` (rewrite) · `src/lib/classify-schema.ts` (new · **Zod** schema module) · `scripts/test-classify-route.mjs` (new) · `scripts/test-classify-schema.mjs` (new) · governance artifacts.

**Package files (implementation loop, REQUIRED)**:

- `package.json` — **REQUIRED**: add `zod` (recommended range `^4.4.3`, matches already-resolved transitive 4.4.3) to `dependencies`. Definitive declaration for a direct `import { z } from "zod"`.
- `package-lock.json` — **REQUIRED**: auto-updated by the standard `npm install`.

**Package files THIS design loop**: UNCHANGED.

**Explicitly forbidden**: `src/lib/prompts.ts` (evaluate carefully; keep semantically equivalent if touched at all) · QI checker · structural checker · harness · `report-regression-local.mjs` · baselines · fixtures · regression runs · `.agent/scripts/**` · workflows / env / vercel.json · pipeline.

**Correction note**: earlier draft marked `package.json` as OPTIONAL and left the Zod-vs-jsonSchema choice unresolved. Corrected here per reviewer feedback: Zod is the definitive schema input; adding it as a direct dependency is REQUIRED in the implementation loop.

## Performance/cost

- Provider calls per classify: **1**
- Delta vs current successful path: ~0 (same Anthropic API endpoint; structured-output request constraints applied)
- Token delta: ~50-150 tokens for schema description in request; response tokens similar or slightly smaller
- No retry cost · no repair call cost
- `maxDuration` unchanged (30s)
- Latency: same order as current successful path (~4s app-code)

## Completion-run prerequisites

Hardening design DECISION approved → hardening implementation loop (own TASK + memo + RUN_REPORT + DECISION) → implementation DECISION approved → 32 tests pass · no real API call · pushed clean → **separate explicit human cost-approved GO** → Fixture B once · no retry → new Phase 3 RUN_REPORT + reassessment. No baseline promotion. No Phase 4/5/6. No `AgentOps-5f-promote`.

## Policy resolutions

All Q1-Q20 answered in findings JSON `policy_resolutions{}`. Highlights: **Q1** ai 6.0.182 · **Q2** @ai-sdk/anthropic 3.0.77 · **Q3** zod 4.4.3 (transitive today; DIRECT dep required at implementation) · **Q4** generateObject primary · **Q5** yes · **Q6** not deprecated · **Q7** Output.object supported but generateObject cleaner · **Q8** no auto model retry on parse failure · **Q9** yes Zod supported · **Q10** NoObjectGeneratedError · **Q11** success field/type compat yes (not byte-identical) · **Q12** never return raw · **Q13** **DEFINITIVE YES — add zod as DIRECT dep in implementation loop** · **Q14** Option A (generateObject + strict Zod, validation only) · **Q15** fallback B (generateText + strict Zod validation, no repair, no retry) · **Q16** 1 call · **Q17** no retries · **Q18** no silent repair · **Q19** B rerun NOT authorized · **Q20** no Phase 4/5/6/promotion authorized.

## No implementation

- `scripts/**` unchanged · `src/**` unchanged · `.agent/scripts/**` unchanged
- Prompts unchanged · fixtures unchanged · checkers unchanged · harness unchanged · tests unchanged
- `package.json` / `package-lock.json` unchanged

## No provider call

- No `/api/classify` invocation · no `/api/generate-report` invocation
- No Anthropic call · no OpenAI call
- No dev server started this loop

## No rerun

- No Fixture A rerun · no Fixture B rerun · no `report-regression-local.mjs` invocation

## No baseline or telemetry change

- `.agent/regression_baselines/**` unchanged (git diff 0 lines)
- `.agent/regression_runs/**` unchanged
- `.agent/regression_fixtures/**` unchanged
- QI checker unchanged · R1/R2 unchanged · no new QI tier · structural checker unchanged · combined telemetry semantics unchanged
- Blocking modes unchanged (QI: telemetry_only · structural: telemetry_only · combined: display_only)

## Cost $0 for this loop

## Recommended next step

**Human + ChatGPT review** this RUN_REPORT + findings JSON + design memo → say **"create DECISION for AgentOps-5e-followup-phase3-classify-json-hardening-design"** → executor writes DECISION (mild preference: **`approve`** the hardening design · **`required_fixes: none`** · **`human_approval_needed: yes`** for the subsequent implementation loop and any paid rerun).

**Do NOT** in this turn or the DECISION turn: implement · rerun A or B · start dev server for requests · make paid API call · modify code · mutate baselines · authorize a completion run · start Phase 4 / 5 / 6 / `AgentOps-5f-promote`.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.** **Do NOT push.** **Do NOT implement.** **Do NOT run tests that invoke a real provider.** **Do NOT rerun Fixture B.** **Do NOT start dev server requests.** **Do NOT make paid API call.** **Do NOT mutate baselines.** **Do NOT change telemetry.** **Do NOT authorize a completion run.** **Do NOT start Phase 4 / 5 / 6.** **Do NOT start `AgentOps-5f-promote`.**
