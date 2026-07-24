# RUN REPORT · AgentOps-5e-followup-baseline-lint-integrate-implement · Phase 2 harness integration

## Metadata

- **task_id**: `2026-07-24_run_07`
- **date**: `2026-07-24`
- **run_number**: `07`
- **branch**: `main` (no branch created; task is scoped to append-only integration + tests)
- **loop**: AgentOps-5e-followup-baseline-lint-integrate-implement
- **parent_loop**: AgentOps-5e-followup-baseline-lint-integrate-design (`2026-07-24_run_06`)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_06_DECISION.md`
- **task_path**: `.agent/tasks/2026-07-24_run_07_TASK.md`
- **memo_path**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-implement.md`
- **impl_commit**: `bc246d3` (Integrate structural evidence telemetry)

## Commits

- `bc246d3` Integrate structural evidence telemetry

## Files changed

```
 .agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-implement.md  |  new (+400)
 .agent/tasks/2026-07-24_run_07_TASK.md                                                    |  new (+~130)
 scripts/fixtures/structural-evidence/CTX{1..10,11_marker_but_context_complete,12_standalone,13,14}_report.md
                                                                                           |  14 synthetic report fixtures
 scripts/lib/structural-evidence-integration.mjs                                           |  new (+~380)
 scripts/report-regression-local.mjs                                                       |  +120 -3
 scripts/structural-evidence-check.mjs                                                     |  +202 -0
 scripts/test-structural-evidence-check.mjs                                                |  +232 -0
 scripts/test-structural-evidence-integration.mjs                                          |  new (+~440)
 21 files changed, 2890 insertions(+), 3 deletions(-)
```

## Regression verdict

- **regression_required**: **no**
- **reason_required_or_not**: deterministic Phase 2 harness telemetry
  integration; no report generation, no baseline mutation, no
  legacy-verdict change, no production runtime change
- **harness_used**: **no** (no generation harness run)
- **harness_command**: deterministic integration tests only
- **fixture_ids**: synthetic structural integration fixtures
  (CTX1-CTX14, I1-I20 synthetic in-test)
- **target_environment**: local deterministic scripts
- **latest_run_id**: `not_applicable`
- **verdict**: `not_required`
- **exit_code**: deterministic test runner exit codes (all 0 · see § Validation)
- **artifact_paths**:
  - `scripts/structural-evidence-check.mjs`
  - `scripts/test-structural-evidence-check.mjs`
  - `scripts/lib/structural-evidence-integration.mjs`
  - `scripts/test-structural-evidence-integration.mjs`
  - `scripts/report-regression-local.mjs`
  - `scripts/fixtures/structural-evidence/CTX*_report.md` (14 files)
  - `.agent/tasks/2026-07-24_run_07_TASK.md`
  - `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-implement.md`
- **report_char_count**: `not_applicable`
- **capture_scope**: synthetic contexts (`main section` / `body`)
- **fallback_used**: `not_applicable` (no live capture)
- **red_checks_failed**: `not_applicable`
- **amber_checks_failed**: `not_applicable`
- **cost_measured**: **true**
- **estimated_cost**: **$0**
- **duration_ms**: deterministic test suites both complete in a few seconds
- **baseline_promoted**: **no**
- **production_target_used**: **no**
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: **no push until DECISION**

## TASK path

`.agent/tasks/2026-07-24_run_07_TASK.md`

## Implementation commit

`bc246d3 Integrate structural evidence telemetry`

## Validator extension

- Added optional `--context <path>` (schema `0.1-phase2`).
- Standalone two-argument Phase 1 CLI unchanged; 26 Phase 1 tests
  PASS as-is.
- Context loaded and validated BEFORE reading the report so any
  `tool_error` short-circuits without writing an artifact.
- Explicit context overrides synthetic truncation marker (marker
  remains supported when NO context is supplied for Phase 1 test
  compatibility).
- Artifact now includes `capture_context` field (sanitized subset:
  9 keys, no proprietary content).

## Context schema

Schema `0.1-phase2`. 9 required fields (strict types):
`schema_version`, `capture_scope`, `fallback_used`, `completion_state`,
`capture_complete`, `report_capture_error`, `report_char_count`,
`expected_sections_captured`, `source`.

Any missing / wrong-typed / unknown-schema-version field → `tool_error`
exit 2 (no artifact).

## Integration helper

`scripts/lib/structural-evidence-integration.mjs` (**new**).

Exports:

- `runStructuralEvidence({...})` — spawns validator with 5s timeout,
  validates artifact + verdict + exit-code cross-check, returns stable
  envelope. Never throws for expected failures. Never retries.
- `combineTelemetryVerdict(qi, structural)` — pure function used by
  harness and tests; identical rules for both consumers.

