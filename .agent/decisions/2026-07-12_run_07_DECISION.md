# DECISION · AgentOps-3g · Baseline promotion design memo

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-13 00:10). Standing in for the
> ChatGPT reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-12_run_07_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-12_run_07_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-12_run_07_TASK.md`
- **loop**: `AgentOps-3g`
- **parent_loop**: `AgentOps-3f` (`2026-07-12_run_06`)
- **impl_commit**: `d68436c`
- **run_report_commit**: `c20a6f0`
- **files_reviewed**:
  - `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`
    (563 lines · 17 sections)
  - `.agent/templates/baseline_promotion_checklist.md` (~50 lines ·
    concise scannable checklist)
  - `.agent/run_reports/2026-07-12_run_07_RUN_REPORT.md` (394 lines ·
    dogfoods the 3f `## Regression verdict` section with
    `regression_required=no`, `verdict=not_required`)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — design/protocol memo that will govern how future GREEN runs
become official baselines. No push, no deploy pending explicit human
approval per turn.

## Reasoning summary

AgentOps-3g successfully **designs baseline promotion governance
without prematurely promoting a baseline**. The memo clearly
distinguishes a **regression run artifact**, **validated GREEN run**,
**official baseline**, **baseline candidate**, **promoted baseline**,
**stale baseline**, **deprecated baseline**, and **superseded
baseline**. It defines eligibility criteria, additional promotion
criteria, storage design, a **22-field metadata schema**, an **11-step
promotion workflow**, demotion/deprecation policy, relation to
AgentOps-3f verdict states, fixture expansion policy, production
baseline deferral, and security/privacy constraints. The loop also
adds a concise baseline promotion checklist template. The RUN_REPORT
dogfoods the new 3f `## Regression verdict` section with
`regression_required=no`, `verdict=not_required`, and
`push_implication=normal process` because this is
design/protocol-only and not report-affecting. The task respected
boundaries: no baseline promotion, no baseline files created, no
`.agent/regression_baselines/` directory, no harness run, no report
generation, no LLM/API call, no production target, no A-E expansion,
no `scripts/report-regression-local.mjs` changes, no
`.agent/scripts/**` changes, no `src/**` changes, no pipeline changes,
no collector/corpus refresh, no push/deploy.

## Approved direction

- **Approve AgentOps-3g baseline promotion design.**
- **Keep the distinction** between validated GREEN run and official
  baseline.
- **Treat `20260713T014957Z_fixture-A` as a validated GREEN run
  artifact**, not an official baseline.
- **Keep baseline promotion as a separate explicit loop.**
- **Do NOT promote baseline in AgentOps-3g.**
- **Do NOT create baseline files in AgentOps-3g.**
- **Keep proposed future storage path**:
  `.agent/regression_baselines/fixture-A/current/`.
- **Keep the 22-field baseline metadata schema.**
- **Keep demotion statuses**:
  - `current`
  - `superseded`
  - `deprecated`
  - `invalidated`
- **Keep the baseline promotion checklist template.**
- **Default next loop after push/cleanup**: **AgentOps-3g-stability**
  — one more Fixture A stability re-run before promotion.
- **After a clean stability re-run**, **AgentOps-3g-2** can promote
  Fixture A GREEN as the first official baseline.
- **Do NOT run A-E full suite yet.**
- **Do NOT test production.**
- **Do NOT enable full automation.**
- **Do NOT implement Codex planner yet.**

## Initial answers to open decisions

Answering the 10 open decisions from design memo §16:

### 1. Should Fixture A GREEN be promoted immediately after this design?

**Not immediately.** Prefer one stability re-run first, then promote
in a separate **AgentOps-3g-2** loop if clean. The extra ≈ $0.05 and
~90 s of local generation is cheap insurance against lucky-green risk
(memo §4 reason 1). If the re-run also lands GREEN with
`capture_scope=main section`, `fallback_used=false`, and
`report_char_count` within ±30% of 11773, we have two data points and
3g-2 becomes very safe.

