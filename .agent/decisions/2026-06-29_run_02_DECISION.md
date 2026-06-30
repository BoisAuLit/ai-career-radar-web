# DECISION · Add Executive Digest to automation report template

> Authored by ChatGPT (human-mediated) after reading the RUN_REPORT
> and spot-checking the template + policy edits + commit `5560dae`
> diff against the live tree on `main`. Scaffolded by
> `python .agent/scripts/new_decision.py --task-id 2026-06-29_run_02`
> (seventh full loop using the helper triple).

## Metadata

- **decision_id**: `2026-06-29_run_02_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-06-29_run_02_RUN_REPORT.md`

## Verdict

`approve`

## Reasoning summary

The Executive Digest follow-up successfully improves the automation
window report template for fast Human + ChatGPT Non-Automation Time
review. The implementation adds a concise top-level Executive
Digest section before the longer Executive summary, defines the 10
required digest fields (window verdict, main outcome, tasks
completed, commits created, repos touched, validation, red-zone /
forbidden audit, open blockers, human decisions needed, safest next
action), and adds a small policy §7 note making the digest a
required top section for future reports.

The task stayed within approved `.agent/` documentation/template
scope and did not create any runner, daemon, scheduler, cron,
OpenAI API integration, GitHub Actions change, Codex CLI / Claude
Code config change, app code change, or pipeline change.

Independent verification against the live tree on `main`:

- **Scope** (`git diff --name-only origin/main..HEAD`) is exactly
  the 4 approved paths:
  `.agent/tasks/2026-06-29_run_02_TASK.md`,
  `.agent/templates/automation_window_report_template.md`,
  `.agent/policies/automation_policy.md`,
  `.agent/run_reports/2026-06-29_run_02_RUN_REPORT.md`. No extra
  files, no forbidden files.
- **Template structural check**: `grep -c '^## '` = **20** (was
  19); `## Executive Digest` appears at line 26, immediately
  after `## Metadata` (line 14) and immediately before
  `## Executive summary` (line 45). All 19 prior H2 sections
  remain in their original order. Executive summary content is
  preserved verbatim.
- **Digest contents**: 10 numbered fields all present in order
  (Window verdict / Main outcome / Tasks completed / Commits
  created / Repos touched / Validation / Red-zone / forbidden
  audit / Open blockers / Human decisions needed / Safest next
  action). The `>`-quoted policy note explicitly states the
  section is sized for fast Human + ChatGPT Chat Non-Automation
  Time review in under 30 seconds.
- **Policy edit**: `grep -n 'Executive [Dd]igest'` on
  `automation_policy.md` returns exactly 1 match, at line 231,
  inside §7 (which spans lines 207-252). §1–§6 and §8–§13
  unchanged. The §7 addition is a single bullet in the "Report
  requirements" list with a date-stamp and TASK pointer.
