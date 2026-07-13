# DECISION · AgentOps-3e minimal local Playwright regression prototype

> Authored by ChatGPT (human-mediated) after
> reading the RUN_REPORT + inspecting the
> 458-line harness + all 3 committed run
> artifacts. Scaffolded by
> `python .agent/scripts/new_decision.py
> --task-id 2026-07-12_run_03` (**twenty-
> fourth full loop** using the helper
> triple).

## Metadata

- **decision_id**: `2026-07-12_run_03_DECISION`
- **based_on_run_report**:
  `.agent/run_reports/2026-07-12_run_03_RUN_REPORT.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-12_run_02_DECISION.md`
  (AgentOps-3d · endorsed 3e as
  default next code loop + 14
  initial answers).
- **based_on_first_run_artifact**:
  `.agent/regression_runs/20260712T235033Z_fixture-A/verdict.md`
  (verdict = AMBER, exit code 2).

## Verdict

`approve`

## Reasoning summary

AgentOps-3e successfully completed the
**first real local report regression run**
end-to-end:

- **Fixture A** was used
  (`.agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md`).
- **`localhost:3000`** was the target
  (never production).
- **Playwright CLI headless Chromium**
  was the execution channel (not MCP).
- **One real generation** happened
  through the local Next.js runtime
  (~$0.05 estimated Sonnet 4.6 cost;
  well under the $0.25 hard cap).
- **Report was captured** (17181 chars
  via `page.locator("body").innerText()`).
- **Metadata, structural checks, and
  verdict artifacts were written**
  under
  `.agent/regression_runs/20260712T235033Z_fixture-A/`
  and committed.
- **Verdict = AMBER** (exit code 2).
- **The only amber failure** was
  `report_length_in_soft_band` — chars
  17181 vs band 1500-6000.
- **The amber was caused by
  `body.innerText()` capturing the
  full page** (hero + form + report
  card + methodology strip + footer),
  not only the report card. **This is
  a harness v1 tuning finding, not
  evidence of product regression.**
- **All red checks passed** — every
  hard-fail check succeeded.
- **Candidate 1 sentinel worked**:
  incomplete banner absent.
- **5 required sections + Evidence
  Appendix** all present in the
  generated report.
- **Fixture-specific checks passed**:
  ≥2 expected strengths reflected,
  ≥2 expected gaps reflected, **zero**
  must-not-happen matches,
  recommendation roughly matched
  expected next action.
- **Operational checks passed**:
  duration 73389 ms (< 120s soft, <
  240s hard), no fatal Playwright
  error, no production target.

**Boundaries strictly held**:

- **No production target** — every
  request went to `http://localhost:3000`
  and the harness hard-rejects
  non-localhost hosts.
- **No baseline promotion** — no
  file promoted to a baseline status;
  this is the first-ever regression
  run.
- **No full report.md or
  screenshot.png committed** —
  large artifacts live in
  `/var/folders/.../acr-regression-runs/…/`
  scratchpad only; only lightweight
  `metadata.json` +
  `structural_checks.json` +
  `verdict.md` (4.8 KB total)
  landed in the repo.
- **No `.agent/scripts/**` changes**
  (hard rule per AgentOps-2c Q3-Q8);
  harness script lives at
  `scripts/report-regression-local.mjs`
  per AgentOps-3d roadmap §20.1.
- **No `src/**` changes**.
- **No pipeline changes** (HEAD
  `b019786` at start and end).
- **No new npm dependency** (imports
  only Playwright [already
  devDep] + Node stdlib).
- **No `package-lock.json` change**.
- **No `.env*` read** by the harness
  script.
- **No `anthropic` / `openai` HTTP
  call** by the harness (LLM call
  went through the running Next.js
  app via `.env.local`-configured
  Anthropic key).
- **No collector run**.
- **No corpus refresh**.
- **No GitHub Actions changes**.
- **No push / no manual deploy**.

Independent verification against the
local tree (both commits: `36cd001`
+ `ebc8459`):

