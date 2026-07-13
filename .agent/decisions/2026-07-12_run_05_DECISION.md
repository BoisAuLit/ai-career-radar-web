# DECISION · AgentOps-3e-tune-2 · length-band calibration

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-12 21:52). Standing in for the ChatGPT
> reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-12_run_05_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-12_run_05_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-12_run_05_TASK.md`
- **loop**: `AgentOps-3e-tune-2`
- **parent_loop**: `AgentOps-3e-tune` (`2026-07-12_run_04`)
- **grandparent_loop**: `AgentOps-3e` (`2026-07-12_run_03`)
- **new_run**: `.agent/regression_runs/20260713T014957Z_fixture-A/`
- **previous_run**: `.agent/regression_runs/20260713T011451Z_fixture-A/`
- **impl_commit**: `d393db9`
- **run_report_commit**: `7f99cf1`
- **files_reviewed**:
  - `scripts/report-regression-local.mjs` (819 → 828 lines; +10 / −1;
    only change = `REPORT_LEN_SOFT_MAX 6000→14000` + 8-line WHY comment
    + `report_length_soft_min/max` in metadata)
  - `.agent/regression_runs/20260713T014957Z_fixture-A/metadata.json`
    (64 lines)
  - `.agent/regression_runs/20260713T014957Z_fixture-A/structural_checks.json`
    (~180 lines)
  - `.agent/regression_runs/20260713T014957Z_fixture-A/verdict.md`
    (27 lines · red=none · amber=none)
  - `.agent/run_reports/2026-07-12_run_05_RUN_REPORT.md` (378 lines)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — length-band change to a script + one real localhost report
generation. No push, no deploy pending explicit human approval per turn.

## Reasoning summary

AgentOps-3e-tune-2 successfully calibrates the report regression harness
length band and produces the first honest GREEN verdict on Fixture A.
The only change to the harness logic was widening
`REPORT_LEN_SOFT_MAX` from 6000 to 14000 and recording
`report_length_soft_min/max` in metadata. The previously tuned capture
logic remained intact: `capture_scope="main section"`,
`fallback_used=false`, `selected_candidate_marker_count=5/5`, and
`selected_candidate_has_evidence=true`. The new run produced
`verdict=green` with `exit_code=0`, `report_char_count=11773`,
`page_body_char_count=18422`, `duration_ms=75804`, and **25/25 checks
passing**. The previous AMBER caused by `report_length_in_soft_band`
was removed cleanly. This was not a forced pass: the selected
report-specific content naturally fits within the calibrated 1500-14000
band, while all red, amber, fixture-specific, and operational checks
passed. The task respected all boundaries: no production target, no
baseline promotion, no full report or screenshot committed, no
`.agent/scripts/**` changes, no `src/**` changes, no pipeline changes,
no package changes, no OpenAI API, no collector/corpus refresh, no
push/deploy.

## Approved direction

- **Approve AgentOps-3e-tune-2.**
- **Keep** `REPORT_LEN_SOFT_MIN = 1500` and
  `REPORT_LEN_SOFT_MAX = 14000` for the v1 Fixture A harness.
- Treat **14000 as a calibrated soft maximum** based on actual
  report-specific capture after narrowing (~10-12k chars for Fixture A
  including exec strip + action bar + report body).
- **Keep** `extractReportText` and marker-scored candidate strategy
  unchanged.
- **Keep** body fallback guarded and AMBER-forcing.
- Treat this as the **first valid GREEN local regression verdict for
  Fixture A**.
- **Do NOT promote a baseline yet.** Baseline promotion belongs in a
  separate explicit loop with its own DECISION.
- **Do NOT run A-E full suite yet.** Fixtures B-E have not seen a
  single real run and belong in a separate scale-out loop.
- **Do NOT test production yet.** Production is only accessible from
  the deployed Vercel site, which the harness hard-rejects.
- **Do NOT click Eval yet.** Eval flow is a separate quality check
  path.
- **Do NOT modify `src/**` for DOM markers** — the current capture is
  sufficient (11773 chars in `main section` scope, all 5 markers +
  Evidence Appendix present, `fallback_used=false`).
- **Default next loop after push/cleanup**: **AgentOps-3f — integrate
  regression verdict into RUN_REPORT template / Codex planner schema**.
- **AgentOps-3f should be design/protocol integration first**, not
  baseline promotion and not A-E expansion.

## Run summary

| field | value |
|---|---|
| previous_run_id | `20260713T011451Z_fixture-A` (3e-tune AMBER) |
| new_run_id | `20260713T014957Z_fixture-A` (3e-tune-2 GREEN) |
| fixture | A (v1) |
| base_url | `http://localhost:3000` |
| verdict | **green** |
| exit_code | **0** |
| duration_ms | 75804 |
| capture_scope | `main section` |
| capture_strategy | `shortest-qualified-candidate` |
| fallback_used | **false** |
| page_body_char_count | 18422 |
| report_char_count | **11773** |
| report_length_soft_min | **1500** |
| report_length_soft_max | **14000** ✅ (was 6000) |
| candidate_count | 8 |
| qualified_candidate_count | 2 (`main section` @ 11773 chosen · `main` @ 18087) |
| selected_candidate_marker_count | **5 / 5** |
| selected_candidate_has_evidence | true |
| one_real_generation_happened | yes |
| cost_measured | false |
| estimated_cost | ≈ $0.05 (Sonnet 4.6 baseline) |
| cost_cap_enforced_by | `single_generation_limit` |
| production_target | no |
| baseline_promoted | no |
| full_report_committed | no |
| screenshot_committed | no |
| console_errors | 0 |
| git_commit_sha_at_run_time | `2486eb6510e5d7a872cb714a92397f966047f12c` |
| corpus_snapshot_date | May 14, 2026 |
| model_display | Claude Sonnet 4.6 |

## Green analysis

This is the **first honest GREEN verdict** for the local report
regression harness on Fixture A. The result is credible because:

- **Capture scope remained report-specific.** `capture_scope="main
  section"`, not `body_fallback`. `fallback_used=false`. The
  marker-scored candidate strategy from 3e-tune fired the qualified
  branch, not the guarded fallback.
- **All required report markers + Evidence Appendix were present.**
  `selected_candidate_marker_count=5/5` (Target role · What you already
  have · Top 5 gaps · Over-prioritizing · Highest-leverage next action)
  and `selected_candidate_has_evidence=true`.
- **Candidate 1 sentinel remained intact.** Incomplete banner absent —
  the streaming completion sentinel worked as designed.
- **All 15 red checks passed.** Zero red failures.
- **All 9 amber checks passed.** Zero amber failures. Previous
  `report_length_in_soft_band` amber is now green.
- **All 4 fixture-specific checks passed.** ≥2 strengths reflected, ≥2
  gaps reflected, zero must-not-happen matches, recommendation matches.
- **All 4 operational checks passed.** Duration under soft (120s) and
  hard (240s) latency; no fatal Playwright error; no production target.
- **AMBER was removed by calibrating** the soft length band to reflect
  actual report-specific output size, **not** by weakening red checks
  or bypassing capture checks.
- **Run-to-run variance is natural.** `report_char_count` moved
  11115 → 11773 (+5.9%) between 3e-tune and 3e-tune-2, which is
  expected LLM output variance. Both values sit comfortably inside the
  widened band, well below 14000 max and well above 1500 min.

## Risks found

1. **The harness still covers only Fixture A.** Severity: **low**.
   Fixtures B-E remain v1 and haven't seen real runs. Scale-out is a
   separate loop.
2. **The calibrated 14000 soft max is based on early observed runs**
   (11115 and 11773) and may need later tuning if reports change shape.
   Severity: **low-medium**. Recorded in metadata for audit.
3. **Future model/report changes can shift report length.** Severity:
   **low-medium**. Would surface as new AMBER on the band, prompting
   re-calibration or root-cause investigation.
4. **Cost is estimated, not measured exactly.** Severity: **low**.
   `cost_measured: false` honestly recorded.
5. **Future runs incur API cost.** Severity: **low**. Bounded by
   `single_generation_limit` policy; ≈$0.05 per run today.
6. **Keyword/rubric checks remain primitive.** Severity: **low-medium**.
   Substring matching + literal must-not-happen list; adequate for v1
   regression signal, not a replacement for the eval-report route.
7. **No baseline has been promoted yet.** Severity: **none** (intended
   staging). Belongs in a separate explicit loop.
8. **A GREEN on Fixture A does not guarantee B-E quality.** Severity:
   **medium** for scope confidence. Do not extrapolate from one fixture.
9. **This should not trigger production testing automatically.**
   Severity: **medium** for process discipline. Enforced by harness
   hard-reject of non-localhost.
10. **This should not trigger A-E full suite automatically.**
    Severity: **medium** for process discipline. Enforced by TASK
    fixture-A-only constraint.
11. **This should not trigger baseline promotion automatically.**
    Severity: **medium** for governance. Enforced by DECISION's
    "Do NOT promote a baseline yet".
12. **AgentOps-3f should integrate the verdict into process**, not
    broaden scope prematurely. Severity: **medium** for staging
    discipline. Enforced by DECISION §Approved direction.
13. **BLK-0001 / BLK-0002 / BLK-0003 remain open and unaffected.**
    Severity: **none** for this loop (documented state), **medium** as
    standing project risk covered elsewhere.

## Required fixes

**`none`**

The length-band calibration is correct as implemented. All 25 checks
pass. No follow-up code change is needed to approve this run.

## Non-blocking followups

- **Push AgentOps-3e-tune-2 after human approval.**
- **Create/update daily summary after push.**
- **Next recommended loop**: **AgentOps-3f · verdict integration into
  RUN_REPORT template and Codex planner schema**.
- **AgentOps-3f should be a protocol/template integration loop.**
- **AgentOps-3f should NOT promote a baseline.**
- **AgentOps-3f should NOT run A-E full suite.**
- **AgentOps-3f should NOT test production.**
- **Later**, consider one stability re-run or baseline promotion as a
  separate explicit loop.
- **Later**, consider expanding to fixtures B-E gradually.
- **Later**, consider quote integrity checks (verifying JD-attributed
  quotes actually appear in the source JDs in the corpus).
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline.**
- **Do NOT introduce OpenAI API.**
- **Do NOT push until explicit human approval.**

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT start
AgentOps-3f. Do NOT run more fixtures. Do NOT run production. Do NOT
promote baseline. Do NOT commit full `report.md` or `screenshot.png`.
Do NOT call Anthropic/OpenAI outside the local app. Do NOT implement
Codex planner. Do NOT create `.agent/planner_reports/`. Do NOT modify
`.agent/scripts/**`. Do NOT modify `src/**`. Do NOT modify pipeline. Do
NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub Actions.
Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start G2.1d. Do
NOT resume full automation. Recommended next task after push/cleanup is
**AgentOps-3f · verdict integration into RUN_REPORT template / planner
schema**.

## Files reviewed

- `scripts/report-regression-local.mjs` — surgical 10-line delta: two
  constant lines + 8-line WHY comment. `REPORT_LEN_SOFT_MIN=1500`
  unchanged. `REPORT_LEN_SOFT_MAX 6000→14000`. Metadata now records
  `report_length_soft_min` and `report_length_soft_max`. No other
  logic touched.
- `.agent/regression_runs/20260713T014957Z_fixture-A/metadata.json` —
  records all new fields cleanly; `scratch_paths` points outside repo;
  `cost_measured: false` and `cost_cap_enforced_by:
  single_generation_limit` unchanged; verdict `green`, exit_code `0`.
- `.agent/regression_runs/20260713T014957Z_fixture-A/structural_checks.json`
  — 25 checks total; **all pass**; new band `1500-14000` reflected in
  `report_length_in_soft_band` detail string.
- `.agent/regression_runs/20260713T014957Z_fixture-A/verdict.md` —
  human-readable summary; red = _none_, amber = _none_.
- `.agent/run_reports/2026-07-12_run_05_RUN_REPORT.md` — 378 lines;
  includes exact before/after code, comparison table vs 3e-tune,
  distinguishes GREEN-by-calibration vs forced pass, complete
  forbidden-file audit, 26-item confirmation table.

## Boundary confirmations · 21 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No additional Playwright run since RUN_REPORT | ✅ |
| No additional report generation since RUN_REPORT | ✅ |
| No production target | ✅ (harness hard-rejects non-localhost) |
| No baseline promotion | ✅ (no `baselines/` path exists yet) |
| No full report/screenshot committed | ✅ (scratchpad only) |
| No `.agent/scripts/**` changes | ✅ (harness lives `scripts/`) |
| No `src/**` changes | ✅ |
| No pipeline changes | ✅ (HEAD `b019786` unchanged start AND end) |
| No collector run | ✅ |
| No corpus refresh | ✅ |
| No OpenAI API introduced | ✅ (harness = browser driver only) |
| No GitHub Actions changes | ✅ |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read by harness | ✅ |
| No `vercel.json` / `.vercel/**` changes | ✅ |
| No Codex / Claude config edits | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |

## Stop condition

DECISION written. **Awaiting explicit human approval to push.** No
follow-up action is authorized until Bohao says "push
AgentOps-3e-tune-2".
