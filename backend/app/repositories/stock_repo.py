from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.stock_movement import StockMovement


class StockRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_movement(self, movement: StockMovement) -> StockMovement:
        self.db.add(movement)
        await self.db.flush()
        return movement

    async def get_product_history(
        self, product_id: str, limit: int = 50
    ) -> list[StockMovement]:
        result = await self.db.execute(
            select(StockMovement)
            .where(StockMovement.product_id == product_id)
            .order_by(StockMovement.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()