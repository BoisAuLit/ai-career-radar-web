# DECISION · P1.8b methodology company source count audit

> Authored by ChatGPT (human-mediated) after reading the
> RUN_REPORT and the methodology `page.tsx` diff on `main`.
> Scaffolded by
> `python .agent/scripts/new_decision.py --task-id 2026-07-05_run_03`
> (**thirteenth full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-05_run_03_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-07-05_run_03_RUN_REPORT.md`

## Verdict

`approve`

## Reasoning summary

P1.8b successfully audits and corrects the methodology
page's company/source-count wording. The previous
"approximately 40 companies" / "40 companies" / "40
curated companies" claims did not match either candidate
source of truth:

| Candidate source | Value | Match to "40"? |
|---|---|---|
| Pipeline `sources.yaml` (automated registry) | **8** | ❌ off by 5× |
| `web_bundle.json` unique companies (currently served) | **35** | ❌ rounded up |

**Which of the two candidates does the copy actually
refer to?** Read the surrounding paragraphs: line 117
explicitly says "The live home page currently serves the
May 2026 manually-curated snapshot"; lines 143 and 309
use the same framing ("the curated companies we follow",
"our corpus"). All three "40" mentions refer to the
**manually-curated bundle**, not the automated
`sources.yaml` registry. The correct display value is
therefore **35**, which P1.7b's
`WEB_BUNDLE_STATS.trackedCompanies` already exposes.

The implementation updates three methodology copy sites
to use the existing display helper — **same pattern as
P1.7b (hero), P1.7c (models), and P1.8a (sample-report)**
— while keeping the task copy-only and preserving:

- **Runtime API routes** (`src/app/api/**` empty diff —
  model selection and invocation logic byte-identical).
- **Prompts** (`src/lib/prompts.ts` empty diff).
- **Model selection** — no `src/lib/anthropic.ts`
  (doesn't exist), no config touched.
- **Pipeline files** — pipeline HEAD = `b019786`
  unchanged. `sources.yaml` inspected via
  `head -60` and `grep -c '^  - source_id:'` at
  preflight, then untouched. No editor open, no `>`
  redirect, no `git add` in the pipeline repo.
- **`src/data/web_bundle.json`** — inspected via
  `python3 -c "import json; …"` at preflight, then
  untouched.
- **`src/lib/web-bundle-stats.ts`** — imported only,
  not edited (empty diff verified).
- **`src/lib/models-display.ts`** — untouched.
- **`src/app/page.tsx`** and
  **`src/app/sample-report/page.tsx`** — untouched. No
  overlap with P1.7b/c and P1.8a's edits; those were
  already consistent.
- **OpenAI API setup** — none introduced (per Q7
  blocked sense).
- **GitHub Actions** (`.github/workflows/**` empty
  diff).
- **Automation infrastructure** (`.agent/scripts/**`
  empty diff — hard rule per AgentOps-2c DECISION
  Q3-Q8 upheld).
- **Codex CLI / Claude Code config** — untouched.
- **Deployment config** (`vercel.json` / `.vercel/**` /
  `package.json` / `package-lock.json` / `.env*` all
  empty diff).

Build validation passed (`npm run build`: 14/14 static
routes, TypeScript clean, no bundle-size warnings; no
incremental client-bundle cost because
`WEB_BUNDLE_STATS` was already in the shared client
chunk from P1.7b/P1.7c/P1.8a). Lint still has 37
pre-existing baseline failures unrelated to this task
(unescaped entities on multiple pages, one
setState-in-effect at `src/app/page.tsx:473` — line
number unchanged from the P1.8a baseline because P1.8b
only touched `methodology/page.tsx`, which has no lint
errors).

Independent verification against the live tree on `main`:

- **Scope** (`git diff --name-only origin/main..HEAD`) is
  exactly the 3 approved paths:
  `.agent/tasks/2026-07-05_run_03_TASK.md`,
  `src/app/methodology/page.tsx`,
  `.agent/run_reports/2026-07-05_run_03_RUN_REPORT.md`.
- **`methodology/page.tsx` change is surgical**: 1 new
  import (line 13) + 3 substitutions (lines 117-118
  opening paragraph, 143-146 "What this is NOT"
  bullet, 309-310 "Do NOT report" bullet). No unrelated
  hunks. No layout / component / styling change.
- **Rendered values**: `approximately 40` → `35`, `40
  companies` → `35 companies`, `40 curated companies`
  → `35 curated companies`.
- **Illustrative per-company sample sizes are
  preserved**: e.g. `Scale AI (61 JDs)` and `Anthropic
  (10 JDs)` at line 158 remain unchanged — those are
  domain examples, not audit targets.
- **`page.tsx` empty diff** and
  **`sample-report/page.tsx` empty diff** — no
  overlap.
- **`src/app/api/**` empty diff**: runtime model
  selection and invocation logic in `classify`,
  `companies`, `eval-report`, `extract-pdf`,
  `generate-report` routes stays byte-identical.
- **`src/lib/anthropic.ts` NOT created**: does not
  exist in this repo; constraint trivially satisfied.
- **Forbidden audit**: empty diff on
  `src/lib/prompts.ts`, `src/lib/corpus.ts`,
  `src/lib/types.ts`, `src/lib/eval-report.ts`,
  `src/lib/extract-pdf.ts`,
  `src/lib/web-bundle-stats.ts` (imported only, not
  modified), `src/lib/models-display.ts`,
  `src/data/**`, `src/app/api/**`,
  `src/app/layout.tsx`, `src/app/opengraph-image.tsx`,
  `src/app/lab/**`, `src/app/snapshot-pipeline/**`,
  `src/app/page.tsx`, `src/app/sample-report/**`,
  `src/components/**`, `package.json`,
  `package-lock.json`, `.env*`, `vercel.json`,
  `.vercel/**`, `.github/workflows/**`,
  `.agent/policies/**`, `.agent/templates/**`,
  `.agent/scripts/**` (**hard rule per AgentOps-2c
  DECISION Q3-Q8**), `.agent/blockers.md`,
  `.agent/automation_queue.md`.
- **Pipeline repo** untouched (`b019786` =
  `origin/main`; clean) at both run start and end.
  `sources.yaml` inspected read-only via
  `grep`/`head` at preflight only.
- **No runner / daemon / cron / scheduler / GitHub
  Actions edit / OpenAI SDK install / Codex / Claude
  config mutation / new dependency / LLM call / manual
  deploy** anywhere.
- **Queue + blockers**: `automation_queue.md` and
  `blockers.md` not touched. QUEUE-0001 / QUEUE-0004 /
  QUEUE-0006 / QUEUE-0007 / QUEUE-0008 all still
  `done`. QUEUE-0002 still `blocked_pending_human`
  red. QUEUE-0003 / QUEUE-0005 unchanged. BLK-0001 /
  BLK-0002 / BLK-0003 all still `open`.

The work meets every Acceptance criterion in the TASK
(all 16 boxes verifiable per RUN_REPORT). Approving on
technical execution. Push to `origin/main` remains a
separate human-approval gate per policy §3, and will
trigger Vercel auto-deploy. **Like P1.8a (and unlike
P1.7c which was byte-identical), this push produces
user-visible copy changes** on the `/methodology`
route — exactly the credibility copy fixes the task
set out to make.

## Risks found

1. **This push will cause user-visible copy changes
   on `/methodology`.** Three sites will render `35`
   instead of `40` (opening paragraph, "What this is
   NOT" bullet, "Do NOT report" bullet). Severity:
   **medium / intended**. Mitigation: this is exactly
   the credibility-copy fix the task asked for; the
   new numbers align methodology with the actual
   currently-served bundle.
2. **Methodology now depends on
   `WEB_BUNDLE_STATS.trackedCompanies`**, which is
   manually synced from `web_bundle.json`. Severity:
   **low / process**. Mitigation: same maintenance
   procedure documented since P1.7b (JSDoc in the
   helper names the refresh command); scope of the
   drift risk is unchanged from P1.7b/P1.8a.
3. **If `web_bundle.json` changes later,
   `WEB_BUNDLE_STATS` must be refreshed** or
   methodology numbers may drift alongside the hero,
   sample-report, and other consumers. Severity:
   **low / process**. Mitigation: single-file
   refresh; optional future build-time codegen would
   close the drift loop but is scope creep for P1.8b.
4. **The automated source registry count is 8, but
   this task intentionally does not surface that as a
   methodology claim.** The audit conclusion was that
   the "40" copy refers to the served bundle (35),
   not to the automated registry (8), and the
   methodology page doesn't currently need a
   registry-count claim. Severity: **low / by
   design**. Mitigation: a future TASK can add
   registry-count copy to the "Automation status"
   section if that signal proves useful to readers.
5. **Pipeline `sources.yaml` was inspected read-only
   only and remains unchanged.** No `>` redirect, no
   `git add` in the pipeline repo. `git status` and
   `git rev-parse HEAD` both confirmed
   `b019786` at start and end. Severity: **n/a /
   accepted**.
6. **This task improves copy credibility but does
   not solve data freshness or corpus refresh.** The
   corpus is still ~7 weeks old
   (`generated_at: 2026-05-14`); this is a separate
   pipeline concern. Severity: **low /
   scope-boundary**.
7. **`npm run lint` still fails due to pre-existing
   baseline issues** (37 errors: unescaped entities +
   one setState-in-effect at `src/app/page.tsx:473`).
   None introduced by P1.8b. Line number is unchanged
   from the P1.8a baseline because P1.8b only touched
   `methodology/page.tsx`, which has no lint errors.
   Severity: **low / pre-existing**.
8. **Push will trigger Vercel auto-deploy**, so push
   still requires explicit human approval. Severity:
   **medium / by design**. Vercel builds on any
   `main` push regardless of visible change; the
   auto-deploy is expected behavior.
9. **G2.1d remains blocked by BLK-0001** (red-zone:
   classifier prompt rewrite + `CLASSIFIER_VERSION`
   bump). Codex CLI / Claude Code must NOT
   self-promote even after this DECISION. Severity:
   **n/a by design**.
10. **Full automation remains blocked by BLK-0002.**
    Opening any real Automation Window requires (a)
    the runner to exist with its own DECISION AND (b)
    explicit human resolution of BLK-0002. Severity:
    **n/a by design**.
11. **OpenAI API remains blocked by BLK-0003
    (standing, Q7-scoped).** Severity: **n/a by
    design**. This task introduced no OpenAI API
    usage.

## Red-zone flags

`none` for P1.8b.

No `src/lib/prompts.ts`, `src/lib/anthropic.ts` (not
present), `src/data/web_bundle.json`,
`src/lib/corpus.ts`, `src/app/api/**` (runtime model
selection), `package.json`, `package-lock.json`,
`.env*`, `vercel.json`, `.vercel/**`, or
`.github/workflows/**` changed. No pipeline-repo file
changed (`sources.yaml` inspected read-only only). No
Codex CLI config, Claude Code config, or OpenAI SDK
introduced. No `.agent/scripts/**` edited (hard rule
per Q3-Q8 of AgentOps-2c DECISION). No executable
runner / shell script / config / cron / hook file
created anywhere.

## Required fixes

`none`

Scope is clean (3 paths, all approved), the
`methodology/page.tsx` diff is `+9/-6` surgical to
the 3 target sites plus 1 import, all 16 TASK
acceptance criteria are demonstrably met per
RUN_REPORT, `npm run build` passes with 14/14 static
routes and TypeScript clean, and no forbidden /
red-zone / pipeline / runner / OpenAI / config /
executable / `.agent/scripts` / prompts /
runtime-selection / homepage / sample-report path was
touched.

## Non-blocking follow-ups

- **After DECISION approval and push** → update
  daily summary. Extend
  `.agent/daily_summaries/2026-07-05_SUMMARY.md`
  with a P1.8b section documenting the three-site
  copy fix, the audit trail (sources.yaml=8,
  bundle=35, methodology "40" was stale), and the
  Vercel deploy confirmation (this time with
  visible changes, like P1.8a).
- **Consider a future build-time or script-based
  refresh for `WEB_BUNDLE_STATS`**, but **do NOT
  do it now**. Same low-priority follow-up
  documented since P1.7b — worthwhile only if
  drift causes a visible problem twice.
- **Consider a future source-registry-vs-served-bundle
  explainer** if users need that distinction, but
  **do NOT do it now**. The methodology page
  already frames the served bundle vs the
  staging-pipeline output; adding an explicit
  "the automated pipeline currently fetches from N
  first-party ATS sources" line would be a small
  yellow copy TASK.
- **Consider another small product credibility
  task next.** The P1.7 + P1.8 credibility copy
  cluster is now fully consistent (hero /
  sample-report / model strings / methodology all
  trace to `WEB_BUNDLE_STATS` + `MODELS_DISPLAY`).
  Bohao's choice of next angle.
- **Do NOT start corpus refresh** as a side effect
  of approving this DECISION.
- **Do NOT modify pipeline files.**
- **Do NOT start G2.1d.** BLK-0001 still `open`.
- **Do NOT resume automation-infra expansion.** Per
  AgentOps-2c Q10, automation-infra is paused;
  product work continues.
- **Do NOT introduce OpenAI API** in any Q7 blocked
  sense.
- **Do NOT deploy manually.** Vercel auto-deploy on
  push is the intended behavior.
- **Do NOT modify runtime API-route model
  selection or prompts** as a side effect. Display
  copy and runtime selection are deliberately
  decoupled.

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main`
   of the pipeline repo (do not switch to any
   branch).
2. Do NOT push either repo. The web repo will be
   ahead of origin/main by 3 commits at that
   point (P1.8b impl `33fc11a` + RUN_REPORT
   `17aea9b` + this DECISION); push requires
   Bohao's explicit "push P1.8b" instruction.
   The push WILL trigger Vercel auto-deploy AND
   produce user-visible copy changes on
   `/methodology` (three "40" → "35"
   substitutions).
3. Do NOT deploy manually. Vercel auto-deploy
   from the eventual push handles this.
4. Do NOT start corpus refresh. Separate
   pipeline task.
5. Do NOT modify pipeline files. `sources.yaml`,
   `corpus/**`, `scripts/**` all stay frozen.
6. Do NOT start G2.1d. BLK-0001 still `open`.
7. Do NOT modify runtime model selection
   (`src/app/api/**` stays frozen).
8. Do NOT modify prompts (`src/lib/prompts.ts`
   stays frozen).
9. Do NOT touch automation-infra. No
   `.agent/scripts/**` edits. No Shape B
   implementation. No AgentOps-2* work. Q10
   pause continues.
10. Do NOT introduce OpenAI API in any Q7
    blocked sense.
11. Do NOT lift any of the 3 open blockers
    (BLK-0001 / BLK-0002 / BLK-0003) without
    explicit written human resolution.

The next likely promote step is:
- `git push origin main` from the web repo (3
  commits land on origin/main: `33fc11a` +
  `17aea9b` + this DECISION). Vercel
  auto-deploys. User-visible copy changes take
  effect on `/methodology` once the deploy
  completes: three "40" mentions become "35".
- Then extend
  `.agent/daily_summaries/2026-07-05_SUMMARY.md`
  with a P1.8b section documenting the
  three-site copy fix, the audit trail, and
  Vercel deploy confirmation; commit + push.
- Then, per this DECISION's follow-up, the
  natural next step is another small product
  credibility angle of Bohao's choosing. The
  P1.7 + P1.8 cluster is now fully consistent;
  no urgent copy fix remains.

Wait for Bohao's explicit "push P1.8b" before
doing anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which would deliver 3 commits — `33fc11a`
  (TASK + methodology edit), `17aea9b` (RUN_REPORT),
  and this DECISION commit once it lands). **This
  push will trigger Vercel auto-deploy AND
  produce user-visible copy changes** on the
  `/methodology` route.
- Authoring the daily summary cleanup commit
  (extend `2026-07-05_SUMMARY.md`).
- Any corpus refresh / pipeline task.
- Any AgentOps-2* work (per Q10 pause).
- Any modification to `.agent/scripts/**`.
- Any runtime model-selection change
  (`src/app/api/**` frozen).
- Any prompt change (`src/lib/prompts.ts`
  frozen).
- Any pipeline-file edit (including a future
  `sources.yaml` change).
- Any G2.1d (red) work.
- Any OpenAI API usage in Q7 blocked sense.
- Any manual `vercel deploy`.
- Lifting any of the 3 open blockers
  (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical execution
> captured in the RUN_REPORT. Standing policy
> treats any `main` push as a human gate; this
> push additionally has user-visible-deploy
> consequences (three "40 companies" mentions
> on `/methodology` become "35 companies" once
> Vercel finishes auto-deploying).
>
> Approving does NOT approve: (a) any runtime
> model-selection change, (b) any prompt change,
> (c) any corpus regeneration / pipeline work,
> (d) any AgentOps-2* work, (e) any
> `.agent/scripts/**` mod, (f) any OpenAI API
> usage in Q7 blocked sense, (g) G2.1d, (h)
> surfacing the automated registry count (8) as
> a new methodology claim, (i) lifting any of
> the 3 open blockers. Each of those remains
> its own explicit human decision. The next
> step is Bohao's explicit call on the push.
