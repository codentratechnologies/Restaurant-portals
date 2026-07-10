"""
Seed Data Script
-----------------
Run this script once to populate Firestore with sample data for testing.

Usage:
    python scripts/seed_data.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase import init_firebase
from services import (
    create_restaurant, add_menu_item, create_admin_user
)


def seed():
    print("🌱 Starting seed data script...")
    init_firebase()

    # ── 1. Create a super admin user ─────────────────────────────
    super_admin = create_admin_user({
        "name": "Super Admin",
        "email": "superadmin@dineos.com",
        "role": "super_admin",
    })

    # ── 2. Create sample restaurants ────────────────────────────
    r1 = create_restaurant({
        "name": "Spice Garden",
        "owner_name": "Rahul Sharma",
        "email": "rahul@spicegarden.com",
        "phone": "+91 9876543210",
        "address": "123 MG Road",
        "city": "Bangalore",
        "cuisine_type": "Indian",
        "is_active": True,
        "is_verified": True,
    })

    r2 = create_restaurant({
        "name": "Pizza Palace",
        "owner_name": "Priya Mehta",
        "email": "priya@pizzapalace.com",
        "phone": "+91 9123456789",
        "address": "45 Linking Road",
        "city": "Mumbai",
        "cuisine_type": "Italian",
        "is_active": True,
        "is_verified": False,
    })

    # ── 3. Add menu items to Spice Garden ───────────────────────
    add_menu_item(r1.id, {
        "name": "Butter Chicken",
        "description": "Creamy tomato-based chicken curry",
        "price": 280.0,
        "category": "Main Course",
        "is_vegetarian": False,
    })
    add_menu_item(r1.id, {
        "name": "Paneer Tikka",
        "description": "Grilled cottage cheese with spices",
        "price": 220.0,
        "category": "Starters",
        "is_vegetarian": True,
    })
    add_menu_item(r1.id, {
        "name": "Mango Lassi",
        "description": "Fresh mango yoghurt drink",
        "price": 80.0,
        "category": "Drinks",
        "is_vegetarian": True,
        "is_vegan": False,
    })

    # ── 4. Add menu items to Pizza Palace ───────────────────────
    add_menu_item(r2.id, {
        "name": "Margherita Pizza",
        "description": "Classic tomato and mozzarella",
        "price": 350.0,
        "category": "Pizza",
        "is_vegetarian": True,
    })
    add_menu_item(r2.id, {
        "name": "Pepperoni Pizza",
        "description": "Loaded with spicy pepperoni",
        "price": 420.0,
        "category": "Pizza",
        "is_vegetarian": False,
    })

    print("\n🎉 Seed data inserted successfully!")
    print(f"   Super Admin : {super_admin.id}")
    print(f"   Spice Garden: {r1.id}")
    print(f"   Pizza Palace: {r2.id}")


if __name__ == "__main__":
    seed()
