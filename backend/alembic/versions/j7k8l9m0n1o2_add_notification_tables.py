"""Add notifications and notification_recipients tables

Revision ID: j7k8l9m0n1o2
Revises: i6j7k8l9m0n1
Create Date: 2026-08-14 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "j7k8l9m0n1o2"
down_revision: Union[str, Sequence[str], None] = "i6j7k8l9m0n1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sender_user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.String(length=2000), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False, server_default="info"),
        sa.Column("audience", sa.String(length=32), nullable=False, server_default="selected"),
        sa.Column("recipient_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["sender_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notifications_id"), "notifications", ["id"], unique=False)
    op.create_index(op.f("ix_notifications_sender_user_id"), "notifications", ["sender_user_id"], unique=False)
    op.create_index(op.f("ix_notifications_category"), "notifications", ["category"], unique=False)
    op.create_index(op.f("ix_notifications_created_at"), "notifications", ["created_at"], unique=False)

    op.create_table(
        "notification_recipients",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("notification_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["notification_id"], ["notifications.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("notification_id", "user_id", name="uq_notification_recipients"),
    )
    op.create_index(op.f("ix_notification_recipients_id"), "notification_recipients", ["id"], unique=False)
    op.create_index(
        op.f("ix_notification_recipients_notification_id"),
        "notification_recipients",
        ["notification_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_notification_recipients_user_id"), "notification_recipients", ["user_id"], unique=False
    )
    # Serves the two hot reads: unread badge count, and the paginated inbox.
    op.create_index(
        "ix_notification_recipients_inbox", "notification_recipients", ["user_id", "is_read"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_notification_recipients_inbox", table_name="notification_recipients")
    op.drop_index(op.f("ix_notification_recipients_user_id"), table_name="notification_recipients")
    op.drop_index(op.f("ix_notification_recipients_notification_id"), table_name="notification_recipients")
    op.drop_index(op.f("ix_notification_recipients_id"), table_name="notification_recipients")
    op.drop_table("notification_recipients")

    op.drop_index(op.f("ix_notifications_created_at"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_category"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_sender_user_id"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_id"), table_name="notifications")
    op.drop_table("notifications")
