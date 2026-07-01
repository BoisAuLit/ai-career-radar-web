# RUN REPORT · P1.7b sync hero mock numbers with web bundle

> Authored by Claude Code after executing TASK
> `2026-06-30_run_02`. Web-repo only — pipeline repo untouched.
> Product-UI change: replaces the stale hardcoded `92
> applied_ai JDs` claim in the landing-page hero with `47`
> (the correct value from the current on-disk `web_bundle.json`),
> and wires the already-correct `443 tracked jobs` +
> `5 evidence quotes` through a tiny display-only helper for
> grep-friendly future refresh. No runner, daemon, scheduler,
> cron, GitHub Actions change, Codex/Claude config mutation,
> OpenAI API introduction, LLM call, or `.agent/scripts/**`
> edit. Scaffolded by
> `python .agent/scripts/new_run_report.py --task-id 2026-06-30_run_02`.

## Metadata

- **task_id**: `2026-06-30_run_02` (matches the TASK file)
- **date**: `2026-06-30`
- **run_number**: `02`
- **branch**: web repo `main` (no branch cut — yellow product-UI
  small-diff task, same direct-on-`main` pattern P1.7
  (`2026-06-27_run_01`) used)

## Commits

**Web repo (`/Users/bohaoli/Desktop/ai-career-radar-web`):**
- `d23ef4b` (already on `main` and `origin/main` before this
  run; AgentOps-2c cleanup)
- `1c912f8` Sync hero numbers with web bundle (this run;
  3 files in one commit: TASK + helper + page.tsx edit)
- *(forthcoming)* Add RUN_REPORT 2026-06-30_run_02 (this file)

