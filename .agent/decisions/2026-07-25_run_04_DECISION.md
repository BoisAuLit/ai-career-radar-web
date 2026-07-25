# DECISION · AgentOps-5e-followup-phase3-structural-rendered-text-contract-implement · APPROVE · push authorization deferred

## Metadata

- **decision_id**: `2026-07-25_run_04_DECISION`
- **date**: 2026-07-25
- **based_on_run_report**: `.agent/run_reports/2026-07-25_run_04_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-25_run_04_TASK.md`
- **based_on_memo**: `.agent/design_memos/2026-07-25_AgentOps-5e-followup-phase3-structural-rendered-text-contract-implement.md`
- **authorizing_decision**: `.agent/decisions/2026-07-25_run_03_DECISION.md`
- **loop**: `AgentOps-5e-followup-phase3-structural-rendered-text-contract-implement`
- **parent_loop**: `AgentOps-5e-followup-phase3-structural-product-quality-diagnostics-design` (`2026-07-25_run_03`)
- **implementation_commits**: `3087041`, `3d64d69`, `ec9fe8d`
- **decision_commit**: `<pending>` (this commit)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (for push · for a subsequent separately cost-approved live fixture validation · for any downstream promotion or baseline action)
- **required_fixes**: **none**

## Outcome classification

**Path A structural rendered-text contract correction implemented and
deterministically validated. Approved for a separately authorized push.**

## Reasoning summary

The implementation corrects the deterministic contract mismatch
between browser-rendered `innerText` and the structural checker's
prior Markdown-literal grammar. It preserves support for approved raw
Markdown headings while narrowly adding approved rendered plain-text
forms. It also adds deterministic appendix-row parsing for tab, pipe,
and two-or-more-space representations while retaining strict
three-column and `jd_id` validation. Citation syntax and thresholds
remain byte-identical. All 40 pre-existing structural tests and 40
new rendered-text contract tests pass, integration tests remain
26/26, classify tests remain 51/51, and TypeScript checking succeeds.
Structural telemetry remains non-blocking and no provider call,
fixture rerun, baseline mutation, prompt change, harness change, QI
change, or production application source change occurred.

## Implementation commits

- **`3087041`** — Fix structural checker rendered text contract
- **`3d64d69`** — Document structural rendered text fix
- **`ec9fe8d`** — Add structural rendered-text test fixtures

## Tests-first evidence

- **pre-existing tests before correction**: **40 / 40 pass**
- **new RTC tests before correction**: **24 pass · 16 fail as expected**
- **failing RTC identifiers**:
  - `RTC01`, `RTC02`, `RTC03`, `RTC04`, `RTC05`
  - `RTC14`
  - `RTC15`, `RTC16`
  - `RTC20`, `RTC21`, `RTC22`, `RTC23`, `RTC24`
  - `RTC29`, `RTC30`
  - `RTC32`
- **post-correction structural tests**: **80 / 80 pass**

## Final test results

- **structural checker**: **80 / 80 pass**
- **structural integration**: **26 / 26 pass**
- **classify schema**: **19 / 19 pass**
- **classify route**: **32 / 32 pass**
- **grand total**: **157 / 157 pass**
- **TypeScript**: `npx tsc --noEmit` exit **0**

## Gap heading grammar

- **regex**: `/^\s*(?:##\s+)?Your top 5 gaps(?:,\s*ranked(?:\s*\(5 numbered items\))?)?\s*$/im`
- **matching scope**: **complete line**
- **Markdown prefix**: **optional exact `##`**
- **accepted semantic phrase**: `Your top 5 gaps`
- **accepted suffixes**:
  - none
  - `, ranked`
  - `, ranked (5 numbered items)`
- **case**: **deterministic case-insensitive**
- **arbitrary suffixes**: **rejected**
- **prose prefix or suffix**: **rejected**
- **unsupported heading levels** (`#`, `###`, `####`): **rejected**
- **fuzzy matching**: **absent**
- **edit distance**: **absent**
- **semantic or LLM matching**: **absent**

## Appendix heading grammar

- **regex**: `/^\s*(?:##\s+)?Evidence Appendix\s*$/im`
- **accepted**:
  - `## Evidence Appendix`
  - `Evidence Appendix`
- **full-line requirement**: **true**
- **prose mention**: **rejected**
- **unrelated appendix** (e.g. `Supporting Evidence Appendix`): **rejected**
- **arbitrary suffix** (e.g. `Evidence Appendix Notes`): **rejected**

## Appendix row parser

- **fixed order**:
  1. tab-separated
  2. pipe-separated (with optional outer `|` delimiters)
  3. two-or-more whitespace
- **required logical columns**: **3**
- **fields**:
  - `jd_id`
  - company
  - title
- **`jd_id`**: must match `/^jd_\d{4,}$/i`
- **company**: non-empty
- **title**: non-empty
- **header rows** (`JD_ID ...`, `| jd_id | company | title |`): ignored as headers, not accepted as data
- **GFM separator rows** (`|---|---|---|`): ignored as separators, not accepted as data
- **two-column**: **rejected**
- **four-column**: **rejected**
- **malformed jd-like rows**: recorded as `malformed_rows`
- **extra columns**: **not silently discarded**

## Follow-on section boundary

- deterministic line-oriented boundaries
- supports Markdown headings (`## <heading>`)
- supports approved rendered section headings (`Skills you might be over-prioritizing`, `Your single highest-leverage next action`, `Evidence Appendix`)
- **earliest valid boundary wins**
- **no fuzzy section classification**

## Citation logic

