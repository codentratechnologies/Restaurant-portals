import sys
import os
import time
import requests
from email.utils import parsedate_to_datetime

# 1. Monkey-patch time to fix clock skew for JWT generation
try:
    response = requests.get('https://www.google.com/robots.txt', timeout=5)
    server_time_str = response.headers['Date']
    server_time = parsedate_to_datetime(server_time_str).timestamp()
    time_offset = server_time - time.time()
    
    print(f"Detected clock skew: {time_offset} seconds. Patching time...")
    
    original_time = time.time
    def mocked_time():
        return original_time() + time_offset
    
    time.time = mocked_time
except Exception as e:
    print("Could not fetch server time to fix clock skew:", e)

# Add parent directory to path so we can import firebase module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now import firebase_admin (it will use the mocked time)
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
