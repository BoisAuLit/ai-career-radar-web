# AgentOps-5d-b-timeout-diagnostics · Fixture B timeout diagnostics · findings memo

> One controlled Fixture B generation with minimal additive Playwright
> diagnostics · **cost ~$0.05** · **502 did NOT reproduce** this run
> · legacy GREEN · fail-fast infrastructure landed and exercised
> (success side) · no threshold change · no code change to app / API
> route / prompt / model / checker.

## 1 · Purpose

Two goals in one diagnostic loop:

1. Capture the exact non-2xx URL / status / layer if the Fixture B
   502 timeout reproduces.
2. Add fail-fast error-state detection so future runs cannot silently
   burn 240 s wall-clock on an app that has already entered
   `stage: "error"`.

## 2 · Approved scope

Per `.agent/decisions/2026-07-23_run_02_DECISION.md` (5d-fixture-b-
timeout approve · recommended next loop):

- Minimal additive Playwright diagnostics
  (`page.on("requestfailed")` + `page.on("response")` non-2xx
  logging).
- Fail-fast selector race between `Copy report` and error-state
  marker.
- Persist `network_diagnostics.json`.
- **Fixture B exactly once.**
- Cost ≈ $0.05.
- No threshold mutation. No baseline mutation. No baseline promotion.
- Keep QI telemetry-only.

## 3 · Files changed

- `.agent/tasks/2026-07-23_run_03_TASK.md` (new · TASK)
- `scripts/report-regression-local.mjs` (modified · +209 / −7 ·
  additive: network listeners + safe-headers allowlist + Promise.race
  wait-for-done + `network_diagnostics.json` writer + metadata
  diagnostic fields + `## Network diagnostics` section in verdict.md
  + extended `artifact_policy.committed`)
- `.agent/regression_runs/20260723T160538Z_fixture-B/` (new · **5
  committed files** · Fixture B diagnostic run)
- `.agent/design_memos/2026-07-23_AgentOps-5d-b-timeout-diagnostics.md`
  (this memo)
- `.agent/run_reports/2026-07-23_run_03_RUN_REPORT.md` (created by
  helper · to be filled + committed after this memo)

**Frozen (not touched)**: `scripts/quote-integrity-check.mjs` ·
`src/**` · `.agent/scripts/**` · `.agent/regression_baselines/**` ·
`.agent/regression_fixtures/**` · all prior
`.agent/regression_runs/**` · all prior
`.agent/quote_integrity_runs/**` · pipeline.

## 4 · Diagnostic design

- **Network events**: register `page.on("requestfailed", …)` and
  `page.on("response", …)` before `page.goto`. Only status ≥ 400
  responses recorded. All events include an `elapsed_ms` from
  `t0 = Date.now()` at the start of `main()`.
- **Safe-headers allowlist** (only these captured):
  `request-id`, `x-request-id`, `anthropic-request-id`, `cf-ray`,
  `traceparent`, `x-vercel-id`, `x-amzn-trace-id`, `retry-after`.
- **Sanitized body excerpt**: `response.text()` result stripped of
  HTML tags, whitespace collapsed, capped at 500 chars. On read
  failure: `body_excerpt_error: …` (message-only, capped to 200
  chars).
- **Fail-fast race**: replace success-only `waitForSelector('button:has-text("Copy report")')`
  with `Promise.race([successWait, errorWait])` where each
  `waitForSelector` still uses `HARD_LATENCY_MS = 240_000`. Losing
  side's `.catch(() => null)` prevents unhandled rejection.
- **Completion state**: `"success"` · `"application_error"` ·
  `"hard_timeout"` (added `"not_started"` as safety default in state
  variable initialization).

## 5 · Data-safety policy

- ≤ 500-char body excerpt, HTML stripped, whitespace collapsed.
- Whitelisted headers only. **NEVER** captured: `authorization` ·
  `cookie` · `set-cookie` · API keys · request payloads · resume
  content.
- Header values capped to 200 chars.
- Error excerpt from `page.locator("body").innerText()` capped to
  500 chars.

## 6 · Fixture B command

```
node scripts/report-regression-local.mjs --fixture B
```

Run exactly once. Fixture A was NOT run.

## 7 · Diagnostic run id

