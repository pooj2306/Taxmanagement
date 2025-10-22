from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import Seller
from ..schemas.seller import SellerCreate, SellerUpdate, SellerOut

router = APIRouter(prefix="/sellers", tags=["sellers"])


@router.post("/", response_model=SellerOut, status_code=status.HTTP_201_CREATED)
def create_seller(payload: SellerCreate, db: Session = Depends(get_db)):
    existing = db.query(Seller).filter(Seller.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    seller = Seller(**payload.model_dump())
    db.add(seller)
    db.commit()
    db.refresh(seller)
    return seller


@router.get("/", response_model=list[SellerOut])
def list_sellers(db: Session = Depends(get_db)):
    return db.query(Seller).order_by(Seller.created_at.desc()).all()


@router.get("/{seller_id}", response_model=SellerOut)
def get_seller(seller_id: uuid.UUID, db: Session = Depends(get_db)):
    seller = db.get(Seller, seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    return seller


@router.patch("/{seller_id}", response_model=SellerOut)
def update_seller(seller_id: uuid.UUID, payload: SellerUpdate, db: Session = Depends(get_db)):
    seller = db.get(Seller, seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(seller, key, value)
    db.add(seller)
    db.commit()
    db.refresh(seller)
    return seller


@router.delete("/{seller_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_seller(seller_id: uuid.UUID, db: Session = Depends(get_db)):
    seller = db.get(Seller, seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    db.delete(seller)
    db.commit()
    return None
