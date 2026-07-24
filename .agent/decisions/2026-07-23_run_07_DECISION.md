# DECISION · AgentOps-5e-followup-prompt-tune · R1 grammar-bridging root-cause approval

## Metadata

- **decision_id**: `2026-07-23_run_07_DECISION`
- **date**: 2026-07-23
- **based_on_run_report**: `.agent/run_reports/2026-07-23_run_07_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-23_run_07_TASK.md`
- **based_on_design_memo**: `.agent/design_memos/2026-07-23_AgentOps-5e-followup-prompt-tune.md`
- **based_on_findings**: `.agent/findings/2026-07-23_r1_grammar_bridging_inventory.json`
- **loop**: AgentOps-5e-followup-prompt-tune
- **parent_loop**: AgentOps-5e-migrate (`2026-07-23_run_06`)
- **impl_commit**: `e530252` (Design exact evidence quote contract)
- **run_report_commit**: `3fc72e7` (Add RUN_REPORT 2026-07-23_run_07)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (design approval; push and any
  implementation loop require separate human GO)
- **required_fixes**: **none**

## Reasoning summary

AgentOps-5e-followup-prompt-tune successfully isolated the recurring
`jd_000201` R1 quote-integrity failure to the **model-generation
stage**. The primary failure mode is **non-contiguous bridging**: in
three controlled occurrences, the generated quote combined a verbatim
source head with an unmatched tail after an ellipsis. A fourth
occurrence used a continuous but paraphrased or grammar-repaired span
that was not an exact source substring. Source data, evidence
selection, prompt payload construction, response streaming, report
capture, parser extraction, and checker comparison were found to
preserve text without introducing the mismatch. The current report
prompt does not explicitly require evidence quotes to be exact,
contiguous, verbatim source spans; does not prohibit grammar repair or
paraphrase; does not state that fragments are acceptable; and does not
require a pre-submit exact-substring self-check. The preferred
corrective direction is therefore a **minimal prompt-only contract
strengthening**, while preserving the current Markdown shape and
leaving R1, R2, parser, checker, and harness behavior unchanged.

## Approved direction

- Approve the root-cause analysis.
- Classify the primary `jd_000201` failure as **non-contiguous
  bridging**.
- Classify the secondary failure as **paraphrase and/or grammar
  repair**.
- Accept that the mismatch first appears at the **model-generation
  stage**.
- Accept that no current evidence supports a checker defect.
- Choose **Option A** as the primary implementation: strengthen
  prompt wording only.
- Preserve the current Evidence quote Markdown shape.
- Preserve the current parser.
- Preserve **R1** strict exact-contiguous matching.
- Preserve **R2** terminal-punctuation-only allowance.
- Do NOT add fuzzy matching.
- Do NOT add edit-distance.
- Do NOT add LLM judge.
- Do NOT add automatic post-generation quote replacement.
- Do NOT silently rewrite generated quotes.
- Keep quote integrity **telemetry-only**.
- Do NOT begin AgentOps-5f-promote.

## Root cause

- **target_job_id**: `jd_000201`
- **primary_classification**: `non_contiguous_bridging`
- **secondary_classification**: `paraphrase_or_grammar_repair`

### Evidence summary

- Four controlled occurrences were identified.
- Three occurrences contained:
  - a verbatim source head
  - an ellipsis
  - a tail that was not present as the corresponding contiguous source
    text
- One occurrence contained a continuous generated quote that was still
  not an exact source substring.
- Company and role validation passed.
- Cited job id was consistently `jd_000201`.
- Punctuation-only R2 does not apply.
- Whitespace / Unicode normalization does not explain the mismatch.
- Citation mapping and source selection were not identified as the
  primary cause.

### Lineage conclusion

- Source `web_bundle` text remained stable.
- `pickEvidenceJds` did not rewrite the source body.
- `buildReportUserMessage` did not rewrite the source body.
- API streaming did not introduce the mismatch.
- Report capture preserved model output.
- `extractEvidenceQuotes` preserved the quoted string.
- `matchTiered` faithfully evaluated the generated string.
- **Earliest supported mismatch stage: model generation.**

## Current prompt gaps

- No exact-verbatim requirement.
- No exact-substring requirement.
- No contiguous-span requirement.
- No explicit no-paraphrase rule.
- No explicit no-grammar-repair rule.
- No statement that fragments are acceptable.
- No prohibition on ellipsis-based bridging.
- No exact-substring pre-submit self-check.
- Quote and interpretation are not explicitly distinguished by
  contract.

## Approved prompt contract

- Every quoted Evidence span must be copied verbatim from one
  contiguous span of the cited job description.
- Do NOT paraphrase.
- Do NOT repair grammar.
- Do NOT add or remove words.
- Do NOT change tense or plurality.
- Do NOT add or remove articles or conjunctions.
- Do NOT combine separated fragments inside quotation marks.
- A quote does not need to be a complete sentence.
- Grammatically incomplete source fragments are acceptable.
- Put explanation and grammatical framing outside quotation marks.
- Do NOT use ellipsis to bridge separated source fragments.
- Before finalizing, verify that every quoted string occurs exactly
  in the supplied text for the cited `jd_id`.
