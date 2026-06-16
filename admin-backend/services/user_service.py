"""
Admin User Service (Realtime Database)
-----------------------------------------
CRUD operations for admin/staff users.

Realtime DB structure:
    /admin_users
        /{user_id}
            name, email, role, is_active,
            restaurant_id, phone, avatar_url,
            last_login, created_at, updated_at
"""

from typing import Optional, List
from datetime import datetime, timezone
from firebase import get_ref
from models.user import AdminUser

ROOT = "admin_users"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_admin_user(data: dict) -> AdminUser:
    """Create a new admin user."""
    user = AdminUser(**data)
    ref = get_ref(ROOT).push(user.to_dict())
    user.id = ref.key
    print(f"[OK] Admin user created -> {user.email} (ID: {ref.key})")
    return user


def create_employee(owner_uid: str, data: dict) -> dict:
    """
    Create a new employee with a sequential EMPxxx ID.
    
    Realtime DB path: /users/{owner_uid}/{employee_id}
    """
    ref_path = f"users/{owner_uid}"
    users_ref = get_ref(ref_path)
    existing_users = users_ref.get()
    
    max_seq = 0
    if existing_users:
        for key, emp in existing_users.items():
            if isinstance(emp, dict):
                emp_id = emp.get("empId")
                if emp_id and emp_id.startswith("EMP"):
                    try:
                        num = int(emp_id[3:])
                        if num > max_seq:
                            max_seq = num
                    except ValueError:
                        pass
                        
    next_id = max_seq + 1
    emp_id_str = f"EMP{next_id:03d}"
    
    data["empId"] = emp_id_str
    data["created_at"] = _now()
    data["updated_at"] = _now()
    
    new_ref = users_ref.push(data)
    data["id"] = new_ref.key
    print(f"[OK] Employee created -> {data.get('email')} (Emp ID: {emp_id_str}, Push ID: {new_ref.key})")
    return data


def get_admin_user_by_id(user_id: str) -> Optional[AdminUser]:
    """Fetch an admin user by their push key."""
    data = get_ref(f"{ROOT}/{user_id}").get()
    if data is None:
        print(f"[NOT FOUND] Admin user: {user_id}")
        return None
    return AdminUser.from_dict(user_id, data)


def get_admin_user_by_email(email: str) -> Optional[AdminUser]:
    """Find an admin user by email (scans all users)."""
    data = get_ref(ROOT).get()
    if not data:
        return None
    for uid, udata in data.items():
        if isinstance(udata, dict) and udata.get("email") == email:
            return AdminUser.from_dict(uid, udata)
    return None


def get_all_admin_users(role: Optional[str] = None) -> List[AdminUser]:
    """Get all admin users, optionally filtered by role."""
    data = get_ref(ROOT).get()
    if not data:
        return []
    users = [
        AdminUser.from_dict(uid, udata)
        for uid, udata in data.items()
        if isinstance(udata, dict)
    ]
    if role:
        users = [u for u in users if u.role == role]
    return users


def update_admin_user(user_id: str, updates: dict) -> bool:
    """Partially update an admin user node."""
    ref = get_ref(f"{ROOT}/{user_id}")
    if ref.get() is None:
        print(f"[NOT FOUND] Admin user: {user_id}")
        return False
    updates["updated_at"] = _now()
    ref.update(updates)
    print(f"[OK] Admin user updated -> ID: {user_id}")
    return True


def deactivate_admin_user(user_id: str) -> bool:
    """Deactivate (soft-delete) an admin user."""
    return update_admin_user(user_id, {"is_active": False})


def record_login(user_id: str) -> bool:
    """Stamp last_login timestamp on successful login."""
    return update_admin_user(user_id, {"last_login": _now()})
