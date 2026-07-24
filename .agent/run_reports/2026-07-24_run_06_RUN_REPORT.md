# RUN REPORT · AgentOps-5e-followup-baseline-lint-integrate-design · Phase 2 harness integration design

## Metadata

- **task_id**: `2026-07-24_run_06`
- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-baseline-lint-integrate-design
- **parent_loop**: AgentOps-5e-followup-baseline-lint-implement (`2026-07-24_run_05`)
- **task_path**: `.agent/tasks/2026-07-24_run_06_TASK.md`
- **findings_path**: `.agent/findings/2026-07-24_structural_lint_harness_integration_inventory.json`
- **memo_path**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-design.md`
- **impl_commit**: `e3208d9` (Design structural lint harness integration)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_05_DECISION.md`

## Regression verdict

- **regression_required**: no
- **reason_required_or_not**: design-only Phase 2 harness-integration
  planning; no runtime, prompt, checker, harness, baseline, or
  generation behavior changed
- **harness_used**: no
- **harness_command**: not_run
- **fixture_ids**: none
- **target_environment**: local design inspection
- **latest_run_id**: not_applicable
- **verdict**: `not_required`
- **exit_code**: not_applicable
- **artifact_paths**:
  - `.agent/tasks/2026-07-24_run_06_TASK.md`
  - `.agent/findings/2026-07-24_structural_lint_harness_integration_inventory.json`
  - `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-design.md`
- **report_char_count**: not_applicable
- **capture_scope**: not_applicable
- **fallback_used**: not_applicable
- **red_checks_failed**: not_applicable
- **amber_checks_failed**: not_applicable
- **cost_measured**: **true**
- **estimated_cost**: **$0**
- **duration_ms**: not_applicable
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Selected integration point

**Option B** — immediately after `runQuoteIntegrity(...)` returns
(line ~828) and before the first legacy `checks.push(...)` (line
~830). Symmetric with QI · report.md + capture context both final ·
metadata block can include both sub-blocks · verdict.md can display
both side-by-side · legacy verdict + exit untouched.

## Selected context contract

**Temporary JSON file** via optional `--context <path>` (schema
`0.1-phase2`). Fields: `schema_version` · `capture_scope` ·
`fallback_used` · `completion_state` · `capture_complete` ·
`report_capture_error` · `report_char_count` ·
`expected_sections_captured` · `source`. Malformed context →
tool_error exit 2. Sanitized context file retained in runDir for
audit.

## CLI extension

Extend `scripts/structural-evidence-check.mjs` with **optional**
`--context <path>` while preserving Phase 1 two-argument behavior.
Explicit context takes precedence over synthetic marker. Real
harness never emits or depends on the marker.

## Capture-sufficiency rules

- **not_evaluable when**: `completion_state !== 'success'` OR
  `capture_complete === false` OR `report_capture_error !== null` OR
  `capture_scope` not in `['main section', 'body']` OR
  (`fallback_used === true` AND `expected_sections_captured ===
  false`)
- **evaluable when**: opposite
- **fallback_used=true alone does NOT imply not_evaluable**
- **Unknown `capture_scope`** must NOT silently become evaluable
- **Missing context fields** → tool_error
- **Precedence**: tool_error > harness-context not_evaluable >
  text-based RED > AMBER > GREEN

## Metadata integration

Add `metadata.structural_evidence` block: `evaluation_status` ·
`verdict` · `blocking_mode` · `schema_version` · `checker_path` ·
`checker_hash` · `exit_code` · `duration_ms` · `summary_path` ·
`context_path` · `capture_context.*` · `affected_legacy_verdict:
false`. Single atomic write; harness patches block INTO the metadata
object built at ~line 1080 BEFORE writing `metadata.json`.
**No baseline change.**

## verdict.md integration

Add `## Structural evidence telemetry` as sibling of
`## Quote integrity`. Required wording:

- "Structural telemetry does NOT affect legacy verdict."
- "Quote-integrity telemetry does NOT affect legacy verdict."
- "RED telemetry is not silently presented as overall GREEN."

Excluded: full report body · full quote text · long quote excerpts.

## Combined telemetry semantics

Field `combined_telemetry_verdict` in `metadata.combined_telemetry`
+ brief echo in `verdict.md`. **RED** if either is red · **AMBER**
if neither red and either amber · **not_evaluable** if one cannot
be evaluated and neither red · **GREEN** if both green ·
**tool_error** if either has tool_error. **Does NOT affect harness
process exit code · does NOT affect legacy verdict · display-only.**

## Exit / error / timeout behavior

- Exit **0** → verdict ∈ {green, amber, not_evaluable} · continue
- Exit **1** → RED · continue · legacy verdict unchanged · legacy
  exit unchanged
