# DECISION · G2.1b · taxonomy spec doc

> Authored by ChatGPT (human-mediated) after reading the RUN_REPORT.
> First cross-repo DECISION under the AgentOps file protocol.
> Scaffolded by `python .agent/scripts/new_decision.py --task-id
> 2026-06-28_run_02` (dogfood — third loop using the helper triple).

## Metadata

- **decision_id**: `2026-06-28_run_02_DECISION` (matches the TASK + RUN_REPORT)
- **based_on_run_report**: `.agent/run_reports/2026-06-28_run_02_RUN_REPORT.md`

## Verdict

`approve`

## Reasoning summary

G2.1b was completed within the approved scope. This was a cross-repo
documentation-only task. The web repo received the AgentOps TASK and
RUN_REPORT files. The pipeline repo received a frozen taxonomy spec
document at `corpus/taxonomy/G2.1_spec.md` plus a short
`corpus/taxonomy/README.md`. The spec converts the approved G2.1a
design memo into a stable reference for later stages: G2.1c
hand-labeled eval set, G2.1d classifier/scoring dry-run, G2.1e dry-run
comparison, and G2.1f promotion decision. No runtime behavior was
changed.

## Risks found

1. **First cross-repo AgentOps task — merge and push ordering matters.**
   Severity: **low** / **manageable**. The web repo (TASK + RUN_REPORT
   + this DECISION on `main`) and the pipeline repo (spec branch
   `agent/2026-06-28_run_02`) must be promoted deliberately. Recommend
   web-repo push first, then pipeline ff-merge + push.
2. **Future stages will likely touch red-zone files.** Severity:
   **low** (for now). G2.1d will need `scripts/collector/classifier.py`
   (and possibly `extraction.py`), G2.1e/f may touch schema and
   pipeline artifacts. Each must get its own TASK / RUN_REPORT /
   DECISION with explicit human approval.
3. **Reject categories `non_ai_swe` / `ai_buzzword_only` are
   sidecar-only.** Severity: **low** / **policy carry-forward**. They
   must NOT be promoted to the main schema or DB columns without a
   later, separately-approved red-stage task. The spec's §5 and §6
   both record this constraint.
4. **The spec is the reference point for future prompt rewrites.**
   Severity: **low**. Edits to it must continue to flow through
   AgentOps change control (see spec §9), even though it's a
   documentation file in the pipeline repo where cron commits land
   daily.

## Red-zone flags

`none` for G2.1b implementation.

No classifier, extractor, schema, source, workflow, cron, prompt,
generated corpus, or web app files were changed in either repo.
Forbidden-files audit in the RUN_REPORT shows all 30+ tracked paths as
`unchanged ✓`.

## Required fixes

`none`

## Next task prompt for Claude

```markdown
# (instruction — no new TASK file yet)

Do not start G2.1c yet. First prepare G2.1b for human-approved merge
and push.

The user has approved the G2.1b result conceptually via this DECISION,
but the following state-changing actions still require explicit
confirmation per policy §3:

- Push `main` of the web repo to `origin/main` (2 unpushed commits:
  TASK + RUN_REPORT, plus this DECISION about to be committed).
- Fast-forward merge `agent/2026-06-28_run_02` → `main` in the
  pipeline repo.
- Push pipeline `main` to `origin/main`.

After this DECISION is committed:
1. Stay on `main` of the web repo and on `agent/2026-06-28_run_02` of
   the pipeline repo (do NOT switch to pipeline `main` proactively).
2. Report for **both repos**:
   - current branch
   - full commit list of commits not yet on the respective origin
   - full file scope (`git diff --stat`-style)
   - whether the pipeline branch is ready for a clean fast-forward
     merge (check that pipeline `main` HEAD == branch base parent;
     remember pipeline `main` may have new daily cron commits since
     the branch was cut, in which case a `git fetch + ff-pull` of
     `main` before merge is needed)
   - whether either origin still has the expected state (run
     `git fetch` then `git rev-list --left-right --count origin/main...HEAD`)
3. Do NOT switch branches, do NOT invoke `git merge`, do NOT
   push either origin, do NOT deploy.

Wait for Bohao's explicit "push web + merge and push pipeline" (or
similar) instruction before any state-changing action. The G2.1c task
(eval set) starts only after G2.1b is fully promoted.
```

## Human approval needed

`yes` — required before:
- Web repo push (`origin/main` of `/Users/bohaoli/Desktop/ai-career-radar-web`).
- Pipeline repo merge (`agent/2026-06-28_run_02` → `main`).
- Pipeline repo push (`origin/main` of `/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar`).
- Any deployment of either repo.

> Verdict is `approve` for the technical execution captured in the
> RUN_REPORT. Standing policy still treats `main`-branch merges,
> pushes, and deploys as actions requiring explicit human GO — and
> this is a cross-repo task, so each repo's promotion is its own
> approval point. The next step is Bohao's call.
