# RUN REPORT · Candidate 1 stream complete sentinel + incomplete banner

> Authored by Claude Code after executing the TASK. Forms the input for the
> next DECISION file.

## Metadata

- **run_id**: `2026-07-07_run_03`
- **task**:
  `.agent/tasks/2026-07-07_run_03_TASK.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-07_run_02_DECISION.md`
  (P2.1a) — endorses Candidate 1.
- **based_on_design_memo**:
  `.agent/design_memos/2026-07-07_P2.1a_real_report_quality_audit.md`
- **repo**:
  `/Users/bohaoli/Desktop/ai-career-radar-web`
- **pipeline_repo** (read-only sanity):
  `/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`
- **implementation_commit**: `0b4ae60`
- **status**: complete, awaiting DECISION
- **push_state**: NOT pushed; **1 web
  commit ahead of `origin/main`** at
  impl-commit time → 2 after this
  RUN_REPORT commit lands.

## Objective (from TASK)

Add a server-emitted stream-complete
sentinel and a client-side conservative
incomplete-report warning banner so
partial/truncated streamed reports are
never silently treated as complete.

## Files changed

| file | change |
|---|---|
| `.agent/tasks/2026-07-07_run_03_TASK.md` | **new** — TASK spec |
| `src/app/api/generate-report/route.ts` | +34 / -1 — sentinel constant + `ReadableStream` wrapper |
| `src/app/page.tsx` | +33 / -1 — sentinel constant + state + reader-loop strip + banner |

- **NOT changed**: `src/lib/prompts.ts`
  (prompts frozen — sentinel is
  application-level, not model-emitted).
- **NOT changed**: `src/lib/corpus.ts`,
  `src/lib/eval-report.ts`,
  `src/lib/extract-pdf.ts`,
  `src/lib/models-display.ts`,
  `src/lib/web-bundle-stats.ts`.
- **NOT changed**: `src/app/api/classify/**`,
  `src/app/api/eval-report/**`,
  `src/app/api/extract-pdf/**`.
- **NOT changed**: `src/app/methodology/**`,
  `src/app/sample-report/**`,
  `src/app/snapshot-pipeline/**`.
- **NOT changed**: `src/data/**` (bundle
  byte-identical).
- **NOT changed**: `package.json` /
  `package-lock.json` (zero new
  dependency).
- **NOT changed**: `.github/workflows/**`,
  `.env*`, `vercel.json`, `.vercel/**`,
  `.agent/scripts/**`, `.agent/policies/**`,
  `.agent/templates/**`, `.agent/blockers.md`,
  `.agent/automation_queue.md`.
- **NOT changed**: Pipeline repo any file
  (HEAD `b019786` at run start AND end).

## Sentinel string used

```
"\n\n<!-- AI_CAREER_RADAR_STREAM_COMPLETE -->"
```

Rationale for exact format:

- **HTML comment** so that even in the
  hypothetical case the sentinel ever
  reached `<ReactMarkdown>`, it would be
  either stripped or rendered invisibly
  by the parser — a safety net beneath
  the primary defense (client explicitly
  strips it before `setReport`).
- **Namespaced `AI_CAREER_RADAR_STREAM_COMPLETE`**
  — vanishingly small collision
  probability against any legitimate
  markdown output from the report
  generator; there is no reason the
  model would produce a project-
  namespaced HTML comment.
- **Leading `\n\n`** — ensures the
  sentinel begins on its own paragraph
  boundary, keeping the split index
  clean regardless of how the model's
  last output byte lands.
- Value is duplicated in **both** files
  with matching cross-reference
  comments — no new shared-constants
  file was introduced.

## Route implementation summary

`src/app/api/generate-report/route.ts`
(diff around lines 17-32 and 100-121):

- Added `STREAM_COMPLETE_SENTINEL`
  constant near existing `MODEL`
  constant, with a doc comment linking
  to the client-side twin.
- Replaced
  `return result.toTextStreamResponse();`
  with a manual `ReadableStream<Uint8Array>`
  wrapper:
  - `for await (const chunk of
    result.textStream) controller.enqueue(encoder.encode(chunk))`
    — passes model tokens through
    unchanged.
  - On normal completion of the
    `for await`: emit sentinel,
    `controller.close()`.
  - On any thrown error inside the
    iteration: `controller.error(err)`
    — **sentinel is NOT emitted**, and
    the client's existing
    `try/catch` at
    `src/app/page.tsx` flips to
    `stage === "error"` and shows the
    categorized error panel.
