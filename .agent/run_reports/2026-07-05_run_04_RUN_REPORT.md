# RUN REPORT · P2.0a data freshness corpus promotion design memo

> Authored by Claude Code after executing TASK
> `2026-07-05_run_04`. **Design memo only.** Web-repo `.agent/`
> doc work. Pipeline repo read-only inspection only.
> No corpus refresh executed. No pipeline files modified. No
> collector invoked. No LLM call. No bundle swap. No `src/data/**`
> writes. No `src/lib/web-bundle-stats.ts` writes. No
> `src/app/api/**` touched. No prompts touched. No
> `.agent/scripts/**` touched. Scaffolded by
> `python .agent/scripts/new_run_report.py --task-id 2026-07-05_run_04`.

## Metadata

- **task_id**: `2026-07-05_run_04` (matches the TASK file)
- **date**: `2026-07-05`
- **run_number**: `04`
- **branch**: web repo `main` (no branch cut — yellow
  design-memo work, same direct-on-`main` pattern
  AgentOps-2a / AgentOps-2b / AgentOps-2c used for their
  memo commits)

## Commits

**Web repo (`/Users/bohaoli/Desktop/ai-career-radar-web`):**
- `e6c72ba` (already on `main` and `origin/main` before this
  run; P1.8b cleanup)
- `9932a18` Add data freshness promotion design memo (this
  run; 2 files in one commit: TASK + design memo)
- *(forthcoming)* Add RUN_REPORT 2026-07-05_run_04 (this file)

