# DECISION · AgentOps-5c-integrate · Quote-integrity harness-envelope integration

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-22). Standing in for the ChatGPT
> reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-22_run_02_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-22_run_02_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-22_run_02_TASK.md`
- **loop**: `AgentOps-5c-integrate`
- **parent_loop**: `AgentOps-5d-R2` (`2026-07-22_run_01`)
- **impl_commit**: `22b7719` (Integrate quote integrity into regression envelope)
- **run_report_commit**: `bbdaa3f` (Add RUN_REPORT 2026-07-22_run_02)
- **files_reviewed**:
  - `.agent/tasks/2026-07-22_run_02_TASK.md`
  - `scripts/report-regression-local.mjs` (modified · +158 / −3 · additive)
  - `.agent/design_memos/2026-07-22_AgentOps-5c-integrate_quote_integrity_harness_envelope.md`
    (19-section findings memo)
  - `.agent/quote_integrity_runs/20260722T_AGENTOPS5C_INTEGRATE_fixture-B/quote_integrity_summary.json`
    (~6 KB · v0.3-r2-terminal-punctuation · dry-run reproduces 5d-R2)
  - `.agent/run_reports/2026-07-22_run_02_RUN_REPORT.md`
    (dogfoods 3f `## Regression verdict` with `regression_required=no`,
    `verdict=not_required`)
  - `.agent/decisions/2026-07-22_run_01_DECISION.md`
    (5d-R2 approve · R1 keep RED · R2 ships · read-only)
  - `scripts/quote-integrity-check.mjs`
    (unchanged this loop · read-only reference)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — DECISION confirms the harness-envelope integration ships
telemetry-only and shapes the AgentOps-5d generation scope. No push,
no deploy pending explicit human approval per turn.

## Required fixes

**`none`**

## Reasoning summary

AgentOps-5c-integrate successfully wired
`scripts/quote-integrity-check.mjs` into
`scripts/report-regression-local.mjs` as **telemetry-only**
harness-envelope integration. The change is **additive and
non-blocking**: it writes `quote_integrity_summary.json`, records
`quote_integrity` metadata, adds quote-integrity structural checks,
and adds a `## Quote integrity` section to `verdict.md`, while
preserving existing report-regression exit-code semantics. Quote
integrity **RED does not yet change** the legacy 25-check regression
verdict or process exit code. Syntax checks passed for both the
checker and the harness. A checker-only dry-run reproduced the
5d-R2 result exactly: Microsoft `jd_000173` remains AMBER via
`terminal_punctuation_only`, NVIDIA `jd_000201` remains RED via
`unmatched_ellipsis_fragment`, **R1 is preserved, R2 is preserved**.

No generation, no report regression harness generation run, no
Playwright, no LLM/API calls, no OpenAI API, no baseline mutation,
no regression run mutation, no fixture mutation, no `src` changes,
no `.agent/scripts` changes, no pipeline changes, no uploaded PDFs,
no `report.md` or screenshots committed, no push/deploy, and cost
**$0**.

## Approved direction

- **Approve AgentOps-5c-integrate.**
- **Accept `scripts/report-regression-local.mjs` quote-integrity
  envelope integration.**
- **Accept quote integrity as telemetry-only** in this integration
  stage.
- **Accept that `quote_integrity_verdict` does not yet affect
  harness exit code.**
- **Accept that promoting quote integrity to blocking requires a
  separate DECISION.**
- **Accept the optional dry-run artifact** as a non-generation
  validation artifact.
- **Keep R1 grammar bridging RED.**
- **Keep R2 terminal-punctuation AMBER micro-tier narrow** (8 strict
  conditions).
- **Keep no LLM judge.**
- **Keep no edit-distance matching.**
- **Keep no semantic equivalence.**
- **Keep A/B baselines grandfathered** and do NOT mutate them.
- **Do NOT retroactively modify 5c or 5d-R2 artifacts.**
- **Do NOT ingest uploaded PDFs.**
- **Do NOT introduce OpenAI API.**

## Integration summary

- **integration_file**: `scripts/report-regression-local.mjs`
- **checker_file**: `scripts/quote-integrity-check.mjs` (unchanged
  this loop)
