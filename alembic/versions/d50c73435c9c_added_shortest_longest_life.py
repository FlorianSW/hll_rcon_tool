"""added shortest longest life

Revision ID: d50c73435c9c
Revises: 0184d8fc0100
Create Date: 2021-05-06 01:47:57.860554

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd50c73435c9c'
down_revision = '0184d8fc0100'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('player_stats', sa.Column('longest_life_secs', sa.Integer(), nullable=True))
    op.add_column('player_stats', sa.Column('shortest_life_secs', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('player_stats', 'shortest_life_secs')
    op.drop_column('player_stats', 'longest_life_secs')
    # ### end Alembic commands ###