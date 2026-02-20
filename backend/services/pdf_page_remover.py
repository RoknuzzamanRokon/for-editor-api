"""
PDF Page Remover Service for removing selected or blank pages from PDFs
"""
from typing import Optional, Set, Tuple

from pypdf import PdfReader, PdfWriter


class PDFPageRemoverService:
    """Service for removing pages from PDF files"""

    def parse_pages_spec(self, pages_spec: Optional[str], total_pages: int) -> Tuple[Set[int], Optional[str]]:
        """
        Parse a pages spec string like "1,3-5" into a set of zero-based indices.
        """
        if not pages_spec:
            return set(), None

        compact = pages_spec.replace(" ", "")
        if not compact:
            return set(), None

        pages: Set[int] = set()
        parts = compact.split(",")
        for part in parts:
            if not part:
                return set(), "Invalid pages format"
            if "-" in part:
                start_str, end_str = part.split("-", 1)
                if not start_str.isdigit() or not end_str.isdigit():
                    return set(), "Invalid page range"
                start = int(start_str)
                end = int(end_str)
                if start < 1 or end < 1 or start > end or end > total_pages:
                    return set(), "Page range out of bounds"
                for page_num in range(start, end + 1):
                    pages.add(page_num - 1)
            else:
                if not part.isdigit():
                    return set(), "Invalid page number"
                page_num = int(part)
                if page_num < 1 or page_num > total_pages:
                    return set(), "Page number out of bounds"
                pages.add(page_num - 1)

        return pages, None

    def is_page_blank(self, page) -> bool:
        """Best-effort blank page detection: no text and no XObject resources."""
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""

        if text.strip():
            return False

        try:
            resources = page.get("/Resources")
            if resources and "/XObject" in resources:
                xobjects = resources["/XObject"]
                try:
                    xobjects = xobjects.get_object()
                except Exception:
                    pass
                if xobjects and len(xobjects) > 0:
                    return False
        except Exception:
            return False

        return True

    def remove_pages(
        self,
        input_path: str,
        output_path: str,
        pages_spec: Optional[str] = None,
        remove_blank: bool = False,
    ) -> Tuple[bool, Optional[str]]:
        """
        Remove selected pages and/or blank pages from a PDF.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            reader = PdfReader(input_path)
            total_pages = len(reader.pages)
            if total_pages == 0:
                return False, "PDF has no pages"

            remove_set, error = self.parse_pages_spec(pages_spec, total_pages)
            if error:
                return False, error

            if remove_blank:
                for idx, page in enumerate(reader.pages):
                    if self.is_page_blank(page):
                        remove_set.add(idx)

            if not remove_set:
                return False, "No pages selected for removal"

            if len(remove_set) >= total_pages:
                return False, "Cannot remove all pages from the PDF"

            writer = PdfWriter()
            for idx, page in enumerate(reader.pages):
                if idx not in remove_set:
                    writer.add_page(page)

            with open(output_path, "wb") as f:
                writer.write(f)

            return True, None

        except Exception as e:
            return False, f"Unexpected error during page removal: {str(e)}"
