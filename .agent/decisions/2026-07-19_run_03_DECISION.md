# DECISION · AgentOps-4b · Promote Fixture B baseline

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-20 21:55). Standing in for the
> ChatGPT reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-19_run_03_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-19_run_03_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-19_run_03_TASK.md`
- **loop**: `AgentOps-4b`
- **parent_loop**: `AgentOps-4a-stability` (`2026-07-19_run_02`)
- **grandparent_loop**: `AgentOps-4a` (`2026-07-19_run_01`)
- **impl_commit**: `80c285e`
- **run_report_commit**: `0603557`
- **files_reviewed**:
  - `.agent/tasks/2026-07-19_run_03_TASK.md` (402 lines)
  - `.agent/regression_baselines/fixture-B/current/baseline_metadata.json`
    (1931 B · 22-field schema + stability delta + fixture-specific
    recommendation keywords + 10-item notes)
  - `.agent/regression_baselines/fixture-B/current/baseline_verdict.md`
    (3204 B → +approval note · red=none · amber=none)
  - `.agent/regression_baselines/fixture-B/current/baseline_structural_checks.json`
    (4068 B · 25 checks preserved verbatim in envelope)
  - `.agent/regression_baselines/fixture-B/current/source_run_id.txt`
    (27 B · `20260719T054151Z_fixture-B`)
  - `.agent/regression_baselines/fixture-B/current/promotion_decision.md`
    (updated · APPROVED)
  - `.agent/regression_baselines/fixture-B/current/baseline_summary.md`
    (updated · +Approval section)
  - `.agent/run_reports/2026-07-19_run_03_RUN_REPORT.md` (504 lines ·
    dogfoods the 3f `## Regression verdict` section)
  - `.agent/regression_runs/20260719T054151Z_fixture-B/*` (source B
    stability run · read-only · unchanged)
  - `.agent/regression_runs/20260719T045622Z_fixture-B/*` (previous B
    GREEN · read-only reference for stability delta · unchanged)
  - `.agent/regression_baselines/fixture-A/current/*` (Fixture A
    baseline · read-only reference for layout · **unchanged**)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — first official Fixture B baseline creation; second
fixture-level baseline for the project. No push, no deploy pending
explicit human approval per turn.

## Reasoning summary

AgentOps-4b successfully promotes the validated second Fixture B GREEN
run, `20260719T054151Z_fixture-B`, as the **first official Fixture B
regression baseline**. The loop reused existing artifacts and **did
not run the harness**, did not generate a report, did not call any
LLM/API, and cost **$0**. The new baseline path is
`.agent/regression_baselines/fixture-B/current/`. It contains **six
lightweight files**: `baseline_metadata.json`,
`baseline_verdict.md`, `baseline_structural_checks.json`,
`source_run_id.txt`, `promotion_decision.md`, and
`baseline_summary.md`. The source run is `verdict=green` with
`exit_code=0`, `capture_scope="main section"`, `fallback_used=false`,
`report_char_count=10445`, `duration_ms=67608`, and **25/25 checks**
preserved. Fixture B stability was already confirmed by two
consecutive GREEN runs: `20260719T045622Z_fixture-B` and
`20260719T054151Z_fixture-B`, with `report_char_count` delta
**+38 / +0.4%** and duration delta **−111 ms / −0.2%**. The
fixture-specific recommendation keywords remain `agent`, `tool call`,
`tool-call`, `eval`, `telemetry`. The promotion mirrors the Fixture A
AgentOps-3g-2 baseline workflow: lightweight artifacts only, no full
`report.md`, no screenshot, source checks preserved,
`supersedes_baseline_id=null` (first B baseline), and approval
finalized by this DECISION commit. Boundaries were respected: **no
Fixture A baseline changes**, no source run changes, no harness
changes, no `src/**` changes, no `.agent/scripts/**` changes, no
pipeline changes, no uploaded PDFs, no C/D/E, no A-E full suite, no
production target, no collector/corpus refresh, no OpenAI API, no
GitHub Actions changes, no push/deploy.

## Approved direction

- **Approve AgentOps-4b.**
- **Finalize** `fixture-B_20260719T054151Z_current` as the **first
  official Fixture B baseline**.
- **Accept** `.agent/regression_baselines/fixture-B/current/` as the
  official Fixture B baseline path.
- **Accept** `20260719T054151Z_fixture-B` as the source run.
- **Accept the six lightweight baseline files.**
- **Keep** `report.md` and screenshots **uncommitted** in v1.
- **Keep** `baseline_structural_checks.json` copied from source
  checks without changing pass/fail values.
