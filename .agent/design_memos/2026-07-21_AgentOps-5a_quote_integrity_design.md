# AgentOps-5a · Quote Integrity Design Memo

- **Date**: 2026-07-21
- **Loop**: `AgentOps-5a`
- **Parent loop**: `AgentOps-4b` (`2026-07-19_run_03`)
- **Type**: Design / protocol / memo-only (no code, no run, no baseline
  file, no LLM call)
- **Status**: Draft · pending human + ChatGPT review + DECISION
- **Owner**: Bohao (product) · Claude (executor) · ChatGPT (reviewer)

## 1. Purpose

AgentOps-3 → AgentOps-4b built a **structural** report regression gate
and produced two official baselines: Fixture A
(`fixture-A_20260714T025246Z_current`) and Fixture B
(`fixture-B_20260719T054151Z_current`). Those baselines catch:
capture-scope collapse, missing sections, missing Evidence Appendix,
wrong-archetype recommendations, generic beginner fallback, incomplete
streaming, and length outliers.

They do **not** catch a much scarier failure mode: the report says
`"we help engineers ship LLM features" — Acme AI (jd_000042)` but
`jd_000042` never contained that sentence — the model paraphrased,
fabricated, or attributed a quote to the wrong JD. The user reads a
confident citation with a `jd_id`; the citation is a lie. The whole
product-trust story collapses.

Quote integrity is now the highest-leverage next quality layer.
Before expanding to Fixture C / D / E, we should design (and later
implement) a **deterministic, cheap** citation-integrity gate that
verifies quoted spans actually appear in the cited JD's `body`
field and that the metadata around the quote (`jd_id`, `company`,
`title`) matches the corpus record. Everything else (semantic
faithfulness, LLM judge, semantic equivalence) can wait.

## 2. Current state

### What A/B baselines DO validate today

- **Structural**: page load, form fill, generate click, done state,
  incomplete banner absent (Candidate 1 sentinel), report non-empty,
  capture-scope non-body, all 5 required section headers present
  (`Target role`, `What you already have`, `Top 5 gaps`,
  `Over-prioritizing`, `Highest-leverage next action`), Evidence
  Appendix present (regex: `evidence appendix|## evidence`),
  report length in soft band, action-bar buttons present.
- **Fixture-specific**: ≥2 expected strengths reflected, ≥2 expected
  gaps reflected, must-not-happen literals absent,
  recommendation-match keyword hit-rate.
- **Operational**: duration soft/hard thresholds, no fatal Playwright
  error, no production target.

### What A/B baselines do NOT validate today

- **Exact quote provenance**: whether a quoted span in the report text
  actually appears verbatim in the cited JD's `body`.
- **Citation-source matching**: whether the `jd_id` cited exists in
  `web_bundle.json` at all.
- **Attribution correctness**: whether the `company` / `title` the
  report attaches to a quote match the record with that `jd_id`.
- **Cross-fixture attribution**: whether the report cites a JD that
  wasn't in the 5 Evidence JDs shown to the model.
- **Quote-to-claim alignment**: whether the quoted evidence actually
  supports the specific claim it's attached to.
- **Evidence Appendix consistency**: whether every appendix item is
  referenced somewhere in the body, and every in-body citation
  appears in the appendix.
- **Duplicate evidence**: whether the report counts the same JD twice
  as if it were two independent evidence points.
- **Stale evidence**: whether the corpus snapshot changed since the
  report was generated (should be an audit signal, not necessarily
  RED).
- **Semantic faithfulness**: paraphrase that changes meaning ("we're
  hiring for RAG" → "we require RAG expertise"). Deferred (would
  need an LLM judge).

## 3. Definitions

Precise vocabulary for the rest of the memo and future 5b-5e loops.
Use verbatim.

- **quote**: a span of text in the report presented as taken from a
  specific JD, usually wrapped in double-quotes, single-quotes,
  markdown blockquote (`>`), or explicit "…" typographic quotes.
- **citation**: the attribution attached to a quote, at minimum a
  `jd_id` tag (e.g. `jd_000042`), and often also a company name and
  role title.
