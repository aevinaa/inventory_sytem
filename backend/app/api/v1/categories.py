from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db, get_current_user
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryOut
import uuid
import re

router = APIRouter()


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text


@router.get("", response_model=list[CategoryOut])
async def list_categories(
    shop_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = select(Category).order_by(Category.name)
    if shop_id:
        query = query.where(Category.shop_id == shop_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=CategoryOut)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    slug = slugify(data.name)
    # Make slug unique if it already exists
    existing = await db.execute(select(Category).where(Category.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{str(uuid.uuid4())[:4]}"

    category = Category(
        name=data.name,
        slug=slug,
        parent_id=data.parent_id,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Category not found")
    await db.delete(category)
    await db.commit()
    return {"message": "Category deleted"}