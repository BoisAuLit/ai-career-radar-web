# DECISION · AgentOps-5d · Controlled A + B generation with quote-integrity checker attached

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-23 UTC). Standing in for the ChatGPT
> reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-22_run_03_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-22_run_03_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-22_run_03_TASK.md`
- **loop**: `AgentOps-5d`
- **parent_loop**: `AgentOps-5c-integrate` (`2026-07-22_run_02`)
- **impl_commit**: `262591d` (Run controlled AB quote integrity regression)
- **run_report_commit**: `61912ed` (Add RUN_REPORT 2026-07-22_run_03)
- **files_reviewed**:
  - `.agent/tasks/2026-07-22_run_03_TASK.md`
  - `.agent/regression_runs/20260723T035644Z_fixture-A/metadata.json`
  - `.agent/regression_runs/20260723T035644Z_fixture-A/structural_checks.json`
  - `.agent/regression_runs/20260723T035644Z_fixture-A/verdict.md`
  - `.agent/regression_runs/20260723T035644Z_fixture-A/quote_integrity_summary.json`
    (~4.8 KB · v0.3-r2-terminal-punctuation)
  - `.agent/regression_runs/20260723T035828Z_fixture-B/metadata.json`
  - `.agent/regression_runs/20260723T035828Z_fixture-B/structural_checks.json`
  - `.agent/regression_runs/20260723T035828Z_fixture-B/verdict.md`
    (no `quote_integrity_summary.json` · correct per wrapper failure-handling)
  - `.agent/design_memos/2026-07-22_AgentOps-5d_controlled_AB_generation_with_quote_integrity.md`
    (22-section findings memo)
  - `.agent/run_reports/2026-07-22_run_03_RUN_REPORT.md`
    (dogfoods 3f Regression verdict with `regression_required=yes`,
    real A/B verdicts, quote-integrity results separately recorded)
  - `.agent/decisions/2026-07-22_run_02_DECISION.md`
    (5c-integrate approve · telemetry-only locked · read-only)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — DECISION confirms A+B controlled run success and shapes
the AgentOps-5d-stability scope. No push, no deploy pending explicit
human approval per turn.

## Required fixes

**`none`**

## Reasoning summary

AgentOps-5d successfully performed the **first real end-to-end
validation** of the quote-integrity harness-envelope integration.
Fixture A completed successfully with **legacy GREEN, exit 0**,
report capture, `metadata.quote_integrity` block, structural
`quote_integrity` checks, `verdict.md` `## Quote integrity`
section, and `quote_integrity_summary.json` written. Fixture A had
`quote_integrity_verdict = red`, but **telemetry-only behavior was
respected**: quote integrity did not alter the legacy harness exit
code or legacy GREEN verdict. Fixture B produced a **legacy RED**
because generation timed out at the 240 s hard threshold, but this
validated the **wrapper failure-handling path**:
`quote_integrity_verdict` became `blocked_no_report`,
`metadata.quote_integrity` was populated, structural
`quote_integrity` checks were present, `verdict.md` included
`## Quote integrity`, no checker crash occurred, and telemetry-only
behavior was preserved. This means the integration **worked
in-situ on both a successful generated report and a no-report
failure path**.

No baseline mutation, no baseline promotion, no C/D/E, no A-E, no
uploaded PDFs, no OpenAI API, no LLM judge, no edit-distance, no
`src` changes, no `.agent/scripts` changes, no pipeline changes,
and no production deploy happened.

## Approved direction

- **Approve AgentOps-5d.**
- **Accept Fixture A** as successful end-to-end wrapper validation.
- **Accept Fixture B timeout** as a real generation-side or
  threshold stability issue, **not** a quote-integrity wrapper bug.
- **Accept B `blocked_no_report` path** as correctly handled.
- **Accept telemetry-only behavior as confirmed** on real
  generation.
- **Keep quote integrity telemetry-only.**
- **Do NOT promote quote integrity to blocking yet.**
- **Do NOT mutate or promote A/B baselines.**
- **Do NOT retroactively alter A/B run artifacts.**
- **Do NOT loosen R1 or R2.**
- **Do NOT introduce LLM judge or edit-distance matching.**
- **Do NOT ingest uploaded PDFs.**
- **Do NOT introduce OpenAI API.**

## Fixture A summary

- **run_id**: `20260723T035644Z_fixture-A`
- **legacy_verdict**: **GREEN**
- **exit_code**: **0**
- **duration**: approximately **76 seconds** (76 444 ms)
- **report_char_count**: **11 341**
- **capture_scope**: `main section`
- **fallback_used**: **false**
- **quote_integrity_verdict**: **`red`**
- **quote_integrity_schema**: `0.3-r2-terminal-punctuation`
- **required_post_A_checks**: **all 20 passed**
- **quote_integrity_summary_written**: **yes** (~4 800 B)
- **metadata_quote_integrity_block_written**: **yes**
- **structural_checks_quote_integrity_bucket_written**: **yes**
  (5 entries · all `level: "amber"`)
