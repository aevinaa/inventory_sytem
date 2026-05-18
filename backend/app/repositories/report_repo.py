from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, date, timedelta
from app.models.sale import Sale
from app.models.product import Product


class ReportRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_total_products(self, shop_id: str | None = None) -> int:
        query = select(func.count(Product.id)).where(Product.is_active == True)
        if shop_id:
            query = query.where(Product.shop_id == shop_id)
        result = await self.db.scalar(query)
        return result or 0

    async def get_low_stock_products(self, shop_id: str | None = None) -> list[Product]:
        query = select(Product).where(
            Product.is_active == True,
            Product.quantity <= Product.low_stock_threshold,
        ).order_by(Product.quantity.asc())
        if shop_id:
            query = query.where(Product.shop_id == shop_id)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_today_sales(self, shop_id: str | None = None) -> dict:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        query = select(
            func.count(Sale.id).label("total_transactions"),
            func.sum(Sale.quantity_sold).label("total_units"),
        ).where(
            Sale.sold_at >= today_start,
            Sale.sold_at < today_end,
        )
        if shop_id:
            query = query.where(Sale.shop_id == shop_id)

        result = await self.db.execute(query)
        row = result.one()
        return {
            "total_transactions": row.total_transactions or 0,
            "total_units_sold": row.total_units or 0,
        }

    async def get_daily_sales(self, target_date: date, shop_id: str | None = None) -> list[dict]:
        day_start = datetime.combine(target_date, datetime.min.time())
        day_end = day_start + timedelta(days=1)

        query = select(
            Sale.id,
            Sale.quantity_sold,
            Sale.sold_at,
            Product.name.label("product_name"),
            Product.sku,
            Product.barcode,
        ).join(Product, Sale.product_id == Product.id).where(
            Sale.sold_at >= day_start,
            Sale.sold_at < day_end,
        )
        if shop_id:
            query = query.where(Sale.shop_id == shop_id)

        result = await self.db.execute(query.order_by(Sale.sold_at.desc()))
        rows = result.all()
        return [
            {
                "id": row.id,
                "product_name": row.product_name,
                "sku": row.sku,
                "barcode": row.barcode,
                "quantity_sold": row.quantity_sold,
                "sold_at": row.sold_at.isoformat(),
            }
            for row in rows
        ]

    async def get_sales_trend(self, days: int = 30, shop_id: str | None = None) -> list[dict]:
        start_date = datetime.utcnow() - timedelta(days=days)

        query = select(
            func.date(Sale.sold_at).label("sale_date"),
            func.count(Sale.id).label("transactions"),
            func.sum(Sale.quantity_sold).label("units_sold"),
        ).where(Sale.sold_at >= start_date)
        if shop_id:
            query = query.where(Sale.shop_id == shop_id)

        query = query.group_by(func.date(Sale.sold_at)).order_by(func.date(Sale.sold_at).asc())
        result = await self.db.execute(query)
        rows = result.all()
        return [
            {
                "date": str(row.sale_date),
                "transactions": row.transactions,
                "units_sold": row.units_sold,
            }
            for row in rows
        ]

    async def get_top_selling_products(self, days: int = 30, limit: int = 10, shop_id: str | None = None) -> list[dict]:
        start_date = datetime.utcnow() - timedelta(days=days)

        query = select(
            Product.id,
            Product.name,
            Product.sku,
            Product.quantity,
            func.sum(Sale.quantity_sold).label("total_sold"),
        ).join(Sale, Sale.product_id == Product.id).where(Sale.sold_at >= start_date)
        if shop_id:
            query = query.where(Sale.shop_id == shop_id)

        query = query.group_by(
            Product.id, Product.name, Product.sku, Product.quantity
        ).order_by(func.sum(Sale.quantity_sold).desc()).limit(limit)

        result = await self.db.execute(query)
        rows = result.all()
        return [
            {
                "id": row.id,
                "name": row.name,
                "sku": row.sku,
                "current_quantity": row.quantity,
                "total_sold": row.total_sold,
            }
            for row in rows
        ]

    async def get_sales_for_export(self, date_from: date, date_to: date, shop_id: str | None = None) -> list[dict]:
        start = datetime.combine(date_from, datetime.min.time())
        end = datetime.combine(date_to, datetime.max.time())

        query = select(
            Sale.id,
            Sale.quantity_sold,
            Sale.sold_at,
            Product.name.label("product_name"),
            Product.sku,
            Product.barcode,
        ).join(Product, Sale.product_id == Product.id).where(
            Sale.sold_at >= start,
            Sale.sold_at <= end,
        )
        if shop_id:
            query = query.where(Sale.shop_id == shop_id)

        result = await self.db.execute(query.order_by(Sale.sold_at.desc()))
        rows = result.all()
        return [
            {
                "Date": row.sold_at.strftime("%Y-%m-%d %H:%M"),
                "Product": row.product_name,
                "SKU": row.sku,
                "Barcode": row.barcode,
                "Qty Sold": row.quantity_sold,
            }
            for row in rows
        ]

    async def get_inventory_for_export(self, shop_id: str | None = None) -> list[dict]:
        query = select(Product).where(Product.is_active == True)
        if shop_id:
            query = query.where(Product.shop_id == shop_id)
        query = query.order_by(Product.name.asc())

        result = await self.db.execute(query)
        products = result.scalars().all()
        return [
            {
                "Name": p.name,
                "SKU": p.sku,
                "Barcode": p.barcode or "",
                "Quantity": p.quantity,
                "Low Stock Threshold": p.low_stock_threshold,
                "Unit": p.unit,
                "Status": "LOW STOCK" if p.quantity <= p.low_stock_threshold else "OK",
            }
            for p in products
        ]