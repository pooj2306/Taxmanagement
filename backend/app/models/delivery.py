from __future__ import annotations

import uuid
from typing import List, Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class DeliveryCompany(TimestampMixin, Base):
    __tablename__ = "delivery_companies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    partners: Mapped[List["DeliveryPartner"]] = relationship(
        back_populates="company", cascade="all, delete-orphan"
    )


class DeliveryPartner(TimestampMixin, Base):
    __tablename__ = "delivery_partners"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("delivery_companies.id", ondelete="CASCADE"), index=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32))

    company: Mapped[DeliveryCompany] = relationship(back_populates="partners")
    shipments: Mapped[List["Shipment"]] = relationship(back_populates="partner")


class ShipmentStatus:
    PENDING = "PENDING"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Shipment(TimestampMixin, Base):
    __tablename__ = "shipments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    partner_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("delivery_partners.id", ondelete="SET NULL"), index=True)

    tracking_number: Mapped[Optional[str]] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(32), default=ShipmentStatus.PENDING, index=True)

    partner: Mapped[Optional["DeliveryPartner"]] = relationship(back_populates="shipments")
    order: Mapped["Order"] = relationship(back_populates="shipment")
