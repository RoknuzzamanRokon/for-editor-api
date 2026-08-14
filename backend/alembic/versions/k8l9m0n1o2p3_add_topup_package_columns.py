"""Add package terms to points_topup_requests

Revision ID: k8l9m0n1o2p3
Revises: j7k8l9m0n1o2
Create Date: 2026-08-14 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "k8l9m0n1o2p3"
down_revision: Union[str, Sequence[str], None] = "j7k8l9m0n1o2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "points_topup_requests",
        sa.Column("package_key", sa.String(length=32), nullable=False, server_default="custom"),
    )
    op.add_column(
        "points_topup_requests",
        sa.Column("price_cents", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "points_topup_requests",
        sa.Column("grants_admin_access", sa.Boolean(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("points_topup_requests", "grants_admin_access")
    op.drop_column("points_topup_requests", "price_cents")
    op.drop_column("points_topup_requests", "package_key")
