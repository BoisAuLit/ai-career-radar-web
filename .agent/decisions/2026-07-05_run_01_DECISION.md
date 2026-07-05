# DECISION · P1.7c model-string single source of truth

> Authored by ChatGPT (human-mediated) after reading the
> RUN_REPORT, the helper file, and the `page.tsx` +
> `lab/page.tsx` diffs on `main`. Scaffolded by
> `python .agent/scripts/new_decision.py --task-id 2026-07-05_run_01`
> (**eleventh full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-05_run_01_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-07-05_run_01_RUN_REPORT.md`

## Verdict

`approve`

## Reasoning summary

P1.7c successfully centralizes the user-visible
model/provider display strings into a small display-only
module, `src/lib/models-display.ts` (34 lines, primitive
constants only). The UI now imports `MODELS_DISPLAY` for
model-disclosure copy in `src/app/page.tsx` (3 sites) and
`src/app/lab/page.tsx` (1 site), while preserving the
**same rendered characters** as before —
`{MODELS_DISPLAY.generationModel}` renders to
`Claude Sonnet 4.6`, identical to the previous hardcoded
literal. This is a developer-facing consolidation, not a
user-visible behavior change.

The task stayed within narrow UI/display scope and did
not modify:

- **Runtime API routes** (`src/app/api/**` empty diff —
  model selection and invocation logic byte-identical).
- **Prompts** (`src/lib/prompts.ts` empty diff).
- **Server-only corpus logic** (`src/lib/corpus.ts` empty
  diff).
- **Pipeline data** (`src/data/**` empty diff — no
  `web_bundle.json` / `web_bundle_pipeline.json` edit).
- **OpenAI API setup** — none introduced (per Q7 blocked
  sense).
- **GitHub Actions** (`.github/workflows/**` empty diff).
- **Automation infrastructure** (`.agent/scripts/**` empty
  diff — hard rule per AgentOps-2c DECISION Q3-Q8 upheld).
- **Codex CLI / Claude Code config** — untouched.
- **Deployment config** (`vercel.json` / `.vercel/**` /
  `package.json` / `package-lock.json` / `.env*` all empty
  diff).

Build validation passed (`npm run build`: 14/14 static
routes, TypeScript clean, no bundle-size warnings; helper
adds ~200 bytes of string constants — negligible). Lint
still has 37 pre-existing baseline failures unrelated to
this task (unescaped entities on multiple pages, one
setState-in-effect at `src/app/page.tsx:473` — line
number shifted +1 from the P1.7b baseline of 472 because
P1.7c added one new import at the top of `page.tsx`;
content is otherwise unchanged).

Independent verification against the live tree on `main`:

- **Scope** (`git diff --name-only origin/main..HEAD`) is
  exactly the 5 approved paths:
  `.agent/tasks/2026-07-05_run_01_TASK.md`,
  `src/lib/models-display.ts`,
  `src/app/page.tsx`,
  `src/app/lab/page.tsx`,
  `.agent/run_reports/2026-07-05_run_01_RUN_REPORT.md`.
- **Helper structural check**: 34 lines (under the
  TASK's 50-line cap). Exports one `MODELS_DISPLAY as
  const` object with 5 primitive string fields
  (`provider`, `generationModel`, `generationModelShort`,
  `evalModel`, `evalModelShort`). No `@anthropic-ai/sdk`,
  `@/lib/prompts`, `@/lib/corpus`, or `@/app/api/**`
  import (`grep -c` = 0). No `fetch(` or module-scope
  `await` (`grep -c` = 0). Pure static constants.
- **`page.tsx` change is surgical**: 1 new import
  (line 9) + 3 substitutions in the model-disclosure
  copy blocks (lines 1068-1069 legal/privacy disclosure,
  1123 cost/time strip, 1640 footer attribution). No
  unrelated hunks.
- **`lab/page.tsx` change is surgical**: 1 new import
  (line 13) + 1 substitution in the methodology footer
  (line 246 "3-metric LLM-as-judge"). No unrelated
  hunks.
- **Rendered characters are byte-identical**: verified
  by inspection — `{MODELS_DISPLAY.generationModel}` →
  `"Claude Sonnet 4.6"` (identical to the previous
  hardcoded literal); same for
  `generationModelShort` → `"Sonnet 4.6"`,
  `evalModel` → `"Claude Haiku 4.5"`,
  `evalModelShort` → `"Haiku 4.5"`, and `provider` →
  `"Anthropic"`.
- **`src/app/api/**` empty diff**: runtime model
  selection and invocation logic in `classify`,
  `companies`, `eval-report`, `extract-pdf`,
  `generate-report` routes stays byte-identical.
- **`src/lib/anthropic.ts` NOT created**: does not
  exist in this repo (verified in P1.7b); constraint
  trivially satisfied.
- **Forbidden audit**: empty diff on
  `src/lib/prompts.ts`, `src/lib/corpus.ts`,
  `src/lib/types.ts`, `src/lib/eval-report.ts`,
  `src/lib/extract-pdf.ts`, `src/lib/web-bundle-stats.ts`,
  `src/data/**`, `src/app/api/**`, `src/app/layout.tsx`,
  `src/app/opengraph-image.tsx`,
  `src/app/methodology/**`,
  `src/app/sample-report/**`,
  `src/app/snapshot-pipeline/**`, `src/components/**`,
  `package.json`, `package-lock.json`, `.env*`,
  `vercel.json`, `.vercel/**`, `.github/workflows/**`,
  `.agent/policies/**`, `.agent/templates/**`,
  `.agent/scripts/**` (**hard rule per AgentOps-2c
  DECISION Q3-Q8**), `.agent/blockers.md`,
  `.agent/automation_queue.md`.
- **Pipeline repo** untouched (`b019786` =
  `origin/main`; clean) at both run start and end.
- **No runner / daemon / cron / scheduler / GitHub
  Actions edit / OpenAI SDK install / Codex / Claude
  config mutation / new dependency / LLM call / manual
  deploy** anywhere.
- **Queue + blockers**: `automation_queue.md` and
  `blockers.md` not touched. QUEUE-0001 / QUEUE-0006 /
  QUEUE-0007 / QUEUE-0008 all still `done`. QUEUE-0002
  still `blocked_pending_human` red. QUEUE-0003 /
  QUEUE-0004 / QUEUE-0005 unchanged. BLK-0001 /
  BLK-0002 / BLK-0003 all still `open`.

The work meets every Acceptance criterion in the TASK
(all 20 boxes verifiable per RUN_REPORT). Approving on
technical execution. Push to `origin/main` remains a
separate human-approval gate per policy §3, and will
trigger Vercel auto-deploy (same as P1.7b) — though
the rendered UI copy is unchanged, so no user-visible
change.

## Risks found

1. **`models-display.ts` is a *display* SSOT, not a
   *runtime* model-selection SSOT.** The runtime models
   are still chosen in `src/app/api/**` routes; this
   helper only ensures the UI says the same words
   consistently. Severity: **low / by design**.
2. **If runtime API routes change model names later,
   `models-display.ts` must be updated too.** Manual
   sync between two decoupled sources of truth
   (runtime selection vs. display copy) creates drift
   risk. Severity: **low / process**. Mitigation: the
   helper's JSDoc names the source (runtime API
   routes) and prescribes a 3-step refresh (update API
   route → verify → refresh constants); a future TASK
   could add an automated drift check.
3. **There is no automated check yet to detect drift
   between runtime model selection and display
   strings.** Severity: **low / accepted**. Mitigation:
   documented as a non-blocking follow-up below; not
   worth building until drift actually causes a visible
   inconsistency.
4. **Push will trigger Vercel auto-deploy even though
   rendered UI text should be effectively unchanged.**
   Severity: **low / by design**. Vercel builds on any
   `main` push regardless of whether the served output
   differs; Bohao's approval still required. The build
   itself has already passed locally (14/14 static
   routes), so the deploy is expected to succeed.
5. **`npm run lint` still fails due to pre-existing
   baseline issues** (37 errors: unescaped entities +
   one setState-in-effect at
   `src/app/page.tsx:473`). Severity: **low /
   pre-existing**. Not attributable to P1.7c. Cleaning
   the baseline is scope creep.
6. **This task improves display consistency but does
   not change or validate runtime AI behavior.** The
   runtime model choice is unaffected; whether the
   choice is correct or optimal is a separate concern.
   Severity: **low / scope-boundary**.
7. **P1.7c does not solve data freshness or corpus
   refresh.** The corpus is still ~6 weeks old
   (`generated_at: 2026-05-14`); this is a separate
   pipeline concern. Severity: **low / scope-boundary**.
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

`none` for P1.7c.

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

Scope is clean (5 paths, all approved), helper is 34
lines with no forbidden imports and no side effects,
the two UI diffs are surgical (`+5/-4` and `+2/-1`
across the model-disclosure copy sites), all 20 TASK
acceptance criteria are demonstrably met per RUN_REPORT,
`npm run build` passes with 14/14 static routes and
TypeScript clean, and no forbidden / red-zone /
pipeline / runner / OpenAI / config / executable /
`.agent/scripts` / prompts / runtime-selection path was
touched.

## Non-blocking follow-ups

- **After DECISION approval and push** → update daily
  summary. Two reasonable options:
  (a) Extend `.agent/daily_summaries/2026-06-30_SUMMARY.md`
      is NOT appropriate — P1.7c happened on 2026-07-05,
      not 2026-06-30.
  (b) **Open a new `2026-07-05_SUMMARY.md`** with a
      P1.7c section documenting the four-site
      centralization, the helper, and the Vercel
      auto-deploy confirmation. This is the preferred
      option — day boundary crossed cleanly.
- **Mark P1.7c as done in the queue if it has a slot.**
  QUEUE-0004 originally covered "P1.7c model-string
  SSOT"; check whether that queue item exists and
  transition it to `done` in the same cleanup commit.
  If no queue item exists, no queue edit needed.
- **Consider a future drift check between display
  model strings and runtime API model constants**, but
  **do NOT do it now**. Would be a small green task
  (e.g. a build-time check that `MODELS_DISPLAY.generationModel`
  matches the actual model name used in
  `src/app/api/generate-report/route.ts` or wherever
  the SDK is invoked). Only promote if drift causes a
  visible inconsistency.
- **Consider a future baseline lint cleanup task**,
  but **do NOT do it now**. The 37 pre-existing errors
  are cosmetic (unescaped entities) plus one
  react-hooks warning. Would be its own separate green
  task.
- **Consider another small product credibility task
  next.** The P1.7 series (P1.7 + P1.7b + P1.7c) is
  now complete; hero + model-string SSOT are both in
  place. Next-natural options include: a corpus
  refresh (pipeline task, separate scope), a build-time
  codegen for both `web-bundle-stats.ts` and
  `models-display.ts`, or a fresh product angle Bohao
  has in mind.
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
  as a side effect of approving this DECISION —
  display SSOT and runtime selection are deliberately
  decoupled.

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main` of
   the pipeline repo (do not switch to any branch).
2. Do NOT push either repo. The web repo will be
   ahead of origin/main by 3 commits at that point
   (P1.7c impl `c0a0df3` + RUN_REPORT `4cbbd83` +
   this DECISION); push requires Bohao's explicit
   "push P1.7c" instruction. The push WILL trigger
   Vercel auto-deploy (same as P1.7b) — but the
   rendered UI text is byte-identical to before, so
   no user-visible change is expected.
3. Do NOT deploy manually. Vercel auto-deploy from
   the eventual push handles this.
4. Do NOT start corpus refresh. Separate pipeline
   task.
5. Do NOT start G2.1d. BLK-0001 still `open`.
6. Do NOT modify runtime model selection
   (`src/app/api/**` stays frozen).
7. Do NOT modify prompts (`src/lib/prompts.ts` stays
   frozen).
8. Do NOT touch automation-infra. No
   `.agent/scripts/**` edits. No Shape B
   implementation. No AgentOps-2* work. Q10 pause
   continues.
9. Do NOT introduce OpenAI API in any Q7 blocked
   sense.
10. Do NOT lift any of the 3 open blockers
    (BLK-0001 / BLK-0002 / BLK-0003) without
    explicit written human resolution.

The next likely promote step is:
- `git push origin main` from the web repo (3
  commits land on origin/main: `c0a0df3` +
  `4cbbd83` + this DECISION). Vercel auto-deploys;
  no user-visible change (identical rendered
  characters).
- Then open a new
  `.agent/daily_summaries/2026-07-05_SUMMARY.md` (day
  boundary crossed since the last summary on
  2026-06-30) with a P1.7c section documenting the
  four-site centralization and confirmation of
  no-op deploy behavior; optionally mark any
  QUEUE-0004-style item done; commit + push.
- Then the P1.7 series is complete. Next decision
  is which product angle to work on, or an optional
  drift-check / lint-cleanup / corpus-refresh
  follow-up.

Wait for Bohao's explicit "push P1.7c" before doing
anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which would deliver 3 commits — `c0a0df3` (TASK +
  helper + 2 UI edits), `4cbbd83` (RUN_REPORT), and
  this DECISION commit once it lands). **This push
  will trigger Vercel auto-deploy** (same as P1.7b);
  rendered UI text is byte-identical to before, so no
  user-visible change expected, but the deploy itself
  runs.
- Authoring the daily summary cleanup commit (new
  `2026-07-05_SUMMARY.md`).
- Starting any corpus refresh / pipeline task.
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
> any `main` push as a human gate; this push additionally
> triggers Vercel auto-deploy, though the served
> characters are byte-identical to before.
>
> Approving does NOT approve: (a) any runtime
> model-selection change, (b) any prompt change, (c)
> any corpus regeneration / pipeline work, (d) any
> AgentOps-2* work, (e) any `.agent/scripts/**` mod,
> (f) any OpenAI API usage in Q7 blocked sense, (g)
> G2.1d, (h) lifting any of the 3 open blockers. Each
> of those remains its own explicit human decision.
> The next step is Bohao's explicit call on the push.
