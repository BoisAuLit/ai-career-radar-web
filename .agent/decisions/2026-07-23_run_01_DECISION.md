# DECISION · AgentOps-5d-stability · Repeat controlled A + B generation with quote-integrity checker attached

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-23 UTC). Standing in for the
> ChatGPT reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-23_run_01_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-23_run_01_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-23_run_01_TASK.md`
- **loop**: `AgentOps-5d-stability`
- **parent_loop**: `AgentOps-5d` (`2026-07-22_run_03`)
- **impl_commit**: `6c21988` (Run quote integrity stability regression)
- **run_report_commit**: `32fd6b2` (Add RUN_REPORT 2026-07-23_run_01)
- **files_reviewed**:
  - `.agent/tasks/2026-07-23_run_01_TASK.md`
  - `.agent/regression_runs/20260723T042627Z_fixture-A/metadata.json`
  - `.agent/regression_runs/20260723T042627Z_fixture-A/structural_checks.json`
  - `.agent/regression_runs/20260723T042627Z_fixture-A/verdict.md`
  - `.agent/regression_runs/20260723T042627Z_fixture-A/quote_integrity_summary.json`
    (~5 KB · v0.3-r2-terminal-punctuation)
  - `.agent/regression_runs/20260723T042759Z_fixture-B/metadata.json`
  - `.agent/regression_runs/20260723T042759Z_fixture-B/structural_checks.json`
  - `.agent/regression_runs/20260723T042759Z_fixture-B/verdict.md`
    (no `quote_integrity_summary.json` · correct per wrapper failure-handling)
  - `.agent/design_memos/2026-07-23_AgentOps-5d-stability_AB_quote_integrity.md`
    (24-section findings memo)
  - `.agent/run_reports/2026-07-23_run_01_RUN_REPORT.md`
    (dogfoods 3f Regression verdict with `regression_required=yes`,
    real A/B verdicts, quote-integrity results separately recorded)
  - `.agent/decisions/2026-07-22_run_03_DECISION.md`
    (5d approve · read-only)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — DECISION confirms stability findings and shapes the
AgentOps-5d-fixture-b-timeout scope. No push, no deploy pending
explicit human approval per turn.

## Required fixes

**`none`**

## Reasoning summary

AgentOps-5d-stability successfully performed a **second controlled
A + B generation** with quote-integrity checker attached. The loop
answered the two intended stability questions. **Fixture A**
completed successfully again with legacy **GREEN** and
`quote_integrity` **AMBER**. The prior Fixture A missing Evidence
Appendix table **did not reproduce**: this run emitted **five
appendix entries**, produced **zero quote-integrity RED reasons**,
and improved from `quote_integrity` RED to AMBER. **Fixture B**
timed out again at approximately the same 240 s hard threshold,
with almost identical timing to the prior 5d B timeout. That makes
B timeout **reproduced across two consecutive controlled attempts**,
and therefore **likely deterministic or environment-sensitive**
rather than a one-off flake. The wrapper worked in-situ again,
telemetry-only behavior was preserved, no baseline mutation or
promotion happened, no C/D/E or A-E full suite ran, no uploaded PDFs
were touched, no OpenAI API was introduced, no LLM judge or
edit-distance was used, no `src` or pipeline files changed, and
prior artifacts remained frozen.

## Approved direction

- **Approve AgentOps-5d-stability.**
- **Accept Fixture A stability result** as improved and cleaner than
  prior 5d A.
- **Accept that Fixture A missing Evidence Appendix was not
  reproduced** in this run.
- **Treat Fixture A appendix omission as intermittent**, not yet
  proven systematic.
- **Accept Fixture B timeout as reproduced** across two consecutive
  controlled attempts.
- **Treat Fixture B timeout as a separate fixture / generation /
  timeout stability issue**, not a quote-integrity wrapper bug.
- **Accept wrapper in-situ behavior as confirmed** for another A
  success path and another B no-report failure path.
- **Keep quote integrity telemetry-only.**
- **Do NOT promote quote integrity to blocking.**
- **Do NOT mutate or promote A/B baselines.**
- **Do NOT retroactively alter 5d or 5d-stability run artifacts.**
- **Do NOT loosen R1 or R2.**
- **Do NOT introduce LLM judge or edit-distance matching.**
- **Do NOT ingest uploaded PDFs.**
- **Do NOT introduce OpenAI API.**

## Fixture A stability summary

- **run_id**: `20260723T042627Z_fixture-A`
- **legacy_verdict**: **GREEN**
- **exit_code**: **0**
- **duration**: approximately **66.8 seconds** (66 771 ms · faster
  than 5d's 76 s)
- **report_char_count**: **10 089**
- **quote_integrity_verdict**: **`amber`** (⬆️ improved from 5d's
  `red`)
- **evidence_entries**: **5** (⬆️ was **0** in 5d)
- **evidence_quotes_with_citation**: 5
- **verbatim_matches**: 3
- **terminal_punctuation_only_matches**: **2** (same jd_ids as 5d:
  `jd_000089` + `jd_000173`)
- **fabricated_or_unmatched_quotes**: 0
- **appendix_entries_not_cited**: **1** (Scale AI `jd_000310` ·
  same pattern as 5c / 5d-R2 dry-runs)
- **red_reasons**: **none** (was 2 in 5d)
- **amber_reasons**:
  - `terminal-punctuation-only match for jd_000089`
  - `terminal-punctuation-only match for jd_000173`
  - `in appendix but not cited by any Evidence quote: jd_000310`
- **interpretation**:
  - **Evidence Appendix table was present.**
  - **Prior A missing appendix did not reproduce.**
  - **A improved from quote_integrity RED to AMBER.**
  - **R2 behavior remained consistent** (same 2 jd_ids as 5d A).

## Fixture B stability summary

- **run_id**: `20260723T042759Z_fixture-B`
- **legacy_verdict**: **RED**
- **exit_code**: **1**
- **duration**: approximately **240 992 ms** (241 s · over 240 s
  hard by ~1 s · +28 ms vs 5d's 240 964 ms)
- **report_char_count**: **0**
- **quote_integrity_verdict**: **`blocked_no_report`**
- **quote_integrity_summary_written**: **no**, correctly omitted
  because no report existed
- **metadata_quote_integrity_block_written**: **yes**
- **structural_checks_quote_integrity_bucket_written**: **yes** (5
  entries · `level: "amber"`)
- **verdict_md_quote_integrity_section_written**: **yes** (with
  `BLOCKED_NO_REPORT` and explicit telemetry_only prose)
- **interpretation**:
  - **B timeout reproduced.**
  - **Prior 5d B timeout was approximately 240 964 ms.**
  - **Stability B timeout was approximately 240 992 ms.**
  - **Delta was about +28 ms** · essentially identical failure mode.
  - **Do NOT run a third B attempt in this loop.**
  - **Do NOT mutate timeout threshold** without root-cause
    investigation.

## Stability answers

1. **Was Fixture B timeout a flake?**
   **No.** It reproduced across 2 consecutive controlled attempts
   at almost identical timing (delta ~28 ms).
2. **Did Fixture A repeatedly omit Evidence Appendix table?**
   **No.** The appendix omission **did not reproduce** in this run.
   It appears **intermittent**, 1/2 controlled runs so far.

## Telemetry-only confirmation

- **Fixture A** legacy **GREEN** remained **GREEN** despite
  `quote_integrity` **AMBER**.
- **Fixture B** legacy **RED** was driven by legacy timeout /
  no-report behavior.
- `quote_integrity` **AMBER** and **`blocked_no_report`** were
  recorded and surfaced but **did NOT alter harness exit
  semantics**.
- **Promotion to blocking still requires a separate DECISION.**

## What worked

- **Wrapper worked in-situ again** (second controlled proof).
- **All 16 post-A checks passed.**
- **All 10 post-B checks passed.**
- **`--help` was correctly avoided** (5d unsafe behavior not
  repeated).
- **R2 fired consistently** on the same two jd_ids (`jd_000089` +
  `jd_000173`) across controlled A runs — R2 is deterministic +
  reproducible on real generations.
- **Appendix cross-check** again flagged Scale AI `jd_000310` as
  appendix-not-cited.
- **Telemetry-only behavior was preserved.**
- **Legacy exit-code semantics remained unchanged.**
- **No baseline mutation.**
- **No baseline promotion.**
- **`report.md` and screenshots stayed scratchpad-only.**
- **A stability was cleaner than prior 5d A** (verdict RED → AMBER ·
  missing-appendix flake resolved).
- **B timeout was reproduced clearly enough** to justify a targeted
  timeout loop.

## What remains brittle

- **Fixture B timeout is reproducible** and needs targeted
  investigation.
- **Need to identify what changed** between the 2026-07-19 Fixture
  B baseline source run, which completed around **67 seconds**, and
  the 2026-07-23 controlled runs, which timeout around **241
  seconds**.
- Fixture A Evidence Appendix omission is **intermittent** and may
  need another data point later.
- `verdict.md` `## Artifacts` line still has cosmetic honesty issue
  for `blocked_no_report` cases.
