from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user
from app.services.sale_service import SaleService
from app.schemas.sale import ScanSaleRequest, ManualSaleRequest, ScanResult

router = APIRouter()


def get_service(db: AsyncSession = Depends(get_db)) -> SaleService:
    return SaleService(db)


@router.post("/scan", response_model=ScanResult)
async def scan_barcode(
    payload: ScanSaleRequest,
    service: SaleService = Depends(get_service),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Main barcode scan endpoint.
    Called every time a product barcode is scanned.
    Deducts stock and returns product info + image.
    """
    result = await service.process_scan(
        barcode=payload.barcode,
        quantity=payload.quantity,
        shop_id=payload.shop_id,
        performed_by=current_user.id,
    )
    await db.commit()
    return result


@router.post("/manual", response_model=ScanResult)
async def manual_sale(
    payload: ManualSaleRequest,
    service: SaleService = Depends(get_service),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manual sale entry when barcode scanner isn't available."""
    result = await service.manual_sale(
        product_id=payload.product_id,
        quantity=payload.quantity,
        performed_by=current_user.id,
    )
    await db.commit()
    return result


@router.get("")
async def get_sales(
    product_id: str | None = None,
    limit: int = 100,
    service: SaleService = Depends(get_service),
    current_user=Depends(get_current_user),
):
    """Get sales history."""
    sales = await service.sale_repo.get_sales(
        product_id=product_id,
        limit=limit,
    )
    return sales