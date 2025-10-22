from __future__ import annotations

import uuid
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from .common import TimestampModel


class ProductCreate(BaseModel):
    seller_id: uuid.UUID
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    price: Decimal
    currency: str = Field(default="USD", min_length=3, max_length=3)
    stock_quantity: int = Field(ge=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    description: str | None = None
    price: Decimal | None = None
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    stock_quantity: int | None = Field(default=None, ge=0)


class ProductOut(TimestampModel):
    id: uuid.UUID
    seller_id: uuid.UUID
    name: str
    description: str | None
    price: Decimal
    currency: str
    stock_quantity: int

    model_config = ConfigDict(from_attributes=True)