- `--help` unsafe behavior remains unfixed.
- Role/title check remains weak.
- Only `Evidence quote:` pattern is gated.
- Corpus `|` → `\n` normalization remains heuristic.
- Quote integrity remains **telemetry-only**.

## Recommended next loop

**AgentOps-5d-fixture-b-timeout.**

### Scope

- **Targeted investigation of Fixture B timeout root cause.**
- **Start with inspection and comparison only.**
- **Do NOT mutate 240 s threshold in the first pass.**
- **Compare** successful Fixture B baseline source run from
  `20260719T054151Z_fixture-B` against failed 5d B and 5d-stability
  B runs.
- **Inspect** metadata, durations, `report_char_count`, step timing
  if available, console / errors summaries, prompt / input shape,
  fixture B resume / target role size, and any harness changes
  between the baseline-success commit and current commit.
- **Determine** whether the failure is due to:
  - prompt / input length
  - Playwright / Next dev-server overhead
  - model latency tail
  - harness waiting for `done` state too strictly
  - app generation state bug
  - quote-integrity integration side-effect
  - timeout threshold too tight
- **Produce findings and recommend a fix path.**
- **$0 inspection first.**
- **Optional controlled rerun** only if the TASK explicitly allows
  it after inspection.
- **No baseline mutation.**
- **No baseline promotion.**
- **No C/D/E.**
- **No A-E full suite.**
- **No uploaded PDFs.**
- **No OpenAI API.**
- **No LLM judge.**
- **No edit-distance.**
- **Keep quote integrity telemetry-only.**

