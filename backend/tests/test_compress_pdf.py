"""
Tests for Compress PDF with a target size: the target-size field parser, the
service's search for the gentlest image settings that fit, and the
/compress-pdf endpoint end to end.
"""
import io
import random
from pathlib import Path

import pymupdf
import pytest
from PIL import Image, ImageFilter

from services.compress_pdf import (
    MAX_TARGET_KB,
    MIN_TARGET_KB,
    TARGET_LEVELS,
    CompressPDFService,
    _rewrite,
    parse_target_kb,
)

A4 = (595, 842)


def _jpeg(image: Image.Image, quality: int = 92) -> bytes:
    buf = io.BytesIO()
    image.save(buf, "JPEG", quality=quality)
    return buf.getvalue()


def _scan_pdf(pages: int = 2) -> bytes:
    """Pages like a 200 DPI colour scan, plus a line of real text on each."""
    doc = pymupdf.open()
    for i in range(pages):
        page = doc.new_page(width=A4[0], height=A4[1])
        scan = Image.effect_noise((1654, 2339), 30 + i).filter(ImageFilter.GaussianBlur(2)).convert("RGB")
        page.insert_image(page.rect, stream=_jpeg(scan))
        page.insert_text((72, 72), f"Page {i + 1} text stays text", fontsize=14)
    return doc.tobytes(garbage=4, deflate=True)


def _dense_low_res_pdf(pages: int = 4) -> bytes:
    """Pure-noise images already at ~50 DPI: no level can make these small."""
    rng = random.Random(3)
    doc = pymupdf.open()
    for _ in range(pages):
        page = doc.new_page(width=A4[0], height=A4[1])
        noise = Image.frombytes("RGB", (413, 585), bytes(rng.getrandbits(8) for _ in range(413 * 585 * 3)))
        page.insert_image(page.rect, stream=_jpeg(noise, quality=95))
    return doc.tobytes(garbage=4, deflate=True)


def _image_widths(data: bytes):
    with pymupdf.open(stream=data, filetype="pdf") as doc:
        return [image[2] for page in doc for image in page.get_images(full=True)]


def _page_texts(data: bytes):
    with pymupdf.open(stream=data, filetype="pdf") as doc:
        return [page.get_text().strip() for page in doc]


def _compress(tmp_path: Path, source: bytes, target_bytes):
    src = tmp_path / "in.pdf"
    src.write_bytes(source)
    out = tmp_path / "out.pdf"
    ok, error = CompressPDFService().compress_pdf(str(src), str(out), target_bytes)
    return ok, error, out


@pytest.fixture(scope="module")
def scan_pdf():
    return _scan_pdf()


class TestParseTargetKb:
    @pytest.mark.parametrize("raw", [None, "", "   "])
    def test_missing_or_blank_means_no_target(self, raw):
        assert parse_target_kb(raw) == (None, None)

    @pytest.mark.parametrize("raw, expected", [("200", 200), (" 1024 ", 1024), (str(MIN_TARGET_KB), MIN_TARGET_KB), (str(MAX_TARGET_KB), MAX_TARGET_KB)])
    def test_accepts_whole_kb_in_range(self, raw, expected):
        assert parse_target_kb(raw) == (expected, None)

    @pytest.mark.parametrize("raw", ["abc", "1.5", "200kb", "-100"])
    def test_rejects_non_integers(self, raw):
        target, error = parse_target_kb(raw)
        assert target is None
        assert error

    @pytest.mark.parametrize("raw", [str(MIN_TARGET_KB - 1), str(MAX_TARGET_KB + 1), "0"])
    def test_rejects_out_of_range(self, raw):
        target, error = parse_target_kb(raw)
        assert target is None
        assert "between" in error


