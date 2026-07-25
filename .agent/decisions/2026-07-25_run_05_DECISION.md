# DECISION · AgentOps-5e-followup-phase3-QI-amber-case-insensitive-diagnostics-design · APPROVE · Path A no-change

## Metadata

- **decision_id**: `2026-07-25_run_05_DECISION`
- **date**: 2026-07-25
- **based_on_run_report**: `.agent/run_reports/2026-07-25_run_05_RUN_REPORT.md`
- **based_on_task**: `.agent/tasks/2026-07-25_run_05_TASK.md`
- **based_on_findings**: `.agent/findings/2026-07-25_qi_amber_case_insensitive_inventory.json`
- **based_on_memo**: `.agent/design_memos/2026-07-25_AgentOps-5e-followup-phase3-QI-amber-case-insensitive-diagnostics-design.md`
- **authorizing_decision**: `.agent/decisions/2026-07-25_run_02_DECISION.md` (Phase 3 completion — QI diagnosis explicitly deferred)
- **loop**: `AgentOps-5e-followup-phase3-QI-amber-case-insensitive-diagnostics-design`
- **parent_loop**: `AgentOps-5e-followup-phase3-structural-rendered-text-contract-implement` (`2026-07-25_run_04`)
- **design_commit**: `4581191` (Design QI amber quote diagnostics)
- **run_report_commit**: `933f86b` (Add RUN_REPORT 2026-07-25_run_05)
- **decision_commit**: `<pending>` (this commit)

## Verdict

- **verdict**: `approve`
- **human_approval_needed**: **yes** (for push · for any subsequent alternative-path implementation · for any paid fixture validation)
- **required_fixes**: **none**

## Outcome classification

**Fixture B's single QI AMBER case-insensitive match is functioning as
designed. The retained evidence directly shows a sentence-start
capitalization difference, and no checker, prompt, or product-output
intervention is justified.**

## Reasoning summary

The report prompt requires quoted JD evidence to be copied
character-for-character from one contiguous source span. The QI
checker intentionally uses a graded matching sequence: raw
case-sensitive substring, normalized case-preserving substring, and
finally normalized case-insensitive substring. A quote that matches
only at the third tier is classified AMBER rather than GREEN or RED.
For the retained Fixture B evidence, the generated quote begins with
uppercase `B` while the source span begins with lowercase `b`;
characters 1 through 59 are directly observed as identical. The
remaining characters of the 105-character quote were not retained in
full, so the complete quote is classified as **most likely case-only
variance** rather than claimed as fully byte-level verified. Company
and role checks pass, and no fabrication, wrong-company, wrong-role,
or duplicate finding exists. The difference does not alter meaning
and has very low trust impact, while AMBER correctly preserves the
distinction between faithful meaning and strict byte-verbatim fidelity.

## Diagnosis

- **confidence**: **`most_likely_cause`**
- **classification**: `sentence_start_capitalization_only_at_position_0`
- **mismatch class**: `capitalization_only`
- **product significance**: `benign_formatting_variance`
- **material quote-fidelity issue**: **false**
- **checker contract mismatch**: **false**
- **prompt contract mismatch**: **false**
- **renderer or capture defect**: **false**

## Matched quote

- **cited_jd_id**: `jd_000173`
- **company**: Microsoft
- **title**: Principal Software Engineer - Full Stack AI
- **quote_character_length**: **105**
- **retained_generated_excerpt_length**: **60**
- **directly observed difference**:
  - **position**: **0**
  - **generated**: `B`
  - **source**: `b`
  - **category**: `capitalization_only`
- **directly observed identical range**: **positions 1 through 59**
- **unretained range**: **positions 60 through 104**
- **full-range conclusion**: **inferred case-only compatibility under Tier-3 semantics, not directly byte-compared**

## Source evidence

- **source**: `src/data/web_bundle.json`
- **jd_id**: `jd_000173`
- **body_length**: **2205**
- **retained generated excerpt case-sensitive match**: **not found**
- **retained generated excerpt case-insensitive match**: **found**
- **source index**: **1175**
- **source begins**: lowercase `build`
- **generated quote begins**: uppercase `Build`

## Intended contract

- quote must come from **one contiguous source span**
- **character-for-character** copying required
- capitalization is included in character-for-character fidelity
- strict byte-verbatim status therefore fails
- meaning preservation alone does not qualify as Tier-1 verbatim

## Checker behavior

- **Tier 1**: raw case-sensitive substring
- **Tier 2**: normalized but case-preserving substring
- **Tier 3**: normalized and case-insensitive substring
- **Tier 3 verdict**: **AMBER**
- **Tier 3 behavior**: **intentional**
- **blocking mode**: **`telemetry_only`**
- **`affected_legacy_verdict`**: **false**
- **`affected_process_exit`**: **false**

