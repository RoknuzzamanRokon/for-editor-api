"""
PDF Organize Service for reordering and/or dropping pages of a PDF
"""
import os
from pathlib import Path
from typing import List, Optional, Tuple

from pypdf import PdfReader, PdfWriter


class PDFOrganizeService:
    """Service for rebuilding a PDF in a caller-supplied page order"""

    def reorganize_pages(
        self, pdf_path: str, output_path: str, page_order: List[int]
    ) -> Tuple[bool, Optional[str]]:
        """
        Rebuild a PDF using only the given 1-indexed pages, in the given order.
        Omitting a page number deletes it; repeating pages is allowed.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            if os.path.getsize(pdf_path) == 0:
                return False, "PDF file is empty"
            if not page_order:
                return False, "No pages selected"

            reader = PdfReader(pdf_path)
            total_pages = len(reader.pages)
            if total_pages == 0:
                return False, "PDF has no pages"

            for page_number in page_order:
                if page_number < 1 or page_number > total_pages:
                    return False, f"Page {page_number} is out of range (PDF has {total_pages} pages)"

            writer = PdfWriter()
            for page_number in page_order:
                writer.add_page(reader.pages[page_number - 1])

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with open(output_path, "wb") as f:
                writer.write(f)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate reorganized PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error while reorganizing PDF: {str(e)}"
