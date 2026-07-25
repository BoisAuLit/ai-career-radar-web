# DECISION · AgentOps-5e-followup-phase3-classify-json-hardening-design · Option A (generateObject + strict Zod, validation only) approved for a separately gated implementation loop

## Metadata

- **decision_id**: `2026-07-24_run_11_DECISION`
- **date**: 2026-07-24
- **based_on_run_report**: `.agent/run_reports/2026-07-24_run_11_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-24_run_11_TASK.md`
- **based_on_findings**: `.agent/findings/2026-07-24_classify_json_hardening_inventory.json`
- **based_on_memo**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-phase3-classify-json-hardening-design.md`
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_10_DECISION.md`
- **loop**: AgentOps-5e-followup-phase3-classify-json-hardening-design
- **parent_loop**: AgentOps-5e-followup-phase3-fixture-b-classify-502-diagnostics-design (`2026-07-24_run_10`)
- **design_commit**: `6f9af88` (Design classify JSON hardening)
- **run_report_commit**: `f2330d4` (Add RUN_REPORT 2026-07-24_run_11)
- **revision_commit**: `9baabde` (Refine classify JSON hardening design — 6 required fixes applied)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (this DECISION approves the design; the implementation loop is separately gated; any Fixture B rerun requires an additional explicit cost-approved human GO)
- **required_fixes**: **none**

## Outcome classification

**Classify JSON hardening design complete and approved for a separately gated implementation loop.**

## Reasoning summary

The design replaces the current unrestricted free-form JSON + manual
`JSON.parse` architecture with a schema-driven structured-output path
using the installed AI SDK's `generateObject` API. It explicitly
disables SDK retry attempts through `maxRetries: 0`, does not enable
experimental repair, allows only one provider call per request,
rejects silent normalization or semantic repair, preserves the
existing successful response contract at the field and type level,
sanitizes client-facing errors, and provides redacted server-side
observability. The revised design also makes Zod an explicit **direct**
dependency during implementation rather than relying on transitive
installation, and defines a fully mocked deterministic test matrix.

## Confirmed root problem

- **Current route** — `generateText` / free-form output
- **Current parser** — manual `JSON.parse(raw)`
- **Observed failure** — malformed JSON from Anthropic (`"company_preferences [],` at line 3 col 27)
- **Architectural failure class** — probabilistic model-format compliance
- **Selected mitigation** — SDK structured-output layer + strict runtime schema + typed failure handling

## Installed versions

- **`ai`**: 6.0.182
- **`@ai-sdk/anthropic`**: 3.0.77
- **`zod` (resolved transitively today)**: 4.4.3
- **Future direct Zod dependency (implementation loop)**: `^4.4.3`

## Selected option

- **Name**: **Option A**
- **API**: `generateObject`
- **Schema**: direct **Zod** strict object
- **`maxRetries`**: **0**
- **`experimental_repairText`**: unset
- **Provider calls per request**: **1**
- **Application retry**: false
- **Repair provider call**: false
- **Fallback provider**: false

## Fallback option

- **Name**: **Option B**
- **Behavior**: `generateText` + strict Zod validation
- **Repair**: none
- **Retry**: none
- **Activation**: only if a concrete `generateObject` / provider incompatibility is demonstrated during implementation inspection
- **Not co-primary**: true

## Schema policy

- `validation_only`: **true**
- `coercion`: false
- `defaults`: false
- `trim_transform`: false
- `lowercase_transform`: false
- `dedup_transform`: false
- `enum_normalization`: false
- `repair`: false
- `unknown_keys`: **reject**
- `strict_object`: true

## Classification schema

### `archetype`

- required: true
- enum:
  - `applied_ai`
  - `agent_engineering`
  - `llm_infra`
  - `eval`
  - `research_engineer`
  - `forward_deployed`
  - `ml_engineer`
  - `other`

### `company_preferences`