- **verdict_md_quote_integrity_section_written**: **yes** (with
  explicit `telemetry_only` prose)
- **telemetry_only_respected**: **yes** (legacy GREEN despite QI
  red)

## Fixture A quote-integrity findings

- **red**:
  - `Evidence Appendix missing while report contains evidence/citation language`
  - `cited in evidence but missing from appendix: jd_000347, jd_000089, jd_000042, jd_000173`
- **amber**:
  - `terminal-punctuation-only match for jd_000089` (new observation
    on a fresh generation)
  - `terminal-punctuation-only match for jd_000173` (Microsoft ·
    reproduces 5d-R2 finding)
- **interpretation**:
  - **Missing Evidence Appendix table is a real product finding**,
    not a wrapper bug. The model produced 5 inline `Evidence quote:
    "..." — Company, jd_id.` citations but did NOT emit the
    `Evidence Appendix` table at the end of the report.
  - Legacy evidence-appendix check appears **too permissive** if
    inline `Evidence quote:` mentions can satisfy
    `contains_evidence_appendix` without an actual appendix table
    on disk. Worth tightening in a later prompt/format loop.

## Fixture B summary

- **run_id**: `20260723T035828Z_fixture-B`
- **legacy_verdict**: **RED**
- **exit_code**: **1**
- **duration**: approximately **241 seconds** (240 964 ms · exceeded
  240 s hard threshold by ~1 s)
- **root_cause**: **generation timed out at the 240 s hard
  threshold before report completion**
- **report_char_count**: **0**
- **quote_integrity_verdict**: **`blocked_no_report`**
- **quote_integrity_summary_written**: **no** (correctly omitted
  because no report existed · matches 5c-integrate failure-handling
  spec)
- **metadata_quote_integrity_block_written**: **yes**
- **structural_checks_quote_integrity_bucket_written**: **yes**
  (5 entries · 2 pass=false as expected · all `level: "amber"`)
- **verdict_md_quote_integrity_section_written**: **yes** (with
  `BLOCKED_NO_REPORT` and explicit `telemetry_only` prose)
- **telemetry_only_respected**: **yes** (legacy RED driven entirely
  by legacy structural + operational reds · not by
  quote-integrity)
- **interpretation**:
  - B failure was **generation timeout / stability issue**.
  - **Wrapper failure handling behaved correctly** (no crash · no
    thrown error · legacy flow proceeded normally).
  - **Need one more stability loop** to determine whether B timeout
    is a flake or reproducible.

## Telemetry-only confirmation

- **Fixture A** legacy **GREEN** remained **GREEN** despite
  `quote_integrity_verdict = red`.
- **Fixture B** legacy **RED** was driven by legacy operational /
  structural failure, **not** by quote-integrity escalation.
- `quote_integrity` **RED** and **`blocked_no_report`** were
  recorded and surfaced but **did NOT change harness exit
  semantics**.
- **Promotion to blocking still requires a separate DECISION.**

## Preflight accident

Documented in findings memo §14 and reproduced here:

Running `node scripts/report-regression-local.mjs --help`
accidentally defaulted to Fixture A because `--help` is not
recognized. It ran against a down dev server, created an untracked
`blocked_no_report` run directory
(`.agent/regression_runs/20260723T035439Z_fixture-A/`), and that
directory was **immediately `rm -rf`'d before commit**. This is
**not a blocker for AgentOps-5d** but **should be considered for a
later cosmetic / safety loop** (make `--help` short-circuit safely
instead of executing a default fixture).

Cost of the accidental run: **$0** (no report generated → no
Anthropic API call).

## What worked

- `runQuoteIntegrity` wrapper worked in-situ on the first real
  generation.
- Fixture A wrote `quote_integrity_summary.json`.
- Fixture A `metadata.quote_integrity` block was written.
- Fixture A `structural_checks.json` `quote_integrity` bucket was
  written.
- Fixture A `verdict.md` `## Quote integrity` section was written.
- Fixture B `blocked_no_report` path worked correctly.
- Telemetry-only behavior was preserved on both runs.
- R2 tier fired on a fresh generation (2 matches on A ·
  `jd_000089` new · `jd_000173` reproduces 5d-R2).
- Real product issue surfaced: missing Evidence Appendix table on
  Fixture A.
- `report.md` and screenshots stayed scratchpad-only.
- No full report body or long quote excerpts were committed.

## What remains brittle

- Fixture B generation **timed out near the hard 240 s threshold**.
- Need to determine whether B timeout is **flake or reproducible**.
- Fixture A missing Evidence Appendix table suggests **report
  prompt or appendix validator needs later attention**.
- `verdict.md` `## Artifacts` line may list
  `quote_integrity_summary.json` even when B did not write it
  (cosmetic honesty issue).
