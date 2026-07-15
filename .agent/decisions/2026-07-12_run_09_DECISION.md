# DECISION · AgentOps-3g-2 · Promote Fixture A baseline

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-14 00:45). Standing in for the
> ChatGPT reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-12_run_09_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-12_run_09_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-12_run_09_TASK.md`
- **loop**: `AgentOps-3g-2`
- **parent_loop**: `AgentOps-3g-stability` (`2026-07-12_run_08`)
- **grandparent_loop**: `AgentOps-3g` (`2026-07-12_run_07`)
- **impl_commit**: `8c2cb4b`
- **run_report_commit**: `c02aedb`
- **files_reviewed**:
  - `.agent/regression_baselines/fixture-A/current/baseline_metadata.json`
    (1731 B · 22-field schema + stability comparison)
  - `.agent/regression_baselines/fixture-A/current/baseline_verdict.md`
    (2138 B → +approval note · red=none · amber=none)
  - `.agent/regression_baselines/fixture-A/current/baseline_structural_checks.json`
    (3993 B · 25 checks preserved verbatim in envelope)
  - `.agent/regression_baselines/fixture-A/current/source_run_id.txt`
    (27 B · `20260714T025246Z_fixture-A`)
  - `.agent/regression_baselines/fixture-A/current/promotion_decision.md`
    (updated · APPROVED)
  - `.agent/regression_baselines/fixture-A/current/baseline_summary.md`
    (updated · +Approval section)
  - `.agent/run_reports/2026-07-12_run_09_RUN_REPORT.md` (426 lines)
  - `.agent/regression_runs/20260714T025246Z_fixture-A/metadata.json`
    (source · unchanged)
  - `.agent/regression_runs/20260714T025246Z_fixture-A/structural_checks.json`
    (source · unchanged)
  - `.agent/regression_runs/20260714T025246Z_fixture-A/verdict.md`
    (source · unchanged)
  - `.agent/decisions/2026-07-12_run_08_DECISION.md` (predecessor
    approval)
  - `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`
    (17-section governance memo · §5-§8 verified)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — first official baseline creation; will govern all future
Fixture A regression comparison and Codex planner state. No push, no
deploy pending explicit human approval per turn.

## Reasoning summary

AgentOps-3g-2 successfully promotes the existing validated GREEN run
`20260714T025246Z_fixture-A` as the **first official Fixture A
regression baseline** using **lightweight committed artifacts only**.
The task reused existing GREEN artifacts and **did not run a new
generation**. It created
`.agent/regression_baselines/fixture-A/current/` with
`baseline_metadata.json`, `baseline_verdict.md`,
`baseline_structural_checks.json`, `source_run_id.txt`,
`promotion_decision.md`, and `baseline_summary.md`. The source run is
the **second consecutive Fixture A GREEN**: `verdict=green`,
`exit_code=0`, `capture_scope="main section"`, `fallback_used=false`,
`report_char_count=9837`, `duration_ms=66610`, **25/25 checks passed**,
and `source_commit_sha=451bb7f`. The baseline layer is small
(~13.5 KB total), diff-friendly, and excludes full `report.md` and
screenshots. **Source run artifacts remain untouched.** This loop
respected boundaries: no harness run, no report generation, no
LLM/API call, no production target, no A-E expansion, no `report.md`
or screenshot committed, no `scripts/report-regression-local.mjs`
change, no `.agent/scripts` change, no `src` change, no pipeline
change, no collector/corpus refresh, no push/deploy. **The baseline
approval markers were finalized in this DECISION step** so the
baseline no longer appears pending once this DECISION is committed —
`promoted_by` in `baseline_metadata.json` now reads `"Bohao via
DECISION 2026-07-12_run_09_DECISION"`, `promotion_decision.md` now
records APPROVED status, `baseline_verdict.md` carries the
approved-by-DECISION note, and `baseline_summary.md` has an
`## Approval` section pointing at this DECISION.