- **Version bump**: header Version line moved from `1 (initial)`
  to `1.1 (2026-06-29: §7 extended to require Executive Digest as
  a top section; TASK 2026-06-29_run_02)`. This is the documented
  behavior in §13 ("When this file changes, bump the Version line
  at the top").
- **MANUAL_DRY_RUN report at
  `.agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md`
  not retroactively edited** — by design per the TASK; the new
  digest applies to future reports only. Verified by absence of
  this path from `git diff --name-only origin/main..HEAD`.
- **Queue + blockers untouched**: `.agent/automation_queue.md`
  and `.agent/blockers.md` not in scope. QUEUE-0001 still `done`,
  QUEUE-0002 G2.1d still `blocked_pending_human` red, QUEUE-0006
  still `done`. BLK-0001 / BLK-0002 / BLK-0003 all still `open`.
- **Pipeline repo** untouched (`b019786` = `origin/main`; clean)
  at both run start and end. Zero pipeline-side change.
- **No runner / daemon / cron / scheduler / GitHub Actions edit /
  OpenAI SDK install / Codex / Claude config mutation** anywhere.

The work meets every Acceptance criterion in the TASK (all 13
boxes verifiable). Approving on technical execution. Push to
`origin/main` remains a separate human-approval gate per policy
§3.

## Risks found

1. **The Executive Digest format is now defined but has not yet
   been tested in a second MANUAL_DRY_RUN report.** It looks right
   on paper but no automation report has actually been authored
   *under* the new template. Severity: **low**. Mitigation:
   non-blocking follow-up #2 below proposes an optional
   MANUAL_DRY_RUN-2 to stress-test the digest end-to-end. If a
   future digest authoring finds the 10-field shape awkward, a
   small follow-up yellow `.agent/templates/` TASK can amend the
   field list using the same change-control mechanism (TASK →
   impl → RUN_REPORT → DECISION → push).
2. **`automation_policy.md` was updated to version `1.1`.**
   Acceptable and consistent with §13 ("When this file changes,
   bump the Version line at the top"), but the version field is
   now non-integer; any future tooling that parses the Version
   line should handle that. Severity: **low**. Mitigation: keep
   future policy edits small and version bumps incremental
   (`1.2`, `1.3`, …); reserve `2.x` for substantive contract
   changes.
3. **Future reports must keep the digest *truly short*.** The
   template specifies ≤10 lines, but in practice a window report's
   author can spill sub-bullets and bloat the digest into another
   long summary. Severity: **low / process**. Mitigation: the
   `>`-quoted policy note in the template explicitly says
   "Anything that doesn't fit a single line belongs in the
   matching section below — not here." Future DECISION reviewers
   should reject any digest that exceeds 12 lines of content.
4. **This change does not activate automation and must not be
   treated as approval for AgentOps-2b.** Approving the
   Executive Digest template improvement is necessary work toward
   making future reports readable, but it does NOT grant scoping
   or implementation permission for the AgentOps-2b runner.
   AgentOps-2b remains its own design memo + TASK + DECISION
   downstream. Severity: **medium / by design**. Mitigation:
   explicit in the next_task_prompt below.
5. **G2.1d remains `blocked_pending_human`** (QUEUE-0002 + BLK-0001
   red). The G2.1c eval set being live does NOT lift BLK-0001;
   classifier prompt + `CLASSIFIER_VERSION` bump are explicitly
   red per policy §6. Codex CLI / Claude Code must NOT
   self-promote even after this DECISION. Severity: **n/a by
   design**.
6. **OpenAI API remains blocked by BLK-0003 (standing block).**
   Any future task proposing OpenAI API usage must reference and
   request resolution of this blocker; otherwise it stops.
   Severity: **n/a by design**.
7. **Full automation activation remains blocked by BLK-0002.**
   Even with the digest template now in place, opening any real
   `SLEEP_WINDOW` / `WORKDAY_WINDOW` / `WEEKEND_WINDOW` requires
   (a) the AgentOps-2b runner to exist, with its own DECISION,
   AND (b) explicit human resolution of BLK-0002. Severity:
   **n/a by design**.

## Red-zone flags

`none` for the Executive Digest template update.

No `src/**`, `src/lib/prompts.ts`, `src/lib/anthropic.ts`,
`src/data/web_bundle.json`, `package.json`, `package-lock.json`,
`.env*`, `vercel.json`, `.vercel/**`, `.github/workflows/**`, or
`.agent/policies/agent_policy.md` changed. No pipeline-repo file
changed at all. No Codex CLI config, Claude Code config, or
OpenAI SDK introduced. The `automation_policy.md` edit is itself
classified yellow per policy §6 (any `.agent/policies/**` edit is
at least yellow), which is why the TASK is yellow rather than
green — but yellow is not red, and the edit was confined to §7
plus the §13-required Version bump.

## Required fixes

`none`

Scope is clean (4 paths, all approved), template structural check
passes (20 H2 sections, new Executive Digest at the correct
position, all 19 prior sections intact), policy §7 addition is the
expected single bullet, Version bump follows §13, all 13 TASK
acceptance criteria are demonstrably met, and no forbidden /
red-zone / pipeline / runner / OpenAI path was touched.

## Non-blocking follow-ups

- **After DECISION approval and push** → update daily summary
  `.agent/daily_summaries/2026-06-29_SUMMARY.md` to add a section
  recording the Executive Digest template update (this loop is
  the second real loop of 2026-06-29, after QUEUE-0006
  MANUAL_DRY_RUN), with the 3 commit hashes (`5560dae`,
  `efe16cf`, and this DECISION commit once it lands), DECISION
  verdict, and confirmation that no blocker was lifted.
- **Consider a MANUAL_DRY_RUN-2 later** to validate the new
  Executive Digest format against a real recent loop (e.g. this
  Executive Digest task itself, which is conveniently a small,
  fresh exemplar). Green, `.agent/automation_runs/` only. Not
  required before AgentOps-2b memo; useful before any real
  Automation Window.
- **AgentOps-2b should still begin only as a *design memo*, not
  a runner.** Web `.agent/design_memos/` only; memo must
  enumerate stop conditions, allowed-files surface, refusal
  behavior for red items, queue authorization rules, and explicit
  non-goals. Memo is yellow; implementation is at least yellow
  and possibly red depending on what it touches — and is its own
  separate TASK + DECISION.
- **Do NOT start G2.1d** until BLK-0001 is explicitly resolved by
  a human + ChatGPT decision. The G2.1c eval set being live does
  NOT lift BLK-0001.
- **Do NOT introduce OpenAI API** unless BLK-0003 is explicitly
  resolved by the human in writing. Any task proposing OpenAI API
  usage must reference BLK-0003 and request resolution first.
- **Do NOT retroactively edit** the existing MANUAL_DRY_RUN report
  at `.agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md`
  even if MANUAL_DRY_RUN-2 ships. That report stands as a
  historical record of the pre-digest template's first real
  exercise.

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on `main` of the pipeline
   repo (do not switch to any branch).
2. Do NOT push either repo. The web repo will be ahead of
   origin/main by 3 commits at that point (Executive Digest impl
   `5560dae` + RUN_REPORT `efe16cf` + this DECISION); push
   requires Bohao's explicit "push Executive Digest" instruction.
3. Do NOT start MANUAL_DRY_RUN-2. That is an optional safe next
   task but waits for the digest template to land on origin first,
   so MANUAL_DRY_RUN-2 reads the new template from `origin/main`.
4. Do NOT start AgentOps-2b runner scoping (memo OR
   implementation). The design memo is a separate yellow TASK
   with its own scope-and-approve loop; not automatic from
   approving this template update.
5. Do NOT start AgentOps-2b runner implementation under any
   condition without a separate, explicit design memo + DECISION
   first.
6. Do NOT activate any real Automation Window (SLEEP_WINDOW,
   WORKDAY_WINDOW, WEEKEND_WINDOW). All three remain conceptual
   until both the runner exists and BLK-0002 is explicitly
   resolved.
7. Do NOT open or work on any red-zone task (G2.1d, sources.yaml,
   prompts, schema, classifier, extractor, GitHub Actions,
   deploy).
8. Do NOT lift any of the 3 open blockers (BLK-0001 / BLK-0002 /
   BLK-0003) without explicit, written human resolution.
9. Do NOT retroactively edit the existing
   `.agent/automation_runs/2026-06-29_MANUAL_DRY_RUN_REPORT.md`.

The next likely promote step is:
- `git push origin main` from the web repo (3 commits land on
  origin/main: `5560dae` + `efe16cf` + this DECISION).
- Then update daily summary
  `.agent/daily_summaries/2026-06-29_SUMMARY.md` for the Executive
  Digest update; commit + push.
- Then deciding (separate turn, with explicit human approval)
  whether to:
  (a) Open a tiny green `.agent/automation_runs/` TASK for
      MANUAL_DRY_RUN-2 against the Executive Digest task itself
      (would be the first real digest-shaped report).
  (b) Open an AgentOps-2b **design memo** (yellow, web
      `.agent/design_memos/` only — NOT implementation).
  (c) Pick a different next task entirely (QUEUE-0003 / QUEUE-0004
      / etc.).

Wait for Bohao's explicit "push Executive Digest" before doing
anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which would deliver 3 commits — `5560dae` impl (TASK + template
  + policy), `efe16cf` RUN_REPORT, and this DECISION commit once
  it lands).
- Authoring `.agent/daily_summaries/2026-06-29_SUMMARY.md`
  cleanup edit (separate post-push commit, same pattern as the
  MANUAL_DRY_RUN cleanup `95e8f0f` and AgentOps-2a cleanup
  `1fd3c8d`).
- Any MANUAL_DRY_RUN-2 execution.
- Any AgentOps-2b runner design memo OR implementation.
- Any opening of a real Automation Window.
- Any G2.1d (red) work.
- Any OpenAI API usage.
- Any deployment.
- Lifting any of the 3 open blockers (BLK-0001 / BLK-0002 /
  BLK-0003).

> Verdict is `approve` for technical execution captured in the
> RUN_REPORT. Standing policy treats any `main` push as a human
> gate. Approving this DECISION makes the Executive Digest the
> new contract shape for every future automation window report,
> but does NOT approve: (a) MANUAL_DRY_RUN-2 execution, (b)
> AgentOps-2b runner scoping or build, (c) opening any real
> Automation Window, (d) G2.1d, (e) OpenAI API usage, (f) lifting
> any of the 3 open blockers. Each of those remains its own
> explicit human decision. The next step is Bohao's explicit call
> on the push.