**Pipeline repo (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`):**
- `none` (pipeline repo not touched; read-only sanity check
  only; HEAD remains `b019786` at start and end of run)

## Files changed

**Web repo (this run, vs `HEAD` at run start = `d23ef4b`):**

```
 .agent/tasks/2026-06-30_run_02_TASK.md    | 313 ++++++++++++++++++++++++++++
 src/lib/web-bundle-stats.ts               |  29 +++++++++++++++++++++++
 src/app/page.tsx                          |  12 ++++++-----
 .agent/run_reports/2026-06-30_run_02_RUN_REPORT.md | <this file>
 4 files changed (3 committed in 1c912f8, 1 forthcoming)
```

- `.agent/tasks/2026-06-30_run_02_TASK.md` — NEW, 313 lines.
  TASK spec. Cites the preflight fact that current
  `web_bundle.json` has `n_records=443` /
  `applied_ai_count=47` / `unique_companies=35` — making the
  hero's `92 applied_ai JDs` claim stale, and the `443` claim
  already correct.
- `src/lib/web-bundle-stats.ts` — NEW, **29 lines**. Exports
  a single `WEB_BUNDLE_STATS` const with 4 primitive numeric
  fields (`totalJds: 443`, `appliedAiJds: 47`,
  `trackedCompanies: 35`, `evidenceQuotesPerReport: 5`) and
  a JSDoc comment naming the source
  (`src/data/web_bundle.json`), bundle `generated_at`, and
  authoring-time computation method
  (`python3 -c "import json; …"`). **Does NOT import** the
  bundle or `@/lib/corpus` — verified by
  `grep -c 'import.*web_bundle.json\|import.*corpus'` = 0.
  This avoids shipping the 1.4 MB JSON into any client
  bundle chunk.
- `src/app/page.tsx` — EDITED, `+7/-5`. Five surgical
  changes:
  - Line 8: added
    `import { WEB_BUNDLE_STATS } from "@/lib/web-bundle-stats"`.
  - Line 765 (was 764): fit-signal strip
    `92` → `{WEB_BUNDLE_STATS.appliedAiJds}` (now renders 47).
  - Line 823 (was 822): attribution strip
    `92` → `{WEB_BUNDLE_STATS.appliedAiJds}` (now renders 47).
  - Line 825 (was 824): attribution strip
    `5` → `{WEB_BUNDLE_STATS.evidenceQuotesPerReport}`
    (renders 5; grep-friendly).
  - Line 850-851 (was 849): value-pillar
    `Built from 443 tracked … posts, not generic career
    advice.` → `Built from {WEB_BUNDLE_STATS.totalJds} tracked
    … posts across {WEB_BUNDLE_STATS.trackedCompanies}
    companies, not generic career advice.` (renders 443 + 35;
    the added "across 35 companies" is the one **optional
    secondary polish** the TASK's Acceptance criterion 11
    called out — it fits naturally in the existing sentence
    without disrupting layout).
- `.agent/run_reports/2026-06-30_run_02_RUN_REPORT.md` —
  this file (forthcoming commit).

Other `src/**` paths in the tree are untouched:
`src/lib/prompts.ts`, `src/lib/corpus.ts`, `src/lib/types.ts`,
`src/lib/eval-report.ts`, `src/lib/extract-pdf.ts`,
`src/data/web_bundle.json`, `src/data/web_bundle_pipeline.json`,
`src/app/api/**`, `src/app/lab/**`, `src/app/methodology/**`,
`src/app/sample-report/**`, `src/app/snapshot-pipeline/**`,
`src/components/**`. Verified via `git diff --stat HEAD` on
each path — empty.

**Pipeline repo:** no diff. Confirmed via `git status` on
`main` — `nothing to commit, working tree clean` at run start
and end; HEAD = `b019786` at both points.

## Summary

Implemented TASK `2026-06-30_run_02` per spec. The landing
page hero now displays numbers grounded in the actual on-disk
corpus:

- **`92 applied_ai JDs` → `47 applied_ai JDs`** (fit-signal
  strip + attribution strip). The `92` was the stale mock
  claim; the current bundle has exactly 47 records with
  `archetype === "applied_ai"`.
- **`443 tracked AI engineering job posts` stays 443** (the
  hardcoded number was already correct — matches
  `bundle.n_records`) but is now wired through the helper
  so a future corpus regeneration can be reflected by
  editing one file (`src/lib/web-bundle-stats.ts`) instead
  of grepping `page.tsx`.
- **`across 35 companies`** is a small additive polish in
  the value-pillar copy — a new, credible claim from the
  bundle (`unique_companies=35`) that fits the existing
  sentence and reinforces the "grounded in real jobs"
  framing.
- **`5 evidence quotes`** is unchanged in rendered value but
  now wired through the helper's `evidenceQuotesPerReport`
  constant so all four report-shape numbers live in one
  small file.

The helper file `src/lib/web-bundle-stats.ts` is deliberately
**29 lines of primitive constants** with a JSDoc comment
naming the source, the authoring-time computation, and the
"regenerate: re-run the one-liner and edit" refresh
instruction. It does NOT import `web_bundle.json` (0
occurrences of that import) so the 1.4 MB JSON stays out of
any client bundle chunk.

No changes to prompts, model selection, `corpus.ts`, `types.ts`,
`web_bundle.json`, pipeline files, `.agent/scripts/**`,
`.agent/policies/**`, `.agent/templates/**`, `.agent/blockers.md`,
`.agent/automation_queue.md`, `.github/workflows/**`,
`vercel.json`, `.vercel/**`, `package.json`,
`package-lock.json`, or `.env*`. No OpenAI API introduction. No
Codex CLI / Claude Code config touched. No new dependency. No
runner / daemon / scheduler / cron file. No LLM call by this
task. No `git push`. No `vercel deploy`. Pipeline repo untouched.

## Constraints checked

### Web repo

- [x] `src/lib/prompts.ts` — untouched (empty diff vs HEAD)
- [x] `src/lib/corpus.ts` — untouched
- [x] `src/lib/types.ts` — untouched (helper defines its own
      inline `as const` type; no new entry in `types.ts`)
- [x] `src/lib/eval-report.ts` — untouched
- [x] `src/lib/extract-pdf.ts` — untouched
- [x] `src/lib/anthropic.ts` — does not exist in this repo
      (verified via `ls src/lib/`); the constraint is
      trivially satisfied
- [x] `src/data/web_bundle.json` — **read-only**, not
      modified (empty diff)
- [x] `src/data/web_bundle_pipeline.json` — untouched
- [x] `src/data/lab/**` — untouched
- [x] `src/app/api/**` — untouched
- [x] `src/app/lab/**`, `src/app/methodology/**`,
      `src/app/sample-report/**`,
      `src/app/snapshot-pipeline/**` — all untouched
- [x] `src/components/**` — untouched
- [x] `package.json` / `package-lock.json` — untouched (no
      new dependencies)
- [x] `.env*` — untouched (pre-existing `.env.local`
      gitignored)
- [x] `.github/workflows/**` — untouched
- [x] `vercel.json` — does not exist in this repo tree at
      the level checked; constraint trivially satisfied
- [x] `.vercel/**` — untouched
- [x] `.agent/policies/**` — untouched (policy at v1.1)
- [x] `.agent/templates/**` — untouched
- [x] `.agent/scripts/**` — **untouched** (hard rule per
      AgentOps-2c DECISION Q3-Q8; verified empty diff
      vs HEAD)
- [x] `.agent/blockers.md` — untouched (BLK-0001 / BLK-0002 /
      BLK-0003 all still `open`)
- [x] `.agent/automation_queue.md` — untouched this task
      (queue transitions reserved for B-time)
- [x] `.agent/design_memos/**` — untouched
- [x] `.agent/automation_runs/**` — untouched
      (MANUAL_DRY_RUN report stays as historical record)
- [x] `.agent/daily_summaries/**` — untouched
- [x] `.agent/README.md` — untouched

### Pipeline repo

- [x] **All files** — untouched. Pipeline `git status` clean
      at start and end; HEAD unchanged at `b019786`.
      Two read-only checks ran; zero pipeline-side edits.

### Tool config and external integrations

- [x] **OpenAI API SDK / key / `.env` entry / HTTP call /
      import / CI secret / background token** — none
      introduced (per Q7 blocked sense).
- [x] **Codex CLI config** — not edited.
- [x] **Claude Code config** — not edited.
- [x] **New GitHub Actions / workflow files** — none.
- [x] **New cron jobs** — none.
- [x] **New deployment hooks** — none.
- [x] **New npm / Python dependencies** — none. `package.json`
      / `package-lock.json` empty diff.
- [x] **`python -m scripts.collector …` invocation** — never
      invoked. One `python3 -c "import json; …"` one-liner
      ran at authoring time to READ `web_bundle.json` (no
      write, no external call, no dependency).
- [x] **`npm run …` invocation** — `npm run lint` and
      `npm run build` invoked as approved by the TASK's
      Validation section. `npm run screenshot` NOT invoked
      (see Screenshots section below for rationale).
      `npm run collect` NOT invoked. `npm run dev` NOT
      invoked.
- [x] **LLM call** — no `anthropic` / `openai` SDK
      invocation by this run.
- [x] **Automation runner / daemon / scheduler / cron file
      creation** — none.
- [x] **Queue / blocker state changes** — none. QUEUE-0001
      / QUEUE-0006 / QUEUE-0007 / QUEUE-0008 all still
      `done`. QUEUE-0002 still `blocked_pending_human`.
      QUEUE-0003 / QUEUE-0004 / QUEUE-0005 unchanged.
      BLK-0001 / BLK-0002 / BLK-0003 all still `open`.

## Red-zone check

- Red-zone files modified this run: **none**.
- Approval reference: N/A. The 3 changed/new files land
  under `.agent/tasks/`, `src/lib/` (new helper), and
  `src/app/page.tsx` — all yellow per policy §6 for a small
  UI-copy diff. No `src/lib/prompts.ts`,
  `src/lib/anthropic.ts` (not present), or
  `src/data/web_bundle.json` touched.

## Validation results

```
=== file presence + sizes ===
.agent/tasks/2026-06-30_run_02_TASK.md   313 lines
src/lib/web-bundle-stats.ts              29 lines  (≤ 50-line cap)
src/app/page.tsx                         +7 / -5   (surgical edits)
.agent/run_reports/2026-06-30_run_02_RUN_REPORT.md   <this file> (forthcoming)

=== git status --short (pre-commit) ===
 M src/app/page.tsx
?? .agent/tasks/2026-06-30_run_02_TASK.md
?? src/lib/web-bundle-stats.ts

=== git diff --stat (pre-commit) ===
 src/app/page.tsx | 12 +++++++-----
 1 file changed, 7 insertions(+), 5 deletions(-)

=== post-commit (1c912f8) ===
[main 1c912f8] Sync hero numbers with web bundle
 3 files changed, 354 insertions(+), 5 deletions(-)
 create mode 100644 .agent/tasks/2026-06-30_run_02_TASK.md
 create mode 100644 src/lib/web-bundle-stats.ts

=== helper structural checks ===
$ wc -l src/lib/web-bundle-stats.ts
29
$ grep -c 'import.*web_bundle.json' src/lib/web-bundle-stats.ts
0   ✓ (no JSON import → no client-bundle bloat)
$ grep -c 'import.*corpus' src/lib/web-bundle-stats.ts
0   ✓ (no transitive JSON import via corpus.ts)

=== page.tsx spot-checks ===
$ grep -n '>92</span>\|"92"' src/app/page.tsx
(no output — no lingering hardcoded "92" in the hero) ✓
$ grep -n 'WEB_BUNDLE_STATS' src/app/page.tsx
8:   import { WEB_BUNDLE_STATS } from "@/lib/web-bundle-stats";
765: Based on <span …>{WEB_BUNDLE_STATS.appliedAiJds}</span> applied_ai JDs
823: <span><span …>{WEB_BUNDLE_STATS.appliedAiJds}</span> applied_ai JDs</span>
825: <span><span …>{WEB_BUNDLE_STATS.evidenceQuotesPerReport}</span> evidence quotes</span>
850: Built from {WEB_BUNDLE_STATS.totalJds} tracked AI engineering job posts
851: across {WEB_BUNDLE_STATS.trackedCompanies} companies, not generic career

=== forbidden audit (vs HEAD~1 post-commit) ===
all forbidden paths (src/lib/prompts.ts src/lib/corpus.ts
src/lib/types.ts src/lib/eval-report.ts src/lib/extract-pdf.ts
src/data/ package.json package-lock.json .agent/policies/
.agent/templates/ .agent/scripts/ .agent/blockers.md
.agent/automation_queue.md .github/workflows/ vercel.json
.vercel/ src/app/api/ src/app/lab/ src/app/methodology/
src/app/sample-report/ src/app/snapshot-pipeline/
src/components/): empty diff ✓

=== npm run lint ===
37 errors, 0 warnings — all PRE-EXISTING baseline errors
(unescaped entities on multiple pages; one setState-in-effect
warning at src/app/page.tsx:472). None reference this run's
edits (my touched lines are 8, 765, 823, 825, 850, 851; none
of the errors point to these). Baseline unchanged from before
this task.

=== npm run build ===
✓ Compiled successfully in 1858ms
Running TypeScript ...
Finished TypeScript in 1683ms ...
Generating static pages using 15 workers (14/14) in 404ms ✓

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/classify, /api/companies, /api/eval-report,
│    /api/extract-pdf, /api/generate-report
├ ○ /lab, /methodology, /opengraph-image, /sample-report,
│    /snapshot-pipeline

No new bundle-size warnings. No JSON leaked into the client
chunk (helper is primitive constants only).

=== pipeline read-only sanity ===
$ git status (pipeline)
On branch main · up to date with origin/main · clean
$ git rev-parse HEAD (pipeline)
b0197867d93e50e60f84f8aefc7c71ee792d3006   ← unchanged

=== Acceptance criteria coverage (manual ✓) ===
1.  Helper exists, ≤50 lines, primitive constants           ✓ (29 lines)
2.  Helper does NOT import bundle or corpus.ts              ✓
3.  page.tsx line 764/765 92 → appliedAiJds                 ✓ (renders 47)
4.  page.tsx line 822/823 92 → appliedAiJds                 ✓ (renders 47)
5.  page.tsx line 824/825 5 → evidenceQuotesPerReport       ✓ (renders 5)
6.  page.tsx line 849/850 443 → totalJds                    ✓ (renders 443)
7.  Optional trackedCompanies surfaced non-intrusively      ✓ (line 851)
8.  prompts.ts / corpus.ts / types.ts untouched             ✓
9.  web_bundle.json untouched                               ✓
10. package.json / package-lock.json untouched              ✓
11. npm run lint passes (baseline warnings only)            ✓
12. npm run build passes (TypeScript clean, 14/14 static)   ✓
13. git diff --stat only allowed paths                      ✓
14. No forbidden file modified                              ✓
15. No git push performed                                   ✓
16. No DECISION file created                                ✓
17. Pipeline HEAD = b019786 unchanged                       ✓
```

## Build result

`pass` — `npm run build` succeeded (1858ms compile; 14 static
routes generated; TypeScript clean in 1683ms). No new
bundle-size regression; the client bundle does not
transitively pull in `web_bundle.json` because the helper
exports primitive literals only.

## Tests result

`n/a` — this repo has no automated test framework; validation
was lint + build + manual structural checks (recorded above).

## Screenshots

`not-run` — deliberately skipped for this loop.

- The TASK's Validation Commands listed `npm run lint` +
  `npm run build`, NOT `npm run screenshot`.
- The change is a **pure numeric substitution** (92→47,
  wired 443 + 5 + added "across 35 companies"), no styling,
  layout, spacing, component structure, or CSS change.
  `npm run build`'s successful 14/14 static generation
  already verifies that `page.tsx` renders correctly with
  the new constants; visual regression would only be
  interesting if a component-structural change had been
  made.
- Running `npm run screenshot` requires a separate `npm run
  dev` process (see `scripts/screenshot.mjs` docstring), adds
  significant orchestration to this loop, and would not
  surface information the diff itself doesn't already show.
- If the DECISION reviewer wants screenshots for the record,
  they can request them as a non-blocking follow-up
  (`npm run dev` in one terminal + `npm run screenshot` in
  another; captures 15 PNGs under
  `temporary/screenshots/{desktop,tablet,mobile}/`).

## Risks

1. **The `47` number is authoring-time-fresh but not
   auto-refreshing.** If the corpus is regenerated (via
   pipeline collection) and `web_bundle.json` gets a new
   `n_records`, the constants in
   `src/lib/web-bundle-stats.ts` will drift again. Severity:
   **low**. Mitigation: the JSDoc comment in the helper
   names the source, the `generated_at` timestamp
   (2026-05-14), and the one-liner to re-run for a refresh;
   the refresh is 4 constant edits. Long-term: a build-time
   codegen script could auto-sync, but that would be its
   own separate task (green, `.agent/scripts/` or
   `scripts/`) — deliberately not built here to keep P1.7b
   scope narrow.
2. **The optional `35 companies` addition is copy — a
   subjective choice.** Different reviewers might prefer to
   omit it. Severity: **low / cosmetic**. Mitigation: the
   addition fits the existing sentence structure; if
   DECISION requests removal, a 1-line edit reverts it.
3. **Baseline lint has 37 pre-existing errors.** None are
   introduced by this task, but they exist in the codebase.
   Severity: **low / pre-existing**. Not addressed here
   (would be scope creep — a separate task).
4. **`generated_at` is 2026-05-14 (~6 weeks old at time of
   run).** The hero no longer displays a "last updated"
   claim, so this is not user-visible; but it does mean the
   corpus is due for a refresh. Severity: **low / process**.
   Mitigation: surface as a follow-up in the DECISION for
   Bohao's awareness; not this task's problem to fix.
5. **`vercel.json` was listed as forbidden in the TASK but
   does not exist in this repo tree.** The constraint is
   trivially satisfied but worth noting so a future TASK
   reviewer doesn't spend time looking for it. Severity:
   **n/a**.
6. **Push is gated.** Web is ahead of `origin/main` by 1
   commit now (`1c912f8`); after RUN_REPORT commit, by 2;
   after DECISION commit, by 3. None pushed until Bohao
   explicitly approves. Severity: **n/a by design**.

## Follow-up recommendations

- **Next: Human + ChatGPT review** of this RUN_REPORT and
  the diff at commit `1c912f8`. Quick read: helper is 29
  lines of primitive constants + JSDoc; `page.tsx` change is
  `+7/-5` across 5 lines (1 import + 4 substitutions inside
  the hero block). Optional visual check: `git show 1c912f8
  -- src/app/page.tsx` shows the exact hero copy diff.
- **Then: DECISION** via
  `python .agent/scripts/new_decision.py --task-id 2026-06-30_run_02`.
  Approval gates pushing this loop's commits (`1c912f8` +
  forthcoming RUN_REPORT commit + forthcoming DECISION
  commit).
- **Then (only if DECISION = approve)**: the natural next
  product task is **P1.7c model-string single source of
  truth** — same yellow risk class, same product-first
  spirit per AgentOps-2c Q10. Alternatively, if a corpus
  regeneration is warranted (the current bundle is
  ~6 weeks old), that's a **pipeline task** — separate
  scope-and-approve loop.
- **Do NOT** start P1.7c in the same loop as this DECISION.
- **Do NOT** start any AgentOps-2* work (per Q10 pause).
- **Do NOT** modify `.agent/scripts/**` (hard rule).
- **Do NOT** lift BLK-0001 / BLK-0002 / BLK-0003.
- **Do NOT** re-run corpus collection as a side effect of
  approving this DECISION — corpus refresh is its own task.
- **Optional low-priority follow-up**: build-time codegen
  for `web-bundle-stats.ts` (e.g. a small Node script that
  reads `web_bundle.json` at build time and rewrites the
  constants) — would eliminate the drift risk in Risk #1.
  Would be its own separate green task; not needed until
  the drift actually causes a problem.

## Ready for review

`yes`

## Requires human decision

`yes` — required before push of `main`. The web repo
currently has one unpushed commit (`1c912f8` — TASK +
helper + page.tsx edit); the RUN_REPORT commit (this file)
will be the second; the matching DECISION commit will be
the third. All three wait on human GO before going to
`origin/main`.

Approval of this DECISION ships the corrected hero
copy to production (Vercel auto-deploys on `main` push;
served bundle will include only the small helper file's
constants — verified by the successful build). Approving
does NOT approve: (a) P1.7c or any other queued product
task, (b) any AgentOps-2* work, (c) any
`.agent/scripts/**` mod, (d) any corpus regeneration, (e)
G2.1d, (f) any OpenAI API usage, (g) lifting any of the
3 open blockers.

> Verdict is technical-execution-only for now. Standing
> policy treats any `main` push as a human gate. The
> visible change is small (5 line edits + 29-line helper);
> the impact is credibility (hero claim now matches actual
> corpus).