- **integration_point**: after scratch `report.md` is written (right
  after `writeFile(scratchReportPath, reportText, "utf8")` in the
  harness main flow)
- **new helper**: `runQuoteIntegrity({ repoRoot, reportPath,
  reportSaved, corpusPath, outPath, fixtureId, runId })`
- **invocation**:
  ```
  node scripts/quote-integrity-check.mjs \
    --report <scratchReportPath> \
    --corpus <REPO_ROOT>/src/data/web_bundle.json \
    --out    <runDir>/quote_integrity_summary.json \
    --fixture <fixtureId> \
    --source-run-id <runId>
  ```
  via `spawnSync` with `process.execPath` (matches the Node running
  the harness).
- **output path for future generated runs**:
  `<runDir>/quote_integrity_summary.json` under the same
  `.agent/regression_runs/<runId>/` directory as the existing
  `metadata.json` / `structural_checks.json` / `verdict.md`.
- **`metadata.json`** now has a `quote_integrity` block:
  `enabled` · `checker_path` · `summary_path` · `verdict` ·
  `schema_version` · `counts` · `red_reasons` · `amber_reasons` ·
  `blocking_mode: "telemetry_only"`.
- **`metadata.artifact_policy.committed`** includes
  `"quote_integrity_summary.json"`.
- **`structural_checks.json`** gets 5 new
  `bucket: "quote_integrity"` entries, all `level: "amber"`:
  `quote_integrity_checker_executed` ·
  `quote_integrity_summary_written` ·
  `quote_integrity_verdict_recorded` ·
  `quote_integrity_red_reasons_count` (detail-only) ·
  `quote_integrity_amber_reasons_count` (detail-only).
- **`verdict.md`** gets a `## Quote integrity` section with verdict,
  summary path, red/amber counts, and an explicit prose statement
  that blocking mode is telemetry-only.
- **`blocking_mode`**: **`telemetry_only`**.
- **harness exit-code semantics**: **unchanged**.

## Telemetry-only policy

Quote integrity remains **telemetry-only** in this integration loop.
A `quote_integrity_verdict` of `red` must be recorded, surfaced, and
summarized, but it must **not** yet alter the legacy regression
GREEN/AMBER/RED rollup or process exit code. Promotion to blocking
requires a **separate DECISION** after controlled A/B generation
proves the full run path.

## Validation summary

- `node --check scripts/quote-integrity-check.mjs`: **OK**
- `node --check scripts/report-regression-local.mjs`: **OK**
- Optional checker-only dry-run: **reproduced 5d-R2 exactly**
- dry-run `quote_integrity_verdict`: **`red`**
- Microsoft `jd_000173`: **AMBER `terminal_punctuation_only`**
- NVIDIA `jd_000201`: **RED `unmatched_ellipsis_fragment`**
- generated report count: **0**
- harness generation run count: **0**
- cost: **$0**

## What remains untested

- Full round-trip Playwright generation → scratchpad `report.md` →
  quote-integrity invocation → metadata/verdict artifact write.
- `runQuoteIntegrity` wrapper in-situ inside
  `scripts/report-regression-local.mjs`.
- `verdict.md` `## Quote integrity` section in a real generated run.
- `metadata.json` `quote_integrity` block in a real generated run.
- `structural_checks.json` quote_integrity entries in a real
  generated run.
- Controlled A/B generation with checker attached.
- Quote integrity remains telemetry-only, not blocking.

## Recommended next loop

**AgentOps-5d · controlled A + B generation with quote-integrity
checker attached.**

Scope:

- Run **Fixture A generation first**.
- Verify the harness in-situ wrapper writes:
  - `quote_integrity_summary.json`
  - `metadata.json` `quote_integrity` block
  - `structural_checks.json` quote_integrity checks
  - `verdict.md` `## Quote integrity` section
- **If Fixture A run fails** due to wrapper/harness integration
  error, **stop and do not run Fixture B**.
- **If Fixture A completes** and quote-integrity artifacts are
  written, run **Fixture B**.
