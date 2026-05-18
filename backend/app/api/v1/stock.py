from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user, require_admin
from app.repositories.product_repo import ProductRepository
from app.repositories.stock_repo import StockRepository
from app.models.stock_movement import StockMovement
from app.schemas.stock_movement import StockAdjustRequest, StockMovementOut
from app.core.exceptions import NotFoundError, InsufficientStockError

router = APIRouter()


@router.post("/adjust", response_model=StockMovementOut)
async def adjust_stock(
    payload: StockAdjustRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_admin),
):
    """
    Manually adjust stock for a product.
    Use positive delta to add stock (purchase/return).
    Use negative delta to remove stock (damage/loss).
    """
    product_repo = ProductRepository(db)
    stock_repo = StockRepository(db)

    product = await product_repo.get_by_id(payload.product_id)
    if not product:
        raise NotFoundError("Product not found")

    quantity_before = product.quantity
    quantity_after = product.quantity + payload.quantity_delta

    if quantity_after < 0:
        raise InsufficientStockError(available=product.quantity)

    # Update product quantity
    product.quantity = quantity_after
    await db.flush()

    # Record in ledger
    movement = StockMovement(
        product_id=product.id,
        movement_type=payload.movement_type,
        quantity_delta=payload.quantity_delta,
        quantity_before=quantity_before,
        quantity_after=quantity_after,
        note=payload.note,
        performed_by=current_user.id,
    )

    movement = await stock_repo.create_movement(movement)
    await db.commit()
    return movement


@router.get("/{product_id}/history", response_model=list[StockMovementOut])
async def get_stock_history(
    product_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Full stock movement history for a product."""
    stock_repo = StockRepository(db)
    return await stock_repo.get_product_history(product_id, limit)