- required: true
- type: `array<string>`
- minimum items: **0**
- maximum items: **10**
- item minimum length: **1**
- item maximum length: **200**
- exact-duplicate policy: **reject via deterministic validation refinement**
- case-different values: **accepted as distinct**
- silent deduplication: **false**

### `level_hint`

- required: true
- enum:
  - `junior`
  - `mid`
  - `senior`
  - `staff`
  - `principal`
  - `unknown`
- default: **none**

### `reasoning`

- required: true
- minimum length: **1**
- maximum length: **2000**
- whitespace-only: **reject via validation refinement**
- trim transform: **false**

## Compatibility

- Success response: **field-compatible**
- Success types: **compatible**
- Semantic contract: **compatible for existing callers**
- Byte-identical: **NOT guaranteed**
- Property order: **NOT guaranteed**
- Raw serialization: **NOT guaranteed**

### Required success response fields

- `archetype`
- `company_preferences`
- `level_hint`
- `reasoning`

**No additional success fields.**

### Caller compatibility

- Existing caller reads returned classification fields
- Existing error caller reads `err.error`
- Removal of `raw` and `detail` is compatible with current page consumer
- Harness continues to classify failure through status + application state
- **No telemetry changes required**
- **No legacy-verdict changes required**
- **No process-exit changes required**

## Error taxonomy

| category | HTTP |
|---|---|
| `invalid_request_json` | 400 |
| `invalid_request_shape` | 400 |
| `provider_request_failed` | 502 |
| `provider_timeout` | 504 |
| `provider_rate_limited` | 429 |
| `structured_output_invalid` | 502 |
| `schema_validation_failed` | 502 |
| `internal_error` | 500 |

### Client failure contract

- `error`
- `category`
- `correlation_id`

### Client must NEVER receive

- Raw provider output
- Raw model output
- `detail` containing provider output
- Full `target`
- Provider internals
- Stack trace

## Observability policy

### Always permitted

- `timestamp`
- `correlation_id`
- `route`
- `provider`
- `model`
- `duration_ms`
- `usage.input_tokens`
- `usage.output_tokens`
- `finish_reason`
- `warnings_count`
- `error_category`
- `http_status`
- `schema_issue_paths`
- `schema_expected_type_names`
- `schema_received_type_names`
- `model_output_char_count`
- `model_output_sha256`
- `output_existed`
- `structured_output_rejected`

### Not logged by default

- Raw model output
- Malformed-output excerpt
- Full `target`
- Full `reasoning`
- `company_preferences` values
- Request headers
- API keys
- Complete provider response

### Restricted diagnostic mode

- Disabled by default
- Explicit configuration required
- Server-side only
- Tightly bounded
- Redacted
- Never returned to client
- No long-term sensitive retention

## `generateObject` guarantee boundary

**The design does NOT claim**:

- The provider guarantees native JSON-schema enforcement in every mode
- Invalid structured output can never occur

**The design DOES claim**:

- Application manual `JSON.parse(raw)` on unrestricted text is removed
- SDK structured-output processing produces or validates against the supplied schema
- Invalid structured output becomes a **typed failure**
- Route safely handles the typed failure
- Current raw-free-form JSON parsing architecture is removed

## Dependency policy

- `zod` currently transitive: **true**
- `zod` direct dependency currently present: **false**
- Implementation must add `zod` direct dependency: **true**
- Implementation expected package changes:
  - `package.json`
  - `package-lock.json`
- This DECISION authorizes package changes: **false**
- Implementation DECISION must explicitly review package changes: **true**

## Deterministic test plan

- **Minimum**: **37 tests**
- **Provider calls**: mocked only
- **Network calls**: **zero**
- **Real Anthropic**: **zero**
- **Real OpenAI**: **zero**

### Tests must include

**Schema**:

- Valid object
- Invalid archetype
- Wrong preferences type
- Too many preferences
- Overlong preference
- Exact duplicate rejected
- Case-different values accepted
- Invalid `level_hint`
- Whitespace-only reasoning rejected
- Overlong reasoning
- Unknown key
- Missing required key

