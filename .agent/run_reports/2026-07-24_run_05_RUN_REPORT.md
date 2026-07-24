# RUN REPORT · AgentOps-5e-followup-baseline-lint-implement · Structural-evidence validator (phase 1)

## Metadata

- **task_id**: `2026-07-24_run_05`
- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-baseline-lint-implement
- **parent_loop**: AgentOps-5e-followup-baseline-lint-design (`2026-07-24_run_04`)
- **task_path**: `.agent/tasks/2026-07-24_run_05_TASK.md`
- **memo_path**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-implement.md`
- **impl_commit**: `20539d2` (Implement structural evidence lint)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_04_DECISION.md`

## Regression verdict

- **regression_required**: no
- **reason_required_or_not**: standalone deterministic validator
  phase 1; no prompt, harness, baseline, generation, or production
  behavior changed
- **harness_used**: no
- **harness_command**: not_run
- **fixture_ids**: synthetic structural-evidence fixtures only
- **target_environment**: local deterministic CLI
- **latest_run_id**: not_applicable
- **verdict**: `not_required`
- **exit_code**: **0** (deterministic test runner)
- **artifact_paths**:
  - `scripts/structural-evidence-check.mjs`
  - `scripts/test-structural-evidence-check.mjs`
  - `scripts/fixtures/structural-evidence/`
  - `.agent/tasks/2026-07-24_run_05_TASK.md`
  - `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-implement.md`
- **report_char_count**: not_applicable
- **capture_scope**: synthetic test fixtures
- **fallback_used**: not_applicable
- **red_checks_failed**: not_applicable
- **amber_checks_failed**: not_applicable
- **cost_measured**: **true**
- **estimated_cost**: **$0**
- **duration_ms**: deterministic test suite ~0.5 s
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Validator path

`scripts/structural-evidence-check.mjs` (+327 lines · Node stdlib
only · zero dependency)

## Test-runner path

`scripts/test-structural-evidence-check.mjs` (+509 lines · Node
stdlib only · deterministic child-process invocation)

## Fixture directory

`scripts/fixtures/structural-evidence/` (22 synthetic fixture files
+ README documenting fictional content)

## Implementation memo

`.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-implement.md`
(28 sections)

## CLI contract

```
node scripts/structural-evidence-check.mjs \
  --report <report.md path> \
  --output <structural_evidence_summary.json path> \
  [--fixture <A-E>] [--source-run-id <id>] [--help]
```

- **No network** · **no LLM** · **no report rewriting** · **no retries**
- Zero dependencies (Node stdlib only)
- Atomic output write via `.tmp-<pid>` + `renameSync`
- Unknown / missing required args → **exit 2** (nothing written)

## Artifact schema

`structural_evidence_summary.json` fields:
`schema_version` (`0.1-phase1`) · `verdict` · `blocking_mode`
(`telemetry_only`) · `report_path` · `checker_commit` ·
`generated_at` · `duration_ms` · `fixture` · `source_run_id` ·
`required_gap_count` · `observed_gap_count` ·
`recognized_citation_line_count` · `unique_cited_jd_count` ·
`per_gap[]` · `covered_gap_count` · `uncovered_gap_numbers` ·
`appendix.{present, heading_exact, row_count, unique_jd_count,
jd_ids[], malformed_rows[], duplicate_rows[], conflicting_rows[]}` ·
`body_appendix.{missing_from_appendix[], appendix_not_cited[]}` ·
`parser_ambiguities[]` · `red_reasons[]` · `amber_reasons[]` ·
`not_evaluable_reasons[]` · `tool_errors[]` · `source_rewritten`
(false) · `network_used` (false) · `llm_used` (false).

Artifact deliberately does **NOT** embed full report body or quote
content.

## Count semantics

Four separately reported counts (never equated):

- `recognized_citation_line_count`
- `observed_gap_count` · `covered_gap_count`
- `unique_cited_jd_count`
- `appendix.row_count` · `appendix.unique_jd_count`

## Repeated-JD policy

- Repeated `jd_id` across DIFFERENT gaps → **GREEN** when all
  structural requirements pass (matches `2026-07-24_run_04_DECISION`
  Q3 correction)
- **Test G2** validates canonical Fixture A 5/5/4/4 pattern is
  GREEN with `jd_100001` reused across gaps 1 and 5 (different valid
  spans)
- Runtime assertion: `test G2` explicitly checks no AMBER reason
  contains `repeated_jd`

## Verdict policy

- **GREEN**: exactly 5 gaps · 5/5 covered · ≥ 5 lines · Appendix
  present · exact heading · all body jds in Appendix · no malformed
  required rows
- **AMBER**: uncited Appendix · duplicate identical Appendix row ·
  identical duplicate citation WITHIN same gap · redundant excess
  citations
- **RED**: Appendix missing · gap count ≠ 5 · < 5 lines · gap
  without citation · body cite missing from Appendix · malformed
  required citation · malformed required Appendix row · conflicting
  Appendix rows
- **NOT_EVALUABLE**: empty body · explicit truncation marker
- **TOOL_ERROR**: exit 2, no artifact

**Precedence**: `tool_error > not_evaluable > red > amber > green`.

## Exit codes

- **0** — GREEN, AMBER, or `not_evaluable` (artifact emitted)
- **1** — RED structural result (artifact emitted)
- **2** — tool / config / input / output error (no artifact)

