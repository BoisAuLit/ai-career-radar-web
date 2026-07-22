# AgentOps-5c · Quote integrity integration prototype · findings memo

> Integration prototype run · scratchpad → committed · **$0 · 0
> generation · 0 harness run · 0 LLM/API call**.

## 1 · Purpose

Turn the AgentOps-5b scratchpad probe into a repeatable, committed
quote-integrity checker (`scripts/quote-integrity-check.mjs`) that
implements the two 5c approved refinements (case-insensitive
normalization tier · ellipsis-fragment matcher) and emits a small
committed `quote_integrity_summary.json` artifact under
`.agent/quote_integrity_runs/`. Still **not** a harness integration.
Still **not** a production gate. Still **not** a baseline refresh.

## 2 · Approved inputs from 5a / 5b

- **5a DECISION** (`2026-07-21_run_01_DECISION.md`):
  deterministic-first · no LLM judge · no edit-distance · cleaned
  served corpus is ground truth · A/B baselines grandfathered.
- **5b DECISION** (`2026-07-21_run_02_DECISION.md`):
  approve · two 5c refinements locked (case-insensitive AMBER tier ·
  ellipsis-fragment matcher) · `quote_integrity_summary.json`
  becomes a small committed artifact starting 5c integration.

## 3 · Files created

- `.agent/tasks/2026-07-21_run_03_TASK.md`
- `scripts/quote-integrity-check.mjs` (~250 lines · Node ESM · no
  deps · no network · no LLM/API)
- `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
- `.agent/design_memos/2026-07-21_AgentOps-5c_quote_integrity_integration_prototype.md` (this file)

## 4 · Input report path

`/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/20260719T054151Z_fixture-B/report.md`
— same Fixture B baseline source report used in 5b · confirmed
still present · 73 lines.

## 5 · Corpus path and actual record count

- **Path**: `src/data/web_bundle.json`
- **Record count**: **443**
- **Schema**: `{version, generated_at, n_records, aliases, records[]}`
- **Record fields**: `id / company / title / location / source_url /
  seniority / archetype / years_min / canonical_skills / raw_skills /
  body`
- **Body cleaning artifact**: newlines stored as pipe `|`; checker
  normalizes `|` → newline before matching.
- **Ground truth**: `cleaned_served_corpus` (not raw live web pages,
  not removed postings, not screenshots, not legal/original text).

## 6 · Checker CLI contract

```
node scripts/quote-integrity-check.mjs \
  --report <report.md path>            (required)
  --corpus <web_bundle.json path>      (required)
  --out    <summary.json path>         (required)
  [--fixture <A|B|C|D|E>]              (optional)
  [--source-run-id <id>]               (optional)
  [--help | -h]
```

- Emits JSON per §12 schema (v0.2-integration-prototype).
- `quote_snippet_60` capped ~60 chars.
- No full report body · no long quote excerpts · no secrets.
- Auto-creates parent dirs of `--out`.

## 7 · Implemented matching tiers

For each Evidence quote with cited `jd_id`, the checker tries in
order:

1. **Verbatim** substring in source body → GREEN `verbatim`
2. **Normalized** substring (curly quotes / dashes / ellipsis char /
   whitespace / pipe→newline) → AMBER `normalized`
3. **Case-insensitive** normalized substring → AMBER
   `case_insensitive` **(new 5c refinement #1)**
4. If quote contains `...` or `…`: ellipsis matcher (see §9)
5. Else RED `unmatched`

Unresolved `jd_id` → RED `unresolved_source_id`.

## 8 · Implemented case-insensitive AMBER tier

- Applied only after Tier 1 (verbatim) and Tier 2 (normalized) fail.
- Lowercases both sides after normalize.
- Matches count into `counts.case_insensitive_matches` and add an
  AMBER reason: `case-insensitive-only match for <jd_id>`.

## 9 · Implemented ellipsis-fragment matcher

- Triggered only when Tier 1/2/3 all fail **and** the quote actually
  contains `...` or `…`.
- Split rule: `/\s*(?:\.\.\.|…)\s*/`.
- Trivial-fragment filter: **<12 non-space chars OR <3 words** dropped
  from the meaningful set.
- Requires **≥2 meaningful fragments** (else falls back to whole-quote
  match).
- Every meaningful fragment must independently match the **same**
  source `body` through Tier 1 / 2 / 3.
- All fragments matched → AMBER `ellipsis_fragments`.
- Any meaningful fragment unmatched → RED
  `unmatched_ellipsis_fragment` (per-fragment tier is recorded in
  `sample_items[i].ellipsis_fragments`).

## 10 · Appendix cross-check

- Parses `Evidence Appendix` table (tab-separated
  `JD_ID\tCOMPANY\tTITLE`), terminated by the footer emoji row.
- Cross-checks appendix `jd_id` set against cited-in-Evidence-quote
  `jd_id` set.
- `in_appendix_not_quoted` → AMBER (`appendix_entries_not_cited`
  count).
- `in_quoted_not_appendix` → RED (`cited in evidence but missing
  from appendix`).

## 11 · Duplicate handling

- Counts identical evidence-quote snippets by normalized-lowercase
  key (`normalizeCI`).
- Duplicates are AMBER-only per 5a/5b DECISIONs.

## 12 · Output JSON schema

```
{
  "schema_version": "0.2-integration-prototype",
  "status": "integration_prototype",
  "fixture_id": "B" | null,
  "source_run_id": "20260719T054151Z_fixture-B" | null,
  "source_report_path": "...",
  "corpus_path": "src/data/web_bundle.json",
  "corpus_record_count": 443,
  "ground_truth": "cleaned_served_corpus",
  "verdict": "green" | "amber" | "red" | "blocked_no_report",
  "counts": { … 14 keys … },
  "red_reasons": [ … ],
  "amber_reasons": [ … ],
  "sample_items": [ { quote_snippet_60, quote_char_length,
                      citation_pattern, match_status, source_id,
                      company_check, role_check, corpus_company,
                      corpus_title, corpus_archetype,
                      ellipsis_fragments? }, … ],
  "appendix_entries": [ { jd_id, company, title }, … ],
  "cross_check": { in_appendix_not_quoted, in_quoted_not_appendix },
  "limitations": [ … 8 items … ]
}
```

## 13 · `quote_integrity_summary.json` result

- **Path**:
  `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
