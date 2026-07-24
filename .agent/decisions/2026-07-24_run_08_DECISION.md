# DECISION · AgentOps-5e-followup-baseline-lint-integrate-phase3-design · Phase 3 controlled A/B validation design complete

## Metadata

- **decision_id**: `2026-07-24_run_08_DECISION`
- **date**: 2026-07-24
- **based_on_run_report**: `.agent/run_reports/2026-07-24_run_08_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-24_run_08_TASK.md`
- **based_on_findings**: `.agent/findings/2026-07-24_structural_phase3_validation_plan.json`
- **based_on_memo**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-phase3-design.md`
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_07_DECISION.md`
- **loop**: AgentOps-5e-followup-baseline-lint-integrate-phase3-design
- **parent_loop**: AgentOps-5e-followup-baseline-lint-integrate-implement (`2026-07-24_run_07`)
- **design_commit**: `eb6ea20` (Design structural telemetry Phase 3 validation)
- **run_report_commit**: `e8001d5` (Add RUN_REPORT 2026-07-24_run_08)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (design plan approved; execution requires a **later separate cost-approved human GO**)
- **required_fixes**: **none**

## Outcome classification

**Phase 3 controlled A/B validation design complete.**

## Reasoning summary

The Phase 3 design provides a narrow and auditable validation plan
for the integrated structural-evidence telemetry path. It limits
execution to **exactly two fresh generated runs** — Fixture A once
and Fixture B once — with **no automatic or manual retries**, no
additional fixtures, no paid debug calls, an **expected total cost
of approximately $0.10**, a **hard per-run cap of $0.075**, and a
**hard total cap of $0.15**. It distinguishes product-quality
telemetry (structural RED / AMBER · QI RED / AMBER) from integration
correctness so that a valid product finding is not mistaken for an
integration failure. It defines fourteen explicit stop conditions,
requires internally consistent artifacts and metadata, preserves
legacy verdict and process-exit behavior byte-for-byte, and
prohibits baseline mutation, report rewriting, promotion, blocking-
mode changes, and any additional phases (Phase 4 / 5 / 6 /
`AgentOps-5f-promote`).

## Critical authorization boundary

- **This DECISION approves the Phase 3 run PLAN only.**
- **This DECISION DOES NOT authorize executing Fixture A or Fixture B.**
- **This DECISION DOES NOT approve API spending by itself.**

After this DECISION is pushed and summarized, a **separate explicit
human message** must approve **all** of the following in one grant:

- Exactly Fixture A once.
- Exactly Fixture B once, only after A stop-condition review passes.
- Expected total cost approximately **$0.10**.
- Hard total cap **$0.15**.
- Hard per-run cap **$0.075**.
- **Zero retries.**

Until that grant lands: **no dev server**, **no Fixture A run**,
**no Fixture B run**, **no paid API call**.

## Approved design

- Exactly **two paid runs** total.
- **Fixture A exactly once.**
- **Fixture B exactly once.**
- **B may run only after A completes AND all stop conditions are checked.**
- **Zero automatic retries.**
- **Zero manual retries.**
- **No C / D / E.**
- **No A-E suite.**
- **No third run.**
- **No paid debugging generation.**
- **No OpenAI.**
- Use only the **existing approved application / provider / model path** (Sonnet 4.6 via the app runtime `/api/generate-report`).

## Selected fixtures

| id | path |
|---|---|
| **A** | `.agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md` |
| **B** | `.agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md` |

Both already registered in `FIXTURE_TABLE` (harness lines 53-74). No new fixture.

## Future exact commands

**Prerequisite** (separate terminal / background):

```
cd /Users/bohaoli/Desktop/ai-career-radar-web
npm run dev
# wait for `Ready in Xms`
```

**Run A** (foreground):

```
cd /Users/bohaoli/Desktop/ai-career-radar-web
node scripts/report-regression-local.mjs --fixture A
```

**Run B** (foreground, only after A stop-condition review):

```
cd /Users/bohaoli/Desktop/ai-career-radar-web
node scripts/report-regression-local.mjs --fixture B
```

- **No new flags.**
- **No environment toggles.**
- **No custom output paths.**
- **No changed harness behavior.**

## Cost envelope

