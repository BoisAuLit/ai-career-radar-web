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

### QUEUE-0007 · AgentOps-2b automation runner **design memo only**

- **priority**: med
- **risk**: yellow
- **target_repo**: web
- **allowed_files**:
  - `.agent/design_memos/2026-06-29_AgentOps-2b_automation_runner_design.md` (new)
- **forbidden_files**: everything else, especially anything that
  resembles an executable runner / daemon / scheduler / cron /
  GitHub Actions workflow / Codex CLI config / Claude Code config
  / OpenAI API setup / app code / pipeline file. Memo only.
- **expected_output**: a single design memo that scopes a future
  Codex CLI + Claude Code automation runner, describes Codex /
  Claude / Human-ChatGPT roles, defines the window report
  contract (referencing the Executive Digest), lists ≥4
  implementation options (A no-runner / B supervised dry-run /
  C orchestrator with hard gates / D GH Actions or cron — D
  explicitly NOT recommended), and recommends a next step that
  is NOT a runner implementation.
- **validation**: memo exists; `status: draft_for_human_chatgpt_review`;
  16 H2 sections; explicit non-goals enumerated; BLK-0001 /
  BLK-0002 / BLK-0003 cited as `open`; QUEUE-0002 cited as
  `blocked_pending_human`.
- **status**: `done`
- **next_action**: none. Memo is live on `origin/main` of the
  web repo at
  `.agent/design_memos/2026-06-29_AgentOps-2b_automation_runner_design.md`,
  reviewed and approved. The natural follow-up is QUEUE-0008
  AgentOps-2c (blocked pending human), which scopes Option B's
  internal loop before any code. **Runner implementation, real
  Automation Window opening, G2.1d, and OpenAI API in any
  blocked sense (per Q7) all remain blocked.**
- **TASK / RUN_REPORT / DECISION**: `2026-06-29_run_03_TASK.md` /
  `2026-06-29_run_03_RUN_REPORT.md` /
  `2026-06-29_run_03_DECISION.md` (verdict `approve`)
