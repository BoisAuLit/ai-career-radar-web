# AgentOps-5b · Quote integrity parser prototype · findings memo

> Prototype run · 2026-07-21 · scratchpad-only script · **$0 · 0
> generation · 0 harness run · 0 LLM/API call**.

## 1 · Purpose

Prototype a deterministic quote-integrity parser per the 5a design
memo (`.agent/design_memos/2026-07-21_AgentOps-5a_quote_integrity_design.md`)
and run it once against an existing local scratchpad report to
validate feasibility. This memo captures what worked, what failed,
and what 5c integration should change.

## 2 · Inputs found

- **Corpus** (read-only): `src/data/web_bundle.json` · dict with
  `records[]` · **443 records** · schema `id / company / title /
  location / source_url / seniority / archetype / years_min /
  canonical_skills / raw_skills / body`.
- **Report** (read-only): `/var/folders/xx/…/T/acr-regression-runs/`
  `20260719T054151Z_fixture-B/report.md` · 73 lines · this is the
  Fixture B baseline **source** run (`fixture-B_20260719T054151Z_current`
  · promoted via DECISION `2026-07-19_run_03`).
- **Available fallbacks** (not used): 5 other scratchpad reports for
  Fixture A runs and one earlier Fixture B run.

No new generation. No harness run. No LLM call.

## 3 · Blocker status

**Not blocked.** Report and corpus were both present locally. Parser
ran once and emitted `/tmp/agentops-5b/qi_summary.json`.

## 4 · Corpus path and actual corpus schema

- Path: `src/data/web_bundle.json` (1.4 MB)
- Structure: top-level dict `{version, generated_at, n_records=443,
  aliases, records[]}`
- Record fields present: `id`, `company`, `title`, `location`,
  `source_url`, `seniority`, `archetype`, `years_min`,
  `canonical_skills`, `raw_skills`, `body`
- **Body cleaning artifact**: newlines in `body` are stored as pipe
  characters (`|`). Parser normalizes `|` → newline before matching.

## 5 · Report path used

`/var/folders/xx/ypnl5f2n0y7b48w_pgxyhqt80000gn/T/acr-regression-runs/`
`20260719T054151Z_fixture-B/report.md`

This report is the source of the current Fixture B baseline. Choosing
it lets the prototype exercise the current production-shape quote
behavior of the harness generator (Claude Sonnet 4.6, Fixture B
prompt).

## 6 · Prototype parser behavior

Written in Node.js (ES modules, no dependencies). Single-file
scratchpad script `/tmp/agentops-5b/quote_integrity_parser_probe.mjs`.

Steps executed:

1. Load report text.
2. Locate `Evidence Appendix` header and parse tab-separated
   `JD_ID\tCOMPANY\tTITLE` rows until the download / copy / eval
   footer emoji row is reached.
3. Extract explicit **Evidence quote** pattern:
   `Evidence quote: "TEXT" — Company, jd_XXXXXX.` (regex accepts
   em/en/hyphen dash).
4. Extract all other straight-double-quoted spans as informational
   counts (**not** used for the verdict).
5. For each **Evidence quote**, resolve `jd_id` in the corpus:
   verbatim match → GREEN mark · normalized match → AMBER mark ·
   unmatched → RED mark. Company check is case- and punctuation-
   insensitive containment.
6. Cross-check appendix vs cited-in-quotes sets.
7. Detect duplicate quote snippets by normalized-key count.
8. Emit `qi_summary.json` per 5a §7 schema envelope, extended with
   `appendix_entries` and `cross_check`.

## 7 · Matching rules implemented

- **Verbatim**: `record.body.includes(quote)` (with `|` → `\n` on
  body).
- **Normalized**: applies to both sides: whitespace collapse ·
  curly→straight quotes · em/en dash → hyphen · ellipsis char →
  `...`.
