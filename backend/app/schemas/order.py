from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    product: ProductResponse


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(min_length=1)


class OrderUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"pending", "confirmed", "shipped", "delivered", "cancelled"}
        if v not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(sorted(allowed))}")
        return v


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    order_date: datetime
    total_amount: Decimal
    status: str
    created_at: datetime
    customer: CustomerResponse
    items: List[OrderItemResponse]
