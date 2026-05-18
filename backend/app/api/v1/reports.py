from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
import io
from app.dependencies import get_db, get_current_user
from app.services.report_service import ReportService

router = APIRouter()


def get_service(db: AsyncSession = Depends(get_db)) -> ReportService:
    return ReportService(db)


@router.get("/dashboard")
async def dashboard(
    shop_id: str | None = None,
    service: ReportService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    return await service.get_dashboard(shop_id=shop_id)


@router.get("/daily-sales")
async def daily_sales(
    shop_id: str | None = None,
    target_date: date = Query(default=None),
    service: ReportService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    if not target_date:
        target_date = date.today()
    return await service.get_daily_sales(target_date, shop_id=shop_id)


@router.get("/sales-trend")
async def sales_trend(
    shop_id: str | None = None,
    days: int = Query(default=30, ge=7, le=365),
    service: ReportService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    return await service.get_sales_trend(days, shop_id=shop_id)


@router.get("/low-stock")
async def low_stock(
    shop_id: str | None = None,
    service: ReportService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    return await service.get_low_stock(shop_id=shop_id)


@router.get("/export/sales/excel")
async def export_sales_excel(
    shop_id: str | None = None,
    date_from: date = Query(...),
    date_to: date = Query(...),
    service: ReportService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    data = await service.export_sales_excel(date_from, date_to, shop_id=shop_id)
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=sales_{date_from}_to_{date_to}.xlsx"},
    )


@router.get("/export/sales/pdf")
async def export_sales_pdf(
    shop_id: str | None = None,
    date_from: date = Query(...),
    date_to: date = Query(...),
    service: ReportService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    data = await service.export_sales_pdf(date_from, date_to, shop_id=shop_id)
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=sales_{date_from}_to_{date_to}.pdf"},
    )


@router.get("/export/inventory/excel")
async def export_inventory_excel(
    shop_id: str | None = None,
    service: ReportService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    data = await service.export_inventory_excel(shop_id=shop_id)
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=inventory.xlsx"},
    )


@router.get("/export/inventory/pdf")
async def export_inventory_pdf(
    shop_id: str | None = None,
    service: ReportService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    data = await service.export_inventory_pdf(shop_id=shop_id)
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=inventory.pdf"},
    )