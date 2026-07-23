# RUN REPORT · AgentOps-5d-stability · Repeat controlled A + B generation with quote-integrity checker attached

## Metadata

- **task_id**: `2026-07-23_run_01`
- **date**: 2026-07-23
- **loop**: AgentOps-5d-stability
- **parent_loop**: AgentOps-5d (`2026-07-22_run_03`)
- **prior_decisions**: full chain 5a → 5b → 5c → 5d-R2 → 5c-integrate → 5d
- **task_path**: `.agent/tasks/2026-07-23_run_01_TASK.md`
- **findings_memo_path**: `.agent/design_memos/2026-07-23_AgentOps-5d-stability_AB_quote_integrity.md`
- **impl_commit**: `6c21988` (Run quote integrity stability regression)
- **A_stability_run_id**: `20260723T042627Z_fixture-A`
- **A_stability_artifact_dir**: `.agent/regression_runs/20260723T042627Z_fixture-A/`
- **B_stability_run_id**: `20260723T042759Z_fixture-B`
- **B_stability_artifact_dir**: `.agent/regression_runs/20260723T042759Z_fixture-B/`

## Regression verdict

- **regression_required**: yes
- **reason_required_or_not**: controlled generated stability
  regression to determine (1) whether Fixture B timeout is
  reproducible and (2) whether Fixture A missing appendix is
  repeatable
- **harness_used**: yes
- **harness_command**:
  - `node scripts/report-regression-local.mjs --fixture A`
  - `node scripts/report-regression-local.mjs --fixture B`
- **fixture_ids**: `A`, `B`
- **target_environment**: local (`http://localhost:3000` via `npm run dev`)
- **latest_run_id**:
  - A: `20260723T042627Z_fixture-A`
  - B: `20260723T042759Z_fixture-B`
- **verdict**:
  - **legacy report regression A**: **GREEN** (exit 0)
  - **legacy report regression B**: **RED** (exit 1) —
    **timeout reproduced** (241 s vs 240 s hard)
  - **`quote_integrity_verdict` A**: **`amber`** (improved from 5d
    `red`)
  - **`quote_integrity_verdict` B**: **`blocked_no_report`**
    (wrapper failure-handling path · same as 5d)
- **exit_code**: A = 0 · B = 1
- **artifact_paths**:
  - `.agent/regression_runs/20260723T042627Z_fixture-A/{metadata.json,structural_checks.json,verdict.md,quote_integrity_summary.json}`
  - `.agent/regression_runs/20260723T042759Z_fixture-B/{metadata.json,structural_checks.json,verdict.md}` (no summary · correct per blocked_no_report)
  - `.agent/design_memos/2026-07-23_AgentOps-5d-stability_AB_quote_integrity.md`
- **report_char_count**: A = **10 089** · B = **0**
- **capture_scope**: A = `main section` · B = `unset`
- **fallback_used**: A = false · B = false
- **red_checks_failed** (legacy only):
  - A: **_none_**
  - B: same 10 as 5d B (`done_state_reached` · `report_non_empty` ·
    `report_text_capture_success` · 5 `contains_section_*` ·
    `contains_evidence_appendix` · `duration_under_hard_threshold`)
- **amber_checks_failed** (legacy only):
  - A: **_none_**
  - B: same 8 as 5d B (report-length band · action-bar buttons ·
    strengths/gaps reflected · recommendation keywords · duration
    soft threshold · 2 `quote_integrity_*` amber checks)
- **quote_integrity red reasons** (separately):
  - A: **[]** (was 2 in 5d)
  - B: none (checker did not run · `blocked_no_report`)
- **quote_integrity amber reasons** (separately):
  - A: `terminal-punctuation-only match for jd_000089` ·
    `terminal-punctuation-only match for jd_000173` ·
    `in appendix but not cited by any Evidence quote: jd_000310`
  - B: none (checker did not run · `blocked_no_report`)
- **cost_measured**: false
- **estimated_cost**: **~$0.05-$0.10** (A: ~$0.05, B: ~$0.02-$0.05
  partial before timeout)
