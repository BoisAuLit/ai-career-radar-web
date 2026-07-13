# RUN_REPORT · AgentOps-3f · Regression verdict integration

## Metadata

- **task_id**: `2026-07-12_run_06`
- **date**: `2026-07-12`
- **loop**: `AgentOps-3f`
- **parent_loop**: `AgentOps-3e-tune-2` (`2026-07-12_run_05`)
- **TASK**: `.agent/tasks/2026-07-12_run_06_TASK.md`
- **design memo**: `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`
- **impl_commit**: `7f1dcee`
- **repo**: `/Users/bohaoli/Desktop/ai-career-radar-web`
- **branch**: `main`
- **base_commit_before**: `e5723b0`
- **base_commit_after**: `7f1dcee` (impl only; RUN_REPORT commit to follow)

## Regression verdict

> This RUN_REPORT is the first document to consume the protocol it
> introduces. The loop itself is `.agent/`-only and touches no
> report-affecting file, so `regression_required = no`.

- **regression_required**: `no`
- **reason_required_or_not**: This is a protocol / design / template
  integration loop. Only `.agent/tasks/`, `.agent/design_memos/`,
  `.agent/templates/`, and this `.agent/run_reports/` file are
  changed. No `src/**`, no `scripts/report-regression-local.mjs`, no
  `src/data/**`, no `src/lib/prompts.ts`, no API routes. The changes
  cannot alter generated report content, structure, evidence,
  streaming completion, or export behavior.
- **harness_used**: `no`
- **harness_command**: `n/a`
- **fixture_ids**: `n/a`
- **target_environment**: `n/a` (no run · localhost dev server not
  started)
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
- **estimated_cost**: `n/a` (no LLM/API call made this loop)
- **duration_ms**: `n/a`
- **baseline_promoted**: `no`
- **production_target_used**: `no`
- **reviewer_action_required**: `none beyond normal AgentOps
  checkpoints`
- **push_implication**: `normal process`

## Result headline

- **Protocol integration complete.** 4 deliverables landed:
  (1) 13-section design memo, (2) `## Regression verdict` section
  appended to the existing `run_report_template.md`, (3) new
  standalone reusable snippet, (4) new Codex planner regression
  guidance file.
- **Zero code, zero run, zero LLM call.** No `scripts/` change, no
  `src/**` change, no `.agent/scripts/**` change.
- **DECISION-eligible.**

## Files changed (this loop)

| file | change | committed |
|---|---|---|
| `.agent/tasks/2026-07-12_run_06_TASK.md` | new · 172 lines | ✅ `7f1dcee` |
| `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md` | new · 13-section memo (§1 Purpose · §2 harness state · §3 vocabulary · §4 required-vs-not · §5 RUN_REPORT integration · §6 planner integration · §7 push policy · §8 baseline deferred · §9 fixtures deferred · §10 production deferred · §11 template changes · §12 open decisions · §13 recommendation) | ✅ `7f1dcee` |
| `.agent/templates/run_report_template.md` | modified · +40 lines (append `## Regression verdict` section before `## Constraints checked`) | ✅ `7f1dcee` |
| `.agent/templates/regression_verdict_section.md` | new · standalone reusable snippet with all fields + vocabulary + push rules + when-required guidance | ✅ `7f1dcee` |
| `.agent/templates/planner_regression_guidance.md` | new · Codex planner regression protocol (10 rules · required output shape · interaction rules · non-goals · change control) | ✅ `7f1dcee` |
| `.agent/run_reports/2026-07-12_run_06_RUN_REPORT.md` | new · this file | ⏳ pending |

`git diff --stat` summary of the impl commit:
```
 .agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md | 396 ++++++++++
 .agent/tasks/2026-07-12_run_06_TASK.md                                       | 172 ++++
 .agent/templates/planner_regression_guidance.md                              | 143 ++++
 .agent/templates/regression_verdict_section.md                               | 157 ++++
 .agent/templates/run_report_template.md                                      |  40 +
 5 files changed, 908 insertions(+)
```

## Exact protocol changes

### Change 1 · Regression state vocabulary

Six values, defined identically across design memo §3 and both
template files. Every future RUN_REPORT + planner report must use
exactly one:

| state | meaning (1-line) | push implication |
|---|---|---|
| `not_required` | Task cannot affect report | normal process; explain reason |
| `unavailable` | Should have run but couldn't | no automatic push; human decides |
| `required_green` (short: `green`) | Ran, verdict green, no red, no amber | eligible after human approval |
| `required_amber` (short: `amber`) | Ran, verdict amber, no red | no push until reviewed |
| `required_red` (short: `red`) | Ran, verdict red | no push; fix or revert first |
| `skipped_with_reason` | Required but human-approved skip | conditional; recorded reason mandatory |

### Change 2 · RUN_REPORT `## Regression verdict` section