## Harness integration point

Immediately after `runQuoteIntegrity(...)` returns AND BEFORE the first
legacy `checks.push(...)`. Structural envelope stored in a local
variable `structuralEvidence` and never pushed into `checks[]`.
Combined telemetry stored in local variable `combinedTelemetryVerdict`.

## Capture truth table (harness → context)

`capture_complete` = `completionState === "success"` AND `reportText`
non-empty AND `capture.selectedLength > 0` AND `capture.selectedMarkerHits
=== REPORT_SECTION_MARKERS.length` AND `capture.selectedHasEvidence`.
`expected_sections_captured` derived the same conservative way.
Neither field is inferred from structural-validator output or Appendix
presence in report content, avoiding circular evaluation.

## Metadata changes

Added two blocks to `metadata.json` (single atomic write preserved):

- `metadata.structural_evidence` — 13 fields including
  `affected_legacy_verdict: false` and `blocking_mode: "telemetry_only"`.
- `metadata.combined_telemetry` — `verdict` + `display_only: true` +
  `affected_legacy_verdict: false` + `affected_process_exit: false` +
  QI/structural sub-verdicts.

No baseline metadata mutated. Existing legacy `metadata.*` fields
preserved byte-for-byte.

## verdict.md changes

Replaced single `## Quote integrity` section with four sibling sections
carrying the DECISION-required wording:

- `## Legacy regression verdict` — sole source of truth for process
  exit. Telemetry sections do NOT affect it.
- `## Quote integrity telemetry` — includes verbatim "Quote-integrity
  telemetry does NOT affect the legacy verdict."
- `## Structural evidence telemetry` — includes "Structural-evidence
  telemetry does NOT affect the legacy verdict. A RED telemetry state
  MUST remain visibly RED even when the legacy verdict is GREEN."
- `## Combined telemetry` — includes "Combined telemetry is
  display-only. Combined telemetry does NOT affect the legacy
  verdict. Combined telemetry does NOT affect the harness process
  exit. Do NOT describe the overall run simply as GREEN when telemetry
  contains RED."

Excluded: full report body / full quote text / long quote excerpts /
resume / proprietary content.

## Combined telemetry

Rules implemented in `combineTelemetryVerdict`:

- `tool_error` if either subsystem has `tool_error`.
- `red` if either is `red` and neither is `tool_error`.
- `amber` if neither red and either is `amber`.
- `not_evaluable` if neither red/amber and at least one is
  `not_evaluable` / null / unknown.
- `green` if both are green.

Display-only. Never inserted into `checks[]`. Never used for
`process.exit`. Never used for baseline eligibility.

## Exit / error / timeout behavior

- Exit **0** → verdict ∈ {green, amber, not_evaluable} · harness
  continues.
- Exit **1** → RED · harness continues · legacy verdict unchanged ·
  legacy exit unchanged.
- Exit **2** → tool_error · **no retry** · harness continues metadata
  / verdict.md writes · legacy verdict unchanged.
- Additional tool_error reasons: `validator_spawn_failed`,
  `validator_timeout`, `validator_unexpected_exit`,
  `artifact_missing_after_exit_0|1`, `summary_invalid_json`,
  `summary_invalid_schema`, `exit_verdict_mismatch`,
  `context_write_failed`, `checker_hash_compute_failed`.
- **Timeout: 5 seconds** (killSignal `SIGKILL`; detected via
  `res.signal` + elapsed).
- Existing latency thresholds (`HARD_LATENCY_MS = 240_000`,
  `SOFT_LATENCY_MS = 120_000`) **unchanged**.

## Validator hash

SHA-256 content hash of `scripts/structural-evidence-check.mjs`;
format `sha256:<hex>` (I1 verified via regex
`/^sha256:[a-f0-9]{64}$/`). Compute failure surfaces as
`tool_error.reason = "checker_hash_compute_failed"` but harness
continues.

## Phase 1 tests

`node scripts/test-structural-evidence-check.mjs` → **40 passed,
0 failed** (exit 0).

Includes all 26 original Phase 1 tests (G1-G4, R1-R11, A1-A4, N1-N2,
E1, E3, E3b, INV mtime, INV no-body-embedded) unchanged, plus 14
new context-mode tests CTX1-CTX14 covering: valid complete context,
`capture_complete=false`, application_error completion,
`report_capture_error` non-null, unknown `capture_scope`,
fallback incomplete/complete, unknown schema version, missing/wrong
field types, explicit-context-overrides-marker, standalone
backward-compat, malformed context JSON, missing context file.

## Integration tests

`node scripts/test-structural-evidence-integration.mjs` → **20 passed,
0 failed** (exit 0).

