# DECISION · AgentOps-5e-followup-baseline-lint-integrate-implement · Phase 2 harness integration complete after capture-evaluability correction

## Metadata

- **decision_id**: `2026-07-24_run_07_DECISION`
- **date**: 2026-07-24
- **based_on_run_report**: `.agent/run_reports/2026-07-24_run_07_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-24_run_07_TASK.md`
- **based_on_memo**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-implement.md`
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_06_DECISION.md`
- **loop**: AgentOps-5e-followup-baseline-lint-integrate-implement
- **parent_loop**: AgentOps-5e-followup-baseline-lint-integrate-design (`2026-07-24_run_06`)
- **initial_impl_commit**: `bc246d3` (Integrate structural evidence telemetry)
- **initial_run_report_commit**: `5b1b97b` (Add RUN_REPORT 2026-07-24_run_07)
- **correction_commit**: `f7710b6` (Fix structural capture evaluability)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (approval to push the corrected
  Phase 2 implementation; Phase 3 remains separately gated at
  ~$0.10 with a separate DECISION and human GO)
- **required_fixes**: **none**

## Outcome classification

**Phase 2 harness integration complete after capture-evaluability
correction.**

## Reasoning summary

The Phase 2 integration now preserves a strict distinction between
capture sufficiency and report structural correctness. Capture
completeness is derived only from harness capture-mechanism facts
(category A: `completion_state`, `report_capture_error`, `reportText`
length, `selectedLength`, `scope`, `fallback_used`) and no longer
depends on Evidence Appendix presence, Evidence quote lines, citation
count, the `selectedHasEvidence` boolean, `REPORT_SECTION_MARKERS`
completeness, `EVIDENCE_APPENDIX_RE` hits, or structural-validator
output. Therefore, a fully captured report that omits required
evidence structure remains evaluable and correctly produces structural
RED telemetry, while genuinely truncated or failed captures produce
`not_evaluable`. Structural telemetry remains entirely separate from
legacy `checks[]`, `classify(checks)`, harness process exit,
quote-integrity logic, and baselines. A second latent bug where raw
CSS-selector `capture.scope` strings would have been rejected by the
validator's `ACCEPTED_CAPTURE_SCOPES` (`{"main section", "body"}`) was
also fixed by mapping harness scope into the accepted set at the
boundary.

## Approved implementation

- Optional `--context <path>` support on
  `scripts/structural-evidence-check.mjs` (schema `0.1-phase2` · 9
  required fields · strict type validation).
- Standalone Phase 1 backward compatibility preserved (26 Phase 1
  tests unchanged).
- New `scripts/lib/structural-evidence-integration.mjs` integration
  helper exporting `runStructuralEvidence({...})`,
  `combineTelemetryVerdict(qi, structural)`, and (correction)
  `deriveCaptureCompleteness({...})`.
- SHA-256 `checker_hash` format `sha256:<hex>`.
- Five-second validator timeout · `killSignal: "SIGKILL"`.
- No retry.
- `metadata.structural_evidence` block (13 fields ·
  `affected_legacy_verdict: false` · `blocking_mode: "telemetry_only"`).
- `metadata.combined_telemetry` block (`display_only: true` ·
  `affected_legacy_verdict: false` · `affected_process_exit: false`).
- Four sibling sections in `verdict.md` (Legacy · QI · Structural ·
  Combined) with required wording.
- Combined telemetry display-only.
- **No legacy-verdict effect.**
- **No process-exit effect.**
- **No baseline mutation.**

## Corrected capture policy

- Capture completeness comes **only** from capture mechanism.
- Missing Appendix does **not** imply incomplete capture.
- Missing citations do **not** imply incomplete capture.
- Missing ranked gaps do **not** imply incomplete capture.
- Structural output does **not** feed capture context.
- Complete captured report with missing structure: **RED**.
- True truncated / failed capture: **not_evaluable**.
- `fallback_used` alone does **not** imply `not_evaluable`.
- Fallback that captured the full container: normal evaluation.
- Harness `capture.scope` (CSS selector strings or `"body_fallback"`)
  is mapped to the validator-accepted scope set at the boundary
  (`fallback ? "body" : "main section"`).

### Truth table (corrected)

