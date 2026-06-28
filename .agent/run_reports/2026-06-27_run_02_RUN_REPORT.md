# RUN REPORT · AgentOps-1b new_task helper script

> Second real RUN_REPORT under the AgentOps file protocol.

## Metadata

- **task_id**: `2026-06-27_run_02`
- **date**: `2026-06-27`
- **run_number**: `02`
- **branch**: `agent/2026-06-27_run_02`

## Commits

- `1aa5d9e` Add new_task.py helper + README "Helper scripts" section (AgentOps-1b)

(Plus `63ec897 Add TASK 2026-06-27_run_02` which committed the TASK file
onto `main` before this branch was cut.)

## Files changed

```
 .agent/README.md            |  41 ++++++++++
 .agent/scripts/new_task.py  | 162 +++++++++++++++++++++++++++++++++++++++++
 2 files changed, 204 insertions(+)
```

No `src/` edits. No `package.json` / `package-lock.json` / `.env` /
prompt / pipeline / workflow / data-bundle edits. New directory created:
`.agent/scripts/`.

## Summary

Added `.agent/scripts/new_task.py`, a Python-stdlib-only helper that
generates the next `.agent/tasks/YYYY-MM-DD_run_XX_TASK.md` from
`templates/task_template.md`. The metadata block (task_id, date,
run_number, title, risk_level) is substituted; every other
`<placeholder>` is preserved so the author still fills the meaningful
fields.

The implementation is a single `argparse` script with three named
functions (`next_run_number`, `render`, `main`). It depends only on
`argparse`, `pathlib`, `re`, `datetime`, `sys`. It does not invoke any
external process — no subprocess, no shell, no HTTP, no git/npm/vercel,
no Claude/OpenAI API. It never auto-commits.

**Design note on `--run` flag.** The TASK acceptance criterion required
"refuses to overwrite an existing TASK file", but with auto-incrementing
run numbers the `target.exists()` defensive guard is unreachable through
normal usage (since `next_run_number` always returns a free slot). I
added an optional `--run NN` flag to make the refuse path testable and
intentionally invokable — without it, the acceptance criterion would
have been an unfalsifiable claim. The flag is documented in `--help` and
in `.agent/README.md`. Default behavior (no `--run`) is still
auto-increment.

**Soft-cap overrun.** Script is 162 lines total (~125 lines of code,
~37 lines of module docstring + inline comments + blanks). This is
slightly over the "~150 lines" soft cap in the TASK stop conditions.
Justified by the `--run` addition; flagging explicitly per policy.

Also added a "Helper scripts" section to `.agent/README.md` with usage
examples and a note about the auto-increment vs `--run` distinction.

## Constraints checked

- [x] `src/**` — untouched (verified `git diff --stat main..HEAD -- src/` is empty)
- [x] `.github/workflows/**` — untouched
- [x] `src/lib/prompts.ts` — untouched
- [x] `src/data/web_bundle.json` — untouched
- [x] `package.json` — untouched (no new deps, no new npm scripts)
- [x] `package-lock.json` — untouched
- [x] `.env*` — untouched
- [x] Pipeline repo (`/Users/bohaoli/Desktop/tuto/tuto_ai_career_radar/`) — not accessed
- [x] No classifier / extractor / prompt files touched (either repo)
- [x] No model selection edits
- [x] No deployment config (`vercel.json`, `.vercel/`) touched
- [x] Standard library only — imports are `argparse`, `datetime`, `pathlib`, `re`, `sys` (verified by grep on the script)
- [x] No external command invocation — no `subprocess` import, no `os.system`, no `os.popen`, no HTTP libraries
- [x] No GitHub Actions, no daemon, no watcher, no autonomous loop
- [x] Script does not auto-commit anything

## Red-zone check

- Red-zone files modified this run: `none`
- Approval reference for any red-zone modification: N/A

## Validation results

