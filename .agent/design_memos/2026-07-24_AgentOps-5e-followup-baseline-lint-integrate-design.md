# Design memo · AgentOps-5e-followup-baseline-lint-integrate-design · Phase 2 harness integration

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-baseline-lint-integrate-design
- **parent_loop**: AgentOps-5e-followup-baseline-lint-implement (`2026-07-24_run_05` · Phase 1 complete)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_05_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_06_TASK.md`
- **cost**: **$0**

## 1 · Purpose

Design (but not implement) Phase 2 harness telemetry integration
for the standalone structural-evidence validator built in Phase 1.
Define how `scripts/report-regression-local.mjs` invokes the
validator after report capture, passes explicit capture context,
emits `structural_evidence_summary.json`, records validator status /
exit / duration / implementation hash, and surfaces QI + structural
telemetry side-by-side — while preserving the legacy regression
verdict unchanged and avoiding retries, rewriting, baseline
mutation, and blocking promotion.

## 2 · Background

Phase 1 (`2026-07-24_run_05`) shipped:

- `scripts/structural-evidence-check.mjs` — standalone deterministic
  CLI (Node stdlib only)
- `scripts/test-structural-evidence-check.mjs` — 26/26 deterministic
  tests including canonical G2 (5/5/4/4 GREEN)
- `scripts/fixtures/structural-evidence/` — synthetic fixtures
- Telemetry-only from day 1 · no harness integration

Phase 2 wires this into the local regression harness so every
committed run emits a `structural_evidence_summary.json` alongside
`quote_integrity_summary.json`. **Legacy verdict is not touched.**

## 3 · Phase 1 result

- 26 / 26 deterministic tests PASS
- Canonical G2 (5 lines · 5/5 gaps · 4 unique jd_ids · 4 Appendix
  rows) → GREEN · exit 0 · no AMBER for repeated_jd
- Standalone CLI · zero-dep · atomic write · no rewriting · no
  network · no LLM
- Documented capture-sufficiency limitation: standalone text alone
  cannot distinguish truncation from genuine Appendix omission
- Phase 2 MUST supply harness context

## 4 · Scope

Design only. No code / prompt / script change. No generation. No
fixture run. No LLM/API. Cost $0.

## 5 · Out of scope

- Implementation
- Fixture A/B generation
- Baseline metadata mutation (deferred to Phase 4)
- Structural lint becoming blocking (deferred to Phase 6)
- `AgentOps-5f-promote`
- Any modification of `scripts/quote-integrity-check.mjs`
- Any change to R1 / R2 / thresholds
- `src/**` · `.agent/scripts/**` · pipeline

## 6 · Current harness lifecycle

18 steps ordered from `run_dir_created` through
`process_exit_classification`. Highlights:

- **~line 800-810**: `report.md` saved to scratchpad
- **~line 819-827**: `runQuoteIntegrity(...)` invoked · writes
  `quote_integrity_summary.json` to `runDir`
- **~line 830-1077**: legacy `checks.push(...)` builds the 25-check
  structural list; `classify(checks)` produces
  `{verdict, exit, red, amber}`
- **~line 1080-1139**: metadata object built (includes
  `quote_integrity` sub-block at ~1128)
- **~line 1141-1145**: write `metadata.json`
- **~line 1147-1151**: write `structural_checks.json`
- **~line 1153-1188**: build + write `network_diagnostics.json`
- **~line 1190-1262**: build `verdict.md` (Red / Amber / Quote
  integrity / Network diagnostics / Artifacts sections)
- **~line 1264**: write `verdict.md`
- **~line 1285**: `process.exit(classification.exit)` — legacy exit
  code, NOT influenced by QI

Full inventory in
`.agent/findings/2026-07-24_structural_lint_harness_integration_inventory.json`
under `harness_lifecycle`.

## 7 · Current quote-integrity integration

`runQuoteIntegrity({ repoRoot, reportPath, reportSaved, corpusPath,
outPath, fixtureId, runId })` at line 819 spawns
`scripts/quote-integrity-check.mjs` via `spawnSync`, returns a
normalized envelope `{ verdict, schema_version, counts, red_reasons,
amber_reasons, blocking_mode, summary_path }`, and is embedded into
`metadata.quote_integrity` (line 1128) and `verdict.md` `## Quote
integrity` section (line 1227). **Never throws. Blocking mode
`telemetry_only`.**

This is the model Phase 2 mirrors for `runStructuralEvidence(...)`.

## 8 · Selected structural-lint integration point

**Option B — immediately after `runQuoteIntegrity(...)` returns
(line ~828) and before the first legacy `checks.push(...)` (line
~830).**

Rationale:

- Symmetric with QI · report.md and capture context both final
- Metadata block can include both `quote_integrity` and
  `structural_evidence` sub-blocks
- `verdict.md` can display both side-by-side
- Minimal disturbance to legacy 25-check flow
- Legacy exit code (from `classify(checks)`) remains untouched

Constraints:

- Must not spawn if `report.md` was not saved (mirror QI's
  `blocked_no_report` path)
- Must never rethrow; helper returns an envelope like
  `runQuoteIntegrity`
- Must not affect `classify(checks)` result
- Must not push into the `checks[]` array (legacy verdict source-of-
  truth stays untouched)

## 9 · Capture-context problem

Phase 1 documented that standalone text alone cannot reliably
distinguish truncation from a genuinely missing Appendix. Phase 2
therefore MUST pass explicit capture context from the harness. The
synthetic marker `<!-- STRUCTURAL_EVIDENCE_TRUNCATED -->` is
**test-only** and MUST NOT appear in real reports; real runtime
integration MUST NOT depend on it.

## 10 · Context-interface options

- **A · multiple new CLI flags** — REJECT (quoting surface · hard
  to extend)
- **B · temporary JSON context file via `--context <path>`** —
  **PRIMARY**
- **C · environment variables** — REJECT (opaque · poor schema)
- **D · stdin JSON envelope** — REJECT (composition awkward)

## 11 · Selected context contract

**Temporary JSON file · single new CLI flag `--context <path>`.**

- **Path convention**: harness writes
  `<runDir>/structural_evidence_context.json` (retained as
  sanitized artifact for audit · small · no proprietary content).

### Fields (schema `0.1-phase2`)

- `schema_version` — `"0.1-phase2"`
- `capture_scope` — one of `main section | body | none`
- `fallback_used` — boolean
- `completion_state` — `success | application_error | hard_timeout
  | navigation_error | not_started`
- `capture_complete` — boolean (true when completion_state=success
  AND capture covers the full report)
- `report_capture_error` — string | null
- `report_char_count` — number
- `expected_sections_captured` — boolean (true when required section
  markers Target role / Your top 5 gaps / Evidence Appendix are
  present in reportText)
- `source` — `"report-regression-local"`

**Malformed context** → tool_error (validator exit 2).

## 12 · CLI-extension design

Extend `scripts/structural-evidence-check.mjs` with **optional**
`--context <path>` while preserving current two-argument behavior:

- Existing Phase 1 invocation `--report <p> --output <p>` continues
  to work
- Synthetic marker remains supported for Phase 1 test compatibility
- **Explicit context takes precedence over synthetic marker**
- Real harness never emits or depends on marker
- Context file missing when flag present → tool_error exit 2
- Context malformed → tool_error exit 2
- Context `schema_version` unknown → tool_error exit 2 · do NOT
  silently ignore
- Context absent (flag not passed) → preserve pure text-based
  standalone behavior
- Context indicates `capture_complete=false` → verdict
  `not_evaluable` with reason `capture_incomplete_from_harness_context`

## 13 · Capture-sufficiency rules

### `not_evaluable` when

- `completion_state !== 'success'`
- `capture_complete === false`
- `report_capture_error !== null`
- `capture_scope` not in evaluable_capture_scopes
- `fallback_used === true` AND `expected_sections_captured === false`

### Structurally evaluable when

- `completion_state === 'success'`
- `capture_complete === true`
- `capture_scope` in `['main section', 'body']`
- `report_capture_error === null`

### Nuances

- **`fallback_used=true` alone does NOT imply not_evaluable** — if
  fallback still captures the full report
  (`expected_sections_captured=true`), classification proceeds
  normally; existing AMBER `report_capture_scope_not_body` legacy
  check continues to surface the fallback separately.
- **Unknown `capture_scope`** must NOT silently become evaluable —
  treat as `not_evaluable` with reason `unknown_capture_scope`.
- **Missing context fields** → tool_error (do NOT guess).

### Precedence ordering

1. `tool_error` (validator or harness spawn failure)
2. Harness-context `not_evaluable` (from `--context`)
3. Text-based structural RED (from report content)
4. AMBER (from report content)
5. GREEN (from report content)

## 14 · Artifact lifecycle

- **Output**: `<runDir>/structural_evidence_summary.json` (atomic
  write via Phase 1's temp+rename)
- **Context**: `<runDir>/structural_evidence_context.json` (retained
  sanitized artifact)
- Harness records: `attempted` · `command` · `exit_code` ·
  `duration_ms` · `checker_hash` · `schema_version` · `verdict` ·
  `blocking_mode` · `context_supplied` · `context_schema_version` ·
  `tool_error_details` · `summary_path`
- **Temp-context persistence**: retain the sanitized context file —
  small · aids audit · no proprietary content.

## 15 · Metadata integration

Add block to `metadata.structural_evidence`:

```json
{
  "evaluation_status": "completed | not_evaluable | tool_error | not_run",
  "verdict": "green | amber | red | not_evaluable | null",
  "blocking_mode": "telemetry_only",
  "schema_version": "0.1-phase1",
  "checker_path": "scripts/structural-evidence-check.mjs",
  "checker_hash": "sha256:<hex>",
  "exit_code": 0,
  "duration_ms": 12,
  "summary_path": ".agent/regression_runs/<runId>/structural_evidence_summary.json",
  "context_path": ".agent/regression_runs/<runId>/structural_evidence_context.json",
  "capture_context": {
    "capture_scope": "main section",
    "fallback_used": false,
    "completion_state": "success",
    "capture_complete": true
  },
  "affected_legacy_verdict": false
}
```

- `verdict = null` iff `evaluation_status ∈ {tool_error, not_run}`
- `tool_error`: `exit_code` recorded (2 or null on spawn fail),
  `summary_path=null` unless a partial artifact exists
- `not_run`: reason like `report_md_not_saved` (mirrors QI
  blocked_no_report)
- **Single metadata write** — harness patches
  `structural_evidence` INTO the metadata object built at ~line 1080
  BEFORE writing `metadata.json` (atomic)
- **No baseline change** — Phase 2 does NOT touch
  `.agent/regression_baselines/**`

## 16 · verdict.md integration

Add `## Structural evidence telemetry` section as sibling of
`## Quote integrity`:

```
## Structural evidence telemetry

- **Verdict**: **GREEN** (or AMBER / RED / not_evaluable / tool_error)
- **Exit code**: 0
- **Checker hash**: `sha256:abcd1234...`
- **Capture scope**: `main section` · `capture_complete=true`
- **Citations**: 5 lines · covered 5/5 gaps
- **Appendix**: present · 4 rows
- **Body ↔ Appendix**: all cited jd_ids in Appendix
- **Blocking mode**: `telemetry_only` — does NOT affect legacy
  regression verdict.
```

Required wording:

- "Structural telemetry does NOT affect legacy verdict."
- "Quote-integrity telemetry does NOT affect legacy verdict."
- "RED telemetry is not silently presented as overall GREEN."
- Overall display MUST NOT mask either result.

Excluded from output:

- Full report body
- Full quote text
- Long quote excerpts

## 17 · Combined telemetry semantics

- **Field**: `combined_telemetry_verdict`
- **Location**: `metadata.combined_telemetry` (single source of
  truth) + brief echo in `verdict.md`

### Rules

- **RED** if either QI or structural verdict is `red`
- **AMBER** if neither is red AND (QI or structural is `amber`)
- **not_evaluable** if one cannot be evaluated AND neither is red
- **GREEN** if both are green
- **tool_error** if either has tool_error

### Phase 2 impact

- Does NOT affect harness process exit code
- Does NOT affect legacy verdict
- **Display-only**

## 18 · Validator exit handling

| exit | artifact | action |
|---|---|---|
| **0** | expected | verdict ∈ {green, amber, not_evaluable} · continue normally |
| **1** | expected | verdict=red · continue normally · legacy verdict unchanged · legacy process exit unchanged |
| **2** | not expected | record tool_error · continue metadata/verdict write · legacy verdict unchanged · **no retry** · **no silent ignore** |
| spawn fail | n/a | tool_error `validator_spawn_failed` · exit_code=null |
| timeout | n/a | tool_error `validator_timeout` · exit_code=null |
| artifact missing despite 0/1 | n/a | tool_error `artifact_missing_after_exit_${code}` · verdict=null |
| artifact malformed | n/a | tool_error `artifact_malformed_json` · verdict=null |
| checker_hash compute fail | n/a | tool_error `checker_hash_compute_failed` · continue with verdict from artifact if present |
| report file missing | n/a | skip invocation · evaluation_status=not_run · reason `report_md_not_saved` |
| context file write fail | n/a | tool_error `context_write_failed` · skip validator invocation · continue metadata/verdict write |

## 19 · Timeout policy

- **Selected**: **5 seconds**
- Rationale: validator is local · linear scan · Phase 1 tests
  complete in <1 s each · 5 s provides ample headroom
- Timeout effect: kill child process · record tool_error with
  reason `validator_timeout` · **no retry** · legacy verdict
  unchanged · **existing latency thresholds
  (`HARD_LATENCY_MS = 240_000` · `SOFT_LATENCY_MS = 120_000`)
  unchanged**

## 20 · Implementation hash

- **Selected**: **SHA-256 content hash** of
  `scripts/structural-evidence-check.mjs`
- **Field name**: `checker_hash`
- **Format**: `"sha256:<hex>"` (64-char lowercase hex prefixed by
  algorithm)
- Rationale: identifies exact validator implementation independent
  of git state · robust · comparable across environments
- Rejected: short git commit (requires git binary) · git blob hash
  (harder to reproduce)
- **Computation**: `readFileSync(validatorPath, 'utf8')` →
  `crypto.createHash('sha256').update(text).digest('hex')`
- Compute fail: record tool_error `checker_hash_compute_failed`, but
  continue

## 21 · Error-path handling

See § 18 table. Every error path:

- Records `tool_error_details` in metadata
- Continues harness artifact completion where possible
- Never mutates legacy verdict
- Never auto-retries
- Never silently ignores

## 22 · Deterministic integration test matrix

20 tests (I1-I20) covering:

- I1-I4: GREEN / AMBER / RED / not_evaluable structural verdicts
- I5: validator tool_error
- I6-I9: QI × structural verdict combinations (2×2 red matrix)
- I10-I11: artifact missing / malformed
- I12: validator timeout
- I13: context schema invalid
- I14-I15: fallback capture incomplete / complete
- I16: Phase 1 CLI backward compat (no `--context`)
- I17: no baseline files changed
- I18: no report body embedded in artifacts
- I19: no validator retry
- I20: legacy process exit code unchanged

Each test defines expected metadata block, verdict.md text, and
process behavior. **No report generation.** **No LLM.** **No
network.**

## 23 · Test architecture options

- **A · export helpers from harness** — REJECT (forces harness
  refactor)
- **B · new helper module** — **PRIMARY**
- **C · spawn whole harness no-generation mode** — REJECT (harder
  to isolate)
- **D · static source assertions only** — REJECT alone · adopt as
  supplement

## 24 · Selected test architecture

**Option B — new helper module (integration adapter)** plus
supplemental static source assertions for backward-compat guarantees.

- New file: `scripts/lib/structural-evidence-integration.mjs`
- Exports a pure function `runStructuralEvidence({ ... })` that
  spawns the CLI, handles timeout / errors, computes checker_hash,
  and returns a normalized envelope
- Harness invokes it and embeds the envelope in metadata

## 25 · Future implementation files

- `scripts/structural-evidence-check.mjs` — extend with `--context`
  support only (+~40 lines)
- `scripts/test-structural-evidence-check.mjs` — add context-mode
  tests (preserve all 26 existing) (+~150 lines)
- `scripts/report-regression-local.mjs` — invoke validator +
  metadata block + verdict.md block (+~80 lines)
- `scripts/lib/structural-evidence-integration.mjs` — new helper
  module (+~120 lines)
- `scripts/test-structural-evidence-integration.mjs` — new
  deterministic integration tests (+~250 lines)
- `scripts/fixtures/structural-evidence/` — add context-mode fixture
  reports (+~5 files)
- New TASK / implementation memo / RUN_REPORT

**Explicitly forbidden**:

- `scripts/quote-integrity-check.mjs` (unchanged)
- `src/**`
- `src/lib/prompts.ts`
- `.agent/regression_baselines/**`
- `src/app/api/**`
- `package.json` / `package-lock.json` / workflows / env /
  `vercel.json`
- Pipeline
- `.agent/scripts/**`

## 26 · Legacy-verdict preservation

Legacy verdict is produced by `classify(checks)` at ~line 517.
Structural evidence:

- **Never** pushes into `checks[]`
- **Never** modifies `classify()` inputs or outputs
- **Never** changes `process.exit(classification.exit)` at ~line 1285
- Only records `structural_evidence.affected_legacy_verdict: false`
  in metadata (belt-and-suspenders documentation)

## 27 · Baseline boundaries

- Phase 2 does NOT touch `.agent/regression_baselines/**`
- Phase 4 (deferred) will handle baseline metadata migration
- Grandfathering exception required for that phase (analogous to
  `AgentOps-5e-migrate`)

## 28 · Rollout

Phase 2 scope:

- Implementation + deterministic tests only
- No A/B generation
- No paid API
- Telemetry-only
- No baseline migration
- No blocking impact

**Does NOT authorize**: report generation · Fixture A/B runs ·
baseline migration · blocking promotion · stability runs ·
`AgentOps-5f-promote`.

## 29 · Rollback

- Revert Phase 2 harness patch commit
- `structural-evidence-check.mjs --context` extension can remain
  (backward-compatible) OR be reverted
- Remove `metadata.structural_evidence` block emission
- Remove `## Structural evidence telemetry` section from
  `verdict.md`
- No prompt rollback required
- No baseline restoration required
- Zero downstream impact

## 30 · Policy resolutions

| Q | Question | Recommendation |
|---|---|---|
| Q1 | Integration point? | Option B — after `runQuoteIntegrity()` and before first legacy `checks.push` |
| Q2 | CLI args or context JSON? | Option B — `--context <path>` |
| Q3 | Context overrides synthetic marker? | Yes |
| Q4 | Evaluable capture_scope values? | `main section` and `body` |
| Q5 | fallback_used=true implies not_evaluable? | No — only when also `expected_sections_captured=false` |
| Q6 | Exit 1 behavior? | Record RED · legacy verdict unchanged · legacy exit unchanged |
| Q7 | Exit 2 behavior? | Record tool_error · no retry · no silent ignore |
| Q8 | Structural RED changes legacy verdict? | **No** |
| Q9 | Structural RED changes harness process exit? | **No** |
| Q10 | Combined telemetry storage? | `metadata.combined_telemetry` + brief echo in verdict.md |
| Q11 | Validator hash? | SHA-256 content hash, `checker_hash: "sha256:<hex>"` |
| Q12 | Validator timeout? | 5 seconds |
| Q13 | Retry allowed? | **No** |
| Q14 | Phase 2 touches baseline metadata? | **No** |
| Q15 | Phase 2 requires A/B generation? | **No** |
| Q16 | Phase 3 auto-authorized? | **No** (separate DECISION + $0.10 cost approval) |
| Q17 | Phase 2 can modify QI checker? | **No** |
| Q18 | Phase 2 can alter thresholds? | **No** |
| Q19 | Incomplete capture classification? | not_evaluable — never RED · classified via explicit harness context |
| Q20 | `AgentOps-5f-promote` authorized? | **No** |

## 31 · Risks

1. Helper module + harness patch is the largest `scripts/` change
   since 5c-integrate; mitigated by keeping structural block
   strictly additive and covering with deterministic integration
   tests.
2. Metadata schema addition may affect downstream consumers if any
   exist (currently none — 5e-migrate proved zero code consumers of
   `baseline_metadata.json`; run-level `metadata.json` has no known
   consumers either).
3. `verdict.md` format change is user-facing; wording must not
   imply structural affects legacy verdict.
4. SHA-256 hash requires `readFileSync` on every run — cheap but
   adds a tiny I/O.
5. Context JSON file adds one write per run; retained for audit but
   may confuse users unfamiliar with its purpose (mitigated by
   docstring).
6. Timeout of 5 s must not be triggered by legitimate reports;
   validator is fast but future report growth could exceed if
   implementation is refactored.
7. Combined telemetry field must be clearly labeled non-blocking to
   avoid misinterpretation.
8. Backward compat with Phase 1 CLI (no `--context`) must remain —
   validator MUST NOT require `--context`.
9. If harness spawn logic differs subtly between platforms, helper
   module must handle both.
10. Not-evaluable classification depends on harness context
    correctness; a bug in harness context construction could hide
    real Appendix omissions — mitigated by cross-checking
    `capture_scope` enumeration explicitly.

## 32 · Open questions

All resolved with executor recommendations in § 30. None outstanding
for the design.

## 33 · Recommendations

- Approve this design.
- Next loop: **`AgentOps-5e-followup-baseline-lint-integrate-implement`**
  (Phase 2 implementation) — **$0** — implement harness invocation
  + helper module + integration tests · **no** paid A/B in Phase 2.
- Explicit GO required per loop.
- Do NOT skip to Phase 3 (paid A+B).
- Do NOT touch baselines in Phase 2.

## 34 · Boundaries respected

- ✅ no implementation
- ✅ no code / prompt / script change
- ✅ no generation · no fixture run · no Playwright · no dev server
- ✅ no LLM / API call
- ✅ no checker / parser / harness change
- ✅ no R1 / R2 relaxation · no new match tier
- ✅ no baseline mutation · no promotion · no blocking promotion ·
  no `AgentOps-5f-promote`
- ✅ no pipeline change · no `.agent/scripts/**` change
- ✅ no threshold / retry / package / config / workflow / env /
  Vercel change
- ✅ no C/D/E · no A-E · no PDFs · no OpenAI API
- ✅ no LLM judge · no edit-distance · no fuzzy · no post-generation
  quote replacement · no silent quote rewriting
- ✅ no `report.md` / screenshot / full body / long quote / secret
  committed
- ✅ QI remains telemetry-only
- ✅ Structural lint remains telemetry-only (design-only Phase 2)
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human` · Q10 pause · Codex
  planner spec-only
- ✅ **cost $0**
