# AgentOps-5d-fixture-b-timeout · Fixture B timeout root-cause investigation · findings memo

> Inspection-only · **$0** · no generation · no harness run · no
> LLM/API call · no threshold mutation · no code change · no
> baseline mutation.

## 1 · Purpose

Determine why Fixture B completed successfully around **67 s** on
2026-07-19 (baseline `20260719T054151Z_fixture-B` · commit
`0341461`) but **timed out around 241 s** on two consecutive
controlled 2026-07-23 runs (5d B `20260723T035828Z_fixture-B` and
5d-stability B `20260723T042759Z_fixture-B` · both on commit
`59185807`+).

## 2 · Approved scope

Per `.agent/decisions/2026-07-23_run_01_DECISION.md` (5d-stability
approve): AgentOps-5d-fixture-b-timeout is an **inspection-first,
$0** targeted investigation. No new generation. No threshold
mutation. No code changes. No baseline mutation. Optional
diagnostics rerun only in a **separate later loop** if this
inspection cannot conclude root cause.

## 3 · What was not run

- **No** Playwright.
- **No** `scripts/report-regression-local.mjs` invocation
  (generation).
- **No** Fixture A or Fixture B rerun.
- **No** Anthropic / OpenAI API call.
- **No** threshold mutation.
- **No** code changes (harness, checker, `src/**`,
  `.agent/scripts/**`).
- **No** baseline mutation / promotion.
- **No** prior artifact mutation.
- **`--help` NOT invoked** (documented unsafe in 5d).

## 4 · Artifacts inspected

### Read-only

- `.agent/regression_baselines/fixture-B/current/baseline_metadata.json`
- `.agent/regression_runs/20260719T054151Z_fixture-B/{metadata.json,structural_checks.json,verdict.md}`
- `.agent/regression_runs/20260723T035828Z_fixture-B/{metadata.json,structural_checks.json,verdict.md}`
- `.agent/regression_runs/20260723T042759Z_fixture-B/{metadata.json,structural_checks.json,verdict.md}`
- `.agent/regression_runs/20260723T035644Z_fixture-A/metadata.json`
  (5d A success · for control comparison)
- `.agent/regression_runs/20260723T042627Z_fixture-A/metadata.json`
  (5d-stability A success · for control comparison)
- `.agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md`
  (fixture path referenced by `FIXTURE_TABLE.B`)
- `scripts/report-regression-local.mjs` (HEAD)
- `scripts/quote-integrity-check.mjs` (HEAD)
- `src/app/page.tsx` (lines around action-bar rendering + error
  state)
- `src/app/api/generate-report/route.ts` (stream + error paths)
- `git show 0341461:scripts/report-regression-local.mjs`

### `git diff --stat 0341461..HEAD` scope

- **`scripts/report-regression-local.mjs`**: +161 / −3 (5c-integrate
  changes only — additive `runQuoteIntegrity` helper + downstream
  metadata / structural / verdict wiring).
- **`scripts/quote-integrity-check.mjs`**: new file, +469 lines
  (5b/5d-R2 checker).
- **`src/**`**: unchanged.
- **`package.json` / `package-lock.json`**: unchanged.
- **`.github/workflows/**`**: unchanged.
- **`vercel.json`**: unchanged.
- **`.agent/regression_fixtures/**`**: unchanged.

## 5 · Successful B baseline summary

- **run_id**: `20260719T054151Z_fixture-B`
- **source_commit_sha**: `0341461`
- **harness_script_commit**: `0341461`
- **legacy verdict**: **GREEN**
- **exit_code**: 0
- **duration_ms**: **67 608**
- **report_char_count**: **10 445**
- **capture_scope**: `main section`
- **fallback_used**: false
- **model_display**: Claude Sonnet 4.6
- **corpus_snapshot**: May 14, 2026
- **console_errors**: **`[]`** (empty)
- **previous_green_duration_ms**: 67 719 (2026-07-19 pair · +0.4%
  char delta · −0.2% duration delta · extremely stable)

## 6 · Failed B run #1 summary (5d)

- **run_id**: `20260723T035828Z_fixture-B`
- **git_commit_sha**: `59185807…` (commit of the harness at that
  moment)
- **legacy verdict**: **RED**
- **exit_code**: 1
- **duration_ms**: **240 964** (over 240 s hard by ~1 s)
- **report_char_count**: **0**
- **capture_scope**: `unset`
- **fallback_used**: false
- **quote_integrity_verdict**: `blocked_no_report`
- **console_errors**:
  1. `console.error: Failed to load resource: the server responded
     with a status of 502 (Bad Gateway)`
  2. `waitForDoneFailed: page.waitForSelector: Timeout 240000ms
     exceeded.` `waiting for locator('button:has-text("Copy report")')
     to be visible`
