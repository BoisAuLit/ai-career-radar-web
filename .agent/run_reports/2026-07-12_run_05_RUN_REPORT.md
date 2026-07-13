# RUN_REPORT · AgentOps-3e-tune-2 · length-band calibration

## Metadata

- **task_id**: `2026-07-12_run_05`
- **date**: `2026-07-12`
- **loop**: `AgentOps-3e-tune-2`
- **parent_loop**: `AgentOps-3e-tune` (`2026-07-12_run_04`)
- **grandparent_loop**: `AgentOps-3e` (`2026-07-12_run_03`)
- **TASK**: `.agent/tasks/2026-07-12_run_05_TASK.md`
- **script**: `scripts/report-regression-local.mjs`
- **previous_run_id**: `20260713T011451Z_fixture-A` (3e-tune AMBER)
- **new_run_id**: `20260713T014957Z_fixture-A` (3e-tune-2 GREEN)
- **impl_commit**: `d393db9`
- **repo**: `/Users/bohaoli/Desktop/ai-career-radar-web`
- **branch**: `main`
- **base_commit_before**: `2486eb6`
- **base_commit_after**: `d393db9` (impl only; RUN_REPORT commit to follow)

## Objective (from TASK)

Widen `REPORT_LEN_SOFT_MAX` from **6000 → 14000**, re-run Fixture A once
locally, and let the harness decide honestly. Primary goal = remove the
false-AMBER `report_length_in_soft_band` failure caused by the outdated
whole-body-era band. Do NOT force green.

## Result headline

- **Verdict: GREEN.** Exit 0.
- **0 red failures. 0 amber failures.**
- `capture_scope="main section"` (still a report-specific candidate).
- `fallback_used=false`. `page_body_char_count=18422`.
- `report_char_count=11773` — cleanly inside the widened 1500-14000
  band.
- **AMBER was removed** because the band calibration matched the
  post-3e-tune capture scope. No new AMBER surfaced.
- **DECISION-eligible.**

## Files changed (this loop)

| file | change | committed |
|---|---|---|
| `.agent/tasks/2026-07-12_run_05_TASK.md` | new · 205 lines | ✅ `d393db9` |
| `scripts/report-regression-local.mjs` | +10 / −1 (819 → 828 lines) | ✅ `d393db9` |
| `.agent/regression_runs/20260713T014957Z_fixture-A/metadata.json` | new · 64 lines | ✅ `d393db9` |
| `.agent/regression_runs/20260713T014957Z_fixture-A/structural_checks.json` | new · ~180 lines | ✅ `d393db9` |
| `.agent/regression_runs/20260713T014957Z_fixture-A/verdict.md` | new · 27 lines | ✅ `d393db9` |
| `.agent/run_reports/2026-07-12_run_05_RUN_REPORT.md` | new · this file | ⏳ pending |

Large artifacts (NOT committed, scratchpad only):
- `/var/folders/xx/…/T/acr-regression-runs/20260713T014957Z_fixture-A/report.md`
- `/var/folders/xx/…/T/acr-regression-runs/20260713T014957Z_fixture-A/report.png`

## Exact length-band change

### Before (3e-tune · `a240565`)

```js
const REPORT_LEN_SOFT_MIN = 1500;
const REPORT_LEN_SOFT_MAX = 6000;
```

Result: `report_length_in_soft_band` failed at `chars=11115 band=1500-6000`.
False AMBER (capture had already been narrowed to `main section` scope).

### After (3e-tune-2 · `d393db9`)

```js
const REPORT_LEN_SOFT_MIN = 1500;
// Widened from 6000 to 14000 in AgentOps-3e-tune-2 (2026-07-12_run_05).
// The 6000 upper bound was calibrated for whole-body capture (~17k chars).
// After AgentOps-3e-tune narrowed capture to a report-specific candidate
// (`main section` scope, ~11k chars for Fixture A), the 6000 max produced
// a false AMBER on `report_length_in_soft_band`. 14000 gives headroom for
// natural variance in report length while still catching runaway or empty
// outputs.
const REPORT_LEN_SOFT_MAX = 14000;
```