**No-transform**:

- Strings not silently trimmed
- Duplicates not silently removed
- Enums not normalized
- Defaults not inserted

**Route**:

- Success 200
- Field / type compatibility
- Exactly one provider invocation
- `maxRetries: 0` passed
- `experimental_repairText` absent
- Provider failure sanitized
- Timeout sanitized
- Rate-limit sanitized
- `NoObjectGeneratedError` sanitized
- Internal exception sanitized

**Privacy**:

- Raw absent from client response
- Raw absent from ordinary logs
- Target absent from logs
- Correlation ID present
- Schema paths + output hash available without values

**Compatibility**:

- Existing page consumer remains compatible
- Harness failure recording remains compatible
- Telemetry semantics unchanged
- Baselines unchanged

**Static**:

- `JSON.parse(raw)` removed
- No application retry loop
- Exactly one generation invocation
- No `experimental_repairText`
- `zod` direct dependency present in expected implementation state

## Implementation scope

### Expected

- `src/app/api/classify/route.ts`
- New classification schema / helper file
- Deterministic schema tests
- Deterministic route tests
- `package.json`
- `package-lock.json`
- Governance artifacts

### Potential caller tests

- Only if necessary to verify failure response compatibility

### Forbidden

- Report generation prompt
- Quote-integrity checker
- Structural-evidence checker
- Report regression harness
- Regression fixtures
- Regression baselines
- Telemetry semantics
- Legacy checks
- Process-exit logic
- Pipeline
- `.agent/scripts`
- Workflows
- Environment configuration
- Vercel configuration

## Implementation acceptance

- `generateObject` syntax verified against installed packages
- Direct Zod dependency added
- Strict validation-only schema
- Manual unrestricted `JSON.parse` path removed
- Exactly one provider call
- `maxRetries: 0`
- No `experimental_repairText`
- No application retry
- No silent repair
- Success response field/type-compatible
- Client errors sanitized
- Raw output absent from ordinary logs and client
- Deterministic tests pass
- No real provider call during tests
- No baseline change
- No telemetry change
- No legacy / process-exit change

## Residual risk

- `generateObject` / provider compatibility for the specific schema must be verified during implementation through installed types and mocked tests
- Real provider behavior will only be tested under a later separately cost-approved validation run
- Structured output may still fail and must be handled as typed failure
- `maxRetries: 0` removes transport retry cushion

## Future completion path

1. Push this design and DECISION after separate human approval.
2. Create a separately gated implementation TASK.
3. Add Zod as a direct dependency.
4. Implement schema, structured output, sanitization, and redacted logging.
5. Run deterministic mocked tests only.
6. Create implementation RUN_REPORT.
7. Create implementation DECISION.
8. Push implementation only after human approval.
9. Obtain a separate explicit cost-approved GO.
10. Run Fixture B exactly once.
11. No retry.
12. Reassess Phase 3.

## Fixture B authorization

- Rerun authorized: **false**
- Fixture A rerun authorized: **false**
- Paid provider call authorized: **false**

## Not authorized

- Implementation
- Package changes
- Source changes
- Tests changes
- Fixture B rerun
- Fixture A rerun
- Paid API calls
- Baseline changes
- Telemetry changes
- Phase 4
- Phase 5
- Phase 6
- Blocking promotion
- `AgentOps-5f-promote`

## Cost

- **Current design loop**: **$0**
- **Current DECISION loop**: **$0**
- **Future implementation tests**: **$0 provider cost** (all mocked)
- **Future Fixture B validation**: not authorized

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT implement.** **Do NOT change `package.json` or
`package-lock.json`.** **Do NOT make any provider call.** **Do NOT
rerun any fixture.** **Do NOT mutate baselines.** **Do NOT change
telemetry.** **Do NOT change legacy verdict or process exit.** **Do
NOT promote structural lint or QI to blocking.** **Do NOT start
`AgentOps-5f-promote`.** **Do NOT start Phase 4 / 5 / 6.**
