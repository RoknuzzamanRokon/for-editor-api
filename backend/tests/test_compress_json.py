"""
Tests for the Compress JSON tool: the service (all three modes), the upload
validator, and the /compress-json endpoint end to end.
"""
import asyncio
import gzip
import io
import json
import random
from pathlib import Path

import pytest

from services.compress_json import (
    CompressJSONService,
    clean_json_value,
    minify_json_text,
    output_extension,
    parse_json_text,
)

PRETTY = """{
    "name" : "Rokon",
    "city": "ঢাকা",
    "note": "keep   these   spaces\\n and \\"quotes\\"",
    "precise": 0.12345678901234567890123,
    "same": 1.10,
    "big": 12345678901234567890123,
    "exp": 1e5,
    "dup": 1,
    "dup": 2,
    "empty": "",
    "missing": null,
    "list": [ 1, null, "", { } ],
    "nested": { "gone": null, "also": [] },
    "zero": 0,
    "off": false
}
"""


def _realistic_pretty_json(target_bytes: int = 80_000) -> str:
    rng = random.Random(1)
    rows = []
    while True:
        i = len(rows)
        rows.append({
            "id": i,
            "name": f"User {i}",
            "active": i % 3 != 0,
            "score": round(rng.random() * 100, 6),
            "tags": ["alpha", "beta"][: i % 3],
            "address": {"city": "Dhaka", "zip": None, "lat": 23.81 + rng.random()},
            "notes": "",
        })
        text = json.dumps(rows, indent=4, ensure_ascii=False)
        if len(text.encode()) >= target_bytes:
            return text


def _run(service: CompressJSONService, tmp_path: Path, source: str, mode: str) -> bytes:
    src = tmp_path / "in.json"
    src.write_text(source, encoding="utf-8")
    out = tmp_path / f"out{output_extension(mode)}"
    ok, error = service.compress_json(str(src), str(out), mode)
    assert ok, error
    return out.read_bytes()


@pytest.fixture
def service():
    return CompressJSONService()


class TestMinify:
    def test_removes_only_insignificant_whitespace(self, service, tmp_path):
        out = _run(service, tmp_path, PRETTY, "minify").decode("utf-8")

        assert "\n" not in out
        assert '"name":"Rokon"' in out
        # Inside strings, nothing changes — spaces and escapes included.
        assert '"keep   these   spaces\\n and \\"quotes\\""' in out
        # No re-serialization: number literals, Unicode and duplicate keys survive as written.
        assert '"precise":0.12345678901234567890123' in out
        assert '"same":1.10' in out
        assert '"big":12345678901234567890123' in out
        assert '"exp":1e5' in out
        assert '"city":"ঢাকা"' in out
        assert '"dup":1,"dup":2' in out
        assert json.loads(out) == json.loads(PRETTY)

    def test_scalar_and_already_minified_input(self):
        assert minify_json_text('  42  ') == "42"
        assert minify_json_text('{"a":[1,2]}') == '{"a":[1,2]}'
        assert minify_json_text('"  spaced  "') == '"  spaced  "'


class TestClean:
    def test_drops_empty_members_and_rounds(self, service, tmp_path):
        out = json.loads(_run(service, tmp_path, PRETTY, "clean"))

        assert "empty" not in out and "missing" not in out
        # "nested" only held empties, so it is dropped as well.
        assert "nested" not in out
        # Array positions are kept; only their contents are cleaned.
        assert out["list"] == [1, None, "", {}]
        assert out["precise"] == 0.1235
        assert out["zero"] == 0 and out["off"] is False
        assert out["city"] == "ঢাকা"

    def test_rounding_never_yields_negative_zero(self):
        assert json.dumps(clean_json_value(-0.00001)) == "0.0"
        assert clean_json_value({"a": {"b": {"c": None}}}) == {}


class TestGzip:
    def test_gzip_holds_the_minified_json_and_is_deterministic(self, service, tmp_path):
        first = _run(service, tmp_path, PRETTY, "gzip")
        second = _run(service, tmp_path, PRETTY, "gzip")

        assert first[:2] == b"\x1f\x8b"
        assert first == second
        assert gzip.decompress(first).decode("utf-8") == minify_json_text(PRETTY)


def test_realistic_80kb_file_gets_smaller_in_every_mode(service, tmp_path):
    pretty = _realistic_pretty_json()
    original = len(pretty.encode("utf-8"))
    sizes = {mode: len(_run(service, tmp_path, pretty, mode)) for mode in ("minify", "clean", "gzip")}

    assert original >= 80_000
    assert sizes["minify"] < original * 0.7
    assert sizes["clean"] < sizes["minify"]
    assert sizes["gzip"] < 20_000