## Possible later loops

- **AgentOps-5d-cosmetic**:
  - Fix `--help` so it does not default to running Fixture A.
  - Fix `verdict.md` artifact list honesty for `blocked_no_report`
    cases.
- **Prompt / format loop**:
  - Tighten generation prompt so `Evidence Appendix` table is
    consistently emitted.
  - Tighten legacy `contains_evidence_appendix` check so inline
    `Evidence quote:` text does not count as actual appendix table.
- **AgentOps-5f-promote**:
  - Only after B timeout is resolved and product-format fixes are
    stable.
  - Separate design memo + DECISION required.
  - Decide whether quote integrity becomes blocking.

## Risks found · 12

1. Fixture B timeout reproduced 2/2.
2. B timeout needs targeted root-cause investigation.
3. Fixture A appendix omission was not reproduced but remains
   intermittent.
4. Quote integrity is still telemetry-only.
5. Quote integrity is not ready for blocking promotion.
6. R1 grammar bridging remains a real concern.
7. `--help` behavior is unsafe and should be fixed later.
8. `verdict.md` artifact line has cosmetic honesty issue for
   `blocked_no_report`.
9. A/B baselines remain `quote_integrity_not_evaluated`
   conceptually.
10. No C/D/E real run yet.
11. Uploaded 20 PDFs remain out of scope.
12. BLK-0001 / BLK-0002 / BLK-0003 remain `open` and unaffected.

## Non-blocking followups

- **Push AgentOps-5d-stability after human approval.**
- **Update daily summary after push.**
- **Next recommended loop**: **AgentOps-5d-fixture-b-timeout**.
- **Keep quote integrity telemetry-only.**
- Do not mutate or promote baselines.
- Do not promote quote integrity to blocking yet.
- Do not run C/D/E yet.
- Do not run A-E full suite.
- Do not ingest uploaded PDFs.
- Do not introduce OpenAI API.
- Do not modify `.agent/scripts/**`.
- Do not modify `src/**`.
- Do not modify pipeline.

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT start
AgentOps-5d-fixture-b-timeout. Do NOT run harness generation. Do
NOT run Playwright. Do NOT run report generation. Do NOT call
Anthropic/OpenAI. Do NOT run C/D/E. Do NOT run A-E full suite. Do
NOT ingest uploaded PDFs. Do NOT modify baselines. Do NOT modify
fixtures. Do NOT modify pipeline. Do NOT modify `.agent/scripts/**`.
Do NOT modify `src/**`. Do NOT mutate the harness hard threshold.
Do NOT promote quote integrity to blocking. Do NOT implement Codex
planner. Do NOT create `.agent/planner_reports/`. Do NOT run
collector. Do NOT refresh corpus. Do NOT modify GitHub Actions. Do
NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start G2.1d.
Recommended next task after push/cleanup is
**AgentOps-5d-fixture-b-timeout** (targeted B stability
investigation · inspection-first · $0 · compare 2026-07-19 baseline
success vs 2026-07-23 controlled timeouts · determine root cause ·
optional controlled rerun only if TASK explicitly allows · no
baseline mutation · telemetry-only preserved).

## Boundary confirmations · 21 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No baseline mutation | ✅ (A + B `current` untouched) |
| No baseline promotion | ✅ (new runs sit as normal run entries) |
| No C/D/E | ✅ |
| No A-E full suite | ✅ |
| No uploaded PDFs | ✅ |
| No OpenAI API | ✅ (BLK-0003 unchanged) |
| No LLM judge | ✅ |
| No edit-distance | ✅ |
| No `.agent/scripts/**` changes | ✅ (hard rule per AgentOps-2c Q3-Q8) |
| No `src/**` changes | ✅ |
| No pipeline changes | ✅ (`b019786` 起终一致) |
| No production target | ✅ |
| **Quote integrity remains telemetry-only** | ✅ (confirmed on A + B second-time real runs) |
| **No blocking promotion** | ✅ (still requires a separate DECISION) |
| No prior `.agent/regression_runs/**` mutation | ✅ (only 2 new run dirs added by 5d-stability) |
| All prior `.agent/quote_integrity_runs/**` frozen | ✅ (5c + 5d-R2 + 5c-integrate untouched) |
| No `scripts/report-regression-local.mjs` change this loop | ✅ (unchanged since 5c-integrate) |
| No `scripts/quote-integrity-check.mjs` change this loop | ✅ (unchanged since 5d-R2) |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Cost for this DECISION loop | ✅ **$0** |

## Stop condition

DECISION written. **Awaiting explicit human approval to push.** No
follow-up action is authorized until Bohao says
"push AgentOps-5d-stability".
