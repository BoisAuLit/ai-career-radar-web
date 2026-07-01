# DECISION · AgentOps-2c supervised runner dry-run design memo

> Authored by ChatGPT (human-mediated) after reading the
> RUN_REPORT, the memo, and the live tree on `main`. Scaffolded
> by `python .agent/scripts/new_decision.py --task-id 2026-06-30_run_01`
> (**ninth full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-06-30_run_01_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-06-30_run_01_RUN_REPORT.md`

## Verdict

`approve`

## Reasoning summary

AgentOps-2c successfully creates a **design-only memo** for a
supervised runner dry-run under **Option B** (chosen in
AgentOps-2b DECISION Q1). The memo defines a non-executing,
report-producing dry-run flow that can read policy, queue,
blockers, daily summaries, and git status, then produce an
automation window report with the new Executive Digest for
Human + ChatGPT B-time review — **without** invoking Codex CLI
or Claude Code automatically, calling OpenAI API, pushing,
deploying, or modifying any file outside the allowed `.agent/`
doc surface.

The implementation stayed documentation-only and did not:

- create any runner / daemon / scheduler / cron
- modify `.agent/scripts/**` (hard rule verified — empty diff)
- change GitHub Actions or any workflow
- introduce OpenAI API in any Q7 blocked sense
- modify Codex CLI config or Claude Code config
- touch app code (`src/**`, `package*.json`, `.env*`,
  `vercel.json`, `.vercel/**`)
- touch pipeline-repo files
- push or deploy
- resolve any blocker (BLK-0001 / BLK-0002 / BLK-0003 all
  still `open`)

**Shape B is accepted as the future direction, but this
DECISION does not authorize implementation.** Any Shape B
prototype requires its own separate scope-and-approve loop
(TASK + RUN_REPORT + DECISION + human-approved push).

Independent verification against the live tree on `main`:

- **Scope** (`git diff --name-only origin/main..HEAD`) is
  exactly the 4 approved paths:
  `.agent/tasks/2026-06-30_run_01_TASK.md`,
  `.agent/design_memos/2026-06-30_AgentOps-2c_supervised_runner_dry_run_design.md`,
  `.agent/automation_queue.md`,
  `.agent/run_reports/2026-06-30_run_01_RUN_REPORT.md`.
- **`.agent/scripts/**` diff empty** — the memo's hardest
  rule held.
- **`.agent/blockers.md` diff empty** — no new blocker; no
  lift.
- **Memo structural check**: 805 lines (under 1200-line
  stop-cap, inside 500-900 sanity target). 18 H2 sections
  (17 required + 1 useful extra Acknowledgements / Sanity
  checklist). All 17 required spec sections present in the
  spec's order.
- **Memo Status / Scope / Non-goal**:
  `Status: draft_for_human_chatgpt_review` /
  `Scope: design only` / `Non-goal: no runner implementation`.
- **Memo scopes ONLY Option B** — does not re-litigate
  Options A / C / D from AgentOps-2b. Instead, presents 4
  candidate implementation *shapes for Option B* (A pure
  manual / B non-executing local planner / C Codex-authenticated
  interactive / D Claude Code only simulation) with Shape B
  recommended as safest useful first experiment (in a
  separate future TASK).
- **Memo cites and honors** Q1 (Option B) and Q7 (Codex CLI
  vs BLK-0003) from AgentOps-2b's DECISION. `grep 'Option B'`
  = 10 matches. `grep 'BLK-000[1|2|3]'` = 17 matches.
- **Memo says** full automation remains inactive, OpenAI API
  remains blocked in Q7 sense, and G2.1d remains blocked —
  all verbatim.
- **Queue state**: QUEUE-0008 transitioned
  `blocked_pending_human` → `in_review` per Human's
  explicit approval this turn (NOT `done`). QUEUE-0001 /
  QUEUE-0006 / QUEUE-0007 still `done`. QUEUE-0002 still
  `blocked_pending_human` red. QUEUE-0003 / 0004 / 0005
  unchanged.
- **Blocker state**: `blockers.md` not touched.
  **BLK-0001 / BLK-0002 / BLK-0003 all still `open`.**
- **Pipeline repo** untouched (`b019786` = `origin/main`;
  clean) at both run start and end. Zero pipeline-side
  change.
- **No runner / daemon / cron / scheduler / GitHub Actions
  edit / OpenAI SDK install / Codex / Claude config mutation
  / executable file** anywhere.

The work meets every Acceptance criterion in the TASK (all
29 boxes verifiable per RUN_REPORT). Approving on technical
execution. Push to `origin/main` remains a separate
human-approval gate per policy §3.

## Risks found

1. **The memo is still conceptual (805 lines) and does not
   prove real automation safety.** MANUAL_DRY_RUN proved
   the reporting contract; AgentOps-2b scoped the execution
   contract at a high level; AgentOps-2c narrows the
   execution contract to Option B's specific shape — but
   no runner has actually run. Severity: **medium /
   accepted**. Mitigation: this DECISION explicitly
   forbids Shape B implementation; the next real proof
   requires a separate implementation TASK + DECISION.
2. **Shape B is chosen only as a *future direction*, not
   as implementation approval.** A future reader could
   mistake "Shape B recommended" for "build Shape B now".
   Severity: **medium**. Mitigation: this DECISION's
   `next_task_prompt` and the memo's Recommendation both
   explicitly say no Shape B implementation. The narrow
   Q3-Q8 constraints (see Human decisions recorded below)
   further cap what any Shape B prototype could do.
3. **Any future Shape B prototype must be report-only and
   non-executing** unless separately approved. The Q3-Q8
   decisions below narrow the first prototype's autonomy
   to the minimum useful surface (read `.agent/` state +
   git status/log; write one automation window report
   only, under an approved TASK; no auto queue / TASK /
   Codex / Claude / commit / push). Severity: **medium /
   by decision**.
4. **No automatic Codex CLI invocation is approved yet.**
   Codex CLI via ChatGPT sign-in remains Q7-allowed as a
   *human-interactive* tool; the first Shape B prototype
   MUST NOT script it. Severity: **medium**. Mitigation:
   Q6 decision below is "no", captured explicitly.
5. **No automatic Claude Code invocation is approved yet.**
   Same reasoning — the first Shape B prototype MUST NOT
   spawn Claude Code as a subprocess. Severity: **medium**.
   Mitigation: Q7 decision below is "no", captured
   explicitly.
6. **No automatic commit / push / deploy is approved.**
   Any Shape B prototype's output stays local until Bohao
   reviews the diff and commits/pushes manually during
   B-time. Severity: **low / by design**.
7. **`.agent/scripts/**` must remain unchanged until a
   separate implementation TASK is approved.** This
   DECISION does not touch that path (empty diff verified),
   and any future Shape B implementation TASK must
   explicitly justify its `.agent/scripts/` file additions.
   Severity: **medium / by process**.
8. **Automation-infra work has taken many loops; product
   work should resume after this is promoted.** Q10
   decision below is explicit: after AgentOps-2c is
   pushed and cleaned up, pause automation-infra
   expansion; return to P1.7b (hero mock numbers) or
   P1.7c (model-string SSOT). Severity: **low / process**.
9. **G2.1d remains blocked by BLK-0001** (red-zone:
   classifier prompt rewrite + `CLASSIFIER_VERSION` bump).
   The G2.1c eval set being live does NOT lift BLK-0001.
   Codex CLI / Claude Code must NOT self-promote even
   after this DECISION. Severity: **n/a by design**.
10. **Full automation remains blocked by BLK-0002.**
    Opening any real Automation Window
    (SLEEP_WINDOW / WORKDAY_WINDOW / WEEKEND_WINDOW)
    requires (a) an actual runner to exist with its own
    DECISION AND (b) explicit human resolution of
    BLK-0002. Severity: **n/a by design**.
11. **OpenAI API remains blocked by BLK-0003 (standing).**
    Q7 clarifies scope: Codex CLI via ChatGPT sign-in is
    permitted; API-key / SDK / HTTP / automation-token
    usage remains forbidden. Severity: **n/a by design**.
12. **Pipeline automation may need a separate memo**
    before any real automation touches pipeline files.
    Pipeline `corpus/` is BLK-0001-adjacent territory
    (classifier prompt, schema, etc.); any Shape B
    prototype work touching pipeline needs its own
    scoping. Severity: **medium / accepted**. Mitigation:
    the Q3-Q8 constraints below explicitly forbid the
    first prototype from touching pipeline repo.

## Red-zone flags

`none` for the AgentOps-2c design memo.

No `src/**`, `src/lib/prompts.ts`, `src/lib/anthropic.ts`,
`src/data/web_bundle.json`, `package.json`,
`package-lock.json`, `.env*`, `vercel.json`, `.vercel/**`,
`.github/workflows/**`, `.agent/policies/**`,
`.agent/templates/**`, `.agent/scripts/**`,
`.agent/blockers.md`, `.agent/automation_runs/**`,
`.agent/daily_summaries/**`, `.agent/README.md`, or
`.agent/decisions/**` (other than this DECISION file once
committed) changed. No pipeline-repo file changed. No
Codex CLI config, Claude Code config, or OpenAI SDK
introduced. No executable runner / shell script / config /
cron / hook file created anywhere.

## Required fixes

`none`

Scope is clean (4 paths, all approved), memo structure
check passes (18 H2 sections covering all 17 required + 1
useful extra), all 29 TASK acceptance criteria are
demonstrably met per RUN_REPORT, `.agent/scripts/**`
untouched (hard rule), and no forbidden / red-zone /
pipeline / runner / OpenAI / config / executable path was
touched.

## Human + ChatGPT decisions recorded

This DECISION records three load-bearing Human + ChatGPT
answers to the memo's "Decision questions for Human +
ChatGPT" section. All three are now formal: any future
TASK that contradicts them must reference and explicitly
re-litigate the relevant Q.

### Q1 — Future direction = **Shape B (Non-executing local planner dry-run)**

**Choice**: Shape B — "Non-executing local planner
dry-run" (small Python stdlib script under
`.agent/scripts/`, ~200-400 lines, reads state, produces
one automation window report per invocation).

**Interpretation**:

- **This is the preferred future implementation shape**
  if automation-infra work continues after AgentOps-2c
  is promoted.
- **This DECISION does NOT approve implementation.**
- Shape B implementation must require a separate future
  TASK, RUN_REPORT, DECISION, and human approval.
- Shape B must initially be **report-only and
  non-executing** — see Q3-Q8 below for the narrow
  autonomy envelope of any first prototype.
- Shape A (pure manual) remains a valid fallback if
  Shape B is later judged too risky.
- Shape C (Codex-authenticated interactive) and Shape D
  (Claude Code only simulation) are NOT chosen. Shape D
  overlaps enough with MANUAL_DRY_RUN-2 that if Bohao +
  ChatGPT want a Claude-authored digest exercise, they
  can do it as a separate green MANUAL_DRY_RUN-2 task
  (independent of Shape B).

### Q3-Q8 — First Shape B prototype allowed autonomy = **extremely narrow**

For the first possible Shape B prototype (if / when it
is later approved in a separate TASK), the allowed
autonomy is **extremely narrow**:

**Allowed**:

- **Q-Read**: Read `.agent/policies/**`,
  `.agent/automation_queue.md`, `.agent/blockers.md`,
  latest `.agent/daily_summaries/**`, latest TASK /
  RUN_REPORT / DECISION metadata (recent 3-5 triples).
- **Q-Read**: Read `git status` / `git log` summaries
  (short form, no full file content).
- **Q3-Write**: Write **only one** automation window
  report under `.agent/automation_runs/YYYY-MM-DD_<WINDOW>_REPORT.md`,
  **and only when executing under an explicit approved
  TASK**. No stray writes.

**Not allowed** (each captured verbatim so a future TASK
cannot claim ambiguity):

- **Q3-not**: Not allowed to write anywhere outside
  `.agent/automation_runs/` (and optionally its own
  RUN_REPORT under `.agent/run_reports/` when the
  prototype is itself running as an AgentOps TASK).
- **Q-scripts**: **Not allowed to modify `.agent/scripts/**`
  yet.** The first Shape B prototype adds a NEW helper
  file (e.g. `.agent/scripts/dry_run.py`) if approved,
  but that is a separate future implementation TASK's
  concern — not this DECISION's authorization.
- **Q4-queue**: **Not allowed to modify queue status
  automatically.** Any queue transition remains
  Human-during-B-time. The prototype may *propose* a
  transition in its window report.
- **Q5-TASK**: **Not allowed to create TASK drafts
  automatically.** The prototype describes what a TASK
  would look like in its window report; Bohao scaffolds
  the real TASK via `new_task.py` if he chooses to.
- **Q6-Codex**: **Not allowed to call Codex CLI
  automatically.** Codex CLI via ChatGPT sign-in
  remains a human-interactive tool per Q7 (from
  AgentOps-2b DECISION); the prototype does not script
  it — not even in "just for planning" mode.
- **Q7-Claude**: **Not allowed to invoke Claude Code
  automatically.** No subprocess spawn, no programmatic
  API. If Bohao wants Claude Code to act on the
  prototype's proposal, Bohao invokes Claude Code
  manually.
- **Q8-commit**: **Not allowed to commit automatically.**
  Even the window report itself is a candidate diff for
  Bohao's review — the prototype writes it locally;
  Bohao commits during B-time.
- **Q-push-deploy**: **Not allowed to push or deploy.**
- **Q-product**: **Not allowed to touch product code**
  (`src/**`, `src/lib/prompts.ts`, `src/lib/anthropic.ts`,
  `src/data/web_bundle.json`, `package.json`,
  `package-lock.json`, `.env*`, `vercel.json`,
  `.vercel/**`, `.github/workflows/**`).
- **Q-pipeline**: **Not allowed to touch pipeline repo.**
  Any pipeline access is read-only sanity only (matches
  every AgentOps-2* loop's pattern).
- **Q-OpenAI**: **Not allowed to call OpenAI API** in
  any Q7 blocked sense (no key, no SDK, no HTTP, no
  import, no CI secret, no background token).
- **Q-config**: **Not allowed to modify** any
  Codex CLI / Claude Code / Vercel config, or any
  `.github/workflows/**` / cron / systemd / launchd /
  hook file.

The above envelope is binding on the first Shape B
prototype's TASK. Any future TASK proposing to widen
this envelope must explicitly reference Q3-Q8 and
require a fresh Human + ChatGPT DECISION.

### Q10 — Next direction after AgentOps-2c promotion = **return to product work**

**Choice**: After AgentOps-2c is approved and promoted
(pushed + daily summary + QUEUE-0008 marked `done`), the
recommended next direction is to **pause automation-infra
expansion and return to product work**, specifically:

- **P1.7b · sync hero mock numbers with `web_bundle.json`**
  — yellow, small web UI-only change; reads
  `src/data/web_bundle.json` at build/render time.
- **P1.7c · model-string single source of truth** —
  yellow, `MODELS_DISPLAY` const in a non-prompt module
  so the homepage caption stays in sync with
  `src/lib/anthropic.ts` model strings (without touching
  the selection logic).

**Reasoning**:

- The automation foundation has gone through **5 full
  loops in 3 days** (MANUAL_DRY_RUN + Executive Digest +
  AgentOps-2a policy update + AgentOps-2b memo +
  AgentOps-2c memo). Policy, report template,
  Executive Digest, MANUAL_DRY_RUN precedent, runner
  concept memo, and supervised dry-run design memo all
  exist and are pushed.
- Before implementing any runner (even the narrow
  Shape B prototype), the project should **regain
  product momentum**. The user-facing surface hasn't
  changed since P1.7 (`2026-06-27_run_01`).
- Product loops are shorter and lower-risk than
  automation-infra loops right now (green/yellow
  bounded UI diffs vs new-code-surface + policy
  implications).
- If Bohao + ChatGPT later decide to resume automation
  work, Shape B implementation is a clean next task
  when they do — no urgency, no drift risk from
  waiting.

**Not chosen** in Q10:

- **Shape B implementation immediately.** Explicitly
  deferred. Q10 says product first; Shape B is a
  future task, not the next task.
- **MANUAL_DRY_RUN-2 immediately.** Optional; can
  happen alongside product work if Bohao wants to
  exercise the Executive Digest, but not the default
  next task.
- **AgentOps-2d or any further scoping memo.** No
  need — the automation-infra design is documented
  enough for now. Any further scoping is on hold
  until Shape B has actually been prototyped and
  reviewed.

## Non-blocking follow-ups

- **After DECISION approval and push** → update daily
  summary. Either extend
  `.agent/daily_summaries/2026-06-30_SUMMARY.md` with
  an AgentOps-2c section (second real loop of that
  day's file), or open a fresh `2026-07-01_SUMMARY.md`
  if the day-boundary crosses again. Either is valid.
- **Mark `QUEUE-0008` as `done`** in
  `.agent/automation_queue.md` (bundled into the
  daily summary commit), with a completion note
  referencing the 3 commit hashes (`e24042f`,
  `45345ce`, and this DECISION commit once it
  lands), DECISION verdict, and the Q1 + Q3-Q8 + Q10
  decisions captured here.
- **Do NOT add any runner implementation queue item
  yet.** No QUEUE-0009 for "Shape B implementation".
  When (if) Bohao + ChatGPT decide to proceed with
  Shape B, they can add the queue item as
  `blocked_pending_human` at that time — same pattern
  as QUEUE-0008 was added when AgentOps-2b closed.
- **Prefer returning to product work next**: P1.7b
  (hero mock numbers) or P1.7c (model-string SSOT).
  Per Q10 above.
- **If automation work continues later**, create a
  separate Shape B prototype TASK that is
  **report-only and non-executing** per the Q3-Q8
  envelope above. The TASK must explicitly cite Q1 +
  Q3-Q8 + Q10 from this DECISION.
- **Do NOT start G2.1d.** BLK-0001 still `open`;
  G2.1c eval set being live does NOT lift it.
- **Do NOT activate full automation.** BLK-0002 still
  `open`; runner must exist with its own DECISION AND
  BLK-0002 must be explicitly resolved.
- **Do NOT introduce OpenAI API.** BLK-0003 still
  `open` in the Q7 blocked sense (API-key / SDK /
  HTTP / automation-token / CI-secret / import /
  background-token). Codex CLI via ChatGPT login
  remains the only permitted path to OpenAI
  inference for this project.
- **Do NOT modify `.agent/scripts/**` until a
  separate implementation task is approved.** The
  helper triple (`new_task.py` /
  `new_run_report.py` / `new_decision.py`) stays
  frozen for now.

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main` of
   the pipeline repo (do not switch to any branch).
2. Do NOT push either repo. The web repo will be
   ahead of origin/main by 3 commits at that point
   (AgentOps-2c memo `e24042f` + RUN_REPORT
   `45345ce` + this DECISION); push requires Bohao's
   explicit "push AgentOps-2c memo" instruction.
3. Do NOT implement Shape B. Any Shape B prototype
   requires a separate future TASK + DECISION with
   the Q3-Q8 narrow autonomy envelope enforced.
4. Do NOT create runner code / executable file /
   shell script / cron / systemd / launchd / GH
   Actions workflow.
5. Do NOT modify `.agent/scripts/**` — the helper
   triple stays frozen.
6. Do NOT start AgentOps-2d (or any further scoping
   memo). Automation-infra is on pause per Q10.
7. Do NOT start MANUAL_DRY_RUN-2. Still available
   as an optional safe task, but waits for explicit
   human choice; not the default next.
8. Do NOT start G2.1d. BLK-0001 still `open`.
9. Do NOT activate any real Automation Window
   (SLEEP_WINDOW, WORKDAY_WINDOW, WEEKEND_WINDOW).
   BLK-0002 still `open`.
10. Do NOT introduce OpenAI API in any Q7 blocked
    sense. Codex CLI via ChatGPT sign-in remains the
    only permitted OpenAI-inference path.
11. Do NOT lift any of the 3 open blockers
    (BLK-0001 / BLK-0002 / BLK-0003) without
    explicit written human resolution.
12. Do NOT retroactively edit the existing
    `.agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md`.

The next likely promote step is:
- `git push origin main` from the web repo (3
  commits land on origin/main: `e24042f` +
  `45345ce` + this DECISION).
- Then update daily summary
  (`2026-06-30_SUMMARY.md` extension is preferred
  since AgentOps-2c was authored on 2026-06-30;
  or a fresh `2026-07-01_SUMMARY.md` if the
  boundary crosses) recording the AgentOps-2c
  promotion, mark `QUEUE-0008` as `done`, commit
  + push.
- Then, per Q10, **return to product work**:
  (a) **P1.7b · hero mock numbers** (yellow, small
      web UI-only). Default recommended next task.
  (b) **P1.7c · model-string SSOT** (yellow, small
      web module addition). Alternative.
  (c) **MANUAL_DRY_RUN-2** as an optional
      automation-adjacent side task (green,
      `.agent/automation_runs/` only). Not the
      default next.

Wait for Bohao's explicit "push AgentOps-2c memo"
before doing anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which would deliver 3 commits — `e24042f` (TASK +
  memo + queue transition), `45345ce` (RUN_REPORT),
  and this DECISION commit once it lands).
- Authoring the daily summary cleanup commit
  (extend `2026-06-30_SUMMARY.md` or open
  `2026-07-01_SUMMARY.md`).
- Marking `QUEUE-0008` as `done` (reserved for the
  post-push cleanup commit).
- Any Shape B implementation TASK.
- Any modification to `.agent/scripts/**`.
- Any MANUAL_DRY_RUN-2 execution.
- Any real Automation Window opening.
- Any G2.1d (red) work.
- Any introduction of an OpenAI API key / SDK /
  HTTP call / `.env` entry / GitHub Actions OpenAI
  secret per Q7.
- Any deployment.
- Lifting any of the 3 open blockers
  (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical execution
> captured in the RUN_REPORT. Standing policy treats
> any `main` push as a human gate. Approving this
> DECISION:
>
> - Adopts the memo as a `reviewed_approved` design
>   document for the future supervised dry-run.
> - Records Q1 = **Shape B as future direction** (NOT
>   implementation approval).
> - Records Q3-Q8 = **first Shape B prototype must
>   have extremely narrow autonomy** (read `.agent/`
>   state + git status/log; write one report only
>   under approved TASK; no auto queue / TASK /
>   Codex / Claude / commit / push / product touch;
>   no `.agent/scripts/**` edit at all in this
>   DECISION's authorization).
> - Records Q10 = **after promotion, return to
>   product work (P1.7b / P1.7c)** and pause
>   automation-infra expansion.
>
> Approving does NOT approve: (a) any Shape B or
> other runner implementation, (b) any modification
> to `.agent/scripts/**`, (c) MANUAL_DRY_RUN-2
> execution, (d) opening any real Automation
> Window, (e) G2.1d, (f) any OpenAI API usage in
> the Q7 blocked sense, (g) lifting any of the 3
> open blockers, (h) any AgentOps-2d or further
> scoping memo. Each of those remains its own
> explicit human decision. The next step is
> Bohao's explicit call on the push.
