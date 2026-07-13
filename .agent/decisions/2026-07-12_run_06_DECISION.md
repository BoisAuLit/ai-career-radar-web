# DECISION · AgentOps-3f · Regression verdict integration

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-12 22:35). Standing in for the
> ChatGPT reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-12_run_06_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-12_run_06_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-12_run_06_TASK.md`
- **loop**: `AgentOps-3f`
- **parent_loop**: `AgentOps-3e-tune-2` (`2026-07-12_run_05`)
- **impl_commit**: `7f1dcee`
- **run_report_commit**: `478586e`
- **files_reviewed**:
  - `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`
    (396 lines · 13 sections)
  - `.agent/templates/run_report_template.md` (modified · +40 lines ·
    `## Regression verdict` section appended before `## Constraints
    checked`)
  - `.agent/templates/regression_verdict_section.md` (new · 157 lines
    · standalone reusable snippet)
  - `.agent/templates/planner_regression_guidance.md` (new · 143
    lines · Codex planner 10-rule protocol)
  - `.agent/run_reports/2026-07-12_run_06_RUN_REPORT.md` (331 lines ·
    first document to consume the new section, dogfooded with
    `regression_required=no` / `verdict=not_required`)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — protocol integration that shapes every future RUN_REPORT
and daily planner. No push, no deploy pending explicit human approval
per turn.

## Reasoning summary

AgentOps-3f successfully integrates the working local regression
harness into the AgentOps operating protocol **without expanding
runtime scope**. The loop is design/protocol/template-only: it
creates a regression verdict design memo, updates the RUN_REPORT
template with a required `## Regression verdict` section, adds a
reusable `regression_verdict_section.md` snippet, and adds
`planner_regression_guidance.md` for Codex planner behavior. It
defines **six regression states**, when regression is required, push
implications, amber/red/unavailable handling, and Codex planner
rules. It correctly treats the latest Fixture A GREEN run as a
**validated run artifact**, not an official baseline. The RUN_REPORT
for this task also **dogfoods the new section** with
`regression_required=no` and `verdict=not_required` because this was
`.agent/`-template-only and not report-affecting. The task respected
boundaries: no harness run, no report generation, no LLM/API call,
no baseline promotion, no A-E expansion, no production target, no
`scripts/report-regression-local.mjs` change, no `.agent/scripts/**`
changes, no `src/**` changes, no pipeline changes, no
collector/corpus refresh, no push/deploy.

## Approved direction

- **Approve AgentOps-3f regression verdict integration.**
- **Keep the six-state vocabulary**:
  - `not_required`
  - `unavailable`
  - `required_green`
  - `required_amber`
  - `required_red`
  - `skipped_with_reason`
- **Keep** the RUN_REPORT `## Regression verdict` section.
- **Keep** the standalone `regression_verdict_section.md` snippet.
- **Keep** the Codex planner `planner_regression_guidance.md`.
- **Regression state must be explicit** for future RUN_REPORTs.
- **Report-affecting changes must not be pushed** without green
  regression or explicit human override.
- **Amber blocks push** until Human + ChatGPT review.
- **Red blocks push** until fix/revert.
- **Unavailable must never be represented as green.**
- **Latest GREEN run** (`20260713T014957Z_fixture-A`) is a
  **validated run artifact**, not an official baseline.
- **Do NOT promote baseline** in this task.
- **Do NOT run A-E full suite** in this task.
- **Do NOT test production** in this task.
- **Default next loop after push/cleanup**:
  **AgentOps-3g · baseline promotion design memo**.

## Initial answers to open decisions

Answering the 8 open decisions from design memo §12:

### 1. Should regression verdict section become mandatory for all RUN_REPORTs or only report-affecting tasks?

**Include the section in all non-trivial RUN_REPORTs.** For
doc/protocol-only work, set `regression_required=no` and explain why.
For very trivial cleanup, it may be brief but should not be omitted
if a RUN_REPORT exists. This is the safer default — consistency over
concision, and dogfooding continues (this RUN_REPORT itself did so).

### 2. Should the harness command be standardized now?

