from __future__ import annotations

from fastapi import FastAPI

from .core.db import engine
from .models.base import Base

from .routers.customers import router as customers_router
from .routers.sellers import router as sellers_router
from .routers.products import router as products_router
from .routers.orders import router as orders_router
from .routers.delivery import router as delivery_router

app = FastAPI(title="E-Commerce API")


@app.get("/")
def read_root():
    return {"status": "ok", "app": "E-Commerce API"}


@app.on_event("startup")
def on_startup() -> None:
    # Import models so metadata is populated, then create tables for quick start
    from .models import customer, seller, product, order, delivery  # noqa: F401

    Base.metadata.create_all(bind=engine)

    # Include routers
    app.include_router(customers_router)
    app.include_router(sellers_router)
    app.include_router(products_router)
    app.include_router(orders_router)
    app.include_router(delivery_router)