- `--help` flag is **unsafe** because it triggers default fixture
  behavior (accidental generation attempt).
- Role/title check is still a title-presence placeholder.
- Only `Evidence quote:` pattern is gated.
- Corpus `|` → `\n` heuristic remains fragile.
- Quote integrity remains **telemetry-only**, not blocking.

## Recommended next loop

**AgentOps-5d-stability**:

- Run one more controlled **Fixture A** and **Fixture B**
  generation with quote-integrity checker attached.
- **Run A first.**
- If A fails due to wrapper or harness integration → **stop and do
  NOT run B**.
- If A completes with quote-integrity artifacts → **run B**.
- **Primary question**: was Fixture B timeout a **one-off flake or
  reproducible**?
- **Secondary question**: does Fixture A **repeatedly omit the
  Evidence Appendix table**?
- Expected cost approximately **~$0.10** if both A and B run.
- **No baseline mutation.**
- **No baseline promotion.**
- **No C/D/E.**
- **No A-E full suite.**
- **No uploaded PDFs.**
- **No LLM judge.**
- **No edit-distance.**
- **No OpenAI API.**
- **Keep quote integrity telemetry-only.**

## Possible later loops

- **AgentOps-5d-cosmetic**:
  - Fix `--help` so it does not default to running Fixture A
    (short-circuit safely).
  - Fix `verdict.md` artifact list honesty for `blocked_no_report`
    cases (only list actually-written files).
- **Prompt / format loop**:
  - Tighten generation prompt so `Evidence Appendix` table is always
    emitted when `Evidence quote:` citations are used.
  - Tighten legacy `contains_evidence_appendix` check so inline
    `Evidence quote:` mentions do not count as actual appendix
    table.
- **AgentOps-5f-promote**:
  - Only **after stability and product-format fixes**.
  - Separate design memo + DECISION required.
  - Decide whether quote integrity becomes blocking (start narrow ·
    one structural check at `level: "red"` first).

## Risks found · 13

1. Fixture B timed out on first controlled run.
2. Need stability run to determine B flake vs reproducible issue.
3. Fixture A quote_integrity RED indicates missing Evidence
   Appendix table.
4. Legacy appendix check may be too permissive.
5. Quote integrity is still telemetry-only.
6. Quote integrity is not yet ready for blocking promotion.
7. R1 grammar bridging remains a real concern.
8. `--help` behavior is unsafe and should be fixed later.
9. `verdict.md` artifact line has cosmetic honesty issue for
   `blocked_no_report`.
10. A/B baselines remain `quote_integrity_not_evaluated`
    conceptually.
11. No C/D/E real run yet.
12. Uploaded 20 PDFs remain out of scope.
13. BLK-0001 / BLK-0002 / BLK-0003 remain `open` and unaffected.

## Non-blocking followups

- **Push AgentOps-5d after human approval.**
- **Update daily summary after push.**
- **Next recommended loop**: **AgentOps-5d-stability**.
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
AgentOps-5d-stability. Do NOT run harness generation. Do NOT run
Playwright. Do NOT run report generation. Do NOT call
Anthropic/OpenAI. Do NOT run C/D/E. Do NOT run A-E full suite. Do
NOT ingest uploaded PDFs. Do NOT modify baselines. Do NOT modify
fixtures. Do NOT modify pipeline. Do NOT modify `.agent/scripts/**`.
Do NOT modify `src/**`. Do NOT promote quote integrity to blocking.
Do NOT implement Codex planner. Do NOT create
`.agent/planner_reports/`. Do NOT run collector. Do NOT refresh
corpus. Do NOT modify GitHub Actions. Do NOT resolve
BLK-0001 / BLK-0002 / BLK-0003. Do NOT start G2.1d. Recommended
next task after push/cleanup is **AgentOps-5d-stability** (one more
Fixture A + one more Fixture B controlled run with checker
attached · Fixture A first · stop if A fails · then B · ~$0.10 · no
baseline mutation · telemetry-only preserved · determine whether B
timeout is flake or reproducible).

## Boundary confirmations · 21 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No baseline mutation | ✅ (A + B `current` untouched) |
| No baseline promotion | ✅ (new runs sit as normal run entries, not baseline sources) |
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
| **Quote integrity remains telemetry-only** | ✅ (confirmed on A + B real runs) |
| **No blocking promotion** | ✅ (still requires a separate DECISION) |
| No prior `.agent/regression_runs/**` mutation | ✅ (only 2 new run dirs added by 5d) |
| All prior `.agent/quote_integrity_runs/**` frozen | ✅ (5c + 5d-R2 + 5c-integrate untouched) |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Cost for this DECISION loop | ✅ **$0** |

## Stop condition

DECISION written. **Awaiting explicit human approval to push.** No
follow-up action is authorized until Bohao says "push AgentOps-5d".