- **Scope** (`git diff --name-only
  origin/main..HEAD`) = exactly the
  6 approved paths (1 TASK + 1
  harness script + 3 run artifacts
  + 1 RUN_REPORT).
- **All 32 TASK acceptance
  criteria** demonstrably met per
  RUN_REPORT.
- **verdict.md** reads: `Verdict:
  AMBER`, `Exit code: 2`,
  `Report length: 17181 chars`,
  `Red checks failed: none`,
  `Amber checks failed:
  report_length_in_soft_band`.
- **metadata.json** shows
  `cost_measured: false` +
  `cost_cap_enforced_by:
  single_generation_limit` —
  matches AgentOps-3d DECISION
  §13 stance.
- **structural_checks.json**
  shows all `level: red`
  entries pass; only one
  `level: amber` entry fails
  (`report_length_in_soft_band`).
- **Pipeline repo** untouched —
  HEAD `b019786` at start AND
  end. `git status` clean
  throughout.
- **Queue + blockers**:
  `automation_queue.md` and
  `blockers.md` not touched.
  QUEUE-0002 still
  `blocked_pending_human` red.
  BLK-0001 / BLK-0002 /
  BLK-0003 all still `open`.

Approving on technical execution +
first-run diagnostic quality. Push to
`origin/main` remains a separate
human-approval gate. This push is
**yellow-adjacent**: `scripts/*.mjs`
is not a runtime file (no
`src/**` change; no Vercel deploy
consequence beyond a rebuild) but
does add a new capability to the
repo (harness script). Same
class as P2.0c's drift check
push.

## Approved direction

- **Approve AgentOps-3e** as a
  **successful minimal local
  Playwright regression prototype**.
- **Do NOT integrate the verdict
  into RUN_REPORT template or
  planner reports yet** — that
  waits for AgentOps-3f as a
  separate loop and should only
  happen after the length-band
  measurement noise is fixed.
- **Next recommended loop after
  push / cleanup**:
  **AgentOps-3e-tune — narrow
  report capture**.
  - Preferred fix: **capture only
    the actual generated report
    content** (locator on the
    report-card `<ReactMarkdown>`
    region) instead of full-page
    `body.innerText()`.
  - Alternative fix: widen the
    soft length band to reflect
    whole-body scope
    (~8000-25000 chars).
  - Recommendation: capture-
    narrowing is more principled —
    the check should measure what
    it claims to measure. The
    length-band-widening is a
    second-best workaround.
- **Keep Fixture A only** in the
  3e-tune loop.
- **Keep localhost only.**
- **Keep Playwright CLI** (no
  MCP).
- **Do NOT promote baseline
  yet** — v1 amber is measurement
  noise; the first baseline
  should be established from a
  clean-green run in 3e-tune.
- **Do NOT run production.**
- **Do NOT run the A-E full
  suite yet** — one fixture at a
  time until the plumbing is
  trustworthy.

## Risks found

1. **Current capture is too broad
   and creates false amber.**
   Severity: **known · fixable**.
   Mitigation: 3e-tune loop
   above.
2. **The prototype only covers
   Fixture A.** Severity:
   **acceptable by design** —
   AgentOps-3d §20 pins A-E
   expansion to a later phase.
3. **Cost is estimated, not
   measured exactly.** Severity:
   **acceptable in v1** — the
   single-generation policy
   bounds it below the $0.25
   hard cap; metadata records
   `cost_measured: false`.
4. **Future runs incur API cost.**
   Severity: **medium**.
   Mitigation: AgentOps-3d
   §13 budget caps ($25/mo,
   $0.25/run) + §17.1
   "regression required" list
   keeps runs bounded to
   report-affecting tasks.
5. **Keyword / rubric checks
   are still primitive.**
   Severity: **medium**.
   Mitigation: AgentOps-3d
   §11 explicitly defers
   semantic rubric to a later
   phase; substring-token
   heuristics are the
   deliberate v1 posture.
6. **No baseline has been
   promoted.** Severity:
   **acceptable by design** —
   AgentOps-3d §9 pins
   baseline promotion through
   TASK + RUN_REPORT +
   DECISION only, and the
   first baseline should
   come from a clean-green
   run post-3e-tune.