**Yes.** For v1 local Fixture A, the standard command is:
```bash
node scripts/report-regression-local.mjs
```
Do NOT alias to `npm run regression:report` in this loop — that
would touch `package.json` (currently forbidden). If aliasing is
wanted later, it needs its own TASK.

### 3. Should latest green run be referenced as validated run but not baseline?

**Yes.** `20260713T014957Z_fixture-A` is a **validated GREEN run
artifact**, not an official baseline. Use the phrase "validated run"
in daily summaries and planner reports. Reserve "baseline" for
`metadata.json.baseline_promoted=true`, which currently is always
`false`.

### 4. Should Codex planner consume committed metadata.json directly or human-written verdict summaries?

**Prefer both**: committed `metadata.json` is **authoritative** for
machine-readable fields (verdict, exit_code, capture_scope,
fallback_used, char counts, thresholds, git_commit_sha,
corpus_snapshot_date, model_display); human-written RUN_REPORT /
DECISION summaries provide **interpretation** (why amber is
calibration vs regression, why skipped_with_reason was approved,
etc.). If the two disagree, JSON wins; Codex should flag the
disagreement in the daily planner header for human review.

### 5. When should baseline promotion happen?

**Separate explicit loop after 3f**, preferably **AgentOps-3g
baseline promotion design memo first**, then a separate baseline
promotion decision if approved. Design first (no cost); then a
tiny promotion loop that writes the baseline reference file.

### 6. When should B-E fixtures be run?

**Later, gradually, after baseline policy is clarified.** Do NOT
run A-E full suite immediately. Recommended activation cadence:
one new fixture per loop, driven by real code changes touching that
fixture's archetype. Order preference: **B → C → D → E**.

### 7. Should amber ever be pushable with explicit override?

**Only with explicit human override recorded in DECISION, plus
follow-up fix/regression plan.** Default is **no push**. Amber
override must:
(a) name the specific amber check that failed,
(b) explain why the override is acceptable this time,
(c) queue a follow-up fix loop or acknowledge the tolerance as
    permanent (with justification).

### 8. Who owns regression skip approval?

**Bohao only.** Codex and Claude Code may **recommend**, but
cannot **approve** `skipped_with_reason`. This preserves the
human-only skip-approval rule from memo §3 and the do-NOTs from
prior loops.

## Risks found

1. **Protocol exists but enforcement is still human/Claude/Codex
   discipline, not automated.** Severity: **medium**. Nothing
   mechanically stops a bad push; the protocol relies on RUN_REPORT
   authorship discipline and human review.
2. **RUN_REPORT template integration reduces drift but does not
   mechanically prevent bad pushes.** Severity: **low-medium**.
   Follow-up: consider a lint/pre-commit hook in a later loop.
3. **Codex planner remains spec-only and is not implemented.**
   Severity: **low** (documented state), **medium** if we later
   forget to implement.
4. **Latest GREEN run is not an official baseline.** Severity:
   **none** (intended). Baseline promotion is a separate loop.
5. **Fixture A is the only real-run fixture.** Severity: **low**
   (intended). One-fixture-at-a-time is the plan.
6. **B-E fixture quality is untested by real generation.** Severity:
   **low-medium**. Text quality has been reviewed but the harness
   has not run against them yet.
7. **Production remains untested.** Severity: **medium** for release
   confidence, **low** for this protocol loop. Production probe is
   a separate DECISION.
8. **Amber override policy could be abused if not explicitly
   recorded.** Severity: **medium**. Enforced by DECISION-level
   audit: every AMBER push must have a DECISION that names the
   check and the reason.
9. **Unavailable state must not become a loophole.** Severity:
   **medium**. Codex rule 2 forbids marking green when unavailable;
   humans must not either.
10. **Future agents may skip the section unless template discipline
    is maintained.** Severity: **medium**. Countermeasure: the
    `new_run_report.py` helper reads from
    `run_report_template.md`, so newly scaffolded RUN_REPORTs will
    include the section by default.
11. **Baseline promotion still needs explicit policy.** Severity:
    **medium** for governance clarity. Addressed by
    AgentOps-3g next.
12. **No quote integrity check is integrated yet.** Severity: **low
    now** (not in scope for 3f), **medium later** (a report can
    include a fabricated JD quote that structural checks won't
    catch). Recorded as a `Later` item in the memo §13.
