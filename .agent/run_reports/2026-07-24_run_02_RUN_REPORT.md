# RUN REPORT · AgentOps-5e-followup-prompt-refinement-design · Mandatory exact-evidence structure

## Metadata

- **task_id**: `2026-07-24_run_02`
- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-prompt-refinement-design
- **parent_loop**: AgentOps-5e-followup-prompt-tune-implement (`2026-07-24_run_01` · rejected, rolled back)
- **task_path**: `.agent/tasks/2026-07-24_run_02_TASK.md`
- **findings_path**: `.agent/findings/2026-07-24_prompt_omission_behavior_inventory.json`
- **memo_path**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-prompt-refinement-design.md`
- **impl_commit**: `f55101f` (Design mandatory exact evidence structure)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_01_DECISION.md`

## Regression verdict

- **regression_required**: no
- **reason_required_or_not**: design-only analysis following a
  rolled-back negative prompt experiment; no product, prompt,
  checker, harness, or runtime change
- **harness_used**: no
- **harness_command**: not_run
- **fixture_ids**: none generated
- **target_environment**: local design inspection
- **latest_run_id**: not_applicable
- **verdict**: `not_required`
- **exit_code**: not_applicable
- **artifact_paths**:
  - `.agent/tasks/2026-07-24_run_02_TASK.md`
  - `.agent/findings/2026-07-24_prompt_omission_behavior_inventory.json`
  - `.agent/design_memos/2026-07-24_AgentOps-5e-followup-prompt-refinement-design.md`
- **report_char_count**: not_applicable
- **capture_scope**: not_applicable
- **fallback_used**: not_applicable
- **red_checks_failed**: not_applicable
- **amber_checks_failed**: not_applicable
- **cost_measured**: **true**
- **estimated_cost**: **$0**
- **duration_ms**: not_applicable
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Negative experiment summary (informing this design)

- Prior loop `2026-07-24_run_01` added a verbatim / no-paraphrase /
  self-check block to `reportSystemPrompt`.
- Fixture A + Fixture B both completed **legacy GREEN** but dropped
  the **Evidence Appendix** and produced **0 recognized `Evidence
  quote:` citations**.
- `jd_000201` was **avoided, not repaired**.
- `fabricated_or_unmatched = 0` only because no citation-format
  quotes were emitted to check.
- Rolled back in commit `3957e87` before push.
- DECISION verdict: `revise` (`db3cf3b`).

## Omission mechanism

- Model did NOT stop double-quoting entirely (post-patch runs still
  produced 19-21 `quote_candidates`).
- Model stopped using the recognized `Evidence quote: "TEXT" —
  Company, jd_XXXXXX.` citation format AND dropped the Evidence
  Appendix.
- Root cause: the rejected patch added strong DO NOT clauses + an
  exact-substring self-check with `"or replace"` wording — combined
  with pre-existing permissive origin/main language (no `MUST` for
  Appendix, no minimum count, `"if useful"` bullet), the model chose
  **omission as the safest compliance path**.

## Supported findings vs inference

### Supported (from A/B run artifacts)

- Post-patch A `evidence_entries` dropped 5 → 0.
- Post-patch B `evidence_entries` dropped 5 → 0.
- 19-21 `quote_candidates` remained in both runs (not zero) —
  proving the model kept quoting but stopped using the recognized
  citation format.
- Appendix dropped in both runs.
- No checker / parser / harness change — shape change is entirely
  on the model side.
- R2 fires dropped to 0 consistent with zero recognized citation
  quotes (not a checker defect).

### Plausible inference

- `"shorten OR replace"` in the self-check clause left omission as a
  valid substitution path.
- Pre-existing permissive Appendix wording (`"End the report with a
  short evidence appendix"`) was easy to skip.
- `"quote a phrase if useful"` provided implicit permission to omit.

### Unknowns

- Whether other Sonnet 4.6 samples exhibit the same behavior.
- Whether Appendix would have been dropped without the self-check
  clause specifically.
- Whether omission is stable across many runs.

## Selected design

**Option B-lite = Option A + skeleton enforcement.**

- Prompt-only change · `src/lib/prompts.ts::reportSystemPrompt`.
- Zero checker / parser / harness impact.
- Zero Markdown-shape change.
- Preserves R1 / R2.
- Enables clean `git revert` if paid validation fails again.

## Mandatory evidence structure

- **S1** — MUST include `## Evidence Appendix` heading
- **S2** — MUST include 5 `Evidence quote:` lines (one per gap)
- **S3** — each gap MUST cite at least one `jd_id`
- **S4** — MUST use exact format `Evidence quote: "TEXT" — Company,
  jd_XXXXXX.`
- **S5** — Appendix lists cited `jd_id + company + title` columns
- **S6** — no omission because exact quoting is difficult

## Exact quote contract

- **F1** — one exact contiguous substring of cited JD body
- **F2** — no ellipsis inside quote
- **F3** — no grammar repair inside quotation marks
- **F4** — no paraphrase inside quotation marks
- **F5** — no word / tense / plurality / article / conjunction
  changes inside quotes
