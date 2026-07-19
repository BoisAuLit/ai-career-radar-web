# RUN_REPORT · AgentOps-4a · Fixture B single regression run

## Metadata

- **task_id**: `2026-07-19_run_01`
- **date**: `2026-07-19`
- **loop**: `AgentOps-4a`
- **parent_loop**: `AgentOps-3g-2` (`2026-07-12_run_09`)
- **TASK**: `.agent/tasks/2026-07-19_run_01_TASK.md`
- **fixture file**: `.agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md`
- **fixture A baseline (context only)**: `fixture-A_20260714T025246Z_current`
- **new_run_id**: `20260719T045622Z_fixture-B`
- **impl_commit**: `0b99358`
- **repo**: `/Users/bohaoli/Desktop/ai-career-radar-web`
- **branch**: `main`
- **base_commit_before**: `437b5cc`
- **base_commit_after**: `0b99358`

## Regression verdict

- **regression_required**: `yes`
- **reason_required_or_not**: Gradual Fixture B coverage expansion.
  AgentOps-3 arc closed on Fixture A only; B-E remained unrun. This loop
  adds `--fixture B` support and runs one real Fixture B generation to
  test whether the harness generalizes beyond A.
- **harness_used**: `yes`
- **harness_command**: `node scripts/report-regression-local.mjs --fixture B`
- **fixture_ids**: `B`
- **target_environment**: `http://localhost:3000`
- **latest_run_id**: `20260719T045622Z_fixture-B`
- **verdict**: `green` (== `required_green`)
- **exit_code**: `0`
- **artifact_paths**:
  `.agent/regression_runs/20260719T045622Z_fixture-B/{metadata.json, structural_checks.json, verdict.md}`
- **report_char_count**: `10407`
- **capture_scope**: `main section`
- **fallback_used**: `false`
- **red_checks_failed**: `0`
- **amber_checks_failed**: `0`
- **cost_measured**: `no`
- **estimated_cost**: `≈ $0.05` (Sonnet 4.6 baseline · same as prior)
- **duration_ms**: `67719`
- **baseline_promoted**: `no`
- **production_target_used**: `no`
- **reviewer_action_required**: `none beyond normal AgentOps checkpoints`
- **push_implication**: `push eligible after human approval`

## Result headline

- **First honest GREEN on Fixture B, first try.** 25/25 checks passed.
  `capture_scope="main section"`, `fallback_used=false`, chars 10407 in
  1500-14000 band, duration 67.7s.
- **All fixture-specific B checks passed.** Zero must-not-happen matches
  on the new B literal list (`learn react` / `beginner react` /
  `beginner typescript` / `as an ai language model`). Recommendation-match
  hit **all 5** B-specific keywords (`agent`, `tool call`, `tool-call`,
  `eval`, `telemetry`) — the report clearly targeted the AI Product
  Engineer archetype.
- **Harness generalizes beyond Fixture A.** The marker-scored capture
  strategy and length band from AgentOps-3e-tune-2 worked cleanly on B
  with no re-tuning needed.
- **Fixture A default behavior preserved.** Code inspection confirms
  no A path/literals/keywords changed.
- **DECISION-eligible.**

## Files changed (this loop)

| file | change | committed |
|---|---|---|
| `.agent/tasks/2026-07-19_run_01_TASK.md` | new · 273 lines | ✅ `0b99358` |
| `scripts/report-regression-local.mjs` | +71 / −22 · added `FIXTURE_TABLE` + `parseArgs()` + wired 4 fixture-aware sites | ✅ `0b99358` |
| `.agent/regression_runs/20260719T045622Z_fixture-B/metadata.json` | new · 64 lines | ✅ `0b99358` |
| `.agent/regression_runs/20260719T045622Z_fixture-B/structural_checks.json` | new · ~185 lines | ✅ `0b99358` |
| `.agent/regression_runs/20260719T045622Z_fixture-B/verdict.md` | new · 27 lines | ✅ `0b99358` |
| `.agent/run_reports/2026-07-19_run_01_RUN_REPORT.md` | new · this file | ⏳ pending |

