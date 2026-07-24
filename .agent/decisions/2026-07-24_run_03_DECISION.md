# DECISION · AgentOps-5e-followup-prompt-refinement-implement · Outcome A — Full success

## Metadata

- **decision_id**: `2026-07-24_run_03_DECISION`
- **date**: 2026-07-24
- **based_on_run_report**: `.agent/run_reports/2026-07-24_run_03_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-24_run_03_TASK.md`
- **based_on_memo**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-prompt-refinement-implement.md`
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_02_DECISION.md`
- **loop**: AgentOps-5e-followup-prompt-refinement-implement
- **parent_loop**: AgentOps-5e-followup-prompt-refinement-design (`2026-07-24_run_02`)
- **impl_commit**: `710cc3d` (Require mandatory exact evidence structure)
- **validation_commit**: `c0f7d2e` (Validate mandatory exact evidence structure)
- **run_report_commit**: `790e600` (Add RUN_REPORT 2026-07-24_run_03)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (design approval; push and any
  next loop require separate human GO)
- **required_fixes**: **none**

## Outcome classification

**Outcome A — Full success.**

## Reasoning summary

The **Option B-lite** prompt refinement successfully restored the
mandatory citation apparatus while also eliminating fabricated or
unmatched evidence quotes. Fixture A and Fixture B both completed
successfully with **legacy GREEN**. Both reports included the
required **Evidence Appendix**, emitted **5 parser-recognized
Evidence quote lines**, and achieved complete **5/5 per-gap
citation coverage** across the 5 ranked gaps. Neither run produced
`fabricated_or_unmatched` findings. **Fixture B selected `jd_000201`
and quoted it as a Tier 1 verbatim contiguous source span**, directly
resolving the recurring R1 grammar-bridging failure that motivated
this work. Fixture A produced 2 existing terminal-punctuation-only
R2 findings, while Fixture B produced 1 existing appendix-not-cited
AMBER finding; neither represents a new R1 or fabrication failure.
**Checker, parser, harness, R1, R2, thresholds, baseline metadata,
pipeline, and model/provider remained unchanged.**

## Approved direction

- Approve the refined prompt implementation.
- Approve the deterministic test coverage.
- Approve the controlled Fixture A and Fixture B validation results.
- Accept **Outcome A — Full success**.
- Accept the prompt patch in `src/lib/prompts.ts`.
- Accept `scripts/test-evidence-refinement-contract.mjs`.
- Preserve the current Evidence quote Markdown format.
- Preserve the current Evidence Appendix format.
- Preserve parser / checker / harness.
- Preserve R1 and R2.
- Keep quote integrity **telemetry-only**.
- Do NOT mutate or promote baselines.
- Do NOT begin `AgentOps-5f-promote`.

## Prompt contract result

The implementation now jointly requires:

1. Mandatory evidence structure.
2. Exact contiguous quote faithfulness.
3. Short-fragment fallback instead of omission.
4. Structure-first final self-check.

### Structural result

- Exactly 5 ranked gaps retained
- Each ranked gap contains one supporting `Evidence quote:` line
- **5 recognized citation lines in Fixture A**
- **5 recognized citation lines in Fixture B**
- **Evidence Appendix present in both**
- Citation format remained parser-recognized

### Important count nuance

- Fixture A contains 5 recognized citation lines supporting 5 gaps.
- Fixture A contains **4 unique cited `jd_ids`** because `jd_000347`
  is legitimately reused for two different gaps with **different
  exact spans**.
- This is **compliant**.
- **Do NOT redefine the requirement as 5 unique `jd_ids`.**
- The approved requirement is **5 supporting citation lines with
  5/5 per-gap coverage**.
- Fixture B contains 5 citation lines and 5 unique `jd_ids`.

## Fixture A

