# DECISION · AgentOps-5e-followup-prompt-refinement-design · Mandatory exact-evidence structure

## Metadata

- **decision_id**: `2026-07-24_run_02_DECISION`
- **date**: 2026-07-24
- **based_on_run_report**: `.agent/run_reports/2026-07-24_run_02_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-24_run_02_TASK.md`
- **based_on_findings**: `.agent/findings/2026-07-24_prompt_omission_behavior_inventory.json`
- **based_on_memo**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-prompt-refinement-design.md`
- **loop**: AgentOps-5e-followup-prompt-refinement-design
- **parent_loop**: AgentOps-5e-followup-prompt-tune-implement (`2026-07-24_run_01` · rejected, rolled back)
- **impl_commit**: `f55101f` (Design mandatory exact evidence structure)
- **run_report_commit**: `825fa53` (Add RUN_REPORT 2026-07-24_run_02)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (design approval; push and any
  implementation loop require separate human GO + cost approval)
- **required_fixes**: **none**

## Reasoning summary

The refinement-design loop correctly analyzed why the first exact-
quote prompt experiment caused the model to omit the entire evidence
citation apparatus. The prior prompt combined **strong negative quote
constraints** with **existing permissive structural wording** and a
**self-check instruction that allowed shortening or replacement**
without explicitly making the `Evidence quote:` lines and Evidence
Appendix non-optional. The model continued emitting ordinary quoted
text but stopped emitting checker-recognized `Evidence quote:`
citations and omitted the Appendix in both controlled runs. The
approved refinement therefore treats **structural completeness** and
**quote faithfulness** as simultaneous hard requirements. The selected
**Option B-lite** remains a prompt-only change, preserves the existing
Markdown shape and parser / checker / harness behavior, mandates **5
recognized `Evidence quote:` lines** and the exact **`## Evidence
Appendix`** heading, prefers shorter exact fragments over omission,
and performs **structure validation before exactness validation**.

## Approved direction

- Approve the omission-mechanism analysis.
- Approve **Option B-lite** as the preferred design.
- Keep the first refined implementation prompt-only.
- Preserve the existing report Markdown shape.
- Preserve the existing citation parser.
- Preserve the checker.
- Preserve the harness.
- Preserve **R1 strict**.
- Preserve **R2 terminal-punctuation-only**.
- Keep quote integrity **telemetry-only**.
- Do NOT begin AgentOps-5f-promote.
- Do NOT implement a structural validator in the same loop.
- Do NOT use automatic retries.
- Do NOT use post-generation rewriting.

## Negative experiment interpretation

- The model did **not** stop using quotation marks generally.
- It **stopped using the recognized `Evidence quote:` citation
  format**.
- It **omitted the Evidence Appendix**.
- Evidence entries dropped from the healthy norm of **5 to 0**.
- **Zero `fabricated_or_unmatched` findings did not demonstrate
  improved faithfulness** because there were no recognized evidence
  entries to check.
- **`jd_000201` was avoided rather than repaired**.
- Strong correctness requirements **without** mandatory structural
  requirements created an **omission escape path**.
- The prior implementation remains correctly rejected and rolled
  back.

## Supported omission findings

- Both rejected-patch runs retained multiple ordinary quote
  candidates (19-21 each).
- Both rejected-patch runs emitted **zero** checker-recognized
  evidence entries.
- Both rejected-patch runs omitted the Evidence Appendix.
- Current pre-experiment prompt wording does not make the complete
  citation apparatus sufficiently non-optional.
- Existing healthy controlled reports commonly emitted **5** evidence
  entries.

## Inference with limits

- The combination of negative quote constraints, permissive
  structural language, and the prior `shorten-or-replace` self-check
  **likely** encouraged omission as the safest compliance strategy.
- This is an **inference from two controlled runs**, not a claim of
  universal behavior across models, temperatures, or all fixtures.
- The relative contribution of each prior prompt clause remains
  **unproven**.

## Selected design

**Option B-lite** — refined prompt-only contract plus mandatory
output skeleton.

### Structural invariants

- **S1**. The final report MUST include the exact heading
  `## Evidence Appendix`.
- **S2**. The final report MUST emit at least **5** recognized
  evidence lines.
- **S3**. Each of the 5 ranked gap items MUST include a supporting
  `jd_id` citation.
- **S4**. Each evidence line MUST use the existing exact form:
  `Evidence quote: "TEXT" — Company, jd_XXXXXX.`
- **S5**. The Evidence Appendix MUST use the single existing
  parser-compatible canonical format.