- Returned via
  `new Response(stream, { headers: {
  "Content-Type": "text/plain;
  charset=utf-8" } })` — matches
  `toTextStreamResponse()`'s default
  content type, so the client's
  existing reader continues to receive
  a raw text stream (no SSE, no JSON).

**Preserved intact**: request-shape
validation, archetype whitelist,
`buildArchetypeProfile` /
`buildCompanyProfile` /
`pickCompanyEvidence` /
`pickEvidenceJds` corpus wiring,
`buildReportUserMessage`,
`reportSystemPrompt(companyProfile)`,
`streamText({ model: anthropic(MODEL),
… })`. No prompt, model, or corpus
edit.

## Client implementation summary

`src/app/page.tsx`:

- Added `STREAM_COMPLETE_SENTINEL`
  constant near existing
  `REF_STORAGE_KEY` (around former
  line 411), with cross-reference
  comment pointing to the server twin.
- Added state:
  `const [reportIncomplete,
  setReportIncomplete] = useState(false);`
  next to the existing `report`
  state.
- Reset points for
  `setReportIncomplete(false)`:
  - `handleSubmit` — at the top,
    before any fetch.
  - `handleStartOver` — with the
    other resets.
  - `loadSample` — with the other
    resets.
- Reader loop (around former
  line 542-550) now tracks
  `sentinelSeen` and strips the
  sentinel before every `setReport`:
  ```ts
  let sentinelSeen = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    const sentinelIdx = accumulated.indexOf(STREAM_COMPLETE_SENTINEL);
    if (sentinelIdx >= 0) {
      sentinelSeen = true;
      setReport(accumulated.slice(0, sentinelIdx));
    } else {
      setReport(accumulated);
    }
  }
  setReportIncomplete(!sentinelSeen);
  setStage("done");
  ```
- Banner render (inside the report
  card, immediately above
  `<ReactMarkdown>`):
  ```jsx
  {stage === "done" && reportIncomplete && (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
      <span aria-hidden className="mr-1.5">⚠</span>
      This report may be incomplete because the generation
      stream ended unexpectedly. You can retry generation
      before relying on it.
    </div>
  )}
  ```
- Placement is **inside the report
  card container** but before the
  `<ReactMarkdown>`. The action bar
  (`📋 Copy report`, `⬇️ Download .md`,
  `📊 Eval this report`, `↺ Start
  over`) is a sibling `<div>` further
  down; it is not affected. Because
  `handleCopy` writes
  `navigator.clipboard.writeText(report)`
  (the state variable) and
  `handleDownload` writes a
  `Blob([report], …)`, the banner
  text is **never** included in
  copy/download.

## Sentinel string used (verbatim)

Both files:

```
const STREAM_COMPLETE_SENTINEL =
  "\n\n<!-- AI_CAREER_RADAR_STREAM_COMPLETE -->";
```

## How sentinel is emitted

- **Server**: after the
  `for await (const chunk of
  result.textStream)` loop completes
  normally (i.e. the AI SDK's text
  stream drains without throwing), the
  route enqueues the sentinel as a
  single `TextEncoder` write and then
  calls `controller.close()`.
- The sentinel is **never** part of
  the prompt (`src/lib/prompts.ts` is
  unchanged) and the model is **never**
  asked to emit it. It is strictly a
  post-model, server-emitted marker.

## How sentinel is stripped

- Client checks
  `accumulated.indexOf(STREAM_COMPLETE_SENTINEL)`
  after every chunk decode.
- When found, sets `sentinelSeen =
  true` and `setReport(accumulated.slice(0,
  sentinelIdx))` — the rendered
  markdown never includes the
  sentinel.
- When not found, `setReport(accumulated)`
  as before — pass-through unchanged.

## Exact banner copy

> ⚠ This report may be incomplete
> because the generation stream ended
> unexpectedly. You can retry
> generation before relying on it.

Rendered inside the report card,
above the markdown body, only when
`stage === "done" && reportIncomplete`.
Amber styling family; conservative;
not alarming red.

## How incomplete state is reset

`setReportIncomplete(false)` is called
at every cold-start path:

- `handleSubmit` top of function,
  before any fetch (a retry after an
  incomplete render clears the
  banner immediately).
