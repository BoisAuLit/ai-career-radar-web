# DECISION · AgentOps-3b Codex read-only daily planner spec

> Authored by ChatGPT (human-mediated) after
> reading the RUN_REPORT and the full 1258-line
> memo. Scaffolded by
> `python .agent/scripts/new_decision.py
> --task-id 2026-07-11_run_01` (**twenty-first
> full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-11_run_01_DECISION`
- **based_on_run_report**:
  `.agent/run_reports/2026-07-11_run_01_RUN_REPORT.md`
- **based_on_design_memo**:
  `.agent/design_memos/2026-07-11_AgentOps-3b_codex_read_only_daily_planner.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-08_run_01_DECISION.md`
  (AgentOps-3a · endorsed 3b as default
  next code loop + 13 initial answers to
  §15 open decisions).

## Verdict

`approve`

## Reasoning summary

AgentOps-3b successfully **defines the Codex
read-only daily planner spec without
prematurely implementing automation**. The
spec correctly positions Codex as a
**manual-first, read-only planner / reviewer**
that reduces Bohao's daily planning burden
while preserving **Human + ChatGPT as the
decision layer** and **Claude Code as the
controlled executor**. The planner is
limited to reading repo state and `.agent/`
records, producing a short planner report,
recommending exactly one next task,
classifying risk, listing required
validation, and identifying when report
regression is required.

The spec preserves every key safety boundary:

- **No planner implementation.**
- **No `.agent/planner_reports/*.md`
  standalone file generation** in this
  loop (the §14 mock is embedded inside
  the memo).
- **No `.agent/scripts/**` changes**
  (hard rule per AgentOps-2c Q3-Q8).
- **No runtime source changes**
  (`src/**` empty diff).
- **No API / prompt / model changes.**
- **No pipeline changes** (HEAD
  `b019786` start and end).
- **No collector / corpus refresh.**
- **No OpenAI API setup** in the
  Q7-blocked SDK / key / HTTP /
  import / CI-secret / background-token
  senses. Codex CLI via ChatGPT sign-in
  remains the sanctioned Codex channel
  per AgentOps-2b Q7.
- **No GitHub Actions changes.**
- **No runner / harness / fixture**
  created.
- **No push / deploy.**

The proposed **report schema** (14
subsections), **allowed / forbidden command
lists** (read-only inspection vs
state-changing operations), **next-task
recommendation algorithm** (12-step
sequential), and **future report-regression
integration** (5 states A/B/C/D/E) are all
appropriate for the next automation layer.
This is the right foundation for
transitioning from a fully human-driven
planning loop toward a Codex-assisted one
without giving up any of the safety
invariants earned across the 20 prior
loops.

Independent verification against the local
tree (both commits: `3dfc6eb` + `62aa016`):

- **Scope** (`git diff --name-only
  origin/main..HEAD`) = exactly the 3
  approved paths:
  `.agent/tasks/2026-07-11_run_01_TASK.md`,
  `.agent/design_memos/2026-07-11_AgentOps-3b_codex_read_only_daily_planner.md`,
  `.agent/run_reports/2026-07-11_run_01_RUN_REPORT.md`.
- **Memo structural check**: 1258 lines
  (comparable to AgentOps-3a's 1175 +
  the embedded mock example). 17
  top-level sections + `Status` header
  + 14 mock-example H2s = 32 `grep -c`
  count.
- **All 17 required sections present in
  order**: Purpose · Current automation
  state · Planner operating mode ·
  Allowed read inputs · Allowed
  commands · Future write output ·
  Planner report schema · Risk
  classification rules · Next-task
  recommendation algorithm ·
  Integration with report regression
  harness · Interaction with Claude
  Code · Human + ChatGPT daily
  workflow · Stop conditions · Example
  daily planner report · Acceptance
  criteria for future 3b implementation
  · Open decisions · Recommendation.
- **§4 read inputs**: concrete allowed
  list (`.agent/daily_summaries/`,
  `tasks/`, `run_reports/`,
  `decisions/`, `design_memos/`,
  `blockers.md`, `automation_queue.md`,
  `policies/`, `templates/`, `README.md`,
  `package.json` metadata, select
  `src/**` on-demand) + concrete
  should-not-read list (large corpus
  files, `.env*`, secrets, user
  résumés, `node_modules`).
- **§5 commands**: allowed = read-only
  (`git status/log/diff/rev-list/show
  --stat`, `find/grep/cat/head/tail/wc/sed
  -n`, `python3 -c "import json…"`,
  `date`, Codex CLI file-inspection);
  forbidden = every state-changing
  operation (`git add/commit/push/…`,
  `npm install/dev/deploy/collect`,
  `vercel …`, `.env*` touch, external
  API HTTP call, Playwright report
  generation).
- **§7 planner report schema** lists
  exactly the 14 required subsections.
- **§8 risk classification** matches
  `.agent/policies/agent_policy.md` §2
  and
  `.agent/policies/automation_policy.md`
  §6 vocabulary.
- **§9 next-task algorithm** has 12
  sequential steps; explicitly rejects
  BLK-0001 / 2 / 3 blocked tasks
  (G2.1d never appears while BLK-0001
  is open; full-automation never
  appears while BLK-0002 is open;
  OpenAI-API tasks never appear while
  BLK-0003 is open).
- **§10 5-state regression
  integration**: A (unavailable) / B
  (not required) / C (green + required)
  / D (amber → escalate) / E (red →
  fix or revert, never new feature).
- **§14 mock example** recommends
  AgentOps-3c benchmark resume
  fixtures as the next default task
  after 3b, with 3d as the dismissed
  alternative. Concise and realistic
  for the current 2026-07-11 state.
- **§15 acceptance criteria** for the
  future 3b-implementation dry-run.
- **§16 lists 10 open decisions** with
  memo defaults, ready for Bohao +
  ChatGPT to pin.
- **§17 single opinionated
  recommendation**: approve read-only
  planner; do not implement in 3b;
  next recommended = AgentOps-3c
  benchmark fixtures.
- **Memo does NOT recommend** lifting
  any of the 3 open blockers /
  OpenAI API in Q7-blocked senses /
  `.agent/scripts/**` edits / G2.1d /
  a red-zone task as default / a
  standalone planner report file
  creation in 3b.
- **Forbidden empty diffs**: `src/**`
  ✓, `src/data/**` ✓, `src/lib/**` ✓,
  `src/app/api/**` ✓, `.agent/scripts/**`
  ✓ (**hard rule**), `.agent/policies/**`
  ✓, `.agent/templates/**` ✓,
  `.agent/blockers.md` ✓,
  `.agent/automation_queue.md` ✓,
  **`.agent/planner_reports/**` ✓** (no
  standalone file created; §14 mock
  embedded in memo only),
  `.github/workflows/**` ✓,
  `package.json` ✓,
  `package-lock.json` ✓, `.env*` ✓,
  `vercel.json` / `.vercel/**` ✓.
- **Pipeline repo** untouched — HEAD
  `b019786` at start AND end.
- **No collector invocation**. **No
  LLM call** by this task.
- **No new npm dependency**.
- **No runner / daemon / cron /
  scheduler / GH Actions / Codex
  config / Claude config / OpenAI
  SDK / manual deploy** anywhere.
- **Model selection unchanged**.
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
P2.1a, and AgentOps-2b / 2c / 3a memos.

## Approved direction

- **Approve Codex read-only planner
  spec.**
- **Keep planner manual-first, not
  scheduled** (AgentOps-3a DECISION
  answer #1 reconfirmed).
- **Keep Codex read-only in the next
  phase.**
- Codex **may eventually write planner
  reports to `.agent/planner_reports/`**,
  but **no implementation exists yet**
  and the write path is a separate
  future TASK.
- Codex **must recommend exactly one
  next task and one alternative at
  most** — no bundling.
- Codex **must not create real TASK
  files in v1**. Later phases may
  extend this to
  `.agent/tasks_draft/` only, after
  separate DECISION.
- Codex **must not execute Claude
  Code** — no `claude-code` CLI
  invocation, no MCP call, no `Bash`
  tool starting Claude.
- Codex **must not push, deploy,
  edit runtime code, touch
  `.agent/scripts/**`, or bypass
  blockers.**
- **Default next loop after
  push / cleanup**: **AgentOps-3c ·
  benchmark resume fixtures**
  (green · 5 synthetic personas A-E
  under `.agent/regression_fixtures/`
  + README).
- **AgentOps-3c should remain a
  separate green loop** and should
  **not be bundled** with this
  DECISION or with AgentOps-3d
  (harness design memo).

## Initial answers to §16 open decisions

Recorded here so future TASKs can point
at this DECISION rather than re-
litigating.

1. **Planner generation mode**:
   **manual via Codex CLI first**
   (aligns with AgentOps-3a DECISION
   answer #1). Any move to scheduled
   invocation is a separate future
   TASK.
2. **Committing planner reports vs
   scratchpad**: **commit once the
   format stabilizes**; early dry
   runs can be reviewed manually in
   Codex's buffer before landing on
   disk. Once the format is proven
   (probably after 3 or so real
   invocations), planner reports
   land at
   `.agent/planner_reports/YYYY-MM-DD_CODEX_DAILY_PLANNER.md`
   for auditability.
3. **Include exact Claude Code
   prompt in every report**:
   **yes when recommending an
   actionable task**. Matches the
   "Start X …" message shape Bohao
   already sends. Reports that
   short-circuit to "stop, dirty
   repo" or "no task recommended"
   don't need the prompt block.
4. **Include budget / cost
   status**: **yes once the report
   regression harness exists**.
   Before the harness lands, cost
   stays qualitative and doesn't
   need a dedicated report
   subsection.
5. **Check Vercel deployment
   status**: **defer to a later
   phase** — the planner can
   incorporate it once we know
   what the practical signal
   looks like (probably 3f
   integration timeframe).
6. **Read production E2E status
   once harness exists**:
   **yes read-only; never
   trigger production tests
   automatically**. Aligns with
   AgentOps-3a DECISION answer #2
   (regression harness targets
   local first, prod only with
   per-run explicit approval).
7. **Codex writes to
   `.agent/tasks_draft/`**:
   **not until a later approved
   phase** — not in 3b, not in
   the immediate 3b-
   implementation TASK. Earliest
   candidate is post-3c/3d when
   the write path can be
   scoped against a real need.
8. **Max candidate tasks per
   report**: **2-4** (memo §16
   default reaffirmed). Fewer
   than 2 gives no comparison;
   more than 4 inflates review
   time.
9. **Language**: **English
   schema headers with Chinese
   or Bohao-preferred-language
   narrative** where useful.
   Fits `.agent/templates/*`
   convention and the standing
   memory rule.
10. **Final reviewer**: **ChatGPT
    remains final content
    reviewer**; the **human
    remains final approver**.
    ChatGPT can request
    changes, sharpen the
    recommendation, or propose
    a different candidate;
    Bohao's approval is
    load-bearing for any state
    change.

Any of these answers can be revisited
in a future TASK + DECISION loop; they
are named here so the future
3b-implementation TASK can cite them
by number.

## Risks found

1. **Even read-only planning can
   create false confidence if the
   planner overstates coverage.**
   Severity: **medium**. Mitigation:
   §10 A-state ("harness
   unavailable") explicitly forbids
   pretending coverage exists; §7's
   Required-validation subsection
   must name concrete manual
   validations that stand in.
2. **Codex must not write TASK files
   directly in v1.** Severity:
   **high if violated**. Mitigation:
   §11 pins this; open decision #7
   defers even `tasks_draft/` writes;
   AgentOps-3a DECISION answer #9
   reinforces.
3. **Codex must not execute Claude
   Code or start work automatically.**
   Severity: **high if violated**.
   Mitigation: §11 forbids;
   §5.2 forbidden-command list
   excludes any Claude invocation
   path.
4. **Codex must not call OpenAI or
   Anthropic APIs through repo
   code.** Severity: **high**
   (BLK-0003 Q7-blocked senses).
   Mitigation: §5.2 forbids; Codex
   CLI's own ChatGPT-sign-in
   inference is a separate channel
   not in scope here.
5. **Codex must not touch
   `.agent/scripts/**`.** Severity:
   **high**. Mitigation: hard rule
   per AgentOps-2c Q3-Q8;
   §11 reinforces.
6. **Codex must not recommend
   blocked G2.1d work while
   BLK-0001 is open.** Severity:
   **hard rule**. Mitigation: §9
   rule 6 explicitly rejects
   BLK-0001-blocked tasks.
7. **Codex must not recommend
   full automation while
   BLK-0002 is open.** Severity:
   **hard rule**. Mitigation: §9
   rule 6.
8. **Codex must not recommend
   Q7-blocked OpenAI API usage
   while BLK-0003 is open.**
   Severity: **hard rule**.
   Mitigation: §9 rule 6.
9. **Planner output must stay
   short enough for a 5-15
   minute review.** Severity:
   **critical to value prop**.
   Mitigation: §7 target
   ≤ 100 lines / ≤ 15 minutes;
   §12 daily workflow bakes
   this in.
10. **Planner must not naively
    treat absence of regression
    harness as a green signal.**
    Severity: **medium**.
    Mitigation: §10 A-state
    explicitly requires
    marking "unavailable — not
    auto-verifiable".
11. **Future regression
    integration must
    distinguish unavailable,
    optional, required, amber,
    and red states.**
    Severity: **acceptable by
    design**. Mitigation: §10
    encodes exactly those 5
    states A/B/C/D/E.
12. **Report regression
    checks will be
    nondeterministic once LLM
    generation is involved.**
    Severity: **medium**.
    Mitigation: AgentOps-3a
    §7.3 first-version 13
    checks are structural; §7.4
    future 7 checks include
    the harder rubric layer.
    Naive text-diff-alone is
    off the table.
13. **Allowing Codex to write
    planner reports later
    still requires clear
    output path and permission
    boundaries.** Severity:
    **low-medium**. Mitigation:
    §6 pins the output path;
    §16 #7 keeps the write
    permission open until a
    separate DECISION.
14. **Planner must stop on
    dirty repo, unexpected
    ahead/behind, forbidden-
    file diff, or ambiguous
    next step.** Severity:
    **acceptable by design**.
    Mitigation: §13 lists all
    11 stop conditions
    explicitly.
15. **Any move from
    design/spec to
    implementation requires
    a separate TASK +
    DECISION loop.**
    Severity: **acceptable by
    design**. Mitigation:
    memo §17 pins this; the
    3b-implementation TASK
    will need its own
    scope-and-approve cycle.

## Red-zone flags

`none` for AgentOps-3b.

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
manual deploy. **No planner
implementation. No `.agent/planner_reports/*.md`
standalone file. No benchmark fixture
file.**

## Required fixes

`none`

Scope is clean (3 paths, all approved),
memo hits every structural requirement
(17 top-level sections + Status + 14
mock-example subsections = 32 grep
count, 1258 lines, 10 open decisions,
concrete allowed / forbidden lists for
both reads and commands, 12-step
recommendation algorithm, 5-state
regression integration, 14-subsection
report schema, embedded mock example
recommending 3c, single default in
§17), the phased rollout stays
appropriately conservative, and no
forbidden / red-zone / pipeline /
runner / OpenAI / config / executable /
`.agent/scripts` / prompts /
runtime-selection / data path was
touched. All 26 TASK acceptance
criteria are demonstrably met per
RUN_REPORT.

## Non-blocking follow-ups

- **After DECISION approval and push**
  → extend/create daily summary. Add
  an AgentOps-3b section to
  `.agent/daily_summaries/2026-07-11_SUMMARY.md`
  (or create a fresh
  `2026-07-12_SUMMARY.md`)
  documenting the 3 commits, the
  10 initial answers above, and the
  next-recommended AgentOps-3c
  direction.
- **Next default loop**:
  **AgentOps-3c · benchmark resume
  fixtures**.
- **AgentOps-3c should create
  synthetic benchmark resumes only,
  not run report generation.**
- **Later loop**: **AgentOps-3d ·
  report regression harness design
  memo**.
- **Later loop**: **AgentOps-3e ·
  local Playwright regression
  prototype** (only after 3c + 3d
  ship).
- **Do NOT implement planner in this
  TASK.**
- **Do NOT create
  `.agent/planner_reports/` in this
  TASK.**
- **Do NOT create benchmark
  fixtures in this TASK.**
- **Do NOT implement Playwright
  harness in this TASK.**
- **Do NOT modify
  `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline files.**
- **Do NOT run collector.**
- **Do NOT refresh corpus.**
- **Do NOT introduce OpenAI API**
  in Q7-blocked senses.
- **Do NOT modify GitHub Actions.**
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
   (`3dfc6eb` impl + `62aa016`
   RUN_REPORT + this DECISION); push
   requires Bohao's explicit
   "push AgentOps-3b" instruction.
   This push is user-visibly a NO-OP
   — `.agent/`-only.
3. Do NOT deploy manually. Vercel
   auto-deploy from the eventual
   push handles this, but produces
   no user-visible change.
4. Do NOT start AgentOps-3c yet.
5. Do NOT create benchmark
   fixtures.
6. Do NOT implement Codex planner.
7. Do NOT create
   `.agent/planner_reports/`.
8. Do NOT implement Playwright
   harness.
9. Do NOT modify
   `.agent/scripts/**`. Hard rule
   per AgentOps-2c Q3-Q8.
10. Do NOT modify `src/**`.
11. Do NOT modify pipeline files.
12. Do NOT run collector. No
    `python -m scripts.collector …`,
    no `dry-run`, no
    `clean-preview`, no `run`.
13. Do NOT refresh corpus.
14. Do NOT introduce OpenAI API
    in any Q7 blocked sense.
15. Do NOT modify GitHub Actions.
16. Do NOT modify runtime model
    selection (`src/app/api/**`
    stays frozen).
17. Do NOT modify prompts
    (`src/lib/prompts.ts` stays
    frozen).
18. Do NOT add any new npm
    dependency or `package.json`
    entry.
19. Do NOT lift any of the 3 open
    blockers (BLK-0001 / BLK-0002 /
    BLK-0003) without explicit
    written human resolution.
20. Do NOT bundle 3c and 3d into
    one loop.

The next likely promote step is:
- `git push origin main` from the
  web repo (3 commits land on
  `origin/main`: `3dfc6eb` +
  `62aa016` + this DECISION).
  Vercel auto-deploys but produces
  no user-visible change.
- Then extend/create daily summary
  with an AgentOps-3b section;
  commit + push.
- Then, per this DECISION's
  §non-blocking-followups, the
  natural next TASK is
  **AgentOps-3c · benchmark
  resume fixtures**. Bohao's
  explicit "start AgentOps-3c"
  message opens it.

Wait for Bohao's explicit
"push AgentOps-3b" before doing
anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of
  `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which will deliver 3 commits —
  `3dfc6eb` (impl), `62aa016`
  (RUN_REPORT), and this DECISION
  commit once it lands). This push
  triggers Vercel auto-deploy but is
  **user-visibly a no-op** — no
  runtime code path or product
  surface changed; only `.agent/`-only
  documentation lands.
- Authoring the daily summary
  cleanup commit.
- Starting AgentOps-3c, 3d, 3e, 3f
  in any order.
- Any planner / runner / harness /
  fixture implementation.
- Any `.agent/planner_reports/**`
  file creation.
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
- Any `.agent/policies/**` /
  `.agent/templates/**` edit.
- Lifting any of the 3 open
  blockers (BLK-0001 / BLK-0002 /
  BLK-0003).

> Verdict is `approve` for technical
> execution captured in the RUN_REPORT
> + the 1258-line memo. Standing
> policy treats any `main` push as a
> human gate. This push is
> user-visibly a no-op — only
> `.agent/` documentation lands.
>
> Approving this DECISION:
>
> - Records the AgentOps-3b memo as
>   a `reviewed_approved` spec for
>   the Codex read-only daily
>   planner.
> - Endorses the manual-first
>   operating mode (§3), the
>   §4 allowed / not-allowed read
>   inputs, the §5 allowed /
>   forbidden command lists, the
>   §7 14-subsection planner report
>   schema, the §8 risk vocabulary,
>   the §9 12-step recommendation
>   algorithm, the §10 5-state
>   regression integration, the
>   §11 no-Claude-invocation /
>   no-direct-TASK boundary, the
>   §13 stop-conditions list, and
>   the §14 mock example
>   recommending AgentOps-3c.
> - Records the 10 initial answers
>   to §16 open decisions so future
>   TASKs can cite them by number.
> - Endorses **AgentOps-3c
>   (benchmark resume fixtures)**
>   as the recommended next code
>   loop after push + cleanup, as
>   a strictly separate green
>   loop.
> - Records the boundary: "3b is
>   spec-only; a future
>   3b-implementation TASK opens
>   Codex's first real planner
>   invocation".
>
> Approving does NOT approve:
> (a) starting AgentOps-3c or
> 3d / 3e / 3f — each is its own
> TASK + DECISION, (b)
> implementing the Codex planner
> in any form, (c) Codex writing
> directly to `.agent/tasks/`
> or `.agent/planner_reports/`
> (§16 #7 open), (d) any
> pipeline file edit, (e) any
> bundle swap, (f) any
> collector run, (g) any
> prompt / model / API-route
> change, (h) any
> `.agent/scripts/**` mod, (i)
> any OpenAI API usage in
> Q7-blocked senses, (j)
> G2.1d, (k) lifting any of
> the 3 open blockers, (l)
> any `.agent/policies/**` or
> `.agent/templates/**` edit,
> (m) bundling 3c + 3d.
> Each of those remains its
> own explicit human
> decision. The next step is
> Bohao's explicit call on
> the push.
