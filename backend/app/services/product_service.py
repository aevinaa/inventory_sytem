from app.api.v1 import products
import math
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product
from app.repositories.product_repo import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, PaginatedProducts
from app.services.cloudinary_service import upload_product_image, delete_product_image
from app.core.exceptions import NotFoundError, ConflictError

# SKU prefix per category type
# You can expand this as needed
SKU_PREFIXES = {
    "jewellery": "JWL",
    "jewel": "JWL",
    "handicraft": "HND",
    "statue": "HND",
    "clothing": "CLT",
    "clothes": "CLT",
    "default": "PRD",
}


def get_sku_prefix(category_name: str | None) -> str:
    if not category_name:
        return SKU_PREFIXES["default"]
    lower = category_name.lower()
    for key, prefix in SKU_PREFIXES.items():
        if key in lower:
            return prefix
    return SKU_PREFIXES["default"]


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ProductRepository(db)

    async def get_products(
        self,
        page: int = 1,
        limit: int = 50,
        search: str | None = None,
        category_id: str | None = None,
        supplier_id: str | None = None,
        low_stock_only: bool = False,
        shop_id: str | None = None,
    ) -> PaginatedProducts:
        limit = min(limit, 100)
        items, total = await self.repo.get_all(
            page=page,
            limit=limit,
            search=search,
            category_id=category_id,
            supplier_id=supplier_id,
            low_stock_only=low_stock_only,
            shop_id=shop_id,
        )
        return PaginatedProducts(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=math.ceil(total / limit) if total > 0 else 1,
        )

    async def get_product(self, product_id: str) -> Product:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise NotFoundError(f"Product not found")
        return product

    async def get_by_barcode(self, barcode: str) -> Product:
        product = await self.repo.get_by_barcode(barcode)
        if not product:
            raise NotFoundError(f"No product found with barcode: {barcode}")
        return product

    async def create_product(
        self,
        data: ProductCreate,
        created_by: str,
        category_name: str | None = None,
    ) -> Product:
        # Generate SKU
        prefix = get_sku_prefix(category_name)
        last_num = await self.repo.get_last_sku_number(prefix)
        sku = f"{prefix}-{str(last_num + 1).zfill(3)}"

        existing = await self.repo.get_by_sku(sku)
        if existing:
            sku = f"{prefix}-{str(last_num + 2).zfill(3)}"

        # Generate sequential barcode number
        last_barcode = await self.repo.get_last_barcode_number()
        barcode = str(last_barcode + 1)

        product = Product(
            name=data.name,
            sku=sku,
            barcode=barcode,          # auto-assigned
            description=data.description,
            category_id=data.category_id,
            supplier_id=data.supplier_id,
            unit=data.unit,
            quantity=data.quantity,
            low_stock_threshold=data.low_stock_threshold,
            created_by=created_by,
        )

        async with self.db.begin_nested():
            product = await self.repo.create(product)

        return product

    async def update_product(
        self, product_id: str, data: ProductUpdate
    ) -> Product:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")

        # Only update fields that were actually sent
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)

        async with self.db.begin_nested():
            product = await self.repo.update(product)

        return product

    async def upload_image(self, product_id: str, file: UploadFile) -> Product:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")

        # Delete old image from Cloudinary if exists
        if product.image_public_id:
            await delete_product_image(product.image_public_id)

        # Upload new image
        result = await upload_product_image(file, product_id)

        product.image_url = result["url"]
        product.image_public_id = result["public_id"]

        async with self.db.begin_nested():
            product = await self.repo.update(product)

        return product

    async def delete_product(self, product_id: str) -> None:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")

        # Delete image from Cloudinary
        if product.image_public_id:
            await delete_product_image(product.image_public_id)

        # Soft delete — just mark inactive
        product.is_active = False
        async with self.db.begin_nested():
            await self.repo.update(product)