- **run_id**: `20260724T040011Z_fixture-A`
- **command**: `node scripts/report-regression-local.mjs --fixture A`
- **run count**: **1**
- **retries**: **none**
- **exit code**: 0
- **completion_state**: `success`
- **duration_ms**: 67 442
- **legacy verdict**: **GREEN**
- **report_char_count**: 10 146
- **capture_scope**: `main section`
- **fallback_used**: false
- **Evidence Appendix**: **present**
- **Appendix rows**: 4, correctly de-duplicated
- **recognized Evidence quote lines**: **5**
- **unique evidence `jd_ids`**: **4**
- **per-gap citation coverage**: **5/5**
- **`fabricated_or_unmatched`**: **0**
- **QI verdict**: **AMBER**
- **red reasons**: **none**
- **AMBER reasons**: 2 terminal-punctuation-only R2 findings
- **`jd_000201`**: not selected
- **network failures**: none

### Fixture A per-gap mapping

- gap 1: `jd_000347` · **verbatim**
- gap 2: `jd_000089` · R2 terminal-punctuation-only (AMBER)
- gap 3: `jd_000173` · R2 terminal-punctuation-only (AMBER)
- gap 4: `jd_000042` · **verbatim**
- gap 5: `jd_000347` · **separate verbatim span**

## Fixture B

- **run_id**: `20260724T040131Z_fixture-B`
- **command**: `node scripts/report-regression-local.mjs --fixture B`
- **run count**: **1**
- **retries**: **none**
- **exit code**: 0
- **completion_state**: `success`
- **duration_ms**: 67 540
- **legacy verdict**: **GREEN**
- **report_char_count**: 10 039
- **capture_scope**: `main section`
- **fallback_used**: false
- **Evidence Appendix**: **present**
- **Appendix rows**: 5
- **recognized Evidence quote lines**: **5**
- **unique evidence `jd_ids`**: **5**
- **per-gap citation coverage**: **5/5**
- **verbatim matches**: **5**
- **`fabricated_or_unmatched`**: **0**
- **QI verdict**: **AMBER**
- **red reasons**: **none**
- **AMBER reasons**: 1 appendix entry not cited (`jd_000310` · benign
  pre-existing pattern)
- **`jd_000201`**: **selected at gap 5 and Tier 1 verbatim**
- **network failures**: none

### Fixture B per-gap mapping

- gap 1: `jd_000042` · **verbatim**
- gap 2: `jd_000347` · **verbatim**
- gap 3: `jd_000347` · **verbatim**
- gap 4: `jd_000173` · **verbatim**
- gap 5: **`jd_000201`** · **verbatim** ← R1 grammar-bridging fixed

## `jd_000201` resolution

### Before

- Repeatedly selected across prior controlled runs
- R1 RED
- Non-contiguous bridging and grammar repair
- Verbatim source head joined to unmatched tail

### Rejected first experiment

- `jd_000201` disappeared
- Entire citation apparatus disappeared
- **Not a valid fix**

### Refined implementation

- `jd_000201` selected in Fixture B
- Cited at gap 5
- **Tier 1 verbatim contiguous source match**
- No `fabricated_or_unmatched` finding
- **Confirms the original R1 grammar-bridging issue is resolved in
  this controlled run**

## Quote-integrity interpretation

- **Fixture A**: AMBER only because of 2 narrow R2 terminal-
  punctuation findings.
- **Fixture B**: AMBER only because 1 Appendix entry was not cited.
- **Neither run has any RED reason.**
- **Neither run has any fabricated / unmatched quote.**
- **R1 is clean in both.**
- **QI remains telemetry-only.**

## Success criteria assessment

- Fixture A completed: **yes**
- Fixture B completed: **yes**
- Legacy GREEN both: **yes**
- Appendix present both: **yes**
- 5 recognized citation lines both: **yes**
- 5/5 per-gap coverage both: **yes**
- `fabricated_or_unmatched` zero both: **yes**
- Parser-recognized citation shape: **yes**
- `jd_000201` exact if selected: **yes**
- Checker unchanged: **yes**
- Parser unchanged: **yes**
- Harness unchanged: **yes**
- R1 unchanged: **yes**
- R2 unchanged: **yes**
- Baseline unchanged: **yes**
- No promotion: **yes**
- QI telemetry-only: **yes**

