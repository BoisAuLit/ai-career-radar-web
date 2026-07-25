# Design memo · AgentOps-5e-followup-phase3-structural-product-quality-diagnostics-design

## 1. Purpose

Determine the exact root cause of the structural RED signal on both
Phase 3 report samples (Fixture A `20260724T193135Z_fixture-A` and
Fixture B `20260725T041414Z_fixture-B`) via read-only inspection and
deterministic local text analysis, and select the narrowest possible
next loop **without implementing anything**. Diagnosis and design only.

## 2. Background

Phase 3 two-fixture full-report validation completed under
`2026-07-25_run_02_DECISION` (approve, `a207e6e`). Both fixtures produced
structural RED with identical reasons under telemetry-only mode.
Legacy verdict stayed GREEN and process exit stayed 0 on both. The
Phase 3 completion DECISION explicitly deferred structural
product-quality investigation to a separately gated diagnosis loop.
This memo is that diagnosis.

## 3. Phase 3 completion context

- Fixture A full report path validated **pre-hardening** in `run_09`.
- Fixture B full report path validated **post-hardening** in `run_02`.
- Structural remains **telemetry-only**. Combined remains
  **display-only**. QI remains **telemetry-only**. Legacy remains the
  sole authority on `checks[]` / `classify(checks)` /
  `process.exit(classification.exit)`.
- No fixture rerun and no paid provider call are authorized.

## 4. Scope

- Read `.agent/regression_runs/<A>/**` and `<B>/**` governance-safe
  artifacts (no long report body reproduction).
- Read `src/lib/prompts.ts`, `src/app/page.tsx`,
  `scripts/structural-evidence-check.mjs`,
  `scripts/quote-integrity-check.mjs`,
  `scripts/report-regression-local.mjs`, structural test suites.
- Compare intended prompt contract, checker contract, and harness
  capture contract.
- Author findings JSON, this memo, TASK, RUN_REPORT.
- Two commits (design bundle + RUN_REPORT).

## 5. Out of scope

- Any implementation change (checker, prompt, harness, capture, tests,
  fixtures, baselines, telemetry, package files).
- Any provider call.
- Any fixture rerun.
- Any blocking promotion.
- Any baseline mutation.
- Phase 4 / 5 / 6.
- `AgentOps-5f-promote`.
- Push.
- DECISION creation.

## 6. Structural RED summary

Both fixtures produced exactly:

```
red_reasons:
  - gap_section_missing_or_unrecognized
  - citation_line_count=0_lt_5
  - evidence_appendix_missing
```

with `observed_gap_count=0`, `recognized_citation_line_count=0`,
`appendix.present=false`, `appendix.row_count=0`,
`evaluation_status=completed`, `tool_error=null`,
`blocking_mode=telemetry_only`,
`affected_legacy_verdict=false`, and identical `checker_hash`.

## 7. Intended report contract

From `src/lib/prompts.ts::reportSystemPrompt`:

- **Gap section**: `## Your top 5 gaps, ranked (5 numbered items)` —
  exactly 5 numbered ranked gaps, each with one Evidence quote line.
- **Citation**: `Evidence quote: "TEXT" — Company, jd_XXXXXX.` (straight
  quotes, em-dash, `Company, jd_XXXXXX.`), one per gap, ≥5 total.
- **Evidence Appendix**: `## Evidence Appendix` heading, followed by
  rows `jd_id\tcompany\ttitle` (tab-separated).
- The prompt has a minor **secondary** sentence at the end referring to
  "a short evidence appendix" without `##`. Non-normative; the mandatory
  Part-1 section still requires `## Evidence Appendix`. Recorded but
  **not causal**.

## 8. Checker contract

From `scripts/structural-evidence-check.mjs@0.1-phase1`:

- **Gap-section regex**: `/^##\s+Your top 5 gaps\b/im` — literal
  `##`, case-insensitive multiline, word boundary after `gaps`.
- **Appendix heading**: literal string `## Evidence Appendix` via
  `text.indexOf(...)`.
- **Appendix row parser**: `line.split('\t')` — tabs ONLY, no fallback.
- **Evidence quote regex**: identical to the QI checker (works on any
  input text).
- Thresholds: `REQUIRED_GAP_COUNT=5`, `MIN_CITATION_LINE_COUNT=5`.

## 9. Checker regex inventory

