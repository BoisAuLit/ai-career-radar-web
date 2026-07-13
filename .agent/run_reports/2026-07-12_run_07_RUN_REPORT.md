# RUN_REPORT · AgentOps-3g · Baseline promotion design memo

## Metadata

- **task_id**: `2026-07-12_run_07`
- **date**: `2026-07-12`
- **loop**: `AgentOps-3g`
- **parent_loop**: `AgentOps-3f` (`2026-07-12_run_06`)
- **TASK**: `.agent/tasks/2026-07-12_run_07_TASK.md`
- **design memo**: `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`
- **checklist template**: `.agent/templates/baseline_promotion_checklist.md`
- **impl_commit**: `d68436c`
- **repo**: `/Users/bohaoli/Desktop/ai-career-radar-web`
- **branch**: `main`
- **base_commit_before**: `cfd951b`
- **base_commit_after**: `d68436c` (impl only; RUN_REPORT commit to follow)

## Regression verdict

> First RUN_REPORT to use the AgentOps-3f `## Regression verdict`
> template (helper `new_run_report.py` scaffolds it automatically now
> that `run_report_template.md` carries the section). This loop is
> `.agent/`-only design/memo work and does not touch any
> report-affecting file.

- **regression_required**: `no`
- **reason_required_or_not**: Design/protocol/memo-only loop. Only
  `.agent/tasks/`, `.agent/design_memos/`, `.agent/templates/`, and
  this `.agent/run_reports/` file are changed. No `src/**`, no
  `scripts/report-regression-local.mjs`, no `src/data/**`, no
  `src/lib/prompts.ts`, no API routes. Cannot alter generated report
  content, structure, evidence, streaming completion, or export
  behavior.
- **harness_used**: `no`
- **harness_command**: `n/a`
- **fixture_ids**: `n/a`
- **target_environment**: `n/a` (no run · no dev server started)
- **latest_run_id**: `n/a` (latest reference remains
  `20260713T014957Z_fixture-A` from AgentOps-3e-tune-2)
- **verdict**: `not_required`
- **exit_code**: `n/a`
- **artifact_paths**: `n/a`
- **report_char_count**: `n/a`
- **capture_scope**: `n/a`
- **fallback_used**: `n/a`
- **red_checks_failed**: `0`
- **amber_checks_failed**: `0`
- **cost_measured**: `no`
- **estimated_cost**: `n/a` (no LLM/API call)
- **duration_ms**: `n/a`
- **baseline_promoted**: `no` (this whole loop is about the promotion
  design; no promotion happened)
- **production_target_used**: `no`
- **reviewer_action_required**: `none beyond normal AgentOps
  checkpoints`
- **push_implication**: `normal process`

## Result headline

- **Baseline promotion design complete.** 3 deliverables landed:
  (1) 17-section design memo covering every requested topic, (2)
  optional concise checklist template under
  `.agent/templates/baseline_promotion_checklist.md`, (3) this
  dogfooded RUN_REPORT.
- **Zero code, zero run, zero LLM call, zero baseline file.** Baseline
  storage design proposed as a future path;
  `.agent/regression_baselines/`, `.agent/baselines/`, and
  `baselines/` all remain **non-existent**.
- **DECISION-eligible.**

## Files changed (this loop)

| file | change | committed |
|---|---|---|
| `.agent/tasks/2026-07-12_run_07_TASK.md` | new · 209 lines | ✅ `d68436c` |
| `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md` | new · 17-section memo (§1 Purpose · §2 current state · §3 8-term vocabulary · §4 why not auto-promote · §5 eligibility · §6 additional promotion · §7 storage design · §8 22-field metadata schema · §9 11-step workflow · §10 demotion + 4 statuses · §11 how regression uses baseline · §12 relation to 3f verdict states · §13 fixture expansion · §14 production deferral · §15 security/privacy · §16 10 open decisions · §17 recommendation) | ✅ `d68436c` |
| `.agent/templates/baseline_promotion_checklist.md` | new · concise checklist (~50 lines · candidate identification · verdict eligibility · safety+hygiene · governance · post-promotion) | ✅ `d68436c` |
| `.agent/run_reports/2026-07-12_run_07_RUN_REPORT.md` | new · this file | ⏳ pending |

`git diff --stat` of the impl commit:
```
 .agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md | 563 ++++++++
 .agent/tasks/2026-07-12_run_07_TASK.md                                  | 209 ++++
 .agent/templates/baseline_promotion_checklist.md                        |  50 +
 3 files changed, 822 insertions(+)
```