- **Expected per run**: approximately **$0.05**
- **Expected total**: approximately **$0.10**
- **Hard per-run cap**: **$0.075**
- **Hard total cap**: **$0.15**
- If projected or measured usage exceeds either cap: **stop**.
- **Do not retry.**
- **Do not run B if A or projected total breaches the cap.**
- Record measured usage per run AND total in the future Phase 3 RUN_REPORT.
- **No hidden extra generation.**
- **No paid debugging call.**

## Execution sequence after a future explicit cost-approved GO

1. Preflight both repos.
2. Confirm web and pipeline clean; confirm Phase 3 design + this DECISION are on `origin/main`.
3. Confirm 0-line baseline diff (`git diff origin/main..HEAD -- .agent/regression_baselines/`).
4. Start local dev server (`npm run dev` in a separate terminal).
5. Wait for the server-ready state (`Ready in Xms`).
6. Run Fixture A once (`node scripts/report-regression-local.mjs --fixture A`).
7. Record A run ID, command exit, cost, duration, artifacts, verdicts.
8. Check all fourteen stop conditions.
9. Run Fixture B once **only if no stop condition is triggered** (`node scripts/report-regression-local.mjs --fixture B`).
10. Record B run ID, command exit, cost, duration, artifacts, verdicts.
11. Stop after B.
12. Create Phase 3 RUN_REPORT.
13. **Do not promote or mutate baselines.**

## Stop conditions

Stop after A and do not run B if any of the following occurs:

1. Generation or application failure makes B unsafe or meaningless.
2. Unexpected automatic or manual retry begins.
3. Per-run cost exceeds **$0.075**.
4. Projected total cost exceeds **$0.15**.
5. Provider 4xx or 5xx occurs with unclear charge state.
6. Legacy `checks[]` shape or membership unexpectedly changes.
7. Structural result enters legacy `checks[]`.
8. Combined telemetry enters legacy `checks[]`.
9. Telemetry affects `classify(checks)`.
10. Telemetry affects process exit.
11. Any baseline file changes.
12. `report.md` is rewritten after generation.
13. Structural summary is missing or malformed.
14. `metadata.combined_telemetry` is missing or malformed.
15. `metadata.structural_evidence.affected_legacy_verdict !== false`.
16. Any forbidden file changes.
17. An unexpected third paid operation is attempted.

## No-retry policy

- **No automatic retry.**
- **No manual retry.**
- **No rerun after provider failure.**
- **No rerun after app error.**
- **No retry to obtain a more favorable telemetry result.**
- **No paid diagnostic generation.**
- A failed external run is documented as **pause** or **revise** evidence.

## Phase 3 objective

Validate on two fresh controlled reports that the integrated harness accurately records and displays:

- legacy regression verdict
- quote-integrity telemetry
- structural-evidence telemetry
- combined telemetry

without changing:

- legacy `checks[]`
- `classify(checks)`
- process exit
- baseline eligibility
- baseline files
- report text
- quote-integrity semantics
- structural-evidence semantics

## Expected artifacts per run (7)

- `metadata.json`
- `verdict.md`
- `structural_checks.json`
- `quote_integrity_summary.json`
- `structural_evidence_summary.json`
- `structural_evidence_context.json`
- `network_diagnostics.json` (when emitted by current harness behavior)

**Scratchpad-only** (never committed):

- `report.md`
- `report.png`
- Any other proprietary generated output.

## Retention

- Governance-safe summaries may be committed under existing run conventions.
- **`report.md` must not be committed.**
- **Screenshots must not be committed.**
- **Generated proprietary report content must not be committed.**
- **No files copied to regression baselines.**
- **No baseline promotion.**

## Legacy acceptance

- Legacy verdict comes only from `classify(checks)`.
- Legacy `checks[]` remains unchanged.
- No QI or structural entry is added to `checks[]`.
- Process exit remains controlled only by legacy classification.
- Telemetry cannot change legacy verdict.

## Quote-integrity acceptance

- `quote_integrity_summary.json` exists.
- QI verdict is recorded.
- `blocking_mode` remains `telemetry_only`.
- R1 and R2 remain unchanged.
- **No new QI tier.**
- QI does not affect legacy verdict.
- QI does not affect process exit.