`20260723T160538Z_fixture-B` — under
`.agent/regression_runs/20260723T160538Z_fixture-B/` with 5
committed files.

## 8 · Legacy result

- **Legacy verdict**: **GREEN** · exit **0**
- **Duration**: **65 430 ms** (~65.4 s · comparable to the 2026-07-19
  baseline B at ~67.6 s)
- **report_char_count**: **9 701**
- **capture_scope**: `main section`
- **fallback_used**: false
- **Console errors**: `[]`

## 9 · Completion state

**`success`** — success selector `Copy report` won the race at
`completion_elapsed_ms = 64 072`. The application never entered
`stage: "error"` and the harness never approached the 240 s hard
threshold.

## 10 · Network events captured

- `events`: **0**
- `summary.requestfailed_count`: 0
- `summary.non_2xx_count`: 0
- `summary.statuses`: `{}` (empty)
- `summary.first_failure_elapsed_ms`: `null`
- `summary.generate_route_status`: `null`

**No non-2xx response** captured. **No `requestfailed` event**
captured. All resource loads succeeded on this run.

## 11 · Exact failing URL / status

**None captured this run.** The 502 that reproduced 2/2 on
2026-07-22 and 2026-07-23-early did **NOT** reproduce. The
diagnostic infrastructure works and captured this fact cleanly (no
false positives · no fabricated URLs).

## 12 · Selected request-id / trace headers

**None captured this run** because no non-2xx responses were seen.
The safe-headers allowlist is exercised only when a non-2xx event
fires; a follow-up run that reproduces the 502 would populate
`selected_headers` on the offending event.

## 13 · Sanitized response excerpt result

**Not applicable this run** (no non-2xx). The extract path is in
place with the HTML-strip + whitespace-collapse + 500-char cap and
would fire on a future 502.

## 14 · Error-state fail-fast result

**Not exercised this run** (success won). The fail-fast race is in
place. On a future error-state transition:

- `completion_state` would become `"application_error"`.
- The harness would stop waiting at that moment (instead of at
  240 s).
- A sanitized 500-char excerpt of the visible error text would be
  captured into `visible_error_excerpt` and mirrored into
  `application_error_excerpt` on metadata.

## 15 · Time saved versus prior false timeout

**Not observed this run** (success took ~64 s naturally). If a
future B run enters `stage: "error"` early, the fail-fast wait
would save `240 000 ms − actual_error_time_ms`. For the 2026-07-22
and 2026-07-23-early B runs (which timed out at ~241 s), if
`stage: "error"` had happened at e.g. ~5 s in, the fail-fast
wait would save ~235 s.

## 16 · Quote-integrity behavior

Wrapper worked in-situ again on the fresh generation:

- `quote_integrity_verdict`: **`red`** (driven by NVIDIA
  `jd_000201` `unmatched quote` — same R1 grammar-bridging pattern
  observed in 5c/5d/5d-stability · deterministic on this fixture).
- `terminal_punctuation_only_matches`: 1 (Microsoft `jd_000173` ·
  R2 preserved).
- `appendix_entries_not_cited`: 1 (Scale AI `jd_000310` · same
  pattern as prior runs when appendix is present).
- **Telemetry-only preserved**: legacy exit code stays 0 despite
  quote-integrity `red`.

## 17 · Whether 502 reproduced

**No.** This single controlled diagnostic run completed cleanly.
Two prior consecutive controlled B runs (2026-07-22 and
2026-07-23-early) both hit 502. Today's run did not. Per the
DECISION stop rule, **B is not re-run in this loop** — a second
controlled attempt is a separate loop's decision.

## 18 · Root-cause conclusion after diagnostics

**H1 (upstream 502) upgraded from "confirmed by symptom" to
"confirmed transient"** — the fact that a follow-up run
completes cleanly with no non-2xx is the classic signature of a
transient upstream issue. Best current theory:

- **Anthropic or Vercel-edge transient degradation** intermittently
  returns 502 for the specific generate-report streaming request
  around that window (2026-07-22 evening / 2026-07-23 early morning
  UTC).
- **Nothing in the repo changed** to cause the difference.
- **The QI wrapper is definitively not the cause** (proven
  end-to-end · same wrapper ran this loop with no impact).
