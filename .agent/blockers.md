# Automation blockers

> Items automation cannot decide. Codex CLI appends; the human (with
> ChatGPT Chat) resolves during Non-Automation Time. See
> `.agent/policies/automation_policy.md` §9 for schema rules.

## Blocker schema

Each entry is a `### BLK-NNNN · <short title>` block with these fields:

- `date` — when raised (`YYYY-MM-DD`)
- `source_task_or_window` — TASK id (e.g. `2026-06-28_run_04`) or
  window report id (e.g. `2026-06-29_SLEEP_WINDOW_REPORT`)
- `repo` — `web` / `pipeline` / `both` / `n/a`
- `risk` — `yellow` / `red`
- `reason_blocked` — one paragraph
- `exact_human_decision_needed` — one sentence the human can answer
  with "approve / reject / defer" + a note
- `suggested_chatgpt_review_question` — verbatim text to paste into
  ChatGPT Chat
- `current_status` — `open` / `resolved` / `wont-do`

Resolving a blocker requires:
1. Human (or human + ChatGPT) writes a one-line resolution + verdict.
2. Update `current_status: resolved` (or `wont-do`).
3. Move the entry from "Open" → "Resolved".

---

## Open blockers

### BLK-0001 · G2.1d red-zone approval

- **date**: `2026-06-28`
- **source_task_or_window**: `2026-06-28_run_04` (AgentOps-2a) — queue item `QUEUE-0002`
- **repo**: `pipeline`
- **risk**: **red**
- **reason_blocked**: G2.1d would rewrite the classifier prompt in
  `scripts/collector/classifier.py` and bump `CLASSIFIER_VERSION`.
  Both are red-zone per the new automation policy
  (`.agent/policies/automation_policy.md` §6). Even though the
  associated sidecar / dry-run scoring fields stay out of the main
  schema (per G2.1 spec §5), the prompt change itself requires explicit
  human approval before any execution begins — not just before merge.
- **exact_human_decision_needed**: Approve opening a new RED TASK to
  implement G2.1d (classifier prompt rewrite + scoring dry-run), with
  explicit human approval before Claude Code begins editing
  `classifier.py`?
- **suggested_chatgpt_review_question**:
  > Read `.agent/policies/automation_policy.md` §6 (Red policy) and
  > `corpus/taxonomy/G2.1_spec.md`. Is now the right time to open a
  > red TASK for G2.1d (classifier prompt rewrite + scoring dry-run
  > using the G2.1c eval set)? Or should we defer until the
  > AgentOps-2a policy has been exercised at least once via a
  > MANUAL_DRY_RUN report?
- **current_status**: `open`

### BLK-0002 · Full automation activation

- **date**: `2026-06-28`
- **source_task_or_window**: `2026-06-28_run_04` (AgentOps-2a) — policy itself
- **repo**: `n/a` (process-level)
- **risk**: **red**
- **reason_blocked**: The new automation policy
  (`.agent/policies/automation_policy.md`) defines the rules for
  Automation Time but no runner exists yet to obey them. Activating
  any Automation Window before:
  (a) the policy is reviewed and approved by human + ChatGPT, and
  (b) at least one `MANUAL_DRY_RUN` report has validated the contract
      end-to-end (queue item `QUEUE-0006`), and
  (c) a minimal AgentOps-2b runner has been scoped and approved
  would be premature.
- **exact_human_decision_needed**: Approve the schedule and order of
  AgentOps-2a review → MANUAL_DRY_RUN → AgentOps-2b runner scoping
  before any real Automation Window opens?
- **suggested_chatgpt_review_question**:
  > Read `.agent/policies/automation_policy.md` end-to-end. Before
  > we open any real Automation Window (SLEEP / WORKDAY / WEEKEND),
  > what do you think the right sequence is? Specifically, is the
  > MANUAL_DRY_RUN (QUEUE-0006) a useful intermediate, or can we go
  > straight to a minimal AgentOps-2b runner? What's the smallest
  > AgentOps-2b that would obey this policy?
- **current_status**: `open`

### BLK-0003 · Any OpenAI API usage

- **date**: `2026-06-28`
- **source_task_or_window**: `2026-06-28_run_04` (AgentOps-2a) — policy §3 / §12
- **repo**: `n/a` (process-level)
- **risk**: **red**
- **reason_blocked**: The current policy explicitly defers OpenAI API
  usage (`.agent/policies/automation_policy.md` §3 · §12). No SDK
  install, no API key, no HTTP request to OpenAI endpoints, no billing
  setup is allowed. Any future task that proposes OpenAI API usage
  (e.g. for an auto-reviewer / auto-planner in a later AgentOps-N
  phase) must first surface that change in a design memo and get
  explicit human approval.
- **exact_human_decision_needed**: This blocker is **standing**: leave
  `open` indefinitely. Any future TASK that touches OpenAI integration
  must reference and explicitly request resolution of this blocker.
- **suggested_chatgpt_review_question**:
  > BLK-0003 is a standing block on OpenAI API usage. Is there any
  > near-term reason to lift it? If not, leave it open as a permanent
  > guardrail. If yes, what would the smallest first OpenAI API
  > usage look like, and what's the design-memo + human-approval flow
  > to authorize it?
- **current_status**: `open`

---

## Resolved blockers

*(empty — first day of blockers)*
