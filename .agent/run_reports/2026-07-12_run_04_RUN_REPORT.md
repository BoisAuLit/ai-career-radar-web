# RUN_REPORT · AgentOps-3e-tune · narrow report capture

## Metadata

- **task_id**: `2026-07-12_run_04`
- **date**: `2026-07-12`
- **loop**: `AgentOps-3e-tune`
- **parent_loop**: `AgentOps-3e` (`2026-07-12_run_03`)
- **TASK**: `.agent/tasks/2026-07-12_run_04_TASK.md`
- **script**: `scripts/report-regression-local.mjs`
- **previous_run_id**: `20260712T235033Z_fixture-A`
- **new_run_id**: `20260713T011451Z_fixture-A`
- **impl_commit**: `a240565`
- **repo**: `/Users/bohaoli/Desktop/ai-career-radar-web`
- **branch**: `main`
- **base_commit_before**: `8ed20b9`
- **base_commit_after**: `a240565` (impl only; RUN_REPORT commit to follow)

## Objective (from TASK)

Tune `scripts/report-regression-local.mjs` to capture the **actual generated
report content** (via a marker-scored candidate strategy) instead of the whole
page `body.innerText`. Re-run Fixture A once locally and write a new small
verdict. Primary goal = correct capture scope, not forced green. Length band
stays 1500-6000; if selected content still exceeds 6000 after correct capture,
verdict may remain AMBER as a length-band calibration finding.

## Result headline

- **Capture fix worked.** `capture_scope="main section"` (not `body_fallback`).
  `fallback_used=false`. `report_char_count` fell **17181 → 11115** (−35%).
- **Verdict remains AMBER.** Only failing check =
  `report_length_in_soft_band` (`chars=11115 band=1500-6000`).
- **All 15 red-level checks passed.**
- **Root cause of remaining AMBER = length-band calibration**, not capture
  bug. The `main section` scope still includes the executive summary strip
  (`Gap report · Target · <archetype>`) and the action-bar buttons alongside
  the `<ReactMarkdown>` body. Going tighter would require a src DOM marker,
  which this loop is explicitly forbidden from touching.
- **DECISION-eligible.**

## Files changed (this loop)

| file | change | committed |
|---|---|---|
| `.agent/tasks/2026-07-12_run_04_TASK.md` | new · 199 lines | ✅ `a240565` |
| `scripts/report-regression-local.mjs` | +202 / −6 (619 → 819 lines) | ✅ `a240565` |
| `.agent/regression_runs/20260713T011451Z_fixture-A/metadata.json` | new · 62 lines | ✅ `a240565` |
| `.agent/regression_runs/20260713T011451Z_fixture-A/structural_checks.json` | new · ~180 lines | ✅ `a240565` |
| `.agent/regression_runs/20260713T011451Z_fixture-A/verdict.md` | new · 27 lines | ✅ `a240565` |
| `.agent/run_reports/2026-07-12_run_04_RUN_REPORT.md` | new · this file | ⏳ pending |

Large artifacts (NOT committed, scratchpad only):
- `/var/folders/xx/…/T/acr-regression-runs/20260713T011451Z_fixture-A/report.md`
- `/var/folders/xx/…/T/acr-regression-runs/20260713T011451Z_fixture-A/report.png`

## Exact capture change

### Before (3e · `36cd001`)

```js
// Capture report text.
if (doneReached) {
  const bodyText = await page.locator("body").innerText();
  reportText = bodyText;
  reportCharCount = bodyText.length;
}
```

`body.innerText` captured hero + form + report card + methodology strip +
attribution + footer → 17181 chars → false AMBER.

### After (3e-tune · `a240565`)

```js
// Capture report text — marker-scored candidate strategy. See
// `extractReportText` for the algorithm. Falls back to body only
// when no candidate contains all 5 section markers + evidence.
if (doneReached) {
  capture = await extractReportText(page);
  reportText = capture.text;
  reportCharCount = capture.selectedLength;
}
```

`extractReportText(page)` (~100 lines) does:

1. Reads `body.innerText()` once for observability (`page_body_char_count`).
2. Enumerates candidates across 9 selectors (most-specific first):
   `[data-testid*='report']`, `[data-report]`, `article`, `main section`,
   `main`, `section`, `div[class*='prose']`, `div[class*='markdown']`,
   `div[class*='report']`.
3. For each candidate, extracts `innerText`, skips duplicates by
   `(length, prefix)`, skips anything under `MIN_CANDIDATE_LENGTH` (500
   chars).
4. Scores each candidate by presence of the 5 required section headers
   + Evidence Appendix.
5. **Qualified** = has all 5 markers **and** has Evidence Appendix.
6. If ≥1 qualified: picks the **shortest** qualified candidate (tightest
   scope).
7. If 0 qualified: falls back to `body.innerText`, sets
   `scope="body_fallback"`, `fallback_used=true`. The
   `report_capture_scope_not_body` amber check then fires, forcing at
   least AMBER.

## New metadata fields (per TASK spec item #4)

```json
{
  "report_char_count": 11115,
  "page_body_char_count": 17794,
  "capture_scope": "main section",
  "capture_strategy": "shortest-qualified-candidate",
  "candidate_count": 9,
  "qualified_candidate_count": 2,
  "selected_candidate_char_count": 11115,
  "selected_candidate_marker_count": 5,
  "selected_candidate_has_evidence": true,
  "fallback_used": false,
  "capture_debug_top3": [
    { "selector": "main section", "length": 11115, "markerHits": 5, "hasEvidence": true },
    { "selector": "main",         "length": 17459, "markerHits": 5, "hasEvidence": true },
    { "selector": "main section", "length": 790,   "markerHits": 3, "hasEvidence": false }
  ]
}
```

## New structural checks (per TASK spec item #5)

Added:
- `report_text_capture_success` (red) — `selectedLength > 0`. Detail
  string carries `scope`, `strategy`, `candidateCount`, `qualifiedCount`.
- `report_capture_scope_not_body` (amber) — `!fallback_used`. Detail
  string carries `scope`, `fallback_used`, `page_body_chars`.

Rewired to use selected report text (not body text):
- `report_non_empty` (red)
- `contains_section_target_role` (red)
- `contains_section_what_you_already_have` (red)
- `contains_section_top_5_gaps` (red)
- `contains_section_over-prioritizing` (red)
- `contains_section_highest-leverage_next_action` (red)
- `contains_evidence_appendix` (red)
- `report_length_in_soft_band` (amber) — **now measures selected scope**
- Fixture-specific (strengths / gaps / must-not-happen / recommendation)

Action bar / operational checks operate on the page as a whole (correct
scope for buttons + host/latency).

## Run summary

- **run_id**: `20260713T011451Z_fixture-A`
- **base_url**: `http://localhost:3000`
- **fixture**: A (v1)
- **duration**: **70224 ms** (≈ 70.2 s · below 120 s soft, well below 240 s hard)
- **verdict**: **AMBER**
- **exit_code**: `2`
- **git_commit_sha (at run time)**: `8ed20b93876eb875e160fef01ac6274d0c98d65d`
- **corpus_snapshot_date**: `May 14, 2026`
- **model_display**: `Claude Sonnet 4.6`
- **console_errors**: `[]`
- **one real generation happened**: ✅
- **API cost measured**: ❌ (still bounded by policy, not measurement)
- **cost_cap_enforced_by**: `single_generation_limit`
- **estimated cost**: **≈ $0.05** (Sonnet 4.6 baseline · same as 3e)

## Structural checks (17 · 14 red passed · 1 amber failing · 2 amber passing)

