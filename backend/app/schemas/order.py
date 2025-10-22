from __future__ import annotations

import uuid
from decimal import Decimal
from datetime import datetime
from typing import List

from pydantic import BaseModel, Field, ConfigDict


class OrderItemIn(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    customer_id: uuid.UUID
    seller_id: uuid.UUID
    currency: str = Field(default="USD", min_length=3, max_length=3)
    items: List[OrderItemIn]


class OrderOutItem(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    unit_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    seller_id: uuid.UUID
    status: str
    total_amount: Decimal
    currency: str
    placed_at: datetime
    items: List[OrderOutItem]

    model_config = ConfigDict(from_attributes=True)
