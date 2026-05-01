"""Migrate light theme to sunset

Revision ID: f3a4b5c6d7e8
Revises: e2f3a4b5c6d7
Create Date: 2026-04-26 10:00:00.000000

This migration updates all user preferences with theme='light' to theme='sunset'
as part of the light theme removal feature. The light theme is being deprecated
to simplify the theme system and focus on the three preferred dark-mode themes:
sunset, ocean, and forest.

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f3a4b5c6d7e8"
down_revision: Union[str, Sequence[str], None] = "e2f3a4b5c6d7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Update all user preferences with theme='light' to theme='sunset'.
    
    This migration is idempotent and safe to run multiple times.
    After this migration, no user_preferences records should have theme='light'.
    """
    op.execute(
        sa.text(
            """
            UPDATE user_preferences
            SET theme = 'sunset'
            WHERE theme = 'light'
            """
        )
    )


def downgrade() -> None:
    """
    Downgrade is intentionally limited and not recommended.
    
    LIMITATION: This downgrade cannot reliably determine which users originally
    had theme='light' vs theme='sunset'. It will restore ALL 'sunset' themes
    back to 'light', which may affect users who explicitly chose 'sunset'.
    
    In production, downgrade should be avoided. If absolutely necessary, manual
    data restoration from a backup is recommended instead.
    """
    # WARNING: This will change ALL sunset themes to light, not just the ones
    # that were migrated from light to sunset
    op.execute(
        sa.text(
            """
            UPDATE user_preferences
            SET theme = 'light'
            WHERE theme = 'sunset'
            """
        )
    )
