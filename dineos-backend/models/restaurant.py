"""
Restaurant Model
-----------------
Plain Python dataclass representing a Restaurant document in Firestore.
Collection: `restaurants`
"""

from dataclasses import dataclass, field, asdict
from typing import Optional
from datetime import datetime


@dataclass
class Restaurant:
    name: str
    owner_name: str
    email: str
    phone: str
    address: str
    city: str
    cuisine_type: str
    is_active: bool = True
    is_verified: bool = False
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    logo_url: Optional[str] = None
    rating: float = 0.0
    total_orders: int = 0
    id: Optional[str] = None  # Firestore document ID (set after creation)

    def to_dict(self) -> dict:
        """Convert to a Firestore-compatible dict (excludes None id)."""
        data = asdict(self)
        data.pop("id", None)
        return data

    @staticmethod
    def from_dict(doc_id: str, data: dict) -> "Restaurant":
        """Build a Restaurant instance from a Firestore document."""
        data["id"] = doc_id
        return Restaurant(**{k: v for k, v in data.items() if k in Restaurant.__dataclass_fields__})
