from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict


class LowStockProduct(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    stock_quantity: int


class RevenueByMonth(BaseModel):
    month: str
    year: int
    revenue: Decimal


class OrderStatusCount(BaseModel):
    status: str
    count: int


class TopProduct(BaseModel):
    id: int
    name: str
    total_sold: int


class RecentOrder(BaseModel):
    id: int
    customer_name: str
    total_amount: Decimal
    status: str
    order_date: str


class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: Decimal
    low_stock_products: List[LowStockProduct]
    revenue_by_month: List[RevenueByMonth]
    order_status_distribution: List[OrderStatusCount]
    top_products: List[TopProduct]
    recent_orders: List[RecentOrder]
