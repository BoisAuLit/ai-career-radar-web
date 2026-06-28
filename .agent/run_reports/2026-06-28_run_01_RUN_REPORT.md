# RUN REPORT · AgentOps-1c run_report and decision helper scripts

> Third real RUN_REPORT under the AgentOps file protocol. First one
> scaffolded by `python .agent/scripts/new_run_report.py --task-id
> 2026-06-28_run_01` (dogfooding the helper this task just created).

## Metadata

- **task_id**: `2026-06-28_run_01` (must match the TASK file)
- **date**: `2026-06-28`
- **run_number**: `01`
- **branch**: `agent/2026-06-28_run_01` (or the actual branch if different — say so)

## Commits

- `2b5c1dd` Add new_run_report.py + new_decision.py helpers (AgentOps-1c)

(Plus `8f50ff4 Add TASK 2026-06-28_run_01` which committed the TASK
file onto `main` before this branch was cut, and a forthcoming
`Add scripts/.gitignore + RUN_REPORT 2026-06-28_run_01` commit that
will land alongside this report — see the final commit list in the
follow-up summary.)

## Files changed

```
 .agent/README.md                                   |  49 +++++-
 .agent/run_reports/2026-06-28_run_01_RUN_REPORT.md | <this file>
 .agent/scripts/.gitignore                          |   5 +
 .agent/scripts/_common.py                          |  47 +++++
 .agent/scripts/new_decision.py                     |  86 +++++++++
 .agent/scripts/new_run_report.py                   |  88 +++++++++
```

No `src/` edits. No `package.json` / `package-lock.json` / `.env` /
prompt / pipeline / workflow / data-bundle / deployment-config edits.

## Summary

Added two parallel helpers to the AgentOps protocol surface:

- `.agent/scripts/new_run_report.py` — scaffolds the next RUN_REPORT
  from `templates/run_report_template.md`, substituting `task_id`,
  `date`, `run_number`, and `branch` in the metadata block.
- `.agent/scripts/new_decision.py` — scaffolds the next DECISION from
  `templates/decision_template.md`, substituting `decision_id` and
  `based_on_run_report` (the latter pre-filled to the conventional
  `.agent/run_reports/{task_id}_RUN_REPORT.md` path).

Both helpers mirror `new_task.py`'s shape: Python stdlib only, no
external commands, refuse-to-overwrite, single-line stdout, never
auto-commit. They share a tiny `_common.py` module containing
`resolve_task_id()` (the `--task-id` vs `--date+--run` parsing /
validation helper) because the duplication would otherwise have been
~30 lines per script.

The `.agent/scripts/_common.py` filename uses a single underscore
prefix to signal "internal, not invoked as a CLI itself" — a Python
convention. Importing it from sibling scripts works because Python's
`sys.path[0]` is always the running script's directory.

Added `.agent/scripts/.gitignore` to scope `__pycache__/` and `*.pyc`
to this directory (the only place Python runs in this Next.js repo);
the repo-root `.gitignore` was deliberately not touched.

Extended `.agent/README.md` with two new helper subsections plus a
brief "Shared internals" note, and updated the directory tree at the
top to list all four script files.

## Constraints checked

