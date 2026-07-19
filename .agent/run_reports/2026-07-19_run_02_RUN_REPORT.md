# RUN_REPORT · AgentOps-4a-stability · Fixture B stability re-run

## Metadata

- **task_id**: `2026-07-19_run_02`
- **date**: `2026-07-19`
- **loop**: `AgentOps-4a-stability`
- **parent_loop**: `AgentOps-4a` (`2026-07-19_run_01`)
- **grandparent_loop**: `AgentOps-3g-2` (`2026-07-12_run_09`)
- **TASK**: `.agent/tasks/2026-07-19_run_02_TASK.md`
- **fixture file**: `.agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md`
- **previous_fixture_B_run_id**: `20260719T045622Z_fixture-B`
- **new_run_id**: `20260719T054151Z_fixture-B`
- **impl_commit**: `f257932`
- **repo**: `/Users/bohaoli/Desktop/ai-career-radar-web`
- **branch**: `main`
- **base_commit_before**: `0341461`
- **base_commit_after**: `f257932` (impl only; RUN_REPORT commit to follow)

## Regression verdict

- **regression_required**: `yes`
- **reason_required_or_not**: Stability re-run before Fixture B baseline
  promotion. Second Fixture B data point required to rule out lucky-green
  risk before AgentOps-4b promotes B baseline (mirror of
  AgentOps-3g-stability's role before AgentOps-3g-2 for Fixture A).
- **harness_used**: `yes`
- **harness_command**: `node scripts/report-regression-local.mjs --fixture B`
- **fixture_ids**: `B`
- **target_environment**: `http://localhost:3000`
- **latest_run_id**: `20260719T054151Z_fixture-B`
- **verdict**: `green` (== `required_green`)
- **exit_code**: `0`
- **artifact_paths**:
  `.agent/regression_runs/20260719T054151Z_fixture-B/{metadata.json, structural_checks.json, verdict.md}`
- **report_char_count**: `10445`
- **capture_scope**: `main section`
- **fallback_used**: `false`
- **red_checks_failed**: `0`
- **amber_checks_failed**: `0`
- **cost_measured**: `no`
- **estimated_cost**: `≈ $0.05` (Sonnet 4.6 · same as prior)
- **duration_ms**: `67608`
- **baseline_promoted**: `no`
- **production_target_used**: `no`
- **reviewer_action_required**: `none beyond normal AgentOps checkpoints`
- **push_implication**: `push eligible after human approval`

## Result headline

- **Second consecutive GREEN on Fixture B.** No code changes.
- **Stability is textbook**: `report_char_count` moved 10407 → 10445
  (**+0.4%**, essentially flat), `duration_ms` moved 67719 → 67608
  (**−0.2%**, essentially flat). Both well inside the pre-declared
  ±30% / 2× tolerance bands.
- **All 25 checks passed, all 5/5 fixture-specific hit rates preserved**:
  strengths 5/5, gaps 5/5, must-not 0, recommendation 5/5. Report is
  targeting the AI Product / agent-tooling direction consistently.
- **Zero harness change.** `scripts/report-regression-local.mjs` at
  `0341461` (as pushed in AgentOps-4a).
- **Clears the way for AgentOps-4b baseline promotion.**
- **DECISION-eligible.**

## Files changed (this loop)

| file | change | committed |
|---|---|---|
| `.agent/tasks/2026-07-19_run_02_TASK.md` | new · 280 lines | ✅ `f257932` |
| `.agent/regression_runs/20260719T054151Z_fixture-B/metadata.json` | new · 64 lines | ✅ `f257932` |
| `.agent/regression_runs/20260719T054151Z_fixture-B/structural_checks.json` | new · ~185 lines | ✅ `f257932` |
| `.agent/regression_runs/20260719T054151Z_fixture-B/verdict.md` | new · 27 lines | ✅ `f257932` |
| `.agent/run_reports/2026-07-19_run_02_RUN_REPORT.md` | new · this file | ⏳ pending |

Large artifacts (NOT committed, scratchpad only):
- `/var/folders/xx/…/T/acr-regression-runs/20260719T054151Z_fixture-B/report.md`
- `/var/folders/xx/…/T/acr-regression-runs/20260719T054151Z_fixture-B/report.png`

**Harness NOT modified.** `scripts/report-regression-local.mjs` diff is
empty for this loop.

## Run summary

- **run_id**: `20260719T054151Z_fixture-B`
- **base_url**: `http://localhost:3000`
- **fixture**: B (v1)
- **command**: `node scripts/report-regression-local.mjs --fixture B`
- **duration**: **67608 ms** (≈ 67.6 s · below 120 s soft, well below 240 s hard)
- **verdict**: **GREEN**
- **exit_code**: **0**
- **git_commit_sha (at run time)**: `0341461ab008db20277d9d3f59bddd7b400f0eb4`
- **corpus_snapshot_date**: `May 14, 2026`
- **model_display**: `Claude Sonnet 4.6`
- **console_errors**: `[]`
- **one real generation happened**: ✅ (1/1 · no retry)
- **API cost measured**: ❌ (still bounded by policy)
- **cost_cap_enforced_by**: `single_generation_limit`
- **estimated cost**: **≈ $0.05** (Sonnet 4.6 baseline · same as prior B run)

## Key fields

| field | value |
|---|---|
| `capture_scope` | **`main section`** ✅ |
| `capture_strategy` | `shortest-qualified-candidate` |
| `fallback_used` | **`false`** ✅ |
| `report_char_count` (selected) | **10445** |
| `report_length_soft_min` | 1500 |
| `report_length_soft_max` | 14000 |
| `page_body_char_count` (obs) | 17007 |
| `candidate_count` | 8 |
| `qualified_candidate_count` | 2 (`main section` @ 10445 chosen · `main` @ 16672) |
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
| report_non_empty | structural | red | ✅ | 10445 chars |
| report_text_capture_success | structural | red | ✅ | `scope=main section strategy=shortest-qualified-candidate candidates=8 qualified=2` |
| report_capture_scope_not_body | structural | amber | ✅ | `scope=main section fallback_used=false page_body_chars=17007` |
| contains_section_target_role | structural | red | ✅ | |
| contains_section_what_you_already_have | structural | red | ✅ | |
| contains_section_top_5_gaps | structural | red | ✅ | |
| contains_section_over-prioritizing | structural | red | ✅ | |
| contains_section_highest-leverage_next_action | structural | red | ✅ | |
| contains_evidence_appendix | structural | red | ✅ | |
| report_length_in_soft_band | structural | amber | ✅ | `chars=10445 band=1500-14000` |
| action_bar_buttons_present | structural | amber | ✅ | Copy / Download / Eval / Start over all visible |

## Fixture-specific checks (4 · all passed)

| check | level | pass | detail |
|---|---|---|---|
| at_least_2_strengths_reflected | amber | ✅ | `hits=5/5` |
| at_least_2_gaps_reflected | amber | ✅ | `hits=5/5` |
| **must_not_happen_absent** | red | ✅ | **no matches** (`learn react` / `beginner react` / `beginner typescript` / `as an ai language model`) |
| **recommendation_roughly_matches_expected** | amber | ✅ | `keywords=[agent,tool call,tool-call,eval,telemetry] hits=[agent,tool call,tool-call,eval,telemetry]` (**5/5**) |

## Operational checks (4 · all passed)

| check | level | pass | detail |
|---|---|---|---|
| duration_under_soft_threshold | amber | ✅ | 67608 ms < 120000 ms |
| duration_under_hard_threshold | red | ✅ | 67608 ms < 240000 ms |
| no_fatal_playwright_error | red | ✅ | |
| no_production_target | red | ✅ | localhost |

## Stability comparison · previous B run vs this run

| dimension | previous (4a · `20260719T045622Z_fixture-B`) | new (4a-stability · `20260719T054151Z_fixture-B`) | delta | pct | within tolerance? |
|---|---|---|---|---|---|
| verdict | GREEN | **GREEN** | — | — | ✅ same |
| exit_code | 0 | **0** | 0 | — | ✅ same |
| capture_scope | `main section` | `main section` | — | — | ✅ same |
| capture_strategy | `shortest-qualified-candidate` | `shortest-qualified-candidate` | — | — | ✅ same |
| fallback_used | `false` | `false` | — | — | ✅ stayed false |
| **report_char_count** | 10407 | **10445** | **+38** | **+0.4%** | ✅ well within ±30% |
| page_body_char_count | 16983 | 17007 | +24 | +0.1% | ✅ (obs only) |
| **duration_ms** | 67719 | **67608** | **−111** | **−0.2%** | ✅ well within 2× (0.998×) |
| candidate_count | 8 | 8 | 0 | — | ✅ same |
| qualified_candidate_count | 2 | 2 | 0 | — | ✅ same |
| selected_candidate_marker_count | 5/5 | 5/5 | — | — | ✅ same |
| selected_candidate_has_evidence | true | true | — | — | ✅ same |
| red_checks_failed | 0 | 0 | 0 | — | ✅ same |
| amber_checks_failed | 0 | 0 | 0 | — | ✅ same |
| checks total / passed | 25 / 25 | 25 / 25 | — | — | ✅ same |
| Candidate 1 sentinel intact | ✅ | ✅ | — | — | ✅ same |
| console_errors | 0 | 0 | 0 | — | ✅ same |
| corpus_snapshot_date | May 14, 2026 | May 14, 2026 | — | — | ✅ same |
| model_display | Claude Sonnet 4.6 | Claude Sonnet 4.6 | — | — | ✅ same |

## Fixture-specific keyword hit comparison

| check detail | 4a run | 4a-stability run | delta |
|---|---|---|---|
| strengths hit rate | 5/5 | **5/5** | ✅ same |
| gaps hit rate | 5/5 | **5/5** | ✅ same |
| must_not_happen matches | 0 | **0** | ✅ same |
| recommendation keywords hit | 5/5 (agent, tool call, tool-call, eval, telemetry) | **5/5 (agent, tool call, tool-call, eval, telemetry)** | ✅ same set |

Not one keyword flipped between runs. The report **consistently** targets
the AI Product / agent-tooling direction across two independent
generations.

## Stability analysis

**Stability confirmed. Textbook result.**

Binary quality signals **all preserved**:
- verdict green
- exit code 0
- non-body capture (`main section`)
- `fallback_used=false`
- all 5 required section markers + Evidence Appendix
- Candidate 1 sentinel intact
- 25/25 checks pass
- zero must-not-happen matches
- 5/5 recommendation-match keyword hits (identical set)
- 5/5 strengths + 5/5 gaps

Continuous metrics **essentially flat**:
- report length: **+0.4%** (well within ±30% band; smaller than A's
  stability run which was −16.4%)
- duration: **−0.2% / 0.998×** (well within 2× band; smaller than A's
  stability run which was −12.1%)

Interpretation: the AgentOps-4a first-try GREEN was **not** lucky. Two
consecutive independent generations at ~50 minutes apart with no code
change reproduced every load-bearing signal AND the numeric shape.
Fixture B is at least as reproducible as Fixture A was at the
equivalent point in its lifecycle (3e-tune-2 → 3g-stability had wider
run-to-run variance and still passed).

## Comparison to Fixture A baseline (context only · not pass/fail)

Fixture A baseline is **not** a Fixture B pass/fail baseline. Context
only:

| dimension | A baseline (context) | B first run (4a) | B stability run (this) |
|---|---|---|---|
| verdict / exit | green / 0 | green / 0 | **green / 0** |
| capture_scope | main section | main section | main section |
| fallback_used | false | false | false |
| report_char_count | 9837 | 10407 | 10445 |
| duration_ms | 66610 | 67719 | 67608 |
| markers 5/5 + evidence | ✅ | ✅ | ✅ |
| 25/25 checks | ✅ | ✅ | ✅ |
| recommendation-match | A keywords | B 5/5 | **B 5/5** |
| must-not-happen matches | 0 (A) | 0 (B) | 0 (B) |

Cross-fixture comparison is harness-behavior context only (memo §11
· v1 comparison is metadata/structure-only per-fixture).

## Whether Fixture B stability is confirmed

**Yes.** Two consecutive GREENs with essentially identical numeric
shape (chars +0.4%, duration −0.2%) and identical fixture-specific
keyword hit patterns (5/5 strengths, 5/5 gaps, 5/5 recommendation, 0
must-not-happen). Textbook.

## Whether Fixture B is eligible for future baseline consideration

**Yes.** All AgentOps-3g memo §5 eligibility criteria are met for a
Fixture B baseline candidate:

- ✅ `verdict == green`
- ✅ `exit_code == 0`
- ✅ `fixture_id=B`, `fixture_version=1` known
- ✅ `capture_scope != body_fallback`
- ✅ `fallback_used == false`
- ✅ All 15 red-level checks pass
- ✅ All 9 amber-level checks pass
- ✅ All 4 fixture-specific checks pass
- ✅ All 4 operational checks pass
- ✅ `no_production_target` red check passed
- ✅ No baseline promotion attempted in this run
- ✅ No forbidden repo diff at run time
- ✅ No unresolved incident in this RUN_REPORT
- ✅ Cost within bound (≈ $0.05 ≤ $0.25)
- ✅ Duration within bound (67608 ms < 240000 ms)

§6 (additional promotion criteria) will apply in the AgentOps-4b
promotion loop itself — human approval, ChatGPT review, explicit
DECISION naming the candidate `run_id`, size sanity, no full report
committed, no secrets. All achievable at 4b time.

## Recommendation logic (matches TASK spec)

- **This run is clean GREEN and stable.** → Recommend DECISION
  `approve` for the stability re-run, then push. **Next loop =
  AgentOps-4b · promote Fixture B baseline** using the newer run
  (`20260719T054151Z_fixture-B`) — fresher commit sha (`0341461`),
  slightly higher marker/keyword confidence (identical to first run
  but second GREEN adds validation weight).
- Mirrors the AgentOps-3g-stability → AgentOps-3g-2 workflow that
  worked cleanly for Fixture A.

Alternative: promote the first run (`20260719T045622Z_fixture-B`).
Both would work; executor mild preference is the **newer** run for
`source_commit_sha` freshness — same rationale as
AgentOps-3g-stability's preference for the newer A run.

## Why the 20 uploaded PDFs were NOT ingested this loop

Per TASK constraint: uploaded PDFs are external material that belongs
in a **separate intake loop** with its own anonymization / storage
policy DECISION. Handling them here would:
- risk committing personal / real-user data
- inflate scope beyond one Fixture B stability re-run
- couple governance (baseline design assumes synthetic-only) to a
  data ingestion decision that has not been made yet

The right shape for the intake loop, whenever it happens:
- separate TASK with its own risk assessment
- explicit read-only handling (extract text with anonymization
  policy · never commit raw PDFs)
- decide storage: scratchpad only or a new
  `.agent/anonymized_resumes/` policy path
- explicit DECISION before any file lands in the repo

Not this loop. Not now.

## Local run record

- Preflight: `curl` to `localhost:3000` → `000` (no server).
- Started `npm run dev > /tmp/dev-4a-stability-fixture-b.log 2>&1 &`
  → PID 91387. Wait 8 s → `curl` → `200`. Ready.
- Ran `node scripts/report-regression-local.mjs --fixture B` once (real
  generation through Next.js runtime using `.env.local` Anthropic key).
- Runtime output:
  ```
  report-regression-local · run_id=20260719T054151Z_fixture-B fixture=B verdict=GREEN exit=0 scope=main section chars=10445 body_chars=17007 candidates=8/2 duration_ms=67608
    committed artifacts under: .agent/regression_runs/20260719T054151Z_fixture-B/
    scratchpad: /var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260719T054151Z_fixture-B
  ```
- `kill 91387` after run; `curl` → `000` (server stopped).
- **One** real generation total. No retry needed. Under 2-generation cap.
- **Harness NOT modified** (verified by `git diff --stat` empty on
  script file · verified by identical `capture_strategy` output).

## Artifact policy

- **Committed** (small · in-repo):
  `.agent/regression_runs/20260719T054151Z_fixture-B/metadata.json`
  (~2.1 KB), `structural_checks.json` (~6 KB), `verdict.md` (~1 KB).
- **Scratchpad** (large · NOT committed): `report.md` (~10 KB),
  `report.png` (screenshot). Paths recorded in `metadata.json`'s
  `scratch_paths`.

## Why report.md / screenshot were NOT committed

Same v1 policy as AgentOps-3 arc (memo §7 + §15): baseline layer stays
lightweight and diff-friendly; large artifacts stay local-only. This
loop inherits and holds that policy.

## Forbidden-file audit · empty-diff sweep · full CLEAN

- **`scripts/report-regression-local.mjs`** — **NOT modified**
  (harness unchanged from AgentOps-4a's `0341461` state)
- `src/**` — untouched (any file)
- `src/data/**` — untouched
- `src/lib/**` — untouched
- `src/app/api/**` — untouched
- `src/app/page.tsx` — untouched
- `.agent/scripts/**` — **untouched** (hard rule per AgentOps-2c
  Q3-Q8)
- `.agent/blockers.md` — untouched (BLK-0001/2/3 all `open`)
- `.agent/automation_queue.md` — untouched (QUEUE-0002 still
  `blocked_pending_human`)
- **`.agent/regression_fixtures/**` — untouched** (B fixture file
  read-only)
- **`.agent/regression_baselines/**` — untouched** (A baseline
  read-only · no B baseline dir created)
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
- **Uploaded PDFs** — NOT committed anywhere (find sweep)
- **`report.md`** anywhere — NOT committed
- **`screenshot.png` / `*.png`** anywhere — NOT committed

## Validation results

```
$ git diff --name-only origin/main..HEAD
.agent/regression_runs/20260719T054151Z_fixture-B/metadata.json
.agent/regression_runs/20260719T054151Z_fixture-B/structural_checks.json
.agent/regression_runs/20260719T054151Z_fixture-B/verdict.md
.agent/tasks/2026-07-19_run_02_TASK.md

$ git diff scripts/report-regression-local.mjs
(no output · harness unmodified)

$ find .agent -name 'report.md' 2>/dev/null
(empty)

$ find .agent -name '*.pdf' 2>/dev/null
(empty)

$ [ ! -d .agent/regression_baselines/fixture-B ] && echo OK
OK
```

## Confirmations · 30 items

| item | status |
|---|---|
| Local run executed | ✅ (`f257932` includes 3 run artifacts) |
| One real generation happened | ✅ (10445 chars from `main section`) |
| Capture_scope | ✅ `main section` (not `body_fallback`) |
| Fallback_used | ✅ `false` |
| page_body_char_count | ✅ 17007 |
| report_char_count | ✅ 10445 |
| report_char_count delta vs previous B | ✅ +38 (+0.4% · well within ±30%) |
| duration_ms | ✅ 67608 |
| duration delta vs previous B | ✅ −111 (−0.2% · 0.998× · well within 2×) |
| Verdict | ✅ **GREEN** |
| Exit code | ✅ **0** |
| All red checks passed | ✅ 15/15 |
| All amber checks passed | ✅ 9/9 |
| must_not_happen matches | ✅ 0 (B literals) |
| recommendation-match hits | ✅ 5/5 (agent · tool call · tool-call · eval · telemetry — identical set) |
| strengths hit rate | ✅ 5/5 |
| gaps hit rate | ✅ 5/5 |
| **Fixture B stability confirmed** | ✅ 25/25 pass twice · both binary + continuous shape stable |
| **Fixture B eligible for baseline consideration** | ✅ yes → AgentOps-4b |
| No baseline promotion | ✅ |
| No Fixture B baseline created | ✅ |
| **No `.agent/regression_baselines/**` changes** | ✅ (A baseline read-only) |
| **No `.agent/regression_fixtures/**` changes** | ✅ (B fixture file read-only) |
| **No `scripts/report-regression-local.mjs` change** | ✅ (harness stable at 4a state · empty diff) |
| **No uploaded PDFs committed** | ✅ (find sweep) |
| No production target | ✅ (harness hard-rejects non-localhost) |
| No A-E full-suite invocation | ✅ (B only) |
| No fixtures C/D/E run | ✅ |
| No full report/screenshot committed | ✅ (scratchpad only) |
| No `.agent/scripts/**` changes | ✅ (hard rule) |
| No `src/**` changes | ✅ |
| **No pipeline tracked-file changes** | ✅ (`b019786` unchanged) |
| No collector / corpus refresh | ✅ |
| No OpenAI API from harness | ✅ (browser driver only) |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read | ✅ |
| No push / no manual deploy | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d still `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains spec-only | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |

## Recommendation

- **Human + ChatGPT review** of this RUN_REPORT + `verdict.md` +
  `metadata.json` + `structural_checks.json` for
  `20260719T054151Z_fixture-B` and side-by-side with the previous B
  run.
- Then write **DECISION** for `2026-07-19_run_02`.
- Suggested DECISION direction (executor's opinion, not binding):
  - **verdict**: `approve` — second consecutive GREEN with textbook
    stability; harness unchanged; every constraint respected; no scope
    creep.
  - **human_approval_needed**: `yes`.
  - **Next default loop**: **AgentOps-4b** — promote Fixture B GREEN as
    the first official Fixture B baseline under
    `.agent/regression_baselines/fixture-B/current/`. Reuse existing
    artifacts. No new generation. Mirror AgentOps-3g-2 workflow
    exactly.
  - Executor mild preference: promote **the newer** run
    (`20260719T054151Z_fixture-B`) because `source_commit_sha` is
    fresher (`0341461` vs `0b99358`) — same rationale as
    AgentOps-3g-stability's preference for the newer A run.
  - Explicitly DEFER: uploaded PDF intake, A-E full suite, C/D/E
    fixtures, production testing, Codex planner implementation, OpenAI
    API, BLK-0001/2/3 resolution.

## Standing do-NOTs (unchanged from prior loops)

- Do NOT modify `scripts/report-regression-local.mjs`.
- Do NOT run A-E full suite.
- Do NOT run fixtures C/D/E.
- Do NOT ingest uploaded PDFs.
- Do NOT promote baseline in this loop.
- Do NOT create Fixture B baseline in this loop.
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
`2026-07-19_run_02`. No push. No deploy. No further Playwright run. No
LLM call. No baseline file created. No PDF ingested.
