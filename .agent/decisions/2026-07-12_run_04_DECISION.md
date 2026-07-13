# DECISION · AgentOps-3e-tune · narrow report capture

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-12 21:12). Standing in for the ChatGPT
> reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-12_run_04_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-12_run_04_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-12_run_04_TASK.md`
- **loop**: `AgentOps-3e-tune`
- **parent_loop**: `AgentOps-3e` (`2026-07-12_run_03`)
- **new_run**: `.agent/regression_runs/20260713T011451Z_fixture-A/`
- **previous_run**: `.agent/regression_runs/20260712T235033Z_fixture-A/`
- **impl_commit**: `a240565`
- **run_report_commit**: `ac26b1c`
- **files_reviewed**:
  - `scripts/report-regression-local.mjs` (619 → 819 lines; new `extractReportText()`)
  - `.agent/regression_runs/20260713T011451Z_fixture-A/metadata.json` (62 lines)
  - `.agent/regression_runs/20260713T011451Z_fixture-A/structural_checks.json` (~180 lines)
  - `.agent/regression_runs/20260713T011451Z_fixture-A/verdict.md` (27 lines)
  - `.agent/run_reports/2026-07-12_run_04_RUN_REPORT.md` (430 lines)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — capture logic change to a script + one real localhost report
generation. No push, no deploy pending explicit human approval per turn.

## Reasoning summary

AgentOps-3e-tune successfully fixed the core capture problem from the
initial 3e prototype. The original prototype captured the whole page
through `body.innerText`, creating a false AMBER on
`report_length_in_soft_band`. This tune loop implemented
`extractReportText` with marker-scored candidate selection and selected
a qualified report-specific candidate with `capture_scope = "main
section"`, `fallback_used = false`, `selected_candidate_marker_count =
5/5`, and `selected_candidate_has_evidence = true`.
`report_char_count` dropped from **17181 → 11115** (−35%), while
`page_body_char_count` was separately recorded as **17794**. The run
still produced AMBER, but the root cause has changed from capture bug
to length-band calibration. All red checks passed, the Candidate 1
sentinel remained intact, Fixture A checks passed, and operational
checks passed. The task respected boundaries: no production target, no
baseline promotion, no full report or screenshot committed, no
`.agent/scripts/**` changes, no `src/**` changes, no pipeline changes,
no package changes, no OpenAI API, no collector/corpus refresh, no
push/deploy.

## Approved direction

- Approve **AgentOps-3e-tune** as a successful capture narrowing fix.
- Treat the remaining AMBER as **length-band calibration**, not
  capture failure.
- **Keep** the tuned `extractReportText` marker-scored candidate
  strategy (9 selectors × marker score × Evidence Appendix requirement
  × shortest-qualified tiebreaker).
- **Keep** body fallback as a guarded fallback that forces AMBER via
  the `report_capture_scope_not_body` check when used.
- **Keep Fixture A only.**
- **Keep localhost only.**
- **Keep Playwright CLI.**
- **Do NOT move to AgentOps-3f yet.**
- Next recommended loop after push/cleanup:
  **AgentOps-3e-tune-2 · length-band calibration**.
- Preferred 3e-tune-2 change: adjust `REPORT_LEN_SOFT_MAX` from
  **6000 → 14000** (or an equivalent single-constant edit), then
  re-run Fixture A once. Expected verdict: **GREEN**.
- **Do NOT** modify `src/**` merely to add `data-testid` yet — the
  DOM-marker option (Option B in RUN_REPORT §"AMBER analysis") is
  explicitly deferred until per-fixture band tuning becomes a real
  need.
- **Do NOT** promote baseline yet — baseline promotion is deferred
  until at least one full GREEN run exists.
- **Do NOT** run production.
- **Do NOT** run A-E full suite yet.

## Run summary

| field | value |
|---|---|
| previous_run_id | `20260712T235033Z_fixture-A` |
| new_run_id | `20260713T011451Z_fixture-A` |
| fixture | A (v1) |
| base_url | `http://localhost:3000` |
| verdict | **amber** |
| exit_code | 2 |
| duration_ms | 70224 |
| capture_scope | **`main section`** |
| capture_strategy | `shortest-qualified-candidate` |
| fallback_used | **false** |
| page_body_char_count | 17794 |
| report_char_count | 11115 |
| candidate_count | 9 |
| qualified_candidate_count | 2 (`main` @ 17459, `main section` @ 11115) |
| selected_candidate_marker_count | 5 / 5 |
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
| git_commit_sha_at_run_time | `8ed20b93876eb875e160fef01ac6274d0c98d65d` |
| corpus_snapshot_date | May 14, 2026 |
| model_display | Claude Sonnet 4.6 |

## Capture analysis

**Before** (3e · `36cd001`):
```js
const bodyText = await page.locator("body").innerText();
reportText = bodyText;
reportCharCount = bodyText.length;  // 17181 — whole page
```

**After** (3e-tune · `a240565`):
```js
capture = await extractReportText(page);
reportText = capture.text;
reportCharCount = capture.selectedLength;  // 11115 — main section
```

`extractReportText(page)` (~100 lines) enumerates 9 selectors
(`[data-testid*='report']`, `[data-report]`, `article`, `main section`,
`main`, `section`, `div[class*='prose']`, `div[class*='markdown']`,
`div[class*='report']`), scores each candidate by presence of the 5
required section headers + Evidence Appendix, requires all 5 markers
**and** Evidence Appendix to qualify, and picks the shortest qualified
candidate as the tightest scope. Falls back to `body.innerText` only if
0 candidates qualify, and forces at least AMBER via the
`report_capture_scope_not_body` check when the fallback is used.

Two qualified candidates were found in this run: `main` (17459 chars)
and `main section` (11115 chars). The algorithm correctly picked the
shorter one. The `main section` scope contains the executive summary
strip ("Gap report · Target · <archetype>") + the report body
`<ReactMarkdown>` + the action-bar buttons ("Copy report", "Download",
"Eval this report", "Start over"). Rough breakdown from the scratchpad
`report.md`: exec strip ~400 chars, report body ~10500 chars, action
bar ~150 chars. This is a meaningful ~35% reduction and eliminates the
hero, form, methodology strip, attribution, and footer noise from the
prior body-based capture.

## AMBER analysis

The AMBER verdict remains only because `report_length_in_soft_band`
still uses the original 1500–6000 character band, while the correctly
captured report-specific content is 11115 characters. This is no longer
caused by whole-page capture: `capture_scope` is `"main section"`,
`fallback_used` is `false`, and the selected candidate contains all
required report markers plus Evidence Appendix. The next tuning step
should calibrate the soft length band, likely by setting the upper
bound around **14000**. This should be a separate loop before
AgentOps-3f integrates verdicts into RUN_REPORT templates or planner
reports.

Distinguishing evidence:

- `fallback_used=false` — the qualified-candidate branch fired.
- `selected_candidate_marker_count=5/5` + `selected_candidate_has_evidence=true`
  — the chosen scope contains exactly the report the check is meant to
  measure.
- `qualified_candidate_count=2` — the algorithm had a real choice and
  picked the shorter option.
- All 15 red-level checks passed.
- Only 1 amber check failed (`report_length_in_soft_band`); all other
  amber checks passed (`report_capture_scope_not_body`,
  `action_bar_buttons_present`, all fixture/operational amber checks).

## Risks found

1. **The harness is still AMBER until length-band calibration is
   tuned.** Severity: **low**. Verdict correctly reflects a real
   measurement mismatch, not a product regression.
2. **The selected report content is still not a perfect
   `<ReactMarkdown>`-only capture.** Severity: **low**. It is no
   longer body fallback; it includes small non-report chrome (exec
   strip + action-bar text). Acceptable for v1.
3. **Further narrowing would require a brittle class selector or a
   `src/**` DOM marker.** Severity: **medium**. Should be a separate
   DECISION with an explicit `src/**` TASK if pursued; not this loop.
4. **The current 1500–6000 soft band is too low for actual
   report-specific captured content.** Severity: **medium** for
   verdict clarity, **low** for product. Fix candidate: widen to
   ~2000–14000 in 3e-tune-2.
5. **The prototype still covers only Fixture A.** Severity: **low**.
   Explicit design choice at 3e/3e-tune scope. Fixtures B-E remain
   available for later loops.
6. **Future runs incur API cost.** Severity: **low**. Bounded by
   `single_generation_limit` policy; ≈$0.05 per run today. If cadence
   rises, a hard budget cap should be codified.
7. **Cost is estimated, not measured exactly.** Severity: **low**.
   `cost_measured: false` is honestly recorded.
8. **Keyword/rubric checks remain primitive.** Severity: **low-medium**.
   Substring matching + literal must-not-happen list; adequate for v1
   regression signal, not a replacement for the eval-report route.
9. **No baseline has been promoted.** Severity: **none** (intended).
   Baseline promotion is human-gated per AgentOps-3d DECISION.
10. **The harness should not yet become a formal gate until length
    calibration is complete.** Severity: **medium** for process. Enforced
    by keeping the harness local-only and not wiring it into CI.
11. **Do not start AgentOps-3f until a cleaner verdict is produced.**
    Severity: **medium** for staging discipline. Enforced by this
    DECISION's `Approved direction` §"Do NOT move to AgentOps-3f yet".
12. **BLK-0001 / BLK-0002 / BLK-0003 remain open and unaffected.**
    Severity: **none** for this loop (documented state), **medium** as
    standing project risk covered elsewhere.

## Required fixes

**`none for approving the capture tuning`**

The capture fix is correct as implemented. The remaining AMBER is a
threshold-calibration finding, not a bug in this loop's deliverable.
Fix belongs in the next loop (3e-tune-2).

## Non-blocking followups

- **Push AgentOps-3e-tune after human approval.**
- **Create/update daily summary after push.**
- **Next recommended loop**:
  **AgentOps-3e-tune-2 · length-band calibration**.
- In 3e-tune-2, widen the report length soft max from **6000 → 14000**
  (or equivalent single-constant edit). Re-run Fixture A once.
- If the result becomes **GREEN** and all red checks continue to pass,
  then AgentOps-3f can be considered.
- **Do NOT start AgentOps-3f before 3e-tune-2.**
- **Do NOT run A-E full suite yet.**
- **Do NOT promote baseline yet.**
- **Do NOT test production.**
- **Do NOT click Eval in v1.**
- **Do NOT modify prompts.**
- **Do NOT modify generate-report route.**
- **Do NOT modify model selection.**
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify `src/**`** unless a separate explicit DOM-marker task
  is approved.
- **Do NOT modify pipeline.**
- **Do NOT introduce OpenAI API.**
- **Do NOT push until explicit human approval.**

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT start
AgentOps-3e-tune-2. Do NOT start AgentOps-3f. Do NOT run more fixtures.
Do NOT run production. Do NOT promote baseline. Do NOT commit full
`report.md` or `screenshot.png`. Do NOT call Anthropic/OpenAI outside
the local app. Do NOT implement Codex planner. Do NOT create
`.agent/planner_reports/`. Do NOT modify `.agent/scripts/**`. Do NOT
modify `src/**`. Do NOT modify pipeline. Do NOT run collector. Do NOT
refresh corpus. Do NOT modify GitHub Actions. Do NOT resolve
BLK-0001 / BLK-0002 / BLK-0003. Do NOT start G2.1d. Do NOT resume full
automation. Recommended next task after push/cleanup is
**AgentOps-3e-tune-2 · length-band calibration**.

## Files reviewed

- `scripts/report-regression-local.mjs` — new `extractReportText`
  function is well-scoped, uses only Playwright + Node stdlib, has zero
  new dependency, hard-rejects non-localhost, includes explicit
  observability fields (`page_body_char_count`, `capture_debug_top3`),
  and correctly forces AMBER on body fallback.
- `.agent/regression_runs/20260713T011451Z_fixture-A/metadata.json` —
  records all new fields cleanly; `scratch_paths` points to
  `/var/folders/xx/…` outside the repo; `cost_measured: false` and
  `cost_cap_enforced_by: single_generation_limit` unchanged.
- `.agent/regression_runs/20260713T011451Z_fixture-A/structural_checks.json`
  — 25 checks total; all 15 red passed; only 1 amber failing
  (`report_length_in_soft_band`); 2 new checks (`report_text_capture_success`,
  `report_capture_scope_not_body`) present and passing.
- `.agent/regression_runs/20260713T011451Z_fixture-A/verdict.md` —
  human-readable summary; carries capture scope + fallback state in
  header; lists 1 amber failure honestly.
- `.agent/run_reports/2026-07-12_run_04_RUN_REPORT.md` — 430 lines;
  includes exact before/after code, comparison table vs 3e run,
  distinguishes calibration vs capture root cause, complete
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
follow-up action is authorized until Bohao says "push AgentOps-3e-tune".
