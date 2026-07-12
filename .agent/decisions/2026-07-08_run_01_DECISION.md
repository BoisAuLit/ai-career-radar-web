# DECISION · AgentOps-3a Automation Advancement design memo

> Authored by ChatGPT (human-mediated) after
> reading the RUN_REPORT and the full 1175-line
> memo. Scaffolded by
> `python .agent/scripts/new_decision.py
> --task-id 2026-07-08_run_01` (**twentieth full
> loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-08_run_01_DECISION`
- **based_on_run_report**:
  `.agent/run_reports/2026-07-08_run_01_RUN_REPORT.md`
- **based_on_design_memo**:
  `.agent/design_memos/2026-07-08_AgentOps-3a_automation_advancement.md`
- **based_on_prior_decisions**:
  `.agent/decisions/2026-06-29_run_03_DECISION.md`
  (AgentOps-2b · Q1 = Option B · Q7 = Codex CLI
  via ChatGPT sign-in OK) ·
  `.agent/decisions/2026-06-30_run_01_DECISION.md`
  (AgentOps-2c · Shape B · Q3-Q8 narrow · **Q10
  pause of AgentOps-2 runner implementation
  remains in force**).

## Verdict

`approve`

## Reasoning summary

AgentOps-3a successfully defines the **next-
stage automation advancement system without
implementing automation prematurely**. The
memo correctly captures the target operating
model: **Human + ChatGPT make major daily
decisions**, **Codex becomes a read-only
planner / reviewer first**, **Claude Code
remains the controlled executor**, and a
**real report regression harness becomes a
quality gate before more autonomous product
changes**. The phased rollout from **3a to
3f** is appropriately conservative: design
first, Codex read-only planning next,
benchmark fixtures, regression harness
design, local Playwright prototype, and only
later integration into templates / digests.

The memo preserves every existing safety
boundary:

- **Automation-infra remains paused** (Q10
  pause on AgentOps-2 runner implementation
  is not lifted; AgentOps-3 is a fresh
  scoping track, not a resumption of the
  paused runner track).
- **BLK-0001 / BLK-0002 / BLK-0003 remain
  `open`**.
- **OpenAI API remains blocked in Q7-blocked
  senses** (SDK / key / HTTP / import / CI
  secret / background token / automation
  token). Codex CLI via ChatGPT sign-in
  stays the sanctioned Codex channel.
- **No `.agent/scripts/**` changes** (hard
  rule per AgentOps-2c Q3-Q8).
- **No runtime source changes**
  (`src/**` empty diff).
- **No pipeline changes** (HEAD `b019786`
  start and end).
- **No collector / corpus refresh**.
- **No runner / harness / planner /
  fixture implementation**.
- **No push / deploy**.

This is the right foundation for resuming
automation-system development after
Candidate 1 (stream sentinel), Candidate 4
(empty-PDF gate), and the 2026-07-08 E2E
smoke validation. The generation stack now
has visible failure modes (Candidate 1
sentinel, Candidate 4 gate); AgentOps-3
adds the design for making automation-
generated changes equally visible before
they reach production.

Independent verification against the local
tree (both commits: `74939b6` +
`36acd82`):

- **Scope** (`git diff --name-only
  origin/main..HEAD`) = exactly the 3
  approved paths:
  `.agent/tasks/2026-07-08_run_01_TASK.md`,
  `.agent/design_memos/2026-07-08_AgentOps-3a_automation_advancement.md`,
  `.agent/run_reports/2026-07-08_run_01_RUN_REPORT.md`.
- **Memo structural check**: 1175 lines
  (well-scoped for a design memo of this
  ambition — comparable to AgentOps-2c's
  805 and P2.1a's 740). 17 H2 sections =
  16 required + `Status` header.
- **All 16 required sections present in
  order**: Goal · Current state · Target
  architecture · Automation phases · Codex
  planner responsibilities · Claude Code
  executor responsibilities · Real report
  regression harness · Quality gates ·
  Risk classification · Human daily
  interaction model · Failure handling ·
  Required artifacts · Permissions matrix ·
  Implementation roadmap · Open decisions ·
  Recommendation.
- **§3 diagram** names all 6 actors and
  shows the full daily flow with written
  artifacts at every hand-off.
- **§4 phase table** enumerates 3a → 3f
  with allowed / forbidden per phase.
- **§7 benchmark suite** names 5 resumes
  A-E covering senior backend → Applied AI,
  full-stack → AI Product, data eng → LLM
  Infra, ML-adjacent → Agent, enterprise
  SWE → AI transition. 13 first-version
  checks + 7 future checks.
- **§8 quality gates** cleanly define
  required / optional / forbidden, plus
  green / amber / red verdicts. **Red
  regression verdict blocks push.**
- **§9 risk classification** aligns with
  `.agent/policies/agent_policy.md` §2 +
  `.agent/policies/automation_policy.md`
  §6 vocabulary.
- **§13 permissions matrix** is a 6-row
  × 12-column table with the invariants
  explicitly named: only Human approves
  red-zone; only Human pushes; Codex
  never writes outside its designated
  directory; Playwright never writes
  outside `.agent/regression_runs/`.
- **§14 roadmap** proposes exactly 5
  next TASKs (3b → 3f) with title,
  risk, and "not yet started" flag.
- **§15 open decisions** lists **13
  concrete yes/no questions** (above
  the 10 required); **this DECISION
  provides initial answers to all 13
  below**.
- **§16 recommendation** picks
  **exactly one** default next TASK
  (**AgentOps-3b Codex read-only daily
  planner design + spec**) with a
  parallel green candidate
  (**AgentOps-3c benchmark fixtures**)
  and a justification in ≤ 5 lines.
- **Memo does NOT recommend** lifting
  any of the 3 open blockers /
  OpenAI API in Q7-blocked senses /
  `.agent/scripts/**` edits / G2.1d /
  a red-zone task as default.
- **Forbidden empty diffs**: `src/**` ✓,
  `src/data/**` ✓, `src/lib/prompts.ts`
  ✓, `src/app/api/**` ✓,
  `.agent/scripts/**` ✓ (**hard rule**),
  `.agent/policies/**` ✓,
  `.agent/templates/**` ✓,
  `.agent/blockers.md` ✓,
  `.agent/automation_queue.md` ✓,
  `.github/workflows/**` ✓,
  `package.json` ✓,
  `package-lock.json` ✓, `.env*` ✓,
  `vercel.json` / `.vercel/**` ✓.
- **Pipeline repo** untouched — HEAD
  `b019786` at start AND end.
- **No collector invocation**. **No
  LLM call** by this task (Explore
  subagent read files only).
- **No new npm dependency**.
- **No runner / daemon / cron /
  scheduler / GH Actions / Codex
  config / Claude config / OpenAI
  SDK / manual deploy** anywhere.
- **Queue + blockers**:
  `automation_queue.md` and
  `blockers.md` not touched.
  QUEUE-0002 still
  `blocked_pending_human` red.
  BLK-0001 / BLK-0002 / BLK-0003
  all still `open`.

All 26 TASK acceptance criteria are
demonstrably met per RUN_REPORT.
Approving on technical execution + memo
design quality. Push to `origin/main`
remains a separate human-approval gate.
This push is **user-visibly a no-op** —
`.agent/`-only, same class as P2.0a,
P2.1a, and AgentOps-2b/2c memos.

## Approved direction

- **Continue with AgentOps automation-system
  development.** The pause called out in the
  2026-07-08 daily summary was scoped to
  **AgentOps-2* work** (the runner-
  implementation track pinned by Q10);
  AgentOps-3 is a **fresh strategic-scoping
  initiative** and is not in violation.
- **Default next task**:
  **AgentOps-3b · Codex read-only daily
  planner design / spec** (yellow, design
  memo only, per §14 of the memo).
- **AgentOps-3c · benchmark resume
  fixtures** is also valuable and green,
  but should be a **separate parallel
  loop**, not bundled into 3b.
- **Do NOT implement planner, runner, or
  Playwright harness** until their
  design/spec loop (3b for planner, 3d
  for harness) is approved.
- **Keep the automation rollout
  sequential and permissioned**: 3b →
  3c → 3d → 3e → 3f, each its own TASK
  + RUN_REPORT + DECISION, no
  parallelization beyond the specific
  3b + 3c pairing named in §16 of the
  memo.

## Initial answers to §15 open decisions

Recorded here so future TASKs can point at
this DECISION rather than re-litigating.

1. **Codex planner run mode**: **manual
   first, not scheduled.** Aligns with
   AgentOps-2c Q10's "no scheduler" pin.
   Revisit after 3d ships.
2. **Regression harness target**:
   **local `npm run dev` first;
   production later, and only with
   explicit per-run human approval.**
3. **Monthly API budget for automated
   regression**: **start at $25 / month.**
   Enough to run the 5-resume suite
   several times per week at ~$0.05/run
   plus headroom. Tune after 3e ships.
4. **Benchmark suite size**: **define
   all 5 fixtures A-E in AgentOps-3c,
   but the first regression prototype
   (3e) may run only 1 fixture.**
   Prevents premature optimization
   against the whole suite before the
   plumbing is proven.
5. **Claude Code real LLM calls during
   automation time**: **supervised
   only, budget-capped, no unattended
   runs in v1.** No sleep-window
   generation-report calls until the
   harness has soaked.
6. **Red regression verdict**:
   **automatic push block.** Aligns
   with §11 incident-note protocol.
   Amber requires explicit human +
   ChatGPT approval before push.
7. **Baseline storage**: **initially
   avoid large committed artifacts.
   Full run artifacts (report.md,
   report.png) live in
   `.agent/regression_runs/`** (or
   scratchpad outside the repo, TBD
   in 3d), **with only the
   verdict.md + metadata.json
   summaries committed** to keep the
   repo lightweight.
8. **Committing generated benchmark
   reports**: **not committed
   wholesale in v1** unless
   explicitly approved per run.
9. **Codex writing to `.agent/tasks/`
   directly**: **no**, not in 3b or
   3c. Codex may later write to
   `.agent/tasks_draft/` only (3c
   onward). Revisit in 3f.
10. **Task classes allowed during
    sleep / work automation time**:
    **green / read-only / planner /
    fixture only** initially. No
    yellow product changes without
    explicit whitelist.
11. **3-judge eval in v1**: **no**.
    Start with structural + light
    rubric checks (memo §7.3's 13
    first-version items). Add
    inline eval later if budget
    allows.
12. **Playwright headed vs headless**:
    **headless first**; headed mode
    only for on-demand debugging.
13. **Digest directory**: **use
    `.agent/planner_reports/`** for
    Codex daily planner outputs
    (memo's default). Defer any
    separate `.agent/executive_digests/`
    decision until we see the
    planner-report format in
    practice.

Any of these answers can be revisited
in a future TASK + DECISION loop; they
are named here so 3b's TASK can cite
them by number.

## Risks found

1. **This memo concerns future automation
   control**, so downstream
   implementation will be **red /
   yellow-adjacent** even though the
   memo itself is design-only. Severity:
   **scoped by phased rollout**.
   Mitigation: 3b/3c/3d/3e/3f each
   remain separate loops.
2. **Codex planner must remain
   read-only** at first; otherwise it
   may bypass human / ChatGPT decision
   control. Severity: **high** if
   mishandled. Mitigation: §13
   permissions matrix explicitly
   forbids Codex writes outside its
   designated directories.
3. **Report regression harness creates
   API cost and latency overhead**.
   Severity: **medium**. Mitigation:
   monthly budget ($25/mo initial,
   answer #3) + per-run cost budget
   in §7 + §8's forbidden-on-dirty-
   repo rule prevents accidental
   double-runs.
4. **LLM-generated report comparisons
   are nondeterministic**; v1 should
   use structural / rubric checks,
   **not naive text diff alone**.
   Severity: **medium**. Mitigation:
   §7.3 first-version 13 checks are
   structural; §7.4 future 7 checks
   include the more sophisticated
   diff-vs-baseline design.
5. **Benchmark fixtures must be
   synthetic and privacy-safe**. No
   user PII may enter the harness.
   Severity: **high for privacy**.
   Mitigation: §7's "no user
   resumes and no PII ever enter
   the harness" clause; AgentOps-3c
   (fixture authoring) will enforce
   this.
6. **Storing generated reports /
   screenshots in repo may create
   bloat and noise**. Severity:
   **medium**. Mitigation: answer
   #7 above — only summaries
   committed; full artifacts stay
   outside the repo or in
   `.agent/regression_runs/`
   with future cleanup policy
   (3d design).
7. **Production-target harness
   should not run without
   explicit per-run approval**.
   Severity: **high**. Mitigation:
   answer #2 above +
   §7.1 + §8.3.
8. **Red regression verdicts must
   block push until reviewed**.
   Severity: **acceptable by
   design**. Mitigation: answer #6
   + §11 incident-note protocol.
9. **Any future automation runner,
   scheduler, or
   `.agent/scripts/**` change
   requires separate approval**.
   Severity: **acceptable by
   design**. AgentOps-2c Q3-Q8
   hard rule remains.
10. **Any prompt / model / corpus
    / classifier / source changes
    remain red-zone**. Severity:
    **acceptable by design**.
11. **OpenAI API remains blocked
    in Q7-blocked senses**. This
    memo introduces no OpenAI API
    usage. Codex CLI via ChatGPT
    sign-in is the sanctioned
    channel.
12. **G2.1d remains blocked by
    BLK-0001**. Severity: **n/a
    by design**.
13. **Full automation remains
    blocked by BLK-0002**.
    Severity: **n/a by design**.
14. **Automation may create
    false confidence if
    regression metrics are too
    shallow**. Severity: **medium**.
    Mitigation: §7.3's 13
    structural checks plus the
    §7.4 future rubric layer are
    designed to catch different
    failure modes; the first
    prototype (3e) is deliberately
    limited to one fixture to
    keep expectations honest.
15. **Human + ChatGPT daily
    digest must stay short
    enough to actually save
    time**. Severity: **critical
    to the whole system's value
    prop**. If the digest bloats,
    the automation stops
    reducing manual effort.
    Mitigation: §10's 5-15
    minutes / day target + the
    memo's explicit "tighten
    the digest, don't expand
    reader's time" rule.

## Red-zone flags

`none` for AgentOps-3a.

No `src/lib/prompts.ts`, no
`src/lib/anthropic.ts` (not present), no
`src/data/web_bundle.json`, no
`src/lib/corpus.ts`, no `src/app/api/**`
(runtime model selection), no
`package.json`, no `package-lock.json`,
no `.env*`, no `vercel.json`, no
`.vercel/**`, no `.github/workflows/**`
changed. No pipeline-repo file changed
at all. No Codex CLI config, Claude Code
config, or OpenAI SDK introduced. No
`.agent/scripts/**` edited (hard rule
per Q3-Q8 of AgentOps-2c DECISION). No
executable runner / shell script /
config / cron / hook file created
anywhere. No collector invocation. No
LLM call. No new npm dependency. No
manual deploy. **No planner / harness /
fixture implementation**.

## Required fixes

`none`

Scope is clean (3 paths, all approved),
memo hits every structural requirement
(17 H2 = 16 required + `Status`, 1175
lines, 13 open decisions > 10 required,
6-actor diagram, 6-actor × 12-column
permissions matrix, exactly-5 next
TASKs in §14, single default in §16),
the phased rollout is appropriately
conservative, and no forbidden /
red-zone / pipeline / runner / OpenAI
/ config / executable /
`.agent/scripts` / prompts /
runtime-selection / data path was
touched. All 26 TASK acceptance
criteria are demonstrably met per
RUN_REPORT.

## Non-blocking follow-ups

- **After DECISION approval and
  push** → update daily summary.
  Extend
  `.agent/daily_summaries/2026-07-08_SUMMARY.md`
  (or create a fresh 2026-07-11
  summary — Bohao's call) with an
  AgentOps-3a section documenting
  the 3 commits, the memo's key
  recommendations, and the 13
  initial answers above.
- **Next default loop**:
  **AgentOps-3b · Codex read-only
  daily planner design / spec**.
- **Separate later loop**:
  **AgentOps-3c · benchmark
  resume fixtures** (green,
  authorable in parallel with
  3b as a strictly separate
  scope-and-approve loop).
- **Separate later loop**:
  **AgentOps-3d · report
  regression harness design
  memo**.
- **Do NOT implement planner in
  this TASK**.
- **Do NOT implement Playwright
  harness in this TASK**.
- **Do NOT create benchmark
  fixtures in this TASK**.
- **Do NOT modify
  `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline
  files.**
- **Do NOT run collector.**
- **Do NOT refresh corpus.**
- **Do NOT introduce OpenAI
  API** in any Q7 blocked sense.
- **Do NOT modify GitHub
  Actions.**
- **Do NOT push until explicit
  human approval.**

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay
   on `main` of the pipeline repo.
2. Do NOT push either repo. The web
   repo will be ahead of origin/main
   by 3 commits at that point
   (`74939b6` impl + `36acd82`
   RUN_REPORT + this DECISION); push
   requires Bohao's explicit
   "push AgentOps-3a" instruction.
   This push is user-visibly a NO-OP
   — `.agent/`-only.
3. Do NOT deploy manually. Vercel
   auto-deploy from the eventual
   push handles this, but produces
   no user-visible change.
4. Do NOT implement Codex planner.
5. Do NOT implement Playwright
   harness.
6. Do NOT create benchmark fixtures.
7. Do NOT modify `.agent/scripts/**`.
   Hard rule per AgentOps-2c Q3-Q8.
8. Do NOT modify `src/**`.
9. Do NOT modify pipeline files.
10. Do NOT run collector. No
    `python -m scripts.collector …`,
    no `dry-run`, no
    `clean-preview`, no `run`.
11. Do NOT refresh corpus.
12. Do NOT introduce OpenAI API in
    any Q7 blocked sense.
13. Do NOT modify GitHub Actions.
14. Do NOT modify runtime model
    selection (`src/app/api/**`
    stays frozen).
15. Do NOT modify prompts
    (`src/lib/prompts.ts` stays
    frozen).
16. Do NOT add any new npm
    dependency or `package.json`
    entry.
17. Do NOT lift any of the 3 open
    blockers (BLK-0001 / BLK-0002 /
    BLK-0003) without explicit
    written human resolution.
18. Do NOT start AgentOps-3b or
    AgentOps-3c yet — each is a
    separate future TASK +
    DECISION loop.

The next likely promote step is:
- `git push origin main` from the
  web repo (3 commits land on
  `origin/main`: `74939b6` +
  `36acd82` + this DECISION).
  Vercel auto-deploys but produces
  no user-visible change.
- Then extend or create the daily
  summary with an AgentOps-3a
  section; commit + push.
- Then, per this DECISION's
  §non-blocking-followups, the
  natural next TASK is
  **AgentOps-3b · Codex read-only
  daily planner design / spec**.
  In parallel, AgentOps-3c
  fixtures can be scoped as a
  strictly separate green loop.

Wait for Bohao's explicit
"push AgentOps-3a" before doing
anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of
  `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which will deliver 3 commits —
  `74939b6` (impl), `36acd82`
  (RUN_REPORT), and this DECISION
  commit once it lands). This push
  triggers Vercel auto-deploy but is
  **user-visibly a no-op** — no
  runtime code path or product
  surface changed; only `.agent/`-only
  documentation lands.
- Authoring the daily summary
  cleanup commit.
- Starting AgentOps-3b, 3c, 3d, 3e,
  3f in any order.
- Any planner / runner / harness /
  fixture implementation.
- Any pipeline file edit.
- Any `src/data/**` edit.
- Any collector run.
- Any corpus refresh.
- Any `.agent/scripts/**` mod.
- Any AgentOps-2* work (per Q10
  pause).
- Any runtime model-selection
  change.
- Any prompt change.
- Any new npm dependency or
  `package-lock.json` change.
- Any G2.1d (red) work.
- Any OpenAI API usage in Q7
  blocked sense.
- Any manual `vercel deploy`.
- Any modification of `.agent/policies/**`
  / `.agent/templates/**` (protocol
  changes are always yellow per
  README §236-244).
- Lifting any of the 3 open
  blockers (BLK-0001 / BLK-0002 /
  BLK-0003).

> Verdict is `approve` for technical
> execution captured in the RUN_REPORT
> + the 1175-line memo. Standing
> policy treats any `main` push as a
> human gate. This push is
> user-visibly a no-op — only
> `.agent/` documentation lands.
>
> Approving this DECISION:
>
> - Records the AgentOps-3a memo as
>   a `reviewed_approved` design
>   document for the AgentOps-3
>   track.
> - Endorses the phased 3a → 3f
>   rollout.
> - Endorses **AgentOps-3b (Codex
>   read-only daily planner design
>   + spec)** as the recommended
>   next code loop, with
>   **AgentOps-3c (benchmark resume
>   fixtures)** as the parallel
>   green candidate.
> - Records the "regression
>   harness is a required quality
>   gate for §8.1 class changes"
>   invariant.
> - Records the 13 initial answers
>   to §15 open decisions so future
>   TASKs can cite them by number.
> - Records the boundary:
>   "AgentOps-3 scoping does not
>   lift the Q10 pause on the
>   AgentOps-2 runner implementation
>   track".
>
> Approving does NOT approve:
> (a) starting AgentOps-3b / 3c /
> 3d / 3e / 3f — each is its own
> TASK + DECISION, (b) any planner /
> runner / harness / fixture code,
> (c) any pipeline file edit, (d)
> any bundle swap, (e) any collector
> run, (f) any prompt / model /
> API-route change, (g) any
> `.agent/scripts/**` mod, (h) any
> OpenAI API usage in Q7 blocked
> sense, (i) G2.1d, (j) lifting any
> of the 3 open blockers, (k) any
> `.agent/policies/**` or
> `.agent/templates/**` edit. Each
> of those remains its own explicit
> human decision. The next step is
> Bohao's explicit call on the
> push.
