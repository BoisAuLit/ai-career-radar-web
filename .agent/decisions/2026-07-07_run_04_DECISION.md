# DECISION · Candidate 4 empty PDF client-side gate

> Authored by ChatGPT (human-mediated) after
> reading the RUN_REPORT + the `page.tsx` diff
> + the read-only extract-pdf route and lib.
> Scaffolded by
> `python .agent/scripts/new_decision.py
> --task-id 2026-07-07_run_04` (**nineteenth
> full loop** using the helper triple).

## Metadata

- **decision_id**: `2026-07-07_run_04_DECISION`
- **based_on_run_report**:
  `.agent/run_reports/2026-07-07_run_04_RUN_REPORT.md`
- **based_on_prior_decision**:
  `.agent/decisions/2026-07-07_run_02_DECISION.md`
  (P2.1a) — endorses Candidate 4 as a
  green-adjacent client-only fix.
- **based_on_design_memo**:
  `.agent/design_memos/2026-07-07_P2.1a_real_report_quality_audit.md`

## Verdict

`approve`

## Reasoning summary

Candidate 4 successfully addresses the
**empty or near-empty PDF extraction risk**
identified in P2.1a. The implementation
stays narrow and client-side: if PDF
extraction produces fewer than 300 trimmed
characters, the app no longer silently
overwrites the résumé field or shows a
successful filename chip. Instead, it
displays a clear amber warning asking the
user to paste résumé text manually or
upload a text-selectable PDF. Successful
text-selectable PDF extraction and manual
paste flows remain unchanged. The task
did not modify backend PDF extraction,
prompts, report generation, model
selection, eval logic, data, pipeline,
OpenAI API setup, GitHub Actions, or
`.agent/scripts`. Build, screenshot, and
web-bundle drift validation passed; lint
remains a pre-existing baseline issue.

Independent verification against the
local tree (both commits: `6bca6b1` +
`1f860bf`):

- **Scope** (`git diff --name-only
  origin/main..HEAD`) = exactly the 3
  approved paths:
  `.agent/tasks/2026-07-07_run_04_TASK.md`,
  `src/app/page.tsx`,
  `.agent/run_reports/2026-07-07_run_04_RUN_REPORT.md`.
- **`page.tsx` changes verified** (~42
  lines added, 2 removed):
  - `MIN_EXTRACTED_RESUME_CHARS = 300`
    constant added near
    `STREAM_COMPLETE_SENTINEL` with a
    doc comment justifying the value
    (real résumé PDFs → thousands of
    chars; scanned/image PDFs → <50
    chars; 300 is comfortably in
    between).
  - `EMPTY_PDF_WARNING` constant with
    the exact suggested wording,
    referenced by both the state
    setter and the banner render (no
    string duplication).
  - New state
    `[pdfExtractionWarning,
    setPdfExtractionWarning]` next to
    existing `pdfErr`.
  - `handlePdfUpload` now clears both
    `setPdfErr("")` and
    `setPdfExtractionWarning("")` at
    the top; trims `data.text`;
    computes `extractedText.length`;
    on below-threshold returns early
    with only
    `setPdfExtractionWarning(EMPTY_PDF_WARNING)`
    set (no `setResume`, no
    `setPdfFilename`, no `setPdfErr`);
    on above-threshold sets
    `setResume(extractedText)` +
    `setPdfFilename(data.filename)`.
  - Reset points confirmed at
    `handleSubmit` start,
    `handleStartOver`, `loadSample`.
  - Résumé `<textarea>` `onChange`
    now wraps `setResume(next)` and,
    when `pdfExtractionWarning` is
    currently non-empty and
    `next.trim().length >= 300`,
    clears the warning.
  - Amber banner rendered next to
    the existing red `pdfErr` panel
    with `border-amber-200 bg-amber-50
    text-amber-900` styling and a
    `⚠` prefix — visually distinct
    from server-error red.
- **Backend untouched** (read-only
  verification):
  - `src/app/api/extract-pdf/route.ts` —
    response shape confirmed
    `{ text, n_chars, filename }`,
    5 MB limit, `.pdf` MIME check, 4
    error codes (400/413/500). No
    edits.
  - `src/lib/extract-pdf.ts` —
    `unpdf` with `mergePages: true`,
    joins pages, trims. No edits, no
    OCR added.
- **Server-error path preserved**: the
  red `pdfErr` panel still fires on
  413 / 400 / 500 — those short-
  circuit via `if (!res.ok)` before
  reaching the new gate.
