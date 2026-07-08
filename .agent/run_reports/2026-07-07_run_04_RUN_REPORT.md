# RUN REPORT · Candidate 4 empty PDF client-side gate

> Authored by Claude Code after executing the TASK. Forms the input for the
> next DECISION file.

## Metadata

- **run_id**: `2026-07-07_run_04`
- **task**:
  `.agent/tasks/2026-07-07_run_04_TASK.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-07_run_02_DECISION.md`
  (P2.1a) — endorses Candidate 4 as
  a green-adjacent client-only fix.
- **based_on_design_memo**:
  `.agent/design_memos/2026-07-07_P2.1a_real_report_quality_audit.md`
- **repo**:
  `/Users/bohaoli/Desktop/ai-career-radar-web`
- **pipeline_repo** (read-only sanity):
  `/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`
- **implementation_commit**: `6bca6b1`
- **status**: complete, awaiting DECISION
- **push_state**: NOT pushed; 1 web
  commit ahead of `origin/main` at
  impl-commit time → 2 after this
  RUN_REPORT commit lands.

## Objective (from TASK)

Prevent empty or near-empty PDF
extraction results from silently
populating the résumé field and
producing low-quality generated
reports. Client-side minimum-
character threshold; no backend
change.

## Files changed

| file | change |
|---|---|
| `.agent/tasks/2026-07-07_run_04_TASK.md` | **new** — TASK spec |
| `src/app/page.tsx` | +42 / -2 — threshold constant, warning constant, new state, `handlePdfUpload` gate, reset points, résumé `<textarea>` `onChange` clear, warning banner |

- **NOT changed**: `src/app/api/extract-pdf/route.ts`
  (server route frozen).
- **NOT changed**: `src/lib/extract-pdf.ts`
  (`unpdf` backend frozen).
- **NOT changed**: `src/lib/prompts.ts`,
  `src/lib/corpus.ts`,
  `src/lib/eval-report.ts`,
  `src/lib/models-display.ts`,
  `src/lib/web-bundle-stats.ts`.
- **NOT changed**:
  `src/app/api/generate-report/**`,
  `src/app/api/classify/**`,
  `src/app/api/eval-report/**`,
  `src/app/api/companies/**`.
- **NOT changed**:
  `src/app/methodology/**`,
  `src/app/sample-report/**`,
  `src/app/snapshot-pipeline/**`,
  `src/components/**`.
- **NOT changed**: `src/data/**`,
  `package.json`,
  `package-lock.json`,
  `.github/workflows/**`,
  `.env*`, `vercel.json`,
  `.vercel/**`.
- **NOT changed**: Pipeline repo any
  file (HEAD `b019786` at run start
  AND end).

Total delta: **42 lines added, 2
lines deleted** in exactly **1
runtime file** + 1 new TASK file.

## Current extraction flow inspected (read-only)

- **Server route**
  (`src/app/api/extract-pdf/route.ts`)
  — accepts `multipart/form-data`,
  5 MB limit, `.pdf` MIME/extension
  check, calls `extractPdfText` from
  `src/lib/extract-pdf.ts`, returns
  200 `{ text, n_chars, filename }`.
  Errors return 400/413/500 with
  `{ error, detail? }`.
- **Extraction lib**
  (`src/lib/extract-pdf.ts:8-15`) —
  `unpdf` with `mergePages: true`,
  returns joined trimmed text.
  **Scanned/image-only PDFs
  produce near-empty text on a 200
  response** — no OCR fallback.
- **Client handler**
  (`src/app/page.tsx:496-512`
  pre-change) — previously did
  `setResume(data.text)` on any 2xx,
  which is the silent-empty-PDF
  trust gap named in P2.1a §7 risk
  #4.

## Threshold chosen and why

**`MIN_EXTRACTED_RESUME_CHARS = 300`**

Justification:

- A typical résumé's plain-text
  extraction from a text-selectable
  PDF is **thousands of characters**
  (several kilobytes of skills,
  bullets, dates, company names).
  300 is comfortably below any
  meaningful résumé length.
- Scanned/image-only PDFs from
  `unpdf` typically yield **<50
  characters** of garbage from
  header metadata / embedded
  fonts. 300 is comfortably above
  that noise floor.
- False-positive risk (a
  legitimately tiny résumé
  passing under 300 chars) is low
  in this product's user base
  (senior engineers moving into
  AI — resumes are seldom
  <300 chars). If a false
  positive is ever reported, a
  future yellow loop can tune the
  value (300 → 200 or introduce
  a UX override).
- Same conservative-first
  cadence as Candidate 1's
  transport-level sentinel:
  ship an intentionally strict
  guard, tune later based on
  real feedback.

## Exact warning copy

Verbatim in code (`EMPTY_PDF_WARNING`
constant, both the state setter and
the banner render use this):

> ⚠ This PDF produced very little
> readable text. It may be scanned
> or image-only. Please paste your
> resume text manually or upload a
> text-selectable PDF before
> generating a report.

## Where the warning appears

Rendered near the résumé input, in
the same layout position as the
existing red `pdfErr` panel — a
sibling `<div>` immediately above
the résumé `<textarea>` (former
`src/app/page.tsx:991-995`, now
followed by the new amber banner
block). Uses amber styling
(`border-amber-200 bg-amber-50
text-amber-900`) with a `⚠` icon
prefix.

- The banner is **distinct from
  the red `pdfErr` panel** — server
  errors (413, 400, 500) still
  show `pdfErr`, while empty/near-
  empty successful (2xx) extractions
  show the new amber warning. The
  two panels do not overlap:
  `handlePdfUpload` clears the
  opposing one whenever it sets
  the other, and normal success
  clears both.

## Behavior — successful (above-threshold) extraction

- `extractedText.length >=
  MIN_EXTRACTED_RESUME_CHARS` →
  `setResume(extractedText)` (uses
  the trimmed value, not raw
  `data.text`, so trailing
  whitespace doesn't drift the
  résumé state).
- `setPdfFilename(data.filename)`
  (small "loaded X.pdf" chip
  appears).
- **Existing red `pdfErr` cleared**
  at the top of `handlePdfUpload`;
  the new amber warning is not
  set (or is cleared as part of
  the success path since it was
  already cleared at the top).
- No difference from prior behavior
  for a legitimate text-selectable
  résumé PDF — this is the happy
  path.

## Behavior — near-empty (below-threshold) extraction

- `extractedText.length <
  MIN_EXTRACTED_RESUME_CHARS` →
  `setPdfExtractionWarning(EMPTY_PDF_WARNING)`.
- **`setResume(...)` is NOT
  called** — the current résumé
  state (empty or a
  previously-pasted résumé)
  remains **exactly as it was
  before the upload attempt**.
  A user who had already pasted
  text keeps that text; a user
  who had an empty field still
  has an empty field.
- **`setPdfFilename(...)` is NOT
  called** — the "loaded X.pdf"
  chip does NOT appear, so the
  UI does not visually claim the
  upload succeeded.
- **`setPdfErr(...)` is NOT
  called** — this is a UX gate,
  not a server error; the amber
  banner is the correct
  affordance.
- `handlePdfUpload` returns
  early; the `finally` block
  still runs (`setPdfUploading(false)`
  turns off the "Extracting…"
  button label).

## Behavior — manual paste

- Résumé `<textarea>` `onChange`
  handler still accepts arbitrary
  user input (any length, any
  content) — nothing about paste
  is gated.
- **New behavior**: if the amber
  warning is currently visible
  AND the newly-typed résumé
  crosses back above
  `MIN_EXTRACTED_RESUME_CHARS`
  when trimmed, the warning is
  cleared automatically. This
  means: a user who tried an
  empty-PDF upload → saw the
  warning → pasted a meaningful
  résumé sees the warning
  disappear once they've typed
  enough to be past the floor.