## Approved direction

- **Approve AgentOps-3g-2.**
- **Promote `20260714T025246Z_fixture-A`** as the first official
  Fixture A baseline.
- **Baseline ID**: `fixture-A_20260714T025246Z_current`.
- **Baseline path**: `.agent/regression_baselines/fixture-A/current/`.
- **Baseline status**: `current`.
- **Source run**: `20260714T025246Z_fixture-A`.
- **Treat this as a narrow Fixture A localhost baseline only.**
- **Do NOT treat this as B-E coverage.**
- **Do NOT treat this as production coverage.**
- **Do NOT treat this as semantic equivalence coverage.**
- **Do NOT treat this as quote-integrity coverage.**
- **Keep full `report.md` and screenshots out of git in v1.**
- **Do NOT run another generation** for this promotion.
- **Do NOT run A-E full suite yet.**
- **Do NOT test production.**
- **Do NOT implement Codex planner yet.**
- **After push/cleanup, take a strategic pause** before starting the
  next AgentOps arc.

## Baseline summary

- **baseline_id**: `fixture-A_20260714T025246Z_current`
- **baseline_status**: **`current`**
- **source_run_id**: `20260714T025246Z_fixture-A`
- **source_commit_sha**: `451bb7f`
- **harness_script_commit**: `d393db9`
- **source verdict**: **green**
- **exit_code**: **0**
- **capture_scope**: `main section`
- **fallback_used**: **false**
- **report_char_count**: **9837**
- **report_length_soft_min**: 1500
- **report_length_soft_max**: 14000
- **duration_ms**: **66610**
- **previous_green_run_id**: `20260713T014957Z_fixture-A`
- **previous_green_report_char_count**: 11773
- **stability_report_char_count_delta**: **−1936**
- **stability_report_char_count_percent_change**: **−16.4%**
- **stability_duration_delta_ms**: −9194
- **stability_duration_percent_change**: **−12.1%** (**0.88×**)
- **baseline files** (6 · ~13.5 KB total):
  - `baseline_metadata.json`
  - `baseline_verdict.md`
  - `baseline_structural_checks.json`
  - `source_run_id.txt`
  - `promotion_decision.md`
  - `baseline_summary.md`
- **full report committed**: **no**
- **screenshot committed**: **no**
- **production_target_used**: **no**
- **B-E coverage**: **no**

## Baseline approval markers finalized in this DECISION commit

Along with writing this DECISION file, the following pending markers
were replaced with approved-by-DECISION language. All four edits are
staged for the DECISION commit alongside the new DECISION file:

1. **`baseline_metadata.json`**:
   - `promoted_by`: `"Bohao pending DECISION"` →
     `"Bohao via DECISION 2026-07-12_run_09_DECISION"`
   - `notes` prepended with:
     `"First official Fixture A baseline."` and
     `"Approved by DECISION .agent/decisions/2026-07-12_run_09_DECISION.md."`
   - `promotion_decision_path` unchanged
     (`.agent/decisions/2026-07-12_run_09_DECISION.md`).
   - `baseline_status` unchanged (`current`).
   - `baseline_id` unchanged
     (`fixture-A_20260714T025246Z_current`).
   - `source_run_id` unchanged (`20260714T025246Z_fixture-A`).
   - No source metric or check result altered.

2. **`promotion_decision.md`**: pending-pointer language replaced
   with APPROVED language. Names this DECISION file explicitly.
   States the baseline becomes the current official Fixture A
   baseline once pushed to `origin/main`. Preserves scope
   disclaimers (no B-E coverage, no production coverage, no semantic
   equivalence, no quote integrity gate). Reaffirms Bohao-only
   demotion authority.

3. **`baseline_verdict.md`**: PENDING DECISION section replaced with
   an APPROVED note referencing this DECISION. Source verdict GREEN,
   exit 0, red=none, amber=none preserved. Full `report.md` and
   screenshot policy note preserved.

