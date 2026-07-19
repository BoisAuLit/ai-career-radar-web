# DECISION · AgentOps-4a · Fixture B single regression run

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-19 00:15). Standing in for the
> ChatGPT reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-19_run_01_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-19_run_01_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-19_run_01_TASK.md`
- **loop**: `AgentOps-4a`
- **parent_loop**: `AgentOps-3g-2` (`2026-07-12_run_09`)
- **impl_commit**: `0b99358`
- **run_report_commit**: `5b30943`
- **files_reviewed**:
  - `.agent/tasks/2026-07-19_run_01_TASK.md` (273 lines)
  - `scripts/report-regression-local.mjs` (+71 / −22 · new `FIXTURE_TABLE`
    + `parseArgs()` + 4 fixture-aware sites · A default preserved)
  - `.agent/regression_runs/20260719T045622Z_fixture-B/metadata.json`
    (64 lines · `verdict=green` · `exit_code=0`)
  - `.agent/regression_runs/20260719T045622Z_fixture-B/structural_checks.json`
    (25 checks · all pass)
  - `.agent/regression_runs/20260719T045622Z_fixture-B/verdict.md`
    (27 lines · red = _none_ · amber = _none_)
  - `.agent/run_reports/2026-07-19_run_01_RUN_REPORT.md` (488 lines ·
    dogfoods the 3f `## Regression verdict` section)
  - `.agent/regression_baselines/fixture-A/current/baseline_metadata.json`
    (context only · A baseline unchanged)
  - `.agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md`
    (frozen Fixture B file · read-only)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — first Fixture B run in project history + minimal but real
harness surface expansion (`--fixture` CLI). Push, deploy, and any next
loop all wait for explicit human approval per turn.

## Reasoning summary

AgentOps-4a successfully performed the **first real Fixture B local
report regression run**. The harness was minimally extended with fixture
selection support, **preserving Fixture A default behavior** while
enabling `--fixture B`. The task produced `run_id
20260719T045622Z_fixture-B` with `verdict=green`, `exit_code=0`,
`capture_scope="main section"`, `fallback_used=false`,
`report_char_count=10407`, `page_body_char_count=16983`,
`duration_ms=67719`, markers **5/5** plus Evidence Appendix, no console
errors, and **25/25 checks passing**. Fixture B-specific checks were
especially strong: `must_not_happen_absent` passed with **no matches**,
and `recommendation_roughly_matches_expected` hit **all five** expected
keywords: `agent`, `tool call`, `tool-call`, `eval`, `telemetry`. This
suggests the report was targeted to the AI Product / agent-tooling
direction rather than generic frontend or TypeScript advice. The harness
generalizes cleanly across fixtures, and Fixture A default behavior
remains preserved (verified by both `grep` inspection of A-specific
literals still in place and by the `parseArgs()` default returning
`A`). This loop respected boundaries: no uploaded PDFs ingested or
committed, no Fixture B baseline created, no baseline promotion, no
`.agent/regression_baselines/**` changes, no `src/**` changes, no
`.agent/scripts/**` changes, no pipeline tracked-file changes, no
production target, no A-E expansion, no full report/screenshot
committed, no collector/corpus refresh, no OpenAI API, no GitHub
Actions changes, no push/deploy.

## Approved direction

- **Approve AgentOps-4a.**
- **Accept the minimal harness fixture-selection change.**
- **Accept `20260719T045622Z_fixture-B` as the first validated GREEN
  Fixture B run.**
- **Do NOT promote Fixture B baseline yet.**
- **Do NOT create `.agent/regression_baselines/fixture-B/` yet.**
- **Next default loop after push/cleanup**: **AgentOps-4a-stability** —
  run Fixture B one more time **without code changes** to check for
  lucky GREEN. Mirrors AgentOps-3g-stability's role before 3g-2.
- If AgentOps-4a-stability is also GREEN, then a later **AgentOps-4b**
  loop can promote Fixture B baseline (with lightweight files, no full
  report/screenshot, reusing existing run artifacts if approved at that
  time).
- **Do NOT run C/D/E yet.**
- **Do NOT run A-E full suite.**
- **Do NOT ingest the 20 uploaded resume PDFs yet.** Separate design
  loop first.