- **fixture_id**: `B`
- **source_run_id**: `20260719T054151Z_fixture-B`
- **verdict**: **`red`**

## 14 · Counts summary

| metric | value |
|---|---|
| `quote_candidates`（all `"…"` spans · informational） | **23** |
| `evidence_entries` | 5 |
| `evidence_quotes_with_citation` | 5 |
| `verbatim_matches` | **3** |
| `normalized_matches` | 0 |
| `case_insensitive_matches` | **0** |
| `ellipsis_fragment_matches` | **0** |
| `missing_source_id` | 0 |
| `unresolved_source_id` | 0 |
| `wrong_company` | 0 |
| `wrong_role` | 0 |
| `fabricated_or_unmatched_quotes` | **2** |
| `duplicates` | 1 |
| `appendix_entries_not_cited` | 1 |

## 15 · RED / AMBER / GREEN interpretation

- **RED reasons**:
  - `unmatched_ellipsis_fragment for jd_000201` (NVIDIA — fragment 2
    unmatched: model inserted a bridging `vs. ` connector at the
    start of the post-ellipsis fragment that does not appear in
    corpus body)
  - `unmatched quote for jd_000173` (Microsoft — trailing punctuation
    swap: report ends `productivity.` but corpus body has
    `productivity,`)
- **AMBER reasons**:
  - `in appendix but not cited by any Evidence quote: jd_000310`
    (Scale AI — appendix-only)
  - `duplicate evidence quotes: 1` (Databricks `jd_000347` cited
    twice with same verbatim text)

Verdict rollup: any RED → `red`.

## 16 · Were the 5b REDs reduced to AMBER?

**Partially, and honestly.** Both 5c refinements fired as designed:

- **NVIDIA `jd_000201`**: ellipsis matcher activated
  (`match_status = unmatched_ellipsis_fragment`).
  Fragment 1 (`"Evaluate and select ML approaches for specific
  problems: when to use LLM prompting vs. fine-tuning (QLoRA),
  classical ML"`, 120 chars) → **verbatim** in corpus body.
  Fragment 2 (`"vs. RAG vs. structured extraction."`, 34 chars) →
  **unmatched**. The corpus has `"RAG vs. structured extraction."`
  once; the model inserted an extra leading `vs. ` when stitching
  the two segments together. Correctly stays RED — this is a
  post-ellipsis grammar bridge and belongs in the "not literal"
  category, not the "clerical formatting" category.
- **Microsoft `jd_000173`**: case-insensitive tier tried and failed;
  ellipsis matcher not applicable (no `...`). The mismatch is at
  position 105 of the normalized-lowercased comparison: report ends
  the quote with `.` (0x2e) while corpus body has `,` (0x2c) — the
  report replaced the trailing comma with a sentence-terminating
  period. Rest of the quote matches byte-for-byte after lowercasing.
  Correctly stays RED at the current tier configuration.

The refinements did what they were designed to do: they caught the
"same-fragment-with-only-case-differences" and "clean ellipsis stitch
where every fragment matches" cases exactly. They did not silently
mask the residual issues, which are a **different category** of
quote-formatting behavior worth naming and deciding on separately.

## 17 · Remaining REDs

Two named residual behaviors, both surfaced honestly by the checker:

- **R1 — Post-ellipsis grammar bridging**: model inserts a
  connector word (`vs.` / `and` / `then` / etc.) at the start of a
  post-ellipsis fragment to keep the stitched sentence grammatical.
  This should probably stay RED in v2 — a grammar bridge that
  doesn't appear in the corpus is close enough to fabrication that a
  strict gate should catch it.
