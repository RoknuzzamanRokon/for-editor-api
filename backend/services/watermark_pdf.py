"""
Watermark PDF Service for stamping a diagonal text watermark on every page
"""
import io
import os
from pathlib import Path
from typing import Optional, Tuple

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import Color
from reportlab.pdfgen import canvas


class WatermarkPDFService:
    """Service for stamping a text watermark across every page of a PDF"""

    def watermark_pdf(self, pdf_path: str, output_path: str, watermark_text: str) -> Tuple[bool, Optional[str]]:
        """
        Overlay a diagonal, semi-transparent text watermark on every page.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            if os.path.getsize(pdf_path) == 0:
                return False, "PDF file is empty"

            cleaned_text = (watermark_text or "").strip()
            if not cleaned_text:
                return False, "Watermark text is required"

            reader = PdfReader(pdf_path)
            if len(reader.pages) == 0:
                return False, "PDF has no pages"

            writer = PdfWriter()
            overlay_cache = {}

            for page in reader.pages:
                width = float(page.mediabox.width)
                height = float(page.mediabox.height)
                key = (round(width, 1), round(height, 1))

                if key not in overlay_cache:
                    overlay_cache[key] = self._build_overlay(cleaned_text, width, height)

                page.merge_page(overlay_cache[key].pages[0])
                writer.add_page(page)

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with open(output_path, "wb") as f:
                writer.write(f)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate watermarked PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error while watermarking PDF: {str(e)}"

    @staticmethod
    def _build_overlay(text: str, width: float, height: float) -> PdfReader:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=(width, height))
        c.saveState()
        c.setFillColor(Color(0.55, 0.55, 0.55, alpha=0.35))
        c.setFont("Helvetica-Bold", max(24, int(min(width, height) / 8)))
        c.translate(width / 2, height / 2)
        c.rotate(45)
        c.drawCentredString(0, 0, text)
        c.restoreState()
        c.save()
        buffer.seek(0)
        return PdfReader(buffer)
