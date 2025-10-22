from __future__ import annotations

import uuid
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from .common import TimestampModel


class SellerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str | None = None


class SellerUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    phone: str | None = None


class SellerOut(TimestampModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str | None

    model_config = ConfigDict(from_attributes=True)
