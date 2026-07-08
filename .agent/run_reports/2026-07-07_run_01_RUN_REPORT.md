# RUN REPORT · P2.0c WEB_BUNDLE_STATS drift check

> Authored by Claude Code after executing the TASK. Forms the input for the
> next DECISION file.

## Metadata

- **run_id**: `2026-07-07_run_01`
- **task**: `.agent/tasks/2026-07-07_run_01_TASK.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-06_run_01_DECISION.md`
  (P2.0b DECISION §follow-up recommended P2.0c)
- **based_on_design_memo**:
  `.agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md`
- **repo**:
  `/Users/bohaoli/Desktop/ai-career-radar-web`
- **pipeline_repo** (read-only sanity):
  `/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`
- **implementation_commit**: `78434f0`
- **status**: complete, awaiting DECISION
- **push_state**: NOT pushed; **2 web commits
  ahead of `origin/main`** after this RUN_REPORT
  commit.

## Objective (from TASK)

Add a lightweight validation script that verifies
`src/lib/web-bundle-stats.ts` matches
`src/data/web_bundle.json` and fails clearly if
the manually synced helper drifts. Closes the
"manually synced" risk called out in the P2.0b
DECISION §risks. No codegen yet, no build gate
yet — just an explicit drift check.

## Files changed

| file | change |
|---|---|
| `.agent/tasks/2026-07-07_run_01_TASK.md` | **new** — TASK spec |
| **`scripts/check-web-bundle-stats.mjs`** | **new** — 143-line Node ESM stdlib-only script |
| `package.json` | +1 line under `scripts`: `"check:web-bundle-stats": "node scripts/check-web-bundle-stats.mjs"` |

- **NOT changed**: `src/lib/web-bundle-stats.ts`
  (docstring didn't need a tweak — the helper's
  existing `Source of truth` note is already
  clear enough; a "checked by …" reference would
  add clutter without benefit).
- **NOT changed**: `package-lock.json` (no new
  dependency).
- **NOT changed**: existing npm scripts
  (`dev`, `build`, `start`, `lint`,
  `screenshot`).

Total implementation delta: **2 new files + 2
lines added to `package.json` + 1 comma
adjustment (trailing-comma consistency)**.

## Script behavior summary

- **Read paths** (no writes anywhere):
  - `src/data/web_bundle.json` via
    `fs.readFile` + `JSON.parse`
  - `src/lib/web-bundle-stats.ts` as **text**
    (regex parsing; no `tsc` / `tsx` /
    transpiler dependency)
- **Modifies**: nothing.
- **Computed from bundle**:
  - `totalJds` = `bundle.n_records` (with
    cross-check against `bundle.records.length`;
    prints a diagnostic if they diverge)
  - `appliedAiJds` = count of records where
    `archetype === "applied_ai"`
  - `trackedCompanies` = distinct trimmed
    non-empty `record.company` values
  - `corpusGeneratedAt` = exactly
    `bundle.generated_at`
  - `corpusSnapshotDate` = formatted from
    `generated_at` via
    `Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" })`
- **Policy constant** (not derived from bundle):
  - `evidenceQuotesPerReport` = `5` (declared
    as `POLICY_EVIDENCE_QUOTES_PER_REPORT` at
    the top of the script). Script asserts the
    helper value matches this policy constant.
    Any policy change requires editing both the
    helper AND the script, so silent drift is
    impossible.
- **Compare + emit**: for each of the 6 fields
  it prints a `✓` / `✗` line with the expected
  and actual values, then a bottom-line
  `PASS: …` or `FAIL: N field(s) drifted`.
- **Exit codes**:
  - `0` — all 6 fields match (PASS)
  - `1` — one or more fields drifted (FAIL)
  - `2` — catastrophic error (missing file,
    JSON parse failure, unexpected exception)

## Computed expected values (from
`src/data/web_bundle.json`)

Per the script's actual run:

| field | expected |
|---|---|
| `totalJds` | **443** |
| `appliedAiJds` | **47** |
| `trackedCompanies` | **35** |
| `evidenceQuotesPerReport` | **5** (policy constant) |
| `corpusGeneratedAt` | **`"2026-05-14T02:17:04.783793+00:00"`** |
| `corpusSnapshotDate` | **`"May 14, 2026"`** |

Diagnostic: `bundle.records.length` (**443**) ===
`bundle.n_records` (**443**) — no divergence.

## Actual helper values (from
`src/lib/web-bundle-stats.ts`, parsed via regex)

