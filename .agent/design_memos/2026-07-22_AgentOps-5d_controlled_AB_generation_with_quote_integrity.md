# AgentOps-5d · Controlled A + B generation with quote-integrity checker attached · findings memo

> First real end-to-end validation of the quote-integrity
> harness-envelope integration. **Two real generations · ~$0.05-$0.10
> Anthropic cost · wrapper worked in-situ on both fixtures.**

## 1 · Purpose

Prove that the AgentOps-5c-integrate harness-envelope integration
works end-to-end on a **freshly generated** report, not just a
frozen scratchpad replay. Verify that a real Playwright regression
run:

- writes `quote_integrity_summary.json` under
  `.agent/regression_runs/<runId>/`,
- populates `metadata.quote_integrity`,
- adds `bucket: "quote_integrity"` structural checks,
- adds a `## Quote integrity` section to `verdict.md`,
- keeps quote integrity **telemetry-only** (does not affect the
  legacy exit code),
- gracefully handles the missing-report path when the harness
  never produces a report to check.

## 2 · Approved scope

Per `.agent/decisions/2026-07-22_run_02_DECISION.md` (5c-integrate
approve): AgentOps-5d controlled A + B generation with checker
attached. Fixture A first; Fixture B only if A completes with the
quote-integrity artifacts written. No baseline mutation. No baseline
promotion. Telemetry-only preserved. R1 / R2 policy inside checker
preserved. No C/D/E. No A-E. No uploaded PDFs. No LLM judge. No
edit-distance. No OpenAI. No production deploy.

## 3 · Commands run

```
# Preflight (accidental — see §14):
node scripts/report-regression-local.mjs --help
  # `--help` is not recognized; harness ran with default --fixture A
  # against a dev server that was not yet up. This produced
  # metadata/structural/verdict artifacts under
  # .agent/regression_runs/20260723T035439Z_fixture-A/ with
  # quote_integrity.verdict=blocked_no_report. That directory was
  # rm -rf'd (untracked scratch, safe to remove) and NOT committed.

# Real controlled runs:
npm run dev &                    # dev server background
# poll http://localhost:3000 until 200

node scripts/report-regression-local.mjs --fixture A
# → run_id=20260723T035644Z_fixture-A · GREEN · exit 0 · 76 s
#   · 11341 chars · scope=main section · fallback=false

node scripts/report-regression-local.mjs --fixture B
# → run_id=20260723T035828Z_fixture-B · RED  · exit 1 · 240964 ms
#   · 0 chars · scope=unset · done_state_reached=false
#   · generation hit hard-threshold timeout before completing

# Cleanup:
kill $(lsof -ti tcp:3000)        # dev server stopped (exit 143)
```

## 4 · Fixture A run id and result

- **run_id**: `20260723T035644Z_fixture-A`
- **artifact_dir**: `.agent/regression_runs/20260723T035644Z_fixture-A/`
- **legacy verdict**: **GREEN** · exit **0**
- **duration**: 76 444 ms (76 s)
- **report_char_count**: 11 341
- **capture_scope**: `main section` (strategy `shortest-qualified-candidate`)
- **fallback_used**: false
- **git_commit_sha**: `59185807129ad2d9e5c7e83026edf72be8362bd0`
- **model_display**: `Claude Sonnet 4.6`
- **corpus_snapshot**: May 14, 2026
- Red checks failed: **_none_**
- Amber checks failed: **_none_**

## 5 · Fixture A quote-integrity artifact verification

All 20 required post-A checks **PASSED**:

| # | check | result |
|---|---|---|
| 1 | `metadata.json` exists | ✅ 3 048 B |
| 2 | `metadata.quote_integrity` block exists | ✅ |
| 3 | `enabled == true` | ✅ |
| 4 | `blocking_mode == "telemetry_only"` | ✅ |
| 5 | `summary_path` set | ✅ (relative repo path) |
| 6 | `verdict` present | ✅ `"red"` |
| 7 | `counts` present | ✅ 14-key object |
| 8 | `red_reasons` present | ✅ 2 items |
| 9 | `amber_reasons` present | ✅ 2 items |
| 10 | `quote_integrity_summary.json` exists | ✅ 4 800 B |
| 11 | summary `schema_version` present | ✅ `"0.3-r2-terminal-punctuation"` |
| 12 | summary `verdict` present | ✅ `"red"` |
| 13 | `structural_checks.json` exists | ✅ 4 294 B |
| 14 | `bucket: "quote_integrity"` entries present | ✅ 5 entries |
| 15 | `verdict.md` exists | ✅ 1 315 B |
| 16 | `verdict.md` contains `## Quote integrity` | ✅ |
| 17 | `verdict.md` states `telemetry_only` (or equivalent) | ✅ explicit prose |
| 18 | legacy 25-check verdict + exit semantics preserved | ✅ GREEN · exit 0 |
| 19 | `report.md` NOT staged for commit | ✅ (scratchpad only) |
| 20 | screenshot NOT staged for commit | ✅ (scratchpad only) |

