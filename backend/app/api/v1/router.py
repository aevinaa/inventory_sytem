from fastapi import APIRouter
from app.api.v1 import (
    auth, products, categories,
    suppliers, sales, stock, reports, users, shops
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(shops.router, prefix="/shops", tags=["Shops"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
api_router.include_router(sales.router, prefix="/sales", tags=["Sales"])
api_router.include_router(stock.router, prefix="/stock", tags=["Stock"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])