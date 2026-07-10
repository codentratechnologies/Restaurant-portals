"""
Restaurant Service (Realtime Database)
----------------------------------------
CRUD operations for the /restaurants node.

Realtime DB structure:
    /restaurants
        /{restaurant_id}
            name, owner_name, email, phone, address,
            city, cuisine_type, is_active, is_verified,
            created_at, updated_at, ...
"""

from typing import Optional, List
from datetime import datetime, timezone
from firebase import get_ref
from models.restaurant import Restaurant


ROOT = "restaurants"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_restaurant(data: dict) -> Restaurant:
    """Push a new restaurant to /restaurants."""
    restaurant = Restaurant(**data)
    ref = get_ref(ROOT).push(restaurant.to_dict())
    restaurant.id = ref.key
    print(f"[OK] Restaurant created -> {restaurant.name} (ID: {ref.key})")
    return restaurant


def get_restaurant(restaurant_id: str) -> Optional[Restaurant]:
    """Fetch a single restaurant by its push key."""
    data = get_ref(f"{ROOT}/{restaurant_id}").get()
    if data is None:
        print(f"[NOT FOUND] Restaurant: {restaurant_id}")
        return None
    return Restaurant.from_dict(restaurant_id, data)


def get_all_restaurants(active_only: bool = False) -> List[Restaurant]:
    """Fetch all restaurants. Optionally filter to active only."""
    data = get_ref(ROOT).get()
    if not data:
        return []
    restaurants = [
        Restaurant.from_dict(rid, rdata)
        for rid, rdata in data.items()
        if isinstance(rdata, dict)
    ]
    if active_only:
        restaurants = [r for r in restaurants if r.is_active]
    return restaurants


def update_restaurant(restaurant_id: str, updates: dict) -> bool:
    """Partially update a restaurant node."""
    ref = get_ref(f"{ROOT}/{restaurant_id}")
    if ref.get() is None:
        print(f"[NOT FOUND] Restaurant: {restaurant_id}")
        return False
    updates["updated_at"] = _now()
    ref.update(updates)
    print(f"[OK] Restaurant updated -> ID: {restaurant_id}")
    return True


def delete_restaurant(restaurant_id: str) -> bool:
    """Permanently delete a restaurant node."""
    ref = get_ref(f"{ROOT}/{restaurant_id}")
    if ref.get() is None:
        print(f"[NOT FOUND] Restaurant: {restaurant_id}")
        return False
    ref.delete()
    print(f"[DELETED] Restaurant -> ID: {restaurant_id}")
    return True


def toggle_restaurant_status(restaurant_id: str) -> Optional[bool]:
    """Toggle the is_active field."""
    restaurant = get_restaurant(restaurant_id)
    if not restaurant:
        return None
    new_status = not restaurant.is_active
    update_restaurant(restaurant_id, {"is_active": new_status})
    state = "activated" if new_status else "deactivated"
    print(f"[TOGGLE] Restaurant {state} -> ID: {restaurant_id}")
    return new_status


def verify_restaurant(restaurant_id: str) -> bool:
    """Mark a restaurant as verified."""
    return update_restaurant(restaurant_id, {"is_verified": True})