```
mechanismReached =
  completionState === "success"
  AND reportCaptureError === null
  AND typeof reportText === "string" AND reportText.length > 0
  AND Number.isFinite(selectedLength) AND selectedLength > 0
  AND typeof scope === "string" AND scope !== "unset"

captureComplete            = mechanismReached
expectedSectionsCaptured   = mechanismReached
captureScopeForContext     = fallbackUsed ? "body" : "main section"
```

Static assertion I26 enforces the invariant across the harness
invocation region, the `deriveCaptureCompleteness` call region, and
the helper module.

## Validation

| step | command | result |
|---|---|---|
| Phase 1 tests preserved | `node scripts/test-structural-evidence-check.mjs` | **40 passed, 0 failed** (26 Phase 1 + 14 CTX) |
| Context tests preserved | (subset of above) | **14/14 PASS** (CTX1-CTX14) |
| Integration tests | `node scripts/test-structural-evidence-integration.mjs` | **26 passed, 0 failed** (I1-I20 preserved + I21-I26 added) |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Syntax check | `node --check` on harness + helper + Phase 2 tests | OK |
| QI checker unchanged | `git diff scripts/quote-integrity-check.mjs` | 0 lines |
| `src/` unchanged | `git diff src/` | 0 lines |
| Baselines unchanged | `git diff .agent/regression_baselines/` | 0 lines |
| `.agent/scripts/` unchanged | `git diff .agent/scripts/` | 0 lines |
| No A/B | Fixture A / Fixture B not run | ✅ |
| No generation | no browser · no dev server | ✅ |
| Cost | none | **$0** |

**Combined total: 66/66 tests PASS.**

### Correction-specific evidence

- **I21** · complete capture + missing Appendix → structural RED
  (evaluable) · exit_code=1.
- **I22** · complete capture + zero citations → structural RED.
- **I23** · complete capture + 4 gaps only → structural RED
  (`observed_gap_count_4_not_5`).
- **I24** · true truncated capture (`completion=hard_timeout`) →
  `captureComplete=false` · structural `not_evaluable`.
- **I25** · fallback captured complete container → `captureComplete=
  true`, `captureScopeForContext="body"`, GREEN.
- **I26** · circularity closed · none of `selectedHasEvidence`,
  `selectedMarkerHits`, `REPORT_SECTION_MARKERS`, `EVIDENCE_APPENDIX_RE`
  appear in the harness `runStructuralEvidence({...})` region, the
  `deriveCaptureCompleteness({...})` call region, or the helper
  module.

## Risks remaining

1. Integration has not yet been exercised against a real Fixture A/B
   run — Phase 3 handles that under separate approval.
2. `metadata.combined_telemetry.quote_integrity_verdict` may echo QI
   verdict values like `"blocked_no_report"` or `"unknown"` when QI
   could not run. The combine rules treat these as NOT green so no
   false GREEN can result.
3. Retained sanitized `structural_evidence_context.json` in the run
   directory may confuse maintainers unfamiliar with its purpose.
   Mitigated by inline comments + memo § 14 documentation.
4. 5s validator timeout is generous but any future refactor could
   approach it. I12 test would catch regression.
5. `metadata.baseline_metadata.json` still lacks a
   `structural_evidence` sub-block — Phase 4's job under separate
   DECISION with grandfathering policy.
6. `verdict.md` structure changed (4 sibling sections in place of the
   single `## Quote integrity` section). Anyone reading historical
   pre-`bc246d3` verdicts and post-`f7710b6` verdicts side-by-side
   should note the section reshape.

## Authorized next step

- **Push Phase 2 implementation** (3 commits: `bc246d3` initial ·
  `5b1b97b` initial RUN_REPORT · `f7710b6` correction) after human
  approval, plus this DECISION commit.
- **Update daily summary** for structural lint Phase 2 implementation
  + capture-evaluability correction.

## Not authorized

- **Phase 3 controlled A/B validation** — separately gated with
  approximately **$0.10** human cost approval and a separate DECISION.
- **Phase 4** baseline metadata migration — separately gated.
- **Phase 5** stability evidence — separately gated.
- **Phase 6** blocking-promotion DECISION — separately gated.
- **`AgentOps-5f-promote`** — not authorized.
- No production run · no manual deploy · no push before human GO
  on the corrected implementation · no baseline mutation · no
  legacy-verdict change · no process-exit change.

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT run A/B.** **Do NOT mutate baselines.** **Do NOT change
legacy verdict or process exit.** **Do NOT promote structural lint.**
**Do NOT start `AgentOps-5f-promote`.**
