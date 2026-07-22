# RUN REPORT · AgentOps-5c · Quote integrity integration prototype

## Metadata

- **task_id**: `2026-07-21_run_03`
- **date**: 2026-07-21（executor turn on 2026-07-22 UTC）
- **loop**: AgentOps-5c
- **parent_loop**: AgentOps-5b (`2026-07-21_run_02`)
- **prior_decisions**:
  - `.agent/decisions/2026-07-21_run_01_DECISION.md` (5a approve)
  - `.agent/decisions/2026-07-21_run_02_DECISION.md` (5b approve, two 5c refinements)
- **task_path**: `.agent/tasks/2026-07-21_run_03_TASK.md`
- **checker_path**: `scripts/quote-integrity-check.mjs`
- **quote_integrity_summary_path**: `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
- **findings_memo_path**: `.agent/design_memos/2026-07-21_AgentOps-5c_quote_integrity_integration_prototype.md`
- **impl_commit**: `cf0923f` (Add quote integrity checker prototype)
- **source_report_path**: `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260719T054151Z_fixture-B/report.md`
- **source_run_id**: `20260719T054151Z_fixture-B` (Fixture B baseline source)
- **corpus_path**: `src/data/web_bundle.json`
- **corpus_record_count**: **443**
- **quote_integrity_verdict**: **`red`**

## Regression verdict

- **regression_required**: no
- **reason_required_or_not**: quote-integrity checker prototype;
  no report-affecting runtime change (no `src/**`, no
  `scripts/report-regression-local.mjs`, no `.agent/scripts/**`,
  no `.agent/regression_baselines/**`, no
  `.agent/regression_runs/**`, no `.agent/regression_fixtures/**`,
  no prompts, no model selection, no API route)
- **harness_used**: no
- **harness_command**: not_run
- **fixture_ids**: B source artifact only (read-only)
- **target_environment**: local artifact only
- **latest_run_id**: `20260719T054151Z_fixture-B` (from earlier
  Fixture B baseline source · reused read-only)
- **verdict**: `not_required` for report regression;
  **`quote_integrity_verdict = red`** recorded separately in the
  emitted summary artifact
- **exit_code**: not_applicable (harness not run · checker exit code
  0 after emitting summary)
- **artifact_paths**:
  - `.agent/tasks/2026-07-21_run_03_TASK.md`
  - `scripts/quote-integrity-check.mjs`
  - `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
  - `.agent/design_memos/2026-07-21_AgentOps-5c_quote_integrity_integration_prototype.md`
- **report_char_count**: not_applicable
- **capture_scope**: not_applicable
- **fallback_used**: not_applicable
- **red_checks_failed**: not_applicable (this run did not exercise
  the 25-check report-regression envelope)
- **amber_checks_failed**: not_applicable
- **cost_measured**: false
- **estimated_cost**: **$0**
- **duration_ms**: 0 (harness) · checker script ran in well under 1 s
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Counts summary

| metric | value |
|---|---|
| `quote_candidates` | **23** |
| `evidence_entries` | 5 |
| `evidence_quotes_with_citation` | 5 |
| `verbatim_matches` | 3 |
| `normalized_matches` | 0 |
| `case_insensitive_matches` | **0** |
| `ellipsis_fragment_matches` | **0** |
| `missing_source_id` | 0 |
| `unresolved_source_id` | 0 |
| `wrong_company` | 0 |
| `wrong_role` | 0 |
| `fabricated_or_unmatched_quotes` | **2** |
| `duplicates` | 1 |
| `appendix_entries_not_cited` | 1 |

## RED reasons

- `unmatched_ellipsis_fragment for jd_000201` (NVIDIA — fragment 2
  unmatched: model inserted a bridging `vs.` connector at the start
  of the post-ellipsis fragment; does not appear in corpus body)
- `unmatched quote for jd_000173` (Microsoft — trailing punctuation
  swap: report ends `productivity.` but corpus body has
  `productivity,`)

## AMBER reasons

- `in appendix but not cited by any Evidence quote: jd_000310`
  (Scale AI · appendix-only)
- `duplicate evidence quotes: 1` (Databricks `jd_000347` cited
  twice with same verbatim text)

## Were 5b REDs reduced to AMBER?

**Partially, and honestly.** Both 5c refinements fired as designed:

- **NVIDIA `jd_000201`** — ellipsis matcher activated
  (`match_status = unmatched_ellipsis_fragment`). Fragment 1 (120
  chars) → **verbatim** in corpus. Fragment 2 (34 chars,
  `"vs. RAG vs. structured extraction."`) → **unmatched** because
  the corpus has `"RAG vs. structured extraction."` (single `vs.`);
  the model inserted an extra leading `vs. ` connector when stitching
  post-ellipsis. Correctly stays RED — this is a real integrity
  issue (grammar bridging), not clerical formatting.
- **Microsoft `jd_000173`** — case-insensitive tier tried and
  failed; ellipsis matcher not applicable (no `...` in quote). The
  mismatch is at the *last character* of the quote (byte position
  105): report ends `.` (0x2e) while corpus ends `,` (0x2c). Rest
  is byte-identical after lowercasing. Trailing-punctuation swap
  for sentence closure. Correctly stays RED at the current tier
  configuration — but see remaining brittle §"What remains brittle"
  for R2 candidate policy.

## What refinements worked

- **Case-insensitive tier** (5c refinement #1) — implemented,
  attempted for Microsoft, failed for the right reason (trailing
  punctuation swap outside case scope).
- **Ellipsis matcher** (5c refinement #2) — split on `.../…`,
  meaningful-fragment filter (≥12 non-space chars, ≥3 words),
  per-fragment same-source-body match, all-must-match rollup.
  Fired correctly for NVIDIA and honestly reported fragment 2 as
  unmatched.
- **Appendix parser** — 5/5 rows extracted.
- **Evidence-quote parser** — 5/5 candidates captured.
- **Corpus resolution** — 5/5 resolved via `id`.
- **Duplicate detection** — caught Databricks cited twice.
- **Appendix cross-check** — surfaced Scale AI `jd_000310`
  appendix-only.
- **Committed artifact** — small (~5 KB) diff-friendly JSON under
  `.agent/quote_integrity_runs/` (not `.agent/scripts/**`, hard-rule
  forbidden).

## What remains brittle

- **R1 · Post-ellipsis grammar bridging**: model inserts connector
  word (`vs.` / `and` / `then`) at the start of a post-ellipsis
  fragment for grammar. Currently RED. Recommended to keep RED in v2
  — bridging insertions are close enough to fabrication that a strict
  gate should catch them.
- **R2 · Trailing sentence-boundary punctuation swap**: model
  replaces source `,`/`;`/no-punct with `.` to terminate the quote as
  a standalone sentence. Currently RED. Candidate for a narrow AMBER
  micro-tier in v2 (only when *final* character differs and rest is
  verbatim/CI-verbatim).
- **Role check** remains a title-presence placeholder.
- Only `Evidence quote:` pattern counts for the gate (other
  double-quoted spans are informational-only).
- Body-cleanup `|` → `\n` heuristic is fragile; ideal fix is a
  corpus schema change (out of scope for this loop).
- No caching (fine for one-off; add memoization if 5d does a per-fixture
  loop).

## Baseline impact

- **No** `.agent/regression_baselines/**` mutation.
- Fixture A and Fixture B `current/` baselines untouched
  (`fixture-A_20260714T025246Z_current`,
  `fixture-B_20260719T054151Z_current`).
- Both remain conceptually `quote_integrity_not_evaluated`; the
  first per-run `quote_integrity_summary.json` lives outside the
  baseline envelope by design.
- Future 5e loop may decide whether to fold `quote_integrity_*`
  fields into baseline metadata; not in scope here.

## Artifact policy

- **Committed**:
  - `scripts/quote-integrity-check.mjs`
  - `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
  - `.agent/tasks/2026-07-21_run_03_TASK.md`
  - `.agent/design_memos/2026-07-21_AgentOps-5c_quote_integrity_integration_prototype.md`
- **Not committed**: `report.md`, `report.png`, `/tmp/agentops-5b/`
  scratchpad artifacts, uploaded PDFs, full report body, long quote
  excerpts, secrets.
- Summary artifact is small (~5 KB · diff-friendly · `quote_snippet_60`
  capped ~60 chars).

## Validation results

- Impl commit `cf0923f` staged exactly 4 files (TASK · checker ·
  summary artifact · findings memo). No extra files added.
- Web `main` was clean pre-impl (aligned with `origin/main` at
  `150022b`); after impl commit, ahead by 1.
- Pipeline `HEAD` unchanged at `b019786` throughout.

## Forbidden-file audit · all clean

| target | status |
|---|---|
| `src/**` | ✅ untouched (`src/data/web_bundle.json` read-only reference only) |
| `scripts/report-regression-local.mjs` | ✅ untouched (stable at `0341461`) |
| `.agent/scripts/**` | ✅ untouched (hard rule per AgentOps-2c Q3-Q8) |
| `.agent/regression_baselines/**` | ✅ untouched (A + B grandfathered) |
| `.agent/regression_runs/**` | ✅ untouched (read-only reference to metadata `scratch_paths`) |
| `.agent/regression_fixtures/**` | ✅ untouched |
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
- BLK-0001 / BLK-0002 / BLK-0003 remain `open` ✅
- QUEUE-0002 G2.1d remains `blocked_pending_human` ✅
- Q10 pause unchanged ✅
- Codex planner remains spec-only ✅
- `.agent/planner_reports/` remains empty ✅
- **Cost**: **$0** ✅
- **Duration**: <1 s checker script (no harness) ✅

## Recommendation

**Human + ChatGPT review** the findings memo and this RUN_REPORT,
then write DECISION for `2026-07-21_run_03`. Recommended DECISION
posture: **approve** with explicit decision on R1 (grammar bridging
stays RED) and R2 (trailing-punctuation swap — decide AMBER
micro-tier vs prompt-tuning). Recommended next loop is
**AgentOps-5d · controlled A + B generation with checker attached**
(~$0.10 cost, no baseline mutation, no fixture change).

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT start AgentOps-5d.** **Do NOT integrate
into `scripts/report-regression-local.mjs`.** **Do NOT run report
regression harness.** **Do NOT run report generation.** **Do NOT
call Anthropic/OpenAI.**
