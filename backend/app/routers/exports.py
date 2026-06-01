import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product

router = APIRouter(prefix="/exports", tags=["Exports"])

@router.get("/products/csv", dependencies=[Depends(get_current_user)])
async def export_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "SKU", "Description", "Price", "Stock Quantity", "Created At"])
    
    for p in products:
        writer.writerow([p.id, p.name, p.sku, p.description, p.price, p.stock_quantity, p.created_at])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"}
    )

@router.get("/customers/csv", dependencies=[Depends(get_current_user)])
async def export_customers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Customer))
    customers = result.scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Full Name", "Email", "Phone", "Address", "Created At"])
    
    for c in customers:
        writer.writerow([c.id, c.full_name, c.email, c.phone, c.address, c.created_at])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=customers.csv"}
    )

@router.get("/orders/csv", dependencies=[Depends(get_current_user)])
async def export_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).options(joinedload(Order.customer)))
    orders = result.scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Order ID", "Customer Name", "Order Date", "Total Amount", "Status", "Created At"])
    
    for o in orders:
        customer_name = o.customer.full_name if o.customer else "Deleted Customer"
        writer.writerow([o.id, customer_name, o.order_date, o.total_amount, o.status, o.created_at])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders.csv"}
    )