- Exit **2** → tool_error · continue metadata/verdict write · no
  retry · no silent ignore
- Spawn fail / artifact missing / artifact malformed / hash compute
  fail → tool_error with specific reason
- **Timeout: 5 seconds** · kill child · tool_error `validator_timeout`
- **Existing latency thresholds** (`HARD_LATENCY_MS = 240_000` ·
  `SOFT_LATENCY_MS = 120_000`) **unchanged**

## Implementation hash policy

**SHA-256 content hash** of
`scripts/structural-evidence-check.mjs` · field `checker_hash:
"sha256:<hex>"` · computed via `readFileSync` + `crypto.createHash`.
Compute fail → tool_error `checker_hash_compute_failed` but continue.

## Deterministic test matrix

**20 integration tests (I1-I20)** covering GREEN / AMBER / RED /
not_evaluable · validator tool_error · 4 QI × structural verdict
combinations · artifact missing / malformed · timeout · context
schema invalid · fallback complete vs incomplete · Phase 1 backward
compat · no baseline change · no report body embedded · no retry ·
legacy process exit unchanged. **No report generation · no LLM · no
network.**

## Selected test architecture

**Option B — new helper module (integration adapter) +
supplemental static source assertions**. New file
`scripts/lib/structural-evidence-integration.mjs` exports a pure
`runStructuralEvidence({ ... })` mirroring `runQuoteIntegrity`
envelope pattern.

## Future implementation scope

- `scripts/structural-evidence-check.mjs` — extend with `--context`
  (+~40 lines)
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

**Explicitly forbidden**: `scripts/quote-integrity-check.mjs` ·
`src/**` · `src/lib/prompts.ts` · `.agent/regression_baselines/**` ·
`src/app/api/**` · `package.json` / `package-lock.json` / workflows
/ env / `vercel.json` · pipeline · `.agent/scripts/**`.

## Rollback

- Revert Phase 2 harness patch commit
- `--context` extension can remain (backward-compat) OR be reverted
- Remove `metadata.structural_evidence` block emission
- Remove `## Structural evidence telemetry` section
- No prompt rollback required · no baseline restoration required
- **Zero downstream impact**

## Policy resolutions

All Q1-Q20 answered with executor recommendations (memo § 30):
integration point B · `--context` JSON · context overrides marker ·
`main section` + `body` evaluable · fallback_used=true alone NOT
not_evaluable · exit 1 → RED · exit 2 → tool_error · **structural
RED does NOT change legacy verdict or process exit** · combined
telemetry in `metadata.combined_telemetry` + brief echo in
verdict.md · SHA-256 checker hash · 5 s timeout · **no retry** ·
**no baseline mutation** · **no A/B generation** · **Phase 3 NOT
auto-authorized** · **no QI checker modification** · **no threshold
change** · incomplete capture → `not_evaluable` (never RED) · **no
`AgentOps-5f-promote`**.

## Risks

10 risks (memo § 31): helper + harness patch size · metadata
consumers · verdict.md wording · hash I/O · context file confusion
· timeout · combined-telemetry labeling · Phase 1 backward compat ·
cross-platform spawn · not-evaluable dependency on harness context
correctness.

## Confirmations · 全 CLEAN

no implementation · no code / prompt / script change · no generation
· no fixture run · no LLM / API · no checker / parser / harness
change · no R1 / R2 relaxation · no baseline mutation · no promotion
· no blocking promotion · no `AgentOps-5f-promote` · no pipeline
change · no `.agent/scripts/**` change · no threshold change · no
retry behavior · no C/D/E · no A-E · no PDFs · no OpenAI · no LLM
judge · no edit-distance · no fuzzy · no post-generation replacement
· no silent quote rewriting · no `report.md` / screenshot / long
quote / secret committed · no push · no deploy · **QI remains
telemetry-only** · **structural lint remains telemetry-only
(design-only Phase 2)** · BLK-0001/0002/0003 open · G2.1d
blocked_pending_human · Q10 pause · Codex planner spec-only.

## Cost

**$0** — no runtime activity of any kind.

## Recommended next step

**Human + ChatGPT review, then create DECISION.**

Executor mild preference: **approve** · required_fixes **none** ·
confirm Phase 2 design · authorize next loop = **Phase 2
`AgentOps-5e-followup-baseline-lint-integrate-implement`** ($0 ·
harness invocation + helper module + deterministic integration tests
· **no** paid A/B in Phase 2 · Phase 3 A/B remains separately gated).

Alternative: handoff / pause.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT implement Phase 2.** **Do NOT run A/B.**
**Do NOT mutate baselines.** **Do NOT change legacy verdict.** **Do
NOT promote anything.** **Do NOT start `AgentOps-5f-promote`.**
