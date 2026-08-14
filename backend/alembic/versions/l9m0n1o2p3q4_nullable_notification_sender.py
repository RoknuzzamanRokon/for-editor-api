"""Allow system-generated notifications (nullable sender)

Revision ID: l9m0n1o2p3q4
Revises: k8l9m0n1o2p3
Create Date: 2026-08-15 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "l9m0n1o2p3q4"
down_revision: Union[str, Sequence[str], None] = "k8l9m0n1o2p3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Points-credited / request-declined notifications are raised by the system
    # itself, not by a person, so they carry no sender.
    op.alter_column(
        "notifications",
        "sender_user_id",
        existing_type=sa.Integer(),
        nullable=True,
    )


def downgrade() -> None:
    # Existing system notifications would violate NOT NULL, so clear them first.
    op.execute("DELETE FROM notification_recipients WHERE notification_id IN "
               "(SELECT id FROM notifications WHERE sender_user_id IS NULL)")
    op.execute("DELETE FROM notifications WHERE sender_user_id IS NULL")
    op.alter_column(
        "notifications",
        "sender_user_id",
        existing_type=sa.Integer(),
        nullable=False,
    )