- **Keep** `supersedes_baseline_id` as `null` because this is the
  first Fixture B baseline.
- **Keep** `baseline_status` as `current`.
- **Do NOT run a new generation.**
- **Do NOT run another Fixture B stability pass.**
- **Do NOT run C/D/E yet.**
- **Do NOT run A-E full suite.**
- **Do NOT ingest the 20 uploaded PDFs yet.**
- **Do NOT test production.**
- **Do NOT implement Codex planner.**
- **Do NOT introduce OpenAI API.**
- **Recommended next state after push/cleanup**: **strategic pause**,
  then choose one next arc explicitly.

## Baseline summary

| field | value |
|---|---|
| baseline_id | `fixture-B_20260719T054151Z_current` |
| fixture_id | `B` |
| baseline_path | `.agent/regression_baselines/fixture-B/current/` |
| source_run_id | `20260719T054151Z_fixture-B` |
| source_run_artifact_path | `.agent/regression_runs/20260719T054151Z_fixture-B/` |
| source_commit_sha | `0341461` |
| harness_script_commit | `0341461` |
| **verdict** | **green** |
| **exit_code** | **0** |
| capture_scope | **`main section`** |
| fallback_used | **false** |
| report_char_count | **10445** |
| report_length_soft_min | 1500 |
| report_length_soft_max | 14000 |
| duration_ms | 67608 |
| previous_green_run_id | `20260719T045622Z_fixture-B` |
| previous_green_report_char_count | 10407 |
| previous_green_duration_ms | 67719 |
| stability_report_char_count_delta | +38 |
| stability_report_char_count_percent_change | **+0.4%** |
| stability_duration_delta_ms | −111 |
| stability_duration_percent_change | **−0.2% / 0.998×** |
| fixture_specific_recommendation_keywords | `agent`, `tool call`, `tool-call`, `eval`, `telemetry` |
| cost_for_this_loop | **$0** |
| source_run_estimated_cost | ≈ $0.05 |
| production_target_used | **false** |
| full_report_committed | **no** |
| screenshot_committed | **no** |
| uploaded_pdfs_committed | **no** |
| **baseline_status** | **`current`** |
| supersedes_baseline_id | `null` (first B baseline) |
| **promoted_by** (post-finalization) | **`Bohao via DECISION 2026-07-19_run_03_DECISION`** |

## Pending markers finalized in this DECISION commit

Along with writing this DECISION file, the following 4 baseline files
were updated to replace pending approval language with APPROVED
language. All 4 edits are staged for the DECISION commit alongside
the new DECISION file:

1. **`baseline_metadata.json`**:
   - `promoted_by`: `"Bohao pending DECISION"` →
     `"Bohao via DECISION 2026-07-19_run_03_DECISION"`
   - `notes` array prepended with:
     - `"First official Fixture B baseline."`
     - `"Approved by DECISION .agent/decisions/2026-07-19_run_03_DECISION.md."`
   - `promotion_decision_path` unchanged
     (`.agent/decisions/2026-07-19_run_03_DECISION.md`).
   - `baseline_status` unchanged (`current`).
   - `supersedes_baseline_id` unchanged (`null`).
   - `baseline_id` unchanged
     (`fixture-B_20260719T054151Z_current`).
   - `source_run_id` unchanged (`20260719T054151Z_fixture-B`).
   - No source metric or check result altered. No stability field
     altered. No recommendation-keyword list altered.

2. **`promotion_decision.md`**: pending-pointer language replaced
   with APPROVED language. Names this DECISION file explicitly.
   States the baseline becomes the current official Fixture B
   baseline once pushed to `origin/main`. Preserves scope
   disclaimers (Fixture B only · no C/D/E · no A-E · no production ·
   no semantic equivalence gate · no quote-integrity gate · no
   uploaded-PDF authorization). Reaffirms Bohao-only demotion
   authority.

3. **`baseline_verdict.md`**: PENDING DECISION section replaced with
   an APPROVED note referencing this DECISION. Source verdict GREEN,
   exit 0, red=none, amber=none preserved. Full `report.md` and
   screenshot policy note preserved.

4. **`baseline_summary.md`**: new `## Approval` section added between
   `Identity` and `Provenance` sections, pointing at this DECISION.
   Limitations preserved (Fixture B only · localhost only · no
   C/D/E · no A-E · no production · no semantic diff · no quote
   integrity · uploaded 20 PDFs not ingested). Storage policy
   preserved.

