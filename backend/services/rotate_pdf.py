"""
Rotate PDF Service for rotating every page of a PDF by a fixed angle
"""
import os
from pathlib import Path
from typing import Optional, Tuple

from pypdf import PdfReader, PdfWriter


class RotatePDFService:
    """Service for rotating all pages of a PDF"""

    def rotate_pdf(self, pdf_path: str, output_path: str, angle: int = 90) -> Tuple[bool, Optional[str]]:
        """
        Rotate every page of a PDF clockwise by the given angle.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            if os.path.getsize(pdf_path) == 0:
                return False, "PDF file is empty"

            if angle % 90 != 0:
                return False, "Rotation angle must be a multiple of 90 degrees"

            reader = PdfReader(pdf_path)
            if len(reader.pages) == 0:
                return False, "PDF has no pages"

            writer = PdfWriter()
            for page in reader.pages:
                page.rotate(angle)
                writer.add_page(page)

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with open(output_path, "wb") as f:
                writer.write(f)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate rotated PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during rotation: {str(e)}"
