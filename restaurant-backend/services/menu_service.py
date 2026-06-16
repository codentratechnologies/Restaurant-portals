"""
Menu Service (Realtime Database)
----------------------------------
CRUD operations for menu items.

Realtime DB structure:
    /restaurants/{restaurant_id}/menu_items
        /{item_id}
            name, description, price, category,
            is_available, is_vegetarian, is_vegan,
            image_url, tags, created_at, updated_at
"""

from typing import Optional, List
from datetime import datetime, timezone
from firebase import get_ref
from models.menu import MenuItem


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _menu_root(restaurant_id: str) -> str:
    return f"restaurants/{restaurant_id}/menu_items"


def add_menu_item(restaurant_id: str, data: dict) -> MenuItem:
    """Add a new menu item under a restaurant."""
    item = MenuItem(**data)
    ref = get_ref(_menu_root(restaurant_id)).push(item.to_dict())
    item.id = ref.key
    print(f"[OK] Menu item added -> {item.name} (ID: {ref.key})")
    return item


def get_menu_item(restaurant_id: str, item_id: str) -> Optional[MenuItem]:
    """Fetch a single menu item."""
    data = get_ref(f"{_menu_root(restaurant_id)}/{item_id}").get()
    if data is None:
        print(f"[NOT FOUND] Menu item: {item_id}")
        return None
    return MenuItem.from_dict(item_id, data)


def get_menu(restaurant_id: str, category: Optional[str] = None) -> List[MenuItem]:
    """Get all menu items for a restaurant, optionally filtered by category."""
    data = get_ref(_menu_root(restaurant_id)).get()
    if not data:
        return []
    items = [
        MenuItem.from_dict(iid, idata)
        for iid, idata in data.items()
        if isinstance(idata, dict)
    ]
    if category:
        items = [i for i in items if i.category == category]
    return items


def update_menu_item(restaurant_id: str, item_id: str, updates: dict) -> bool:
    """Update a menu item."""
    ref = get_ref(f"{_menu_root(restaurant_id)}/{item_id}")
    if ref.get() is None:
        print(f"[NOT FOUND] Menu item: {item_id}")
        return False
    updates["updated_at"] = _now()
    ref.update(updates)
    print(f"[OK] Menu item updated -> ID: {item_id}")
    return True


def delete_menu_item(restaurant_id: str, item_id: str) -> bool:
    """Delete a menu item."""
    ref = get_ref(f"{_menu_root(restaurant_id)}/{item_id}")
    if ref.get() is None:
        print(f"[NOT FOUND] Menu item: {item_id}")
        return False
    ref.delete()
    print(f"[DELETED] Menu item -> ID: {item_id}")
    return True


def toggle_availability(restaurant_id: str, item_id: str) -> Optional[bool]:
    """Toggle is_available status of a menu item."""
    item = get_menu_item(restaurant_id, item_id)
    if not item:
        return None
    new_status = not item.is_available
    update_menu_item(restaurant_id, item_id, {"is_available": new_status})
    return new_status
