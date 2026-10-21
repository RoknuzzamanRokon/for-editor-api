"""
Compress PDF Service for shrinking file size by recompressing content streams
and downsampling oversized embedded images.

Two ways to use it:
- no target: the "recommended" pass — recompress streams and downsample only
  images larger than MAX_IMAGE_DIMENSION.
- a target size: try progressively stronger image settings (TARGET_LEVELS)
  and keep the gentlest one whose output fits. Text and vector graphics are
  never rasterized, so a PDF that is mostly text may not reach a small target;
  the smallest version found is returned in that case.
"""
import os
from pathlib import Path
from typing import Optional, Tuple

import pymupdf
from pypdf import PdfReader, PdfWriter

MAX_IMAGE_DIMENSION = 1600
JPEG_QUALITY = 60

# Allowed range for a target size, in KB. The top matches the 50 MB upload limit.
MIN_TARGET_KB = 10
MAX_TARGET_KB = 50 * 1024

# Image settings tried for a target size, gentlest first: (resolution in DPI to
# downsample images to, or None to keep their resolution; JPEG quality). The
# last level is the floor: below it scanned text stops being readable.
TARGET_LEVELS: Tuple[Tuple[Optional[int], int], ...] = (
    (None, 75),
    (150, 70),
    (120, 60),
    (96, 50),
    (72, 40),
    (60, 30),
    (50, 25),
)

# Images within this many DPI of a level's target are left alone: shrinking
# them that little saves almost nothing and costs a JPEG re-encode.
DPI_MARGIN = 10


def parse_target_kb(raw: Optional[str]) -> Tuple[Optional[int], Optional[str]]:
    """
    Read the optional target size form field.

    Returns:
        Tuple of (target in KB or None for no target, error_message).
    """
    if raw is None or not raw.strip():
        return None, None
    try:
        target_kb = int(raw.strip())
    except ValueError:
        return None, "Target size must be a whole number of KB"
    if not MIN_TARGET_KB <= target_kb <= MAX_TARGET_KB:
        return None, f"Target size must be between {MIN_TARGET_KB} KB and {MAX_TARGET_KB // 1024} MB"
    return target_kb, None


def _rewrite(source: bytes, level: Optional[Tuple[Optional[int], int]]) -> bytes:
    """
    Re-save a PDF with unused objects dropped and streams recompressed and,
    when a level is given, its images re-encoded at that level's settings.
    """
    doc = pymupdf.open(stream=source, filetype="pdf")
    try:
        if level is not None:
            dpi, quality = level
            doc.rewrite_images(
                dpi_threshold=dpi + DPI_MARGIN if dpi else None,
                dpi_target=dpi or 0,
                quality=quality,
                # Black-and-white scans are already tiny, and downsampling
                # them ruins their legibility.
                bitonal=False,
            )
        # PDF_ENCRYPT_KEEP: a PDF with an owner password keeps its restrictions.
        return doc.tobytes(garbage=4, deflate=True, use_objstms=1, encryption=pymupdf.PDF_ENCRYPT_KEEP)
    finally:
        doc.close()


class CompressPDFService:
    """Service for reducing PDF file size"""

    def compress_pdf(
        self, pdf_path: str, output_path: str, target_bytes: Optional[int] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Recompress content streams and downsample large embedded images, or,
        with target_bytes, shrink images until the PDF fits in that many bytes.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        if target_bytes is not None:
            return self._compress_to_target(pdf_path, output_path, target_bytes)

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

    def _compress_to_target(
        self, pdf_path: str, output_path: str, target_bytes: int
    ) -> Tuple[bool, Optional[str]]:
        """
        Write the gentlest version of the PDF that fits in target_bytes, or the
        smallest version found if none fits.
        """
        try:
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            if os.path.getsize(pdf_path) == 0:
                return False, "PDF file is empty"

            with open(pdf_path, "rb") as f:
                original = f.read()

            with pymupdf.open(stream=original, filetype="pdf") as doc:
                if doc.needs_pass:
                    return False, "This PDF is password protected. Unlock it first, then compress it."
                if doc.page_count == 0:
                    return False, "PDF has no pages"

            # Lossless first: if that already fits, the images stay untouched.
            best = min(original, _rewrite(original, None), key=len)

            if len(best) > target_bytes:
                # Output shrinks as the levels get stronger, so binary-search
                # for the gentlest level that fits instead of trying them all.
                smallest = best
                fitting: Optional[bytes] = None
                low, high = 0, len(TARGET_LEVELS) - 1
                while low <= high:
                    middle = (low + high) // 2
                    data = _rewrite(original, TARGET_LEVELS[middle])
                    if len(data) < len(smallest):
                        smallest = data
                    if len(data) <= target_bytes:
                        fitting = data
                        high = middle - 1
                    else:
                        low = middle + 1
                best = fitting if fitting is not None else smallest

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(best)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate compressed PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error while compressing PDF: {str(e)}"
