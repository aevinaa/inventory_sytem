from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.product import Product


class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(
        self,
        page: int = 1,
        limit: int = 50,
        search: str | None = None,
        category_id: str | None = None,
        supplier_id: str | None = None,
        low_stock_only: bool = False,
        is_active: bool = True,
        shop_id: str | None = None,
    ) -> tuple[list[Product], int]:

        query = select(Product).where(Product.is_active == is_active)

        # Multi-shop filtering
        if shop_id:
            query = query.where(Product.shop_id == shop_id)

        # Search
        if search:
            query = query.where(
                Product.name.ilike(f"%{search}%")
            )

        # Filters
        if category_id:
            query = query.where(Product.category_id == category_id)

        if supplier_id:
            query = query.where(Product.supplier_id == supplier_id)

        # Low stock filter
        if low_stock_only:
            query = query.where(
                Product.quantity <= Product.low_stock_threshold
            )

        # Total count BEFORE pagination
        count_query = select(func.count()).select_from(
            query.subquery()
        )
        total = await self.db.scalar(count_query)

        # Pagination
        offset = (page - 1) * limit

        query = (
            query
            .options(
                selectinload(Product.category),
                selectinload(Product.supplier),
            )
            .order_by(Product.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.db.execute(query)

        return result.scalars().all(), total or 0

    async def get_by_id(
        self,
        product_id: str,
    ) -> Product | None:

        result = await self.db.execute(
            select(Product)
            .where(Product.id == product_id)
            .options(
                selectinload(Product.category),
                selectinload(Product.supplier),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_barcode(
        self,
        barcode: str,
        shop_id: str | None = None,
    ) -> Product | None:
        """
        Fetch product by barcode.
        Supports optional shop filtering for multi-shop safety.
        """

        query = select(Product).where(
            Product.barcode == barcode
        )

        # Prevent cross-shop scan issues
        if shop_id:
            query = query.where(Product.shop_id == shop_id)

        result = await self.db.execute(
            query.options(
                selectinload(Product.category),
                selectinload(Product.supplier),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_sku(
        self,
        sku: str,
    ) -> Product | None:

        result = await self.db.execute(
            select(Product).where(Product.sku == sku)
        )

        return result.scalar_one_or_none()

    async def get_last_sku_number(
        self,
        prefix: str,
    ) -> int:
        """
        Finds highest SKU number for a prefix.

        Example:
            JWL-042 -> returns 42
        """

        result = await self.db.execute(
            select(Product.sku)
            .where(Product.sku.like(f"{prefix}-%"))
            .order_by(Product.sku.desc())
            .limit(1)
        )

        last_sku = result.scalar_one_or_none()

        if not last_sku:
            return 0

        try:
            return int(last_sku.split("-")[-1])

        except ValueError:
            return 0

    async def create(
        self,
        product: Product,
    ) -> Product:

        self.db.add(product)

        # Flush gives generated ID before commit
        await self.db.flush()

        await self.db.refresh(product)

        return product

    async def update(
        self,
        product: Product,
    ) -> Product:

        await self.db.flush()

        await self.db.refresh(product)

        return product

    async def delete(
        self,
        product: Product,
    ) -> None:

        await self.db.delete(product)

        await self.db.flush()

    async def count_low_stock(
        self,
        shop_id: str | None = None,
    ) -> int:

        query = (
            select(func.count(Product.id))
            .where(Product.quantity <= Product.low_stock_threshold)
            .where(Product.is_active == True)
        )

        if shop_id:
            query = query.where(Product.shop_id == shop_id)

        result = await self.db.scalar(query)

        return result or 0

    async def get_last_barcode_number(self) -> int:
        """
        Finds highest numeric barcode.

        Barcodes are sequential:
            100001
            100002
            ...
        """

        result = await self.db.execute(
            select(Product.barcode)
            .where(Product.barcode.isnot(None))
            .where(Product.barcode.regexp_match(r"^\d+$"))
            .order_by(Product.barcode.desc())
            .limit(1)
        )

        last = result.scalar_one_or_none()

        if not last:
            return 100000

        try:
            return int(last)

        except ValueError:
            return 100000