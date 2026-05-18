from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product
from app.models.sale import Sale
from app.models.stock_movement import StockMovement
from app.repositories.product_repo import ProductRepository
from app.repositories.sale_repo import SaleRepository
from app.schemas.sale import ScanResult, SaleOut
from app.core.exceptions import NotFoundError, InsufficientStockError


class SaleService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.product_repo = ProductRepository(db)
        self.sale_repo = SaleRepository(db)

    async def process_scan(
        self,
        barcode: str,
        quantity: int = 1,
        shop_id: str | None = None,
        performed_by: str | None = None,
    ) -> ScanResult:
        """
        Core barcode scan handler.
        1. Look up product by barcode
        2. Check stock is sufficient
        3. Deduct stock atomically
        4. Record sale + stock movement
        5. Return result with product info
        """
        # Step 1 — find product
        product = await self.product_repo.get_by_barcode(barcode, shop_id=shop_id)
        if not product:
            raise NotFoundError(f"No product found for barcode: {barcode}")

        # Step 2 — check stock
        if product.quantity < quantity:
            raise InsufficientStockError(available=product.quantity)

        quantity_before = product.quantity
        quantity_after = product.quantity - quantity

        # Step 3 — deduct stock
        product.quantity = quantity_after
        await self.db.flush()

        # Step 4 — record sale
        sale = Sale(
            product_id=product.id,
            quantity_sold=quantity,
            barcode_scanned=barcode,
            performed_by=performed_by,
            shop_id=product.shop_id
        )
        sale = await self.sale_repo.create_sale(sale)

        # Step 5 — record stock movement (immutable ledger)
        movement = StockMovement(
            product_id=product.id,
            movement_type="sale",
            quantity_delta=-quantity,
            quantity_before=quantity_before,
            quantity_after=quantity_after,
            reference_id=sale.id,
            performed_by=performed_by,
        )
        await self.sale_repo.create_movement(movement)

        # Step 6 — check low stock
        low_stock_alert = quantity_after <= product.low_stock_threshold

        return ScanResult(
            sale=SaleOut(
                id=sale.id,
                product_id=sale.product_id,
                quantity_sold=sale.quantity_sold,
                barcode_scanned=sale.barcode_scanned,
                sold_at=sale.sold_at,
            ),
            product_name=product.name,
            product_image=product.image_url,
            sku=product.sku,
            barcode=barcode,
            quantity_remaining=quantity_after,
            low_stock_alert=low_stock_alert,
        )

    async def manual_sale(
        self,
        product_id: str,
        quantity: int,
        performed_by: str | None = None,
    ) -> ScanResult:
        """Sale without barcode scan — uses product ID directly."""
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")

        if not product.barcode:
            barcode = product.sku
        else:
            barcode = product.barcode

        return await self.process_scan(
            barcode=barcode,
            quantity=quantity,
            shop_id=product.shop_id,
            performed_by=performed_by,
        )