| check | bucket | level | pass | detail |
|---|---|---|---|---|
| page_loaded | structural | red | ✅ | |
| resume_filled | structural | red | ✅ | |
| target_filled | structural | red | ✅ | |
| generate_clicked | structural | red | ✅ | |
| done_state_reached | structural | red | ✅ | |
| incomplete_banner_absent | structural | red | ✅ | Candidate 1 sentinel intact |
| report_non_empty | structural | red | ✅ | 11115 chars |
| **report_text_capture_success** | structural | red | ✅ | `scope=main section strategy=shortest-qualified-candidate candidates=9 qualified=2` |
| **report_capture_scope_not_body** | structural | amber | ✅ | `scope=main section fallback_used=false page_body_chars=17794` |
| contains_section_target_role | structural | red | ✅ | |
| contains_section_what_you_already_have | structural | red | ✅ | |
| contains_section_top_5_gaps | structural | red | ✅ | |
| contains_section_over-prioritizing | structural | red | ✅ | |
| contains_section_highest-leverage_next_action | structural | red | ✅ | |
| contains_evidence_appendix | structural | red | ✅ | |
| report_length_in_soft_band | structural | amber | ❌ | `chars=11115 band=1500-6000` |
| action_bar_buttons_present | structural | amber | ✅ | Copy / Download / Eval / Start over all visible |

## Fixture-specific checks (4 · all passed)

| check | level | pass | detail |
|---|---|---|---|
| at_least_2_strengths_reflected | amber | ✅ | ≥2 strength tokens hit in selected report text |
| at_least_2_gaps_reflected | amber | ✅ | ≥2 gap tokens hit in selected report text |
| must_not_happen_absent | red | ✅ | zero literal matches ("learn python", "beginner python", "as an ai language model") |
| recommendation_roughly_matches_expected | amber | ✅ | RAG/eval/retrieval keywords present |

## Operational checks (4 · all passed)

| check | level | pass | detail |
|---|---|---|---|
| duration_under_soft_threshold | amber | ✅ | 70224 ms < 120000 ms |
| duration_under_hard_threshold | red | ✅ | 70224 ms < 240000 ms |
| no_fatal_playwright_error | red | ✅ | |
| no_production_target | red | ✅ | localhost |

## Comparison vs 3e (`20260712T235033Z_fixture-A`)

| dimension | 3e | 3e-tune | delta |
|---|---|---|---|
| capture scope | `body` (implicit) | `main section` | ✅ narrowed |
| fallback_used | n/a (no capture logic) | `false` | ✅ real capture path |
| report_char_count | 17181 | **11115** | −6066 (−35%) |
| page_body_char_count | not recorded | 17794 | ✅ new observability field |
| candidate_count | n/a | 9 | new |
| qualified_candidate_count | n/a | 2 | new (both `main` and `main section`) |
| verdict | AMBER | **AMBER** | unchanged label, root cause changed |
| red checks failed | 0 | **0** | unchanged |
| amber checks failed | 1 (length band) | **1** (length band) | same count, different meaning |
| Candidate 1 sentinel intact | ✅ | ✅ | |
| all 5 sections + evidence present | ✅ | ✅ | |
| must-not-happen matches | 0 | 0 | |
| duration_ms | 73389 | 70224 | −3165 ms (noise) |
| exit_code | 2 | 2 | unchanged |

## AMBER analysis · is it capture or calibration?

**Calibration**, not capture. Evidence:

1. `fallback_used=false` — the qualified-candidate branch fired.
2. `selected_candidate_marker_count=5/5` and
   `selected_candidate_has_evidence=true` — the chosen scope contains
   exactly the report the check is meant to measure.
3. `qualified_candidate_count=2` — both `main` (17459 chars) and
   `main section` (11115 chars) qualified. The algorithm correctly
   preferred the shorter one.
4. The 11115-char selected scope still includes the executive summary
   strip ("Gap report · Target · <archetype>") + the report body
   `<ReactMarkdown>` + the action-bar buttons ("Copy report",
   "Download", "Eval this report", "Start over"). Rough breakdown from
   the scratchpad `report.md`: exec strip ~400 chars, action bar ~150
   chars, report body ~10500 chars.
5. Going tighter would require targeting the specific inner
   `<div class="px-7 py-7 sm:px-10 sm:py-10">` that wraps
   `<ReactMarkdown>`. That padding-class combination is not one of the
   currently allowed selectors, and using it would create a
   src-DOM-fragile locator without any semantic marker in the DOM.

