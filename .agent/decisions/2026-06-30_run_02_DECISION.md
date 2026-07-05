# DECISION · P1.7b sync hero mock numbers with web bundle

> Authored by ChatGPT (human-mediated) after reading the
> RUN_REPORT, the helper file, and the `page.tsx` diff on
> `main`. Scaffolded by
> `python .agent/scripts/new_decision.py --task-id 2026-06-30_run_02`
> (**tenth full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-06-30_run_02_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-06-30_run_02_RUN_REPORT.md`

## Verdict

`approve`

## Reasoning summary

P1.7b successfully replaces stale hero mock numbers with
display values derived from the checked-in web bundle. The
**key correction**: the previous hero claim of `92 applied_ai
JDs` was **wrong**; the current `src/data/web_bundle.json`
contains exactly **47** records with `archetype ===
"applied_ai"`. The hero now displays:

- **47 applied_ai JDs** (was 92 — stale)
- **443 tracked posts** (unchanged value; matches
  `bundle.n_records`; now wired through the helper for
  grep-friendly future refresh)
- **35 tracked companies** (new; the one optional secondary
  polish the TASK approved, added naturally in the existing
  "grounded in real jobs" sentence)
- **5 evidence quotes** (unchanged value; fixed report
  policy; now wired through the helper's
  `evidenceQuotesPerReport` constant)

All four numbers are sourced from
`src/lib/web-bundle-stats.ts` (NEW, 29 lines) — a
display-only helper that exports primitive constants with
a JSDoc comment naming the source
(`src/data/web_bundle.json`), the bundle `generated_at`
timestamp, and the authoring-time computation method
(`python3 -c "import json; …"`). The helper **does not
import** the bundle (`grep -c 'import.*web_bundle.json'` =
0) or `@/lib/corpus` (`grep -c 'import.*corpus'` = 0), so
the 1.4 MB JSON stays out of any client bundle chunk. This
means the helper is **manually synced** from `web_bundle.json`,
not auto-recalculated at runtime — an intentional
client-bundle-size safety trade-off, tracked as a
non-blocker maintenance risk below.

The task stayed within narrow UI/display scope and did not
modify prompts, model selection, pipeline data, GitHub
Actions, OpenAI API setup, automation infrastructure,
Codex/Claude config, or deployment configuration. Build
validation passed (`npm run build`: 14/14 static routes,
TypeScript clean); lint still has 37 pre-existing baseline
failures unrelated to this task (unescaped entities on
multiple pages, setState-in-effect at
`src/app/page.tsx:472`).

Independent verification against the live tree on `main`:

- **Scope** (`git diff --name-only origin/main..HEAD`) is
  exactly the 4 approved paths:
  `.agent/tasks/2026-06-30_run_02_TASK.md`,
  `src/lib/web-bundle-stats.ts`,
  `src/app/page.tsx`,
  `.agent/run_reports/2026-06-30_run_02_RUN_REPORT.md`.
- **Helper structural check**: 29 lines (under the TASK's
  50-line cap). Exports one `WEB_BUNDLE_STATS as const`
  object with 4 primitive fields. No bundle import, no
  corpus import.
- **`page.tsx` change is surgical**: 1 new import
  (line 8) + 4 substitutions inside the hero block (lines
  765, 823, 825, 850-851). No unrelated hunks. No
  `src/lib/prompts.ts` / `src/lib/corpus.ts` /
  `src/lib/types.ts` touched. No prompt / model-selection
  logic altered. No AI-invocation code path (`api/**`,
  `sample-report`, `snapshot-pipeline`, `lab`, `methodology`
  routes) touched.
- **`src/data/web_bundle.json` unchanged**: empty diff
  verified.
- **`src/lib/anthropic.ts` NOT created**: does not exist in
  this repo (verified via `ls src/lib/`); the constraint
  is trivially satisfied.
- **Forbidden audit**: empty diff on `src/lib/prompts.ts`,
  `src/lib/corpus.ts`, `src/lib/types.ts`,
  `src/lib/eval-report.ts`, `src/lib/extract-pdf.ts`,
  `src/data/**`, `package.json`, `package-lock.json`,
  `.env*`, `vercel.json`, `.vercel/**`,
  `.github/workflows/**`, `.agent/policies/**`,
  `.agent/templates/**`, `.agent/scripts/**` (**hard rule
  per AgentOps-2c DECISION Q3-Q8**), `.agent/blockers.md`,
  `.agent/automation_queue.md`, `src/app/api/**`,
  `src/app/lab/**`, `src/app/methodology/**`,
  `src/app/sample-report/**`, `src/app/snapshot-pipeline/**`,
  `src/components/**`.
- **Pipeline repo** untouched (`b019786` = `origin/main`;
  clean) at both run start and end.
- **No runner / daemon / cron / scheduler / GitHub Actions
  edit / OpenAI SDK install / Codex / Claude config
  mutation / new dependency / LLM call / manual deploy**
  anywhere.
- **Queue + blockers**: `automation_queue.md` and
  `blockers.md` not touched. QUEUE-0001 / QUEUE-0006 /
  QUEUE-0007 / QUEUE-0008 all still `done`. QUEUE-0002
  still `blocked_pending_human` red. QUEUE-0003 /
  QUEUE-0004 / QUEUE-0005 unchanged. BLK-0001 / BLK-0002 /
  BLK-0003 all still `open`.

The work meets every Acceptance criterion in the TASK
(all 17 boxes verifiable per RUN_REPORT). Approving on
technical execution. Push to `origin/main` remains a
separate human-approval gate per policy §3, and
importantly a Vercel auto-deploy trigger.

## Risks found

1. **`web-bundle-stats.ts` contains manually-synced display
   constants derived from `web_bundle.json`**, not
   automatic runtime calculation. Severity: **low /
   accepted**. Mitigation: JSDoc comment in the helper
   names the source, the `generated_at` timestamp, and the
   one-liner refresh command; a future corpus regeneration
   requires editing 3-4 constants in one file. See
   follow-up #2 for the longer-term build-time-codegen
   option.
2. **If `web_bundle.json` changes later, these display
   constants must be refreshed** or replaced with a
   build-time generation approach. Severity: **low /
   process**. Mitigation: same as risk #1 above; the
   refresh is small enough that manual sync is acceptable
   until it isn't. If the drift ever causes user-visible
   staleness twice in a row, promote the build-time-codegen
   follow-up.
3. **`generated_at` is 2026-05-14 (~6 weeks old at time of
   run)** and was intentionally NOT displayed on the hero
   to avoid misleading freshness claims. Severity: **low /
   process**. This is a *data* freshness issue, not a UI
   issue; a corpus regeneration (pipeline task, separate
   scope-and-approve loop) is the right fix, but is
   explicitly NOT approved by this DECISION.
4. **`npm run lint` still fails due to pre-existing
   baseline issues** (37 errors: unescaped entities and
   one setState-in-effect warning). Severity: **low /
   pre-existing**. None are introduced by this task;
   none reference the touched lines. Cleaning the
   baseline is scope creep and belongs in its own task.
5. **Push may trigger Vercel auto-deploy**, so push still
   requires explicit human approval. Severity: **medium /
   by design**. Unlike prior `.agent/`-only pushes (which
   were non-disruptive because `src/**` was empty diff),
   this push modifies `src/app/page.tsx` and adds
   `src/lib/web-bundle-stats.ts` — the served bundle
   *will* change (hero displays new numbers). This is
   the intended user-visible effect; Bohao should verify
   the served page after push.
6. **This task improves hero credibility but does not
   solve data freshness or pipeline refresh.** Severity:
   **low / scope-boundary**. Fixing the 6-week-old
   `generated_at` is a pipeline concern; hero copy fix
   is a display concern; both are legitimate but
   separate.
7. **P1.7c model-string SSOT remains separate and not
   started.** Severity: **n/a / by design**. This
   DECISION does NOT authorize starting P1.7c in the
   same loop.
8. **G2.1d remains blocked by BLK-0001** (red-zone:
   classifier prompt rewrite + `CLASSIFIER_VERSION`
   bump). Codex CLI / Claude Code must NOT self-promote
   even after this DECISION. Severity: **n/a by design**.
9. **Full automation remains blocked by BLK-0002.**
   Opening any real Automation Window requires (a) the
   runner to exist with its own DECISION AND (b)
   explicit human resolution of BLK-0002. Severity:
   **n/a by design**.
10. **OpenAI API remains blocked by BLK-0003 (standing,
    Q7-scoped).** Severity: **n/a by design**. This
    task introduced no OpenAI API usage.

## Red-zone flags

`none` for P1.7b.

No `src/lib/prompts.ts`, `src/lib/anthropic.ts` (not
present), `src/data/web_bundle.json`,
`src/lib/corpus.ts`, `package.json`,
`package-lock.json`, `.env*`, `vercel.json`,
`.vercel/**`, or `.github/workflows/**` changed. No
pipeline-repo file changed. No Codex CLI config,
Claude Code config, or OpenAI SDK introduced. No
`.agent/scripts/**` edited (hard rule per Q3-Q8 of
AgentOps-2c DECISION). No executable runner / shell
script / config / cron / hook file created anywhere.

## Required fixes

`none`

Scope is clean (4 paths, all approved), helper is 29
lines with no bundle import, `page.tsx` diff is
`+7/-5` surgical to the hero block, all 17 TASK
acceptance criteria are demonstrably met per RUN_REPORT,
`npm run build` passes with 14/14 static routes and
TypeScript clean, and no forbidden / red-zone /
pipeline / runner / OpenAI / config / executable path
was touched.

## Non-blocking follow-ups

- **After DECISION approval and push** → update daily
  summary. Extend
  `.agent/daily_summaries/2026-06-30_SUMMARY.md` with a
  P1.7b section (third real loop of that day's file),
  documenting the hero corrections, the helper file,
  and the confirmation that push triggers a
  user-visible Vercel deploy.
- **Consider a future tiny script or build-time
  generation task** to refresh `web-bundle-stats.ts`
  from `web_bundle.json` (e.g. a small
  `scripts/gen-web-bundle-stats.mjs` that reads the
  JSON and emits the constants file). **Do NOT do it
  now** — the manual sync is acceptable while the
  refresh cadence is low; only promote this follow-up
  if the drift causes a visible problem twice in a
  row. Would be its own separate green task.
- **Consider P1.7c model-string SSOT as the next
  product task.** Same yellow risk class, same
  product-first spirit per AgentOps-2c Q10. Alternative:
  return to a specific other product task Bohao has in
  mind. Either way, a separate TASK + DECISION.
- **Consider a separate data freshness / bundle
  regeneration task later**, but do NOT start it now.
  Corpus regeneration touches the pipeline repo and is
  a different scope class than a UI copy fix. If done,
  it would be its own TASK with its own
  scope-and-approve loop, likely running the pipeline
  collector against fresh sources.
- **Do NOT start G2.1d.** BLK-0001 still `open`; G2.1c
  eval set being live does NOT lift it.
- **Do NOT resume automation-infra expansion.** Per
  AgentOps-2c Q10, automation-infra is paused; product
  work continues.
- **Do NOT introduce OpenAI API** in any Q7 blocked
  sense.
- **Do NOT deploy manually.** Vercel auto-deploy on
  push is the intended behavior; a manual `vercel
  deploy` is not needed and not approved.
- **Do NOT modify `.agent/scripts/**`** (hard rule per
  Q3-Q8).

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main` of
   the pipeline repo (do not switch to any branch).
2. Do NOT push either repo. The web repo will be
   ahead of origin/main by 3 commits at that point
   (P1.7b impl `1c912f8` + RUN_REPORT `8b34218` +
   this DECISION); push requires Bohao's explicit
   "push P1.7b" instruction. The push WILL trigger
   Vercel auto-deploy this time (unlike prior
   `.agent/`-only pushes) — the hero will visibly
   update.
3. Do NOT deploy manually. Vercel auto-deploy from
   the eventual push handles this.
4. Do NOT start P1.7c or any other product task.
5. Do NOT start any data refresh or pipeline task.
   The current bundle's `generated_at` is 6 weeks
   old; a refresh is legitimate but a separate
   scope-and-approve loop.
6. Do NOT start G2.1d. BLK-0001 still `open`.
7. Do NOT modify prompts or model logic.
   `src/lib/prompts.ts` stays frozen.
8. Do NOT touch automation-infra. No `.agent/scripts/**`
   edits. No Shape B implementation. No AgentOps-2*
   work. Q10 pause continues.
9. Do NOT introduce OpenAI API in any Q7 blocked
   sense.
10. Do NOT lift any of the 3 open blockers
    (BLK-0001 / BLK-0002 / BLK-0003) without
    explicit written human resolution.

The next likely promote step is:
- `git push origin main` from the web repo (3
  commits land on origin/main: `1c912f8` +
  `8b34218` + this DECISION). Vercel auto-deploys
  the served bundle; hero visibly updates from
  `92 applied_ai JDs` to `47 applied_ai JDs` plus
  the new `across 35 companies` polish.
- Then update daily summary
  `.agent/daily_summaries/2026-06-30_SUMMARY.md` with
  a P1.7b section; commit + push.
- Then, per Q10 and this DECISION follow-up #3, the
  natural next product task is:
  (a) **P1.7c · model-string SSOT** (yellow, small
      web display-module addition).
  (b) A different product task Bohao has in mind.
  (c) Optional: a corpus refresh (pipeline task,
      separate scope-and-approve loop).

Wait for Bohao's explicit "push P1.7b" before doing
anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which would deliver 3 commits — `1c912f8` (TASK +
  helper + `page.tsx` edit), `8b34218` (RUN_REPORT),
  and this DECISION commit once it lands). **This push
  will trigger Vercel auto-deploy and produce a
  user-visible change** (unlike prior `.agent/`-only
  pushes).
- Authoring the daily summary cleanup commit
  (extend `2026-06-30_SUMMARY.md`).
- Starting P1.7c or any other product task.
- Starting any corpus refresh / pipeline task.
- Any AgentOps-2* work (per Q10 pause).
- Any modification to `.agent/scripts/**`.
- Any G2.1d (red) work.
- Any OpenAI API usage in Q7 blocked sense.
- Any manual `vercel deploy`.
- Lifting any of the 3 open blockers
  (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical execution
> captured in the RUN_REPORT. Standing policy treats
> any `main` push as a human gate; this push
> additionally has user-visible-deploy consequences
> (the hero will render `47 applied_ai JDs` +
> `across 35 companies` after Vercel finishes
> auto-deploying).
>
> Approving does NOT approve: (a) P1.7c or any other
> product task, (b) any corpus regeneration /
> pipeline work, (c) any AgentOps-2* work, (d) any
> `.agent/scripts/**` mod, (e) any OpenAI API usage
> in Q7 blocked sense, (f) G2.1d, (g) lifting any of
> the 3 open blockers. Each of those remains its own
> explicit human decision. The next step is Bohao's
> explicit call on the push.