Coverage: I1 GREEN envelope, I2 AMBER, I3 RED-as-telemetry (not
tool_error), I4 incomplete-capture → not_evaluable, I5 validator
tool_error, I6-I9 QI×structural 2×2 combined-telemetry matrix,
I10 artifact-missing-after-exit-0, I11 malformed JSON, I12 timeout
(500ms cap + 4s sleep stub), I13 invalid context schema stub, I14
fallback incomplete, I15 fallback complete, I16 Phase 1 CLI backward
compat via spawnSync, I17 baselines unchanged (mtime+size snapshot),
I18 no report body embedded in envelope OR summary artifact, I19 no
validator retry (spawn counter stub), I20 static source assertions
(process.exit / checks.push / imports / affected_legacy_verdict /
regression_baselines).

## Typecheck

`npx tsc --noEmit` → exit 0.

## Static assertions (I20)

- `process.exit(classification.exit)` still present verbatim.
- No `checks.push(...structural...)` in harness.
- Helper does not import `playwright`.
- Helper does not import `node:http`/`node:https`.
- Helper does not use `fetch`.
- Helper always emits `affected_legacy_verdict: false`.
- Helper does not reference `regression_baselines`.

## Legacy checks unchanged

- Structural envelope kept in local variable — never pushed into
  `checks[]`.
- Existing 25-check legacy structural list untouched.
- `classify(checks)` receives the identical set of checks as before.

## Process exit unchanged

- `process.exit(classification.exit)` remains the sole authority for
  the harness exit code.
- Neither `structuralEvidence` nor `combinedTelemetryVerdict` is used
  in any `process.exit(...)` call.
- I20 statically asserts both facts.

## QI checker unchanged

- `git diff scripts/quote-integrity-check.mjs` → 0 lines.
- `runQuoteIntegrity` signature, envelope, blocking_mode, and
  R1 / R2 semantics all preserved.

## No generation

- No browser launched. No dev server started. No report generated.

## No A/B

- Fixture A and Fixture B were NOT run.

## No baseline mutation

- `git diff .agent/regression_baselines/` → 0 lines.
- I17 test proves baseline file set (paths, sizes, mtimes) is
  unchanged before/after helper invocation.

## No blocking promotion

- `blocking_mode: "telemetry_only"` retained everywhere.
- No new blocking check added to `classify(checks)`.

## QI and structural telemetry-only

Both subsystems store their verdict in metadata + verdict.md only.
Neither modifies legacy `checks[]`, `classify(checks)`, or
`process.exit`. Combined telemetry is `display_only: true` +
`affected_legacy_verdict: false` + `affected_process_exit: false`.

## Cost

**$0** — no LLM/API call, no browser launch, no dev server, no
generation.

## Known limitations

1. Integration has not yet been exercised against a real Fixture A/B
   report — Phase 3 handles that under a separate GO and ~$0.10 cost
   approval.
2. `metadata.combined_telemetry.quote_integrity_verdict` may echo
   pre-existing QI verdict strings like `"blocked_no_report"` /
   `"unknown"` when QI could not run. Because such values are treated
   as NOT-green in combine rules, no false GREEN can result.
3. Retained context artifact `structural_evidence_context.json` in
   the run directory is intentional (audit). It is sanitized (no
   report body, no quotes, no resume).
4. 5s timeout is generous; a future validator refactor could push
   near the ceiling. I12 test would catch regression.
5. Baseline metadata `baseline_metadata.json` under
   `.agent/regression_baselines/**` still lacks a `structural_evidence`
   sub-block — that migration is Phase 4's job under a separate
   DECISION and grandfathering policy.

## Recommended next step

Human + ChatGPT review, then **create DECISION** for
`AgentOps-5e-followup-baseline-lint-integrate-implement`.

Executor mild preference: **approve** · required_fixes **none** ·
authorize next loop = **push Phase 2 implementation** (2 commits:
`bc246d3` implementation + upcoming RUN_REPORT commit).

Phase 3 controlled A/B validation (~$0.10) remains separately
gated. Phase 4 baseline migration, Phase 5 stability, Phase 6
blocking promotion, and `AgentOps-5f-promote` all separately
gated.

## Alternatives

- **Revise**: request adjustment (e.g. context field renaming,
  additional required wording, split helper further).
- **Reject / rollback**: revert `bc246d3` — one commit, zero
  downstream impact (validator `--context` extension can remain OR be
  reverted; both are backward-compatible).
- **Handoff / pause**.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT run A/B.** **Do NOT mutate baselines.**
**Do NOT change legacy verdict or process exit.** **Do NOT promote
anything.** **Do NOT start `AgentOps-5f-promote`.**
