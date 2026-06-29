# Automation queue

> Backlog of candidate work Codex CLI can pick from during Automation
> Time. Codex **must not** execute work that is not present here — the
> queue is the authorization surface. See
> `.agent/policies/automation_policy.md` §8 for schema rules.

## Schema

Each item is a `### QUEUE-NNNN · <title>` block with these fields:

- `priority` — `high` / `med` / `low`
- `risk` — `green` / `yellow` / `red`
- `target_repo` — `web` / `pipeline` / `both`
- `allowed_files` — rough scope (the eventual TASK file has the real list)
- `forbidden_files` — likewise rough; defer to standard policy
- `expected_output` — what "done" looks like
- `validation` — what passes / fails proves done
- `status` — `candidate` / `in_progress` / `done` / `blocked_pending_human` / `deferred`
- `next_action` — one sentence

A queue item is not a TASK file. Codex (or the human) drafts a TASK
from a queue item before execution. When a queue item is `done`, the
final TASK / RUN_REPORT / DECISION IDs are recorded under it.

---

## Open queue (v1 · 2026-06-28)

### QUEUE-0001 · AgentOps-2a implementation

- **priority**: high
- **risk**: yellow
- **target_repo**: web
- **allowed_files**:
  - `.agent/policies/automation_policy.md`
  - `.agent/templates/automation_window_report_template.md`
  - `.agent/automation_queue.md`
  - `.agent/blockers.md`
  - `.agent/README.md` (link tweak only, optional)
- **forbidden_files**: `src/**` / `package.json` / `.env*` / `.github/workflows/**` / `vercel.json` / `.vercel/**` / pipeline repo files / Codex+Claude config / OpenAI API setup
- **expected_output**: the 5 `.agent/` files above; this very queue file is one of them
- **validation**: all 5 files exist; no forbidden file diffs; `git diff --stat` shows only `.agent/` paths
- **status**: `done`
- **next_action**: none. Policy / docs are live on `origin/main` of
  the web repo. Next safe queue item is **QUEUE-0006**
  (MANUAL_DRY_RUN report). AgentOps-2b runner remains unscoped and
  awaits explicit human approval, gated on MANUAL_DRY_RUN review +
  BLK-0002 resolution.
- **TASK / RUN_REPORT / DECISION**: `2026-06-28_run_04_TASK.md` /
  `2026-06-28_run_04_RUN_REPORT.md` /
  `2026-06-28_run_04_DECISION.md` (verdict `approve`)
- **completion_note**: AgentOps-2a promoted to `origin/main` on
  2026-06-28. Web commits: `798bf69` (impl, 5 files +896/−3),
  `de662a3` (RUN_REPORT), `f1bab0f` (DECISION). DECISION verdict
  `approve`; `human_approval_needed` remains `yes` for downstream
  actions (MANUAL_DRY_RUN, AgentOps-2b runner, G2.1d, full
  automation activation, OpenAI API, lifting any of BLK-0001/0002/0003).

### QUEUE-0002 · G2.1d classifier prompt rewrite + scoring dry-run

- **priority**: high
- **risk**: **red**
- **target_repo**: pipeline
- **allowed_files** (proposed; locked in eventual TASK):
  - `scripts/collector/classifier.py` (prompt rewrite + `CLASSIFIER_VERSION` bump)
  - new sidecar dry-run output path under `corpus/state/` or `corpus/dryrun/` (TBD)
- **forbidden_files**: everything not in the proposed allowed list
- **expected_output**: new classifier prompt; sidecar dry-run scoring
  block emitted alongside existing classifications row; dry-run runs
  against the G2.1c eval set + a stratified sample of live corpus
- **validation**: confusion matrix vs `corpus/evals/taxonomy_eval/G2.1/eval_set.jsonl`; per-category precision/recall; no main-schema change; no DB column added
- **status**: **blocked_pending_human**
- **next_action**: human + ChatGPT review during Non-Automation Time;
  approve red TASK to begin. Codex MUST NOT promote this from `blocked_pending_human` on its own.
- **reason blocked**: classifier prompt + version bump are red-zone
  per `.agent/policies/automation_policy.md` §6. Must wait for explicit human approval.

### QUEUE-0003 · P1.7b — sync hero mock numbers with `web_bundle.json`

- **priority**: med
- **risk**: yellow
- **target_repo**: web
- **allowed_files**:
  - `src/app/page.tsx` (hero mock attribution band only)
  - any tiny helper to read `src/data/web_bundle.json` at build time (preferred read-only)
- **forbidden_files**: `src/data/web_bundle.json` (read-only) / `src/lib/prompts.ts` / `package.json` / `.github/workflows/**` / pipeline files
- **expected_output**: hero mock attribution shows live `n_records` /
  evidence-quote count from the bundle instead of hardcoded `92` / `5`
- **validation**: `npm run build` passes; `npm run screenshot` shows
  desktop home with the new numbers; markdown sanity check passes
- **status**: `candidate`
- **next_action**: Codex must **inspect** `src/app/page.tsx` and the
  bundle structure before drafting a TASK. If reading the bundle at
  request time requires more than a trivial fetch, escalate to a
  separate yellow TASK. Do not modify `src/data/web_bundle.json`.

### QUEUE-0004 · P1.7c — model-string single source of truth