| element | regex / literal | requires `##`? | tolerant of tab collapse? |
|---|---|---|---|
| gap heading | `/^##\s+Your top 5 gaps\b/im` | **yes** | n/a |
| appendix heading | `text.indexOf("## Evidence Appendix")` | **yes** | n/a |
| appendix row | `line.split("\t")` (exactly 3 columns) | no | **no** — no whitespace/pipe fallback |
| Evidence quote | `/Evidence quote:\s*["“]([^"”\n]{5,})["”]\s*[—–\-]\s*([^,\n]{1,120}?),\s*(jd_\d{4,})/g` | no | n/a |

## 10. Existing test coverage

- `scripts/test-structural-evidence-check.mjs` (40/40 pass) — feeds raw
  Markdown source (with `##` prefixes).
- `scripts/test-structural-evidence-integration.mjs` (26/26 pass) —
  also uses Markdown source fixtures.
- **Gap**: no test covers **rendered plain-text input** — the exact
  shape produced by `page.locator(...).innerText()`.

## 11. Fixture A evidence

- `verdict=red` · 3 identical reasons
- capture: `main section` scope, `strategy=shortest-qualified-candidate`,
  `fallback_used=false`
- `candidate_count=9`, `qualified_candidate_count=2`,
  `selected_candidate_marker_count=5`,
  `selected_candidate_has_evidence=true`,
  `report_char_count=9339`, `completion_state=success`
- capture-marker scoring confirms all 5 required markers plus
  Evidence Appendix present as case-insensitive substrings — content
  IS present in the captured text.

## 12. Fixture B evidence

- Same red pattern.
- capture: `main section` scope, same strategy, no fallback.
- `candidate_count=8`, `qualified_candidate_count=2`,
  `selected_candidate_marker_count=5`,
  `selected_candidate_has_evidence=true`,
  `report_char_count=10448`, `completion_state=success`.
- **Cross-check with QI checker on the same captured text**:
  QI parsed **4 appendix entries** and **5 evidence quotes** (4 verbatim
  + 1 case-insensitive; 0 fabricated / wrong_company / wrong_role /
  duplicates). This proves the appendix and citations exist in the
  captured text — the structural checker's zero counts are a
  contract failure, not content absence.

## 13. A/B comparison

| dimension | Fixture A | Fixture B | same? |
|---|---|---|---|
| structural verdict | red | red | ✓ |
| structural reasons | 3 identical | 3 identical | ✓ |
| capture_scope | main section | main section | ✓ |
| capture_strategy | shortest-qualified-candidate | shortest-qualified-candidate | ✓ |
| capture_complete | true | true | ✓ |
| expected_sections_captured | true | true | ✓ |
| selected_candidate_marker_count | 5 | 5 | ✓ |
| selected_candidate_has_evidence | true | true | ✓ |
| report_char_count | 9339 | 10448 | variance-normal |
| candidate_count | 9 | 8 | variance-normal |
| checker_commit | 0.1-phase1 | 0.1-phase1 | ✓ |
| **shared mechanism** | | | **confirmed** |

## 14. Capture contract

`scripts/report-regression-local.mjs`:

- Enumerates 9 candidate selectors (`[data-testid*='report']`,
  `[data-report]`, `article`, `main section`, `main`, `section`,
  `div[class*='prose']`, `div[class*='markdown']`,
  `div[class*='report']`).
- For each, `handle.innerText()` is called.
- Scoring: case-insensitive substring match against
  `["Target role", "What you already have", "Top 5 gaps",
   "Over-prioritizing", "Highest-leverage next action"]` + regex
  `/evidence appendix|## evidence/i`.
- The **shortest** candidate with all 5 markers + evidence wins.
- No qualified candidate → fallback to `body.innerText()`.

The capture path never sees raw model Markdown. It always operates on
the DOM's rendered text.

## 15. Capture completeness semantics

`capture_complete=true` is a **Category-A harness-mechanism** signal
(per DECISION 2026-07-24_run_07): it means a qualified DOM candidate
was extracted. It does NOT claim the extracted text passes the
structural checker's Markdown grammar. This is a correct semantic
distinction, but one that is easy to misread — the structural RED
verdict on a `capture_complete=true` capture is not a defect in
capture_complete's semantics; it is a divergence between two different
contracts (harness marker-substring vs checker Markdown-anchor).

## 16. Prompt contract

`src/lib/prompts.ts::reportSystemPrompt` is **consistent with the
structural checker on Markdown source form**. Prompt tells the model
to emit `## Your top 5 gaps, ranked (5 numbered items)` and
`## Evidence Appendix` and tab-separated rows. Word-boundary analysis
confirms the checker's gap regex matches the prompt's heading string.
Prompt Part-4 self-check requires the model to verify the mandatory
structure before finalizing. A minor duplicate sentence at the end of
the prompt uses lowercase `evidence appendix` without `##`; this is
not causal because Part-1 remains the normative instruction.