- **S6**. Difficulty finding a complete grammatical quote MUST NOT
  result in omission of the citation or Appendix.

### Faithfulness invariants

- **F1**. Text inside quotation marks must be copied from **one
  exact contiguous substring** of the cited job description.
- **F2**. Do NOT use ellipsis inside a quote to bridge separated
  source spans.
- **F3**. Do NOT repair grammar inside quotation marks.
- **F4**. Do NOT paraphrase inside quotation marks.
- **F5**. Do NOT add, remove, or alter words, tense, plurality,
  articles, conjunctions, or other grammatical material inside
  quotation marks.
- **F6**. Place interpretation and grammatical framing OUTSIDE
  quotation marks.
- **F7**. Short, grammatically incomplete source fragments are valid
  and preferred over a polished but non-exact quote.

## Minimum citation count

- Set the mandatory minimum to **5** recognized `Evidence quote:`
  lines.
- Rationale:
  - the report already contains 5 ranked gaps
  - prior healthy controlled A and B reports emitted 5 evidence
    entries
  - 5 provides useful audit coverage without encouraging unnecessary
    filler
- Do **NOT** raise the minimum above 5 in the first implementation.
- Do **NOT** require `jd_000201` itself to appear in every run.
- If `jd_000201` is selected, its quote MUST be exact.
- If it is not selected, the remaining evidence apparatus must still
  contain at least 5 valid entries.

## Evidence Appendix contract

- **Exact heading**: `## Evidence Appendix`
- **Required placement**: after the highest-leverage next-action
  section
- **Required contents**: each cited `jd_id` with company and title
- **Use one canonical existing parser-compatible row format**
- Do NOT offer the model multiple delimiter formats
- De-duplicate repeated jobs
- Uncited Appendix rows remain allowed but are telemetered
- Appendix omission is **invalid**
- Difficulty finding a long exact quote must lead to a shorter exact
  fragment, NOT Appendix omission

## Instruction hierarchy

1. Mandatory output structure.
2. Evidence quote exactness.
3. Short-fragment fallback.
4. Final validation checklist.

## Self-check ordering

**First**:

- at least 5 correctly formatted `Evidence quote:` lines exist
- Evidence Appendix exists

**Second**:

- every quote is an exact character-for-character contiguous source
  substring
- no ellipsis bridging
- no grammar repair or paraphrase

**Third**:

- every cited `jd_id` exists in the supplied Evidence JDs
- every cited job is represented in the Appendix

**The self-check MUST NOT present omission as a valid way to pass
exactness.**

## Example guidance

- Include one compact synthetic positive example.
- The positive example must show:
  - a short exact fragment
  - interpretation outside quotation marks
  - correct company and `jd_id` suffix
  - corresponding Appendix representation
- Include at most two compact synthetic negative examples:
  1. ellipsis / non-contiguous bridging
  2. grammar repair or total omission
- Keep examples synthetic.
- Do NOT use proprietary JD content.
- Avoid excessive examples or repetitive negative instructions.
- Completeness and clarity matter more than prompt length.

### Preferred positive example semantics

```
Evidence quote: "agentic RAG at scale" — ExampleCo, jd_999999.
```

Interpretation MUST appear outside the quote.

## Rejected or deferred approaches

- Prior Option A wording alone — **rejected** (allowed structural
  omission)
- Structured JSON quote generation — **deferred**
- Parser / checker modification — **rejected for first refinement**
- Structural validator in the same implementation — **deferred to a
  separate design loop**
- Regeneration / retry policy — **not authorized**
- Post-generation quote replacement — **rejected**
- Fuzzy matching — **rejected**
- Edit-distance — **rejected**
- LLM judge — **rejected**
- Baseline mutation — **rejected**
- QI blocking promotion — **rejected**

## Parser / checker compatibility

- Preserve the exact existing `Evidence quote:` Markdown shape.
- Preserve the exact existing Evidence Appendix heading.
- Use the current canonical parser-compatible Appendix row format
  only.
- Do NOT alter `extractEvidenceQuotes`.
- Do NOT alter `extractAppendix`.
- Do NOT alter `matchTiered`.
- Do NOT alter R1.
- Do NOT alter R2.
- Do NOT add a new match tier.

## Static test plan (future implement loop)

