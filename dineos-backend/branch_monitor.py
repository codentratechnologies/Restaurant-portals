import time
import sys
import os
from datetime import datetime

# Add the current directory to path so we can import firebase
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from firebase import init_firebase, get_ref

def check_branches(db):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking all branches...")
    branches_ref = get_ref("branch").get()
    
    if not branches_ref:
        print("No branches found in RTDB.")
        return

    now = datetime.now()
    current_time_mins = now.hour * 60 + now.minute

    updates_made = 0

    for admin_id, branches in branches_ref.items():
        if not isinstance(branches, dict):
            continue
        for branch_id, branch_data in branches.items():
            if not isinstance(branch_data, dict):
                continue
            
            open_time_str = branch_data.get("openTime")
            close_time_str = branch_data.get("closeTime")
            branch_name = branch_data.get("name", "Unknown Branch")
            
            if not open_time_str or not close_time_str:
                continue

            try:
                open_h, open_m = map(int, open_time_str.split(':'))
                close_h, close_m = map(int, close_time_str.split(':'))
                
                open_mins = open_h * 60 + open_m
                close_mins = close_h * 60 + close_m
                
                is_open = False
                if close_mins < open_mins:
                    # Branch stays open past midnight
                    if current_time_mins >= open_mins or current_time_mins < close_mins:
                        is_open = True
                else:
                    # Normal hours
                    if current_time_mins >= open_mins and current_time_mins < close_mins:
                        is_open = True
                        
                current_is_active = branch_data.get("is_active")
                
                # if is_open and current_is_active is False:
                #     print(f" -> OPENING: {branch_name} (ID: {branch_id})")
                #     get_ref(f"branch/{admin_id}/{branch_id}").update({"is_active": True})
                #     updates_made += 1
                # elif not is_open and current_is_active is not False:
                #     print(f" -> CLOSING: {branch_name} (ID: {branch_id})")
                #     get_ref(f"branch/{admin_id}/{branch_id}").update({"is_active": False})
                #     updates_made += 1
                    
            except Exception as e:
                print(f"Error processing branch {branch_id}: {e}")
                
    if updates_made == 0:
        print("All branches are correctly synced.")
    else:
        print(f"Updated {updates_made} branches.")

if __name__ == "__main__":
    db = init_firebase()
    print("==================================================")
    print("   Branch Status Monitor (Auto Open/Close)")
    print("==================================================")
    
    # Run once immediately
    check_branches(db)
    
    print("\nStarting continuous monitoring (every 60 seconds)...")
    print("Press Ctrl+C to stop.")
    try:
        while True:
            time.sleep(60)
            check_branches(db)
    except KeyboardInterrupt:
        print("\nMonitor stopped.")
