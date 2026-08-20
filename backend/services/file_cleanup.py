"""
Background sweep that deletes generated conversion output files once they've
been sitting around long enough, and marks the matching Conversion row (if
any) as expired so account history stops offering a dead download link.
"""
import asyncio
import logging
from datetime import datetime, timedelta
from pathlib import Path

from db.models import Conversion
from db.session import SessionLocal

logger = logging.getLogger(__name__)

STATIC_ROOT = Path("static")
MAX_FILE_AGE = timedelta(minutes=30)
SWEEP_INTERVAL_SECONDS = 5 * 60


def _delete_expired_files() -> None:
    if not STATIC_ROOT.exists():
        return

    cutoff = datetime.now() - MAX_FILE_AGE
    db = SessionLocal()
    try:
        for tool_dir in STATIC_ROOT.iterdir():
            if not tool_dir.is_dir():
                continue

            for file_path in tool_dir.iterdir():
                if not file_path.is_file():
                    continue

                try:
                    is_expired = datetime.fromtimestamp(file_path.stat().st_mtime) < cutoff
                except OSError:
                    continue
                if not is_expired:
                    continue

                resolved_path = str(file_path.resolve())
                try:
                    file_path.unlink()
                except OSError:
                    logger.warning("Could not delete expired file %s", file_path)
                    continue

                conversion = (
                    db.query(Conversion)
                    .filter(Conversion.output_filename == resolved_path, Conversion.status == "success")
                    .first()
                )
                if conversion:
                    conversion.status = "expired"

        db.commit()
    finally:
        db.close()


async def run_cleanup_loop() -> None:
    """Runs `_delete_expired_files` immediately, then every SWEEP_INTERVAL_SECONDS, forever."""
    while True:
        try:
            await asyncio.to_thread(_delete_expired_files)
        except Exception:
            logger.exception("File cleanup sweep failed")
        await asyncio.sleep(SWEEP_INTERVAL_SECONDS)