**Not updated** (per TASK spec):
- `baseline_structural_checks.json` — no pending marker; only source
  checks + envelope. **Left untouched.**
- `source_run_id.txt` — just the source run id string. **Left
  untouched.**
- Source run artifacts under `.agent/regression_runs/**` — read-only.
  **Untouched.**
- Fixture A baseline files under
  `.agent/regression_baselines/fixture-A/**` — read-only. **Untouched.**
- RUN_REPORT — historical record of the promotion step. **Untouched.**

**JSON syntax verified**: `baseline_metadata.json` parses;
`baseline_structural_checks.json` parses; 25 checks preserved
verbatim in the `checks` array.

## Risks found

1. **Fixture B now has an official baseline, but only Fixture A and
   Fixture B are baseline-covered.** Severity: **low** (intended
   gradual scale-out; two archetypes covered is meaningful progress).
2. **C/D/E have not been real-run.** Severity: **low** (intended
   gradual scale-out).
3. **A-E full suite has not been run.** Severity: **low** (intended;
   full-suite is its own scale-out DECISION).
4. **Production has not been tested.** Severity: **medium** for
   release confidence, **low** for governance loop.
5. **Quote integrity is still not a gate.** Severity: **low-medium**.
   Deferred.
6. **Semantic equivalence comparison against baseline is still not
   implemented.** Severity: **low-medium**. Deferred (memo §11 · v1
   is metadata/structure only).
7. **Full report and screenshots remain scratchpad-only.** Severity:
   **low** (intended v1 policy).
8. **Uploaded 20 PDFs have not been reviewed or ingested into
   fixture governance.** Severity: **medium** for data-hygiene
   discipline. Handling belongs in a separate resume-fixture-intake
   design loop with anonymization + storage policy DECISION.
9. **Future harness / model / prompt / report / corpus changes may
   require baseline refresh or demotion.** Severity: **medium** for
   baseline hygiene. Mitigated by demotion policy (memo §10) and
   Bohao-only demotion authority.