4. **`baseline_summary.md`**: new `## Approval` section added
   pointing at this DECISION. Limitations preserved (Fixture A only,
   localhost only, no B-E, no production, no semantic diff, no
   quote integrity gate).

**JSON syntax verified**: `baseline_metadata.json` parses;
`baseline_structural_checks.json` parses; 25 checks preserved
verbatim in the `checks` array.

## Risks found

1. **This is the first official baseline** and only covers Fixture
   A. Severity: **low** (intended narrow scope, honestly labeled in
   the baseline files).
2. **B-E fixtures are not baseline-covered.** Severity: **low**
   (intended gradual scale-out).
3. **Production is not baseline-covered.** Severity: **medium** for
   release confidence, **low** for governance loop.
4. **Baseline comparison is currently metadata/structure oriented,
   not semantic.** Severity: **low-medium** (memo §11).
5. **Quote integrity is not yet a gate.** Severity: **low-medium**
   (memo §16 item 6).
6. **Full `report.md` and screenshot remain scratchpad-only.**
   Severity: **low** (intended v1 storage policy).
7. **Future harness/model/prompt/report/corpus changes may stale
   this baseline.** Severity: **medium** for baseline hygiene.
   Mitigation: the stale/superseded/deprecated/invalidated statuses
   from memo §10 are documented; demotion triggers are enumerated.
8. **Future agents must not overgeneralize this baseline beyond
   Fixture A.** Severity: **medium** for reasoning discipline.
   Mitigation: `baseline_summary.md §Limitations`, `promotion_decision.md
   §"Scope this DECISION does NOT approve"`, and `baseline_metadata.json`
   `notes` all say this explicitly.
9. **Baseline demotion still requires explicit human DECISION.**
   Severity: **medium** for latency; Bohao-only rule is by design
   (memo §10 + AgentOps-3f skip-approval discipline).
10. **The baseline is official only after DECISION and push.**
    Severity: **low** (this DECISION is the approval; push happens
    in the separate cleanup loop).
11. **BLK-0001 / BLK-0002 / BLK-0003 remain open and unaffected.**
    Severity: **none** for this loop (documented state), **medium**
    as standing project risk covered elsewhere.

## Required fixes

**`none`**, assuming the pending approval markers described above are
finalized in this DECISION commit (they are · see
§"Baseline approval markers finalized in this DECISION commit").

The 6 baseline files land cleanly. Every AgentOps-3g memo constraint
(§5-§8) is respected. Source run artifacts remain untouched. No new
generation happened. Zero cost. Zero LLM/API call. No forbidden path.
No fake human approval before this DECISION landed.

## Non-blocking followups

- **Push AgentOps-3g-2 after human approval.**
- **Create/update daily summary after push.**
- **Take a strategic pause after 3g-2 cleanup.** AgentOps-3 arc is
  functionally complete through baseline promotion (3a → 3b → 3c →
  3d → 3e/3e-tune/3e-tune-2 harness → 3f verdict protocol →
  3g baseline design → 3g-stability → 3g-2 first official baseline).
  Fixture A local harness produces GREEN + baseline. That is a
  complete v1 slice. Soak for a day before opening the next arc.
- **Later possible next arcs** (in order of decreasing executor
  preference for a first candidate):
  - **Gradual Fixture B run** (memo §13 · single fixture · ≈ $0.05).
  - **Quote integrity checks** (memo §16 item 6 · design-only first).
  - **Baseline comparison policy** (implement drift-detection amber
    checks against the baseline · design memo first, code later).
  - **Codex planner implementation** (memo §6 · still spec-only ·
    OpenAI API blocker relevant).
  - **B-E expansion** as a bundle (only after several individual
    fixture loops).
- **Do NOT start these immediately** in this task.
- **Do NOT introduce OpenAI API.** BLK-0003 remains blocked.
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline.**
- **Do NOT push until explicit human approval.**

