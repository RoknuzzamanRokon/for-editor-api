import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, func
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

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_jti = Column(String(36), unique=True, index=True, nullable=False)
    revoked = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="refresh_tokens")
