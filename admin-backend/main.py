"""
main.py — Entry point for the Dineos Admin Backend
----------------------------------------------------
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
from services import get_all_restaurants, get_all_admin_users


def main():
    print("=" * 50)
    print("  Dineos Admin Backend  |  Project: dineos-123")
    print("=" * 50)

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
    else:
        print("   No restaurants found. Run: python scripts/seed_data.py")

    print("\n👥 Fetching all admin users...")
    users = get_all_admin_users()
    if users:
        for u in users:
            print(f"   [{u.role.upper()}] {u.name} — {u.email}")
    else:
        print("   No admin users found. Run: python scripts/seed_data.py")

    print("\n✅ Backend is working correctly!")


if __name__ == "__main__":
    main()