## Structural-evidence acceptance

- `structural_evidence_context.json` exists.
- `structural_evidence_summary.json` exists.
- Context schema is valid (`schema_version = "0.1-phase2"`, 9 required fields, strict types).
- Structural summary schema is valid (`schema_version = "0.1-phase1"`, verdict in `{green, amber, red, not_evaluable, null}`).
- Checker hash matches `/^sha256:[a-f0-9]{64}$/`.
- Structural verdict is visible.
- Exit 0 and exit 1 semantics are correctly represented (`0` → `{green, amber, not_evaluable}`; `1` → `red`; `2` → `tool_error`).
- `tool_error` is visible when applicable.
- `blocking_mode` remains `telemetry_only`.
- `affected_legacy_verdict` remains `false`.
- Structural result does not affect process exit.

## Combined-telemetry acceptance

- Precedence: **`tool_error` > `red` > `amber` > `not_evaluable` > `green`**.
- `display_only` is `true`.
- `affected_legacy_verdict` is `false`.
- `affected_process_exit` is `false`.
- Combined result is never inserted into legacy `checks[]`.
- Combined result never affects process exit.
- `verdict.md` does not hide telemetry RED behind legacy GREEN.

## Integration success

Both A and B must:

- produce the required integration artifacts (7 per run);
- contain internally consistent telemetry and metadata;
- preserve legacy `checks[]` and process-exit semantics;
- show QI and structural telemetry visibly;
- follow combined-telemetry precedence;
- avoid baseline mutation;
- avoid report rewriting;
- avoid retries;
- stay within the approved cost cap;
- contain no integration / tooling correctness defect.

## Product-quality vs integration-quality policy

A structural **RED**, structural **AMBER**, QI **RED**, or QI **AMBER**
does **not by itself fail Phase 3**. It may represent a valid
product / report-quality finding — the capture-evaluability fix in
`f7710b6` was designed exactly so that this signal remains visible
instead of being masked as `not_evaluable`.

Phase 3 **fails** only when the integration itself misbehaves,
including:

- Telemetry enters legacy `checks[]`.
- Process exit changes because of telemetry.
- Context marks a complete capture incomplete.
- Context marks a truncated capture complete.
- Expected artifact missing after successful validator execution.
- Malformed summary or metadata.
- Telemetry result masked or mislabeled.
- Baseline mutation.
- Report rewriting.
- Unexpected retry.
- Cost cap breach.
- Forbidden file mutation.

Product-quality follow-up (prompt refinement, generator tuning) is a
distinct loop and requires its own design + DECISION.

## Observed metrics per run

- generation duration
- `report_char_count`
- capture scope (raw harness selector or `body_fallback`)
- `captureScopeForContext` (`"main section"` or `"body"`)
- `fallback_used`
- `capture_complete`
- legacy verdict
- QI verdict
- structural verdict
- combined verdict
- process exit
- `recognized_citation_line_count`
- `unique_cited_jd_count`
- `covered_gap_count`
- `observed_gap_count`
- Appendix presence
- Appendix row count
- `missing_from_appendix` count
- `appendix_not_cited` count
- structural red reasons
- structural amber reasons
- `not_evaluable` reasons
- structural `tool_error`
- measured cost

The A/B comparison is **integration telemetry comparison only**. It
is **not a broad model-quality benchmark.**

## Post-run classification

Keep all categories separate:

- **Generation**: `success` · `app_error` · `timeout` · `provider_error`
- **Capture**: `complete` · `incomplete` · `fallback_complete` · `fallback_incomplete`
- **Legacy**: `green` · `amber` · `red`
- **Quote integrity**: `green` · `amber` · `red` · `not_evaluable` · `tool_error`
- **Structural evidence**: `green` · `amber` · `red` · `not_evaluable` · `tool_error`
- **Combined**: `green` · `amber` · `red` · `not_evaluable` · `tool_error`
- **Integration**: `pass` · `fail` · `not_evaluable`

## Future Phase 3 RUN_REPORT requirements

