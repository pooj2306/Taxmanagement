from __future__ import annotations

import uuid
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import Order, OrderItem, Product, Customer, Seller, OrderStatus
from ..schemas.order import OrderCreate, OrderOut, OrderOutItem

router = APIRouter(prefix="/orders", tags=["orders"])


def _calculate_total(items: list[OrderItem]) -> Decimal:
    total = Decimal("0.00")
    for it in items:
        total += it.unit_price * it.quantity
    return total


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.get(Customer, payload.customer_id)
    seller = db.get(Seller, payload.seller_id)
    if not customer:
        raise HTTPException(status_code=400, detail="Customer not found")
    if not seller:
        raise HTTPException(status_code=400, detail="Seller not found")

    order = Order(customer_id=payload.customer_id, seller_id=payload.seller_id, currency=payload.currency)

    items: list[OrderItem] = []
    for item in payload.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        if product.seller_id != payload.seller_id:
            raise HTTPException(status_code=400, detail="Product does not belong to seller")
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        order_item = OrderItem(product_id=product.id, quantity=item.quantity, unit_price=product.price)
        items.append(order_item)
        product.stock_quantity -= item.quantity
        db.add(product)

    order.items = items
    order.total_amount = _calculate_total(items)

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(order_id: uuid.UUID, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status in (OrderStatus.SHIPPED, OrderStatus.DELIVERED):
        raise HTTPException(status_code=400, detail="Cannot cancel shipped/delivered order")
    order.status = OrderStatus.CANCELLED
    # Restock
    for item in order.items:
        product = db.get(Product, item.product_id)
        if product:
            product.stock_quantity += item.quantity
            db.add(product)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
