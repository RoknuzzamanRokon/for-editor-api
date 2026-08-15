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
    "remove_background": "Remove Background",
    "pdf_page_remove": "Remove Pages from PDF",
    "merge_pdf": "Merge PDF",
    "split_pdf": "Split PDF",
    "rotate_pdf": "Rotate PDF",
    "protect_pdf": "Protect PDF",
    "unlock_pdf": "Unlock PDF",
    "watermark_pdf": "Watermark PDF",
    "pdf_page_numbers": "Add Page Numbers",
    "pdf_to_text": "PDF to Text",
    "text_to_pdf": "Text to PDF",
    "pptx_to_pdf": "PowerPoint to PDF",
    "pdf_to_image": "PDF to Image",
    "image_format_convert": "Image Format Converter",
    "compress_pdf": "Compress PDF",
    "pdf_organize": "Reorganize PDF Pages",
    "pdf_to_pptx": "PDF to PowerPoint",
    "zip_files": "Zip Files",
    "unzip_file": "Unzip Archive",
    "csv_to_excel": "CSV to Excel",
    "excel_to_csv": "Excel to CSV",
    "html_to_pdf": "HTML to PDF",
    "pdf_to_html": "PDF to HTML",
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
