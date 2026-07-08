# RUN REPORT · P2.1a real generated report quality audit

> Authored by Claude Code after executing the TASK. Forms the input for the
> next DECISION file.

## Metadata

- **run_id**: `2026-07-07_run_02`
- **task**:
  `.agent/tasks/2026-07-07_run_02_TASK.md`
- **audit_memo**:
  `.agent/design_memos/2026-07-07_P2.1a_real_report_quality_audit.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-07_run_01_DECISION.md`
  (P2.0c) — no prior DECISION named P2.1a;
  starting the report-quality line here.
- **repo**:
  `/Users/bohaoli/Desktop/ai-career-radar-web`
- **pipeline_repo** (read-only sanity):
  `/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`
- **implementation_commit**: `68f0dc3`
- **status**: complete, awaiting DECISION
- **push_state**: NOT pushed; **1 web commit
  ahead of `origin/main`** after this
  RUN_REPORT commit lands → 2 commits.

## Objective (from TASK)

Audit — without changing any code — whether
the real generated-report experience is
strong enough to justify the product promise.
Produce a single opinionated design memo
covering 10 required sections and a single
default next-task recommendation.

## Files inspected (all read-only)

| file | purpose |
|---|---|
| `src/app/page.tsx` | homepage promise, form, streaming reader, error UI, eval invocation |
| `src/app/sample-report/page.tsx` | fictional static preview |
| `src/app/methodology/page.tsx` | corpus disclosure, "V1 ships snapshot-only" |
| `src/app/api/generate-report/route.ts` | request shape, model choice, streaming behavior |
| `src/app/api/eval-report/route.ts` | 3-judge eval route |
| `src/app/api/classify/route.ts` | archetype classifier (via Explore agent) |
| `src/app/api/extract-pdf/route.ts` | PDF-to-text route |
| `src/lib/prompts.ts` | classifier + report system prompts (verbatim read + full file) |
| `src/lib/corpus.ts` | evidence-JD picking, deep-dive filter |
| `src/lib/eval-report.ts` | 3-judge groundedness/specificity/actionability |
| `src/lib/extract-pdf.ts` | `unpdf`-based local extraction |
| `src/lib/web-bundle-stats.ts` | helper (checked read-only) |
| `src/data/web_bundle.json` | corpus metadata (`n_records: 443`) |
| `package.json` | inventory |

Pipeline repo: read-only sanity — `git status`
+ `git log --oneline -5` at start; unchanged
at end (HEAD = `b019786`).

## Audit verdict (verbatim from memo §1)

**Promising but needs targeted improvement.**
The generation stack is architected honestly —
grounds every recommendation in real corpus
records, refuses verified classes of
hallucination, exposes a 3-judge eval, and
holds a conservative May-2026 snapshot
posture. But the sample-report page is
visibly richer than the real streamed
markdown output, evidence quotes are
model-selected from full JD bodies with no
citation-integrity check, and there is a
silent-truncation gap in the stream reader
that will surface as "the report just
stopped mid-sentence." Keep the
architecture; fix the "real output ≠ what
the sample-report page sells" gap first.
Prompts are not the bottleneck.

## Top 5 risks

1. **Silent stream truncation is invisible
   to the user.** Stream reader
   (`src/app/page.tsx:542-550`) treats any
   `reader.read().done === true` as
   completion; a mid-stream Anthropic wobble
   just paints "done" over a half-report.
   Highest severity for trust.
2. **Quote-attribution integrity is
   model-honor-only.** Prompt asks for real
   JD quotes (`src/lib/prompts.ts:97-98`)
   but nothing substring-verifies the
   quoted phrase against the 5 supplied JD
   bodies; the groundedness judge
   (`src/lib/eval-report.ts:94-118`) checks
   claim classes but is not a substring
   verifier.
3. **Sample-report page is visually richer
   than the real report will ever be.**
   Colored gap medallions, hand-drawn 7-day
   plan grid, hardcoded pct chips
   (`src/app/sample-report/page.tsx:115-337`)
   vs. the real report's plain markdown
   blob rendered by `<ReactMarkdown>`
   (`src/app/page.tsx:1284-1286`). Promise
   vs. delivery gap.
