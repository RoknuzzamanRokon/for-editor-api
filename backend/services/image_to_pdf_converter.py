"""
Image to PDF Converter Service for converting image files to PDF files
"""
import os
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image


class ImageToPDFConverterService:
    """Service for converting images to PDF format"""

    def convert_image_to_pdf(self, image_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Convert image file to PDF.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(image_path):
                return False, f"Image file not found: {image_path}"

            if not os.path.isfile(image_path):
                return False, f"Path is not a file: {image_path}"

            if os.path.getsize(image_path) == 0:
                return False, "Image file is empty"

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with Image.open(image_path) as img:
                # PDF requires RGB or grayscale-like modes; flatten transparency to white.
                if img.mode in ("RGBA", "LA", "P"):
                    rgba = img.convert("RGBA")
                    background = Image.new("RGB", rgba.size, (255, 255, 255))
                    background.paste(rgba, mask=rgba.split()[-1])
                    rgb_image = background
                else:
                    rgb_image = img.convert("RGB")

                rgb_image.save(output_path, "PDF", resolution=100.0)

            if not os.path.exists(output_path):
                return False, "Failed to generate PDF output"

            if os.path.getsize(output_path) == 0:
                return False, "Generated PDF is empty"

            return True, None

        except PermissionError as e:
            return False, f"Permission denied: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error during conversion: {str(e)}"