- **priority**: med
- **risk**: **yellow / red — must confirm before starting**
- **target_repo**: web
- **allowed_files** (tentative):
  - new `src/lib/models-display.ts` (display constants only)
  - `src/app/page.tsx` (read from the new module)
- **forbidden_files**: `src/lib/prompts.ts` / `src/lib/anthropic.ts`
  model selection logic / any prompt / pipeline / `package.json` / `.github/workflows/**`
- **expected_output**: homepage caption reads
  `MODELS_DISPLAY.generation` / `.eval` instead of hardcoded "Sonnet 4.6 + Haiku 4.5"
- **validation**: `npm run build` passes; spot-check no prompt /
  model-selection file edited; `git diff --stat` confined to the two
  display-only paths
- **status**: `candidate`
- **next_action**: Codex must **classify risk before drafting TASK**.
  If the implementation can stay in display-only modules without
  touching `src/lib/anthropic.ts` or any prompt, this is yellow. If
  it can't, escalate to red and write a blocker. **Default: assume
  yellow only after inspection.**

### QUEUE-0005 · `check_loop.py` audit helper

- **priority**: low
- **risk**: green / yellow
- **target_repo**: web
- **allowed_files**:
  - `.agent/scripts/check_loop.py` (new, Python stdlib only)
  - `.agent/README.md` (link entry only)
  - `.agent/scripts/.gitignore` (already exists)
- **forbidden_files**: `src/**` / `package.json` / `.github/workflows/**` / pipeline / Codex+Claude config
- **expected_output**: a small `python .agent/scripts/check_loop.py`
  that walks `.agent/tasks/`, `.agent/run_reports/`, `.agent/decisions/`
  and prints any `task_id` missing one of the three artifacts
- **validation**: `--help` works; smoke-test on a known-incomplete
  fake triple; tests deleted afterwards
- **status**: `deferred`
- **next_action**: only build this once a missing-file incident
  actually happens. Premature otherwise.

### QUEUE-0006 · MANUAL_DRY_RUN automation report

- **priority**: med
- **risk**: green
- **target_repo**: web
- **allowed_files**:
  - `.agent/automation_runs/2026-MM-DD_MANUAL_DRY_RUN_REPORT.md` (new)
- **forbidden_files**: everything else
- **expected_output**: a single example automation window report
  filled in by hand (Bohao + ChatGPT) using
  `.agent/templates/automation_window_report_template.md`. Used as a
  sanity check that the template + policy actually work before any
  real Automation Window is opened.
- **validation**: report parses as plain markdown; all required
  sections present; safety audit checklist all checked
- **status**: `done`
- **next_action**: none. Report is live on `origin/main` of the web
  repo at
  `.agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md`,
  reviewed and approved. Next safe queue item is **either** a
  small yellow `.agent/templates/` TASK to add an Executive Digest
  section to `automation_window_report_template.md` (per DECISION
  follow-up #3) **or** an AgentOps-2b **design memo** (yellow,
  `.agent/design_memos/` only — NOT implementation). Runner
  implementation, real Automation Window opening, G2.1d, and OpenAI
  API all remain blocked.
- **TASK / RUN_REPORT / DECISION**: `2026-06-29_run_01_TASK.md` /
  `2026-06-29_run_01_RUN_REPORT.md` /
  `2026-06-29_run_01_DECISION.md` (verdict `approve`)
- **completion_note**: QUEUE-0006 MANUAL_DRY_RUN report promoted to
  `origin/main` on 2026-06-29. Web commits: `6ade132` (MANUAL_DRY_RUN
  report — TASK + report + this queue's prior `in_review`
  transition), `2f67f0e` (RUN_REPORT), `475b116` (DECISION). DECISION
  verdict `approve`; `human_approval_needed` remains `yes` for all
  downstream actions (AgentOps-2b runner scoping / implementation,
  real Automation Window opening, G2.1d, OpenAI API, lifting any
  of BLK-0001 / BLK-0002 / BLK-0003).

---

## Done queue

- **QUEUE-0001 · AgentOps-2a implementation** — completed 2026-06-28.
  Verdict `approve`. Web commits `798bf69` (impl) / `de662a3`
  (RUN_REPORT) / `f1bab0f` (DECISION), all on `origin/main`.
  Pipeline repo unchanged. See QUEUE-0001 above for full record.
- **QUEUE-0006 · MANUAL_DRY_RUN automation report** — completed
  2026-06-29. Verdict `approve`. Web commits `6ade132`
  (MANUAL_DRY_RUN report — TASK + report + queue `candidate` →
  `in_review`) / `2f67f0e` (RUN_REPORT) / `475b116` (DECISION), all
  on `origin/main`. Pipeline repo unchanged. Report lives at
  `.agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md`. No
  blocker lifted. See QUEUE-0006 above for full record.

---

## Notes on changes to this file

- Codex CLI may **append new candidate items** in Automation Time.
- Codex CLI may **change a `status` from `candidate` to `in_progress`**
  when it picks the item.
- Codex CLI must **not** change a `status` to `done` or `blocked_pending_human`
  → `candidate` without writing a blocker or a TASK respectively.
- Human + ChatGPT may edit anything during Non-Automation Time, with
  a normal commit (`git add .agent/automation_queue.md && git commit`).
- Major restructure → open a yellow TASK first (this is the protocol
  surface; same change-control rule as the policy itself).
