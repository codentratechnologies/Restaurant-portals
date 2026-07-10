"""
Menu Item Model
----------------
Represents a single menu item inside a restaurant's menu.
Collection: `restaurants/{restaurant_id}/menu_items`
"""

from dataclasses import dataclass, field, asdict
from typing import Optional, List
from datetime import datetime


@dataclass
class MenuItem:
    name: str
    description: str
    price: float
    category: str                    # e.g. "Starters", "Main Course", "Drinks"
    is_available: bool = True
    is_vegetarian: bool = False
    is_vegan: bool = False
    image_url: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    id: Optional[str] = None

    def to_dict(self) -> dict:
        data = asdict(self)
        data.pop("id", None)
        return data

    @staticmethod
    def from_dict(doc_id: str, data: dict) -> "MenuItem":
        data["id"] = doc_id
        return MenuItem(**{k: v for k, v in data.items() if k in MenuItem.__dataclass_fields__})
