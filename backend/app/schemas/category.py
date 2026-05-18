from pydantic import BaseModel
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str
    parent_id: str | None = None
    shop_id: str | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    parent_id: str | None = None


class CategoryOut(BaseModel):
    id: str
    name: str
    slug: str
    parent_id: str | None

    model_config = {"from_attributes": True}