"""add performance indexes

Revision ID: e2f3a4b5c6d7
Revises: d8e9f0a1b2c3
Create Date: 2026-04-25 13:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'e2f3a4b5c6d7'
down_revision = 'd8e9f0a1b2c3'
branch_labels = None
depends_on = None


def upgrade():
    # Add composite index for faster conversion stats lookup
    op.create_index(
        'idx_conversions_owner_action_status',
        'conversions',
        ['owner_user_id', 'action', 'status'],
        unique=False
    )
    
    # Add index for points ledger user queries
    op.create_index(
        'idx_points_ledger_user_status',
        'points_ledger',
        ['user_id', 'status'],
        unique=False
    )
    
    # Add index for user conversion permissions lookup
    op.create_index(
        'idx_user_permissions_user_allowed',
        'user_conversion_permissions',
        ['user_id', 'is_allowed'],
        unique=False
    )


def downgrade():
    op.drop_index('idx_conversions_owner_action_status', table_name='conversions')
    op.drop_index('idx_points_ledger_user_status', table_name='points_ledger')
    op.drop_index('idx_user_permissions_user_allowed', table_name='user_conversion_permissions')
