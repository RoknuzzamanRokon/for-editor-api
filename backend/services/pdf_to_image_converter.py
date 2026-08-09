"""
PDF to Image Converter Service for rendering every page of a PDF to a PNG,
packaged as a zip archive
"""
import os
import zipfile
from pathlib import Path
from typing import Optional, Tuple

import pymupdf


class PDFToImageConverterService:
    """Service for rendering PDF pages to PNG images"""

    def convert_pdf_to_images(
        self, pdf_path: str, output_zip_path: str, dpi: int = 150
    ) -> Tuple[bool, Optional[str]]:
        """
        Render every page of a PDF to a PNG image, bundled into a zip archive.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            if os.path.getsize(pdf_path) == 0:
                return False, "PDF file is empty"

            output_dir = Path(output_zip_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            base_name = Path(pdf_path).stem

            doc = pymupdf.open(pdf_path)
            try:
                if doc.page_count == 0:
                    return False, "PDF has no pages"

                digits = len(str(doc.page_count))
                with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                    for index in range(doc.page_count):
                        page = doc[index]
                        pix = page.get_pixmap(dpi=dpi)
                        page_filename = f"{base_name}_page_{str(index + 1).zfill(digits)}.png"
                        zf.writestr(page_filename, pix.tobytes("png"))
            finally:
                doc.close()

            if not os.path.exists(output_zip_path) or os.path.getsize(output_zip_path) == 0:
                return False, "Failed to generate image archive"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during PDF to image conversion: {str(e)}"