### 2. Should there be one more stability re-run before promotion?

**Yes.** One Fixture A stability re-run is cheap insurance against
lucky-green risk. Same decision as #1.

### 3. Should baseline files live under `.agent/regression_baselines/` or `.agent/regression_runs/baselines/`?

**Use `.agent/regression_baselines/fixture-A/current/`** for official
baselines. Keep `.agent/regression_runs/` for run artifacts. The two
directories serve different governance purposes (runs are transient
data; baselines are promoted state); nesting collapses the
distinction.

### 4. Should full `report.md` ever be committed?

**Not in v1.** Keep full `report.md` local/scratchpad unless a
separate storage policy DECISION approves it. Reconsider if we later
need round-trip comparison of exact prose (unlikely in v1).

### 5. Should screenshots ever be committed?

**Not in v1.** Keep screenshots local/scratchpad unless a separate
storage policy DECISION approves it. Binary diff churn is expensive;
scratchpad is enough for eyeballing.

### 6. Should baseline require quote integrity first?

**Not required for the first narrow Fixture A baseline**, but quote
integrity should be a later quality upgrade before broader baseline
confidence. Gating A on quote integrity would delay the whole
governance step; once quote integrity ships, retroactively invalidate
baselines that fail it.

### 7. Should B-E run before official baseline promotion?

**Not required for a narrow Fixture A baseline.** B-E should be run
gradually later, one fixture per loop. Fixture A can baseline
independently; B-E baselines follow their own runs. Recommended order
from AgentOps-3f: **B → C → D → E**.

### 8. Who can demote a baseline?

**Bohao via explicit DECISION.** Claude/Codex may **recommend**
demotion, but cannot **approve** it. This mirrors the skip-approval
rule from AgentOps-3f: baseline governance changes are human-owned.

### 9. How often should baselines expire?

**Baselines should become stale** when fixture, harness, model,
prompt, report structure, corpus/source promotion, or checks change.
**Time-based expiry can be considered later.** Automatic "stale" flag
on `harness_script_commit` or `corpus_snapshot_date` drift; automatic
"deprecated" only after human review. No calendar-driven expiry in
v1.

### 10. Should baseline promotion update RUN_REPORT template?

**Not yet.** First promote design and one baseline; then update
templates if repeated baseline workflows need a standard section. The
existing `baseline_promoted: yes/no` field in the 3f `## Regression
verdict` section is enough for now.

## Risks found

1. **Baseline policy is designed but not yet enforced by
   automation.** Severity: **medium**. Enforcement relies on
   human/Claude/Codex discipline; no mechanical gate. Future
   pre-commit hook could help.
2. **No official baseline exists yet.** Severity: **none** (intended).
   3g is design-only; promotion is the next loop.
3. **The latest GREEN run is only Fixture A.** Severity: **low**
   (intended). B-E gradual scale-out.
4. **A single GREEN run may be lucky.** Severity: **medium** for
   baseline confidence. Mitigation: 3g-stability re-run before
   promotion.
5. **B-E fixtures have not been real-run.** Severity: **low** (known;
   gradual plan).
6. **Production has not been tested.** Severity: **medium** for
   release confidence, **low** for governance loop.
7. **The proposed baseline path is not yet created.** Severity:
   **none** (intended). Creation is 3g-2.
8. **Full report/screenshot storage remains deferred.** Severity:
   **low**. Scratchpad-only policy holds; no diff bloat.
9. **Quote integrity is not yet part of the baseline criteria.**
   Severity: **low-medium**. Follow-up loop later.
10. **Baseline demotion still relies on human process.** Severity:
    **medium** for latency; Bohao-only rule is by design.
11. **Future agents may confuse validated GREEN with official
    baseline if summaries are imprecise.** Severity: **medium**.
    Mitigation: 8-term vocabulary in memo §3 is explicit; daily
    summaries and planner reports must use it verbatim.
