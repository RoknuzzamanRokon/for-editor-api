"""Set sunset as the default theme and normalize removed theme values

Revision ID: aa7c5b6d8e9f
Revises: e1b2c3d4f5a6
Create Date: 2026-04-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "aa7c5b6d8e9f"
down_revision: Union[str, Sequence[str], None] = "e1b2c3d4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            UPDATE user_preferences
            SET theme = 'sunset'
            WHERE theme IN ('dark', 'midnight', 'livedark')
            """
        )
    )
    op.alter_column("user_preferences", "theme", server_default="sunset")


def downgrade() -> None:
    op.alter_column("user_preferences", "theme", server_default="light")
