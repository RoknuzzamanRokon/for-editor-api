"""
Compress JSON Service for shrinking JSON files.

Three modes:
- minify: strips insignificant whitespace only. The data is byte-for-byte the
  same apart from spacing — number literals, string escapes, key order and even
  duplicate keys are left untouched, because no parse/re-serialize happens.
- clean:  minify, plus drops object members whose value is null, "", [] or {}
  (after cleaning their children) and rounds decimals. This changes the data.
- gzip:   minify, then gzip. The smallest output, but it is a .json.gz archive
  that must be decompressed before use.
"""
import gzip
import json
import os
import re
from pathlib import Path
from typing import Any, Optional, Tuple

MODES = ("minify", "clean", "gzip")

# Decimal places kept by the "clean" mode.
CLEAN_DECIMALS = 4

# A JSON string literal, or a run of JSON whitespace. Strings are matched first
# so whitespace inside them is kept; everything else that is whitespace goes.
_STRING_OR_WHITESPACE = re.compile(r'("(?:[^"\\]|\\.)*")|[ \t\n\r]+', re.DOTALL)


def output_extension(mode: str) -> str:
    """File extension for a mode's output (the download name keeps the full suffix)."""
    return ".json.gz" if mode == "gzip" else ".min.json"


def _reject_constant(name: str) -> Any:
    raise ValueError(f"{name} is not valid JSON")


def parse_json_text(raw: bytes) -> Tuple[Optional[str], Optional[Any], Optional[str]]:
    """
    Decode and parse JSON bytes.

    Returns:
        Tuple of (text, parsed value, error_message). On failure text and value
        are None and error_message explains where the JSON is broken.
    """
    try:
        # utf-8-sig also accepts (and drops) a leading byte-order mark.
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        return None, None, "Only UTF-8 encoded JSON files are accepted"

    if not text.strip():
        return None, None, "JSON file is empty"

    try:
        value = json.loads(text, parse_constant=_reject_constant)
    except json.JSONDecodeError as exc:
        return None, None, f"Invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}"
    except ValueError as exc:
        return None, None, f"Invalid JSON: {exc}"

    return text, value, None


def minify_json_text(text: str) -> str:
    """Remove insignificant whitespace from valid JSON text without re-serializing it."""
    return _STRING_OR_WHITESPACE.sub(lambda match: match.group(1) or "", text)


def _is_empty(value: Any) -> bool:
    return value is None or value == "" or value == [] or value == {}


def clean_json_value(value: Any, decimals: int = CLEAN_DECIMALS) -> Any:
    """
    Drop empty object members and round floats, recursively.

    Array elements are never removed — positions in an array usually mean
    something (coordinates, columns), so only their contents are cleaned.
    """
    if isinstance(value, dict):
        cleaned = {}
        for key, item in value.items():
            item = clean_json_value(item, decimals)
            if not _is_empty(item):
                cleaned[key] = item
        return cleaned
    if isinstance(value, list):
        return [clean_json_value(item, decimals) for item in value]
    if isinstance(value, float):
        rounded = round(value, decimals)
        # Avoid emitting "-0.0" for tiny negatives that round to zero.
        return 0.0 if rounded == 0 else rounded
    return value


class CompressJSONService:
    """Service for reducing JSON file size"""

    def compress_json(self, json_path: str, output_path: str, mode: str = "minify") -> Tuple[bool, Optional[str]]:
        """
        Compress a JSON file using the given mode.

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if mode not in MODES:
                return False, f"Unknown mode '{mode}'. Use one of: {', '.join(MODES)}"
            if not os.path.exists(json_path):
                return False, f"JSON file not found: {json_path}"
            if os.path.getsize(json_path) == 0:
                return False, "JSON file is empty"

            with open(json_path, "rb") as source:
                text, value, error = parse_json_text(source.read())
            if error:
                return False, error

            if mode == "clean":
                cleaned = clean_json_value(value)
                output = json.dumps(cleaned, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
            else:
                output = minify_json_text(text).encode("utf-8")
                if mode == "gzip":
                    # mtime=0 keeps the archive byte-identical for identical input.
                    output = gzip.compress(output, compresslevel=9, mtime=0)

            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "wb") as target:
                target.write(output)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Failed to write the compressed JSON"

            return True, None

        except PermissionError as e:
            return False, f"Permission denied: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error during JSON compression: {str(e)}"
