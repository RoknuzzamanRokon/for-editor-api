"""
Compress PDF Service for shrinking file size by recompressing content streams
and downsampling oversized embedded images
"""
import os
from pathlib import Path
from typing import Optional, Tuple

from pypdf import PdfReader, PdfWriter

MAX_IMAGE_DIMENSION = 1600
JPEG_QUALITY = 60


class CompressPDFService:
    """Service for reducing PDF file size"""

    def compress_pdf(self, pdf_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Recompress content streams and downsample large embedded images.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            if os.path.getsize(pdf_path) == 0:
                return False, "PDF file is empty"

            reader = PdfReader(pdf_path)
            if len(reader.pages) == 0:
                return False, "PDF has no pages"

            writer = PdfWriter()
            writer.append(reader)

            for page in writer.pages:
                try:
                    page.compress_content_streams()
                except Exception:
                    pass

                try:
                    for image in page.images:
                        pil_image = image.image
                        if pil_image is None or max(pil_image.size) <= MAX_IMAGE_DIMENSION:
                            # Only touch genuinely oversized images: downsampling is a
                            # guaranteed win, but re-encoding an already-small or
                            # efficiently-encoded image (e.g. flat color, indexed) can
                            # make it *larger* than the original embed.
                            continue
                        ratio = MAX_IMAGE_DIMENSION / max(pil_image.size)
                        new_size = (
                            max(1, int(pil_image.size[0] * ratio)),
                            max(1, int(pil_image.size[1] * ratio)),
                        )
                        pil_image = pil_image.resize(new_size)
                        image.replace(pil_image, quality=JPEG_QUALITY)
                except Exception:
                    pass

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with open(output_path, "wb") as f:
                writer.write(f)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate compressed PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error while compressing PDF: {str(e)}"
