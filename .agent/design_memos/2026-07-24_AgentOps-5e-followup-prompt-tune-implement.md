# Design memo · AgentOps-5e-followup-prompt-tune-implement · Exact evidence quote contract

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-prompt-tune-implement
- **parent_loop**: AgentOps-5e-followup-prompt-tune (`2026-07-23_run_07`)
- **authorizing_decision**: `.agent/decisions/2026-07-23_run_07_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_01_TASK.md`
- **initial_cost**: **$0** (implementation only) · **paid A+B target**: ~$0.10

## 1 · Purpose

Apply the approved prompt-only exact-evidence-quote contract to
`src/lib/prompts.ts::reportSystemPrompt`, add deterministic $0
validation, and run Fixture A + Fixture B exactly once each with no
retries. Validate whether the recurring `jd_000201` R1 failure
disappears without weakening the checker or breaking report
structure.

## 2 · Approved scope

- `src/lib/prompts.ts` — single, minimal, non-redundant patch
- `scripts/test-evidence-quote-contract.mjs` — new deterministic $0
  test script (Node stdlib only)
- Fixture A × 1 · Fixture B × 1 · no retries
- Committed run artifacts: `metadata.json`, `structural_checks.json`,
  `verdict.md`, `quote_integrity_summary.json` (if written),
  `network_diagnostics.json` (if written)

## 3 · Prompt patch

Inserted immediately after the company-specific-claim rule block
(line 80) and before "Output is Markdown only." (line 82):

```
CRITICAL — evidence-quote-verbatim rule (read twice):
- Every quoted Evidence span MUST be copied verbatim from ONE
  contiguous span of the cited job description body.
- Do NOT paraphrase or repair grammar inside quotation marks. Do
  NOT add, remove, or change words, tense, plurality, articles, or
  conjunctions.
- Do NOT combine separated source fragments inside quotation marks.
  Do NOT use ellipsis ("...") inside a quote to skip source text —
  either quote one contiguous span or emit two separate quoted spans.
- A quote does not need to be a complete sentence. Grammatically
  incomplete source fragments are allowed and preferred over
  stitched-together spans; a short exact fragment beats a longer
  paraphrased sentence.
- Put all interpretation and grammatical framing OUTSIDE the
  quotation marks.
- Before finalizing, verify that every quoted string occurs exactly
  (character-for-character) in the supplied body text for the cited
  jd_id. If it does not, shorten or replace it with an exact
  contiguous source span.
```

## 4 · Exact insertion point

- File: `src/lib/prompts.ts`
- Function: `reportSystemPrompt`
- Position: between existing lines 80 and 82 (after
  `company-specific-claim rule` block; before
  `Output is Markdown only.`)
- Diff shape: **+8 lines · 0 deletions**

## 5 · Preserved output format

- Existing Markdown label preserved:
  `Evidence quote: "TEXT" — Company, jd_XXXXXX.`
- Evidence Appendix behavior preserved.
- No structured JSON generation introduced.
- No new output schema.
- Section boundaries and citation format unchanged.

## 6 · Checker / parser / harness preservation

Pre-change file hashes (recorded before edit):

| file | git blob hash |
|---|---|
| `src/lib/prompts.ts` (pre) | `2a3371c` |
| `scripts/quote-integrity-check.mjs` | `105ce8a` |
| `scripts/report-regression-local.mjs` | `4abfd9f` |

Post-change (expected unchanged for checker + harness):

- `scripts/quote-integrity-check.mjs`: **untouched** — verify by
  `git diff origin/main..HEAD -- scripts/quote-integrity-check.mjs`
  is empty
- `scripts/report-regression-local.mjs`: **untouched** — same check
- R1 / R2 tier logic: **unchanged** (no code change to matcher)
- Thresholds: `HARD_LATENCY_MS = 240_000` · `SOFT_LATENCY_MS = 120_000`
  **unchanged**

## 7 · Deterministic tests

New file: `scripts/test-evidence-quote-contract.mjs`

- Runs with `node scripts/test-evidence-quote-contract.mjs`
- **9 assertions** · Node stdlib only · **no new dependency**
- No network, no LLM, no dev server invoked

### Group A · prompt contract (7 assertions)

| id | asserts |
|---|---|
| A1 | `"copied verbatim from ONE contiguous span"` present |
| A2 | `"Do NOT paraphrase or repair grammar"` present |
| A3 | `"add, remove, or change words, tense, plurality, articles, or conjunctions"` present |
| A4 | `"Grammatically incomplete source fragments are allowed"` present |
| A5 | `"Do NOT use ellipsis"` present |
| A6 | `"verify that every quoted string occurs exactly"` present |
| A7 | `"OUTSIDE the quotation marks"` present |

