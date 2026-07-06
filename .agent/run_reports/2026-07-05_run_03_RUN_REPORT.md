# RUN REPORT · P1.8b methodology company source count audit

> Authored by Claude Code after executing TASK
> `2026-07-05_run_03`. Web-repo only for edits — pipeline
> repo read-only for `sources.yaml` inspection.
> Product-UI copy audit: verified the methodology page's
> `~40 companies` claim against two source-of-truth
> candidates (pipeline `sources.yaml` = 8; current bundle
> unique companies = 35 per P1.7b), determined the claim
> is **stale/misleading**, and made a small copy-only
> correction at 3 sites in `src/app/methodology/page.tsx`
> tying the value to `WEB_BUNDLE_STATS.trackedCompanies`
> (renders 35). No runner, daemon, scheduler, cron,
> GitHub Actions change, Codex/Claude config mutation,
> OpenAI API introduction, LLM call, prompt / API-route /
> runtime-model touch, `.agent/scripts/**` edit, pipeline
> modification, or corpus regeneration. Scaffolded by
> `python .agent/scripts/new_run_report.py --task-id 2026-07-05_run_03`.

## Metadata

- **task_id**: `2026-07-05_run_03` (matches the TASK file)
- **date**: `2026-07-05`
- **run_number**: `03`
- **branch**: web repo `main` (no branch cut — yellow
  product-UI small-diff task, same direct-on-`main`
  pattern P1.7b (`1c912f8`), P1.7c (`c0a0df3`), P1.8a
  (`34d5cc8`) used)

## Commits

**Web repo (`/Users/bohaoli/Desktop/ai-career-radar-web`):**
- `d07bf7a` (already on `main` and `origin/main` before
  this run; P1.8a cleanup)
- `33fc11a` Polish methodology source-count copy (this
  run; 2 files in one commit: TASK +
  `methodology/page.tsx` edit)
- *(forthcoming)* Add RUN_REPORT 2026-07-05_run_03 (this
  file)