## Baseline promotion design summary

### Vocabulary (§3 · 8 terms)

- **regression run artifact** — 3 committed files under
  `.agent/regression_runs/<run-id>/` + scratchpad `report.md/png`
- **validated GREEN run** — a run artifact with `verdict=green`,
  `exit_code=0`, `fallback_used=false`, all checks pass; NOT a
  baseline by itself
- **official baseline** — a committed baseline file set with explicit
  human-approved DECISION
- **baseline candidate** — a validated GREEN eligible to enter
  promotion workflow
- **promoted baseline** — official baseline with
  `baseline_status=current` (at most one per fixture)
- **stale baseline** — current baseline whose
  `harness_script_commit` or `corpus_snapshot_date` is older than
  `main` HEAD; still valid, Codex flags drift
- **deprecated baseline** — invalidated because underlying
  assumptions shifted; not used for comparison
- **superseded baseline** — replaced by newer `current`; audit-only

### Why not auto-promote GREEN (§4 · 6 reasons)

1. One green run can be lucky
2. One fixture doesn't cover all roles
3. Baseline promotion affects future push decisions
4. Baseline changes should be auditable (DECISION-owned)
5. LLM outputs are nondeterministic
6. Baseline drift can hide regressions

### Eligibility criteria (§5)

Necessary conditions: `verdict=green`, `exit_code=0`, fixture id/version
known, `capture_scope != body_fallback`, `fallback_used=false`, all red
+ amber + fixture + operational checks pass, no production target, no
same-run promotion, no forbidden repo diff at run time, no unresolved
incident in RUN_REPORT, cost + duration within `$0.25` / `240000ms`
bounds.

### Additional promotion criteria (§6)

Sufficient conditions require: human approval (Bohao), ChatGPT review,
explicit DECISION naming the candidate `run_id`, comparison to previous
validated runs if any, artifact size sanity (`metadata.json ≤5KB`,
`structural_checks.json ≤10KB`, `verdict.md ≤3KB`), no full
report/screenshot committed unless separate storage-policy DECISION, no
secrets or real user data, no production target. Optional-recommended:
one stability re-run, later B-E runs, quote integrity check.

## Storage design (§7 · PROPOSED · NOT CREATED)

**Future path** (not created in this loop):
```
.agent/regression_baselines/
└── fixture-A/
    └── current/
        ├── baseline_metadata.json
        ├── baseline_verdict.md
        ├── baseline_structural_checks.json
        ├── source_run_id.txt
        ├── promotion_decision.md
        └── baseline_summary.md  (optional)
```

**Principles**:
- One `current/` per fixture. Superseded moves to
  `.agent/regression_baselines/fixture-<X>/<old-baseline-id>/`.
- Symmetric to `.agent/regression_runs/` layout.
- No full `report.md` in v1. No screenshots in v1.
- Lightweight, auditable, diff-friendly.

**Rejected alternative**: `.agent/regression_runs/baselines/` (nested)
— collapses runs-vs-baselines distinction.

## Metadata schema (§8 · 22 fields)

`baseline_metadata.json` fields (canonical order):
`baseline_id` · `fixture_id` · `fixture_version` · `source_run_id` ·
`source_commit_sha` · `promoted_at` · `promoted_by` ·
`promotion_decision_path` · `harness_script_commit` · `verdict` ·
`exit_code` · `capture_scope` · `fallback_used` · `report_char_count` ·
`report_length_soft_min` · `report_length_soft_max` · `duration_ms` ·
`corpus_snapshot_date` · `model_display` · `cost_measured` ·
`estimated_cost` · `production_target_used` · `baseline_status` ·
`supersedes_baseline_id` · `notes`.

Every field required (use `null` explicitly if unknown, never omit).

## Promotion workflow (§9 · 11 steps)

1. Identify candidate GREEN run by `run_id`.
2. Verify candidate metadata against §5 eligibility.
3. Verify artifacts exist + readable + within size bounds.
4. Compare to previous baseline if one exists.
5. Write TASK (yellow · scoped to `.agent/regression_baselines/…`).
6. Write promotion memo or RUN_REPORT `## Baseline promotion`
   subsection with all 22 metadata fields.
7. Create baseline files (only in this loop).
8. Create DECISION with `verdict=approve` naming `run_id` +
   `baseline_id`.
