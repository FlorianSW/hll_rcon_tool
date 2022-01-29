"""added weapons most killed and death by

Revision ID: d6da533e38e1
Revises: ec5fc1135ddb
Create Date: 2021-05-09 22:49:41.244941

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd6da533e38e1'
down_revision = 'ec5fc1135ddb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('log_lines', sa.Column('weapon', sa.String(), nullable=True))
    op.add_column('player_stats', sa.Column('death_by', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('player_stats', sa.Column('most_killed', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('player_stats', sa.Column('name', sa.String(), nullable=True))
    op.add_column('player_stats', sa.Column('weapons', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('player_stats', 'weapons')
    op.drop_column('player_stats', 'name')
    op.drop_column('player_stats', 'most_killed')
    op.drop_column('player_stats', 'death_by')
    op.drop_column('log_lines', 'weapon')
    # ### end Alembic commands ###