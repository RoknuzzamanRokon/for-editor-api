"""
Protect PDF Service for adding a password to a PDF
"""
import os
from pathlib import Path
from typing import Optional, Tuple

from pypdf import PdfReader, PdfWriter


class ProtectPDFService:
    """Service for encrypting a PDF with a password"""

    def protect_pdf(self, pdf_path: str, output_path: str, password: str) -> Tuple[bool, Optional[str]]:
        """
        Add a password to a PDF so it can't be opened without it.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            if os.path.getsize(pdf_path) == 0:
                return False, "PDF file is empty"
            if not password:
                return False, "A password is required"

            reader = PdfReader(pdf_path)
            if reader.is_encrypted:
                return False, "PDF is already password protected"

            if len(reader.pages) == 0:
                return False, "PDF has no pages"

            writer = PdfWriter()
            for page in reader.pages:
                writer.add_page(page)
            writer.encrypt(password)

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with open(output_path, "wb") as f:
                writer.write(f)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate protected PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error while protecting PDF: {str(e)}"