- **evidence item**: an entry in the report's `## Evidence Appendix`
  (or equivalent) — currently spec'd as `jd_id + company + title
  only` per `src/lib/prompts.ts`.
- **source JD**: a row in `src/data/web_bundle.json.records[]`,
  identified by `id` (e.g. `jd_000001`), with fields `id`, `company`,
  `title`, `location`, `source_url`, `seniority`, `archetype`,
  `years_min`, `canonical_skills`, `raw_skills`, `body`.
- **extracted JD record**: the specific `record` object referenced by
  a `jd_id`; the source of truth for that JD's canonical text (the
  `body` field).
- **claim**: any statement in the report that would ordinarily
  require evidence — most commonly bullet items under
  `## Top 5 gaps`, `## Over-prioritizing`, `## Highest-leverage next
  action`, and evidence-referenced sentences elsewhere.
- **attribution**: the mapping `(quoted_span) → (jd_id, company,
  title)` that the report asserts.
- **quote integrity**: the property that every quoted span in the
  report appears **verbatim** (or within a tightly-defined
  normalization envelope · see §5) in the cited JD's `body`, and
  that the citation `jd_id` exists in the corpus.
- **citation integrity**: the property that every citation's
  attached metadata (`company`, `title`) matches the corpus record
  for the cited `jd_id`.
- **evidence-to-claim alignment**: the property that Evidence
  Appendix entries and in-body citations are mutually consistent —
  every appendix `jd_id` is cited in the body at least once, and
  every in-body `jd_id` citation is listed in the appendix.

## 4. Failure modes

Non-exhaustive list of what a quote-integrity gate should aim to
detect (subset of them in v1; rest deferred):

1. **Fabricated quote**: the quoted string does not appear in any
   record's `body`. (In-scope for v1 · RED.)
2. **Paraphrase presented as a quote**: text near-matches source but
   is not verbatim; may be a semantic drift risk. (In-scope for v1
   via fuzzy match with strict threshold · AMBER if
   normalization-only difference · RED if paraphrase.)
3. **Wrong-company attribution**: quote appears in JD `X`, but is
   attributed to JD `Y`'s company. (In-scope for v1 · RED.)
4. **Cross-role attribution**: quote from a JD with archetype `Y`
   used to argue about archetype `X`. (In-scope for v1 as an amber
   signal; may become red later.)
5. **Stale/removed JD**: cited `jd_id` isn't in the corpus at all,
   or was in a superseded snapshot. (In-scope for v1 · RED for
   unknown id · AMBER for stale snapshot mismatch.)
6. **Evidence Appendix present but disconnected**: the appendix
   lists JDs, but no in-body citation references them (or vice
   versa). (In-scope for v1 · AMBER.)
7. **Too-generic quote**: `"we ship AI features"` — technically may
   appear in many JDs, offers no differentiating support for the
   claim. (Deferred to a later loop; needs corpus IDF or LLM judge.)
8. **Misleading truncation**: `"...will replace…"` cut so that
   context is inverted. (Deferred; hard to detect without semantic
   analysis.)
9. **Model rewrote punctuation / case**: `"we're"` vs `"we are"`.
   (In-scope for v1 · AMBER if within tight normalization
   envelope, RED otherwise.)
10. **Missing source metadata**: quote present but no `jd_id` tag.
    (In-scope for v1 · AMBER.)
11. **Duplicate evidence as independent support**: same `jd_id`
    cited under three different bullet points to imply three
    independent signals. (In-scope for v1 as an amber count.)
12. **Overreach**: the claim states more than the quote can
    support. (Deferred; needs semantic analysis / LLM judge.)

**v1 in-scope subset**: 1, 2, 3, 5, 6, 9, 10, 11.
**v1 out of scope**: 4 (dropped to amber, no red gate), 7, 8, 12.

## 5. Desired quality gate

**v1 design principles**:

- **Deterministic first.** No LLM judge. No embedding similarity.
  Purely string-matching + metadata-lookup.
- **Source-text matching where possible.** The `body` field on each
  `record` in `web_bundle.json` is the ground truth.
- **Quote string containment.** For every quoted span in the report,
  check whether the span appears in the cited JD's `body`.
- **Fuzzy containment as a limited fallback.** Normalize whitespace
  (collapse runs to single space), normalize punctuation (curly →
  straight quotes, em-dash → hyphen, ellipsis → three dots),
  lowercase for the comparison only. If the normalized quote is not
  in the normalized `body` — RED for "fabricated". If it appears
  in normalized form but not verbatim — AMBER for "punctuation
  drift".
- **Citation id / company / role / source alignment.** For every
  cited `jd_id`, look up the record. If missing → RED. If found,
  check that any attributed `company` / `title` matches the record's
  fields (case-insensitive, strip corporate suffixes like `, Inc.` /
  `Ltd.` before comparison). Mismatch → RED.
- **Evidence Appendix consistency.** Every appendix `jd_id` must be
  cited in the body at least once (AMBER if not). Every in-body
  citation must be listed in the appendix (AMBER if not).
- **No LLM judge in v1.** Explicitly forbidden unless a separate
  DECISION approves it later (would require additional API cost,
  determinism concerns, and possibly OpenAI-API scope reopening).
- **Local artifact only.** Result written into the same
  `.agent/regression_runs/<run-id>/` directory. Never posted to
  production. Never fetched from remote.
- **No production target.**
- **No OpenAI API.**

## 6. Data requirements

The gate needs the following inputs, all already available locally:

- **Report text.** The captured `main section` text from the current
  harness — already saved as `report.md` in the run scratchpad
  (`/var/folders/.../report.md`); still not committed in v1 per
  storage policy.
- **Extracted Evidence Appendix.** Parsed from the report text —
  regex on the `## Evidence` heading and subsequent list items until
  end-of-document.