**Old soft max**: `6000`.
**New soft max**: `14000`.
**Delta**: `+8000` (+133%).
**Min unchanged** at `1500` (still guards against near-empty outputs).

Additional wiring: metadata now records
`report_length_soft_min: 1500` and `report_length_soft_max: 14000` so
every run captures its own band for future audit.

## Capture logic — unchanged

`extractReportText` marker-scored candidate strategy, 9 selectors,
Evidence Appendix requirement, shortest-qualified tiebreaker, body
fallback that forces AMBER — **all intact**. Only the length-band
threshold moved.

## Run summary

- **run_id**: `20260713T014957Z_fixture-A`
- **base_url**: `http://localhost:3000`
- **fixture**: A (v1)
- **duration**: **75804 ms** (≈ 75.8 s · below 120 s soft threshold)
- **verdict**: **GREEN**
- **exit_code**: **0**
- **git_commit_sha (at run time)**: `2486eb6510e5d7a872cb714a92397f966047f12c`
- **corpus_snapshot_date**: `May 14, 2026`
- **model_display**: `Claude Sonnet 4.6`
- **console_errors**: `[]`
- **one real generation happened**: ✅ (1/1 · no retry needed)
- **API cost measured**: ❌ (still bounded by policy, not measurement)
- **cost_cap_enforced_by**: `single_generation_limit`
- **estimated cost**: **≈ $0.05** (Sonnet 4.6 baseline · same as prior)

## Capture / length key fields

| field | value |
|---|---|
| `capture_scope` | **`main section`** ✅ (not `body_fallback`) |
| `capture_strategy` | `shortest-qualified-candidate` |
| `fallback_used` | **`false`** ✅ |
| `report_char_count` (selected) | **11773** |
| `report_length_soft_min` | **1500** |
| `report_length_soft_max` | **14000** ✅ (was 6000) |
| `page_body_char_count` (obs) | 18422 |
| `candidate_count` | 8 |
| `qualified_candidate_count` | 2 (`main section` @ 11773 chosen · `main` @ 18087) |
| `selected_candidate_marker_count` | **5 / 5** |
| `selected_candidate_has_evidence` | `true` |

## Structural checks (17 · all passed)

| check | bucket | level | pass | detail |
|---|---|---|---|---|
| page_loaded | structural | red | ✅ | |
| resume_filled | structural | red | ✅ | |
| target_filled | structural | red | ✅ | |
| generate_clicked | structural | red | ✅ | |
| done_state_reached | structural | red | ✅ | |
| incomplete_banner_absent | structural | red | ✅ | Candidate 1 sentinel intact |
| report_non_empty | structural | red | ✅ | 11773 chars |
| report_text_capture_success | structural | red | ✅ | `scope=main section strategy=shortest-qualified-candidate candidates=8 qualified=2` |
| report_capture_scope_not_body | structural | amber | ✅ | `scope=main section fallback_used=false page_body_chars=18422` |
| contains_section_target_role | structural | red | ✅ | |
| contains_section_what_you_already_have | structural | red | ✅ | |
| contains_section_top_5_gaps | structural | red | ✅ | |
| contains_section_over-prioritizing | structural | red | ✅ | |
| contains_section_highest-leverage_next_action | structural | red | ✅ | |
| contains_evidence_appendix | structural | red | ✅ | |
| **report_length_in_soft_band** | structural | amber | **✅** | **`chars=11773 band=1500-14000`** |
| action_bar_buttons_present | structural | amber | ✅ | Copy / Download / Eval / Start over all visible |

## Fixture-specific checks (4 · all passed)