| field | actual |
|---|---|
| `totalJds` | **443** |
| `appliedAiJds` | **47** |
| `trackedCompanies` | **35** |
| `evidenceQuotesPerReport` | **5** |
| `corpusGeneratedAt` | **`"2026-05-14T02:17:04.783793+00:00"`** |
| `corpusSnapshotDate` | **`"May 14, 2026"`** |

**All 6 fields match. Script exits 0 (PASS).**

## Validation

### Direct invocation

```
$ node scripts/check-web-bundle-stats.mjs
web-bundle-stats drift check
  bundle:  src/data/web_bundle.json
  helper:  src/lib/web-bundle-stats.ts

  ✓ totalJds
      expected: 443
      actual:   443
  ✓ appliedAiJds
      expected: 47
      actual:   47
  ✓ trackedCompanies
      expected: 35
      actual:   35
  ✓ evidenceQuotesPerReport
      expected: 5
      actual:   5
  ✓ corpusGeneratedAt
      expected: "2026-05-14T02:17:04.783793+00:00"
      actual:   "2026-05-14T02:17:04.783793+00:00"
  ✓ corpusSnapshotDate
      expected: "May 14, 2026"
      actual:   "May 14, 2026"

PASS: WEB_BUNDLE_STATS matches src/data/web_bundle.json
exit=0
```

### npm script

```
$ npm run check:web-bundle-stats
… (same output) …
PASS: WEB_BUNDLE_STATS matches src/data/web_bundle.json
exit=0
```

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

`npm run build` **PASSES**. All 14 static pages
generate.

### Lint

```
$ npm run lint
✖ 37 problems (37 errors, 0 warnings)
```

`npm run lint` **baseline errors unchanged** —
same 37 pre-existing errors carried across
P1.7c / P1.8a / P1.8b / P2.0b (all
`react/no-unescaped-entities` across
`src/app/methodology/page.tsx` +
`src/app/snapshot-pipeline/page.tsx` plus one
`react-hooks/set-state-in-effect` at
`src/app/page.tsx:473`). **No new errors
introduced.** The new `scripts/*.mjs` file is
outside the eslint config's targeted paths and
does not add any lint errors.

### Screenshot

**Not run.** No user-visible UI change (no
`src/app/**` diff, no template diff, no
homepage chip modification).

### Diff audit

