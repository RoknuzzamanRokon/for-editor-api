"""
CSV to Excel Converter Service
"""
import os
from pathlib import Path
from typing import Optional, Tuple

import pandas as pd


class CSVToExcelConverterService:
    """Service for converting a CSV file into an XLSX workbook"""

    def convert_csv_to_excel(self, csv_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Convert a CSV file to a single-sheet XLSX workbook.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(csv_path):
                return False, "CSV file not found"

            try:
                df = pd.read_csv(csv_path)
            except pd.errors.EmptyDataError:
                return False, "CSV file is empty"
            except pd.errors.ParserError as e:
                return False, f"Could not parse CSV file: {str(e)}"

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            df.to_excel(output_path, index=False, sheet_name="Sheet1", engine="openpyxl")

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate Excel workbook"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during CSV to Excel conversion: {str(e)}"
