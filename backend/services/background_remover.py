"""
Background removal service using rembg.
"""
from typing import Optional, Tuple


class BackgroundRemoverService:
    """Service to remove image backgrounds."""

    def remove_background(self, input_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Remove background from an image and save as PNG.

        Args:
            input_path: Path to input image
            output_path: Path to write output PNG

        Returns:
            (success, error_message)
        """
        try:
            try:
                from rembg import remove
            except ImportError:
                return False, "rembg is not installed. Run `pipenv install rembg` in backend."

            with open(input_path, "rb") as infile:
                input_data = infile.read()

            if not input_data:
                return False, "Input file is empty"

            output_data = remove(input_data)
            if not output_data:
                return False, "Background removal produced empty output"

            with open(output_path, "wb") as outfile:
                outfile.write(output_data)

            return True, None
        except Exception as exc:
            return False, str(exc)
