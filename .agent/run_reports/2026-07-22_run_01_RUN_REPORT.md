# RUN REPORT · AgentOps-5d-R2 · Terminal-punctuation AMBER micro-tier

## Metadata

- **task_id**: `2026-07-22_run_01`
- **date**: 2026-07-22
- **loop**: AgentOps-5d-R2
- **parent_loop**: AgentOps-5c (`2026-07-21_run_03`)
- **prior_decisions**:
  - `.agent/decisions/2026-07-21_run_01_DECISION.md` (5a approve)
  - `.agent/decisions/2026-07-21_run_02_DECISION.md` (5b approve · 5c refinements)
  - `.agent/decisions/2026-07-21_run_03_DECISION.md` (5c approve · R1 keep RED · R2 approve)
- **task_path**: `.agent/tasks/2026-07-22_run_01_TASK.md`
- **checker_path**: `scripts/quote-integrity-check.mjs`
- **quote_integrity_summary_path**: `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/quote_integrity_summary.json`
- **findings_memo_path**: `.agent/design_memos/2026-07-22_AgentOps-5d-R2_terminal_punctuation_micro_tier.md`
- **impl_commit**: `b6249cb` (Add quote integrity R2 terminal punctuation tier)
- **source_report_path**: `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260719T054151Z_fixture-B/report.md`
- **source_run_id**: `20260719T054151Z_fixture-B` (Fixture B baseline source · same as 5c)
- **corpus_path**: `src/data/web_bundle.json`
- **corpus_record_count**: **443**
- **quote_integrity_verdict**: **`red`** (unchanged overall; RED set shrank 2 → 1)

## Regression verdict

- **regression_required**: no
- **reason_required_or_not**: quote-integrity checker refinement;
  no report-affecting runtime change (no `src/**`, no
  `scripts/report-regression-local.mjs`, no `.agent/scripts/**`,
  no `.agent/regression_baselines/**`, no
  `.agent/regression_runs/**`, no `.agent/regression_fixtures/**`,
  no prompts, no model selection, no API route)
- **harness_used**: no
- **harness_command**: not_run
- **fixture_ids**: B source artifact only (read-only)
- **target_environment**: local artifact only
- **latest_run_id**: `20260719T054151Z_fixture-B` (same as 5c)
- **verdict**: `not_required` for report regression;
  **`quote_integrity_verdict = red`** recorded separately (only 1 RED
  remaining · R1 grammar-bridging on NVIDIA)
- **exit_code**: not_applicable (harness not run · checker exit code
  0 after emitting summary)
- **artifact_paths**:
  - `.agent/tasks/2026-07-22_run_01_TASK.md`
  - `scripts/quote-integrity-check.mjs` (modified)
  - `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/quote_integrity_summary.json` (new)
  - `.agent/design_memos/2026-07-22_AgentOps-5d-R2_terminal_punctuation_micro_tier.md` (new)
- **report_char_count**: not_applicable
- **capture_scope**: not_applicable
- **fallback_used**: not_applicable
- **red_checks_failed**: not_applicable
- **amber_checks_failed**: not_applicable
- **cost_measured**: false
- **estimated_cost**: **$0**
- **duration_ms**: 0 (harness) · checker script ran in well under 1 s
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Counts summary (5d-R2 vs 5c delta)

| metric | 5c | 5d-R2 | delta |
|---|---:|---:|---|
| `quote_candidates` | 23 | 23 | — |
| `evidence_entries` | 5 | 5 | — |
| `evidence_quotes_with_citation` | 5 | 5 | — |
| `verbatim_matches` | 3 | 3 | — |
| `normalized_matches` | 0 | 0 | — |
| `case_insensitive_matches` | 0 | 0 | — |
| `ellipsis_fragment_matches` | 0 | 0 | — |
| **`terminal_punctuation_only_matches`** | (n/a) | **1** | **+1 (new)** |
| `missing_source_id` | 0 | 0 | — |
| `unresolved_source_id` | 0 | 0 | — |
| `wrong_company` | 0 | 0 | — |
| `wrong_role` | 0 | 0 | — |
| **`fabricated_or_unmatched_quotes`** | **2** | **1** | **−1** |
| `duplicates` | 1 | 1 | — |
| `appendix_entries_not_cited` | 1 | 1 | — |

