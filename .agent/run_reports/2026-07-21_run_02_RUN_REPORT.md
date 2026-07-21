# RUN REPORT · AgentOps-5b · Quote integrity parser prototype

## Metadata

- **task_id**: `2026-07-21_run_02`
- **date**: 2026-07-21
- **loop**: AgentOps-5b
- **parent_loop**: AgentOps-5a (`2026-07-21_run_01`)
- **prior_decision**: `.agent/decisions/2026-07-21_run_01_DECISION.md` (approve)
- **task_path**: `.agent/tasks/2026-07-21_run_02_TASK.md`
- **findings_memo_path**: `.agent/design_memos/2026-07-21_AgentOps-5b_quote_integrity_parser_prototype.md`
- **prototype_script_path**: `/tmp/agentops-5b/quote_integrity_parser_probe.mjs`
- **prototype_script_committed**: no (scratchpad-only per DECISION §next-task-prompt)
- **qi_summary_produced**: yes
- **qi_summary_path**: `/tmp/agentops-5b/qi_summary.json`
- **qi_summary_committed**: no (per 5a DECISION #3, defer commit until 5c integration)
- **source_report_used**: `/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260719T054151Z_fixture-B/report.md`
- **source_report_provenance**: Fixture B baseline source run (`fixture-B_20260719T054151Z_current`)
- **corpus_path**: `src/data/web_bundle.json`
- **corpus_record_count**: **443**
- **parser_verdict**: **`red`**

## Regression verdict

- **regression_required**: no
- **reason_required_or_not**: prototype-only parser work; no
  report-affecting runtime change (no `src/**`, no
  `scripts/report-regression-local.mjs`, no `.agent/scripts/**`,
  no `.agent/regression_baselines/**`, no
  `.agent/regression_runs/**`, no `.agent/regression_fixtures/**`,
  no prompts, no model selection, no API route)
- **harness_used**: no
- **harness_command**: not_run
- **fixture_ids**: none
- **target_environment**: local scratchpad only
- **latest_run_id**: none
- **verdict**: `not_required`
- **exit_code**: not_applicable
- **artifact_paths**:
  - `.agent/tasks/2026-07-21_run_02_TASK.md`
  - `.agent/design_memos/2026-07-21_AgentOps-5b_quote_integrity_parser_prototype.md`
  - `/tmp/agentops-5b/quote_integrity_parser_probe.mjs` (scratchpad)
  - `/tmp/agentops-5b/qi_summary.json` (scratchpad)
- **report_char_count**: not_applicable
- **capture_scope**: not_applicable
- **fallback_used**: not_applicable
- **red_checks_failed**: not_applicable
- **amber_checks_failed**: not_applicable
- **cost_measured**: false
- **estimated_cost**: **$0**
- **duration_ms**: 0 (harness) · prototype script ran in <1 s
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Counts summary

| metric | value |
|---|---|
| `quote_candidates` (all straight double-quoted spans in report, informational) | 23 |
| `evidence_entries` (Appendix rows) | 5 |
| `evidence_quotes_with_citation` | 5 |
| `verbatim_matches` | 3 |
| `normalized_matches` | 0 |
| `missing_source_id` | 0 |
| `unresolved_source_id` | 0 |
| `wrong_company` | 0 |
| `wrong_role` | 0 |
| `fabricated_or_unmatched_quotes` | 2 |
| `duplicates` | 1 |

## Major RED / AMBER reasons

- **RED**: `unmatched quote for jd_000201` (NVIDIA)
- **RED**: `unmatched quote for jd_000173` (Microsoft)
- **AMBER**: `in appendix but not cited by any Evidence quote: jd_000310` (Scale AI)

**Nuance**: manual spot-check shows the underlying evidence phrases
**do exist** in the cited corpus records. Mismatches are (a) a
case-normalization gap and (b) `...` ellipsis stitching of
multi-sentence quotes — real product-formatting behaviors, not
outright fabrication. Design implication is in findings memo §18.

## Parser verdict

**`red`** — driven by the 2 unmatched evidence quotes above.

## What worked

- Extraction of `Evidence Appendix` table (5/5 rows).
- Extraction of `Evidence quote:` pattern (5/5 candidates).
- Corpus resolution by `jd_id` (5/5 resolved).
- Verbatim matching for the 3 quotes literally copied.
- Company check case+punctuation containment (5/5 passed).
- Cross-check appendix ↔ quotes correctly surfaced the
  `jd_000310` unused-in-body appendix row.
- Duplicate detection correctly counted the Databricks quote
  cited twice.

## What failed

- **Case normalization gap** — v1 normalize does not lowercase; a
  legitimate case-only difference on the Microsoft quote fell through
  as unmatched.
- **Ellipsis-stitched quotes** — v1 normalize does not split on
  `...`; the NVIDIA quote is a two-fragment stitched span whose
  fragments do exist in corpus body but the stitched literal does
  not.
- Both are legitimate gate hits; both are addressable via cheap
  deterministic refinements in 5c (see integration recommendation).

## Parsing gaps in the report format

- Report generator sometimes **capitalizes** the first character of a
  quoted excerpt even when source is lowercase.
- Report generator sometimes **stitches** two source spans with `...`
  truncation.
- Report **does not include** per-sentence citations other than the
  `Evidence quote: "X" — Company, jd_id.` pattern.
- Report **uses straight double quotes** only; curly-quote handling
  in normalize is defensive-only for now.

## Integration recommendation for 5c

- **Add case-insensitive normalization tier** → case-only mismatch →
  **AMBER** (not RED).
- **Recognize `...` truncation markers** → split, per-fragment
  verbatim check in order → all fragments match → **AMBER**; any
  fragment unmatched → **RED**.
- **Keep** two-tier + no-edit-distance + no-LLM (DECISION #1, #6
  unchanged).
- **Keep** blocking RED for real fabrication and wrong-company
  attribution (DECISION #5 unchanged).
- **Add** `quote_char_length` and `citation_pattern` fields to
  `sample_items` for auditability.
- **Add** appendix ↔ evidence cross-check to structural checks
  envelope.
- **Keep** duplicates as AMBER-only unless they inflate a claim's
  support.

## Validation results

- `git status` on web: exactly 2 new files staged + committed
  (`.agent/tasks/2026-07-21_run_02_TASK.md`,
  `.agent/design_memos/2026-07-21_AgentOps-5b_quote_integrity_parser_prototype.md`)
  before this RUN_REPORT was written · impl commit `8c310b2`.
- Pipeline `HEAD` unchanged at `b019786` throughout.
- No `.agent/regression_baselines/**` diff.
- No `.agent/regression_runs/**` diff.
- No `.agent/regression_fixtures/**` diff.
- No `scripts/report-regression-local.mjs` diff.
- No `.agent/scripts/**` diff.
- No `src/**` diff.
- No `package.json` / lockfile diff.
- No `.github/workflows/**` diff.
- No `.env*` read.
- No `vercel.json` / Codex/Claude config diff.

## Forbidden-file audit · all clean

| target | status |
|---|---|
| `src/**` | ✅ untouched |
| `src/data/**` | ✅ read-only reference only |
| `src/lib/**` | ✅ untouched |
| `src/app/api/**` | ✅ untouched |
| `scripts/report-regression-local.mjs` | ✅ untouched (stable at `0341461`) |
| `.agent/scripts/**` | ✅ untouched (hard rule) |
| `.agent/regression_baselines/**` | ✅ untouched (A + B grandfathered) |
| `.agent/regression_runs/**` | ✅ untouched (read-only reference for `metadata.json` scratch_paths) |
| `.agent/regression_fixtures/**` | ✅ untouched |
| `.agent/prototypes/**` | ✅ not created |
| pipeline any file | ✅ untouched (`b019786` 起终一致) |
| `.github/workflows/**` | ✅ untouched |
| `package.json` / `package-lock.json` | ✅ untouched |
| `.env*` | ✅ not read |
| `vercel.json` | ✅ untouched |
| Codex / Claude config | ✅ untouched |
| Uploaded 20 PDFs | ✅ not ingested |
| `report.md` / `*.png` committed | ✅ none (scratchpad-only reads) |
| `/tmp` artifact committed | ✅ none |

## Confirmations

- **No code runtime changes** ✅
- **No harness run** ✅
- **No report generation** ✅
- **No Playwright** ✅
- **No LLM / API calls** (no Anthropic · no OpenAI) ✅
- **No baseline mutation** (A + B `current` unchanged) ✅
- **No C/D/E** ✅
- **No A-E full suite** ✅
- **No uploaded PDFs** ✅
- **No production target** ✅
- **No pipeline changes** (`b019786` 起终一致) ✅
- **No push** (waiting on DECISION) ✅
- **No manual deploy** ✅
- BLK-0001 / BLK-0002 / BLK-0003 remain `open` ✅
- QUEUE-0002 G2.1d remains `blocked_pending_human` ✅
- Q10 pause unchanged ✅
- Codex planner remains spec-only ✅
- `.agent/planner_reports/` remains empty ✅
- **Cost**: **$0** ✅
- **Duration**: <1 s prototype script (no harness) ✅

## Recommendation

**Human + ChatGPT review** the findings memo and this RUN_REPORT,
then write DECISION for `2026-07-21_run_02`. Recommended DECISION
posture: **approve** with the two 5c refinements from findings
memo §18 (case-insensitive AMBER tier + ellipsis-fragment splitting)
so that 5c can integrate the parser behind the harness envelope
without changing A/B baselines or running new generation.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT start AgentOps-5c.** **Do NOT integrate
into harness.** **Do NOT run harness.** **Do NOT run report
generation.** **Do NOT call Anthropic/OpenAI.**
