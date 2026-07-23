# AgentOps-5d-stability · Repeat controlled A + B generation with quote-integrity checker attached · findings memo

> Second controlled A + B end-to-end run · **~$0.05-$0.10 Anthropic
> cost** · wrapper worked in-situ on both fixtures a second time ·
> B timeout **reproduced across 2/2 controlled runs** · A appendix
> omission **NOT reproduced** (was 5d generation flake).

## 1 · Purpose

Repeat the AgentOps-5d controlled A + B generation with the
quote-integrity checker attached, to answer two open questions:

1. **Was the Fixture B timeout a one-off flake or reproducible?**
2. **Does Fixture A repeatedly omit the Evidence Appendix table?**

Keep quote integrity telemetry-only. Do not mutate or promote
baselines.

## 2 · Approved scope

Per `.agent/decisions/2026-07-22_run_03_DECISION.md` (5d approve):
AgentOps-5d-stability = one more controlled A + B generation with
checker attached. Fixture A first; Fixture B only if A completes
with quote-integrity artifacts. No baseline mutation. No baseline
promotion. Telemetry-only preserved. R1 / R2 policy inside checker
preserved. No C/D/E. No A-E. No uploaded PDFs. No LLM judge. No
edit-distance. No OpenAI. No production deploy. Stop rule: if B
times out again, do NOT run a third attempt.

## 3 · Commands run

```
npm run dev &                    # dev server background
# poll http://localhost:3000 until 200

node scripts/report-regression-local.mjs --fixture A
# → run_id=20260723T042627Z_fixture-A · GREEN · exit 0 · 66.8 s
#   · 10 089 chars · scope=main section · fallback=false

node scripts/report-regression-local.mjs --fixture B
# → run_id=20260723T042759Z_fixture-B · RED · exit 1 · 240 992 ms
#   · 0 chars · scope=unset · done_state_reached=false
#   · generation hit hard-threshold timeout before completing
#     (SAME failure mode as 5d B: 240 964 ms)

kill $(lsof -ti tcp:3000)        # dev server stopped (exit 143)
```

**`--help` was NOT run** this loop (documented unsafe in 5d).

## 4 · Prior 5d baseline for comparison

- **5d Fixture A** (`20260723T035644Z_fixture-A`): legacy GREEN ·
  exit 0 · 76 s · 11 341 chars · quote_integrity `red` · **0
  appendix_entries** · 5 evidence quotes with citation · 3 verbatim ·
  2 terminal_punctuation_only · 0 fabricated · **2 RED reasons**
  (missing appendix + 4 cited jd_ids not in appendix) · 2 AMBER
  reasons (terminal-punctuation-only ×2)
- **5d Fixture B** (`20260723T035828Z_fixture-B`): legacy RED · exit
  1 · 240 964 ms · **0 chars** · quote_integrity `blocked_no_report`
  · timed out at hard threshold

## 5 · Fixture A stability run id and result

- **run_id**: `20260723T042627Z_fixture-A`
- **artifact_dir**: `.agent/regression_runs/20260723T042627Z_fixture-A/`
- **legacy verdict**: **GREEN** · exit **0**
- **duration**: **66 771 ms (66.8 s)** — faster than 5d (76 s)
- **report_char_count**: **10 089**
- **capture_scope**: `main section` (strategy `shortest-qualified-candidate`)
- **fallback_used**: false
- Red checks failed: **_none_**
- Amber checks failed: **_none_**

## 6 · Fixture A stability artifact verification

All 16 required post-A checks **PASSED**:

| # | check | result |
|---|---|---|
| 1 | `metadata.json` exists | ✅ |
| 2 | `metadata.quote_integrity` block exists | ✅ |
| 3 | `enabled == true` | ✅ |
| 4 | `blocking_mode == "telemetry_only"` | ✅ |
| 5 | `summary_path` present | ✅ |
| 6 | `verdict` present | ✅ `"amber"` |
| 7 | `counts` present | ✅ 14-key object |
| 8 | `structural_checks.json` exists | ✅ |
| 9 | `bucket: "quote_integrity"` entries | ✅ 5 entries |
| 10 | `verdict.md` exists | ✅ |
| 11 | `verdict.md` contains `## Quote integrity` | ✅ |
| 12 | `verdict.md` states `telemetry_only` | ✅ |
| 13 | `quote_integrity_summary.json` exists | ✅ |
| 14 | Legacy exit semantics preserved | ✅ GREEN · exit 0 |
| 15 | `report.md` NOT staged for commit | ✅ (scratchpad only) |
| 16 | Screenshot NOT staged for commit | ✅ (scratchpad only) |

