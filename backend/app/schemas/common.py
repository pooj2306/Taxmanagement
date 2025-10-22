from __future__ import annotations

import uuid
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field


class IDModel(BaseModel):
    id: uuid.UUID


class TimestampModel(BaseModel):
    created_at: datetime
    updated_at: datetime


class Money(BaseModel):
    amount: Decimal = Field(..., examples=["9.99"])  # precise decimals
    currency: str = Field(default="USD", min_length=3, max_length=3)
