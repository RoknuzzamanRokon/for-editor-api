"""Add conversions table for owner-scoped conversion tracking

Revision ID: 9f3c2d1a4b6e
Revises: 758f76ea5904
Create Date: 2026-02-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f3c2d1a4b6e"
down_revision: Union[str, Sequence[str], None] = "758f76ea5904"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "conversions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_user_id", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(length=64), nullable=False),
        sa.Column("input_filename", sa.String(length=255), nullable=False),
        sa.Column("output_filename", sa.String(length=1024), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("error_message", sa.String(length=1024), nullable=True),
        sa.Column("points_charged", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("request_id", sa.String(length=128), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("owner_user_id", "request_id", name="uq_conversions_owner_request"),
    )
    op.create_index(op.f("ix_conversions_id"), "conversions", ["id"], unique=False)
    op.create_index(op.f("ix_conversions_owner_user_id"), "conversions", ["owner_user_id"], unique=False)
    op.create_index(op.f("ix_conversions_action"), "conversions", ["action"], unique=False)
    op.create_index(op.f("ix_conversions_status"), "conversions", ["status"], unique=False)
    op.create_index(op.f("ix_conversions_created_at"), "conversions", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_conversions_created_at"), table_name="conversions")
    op.drop_index(op.f("ix_conversions_status"), table_name="conversions")
    op.drop_index(op.f("ix_conversions_action"), table_name="conversions")
    op.drop_index(op.f("ix_conversions_owner_user_id"), table_name="conversions")
    op.drop_index(op.f("ix_conversions_id"), table_name="conversions")
    op.drop_table("conversions")