- **Do NOT modify `src/**`.**
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify pipeline.**
- **Do NOT implement Codex planner.**
- **Do NOT introduce OpenAI API.**

## Run summary

| field | value |
|---|---|
| run_id | `20260719T045622Z_fixture-B` |
| fixture | B (v1) |
| command | `node scripts/report-regression-local.mjs --fixture B` |
| base_url | `http://localhost:3000` |
| **verdict** | **green** |
| **exit_code** | **0** |
| capture_scope | **`main section`** |
| capture_strategy | `shortest-qualified-candidate` |
| fallback_used | **false** |
| report_char_count | **10407** |
| page_body_char_count | 16983 |
| report_length_soft_min | 1500 |
| report_length_soft_max | 14000 |
| candidate_count | 8 |
| qualified_candidate_count | 2 (`main section` @ 10407 chosen · `main` @ 16648) |
| selected_candidate_marker_count | **5 / 5** |
| selected_candidate_has_evidence | true |
| duration_ms | **67719** |
| console_errors | `[]` |
| one_real_generation_happened | yes |
| estimated_cost | ≈ $0.05 (Sonnet 4.6 baseline) |
| cost_measured | false |
| cost_cap_enforced_by | `single_generation_limit` |
| production_target_used | **false** |
| baseline_promoted | **no** |
| Fixture B baseline created | **no** |
| uploaded PDFs committed | **no** |
| full_report_committed | **no** |
| screenshot_committed | **no** |
| git_commit_sha_at_run_time | `437b5cccc9d24ab43cd82381c65e9a14a725cf2c` |
| corpus_snapshot_date | May 14, 2026 |
| model_display | Claude Sonnet 4.6 |

## Harness change summary

- **Added** fixture selection support via `FIXTURE_TABLE` lookup and
  `parseArgs()` argv parser (~50 lines new code).
- **Added** support for `--fixture B`.
- **Default (no flag) remains Fixture A.** `parseArgs()` returns
  `A` when `--fixture` is absent, selecting the same fixture path,
  must-not-happen literals, and recommendation keywords as before
  AgentOps-3g-2.
- **Unknown-fixture guard** returns an error for unsupported IDs.
  Verified: `node scripts/report-regression-local.mjs --fixture Z` →
  `Error: Unknown fixture: Z. Supported: A, B` (fails fast, no side
  effect).
- **Fixture A must-not-happen literals unchanged**: `learn python`,
  `beginner python`, `as an ai language model`.
- **Fixture A recommendation keywords unchanged**: `rag`, `eval`,
  `retrieval`.
- **Capture logic not changed.** `extractReportText`,
  `CANDIDATE_SELECTORS`, `REPORT_SECTION_MARKERS`,
  `EVIDENCE_APPENDIX_RE` — all identical.
- **Length band stayed 1500-14000.**
- **Latency thresholds not changed** (`SOFT_LATENCY_MS=120000`,
  `HARD_LATENCY_MS=240000`).
- **No new dependencies.**
- **`package.json` and `package-lock.json` not changed.**
- **No `.env*` read.**
- **New `_fixture-${fixtureId}` run_id suffix** (was hardcoded
  `_fixture-A`).
- **Summary log line** now uses `fixture=${fixtureId}` instead of
  hardcoded `fixture=A`.

## Fixture B quality assessment

**Fixture B is healthy enough for future baseline consideration, but
not ready for immediate baseline promotion.**

- The first run is **GREEN** with all structural, fixture-specific,
  and operational checks passing.
- The **recommendation check is especially encouraging**: all five
  Fixture B-specific keywords were present (`agent`, `tool call`,
  `tool-call`, `eval`, `telemetry`). The report did **not** fall back
  to generic frontend / React / TypeScript beginner advice, which is
  exactly what Fixture B's `## Must not happen` list forbids.
- **However, to mirror the Fixture A governance path**, Fixture B
  should get **one stability re-run** before baseline promotion.
  AgentOps-3g DECISION §17 executor preference established this
  pattern (single GREEN → stability re-run → baseline promotion), and
  it caught real value on A: the 3g-stability run confirmed that A's
  first-honest-GREEN in 3e-tune-2 was not a lucky run, before we
  invested in creating the baseline files.

## Comparison to Fixture A baseline (context only · not pass/fail)

