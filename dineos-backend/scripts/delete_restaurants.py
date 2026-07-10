"""
Delete Restaurants Script
--------------------------
Run this to delete all restaurants (and their menus/orders) from the Realtime Database.
This will NOT delete the admin users.

Usage:
    python scripts/delete_restaurants.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase import init_firebase, get_ref

def delete_restaurants():
    print("=" * 50)
    print("  Deleting All Restaurants")
    print("=" * 50)

    init_firebase()

    # Delete the entire /restaurants node
    get_ref("restaurants").delete()
    print("[OK] Deleted all restaurants from Realtime Database")

if __name__ == "__main__":
    delete_restaurants()