class TestCompressToTarget:
    def test_without_target_the_recommended_pass_still_runs(self, tmp_path, scan_pdf):
        ok, error, out = _compress(tmp_path, scan_pdf, None)

        assert ok, error
        assert len(_page_texts(out.read_bytes())) == 2

    def test_reaches_the_target_and_keeps_text_and_pages(self, tmp_path, scan_pdf):
        target = len(scan_pdf) // 4

        ok, error, out = _compress(tmp_path, scan_pdf, target)

        assert ok, error
        data = out.read_bytes()
        assert len(data) <= target
        assert _page_texts(data) == ["Page 1 text stays text", "Page 2 text stays text"]
        assert len(_image_widths(data)) == 2

    def test_a_target_already_met_leaves_images_untouched(self, tmp_path, scan_pdf):
        ok, error, out = _compress(tmp_path, scan_pdf, len(scan_pdf) + 1024)

        assert ok, error
        data = out.read_bytes()
        assert len(data) <= len(scan_pdf)
        assert _image_widths(data) == _image_widths(scan_pdf)

    def test_picks_the_gentlest_level_that_fits(self, tmp_path, scan_pdf):
        sizes = [len(_rewrite(scan_pdf, level)) for level in TARGET_LEVELS]
        assert sizes == sorted(sizes, reverse=True), "fixture should shrink at every level"
        # Exactly fits level 3, so levels 4+ (smaller, uglier) must not be used.
        target = sizes[3]

        ok, error, out = _compress(tmp_path, scan_pdf, target)

        assert ok, error
        assert len(out.read_bytes()) == sizes[3]

    def test_unreachable_target_returns_the_smallest_version(self, tmp_path):
        source = _dense_low_res_pdf()
        smallest_possible = min(len(_rewrite(source, level)) for level in TARGET_LEVELS)
        target = MIN_TARGET_KB * 1024
        assert smallest_possible > target, "fixture should be impossible to fit"

        ok, error, out = _compress(tmp_path, source, target)

        assert ok, error
        data = out.read_bytes()
        assert len(data) == smallest_possible
        assert len(data) < len(source)

    def test_password_protected_pdf_is_refused(self, tmp_path, scan_pdf):
        doc = pymupdf.open(stream=scan_pdf, filetype="pdf")
        locked = doc.tobytes(encryption=pymupdf.PDF_ENCRYPT_AES_256, owner_pw="owner", user_pw="user")

        ok, error, _ = _compress(tmp_path, locked, 100 * 1024)

        assert not ok
        assert "password protected" in error

    def test_owner_restrictions_survive_compression(self, tmp_path, scan_pdf):
        doc = pymupdf.open(stream=scan_pdf, filetype="pdf")
        restricted = doc.tobytes(
            encryption=pymupdf.PDF_ENCRYPT_AES_256,
            owner_pw="owner",
            user_pw="",
            permissions=pymupdf.PDF_PERM_ACCESSIBILITY,
        )

        ok, error, out = _compress(tmp_path, restricted, len(restricted) // 4)

        assert ok, error
        with pymupdf.open(out) as result:
            # (is_encrypted reads False here: an empty user password auto-authenticates.)
            assert "AES" in result.metadata["encryption"]
            assert not result.permissions & pymupdf.PDF_PERM_PRINT

    def test_missing_and_empty_files_fail_cleanly(self, tmp_path):
        ok, error = CompressPDFService().compress_pdf(str(tmp_path / "nope.pdf"), str(tmp_path / "out.pdf"), 1024)
        assert not ok and "not found" in error

        ok, error, _ = _compress(tmp_path, b"", 100 * 1024)
        assert not ok and "empty" in error


# ---------------------------------------------------------------------------
# Endpoint: real router, in-memory SQLite, overridden auth.
# ---------------------------------------------------------------------------

@pytest.fixture
def api(tmp_path, monkeypatch):
    pytest.importorskip("sqlalchemy")
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool

    from api.v3.endpoints import converters
    from core.deps import get_current_user
    from db.models import RoleEnum, User, UserConversionPermission, UserPoints
    from db.session import Base, get_db

    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    with Session() as db:
        user = User(email="pdf@test.local", hashed_password="x", role=RoleEnum.general_user)
        db.add(user)
        db.flush()
        db.add(UserPoints(user_id=user.id, balance=10))
        db.add(UserConversionPermission(user_id=user.id, action="compress_pdf", is_allowed=True))
        db.commit()
        user_id = user.id

    def override_db():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    def override_user():
        with Session() as db:
            found = db.get(User, user_id)
            db.expunge(found)
            return found

    monkeypatch.setattr(converters.compress_pdf_file_manager, "storage_dir", tmp_path)

    app = FastAPI()
    app.include_router(converters.router, prefix="/api/v3")
    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_current_user] = override_user

    def balance():
        with Session() as db:
            return db.query(UserPoints).filter_by(user_id=user_id).one().balance

    return TestClient(app), balance


def _upload(client, content, target_kb=None):
    return client.post(
        "/api/v3/conversions/compress-pdf",
        files={"file": ("scan.pdf", content, "application/pdf")},
        data={} if target_kb is None else {"target_kb": target_kb},
    )


@pytest.mark.parametrize("target_kb", [None, ""])
def test_endpoint_without_target_works_as_before(api, scan_pdf, target_kb):
    client, balance = api

    response = _upload(client, scan_pdf, target_kb)

    assert response.status_code == 200, response.text
    assert response.json()["status"] == "success"
    assert balance() == 7


def test_endpoint_compresses_to_the_target(api, scan_pdf):
    client, balance = api
    target_kb = len(scan_pdf) // 4 // 1024

    response = _upload(client, scan_pdf, str(target_kb))

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["status"] == "success"
    assert body["points_charged"] == 3
    assert balance() == 7

    download = client.get(body["download_url"])
    assert download.status_code == 200
    assert download.headers["content-type"].startswith("application/pdf")
    assert 'filename="scan.pdf"' in download.headers["content-disposition"]
    assert len(download.content) <= target_kb * 1024


@pytest.mark.parametrize("target_kb", ["abc", "1.5", str(MIN_TARGET_KB - 1), str(MAX_TARGET_KB + 1)])
def test_endpoint_rejects_a_bad_target_without_charging(api, scan_pdf, target_kb):
    client, balance = api

    response = _upload(client, scan_pdf, target_kb)

    assert response.status_code == 400
    assert "Target size" in response.json()["detail"]
    assert balance() == 10
    history = client.get("/api/v3/conversions/compress-pdf/files/history").json()
    assert history["items"] == []
