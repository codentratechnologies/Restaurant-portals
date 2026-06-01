# ROMS / DineOs: Direct-to-Database Specification
## PostgreSQL + Firebase Firestore Real-Time & Event Architecture

This document details the database specification and real-time operational flows for ROMS / DineOs. It details how the system leverages **PostgreSQL** for transactional persistence and **Firebase (Firestore & Cloud Messaging)** for live notifications, delivery PIN handshakes, kitchen alerts, and driver GPS coordinates without relying on client-facing REST APIs.

---

## 1. Architectural Overview

```text
  ┌────────────────────────────────────────────────────────┐
  │                  Client Applications                   │
  │     (Admin Portal, Restaurant Portal, Mobile Apps)     │
  └───────────┬────────────────────────────────┬───────────┘
              │                                │
      [Direct SQL / Pool]           [Direct Firestore & FCM SDK]
              │                                │
              ▼                                ▼
    ┌──────────────────┐             ┌───────────────────┐
    │    PostgreSQL    │             │  Firebase Cloud   │
    │ (Transactional)  │             │ (Real-Time & FCM) │
    └────────▲─────────┘             └─────────┬─────────┘
             │                                 │
             │     ┌─────────────────────┐     │
             └─────┤ Python Sync Daemon  ◄─────┘
                   │  (Background Task)  │
                   └─────────────────────┘
```

* **PostgreSQL (ACID Core)**: Stores all records, inventory, finances, catalog details, user accounts, and completed order archives.
* **Firebase Firestore (Real-Time Transit Layer)**: Tracks active order deliveries, live driver GPS coordinates, active order requests, and pending alerts.
* **Firebase Cloud Messaging (FCM)**: Dispatches instant push notifications for status transitions (e.g., preparing, out for delivery, delivered).
* **Python Sync Daemon**: A background service that bridges PostgreSQL and Firestore, listening to Firestore triggers, updating the SQL database, sending push notifications, and cleaning up completed documents.

---

## 2. Real-Time Operational Flows

### 2.1 Order Placement & Kitchen Alert Flow
How a new order is placed and instantly alerts the restaurant kitchen with looping audible sounds:

```text
[Customer App]
   │
   ├─► 1. Writes order directly into PostgreSQL (status = 'Pending')
   └─► 2. Writes alert entry into Firestore "/active_alerts/{orderId}"
             │
             ▼ (Real-time Snapshot)
[Restaurant Portal Web]
   ├─► 3. Listens to "/active_alerts" for its branch_id
   ├─► 4. Receives new alert, opens order ticket, and triggers looping kitchen ping sound
   └─► 5. Kitchen accepts order ➔ Writes status = 'Accepted' directly to PostgreSQL and Firestore
```

---

### 2.2 Order Ready & Driver Broadcast Alert Flow
How the kitchen flags an order as ready, broadcasting it to drivers within a 30-second response window:

```text
[Restaurant Portal Web]
   │
   ▼ (Direct push)
1. Kitchen marks order "Ready" ➔ Updates PostgreSQL & pushes to Firestore "/orders/{orderId}"
   │
   ▼
2. Python Sync Daemon / Firestore Trigger:
   ├─► Queries active branches and targets drivers assigned to the branch
   └─► Writes request to Firestore "/order_broadcasts/{orderId}" with a 30-second expiry timestamp
   │
   ▼ (Real-time Snapshot)
[Delivery Partner Apps]
   ├─► 3. Driver apps listen to "/order_broadcasts" for their branch_id
   ├─► 4. Driver App displays a bouncing popup alert card with a 30-second countdown timer
   └─► 5. Driver accepts order ➔ Writes driver_id directly to Firestore "/orders/{orderId}"
```

---

### 2.3 Live Delivery & PIN Verification Flow
How the driver generates the verification PIN, updates customer coordinates, and completes delivery:

```text
[Delivery Partner App]
   │
   ▼ (Direct update)
1. Driver confirms pickup ➔ Generates random 4-digit PIN on device
2. Writes PIN, status = 'Out_For_Delivery', and coordinates directly to Firestore "/orders/{orderId}"
   │
   ├─► [Customer App] receives realtime Firestore update & displays the 4-digit PIN on screen
   └─► [Driver App] publishes GPS coordinates to Firestore "/orders/{orderId}/driver_location" every 10s
             │
             ▼ (Driver Arrives)
3. Customer shares PIN with Driver ➔ Driver inputs PIN in Delivery App
4. Driver App verifies PIN locally ➔ Writes status = 'Delivered' and deletes PIN field from Firestore
```

---

### 2.4 Payout Sync & Event Clean Up Flow
How the Python Daemon archives the completed order, processes financials, and frees memory:

```text
[Python Sync Daemon]
   │
   ▼ (Hears Firestore update status = 'Delivered')
1. Sync Daemon reads final transaction payload from the Firestore document
2. Commits transaction directly to PostgreSQL:
   ├─► Updates PostgreSQL orders: status = 'Delivered', payment_status = 'Paid', driver_id = {driverId}
   └─► Logs driver shift and commission details
3. Sync Daemon triggers Firebase Cloud Messaging (FCM) push notification to Customer device
4. Sync Daemon safely deletes active tracking document from Firestore `/orders/{orderId}`
```

---

## 3. Database & Real-Time Collections Schema

### 3.1 PostgreSQL Order Ledger Schema
```sql
CREATE TYPE order_status AS ENUM ('Pending', 'Accepted', 'Preparing', 'Ready', 'Out_For_Delivery', 'Delivered', 'Rejected');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    driver_id UUID,
    status order_status DEFAULT 'Pending' NOT NULL,
    payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('COD', 'Online')),
    payment_status VARCHAR(15) DEFAULT 'Pending',
    item_total DECIMAL(10,2) NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 3.2 Firestore `/active_alerts` (Kitchen Alerts)
Used to trigger looping sound notifications on kitchen dashboard terminals.
* **Document Path**: `/active_alerts/{orderId}`
```json
{
  "order_id": "ORD_99018",
  "branch_id": "br_mg_road",
  "created_at": "2026-06-01T13:24:00Z",
  "alert_sound_triggered": true
}
```

### 3.3 Firestore `/orders` (Live Tracking)
Stores the active logistics coordinates, status, and verification PIN.
* **Document Path**: `/orders/{orderId}`
```json
{
  "order_id": "ORD_99018",
  "customer_id": "cust_82839120",
  "branch_id": "br_mg_road",
  "status": "Out_For_Delivery",
  "driver_id": "drv_102",
  "delivery_pin": "5821",
  "amount_due": 727.40,
  "payment_method": "COD",
  "driver_location": {
    "latitude": 12.9754,
    "longitude": 77.5992,
    "updated_at": "2026-06-01T13:24:00Z"
  }
}
```

### 3.4 Firestore `/order_broadcasts` (Driver matching)
Broadcasts order offers to available drivers.
* **Document Path**: `/order_broadcasts/{orderId}`
```json
{
  "order_id": "ORD_99018",
  "branch_id": "br_mg_road",
  "distance_to_branch": "1.5 KM",
  "dropoff_address": "Oakwood Apts, MG Road (2.4 KM)",
  "payment_mode": "COD",
  "collect_amount": 727.40,
  "expires_at": "2026-06-01T13:24:30Z" // 30 second countdown threshold
}
```

---

## 4. Python Event Daemon Implementation

This persistent backend daemon runs continuously. It monitors Firestore real-time snapshots, synchronizes data to PostgreSQL, dispatches FCM alerts, and cleans up completed orders.

```python
import time
import psycopg2
from psycopg2.extras import RealDictCursor
import firebase_admin
from firebase_admin import credentials, firestore, messaging

# Initialize Firebase SDK
cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred)
db_firestore = firestore.client()

# Connect to PostgreSQL
pg_conn = psycopg2.connect(
    dbname="roms_db", user="postgres", password="password", host="localhost"
)
pg_conn.autocommit = True