## 7 · Fixture A stability legacy verdict

**GREEN** · exit 0. 0 red / 0 amber legacy checks failed.
Consistent with 5d A legacy verdict.

## 8 · Fixture A stability `quote_integrity_verdict`

**`amber`** — **improved from 5d's `red`**.

- `counts`:
  - `quote_candidates`: 19
  - `evidence_entries`: **5** (was **0** in 5d)
  - `evidence_quotes_with_citation`: 5
  - `verbatim_matches`: 3
  - `terminal_punctuation_only_matches`: **2** (same jd_ids as 5d:
    `jd_000089` + `jd_000173`)
  - `fabricated_or_unmatched_quotes`: 0
  - `duplicates`: 0
  - `appendix_entries_not_cited`: **1** (Scale AI `jd_000310` · same
    pattern as 5c/5d-R2 dry-run — Scale AI appears in appendix but
    is not cited by any inline `Evidence quote:`)
- `red_reasons`: **[]** (was 2 in 5d)
- `amber_reasons`:
  - `terminal-punctuation-only match for jd_000089`
  - `terminal-punctuation-only match for jd_000173`
  - `in appendix but not cited by any Evidence quote: jd_000310`

## 9 · Fixture A Evidence Appendix status

**Present.** 5 appendix rows extracted cleanly via the same
tab-separated `JD_ID\tCOMPANY\tTITLE` parser used in 5c dry-run and
5d-R2 dry-run. The `Evidence Appendix` table exists at the end of
the report and is machine-parseable.

## 10 · Whether A missing appendix repeated

**NOT reproduced.** The 5d Fixture A run had `evidence_entries: 0`
(appendix table missing). This 5d-stability Fixture A run has
`evidence_entries: 5` (appendix table present). The prior 5d
"missing Evidence Appendix" RED was **generation flake**, not a
systematic product bug. The model on this run correctly emitted the
appendix table.

**Interpretation**: Fixture A `Evidence Appendix` omission is
**intermittent, not deterministic**. The model reliably emits
inline `Evidence quote:` citations but sometimes drops the
end-of-report appendix table. Worth watching in later stability
loops, but not confirmed as a systematic prompt bug on this
evidence.

## 11 · Whether Fixture B was run

**Yes.** Fixture A completed all 16 required checks, so per the
DECISION stop rule we proceeded to Fixture B.

## 12 · Fixture B stability run id and result

- **run_id**: `20260723T042759Z_fixture-B`
- **artifact_dir**: `.agent/regression_runs/20260723T042759Z_fixture-B/`
- **legacy verdict**: **RED** · exit **1**
- **duration**: **240 992 ms (241 s)** — over the 240 s hard
  threshold by ~1 s
- **report_char_count**: **0**
- **capture_scope**: `unset` (nothing to capture)
- **fallback_used**: false
- **root cause**: **generation timed out again**, exactly like 5d B
  (240 964 ms). Same 10 legacy structural + operational red checks
  failed.

## 13 · Fixture B stability artifact verification

All 10 required post-B checks **PASSED**:

| # | check | result |
|---|---|---|
| 1 | `metadata.json` exists | ✅ |
| 2 | `metadata.quote_integrity` block exists | ✅ |
| 3 | `structural_checks.json` exists | ✅ |
| 4 | `bucket: "quote_integrity"` entries | ✅ 5 entries |
| 5 | `verdict.md` exists | ✅ |
| 6 | `verdict.md` contains `## Quote integrity` | ✅ |
| 7 | Telemetry-only preserved | ✅ `blocking_mode: "telemetry_only"` |
| 8 | Legacy exit semantics preserved | ✅ RED driven by legacy structural + operational reds only |
| 9 | No baseline mutation | ✅ |
| 10 | `report.md` / screenshot NOT staged for commit | ✅ |

`quote_integrity_summary.json` is intentionally NOT written (correct
per wrapper failure-handling for `blocked_no_report`).

## 14 · Fixture B stability legacy verdict

**RED** · exit 1. Same 10 legacy red checks failed as 5d B:

- `done_state_reached` · `report_non_empty` ·
  `report_text_capture_success` · `contains_section_target_role` ·
  `contains_section_what_you_already_have` ·
  `contains_section_top_5_gaps` ·
  `contains_section_over-prioritizing` ·
  `contains_section_highest-leverage_next_action` ·
  `contains_evidence_appendix` ·
  `duration_under_hard_threshold` (241 s vs 240 s hard)

Same 8 amber checks: legacy consequences of the empty report + the
2 `quote_integrity_*` amber checks (`checker_executed`,
`summary_written`) that fail because no report reached the
scratchpad.

