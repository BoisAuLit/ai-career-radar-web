# Design memo · AgentOps-5e-followup-baseline-lint-integrate-phase3-design · Phase 3 controlled A/B validation

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-baseline-lint-integrate-phase3-design
- **parent_loop**: AgentOps-5e-followup-baseline-lint-integrate-implement (`2026-07-24_run_07` · Phase 2 corrected + pushed)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_07_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_08_TASK.md`
- **findings**: `.agent/findings/2026-07-24_structural_phase3_validation_plan.json`
- **cost this loop**: **$0**
- **cost for future Phase 3 execution**: **~$0.10** (hard cap **$0.15**)

## 1 · Purpose

Design (do NOT run) a tightly controlled two-run A/B validation of the
Phase 2 structural-evidence harness integration. Specify exact
fixtures, exact commands, cost envelope, stop conditions, artifact
matrix, acceptance criteria, product-failure vs integration-failure
distinction, retention policy, and future RUN_REPORT / DECISION
requirements. Phase 3 execution requires a **separate DECISION** and
**explicit human cost approval** (~$0.10 + $0.15 cap).

## 2 · Background

- Phase 1 (`2026-07-24_run_05`): standalone `scripts/structural-evidence-check.mjs`
  + 26 deterministic tests + canonical G2 GREEN. Zero paid.
- Phase 2 design (`2026-07-24_run_06`): integration point B · `--context <path>` · SHA-256 hash · 5s timeout · combined telemetry display-only.
- Phase 2 implement (`2026-07-24_run_07`): initial commit `bc246d3`, then reviewer-discovered capture-evaluability circular dependency corrected in `f7710b6`, DECISION `746e88e`, daily summary `42adbe2`. All pushed.
- Deterministic tests **66/66** (40 Phase 1 + 26 integration incl. I21-I26 evaluability regression).

## 3 · Phase 2 final state (verified on main HEAD `42adbe2`)

- Structural-evidence validator integrated into `scripts/report-regression-local.mjs` immediately after `runQuoteIntegrity` returns and BEFORE the first legacy `checks.push`.
- Pure helper `deriveCaptureCompleteness()` in `scripts/lib/structural-evidence-integration.mjs` consuming ONLY category A (transport / capture-mechanism) facts.
- Capture scope normalized at boundary: `fallbackUsed ? "body" : "main section"`.
- `metadata.structural_evidence` block (13 fields · `affected_legacy_verdict: false`).
- `metadata.combined_telemetry` block (`display_only: true` · `affected_legacy_verdict: false` · `affected_process_exit: false`).
- Four sibling `verdict.md` sections (Legacy · QI · Structural · Combined).
- Legacy `checks[]`, `classify(checks)`, `process.exit(classification.exit)`, and baselines **byte-for-byte untouched**.
- QI checker, R1, R2, no new QI tier — **all preserved**.
- No new dependency (Node stdlib only).

## 4 · Scope

**Design only.** Produce TASK, findings JSON, design memo, RUN_REPORT.
Nothing else. **No generation. No paid API. No implementation. No
harness / checker / prompt / baseline change. Cost $0.**

## 5 · Out of scope

- Phase 3 execution itself (requires separate DECISION + human GO + explicit ~$0.10 cost approval).
- Any code / prompt / harness / checker / QI / R1 / R2 / test edit.
- Any baseline mutation.
- Any structural-evidence promotion to blocking.
- QI promotion to blocking.
- `AgentOps-5f-promote`.
- Phase 4 (baseline migration) · Phase 5 (stability) · Phase 6 (blocking promotion).
- Additional fixtures (C / D / E).
- Additional evaluation loops (edit-distance / LLM judge / post-generation replacement / fuzzy matching).
- Any modification of `.agent/scripts/**` or the pipeline repository.

## 6 · Phase 3 objective

Answer the primary question: **Does the integrated harness correctly
produce and display legacy regression verdict, quote-integrity
telemetry, structural-evidence telemetry, and combined telemetry on
two fresh controlled reports, without altering legacy verdict or
process exit?**

This is a **telemetry-integration validation**, not a model-quality
benchmark. Product-quality follow-up is a distinct concern (see § 18).

## 7 · Run count

**Exactly two paid generations**:

- **Run A** — Fixture A (Backend → Applied AI pivot) · 1 generation · 0 retry
- **Run B** — Fixture B (Fullstack → AI product) · 1 generation · 0 retry

**Not allowed** in the same approval:
- Fixture C / D / E
- Repeated A or repeated B
- Third validation run
- Automatic retry
- Manual retry
- Paid debug generation
- Prompt tuning between A and B

## 8 · Fixture selection

| id | path | role |
|---|---|---|
| **A** | `.agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md` | primary (recommendation keywords: rag / eval / retrieval) |
| **B** | `.agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md` | secondary (recommendation keywords: agent / tool call / eval / telemetry) |

Both are already registered in `FIXTURE_TABLE` (harness lines 53-74)
and have been exercised in prior baseline commits. No new fixture.

## 9 · Exact commands

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

**Run B** (foreground, only after A completes and stop conditions have been checked):

```
cd /Users/bohaoli/Desktop/ai-career-radar-web
node scripts/report-regression-local.mjs --fixture B
```

**Do NOT use new flags.** The harness accepts exactly `--fixture A|B`
and `--help`/`-h`. Do NOT set env-var toggles. Do NOT change
`REPORT_REGRESSION_BASE_URL`.

## 10 · Cost envelope

- **Expected per-run**: ~$0.05
- **Expected total**: **~$0.10**
- **Hard per-run cap**: **$0.075**
- **Hard total cap**: **$0.15**
- **No paid debug calls** · **no OpenAI API** · **no additional provider**
- Provider: existing approved Anthropic API path via the app runtime (Sonnet 4.6 `claude-sonnet-4-6`)
- Cost measurement: runtime cost accounting from the existing app path if available; otherwise external ledger entry attached to the future RUN_REPORT.

**Cap-exceeded action**: stop immediately · do NOT continue to B · do
NOT retry · surface actual usage · Phase 3 DECISION outcome = `revise`
or `pause` with explicit cost explanation.

## 11 · Stop conditions

Stop **after A** and do NOT proceed to B if any of:

1. Generation `completion_state !== "success"` from an external cause (provider outage, browser crash, dev server crash).
2. Harness legacy `checks[]` shape changed.
3. Structural result appears in `classify()` input `checks[]`.
4. `process.exit(classification.exit)` semantics changed.
5. Any baseline file under `.agent/regression_baselines/**` changed.
6. Validator or helper rewrote the captured `report.md`.
7. Any unexpected paid retry begins (auto or manual).
8. Measured cost for A exceeds `$0.075`.
9. Measured cost for A + projected B exceeds `$0.15`.
10. Provider returns 4xx/5xx with paid metering AND cost accounting cannot confirm sub-cap.
11. `structural_evidence_summary.json` schema fails validation.
12. `metadata.combined_telemetry` block is missing or malformed.
13. `metadata.structural_evidence.affected_legacy_verdict !== false`.
14. Any forbidden file changed (`src/**`, prompts, QI checker, baselines, `.agent/scripts/**`, package/lock/workflow/env/vercel, pipeline).

Stop **after B** with `pause` or `revise` if any of the above triggers
after B completes.

## 12 · Artifact matrix

Per run, exactly seven governance artifacts committed under
`.agent/regression_runs/<run-id>/`:

| # | artifact | required | committed |
|---|---|---|---|
| 1 | `metadata.json` | ✅ | ✅ |
| 2 | `verdict.md` | ✅ | ✅ |
| 3 | `structural_checks.json` (legacy 25-check list only) | ✅ | ✅ |
| 4 | `quote_integrity_summary.json` | ✅ | ✅ |
| 5 | `structural_evidence_summary.json` | ✅ | ✅ |
| 6 | `structural_evidence_context.json` | ✅ | ✅ |
| 7 | `network_diagnostics.json` | ✅ | ✅ |

Scratchpad-only (never committed):

- `$TMPDIR/acr-regression-runs/<run-id>/report.md`
- `$TMPDIR/acr-regression-runs/<run-id>/report.png`

`metadata.structural_evidence` MUST include: `evaluation_status` ·
`verdict` · `blocking_mode: "telemetry_only"` · `checker_hash` ·
`exit_code` · `duration_ms` · `summary_path` · `context_path` ·
`capture_context` · `affected_legacy_verdict: false`.

`metadata.combined_telemetry` MUST include: `verdict` ·
`display_only: true` · `affected_legacy_verdict: false` ·
`affected_process_exit: false` · `quote_integrity_verdict` ·
`structural_evidence_verdict`.

## 13 · Legacy acceptance

- Legacy verdict is whatever `classify(checks)` returns.
- Legacy `checks[]` count and set unchanged vs Phase 2 baseline.
- `process.exit(classification.exit)` remains the sole authority.
- No structural or combined telemetry inserted into `checks[]`.

## 14 · QI acceptance

- `quote_integrity_summary.json` exists.
- QI verdict recorded in `metadata.quote_integrity`.
- `blocking_mode = "telemetry_only"`.
- R1 and R2 unchanged.
- QI does not affect legacy verdict or process exit.

## 15 · Structural acceptance

- `structural_evidence_summary.json` exists.
- `structural_evidence_context.json` exists with `schema_version = "0.1-phase2"`.
- `checker_hash` matches `/^sha256:[a-f0-9]{64}$/`.
- Verdict in `{green, amber, red, not_evaluable, null}`.
- Exit code in `{0, 1, 2, null}`.
- Exit 0 → verdict in `{green, amber, not_evaluable}`.
- Exit 1 → verdict = `red`.
- Exit 2 → `evaluation_status = "tool_error"` (verdict `null`).
- `blocking_mode = "telemetry_only"`.
- `affected_legacy_verdict = false`.
- Structural result does not affect legacy verdict or process exit.

## 16 · Combined telemetry acceptance

Precedence: **`tool_error` > `red` > `amber` > `not_evaluable` >
`green`**.

- `display_only = true`.
- `affected_legacy_verdict = false`.
- `affected_process_exit = false`.
- Never inserted into `checks[]`.
- `verdict.md` does not describe overall run as GREEN when telemetry contains RED.

## 17 · Integration success criteria

Phase 3 integration is successful when both runs meet:

- All 7 governance artifacts written per run.
- No `tool_error` unless caused by a documented external failure.
- Capture context fields reflect harness capture-mechanism facts (category A).
- Complete capture is evaluable.
- Incomplete capture is `not_evaluable`.
- QI + structural summaries consistent with their metadata blocks.
- Combined telemetry follows precedence.
- `verdict.md` displays all four sibling sections with required wording.
- Legacy verdict path unchanged.
- Process exit path unchanged (equal to `classify(checks).exit`).
- No baseline changes.
- No automatic or manual retry.
- No report rewrite.
- No unexpected cost escalation.

## 18 · Product failure vs integration failure

**A structural RED / AMBER does NOT automatically fail Phase 3.**

It is a **product-quality signal** — the generated report actually
lacks required structure (Appendix, citations, ranked gaps). The
capture-evaluability fix in `f7710b6` was designed exactly so that
this signal remains visible instead of being masked as `not_evaluable`.

Phase 3 integration **fails** only when:

- Structural result enters `checks[]`.
- Process exit changes due to telemetry.
- Context marks a fully captured report as incomplete (regression of `f7710b6`).
- Context marks a truly truncated capture as complete.
- Artifact missing after validator exit 0 or 1.
- Malformed metadata block.
- Telemetry hidden.
- Baseline mutation.
- Automatic retry.
- Cost cap exceeded.
- Report body rewritten.

Product-quality follow-up (e.g. prompt refinement) is a distinct loop
and requires its own design + DECISION.

## 19 · A/B comparison

Compare A vs B on: `duration_ms` · `report_char_count` ·
`capture_scope` (raw + context) · `fallback_used` · `capture_complete`
· QI verdict · structural verdict · combined verdict · legacy verdict
· process exit · `recognized_citation_line_count` ·
`unique_cited_jd_count` · `covered_gap_count` · `observed_gap_count`
· `appendix.present` · `appendix.row_count` ·
`body_appendix.missing_from_appendix` count ·
`body_appendix.appendix_not_cited` count · structural red / amber /
not_evaluable reasons · structural `tool_error` · measured cost per
run + total.

**Do not treat this as a model-quality benchmark beyond observed
telemetry.** This phase validates integration.

## 20 · Capture review

For each run record:

- `capture_scope` (raw harness selector, e.g. `main section` or `body_fallback`)
- `captureScopeForContext` (normalized to `"main section"` or `"body"`)
- `fallback_used`
- `capture_complete` (harness-derived from category A only)
- `expected_sections_captured`
- `report_capture_error` (string | null)
- `report_char_count`
- `selectedLength`

Confirm that when capture succeeds and reads a complete container,
`capture_complete = true`. Confirm that when capture fails (external
error, empty text, `scope="unset"`), `capture_complete = false` and
structural verdict = `not_evaluable`.

## 21 · Metadata review

Verify per run:

- `metadata.structural_evidence` present with all 13 fields.
- `metadata.combined_telemetry` present with 6 fields.
- Both blocks satisfy `affected_legacy_verdict = false`.
- `metadata.quote_integrity` present and unchanged in shape.
- Pre-existing legacy fields (`run_id`, `fixture_id`, `verdict`,
  `exit_code`, `capture_scope`, etc.) present and unchanged in shape.
- `metadata.artifact_policy.committed` includes the two new structural
  artifacts.

## 22 · verdict.md review

Verify per run:

- Four sibling sections present exactly: `## Legacy regression
  verdict`, `## Quote integrity telemetry`, `## Structural evidence
  telemetry`, `## Combined telemetry`.
- Required wording present verbatim:
  - "Telemetry sections … do NOT affect this verdict."
  - "Quote-integrity telemetry does NOT affect the legacy verdict."
  - "Structural-evidence telemetry does NOT affect the legacy verdict."
  - "A RED telemetry state MUST remain visibly RED even when the legacy verdict is GREEN."
  - "Combined telemetry is display-only."
  - "Combined telemetry does NOT affect the legacy verdict."
  - "Combined telemetry does NOT affect the harness process exit."
  - "Do NOT describe the overall run simply as GREEN when telemetry contains RED."
- No full report body, quote text, resume, or long excerpt copied into `verdict.md`.

## 23 · Error handling

Expected paths:

- Validator exit 0 → verdict in `{green, amber, not_evaluable}` · harness continues.
- Validator exit 1 → RED · harness continues · legacy verdict unchanged · process exit unchanged.
- Validator exit 2 → `tool_error` · no retry · no silent ignore · legacy verdict unchanged · process exit unchanged.
- Timeout (5s) → `tool_error` with reason `validator_timeout`.
- Spawn / artifact / hash / context failures → structured `tool_error` reasons (see design memo run_07 § 14).

External failures (provider outage, browser crash, dev server crash) MUST NOT be treated as integration failure of Phase 2; they are captured facts that inform `pause` or `revise` per § 27.

## 24 · No-retry policy

**Zero retries** — automatic or manual — of A or B during Phase 3.
The harness has no retry path today; if any retry appears, this is a
stop-immediately signal (§ 11 item 7).

## 25 · Retention policy

- Governance artifacts (7 per run) committed under `.agent/regression_runs/<run-id>/`.
- Scratchpad artifacts (`report.md`, `report.png`) stay under `$TMPDIR/acr-regression-runs/<run-id>/` and are NEVER committed.
- No baseline promotion.
- No copy into `.agent/regression_baselines/**`.
- No committing of screenshots, proprietary output, resume content, or full report bodies.
- Governance updates (RUN_REPORT / DECISION / daily summary) summarize counts and verdicts only.

## 26 · Future RUN_REPORT

Phase 3 RUN_REPORT MUST include (see findings JSON
`future_run_report_requirements` for the full 21-item list): human
cost approval reference · exact A/B commands as run · both run IDs ·
total measured cost · duration per run · process exit per run · legacy
verdict per run · QI verdict per run · structural verdict per run ·
combined telemetry per run · capture context per run · 7×2 artifact
existence matrix · metadata + verdict.md consistency checks · 0-line
baseline diff · SHA-256 checker_hash per run · harness git commit SHA
per run · no-report-rewrite confirmation · integration pass/fail per
run and overall · anomalies · recommended next step.

## 27 · Future DECISION outcomes

- **`approve`** — integration behaved correctly on both runs · no
  blocking correctness defect · no legacy/process-exit coupling ·
  measured cost within cap · no forbidden file mutated.
- **`revise`** — integration defect found (metadata inconsistency ·
  capture-context classification error · tool-error handling defect ·
  telemetry masking · unexpected retry · unexpected cost issue).
- **`pause`** — external provider / app failure prevents meaningful
  evaluation · results insufficient but no clear implementation defect.

**A successful Phase 3 DOES NOT authorize Phase 4 / 5 / 6 / blocking
promotion / `AgentOps-5f-promote`.** Every further phase remains
separately gated.

## 28 · No-promotion policy

Explicit restatement (from DECISION run_06 and run_07): a successful
Phase 3 authorizes only controlled evidence for a future DECISION. It
does NOT authorize:

- Baseline migration (Phase 4)
- Structural lint blocking mode (Phase 6)
- QI blocking mode
- Baseline eligibility changes
- Phase 5 stability runs
- `AgentOps-5f-promote`
- Auto-approval of additional paid runs

## 29 · Rollout boundaries

- Phase 3 is bounded to exactly two paid runs (§ 7).
- Phase 3 does not modify code, prompts, R1/R2, checkers, harness, tests, baselines, `.agent/scripts/**`, pipeline, package/lock/workflow/env/vercel.
- Phase 3 does not enable retry, fuzzy matching, edit-distance, LLM judge, or post-generation replacement.
- Phase 3 does not migrate baselines or add structural metadata to them.

## 30 · Policy resolutions

| Q | Answer |
|---|---|
| **Q1** Exactly how many paid runs? | **2** |
| **Q2** Which fixtures? | **A and B** — no C/D/E |
| **Q3** Retry allowed? | **NO** |
| **Q4** Cost estimate? | **~$0.10** |
| **Q5** Hard cost cap? | **$0.15 total** · $0.075 per run |
| **Q6** Stop conditions? | see § 11 (14 items) |
| **Q7** Exact commands? | `node scripts/report-regression-local.mjs --fixture A` then `--fixture B` (with `npm run dev` in separate terminal) |
| **Q8** Integration success? | both runs meet § 17 |
| **Q9** Does structural RED fail Phase 3? | **NO** — it is a valid product-quality signal (§ 18) |
| **Q10** Does QI AMBER fail Phase 3? | **NO** — same reasoning |
| **Q11** Does telemetry affect legacy verdict? | **NO** |
| **Q12** Does telemetry affect process exit? | **NO** |
| **Q13** Are baselines changed? | **NO** (0-line diff) |
| **Q14** Are reports rewritten? | **NO** |
| **Q15** Are run artifacts committed? | **YES for 7 governance artifacts per run · NO for report.md and screenshot** |
| **Q16** Does Phase 3 authorize Phase 4? | **NO** |
| **Q17** Does Phase 3 authorize blocking promotion? | **NO** |
| **Q18** Does Phase 3 authorize `AgentOps-5f-promote`? | **NO** |
| **Q19** What if A fails externally? | do not retry · do not run B · record failure · Phase 3 DECISION = `pause` (external) or `revise` (internal) |
| **Q20** What if cost exceeds cap? | stop · do not continue to B · do not retry · report usage · DECISION = `revise` or `pause` |

## 31 · Risks

1. External Anthropic API outage or 429 inflates wall clock without
   producing telemetry. Mitigation: 240s `HARD_LATENCY_MS` +
   stop-on-external-failure (§ 11 items 1, 10).
2. Dev server not started before harness. Mitigation:
   `assertLocalhost` hard-rejects; harness fails deterministically
   without paid call.
3. Capture context derivation regression could re-emerge if Phase 2
   code is silently touched. Mitigation: re-run deterministic 66/66
   suite immediately before and immediately after Phase 3 execution.
4. Structural RED on a real report might be misread as integration
   failure. Mitigation: § 18 product-vs-integration distinction.
5. Cost accounting granularity varies by provider path. Mitigation:
   `hard_cap_per_run` + `hard_cap_total`.
6. Legacy 25-check count could drift if any script is silently edited.
   Mitigation: Phase 3 RUN_REPORT MUST record the check count from
   `structural_checks.json`.
7. Combined telemetry precedence could be misread by future consumers.
   Mitigation: § 16 explicit table + `display_only: true` metadata
   field.
8. Retention leak risk (`report.md` accidentally committed).
   Mitigation: harness places `report.md` in `$TMPDIR/acr-regression-runs/<run-id>/`
   only; committed artifacts are the 7 sanitized files only.
9. Baseline eligibility could unintentionally shift. Mitigation:
   no-promotion policy + 0-line baseline diff acceptance criterion.
10. Design scope creep. Mitigation: TASK + memo § 4/§ 5 explicitly
    forbid "while we're at it" quality tuning.

## 32 · Open questions

None. All 20 policy resolutions selected in § 30.

## 33 · Recommendations

- Approve this design.
- Do NOT execute Phase 3 in this loop.
- Do NOT push in this loop.
- Human + ChatGPT review this memo + findings JSON + RUN_REPORT.
- Author a separate DECISION for Phase 3 execution with explicit
  cost approval (~$0.10 · $0.15 cap).
- Only after that DECISION + explicit human GO, execute the
  two paid runs.
- Post-run: Phase 3 RUN_REPORT and Phase 3 DECISION using the
  outcomes in § 27.
- Phase 4 (baseline migration), Phase 5 (stability), Phase 6
  (blocking promotion), and `AgentOps-5f-promote` remain further
  separately gated.

## 34 · Boundaries respected

- ✅ no implementation · no code change · no test change
- ✅ no generation · no browser · no dev server · no Playwright launch
- ✅ no LLM / API call · no Anthropic · no OpenAI
- ✅ no baseline mutation · no baseline eligibility change
- ✅ no promotion · no blocking promotion · no `AgentOps-5f-promote`
- ✅ no R1 / R2 change · no new QI tier
- ✅ no retry addition · no report rewrite · no fuzzy / edit-distance / LLM judge / post-generation replacement
- ✅ no threshold change (`HARD_LATENCY_MS = 240_000` · `SOFT_LATENCY_MS = 120_000` unchanged)
- ✅ no CLI flag additions
- ✅ no package / lockfile / workflow / env / vercel change
- ✅ no pipeline change · no `.agent/scripts/**` change
- ✅ no C / D / E · no A-E · no PDFs · no OpenAI
- ✅ no `report.md` / screenshot / long quote / secret committed
- ✅ QI remains telemetry-only · structural lint remains telemetry-only
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human` · Q10 pause · Codex planner spec-only
- ✅ **cost this loop $0**
- ✅ Phase 3 future cost expected **~$0.10** · hard cap **$0.15**
- ✅ Phase 3 execution requires **separate explicit human cost approval**
