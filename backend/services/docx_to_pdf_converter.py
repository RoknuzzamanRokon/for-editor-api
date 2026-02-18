"""
DOCX to PDF Converter Service for converting Word documents to PDF files
"""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Tuple


class DOCXToPDFConverterService:
    """Service for converting DOCX files to PDF format using LibreOffice headless mode"""

    DEFAULT_TIMEOUT = 60

    def __init__(self, timeout: int = DEFAULT_TIMEOUT):
        self.timeout = timeout

    def convert_docx_to_pdf(self, docx_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Convert DOCX file to PDF.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(docx_path):
                return False, f"DOCX file not found: {docx_path}"

            if not os.path.isfile(docx_path):
                return False, f"Path is not a file: {docx_path}"

            if os.path.getsize(docx_path) == 0:
                return False, "DOCX file is empty"

            # LibreOffice CLI binary can be soffice or libreoffice depending on distro
            binary = shutil.which("soffice") or shutil.which("libreoffice")
            if not binary:
                return False, "LibreOffice is not installed on the server"

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            target_name = Path(output_path).name
            target_stem = Path(target_name).stem

            # LibreOffice writes output as <input_stem>.pdf in output dir.
            with tempfile.TemporaryDirectory() as temp_out_dir:
                cmd = [
                    binary,
                    "--headless",
                    "--convert-to",
                    "pdf",
                    "--outdir",
                    temp_out_dir,
                    docx_path,
                ]

                try:
                    completed = subprocess.run(
                        cmd,
                        capture_output=True,
                        text=True,
                        timeout=self.timeout,
                        check=False,
                    )
                except subprocess.TimeoutExpired:
                    return False, "Conversion timed out - DOCX is too large or complex"

                if completed.returncode != 0:
                    stderr = (completed.stderr or "").strip()
                    stdout = (completed.stdout or "").strip()
                    detail = stderr or stdout or "Unknown conversion error"
                    return False, f"Conversion failed: {detail}"

                generated_pdf = Path(temp_out_dir) / f"{Path(docx_path).stem}.pdf"
                if not generated_pdf.exists():
                    return False, "Failed to generate PDF output"

                final_path = output_dir / f"{target_stem}.pdf"
                generated_pdf.replace(final_path)

            if not os.path.exists(output_path):
                return False, "Failed to move generated PDF file"

            if os.path.getsize(output_path) == 0:
                return False, "Generated PDF is empty"

            return True, None

        except PermissionError as e:
            return False, f"Permission denied: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error during conversion: {str(e)}"