**Pipeline repo (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`):**
- `none` (pipeline repo not touched; read-only inspection
  only; HEAD remains `b019786` at start and end of run)

## Files changed

**Web repo (this run, vs `HEAD` at run start = `e6c72ba`):**

```
 .agent/tasks/2026-07-05_run_04_TASK.md                                                | 327 +++++++++++++++++++++++
 .agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md        | 718 ++++++++++++++++++++++++++++++++++++++++++++++++++++++
 .agent/run_reports/2026-07-05_run_04_RUN_REPORT.md                                    | <this file>
 3 files changed (2 committed in 9932a18, 1 forthcoming)
```

- `.agent/tasks/2026-07-05_run_04_TASK.md` — NEW, 327 lines.
  TASK spec includes the full preflight fact table (three
  bundle files with sizes / `generated_at` / `n_records` /
  unique_companies / `applied_ai`) so the memo can cite
  concrete numbers rather than hand-wave.
- `.agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md`
  — NEW, **718 lines**. 11 H2 sections (10 required + 1
  `Status` header): Problem, Current state (7 subsections),
  Source-of-truth map, Risks (10 items), Promotion path
  options (5 options A-E each with expected
  value/risk/files/approval/color/why-now-why-not), Recommended
  staged plan (6 stages P2.0b-g), Acceptance criteria for
  future promotion (12 concrete gates), Rollback plan (6
  steps with exact commands), Explicit non-goals (12 items),
  Recommended next task (P2.0b visible snapshot-date
  disclosure, opinionated single choice).
- `.agent/run_reports/2026-07-05_run_04_RUN_REPORT.md` —
  this file (forthcoming commit).

**Empty diff verified on every other path**: `src/**`,
`src/data/**`, `src/lib/web-bundle-stats.ts`,
`src/lib/models-display.ts`, `src/lib/prompts.ts`,
`src/lib/corpus.ts`, `src/app/api/**`, `src/app/**/page.tsx`,
`src/components/**`, `package.json`, `package-lock.json`,
`.env*`, `.github/workflows/**`, `vercel.json`, `.vercel/**`,
`.agent/policies/**`, `.agent/templates/**`,
`.agent/scripts/**` (**hard rule per AgentOps-2c Q3-Q8**),
`.agent/blockers.md`, `.agent/automation_queue.md`.

**Pipeline repo:** no diff. Confirmed via `git status` on
`main` — `nothing to commit, working tree clean` at run
start and end; HEAD = `b019786` at both points. Pipeline
inspection was strictly read-only: `head -60`,
`grep -c '^  - source_id:'`, `ls`, `wc`, and one
`python3 -c "import json; …"` metadata pull. No editor
opened on any pipeline file. No `>` redirect. No `git add`
in the pipeline repo.

## Read-only evidence inspected

The following pipeline-repo paths were inspected read-only
to ground the memo in real facts (not hypothesis):

1. **`sources.yaml`** — verified 8-source registry
   (Anthropic, Scale AI, Together AI, Fireworks AI, Cohere,
   LangChain, Cursor, Perplexity). Header comment "Phase
   F2.6 expansion (2026-05-19): 1 → 8 sources" and
   `grep -c '^  - source_id:'` = 8 both confirm.
2. **`.github/workflows/weekly-collect.yml`** — verified
   workflow name is "Daily automated collection" (despite
   the legacy filename), cron `0 6 * * *` = daily 06:00
   UTC, enabled 2026-05-20 post-F2.5 hardening, uses
   `ANTHROPIC_API_KEY` for classify+extract only, writes
   only to `corpus/web_bundle_pipeline.json` (live
   `corpus/web_bundle.json` untouched until "explicit F3
   swap").
3. **`scripts/collector/`** — listed the module structure:
   `runner.py`, `classifier.py`, `extraction.py`,
   `db.py`, `boilerplate.py`, `snapshot.py`,
   `state_dump.py`, `sources_loader.py`, `web_bundle.py`,
   `validate_run.py`, `review_queue.py`,
   `fetchers/greenhouse.py + ashby.py`, `golden_set.py`,
   `normalize.py`, `exporter.py`, `schema.sql`. Also
   inspected `__main__.py` first 50 lines for CLI entry
   surface (phases A0/A1/A1.5+ commands).
4. **`corpus/`** — listed top-level:
   `web_bundle.json` (1.4 MB), `web_bundle_pipeline.json`
   (2.1 MB), `web_bundle_staging.json` (1.7 MB),
   `collector.db`, `state/`, `runs/`, `reports/`, `raw/`,
   `processed/`, `_inbox/`, `_inbox_backup_*/`, `evals/`,
   `taxonomy/`, `schema/`, `HOW_TO_ADD.md`,
   `HOW_TO_ADD_ADJACENT.md`.
5. **`corpus/state/`** — listed: only
   `canonical_dump.json`. (State is idempotent
   rehydration source per cron header comment.)
6. **`corpus/runs/`** — listed most recent 10 runs
   (2026-06-28 for all 8 sources, 2026-06-27 for
   cursor + perplexity partial). Confirms cron ran at
   least through 2026-06-28.
7. **Pipeline `git log --oneline -30 | grep "Daily
   automated"`** — 23 consecutive daily commits from
   2026-06-06 through 2026-06-28. Last cron commit is
   2026-06-28. Today is 2026-07-05 → 7-day gap.
   Documented as an open question in memo §2.6.
8. **`corpus/web_bundle.json`**,
   **`corpus/web_bundle_pipeline.json`**,
   **`corpus/web_bundle_staging.json`** — inspected via
   `python3 -c "import json; …"` for metadata:
   `n_records`, `generated_at`, unique-company count,
   `applied_ai` count, top-level keys. Numbers verbatim
   in memo §2.1.

The following web-repo paths were inspected read-only to
ground the memo in the current web product state:

9. **`src/data/web_bundle.json`** — 1.4 MB, byte-copy of
   pipeline `corpus/web_bundle.json` per matching size.
10. **`src/lib/web-bundle-stats.ts`** — verified constants
    (`totalJds: 443`, `appliedAiJds: 47`,
    `trackedCompanies: 35`, `evidenceQuotesPerReport: 5`)
    match `web_bundle.json` computed values as of
    2026-07-05.
11. **`grep -rn 'generated_at' src/app src/lib`** —
    confirmed `snapshot-pipeline/page.tsx:289` uses
    `formatGeneratedAt(bundle.generated_at)` (only
    current freshness surface); `src/lib/corpus.ts:17`
    passes `generated_at` through server-side; homepage /
    sample-report / methodology don't surface any
    `generated_at`.

## Summary of design recommendation

**Opinionated recommendation**: next task = **P2.0b · Add
a visible corpus snapshot-date disclosure to the served
product** (see memo §10).

**Why P2.0b specifically**:

- Directly closes the largest remaining trust risk
  identified in the 2026-07-05 strategic review (bundle
  is ~7.5 weeks old and no visible freshness surface
  exists on the homepage / methodology / sample-report).
- Smallest possible change: 1-2 UI files + 1 new field on
  the existing `WEB_BUNDLE_STATS` helper.
- Zero pipeline touch, zero data touch, zero prompt/model
  touch, zero `.agent/scripts/**` touch.
- Sets up cleanly for P2.0c (drift check), P2.0d (preview
  audit), and P2.0e (promotion checklist) as a coherent
  staged plan.

**Opinionated non-recommendation**: the naive "swap
`web_bundle.json` with `web_bundle_pipeline.json`" is a
CREDIBILITY REGRESSION, not an improvement. It would
drop unique-company count 35 → 8 (−77%) and
`applied_ai` 47 → 32 (−32%) — invalidating the entire
P1.7 + P1.8 credibility surface just built. Memo §2.7
and §5-Option-D show the exact numbers. Memo §7 gates
2 and 3 make this arithmetically impossible until the
`sources.yaml` registry gap is closed (P2.0f).

**Staged plan** (memo §6, opinionated ordering):

- **P2.0b** — visible snapshot-date disclosure (recommended
  next task)
- **P2.0c** — build-time `WEB_BUNDLE_STATS` codegen +
  drift check
- **P2.0d** — read-only audit of pipeline bundle against
  §7 gates
- **P2.0e** — formalize promotion checklist +
  rollback plan
- **P2.0f** — `sources.yaml` registry expansion design
  memo (closes 35 → 8 gap)
- **P2.0g** — production bundle swap (only after
  P2.0b-f converge)

## What was intentionally NOT done

- ❌ **No collector invocation.** No `python -m
  scripts.collector`, no `dry-run`, no `clean-preview`, no
  `run`, no `list`, no `review`. `scripts/collector/` was
  only listed and its `__main__.py` first 50 lines
  read.
- ❌ **No pipeline files modified.** Pipeline `git status`
  clean at start and end. HEAD unchanged at `b019786`.
- ❌ **No `sources.yaml` modification.** Read-only inspection
  via `head -60` and `grep -c` only.
- ❌ **No corpus refresh.** `web_bundle.json` and
  `web_bundle_pipeline.json` untouched. Read-only metadata
  pull via `python3 -c "import json; …"` only.
- ❌ **No `src/data/**` change.** `web_bundle.json` in the
  web repo untouched.
- ❌ **No `src/lib/web-bundle-stats.ts` change.** Read-only
  reference for the current constants; not edited.
- ❌ **No `src/app/**/page.tsx` change.** Homepage /
  methodology / sample-report / snapshot-pipeline all
  untouched (this memo is doc-only; any UI change is P2.0b's
  future TASK).
- ❌ **No `src/app/api/**` change.** Runtime model
  selection / bundle-consumer API-route logic frozen.
- ❌ **No prompt changes.** `src/lib/prompts.ts` empty diff.
- ❌ **No runtime model-selection change.**
- ❌ **No `.agent/scripts/**` change.** Hard rule per
  AgentOps-2c Q3-Q8 — verified empty diff.
- ❌ **No `.env*` change.** No Codex CLI / Claude Code
  config edit.
- ❌ **No new npm / Python dependency.** `package.json` /
  `package-lock.json` untouched.
- ❌ **No new GitHub Actions / workflow file.** Neither
  repo's `.github/workflows/**` touched.
- ❌ **No LLM call by this task.** No `anthropic` /
  `openai` SDK invocation. (Preflight `python3 -c "import
  json; …"` reads local files only, no external network.)
- ❌ **No `git push`. No `vercel deploy`.**
- ❌ **No DECISION file created.** DECISION is a downstream
  step matching every prior AgentOps memo loop.
- ❌ **No queue transitions.** QUEUE-0001/0004/0006/0007/
  0008 stay `done`. QUEUE-0002 stays
  `blocked_pending_human`. QUEUE-0003/0005 unchanged.
- ❌ **No blocker resolution.** BLK-0001 / BLK-0002 /
  BLK-0003 all still `open`. `blockers.md` untouched.

## Constraints checked

### Web repo

- [x] `src/data/**` — untouched (empty diff)
- [x] `src/lib/web-bundle-stats.ts` — untouched
- [x] `src/lib/models-display.ts` — untouched
- [x] `src/lib/prompts.ts` — untouched
- [x] `src/lib/corpus.ts`, `src/lib/types.ts` — untouched
- [x] `src/lib/eval-report.ts`, `src/lib/extract-pdf.ts` —
      untouched
- [x] `src/lib/anthropic.ts` — does not exist; trivially
      satisfied
- [x] `src/app/api/**` — untouched
- [x] `src/app/page.tsx`, `src/app/sample-report/**`,
      `src/app/methodology/**`, `src/app/lab/**`,
      `src/app/snapshot-pipeline/**`,
      `src/app/layout.tsx`, `src/app/opengraph-image.tsx`
      — all untouched
- [x] `src/components/**` — untouched
- [x] `package.json` / `package-lock.json` — untouched
- [x] `.env*` — untouched
- [x] `.github/workflows/**` (web repo) — untouched
- [x] `vercel.json` / `.vercel/**` — untouched
- [x] `.agent/policies/**` — untouched
- [x] `.agent/templates/**` — untouched
- [x] **`.agent/scripts/**` — untouched (hard rule
      verified empty diff)**
- [x] `.agent/blockers.md` — untouched
- [x] `.agent/automation_queue.md` — untouched
- [x] `.agent/README.md` — untouched
- [x] `.agent/automation_runs/**` — untouched

### Pipeline repo

- [x] **All files — untouched.** Pipeline `git status`
      clean at start and end; HEAD unchanged at
      `b019786`. Read-only inspection via `head`,
      `grep`, `wc`, `ls`, `python3 -c "import json; …"`
      only.

### Tool config and external integrations

- [x] **OpenAI API SDK / key / `.env` entry / HTTP call /
      import / CI secret / background token** — none
      introduced (per Q7 blocked sense).
- [x] **Codex CLI config** — not edited.
- [x] **Claude Code config** — not edited.
- [x] **New GitHub Actions / workflow files** — none.
- [x] **New cron jobs** — none.
- [x] **New deployment hooks** — none.
- [x] **New npm / Python dependencies** — none.
- [x] **`python -m scripts.collector …` invocation** —
      never invoked.
- [x] **`npm run …` invocation** — NOT invoked. Neither
      `lint` nor `build` was run for this memo-only task
      (no runtime file changed; TASK explicitly waived).
- [x] **LLM call** — no `anthropic` / `openai` SDK
      invocation. The one `python3 -c "import json; …"`
      preflight call reads local files only.
- [x] **Automation runner / daemon / scheduler / cron
      file creation** — none.
- [x] **Queue / blocker state changes** — none.

## Red-zone check

- Red-zone files modified this run: **none**.
- Approval reference: N/A. The 3 changed/new files land
  under `.agent/tasks/`, `.agent/design_memos/`, and
  (forthcoming) `.agent/run_reports/` — all yellow per
  policy §6 for a design-memo task.
- G2.1d (red) **not attempted**. QUEUE-0002 still
  `blocked_pending_human`.

## Validation results

```
=== file presence + sizes ===
.agent/tasks/2026-07-05_run_04_TASK.md                                                327 lines
.agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md        718 lines / ~33 KB
.agent/run_reports/2026-07-05_run_04_RUN_REPORT.md                                    <this file> (forthcoming)

=== git status --short (pre-commit) ===
?? .agent/tasks/2026-07-05_run_04_TASK.md
?? .agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md

=== git diff --stat (pre-commit) ===
(none — both files are new)

=== post-commit (9932a18) ===
[main 9932a18] Add data freshness promotion design memo
 2 files changed, 1045 insertions(+)
 create mode 100644 .agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md
 create mode 100644 .agent/tasks/2026-07-05_run_04_TASK.md

=== memo structural checks ===
$ wc -l .agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md
718   (within target 400-800; under 1200 stop-cap)

$ grep -c '^## ' .agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md
11   (10 required sections + 1 Status header at line 10)

$ grep -n '^## ' .agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md
10:## Status
26:## 1. Problem
64:## 2. Current state (read-only preflight facts)
170:## 3. Source-of-truth map
238:## 4. Risks
304:## 5. Promotion path options
475:## 6. Recommended staged plan
534:## 7. Acceptance criteria for any future corpus promotion
590:## 8. Rollback plan
638:## 9. Explicit non-goals
669:## 10. Recommended next task
(All 10 required sections present, in order.)

=== forbidden audit (vs HEAD~1 post-commit) ===
all forbidden paths — empty diff ✓
(src/data/ src/lib/web-bundle-stats.ts
 src/lib/models-display.ts src/lib/prompts.ts
 src/lib/corpus.ts src/app/api/ src/app/**/page.tsx
 src/components/ .agent/policies/ .agent/templates/
 .agent/scripts/ .agent/blockers.md
 .agent/automation_queue.md .github/workflows/
 package.json package-lock.json .env*)

=== pipeline read-only sanity ===
$ git status (pipeline)
On branch main · up to date with origin/main · clean
$ git rev-parse HEAD (pipeline)
b0197867d93e50e60f84f8aefc7c71ee792d3006   ← unchanged

=== Acceptance criteria coverage (manual ✓) ===
1.  TASK exists                                     ✓
2.  Memo exists with 10 required sections           ✓ (11 H2 total; 10 required)
3.  Memo cites preflight facts (3 bundles)          ✓ (§2.1 table)
4.  Memo compares ≥5 promotion options              ✓ (Options A-E in §5)
5.  Memo defines ≥8 acceptance gates                ✓ (12 gates in §7)
6.  Memo names one recommended next task            ✓ (P2.0b in §10)
7.  Memo explicit non-goals lists required items    ✓ (§9 lists all required)
8.  RUN_REPORT exists                               ✓ (this file, forthcoming)
9.  git diff --stat shows only .agent paths         ✓
10. src/data/** untouched                           ✓
11. src/lib/web-bundle-stats.ts untouched           ✓
12. src/lib/prompts.ts / corpus.ts /
    api/** untouched                                ✓
13. Pipeline repo untouched                         ✓ (HEAD b019786)
14. No forbidden file modified                      ✓
15. No git push performed                           ✓
16. No DECISION file created                        ✓
17. No collector invocation                         ✓
18. No LLM call by this task                        ✓
```

## Build result

`not-run` — yellow `.agent/`-only design memo. TASK
explicitly waived `npm run build` (no runtime file
changed). No app code, no Python module, nothing that
compiles or executes.

## Tests result

`structural validation only` — no automated test framework
added. Manual structural checks recorded above: file
presence, line counts, memo H2 section count (11 = 10
required + 1 Status), memo section list, all 18 TASK
acceptance criteria manually checked, no forbidden /
pipeline / runtime / OpenAI / config / executable /
`.agent/scripts` path touched.

## Screenshots

`n/a` — text-only design memo work.

## Risks

1. **The memo assumes the served bundle is byte-identical
   to `corpus/web_bundle.json` in the pipeline repo.**
   Verified indirectly (matching file sizes: 1.4 MB
   each) but not hash-verified. If they've drifted (e.g.
   pipeline `web_bundle.json` was updated but not
   propagated to `src/data/`), some of the memo's §2
   numbers would be off by whatever the difference is.
   Severity: **low**. Mitigation: P2.0d's audit will
   diff them explicitly.
