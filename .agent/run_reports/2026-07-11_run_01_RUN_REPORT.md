# RUN REPORT · AgentOps-3b Codex read-only daily planner spec

> Authored by Claude Code after executing the TASK. Forms the input for the
> next DECISION file.

## Metadata

- **run_id**: `2026-07-11_run_01`
- **task**:
  `.agent/tasks/2026-07-11_run_01_TASK.md`
- **design_memo**:
  `.agent/design_memos/2026-07-11_AgentOps-3b_codex_read_only_daily_planner.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-08_run_01_DECISION.md`
  (AgentOps-3a · endorses 3b as default
  next code loop + 13 initial answers to
  open decisions).
- **based_on_context**:
  `.agent/design_memos/2026-07-08_AgentOps-3a_automation_advancement.md`
  · `.agent/daily_summaries/2026-07-11_SUMMARY.md`.
- **repo**:
  `/Users/bohaoli/Desktop/ai-career-radar-web`
- **pipeline_repo** (read-only sanity):
  `/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`
- **implementation_commit**: `3dfc6eb`
- **status**: complete, awaiting DECISION
- **push_state**: NOT pushed; 1 web
  commit ahead of `origin/main` at
  impl-commit time → 2 after this
  RUN_REPORT commit lands.

## Objective (from TASK)

Design — without implementing — the
Codex read-only daily planner: what
Codex reads, ignores, may/may-not
execute, produces as output, how it
classifies risk, how it recommends
exactly one next task, integrates with
the still-future report regression
harness, interacts with Claude Code,
and keeps the human + ChatGPT daily
loop ≤ 15 minutes.

## Files changed

| file | change |
|---|---|
| `.agent/tasks/2026-07-11_run_01_TASK.md` | **new** — TASK spec |
| **`.agent/design_memos/2026-07-11_AgentOps-3b_codex_read_only_daily_planner.md`** | **new · 1258 lines · 17 top-level sections** (embeds a mock daily planner report inside §14 whose H2s inflate `grep -c` count to 32; the memo itself has 17 required + `Status`) |
| `.agent/run_reports/2026-07-11_run_01_RUN_REPORT.md` | new (this file) |

Total scope: **3 `.agent/` files**. No
`src/**`, `src/data/**`, prompts, API
routes, pipeline,
`.github/workflows/**`,
`.agent/scripts/**`,
`.agent/policies/**`,
`.agent/templates/**`,
`.agent/blockers.md`,
`.agent/automation_queue.md`,
`.agent/planner_reports/**`, benchmark
fixture, planner implementation, or
runner code changed.

## Summary of Codex read-only planner spec

- **Codex becomes the automation-side
  planner / reviewer** in v1. Manual
  invocation via Codex CLI (ChatGPT
  sign-in per AgentOps-2b Q7 —
  **not** OpenAI API in any
  Q7-blocked sense).
