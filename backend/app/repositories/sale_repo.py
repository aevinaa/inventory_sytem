from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.sale import Sale
from app.models.stock_movement import StockMovement


class SaleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_sale(self, sale: Sale) -> Sale:
        self.db.add(sale)
        await self.db.flush()
        await self.db.refresh(sale)
        return sale

    async def create_movement(self, movement: StockMovement) -> StockMovement:
        self.db.add(movement)
        await self.db.flush()
        return movement

    async def get_sales(
        self,
        product_id: str | None = None,
        date_from=None,
        date_to=None,
        limit: int = 100,
    ) -> list[Sale]:
        query = select(Sale).order_by(Sale.sold_at.desc())

        if product_id:
            query = query.where(Sale.product_id == product_id)
        if date_from:
            query = query.where(Sale.sold_at >= date_from)
        if date_to:
            query = query.where(Sale.sold_at <= date_to)

        query = query.limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()