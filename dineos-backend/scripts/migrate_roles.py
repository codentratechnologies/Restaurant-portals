import sys
import os

# Add parent directory to path so we can import firebase module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase import get_db

def migrate_roles():
    db = get_db()
    users_ref = db.child("users")
    users_snapshot = users_ref.get()

    if not users_snapshot:
        print("No users found in database.")
        return

    updated_count = 0

    # The structure is likely users/{admin_uid}/{employee_uid}
    # Let's iterate through the keys
    for admin_uid, employees in users_snapshot.items():
        if isinstance(employees, dict):
            for emp_uid, emp_data in employees.items():
                if isinstance(emp_data, dict):
                    current_role = emp_data.get('role')
                    new_role = None
                    
                    if current_role == 'Manager':
                        new_role = 'Branch Manager'
                    elif current_role == 'Delivery Executive':
                        new_role = 'Delivery Partner'
                        
                    if new_role:
                        print(f"Updating employee {emp_uid} (under admin {admin_uid}): {current_role} -> {new_role}")
                        db.child(f"users/{admin_uid}/{emp_uid}/role").set(new_role)
                        updated_count += 1
                        
    print(f"Migration completed. Updated {updated_count} employee records.")

if __name__ == "__main__":
    migrate_roles()