2. **7-day gap since last cron commit** (memo §2.6). If
   the cron has actually stopped (not just seen no
   commitable delta), the whole "daily automated" claim
   on the methodology page becomes silently untrue. Not
   this memo's problem to fix — but a P2.0-anything TASK
   that touches methodology copy should re-verify.
   Severity: **medium**. Mitigation: any future P2.0
   TASK should re-check the pipeline `git log` for a
   recent cron commit before starting.
3. **Memo recommends P2.0b (visible snapshot-date
   disclosure) but does NOT scaffold it.** The next
   TASK is a separate loop; if Bohao / ChatGPT skip the
   memo's recommendation and pick a different next
   step, that's fine but the staged plan (§6) assumes
   sequential P2.0b → c → d → e → f → g. Severity:
   **low**. Mitigation: the DECISION reviewer can
   re-order.
4. **§7 acceptance gates are opinionated thresholds**
   (e.g. `unique_companies ≥ 35`, `applied_ai ≥ 40`).
   Bohao + ChatGPT may want to tighten or loosen these
   during DECISION. That's fine — they're memo defaults,
   not policy. Severity: **low**. Mitigation: DECISION
   can amend.
5. **No DECISION written by this task.** By design.
   DECISION is the downstream review step matching every
   prior AgentOps memo loop. Severity: **n/a by design**.
