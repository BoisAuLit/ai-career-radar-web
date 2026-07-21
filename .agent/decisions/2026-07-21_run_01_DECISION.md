# DECISION · AgentOps-5a · Quote integrity design memo

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-21 12:00). Standing in for the
> ChatGPT reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-21_run_01_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-21_run_01_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-21_run_01_TASK.md`
- **loop**: `AgentOps-5a`
- **parent_loop**: `AgentOps-4b` (`2026-07-19_run_03`)
- **impl_commit**: `efd3122`
- **run_report_commit**: `bcdf05e`
- **files_reviewed**:
  - `.agent/tasks/2026-07-21_run_01_TASK.md` (202 lines · spec of the
    memo-only loop · yellow · allowed / forbidden · 18-section memo
    contract)
  - `.agent/design_memos/2026-07-21_AgentOps-5a_quote_integrity_design.md`
    (18 sections · 659 lines · deterministic-first design)
  - `.agent/run_reports/2026-07-21_run_01_RUN_REPORT.md` (382 lines ·
    dogfoods the 3f `## Regression verdict` section with
    `regression_required=no`, `verdict=not_required`)
  - `.agent/regression_baselines/fixture-A/current/baseline_metadata.json`
    (read-only · A baseline unchanged)
  - `.agent/regression_baselines/fixture-B/current/baseline_metadata.json`
    (read-only · B baseline unchanged)
  - `scripts/report-regression-local.mjs` (read-only reference for
    integration-point sizing · unchanged)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — memo shapes the next quality-gate arc (AgentOps-5b/c/d/e).
No push, no deploy pending explicit human approval per turn.

## Reasoning summary

AgentOps-5a successfully created the quote integrity design memo as a
design-only loop. The memo is the right next quality layer after
Fixture A/B baselines because the current regression system validates
report shape, capture, Evidence Appendix presence, fixture-specific
keyword alignment, must-not-happen absence, and operational checks,
but it does **not** yet validate whether quoted JD evidence is copied
from source text, correctly attributed, non-fabricated, and aligned to
claims. The memo proposes a **deterministic-first v1 gate**, **no LLM
judge**, **source-text matching**, **conservative RED/AMBER/GREEN
thresholds**, `quote_integrity_summary.json` as a small committed
artifact, and **grandfathering existing A/B baselines** rather than
silently invalidating them. The task respected all boundaries: no code
changes, no harness run, no report generation, no LLM/API calls, no
baseline mutation, no source run mutation, no fixture changes, no
uploaded PDFs, no C/D/E, no A-E, no production target, no pipeline
changes, no push/deploy, and cost **$0**.

## Approved direction

- **Approve AgentOps-5a.**
- **Accept quote integrity as the next quality layer** before blindly
  expanding to Fixture C/D/E.
- **Accept deterministic-first v1 design.**
- **Accept no LLM judge in v1.**
- **Accept strict quote provenance checking** against the served
  cleaned JD corpus.
- **Accept that `web_bundle.records[].body` is v1 ground truth**, but
  explicitly define it as **cleaned served corpus ground truth**, not
  legal / raw original web JD text (see §"Important clarification"
  below).
- **Accept `quote_integrity_summary.json`** as the future small
  committed artifact.
- **Accept that full `report.md` and screenshots remain
  scratchpad-only** in v1.
- **Accept grandfathering existing Fixture A/B baselines** with
  `quote_integrity_not_evaluated` until an explicit refresh/audit
  loop (AgentOps-5e).
- **Do NOT mutate existing A/B baselines in this DECISION.**
- **Do NOT implement 5b in this DECISION.**
- **Do NOT run C/D/E yet.**
- **Do NOT run A-E full suite.**
- **Do NOT ingest the 20 uploaded PDFs.**
- **Do NOT introduce OpenAI API.**
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline.**

## Answers to the six decisions requested (memo §17)

### 1. Matching strategy

**Approve strict two-tier matching**: verbatim match first, normalized
match second. **Do not use edit-distance matching in v1.**