- **Quote spans.** Extracted from the report text via one of three
  patterns (in order of confidence):
  - Markdown blockquote lines starting with `> `.
  - Double-quoted spans `"..."` longer than N words (default N = 5).
  - Single-quoted or typographic-quoted spans `'...'` / `"..."` /
    `'...'` longer than N words.
- **Citation ids.** Extracted from adjacent text using regex
  `\bjd_\d{5,7}\b`.
- **Company / role metadata.** Extracted from citation context (the
  `jd_id` tag is often accompanied by a company name and possibly a
  role title, per prompt convention "quote language from a specific
  JD in the evidence list (with the jd_id / company tag)").
- **Source JD text.** Read from `src/data/web_bundle.json.records[]`
  — each record's `body` is the canonical text.
- **Corpus snapshot id / date.** Read from `src/lib/web-bundle-stats.ts`
  (`corpusSnapshotDate`) — already recorded in every run's
  `metadata.json`.
- **Generated report metadata.** The existing
  `.agent/regression_runs/<run-id>/metadata.json` provides
  `git_commit_sha`, `model_display`, `corpus_snapshot_date`,
  `capture_scope`, and the source scratchpath.

**Scratchpad-only data**: `report.md`, `screenshot.png`. Same v1
storage policy — the quote-integrity gate reads from scratchpad but
does not need to commit the full report.

## 7. Proposed v1 algorithm

```
Input:
  reportText              (str)          # from scratchpad report.md
  webBundle               (dict)         # from src/data/web_bundle.json
  corpusSnapshotDate      (str)          # sanity check

Steps:

1. PARSE_REPORT_SECTIONS
   split reportText on H2 headers into named sections. Confirm the
   canonical 5 + Evidence Appendix (already verified by structural
   check `contains_evidence_appendix`).

2. EXTRACT_EVIDENCE_APPENDIX_ITEMS(reportText) -> list of
   { jd_id, company_attributed, title_attributed, raw_line }
   Regex: /jd_\d{5,7}/  then split on em-dash / hyphen / colon to
   recover the "jd_id — company — title" shape from the prompt.

3. EXTRACT_QUOTES(reportText) -> list of
   { quoted_span, kind (blockquote|double|typo), near_jd_id,
     paragraph_offset }
   In order:
     - lines matching /^>\s+/           → blockquote quotes
     - spans matching /"([^"\n]{20,})"/ → double-quote quotes
     - spans matching /"([^"\n]{20,})"/ or /'([^'\n]{20,})'/
                                         → typographic quotes
   For each quote, walk backward N=200 chars to find nearest `jd_id`
   token; record as `near_jd_id`.

4. NORMALIZE(s) -> str
   s.replace(curly quotes, straight)
    .replace(em-dash, hyphen)
    .replace(ellipsis, "...")
    .collapse whitespace
    .lowercase()

5. For each quote in EXTRACT_QUOTES:
   a. lookup = webBundle.records.find(r => r.id == quote.near_jd_id)
   b. if not lookup:
        quote.status = "unknown_jd_id"           # RED
        continue
   c. body_norm = NORMALIZE(lookup.body)
      quote_norm = NORMALIZE(quote.quoted_span)
   d. if quote.quoted_span in lookup.body:
        quote.status = "verbatim_match"          # OK
      elif quote_norm in body_norm:
        quote.status = "normalized_match"        # AMBER (drift)
      else:
        quote.status = "fabricated"              # RED

6. For each Evidence Appendix item in EXTRACT_EVIDENCE_APPENDIX_ITEMS:
   a. lookup = webBundle.records.find(r => r.id == item.jd_id)
   b. if not lookup:
        item.status = "unknown_jd_id"            # RED
        continue
   c. normalize(item.company_attributed) vs normalize(lookup.company)
      (strip corporate suffixes: ", inc" / ", ltd" / ", llc" / etc)
      mismatch → item.attribution_status = "wrong_company"  # RED
   d. same for title (looser: containment or prefix match) →
      mismatch → item.attribution_status = "wrong_title"    # AMBER

7. CROSS_REFERENCE:
   appendix_ids = { item.jd_id for item in appendix }
   body_ids     = { q.near_jd_id for q in quotes if q.near_jd_id }
   orphan_in_appendix = appendix_ids - body_ids   # AMBER count
   orphan_in_body     = body_ids - appendix_ids   # AMBER count

8. DUPLICATE_EVIDENCE:
   count how many distinct claims cite the same jd_id.
   if same jd_id cited in ≥3 distinct claim bullets → AMBER.

9. CLASSIFY:
   any status RED → verdict red
   any status AMBER + no RED → verdict amber
   all OK → verdict green

10. EMIT:
    quote_integrity_summary.json (part of run_dir)
    contains: total_quotes, verbatim_matches, normalized_matches,
    fabricated, unknown_jd_ids, wrong_company_attributions,
    wrong_title_attributions, orphan_in_appendix, orphan_in_body,
    duplicate_evidence_count, verdict, per_quote_details (small).
```

**Not in this algorithm** (deferred): claim-quote semantic alignment,
paraphrase detection, cross-role attribution beyond `jd_id` lookup,
misleading-truncation detection, corpus IDF for too-generic detection.
All would require either LLM judge or non-trivial NLP tokenization.

## 8. Suggested thresholds

**GREEN** (all must hold):
- Every extracted quote has status `verbatim_match`.
- Every Evidence Appendix item has status OK
  (`attribution_status == "verbatim_match"` or absent).
- No `unknown_jd_id` in either quotes or appendix.
- `orphan_in_appendix == 0` **and** `orphan_in_body == 0`.
- `duplicate_evidence_count == 0`.

**AMBER** (at least one, none of the RED conditions):
- Any quote at status `normalized_match` (punctuation / whitespace
  drift only, no meaning change).
- Any appendix item at `wrong_title` (looser matching).
- `orphan_in_appendix > 0` OR `orphan_in_body > 0`.
- `duplicate_evidence_count > 0`.
- Missing `jd_id` tag adjacent to a quote (status = `missing_metadata`).

**RED** (any one triggers):
- Any quote at status `fabricated` (not in normalized `body`).
- Any quote or appendix item at status `unknown_jd_id`.
- Any appendix item at `wrong_company` (attribution mismatch).
- Evidence Appendix absent when the body contains any citation-like
  `jd_id` reference. (Already partly covered by
  `contains_evidence_appendix` structural check; this makes it a
  quote-integrity RED too when there is body evidence to appendix.)

Thresholds are intentionally **conservative** — fabrication and
wrong-company attribution are catastrophic to the product's trust
story, so they must be RED with no grace period.

## 9. Integration with regression harness

Where the gate plugs in (design only — no code in this loop):

- **`scripts/report-regression-local.mjs`**: at the end of the run,
  after `extractReportText`, call `runQuoteIntegrityGate({reportText,
  webBundlePath, corpusSnapshotDate})`. Adds ~50-100 lines to the
  harness in a future 5b loop.
- **`metadata.json`** (new fields): `quote_integrity_verdict`,
  `quote_integrity_total_quotes`, `quote_integrity_verbatim_matches`,
  `quote_integrity_normalized_matches`, `quote_integrity_fabricated`,
  `quote_integrity_unknown_jd_ids`,
  `quote_integrity_wrong_company_attributions`,
  `quote_integrity_orphan_in_appendix`,
  `quote_integrity_orphan_in_body`,
  `quote_integrity_duplicate_evidence_count`.
- **`structural_checks.json`** (new entries):
  `quote_integrity_verdict_green` (red-level),
  `quote_integrity_no_fabricated` (red),
  `quote_integrity_no_unknown_jd_ids` (red),
  `quote_integrity_no_wrong_company` (red),
  `quote_integrity_full_verbatim` (amber),
  `quote_integrity_no_orphans` (amber),
  `quote_integrity_no_duplicate_evidence` (amber).
- **`verdict.md`** (new section): after "Amber checks failed", add a
  "Quote integrity" subsection with the summary counts.
- **`quote_integrity_summary.json`** (new file per run) — small
  committed artifact under `.agent/regression_runs/<run-id>/`.
  Contains detailed per-quote status + counts. Excludes full quote
  text for large quotes (truncate to first 60 chars) to keep the
  artifact small and free of long copyrighted spans.
- **RUN_REPORT `## Regression verdict` section** (from AgentOps-3f):
  add sub-fields under the section:
  - `quote_integrity_required`: `yes` / `no`
  - `quote_integrity_verdict`: `green` / `amber` / `red` / `not_evaluated`
  - `quote_integrity_summary_path`:
    `.agent/regression_runs/<run-id>/quote_integrity_summary.json`
  A separate protocol tweak in a later loop (call it AgentOps-5c)
  can formalize this as a template extension.
- **Future baseline comparison policy** (deferred): compares
  quote-integrity summary against baseline counts; drift beyond
  tolerance flips amber. Not part of v1.

## 10. Baseline impact

**Do not silently invalidate A and B baselines.** Both were promoted
before quote integrity existed as a concept, so it is unfair to
retroactively RED-flag them without an explicit refresh loop.

Recommended policy:

- **Design first** (this memo).
- **Prototype on one fixture** (Fixture A first) in AgentOps-5b.
  Read the scratchpad `report.md` if still present locally, or accept
  that the gate is only meaningful for **future** runs.
- **Do not retroactively mutate A/B baselines** without an explicit
  `AgentOps-5e baseline-refresh` DECISION.
- **Add a "quote_integrity_not_evaluated" marker** to existing
  baselines' `notes` array in a small governance-only update loop
  (call it AgentOps-5e-a; single-file edit, no run). This makes
  future readers understand why old baselines don't have
  quote-integrity fields.
- **New runs from AgentOps-5c onward** get quote-integrity fields
  populated; A/B baselines can be refreshed later after the gate is
  stable and vetted.

Concrete implication: this memo does not require any change to
`.agent/regression_baselines/**`. That's a deliberate choice.

## 11. Artifact policy

- **No full `report.md` committed** in v1 (unchanged from AgentOps-3g
  memo §7). The quote-integrity gate reads `report.md` from the
  scratchpad but never commits it.
- **`quote_integrity_summary.json`** may be committed per run
  (small, ~5-15 KB expected). Contains per-quote status +
  aggregate counts. Quote text truncated to first 60 chars each to
  bound size and avoid copying large copyrighted spans.
- **No screenshot committed** in v1 (unchanged).
- **Never commit uploaded PDFs** (unchanged).
- **Never commit proprietary source data** unless already approved
  (i.e. `src/data/web_bundle.json` is already committed as part of
  the product; the quote-integrity gate uses it as-is without
  extracting new subsets).

## 12. Privacy / data handling

- **Uploaded PDFs are not part of this loop** and remain out of scope.
- **No customer data.** All fixtures are synthetic (fixture A - E
  metadata: `synthetic: true`).
- **No secret scanning output with secrets.** The gate never reads
  `.env*` files. Its inputs are pre-existing committed artifacts +
  local scratchpad.
- **Quote snippets should be minimal.** Truncate any recorded quote
  to first 60 chars in `quote_integrity_summary.json`. Full text
  stays in scratchpad `report.md` if it stays there.
- **Source provenance.** The gate cites `jd_id` values that are
  already in `src/data/web_bundle.json` (public / already-committed
  product data). It does not fetch new source data.
- **No leaking private data in public artifacts.** All in-repo
  artifacts stay within `.agent/regression_runs/<run-id>/` and are
  visible only to whoever has repo access.

## 13. Human review policy

Any of the following requires explicit human (Bohao) review before
push:

- **Any RED verdict** from the quote-integrity gate — never auto-pushed.
- **Any new quote-integrity gate implementation** (i.e. the future
  AgentOps-5b loop that ships code) requires its own TASK +
  RUN_REPORT + DECISION.
- **Any baseline refresh** that would populate quote-integrity fields
  on A or B baselines requires an explicit refresh DECISION
  (AgentOps-5e).
- **Any threshold change** (e.g. moving `wrong_title` from AMBER to
  RED, or adding a new failure mode) requires its own DECISION.
- **Any decision to commit raw report excerpts** (e.g. attaching the
  full report body for a specific run) requires a storage-policy
  DECISION.
- **Any production quote validation** (e.g. running the gate against
  the deployed Vercel URL) requires a production-testing DECISION.

Same pattern as AgentOps-3f skip-approval discipline: Bohao only.

## 14. Risks and limitations

1. **Fuzzy matching false positives**: model outputs `"we're hiring
   for RAG"` for a source that says `"we are hiring for RAG"` — the
   `normalized_match` correctly triggers AMBER, but the amber may
   be noise. Mitigation: keep normalization tight (whitespace +
   punctuation only, no synonym expansion).
2. **Fuzzy matching false negatives**: model rewrites `"we ship
   customer-facing LLM features"` as `"we ship customer facing LLM
   features"` (hyphen removed) — normalization handles this. But
   `"we ship LLM features to customers"` would fail — that's a
   paraphrase, and RED-flagging it is correct even though it's
   "close enough" semantically. This is a feature of a
   deterministic gate: no benefit-of-the-doubt.
3. **Quote paraphrase ambiguity**: some quotes are structural
   scaffolding (`"..."`) and some are actual JD text. The double-quote
   heuristic will catch both. Mitigation: also detect the `jd_id`
   proximity requirement — if there's no `jd_id` within 200 chars,
   downgrade to `missing_metadata` amber rather than RED for
   fabrication.
4. **Source text cleaning may alter text**: `web_bundle.json`'s
   `body` field is already the cleaned/extracted JD text. If the
   collector normalization differs from the model's expected form
   (e.g. HTML entities stripped), verbatim matching could
   under-perform. Mitigation: normalize both sides identically.
5. **Model may cite the summary rather than the exact quote**: some
   reports may write `"Acme is looking for someone who can ship
   agent features (per jd_000042)"` without quotation marks. The
   gate should not flag summarized claims that don't use quote
   syntax as fabricated — only explicit quotes get integrity
   checks. Mitigation: quote extraction is strict on quote-syntax
   presence.
6. **Screenshots/raw reports not committed**: means historical
   audits require scratchpad availability. Acceptable given v1
   storage policy.
7. **Corpus snapshot issues**: if `web_bundle.json` regenerates
   between generation and gate execution, `jd_id`s could become
   stale. Mitigation: `metadata.json.corpus_snapshot_date` is
   already recorded; the gate should compare against
   `corpusSnapshotDate` from `src/lib/web-bundle-stats.ts` and flag
   AMBER if they differ.
8. **Baseline drift**: existing A/B baselines don't have
   quote-integrity fields. Grandfathering (§10) addresses this.
9. **Deterministic gate misses semantic overreach**: a fabricated
   claim about a real quote ("this JD requires RAG expertise") is
   not caught — needs future LLM judge (out of v1 scope).
10. **Report format changes**: if the prompt evolves (e.g. moves
    from Markdown blockquotes to some other citation style), the
    extraction regex breaks silently. Mitigation: log
    `quote_integrity_total_quotes` in metadata; a sudden drop from
    ~5 to 0 should be an amber (deferred to a later loop).

## 15. Recommended implementation path

Future loops in preferred order (each is a separate TASK + RUN_REPORT
+ DECISION):

- **AgentOps-5b**: local **quote-integrity parser prototype**. Read
  scratchpad `report.md` from a specific run + `web_bundle.json` +
  `web-bundle-stats.ts`. Emit `quote_integrity_summary.json` to
  `/tmp/…`. **No baseline mutation. No harness edit.** Cost: $0 (no
  generation). Executor writes a small stand-alone `scripts/qi.mjs`
  or similar (in `scripts/`, not `.agent/scripts/`).
- **AgentOps-5c**: **integrate quote-integrity summary** into the
  regression harness. Add the 6 new structural check entries + 10
  new metadata fields (see §9). Guarded so it doesn't run against
  baselines' original commits. **Yellow** because it edits the
  harness.
- **AgentOps-5d**: **run A/B quote-integrity audit** against fresh
  runs of Fixture A and Fixture B using the updated harness. Two
  real generations (~$0.10). Records first quote-integrity results
  as `not_evaluated` on the existing baselines and produces new run
  artifacts with the fields populated.
- **AgentOps-5e**: **baseline refresh policy** — decide whether to
  refresh A/B baselines to include quote-integrity fields, or
  leave them grandfathered as `quote_integrity_not_evaluated`.
  Design-only. Follow-up small edit loop after DECISION.

**Total estimated cost across 5b-5e**: **≈ $0.10** for the two real
runs in 5d. No net-new API integrations. No OpenAI. No LLM judge.

## 16. Explicit non-goals

For clarity, this memo and its 5b-5e follow-ups explicitly do NOT:

- Run a new generation in AgentOps-5a.
- Introduce any new LLM API (Anthropic call count stays at zero for
  design; Sonnet 4.6 remains the only in-harness LLM for
  generations).
- Introduce OpenAI API in any form (BLK-0003 unchanged).
- Test production URL.
- Expand to Fixture C / D / E (that's a different arc; AgentOps-5
  is quality, not coverage).
- Ingest the 20 uploaded PDFs (needs its own resume-fixture-intake
  design loop).
- Implement Codex planner (still spec-only).
- Automate baseline demotion.
- Refresh A/B baselines without explicit DECISION.

## 17. Decisions requested

For Bohao + ChatGPT to answer before AgentOps-5b:

1. **Exact vs fuzzy matching threshold**: is the two-tier
   (verbatim → AMBER · normalized → still-AMBER · anything else →
   RED) design acceptable? Or should we allow a small edit-distance
   threshold (e.g. ≤3 char diff → AMBER)? Executor prefers strict
   two-tier — cheaper to implement, easier to reason about.
2. **Commit raw quote snippets**: should
   `quote_integrity_summary.json` include the first 60 chars of
   each quote (executor's default), or should it be counts-only for
   maximum brevity? Trade-off is auditability vs artifact size /
   quote-copying concerns.
3. **Commit `quote_integrity_summary.json` at all**: in a future
   loop, this file lives at
   `.agent/regression_runs/<run-id>/quote_integrity_summary.json`.
   Confirming this is fine under v1 storage policy (it's small +
   diff-friendly + no full report body).
4. **Grandfather existing A/B baselines**: executor recommends
   grandfathering with a `quote_integrity_not_evaluated` note.
   Alternative would be to run a fresh Fixture A + B against the
   updated harness and refresh both baselines. Which does Bohao
   prefer?
5. **Blocking RED in v1**: should any quote-integrity RED
   (fabrication, unknown jd_id, wrong company) block push exactly
   like other required-red verdicts (per AgentOps-3f §7)? Executor
   recommends yes.
6. **Forbid LLM judge in v1 explicitly**: this memo asserts "no LLM
   judge in v1"; confirming that's a hard rule until an explicit
   DECISION opens it. (Related to BLK-0003 boundaries — Codex CLI
   via ChatGPT sign-in is allowed, but a programmatic LLM judge
   would require OpenAI or a second Anthropic call, both scope
   expansions.)

## 18. Recommendation

- **Approve this design memo.**
- **Implement a deterministic quote-integrity prototype next**
  (AgentOps-5b · standalone parser script, no harness edit yet).
- **Make fabrication and wrong-company attribution RED** — no grace
  period — because these are the product's fundamental trust story.
- **Make normalization-only mismatches AMBER** so we get signal
  without noise; upgrade to RED only if a stability run shows
  normalization AMBER is rare.
- **Do NOT use LLM judge in v1** (unless a separate DECISION opens
  it).
- **Do NOT mutate A/B baselines yet.** Grandfather with
  `quote_integrity_not_evaluated`; refresh later (AgentOps-5e) if
  needed.
- **Do NOT ingest 20 PDFs yet.** Separate design loop with
  anonymization + storage policy DECISION.
- **Do NOT expand to Fixture C/D/E** during the 5-arc. Coverage
  expansion is orthogonal to quality-gate work.
- **Total 5-arc cost estimate**: **≈ $0.10** across 5b + 5c + 5d;
  5a and 5e are design-only ($0). This is the cheapest meaningful
  quality upgrade after two baselines.