```
$ git status   (before any edits, on branch agent/2026-06-27_run_02)
clean

=== T1 · --help (must show --run) ===
usage: new_task.py [-h] [--date DATE] [--title TITLE]
                   [--risk {green,yellow,red}] [--run NN]
...
Local-only. Never invokes git, npm, vercel, or any external command.
PASS — --run NN flag visible, "Local-only" footer present.

=== T2 · create run_01 with --date 2099-01-01 --title --risk yellow ===
→ printed: /Users/bohaoli/Desktop/ai-career-radar-web/.agent/tasks/2099-01-01_run_01_TASK.md
→ file written 3,184 bytes, metadata block correctly substituted
PASS

=== T3 · metadata verification (head -14) ===
- **task_id**: `2099-01-01_run_01`     ← substituted
- **date**: `2099-01-01`                ← substituted
- **run_number**: `01` (zero-padded ...)← substituted
- **title**: Smoke test task           ← substituted
- **repo**: ... (unchanged template default)
# TASK · Smoke test task               ← title substituted in H1 too
PASS

=== T4 · auto-increment: bare rerun → run_02 ===
→ printed: /Users/bohaoli/Desktop/ai-career-radar-web/.agent/tasks/2099-01-01_run_02_TASK.md
PASS — confirms auto-increment behavior

=== T5 · --run 1 collision → REFUSE + exit 2 ===
→ stderr: error: refuse to overwrite existing /Users/bohaoli/Desktop/ai-career-radar-web/.agent/tasks/2099-01-01_run_01_TASK.md
→ exit code: 2
PASS — defensive overwrite guard reachable via --run

=== T6 · invalid date format ===
→ stderr: error: --date must be YYYY-MM-DD, got '2099-13-99'
→ exit code: 2
PASS

=== T7 · --run out of range ===
→ stderr: error: --run must be 1..99, got 999
→ exit code: 2
PASS

=== T8 · cleanup ===
$ rm -f .agent/tasks/2099-01-01_run_01_TASK.md .agent/tasks/2099-01-01_run_02_TASK.md
$ ls .agent/tasks/ | grep '2099'
(empty)
PASS — no smoke artifacts left in repo

$ git status   (after, on branch agent/2026-06-27_run_02)
clean

$ git diff --stat main..HEAD
 .agent/README.md                          |  41 +++++
 .agent/scripts/new_task.py                | 162 +++++++++++
 .agent/tasks/2026-06-27_run_02_TASK.md    | 287 +++++ (from TASK commit)
 3 files changed, 490 insertions(+)
```

## Build result

`not-run` — no app code changed, so `npm run build` was not required by
the TASK. Skipped for speed. Script is pure Python; no JS/TS compilation
relevant.

## Tests result

`pass` — 7/7 smoke tests pass (see Validation results above). No formal
unit-test framework was added; the smoke tests covered:
- T1 `--help`
- T2 create with all flags
- T3 metadata substitution correctness
- T4 auto-increment on rerun
- T5 `--run` collision refuse + exit 2
- T6 invalid `--date` rejection
- T7 `--run` out-of-range rejection
- T8 cleanup leaves no artifacts

## Screenshots

`n/a` — pure protocol-tooling work, nothing rendered visually.

## Risks

- **Script size 162 lines vs ~150 cap.** Flagged per TASK §"Stop
  conditions". 12 lines over, traceable to the `--run` flag addition.
  Severity: **low**. Trimming the docstring would close the gap, but
  the docstring is the README for someone reading the script directly.
- **`--run` flag wasn't in the original TASK outline.** Added during
  execution because the "refuse to overwrite" acceptance criterion was
  otherwise unfalsifiable. Severity: **low**. Documented in the script
  module docstring, in `.agent/README.md`, and in `--help`. If you'd
  rather drop it, the script reverts to 150 lines and the
  refuse-overwrite check becomes a defensive-only guard not reachable
  through the CLI.
- **`int` cast on `--run` accepts negative numbers before the range
  check.** A user passing `--run -5` would hit "must be 1..99, got -5"
  rather than an argparse-level type error. Severity: **trivial** —
  current message is clear; not worth a fix.

## Follow-up recommendations

- Optional `--print-path-only` mode that suppresses everything except
  the absolute file path on stdout (currently the only stdout line IS
  the path, so this is moot — flagging in case future additions print
  extra info).
- Optional `--open` flag that opens the generated file in `$EDITOR`.
  Would require shelling out to the editor binary; explicitly outside
  AgentOps-1b's "no subprocess" constraint. Belongs in a follow-up if
  ever wanted.
- Consider a parallel `new_run_report.py` and `new_decision.py` if the
  same friction shows up for those template types. Same shape as this
  script; ~80 lines each.

## Ready for review

`yes`

## Requires human decision

`no`

> Yellow task; no red-zone file touched; no app code changed; smoke
> tests all green. Two open items for the DECISION reviewer to consider:
> (1) whether the `--run` flag deviation from the original outline is
> acceptable, and (2) whether the 12-line cap overrun is acceptable
> given the justification.
