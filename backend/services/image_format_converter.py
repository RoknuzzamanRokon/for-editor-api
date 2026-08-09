"""
Image Format Converter Service for converting between PNG, JPG, and WEBP,
and downscaling oversized images
"""
import os
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image

SUPPORTED_FORMATS = {"png": "PNG", "jpg": "JPEG", "jpeg": "JPEG", "webp": "WEBP"}
MAX_DIMENSION = 4000


class ImageFormatConverterService:
    """Service for converting an image to a different format"""

    def convert_image_format(
        self, image_path: str, output_path: str, target_format: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Convert an image to the requested target format (png, jpg, or webp).

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(image_path):
                return False, f"Image file not found: {image_path}"
            if os.path.getsize(image_path) == 0:
                return False, "Image file is empty"

            normalized_format = (target_format or "").strip().lower()
            if normalized_format not in SUPPORTED_FORMATS:
                return False, "Unsupported target format. Choose PNG, JPG, or WEBP"

            pillow_format = SUPPORTED_FORMATS[normalized_format]

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with Image.open(image_path) as img:
                if max(img.size) > MAX_DIMENSION:
                    ratio = MAX_DIMENSION / max(img.size)
                    img = img.resize((int(img.size[0] * ratio), int(img.size[1] * ratio)))

                if pillow_format == "JPEG" and img.mode in ("RGBA", "LA", "P"):
                    rgba = img.convert("RGBA")
                    background = Image.new("RGB", rgba.size, (255, 255, 255))
                    background.paste(rgba, mask=rgba.split()[-1])
                    save_image = background
                elif pillow_format == "JPEG":
                    save_image = img.convert("RGB")
                else:
                    save_image = img

                save_image.save(output_path, pillow_format)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate converted image"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during image conversion: {str(e)}"