**Two acceptable next moves** (both future loops, not this one):

- **Option A · widen length band** to e.g. `2000–14000` to reflect the
  reality that a real career-gap report at Fixture A depth runs ~10k
  chars of prose + short exec strip + short action bar. Simple, one
  constant change.
- **Option B · add a stable DOM marker** in `src/app/page.tsx` (e.g.
  `data-testid="report-body"` on the padding div wrapping
  `<ReactMarkdown>`). This is a `src/**` edit — needs its own TASK.

**Executor's opinion**: Option A first (cheap, zero src change, keeps
3e-tune green in the next run). Option B later if we want per-fixture
band tuning. Both are DECISION-side calls.

## Local run record

- Preflight: `curl` to `localhost:3000` → `000` (no server).
- Started `npm run dev > /tmp/dev-3e-tune.log 2>&1 &` → PID 23275.
  Wait 8 s → `curl` → `200`. Ready.
- Ran `node scripts/report-regression-local.mjs` once (real generation
  through Next.js runtime using `.env.local` Anthropic key).
- Runtime output:
  ```
  report-regression-local · run_id=20260713T011451Z_fixture-A fixture=A verdict=AMBER exit=2 scope=main section chars=11115 body_chars=17794 candidates=9/2 duration_ms=70224
    amber: report_length_in_soft_band
    committed artifacts under: .agent/regression_runs/20260713T011451Z_fixture-A/
    scratchpad: /var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260713T011451Z_fixture-A
  ```
- `kill 23275` after run; `curl` → `000` (server stopped).
- **One** real generation total. No retry needed. Under the 2-generation
  cap.

## Artifact policy

- **Committed** (small · in-repo):
  `.agent/regression_runs/20260713T011451Z_fixture-A/metadata.json`
  (~2.0 KB), `structural_checks.json` (~6 KB), `verdict.md` (~1 KB).
- **Scratchpad** (large · NOT committed): `report.md` (~11 KB text),
  `report.png` (screenshot). Paths recorded in `metadata.json`'s
  `scratch_paths`.
- Rationale: keeps the repo lean, preserves verdict provenance, matches
  AgentOps-3d DECISION answers #2, #3, #13.

## Why report.md / screenshot were NOT committed

- 3d DECISION explicitly restricted the in-repo footprint per run to
  the three small files above.
- The generated report at 11 KB is small in absolute terms, but at 5
  fixtures × N runs × per-day cadence this would balloon and diff noise
  would drown out real change.
- The screenshot is a binary blob; git churn on binaries is expensive
  and offers ~zero verdict value beyond human-eye QA, which is already
  possible via the scratchpad path.

## Forbidden-file audit · empty-diff sweep · full CLEAN

- `src/**` — **untouched** (checked via `git diff --name-only`)
- `src/data/**` — untouched
- `src/lib/**` (including `prompts.ts`, `models-display.ts`) — untouched
- `src/app/api/**` (including `generate-report/route.ts`,
  `eval-report/route.ts`) — untouched
- `src/app/page.tsx` — untouched (read-only during DOM inspection)
- `.agent/scripts/**` — **untouched** (hard rule per AgentOps-2c Q3-Q8)
- `.agent/policies/**` — untouched
- `.agent/templates/**` — untouched (verdict integration deferred)
- `.agent/blockers.md` — untouched (BLK-0001/2/3 all `open`)
- `.agent/automation_queue.md` — untouched (QUEUE-0002 still
  `blocked_pending_human`)
- `.agent/regression_fixtures/**` — untouched (Fixture A read-only)
- `.agent/planner_reports/**` — **not created** (Codex planner not
  implemented in this loop)
- Pipeline repo (any file) — untouched (`HEAD b019786` at start AND end)
- `sources.yaml`, `corpus/**`, `scripts/collector/**` — untouched
- `.github/workflows/**` — untouched
- `package.json`, `package-lock.json` — untouched (no new dep)
- `.env*` — not read by harness
- `vercel.json` — untouched
- Codex / Claude config files — untouched
- Production deployment config — untouched
- Baseline promotion path — not created

