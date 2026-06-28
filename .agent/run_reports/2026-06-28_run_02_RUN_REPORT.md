# RUN REPORT · G2.1b · taxonomy spec doc

> First **cross-repo** RUN_REPORT. TASK lives in the web repo;
> implementation (the spec doc) landed on a branch in the **pipeline
> repo**. This report tracks both sides.

## Metadata

- **task_id**: `2026-06-28_run_02` (must match the TASK file)
- **date**: `2026-06-28`
- **run_number**: `02`
- **branch**: `agent/2026-06-28_run_02` (web repo: no branch — TASK + this report commit straight to `main`; **pipeline repo: branch `agent/2026-06-28_run_02` holds the spec commit**)

## Commits

**Web repo (`/Users/bohaoli/Desktop/ai-career-radar-web`):**
- `8a3d0b3` Add TASK 2026-06-28_run_02 (on `main`)
- *(forthcoming)* Add RUN_REPORT 2026-06-28_run_02 (this report, on `main`)

**Pipeline repo (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`):**
- `f833bfd` Add G2.1 taxonomy spec (on branch `agent/2026-06-28_run_02`, **NOT pushed**, **NOT merged**)

Branch base: pipeline `main` HEAD was at `65c3f9b Daily automated
collection · 2026-06-28` after a `git pull --ff-only` (origin was 4
commits ahead of local before pull — daily cron output for 2026-06-25
through 2026-06-28; pulled cleanly with no conflicts).

## Files changed

**Web repo (vs `origin/main` before this run):**

```
 .agent/tasks/2026-06-28_run_02_TASK.md             | 436 +++++++++++++++++++++
 .agent/run_reports/2026-06-28_run_02_RUN_REPORT.md | <this file>
```

**Pipeline repo (vs `main` after the pre-run pull):**

```
 corpus/taxonomy/G2.1_spec.md | 543 +++++++++++++++++++++++++++++++++++++++++++
 corpus/taxonomy/README.md    |   7 +
 2 files changed, 550 insertions(+)
```

No `src/`, no `package.json`, no prompts, no schema, no DB, no source,
no cron, no `.github/workflows/`, no `corpus/state/`, no
`corpus/web_bundle*.json`, no `corpus/_inbox/raw/processed/`, no
`corpus/evals/reports/runs/`. The pipeline diff is exclusively under
`corpus/taxonomy/`, and the web diff is exclusively under `.agent/`.

## Summary

Wrote the frozen G2.1 taxonomy reference document at
`corpus/taxonomy/G2.1_spec.md` (543 lines) in the pipeline repo,
plus a 7-line `corpus/taxonomy/README.md` that indexes the three files
now in that folder (`company_aliases.json`, `skill_aliases.json`, and
the new `G2.1_spec.md`).

The spec covers all 9 sections the TASK called out, drawn directly
from the G2.1a memo (`22ea63d` in the web repo). It documents 11
included categories + 2 reject sidecar categories + 2 deferred
categories. Each included category has the full bullet set the TASK
required (canonical enum, human label, status, priority, plain English,
positive / weak / negative signals, title patterns, JD language,
boundary notes). Reviewer decisions are recorded verbatim where they
apply:

- §3: Path A confirmed (taxonomy first, eval second, prompt last).
- §3.7 / §3.6: `data_eng_for_ai` and `eval` stay **separate** —
  reviewer decision.
- §3.13 / §6: reject categories live in **dry-run sidecar only** —
  reviewer decision.
- §5: explicit "no schema change, no DB columns, no prompt rewrite in
  G2.1b" callout.
- §8: 11 "we are NOT doing X" non-goals.
- §9: change control routes through AgentOps loop.

No prompt rewrites, no schema edits, no classifier/extractor changes,
no DB migration, no cron change, no source expansion, no web app
change, no production promotion.

## Constraints checked

### Web repo

- [x] `src/**` — untouched (`git diff --stat -- src/` empty)
- [x] `src/lib/prompts.ts` — untouched
- [x] `src/data/web_bundle.json` — untouched
- [x] `package.json` / `package-lock.json` — untouched
- [x] `.github/workflows/**` — untouched
- [x] `.env*` — untouched
- [x] `vercel.json` / `.vercel/**` — untouched

### Pipeline repo

- [x] `scripts/collector/classifier.py` — untouched
- [x] `scripts/collector/extraction.py` — untouched
- [x] `scripts/collector/db.py` — untouched
- [x] `scripts/collector/review_queue.py` — untouched
- [x] All other `scripts/collector/*.py` — untouched (verified by glob
      check: `git diff --name-only main..HEAD | grep ^scripts/collector/`
      returned empty)
- [x] `corpus/schema/**` — untouched
- [x] `corpus/state/**` — untouched
- [x] `corpus/web_bundle.json` — untouched (V1 hand-curated bundle preserved)
- [x] `corpus/web_bundle_pipeline.json` — untouched
- [x] `corpus/collector.db` — untouched (gitignored runtime state anyway)
- [x] `corpus/_inbox/**` / `corpus/raw/**` / `corpus/processed/**` — untouched
- [x] `corpus/evals/**` — untouched (G2.1c TASK will write here later)
- [x] `corpus/reports/**` — untouched (existing G0–G2.0 reports preserved)
- [x] `corpus/runs/**` — untouched (cron output preserved)
- [x] `sources.yaml` — untouched
- [x] `.github/workflows/**` — untouched
- [x] No classifier / extractor / system prompt file changed in either repo
- [x] No model selection literal changed
- [x] No deployment config file changed
- [x] No new Python dependency
- [x] No new npm dependency
- [x] No `python -m scripts.collector …` invocation
- [x] No `npm run …` invocation (build not required; no app changes)
- [x] No external command beyond `git`, `mkdir`, `wc`, `head`, and the
      AgentOps helper scripts

### Glob audit (recorded for the reviewer)

```
$ cd /Users/bohaoli/Desktop/tuto/tuto_ai_career_radar
$ git diff --name-only main..HEAD | grep -E '^(scripts/collector/|corpus/schema/|corpus/state/|corpus/_inbox/|corpus/raw/|corpus/processed/|corpus/evals/|corpus/reports/|corpus/runs/)' || echo "(none)"
(none)
$ git diff --name-only main..HEAD
corpus/taxonomy/G2.1_spec.md
corpus/taxonomy/README.md
```

## Red-zone check

- Red-zone files modified this run: **none** in either repo.
- Approval reference: N/A — the spec doc lands in a yellow allowed
  location (`corpus/taxonomy/`). The DECISION reviewer should still
  gate the **merge + push of the pipeline branch** as a separate
  step per policy §3.

## Validation results

```
=== WEB REPO ===
$ cd /Users/bohaoli/Desktop/ai-career-radar-web
$ git status
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
$ git diff --stat HEAD
(empty — only the TASK commit is in main since the last push)

=== PIPELINE REPO ===
$ cd /Users/bohaoli/Desktop/tuto/tuto_ai_career_radar
$ git status
On branch agent/2026-06-28_run_02
nothing to commit, working tree clean
$ git diff --stat main..HEAD
 corpus/taxonomy/G2.1_spec.md | 543 +++++++++++++++++++++++++++++++++++++++++++
 corpus/taxonomy/README.md    |   7 +
 2 files changed, 550 insertions(+)
$ git branch --show-current
agent/2026-06-28_run_02
$ wc -l corpus/taxonomy/G2.1_spec.md
     543 corpus/taxonomy/G2.1_spec.md
```

## Build result

`not-run` — documentation-only change, no app code touched. The TASK
explicitly waived `npm run build`. No Python runtime change either, so
no pipeline build/test invocation.

## Tests result

`spec-validation only` — manual structural check that the spec
contains all 9 sections, that each of the 13 categories has the full
bullet set the TASK required, that the deferred / not-merged decisions
are explicitly recorded, and that the non-goals list mirrors the
forbidden-files list. No automated test framework involved.

## Screenshots

`n/a` — pure documentation work in the pipeline repo, nothing rendered
visually.

## Risks

- **Spec drift across the cross-repo boundary.** The spec lives in the
  pipeline repo, but the AgentOps audit trail (TASK / RUN_REPORT /
  DECISION) lives in the web repo. If someone edits
  `corpus/taxonomy/G2.1_spec.md` directly without opening a TASK, the
  web-repo audit trail won't notice. Severity: **low**.
  Mitigation: §9 of the spec documents the change-control flow; future
  reviewers know to look for a corresponding TASK before accepting an
  edit.
- **Cross-repo merge sequencing.** Web-repo TASK commit and pipeline
  spec commit need to be promoted to their respective origins
  separately. If only the web side gets pushed, the pipeline spec will
  not yet be reachable by other tools. Severity: **low**. Mitigation:
  this RUN_REPORT recommends pushing both repos together (web first,
  pipeline second).
- **"Boundary notes" subjectivity.** The §3 entries for each category
  include hand-written boundary notes. They are honest but inevitably
  reflect my framing of the borderline cases. Severity: **low**.
  Mitigation: G2.1c's eval set will surface any boundary notes that
  produce bad ground-truth labels.

## Follow-up recommendations

- **G2.1c next.** Per Path A, the hand-labeled eval set is the next
  TASK. It will read this spec as ground-truth source. Risk: yellow.
  Lives under `corpus/evals/taxonomy_eval/G2.1/`.
- **Daily cron consideration.** Pipeline `main` may pick up new daily
  cron commits between now and when the human merges
  `agent/2026-06-28_run_02`. A future ff-merge may need a fresh
  `git pull --ff-only` immediately before — but no rebase, no force.
- **Eventual spec evolution.** As G2.1d → G2.1f land, the spec will
  need an addendum recording any deviations from the original (e.g.
  category boundary tweaks discovered during dry-run). Each such edit
  is its own AgentOps loop per §9.

## Ready for review

`yes`

## Requires human decision

`yes` — for **merge + push of the pipeline branch**
(`agent/2026-06-28_run_02` → `main` in the pipeline repo, then push to
`origin/main`). The web-side TASK + RUN_REPORT commits are already on
`main` in the web repo (waiting on push). Both pushes need explicit
GO from Bohao.

> Verdict from the DECISION reviewer will determine the merge/push
> path. Per policy §3, the executor does not push either repo
> autonomously; merging the pipeline branch and pushing both origins
> are separate, explicitly-approved steps.
