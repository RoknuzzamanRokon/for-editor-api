"""
Text to PDF Converter Service for turning a plain .txt file into a formatted PDF
"""
import os
from pathlib import Path
from typing import List, Optional, Tuple

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


class TextToPDFConverterService:
    """Service for converting a plain text file into a paginated PDF"""

    PAGE_WIDTH, PAGE_HEIGHT = letter
    MARGIN = 54
    FONT_SIZE = 11
    LINE_HEIGHT = 14

    def convert_text_to_pdf(self, text_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Flow the contents of a text file into a simple paginated PDF.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(text_path):
                return False, f"Text file not found: {text_path}"
            if os.path.getsize(text_path) == 0:
                return False, "Text file is empty"

            with open(text_path, "r", encoding="utf-8", errors="replace") as f:
                raw_text = f.read()

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            c = canvas.Canvas(output_path, pagesize=letter)
            c.setFont("Helvetica", self.FONT_SIZE)

            usable_width = self.PAGE_WIDTH - 2 * self.MARGIN
            max_chars_per_line = max(20, int(usable_width / (self.FONT_SIZE * 0.5)))

            y = self.PAGE_HEIGHT - self.MARGIN
            for raw_line in raw_text.splitlines() or [""]:
                for line in self._wrap_line(raw_line, max_chars_per_line):
                    if y < self.MARGIN:
                        c.showPage()
                        c.setFont("Helvetica", self.FONT_SIZE)
                        y = self.PAGE_HEIGHT - self.MARGIN
                    c.drawString(self.MARGIN, y, line)
                    y -= self.LINE_HEIGHT

            c.save()

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate PDF"

            return True, None
        except Exception as e:
            return False, f"Unexpected error while creating PDF: {str(e)}"

    @staticmethod
    def _wrap_line(line: str, max_chars: int) -> List[str]:
        if not line:
            return [""]

        words = line.split(" ")
        wrapped: List[str] = []
        current = ""
        for word in words:
            candidate = f"{current} {word}".strip()
            if len(candidate) > max_chars and current:
                wrapped.append(current)
                current = word
            else:
                current = candidate
        if current:
            wrapped.append(current)
        return wrapped or [""]