- **F6** — explanation outside quotation marks
- **F7** — fragments allowed and preferred over stitched spans

## Minimum citation recommendation

**N = 5**, matching:

- Existing "Your top 5 gaps, ranked (5 numbered items)" structural
  convention.
- Prior healthy-run norm (5d-stability A = 5 · 5d-b-timeout-
  diagnostics B = 5).
- Avoids filler by NOT choosing N ≥ 6.

## Appendix requirement

- Exact heading: `## Evidence Appendix`.
- Placement: after "highest-leverage next action" section.
- Contract: every body-cited `jd_id` appears once with columns
  `jd_id | company | title`.
- Duplicates de-duplicated.
- Uncited Appendix entries allowed but telemetered (existing
  `appendix_entries_not_cited` check).
- Never omit because exact quote is hard — use shorter fragment.

## Positive / negative example recommendation

**Positive** (compact synthetic):

```
Evidence quote: "agentic RAG at scale" — ExampleCo, jd_999999.
This phrase shows the archetype expects hands-on production
experience with retrieval-plus-tool-use, not just prompt engineering.
```

**Negative** (2-3 compact synthetic anti-patterns):

- Ellipsis bridging invalid
- Grammar repair invalid
- Omission invalid

Synthetic `jd_999999` / `ExampleCo` to prevent overfitting.

## Self-check ordering

- **Structure FIRST**: verify 5 `Evidence quote:` lines · verify
  `## Evidence Appendix` present.
- **Exactness SECOND**: verify each quoted string appears exactly
  in supplied JD body.
- **Citation validity THIRD**: verify each cited `jd_id` in
  supplied EVIDENCE JDs list.

This ordering prevents "passed exactness by omitting everything".

## Structural-validator recommendation

- **YES eventually**, in a **separate future design loop**.
- Post-generation deterministic check on emitted `report.md`.
- Fails run if Appendix missing OR fewer than 5 `Evidence quote:`
  matches OR Appendix-body mismatch.
- **Does NOT** rewrite output · **does NOT** auto-retry · **does
  NOT** invoke LLM.
- **Do NOT couple** to this design — keep prompt-only in first
  iteration.

## Future paid A/B validation plan

- Requires **separate TASK + RUN_REPORT + DECISION + explicit human
  GO + cost approval**.
- Stages: apply refined prompt · deterministic $0 tests · TypeScript
  typecheck · Fixture A × 1 · Fixture B × 1 · **no retries**.
- **Estimated cost**: **~$0.10 total**.
- Success criteria + failure criteria detailed in memo § 26-§ 27.
- `jd_000201` nuance: success does NOT require `jd_000201` cited
  every run; success = if cited, must be exact contiguous quote.

## Open-question resolutions

| Q | Resolution |
|---|---|
| **Q1** mandatory count | **YES** — omission was observed failure mode |
| **Q2** minimum count value | **5** (one per numbered gap) |
| **Q3** Appendix mandatory | **YES** with exact `## Evidence Appendix` heading |
| **Q4** omission forbidden | **YES** — critical block AND checklist |
| **Q5** positive example | **YES** — one compact synthetic |
| **Q6** negative examples | **YES** — 2-3 compact synthetic anti-patterns |
| **Q7** self-check ordering | **Structure FIRST, exactness SECOND** |
| **Q8** future structural validator | **YES eventually, separate design loop** |
| **Q9** first impl prompt-only | **YES** — minimum-first |
| **Q10** paid A+B before promotion | **YES** — no promotion until validated |

## Confirmations

- ✅ no implementation
- ✅ no generation
- ✅ no code / prompt change (working tree matches `origin/main` for
  `src/**` and `scripts/**`)
- ✅ no checker / parser / harness change
- ✅ no R1 / R2 relaxation
- ✅ no baseline mutation / promotion
- ✅ no pipeline change (`b019786` 起终一致)
- ✅ no `.agent/scripts/**` change (hard rule per AgentOps-2c)
- ✅ no threshold change · no retry behavior added
- ✅ no C/D/E · no A-E
- ✅ no PDFs · no OpenAI API
- ✅ no LLM judge · no edit-distance · no fuzzy · no post-generation
  quote replacement · no silent quote rewriting
- ✅ no `.env*` · `vercel.json` · `package.json` · lockfile ·
  workflow · GH Actions change
- ✅ no `report.md` / screenshot / long quote / secret committed
- ✅ **QI remains telemetry-only**
- ✅ **no blocking promotion** · **no `AgentOps-5f-promote`**
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human` · Q10 pause · Codex
  planner spec-only

## Cost

**$0** — no runtime activity of any kind.

## Recommended next step

**Human + ChatGPT review, then create DECISION.**

Executor mild preference for the DECISION: **approve** ·
required_fixes **none** · confirm Option B-lite · next-loop =
`AgentOps-5e-followup-prompt-refinement-implement`
(~$0.10 · separate TASK + RUN_REPORT + DECISION + human GO + cost
approval) OR handoff / pause.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT implement refined prompt.** **Do NOT run
A/B.** **Do NOT authorize cost.** **Do NOT create structural
validator.** **Do NOT start `AgentOps-5f-promote`.**
