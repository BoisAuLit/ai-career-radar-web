# Automation window report · `2026-06-29_MANUAL_DRY_RUN_REPORT`

> Hand-authored MANUAL_DRY_RUN per `QUEUE-0006`. **No runner ran.** The
> two "automation windows" this report summarizes — G2.1c closure and
> AgentOps-2a policy promotion — were executed by a human-driven loop
> (Human + Claude Code + ChatGPT, file-protocol only) over 2026-06-28.
> This report is a contract-shaped *retrospective* on that real work,
> used to validate whether
> `.agent/templates/automation_window_report_template.md` is useful
> enough for Human + ChatGPT Non-Automation Time review before any
> real runner (AgentOps-2b) is scoped or built.
>
> This report does **not** execute code, automation, deploys, LLM
> calls, or any side effect beyond writing this single file (and the
> matching TASK + RUN_REPORT). It does **not** lift any blocker. It
> does **not** approve any future runner.

## Metadata

- **report_id**: `2026-06-29_MANUAL_DRY_RUN`
- **date**: `2026-06-29`
- **window_name**: `MANUAL_DRY_RUN`
- **window_type**: `manual_dry_run`
- **time_range**: covers retrospective period
  `2026-06-28 ~13:00 → 2026-06-29 ~00:15` (real wall-clock during which
  G2.1c + AgentOps-2a actually shipped); the report itself is being
  authored on `2026-06-29`
- **generated_by**: `human_manual` (Claude Code, following Human +
  ChatGPT instruction; no Codex CLI involvement, no runner)
- **reviewed_by**: *(to be filled by Bohao after Non-Automation Time
  review with ChatGPT Chat)*
- **status**: `ready_for_review`
- **intended reviewer**: Human + ChatGPT Chat

## Executive summary

Two real loops from the prior session — **G2.1c** (cross-repo, v1
hand-labeled taxonomy eval set, 37 entries) and **AgentOps-2a** (web
`.agent/`-only Codex + Claude Code automation policy + queue +
blockers + report template) — both completed end-to-end via the
AgentOps file protocol with human-approved push. Cleanup commit
`1fd3c8d` updated the daily summary and marked `QUEUE-0001` as
`done`. **No runner / daemon / scheduler / cron was created or
activated**; the AgentOps-2a deliverable is policy + documentation
only. The contract the policy describes is the contract this report
is testing. Decisions needed from Human + ChatGPT: (1) is this report
shape useful enough to be the primary handoff during Non-Automation
Time? (2) approve closing `QUEUE-0006` as `done` once the answer to
(1) is yes? (3) confirm AgentOps-2b runner scoping does not start
until BLK-0002 is explicitly resolved by a separate human decision?

## Goals selected by Codex

> Codex CLI **did not run** this window. No queue items were picked by
> Codex. The two "goals" below are the queue items that the
> equivalent of an Automation Window would have been picking from,
> had a runner existed. They were each driven by Human + Claude Code
> manually instead.

| queue_id | title | priority | risk | rationale |
|---|---|---|---|---|
| (pre-`QUEUE-0001`) | G2.1c · hand-labeled taxonomy eval set | high | yellow | "Path A step before red G2.1d; eval set is the ground truth the classifier dry-run will score against." |
| `QUEUE-0001` | AgentOps-2a · Codex + Claude Code automation policy | high | yellow | "Defines the contract any future Codex+Claude runner must obey; prerequisite for QUEUE-0006 itself." |
| `QUEUE-0006` | MANUAL_DRY_RUN automation window report | med | green | "Validates the AgentOps-2a contract end-to-end against real recent work before any runner is built." |

`QUEUE-0006` is the item this report itself fulfills.

## Tasks attempted

> All risk levels are `yellow` or `green`. No red task was attempted
> this period. Tasks are listed in execution order; the third row is
> this very task.

