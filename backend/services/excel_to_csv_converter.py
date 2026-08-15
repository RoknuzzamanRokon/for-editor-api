"""
Excel to CSV Converter Service
"""
import os
from pathlib import Path
from typing import Optional, Tuple

import pandas as pd


class ExcelToCSVConverterService:
    """Service for converting an Excel workbook into a CSV file"""

    def convert_excel_to_csv(self, excel_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Convert the first sheet of an Excel workbook to CSV.

        Multi-sheet workbooks only export their first sheet — a CSV has no
        concept of multiple sheets, so there's no lossless way to carry the
        rest along.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(excel_path):
                return False, "Excel file not found"

            try:
                df = pd.read_excel(excel_path, sheet_name=0)
            except ValueError as e:
                return False, f"Could not read Excel workbook: {str(e)}"

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            df.to_csv(output_path, index=False)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate CSV file"

            return True, None
        except Exception as e:
            return False, f"Unexpected error during Excel to CSV conversion: {str(e)}"
