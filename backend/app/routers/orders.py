import math
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate
from app.schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/", response_model=PaginatedResponse[OrderResponse])
async def list_orders(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedResponse[OrderResponse]:
    from sqlalchemy import func

    # Count total
    count_result = await db.execute(select(func.count()).select_from(Order))
    total = count_result.scalar() or 0

    # Fetch orders with relationships
    offset = (page - 1) * page_size
    query = (
        select(Order)
        .options(
            joinedload(Order.customer),
            selectinload(Order.items).joinedload(OrderItem.product),
        )
        .order_by(Order.id)
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(query)
    orders = result.unique().scalars().all()

    pages = math.ceil(total / page_size) if total > 0 else 0

    return PaginatedResponse(
        items=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderResponse:
    query = (
        select(Order)
        .options(
            joinedload(Order.customer),
            selectinload(Order.items).joinedload(OrderItem.product),
        )
        .where(Order.id == order_id)
    )
    result = await db.execute(query)
    order = result.unique().scalar_one_or_none()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    return order


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderResponse:
    # 1. Verify customer exists
    customer_result = await db.execute(
        select(Customer).where(Customer.id == order_data.customer_id)
    )
    customer = customer_result.scalar_one_or_none()
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )

    # 2. Validate all products and stock
    order_items: list[OrderItem] = []
    total_amount = Decimal("0")

    for item_data in order_data.items:
        product_result = await db.execute(
            select(Product).where(Product.id == item_data.product_id)
        )
        product = product_result.scalar_one_or_none()
        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item_data.product_id} not found",
            )

        if product.stock_quantity < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient inventory for product {product.name} "
                    f"(available: {product.stock_quantity}, requested: {item_data.quantity})"
                ),
            )

        # Create order item
        order_item = OrderItem(
            product_id=product.id,
            quantity=item_data.quantity,
            unit_price=product.price,
        )
        order_items.append(order_item)

        # Calculate running total
        total_amount += Decimal(str(product.price)) * item_data.quantity

        # Decrement stock
        product.stock_quantity -= item_data.quantity

    # 3. Create the order
    new_order = Order(
        customer_id=order_data.customer_id,
        status="pending",
        total_amount=total_amount,
    )
    db.add(new_order)
    await db.flush()

    # 4. Attach items to order
    for order_item in order_items:
        order_item.order_id = new_order.id
        db.add(order_item)

    await db.flush()

    # 5. Reload with relationships
    reload_query = (
        select(Order)
        .options(
            joinedload(Order.customer),
            selectinload(Order.items).joinedload(OrderItem.product),
        )
        .where(Order.id == new_order.id)
    )
    reload_result = await db.execute(reload_query)
    created_order = reload_result.unique().scalar_one()
    return created_order


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderResponse:
    query = (
        select(Order)
        .options(
            joinedload(Order.customer),
            selectinload(Order.items).joinedload(OrderItem.product),
        )
        .where(Order.id == order_id)
    )
    result = await db.execute(query)
    order = result.unique().scalar_one_or_none()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    order.status = order_data.status
    await db.flush()
    await db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    # Load order with items and products
    query = (
        select(Order)
        .options(
            selectinload(Order.items).joinedload(OrderItem.product),
        )
        .where(Order.id == order_id)
    )
    result = await db.execute(query)
    order = result.unique().scalar_one_or_none()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    # Restore stock for each item
    for item in order.items:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        if product is not None:
            product.stock_quantity += item.quantity

    # Delete order (cascade deletes items)
    await db.delete(order)
    await db.flush()
