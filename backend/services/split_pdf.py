"""
Split PDF Service for splitting a PDF into one file per page, packaged as a zip
"""
import io
import os
import zipfile
from pathlib import Path
from typing import Optional, Tuple

from pypdf import PdfReader, PdfWriter


class SplitPDFService:
    """Service for splitting a PDF into individual per-page PDFs"""

    def split_to_zip(self, pdf_path: str, output_zip_path: str) -> Tuple[bool, Optional[str]]:
        """
        Split every page of a PDF into its own PDF file, bundled into a zip archive.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            if os.path.getsize(pdf_path) == 0:
                return False, "PDF file is empty"

            reader = PdfReader(pdf_path)
            total_pages = len(reader.pages)
            if total_pages == 0:
                return False, "PDF has no pages"
            if total_pages == 1:
                return False, "PDF only has one page; nothing to split"

            output_dir = Path(output_zip_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            base_name = Path(pdf_path).stem
            digits = len(str(total_pages))

            with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for index, page in enumerate(reader.pages, start=1):
                    writer = PdfWriter()
                    writer.add_page(page)
                    buffer = io.BytesIO()
                    writer.write(buffer)
                    page_filename = f"{base_name}_page_{str(index).zfill(digits)}.pdf"
                    zf.writestr(page_filename, buffer.getvalue())

            if not os.path.exists(output_zip_path) or os.path.getsize(output_zip_path) == 0:
                return False, "Failed to generate split PDF archive"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during split: {str(e)}"
