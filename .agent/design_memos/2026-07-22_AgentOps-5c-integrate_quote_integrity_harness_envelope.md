# AgentOps-5c-integrate · Quote-integrity harness-envelope integration · findings memo

> Harness integration · telemetry only · **$0 · 0 generation · 0
> harness generation run · 0 Playwright · 0 LLM/API · 0 baseline
> mutation · 5c + 5d-R2 artifacts untouched.**

## 1 · Purpose

Wire `scripts/quote-integrity-check.mjs` into
`scripts/report-regression-local.mjs` so future report regression
runs automatically emit `quote_integrity_summary.json` alongside
their existing `metadata.json` / `structural_checks.json` /
`verdict.md`. Quote integrity is observed and recorded in the same
run envelope as the existing 25-check gate, but stays **telemetry
only** — a red quote-integrity verdict does **not** change the
harness exit code or the report-regression rollup this loop.

## 2 · Approved context

- 5a: quote-integrity design memo approved
  (`.agent/decisions/2026-07-21_run_01_DECISION.md`).
- 5b: parser prototype approved
  (`.agent/decisions/2026-07-21_run_02_DECISION.md`).
- 5c: integration prototype approved · R1 locked (grammar bridging =
  RED) · R2 approved (terminal-punctuation swap = AMBER under 8
  conditions) (`.agent/decisions/2026-07-21_run_03_DECISION.md`).
- 5d-R2: R2 ships in the checker
  (`.agent/decisions/2026-07-22_run_01_DECISION.md`).
- Baselines A + B untouched throughout 5-arc.

## 3 · Files changed

- **`scripts/report-regression-local.mjs`** (modified · additive
  integration + one new helper + import extensions)
- `.agent/tasks/2026-07-22_run_02_TASK.md` (new · TASK)
- `.agent/design_memos/2026-07-22_AgentOps-5c-integrate_quote_integrity_harness_envelope.md`
  (this memo)
- `.agent/quote_integrity_runs/20260722T_AGENTOPS5C_INTEGRATE_fixture-B/quote_integrity_summary.json`
  (optional dry-run artifact · produced by invoking the checker
  directly against the same Fixture B scratchpad report used by 5c
  and 5d-R2)

**Frozen (not touched):**
- `scripts/quote-integrity-check.mjs` — checker unchanged; the R2
  tier from 5d-R2 works as-is against the harness invocation
  contract.
- 5c artifact
  (`.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/**`).
- 5d-R2 artifact
  (`.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/**`).
- All existing `.agent/regression_runs/**`,
  `.agent/regression_baselines/**`,
  `.agent/regression_fixtures/**`.

## 4 · Harness integration point

The harness saves the just-generated report to
`<scratchDir>/report.md` around line 534
(`await writeFile(scratchReportPath, reportText, "utf8")`). The
quote-integrity invocation is inserted **immediately after** that
save, before the structural checks are pushed. That guarantees the
checker either has the freshly written report on disk, or it
correctly reports `blocked_no_report` when `reportText` was empty.

The result of the invocation feeds three consumers:

1. **`metadata.json`** — new `quote_integrity` block.
2. **`structural_checks.json`** — 5 new checks in
   `bucket: "quote_integrity"`, all `level: "amber"` so a failure
   never escalates to RED via the existing `classify()` rollup.
3. **`verdict.md`** — new `## Quote integrity` section.

The `runDir` (already computed at line 419) is the natural target
directory for `quote_integrity_summary.json`; it sits next to the
other committed artifacts.

## 5 · Quote-integrity invocation contract

```
node scripts/quote-integrity-check.mjs \
  --report   <scratchReportPath>            # /var/folders/…/report.md
  --corpus   <REPO_ROOT>/src/data/web_bundle.json
  --out      <runDir>/quote_integrity_summary.json
  --fixture  <fixtureId>                    # "A" or "B" today
  --source-run-id <runId>                   # e.g. 20260722T…_fixture-B
```

Invocation is synchronous via `spawnSync` with `process.execPath` so
we always match the Node running the harness. The helper never
throws; failures land in the returned envelope as:

- `blocked_no_report` — scratch `report.md` missing or empty text.
- `blocked_no_corpus` — `src/data/web_bundle.json` missing.
- `checker_error` — non-zero exit, missing summary, or JSON parse
  failure. Stderr / error message capped to ~500 chars stored in
  `errorExcerpt`.

## 6 · Metadata fields added

Under `metadata.quote_integrity`:

```json
{
  "enabled": true,
  "checker_path": "scripts/quote-integrity-check.mjs",
  "summary_path": ".agent/regression_runs/<runId>/quote_integrity_summary.json",
  "verdict": "green|amber|red|blocked_no_report|blocked_no_corpus|checker_error|unknown",
  "schema_version": "0.3-r2-terminal-punctuation",
  "counts": { … 14 keys from checker … },
  "red_reasons": [ … ],
  "amber_reasons": [ … ],
  "blocking_mode": "telemetry_only"
}
```

`artifact_policy.committed` was extended to list
`"quote_integrity_summary.json"` so the harness's own artifact
manifest stays truthful.

## 7 · `verdict.md` section added

```
## Quote integrity

- **Verdict**: **<UPPERCASE_VERDICT>**
- **Summary**: `.agent/regression_runs/<runId>/quote_integrity_summary.json`
- **Red reasons**: <count>
- **Amber reasons**: <count>
- **Blocking mode**: `telemetry_only` — telemetry only in this
  integration loop; does not change the report-regression
  GREEN/AMBER/RED exit code. Promoting to blocking requires a
  separate DECISION.
```

The `## Artifacts` section was also extended to list
`quote_integrity_summary.json` in the committed set.

## 8 · Structural checks added

Five new checks in `bucket: "quote_integrity"`, all `level: "amber"`:

| key | pass logic | detail |
|---|---|---|
| `quote_integrity_checker_executed` | `checkerExecuted` (false when blocked_no_report/blocked_no_corpus/checker_error) | `mode=… verdict=… err="…"` |
| `quote_integrity_summary_written` | `summaryWritten` (false if checker never wrote the file) | committed path |
| `quote_integrity_verdict_recorded` | `Boolean(verdict)` | `verdict=<value>` |
| `quote_integrity_red_reasons_count` | `true` (detail-only) | `count=<n>` |
| `quote_integrity_amber_reasons_count` | `true` (detail-only) | `count=<n>` |

The last two intentionally pass regardless of count — they are
observability probes, not blocking checks. Their `detail` field is
the payload.

## 9 · Telemetry-only decision

**Locked**. All 5 new checks are `level: "amber"`, and the harness
`classify()` already treats amber-only as amber; combined with the
existing rollup, a quote-integrity RED verdict cannot force the
overall harness exit code to red this loop. The metadata's
`quote_integrity.blocking_mode` is the fixed string
`"telemetry_only"`, and the verdict.md section says so explicitly.

Promoting quote integrity to blocking requires:

1. A future DECISION explicitly changing `blocking_mode`.
2. Escalating one or more of the 5 structural checks to
   `level: "red"` (or adding a new blocking check).

Neither happens in this loop.

## 10 · Failure handling

- Report missing / empty → `verdict = "blocked_no_report"` ·
  `quote_integrity_checker_executed.pass = false`.
- Corpus missing → `verdict = "blocked_no_corpus"` · same.
- Checker exits non-zero → `verdict = "checker_error"` · stderr
  excerpt captured (≤ 500 chars).
- Summary file missing after successful exit → `verdict =
  "checker_error"` with `errorExcerpt = "summary_not_written"`.
- JSON parse failure on the summary → `verdict = "checker_error"`
  with `parse_error:` prefix in the excerpt.

None of these throws. None of these silently pass as green. The
harness continues to write the rest of its artifacts and exit code
after the checker returns.

## 11 · R1 / R2 policy preservation

The checker's own logic is unchanged in this loop, so:

- **R1**: post-ellipsis grammar bridging → RED
  (`unmatched_ellipsis_fragment`). Preserved.