- **failed structural reds**: `done_state_reached` ·
  `report_non_empty` · `report_text_capture_success` ·
  5 `contains_section_*` · `contains_evidence_appendix` ·
  `duration_under_hard_threshold`

## 7 · Failed B run #2 summary (5d-stability)

- **run_id**: `20260723T042759Z_fixture-B`
- **git_commit_sha**: `59185807…` (same as run #1)
- **legacy verdict**: **RED**
- **exit_code**: 1
- **duration_ms**: **240 992** (over 240 s hard by ~1 s · +28 ms
  vs run #1)
- **report_char_count**: **0**
- **capture_scope**: `unset`
- **fallback_used**: false
- **quote_integrity_verdict**: `blocked_no_report`
- **console_errors**: **identical** to run #1:
  1. `console.error: Failed to load resource: the server responded
     with a status of 502 (Bad Gateway)`
  2. `waitForDoneFailed: page.waitForSelector: Timeout 240000ms
     exceeded.` (same message)

**Bit-for-bit identical failure mode across 2 consecutive
attempts.**

## 8 · Timeline comparison

| aspect | baseline B (2026-07-19) | 5d B (2026-07-23) | 5d-stability B (2026-07-23) | 5d A / 5d-stability A (control · 2026-07-23) |
|---|---|---|---|---|
| duration_ms | 67 608 | 240 964 | 240 992 | 76 444 / 66 771 |
| report_char_count | 10 445 | 0 | 0 | 11 341 / 10 089 |
| capture_scope | main section | unset | unset | main section |
| verdict | GREEN | RED | RED | GREEN |
| console_errors | `[]` | 502 + waitForDoneFailed | 502 + waitForDoneFailed | `[]` |
| harness_script_commit | 0341461 | 22b7719 (5c-integrate) + | 22b7719 (5c-integrate) + | 22b7719 (5c-integrate) + |

## 9 · Git diff comparison between 0341461 and HEAD

- **Only diffs are the 5c-integrate wrapper** (+161/−3 in the
  harness) **and the new checker** (+469 in the new file).
- **The wrapper runs AFTER `writeFile(scratchReportPath,
  reportText)`** in the harness main flow (roughly line 620 in the
  post-integration file). It is downstream of the wait-for-done
  block. If report text is empty, the wrapper takes the
  `blocked_no_report` branch and does not spawn the checker.
- **`SOFT_LATENCY_MS = 120_000` and `HARD_LATENCY_MS = 240_000`
  UNCHANGED** in both `0341461` and HEAD.
- **Wait selector `button:has-text("Copy report")` UNCHANGED** in
  both.
- **`FIXTURE_TABLE.B` entry UNCHANGED** (same path · same
  must-not-happen literals · same recommendation keywords).
- **Fixture file `benchmark_B_fullstack_to_ai_product.md`
  UNCHANGED**.
- **No `src/**` or `package.json` change.**

**Conclusion**: nothing in-repo between `0341461` and HEAD can
explain why Fixture B was consistently green pre-2026-07-23 and is
now consistently red.

## 10 · Fixture B input comparison

- Fixture B path: `.agent/regression_fixtures/benchmark_B_fullstack_to_ai_product.md`
  — **unchanged** since `0341461`.
- Fixture A path: `.agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md`
  — **unchanged** since `0341461`.
- `FIXTURE_TABLE.B.must_not_literals`: unchanged (`learn react` ·
  `beginner react` · `beginner typescript` ·
  `as an ai language model`).
- `FIXTURE_TABLE.B.recommendationKeywords`: unchanged (`agent` ·
  `tool call` · `tool-call` · `eval` · `telemetry`).
- Fixture A and Fixture B share the same target-role /
  resume-fixture shape at the file level. Both are
  `.agent/regression_fixtures/*.md`.

## 11 · Harness wait / done-state analysis

Read from `scripts/report-regression-local.mjs` at HEAD:

- Line 497–504 (approximately): `await
  page.waitForSelector('button:has-text("Copy report")', { timeout:
  HARD_LATENCY_MS })` where `HARD_LATENCY_MS = 240_000`.
- On failure, catches the error and pushes
  `waitForDoneFailed: page.waitForSelector: Timeout 240000ms
  exceeded.` into `consoleErrors`.
- The harness does NOT explicitly detect the error state
  (`stage: "error"`). It only detects `stage: "done"` via the
  "Copy report" button.
- On failure, `reportText` stays empty because scratchpad save is
  guarded by `if (reportText) ...`.
- QI wrapper takes the `blocked_no_report` branch.

Read from `src/app/page.tsx`:

- `stage: "done"` → renders action bar with `📋 Copy report` +
  `⬇️ Download .md` + `📊 Eval this report` + `↺ Start over` (lines
  1362–1397).
- `stage: "error"` → renders an error panel with `↻ Retry` +
  `↺ Start over` (lines 1484–1517).
- Both stages render a `↺ Start over` button.

**This explains** the failed-B `structural_checks.json` line
`action_bar_buttons_present — Copy report=false; Download=false;
Eval this report=false; Start over=true`. The client reached
**`stage: "error"`**. The "Start over" button visible is the one
inside the error section, NOT the one inside the success action
bar.

**Harness cannot distinguish**:

- generation still in progress and slow → false failure
- generation completed → success
- generation errored → false failure (this is what happened)

The harness waits the full 240 s and then times out because it only
polls for the success button, not the error state.

## 12 · App generation path analysis

Read from `src/app/page.tsx` (client `handleSubmit`):

1. Calls `/api/classify` → sets `classification`.
2. Sets `stage: "generating"`.
3. Calls `/api/generate-report` with `{resume, target, classification,
   company_filter}` → gets a stream body.
4. Reads via `gRes.body.getReader()`. Loops on
   `reader.read()`. Accumulates text. Checks for
   `STREAM_COMPLETE_SENTINEL`. On loop exit, sets
   `stage: "done"`.
5. On **any thrown error** in the try block, sets
   `stage: "error"` and stores the error message.

Read from `src/app/api/generate-report/route.ts`:

- Uses `streamText({ model: anthropic(MODEL), system: ...,
  messages: [{ role: "user", content: userMessage }] })`.
- Wraps the async iterator in a `ReadableStream`. On successful
  finish, emits `STREAM_COMPLETE_SENTINEL`. On error, calls
  `controller.error(err)` which propagates to the client's `catch`.
- **No explicit timeout on `streamText`.**
- **No retry on error.**
- Model name is the same constant `MODEL` in both `0341461` and
  HEAD.

**Combined with the 502 console error**, the sequence for failed
Fixture B is:

1. Client posts to `/api/generate-report`.
2. Server calls Anthropic via `streamText`.
3. Anthropic (or the network between browser and the local Next.js
   dev server, or Vercel edge if the request is being proxied) at
   some point returns **502 Bad Gateway**.
4. The client catches the thrown error and sets `stage: "error"`.
5. The error panel renders — this is where "Start over" (the
   error-panel copy) becomes visible.
6. The harness never sees "Copy report", so it waits the full 240 s
   and times out.
7. `reportText` is empty. `report.md` is not saved to scratchpad.
   QI wrapper writes `blocked_no_report`.

## 13 · Quote-integrity side-effect analysis

- QI wrapper runs **after** `writeFile(scratchReportPath,
  reportText)`.
- If `reportText` is empty (which it is on failed B), scratchpad
  save is guarded by `if (reportText) …` and does not run.
- QI wrapper then finds `!existsSync(reportPath)` and returns
  `verdict: "blocked_no_report"` synchronously, **without spawning
  the checker**.
- QI wrapper CANNOT affect generation timing because it runs
  strictly downstream of the wait-for-done + scratchpad-save block.
- **Ruled out** as root cause of B timeout.

## 14 · Root-cause hypothesis ranking

Evidence-weighted, most-to-least likely:

### H1 · Anthropic streaming API returns 502 for Fixture B on 2026-07-23 · CONFIDENCE: HIGH

- **Evidence for**: Both failed B runs have identical
  `console.error: Failed to load resource: the server responded
  with a status of 502 (Bad Gateway)`. Both A runs on the same
  2026-07-23 session have empty `console_errors`. Same target of
  local dev server. Same session. Only Fixture B triggers 502.
- **Evidence against**: The 502 error message says "Failed to load
  resource" which is a generic browser-console phrasing. Not
  definitively Anthropic — could be a page-level resource (image /
  static). But no other resources are known to be Fixture-B-specific,
  and 502 during model call is the direct explanation for
  `stage: "error"` at approximately the same wall clock in both
  runs.
- **Confidence**: **HIGH**.
- **Suggested next action**: **AgentOps-5d-b-timeout-diagnostics** —
  add minimal, targeted harness diagnostics (Playwright
  `page.on("requestfailed")` / `page.on("response")` logging for
  non-2xx from `/api/generate-report` or Anthropic hosts) and one
  controlled Fixture B rerun. Expected ~$0.05.
- **Costs $0? no** (requires one controlled generation).
- **Mutates code? yes but small and additive** (diagnostics only).

### H2 · App enters `stage: "error"` — harness cannot detect it, waits full 240 s · CONFIDENCE: HIGH

- **Evidence for**: `structural_checks.json` for both failed B runs
  reports `action_bar_buttons_present — Copy report=false; Start
  over=true`. `Start over` in `stage: "error"` panel matches this
  pattern.
- **Evidence against**: none.
- **Confidence**: **HIGH**.
- **Suggested next action**: **AgentOps-5d-cosmetic** or a new
  narrow harness change — add a `page.waitForSelector` race between
  `Copy report` and an error-state marker (e.g. `text="↻ Retry"`).
  On error-state detection, the harness would fail fast instead of
  waiting 240 s.
- **Costs $0? yes** for the code change.
- **Mutates code? yes but small and additive**.

### H3 · Fixture B prompt triggers a longer / different model output that trips an upstream gateway limit · CONFIDENCE: MEDIUM

- **Evidence for**: Fixture A works fine on the same day (~66-76 s
  · same target archetype family). Fixture B specifically fails.
  Fixture B baseline had 10 445 chars vs Fixture A baseline 9 837
  chars — B is only ~6% longer, but if the upstream limit is
  sensitive at the edge, that could matter.
- **Evidence against**: Baseline B on 2026-07-19 completed in 67 s
  with 10 445 chars, so length alone can't explain the 502.
- **Confidence**: **MEDIUM**.
- **Suggested next action**: In diagnostics loop (H1's next action),
  also log the response headers from the 502 to identify the
  upstream (Anthropic vs Vercel vs local dev server).

### H4 · Anthropic API side degradation for specific model / account / route · CONFIDENCE: MEDIUM

- **Evidence for**: Baseline B was on 2026-07-19; failures are on
  2026-07-23. Four days is enough for an upstream deployment or a
  rate-limiter change.
- **Evidence against**: Fixture A on 2026-07-23 works fine on the
  same API + model + account. If it were an account-wide issue,
  A would also fail.
- **Confidence**: **MEDIUM**.
- **Suggested next action**: If H1 diagnostics confirm Anthropic,
  check Anthropic status page and API dashboard for our account
  around the failing timestamps.

### H5 · Local Next.js dev-server compilation error triggered by Fixture B target only · CONFIDENCE: LOW-MEDIUM

- **Evidence for**: 502 could come from a local Vercel edge / Next
  dev-server route that fails only on a specific archetype
  classification.
- **Evidence against**: A works on the same dev server session. The
  502 is a browser-side "Failed to load resource" — not a top-level
  page error. And the client catches API errors as JSON, not as
  resource-load failures.
- **Confidence**: **LOW-MEDIUM**.
- **Suggested next action**: In diagnostics loop, log which URL
  returned 502 (Playwright `page.on("response")` gives full URL +
  status).

### H6 · 240 s hard threshold too tight for legitimate slow generation · CONFIDENCE: LOW

- **Evidence for**: 240 s is a hard cutoff and Fixture B is at the
  larger end.
- **Evidence against**: Baseline B was 67 s, so 240 s should be
  ~3.5× safety margin. Also the 502 error suggests a real failure
  mid-flight, not slow generation.
- **Confidence**: **LOW**.
- **Suggested next action**: Do **not** raise the threshold in this
  loop. Only revisit after H1 diagnostics identify a real slow-but-
  successful case.

### H7 · Quote-integrity integration side-effect · CONFIDENCE: NEAR ZERO

- **Evidence for**: none. QI wrapper runs strictly downstream of
  the wait-for-done + scratchpad-save block.
- **Evidence against**: Wrapper cannot execute before generation
  fails. Even if wrapper had a bug, it would only affect metadata
  writes, not the wait-for-done latency.
- **Confidence**: **NEAR ZERO**.
- **Suggested next action**: none. Ruled out.

### H8 · Capture selector issue · CONFIDENCE: LOW

- **Evidence for**: Playwright's `has-text("Copy report")` is a
  substring match, so the emoji prefix `📋 Copy report` should
  still match.
- **Evidence against**: A runs work fine — selector is not the
  issue.
- **Confidence**: **LOW**.
- **Suggested next action**: none.

### H9 · Baseline metadata / run comparison artifact mismatch · CONFIDENCE: LOW

- **Evidence for**: The baseline metadata is well-formed. The
  fields compared are consistent.
- **Evidence against**: none.
- **Confidence**: **LOW**.
- **Suggested next action**: none.

## 15 · What can be concluded now

- **Nothing in the repo** (harness, checker, `src/**`, fixtures,
  config) changed between the 2026-07-19 success and the 2026-07-23
  failures in a way that could plausibly cause a 502 mid-generation.
- **The QI wrapper is ruled out** as a cause of B timeout.
- **The 502 is real**, deterministic, and Fixture-B-specific on
  2026-07-23. It happens during the client's `/api/generate-report`
  stream read.
- **The harness's 240 s wait is a symptom, not a cause** — the app
  actually entered `stage: "error"` well before the 240 s cutoff.
- **The immediate root cause is a 502 Bad Gateway** returned during
  Fixture B generation on 2026-07-23. Whether that 502 is from
  Anthropic, the Next.js dev-server, or a Vercel edge cannot be
  determined from the console error text alone.

## 16 · What cannot be concluded without a diagnostics rerun

- Which upstream host returned 502 (URL + response headers not
  captured in current console_errors).
- Whether the 502 is retryable (some transient network / rate
  event) or persistent (deployment-side).
- Whether the failure is truly Fixture-B-specific input-driven, or
  whether Fixture A would also fail if run at the same exact
  moment.
- Whether an `Anthropic-Trace-Id` (or similar) is present in the
  response headers for follow-up.

## 17 · Recommended next loop

**AgentOps-5d-b-timeout-diagnostics**.

### Scope (single recommended next loop)

- Add **minimal, additive diagnostics** to the harness:
  - `page.on("requestfailed", …)` — log failed request URL + failure
    reason.
  - `page.on("response", …)` — log any non-2xx response URL + status +
    optional `x-request-id` / `x-anthropic-request-id` header.
  - Race the wait-for-done selector against a
    `text="↻ Retry"` or similar `stage: "error"` marker so the
    harness fails fast (few seconds after the app enters error
    state) instead of waiting 240 s.
  - Persist the captured request/response log to the run
    directory as `network_diagnostics.json` (small · < 5 KB
    expected).
- **One controlled Fixture B rerun** with the diagnostic harness.
- **Cost ~$0.05** (Fixture A control run not needed if H1 is
  confirmed by the diagnostic capture).
- **No baseline mutation**.
- **No baseline promotion**.
- **No prompt / model selection change.**
- **No threshold mutation** in this loop. Threshold decisions are
  a separate later loop.
- **No `.agent/scripts/**` change** (hard rule).
- **No `src/**` change**.
- **Keep quote integrity telemetry-only.**
- **No C/D/E · no A-E · no PDFs · no OpenAI · no LLM judge · no
  edit-distance.**

### What the diagnostics loop should NOT do

- Raise the 240 s hard threshold before understanding what the 502
  is.
- Silently retry on 502 (masks the real signal).
- Change the app's stream-completion contract.
- Mutate A/B baselines.
- Promote QI to blocking.

### Possible later loops (after diagnostics resolve H1)

- **AgentOps-5d-cosmetic**: keep the fail-fast selector-race but
  also fix `--help` safety and `verdict.md ## Artifacts` honesty.
- **Anthropic-side follow-up**: if 502 is confirmed from Anthropic,
  check status page + retry policy in the API route (with backoff
  and idempotency) or add a lightweight server-side retry with
  clear error surfacing.
- **AgentOps-5f-promote**: only after B is stable.

## 18 · Boundaries respected

- No push · no deploy · no manual `vercel deploy`.
- **No generation happened.** **No harness run happened.** **No
  Playwright happened.**
- **No LLM / API call happened.**
- **No threshold mutation happened.**
- **No code change happened.** `scripts/report-regression-local.mjs`
  and `scripts/quote-integrity-check.mjs` unchanged this loop.
- No `src/**` change.
- No `.agent/scripts/**` change (hard rule).
- No `.agent/regression_baselines/**` /
  `.agent/regression_fixtures/**` / prior
  `.agent/regression_runs/**` / prior `.agent/quote_integrity_runs/**`
  changes.
- No pipeline change (`b019786` unchanged).
- No `package.json` / lockfile / `.github/workflows/**` / `.env*` /
  `vercel.json` / Codex-Claude config changes.
- No uploaded PDFs · no `report.md` · no `*.png` committed.
- **No `--help` invocation.** **No third Fixture B attempt.**
- **Quote integrity remained telemetry-only** (unchanged from
  5c-integrate).
- BLK-0001 / BLK-0002 / BLK-0003 remain `open`.
- QUEUE-0002 G2.1d remains `blocked_pending_human`.
- Codex planner remains spec-only.
- `.agent/planner_reports/` remains empty.
- **Cost: $0.**
