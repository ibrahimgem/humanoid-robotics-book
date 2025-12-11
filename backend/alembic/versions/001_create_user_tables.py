"""Create user and user profile tables

Revision ID: 001_create_user_tables
Revises:
Create Date: 2025-12-10 16:20:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001_create_user_tables'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create user_profiles table
    op.create_table('user_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('software_experience', sa.String(), nullable=True),
        sa.Column('hardware_experience', sa.String(), nullable=True),
        sa.Column('experience_level', sa.String(), nullable=True),
        sa.Column('preferred_language', sa.String(), nullable=True),
        sa.Column('learning_goals', sa.String(), nullable=True),
        sa.Column('personalization_settings', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    # Drop user_profiles table
    op.drop_table('user_profiles')

    # Drop users table
    op.drop_table('users')