- **R2**: terminal-punctuation swap → AMBER
  (`terminal_punctuation_only`) only when all 8 strict conditions
  hold. Preserved.
- **No LLM judge**. **No edit-distance**. **No semantic
  equivalence**. All preserved.

## 12 · Validation performed

- `node --check scripts/quote-integrity-check.mjs` → OK
- `node --check scripts/report-regression-local.mjs` → OK
- **Optional no-generation dry-run** of the checker against the same
  Fixture B baseline source report used by 5c and 5d-R2:

  ```
  node scripts/quote-integrity-check.mjs \
    --report /var/folders/xx/…/20260719T054151Z_fixture-B/report.md \
    --corpus src/data/web_bundle.json \
    --out .agent/quote_integrity_runs/20260722T_AGENTOPS5C_INTEGRATE_fixture-B/quote_integrity_summary.json \
    --fixture B \
    --source-run-id 20260719T054151Z_fixture-B
  ```

**NOT run**:

- `node scripts/report-regression-local.mjs --fixture A`
- `node scripts/report-regression-local.mjs --fixture B`
- Any command that generates a new report.

## 13 · Optional dry-run artifact result

Path: `.agent/quote_integrity_runs/20260722T_AGENTOPS5C_INTEGRATE_fixture-B/quote_integrity_summary.json`

- `schema_version`: `0.3-r2-terminal-punctuation`
- `fixture_id`: `B`
- `source_run_id`: `20260719T054151Z_fixture-B`
- `corpus_record_count`: **443**
- `verdict`: **`red`**
- `verbatim_matches`: 3
- `terminal_punctuation_only_matches`: 1
- `fabricated_or_unmatched_quotes`: 1
- `duplicates`: 1
- `appendix_entries_not_cited`: 1
- Microsoft `jd_000173`: AMBER `terminal_punctuation_only` ·
  `r2_sub_tier=case_insensitive` · `r2_source_terminal_char=,`
- NVIDIA `jd_000201`: RED `unmatched_ellipsis_fragment` (R1
  preserved)
- Reproduces the 5d-R2 result exactly, confirming that the checker
  interface used by the harness integration path is stable.

## 14 · What worked

- **Additive integration**: one new helper (`runQuoteIntegrity`)
  + one invocation site + one new block on each of 3 output files.
  No existing harness logic altered.
- **Import diff is minimal**: added `readFileSync` from `node:fs`
  and `spawnSync` from `node:child_process`. Both stdlib. No new
  npm dependency.
- **Telemetry-only stays honest**: all 5 new checks are
  `level: "amber"`, and `metadata.quote_integrity.blocking_mode`
  states `telemetry_only` explicitly. `verdict.md` reinforces the
  same in prose.
- **Failure paths are named**: `blocked_no_report`,
  `blocked_no_corpus`, `checker_error` are distinguishable and
  visible in `verdict`. Stderr excerpt (≤ 500 chars) is captured
  for `checker_error` so a human review can diagnose without opening
  the scratchpad.
- **`node --check` passes** on both scripts.
- **Dry-run reproduces 5d-R2 result** exactly — proves the
  invocation contract works.
- **No 5c / 5d-R2 artifact mutation**. Both remain on disk unchanged.
- **No baseline mutation**. A + B still `current` at their prior
  commits.

## 15 · What remains untested because no generation happened

- The **full round-trip** from Playwright generation → scratchpad
  save → quote-integrity invocation → three-file write has NOT been
  exercised end-to-end. That is the intended scope of the next loop
  (controlled A + B generation with checker attached).
- **`verdict.md` "## Quote integrity" section** is unverified in a
  real run — only reasoned from the string template.
- **`structural_checks.json`** 5 new checks are unverified in a real
  run — the array is only appended to at runtime.
- **`metadata.json` `quote_integrity` block** is unverified in a
  real run for the same reason.
- The dry-run only validates the checker's own behavior; it does not
  exercise the `runQuoteIntegrity` wrapper inside the harness.
- The harness has not been executed in either the `--fixture A` or
  `--fixture B` path this loop.