13. **BLK-0001 / BLK-0002 / BLK-0003 remain open and unaffected.**
    Severity: **none** for this loop (documented state), **medium**
    as standing project risk covered elsewhere.

## Required fixes

**`none`**

The four deliverables (design memo + updated template + reusable
snippet + planner guidance) are self-contained, reference each other
correctly, dogfood the new section in the RUN_REPORT, and preserve
every deferral (baseline, B-E, production). No follow-up code change
is needed to approve this run.

## Non-blocking followups

- **Push AgentOps-3f after human approval.**
- **Create/update daily summary after push.**
- **Next recommended loop**: **AgentOps-3g · baseline promotion
  design memo**.
- **AgentOps-3g** should define **how a validated GREEN run becomes
  an official baseline**: file location (`.agent/baselines/…` or
  inline `metadata.json` flag), promotion criteria (N consecutive
  greens, cross-fixture agreement, etc.), demotion triggers, storage
  discipline.
- **AgentOps-3g should NOT promote baseline directly** unless
  explicitly approved. The design memo comes first; actual promotion
  is a separate loop.
- **Do NOT run A-E full suite yet.**
- **Do NOT test production.**
- **Do NOT enable full automation.**
- **Do NOT implement Codex planner yet.**
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline.**
- **Do NOT introduce OpenAI API.**
- **Do NOT push until explicit human approval.**

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT run
Playwright. Do NOT run report generation. Do NOT call
Anthropic/OpenAI. Do NOT promote baseline. Do NOT run A-E full
suite. Do NOT test production. Do NOT modify
`scripts/report-regression-local.mjs`. Do NOT implement Codex
planner. Do NOT create `.agent/planner_reports/`. Do NOT modify
`.agent/scripts/**`. Do NOT modify `src/**`. Do NOT modify pipeline.
Do NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub
Actions. Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start
G2.1d. Do NOT resume full automation. Recommended next task after
push/cleanup is **AgentOps-3g · baseline promotion design memo**.

## Files reviewed

- `.agent/design_memos/2026-07-12_AgentOps-3f_regression_verdict_integration.md`
  — 13 sections cover Purpose, current harness state, six-state
  vocabulary, when required vs not vs not-sufficient, RUN_REPORT
  integration (21 fields), Codex planner integration (10 rules),
  push decision policy, baseline / fixture / production deferrals,
  template change list, 8 open decisions, and a §13 recommendation
  block. Each section is self-contained.
- `.agent/templates/run_report_template.md` — 40-line append before
  `## Constraints checked`. The insertion carries the 21 canonical
  fields plus a block-quoted push-implication rule list. Existing
  sections unchanged.
- `.agent/templates/regression_verdict_section.md` — 157-line
  standalone snippet. Same 21 fields, full 6-state vocabulary with
  1-line meanings, push rules mirrored from the memo, required /
  not-required / not-sufficient breakdown. Cross-references the
  design memo, the RUN_REPORT template, and the planner guidance.
- `.agent/templates/planner_regression_guidance.md` — 143-line
  Codex planner protocol. Read-only inputs, 10 rules, required
  daily-planner output shape (7 fields including `drift`), non-goals
  (never write, never run, never approve skip), change control.
- `.agent/run_reports/2026-07-12_run_06_RUN_REPORT.md` — 331 lines,
  first document to consume the new section (dogfooded with
  `regression_required=no`, `verdict=not_required`, reason recorded
  clearly). Full forbidden-file audit, 23-item confirmation table,
  comparison table against prior AgentOps-3 loops.

## Boundary confirmations · 22 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No harness run | ✅ (no `node scripts/…`, no `npm run dev`) |
| No report generation | ✅ (no LLM API call from any script) |
| No LLM / API calls | ✅ (this loop was entirely file writes) |
| No baseline promotion | ✅ (no `baselines/` path created) |
| No A-E expansion | ✅ (Fixture A only reference; no run) |
| No production target | ✅ (harness untouched; no non-localhost URL) |
| No `scripts/report-regression-local.mjs` changes beyond existing committed 3f scope | ✅ (0 changes in 3f; harness stable at `d393db9`) |
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
follow-up action is authorized until Bohao says "push AgentOps-3f".