| check | level | pass | detail |
|---|---|---|---|
| at_least_2_strengths_reflected | amber | ✅ | ≥2 strength tokens hit |
| at_least_2_gaps_reflected | amber | ✅ | ≥2 gap tokens hit |
| must_not_happen_absent | red | ✅ | zero literal matches |
| recommendation_roughly_matches_expected | amber | ✅ | RAG/eval/retrieval keywords present |

## Operational checks (4 · all passed)

| check | level | pass | detail |
|---|---|---|---|
| duration_under_soft_threshold | amber | ✅ | 75804 ms < 120000 ms |
| duration_under_hard_threshold | red | ✅ | 75804 ms < 240000 ms |
| no_fatal_playwright_error | red | ✅ | |
| no_production_target | red | ✅ | localhost |

## Comparison vs 3e-tune (`20260713T011451Z_fixture-A`)

| dimension | 3e-tune | 3e-tune-2 | delta |
|---|---|---|---|
| REPORT_LEN_SOFT_MAX | 6000 | **14000** | +8000 (+133%) |
| verdict | AMBER | **GREEN** | ✅ removed |
| exit_code | 2 | **0** | ✅ |
| red checks failed | 0 | 0 | unchanged |
| amber checks failed | 1 (length band) | **0** | ✅ removed |
| capture_scope | `main section` | `main section` | unchanged ✅ |
| fallback_used | false | false | unchanged ✅ |
| report_char_count | 11115 | 11773 | +658 (+5.9%) natural variance |
| page_body_char_count | 17794 | 18422 | +628 natural variance |
| candidate_count | 9 | 8 | 1 fewer (page structure jitter) |
| qualified_candidate_count | 2 | 2 | unchanged |
| selected_candidate_marker_count | 5 / 5 | 5 / 5 | unchanged ✅ |
| selected_candidate_has_evidence | true | true | unchanged ✅ |
| Candidate 1 sentinel intact | ✅ | ✅ | |
| duration_ms | 70224 | 75804 | +5580 ms (natural LLM latency jitter) |

## AMBER analysis · was it removed?

**Yes, cleanly.** The only prior amber failure —
`report_length_in_soft_band` — now **passes** at `chars=11773
band=1500-14000`. All other amber checks that were passing continue to
pass (`report_capture_scope_not_body`, `action_bar_buttons_present`,
`at_least_2_strengths_reflected`, `at_least_2_gaps_reflected`,
`recommendation_roughly_matches_expected`, `duration_under_soft_threshold`).
Zero new amber surfaced. Zero red failures. This is a **real GREEN**,
not a forced one.

The `report_char_count` naturally moved from 11115 → 11773 (+5.9%),
which is normal LLM output variance run-to-run. Both values sit
comfortably inside the widened band, well below the 14000 max and well
above the 1500 min.

## Local run record

- Preflight: `curl` to `localhost:3000` → `000` (no server).
- Started `npm run dev > /tmp/dev-3e-tune-2.log 2>&1 &` → PID 23983.
  Wait 8 s → `curl` → `200`. Ready.
- Ran `node scripts/report-regression-local.mjs` once (real generation
  through Next.js runtime using `.env.local` Anthropic key).
- Runtime output:
  ```
  report-regression-local · run_id=20260713T014957Z_fixture-A fixture=A verdict=GREEN exit=0 scope=main section chars=11773 body_chars=18422 candidates=8/2 duration_ms=75804
    committed artifacts under: .agent/regression_runs/20260713T014957Z_fixture-A/
    scratchpad: /var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260713T014957Z_fixture-A
  ```
- `kill 23983` after run; `curl` → `000` (server stopped).
- **One** real generation total. No retry needed. Under the 2-generation
  cap.

## Artifact policy

- **Committed** (small · in-repo):
  `.agent/regression_runs/20260713T014957Z_fixture-A/metadata.json`
  (~2.0 KB), `structural_checks.json` (~6 KB), `verdict.md` (~1 KB).
- **Scratchpad** (large · NOT committed): `report.md` (~11 KB text),
  `report.png` (screenshot). Paths recorded in `metadata.json`'s
  `scratch_paths`.