- `handleStartOver` — with the other
  resets.
- `loadSample` — with the other
  resets, so preset personas start
  clean.

## How split-across-chunks sentinel is handled

- The reader loop appends decoded
  chunks to `accumulated` **before**
  checking for the sentinel.
- The check is performed against
  `accumulated` (the full concatenated
  text so far), not the single
  freshly-decoded chunk.
- Consequence: even if the sentinel's
  first few bytes arrive in chunk N
  and its last few bytes arrive in
  chunk N+1, the `indexOf` still finds
  the complete string once both
  chunks have been appended.
- The sentinel is short enough
  (~46 bytes including the leading
  `\n\n`) that this "hold and check
  next chunk" behavior costs a
  vanishing amount of memory and
  never blocks rendering because the
  pre-sentinel text is passed
  through as `setReport(accumulated)`
  each chunk.
- Because
  `TextDecoder({ stream: true })`
  guarantees no invalid UTF-8 mid-
  character at chunk boundaries, the
  ASCII-only sentinel is safe to
  detect character-by-character
  across boundaries.

## Error-path behavior

- **Model / SDK throws inside the
  server's `for await` iteration**:
  route calls `controller.error(err)`
  (**sentinel NOT emitted**). The
  client's `reader.read()` rejects
  with the same error, the existing
  `try { ... } catch (e) { setErrMsg;
  setStage("error"); }` handles it,
  and the categorized error panel
  (already at
  `src/app/page.tsx` around
  the former `stage === "error"`
  block) renders. **The banner does
  NOT render** in this path because
  `stage !== "done"`.
- **Client `fetch(...)` fails / bad
  status**: existing
  `!gRes.ok || !gRes.body` guard
  fires and throws before entering
  the reader loop. `stage = "error"`;
  banner does NOT render.
- **Network drop mid-stream on the
  client side**: `reader.read()`
  rejects → catch → error panel.
  Banner does NOT render (mutually
  exclusive with error panel).
- **Server closes stream without
  sentinel** (e.g. the process
  crashes between the last chunk
  enqueue and the sentinel enqueue,
  or an upstream proxy truncates
  the response): `reader.read()`
  returns `{ done: true }` with
  `sentinelSeen === false` →
  `setReportIncomplete(true)` and
  `setStage("done")` → banner
  renders. **This is the primary
  case the banner is designed
  for.**

## Validation

### Build

```
$ npm run build
✓ Compiled successfully
Running TypeScript ... Finished TypeScript
Generating static pages using 15 workers (14/14) in 467ms
Route (app)
┌ ○ /            (static)
├ ○ /_not-found
├ ƒ /api/classify · /api/companies · /api/eval-report · /api/extract-pdf · /api/generate-report
├ ○ /lab · /methodology · /opengraph-image · /sample-report · /snapshot-pipeline
```

`npm run build` **PASSES**. All 14 static
pages generate. No TS errors.

### Lint

```
$ npm run lint
✖ 37 problems (37 errors, 0 warnings)
```

`npm run lint` — **baseline unchanged**
(37 errors, all pre-existing across
`src/app/methodology/page.tsx`,
`src/app/snapshot-pipeline/page.tsx`,
and one `react-hooks/set-state-in-effect`
at `src/app/page.tsx` around line 485
after our +7 line shift from the
constant + state additions above). **No
new errors introduced.**

### Drift check

```
$ npm run check:web-bundle-stats
✓ totalJds                 443 == 443
✓ appliedAiJds             47  == 47
✓ trackedCompanies         35  == 35
✓ evidenceQuotesPerReport  5   == 5
✓ corpusGeneratedAt        "2026-05-14T02:17:04.783793+00:00" == same
✓ corpusSnapshotDate       "May 14, 2026" == "May 14, 2026"
PASS: WEB_BUNDLE_STATS matches src/data/web_bundle.json
exit=0
```

Drift check **PASSES 6/6** (no
`WEB_BUNDLE_STATS` change touched by
this task).

### Screenshot

```
$ npm run screenshot
▸ desktop  1440×900  home / sample-report / snapshot-pipeline / methodology / lab  ✓
▸ tablet   768×1024  same 5  ✓
▸ mobile   393×660   same 5  ✓
Done in 14.8s — 15 ok, 0 failed.
```