- **Evidence quote regex**: **byte-identical before and after**
- **regex**: `/Evidence quote:\s*["“]([^"”\n]{5,})["”]\s*[—–\-]\s*([^,\n]{1,120}?),\s*(jd_\d{4,})/g`
- **citation regex broadening**: **none**
- **citation threshold**: **5**
- **citation threshold changed**: **false**
- **required gap count**: **5**
- **gap threshold changed**: **false**
- **guards**:
  - **RTC37** — reads the source literal and asserts byte-identical citation regex
  - **RTC38** — reads the source and asserts both `REQUIRED_GAP_COUNT = 5` and `MIN_CITATION_LINE_COUNT = 5` constant lines

## Telemetry isolation

- **structural blocking mode**: **`telemetry_only`**
- **`affected_legacy_verdict`**: **false**
- **`affected_process_exit`**: **false**
- **combined**: **`display_only`**
- **structural enters `checks[]`**: **false**
- **combined enters `checks[]`**: **false**
- **`classify(checks)`**: **unchanged**
- **`process.exit` authority**: `classification.exit`
- **integration helper**: **unchanged**
- **harness**: **unchanged**
- **guard (blocking_mode)**: **RTC39**
- **`network_used`**: **false**
- **`llm_used`**: **false**
- **`source_rewritten`**: **false**
- **guard (network/llm/rewrite)**: **RTC40**

## Green-flip interpretation

Any future structural RED → GREEN result caused by this correction must be classified as:

- **checker / capture contract correction**
- **not** report-content improvement
- **not** prompt improvement
- **not** baseline promotion
- **not** blocking promotion

## No-change verification

- **`src/**`**: unchanged
- **`src/app/page.tsx`**: unchanged
- **prompt** (`src/lib/prompts.ts`): unchanged
- **QI checker** (`scripts/quote-integrity-check.mjs`): unchanged
- **harness** (`scripts/report-regression-local.mjs`): unchanged
- **integration helper** (`scripts/lib/structural-evidence-integration.mjs`): unchanged
- **integration tests** (`scripts/test-structural-evidence-integration.mjs`): unchanged
- **classify tests** (`scripts/test-classify-schema.mjs`, `scripts/test-classify-route.mjs`): unchanged
- **package files** (`package.json`, `package-lock.json`): unchanged
- **regression fixtures** (`.agent/regression_fixtures/**`): unchanged
- **regression baselines** (`.agent/regression_baselines/**`): unchanged
- **regression runs** (`.agent/regression_runs/**`): unchanged
- **`.agent/scripts/**`**: unchanged
- **workflows** (`.github/**`): unchanged
- **env** (`.env*`): unchanged
- **Vercel config** (`vercel.json`): unchanged
- **pipeline**: unchanged (`b019786`)

## Deployment statement

- **manual deploy**: **false**
- **production application source changed** (`src/**`): **false**
- **checker scripts changed** (`scripts/structural-evidence-check.mjs` + test file + fixtures): **true**
- **Git-connected build behavior**: **not established by this loop**
- **Do NOT claim** that a subsequent Git push will or will not trigger a Vercel build; that depends on repository deployment configuration which is not established here. What IS established: no manual deploy occurred, no production application source under `src/**` changed, and the implementation affects `scripts/**` deterministic regression checking only.

## Residual risks

- Rendered grammar must remain narrow enough to avoid prose matches (RTC08, RTC09, RTC10, RTC11, RTC17 exercise this).
- Multi-space appendix row parser must not misclassify prose (RTC29 exercises this).
- Future GREEN flip could be misunderstood as report improvement — the implementation DECISION and any subsequent live-validation DECISION must explicitly disclaim.
- Fixture A diagnosis lacks the same direct QI cross-check evidence as Fixture B — the parent DECISION already flagged this; live validation is the only path to direct confirmation and it is not authorized here.
- Live captured-text validation has **not** yet been run after the correction. Behavior on real Fixture A / Fixture B captures is inferred deterministically from the RTC synthetic tests but not empirically observed.

## Rollback

- **revert**:
  - `3087041`
  - `3d64d69`
  - `ec9fe8d`
- **no source application rollback required**
- **no prompt rollback required**
- **no baseline rollback required**
- **no telemetry migration required**
- **no data migration required**

## Fixture and provider authorization

- **Fixture A rerun**: **false**
- **Fixture B rerun**: **false**
- **paid provider call**: **false**
- **live validation**: **requires separate explicit cost authorization**

## Promotion posture

- **structural**: **`telemetry_only`**
- **QI**: **`telemetry_only`**
- **combined**: **`display_only`**
- **blocking promotion**: **unauthorized**
- **baseline mutation**: **unauthorized**
- **baseline eligibility change**: **unauthorized**
- **`AgentOps-5f-promote`**: **not authorized**
- **Phase 4**: **not authorized**
- **Phase 5**: **not authorized**
- **Phase 6**: **not authorized**

## Cost

- **implementation**: **$0**
- **DECISION**: **$0**
- **provider calls**: **0**
- **fixture reruns**: **0**

## Human approval needed

`yes`

> Required for: push · daily summary update · any subsequent live
> fixture validation · any promotion or baseline action · any
> downstream action listed under **Not authorized**.

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT deploy.**
**Do NOT call a real provider.** **Do NOT rerun Fixture A.** **Do
NOT rerun Fixture B.** **Do NOT mutate baselines.** **Do NOT change
prompts.** **Do NOT change the harness.** **Do NOT change QI checker
semantics.** **Do NOT change the integration helper.** **Do NOT change
classify semantics.** **Do NOT promote structural / QI / combined to
blocking.** **Do NOT start `AgentOps-5f-promote`.** **Do NOT start
Phase 4 / 5 / 6.**