- **completion_note**: AgentOps-2b design memo promoted to
  `origin/main` on 2026-06-30. Web commits: `00a98b2` (impl —
  TASK + memo + this queue's prior `in_review` transition),
  `70cc6d9` (RUN_REPORT), `baf2781` (DECISION). DECISION verdict
  `approve`; `human_approval_needed` remains `yes` for all
  downstream actions. **Q1 decision**: chosen path = Option B
  (Local supervised runner, dry-run only) as next
  automation-infra direction — NOT implementation approval.
  **Q7 decision**: Codex CLI via ChatGPT sign-in does NOT
  trigger BLK-0003; OpenAI API usage in the API-key / SDK /
  HTTP / automation-token / CI-secret / import / background-
  API-token senses remains blocked.
- **explicit non-goal**: this queue item does NOT authorize
  AgentOps-2b runner implementation, opening any real
  Automation Window, lifting BLK-0001 / BLK-0002 / BLK-0003, or
  starting G2.1d.

### QUEUE-0008 · AgentOps-2c supervised runner dry-run design memo

- **priority**: med
- **risk**: yellow
- **target_repo**: web
- **allowed_files**:
  - `.agent/tasks/**` (a new TASK when approved)
  - `.agent/design_memos/**` (the AgentOps-2c memo itself, path
    TBD when the TASK is drafted)
  - `.agent/run_reports/**` (matching RUN_REPORT)
  - `.agent/decisions/**` (matching DECISION)
  - `.agent/automation_queue.md` (to record this item's status
    transitions and any AgentOps-2c-derived follow-up items)
- **forbidden_files**:
  - **Any runner implementation** — no executable file that
    performs automation. Design memo describes; nothing runs.
  - `.agent/scripts/**` executable changes unless separately
    approved in their own TASK + DECISION.
  - `src/**` (all app code) / `src/lib/prompts.ts` /
    `src/lib/anthropic.ts` / `src/data/web_bundle.json` /
    `package.json` / `package-lock.json` / `.env*` /
    `vercel.json` / `.vercel/**`
  - Pipeline repo (any file — read-only sanity only)
  - `.github/workflows/**` — no GitHub Actions edit
  - Cron / systemd / launchd / any scheduler file
  - OpenAI API in any blocked sense per Q7 (SDK, `OPENAI_API_KEY`,
    HTTP to `api.openai.com`, imports of `openai`, CI secret,
    background API token)
  - `~/.codex/config.toml` and any Codex CLI config
  - `~/.claude/settings.json` and any Claude Code config
  - `.agent/policies/**` (policy stays at v1.1; AgentOps-2c may
    surface follow-up policy edits as separate TASKs)
  - `.agent/templates/**` (templates frozen; AgentOps-2c cites
    the Executive Digest but does NOT amend)
- **non-goals**:
  - **No runner implementation** in any form.
  - No automation activation.
  - No code execution.
  - No push or deploy triggered by AgentOps-2c.
  - No OpenAI API introduction.
  - No blocker resolution as a side effect.
  - No G2.1d work.
- **expected_output**: a design memo at
  `.agent/design_memos/YYYY-MM-DD_AgentOps-2c_supervised_dry_run_design.md`
  (path TBD when TASK is drafted) that drills into Option B's
  internal loop: which file the runner reads first, how it
  writes a proposed TASK without invoking `new_task.py` (or by
  re-using it), what a proposed window report (with Executive
  Digest) looks like *before* any tool runs, how Bohao rejects
  a proposal cleanly. The memo is authored (not implemented);
  its own approval loop feeds a *separate* future
  implementation TASK.
- **validation**: memo exists; `status: draft_for_human_chatgpt_review`;
  16+ H2 sections; explicit non-goals enumerated; BLK-0001 /
  BLK-0002 / BLK-0003 cited as `open`; Q1 (Option B) and Q7
  (Codex CLI vs BLK-0003) cited and honored; no executable file
  created; queue selection rules from AgentOps-2b honored;
  quota budget field defined (per AgentOps-2b DECISION risk #5).
- **status**: `in_review`
- **next_action**: memo drafted at
  `.agent/design_memos/2026-06-30_AgentOps-2c_supervised_runner_dry_run_design.md`
  under TASK `2026-06-30_run_01` (Human explicitly approved
  starting AgentOps-2c in the turn's instruction). Pending
  Human + ChatGPT review. Transition to `done` ONLY after
  the matching DECISION verdict is `approve`; revert to
  `candidate` if DECISION is `request_changes`. **Do NOT**
  transition to a "runner" or "implementation" item —
  Shape B (or any other shape) implementation is a separate
  later queue item that does not yet exist and requires its
  own scope-and-approve loop.
- **TASK / RUN_REPORT / DECISION**: `2026-06-30_run_01_TASK.md` /
  `2026-06-30_run_01_RUN_REPORT.md` (forthcoming) / pending
- **explicit non-goal**: this queue item, if approved, does
  NOT authorize runner implementation, real Automation Window
  opening, OpenAI API introduction in any blocked sense,
  lifting BLK-0001 / BLK-0002 / BLK-0003, or starting G2.1d.
  Approval of AgentOps-2c only authorizes authoring the memo;
  implementation is a further downstream TASK with its own
  scope-and-approve loop.

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
- **QUEUE-0007 · AgentOps-2b automation runner design memo only**
  — completed 2026-06-30 (memo authored 2026-06-29; pushed and
  cleaned up 2026-06-30). Verdict `approve`. Web commits
  `00a98b2` (impl — TASK + memo + this queue's prior `in_review`
  transition) / `70cc6d9` (RUN_REPORT) / `baf2781` (DECISION),
  all on `origin/main`. Pipeline repo unchanged. Memo lives at
  `.agent/design_memos/2026-06-29_AgentOps-2b_automation_runner_design.md`.
  Q1 = Option B (Local supervised runner, dry-run only) as next
  automation-infra direction — NOT implementation approval. Q7
  = Codex CLI via ChatGPT sign-in does NOT trigger BLK-0003;
  API-key / SDK / HTTP / automation-token OpenAI usage remains
  blocked. No blocker lifted. See QUEUE-0007 above for full
  record.

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