12. **Baseline promotion should not be bundled with unrelated
    changes.** Severity: **medium** for governance clarity. Enforced
    by promotion workflow §9 rule that promotion must be its own
    loop.
13. **BLK-0001 / BLK-0002 / BLK-0003 remain open and unaffected.**
    Severity: **none** for this loop (documented state), **medium**
    as standing project risk covered elsewhere.

## Required fixes

**`none`**

The design memo is self-contained; the schema is complete; the
workflow is executable; guardrails preserve every deferral. The
checklist template is concise and scannable. The RUN_REPORT
correctly dogfoods the 3f section. No follow-up code change is needed
to approve this run.

## Non-blocking followups

- **Push AgentOps-3g after human approval.**
- **Create/update daily summary after push.**
- **Next recommended loop**: **AgentOps-3g-stability** · one Fixture
  A stability re-run.
- If the stability re-run is GREEN, then **AgentOps-3g-2** can promote
  Fixture A as first official baseline.
- **Do NOT promote baseline in this task.**
- **Do NOT create baseline files in this task.**
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
`.agent/regression_baselines/`. Do NOT run Playwright. Do NOT run
report generation. Do NOT call Anthropic/OpenAI. Do NOT run A-E full
suite. Do NOT test production. Do NOT modify
`scripts/report-regression-local.mjs`. Do NOT implement Codex planner.
Do NOT create `.agent/planner_reports/`. Do NOT modify
`.agent/scripts/**`. Do NOT modify `src/**`. Do NOT modify pipeline.
Do NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub
Actions. Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start
G2.1d. Do NOT resume full automation. Recommended next task after
push/cleanup is **AgentOps-3g-stability** · one Fixture A stability
re-run before baseline promotion.

## Files reviewed

- `.agent/design_memos/2026-07-12_AgentOps-3g_baseline_promotion_design.md`
  — 17 sections cover Purpose, current state, 8-term vocabulary, why
  not auto-promote (6 reasons), eligibility criteria (~14 conditions),
  additional promotion criteria + optional-recommended, storage
  design (proposed but not created), 22-field metadata schema,
  11-step promotion workflow with guardrails, demotion policy with
  4 statuses + 10 triggers, how future regression uses baseline
  (v1 = metadata/structure diff; semantic diff deferred), relation
  to AgentOps-3f 6 verdict states, fixture expansion policy,
  production baseline deferral, security/privacy considerations,
  10 open decisions, and a §17 recommendation offering A (direct
  promote) or B (stability re-run first).
- `.agent/templates/baseline_promotion_checklist.md` — concise
  scannable checklist covering candidate identification, verdict
  eligibility, safety/hygiene, governance, and post-promotion.
  Every item has a checkbox; the whole list fits on one screen.
- `.agent/run_reports/2026-07-12_run_07_RUN_REPORT.md` — 394 lines;
  **first RUN_REPORT to consume the AgentOps-3f `## Regression
  verdict` section** (helper `new_run_report.py` scaffolded it
  automatically). Dogfooded with `regression_required=no`,
  `verdict=not_required`, `push_implication=normal process`. Full
  forbidden-file audit, 26-item confirmation table.

## Boundary confirmations · 24 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No baseline promotion | ✅ |
| No baseline files created | ✅ |
| No `.agent/baselines/` created | ✅ |
| No `.agent/regression_baselines/` created | ✅ |
| No `baselines/` created | ✅ |
| No harness run | ✅ (no `node scripts/…`, no `npm run dev`) |
| No report generation | ✅ (no LLM API call from any script) |
| No LLM / API calls | ✅ (entirely file writes) |
| No A-E full-suite invocation | ✅ (Fixture A only reference; no run) |
| No production target | ✅ (harness untouched; no non-localhost URL) |
| No `scripts/report-regression-local.mjs` changes | ✅ (harness stable at `d393db9`) |
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
follow-up action is authorized until Bohao says "push AgentOps-3g".