- Users who type nothing or
  paste something shorter than
  300 chars still see the
  warning — they can dismiss
  it by pasting more text or by
  pressing `↺ Start over`.

## Submit-time behavior

- The Generate button's existing
  disable logic (`isBusy ||
  !resume.trim() || !target.trim()`)
  is unchanged.
- `handleSubmit` starts with the
  same short-circuit:
  `if (!resume.trim() ||
  !target.trim() || isBusy)
  return;`.
- **No new submit-time block** on
  the warning — the warning is
  visual guidance; the user is
  free to submit if they've
  pasted enough text. The gate
  is at the résumé-population
  step, not the generation step,
  which is what makes this
  intervention narrow and
  reversible.
- `handleSubmit` does reset
  `setPdfExtractionWarning("")`
  at its start, so a submitted
  generation always clears the
  warning (a submitted résumé
  is by definition non-empty and
  has passed either the paste
  path or the above-threshold
  upload path).

## Reset points

- **Successful extraction**:
  `setPdfExtractionWarning("")`
  is not needed at the top of
  the success branch because
  `handlePdfUpload` already
  clears it in the pre-fetch
  section (see below), and the
  success branch doesn't touch
  it — so a prior warning stays
  cleared.
- **Pre-fetch**: `handlePdfUpload`
  now sets `setPdfExtractionWarning("")`
  right after `setPdfErr("")` at
  the very top, so any prior
  warning is cleared before the
  new upload attempt starts. If
  the new upload's extraction
  passes, no warning is set;
  if it fails threshold, the
  warning gets set. Either way,
  a stale warning from a prior
  attempt never lingers.
- **`handleStartOver`**: adds
  `setPdfExtractionWarning("")`.
- **`loadSample`**: adds
  `setPdfExtractionWarning("")`
  so preset personas start
  clean.
- **`handleSubmit`**: adds
  `setPdfExtractionWarning("")`.
- **Résumé `<textarea>`
  `onChange`**: clears when
  `next.trim().length >=
  MIN_EXTRACTED_RESUME_CHARS`
  (only if the warning is
  currently non-empty — the
  guard avoids setting state
  every keystroke).

## Server-error path

The red `pdfErr` panel still
fires unchanged on:

- **413 File too large** (>5 MB) —
  route.ts:28-33.
- **400 Bad content-type / no
  file / non-.pdf** —
  route.ts:9-14, 25-27, 34-39.
- **500 PDF parse failed** (the
  `unpdf` call throws) —
  route.ts:49-57.

None of those paths reach the
new gate — they short-circuit
in the `if (!res.ok)` branch.

## Validation

### Build

```
$ npm run build
✓ Compiled successfully
Running TypeScript ... Finished TypeScript
Generating static pages using 15 workers (14/14)
Route (app)
┌ ○ /            (static)
├ ○ /_not-found
├ ƒ /api/classify · /api/companies · /api/eval-report · /api/extract-pdf · /api/generate-report
├ ○ /lab · /methodology · /opengraph-image · /sample-report · /snapshot-pipeline
```

`npm run build` **PASSES**. All 14
static pages generate.

### Lint

```
$ npm run lint
✖ 37 problems (37 errors, 0 warnings)
```

`npm run lint` — **baseline
unchanged**. Same 37 pre-existing
errors (react/no-unescaped-entities
across `src/app/methodology/page.tsx`
+ `src/app/snapshot-pipeline/page.tsx`;
one `react-hooks/set-state-in-effect`
in `src/app/page.tsx`). **No new
errors introduced.**

### Drift check

```
$ npm run check:web-bundle-stats
… (all 6 fields ✓) …
PASS: WEB_BUNDLE_STATS matches src/data/web_bundle.json
exit=0
```

**PASS 6/6** — no drift.

### Screenshot