7. **This should NOT become a
   formal gate until 3e-tune
   fixes capture noise.**
   Severity: **hard rule**.
   Mitigation: DECISION §
   Approved direction above +
   AgentOps-3f is explicitly
   deferred until after
   3e-tune.

## Red-zone flags

`none` for AgentOps-3e.

No `src/lib/prompts.ts`, no
`src/lib/anthropic.ts` (not
present), no
`src/data/web_bundle.json`, no
`src/lib/corpus.ts`, no
`src/app/api/**`, no
`package.json`, no
`package-lock.json`, no
`.env*`, no `vercel.json`, no
`.vercel/**`, no
`.github/workflows/**`
changed. No pipeline-repo file
changed at all. No Codex CLI
config, Claude Code config, or
OpenAI SDK introduced. No
`.agent/scripts/**` edited
(hard rule per Q3-Q8 of
AgentOps-2c DECISION). No new
npm dependency. No manual
deploy. **The `scripts/*.mjs`
harness lives under repo-root
`scripts/`** per
AgentOps-3d §20.1
(same convention as
`scripts/screenshot.mjs` and
`scripts/check-web-bundle-stats.mjs`).

## Required fixes

`none for approving the
prototype`

The AMBER verdict comes from a
harness-side measurement noise
(`body.innerText()` vs
report-card innerText),
NOT from a report-quality
regression. All red-level
checks pass; every real
quality signal (Candidate 1
sentinel intact, all 5
sections present, Evidence
Appendix present, zero
must-not-happen matches,
strengths + gaps reflected,
recommendation matches) is
green. The amber is
diagnostic information for the
next tune loop, not a fix
required before approving 3e.

## Non-blocking follow-ups

- **After DECISION approval
  and push** → update daily
  summary. Extend
  `.agent/daily_summaries/2026-07-12_SUMMARY.md`
  (or create a fresh
  `2026-07-13_SUMMARY.md`)
  with an AgentOps-3e section
  documenting the 3 commits,
  the first regression run's
  AMBER verdict + the
  measurement-noise root
  cause + the 3e-tune
  direction.
- **Next default loop**:
  **AgentOps-3e-tune — narrow
  report capture** (yellow,
  1 runtime file =
  `scripts/report-regression-local.mjs`).
- **Do NOT integrate verdict
  into RUN_REPORT template
  yet** — that's 3f, after
  3e-tune.
- **Do NOT run production.**
- **Do NOT promote
  baseline.**
- **Do NOT run A-E full
  suite yet.**
