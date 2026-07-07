# DECISION · P2.0a data freshness corpus promotion design memo

> Authored by ChatGPT (human-mediated) after reading the
> RUN_REPORT and the full design memo. Scaffolded by
> `python .agent/scripts/new_decision.py --task-id 2026-07-05_run_04`
> (**fourteenth full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-05_run_04_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-07-05_run_04_RUN_REPORT.md`
- **based_on_design_memo**: `.agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md`

## Verdict

`approve`

## Reasoning summary

P2.0a successfully produces a design-only memo for data
freshness and corpus promotion **without modifying
production data, pipeline files, prompts, runtime model
selection, OpenAI API setup, or automation
infrastructure**. All read-only inspection was strictly
that — no `git add` in the pipeline repo, no `>` redirect,
no editor opened on any pipeline file, and no collector
invocation.

The memo's most important finding, which reframes what
"data freshness improvement" actually means for this
project: **a naive production swap from the served
May 2026 `web_bundle.json` to the newer
`web_bundle_pipeline.json` would be a credibility
regression, not an improvement.** The pipeline bundle
has only **8 companies** and **32** `applied_ai` records
compared with the served bundle's **35 companies** and
**47** `applied_ai` records. Any promotion under the
current source-registry state (8 automated sources) would
undo the P1.7 + P1.8 credibility cluster on hero /
sample-report / methodology — all of which now display
counts (35 companies, 47 applied_ai) that the pipeline
bundle cannot support.

The memo correctly recommends a **staged approach**
starting with visible corpus snapshot-date disclosure
(P2.0b) rather than any bundle swap or corpus refresh.
The task stayed within design scope and maintained all
hard boundaries.

Independent verification against the live tree on `main`:

- **Scope** (`git diff --name-only origin/main..HEAD`) is
  exactly the 3 approved paths:
  `.agent/tasks/2026-07-05_run_04_TASK.md`,
  `.agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md`,
  `.agent/run_reports/2026-07-05_run_04_RUN_REPORT.md`.
- **Memo structural check**: 718 lines (within the
  400-800 target; under 1200 stop-cap). 11 H2 sections
  (10 required + 1 `Status` header). All 10 required
  sections present in order: Problem, Current state,
  Source-of-truth map, Risks, Promotion path options,
  Recommended staged plan, Acceptance criteria for future
  promotion, Rollback plan, Explicit non-goals,
  Recommended next task.
- **Memo cites preflight facts**: §2.1's 3-bundle table
  with sizes / `generated_at` / `n_records` / unique
  companies / `applied_ai` counts is verbatim from
  read-only pipeline inspection.
- **Memo compares 5 options** (A no-op / B stats codegen /
  C preview-only / D production swap / E full automation).
  Each has expected value, risk, files-touched,
  human-approval requirement, green/yellow/red
  classification, and why-now / why-not-now analysis.
- **Memo defines 12 concrete acceptance gates** in §7 for
  any future promotion (record threshold, company
  threshold, applied_ai sanity, duplicate rate, empty
  fields, attribution/compliance, archetype distribution,
  sample-page render, `npm run build`, `WEB_BUNDLE_STATS`
  refresh, rollback path, human + ChatGPT sign-off).
- **Memo names exactly one recommended next task**: P2.0b
  visible corpus snapshot-date disclosure (§10).
- **Memo §9 explicit non-goals** lists all required
  items: no G2.1d, no classifier prompt changes, no
  OpenAI API, no autonomous promotion, no automatic
  production swap, no pipeline file edits without
  separate approval, no `.agent/scripts` changes, plus 5
  additional items (runtime API-route, prompts, corpus
  regeneration, collector.db mutation, push/deploy).
- **Forbidden audit**: empty diff on `src/**`,
  `src/data/**`, `src/lib/web-bundle-stats.ts`,
  `src/lib/models-display.ts`, `src/lib/prompts.ts`,
  `src/lib/corpus.ts`, `src/app/api/**`,
  `src/app/**/page.tsx`, `src/components/**`,
  `package.json`, `package-lock.json`, `.env*`,
  `vercel.json`, `.vercel/**`, `.github/workflows/**`,
  `.agent/policies/**`, `.agent/templates/**`,
  `.agent/scripts/**` (**hard rule per AgentOps-2c
  Q3-Q8**), `.agent/blockers.md`,
  `.agent/automation_queue.md`.
- **Pipeline repo** untouched (`b019786` = `origin/main`;
  clean) at both run start and end. All inspection was
  via `head`, `grep`, `wc`, `ls`, and one
  `python3 -c "import json; …"` metadata pull that reads
  local files with no external network.
- **No collector invocation**. No `python -m
  scripts.collector`, no `dry-run`, no `clean-preview`,
  no `run`, no `list`, no `review`, no `npm run
  collect`.
- **No LLM call** by this task. No `anthropic` /
  `openai` SDK invocation.
- **No runner / daemon / cron / scheduler / GitHub
  Actions edit / OpenAI SDK install / Codex / Claude
  config mutation / new dependency / manual deploy**
  anywhere.
- **Queue + blockers**: `automation_queue.md` and
  `blockers.md` not touched. QUEUE-0001 / QUEUE-0004 /
  QUEUE-0006 / QUEUE-0007 / QUEUE-0008 all still `done`.
  QUEUE-0002 still `blocked_pending_human` red.
  QUEUE-0003 / QUEUE-0005 unchanged. BLK-0001 / BLK-0002 /
  BLK-0003 all still `open`.

The work meets every Acceptance criterion in the TASK
(all 18 boxes verifiable per RUN_REPORT). Approving on
technical execution. Push to `origin/main` remains a
separate human-approval gate per policy §3. Unlike P1.7c
/ P1.8a / P1.8b, **this push would be a no-op
user-visibly** because the change is `.agent/`-only —
served bundle byte-identical, so Vercel auto-deploy has
nothing to render differently.

## Key memo findings (independently verified)

### Bundle metadata (read-only preflight)

| bundle | `generated_at` | `n_records` | companies | `applied_ai` |
|---|---|---|---|---|
| Served `web_bundle.json` | **2026-05-14** | 443 | **35** | 47 |
| Pipeline `web_bundle_pipeline.json` | 2026-06-28 | 519 | **8** | 32 |
| Staging `web_bundle_staging.json` | 2026-05-19 | 404 | 8 | 15 |

### Naive-swap regression analysis

A naive production swap
`web_bundle.json ← web_bundle_pipeline.json` today would:

- ✓ +45 days fresher
- ✓ +17% record count (443 → 519)
- ✗ **−77% company count (35 → 8)**
- ✗ −32% applied_ai count (47 → 32)

The regression on unique companies and applied_ai counts
is a straight credibility loss. Every P1.7 + P1.8 surface
now says "35 curated companies" / "47 applied_ai JDs" —
a naive swap would make those numbers immediately wrong
in the opposite direction from stale.

### Root cause

Pipeline `sources.yaml` automated registry currently has
only **8 sources** (post-F2.6 expansion on 2026-05-19).
The served May 2026 bundle was produced by a broader
manually-curated collection that included ~27 additional
companies not yet configured for automated Greenhouse /
Ashby fetch. Bundle promotion cannot precede registry
expansion (P2.0f) without either regressing coverage or
adopting a hybrid served-set strategy.

### Recommended staged plan (accepted)

Memo §6, verbatim, sequential (no parallelization):

- **P2.0b** — Visible corpus snapshot-date disclosure
  (recommended next task)
- **P2.0c** — Build-time `WEB_BUNDLE_STATS` codegen +
  drift check
- **P2.0d** — Read-only audit of pipeline bundle against
  §7 gates
- **P2.0e** — Formalize promotion checklist + rollback
  plan
- **P2.0f** — `sources.yaml` registry expansion design
  memo (closes 35 → 8 gap)
- **P2.0g** — Production bundle swap (only after
  P2.0b-f converge)

## Risks found

1. **Served bundle is stale**: `generated_at` =
   2026-05-14; ~7.5-week gap between served and today's
   date. This is the top-ranked remaining trust risk
   after P1.7+P1.8 (per strategic review). Severity:
   **high (product surface)** / **low (technical)** —
   nothing is broken.
2. **Pipeline bundle is fresher but currently narrower**:
   8 companies vs served 35. This registry gap is why
   naive promotion is a credibility regression.
   Severity: **high** (blocks any near-term swap
   without a hybrid or registry-expansion strategy).
3. **Naive production swap would regress credibility**
   (see §2.7 of the memo). Severity: **high / actively
   blocked by §7 gate 2 (`unique_companies ≥ 35`)**.
4. **`WEB_BUNDLE_STATS` is still manually synced** and
   may drift silently if `web_bundle.json` changes
   without a matching helper refresh. Currently 4
   consumers (hero, sample-report, methodology, plus
   any downstream page). Severity: **medium**.
   Mitigation: memo's P2.0c stage adds a build-time
   codegen + drift check.
5. **Current pipeline registry has only 8 sources**, so
   it cannot yet replace the broader served snapshot.
   Severity: **high (for promotion path)**. Mitigation:
   P2.0f is a design memo for registry expansion; no
   promotion until it lands.
6. **There appears to be a gap between daily automation
   output and production-serving data**: last dated cron
   commit is 2026-06-28 (pipeline repo), current is
   2026-07-06. The cron either stopped, saw no
   commitable delta for 8 days, or is throttled by GH
   Actions. Severity: **medium**. Mitigation: any
   P2.0-anything TASK should re-check the pipeline
   `git log` for a recent cron commit before starting.
7. **Future corpus promotion may become red/yellow**
   depending on files touched. Any TASK that touches
   `sources.yaml`, classifier prompt, schema, or the
   production bundle path enters red-adjacent
   territory. Severity: **medium**. Mitigation: memo
   §5 classifies each option A-E accordingly; §9
   non-goals list keeps drift boundaries visible.
8. **Future promotion requires explicit validation
   gates and rollback plan.** Memo §7 defines 12
   gates; §8 defines rollback steps. Severity: **n/a
   (already scoped in memo)**.
9. **No automated promotion should happen under
   current blockers.** BLK-0002 (full automation
   activation) explicitly blocks Option E. Q10 pause
   continues. Severity: **n/a by design**.
10. **G2.1d remains blocked by BLK-0001** (red-zone:
    classifier prompt rewrite + `CLASSIFIER_VERSION`
    bump). Codex CLI / Claude Code must NOT
    self-promote. Severity: **n/a by design**.
11. **Full automation remains blocked by BLK-0002.**
    Opening any real Automation Window requires (a)
    the runner to exist with its own DECISION AND (b)
    explicit human resolution of BLK-0002. Severity:
    **n/a by design**.
12. **OpenAI API remains blocked by BLK-0003
    (standing, Q7-scoped).** This task introduced no
    OpenAI API usage. Severity: **n/a by design**.

## Red-zone flags

`none` for P2.0a.

No `src/lib/prompts.ts`, `src/lib/anthropic.ts` (not
present), `src/data/web_bundle.json`,
`src/lib/corpus.ts`, `src/app/api/**` (runtime model
selection), `package.json`, `package-lock.json`,
`.env*`, `vercel.json`, `.vercel/**`, or
`.github/workflows/**` changed. No pipeline-repo file
changed at all — `sources.yaml`, `corpus/**`,
`scripts/collector/**`, `.github/workflows/**` all
inspected read-only only. No Codex CLI config, Claude
Code config, or OpenAI SDK introduced. No
`.agent/scripts/**` edited (hard rule per Q3-Q8 of
AgentOps-2c DECISION). No executable runner / shell
script / config / cron / hook file created anywhere.
No collector invocation. No LLM call.

## Required fixes

`none`

Scope is clean (3 paths, all approved), memo structure
check passes (11 H2 sections covering all 10 required +
1 `Status` header), the memo cites concrete
preflight facts (bundle counts, dates, workflow
schedule, cron gap), it compares 5 promotion options
with per-option analysis, defines 12 acceptance gates,
lays out a 6-stage sequential plan, defines a
6-step rollback path with exact `git revert` commands,
and names exactly one recommended next task (P2.0b).
All 18 TASK acceptance criteria are demonstrably met
per RUN_REPORT. No forbidden / red-zone / pipeline /
runner / OpenAI / config / executable /
`.agent/scripts` / prompts / runtime-selection / data
path was touched.

## Non-blocking follow-ups

- **After DECISION approval and push** → update daily
  summary. Extend
  `.agent/daily_summaries/2026-07-05_SUMMARY.md` with a
  P2.0a section documenting the memo's key finding
  (naive-swap credibility regression), the staged plan
  (P2.0b-g), and the Vercel deploy confirmation
  (`.agent/`-only, no user-visible change).
- **Accept P2.0b as the next recommended task**:
  visible corpus snapshot-date disclosure. Small yellow
  UI change extending `WEB_BUNDLE_STATS` to expose
  `generatedAt` alongside the existing counts, then
  surfacing it on the homepage (or footer / attribution
  strip / methodology "Current pipeline phase" area).
  Same yellow-loop cadence as P1.7b/c/P1.8a/b.
- **Do NOT start corpus refresh** as a side effect.
- **Do NOT swap `web_bundle.json`**. §7 gate 2
  (`unique_companies ≥ 35`) arithmetically blocks
  today's pipeline bundle from passing.
- **Do NOT run collector**. No `python -m
  scripts.collector …` invocation.
- **Do NOT modify pipeline files.** `sources.yaml`,
  `corpus/**`, `scripts/collector/**`,
  `.github/workflows/**` all stay frozen. Any pipeline
  edit is a separate red-adjacent task requiring its
  own scope-and-approve loop.
- **Do NOT modify `sources.yaml`.** Registry expansion
  is P2.0f's design memo scope, and even the memo
  doesn't touch it.
- **Do NOT modify `src/data/**`**. Both bundle files
  stay untouched until a matched TASK + DECISION for
  the swap.
- **Do NOT start G2.1d.** BLK-0001 still `open`.
- **Do NOT resume automation-infra expansion.** Per
  AgentOps-2c Q10, automation-infra is paused; product
  work continues.
- **Do NOT introduce OpenAI API** in any Q7 blocked
  sense.
- **Do NOT deploy manually.** Vercel auto-deploy from
  the eventual push is the only sanctioned deploy path
  — and this push is a no-op user-visibly since only
  `.agent/` files changed.
- **Do NOT parallelize P2.0b-g.** Memo §6 explicitly
  says sequential — each stage's artifact feeds the
  next stage's TASK.
- **Do NOT skip P2.0b to jump ahead to P2.0d/e/f.**
  Visible disclosure first anchors the staged plan.

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main` of
   the pipeline repo (do not switch to any branch).
2. Do NOT push either repo. The web repo will be
   ahead of origin/main by 3 commits at that point
   (P2.0a memo `9932a18` + RUN_REPORT `e5ca0c1` +
   this DECISION); push requires Bohao's explicit
   "push P2.0a memo" instruction. Unlike P1.7c /
   P1.8a / P1.8b, this push would be a NO-OP
   USER-VISIBLY (only `.agent/` files changed, served
   bundle byte-identical — Vercel will build but the
   rendered output is unchanged).
3. Do NOT deploy manually. Vercel auto-deploy from
   the eventual push handles this.
4. Do NOT start P2.0b yet. The DECISION recommends
   P2.0b as the next code loop but it is a separate
   TASK with its own scope-and-approve loop. Start
   P2.0b only after Bohao's explicit "start P2.0b"
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
- `git push origin main` from the web repo (3
  commits land on origin/main: `9932a18` +
  `e5ca0c1` + this DECISION). Vercel auto-deploys
  but produces no user-visible change.
- Then extend
  `.agent/daily_summaries/2026-07-05_SUMMARY.md`
  with a P2.0a section documenting the memo's
  staged plan and audit trail; commit + push.
- Then, per this DECISION's follow-up, the natural
  next step is **P2.0b · visible corpus
  snapshot-date disclosure** as a separate future
  TASK + DECISION.

Wait for Bohao's explicit "push P2.0a memo" before
doing anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which would deliver 3 commits — `9932a18` (TASK +
  memo), `e5ca0c1` (RUN_REPORT), and this DECISION
  commit once it lands). This push triggers Vercel
  auto-deploy but is **user-visibly a no-op** because
  only `.agent/` files changed.
- Authoring the daily summary cleanup commit
  (extend `2026-07-05_SUMMARY.md`).
- Starting P2.0b (visible snapshot-date disclosure).
- Starting P2.0c/d/e/f/g in any order.
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
- Any prompt change (`src/lib/prompts.ts` frozen).
- Any G2.1d (red) work.
- Any OpenAI API usage in Q7 blocked sense.
- Any manual `vercel deploy`.
- Lifting any of the 3 open blockers
  (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical execution
> captured in the RUN_REPORT and the design memo.
> Standing policy treats any `main` push as a human
> gate. This push additionally is
> user-visibly-a-no-op — `.agent/` files only, served
> bundle byte-identical.
>
> Approving this DECISION:
>
> - Adopts the memo as a `reviewed_approved` design
>   document for the data-freshness /
>   corpus-promotion track.
> - Records the memo's key finding
>   (naive-swap-is-credibility-regression) as a
>   formal analysis conclusion.
> - Endorses the P2.0b-through-P2.0g sequential
>   staged plan.
> - Endorses P2.0b (visible snapshot-date
>   disclosure) as the next recommended code loop.
> - Endorses the 12 acceptance gates in memo §7 as
>   the checklist any future promotion TASK must
>   satisfy.
> - Endorses the rollback plan in memo §8.
>
> Approving does NOT approve: (a) starting P2.0b (or
> any downstream P2.0c-g) — each is its own TASK +
> DECISION, (b) any pipeline file edit, (c) any
> bundle swap, (d) any collector run, (e) any
> AgentOps-2* work, (f) any `.agent/scripts/**`
> mod, (g) any runtime model-selection change or
> prompt change, (h) any OpenAI API usage in Q7
> blocked sense, (i) G2.1d, (j) lifting any of the
> 3 open blockers. Each of those remains its own
> explicit human decision. The next step is
> Bohao's explicit call on the push.