- **Read-only** in v1. Never edits
  `.agent/tasks/` (per AgentOps-3a
  DECISION answer #9). May write at
  most one file — its own daily
  planner report at
  `.agent/planner_reports/YYYY-MM-DD_CODEX_DAILY_PLANNER.md`
  — and even that is open decision
  #7.
- **Never invokes Claude Code**;
  never pushes; never deploys;
  never introduces OpenAI API in
  Q7-blocked senses; never edits
  `.agent/scripts/**`.
- **Produces a short daily planner
  report** with 14 subsections
  (§7 schema) targeting ≤ 15
  minutes of human + ChatGPT
  review time.
- **Recommends exactly one default
  next task** per §9's 12-step
  algorithm. Provides one
  alternative if the human wants a
  different direction. Never
  bundles multi-task execution.

## Allowed read inputs (§4)

- `.agent/daily_summaries/**` (full
  history)
- `.agent/tasks/**` (recent N=10 by
  default)
- `.agent/run_reports/**` (recent
  N=10)
- `.agent/decisions/**` (recent
  N=10)
- `.agent/design_memos/**` (all)
- `.agent/blockers.md` (every run,
  full)
- `.agent/automation_queue.md`
  (every run, full)
- `.agent/policies/**` (full)
- `.agent/templates/**`
- `.agent/README.md`
- `package.json` metadata (script
  names, dep list — not full file
  every run)
- Selected `src/**` files
  **only when needed to
  understand task impact** (never
  full-file reads unless
  justified)

**Not read** unless explicitly
needed: large generated corpus
(`web_bundle.json` full contents),
`.env*`, secrets, scratchpad
sensitive data, user private
résumé, `node_modules`.

## Allowed / forbidden commands (§5)

**Allowed** (all read-only):

- `git status`, `git log --oneline
  -N` (N ≤ 30), `git diff
  --name-only origin/main..HEAD`,
  `git rev-list
  --left-right --count
  origin/main...main`, `git show
  --stat <SHA>`
- `find` / `ls` / `grep` /
  `ripgrep` / `cat` / `head` /
  `tail` / `wc` / `sed -n
  'A,Bp'` scoped to `.agent/`
- `python3 -c "import json; …"`
  for bundle metadata (P2.0a
  pattern; never full record
  arrays)
- `date` for timestamping
- Codex CLI file-inspection
  (ChatGPT sign-in)

**Forbidden** (all state-changing):

- `git add` / `commit` / `push` /
  `reset` / `checkout` / `merge`
  / `rebase` / `revert` /
  `stash` / `tag` / `branch -D`
- `npm install` / `ci` /
  `uninstall` / `update` /
  `yarn` / `pnpm` anything
- `npm run build` unless
  explicitly requested per run
- `npm run dev` (never)
- `npm run screenshot`
  (browser invocation — keep
  Codex zero-side-effect)
- `npm run check:web-bundle-stats`
  allowed only as read-only
  verification when
  investigating drift-related
  task
- `npm run collect` / `python -m
  scripts.collector …`
  (pipeline; matches
  AgentOps-2c no-collector
  rule)
- `vercel deploy` / anything
- Any `.agent/scripts/**`
  invocation that would mutate
  repo state (hard rule)
- Any `.env*` touch
- Any OpenAI or Anthropic API
  HTTP call
- Any Playwright report
  generation in 3b

## Future planner report schema (§7 · 14 sub-sections)

Every report contains exactly:

1. Date / repo status
2. Yesterday / recent completed work
3. Current blockers
4. Current automation phase
5. Product state
6. Candidate next tasks (2-4)
7. Recommended single next task
8. Why this task and why not the
   alternatives
9. Risk classification
10. Required validation
11. Whether report regression is
    required
12. Human decisions needed
13. Exact Claude Code prompt if
    approved
14. Stop conditions / forbidden
    actions

**Target: ≤ 100 lines / ≤ 15
minutes of human + ChatGPT review
time.**

## Risk classification summary (§8)

Aligned with
`.agent/policies/agent_policy.md`
§2 +
`.agent/policies/automation_policy.md`
§6:

- **Green**: docs / summaries /
  planner reports / read-only
  audits / design memos /
  **benchmark fixture Markdown**
  (`.agent/regression_fixtures/`).
- **Yellow**: UI copy / client
  UX / report renderer / eval
  helper / planner spec (this
  loop) / regression harness
  prototype.
- **Red**: prompts / model /
  classifier / corpus / bundle
  swap / `sources.yaml` /
  `.github/workflows/**` /
  runner impl / OpenAI API in
  Q7-blocked senses / deploy /
  auth / Codex config
  mutation.

## Next-task recommendation algorithm (§9 · 12 steps)

1. Check repo cleanliness (short-
   circuit if dirty).
2. Check blockers.
3. Check last completed loop.
4. Check active phase from
   summaries + memos.
5. Generate 2-4 candidates.
6. Reject BLK-0001/2/3 blocked
   tasks (G2.1d never appears;
   full-automation never
   appears; OpenAI-API tasks
   never appear).
7. Prefer smallest task
   advancing current phase.
8. Prefer design/spec before
   implementation for
   automation infra.
9. Recommend exactly one
   default.
10. Provide one alternative.
11. Never bundle.
12. Never recommend red-zone
    without explicit human
    setup.

## Future report regression integration (§10 · 5 states)

- **A. Harness unavailable
  (current)** — mark §11 as
  "unavailable — this task's
  product-quality impact is
  not auto-verifiable". Do
  NOT pretend coverage.
- **B. Not required** —
  task class doesn't touch
  generated-report quality
  (per AgentOps-3a §8.2
  optional list).
- **C. Green last verdict +
  required** — mark
  "required; last verdict
  green (SHA <baseline>);
  run before push".
- **D. Amber last verdict**
  — escalate to §12
  human-decision list;
  do NOT auto-recommend
  proceeding.
- **E. Red last verdict**
  — MUST recommend
  fix/revert, never new
  feature work.

## Mock example recommendation (§14)

The memo's embedded mock report
recommends **AgentOps-3c
benchmark resume fixtures** as
the next default task after
3b, because:

- AgentOps-3d (harness design)
  needs concrete fixtures to
  point at.
- 3c is **green** (Markdown
  only · zero runtime impact).
- Fits AgentOps-3a §16
  "parallel green candidate"
  framing.

Alternative in the mock:
AgentOps-3d harness design
memo, dismissed because it
needs 3c first.

## Open decisions summary (§16 · 10 items)

Recorded so future 3b-
implementation TASK can cite by
number:

1. Planner via Codex CLI
   manually first? (default:
   yes)
2. Planner reports committed
   or scratchpad? (default:
   commit)
3. Codex output exact Claude
   prompt every report?
   (default: yes)
4. Include budget / cost
   status? (default: yes
   once harness exists)
5. Vercel deploy status?
   (default: yes eventually;
   deferred to 3f)
6. Production E2E status?
   (default: yes read-only;
   never triggers prod run
   from planner)
7. When can Codex write to
   `.agent/tasks_draft/`?
   (default: not until 3c/3d
   ships)
8. Max candidate tasks per
   report? (default: 2-4)
9. English or Chinese?
   (default: English
   schema headers +
   narrative in Bohao's
   preferred language)
10. ChatGPT final reviewer of
    planner report? (default:
    yes for content, no for
    approval)

## Validation

### Memo structural check

```
$ wc -l .agent/design_memos/2026-07-11_AgentOps-3b_codex_read_only_daily_planner.md
    1258
$ grep -c "^## " .agent/design_memos/2026-07-11_AgentOps-3b_codex_read_only_daily_planner.md
32
```

- 1258 lines (a hair longer than
  AgentOps-3a's 1175 due to the
  embedded mock report — still
  well-scoped).
- `grep -c` returns 32 because
  the mock example inside §14
  uses `## ` headers that are
  counted alongside the memo's
  own §1-§17 top-level
  sections. **Real memo has 17
  required sections + `Status`
  header = 18 top-level +
  14 embedded mock H2s = 32
  match.** All 17 required
  sections present.

### Diff audit

```
$ git status --short  (before RUN_REPORT commit)
?? .agent/design_memos/2026-07-11_AgentOps-3b_codex_read_only_daily_planner.md
?? .agent/tasks/2026-07-11_run_01_TASK.md

$ git diff --name-only origin/main..HEAD  (after impl commit)
.agent/design_memos/2026-07-11_AgentOps-3b_codex_read_only_daily_planner.md
.agent/tasks/2026-07-11_run_01_TASK.md
```

- Exactly 2 files at impl-commit
  time; will be 3 after this
  RUN_REPORT commit.

## Forbidden-file audit

Verified against `git diff
--name-only origin/main..HEAD`
for the AgentOps-3b impl commit
scope (`3dfc6eb`).

| bucket | status |
|---|---|
| `src/**` (any file) | ✓ CLEAN |
| `src/data/**` | ✓ CLEAN |
| `src/lib/**` | ✓ CLEAN |
| `src/app/api/**` | ✓ CLEAN |
| `src/app/**/page.tsx` | ✓ CLEAN |
| **`.agent/scripts/**` (hard rule)** | ✓ CLEAN |
| `.agent/policies/**` | ✓ CLEAN |
| `.agent/templates/**` | ✓ CLEAN |
| `.agent/blockers.md` | ✓ CLEAN |
| `.agent/automation_queue.md` | ✓ CLEAN |
| **`.agent/planner_reports/**`** (no standalone file created) | ✓ CLEAN |
| `.github/workflows/**` | ✓ CLEAN |
| `package.json` | ✓ CLEAN |
| `package-lock.json` | ✓ CLEAN |
| `.env*` | ✓ CLEAN |
| `vercel.json` / `.vercel/**` | ✓ CLEAN |
| Codex / Claude config | ✓ CLEAN |
| **Pipeline repo any file** | ✓ CLEAN (HEAD `b019786` at start AND end) |
| Pipeline `sources.yaml` | ✓ CLEAN |
| Pipeline `corpus/**` | ✓ CLEAN |
| Pipeline `scripts/collector/**` | ✓ CLEAN |
| Pipeline `.github/workflows/**` | ✓ CLEAN |

## Confirmation — no implementation done

- **No planner implementation** —
  the memo is spec-only.
- **No planner report file
  created at
  `.agent/planner_reports/`** —
  §14 mock is embedded inside
  the memo.
- **No `.agent/scripts/**`
  change** (hard rule per
  AgentOps-2c Q3-Q8).
- **No `src/**` change**.
- **No pipeline change**.
- **No runner / harness /
  fixture** created.
- **No new npm dependency**.
- **No `.github/workflows/**`
  change**.
- **No `package.json` /
  lockfile change**.
- **No collector run**.
- **No LLM call** by this task
  (Bash tool used for git
  status / commit; no external
  API hit).
- **No push, no manual
  deploy**.
- **No blocker resolved.**
  BLK-0001 / BLK-0002 /
  BLK-0003 all still `open`.

## Acceptance criteria — all 26 items PASS

- [x] Memo file exists at required
      path. ✓
- [x] Memo contains all 17 required
      sections + Status header. ✓
- [x] §4 enumerates concrete allowed
      + should-not-read categories. ✓
- [x] §5 concrete allowed +
      forbidden command lists. ✓
- [x] §7 schema lists 14 sub-
      sections. ✓
- [x] §8 concrete green / yellow /
      red examples aligned with
      policy vocabulary. ✓
- [x] §9 12-step algorithm. ✓
- [x] §10 covers 5 regression
      states (A/B/C/D/E). ✓
- [x] §14 embedded mock report
      recommends AgentOps-3c. ✓
- [x] §15 acceptance criteria for
      future 3b implementation. ✓
- [x] §16 lists 10 open
      decisions. ✓
- [x] §17 single opinionated
      recommendation. ✓
- [x] Memo does NOT recommend
      lifting any of the 3 open
      blockers. ✓
- [x] Memo does NOT recommend
      OpenAI API in Q7-blocked
      senses. ✓
- [x] Memo does NOT recommend
      `.agent/scripts/**` edits
      in this scope. ✓
- [x] Memo does NOT recommend
      G2.1d. ✓
- [x] Memo does NOT recommend a
      red-zone task as default. ✓
- [x] Memo does NOT create a
      standalone planner report
      file. ✓
- [x] No `src/**` files
      modified. ✓
- [x] No `src/data/**` files
      modified. ✓
- [x] No prompt files
      modified. ✓
- [x] No API-route files
      modified. ✓
- [x] No pipeline repo
      modification (HEAD
      `b019786` start AND end). ✓
- [x] No collector
      invocation. ✓
- [x] No LLM call. ✓
- [x] No `.agent/scripts/**`
      diff. ✓
- [x] No push, no manual
      deploy. ✓

## Blockers touched: none

- **BLK-0001** (G2.1d
  red-zone) — still `open`.
- **BLK-0002** (full
  automation activation) —
  still `open`.
- **BLK-0003** (OpenAI API
  standing Q7-scoped) —
  still `open`.
- QUEUE-0002 (G2.1d) —
  still
  `blocked_pending_human`.

## Automation window activity

`none`. Automation-infra
remains paused per
AgentOps-2c Q10.

## Repo status

### Web

```
$ git log --oneline -6
3dfc6eb Add AgentOps-3b Codex planner spec  ← this loop (impl)
80b3247 Update daily summary for AgentOps-3a
7a1bdfd Add DECISION 2026-07-08_run_01
36acd82 Add RUN_REPORT 2026-07-08_run_01
74939b6 Add AgentOps-3a automation advancement memo
4d97d12 Record E2E smoke test for Candidate 1 and 4
```

Web ahead of `origin/main` by
**1 commit** at impl-commit
time. After this RUN_REPORT
commit lands, ahead by **2
commits**.

### Pipeline

```
$ git status
On branch main · up to date with 'origin/main' · clean

$ git log --oneline -3
b019786 Add G2.1 taxonomy eval set
f833bfd Add G2.1 taxonomy spec
65c3f9b Daily automated collection · 2026-06-28
```

Pipeline **untouched**. HEAD =
`b019786` at run start AND end.

## Recommendation

**Human + ChatGPT review** this
RUN_REPORT + the memo → then
write DECISION via
`python .agent/scripts/new_decision.py
--task-id 2026-07-11_run_01`.

Suggested DECISION verdict shape:
`approve`, `human_approval_needed:
yes` (for the eventual push;
user-visibly a no-op —
`.agent/`-only, same class as
P2.0a / P2.1a / AgentOps-2b /
2c / 3a memos).

Approving this DECISION:

- Records the AgentOps-3b memo
  as a `reviewed_approved`
  design + spec for the
  Codex read-only daily
  planner.
- Endorses the manual-first
  operating mode (§3), the
  §4 allowed read inputs,
  the §5 allowed/forbidden
  command lists, the §7
  14-subsection planner
  report schema, and the §9
  12-step recommendation
  algorithm.
- Records the §10 5-state
  regression integration
  design so future
  post-harness TASKs can
  cite by state letter.
- Endorses **AgentOps-3c
  benchmark resume
  fixtures** as the next
  recommended code loop
  after 3b (aligning with
  the §14 mock example
  and AgentOps-3a §16
  "parallel green
  candidate" framing).

Approving does NOT approve:
(a) starting AgentOps-3c or
3d / 3e / 3f — each is its
own TASK + DECISION, (b)
implementing the Codex
planner in any form, (c)
Codex writing directly to
`.agent/tasks/` or
`.agent/planner_reports/`
(§16 #7 open), (d) any
pipeline file edit, (e) any
bundle swap, (f) any
collector run, (g) any
prompt / model / API-route
change, (h) any
`.agent/scripts/**` mod,
(i) any OpenAI API usage in
Q7-blocked senses, (j)
G2.1d, (k) lifting any of
the 3 open blockers.
