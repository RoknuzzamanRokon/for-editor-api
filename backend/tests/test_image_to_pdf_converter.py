"""
Unit tests for ImageToPDFConverterService.

Focus: phone photos that store their pixels sideways and record the real
orientation in the EXIF Orientation tag must come out upright in the PDF.
"""
from pathlib import Path

import fitz  # PyMuPDF
import pytest
from PIL import Image

from services.image_to_pdf_converter import ImageToPDFConverterService

EXIF_ORIENTATION_TAG = 0x0112
# Orientation 6: the camera was turned 90° clockwise, so viewers rotate the
# stored pixels 90° clockwise to display them.
ORIENTATION_ROTATE_90_CW = 6


def _write_jpeg(path: Path, size, orientation=None, color=(200, 30, 30)):
    image = Image.new("RGB", size, color)
    exif = Image.Exif()
    if orientation is not None:
        exif[EXIF_ORIENTATION_TAG] = orientation
    image.save(path, "JPEG", exif=exif.tobytes())
    return path


def _pdf_page_sizes(pdf_path: Path):
    with fitz.open(pdf_path) as document:
        return [(round(page.rect.width), round(page.rect.height)) for page in document]


@pytest.fixture
def converter():
    return ImageToPDFConverterService()


def test_load_as_rgb_applies_exif_orientation(converter, tmp_path):
    # Stored landscape (300x200) but tagged "rotate 90° clockwise".
    photo = _write_jpeg(tmp_path / "phone.jpg", (300, 200), ORIENTATION_ROTATE_90_CW)

    loaded = converter._load_as_rgb(str(photo))

    assert loaded.mode == "RGB"
    assert loaded.size == (200, 300)


def test_load_as_rgb_keeps_untagged_image_as_is(converter, tmp_path):
    photo = _write_jpeg(tmp_path / "plain.jpg", (300, 200))

    loaded = converter._load_as_rgb(str(photo))

    assert loaded.size == (300, 200)


def test_load_as_rgb_flattens_transparency_to_white(converter, tmp_path):
    transparent = tmp_path / "transparent.png"
    Image.new("RGBA", (10, 10), (0, 0, 0, 0)).save(transparent)

    loaded = converter._load_as_rgb(str(transparent))

    assert loaded.mode == "RGB"
    assert loaded.getpixel((5, 5)) == (255, 255, 255)


def test_multi_image_pdf_pages_follow_exif_orientation(converter, tmp_path):
    rotated = _write_jpeg(tmp_path / "a.jpg", (300, 200), ORIENTATION_ROTATE_90_CW)
    upright = _write_jpeg(tmp_path / "b.jpg", (300, 200))
    output = tmp_path / "out.pdf"

    success, error = converter.convert_images_to_pdf([str(rotated), str(upright)], str(output))

    assert success, error
    # resolution=100 dpi → 1 px = 0.72 pt.
    assert _pdf_page_sizes(output) == [(144, 216), (216, 144)]


def test_single_image_pdf_follows_exif_orientation(converter, tmp_path):
    rotated = _write_jpeg(tmp_path / "a.jpg", (300, 200), ORIENTATION_ROTATE_90_CW)
    output = tmp_path / "single.pdf"

    success, error = converter.convert_image_to_pdf(str(rotated), str(output))

    assert success, error
    assert _pdf_page_sizes(output) == [(144, 216)]
