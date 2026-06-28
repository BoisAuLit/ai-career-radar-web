"""Shared helpers for AgentOps new_*.py scripts.

Single underscore prefix → internal module, not invoked as a CLI itself.
Standard library only. No side effects on import.
"""
import datetime
import re
import sys

TASK_ID_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})_run_(\d{2})$")


def resolve_task_id(args) -> tuple[str, str, int] | None:
    """Resolve (task_id, date_str, run_number) from argparse args.

    Accepts either `--task-id YYYY-MM-DD_run_NN` or the pair
    `--date YYYY-MM-DD --run NN` (mutually exclusive). Returns None on
    validation error after printing a message to stderr; the caller is
    expected to translate None → exit 2.
    """
    if args.task_id:
        if args.date is not None or args.run is not None:
            print("error: --task-id is mutually exclusive with --date/--run", file=sys.stderr)
            return None
        m = TASK_ID_RE.match(args.task_id)
        if not m:
            print(f"error: --task-id must match YYYY-MM-DD_run_NN, got {args.task_id!r}", file=sys.stderr)
            return None
        date_str, run_str = m.group(1), m.group(2)
        try:
            datetime.date.fromisoformat(date_str)
        except ValueError:
            print(f"error: invalid date in --task-id: {date_str!r}", file=sys.stderr)
            return None
        return args.task_id, date_str, int(run_str)
    if args.date is None or args.run is None:
        print("error: provide --task-id, or both --date and --run", file=sys.stderr)
        return None
    try:
        datetime.date.fromisoformat(args.date)
    except ValueError:
        print(f"error: --date must be YYYY-MM-DD, got {args.date!r}", file=sys.stderr)
        return None
    if not 1 <= args.run <= 99:
        print(f"error: --run must be 1..99, got {args.run}", file=sys.stderr)
        return None
    return f"{args.date}_run_{args.run:02d}", args.date, args.run