## 17. Rendering and extraction contract

`src/app/page.tsx` uses `ReactMarkdown` with `remark-gfm` and custom
components. `## X` renders as `<h2>X</h2>` — the `##` characters are
**not** present in the DOM text. Playwright `innerText()` returns the
rendered plain text with `##` stripped. Tables and tab-separated rows
may collapse whitespace depending on how they are structured; in
either case `innerText()` never contains raw Markdown syntax.

The raw report Markdown IS available in the page state as the `report`
variable (line 438) and is posted to `/api/eval-report` as
`report_markdown` — but the harness does not currently access this raw
form.

## 18. Gap-section diagnosis

**Confirmed capture mismatch.** The captured text contains the phrase
"Top 5 gaps" (as substring, contributing to
`selected_candidate_marker_count=5`) but does not contain literal
`##` prefixes because ReactMarkdown renders headings as `<h2>` and
innerText strips the Markdown syntax. The checker regex
`/^##\s+Your top 5 gaps\b/im` requires literal `##`, so it can never
match on the harness's captured text — regardless of what the model
generates.

## 19. Citation diagnosis

**Downstream consequence of gap-section mismatch.** The structural
checker only counts citations WITHIN a recognized gap section. Because
the gap section is not recognized, `citationsInGapSection` is empty
even though the same `Evidence quote:` regex (used identically by QI)
successfully finds 5 citations on Fixture B's captured text. The
citation regex is correct; the scoping is what fails.

## 20. Evidence Appendix diagnosis

**Confirmed contract mismatch.** The structural checker uses
`text.indexOf("## Evidence Appendix")` — literal `##` required.
QI uses `text.indexOf("Evidence Appendix")` (no `##`) and successfully
finds the section AND parses 4 appendix rows on Fixture B. Once the
`##` requirement is relaxed, a secondary defect activates: the
structural row parser is tab-only (`line.split('\t')`), while QI has a
whitespace/pipe fallback (`line.split(/\s{2,}|\|/)`). If `innerText()`
collapses tabs to spaces, tab-only parsing would still yield zero
rows.

## 21. Evidence matrix

| reason | Fixture A | Fixture B | class |
|---|---|---|---|
| `gap_section_missing_or_unrecognized` | present | present | **confirmed_capture_mismatch** |
| `citation_line_count=0_lt_5` | present | present | **confirmed_contract_mismatch** (downstream) |
| `evidence_appendix_missing` | present | present | **confirmed_contract_mismatch** |

## 22. Hypothesis ranking

- **H8** (rendering strips Markdown structure needed by checker) —
  **confirmed high**.
