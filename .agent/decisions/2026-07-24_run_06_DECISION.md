# DECISION · AgentOps-5e-followup-baseline-lint-integrate-design · Phase 2 harness integration design complete

## Metadata

- **decision_id**: `2026-07-24_run_06_DECISION`
- **date**: 2026-07-24
- **based_on_run_report**: `.agent/run_reports/2026-07-24_run_06_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-24_run_06_TASK.md`
- **based_on_findings**: `.agent/findings/2026-07-24_structural_lint_harness_integration_inventory.json`
- **based_on_memo**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-design.md`
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_05_DECISION.md`
- **loop**: AgentOps-5e-followup-baseline-lint-integrate-design
- **parent_loop**: AgentOps-5e-followup-baseline-lint-implement (`2026-07-24_run_05` · Phase 1)
- **design_commit**: `e3208d9` (Design structural lint harness integration)
- **run_report_commit**: `0e3ff90` (Add RUN_REPORT 2026-07-24_run_06)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (design approval; push and
  Phase 2 implementation require separate human GO)
- **required_fixes**: **none**

## Outcome classification

**Phase 2 harness-integration design complete.**

## Reasoning summary

The Phase 2 design cleanly integrates the standalone
structural-evidence validator into the local regression harness
while **preserving strict separation between legacy regression
verdict, quote-integrity telemetry, and structural-evidence
telemetry**. It selects an integration point after report capture
and finalized capture metadata, immediately after quote-integrity
execution and before final metadata and verdict artifacts are
written. It introduces **explicit harness capture context through
an optional JSON context file**, defines deterministic
`not_evaluable` and `tool_error` semantics, preserves the Phase 1
standalone CLI, and explicitly prevents structural telemetry from
affecting the legacy `checks` array, harness exit code, baseline
metadata, or blocking behavior.

## Approved design

- **Integration point**: immediately after `runQuoteIntegrity`
  returns AND before the first legacy `checks.push` operation
- Report.md and finalized capture context are available
- Quote integrity and structural evidence run as sibling telemetry
  systems
- Legacy `classify(checks)` behavior remains untouched
- Process exit behavior remains untouched
- **Structural lint remains telemetry-only**
- **Quote integrity remains telemetry-only**

## Selected context interface

- **Optional CLI argument**: `--context <path>`
- Context file: sanitized JSON written under the run directory
- **Schema version**: `0.1-phase2`
- Existing Phase 1 invocation without `--context` remains supported
- **Explicit context takes precedence over the synthetic truncation
  marker**
- **Real harness must never emit or depend on the synthetic marker**
- Unknown schema or missing required context fields is `tool_error`

### Context fields

- `schema_version`
- `capture_scope`
- `fallback_used`
- `completion_state`
- `capture_complete`
- `report_capture_error`
- `report_char_count`
- `expected_sections_captured`
- `source`

### Context semantics

- `capture_complete` MUST be derived from harness capture facts
- `capture_complete` MUST NOT be inferred from structural-validator
  output
- `capture_complete` MUST NOT be inferred merely from Appendix
  presence or absence
- Avoid circular evaluation between structural result and capture
  sufficiency

## Capture-sufficiency policy

### `not_evaluable` when

- `completion_state !== 'success'`
- `capture_complete === false`
- `report_capture_error !== null`
- `capture_scope` is not an explicitly accepted complete-report
  scope
- `fallback_used === true` AND `expected_sections_captured === false`

### Evaluable when

- `completion_state === 'success'`
- `capture_complete === true`
- `report_capture_error === null`
- `capture_scope` is an accepted complete-report scope
- Required report text is non-empty

### Important

- **`fallback_used` alone does NOT imply `not_evaluable`**
- **Unknown `capture_scope` MUST NOT silently become evaluable**
- **Missing required context fields MUST NOT be guessed**
- **Insufficient capture MUST NOT become structural RED**
- **Structurally complete capture genuinely missing Appendix MAY
  become RED**

### Accepted capture scopes

- `main section`
- `body`

Only if the harness confirms these scopes contain the full required
report structure, including the Appendix.

## Precedence

1. `tool_error`
2. Explicit harness-context `not_evaluable`
3. Structural RED
4. AMBER
5. GREEN

## CLI extension

Extend: `scripts/structural-evidence-check.mjs`

Future command:

```
node scripts/structural-evidence-check.mjs \
  --report <report.md> \
  --output <structural_evidence_summary.json> \
  --context <structural_evidence_context.json>
```

### Backward compatibility

- Current two-argument Phase 1 invocation remains valid
- Existing 26 Phase 1 tests must continue to pass
- Context mode adds behavior without breaking standalone mode

## Selected helper architecture

Create: `scripts/lib/structural-evidence-integration.mjs`

### Purpose

- Deterministic integration adapter
- Invoke validator
- Enforce timeout
- Compute validator hash
- Validate artifact existence and shape
- Normalize tool_error state
- Return a stable integration envelope to the harness

**Do NOT broadly refactor the harness.**

## Selected integration point

- After report capture
- After capture metadata is finalized
- After `runQuoteIntegrity`
- Before final `metadata.json` construction / write
- Before `verdict.md` construction / write
- Before legacy checks classification is finalized
- **Structural result MUST NOT be appended to legacy `checks`**

## Metadata integration

Add a sibling metadata block:

```
structural_evidence:
- evaluation_status
- verdict
- blocking_mode: telemetry_only
- schema_version
- checker_path
- checker_hash
- exit_code
- duration_ms
- summary_path
- context_path
- capture_context
- affected_legacy_verdict: false
- tool_error details when applicable
```

## Combined telemetry

Add: `metadata.combined_telemetry`

### `combined_telemetry_verdict`

- `tool_error` if either telemetry subsystem has tool_error
- `red` if either is red and neither has tool_error
- `amber` if neither is red and either is amber
- `not_evaluable` if neither is red / amber and at least one is
  not_evaluable
- `green` if both are green

### Important

- `combined_telemetry_verdict` is **display-only**
- It MUST NEVER be inserted into legacy `checks`
- It MUST NEVER affect `classify(checks)`
- It MUST NEVER affect `process.exitCode`
- It MUST NEVER affect baseline eligibility in Phase 2

## verdict.md integration

Add concise sibling sections:

- `## Legacy regression verdict`
- `## Quote integrity telemetry`
- `## Structural evidence telemetry`
- `## Combined telemetry`

### Required wording

- Quote-integrity telemetry does NOT affect the legacy verdict.
- Structural-evidence telemetry does NOT affect the legacy verdict.
- Combined telemetry is display-only.
- A RED telemetry state MUST remain visibly RED even when legacy
  verdict is GREEN.
- Do NOT describe the overall run simply as GREEN when telemetry
  contains RED.
- Do NOT embed full report body, long quote text, resume content,
  or proprietary excerpts.

## Validator exit handling

### Exit 0

- Valid artifact expected
- Verdict may be `green`, `amber`, or `not_evaluable`
- Harness continues

### Exit 1

- Valid RED artifact expected
- Harness continues
- Legacy verdict unchanged
- Process exit unchanged

### Exit 2

- Record `tool_error`
- **No retry**
- Harness continues artifact generation where possible
- Legacy verdict unchanged
- Process exit unchanged

### Also classify as `tool_error`

- Spawn failure
- Validator timeout
- Artifact missing after exit 0 or 1
- Malformed JSON artifact
- Invalid artifact schema
- Checker hash computation failure
- Context write failure
- Output write failure

**Do NOT silently ignore telemetry failures.**

## Timeout

- **5 seconds**
- Kill child process on timeout
- **Reason**: `validator_timeout`
- **No retry**
- Existing generation latency thresholds remain unchanged

## Implementation identity

- SHA-256 content hash of:
  `scripts/structural-evidence-check.mjs`
- **Format**: `sha256:<hex>`
- Exact implementation identity independent of current git commit

## Artifact behavior

- Write `structural_evidence_summary.json` in the run directory
- Retain sanitized `structural_evidence_context.json`
- Do NOT embed report body or quotes
- Record relative artifact paths
- Temporary or partial validator output MUST NOT be trusted
- **No report rewriting**

## Phase 2 implementation scope

- `scripts/structural-evidence-check.mjs`
- `scripts/test-structural-evidence-check.mjs`
- `scripts/report-regression-local.mjs`
- `scripts/lib/structural-evidence-integration.mjs`
- `scripts/test-structural-evidence-integration.mjs`
- Synthetic integration fixtures or contexts
- TASK
- Implementation memo
- RUN_REPORT

