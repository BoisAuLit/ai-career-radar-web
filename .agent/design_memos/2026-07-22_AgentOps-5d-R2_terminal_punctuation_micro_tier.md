# AgentOps-5d-R2 · Terminal-punctuation AMBER micro-tier · findings memo

> Checker refinement run · **$0 · 0 generation · 0 harness run · 0
> LLM/API call · 0 baseline mutation · 5c artifact untouched.**

## 1 · Purpose

Implement the R2 terminal-punctuation AMBER micro-tier approved in
5c DECISION (`.agent/decisions/2026-07-21_run_03_DECISION.md`,
§Policy decision R2), and re-run the checker once on the same
Fixture B baseline source report that 5c used. Prove that the
Microsoft `jd_000173` mismatch (a source-comma / report-period
sentence-boundary swap) now classifies as **AMBER** instead of
**RED**, while the NVIDIA `jd_000201` mismatch (grammar-bridging
inside an ellipsis stitch) **remains RED** per R1.

## 2 · Approved R2 policy from 5c DECISION

R2 = **trailing sentence-boundary punctuation swap** (source
`,`/`;`/no-punct → report `.`).

Micro-tier applies **only when all 8 strict conditions hold**:

1. source id resolves
2. company check passes
3. role/title check is `pass` or `unknown`, not `fail`
4. the only unmatched difference is the final punctuation mark
5. rest matches verbatim, normalized, or case-insensitive normalized
6. no word inserted, deleted, reordered, or replaced
7. quote length ≥ 40 non-space characters
8. punctuation change does not change meaning
   - allowed source terminals: `,` · `;` · no-final-punct
   - forbidden: `?` · `!` · `:` · any internal punctuation change ·
     any word-level difference

If any condition fails → keep previous classification (which for
Microsoft was RED `unmatched`).

## 3 · Files changed

- `.agent/tasks/2026-07-22_run_01_TASK.md` (new · 168 lines)
- `scripts/quote-integrity-check.mjs` (modified · R2 helper +
  integration + count field + schema bump + limitations)
- `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/quote_integrity_summary.json`
  (new committed small artifact · v0.3-r2-terminal-punctuation)
- `.agent/design_memos/2026-07-22_AgentOps-5d-R2_terminal_punctuation_micro_tier.md`
  (this file)

