"""Add email_verification_sessions table

Revision ID: h5i6j7k8l9m0
Revises: g4h5i6j7k8l9
Create Date: 2026-05-02 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


revision: str = "h5i6j7k8l9m0"
down_revision: Union[str, Sequence[str], None] = "g4h5i6j7k8l9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "email_verification_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("verification_code", sa.String(length=5), nullable=False),
        sa.Column("registration_data_json", sa.JSON(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("is_used", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("failed_attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
    )
    
    # Create indexes
    op.create_index(op.f("ix_email_verification_sessions_id"), "email_verification_sessions", ["id"], unique=False)
    op.create_index(op.f("ix_email_verification_sessions_email"), "email_verification_sessions", ["email"], unique=False)
    op.create_index(op.f("ix_email_verification_sessions_verification_code"), "email_verification_sessions", ["verification_code"], unique=False)
    op.create_index(op.f("ix_email_verification_sessions_expires_at"), "email_verification_sessions", ["expires_at"], unique=False)
    op.create_index("ix_email_active", "email_verification_sessions", ["email", "is_used", "expires_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_email_active", table_name="email_verification_sessions")
    op.drop_index(op.f("ix_email_verification_sessions_expires_at"), table_name="email_verification_sessions")
    op.drop_index(op.f("ix_email_verification_sessions_verification_code"), table_name="email_verification_sessions")
    op.drop_index(op.f("ix_email_verification_sessions_email"), table_name="email_verification_sessions")
    op.drop_index(op.f("ix_email_verification_sessions_id"), table_name="email_verification_sessions")
    op.drop_table("email_verification_sessions")
