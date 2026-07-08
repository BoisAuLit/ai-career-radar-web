# DECISION · Candidate 1 stream-complete sentinel + incomplete banner

> Authored by ChatGPT (human-mediated) after
> reading the RUN_REPORT and both runtime
> diffs (`route.ts` + `page.tsx`). Scaffolded
> by `python .agent/scripts/new_decision.py
> --task-id 2026-07-07_run_03` (**eighteenth
> full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-07_run_03_DECISION`
- **based_on_run_report**:
  `.agent/run_reports/2026-07-07_run_03_RUN_REPORT.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-07_run_02_DECISION.md`
  (P2.1a) — endorses Candidate 1 as the
  next code loop and pins the
  implementation nuance guardrail
  (2-file scope · server-emitted sentinel
  · no prompt drift · no model change).

## Verdict

`approve`

## Reasoning summary

Candidate 1 successfully addresses the
**highest-severity P2.1a reliability risk**:
silent stream truncation can make
incomplete generated reports look
complete. The implementation stays narrow
and appropriate. The server appends an
application-level sentinel only after
normal model stream completion, without
asking the model to emit it and without
changing prompts, model selection, corpus
retrieval, eval logic, or data. The
client detects the sentinel across
accumulated chunks, strips it before
rendering, and shows a conservative
incomplete-report banner if the stream
closes without the sentinel. The **happy
path remains visually unchanged**. Build
validation passed, screenshot validation
passed, the `web-bundle-stats` drift
check passed 6/6, and lint remains a
pre-existing baseline issue. The task
stayed within its intended **two-file
runtime reliability scope** plus
AgentOps files.

Independent verification against the
local tree (both commits: `0b4ae60` +
`f6dabd0`):

- **Scope** (`git diff --name-only
  origin/main..HEAD`) = exactly the 4
  approved paths:
  `.agent/tasks/2026-07-07_run_03_TASK.md`,
  `src/app/api/generate-report/route.ts`,
  `src/app/page.tsx`,
  `.agent/run_reports/2026-07-07_run_03_RUN_REPORT.md`.
- **Sentinel string** verified byte-
  identical in both files:
  `"\n\n<!-- AI_CAREER_RADAR_STREAM_COMPLETE -->"`
- **Server behavior verified**
  (`src/app/api/generate-report/route.ts`):
  - `STREAM_COMPLETE_SENTINEL` constant
    added near `MODEL` with doc comment
    pointing to the client twin.
  - `result.toTextStreamResponse()`
    replaced with a manual
    `ReadableStream<Uint8Array>` that
    passes through model chunks
    unchanged, appends the sentinel
    exactly once after `for await`
    completes normally, then closes.
  - Any thrown error inside the `for
    await` propagates via
    `controller.error(err)` — **sentinel
    NOT emitted**; the client's
    existing catch flips to
    `stage === "error"` and renders the
    categorized error panel.
  - Response `Content-Type` stays
    `text/plain; charset=utf-8` — the
    client's existing raw-text reader
    keeps working (no SSE, no JSON).
  - Prompt / MODEL / archetype
    validation / corpus retrieval /
    classification are all untouched.
- **Client behavior verified**
  (`src/app/page.tsx`):
  - `STREAM_COMPLETE_SENTINEL` constant
    added near `REF_STORAGE_KEY` with
    cross-reference comment to server
    twin.
  - New state `reportIncomplete` /
    `setReportIncomplete`.
  - Reset points confirmed at
    `handleSubmit` start,
    `handleStartOver`, `loadSample`.
  - Reader loop checks
    `accumulated.indexOf(SENTINEL)`
    after each chunk decode — checking
    the **accumulated** string, not
    the single `value` chunk, so a
    sentinel split across chunk
    boundaries is still detected.
  - When sentinel found: `sentinelSeen
    = true` and
    `setReport(accumulated.slice(0,
    sentinelIdx))` — the rendered
    markdown never contains the
    sentinel.
  - When not found:
    `setReport(accumulated)` pass-
    through unchanged.
  - After loop:
    `setReportIncomplete(!sentinelSeen)`
    then `setStage("done")`.
  - Banner rendered **inside the report
    card, above** `<ReactMarkdown>`,
    only when `stage === "done" &&
    reportIncomplete`.
  - `handleCopy` and `handleDownload`
    operate on the `report` state
    (sentinel already stripped) — banner
    text is **never** included in
    clipboard or `.md` download.
- **Error-path behavior verified**:
  - Model / SDK error mid-stream →
    server `controller.error(err)` →
    client catch → error panel;
    **banner does NOT render**.
  - Client `fetch(...)` fails / bad
    status → existing
    `!gRes.ok || !gRes.body` guard →
    error panel; banner does NOT
    render.
  - Client network drop → `reader.read()`
    rejects → error panel; banner does
    NOT render.
  - Server closes stream without
    sentinel (**primary case**) →
    `reader.read()` returns `{ done:
    true }` with `sentinelSeen ===
    false` → `reportIncomplete = true`
    → banner renders.
- **Forbidden empty diffs**:
  `src/lib/prompts.ts` ✓ (**hard**;
  no prompt drift),
  `src/lib/corpus.ts` ✓,
  `src/lib/eval-report.ts` ✓,
  `src/lib/extract-pdf.ts` ✓,
  `src/lib/models-display.ts` ✓,
  `src/lib/web-bundle-stats.ts` ✓,
  `src/data/**` ✓,
  `src/app/api/classify/**` ✓,
  `src/app/api/eval-report/**` ✓,
  `src/app/api/extract-pdf/**` ✓,
  `src/app/api/companies/**` ✓,
  `src/app/methodology/**` ✓,
  `src/app/sample-report/**` ✓,
  `src/app/snapshot-pipeline/**` ✓,
  `src/app/lab/**` ✓,
  `src/app/opengraph-image/**` ✓,
  `src/components/**` ✓,
  `.agent/scripts/**` ✓ (**hard rule**),
  `.agent/policies/**` ✓,
  `.agent/templates/**` ✓,
  `.agent/blockers.md` ✓,
  `.agent/automation_queue.md` ✓,
  `.github/workflows/**` ✓,
  `package.json` ✓,
  `package-lock.json` ✓,
  `.env*` ✓,
  `vercel.json` / `.vercel/**` ✓.
- **Pipeline repo** untouched — HEAD =
  `b019786` at start AND end. `git
  status` clean throughout.
- **No collector invocation**.
- **No LLM call** by this task.
- **No new npm dependency**;
  `package-lock.json` unchanged.
- **No runner / daemon / cron / scheduler
  / GH Actions / Codex config / Claude
  config / OpenAI SDK / manual deploy**
  anywhere.
- **Model selection unchanged**: `MODEL
  = "claude-sonnet-4-6"` in `route.ts`
  identical to pre-Candidate-1 state.
- **Queue + blockers**:
  `automation_queue.md` and
  `blockers.md` not touched. QUEUE-0002
  still `blocked_pending_human` red.
  BLK-0001 / BLK-0002 / BLK-0003 all
  still `open`.
- **Validation confirmed**: `npm run
  build` PASS (14 static pages) · `npm
  run lint` 37 baseline errors, **none
  new** · `npm run check:web-bundle-stats`
  PASS 6/6 · `npm run screenshot` 15/15
  ok (banner conditional; default
  homepage screenshot correctly does
  not show the banner because no
  in-flight or completed generation
  exists in the static build).

The work meets every Acceptance criterion
in the TASK (33 items, all verifiable per
RUN_REPORT and live diff review).
Approving on technical execution. Push
to `origin/main` remains a separate
human-approval gate per policy §3. This
push produces a **user-visible change
only in the rare incomplete-stream case**
— the amber banner appears on the
homepage report card when the generation
stream truncates. In the common happy
path the sentinel is stripped before
render, the banner remains hidden, and
users see the same report they saw
before.

## Important limitation (recorded for future work)

**The sentinel detects application/
transport-level stream completion, not
semantic report completeness.** If the
model completes normally but writes a
weak or short report — e.g., only 2 gaps
instead of 5, missing the "highest-
leverage next action" section, or
producing generic advice — the sentinel
will still be emitted, the banner will
NOT appear, and the client will treat
the report as complete. That is
**acceptable for this task**. Semantic
completeness is the domain of future
report-quality or eval tasks (e.g.,
Candidate 2 quote-integrity, Candidate 3
rubric, or an inline-eval variant).

## Key implementation facts (independently verified)

- **Sentinel string**:
  `"\n\n<!-- AI_CAREER_RADAR_STREAM_COMPLETE -->"`
- **Server emit location**: after
  `for await (const chunk of
  result.textStream)` completes
  normally, before `controller.close()`
  (`src/app/api/generate-report/route.ts`).
- **Server error path**:
  `controller.error(err)` — sentinel
  NOT emitted, client error panel
  handles.
- **Client detect logic**:
  `accumulated.indexOf(STREAM_COMPLETE_SENTINEL)`
  after each `decoder.decode(value,
  { stream: true })`.
- **Client strip logic**:
  `setReport(accumulated.slice(0,
  sentinelIdx))` when sentinel found.
- **Client state additions**: single
  boolean `reportIncomplete` reset at
  `handleSubmit` start, `handleStartOver`,
  `loadSample`.
- **Banner placement**: inside report
  card, above `<ReactMarkdown>`, so
  action bar (`📋 Copy` / `⬇️ Download`
  / `📊 Eval` / `↺ Start over`) is
  untouched.
- **Copy/download hygiene**:
  `navigator.clipboard.writeText(report)`
  and `Blob([report], …)` operate on
  the `report` state variable
  (sentinel already stripped), not the
  DOM — banner text is never included.
- **Prompt untouched**: sentinel is
  server-emitted AFTER model output;
  model is never asked to emit it;
  `src/lib/prompts.ts` byte-identical.
- **Model / provider untouched**:
  `claude-sonnet-4-6` unchanged; no
  `temperature` / `max_tokens` /
  `stopSequences` added.

## Risks found

1. **This is a user-visible generation
   UX change in rare incomplete-stream
   cases.** Severity: **low** — the
   change is small, conservative, and
   appears only when the stream actually
   truncates. Mitigation: standard push
   gate + Vercel auto-deploy.
2. **The sentinel detects transport /
   application stream completion, not
   semantic report completeness.**
   Severity: **acceptable by design** —
   this task's scope is transport-level
   truncation only. Documented in
   §"Important limitation" above.
3. **If the model completes normally
   but produces a weak or short report,
   the sentinel will still be emitted.**
   Severity: **acceptable by design**
   — semantic quality is Candidate 2 /
   Candidate 3 / future report-quality
   work.
4. **Sentinel constants are duplicated
   in `route.ts` and `page.tsx`**, so
   future edits must keep them
   synchronized. Severity: **low**.
   Mitigation: both constants carry
   cross-reference doc comments; a
   future refactor could extract to a
   shared client-safe file if the
   constant grows or diverges.
5. **The route now uses a manual
   `ReadableStream` wrapper instead of
   `result.toTextStreamResponse()`**, so
   future AI SDK changes (e.g., new
   default headers, streaming protocol
   updates) may require review of this
   file. Severity: **low-medium**
   because the wrapper is small (~15
   lines).
6. **If a future refactor changes
   streaming content type or protocol**
   (e.g., migrating to SSE, or adopting
   the AI SDK's `useChat`), the sentinel
   logic must be retested. Severity:
   **low** (documented obligation).
7. **The incomplete banner copy may
   need UX tuning after real usage** —
   phrasing like "may be incomplete"
   is intentionally conservative but
   may read as too alarming or too
   quiet depending on user reactions.
   Severity: **low**. Mitigation:
   copy tweak is a small future yellow
   loop, same pattern as P1.7c / P1.8a
   / P1.8b.
8. **No automated truncation test was
   added in this task.** Severity:
   **low-medium** — the behavior is
   testable (mock a `ReadableStream`
   that closes early), but adding a
   test infrastructure was out of
   scope. Mitigation: Candidate 1
   follow-up TASK could add a small
   test suite.
9. **The task does not address
   quote-integrity checking**
   (Candidate 2 from P2.1a §9).
10. **The task does not address
    sample-report vs real-report
    presentation mismatch** (Candidate
    5 from P2.1a §9).
11. **The task does not address
    empty-PDF extraction risk**
    (Candidate 4 from P2.1a §9).
12. **The task does not make eval
    inline** — eval remains user-
    invoked via the `📊 Eval this
    report` button.
13. **G2.1d remains blocked by
    BLK-0001**. Severity: **n/a by
    design**.
14. **Full automation remains blocked
    by BLK-0002**. Severity: **n/a by
    design**.
15. **OpenAI API remains blocked by
    BLK-0003 (Q7-scoped, standing)**.
    This task introduced no OpenAI API
    usage. Severity: **n/a by design**.

## Red-zone flags

`none` for Candidate 1.

No `src/lib/prompts.ts`, no
`src/lib/anthropic.ts` (not present), no
`src/data/web_bundle.json`, no
`src/lib/corpus.ts`, no other
`src/app/api/**` route (runtime model
selection unchanged), no
`package.json`, no `package-lock.json`,
no `.env*`, no `vercel.json`, no
`.vercel/**`, no `.github/workflows/**`
changed. No pipeline-repo file changed
at all. No Codex CLI config, Claude Code
config, or OpenAI SDK introduced. No
`.agent/scripts/**` edited (hard rule
per Q3-Q8 of AgentOps-2c DECISION). No
executable runner / shell script /
config / cron / hook file created
anywhere. No collector invocation. No
LLM call. No new npm dependency. No
manual deploy.

## Required fixes

`none`

Scope is clean (4 paths, all approved),
the sentinel is server-emitted only
after normal model completion,
`controller.error(err)` correctly
propagates upstream failures without
emitting the sentinel, the client
handles split-across-chunks by
checking `accumulated` (not `value`),
the banner is conservative and lives
inside the report card so it does not
pollute copy/download, all reset paths
clear `reportIncomplete`, and no
forbidden / red-zone / pipeline /
runner / OpenAI / config / executable
/ `.agent/scripts` / prompts /
runtime-selection / data path was
touched. All 33 TASK acceptance
criteria are demonstrably met per
RUN_REPORT.

## Non-blocking follow-ups

- **After DECISION approval and push**
  → update daily summary. Extend
  `.agent/daily_summaries/2026-07-07_SUMMARY.md`
  with a Candidate-1 section
  documenting the 2 commits, the
  sentinel string, the client
  behavior, the exact banner copy,
  and confirmation that the happy
  path is user-visibly unchanged.
- **Consider a future small test or
  manual simulation for
  missing-sentinel behavior** —
  e.g., a route that intentionally
  closes without the sentinel, or a
  minimal unit test around the
  reader loop's strip logic. Not
  needed to ship Candidate 1.
- **Consider Candidate 2 later**:
  quote-integrity substring check on
  the eval path (P2.1a §9 candidate
  2). Separate future TASK +
  DECISION loop.
- **Consider Candidate 4 later**:
  empty-PDF gate on the client
  (P2.1a §9 candidate 4). Separate
  future TASK + DECISION loop.
- **Do NOT start Candidate 2 or
  Candidate 4 in this DECISION
  turn.**
- **Do NOT modify prompts** without a
  separate task.
- **Do NOT modify model selection.**
- **Do NOT run collector.**
- **Do NOT refresh corpus.**
- **Do NOT swap `web_bundle.json`.**
  P2.0a memo §7 gate 2
  (`unique_companies ≥ 35`) still
  arithmetically blocks today's
  pipeline bundle.
- **Do NOT modify pipeline files.**
- **Do NOT modify `src/data/**`.**
- **Do NOT start G2.1d.** BLK-0001
  still `open`.
- **Do NOT resume automation-infra.**
  Per AgentOps-2c Q10.
- **Do NOT introduce OpenAI API** in
  any Q7 blocked sense.
- **Do NOT deploy manually.** Vercel
  auto-deploy from the eventual push
  is the only sanctioned path.
- **Do NOT modify `.agent/scripts/**`**
  (hard rule).

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay
   on `main` of the pipeline repo.
2. Do NOT push either repo. The web
   repo will be ahead of origin/main
   by 3 commits at that point
   (`0b4ae60` impl + `f6dabd0`
   RUN_REPORT + this DECISION); push
   requires Bohao's explicit
   "push Candidate 1" (or similar)
   instruction. This push will
   trigger Vercel auto-deploy; the
   user-visible change appears ONLY
   in the rare incomplete-stream
   case (amber banner on the report
   card). Happy path is invisible.
3. Do NOT deploy manually. Vercel
   auto-deploy from the eventual
   push handles this.
4. Do NOT start Candidate 2
   (quote-integrity substring check
   on eval path) yet. It is a
   separate future TASK + DECISION
   loop.
5. Do NOT start Candidate 4
   (empty-PDF gate) yet. Same.
6. Do NOT start any other P2.1
   candidate in parallel.
7. Do NOT edit prompts (`src/lib/prompts.ts`
   stays frozen).
8. Do NOT edit model selection
   (`src/app/api/**` model choices
   stay frozen).
9. Do NOT run collector. No
   `python -m scripts.collector …`,
   no `dry-run`, no `clean-preview`,
   no `run`.
10. Do NOT refresh corpus.
    `web_bundle.json` /
    `web_bundle_pipeline.json` /
    `web_bundle_staging.json` all
    stay frozen.
11. Do NOT modify pipeline files.
    `sources.yaml`, `corpus/**`,
    `scripts/collector/**`,
    `.github/workflows/**` all stay
    frozen.
12. Do NOT modify `src/data/**`.
13. Do NOT modify `.agent/scripts/**`.
    Hard rule per AgentOps-2c
    Q3-Q8.
14. Do NOT start G2.1d. BLK-0001
    still `open`.
15. Do NOT resume automation-infra.
    Q10 pause continues.
16. Do NOT introduce OpenAI API in
    any Q7 blocked sense.
17. Do NOT modify runtime model
    selection (`src/app/api/**`
    model choices frozen).
18. Do NOT modify prompts
    (`src/lib/prompts.ts` frozen).
19. Do NOT add any new npm
    dependency or `package.json`
    entry (aside from routine dev
    scripts, which would need a
    separate TASK anyway).
20. Do NOT lift any of the 3 open
    blockers (BLK-0001 / BLK-0002 /
    BLK-0003) without explicit
    written human resolution.

The next likely promote step is:
- `git push origin main` from the web
  repo (3 commits land on
  `origin/main`: `0b4ae60` + `f6dabd0`
  + this DECISION). Vercel auto-deploys
  and produces a user-visible change
  ONLY in the rare truncation case.
- Then extend
  `.agent/daily_summaries/2026-07-07_SUMMARY.md`
  with a Candidate-1 section; commit
  + push.
- Then, per this DECISION's follow-up,
  the natural options are (a) let
  Candidate 1 soak in real usage
  before deciding on Candidate 2 or
  4, or (b) start another small
  product task of Bohao's choosing.

Wait for Bohao's explicit
"push Candidate 1" before doing
anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of
  `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which will deliver 3 commits —
  `0b4ae60` (impl), `f6dabd0`
  (RUN_REPORT), and this DECISION
  commit once it lands). This push
  triggers Vercel auto-deploy and
  produces a **user-visible change in
  the rare truncation case** (amber
  banner on the report card). Happy
  path is user-visibly unchanged.
- Authoring the daily summary
  cleanup commit
  (extend
  `.agent/daily_summaries/2026-07-07_SUMMARY.md`
  with a Candidate-1 section).
- Starting Candidate 2 (quote-
  integrity substring check on
  eval path).
- Starting Candidate 4 (empty-PDF
  gate on client).
- Starting any other P2.1 candidate
  in parallel.
- Any pipeline file edit.
- Any `src/data/**` edit.
- Any collector run.
- Any corpus refresh.
- Any `.agent/scripts/**` mod.
- Any AgentOps-2* work (per Q10
  pause).
- Any runtime model-selection change.
- Any prompt change.
- Any new npm dependency or
  `package-lock.json` change.
- Any G2.1d (red) work.
- Any OpenAI API usage in Q7 blocked
  sense.
- Any manual `vercel deploy`.
- Lifting any of the 3 open blockers
  (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical
> execution captured in the RUN_REPORT
> and the two runtime diffs. Standing
> policy treats any `main` push as a
> human gate. This push produces a
> user-visible change only in the rare
> incomplete-stream case; happy path
> is byte-identical for users.
>
> Approving this DECISION:
>
> - Records the Candidate 1 impl as
>   technically correct (sentinel is
>   server-emitted after normal
>   completion, client handles split-
>   chunks, banner is conservative
>   and lives inside the report card,
>   error-path preserved, copy/download
>   hygiene preserved).
> - Endorses the "transport-level
>   truncation only" scope and the
>   explicit deferral of semantic
>   completeness checking to future
>   report-quality or eval tasks.
> - Records the sentinel-constant-
>   duplication guardrail
>   (`route.ts` + `page.tsx` must stay
>   synchronized) for future refactors.
>
> Approving does NOT approve:
> (a) starting Candidate 2 (quote-
> integrity check), Candidate 4
> (empty-PDF gate), or any other
> P2.1 candidate — each is its own
> TASK + DECISION, (b) any pipeline
> file edit, (c) any bundle swap,
> (d) any collector run, (e) any
> AgentOps-2* work, (f) any
> `.agent/scripts/**` mod, (g) any
> runtime model-selection change or
> prompt change, (h) any new npm
> dependency or lockfile change,
> (i) any OpenAI API usage in Q7
> blocked sense, (j) G2.1d,
> (k) lifting any of the 3 open
> blockers. Each of those remains
> its own explicit human decision.
> The next step is Bohao's explicit
> call on the push.
