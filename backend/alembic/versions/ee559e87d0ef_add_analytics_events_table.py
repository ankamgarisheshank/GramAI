"""Add analytics events table for first-party tracking

Revision ID: ee559e87d0ef
Revises: dd449e86d9ce
Create Date: 2026-10-27 21:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'ee559e87d0ef'
down_revision: Union[str, None] = 'dd449e86d9ce'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'analytics_events',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('route', sa.String(length=255), nullable=True),
        sa.Column('scheme_id', sa.String(length=50), nullable=True),
        sa.Column('campaign_id', sa.String(length=100), nullable=True),
        sa.Column('session_id', sa.String(length=64), nullable=True),
        sa.Column('user_id', sa.Uuid(), nullable=True),
        sa.Column('label', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_analytics_events_user_id_users'), ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_analytics_events'))
    )
    op.create_index(op.f('ix_analytics_events_event_type'), 'analytics_events', ['event_type'], unique=False)
    op.create_index(op.f('ix_analytics_events_scheme_id'), 'analytics_events', ['scheme_id'], unique=False)
    op.create_index(op.f('ix_analytics_events_session_id'), 'analytics_events', ['session_id'], unique=False)
    op.create_index(op.f('ix_analytics_events_user_id'), 'analytics_events', ['user_id'], unique=False)
    op.create_index(op.f('ix_analytics_events_created_at'), 'analytics_events', ['created_at'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_analytics_events_created_at'), table_name='analytics_events')
    op.drop_index(op.f('ix_analytics_events_user_id'), table_name='analytics_events')
    op.drop_index(op.f('ix_analytics_events_session_id'), table_name='analytics_events')
    op.drop_index(op.f('ix_analytics_events_scheme_id'), table_name='analytics_events')
    op.drop_index(op.f('ix_analytics_events_event_type'), table_name='analytics_events')
    op.drop_table('analytics_events')
