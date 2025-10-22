from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class OrderStatus:
    PENDING = "PENDING"
    PAID = "PAID"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), index=True)
    seller_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sellers.id", ondelete="RESTRICT"), index=True)

    status: Mapped[str] = mapped_column(String(32), default=OrderStatus.PENDING, index=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    placed_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    customer: Mapped["Customer"] = relationship(back_populates="orders")
    seller: Mapped["Seller"] = relationship()

    items: Mapped[List["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    shipment: Mapped[Optional["Shipment"]] = relationship(back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), index=True)

    quantity: Mapped[int] = mapped_column(default=1)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped[Order] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="order_items")
