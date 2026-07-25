# DECISION · AgentOps-5e-followup-phase3-structural-product-quality-diagnostics-design · APPROVE · Path A selected · implementation deferred

## Metadata

- **decision_id**: `2026-07-25_run_03_DECISION`
- **date**: 2026-07-25
- **based_on_run_report**: `.agent/run_reports/2026-07-25_run_03_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-25_run_03_TASK.md`
- **based_on_findings**: `.agent/findings/2026-07-25_structural_product_quality_inventory.json`
- **based_on_memo**: `.agent/design_memos/2026-07-25_AgentOps-5e-followup-phase3-structural-product-quality-diagnostics-design.md`
- **authorizing_decision**: `.agent/decisions/2026-07-25_run_02_DECISION.md`
- **loop**: `AgentOps-5e-followup-phase3-structural-product-quality-diagnostics-design`
- **parent_loop**: `AgentOps-5e-followup-phase3-fixture-b-completion-execute` (`2026-07-25_run_02`)
- **design_commit**: `eedde23` (Design structural product quality diagnostics)
- **run_report_commit**: `c636b19` (Add RUN_REPORT 2026-07-25_run_03)
- **decision_commit**: `<pending>` (this commit)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (for push · for a subsequent Path A implementation loop · for any subsequent paid fixture validation)
- **required_fixes**: **none**

## Outcome classification

**Structural RED diagnosis complete. Primary root cause is a
deterministic contract mismatch between rendered-text capture and
Markdown-literal structural-checker grammar. Path A is selected for a
separately gated implementation loop.**

## Reasoning summary

The report-generation prompt and structural checker agree when
evaluated against raw Markdown source form. However, the report is
rendered through `ReactMarkdown` and the regression harness captures
browser `innerText`, which removes Markdown heading markers such as
`##`. The structural checker then evaluates the rendered plain text
while requiring literal Markdown heading syntax. This causes the gap
section and Evidence Appendix to be reported as missing. Citation
count subsequently becomes zero because citation extraction is scoped
to the unrecognized gap section. On Fixture B, the QI checker
operating on the SAME captured rendered text finds five evidence
citations and four appendix rows, directly proving that the relevant
content exists. The structural checker's tab-only appendix-row parser
is also narrower than the QI checker's deterministic
tab/multi-space/pipe parsing and is a likely secondary defect.

## Diagnosis

- **confidence**: **`multiple_root_causes_confirmed`**
- **primary**: structural checker requires literal Markdown heading markers that browser `innerText` removes
- **consequences**:
  - gap section not recognized
  - citation extraction scope empty
  - citation count incorrectly reported as zero
  - Evidence Appendix heading not recognized
- **secondary**: appendix row parser accepts tabs only and lacks deterministic rendered-text fallbacks

## Contract relationship

- **prompt vs structural checker on raw Markdown**: **consistent**
- **harness captured form vs structural checker**: **inconsistent**
- **prompt change indicated**: **false**
- **generator omission established**: **false**

## Fixture B evidence

- **root cause**: **directly confirmed**
- **same-captured-text QI results**:
  - evidence citations: **5**
  - appendix rows: **4**
  - verbatim matches: **4**
  - case-insensitive matches: **1**
  - fabricated: **0**
  - wrong company: **0**
  - wrong role: **0**
  - duplicates: **0**
- **conclusion**: relevant content exists; structural RED is not caused by content absence

## Fixture A evidence

- **root cause**: **strongly supported by converging evidence**
- **supporting evidence**:
  - same three structural RED reasons
  - same capture mechanism (`main section` scope · `shortest-qualified-candidate` strategy)
  - same checker / harness contract (`structural-evidence-check.mjs@0.1-phase1`)
  - `selected_candidate_marker_count=5`
  - `selected_candidate_has_evidence=true`
  - `capture_complete=true`
  - `expected_sections_captured=true`
- **direct same-text QI cross-check on Fixture A captured text**: **not claimed** (not in available governance-safe artifacts)

## Selected path

- **name**: **Path A**
- **description**: Correct structural checker grammar to deterministically accept both Markdown-source headings and rendered plain-text headings, and align appendix row parsing with the already-proven deterministic QI parser behavior.
- **implementation**: **separately gated**
- **selected now**: **design direction only**
- **code change authorized by this DECISION**: **false**

### Required behavior under Path A

**Gap heading recognition**

- continue accepting: `## Your top 5 gaps`
- additionally accept rendered plain-text form: `Your top 5 gaps`
- preserve:
  - case-insensitive deterministic matching
  - line anchoring
  - exact semantic phrase
  - optional approved suffix such as:
    - `, ranked`
    - `, ranked (5 numbered items)`
- do not accept arbitrary semantic variants
- **no fuzzy matching**
- **no edit distance**
- **no LLM classification**

**Evidence Appendix heading**

- continue accepting: `## Evidence Appendix`
- additionally accept rendered form: `Evidence Appendix`
- preserve line-oriented deterministic matching
- do not accept arbitrary appendix names

**Appendix rows**

- retain tab-separated parsing
- add deterministic fallback matching the existing QI checker:
  - two or more whitespace characters
  - pipe-separated rendered/table form
- require exactly three logical columns:
  - `jd_id`
  - company
  - title
- preserve `jd_id` validation
- do not silently accept malformed rows

**Citations**

- preserve the existing `Evidence quote` regex unless deterministic tests prove a separate defect
- do not broaden citation semantics
- fix gap-section recognition so existing citation extraction scopes correctly
- minimum threshold remains **5**
- **no threshold change**

**Input contract**