1. prompt explicitly requires at least 5 `Evidence quote:` lines
2. prompt explicitly requires the exact Evidence Appendix heading
3. prompt contains the existing exact `Evidence quote:` shape
4. prompt forbids omission due to quote difficulty
5. prompt requires shorter exact fragments as fallback
6. prompt requires exact contiguous source spans
7. prompt forbids ellipsis bridging
8. prompt forbids grammar repair and paraphrase
9. prompt allows incomplete fragments
10. prompt orders structural checks before exactness checks
11. prompt includes one compact positive example
12. prompt contains no more than the approved compact negative-
    example set
13. current parser regex still recognizes the documented citation
    form
14. current Appendix parser still recognizes the single selected row
    format
15. checker source and hash remain unchanged

## Future structural validator

- **Recommended eventually.**
- Must be a **separate design and implementation loop**.
- May fail a run when:
  - Appendix is missing
  - fewer than 5 recognized evidence entries exist
  - body citations and Appendix are inconsistent
- Must NOT rewrite report output.
- Must NOT invoke an LLM.
- Must NOT retry automatically.
- Must NOT be bundled into the first refined prompt implementation.

## Authorized next loop

**`AgentOps-5e-followup-prompt-refinement-implement`**

### Authorized implementation scope

- Modify only the relevant report prompt in `src/lib/prompts.ts`.
- Add deterministic tests without new dependencies.
- Preserve current Markdown shape.
- Preserve parser / checker / harness.
- Preserve R1 and R2.
- Use one canonical Appendix row format.
- Add one compact positive example.
- Add at most two compact negative examples.
- Require **5** recognized `Evidence quote:` lines.
- Require the Evidence Appendix.
- Order structure-first self-check before exactness and citation
  validation.

### Paid validation

- Requires a **separate explicit human GO** and **cost approval**.
- Run Fixture A **exactly once**.
- Run Fixture B **exactly once**.
- **No retries.**
- Estimated total generation cost approximately **$0.10**.
- No C/D/E.
- No A-E.

## Success criteria

- Fixture A completes successfully.
- Fixture B completes successfully.
- Both remain legacy GREEN.
- Evidence Appendix is present in both.
- Each run contains at least 5 recognized evidence entries.
- No `fabricated_or_unmatched` quote appears.
- Citation format remains parser-recognized.
- `jd_000201` may be absent.
- If `jd_000201` is present, its quote must match an exact contiguous
  source span.
- R1 remains unchanged.
- R2 remains unchanged.
- Checker / parser / harness remain unchanged.
- No baseline mutation.
- No promotion.
- Quote integrity remains telemetry-only.

## Failure criteria

- Appendix missing in either run.
- Fewer than 5 recognized evidence entries in either run.
- New unmatched quote appears.
- `Evidence quote:` shape becomes malformed.
- Model again avoids the evidence apparatus.
- Checker / parser / harness is changed to hide a failure.
- Report structure regresses.
- Baseline is mutated.
- QI is promoted to blocking.

## Open-question resolutions

**Q1. Mandatory `Evidence quote:` count?** — **Yes.**

**Q2. Count?** — **5.**

**Q3. Appendix explicitly mandatory?** — **Yes**, with the exact
heading.

**Q4. Explicitly forbid omission because exact quoting is difficult?**
— **Yes.**

**Q5. Positive short-fragment example?** — **Yes**, one compact
synthetic example.

**Q6. Negative examples?** — **Yes**, at most two compact synthetic
examples.

**Q7. Self-check ordering?** — **Structure first, exactness second,
citation validity third.**

**Q8. Future structural validator?** — **Yes**, but only in a separate
future loop.

**Q9. First implementation prompt-only?** — **Yes.**

**Q10. Another paid A+B run before promotion-related work?** —
**Yes.**

## Risks remaining

1. Prompt compliance remains probabilistic.
2. Five mandatory citations may encourage filler if wording is weak.
3. Compact examples may still influence content selection.
4. A single A+B run does not prove long-term stability.
5. The omission mechanism is inferred from only two rejected-patch
   runs.
6. Evidence Appendix is still not a legacy blocking check.
7. A separate structural validator may eventually be needed.
8. `jd_000201` remains unresolved in the current production prompt.
9. Quote integrity remains telemetry-only.
10. BLK-0001 / BLK-0002 / BLK-0003 remain `open`.

## Recommended next loop

**`AgentOps-5e-followup-prompt-refinement-implement`**

**Do NOT implement until:**

- this DECISION is committed
- human approves push
- design is pushed and summarized
- a separate explicit human GO approves implementation
- approximately **$0.10** validation cost is approved

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT implement refined prompt.** **Do NOT run A/B.** **Do NOT
authorize cost.** **Do NOT create structural validator.** **Do NOT
start `AgentOps-5f-promote`.**