## Test matrix + results

26 deterministic tests · **26 / 26 PASS** · exit 0:

- **GREEN**: G1 (5 unique jd_ids) · **G2 (canonical Fixture A 5/5/4/4)** · G3 (two-citation gap, non-redundant) · G4 (deduped Appendix)
- **RED**: R1-R11 (missing Appendix · zero citations · 4 lines · concentration · uncovered gap · missing from Appendix · malformed citation · malformed Appendix row · 4 gaps · 6 gaps · conflicting rows)
- **AMBER**: A1-A4 (uncited Appendix · duplicate row · within-gap duplicate · redundant excess)
- **NOT_EVALUABLE**: N1 (empty) · N2 (explicit truncation marker)
- **TOOL_ERROR**: E1 (missing report) · E3 (invalid args) · E3b (missing required)
- **INVARIANTS**: no fixture modified · no full body in artifact · `network_used=false` · `llm_used=false` · `source_rewritten=false`

## Exact commands

- **Test runner**: `node scripts/test-structural-evidence-check.mjs`
  → **exit 0** · 26 passed / 0 failed
- **TypeScript typecheck**: `npx tsc --noEmit` → **exit 0**
- **CLI smoke-test**: `node scripts/structural-evidence-check.mjs
  --report <p> --output <p>` returns per-verdict exit code
  correctly

## Canonical G2 result

**G2 · canonical Fixture A pattern**（5 citation lines · 5/5 covered
gaps · 4 unique jd_ids · 4 Appendix rows · `jd_100001` reused across
gaps 1 + 5 with different valid spans）→ **verdict GREEN · exit 0**
· no AMBER for repeated jd · validates DECISION Q3 correction.

## CLI behavior

Deterministic · zero-dep · atomic write · UTF-8 read · one-line
stdout summary · stderr only for tool_error · never modifies input
report.

## Capture-sufficiency limitation

**Documented in memo § 13 + § 26**: standalone text alone cannot
reliably distinguish genuine Appendix omission from truncated
capture. Fixtures use an explicit synthetic marker
`<!-- STRUCTURAL_EVIDENCE_TRUNCATED -->` to trigger `not_evaluable`;
real reports will never contain this marker. Phase 2 (harness
integration) will supply `capture_scope` and `fallback_used` as
additional inputs so that a truncated real report can be
classified as `not_evaluable` rather than RED.

## Atomic-write behavior

- Parent directory created recursively if missing
- Written to `<output>.tmp-<pid>` then `renameSync` to final path
- On tool_error, no partial artifact is emitted (verified via test
  E1 — asserts `artifact === null`)

## No harness integration

- `scripts/report-regression-local.mjs` is **not** modified · hash
  `4abfd9f` pre + post ✅
- Harness integration deferred to phase 2 (separate DECISION)

## No generation

- No `--fixture A/B/C/D/E` run · no Playwright · no dev server · no
  Anthropic / OpenAI API call ✅

## No checker/harness changes

- `scripts/quote-integrity-check.mjs` hash **`105ce8a`** pre + post ✅
- `scripts/report-regression-local.mjs` hash **`4abfd9f`** pre + post ✅

## No R1/R2 changes

- No new match tier · `extractEvidenceQuotes` / `extractAppendix` /
  `matchTiered` / `matchEllipsisFragments` /
  `matchTerminalPunctuationOnly` all unchanged ✅

## No baseline mutation

- `.agent/regression_baselines/**` untouched ✅
- No baseline metadata `structural_evidence` block added (deferred
  to phase 4)

## No legacy-verdict impact

- Standalone CLI writes `structural_evidence_summary.json` only when
  invoked manually
- Harness legacy 25-check verdict + exit-code semantics unchanged

## Structural lint telemetry-only

- Artifact `blocking_mode` field emits `telemetry_only` explicitly
- No promotion of structural lint to blocking (deferred to phase 6)

## QI telemetry-only

- Unchanged ✅ · QI wrapper in harness untouched

## Cost

**$0** — no runtime activity, no LLM/API, no dev server, no fixture
generation.

## Known limitations

Documented in memo § 26:

- Truncation detection requires the explicit synthetic marker or
  harness metadata; genuine missing Appendix without truncation
  context is classified as RED.
- Tests E2 (unreadable file) and E4 (unwritable output) omitted for
  cross-platform reliability; E1/E3/E3b cover the tool_error branches
  deterministically.
- `parser_ambiguities` field present but empty in phase 1;
  populated in phase 2 when validator-vs-checker Appendix parser
  disagree.

## Recommended next step

**Human + ChatGPT review, then create DECISION.**

Executor mild preference: **approve** · required_fixes **none** ·
confirm phase 1 outcome · authorize next loop = **phase 2
`AgentOps-5e-followup-baseline-lint-integrate`** ($0 · integrate
validator into harness after report capture · write
`structural_evidence_summary.json` in run directory · surface both
QI + structural blocks side-by-side in `verdict.md` · still
telemetry-only · no legacy-verdict impact · no baseline mutation).

Alternative: handoff / pause.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT integrate harness.** **Do NOT run A/B.**
**Do NOT mutate baselines.** **Do NOT promote structural lint.**
**Do NOT start phase 2.** **Do NOT start `AgentOps-5f-promote`.**
