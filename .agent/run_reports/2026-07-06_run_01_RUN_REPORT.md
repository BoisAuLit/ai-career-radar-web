# RUN REPORT · P2.0b visible corpus snapshot-date disclosure

> Authored by Claude Code after executing the TASK. Forms the input for the
> next DECISION file.

## Metadata

- **run_id**: `2026-07-06_run_01`
- **task**: `.agent/tasks/2026-07-06_run_01_TASK.md`
- **based_on_design_memo**: `.agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md`
- **based_on_prior_decision**: `.agent/decisions/2026-07-05_run_04_DECISION.md`
- **repo**: `/Users/bohaoli/Desktop/ai-career-radar-web`
- **pipeline_repo** (read-only sanity):
  `/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`
- **implementation_commit**: `c2ca323`
- **status**: complete, awaiting DECISION
- **push_state**: NOT pushed; 4 web commits ahead of
  `origin/main` after this RUN_REPORT commit (P2.0a
  loop was already pushed on 2026-07-06; P2.0b
  loop's 2 commits are the new local delta).

## Objective (from TASK)

Add a small, honest, user-visible **corpus
snapshot-date disclosure** to the served web
product so visitors know the served corpus is a
**May 14, 2026 snapshot**, not a live feed. The
disclosure ships via the existing `WEB_BUNDLE_STATS`
helper (new display fields) and surfaces on 1
high-trust homepage location. No production data
change, no bundle swap, no pipeline touch.

## Bundle metadata verified (read-only)

Command:
```
python3 -c "import json; d = json.load(open('/Users/bohaoli/Desktop/ai-career-radar-web/src/data/web_bundle.json')); print('generated_at:', d.get('generated_at')); print('n_records:', d.get('n_records'))"
```

Output:
```
generated_at: 2026-05-14T02:17:04.783793+00:00
n_records: 443
```

- `generated_at` = **`2026-05-14T02:17:04.783793+00:00`**
  matches TASK acceptance criterion 1. After the
  post-review correction below, the helper's
  `corpusGeneratedAt` mirrors this **exact** string
  (fractional-second precision preserved) so any
  diagnostic tooling comparing helper ↔ bundle
  sees byte-identical values.
- `n_records` = **443** matches
  `WEB_BUNDLE_STATS.totalJds`.
- Bundle was NOT modified. Read via `json.load` on a
  local file with no external network.

## Files changed

| file | change |
|---|---|
| `.agent/tasks/2026-07-06_run_01_TASK.md` | **new** — TASK spec (327 lines) |
| `src/lib/web-bundle-stats.ts` | +13 / -0 — two new display fields (`corpusGeneratedAt`, `corpusSnapshotDate`) |
| `src/app/page.tsx` | +2 / -0 — one attribution-strip chip: `Corpus snapshot: May 14, 2026` |

Total implementation delta on runtime code: **15
lines added** across **2 files**.

## Display fields added to `src/lib/web-bundle-stats.ts`

New fields on `WEB_BUNDLE_STATS` (both `const` +
display-only, no runtime `Date` parse, no bundle
import at runtime):

```ts
/**
 * Bundle `generated_at` as-is from `web_bundle.json`. Kept
 * as a display string so UI can render without pulling the
 * JSON at runtime and without a `new Date()` parse. Refresh
 * when the served bundle is regenerated.
 */
corpusGeneratedAt: "2026-05-14T02:17:04.783793+00:00",
/**
 * Human-readable label derived by hand from `corpusGeneratedAt`
 * above. Used for the visible "Corpus snapshot: …" disclosure
 * in product UI. Refresh alongside `corpusGeneratedAt`.
 */
corpusSnapshotDate: "May 14, 2026",
```

- No new metric beyond the existing 4 counts +
  these 2 date-display fields.
- `corpusSnapshotDate` is the value rendered in
  product UI.
- `corpusGeneratedAt` is kept alongside as an ISO
  string for future consumers (e.g. `<time
  dateTime={…}>` or diagnostic tooling), but is
  NOT currently rendered.
- Helper's docstring reminds a future editor that
  the human-readable date must be refreshed
  **alongside** the ISO string when the served
  bundle is regenerated.
- No `web_bundle.json` import into any runtime
  component. Bundle continues to load only via
  `src/lib/corpus.ts` server-side (unchanged).

## UI surface updated

Exactly **one** surface — the homepage attribution
strip.

- File: `src/app/page.tsx`
- Location: attribution strip at line 822-833
  (block that mirrors the live report's footer band
  with `Grounded in · applied_ai JDs · evidence
  quotes · Five-section report`).

### Exact rendered copy added

Verbatim JSX excerpt (added chip at end of chip
sequence, before the `See full sample →` link):

```jsx
<span aria-hidden>·</span>
<span>Corpus snapshot: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{WEB_BUNDLE_STATS.corpusSnapshotDate}</span></span>
```

Rendered text:
`Corpus snapshot: May 14, 2026`

The chip uses the same `·`-separator idiom, same
font weight for the value (`font-semibold`) as
`applied_ai JDs` and `evidence quotes` next to it,
and lives inside the same subtle attribution-strip
container (small `text-[11px]`, `text-zinc-500`,
`bg-zinc-50/60`, border-top). No new color, no new
badge shape, no alarmist styling.

### Wording audit

- Uses `"Corpus snapshot"` — recommended wording.
- Uses `"May 14, 2026"` — recommended date format.
- No `"live"` on the new chip.
- No `"real-time"` on the new chip.
- No `"fresh"` on the new chip.
- No `"daily updated"` on the new chip.
- No `"current market"` on the new chip.
- No `"Last updated"` on the new chip.
- No mention of the pipeline bundle being
  production-serving.
- No mention of `"8 sources"` on the new chip.
- No explanation of the P2.0b-g promotion path in
  product UI.

## Intentionally NOT touched

- **`src/app/methodology/page.tsx`** — inspected;
  already contains sufficient freshness framing:
  - Line 6: `The live home page still serves the
    manually-curated May 2026 corpus (443 JDs)`
  - Line 122: `The live home page currently serves
    the May 2026 manually-curated snapshot`
  - Line 375-376: `The live home page continues to
    serve the older manually-curated May 2026
    bundle`
  Nothing on methodology contradicts the new
  `"Corpus snapshot: May 14, 2026"` chip — both
  land on the same May 2026 framing. No edit
  needed.
- **`src/app/sample-report/page.tsx`** — inspected;
  already uses `443 tracked JDs` + `Based on 47
  applied_ai JDs` copy from the earlier P1.8a
  audit. No date-copy contradiction introduced by
  the new homepage chip. No edit needed.
- **Elsewhere on `src/app/page.tsx`** —
  homepage-only. Other chips (line 685 `Daily
  automated corpus`, line 1633 `Daily automated
  corpus` in footer) refer to the *automation
  program*, not the served bundle; not misleading
  in the presence of the new snapshot chip. Not
  edited (out-of-scope for this task).
- **`src/data/**`** — no change (bundle files
  frozen).
- **`src/lib/prompts.ts`** — frozen.
- **`src/lib/models-display.ts`** — frozen.
- **`src/lib/corpus.ts`** — frozen (runtime bundle
  interpretation unchanged).
- **`src/app/api/**`** — frozen (runtime model
  selection unchanged).
- **Pipeline repo** — read-only inspection only
  (`git status` + `git log --oneline -5`). HEAD =
  `b019786` at both run start and end.

## Validation

### Build

```
$ npm run build
✓ Compiled successfully in 1856ms
Running TypeScript ... Finished TypeScript in 1844ms
Generating static pages using 15 workers (14/14) in 407ms
Route (app)
┌ ○ /            (static)
├ ○ /_not-found
├ ƒ /api/classify · /api/companies · /api/eval-report · /api/extract-pdf · /api/generate-report
├ ○ /lab · /methodology · /opengraph-image · /sample-report · /snapshot-pipeline
```

`npm run build` **PASSES**. All 14 static pages
generate. No TS errors. Homepage `/` static-renders
successfully with the new chip in the attribution
strip.

### Lint

```
$ npm run lint
✖ 37 problems (37 errors, 0 warnings)
```

`npm run lint` **baseline errors unchanged**:
- Multiple `react/no-unescaped-entities` (single
  quotes / double quotes in prose) in
  `src/app/methodology/page.tsx` and
  `src/app/snapshot-pipeline/page.tsx` —
  pre-existing across P1.7c / P1.8a / P1.8b prior
  loops.
- One `react-hooks/set-state-in-effect` at
  `src/app/page.tsx:473` — pre-existing
  `setRef(clean)` inside a `useEffect` from earlier
  localStorage-migration code. This line was
  **already reported at 473 in the P1.8b loop**;
  our two-line insert at line 827-828 does not
  shift its line number because the insert is
  after line 826, but the pre-existing
  set-state-in-effect is upstream at 473.

**Total count: 37 errors, same class of errors as
prior P1.x loops, no new errors introduced by our
edits.** The new `Corpus snapshot: <span>{…}</span>`
chip renders plain colon + literal + JSX
interpolation — no unescaped entity introduced.

### Diff audit

```
$ git diff --stat  (at implementation time, pre-commit)
 src/app/page.tsx            |  2 ++
 src/lib/web-bundle-stats.ts | 13 +++++++++++++
 2 files changed, 15 insertions(+)

$ git diff --name-only  (at implementation time, pre-commit)
src/app/page.tsx
src/lib/web-bundle-stats.ts
```

## Forbidden-file audit

Each bucket verified against `git diff --name-only
origin/main..HEAD` for the P2.0b commit scope
(`c2ca323`).

| bucket | status |
|---|---|
| `.agent/scripts/**` (**AgentOps-2c Q3-Q8 hard rule**) | ✓ CLEAN |
| `.agent/policies/**` | ✓ CLEAN |
| `.agent/templates/**` | ✓ CLEAN |
| `.agent/blockers.md` | ✓ CLEAN |
| `.agent/automation_queue.md` | ✓ CLEAN |
| `src/data/**` (including `web_bundle.json`, `web_bundle_pipeline.json`, `web_bundle_staging.json`) | ✓ CLEAN |
| `src/lib/prompts.ts` | ✓ CLEAN |
| `src/lib/models-display.ts` | ✓ CLEAN |
| `src/lib/corpus.ts` | ✓ CLEAN |
| `src/app/api/**` | ✓ CLEAN |
| `src/app/snapshot-pipeline/**` | ✓ CLEAN |
| `.github/workflows/**` | ✓ CLEAN |
| `package.json` / `package-lock.json` | ✓ CLEAN |
| `.env*` | ✓ CLEAN |
| `vercel.json` / `.vercel/**` | ✓ CLEAN |
| Codex CLI / Claude Code config | ✓ CLEAN |
| **Pipeline repo (any file)** | ✓ CLEAN (HEAD = `b019786` at run start AND end) |
| **`sources.yaml`** | ✓ CLEAN (pipeline) |
| **`corpus/**`** | ✓ CLEAN (pipeline) |
| **`scripts/collector/**`** | ✓ CLEAN (pipeline) |
| Pipeline `.github/workflows/**` | ✓ CLEAN |

- **No collector invocation** (`python -m
  scripts.collector …` was NOT run).
- **No LLM call** by this task (no
  `anthropic` / `openai` SDK).
- **No new dependency** added.
- **No manual `vercel deploy`** run.
- **No push** performed (both P2.0b commits remain
  local).
- **No blocker resolved.** BLK-0001 / BLK-0002 /
  BLK-0003 all still `open`.
- **No `sources.yaml` edit**.
- **No corpus refresh**.
- **No bundle swap** (`web_bundle.json` byte-
  identical).
- **No runtime model selection change**
  (`src/app/api/**` frozen).
- **No prompt change** (`src/lib/prompts.ts`
  frozen).
- **No OpenAI API introduced** (BLK-0003 Q7-scoped
  boundary honored).

## Acceptance criteria — all 26 items PASS

- [x] Read `src/data/web_bundle.json` **read-only**
      and confirm `generated_at =
      2026-05-14T02:17:04.783793+00:00`. ✓
- [x] `src/lib/web-bundle-stats.ts` gains **two
      display-only fields**
      (`corpusGeneratedAt` + `corpusSnapshotDate`). ✓
- [x] Helper's docstring notes the human-readable
      date was derived by hand from the ISO string
      (no runtime `Date` parsing, no bundle import
      at runtime). ✓
- [x] Do NOT import `src/data/web_bundle.json` into
      any runtime component. ✓
- [x] Do NOT modify `src/data/web_bundle.json`. ✓
- [x] Add the disclosure to **the homepage
      attribution strip**. ✓ line 827-828
- [x] Rendered copy uses **conservative wording**
      (`"Corpus snapshot: May 14, 2026"`). ✓
- [x] Methodology page not modified — RUN_REPORT
      states why (already sufficient May 2026
      framing at lines 6, 122, 375-376). ✓
- [x] Sample-report page not modified — RUN_REPORT
      states why (no contradiction with new chip). ✓
- [x] Disclosure visually small (attribution-strip
      chip; no new component). ✓
- [x] No new metric beyond helper values. ✓
- [x] No claim pipeline bundle is production-
      serving. ✓
- [x] No mention of `"8 sources"` on this task's
      changed surfaces. ✓
- [x] No explanation of full promotion path in
      product UI. ✓
- [x] No substantial layout change. ✓
- [x] `npm run build` passes. ✓
- [x] `npm run lint` — baseline unchanged (37
      errors, all pre-existing classes). ✓
- [x] No forbidden files modified. ✓
- [x] No pipeline repo modification (pipeline HEAD =
      `b019786` at run start AND end). ✓
- [x] No collector run. ✓
- [x] No corpus refresh. ✓
- [x] No `src/data/**` diff. ✓
- [x] No `.agent/scripts/**` diff. ✓
- [x] No push. ✓
- [x] No manual deploy. ✓
- [x] Both P2.0b commits are `.agent/` + display-
      only helper + 2-line homepage chip. ✓

## Blockers touched: none

- **BLK-0001** (G2.1d red-zone) — still `open`. Not
  touched.
- **BLK-0002** (full automation activation) — still
  `open`. Not touched.
- **BLK-0003** (OpenAI API standing Q7-scoped) —
  still `open`. Not touched.
- QUEUE-0002 (G2.1d) — still
  `blocked_pending_human`. Not touched.

## Automation window activity

`none`. Automation-infra remains paused per
AgentOps-2c Q10. No runner started. No
MANUAL_DRY_RUN attempted. No queue transition.

## Repo status

### Web

```
$ git log --oneline -6
c2ca323 Add corpus snapshot date disclosure         ← this loop (impl)
370b825 Update daily summary for P2.0a
c54690a Add DECISION 2026-07-05_run_04
e5ca0c1 Add RUN_REPORT 2026-07-05_run_04
9932a18 Add data freshness promotion design memo
e6c72ba Update daily summary for P1.8b               ← origin/main was here 2026-07-06
```

Web is ahead of `origin/main` by **1 commit** at
implementation-commit time. After committing this
RUN_REPORT the branch will be ahead by **2
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

Pipeline is **untouched**. HEAD = `b019786` at run
start AND end.

## Recommendation

**Human + ChatGPT review** this RUN_REPORT + the
homepage change → then write DECISION via
`python .agent/scripts/new_decision.py --task-id
2026-07-06_run_01`.

Suggested DECISION verdict shape: `approve`,
`human_approval_needed: yes` (for the eventual
push, which will produce a user-visible change
this time — the homepage attribution strip gains
one new chip). Standard yellow-loop cadence.

## Post-review correction (2026-07-07)

ChatGPT review of this RUN_REPORT found that the
initial `corpusGeneratedAt` helper value had been
truncated at the seconds place
(`"2026-05-14T02:17:04+00:00"`) even though the
field's docstring describes it as an ISO string
suitable for diagnostic tooling. Because
diagnostic tooling may compare the helper value
byte-for-byte against
`web_bundle.json.generated_at`, that truncation
would produce spurious diffs.

Fixed via a small follow-up commit that only
touched:

- `src/lib/web-bundle-stats.ts` — `corpusGeneratedAt`
  changed from
  `"2026-05-14T02:17:04+00:00"` to
  **`"2026-05-14T02:17:04.783793+00:00"`** —
  now byte-identical to
  `src/data/web_bundle.json.generated_at`.
- `.agent/run_reports/2026-07-06_run_01_RUN_REPORT.md`
  — this file, updated to reflect the corrected
  value.

Explicitly NOT changed:

- `corpusSnapshotDate` — still
  `"May 14, 2026"` (user-visible chip is
  unchanged).
- `src/app/page.tsx` — no edit; the rendered
  homepage chip still reads exactly
  `Corpus snapshot: May 14, 2026`.
- `src/data/web_bundle.json` — untouched.
- Any other file.
- No pipeline modification.
- No collector run.
- No corpus refresh.
- No push. No deploy.

Validation after the fix:

- `npm run build` re-run — PASS (see fix commit's
  validation log).
- `npm run lint` — baseline unchanged (37
  pre-existing errors, no new class introduced by
  a one-character-in-a-string change).
- Screenshot NOT re-run because the rendered UI
  did not change (chip text depends on
  `corpusSnapshotDate`, which was not modified).
