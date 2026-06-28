#!/usr/bin/env python3
"""Generate the next .agent/tasks/YYYY-MM-DD_run_XX_TASK.md from the template.

Local-only, standard-library-only, no side effects beyond writing one file.

Usage:
    python .agent/scripts/new_task.py
    python .agent/scripts/new_task.py --date 2026-06-27
    python .agent/scripts/new_task.py --date 2026-06-27 \
        --title "P1.8 report shell cleanup" --risk yellow
    python .agent/scripts/new_task.py --date 2026-06-27 --run 5

By default the run number auto-increments to the next free slot for the
given date. Pass --run NN to pick a specific slot — the script then
refuses if that slot is already taken (non-zero exit, no clobber).

The script never invokes git, npm, vercel, gh, Claude, OpenAI, or any
external process. It does not commit. It refuses to overwrite an existing
TASK file. It prints the created file path on stdout (one line) on success.
"""
import argparse
import datetime
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]   # .agent/scripts/ → repo root
TEMPLATE_PATH = REPO_ROOT / ".agent" / "templates" / "task_template.md"
TASKS_DIR = REPO_ROOT / ".agent" / "tasks"

# Filename like 2026-06-27_run_01_TASK.md
FILENAME_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})_run_(\d{2})_TASK\.md$")


def next_run_number(date_str: str) -> int:
    """Return the next zero-padded run index for the given date.

    Scans .agent/tasks/ for files matching YYYY-MM-DD_run_NN_TASK.md and
    returns max(NN) + 1, or 1 if none exist for that date.
    """
    existing: list[int] = []
    if TASKS_DIR.is_dir():
        for p in TASKS_DIR.iterdir():
            m = FILENAME_RE.match(p.name)
            if m and m.group(1) == date_str:
                existing.append(int(m.group(2)))
    return (max(existing) + 1) if existing else 1


def render(
    template_text: str,
    *,
    task_id: str,
    date: str,
    run_number: int,
    title: str | None,
    risk: str | None,
) -> str:
    """Substitute the metadata block (and optional title + risk) in the template.

    Leaves all other `<placeholder>` fields untouched so the human still has
    to fill them in.
    """
    out = template_text
    out = re.sub(
        r"- \*\*task_id\*\*: `[^`]+`",
        f"- **task_id**: `{task_id}`",
        out,
        count=1,
    )
    out = re.sub(
        r"- \*\*date\*\*: `[^`]+`",
        f"- **date**: `{date}`",
        out,
        count=1,
    )
    out = re.sub(
        r"- \*\*run_number\*\*: `[^`]+`(?: \(zero-padded sequence within the day\))?",
        f"- **run_number**: `{run_number:02d}` (zero-padded sequence within the day)",
        out,
        count=1,
    )
    if title:
        out = re.sub(r"# TASK · <one-line title>", f"# TASK · {title}", out, count=1)
        out = re.sub(
            r"- \*\*title\*\*: <short human-readable title>",
            f"- **title**: {title}",
            out,
            count=1,
        )
    if risk:
        out = re.sub(
            r"`green` \| `yellow` \| `red`",
            f"`{risk}`",
            out,
            count=1,
        )
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Scaffold the next AgentOps TASK file from the template.",
        epilog="Local-only. Never invokes git, npm, vercel, or any external command.",
    )
    parser.add_argument("--date", help="YYYY-MM-DD (default: today, local)")
    parser.add_argument("--title", help="Optional short task title to seed the file")
    parser.add_argument(
        "--risk",
        choices=("green", "yellow", "red"),
        help="Optional risk level to seed the Risk level field",
    )
    parser.add_argument(
        "--run",
        type=int,
        metavar="NN",
        help="Override the auto-computed run number (1-99). Refuses if that slot is taken.",
    )
    args = parser.parse_args(argv)

    date_str = args.date or datetime.date.today().strftime("%Y-%m-%d")
    try:
        datetime.date.fromisoformat(date_str)
    except ValueError:
        print(f"error: --date must be YYYY-MM-DD, got {date_str!r}", file=sys.stderr)
        return 2

    if not TEMPLATE_PATH.is_file():
        print(f"error: template not found at {TEMPLATE_PATH}", file=sys.stderr)
        return 2

    if args.run is not None:
        if not 1 <= args.run <= 99:
            print(f"error: --run must be 1..99, got {args.run}", file=sys.stderr)
            return 2
        n = args.run
    else:
        n = next_run_number(date_str)
    task_id = f"{date_str}_run_{n:02d}"
    target = TASKS_DIR / f"{task_id}_TASK.md"
    if target.exists():
        print(f"error: refuse to overwrite existing {target}", file=sys.stderr)
        return 2

    template_text = TEMPLATE_PATH.read_text(encoding="utf-8")
    rendered = render(
        template_text,
        task_id=task_id,
        date=date_str,
        run_number=n,
        title=args.title,
        risk=args.risk,
    )

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(rendered, encoding="utf-8")
    print(target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