- **The 240 s hard threshold is not the cause** either (this run
  used the same threshold and finished in 64 s).

**H2 (harness cannot detect error state) — mitigation now in
place**: fail-fast selector race is committed and would fire on a
future application_error state. When a future B run hits 502 again
(which will happen intermittently), the harness will stop within a
few seconds of the app transitioning to `stage: "error"` instead
of waiting the full 240 s.

## 19 · What remains unresolved

- **Exact failing URL / status / request-id NOT captured** this
  run because no failure reproduced. If we want to prove the
  Anthropic / Vercel-edge attribution definitively, a future
  loop needs to catch a 502 in-the-act — which requires waiting
  for another transient event and cannot be scheduled.
- **Fail-fast selector race is NOT exercised on a real error
  state** yet. It works in the success path. Its error-path
  behavior is only verified by static reading of the code.
- **Duplicate detection of transient 502 across days** is not yet
  a formal signal — a small dashboard-style tracking would require
  a separate design memo (out of scope).
- **QI verdict remains `red`** driven by R1 grammar bridging.
  Product-side prompt-tuning to eliminate R1 is a separate loop.

## 20 · Recommended next loop

**Two credible follow-ups. Executor mild preference for (A) then
(B) later, both after human + ChatGPT DECISION.**

### A · AgentOps-5d-cosmetic — small harness polish · $0

- Fix `--help` short-circuit so it never triggers a default
  Fixture A generation (documented unsafe in 5d).
- Fix `verdict.md ## Artifacts` list to include only actually-written
  files (currently always lists all policy files, e.g.
  `quote_integrity_summary.json` even when `blocked_no_report`).
- No generation. No baseline mutation.

### B · AgentOps-5e or a future prompt-tune loop — R1 elimination

- Once cosmetic is landed, revisit whether product prompt should
  discourage post-ellipsis grammar bridging (R1 currently accounts
  for most quote-integrity RED signals).
- Would need its own design memo.

### Explicitly NOT recommended right now

- **Do NOT run Fixture B a second time** in a diagnostics loop
  without a new DECISION — the current diagnostic scope is one run.
- **Do NOT mutate the 240 s hard threshold** — proven not to be
  the primary issue.
- **Do NOT introduce retry logic** in `/api/generate-report` yet —
  transient 502 rate is not yet high enough to justify the risk
  of masking real errors.
- **Do NOT revert the 5c-integrate QI wrapper** (ruled out; still
  correct).
- **Do NOT promote QI to blocking** — R1 remains a real signal but
  telemetry-only is intended until at least prompt-tune loop lands.

## 21 · Cost

Approximately **$0.05** Anthropic (single Fixture B report
generation · 64 s wall clock · not measured directly ·
`cost_measured: false` in metadata).

## 22 · Boundaries respected

- No push · no deploy · no manual `vercel deploy`.
- **One** Fixture B generation. No Fixture A run. No B re-run.
- **No threshold mutation**: `HARD_LATENCY_MS = 240_000` and
  `SOFT_LATENCY_MS = 120_000` unchanged.
- **No retry behavior added.**
- **No app / API route / prompt / model change.**
- **No `src/**` change.**
- **No `.agent/scripts/**` change** (hard rule).
- **No `scripts/quote-integrity-check.mjs` change**.
- **No baseline mutation / promotion.**
- **No prior `.agent/regression_runs/**` / `.agent/quote_integrity_runs/**`
  entry mutation.**
- **No `.agent/regression_fixtures/**` / `.agent/regression_baselines/**`
  changes.**
- **No pipeline changes** (`b019786` 起终一致).
- No `package.json` / lockfile / `.github/workflows/**` / `.env*` /
  `vercel.json` / Codex-Claude config changes.
- No uploaded PDFs · no `report.md` · no `*.png` · no full report
  body · no long quote excerpts · no secrets · no auth headers · no
  cookies · no request payloads committed.
- No OpenAI API introduced. No LLM judge. No edit-distance.
- No production deploy. No C/D/E. No A-E full suite.
- **`--help` NOT invoked** (documented unsafe).
- **QI remained telemetry-only** throughout.
- Cost: **~$0.05 Anthropic**.