Large artifacts (NOT committed, scratchpad only):
- `/var/folders/xx/…/T/acr-regression-runs/20260719T045622Z_fixture-B/report.md`
- `/var/folders/xx/…/T/acr-regression-runs/20260719T045622Z_fixture-B/report.png`

## Harness change · minimal `--fixture B` support

The old harness had `FIXTURE_PATH`, `mustNotLiterals`, and
`recommendationKeywords` hardcoded to A. The change introduces one
`FIXTURE_TABLE` lookup and a 15-line `parseArgs()` helper, then rewires
4 sites to read from `FIXTURE_TABLE[fixtureId]`.

### Diff shape

- **New**: `FIXTURE_TABLE = { A: {path, mustNotLiterals, recommendationKeywords}, B: {...} }` (~30 lines)
- **New**: `parseArgs()` returns `{ fixtureId }`, defaults to `A`, throws on unknown ID
- **Rewired**: `readFile(FIXTURE_PATH, ...)` → `readFile(fixturePath, ...)` where `fixturePath = path.join(REPO_ROOT, fixtureCfg.path)`
- **Rewired**: `runId = utcRunStamp() + "_fixture-A"` → `runId = utcRunStamp() + "_fixture-" + fixtureId`
- **Rewired**: must-not-happen literal loop reads from `fixtureCfg.mustNotLiterals`
- **Rewired**: recommendation-match check reads from `fixtureCfg.recommendationKeywords` (now returns any-keyword-hit rather than the old hardcoded RAG/eval/retrieval-only pattern; A's behavior for A still matches by keeping the A list identical)
- **Rewired**: summary log line uses `fixture=${fixtureId}` instead of literal `fixture=A`

### Fixture A default preserved (verified)

```bash
$ grep -n "benchmark_A_backend_to_applied_ai\|learn python\|beginner python\|\"rag\"\|\"retrieval\"" scripts/report-regression-local.mjs
50:    path: ".agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md",
52:      "learn python",
53:      "beginner python",
56:    recommendationKeywords: ["rag", "eval", "retrieval"],
```

A's fixture path, must-not-happen literals, and recommendation keywords
are still present verbatim, only nested inside `FIXTURE_TABLE.A`. When
the harness is invoked without `--fixture`, `parseArgs()` returns
`fixtureId = "A"`, which selects the same values as before.

### Unknown-fixture guard

```bash
$ node scripts/report-regression-local.mjs --fixture Z
report-regression-local: fatal error
Error: Unknown fixture: Z. Supported: A, B
```

Fails fast before any browser work, no dev server needed to reject.

### What was NOT changed

- `extractReportText` (marker-scored candidate selection) · unchanged
- `CANDIDATE_SELECTORS` · unchanged
- `REPORT_SECTION_MARKERS` · unchanged
- `EVIDENCE_APPENDIX_RE` · unchanged
- `REPORT_LEN_SOFT_MIN=1500` · unchanged
- `REPORT_LEN_SOFT_MAX=14000` · unchanged
- `SOFT_LATENCY_MS`, `HARD_LATENCY_MS` · unchanged
- `assertLocalhost` and `ALLOWED_HOSTS` · unchanged
- `.env*` policy · unchanged (nothing read)
- No new npm dependency · no `package.json` change

## Run summary

- **run_id**: `20260719T045622Z_fixture-B`
- **base_url**: `http://localhost:3000`
- **fixture**: B (v1)
- **duration**: **67719 ms** (≈ 67.7 s · below 120 s soft, well below 240 s hard)
- **verdict**: **GREEN**
- **exit_code**: **0**
- **git_commit_sha (at run time)**: `437b5cccc9d24ab43cd82381c65e9a14a725cf2c`
- **corpus_snapshot_date**: `May 14, 2026`
- **model_display**: `Claude Sonnet 4.6`
- **console_errors**: `[]`
- **one real generation happened**: ✅ (1/1 · no retry)
- **API cost measured**: ❌ (bounded by policy, not measurement)
- **cost_cap_enforced_by**: `single_generation_limit`
- **estimated cost**: **≈ $0.05** (Sonnet 4.6 baseline)

## Key fields

| field | value |
|---|---|
| `capture_scope` | **`main section`** ✅ (not `body_fallback`) |
| `capture_strategy` | `shortest-qualified-candidate` |
| `fallback_used` | **`false`** ✅ |
| `report_char_count` (selected) | **10407** |
| `report_length_soft_min` | 1500 |
| `report_length_soft_max` | 14000 |
| `page_body_char_count` (obs) | 16983 |
| `candidate_count` | 8 |
| `qualified_candidate_count` | 2 (`main section` @ 10407 chosen · `main` @ 16648) |
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
| report_non_empty | structural | red | ✅ | 10407 chars |
| report_text_capture_success | structural | red | ✅ | `scope=main section strategy=shortest-qualified-candidate candidates=8 qualified=2` |
| report_capture_scope_not_body | structural | amber | ✅ | `scope=main section fallback_used=false page_body_chars=16983` |
| contains_section_target_role | structural | red | ✅ | |
| contains_section_what_you_already_have | structural | red | ✅ | |
| contains_section_top_5_gaps | structural | red | ✅ | |
| contains_section_over-prioritizing | structural | red | ✅ | |
| contains_section_highest-leverage_next_action | structural | red | ✅ | |
| contains_evidence_appendix | structural | red | ✅ | |
| report_length_in_soft_band | structural | amber | ✅ | `chars=10407 band=1500-14000` |
| action_bar_buttons_present | structural | amber | ✅ | Copy / Download / Eval / Start over all visible |

## Fixture-specific checks (4 · all passed)

| check | level | pass | detail |
|---|---|---|---|
| at_least_2_strengths_reflected | amber | ✅ | ≥2 strength tokens hit on Fixture B expected strengths |
| at_least_2_gaps_reflected | amber | ✅ | ≥2 gap tokens hit on Fixture B expected gaps |
| **must_not_happen_absent** | red | ✅ | **no matches** (0 hits on `learn react` / `beginner react` / `beginner typescript` / `as an ai language model`) |
| **recommendation_roughly_matches_expected** | amber | ✅ | `keywords=[agent,tool call,tool-call,eval,telemetry] hits=[agent,tool call,tool-call,eval,telemetry]` (**5/5**) |

## Operational checks (4 · all passed)

| check | level | pass | detail |
|---|---|---|---|
| duration_under_soft_threshold | amber | ✅ | 67719 ms < 120000 ms |
| duration_under_hard_threshold | red | ✅ | 67719 ms < 240000 ms |
| no_fatal_playwright_error | red | ✅ | |
| no_production_target | red | ✅ | localhost |

## Comparison to Fixture A baseline (context only · not pass/fail)

The Fixture A baseline (`fixture-A_20260714T025246Z_current`) is
**not** a Fixture B pass/fail baseline. Comparing anyway for context to
show the harness produces consistent shape across fixtures.

| dimension | Fixture A baseline (context) | Fixture B new run | note |
|---|---|---|---|
| verdict | green | **green** | same |
| exit_code | 0 | 0 | same |
| capture_scope | main section | **main section** | same |
| capture_strategy | shortest-qualified-candidate | shortest-qualified-candidate | same |
| fallback_used | false | **false** | same |
| report_char_count | 9837 | 10407 | +570 (+5.8%) · normal LLM variance |
| page_body_char_count | 16569 | 16983 | +414 (+2.5%) |
| duration_ms | 66610 | 67719 | +1109 (+1.7%) |
| candidates / qualified | 9 / 2 | 8 / 2 | −1 · page jitter (does not affect verdict) |
| markers 5/5 + evidence | ✅ | ✅ | same |
| Candidate 1 sentinel | ✅ | ✅ | same |
| must_not_happen matches | 0 (A literals) | 0 (B literals) | both clean |
| recommendation match | RAG/eval/retrieval (A) | agent/tool-call/eval/telemetry (B) 5/5 | fixture-specific |
| 25 / 25 checks pass | ✅ | ✅ | same shape |

This is not a promotion signal — Fixture B has only one run. It **is**
strong evidence that the harness generalizes and that Fixture B's own
signals (agent + tool-call + eval + telemetry keywords in a report about
an AI Product Engineer transition) look healthy.

## Is Fixture B eligible for future baseline consideration?

**Yes, but not yet.** AgentOps-3g memo §5 (eligibility) is satisfied by
this single run:
- verdict green ✅
- exit_code 0 ✅
- fixture_id / fixture_version known ✅
- `capture_scope != body_fallback` ✅
- `fallback_used == false` ✅
- all red / amber / fixture / operational checks pass ✅
- no production target ✅
- no baseline promotion attempted in the run ✅
- no forbidden repo diff ✅
- no unresolved incident ✅
- cost + duration within bound (≈ $0.05 · 67.7 s) ✅

But §6 (additional promotion criteria) requires **human approval + ChatGPT
review + explicit DECISION** — plus §17 executor preference for **one
stability re-run** before promotion. So:

- **Do NOT** promote Fixture B baseline in this loop (the TASK explicitly
  forbids it).
- **Next appropriate step after this DECISION**: `AgentOps-4a-stability`
  — one Fixture B re-run to confirm the GREEN is not luck, mirroring
  how AgentOps-3g-stability preceded AgentOps-3g-2 for Fixture A.
- **Then**: `AgentOps-4b` (or `AgentOps-4a-2`) — a dedicated Fixture B
  baseline promotion loop that creates
  `.agent/regression_baselines/fixture-B/current/` with lightweight files.

## Recommendation logic (matches TASK spec)

- **This run is clean GREEN.** → Recommend DECISION `approve` for the
  harness change + Fixture B run, then push. **Do NOT promote Fixture B
  baseline in the same push.** Next TASK should be an
  AgentOps-4a-stability re-run (single Fixture B run, no code change).
- If it had been AMBER → would explain calibration vs product-risk
  before recommending.
- If it had been RED → would recommend fix/revert/analyze before push.

## Why the 20 uploaded PDFs were NOT ingested this loop

Per TASK constraint: uploaded PDFs are external material that belongs
in a **separate intake loop**. Handling them here would:
- risk committing personal / real-user data (PDFs are external to
  the fixture design which explicitly requires synthetic content)
- inflate scope beyond a single Fixture B run
- couple governance (baseline design assumes synthetic-only) to a data
  ingestion decision that has not been made yet

The right shape for the intake loop, whenever it happens:
- separate TASK with its own risk assessment
- explicit read-only handling (extract text with anonymization / redaction
  policy · never commit raw PDFs)
- decide storage: scratchpad only or a new
  `.agent/anonymized_resumes/` policy path
- explicit DECISION before any file lands in the repo

Not this loop. Not now.

## Local run record

- Preflight: `curl` to `localhost:3000` → `000` (no server).
- Started `npm run dev > /tmp/dev-4a-fixture-b.log 2>&1 &` → PID 90439.
  Wait 8 s → `curl` → `200`. Ready.
- Ran `node scripts/report-regression-local.mjs --fixture B` once.
- Runtime output:
  ```
  report-regression-local · run_id=20260719T045622Z_fixture-B fixture=B verdict=GREEN exit=0 scope=main section chars=10407 body_chars=16983 candidates=8/2 duration_ms=67719
    committed artifacts under: .agent/regression_runs/20260719T045622Z_fixture-B/
    scratchpad: /var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260719T045622Z_fixture-B
  ```
- `kill 90439` after run; `curl` → `000` (server stopped).
- **One** real generation total. No retry. Under 2-generation cap.

## Artifact policy

- **Committed** (small · in-repo):
  `.agent/regression_runs/20260719T045622Z_fixture-B/metadata.json`
  (~2.0 KB), `structural_checks.json` (~6 KB), `verdict.md` (~1 KB).
- **Scratchpad** (large · NOT committed): `report.md` (~10 KB),
  `report.png` (screenshot). Paths recorded in `metadata.json`'s
  `scratch_paths`.

## Why report.md / screenshot were NOT committed

Same v1 policy as AgentOps-3 arc (memo §7 + §15): keep the in-repo
per-run footprint to the three small files above. Report at 10 KB is
small in absolute terms but scales badly across fixtures × runs ×
cadence; screenshots are binary and low signal-per-KB.

## Forbidden-file audit · empty-diff sweep · full CLEAN

- `src/**` — untouched (any file)
- `src/data/**` — untouched
- `src/lib/**` — untouched
- `src/app/api/**` — untouched
- `src/app/page.tsx` — untouched
- `.agent/scripts/**` — **untouched** (hard rule per AgentOps-2c Q3-Q8)
- `.agent/blockers.md` — untouched (BLK-0001/2/3 all `open`)
- `.agent/automation_queue.md` — untouched (QUEUE-0002 still
  `blocked_pending_human`)
- **`.agent/regression_fixtures/**` — untouched** (Fixture B file
  read-only)
- **`.agent/regression_baselines/**` — untouched** (Fixture A baseline
  read-only · no Fixture B baseline dir created)
- **`.agent/baselines/**` — NOT CREATED**
- **`.agent/regression_baselines/fixture-B/**` — NOT CREATED**
- **`baselines/**` — NOT CREATED**
- `.agent/planner_reports/**` — **not created**
- `.agent/policies/**` — untouched
- Pipeline repo (any file) — untouched (`HEAD b019786` unchanged start
  AND end)
- `sources.yaml`, `corpus/**`, `scripts/collector/**` — untouched
- `.github/workflows/**` — untouched
- `package.json`, `package-lock.json` — untouched (no new dep)
- `.env*` — not read by harness
- `vercel.json` — untouched
- Codex / Claude config files — untouched
- Production deployment config — untouched
- **Uploaded PDFs** — NOT committed anywhere (find sweep confirmed)
- **`report.md`** anywhere — NOT committed
- **`screenshot.png` / `*.png`** anywhere — NOT committed

## Validation results

```
$ git diff --name-only origin/main..HEAD
.agent/regression_runs/20260719T045622Z_fixture-B/metadata.json
.agent/regression_runs/20260719T045622Z_fixture-B/structural_checks.json
.agent/regression_runs/20260719T045622Z_fixture-B/verdict.md
.agent/tasks/2026-07-19_run_01_TASK.md
scripts/report-regression-local.mjs

$ node --check scripts/report-regression-local.mjs
(no output · syntax OK)

$ node scripts/report-regression-local.mjs --fixture Z
Error: Unknown fixture: Z. Supported: A, B  (fails fast, no side effect)

$ find .agent -name 'report.md' 2>/dev/null
(empty)

$ find .agent -name '*.pdf' 2>/dev/null
(empty)

$ [ ! -d .agent/baselines ] && [ ! -d baselines ] && [ ! -d .agent/regression_baselines/fixture-B ] && echo OK
OK
```

## Confirmations · 30 items

| item | status |
|---|---|
| Local run executed | ✅ (`0b99358` includes 3 run artifacts) |
| One real generation happened | ✅ (10407 chars from `main section`) |
| Capture_scope | ✅ `main section` (not `body_fallback`) |
| Fallback_used | ✅ `false` |
| page_body_char_count | ✅ 16983 |
| report_char_count | ✅ 10407 |
| Verdict | ✅ **GREEN** |
| Exit code | ✅ **0** |
| Duration | ✅ 67719 ms |
| All red checks passed | ✅ 15/15 |
| All amber checks passed | ✅ 9/9 |
| must_not_happen matches | ✅ 0 (B literals) |
| recommendation-match hits | ✅ 5/5 (agent · tool call · tool-call · eval · telemetry) |
| Fixture A default preserved | ✅ (grep + code inspection) |
| Unknown-fixture guard | ✅ (`--fixture Z` fails fast) |
| Fixture B eligible for future baseline consideration | ✅ (§5 satisfied · §6 pending stability + DECISION) |
| No baseline promotion | ✅ |
| No Fixture B baseline dir created | ✅ |
| No `.agent/regression_baselines/**` changes | ✅ (A read-only) |
| No `.agent/regression_fixtures/**` changes | ✅ (B file read-only) |
| No production target | ✅ (harness hard-rejects non-localhost) |
| No A-E full-suite invocation | ✅ (B only) |
| No fixtures C/D/E run | ✅ |
| No uploaded PDFs committed | ✅ (find sweep) |
| No full report/screenshot committed | ✅ (scratchpad only) |
| No `.agent/scripts/**` changes | ✅ (hard rule) |
| No `src/**` changes | ✅ |
| No pipeline changes | ✅ (`b019786` unchanged start AND end) |
| No collector / corpus refresh | ✅ |
| No OpenAI API from harness | ✅ (browser driver only) |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read | ✅ |
| No `vercel.json` / `.vercel/**` changes | ✅ |
| No `.github/workflows/**` changes | ✅ |
| No push / no manual deploy | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d still `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains spec-only | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |

## Recommendation

- **Human + ChatGPT review** of the harness diff + this RUN_REPORT +
  `verdict.md` + `metadata.json` + `structural_checks.json` for
  `20260719T045622Z_fixture-B`.
- Then write **DECISION** for `2026-07-19_run_01`.
- Suggested DECISION direction (executor's opinion, not binding):
  - **verdict**: `approve` — clean first-try GREEN on B; harness
    change is minimal and A-preserving; no forbidden path; no scope
    creep; every AgentOps-3 constraint respected.
  - **human_approval_needed**: `yes`.
  - **Next default loop**: **AgentOps-4a-stability** — one more Fixture
    B run, no code change, mirrors AgentOps-3g-stability. Adds ≈$0.05,
    ~70s, catches lucky-green risk before B baseline promotion.
  - **Then**: **AgentOps-4b** (or `4a-2`) — Fixture B baseline
    promotion loop, mirrors AgentOps-3g-2. Creates
    `.agent/regression_baselines/fixture-B/current/` with lightweight
    files. No new generation (reuses this run's artifacts if approved
    at that time).
  - Explicitly DEFER: uploaded PDF intake, A-E full suite, production
    testing, Codex planner implementation, C/D/E fixtures, OpenAI API,
    BLK-0001/2/3 resolution.

## Standing do-NOTs (unchanged from prior loops)

- Do NOT run A-E full suite.
- Do NOT run fixtures C/D/E.
- Do NOT ingest uploaded PDFs.
- Do NOT promote baseline.
- Do NOT create Fixture B baseline.
- Do NOT modify Fixture A baseline.
- Do NOT modify `.agent/regression_baselines/**`.
- Do NOT modify `.agent/regression_fixtures/**`.
- Do NOT test production.
- Do NOT click Eval.
- Do NOT modify `src/**`.
- Do NOT modify `.agent/scripts/**`.
- Do NOT modify pipeline.
- Do NOT modify prompts.
- Do NOT modify model selection.
- Do NOT modify report generation route.
- Do NOT implement Codex planner.
- Do NOT create `.agent/planner_reports/`.
- Do NOT call Anthropic/OpenAI outside the local app.
- Do NOT introduce OpenAI API.
- Do NOT run collector.
- Do NOT refresh corpus.
- Do NOT modify GitHub Actions.
- Do NOT add dependencies.
- Do NOT modify `package.json` or `package-lock.json`.
- Do NOT push.
- Do NOT deploy.

## Stop condition · reached expected end state

RUN_REPORT written. Awaiting human review + DECISION for
`2026-07-19_run_01`. No push. No deploy. No further Playwright run. No
LLM call. No baseline file created. No PDF ingested.