Reasonable next step is a **single controlled Fixture A + Fixture B
generation with the checker attached** (AgentOps-5d), which will
produce the first real committed `quote_integrity_summary.json`
under `.agent/regression_runs/<runId>/`.

## 16 · Baseline impact

- **No** `.agent/regression_baselines/**` mutation.
- Fixture A `current` (`fixture-A_20260714T025246Z_current`,
  commit `451bb7f`) untouched.
- Fixture B `current` (`fixture-B_20260719T054151Z_current`,
  commit `0341461`) untouched.
- Both remain conceptually `quote_integrity_not_evaluated`. The
  first real `quote_integrity_summary.json` inside a
  `regression_runs/<runId>/` directory can only exist after 5d runs
  a controlled generation. That is a separate loop.

## 17 · Artifact policy

- **Committed** (this loop):
  - `scripts/report-regression-local.mjs` (modified · additive)
  - `.agent/tasks/2026-07-22_run_02_TASK.md`
  - `.agent/design_memos/2026-07-22_AgentOps-5c-integrate_quote_integrity_harness_envelope.md`
  - `.agent/quote_integrity_runs/20260722T_AGENTOPS5C_INTEGRATE_fixture-B/quote_integrity_summary.json`
    (dry-run artifact · ~6 KB · diff-friendly)
- **Not committed**: `report.md`, `report.png`, `/tmp/agentops-5b/`
  scratchpad artifacts, uploaded PDFs, full report body, long quote
  excerpts, secrets.
- **Frozen** (verified untouched):
  `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/**`
  (5c artifact),
  `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/**`
  (5d-R2 artifact),
  `.agent/regression_runs/**` (all prior run envelopes read-only).

## 18 · Boundaries respected

- No `.agent/scripts/**` edit (hard rule per AgentOps-2c Q3-Q8).
- No `src/**` edit (`src/data/web_bundle.json` read-only reference
  path in the harness invocation).
- No `.agent/regression_baselines/**` /
  `.agent/regression_runs/**` /
  `.agent/regression_fixtures/**` edit.
- No pipeline edit (`b019786` unchanged).
- No harness generation run · no Playwright · no report generation ·
  no Anthropic/OpenAI call.
- No `package.json` / lockfile / `.github/workflows/**` / `.env*` /
  `vercel.json` / Codex-Claude config edits.
- No uploaded PDFs · no `report.md` · no `*.png` committed.
- No blocker resolved (BLK-0001 / BLK-0002 / BLK-0003 remain `open`).
- No G2.1d start · no Codex planner implementation.
- Cost: **$0**.
- 5c / 5d-R2 quote-integrity artifacts untouched.
- R1 / R2 policy preserved. Telemetry-only preserved.

## 19 · Recommended next loop

**AgentOps-5d · controlled A + B generation with checker attached**.

- One Fixture A + one Fixture B generation run under the modified
  harness.
- Each run emits a new `.agent/regression_runs/<runId>/` with 4
  committed files (`metadata.json`, `structural_checks.json`,
  `verdict.md`, `quote_integrity_summary.json`).
- Purpose: prove the full pipeline end-to-end · measure that
  `quote_integrity.blocking_mode = "telemetry_only"` really is
  non-blocking · surface real quote-integrity results from a fresh
  generation (not just replay of the frozen Fixture B baseline
  source).
- Expected cost approximately **~$0.10** (two Sonnet 4.6 report
  generations).
- **No baseline mutation** unless separately approved.
- **No A-E full suite.** **No Fixture C/D/E.**

Optional pre-5d loop if we want to be extra cautious: run
`node scripts/report-regression-local.mjs --fixture B` under an
`AgentOps-5d-dryrun` label first, to prove the wrapper in-situ on
one fixture before doubling to A + B. Same $0.05 cost as a single
Fixture B run.

Either way, the checker's blocking status should stay
`telemetry_only` until a separate DECISION promotes it. That is the
firmest boundary from R1 (fabrication-adjacent RED must stay
loud but not yet fatal to the harness exit code).
