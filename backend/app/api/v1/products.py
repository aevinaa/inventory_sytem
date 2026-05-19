from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user, require_admin
from app.services.product_service import ProductService
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductOut,
    ProductListOut, PaginatedProducts
)

router = APIRouter()


def get_service(db: AsyncSession = Depends(get_db)) -> ProductService:
    return ProductService(db)


@router.get("", response_model=PaginatedProducts)
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: str | None = Query(None),
    category_id: str | None = Query(None),
    supplier_id: str | None = Query(None),
    low_stock_only: bool = Query(False),
    shop_id: str | None = Query(None),
    service: ProductService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    return await service.get_products(
        page=page,
        limit=limit,
        search=search,
        category_id=category_id,
        supplier_id=supplier_id,
        low_stock_only=low_stock_only,
        shop_id=shop_id,
    )


@router.post("", response_model=ProductOut)
async def create_product(
    data: ProductCreate,
    shop_id: str,
    service: ProductService = Depends(get_service),
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new product. SKU is auto-generated."""
    data.shop_id = shop_id
    # Get category name for SKU prefix generation
    category_name = None
    if data.category_id:
        from sqlalchemy import select
        from app.models.category import Category
        result = await db.execute(
            select(Category).where(Category.id == data.category_id)
        )
        cat = result.scalar_one_or_none()
        if cat:
            category_name = cat.name

    product = await service.create_product(
        data=data,
        created_by=current_user.id,
        category_name=category_name,
    )
    await db.commit()
    return await service.get_product(product.id)


@router.get("/barcode/{barcode}", response_model=ProductOut)
async def get_by_barcode(
    barcode: str,
    service: ProductService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    """
    Look up a product by barcode.
    Called automatically when barcode is scanned.
    Returns full product details including image.
    """
    return await service.get_by_barcode(barcode)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(
    product_id: str,
    service: ProductService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    return await service.get_product(product_id)


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    service: ProductService = Depends(get_service),
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    product = await service.update_product(product_id, data)
    await db.commit()
    return await service.get_product(product.id)


@router.post("/{product_id}/image", response_model=ProductOut)
async def upload_image(
    product_id: str,
    file: UploadFile = File(...),
    service: ProductService = Depends(get_service),
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Upload or replace product image. Stores in Cloudinary."""
    product = await service.upload_image(product_id, file)
    await db.commit()
    return await service.get_product(product.id)


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    service: ProductService = Depends(get_service),
    current_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Soft delete — marks product inactive. Admin only."""
    await service.delete_product(product_id)
    await db.commit()
    return {"message": "Product deleted successfully"}