- Reference to explicit human cost approval.
- Exact A/B commands as executed.
- Run IDs.
- Measured cost per run.
- Total cost.
- No-retry confirmation.
- Duration per run.
- Command / process exit per run.
- Legacy verdict per run.
- QI verdict per run.
- Structural verdict per run.
- Combined telemetry per run.
- Capture context per run.
- Artifact-existence matrix (7 × 2).
- Metadata consistency.
- `verdict.md` consistency (four sibling sections + required wording).
- Zero-line baseline diff.
- Checker hash per run (SHA-256).
- Harness git SHA per run.
- No-report-rewrite confirmation.
- Integration pass / fail per run.
- Overall integration result.
- Anomalies.
- Recommended next step.

## Future Phase 3 DECISION outcomes

- **`approve`** — both runs integration-correct · no legacy / process-exit coupling · no blocking defect · cost within cap.
- **`revise`** — implementation or integration defect · metadata inconsistency · capture-context error · tool-error handling defect · telemetry masking · unexpected retry · cost-policy violation.
- **`pause`** — external provider / app failure prevents meaningful evaluation · no clear implementation defect.

## No-promotion policy

Successful Phase 3 **does not authorize**:

- baseline migration (Phase 4)
- structural blocking mode (Phase 6)
- QI blocking mode
- baseline eligibility changes
- Phase 4
- Phase 5
- Phase 6
- additional paid runs
- `AgentOps-5f-promote`

Successful Phase 3 provides **evidence only** for a later separate
DECISION.

## Policy resolutions

| Q | Answer |
|---|---|
| **Q1** | exactly **two paid runs** |
| **Q2** | **Fixture A and Fixture B** |
| **Q3** | **no retry** |
| **Q4** | approximately **$0.10** expected total |
| **Q5** | **$0.15 hard total cap** and **$0.075 per-run cap** |
| **Q6** | **stop conditions defined and mandatory** (17 enumerated) |
| **Q7** | **existing harness commands only** (`--fixture A|B`) |
| **Q8** | **integration success requires both runs to satisfy all integration acceptance conditions** |
| **Q9** | **structural RED does not automatically fail Phase 3** |
| **Q10** | **QI AMBER does not automatically fail Phase 3** |
| **Q11** | **telemetry does not affect legacy verdict** |
| **Q12** | **telemetry does not affect process exit** |
| **Q13** | **baselines remain unchanged** |
| **Q14** | **reports are not rewritten** |
| **Q15** | **only governance-safe artifacts may be committed** |
| **Q16** | **Phase 3 does not authorize Phase 4** |
| **Q17** | **Phase 3 does not authorize blocking promotion** |
| **Q18** | **Phase 3 does not authorize `AgentOps-5f-promote`** |
| **Q19** | **external failure during A means no retry and no B; outcome pause or revise** |
| **Q20** | **cost-cap breach means immediate stop; no B and no retry** |

## Cost

- **Current design loop**: **$0**
- **Future planned execution**: approximately **$0.10**
- **Hard execution cap**: **$0.15**
- **Execution cost not yet approved.**

## Approved next direction

**Push Phase 3 design** (plus this DECISION) after explicit human
push approval, **update the daily summary**, then **wait for a
separate explicit human message** approving both:

- the two-run scope (Fixture A × 1 + Fixture B × 1)
- the **$0.15 hard cap** ($0.075 per run)

Only after that separate cost-approved GO lands may the executor:

- start the local dev server
- run Fixture A
- (conditionally) run Fixture B
- author the Phase 3 RUN_REPORT
- author the Phase 3 DECISION

## Do NOT authorize

- Running A or B **now**.
- Starting a dev server **now**.
- **Any API call now.**
- Baseline mutation.
- Blocking promotion.
- `AgentOps-5f-promote`.
- Phase 4 / 5 / 6.
- Any additional paid runs beyond the two approved fixtures.
- Any modification of `scripts/**`, `src/**`, `.agent/regression_baselines/**`, `.agent/regression_runs/**`, `.agent/regression_fixtures/**`, `.agent/scripts/**`, `package.json` / lockfile / workflows / env / `vercel.json`, or the pipeline repository.

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT run A / B.** **Do NOT start a dev server.** **Do NOT make
any paid API call.** **Do NOT mutate baselines.** **Do NOT change
legacy verdict or process exit.** **Do NOT promote structural lint
or QI to blocking.** **Do NOT start `AgentOps-5f-promote`.**
