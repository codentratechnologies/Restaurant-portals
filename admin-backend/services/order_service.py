"""
Order Service (Realtime Database)
------------------------------------
CRUD + status management for orders.

Realtime DB structure:
    /restaurants/{restaurant_id}/orders
        /{order_id}
            restaurant_id, customer_name, customer_phone,
            items, total_amount, status, payment_method,
            payment_status, table_number, notes,
            created_at, updated_at
"""

from typing import Optional, List
from datetime import datetime, timezone
from firebase import get_ref
from models.order import Order

VALID_STATUSES = {"pending", "accepted", "preparing", "ready", "delivered", "cancelled"}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _order_root(restaurant_id: str) -> str:
    return f"restaurants/{restaurant_id}/orders"


def create_order(restaurant_id: str, data: dict) -> Order:
    """Create a new order under a restaurant."""
    data["restaurant_id"] = restaurant_id
    order = Order(**data)
    ref = get_ref(_order_root(restaurant_id)).push(order.to_dict())
    order.id = ref.key
    print(f"[OK] Order created -> ID: {ref.key}")
    return order


def get_order(restaurant_id: str, order_id: str) -> Optional[Order]:
    """Fetch a single order."""
    data = get_ref(f"{_order_root(restaurant_id)}/{order_id}").get()
    if data is None:
        print(f"[NOT FOUND] Order: {order_id}")
        return None
    return Order.from_dict(order_id, data)


def get_orders(
    restaurant_id: str,
    status: Optional[str] = None,
    limit: int = 50,
) -> List[Order]:
    """Get all orders for a restaurant, optionally filtered by status."""
    data = get_ref(_order_root(restaurant_id)).get()
    if not data:
        return []
    orders = [
        Order.from_dict(oid, odata)
        for oid, odata in data.items()
        if isinstance(odata, dict)
    ]
    # Filter by status if given
    if status:
        orders = [o for o in orders if o.status == status]
    # Sort by created_at descending (newest first)
    orders.sort(key=lambda o: o.created_at, reverse=True)
    return orders[:limit]


def update_order_status(restaurant_id: str, order_id: str, new_status: str) -> bool:
    """Update the status of an order."""
    if new_status not in VALID_STATUSES:
        print(f"[ERROR] Invalid status: '{new_status}'. Must be one of: {VALID_STATUSES}")
        return False
    ref = get_ref(f"{_order_root(restaurant_id)}/{order_id}")
    if ref.get() is None:
        print(f"[NOT FOUND] Order: {order_id}")
        return False
    ref.update({"status": new_status, "updated_at": _now()})
    print(f"[OK] Order {order_id} -> status: {new_status}")
    return True


def mark_order_paid(restaurant_id: str, order_id: str) -> bool:
    """Mark an order as paid."""
    ref = get_ref(f"{_order_root(restaurant_id)}/{order_id}")
    if ref.get() is None:
        print(f"[NOT FOUND] Order: {order_id}")
        return False
    ref.update({"payment_status": "paid", "updated_at": _now()})
    print(f"[OK] Order {order_id} marked as paid")
    return True


def get_daily_summary(restaurant_id: str, date_str: str) -> dict:
    """
    Summarize orders for a given date.
    date_str: 'YYYY-MM-DD'
    """
    all_orders = get_orders(restaurant_id, limit=1000)
    day_orders = [o for o in all_orders if o.created_at.startswith(date_str)]
    paid_orders = [o for o in day_orders if o.payment_status == "paid"]
    return {
        "date": date_str,
        "total_orders": len(day_orders),
        "total_revenue": sum(o.total_amount for o in paid_orders),
        "pending": sum(1 for o in day_orders if o.status == "pending"),
        "delivered": sum(1 for o in day_orders if o.status == "delivered"),
        "cancelled": sum(1 for o in day_orders if o.status == "cancelled"),
    }