- **Above-threshold path preserved**:
  legitimate text-selectable PDFs
  populate the résumé exactly as
  before (with a stricter trim, which
  is a no-op for well-formed
  extractions since the server
  already trims).
- **Manual paste flow preserved**: the
  résumé `<textarea>` `onChange`
  still accepts arbitrary input; the
  only new behavior is the warning
  auto-clearing when the user's typed
  content crosses back above the
  threshold.
- **Submit button behavior unchanged**:
  the existing `!resume.trim()` guard
  in `handleSubmit` (and the button's
  `disabled` prop) is untouched. This
  is acceptable because near-empty
  extracted PDFs no longer populate
  the résumé field as if the upload
  had succeeded — the résumé stays
  empty (or whatever the user had
  pasted), so the existing guard
  naturally prevents "generate on
  garbage".
- **Forbidden empty diffs**:
  `src/app/api/extract-pdf/**` ✓ (**hard**),
  `src/lib/extract-pdf.ts` ✓ (**hard**),
  `src/lib/prompts.ts` ✓,
  `src/lib/corpus.ts` ✓,
  `src/lib/eval-report.ts` ✓,
  `src/lib/models-display.ts` ✓,
  `src/lib/web-bundle-stats.ts` ✓,
  `src/app/api/generate-report/**` ✓,
  `src/app/api/eval-report/**` ✓,
  `src/app/api/classify/**` ✓,
  `src/app/api/companies/**` ✓,
  `src/data/**` ✓,
  `src/app/methodology/**` ✓,
  `src/app/sample-report/**` ✓,
  `src/app/snapshot-pipeline/**` ✓,
  `src/components/**` ✓,
  `.agent/scripts/**` ✓ (**hard rule
  per AgentOps-2c Q3-Q8**),
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
  `b019786` at start AND end. `git
  status` clean throughout.
- **No collector invocation**.
- **No LLM call** by this task.
- **No new npm dependency** (no OCR
  library added). `package-lock.json`
  unchanged.
- **No runner / daemon / cron /
  scheduler / GH Actions / Codex
  config / Claude config / OpenAI SDK
  / manual deploy** anywhere.
- **Model selection unchanged**:
  `claude-sonnet-4-6` in
  `generate-report/route.ts` and
  `claude-haiku-4-5-20251001` in
  `eval-report.ts` both untouched.
- **Queue + blockers**:
  `automation_queue.md` and
  `blockers.md` not touched.
  QUEUE-0002 still
  `blocked_pending_human` red.
  BLK-0001 / BLK-0002 / BLK-0003 all
  still `open`.
- **Validation confirmed**: `npm run
  build` PASS (14 static pages) ·
  `npm run lint` 37 baseline
  errors, **none new** · `npm run
  check:web-bundle-stats` PASS 6/6 ·
  `npm run screenshot` 15/15 ok
  (warning is conditional; default
  homepage correctly does not show
  the banner because no PDF upload
  has occurred in a static build).

The work meets every Acceptance criterion
in the TASK (35 items, all verifiable per
RUN_REPORT and live diff review).
Approving on technical execution. Push to
`origin/main` remains a separate
human-approval gate per policy §3. This
push produces a **user-visible change
only in the rare scanned/near-empty-PDF
case** — an amber warning appears above
the résumé textarea, and the résumé
state is NOT overwritten. Happy path
(text-selectable PDF, manual paste,
preset persona) is byte-identical for
users.

## Threshold chosen and behavior

- **`MIN_EXTRACTED_RESUME_CHARS = 300`**
  chars, measured on
  `data.text?.trim()`.
