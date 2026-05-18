from pydantic import BaseModel
from datetime import datetime


class ScanSaleRequest(BaseModel):
    """Sent when barcode scanner reads a barcode."""
    barcode: str
    quantity: int = 1  # default deduct 1 unit
    shop_id: str


class ManualSaleRequest(BaseModel):
    """Manual sale entry without barcode."""
    product_id: str
    quantity: int = 1


class SaleOut(BaseModel):
    id: str
    product_id: str
    quantity_sold: int
    barcode_scanned: str | None
    sold_at: datetime

    model_config = {"from_attributes": True}


class ScanResult(BaseModel):
    """
    Returned after a successful barcode scan.
    Frontend uses this to show product info + confirm deduction.
    """
    sale: SaleOut
    product_name: str
    product_image: str | None
    sku: str
    barcode: str
    quantity_remaining: int
    low_stock_alert: bool