Added to `.agent/templates/run_report_template.md` (existing file,
+40 lines, appended immediately before `## Constraints checked`).
21 canonical fields in fixed order (see design memo §5). Full field
list also in `.agent/templates/regression_verdict_section.md` as a
standalone paste-able snippet.

Fields (canonical order):
`regression_required` · `reason_required_or_not` · `harness_used` ·
`harness_command` · `fixture_ids` · `target_environment` ·
`latest_run_id` · `verdict` · `exit_code` · `artifact_paths` ·
`report_char_count` · `capture_scope` · `fallback_used` ·
`red_checks_failed` · `amber_checks_failed` · `cost_measured` ·
`estimated_cost` · `duration_ms` · `baseline_promoted` ·
`production_target_used` · `reviewer_action_required` ·
`push_implication`.

Rules embedded in the template block-quote (do not rewrite; identical
to design memo §7):

- `required_green` + no other blockers → push eligible after human
  approval.
- `required_amber` → no push until reviewed.
- `required_red` → no push; fix / revert first.
- `unavailable` → no automatic push; human decides.
- `not_required` → normal process; explain reason.
- `skipped_with_reason` → only if human explicitly approved skip.

### Change 3 · Codex planner regression guidance

New file `.agent/templates/planner_regression_guidance.md` codifying
the 10-rule protocol (design memo §6):

1. Read latest regression state if available; treat missing as
   `unavailable`.
2. Do not mark `green` if `unavailable` / `skipped_with_reason` /
   > 24h stale on report-affecting queue.
3. Recommend fix / revert over new feature work when latest required
   regression is `red`.
4. Escalate `amber` with explicit "amber blocking push" flag at top
   of daily planner header.
5. May proceed when regression is `not_required` for doc-only work.
6. Include `Regression requirement: … and why.` in each recommended
   next task.
7. Include verbatim stop-condition sentence in every daily planner
   report: `Do not push report-affecting changes without green
   regression or explicit human override.`
8. Committed `metadata.json` is authoritative over human-written
   RUN_REPORT prose when they disagree.
9. Never trigger a regression run.
10. Flag drift: if `metadata.json.git_commit_sha` is > 1 loop behind
    current `main` HEAD, note staleness in daily planner header.

Additional guardrails in the file:
- Codex may only read; may never write to the repo.
- Codex may recommend a run; never triggers one.
- Codex must never mark a red as "acceptable" without a linked human
  DECISION.
- Codex must never bump `baseline_promoted` — human-owned promotion
  loop only.
- Codex must include a `## Regression state` section in daily planner
  output with 7 required fields.

### Change 4 · Deferrals stated explicitly

Design memo §§8-10 formalize three deferrals that already existed
implicitly:

- **§8 Baseline**: No baseline promotion in 3f. Latest green is a
  "validated run artifact", not an official baseline. Baseline
  promotion needs its own TASK + RUN_REPORT + DECISION. Do not create
  `baselines/` in this loop.
- **§9 Fixture expansion**: Fixture A only. B-E not yet real-run.
  Gradual scale-out, one fixture per loop. Recommended order:
  B → C → D → E.
- **§10 Production testing**: Harness stays localhost-only. Any
  production probe requires a separate explicit DECISION with cost
  bounding, rate-limit awareness, read-only guarantee, and explicit
  per-session human approval.

## Validation results

```
$ git diff --name-only origin/main..HEAD
.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md
.agent/tasks/2026-07-12_run_06_TASK.md
.agent/templates/planner_regression_guidance.md
.agent/templates/regression_verdict_section.md
.agent/templates/run_report_template.md

$ git diff --name-only | grep -E '^(src/|scripts/report-regression-local\.mjs|\.agent/scripts/|\.agent/regression_runs/|\.agent/regression_fixtures/|\.agent/planner_reports/|package(-lock)?\.json|\.github/workflows/)' || echo "OK"
OK: no forbidden files
```

Exactly the 5 allowed files (TASK + memo + 3 template files) staged.
Nothing else. RUN_REPORT to be added by the second commit.

## Forbidden-file audit · empty-diff sweep · full CLEAN

- **`scripts/report-regression-local.mjs`** — **untouched** (harness
  stable at `d393db9`)
- `src/**` — untouched (any file)
- `src/data/**` — untouched
- `src/lib/**` (including `prompts.ts`, `models-display.ts`) —
  untouched
- `src/app/api/**` (including `generate-report/route.ts`,
  `eval-report/route.ts`, `parse-pdf/route.ts`) — untouched
- `src/app/page.tsx` — untouched
- `.agent/scripts/**` — **untouched** (hard rule per AgentOps-2c
  Q3-Q8)
- `.agent/blockers.md` — untouched (BLK-0001/2/3 all `open`)
- `.agent/automation_queue.md` — untouched (QUEUE-0002 still
  `blocked_pending_human`)
- `.agent/regression_fixtures/**` — untouched (frozen)
- `.agent/regression_runs/**` — **untouched** (no new run in this
  loop)
