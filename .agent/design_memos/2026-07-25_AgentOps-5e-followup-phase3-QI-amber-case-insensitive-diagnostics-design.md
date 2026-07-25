# Design memo · AgentOps-5e-followup-phase3-QI-amber-case-insensitive-diagnostics-design

## 1. Purpose

Determine the exact cause and product significance of Fixture B's
single case-insensitive Evidence quote match
(`amber_reasons=["case-insensitive-only match for jd_000173"]`)
without rerunning fixtures or changing checker, prompt, harness,
telemetry, fixtures, or baselines. Diagnosis-only.

## 2. Background

Phase 3 completion DECISION (`a207e6e`, pushed) deferred QI AMBER
diagnosis to a separately gated read-only loop. Path A structural
rendered-text contract correction has since been implemented + pushed
(`3087041` + `3d64d69` + `ec9fe8d` + `772d6c2` + `ca6ddd6`). This memo
is the QI diagnosis.

## 3. Phase 3 and Path A context

- Structural + QI + combined all remain **telemetry-only** / display-only.
- Legacy verdict and `process.exit(classification.exit)` authorities unchanged.
- No fixture rerun and no provider call are authorized.
- Structural checker now accepts both raw-Markdown and rendered-text
  headings; this loop does NOT touch the structural checker.

## 4. Scope

- Read Fixture B QI summary + corpus source record for `jd_000173`.
- Read QI checker source + normalization tiers.
- Read prompt for "verbatim" language.
- Author findings JSON, this memo, TASK, RUN_REPORT.
- Two commits (design bundle + RUN_REPORT).

## 5. Out of scope

- Any code change (checker · harness · tests · integration helper).
- Any prompt change.
- Any fixture / baseline / regression-run / package / workflow / env / vercel change.
- Any provider call · fixture rerun · dev server · Playwright.
- Any blocking promotion · baseline mutation · threshold change.
- Any Phase 4 / 5 / 6 / `AgentOps-5f-promote`.
- Push · DECISION creation.

## 6. QI AMBER summary

Fixture B run `20260725T041414Z_fixture-B` produced:

```
verdict: amber
blocking_mode: telemetry_only
affected_legacy_verdict: false
affected_process_exit: false
counts.verbatim_matches: 4
counts.case_insensitive_matches: 1
counts.fabricated_or_unmatched_quotes: 0
counts.wrong_company: 0
counts.wrong_role: 0
counts.duplicates: 0
amber_reasons: ["case-insensitive-only match for jd_000173"]
```

## 7. Intended quote contract

From `src/lib/prompts.ts::reportSystemPrompt`:

- **Part 2**: "Text inside quotation marks MUST be copied verbatim from ONE contiguous span of the cited JD body."
- **Part 2**: "Do NOT paraphrase, repair grammar, change tense, change plurality, add or remove articles or conjunctions, or add or remove any word inside quotation marks."
- **Part 4**: "Exactness: every quoted string appears character-for-character in the supplied body text for its cited jd_id."

**Verbatim means**: byte-identical, case-sensitive, contiguous. Capitalization is not called out separately but is implicitly covered by "character-for-character".

## 8. Checker contract

`scripts/quote-integrity-check.mjs@0.3-r2-terminal-punctuation`:

- **Tier 1 verbatim**: `bodyRaw.includes(quote)` — raw byte substring, case-sensitive.
- **Tier 2 normalized**: `normalize()` collapses curly quotes → straight, en/em dash → hyphen, unicode ellipsis → `...`, pipe → newline, whitespace → single space, trim; then substring — case-preserving.
- **Tier 3 case-insensitive**: `normalize().toLowerCase()` on both sides then substring — **AMBER (not RED)**.
- **R1 ellipsis-fragment stitched**: sub-tiered — AMBER.
- **R2 terminal-punctuation-only**: strict 8-condition gate — AMBER.

**blocking_mode**: `telemetry_only` (integration prototype).

## 9. Checker normalization inventory

`normalize()` transformations (Tier 2 baseline):

- `[“”]` → `"` (curly double quotes to straight)
- `[‘’]` → `'` (curly single quotes to straight)
- `[–—]` → `-` (en/em dash to hyphen)
- `…` → `...` (unicode ellipsis to literal)
- `|` → `\n` (pipe-newline artifact from corpus storage)
- `\s+` → ` ` (all whitespace collapsed to single space)
- `.trim()` (leading/trailing whitespace removed)

**Case is NOT changed** in `normalize()`. Only `normalizeCI()` (Tier 3+) lowercases.

## 10. Existing test coverage

Existing suite: `scripts/test-quote-integrity-check.mjs` (if present). Known coverage from prior DECISIONs (AgentOps-5a/5b/5c/5d): R1 basic patterns, R2 terminal-punctuation, stability regression. **No explicit unit test was audited for `case-insensitive tier fires on sentence-start capitalization variation only`** — out of scope for this read-only diagnosis loop.

## 11. Exact matched quote evidence

From `.agent/regression_runs/20260725T041414Z_fixture-B/quote_integrity_summary.json`, `sample_items[3]`:

- **cited_jd_id**: `jd_000173`
- **cited_company**: Microsoft
- **corpus_title**: Principal Software Engineer - Full Stack AI
- **corpus_archetype**: applied_ai
- **quote_char_length**: **105**
- **quote_snippet_60**: `"Build AI-infused applications, Agentic Solutions and Copilot"`
- **match_status**: `case_insensitive`
- **company_check**: pass
- **role_check**: pass

**Retention limitation**: only the first 60 chars of the 105-char generated quote are retained. Chars 60..104 are not directly observable in the governance-safe artifact.

## 12. Exact source evidence

From `src/data/web_bundle.json` record `jd_000173`:

- **company**: Microsoft
- **title**: Principal Software Engineer - Full Stack AI
- **body_length**: 2205
- Case-sensitive find of the 60-char generated snippet in body: **not found** (-1)
- Case-insensitive find of the 60-char snippet in body: **found at index 1175**
- **Source excerpt (bounded 120 chars, redacted)**: `"build AI-infused applications, Agentic Solutions and Copilots, enhancing user experience and productivity, fostering cre"`

## 13. Character-level difference

Visible span (chars 0..59 of generated quote vs source at idx 1175..1234):

| position | generated | source | code point (gen → src) | category |
|---|---|---|---|---|
| 0 | `B` | `b` | U+0042 → U+0062 | capitalization_only |
| 1..59 | (identical) | (identical) | — | none |

**Positions 60..104 of the generated quote**: not directly observable. Tier-3 match semantics (Tier 1 + Tier 2 both failed) constrain the possible differences to case-only; the exact positions are not knowable from retained artifacts.

## 14. Unicode and whitespace analysis

- curly quotes: **not involved** (all chars ASCII in visible span)
- smart quotes: **not involved**
- en/em dash: **not involved**
- unicode ellipsis: **not involved**
- pipe-newline artifact: **not involved** (source body char 1175+ is clean prose)
- Unicode NFC / NFKC: **equivalent** (ASCII-only)
- whitespace-collapsed equality: **not applicable** — the visible-span difference is exactly the char[0] case, not whitespace

## 15. Mismatch classification

**Class**: `capitalization_only` — specifically `sentence_start_capitalization_only_at_position_0`.

Supporting evidence: generated `B` (U+0042) vs source `b` (U+0062) at position 0; positions 1..59 byte-identical; QI Tier 3 matched (Tier 1 + Tier 2 failed) which is consistent with case-only difference.

Confidence: **high** for visible span (0..59); **inferred** for unavailable span (60..104).

## 16. Product significance

**Class**: `benign_formatting_variance`.

- User would call the quote faithful: **yes**
- Auditor would call it byte-verbatim: **no**
- Meaning altered: **no**
- Citation trust impact: **very_low**
- UI display as exact quotation: acceptable in practice; AMBER telemetry is the correct signal
- AMBER should remain: **yes**

The model quoted a fragment beginning mid-sentence in the source and applied English sentence-start capitalization convention. This is not paraphrase, grammar-repair, tense/plurality/word-count change, or content substitution. The prompt's "character-for-character" language technically forbids it; the checker's AMBER tier flags it without blocking — this is the intended graded semantics.

## 17. Prompt / checker alignment

- **Prompt demands exact capitalization**: yes (implicitly, via "character-for-character")
- **Prompt shows exact-copy examples**: yes
- **Checker implements the prompt's strongest interpretation**: no — checker has graded tiers with AMBER fallbacks (intentional per AgentOps-5a/5c/5d)
- **Case-insensitive fallback intentional by design**: yes
- **AMBER expected for capitalization-only differences**: yes
- **Contradiction**: prompt is strict, checker is graded — this is by design, not defect. AMBER is the informative signal for "close but not byte-exact".

## 18. Capture / rendering analysis

- Corpus source body is stored with lowercase `b` at the relevant position — no renderer transformation involved.
- ReactMarkdown does not alter text content, only markup.
- `innerText()` preserves character content of paragraph text.
- The divergence is entirely between the generator (Anthropic Sonnet 4.6) output and the source — NOT between rendered capture and source.

## 19. Hypothesis ranking

- **H1** (model changed capitalization only at sentence-start): **confirmed_high**
- **H2** (renderer/capture): refuted
- **H3** (source parser normalization): refuted
- **H4** (checker case-insensitive fallback intentional): **confirmed**
- **H5** (checker too permissive): not_supported — AMBER functioning as designed
- **H6** (prompt insufficient): possible but low-impact
- **H7** (substantive difference): refuted for visible span
- **H8** (retention insufficient): partial limitation, doesn't change classification

## 20. Root-cause confidence

**`most_likely_cause`.**

Primary conclusion: **sentence_start_capitalization_only**. Additional uncertainty: whether chars 60..104 contain further capitalization differences beyond position 0 — this uncertainty does not change the class classification.

## 21. Selected next path

**Path A — no change.**