### Group B · corpus source-span exact-match (2 assertions)

| id | asserts |
|---|---|
| B1 | known 117-char verbatim head appears in `web_bundle.json` `jd_000201.body` |
| B2 | grammar-added variant "for THE specific problems" does NOT appear in corpus |

### Checker behavior preservation (static inspection)

Not asserted at runtime because the checker CLI is not importable as
a library and refactoring is out of scope. Instead:

- Checker file hash pinned in § 6 above → **unchanged pre/post** →
  R1, R2, ellipsis-fragment matcher, and terminal-punctuation-only
  tier logic guaranteed unchanged.
- No new matching tier added to the checker.

### Result

```
PASS A1 · A2 · A3 · A4 · A5 · A6 · A7 · B1 · B2
OK · 9 assertions passed · $0 · no network / LLM / dev server invoked
```

## 8 · Static validation

- `npx tsc --noEmit` → **exit 0** (TypeScript typecheck clean)
- No new dependency added · no `package.json` change · no lockfile
  change
- Deterministic tests all pass (§ 7)

## 9 · Paid validation plan

- Run **Fixture A exactly once** via
  `node scripts/report-regression-local.mjs --fixture A`
- Run **Fixture B exactly once** via
  `node scripts/report-regression-local.mjs --fixture B`
- **No retries** on either.
- Capture: run id · exit code · duration · completion_state · legacy
  verdict · report_char_count · capture_scope · fallback_used ·
  Appendix presence · QI verdict · fabricated_or_unmatched count ·
  terminal_punctuation_only count · appendix_entries_not_cited count ·
  `jd_000201` result · network diagnostics · console errors.

## 10 · Cost boundary

- Implementation + tests + typecheck: **$0**.
- Paid A + B validation: **~$0.10 total estimate** (2 real Sonnet
  4.6 generations at ~$0.05 each).
- **No retries** even on failure.
- If A or B fails operationally, run the other and document; do not
  reflow budget.

## 11 · Baseline policy

- **No baseline mutation.**
- **No baseline promotion.**
- No `.agent/regression_baselines/**` change.
- No `.agent/quote_integrity_runs/**` mutation.

## 12 · Rollback plan

- Implementation commit reversal: `git revert <impl commit>` — undoes
  prompt patch + test script atomically.
- Validation commit reversal: `git revert <validation commit>` —
  removes committed run artifacts + memo completions.
- Pre-push · zero side effects on prompted users (no production
  deploy).

## 13 · Boundaries respected

- ✅ Only `src/lib/prompts.ts` modified (prompt patch)
- ✅ Only `scripts/test-evidence-quote-contract.mjs` added (new file
  under `scripts/`)
- ✅ `scripts/quote-integrity-check.mjs` unchanged (hash `105ce8a`)
- ✅ `scripts/report-regression-local.mjs` unchanged (hash `4abfd9f`)
- ✅ No `.agent/scripts/**` change (hard rule per AgentOps-2c Q3-Q8)
- ✅ No R1 / R2 relaxation
- ✅ No fuzzy · no edit-distance · no LLM judge · no post-generation
  replacement · no silent quote rewriting
- ✅ No Markdown / citation format change
- ✅ No model / provider change (still `claude-sonnet-4-6`)
- ✅ No API-route change
- ✅ No baseline mutation · no baseline promotion
- ✅ No pipeline change · no `.env*` · no `vercel.json` · no
  `package.json` · no lockfile · no workflow