- `.agent/planner_reports/**` — **not created** (Codex planner not
  implemented in this loop)
- `.agent/policies/**` — untouched (defer to a separate policy loop
  per §12 open decisions)
- Pipeline repo (any file) — untouched (`HEAD b019786` at start AND
  end)
- `sources.yaml`, `corpus/**`, `scripts/collector/**` — untouched
- `.github/workflows/**` — untouched
- `package.json`, `package-lock.json` — untouched (no new dep)
- `.env*` — untouched
- `vercel.json` — untouched
- Codex / Claude config files — untouched
- Production deployment config — untouched
- Baseline promotion path — not created

## Confirmations · 21 items

| item | status |
|---|---|
| No harness run | ✅ (no `node scripts/…`, no `npm run dev`) |
| No report generation | ✅ (no LLM API call from any script) |
| No LLM / API calls | ✅ (this loop is entirely file writes) |
| No baseline promotion | ✅ |
| No A-E full-suite invocation | ✅ (Fixture A only reference; no run) |
| No production target | ✅ (no non-localhost URL touched) |
| No `scripts/report-regression-local.mjs` change | ✅ (harness stable at `d393db9`) |
| No `.agent/scripts/**` change | ✅ (hard rule) |
| No `src/**` change | ✅ |
| No pipeline change | ✅ (`b019786` unchanged start AND end) |
| No collector / corpus refresh | ✅ |
| No `package.json` / lockfile change | ✅ |
| No `.env*` read | ✅ |
| No `.github/workflows/**` change | ✅ |
| No `vercel.json` / `.vercel/**` change | ✅ |
| No `.agent/policies/**` change | ✅ (deferred to separate loop) |
| No push / no deploy | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains a spec (not code) | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |
| `.agent/regression_runs/` unchanged | ✅ (still only the 3 runs from 3e / 3e-tune / 3e-tune-2) |

## Comparison vs prior AgentOps-3 loops

| loop | verdict | runtime file change | run count | LLM cost |
|---|---|---|---|---|
| AgentOps-3a (design memo) | approve | 0 | 0 | $0 |
| AgentOps-3b (Codex planner spec) | approve | 0 | 0 | $0 |
| AgentOps-3c (5 fixtures A-E) | approve | 0 | 0 | $0 |
| AgentOps-3d (harness design) | approve | 0 | 0 | $0 |
| AgentOps-3e (harness prototype) | approve · AMBER | +458 lines script | 1 run | ≈ $0.05 |
| AgentOps-3e-tune (narrow capture) | approve · AMBER | +202 / −6 script | 1 run | ≈ $0.05 |
| AgentOps-3e-tune-2 (length band) | approve · GREEN | +10 / −1 script | 1 run | ≈ $0.05 |
| **AgentOps-3f (this loop)** | **pending DECISION** · protocol only | **0** | **0** | **$0** |

## Recommendation

- **Human + ChatGPT review** of the design memo (13 sections) +
  the three template files.
- Then write **DECISION** for `2026-07-12_run_06`.
- Suggested DECISION direction (executor's opinion, not binding):
  - **verdict**: `approve` — the four artifacts are self-contained,
    reference each other correctly, and preserve every deferral
    Bohao has been carrying (baseline, B-E, production).
  - **human_approval_needed**: `yes`.
  - **Next default loop after 3f push/cleanup** — recommend one of:
    - **A. Baseline promotion design/decision** — draft a proposal
      for promoting `20260713T014957Z_fixture-A` (or a fresh
      equivalent) to `default_baseline`. Design-only memo first,
      then a separate loop to actually create the baseline file.
      No harness run.
    - **B. One stability re-run of Fixture A** — sanity check that
      length band + capture stay green across two runs before
      promoting a baseline. Yellow, one run, ≈ $0.05.
    - **C. Gradual Fixture B run** — activate Fixture B with its
      own TASK + RUN_REPORT + DECISION. Yellow, one run, ≈ $0.05.
  - Executor's mild preference: **A first** (baseline promotion
    design). It costs nothing, moves the process forward, and any
    later stability run or Fixture B run would then feed into the
    baseline decision rather than sitting orphaned.
  - Explicitly DEFER: OpenAI API integration, `.agent/scripts/**`
    edits, `src/**` DOM markers, A-E full suite, production
    testing, Codex planner implementation, and BLK-0001 / 0002 /
    0003 resolution.

## Standing do-NOTs (unchanged from prior loops)

- Do NOT run Playwright.
- Do NOT run report generation.
- Do NOT call Anthropic/OpenAI.
- Do NOT promote baseline.
- Do NOT run A-E full suite.
- Do NOT test production.
- Do NOT click Eval.
- Do NOT modify `scripts/report-regression-local.mjs`.
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
`2026-07-12_run_06`. No push. No deploy. No harness run. No LLM call.