- **Verbatim match** in source `body` → **GREEN** (per-quote OK).
- **Normalized-only match** (whitespace / punctuation / case
  normalized on both sides · comparison-only lowercase) → usually
  **AMBER** unless clearly harmless and documented (e.g. curly →
  straight quote round-trip that changes nothing semantically).
- **No match** when the text is presented as a quote → **RED**.

Rationale: edit-distance introduces false positives / negatives that
are hard to reason about; two-tier is cheap, deterministic, and
readable in the audit trail.

### 2. Quote snippets in `quote_integrity_summary.json`

**Approve** including short quote snippets, capped to approximately
**the first 60 characters**, with whitespace normalized. Do NOT
commit full `report.md`. Do NOT commit long quote excerpts. Snippets
are **for auditability only** — a reviewer can eyeball a mismatch
without opening the scratchpad.

### 3. Commit `quote_integrity_summary.json` per run

**Approve** committing `quote_integrity_summary.json` per regression
run **once 5c integrates the gate**. The artifact must be:

- Small (~5-15 KB expected).
- Diff-friendly (JSON, sorted keys where feasible).
- Contains **counts** (fabricated / verbatim / normalized / unknown /
  wrong-company / orphan / duplicate), **verdict** (green / amber /
  red), **source ids** referenced, **short snippets** (60-char
  truncated), **mismatch reasons**.
- Contains **no full report body**.

### 4. Existing A/B baselines

**Grandfather** existing Fixture A and Fixture B baselines. Do **NOT**
retroactively invalidate or mutate them in 5a. Later, use a **separate
explicit AgentOps-5e baseline refresh/audit loop** if we choose to add
quote-integrity fields to official baselines. Concrete implication for
this DECISION: no edit to
`.agent/regression_baselines/fixture-A/current/*` or
`.agent/regression_baselines/fixture-B/current/*`.

### 5. Blocking RED in v1

**Approve blocking RED in v1** (mirrors AgentOps-3f `required_red`
push discipline) for:

- Fabricated quotes.
- Source-text mismatch (quote presented but not in cleaned
  served-corpus `body`).
- Wrong-company attribution.
- Wrong-role attribution (per-record `title` mismatch or archetype
  mismatch beyond loose title containment).
- Missing Evidence Appendix when report claims evidence.
- Any quote that cannot be traced to the cleaned served corpus (i.e.
  `unknown_jd_id`).

Any of the above blocks push until fix/revert or explicit override in
a paired DECISION.

### 6. LLM judge

**Explicitly forbid LLM judge in v1.** The first implementation must
be **deterministic and local**. **No OpenAI API. No second Anthropic
call.** Any future LLM judge would require a **separate design memo
and DECISION**.

## Important clarification · v1 ground truth

For v1, the source of truth is the **cleaned served JD corpus** used
by the product, specifically the relevant `web_bundle.records[]`
entries with `id / company / title / body` (or equivalent generated
corpus artifact at
`src/data/web_bundle.json`). This means quote integrity v1 verifies
whether the report **faithfully cites the product's own cleaned
corpus**. It does **NOT** claim to verify against:

- raw live job pages,
- removed / expired postings,
- screenshots of original pages,
- legal / original webpage text with formatting or contested wording.

**Record `corpus_snapshot_date` and source record `id`** wherever
possible in `quote_integrity_summary.json`, so a future audit can
reconstruct exactly which cleaned snapshot was ground truth.

This clarification matters because the model was shown the cleaned
`body` text at generation time; verifying against that same cleaned
`body` is the fair (and cheap) v1 gate. Verifying against raw web
pages is a separate, harder, later concern (needs a `body_raw` field
or a re-scrape · out of scope for the entire 5-arc).

## Recommended v1 thresholds (concrete)

### GREEN (all must hold)

- Evidence Appendix present when required.
- All quoted spans found **verbatim** in the matched source JD `body`.
- Citation / source `id` is present next to every quote.
- Company and role metadata align with the cited record (loose title
  containment allowed).