## RED reasons

- `unmatched_ellipsis_fragment for jd_000201` (NVIDIA — R1 preserved)

(Down from 2 REDs in 5c. Verdict still RED because any single RED
escalates the rollup.)

## AMBER reasons

- **`terminal-punctuation-only match for jd_000173`** (Microsoft — R2
  fired · new)
- `in appendix but not cited by any Evidence quote: jd_000310`
  (Scale AI — unchanged)
- `duplicate evidence quotes: 1` (Databricks — unchanged)

## Did Microsoft `jd_000173` move RED → AMBER?

**Yes.** Now classified `terminal_punctuation_only`:

- `r2_sub_tier`: `case_insensitive` (rest of quote matches only
  after lowercasing)
- `r2_source_terminal_char`: `,` (source ends `productivity,`,
  report ends `productivity.`)
- All 8 R2 conditions satisfied:
  1. source id resolves ✓
  2. company check `pass` ✓
  3. role check `pass` ✓
  4. only diff is final char ✓ (contiguous substring match of
     `quote[:-1]`)
  5. rest matches via CI-normalized tier ✓
  6. no word inserted/deleted/reordered/replaced ✓ (guaranteed by
     substring match)
  7. length 106 chars (96 non-space) ≥ 40 ✓
  8. `,` → `.` is meaning-preserving ✓ (allowed by
     `isAllowedSourceTerminal`)

## Did NVIDIA `jd_000201` stay RED?

**Yes.** R2 tier is tried after tier 1–3 fail, but the R2 substring
match `quote[:-1]` still contains literal `...` in the middle and
does not exist in the corpus body. R2 returns `null` and control
falls through to the ellipsis matcher.

Ellipsis matcher splits into two meaningful fragments:

- Fragment 1 (120 chars): `"Evaluate and select ML approaches ...
  classical ML"` → **verbatim** in corpus body.
- Fragment 2 (34 chars): `"vs. RAG vs. structured extraction."` →
  **unmatched** (model inserted a bridging `vs. ` at the start of
  the post-ellipsis fragment; corpus body has single `vs.`).

`match_status` = `unmatched_ellipsis_fragment` → RED. R1 policy
preserved as designed by 5c DECISION §Policy decision R1.

## What R2 tier changed

- Added `matchTerminalPunctuationOnly()` helper (enforces the 8
  strict conditions).
- Added `isAllowedSourceTerminal()` helper (enforces condition 8).
- Integrated R2 attempt into main loop after tier 1–3 fail and
  before ellipsis matcher.
- Added `counts.terminal_punctuation_only_matches` field.
- Added switch case that increments the count and pushes an AMBER
  reason.
- Added `r2_sub_tier` and `r2_source_terminal_char` fields to
  `sample_items` when R2 fires.
- Bumped `schema_version` to `0.3-r2-terminal-punctuation`.
- Extended `limitations` with two lines documenting R2 scope and
  locked R1 policy.

## What remains brittle

- **Overall verdict still RED** (NVIDIA R1). Intended.
- **Role/title check** still a title-presence placeholder.
- **Only `Evidence quote:` pattern** is gated.
- **Corpus `|` → `\n` heuristic** is still fragile at ingest layer.
- **Checker still not integrated** into
  `scripts/report-regression-local.mjs`.
- **A/B baselines** remain `quote_integrity_not_evaluated` per 5a
  DECISION #4.
- **No caching** in the checker.
- **No production quote validation** yet.

## Baseline impact

- **No** `.agent/regression_baselines/**` mutation.
- Fixture A `current` (`fixture-A_20260714T025246Z_current`,
  commit `451bb7f`) untouched.
- Fixture B `current` (`fixture-B_20260719T054151Z_current`,
  commit `0341461`) untouched.
- Both remain conceptually `quote_integrity_not_evaluated`; the
  first two `quote_integrity_summary.json` artifacts (5c + 5d-R2)
  live outside the baseline envelope by design.

## Artifact policy

- **Committed** (this loop):
  - `scripts/quote-integrity-check.mjs` (modified · +82 / −5)
  - `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/quote_integrity_summary.json`
    (new · ~6 KB)
  - `.agent/tasks/2026-07-22_run_01_TASK.md`
  - `.agent/design_memos/2026-07-22_AgentOps-5d-R2_terminal_punctuation_micro_tier.md`