def send_fcm_push_notification(token: str, title: str, body: str, data: dict):
    """
    Dispatches a real-time push notification alert via FCM to the client device.
    """
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        data=data,
        token=token
    )
    try:
        response = messaging.send(message)
        print(f"🔔 FCM Push Notification dispatched successfully: {response}")
    except Exception as e:
        print(f"❌ Failed to send FCM Notification: {e}")

def get_customer_fcm_token(customer_id: str):
    """
    Retrieves the customer's push notification token from PostgreSQL
    """
    with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT fcm_token FROM customers WHERE id = %s;", (customer_id,))
        row = cur.fetchone()
        return row["fcm_token"] if row else None

def on_firestore_event(doc_snapshot, changes, read_time):
    """
    Listens to Firestore active orders and coordinates sync to PostgreSQL.
    """
    for change in changes:
        doc_data = change.document.to_dict()
        order_id = doc_data["order_id"]
        status = doc_data["status"]
        customer_id = doc_data["customer_id"]
        
        if change.type.name == "ADDED" or change.type.name == "MODIFIED":
            print(f"⚡ Real-time Event: Order {order_id} transitioned to '{status}' in Firestore.")
            
            with pg_conn.cursor() as cur:
                if status == "Delivered":
                    # 1. Synchronize delivered status directly to PostgreSQL
                    cur.execute("""
                        UPDATE orders
                        SET status = 'Delivered',
                            driver_id = %s,
                            payment_status = 'Paid',
                            updated_at = NOW()
                        WHERE id = %s;
                    """, (doc_data["driver_id"], order_id))
                    
                    print(f"💾 Completed order {order_id} recorded in PostgreSQL.")
                    
                    # 2. Retrieve customer token and send delivered alert push
                    fcm_token = get_customer_fcm_token(customer_id)
                    if fcm_token:
                        send_fcm_push_notification(
                            token=fcm_token,
                            title="Order Delivered! 🎉",
                            body="Thank you! Your order was successfully verified and delivered.",
                            data={"order_id": order_id, "status": "Delivered"}
                        )
                    
                    # 3. Clean up Firestore active transit documents to save space
                    db_firestore.collection("orders").document(order_id).delete()
                    print(f"🗑 Active tracking document {order_id} removed from Firestore.")
                    
                elif status == "Out_For_Delivery":
                    # Update active delivery status in Postgres
                    cur.execute("UPDATE orders SET status = 'Out_For_Delivery', updated_at = NOW() WHERE id = %s;", (order_id,))
                    
                    # Dispatch Out for Delivery Push Notification
                    fcm_token = get_customer_fcm_token(customer_id)
                    if fcm_token:
                        send_fcm_push_notification(
                            token=fcm_token,
                            title="Your order is on the way! 🛵",
                            body=f"Your delivery partner has picked up your order. Share PIN {doc_data['delivery_pin']} on arrival.",
                            data={"order_id": order_id, "status": "Out_For_Delivery"}
                        )

# Initialize background listener stream for active delivery orders
orders_ref = db_firestore.collection("orders")
orders_watch = orders_ref.on_snapshot(on_firestore_event)

print("🚀 Python Real-Time Event Sync Daemon active and listening to Firebase...")
while True:
    time.sleep(1)
```

---

## 5. Summary of Real-Time Configurations

1. **Kitchen Alarm**: The Restaurant Web Portal opens a Firestore listener on the `/active_alerts` collection. A new document creates a web alert card and triggers `audio.play()` in a loop. When the kitchen clicks **Accept**, the alert document is deleted from Firestore, stopping the alarm.
2. **Push Notifications (FCM)**: The Python Sync Daemon handles all push notification triggers. Transitions to `Out_For_Delivery` and `Delivered` generate payload alerts that are dispatched directly to Customer device registers.
3. **Transient Coordinates**: Live driver GPS coordinates are written to the `/orders/{orderId}/driver_location` field in Firestore every 10 seconds. The Customer App renders these updates in real-time, bypassing the primary PostgreSQL database to reduce server load.