## 15 · Fixture B stability `quote_integrity_verdict`

**`blocked_no_report`** — same as 5d B. Wrapper correctly detected
missing report and short-circuited. No checker crash. No
`quote_integrity_summary.json` written (correct).

## 16 · Whether B timeout reproduced

**Yes, reproduced across 2/2 consecutive controlled attempts.**

- 5d Fixture B: 240 964 ms (over 240 s hard) · 0 chars
- 5d-stability Fixture B: 240 992 ms (over 240 s hard · +28 ms) · 0 chars

**This is now clearly reproducible, not a flake.** The Fixture B
prompt reliably takes longer than 240 s wall-clock to generate a
report through the harness on this local dev-server setup. Root
cause could be one or more of:

- Fixture B prompt is genuinely longer (fullstack→AI product
  archetype demands more context reasoning).
- Playwright + Next.js dev-server overhead is larger for the B
  path.
- The harness's 240 s hard threshold is too tight for this fixture.
- Model latency for the B prompt is at the tail of Sonnet 4.6's
  distribution.

**Per the DECISION stop rule, no third attempt was made.**

**Do not** mutate the harness hard threshold in this loop.
**Recommend** a later loop scoped just to Fixture B stability:
either raise the hard threshold, or shorten / restructure the
Fixture B prompt, or split B into a two-step generation.

## 17 · Telemetry-only confirmation

**Confirmed again.** Both A (legacy GREEN · quote_integrity amber)
and B (legacy RED · quote_integrity blocked_no_report) show
quote-integrity results are recorded, surfaced, and summarized,
but the harness exit code is driven **only** by the legacy 25-check
envelope.

- A: legacy exit 0 despite quote_integrity amber (would have been
  exit 0 without any quote-integrity too).
- B: legacy exit 1 driven by structural + operational reds. The 2
  amber `quote_integrity_*` failures did not escalate.

## 18 · Cost estimate

- Fixture A stability: ~**$0.05** (Sonnet 4.6 · 66.8 s · one report
  generated).
- Fixture B stability: ~**$0.02-$0.05** (partial generation · timed
  out · Anthropic still charges for consumed tokens).
- **Total ~$0.05-$0.10** — within the DECISION-approved envelope.

Not measured directly; `cost_measured: false` in both runs'
metadata.

## 19 · What worked

- **Wrapper worked in-situ again** on the very first controlled
  fixture (A stability). Second real end-to-end validation.
- **All 16 post-A checks passed** on second controlled generation.
- **All 10 post-B checks passed** on second controlled attempt
  (blocked_no_report path).
- **`--help` was not run** — 5d's documented unsafe behavior was
  correctly avoided this loop.
- **R2 tier fired consistently** on the same 2 jd_ids
  (`jd_000089` + `jd_000173`) across A 5d and A 5d-stability →
  R2 policy is deterministic + reproducible on real generations.
- **Appendix cross-check** correctly flagged Scale AI `jd_000310`
  appendix-not-cited (same pattern as 5c dry-run + 5d-R2 dry-run
  when appendix was present).
- **Telemetry-only preserved.**
- **Legacy exit code semantics unchanged.**
- **No baseline mutation · no baseline promotion.**
- **`report.md` + screenshots stayed scratchpad-only.**
- **A stability was cleaner than 5d A** — no missing-appendix RED
  this time; verdict dropped RED → AMBER.
- **B stability reproduced 5d B timeout deterministically** —
  gives clear signal that a later product-stability loop is
  warranted.

## 20 · What failed or remains brittle

- **Fixture B timeout is reproducible** (2/2 controlled attempts).
  Not a wrapper issue. Not a quote-integrity issue. It is a
  generation-side product / infra issue that a separate later loop
  should address (raise threshold · restructure prompt · split
  generation · optimize prompt · investigate model latency).
- **Fixture A `Evidence Appendix` omission was intermittent**
  (1 in 2 controlled runs). Worth adding an additional stability
  data point later. Not a systematic bug on the current evidence
  but not fully cleared either.
- **`verdict.md` `## Artifacts` line** still lists
  `quote_integrity_summary.json` in the committed set even when B
  did not write one. Same cosmetic honesty issue as 5d; carryover
  candidate for AgentOps-5d-cosmetic.
- **`--help` unsafe behavior** unchanged (still triggers default
  Fixture A run). Candidate for AgentOps-5d-cosmetic.
- **Role/title check** still title-presence placeholder.
- **Only `Evidence quote:` pattern** is gated.
- **Corpus `|` → `\n` heuristic** still fragile at ingest layer.
- **Quote integrity remains telemetry-only**, not blocking.

## 21 · Baseline impact