Fixture A baseline is **not** a Fixture B pass/fail baseline. This
comparison is context to show the harness produces consistent shape
across fixtures.

| dimension | A baseline (context) | B new run | note |
|---|---|---|---|
| verdict | green | **green** | same |
| exit_code | 0 | 0 | same |
| capture_scope | `main section` | **`main section`** | same |
| capture_strategy | `shortest-qualified-candidate` | `shortest-qualified-candidate` | same |
| fallback_used | false | **false** | same |
| report_char_count | 9837 | **10407** | +570 · +5.8% · reasonable variance |
| page_body_char_count | 16569 | 16983 | +414 · +2.5% |
| duration_ms | 66610 | **67719** | +1109 · +1.7% · reasonable variance |
| candidates / qualified | 9 / 2 | 8 / 2 | −1 · page jitter |
| markers 5/5 + evidence | ✅ | ✅ | same |
| Candidate 1 sentinel | ✅ | ✅ | same |
| must_not_happen matches | 0 (A literals) | 0 (B literals) | both clean |
| recommendation-match | A keywords | **B keywords 5/5** | fixture-specific · both healthy |
| 25 / 25 checks pass | ✅ | ✅ | same shape |

Fixture B is **not** being judged against Fixture A baseline as
pass/fail; the comparison is included in this DECISION for
harness-behavior context only. AgentOps-3g memo §11 (how future
regression uses baseline) still says v1 comparison is
metadata/structure-only per-fixture, not cross-fixture.

## Risks found

1. **Fixture B has only one GREEN run so far.** Severity: **medium**.
   Mitigated by AgentOps-4a-stability recommended next.
2. **No Fixture B stability re-run has been performed yet.** Severity:
   **medium**. Same mitigation.
3. **No Fixture B baseline exists yet.** Severity: **none** (intended).
   Baseline promotion is a separate explicit loop, mirrors 3g-2 for A.
4. **B-E fixtures are not broadly covered yet.** Severity: **low**
   (intended gradual scale-out).
5. **C/D/E have not been real-run.** Severity: **low** (intended).
6. **Uploaded 20 resume PDFs have not been reviewed or ingested into
   fixture governance.** Severity: **medium** for data-hygiene
   discipline. Handling belongs in a separate resume-intake design
   loop with anonymization / storage policy DECISION before any file
   lands in the repo.
7. **Production has not been tested.** Severity: **medium** for
   release confidence, **low** for governance loop.
8. **Quote integrity is still not a gate.** Severity: **low-medium**.
   Deferred.
9. **Semantic equivalence comparison against baseline is still not
   implemented.** Severity: **low-medium**. Deferred (memo §11).
10. **The harness fixture-selection change is minimal but should be
    treated as harness-surface expansion.** Severity: **low**. Fixture
    A default preserved verifiably; unknown-fixture guard fails fast.
11. **LLM output remains nondeterministic**, so a stability re-run is
    still appropriate. Severity: **low-medium**.
12. **BLK-0001 / BLK-0002 / BLK-0003 remain open and unaffected.**
    Severity: **none** for this loop (documented state), **medium**
    as standing project risk covered elsewhere.

## Required fixes

**`none`**

The harness change is minimal and correct. The Fixture B run is a
clean first-try GREEN with strong fixture-specific signals. All
AgentOps-3-era discipline held. No follow-up code change is needed to
approve this loop.

## Non-blocking followups

- **Push AgentOps-4a after human approval.**
- **Create/update daily summary after push.** (First 2026-07-19
  daily summary — new date.)
- **Next recommended loop**: **AgentOps-4a-stability**.
- **AgentOps-4a-stability** should run Fixture B once more **without
  code changes**.
- **Do NOT promote Fixture B baseline** until after stability re-run.
- **Do NOT run C/D/E yet.**
- **Do NOT run A-E full suite.**
- **Do NOT ingest the 20 uploaded PDFs yet.**
- **Later**, create a separate **resume-fixture-intake design loop**
  for the 20 synthetic resumes with anonymization + storage policy
  DECISION.
