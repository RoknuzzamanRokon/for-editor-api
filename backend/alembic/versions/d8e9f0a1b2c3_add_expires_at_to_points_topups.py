"""add expires_at to points_topups

Revision ID: d8e9f0a1b2c3
Revises: 2d4f6a8b9c01, aa7c5b6d8e9f
Create Date: 2026-04-25 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd8e9f0a1b2c3'
down_revision = ('2d4f6a8b9c01', 'aa7c5b6d8e9f')
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('points_topups', sa.Column('expires_at', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('points_topups', 'expires_at')