9. Human approval (Bohao only · per-turn explicit).
10. Push baseline files via standard cleanup push.
11. Update daily summary.

Guardrails: promotion must be its own loop; a harness run must never
auto-promote itself; baseline files must be created inside the
promotion loop, not elsewhere.

## Demotion / deprecation policy (§10)

Demotion triggers: fixture changes · harness logic changes · model
changes · prompt changes · report structure changes · corpus/source
promotion · evaluation checks changed · baseline artifact found flawed
· evidence/quote integrity bug found · production report format
diverges.

Statuses: `current` · `superseded` · `deprecated` · `invalidated`.

Only Bohao may demote (mirrors §17 skip-approval rule from
AgentOps-3f).

## Relation to AgentOps-3f verdict states (§12)

- `required_green` **can be green without an official baseline** — the
  current harness produces its own GREEN via thresholds.
- Baseline **strengthens confidence** but is not required for every
  green.
- `unavailable` **must never be treated as green** whether or not
  baseline exists.
- `required_red` **still blocks push** regardless of baseline.
- `required_amber` **still escalates** regardless of baseline.
- `skipped_with_reason` **remains Bohao-only**.

Subtlety: once comparison-based amber checks land (later loops), a run
could produce `required_amber` because of drift-from-baseline rather
than absolute-threshold failure. RUN_REPORT prose must call out which
kind.

## Open decisions (§16 · 10 items · for future DECISION resolution)

1. Direct promote in 3g-2 OR one stability re-run first in
   3g-stability?
2. Should there be one more stability re-run before promotion?
   (Executor: yes)
3. `.agent/regression_baselines/` OR `.agent/regression_runs/baselines/`?
   (Memo: former)
4. Should full `report.md` ever be committed? (Memo: no in v1)
5. Should screenshots ever be committed? (Memo: no in v1)
6. Should baseline require quote integrity first? (Memo: no)
7. Should B-E run before official baseline promotion? (Memo: no · A
   can baseline independently)
8. Who can demote a baseline? (Memo: Bohao only)
9. How often should baselines expire? (Memo: no time-based auto-expiry
   · flag stale on `harness_script_commit` / `corpus_snapshot_date`
   drift · deprecate only after human review)
10. Should baseline promotion update RUN_REPORT template? (Memo: no ·
    existing `baseline_promoted: yes/no` field is enough)

## Recommendation (§17)

- **Approve baseline promotion design.**
- **Do NOT promote a baseline in 3g.** Design-only.
- **Next loop should be either**:
  - **A. `AgentOps-3g-2`** — promote Fixture A GREEN run as first
    official baseline (direct promotion · no new generation · ≈ $0)
  - **B. `AgentOps-3g-stability`** — one more Fixture A stability
    re-run before promotion (adds ≈ $0.05 · one 90s local generation ·
    catches lucky-green risk)
- **Executor's mild preference: B first, then A.** Cheap insurance
  against lucky-green risk; a second data point strengthens the
  baseline. Direct promotion (A) also acceptable — scope narrow,
  demotion triggers documented (§10).

## Validation results

```
$ git diff --name-only origin/main..HEAD
.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md
.agent/tasks/2026-07-12_run_07_TASK.md
.agent/templates/baseline_promotion_checklist.md

$ git diff --name-only | grep -E '^(src/|scripts/report-regression-local\.mjs|\.agent/scripts/|\.agent/regression_runs/|\.agent/regression_fixtures/|\.agent/planner_reports/|package(-lock)?\.json|\.github/workflows/)' || echo "OK"
OK: no forbidden files

$ [ ! -d .agent/baselines ] && [ ! -d .agent/regression_baselines ] && [ ! -d baselines ] && echo "OK"
OK: no baseline dirs created
```

Exactly the 3 allowed files (TASK + memo + checklist) staged in impl
commit. RUN_REPORT to be added by the second commit. Nothing else.

## Forbidden-file audit · empty-diff sweep · full CLEAN

- **`scripts/report-regression-local.mjs`** — **untouched** (harness
  stable at `d393db9`)
- `src/**` — untouched (any file)
- `src/data/**` — untouched
- `src/lib/**` (including `prompts.ts`, `models-display.ts`) —
  untouched
- `src/app/api/**` — untouched
- `src/app/page.tsx` — untouched
- `.agent/scripts/**` — **untouched** (hard rule per AgentOps-2c
  Q3-Q8)
