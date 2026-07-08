# DECISION · P2.0c WEB_BUNDLE_STATS drift check

> Authored by ChatGPT (human-mediated) after reading
> the RUN_REPORT, the new script, and the
> `package.json` diff. Scaffolded by
> `python .agent/scripts/new_decision.py --task-id
> 2026-07-07_run_01` (**sixteenth full loop** using
> the helper triple).

## Metadata

- **decision_id**: `2026-07-07_run_01_DECISION`
- **based_on_run_report**:
  `.agent/run_reports/2026-07-07_run_01_RUN_REPORT.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-06_run_01_DECISION.md`
  (P2.0b DECISION §follow-up recommended P2.0c ·
  build-time `WEB_BUNDLE_STATS` codegen + drift
  check; P2.0c implements the *drift-check half*
  and defers codegen)
- **based_on_design_memo**:
  `.agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md`

## Verdict

`approve`

## Reasoning summary

P2.0c successfully adds a **standalone
`WEB_BUNDLE_STATS` drift check** without
modifying production data, runtime UI, pipeline
files, prompts, model selection, OpenAI API
setup, or automation infrastructure. The new
zero-dependency Node script
(`scripts/check-web-bundle-stats.mjs`, 143 lines,
stdlib only) reads `src/data/web_bundle.json`
and `src/lib/web-bundle-stats.ts`, computes
expected values for `totalJds`, `appliedAiJds`,
`trackedCompanies`, `corpusGeneratedAt`,
`corpusSnapshotDate`, and the fixed policy
value `evidenceQuotesPerReport`, then compares
them against the manually synced
`WEB_BUNDLE_STATS` helper. The live check passes
**6/6**. `package.json` only adds a standalone
`check:web-bundle-stats` npm script; no
`package-lock.json` change or new dependency
was introduced. Build validation passed, lint
remains a pre-existing baseline issue, and no
user-visible UI changed. **Build integration
was intentionally deferred** so this task lands
as a low-risk explicit drift check before
deciding whether to gate `npm run build` later.

Independent verification against the local tree
(both P2.0c commits: `78434f0` + `c0c022b`):

- **Scope** (`git diff --name-only
  origin/main..HEAD`) = exactly the 4 approved
  paths: `.agent/tasks/2026-07-07_run_01_TASK.md`,
  `.agent/run_reports/2026-07-07_run_01_RUN_REPORT.md`,
  `scripts/check-web-bundle-stats.mjs`,
  `package.json`.
- **Script `scripts/check-web-bundle-stats.mjs`
  reviewed line by line**:
  - Node ESM, no shebang execution required
    (invoked via `node …` or `npm run
    check:web-bundle-stats`).
  - Imports: only `node:fs/promises`,
    `node:url`, `node:path` — **Node stdlib
    only**. Zero third-party dependency.
  - Reads `src/data/web_bundle.json` via
    `fs.readFile` + `JSON.parse` (NOT via
    runtime `import` with JSON attribute).
  - Reads `src/lib/web-bundle-stats.ts` as
    **text** and extracts literals via
    conservative regex (`\\b<name>\\s*:\\s*…`).
    No `tsc` / `tsx` / `ts-node` / any
    transpiler dependency.
  - Modifies nothing — script has no `writeFile`
    / `mkdir` / `unlink` / any mutating call.
  - Computes bundle-derived values:
    - `totalJds` = `bundle.n_records`,
      cross-checked against
      `bundle.records.length` (diagnostic
      emitted only if divergent).
    - `appliedAiJds` = count of records where
      `archetype === "applied_ai"`.
    - `trackedCompanies` = distinct trimmed
      non-empty `record.company` values (via
      `Set`).
    - `corpusGeneratedAt` = exactly
      `bundle.generated_at`.
    - `corpusSnapshotDate` = formatted via
      `Intl.DateTimeFormat("en-US", {
      timeZone: "UTC", month: "long", day:
      "numeric", year: "numeric" })`.
  - Treats `evidenceQuotesPerReport` as a
    **fixed policy constant** = `5`, declared
    at the top of the script as
    `POLICY_EVIDENCE_QUOTES_PER_REPORT`. Any
    policy change requires editing both the
    helper AND the script, so silent drift is
    impossible.
  - **Exit codes**: `0` PASS · `1` per-field
    mismatch (with printed diffs) · `2`
    catastrophic (missing file / parse
    failure) — all via `process.exit(N)` and
    handled at `main().catch(…)`.