Rationale: AMBER is doing exactly what it was designed to do — signal that a quote is close but not exactly verbatim, without blocking the run. The prompt is already clear. The single-character sentence-start capitalization is a benign English convention. Tightening the checker to RED for this would fail runs for benign variance. Fuzzy / edit-distance / semantic / LLM judge is explicitly forbidden. Prompt reinforcement (Path B) is low-impact and increases tokens. Retention change (Path D) carries privacy trade-offs and is not required to conclude this diagnosis.

## 22. Alternatives rejected

- **Path B** (prompt reinforcement): possible but low-impact; unlikely to eliminate sentence-start capitalization convention; adds prompt tokens.
- **Path C** (checker clarification / sub-tier split): adds semantic complexity to an intentionally-simple checker; requires more retained data.
- **Path D** (instrumentation / retain full quote text): privacy trade-offs; increases artifact size.
- **Path E** (deterministic tests): useful as codification; not required for this diagnosis; subsumed by any future implementation.
- **Fuzzy / edit-distance / semantic / LLM judge / post-generation rewrite / provider retry / fixture rerun**: explicitly not authorized and not indicated.

## 23. Future implementation boundary

Any future implementation loop (any of A/B/C/D/E) MUST:

- author its own TASK + design memo + RUN_REPORT + DECISION.
- keep QI blocking_mode = telemetry_only.
- keep `affected_legacy_verdict=false` invariant.
- keep `process.exit(classification.exit)` authority intact.
- not silently mutate baselines.
- not silently promote QI to blocking.
- not add fuzzy matching, edit distance, LLM judges, or post-generation rewrite.

## 24. Future validation boundary

- Any paid Fixture rerun requires **separate explicit human cost approval**.
- Any promotion of QI (or combined) to blocking requires **separate design + DECISION**.
- No `AgentOps-5f-promote` / Phase 4 / Phase 5 / Phase 6 authorized by this diagnosis loop.

## 25. Policy resolutions

See findings JSON `policy_resolutions.Q1..Q22`. Highlights:

- Q3 difference capitalization-only: **yes** (visible span)
- Q9 prompt requires case-sensitive verbatim: **yes**
- Q10 checker case-insensitive fallback intentional: **yes**
- Q11 current AMBER expected: **yes**
- Q12 checker defect: **no**
- Q13 prompt defect: **no**
- Q15 product trust impact material: **no** (very low)
- Q16 code change justified: **no**
- Q17 prompt change justified: **no**
- Q18/Q19/Q20/Q21/Q22 (paid rerun · fixture rerun · blocking promotion · baseline mutation · phase transition): all **no**

## 26. Privacy and retention

- Bounded excerpts used only where necessary to demonstrate the mismatch (120-char source snippet · 60-char generated snippet already retained in governance-safe artifact).
- No long proprietary JD text reproduced.
- Corpus record `jd_000173` (Microsoft · Principal Software Engineer - Full Stack AI) is already committed to `src/data/web_bundle.json` — this loop reads it read-only.
- No local uncommitted `report.md`, `screenshot.png`, or raw server log is read or copied.
- Retention gap: only 60/105 generated chars retained; sufficient to classify mismatch but not to fully verify the tail. Path D would eliminate this if adopted.

## 27. Risks

- **R1** (low): AMBER continues to fire on future runs for benign sentence-start capitalization convention. Telemetry noise remains at a low rate. Mitigation: AMBER is telemetry-only; does not block.
- **R2** (low): Retained artifact truncates the generated quote to 60 chars, so chars 60..104 are inferred. If further non-capitalization differences exist, classification would change. Mitigation: Tier-3 semantics constrain to case-only; Path D would eliminate uncertainty.
- **R3** (high): If a future implementation loop chooses Path B/C without a companion DECISION, it would violate the current promotion posture recorded in the Phase 3 completion DECISION. Mitigation: any implementation loop must author its own DECISION and MUST NOT promote QI to blocking without separate design.

## 28. Open questions

- Do chars 60..104 of the generated quote contain further capitalization differences beyond position 0? Retained artifact insufficient to answer without full-text retention or paid rerun.
- Is a formal QI test for `case-insensitive AMBER on sentence-start capitalization only` worth adding for regression protection? Path E is available but not selected.
- Would prompt reinforcement (Path B) measurably reduce future AMBER rate given models frequently apply sentence-start capitalization convention regardless of instructions? No a-priori evidence either way.

## 29. Boundaries respected

- read-only diagnosis / design: **yes**
- no code change: **yes**
- no prompt change: **yes**
- no checker change: **yes**
- no capture change: **yes**
- no harness change: **yes**
- no test change: **yes**
- no fixture change: **yes**
- no baseline change: **yes**
- no regression-run change: **yes**
- no `.agent/scripts` change: **yes**
- no telemetry change: **yes**
- no `package.json`/`package-lock.json` change: **yes**
- no workflow / env / vercel change: **yes**
- no pipeline change: **yes** (`b019786` untouched)
- no provider call: **yes**
- no fixture rerun: **yes**
- no dev server / Playwright: **yes**
- QI remains telemetry-only: **yes**
- no promotion: **yes**
- no Phase 4/5/6: **yes**
- no `AgentOps-5f-promote`: **yes**
- no push: **yes**
- no DECISION: **yes**
- cost this loop: **$0**
