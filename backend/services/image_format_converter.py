"""
Image Format Converter Service for converting between PNG, JPG, WEBP, BMP,
TIFF, GIF, and ICO (including HEIC/HEIF photos as a source), and downscaling
oversized images.
"""
import os
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image
import pillow_heif

# Registers the HEIF/HEIC decoder into Pillow's Image.open(), so HEIC photos
# (e.g. straight off an iPhone) can be used as a source image like any other format.
pillow_heif.register_heif_opener()

SUPPORTED_FORMATS = {
    "png": "PNG",
    "jpg": "JPEG",
    "jpeg": "JPEG",
    "webp": "WEBP",
    "bmp": "BMP",
    "tiff": "TIFF",
    "gif": "GIF",
    "ico": "ICO",
}
FLATTEN_TO_RGB_FORMATS = {"JPEG", "BMP"}
MAX_DIMENSION = 4000
ICO_MAX_DIMENSION = 256


class ImageFormatConverterService:
    """Service for converting an image to a different format"""

    def convert_image_format(
        self, image_path: str, output_path: str, target_format: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Convert an image to the requested target format.

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
                return False, "Unsupported target format. Choose PNG, JPG, WEBP, BMP, TIFF, GIF, or ICO"

            pillow_format = SUPPORTED_FORMATS[normalized_format]

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with Image.open(image_path) as img:
                img.load()
                max_dimension = ICO_MAX_DIMENSION if pillow_format == "ICO" else MAX_DIMENSION
                if max(img.size) > max_dimension:
                    ratio = max_dimension / max(img.size)
                    img = img.resize((int(img.size[0] * ratio), int(img.size[1] * ratio)))

                if pillow_format in FLATTEN_TO_RGB_FORMATS and img.mode in ("RGBA", "LA", "P"):
                    rgba = img.convert("RGBA")
                    background = Image.new("RGB", rgba.size, (255, 255, 255))
                    background.paste(rgba, mask=rgba.split()[-1])
                    save_image = background
                elif pillow_format in FLATTEN_TO_RGB_FORMATS:
                    save_image = img.convert("RGB")
                elif pillow_format == "GIF":
                    # GIF requires palette mode; flatten transparency first, same as JPEG/BMP.
                    rgba = img.convert("RGBA")
                    background = Image.new("RGB", rgba.size, (255, 255, 255))
                    background.paste(rgba, mask=rgba.split()[-1])
                    save_image = background.convert("P", palette=Image.ADAPTIVE)
                elif pillow_format == "ICO":
                    save_image = img.convert("RGBA")
                else:
                    save_image = img

                save_image.save(output_path, pillow_format)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate converted image"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during image conversion: {str(e)}"