- Cost estimate: approximately **~$0.10 total** if both A and B run.
- **No baseline mutation.**
- **No baseline promotion.**
- **No C/D/E.**
- **No A-E full suite.**
- **No uploaded PDFs.**
- **No LLM judge.**
- **No edit-distance.**
- **No OpenAI API.**
- **No production deploy.**
- **Keep quote integrity telemetry-only** during this run unless a
  separate DECISION changes blocking policy.

## Risks found · 12

1. `runQuoteIntegrity` wrapper is not yet tested in-situ.
2. Quote integrity is not yet blocking.
3. A/B baselines remain `quote_integrity_not_evaluated`
   conceptually.
4. Controlled A/B generation with checker attached has not happened
   yet.
5. Current Fixture B source report still has NVIDIA R1 RED.
6. R1 grammar bridging remains a real quote-integrity concern.
7. Role/title check remains weak.
8. Only `Evidence quote:` pattern is gated.
9. No production quote validation exists.
10. C/D/E still not real-run.
11. Uploaded 20 PDFs remain out of scope.
12. BLK-0001 / BLK-0002 / BLK-0003 remain `open` and unaffected.

## Non-blocking followups

- **Push AgentOps-5c-integrate after human approval.**
- **Update daily summary after push.**
- **Next recommended loop**: **AgentOps-5d** controlled A+B
  generation with checker attached.
- Keep the 5d run **telemetry-only** for quote integrity.
- Do not mutate A/B baselines yet.
- Do not promote quote integrity to blocking yet.
- Do not use LLM judge.
- Do not use edit-distance.
- Do not ingest uploaded PDFs.
- Do not run C/D/E yet.
- Do not introduce OpenAI API.
- Do not modify `.agent/scripts/**`.
- Do not modify `src/**`.
- Do not modify pipeline.

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT start
AgentOps-5d. Do NOT run harness generation. Do NOT run Playwright.
Do NOT run report generation. Do NOT call Anthropic/OpenAI. Do NOT
run C/D/E. Do NOT run A-E full suite. Do NOT ingest uploaded PDFs.
Do NOT modify baselines. Do NOT modify fixtures. Do NOT modify
pipeline. Do NOT modify `.agent/scripts/**`. Do NOT modify `src/**`.
Do NOT promote quote integrity to blocking. Do NOT implement Codex
planner. Do NOT create `.agent/planner_reports/`. Do NOT run
collector. Do NOT refresh corpus. Do NOT modify GitHub Actions. Do
NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start G2.1d.
Recommended next task after push/cleanup is **AgentOps-5d ·
controlled A + B generation with checker attached** (Fixture A first ·
stop if A fails · then Fixture B · ~$0.10 · no baseline mutation ·
no A-E · no C/D/E · quote integrity stays telemetry-only).

## Boundary confirmations · 28 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No generation | ✅ |
| No report regression harness generation run | ✅ |
| No Playwright | ✅ |
| No LLM / API calls | ✅ |
| No OpenAI API | ✅ (BLK-0003 unchanged) |
| No baseline mutation | ✅ (A + B untouched · grandfathered) |
| No `.agent/regression_baselines/**` changes | ✅ |
| No `.agent/regression_runs/**` changes | ✅ |
| No `.agent/regression_fixtures/**` changes | ✅ |
| **No 5c artifact mutation** | ✅ (v0.2 preserved · 2 REDs preserved) |
| **No 5d-R2 artifact mutation** | ✅ (v0.3 preserved · 1 RED preserved) |
| No `report.md` committed | ✅ |
| No screenshot committed | ✅ |
| No uploaded PDFs committed | ✅ |
| No `.agent/scripts/**` changes | ✅ (hard rule per AgentOps-2c Q3-Q8) |
| No `src/**` changes | ✅ (`src/data/web_bundle.json` read-only reference from harness path string only) |
| No pipeline changes | ✅ (`b019786` 起终一致) |
| No collector run / corpus refresh | ✅ |
| No GitHub Actions changes | ✅ |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read | ✅ |
| No `vercel.json` / Codex-Claude config changes | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains spec-only | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |
| Cost for this DECISION loop | ✅ **$0** |
| Any generation happened | ✅ **no** |
| Harness generation ran | ✅ **no** |

## Stop condition

DECISION written. **Awaiting explicit human approval to push.** No
follow-up action is authorized until Bohao says
"push AgentOps-5c-integrate".
