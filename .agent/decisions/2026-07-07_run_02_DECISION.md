# DECISION · P2.1a real generated report quality audit

> Authored by ChatGPT (human-mediated) after
> reading the RUN_REPORT and the full audit
> memo. Scaffolded by
> `python .agent/scripts/new_decision.py
> --task-id 2026-07-07_run_02` (**seventeenth
> full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-07_run_02_DECISION`
- **based_on_run_report**:
  `.agent/run_reports/2026-07-07_run_02_RUN_REPORT.md`
- **based_on_design_memo**:
  `.agent/design_memos/2026-07-07_P2.1a_real_report_quality_audit.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-07_run_01_DECISION.md`
  (P2.0c) — no prior DECISION named P2.1a;
  this is the first entry point of the
  report-quality line.

## Verdict

`approve`

## Reasoning summary

P2.1a successfully produces a **no-code,
read-only audit** of the real generated report
experience and output-quality risks. The
audit's verdict, **"promising but needs
targeted improvement"**, is appropriate: the
current architecture appears worth keeping,
but the product has several credibility and
UX risks before the report can fully justify
the homepage promise. The highest-severity
finding is that **stream truncation can be
invisible to users** because the client
treats stream completion as success without
an explicit application-level completeness
signal. The audit also identifies
**quote-integrity risk**, **sample-report
versus real-report presentation mismatch**,
**empty-PDF handling risk**, and **eval
visibility risk**. The default next task —
**stream-complete sentinel plus an
incomplete-report banner** — is the right
first improvement because it is
high-severity, narrow, and affects every
generated report. The audit stayed within
scope: no code, prompts, API routes, model
selection, data, pipeline, OpenAI API,
`.agent/scripts`, push, or deploy changes.

Independent verification against the local
tree (both P2.1a commits: `68f0dc3` +
`3c8f7e5`):

- **Scope** (`git diff --name-only
  origin/main..HEAD`) = exactly the 3
  approved paths:
  `.agent/tasks/2026-07-07_run_02_TASK.md`,
  `.agent/design_memos/2026-07-07_P2.1a_real_report_quality_audit.md`,
  `.agent/run_reports/2026-07-07_run_02_RUN_REPORT.md`.
- **Memo structural check**: 740 lines
  (comparable to P2.0a's 718), 11 H2 sections
  (10 required + 1 `Status`), **56 unique
  `path:line` cites** across `src/app/page.tsx`,
  `src/lib/prompts.ts`, `src/lib/corpus.ts`,
  `src/app/api/generate-report/route.ts`,
  `src/app/api/eval-report/route.ts`,
  `src/lib/eval-report.ts`,
  `src/app/sample-report/page.tsx`,
  `src/app/methodology/page.tsx`,
  `src/lib/extract-pdf.ts`,
  `src/data/web_bundle.json`, — well above
  the 15-cite TASK minimum.
- Executive verdict picks exactly **one** of
  three states (not "it depends").
- §9 (next-task candidates) contains
  **exactly 5** ranked candidates, each with
  expected value / risk / files touched /
  green-yellow-red / human-approval /
  why-now-or-not.
- §10 (default recommendation) picks
  **exactly one** next task, not two:
  **Candidate 1 — Stream-complete sentinel +
  "report may be incomplete" banner**.
- Memo does NOT recommend build-gate
  integration or codegen (P2.0c DECISION
  §follow-ups "soak first" honored).
- Memo does NOT recommend G2.1d (BLK-0001),
  automation-infra resumption (Q10), OpenAI
  API usage (BLK-0003), or full automation
  activation (BLK-0002).
- **Forbidden empty diffs**:
  `src/**` ✓, `src/data/**` ✓,
  `src/lib/prompts.ts` ✓,
  `src/lib/models-display.ts` ✓,
  `src/lib/corpus.ts` ✓,
  `src/lib/web-bundle-stats.ts` ✓,
  `src/lib/eval-report.ts` ✓,
  `src/lib/extract-pdf.ts` ✓,
  `src/app/api/**` ✓,
  `src/app/**/page.tsx` ✓,
  `src/components/**` ✓,
  `.agent/scripts/**` ✓ (**hard rule**),
  `.agent/policies/**` ✓,
  `.agent/templates/**` ✓,
  `.agent/blockers.md` ✓,
  `.agent/automation_queue.md` ✓,
  `.github/workflows/**` ✓,
  `package.json` ✓,
  `package-lock.json` ✓,
  `.env*` ✓,
  `vercel.json` / `.vercel/**` ✓.
- **Pipeline repo** untouched — HEAD =
  `b019786` at start AND end. `git status`
  clean throughout. All inspection was
  read-only, via `git status` /
  `git log --oneline` and Explore-agent
  file reads on the web repo.
- **No collector invocation**.
- **No LLM call** to external product
  endpoints. The Explore subagent read
  files; no `anthropic` / `openai` HTTP
  invocation happened on the product side.
- **No new dependency** added; `package-lock.json`
  unchanged.
- **No runner / daemon / cron / scheduler /
  GH Actions / Codex config / Claude config
  / OpenAI SDK / manual deploy** anywhere.
- **Queue + blockers**: `automation_queue.md`
  and `blockers.md` not touched. QUEUE-0002
  still `blocked_pending_human` red.
  BLK-0001 / BLK-0002 / BLK-0003 all still
  `open`.

The work meets every Acceptance criterion in
the TASK (20 items, all verifiable per
RUN_REPORT). Approving on technical execution.
Push to `origin/main` remains a separate
human-approval gate per policy §3. This
push is **user-visibly a no-op** — no
`src/**` change, no `src/data/**` change,
only `.agent/`-only documentation lands on
`origin/main`.

## Key audit findings (independently verified)

- **Verdict**: promising but needs targeted
  improvement.
- **Architecture worth keeping**:
  evidence-grounded report design (5 evidence
  JDs with full bodies + top-18 skill pcts +
  seniority / top-company distributions
  fed to the report prompt);
  hallucination guardrails
  (`src/lib/prompts.ts:65-80` quantitative +
  company-specific claim rules with named
  forbidden examples); three-judge eval
  concept (groundedness / specificity /
  actionability at
  `src/lib/eval-report.ts:299-306`);
  conservative May 2026 corpus posture
  (methodology page + P2.0b `Corpus
  snapshot: May 14, 2026` chip).
- **Highest-severity risk**: silent stream
  truncation is currently invisible to the
  user. Reader loop
  (`src/app/page.tsx:542-550`) treats
  `reader.read().done === true` as
  success — a mid-stream Anthropic network
  wobble just paints "done" over a
  half-report with no user-visible signal.
- **Other major risks**: quote-attribution
  integrity is model-honor-only
  (`src/lib/prompts.ts:97-98` asks for real
  JD quotes but nothing substring-verifies
  them against the 5 supplied JD bodies);
  sample-report page is visually richer
  than the real streamed markdown output
  (`src/app/sample-report/page.tsx:115-337`
  colored gap medallions + 7-day plan grid
  vs. plain `<ReactMarkdown>` at
  `src/app/page.tsx:1284-1286`); empty PDF
  can silently become the résumé field
  (`unpdf` returns near-empty on scanned
  PDFs; `src/app/page.tsx:486-502` does
  `setResume(data.text)` on any 2xx);
  eval is user-invoked only
  (`src/app/page.tsx:1306-1315`) while
  homepage hero stats
  (`src/app/page.tsx:1519-1553`) are
  hardcoded aggregate numbers.
- **Default recommendation**: **Candidate 1
  — stream-complete sentinel + "report may
  be incomplete" banner** — highest severity
  fix, smallest narrow code change,
  every-user reach, composable with
  Candidates 2-5.
- **Important implementation nuance for the
  next task**: If the next task only
  changes `src/app/page.tsx`, it may not be
  enough to reliably know whether the
  server-side stream completed. A robust
  Candidate 1 implementation should inspect
  the actual stream protocol used by the
  `ai` SDK (`streamText().toTextStreamResponse()`
  at `src/app/api/generate-report/route.ts:94-100`),
  and may need a **narrow change to both
  `src/app/api/generate-report/route.ts`
  and `src/app/page.tsx`** — likely
  appending a sentinel token after
  `streamText` finishes on the server, and
  checking for it on the client after the
  reader closes. Prompt changes are NOT
  required and MUST NOT be introduced by
  the Candidate 1 task without a separate
  design decision. Client-only heuristics
  (e.g. "no trailing evidence appendix"
  fires the banner) are acceptable as a
  fallback but are strictly less
  authoritative than a server-emitted
  sentinel.
- **Do NOT start Candidate 1 in this turn.**
  Candidate 1 is a separate future TASK +
  DECISION loop.

## Risks found

1. **Silent stream truncation** can make
   incomplete reports look complete
   (`src/app/page.tsx:542-550`). Severity:
   **high** — top user-trust risk.
   Mitigation: Candidate 1.
2. **Quote attribution is still largely
   model-honor-based**
   (`src/lib/prompts.ts:97-98` vs. no
   substring-in-JD verifier in
   `src/lib/eval-report.ts:94-118`).
   Severity: **medium-high** for
   credibility. Mitigation: Candidate 2 (a
   separate future TASK).
3. **Sample-report presentation may oversell
   the richer visual experience** compared
   with real streamed markdown
   (`src/app/sample-report/page.tsx:115-337`
   vs. `src/app/page.tsx:1284-1286`).
   Severity: **medium** — promise-vs-delivery
   gap. Mitigation: Candidate 5 (audit-first
   memo, then optional yellow copy edit).
4. **Empty or near-empty PDF extraction may
   silently populate the résumé field**
   (`src/lib/extract-pdf.ts` +
   `src/app/page.tsx:486-502`).
   Severity: **medium** — reports grounded
   in nothing. Mitigation: Candidate 4
   (client-only `n_chars < N` gate).
5. **Eval is not inline by default**
   (`src/app/page.tsx:1306-1315`) **while
   visible trust metrics may feel stronger
   than the real runtime proof**
   (`src/app/page.tsx:1519-1553` hardcoded
   `0.93 / 0.83 / 0.82`). Severity:
   **medium**. Mitigation: candidate outside
   this §9's top-5 for now (auto-run eval
   could be a follow-up; not the default).
6. **The audit is read-only and does not fix
   any product behavior yet.** Severity:
   **acceptable by design** — audit ships
   the map; separate loops ship the fixes.
7. **The recommended next task (Candidate 1)
   may touch user-visible generation UX.**
   Yellow-loop risk class, same as
   P1.7b/c / P1.8a/b / P2.0b. Severity:
   **acceptable** with the standard
   scope-and-approve loop.
8. **A reliable stream-complete sentinel
   may require inspecting/changing both
   `src/app/api/generate-report/route.ts`
   and `src/app/page.tsx`.** This raises
   the Candidate 1 task from 1-file to
   2-file. Severity: **acceptable** — still
   a narrow yellow loop; must be scoped in
   its own TASK.
9. **Candidate 1 must avoid prompt changes
   unless separately approved.** Any prompt
   edit under the guise of "signaling
   completeness" (e.g. asking the model to
   append a special end token) crosses
   into report-behavior territory and
   requires its own DECISION. Severity:
   **guardrail** — flagged here so the
   future TASK cannot silently drift.
10. **Future quote-integrity checking
    (Candidate 2) may require a separate
    eval-path task** and interacts with the
    3-judge architecture. Severity:
    **acceptable** — scoped as a separate
    future loop.
11. **Future prompt or report-structure
    changes may become higher risk and
    should be separately scoped.** Any
    Candidate 3 (rubric) → prompt rewrite
    would jump from green to yellow-adjacent
    and needs explicit approval.
12. **G2.1d remains blocked by BLK-0001**
    (red-zone: classifier prompt rewrite +
    `CLASSIFIER_VERSION` bump). Severity:
    **n/a by design**.
13. **Full automation remains blocked by
    BLK-0002**. Severity: **n/a by design**.
14. **OpenAI API remains blocked by BLK-0003
    (Q7-scoped, standing)**. This task
    introduced no OpenAI API usage.
    Severity: **n/a by design**.

## Red-zone flags

`none` for P2.1a.

No `src/lib/prompts.ts`, no
`src/lib/anthropic.ts` (not present), no
`src/data/web_bundle.json`, no
`src/lib/corpus.ts`, no `src/app/api/**`
(runtime model selection), no
`package-lock.json`, no `.env*`, no
`vercel.json`, no `.vercel/**`, no
`.github/workflows/**` changed. No
pipeline-repo file changed at all — pipeline
inspection was read-only only. No Codex CLI
config, Claude Code config, or OpenAI SDK
introduced. No `.agent/scripts/**` edited
(hard rule per Q3-Q8 of AgentOps-2c
DECISION). No executable runner / shell
script / config / cron / hook file created
anywhere. No collector invocation. No LLM
call.

## Required fixes

`none`

Scope is clean (3 paths, all approved), the
audit memo hits every structural requirement
(11 H2 sections covering all 10 required +
`Status`, 740 lines, 56 `path:line` cites),
the executive verdict picks a single state
("promising but needs targeted
improvement"), §9 has exactly 5 ranked
candidates with full per-candidate fields,
§10 picks exactly one default (Candidate 1),
and no red-zone / forbidden / pipeline /
runner / OpenAI / config / executable /
`.agent/scripts` / prompts /
runtime-selection / data path was touched.
All 20 TASK acceptance criteria are
demonstrably met.

## Non-blocking follow-ups

- **After DECISION approval and push** →
  update daily summary. Extend
  `.agent/daily_summaries/2026-07-07_SUMMARY.md`
  with a P2.1a section documenting the
  2 commits, the audit verdict, the top 5
  risks, and Candidate 1 as the recommended
  default. This 2026-07-07 summary now
  covers BOTH P2.0c AND P2.1a.
- **Accept the audit's default next task
  direction**: stream-complete sentinel +
  incomplete-report banner. That TASK will
  likely touch both
  `src/app/api/generate-report/route.ts`
  and `src/app/page.tsx`; scope
  accordingly.
- **Do NOT start Candidate 1 in this
  DECISION turn**.
- **Do NOT modify prompts without a
  separate task.** Candidate 1 must not
  drift into prompt edits.
- **Do NOT modify report-generation API
  or page code** until the separate
  Candidate 1 TASK is explicitly started
  by Bohao.
- **Do NOT run collector** as a side
  effect.
- **Do NOT refresh corpus**.
- **Do NOT swap `web_bundle.json`**.
  P2.0a memo §7 gate 2
  (`unique_companies ≥ 35`) still
  arithmetically blocks today's pipeline
  bundle.
- **Do NOT modify pipeline files.**
  `sources.yaml`, `corpus/**`,
  `scripts/collector/**`,
  `.github/workflows/**` all stay frozen.
- **Do NOT modify `src/data/**`.**
- **Do NOT start G2.1d.** BLK-0001 still
  `open`.
- **Do NOT resume automation-infra.** Per
  AgentOps-2c Q10, automation-infra is
  paused; product/tooling work continues.
- **Do NOT introduce OpenAI API** in any
  Q7 blocked sense.
- **Do NOT deploy manually.** Vercel
  auto-deploy from the eventual push is
  the only sanctioned deploy path.
- **Do NOT modify `.agent/scripts/**`**
  (hard rule per AgentOps-2c Q3-Q8).

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay on
   `main` of the pipeline repo.
2. Do NOT push either repo. The web repo will
   be ahead of origin/main by 3 commits at
   that point (`68f0dc3` impl + `3c8f7e5`
   RUN_REPORT + this DECISION); push requires
   Bohao's explicit "push P2.1a" instruction.
   **This push is user-visibly a NO-OP** —
   no `src/**` runtime path changed, only
   `.agent/`-only documentation lands.
3. Do NOT deploy manually. Vercel auto-deploy
   from the eventual push handles this.
4. Do NOT start Candidate 1 (stream-complete
   sentinel + incomplete-report banner) yet.
   The DECISION recommends Candidate 1 as
   the next code loop but it is a separate
   TASK with its own scope-and-approve
   loop. Start Candidate 1 only after
   Bohao's explicit "start Candidate 1"
   (or similarly named) instruction.
5. Do NOT edit code, do NOT edit prompts,
   do NOT edit API routes, do NOT edit
   model selection.
6. Do NOT run collector. No `python -m
   scripts.collector …`, no `dry-run`, no
   `clean-preview`, no `run`.
7. Do NOT refresh corpus. `web_bundle.json`
   / `web_bundle_pipeline.json` /
   `web_bundle_staging.json` all stay
   frozen.
8. Do NOT modify pipeline files.
   `sources.yaml`, `corpus/**`,
   `scripts/collector/**`,
   `.github/workflows/**` all stay frozen.
9. Do NOT modify `src/data/**`. Bundle
   in the web repo stays frozen.
10. Do NOT modify `.agent/scripts/**`.
    Hard rule per AgentOps-2c Q3-Q8.
11. Do NOT start G2.1d. BLK-0001 still
    `open`.
12. Do NOT resume automation-infra. Q10
    pause continues.
13. Do NOT introduce OpenAI API in any
    Q7 blocked sense.
14. Do NOT modify runtime model selection
    (`src/app/api/**` stays frozen).
15. Do NOT modify prompts
    (`src/lib/prompts.ts` stays frozen).
16. Do NOT modify existing npm scripts or
    add any new npm dependency without a
    separate TASK + DECISION loop.
17. Do NOT lift any of the 3 open blockers
    (BLK-0001 / BLK-0002 / BLK-0003)
    without explicit written human
    resolution.

When Bohao explicitly starts the Candidate 1
TASK, its scope should:
- likely touch BOTH
  `src/app/api/generate-report/route.ts`
  AND `src/app/page.tsx` — a narrow
  yellow loop that appends a sentinel
  token after `streamText` finishes on the
  server, checks for it on the client
  after the reader closes, and shows a
  small "report may be incomplete — retry"
  banner if the sentinel is missing.
- explicitly AVOID prompt changes (the
  sentinel goes AFTER the model's markdown,
  not by asking the model to emit
  anything).
- explicitly AVOID any src/data / bundle /
  corpus / pipeline / collector / OpenAI
  / `.agent/scripts` / `.github/workflows`
  change.

The next likely promote step is:
- `git push origin main` from the web repo
  (3 commits land on `origin/main`:
  `68f0dc3` + `3c8f7e5` + this DECISION).
  Vercel auto-deploys but produces no
  user-visible change.
- Then extend
  `.agent/daily_summaries/2026-07-07_SUMMARY.md`
  with a P2.1a section; commit + push.
- Then, per this DECISION's follow-up,
  the natural next step is **Candidate 1
  · stream-complete sentinel +
  incomplete-report banner** as a
  separate future TASK + DECISION.

Wait for Bohao's explicit "push P2.1a"
before doing anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of
  `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which will deliver 3 commits — `68f0dc3`
  (impl), `3c8f7e5` (RUN_REPORT), and
  this DECISION commit once it lands).
  This push triggers Vercel auto-deploy
  but is **user-visibly a no-op** — no
  runtime code path or product surface
  changed; only `.agent/`-only
  documentation lands.
- Authoring the daily summary cleanup
  commit (extend
  `.agent/daily_summaries/2026-07-07_SUMMARY.md`
  with a P2.1a section).
- Starting Candidate 1
  (stream-complete sentinel banner) or
  any of Candidates 2-5.
- Any pipeline file edit
  (`sources.yaml`, `corpus/**`,
  `scripts/collector/**`,
  `.github/workflows/**`).
- Any `src/data/**` edit.
- Any collector run (`python -m
  scripts.collector …`).
- Any corpus refresh.
- Any `.agent/scripts/**` mod.
- Any AgentOps-2* work (per Q10 pause).
- Any runtime model-selection change
  (`src/app/api/**` frozen until
  Candidate 1 is explicitly authorized).
- Any prompt change (`src/lib/prompts.ts`
  frozen).
- Any new npm dependency or
  `package-lock.json` change.
- Any G2.1d (red) work.
- Any OpenAI API usage in Q7 blocked
  sense.
- Any manual `vercel deploy`.
- Lifting any of the 3 open blockers
  (BLK-0001 / BLK-0002 / BLK-0003).

> Verdict is `approve` for technical
> execution captured in the RUN_REPORT +
> the audit memo. Standing policy treats
> any `main` push as a human gate. This
> push additionally is user-visibly a
> no-op — only `.agent/` documentation
> lands.
>
> Approving this DECISION:
>
> - Records the P2.1a audit memo as a
>   `reviewed_approved` design document
>   for the report-quality track.
> - Endorses the executive verdict
>   ("promising but needs targeted
>   improvement").
> - Endorses Candidate 1 (stream-complete
>   sentinel + incomplete-report banner)
>   as the recommended next code loop.
> - Records the implementation-nuance
>   guardrail: Candidate 1's TASK should
>   likely touch both
>   `src/app/api/generate-report/route.ts`
>   AND `src/app/page.tsx`; prompt
>   changes are OUT of scope for that
>   TASK without a separate design
>   decision.
>
> Approving does NOT approve: (a) starting
> Candidate 1 (or any of Candidates 2-5)
> — each is its own TASK + DECISION,
> (b) any pipeline file edit, (c) any
> bundle swap, (d) any collector run,
> (e) any AgentOps-2* work, (f) any
> `.agent/scripts/**` mod, (g) any
> runtime model-selection change or
> prompt change, (h) any OpenAI API
> usage in Q7 blocked sense, (i) G2.1d,
> (j) lifting any of the 3 open
> blockers. Each of those remains its own
> explicit human decision. The next step
> is Bohao's explicit call on the push.
