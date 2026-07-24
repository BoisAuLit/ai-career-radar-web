# DECISION · AgentOps-5e-followup-baseline-lint-design · Structural evidence validator design (repeated-jd policy corrected)

## Metadata

- **decision_id**: `2026-07-24_run_04_DECISION`
- **date**: 2026-07-24
- **based_on_run_report**: `.agent/run_reports/2026-07-24_run_04_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-24_run_04_TASK.md`
- **based_on_findings**: `.agent/findings/2026-07-24_structural_evidence_lint_inventory.json`
- **based_on_memo**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-design.md`
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_03_DECISION.md`
- **loop**: AgentOps-5e-followup-baseline-lint-design
- **parent_loop**: AgentOps-5e-followup-prompt-refinement-implement (`2026-07-24_run_03` · Outcome A)
- **design_commit**: `badbe0a` (Design structural evidence lint)
- **run_report_commit**: `0a0ee81` (Add RUN_REPORT 2026-07-24_run_04)
- **correction_commit**: `59d973f` (Clarify valid repeated JD citations)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (design approval; push and any
  implementation loop require separate human GO)
- **required_fixes**: **none**

## Reasoning summary

The design cleanly separates deterministic structural evidence
validation from quote-integrity matching. It defines distinct
`citation_line_count` · `per_gap_coverage_count` ·
`unique_cited_jd_count` · `appendix_row_count` counts; requires
exactly 5 ranked gaps, ≥ 5 recognized citation lines, complete 5/5
per-gap coverage, mandatory Appendix presence, and body-to-Appendix
consistency; and treats insufficient capture as `not_evaluable`.
The selected standalone zero-dependency CLI minimizes coupling with
the existing quote-integrity checker and regression harness. **The
earlier policy contradiction concerning repeated `jd_id` use was
corrected: valid reuse of one `jd_id` across DIFFERENT gaps remains
GREEN, 5 unique `jd_ids` are NOT required, and source diversity
remains out of scope.** Fixture A (5/5/4/4) is the canonical GREEN
example.

## Approved design

- **Standalone deterministic CLI**:
  `scripts/structural-evidence-check.mjs`
- **Zero dependencies**
- **No network**
- **No LLM**
- **No rewriting**
- **No retries**
- Separate `structural_evidence_summary.json`
- First implementation **standalone only**
- **No harness integration in phase 1**
- **No baseline metadata mutation in phase 1**
- **Telemetry-only**
- **No legacy verdict impact**
- **No R1 / R2 coupling**

## Validator scope

- Exact `## Evidence Appendix` heading
- Exactly 5 ranked gaps
- At least 5 recognized `Evidence quote:` lines
- One or more recognized citations in each gap
- All body-cited `jd_ids` represented in Appendix
- Canonical Appendix rows parse successfully
- Duplicate Appendix-row detection
- Uncited Appendix-row telemetry
- Citation concentration detection
- Capture sufficiency

## Explicit exclusions

- Quote exactness
- R1 / R2 matching
- Semantic relevance
- JD-selection quality
- **Source diversity**
- **5 unique `jd_ids`**
- Mandatory `jd_000201` selection

## Count semantics

`citation_line_count` · `per_gap_coverage_count` ·
`unique_cited_jd_count` · `appendix_row_count` are **separate and
must not be interchanged**.

### Required for success

- `citation_line_count ≥ 5`
- `per_gap_coverage_count = 5`
- `observed_gap_count = 5`
- Appendix present
- all body-cited `jd_ids` represented in Appendix
- no malformed required rows

### NOT required

- `unique_cited_jd_count` does **NOT** need to equal 5
- `appendix_row_count` does **NOT** need to equal
  `citation_line_count`
- **Repeated `jd_id` across DIFFERENT gaps is allowed**

### Canonical GREEN

- **Fixture A pattern**:
  - 5 citation lines
  - 5 covered gaps
  - **4 unique `jd_ids`**
  - **4 de-duplicated Appendix rows**
- **Remains GREEN.**

## Verdict policy

### GREEN

- Exactly 5 gaps
- All 5 gaps covered
- ≥ 5 recognized citation lines
- Appendix present
- All body `jd_ids` in Appendix
- No malformed required rows
- **Repeated `jd_id` across DIFFERENT gaps allowed**

### AMBER

- Uncited Appendix entry
- Duplicate identical Appendix row
- **Identical OR clearly redundant citation duplicated WITHIN the
  SAME gap** (structurally suspicious redundancy — distinct from
  ordinary reuse across DIFFERENT gaps, which stays GREEN)
- **More than 5 citation lines when redundant** (non-redundant
  extras remain GREEN)
- Structural parser ambiguity

### RED

- Appendix missing
- Observed gap count ≠ 5
- Fewer than 5 recognized citation lines
- Any gap lacks recognized citation
- Body-cited `jd_id` absent from Appendix
- Malformed required Appendix row
- Malformed required citation line

### NOT_EVALUABLE

- Insufficient capture
- Empty captured body
- Validator / tool state prevents structural evaluation

### Tool errors

- Invalid arguments
- Missing report
- Unreadable input
- Output-write failure
- **Exit code 2**

## CLI contract

```
node scripts/structural-evidence-check.mjs \
  --report <report.md> \
  --output <structural_evidence_summary.json>
```

