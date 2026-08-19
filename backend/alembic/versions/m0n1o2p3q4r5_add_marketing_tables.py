"""Add marketing_contacts, marketing_campaigns, and marketing_responses tables

Revision ID: m0n1o2p3q4r5
Revises: l9m0n1o2p3q4
Create Date: 2026-08-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "m0n1o2p3q4r5"
down_revision: Union[str, Sequence[str], None] = "l9m0n1o2p3q4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "marketing_contacts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=True),
        sa.Column("contact_name", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="new"),
        sa.Column("notes", sa.String(length=2000), nullable=True),
        sa.Column("created_by_user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_marketing_contacts_email"),
    )
    op.create_index(op.f("ix_marketing_contacts_id"), "marketing_contacts", ["id"], unique=False)
    op.create_index(op.f("ix_marketing_contacts_email"), "marketing_contacts", ["email"], unique=True)
    op.create_index(op.f("ix_marketing_contacts_status"), "marketing_contacts", ["status"], unique=False)
    op.create_index(
        op.f("ix_marketing_contacts_created_by_user_id"),
        "marketing_contacts",
        ["created_by_user_id"],
        unique=False,
    )

    op.create_table(
        "marketing_campaigns",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sender_user_id", sa.Integer(), nullable=True),
        sa.Column("subject", sa.String(length=200), nullable=False),
        sa.Column("body_html", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False, server_default="outreach"),
        sa.Column("recipient_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["sender_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_marketing_campaigns_id"), "marketing_campaigns", ["id"], unique=False)
    op.create_index(
        op.f("ix_marketing_campaigns_sender_user_id"), "marketing_campaigns", ["sender_user_id"], unique=False
    )
    op.create_index(
        op.f("ix_marketing_campaigns_created_at"), "marketing_campaigns", ["created_at"], unique=False
    )

    op.create_table(
        "marketing_responses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("contact_id", sa.Integer(), nullable=False),
        sa.Column("campaign_id", sa.Integer(), nullable=True),
        sa.Column("direction", sa.String(length=16), nullable=False),
        sa.Column("subject", sa.String(length=200), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=True),
        sa.Column("error_message", sa.String(length=500), nullable=True),
        sa.Column("sent_at", sa.DateTime(), nullable=True),
        sa.Column("logged_by_user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["contact_id"], ["marketing_contacts.id"]),
        sa.ForeignKeyConstraint(["campaign_id"], ["marketing_campaigns.id"]),
        sa.ForeignKeyConstraint(["logged_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_marketing_responses_id"), "marketing_responses", ["id"], unique=False)
    op.create_index(
        op.f("ix_marketing_responses_contact_id"), "marketing_responses", ["contact_id"], unique=False
    )
    op.create_index(
        op.f("ix_marketing_responses_campaign_id"), "marketing_responses", ["campaign_id"], unique=False
    )
    op.create_index(
        op.f("ix_marketing_responses_direction"), "marketing_responses", ["direction"], unique=False
    )
    op.create_index(op.f("ix_marketing_responses_status"), "marketing_responses", ["status"], unique=False)
    op.create_index(
        "ix_marketing_responses_contact_thread",
        "marketing_responses",
        ["contact_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_marketing_responses_contact_thread", table_name="marketing_responses")
    op.drop_index(op.f("ix_marketing_responses_status"), table_name="marketing_responses")
    op.drop_index(op.f("ix_marketing_responses_direction"), table_name="marketing_responses")
    op.drop_index(op.f("ix_marketing_responses_campaign_id"), table_name="marketing_responses")
    op.drop_index(op.f("ix_marketing_responses_contact_id"), table_name="marketing_responses")
    op.drop_index(op.f("ix_marketing_responses_id"), table_name="marketing_responses")
    op.drop_table("marketing_responses")

    op.drop_index(op.f("ix_marketing_campaigns_created_at"), table_name="marketing_campaigns")
    op.drop_index(op.f("ix_marketing_campaigns_sender_user_id"), table_name="marketing_campaigns")
    op.drop_index(op.f("ix_marketing_campaigns_id"), table_name="marketing_campaigns")
    op.drop_table("marketing_campaigns")

    op.drop_index(op.f("ix_marketing_contacts_created_by_user_id"), table_name="marketing_contacts")
    op.drop_index(op.f("ix_marketing_contacts_status"), table_name="marketing_contacts")
    op.drop_index(op.f("ix_marketing_contacts_email"), table_name="marketing_contacts")
    op.drop_index(op.f("ix_marketing_contacts_id"), table_name="marketing_contacts")
    op.drop_table("marketing_contacts")
