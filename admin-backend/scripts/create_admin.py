"""
Create Admin User Script
--------------------------
Run this ONCE to create the super admin account in Firebase Authentication.
This also saves the admin profile to Realtime Database.

Usage:
    python scripts/create_admin.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase import init_firebase
from firebase_admin import auth
from firebase import get_ref
from datetime import datetime, timezone


# ── Admin Credentials ─────────────────────────────────────────
ADMIN_EMAIL    = "codentratechnologies@gmail.com"
ADMIN_PASSWORD = "Codentra@123"
ADMIN_NAME     = "Codentra Admin"
ADMIN_ROLE     = "super_admin"
# ──────────────────────────────────────────────────────────────


def create_admin():
    print("=" * 50)
    print("  Creating Super Admin Account")
    print("=" * 50)

    init_firebase()

    # Step 1: Check if user already exists in Firebase Auth
    try:
        existing = auth.get_user_by_email(ADMIN_EMAIL)
        print(f"[INFO] User already exists in Firebase Auth -> UID: {existing.uid}")
        uid = existing.uid
    except auth.UserNotFoundError:
        # Step 2: Create user in Firebase Authentication
        user = auth.create_user(
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            display_name=ADMIN_NAME,
            email_verified=True,
        )
        uid = user.uid
        print(f"[OK] Firebase Auth user created -> UID: {uid}")

    # Step 3: Set custom claims (role = super_admin)
    auth.set_custom_user_claims(uid, {"role": ADMIN_ROLE, "is_admin": True})
    print(f"[OK] Custom claims set -> role: {ADMIN_ROLE}")

    # Step 4: Save admin profile to Realtime Database
    admin_data = {
        "uid": uid,
        "name": ADMIN_NAME,
        "email": ADMIN_EMAIL,
        "role": ADMIN_ROLE,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None,
    }

    # Save under /admin_users/{uid} using the Firebase Auth UID as the key
    get_ref(f"admin_users/{uid}").set(admin_data)
    print(f"[OK] Admin profile saved to Realtime Database -> /admin_users/{uid}")

    print("\n" + "=" * 50)
    print("  Admin account ready!")
    print(f"  Email : {ADMIN_EMAIL}")
    print(f"  Pass  : {ADMIN_PASSWORD}")
    print(f"  Role  : {ADMIN_ROLE}")
    print(f"  UID   : {uid}")
    print("=" * 50)


if __name__ == "__main__":
    create_admin()