class TestErrors:
    @pytest.mark.parametrize(
        "raw, message",
        [
            (b'{"a": 1,}', "Invalid JSON at line 1"),
            (b'{"a": NaN}', "NaN is not valid JSON"),
            (b"   ", "JSON file is empty"),
            ("{\"a\": \"ঢাকা\"}".encode("utf-16"), "Only UTF-8"),
        ],
    )
    def test_parse_errors(self, raw, message):
        text, value, error = parse_json_text(raw)
        assert text is None and value is None
        assert message in error

    def test_byte_order_mark_is_accepted(self):
        _, value, error = parse_json_text(b'\xef\xbb\xbf{"a": 1}')
        assert error is None and value == {"a": 1}

    def test_unknown_mode_and_missing_file(self, service, tmp_path):
        src = tmp_path / "in.json"
        src.write_text("{}", encoding="utf-8")
        ok, error = service.compress_json(str(src), str(tmp_path / "o.json"), "zip")
        assert not ok and "Unknown mode" in error

        ok, error = service.compress_json(str(tmp_path / "nope.json"), str(tmp_path / "o.json"))
        assert not ok and "not found" in error


class TestUploadValidation:
    def _validate(self, filename: str, content: bytes):
        from fastapi import UploadFile
        from services.file_manager import FileManagerService

        upload = UploadFile(filename=filename, file=io.BytesIO(content))
        return asyncio.run(FileManagerService(storage_dir=".").validate_json_file(upload))

    def test_accepts_valid_json(self):
        assert self._validate("data.json", b'{"a": 1}') == (True, None)

    @pytest.mark.parametrize(
        "filename, content, message",
        [
            ("data.txt", b"{}", "Only JSON files are accepted"),
            ("data.json", b"", "File is empty"),
            ("data.json", b'{"a":', "Invalid JSON at line 1"),
        ],
    )
    def test_rejects(self, filename, content, message):
        ok, error = self._validate(filename, content)
        assert not ok and message in error


# --------------------------------------------------------------------------
# Endpoint: real router, in-memory SQLite, overridden auth.
# --------------------------------------------------------------------------

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
        user = User(email="json@test.local", hashed_password="x", role=RoleEnum.general_user)
        db.add(user)
        db.flush()
        db.add(UserPoints(user_id=user.id, balance=10))
        db.add(UserConversionPermission(user_id=user.id, action="compress_json", is_allowed=True))
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

    monkeypatch.setattr(converters.compress_json_file_manager, "storage_dir", tmp_path)

    app = FastAPI()
    app.include_router(converters.router, prefix="/api/v3")
    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_current_user] = override_user

    def balance():
        with Session() as db:
            return db.query(UserPoints).filter_by(user_id=user_id).one().balance

    return TestClient(app), balance


def _upload(client, mode, content=PRETTY.encode("utf-8"), filename="data.json"):
    return client.post(
        "/api/v3/conversions/compress-json",
        files={"file": (filename, content, "application/json")},
        data={"mode": mode},
    )


@pytest.mark.parametrize(
    "mode, download_name, media_type",
    [
        ("minify", "data.min.json", "application/json"),
        ("clean", "data.min.json", "application/json"),
        ("gzip", "data.json.gz", "application/gzip"),
    ],
)
def test_endpoint_compresses_and_serves_the_result(api, mode, download_name, media_type):
    client, balance = api

    response = _upload(client, mode)

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["status"] == "success"
    assert body["points_charged"] == 3
    assert balance() == 7

    download = client.get(body["download_url"])
    assert download.status_code == 200
    assert download.headers["content-type"].startswith(media_type)
    assert f'filename="{download_name}"' in download.headers["content-disposition"]

    data = download.content
    if mode == "gzip":
        data = gzip.decompress(data)
    if mode == "clean":
        assert json.loads(data) == clean_json_value(json.loads(PRETTY))
    else:
        assert data.decode("utf-8") == minify_json_text(PRETTY)

    history = client.get("/api/v3/conversions/compress-json/files/history").json()
    assert [item["action"] for item in history["items"]] == ["compress_json"]


@pytest.mark.parametrize(
    "kwargs, detail",
    [
        ({"mode": "zip"}, "Invalid mode"),
        ({"mode": "minify", "content": b'{"broken": '}, "Invalid JSON"),
        ({"mode": "minify", "filename": "data.csv"}, "Only JSON files are accepted"),
    ],
)
def test_endpoint_rejects_bad_input_without_charging(api, kwargs, detail):
    client, balance = api

    response = _upload(client, **kwargs)

    assert response.status_code == 400
    assert detail in response.json()["detail"]
    assert balance() == 10
    history = client.get("/api/v3/conversions/compress-json/files/history").json()
    assert history["items"] == []
