from __future__ import annotations

import os
import subprocess
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


def _get_backend_script_path() -> Path:
    return Path(os.getenv("DEPLOY_BACKEND_SCRIPT_PATH", DEFAULT_BACKEND_DEPLOY_SCRIPT_PATH))


def _get_frontend_script_path() -> Path:
    return Path(os.getenv("DEPLOY_FRONTEND_SCRIPT_PATH", DEFAULT_FRONTEND_DEPLOY_SCRIPT_PATH))


def _get_backend_log_path() -> Path:
    return Path(os.getenv("DEPLOY_BACKEND_LOG_PATH", DEFAULT_BACKEND_DEPLOY_LOG_PATH))


def _get_frontend_log_path() -> Path:
    return Path(os.getenv("DEPLOY_FRONTEND_LOG_PATH", DEFAULT_FRONTEND_DEPLOY_LOG_PATH))


def _require_super_user_for_deploy(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != RoleEnum.super_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super_user can access this deploy API.",
        )
    return current_user


def _start_deploy(script_path: Path, log_path: Path) -> dict:
    if not script_path.exists():
        raise HTTPException(status_code=404, detail=f"Deploy script not found: {script_path}")

    command = f"nohup /bin/bash {script_path} > {log_path} 2>&1 &"

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

    return {
        "status": "started",
        "log_file": str(log_path),
        "stdout": completed.stdout[-4000:],
        "stderr": completed.stderr[-4000:],
    }


def _read_status(log_path: Path) -> dict:
    if not log_path.exists():
        return {
            "status": "not_started",
            "log_file": str(log_path),
            "last_output": "",
        }

    log_text = log_path.read_text(encoding="utf-8", errors="replace")
    tail = log_text[-4000:]
    normalized_tail = tail.lower()

    if "deployment completed successfully" in normalized_tail or "deploy_success" in normalized_tail:
        status = "success"
    elif any(marker in normalized_tail for marker in ["error", "failed", "traceback"]):
        status = "failed"
    elif tail.strip():
        status = "running"
    else:
        status = "started"

    return {
        "status": status,
        "log_file": str(log_path),
        "last_output": tail,
    }


@router.post("/live-project-push/backend")
def live_project_push_backend(
    current_user: User = Depends(_require_super_user_for_deploy),
) -> dict:
    _ = current_user
    return _start_deploy(_get_backend_script_path(), _get_backend_log_path())


@router.post("/live-project-push/frontend")
def live_project_push_frontend(
    current_user: User = Depends(_require_super_user_for_deploy),
) -> dict:
    _ = current_user
    return _start_deploy(_get_frontend_script_path(), _get_frontend_log_path())


@router.get("/live-project-push/status")
def live_project_push_status(
    current_user: User = Depends(_require_super_user_for_deploy),
) -> dict:
    _ = current_user
    return {
        "backend": _read_status(_get_backend_log_path()),
        "frontend": _read_status(_get_frontend_log_path()),
    }
