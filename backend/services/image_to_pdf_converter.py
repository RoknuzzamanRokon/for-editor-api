"""
Image to PDF Converter Service for converting image files to PDF files
"""
import os
from pathlib import Path
from typing import List, Optional, Tuple

from PIL import Image, ImageOps


class ImageToPDFConverterService:
    """Service for converting images to PDF format"""

    @staticmethod
    def _load_as_rgb(image_path: str) -> Image.Image:
        with Image.open(image_path) as source:
            source.load()
            # Phone cameras store pixels sideways and record the real orientation
            # in EXIF; Pillow ignores that tag, so rotate the pixels to match.
            img = ImageOps.exif_transpose(source)
            if img.mode in ("RGBA", "LA", "P"):
                rgba = img.convert("RGBA")
                background = Image.new("RGB", rgba.size, (255, 255, 255))
                background.paste(rgba, mask=rgba.split()[-1])
                return background
            return img.convert("RGB")

    def convert_images_to_pdf(self, image_paths: List[str], output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Convert one or more image files into a single multi-page PDF.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not image_paths:
                return False, "No image files provided"

            for image_path in image_paths:
                if not os.path.exists(image_path):
                    return False, f"Image file not found: {image_path}"
                if not os.path.isfile(image_path):
                    return False, f"Path is not a file: {image_path}"
                if os.path.getsize(image_path) == 0:
                    return False, "Image file is empty"

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            rgb_images = [self._load_as_rgb(image_path) for image_path in image_paths]

            first_image, remaining_images = rgb_images[0], rgb_images[1:]
            first_image.save(
                output_path,
                "PDF",
                resolution=100.0,
                save_all=True,
                append_images=remaining_images,
            )

            if not os.path.exists(output_path):
                return False, "Failed to generate PDF output"

            if os.path.getsize(output_path) == 0:
                return False, "Generated PDF is empty"

            return True, None

        except PermissionError as e:
            return False, f"Permission denied: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error during conversion: {str(e)}"

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

            # PDF requires RGB; this also flattens transparency to white and
            # applies the EXIF orientation.
            rgb_image = self._load_as_rgb(image_path)
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
