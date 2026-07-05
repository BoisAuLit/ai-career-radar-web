# RUN REPORT · P1.8a sample report credibility copy audit

> Authored by Claude Code after executing TASK
> `2026-07-05_run_02`. Web-repo only — pipeline repo
> untouched. Product-UI copy audit: 4 surgical edits to
> `src/app/sample-report/page.tsx` (1 stale-number fix + 1
> freshness-softening + 1 helper-consistency chip + 1
> archetype-count removal) + 1 new import from the P1.7b
> helper. No runner, daemon, scheduler, cron, GitHub Actions
> change, Codex/Claude config mutation, OpenAI API
> introduction, LLM call, prompt / API-route / runtime-model
> touch, `.agent/scripts/**` edit, or methodology-page
> touch. Scaffolded by
> `python .agent/scripts/new_run_report.py --task-id 2026-07-05_run_02`.

## Metadata

- **task_id**: `2026-07-05_run_02` (matches the TASK file)
- **date**: `2026-07-05`
- **run_number**: `02`
- **branch**: web repo `main` (no branch cut — yellow
  product-UI small-diff task, same direct-on-`main` pattern
  P1.7b (`1c912f8`) and P1.7c (`c0a0df3`) used)

## Commits

**Web repo (`/Users/bohaoli/Desktop/ai-career-radar-web`):**
- `c8d30f4` (already on `main` and `origin/main` before
  this run; P1.7c cleanup + `2026-07-05_SUMMARY.md`
  created)
- `34d5cc8` Polish sample report credibility copy (this
  run; 2 files in one commit: TASK + `sample-report/page.tsx`
  edit)
- *(forthcoming)* Add RUN_REPORT 2026-07-05_run_02 (this
  file)

