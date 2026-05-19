from pydantic import BaseModel
from datetime import datetime
from app.schemas.category import CategoryOut
from app.schemas.supplier import SupplierOut


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    category_id: str | None = None
    supplier_id: str | None = None
    unit: str = "piece"
    quantity: int = 0
    low_stock_threshold: int = 5
    shop_id: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category_id: str | None = None
    supplier_id: str | None = None
    unit: str | None = None
    low_stock_threshold: int | None = None
    is_active: bool | None = None


class ProductOut(BaseModel):
    id: str
    name: str
    sku: str
    barcode: str | None
    description: str | None
    unit: str
    quantity: int
    low_stock_threshold: int
    is_active: bool
    image_url: str | None
    category: CategoryOut | None
    supplier: SupplierOut | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    """Lighter version for list views — no nested objects."""
    id: str
    name: str
    sku: str
    barcode: str | None
    unit: str
    quantity: int
    low_stock_threshold: int
    is_active: bool
    image_url: str | None
    category_id: str | None
    supplier_id: str | None
    category: CategoryOut | None = None
    supplier: SupplierOut | None = None

    model_config = {"from_attributes": True}


class PaginatedProducts(BaseModel):
    items: list[ProductListOut]
    total: int
    page: int
    pages: int
    limit: int

