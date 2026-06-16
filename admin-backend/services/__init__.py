"""
services/__init__.py
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
from .user_service import (
    create_admin_user, create_employee, get_admin_user_by_id, get_admin_user_by_email,
    get_all_admin_users, update_admin_user, deactivate_admin_user, record_login,
)

__all__ = [
    "create_restaurant", "get_restaurant", "get_all_restaurants",
    "update_restaurant", "delete_restaurant", "toggle_restaurant_status", "verify_restaurant",
    "add_menu_item", "get_menu_item", "get_menu",
    "update_menu_item", "delete_menu_item", "toggle_availability",
    "create_order", "get_order", "get_orders",
    "update_order_status", "mark_order_paid", "get_daily_summary",
    "create_admin_user", "create_employee", "get_admin_user_by_id", "get_admin_user_by_email",
    "get_all_admin_users", "update_admin_user", "deactivate_admin_user", "record_login",
]
