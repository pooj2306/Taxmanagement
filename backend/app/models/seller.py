from __future__ import annotations

import uuid
from typing import List

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Seller(TimestampMixin, Base):
    __tablename__ = "sellers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32))

    products: Mapped[List["Product"]] = relationship(
        back_populates="seller", cascade="all, delete-orphan"
    )