- **Do NOT modify
  `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline
  files.**
- **Do NOT run collector.**
- **Do NOT refresh corpus.**
- **Do NOT introduce OpenAI
  API** in Q7-blocked
  senses.
- **Do NOT modify GitHub
  Actions.**
- **Do NOT push until
  explicit human approval.**

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo.
   Stay on `main` of the pipeline
   repo.
2. Do NOT push either repo. The web
   repo will be ahead of origin/main
   by 3 commits at that point
   (`36cd001` impl + `ebc8459`
   RUN_REPORT + this DECISION); push
   requires Bohao's explicit
   "push AgentOps-3e" instruction.
   Yellow-adjacent push:
   `scripts/*.mjs` is not a runtime
   file, so user-visible surface
   remains unchanged.
3. Do NOT deploy manually. Vercel
   auto-deploy from the eventual
   push handles this, but produces
   no user-visible change.
4. Do NOT start AgentOps-3e-tune
   or AgentOps-3f yet.
5. Do NOT run additional Playwright.
6. Do NOT run additional report
   generation.
7. Do NOT promote baseline.
8. Do NOT commit full report.md or
   screenshot.png.
9. Do NOT call Anthropic / OpenAI
   APIs outside the local app.
10. Do NOT implement Codex planner.
11. Do NOT create
    `.agent/planner_reports/`.
12. Do NOT modify
    `.agent/scripts/**`. Hard rule
    per AgentOps-2c Q3-Q8.
13. Do NOT modify `src/**`.
14. Do NOT modify pipeline files.
15. Do NOT run collector.
16. Do NOT refresh corpus.
17. Do NOT modify GitHub Actions.
18. Do NOT modify runtime model
    selection (`src/app/api/**`
    stays frozen).
19. Do NOT modify prompts
    (`src/lib/prompts.ts` stays
    frozen).
20. Do NOT add any new npm
    dependency or `package.json`
    entry.
21. Do NOT lift any of the 3 open
    blockers (BLK-0001 / BLK-0002 /
    BLK-0003) without explicit
    written human resolution.
22. Do NOT bundle 3e-tune + 3f.

The next likely promote step is:
- `git push origin main` from the
  web repo (3 commits land on
  `origin/main`: `36cd001` +
  `ebc8459` + this DECISION).
  Vercel auto-deploys but
  produces no user-visible
  change (no `src/**` diff).
- Then extend/create the daily
  summary with an AgentOps-3e
  section; commit + push.
- Then, per this DECISION's
  §non-blocking-followups, the
  natural next TASK is
  **AgentOps-3e-tune — narrow
  report capture** (yellow;
  1 runtime file =
  `scripts/report-regression-local.mjs`).
  Bohao's explicit
  "start AgentOps-3e-tune"
  message opens it.

Wait for Bohao's explicit
"push AgentOps-3e" before doing
anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main`
  of
  `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which will deliver 3 commits —
  `36cd001` (impl), `ebc8459`
  (RUN_REPORT), and this
  DECISION commit once it
  lands). This push triggers
  Vercel auto-deploy but is
  **user-visibly a no-op** —
  no `src/**` runtime path
  changed; `scripts/*.mjs`
  files do not participate in
  the Next.js build output.
- Authoring the daily summary
  cleanup commit.
- Starting AgentOps-3e-tune or
  3f.
- Running additional
  Playwright / additional
  report generation.
- Promoting a baseline.
- Committing full report.md
  or screenshot.png.
- Any pipeline file edit.
- Any `src/data/**` edit.
- Any collector run.
- Any corpus refresh.
- Any `.agent/scripts/**` mod.
- Any AgentOps-2* work (per
  Q10 pause).
- Any runtime model-selection
  change.
- Any prompt change.
- Any new npm dependency or
  `package-lock.json` change.
- Any G2.1d (red) work.
- Any OpenAI API usage in
  Q7-blocked sense.
- Any manual `vercel deploy`.
- Any `.agent/policies/**` or
  `.agent/templates/**` edit.
- Lifting any of the 3 open
  blockers (BLK-0001 /
  BLK-0002 / BLK-0003).

> Verdict is `approve` for
> technical execution captured
> in the RUN_REPORT + the
> committed run artifacts +
> the 458-line harness script.
> Standing policy treats any
> `main` push as a human gate.
> This push is
> **user-visibly a no-op** —
> `scripts/*.mjs` is not a
> runtime file; the harness
> only runs when Bohao
> invokes it.
>
> Approving this DECISION:
>
> - Records the harness as
>   **`reviewed_approved`**
>   for the AgentOps-3 track.
> - Records the first-ever
>   regression run
>   (`20260712T235033Z_fixture-A`)
>   with verdict = AMBER,
>   driven by a
>   measurement-noise root
>   cause (`body.innerText()`
>   over-captures), NOT by a
>   report-quality regression.
> - Endorses the artifact
>   split (small
>   committed / large
>   scratchpad).
> - Endorses **AgentOps-3e-
>   tune (narrow report
>   capture)** as the
>   natural next code loop.
> - Records the boundary:
>   **verdict must NOT
>   become a formal push
>   gate until 3e-tune fixes
>   capture noise**.
>
> Approving does NOT
> approve: (a) starting
> AgentOps-3e-tune or 3f
> yet, (b) running the
> harness against A-E,
> (c) production target,
> (d) baseline promotion,
> (e) any prompt / model /
> API-route change, (f) any
> `.agent/scripts/**` mod,
> (g) any OpenAI API usage
> in Q7-blocked senses,
> (h) G2.1d, (i) lifting
> any of the 3 open
> blockers.