**Pipeline repo (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`):**
- `none` (pipeline repo not touched; `sources.yaml`
  inspected read-only via `grep`/`head` at preflight;
  HEAD remains `b019786` at start and end of run)

## Files changed

**Web repo (this run, vs `HEAD` at run start = `d07bf7a`):**

```
 .agent/tasks/2026-07-05_run_03_TASK.md   | 342 ++++++++++++++++++++++++++++
 src/app/methodology/page.tsx             |  15 +++++++++------
 .agent/run_reports/2026-07-05_run_03_RUN_REPORT.md | <this file>
 3 files changed (2 committed in 33fc11a, 1 forthcoming)
```

- `.agent/tasks/2026-07-05_run_03_TASK.md` — NEW, 342
  lines. TASK spec + full preflight audit trail. Cites
  the two source-of-truth candidates checked at
  preflight (sources.yaml=8, bundle unique
  companies=35), the surrounding-paragraph analysis that
  determined all three "40" mentions refer to the
  bundle-behind-the-served-content (not the automated
  registry), and the verdict (stale/misleading, small
  fix warranted).
- `src/app/methodology/page.tsx` — EDITED, **`+9/-6`**.
  Four surgical changes (1 import + 3 copy
  substitutions):
  - Line 13: added
    `import { WEB_BUNDLE_STATS } from "@/lib/web-bundle-stats"`.
  - Line 117-118 (opening paragraph of "What this
    corpus is"): `A curated set of approximately 40 AI
    / AI-adjacent technology companies.` → `A curated
    set of {WEB_BUNDLE_STATS.trackedCompanies} AI /
    AI-adjacent technology companies.` (removed
    `approximately`; renders as `35`).
  - Line 144-145 (What-this-is-NOT bullet #1): `40
    companies is a curated sample, not a census.` →
    `{WEB_BUNDLE_STATS.trackedCompanies} companies is
    a curated sample, not a census.` (renders as `35`).
  - Line 311-312 (What-we-do-NOT-report bullet):
    `Universal market claims. Our corpus is 40 curated
    companies, not a market census.` → `Our corpus is
    {WEB_BUNDLE_STATS.trackedCompanies} curated
    companies, not a market census.` (renders as `35`).
- `.agent/run_reports/2026-07-05_run_03_RUN_REPORT.md`
  — this file (forthcoming commit).

**Empty diff verified on every other path**:
`src/app/page.tsx` (empty diff), `src/app/sample-report/`
(P1.8a already handled, no overlap), `src/app/api/**`
(runtime model selection), `src/app/lab/**`,
`src/app/snapshot-pipeline/**`, `src/app/layout.tsx`,
`src/app/opengraph-image.tsx`, `src/components/**`,
`src/lib/prompts.ts`, `src/lib/corpus.ts`,
`src/lib/types.ts`, `src/lib/eval-report.ts`,
`src/lib/extract-pdf.ts`,
`src/lib/web-bundle-stats.ts` (only *imported*, not
modified), `src/lib/models-display.ts`, `src/data/**`,
`package.json`, `package-lock.json`, `.env*`,
`.github/workflows/**`, `vercel.json`, `.vercel/**`,
`.agent/policies/**`, `.agent/templates/**`,
`.agent/scripts/**` (hard rule per Q3-Q8),
`.agent/blockers.md`, `.agent/automation_queue.md`.

**Pipeline repo:** no diff. Confirmed via `git status`
on `main` — `nothing to commit, working tree clean` at
run start and end; HEAD = `b019786` at both points.
`sources.yaml` inspected read-only only (via `grep`
and `head`; no editor open, no `>` redirect, no `git
add`).

## Methodology claims found

Three occurrences of "40" in `src/app/methodology/page.tsx`,
all referring to the same conceptual object (the
curated-company set behind the served bundle):

1. **Line 117-118** — opening paragraph of the "What
   this corpus is" section:
   > "A curated set of approximately 40 AI /
   > AI-adjacent technology companies. The companies
   > span frontier AI labs, big-tech AI teams, AI-native
   > scaleups, AI infrastructure platforms, and AI
   > tooling / evaluation / observability vendors. Most
   > postings are based in the US and EU. **The live
   > home page currently serves the May 2026
   > manually-curated snapshot**; the automated
   > pipeline now re-fetches the corpus daily and
   > writes a separate staging bundle previewed at
   > /snapshot-pipeline."
2. **Line 143-146** — first bullet under "What this
   corpus is NOT":
   > "**Not the entire AI job market.** 40 companies is
   > a curated sample, not a census. We do not claim
   > 'the AI market is doing X.' We claim 'in the
   > curated companies we follow, the visible
   > composition is X.'"
3. **Line 309-310** — bullet under "We do NOT report":
   > "Universal market claims. Our corpus is 40
   > curated companies, not a market census."

## Web bundle facts checked (read-only)

Per P1.7b (`1c912f8`)'s helper `src/lib/web-bundle-stats.ts`
and re-verified at this task's preflight by inspecting
`src/data/web_bundle.json`:

- `bundle.n_records` = **443** (total JDs in the served
  bundle)
- Unique companies in bundle (Python set over
  `record.company`) = **35**
- `bundle.generated_at` = **2026-05-14T02:17:04+00:00**
  (~7-week-old snapshot as of authoring)
- `applied_ai` archetype count = **47** (per P1.8a's fix)

## Sources.yaml facts checked (read-only)

Pipeline `sources.yaml` inspected at preflight
(`head -60` + `grep -c '^  - source_id:'`):

- **Registry size**: **8 sources** (post-F2.6 expansion
  on 2026-05-19), confirmed by both the file's own
  header comment ("Phase F2.6 expansion (2026-05-19):
  1 → 8 sources") and by counting `source_id:` lines.
- **Source IDs**: anthropic, scale_ai, together_ai,
  fireworks_ai, cohere, langchain, cursor, perplexity.
- **Source types**: Greenhouse × 4 + Ashby × 4.
- **All 8 have compliance metadata** and are marked
  `enabled: true`.

## Audit conclusion

**Verdict: STALE / MISLEADING.** The methodology page's
`~40 companies` claim doesn't match either candidate
source of truth:

| Candidate source | Value | Match to "40"? |
|---|---|---|
| Pipeline `sources.yaml` (automated registry) | **8** | ❌ off by 5× |
| Bundle unique companies (currently served) | **35** | ❌ rounded up |

**Which one does the methodology page actually refer to?**
Read the surrounding paragraphs carefully. Line 117
explicitly says: **"The live home page currently serves
the May 2026 manually-curated snapshot"** — i.e. the
bundle. Lines 143 and 309 use the same framing ("the
curated companies we follow", "our corpus"). All three
"40" mentions refer to the **manually-curated bundle**,
not the automated `sources.yaml` registry.

The correct value is therefore **35** (bundle unique
companies), which is what P1.7b's
`WEB_BUNDLE_STATS.trackedCompanies` already exposes.

**Fix applied**: Wire all three sites to
`{WEB_BUNDLE_STATS.trackedCompanies}` — same pattern as
P1.7b (hero), P1.7c (model strings), and P1.8a
(sample-report). Import once at the top of the file. No
other changes.

**Rendered impact**: The three "40" occurrences all
become "35". `approximately` on line 117 is removed
because we now have the exact value.

## Copy changes made

### Change 1 · line 117-118 (opening paragraph)

**Before**:
```
A curated set of approximately 40 AI / AI-adjacent technology
companies. The companies span frontier AI labs, big-tech AI
```

**After**:
```
A curated set of {WEB_BUNDLE_STATS.trackedCompanies} AI / AI-adjacent
technology companies. The companies span frontier AI labs, big-tech AI
```

**Rendered**: `approximately 40 AI / AI-adjacent
technology companies` → `35 AI / AI-adjacent technology
companies`.

**Rationale**: Removes the fictional-rounded-up
"approximately 40" and states the actual bundle count.
Reader gets a more honest claim; downstream copy
statistics in the same section already reference
specific per-company JD counts (e.g. "Scale AI (61
JDs)"), so a precise `35` is consistent with the
section's tone.

### Change 2 · line 144-146 (What this is NOT)

**Before**:
```tsx
<strong>Not the entire AI job market.</strong> 40 companies is
a curated sample, not a census. We do not claim "the AI market
```

**After**:
```tsx
<strong>Not the entire AI job market.</strong>{" "}
{WEB_BUNDLE_STATS.trackedCompanies} companies is a curated sample,
not a census. We do not claim "the AI market
```

**Rendered**: `40 companies is a curated sample` →
`35 companies is a curated sample`. The `{" "}` before
the JSX-expression handles the whitespace after the
`<strong>` tag (React collapses whitespace-only
text nodes adjacent to JSX expressions, so the space
must be explicit).

### Change 3 · line 311-313 (What we do NOT report)

**Before**:
```tsx
Universal market claims. Our corpus is 40 curated companies,
not a market census.
```

**After**:
```tsx
Universal market claims. Our corpus is{" "}
{WEB_BUNDLE_STATS.trackedCompanies} curated companies, not a market
census.
```

**Rendered**: `Our corpus is 40 curated companies` →
`Our corpus is 35 curated companies`.

## Constraints checked

### Web repo

- [x] `src/app/page.tsx` — untouched (empty diff).
      Hero already shows `35` via P1.7b's
      `trackedCompanies`; no duplicate site to fix.
- [x] `src/app/sample-report/page.tsx` — untouched
      (empty diff). P1.8a handled sample-report; no
      methodology teaser overlap.
- [x] `src/app/api/**` — untouched. Runtime model
      selection frozen.
- [x] `src/app/layout.tsx`, `src/app/opengraph-image.tsx`,
      `src/app/lab/**`, `src/app/snapshot-pipeline/**` —
      untouched.
- [x] `src/components/**` — untouched.
- [x] `src/lib/prompts.ts` — untouched.
- [x] `src/lib/corpus.ts` — untouched.
- [x] `src/lib/types.ts` — untouched.
- [x] `src/lib/eval-report.ts` /
      `src/lib/extract-pdf.ts` — untouched.
- [x] `src/lib/anthropic.ts` — does not exist in this
      repo; trivially satisfied.
- [x] **`src/lib/web-bundle-stats.ts`** — **imported
      only, not modified** (empty diff verified).
- [x] `src/lib/models-display.ts` — untouched.
- [x] `src/data/**` — untouched (`web_bundle.json` /
      `web_bundle_pipeline.json` / `lab/**` all frozen).
- [x] `package.json` / `package-lock.json` — untouched
      (no new deps).
- [x] `.env*` — untouched.
- [x] `.github/workflows/**` — untouched.
- [x] `vercel.json` / `.vercel/**` — untouched (do not
      exist / untouched).
- [x] `.agent/policies/**` — untouched (policy at v1.1).
- [x] `.agent/templates/**` — untouched.
- [x] **`.agent/scripts/**`** — **untouched** (hard
      rule per AgentOps-2c DECISION Q3-Q8; empty diff
      verified).
- [x] `.agent/blockers.md` — untouched (no blocker
      change).
- [x] `.agent/automation_queue.md` — untouched.
- [x] `.agent/README.md` — untouched.

### Pipeline repo

- [x] **All files** — read-only inspection only. `git
      status` clean at start and end; HEAD unchanged at
      `b019786`. `sources.yaml` was inspected via
      `head -60` and `grep -c '^  - source_id:'`
      commands only — no editor open, no write, no
      `git add`.

### Tool config and external integrations

- [x] **OpenAI API SDK / key / `.env` entry / HTTP call
      / import / CI secret / background token** — none
      introduced (per Q7 blocked sense).
- [x] **Codex CLI config** — not edited.
- [x] **Claude Code config** — not edited.
- [x] **New GitHub Actions / workflow files** — none.
- [x] **New cron jobs** — none.
- [x] **New deployment hooks** — none.
- [x] **New npm / Python dependencies** — none.
- [x] **`python -m scripts.collector …` invocation** —
      never invoked. One `python3 -c "import json; …"`
      one-liner ran at authoring time to re-verify
      `bundle.n_records` / unique-company count / etc.
      as read-only inspection (already verified by
      P1.7b).
- [x] **`npm run …` invocation** — `npm run lint` and
      `npm run build` invoked as approved by the TASK's
      Validation section. `npm run collect` NOT
      invoked.
- [x] **LLM call** — no `anthropic` / `openai` SDK
      invocation by this run.
- [x] **Automation runner / daemon / scheduler / cron
      file creation** — none.
- [x] **Queue / blocker state changes** — none.
      QUEUE-0001 / QUEUE-0004 / QUEUE-0006 / QUEUE-0007 /
      QUEUE-0008 all still `done`. QUEUE-0002 still
      `blocked_pending_human`. QUEUE-0003 / QUEUE-0005
      unchanged. BLK-0001 / BLK-0002 / BLK-0003 all
      still `open`.

## Red-zone check

- Red-zone files modified this run: **none**.
- Approval reference: N/A. The 2 changed/new files
  land under `.agent/tasks/` and
  `src/app/methodology/page.tsx` — all yellow per
  policy §6 for a small copy-audit change.

## Validation results

```
=== file presence + sizes ===
.agent/tasks/2026-07-05_run_03_TASK.md    342 lines
src/app/methodology/page.tsx              +9 / -6 (surgical: 1 import + 3 copy edits)
.agent/run_reports/2026-07-05_run_03_RUN_REPORT.md  <this file> (forthcoming)

=== git status --short (pre-commit) ===
 M src/app/methodology/page.tsx
?? .agent/tasks/2026-07-05_run_03_TASK.md

=== git diff --stat (pre-commit) ===
 src/app/methodology/page.tsx | 15 +++++++++------
 1 file changed, 9 insertions(+), 6 deletions(-)

=== post-commit (33fc11a) ===
[main 33fc11a] Polish methodology source-count copy
 2 files changed, 348 insertions(+), 6 deletions(-)
 create mode 100644 .agent/tasks/2026-07-05_run_03_TASK.md

=== methodology spot-checks ===
$ grep -n 'WEB_BUNDLE_STATS' src/app/methodology/page.tsx
13:  import { WEB_BUNDLE_STATS } from "@/lib/web-bundle-stats";
118: A curated set of {WEB_BUNDLE_STATS.trackedCompanies} AI / AI-adjacent
145: {WEB_BUNDLE_STATS.trackedCompanies} companies is a curated sample,
312: {WEB_BUNDLE_STATS.trackedCompanies} curated companies, not a market

$ grep -n 'approximately 40\|40 companies\|40 curated' src/app/methodology/page.tsx
(no output — all 3 target strings replaced) ✓

=== forbidden audit (vs HEAD~1 post-commit) ===
all forbidden paths — empty diff ✓

=== npm run lint ===
37 errors, 0 warnings — all PRE-EXISTING baseline errors.
Line 473 setState-in-effect location is UNCHANGED from
the P1.8a baseline because P1.8b only touched
`methodology/page.tsx`, which has no lint errors and no
import that would shift line numbers in other files.

=== npm run build ===
✓ Compiled successfully
Running TypeScript ...
Finished TypeScript ...
Generating static pages using 15 workers (14/14) ✓

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/classify, /api/companies, /api/eval-report,
│    /api/extract-pdf, /api/generate-report
├ ○ /lab, /methodology, /opengraph-image, /sample-report,
│    /snapshot-pipeline

No new bundle-size warnings. `WEB_BUNDLE_STATS` was
already in the client chunk (from P1.7b via
`src/app/page.tsx`, P1.7c via `src/lib/models-display.ts`,
and P1.8a via `src/app/sample-report/page.tsx`); the
methodology import adds no incremental bundle cost.

=== pipeline read-only sanity ===
$ git status (pipeline)
On branch main · up to date with origin/main · clean
$ git rev-parse HEAD (pipeline)
b0197867d93e50e60f84f8aefc7c71ee792d3006   ← unchanged

=== Acceptance criteria coverage (manual ✓) ===
1.  Line 117 → uses trackedCompanies (renders 35)          ✓
2.  Line 143 → uses trackedCompanies (renders 35)          ✓
3.  Line 309 → uses trackedCompanies (renders 35)          ✓
4.  New import at top                                       ✓ (line 13)
5.  page.tsx empty diff                                     ✓
6.  sample-report empty diff                                ✓
7.  web-bundle-stats.ts untouched (only imported)          ✓
8.  prompts.ts / corpus.ts / api/** / data/** untouched    ✓
9.  sources.yaml untouched (read-only inspection only)    ✓
10. No forbidden file modified                             ✓
11. npm run lint passes (baseline unchanged)               ✓
12. npm run build passes (14/14 static, TS clean)          ✓
13. git diff --stat only allowed paths                     ✓
14. No git push performed                                  ✓
15. No DECISION file created                               ✓
16. Pipeline HEAD = b019786 unchanged                      ✓
```

## Build result

`pass` — `npm run build` succeeded (14/14 static routes
generated; TypeScript clean; no bundle-size warnings).

## Tests result

`n/a` — this repo has no automated test framework;
validation was lint + build + manual structural checks
(recorded above).

## Screenshots

`not-run` — deliberately skipped for this loop.

- The TASK's Validation Commands listed `npm run lint`
  + `npm run build`, NOT `npm run screenshot`.
- Same rationale as P1.7b / P1.7c / P1.8a: pure copy
  substitution, no styling / layout / component
  structure change. `npm run build`'s successful
  14/14 static generation already verifies rendering.
  The user-visible impact (`40 → 35`) is verifiable
  from the diff itself.

## Risks

1. **This push will cause user-visible copy changes on
   `/methodology`.** Three sites will render `35`
   instead of `40` (`approximately 40 → 35` in the
   opening paragraph; `40 companies → 35 companies` in
   the "Not the entire AI job market" bullet; `40
   curated companies → 35 curated companies` in the
   "Universal market claims" bullet). Severity:
   **medium / intended**. Mitigation: this is exactly
   the credibility-copy fix the task asked for; the new
   numbers align methodology with the actual
   currently-served bundle.
2. **Both P1.8a and P1.8b rely on the same
   manually-synced `WEB_BUNDLE_STATS`.** If
   `web_bundle.json` changes later, the helper's
   constants must be refreshed once, and both
   methodology + sample-report (+ homepage + others)
   pick up the new values. Severity: **low / process**.
   Same maintenance risk documented in P1.7b's
   DECISION.
3. **`sources.yaml` currently has 8 sources but the
   methodology page does not describe or link to it.**
   The page frames "40" (now 35) as the bundle-curated
   set, which is honest. But someone reading the
   automation status section (line 361-383) might
   wonder how many first-party ATS sources the daily
   cron runs against; that number is not in the copy
   today. Severity: **low / opportunity**. Mitigation:
   if a future TASK wants to surface the automated
   source registry size, that's a separate small edit
   ("The daily cron fetches from N first-party ATS
   sources"), not this task's scope.
4. **`bundle.generated_at` is 2026-05-14
   (~7 weeks old at time of run).** Sample-report's
   `47 applied_ai JDs` and methodology's `35 curated
   companies` both reflect this snapshot; if the
   automated pipeline promotes a newer bundle, the
   copy must be refreshed. Severity: **low / process**
   (same as risk #2).
5. **Baseline lint has 37 pre-existing errors.** None
   introduced by P1.8b; line-473 warning location
   unchanged because methodology has no lint errors and
   `page.tsx` line count is unchanged. Severity:
   **low / pre-existing**.
6. **Push is gated.** Web is ahead of `origin/main` by
   1 commit now (`33fc11a`); after RUN_REPORT commit,
   by 2; after DECISION commit, by 3. None pushed
   until Bohao explicitly approves. Severity: **n/a
   by design**.

## Follow-up recommendations

- **Next: Human + ChatGPT review** of this RUN_REPORT
  and the diff at commit `33fc11a`. Quick read: 3
  copy substitutions + 1 import in one file.
  `git show 33fc11a -- src/app/methodology/page.tsx`
  shows the exact before/after.
- **Then: DECISION** via
  `python .agent/scripts/new_decision.py --task-id 2026-07-05_run_03`.
  Approval gates pushing this loop's commits
  (`33fc11a` + forthcoming RUN_REPORT commit +
  forthcoming DECISION commit).
- **Then (only if DECISION = approve)**: the P1.7 +
  P1.8 credibility copy cluster is now fully
  consistent (hero uses 443 / 47 / 35 / 5 from the
  helper; model strings use MODELS_DISPLAY;
  sample-report uses 443 / 47; methodology uses 35).
  Next-natural options:
  (a) Return to a broader roadmap — pick a fresh
      product angle.
  (b) *Optional*: surface the automated source
      registry size (`sources.yaml` = 8) somewhere on
      the methodology page's "Automation status"
      section, if that's useful signal for readers.
      Small yellow copy task; not urgent.
  (c) *Optional*: build-time codegen for
      `WEB_BUNDLE_STATS` (documented as low-priority
      since P1.7b).
  (d) *Optional*: corpus regeneration (pipeline
      task, separate scope-and-approve loop).
- **Do NOT** start corpus refresh as a side effect.
- **Do NOT** start any AgentOps-2* work (per Q10
  pause).
- **Do NOT** modify `.agent/scripts/**` (hard rule).
- **Do NOT** lift BLK-0001 / BLK-0002 / BLK-0003.
- **Do NOT** modify runtime API-route model selection
  or prompts as a side effect.

## Ready for review

`yes`

## Requires human decision

`yes` — required before push of `main`. The web repo
currently has one unpushed commit (`33fc11a` — TASK +
methodology edit); the RUN_REPORT commit (this file)
will be the second; the matching DECISION commit will
be the third. All three wait on human GO before going
to `origin/main`.

Approval of this DECISION ships the credibility-copy
fix to production (Vercel auto-deploys on `main`
push; served copy will change on the `/methodology`
route). Approving does NOT approve: (a) any runtime
model-selection change, (b) any prompt change, (c)
any corpus regeneration / pipeline work, (d) any
AgentOps-2* work, (e) any `.agent/scripts/**` mod,
(f) any OpenAI API usage in Q7 blocked sense, (g)
G2.1d, (h) surfacing the source-registry count as a
new methodology claim (would be a separate small
task), (i) lifting any of the 3 open blockers.

> Verdict is technical-execution-only for now.
> Standing policy treats any `main` push as a human
> gate. The user-visible impact of this push is
> intended: aligns methodology page's company-count
> claim with the actual served bundle, closing the
> ambiguity P1.8a explicitly deferred.
