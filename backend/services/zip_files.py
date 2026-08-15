"""
Zip Files Service for combining multiple files into a single ZIP archive
"""
import os
import zipfile
from collections import Counter
from pathlib import Path
from typing import List, Optional, Tuple


class ZipFilesService:
    """Service for combining multiple uploaded files into one ZIP archive"""

    def create_zip(self, entries: List[Tuple[str, str]], output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Create a ZIP archive containing the given files.

        Args:
            entries: List of (original_filename, source_path) tuples.
            output_path: Where to write the resulting .zip file.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not entries:
                return False, "No files provided"

            for _, source_path in entries:
                if not os.path.exists(source_path):
                    return False, f"File not found: {source_path}"

            # De-duplicate names so two same-named uploads don't overwrite each
            # other inside the archive.
            name_counts = Counter(name for name, _ in entries)
            seen: Counter = Counter()
            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for name, source_path in entries:
                    arcname = name
                    if name_counts[name] > 1:
                        seen[name] += 1
                        stem, ext = os.path.splitext(name)
                        arcname = f"{stem}_{seen[name]}{ext}"
                    zf.write(source_path, arcname=arcname)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate ZIP archive"

            return True, None
        except Exception as e:
            return False, f"Unexpected error while zipping files: {str(e)}"