## Normalization

- **smart quote normalization**: supported
- **dash normalization**: supported
- **ellipsis normalization**: supported
- **pipe-to-newline normalization**: supported
- **whitespace collapse**: supported
- **case folding**: **only Tier 3**
- **fuzzy matching**: **absent**
- **edit distance**: **absent**
- **semantic similarity**: **absent**
- **LLM judge**: **absent**

## Selected path

- **name**: **Path A**
- **decision**: **no change**
- **checker change**: **false**
- **prompt change**: **false**
- **harness change**: **false**
- **retention change**: **false**
- **fixture rerun**: **false**
- **provider call**: **false**

### Path A rationale

- AMBER is the intended signal for a quote that is faithful in wording but not strict case-sensitive verbatim
- GREEN would erase useful quote-fidelity information
- RED would overstate a benign sentence-start capitalization difference
- telemetry-only AMBER has no legacy or process-exit effect
- no current blocker depends on eliminating this AMBER
- expected value of implementation or paid rerun is low

## Rejected alternatives

### Path B — prompt reinforcement

- **rejected**
- prompt already explicitly says verbatim and character-for-character
- no prompt defect established
- additional wording has uncertain benefit
- no evidence it would eliminate model capitalization behavior

### Path C — checker clarification or sub-tier

- **rejected**
- current Tier-3 AMBER already communicates the intended distinction
- additional sub-tier would add complexity without changing action

### Path D — retention expansion

- **rejected for now**
- would increase retained proprietary text and privacy surface
- missing tail certainty does not change current action
- may be reconsidered only through a separate privacy-conscious design

### Path E — deterministic test

- **not required** for current no-change decision
- optional future codification only
- any test implementation requires a separately gated loop

## Product significance

- **meaning changed**: **false**
- **source attribution correct**: **true**
- **company association correct**: **true**
- **role association correct**: **true**
- **user-perceived faithfulness**: **high**
- **auditor byte-verbatim**: **false**
- **trust impact**: **very_low**
- **current AMBER should remain**: **true**

## Policy

- **QI**: **`telemetry_only`**
- **structural**: **`telemetry_only`**
- **combined**: **`display_only`**
- **legacy verdict**: **unchanged**
- **process exit**: **unchanged**
- **baseline mutation**: **unauthorized**
- **baseline eligibility change**: **unauthorized**
- **QI blocking promotion**: **unauthorized**
- **threshold change**: **unauthorized**
- **citation-regex broadening**: **unauthorized**
- **fuzzy matching**: **prohibited**
- **edit distance**: **prohibited**
- **semantic similarity**: **prohibited**
- **LLM judge**: **prohibited**
- **post-generation rewrite**: **prohibited**
- **provider retry**: **prohibited**

## Fixture and provider authorization

- **Fixture A rerun**: **false**
- **Fixture B rerun**: **false**
- **paid provider call**: **false**
- **live validation**: **not required**
- **further execution**: **requires separate explicit approval**

## Residual risks

- Characters 60 through 104 were **not directly retained**.
- Additional capitalization differences in the unretained suffix **cannot be individually enumerated**.
- Future AMBER cases may have different causes and must **not automatically inherit this diagnosis**.
- Benign sentence-start capitalization AMBERs **may continue to occur**.
- Silent checker broadening would **violate current policy**.

## Cost

- **diagnosis**: **$0**
- **DECISION**: **$0**
- **provider calls**: **0**
- **fixture reruns**: **0**

## Not authorized

- **implementation**
- **push before human approval**
- **QI checker change**
- **prompt change**
- **harness change**
- **retention expansion**
- **fixture rerun**
- **provider call**
- **baseline mutation**
- **blocking promotion**
- **Phase 4**
- **Phase 5**
- **Phase 6**
- **`AgentOps-5f-promote`**

## Human approval needed

`yes`

> Required for: push · daily summary update · any subsequent
> alternative-path (B/C/D/E) implementation loop · any paid fixture
> validation · any promotion or baseline action · any downstream action
> listed under **Not authorized**.

## Stop condition

DECISION written and committed. **Do NOT push.** **Do NOT implement any
of Path A/B/C/D/E as code.** **Do NOT modify checker, prompt, harness,
integration helper, tests, baselines, fixtures, package files,
workflows, env, or Vercel config.** **Do NOT call a real provider.**
**Do NOT rerun any fixture.** **Do NOT mutate baselines.** **Do NOT
promote QI / structural / combined to blocking.** **Do NOT start
`AgentOps-5f-promote`.** **Do NOT start Phase 4 / 5 / 6.**