- If a quote is not exact, shorten or replace it with an exact
  contiguous source span.

### Implementation guidance

- Keep the patch minimal and non-redundant.
- Completeness and clarity matter more than a specific line count.
- Insert the contract near the existing evidence and company-specific
  claim instructions.
- Do NOT alter unrelated prompt sections.
- Do NOT change Markdown labels or citation format in the first
  implementation.
- Do NOT modify checker / parser / harness.
- Do NOT introduce deterministic quote replacement.

## Selected option

**Option A — stronger prompt wording.**

## Secondary option

**Option B — explicit quote / interpretation separation** may be
considered only if Option A fails controlled validation.

## Rejected options

- **Post-generation near-match replacement** — rejected because it
  can conceal hallucination and break auditability.
- **Checker relaxation** — rejected because the checker is behaving
  according to approved R1 policy.
- **Fuzzy / edit-distance matching** — rejected.
- **LLM judge** — rejected.
- **Deterministic source rewriting of generated output** — rejected
  for the first implementation.

## Implementation loop

**`AgentOps-5e-followup-prompt-tune-implement`**

### Authorized scope

- Modify only the relevant report prompt in `src/lib/prompts.ts`.
- Add deterministic **$0** tests or assertions for the new contract.
- Preserve current report Markdown shape.
- Preserve parser / checker / harness.
- Run Fixture A **exactly once**.
- Run Fixture B **exactly once**.
- **No retries.**
- Expected total cost approximately **$0.10**.
- Keep quote integrity **telemetry-only**.
- **No baseline mutation.**
- **No baseline promotion.**
- **No blocking promotion.**

### Deterministic test expectations

1. Prompt contains exact / verbatim / contiguous requirement.
2. Prompt prohibits grammar repair and paraphrase.
3. Prompt allows incomplete source fragments.
4. Prompt prohibits ellipsis-based bridging.
5. Prompt requires exact-substring self-check.
6. Known `jd_000201` source span passes exact-match fixture.
7. Grammar-added negative example remains rejected.
8. Non-contiguous bridging negative remains rejected.
9. Terminal-punctuation-only R2 behavior remains unchanged.
10. Interpretation outside quotation marks remains allowed.

### Paid validation plan

- Static validation first.
- Deterministic tests first.
- Fixture A exactly once.
- Fixture B exactly once.
- No retries.
- **Estimated cost approximately $0.10 total.**

### Required comparison

- legacy verdict
- structural validity
- report length and capture scope
- Evidence Appendix presence
- `quote_integrity` verdict
- `jd_000201` result
- number of `fabricated_or_unmatched` quotes
- R2 terminal-punctuation-only results
- appendix-not-cited telemetry
- completion state
- network diagnostics
- cost and duration

### Success criteria

- `jd_000201` no longer produces R1 RED.
- No new `fabricated_or_unmatched` quote appears.
- R1 implementation remains unchanged.
- R2 implementation remains unchanged.
- Fixture A completes.
- Fixture B completes.
- Legacy structure remains valid.
- Evidence Appendix remains present.
- Quote integrity remains telemetry-only.
- No baseline mutation.
- No promotion.

### Failure criteria

- `jd_000201` remains unmatched.
- The issue is merely hidden by parser or format changes.
- Checker is weakened.
- Generated evidence becomes less useful.
- New unmatched quotes appear.
- Report structure regresses.
- Model emits malformed evidence / citation format.
- Post-processing silently rewrites model output.

## Open-question resolutions

**Q1. Option A alone or A plus structured separation?**
- **Start with Option A alone.**

**Q2. Shortest phrase or full sentence?**
- **Prefer the shortest useful contiguous source span.**
- Do NOT require a complete sentence.

**Q3. Explicit self-check?**
- **Yes.**

**Q4. Prompt-only or Markdown structure change?**
- **Prompt-only in the first implementation.**

**Q5. Paid A+B validation before promotion-related work?**
- **Yes.**
- Do NOT begin promotion-related work until at least one controlled
  A+B validation loop demonstrates the patch.

## Risks remaining

1. Prompt compliance is probabilistic.
2. One A+B validation loop may not prove long-term stability.
3. Option A may be insufficient without structural quote /
   interpretation separation.
4. Exact quotes may become shorter and less rhetorically polished.
5. Existing R1 issues outside `jd_000201` may still appear.
6. Error-state fail-fast remains dynamically unexercised.
7. Prior transient 502 exact source remains unknown.
8. C/D/E remain without controlled generated runs.
9. Quote integrity remains telemetry-only.
10. BLK-0001 / BLK-0002 / BLK-0003 remain `open`.

## Recommended next loop

**`AgentOps-5e-followup-prompt-tune-implement`**

Do NOT implement until:

- this DECISION is committed
- human approves push
- design is pushed and summarized
- a separate explicit human GO authorizes implementation and
  approximately $0.10 validation cost

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT implement.**
Wait for explicit human GO before pushing this design and before
starting `AgentOps-5e-followup-prompt-tune-implement`.
