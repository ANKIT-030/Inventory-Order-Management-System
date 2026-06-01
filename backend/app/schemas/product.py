from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    price: Decimal = Field(gt=0)
    stock_quantity: int = Field(ge=0, default=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, gt=0)
    stock_quantity: Optional[int] = Field(default=None, ge=0)


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    description: Optional[str] = None
    price: Decimal
    stock_quantity: int
    created_at: datetime