- **`package.json` diff verified**:
  - Adds exactly one line under `scripts`:
    `"check:web-bundle-stats": "node
    scripts/check-web-bundle-stats.mjs"`.
  - Existing scripts (`dev`, `build`, `start`,
    `lint`, `screenshot`) are **untouched**.
  - `build` script did NOT gain any drift-check
    call — explicit deferral per TASK §
    Constraints.
  - `dependencies` / `devDependencies` are
    unchanged.
- **`package-lock.json` NOT in scope** — no
  dependency added, so no lockfile diff.
- **`src/lib/web-bundle-stats.ts` NOT modified**
  — helper's docstring is already clear; adding
  a "checked by …" reference would be clutter.
- **`src/data/web_bundle.json` NOT modified** —
  read-only inspection only.
- **Live PASS run confirmed**:
  ```
  ✓ totalJds                   443 == 443
  ✓ appliedAiJds               47 == 47
  ✓ trackedCompanies           35 == 35
  ✓ evidenceQuotesPerReport    5 == 5
  ✓ corpusGeneratedAt          "2026-05-14T02:17:04.783793+00:00" == same
  ✓ corpusSnapshotDate         "May 14, 2026" == "May 14, 2026"
  PASS: WEB_BUNDLE_STATS matches src/data/web_bundle.json
  exit=0
  ```
- **`npm run check:web-bundle-stats`** identical
  PASS via npm wrapper.
- **`npm run build`** — Compiled, all 14 static
  pages generated.
