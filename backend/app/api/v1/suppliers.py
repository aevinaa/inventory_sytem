from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db, get_current_user
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierOut

router = APIRouter()


@router.get("", response_model=list[SupplierOut])
async def list_suppliers(
    shop_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = select(Supplier).where(Supplier.is_active == True).order_by(Supplier.name)
    if shop_id:
        query = query.where(Supplier.shop_id == shop_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=SupplierOut)
async def create_supplier(
    data: SupplierCreate,
    shop_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    data.shop_id = shop_id
    print(data.model_dump())
    supplier = Supplier(
        **data.model_dump(),
        shop_id=data.shop_id)
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier


@router.get("/{supplier_id}", response_model=SupplierOut)
async def get_supplier(
    supplier_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Supplier not found")
    return supplier


@router.put("/{supplier_id}", response_model=SupplierOut)
async def update_supplier(
    supplier_id: str,
    data: SupplierUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Supplier not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(supplier, field, value)

    await db.commit()
    await db.refresh(supplier)
    return supplier


@router.delete("/{supplier_id}")
async def delete_supplier(
    supplier_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Supplier not found")
    supplier.is_active = False
    await db.commit()
    return {"message": "Supplier deactivated"}
