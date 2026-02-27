from __future__ import annotations

from typing import Dict, List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from db.models import RoleEnum, User, UserConversionPermission


ALLOWED_ACTIONS: Dict[str, str] = {
    "pdf_to_docs": "PDF to Word",
    "pdf_to_excel": "PDF to Excel",
    "docx_to_pdf": "DOCX to PDF",
    "excel_to_pdf": "Excel to PDF",
    "image_to_pdf": "Image to PDF",
    "pdf_page_remove": "Remove Pages from PDF",
}


class ConversionNotPermittedError(Exception):
    def __init__(self, action: str) -> None:
        self.action = action


def list_allowed_actions() -> List[Dict[str, str]]:
    return [{"action": action, "label": label} for action, label in ALLOWED_ACTIONS.items()]


def validate_action(action: str) -> None:
    if action not in ALLOWED_ACTIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid action")


def ensure_permission(db: Session, user: User, action: str) -> None:
    if user.role == RoleEnum.super_user:
        return

    if user.role == RoleEnum.demo_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo user is read-only")

    permission = (
        db.query(UserConversionPermission)
        .filter(
            UserConversionPermission.user_id == user.id,
            UserConversionPermission.action == action,
        )
        .first()
    )

    if not permission or not permission.is_allowed:
        raise ConversionNotPermittedError(action)
