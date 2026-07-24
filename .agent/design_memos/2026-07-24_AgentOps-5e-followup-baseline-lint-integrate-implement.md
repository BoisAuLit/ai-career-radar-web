# Implementation memo · AgentOps-5e-followup-baseline-lint-integrate-implement · Phase 2 harness integration

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-baseline-lint-integrate-implement
- **parent_loop**: AgentOps-5e-followup-baseline-lint-integrate-design (`2026-07-24_run_06`)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_06_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_07_TASK.md`
- **cost**: **$0**

## 1 · Purpose

Wire the standalone structural-evidence validator into
`scripts/report-regression-local.mjs` as a non-blocking sibling telemetry
system alongside quote integrity. Emit `structural_evidence_summary.json`
+ `structural_evidence_context.json` per run, add
`metadata.structural_evidence` + `metadata.combined_telemetry`, and show
four sibling sections in `verdict.md` — while preserving legacy
`checks[]`, `classify(checks)`, process exit, and baseline metadata
byte-for-byte.

## 2 · Approved Phase

Phase 2 only. Phase 3 (paid A/B validation), Phase 4 (baseline metadata
migration), Phase 5 (stability evidence), Phase 6 (blocking promotion),
and `AgentOps-5f-promote` remain separately gated.

## 3 · Scope

- `scripts/structural-evidence-check.mjs` — added optional `--context
  <path>` support, `CONTEXT_SCHEMA_VERSION = "0.1-phase2"`, `capture_context`
  summary field, capture-sufficiency precedence.
- `scripts/test-structural-evidence-check.mjs` — preserved all 26 Phase 1
  tests; added 14 context-mode tests (CTX1-CTX14).
- `scripts/lib/structural-evidence-integration.mjs` (**new**) — deterministic
  integration adapter exporting `runStructuralEvidence({...})` and
  `combineTelemetryVerdict(qi, structural)`.
- `scripts/test-structural-evidence-integration.mjs` (**new**) — 20
  deterministic integration tests I1-I20 using synthetic reports, stub
  validators, and static source assertions.
- `scripts/report-regression-local.mjs` — added helper import; invoked
  `runStructuralEvidence` immediately after `runQuoteIntegrity` returns
  and BEFORE the first legacy `checks.push`; added
  `metadata.structural_evidence` + `metadata.combined_telemetry` blocks
  and four sibling `verdict.md` sections; extended the artifact list.
- `scripts/fixtures/structural-evidence/` — 14 auto-generated synthetic
  context-mode report fixtures (`CTX1_report.md` … `CTX14_report.md`).
- `.agent/tasks/2026-07-24_run_07_TASK.md`
- `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-implement.md`
- `.agent/run_reports/2026-07-24_run_07_RUN_REPORT.md`

## 4 · Out of Scope

- Fixture A/B generation · no browser invocation · no dev server.
- No paid API · no Anthropic / OpenAI call.
- No `scripts/quote-integrity-check.mjs` modification.
- No `src/**` / prompt / API route change.
- No baseline mutation.
- No structural telemetry entering legacy `checks[]`.
- No `classify(checks)` behavioural change.
- No process-exit change.
- No blocking promotion · no `AgentOps-5f-promote`.

## 5 · Governing Design

Design memo `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-design.md`
and DECISION `.agent/decisions/2026-07-24_run_06_DECISION.md`. All 20
Q&A resolutions (Q1-Q20) are implemented exactly as approved:
integration point B; `--context <path>` JSON; SHA-256 checker hash;
5-second timeout; no retries; `main section`+`body` capture scopes;
fallback_used alone not not_evaluable; combined telemetry display-only;
Phase 3 remains separately gated.

## 6 · CLI Context Extension

Added optional `--context <path>` flag preserving Phase 1
two-argument invocation:

```
node scripts/structural-evidence-check.mjs \
  --report <report.md> \
  --output <structural_evidence_summary.json> \
  [--context <structural_evidence_context.json>]
```

- Standalone mode (no `--context`): identical Phase 1 behavior; 26
  existing tests pass unchanged.
- Context mode: context loaded and validated BEFORE reading the report
  so any tool_error short-circuits without writing an artifact.

## 7 · Context Schema

Schema `0.1-phase2`. Required fields (all validated; strict types):

| field | type |
|---|---|
| `schema_version` | string (must equal `"0.1-phase2"`) |
| `capture_scope` | string |
| `fallback_used` | boolean |
| `completion_state` | string |
| `capture_complete` | boolean |
| `report_capture_error` | string | null |
| `report_char_count` | non-negative integer |
| `expected_sections_captured` | boolean |
| `source` | non-empty string |

Any missing field / wrong type / unknown schema version → `tool_error`
exit 2 (no artifact written).

## 8 · Capture-Context Truth Table

**Corrected 2026-07-24_run_07** — the initial implementation contained
a circular dependency: `capture_complete` was derived in part from
harness-side structural-content signals (an evidence-appendix regex
hit and a section-marker completeness count). That would have made a
fully captured but structurally broken report look "not_evaluable"
instead of RED — defeating the validator's purpose.

The correction extracts the derivation into a pure helper
`deriveCaptureCompleteness()` in
`scripts/lib/structural-evidence-integration.mjs` which consumes ONLY
category A (transport / capture-mechanism) facts.

### Capture signal categorization

| signal | provenance | category |
|---|---|---|
| `completionState` | Playwright wait outcome | **A** — transport |
| `reportText` non-empty | extractReportText return | **A** — transport |
| `capture.selectedLength > 0` | chosen candidate length | **A** — transport |
| `capture.scope` (selector or `body_fallback`) | container identifier | **A** — transport |
| `capture.fallbackUsed` | branch flag | **A** — transport |
| `reportCaptureError === null` | extraction exception state | **A** — transport |
| `capture.selectedHasEvidence` | `EVIDENCE_APPENDIX_RE.test(text)` | **B** — structural content ⛔ |
| `capture.selectedMarkerHits` | count of REPORT_SECTION_MARKERS in text | **B** — structural content ⛔ |
| `REPORT_SECTION_MARKERS` | product section headings | **B** — structural content ⛔ |
| structural validator output | recursive | **B** — structural content ⛔ |
| Appendix presence in report | recursive | **B** — structural content ⛔ |
| citation count | recursive | **B** — structural content ⛔ |

**Only category A is allowed to determine `capture_complete` and
`expected_sections_captured`.**

### Corrected truth table

`captureComplete = expectedSectionsCaptured = mechanismReached`, where:

```
mechanismReached =
  completionState === "success"
  AND reportCaptureError === null
  AND typeof reportText === "string" AND reportText.length > 0
  AND Number.isFinite(selectedLength) AND selectedLength > 0
  AND typeof scope === "string" AND scope !== "unset"
```

| harness state | capture_complete | expected_sections_captured |
|---|---|---|
| completion=success + reportText non-empty + selectedLength>0 + scope set | **true** | **true** |
| generation error / hard timeout / navigation error | **false** | **false** |
| completion=success + reportText empty | **false** | **false** |
| extraction exception (reportCaptureError non-null) | **false** | **false** |
| scope=`"unset"` (never ran extraction) | **false** | **false** |
| **fallback but complete container** | **true** | **true** |
| **complete capture but Appendix missing in report** | **true** | **true** (→ validator returns RED) |
| **complete capture but zero citations** | **true** | **true** (→ validator returns RED) |
| **complete capture but only 4 gaps** | **true** | **true** (→ validator returns RED) |

### Scope mapping

Harness `capture.scope` values (e.g. `"[data-testid*='report']"`,
`"main section"`, `"body_fallback"`) are mapped into the validator's
accepted scope set `{"main section", "body"}` at the boundary:

- `fallbackUsed === true` → `"body"`
- otherwise → `"main section"` (the chosen candidate came from a
  report-container selector)

The original harness scope string is retained in the metadata
(`metadata.capture_scope`) and shown in `verdict.md` for observability.

## 9 · Capture-Sufficiency Rules

Precedence enforced in the validator:

1. Validator tool_error (I/O failure, context invalid, spawn crash).
2. Harness-context `not_evaluable` from `--context`.
3. Text-based RED from report content.
4. AMBER.
5. GREEN.

not_evaluable when any of:

- `completion_state !== "success"`
- `report_capture_error !== null`
- `capture_complete === false`
- `capture_scope` not in `{"main section", "body"}`
- `fallback_used === true` AND `expected_sections_captured === false`

`fallback_used=true` **alone** does NOT imply not_evaluable.

## 10 · Integration Helper

`scripts/lib/structural-evidence-integration.mjs` exports:

- `runStructuralEvidence({...})` — spawns validator with 5s timeout,
  validates artifact, returns stable envelope.
- `combineTelemetryVerdict(qi, structural)` — pure function used by
  harness and tests; identical rules for both consumers.

Envelope fields (stable): `evaluation_status`, `verdict`,
`blocking_mode` (always `telemetry_only`), `schema_version`,
`context_schema_version`, `checker_path`, `checker_hash`, `exit_code`,
`duration_ms`, `summary_path`, `context_path`, `context_supplied`,
`capture_context`, `affected_legacy_verdict` (always `false`),
`tool_error`, `stdout_summary`, `stderr_summary`, `red_reasons`,
`amber_reasons`, `not_evaluable_reasons`.

## 11 · Timeout

5 seconds (default). Enforced via `spawnSync(..., { timeout: 5000,
killSignal: "SIGKILL" })`. On timeout the helper returns
`tool_error.reason = "validator_timeout"` with no retry. Existing
generation latency thresholds (`HARD_LATENCY_MS = 240_000`,
`SOFT_LATENCY_MS = 120_000`) are **unchanged**.

## 12 · Validator Hash

SHA-256 content hash of `scripts/structural-evidence-check.mjs` in the
form `sha256:<hex>` (64-char lowercase). Computed via
`readFileSync(validatorPath, "utf8")` +
`crypto.createHash("sha256").update(text).digest("hex")`. Compute
failure → `tool_error.reason = "checker_hash_compute_failed"` but
harness continues.

## 13 · Artifact Validation

For exit 0 / 1 the helper requires the artifact to exist AND parse as
JSON AND have `schema_version` (string) AND `verdict` in
`{green, amber, red, not_evaluable}`. Additionally the helper enforces
an exit ↔ verdict cross-check: exit 1 → verdict MUST be `red`; exit 0
→ verdict MUST NOT be `red`. Mismatches become
`tool_error.reason = "exit_verdict_mismatch"`.

## 14 · Tool-Error Normalization

Every expected integration failure produces a stable tool_error object:

| reason | trigger |
|---|---|
| `report_md_not_saved` | reportSaved=false OR report file missing (not tool_error but `not_run`) |
| `checker_hash_compute_failed` | SHA-256 compute fails (but harness continues) |
| `context_write_failed` | context artifact write fails |
| `validator_spawn_failed` | spawnSync throws |
| `validator_timeout` | 5s timeout hit |
| `validator_exit_2` | validator exited with code 2 |
| `validator_unexpected_exit` | exit not in {0,1,2} |
| `artifact_missing_after_exit_0` | summary file missing after exit 0 |
| `artifact_missing_after_exit_1` | summary file missing after exit 1 |
| `summary_invalid_json` | summary is not valid JSON |
| `summary_invalid_schema` | summary lacks required fields |
| `exit_verdict_mismatch` | exit and verdict disagree |

The helper **never** throws for expected failures.

## 15 · Harness Integration Point

Inserted immediately after `runQuoteIntegrity(...)` returns
(post-report-capture, post-QI, pre-classify) and BEFORE the first
legacy `checks.push` call. This preserves symmetry with QI (both are
sibling telemetry) and prevents accidental coupling to `classify()`.

## 16 · Legacy Checks Preservation

- Structural envelope is stored in local variables
  (`structuralEvidence`, `combinedTelemetryVerdict`) — never pushed
  into `checks[]`.
- Legacy structural 25-check list is unchanged.
- `classify(checks)` receives the same set of `checks` as before.
- I20 static assertion enforces
  `!/checks\.push\([^)]*structural(Evidence|Result|Envelope)/i.test(harnessSrc)`.

## 17 · Process-Exit Preservation

`process.exit(classification.exit)` remains the sole authority for the
harness exit code. I20 statically asserts that the line
`process.exit(classification.exit)` is still present verbatim, and that
neither structural evidence nor combined telemetry is used in any
`process.exit(...)` call.

## 18 · Metadata Integration

Added two blocks inside the single `metadata.json` write:

### `metadata.structural_evidence`

```
{
  "evaluation_status": ...,
  "verdict": ... | null,
  "blocking_mode": "telemetry_only",
  "schema_version": "0.1-phase1",
  "context_schema_version": "0.1-phase2",
  "checker_path": "scripts/structural-evidence-check.mjs",
  "checker_hash": "sha256:<hex>" | null,
  "exit_code": 0 | 1 | 2 | null,
  "duration_ms": <int>,
  "summary_path": ".agent/regression_runs/<runId>/structural_evidence_summary.json" | null,
  "context_path": ".agent/regression_runs/<runId>/structural_evidence_context.json" | null,
  "capture_context": {...} | null,
  "affected_legacy_verdict": false,
  "tool_error": {...} | null
}
```

### `metadata.combined_telemetry`

```
{
  "verdict": "green" | "amber" | "red" | "not_evaluable" | "tool_error",
  "display_only": true,
  "affected_legacy_verdict": false,
  "affected_process_exit": false,
  "quote_integrity_verdict": <string>,
  "structural_evidence_verdict": <string> | null
}
```

Single atomic write via existing `writeFile(metadata.json)`. No
baseline change.

## 19 · verdict.md Integration

Added four sibling sections replacing the previous single
`## Quote integrity` section. Required wording present:

- `## Legacy regression verdict` — "Telemetry sections below … do NOT
  affect this verdict."
- `## Quote integrity telemetry` — "Quote-integrity telemetry does NOT
  affect the legacy verdict."
- `## Structural evidence telemetry` — "Structural-evidence telemetry
  does NOT affect the legacy verdict. A RED telemetry state MUST
  remain visibly RED even when the legacy verdict is GREEN."
- `## Combined telemetry` — "Combined telemetry is display-only.
  Combined telemetry does NOT affect the legacy verdict. Combined
  telemetry does NOT affect the harness process exit. Do NOT describe
  the overall run simply as GREEN when telemetry contains RED."

Excluded from `verdict.md`: full report body, full quote text, long
quote excerpts, resume, proprietary content.

## 20 · Combined Telemetry

Rules (implemented in `combineTelemetryVerdict`):

- `tool_error` if either QI or structural has `tool_error`.
- `red` if either has `verdict === "red"` and neither is `tool_error`.
- `amber` if neither red and either has `verdict === "amber"`.
- `not_evaluable` if neither red/amber and at least one is
  `not_evaluable` (or unknown/null).
- `green` if both are `green`.

Display-only — never inserted into `checks[]`, never used for
`process.exit`.

## 21 · Quote-Integrity Preservation

- `scripts/quote-integrity-check.mjs` **unchanged** (git diff empty).
- `runQuoteIntegrity` signature and envelope **unchanged**.
- Quote-integrity artifact `quote_integrity_summary.json` **unchanged**.
- R1 / R2 policies **unchanged**.
- No new QI match tier added.
- QI verdict remains independent from structural verdict.

## 22 · Deterministic Tests

- Phase 1 `scripts/test-structural-evidence-check.mjs`: **40/40 PASS**
  (26 Phase 1 preserved + 14 CTX1-CTX14).
- Phase 2 `scripts/test-structural-evidence-integration.mjs`:
  **26/26 PASS** (I1-I20 original + I21-I26 evaluability-regression
  added in the 2026-07-24_run_07 correction).
- Total: **66/66 PASS**.
- `npx tsc --noEmit`: exit 0.
- `node --check` on all 5 changed / new `.mjs` files: OK.

### I21-I26 (correction regression coverage)

- **I21** · complete capture + missing Appendix → structural RED
  (evaluable) · exit_code=1 · legacy verdict unchanged.
- **I22** · complete capture + zero citations → structural RED.
- **I23** · complete capture + only 4 gaps → structural RED
  (`observed_gap_count_4_not_5`).
- **I24** · true truncated capture (`completion_state="hard_timeout"`,
  `selectedLength=0`, `scope="unset"`) → `deriveCaptureCompleteness`
  returns `captureComplete=false`; end-to-end
  `structural.verdict=not_evaluable`.
- **I25** · fallback captured a complete container
  (`fallbackUsed=true`, `scope="body_fallback"`, complete text) →
  `captureComplete=true` · `captureScopeForContext="body"` · normal
  evaluation (GREEN for a well-formed report).
- **I26** · circularity closed · static source assertions:
  `runStructuralEvidence({...})` invocation region does NOT reference
  `selectedHasEvidence`, `selectedMarkerHits`, `REPORT_SECTION_MARKERS`,
  or `EVIDENCE_APPENDIX_RE`; the `deriveCaptureCompleteness({...})`
  call region does NOT reference any of them; the helper module itself
  does NOT reference any of them (docstring rephrased to avoid the
  banned identifier tokens).

## 23 · Phase 1 Backward Compatibility

- CLI without `--context` still works (I16).
- `capture_context` in artifact is `null` when standalone (CTX12).
- Synthetic truncation marker still triggers not_evaluable when NO
  context is supplied (N2 pass).
- Explicit context OVERRIDES the marker (CTX11).
- Real harness always supplies context, so production is never fooled
  by a marker string appearing in report content.

## 24 · Static Assertions

I20 verifies:

- `process.exit(classification.exit)` still present in harness.
- No `checks.push` uses a structural variable.
- Helper does not import `playwright`.
- Helper does not import `node:http`/`node:https`.
- Helper does not use `fetch`.
- Helper always emits `affected_legacy_verdict: false`.
- Helper does not reference `regression_baselines`.

## 25 · Validation Results

| step | command | result |
|---|---|---|
| Phase 1 tests | `node scripts/test-structural-evidence-check.mjs` | **40 passed, 0 failed** (exit 0) |
| Phase 2 tests | `node scripts/test-structural-evidence-integration.mjs` | **26 passed, 0 failed** (exit 0) |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Syntax check | `node --check` (helper + harness + Phase 2 tests) | all OK |
| QI checker diff | `git diff scripts/quote-integrity-check.mjs` | 0 lines |
| `src/` diff | `git diff src/` | 0 lines |
| baseline diff | `git diff .agent/regression_baselines/` | 0 lines |
| `.agent/scripts/` diff | `git diff .agent/scripts/` | 0 lines |
| Timeout test | I12 (500ms cap, 4s sleep stub) | validator_timeout confirmed |
| No-retry test | I19 (spawn counter) | exactly 1 spawn confirmed |
| Process-exit test | I20 (static assertion) | `process.exit(classification.exit)` intact |
| **Missing-Appendix RED test** | **I21** (complete capture, no Appendix) | structural RED · exit_code=1 · **evaluable** |
| **Zero-citations RED test** | **I22** (complete capture, no citations) | structural RED · exit_code=1 · **evaluable** |
| **4-gap RED test** | **I23** (complete capture, 4 gaps) | structural RED · exit_code=1 · **evaluable** |
| **True truncation test** | **I24** (hard_timeout, selectedLength=0) | `captureComplete=false` · **not_evaluable** |
| **Fallback complete test** | **I25** (body fallback, complete container) | `captureComplete=true` · normal GREEN evaluation |
| **Circularity-closed test** | **I26** (source assertions) | no banned identifiers in the invocation / derivation / helper |

## 26 · Baseline Boundaries

- `.agent/regression_baselines/**` **UNCHANGED** (verified by I17 test
  + git diff).
- Phase 4 will handle baseline metadata migration under a separate
  DECISION and grandfathering policy.
- The pre-existing `metadata.baseline_metadata.json` in each baseline
  still has `quote_integrity: {...}` from 5e-migrate. No
  `structural_evidence` sub-block was added; that is Phase 4's job.

## 27 · Known Limitations

- Combined telemetry uses `evaluation_status: not_run` for QI when
  `checkerExecuted=false`. QI's own envelope does not carry a formal
  `evaluation_status` field, so we approximate. This affects display
  only and cannot cause false-GREEN under the rules.
- The integration has not yet been exercised against a real Fixture A
  or B report — Phase 3 is where that happens under a separate GO and
  ~$0.10 cost approval.
- Context file `structural_evidence_context.json` retains a sanitized
  copy of harness capture facts (schema, scope, fallback flag, etc.).
  This is intentional (audit) and contains no report body or quotes.
- The 5s timeout is generous for a linear scan of a Markdown report
  (Phase 1 tests complete in <1s), but future validator refactors
  could push it up. Guardrail: I12 test would catch regression.
- SHA-256 hash reads the validator file each run. Cost is negligible
  (~1ms). Rejected git blob hash to avoid `git` binary dependency.

## 28 · Rollback

- Revert the harness-patch commit → `scripts/report-regression-local.mjs`
  returns to pre-Phase-2 shape (no structural invocation, no
  `metadata.structural_evidence`, no `## Structural evidence
  telemetry` section).
- `--context` extension on the validator can remain (backward-compatible)
  OR be reverted; standalone Phase 1 tests still pass either way.
- Helper module can be deleted or kept dormant.
- No prompt rollback needed.
- No baseline restoration needed.
- Zero downstream impact.

## 29 · Risks

1. Helper + harness patch is the largest `scripts/` change since
   5c-integrate. Mitigated by keeping structural block strictly
   additive and covering with 20 deterministic integration tests + 14
   context-mode tests + preserved 26 Phase 1 tests (60 total).
2. Combined telemetry may be misread as authoritative. Mitigated by
   `display_only: true` + verdict.md wording + `affected_legacy_verdict:
   false` + `affected_process_exit: false`.
3. `capture_complete` correctness depends on harness facts. Mitigated
   by deriving strictly from `completion_state === "success"` AND
   `reportText` non-empty AND marker/appendix regex hits — never from
   validator output.
4. Context JSON persistence may confuse future maintainers. Mitigated
   by inline comment + memo § 8 truth table.
5. Cross-platform spawn timeout behavior varies. Mitigated by
   `killSignal: "SIGKILL"` and explicit `signal`/`elapsed` timeout
   detection.
6. Telemetry-only RED may be overlooked operationally. Mitigated by
   verdict.md required wording "RED telemetry state MUST remain
   visibly RED even when the legacy verdict is GREEN".
7. No fresh generated-report evidence yet. Phase 3 addresses this.
8. `metadata.combined_telemetry.quote_integrity_verdict` may show
   values like `"blocked_no_report"` or `"unknown"` when QI could not
   run — no false GREEN can result because such states are treated as
   NOT green in the combine rules.

## 30 · Boundaries Respected

- ✅ no report generation
- ✅ no A/B run
- ✅ no LLM / Anthropic / OpenAI call
- ✅ no Playwright launch
- ✅ no dev server
- ✅ no `scripts/quote-integrity-check.mjs` change (0-line diff)
- ✅ no `src/**` change (0-line diff)
- ✅ no `src/lib/prompts.ts` change
- ✅ no API route change
- ✅ no `.agent/regression_baselines/**` change (0-line diff)
- ✅ no `.agent/scripts/**` change (0-line diff)
- ✅ no `package.json` / lockfile / workflow / env / `vercel.json`
  change
- ✅ no pipeline change (`b019786` untouched)
- ✅ no new dependency (Node stdlib only)
- ✅ no R1 / R2 / QI-tier change
- ✅ no threshold / retry change (`HARD_LATENCY_MS = 240_000`,
  `SOFT_LATENCY_MS = 120_000` untouched)
- ✅ no baseline mutation
- ✅ no legacy `checks[]` addition
- ✅ no `classify(checks)` modification
- ✅ no process-exit modification (`process.exit(classification.exit)`
  intact)
- ✅ no blocking promotion
- ✅ no `AgentOps-5f-promote`
- ✅ no post-generation report rewriting
- ✅ no fuzzy matching / edit-distance / LLM judge / post-generation
  replacement
- ✅ no push · no deploy
- ✅ QI remains telemetry-only
- ✅ Structural lint remains telemetry-only
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human`
- ✅ Q10 pause · Codex planner spec-only
- ✅ **cost $0**