- No duplicate evidence counted as independent support unless
  intentionally marked.

### AMBER (at least one, none of the RED conditions)

- Quote matches only after **whitespace / punctuation normalization**.
- Non-critical metadata missing but source `id` still resolves.
- Evidence item exists but is **weakly connected** to a claim
  (orphan-in-appendix or orphan-in-body).
- Duplicate evidence appears but does **not** change the conclusion.

### RED (any one triggers)

- Fabricated quote.
- Quote not found in source JD `body` (even after normalization).
- Wrong company attribution.
- Wrong role / job attribution.
- Quote from one role used to support another role.
- Evidence Appendix missing when report claims JD evidence.
- Report claim materially stronger than the evidence supports (heuristic
  only in v1 · flagged when quote length < threshold vs claim
  scope · fine-tuning deferred).
- Source `id` cannot be resolved.

## Baseline impact

- **Existing A and B baselines remain `current`.** No mutation in
  this DECISION.
- **Conceptually mark them** as `quote_integrity_not_evaluated` until
  a future explicit audit/refresh loop (AgentOps-5e). This label can
  live in AgentOps-5e's baseline-refresh design; do NOT add a marker
  field to A/B baseline files in this DECISION.
- **Do NOT edit `.agent/regression_baselines/**`** in this DECISION.
- **Future baselines may include `quote_integrity_*` fields** only
  after 5c implementation lands and an explicit baseline
  refresh/promote decision authorizes it.
- **Do NOT silently change baseline schema expectations** for A/B.

## Recommended next loop

**AgentOps-5b · quote integrity parser prototype.**

Scope for 5b:

- **Prototype only.**
- **Deterministic parser.**
- Preferably a **local scratchpad-only script** (e.g. under `scripts/`
  root · not `.agent/scripts/**` which is hard-rule read-only), or a
  narrowly-scoped experimental artifact.
- **No baseline mutation.**
- **No harness integration yet** unless explicitly approved in a
  separate DECISION (harness integration is AgentOps-5c).
- **No new generation.**
- **No LLM/API calls.**
- **No OpenAI API.**
- **No production target.**
- **No uploaded PDF ingestion.**
- **No C/D/E.**
- **No A-E full suite.**

Expected cost: **$0**. Read scratchpad `report.md` from an existing
Fixture A run (if the scratchpad is still present · else document the
gap) + `src/data/web_bundle.json` as read-only inputs. Emit summary
JSON to `/tmp/qi_summary.json` for human review.

## Risks found

1. **Quote integrity is designed but not implemented yet.** Severity:
   **medium** for coverage; **none** for governance (implementation is
   the next loop by design).
2. **Existing A/B baselines do not yet contain quote_integrity
   fields.** Severity: **low** (intended · grandfathered).
3. **The v1 ground truth is the cleaned served corpus, not raw live
   job pages.** Severity: **medium** for trust story ambiguity;
   clarification above scopes the claim explicitly.
4. **Cleaning/parsing may alter punctuation or whitespace, causing
   false AMBERs.** Severity: **low-medium**. Mitigation: two-tier
   normalized-match tier is exactly for this.
5. **Some report evidence may be paraphrased rather than quoted**,
   which requires careful classification. Severity: **medium**.
   Mitigation: only text presented as a quote (blockquote / double
   quotes / typographic quotes) triggers the gate; paraphrase without
   quote syntax is not flagged in v1.
6. **Quote-to-claim alignment is harder than quote containment.**
   Severity: **medium**. v1 deliberately only checks containment;
   alignment is a deferred LLM-judge concern.
7. **Duplicate evidence detection may be imperfect.** Severity:
   **low**. v1 counts distinct claims citing the same `jd_id`;
   ambiguous cases → AMBER only.
8. **No semantic equivalence comparison exists yet.** Severity:
   **medium**. Deferred (memo §11 · memo §15 later loop).