### Explicitly forbidden

- `scripts/quote-integrity-check.mjs`
- `src/**`
- `src/lib/prompts.ts`
- API routes
- Baseline files
- `package.json`
- Lockfiles
- Workflows
- Env files
- `vercel.json`
- Pipeline
- `.agent/scripts/**`

## Deterministic integration tests

At minimum cover:

- **I1**: structural GREEN · legacy GREEN unchanged
- **I2**: structural AMBER · legacy GREEN unchanged
- **I3**: structural RED · legacy GREEN unchanged · harness process
  exit remains legacy-controlled
- **I4**: not_evaluable from incomplete capture context
- **I5**: validator tool_error visible in metadata and verdict
- **I6**: QI AMBER + structural GREEN
- **I7**: QI GREEN + structural RED
- **I8**: QI RED + structural GREEN
- **I9**: both telemetry systems RED
- **I10**: artifact missing after validator exit 0
- **I11**: malformed structural summary
- **I12**: validator timeout
- **I13**: invalid context schema
- **I14**: fallback capture incomplete
- **I15**: fallback capture explicitly complete
- **I16**: Phase 1 CLI backward compatibility
- **I17**: no baseline files changed
- **I18**: no report body embedded in metadata or verdict
- **I19**: no validator retry
- **I20**: legacy process exit unchanged

### Tests MUST

- Use synthetic reports and temporary directories
- Make no network calls
- Invoke no LLM
- Perform no report generation
- Perform no A/B runs
- Preserve all existing Phase 1 tests

## Test architecture

- Small deterministic integration helper module
- Supplemental static source assertions
- Avoid spawning the full generation harness
- Avoid broad harness refactor
- **No new dependencies**

## No-change requirements

- Quote-integrity checker **unchanged**
- **R1 unchanged**
- **R2 unchanged**
- **No new QI tier**
- Prompt **unchanged**
- `src` **unchanged**
- Baseline metadata **unchanged**
- Legacy verdict semantics **unchanged**
- Existing latency thresholds **unchanged**
- Pipeline **unchanged**

## Phase 2 implementation result MUST remain

- **Telemetry-only**
- **No legacy-verdict effect**
- **No process-exit effect**
- **No baseline mutation**
- **No retry**
- **No report rewrite**
- **No blocking promotion**
- **No `AgentOps-5f-promote`**

## Cost

- Design: **$0**
- Authorized Phase 2 implementation: **$0**
- **No paid A/B**
- **No API calls**

## Approved next loop

**`AgentOps-5e-followup-baseline-lint-integrate-implement`**

### Phase 2 implementation does NOT authorize

- Fixture A/B generation
- Phase 3 validation
- Baseline migration
- Stability runs
- Blocking promotion
- `AgentOps-5f-promote`

## Future rollout

- **Phase 3**: controlled A/B validation · separate explicit GO
  and approximately **$0.10** approval
- **Phase 4**: baseline metadata migration · separate DECISION and
  grandfathering policy
- **Phase 5**: stability evidence · separately approved runs
- **Phase 6**: blocking-promotion DECISION

**No phase automatically authorizes the next.**

## Risks remaining

1. The integration patch is larger and more coupled than Phase 1.
2. Metadata consumers may later misinterpret combined telemetry.
3. `capture_complete` correctness depends on harness facts.
4. Context-path lifecycle may confuse future maintainers.
5. Validator and quote-integrity parser semantics may drift.
6. Cross-platform child-process timeout behavior requires testing.
7. Structural lint has not yet been tested on fresh generated
   reports.
8. Telemetry-only RED may be overlooked operationally.
9. Baseline metadata does not yet contain structural evidence.
10. One integration phase cannot justify blocking promotion.

## Recommended next direction

Push the Phase 2 design after human approval, update the daily
summary, then begin Phase 2 implementation only under a separate
explicit GO.

### Do NOT authorize

- Implementation in this DECISION-only turn
- Paid A/B validation
- Baseline changes
- Legacy-verdict changes
- Process-exit changes
- Blocking promotion
- `AgentOps-5f-promote`

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT implement Phase 2.** **Do NOT run A/B.** **Do NOT mutate
baselines.** **Do NOT change legacy verdict or process exit.** **Do
NOT promote anything.** **Do NOT start `AgentOps-5f-promote`.**
