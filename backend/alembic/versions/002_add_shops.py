"""add shops

Revision ID: 002_add_shops
Revises: 448893cbde60
Create Date: 2026-05-17

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_add_shops'
down_revision: Union[str, None] = '448893cbde60'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # shops table already exists — skip creating it
    # Just add shop_id columns to existing tables

    op.add_column('products', sa.Column('shop_id', sa.String(36), nullable=True))
    op.create_foreign_key('fk_products_shop', 'products', 'shops', ['shop_id'], ['id'])
    op.create_index('ix_products_shop_id', 'products', ['shop_id'])

    op.add_column('sales', sa.Column('shop_id', sa.String(36), nullable=True))
    op.create_foreign_key('fk_sales_shop', 'sales', 'shops', ['shop_id'], ['id'])
    op.create_index('ix_sales_shop_id', 'sales', ['shop_id'])

    op.add_column('suppliers', sa.Column('shop_id', sa.String(36), nullable=True))
    op.create_foreign_key('fk_suppliers_shop', 'suppliers', 'shops', ['shop_id'], ['id'])

    op.add_column('categories', sa.Column('shop_id', sa.String(36), nullable=True))
    op.create_foreign_key('fk_categories_shop', 'categories', 'shops', ['shop_id'], ['id'])

    op.add_column('users', sa.Column('shop_id', sa.String(36), nullable=True))
    op.create_foreign_key('fk_users_shop', 'users', 'shops', ['shop_id'], ['id'])

def downgrade() -> None:
    op.drop_column('users', 'shop_id')
    op.drop_column('categories', 'shop_id')
    op.drop_column('suppliers', 'shop_id')
    op.drop_column('sales', 'shop_id')
    op.drop_column('products', 'shop_id')
    op.drop_table('shops')