- **`npm run lint`** — 37 pre-existing errors
  identical class distribution as prior loops;
  none introduced by this task (the new
  `scripts/*.mjs` file is outside the eslint
  config's targeted paths).
- **Screenshot NOT run** — no user-visible UI
  change, no `src/app/**` diff.
- **Forbidden empty diffs**:
  `.agent/scripts/**` ✓, `.agent/blockers.md` ✓,
  `.agent/automation_queue.md` ✓,
  `.agent/policies/**` ✓, `.agent/templates/**` ✓,
  `src/data/**` ✓, `src/lib/prompts.ts` ✓,
  `src/lib/models-display.ts` ✓,
  `src/lib/corpus.ts` ✓,
  `src/lib/web-bundle-stats.ts` ✓,
  `src/app/api/**` ✓, `src/app/**/page.tsx` ✓,
  `.github/workflows/**` ✓,
  `package-lock.json` ✓, `.env*` ✓,
  `vercel.json` ✓, `.vercel/**` ✓.
- **Pipeline repo** untouched — HEAD =
  `b019786` at start AND end. `git status`
  clean throughout.
- **No collector invocation**. No `python -m
  scripts.collector …` anywhere.
- **No LLM call** by this task. No `anthropic`
  / `openai` SDK.
- **No runner / daemon / cron / scheduler / GH
  Actions / Codex config / Claude config /
  OpenAI SDK / manual deploy** anywhere.
- **Queue + blockers**: `automation_queue.md`
  and `blockers.md` not touched. QUEUE-0002
  still `blocked_pending_human` red. BLK-0001
  / BLK-0002 / BLK-0003 all still `open`.

The work meets every Acceptance criterion in the
TASK (24 items, all verifiable per RUN_REPORT +
live PASS run). Approving on technical
execution. Push to `origin/main` remains a
separate human-approval gate per policy §3.
This push is **user-visibly a no-op** — no
`src/**` change, no `src/data/**` change, no
runtime code path change. Only new tooling
lands on `origin/main`.

## Risks found

1. **The drift check is standalone and does not
   yet gate `npm run build`**. It runs only
   when a developer (or a future CI job)
   invokes it explicitly. Severity: **medium**.
   Mitigation: build-time integration is
   scoped as a separate future TASK if drift
   becomes a recurring problem or the
   P2.0-g promotion plan requires it.
2. **Developers must remember to run
   `npm run check:web-bundle-stats`** before
   editing `WEB_BUNDLE_STATS` or committing a
   refreshed `web_bundle.json`. Severity:
   **medium** (same class as risk 1).
   Mitigation: helper's docstring reminds
   editors; DECISION §non-blocking followups
   suggests a future build-gate task.
3. **`WEB_BUNDLE_STATS` remains manually
   synced** from `web_bundle.json`. This check
   **detects** drift but does not **auto-fix**
   it. A future codegen task would replace the
   manual sync entirely. Severity: **medium**
   (unchanged from P2.0b state).
4. **The script parses
   `src/lib/web-bundle-stats.ts` as text**, so
   major formatting changes (e.g. multi-line
   number literals, renaming fields,
   introducing computed properties) could
   require script updates. Severity: **low
   (documented; regex is conservative)**.
5. **`evidenceQuotesPerReport` is treated as a
   fixed policy constant (5)**, not derived
   from `web_bundle.json`. Any policy change
   requires editing both the helper AND the
   script, which is the intended behavior but
   worth noting. Severity: **acceptable by
   design**.
6. **No codegen was added in this task.** The
   `.generated.ts` half of the P2.0b DECISION
   §follow-up remains deferred. Severity:
   **n/a — deliberate scope decision**.
7. **`package.json` changed, but
   `package-lock.json` did not**, because no
   dependency was added. This is the correct
   state, but if a future CI tool
   auto-regenerates the lockfile, it may
   produce a spurious diff. Severity: **low
   (verified clean this loop)**.
8. **`npm run lint` still fails due to
   pre-existing baseline issues** — 37 errors
   across `src/app/methodology/page.tsx`,
   `src/app/snapshot-pipeline/page.tsx`, and
   one `react-hooks/set-state-in-effect` at
   `src/app/page.tsx:473`. None introduced by
   this task. Severity: **acceptable
   (pre-existing baseline, unchanged since
   P1.7c)**.
9. **This task does not refresh corpus or
   promote a newer bundle.** The served
   `web_bundle.json` remains dated 2026-05-14
   (~7.5 weeks old today). Severity: **n/a —
   out of P2.0c scope by design**.
10. **This task does not solve the 8-source
    pipeline registry coverage gap.** The
    pipeline bundle still has 8 companies vs
    served 35. Registry expansion remains
    scoped to P2.0f. Severity: **n/a — out of
    P2.0c scope by design**.
11. **Future build-time integration should be
    a separate task if desired.** Wiring the
    drift check into `next build` or CI is a
    non-trivial second decision (blocks build
    on transient state) and should not be
    smuggled in with this drift-check
    landing. Severity: **acceptable —
    documented as follow-up**.
12. **G2.1d remains blocked by BLK-0001**
    (red-zone: classifier prompt rewrite +
    `CLASSIFIER_VERSION` bump). Severity:
    **n/a by design**.
13. **Full automation remains blocked by
    BLK-0002**. Any real Automation Window
    requires (a) the runner to exist with its
    own DECISION AND (b) explicit human
    resolution of BLK-0002. Severity: **n/a
    by design**.
14. **OpenAI API remains blocked by BLK-0003
    (Q7-scoped, standing)**. This task
    introduced no OpenAI API usage. Severity:
    **n/a by design**.

## Red-zone flags

`none` for P2.0c.

No `src/lib/prompts.ts`, no `src/lib/anthropic.ts`
(not present), no `src/data/web_bundle.json`,
no `src/lib/corpus.ts`, no `src/app/api/**`
(runtime model selection), no `package-lock.json`,
no `.env*`, no `vercel.json`, no `.vercel/**`,
no `.github/workflows/**` changed. No pipeline-
repo file changed at all — pipeline inspection
was read-only only. No Codex CLI config, Claude
Code config, or OpenAI SDK introduced. No
`.agent/scripts/**` edited (hard rule per
Q3-Q8 of AgentOps-2c DECISION). No executable
runner / shell script / config / cron / hook
file created anywhere. No collector
invocation. No LLM call. No new npm
dependency. No manual deploy.

## Required fixes

`none`

Scope is clean (4 paths, all approved), the
script is zero-dependency Node stdlib only, the
live PASS run confirms all 6 fields match, the
`package.json` diff is exactly one script entry
with no dependency change and no lockfile
change, `src/lib/web-bundle-stats.ts` is
correctly untouched, `src/data/web_bundle.json`
is byte-identical, `npm run build` passes,
`npm run lint` baseline unchanged, and all 24
TASK acceptance criteria are demonstrably met.
The intentional deferral of build integration
is well-justified in the RUN_REPORT §"Build
integration decision". No forbidden / red-zone
/ pipeline / runner / OpenAI / config /
executable / `.agent/scripts` / prompts /
runtime-selection / data path was touched.

## Non-blocking follow-ups

- **After DECISION approval and push** → update
  the daily summary. Extend
  `.agent/daily_summaries/2026-07-07_SUMMARY.md`
  (create if it doesn't exist yet) with a
  P2.0c section documenting the 2 commits,
  the new script, the `package.json` npm script
  addition, the PASS live run, and confirmation
  that this push is user-visibly a no-op.
- **Consider a future task to wire
  `check:web-bundle-stats` into build or CI**
  (either as a `prebuild` script or a GitHub
  Actions step), **but do not do it now**.
- **Consider future codegen only after the
  standalone drift check proves useful** in
  day-to-day use. If it never fires, codegen
  is unnecessary complexity.
- **Do NOT run collector** as a side effect.
- **Do NOT refresh corpus**.
- **Do NOT swap `web_bundle.json`**. P2.0a
  memo §7 gate 2 (`unique_companies ≥ 35`)
  still arithmetically blocks today's
  pipeline bundle.
- **Do NOT modify pipeline files.**
  `sources.yaml`, `corpus/**`,
  `scripts/collector/**`,
  `.github/workflows/**` all stay frozen.
- **Do NOT modify `src/data/**`.**
- **Do NOT start G2.1d.** BLK-0001 still
  `open`.
- **Do NOT resume automation-infra.** Per
  AgentOps-2c Q10, automation-infra is paused;
  product/tooling work continues.
- **Do NOT introduce OpenAI API** in any Q7
  blocked sense.
- **Do NOT deploy manually.** Vercel
  auto-deploy from the eventual push is the
  only sanctioned deploy path.
- **Do NOT modify `.agent/scripts/**`** (hard
  rule per AgentOps-2c Q3-Q8).

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main`
   of the pipeline repo.
2. Do NOT push either repo. The web repo will be
   ahead of origin/main by 3 commits at that
   point (`78434f0` impl + `c0c022b` RUN_REPORT
   + this DECISION); push requires Bohao's
   explicit "push P2.0c" instruction. **This
   push is user-visibly a NO-OP** — no
   `src/**` runtime path changed, no
   `src/data/**` changed, only tooling
   (`scripts/*.mjs` + `package.json` script
   entry) lands on `origin/main`.
3. Do NOT deploy manually. Vercel auto-deploy
   from the eventual push handles this.
4. Do NOT start build integration or codegen.
   Both remain separate future TASKs with their
   own scope-and-approve loop.
5. Do NOT start any P2.0d/e/f/g work. Each
   remains a separate future TASK.
6. Do NOT run collector. No `python -m
   scripts.collector …`, no `dry-run`, no
   `clean-preview`, no `run`.
7. Do NOT refresh corpus. `web_bundle.json` /
   `web_bundle_pipeline.json` /
   `web_bundle_staging.json` all stay frozen.
8. Do NOT modify pipeline files. `sources.yaml`,
   `corpus/**`, `scripts/collector/**`,
   `.github/workflows/**` all stay frozen.
9. Do NOT modify `src/data/**`. Bundle in the
   web repo stays frozen.
10. Do NOT modify `.agent/scripts/**`. Hard
    rule per AgentOps-2c Q3-Q8.
11. Do NOT start G2.1d. BLK-0001 still `open`.
12. Do NOT resume automation-infra. Q10 pause
    continues.
13. Do NOT introduce OpenAI API in any Q7
    blocked sense.
14. Do NOT modify runtime model selection
    (`src/app/api/**` stays frozen).
15. Do NOT modify prompts (`src/lib/prompts.ts`
    stays frozen).
16. Do NOT modify existing npm scripts (`dev`,
    `build`, `start`, `lint`, `screenshot`) or
    add any new npm dependency without a
    separate TASK + DECISION loop.
17. Do NOT lift any of the 3 open blockers
    (BLK-0001 / BLK-0002 / BLK-0003) without
    explicit written human resolution.

The next likely promote step is:
- `git push origin main` from the web repo (3
  commits land on `origin/main`: `78434f0` +
  `c0c022b` + this DECISION). Vercel
  auto-deploys but produces no user-visible
  change.
- Then extend/create the 2026-07-07 daily
  summary with a P2.0c section; commit + push.
- Then, per this DECISION's follow-up, the
  natural options are (a) let the drift check
  soak in day-to-day use before deciding on
  build-time integration, or (b) start
  another small product task of Bohao's
  choosing.

Wait for Bohao's explicit "push P2.0c" before
doing anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of
  `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which will deliver 3 commits — `78434f0`
  (impl), `c0c022b` (RUN_REPORT), and this
  DECISION commit once it lands). This push
  triggers Vercel auto-deploy but is
  **user-visibly a no-op** — no runtime code
  path or product surface changed; only new
  tooling files land on `origin/main`.
- Authoring the daily summary cleanup commit
  (create/extend `2026-07-07_SUMMARY.md`).
- Starting P2.0d, P2.0e, P2.0f, P2.0g or
  build-time integration in any order.
- Any pipeline file edit (`sources.yaml`,
  `corpus/**`, `scripts/collector/**`,
  `.github/workflows/**`).
- Any `src/data/**` edit.
- Any collector run (`python -m
  scripts.collector …`).
- Any corpus refresh.
- Any `.agent/scripts/**` mod.
- Any AgentOps-2* work (per Q10 pause).
- Any runtime model-selection change
  (`src/app/api/**` frozen).
- Any prompt change (`src/lib/prompts.ts`
  frozen).
- Any new npm dependency or
  `package-lock.json` change.
- Any modification of existing npm scripts.
- Any G2.1d (red) work.
- Any OpenAI API usage in Q7 blocked sense.
- Any manual `vercel deploy`.
- Lifting any of the 3 open blockers
  (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical execution
> captured in the RUN_REPORT + the new script
> + the `package.json` diff. Standing policy
> treats any `main` push as a human gate. This
> push additionally is user-visibly a no-op —
> only tooling lands.
>
> Approving this DECISION:
>
> - Records the P2.0c drift check as
>   technically correct (script is zero-
>   dependency stdlib only, live PASS 6/6,
>   `package.json` only adds one script,
>   `package-lock.json` unchanged, no
>   `src/**` runtime path touched).
> - Endorses the "standalone tool first"
>   approach and the deliberate deferral of
>   build integration and codegen.
> - Endorses letting the drift check soak in
>   day-to-day use before deciding on
>   build-time integration.
>
> Approving does NOT approve: (a) build
> integration (wire into `next build` or CI),
> (b) codegen (`.generated.ts`), (c) any
> pipeline file edit, (d) any bundle swap,
> (e) any collector run, (f) any AgentOps-2*
> work, (g) any `.agent/scripts/**` mod,
> (h) any runtime model-selection change or
> prompt change, (i) any new npm dependency
> or `package-lock.json` change, (j) any
> OpenAI API usage in Q7 blocked sense,
> (k) G2.1d, (l) lifting any of the 3 open
> blockers. Each of those remains its own
> explicit human decision. The next step is
> Bohao's explicit call on the push.
