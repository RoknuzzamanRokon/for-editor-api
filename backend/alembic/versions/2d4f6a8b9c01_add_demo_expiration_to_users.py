"""add demo expiration to users

Revision ID: 2d4f6a8b9c01
Revises: f22d5f1e9b3c
Create Date: 2026-04-24 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "2d4f6a8b9c01"
down_revision = "f22d5f1e9b3c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("demo_expires_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "demo_expires_at")
