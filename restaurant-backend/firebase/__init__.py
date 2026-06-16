"""
Firebase Admin SDK Initialization (Realtime Database)
------------------------------------------------------
Initializes Firebase app once using the service account key.
Uses Firebase Realtime Database (not Firestore).

Call `get_db()` anywhere to get a reference to the root of the database.
Call `get_ref(path)` to get a reference to a specific path.
"""

import os
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv

load_dotenv()

_initialized = False


def init_firebase():
    """Initialize Firebase Admin SDK (idempotent - safe to call multiple times)."""
    global _initialized

    if firebase_admin._apps:
        _initialized = True
        return db.reference("/")

    # Path to service account key
    key_path = os.getenv("FIREBASE_KEY_PATH")
    if not key_path:
        raise RuntimeError("FIREBASE_KEY_PATH not set in .env")

    # Resolve relative path from restaurant-backend/ directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    key_path = os.path.join(base_dir, key_path)
    key_path = os.path.abspath(key_path)

    if not os.path.exists(key_path):
        raise FileNotFoundError(
            f"Service account key not found at: {key_path}\n"
            "Place your serviceAccountKey.json in restaurant-backend/config/"
        )

    # Realtime Database URL
    db_url = os.getenv("FIREBASE_DATABASE_URL")
    if not db_url:
        raise RuntimeError("FIREBASE_DATABASE_URL not set in .env")

    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred, {
        "databaseURL": db_url
    })

    _initialized = True
    print(f"[OK] Firebase Realtime DB connected -> {db_url}")
    return db.reference("/")


def get_db():
    """Return a reference to the root of the Realtime Database."""
    if not _initialized:
        init_firebase()
    return db.reference("/")


def get_ref(path: str):
    """
    Return a reference to a specific path in the Realtime Database.

    Example:
        get_ref("/restaurants")        -> all restaurants
        get_ref("/restaurants/abc123") -> single restaurant
    """
    if not _initialized:
        init_firebase()
    return db.reference(path)
