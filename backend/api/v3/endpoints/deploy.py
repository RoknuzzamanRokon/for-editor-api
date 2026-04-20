from __future__ import annotations

import os
import shlex
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status

from core.deps import get_current_user
from db.models import RoleEnum, User

router = APIRouter(tags=["deploy"])

PROJECT_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_BACKEND_DEPLOY_SCRIPT_PATH = PROJECT_ROOT / "deploy_backend.sh"
DEFAULT_FRONTEND_DEPLOY_SCRIPT_PATH = PROJECT_ROOT / "deploy_frontend.sh"
DEFAULT_BACKEND_DEPLOY_LOG_PATH = PROJECT_ROOT / "deploy_backend.log"
DEFAULT_FRONTEND_DEPLOY_LOG_PATH = PROJECT_ROOT / "deploy_frontend.log"
DEFAULT_BACKEND_DEPLOY_PID_PATH = PROJECT_ROOT / "deploy_backend.pid"
DEFAULT_FRONTEND_DEPLOY_PID_PATH = PROJECT_ROOT / "deploy_frontend.pid"


def _get_backend_script_path() -> Path:
    return Path(os.getenv("DEPLOY_BACKEND_SCRIPT_PATH", DEFAULT_BACKEND_DEPLOY_SCRIPT_PATH))


def _get_frontend_script_path() -> Path:
    return Path(os.getenv("DEPLOY_FRONTEND_SCRIPT_PATH", DEFAULT_FRONTEND_DEPLOY_SCRIPT_PATH))


def _get_backend_log_path() -> Path:
    return Path(os.getenv("DEPLOY_BACKEND_LOG_PATH", DEFAULT_BACKEND_DEPLOY_LOG_PATH))


def _get_frontend_log_path() -> Path:
    return Path(os.getenv("DEPLOY_FRONTEND_LOG_PATH", DEFAULT_FRONTEND_DEPLOY_LOG_PATH))


def _get_backend_pid_path() -> Path:
    return Path(os.getenv("DEPLOY_BACKEND_PID_PATH", DEFAULT_BACKEND_DEPLOY_PID_PATH))


def _get_frontend_pid_path() -> Path:
    return Path(os.getenv("DEPLOY_FRONTEND_PID_PATH", DEFAULT_FRONTEND_DEPLOY_PID_PATH))


def _require_super_user_for_deploy(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != RoleEnum.super_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super_user can access this deploy API.",
        )
    return current_user


def _isoformat_from_timestamp(timestamp: float | None) -> str | None:
    if timestamp is None:
        return None
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()


def _safe_mtime(path: Path) -> float | None:
    if not path.exists():
        return None
    try:
        return path.stat().st_mtime
    except OSError:
        return None


def _read_pid(pid_path: Path) -> int | None:
    if not pid_path.exists() or pid_path.is_dir():
        return None

    try:
        pid_text = pid_path.read_text(encoding="utf-8", errors="replace").strip()
    except OSError:
        return None

    if not pid_text.isdigit():
        return None
    return int(pid_text)


def _is_pid_running(pid: int | None) -> bool:
    if pid is None:
        return False

    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True


def _read_log_tail(log_path: Path) -> str:
    if not log_path.exists():
        return ""
    if log_path.is_dir():
        return f"Configured log path is a directory: {log_path}\n"

    try:
        log_text = log_path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        return f"Unable to read deploy log file: {exc}\n"

    return log_text[-4000:]


def _start_deploy(script_path: Path, log_path: Path, pid_path: Path) -> dict:
    if not script_path.exists():
        raise HTTPException(status_code=404, detail=f"Deploy script not found: {script_path}")

    log_path.parent.mkdir(parents=True, exist_ok=True)
    pid_path.parent.mkdir(parents=True, exist_ok=True)

    if log_path.is_dir():
        raise HTTPException(status_code=500, detail=f"Deploy log path is a directory: {log_path}")
    if pid_path.is_dir():
        raise HTTPException(status_code=500, detail=f"Deploy pid path is a directory: {pid_path}")

    quoted_script = shlex.quote(str(script_path))
    quoted_log = shlex.quote(str(log_path))
    quoted_pid = shlex.quote(str(pid_path))
    command = (
        f"nohup /bin/bash {quoted_script} > {quoted_log} 2>&1 & "
        f"pid=$!; echo \"$pid\" > {quoted_pid}; echo \"$pid\""
    )

    try:
        completed = subprocess.run(  # noqa: S603
            ["/bin/bash", "-lc", command],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to start deploy script: {exc}") from exc

    if completed.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "failed_to_start",
                "exit_code": completed.returncode,
                "stdout": completed.stdout[-4000:],
                "stderr": completed.stderr[-4000:],
            },
        )

    pid_text = completed.stdout.strip().splitlines()[-1] if completed.stdout.strip() else ""
    pid = int(pid_text) if pid_text.isdigit() else None

    return {
        "status": "started",
        "log_file": str(log_path),
        "pid_file": str(pid_path),
        "pid": pid,
        "last_push_time": _isoformat_from_timestamp(_safe_mtime(pid_path) or _safe_mtime(log_path)),
        "stdout": completed.stdout[-4000:],
        "stderr": completed.stderr[-4000:],
    }


def _read_status(log_path: Path, pid_path: Path) -> dict:
    pid = _read_pid(pid_path)
    is_running = _is_pid_running(pid)
    tail = _read_log_tail(log_path)
    normalized_tail = tail.lower()
    last_push_timestamp = _safe_mtime(pid_path) or _safe_mtime(log_path)
    last_log_update_timestamp = _safe_mtime(log_path)

    if is_running:
        status_value = "running"
    elif "deployment completed successfully" in normalized_tail or "deploy_success" in normalized_tail:
        status_value = "success"
    elif "configured log path is a directory" in normalized_tail or "unable to read deploy log file" in normalized_tail:
        status_value = "failed"
    elif not log_path.exists() and not pid_path.exists():
        status_value = "not_started"
    elif any(marker in normalized_tail for marker in ["error", "failed", "traceback"]):
        status_value = "failed"
    elif tail.strip():
        status_value = "stopped"
    else:
        status_value = "started"

    return {
        "status": status_value,
        "log_file": str(log_path),
        "pid_file": str(pid_path),
        "pid": pid,
        "is_running": is_running,
        "last_push_time": _isoformat_from_timestamp(last_push_timestamp),
        "last_log_update_time": _isoformat_from_timestamp(last_log_update_timestamp),
        "last_output": tail,
        "live_output": tail,
    }


def _read_backend_status() -> dict:
    return _read_status(_get_backend_log_path(), _get_backend_pid_path())


def _read_frontend_status() -> dict:
    return _read_status(_get_frontend_log_path(), _get_frontend_pid_path())


@router.post("/live-project-push/backend")
def live_project_push_backend(
    current_user: User = Depends(_require_super_user_for_deploy),
) -> dict:
    _ = current_user
    return _start_deploy(_get_backend_script_path(), _get_backend_log_path(), _get_backend_pid_path())


@router.post("/live-project-push/frontend")
def live_project_push_frontend(
    current_user: User = Depends(_require_super_user_for_deploy),
) -> dict:
    _ = current_user
    return _start_deploy(_get_frontend_script_path(), _get_frontend_log_path(), _get_frontend_pid_path())


@router.get("/live-project-push/status")
def live_project_push_status(
    current_user: User = Depends(_require_super_user_for_deploy),
) -> dict:
    _ = current_user
    return {
        "backend": _read_backend_status(),
        "frontend": _read_frontend_status(),
    }