- **Do NOT introduce OpenAI API.**
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline.**
- **Do NOT push until explicit human approval.**

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT run another
Playwright/harness attempt. Do NOT run report generation again. Do NOT
call Anthropic/OpenAI outside the local app. Do NOT run A-E full suite.
Do NOT run fixtures C/D/E. Do NOT ingest uploaded PDFs. Do NOT promote
baseline. Do NOT create Fixture B baseline. Do NOT modify
`.agent/regression_baselines/**`. Do NOT modify
`.agent/regression_fixtures/**`. Do NOT implement Codex planner. Do
NOT create `.agent/planner_reports/`. Do NOT modify
`.agent/scripts/**`. Do NOT modify `src/**`. Do NOT modify pipeline.
Do NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub
Actions. Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start
G2.1d. Do NOT resume full automation. Recommended next task after
push/cleanup is **AgentOps-4a-stability** · run Fixture B once more
without code changes.

## Files reviewed

- **`.agent/tasks/2026-07-19_run_01_TASK.md`** — 273 lines · specifies
  the minimal `--fixture` change contract, allowed / forbidden files,
  yellow risk, harness-change spec verbatim, 4 acceptance criteria
  groups.
- **`scripts/report-regression-local.mjs`** — +71 / −22. New
  `FIXTURE_TABLE = { A, B }` lookup replaces the `FIXTURE_PATH` const;
  `parseArgs()` (13 lines) reads `--fixture` from argv and throws on
  unknown IDs. Fixture-aware rewiring at 4 sites (path, runId suffix,
  must-not literals, recommendation keywords, summary log). A defaults
  identical to pre-change; verified by grep. Capture / selector /
  marker / length-band / latency logic all unchanged.
- **`metadata.json` for `20260719T045622Z_fixture-B`** — all 22+
  fields populated. `capture_debug_top3` shows algorithm correctly
  picked shortest qualified (`main section` @ 10407 chosen over
  `main` @ 16648). `scratch_paths` points outside repo.
  `cost_measured: false` and `cost_cap_enforced_by:
  single_generation_limit` unchanged. `git_commit_sha` is `437b5cc`
  (current `main` HEAD before this loop).
- **`structural_checks.json`** — 25 checks · **all pass**.
  `recommendation_roughly_matches_expected` detail:
  `keywords=[agent,tool call,tool-call,eval,telemetry]
  hits=[agent,tool call,tool-call,eval,telemetry]` — 5/5.
  `must_not_happen_absent` detail: `no matches`.
- **`verdict.md`** — human-readable summary; red=none, amber=none.
- **`RUN_REPORT`** — 488 lines · uses the 3f `## Regression verdict`
  section with `regression_required=yes`, `verdict=green`
  (`required_green`), `baseline_promoted=no`,
  `production_target_used=no`, `push_implication=push eligible after
  human approval`. Full harness-diff shape, before/after grep for A
  defaults, unknown-fixture guard log, side-by-side A-baseline
  context table.
- **A baseline `baseline_metadata.json`** — context only. Read-only.
  Unchanged. `promoted_by="Bohao via DECISION 2026-07-12_run_09_DECISION"`,
  `baseline_status="current"`.
- **Fixture B file** — read-only. Unchanged.

## Boundary confirmations · 27 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No additional harness run since RUN_REPORT | ✅ |
| No additional report generation since RUN_REPORT | ✅ |
| No LLM / API calls | ✅ (harness = browser driver only) |
| No baseline promotion | ✅ |
| No Fixture B baseline created | ✅ (no `.agent/regression_baselines/fixture-B/` dir exists) |
| No `.agent/regression_baselines/**` changes | ✅ (A baseline read-only) |
| No `.agent/regression_fixtures/**` changes | ✅ (B fixture file read-only) |
| No uploaded PDFs committed | ✅ (find sweep confirmed) |
| No A-E expansion | ✅ (B only) |
| No fixtures C/D/E run | ✅ |
| No production target | ✅ (harness hard-rejects non-localhost) |
| No full report / screenshot committed | ✅ (scratchpad only) |
| No `src/**` changes | ✅ |
| No `.agent/scripts/**` changes | ✅ (hard rule per AgentOps-2c Q3-Q8) |
| Pipeline tracked files unchanged | ✅ (HEAD `b019786` at start AND end) |
| Pre-existing untracked `ref.md` left untouched | ✅ (not modified, not committed, outside this loop) |
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
follow-up action is authorized until Bohao says "push AgentOps-4a".