## Why report.md / screenshot were NOT committed

- AgentOps-3d DECISION restricted per-run in-repo footprint to the three
  small files above.
- Report at 11 KB is small in absolute terms, but at 5 fixtures × N runs
  × per-day cadence this would balloon and diff noise would drown out
  real change.
- Screenshot is a binary blob; git churn on binaries is expensive and
  offers ~zero verdict value beyond human-eye QA, already accessible via
  scratchpad path.

## Forbidden-file audit · empty-diff sweep · full CLEAN

- `src/**` — **untouched** (`git diff --name-only` confirmed)
- `src/data/**` — untouched
- `src/lib/**` — untouched
- `src/app/api/**` — untouched (including `generate-report/route.ts`,
  `eval-report/route.ts`)
- `src/app/page.tsx` — untouched (no DOM marker added)
- `.agent/scripts/**` — **untouched** (hard rule per AgentOps-2c Q3-Q8)
- `.agent/policies/**` — untouched
- `.agent/templates/**` — untouched (verdict template integration
  deferred)
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
.agent/regression_runs/20260713T014957Z_fixture-A/metadata.json
.agent/regression_runs/20260713T014957Z_fixture-A/structural_checks.json
.agent/regression_runs/20260713T014957Z_fixture-A/verdict.md
.agent/tasks/2026-07-12_run_05_TASK.md
```

Exactly the 5 allowed files (`scripts/report-regression-local.mjs` +
TASK + 3 run artifacts) staged. Nothing else.

## Confirmations · 26 items

| item | status |
|---|---|
| Local run executed | ✅ (`d393db9` includes 3 run artifacts) |
| One real generation happened | ✅ (11773 chars captured from `main section`) |
| Capture_scope | ✅ `main section` (not `body_fallback`) |
| Fallback_used | ✅ `false` |
| page_body_char_count recorded | ✅ 18422 |
| report_char_count on selected scope | ✅ 11773 |
| report_length_soft_min recorded | ✅ 1500 |
| report_length_soft_max recorded | ✅ 14000 |
| Verdict | ✅ **GREEN** |
| Exit code | ✅ **0** |
| Duration | ✅ 75804 ms |
| **AMBER removed** | ✅ **yes, cleanly** — `report_length_in_soft_band` now passes at 11773 within 1500-14000 |
| All red checks passed | ✅ 15/15 |
| All amber checks passed | ✅ 9/9 (was 8/9 in 3e-tune) |
| No production target | ✅ (harness hard-rejects non-localhost) |
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
  (the +10-line delta at lines 53-61 and metadata additions at 710-711).
- Then write **DECISION** for `2026-07-12_run_05`.
- Suggested DECISION direction (executor's opinion, not binding):
  - **verdict**: `approve` — first honest GREEN verdict on Fixture A;
    capture + length band both correctly calibrated; no forced pass.
  - **human_approval_needed**: `yes`.
  - **Next default loop** (post-DECISION): **AgentOps-3f**
    (verdict integration into RUN_REPORT template + Codex planner
    schema — memo-only / design-only next; implementation can wait for
    a subsequent yellow loop).
  - Alternative: still hold on 3f and run one more sanity Fixture A
    generation to confirm the GREEN is stable across two runs before
    promoting. Executor's opinion: **not needed** — the run-to-run
    delta (11115 → 11773 = +5.9%) is already inside expected variance
    and well within the widened band; two runs won't add information
    at this cost.
  - Explicitly DEFER **baseline promotion** until at least one of:
    (a) 3f verdict-integration is in place, or (b) a second GREEN run
    is captured against Fixture A as a stability signal.
  - Explicitly DEFER **A-E full suite** — B-E fixtures are still
    v1-only and haven't seen a single real run.

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
- Do NOT add DOM markers or `data-testid`.
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
`2026-07-12_run_05`. No push. No deploy. No further Playwright run.
