# RUN_REPORT · AgentOps-5a · Quote integrity design memo

## Metadata

- **task_id**: `2026-07-21_run_01`
- **date**: `2026-07-21`
- **loop**: `AgentOps-5a`
- **parent_loop**: `AgentOps-4b` (`2026-07-19_run_03`)
- **TASK**: `.agent/tasks/2026-07-21_run_01_TASK.md`
- **design memo**: `.agent/design_memos/2026-07-21_AgentOps-5a_quote_integrity_design.md`
- **impl_commit**: `efd3122`
- **repo**: `/Users/bohaoli/Desktop/ai-career-radar-web`
- **branch**: `main`
- **base_commit_before**: `832021f`
- **base_commit_after**: `efd3122` (impl only; RUN_REPORT commit to follow)

## Regression verdict

> This loop is a design memo. Only `.agent/tasks/2026-07-21_run_01_TASK.md`,
> `.agent/design_memos/2026-07-21_AgentOps-5a_quote_integrity_design.md`,
> and this RUN_REPORT are touched. No `src/**`, no
> `scripts/report-regression-local.mjs`, no baseline, no run. Not
> report-affecting.

- **regression_required**: `no`
- **reason_required_or_not**: Design-only quote-integrity memo. No
  report-affecting runtime change. Nothing in `src/**`,
  `scripts/report-regression-local.mjs`, `.agent/regression_baselines/**`,
  `.agent/regression_runs/**`, or prompts is touched. Memo describes a
  future gate (implementation deferred to AgentOps-5b).
- **harness_used**: `no`
- **harness_command**: `not run`
- **fixture_ids**: `none`
- **target_environment**: `none`
- **latest_run_id**: `none`
- **verdict**: `not_required`
- **exit_code**: `not_applicable`
- **artifact_paths**:
  - `.agent/design_memos/2026-07-21_AgentOps-5a_quote_integrity_design.md`
- **report_char_count**: `not_applicable`
- **capture_scope**: `not_applicable`
- **fallback_used**: `not_applicable`
- **red_checks_failed**: `not_applicable`
- **amber_checks_failed**: `not_applicable`
- **cost_measured**: `false`
- **estimated_cost**: **$0**
- **duration_ms**: `0`
- **baseline_promoted**: `no`
- **production_target_used**: `no`
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: **no push until DECISION**

## Result headline

- **Quote-integrity design memo landed.** 18 sections, 861 lines,
  design-only.
- **Zero code, zero run, zero LLM/API call, zero baseline mutation,
  zero cost.**
- Memo maps out a **deterministic-first** quote-integrity gate for
  AgentOps-5b to implement: source-text containment + citation-id
  lookup + attribution matching against `src/data/web_bundle.json`
  (443 records with `id`, `company`, `title`, `body`).
- **Fixture A + B baselines grandfathered** as
  `quote_integrity_not_evaluated`; no silent invalidation.
- **DECISION-eligible.**

## Files changed (this loop)

| file | change | committed |
|---|---|---|
| `.agent/tasks/2026-07-21_run_01_TASK.md` | new · 202 lines | ✅ `efd3122` |
| `.agent/design_memos/2026-07-21_AgentOps-5a_quote_integrity_design.md` | **new · 18-section memo · 659 lines** | ✅ `efd3122` |
| `.agent/run_reports/2026-07-21_run_01_RUN_REPORT.md` | new · this file | ⏳ pending |

`git diff --stat` for impl commit:
```
 .agent/design_memos/2026-07-21_AgentOps-5a_quote_integrity_design.md | 659 ++++++++++
 .agent/tasks/2026-07-21_run_01_TASK.md                               | 202 ++++
 2 files changed, 861 insertions(+)
```

## Design summary

### Problem (§1-§2)

Current A + B baselines catch structural / capture / Evidence
Appendix presence / keyword-alignment / must-not-happen failures.
They do NOT catch: fabricated quotes, wrong-company attribution,
non-existent `jd_id` citations, or Evidence-Appendix / body-citation
disconnects. Since the product's trust story is "we cite real JDs,
we don't make things up," this is the highest-leverage next quality
gate.

### Vocabulary (§3 · 10 terms)

quote · citation · evidence item · source JD · extracted JD record
· claim · attribution · quote integrity · citation integrity ·
evidence-to-claim alignment.

