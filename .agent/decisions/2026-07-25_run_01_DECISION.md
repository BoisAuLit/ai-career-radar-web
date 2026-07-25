# DECISION · AgentOps-5e-followup-phase3-classify-json-hardening-implement · Option A shipped · APPROVE · $0 · not yet pushed · Fixture B remains unauthorized

## Metadata

- **decision_id**: `2026-07-25_run_01_DECISION`
- **date**: 2026-07-25
- **based_on_run_report**: `.agent/run_reports/2026-07-25_run_01_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-25_run_01_TASK.md`
- **based_on_memo**: `.agent/design_memos/2026-07-25_AgentOps-5e-followup-phase3-classify-json-hardening-implement.md`
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_11_DECISION.md`
- **loop**: AgentOps-5e-followup-phase3-classify-json-hardening-implement
- **parent_loop**: AgentOps-5e-followup-phase3-classify-json-hardening-design (`2026-07-24_run_11`)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (for push AND for any subsequent paid Fixture B completion run)
- **required_fixes**: **none**

## Outcome classification

**Classify JSON hardening implementation complete and approved for a
separately authorized push.**

## Reasoning summary

The implementation replaces unrestricted free-form classify output and
manual `JSON.parse(raw)` with the approved `generateObject`
structured-output path and a strict validation-only Zod schema. It
explicitly sets `maxRetries: 0`, does not enable experimental repair,
performs exactly one provider invocation per classify request, and
contains no application retry, repair call, or fallback-provider
path. Client errors are sanitized, default server logs are redacted,
and the existing successful response remains field- and
type-compatible. All 51 new deterministic mocked tests and all 66
preserved structural/integration tests passed, and TypeScript
compilation completed successfully. No real provider calls, fixture
reruns, baseline mutations, telemetry changes, legacy-verdict
changes, or process-exit changes occurred.

## Implementation commits

- **`a98c982`** — Harden classify structured output
- **`36f1db7`** — Test classify structured output
- **`f460cd9`** — Document classify hardening implementation

## Dependency change

- **package**: `zod`
- **declared**: `^4.4.3`
- **resolved**: **4.4.3**
- **direct_dependency**: **true**
- **unrelated_dependency_upgrades**: **none observed**
- **additional_dependencies**: **none**
- Lockfile delta: +68 -1 lines (zod entries only)
- `npm install --package-lock-only` reported `up to date in 641ms` (no network install)

## Implementation files

- `package.json`
- `package-lock.json`
- `src/app/api/classify/route.ts`
- `src/lib/classify-schema.mjs`
- `src/lib/classify-handler.mjs`
- `scripts/test-classify-schema.mjs`
- `scripts/test-classify-route.mjs`

## Provider invocation

- **API**: `generateObject`
- **call_sites**: **1** (in `src/lib/classify-handler.mjs`)
- **`maxRetries`**: **0**
- **`experimental_repairText`**: **absent**
- **application_retry**: **false**
- **repair_call**: **false**
- **fallback_provider**: **false**
- **`generateText` in primary route**: **false**

## Schema

- **strict_object**: **true** (`.strict()` — unknown keys reject)
- **unknown_keys**: **reject**
- **validation_only**: **true**
- **coercion**: **false**
- **defaults**: **false**
- **trim_transform**: **false**
- **dedup_transform**: **false**
- **enum_normalization**: **false**
- **repair**: **false**

### `archetype`

- required: **true**
- allowed enum:
  - `applied_ai`
  - `agent_engineering`
  - `llm_infra`
  - `eval`
  - `research_engineer`
  - `forward_deployed`
  - `ml_engineer`
  - `other`

### `company_preferences`

- required: **true**
- type: `array<string>`
- min items: **0**
- max items: **10**
- item length: **1 to 200**
- exact duplicates: **rejected**
- case-different values: **accepted as distinct**
- silent deduplication: **false**

### `level_hint`

- required: **true**
- allowed enum:
  - `junior`
  - `mid`
  - `senior`
  - `staff`
  - `principal`
  - `unknown`
- default: **none**

### `reasoning`

- required: **true**
- length: **1 to 2000**
- whitespace-only: **rejected**
- trim mutation: **false**

## Success contract

- **HTTP**: **200**
- **fields**:
  - `archetype`
  - `company_preferences`
  - `level_hint`
  - `reasoning`
- **extra fields**: **none**
- **compatibility**: **field-compatible and type-compatible**
- **byte identity**: **not claimed**

## Failure contract

- **fields**:
  - `error`
  - `category`
  - `correlation_id`
- **`raw`**: absent
- **`detail`**: absent
- **stack**: absent
- **provider internals**: absent

## Error taxonomy

| category | HTTP |
|---|---|
| `invalid_request_json` | 400 |
| `invalid_request_shape` | 400 |
| `provider_rate_limited` | 429 |
| `provider_timeout` | 504 |
| `provider_request_failed` | 502 |
| `structured_output_invalid` | 502 |
| `schema_validation_failed` | 502 |
| `internal_error` | 500 |

## Privacy

- **raw output returned to client**: **false**
- **raw output logged by default**: **false**
- **full target logged**: **false**
- **full reasoning logged**: **false**
- **company preference values logged**: **false**
- **API keys or headers logged**: **false**
- **correlation ID**: present on every non-2xx response and log event
- **schema issue logging**: paths and type names only
- **optional raw-output metrics**: omitted when unavailable without accessing raw output

## Observability

### Allowed

- `timestamp`
- `event`
- `correlation_id`
- `route`
- `provider`
- `model`
- `duration_ms`
- token usage (`input_tokens` · `output_tokens`)
- `finish_reason`
- `warnings_count`
- `error_category`
- `http_status`
- `schema_issue_paths`
- `schema_expected_type_names`
- `schema_received_type_names`
- `output_existed`
- `structured_output_rejected`

### Prohibited by default

- raw model output
- malformed-output excerpt
- target
- reasoning
- preference values
- headers
- API keys
- complete provider response

## Tests

- **classify schema**: **19 / 19 pass**
- **classify route**: **32 / 32 pass**
- **new total**: **51 / 51 pass**
- **structural/context preserved**: **40 / 40 pass**
- **structural integration preserved**: **26 / 26 pass**
- **grand total**: **117 / 117 pass**
- **TypeScript**: `npx tsc --noEmit` exit **0**
- **real provider calls**: **0**
- **network calls**: **0**

## One-call evidence

- **dynamic spy**: exactly one `generateObject` call (T20)
- **`maxRetries` assertion**: 0 (T21)
- **`experimental_repairText` assertion**: absent (T22 dynamic + T44 static)
- **delayed recheck**: call count remains 1 after async tick (T23)
- **static assertion**: exactly one `deps.generateObject(` call site (T43)
- **retry-loop assertion**: none (T42)
- **`generateText` assertion**: absent from primary route (T43)

## Compatibility

- **page consumer**: **compatible** (reads only `Classification` fields on success and `err.error` on failure — T40)
- **`error.error`**: **preserved**
- **harness classify-failure handling**: **compatible** (classifies via status + DOM state)
- **telemetry**: **unchanged** (Phase 2 tests 26/26 preserved)
- **legacy verdict**: **unchanged**
- **process exit**: **unchanged** (harness `process.exit(classification.exit)` intact)
- **baselines**: **unchanged**

## No-change verification

- `src/lib/prompts.ts`: **unchanged**
- quote-integrity checker: **unchanged**
- structural-evidence checker: **unchanged**
- structural integration helper: **unchanged**
- report regression harness: **unchanged**
- fixtures: **unchanged**
- baselines: **unchanged**
- regression runs: **unchanged**
- `.agent/scripts`: **unchanged**
- workflows: **unchanged**
- env: **unchanged**
- vercel: **unchanged**
- pipeline: **unchanged**

## Residual risks

- Mocked tests and typechecking do not prove live Anthropic
  structured-output behavior — real provider behavior will only be
  exercised under a later separately cost-approved Fixture B run.
- Provider/SDK may still return a typed structured-output failure
  (`NoObjectGeneratedError` / `NoOutputGeneratedError`) — the route
  handles these safely as sanitized 502 with
  `structured_output_invalid` category, but they can occur.
- `maxRetries: 0` deliberately removes transport retry resilience;
  transient Anthropic 429 or 5xx will surface as our sanitized
  429/502/504 immediately.
- Real provider validation requires a later separately cost-approved
  Fixture B run.
- **No paid validation is authorized by this DECISION.**

## Rollback

- Revert the three implementation commits (`a98c982`, `36f1db7`,
  `f460cd9`).
- Remove direct Zod dependency and corresponding lockfile entries.
- No baseline rollback needed.
- No telemetry migration needed.
- No data migration needed.

## Push authorization

- This DECISION does **not** itself push code.
- **Human approval is required before pushing implementation.**

## Fixture B authorization

- **rerun authorized**: **false**
- **Fixture A rerun authorized**: **false**
- **paid provider call authorized**: **false**

## Future path

1. Human reviews this implementation DECISION.
2. Push implementation and DECISION only after explicit GO.
3. Update daily summary and push cleanup.
4. Confirm repository clean and synchronized.
5. Obtain a separate explicit human cost-approved GO.
6. Run Fixture B exactly once.
7. **No retry.**
8. Stop immediately if classify fails.
9. Create new Phase 3 RUN_REPORT and DECISION.

## Not authorized

- Push before human GO
- Fixture B rerun
- Fixture A rerun
- Real provider call
- Paid API call
- Baseline migration
- Telemetry promotion
- Phase 4
- Phase 5
- Phase 6
- `AgentOps-5f-promote`

## Cost

- **Implementation provider cost**: **$0**
- **Current DECISION provider cost**: **$0**
- **Future validation**: **not authorized**

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT call a real provider.** **Do NOT rerun Fixture B.** **Do NOT
rerun Fixture A.** **Do NOT mutate baselines.** **Do NOT change
telemetry.** **Do NOT change legacy verdict or process exit.** **Do
NOT promote structural lint or QI to blocking.** **Do NOT start
`AgentOps-5f-promote`.** **Do NOT start Phase 4 / 5 / 6.**