**Frozen** (not touched):
`.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
still `v0.2-integration-prototype`, still 2 REDs — verified read-only
after the R2 implementation.

## 4 · Input report path

`/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260719T054151Z_fixture-B/report.md`
— same Fixture B baseline source report used by 5c (73 lines, still
present).

## 5 · Corpus path and record count

- **Path**: `src/data/web_bundle.json`
- **Record count**: **443**
- **Ground truth**: `cleaned_served_corpus` (unchanged from 5a/5b/5c
  DECISIONs).

## 6 · Checker changes

Additive-only. No existing behavior removed. Two new pieces plus
some plumbing:

1. `isAllowedSourceTerminal(nextChar)` helper — implements
   condition 8.
2. `matchTerminalPunctuationOnly(quote, record, companyCheck,
   roleCheck)` helper — implements conditions 1–8 as a single
   guarded probe. Tries tier 1 (verbatim), tier 2 (normalized),
   tier 3 (case-insensitive) on `quote[:-1]` against the source
   body; if a match ends with an allowed source terminal char,
   returns `{status: "terminal_punctuation_only", sub_tier, source_terminal_char}`.
3. Main loop: after `matchTiered` returns `unmatched`, try R2
   **before** the ellipsis matcher. If R2 fires, use it; else fall
   through to the ellipsis matcher (only when quote contains `.../…`)
   and finally RED `unmatched`.
4. `counts.terminal_punctuation_only_matches: 0` added to the
   counters object.
5. Switch statement: new case `terminal_punctuation_only` →
   increments count · adds AMBER reason.
6. `sample_items` items now optionally include `r2_sub_tier` and
   `r2_source_terminal_char` when R2 fires.
7. `schema_version` bumped from `0.2-integration-prototype` to
   `0.3-r2-terminal-punctuation`.
8. `limitations` array extended with two lines documenting the R2
   tier scope and the locked R1 policy.

## 7 · Eight R2 conditions implemented

| # | condition | where in code |
|---|---|---|
| 1 | source id resolves | caller guard (`if (!record) return null`) |
| 2 | company check passes | `if (companyCheck !== "pass") return null` |
| 3 | role check pass/unknown, not fail | `if (roleCheck === "fail") return null` |
| 4 | only diff is final punct | substring match of `quote[:-1]` (period stripped) against body |
| 5 | rest matches verbatim/normalized/CI-normalized | 3-tier attempt loop |
| 6 | no word inserted/deleted/reordered/replaced | guaranteed by contiguous substring match |
| 7 | quote ≥ 40 non-space chars | `if (nonSpaceLen < R2_MIN_NONSPACE_CHARS) return null` |
| 8 | punct change preserves meaning | `isAllowedSourceTerminal(nextChar)` restricts source terminal to `,` / `;` / whitespace/EOF |

## 8 · New output schema fields

- `counts.terminal_punctuation_only_matches` (integer)
- `sample_items[].match_status` may now equal `"terminal_punctuation_only"`
- `sample_items[].r2_sub_tier` (`"verbatim" | "normalized" | "case_insensitive"`; present only when R2 fires)
- `sample_items[].r2_source_terminal_char` (`"," | ";" | " " | "\n" | ""`; present only when R2 fires)
- `schema_version` = `"0.3-r2-terminal-punctuation"`

## 9 · Run command

```
node scripts/quote-integrity-check.mjs \
  --report /var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260719T054151Z_fixture-B/report.md \
  --corpus src/data/web_bundle.json \
  --out    .agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/quote_integrity_summary.json \
  --fixture B \
  --source-run-id 20260719T054151Z_fixture-B
```

Wall clock: <1 s.

## 10 · `quote_integrity_summary` result

- **schema_version**: `0.3-r2-terminal-punctuation`
- **fixture_id**: `B`
- **source_run_id**: `20260719T054151Z_fixture-B`
- **corpus_record_count**: **443**
- **ground_truth**: `cleaned_served_corpus`
- **verdict**: **`red`** (unchanged from 5c overall verdict, but the
  RED set shrank from 2 → 1)

### Counts

| metric | 5c value | 5d-R2 value | delta |
|---|---:|---:|---|
| `quote_candidates` | 23 | 23 | — |
| `evidence_entries` | 5 | 5 | — |
| `evidence_quotes_with_citation` | 5 | 5 | — |
| `verbatim_matches` | 3 | 3 | — |
| `normalized_matches` | 0 | 0 | — |
| `case_insensitive_matches` | 0 | 0 | — |
| `ellipsis_fragment_matches` | 0 | 0 | — |
| **`terminal_punctuation_only_matches`** | **(field n/a)** | **1** | **new** |
| `missing_source_id` | 0 | 0 | — |
| `unresolved_source_id` | 0 | 0 | — |
| `wrong_company` | 0 | 0 | — |
| `wrong_role` | 0 | 0 | — |
| **`fabricated_or_unmatched_quotes`** | **2** | **1** | **−1** |
| `duplicates` | 1 | 1 | — |
| `appendix_entries_not_cited` | 1 | 1 | — |

### RED reasons

- `unmatched_ellipsis_fragment for jd_000201` (NVIDIA — R1 preserved)

(Down from 2 REDs in 5c.)

### AMBER reasons

- **`terminal-punctuation-only match for jd_000173`** (Microsoft — R2
  fired · new)
- `in appendix but not cited by any Evidence quote: jd_000310`
  (Scale AI — unchanged)
- `duplicate evidence quotes: 1` (Databricks — unchanged)

## 11 · Microsoft `jd_000173` · RED → AMBER?

**Yes.** Now classified `terminal_punctuation_only` with:

- `r2_sub_tier`: `case_insensitive` (the rest of the quote matches
  only after lowercasing)
- `r2_source_terminal_char`: `,` (source ends `productivity,`, report
  ends `productivity.`)
- `quote_char_length`: 106 (≥ 40 non-space chars — condition 7 ✓)
- `company_check`: `pass` (Microsoft — condition 2 ✓)
- `role_check`: `pass` (title present — condition 3 ✓)
- source substring of `quote[:-1]` found → conditions 4/5/6 ✓
- `,` → `.` is an allowed meaning-preserving swap → condition 8 ✓

All 8 conditions satisfied. AMBER classification is exactly the
behavior 5c DECISION §Policy decision R2 approved.

## 12 · NVIDIA `jd_000201` · stays RED?

**Yes.** The R2 tier is tried after tier 1–3 fail, but R2 requires a
contiguous substring match of `quote[:-1]` in the source body. The
NVIDIA quote is ellipsis-stitched — its `quote[:-1]` still contains
the literal `...` in the middle, and no such substring exists in the
corpus body. R2 returns `null` and control falls through to the
ellipsis matcher.

Ellipsis matcher splits into two meaningful fragments:

- Fragment 1 (120 chars): `"Evaluate and select ML approaches for
  specific problems: when to use LLM prompting vs. fine-tuning
  (QLoRA), classical ML"` → **verbatim** in corpus body.
