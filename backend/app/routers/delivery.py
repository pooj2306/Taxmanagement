from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import DeliveryCompany, DeliveryPartner, Shipment, Order, ShipmentStatus

router = APIRouter(prefix="/delivery", tags=["delivery"])


@router.post("/companies", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_company(name: str, db: Session = Depends(get_db)):
    company = DeliveryCompany(name=name)
    db.add(company)
    db.commit()
    db.refresh(company)
    return {"id": str(company.id), "name": company.name}


@router.get("/companies", response_model=list[dict])
def list_companies(db: Session = Depends(get_db)):
    companies = db.query(DeliveryCompany).all()
    return [{"id": str(c.id), "name": c.name} for c in companies]


@router.post("/companies/{company_id}/partners", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_partner(company_id: uuid.UUID, name: str, phone: str | None = None, db: Session = Depends(get_db)):
    company = db.get(DeliveryCompany, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    partner = DeliveryPartner(company_id=company_id, name=name, phone=phone)
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return {"id": str(partner.id), "name": partner.name, "phone": partner.phone}


@router.post("/orders/{order_id}/ship", response_model=dict)
def create_shipment(order_id: uuid.UUID, partner_id: uuid.UUID | None = None, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    shipment = Shipment(order_id=order_id, partner_id=partner_id)
    db.add(shipment)
    order.status = "SHIPPED"
    db.add(order)
    db.commit()
    db.refresh(shipment)
    return {"id": str(shipment.id), "order_id": str(order.id), "status": shipment.status}


@router.post("/shipments/{shipment_id}/status", response_model=dict)
def update_shipment_status(shipment_id: uuid.UUID, status_value: str, db: Session = Depends(get_db)):
    if status_value not in {ShipmentStatus.PENDING, ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED}:
        raise HTTPException(status_code=400, detail="Invalid status")
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    shipment.status = status_value
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return {"id": str(shipment.id), "status": shipment.status}