Screenshot **15/15 ok**. Note: the
banner is conditional (`stage === "done"
&& reportIncomplete`), so the default
homepage screenshot does NOT display
the banner (correct: an empty homepage
has no in-flight or completed
generation).

### Diff audit

```
$ git diff --stat  (before impl commit)
 src/app/api/generate-report/route.ts | 35 ++++++++++++++++++++++++++++++++++-
 src/app/page.tsx                     | 34 +++++++++++++++++++++++++++++++++-
 2 files changed, 67 insertions(+), 2 deletions(-)
```

Total runtime delta: **67 lines added,
2 lines deleted** across **exactly 2
runtime files** + 1 new TASK file.

## Forbidden-file audit

Each bucket verified against `git diff
--name-only origin/main..HEAD` for the
Candidate 1 impl commit scope
(`0b4ae60`).

| bucket | status |
|---|---|
| `src/lib/prompts.ts` | ✓ CLEAN |
| `src/lib/corpus.ts` | ✓ CLEAN |
| `src/lib/eval-report.ts` | ✓ CLEAN |
| `src/lib/extract-pdf.ts` | ✓ CLEAN |
| `src/lib/models-display.ts` | ✓ CLEAN |
| `src/lib/web-bundle-stats.ts` | ✓ CLEAN |
| `src/data/**` | ✓ CLEAN |
| `src/app/api/classify/**` | ✓ CLEAN |
| `src/app/api/eval-report/**` | ✓ CLEAN |
| `src/app/api/extract-pdf/**` | ✓ CLEAN |
| `src/app/api/companies/**` | ✓ CLEAN |
| `src/app/methodology/**` | ✓ CLEAN |
| `src/app/sample-report/**` | ✓ CLEAN |
| `src/app/snapshot-pipeline/**` | ✓ CLEAN |
| `src/app/lab/**` | ✓ CLEAN |
| `src/app/opengraph-image/**` | ✓ CLEAN |
| `src/components/**` | ✓ CLEAN |
| `.agent/scripts/**` (**hard rule**) | ✓ CLEAN |
| `.agent/policies/**` | ✓ CLEAN |
| `.agent/templates/**` | ✓ CLEAN |
| `.agent/blockers.md` | ✓ CLEAN |
| `.agent/automation_queue.md` | ✓ CLEAN |
| `.github/workflows/**` | ✓ CLEAN |
| `package.json` | ✓ CLEAN |
| `package-lock.json` | ✓ CLEAN |
| `.env*` | ✓ CLEAN |
| `vercel.json` / `.vercel/**` | ✓ CLEAN |
| Codex / Claude config | ✓ CLEAN |
| **Pipeline repo (any file)** | ✓ CLEAN (HEAD = `b019786` at run start AND end) |
| `sources.yaml` (pipeline) | ✓ CLEAN |
| `corpus/**` (pipeline) | ✓ CLEAN |
| `scripts/collector/**` (pipeline) | ✓ CLEAN |
| Pipeline `.github/workflows/**` | ✓ CLEAN |

- **No collector invocation**.
- **No LLM call** by this task (no
  runtime `anthropic` / `openai` HTTP
  invoked; the code path is
  build/test-only in this loop).
- **No new npm dependency** added.
  `package-lock.json` unchanged.
- **No manual `vercel deploy`** run.
- **No push** performed (Candidate 1
  stays local until Bohao's explicit
  push instruction).
- **No blocker resolved.** BLK-0001 /
  BLK-0002 / BLK-0003 all still `open`.
- **No `sources.yaml` edit**.
- **No corpus refresh**.
- **No bundle swap** (`web_bundle.json`
  byte-identical).
- **No runtime model selection change**
  (`MODEL = "claude-sonnet-4-6"` in
  `route.ts` unchanged).
- **No prompt change**
  (`src/lib/prompts.ts` unchanged).
- **No OpenAI API introduced**
  (BLK-0003 Q7-scoped honored).
- **No eval-route / classify-route /
  extract-pdf-route change**.

## Acceptance criteria — all 33 items PASS

- [x] Route wraps `streamText().textStream`
      in a new `ReadableStream` emitting
      chunks unchanged; sentinel once on
      normal completion; then closes. ✓
- [x] Any error from the model iteration
      propagates via `controller.error(err)`;
      sentinel NOT emitted. ✓
