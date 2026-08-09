"""
Merge PDF Service for combining multiple PDF files into one
"""
import os
from pathlib import Path
from typing import List, Optional, Tuple

from pypdf import PdfWriter


class MergePDFService:
    """Service for merging multiple PDF files into a single PDF"""

    def merge_pdfs(self, pdf_paths: List[str], output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Merge PDF files, in the given order, into one PDF.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not pdf_paths:
                return False, "No PDF files provided"

            for pdf_path in pdf_paths:
                if not os.path.exists(pdf_path):
                    return False, f"PDF file not found: {pdf_path}"
                if os.path.getsize(pdf_path) == 0:
                    return False, "PDF file is empty"

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            writer = PdfWriter()
            for pdf_path in pdf_paths:
                writer.append(pdf_path)

            with open(output_path, "wb") as f:
                writer.write(f)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate merged PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during merge: {str(e)}"
