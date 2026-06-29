# DECISION · G2.1c · hand-labeled taxonomy eval set

> Authored by ChatGPT (human-mediated) after reading the RUN_REPORT and
> a fresh re-validation of the eval set on the pipeline branch.
> Scaffolded by `python .agent/scripts/new_decision.py --task-id
> 2026-06-28_run_03` (dogfood — fourth full loop using the helper triple).

## Metadata

- **decision_id**: `2026-06-28_run_03_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-06-28_run_03_RUN_REPORT.md`

## Verdict

`approve`

## Reasoning summary

G2.1c created the hand-labeled taxonomy eval set for G2.1 in the
pipeline repo. This is a documentation / data-only task intended to
provide ground-truth examples for the future G2.1d classifier prompt
+ scoring dry-run work. A fresh re-validation against the eval set on
branch `agent/2026-06-28_run_03` (pipeline commit `b019786`)
confirmed:

- **JSONL parses cleanly**: 37 rows, 37 unique `eval_id`s, all
  required fields present, all enum values valid.
- **Verbatim-quote check**: 0 misses — every `evidence_quote` appears
  literally inside its `jd_excerpt`.
- **Excerpt length**: min 231 / max 371 / mean 289 chars (TASK soft
  cap was ~400, hard cap 650).
- **Composition minima** (per the TASK's Acceptance §): all met.
  - TP for each of `applied_ai`, `ai_product_engineering`,
    `agent_engineering`, `forward_deployed`: 5 each ✓
  - `false_positive_trap`: 5 ✓ · `false_negative_trap`: 5 ✓
  - Long-tail coverage: `llm_infra` (2), `eval`, `data_eng_for_ai`,
    `ml_platform`, `research_engineer`, `ai_devrel` each ≥ 1 ✓
  - Reject categories surfaced via `expected_rejection_reason`:
    `non_ai_swe` (3), `ai_buzzword_only` (1) ✓
- **Labels are hand-authored from `corpus/taxonomy/G2.1_spec.md`**
  (commit `f833bfd`); 18 reuse real review-queue JDs already
  human-judged in G1.3, 19 are clearly marked
  `source: "synthetic_edge_case"` to cover long-tail archetypes
  without republishing copyrighted JDs.
- **No runtime touched**: no LLM call, no `python -m scripts.collector`
  invocation, no DB / generated-corpus mutation, no
  classifier/extractor/schema/prompt/source/cron/workflow edit. The
  forbidden-files audit in the RUN_REPORT — re-verified against the
  live branch — shows every red-zone path as `unchanged ✓`.

The work meets every Acceptance criterion in the TASK. Approving on
technical execution. Promotion (web push + pipeline ff-merge +
pipeline push) remains a separate human-approval gate per policy §3.

## Risks found

1. **Hand labels may need future spot-checking.** Eval labels are
   authored against the spec but reflect one human reviewer's reading;
   a second pass after G2.1d's dry-run may surface labels that need
   refinement. Severity: **low** / **accepted**. Mitigation: any label
   correction goes through a new yellow TASK per the labeling guide's
   change-control section.
2. **Synthetic excerpts (19/37) are intentionally crisp.** They cover
   archetypes the real corpus underrepresents. Risk: classifier
   evaluated against this set may look better than it actually is on
   live JDs. Severity: **medium** / **accepted**. Mitigation: G2.1e
   dry-run must also stratify-sample the live corpus, not only this
   eval set (already recommended in the RUN_REPORT).
3. **G2.1d must not overfit to this small eval set.** 37 entries is a
   sanity baseline, not a benchmark — a prompt that scores perfectly
   here can still misbehave at scale. Severity: **medium**.
   Mitigation: the policy carry-forward — G2.1d's RUN_REPORT must
   include both eval-set scores AND a live-corpus stratified sample
   comparison.
4. **Future classifier/scoring changes remain red-zone.** Anything
   that follows from this eval set (G2.1d prompt rewrite, G2.1f
   promotion, schema bump, model selection change) requires a
   separate TASK with explicit human approval. Severity:
   **low** / **policy carry-forward**.

## Red-zone flags

`none` for G2.1c implementation.

No `scripts/collector/**/*.py`, `corpus/schema/**`, `corpus/state/**`,
`corpus/web_bundle*.json`, `corpus/collector.db`, `corpus/_inbox|raw|processed|reports|runs/**`,
`corpus/evals/golden_set/**`, `corpus/taxonomy/G2.1_spec.md`,
`sources.yaml`, or `.github/workflows/**` changed in either repo. The
audit reproduced freshly during DECISION authoring shows every
red-zone path as `unchanged ✓`.

## Required fixes

`none`

JSONL validates, composition minima are met, all evidence quotes are
verbatim, all excerpts are well under the length cap, and scope is
clean. No remediation needed before promotion.

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

Do NOT start AgentOps-2a implementation yet (the 5 policy files —
automation_policy.md, automation_window_report_template.md,
automation_queue.md, blockers.md, README.md tweak).

The G2.1c work is approved per this DECISION, but the following
state-changing actions still require Bohao's explicit GO per policy §3:

1. Web repo: push `main` to `origin/main` (4 unpushed commits — G2.1c
   TASK + RUN_REPORT + AgentOps-2a TASK already on `main`, plus this
   DECISION about to be committed).
2. Pipeline repo: fast-forward merge `agent/2026-06-28_run_03` → `main`
   (drift guard: `git fetch + git pull --ff-only origin main` on `main`
   first — daily cron may have moved the tip since the branch was cut).
3. Pipeline repo: push `main` to `origin/main`.

After this DECISION is committed:
- Stay on `main` of the web repo and on `agent/2026-06-28_run_03` of
  the pipeline repo. Do not switch to pipeline `main` proactively.
- Report for both repos: current branch, commits not yet on origin,
  full file scope (`git diff --stat`), pipeline ff-readiness check
  (branch base parent vs pipeline `main` HEAD).
- Do NOT switch branches, invoke `git merge`, push either origin, or
  deploy anything.

Wait for Bohao's explicit "promote G2.1c" instruction. Only AFTER
G2.1c is promoted and the post-run cleanup + daily-summary update is
done, then AgentOps-2a implementation can begin.
```

## Human approval needed

`yes` — required before:
- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`).
- Pipeline repo ff-merge (`agent/2026-06-28_run_03` → `main`).
- Pipeline repo push (`origin/main` of `/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`).
- Any deployment of either repo.
- Any AgentOps-2a implementation work (the 5 policy files).

> Verdict is `approve` for the technical execution captured in the
> RUN_REPORT — JSONL validates, composition is correct, scope is
> clean, no red-zone touched. Standing policy treats cross-repo
> promotion and any subsequent AgentOps-2a work as separate approval
> points. Next state-changing step is Bohao's call.
