"""Add points_topup_requests table

Revision ID: e1b2c3d4f5a6
Revises: c3d9b7e21f4a
Create Date: 2026-04-17 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e1b2c3d4f5a6"
down_revision: Union[str, Sequence[str], None] = "c3d9b7e21f4a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "points_topup_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("requested_admin_user_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("note", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("created_by_user_id", sa.Integer(), nullable=False),
        sa.Column("resolved_by_user_id", sa.Integer(), nullable=True),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["requested_admin_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["resolved_by_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_points_topup_requests_id"), "points_topup_requests", ["id"], unique=False)
    op.create_index(
        op.f("ix_points_topup_requests_user_id"),
        "points_topup_requests",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_points_topup_requests_requested_admin_user_id"),
        "points_topup_requests",
        ["requested_admin_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_points_topup_requests_created_by_user_id"),
        "points_topup_requests",
        ["created_by_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_points_topup_requests_resolved_by_user_id"),
        "points_topup_requests",
        ["resolved_by_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_points_topup_requests_status"),
        "points_topup_requests",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_points_topup_requests_status"), table_name="points_topup_requests")
    op.drop_index(op.f("ix_points_topup_requests_resolved_by_user_id"), table_name="points_topup_requests")
    op.drop_index(op.f("ix_points_topup_requests_created_by_user_id"), table_name="points_topup_requests")
    op.drop_index(op.f("ix_points_topup_requests_requested_admin_user_id"), table_name="points_topup_requests")
    op.drop_index(op.f("ix_points_topup_requests_user_id"), table_name="points_topup_requests")
    op.drop_index(op.f("ix_points_topup_requests_id"), table_name="points_topup_requests")
    op.drop_table("points_topup_requests")