- [x] `src/**` — untouched (`git diff --stat main..HEAD -- src/` is empty)
- [x] `.github/workflows/**` — untouched
- [x] `src/lib/prompts.ts` — untouched
- [x] `src/data/web_bundle.json` — untouched
- [x] `package.json` — untouched (no new deps, no new npm scripts)
- [x] `package-lock.json` — untouched
- [x] `.env*` — untouched
- [x] `vercel.json` / `.vercel/**` — untouched
- [x] Pipeline repo (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar/`) — not accessed
- [x] No prompt / classifier / extractor file edits
- [x] No model selection edits
- [x] No OpenAI API integration / SDK / `.env` keys / client init
- [x] No GitHub Actions / `@claude` integration
- [x] Standard library only across all three new Python files (verified
      by `grep '^import\|^from' .agent/scripts/*.py`: only `argparse`,
      `datetime`, `pathlib`, `re`, `sys`, plus `from _common import
      resolve_task_id` between the sibling scripts)
- [x] No banned function calls — `subprocess`, `os.system`, `os.popen`,
      `urllib`, `socket`, `requests`, `httpx`, etc. all return zero
      matches under `grep -E ... .agent/scripts/*.py`
- [x] No GitHub Actions, no daemon, no watcher, no orchestrator, no UI
- [x] Scripts do not auto-commit anything

## Red-zone check

- Red-zone files modified this run: `none`
- Approval reference for any red-zone modification: N/A

## Validation results

```
$ git status   (start, on branch agent/2026-06-28_run_01)
clean

=== --help · both scripts ===
PASS — both render --task-id, --date, --run flags + "Local-only" epilog

=== smoke 1 · new_run_report.py --task-id 2099-01-01_run_01 ===
→ printed: .agent/run_reports/2099-01-01_run_01_RUN_REPORT.md (3,034 bytes)

=== smoke 2 · metadata block in created file ===
task_id `2099-01-01_run_01` (must match the TASK file)         ← substituted
date `2099-01-01`                                              ← substituted
run_number `01`                                                ← substituted
branch `agent/2099-01-01_run_01` (or the actual branch if ...) ← substituted
PASS

=== smoke 3 · rerun new_run_report.py with same --task-id ===
→ stderr: error: refuse to overwrite existing .../run_reports/2099-01-01_run_01_RUN_REPORT.md
→ exit code: 2
PASS

=== smoke 4 · new_decision.py --task-id 2099-01-01_run_01 ===
→ printed: .agent/decisions/2099-01-01_run_01_DECISION.md (2,278 bytes)

=== smoke 5 · DECISION file exists ===
PASS

=== smoke 6 · DECISION contains based_on_run_report pointing at the RUN_REPORT ===
$ grep based_on_run_report ...
- **based_on_run_report**: `.agent/run_reports/2099-01-01_run_01_RUN_REPORT.md`
PASS

=== smoke 7 · rerun new_decision.py with same --task-id ===
→ stderr: error: refuse to overwrite existing .../decisions/2099-01-01_run_01_DECISION.md
→ exit code: 2
PASS

=== bonus · --date+--run form also collides correctly ===
$ python .agent/scripts/new_run_report.py --date 2099-01-01 --run 1
→ same refuse-to-overwrite error + exit 2
PASS

=== bonus · invalid --task-id format ===
$ python .agent/scripts/new_run_report.py --task-id bogus
→ stderr: error: --task-id must match YYYY-MM-DD_run_NN, got 'bogus'
→ exit code: 2
PASS

=== bonus · mutually-exclusive flags ===
$ python .agent/scripts/new_run_report.py --task-id 2099-01-01_run_01 --date 2099-01-01 --run 1
→ stderr: error: --task-id is mutually exclusive with --date/--run
→ exit code: 2
PASS

=== smoke 8 · cleanup ===
$ rm .agent/run_reports/2099-01-01_run_01_RUN_REPORT.md
$ rm .agent/decisions/2099-01-01_run_01_DECISION.md

=== smoke 9 · no 2099 artifacts remaining ===
$ ls .agent/run_reports | grep 2099 || echo "run_reports: clean"
run_reports: clean
$ ls .agent/decisions | grep 2099 || echo "decisions: clean"
decisions: clean
PASS

=== dogfood · scaffold this RUN_REPORT via the new helper ===
$ python .agent/scripts/new_run_report.py --task-id 2026-06-28_run_01
.agent/run_reports/2026-06-28_run_01_RUN_REPORT.md            ← this file
PASS — the helper produced the file we are now filling in.

$ git diff --stat main..HEAD
 .agent/README.md                                   |  49 ++++++-
 .agent/run_reports/2026-06-28_run_01_RUN_REPORT.md | <see body>
 .agent/scripts/.gitignore                          |   5 +
 .agent/scripts/_common.py                          |  47 +++++
 .agent/scripts/new_decision.py                     |  86 +++++++++
 .agent/scripts/new_run_report.py                   |  88 +++++++++
```

## Build result

`not-run` — no app code changed, so `npm run build` was not required
by the TASK. Skipped for speed. The three new Python files are pure
stdlib and have no JS/TS compilation relevance.

## Tests result

`pass` — 9/9 of the TASK's listed smoke steps plus 3 additional edge
cases all pass (see "Validation results" above). No formal unit-test
framework was added; smoke tests covered:

- `--help` for both scripts
- `new_run_report.py` create + collision + cleanup
- `new_decision.py` create + `based_on_run_report` pre-fill verification + collision + cleanup
- `--date+--run` form collision (proves both arg forms resolve the same target)
- Bad `--task-id` format
- Mutually-exclusive flag combinations
- Dogfood: this very RUN_REPORT was scaffolded by `new_run_report.py`

## Screenshots

`n/a` — pure protocol-tooling work, nothing rendered visually.

## Risks

- **`_common.py` was added during execution, not in the original TASK
  outline.** Severity: **low**. The TASK explicitly allowed it ("if
  shared logic exceeds ~20 lines"); without the extract the combined
  size was 241 lines vs the 200-line cap. The factor-out brought
  combined helper code to 174 lines + 47-line `_common.py`. Flagging
  per policy that a structural choice was made mid-run.
- **`.agent/scripts/.gitignore` was added during execution, not in the
  original TASK outline.** Severity: **low**. The smoke tests created
  a `__pycache__/` directory (because `new_run_report.py` and
  `new_decision.py` import `_common.py`); since this is the first time
  Python runs in this Next.js repo, the repo-root `.gitignore` had no
  `__pycache__/` rule. Scoping the rule locally to `.agent/scripts/`
  keeps the repo-root `.gitignore` untouched. The alternative — adding
  to the repo-root `.gitignore` — was rejected to minimize blast
  radius. The file is 5 lines and ignores only `__pycache__/` and
  `*.pyc`.
- **`resolve_task_id()` validates `--task-id`-derived dates against
  `datetime.date.fromisoformat`, which on Python 3.11+ accepts more
  than `YYYY-MM-DD` (e.g. `20990101`).** Severity: **trivial**. The
  TASK_ID_RE pattern already requires the dashed format before
  `fromisoformat` is even called, so this can't be triggered through
  `--task-id`. Mentioning only for completeness.

## Follow-up recommendations

- Consider a `--scaffold-all` option (one command, three files) only
  *if* the manual three-step invocation becomes noticeably tedious
  across several more runs. Right now the three-step form is honest
  about what's happening and easier to reason about.
- A separate `.agent/scripts/check_loop.py` that walks `tasks/`,
  `run_reports/`, `decisions/`, and flags any task_id missing one of
  the three would be useful as a quick audit. **Defer** until missing
  files actually happen.
- Eventually a `_common.py` for `new_task.py` too (currently
  duplicates date validation), but the marginal value is tiny — skip
  until a fourth helper appears.

## Ready for review

`yes`

## Requires human decision

`no`

> Yellow task; no red-zone file touched; no app code changed; smoke
> tests all green; dogfood worked. Two open items for the DECISION
> reviewer to consider: (1) whether the `_common.py` extraction is
> acceptable as a mid-run structural choice (driven by the 200-line
> cap), and (2) whether `.agent/scripts/.gitignore` is acceptable as a
> mid-run addition (driven by the smoke-test pycache cleanup).
