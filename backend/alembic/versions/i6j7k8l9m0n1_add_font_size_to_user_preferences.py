"""Add font_size to user_preferences

Revision ID: i6j7k8l9m0n1
Revises: h5i6j7k8l9m0
Create Date: 2026-05-03 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "i6j7k8l9m0n1"
down_revision: Union[str, Sequence[str], None] = "h5i6j7k8l9m0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user_preferences",
        sa.Column("font_size", sa.String(length=16), nullable=False, server_default="medium"),
    )


def downgrade() -> None:
    op.drop_column("user_preferences", "font_size")
