# RUN REPORT · P1.7c model-string single source of truth

> Authored by Claude Code after executing TASK
> `2026-07-05_run_01`. Web-repo only — pipeline repo untouched.
> Product-UI change: centralizes the 4 hardcoded runtime-model
> version strings (`Sonnet 4.6` / `Haiku 4.5` / their `Claude`-
> prefixed variants) into a single new display-only helper
> `src/lib/models-display.ts`. No runner, daemon, scheduler,
> cron, GitHub Actions change, Codex/Claude config mutation,
> OpenAI API introduction, LLM call, prompt / API-route /
> runtime-model-selection touch, or `.agent/scripts/**` edit.
> Scaffolded by
> `python .agent/scripts/new_run_report.py --task-id 2026-07-05_run_01`.

## Metadata

- **task_id**: `2026-07-05_run_01` (matches the TASK file)
- **date**: `2026-07-05`
- **run_number**: `01`
- **branch**: web repo `main` (no branch cut — yellow product-UI
  small-diff task, same direct-on-`main` pattern P1.7b
  (`1c912f8`) used)

## Commits

**Web repo (`/Users/bohaoli/Desktop/ai-career-radar-web`):**
- `f2f235a` (already on `main` and `origin/main` before this
  run; P1.7b cleanup)
- `c0a0df3` Centralize model display strings (this run; 4
  files in one commit: TASK + helper + `page.tsx` edit +
  `lab/page.tsx` edit)
- *(forthcoming)* Add RUN_REPORT 2026-07-05_run_01 (this file)

