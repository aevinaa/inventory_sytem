import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Text, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # SKU = Stock Keeping Unit. Your internal product code e.g. "JWL-001"
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)

    # barcode = the value encoded in the barcode sticker on the product
    barcode: Mapped[str | None] = mapped_column(String(100), unique=True, index=True)

    description: Mapped[str | None] = mapped_column(Text)

    category_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    supplier_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("suppliers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Cloudinary image URL and public_id (needed to delete the image later)
    image_url: Mapped[str | None] = mapped_column(Text)
    image_public_id: Mapped[str | None] = mapped_column(Text)

    # unit = how the product is measured: piece, gram, kg, meter, etc.
    unit: Mapped[str] = mapped_column(String(30), default="piece")

    # Current stock count (always updated atomically with stock_movements)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Alert fires when quantity drops to or below this number
    low_stock_threshold: Mapped[int] = mapped_column(Integer, nullable=False, default=5)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_by: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        default= datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        default= datetime.utcnow,
        onupdate= datetime.utcnow,
    )

    # Relationships — lets you do product.category.name etc.
    category: Mapped["Category | None"] = relationship("Category")
    supplier: Mapped["Supplier | None"] = relationship("Supplier")
    creator: Mapped["User | None"] = relationship("User")

    __table_args__ = (
        # Index on quantity speeds up "show me all low-stock products" queries
        Index("idx_products_quantity", "quantity"),
    )

    shop_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("shops.id"), nullable=True, index=True)
    shop: Mapped["Shop | None"] = relationship("Shop")