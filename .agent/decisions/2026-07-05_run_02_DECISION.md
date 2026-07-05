# DECISION · P1.8a sample report credibility copy audit

> Authored by ChatGPT (human-mediated) after reading the
> RUN_REPORT and the sample-report `page.tsx` diff on `main`.
> Scaffolded by
> `python .agent/scripts/new_decision.py --task-id 2026-07-05_run_02`
> (**twelfth full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-05_run_02_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-07-05_run_02_RUN_REPORT.md`

## Verdict

`approve`

## Reasoning summary

P1.8a successfully improves sample-report credibility copy
while keeping scope narrow. **The key fix is that the
sample-report page still displayed the stale P1.7b-era
claim of `92 applied_ai JDs`** — the same stale mock that
P1.7b (`1c912f8`) corrected on the homepage but missed on
the sample-report page. It now uses
`WEB_BUNDLE_STATS.appliedAiJds`, currently `47`.

The task also softens unsupported or fragile wording:

- **`443 real JDs` → `443 tracked JDs`** (navbar chip; the
  number is unchanged because `WEB_BUNDLE_STATS.totalJds`
  = 443, but the label softens from `real` to `tracked` for
  evidence-grounded framing consistent with the methodology
  page's language).
- **`live JD corpus` → `tracked JD corpus`** (disclosure
  banner; the corpus is a ~6-week-old May 2026 snapshot
  per the methodology page's own admission, so `live`
  overpromised).
- **`8 archetypes` → `an archetype`** (Honest note; the
  G2.1 taxonomy has 11 included + 2 reject-sidecar
  archetypes, so `8` was stale; safest fix is removing the
  fragile specific count since the paragraph's argument
  lands without it).
- **`JD corpus` → `tracked JD corpus`** (also in the
  Honest note; bundled with the archetype-count fix for
  language consistency with the navbar chip and disclosure
  banner).

The implementation stayed **copy/UI-only** and did not
modify:

- **Runtime API routes** (`src/app/api/**` empty diff —
  model selection and invocation logic byte-identical).
- **Prompts** (`src/lib/prompts.ts` empty diff).
- **Model selection** — no `src/lib/anthropic.ts`
  (doesn't exist), no config touched.
- **Pipeline data** (`src/data/**` empty diff — no
  `web_bundle.json` edit).
- **`src/lib/web-bundle-stats.ts`** — imported only, not
  edited (empty diff verified).
- **`src/lib/models-display.ts`** — untouched.
- **`src/app/methodology/page.tsx`** — deliberately
  untouched (its `~40 companies` claims likely refer to
  the `sources.yaml` registry, not the bundle's 35 unique
  companies; substituting `35` without verifying could
  silently break a correct claim).
- **`src/app/page.tsx`** — already handled by P1.7b/c;
  empty diff.
- **OpenAI API setup** — none introduced (per Q7 blocked
  sense).
- **GitHub Actions** (`.github/workflows/**` empty diff).
- **Automation infrastructure** (`.agent/scripts/**` empty
  diff — hard rule per AgentOps-2c DECISION Q3-Q8
  upheld).
- **Codex CLI / Claude Code config** — untouched.
- **Deployment config** (`vercel.json` / `.vercel/**` /
  `package.json` / `package-lock.json` / `.env*` all empty
  diff).

Build validation passed (`npm run build`: 14/14 static
routes, TypeScript clean, no bundle-size warnings; no
incremental client-bundle cost because
`WEB_BUNDLE_STATS` was already in the shared client
chunk from P1.7b via `src/app/page.tsx`). Lint still has
37 pre-existing baseline failures unrelated to this task
(unescaped entities on multiple pages, one
setState-in-effect at `src/app/page.tsx:473` — line
number unchanged from the P1.7c baseline because P1.8a
only touched `sample-report/page.tsx`, which has no lint
errors).

Independent verification against the live tree on `main`:

- **Scope** (`git diff --name-only origin/main..HEAD`) is
  exactly the 3 approved paths:
  `.agent/tasks/2026-07-05_run_02_TASK.md`,
  `src/app/sample-report/page.tsx`,
  `.agent/run_reports/2026-07-05_run_02_RUN_REPORT.md`.
- **`sample-report/page.tsx` change is surgical**: 1 new
  import (line 11) + 4 copy substitutions (lines 33
  navbar, 63 disclosure, 94 header chip, 342-346 Honest
  note). No unrelated hunks. No layout / component /
  styling change.
- **Rendered values**: `92 applied_ai JDs` → `47`,
  `443 real JDs` → `443 tracked JDs`, `live JD corpus` →
  `tracked JD corpus`, `8 archetypes` → `an archetype` +
  extra `tracked` in the same paragraph.
- **Methodology empty diff** verified — the deliberately
  left-alone verdict held.
- **`page.tsx` empty diff** — homepage already handled
  by P1.7b/c.
- **Forbidden audit**: empty diff on all other paths
  (`src/lib/prompts.ts`, `src/lib/corpus.ts`,
  `src/lib/types.ts`, `src/lib/eval-report.ts`,
  `src/lib/extract-pdf.ts`, `src/lib/web-bundle-stats.ts`
  — only imported, not modified,
  `src/lib/models-display.ts`, `src/data/**`,
  `src/app/api/**`, `src/app/layout.tsx`,
  `src/app/opengraph-image.tsx`, `src/app/lab/**`,
  `src/app/snapshot-pipeline/**`, `src/components/**`,
  `package.json`, `package-lock.json`, `.env*`,
  `vercel.json`, `.vercel/**`, `.github/workflows/**`,
  `.agent/policies/**`, `.agent/templates/**`,
  `.agent/scripts/**` (**hard rule per AgentOps-2c
  DECISION Q3-Q8**), `.agent/blockers.md`,
  `.agent/automation_queue.md`).
- **Pipeline repo** untouched (`b019786` = `origin/main`;
  clean) at both run start and end.
- **No runner / daemon / cron / scheduler / GitHub
  Actions edit / OpenAI SDK install / Codex / Claude
  config mutation / new dependency / LLM call / manual
  deploy** anywhere.
- **Queue + blockers**: `automation_queue.md` and
  `blockers.md` not touched. QUEUE-0001 / QUEUE-0004 /
  QUEUE-0006 / QUEUE-0007 / QUEUE-0008 all still `done`.
  QUEUE-0002 still `blocked_pending_human` red.
  QUEUE-0003 / QUEUE-0005 unchanged. BLK-0001 /
  BLK-0002 / BLK-0003 all still `open`.

The work meets every Acceptance criterion in the TASK
(all 17 boxes verifiable per RUN_REPORT). Approving on
technical execution. Push to `origin/main` remains a
separate human-approval gate per policy §3, and will
trigger Vercel auto-deploy. **Unlike P1.7c (which was
byte-identical), this push produces user-visible
changes** on the `/sample-report` route — exactly the
credibility copy fixes the task set out to make.

## Risks found

1. **This push will cause user-visible copy changes on
   `/sample-report`.** Specifically: `92 applied_ai JDs`
   → `47 applied_ai JDs` (header chip), `443 real JDs` →
   `443 tracked JDs` (navbar chip), `live JD corpus` →
   `tracked JD corpus` (disclosure banner), `8
   archetypes` → `an archetype` (Honest note).
   Severity: **medium / intended**. Mitigation: this is
   exactly the credibility-copy improvement the task
   asked for; the fixes align sample-report with what
   the homepage already says post-P1.7b/c.
2. **The sample-report page now depends on
   `WEB_BUNDLE_STATS` for displayed JD counts**; those
   constants are manually synced from `web_bundle.json`.
   Severity: **low / process**. Mitigation: same
   maintenance procedure as P1.7b (JSDoc in
   `web-bundle-stats.ts` names the refresh command); the
   scope of the drift risk is unchanged from P1.7b.
3. **If `web_bundle.json` changes later, `WEB_BUNDLE_STATS`
   must be refreshed** or sample-report numbers may drift
   alongside the homepage numbers. Severity: **low /
   process**. Mitigation: single-file refresh; documented
   in the helper's JSDoc; optional future build-time
   codegen would close this loop but is scope creep for
   P1.8a.
4. **`methodology/page.tsx` was intentionally left
   unchanged.** Its `approximately 40 companies` wording
   may or may not accurately reflect the current
   `sources.yaml` registry vs. the current bundle's 35
   unique companies. Severity: **low / accepted**.
   Mitigation: a separate future narrow audit can
   verify the source-registry semantics and update the
   methodology page if needed. Non-blocker for P1.8a.
5. **The fictional sample percentages remain unchanged.**
   Severity: **n/a / by design**. The page has a
   prominent "Sample · fictional" disclosure banner
   (line 57-65) that discloses all numbers on the page
   are illustrative. The framing is consistent.
6. **`npm run lint` still fails due to pre-existing
   baseline issues** (37 errors: unescaped entities +
   one setState-in-effect at `src/app/page.tsx:473`).
   None introduced by P1.8a. Line number is unchanged
   from the P1.7c baseline because P1.8a only touched
   `sample-report/page.tsx`, which has no lint errors.
   Severity: **low / pre-existing**.
7. **This task improves copy credibility but does not
   solve data freshness or corpus refresh.** The corpus
   is still ~6 weeks old; this is a separate pipeline
   concern. Severity: **low / scope-boundary**.
8. **Push will trigger Vercel auto-deploy**, so push
   still requires explicit human approval. Severity:
   **medium / by design**. The auto-deploy is the
   expected behavior for any web `main` push; the copy
   changes will be visible immediately after Vercel
   finishes building.
9. **G2.1d remains blocked by BLK-0001** (red-zone:
   classifier prompt rewrite + `CLASSIFIER_VERSION`
   bump). Codex CLI / Claude Code must NOT self-promote
   even after this DECISION. Severity: **n/a by design**.
10. **Full automation remains blocked by BLK-0002.**
    Opening any real Automation Window requires (a) the
    runner to exist with its own DECISION AND (b)
    explicit human resolution of BLK-0002. Severity:
    **n/a by design**.
11. **OpenAI API remains blocked by BLK-0003 (standing,
    Q7-scoped).** Severity: **n/a by design**. This task
    introduced no OpenAI API usage.

## Red-zone flags

`none` for P1.8a.

No `src/lib/prompts.ts`, `src/lib/anthropic.ts` (not
present), `src/data/web_bundle.json`,
`src/lib/corpus.ts`, `src/app/api/**` (runtime model
selection), `package.json`, `package-lock.json`,
`.env*`, `vercel.json`, `.vercel/**`, or
`.github/workflows/**` changed. No pipeline-repo file
changed. No Codex CLI config, Claude Code config, or
OpenAI SDK introduced. No `.agent/scripts/**` edited
(hard rule per Q3-Q8 of AgentOps-2c DECISION). No
executable runner / shell script / config / cron / hook
file created anywhere.

## Required fixes

`none`

Scope is clean (3 paths, all approved), the
`sample-report/page.tsx` diff is `+8/-7` surgical to
the 4 target sites plus 1 import, all 17 TASK
acceptance criteria are demonstrably met per RUN_REPORT,
`npm run build` passes with 14/14 static routes and
TypeScript clean, and no forbidden / red-zone /
pipeline / runner / OpenAI / config / executable /
`.agent/scripts` / prompts / runtime-selection /
methodology / homepage path was touched.

## Non-blocking follow-ups

- **After DECISION approval and push** → update daily
  summary. Extend
  `.agent/daily_summaries/2026-07-05_SUMMARY.md` with a
  P1.8a section documenting the four-site copy fix,
  the Vercel deploy confirmation (this time with
  visible changes, unlike P1.7c), and the maintenance
  note that sample-report now shares P1.7b's manually-
  synced-constants pattern.
- **Consider a future narrow audit of methodology's
  company/source-count wording**, but **do NOT do it
  now**. Would require reading `sources.yaml` in the
  pipeline repo or otherwise confirming the semantics
  of "~40 companies"; separate scope-and-approve
  loop.
- **Consider a future build-time or script-based
  refresh for `WEB_BUNDLE_STATS`**, but **do NOT do
  it now**. Same follow-up as P1.7b's DECISION #2 —
  low priority until drift causes a visible problem.
- **Consider another small product credibility task
  next.** Bohao's choice of angle. The P1.7 series
  (P1.7 + P1.7b + P1.7c) and now P1.8a have cleaned up
  the highest-visibility credibility copy; further
  polishes are optional.
- **Do NOT start corpus refresh** as a side effect of
  approving this DECISION. Separate pipeline
  scope-and-approve loop.
- **Do NOT start G2.1d.** BLK-0001 still `open`.
- **Do NOT resume automation-infra expansion.** Per
  AgentOps-2c Q10, automation-infra is paused; product
  work continues.
- **Do NOT introduce OpenAI API** in any Q7 blocked
  sense.
- **Do NOT deploy manually.** Vercel auto-deploy on
  push is the intended behavior.
- **Do NOT modify runtime API-route model selection**
  as a side effect of approving this DECISION. Display
  copy and runtime selection are deliberately
  decoupled.

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main` of
   the pipeline repo (do not switch to any branch).
2. Do NOT push either repo. The web repo will be
   ahead of origin/main by 3 commits at that point
   (P1.8a impl `34d5cc8` + RUN_REPORT `cc1e3b3` +
   this DECISION); push requires Bohao's explicit
   "push P1.8a" instruction. The push WILL trigger
   Vercel auto-deploy AND produce user-visible copy
   changes on `/sample-report` (unlike P1.7c which
   was byte-identical).
3. Do NOT deploy manually. Vercel auto-deploy from
   the eventual push handles this.
4. Do NOT start a methodology audit. The verdict was
   "leave methodology alone" for P1.8a; any future
   methodology audit is its own scope-and-approve
   loop with explicit human GO.
5. Do NOT start corpus refresh. Separate pipeline
   task.
6. Do NOT start G2.1d. BLK-0001 still `open`.
7. Do NOT modify runtime model selection
   (`src/app/api/**` stays frozen).
8. Do NOT modify prompts (`src/lib/prompts.ts` stays
   frozen).
9. Do NOT touch automation-infra. No
   `.agent/scripts/**` edits. No Shape B
   implementation. No AgentOps-2* work. Q10 pause
   continues.
10. Do NOT introduce OpenAI API in any Q7 blocked
    sense.
11. Do NOT lift any of the 3 open blockers
    (BLK-0001 / BLK-0002 / BLK-0003) without
    explicit written human resolution.

The next likely promote step is:
- `git push origin main` from the web repo (3
  commits land on origin/main: `34d5cc8` +
  `cc1e3b3` + this DECISION). Vercel auto-deploys.
  User-visible copy changes take effect on
  `/sample-report` once the deploy completes:
  header chip renders `47 applied_ai JDs` instead
  of `92`; navbar chip renders `443 tracked JDs`
  instead of `443 real JDs`; disclosure says
  `tracked JD corpus`; Honest note says `an
  archetype`.
- Then extend
  `.agent/daily_summaries/2026-07-05_SUMMARY.md`
  with a P1.8a section documenting the four-site
  copy fix and Vercel deploy confirmation; commit
  + push.
- Then, per this DECISION's follow-up, the natural
  next step is another small product credibility
  angle of Bohao's choosing, or an optional
  methodology-copy audit (still yellow, still
  small), or optional build-time codegen for
  `WEB_BUNDLE_STATS`.

Wait for Bohao's explicit "push P1.8a" before doing
anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which would deliver 3 commits — `34d5cc8` (TASK +
  sample-report edit), `cc1e3b3` (RUN_REPORT), and
  this DECISION commit once it lands). **This push
  will trigger Vercel auto-deploy AND produce
  user-visible copy changes** on the `/sample-report`
  route.
- Authoring the daily summary cleanup commit
  (extend `2026-07-05_SUMMARY.md`).
- Any methodology-page audit (deferred; separate
  scope-and-approve loop).
- Any corpus refresh / pipeline task.
- Any AgentOps-2* work (per Q10 pause).
- Any modification to `.agent/scripts/**`.
- Any runtime model-selection change
  (`src/app/api/**` frozen).
- Any prompt change (`src/lib/prompts.ts` frozen).
- Any G2.1d (red) work.
- Any OpenAI API usage in Q7 blocked sense.
- Any manual `vercel deploy`.
- Lifting any of the 3 open blockers
  (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical execution
> captured in the RUN_REPORT. Standing policy treats
> any `main` push as a human gate; this push
> additionally has user-visible-deploy consequences
> (the sample-report page's chip / disclosure /
> Honest note copy will change once Vercel finishes
> auto-deploying).
>
> Approving does NOT approve: (a) any runtime
> model-selection change, (b) any prompt change, (c)
> any methodology-page edit, (d) any corpus
> regeneration / pipeline work, (e) any AgentOps-2*
> work, (f) any `.agent/scripts/**` mod, (g) any
> OpenAI API usage in Q7 blocked sense, (h) G2.1d,
> (i) lifting any of the 3 open blockers. Each of
> those remains its own explicit human decision. The
> next step is Bohao's explicit call on the push.