9. **No quote integrity production testing exists.** Severity:
   **medium** for release confidence; **low** for governance.
10. **C/D/E are still not real-run.** Severity: **low** (intended;
    coverage arc is separate from quality arc).
11. **Uploaded 20 PDFs remain out of scope.** Severity: **low**
    (intended; separate design loop).
12. **BLK-0001 / BLK-0002 / BLK-0003 remain open and unaffected.**
    Severity: **none** for this loop (documented state).

## Required fixes

**`none`**

The memo is self-contained, respects every AgentOps-3-era guardrail
(§10 grandfather policy · §16 explicit non-goals · §17 explicit
deferrals), and proposes a cheap deterministic-first v1 that plugs
into the existing harness envelope cleanly. No follow-up code change
is needed to approve this loop.

## Non-blocking followups

- **Push AgentOps-5a after human approval.**
- **Update daily summary after push.**
- **Next recommended loop**: **AgentOps-5b** · quote integrity
  parser prototype.
- **Keep v1 deterministic.**
- **Do NOT add LLM judge.**
- **Do NOT use edit-distance matching.**
- **Do NOT mutate A/B baselines yet.**
- **Do NOT run C/D/E yet.**
- **Do NOT ingest the 20 uploaded PDFs yet.**
- **Do NOT introduce OpenAI API.**
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline.**
- **Do NOT push until explicit human approval.**

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT start
AgentOps-5b. Do NOT run harness. Do NOT run report generation. Do
NOT call Anthropic/OpenAI. Do NOT run C/D/E. Do NOT run A-E full
suite. Do NOT ingest uploaded PDFs. Do NOT modify code. Do NOT
modify baselines. Do NOT modify fixtures. Do NOT modify pipeline. Do
NOT modify `.agent/scripts/**`. Do NOT modify `src/**`. Do NOT
implement Codex planner. Do NOT create `.agent/planner_reports/`. Do
NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub
Actions. Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start
G2.1d. Recommended next task after push/cleanup is **AgentOps-5b ·
quote integrity parser prototype** (deterministic · scratchpad-only ·
no harness edit · no baseline mutation · $0).

## Boundary confirmations · 24 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No code changes | ✅ (only `.agent/tasks/`, `.agent/design_memos/`, `.agent/run_reports/`, `.agent/decisions/`) |
| No harness run | ✅ (no `node scripts/…`, no `npm run dev`) |
| No report generation | ✅ (no LLM API call from any script) |
| No LLM / API calls | ✅ |
| No baseline mutation | ✅ (A + B untouched · read-only) |
| No `.agent/regression_baselines/**` changes | ✅ |
| No `.agent/regression_runs/**` changes | ✅ |
| No `.agent/regression_fixtures/**` changes | ✅ |
| No C/D/E | ✅ |
| No A-E full suite | ✅ |
| No uploaded PDFs committed | ✅ (find sweep confirmed) |
| No `report.md` / screenshot committed | ✅ (scratchpad only) |
| No `scripts/report-regression-local.mjs` changes | ✅ (harness stable at `0341461`) |
| No `.agent/scripts/**` changes | ✅ (hard rule per AgentOps-2c Q3-Q8) |
| No `src/**` changes | ✅ |
| No pipeline changes | ✅ (HEAD `b019786` unchanged start AND end) |
| No collector run | ✅ |
| No corpus refresh | ✅ |
| No OpenAI API introduced | ✅ (BLK-0003 unchanged) |
| No GitHub Actions changes | ✅ |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read | ✅ |
| No `vercel.json` / `.vercel/**` changes | ✅ |
| No Codex / Claude config edits | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains spec-only | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |
| Cost for this DECISION loop | ✅ **$0** |
| Any generation happened | ✅ **no** |
| Harness ran | ✅ **no** |

## Stop condition

DECISION written. **Awaiting explicit human approval to push.** No
follow-up action is authorized until Bohao says "push AgentOps-5a".
