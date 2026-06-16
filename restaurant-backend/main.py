"""
main.py — Entry point for the Dineos Restaurant Backend
---------------------------------------------------------
This is a pure Python backend — NO API server.
Import services directly and call them from scripts or other modules.

Example usage:
    python main.py
"""

import sys
import os

# Make sure project root is on the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from firebase import init_firebase
from services import get_all_restaurants, get_menu, get_orders


def main():
    print("=" * 55)
    print("  Dineos Restaurant Backend  |  Project: dineos-123")
    print("=" * 55)

    # Initialize Firebase
    db = init_firebase()

    # Quick connectivity test
    print("\n📋 Fetching all restaurants...")
    restaurants = get_all_restaurants()
    if restaurants:
        for r in restaurants:
            status = "✅ Active" if r.is_active else "⛔ Inactive"
            verified = "🔵 Verified" if r.is_verified else "🟡 Unverified"
            print(f"   [{status}] [{verified}] {r.name} — {r.city}")

            # Show menu count
            menu = get_menu(r.id)
            print(f"      🍽  Menu items: {len(menu)}")

            # Show recent orders count
            orders = get_orders(r.id, limit=10)
            print(f"      📦 Recent orders: {len(orders)}")
    else:
        print("   No restaurants found.")

    print("\n✅ Restaurant Backend is working correctly!")


if __name__ == "__main__":
    main()
