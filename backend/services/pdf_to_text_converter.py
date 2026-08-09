"""
PDF to Text Converter Service for extracting plain text from a PDF
"""
import os
from pathlib import Path
from typing import Optional, Tuple

import pdfplumber


class PDFToTextConverterService:
    """Service for extracting text content from a PDF"""

    def convert_pdf_to_text(self, pdf_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Extract text from every page of a PDF into a single .txt file.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            if os.path.getsize(pdf_path) == 0:
                return False, "PDF file is empty"

            text_parts = []
            with pdfplumber.open(pdf_path) as pdf:
                if len(pdf.pages) == 0:
                    return False, "PDF has no pages"
                for page in pdf.pages:
                    text_parts.append(page.extract_text() or "")

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with open(output_path, "w", encoding="utf-8") as f:
                f.write("\n\n".join(text_parts))

            if not os.path.exists(output_path):
                return False, "Failed to generate text output"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during text extraction: {str(e)}"