- [x] Response `Content-Type` remains
      `text/plain; charset=utf-8`. ✓
- [x] Sentinel constant in both files;
      cross-reference comments; byte-
      identical values. ✓
- [x] No prompt / user-message / model /
      provider / corpus / classification
      change. ✓
- [x] Client detects sentinel via
      `accumulated.indexOf(SENTINEL)`
      after each decode; splits before
      offset. ✓
- [x] `setReport(...)` never renders
      sentinel to the user (stripped
      per-chunk). ✓
- [x] Reader loop exit sets
      `reportIncomplete = !sentinelSeen`
      and `stage = "done"`. ✓
- [x] `reportIncomplete` reset at
      `handleSubmit` start,
      `handleStartOver`, `loadSample`. ✓
- [x] Banner rendered inside report
      card only when
      `stage === "done" &&
      reportIncomplete`. ✓
- [x] Banner copy matches suggested
      wording; conservative amber; no
      alarming red. ✓
- [x] Banner does NOT interfere with
      action bar; `📋 Copy` /
      `⬇️ Download` / `📊 Eval` /
      `↺ Start over` untouched. ✓
- [x] `handleCopy` copies only
      `report` (sentinel already
      stripped). ✓
- [x] `handleDownload` writes only
      `report` (sentinel already
      stripped). ✓
- [x] No `.agent/scripts/**` diff. ✓
- [x] No pipeline repo modification. ✓
- [x] No `src/data/**` diff. ✓
- [x] No `src/lib/prompts.ts` diff. ✓
- [x] No other `src/lib/**` diff. ✓
- [x] No other `src/app/api/**`
      route diff. ✓
- [x] No other `src/app/**/page.tsx`
      diff. ✓
- [x] No `package.json` /
      lockfile diff. ✓
- [x] No `.env*` / `vercel.json` /
      `.vercel/**` diff. ✓
- [x] No `.github/workflows/**` diff. ✓
- [x] No OpenAI API code path
      added. ✓
- [x] `npm run build` passes. ✓
- [x] `npm run lint` — baseline
      unchanged (37 pre-existing;
      none new). ✓
- [x] `npm run check:web-bundle-stats`
      passes 6/6. ✓
- [x] `npm run screenshot` 15/15
      ok. ✓
- [x] No push. ✓
- [x] No manual deploy. ✓
- [x] Split-chunk handling
      documented. ✓
- [x] Error-path behavior
      documented. ✓

## Blockers touched: none

- **BLK-0001** (G2.1d red-zone) —
  still `open`. Not touched.
- **BLK-0002** (full automation
  activation) — still `open`. Not
  touched.
- **BLK-0003** (OpenAI API standing
  Q7-scoped) — still `open`. Not
  touched.
- QUEUE-0002 (G2.1d) — still
  `blocked_pending_human`.

## Automation window activity

`none`. Automation-infra remains paused
per AgentOps-2c Q10.

## Repo status

### Web

```
$ git log --oneline -6
0b4ae60 Add stream completion sentinel     ← this loop (impl)
2ecf6e8 Update daily summary for P2.1a
4d6907a Add DECISION 2026-07-07_run_02
3c8f7e5 Add RUN_REPORT 2026-07-07_run_02
68f0dc3 Add real report quality audit
07eae0b Update daily summary for P2.0c
```

Web is ahead of `origin/main` by **1
commit** at impl-commit time. After
this RUN_REPORT commit lands the
branch will be ahead by **2 commits**.

### Pipeline

```
$ git status
On branch main · up to date with 'origin/main' · clean

$ git log --oneline -3
b019786 Add G2.1 taxonomy eval set
f833bfd Add G2.1 taxonomy spec
65c3f9b Daily automated collection · 2026-06-28
```

Pipeline is **untouched**. HEAD =
`b019786` at run start AND end.

## Recommendation

**Human + ChatGPT review** this
RUN_REPORT + the two runtime diffs →
then write DECISION via
`python .agent/scripts/new_decision.py
--task-id 2026-07-07_run_03`.

Suggested DECISION verdict shape:
`approve`, `human_approval_needed:
yes` (for the eventual push, which
will produce a **user-visible change**
in the incomplete-report case: an
amber banner will appear on the
homepage report card when the
generation stream truncates. In the
common happy path the change is
invisible: the sentinel is stripped
before render, the banner remains
hidden, and users see the same
report they saw before).