### Failure modes (§4 · 12 items · 8 in v1 · 4 deferred)

**v1 in-scope**: fabricated quote (RED) · paraphrase-as-quote (AMBER
or RED depending on normalization) · wrong-company attribution (RED)
· stale/removed JD (RED for unknown_id) · appendix-body disconnect
(AMBER) · punctuation/case rewrite (AMBER) · missing metadata
(AMBER) · duplicate evidence as independent (AMBER).

**v1 deferred**: cross-role attribution beyond `jd_id` lookup ·
too-generic quotes (needs IDF/LLM) · misleading truncation · claim
overreach (needs LLM judge).

### Proposed v1 algorithm (§7 · deterministic · no LLM)

1. Parse report H2 sections.
2. Extract Evidence Appendix items: `{jd_id, company_attributed,
   title_attributed}`.
3. Extract quotes: blockquotes (`> `) · double quotes (`"..."`) ·
   typographic quotes (`"…"` / `'…'`) — min 5 words · walk back
   200 chars to find nearest `jd_id`.
4. Normalize: curly→straight quotes · em-dash→hyphen · ellipsis
   →`...` · whitespace collapse · lowercase (comparison only).
5. Per quote: lookup `jd_id` in `web_bundle.records[]`.
   - not found → `unknown_jd_id` (RED)
   - verbatim in `body` → `verbatim_match` (OK)
   - normalized in normalized-`body` → `normalized_match` (AMBER)
   - else → `fabricated` (RED)
6. Per appendix item: check `company` (strip corporate suffixes)
   and `title` (loose containment) against record.
7. Cross-reference: orphan-in-appendix + orphan-in-body counts.
8. Duplicate evidence count (same `jd_id` in ≥3 distinct claims).
9. Classify GREEN / AMBER / RED.
10. Emit `quote_integrity_summary.json` (~5-15 KB, per-quote status,
    quote text truncated to 60 chars).

### Proposed thresholds (§8)

- **GREEN**: every quote `verbatim_match` · every appendix item OK ·
  no `unknown_jd_id` · no orphans · no duplicate-evidence.
- **AMBER** (at least one, no RED): normalization drift · loose
  title mismatch · orphan-in-appendix or orphan-in-body ·
  duplicate-evidence · missing metadata.
- **RED** (any triggers): fabrication · unknown `jd_id` (either
  side) · wrong-company attribution · Evidence Appendix absent while
  body has citations.

Thresholds intentionally conservative — fabrication and wrong-company
attribution are catastrophic; RED with no grace period.

### Integration points (§9 · plugs into existing harness)

- `scripts/report-regression-local.mjs` · post-`extractReportText`
  hook (~50-100 line addition in future 5b/5c).
- `metadata.json` · 10 new `quote_integrity_*` fields.
- `structural_checks.json` · 7 new check entries (4 red · 3 amber).
- `verdict.md` · new "Quote integrity" subsection.
- **New file per run**: `quote_integrity_summary.json` (small · in
  `.agent/regression_runs/<run-id>/`).
- **RUN_REPORT `## Regression verdict` section** · 3 new sub-fields
  (`quote_integrity_required` · `quote_integrity_verdict` ·
  `quote_integrity_summary_path`) — formalized in AgentOps-5c.

### Baseline impact (§10)

- **Do NOT retroactively invalidate A/B baselines.**
- **Grandfather** with a `quote_integrity_not_evaluated` marker on
  existing baseline `notes` arrays (small governance-only follow-up
  in AgentOps-5e-a).
- **New runs from AgentOps-5c onward** get quote-integrity fields.
- A/B baseline refresh (if desired) is a separate later loop with
  its own DECISION (AgentOps-5e).

### Risks and limitations (§14 · 10 items)

Includes: fuzzy false positives/negatives · paraphrase ambiguity ·
source-text cleaning drift · non-quoted summary claims not flagged ·
scratchpad-only historical audits · corpus snapshot drift · baseline
drift · deterministic gate misses semantic overreach · report format
changes could silently break extraction.

### Decisions requested (§17 · 6 questions for Bohao + ChatGPT)

