# DECISION · AgentOps-2a · Codex + Claude Code automation policy

> Authored by ChatGPT (human-mediated) after reading the RUN_REPORT
> and spot-checking the 5 policy files on disk. Scaffolded by
> `python .agent/scripts/new_decision.py --task-id 2026-06-28_run_04`
> (fifth full loop using the helper triple).

## Metadata

- **decision_id**: `2026-06-28_run_04_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-06-28_run_04_RUN_REPORT.md`

## Verdict

`approve`

## Reasoning summary

AgentOps-2a successfully adds the policy / documentation layer needed
before transferring Automation Time planning / review duties to Codex
CLI and coding execution duties to Claude Code. The implementation
stayed within the approved web `.agent/` scope, created the automation
policy, automation report template, queue, blockers, and a small
README link section, and did **not** implement any runner, daemon,
scheduler, cron, OpenAI API usage, GitHub Actions change, app code
change, or pipeline change. This is the correct next layer on top of
the existing AgentOps TASK / RUN_REPORT / DECISION protocol.

Independent verification against the live tree on `main`:

- **Scope** (`git diff --name-only 141ebdf..HEAD`) is exactly the 6
  approved paths: `.agent/policies/automation_policy.md`,
  `.agent/templates/automation_window_report_template.md`,
  `.agent/automation_queue.md`, `.agent/blockers.md`,
  `.agent/README.md`, `.agent/run_reports/2026-06-28_run_04_RUN_REPORT.md`.
  No extra files, no forbidden files.
- **Policy content checks pass**: A/B time model present (15 mentions
  of WORKDAY_WINDOW / SLEEP_WINDOW / WEEKEND_WINDOW /
  Non-Automation Time); all 7 roles defined (Human Owner, ChatGPT
  Chat, Codex CLI, Claude Code, GitHub / origin, GitHub Actions,
  OpenAI API); Codex rule explicitly requires GPT-5.5 + reasoning
  effort `high` and explicitly forbids `extra-high`; OpenAI API
  deferred and prohibited; full Red-zone list present
  (classifier.py · extraction.py · schema · src/lib/prompts.ts ·
  sources.yaml · GitHub Actions · generated corpus · production
  bundle · deployment config · auth/payment/database · OpenAI API
  introduction · autonomous daemon).
- **Window report template** is copy-paste-friendly for the daily
  human + ChatGPT review (Metadata + Executive summary + Goals +
  Tasks attempted/completed + Suggested ChatGPT review questions +
  Safety audit + Final status sections all present).
- **Queue seed** has 6 reasonable candidate items
  (`QUEUE-0001`…`0006`) with the right statuses, including QUEUE-0002
  G2.1d marked `blocked_pending_human` (red).
- **Blockers seed** has the 3 expected initial open blockers:
  BLK-0001 G2.1d red-zone approval, BLK-0002 full automation
  activation, BLK-0003 standing OpenAI API block.
- **Pipeline repo** is untouched (`b019786` = `origin/main`; clean).
- **No runner / daemon / cron / scheduler / GitHub Actions edit /
  OpenAI SDK install** introduced anywhere.

The work meets every Acceptance criterion in the TASK. Approving on
technical execution. Push to `origin/main` remains a separate
human-approval gate per policy §3.

## Risks found

1. **Policy is a contract; not yet stress-tested by a real run.** It
   feels right at the desk but no Automation Window has obeyed it yet.
   Severity: **medium**. Mitigation: QUEUE-0006 (MANUAL_DRY_RUN report)
   exists specifically to stress-test the contract end-to-end before
   any runner is built.
2. **Full automation activation remains blocked** (BLK-0002) until at
   least one MANUAL_DRY_RUN report has been produced and reviewed,
   and AgentOps-2b runner has its own scope-and-approve loop. Do not
   open any real Automation Window before then.
3. **G2.1d remains red-zone** (BLK-0001 + QUEUE-0002 marked
   `blocked_pending_human`). Classifier prompt + `CLASSIFIER_VERSION`
   bump are explicitly red per policy §6; Codex CLI must NOT
   self-promote this item even though the eval set (G2.1c) is now in
   place.
