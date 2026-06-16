"""
Admin User Model
-----------------
Represents an admin/staff user in the system.
Collection: `admin_users`
"""

from dataclasses import dataclass, field, asdict
from typing import Optional
from datetime import datetime


@dataclass
class AdminUser:
    name: str
    email: str
    role: str = "admin"            # super_admin | admin | staff
    is_active: bool = True
    restaurant_id: Optional[str] = None   # None = super admin (access to all)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    last_login: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    id: Optional[str] = None

    def to_dict(self) -> dict:
        data = asdict(self)
        data.pop("id", None)
        return data

    @staticmethod
    def from_dict(doc_id: str, data: dict) -> "AdminUser":
        data["id"] = doc_id
        return AdminUser(**{k: v for k, v in data.items() if k in AdminUser.__dataclass_fields__})