- Justification (from
  RUN_REPORT §"Threshold chosen and
  why"):
  - Real résumé PDF extraction is
    typically several kilobytes.
  - Scanned/image PDFs from `unpdf`
    typically yield <50 chars of
    header-metadata garbage.
  - 300 is a conservative floor that
    catches the trust gap while
    keeping any legitimate résumé
    (even a short one) safely
    above it.
- If real usage surfaces a false
  positive (a legitimately tiny
  résumé), a future yellow tuning
  loop can lower the value or
  introduce a "use anyway" override.

## Warning behavior (verbatim)

- Warning copy (exact string in
  `EMPTY_PDF_WARNING`, referenced by
  both state setter and banner render):
  > This PDF produced very little
  > readable text. It may be scanned
  > or image-only. Please paste your
  > resume text manually or upload
  > a text-selectable PDF before
  > generating a report.
- Banner render: amber styling
  (`border-amber-200 bg-amber-50
  text-amber-900`), `⚠` icon
  prefix, positioned above the
  résumé `<textarea>` and directly
  below the existing red `pdfErr`
  panel — visually distinct from
  server errors.
- Behavior — **above-threshold PDF**:
  résumé populated with trimmed
  text, filename chip set, amber
  warning cleared, red `pdfErr`
  cleared. Same as pre-Candidate-4
  behavior.
- Behavior — **below-threshold PDF**:
  résumé NOT overwritten, filename
  chip NOT set, red `pdfErr` NOT
  set (this is not a server error),
  amber warning shown. The résumé
  state is byte-identical to what
  it was immediately before the
  upload attempt.
- Behavior — **server error (413 /
  400 / 500)**: existing red
  `pdfErr` panel fires as before;
  amber warning cleared.
- Behavior — **manual paste**:
  résumé `<textarea>` `onChange`
  accepts arbitrary input; if the
  amber warning is currently
  showing AND the newly-typed
  résumé's trimmed length crosses
  back above 300, the warning
  auto-clears.
- Submit button behavior
  **unchanged**: existing
  `!resume.trim()` guard prevents
  generation on empty résumé; near-
  empty extracted PDFs no longer
  populate the field as if the
  upload had succeeded, so the
  guard naturally covers this new
  path without extra submit-time
  logic.

## Risks found

1. **This is a user-visible upload
   UX change for near-empty PDF
   extraction cases.** Severity:
   **low** — the change is small,
   conservative, and only appears
   when a scanned/image PDF is
   selected. Mitigation: standard
   push gate + Vercel auto-deploy.
2. **The 300-character threshold is
   heuristic and may need tuning
   after real usage.** Severity:
   **low**. Mitigation: value is a
   single named constant in
   `page.tsx`; a future yellow loop
   can change it without touching
   anything else.
3. **Very short but valid résumés
   could theoretically trigger the
   warning.** Severity: **low** —
   a résumé shorter than 300
   trimmed characters is atypical
   for the product's target user
   base (senior engineers moving
   into AI). Mitigation: same as
   above (threshold tuning) plus
   users can paste text manually
   as an override.
4. **The task does not add OCR**,
   so scanned PDFs still require
   manual paste or a text-
   selectable PDF. Severity: **n/a
   by design** — OCR would be a
   separate future TASK and would
   need dependency + backend
   changes.
5. **The task does not improve
   backend extraction quality.**
   Severity: **n/a by design** —
   Candidate 4 is scoped as a
   client-only gate.
6. **The task gates PDF-to-
   résumé population, not every
   possible low-quality manual
   paste.** Severity: **acceptable
   by design** — Candidate 4
   targets the "silent empty PDF"
   trust gap called out in P2.1a
   §7. Low-quality manual pastes
   are still a possible failure
   mode but represent a different
   risk class handled by future
   candidates.
7. **Submit button behavior remains
   unchanged.** Severity:
   **acceptable** — this is
   correct because near-empty
   extracted PDFs no longer
   populate the résumé field as
   a successful extraction, so
   the existing `!resume.trim()`
   guard naturally blocks
   generation on garbage.
8. **Warning copy may need UX
   tuning after real user
   feedback** — phrasing like
   "very little readable text" is
   intentionally conservative but
   may read differently to
   different users. Severity:
   **low**. Mitigation: copy tweak
   is a small future yellow loop.
9. **No automated upload
   interaction test was added.**
   Severity: **low-medium** — the
   behavior is testable (mock an
   `/api/extract-pdf` response
   returning a short text field),
   but adding test infrastructure
   was out of scope. Mitigation:
   Candidate 4 follow-up TASK
   could add a small test suite.
10. **This task does not address
    quote-integrity checking**
    (Candidate 2 from P2.1a §9).
11. **This task does not address
    sample-report vs real-report
    visual mismatch** (Candidate 5
    from P2.1a §9).
12. **This task does not make eval
    inline** — eval remains user-
    invoked via `📊 Eval this
    report`.
13. **G2.1d remains blocked by
    BLK-0001**. Severity: **n/a
    by design**.
14. **Full automation remains
    blocked by BLK-0002**.
    Severity: **n/a by design**.
15. **OpenAI API remains blocked
    by BLK-0003 (Q7-scoped,
    standing)**. This task
    introduced no OpenAI API
    usage. Severity: **n/a by
    design**.

## Red-zone flags

`none` for Candidate 4.

No `src/lib/prompts.ts`, no
`src/lib/anthropic.ts` (not present),
no `src/data/web_bundle.json`, no
`src/lib/corpus.ts`, no
`src/app/api/**` route (all runtime
routes unchanged), no
`src/lib/extract-pdf.ts`, no
`src/app/api/extract-pdf/**`, no
`package.json`, no
`package-lock.json`, no `.env*`, no
`vercel.json`, no `.vercel/**`, no
`.github/workflows/**` changed. No
pipeline-repo file changed at all —
pipeline inspection was read-only
only. No Codex CLI config, Claude
Code config, or OpenAI SDK
introduced. No `.agent/scripts/**`
edited (hard rule per Q3-Q8 of
AgentOps-2c DECISION). No executable
runner / shell script / config /
cron / hook file created anywhere.
No collector invocation. No LLM
call. No new npm dependency. No
OCR library added. No manual deploy.

## Required fixes

`none`

Scope is clean (3 paths, all
approved), the gate is entirely
client-side, backend extraction is
byte-identical, the threshold has a
named constant with a doc-comment
justification, the warning message
lives in a named constant so both
state and render use the same
string, all four behavior paths
(above-threshold / below-threshold
/ server-error / manual paste)
work correctly, all reset points
clear the warning, the résumé
`<textarea>` `onChange` gains a
guarded state-clear that avoids
setting state on every keystroke,
and no forbidden / red-zone /
pipeline / runner / OpenAI /
config / executable /
`.agent/scripts` / prompts /
runtime-selection / data path was
touched. All 35 TASK acceptance
criteria are demonstrably met per
RUN_REPORT and live diff review.

## Non-blocking follow-ups

- **After DECISION approval and
  push** → update daily summary.
  Extend
  `.agent/daily_summaries/2026-07-07_SUMMARY.md`
  with a Candidate-4 section
  documenting the 2 commits, the
  threshold value, the exact
  warning copy, the 4-path
  behavior matrix, and
  confirmation that the happy
  path is user-visibly unchanged.
- **Let Candidate 4 soak in real
  usage** before deciding on any
  threshold or copy tuning.
- **Consider threshold or copy
  tuning only after real
  feedback** — if false positives
  appear, lower the value; if
  users don't understand the
  banner, tweak the copy. Both
  are small future yellow loops.
- **Consider Candidate 2 later**:
  quote-integrity substring check
  on the eval path (P2.1a §9
  candidate 2). Separate future
  TASK + DECISION loop.
- **Do NOT start Candidate 2 in
  this DECISION turn.**
- **Do NOT add OCR.** OCR would
  be a separate red-adjacent
  decision (new dependency +
  backend change).
- **Do NOT modify backend PDF
  extraction** without a separate
  task.
- **Do NOT modify prompts** without
  a separate task.
- **Do NOT modify
  `generate-report`.**
- **Do NOT modify model
  selection.**
- **Do NOT run collector.**
- **Do NOT refresh corpus.**
- **Do NOT swap `web_bundle.json`.**
  P2.0a memo §7 gate 2
  (`unique_companies ≥ 35`)
  still arithmetically blocks
  today's pipeline bundle.
- **Do NOT modify pipeline
  files.**
- **Do NOT modify `src/data/**`.**
- **Do NOT start G2.1d.**
  BLK-0001 still `open`.
- **Do NOT resume
  automation-infra.** Per
  AgentOps-2c Q10.
- **Do NOT introduce OpenAI API**
  in any Q7 blocked sense.
- **Do NOT deploy manually.**
  Vercel auto-deploy from the
  eventual push is the only
  sanctioned path.
- **Do NOT modify
  `.agent/scripts/**`** (hard
  rule).

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

After this DECISION is committed:

1. Stay on `main` of the web repo. Stay
   on `main` of the pipeline repo.
2. Do NOT push either repo. The web
   repo will be ahead of origin/main by
   3 commits at that point (`6bca6b1`
   impl + `1f860bf` RUN_REPORT + this
   DECISION); push requires Bohao's
   explicit "push Candidate 4" (or
   similar) instruction. This push
   will trigger Vercel auto-deploy;
   the user-visible change appears
   ONLY when a scanned/near-empty
   PDF is uploaded (amber warning
   above the résumé textarea; résumé
   state not overwritten). Happy path
   is invisible.
3. Do NOT deploy manually. Vercel
   auto-deploy from the eventual
   push handles this.
4. Do NOT start Candidate 2
   (quote-integrity substring check
   on eval path) yet. It is a
   separate future TASK + DECISION
   loop.
5. Do NOT add OCR. That is a
   separate red-adjacent decision.
6. Do NOT modify backend PDF
   extraction (`src/app/api/extract-pdf/**`
   and `src/lib/extract-pdf.ts`
   remain frozen).
7. Do NOT edit prompts
   (`src/lib/prompts.ts` stays
   frozen).
8. Do NOT edit `generate-report`
   or any other API route.
9. Do NOT edit model selection.
10. Do NOT run collector. No
    `python -m scripts.collector …`,
    no `dry-run`, no
    `clean-preview`, no `run`.
11. Do NOT refresh corpus.
    `web_bundle.json` /
    `web_bundle_pipeline.json` /
    `web_bundle_staging.json` all
    stay frozen.
12. Do NOT modify pipeline files.
    `sources.yaml`, `corpus/**`,
    `scripts/collector/**`,
    `.github/workflows/**` all
    stay frozen.
13. Do NOT modify `src/data/**`.
14. Do NOT modify
    `.agent/scripts/**`. Hard rule
    per AgentOps-2c Q3-Q8.
15. Do NOT start G2.1d. BLK-0001
    still `open`.
16. Do NOT resume automation-infra.
    Q10 pause continues.
17. Do NOT introduce OpenAI API in
    any Q7 blocked sense.
18. Do NOT add any new npm
    dependency or `package.json`
    entry.
19. Do NOT lift any of the 3 open
    blockers (BLK-0001 / BLK-0002 /
    BLK-0003) without explicit
    written human resolution.

The next likely promote step is:
- `git push origin main` from the
  web repo (3 commits land on
  `origin/main`: `6bca6b1` +
  `1f860bf` + this DECISION).
  Vercel auto-deploys; user-visible
  change appears only in the rare
  scanned-PDF case.
- Then extend
  `.agent/daily_summaries/2026-07-07_SUMMARY.md`
  with a Candidate-4 section;
  commit + push.
- Then, per this DECISION's
  follow-up, the natural options are
  (a) let Candidate 4 soak in real
  usage before deciding on any
  tuning, or (b) start Candidate 2
  (quote-integrity substring check)
  as a separate loop after explicit
  approval.

Wait for Bohao's explicit
"push Candidate 4" before doing
anything state-changing.
```

## Human approval needed

`yes` — required before:

- Web repo push (`origin/main` of
  `/Users/bohaoli/Desktop/ai-career-radar-web`,
  which will deliver 3 commits —
  `6bca6b1` (impl), `1f860bf`
  (RUN_REPORT), and this DECISION
  commit once it lands). This push
  triggers Vercel auto-deploy and
  produces a **user-visible change
  only in the rare scanned-PDF
  case** (amber warning above the
  résumé textarea). Happy path is
  user-visibly unchanged.
- Authoring the daily summary
  cleanup commit (extend
  `.agent/daily_summaries/2026-07-07_SUMMARY.md`
  with a Candidate-4 section).
- Starting Candidate 2 (quote-
  integrity substring check on
  eval path).
- Starting any other P2.1
  candidate or a threshold /
  copy tuning loop.
- Adding OCR.
- Any backend PDF extraction
  change.
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
- Lifting any of the 3 open
  blockers (BLK-0001 / BLK-0002 /
  BLK-0003).

> Verdict is `approve` for
> technical execution captured in
> the RUN_REPORT and the
> `page.tsx` diff. Standing policy
> treats any `main` push as a
> human gate. This push produces a
> user-visible change only in the
> rare scanned-PDF case; happy
> path is byte-identical for
> users.
>
> Approving this DECISION:
>
> - Records the Candidate 4 impl
>   as technically correct
>   (client-side gate; below-
>   threshold path preserves
>   résumé state and does not
>   claim a successful upload;
>   above-threshold path
>   unchanged from prior
>   behavior; server-error path
>   preserved; manual-paste
>   flow preserved with
>   auto-clearing warning).
> - Endorses the 300-char
>   threshold as a conservative
>   starting value; endorses
>   the "tune only after real
>   feedback" cadence.
> - Records the "no OCR, no
>   backend change" scope
>   guardrail for any future
>   Candidate 4 follow-up.
>
> Approving does NOT approve:
> (a) starting Candidate 2
> (quote-integrity check) or
> any other P2.1 candidate,
> (b) adding OCR, (c) any
> backend PDF extraction
> change, (d) any pipeline
> file edit, (e) any bundle
> swap, (f) any collector run,
> (g) any AgentOps-2* work,
> (h) any `.agent/scripts/**`
> mod, (i) any runtime
> model-selection change or
> prompt change, (j) any new
> npm dependency or lockfile
> change, (k) any OpenAI API
> usage in Q7 blocked sense,
> (l) G2.1d, (m) lifting any
> of the 3 open blockers.
> Each of those remains its
> own explicit human
> decision. The next step is
> Bohao's explicit call on
> the push.
