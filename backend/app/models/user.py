import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(nullable=False)

    # role: "admin" can do everything
    #        "staff" can manage inventory but not users/settings
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="staff")

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        default= datetime.utcnow,
        onupdate= datetime.utcnow,
    )

    # null = admin (sees all shops), set = staff (for reference only)
    shop_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("shops.id"), nullable=True)