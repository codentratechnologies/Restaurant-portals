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
    
    import datetime
    original_time = time.time
    original_utcnow = datetime.datetime.utcnow
    
    def mocked_time():
        return original_time() + time_offset
    
    def mocked_utcnow():
        return original_utcnow() + datetime.timedelta(seconds=time_offset)
        
    time.time = mocked_time
    datetime.datetime.utcnow = mocked_utcnow
except Exception as e:
    print("Could not fetch server time to fix clock skew:", e)

# Add parent directory to path so we can import firebase module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase import get_db

def delete_global_data():
    db = get_db()
    paths = [
        "branch/global",
        "users/global",
        "menu/global",
        "coupons/global"
    ]
    
    for path in paths:
        print(f"Removing {path}...")
        db.child(path).delete()
        
    print("Successfully removed all global data.")

if __name__ == "__main__":
    delete_global_data()
