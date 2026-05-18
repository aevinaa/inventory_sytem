from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.report_repo import ReportRepository
from app.services.export_service import generate_excel, generate_pdf


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ReportRepository(db)

    async def get_dashboard(self, shop_id: str | None = None) -> dict:
        total_products = await self.repo.get_total_products(shop_id)
        low_stock = await self.repo.get_low_stock_products(shop_id)
        today_sales = await self.repo.get_today_sales(shop_id)
        top_products = await self.repo.get_top_selling_products(days=30, limit=5, shop_id=shop_id)
        return {
            "total_products": total_products,
            "low_stock_count": len(low_stock),
            "today_transactions": today_sales["total_transactions"],
            "today_units_sold": today_sales["total_units_sold"],
            "top_selling_products": top_products,
        }

    async def get_daily_sales(self, target_date: date, shop_id: str | None = None) -> dict:
        sales = await self.repo.get_daily_sales(target_date, shop_id)
        return {
            "date": str(target_date),
            "total_transactions": len(sales),
            "total_units_sold": sum(s["quantity_sold"] for s in sales),
            "sales": sales,
        }

    async def get_sales_trend(self, days: int = 30, shop_id: str | None = None) -> list[dict]:
        return await self.repo.get_sales_trend(days, shop_id)

    async def get_low_stock(self, shop_id: str | None = None) -> list[dict]:
        products = await self.repo.get_low_stock_products(shop_id)
        return [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "barcode": p.barcode,
                "quantity": p.quantity,
                "low_stock_threshold": p.low_stock_threshold,
                "deficit": p.low_stock_threshold - p.quantity,
            }
            for p in products
        ]

    async def export_sales_excel(self, date_from: date, date_to: date, shop_id: str | None = None) -> bytes:
        data = await self.repo.get_sales_for_export(date_from, date_to, shop_id)
        return generate_excel(data, sheet_name="Sales Report")

    async def export_sales_pdf(self, date_from: date, date_to: date, shop_id: str | None = None) -> bytes:
        data = await self.repo.get_sales_for_export(date_from, date_to, shop_id)
        return generate_pdf(data, title="Sales Report", date_from=date_from, date_to=date_to)

    async def export_inventory_excel(self, shop_id: str | None = None) -> bytes:
        data = await self.repo.get_inventory_for_export(shop_id)
        return generate_excel(data, sheet_name="Inventory")

    async def export_inventory_pdf(self, shop_id: str | None = None) -> bytes:
        data = await self.repo.get_inventory_for_export(shop_id)
        return generate_pdf(data, title="Inventory Report")