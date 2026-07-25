# RUN REPORT · AgentOps 5e implement structural rendered text contract fix

## Metadata

- **task_id**: `2026-07-25_run_04`
- **date**: `2026-07-25`
- **run_number**: `04`
- **branch**: `main`
- **loop**: `AgentOps-5e-followup-phase3-structural-rendered-text-contract-implement`
- **parent_loop**: `AgentOps-5e-followup-phase3-structural-product-quality-diagnostics-design` (`2026-07-25_run_03`)
- **authorizing_decision**: `.agent/decisions/2026-07-25_run_03_DECISION.md`
- **human_authorization**: Bohao 2026-07-25 explicit GO — Path A implementation.

## Commits

- `<hash-1>` Fix structural checker rendered text contract
- `<hash-2>` Document structural rendered text fix

## Files changed

```
 scripts/structural-evidence-check.mjs                              | 155 ++++++--
 scripts/test-structural-evidence-check.mjs                         | 570 ++++++++
 .agent/tasks/2026-07-25_run_04_TASK.md                             |  ++
 .agent/design_memos/2026-07-25_AgentOps-5e-followup-phase3-structural-rendered-text-contract-implement.md | ++
 .agent/run_reports/2026-07-25_run_04_RUN_REPORT.md                 |  ++
```

## Approved diagnosis reference

`.agent/decisions/2026-07-25_run_03_DECISION.md` — Path A selected · Path B rejected · Path C rejected · `multiple_root_causes_confirmed` · prompt consistent · Fixture B directly confirmed via QI cross-check · Fixture A strongly supported by converging evidence.

## Exact changed files

- `scripts/structural-evidence-check.mjs` (155 lines net changed)
- `scripts/test-structural-evidence-check.mjs` (570 lines added — 40 new RTC tests)
- `scripts/lib/structural-evidence-integration.mjs` — **UNCHANGED** (no isolation-assertion additions needed; existing 26/26 tests pass unmodified)
- `scripts/quote-integrity-check.mjs` — **UNCHANGED**
- `scripts/report-regression-local.mjs` — **UNCHANGED**
- `src/**` — **UNCHANGED**
- `src/lib/prompts.ts` — **UNCHANGED**
- `src/app/page.tsx` — **UNCHANGED**
- `package.json` / `package-lock.json` — **UNCHANGED**
- `.agent/regression_fixtures/**` — **UNCHANGED**
- `.agent/regression_baselines/**` — **UNCHANGED**
- `.agent/regression_runs/**` — **UNCHANGED**
- `.agent/scripts/**` — **UNCHANGED**
- `.github/**` / `.env*` / `vercel.json` — **UNCHANGED**
- pipeline — **UNCHANGED** (`b019786`)

## Pre-change failing tests

Before the checker code change (with RTC tests already added), running `node scripts/test-structural-evidence-check.mjs` produced:

- **Failing (16 tests, all expected under current checker)**:
  - `RTC01 · rendered exact gap heading accepted`
  - `RTC02 · rendered heading with approved suffix ', ranked' accepted`
  - `RTC03 · rendered heading with full approved suffix accepted`
  - `RTC04 · markdown-source exact gap heading still accepted` (mixed report: `##` gap + rendered appendix)
  - `RTC05 · markdown-source heading with approved suffix still accepted` (same mixed shape)
  - `RTC14 · leading/trailing whitespace tolerated on rendered heading line`
  - `RTC15 · rendered 'Evidence Appendix' heading accepted`
  - `RTC16 · markdown-source '## Evidence Appendix' still accepted` (on rendered-report body)
  - `RTC20 · tab-separated rows still accepted` (appendix parser blocked by heading detection)
  - `RTC21 · multi-space (2+ spaces) rows accepted`
  - `RTC22 · pipe-separated rows (outer delimiters) accepted`
  - `RTC23 · pipe-separated rows (no outer delimiters) accepted`
  - `RTC24 · two-column row rejected as malformed`
  - `RTC29 · prose with incidental multiple spaces NOT counted as row`
  - `RTC30 · GFM separator row |---|---|---| rejected`
  - `RTC32 · 5 citations inside rendered gap section counted`
- **Passing (24 rejection/guard tests + all 40 pre-existing tests)**

Post-change (with grammar correction applied): **80/80 pass**.

## Post-change passing tests

- `scripts/test-structural-evidence-check.mjs`: **80/80 pass** (40 pre-existing + 40 new RTC)
- `scripts/test-structural-evidence-integration.mjs`: **26/26 pass** (unchanged file)
- `scripts/test-classify-schema.mjs`: **19/19 pass** (unchanged)
- `scripts/test-classify-route.mjs`: **32/32 pass** (unchanged)
- **Grand total: 157/157 pass**
- `npx tsc --noEmit`: **exit 0**

## Exact grammar

**Gap heading regex**:

```
/^\s*(?:##\s+)?Your top 5 gaps(?:,\s*ranked(?:\s*\(5 numbered items\))?)?\s*$/im
```

- whole-line, line-anchored (`^\s*...\s*$` with `m` flag)
- optional exact `##` prefix (no `#` / `###` / `####` — RTC12/13 reject those)
- exact phrase `Your top 5 gaps`
- approved suffixes only: none · `, ranked` · `, ranked (5 numbered items)`
- deterministic case-insensitive matching (`i` flag)
- bounded leading/trailing line whitespace tolerance only
- **no fuzzy / edit-distance / substring / semantic / LLM matching**

**Appendix heading regex**:

```
/^\s*(?:##\s+)?Evidence Appendix\s*$/im
```

- same shape as gap heading
- accepts `## Evidence Appendix` and `Evidence Appendix`
- rejects prose mentions, unrelated titles, extra suffixes

**Follow-on section boundary detector**: line-anchored patterns for `## <heading>` OR `Skills you might be over-prioritizing` OR `Your single highest-leverage next action` OR `Evidence Appendix` — earliest wins.

## Exact appendix row parser behavior

`parseAppendixRow(rawLine)` — deterministic fixed-order fallback:

1. **Tab-separated** (`line.split('\t')`) — exactly 3 parts · `jd_\d{4,}` · non-empty company + title.
2. **Pipe-separated** (`line.split('|')` after stripping empty outer parts) — exactly 3 remaining · same validation.
3. **Two-or-more whitespace** (`line.split(/\s{2,}/)`) — exactly 3 parts · same validation.

Additional line-level filters:

- `JD_ID` prefix — skip header row
- `| jd_id ` prefix — skip header row
- GFM separator row (`|---|---|---|`) — skip via regex
- `## ` heading start — terminate appendix
- Blank line — skip
- Non-`jd_`-like line — ignore as prose
- `jd_`-like line failing all 3 parse attempts — recorded as `malformed_rows`

## Citation regex unchanged evidence

- Before: `/Evidence quote:\s*["“]([^"”\n]{5,})["”]\s*[—–\-]\s*([^,\n]{1,120}?),\s*(jd_\d{4,})/g`
- After:  `/Evidence quote:\s*["“]([^"”\n]{5,})["”]\s*[—–\-]\s*([^,\n]{1,120}?),\s*(jd_\d{4,})/g`
- **Byte-identical.**
- RTC37 asserts the exact multi-line source literal is unchanged in `scripts/structural-evidence-check.mjs`.

## Thresholds unchanged evidence

- `const REQUIRED_GAP_COUNT = 5;` — **byte-identical**
- `const MIN_CITATION_LINE_COUNT = 5;` — **byte-identical**
- RTC38 asserts both constant lines exist unchanged in the source.

## Structural test totals

**80 / 80 pass** (`node scripts/test-structural-evidence-check.mjs`).

## Integration test totals

**26 / 26 pass** (`node scripts/test-structural-evidence-integration.mjs`). File unchanged.

## Classify test totals

- Schema: **19 / 19 pass**
- Route:  **32 / 32 pass**
- Total:  **51 / 51 pass**

## TypeScript result

`npx tsc --noEmit` → **exit 0**

## Telemetry isolation evidence

- `blocking_mode: "telemetry_only"` preserved in every structural artifact — RTC39 asserts.
- `network_used=false`, `llm_used=false`, `source_rewritten=false` preserved — RTC40 asserts.
- `scripts/lib/structural-evidence-integration.mjs` **unchanged** — `BLOCKING_MODE = "telemetry_only"`, `affected_legacy_verdict: false`, `affected_process_exit: false` invariants intact.
- `scripts/report-regression-local.mjs` **unchanged** — legacy `checks[]` unchanged · `classify(checks)` unchanged · `process.exit(classification.exit)` unchanged.
- Baselines **unchanged**.

## Green-flip interpretation

Any subsequent structural RED → GREEN change on Fixture A / Fixture B driven by this correction MUST be documented as:

- **checker / capture contract correction**
- **NOT** improved report content
- **NOT** improved prompt behavior
- **NOT** baseline promotion
- **NOT** blocking promotion

Live validation of the flip is out of scope for this loop and requires a separate cost-approved fixture run.

## Provider calls · fixture reruns · baseline / prompt / harness / QI diff verification

- **Provider calls**: **0** (no Anthropic · no OpenAI · no `/api/classify` · no `/api/generate-report`)
- **Fixture reruns**: **0** (no Fixture A · no Fixture B · no `report-regression-local.mjs` invocation)
- **Dev server**: not started
- **Playwright**: not launched
- **Baseline diff**: empty ✓
- **Prompt diff**: empty ✓ (`src/lib/prompts.ts` untouched)
- **Harness diff**: empty ✓ (`scripts/report-regression-local.mjs` untouched)
- **QI diff**: empty ✓ (`scripts/quote-integrity-check.mjs` untouched)
- **Integration helper diff**: empty ✓ (`scripts/lib/structural-evidence-integration.mjs` untouched)
- **Package diff**: empty ✓ (no dependency change)
- **page.tsx diff**: empty ✓
- **Fixture diff**: empty ✓
- **Regression-run diff**: empty ✓