## Next task prompt for Claude

After this DECISION and baseline approval marker finalization are
committed, **stop and wait for explicit human approval to push**. Do
NOT push. Do NOT deploy. Do NOT run Playwright. Do NOT run report
generation. Do NOT call Anthropic/OpenAI. Do NOT run A-E full suite.
Do NOT test production. Do NOT modify
`scripts/report-regression-local.mjs`. Do NOT implement Codex
planner. Do NOT create `.agent/planner_reports/`. Do NOT modify
`.agent/scripts/**`. Do NOT modify `src/**`. Do NOT modify pipeline.
Do NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub
Actions. Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start
G2.1d. Do NOT resume full automation. Recommended next step after
push/cleanup is a **strategic pause**, then decide the next arc.

## Files reviewed

- **`baseline_metadata.json`** — 22-field schema populated cleanly
  plus stability comparison fields. `promoted_by` now reads `"Bohao
  via DECISION 2026-07-12_run_09_DECISION"`. `notes` array prepended
  with "First official Fixture A baseline." and
  "Approved by DECISION …". All source-derived fields unchanged.
- **`baseline_verdict.md`** — human-readable verdict; red=none,
  amber=none; APPROVED note references this DECISION; scratchpad-only
  policy preserved.
- **`baseline_structural_checks.json`** — 25 checks preserved
  **verbatim** inside envelope with `baseline_id` + `source_run_id`
  + `copied_verbatim=true`. JSON parses.
- **`source_run_id.txt`** — single line
  `20260714T025246Z_fixture-A`. Unchanged (no marker to finalize).
- **`promotion_decision.md`** — replaced with APPROVED language.
  Names this DECISION explicitly. Preserves scope disclaimers
  (no B-E, no production, no semantic equivalence, no quote
  integrity). Reaffirms Bohao-only demotion authority.
- **`baseline_summary.md`** — new `## Approval` section references
  this DECISION. Limitations preserved. Related documents unchanged.
- **`RUN_REPORT`** — 426 lines; uses 3f `## Regression verdict`
  section with `regression_required=no`, `verdict=not_required`,
  `baseline_promoted=yes (pending DECISION approval)`. Includes full
  source artifact reuse mapping, stability comparison table,
  relation-to-memo table, limitations, forbidden-file audit, 26-item
  confirmation table.
- **`.agent/regression_runs/20260714T025246Z_fixture-A/*` (source)**
  — read-only. Not modified by this loop. Every 25 check preserved
  identically in the baseline envelope.
- **`.agent/decisions/2026-07-12_run_08_DECISION.md`** (predecessor)
  — explicitly named `20260714T025246Z_fixture-A` as preferred
  candidate. This DECISION approves that named candidate.
- **`.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`**
  — §5 eligibility (14 conditions) all satisfied; §6 additional
  criteria all satisfied; §7 storage path matches; §8 schema
  fully populated; §9 workflow steps 1-8 completed (steps 9-11 are
  this DECISION + push + daily summary cleanup).

## Boundary confirmations · 22 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| Baseline path exists | ✅ `.agent/regression_baselines/fixture-A/current/` |
| Baseline metadata JSON parses | ✅ |
| Baseline structural checks JSON parses | ✅ |
| 25 checks preserved verbatim | ✅ |
| Source run artifacts unchanged | ✅ (`.agent/regression_runs/20260714T025246Z_fixture-A/` untouched) |
| No harness run | ✅ (no `node scripts/…`, no `npm run dev`) |
| No report generation | ✅ (no LLM API call from any script) |
| No LLM / API calls | ✅ |
| No production target | ✅ |
| No A-E expansion | ✅ |
| No `report.md` / screenshot committed | ✅ (find sweep confirmed empty) |
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

DECISION written + 4 baseline files finalized. **Awaiting explicit
human approval to push.** No follow-up action is authorized until
Bohao says "push AgentOps-3g-2".