- ✅ No threshold change · no retry behavior added
- ✅ No C/D/E · no A-E · no PDFs · no OpenAI API
- ✅ QI remains telemetry-only · no blocking promotion · no
  `AgentOps-5f-promote`
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human`

## 14 · Fixture A result

- **run_id**: `20260724T010632Z_fixture-A`
- **command**: `node scripts/report-regression-local.mjs --fixture A`
- **legacy_verdict**: **GREEN**
- **exit_code**: **0**
- **duration_ms**: **78 283**
- **completion_state**: `success`
- **completion_elapsed_ms**: 75 192
- **report_char_count**: 11 298
- **capture_scope**: `main section`
- **fallback_used**: false
- **candidates**: 9 / 2
- **quote_integrity_verdict**: **RED**
- **schema_version**: `0.3-r2-terminal-punctuation`
- **red_reasons**: `["Evidence Appendix missing while report contains evidence/citation language"]`
- **amber_reasons**: `[]`
- **counts.quote_candidates**: **19** (double-quoted spans in report)
- **counts.evidence_entries**: **0** (none in `Evidence quote: "TEXT" — Company, jd_XXXXXX.` format)
- **counts.evidence_quotes_with_citation**: **0**
- **counts.fabricated_or_unmatched_quotes**: **0** ✅
- **counts.terminal_punctuation_only_matches**: 0
- **counts.appendix_entries_not_cited**: 0
- **jd_000201 result**: **not cited** (does not appear as evidence-quote entry in this run)
- **network diagnostics**: `requestfailed_count=0`, `non_2xx_count=0`, no console errors

## 15 · Fixture B result

- **run_id**: `20260724T010756Z_fixture-B`
- **command**: `node scripts/report-regression-local.mjs --fixture B`
- **legacy_verdict**: **GREEN**
- **exit_code**: **0**
- **duration_ms**: **65 197** (well under 240 s · no 502 · 5d timeout did NOT reproduce)
- **completion_state**: `success`
- **report_char_count**: 10 466
- **capture_scope**: `main section`
- **fallback_used**: false
- **candidates**: 8 / 2
- **quote_integrity_verdict**: **RED**
- **schema_version**: `0.3-r2-terminal-punctuation`
- **red_reasons**: `["Evidence Appendix missing while report contains evidence/citation language"]`
- **amber_reasons**: `[]`
- **counts.quote_candidates**: **21**
- **counts.evidence_entries**: **0**
- **counts.evidence_quotes_with_citation**: **0**
- **counts.fabricated_or_unmatched_quotes**: **0** ✅
- **counts.terminal_punctuation_only_matches**: 0
- **counts.appendix_entries_not_cited**: 0
- **jd_000201 result**: **not cited**
- **network diagnostics**: `requestfailed_count=0`, `non_2xx_count=0`, no console errors

## 16 · Before / after comparison

| metric | prior A (5d 20260723T035644Z) | prior A (5d-stab 20260723T042627Z) | new A (24 21:06) | prior B (5d-diag 20260723T160538Z) | new B (24 21:07) |
|---|---|---|---|---|---|
| legacy verdict | GREEN | GREEN | GREEN | GREEN | GREEN |
| exit code | 0 | 0 | 0 | 0 | 0 |
| duration_ms | ~76 000 | 66 800 | 78 283 | 65 400 | 65 197 |
| report chars | 11 341 | 10 089 | 11 298 | 9 701 | 10 466 |
| completion_state | success | success | success | success | success |
| Evidence Appendix present | **YES** | **YES** | **NO** ← regression | **YES** | **NO** ← regression |
| QI verdict | red | amber | **red (new reason)** | red | **red (new reason)** |
| QI red_reasons | appendix + 4 cited-not-appendix | none | **appendix missing** | jd_000201 unmatched | **appendix missing** |
| evidence_entries (cited quotes) | 5 | 5 | **0** ← regression | 5 | **0** ← regression |
| fabricated_or_unmatched | 4 | 0 | **0** ✅ | 1 | **0** ✅ |
| R2 fires (terminal-punct-only) | 2 | 2 | 0 | 1 | 0 |
| appendix_entries_not_cited | 0 | 1 (jd_000310) | 0 | 1 (jd_000310) | 0 |
| jd_000201 result | not cited | not cited | not cited | R1 RED | **not cited** |

## 17 · `jd_000201` result

- **New A**: not cited (fixture A tends to select other applied_ai
  evidence).
- **New B**: **not cited** — this is a change from the diagnostic B
  run (`20260723T160538Z_fixture-B`) which cited jd_000201 as R1 RED.
- **Interpretation**: R1 grammar-bridging did NOT reproduce in new B,
  but for a **different reason than the fix intended**: the model
  simply did not use the `Evidence quote: "TEXT" — Company, jd_XXXXXX.`
  citation format at all. Under the checker's regex, no cited
  evidence quote was recognized in either run, so no R1 assessment
  could occur for any specific `jd_id`.

## 18 · New unmatched findings

- **New A** `fabricated_or_unmatched_quotes = 0`.
- **New B** `fabricated_or_unmatched_quotes = 0`.
- **No new fabricated quotes** appeared in either fixture. ✅
- **However**: the checker's evidence-quote regex matched **zero**
  entries in either run. The model produced 19-21 double-quoted spans
  (`quote_candidates`), none in the recognized citation format.

## 19 · R2 preservation

- Both new runs report `terminal_punctuation_only_matches = 0`.
- No AMBER for terminal-punctuation-only was emitted this loop —
  consistent with **zero recognized citation-format quotes**, not
  with a checker regression.
- Checker file hash unchanged (`105ce8a`) → R2 tier logic intact.

## 20 · Appendix behavior

- **Evidence Appendix is MISSING from both new A and new B reports.**
- Prior A + B runs (5c through 5d-b-timeout-diagnostics) consistently
  contained an Evidence Appendix table.
- **This is a real product regression** driven by the prompt patch.
- The `structural_checks.contains_evidence_appendix` check emits
  **red** in both new runs; the legacy harness treats this as a
  telemetry-only red (does not flip exit code because appendix
  presence is not currently a blocking legacy check).

## 21 · Operational diagnostics

- `network_diagnostics.json` written for both runs.
- `requestfailed_count = 0` · `non_2xx_count = 0` · no console
  errors on either run.
- Prior B 502 timeout **did NOT reproduce** (65 s well under 240 s
  hard threshold).
- No manual deploy · no retry · no third-fixture run.

## 22 · Outcome classification

**Outcome B — Partial** (leaning toward **Outcome C** — Prompt
ineffective).

- ✅ `jd_000201` no longer R1 RED (but only because it was not
  cited — the prompt patch did not demonstrably fix the bridging
  behavior; it eliminated the cite altogether).
- ✅ `fabricated_or_unmatched_quotes = 0` in both fixtures.
- ✅ R1 / R2 checker logic unchanged.
- ✅ Legacy verdict remains GREEN for both.
- ✅ No baseline mutation · no promotion · QI telemetry-only.
- ❌ **Evidence Appendix disappeared** in both fixtures.
- ❌ **Recognized `Evidence quote:` citation format collapsed to 0**
  in both fixtures.
- ❌ The report's audit trail (evidence quotes traceable to specific
  JDs via a machine-checkable format) has been **weakened**, not
  strengthened.

**Assessment**: the patch was **over-corrective**. The verbatim
requirement combined with the ellipsis prohibition and the
exact-substring self-check made the model cautious enough that it
abandoned the recognized citation apparatus rather than risk emitting
a non-exact quote. The result is a report that no longer contains
verifiable evidence citations at all — a **structural regression**
that outweighs the technical disappearance of the specific
`jd_000201` R1 RED.

## 23 · Recommended next loop

- **DO NOT** revert the checker.
- **DO NOT** loosen R1 or R2 to "hide" the regression.
- **DO NOT** rerun A / B in an ad-hoc loop.
- **DO NOT** promote QI to blocking.
- **DO NOT** start `AgentOps-5f-promote`.
- **Recommended**: a **prompt refinement design loop** that:
  - preserves the verbatim contract
  - **explicitly reinforces** that Evidence Appendix + `Evidence
    quote: "TEXT" — Company, jd_XXXXXX.` citation format MUST still
    be produced
  - allows shorter fragments explicitly ("even 5-word exact fragments
    are acceptable and preferred over silently dropping the citation
    format")
  - **removes** the ellipsis prohibition wording that may have been
    read as "if unsure, do not cite" and replaces it with a positive
    "one contiguous span per quote — emit multiple quotes if you
    need multiple spans"
  - considers escalating to **Option B** (separate `Quote:` and
    `Interpretation:` sub-fields) if a second prompt-only refinement
    still fails to preserve appendix + citation format
- **Alternative**: `git revert 11c581c` and hand off to human to
  decide whether to iterate the prompt (~$0.10 next attempt) or
  pause the tuning arc altogether.

## 24 · Final boundaries respected

- ✅ Only `src/lib/prompts.ts` modified (prompt patch · +8 lines)
- ✅ Only `scripts/test-evidence-quote-contract.mjs` added
  (deterministic $0 test)
- ✅ `scripts/quote-integrity-check.mjs` unchanged (hash `105ce8a`
  pre and post)
- ✅ `scripts/report-regression-local.mjs` unchanged (hash `4abfd9f`
  pre and post)
- ✅ No `.agent/scripts/**` change
- ✅ Fixture A ran exactly once · Fixture B ran exactly once ·
  **no retries** · no C/D/E · no A-E
- ✅ Actual paid cost: **~$0.10** total (2 real Sonnet 4.6
  generations)
- ✅ No baseline mutation · no baseline promotion · no blocking
  promotion · no AgentOps-5f-promote
- ✅ QI remains telemetry-only
- ✅ R1 unchanged · R2 unchanged · thresholds unchanged
- ✅ Pipeline untouched (`b019786` 起终一致)
- ✅ No PDFs · no OpenAI · no LLM judge · no edit-distance · no
  fuzzy · no post-generation quote replacement
- ✅ No production target · no manual deploy · no push
- ✅ No `report.md` / screenshot / full body / long quote / secret /
  auth / cookie / payload committed
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human` · Q10 pause unchanged
