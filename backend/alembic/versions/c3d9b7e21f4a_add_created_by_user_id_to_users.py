"""Add created_by_user_id to users table

Revision ID: c3d9b7e21f4a
Revises: f22d5f1e9b3c
Create Date: 2026-04-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3d9b7e21f4a"
down_revision: Union[str, Sequence[str], None] = "f22d5f1e9b3c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("created_by_user_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_users_created_by_user_id"), "users", ["created_by_user_id"], unique=False)
    op.create_foreign_key(
        "fk_users_created_by_user_id_users",
        "users",
        "users",
        ["created_by_user_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_users_created_by_user_id_users", "users", type_="foreignkey")
    op.drop_index(op.f("ix_users_created_by_user_id"), table_name="users")
    op.drop_column("users", "created_by_user_id")
