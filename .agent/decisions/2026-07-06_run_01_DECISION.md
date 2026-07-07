# DECISION · P2.0b visible corpus snapshot-date disclosure

> Authored by ChatGPT (human-mediated) after reading
> the RUN_REPORT and the two changed source files.
> Scaffolded by `python .agent/scripts/new_decision.py
> --task-id 2026-07-06_run_01` (**fifteenth full
> loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-06_run_01_DECISION`
- **based_on_run_report**:
  `.agent/run_reports/2026-07-06_run_01_RUN_REPORT.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-05_run_04_DECISION.md`
  (P2.0a memo verdict `approve`, memo §10 =
  "Recommended next task: P2.0b visible corpus
  snapshot-date disclosure")

## Verdict

`approve`

## Reasoning summary

P2.0b successfully adds a small, honest,
user-visible **corpus snapshot-date disclosure**
without refreshing corpus data or modifying
production data. The homepage attribution strip
now displays `Corpus snapshot: May 14, 2026`,
which directly addresses the data-freshness
transparency risk identified in P2.0a while
avoiding misleading `"live"`, `"real-time"`, or
`"last updated"` language. The implementation
extends `WEB_BUNDLE_STATS` with `corpusGeneratedAt`
and `corpusSnapshotDate`, and the post-review fix
ensures `corpusGeneratedAt` **exactly** matches
`src/data/web_bundle.json.generated_at`:
`2026-05-14T02:17:04.783793+00:00`. The task
stayed narrow: no `src/data/**` changes, no
`web_bundle.json` swap, no collector run, no
corpus refresh, no pipeline changes, no prompt
changes, no runtime model-selection changes, no
OpenAI API, and no `.agent/scripts/**` changes.
Build validation passed; lint remains a
pre-existing baseline issue.

Independent verification against the local tree
(all three commits: `c2ca323` + `f246b42` +
`e3fbbab`):

- **Scope** (`git diff --name-only
  origin/main..HEAD`) = exactly the 4 approved
  paths: `.agent/tasks/2026-07-06_run_01_TASK.md`,
  `.agent/run_reports/2026-07-06_run_01_RUN_REPORT.md`,
  `src/lib/web-bundle-stats.ts`, `src/app/page.tsx`.
- **Bundle bytes unchanged** —
  `src/data/web_bundle.json` NOT in scope.
- **Helper contains both new fields at the correct
  values** — `corpusGeneratedAt =
  "2026-05-14T02:17:04.783793+00:00"` (byte-
  identical to bundle) and `corpusSnapshotDate =
  "May 14, 2026"` (rendered value).
- **Bundle read confirms match** — `python3 -c
  "import json; …"` returns exactly
  `2026-05-14T02:17:04.783793+00:00` (identical to
  the helper value).
- **Homepage renders exactly one new chip** in the
  attribution strip near existing `applied_ai JDs
  · evidence quotes · Five-section report`. New
  chip text = `Corpus snapshot: May 14, 2026`.
- **Wording audit clean** — no `"live"`, no
  `"real-time"`, no `"fresh"`, no `"daily
  updated"`, no `"current market"`, no `"Last
  updated"`, no claim that pipeline bundle is
  production-serving, no `"8 sources"` on this
  task's changed surfaces, no explanation of
  P2.0b-g promotion path in product UI.
- **Methodology page NOT changed** — existing May
  2026 framing already sufficient (lines 6, 122,
  375-376); no contradiction to reconcile.
- **Sample-report page NOT changed** — P1.8a copy
  was already conservative.
- **Screenshot 15/15 ok** before the precision
  fix (chip renders naturally beside existing
  chips in the attribution strip). Screenshot NOT
  re-run after the precision fix because
  `corpusSnapshotDate` is unchanged — rendered UI
  is byte-identical between `f246b42` and
  `e3fbbab`.
- **Forbidden empty diffs**:
  `.agent/scripts/**` ✓, `.agent/blockers.md` ✓,
  `.agent/automation_queue.md` ✓,
  `.agent/policies/**` ✓, `.agent/templates/**` ✓,
  `src/data/**` ✓, `src/lib/prompts.ts` ✓,
  `src/lib/models-display.ts` ✓,
  `src/lib/corpus.ts` ✓, `src/app/api/**` ✓,
  `src/app/methodology/page.tsx` ✓,
  `src/app/sample-report/page.tsx` ✓,
  `src/app/snapshot-pipeline/**` ✓,
  `.github/workflows/**` ✓, `package.json` ✓,
  `package-lock.json` ✓, `.env*` ✓,
  `vercel.json` ✓, `.vercel/**` ✓.
- **Pipeline repo** untouched — `git status`
  clean at start and end; HEAD = `b019786` =
  `origin/main` throughout. All inspection was
  read-only.
- **No collector invocation**. No `python -m
  scripts.collector …` at any point.
- **No LLM call** by this task. No `anthropic` /
  `openai` SDK.
- **No new dependency** added. No `package.json` /
  lockfile diff.
- **No runner / daemon / cron / scheduler / GH
  Actions / Codex config / Claude config /
  OpenAI SDK / manual deploy** anywhere.
- **Queue + blockers**: `automation_queue.md` and
  `blockers.md` not touched. QUEUE-0002 still
  `blocked_pending_human` red. BLK-0001 /
  BLK-0002 / BLK-0003 all still `open`.

The work meets every Acceptance criterion in the
TASK (26 items, all verifiable per RUN_REPORT +
post-review correction). Approving on technical
execution. Push to `origin/main` remains a
separate human-approval gate per policy §3.
**Unlike P2.0a, this push WILL produce a
user-visible change**: the homepage attribution
strip gains one new chip `Corpus snapshot: May 14,
2026`. That is the intended P2.0b outcome.

## Risks found

1. **This push will cause a user-visible homepage
   copy addition**. The attribution strip gains
   one new chip `Corpus snapshot: May 14, 2026`.
   Severity: **low** — this is the intended
   product change; small blast radius; matches
   yellow-loop cadence. Mitigation: chip uses
   the existing attribution-strip idiom; no new
   component, no new color, no alarmist styling.
2. **The disclosure may make users notice the
   corpus is old**, but that is an intentional
   honesty improvement over the previous silent
   staleness. Severity: **acceptable** —
   strategic-review top risk was exactly
   invisible staleness; this converts it into
   disclosed staleness.
3. **`WEB_BUNDLE_STATS` remains manually synced**
   from `web_bundle.json`. Now with 6 constants
   (4 counts + 2 date fields), any silent
   web_bundle refresh without a matching helper
   refresh would surface as stale-looking numbers
   or a stale-looking date. Severity: **medium**.
   Mitigation: P2.0c is scoped in P2.0a memo §6
   as build-time codegen + drift check.
4. **If `web_bundle.json` changes later**,
   `corpusGeneratedAt` and `corpusSnapshotDate`
   MUST be refreshed together — helper docstring
   already notes this. Severity: **low**
   (documented obligation).
5. **No build-time drift check exists yet** to
   catch helper ↔ bundle divergence
   automatically. Severity: **medium**.
   Mitigation: P2.0c.
6. **The homepage now discloses the served corpus
   snapshot date, but the underlying corpus
   remains stale** (2026-05-14, ~7.5 weeks old).
   P2.0b closes the *transparency* risk, not the
   *freshness* risk. Severity: **acceptable
   (disclosure ≠ solution, and this was the
   explicit P2.0a-approved next step)**.
7. **P2.0b does not solve corpus refresh or
   production bundle promotion**. That work
   remains the P2.0c-g plan.
8. **P2.0b does not change the pipeline bundle or
   the source registry**. `sources.yaml` still 8
   sources; `web_bundle_pipeline.json` still 8
   companies. Severity: **n/a (out of P2.0b
   scope by design)**.
9. **`npm run lint` still fails due to
   pre-existing baseline issues** — 37 errors
   across
   `src/app/methodology/page.tsx`,
   `src/app/snapshot-pipeline/page.tsx`,
   and one `react-hooks/set-state-in-effect` at
   `src/app/page.tsx:473`. None introduced by
   this task. Severity: **acceptable
   (pre-existing baseline, unchanged since
   P1.7c)**.
10. **Future P2.0c should consider stats
    generation / drift check** so
    `WEB_BUNDLE_STATS` cannot silently drift from
    `web_bundle.json`.
11. **G2.1d remains blocked by BLK-0001**
    (red-zone: classifier prompt rewrite +
    `CLASSIFIER_VERSION` bump). Severity: **n/a
    by design**.
12. **Full automation remains blocked by
    BLK-0002**. Any real Automation Window
    requires (a) the runner to exist with its own
    DECISION AND (b) explicit human resolution
    of BLK-0002. Severity: **n/a by design**.
13. **OpenAI API remains blocked by BLK-0003
    (Q7-scoped, standing)**. This task
    introduced no OpenAI API usage. Severity:
    **n/a by design**.

## Red-zone flags

`none` for P2.0b.

No `src/lib/prompts.ts`, no `src/lib/anthropic.ts`
(not present), no `src/data/web_bundle.json`, no
`src/lib/corpus.ts`, no `src/app/api/**` (runtime
model selection), no `package.json`, no
`package-lock.json`, no `.env*`, no `vercel.json`,
no `.vercel/**`, no `.github/workflows/**` changed.
No pipeline-repo file changed at all — pipeline
inspection was read-only only. No Codex CLI
config, Claude Code config, or OpenAI SDK
introduced. No `.agent/scripts/**` edited (hard
rule per Q3-Q8 of AgentOps-2c DECISION). No
executable runner / shell script / config / cron
/ hook file created anywhere. No collector
invocation. No LLM call.

## Required fixes

`none`

Scope is clean (4 paths, all approved), helper
contains both new fields with the correct
(byte-identical to bundle) values, homepage chip
uses conservative wording, methodology and
sample-report pages are correctly left untouched
(justified in RUN_REPORT), `npm run build`
passes, `npm run lint` baseline unchanged (no new
errors introduced), and all 26 TASK acceptance
criteria are demonstrably met. The post-review
precision fix (`e3fbbab`) is a legitimate small
correction of a truncation issue in the initial
implementation — RUN_REPORT documents the fix
explicitly in its "Post-review correction"
section. No forbidden / red-zone / pipeline /
runner / OpenAI / config / executable /
`.agent/scripts` / prompts / runtime-selection /
data path was touched.

## Non-blocking follow-ups

- **After DECISION approval and push** → update
  daily summary. Extend
  `.agent/daily_summaries/2026-07-06_SUMMARY.md`
  (create if it doesn't exist yet) with a P2.0b
  section documenting the 3 commits, the new
  helper fields, the rendered chip text, and the
  Vercel deploy confirmation (this time
  user-visible).
- **Consider P2.0c as the next code loop**:
  build-time `WEB_BUNDLE_STATS` codegen + drift
  check (per P2.0a memo §6). Small yellow-adjacent
  scope: a build hook that reads
  `web_bundle.json` at build time, computes the 4
  count constants and the ISO
  `generated_at`, and either (a) writes them into
  a generated `web-bundle-stats.generated.ts` or
  (b) asserts they match the manual
  `web-bundle-stats.ts` and fails the build on
  drift.
- **Do NOT start P2.0c in this turn.**
- **Do NOT run collector** as a side effect.
- **Do NOT refresh corpus**.
- **Do NOT swap `web_bundle.json`**. P2.0a memo
  §7 gate 2 (`unique_companies ≥ 35`) still
  arithmetically blocks today's pipeline bundle.
- **Do NOT modify pipeline files.**
  `sources.yaml`, `corpus/**`,
  `scripts/collector/**`,
  `.github/workflows/**` all stay frozen.
- **Do NOT modify `src/data/**`.**
- **Do NOT start G2.1d.** BLK-0001 still `open`.
- **Do NOT resume automation-infra.** Per
  AgentOps-2c Q10, automation-infra is paused;
  product work continues.
- **Do NOT introduce OpenAI API** in any Q7
  blocked sense.
- **Do NOT deploy manually.** Vercel auto-deploy
  from the eventual push is the only sanctioned
  deploy path.
- **Do NOT modify `.agent/scripts/**`** (hard
  rule per AgentOps-2c Q3-Q8).
- **Do NOT parallelize P2.0c-g.** P2.0a memo §6
  says sequential.

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main` of
   the pipeline repo.
2. Do NOT push either repo. The web repo will be
   ahead of origin/main by 4 commits at that point
   (`c2ca323` impl + `f246b42` RUN_REPORT +
   `e3fbbab` precision fix + this DECISION); push
   requires Bohao's explicit "push P2.0b" instruction.
   **Unlike P2.0a, this push WILL produce a
   user-visible change**: the homepage attribution
   strip gains one new chip `Corpus snapshot: May 14,
   2026`.
3. Do NOT deploy manually. Vercel auto-deploy from
   the eventual push handles this.
4. Do NOT start P2.0c yet. The DECISION recommends
   P2.0c as the next code loop but it is a separate
   TASK with its own scope-and-approve loop. Start
   P2.0c only after Bohao's explicit "start P2.0c"
   instruction.
5. Do NOT run collector. No `python -m
   scripts.collector …`, no `dry-run`, no
   `clean-preview`, no `run`.
6. Do NOT refresh corpus. `web_bundle.json` /
   `web_bundle_pipeline.json` / `web_bundle_staging.json`
   all stay frozen.
7. Do NOT modify pipeline files. `sources.yaml`,
   `corpus/**`, `scripts/collector/**`,
   `.github/workflows/**` all stay frozen.
8. Do NOT modify `src/data/**`. Bundle in the web
   repo stays frozen.
9. Do NOT modify `.agent/scripts/**`. Hard rule per
   AgentOps-2c Q3-Q8.
10. Do NOT start G2.1d. BLK-0001 still `open`.
11. Do NOT resume automation-infra. Q10 pause
    continues.
12. Do NOT introduce OpenAI API in any Q7 blocked
    sense.
13. Do NOT modify runtime model selection
    (`src/app/api/**` stays frozen).
14. Do NOT modify prompts (`src/lib/prompts.ts`
    stays frozen).
15. Do NOT lift any of the 3 open blockers
    (BLK-0001 / BLK-0002 / BLK-0003) without
    explicit written human resolution.

The next likely promote step is:
- `git push origin main` from the web repo (4
  commits land on `origin/main`: `c2ca323` +
  `f246b42` + `e3fbbab` + this DECISION).
  Vercel auto-deploys and produces one visible
  chip on the homepage attribution strip:
  `Corpus snapshot: May 14, 2026`.
- Then extend/create the 2026-07-06 daily
  summary with a P2.0b section; commit + push.
- Then, per this DECISION's follow-up, the
  natural next step is **P2.0c · build-time
  `WEB_BUNDLE_STATS` codegen / drift check** as
  a separate future TASK + DECISION.

Wait for Bohao's explicit "push P2.0b" before
doing anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of
  `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which will deliver 4 commits — `c2ca323`
  (impl), `f246b42` (RUN_REPORT), `e3fbbab`
  (precision fix), and this DECISION commit once
  it lands). This push triggers Vercel
  auto-deploy AND — unlike P2.0a — **produces a
  user-visible change**: one new chip
  `Corpus snapshot: May 14, 2026` in the homepage
  attribution strip.
- Authoring the daily summary cleanup commit
  (create/extend `2026-07-06_SUMMARY.md`).
- Starting P2.0c (build-time stats codegen /
  drift check).
- Starting P2.0d/e/f/g in any order.
- Any pipeline file edit (`sources.yaml`,
  `corpus/**`, `scripts/collector/**`,
  `.github/workflows/**`).
- Any `src/data/**` edit.
- Any collector run (`python -m scripts.collector
  …`).
- Any corpus refresh.
- Any `.agent/scripts/**` mod.
- Any AgentOps-2* work (per Q10 pause).
- Any runtime model-selection change
  (`src/app/api/**` frozen).
- Any prompt change (`src/lib/prompts.ts`
  frozen).
- Any G2.1d (red) work.
- Any OpenAI API usage in Q7 blocked sense.
- Any manual `vercel deploy`.
- Lifting any of the 3 open blockers
  (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical execution
> captured in the RUN_REPORT and the two changed
> source files. Standing policy treats any `main`
> push as a human gate. This push additionally is
> user-visibly meaningful — a new chip appears
> on the homepage.
>
> Approving this DECISION:
>
> - Records the P2.0b implementation as
>   technically correct (helper values byte-
>   identical to bundle after the precision fix,
>   homepage chip uses conservative wording,
>   methodology + sample-report correctly
>   untouched, forbidden diffs empty).
> - Endorses the visible-freshness-disclosure
>   pattern as the P2.0b product outcome (small
>   chip near existing attribution stats).
> - Endorses P2.0c (build-time
>   `WEB_BUNDLE_STATS` codegen + drift check) as
>   the next recommended code loop.
>
> Approving does NOT approve: (a) starting P2.0c
> (or any downstream P2.0d-g) — each is its own
> TASK + DECISION, (b) any pipeline file edit,
> (c) any bundle swap, (d) any collector run,
> (e) any AgentOps-2* work, (f) any
> `.agent/scripts/**` mod, (g) any runtime
> model-selection change or prompt change,
> (h) any OpenAI API usage in Q7 blocked sense,
> (i) G2.1d, (j) lifting any of the 3 open
> blockers. Each of those remains its own
> explicit human decision. The next step is
> Bohao's explicit call on the push.