- **No** `.agent/regression_baselines/**` mutation.
- Fixture A `current` (`fixture-A_20260714T025246Z_current` at
  `451bb7f`) untouched.
- Fixture B `current` (`fixture-B_20260719T054151Z_current` at
  `0341461`) untouched.
- **No baseline promotion**. Both new runs sit as normal
  `.agent/regression_runs/<runId>/` entries.
- Both baselines remain conceptually `quote_integrity_not_evaluated`.
  Whether to fold `quote_integrity_*` fields into baseline metadata
  schema is still a separate 5e concern.

## 22 · Artifact policy

- **Committed** (this loop):
  - `.agent/tasks/2026-07-23_run_01_TASK.md`
  - `.agent/regression_runs/20260723T042627Z_fixture-A/` (4 files:
    `metadata.json` · `structural_checks.json` · `verdict.md` ·
    `quote_integrity_summary.json`)
  - `.agent/regression_runs/20260723T042759Z_fixture-B/` (3 files:
    `metadata.json` · `structural_checks.json` · `verdict.md`; no
    `quote_integrity_summary.json` because blocked_no_report)
  - `.agent/design_memos/2026-07-23_AgentOps-5d-stability_AB_quote_integrity.md`
    (this memo)
- **Not committed**: `report.md`, `report.png`, `/tmp` scratchpad
  entries, uploaded PDFs, full report body, long quote excerpts,
  secrets, dev-server logs.
- **Frozen** (verified untouched): all
  `.agent/quote_integrity_runs/**` from 5c / 5d-R2 / 5c-integrate ·
  `.agent/regression_baselines/**` · `.agent/regression_fixtures/**` ·
  all prior `.agent/regression_runs/**` entries including the 5d A
  and B run dirs.

## 23 · Boundaries respected

- No push · no deploy · no manual `vercel deploy`.
- No OpenAI API introduced (BLK-0003 unchanged).
- No LLM judge · no edit-distance · no semantic equivalence.
- No baseline mutation · no baseline promotion.
- No `.agent/scripts/**` edit (hard rule).
- No `src/**` edit.
- **`scripts/report-regression-local.mjs` unchanged** since
  5c-integrate.
- **`scripts/quote-integrity-check.mjs` unchanged** since 5d-R2.
- No `.agent/regression_fixtures/**` edit.
- No `.agent/regression_baselines/**` edit.
- No prior `.agent/regression_runs/**` edit.
- No pipeline edit (`b019786` unchanged).
- No `package.json` / lockfile / `.github/workflows/**` / `.env*` /
  `vercel.json` / Codex-Claude config edits.
- No uploaded PDFs · no `report.md` · no `*.png` committed.
- No blocker resolved (BLK-0001 / BLK-0002 / BLK-0003 remain
  `open`).
- No G2.1d start · no Codex planner implementation.
- **`--help` NOT run** (avoided documented unsafe behavior).
- **Quote integrity remained telemetry-only** throughout.
- Cost: ~**$0.05-$0.10 Anthropic** (2 real generations · one timed
  out partway).

## 24 · Recommended next step

**Human + ChatGPT review** this memo + the RUN_REPORT + the two
committed run directories, then write DECISION for
`2026-07-23_run_01`. Recommended DECISION posture: **approve**.
Required fixes: **none**.

Two credible follow-up paths (executor preference in order):

1. **AgentOps-5d-fixture-b-timeout** — targeted product-stability
   loop on Fixture B only. Investigate why generation reliably runs
   over 240 s. Options: raise harness hard threshold (small, cheap
   test), restructure Fixture B prompt (larger change, needs
   design memo), split B into two-step generation, or profile
   model latency. Do NOT run new generations blindly — first
   inspect prompt + threshold + prior successful B baseline
   (`fixture-B_20260719T054151Z_current` completed in ~67 s, so
   something changed). Cost $0 for inspection · $0.05-$0.10 if
   controlled A/B rerun is needed.
2. **AgentOps-5d-cosmetic** — two small no-generation fixes:
   - `scripts/report-regression-local.mjs` recognize `--help`
     short-circuit so it never triggers a fixture generation.
   - `verdict.md` `## Artifacts` list only actually-written files
     (not the policy-list).
   Cost $0. No generation. No baseline mutation. Very safe.
3. (Later) **AgentOps-5f-promote** — promote quote integrity to
   blocking. Only after (1) is resolved and Fixture A appendix
   omission gets one more stability data point. Requires separate
   design memo + DECISION.

**Do NOT** promote quote integrity to blocking, mutate baselines,
or start C/D/E while B is unstable. Fixture B timing needs to be
resolved before any wider fixture expansion loops.
