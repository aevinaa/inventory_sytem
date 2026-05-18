import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    # slug is a URL-safe version of the name e.g. "Gold Jewellery" → "gold-jewellery"
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)

    # parent_id allows subcategories e.g. "Rings" under "Jewellery"
    parent_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        default= datetime.utcnow
    )

    # Self-referencing relationship for subcategories
    parent: Mapped["Category | None"] = relationship(
        "Category", remote_side="Category.id", back_populates="children"
    )
    children: Mapped[list["Category"]] = relationship(
        "Category", back_populates="parent"
    )

    shop_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("shops.id"), nullable=True)