- **R2 — Trailing sentence-boundary punctuation swap**: model
  replaces a source `,`/`;`/no-punct with `.` (period) to terminate
  the quote as a standalone sentence. This is closer to legitimate
  editorial quoting and is a plausible AMBER tier in v2 (a
  narrow "trailing-punctuation-tolerance" AMBER rule that only
  applies to the *final* character of the quote when everything else
  is verbatim/CI-verbatim).

## 18 · What worked

- **Case-insensitive tier**: correctly implemented, correctly
  attempted for Microsoft, correctly failed for the right reason.
- **Ellipsis matcher**: correctly split on `.../…`, correctly
  filtered trivial fragments (≥12 non-space chars, ≥3 words),
  correctly demanded all-fragment-match on the same source body,
  correctly caught NVIDIA fragment 2 as a real integrity issue.
- **Appendix parser**: 5/5 rows extracted cleanly (tab-separated,
  terminated by footer emoji row).
- **Evidence-quote parser**: 5/5 candidates captured with company +
  `jd_id` (regex tolerates em/en/hyphen dashes and both straight and
  curly quote pairs).
- **Corpus resolution**: 5/5 resolved.
- **Duplicate detection**: correctly caught the Databricks quote
  cited twice.
- **Appendix cross-check**: correctly surfaced `jd_000310` Scale AI
  appendix-only.
- **Committed artifact**: emitted small (~5 KB) diff-friendly JSON
  under `.agent/quote_integrity_runs/` (not `.agent/scripts/**`,
  which is the hard-rule forbidden path).

## 19 · What failed or remains brittle

- **Trailing-punctuation swap** (Microsoft) not yet handled;
  documented as R2 above.
- **Post-ellipsis grammar bridge** (NVIDIA fragment 2) not
  auto-tolerated; documented as R1 above. This is arguably the
  correct behavior — a strict gate should not silently swallow
  connector-word insertions — but should be an explicit v2 policy
  decision.
- **Role check** remains a placeholder (`pass` if corpus record has
  any title; `unknown` otherwise).
- **Only `Evidence quote:` pattern** counts for the gate;
  informational-only double-quoted spans are not verified. This is
  the correct v1 policy but should be re-visited if the product
  starts leaning on inline quotes elsewhere.
- **Body cleanup artifact**: relying on `|` → `\n` heuristic; a
  cleaner corpus schema (`body` split on real newlines, or a
  separate `body_raw`) would remove this normalization detour.
- **No caching**: the checker reads the corpus JSON on every
  invocation. Fine for one-off; will need memoization if 5d integrates
  it into a per-fixture loop.

## 20 · Integration recommendation for future 5d

- **5d should be a single controlled A + B generation** with the
  checker running immediately after each generation, emitting one
  `quote_integrity_summary.json` per fixture under a new run-id.
  Expected cost ~$0.10 (two Sonnet 4.6 report generations).
- **5d must NOT mutate** existing Fixture A / B `current/` baselines
  in `.agent/regression_baselines/**` (per 5a DECISION #4
  grandfathering).
- **5d MAY** decide to define a "trailing-punctuation-tolerance"
  AMBER micro-tier (R2 above) if the human review deems it correct;
  otherwise keep Microsoft-style RED and address at prompt-tuning
  layer instead.
- **5d should NOT** silently tolerate post-ellipsis grammar bridging
  (R1) — that should stay RED unless human explicitly opts in via a
  DECISION.
- 5d could also decide whether `quote_integrity_summary.json` sits
  alongside `regression_runs/*/metadata.json` or in its current
  `quote_integrity_runs/` path.

## 21 · Baseline impact

- **No** `.agent/regression_baselines/**` mutation.
- Fixture A and Fixture B `current/` baselines untouched
  (`fixture-A_20260714T025246Z_current` at commit `451bb7f`,
  `fixture-B_20260719T054151Z_current` at commit `0341461`).
- Both remain conceptually `quote_integrity_not_evaluated`; the
  first per-run `quote_integrity_summary.json` sits **outside** the
  baseline envelope by design.

## 22 · Artifact policy

- **Committed**: `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
  (~5 KB, diff-friendly, sorted-ish keys, no full report body, no
  long quote excerpts, no secrets).
- **Not committed**: `report.md`, `report.png`, `/tmp` scratchpad
  artifacts, uploaded PDFs.
- Future runs may drop into `.agent/quote_integrity_runs/<RUNID>/`
  following the same pattern.

## 23 · Boundaries respected

- No `scripts/report-regression-local.mjs` edit (stable at `0341461`).
- No `.agent/scripts/**` edit (hard rule per AgentOps-2c Q3-Q8).
- No `src/**` edit.
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

## 24 · Next recommendation

**Human + ChatGPT review** this memo and the RUN_REPORT. Then write
DECISION for `2026-07-21_run_03`. Recommended DECISION posture:
**approve** with an explicit decision on R1 (post-ellipsis grammar
bridging = keep RED) and R2 (trailing-punctuation swap = decide
whether to add a narrow AMBER micro-tier in 5d or leave as RED and
address at prompt-tuning). Then AgentOps-5d as a single controlled
A+B generation with the checker attached, no baseline mutation,
~$0.10 cost.