10. **Fixture B baseline must not be generalized to C/D/E or
    production coverage.** Severity: **medium** for reasoning
    discipline. Mitigation: `promotion_decision.md` §"Scope this
    DECISION does NOT approve" is explicit; `baseline_summary.md
    §Limitations` reinforces it; `baseline_metadata.json.notes` list
    the deferrals.
11. **Baseline demotion must require explicit human DECISION.**
    Severity: **medium** for governance clarity. Bohao-only rule is
    by design.
12. **BLK-0001 / BLK-0002 / BLK-0003 remain open and unaffected.**
    Severity: **none** for this loop (documented state), **medium**
    as standing project risk covered elsewhere.

## Required fixes

**`none`**

The 6 baseline files land cleanly. Every AgentOps-3g memo constraint
(§5-§8) is respected. Fixture A baseline stays read-only. Source run
artifacts remain untouched. No new generation happened. Zero cost.
Zero LLM/API call. No forbidden path. Pending markers correctly
finalized in this DECISION commit (mirrors 3g-2 discipline for
Fixture A). No follow-up code change is needed to approve this loop.

## Non-blocking followups

- **Push AgentOps-4b after human approval.**
- **Update daily summary after push.**
- **Recommended next state after cleanup**: **strategic pause**.
- **Possible next arcs after pause** (executor preference order · not
  binding):
  - **Gradual Fixture C run** (natural continuation · single fixture
    · ≈ $0.05 · harness `--fixture C` needs FIXTURE_TABLE entry
    similar to 4a's addition of B)
  - **Quote integrity design** (verify JD-attributed quotes actually
    exist in `src/data/web_bundle.json` · design-only first)
  - **Baseline comparison policy** (drift-detection amber checks
    against baselines A + B · design memo first · code later)
  - **Codex planner implementation** (3b spec → code · needs OpenAI
    API blocker BLK-0003 workaround · Codex CLI via ChatGPT sign-in
    is allowed)
  - **Uploaded PDF resume-fixture-intake design loop** (anonymization
    + storage policy DECISION before any PDF-derived artifact lands
    in the repo)
- **Do NOT start any next arc in this DECISION.**
- **Do NOT run C/D/E yet.**
- **Do NOT run A-E full suite.**
- **Do NOT ingest the 20 uploaded PDFs yet.**
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline.**
- **Do NOT introduce OpenAI API.**

## Next task prompt for Claude

After this DECISION and pending-marker finalization are committed,
**stop and wait for explicit human approval to push**. Do NOT push.
Do NOT deploy. Do NOT run another Playwright/harness attempt. Do NOT
run report generation again. Do NOT call Anthropic/OpenAI outside the
local app. Do NOT run A-E full suite. Do NOT run fixtures C/D/E. Do
NOT ingest uploaded PDFs. Do NOT promote another baseline. Do NOT
modify `.agent/regression_baselines/fixture-A/**`. Do NOT modify
`.agent/regression_baselines/fixture-B/**` after this commit. Do NOT
modify `.agent/regression_runs/**`. Do NOT modify
`.agent/regression_fixtures/**`. Do NOT implement Codex planner. Do
NOT create `.agent/planner_reports/`. Do NOT modify
`.agent/scripts/**`. Do NOT modify `src/**`. Do NOT modify pipeline.
Do NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub
Actions. Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start
G2.1d. Do NOT resume full automation. Recommended next state after
push/cleanup is a **strategic pause**, then choose one next arc
explicitly.

## Files reviewed

- **`.agent/tasks/2026-07-19_run_03_TASK.md`** — 402 lines · full
  spec of the minimal `--fixture` mirror workflow · allowed / forbidden
  files · 6-file baseline layout · pending-marker discipline · JSON
  validity check.
- **`baseline_metadata.json`** — 22 core fields + 6 stability
  comparison fields + 1 fixture-specific keyword array + 10-item
  notes. `promoted_by` now reads `"Bohao via DECISION
  2026-07-19_run_03_DECISION"`. All source-derived fields unchanged.
- **`baseline_verdict.md`** — human-readable verdict; red=none,
  amber=none; APPROVED note references this DECISION; scratchpad-only
  policy preserved.
- **`baseline_structural_checks.json`** — 25 checks preserved
  **verbatim** inside envelope with `baseline_id` + `source_run_id`
  + `fixture_id` + `copied_verbatim=true`. JSON parses.
- **`source_run_id.txt`** — single line
  `20260719T054151Z_fixture-B`. Unchanged (no marker to finalize).
- **`promotion_decision.md`** — replaced with APPROVED language.
  Names this DECISION explicitly. Preserves scope disclaimers
  (Fixture B only · no C/D/E · no A-E · no production · no semantic
  equivalence · no quote integrity · no PDF authorization). Reaffirms
  Bohao-only demotion authority.
- **`baseline_summary.md`** — new `## Approval` section references
  this DECISION. Limitations + storage policy preserved.
- **`RUN_REPORT`** — 504 lines; uses 3f `## Regression verdict`
  section with `regression_required=no`, `verdict=not_required`,
  `baseline_promoted=yes (pending DECISION approval)`. Includes full
  source artifact reuse mapping, stability comparison table, 3g-2
  mirror discipline table, limitations, forbidden-file audit,
  30-item confirmation table.
- **Source B stability run artifacts**
  (`20260719T054151Z_fixture-B/*`) — read-only. Not modified by
  this loop. Every 25 check preserved identically in the baseline
  envelope.
- **Previous B run artifacts**
  (`20260719T045622Z_fixture-B/*`) — read-only. Not modified.
- **Fixture A baseline files**
  (`.agent/regression_baselines/fixture-A/current/*`) — read-only.
  **Not modified.** `promoted_by="Bohao via DECISION
  2026-07-12_run_09_DECISION"` and `baseline_status="current"`
  remain intact.

## Boundary confirmations · 25 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No harness run | ✅ (no `node scripts/…`, no `npm run dev`) |
| No report generation | ✅ (no LLM API call from any script) |
| No LLM / API calls | ✅ |
| No C/D/E | ✅ (only B baseline touched) |
| No A-E full suite | ✅ |
| No uploaded PDFs committed | ✅ (find sweep confirmed) |
| No `report.md` / screenshot committed | ✅ (scratchpad only) |
| No `scripts/report-regression-local.mjs` changes | ✅ (harness stable at `0341461`) |
| No `.agent/scripts/**` changes | ✅ (hard rule per AgentOps-2c Q3-Q8) |
| No `src/**` changes | ✅ |
| No pipeline tracked-file changes | ✅ (HEAD `b019786` unchanged start AND end) |
| **No Fixture A baseline changes** | ✅ (`.agent/regression_baselines/fixture-A/**` read-only untouched) |
| No source run artifact changes | ✅ (both `20260719T045622Z_fixture-B/*` and `20260719T054151Z_fixture-B/*` untouched) |
| **No `baseline_structural_checks.json` change** in this DECISION commit | ✅ (source checks + envelope stayed as impl-commit state) |
| **No `source_run_id.txt` change** | ✅ |
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
Bohao says "push AgentOps-4b".
