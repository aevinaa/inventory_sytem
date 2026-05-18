import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from app.database import Base


class StockMovement(Base):
    """
    Immutable ledger of every stock change.
    Never update or delete rows here — only INSERT.
    This gives you complete audit history forever.

    movement_type options:
        purchase   → stock added from supplier
        sale       → stock deducted via barcode scan or manual
        adjustment → manual correction by admin
        return     → customer returned item, stock goes back up
        damage     → item damaged/lost, stock reduced
    """

    __tablename__ = "stock_movements"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    movement_type: Mapped[str] = mapped_column(String(20), nullable=False)

    # Positive = stock added, Negative = stock removed
    quantity_delta: Mapped[int] = mapped_column(Integer, nullable=False)

    # Snapshot of quantity before and after — critical for audit trail
    quantity_before: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity_after: Mapped[int] = mapped_column(Integer, nullable=False)

    # Links to the sale or purchase order that caused this movement
    reference_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    note: Mapped[str | None] = mapped_column(Text)
    performed_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        default= datetime.utcnow, index=True
    )

    product: Mapped["Product"] = relationship("Product")
    performer: Mapped["User | None"] = relationship("User")