- **duration_ms**: A = **66 771** (faster than 5d's 76 444) ·
  B = **240 992** (essentially identical to 5d's 240 964 · +28 ms)
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Did Fixture A stability pass artifact checks?

**Yes.** All 16 required post-A checks passed. `metadata.quote_integrity`
populated · `quote_integrity_summary.json` written (~5 KB · v0.3) ·
5 `bucket: "quote_integrity"` structural entries · `verdict.md`
`## Quote integrity` section with explicit telemetry_only prose.

## Was Fixture B stability run?

**Yes.** Fixture A completed all 16 required checks, so per the
DECISION stop rule we proceeded to Fixture B.

## Did Fixture B stability pass artifact checks?

**Yes** (all 10 required post-B checks passed via the wrapper's
failure-handling path). Same shape as 5d B: `blocked_no_report` ·
no summary written · 3 committed files (metadata + structural +
verdict) · 5 structural quote_integrity entries · verdict.md
`## Quote integrity` section with `BLOCKED_NO_REPORT`.

## Legacy regression verdicts

- **A**: GREEN · exit 0.
- **B**: RED · exit 1.

## `quote_integrity_verdict`s

- **A**: **`amber`** (improved from 5d's `red`).
- **B**: **`blocked_no_report`** (same as 5d).

## `quote_integrity_summary` paths

- **A**: `.agent/regression_runs/20260723T042627Z_fixture-A/quote_integrity_summary.json`
  (~5 KB · schema `0.3-r2-terminal-punctuation`)
- **B**: intentionally not written (blocked_no_report)

## `metadata.quote_integrity` block verification

Verified for both runs — see findings memo §6 (A) and §13 (B).
Both blocks include `enabled: true`, `blocking_mode:
"telemetry_only"`, and a well-formed `verdict`. A's block includes
14-key `counts` with `evidence_entries: 5` (up from 5d's 0) and
`terminal_punctuation_only_matches: 2` (same jd_ids as 5d) · 0
`red_reasons` (down from 5d's 2) · 3 `amber_reasons`. B's block is
correctly minimal for `blocked_no_report`.

## `structural_checks.json` `quote_integrity` bucket verification

Both runs include 5 `bucket: "quote_integrity"` entries at
`level: "amber"`. Legacy classify() rollup unaffected.

## `verdict.md` `## Quote integrity` section verification

Present and correct in both A (`AMBER`) and B (`BLOCKED_NO_REPORT`).
Both include the explicit `telemetry_only` prose stating that
promoting to blocking requires a separate DECISION.

## Telemetry-only behavior confirmation

**Confirmed again on a second controlled A + B pair.**

- A: legacy exit 0 despite `quote_integrity_verdict = "amber"` →
  telemetry-only respected.
- B: legacy exit 1 driven by legacy structural + operational
  reds; the 2 amber `quote_integrity_*` failures did not
  escalate → telemetry-only respected.

## Did quote_integrity affect exit code?

**No.** On Fixture A, exit code was 0 despite quote_integrity
`amber`. On Fixture B, exit code was 1 because of legacy structural
reds, not because of `blocked_no_report`. Same result as 5d.

## Did B timeout repeat?

**Yes, reproduced across 2/2 consecutive controlled attempts.**

- 5d Fixture B: 240 964 ms (over 240 s hard) · 0 chars
- 5d-stability Fixture B: 240 992 ms (over 240 s hard · +28 ms) ·
  0 chars

The 240 s hard-threshold timeout for Fixture B is now
**deterministic across two independent controlled runs**. It is
**not a flake**. Per the DECISION stop rule, no third attempt was
made. Recommend a later loop scoped just to Fixture B stability
(raise threshold · restructure prompt · split generation · profile
latency). Do NOT mutate the harness hard threshold in this loop.

## Did A missing appendix repeat?

**No, not reproduced.** 5d A had `evidence_entries: 0` (appendix
table missing entirely). 5d-stability A has **`evidence_entries: 5`**
(appendix table present · all 5 rows extracted cleanly). The prior
5d "missing Evidence Appendix" RED was **generation flake**, not a
systematic product bug. Model correctly emitted the appendix table
this run.

**Interpretation**: Fixture A `Evidence Appendix` omission is
**intermittent, not deterministic**. Worth another stability data
point later, but not confirmed as a systematic prompt bug on the
current 1/2 evidence.

## Cost estimate

**~$0.05-$0.10 Anthropic** total (two real generations, one
completed successfully and one timed out). Within the
DECISION-approved envelope.

## Validation results

Impl commit `6c21988` staged exactly the expected files (9 files
across 2 run directories + TASK + memo). No forbidden files staged.
Web `main` was clean pre-impl (aligned with `origin/main` at
`0678b5b`); after impl commit, ahead by 1. Pipeline `HEAD`
unchanged at `b019786` throughout. All prior
`.agent/regression_runs/**` including 5d A and B untouched. All
prior `.agent/quote_integrity_runs/**` untouched.

## Forbidden-file audit · all clean

| target | status |
|---|---|
| `src/**` | ✅ untouched |
| `scripts/report-regression-local.mjs` | ✅ untouched (unchanged since 5c-integrate) |
| `scripts/quote-integrity-check.mjs` | ✅ untouched (unchanged since 5d-R2) |
| `.agent/scripts/**` | ✅ untouched (hard rule) |
| `.agent/regression_baselines/**` | ✅ untouched (A + B grandfathered) |
| `.agent/regression_fixtures/**` | ✅ untouched |
| Prior `.agent/regression_runs/**` entries | ✅ untouched (5d A + 5d B unchanged) |
| Prior `.agent/quote_integrity_runs/**` entries | ✅ untouched (5c + 5d-R2 + 5c-integrate frozen) |
| pipeline any file | ✅ untouched (`b019786` 起终一致) |
| `.github/workflows/**` | ✅ untouched |
| `package.json` / `package-lock.json` | ✅ untouched |
| `.env*` | ✅ not read by this script |
| `vercel.json` | ✅ untouched |
| Codex / Claude config | ✅ untouched |
| Uploaded 20 PDFs | ✅ not ingested |
| `report.md` / `*.png` committed | ✅ none (scratchpad-only) |
| Full report body / long quote excerpts committed | ✅ none |

## Confirmations

- **No baseline mutation** ✅ (A + B `current` unchanged)
- **No baseline promotion** ✅
- **No C/D/E** ✅
- **No A-E full suite** ✅
- **No uploaded PDFs** ✅
- **No OpenAI API** ✅ (BLK-0003 unchanged)
- **No LLM judge** ✅
- **No edit-distance** ✅
- **No production target** ✅
- **No pipeline changes** ✅ (`b019786` 起终一致)
- **No push** (waiting on DECISION) ✅
- **No manual deploy** ✅
- **Quote-integrity remained telemetry-only** ✅
- **`--help` NOT run** ✅ (avoided documented unsafe behavior)
- **No third Fixture B attempt** ✅ (per DECISION stop rule after 2 timeouts)
- BLK-0001 / BLK-0002 / BLK-0003 remain `open` ✅
- QUEUE-0002 G2.1d remains `blocked_pending_human` ✅
- Q10 pause unchanged ✅
- Codex planner remains spec-only ✅
- `.agent/planner_reports/` remains empty ✅
- **Cost**: ~**$0.05-$0.10 Anthropic** ✅
- **Wrapper worked in-situ**: ✅ second controlled proof
- **A appendix omission NOT reproduced** ✅ (was 5d flake)
- **B timeout REPRODUCED** ✅ (2/2 controlled attempts)

## Recommendation

**Human + ChatGPT review** the findings memo (24 sections) + this
RUN_REPORT + the two committed run directories. Then write DECISION
for `2026-07-23_run_01`. Recommended DECISION posture: **approve**.
Required fixes: **none**.

Recommended next loop:

- **AgentOps-5d-fixture-b-timeout** — targeted product-stability
  loop on Fixture B. Investigate why generation reliably runs over
  240 s. Options: raise harness hard threshold, restructure prompt,
  split generation, profile model latency. Inspection first ($0),
  then a small controlled test if needed (~$0.05-$0.10).

Later loops (in preferred order):

- **AgentOps-5d-cosmetic** — `--help` short-circuit + `verdict.md
  ## Artifacts` truthful list. $0.
- **AgentOps-5e** — decide whether to fold `quote_integrity_*`
  fields into baseline metadata schema.
- **AgentOps-5f-promote** — promote quote integrity to blocking
  (only after B timeout is resolved and A appendix is confirmed
  stable). Requires separate design memo + DECISION.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT promote baselines.** **Do NOT start
5d-fixture-b-timeout.** **Do NOT mutate the harness hard threshold.**
**Do NOT run harness generation again.** **Do NOT call
Anthropic/OpenAI.**
