# DECISION · AgentOps-5e-followup-baseline-lint-implement · Phase 1 complete

## Metadata

- **decision_id**: `2026-07-24_run_05_DECISION`
- **date**: 2026-07-24
- **based_on_run_report**: `.agent/run_reports/2026-07-24_run_05_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-24_run_05_TASK.md`
- **based_on_memo**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-implement.md`
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_04_DECISION.md`
- **loop**: AgentOps-5e-followup-baseline-lint-implement
- **parent_loop**: AgentOps-5e-followup-baseline-lint-design (`2026-07-24_run_04`)
- **impl_commit**: `20539d2` (Implement structural evidence lint)
- **run_report_commit**: `b50b0de` (Add RUN_REPORT 2026-07-24_run_05)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (design approval; push and any
  Phase 2 loop require separate human GO)
- **required_fixes**: **none**

## Outcome classification

**Phase 1 complete — standalone validator implementation successful.**

## Reasoning summary

The standalone structural-evidence validator was implemented
according to the approved Phase 1 design. It is **deterministic**,
**zero-dependency**, **network-free**, **LLM-free**, and does not
rewrite its input. **All 26 deterministic tests passed**, including
the corrected canonical **G2** policy: 5 citation lines, 5 covered
gaps, 4 unique `jd_ids`, and 4 de-duplicated Appendix rows correctly
produce **GREEN with exit code 0**. The validator cleanly separates
structural evidence checks from quote-integrity R1/R2 matching.
Existing quote-integrity checker, regression harness, prompt, `src`
code, baselines, legacy-verdict behavior, and pipeline remained
**unchanged**.

## Approved Phase 1 result

- Standalone CLI implemented: `scripts/structural-evidence-check.mjs`
- Deterministic test runner implemented:
  `scripts/test-structural-evidence-check.mjs`
- Synthetic fixture suite implemented:
  `scripts/fixtures/structural-evidence/`
- **Node standard library only**
- **No dependencies added**
- **26 / 26 tests passed**
- **TypeScript typecheck passed**
- No report generation
- No network
- No LLM / API
- No input rewriting
- **Telemetry-only**
- **No legacy-verdict effect**

## CLI contract

```
node scripts/structural-evidence-check.mjs \
  --report <report.md> \
  --output <structural_evidence_summary.json>
```

## Exit codes

- **0** — GREEN, AMBER, or `not_evaluable` artifact emitted
  successfully
- **1** — RED structural artifact emitted successfully
- **2** — tool / config / input / output error · **no partial
  artifact**

## Validator responsibilities

- Exact `## Evidence Appendix` heading
- Exactly 5 ranked gaps
- At least 5 recognized `Evidence quote:` lines
- One or more recognized citation lines in each gap
- Every body-cited `jd_id` represented in Appendix
- Canonical tab-separated Appendix rows
- Duplicate Appendix-row detection
- Uncited Appendix-row telemetry
- Citation-concentration detection
- Capture-sufficiency classification where determinable

## Explicit exclusions

- Quote exactness
- Verbatim source matching
- R1 / R2 tier matching
- Semantic relevance
- JD-selection quality
- **Source diversity**
- **5 unique `jd_ids`**
- Mandatory `jd_000201` selection

## Count semantics

The following remain distinct:

- `recognized_citation_line_count`
- `observed_gap_count`
- `covered_gap_count`
- `unique_cited_jd_count`
- `appendix.row_count`
- `appendix.unique_jd_count`

## Canonical G2

- **5 citation lines**
- **5 covered gaps**
- **4 unique cited `jd_ids`**
- **4 Appendix rows**
- **Repeated `jd_id` across DIFFERENT gaps**
- **Verdict GREEN**
- **Exit code 0**
- **No AMBER reason for repeated cross-gap `jd` reuse**

## Repeated-JD policy

- Repeated `jd_id` across DIFFERENT gaps remains **GREEN**
- **5 unique `jd_ids` are NOT required**
- **Source diversity remains out of scope**
- AMBER applies only to structurally suspicious redundancy such as
  identical duplicate citation lines within the same gap

## Verdict policy

### GREEN

- Exactly 5 gaps
- 5/5 covered
- At least 5 recognized citation lines
- Appendix present
- All body `jd_ids` represented
- No malformed required rows
- **Repeated `jd_id` across different gaps allowed**

### AMBER

- Uncited Appendix entry
- Duplicate identical Appendix row
- Identical / redundant citation duplicated within the same gap
- Redundant excess citations
- Parser ambiguity

### RED

- Appendix missing in a structurally evaluable report
- Gap count ≠ 5
- Fewer than 5 citations
- Uncovered gap
- Body-cited `jd_id` absent from Appendix
- Malformed required citation
- Malformed Appendix row
- Conflicting duplicate Appendix content

### NOT_EVALUABLE

- Empty input
- Explicit known-truncation marker
- Tool has insufficient structural context to evaluate safely

## Test result

- **command**: `node scripts/test-structural-evidence-check.mjs`
- **exit code**: **0**
- **passed**: **26**
- **failed**: **0**

## Typecheck