| task_id | title | risk | repo | result |
|---|---|---|---|---|
| `2026-06-28_run_03` | G2.1c · hand-labeled taxonomy eval set (cross-repo) | yellow | web + pipeline | completed |
| `2026-06-28_run_04` | AgentOps-2a · Codex + Claude Code automation policy | yellow | web | completed |
| `2026-06-29_run_01` | QUEUE-0006 · MANUAL_DRY_RUN automation window report (this task) | green | web | in_progress (this report is the deliverable) |

## Tasks completed

> Subset of "attempted" where the matching DECISION verdict was
> `approve` and the work was pushed to `origin/main`.

| task_id | verdict | notes |
|---|---|---|
| `2026-06-28_run_03` | `approve` | Web push `7c75119..1668807`; pipeline ff-merge + push `f833bfd..b019786`; eval set live in pipeline `main` at `b019786`. Branch `agent/2026-06-28_run_03` deleted locally. |
| `2026-06-28_run_04` | `approve` | Web push `141ebdf..f1bab0f` (3 commits: impl `798bf69` + RUN_REPORT `de662a3` + DECISION `f1bab0f`). No pipeline change. Cleanup commit `1fd3c8d` pushed `f1bab0f..1fd3c8d`. No branch was cut (yellow `.agent/`-only doc work historically goes to `main`). |
| `2026-06-29_run_01` | *pending DECISION* | This is the current task. The deliverable is this report; the matching RUN_REPORT will reference this same path. No DECISION yet. |

## Commits created

> All commits are real and on `origin/main` of their respective repos
> at the time of writing.

**Web repo** (`/Users/bohaoli/Desktop/ai-career-radar-web`):

G2.1c (`2026-06-28_run_03`):
- `4b1ca02` Add TASK 2026-06-28_run_03 · branch `main` · pushed `yes`
- `a612712` Add RUN_REPORT 2026-06-28_run_03 · branch `main` · pushed `yes`
- `1668807` Add DECISION 2026-06-28_run_03 · branch `main` · pushed `yes`
- `141ebdf` Update daily summary for G2.1c · branch `main` · pushed `yes`

AgentOps-2a (`2026-06-28_run_04`):
- `5189c07` Add TASK 2026-06-28_run_04 · branch `main` · pushed `yes` (earlier, pre-impl)
- `798bf69` Add Codex Claude automation policy · branch `main` · pushed `yes` (5 files +896/−3)
- `de662a3` Add RUN_REPORT 2026-06-28_run_04 · branch `main` · pushed `yes`
- `f1bab0f` Add DECISION 2026-06-28_run_04 · branch `main` · pushed `yes`
- `1fd3c8d` Update daily summary for AgentOps-2a · branch `main` · pushed `yes` (cleanup; marks `QUEUE-0001` done)

MANUAL_DRY_RUN (`2026-06-29_run_01`) — *in flight as of this report*:
- *(forthcoming)* Add MANUAL_DRY_RUN automation report (TASK + this report; maybe queue update)
- *(forthcoming)* Add RUN_REPORT 2026-06-29_run_01

