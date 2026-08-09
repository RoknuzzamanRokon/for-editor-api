"""
Unlock PDF Service for removing a password from a PDF
"""
import os
from pathlib import Path
from typing import Optional, Tuple

from pypdf import PdfReader, PdfWriter


class UnlockPDFService:
    """Service for removing password protection from a PDF"""

    def unlock_pdf(self, pdf_path: str, output_path: str, password: str) -> Tuple[bool, Optional[str]]:
        """
        Remove password protection from a PDF, given its current password.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            if os.path.getsize(pdf_path) == 0:
                return False, "PDF file is empty"

            reader = PdfReader(pdf_path)

            if reader.is_encrypted:
                if not password:
                    return False, "This PDF is password protected; provide its password"
                if reader.decrypt(password) == 0:
                    return False, "Incorrect password"

            if len(reader.pages) == 0:
                return False, "PDF has no pages"

            writer = PdfWriter()
            for page in reader.pages:
                writer.add_page(page)

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with open(output_path, "wb") as f:
                writer.write(f)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate unlocked PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error while unlocking PDF: {str(e)}"
