# DECISION · AgentOps-3g-stability · Fixture A stability re-run

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-13 03:00). Standing in for the
> ChatGPT reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-12_run_08_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-12_run_08_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-12_run_08_TASK.md`
- **loop**: `AgentOps-3g-stability`
- **parent_loop**: `AgentOps-3g` (`2026-07-12_run_07`)
- **grandparent_loop**: `AgentOps-3e-tune-2` (`2026-07-12_run_05`)
- **impl_commit**: `1f8e97b`
- **run_report_commit**: `786bc20`
- **files_reviewed**:
  - `.agent/regression_runs/20260714T025246Z_fixture-A/metadata.json`
    (64 lines · `verdict=green` · `exit_code=0` ·
    `capture_scope="main section"` · `fallback_used=false`)
  - `.agent/regression_runs/20260714T025246Z_fixture-A/structural_checks.json`
    (~180 lines · 25/25 pass)
  - `.agent/regression_runs/20260714T025246Z_fixture-A/verdict.md`
    (27 lines · red=none · amber=none)
  - `.agent/run_reports/2026-07-12_run_08_RUN_REPORT.md` (439 lines ·
    3f Regression verdict section · full stability comparison table)
  - `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`
    (17-section design memo · eligibility criteria referenced)
  - `.agent/templates/baseline_promotion_checklist.md` (~50 lines ·
    used to cross-check readiness)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — one real localhost report generation happened; second
consecutive GREEN on Fixture A. No push, no deploy pending explicit
human approval per turn.

## Reasoning summary

AgentOps-3g-stability successfully confirms that the previous Fixture
A GREEN result was not a lucky one. The existing local regression
harness was run once on localhost **without any harness code
changes**. The new run `20260714T025246Z_fixture-A` produced
`verdict=green`, `exit_code=0`, `capture_scope="main section"`,
`fallback_used=false`, `selected_candidate_marker_count=5/5`,
`selected_candidate_has_evidence=true`, and **25/25 checks passed**.
Compared with the previous GREEN run `20260713T014957Z_fixture-A`,
the `report_char_count` moved from 11773 to 9837, a **−16.4%** change
within the pre-declared ±30% tolerance. Duration moved from 75804 ms
to 66610 ms, a **−12.1%** change / **0.88×**, well within the 2×
tolerance. **All binary stability properties held**: same GREEN
verdict, same `exit_code=0`, same non-body capture scope,
`fallback_used=false`, 5/5 markers plus Evidence Appendix, Candidate
1 sentinel intact, zero must-not-happen matches, and 25/25 checks
passing. This supports proceeding to **AgentOps-3g-2** baseline
promotion. The task respected boundaries: no baseline promotion, no
baseline files created, no `.agent/regression_baselines/` directory,
no production target, no A-E expansion, no full report or screenshot
committed, no `scripts/report-regression-local.mjs` change, no
`.agent/scripts/**` changes, no `src/**` changes, no pipeline
changes, no collector/corpus refresh, no push/deploy.

## Approved direction

- **Approve AgentOps-3g-stability.**
- **Treat `20260714T025246Z_fixture-A` as the preferred candidate**
  for first official Fixture A baseline.
- **Prefer promoting the new stability run** rather than the older
  3e-tune-2 run because the new run has a fresher source commit at
  run time: **`451bb7f`**.
- **Do NOT run another stability re-run.** Two consecutive greens is
  sufficient; a third pass has diminishing returns.
- **Do NOT promote baseline in this DECISION.**
- **Do NOT create baseline files in this DECISION.**
- **Next default loop after push/cleanup**: **AgentOps-3g-2** —
  promote `20260714T025246Z_fixture-A` as first official baseline.
- **AgentOps-3g-2** should create
  `.agent/regression_baselines/fixture-A/current/` and lightweight
  baseline metadata/verdict/check artifacts according to the 3g
  design (design memo §7-§8).
- **Do NOT commit full `report.md`** in v1.
- **Do NOT commit screenshots** in v1.
- **Do NOT run A-E full suite yet.**
- **Do NOT test production.**
- **Do NOT implement Codex planner yet.**
- **Do NOT introduce OpenAI API.**

## Run summary

| field | value |
|---|---|
| previous_green_run_id | `20260713T014957Z_fixture-A` |
| new_run_id | `20260714T025246Z_fixture-A` |
| fixture | A (v1) |
| base_url | `http://localhost:3000` |
| command | `node scripts/report-regression-local.mjs` |
| **verdict** | **green** |
| **exit_code** | **0** |
| duration_ms | **66610** |
| previous_duration_ms | 75804 |
| duration_delta_ms | **−9194** |
| duration_percent_change | **−12.1%** |
| duration_ratio | **0.88×** (well within 2×) |
| capture_scope | **`main section`** |
| fallback_used | **false** |
| page_body_char_count | 16569 |
| previous_page_body_char_count | 18422 |
| **report_char_count** | **9837** |
| previous_report_char_count | 11773 |
| report_char_count_delta | **−1936** |
| report_char_count_percent_change | **−16.4%** (within ±30%) |
| report_length_soft_min | 1500 |
| report_length_soft_max | 14000 |
| candidate_count | 9 |
| qualified_candidate_count | 2 |
| selected_candidate_marker_count | **5 / 5** |
| selected_candidate_has_evidence | `true` |
| one_real_generation_happened | yes |
| cost_measured | false |
| estimated_cost | ≈ $0.05 |
| git_commit_sha_at_run_time | **`451bb7f`** |
| production_target | no |
| baseline_promoted | no |
| baseline_files_created | no |
| full_report_committed | no |
| screenshot_committed | no |

## Stability analysis

The stability re-run **confirms the load-bearing properties needed
before baseline promotion**. Both GREEN runs used Fixture A and the
same local harness behavior (`d393db9`, no change).

**Binary quality signals · all preserved**:
- verdict green
- exit code 0
- non-body capture (`main section`)
- `fallback_used=false`
- all required section markers (5/5) present
- Evidence Appendix present
- Candidate 1 sentinel intact (incomplete banner absent)
- 25/25 checks passed
- zero must-not-happen matches

**Continuous metrics · within declared tolerance**:
- report length: **−16.4%** (well within pre-declared ±30% band)
- duration: **−12.1% / 0.88×** (well within pre-declared 2× band)

This is **enough evidence to proceed to baseline promotion without
running a third stability pass**. LLM outputs are nondeterministic;
two consecutive runs that agree on every load-bearing signal while
varying naturally in exact character count and latency is exactly
what the AgentOps-3g memo §4 (why-not-auto-promote) required us to
verify.

## Baseline promotion recommendation

**Proceed next to AgentOps-3g-2** and promote
`20260714T025246Z_fixture-A` as the **first official Fixture A
baseline**, assuming human approval.

**Rationale for choosing the new run over the older 3e-tune-2 run**:
- Second consecutive GREEN carries more confidence than a single
  GREEN.
- Was run against the current `main` HEAD (`451bb7f`), so the
  baseline's `source_commit_sha` will match the tip of `main` at
  promotion time — no immediate drift.
- Identical structural properties to the older run, so no confidence
  lost.

**AgentOps-3g-2 constraints** (from 3g design memo):
- Must be a **separate explicit loop** (not bundled with anything
  else).
- Must create **lightweight files** under
  `.agent/regression_baselines/fixture-A/current/`
  (`baseline_metadata.json`, `baseline_verdict.md`,
  `baseline_structural_checks.json`, `source_run_id.txt`,
  `promotion_decision.md`, optionally `baseline_summary.md`).
- Must **NOT commit `report.md` or screenshots** in v1.
- Must **NOT run a new generation** unless explicitly approved
  (promotion should re-use the existing `20260714T025246Z_fixture-A`
  artifacts — no need to burn another $0.05).
- Must set `baseline_status = "current"` and populate all 22 fields
  from §8 of the design memo.
- Must include an explicit DECISION file naming both the candidate
  `run_id` and the new `baseline_id`.

## Risks found

1. **Only Fixture A has been stability-confirmed.** Severity: **low**
   (intended; gradual scale-out).
2. **B-E fixtures have not been real-run.** Severity: **low**
   (intended).
3. **Production has not been tested.** Severity: **medium** for
   release confidence, **low** for baseline governance.
4. **Baseline promotion has not happened yet.** Severity: **none**
   (intended · this is a stability loop, not a promotion loop).
5. **No official baseline exists yet.** Severity: **none** (same as
   above).
6. **Cost is estimated, not measured exactly.** Severity: **low**.
   `cost_measured: false` honestly recorded.
7. **LLM output remains nondeterministic**, although stability looks
   acceptable. Severity: **low-medium**. Mitigation: the RUN_REPORT
   comparison table captures both runs' key metrics for future
   drift analysis.
8. **Quote integrity is not yet part of the gate.** Severity:
   **low-medium**. Follow-up loop later.
9. **Full report and screenshot remain scratchpad-only.** Severity:
   **low** (intended policy).
10. **Future baseline comparison still needs implementation
    discipline.** Severity: **medium**. Codex planner and baseline
    drift checks are future work.
11. **The harness currently gives structural/fixture/operational
    confidence, not semantic equivalence.** Severity: **low-medium**
    (documented in 3g memo §11). Semantic diff is explicitly
    deferred.
12. **AgentOps-3g-2 must not bundle unrelated work.** Severity:
    **medium** for governance clarity. Enforced by the "promotion
    must be its own loop" rule from 3g memo §9.
13. **BLK-0001 / BLK-0002 / BLK-0003 remain open and unaffected.**
    Severity: **none** for this loop (documented state), **medium**
    as standing project risk covered elsewhere.

## Required fixes

**`none`**

The stability re-run is a clean second GREEN. Every load-bearing
signal reproduced within pre-declared tolerance. No follow-up fix or
retry is needed to approve this run.

## Non-blocking followups

- **Push AgentOps-3g-stability after human approval.**
- **Create/update daily summary after push.**
- **Next recommended loop**: **AgentOps-3g-2** · baseline promotion.
- **AgentOps-3g-2** should promote `20260714T025246Z_fixture-A` as
  first official Fixture A baseline.
- **AgentOps-3g-2** should create
  `.agent/regression_baselines/fixture-A/current/` with lightweight
  metadata / verdict / check artifacts (per 3g memo §7-§8).
- **Do NOT run another stability re-run.**
- **Do NOT run A-E full suite yet.**
- **Do NOT test production.**
- **Do NOT implement Codex planner yet.**
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline.**
- **Do NOT introduce OpenAI API.**
- **Do NOT push until explicit human approval.**

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT promote
baseline. Do NOT create baseline files. Do NOT create
`.agent/regression_baselines/`. Do NOT run another Playwright/harness
attempt. Do NOT run report generation again. Do NOT call
Anthropic/OpenAI outside the local app. Do NOT run A-E full suite. Do
NOT test production. Do NOT modify
`scripts/report-regression-local.mjs`. Do NOT implement Codex
planner. Do NOT create `.agent/planner_reports/`. Do NOT modify
`.agent/scripts/**`. Do NOT modify `src/**`. Do NOT modify pipeline.
Do NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub
Actions. Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start
G2.1d. Do NOT resume full automation. Recommended next task after
push/cleanup is **AgentOps-3g-2** · promote
`20260714T025246Z_fixture-A` as first official Fixture A baseline.

## Files reviewed

- `.agent/regression_runs/20260714T025246Z_fixture-A/metadata.json`
  — 64 lines. All 22+ fields populated cleanly. `capture_debug_top3`
  shows `main section` @ 9837 chosen over `main` @ 16234, correctly
  applying shortest-qualified tiebreaker. `scratch_paths` points
  outside the repo. `cost_measured: false` and `cost_cap_enforced_by:
  single_generation_limit` unchanged. `git_commit_sha` is
  `451bb7fc0ef0c4835ab22e76ff82d304e02d4f78` — the current `main`
  HEAD before this loop started.
- `.agent/regression_runs/20260714T025246Z_fixture-A/structural_checks.json`
  — 25 checks; all pass. Red level 15/15. Amber level 9/9. Fixture 4/4.
  Operational 4/4. `report_length_in_soft_band` detail:
  `chars=9837 band=1500-14000`.
- `.agent/regression_runs/20260714T025246Z_fixture-A/verdict.md` —
  27 lines. Red = _none_. Amber = _none_. Header carries scope,
  fallback, candidate summary.
- `.agent/run_reports/2026-07-12_run_08_RUN_REPORT.md` — 439 lines.
  Uses the 3f `## Regression verdict` section with
  `regression_required=yes`, `verdict=green` (i.e. `required_green`),
  `baseline_promoted=no`, `production_target_used=no`. Includes full
  previous-vs-new comparison table with deltas and tolerance
  verdicts. Recommendation logic explicit for green/amber/red
  branches.
- `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`
  — 563 lines. §5 eligibility criteria satisfied (14 conditions
  checked in RUN_REPORT). §6 additional promotion criteria will apply
  in AgentOps-3g-2, not this loop.
- `.agent/templates/baseline_promotion_checklist.md` — ~50 lines.
  Every applicable item in "Candidate identification" and "Verdict
  eligibility" sections is satisfied by this run.

## Boundary confirmations · 24 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No baseline promotion | ✅ |
| No baseline files created | ✅ |
| No `.agent/regression_baselines/` created | ✅ |
| No `.agent/baselines/` / `baselines/` created | ✅ |
| No additional harness run since RUN_REPORT | ✅ |
| No additional report generation since RUN_REPORT | ✅ |
| No LLM / API calls outside the local app | ✅ (harness = browser driver only) |
| No production target | ✅ (harness hard-rejects non-localhost) |
| No A-E full-suite invocation | ✅ (Fixture A only) |
| No full report / screenshot committed | ✅ (scratchpad only) |
| No `scripts/report-regression-local.mjs` changes | ✅ (stable at `d393db9`) |
| No `.agent/scripts/**` changes | ✅ (hard rule per AgentOps-2c Q3-Q8) |
| No `src/**` changes | ✅ |
| No pipeline changes | ✅ (HEAD `b019786` unchanged start AND end) |
| No collector run | ✅ |
| No corpus refresh | ✅ |
| No OpenAI API introduced | ✅ |
| No GitHub Actions changes | ✅ |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read | ✅ |
| No `vercel.json` / `.vercel/**` changes | ✅ |
| No Codex / Claude config edits | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains spec-only | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |

## Stop condition

DECISION written. **Awaiting explicit human approval to push.** No
follow-up action is authorized until Bohao says "push
AgentOps-3g-stability".