**Pipeline repo (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`):**
- `none` (pipeline repo not touched; read-only sanity
  check only; HEAD remains `b019786` at start and end of
  run)

## Files changed

**Web repo (this run, vs `HEAD` at run start = `c8d30f4`):**

```
 .agent/tasks/2026-07-05_run_02_TASK.md   | 344 ++++++++++++++++++++++++++++
 src/app/sample-report/page.tsx           |  15 +++++-----
 .agent/run_reports/2026-07-05_run_02_RUN_REPORT.md | <this file>
 3 files changed (2 committed in 34d5cc8, 1 forthcoming)
```

- `.agent/tasks/2026-07-05_run_02_TASK.md` — NEW, 344
  lines. TASK spec. Cites preflight `grep` findings + a
  per-site verdict on every credibility-adjacent string
  under `src/app/sample-report/` and
  `src/app/methodology/`. Verdict: 4 must-fix in
  sample-report, methodology entirely leave-alone,
  fictional percentages leave-alone (consistent with the
  page's own "Sample · fictional" disclosure banner).
- `src/app/sample-report/page.tsx` — EDITED, **`+8/-7`**.
  Five surgical changes (1 import + 4 copy substitutions):
  - Line 11: added
    `import { WEB_BUNDLE_STATS } from "@/lib/web-bundle-stats"`.
  - Line 33 (navbar chip): `443 real JDs` →
    `{WEB_BUNDLE_STATS.totalJds} tracked JDs`. Two
    changes here — hardcoded `443` now traces to the
    helper (same 443 renders), and `real` softens to
    `tracked` for consistency with methodology + P1.7b
    language.
  - Line 63 (disclosure banner): "The real tool reads
    your actual resume and the **live** JD corpus." →
    "…and the **tracked** JD corpus." Fixes the
    unsupported freshness claim ("live" implies real-time
    when the corpus is a ~6-week-old May 2026 snapshot
    per the methodology page's own admission).
  - Line 94 (header chip): `Based on 92 applied_ai JDs`
    → `Based on {WEB_BUNDLE_STATS.appliedAiJds}
    applied_ai JDs`. **This is the same stale mock
    number P1.7b corrected on the homepage** —
    sample-report was missed in the P1.7b cleanup scope.
    Rendered value goes 92 → 47, matching what the
    homepage already displays.
  - Line 342-346 ("Honest note"): "…classifies your
    stated target into one of **8** archetypes, then
    grounds every claim in real percentages from the JD
    corpus…" → "…classifies your stated target into an
    archetype, then grounds every claim in real
    percentages from the **tracked** JD corpus…". Two
    changes here — removes the fragile "8" count (G2.1
    taxonomy actually has 11 included archetypes + 2
    reject sidecars, so "8" is stale; removing the
    specific number is safer than substituting a
    different one because I don't know which archetype
    set the running classifier is actually using), and
    adds "tracked" to the JD-corpus phrase for
    consistency with lines 33 and 63.
- `.agent/run_reports/2026-07-05_run_02_RUN_REPORT.md` —
  this file (forthcoming commit).

**Empty diff verified on every other path**:
`src/app/methodology/page.tsx` (entirely leave-alone per
TASK verdict), `src/app/page.tsx`, `src/app/api/**`
(runtime model selection), `src/app/lab/**`,
`src/app/snapshot-pipeline/**`, `src/app/layout.tsx`,
`src/app/opengraph-image.tsx`, `src/components/**`,
`src/lib/prompts.ts`, `src/lib/corpus.ts`,
`src/lib/types.ts`, `src/lib/eval-report.ts`,
`src/lib/extract-pdf.ts`,
`src/lib/web-bundle-stats.ts` (only *imported*),
`src/lib/models-display.ts`, `src/data/**`, `package.json`,
`package-lock.json`, `.env*`, `.github/workflows/**`,
`vercel.json`, `.vercel/**`, `.agent/policies/**`,
`.agent/templates/**`, `.agent/scripts/**` (hard rule per
Q3-Q8), `.agent/blockers.md`, `.agent/automation_queue.md`.

**Pipeline repo:** no diff. Confirmed via `git status` on
`main` — `nothing to commit, working tree clean` at run
start and end; HEAD = `b019786` at both points.

## Summary

Implemented TASK `2026-07-05_run_02` per spec. The
sample-report page now:

- **Displays the correct `47 applied_ai JDs`** (was 92 —
  stale mock) via `WEB_BUNDLE_STATS.appliedAiJds`.
  This closes the last remaining site where the P1.7b
  hero-numbers fix hadn't reached.
- **Displays `443 tracked JDs`** in the navbar chip via
  `WEB_BUNDLE_STATS.totalJds` (was hardcoded `443` and
  labeled `real`). Rendered value unchanged (443 = 443),
  but the label softens to `tracked` for evidence-grounded
  framing.
- **Softens the freshness claim** in the disclosure
  banner: `live JD corpus` → `tracked JD corpus`. The
  corpus is a ~6-week-old May 2026 snapshot per the
  methodology page; "live" overpromised.
- **Removes the fragile `8 archetypes` count** in the
  "Honest note". The G2.1 taxonomy has 11 included +
  2 reject-sidecar archetypes, so "8" was stale; but
  since I don't know which archetype set the running
  classifier actually uses at API-time, the safest fix
  is to drop the specific count entirely. The paragraph's
  argument ("classifies your stated target into an
  archetype, then grounds every claim in real
  percentages") lands unchanged.
- **Softens the JD-corpus phrase in the same paragraph**
  to `tracked JD corpus` for language consistency with
  the navbar chip and disclosure banner. This is a
  minor language tightening bundled with the archetype
  edit; no new claim.

The changes are **copy-only**. The methodology page is
entirely untouched — its "approximately 40 companies"
claims likely refer to the `sources.yaml` registry (not
the current bundle's 35 companies) and modifying them
without visibility into `sources.yaml` could silently
break a correct claim. The fictional percentages
throughout the sample-report (38%, 55%, 48% etc.) are
also untouched — they're consistent with the prominent
"Sample · fictional" disclosure banner at the top of
the page.

**No runtime-behavior change.** The API routes under
`src/app/api/**` — which actually select and call the
models and read the bundle — are byte-identical (empty
diff verified). The runtime AI behavior of report
generation, evaluation, and classification is unchanged;
only the sample-report page's static copy about corpus
size / applied_ai count / freshness / archetype count
has been polished.

No changes to `src/lib/prompts.ts`, `src/lib/corpus.ts`,
`src/lib/types.ts`, `src/lib/models-display.ts`,
`src/lib/web-bundle-stats.ts`, `src/data/**`,
`src/app/api/**`, `src/app/methodology/**`,
`src/app/page.tsx`, `src/app/layout.tsx`,
`src/app/opengraph-image.tsx`, `src/app/lab/**`,
`src/app/snapshot-pipeline/**`, `src/components/**`,
`.agent/scripts/**`, `.agent/policies/**`,
`.agent/templates/**`, `.agent/blockers.md`,
`.agent/automation_queue.md`, `.github/workflows/**`,
`vercel.json`, `.vercel/**`, `package.json`,
`package-lock.json`, or `.env*`. No OpenAI API
introduction. No Codex CLI / Claude Code config touched.
No new dependency. No runner / daemon / scheduler / cron
file. No LLM call by this task. No `git push`. No
`vercel deploy`. Pipeline repo untouched.

## Copy issues found + changes made (before/after)

### Issue 1 · stale mock number `92 applied_ai JDs` (must-fix)

**Site**: `src/app/sample-report/page.tsx:93` (was 93,
now 94 after the import line added at line 11).

**Before**:
```tsx
<span className="rounded-full bg-zinc-100 ...">
  Based on 92 applied_ai JDs
</span>
```

**After**:
```tsx
<span className="rounded-full bg-zinc-100 ...">
  Based on {WEB_BUNDLE_STATS.appliedAiJds} applied_ai JDs
</span>
```

**Rendered**: `Based on 92 applied_ai JDs` → `Based on
47 applied_ai JDs`.

**Rationale**: Same stale mock that P1.7b fixed on the
homepage (`page.tsx:764`, `822`). The sample-report was
missed by the P1.7b scope. The current
`src/data/web_bundle.json` has exactly **47** records
with `archetype === "applied_ai"`. Now traces to the
P1.7b helper so future refresh happens in one place.

### Issue 2 · `443 real JDs` navbar chip (must-fix)

**Site**: `src/app/sample-report/page.tsx:32` (now 33
after import).

**Before**:
```tsx
<span className="hidden rounded-full ...">
  443 real JDs
</span>
```

**After**:
```tsx
<span className="hidden rounded-full ...">
  {WEB_BUNDLE_STATS.totalJds} tracked JDs
</span>
```

**Rendered**: `443 real JDs` → `443 tracked JDs`. The
number is unchanged (`n_records` = 443, same as before),
but two things improved:
1. The `443` is now sourced from the helper — future
   corpus regeneration only requires editing
   `web-bundle-stats.ts` once, not grepping for
   hardcoded `443`s.
2. The word `real` softens to `tracked`, matching the
   "evidence-grounded / not a market census" framing
   the methodology page uses. `real` in a navbar
   subtly overpromises; `tracked` matches how the
   corpus is honestly described.

### Issue 3 · `live JD corpus` freshness overclaim (must-fix)

**Site**: `src/app/sample-report/page.tsx:63`.

**Before**:
```tsx
Every name, percentage, and quote on this page is fiction. The real
tool reads your actual resume and the live JD corpus.
```

**After**:
```tsx
Every name, percentage, and quote on this page is fiction. The real
tool reads your actual resume and the tracked JD corpus.
```

**Rationale**: The corpus is a ~6-week-old May 2026
snapshot per the methodology page's own admission (lines
121-122: "The live home page currently serves the May
2026 manually-curated snapshot"). Saying `live JD
corpus` on the sample-report disclosure implies
real-time freshness that isn't there. `tracked JD
corpus` is honest and matches the methodology page's
language.

### Issue 4 · fragile `8 archetypes` count (must-fix, softening)

**Site**: `src/app/sample-report/page.tsx:342-345`.

**Before**:
```tsx
This is a static fictional report. The real product reads your
actual resume, classifies your stated target into one of 8
archetypes, then grounds every claim in real percentages from the
JD corpus and quotes five evidence JDs by ID. The structure you
see here is representative of the real output.
```

**After**:
```tsx
This is a static fictional report. The real product reads your
actual resume, classifies your stated target into an archetype,
then grounds every claim in real percentages from the tracked JD
corpus and quotes five evidence JDs by ID. The structure you see
here is representative of the real output.
```

**Rationale**: G2.1 taxonomy has 11 included archetypes
+ 2 reject sidecars (per `corpus/taxonomy/G2.1_spec.md`
in the pipeline repo). "8" was possibly correct for an
older classifier version, but I can't verify which
version the running classifier is using at API time
(that would require reading `src/app/api/**`, which is
forbidden this task). Safest fix: **drop the specific
number** and let the paragraph make its qualitative
point ("classifies your stated target into an
archetype") without a fragile count claim. Also
folded in `JD corpus` → `tracked JD corpus` for
language consistency with lines 33 and 63.

### Explicitly left unchanged

- **All fictional percentages** on the sample-report
  (38%, 55%, 48%, 31%, 27%, 19%, plus per-JD-count
  labels). The page has a prominent "Sample · fictional"
  disclosure banner (line 57-65) that explicitly says
  every percentage is fiction. Changing these would
  break the framing.
- **All example JD citations** (`Anthropic · jd_000017`,
  `Cursor · jd_000412`, etc.). Fictional but consistent
  with the disclosure banner.
- **`src/app/methodology/page.tsx` entirely** —
  including its three "40 companies" mentions.
  Methodology is a well-written whitepaper-style page;
  its `40` likely refers to the `sources.yaml` registry
  size, not the bundle's 35 unique companies.
  Substituting `35` without visibility into
  `sources.yaml` could silently break a correct claim.
- **`src/app/page.tsx`** — homepage sample-report link
  copy is already consistent with P1.7b/c framing.
- **Fictional archetype/skill blurbs and example
  companies in `page.tsx`** — content, not
  runtime-model claims.

## Constraints checked

### Web repo

- [x] `src/app/methodology/page.tsx` — untouched (empty
      diff verified). Verdict: leave alone.
- [x] `src/app/page.tsx` — untouched (empty diff).
      Verdict from preflight: homepage already
      consistent with P1.7b/c.
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
- [x] `src/data/**` — untouched.
- [x] `package.json` / `package-lock.json` — untouched
      (no new deps).
- [x] `.env*` — untouched.
- [x] `.github/workflows/**` — untouched.
- [x] `vercel.json` — does not exist in this repo tree;
      trivially satisfied.
- [x] `.vercel/**` — untouched.
- [x] `.agent/policies/**` — untouched.
- [x] `.agent/templates/**` — untouched.
- [x] `.agent/scripts/**` — **untouched** (hard rule
      per AgentOps-2c DECISION Q3-Q8; verified empty
      diff).
- [x] `.agent/blockers.md` — untouched.
- [x] `.agent/automation_queue.md` — untouched.
- [x] `.agent/README.md` — untouched.

### Pipeline repo

- [x] **All files** — untouched. Pipeline `git status`
      clean at start and end; HEAD unchanged at
      `b019786`.

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
      never invoked.
- [x] **`npm run …` invocation** — `npm run lint` and
      `npm run build` invoked as approved by the TASK's
      Validation section. `npm run screenshot` NOT
      invoked (same rationale as P1.7b/c: pure copy
      substitution, no styling change, build's
      successful 14/14 static generation already
      verifies rendering).
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
  `src/app/sample-report/page.tsx` — all yellow per
  policy §6 for a small copy-audit change.
- G2.1d (red) **not attempted** in this run.
  QUEUE-0002 still `blocked_pending_human`.

## Validation results

```
=== file presence + sizes ===
.agent/tasks/2026-07-05_run_02_TASK.md   344 lines
src/app/sample-report/page.tsx           +8 / -7  (surgical: 1 import + 4 copy edits)
.agent/run_reports/2026-07-05_run_02_RUN_REPORT.md   <this file> (forthcoming)

=== git status --short (pre-commit) ===
 M src/app/sample-report/page.tsx
?? .agent/tasks/2026-07-05_run_02_TASK.md

=== git diff --stat (pre-commit) ===
 src/app/sample-report/page.tsx | 15 ++++++++-------
 1 file changed, 8 insertions(+), 7 deletions(-)

=== post-commit (34d5cc8) ===
[main 34d5cc8] Polish sample report credibility copy
 2 files changed, 351 insertions(+), 7 deletions(-)
 create mode 100644 .agent/tasks/2026-07-05_run_02_TASK.md

=== sample-report spot-checks ===
$ grep -n 'WEB_BUNDLE_STATS' src/app/sample-report/page.tsx
11: import { WEB_BUNDLE_STATS } from "@/lib/web-bundle-stats";
33: {WEB_BUNDLE_STATS.totalJds} tracked JDs
94: Based on {WEB_BUNDLE_STATS.appliedAiJds} applied_ai JDs

$ grep -n '443 real\|"443"\|"92"\|>92<\|Based on 92\|live JD corpus\|8 archetypes' src/app/sample-report/page.tsx
(no output — all 4 target strings replaced) ✓

=== methodology empty diff ===
$ git diff --stat HEAD~1 HEAD -- src/app/methodology/
(empty ✓ — methodology entirely untouched)

=== forbidden audit (vs HEAD~1 post-commit) ===
all forbidden paths — empty diff ✓
(src/lib/prompts.ts src/lib/corpus.ts src/lib/types.ts
 src/lib/eval-report.ts src/lib/extract-pdf.ts
 src/lib/web-bundle-stats.ts src/lib/models-display.ts
 src/data/ package.json package-lock.json src/app/api/
 src/app/layout.tsx src/app/opengraph-image.tsx
 src/app/lab/ src/app/snapshot-pipeline/ src/app/page.tsx
 src/app/methodology/ src/components/ .agent/policies/
 .agent/templates/ .agent/scripts/ .agent/blockers.md
 .agent/automation_queue.md .github/workflows/
 vercel.json .vercel/)

=== npm run lint ===
37 errors, 0 warnings — all PRE-EXISTING baseline errors
(unescaped entities on multiple pages; one
setState-in-effect at src/app/page.tsx:473 — line
number unchanged from P1.7c since P1.8a only touches
sample-report, which has no lint errors). Baseline
unchanged from P1.7c in substance and location.

=== npm run build ===
✓ Compiled successfully
Running TypeScript ...
Finished TypeScript ...
Generating static pages using 15 workers (14/14) in 405ms ✓

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/classify, /api/companies, /api/eval-report,
│    /api/extract-pdf, /api/generate-report
├ ○ /lab, /methodology, /opengraph-image, /sample-report,
│    /snapshot-pipeline

No new bundle-size warnings. The
`src/app/sample-report/page.tsx` chunk picks up a small
constant reference to `WEB_BUNDLE_STATS` (already in
the client bundle from P1.7b via `src/app/page.tsx`
import); no incremental bundle-size cost.

=== pipeline read-only sanity ===
$ git status (pipeline)
On branch main · up to date with origin/main · clean
$ git rev-parse HEAD (pipeline)
b0197867d93e50e60f84f8aefc7c71ee792d3006   ← unchanged

=== Acceptance criteria coverage (manual ✓) ===
1.  Line 32/33 navbar chip uses totalJds + tracked          ✓
2.  Line 63 "live" softens (removes "live" in JD phrase)    ✓
3.  Line 93/94 "92" → appliedAiJds (renders 47)             ✓
4.  Line 342 "8 archetypes" count removed                   ✓
5.  New WEB_BUNDLE_STATS import at top of sample-report     ✓ (line 11)
6.  methodology/page.tsx empty diff                         ✓
7.  page.tsx empty diff                                     ✓
8.  web-bundle-stats.ts untouched (only imported)           ✓
9.  models-display.ts untouched                             ✓
10. prompts.ts / corpus.ts / api/** / data/** untouched     ✓
11. No forbidden file modified                              ✓
12. npm run lint passes (baseline unchanged)                ✓
13. npm run build passes (14/14 static, TS clean)           ✓
14. git diff --stat only allowed paths                      ✓
15. No git push performed                                   ✓
16. No DECISION file created                                ✓
17. Pipeline HEAD = b019786 unchanged                       ✓
```

## Build result

`pass` — `npm run build` succeeded (14/14 static routes
generated; TypeScript clean; no bundle-size warnings; no
incremental cost because `WEB_BUNDLE_STATS` was already
in the shared client bundle from P1.7b via `page.tsx`).

## Tests result

`n/a` — this repo has no automated test framework;
validation was lint + build + manual structural checks
(recorded above).

## Screenshots

`not-run` — deliberately skipped for this loop.

- The TASK's Validation Commands listed `npm run lint`
  + `npm run build`, NOT `npm run screenshot`.
- Same rationale as P1.7b / P1.7c: pure copy
  substitution, no styling / layout / component
  structure change. `npm run build`'s successful 14/14
  static generation already verifies that the
  sample-report page renders. The user-visible impact
  (`92 → 47`, `live → tracked`, etc.) is verifiable
  from the diff itself.

## Risks

1. **`8 archetypes` removed — no new number substituted.**
   This is deliberately conservative: I don't have
   visibility into which archetype set the running
   classifier at API time actually uses, and putting a
   wrong specific number would be worse than removing
   the count. Severity: **low / by design**.
   Mitigation: if a future TASK confirms the classifier
   version and the true archetype count is stable and
   worth surfacing, that TASK can add it back with a
   grounded reference (e.g. via `MODELS_DISPLAY` or a
   new small helper).
2. **The `WEB_BUNDLE_STATS.appliedAiJds` = 47 render
   depends on a manually-synced constant.** Same P1.7b
   maintenance risk applies: if the bundle regenerates,
   the constant must be refreshed. Mitigation: same as
   P1.7b — JSDoc names the refresh command.
3. **Methodology page NOT touched.** Deliberate. The
   `~40 companies` claims there might refer to
   `sources.yaml` registry (companies configured to be
   fetched), not to `web_bundle.json`'s 35 unique
   companies. Substituting `35` without verifying could
   silently break a correct claim. Severity: **low /
   accepted**. Mitigation: if a future TASK verifies
   the source registry, methodology can be updated
   separately.
4. **Baseline lint has 37 pre-existing errors.** None
   introduced by P1.8a; line-number of the
   setState-in-effect warning is unchanged from P1.7c
   because P1.8a only touched `sample-report/page.tsx`
   (which has no lint errors). Severity: **low /
   pre-existing**.
5. **Push will trigger Vercel auto-deploy AND
   user-visible copy change.** Unlike P1.7c (which was
   byte-identical), this push visibly updates the
   sample-report page: `92 applied_ai JDs → 47`,
   `443 real JDs → 443 tracked JDs`, `live → tracked`,
   `8 archetypes → an archetype`. Severity: **medium /
   intended**. Mitigation: this is exactly the
   credibility-copy fix the task asked for; the fixes
   align sample-report with what the homepage already
   says.
6. **Push is gated.** Web is ahead of `origin/main` by
   1 commit now (`34d5cc8`); after RUN_REPORT commit,
   by 2; after DECISION commit, by 3. None pushed
   until Bohao explicitly approves. Severity: **n/a by
   design**.

## Follow-up recommendations

- **Next: Human + ChatGPT review** of this RUN_REPORT
  and the diff at commit `34d5cc8`. Quick read: 5
  substitutions in one file. `git show 34d5cc8 --
  src/app/sample-report/page.tsx` shows the exact
  before/after.
- **Then: DECISION** via
  `python .agent/scripts/new_decision.py --task-id 2026-07-05_run_02`.
  Approval gates pushing this loop's commits
  (`34d5cc8` + forthcoming RUN_REPORT commit +
  forthcoming DECISION commit).
- **Then (only if DECISION = approve)**: the natural
  next steps are:
  (a) Another small product credibility angle Bohao has
      in mind.
  (b) Optional: verify the source-registry size and
      update methodology's "~40 companies" mentions
      (still yellow, still small).
  (c) Optional: return to a broader UX polish or
      feature surface.
- **Do NOT** start corpus refresh as a side effect of
  approving this DECISION.
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
currently has one unpushed commit (`34d5cc8` — TASK +
sample-report edit); the RUN_REPORT commit (this file)
will be the second; the matching DECISION commit will
be the third. All three wait on human GO before going
to `origin/main`.

Approval of this DECISION ships the credibility-copy
fix to production (Vercel auto-deploys on `main` push;
served copy will change on the `/sample-report` route
— hero chip shows `47 applied_ai JDs` instead of `92`,
navbar chip shows `443 tracked JDs` instead of `443
real JDs`, disclosure says `tracked JD corpus` instead
of `live JD corpus`, "Honest note" says `an archetype`
instead of `8 archetypes`). Approving does NOT
approve: (a) any runtime model-selection change, (b)
any prompt change, (c) any corpus regeneration /
pipeline work, (d) any AgentOps-2* work, (e) any
`.agent/scripts/**` mod, (f) any methodology-page
edit, (g) any OpenAI API usage, (h) G2.1d, (i)
lifting any of the 3 open blockers.

> Verdict is technical-execution-only for now.
> Standing policy treats any `main` push as a human
> gate. The user-visible impact of this push is
> intended: closes the last leaked P1.7b hero-number
> stale-mock site + tightens sample-report freshness
> language for evidence-grounded framing.
