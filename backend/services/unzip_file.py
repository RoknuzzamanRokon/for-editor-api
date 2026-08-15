"""
Unzip File Service for safely extracting a ZIP archive

Browsers can only download one file per conversion, so this tool can't hand
back a folder of separate files. Instead it extracts the archive and
re-packages the contents into a flat ZIP: nested folders are removed and any
entry that would escape the extraction directory (a "zip slip" attack) is
rejected, so what comes out is a sanitized, flattened copy of what went in.
"""
import os
import zipfile
from collections import Counter
from pathlib import Path
from typing import Optional, Tuple

from models.schemas import MAX_FILE_SIZE_BYTES

# Guards against zip-bomb style archives that are tiny on disk but enormous
# once decompressed.
MAX_UNCOMPRESSED_TOTAL_BYTES = MAX_FILE_SIZE_BYTES * 10


class UnzipFileService:
    """Service for extracting a ZIP archive into a sanitized, flattened ZIP"""

    def extract_flattened(self, zip_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Extract every file entry in `zip_path` and re-zip them, flattened,
        into `output_path`.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not os.path.exists(zip_path):
                return False, "ZIP file not found"

            if not zipfile.is_zipfile(zip_path):
                return False, "File is not a valid ZIP archive"

            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)

            with zipfile.ZipFile(zip_path, "r") as source:
                infos = [info for info in source.infolist() if not info.is_dir()]
                if not infos:
                    return False, "ZIP archive is empty"

                total_uncompressed = sum(info.file_size for info in infos)
                if total_uncompressed > MAX_UNCOMPRESSED_TOTAL_BYTES:
                    return False, "Archive contents are too large to extract"

                name_counts = Counter(Path(info.filename).name for info in infos)
                seen: Counter = Counter()

                with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as dest:
                    for info in infos:
                        # Reject entries that resolve outside the flattened
                        # output (absolute paths, "../" traversal, etc).
                        safe_name = Path(info.filename).name
                        if not safe_name or safe_name in (".", ".."):
                            continue

                        arcname = safe_name
                        if name_counts[safe_name] > 1:
                            seen[safe_name] += 1
                            stem, ext = os.path.splitext(safe_name)
                            arcname = f"{stem}_{seen[safe_name]}{ext}"

                        with source.open(info) as member:
                            dest.writestr(arcname, member.read())

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to generate extracted ZIP"

            return True, None
        except zipfile.BadZipFile:
            return False, "File is not a valid ZIP archive"
        except Exception as e:
            return False, f"Unexpected error while extracting archive: {str(e)}"