6. **Push is gated.** Web repo is ahead of `origin/main`
   by 1 commit now (`9932a18`); after RUN_REPORT commit,
   by 2; after DECISION commit, by 3. None pushed until
   Bohao explicitly approves. Vercel deploy for this
   push would be a no-op user-visibly (`.agent/`-only
   change; served bundle byte-identical). Severity: **n/a
   by design**.

## Follow-up recommendations

- **Next: Human + ChatGPT review** of this RUN_REPORT
  and the memo at
  `.agent/design_memos/2026-07-05_P2.0a_data_freshness_corpus_promotion_design.md`.
  Especially §5's option comparison (should any of A-E be
  re-ranked?), §7's acceptance gates (thresholds too
  strict or too loose?), and §10's single recommended
  next task (P2.0b — or is a different next step
  warranted?).
- **Then: DECISION** via
  `python .agent/scripts/new_decision.py --task-id 2026-07-05_run_04`.
  Approval gates pushing this loop's commits (`9932a18`
  + forthcoming RUN_REPORT commit + forthcoming DECISION
  commit).
- **Then (only if DECISION = approve)**: start the
  next task named in the DECISION's `next_task_prompt_for_claude`
  (default per memo §10 = P2.0b visible snapshot-date
  disclosure).
- **Do NOT** start P2.0c/d/e/f/g in parallel — memo §6
  explicitly says sequential.