4. **`automation_queue.md` seeds future tasks; Codex must not treat
   red tasks as automatically approved.** The policy is clear, but a
   future runner could misread an item with `risk: red` and
   `status: candidate` as actionable. Mitigation: the rule is
   reiterated in §4 ("Never approve red-zone work") and in §6 (Red →
   STOP). Reinforce in AgentOps-2b's design memo when scoping the
   runner.
5. **OpenAI API remains explicitly blocked** (BLK-0003 is a standing
   block). Severity: **n/a** by design. Any future task that
   proposes OpenAI API usage must reference and request resolution of
   this blocker; otherwise it stops.
6. **`QUEUE-0001` still says AgentOps-2a is `in_progress`.** After
   this DECISION is committed (and especially after push), the
   correct steady state is `done`. This is a small queue-maintenance
   item, not a blocker for approving the policy. Note for the
   follow-up step.

## Red-zone flags

`none` for AgentOps-2a implementation.

No `src/**`, `src/lib/prompts.ts`, `src/data/web_bundle.json`,
`package.json`, `package-lock.json`, `.env*`, `vercel.json`,
`.vercel/**`, or `.github/workflows/**` changed in the web repo. No
pipeline-repo file changed at all. No Codex CLI config, Claude Code
config, or OpenAI SDK introduced.

## Required fixes

`none`

Scope is clean, content checks pass, no red-zone touched.

## Non-blocking follow-ups

- **After DECISION + approved push** → update daily summary
  (`2026-06-28_SUMMARY.md`) with an AgentOps-2a section, then commit
  + push.
- **Mark `QUEUE-0001` as `done`** in `.agent/automation_queue.md` in a
  small maintenance commit (could be bundled into the daily summary
  update commit, or its own one-liner). Record the final TASK /
  RUN_REPORT / DECISION IDs under the queue item per the queue's
  schema.
- **Next safe task = `QUEUE-0006` MANUAL_DRY_RUN report**, not full
  automation activation. The MANUAL_DRY_RUN report is hand-filled
  against `templates/automation_window_report_template.md` using a
  recent real day's work, with no actual automation needed.
- **Do NOT start AgentOps-2b runner** until MANUAL_DRY_RUN is reviewed
  and the contract proves to work end-to-end.
- **Do NOT start G2.1d** until BLK-0001 is explicitly resolved by a
  human + ChatGPT decision.

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main` of the pipeline
   repo (do not switch to any branch).
2. Do NOT push either repo. The web repo is ahead of origin/main by
   3 commits at that point (AgentOps-2a impl + RUN_REPORT + this
   DECISION); push requires Bohao's explicit "push AgentOps-2a"
   instruction.
3. Do NOT start MANUAL_DRY_RUN (QUEUE-0006). That is the next
   logical task but waits for the policy push to land first, so the
   dry-run reads the policy from `origin/main`.
4. Do NOT start AgentOps-2b runner scoping. Out of order: the
   MANUAL_DRY_RUN must validate the contract first.
5. Do NOT activate any real Automation Window (SLEEP_WINDOW,
   WORKDAY_WINDOW, WEEKEND_WINDOW). All three remain conceptual
   until the runner exists, and BLK-0002 explicitly blocks
   activation until QUEUE-0006 is done.
6. Do NOT open or work on any red-zone task (G2.1d, sources.yaml,
   prompts, schema, classifier, extractor, GitHub Actions, deploy).

The next likely promote step is:
- `git push origin main` from the web repo (3 commits land on
  origin/main: impl + RUN_REPORT + DECISION).
- Then update daily summary for AgentOps-2a, optionally marking
  QUEUE-0001 done in the same commit.
- Then queue up MANUAL_DRY_RUN as the next safe task.

Wait for Bohao's explicit "push AgentOps-2a" before doing anything
state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which would deliver 3 commits — `798bf69` impl, `de662a3` RUN_REPORT,
  and this DECISION commit once it lands).
- Any MANUAL_DRY_RUN report execution.
- Any AgentOps-2b runner scoping or implementation.
- Any opening of a real Automation Window.
- Any G2.1d (red) work.
- Any deployment.
- Lifting any of the 3 open blockers (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical execution captured in the
> RUN_REPORT. Standing policy treats any `main` push as a human gate,
> and the AgentOps-2a policy itself escalates several downstream
> actions (MANUAL_DRY_RUN, runner scoping, real automation activation,
> red-zone work, OpenAI API usage) to "human-only". The next step is
> Bohao's explicit call.
