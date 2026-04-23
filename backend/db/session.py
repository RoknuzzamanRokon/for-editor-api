from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

from core.config import settings

connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from db import models  # noqa: F401

    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "demo_expires_at" in user_columns:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN demo_expires_at DATETIME NULL"))
