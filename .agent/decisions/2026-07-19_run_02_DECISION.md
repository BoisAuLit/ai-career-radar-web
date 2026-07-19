# DECISION · AgentOps-4a-stability · Fixture B stability re-run

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-19 01:05). Standing in for the
> ChatGPT reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-19_run_02_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-19_run_02_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-19_run_02_TASK.md`
- **loop**: `AgentOps-4a-stability`
- **parent_loop**: `AgentOps-4a` (`2026-07-19_run_01`)
- **grandparent_loop**: `AgentOps-3g-2` (`2026-07-12_run_09`)
- **impl_commit**: `f257932`
- **run_report_commit**: `c1a1062`
- **files_reviewed**:
  - `.agent/tasks/2026-07-19_run_02_TASK.md` (280 lines)
  - `.agent/regression_runs/20260719T054151Z_fixture-B/metadata.json`
    (64 lines · `verdict=green` · `exit_code=0`)
  - `.agent/regression_runs/20260719T054151Z_fixture-B/structural_checks.json`
    (25 checks · all pass)
  - `.agent/regression_runs/20260719T054151Z_fixture-B/verdict.md`
    (27 lines · red = _none_ · amber = _none_)
  - `.agent/run_reports/2026-07-19_run_02_RUN_REPORT.md` (508 lines ·
    full stability comparison table)
  - `.agent/regression_runs/20260719T045622Z_fixture-B/*` (previous B
    GREEN · read-only reference)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — one real localhost report generation happened; second
consecutive Fixture B GREEN. No push, no deploy pending explicit human
approval per turn.

## Reasoning summary

AgentOps-4a-stability confirms Fixture B's first GREEN was **not a
lucky run**. The second Fixture B run,
`20260719T054151Z_fixture-B`, produced `verdict=green`,
`exit_code=0`, `capture_scope="main section"`, `fallback_used=false`,
**25/25 checks passed**, 5/5 report markers plus Evidence Appendix,
**zero must-not-happen matches**, and **identical fixture-specific
recommendation keywords** compared with the first B run. The
`report_char_count` moved from 10407 to 10445, only **+38 / +0.4%**,
far within the ±30% tolerance. Duration moved from 67719 ms to 67608
ms, **−111 ms / −0.2%**, effectively flat and far within the 2×
tolerance. Fixture-specific keyword patterns were identical:
strengths **5/5**, gaps **5/5**, recommendation keywords **5/5** with
`agent`, `tool call`, `tool-call`, `eval`, `telemetry`, and
must-not-happen **0**. This is **strong stability evidence** and
supports moving to Fixture B baseline promotion. The task respected
all boundaries: no harness code change, no baseline promotion, no
Fixture B baseline created, no `.agent/regression_baselines/**`
changes, no `src/**` changes, no `.agent/scripts/**` changes, no
pipeline changes, no uploaded PDFs committed, no production target,
no A-E expansion, no C/D/E, no full report/screenshot committed, no
collector/corpus refresh, no OpenAI API, no GitHub Actions changes,
no push/deploy.

## Approved direction

- **Approve AgentOps-4a-stability.**
- **Treat `20260719T054151Z_fixture-B` as the preferred candidate**
  for the first official Fixture B baseline.
- **Prefer the second B GREEN run** over the first B GREEN run
  because it is the stability-confirmed run and has fresher source
  commit **`0341461`** (vs `0b99358` for the first B run).
- **Do NOT run a third B stability pass.** Two textbook greens is
  enough; a third pass has diminishing returns and would waste
  ≈ $0.05 with no new information.
- **Do NOT promote Fixture B baseline in this DECISION.**
- **Do NOT create `.agent/regression_baselines/fixture-B/` in this
  DECISION.**
- **Next default loop after push/cleanup**: **AgentOps-4b** ·
  promoting `20260719T054151Z_fixture-B` as first official Fixture B
  baseline.
- **AgentOps-4b should mirror AgentOps-3g-2 exactly**: reuse existing
  artifacts, create lightweight baseline files (6-file set), no new
  generation, no `report.md` committed, no screenshots committed,
  22-field metadata schema, pending-marker discipline.
- **Do NOT run C/D/E yet.**
- **Do NOT run A-E full suite.**
- **Do NOT ingest the 20 uploaded PDFs yet.** Separate design loop
  first.
- **Do NOT test production.**
- **Do NOT implement Codex planner.**
- **Do NOT introduce OpenAI API.**

## Run summary

| field | value |
|---|---|
| previous_fixture_b_green_run_id | `20260719T045622Z_fixture-B` |
| new_fixture_b_run_id | `20260719T054151Z_fixture-B` |
| command | `node scripts/report-regression-local.mjs --fixture B` |
| **verdict** | **green** |
| **exit_code** | **0** |
| capture_scope | **`main section`** |
| capture_strategy | `shortest-qualified-candidate` |
| fallback_used | **false** |
| **report_char_count** | **10445** |
| previous_report_char_count | 10407 |
| **report_char_count_delta** | **+38** |
| **report_char_count_percent_change** | **+0.4%** |
| **duration_ms** | **67608** |
| previous_duration_ms | 67719 |
| **duration_delta_ms** | **−111** |
| **duration_percent_change** | **−0.2% / 0.998×** |
| page_body_char_count | 17007 |
| candidates / qualified | 8 / 2 |
| selected_candidate_marker_count | **5 / 5** |
| selected_candidate_has_evidence | true |
| markers | 5/5 + Evidence Appendix |
| console_errors | `[]` |
| one_real_generation_happened | yes |
| estimated_cost | ≈ $0.05 (Sonnet 4.6 baseline) |
| cost_measured | false |
| git_commit_sha_at_run_time | **`0341461`** |
| corpus_snapshot_date | May 14, 2026 |
| model_display | Claude Sonnet 4.6 |
| baseline_promoted | **no** |
| Fixture B baseline created | **no** |
| production_target_used | **no** |

## Fixture-specific keyword hit patterns (identical between runs)

| check | previous B (4a) | new B (4a-stability) | verdict |
|---|---|---|---|
| strengths | 5/5 | 5/5 | ✅ same |
| gaps | 5/5 | 5/5 | ✅ same |
| must_not_happen matches | 0 | 0 | ✅ same |
| recommendation keywords hit | `agent` · `tool call` · `tool-call` · `eval` · `telemetry` (5/5) | **identical set** (5/5) | ✅ same |

**Not one keyword flipped between runs.** Report consistently targets
the AI Product / agent-tooling direction across two independent
generations.

## Stability analysis

**Textbook stability.**

Binary quality signals **all preserved**:
- verdict green
- exit code 0
- non-body capture (`main section`)
- `fallback_used=false`
- all 5 required section markers + Evidence Appendix
- Candidate 1 sentinel intact
- 25/25 checks pass
- zero must-not-happen matches
- 5/5 recommendation keyword hits (identical set)
- 5/5 strengths, 5/5 gaps

Continuous metrics **essentially flat**:
- report length: **+0.4%** (far tighter than A's stability run which
  was −16.4%; still well within ±30% band)
- duration: **−0.2% / 0.998×** (far tighter than A's stability run
  which was −12.1%; still well within 2× band)

Interpretation: the AgentOps-4a first-try GREEN was **not** lucky. Two
consecutive independent generations at ~50 minutes apart with no code
change reproduced every load-bearing signal AND the numeric shape.
Fixture B is at least as reproducible as Fixture A was at the
equivalent lifecycle point.

## Risks found

1. **Fixture B has no official baseline yet.** Severity: **none**
   (intended state · AgentOps-4b will create it).
2. **C/D/E have not been real-run.** Severity: **low** (intended
   gradual scale-out).
3. **A-E full suite has not been run.** Severity: **low** (intended).
4. **Uploaded 20 PDFs have not been ingested or governed.** Severity:
   **medium** for data-hygiene discipline. Handling belongs in a
   separate resume-intake design loop with anonymization / storage
   policy DECISION before any file lands in the repo.
5. **Production has not been tested.** Severity: **medium** for
   release confidence, **low** for governance loop.
6. **Quote integrity is still not a gate.** Severity: **low-medium**.
   Deferred.
7. **Semantic baseline comparison is still not implemented.**
   Severity: **low-medium**. Deferred (memo §11 · v1 is
   metadata/structure only).
8. **Full report and screenshots remain scratchpad-only.** Severity:
   **low** (intended v1 policy).
9. **BLK-0001 / BLK-0002 / BLK-0003 remain open and unaffected.**
   Severity: **none** for this loop (documented state), **medium** as
   standing project risk covered elsewhere.

## Required fixes

**`none`**

The stability re-run is a clean second GREEN with textbook numeric
shape. Every AgentOps-3-era constraint held. Harness NOT modified. No
follow-up fix or retry is needed to approve this run.

## Non-blocking followups

- **Push AgentOps-4a-stability after human approval.**
- **Update 2026-07-19 daily summary after push.**
- **Next loop**: **AgentOps-4b baseline promotion**.
- **Do NOT run another B stability pass.**
- **Do NOT run C/D/E.**
- **Do NOT ingest the 20 PDFs.**
- **Do NOT touch `src/**`, `.agent/scripts/**`, pipeline, GitHub
  Actions, collector, corpus, or OpenAI API.**

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT run another
Playwright/harness attempt. Do NOT run report generation again. Do NOT
call Anthropic/OpenAI outside the local app. Do NOT run A-E full
suite. Do NOT run fixtures C/D/E. Do NOT ingest uploaded PDFs. Do NOT
promote baseline. Do NOT create Fixture B baseline. Do NOT modify
`.agent/regression_baselines/**`. Do NOT modify
`.agent/regression_fixtures/**`. Do NOT implement Codex planner. Do
NOT create `.agent/planner_reports/`. Do NOT modify
`.agent/scripts/**`. Do NOT modify `src/**`. Do NOT modify pipeline.
Do NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub
Actions. Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start
G2.1d. Do NOT resume full automation. Recommended next task after
push/cleanup is **AgentOps-4b** · promote
`20260719T054151Z_fixture-B` as first official Fixture B baseline,
mirroring AgentOps-3g-2 exactly.

## Files reviewed

- **`.agent/tasks/2026-07-19_run_02_TASK.md`** — 280 lines · fixture B
  stability re-run spec · yellow · no harness change · localhost only ·
  one real generation · reference values from 4a run.
- **`metadata.json` for `20260719T054151Z_fixture-B`** — all 22+
  fields populated cleanly. `capture_debug_top3` shows algorithm
  correctly picked shortest qualified (`main section` @ 10445 chosen
  over `main` @ 16672). `scratch_paths` points outside repo.
  `cost_measured: false` and `cost_cap_enforced_by:
  single_generation_limit` unchanged. `git_commit_sha` is `0341461`
  (current `main` HEAD before this loop).
- **`structural_checks.json`** — 25 checks · all pass.
  `must_not_happen_absent`: `no matches`.
  `recommendation_roughly_matches_expected`:
  `keywords=[agent,tool call,tool-call,eval,telemetry]
  hits=[agent,tool call,tool-call,eval,telemetry]` (5/5).
  `at_least_2_strengths_reflected`: `hits=5/5`.
  `at_least_2_gaps_reflected`: `hits=5/5`.
- **`verdict.md`** — human-readable summary · red=none · amber=none.
- **`RUN_REPORT`** — 508 lines · uses 3f `## Regression verdict`
  section with `regression_required=yes`, `verdict=green`
  (`required_green`), `baseline_promoted=no`,
  `production_target_used=no`,
  `push_implication=push eligible after human approval`. Includes full
  stability comparison table + identical fixture-specific keyword
  pattern comparison + A-baseline context (not pass/fail).
- **Previous B run artifacts** (`20260719T045622Z_fixture-B/*`) —
  read-only reference. Unchanged.

## Boundary confirmations · 22 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No additional harness run since RUN_REPORT | ✅ |
| No additional report generation since RUN_REPORT | ✅ |
| No LLM / API calls | ✅ (harness = browser driver only · no new gen since) |
| No baseline promotion | ✅ |
| No Fixture B baseline created | ✅ (`.agent/regression_baselines/fixture-B/` still does not exist) |
| No `.agent/regression_baselines/**` changes | ✅ (A baseline read-only) |
| No `.agent/regression_fixtures/**` changes | ✅ (B fixture file read-only) |
| No uploaded PDFs committed | ✅ (find sweep confirmed) |
| No `src/**` changes | ✅ |
| No `.agent/scripts/**` changes | ✅ (hard rule per AgentOps-2c Q3-Q8) |
| No `scripts/report-regression-local.mjs` changes | ✅ (harness stable at `0341461`) |
| No pipeline tracked-file changes | ✅ (HEAD `b019786` unchanged start AND end) |
| No collector run | ✅ |
| No corpus refresh | ✅ |
| No OpenAI API introduced | ✅ |
| No GitHub Actions changes | ✅ |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read | ✅ |
| No `vercel.json` / `.vercel/**` changes | ✅ |
| No Codex / Claude config edits | ✅ |
| No A-E expansion / no C/D/E | ✅ |
| No production target | ✅ (harness hard-rejects non-localhost) |
| No full report / screenshot committed | ✅ (scratchpad only) |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains spec-only | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |

## Stop condition

DECISION written. **Awaiting explicit human approval to push.** No
follow-up action is authorized until Bohao says "push
AgentOps-4a-stability".