## 6 · Fixture A legacy regression verdict

**GREEN** · exit 0. No red checks failed. No amber checks failed
(under the legacy 25-check envelope). This is the healthy baseline
outcome for Fixture A.

## 7 · Fixture A `quote_integrity_verdict`

**`red`**. Driven by 2 red reasons:

- **`Evidence Appendix missing while report contains evidence/citation language`**
  — this fresh generation produced 5 inline `Evidence quote: "..." — Company, jd_id.`
  citations but did NOT emit the `Evidence Appendix` table at the
  end of the report. `evidence_entries: 0`. This is a **real product
  behavior finding**: the model sometimes forgets to include the
  appendix table when it uses inline citations.
- **`cited in evidence but missing from appendix: jd_000347, jd_000089, jd_000042, jd_000173`**
  — all 4 inline-cited `jd_id`s (Databricks, an as-yet-unaudited
  new-to-us `jd_000089`, Google DeepMind, Microsoft) never appear
  in the (absent) appendix.

Two AMBER reasons (both R2 terminal-punctuation-only):

- `terminal-punctuation-only match for jd_000089` — 5c/5d-R2 R2 tier
  fired on a new company that was NOT in the frozen Fixture B baseline.
- `terminal-punctuation-only match for jd_000173` — Microsoft, same
  pattern as 5d-R2.

## 8 · Fixture A RED / AMBER reasons summary

- **Counts**: 21 quote candidates · 0 evidence entries · 5 evidence
  quotes with citation · 3 verbatim · 0 normalized · 0
  case-insensitive · 0 ellipsis fragments · **2 terminal-punctuation-only** ·
  0 missing_source_id · 0 unresolved_source_id · 0 wrong_company ·
  0 wrong_role · 0 fabricated · 0 duplicates · 0 appendix_entries_not_cited
  (because appendix is empty, not because entries are all cited).
- **RED**: appendix missing while report claims evidence · 4 cited
  jd_ids missing from appendix.
- **AMBER**: 2 terminal-punctuation-only matches (`jd_000089` · `jd_000173`).

## 9 · Whether Fixture B was run

**Yes.** Fixture A completed with all 20 required checks passing,
so per the DECISION 5c-integrate stop rule we proceeded to Fixture
B.

## 10 · Fixture B run id and result

- **run_id**: `20260723T035828Z_fixture-B`
- **artifact_dir**: `.agent/regression_runs/20260723T035828Z_fixture-B/`
- **legacy verdict**: **RED** · exit **1**
- **duration**: 240 964 ms (241 s, over the 240 s hard threshold by
  ~1 s)