- `.agent/blockers.md` — untouched (BLK-0001/2/3 all `open`)
- `.agent/automation_queue.md` — untouched (QUEUE-0002 still
  `blocked_pending_human`)
- `.agent/regression_fixtures/**` — untouched (frozen)
- `.agent/regression_runs/**` — **untouched** (no new run · no edit)
- `.agent/planner_reports/**` — **not created**
- **`.agent/baselines/**`** — **NOT CREATED**
- **`.agent/regression_baselines/**`** — **NOT CREATED**
- **`baselines/**`** — **NOT CREATED**
- `.agent/policies/**` — untouched
- Pipeline repo (any file) — untouched (`HEAD b019786` unchanged)
- `sources.yaml`, `corpus/**`, `scripts/collector/**` — untouched
- `.github/workflows/**` — untouched
- `package.json`, `package-lock.json` — untouched (no new dep)
- `.env*` — untouched
- `vercel.json` — untouched
- Codex / Claude config files — untouched
- Production deployment config — untouched

## Confirmations · 26 items

| item | status |
|---|---|
| No baseline promotion | ✅ |
| No baseline files created | ✅ (no baseline dirs at all) |
| No `.agent/baselines/` created | ✅ |
| No `.agent/regression_baselines/` created | ✅ |
| No `baselines/` created | ✅ |
| No harness run | ✅ (no `node scripts/…`, no `npm run dev`) |
| No report generation | ✅ (no LLM API call from any script) |
| No LLM / API calls | ✅ (entirely file writes) |
| No A-E full-suite invocation | ✅ (Fixture A only reference; no run) |
| No production target | ✅ |
| No `scripts/report-regression-local.mjs` changes | ✅ (harness stable at `d393db9`) |
| No `.agent/scripts/**` changes | ✅ (hard rule) |
| No `src/**` changes | ✅ |
| No pipeline changes | ✅ (`b019786` unchanged) |
| No collector / corpus refresh | ✅ |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read | ✅ |
| No `.github/workflows/**` changes | ✅ |
| No `vercel.json` / `.vercel/**` changes | ✅ |
| No `.agent/policies/**` changes | ✅ |
| No push / no deploy | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains spec-only | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |

## Recommendation

- **Human + ChatGPT review** of the 17-section design memo + the
  concise checklist template.
- Then write **DECISION** for `2026-07-12_run_07`.
- Suggested DECISION direction (executor's opinion, not binding):
  - **verdict**: `approve` — memo is self-contained, schema is
    complete, workflow is executable, guardrails preserve every
    deferral (baseline, B-E, production, Codex planner
    implementation).
  - **human_approval_needed**: `yes`.
  - **Next default loop after 3g push/cleanup** — see §17 options:
    - **A. AgentOps-3g-2**: direct promotion of Fixture A GREEN as
      first official baseline (`≈ $0` · no new generation).
    - **B. AgentOps-3g-stability**: one Fixture A stability re-run
      before promotion (adds ≈ $0.05 · catches lucky-green risk).
  - **Executor's mild preference: B first**, then 3g-2. Direct
    promotion (A) also acceptable.
  - Explicitly DEFER: OpenAI API integration, `.agent/scripts/**`
    edits, `src/**` DOM markers, A-E full suite, production testing,
    Codex planner implementation, and BLK-0001 / 0002 / 0003
    resolution.

## Standing do-NOTs (unchanged from prior loops)

- Do NOT promote baseline.
- Do NOT create baseline files.
- Do NOT create `baselines/` / `.agent/regression_baselines/` /
  `.agent/baselines/`.
- Do NOT run Playwright.
- Do NOT run report generation.
- Do NOT call Anthropic/OpenAI.
- Do NOT run A-E full suite.
- Do NOT test production.
- Do NOT modify `scripts/report-regression-local.mjs`.
- Do NOT implement Codex planner.
- Do NOT create `.agent/planner_reports/`.
- Do NOT modify `.agent/scripts/**`.
- Do NOT modify `src/**`.
- Do NOT modify pipeline.
- Do NOT run collector.
- Do NOT refresh corpus.
- Do NOT modify GitHub Actions.
- Do NOT add dependencies.
- Do NOT modify `package.json` or `package-lock.json`.
- Do NOT push.
- Do NOT deploy.

## Stop condition · reached expected end state

RUN_REPORT written. Awaiting human review + DECISION for
`2026-07-12_run_07`. No push. No deploy. No harness run. No LLM call.
No baseline file created.