- **H11** (appendix row tab-only parser fragile once #8 fixed) —
  **likely secondary**.
- H7 reframed: prompt ↔ checker agree on Markdown source; the true
  mismatch is **harness capture ↔ checker**.
- H10 (capture_complete semantic distinction) — not a defect, just
  non-obvious to reviewers.
- H1 / H3 / H4 / H5 / H6 / H9 — refuted by capture markers + QI
  cross-check.
- H2 — possible but not primary (word boundary + suffix analysis
  shows the checker would match if `##` were present).

## 23. Root-cause confidence

**`multiple_root_causes_confirmed`.**

Primary confirmed:
1. Structural gap-heading regex requires literal `##`.
2. Structural appendix heading requires literal `##`.

Secondary likely:
3. Structural appendix row parser is tab-only (no whitespace/pipe
   fallback).

None of these are product-output failures. All three are checker
contract expectations that the harness's rendered-text capture path
cannot satisfy.

## 24. Selected next path

**Instrumentation-first, then choose between Path A and Path B, under
a separate DECISION.**

- **Path A — Checker grammar correction**: relax structural regexes to
  accept rendered plain text (drop `##` requirement on gap heading and
  appendix heading; add whitespace/pipe row fallback matching QI).
- **Path B — Feed the checker raw Markdown source**: expose page.tsx
  `report` state to the harness via a hidden data attribute or
  `<script type="application/x-report-markdown">` element; harness
  reads it for structural evaluation only; QI + legacy continue on
  current capture.

Both paths preserve telemetry-only mode. Neither modifies prompt,
baselines, fixtures, or process exit. Choice between A and B is a
design decision for the next loop.

## 25. Alternatives rejected

- **Path C (prompt reinforcement)** — prompt is already consistent
  with the checker on Markdown source; no wording change would fix
  the harness capture contract.
- **Path D (deterministic tests first)** — this is really a mandatory
  Step 1 within either Path A or Path B, not an alternative.
- **Fuzzy matching / edit-distance / LLM judge / post-generation
  rewrite / automatic report repair / provider retry / fixture
  rerun** — explicitly not authorized and not indicated.

## 26. Privacy and retention

- No proprietary long report text is reproduced in this loop's
  artifacts.
- Company names and `jd_id` values are recorded only where already
  present in governance-safe run artifacts (QI summary).
- No captured report body is copied into the findings JSON, this
  memo, or the RUN_REPORT.
- SHA-256 of report captures not needed for this loop.
- Local uncommitted `report.md` and `screenshot.png` files, if any,
  are NOT read, NOT copied, NOT committed.

## 27. Future implementation boundary

A future implementation loop (Path A or Path B) MUST:

- author its own TASK + design memo + RUN_REPORT + DECISION.
- keep structural blocking mode = telemetry-only.
- keep `affected_legacy_verdict=false` invariant.
- keep `process.exit(classification.exit)` authority intact.
- add deterministic tests covering rendered-text input (Path A) or
  raw-markdown extraction (Path B) BEFORE any regex/parser
  modification.
- add tests reproducing Fixture A + Fixture B captured-text shape.
- not silently mutate baselines.
- not silently promote structural to blocking.
- not add fuzzy matching, edit distance, LLM judges, or
  post-generation rewrite.
- explicitly document that any resulting structural GREEN flip is a
  **contract fix**, not a product-quality improvement.

## 28. Future validation boundary

- Any paid Fixture rerun requires **separate explicit human cost
  approval**.
- Any promotion of structural (or combined) to blocking requires
  **separate design + DECISION**.
- No AgentOps-5f-promote / Phase 4 / Phase 5 / Phase 6 authorized by
  this diagnosis loop.

## 29. Policy resolutions

See findings JSON `policy_resolutions.Q1..Q20`.

Highlights: gap content NOT absent · citations NOT absent · appendix
NOT absent · checker evaluates rendered text · A and B same
mechanism · checker change **justified** but only under separate
DECISION · prompt change **not justified** · capture change **also
justified** as Path B alternative · paid rerun **not** justified now ·
fixture rerun **not** authorized · blocking promotion **not**
authorized · Phase 4/5/6 / 5f-promote **not** authorized.

## 30. Risks

- R1: over-broad Path A could accept renderer-flattened text where
  genuine ambiguity exists (medium). Mitigation: rendered-text tests
  first.
- R2: Path B requires page.tsx edit; risk of accidental UI leak
  (medium). Mitigation: hidden `<script type="application/x-report-markdown">`
  element with content already client-side.
- R3: silent broadening without a DECISION violates promotion
  posture (high). Mitigation: no implementation this loop; next
  loop must author its own DECISION.
- R4: structural GREEN flip after fix could be misread as product
  quality improvement (low). Mitigation: explicit documentation in
  implementation DECISION.

## 31. Open questions

- Would the checker still fail on raw-markdown input if the model
  emits the heading with its full suffix `, ranked (5 numbered
  items)`? Word-boundary analysis says no, but a deterministic test
  would confirm.
- Do captured appendix lines still contain `\t` characters, or does
  the browser collapse them? Requires either a read-only inspection
  of a locally available uncommitted report file or a rendered-text
  test.
- Is there a governance-safe way to expose raw report markdown to
  the harness without touching page.tsx? (Probably no — page.tsx
  holds the state.)
- Under Path A, keep the `##` Markdown variant as a stricter
  additional check, or replace outright?

## 32. Boundaries respected

- read-only diagnosis / design: **yes**
- no code change: **yes**
- no prompt change: **yes**
- no checker change: **yes**
- no capture change: **yes**
- no harness change: **yes**
- no fixture change: **yes**
- no baseline change: **yes**
- no test change: **yes**
- no telemetry change: **yes**
- no `.agent/scripts` change: **yes**
- no workflow / env / vercel change: **yes**
- no pipeline change: **yes**
- no provider call: **yes**
- no fixture rerun: **yes**
- no dev server / Playwright: **yes**
- structural remains telemetry-only: **yes**
- no promotion: **yes**
- no Phase 4 / 5 / 6: **yes**
- no `AgentOps-5f-promote`: **yes**
- no push: **yes**
- no DECISION: **yes**
- cost this loop: **$0**