- **report_char_count**: **0** (generation never reached `done`
  state before Playwright's hard threshold)
- **capture_scope**: `unset`
- **fallback_used**: false (no fallback attempted because there was
  nothing to capture)
- **root cause**: **generation timed out at the harness hard
  threshold**. The dev server responded (page loaded, resume + target
  filled, generate clicked) but the model did not finish emitting a
  report within 240 s. This is a **real generation flakiness**
  observation for the Fixture B prompt, not a wrapper bug.

## 11 · Fixture B quote-integrity artifact verification

The wrapper's failure-handling path did what 5c-integrate designed
it to do:

- `metadata.quote_integrity.enabled == true` ✅
- `metadata.quote_integrity.blocking_mode == "telemetry_only"` ✅
- `metadata.quote_integrity.verdict == "blocked_no_report"` ✅
  (correctly detected the missing scratchpad `report.md`)
- `metadata.quote_integrity.schema_version == null` ✅ (no checker
  invocation happened, so no schema to report — this is correct)
- `metadata.quote_integrity.counts == {}` ✅ (empty by design)
- `metadata.quote_integrity.red_reasons == []` ✅ (no checker ran)
- `metadata.quote_integrity.amber_reasons == []` ✅ (no checker ran)
- **`quote_integrity_summary.json` NOT written** ✅ (correct per
  5c-integrate failure-handling spec: when there is no report, the
  wrapper short-circuits without invoking the checker, so no summary
  file is written)
- `structural_checks.json` contains 5 `bucket: "quote_integrity"`
  entries ✅, all `level: "amber"`:
  - `quote_integrity_checker_executed`: pass=false ·
    `detail=mode=telemetry_only verdict=blocked_no_report`
  - `quote_integrity_summary_written`: pass=false ·
    `detail=<summary_path>`
  - `quote_integrity_verdict_recorded`: pass=true ·
    `detail=verdict=blocked_no_report`
  - `quote_integrity_red_reasons_count`: pass=true · `detail=count=0`
  - `quote_integrity_amber_reasons_count`: pass=true · `detail=count=0`
- `verdict.md` contains `## Quote integrity` ✅ with verdict
  `BLOCKED_NO_REPORT`, 0 red reasons, 0 amber reasons, and the
  explicit telemetry-only prose.
- Legacy 25-check verdict + exit semantics preserved ✅ — the
  quote-integrity `checker_executed` and `summary_written` amber
  failures did NOT change the legacy RED verdict (which was driven
  by the structural red checks: `done_state_reached`,
  `report_non_empty`, all `contains_section_*`,
  `contains_evidence_appendix`, `duration_under_hard_threshold`).
- `report.md` NOT staged for commit ✅
- Screenshot NOT staged for commit ✅

**Note**: the `Artifacts` section of Fixture B's `verdict.md` still
lists `quote_integrity_summary.json` in the committed set. This is
a small honest inaccuracy — the template lists the *policy* not the
*actual* set for this run. Worth a follow-up cosmetic fix in a
later loop, but does not affect the integration validation.

## 12 · Fixture B legacy regression verdict

**RED** · exit 1. Red checks failed (10):

- `done_state_reached` (structural)
- `report_non_empty` (structural)
- `report_text_capture_success` (structural)
- `contains_section_target_role` (structural)
- `contains_section_what_you_already_have` (structural)
- `contains_section_top_5_gaps` (structural)
- `contains_section_over-prioritizing` (structural)
- `contains_section_highest-leverage_next_action` (structural)
- `contains_evidence_appendix` (structural)
- `duration_under_hard_threshold` (operational) —
  `duration_ms=240964 hard=240000`

Amber checks failed (8): all consequences of the empty report, plus
the two amber `quote_integrity_*` structural checks noted above.

## 13 · Fixture B `quote_integrity_verdict`

**`blocked_no_report`** — no report reached the scratchpad, so the
checker was correctly not invoked. This is a **wrapper success
path**, not a wrapper failure. The wrapper's job on a missing
report is to record the state honestly and continue — which it did.

## 14 · Preflight incident · accidental Fixture A run

While inspecting the harness CLI I ran
`node scripts/report-regression-local.mjs --help`. The harness does
not recognize `--help`; it silently defaulted to `--fixture A` and
ran a full attempt against `localhost:3000`, which was not yet up.
The run failed everything (`page_loaded=false`) but the wrapper
still emitted a `metadata.quote_integrity` block showing
`verdict = "blocked_no_report"` and `blocking_mode = "telemetry_only"`.
This actually gave an early first data point that the wrapper's
missing-report path works.

The accidental run's artifact directory
(`.agent/regression_runs/20260723T035439Z_fixture-A/`) was
`rm -rf`'d immediately (it was untracked scratch), was never staged
or committed, and is not present in the diff for this loop.

Documented here for transparency. Cost: **$0** for that accidental
run (no report generated → no Anthropic API call).

## 15 · Telemetry-only behavior confirmation

**Confirmed.** Both A (GREEN legacy · RED quote-integrity) and B
(RED legacy · BLOCKED_NO_REPORT quote-integrity) demonstrate the
same invariant: quote-integrity results are recorded, surfaced, and
summarized, but they do NOT change the legacy exit code.

- Fixture A: legacy GREEN exit 0 despite quote-integrity `red` — ✅
  telemetry-only respected.
- Fixture B: legacy RED exit 1 driven entirely by legacy structural
  reds + operational hard-threshold — the two amber
  `quote_integrity_*` failures did not escalate. Exit code would
  have been the same without any quote-integrity checks. ✅

## 16 · Cost estimate

- Fixture A: ~**$0.05** (one Sonnet 4.6 report generation, 76 s
  wall clock, no measurement).
- Fixture B: ~**$0.02-$0.05** (partial generation that timed out
  before completing · Anthropic still charges for whatever tokens
  were consumed).
- **Total ~$0.05-$0.10** — within the DECISION-approved envelope.

Not measured directly; `cost_measured: false` in the metadata of
both runs.

## 17 · What worked

- **`runQuoteIntegrity` wrapper worked in-situ** on the very first
  real generation — no code change needed after 5c-integrate.
- **All 20 required post-A checks passed** on the first controlled
  generation, including the `## Quote integrity` section in
  `verdict.md`, the 5 `bucket: "quote_integrity"` structural
  entries, and the small committed
  `quote_integrity_summary.json`.
- **Failure-handling path works**: on Fixture B, when the
  generation timed out and no report was saved, the wrapper
  correctly wrote `verdict = "blocked_no_report"`, did NOT invoke
  the checker, did NOT write a `quote_integrity_summary.json`, and
  did NOT crash the harness.
- **Telemetry-only preserved** on both runs. Legacy exit code
  semantics are 100% unchanged: A exit 0, B exit 1, both driven by
  the existing 25-check envelope.
- **R2 tier fired on a fresh generation** — 2
  terminal-punctuation-only matches on Fixture A (Microsoft
  `jd_000173` reproduces the 5d-R2 finding · new company
  `jd_000089` is a first observation on a fresh generation).
- **Real product signal**: Fixture A surfaced a legitimate
  quote-integrity concern — the model produced inline `Evidence
  quote:` citations but did NOT emit the appendix table. This is
  exactly the kind of signal a quote-integrity gate is designed to
  catch. It went to RED without a false alarm.
- **`report.md` and screenshots** stayed scratchpad-only. `git
  status` after both runs shows only `.agent/regression_runs/<runId>/`
  as new untracked. No full report body committed. No long quote
  excerpts committed.

## 18 · What failed or remains brittle

- **Fixture B generation timed out** at the harness hard threshold
  (241 s vs 240 s hard). This is a **generation-side product
  flakiness**, not a wrapper problem. Either the model was slow
  today, or the harness hard threshold should be revisited. Not in
  scope for this loop; flagged as an observation.
- **Fixture A missing appendix table** — a real product concern.
  Model produced `Evidence quote: "..." — Company, jd_id.` inline
  citations but did NOT emit the appendix table under the
  `Evidence Appendix` header. `contains_evidence_appendix` in the
  legacy structural checks presumably passed because
  `Evidence quote:` mentions appear in the body, but the actual
  appendix table is empty. Worth a separate design conversation on
  whether to tighten the legacy `contains_evidence_appendix`
  check, or to lean on the quote-integrity gate to catch this
  once it goes blocking.
- **`verdict.md` `## Artifacts` section** lists
  `quote_integrity_summary.json` in the committed set even when
  Fixture B did not actually write one. Small cosmetic honesty
  issue; could tighten in a later cosmetic loop.
- **Fixture A quote_integrity is RED**. It stays RED honestly.
  Telemetry-only means the harness exit stays GREEN, but the
  quote-integrity signal is loud in metadata and verdict.md. That
  is the design.
- **`--help` flag is not recognized** by the harness. Any executor
  or human who tries `--help` first will accidentally run a full
  Fixture A regression. Minor UX issue; worth a `--help` short-circuit
  in a later cosmetic loop.
- Role/title check is still a title-presence placeholder inside the
  checker (unchanged from 5d-R2).
- Only `Evidence quote:` pattern is gated (unchanged).
- Corpus `|` → `\n` normalization is still a heuristic (unchanged).

## 19 · Baseline impact

- **No** `.agent/regression_baselines/**` mutation.
- Fixture A `current` (`fixture-A_20260714T025246Z_current`,
  commit `451bb7f`) untouched.
- Fixture B `current` (`fixture-B_20260719T054151Z_current`,
  commit `0341461`) untouched.
- **No baseline promotion**. Both new runs sit as normal
  `.agent/regression_runs/<runId>/` entries, not baseline sources.
- Both existing baselines remain conceptually
  `quote_integrity_not_evaluated`. Whether to fold `quote_integrity_*`
  into baseline metadata (schema-wise) is a separate 5e loop.

## 20 · Artifact policy

- **Committed** (this loop):
  - `.agent/tasks/2026-07-22_run_03_TASK.md`
  - `.agent/regression_runs/20260723T035644Z_fixture-A/` (4 files:
    `metadata.json` · `structural_checks.json` · `verdict.md` ·
    `quote_integrity_summary.json`)
  - `.agent/regression_runs/20260723T035828Z_fixture-B/` (3 files:
    `metadata.json` · `structural_checks.json` · `verdict.md`; no
    `quote_integrity_summary.json` because blocked_no_report)
  - `.agent/design_memos/2026-07-22_AgentOps-5d_controlled_AB_generation_with_quote_integrity.md`
    (this memo)
- **Not committed**: `report.md`, `report.png`, `/tmp` scratchpad
  entries, uploaded PDFs, full report body, long quote excerpts,
  secrets, dev server logs.
- **Frozen** (verified untouched): all
  `.agent/quote_integrity_runs/**` from 5c / 5d-R2 / 5c-integrate ·
  `.agent/regression_baselines/**` · `.agent/regression_fixtures/**` ·
  all prior `.agent/regression_runs/**` entries.

## 21 · Boundaries respected

- No push · no deploy · no manual `vercel deploy`.
- No OpenAI API introduced (BLK-0003 unchanged).
- No LLM judge · no edit-distance · no semantic equivalence.
- No baseline mutation · no baseline promotion.
- No `.agent/scripts/**` edit (hard rule per AgentOps-2c Q3-Q8).
- No `src/**` edit.
- No `scripts/report-regression-local.mjs` edit (unchanged since
  5c-integrate).
- No `scripts/quote-integrity-check.mjs` edit (unchanged since
  5d-R2).
- No `.agent/regression_fixtures/**` edit.
- No `.agent/regression_baselines/**` edit.
- No pipeline edit (`b019786` unchanged).
- No `package.json` / lockfile / `.github/workflows/**` / `.env*` /
  `vercel.json` / Codex-Claude config edits.
- No uploaded PDFs · no `report.md` · no `*.png` committed.
- No blocker resolved (BLK-0001 / BLK-0002 / BLK-0003 remain `open`).
- No G2.1d start · no Codex planner implementation.
- **Quote integrity remained telemetry-only** throughout.
- Cost: **~$0.05-$0.10 Anthropic** (two real generations · one
  timed out partway).

## 22 · Recommended next step

**Human + ChatGPT review** this memo + the RUN_REPORT + the two
committed run directories, then write DECISION for
`2026-07-22_run_03`. Recommended DECISION posture: **approve**.
Required fixes: **none**.

Suggested follow-up loops (in preferred order):

1. **AgentOps-5d-stability** — one more Fixture A + one more
   Fixture B controlled run to check whether the Fixture B
   generation timeout was one-off or reproducible. Cost ~$0.10.
   No baseline mutation. Same telemetry-only rule. Useful before
   promoting quote integrity to blocking.
2. **AgentOps-5d-cosmetic** — tiny harness tweaks: recognize
   `--help` flag as short-circuit (no accidental run) · make
   `## Artifacts` list only actually-written files. Cost $0. No
   generation.
3. **AgentOps-5e** — decide whether existing baselines should
   fold `quote_integrity_*` fields into their metadata schema.
   Would be a schema evolution and a baseline refresh; needs an
   explicit design memo first.
4. **AgentOps-5f-promote** — once stability is confirmed, promote
   at least one quote-integrity structural check from `level: "amber"`
   to `level: "red"` (start with `quote_integrity_verdict_recorded`
   or something similarly narrow) so that a red
   quote-integrity verdict starts to block the harness exit code.
   Would require a separate design memo and DECISION.

**Do not** promote quote integrity to blocking or mutate baselines
until at least 5d-stability confirms the wrapper is boring.
