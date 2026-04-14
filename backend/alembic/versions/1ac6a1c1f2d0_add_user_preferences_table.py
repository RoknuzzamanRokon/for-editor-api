"""Add user preferences table for account settings

Revision ID: 1ac6a1c1f2d0
Revises: 9f3c2d1a4b6e
Create Date: 2026-04-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1ac6a1c1f2d0"
down_revision: Union[str, Sequence[str], None] = "9f3c2d1a4b6e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_preferences",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("theme", sa.String(length=32), nullable=False, server_default="light"),
        sa.Column("security_alerts_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("login_notifications_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("profile_private", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("user_id"),
    )


def downgrade() -> None:
    op.drop_table("user_preferences")