## Exit codes

- **0** — GREEN or AMBER result generated
- **1** — RED result generated
- **2** — tool / config / input error

## Selected gap parser

- Narrow deterministic regex / state machine
- Enter at current top-5-gap heading
- Recognize gap boundaries 1-5 (`^\d+\.\s+`)
- Exit at next major `## ` heading
- **Zero dependencies**

## Selected Appendix parser

- **Canonical tab-separated format only**
- Narrow deterministic parser
- Current quote-integrity checker remains untouched
- Parser mismatch or ambiguity becomes **AMBER telemetry**
- **No current parser refactor in phase 1**

## Structural vs QI separation

- `quote_integrity` continues reporting R1 / R2 / fabricated matching
- `structural_evidence` reports Appendix / count / per-gap /
  body-Appendix structure
- Both may coexist independently
- Combined telemetry may reflect the worse state
- **Legacy verdict remains unchanged in initial phases**

## Phase 1 authorization

**`AgentOps-5e-followup-baseline-lint-implement`**

### Phase 1 scope

- Implement standalone `scripts/structural-evidence-check.mjs`
- Add deterministic zero-dependency tests
- Use synthetic local fixtures
- **No report generation**
- **No paid API calls**
- **No harness integration**
- **No baseline metadata mutation**
- **No legacy-verdict impact**
- **No blocking promotion**
- **No `AgentOps-5f-promote`**

### Phase 1 expected cost

**$0**

## Future phases

- **Phase 2** — harness telemetry integration · separate DECISION
- **Phase 3** — controlled A/B validation · separate GO and
  ~**$0.10** cost approval
- **Phase 4** — baseline metadata migration · separate DECISION
- **Phase 5** — stability evidence · separately approved runs
- **Phase 6** — blocking-promotion DECISION

**No phase automatically authorizes the next.**

## Deterministic test requirements

### GREEN

- 5 gaps · 5 unique `jd_ids`
- **5 gaps · 4 unique `jd_ids`** (canonical Fixture A 5/5/4/4)
- **Repeated `jd_id` across DIFFERENT gaps**
- De-duplicated Appendix

### RED

- Missing Appendix
- Zero citations
- 4 citations
- Citations concentrated in fewer than 5 gaps
- One uncovered gap
- Body citation missing from Appendix
- Malformed citation
- Malformed Appendix row
- 4 gaps
- 6 gaps
- Structurally-complete capture with a real missing required
  section

### AMBER

- Uncited Appendix entry
- Duplicate Appendix row
- **Identical / redundant citation WITHIN the SAME gap**
- More than 5 citations when redundant
- Parser ambiguity

### NOT_EVALUABLE

- Insufficient capture (capture literally truncated before Appendix
  region — do NOT overload RED with tool-side deficiencies)
- Empty capture

### TOOL ERROR

- Missing report
- Unreadable report
- Invalid arguments

### Important

Truncated / insufficient capture expectations MUST be internally
consistent:

- **Insufficient capture → `not_evaluable`**
- **Do NOT simultaneously classify the same fixture as RED**
- **Only classify a structurally-complete capture with a real
  missing required section as RED**

## Baseline metadata design

- **Deferred**
- Future `structural_evidence` sibling block may mirror
  `quote_integrity` metadata
- **No current baseline mutation**
- Pre-validator baselines would require **explicit grandfathering**
  in a separate migration loop

## Promotion boundaries

- **Structural lint remains telemetry-only**
- **No legacy-verdict impact**
- **No baseline-eligibility impact**
- **Controlled A+B required before any blocking promotion**
- **`AgentOps-5f-promote` not authorized**

## Policy resolutions

- **Q1** — exactly 5 gaps
- **Q2** — at least 5 citation lines
- **Q3** — **repeated `jd_id` across different gaps allowed AND
  GREEN** (5 unique `jd_ids` NOT required · source diversity out of
  scope · Fixture A 5/5/4/4 is canonical GREEN)
- **Q4** — all body-cited `jd_ids` must appear in Appendix
- **Q5** — uncited Appendix rows AMBER
- **Q6** — duplicate identical Appendix rows AMBER · conflicting
  duplicate content may be RED
- **Q7** — more than one citation per gap allowed · AMBER **ONLY
  when redundant**
- **Q8** — missing Appendix structurally RED · structural checker
  itself remains telemetry-only
- **Q9** — insufficient capture `not_evaluable`
- **Q10** — separate CLI
- **Q11** — first implementation standalone only
- **Q12** — no baseline mutation in first implementation
- **Q13** — no legacy-verdict impact initially
- **Q14** — controlled A+B required before blocking promotion
- **Q15** — `AgentOps-5f-promote` not authorized

## Required fixes

**None.**

## Recommended next loop

**`AgentOps-5e-followup-baseline-lint-implement`**

Do NOT implement until:

- correction commit is complete ✅ (done: `59d973f`)
- this DECISION is committed
- human approves push
- design and DECISION are pushed and summarized
- separate explicit human GO starts phase 1

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT implement validator.** **Do NOT integrate harness.** **Do
NOT mutate baselines.** **Do NOT run A/B.** **Do NOT promote
anything.** **Do NOT start `AgentOps-5f-promote`.**