- Fragment 2 (34 chars): `"vs. RAG vs. structured extraction."` →
  **unmatched**. The corpus body has `"RAG vs. structured extraction."`
  (single `vs.`); the model inserted a bridging `vs. ` at the start
  of the post-ellipsis fragment. That leading `vs.` is not in the
  source body — a **connector-word insertion** per R1.

`match_status` = `unmatched_ellipsis_fragment` → RED. R1 policy
preserved as designed.

## 13 · Remaining RED reasons

- `unmatched_ellipsis_fragment for jd_000201` (only remaining RED)

Verdict still `red` because any single RED escalates the rollup.
This is the intended behavior per 5c DECISION and R1.

## 14 · Remaining AMBER reasons

- `terminal-punctuation-only match for jd_000173` (new · R2 fire)
- `in appendix but not cited by any Evidence quote: jd_000310`
- `duplicate evidence quotes: 1`

## 15 · Why R1 remains RED

Per 5c DECISION §Policy decision R1: post-ellipsis grammar bridging
is **not clerical formatting**. When a model inserts a connector
word or bridge phrase (`vs.` / `and` / `then`) at the start of a
post-ellipsis fragment, the phrase does not appear in the source
body — this is fabrication-adjacent. Strict quote-integrity gate
should catch it, and silently downgrading such cases to AMBER would
mask real integrity concerns.

This DECISION was locked in `2026-07-21_run_03_DECISION.md` §Policy
decision R1 and is not re-litigated in this loop. The R2 tier only
covers the meaningful subset of "same words, one final-punctuation
character differs" — nothing broader.

## 16 · What worked

- **R2 tier implementation** is additive-only, ~65 lines of new code
  in one helper + one integration point + minor plumbing. No
  existing tier weakened. No LLM. No edit-distance. No network.
- **All 8 strict conditions** enforced deterministically. Trivially
  auditable.
- **Microsoft `jd_000173`** correctly moved RED → AMBER with the
  full audit trail visible in `sample_items[3].r2_sub_tier` and
  `sample_items[3].r2_source_terminal_char`.
- **NVIDIA `jd_000201`** correctly stays RED (R1 preserved).
- **Scale AI `jd_000310`** unchanged AMBER (appendix cross-check).
- **Databricks duplicate** unchanged AMBER.
- **5c artifact frozen** — verified: `v0.2-integration-prototype`
  still on disk, still 2 REDs, no diff.
- **Schema bump** to `v0.3-r2-terminal-punctuation` makes the
  version visible in every future artifact.
- **New committed summary artifact** under
  `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/`
  — small (~6 KB · diff-friendly · `quote_snippet_60` capped ~60
  chars · no full report body · no long quote excerpts · no
  secrets).

## 17 · What remains brittle

