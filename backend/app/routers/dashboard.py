from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.dashboard import (
    DashboardResponse,
    LowStockProduct,
    RevenueByMonth,
    OrderStatusCount,
    TopProduct,
    RecentOrder,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

MONTH_NAMES = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
    7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
}

@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardResponse:
    # Total products
    product_count_result = await db.execute(
        select(func.count()).select_from(Product)
    )
    total_products = product_count_result.scalar() or 0

    # Total customers
    customer_count_result = await db.execute(
        select(func.count()).select_from(Customer)
    )
    total_customers = customer_count_result.scalar() or 0

    # Total orders
    order_count_result = await db.execute(
        select(func.count()).select_from(Order)
    )
    total_orders = order_count_result.scalar() or 0

    # Total revenue
    revenue_result = await db.execute(
        select(func.sum(Order.total_amount))
    )
    total_revenue = revenue_result.scalar() or Decimal("0")

    # Low stock products (stock < 10)
    low_stock_result = await db.execute(
        select(Product).where(Product.stock_quantity < 10).order_by(Product.stock_quantity)
    )
    low_stock_products = [
        LowStockProduct.model_validate(p) for p in low_stock_result.scalars().all()
    ]
    
    # Revenue by Month
    month_extract = func.extract('month', Order.order_date).label("month")
    year_extract = func.extract('year', Order.order_date).label("year")
    rev_month_result = await db.execute(
        select(
            month_extract,
            year_extract,
            func.sum(Order.total_amount).label("revenue")
        )
        .group_by(year_extract, month_extract)
        .order_by(desc(year_extract), desc(month_extract))
        .limit(6)
    )
    revenue_by_month = []
    for row in rev_month_result.all():
        m_num = int(row.month) if row.month else 1
        y_num = int(row.year) if row.year else 2024
        revenue_by_month.append(RevenueByMonth(
            month=MONTH_NAMES.get(m_num, str(m_num)),
            year=y_num,
            revenue=row.revenue or Decimal("0")
        ))
    revenue_by_month.reverse() # Chronological order

    # Order Status Distribution
    status_result = await db.execute(
        select(Order.status, func.count(Order.id).label("count"))
        .group_by(Order.status)
    )
    order_status_distribution = [
        OrderStatusCount(status=r.status, count=r.count) for r in status_result.all()
    ]

    # Top Products
    top_prod_result = await db.execute(
        select(
            Product.id,
            Product.name,
            func.sum(OrderItem.quantity).label("total_sold")
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.id)
        .order_by(desc(func.sum(OrderItem.quantity)))
        .limit(5)
    )
    top_products = [
        TopProduct(id=r.id, name=r.name, total_sold=r.total_sold or 0)
        for r in top_prod_result.all()
    ]

    # Recent Orders
    recent_orders_result = await db.execute(
        select(Order)
        .options(joinedload(Order.customer))
        .order_by(desc(Order.order_date))
        .limit(5)
    )
    recent_orders = []
    for ro in recent_orders_result.scalars().all():
        recent_orders.append(RecentOrder(
            id=ro.id,
            customer_name=ro.customer.full_name if ro.customer else "Deleted Customer",
            total_amount=ro.total_amount,
            status=ro.status,
            order_date=str(ro.order_date)
        ))

    return DashboardResponse(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=total_revenue,
        low_stock_products=low_stock_products,
        revenue_by_month=revenue_by_month,
        order_status_distribution=order_status_distribution,
        top_products=top_products,
        recent_orders=recent_orders,
    )