```
$ npm run screenshot
▸ desktop  1440×900  home / sample-report / snapshot-pipeline / methodology / lab  ✓
▸ tablet   768×1024  same 5  ✓
▸ mobile   393×660   same 5  ✓
Done in 14.9s — 15 ok, 0 failed.
```

`npm run screenshot` **15/15 ok**.
Note: the warning banner is
conditional (`pdfExtractionWarning
&& !== ""`), so the default
homepage screenshot does NOT
display the amber banner. This is
correct — no PDF upload has
occurred in a static build.

### Diff audit

```
$ git diff --stat  (before impl commit)
 src/app/page.tsx | 44 ++++++++++++++++++++++++++++++++++++++++++--
 1 file changed, 42 insertions(+), 2 deletions(-)
```

**Exactly 1 runtime file changed**
(`src/app/page.tsx`), +42 / -2.

## Forbidden-file audit

Each bucket verified against
`git diff --name-only
origin/main..HEAD` for the
Candidate 4 impl commit scope
(`6bca6b1`).

| bucket | status |
|---|---|
| `src/app/api/extract-pdf/**` | ✓ CLEAN |
| `src/lib/extract-pdf.ts` | ✓ CLEAN |
| `src/lib/prompts.ts` | ✓ CLEAN |
| `src/lib/corpus.ts` | ✓ CLEAN |
| `src/lib/eval-report.ts` | ✓ CLEAN |
| `src/lib/models-display.ts` | ✓ CLEAN |
| `src/lib/web-bundle-stats.ts` | ✓ CLEAN |
| `src/app/api/generate-report/**` | ✓ CLEAN |
| `src/app/api/eval-report/**` | ✓ CLEAN |
| `src/app/api/classify/**` | ✓ CLEAN |
| `src/app/api/companies/**` | ✓ CLEAN |
| `src/data/**` | ✓ CLEAN |
| `src/app/methodology/**` | ✓ CLEAN |
| `src/app/sample-report/**` | ✓ CLEAN |
| `src/app/snapshot-pipeline/**` | ✓ CLEAN |
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
| **Pipeline repo (any file)** | ✓ CLEAN (HEAD `b019786` at start AND end) |
| `sources.yaml` (pipeline) | ✓ CLEAN |
| `corpus/**` (pipeline) | ✓ CLEAN |
| `scripts/collector/**` (pipeline) | ✓ CLEAN |
| Pipeline `.github/workflows/**` | ✓ CLEAN |

- **No extract-pdf backend change**
  (route or lib).
- **No prompt change**.
- **No generate-report change**.
- **No model selection change**.
- **No eval-route change**.
- **No collector invocation**.
- **No LLM call** by this task.
- **No new npm dependency**
  (no OCR library).
- **No `package.json` /
  `package-lock.json` diff**.
- **No manual `vercel deploy`**.
- **No push**.
- **No blocker resolved**.
  BLK-0001 / BLK-0002 /
  BLK-0003 all still `open`.
- **No `sources.yaml` edit**.
- **No corpus refresh**.
- **No bundle swap**
  (`web_bundle.json`
  byte-identical).
- **No OpenAI API introduced**
  (BLK-0003 Q7-scoped honored).

## Acceptance criteria — all 35 items PASS

- [x] `MIN_EXTRACTED_RESUME_CHARS =
      300` added near
      `STREAM_COMPLETE_SENTINEL`. ✓
- [x] New state
      `pdfExtractionWarning`. ✓
- [x] `handlePdfUpload` trims
      `data.text` and computes
      length. ✓
- [x] Below-threshold: no
      `setResume`, no
      `setPdfFilename`, no
      `setPdfErr`; only
      `setPdfExtractionWarning`. ✓
- [x] Above-threshold:
      `setResume(extractedText)`,
      `setPdfFilename(data.filename)`. ✓
- [x] `handleStartOver` resets
      warning. ✓