## Deterministic validation

- **File**: `scripts/test-evidence-refinement-contract.mjs`
- **20 assertions passed**
- Node standard library only
- **No new dependency**
- Validates:
  - 5 evidence lines required
  - 1 citation per ranked gap
  - Exact Appendix heading
  - Exact citation shape
  - Omission forbidden
  - Shorter exact fragment fallback
  - Exact contiguous requirement
  - Ellipsis bridging forbidden
  - Grammar repair and paraphrase forbidden
  - Incomplete fragments allowed
  - Structure-first ordering
  - Example limits
  - One canonical Appendix format
  - Parser compatibility
  - Checker / harness preservation
  - No new match tier
  - R2 preservation

## No-change verification

- `scripts/quote-integrity-check.mjs` hash: **`105ce8a`** before AND
  after
- `scripts/report-regression-local.mjs` hash: **`4abfd9f`** before
  AND after
- `extractEvidenceQuotes`: **unchanged**
- `extractAppendix`: **unchanged**
- `matchTiered`: **unchanged**
- R1: **unchanged**
- R2: **unchanged**
- **No new match tier**
- `HARD_LATENCY_MS`: **unchanged at 240 000**
- `SOFT_LATENCY_MS`: **unchanged at 120 000**
- Baseline metadata: **unchanged**
- Pipeline: **unchanged at `b019786`**
- Model / provider: **unchanged at `claude-sonnet-4-6`**

## Operational result

- A `requestfailed`: 0
- A `non_2xx`: 0
- B `requestfailed`: 0
- B `non_2xx`: 0
- No console errors
- No application errors
- No hard timeout
- **Prior transient 502 not reproduced**

## Cost

- Prompt implementation and deterministic tests: **$0**
- Fixture A and B paid generation: **~$0.10 total**
- **No retries**
- **No additional fixtures**

## Risks remaining

1. One successful A+B loop does not prove long-term probabilistic
   stability.
2. Fixture A reused 1 JD across 2 gaps; currently valid, but future
   product policy may choose to encourage more source diversity.
3. R2 terminal-punctuation AMBER remains in Fixture A.
4. Appendix-not-cited AMBER remains in Fixture B.
5. Evidence Appendix presence and per-gap coverage are **not yet
   enforced by a separate deterministic structural validator**.
6. QI remains telemetry-only.
7. C/D/E remain without controlled generated runs.
8. Prior transient 502 root cause remains unknown.
9. BLK-0001 / BLK-0002 / BLK-0003 remain `open`.
10. One controlled `jd_000201` success does not prove every future
    generation will remain exact.

## Recommended next direction

**Do NOT begin `AgentOps-5f-promote`.**

### Preferred next loop

**`AgentOps-5e-followup-baseline-lint-design`**

**Purpose**:

- **$0 inspection / design only**
- Design deterministic structural validation for:
  - Evidence Appendix required
  - At least 5 recognized `Evidence quote:` lines
  - 5/5 per-gap citation coverage
  - Body / Appendix consistency
- No rewriting
- No automatic retry
- No LLM
- No baseline mutation
- No blocking promotion in the design loop

### Alternative

**Handoff / pause** and collect more controlled stability evidence
later under separate cost approval.

### Do NOT authorize automatically

- QI blocking promotion
- `AgentOps-5f-promote`
- Additional A/B runs
- C/D/E
- Baseline mutation
- Parser / checker relaxation
- Fuzzy / edit-distance
- LLM judge
- Post-generation rewriting

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT run further generation.** **Do NOT rerun A or B.** **Do NOT
create structural validator.** **Do NOT modify checker / parser /
harness.** **Do NOT loosen R1 / R2.** **Do NOT mutate baselines.**
**Do NOT promote QI.** **Do NOT start `AgentOps-5f-promote`.**
