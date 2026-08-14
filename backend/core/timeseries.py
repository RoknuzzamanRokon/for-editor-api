"""Shared day-bucketing helpers for trend charts.

Charts need a dense series — one entry per calendar day, including days with no
rows — otherwise a gap in the data silently becomes a gap in the line. SQL
``GROUP BY date(...)`` only returns days that have rows, so every trend endpoint
pairs a grouped query with `build_recent_day_keys` + `zero_filled` to expand it
back to a full window.
"""

from datetime import datetime, timedelta
from typing import Any, Iterable, Mapping


def build_recent_day_keys(day_count: int = 30) -> list[str]:
    """The last `day_count` calendar days as ISO date strings, oldest first."""
    today = datetime.utcnow().date()
    return [
        (today - timedelta(days=offset)).isoformat()
        for offset in range(day_count - 1, -1, -1)
    ]


def earliest_day_bound(day_count: int = 30) -> datetime:
    """Midnight at the start of the window `build_recent_day_keys` describes.

    Use as the query's lower bound so the grouped rows and the day keys cover
    exactly the same span.
    """
    midnight = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return midnight - timedelta(days=day_count - 1)


def zero_filled(
    day_keys: Iterable[str],
    rows_by_day: Mapping[str, Mapping[str, Any]],
    fields: Iterable[str],
) -> list[dict[str, Any]]:
    """Expand a sparse {day: {field: value}} map into one dict per day key."""
    field_names = list(fields)
    return [
        {
            "date": day_key,
            **{name: rows_by_day.get(day_key, {}).get(name, 0) for name in field_names},
        }
        for day_key in day_keys
    ]