## Validation results

```
$ git diff --name-only
scripts/report-regression-local.mjs

$ git ls-files --others --exclude-standard
.agent/regression_runs/20260713T011451Z_fixture-A/metadata.json
.agent/regression_runs/20260713T011451Z_fixture-A/structural_checks.json
.agent/regression_runs/20260713T011451Z_fixture-A/verdict.md
.agent/tasks/2026-07-12_run_04_TASK.md
```

Exactly the 5 allowed files (`scripts/report-regression-local.mjs` +
TASK + 3 run artifacts) staged. Nothing else.

## Confirmations · 26 items

| item | status |
|---|---|
| Local run executed | ✅ (`a240565` includes 3 run artifacts) |
| One real generation happened | ✅ (11115 chars captured from `main section`) |
| Capture_scope | ✅ `main section` (not `body_fallback`) |
| Fallback_used | ✅ `false` |
| page_body_char_count recorded | ✅ 17794 |
| report_char_count on selected scope | ✅ 11115 |
| Verdict | ✅ AMBER |
| Exit code | ✅ 2 |
| Duration | ✅ 70224 ms |
| AMBER removed | ❌ no — but reason changed from capture bug → length-band calibration |
| All red checks passed | ✅ 15/15 |
| Only amber failing | ✅ `report_length_in_soft_band` (calibration) |
| No production target | ✅ (`localhost` in allowed set; harness hard-rejects non-localhost) |
| No baseline promotion | ✅ |
| No full report/screenshot committed | ✅ (scratchpad only) |
| No `.agent/scripts/**` changes | ✅ (harness lives `scripts/`) |
| No `src/**` changes | ✅ |
| No pipeline changes | ✅ (`b019786` unchanged start AND end) |
| No collector/corpus refresh | ✅ |
| No OpenAI API from harness | ✅ (browser driver only) |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read | ✅ |
| No push / no manual deploy | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d still `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |

## Recommendation

- **Human + ChatGPT review** of this RUN_REPORT + `structural_checks.json`
  + `verdict.md` + the tuned `scripts/report-regression-local.mjs`
  (especially `extractReportText` scoring logic).
- Then write **DECISION** for `2026-07-12_run_04`.
- Suggested DECISION direction (executor's opinion, not binding):
  - **verdict**: `approve` — capture fix worked; AMBER is now calibration.
  - **human_approval_needed**: `yes`.
  - **Next default loop** (post-DECISION):
    **AgentOps-3e-tune-2 · widen length band** (Option A above · one
    constant `REPORT_LEN_SOFT_MAX = 6000 → e.g. 14000` · one runtime
    file · no `src/**` edit · re-run Fixture A once · expected GREEN).
  - Alternative: skip 3e-tune-2 and go straight to
    **AgentOps-3f** (verdict integration into RUN_REPORT template +
    Codex planner schema · memo-only or design-only · low risk).
    Recommend against skipping — clean GREEN baseline before 3f is
    still valuable.
  - Explicitly DEFER src-side `data-testid` markers (Option B) unless
    per-fixture band tuning becomes a real need later.

## Standing do-NOTs (unchanged from prior loops)

- Do NOT start AgentOps-3f in this loop.
- Do NOT integrate verdict into RUN_REPORT template yet.
- Do NOT modify `.agent/templates/**`.
- Do NOT implement Codex planner.
- Do NOT create `.agent/planner_reports/`.
- Do NOT run A-E full suite.
- Do NOT run production.
- Do NOT promote baseline.
- Do NOT click Eval.
- Do NOT add OpenAI API.
- Do NOT call Anthropic/OpenAI directly from harness.
- Do NOT read `.env` files from harness.
- Do NOT modify `.agent/scripts/**`.
- Do NOT modify `src/**`.
- Do NOT modify prompts.
- Do NOT modify model selection.
- Do NOT modify generate-report route.
- Do NOT modify eval route.
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
`2026-07-12_run_04`. No push. No deploy. No further Playwright run.