- structural checker continues receiving the current rendered captured text
- **no `page.tsx` raw-Markdown exposure**
- **no hidden script element**
- **no alternate private report channel**
- **no report body duplication in DOM**

## Path B rejection

- requires `page.tsx` modification
- requires harness input-path modification
- introduces a second report representation
- creates raw-Markdown exposure and privacy surface
- makes structural use a different source from current QI / legacy evaluation
- unnecessary because QI proves rendered text is sufficient

## Path C rejection

- rejected
- prompt already requires the intended sections and is consistent with the checker's raw-Markdown contract

## Implementation ordering (future separately gated loop)

1. Add deterministic rendered-text tests first.
2. Verify current tests demonstrate the failure.
3. Apply the narrow grammar correction.
4. Verify Markdown-source tests remain green.
5. Verify rendered-text tests become green.
6. Verify malformed or semantically different headings remain rejected.
7. Verify citation threshold remains unchanged.
8. Verify telemetry-only isolation remains unchanged.
9. Run no provider and no fixture during implementation.
10. Create implementation RUN_REPORT and DECISION.
11. Any live fixture validation requires separate cost approval.

## Required deterministic tests

**Gap heading**

- raw Markdown exact heading accepted
- raw Markdown heading with approved suffix accepted
- rendered exact heading accepted
- rendered heading with approved suffix accepted
- wrong semantic heading rejected
- partial phrase rejected
- prose sentence containing phrase rejected when not heading-like
- unsupported heading level / format behavior explicitly defined

**Appendix heading**

- raw Markdown heading accepted
- rendered heading accepted
- lowercase / case policy explicitly tested
- prose mention rejected
- unrelated appendix heading rejected

**Appendix rows**

- tab-separated row accepted
- multi-space rendered row accepted
- pipe-separated row accepted
- malformed two-column row rejected
- malformed four-column row rejected
- invalid `jd_id` rejected
- empty field rejected

**Citation scoping**

- five valid citations inside rendered gap section counted
- citations outside gap section not counted
- fewer than five remains RED
- invalid citation syntax remains uncounted
- citation regex unchanged unless separately justified

**Regression isolation**

- structural remains **telemetry-only**
- `affected_legacy_verdict` remains **false**
- combined remains **display-only**
- structural does not enter `checks[]`
- combined does not enter `checks[]`
- `classify(checks)` unchanged
- `process.exit(classification.exit)` unchanged
- QI checker unchanged
- legacy checks unchanged
- baselines unchanged

## Expected future implementation files

- `scripts/structural-evidence-check.mjs`
- deterministic structural checker test file OR existing structural test file
- governance artifacts

Potentially:

- **no** integration-helper change unless tests prove necessary

## Forbidden future implementation files

- `src/app/page.tsx`
- `src/lib/prompts.ts`
- `scripts/quote-integrity-check.mjs`
- `scripts/report-regression-local.mjs`
- regression fixtures
- regression baselines
- previous regression-run artifacts
- package files
- workflows / env / Vercel
- pipeline
- `.agent/scripts/**`

## Green-flip interpretation

Any future structural RED → GREEN change caused by this fix must be documented as:

- checker / capture contract correction
- **not** newly improved report content
- **not** evidence of prompt improvement
- **not** baseline promotion
- **not** blocking promotion

## Policy

- **structural mode**: **`telemetry_only`**
- **QI mode**: **`telemetry_only`**
- **combined mode**: **`display_only`**
- **legacy verdict authority**: **unchanged**
- **process-exit authority**: **unchanged**
- **blocking promotion**: **unauthorized**
- **baseline mutation**: **unauthorized**
- **baseline eligibility change**: **unauthorized**
- **thresholds**: **unchanged**
- **fuzzy matching**: **prohibited**
- **edit distance**: **prohibited**
- **LLM judge**: **prohibited**
- **post-generation rewrite**: **prohibited**
- **provider retry**: **prohibited**
- **fixture rerun**: **unauthorized**

## Residual risks

- Rendered-text grammar must remain **narrow enough to avoid matching prose**.
- Appendix whitespace fallback must **not accept malformed rows**.
- Fixture A diagnosis is strongly supported but **not backed by the same direct QI cross-check evidence as Fixture B** (converging structural + capture-mechanism evidence only).
- Future GREEN flip may be **misinterpreted as product-output improvement**; the implementation DECISION must explicitly disclaim this.
- Live validation **still requires separate explicit cost approval** if desired.

**No paid validation is required for the implementation loop.** A later
fixture validation may be useful but is **not authorized by this
DECISION**.

## Not authorized

- **implementation**
- **push before human approval**
- **checker change**
- **prompt change**
- **harness change**
- **UI change**
- **fixture rerun**
- **provider call**
- **baseline change**
- **blocking promotion**
- **Phase 4**
- **Phase 5**
- **Phase 6**
- **`AgentOps-5f-promote`**

## Cost

- **diagnostics loop**: **$0**
- **DECISION loop**: **$0**
- **provider calls**: **0**
- **fixture reruns**: **0**

## Human approval needed

`yes`

> Required for: push · Path A implementation loop start · any paid
> fixture validation · any baseline / promotion action · any downstream
> action listed under **Not authorized**.

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT implement
Path A.** **Do NOT modify checker, prompt, harness, capture, page.tsx,
integration helper, baselines, fixtures, telemetry, package files,
workflows, env, or Vercel config.** **Do NOT call a real provider.**
**Do NOT rerun any fixture.** **Do NOT mutate baselines.** **Do NOT
promote structural / QI / combined to blocking.** **Do NOT start
`AgentOps-5f-promote`.** **Do NOT start Phase 4 / 5 / 6.**
