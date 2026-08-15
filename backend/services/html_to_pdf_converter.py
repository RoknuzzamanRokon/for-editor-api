"""
HTML to PDF Converter Service
"""
import os
from pathlib import Path
from typing import Optional, Tuple

from xhtml2pdf import pisa


class HTMLToPDFConverterService:
    """Service for converting an HTML document into a PDF.

    Uses xhtml2pdf, a pure-Python renderer — it only supports a CSS subset
    (no flexbox/grid, limited positioning), so complex modern layouts may
    render simplified rather than pixel-perfect.
    """

    def convert_html_to_pdf(self, html_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Convert an HTML file to PDF.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(html_path):
                return False, "HTML file not found"

            with open(html_path, "r", encoding="utf-8") as f:
                html_content = f.read()

            if not html_content.strip():
                return False, "HTML file is empty"

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with open(output_path, "wb") as output_file:
                result = pisa.CreatePDF(src=html_content, dest=output_file)

            if result.err:
                return False, "Failed to render HTML to PDF"

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during HTML to PDF conversion: {str(e)}"