## Cost

- **cost this loop**: **$0**
- **cost_measured**: `n/a` (no provider work)

## Regression verdict

- **regression_required**: `no` (structural checker code change · isolated to telemetry-only path · legacy verdict + process exit unaffected · no fixture rerun authorized)
- **reason_required_or_not**: Path A implementation is a checker-contract correction that runs entirely under the deterministic test suite. Live fixture validation is deferred to a separately cost-approved run.
- **harness_used**: `no`
- **verdict**: `not_required`
- **exit_code**: `n/a`
- **estimated_cost**: **$0**
- **reviewer_action_required**: **human + ChatGPT review; then Path A implementation DECISION**
- **push_implication**: **no push before DECISION**

## Constraints checked

- [x] `.github/workflows/*` — untouched
- [x] `src/**` — untouched
- [x] `src/lib/prompts.ts` — untouched
- [x] `src/app/page.tsx` — untouched
- [x] `scripts/quote-integrity-check.mjs` — untouched
- [x] `scripts/report-regression-local.mjs` — untouched
- [x] `scripts/lib/structural-evidence-integration.mjs` — untouched
- [x] `package.json` / `package-lock.json` — untouched
- [x] `.env*` — untouched
- [x] `.agent/scripts/**` — untouched
- [x] `.agent/regression_baselines/**` — untouched
- [x] `.agent/regression_fixtures/**` — untouched
- [x] `.agent/regression_runs/**` — untouched
- [x] pipeline — untouched (`b019786`)
- [x] Citation regex byte-identical (RTC37)
- [x] Thresholds byte-identical (RTC38)
- [x] Structural blocking_mode telemetry_only (RTC39)
- [x] `network_used`/`llm_used`/`source_rewritten` false (RTC40)
- [x] No `report.md` / screenshot / raw log / secret / long body reproduction
- [x] No provider call · no fixture rerun · no dev server · no Playwright · no manual deploy

## Red-zone check

Red-zone files modified this run: **none**. Approval reference: N/A.

## Validation results

```
$ node --check scripts/structural-evidence-check.mjs                → OK
$ node --check scripts/test-structural-evidence-check.mjs           → OK
$ node scripts/test-structural-evidence-check.mjs                    → 80 / 80 pass
$ node scripts/test-structural-evidence-integration.mjs              → 26 / 26 pass
$ node scripts/test-classify-schema.mjs                              → 19 / 19 pass
$ node scripts/test-classify-route.mjs                               → 32 / 32 pass
$ npx tsc --noEmit                                                   → exit 0

$ git diff --name-only
scripts/structural-evidence-check.mjs
scripts/test-structural-evidence-check.mjs
(before governance commit)
```

## Build result

`pass` (`tsc --noEmit` exit 0; no separate `npm run build` required — checker + tests are Node ESM scripts).

## Tests result

`pass` — 157/157 across all deterministic suites; 40 new RTC tests exercise both accept and reject cases for rendered-text grammar.

## Screenshots (if any)

**None** — no frontend edit this loop.

## Risks

- Rendered-text grammar remains narrow. Future prompt evolutions that introduce new heading suffixes will be rejected unless a follow-up DECISION extends the approved-suffix list.
- Appendix pipe-form parser rejects rows whose title contains an unescaped `|`. Deterministic and safe; pipes-in-titles need upstream escaping if they occur.
- Follow-on section boundary detector uses hard-coded section names. Prompt evolution that changes those names requires a follow-up DECISION.
- No live provider validation performed; correctness is verified against 40 synthetic RTC fixtures + 40 pre-existing tests. Live validation on Fixture A / Fixture B requires a separate cost-approved run.
- Fixture A's diagnosis remained "strongly supported" (not directly confirmed by same-text QI cross-check) in the parent DECISION; this loop preserves that framing.

## Follow-up recommendations

- **Human + ChatGPT review** of memo + this RUN_REPORT + the 40 RTC tests.
- **Path A implementation DECISION** in a separate loop under explicit GO — verdict, push authorization, and (optionally) authorization for a separately cost-approved live Fixture A + Fixture B rerun to observe the RED → GREEN flip on real captured text.
- Do NOT rerun fixtures. Do NOT push. Do NOT promote structural. Do NOT start Phase 4/5/6 or `AgentOps-5f-promote`.

## Implementation recommendation

`approve` — 40 new RTC tests + all 117 pre-existing tests pass · grammar is deterministic and narrow · citation regex byte-identical · thresholds unchanged · telemetry isolation preserved · no forbidden file touched.

## Ready for review

`yes`

## Requires human decision

`yes` — push · DECISION · any subsequent live validation all require explicit human approval.
