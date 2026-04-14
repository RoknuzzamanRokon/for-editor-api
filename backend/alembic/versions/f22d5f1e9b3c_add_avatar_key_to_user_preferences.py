"""Add avatar key to user preferences

Revision ID: f22d5f1e9b3c
Revises: 1ac6a1c1f2d0
Create Date: 2026-04-14 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f22d5f1e9b3c"
down_revision: Union[str, Sequence[str], None] = "1ac6a1c1f2d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user_preferences",
        sa.Column("avatar_key", sa.String(length=32), nullable=False, server_default="avatar_1"),
    )


def downgrade() -> None:
    op.drop_column("user_preferences", "avatar_key")