```
$ git status  (before commit)
Changes not staged for commit:
  modified:   package.json
Untracked files:
  .agent/tasks/2026-07-07_run_01_TASK.md
  scripts/check-web-bundle-stats.mjs

$ git diff --stat  (before commit; only tracked mods shown)
 package.json | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

Total change scope: **exactly 3 files**
(TASK, script, `package.json`).

## Build integration decision

**Deferred.** This TASK explicitly forbade
changing the `build` script and explicitly did
not wire the check into `next build`. Rationale
per P2.0b DECISION §follow-up and this TASK §1:
land the drift check as a standalone tool
first; a future TASK can wire it into `next
build` or CI **only if** drift becomes a
recurring problem or the P2.0-g promotion plan
requires it. Keeping the two decisions separate
lets the drift check ship right away without
tying build-time behavior to a validation that
is currently unproven in day-to-day use.

## Forbidden-file audit

Each bucket verified against `git diff
--name-only origin/main..HEAD` for the P2.0c
implementation commit scope (`78434f0`).

| bucket | status |
|---|---|
| `.agent/scripts/**` (**AgentOps-2c Q3-Q8 hard rule**) | ✓ CLEAN |
| `.agent/policies/**` | ✓ CLEAN |
| `.agent/templates/**` | ✓ CLEAN |
| `.agent/blockers.md` | ✓ CLEAN |
| `.agent/automation_queue.md` | ✓ CLEAN |
| `src/data/**` (`web_bundle.json`, `web_bundle_pipeline.json`, `web_bundle_staging.json`) | ✓ CLEAN |
| `src/lib/prompts.ts` | ✓ CLEAN |
| `src/lib/models-display.ts` | ✓ CLEAN |
| `src/lib/corpus.ts` | ✓ CLEAN |
| `src/lib/web-bundle-stats.ts` | ✓ CLEAN (not modified this task) |
| `src/app/api/**` | ✓ CLEAN |
| `src/app/**/page.tsx` | ✓ CLEAN (no UI change) |
| `.github/workflows/**` | ✓ CLEAN |
| `package-lock.json` | ✓ CLEAN (no new dep) |
| `.env*` | ✓ CLEAN |
| `vercel.json` / `.vercel/**` | ✓ CLEAN |
| Codex CLI / Claude Code config | ✓ CLEAN |
| **Pipeline repo (any file)** | ✓ CLEAN (HEAD = `b019786` at run start AND end) |
| **`sources.yaml`** | ✓ CLEAN (pipeline) |
| **`corpus/**`** | ✓ CLEAN (pipeline) |
| **`scripts/collector/**`** | ✓ CLEAN (pipeline) |
| Pipeline `.github/workflows/**` | ✓ CLEAN |

- **No collector invocation**.
- **No LLM call** by this task.
- **No new dependency**. `package-lock.json`
  unchanged.
- **No manual `vercel deploy`**.
- **No push**.
- **No blocker resolved.** BLK-0001 / BLK-0002 /
  BLK-0003 all still `open`.
- **No `sources.yaml` edit**.
- **No corpus refresh**.
- **No bundle swap** (`web_bundle.json`
  byte-identical).
- **No runtime model selection change**.
- **No prompt change**.
- **No OpenAI API introduced**.
- **`.agent/scripts/**` empty diff** (hard rule
  honored).

## Acceptance criteria — all 24 items PASS

- [x] `scripts/check-web-bundle-stats.mjs` exists,
      Node ESM, stdlib-only. ✓
- [x] Script reads `web_bundle.json` via
      `fs.readFile` + `JSON.parse`. ✓
- [x] Script reads `web-bundle-stats.ts` as
      text; regex extraction; no transpiler. ✓
- [x] Script does NOT import `web_bundle.json`
      into runtime/client code. ✓
- [x] Script modifies no file. ✓ (only reads +
      prints)
- [x] Script computes all 5 bundle-derived
      fields correctly. ✓
- [x] Script treats `evidenceQuotesPerReport`
      as fixed policy constant with documented
      comment. ✓
- [x] Script prints PASS on match. ✓
- [x] Script prints per-field mismatches and
      exits nonzero on drift; exit code 2 on
      catastrophic error. ✓ (verified via code
      review; live run showed PASS path)
- [x] `package.json` `scripts` gains exactly
      one new line; existing scripts unchanged. ✓
- [x] No `package-lock.json` diff. ✓
- [x] `node scripts/check-web-bundle-stats.mjs`
      prints PASS with today's helper values. ✓
- [x] `npm run check:web-bundle-stats` also
      passes. ✓
- [x] `npm run build` still passes. ✓
- [x] `npm run lint` baseline unchanged. ✓ (37
      pre-existing, none new)
- [x] No screenshot required. ✓ (no UI change)
- [x] No pipeline repo modification. ✓ (HEAD =
      `b019786` at start AND end)
- [x] No collector run. ✓
- [x] No corpus refresh. ✓
- [x] No `src/data/**` diff. ✓
- [x] No `.agent/scripts/**` diff. ✓
- [x] No push. ✓
- [x] No manual deploy. ✓
- [x] RUN_REPORT records build integration
      deferred (see §"Build integration
      decision" above). ✓

## Blockers touched: none

- **BLK-0001** (G2.1d red-zone) — still `open`.
  Not touched.
- **BLK-0002** (full automation activation) —
  still `open`. Not touched.
- **BLK-0003** (OpenAI API standing Q7-scoped)
  — still `open`. Not touched.
- QUEUE-0002 (G2.1d) — still
  `blocked_pending_human`.

## Automation window activity

`none`. Automation-infra remains paused per
AgentOps-2c Q10.

## Repo status

### Web

```
$ git log --oneline -6
78434f0 Add web bundle stats drift check          ← this loop (impl)
ef7836b Update daily summary for P2.0b
79759a0 Add DECISION 2026-07-06_run_01
e3fbbab Fix corpus generated_at display metadata
f246b42 Add RUN_REPORT 2026-07-06_run_01
c2ca323 Add corpus snapshot date disclosure
```

Web is ahead of `origin/main` by **1 commit** at
implementation-commit time. After this RUN_REPORT
commit lands the branch will be ahead by **2
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

Pipeline is **untouched**. HEAD = `b019786` at
run start AND end.

## Recommendation

**Human + ChatGPT review** this RUN_REPORT + the
script → then write DECISION via
`python .agent/scripts/new_decision.py --task-id
2026-07-07_run_01`.

Suggested DECISION verdict shape: `approve`,
`human_approval_needed: yes` (for the eventual
push — no user-visible product change, but new
tooling reaches `origin/main`). Standard
yellow-loop cadence.