- [x] `loadSample` resets warning. ✓
- [x] `handleSubmit` resets
      warning. ✓
- [x] Résumé `<textarea>`
      `onChange` clears warning
      when trimmed value crosses
      threshold. ✓
- [x] Warning banner rendered
      near `pdfErr` panel with
      amber styling. ✓
- [x] Banner copy matches
      suggested wording. ✓
- [x] `pdfErr` red panel still
      fires on real server errors. ✓
- [x] Existing manual paste flow
      unchanged. ✓
- [x] Existing Generate button
      logic unchanged. ✓
- [x] No new dependency, no OCR. ✓
- [x] No `src/app/api/extract-pdf/**`
      diff. ✓
- [x] No `src/lib/extract-pdf.ts`
      diff. ✓
- [x] No `src/lib/prompts.ts`
      diff. ✓
- [x] No
      `src/app/api/generate-report/**`
      diff. ✓
- [x] No other `src/app/api/**`
      diff. ✓
- [x] No `src/lib/**` diff. ✓
- [x] No `src/data/**` diff. ✓
- [x] No other `src/app/**`
      diff. ✓
- [x] No `src/components/**`
      diff. ✓
- [x] No `.agent/scripts/**`
      diff. ✓
- [x] No pipeline repo
      modification (HEAD
      `b019786` start and end). ✓
- [x] No collector run. ✓
- [x] No corpus refresh. ✓
- [x] No `package.json` /
      lockfile diff. ✓
- [x] No `.env*` /
      `vercel.json` /
      `.vercel/**` diff. ✓
- [x] No `.github/workflows/**`
      diff. ✓
- [x] No OpenAI API code path
      added. ✓
- [x] `npm run build` passes. ✓
- [x] `npm run lint` baseline
      unchanged. ✓
- [x] `npm run check:web-bundle-stats`
      PASS 6/6. ✓
- [x] `npm run screenshot`
      15/15 ok. ✓
- [x] No push, no manual
      deploy. ✓

## Blockers touched: none

- **BLK-0001** (G2.1d red-zone)
  — still `open`. Not touched.
- **BLK-0002** (full automation
  activation) — still `open`.
  Not touched.
- **BLK-0003** (OpenAI API
  standing Q7-scoped) — still
  `open`. Not touched.
- QUEUE-0002 (G2.1d) — still
  `blocked_pending_human`.

## Automation window activity

`none`. Automation-infra remains
paused per AgentOps-2c Q10.

## Repo status

### Web

```
$ git log --oneline -6
6bca6b1 Add empty PDF extraction gate     ← this loop (impl)
9773f83 Update daily summary for Candidate 1
5f5bfe1 Add DECISION 2026-07-07_run_03
f6dabd0 Add RUN_REPORT 2026-07-07_run_03
0b4ae60 Add stream completion sentinel
2ecf6e8 Update daily summary for P2.1a
```

Web ahead of `origin/main` by
**1 commit** at impl-commit time.
After this RUN_REPORT commit lands
the branch will be ahead by **2
commits**.

### Pipeline

```
$ git status
On branch main · up to date with 'origin/main' · clean

$ git log --oneline -3
b019786 Add G2.1 taxonomy eval set
f833bfd Add G2.1 taxonomy spec
65c3f9b Daily automated collection · 2026-06-28
```

Pipeline **untouched**. HEAD =
`b019786` at run start AND end.

## Recommendation

**Human + ChatGPT review** this
RUN_REPORT + the `page.tsx` diff →
then write DECISION via
`python .agent/scripts/new_decision.py
--task-id 2026-07-07_run_04`.

Suggested DECISION verdict shape:
`approve`, `human_approval_needed:
yes` (for the eventual push, which
produces a **user-visible change
only when someone uploads a
scanned/image-only PDF**: an amber
warning banner appears above the
résumé textarea, and the résumé
state is NOT overwritten. In the
common happy path — a text-
selectable PDF or manual paste —
the change is invisible).
