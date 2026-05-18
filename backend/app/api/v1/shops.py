from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db, get_current_user, require_admin
from app.models.shop import Shop
from pydantic import BaseModel

router = APIRouter()


class ShopOut(BaseModel):
    id: str
    name: str
    address: str | None
    is_active: bool
    model_config = {"from_attributes": True}


class ShopCreate(BaseModel):
    name: str
    address: str | None = None


@router.get("", response_model=list[ShopOut])
async def list_shops(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Shop).where(Shop.is_active == True))
    return result.scalars().all()


@router.post("", response_model=ShopOut)
async def create_shop(
    data: ShopCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_admin),
):
    shop = Shop(name=data.name, address=data.address)
    db.add(shop)
    await db.commit()
    await db.refresh(shop)
    return shop