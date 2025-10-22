from __future__ import annotations

import uuid
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from .common import TimestampModel


class CustomerCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = Field(default="US", min_length=2, max_length=2)


class CustomerUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=255)
    phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = Field(default=None, min_length=2, max_length=2)


class CustomerOut(TimestampModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    phone: str | None
    address_line1: str | None
    address_line2: str | None
    city: str | None
    state: str | None
    postal_code: str | None
    country: str | None

    model_config = ConfigDict(from_attributes=True)