- **Not committed**: `report.md`, `report.png`, `/tmp/agentops-5b/`
  scratchpad artifacts, uploaded PDFs, full report body, long quote
  excerpts, secrets.
- **Frozen** (verified untouched):
  `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
  still `v0.2-integration-prototype`, still 2 REDs.

## Validation results

- Impl commit `b6249cb` staged exactly 4 files (1 modified checker
  + 3 new: TASK, summary artifact, findings memo).
- Web `main` was clean pre-impl (aligned with `origin/main` at
  `b232ef1`); after impl commit, ahead by 1.
- Pipeline `HEAD` unchanged at `b019786` throughout.
- 5c artifact schema and REDs verified unchanged after R2
  implementation (`v0.2-integration-prototype` · 2 REDs).

## Forbidden-file audit · all clean

| target | status |
|---|---|
| `src/**` | ✅ untouched (`src/data/web_bundle.json` read-only reference only) |
| `scripts/report-regression-local.mjs` | ✅ untouched (stable at `0341461`) |
| `.agent/scripts/**` | ✅ untouched (hard rule per AgentOps-2c Q3-Q8) |
| `.agent/regression_baselines/**` | ✅ untouched (A + B grandfathered) |
| `.agent/regression_runs/**` | ✅ untouched (read-only reference to `metadata.json`) |
| `.agent/regression_fixtures/**` | ✅ untouched |
| **5c artifact `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/**` | **✅ untouched (verified)** |
| pipeline any file | ✅ untouched (`b019786` 起终一致) |
| `.github/workflows/**` | ✅ untouched |
| `package.json` / `package-lock.json` | ✅ untouched |
| `.env*` | ✅ not read |
| `vercel.json` | ✅ untouched |
| Codex / Claude config | ✅ untouched |
| Uploaded 20 PDFs | ✅ not ingested |
| `report.md` / `*.png` committed | ✅ none (scratchpad-only reads) |
| `/tmp` artifact committed | ✅ none |
| Full report body / long quote excerpts | ✅ none |

## Confirmations

- **No report regression harness run** ✅
- **No report generation** ✅
- **No Playwright** ✅
- **No LLM / API calls** ✅ (no Anthropic · no OpenAI)
- **No baseline mutation** ✅ (A + B `current` unchanged)
- **No C/D/E** ✅
- **No A-E full suite** ✅
- **No uploaded PDFs** ✅
- **No production target** ✅
- **No pipeline changes** ✅ (`b019786` 起终一致)
- **No push** (waiting on DECISION) ✅
- **No manual deploy** ✅
- **5c artifact not mutated** ✅ (v0.2 preserved on disk)
- **R1 policy not loosened** ✅ (NVIDIA still RED)
- BLK-0001 / BLK-0002 / BLK-0003 remain `open` ✅
- QUEUE-0002 G2.1d remains `blocked_pending_human` ✅
- Q10 pause unchanged ✅
- Codex planner remains spec-only ✅
- `.agent/planner_reports/` remains empty ✅
- **Cost**: **$0** ✅
- **Duration**: <1 s checker script (no harness) ✅

## Recommendation

**Human + ChatGPT review** the findings memo and this RUN_REPORT
plus the new `v0.3-r2-terminal-punctuation` summary artifact. Then
write DECISION for `2026-07-22_run_01`. Recommended DECISION posture:
**approve**. Required fixes: **none**.

Two credible next-loop paths for the DECISION to name:

- **AgentOps-5c-integrate**: wire the checker into
  `scripts/report-regression-local.mjs` so future regression runs
  automatically emit `quote_integrity_summary.json`. **$0**. No
  generation. Preferred first because it makes subsequent generation
  loops turnkey.
- **AgentOps-5d**: controlled A+B generation with checker attached
  (~$0.10). Best after harness integration but defensible before.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT start controlled A/B generation.** **Do
NOT integrate into `scripts/report-regression-local.mjs`.** **Do NOT
run report regression harness.** **Do NOT run report generation.**
**Do NOT call Anthropic/OpenAI.**
