import os
from dataclasses import dataclass
from pathlib import Path


def _load_env_file() -> None:
    """Load .env file into environment if present (without overriding existing vars)."""
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


@dataclass(frozen=True)
class Settings:
    db_host: str
    db_name: str
    db_user: str
    db_password: str
    secret_key: str
    backend_url: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int
    jwt_algorithm: str
    default_admin_email: str
    default_admin_password: str
    database_url: str


# Sessions are meant to stay valid until the user explicitly logs out, not to
# expire on a timer — actual invalidation happens via token_version (bumped on
# logout), so these defaults are set effectively "forever" rather than short-lived.
_def_access_minutes = 60 * 24 * 365 * 10  # 10 years
_def_refresh_days = 365 * 10  # 10 years


_load_env_file()


def _build_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    db_host = os.getenv("DB_HOST", "")
    db_name = os.getenv("DB_NAME", "")
    db_user = os.getenv("DB_USER", "")
    db_password = os.getenv("DB_PASSWORD", "")
    if db_password:
        return f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
    return f"mysql+pymysql://{db_user}@{db_host}/{db_name}"


settings = Settings(
    db_host=os.getenv("DB_HOST", ""),
    db_name=os.getenv("DB_NAME", ""),
    db_user=os.getenv("DB_USER", ""),
    db_password=os.getenv("DB_PASSWORD", ""),
    secret_key=os.getenv("SECRET_KEY", ""),
    backend_url=os.getenv("BACKEND_URL", ""),
    access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", _def_access_minutes)),
    refresh_token_expire_days=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", _def_refresh_days)),
    jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
    default_admin_email=os.getenv("DEFAULT_ADMIN_EMAIL", "admin@local"),
    default_admin_password=os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin@12345"),
    database_url=_build_database_url(),
)