- **No edit-distance** (per DECISION #1).
- **No LLM judge** (per DECISION #6).
- **No case normalization** in v1 (see §14 finding — this caused a
  legitimate mismatch that AMBER-tier casing may want to catch).

## 8 · `qi_summary.json` output summary

- `schema_version`: `0.1-prototype`
- `status`: `prototype`
- `ground_truth`: `cleaned_served_corpus`
- `corpus_record_count`: **443**
- `verdict`: **`red`**
- `red_reasons`:
  - `unmatched quote for jd_000201`
  - `unmatched quote for jd_000173`
- `amber_reasons`:
  - `in appendix but not cited by any Evidence quote: jd_000310`

## 9 · Counts

- `quote_candidates`: **23** (all straight double-quoted spans in
  report, informational)
- `evidence_entries` (Appendix rows): **5**
- `evidence_quotes_with_citation`: **5**
- `verbatim_matches`: **3** (`jd_000042` Google DeepMind ×1,
  `jd_000347` Databricks ×2)
- `normalized_matches`: **0**
- `missing_source_id`: **0**
- `unresolved_source_id`: **0**
- `wrong_company`: **0**
- `wrong_role`: **0**
- `fabricated_or_unmatched_quotes`: **2** (`jd_000201`, `jd_000173`)
- `duplicates`: **1** (`jd_000347` Databricks evidence quote cited
  twice — same verbatim string)

## 10 · Verdict rollup

**RED** — driven by 2 unmatched evidence quotes on the current
Fixture B baseline source report.

Important nuance: manual spot-check (see §14) shows the underlying
evidence phrases **do exist** in the cited corpus records. The
mismatches are **not fabrication**; they are (a) case normalization
gap and (b) ellipsis-stitched multi-sentence quotes. This is a real
product finding, not a parser bug, but it is not the same category as
fully-fabricated evidence.

## 11 · Sample findings (short snippets only)

| # | jd_id | company | first 60 chars | status |
|---|---|---|---|---|
| 1 | `jd_000042` | Google DeepMind | `8 years of experience in software development with one or mo` | **verbatim** |
| 2 | `jd_000347` | Databricks | `Develop robust logging, telemetry, and evaluation harnesses ` | **verbatim** |
| 3 | `jd_000201` | NVIDIA | `Evaluate and select ML approaches for specific problems: whe` | **unmatched** |
| 4 | `jd_000173` | Microsoft | `Build AI-infused applications, Agentic Solutions and Copilot` | **unmatched** |
| 5 | `jd_000347` | Databricks | `Develop robust logging, telemetry, and evaluation harnesses ` | **verbatim (duplicate of #2)** |

Cross-check: `jd_000310` (Scale AI) appears in the Appendix table
but has no matching `Evidence quote:` line in the body → AMBER.

## 12 · What worked

- **Extraction** of `Evidence Appendix` (5/5 rows, correct
  tab-separated columns).
- **Extraction** of `Evidence quote:` pattern (5/5 candidates
  captured with correct company + jd_id).
- **Corpus resolution** by `id` (5/5 resolved cleanly).
- **Verbatim matching** for the 3 quotes that were literally copied.
- **Company check** (5/5 passed after case/punctuation
  normalization).
- **Cross-check** appendix ↔ quotes correctly surfaced the
  `jd_000310` unused-in-body appendix row.
- **Duplicate detection** correctly counted the Databricks quote
  cited twice.

## 13 · What failed

- **Case normalization gap** — v1 normalize does not lowercase.
  Report begins the Microsoft quote with capital `B`
  (`"Build AI-infused..."`) but corpus body has lowercase `build`
  (`"...You will build AI-infused..."`). Verbatim fails and the v1
  normalize (whitespace/quotes/dash only) does not close the gap.
- **Ellipsis-stitched quotes** — the NVIDIA quote is a two-fragment
  stitch joined by `...` (`"Evaluate and select ML approaches for
  specific problems: when to use LLM prompting vs. fine-tuning
  (QLoRA), classical ML... vs. RAG vs. structured extraction."`).
  Both fragments exist in corpus but the stitched literal does not.
- **False-negative risk**: with only whitespace/quote/dash
  normalization, real evidence that was semantically-faithful but
  stylistically reformatted (case, ellipsis) gets scored RED.

## 14 · Parsing gaps in the report format

- Report generator sometimes **capitalizes the first character** of a
  quoted span when starting a report sentence, even when source text
  starts with lowercase.
- Report generator sometimes **stitches** two source spans into one
  quoted span with `...` truncation between them (multi-clause
  quotes).
- Report **does not include per-sentence citations** other than the
  `Evidence quote: "X" — Company, jd_id.` pattern. Non-evidence
  quotes are stylistic (e.g., `"But actually":`, `"lazy"`,
  `"no eval loop"`) and are correctly classified informational-only
  by the parser.
- Report **wraps quotes in straight double quotes** only, not curly.
  Curly quote handling in normalize is defensive-only for now.

## 15 · Is Evidence Appendix machine-parseable enough?

**Yes.** Tab-separated `JD_ID\tCOMPANY\tTITLE` rows under an
`Evidence Appendix` header parsed cleanly. Footer emojis (`📋`,
`⬇️`, `📊`, `↺`) reliably terminate the table. No structural
change needed for 5c integration.

## 16 · Are source ids present near quotes?

**Yes** for the `Evidence quote:` pattern (`jd_XXXXXX` inline in the
sentence). **Not applicable** for the other double-quoted spans in
report body (they are stylistic paraphrase quotes, not evidence
citations, and should not be gated).

## 17 · Is company/title attribution parseable?

- **Company**: parseable inline in the `Evidence quote:` pattern
  after the em dash. Case+punctuation containment check passed 5/5.
- **Title/role**: not present inline in the `Evidence quote:` line;
  present in the Appendix row. Cross-check between appendix
  `TITLE` and cited quote's record is possible but v1 only checks
  that a title exists in the corpus record. A stricter role/
  archetype containment check is deferred to 5c integration.

## 18 · Recommended changes for 5c integration

**Adopt in 5c**:

- **Add case-insensitive normalization tier**: verbatim (case
  sensitive) → GREEN · case-only mismatch → **AMBER** (not RED) ·
  otherwise-normalized → AMBER · unmatched → RED. This closes the
  Microsoft "Build/build" gap without weakening the gate.
- **Recognize `...` as a truncation marker**: if a quote contains
  `...` (or Unicode `…`), split on `...` and check that each
  fragment individually verbatim-matches the same source body in
  order. All fragments match → **AMBER** (truncation-stitched but
  faithful). Any fragment unmatched → **RED**. This closes the
  NVIDIA gap.
- **Keep** two-tier + no-edit-distance + no-LLM (DECISION #1, #6
  unchanged).
- **Keep** blocking RED for real fabrication and wrong-company
  attribution (DECISION #5 unchanged).
- **Add** `quote_char_length` and `citation_pattern` fields to
  `sample_items` for auditability.
- **Add** appendix ↔ evidence cross-check to structural checks
  envelope.
- **Keep** duplicates as AMBER-only unless they inflate a claim's
  support.

**Do NOT adopt in 5c** (deferred / rejected):

- Edit-distance matching (DECISION #1: no).
- LLM judge (DECISION #6: no).
- Semantic equivalence (out of scope · would need embeddings).

## 19 · Should `quote_integrity_summary.json` be committed in future runs?

**Yes** once 5c wires the parser into the harness (per 5a DECISION
#3). Small (~5-15 KB expected). Diff-friendly JSON. Contains
counts, verdict, source ids, and short (60-char) snippets only. Not
the full report body. Full `report.md` and screenshots remain
scratchpad-only.

## 20 · Why A/B baselines were not mutated

Per 5a DECISION #4: A/B baselines are **grandfathered** and marked
conceptually `quote_integrity_not_evaluated`. Retroactive mutation
would break the frozen-baseline contract established in 3g/4b. A
future explicit AgentOps-5e loop can decide whether to refresh
baselines with quote-integrity fields (based on 5c/5d results). No
change to `.agent/regression_baselines/**` in this prototype.

## 21 · Why no generation / harness / LLM / API happened

Per TASK: **prototype-only readiness work**. Parser reads existing
scratchpad artifacts read-only. No Playwright, no
`scripts/report-regression-local.mjs` invocation, no `generate-report`
API call, no Anthropic API, no OpenAI API. Cost **$0**. Duration
of the prototype run itself: well under 1 second.

## 22 · Next recommendation

- **Human + ChatGPT review** this findings memo and the RUN_REPORT.
- Decide in the accompanying DECISION whether to accept the two 5c
  refinements proposed in §18 (case-normalized AMBER tier +
  ellipsis-fragment splitting).
- On approval, proceed to **AgentOps-5c** to integrate the parser
  behind the harness envelope, still in local scratchpad mode. 5c
  should **not** mutate A/B baselines and should **not** run new
  generation.
- Keep the current `red` prototype verdict as a **product signal**:
  the model's quote formatting habits (capitalization, ellipsis
  stitching) are the real target for 5c — either the parser tolerates
  those in AMBER, or the prompt learns to preserve verbatim quoting.

**Do not** merge the prototype script into `.agent/scripts/**` (hard
rule). If a committed reproducibility artifact is later requested,
place it under `.agent/prototypes/` as a documentation snapshot only
— but the current recommendation is scratchpad-only until 5c decides
the final API.
