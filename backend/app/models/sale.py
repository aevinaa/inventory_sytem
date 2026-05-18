import uuid
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from app.database import Base


class Sale(Base):
    """
    Records every sale event.
    Created automatically when a barcode is scanned at point-of-sale.
    """

    __tablename__ = "sales"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("products.id"),
        nullable=False,
        index=True,
    )
    quantity_sold: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Store the raw barcode string that was scanned — useful for debugging
    barcode_scanned: Mapped[str | None] = mapped_column(String(100))

    performed_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    sold_at: Mapped[datetime] = mapped_column(
        default= datetime.utcnow, index=True
    )

    product: Mapped["Product"] = relationship("Product")
    performer: Mapped["User | None"] = relationship("User")

    shop_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("shops.id"), nullable=True, index=True)