**Pipeline repo (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`):**
- `none` (pipeline repo not touched; read-only sanity check
  only; HEAD remains `b019786` at start and end of run)

## Files changed

**Web repo (this run, vs `HEAD` at run start = `f2f235a`):**

```
 .agent/tasks/2026-07-05_run_01_TASK.md   | 393 +++++++++++++++++++++++++++++
 src/lib/models-display.ts                |  34 +++++++++++++++
 src/app/page.tsx                         |   9 +++++----
 src/app/lab/page.tsx                     |   3 ++-
 .agent/run_reports/2026-07-05_run_01_RUN_REPORT.md | <this file>
 5 files changed (4 committed in c0a0df3, 1 forthcoming)
```

- `.agent/tasks/2026-07-05_run_01_TASK.md` — NEW, 393 lines.
  TASK spec. Cites preflight `grep` findings: 4 hardcoded
  runtime-model-version sites (`page.tsx:1067-1068`,
  `page.tsx:1122`, `page.tsx:1639`, `lab/page.tsx:245`);
  other Claude/Anthropic/OpenAI mentions are corpus content
  / SEO keywords / provider-only refs (out of scope).
- `src/lib/models-display.ts` — NEW, **34 lines**. Exports
  a single `MODELS_DISPLAY` const with 5 primitive string
  fields (`provider: "Anthropic"`,
  `generationModel: "Claude Sonnet 4.6"`,
  `generationModelShort: "Sonnet 4.6"`,
  `evalModel: "Claude Haiku 4.5"`,
  `evalModelShort: "Haiku 4.5"`) and a JSDoc comment
  naming the source (`src/app/api/**` runtime selection),
  the 3-step refresh procedure when runtime models change,
  and the authoring-time snapshot date (2026-07-05).
  **Does NOT import** `@anthropic-ai/sdk`, `@/lib/prompts`,
  `@/lib/corpus`, or anything under `@/app/api/**`
  (verified `grep -c` = 0). **No `fetch(` or module-scope
  `await`** (verified `grep -c` = 0). Pure static
  constants.
- `src/app/page.tsx` — EDITED, `+5/-4`. Four surgical
  changes:
  - Line 9: added
    `import { MODELS_DISPLAY } from "@/lib/models-display"`.
  - Lines 1068-1069: "Anthropic's API (Claude Sonnet 4.6 for
    generation, Haiku 4.5 …)" →
    `{MODELS_DISPLAY.provider}'s API ({MODELS_DISPLAY.generationModel}
    for generation, {MODELS_DISPLAY.evalModelShort} …)`.
  - Line 1123: "Two LLM calls (Sonnet 4.6 + Haiku 4.5)" →
    `Two LLM calls ({MODELS_DISPLAY.generationModelShort}
    + {MODELS_DISPLAY.evalModelShort})`.
  - Line 1640: "Claude Sonnet 4.6 (generation) · Haiku 4.5
    (eval) · Single-shot, evidence-grounded." →
    `{MODELS_DISPLAY.generationModel} (generation) ·
    {MODELS_DISPLAY.evalModelShort} (eval) · Single-shot,
    evidence-grounded.`.
- `src/app/lab/page.tsx` — EDITED, `+2/-1`. Two surgical
  changes:
  - Line 13: added
    `import { MODELS_DISPLAY } from "@/lib/models-display"`.
  - Line 246: "3-metric LLM-as-judge (Claude Haiku 4.5) over
    each" → `3-metric LLM-as-judge ({MODELS_DISPLAY.evalModel})
    over each`.
- `.agent/run_reports/2026-07-05_run_01_RUN_REPORT.md` —
  this file (forthcoming commit).

Other `src/**` paths are untouched: `src/lib/prompts.ts`,
`src/lib/corpus.ts`, `src/lib/types.ts`,
`src/lib/eval-report.ts`, `src/lib/extract-pdf.ts`,
`src/lib/web-bundle-stats.ts`, all of `src/app/api/**`,
`src/app/layout.tsx`, `src/app/opengraph-image.tsx`,
`src/app/methodology/page.tsx`,
`src/app/sample-report/page.tsx`,
`src/app/snapshot-pipeline/page.tsx`, `src/components/**`,
`src/data/**`. Verified via `git diff --stat HEAD` — empty.

**Pipeline repo:** no diff. Confirmed via `git status` on
`main` — `nothing to commit, working tree clean` at run
start and end; HEAD = `b019786` at both points.

## Summary

Implemented TASK `2026-07-05_run_01` per spec. The runtime
model labels displayed to users are now sourced from a single
`MODELS_DISPLAY` const in `src/lib/models-display.ts`:

- Legal / privacy disclosure ("Sent to: Anthropic's API
  (Claude Sonnet 4.6 for generation, Haiku 4.5 if you run
  the eval)") — now uses `provider` + `generationModel` +
  `evalModelShort`.
- Cost / time strip ("Two LLM calls (Sonnet 4.6 + Haiku
  4.5)") — now uses `generationModelShort` +
  `evalModelShort`.
- Footer attribution ("Claude Sonnet 4.6 (generation) ·
  Haiku 4.5 (eval)") — now uses `generationModel` +
  `evalModelShort`.
- Lab methodology footer ("3-metric LLM-as-judge (Claude
  Haiku 4.5)") — now uses `evalModel`.

Two label variants (long-form `Claude Sonnet 4.6` +
short-form `Sonnet 4.6`) are exported so each use site can
pick the copy that fits its context without duplicating
the version string.

The helper file `src/lib/models-display.ts` is deliberately
**34 lines of primitive constants** with a JSDoc comment
naming the source (runtime API routes under
`src/app/api/**`), the 3-step refresh procedure, and the
authoring-time snapshot date. It does NOT import
`@anthropic-ai/sdk`, `@/lib/prompts`, `@/lib/corpus`, or
anything under `@/app/api/**`. It performs no fetch and no
module-scope `await`.

**No runtime-behavior change.** The API routes under
`src/app/api/**` — which actually select and call the
models — are byte-identical (empty diff verified). The
runtime AI behavior of report generation, evaluation, and
classification is unchanged; only the UI copy about which
models are used is now centralized.

No changes to `src/lib/prompts.ts`, `src/lib/corpus.ts`,
`src/lib/types.ts`, `src/data/**`, `src/app/api/**`,
`src/app/layout.tsx`, `src/app/opengraph-image.tsx`,
`src/app/methodology/page.tsx`,
`src/app/sample-report/page.tsx`,
`src/app/snapshot-pipeline/page.tsx`, `src/components/**`,
`src/lib/web-bundle-stats.ts`, `.agent/scripts/**`,
`.agent/policies/**`, `.agent/templates/**`,
`.agent/blockers.md`, `.agent/automation_queue.md`,
`.github/workflows/**`, `vercel.json`, `.vercel/**`,
`package.json`, `package-lock.json`, or `.env*`. No OpenAI
API introduction. No Codex CLI / Claude Code config
touched. No new dependency. No runner / daemon /
scheduler / cron file. No LLM call by this task. No
`git push`. No `vercel deploy`. Pipeline repo untouched.

## Constraints checked

### Web repo

- [x] `src/lib/prompts.ts` — untouched (empty diff)
- [x] `src/lib/corpus.ts` — untouched
- [x] `src/lib/types.ts` — untouched (helper uses inline
      `as const`; no type addition to shared file)
- [x] `src/lib/eval-report.ts`, `src/lib/extract-pdf.ts`,
      `src/lib/web-bundle-stats.ts` — untouched
- [x] `src/lib/anthropic.ts` — does not exist in this repo
      (verified in P1.7b); constraint trivially satisfied
- [x] `src/app/api/**` (classify / companies / eval-report
      / extract-pdf / generate-report) — untouched; **all
      runtime model selection and invocation logic stays
      frozen**
- [x] `src/data/**` — untouched (no `web_bundle.json` /
      `web_bundle_pipeline.json` / `lab/**` edit)
- [x] `src/app/layout.tsx` — untouched (SEO keyword array
      not edited)
- [x] `src/app/opengraph-image.tsx` — untouched
- [x] `src/app/methodology/page.tsx`,
      `src/app/sample-report/page.tsx`,
      `src/app/snapshot-pipeline/page.tsx` — all untouched
- [x] `src/components/**` — untouched
- [x] `package.json` / `package-lock.json` — untouched (no
      new deps)
- [x] `.env*` — untouched
- [x] `.github/workflows/**` — untouched
- [x] `vercel.json` — does not exist in this repo tree;
      trivially satisfied
- [x] `.vercel/**` — untouched
- [x] `.agent/policies/**` — untouched (policy at v1.1)
- [x] `.agent/templates/**` — untouched
- [x] `.agent/scripts/**` — **untouched** (hard rule per
      AgentOps-2c DECISION Q3-Q8; verified empty diff)
- [x] `.agent/blockers.md` — untouched (BLK-0001 /
      BLK-0002 / BLK-0003 all still `open`)
- [x] `.agent/automation_queue.md` — untouched this task
      (queue transitions reserved for B-time)
- [x] `.agent/README.md` — untouched

### Pipeline repo

- [x] **All files** — untouched. Pipeline `git status`
      clean at start and end; HEAD unchanged at
      `b019786`.

### Tool config and external integrations

- [x] **OpenAI API SDK / key / `.env` entry / HTTP call /
      import / CI secret / background token** — none
      introduced (per Q7 blocked sense). The helper's
      comment mentions "Anthropic" as the provider brand;
      no OpenAI mention.
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
      invoked (same rationale as P1.7b: pure numeric /
      string substitution, no styling change, build's
      successful 14/14 static generation already verifies
      rendering). `npm run collect` NOT invoked.
- [x] **LLM call** — no `anthropic` / `openai` SDK
      invocation by this run. (The app *at runtime* calls
      Anthropic; this task did not.)
- [x] **Automation runner / daemon / scheduler / cron
      file creation** — none.
- [x] **Queue / blocker state changes** — none.
      QUEUE-0001 / QUEUE-0006 / QUEUE-0007 / QUEUE-0008
      all still `done`. QUEUE-0002 still
      `blocked_pending_human`. QUEUE-0003 / QUEUE-0004 /
      QUEUE-0005 unchanged. BLK-0001 / BLK-0002 /
      BLK-0003 all still `open`.

## Red-zone check

- Red-zone files modified this run: **none**.
- Approval reference: N/A. The 4 changed/new files land
  under `.agent/tasks/`, `src/lib/` (new helper), and
  two `src/app/**/page.tsx` files — all yellow per
  policy §6 for a small UI-copy consolidation. No
  `src/lib/prompts.ts` / `src/app/api/**` /
  `src/data/**` touched.
- G2.1d (red) **not attempted** in this run. QUEUE-0002
  still `blocked_pending_human`.

## Validation results

```
=== file presence + sizes ===
.agent/tasks/2026-07-05_run_01_TASK.md    393 lines
src/lib/models-display.ts                 34 lines (≤50 cap)
src/app/page.tsx                          +5 / -4  (surgical: 1 import + 3 substitutions)
src/app/lab/page.tsx                      +2 / -1  (surgical: 1 import + 1 substitution)
.agent/run_reports/2026-07-05_run_01_RUN_REPORT.md   <this file> (forthcoming)

=== git status --short (pre-commit) ===
 M src/app/lab/page.tsx
 M src/app/page.tsx
?? .agent/tasks/2026-07-05_run_01_TASK.md
?? src/lib/models-display.ts

=== git diff --stat (pre-commit) ===
 src/app/lab/page.tsx | 3 ++-
 src/app/page.tsx     | 9 +++++----
 2 files changed, 7 insertions(+), 5 deletions(-)

=== post-commit (c0a0df3) ===
[main c0a0df3] Centralize model display strings
 4 files changed, 406 insertions(+), 5 deletions(-)
 create mode 100644 .agent/tasks/2026-07-05_run_01_TASK.md
 create mode 100644 src/lib/models-display.ts

=== helper structural checks ===
$ wc -l src/lib/models-display.ts
34   (≤ 50-line cap)

$ grep -c 'from "@anthropic-ai\|from "@/lib/prompts\|from "@/lib/corpus\|from "@/app/api' src/lib/models-display.ts
0   ✓ (no runtime imports)

$ grep -c 'fetch(\|await ' src/lib/models-display.ts
0   ✓ (no side effect)

=== UI spot-checks ===
$ grep -n 'Sonnet 4\.6\|Haiku 4\.5' src/app/page.tsx src/app/lab/page.tsx
(no output — no lingering hardcoded model versions in edited files) ✓

$ grep -n 'MODELS_DISPLAY' src/app/page.tsx src/app/lab/page.tsx
src/app/lab/page.tsx:13:  import { MODELS_DISPLAY } from "@/lib/models-display";
src/app/lab/page.tsx:246: 3-metric LLM-as-judge ({MODELS_DISPLAY.evalModel}) over each
src/app/page.tsx:9:    import { MODELS_DISPLAY } from "@/lib/models-display";
src/app/page.tsx:1068: {MODELS_DISPLAY.provider}'s API ({MODELS_DISPLAY.generationModel} for
src/app/page.tsx:1069: generation, {MODELS_DISPLAY.evalModelShort} if you run the eval). Nothing else.
src/app/page.tsx:1123: <span>Two LLM calls ({MODELS_DISPLAY.generationModelShort} + {MODELS_DISPLAY.evalModelShort})</span>
src/app/page.tsx:1640: {MODELS_DISPLAY.generationModel} (generation) · {MODELS_DISPLAY.evalModelShort} (eval) · Single-shot, evidence-grounded.

=== forbidden audit (vs HEAD~1 post-commit) ===
all forbidden paths — empty diff ✓
(src/lib/prompts.ts src/lib/corpus.ts src/lib/types.ts
 src/lib/eval-report.ts src/lib/extract-pdf.ts
 src/lib/web-bundle-stats.ts src/data/ package.json
 package-lock.json src/app/api/ src/app/layout.tsx
 src/app/opengraph-image.tsx src/app/methodology/
 src/app/sample-report/ src/app/snapshot-pipeline/
 src/components/ .agent/policies/ .agent/templates/
 .agent/scripts/ .agent/blockers.md
 .agent/automation_queue.md .github/workflows/
 vercel.json .vercel/)

=== npm run lint ===
37 errors, 0 warnings — all PRE-EXISTING baseline errors
(unescaped entities on multiple pages; one
setState-in-effect at src/app/page.tsx:473 — line shifted
+1 from the P1.7b baseline of 472 because P1.7c added 1
new import at the top). None reference this run's edits;
none of the errors point to the model-string substitution
sites (lines 1068-1069, 1123, 1640 in page.tsx; line 246
in lab/page.tsx). Baseline unchanged from P1.7b in
substance.

=== npm run build ===
✓ Compiled successfully
Running TypeScript ...
Finished TypeScript ...
Generating static pages using 15 workers (14/14) in 411ms ✓

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/classify, /api/companies, /api/eval-report,
│    /api/extract-pdf, /api/generate-report
├ ○ /lab, /methodology, /opengraph-image, /sample-report,
│    /snapshot-pipeline

No new bundle-size warnings. The helper adds ~200 bytes of
constants to the client bundle chunk — negligible.

=== pipeline read-only sanity ===
$ git status (pipeline)
On branch main · up to date with origin/main · clean
$ git rev-parse HEAD (pipeline)
b0197867d93e50e60f84f8aefc7c71ee792d3006   ← unchanged

=== Acceptance criteria coverage (manual ✓) ===
1.  Helper exists, ≤50 lines, primitive constants          ✓ (34 lines)
2.  Helper does NOT import SDK / prompts / corpus / API   ✓
3.  Helper does NOT call any API / no side effect         ✓
4.  page.tsx 1067-1068 → uses generationModel + evalModelShort  ✓
5.  page.tsx 1122 → uses generationModelShort + evalModelShort  ✓
6.  page.tsx 1639 → uses generationModel + evalModelShort  ✓
7.  lab/page.tsx 245 → uses evalModel                     ✓
8.  prompts.ts / corpus.ts / types.ts / anthropic.ts      ✓
    (not present) / api/** untouched
9.  src/data/** untouched                                  ✓
10. layout.tsx / opengraph / methodology / sample-report / ✓
    snapshot-pipeline / components untouched
11. package.json / package-lock.json untouched            ✓
12. .agent/scripts/** untouched (hard rule)               ✓
13. .agent/blockers.md / .agent/automation_queue.md       ✓
14. npm run lint passes (baseline unchanged)              ✓
15. npm run build passes (14/14 static, TS clean)         ✓
16. git diff --stat only allowed paths                     ✓
17. No forbidden file modified                            ✓
18. No git push performed                                 ✓
19. No DECISION file created                              ✓
20. Pipeline HEAD = b019786 unchanged                     ✓
```

## Build result

`pass` — `npm run build` succeeded (14/14 static routes
generated; TypeScript clean; no bundle-size warnings; the
helper's ~200 bytes of string constants add a negligible
increment to the client chunk).

## Tests result

`n/a` — this repo has no automated test framework;
validation was lint + build + manual structural checks
(recorded above).

## Screenshots

`not-run` — deliberately skipped for this loop.

- The TASK's Validation Commands listed `npm run lint` +
  `npm run build`, NOT `npm run screenshot`.
- The change is a **pure string substitution** (identical
  rendered characters via
  `{MODELS_DISPLAY.generationModel}` instead of literal
  `Claude Sonnet 4.6`), no styling, layout, spacing,
  component structure, or CSS change. `npm run build`'s
  successful 14/14 static generation already verifies
  that the touched components render.
- Same rationale as P1.7b (`8b34218`).

## Risks

1. **`MODELS_DISPLAY` is manually synced with the runtime
   API routes' model choice.** If the API route (e.g.
   `generate-report`) switches to a different Anthropic
   model, the UI copy will silently drift out of sync
   until this helper is refreshed. Severity: **low /
   process**. Mitigation: the helper's JSDoc names the
   source (`src/app/api/**`) and prescribes a 3-step
   refresh (update API route → verify → refresh
   constants); a future TASK could add a runtime
   assertion or build-time check, but that's scope creep
   for P1.7c.
2. **The touched UI copy contains factual claims** (e.g.
   "Sent to: Anthropic's API"). Those claims remain
   factually correct at authoring time. If Anthropic's
   API is ever replaced (e.g. self-hosted models),
   several rewrites are needed. Severity: **low / by
   design**.
3. **Two label variants (`generationModel` +
   `generationModelShort`) create a choice per use site.**
   The three `page.tsx` sites use the natural fit
   (long-form in disclosure and footer, short-form in
   compact strip). Future authors could pick
   inconsistently. Severity: **low / cosmetic**.
   Mitigation: both variants are documented in the
   helper's JSDoc.
4. **Baseline lint has 37 pre-existing errors.** None
   introduced by this task; the setState-in-effect line
   number shifted from 472 → 473 because the new import
   added one line at the top of `page.tsx`. Severity:
   **low / pre-existing**. Not addressed here.
5. **Push is gated and will trigger Vercel auto-deploy**
   (same as P1.7b). Web is ahead of `origin/main` by 1
   commit now (`c0a0df3`); after RUN_REPORT commit, by 2;
   after DECISION commit, by 3. None pushed until Bohao
   explicitly approves. Severity: **n/a by design**.
6. **No runtime behavior change.** By construction, the
   4 changes are UI copy substitutions. The runtime AI
   behavior of report generation, eval, and
   classification is byte-identical to before. Severity:
   **n/a — this is the intended safety property**.

## Follow-up recommendations

- **Next: Human + ChatGPT review** of this RUN_REPORT
  and the diff at commit `c0a0df3`. Quick read: helper is
  34 lines of primitive constants + JSDoc; the two UI
  edits are `+5/-4` (page.tsx) and `+2/-1` (lab/page.tsx)
  — a total of 5 UI substitutions across 2 files.
- **Then: DECISION** via
  `python .agent/scripts/new_decision.py --task-id 2026-07-05_run_01`.
  Approval gates pushing this loop's commits (`c0a0df3`
  + forthcoming RUN_REPORT commit + forthcoming DECISION
  commit).
- **Then (only if DECISION = approve)**: the natural
  next steps are:
  (a) Return to a broader product roadmap — the P1.7
      series (P1.7 + P1.7b + P1.7c) is now complete;
      hero + model-string SSOT are both in place.
  (b) Optionally: a build-time codegen for both
      `web-bundle-stats.ts` and `models-display.ts` —
      still low-priority.
  (c) Optionally: a corpus refresh (pipeline task,
      separate scope-and-approve loop). **Do NOT start
      now** unless the ~6-week-old data becomes a real
      problem.
- **Do NOT** start any AgentOps-2* work (per Q10 pause).
- **Do NOT** modify `.agent/scripts/**` (hard rule).
- **Do NOT** lift BLK-0001 / BLK-0002 / BLK-0003.
- **Do NOT** modify runtime API-route model selection as
  a side effect of approving this DECISION — model-string
  UI SSOT and runtime model selection are deliberately
  decoupled.

## Ready for review

`yes`

## Requires human decision

`yes` — required before push of `main`. The web repo
currently has one unpushed commit (`c0a0df3` — TASK +
helper + 2 UI edits); the RUN_REPORT commit (this file)
will be the second; the matching DECISION commit will be
the third. All three wait on human GO before going to
`origin/main`.

Approval of this DECISION ships the centralized model
label copy to production (Vercel auto-deploys on `main`
push; **served copy will be byte-identical** because
`{MODELS_DISPLAY.generationModel}` renders to
`Claude Sonnet 4.6` — same characters as before, just
sourced from a constant). Approving does NOT approve:
(a) any AgentOps-2* work, (b) any
`.agent/scripts/**` mod, (c) any runtime model-selection
change, (d) any corpus regeneration, (e) G2.1d, (f) any
OpenAI API usage, (g) lifting any of the 3 open blockers.

> Verdict is technical-execution-only for now. Standing
> policy treats any `main` push as a human gate. The
> user-visible impact of this push is nil (identical
> rendered characters); the developer-visible impact is
> that future model-name updates now happen in one file.
