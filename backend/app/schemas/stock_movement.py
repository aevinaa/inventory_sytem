from pydantic import BaseModel
from datetime import datetime


class StockAdjustRequest(BaseModel):
    """
    Manual stock adjustment by admin/staff.
    Use positive delta to add stock, negative to remove.
    """
    product_id: str
    quantity_delta: int          # e.g. +50 for purchase, -5 for damage
    movement_type: str = "adjustment"  # purchase|adjustment|return|damage
    note: str | None = None


class StockMovementOut(BaseModel):
    id: str
    product_id: str
    movement_type: str
    quantity_delta: int
    quantity_before: int
    quantity_after: int
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}