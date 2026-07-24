# Design memo · AgentOps-5e-followup-prompt-refinement-design · Mandatory exact-evidence structure

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-prompt-refinement-design
- **parent_loop**: AgentOps-5e-followup-prompt-tune-implement (`2026-07-24_run_01` · rejected as implemented, rolled back)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_01_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_02_TASK.md`
- **cost**: **$0**

## 1 · Purpose

Design (but not implement) a refined report prompt contract that
simultaneously guarantees **mandatory evidence citation structure**
AND **exact quote faithfulness**, without changing code or running
generation.

## 2 · Prior negative experiment

`AgentOps-5e-followup-prompt-tune-implement` (`2026-07-24_run_01`)
added a verbatim/no-paraphrase/self-check block to
`reportSystemPrompt`. Fixture A + Fixture B both completed legacy
GREEN but dropped Evidence Appendix and produced **0** recognized
`Evidence quote:` citations. `jd_000201` was **avoided, not
repaired**. `fabricated_or_unmatched_quotes = 0` only because no
citation-format quotes were emitted to check. Result: **Outcome B/C —
prompt ineffective with structural regression**. DECISION verdict
was `revise`; the patch was fully rolled back (commit `3957e87`)
before push.

## 3 · What was rolled back

- `src/lib/prompts.ts` restored to `origin/main` byte-for-byte.
- `scripts/test-evidence-quote-contract.mjs` removed.
- Effective `src/**` and `scripts/**` diff vs `origin/main` = empty.
- A/B negative experiment artifacts retained as immutable evidence.

## 4 · Scope

Design only. No code change. No prompt change. No generation. No
fixture run. No LLM/API call. Cost $0.

## 5 · What was NOT run

- No Fixture A / B / C / D / E
- No harness / Playwright / dev server
- No Anthropic / OpenAI call
- No prompt or code change (design only)
- No checker / parser / harness change
- No `.agent/scripts/**` change
- No pipeline / package / config / workflow change
- No baseline mutation or promotion
- No `AgentOps-5f-promote`

## 6 · Omission mechanism

The model did NOT stop double-quoting entirely — post-patch runs
still produced 19-21 `quote_candidates`. The model stopped using the
recognized `Evidence quote: "TEXT" — Company, jd_XXXXXX.` citation
format AND dropped the Evidence Appendix. Both signal the same
choice: the model treated the recognized citation apparatus as
**risky-to-comply-with** under the new constraints and chose
**omission** as the safest compliance path.

## 7 · Supported findings vs inference vs unknowns

### Supported (from A/B run artifacts)

- Post-patch A `evidence_entries` dropped **5 → 0** vs pre-patch A
  stability.
- Post-patch B `evidence_entries` dropped **5 → 0** vs pre-patch B
  diagnostics.
- Both post-patch runs continued producing 19-21 double-quoted spans
  (model did not stop quoting; it stopped using the recognized
  citation format).
- Both post-patch runs dropped the Evidence Appendix entirely.
- No checker / parser / harness change occurred; the shape change is
  entirely on the model-generation side.
- R2 fires dropped to 0 in both post-patch runs, consistent with zero
  recognized citation quotes (not a checker defect).

### Plausible inferences

- The patch's DO NOT clauses (paraphrase, grammar repair, ellipsis,
  word add/remove) combined with the exact-substring self-check made
  citation-format emission feel risky.
- The self-check clause `"If it does not, shorten or replace it with
  an exact contiguous source span"` — the word **replace** left
  omission as a valid substitution path.
- Pre-existing prompt language was permissive: line 79 uses
  "allowed", line 95 uses "if useful", line 119 uses "End the report
  with a short evidence appendix". None of these are MUST.
- The model chose the safest compliance path: omit rather than risk
  emitting a non-exact citation-format line.

### Unknowns

- Whether other Sonnet 4.6 samples (different temperature / system
  placement) would show the same behavior.
- Whether the Appendix would have been dropped without the self-check
  clause specifically (only the combined patch was tested).
- Whether a positive-mandatory-example approach alone (without the
  DO NOT clauses) would suffice.
- Whether omission is stable across many runs or a probabilistic edge
  case.

## 8 · Current structural contract

`src/lib/prompts.ts::reportSystemPrompt` (origin/main) instructions
governing evidence structure:

| line | text | mandatory? |
|---|---|---|
| 79 | `Allowed: quoting language from a specific JD` | permissive |
| 95 | `quote a phrase if useful` | permissive |
| 97 | `One evidence quote from a real JD (give the company)` | implied via top-5 gaps template, not labeled MUST |
| 119 | `End the report with a short evidence appendix` | permissive |

**Gaps**: no `MUST` for any evidence element; no minimum count; no
explicit `## Evidence Appendix` heading; no prohibition against
omission; no requirement to shorten instead of omit; positive
example absent; citation-line format specification lives only in the
checker regex, not in the prompt.

## 9 · Current faithfulness contract

The origin/main prompt has **no** faithfulness contract at all — no
verbatim requirement, no exactness expectation, no ellipsis
prohibition. Model relies on general "quoting language from a
specific JD" wording and its own defaults for what "quote" means.
This is exactly why `jd_000201` R1 grammar-bridging emerged over
5c/5d runs.

## 10 · Escape path used by the model

Two paths compounded:

1. **Permissive origin/main structural language** — nothing labeled
   MUST for evidence lines or Appendix; model was always free to
   omit.
2. **Rejected patch's "or replace" self-check clause** — presented
   omission-substitution as a valid compliance path.

The refined design must close BOTH paths: make structure explicitly
mandatory AND replace "or replace" with "shorter exact fragment"
(never omission).

## 11 · Structural invariants

- **S1** (must): report MUST include a section headed exactly
  `## Evidence Appendix`.
- **S2** (must): report MUST include at least 5 `Evidence quote:
  "TEXT" — Company, jd_XXXXXX.` lines (one per numbered gap).
- **S3** (must): every gap MUST cite at least one `jd_id` via an
  `Evidence quote:` line under that gap.
- **S4** (must): each evidence line MUST use the exact format
  recognized by the checker regex.
- **S5** (must): Appendix MUST list every cited `jd_id` from body
  citations, with `jd_id + company + title` columns; duplicates
  de-duplicated.
- **S6** (must): no required evidence element may be omitted because
  an exact full sentence is unavailable — use a shorter exact
  fragment instead.

## 12 · Faithfulness invariants

- **F1** (must): every quoted span must be one exact contiguous
  substring of the cited JD body.
- **F2** (must): no ellipsis (`...` or `…`) inside a quote.
- **F3** (must): no grammar repair inside quotation marks.
- **F4** (must): no paraphrase inside quotation marks.
- **F5** (must): no insertion / deletion / replacement of words,
  tense, plurality, articles, or conjunctions inside quotes.
- **F6** (must): explanatory text remains outside quotation marks.
- **F7** (allowed): grammatically incomplete source fragments are
  allowed and preferred over stitched-together spans.

## 13 · Completion invariants

- **C1**: before final output, verify 5 `Evidence quote:` lines
  exist.
- **C2**: before final output, verify `## Evidence Appendix`
  section exists.
- **C3**: before final output, verify every quoted string is exact
  in the supplied body for the cited `jd_id`.
- **C4**: before final output, verify every cited `jd_id` exists in
  the supplied EVIDENCE JDs list.
- **C5**: failure to find a long exact quote MUST lead to a shorter
  exact quote from the same source, NOT omission.
- **C6**: omission of any required evidence element is INVALID
  output; the self-check MUST NOT accept a report that lacks the
  required structure.

## 14 · Instruction hierarchy

- **System-level critical block**: one new CRITICAL block near lines
  79-80 covering both structure and exactness — combined so both
  arrive as a single unified contract.
- **Section-level tightening**: replace line 97's optional-sounding
  bullet with MUST-labeled wording that spells out the exact format.
- **Output-skeleton tightening**: replace line 119's permissive
  "short evidence appendix" with a MUST-labeled `## Evidence
  Appendix` heading contract.
- **Final checklist placement**: at end of the prompt, immediately
  before the closing backtick — 4-bullet mandatory checklist.
- **Duplication policy**: structure + exactness rules stated once in
  critical block; specific format restated in section template + in
  checklist; avoid restating the DO NOT list 4 times.
- **Omission prohibition placement**: MUST appear in the critical
  block AND the checklist — closes the escape path both up front
  and at final validation.

## 15 · Positive / negative examples

### Positive (compact, synthetic)

```
Evidence quote: "agentic RAG at scale" — ExampleCo, jd_999999.
This phrase shows the archetype expects hands-on production
experience with retrieval-plus-tool-use, not just prompt engineering.
```

Characteristics: short exact contiguous fragment (3 words) inside
quotes · explanatory prose outside quotes · exact citation format ·
synthetic `jd_id` to avoid proprietary content.

### Negative (2-3 compact synthetic anti-patterns)

- **Ellipsis bridging** (invalid): `Evidence quote: "agentic RAG at
  scale ... hands-on production" — ExampleCo, jd_999999.`
- **Grammar repair** (invalid): `Evidence quote: "agentic RAG
  working at scale" — ExampleCo, jd_999999.` (inserts "working")
- **Omission** (invalid): under a gap, no `Evidence quote:` line at
  all → structural mandate requires 5 total.

Overfitting risk: keep examples compact; use synthetic `jd_id`
(`jd_999999`) and synthetic company name (`ExampleCo`) so the model
does not overfit to a specific real JD.

## 16 · Minimum citation-count analysis

Healthy runs consistently produced **5 evidence entries** (5d-
stability A · 5d-b-timeout-diagnostics B). The report already has
"Your top 5 gaps, ranked (5 numbered items)" with "One evidence quote
from a real JD" per gap — implicit N=5. Post-patch runs dropped to 0.

**Recommendation: N = 5.**

- Matches existing "5 gaps" structural convention.
- Matches prior healthy-run norm.
- Does NOT introduce filler citations (avoids N ≥ 6).
- Provides a clear pass/fail signal for future structural validation.

## 17 · Evidence Appendix contract

- **Exact heading**: `## Evidence Appendix`.
- **Placement**: after the "highest-leverage next action" section, at
  the very end of the report.
- **Body-citation ↔ Appendix relationship**: every `jd_id` cited in
  body MUST appear in Appendix; duplicates de-duplicated.
- **Uncited Appendix entries**: allowed but discouraged; the current
  checker already telemeters `appendix_entries_not_cited`.
- **When no strong exact quote available**: the shorter-fragment
  fallback applies — never omit the Appendix.
- **Column format**: `jd_id | company | title` (tab or `|`
  separated · matches existing checker `extractAppendix` regex).

## 18 · Options considered

- **A · Refined prompt-only contract** — mandatory structure +
  exact quote rules + positive example + fallback + checklist.
- **B · Prompt + stronger output skeleton** — prewrite required
  headings + evidence slots.
- **B-lite · Option A + skeleton enforcement** — user-suggested and
  executor-preferred; smallest surface that closes both failures.
- **C · Structured JSON generation** — deferred (too large for
  first iteration).
- **D · Runtime structural validation with regeneration** —
  rejected (violates "no retry behavior" locked in prior DECISIONs).
- **E · Deterministic quote extraction / span selection** —
  deferred (too large architecturally).

## 19 · Rejected / deferred approaches

- **Option D · runtime regenerate** — REJECTED: implicit retry
  violates no-retry policy; would need separate DECISION.
- **Option C · structured JSON** — DEFERRED to a future loop if A+B
  fail again.
- **Option E · deterministic span selection** — DEFERRED for the
  same reason.
- **Fuzzy / edit-distance / LLM judge / post-generation replacement /
  checker relaxation** — REJECTED (per prior DECISIONs, and each
  masks or hides hallucination).

## 20 · Preferred design

**Option B-lite = Option A + skeleton enforcement.**

Rationale:

- Smallest surface that addresses both prior failures (omission +
  R1 grammar bridging).
- Zero checker / parser / harness impact.
- Zero Markdown-shape change.
- Preserves R1 / R2.
- Enables clean `git revert` if paid validation fails again.
- Matches minimum-first / anti-overengineering preference.

## 21 · Draft refined prompt contract

**Insertion / edit target**: `src/lib/prompts.ts::reportSystemPrompt`.

Four compact parts (semantic wording — exact prompt text is the
implementation loop's deliverable):

### Part 1 · Mandatory structure

- The 'Your top 5 gaps' section MUST contain 5 `Evidence quote:` lines
  total (one per gap) in this exact format:
  `Evidence quote: "TEXT" — Company, jd_XXXXXX.`
- The final report MUST include a section headed exactly
  `## Evidence Appendix` listing each cited `jd_id` once with
  columns `jd_id + company + title`.
- Omission of any required evidence element is **INVALID output**.
  Never omit an Evidence quote line because exact quoting is
  difficult — use a shorter exact fragment from the same JD
  instead.

### Part 2 · Exact quote rules

- Text inside quotation marks must be **one contiguous substring**
  of the cited JD body, copied character-for-character.
- Do not paraphrase, repair grammar, or bridge separated spans with
  ellipsis inside quotation marks.
- Do not add, remove, or change words, tense, plurality, articles,
  or conjunctions inside quotes.
- Fragmentary source text is valid; put explanation OUTSIDE the
  quotation marks.

### Part 3 · Shorter-fragment fallback

- If a complete sentence cannot be quoted exactly, use a shorter
  exact fragment from the same JD.
- A 5-word exact fragment beats a 20-word paraphrase.
- A 5-word exact fragment ALSO beats omission — never omit the
  required Evidence quote line.

### Part 4 · Final self-check

Before finalizing, verify ALL of the following:

1. 5 `Evidence quote:` lines exist (one per numbered gap).
2. `## Evidence Appendix` section exists and lists each cited
   `jd_id` once.
3. Every quoted string appears exactly (character-for-character) in
   the supplied body for the cited `jd_id`.
4. Every cited `jd_id` exists in the supplied EVIDENCE JDs list.

If any of these is not satisfied, add or shorten quotes until all 4
checks pass. **Do NOT publish a report that omits the required
structure.**

Plus one compact positive example (Section 15) and 2-3 compact
negative examples.

## 22 · Parser / checker compatibility

- Existing Markdown shape preserved.
- Existing `Evidence quote: "TEXT" — Company, jd_XXXXXX.` checker
  regex untouched.
- Existing `## Evidence Appendix` / `Evidence Appendix` heading and
  column format aligned with `extractAppendix` in
  `scripts/quote-integrity-check.mjs`.
- R1 / R2 tier logic unchanged.
- No new checker tier.
- No new harness behavior.

## 23 · Static test plan (future implement loop · $0)

11 static assertions, all Node stdlib only, no new dependency:

1. prompt contains `## Evidence Appendix`
2. prompt contains `MUST` next to `Evidence quote`
3. prompt contains `MUST` next to Evidence Appendix heading
4. prompt contains `at least 5` OR `5 Evidence quote:` phrasing
5. prompt contains `Evidence quote: "` and `— ` (em-dash) and `jd_`
   format string
6. prompt contains shorter-fragment-fallback wording
   (`shorter exact fragment`)
7. prompt contains omission-is-invalid wording
   (`omission` / `invalid` / `never omit`)
8. prompt contains exact-substring self-check wording
9. prompt contains positive short-fragment example
10. prompt contains negative examples (ellipsis bridging, grammar
    repair)
11. output skeleton still matches checker regex
    `Evidence quote: "TEXT" — Company, jd_XXXXXX.`

Not added in this design loop.

## 24 · Future structural validator concept

Separate future design loop only. NOT implemented here.

- Post-generation deterministic check on emitted `report.md`.
- Fails run if: `## Evidence Appendix` missing · fewer than 5
  `Evidence quote:` regex matches · Appendix-body mismatch.
- Does NOT rewrite output. Does NOT retry automatically. Does NOT
  invoke LLM.
- If adopted, promotes structural checks from telemetry to blocking
  — requires separate DECISION.

## 25 · Future paid A/B validation plan

- Requires **separate TASK + RUN_REPORT + DECISION + explicit human
  GO + cost approval**.
- Stages: apply refined prompt · deterministic $0 tests · TypeScript
  typecheck · Fixture A × 1 · Fixture B × 1 · **no retries**.
- **Estimated cost: ~$0.10 total**.

## 26 · Success criteria

- Evidence Appendix present in A and B
- recognized evidence_entries ≥ 5 in A and B
- no `fabricated_or_unmatched` quotes
- `jd_000201` either correctly cited with exact contiguous quote OR
  legitimately not selected while other valid evidence remains
- report remains legacy GREEN
- R1 unchanged in checker code
- R2 unchanged in checker code
- checker / parser / harness unchanged
- no baseline mutation
- QI remains telemetry-only

**`jd_000201` nuance**: success does NOT require `jd_000201` to be
cited every run. Success means it must not be **incorrectly quoted
if selected**. Omission is acceptable only if the overall evidence
apparatus remains healthy.

## 27 · Failure criteria

- Appendix missing
- zero recognized evidence entries
- fewer than 5 recognized evidence entries
- new unmatched quotes appear
- citation format malformed
- checker weakened
- model again avoids all evidence
- report becomes structurally invalid

## 28 · Rollback criteria

- If any failure criterion trips → `git revert` the implementation
  commit(s); document in a follow-up RUN_REPORT.
- Do NOT loosen R1 / R2 to "hide" the regression.
- Do NOT add post-generation rewriting.
- Do NOT auto-retry.

## 29 · Risks

1. Prompt compliance remains probabilistic — mandatory language
   improves but does not guarantee compliance.
2. Model may drift toward filler citations if it can't find good
   exact matches — shorter-fragment fallback should mitigate but
   won't eliminate.
3. Positive example may cause overfitting to `jd_999999` / `ExampleCo`
   — synthetic values chosen to minimize this.
4. Negative examples increase prompt length — should be compact.
5. Mandatory count = 5 assumes 5 gaps; if the top-5-gaps section
   ever changes shape, mandatory count must also update.
6. Evidence Appendix contract may conflict with future report layout
   changes.
7. One paid A/B run may still be insufficient for stability.
8. Other R1 issues outside `jd_000201` may still appear.
9. Error-state fail-fast remains dynamically unexercised.
10. `jd_000201` may fail again under the refined prompt if the model
    tries to cite it — that's acceptable if other citations are
    healthy and the specific bridging pattern is caught (RED
    telemetry, but not a structural collapse).
11. QI remains telemetry-only.
12. BLK-0001 / BLK-0002 / BLK-0003 remain `open`.

## 30 · Open questions

All answered with executor recommendations — see § 31.

## 31 · Recommendations (Q1-Q10)

| Q | Question | Recommendation |
|---|---|---|
| Q1 | Mandatory evidence count? | **YES** — omission was the observed failure mode |
| Q2 | Minimum count value? | **5** (one per numbered gap) |
| Q3 | Appendix explicitly mandatory? | **YES** with exact `## Evidence Appendix` heading + column contract |
| Q4 | Omission forbidden? | **YES** — critical fix; appears in both block AND checklist |
| Q5 | Positive example? | **YES** — one compact synthetic short-fragment example |
| Q6 | Negative examples? | **YES** — 2-3 compact synthetic anti-patterns |
| Q7 | Self-check ordering? | **Structure FIRST, then exactness** — prevents "passed exactness by omitting everything" |
| Q8 | Future structural validator? | **YES eventually, separate design loop** — do not couple to this design |
| Q9 | First implementation prompt-only? | **YES** — minimum-first · anti-overengineering · clean revert path |
| Q10 | Paid A+B before promotion? | **YES** — no promotion-related work until at least one paid A+B validates the refined prompt |

## 32 · Boundaries respected

- ✅ no implementation
- ✅ no prompt change (working tree matches `origin/main`)
- ✅ no code change
- ✅ no generation · no fixture run · no Playwright · no dev server
- ✅ no LLM / API call
- ✅ no checker / parser / harness change
- ✅ no R1 / R2 relaxation
- ✅ no baseline mutation · no promotion · no blocking promotion ·
  no `AgentOps-5f-promote`
- ✅ no pipeline change · no `.agent/scripts/**` change
- ✅ no threshold / retry / package / config / workflow / env /
  Vercel change
- ✅ no C/D/E · no A-E · no PDFs · no OpenAI API
- ✅ no LLM judge · no edit-distance · no fuzzy · no post-generation
  quote replacement · no silent quote rewriting
- ✅ no `report.md` / screenshot / full body / long quote / secret /
  auth / cookie / payload committed
- ✅ QI remains telemetry-only
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human` · Q10 pause unchanged ·
  Codex planner spec-only · `.agent/planner_reports/` empty
- ✅ **cost $0**
