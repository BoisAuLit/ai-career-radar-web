# DECISION · AgentOps-5e-followup-prompt-tune-implement · Revise (rejected as implemented, rolled back)

## Metadata

- **decision_id**: `2026-07-24_run_01_DECISION`
- **date**: 2026-07-24
- **based_on_run_report**: `.agent/run_reports/2026-07-24_run_01_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-24_run_01_TASK.md`
- **based_on_memo**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-prompt-tune-implement.md`
- **loop**: AgentOps-5e-followup-prompt-tune-implement
- **parent_loop**: AgentOps-5e-followup-prompt-tune (`2026-07-23_run_07`)
- **impl_commit**: `11c581c` (Enforce exact evidence quotes in report prompt)
- **validation_commit**: `fbcc766` (Validate exact evidence quote prompt)
- **run_report_commit**: `faf3fee` (Add RUN_REPORT 2026-07-24_run_01)
- **rollback_commit**: `3957e87` (Revert exact evidence quote prompt experiment)

## Verdict

- **verdict**: `revise` (rejected as implemented · rolled back before push)
- **human_approval_needed**: **yes** (push and any refinement loop
  require separate human GO)
- **required_fixes**:
  1. **Revert the prompt patch before push.** — **DONE** in commit
     `3957e87` (product `src/lib/prompts.ts` matches `origin/main`
     verbatim).
  2. **Revert / remove the deterministic test tied to the rejected
     prompt patch.** — **DONE** in commit `3957e87`
     (`scripts/test-evidence-quote-contract.mjs` deleted).
  3. **Preserve the experiment artifacts and results.** — **DONE**
     (TASK, memo, A run dir, B run dir, RUN_REPORT unchanged).
  4. **Complete a separate prompt-refinement design loop before
     another implementation or paid validation.** — pending
     (recommended next loop below).

## Reasoning summary

The prompt-only implementation did NOT successfully fix R1 grammar
bridging. Fixture A and Fixture B both completed with legacy GREEN,
but both **lost the Evidence Appendix** and produced **zero
checker-recognized evidence entries**. The absence of
`fabricated_or_unmatched` findings and the disappearance of
`jd_000201` are therefore **not** evidence of improved quote
faithfulness; the citation apparatus disappeared entirely. This is a
**structural product and auditability regression**.

The checker, parser, harness, R1, and R2 remained unchanged and
behaved consistently — the failure is entirely on the model-generation
side under an over-strong prompt contract. The prompt experiment
**must not be shipped as active product behavior**. The A/B runs
remain valuable **negative experimental evidence** and must be
retained without alteration.

## Outcome classification

**Outcome B — partial**, leaning **Outcome C — prompt ineffective**,
with a **structural regression** that would break the report's
auditability if pushed.

## Key results

### Fixture A (`20260724T010632Z_fixture-A`)

- legacy verdict: **GREEN** · exit 0
- QI verdict: **RED** (red_reason: Evidence Appendix missing)
- Evidence Appendix: **MISSING**
- `evidence_entries`: **0**
- `jd_000201`: **not cited**

### Fixture B (`20260724T010756Z_fixture-B`)

- legacy verdict: **GREEN** · exit 0
- QI verdict: **RED** (red_reason: Evidence Appendix missing)
- Evidence Appendix: **MISSING**
- `evidence_entries`: **0**
- `jd_000201`: **not cited**

### Cross-fixture

- `fabricated_or_unmatched = 0` in both — only because no
  recognizable citation-format evidence was emitted.
- No network failures.
- Prior 502 timeout on Fixture B did **not** recur.
- No checker / parser / harness changes.

## Interpretation

- `jd_000201` was **avoided**, not repaired.
- The prompt caused **over-correction**.
- Legacy GREEN is **insufficient evidence of success** because
  Appendix presence is not currently a legacy blocking check.
- The experiment **weakened** the report's auditable JD-evidence
  chain.
- The current patch **must not be pushed** as product behavior.

## Approved rollback (already applied)

- ✅ Restore `src/lib/prompts.ts` to `origin/main` — done in
  commit `3957e87`.
- ✅ Remove `scripts/test-evidence-quote-contract.mjs` (the
  experiment-specific deterministic test that would fail against the
  reverted prompt) — done in commit `3957e87`.
- ✅ Retain TASK, memo, run artifacts, RUN_REPORT, and this DECISION.
- ✅ No fixture rerun.
- ✅ No additional API spend.

Verification: `git diff --name-only origin/main..HEAD -- src scripts`
returns **empty** — product code and scripts match `origin/main`
byte-for-byte.

## Preserved evidence (immutable)

- `.agent/tasks/2026-07-24_run_01_TASK.md`
- `.agent/design_memos/2026-07-24_AgentOps-5e-followup-prompt-tune-implement.md`
- `.agent/regression_runs/20260724T010632Z_fixture-A/`
- `.agent/regression_runs/20260724T010756Z_fixture-B/`
- `.agent/run_reports/2026-07-24_run_01_RUN_REPORT.md`

Do NOT rewrite these to make the experiment look successful. They
document a real negative result that informs the next loop.

## Checker conclusion

- Checker behavior was **not** the cause.
- **R1 remains valid.**
- **R2 remains valid.**
- Do **not** relax checker rules.
- Do **not** hide the failure through parser changes or
  post-processing.

## Recommended next loop

**`AgentOps-5e-followup-prompt-refinement-design`**

### Scope

- **$0 inspection / design only**.
- No generation.
- No prompt implementation.
- Determine how to require BOTH:
  1. mandatory Evidence quote citation structure AND Evidence
     Appendix
  2. exact contiguous quote contents
- Inspect why stronger quote constraints caused the model to omit
  the whole apparatus.
- Design explicit non-optional output requirements.
- Consider whether critical citation instructions need stronger
  placement or compact examples.
- Preserve current Markdown shape initially.
- Preserve checker / parser / harness.
- Preserve R1 / R2.
- Keep QI **telemetry-only**.
- No baseline mutation.
- No promotion.
- **No additional paid A/B** until separate DECISION and human cost
  approval.

### Design questions for next loop

1. Should Evidence Appendix and at least N Evidence quote lines be
   stated as mandatory completion requirements?
2. Should the prompt explicitly say never omit evidence because
   exact quotation is difficult?
3. Should a short positive exact-fragment example be included?
4. Should a negative ellipsis-bridging example be included?
5. Should the self-check happen after mandatory-format generation
   rather than act as an escape hatch?
6. Should the prompt require selecting a shorter exact quote instead
   of omitting the citation?
7. Should structural enforcement be added later in generation output
   validation, without rewriting quotes?

## Do NOT authorize

- Another paid A/B run.
- Option B implementation yet.
- Checker relaxation.
- Fuzzy / edit-distance matching.
- LLM judge.
- Post-generation quote replacement.
- Baseline mutation.
- QI blocking promotion.
- `AgentOps-5f-promote`.

## Risks remaining

1. Prompt compliance is probabilistic.
2. Strong correctness language may cause omission behavior.
3. Evidence Appendix is not currently a legacy blocking check.
4. Future implementation needs to preserve both structure and
   faithfulness.
5. One future A/B run may still be insufficient for stability.
6. `jd_000201` remains unresolved in the original prompt.
7. C/D/E remain untested.
8. QI remains telemetry-only.

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT start refinement implementation.** **Do NOT spend
additional API cost.** Wait for explicit human GO to push the
negative experiment documentation and rollback state, followed by a
separate $0 refinement-design loop.
