import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, func, JSON, UniqueConstraint
from sqlalchemy.orm import relationship

from db.session import Base


class RoleEnum(str, enum.Enum):
    super_user = "super_user"
    admin_user = "admin_user"
    general_user = "general_user"
    demo_user = "demo_user"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum, name="user_role"), nullable=False, default=RoleEnum.general_user)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    last_login = Column(DateTime, nullable=True)  # Track last login time

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    points = relationship("UserPoints", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversion_permissions = relationship(
        "UserConversionPermission",
        back_populates="user",
        foreign_keys="UserConversionPermission.user_id",
        cascade="all, delete-orphan",
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_jti = Column(String(36), unique=True, index=True, nullable=False)
    revoked = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="refresh_tokens")


class UserPoints(Base):
    __tablename__ = "user_points"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    balance = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="points")


class PointsLedger(Base):
    __tablename__ = "points_ledger"
    __table_args__ = (
        UniqueConstraint("user_id", "action", "request_id", "status", name="uq_points_ledger_request"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(64), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    status = Column(String(32), nullable=False)
    request_id = Column(String(128), nullable=False)
    meta_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User")


class UserConversionPermission(Base):
    __tablename__ = "user_conversion_permissions"
    __table_args__ = (
        UniqueConstraint("user_id", "action", name="uq_user_conversion_permissions"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(64), nullable=False, index=True)
    is_allowed = Column(Boolean, nullable=False, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="conversion_permissions", foreign_keys=[user_id])


class PointsTopup(Base):
    __tablename__ = "points_topups"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