- **command**: `npx tsc --noEmit`
- **exit code**: **0**

## Test coverage

- **GREEN**: G1, G2, G3, G4
- **RED**: R1 through R11
- **AMBER**: A1 through A4
- **NOT_EVALUABLE**: N1, N2
- **TOOL_ERROR**: missing report · invalid arguments · missing
  required arguments · no artifact emitted on tool_error

## Invariants

- No fixture modified
- Full report content not embedded in output
- `network_used = false`
- `llm_used = false`
- `source_rewritten = false`

## Atomic-write result

- Output written to temporary sibling file
- `renameSync` used for final atomic replacement
- No partial artifact on tool_error
- Parent output directory created when needed

## Capture-sufficiency limitation

The standalone CLI receives report text only and **cannot reliably
distinguish every genuine missing-Appendix case from a truncated
capture**. Phase 1 therefore uses an **explicit synthetic truncation
marker** for deterministic `not_evaluable` tests. Real reports do
not contain this marker. **Phase 2 harness integration must supply
capture metadata** such as `capture_scope`, `fallback_used`,
`completion_state`, or an explicit evaluation-context input. **The
validator must NOT infer truncation from missing structure alone.**

## No-change verification

- `scripts/quote-integrity-check.mjs`: **unchanged at hash `105ce8a`**
- `scripts/report-regression-local.mjs`: **unchanged at hash `4abfd9f`**
- `scripts/test-evidence-refinement-contract.mjs`: **unchanged**
- `src/**`: **unchanged**
- Prompt: **unchanged**
- R1: **unchanged**
- R2: **unchanged**
- **No new QI tier**
- Baseline metadata: **unchanged**
- Legacy verdict: **unchanged**
- Pipeline: **unchanged at `b019786`**

## Cost

- Implementation: **$0**
- Deterministic tests: **$0**
- Typecheck: **$0**
- Generation: **none**
- API usage: **none**

## Approved next loop

**`AgentOps-5e-followup-baseline-lint-integrate`**

### Phase 2 scope

- Integrate the standalone validator into
  `scripts/report-regression-local.mjs`
- Invoke after report capture
- Preserve quote-integrity check independently
- Emit `structural_evidence_summary.json` in each run directory
- Record validator exit code
- Record validator duration
- Record validator implementation hash
- Pass capture context from harness
- Surface `quote_integrity` and `structural_evidence` side-by-side
  in `verdict.md`
- **Remain telemetry-only**
- **No legacy-verdict impact**
- **No automatic retries**
- **No report rewriting**
- **No baseline metadata mutation**
- **No blocking promotion**
- **No `AgentOps-5f-promote`**

### Phase 2 expected cost

**$0**

### Phase 2 does NOT authorize

- Report generation
- Fixture A/B runs
- Baseline migration
- Blocking promotion
- Stability runs
- `AgentOps-5f-promote`

### Required Phase 2 design nuance

**Do NOT** encode capture sufficiency solely through a synthetic
marker. Provide explicit runtime context from the harness, such as:

- `capture_scope`
- `fallback_used`
- `completion_state`
- Report capture completeness

or a temporary context JSON / CLI argument.

The integration must clearly distinguish:

- Validator structural RED
- Validator `not_evaluable`
- Validator `tool_error`
- `quote_integrity` verdict
- Legacy regression verdict

## Rollout boundaries

- **Phase 2**: harness telemetry integration · separate loop
- **Phase 3**: controlled A/B validation · separate GO and
  approximately **$0.10** approval
- **Phase 4**: baseline metadata migration · separate DECISION
- **Phase 5**: stability evidence · separate per-run approval
- **Phase 6**: blocking-promotion DECISION

**No phase automatically authorizes the next.**

## Risks remaining

1. Gap parser is coupled to the current Markdown heading and
   numbered-list structure.
2. Appendix parser intentionally accepts only canonical tab-separated
   rows.
3. Standalone text cannot reliably identify all truncated captures.
4. Future harness integration could accidentally couple structural
   lint to legacy verdict if not constrained.
5. Parser semantics may drift from quote-integrity parsing.
6. Structural lint remains untested on fresh generated reports.
7. Telemetry-only results may be ignored operationally.
8. No baseline metadata exists yet.
9. One phase does not justify blocking promotion.
10. BLK-0001 / BLK-0002 / BLK-0003 remain `open`.

## Recommended next direction

**Push Phase 1 implementation after human approval**, update the
daily summary, then **start Phase 2 only under a separate explicit
GO**.

### Do NOT authorize

- Immediate harness integration in this turn
- Fixture A/B generation
- Baseline mutation
- Legacy-verdict changes
- Structural blocking promotion
- `AgentOps-5f-promote`
- Checker / R1 / R2 modification
- Fuzzy matching
- Edit-distance
- LLM judge
- Post-generation rewriting

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT integrate harness.** **Do NOT generate reports.** **Do NOT
run fixture A / B.** **Do NOT modify checker / harness.** **Do NOT
change R1 / R2.** **Do NOT mutate baselines.** **Do NOT promote.**
**Do NOT start `AgentOps-5f-promote`.**
