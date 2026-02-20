"""
Excel to PDF Converter Service for converting Excel spreadsheets to PDF files
"""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Tuple


class ExcelToPDFConverterService:
    """Service for converting Excel files to PDF format using LibreOffice headless mode"""

    DEFAULT_TIMEOUT = 60

    def __init__(self, timeout: int = DEFAULT_TIMEOUT):
        self.timeout = timeout

    def convert_excel_to_pdf(self, excel_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Convert Excel file to PDF.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(excel_path):
                return False, f"Excel file not found: {excel_path}"

            if not os.path.isfile(excel_path):
                return False, f"Path is not a file: {excel_path}"

            if os.path.getsize(excel_path) == 0:
                return False, "Excel file is empty"

            binary = shutil.which("soffice") or shutil.which("libreoffice")
            if not binary:
                return False, "LibreOffice is not installed on the server"

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            target_name = Path(output_path).name
            target_stem = Path(target_name).stem

            with tempfile.TemporaryDirectory() as temp_out_dir:
                cmd = [
                    binary,
                    "--headless",
                    "--convert-to",
                    "pdf",
                    "--outdir",
                    temp_out_dir,
                    excel_path,
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
                    return False, "Conversion timed out - Excel file is too large or complex"

                if completed.returncode != 0:
                    stderr = (completed.stderr or "").strip()
                    stdout = (completed.stdout or "").strip()
                    detail = stderr or stdout or "Unknown conversion error"
                    return False, f"Conversion failed: {detail}"

                generated_pdf = Path(temp_out_dir) / f"{Path(excel_path).stem}.pdf"
                if not generated_pdf.exists():
                    return False, "Failed to generate PDF output"

                final_path = output_dir / f"{target_stem}.pdf"
                shutil.move(str(generated_pdf), str(final_path))

            if not os.path.exists(output_path):
                return False, "Failed to move generated PDF file"

            if os.path.getsize(output_path) == 0:
                return False, "Generated PDF is empty"

            return True, None

        except PermissionError as e:
            return False, f"Permission denied: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error during conversion: {str(e)}"
