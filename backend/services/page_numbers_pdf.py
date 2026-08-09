"""
Page Numbers Service for stamping page numbers onto every page of a PDF
"""
import io
import os
from pathlib import Path
from typing import Optional, Tuple

from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas


class PageNumbersPDFService:
    """Service for adding a bottom-center page number to every page of a PDF"""

    def add_page_numbers(self, pdf_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Stamp "page / total" at the bottom-center of every page.

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

            writer = PdfWriter()
            for index, page in enumerate(reader.pages, start=1):
                width = float(page.mediabox.width)
                height = float(page.mediabox.height)

                overlay_buffer = io.BytesIO()
                c = canvas.Canvas(overlay_buffer, pagesize=(width, height))
                c.setFont("Helvetica", 10)
                c.drawCentredString(width / 2, 24, f"{index} / {total_pages}")
                c.save()
                overlay_buffer.seek(0)

                overlay_page = PdfReader(overlay_buffer).pages[0]
                page.merge_page(overlay_page)
                writer.add_page(page)

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with open(output_path, "wb") as f:
                writer.write(f)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate numbered PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error while adding page numbers: {str(e)}"