- **Overall verdict is still RED** — driven by NVIDIA R1. This is
  the intended R1 behavior; not a defect of R2.
- **Role/title check** is still a title-presence placeholder — a
  future refinement could add archetype containment checks.
- **Only `Evidence quote:` pattern** is gated (other double-quoted
  spans are informational-only).
- **Corpus `|` → `\n` heuristic** is still fragile at the ingest
  layer.
- **Checker still not integrated** into
  `scripts/report-regression-local.mjs`.
- **A/B baselines remain `quote_integrity_not_evaluated`** per 5a
  DECISION #4 grandfathering.
- **No caching**: still fine for one-off; a per-fixture loop should
  memoize corpus load.
- **No production quote validation** yet.

## 18 · Baseline impact

- **No** `.agent/regression_baselines/**` mutation.
- Fixture A `current` (`fixture-A_20260714T025246Z_current`,
  commit `451bb7f`) untouched.
- Fixture B `current` (`fixture-B_20260719T054151Z_current`,
  commit `0341461`) untouched.
- Both remain conceptually `quote_integrity_not_evaluated`; the
  first two `quote_integrity_summary.json` artifacts (5c + 5d-R2)
  live outside the baseline envelope by design.

## 19 · Artifact policy

- **Committed**:
  - `scripts/quote-integrity-check.mjs` (modified)
  - `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/quote_integrity_summary.json`
    (new · ~6 KB)
  - `.agent/tasks/2026-07-22_run_01_TASK.md`
  - `.agent/design_memos/2026-07-22_AgentOps-5d-R2_terminal_punctuation_micro_tier.md`
- **Not committed**: `report.md`, `report.png`, `/tmp/agentops-5b/`
  scratchpad artifacts, uploaded PDFs, full report body, long quote
  excerpts, secrets.
- **Frozen (not touched)**:
  `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/**`.

## 20 · Boundaries respected

- No `scripts/report-regression-local.mjs` edit (stable at `0341461`).
- No `.agent/scripts/**` edit (hard rule per AgentOps-2c Q3-Q8).
- No `src/**` edit (`src/data/web_bundle.json` read-only reference).
- No `.agent/regression_baselines/**` / `regression_runs/**` /
  `regression_fixtures/**` edit.
- No pipeline edit (`b019786` unchanged).
- No harness run · no report generation · no Playwright · no
  Anthropic/OpenAI call.
- No `package.json` / lockfile / `.github/workflows/**` / `.env*` /
  `vercel.json` / Codex-Claude config edits.
- No uploaded PDFs · no `report.md` · no `*.png` committed.
- No blocker resolved (BLK-0001 / BLK-0002 / BLK-0003 remain `open`).
- No G2.1d start · no Codex planner implementation.
- Cost: **$0**.
- **5c artifact untouched** (verified: schema and REDs unchanged).

## 21 · Recommended next step

**Human + ChatGPT review** this memo + the RUN_REPORT + the new
`v0.3-r2-terminal-punctuation` summary artifact. Then write DECISION
for `2026-07-22_run_01`.

Recommended DECISION posture: **approve**. Required fixes: **none**.

Two credible next-loop paths after DECISION + push + cleanup:

- **AgentOps-5d · controlled A + B generation with checker attached**
  — now that the checker policy is complete (R1 + R2 both locked and
  live), a single controlled A + B generation can produce two fresh
  `quote_integrity_summary.json` artifacts and prove the checker
  works on brand-new outputs. Cost ~$0.10 (two Sonnet 4.6 report
  generations). No baseline mutation.
- **AgentOps-5c-integrate** — instead of a new generation, wire the
  checker into `scripts/report-regression-local.mjs` so future
  regression runs automatically emit a `quote_integrity_summary.json`
  alongside `metadata.json`. Still no generation. Still $0. Could
  precede 5d generation to make 5d completely turnkey.

**Executor mild preference**: do the harness integration
(`5c-integrate`) first because it makes 5d simpler and cheaper to
run repeatedly, and because it locks the checker into the same
envelope as the existing 25-check regression gate before running a
paid generation. But either order is defensible.