**Pipeline repo** (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`):

G2.1c (`2026-06-28_run_03`):
- `b019786` Add G2.1 taxonomy eval set · branch `main` (fast-forwarded from `agent/2026-06-28_run_03`) · pushed `yes`. Branch deleted locally after merge.

AgentOps-2a (`2026-06-28_run_04`): `none` (web-only).

MANUAL_DRY_RUN (`2026-06-29_run_01`): `none` (web-only; pipeline read-only).

Pipeline HEAD at start of this report = `b019786` = `origin/main`,
clean. Pipeline HEAD at end of this report (planned) = `b019786`,
clean. Zero pipeline change in this window.

## Files changed

```
web · main · range 7c75119..1fd3c8d (last G2.1b daily summary → current HEAD)
 .agent/README.md                                                   |  28 +-
 .agent/automation_queue.md                                         | 181 +++++++++
 .agent/blockers.md                                                 | 113 ++++++
 .agent/daily_summaries/2026-06-28_SUMMARY.md                       | 314 +++++++-
 .agent/decisions/2026-06-28_run_03_DECISION.md                     | 147 ++++++
 .agent/decisions/2026-06-28_run_04_DECISION.md                     | 189 ++++++++
 .agent/policies/automation_policy.md                               | 402 +++++++++++++++
 .agent/run_reports/2026-06-28_run_03_RUN_REPORT.md                 | 303 ++++++++++++
 .agent/run_reports/2026-06-28_run_04_RUN_REPORT.md                 | 270 +++++++++++
 .agent/tasks/2026-06-28_run_03_TASK.md                             | 443 +++++++++++++++++
 .agent/tasks/2026-06-28_run_04_TASK.md                             | 358 +++++++++++++++
 .agent/templates/automation_window_report_template.md              | 188 +++++++++
 12 files changed, 2895 insertions(+), 41 deletions(-)
```

```
pipeline · main · range f833bfd..b019786 (G2.1c only)
 corpus/evals/taxonomy_eval/G2.1/README.md          |  88 +++++
 corpus/evals/taxonomy_eval/G2.1/eval_set.jsonl     |  37 +++  (37 hand-labeled entries)
 corpus/evals/taxonomy_eval/G2.1/examples.md        |  44 +++
 corpus/evals/taxonomy_eval/G2.1/labeling_guide.md  | 137 +++++
 4 files changed, 306 insertions(+)
```

Web changes: 100% under `.agent/` — protocol + policy + tasks + reports +
decisions + daily summary. No `src/**`, no `package*.json`, no
`.github/workflows/**`, no `vercel.json` / `.vercel/**`, no `.env*`.

Pipeline changes: 100% under `corpus/evals/taxonomy_eval/G2.1/` — pure
new directory. No `scripts/collector/**`, no `corpus/schema/**`, no
`corpus/state/**`, no `sources.yaml`, no `.github/workflows/**`, no
classifier / extractor / prompt / model / cron file.

## Validation results

> One row per real validation that ran during the underlying work.
> The MANUAL_DRY_RUN authoring itself runs **only**
> scope-and-forbidden-audit checks; it does not invoke
> `npm run build`, `python -m scripts.collector`, or any LLM call.

| what | command | result | notes |
|---|---|---|---|
| G2.1c JSONL parse | (Python stdlib parse via review script in RUN_REPORT) | pass | 37 rows · 37 unique `eval_id`s · all required fields · all valid enums |
| G2.1c verbatim-quote check | (parse + `in` against `jd_excerpt`) | pass | 0 quote misses across 89 quotes in 37 entries |
| G2.1c composition minima | (counts by archetype + trap class) | pass | TP ≥5 for `applied_ai`/`ai_product_engineering`/`agent_engineering`/`forward_deployed`; FP-trap ≥5; FN-trap ≥5; all 6 long-tail archetypes ≥1; both reject categories ≥1 |
| G2.1c excerpt length | (`min`/`max`/`mean`) | pass | min 231 / max 371 / mean 289 chars (cap 650) |
| AgentOps-2a scope check | `git diff --name-only 141ebdf..HEAD` | pass | exactly 7 paths (impl 5 + RUN_REPORT + DECISION); all under `.agent/` |
| AgentOps-2a forbidden audit | `git diff --stat HEAD -- src/ …` (8 web paths) | pass | empty diff for all forbidden paths |
| AgentOps-2a sanity grep | `grep '## Cron job' / '## Daemon' / …` | pass | none present as positive headings; only prohibition mentions |
| AgentOps-2a README link resolve | `ls .agent/policies/* templates/* automation_queue.md blockers.md` | pass | 4 README-linked files exist |
| MANUAL_DRY_RUN scope check (this task) | `git diff --name-only` (pre-commit) | pending — taken at validation step (Step 5) | should show only TASK + report + RUN_REPORT (+ optional queue) |
| MANUAL_DRY_RUN section count (this report) | `grep -c '^## ' .agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md` | pending — taken at validation step (Step 5) | target ≥ 17 (matches template) |

`(no failure)` across all validations completed so far.

## Claude Code usage summary

| task_id | tokens (approx) | cost (approx USD) | notes |
|---|---|---|---|
| `2026-06-28_run_03` | `unavailable` | `unavailable` | Claude Code does not surface a per-turn token meter; this column will read `unavailable` until either the runner or Claude Code adds one. |
| `2026-06-28_run_04` | `unavailable` | `unavailable` | Same as above. |
| `2026-06-29_run_01` | `unavailable` | `unavailable` | Same. |

> Action item for AgentOps-2b scoping: the runner SHOULD surface a
> per-task token / cost estimate so this column is fillable. Until
> then, `unavailable` is the honest answer.

## Codex review summary

> Codex CLI did **not** run during this period. There was no
> Automation Window. The review responsibility fell to **ChatGPT
> Chat** (human-mediated) at DECISION time for each task.

ChatGPT-Chat findings, in DECISION-file order:

- ✅ `2026-06-28_run_03` (G2.1c) — clean diff, scope respected, all
  composition minima met, 0 verbatim-quote misses. Verdict `approve`.
- ✅ `2026-06-28_run_04` (AgentOps-2a) — exactly the 6 allowed paths,
  no forbidden file touched, 12 policy sections present, OpenAI/runner
  language appears only as prohibition. Verdict `approve`. 6 risks
  enumerated (policy unverified, full activation blocked, G2.1d red,
  queue red-task discipline, OpenAI standing block, queue maintenance
  note), 0 required fixes.
- ⏳ `2026-06-29_run_01` (this MANUAL_DRY_RUN) — review pending. The
  whole point of the dry-run is to find out whether **this very review
  step** is convenient for Human + ChatGPT when reading the report
  produced.

## Red-zone encounters

> Every time the workflow hit a Red-policy boundary during this period.

| time | task | red-zone path | blocker_id |
|---|---|---|---|
| n/a | — | — | — |

`0` red-zone encounters. The happy path held — no task in this
window touched `src/**`, `src/lib/prompts.ts`, `src/data/web_bundle.json`,
`package*.json`, `.env*`, `.github/workflows/**`, `vercel.json`,
`.vercel/**`, or any pipeline `scripts/collector/**` /
`corpus/schema/**` / `corpus/state/**` / `sources.yaml` /
generated-corpus file. G2.1d (which IS red) was correctly NOT
attempted; it sits in QUEUE-0002 as `blocked_pending_human` and
BLK-0001 remains `open`.

## Blockers created or updated

| blocker_id | reason | risk | human_decision_needed |
|---|---|---|---|
| BLK-0001 | G2.1d red-zone approval (classifier prompt + `CLASSIFIER_VERSION` bump) | red | yes — explicit human + ChatGPT GO before *any* G2.1d work, not just before merge |
| BLK-0002 | Full automation activation (any real `SLEEP_WINDOW`/`WORKDAY_WINDOW`/`WEEKEND_WINDOW`) | red | yes — gated on at least one reviewed MANUAL_DRY_RUN (this report) + AgentOps-2b runner with its own scope-and-approve loop |
| BLK-0003 | Any OpenAI API usage (SDK / key / `.env` entry / HTTP call) | red | yes — standing block, open by design; any introduction must reference and request resolution of this blocker first |

**No new blocker created or updated by this MANUAL_DRY_RUN.** All
three above were created in AgentOps-2a (`798bf69`) and are
restated here verbatim for the human reviewer's convenience. None
are lifted by this report — that requires a separate human
decision.

## Failed validations

`(none)`

No validation failure occurred during G2.1c, AgentOps-2a, or the
authoring of this MANUAL_DRY_RUN report up to Step 5. If a failure
surfaces during Step 5 scope or audit checks for this task, the
RUN_REPORT will record it; the MANUAL_DRY_RUN report itself will be
updated in the same loop and a new commit added.

## Merge / push / deploy status

| repo | branch | merged into main? | pushed to origin? | Vercel deploy? |
|---|---|---|---|---|
| web (G2.1c TASK/RUN_REPORT/DECISION/daily-summary) | `main` (no branch cut) | yes (direct on main) | yes (`7c75119..141ebdf` over 4 commits) | auto (non-disruptive; only `.agent/` changed → served bundle byte-identical) |
| pipeline (G2.1c eval set) | `agent/2026-06-28_run_03` | yes (ff-merge `f833bfd..b019786`) | yes (`f833bfd..b019786`) | n/a (no deploy from pipeline) |
| web (AgentOps-2a impl + RUN_REPORT + DECISION + cleanup) | `main` (no branch cut) | yes (direct on main) | yes (`141ebdf..1fd3c8d` over 4 commits) | auto (non-disruptive; only `.agent/` changed → served bundle byte-identical) |
| web (this MANUAL_DRY_RUN) | `main` (no branch cut planned) | **no — current step is local commit only; no push this task per TASK constraints** | **no — push is a separate human decision after the matching DECISION lands** | n/a (no push → no deploy trigger) |
| pipeline (this MANUAL_DRY_RUN) | — | n/a (pipeline not touched) | n/a | n/a |

## Human decisions requested

1. **Is the AgentOps-2a contract usable in practice?** Specifically:
   does this MANUAL_DRY_RUN report, read alongside
   `.agent/policies/automation_policy.md` and
   `.agent/automation_queue.md`, give Human + ChatGPT enough signal
   to approve, request changes, or reject an automation window —
   *without* re-reading the underlying commits one-by-one? `approve`
   / `request changes` / `defer`.
2. **Approve closing `QUEUE-0006` as `done`** in
   `.agent/automation_queue.md`? (The queue may already have been
   moved to `in_review` by this task; the `done` transition is
   reserved for the DECISION step.) `approve` / `defer`.
3. **Confirm AgentOps-2b runner scoping does NOT start** until
   BLK-0002 is explicitly resolved by a separate human decision?
   `confirm` / `lift BLK-0002 now` / `defer`.
4. **Confirm `BLK-0001` (G2.1d) remains `open`** — Codex CLI / Claude
   Code MUST NOT self-promote G2.1d even though the G2.1c eval set is
   live? `confirm`.
5. **Confirm `BLK-0003` (OpenAI API) remains `open` (standing block)**
   — any future task proposing OpenAI API usage must reference and
   request resolution of this blocker, and Codex/Claude must refuse
   on its own otherwise? `confirm`.
6. **Pick the next safe task.** Options as of this report:
   `QUEUE-0003` P1.7b hero mock numbers (yellow, web), `QUEUE-0004`
   P1.7c model-string SSOT (yellow/red — Codex must classify before
   drafting), `QUEUE-0005` `check_loop.py` audit helper (deferred),
   or open a new task. Explicitly NOT options yet: `QUEUE-0002`
   G2.1d (blocked, red), AgentOps-2b runner scoping (out of order),
   any full Automation Window opening (blocked by BLK-0002).

## Suggested ChatGPT review questions

> Copy-paste-ready prompts the human can send into ChatGPT Chat.

```
> I'm in Non-Automation Time. Read the MANUAL_DRY_RUN report at
> .agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md
> alongside .agent/policies/automation_policy.md,
> .agent/automation_queue.md, and .agent/blockers.md.
>
> Then answer:
> 1. Is the report shape adequate for Non-Automation Time review?
>    If not, name the smallest concrete change to the template that
>    would make it adequate.
> 2. Approve, request changes, or reject closing QUEUE-0006 as done?
> 3. Are any of BLK-0001 / BLK-0002 / BLK-0003 safe to lift now?
>    Default answer must be "no".
> 4. Of QUEUE-0003 / QUEUE-0004 / QUEUE-0005 / new task — what is
>    the safest next thing to do? Specifically NOT: G2.1d, full
>    automation activation, AgentOps-2b runner.
> 5. Anything in the underlying commits (G2.1c b019786 / AgentOps-2a
>    f1bab0f / cleanup 1fd3c8d) that the report missed or
>    mis-summarized?
```

```
> Adversarial pass: try to find a way this MANUAL_DRY_RUN report is
> wrong or misleading. Specifically check:
> - Did it count any red-zone work as "completed"?
> - Did it claim any blocker resolved that is actually still open?
> - Did it imply any runner / daemon / cron exists when none does?
> - Did it claim any deploy / OpenAI API / GH Actions change?
> - Did it use any commit hash that doesn't exist?
> Report each finding as a one-liner with the section + reason.
```

## Next recommended automation tasks

> Note: until **AgentOps-2b** is scoped + approved + built, there is
> no runner to "pick" these. The ordering below is what a runner
> *would* pick first, given the current queue + blocker state.

| order | candidate | risk | rationale |
|---|---|---|---|
| 1 | (this report's DECISION step — out-of-loop) | green | Human + ChatGPT verdict on this MANUAL_DRY_RUN; closes QUEUE-0006 if `approve`. |
| 2 | `QUEUE-0003` P1.7b · hero mock numbers ← `web_bundle.json` | yellow | Smallest live web change; reads `src/data/web_bundle.json` read-only; no prompt / model touch. |
| 3 | `QUEUE-0004` P1.7c · model-string SSOT | yellow / red — classify first | Codex must classify before drafting; allowed only if implementation stays in display-only modules (no `src/lib/anthropic.ts` selection logic, no prompt edit). |
| 4 | AgentOps-2b runner scoping (design memo only) | yellow (memo) → red (impl) | **Out of order until decisions #1–#3 of "Human decisions requested" above are answered.** The memo would scope what minimal-safe runner exists; nothing is built. |
| 5 | `QUEUE-0005` `check_loop.py` audit helper | green | Strictly optional; build only after a real missing-file incident, per AgentOps-1c follow-up. |
| — (NOT a candidate) | `QUEUE-0002` G2.1d | **red** · `blocked_pending_human` | Stays blocked. Codex / Claude MUST NOT self-promote. |
| — (NOT a candidate) | Any real Automation Window opening | **red** · `BLK-0002` | Stays blocked until decisions #1 + #3 + AgentOps-2b runner DECISION. |
| — (NOT a candidate) | Any OpenAI API introduction | **red** · `BLK-0003` standing block | Stays blocked, standing by design. |

## Safety audit

> Mirror of policy §6 (Red/Yellow/Green) and §11 (Stop conditions).
> Applied to the work this report retrospectively covers AND to the
> authoring of this report itself.

- [x] No red-zone file changed without prior human approval (no
      red-zone file changed at all; G2.1d not attempted)
- [x] No forbidden file changed in any task this window (web `src/**`
      / `package*.json` / `.env*` / `vercel.json` / `.vercel/**` /
      `.github/workflows/**` / `src/lib/prompts.ts` /
      `src/data/web_bundle.json` all unchanged across the underlying
      G2.1c + AgentOps-2a + cleanup commits AND across this task)
- [x] No `python -m scripts.collector …` invoked unless TASK
      explicitly allowed (none invoked anywhere)
- [x] No LLM call beyond Claude Code / Codex CLI standard usage
      (Codex never ran; Claude Code authored documentation; no
      `anthropic` / `openai` SDK invocation, no HTTP request to any
      AI provider)
- [x] No new GitHub Actions / cron / workflow (no change under
      `.github/workflows/**`; existing pipeline cron untouched)
- [x] No new deps (npm or python) (`package.json` /
      `package-lock.json` / any `requirements*.txt` untouched)
- [x] No OpenAI API SDK / key / HTTP usage (BLK-0003 still standing
      `open`; not introduced anywhere)
- [x] No force push / history rewrite / destructive reset (web pushes
      were normal fast-forwards `7c75119..141ebdf`, `141ebdf..f1bab0f`,
      `f1bab0f..1fd3c8d`; pipeline push was normal ff `f833bfd..b019786`)
- [x] No manual deploy (Vercel auto-trigger from `.agent/`-only web
      pushes is non-disruptive — served bundle byte-identical; no
      `vercel deploy` invoked)
- [x] No autonomous loop / daemon / scheduler created (AgentOps-2a
      added policy / docs only; no runner exists; QUEUE-0006 itself
      explicitly does not introduce one)

`10/10` boxes checked. Any unchecked box → escalate in "Human
decisions requested" above; this report has none.

## Final status

`ready_for_review`

> Reviewed by: *(to be appended by Bohao after Non-Automation Time
> review with ChatGPT Chat — `reviewed_approved` /
> `reviewed_changes_requested`)*

---

## Appendix: explicit answers to the 10 review questions

> Restated for ChatGPT-paste convenience; the body above already
> covers each. This appendix is intentional duplication so the
> reviewer can copy a single section and get the full picture.

1. **What changed recently?** Two real loops: G2.1c shipped a v1
   37-entry hand-labeled taxonomy eval set to the pipeline repo
   (`b019786`), and AgentOps-2a shipped 5 policy/doc files to the
   web repo (`f1bab0f`) plus a cleanup commit `1fd3c8d`.
2. **Which tasks completed?** `2026-06-28_run_03` (G2.1c) and
   `2026-06-28_run_04` (AgentOps-2a). Both DECISION verdict
   `approve`, both pushed.
3. **Which commits matter?** Web: `1668807` (G2.1c DECISION),
   `141ebdf` (G2.1c daily summary), `798bf69` (AgentOps-2a impl),
   `de662a3` (RUN_REPORT), `f1bab0f` (DECISION), `1fd3c8d`
   (cleanup). Pipeline: `b019786` (G2.1c eval set).
4. **Which repos changed?** Web (`.agent/` only, no `src/`) and
   pipeline (`corpus/evals/taxonomy_eval/G2.1/` only — pure new
   directory).
5. **Which validations passed?** All listed in "Validation results"
   above: JSONL parse, verbatim-quote check, composition minima,
   excerpt length (G2.1c); scope check, forbidden audit, sanity
   grep, README link resolve (AgentOps-2a). `0` failures.
6. **What is blocked?** BLK-0001 (G2.1d red-zone), BLK-0002 (full
   automation activation), BLK-0003 (OpenAI API, standing). Plus
   QUEUE-0002 status `blocked_pending_human`. All three blockers
   remain `open`; this report lifts none.
7. **What is NOT active yet?** Full automation. Any real Automation
   Window (SLEEP_WINDOW / WORKDAY_WINDOW / WEEKEND_WINDOW). The
   AgentOps-2b runner. G2.1d. OpenAI API. Codex CLI never ran. No
   daemon / scheduler / cron exists.
8. **What should Human + ChatGPT decide next?** The 6 items in
   "Human decisions requested" above — primarily whether the report
   shape is adequate for Non-Automation Time review (closes
   QUEUE-0006 if yes).
9. **What is the safest next automation task?** The DECISION step on
   this report itself, followed (if approved) by `QUEUE-0003`
   P1.7b hero mock numbers. Explicitly NOT G2.1d, NOT AgentOps-2b
   runner, NOT any real Automation Window, NOT OpenAI API work.
10. **What must NOT happen yet?** No real Automation Window opening,
    no AgentOps-2b runner scoping/implementation, no G2.1d, no
    OpenAI API introduction, no lifting of BLK-0001 / BLK-0002 /
    BLK-0003 without explicit human resolution, no
    deploy/cron/workflow change, no force push, no
    `python -m scripts.collector …` invocation.
