"""
PDF to HTML Converter Service
"""
import os
from pathlib import Path
from typing import Optional, Tuple

import pymupdf

PAGE_WRAPPER = '<section class="pdf-page" data-page="{page_number}">{page_html}</section>'

DOCUMENT_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>
  body {{ margin: 0; background: #e5e5e5; font-family: sans-serif; }}
  .pdf-page {{ background: #fff; margin: 24px auto; box-shadow: 0 1px 4px rgba(0,0,0,0.2); position: relative; }}
</style>
</head>
<body>
{pages}
</body>
</html>
"""


class PDFToHTMLConverterService:
    """Service for converting a PDF into a single self-contained HTML file.

    Each page is rendered via PyMuPDF's built-in HTML export, which preserves
    text position and embeds images as base64 data URIs — this reproduces
    layout closely but is not a semantic re-authoring of the document.
    """

    def convert_pdf_to_html(self, pdf_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Convert a PDF file to a single HTML document, one section per page.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(pdf_path):
                return False, "PDF file not found"

            doc = pymupdf.open(pdf_path)
            try:
                if doc.page_count == 0:
                    return False, "PDF has no pages"

                pages_html = []
                for page_number in range(doc.page_count):
                    page = doc.load_page(page_number)
                    page_html = page.get_text("html")
                    pages_html.append(
                        PAGE_WRAPPER.format(page_number=page_number + 1, page_html=page_html)
                    )
            finally:
                doc.close()

            document_html = DOCUMENT_TEMPLATE.format(
                title=Path(pdf_path).stem,
                pages="\n".join(pages_html),
            )

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with open(output_path, "w", encoding="utf-8") as f:
                f.write(document_html)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate HTML file"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during PDF to HTML conversion: {str(e)}"
