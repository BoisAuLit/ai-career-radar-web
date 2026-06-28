# RUN REPORT · G2.1c · hand-labeled taxonomy eval set

> Second cross-repo RUN_REPORT (after G2.1b). TASK in web repo;
> implementation files in pipeline repo branch
> `agent/2026-06-28_run_03`. Scaffolded by
> `python .agent/scripts/new_run_report.py --task-id 2026-06-28_run_03`.

## Metadata

- **task_id**: `2026-06-28_run_03` (must match the TASK file)
- **date**: `2026-06-28`
- **run_number**: `03`
- **branch**: `agent/2026-06-28_run_03` (pipeline repo · web repo TASK + this report commit straight to `main`)

## Commits

**Web repo (`/Users/bohaoli/Desktop/ai-career-radar-web`):**
- `4b1ca02` Add TASK 2026-06-28_run_03 (on `main`)
- *(forthcoming)* Add RUN_REPORT 2026-06-28_run_03 (this file, on `main`)

**Pipeline repo (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`):**
- `b019786` Add G2.1 taxonomy eval set (on branch `agent/2026-06-28_run_03`, **NOT pushed**, **NOT merged**)

Branch base: pipeline `main` HEAD was at `f833bfd Add G2.1 taxonomy
spec` after a `git pull --ff-only origin main` (no drift — already up to
date, fetch returned `0 0`).

## Files changed

**Web repo (vs `origin/main` before this run):**

```
 .agent/tasks/2026-06-28_run_03_TASK.md             | 443 +++++++++++++++++++++
 .agent/run_reports/2026-06-28_run_03_RUN_REPORT.md | <this file>
```

**Pipeline repo (vs `main` after the pre-run pull):**

```
 corpus/evals/taxonomy_eval/G2.1/README.md         |  88 +++++++++++++++
 corpus/evals/taxonomy_eval/G2.1/eval_set.jsonl    |  37 +++++++
 corpus/evals/taxonomy_eval/G2.1/examples.md       |  44 +++++++
 corpus/evals/taxonomy_eval/G2.1/labeling_guide.md | 137 ++++++++++++++++++++
 4 files changed, 306 insertions(+)
```

Pipeline diff is **exclusively** under `corpus/evals/taxonomy_eval/G2.1/`.
Web diff is **exclusively** under `.agent/`.

## Summary

Wrote the v1 hand-labeled eval set under
`corpus/evals/taxonomy_eval/G2.1/`. Four files: `README.md` (88
lines), `labeling_guide.md` (137 lines), `eval_set.jsonl` (37 entries,
one JSON per line), `examples.md` (44-line readable summary table,
auto-generated from the JSONL).

All 37 entries are **hand-labeled** against the G2.1 taxonomy spec at
`corpus/taxonomy/G2.1_spec.md` (commit `f833bfd`). 18 entries reuse
real JD excerpts from prior G1.3 review-queue resolutions (already
human-judged); 19 entries are clearly marked `source:
"synthetic_edge_case"` and supply short, paraphrased excerpts to cover
long-tail archetypes and trap patterns without republishing
copyrighted JDs.

No LLM call, no classifier invocation, no extractor invocation, no
`python -m scripts.collector …` invocation, no DB mutation, no
generated-corpus mutation. Labels are human-authored from the spec.

## Eval set composition

- **Total rows**: **37** (target was ~30; one extra added to meet the
  ≥5 false_negative_trap floor while keeping the long-tail entries).
- **All 37 `eval_id`s unique** (`G2.1-001` … `G2.1-037`).
- **All 37 lines parse as valid JSON** (validated by Python).
- **All required fields present** in every entry (13 keys per spec).
- **All 37 entries** have at least one `evidence_quote`; **all 89
  quotes** appear verbatim in their corresponding `jd_excerpt`
  (0 misses).
- **All `expected_decision` values** ∈ `{"include", "review", "exclude"}`.
- **All `expected_rejection_reason` values** ∈ `{null, "non_ai_swe", "ai_buzzword_only"}`.

### By `trap_type`

| trap_type | count |
|---|---|
| `true_positive` | 26 |
| `false_positive_trap` | 5 |
| `false_negative_trap` | 5 |
| `confusion` | 1 |

### By `expected_decision`

| decision | count |
|---|---|
| `include` | 31 |
| `exclude` | 5 |
| `review` | 1 |

### By `expected_role_archetype`

| archetype | count |
|---|---|
| `ai_product_engineering` | 7 |
| `applied_ai` | 7 |
| `forward_deployed` | 6 |
| `agent_engineering` | 5 |
| `null` (excludes) | 5 |
| `llm_infra` | 2 |
| `eval` | 1 |
| `data_eng_for_ai` | 1 |
| `ml_platform` | 1 |
| `research_engineer` | 1 |
| `ai_devrel` | 1 |

### By `expected_rejection_reason`

| reason | count |
|---|---|
| `null` | 33 |
| `non_ai_swe` | 3 |
| `ai_buzzword_only` | 1 |

### Per-archetype minima (TASK §"Target composition" + Acceptance §)

| target | floor | actual | OK? |
|---|---:|---:|---:|
| TP `applied_ai` | ≥ 5 | 5 | ✓ |
| TP `ai_product_engineering` | ≥ 5 | 5 | ✓ |
| TP `agent_engineering` | ≥ 5 | 5 | ✓ |
| TP `forward_deployed` | ≥ 5 | 5 | ✓ |
| `false_positive_trap` | ≥ 5 | 5 | ✓ |
| `false_negative_trap` | ≥ 5 | 5 | ✓ |
| long-tail `llm_infra` | ≥ 1 | 2 | ✓ |
| long-tail `eval` | ≥ 1 | 1 | ✓ |
| long-tail `data_eng_for_ai` | ≥ 1 | 1 | ✓ |
| long-tail `ml_platform` | ≥ 1 | 1 | ✓ |
| long-tail `research_engineer` | ≥ 1 | 1 | ✓ |
| long-tail `ai_devrel` | ≥ 1 | 1 | ✓ |
| long-tail `non_ai_swe` (via rejection_reason) | ≥ 1 | 3 | ✓ |
| long-tail `ai_buzzword_only` (via rejection_reason) | ≥ 1 | 1 | ✓ |

### Excerpt length

- min 231 chars · max 371 chars · mean 289 chars
- TASK soft cap was ~400; hard cap 650. All 37 entries well under both.

## Constraints checked

### Web repo

- [x] `src/**` — untouched (`git diff --stat origin/main..HEAD -- src/` empty)
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
- [x] All other `scripts/collector/*.py` — untouched (verified by glob)
- [x] `corpus/schema/**` — untouched
- [x] `corpus/state/**` — untouched
- [x] `corpus/web_bundle.json` — untouched (V1 hand-curated bundle preserved)
- [x] `corpus/web_bundle_pipeline.json` — untouched
- [x] `corpus/collector.db` — untouched (gitignored runtime state anyway)
- [x] `corpus/_inbox/**` / `corpus/raw/**` / `corpus/processed/**` — untouched
- [x] `corpus/evals/golden_set/**` — untouched (verified explicitly)
- [x] All other paths under `corpus/evals/` — untouched (only `corpus/evals/taxonomy_eval/G2.1/` written)
- [x] `corpus/reports/**` — untouched
- [x] `corpus/runs/**` — untouched
- [x] **`corpus/taxonomy/G2.1_spec.md` — untouched** (spec is read-only for this task; verified explicitly)
- [x] `sources.yaml` — untouched
- [x] `.github/workflows/**` — untouched
- [x] No prompt / classifier / extractor / system prompt file touched in either repo
- [x] No model selection literal changed
- [x] No deployment config file changed
- [x] No new Python or npm dependency
- [x] **No `python -m scripts.collector …` invocation** (no collection / classifier / extractor / dump / bundle run)
- [x] **No `npm run …` invocation** (no build; no app changes anyway)
- [x] **No LLM call** — no `anthropic` / `openai` SDK import, no HTTP request to any AI provider
- [x] No external command beyond `git`, `mkdir`, `wc`, `head`, `cat`, the AgentOps helper scripts, and a stdlib-only `python3` validation script

## Red-zone check

- Red-zone files modified this run: **none** in either repo.
- Approval reference: N/A. The eval set lands in a yellow allowed
  location (`corpus/evals/taxonomy_eval/G2.1/`); the DECISION reviewer
  should still gate the **merge + push of the pipeline branch** as a
  separate step per policy §3.

## Validation results

```
=== WEB REPO ===
$ git status
On branch main
Your branch is ahead of 'origin/main' by 2 commits.
nothing to commit, working tree clean
$ git diff --stat origin/main..HEAD
 .agent/tasks/2026-06-28_run_03_TASK.md             | 443 +++++++++++++++++++++
 .agent/run_reports/2026-06-28_run_03_RUN_REPORT.md | <this file>

=== PIPELINE REPO ===
$ git status
On branch agent/2026-06-28_run_03
nothing to commit, working tree clean
$ git diff --stat main..HEAD
 corpus/evals/taxonomy_eval/G2.1/README.md         |  88 +++++++++++++
 corpus/evals/taxonomy_eval/G2.1/eval_set.jsonl    |  37 +++++++
 corpus/evals/taxonomy_eval/G2.1/examples.md       |  44 +++++++
 corpus/evals/taxonomy_eval/G2.1/labeling_guide.md | 137 ++++++++++++++++++++++
 4 files changed, 306 insertions(+)
$ git branch --show-current
agent/2026-06-28_run_03

=== JSONL validation (Python stdlib) ===
OK: 37 rows, 37 unique eval_ids, 0 quote misses, excerpts ≤ 650 chars

=== Per-archetype minima ===
All ≥-5 / ≥-1 floors met (see table above).
```

## Build result

`not-run` — data/docs-only change, no app code touched. The TASK
explicitly waived `npm run build`. No Python runtime change either.

## Tests result

`JSONL validation only` — the validator from the TASK §"Validation"
block passed: 37 rows, 37 unique `eval_id`s, all required fields,
valid enums for `expected_decision` and `expected_rejection_reason`,
all `evidence_quotes` arrays are lists, all `jd_excerpt` lengths ≤
650. Additionally, all 89 `evidence_quotes` across all entries appear
verbatim inside their respective `jd_excerpt`. No automated unit-test
framework added; this is data, not code.

## Screenshots

`n/a` — pure data + documentation work; nothing rendered visually.

## Risks

- **19 of 37 entries are synthetic** (`source: "synthetic_edge_case"`).
  Synthetic entries are clearly marked, but they are author-imagined
  excerpts, not real JDs. Risk: synthetic excerpts may be too crisp /
  too archetypal compared to the messy real-world distribution.
  Severity: **medium**. Mitigation: G2.1e dry-run comparison should
  also be run against a stratified sample of the *live* corpus (not
  just the eval set) so we catch any synthetic-vs-real distribution
  gap.
- **`confusion` entry G2.1-030** is labeled `applied_ai + review`
  because the truly-correct bucket (`ai_security_engineering`) is
  deferred per the spec. Risk: a future G2.1d prompt may either
  consistently route security-flavored AI roles to `review` (matching
  this label) or default to `applied_ai`/`other` — the eval set
  doesn't distinguish those two outcomes well. Severity: **low**.
  Mitigation: add a second `confusion` entry in a future eval-set
  update if needed.
- **Synthetic entries lean toward US English / Anglosphere AI
  companies.** No internationalization examples. Severity: **low**
  for v1. Mitigation: add coverage in a future eval-set version if
  the live corpus expands into non-US sources.
- **Eval set drift over time.** The spec may be revised before the
  next G2.x; some labels will need updating. The labeling guide's
  "When to open a new TASK to fix this folder" section covers the
  flow. Severity: **low** as long as the spec and eval set move
  together through AgentOps.

## Follow-up recommendations

- **G2.1d next.** Per Path A, the classifier prompt rewrite + scoring
  dry-run is next. Risk: **red**. Must NOT run until explicit human
  approval. The dry-run script (yellow part of G2.1d) will read this
  eval set + the spec and produce a comparison report.
- **Tiny verifier script (optional, yellow, future).** A small
  `corpus/evals/taxonomy_eval/verify.py` that runs the same checks
  the RUN_REPORT validates manually (JSONL parse, required fields,
  unique IDs, evidence verbatim, length cap, composition minima per
  the spec). Defer until we have ≥ 2 eval-set versions where the
  manual verification becomes repetitive.
- **Pipeline cron drift guard.** Today the pre-run `git pull
  --ff-only` returned "Already up to date". Tomorrow's run may not.
  Promotion (G2.1c merge + push) should `git pull --ff-only` once
  more right before `git merge --ff-only`.

## Ready for review

`yes`

## Requires human decision

`yes` — for **merge + push of the pipeline branch**
(`agent/2026-06-28_run_03` → `main` in the pipeline repo, then push
to `origin/main`). The web-side TASK + RUN_REPORT commits are already
on `main` in the web repo (waiting on push). Both pushes need
explicit GO from Bohao.