4. **Empty PDF from scanned images ships
   silently to the résumé field.**
   `src/app/api/extract-pdf/route.ts` +
   `src/lib/extract-pdf.ts` extract with
   `unpdf`; scanned PDFs return near-empty
   text on a 200; frontend
   (`src/app/page.tsx:486-502`) blindly
   `setResume(data.text)`. User then
   submits an empty résumé and gets a
   report grounded in nothing.
5. **No inline eval, no post-generation
   quality nudge.** Eval is user-invoked
   only (`src/app/page.tsx:1306-1315`).
   Users who don't click `📊 Eval this
   report` never see 0.93 / 0.83 / 0.82
   applied to *their* report — a large
   trust gap between the hero's hardcoded
   headline numbers
   (`src/app/page.tsx:1519-1553`) and
   each user's personal experience.

## Recommended default next task

**Candidate 1 — Stream-complete sentinel +
"report may be incomplete" banner.**

- Fixes the highest-severity output-quality
  risk with the smallest possible narrow
  code change.
- Same yellow-loop cadence as P1.7b/c,
  P1.8a/b, P2.0b.
- Reach: **every** user, not just users
  who click `📊 Eval this report`.
- Likely files touched: `src/app/page.tsx`
  around the streaming reader
  (`src/app/page.tsx:542-550`) + one new
  banner near the report card
  (`src/app/page.tsx:1249-1287`). Possibly
  a small server change to inject a
  completion sentinel in
  `src/app/api/generate-report/route.ts`
  (client-only heuristic works too:
  "no trailing evidence appendix" fires
  the banner).
- Do NOT start this task in this cleanup
  turn. This memo is design-only; the
  actual TASK for candidate 1 comes as a
  separate scope-and-approve loop after a
  Human + ChatGPT review of the memo.

## Intentionally NOT changed

- No `src/**` files modified (audit-only).
- No `src/data/**` files modified.
- No `src/lib/prompts.ts` modified.
- No `src/app/api/**` files modified.
- No model-selection edit.
- No pipeline repo files touched
  (HEAD `b019786` at start and end).
- No `sources.yaml` / `corpus/**` /
  `scripts/collector/**` modified.
- No `.agent/scripts/**` touched (hard
  rule per AgentOps-2c Q3-Q8).
- No `.agent/policies/**` or
  `.agent/templates/**` touched.
- No `.agent/blockers.md` or
  `.agent/automation_queue.md` touched.
- No `.github/workflows/**` (either repo)
  touched.
- No `package.json` / `package-lock.json`
  changes.
- No `.env*` / `vercel.json` / `.vercel/**`
  touched.
- No Codex CLI / Claude Code config
  touched.
- No OpenAI API SDK / key / HTTP call
  introduced (BLK-0003 Q7-scoped honored).
- No `sample-report/page.tsx` /
  `methodology/page.tsx` edits (the memo
  §9 candidate 5 explicitly stays a
  memo-only follow-up).
- No screenshot regenerated (no
  user-visible UI change).
- No LLM call by this task itself (Explore
  agent used file-read tools only, not
  generative LLM calls to external
  endpoints outside Claude Code's own
  planning).

## Validation

### Memo structural check

```
$ wc -l .agent/design_memos/2026-07-07_P2.1a_real_report_quality_audit.md
     740
$ grep -c "^## " .agent/design_memos/2026-07-07_P2.1a_real_report_quality_audit.md
11
```

- 740 lines (within a reasonable range for
  a comprehensive audit memo — comparable
  to P2.0a's 718 lines).
- 11 H2 sections = the 10 required sections
  (Executive verdict, Product promise vs
  actual flow, Report structure, Evidence
  quality, Personalization quality,
  Actionability, UX risks, Output-quality
  risks, Recommended next task candidates,
  Default recommendation) + 1 `Status`
  header at the top.
- **56 unique `path:line` cites** across
  `src/app/page.tsx`, `src/lib/prompts.ts`,
  `src/lib/corpus.ts`,
  `src/app/api/generate-report/route.ts`,
  `src/app/api/eval-report/route.ts`,
  `src/lib/eval-report.ts`,
  `src/app/sample-report/page.tsx`,
  `src/app/methodology/page.tsx`,
  `src/lib/extract-pdf.ts`,
  `src/data/web_bundle.json` — well above
  the 15-cite minimum in the TASK.
- Executive verdict = a single opinionated
  state ("promising but needs targeted
  improvement"), not "it depends".
- §9 contains **exactly 5** ranked
  candidates with per-candidate expected
  value / risk / files / green-yellow-red /
  human-approval / why-now-or-not.
- §10 picks **exactly one** default (not
  two).
- Memo respects P2.0c DECISION §follow-ups:
  does NOT recommend build-gate integration
  or codegen as the default.
- Memo respects standing blockers: does NOT
  recommend G2.1d (BLK-0001), automation-
  infra resumption (Q10), OpenAI API
  (BLK-0003), or full automation activation
  (BLK-0002).

### Diff audit

```
$ git status  (before RUN_REPORT commit)
Changes not staged for commit:
  (none)
Untracked files:
  (none — impl commit 68f0dc3 already landed)

$ git diff --name-only origin/main..HEAD  (before RUN_REPORT commit)
.agent/design_memos/2026-07-07_P2.1a_real_report_quality_audit.md
.agent/tasks/2026-07-07_run_02_TASK.md

# after this RUN_REPORT commit:
+ .agent/run_reports/2026-07-07_run_02_RUN_REPORT.md
```

Total P2.1a scope = **3 `.agent/` files**.

## Forbidden-file audit

Each bucket verified against `git diff
--name-only origin/main..HEAD` for the P2.1a
impl commit scope (`68f0dc3`).

| bucket | status |
|---|---|
| `src/**` (any file) | ✓ CLEAN |
| `src/data/**` | ✓ CLEAN |
| `src/lib/prompts.ts` | ✓ CLEAN |
| `src/lib/models-display.ts` | ✓ CLEAN |
| `src/lib/corpus.ts` | ✓ CLEAN |
| `src/lib/web-bundle-stats.ts` | ✓ CLEAN |
| `src/lib/eval-report.ts` | ✓ CLEAN |
| `src/lib/extract-pdf.ts` | ✓ CLEAN |
| `src/app/api/**` | ✓ CLEAN |
| `src/app/**/page.tsx` | ✓ CLEAN |
| `src/components/**` | ✓ CLEAN |
| `.agent/scripts/**` (**hard rule**) | ✓ CLEAN |
| `.agent/policies/**` | ✓ CLEAN |
| `.agent/templates/**` | ✓ CLEAN |
| `.agent/blockers.md` | ✓ CLEAN |
| `.agent/automation_queue.md` | ✓ CLEAN |
| `.github/workflows/**` (web repo) | ✓ CLEAN |
| `package.json` | ✓ CLEAN |
| `package-lock.json` | ✓ CLEAN |
| `.env*` | ✓ CLEAN |
| `vercel.json` / `.vercel/**` | ✓ CLEAN |
| Codex / Claude config | ✓ CLEAN |
| **Pipeline repo (any file)** | ✓ CLEAN (HEAD = `b019786` at run start AND end) |
| `sources.yaml` (pipeline) | ✓ CLEAN |
| `corpus/**` (pipeline) | ✓ CLEAN |
| `scripts/collector/**` (pipeline) | ✓ CLEAN |
| Pipeline `.github/workflows/**` | ✓ CLEAN |

- **No collector invocation** (`python -m
  scripts.collector …` was NOT run).
- **No LLM call by this task** to external
  endpoints (the Explore subagent read
  files; it did not invoke `anthropic` or
  `openai` HTTP APIs on the product
  side).
- **No new dependency** added.
- **No manual `vercel deploy`** run.
- **No push** performed (P2.1a stays local
  until Bohao's explicit push instruction).
- **No blocker resolved.** BLK-0001 /
  BLK-0002 / BLK-0003 all still `open`.
- **No `sources.yaml` edit**.
- **No corpus refresh**.
- **No bundle swap** (`web_bundle.json`
  byte-identical).
- **No runtime model selection change**.
- **No prompt change**.
- **No OpenAI API introduced** (BLK-0003
  Q7-scoped boundary honored).

## Acceptance criteria — all 20 items PASS

- [x] Memo file exists at required path. ✓
- [x] Memo has all 10 required sections. ✓
      (11 H2 = 10 required + `Status`)
- [x] Memo ≥ 15 `path:line` cites. ✓ (56)
- [x] Executive verdict picks exactly one
      of three states. ✓ (promising but
      needs targeted improvement)
- [x] §9 has exactly 5 ranked candidates
      with all required per-candidate
      fields. ✓
- [x] §10 picks exactly one default
      (not two). ✓ (Candidate 1)
- [x] Memo does NOT recommend build-gate
      integration or codegen as default. ✓
- [x] Memo does NOT recommend G2.1d /
      automation-infra / OpenAI / BLK-0002
      / BLK-0003 as default. ✓
- [x] No `src/**` files modified. ✓
- [x] No `src/data/**` files modified. ✓
- [x] No prompt files modified. ✓
- [x] No API-route files modified. ✓
- [x] No pipeline repo modification. ✓
      (HEAD `b019786` start and end)
- [x] No collector invocation. ✓
- [x] No LLM call. ✓ (no external
      product-endpoint LLM invocation)
- [x] No `.agent/scripts/**` diff. ✓
- [x] No push, no manual deploy. ✓
- [x] RUN_REPORT lists all files inspected
      + audit verdict + top 5 risks +
      recommended next task. ✓
- [x] Forbidden-file audit clean (each
      bucket ✓). ✓
- [x] Pipeline repo untouched
      (`b019786` start and end). ✓

## Blockers touched: none

- **BLK-0001** (G2.1d red-zone) — still
  `open`. Not touched.
- **BLK-0002** (full automation activation)
  — still `open`. Not touched.
- **BLK-0003** (OpenAI API standing
  Q7-scoped) — still `open`. Not touched.
- QUEUE-0002 (G2.1d) — still
  `blocked_pending_human`.

## Automation window activity

`none`. Automation-infra remains paused per
AgentOps-2c Q10.

## Repo status

### Web

```
$ git log --oneline -6
68f0dc3 Add real report quality audit             ← this loop (impl)
07eae0b Update daily summary for P2.0c
dbfde5f Add DECISION 2026-07-07_run_01
c0c022b Add RUN_REPORT 2026-07-07_run_01
78434f0 Add web bundle stats drift check
ef7836b Update daily summary for P2.0b
```

Web is ahead of `origin/main` by **1
commit** at impl-commit time. After this
RUN_REPORT commit lands the branch will be
ahead by **2 commits**.

### Pipeline

```
$ git status
On branch main · up to date with 'origin/main' · clean

$ git log --oneline -3
b019786 Add G2.1 taxonomy eval set
f833bfd Add G2.1 taxonomy spec
65c3f9b Daily automated collection · 2026-06-28
```

Pipeline is **untouched**. HEAD =
`b019786` at run start AND end.

## Recommendation

**Human + ChatGPT review** this RUN_REPORT +
the audit memo → then decide whether to:

1. Accept the default (Candidate 1:
   stream-complete sentinel banner) and
   write DECISION via
   `python .agent/scripts/new_decision.py
   --task-id 2026-07-07_run_02`, then push,
   then Bohao starts a separate P2.1b
   TASK for the sentinel loop.
2. Pick a different candidate from §9
   (candidates 2-5).
3. Request memo changes (rebalance §9
   ranking, add missing dimension,
   sharpen §10).
4. Reject the memo (unlikely — no
   forbidden changes made).

Suggested DECISION verdict shape:
`approve`, `human_approval_needed: yes`
(for the eventual push; user-visible = no
because P2.1a is `.agent/`-only, same
class as P2.0a).