1. Two-tier verbatim/normalized matching vs edit-distance threshold?
2. Include first-60-char quote snippets in the summary artifact?
3. Confirm `quote_integrity_summary.json` may be committed per run?
4. Grandfather existing A/B baselines OR refresh via AgentOps-5e?
5. Blocking RED in v1 (matches AgentOps-3f `required_red` rule)?
6. Explicitly forbid LLM judge in v1?

### Recommended next-loop path (§15)

- **AgentOps-5b** · deterministic quote-integrity parser prototype ·
  scratchpad-only script · $0.
- **AgentOps-5c** · integrate into harness · yellow · $0.
- **AgentOps-5d** · run A + B against updated harness · **≈ $0.10**
  total (two real generations).
- **AgentOps-5e** · baseline refresh policy · design-only · $0.

**Total 5-arc cost estimate**: **≈ $0.10** (only 5d does real
generation). Cheapest meaningful quality upgrade after two
baselines.

### Explicit non-goals (§16)

No new generation in 5a · no OpenAI API (BLK-0003 unchanged) · no
production testing · no C/D/E expansion · no 20-PDF ingestion · no
Codex planner implementation · no automated baseline demotion · no
A/B baseline refresh without explicit DECISION.

## Recommendation (§18 verbatim)

- Approve this design memo.
- Implement a deterministic quote-integrity prototype next
  (AgentOps-5b).
- Fabrication + wrong-company attribution = RED (no grace period).
- Normalization-only mismatches = AMBER.
- No LLM judge in v1 (unless separate DECISION opens it).
- Do NOT mutate A/B baselines yet · grandfather with
  `quote_integrity_not_evaluated`.
- Do NOT ingest 20 PDFs yet.
- Do NOT expand to Fixture C/D/E during the 5-arc (coverage is a
  different arc).

## Validation results

```
$ git diff --name-only origin/main..HEAD
.agent/design_memos/2026-07-21_AgentOps-5a_quote_integrity_design.md
.agent/tasks/2026-07-21_run_01_TASK.md

$ git diff --name-only | grep -E '^(src/|scripts/report-regression-local\.mjs|\.agent/scripts/|\.agent/regression_runs/|\.agent/regression_fixtures/|\.agent/regression_baselines/|\.agent/planner_reports/|package(-lock)?\.json|\.github/workflows/)' || echo "OK"
OK

$ find .agent -name 'report.md' 2>/dev/null
(empty)

$ find .agent -name '*.png' 2>/dev/null
(empty)

$ find .agent -name '*.pdf' 2>/dev/null
(empty)
```

Exactly the 2 allowed files (TASK + memo) staged in impl commit.
RUN_REPORT to be added by the second commit.

## Forbidden-file audit · empty-diff sweep · full CLEAN

- `src/**` — untouched (any file)
- `src/data/**` — untouched (memo references `web_bundle.json` as
  read-only input for the future gate)
- `src/lib/**` — untouched (memo references `prompts.ts` and
  `web-bundle-stats.ts` read-only)
- `src/app/api/**` — untouched
- `src/app/page.tsx` — untouched
- **`scripts/report-regression-local.mjs`** — untouched (harness
  stable at `0341461`)
- `.agent/scripts/**` — **untouched** (hard rule per AgentOps-2c
  Q3-Q8)
- `.agent/blockers.md` — untouched (BLK-0001/2/3 all `open`)
- `.agent/automation_queue.md` — untouched (QUEUE-0002 still
  `blocked_pending_human`)
- **`.agent/regression_fixtures/**` — untouched** (all fixtures
  read-only)
- **`.agent/regression_runs/**` — untouched** (no new run · no edit)
- **`.agent/regression_baselines/**` — untouched** (A + B baselines
  read-only)
- `.agent/planner_reports/**` — **not created**
- `.agent/policies/**` — untouched
- Pipeline repo (any file) — untouched (`HEAD b019786` unchanged
  start AND end)
- `sources.yaml`, `corpus/**`, `scripts/collector/**` — untouched
- `.github/workflows/**` — untouched
- `package.json`, `package-lock.json` — untouched (no new dep)
- `.env*` — untouched
- `vercel.json` — untouched
- Codex / Claude config files — untouched
- Production deployment config — untouched
- Uploaded PDFs — **NOT committed** (find sweep)
- `report.md` anywhere — **NOT committed**
- `screenshot.png` / `*.png` anywhere — **NOT committed**

## Confirmations · 21 items

