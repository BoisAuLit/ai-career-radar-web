# DECISION · AgentOps-2b automation runner design memo

> Authored by ChatGPT (human-mediated) after reading the RUN_REPORT,
> the memo, and the live tree on `main`. Scaffolded by
> `python .agent/scripts/new_decision.py --task-id 2026-06-29_run_03`
> (**eighth full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-06-29_run_03_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-06-29_run_03_RUN_REPORT.md`

## Verdict

`approve`

## Reasoning summary

AgentOps-2b successfully creates a **design-only memo** for the
future Codex CLI + Claude Code automation runner. The memo
clarifies responsibilities (Codex as planner/reviewer, Claude
Code as coding executor, Human + ChatGPT as B-time reviewer),
the automation window report contract (referencing the new
10-line Executive Digest), queue and blocker handling, stop
conditions on top of policy §11, merge/push/deploy policy,
failure modes, and four implementation options (A no runner /
B supervised dry-run / C orchestrator with hard gates / D
GitHub Actions or cron — explicitly recommended against).

The implementation remained documentation-only and did not
create any runner, daemon, scheduler, cron, OpenAI API usage,
GitHub Actions change, Codex/Claude config change, app code
change, or pipeline change. **No executable file of any kind
exists as a result of this task.** The only new queue item
(QUEUE-0007) is marked `in_review`; no existing queue item or
blocker was touched.

The chosen next automation-infra direction is **Option B**
(local supervised runner, dry-run only) — but this DECISION
does **not** authorize implementation. Implementation requires
a separate scope-and-approve loop (likely AgentOps-2c design
memo first, then a separate implementation TASK + DECISION).

Independent verification against the live tree on `main`:

- **Scope** (`git diff --name-only origin/main..HEAD`) is
  exactly the 4 approved paths:
  `.agent/tasks/2026-06-29_run_03_TASK.md`,
  `.agent/design_memos/2026-06-29_AgentOps-2b_automation_runner_design.md`,
  `.agent/automation_queue.md`,
  `.agent/run_reports/2026-06-29_run_03_RUN_REPORT.md`. No
  extra files, no forbidden files.
- **Memo structural check**: 821 lines (under 1200-line
  stop-cap, inside 500-900 sanity target). `grep -c '^## '`
  = 19 (16 required spec sections + 3 useful extras: Blocker
  handling, Risks summary, Acknowledgements / Sanity
  checklist). All 16 spec sections present in roughly the
  spec's order.
- **Memo Status / Scope / Non-goal**: `Status:
  draft_for_human_chatgpt_review` / `Scope: design only` /
  `Non-goal: no runner implementation` — all verbatim in the
  memo's "Title / Status" section.
- **Memo Options coverage**: A (no runner — safest minimal)
  + B (supervised dry-run) + C (orchestrator with hard
  gates) + D (GitHub Actions / cron — explicitly NOT
  recommended). Each with pros / cons / risk / verdict.
- **Memo Recommended path**: explicitly says next step is
  NOT a runner implementation. Default = (c) return to
  product work; secondary = (a) MANUAL_DRY_RUN-2; tertiary =
  (b) AgentOps-2c design memo. This DECISION overrides the
  memo's default in favor of (b) (see Q1 below).
- **Memo non-activation statements**: full automation
  remains inactive, OpenAI API remains blocked, G2.1d
  remains blocked — all verbatim in the memo's "Explicit
  non-goals" and "Decision questions" sections;
  `grep 'BLK-000[1|2|3]'` = 28 matches across the memo
  (extensively cited as currently `open`).
- **Queue state**: QUEUE-0007 added with `status: in_review`
  only (NOT `done`, NOT `in_progress`, NOT a "runner" item).
  QUEUE-0001 still `done`. QUEUE-0002 G2.1d still
  `blocked_pending_human` red. QUEUE-0003/0004/0005
  unchanged. QUEUE-0006 still `done`.
- **Blockers state**: `blockers.md` not touched.
  **BLK-0001 / BLK-0002 / BLK-0003 all still `open`.**
- **Pipeline repo** untouched (`b019786` = `origin/main`;
  clean) at both run start and end. Zero pipeline-side
  change.
- **No runner / daemon / cron / scheduler / GitHub Actions
  edit / OpenAI SDK install / Codex / Claude config
  mutation** anywhere. No `.github/workflows/**` change. No
  executable file (`.py` / `.sh` / `.js` / etc.) that
  enables automatic execution created in `.agent/scripts/`
  or anywhere else.

The work meets every Acceptance criterion in the TASK (all
16 boxes verifiable). Approving on technical execution.
Push to `origin/main` remains a separate human-approval gate
per policy §3.

## Risks found

1. **The memo is long (821 lines) and conceptual.** It
   describes future runner behavior in detail but still
   does not prove real automation safety. The MANUAL_DRY_RUN
   proved the *reporting* contract; this memo scopes the
   *execution* contract; **neither has been exercised by
   actual end-to-end automation**. Severity: **medium /
   accepted**. Mitigation: this DECISION explicitly forbids
   runner implementation; any future supervised dry-run
   (Option B) must itself produce a window report subject
   to B-time review.
2. **Option B is chosen only as the next *design* direction,
   not as implementation approval.** A future reader could
   mistake "Option B approved" for "build Option B now". The
   DECISION makes the gate explicit: the next concrete
   step is an AgentOps-2c **design memo** that drills into
   Option B's internal loop — NOT code. Severity: **medium**.
   Mitigation: the memo's QUEUE-0007 entry and the next
   task prompt below both explicitly say no implementation.
3. **Any future AgentOps-2c must remain non-executing
   unless separately approved.** AgentOps-2c is a design
   memo with its own scope-and-approve loop, identical in
   shape to the current AgentOps-2b loop. If it ever
   transitions to implementation, that transition is its
   own TASK + DECISION + human approval. Severity: **low /
   process**.
4. **Auto-push should remain disabled for the first real
   automation experiments.** Even in Option B (supervised
   dry-run that does not call Claude Code automatically),
   the dry-run's own commits should be commit-only; Bohao
   pushes during B-time. Severity: **low**. Mitigation:
   captured in the memo's "Merge / push / deploy rules" and
   restated in the next task prompt.
5. **Claude Code quota consumption must be capped or planned
   before real A-time automation.** The token meter is
   currently `unavailable` per the memo's "Claude Code
   usage summary" section. Any future Option B/C
   implementation TASK must propose a budget per window
   (wall-clock-time and/or commit count until the meter
   exists). Severity: **medium / unblocked-by-this-DECISION**.
   Mitigation: surface in any AgentOps-2c design memo as
   a required field; reject any implementation TASK that
   does not specify a quota.
6. **G2.1d remains blocked by BLK-0001** (red-zone:
   classifier prompt rewrite + `CLASSIFIER_VERSION` bump).
   Codex CLI / Claude Code must NOT self-promote even after
   this DECISION. Severity: **n/a by design**.
7. **Full automation remains blocked by BLK-0002.** Opening
   any real `SLEEP_WINDOW` / `WORKDAY_WINDOW` /
   `WEEKEND_WINDOW` requires (a) the runner to exist with
   its own DECISION AND (b) explicit human resolution of
   BLK-0002. Severity: **n/a by design**.
8. **OpenAI API remains blocked by BLK-0003 (standing
   block).** See Q7 decision below for the explicit scope
   of BLK-0003. Severity: **n/a by design**.
9. **Codex CLI via ChatGPT sign-in is allowed; API-key /
   API-SDK / API-token automation remains blocked.** See Q7
   decision below for the verbatim allow/deny list.
   Severity: **medium / by Q7 decision**.
10. **Pipeline-repo automation may require a separate memo
    before any real automation touches pipeline files.**
    AgentOps-2b's memo focuses on the web repo's `.agent/`.
    Pipeline `corpus/` is BLK-0001-adjacent territory
    (classifier prompt, schema, etc.); any automation TASK
    that proposes editing pipeline files must reference
    BLK-0001 + the absence of a pipeline-side automation
    memo, and stop. Severity: **medium / accepted**.
    Mitigation: surface as a decision question for the
    eventual AgentOps-2c memo.

## Red-zone flags

`none` for the AgentOps-2b design memo.

No `src/**`, `src/lib/prompts.ts`, `src/lib/anthropic.ts`,
`src/data/web_bundle.json`, `package.json`,
`package-lock.json`, `.env*`, `vercel.json`, `.vercel/**`,
`.github/workflows/**`, `.agent/policies/agent_policy.md`,
`.agent/policies/automation_policy.md`,
`.agent/templates/**`, `.agent/scripts/**`,
`.agent/blockers.md`, `.agent/automation_runs/**`,
`.agent/daily_summaries/**`, `.agent/README.md`, or
`.agent/decisions/**` (other than this DECISION file once
committed) changed. No pipeline-repo file changed. No Codex
CLI config, Claude Code config, or OpenAI SDK introduced.
No executable runner / shell script / config / cron / hook
file created anywhere.

## Required fixes

`none`

Scope is clean (4 paths, all approved), memo structure check
passes (19 H2 sections covering all 16 required + 3 useful
extras), all 16 TASK acceptance criteria are demonstrably
met, the 5 explicit non-activation statements are present
verbatim, and no forbidden / red-zone / pipeline / runner /
OpenAI / config / executable path was touched.

## Human + ChatGPT decisions recorded

This DECISION records two load-bearing Human + ChatGPT
answers to the memo's "Decision questions for Human +
ChatGPT" section. Both are now formal: any future TASK that
contradicts them must reference and explicitly re-litigate
the relevant Q.

### Q1 — Next automation-infra direction = **Option B**

**Choice**: Option B — "Local supervised runner, dry-run
only."

**Interpretation**:

- The next step in the automation-infra track may be an
  **AgentOps-2c design memo** that scopes Option B's
  internal loop in detail (which file the runner reads
  first, how it writes a proposed TASK without invoking
  `new_task.py` or by re-using it, what the proposed
  window report looks like *before* any tool runs, how
  Bohao rejects a proposal cleanly) — OR a **non-executing
  prototype scope** in the same shape, depending on which
  framing Bohao + ChatGPT find more useful in the next
  B-time.
- The runner / prototype:
  - **MUST NOT** execute code automatically.
  - **MUST NOT** push.
  - **MUST NOT** deploy.
  - **MUST NOT** call OpenAI API (per Q7 below).
  - **MUST NOT** run Claude Code automatically yet unless
    separately approved in its own TASK + DECISION.
  - **MUST** first prove it can read
    `automation_policy.md`, `automation_queue.md`,
    `blockers.md`, and generate a draft window report
    starting with the new 10-line Executive Digest — all
    *without* invoking any external tool.
- Options A (no runner) and C (orchestrator with hard
  gates) remain on the table for a *later* iteration:
  - Option A is the fallback if Option B's dry-run
    surfaces enough drift risk that no runner is worth it.
  - Option C is reachable only AFTER Option B has been
    implemented, run in supervised dry-run mode for at
    least a few windows, and reviewed by Human +
    ChatGPT.
- Option D (GitHub Actions / cron) remains **explicitly
  not recommended**, per the memo's verdict on D.

### Q7 — Codex CLI scope vs. BLK-0003 OpenAI API standing block

**Decision**: Codex CLI authenticated via **ChatGPT
sign-in** does NOT trigger BLK-0003. BLK-0003 blocks the
**OpenAI API** in the API-key / SDK / HTTP / automation-
token sense, NOT Codex product usage via the
ChatGPT-account login flow.

**Allowed**:

- Codex CLI authenticated via the Bohao's **ChatGPT
  account** (interactive sign-in, no API key).

**Still blocked** by BLK-0003 (standing, by design):

- **OpenAI API key** anywhere in this project's environment
  or CI.
- **OpenAI SDK** (`openai` Python / JS package) installed
  in this project's `package.json` / `package-lock.json` /
  any `requirements*.txt`, or imported in any project
  code.
- **Responses API / HTTP API calls** to `api.openai.com`
  from any project code or script.
- **`OPENAI_API_KEY` in `.env*` or shell environment** for
  this project. (`.env.local` and any other env file under
  the web or pipeline repo MUST NOT contain `OPENAI_API_KEY`.)
- **GitHub Actions / CI calling OpenAI API** (no workflow
  may inject an OpenAI key as a secret and call the API).
- **Repo code that imports an OpenAI API client** (no
  `import openai` / `from openai import ...` /
  `require('openai')` / etc. in any committed file).
- **Background automation using API tokens** — any
  long-running process that authenticates non-interactively
  to OpenAI infrastructure to perform work.

**Practical implication**: AgentOps-2b's described runner
(Option B/C) is consistent with BLK-0003 as long as Codex
CLI is invoked interactively via Bohao's ChatGPT login.
Once any path requires non-interactive / scripted /
CI-driven OpenAI API authentication, BLK-0003 fires and
the path stops until BLK-0003 is explicitly resolved by a
separate human decision.

**BLK-0003 remains `open`.** This Q7 answer is a scope
clarification, not a resolution.

## Non-blocking follow-ups

- **After DECISION approval and push** → update daily
  summary. Either extend `2026-06-29_SUMMARY.md` with an
  AgentOps-2b section (third real loop of the day in the
  same summary file), or — if Bohao prefers a clean
  daily-boundary — open a `2026-06-30_SUMMARY.md` and
  record the AgentOps-2b push there. Either is valid; the
  cleanup commit is otherwise the same shape as the prior
  three (`1fd3c8d` / `95e8f0f` / `ce114b0`).
- **Mark `QUEUE-0007` as `done`** in
  `.agent/automation_queue.md` (bundled into the daily
  summary commit), with a completion note referencing the
  3 commit hashes (`00a98b2`, `70cc6d9`, and this
  DECISION commit once it lands), DECISION verdict, and
  the Q1 + Q7 decisions captured here.
- **Add a new queued item for AgentOps-2c** — design /
  non-executing supervised dry-run scope. Status:
  `candidate` or `blocked_pending_human` (Bohao's choice).
  Risk: `yellow` (design memo, `.agent/design_memos/`
  only). Explicit note that AgentOps-2c does NOT implement
  a runner; it scopes Option B's internals more deeply
  before any code is written.
- **Do NOT implement AgentOps-2c yet** in this DECISION's
  follow-up cleanup. Queue addition is sufficient;
  implementation waits for explicit human "start
  AgentOps-2c" in a separate TASK + DECISION loop.
- **Do NOT implement any runner yet.** No
  `.agent/scripts/` executable. No GitHub Actions. No cron.
- **Do NOT start G2.1d.** BLK-0001 still `open`; G2.1c
  eval set being live does NOT lift it.
- **Do NOT activate full automation.** BLK-0002 still
  `open`; runner must exist with its own DECISION AND
  BLK-0002 must be explicitly resolved.
- **Do NOT introduce OpenAI API.** BLK-0003 still `open`
  in the API-key / SDK / HTTP / automation-token sense
  (per Q7). Codex CLI via ChatGPT login remains the only
  permitted path to OpenAI inference for this project.

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main` of the
   pipeline repo (do not switch to any branch).
2. Do NOT push either repo. The web repo will be ahead of
   origin/main by 3 commits at that point (AgentOps-2b
   memo `00a98b2` + RUN_REPORT `70cc6d9` + this DECISION);
   push requires Bohao's explicit "push AgentOps-2b memo"
   instruction.
3. Do NOT start AgentOps-2c (the next design memo).
   AgentOps-2c is the natural follow-up per Q1, but it is
   a separate TASK with its own scope-and-approve loop.
4. Do NOT implement a runner in any form (Option B
   prototype OR Option C orchestrator). Implementation
   requires a separate scope-and-approve loop on top of
   AgentOps-2c's design memo.
5. Do NOT start MANUAL_DRY_RUN-2. Still possible as a
   secondary safe task, but waits for explicit human
   choice (and waits for AgentOps-2b memo push first so
   any MANUAL_DRY_RUN-2 references the on-origin memo).
6. Do NOT start G2.1d. BLK-0001 still `open`.
7. Do NOT activate any real Automation Window
   (SLEEP_WINDOW, WORKDAY_WINDOW, WEEKEND_WINDOW). All
   three remain conceptual until both the runner exists
   and BLK-0002 is explicitly resolved.
8. Do NOT introduce OpenAI API (BLK-0003 in the API-key /
   SDK / HTTP / automation-token sense per Q7). Codex CLI
   via ChatGPT login remains the only permitted path.
9. Do NOT lift any of the 3 open blockers
   (BLK-0001 / BLK-0002 / BLK-0003) without explicit
   written human resolution.
10. Do NOT retroactively edit the existing
    `.agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md`.

The next likely promote step is:
- `git push origin main` from the web repo (3 commits
  land on origin/main: `00a98b2` + `70cc6d9` + this
  DECISION).
- Then update daily summary (either extend
  `2026-06-29_SUMMARY.md` or open
  `2026-06-30_SUMMARY.md`) recording the AgentOps-2b
  promotion, mark `QUEUE-0007` as `done`, add an
  AgentOps-2c candidate queue item, commit + push.
- Then deciding (separate turn, with explicit human
  approval) whether to:
  (a) Open the **AgentOps-2c design memo** TASK (yellow,
      `.agent/design_memos/` only — NOT implementation).
  (b) Take a break from automation and pick product work
      (P1.7b / P1.7c).
  (c) Run **MANUAL_DRY_RUN-2** against today's two
      AgentOps loops to validate the Executive Digest
      shape.

Wait for Bohao's explicit "push AgentOps-2b memo" before
doing anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which would deliver 3 commits — `00a98b2` (TASK + memo
  + queue), `70cc6d9` (RUN_REPORT), and this DECISION
  commit once it lands).
- Authoring the daily summary cleanup commit (extend
  `2026-06-29_SUMMARY.md` or create
  `2026-06-30_SUMMARY.md`).
- Marking `QUEUE-0007` as `done` (reserved for the
  post-push cleanup commit).
- Adding the AgentOps-2c candidate queue item.
- Authoring any AgentOps-2c design memo TASK.
- Implementing any runner (Option B prototype OR Option C
  orchestrator) in any form.
- Any opening of a real Automation Window.
- Any G2.1d (red) work.
- Any introduction of an OpenAI API key / SDK / HTTP call
  / `.env` entry / GitHub Actions OpenAI secret per Q7.
- Any deployment.
- Lifting any of the 3 open blockers
  (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical execution captured in
> the RUN_REPORT. Standing policy treats any `main` push
> as a human gate. Approving this DECISION:
>
> - Adopts the memo as a `reviewed_approved` design
>   document for the future automation runner.
> - Records Q1 = Option B as the next automation-infra
>   direction (NOT implementation approval).
> - Records Q7 = Codex CLI via ChatGPT sign-in does NOT
>   trigger BLK-0003; API-key/SDK/HTTP/automation-token
>   OpenAI usage remains blocked.
>
> Approving does NOT approve: (a) AgentOps-2c memo
> authoring (separate TASK), (b) Option B or C
> implementation, (c) MANUAL_DRY_RUN-2 execution, (d)
> opening any real Automation Window, (e) G2.1d, (f) any
> OpenAI API usage in the blocked sense, (g) lifting any
> of the 3 open blockers. Each of those remains its own
> explicit human decision. The next step is Bohao's
> explicit call on the push.
