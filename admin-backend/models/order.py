"""
Order Model
------------
Represents a customer order.
Collection: `restaurants/{restaurant_id}/orders`
"""

from dataclasses import dataclass, field, asdict
from typing import Optional, List
from datetime import datetime


@dataclass
class OrderItem:
    menu_item_id: str
    name: str
    quantity: int
    unit_price: float
    total_price: float


@dataclass
class Order:
    restaurant_id: str
    customer_name: str
    customer_phone: str
    items: List[dict]              # list of OrderItem.to_dict()
    total_amount: float
    status: str = "pending"        # pending | accepted | preparing | ready | delivered | cancelled
    payment_method: str = "cash"   # cash | card | upi
    payment_status: str = "unpaid" # unpaid | paid
    table_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    id: Optional[str] = None

    def to_dict(self) -> dict:
        data = asdict(self)
        data.pop("id", None)
        return data

    @staticmethod
    def from_dict(doc_id: str, data: dict) -> "Order":
        data["id"] = doc_id
        return Order(**{k: v for k, v in data.items() if k in Order.__dataclass_fields__})