- **Do NOT** start any AgentOps-2* work (per Q10 pause).
- **Do NOT** modify `.agent/scripts/**` (hard rule).
- **Do NOT** lift BLK-0001 / BLK-0002 / BLK-0003.
- **Do NOT** run corpus refresh / collector.
- **Do NOT** swap `web_bundle.json` with
  `web_bundle_pipeline.json` — memo §5 Option D and §2.7
  show why this is a credibility regression.
- **Do NOT** modify pipeline files.

## Ready for review

`yes`

## Requires human decision

`yes` — required before push of `main`. The web repo
currently has one unpushed commit (`9932a18` — TASK +
design memo); the RUN_REPORT commit (this file) will be
the second unpushed commit; the matching DECISION commit
will be the third.

Approval of this DECISION makes the memo a
`reviewed_approved` design document for the data
freshness / corpus promotion track and unlocks P2.0b as
the next code loop. Approving does NOT approve:
(a) any pipeline file edit, (b) any bundle swap, (c) any
collector run, (d) any AgentOps-2* work, (e) any
`.agent/scripts/**` mod, (f) any runtime model-selection
change, (g) any prompt change, (h) any OpenAI API usage,
(i) G2.1d, (j) lifting any of the 3 open blockers, (k)
starting P2.0c/d/e/f/g without going through P2.0b first.

> Verdict is technical-execution-only for now. Standing
> policy treats any `main` push as a human gate. The
> user-visible impact of this push would be nil
> (`.agent/`-only change; served bundle byte-identical).
> The developer-visible impact is: the next 3-6 code
> loops now have a written staged plan and won't
> accidentally regress company count 35 → 8 with a naive
> bundle swap.
