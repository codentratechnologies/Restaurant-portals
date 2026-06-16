"""
services/__init__.py — Restaurant Backend
"""
from .restaurant_service import (
    create_restaurant, get_restaurant, get_all_restaurants,
    update_restaurant, delete_restaurant, toggle_restaurant_status, verify_restaurant,
)
from .menu_service import (
    add_menu_item, get_menu_item, get_menu,
    update_menu_item, delete_menu_item, toggle_availability,
)
from .order_service import (
    create_order, get_order, get_orders,
    update_order_status, mark_order_paid, get_daily_summary,
)

__all__ = [
    "create_restaurant", "get_restaurant", "get_all_restaurants",
    "update_restaurant", "delete_restaurant", "toggle_restaurant_status", "verify_restaurant",
    "add_menu_item", "get_menu_item", "get_menu",
    "update_menu_item", "delete_menu_item", "toggle_availability",
    "create_order", "get_order", "get_orders",
    "update_order_status", "mark_order_paid", "get_daily_summary",
]