| item | status |
|---|---|
| Local run executed | ✅ **no** |
| One real generation happened | ✅ **no** |
| Estimated cost this loop | ✅ **$0** |
| No code changes | ✅ (only `.agent/tasks/`, `.agent/design_memos/`, `.agent/run_reports/`) |
| No harness run | ✅ |
| No report generation | ✅ |
| No LLM/API calls | ✅ |
| No baseline mutation | ✅ (A + B untouched · read-only) |
| No new run created | ✅ |
| No fixture edit | ✅ |
| No prompt / model-selection edit | ✅ |
| No C/D/E | ✅ |
| No A-E full suite | ✅ |
| No uploaded PDFs committed | ✅ |
| No production target | ✅ |
| No `report.md` / screenshot committed | ✅ |
| No `scripts/report-regression-local.mjs` change | ✅ (stable at `0341461`) |
| No `.agent/scripts/**` change | ✅ (hard rule) |
| No `src/**` change | ✅ |
| No pipeline changes | ✅ (`b019786` unchanged) |
| No collector / corpus refresh | ✅ |
| No OpenAI API introduced | ✅ (BLK-0003 unchanged) |
| No GitHub Actions changes | ✅ |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read | ✅ |
| No push / no deploy | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d still `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains spec-only | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |

## Recommendation

- **Human + ChatGPT review** of the 18-section design memo (659
  lines) + this RUN_REPORT.
- Then write **DECISION** for `2026-07-21_run_01`.
- Suggested DECISION direction (executor's opinion, not binding):
  - **verdict**: `approve` — memo is self-contained, respects every
    AgentOps-3-era guardrail, proposes a cheap deterministic-first
    v1 that plugs into the existing harness envelope cleanly, and
    grandfathers A/B baselines instead of silently invalidating
    them.
  - **human_approval_needed**: `yes`.
  - **Answer the 6 memo §17 open decisions**:
    - Q1 (matching): executor prefers **strict two-tier**
      (verbatim / normalized only · no edit-distance).
    - Q2 (60-char snippets): executor prefers **yes** for
      auditability.
    - Q3 (commit summary artifact): executor prefers **yes**.
    - Q4 (baselines): executor prefers **grandfather**, not refresh.
    - Q5 (blocking RED): executor prefers **yes** (matches 3f
      §7 `required_red` rule).
    - Q6 (forbid LLM judge in v1): executor prefers **yes** (hard
      rule until explicit DECISION opens it).
  - **Next default loop after 5a push/cleanup**: **AgentOps-5b** ·
    deterministic parser prototype · scratchpad-only · $0.
  - Explicitly DEFER: OpenAI API integration, `.agent/scripts/**`
    edits, `src/**` DOM markers, A-E full suite, production testing,
    Codex planner implementation, C/D/E fixtures, uploaded PDF
    ingestion, and BLK-0001/2/3 resolution.

## Standing do-NOTs (unchanged from prior loops)

- Do NOT modify `src/**`.
- Do NOT modify `scripts/report-regression-local.mjs`.
- Do NOT modify `.agent/scripts/**`.
- Do NOT modify `.agent/regression_baselines/**`.
- Do NOT modify `.agent/regression_runs/**`.
- Do NOT modify `.agent/regression_fixtures/**`.
- Do NOT run Fixture C.
- Do NOT run C/D/E.
- Do NOT run A-E full suite.
- Do NOT ingest the 20 uploaded PDFs.
- Do NOT commit uploaded PDFs.
- Do NOT test production.
- Do NOT run Playwright.
- Do NOT run report generation.
- Do NOT call Anthropic/OpenAI.
- Do NOT introduce OpenAI API.
- Do NOT implement Codex planner.
- Do NOT modify pipeline.
- Do NOT run collector.
- Do NOT refresh corpus.
- Do NOT modify prompts.
- Do NOT modify model selection.
- Do NOT modify GitHub Actions.
- Do NOT modify `package.json` or `package-lock.json`.
- Do NOT push.
- Do NOT deploy.
- Do NOT start AgentOps-5b (implementation loop) in this turn.

## Stop condition · reached expected end state

RUN_REPORT written. Awaiting human review + DECISION for
`2026-07-21_run_01`. No push. No deploy. No harness run. No LLM call.
No baseline mutation. No PDF ingested.
