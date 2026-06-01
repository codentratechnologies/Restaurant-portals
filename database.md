# ROMS / DineOs: Direct-to-Database Specification
## PostgreSQL + Firebase (Auth, Firestore, FCM) Real-Time Architecture

This document details the database specification, authentication integration, and real-time operational flows for ROMS / DineOs. It details how the system leverages **Firebase Authentication** for identity management, **Firebase Firestore & Cloud Messaging** for real-time mobile logistics, and **PostgreSQL** for transactional persistence without client-facing API gateways.

---

## 1. Architectural Overview

```text
  ┌────────────────────────────────────────────────────────┐
  │                  Client Applications                   │
  │     (Admin Portal, Restaurant Portal, Mobile Apps)     │
  └───────────┬──────────────────┬──────────────┬──────────┘
              │                  │              │
       [Firebase Auth]  [Direct SQL Pool]  [Direct Firestore & FCM SDK]
              │                  │              │
              ▼                  ▼              ▼
    ┌──────────────────┐┌──────────────────┐┌───────────────────┐
    │  Firebase Auth   ││    PostgreSQL    ││  Firebase Cloud   │
    │ (Central Identity)││ (Transactional)  ││ (Real-Time & FCM) │
    └────────┬─────────┘└────────▲─────────┘└─────────┬─────────┘
             │                   │                    │
             │       ┌───────────┴─────────┐          │
             └──────►│ Python Sync Daemon  ◄──────────┘
                     │  (Background Task)  │
                     └─────────────────────┘
```

* **Firebase Authentication (Central Identity Provider)**: Authenticates customers, delivery partners, and portal employees directly on the client side using Phone, Email/Password, or OAuth. It issues unique, secure User IDs (`firebase_uid`).
* **Firebase Firestore (Real-Time Transit Layer)**: Tracks active order deliveries, live driver GPS coordinates, active order requests, and pending alerts. Secure write permissions are checked directly using `request.auth.uid`.
* **Firebase Cloud Messaging (FCM)**: Dispatches instant push notifications for status transitions (e.g., preparing, out for delivery, delivered).
* **PostgreSQL (ACID Core)**: Stores all records, inventory, finances, catalog details, and completed order archives, using the unique `firebase_uid` to map profiles.
* **Python Sync Daemon**: A background service that bridges PostgreSQL and Firebase. It listens to Firestore triggers and Firebase Auth registration events to keep PostgreSQL in sync.

---

## 2. Real-Time Operational Flows

### 2.1 User Registration & Profile Sync Flow
How new users (Customers & Drivers) sign up via Firebase Auth and sync their profile data directly:

```text
[Customer Mobile App]
   │
   ▼ 
1. Customer registers via Firebase Auth SDK (Phone or Email)
   │
   ├─► 2. Firebase Auth issues secure "firebase_uid"
   └─► 3. Customer App pushes user details (name, email) directly to PostgreSQL
          including the "firebase_uid" as the primary relational mapping key
```

---

### 2.2 Order Placement & Real-Time Alert Flow
How an authenticated customer places an order and triggers looping alarms on the kitchen dashboard:

```text
[Customer Mobile App]
   │
   ├─► 1. Writes order directly into PostgreSQL (status = 'Pending', client auth = firebase_uid)
   └─► 2. Writes alert entry into Firestore "/active_alerts/{orderId}"
             │
             ▼ (Real-time Snapshot)
[Restaurant Portal Web]
   ├─► 3. Listens to "/active_alerts" for its branch_id
   ├─► 4. Receives new alert, opens order ticket, and triggers looping kitchen ping sound
   └─► 5. Kitchen accepts order ➔ Writes status = 'Accepted' directly to PostgreSQL and Firestore
```

---

### 2.3 Live Delivery & PIN Verification Flow
How the delivery partner manages the verification PIN, updates customer coordinates, and completes delivery:

```text
[Delivery Partner App]
   │
   ▼ (Direct update authenticated by driver firebase_uid)
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
   ├─► Updates PostgreSQL orders: status = 'Delivered', payment_status = 'Paid', driver_id = {driver_firebase_uid}
   └─► Logs driver shift and commission details
3. Sync Daemon triggers Firebase Cloud Messaging (FCM) push notification to Customer device
4. Sync Daemon safely deletes active tracking document from Firestore `/orders/{orderId}`
```

---

## 3. Database & Real-Time Collections Schema

### 3.1 PostgreSQL Database Schema DDL
The PostgreSQL database houses the transactional structures. Standard integer/UUID IDs are mapped directly to `firebase_uid` to enforce profile relationships.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Branches Table
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_branches_location ON branches USING GIST (location);

-- 2. Employees (Admin & Kitchen Portal Users)
CREATE TYPE user_role AS ENUM ('admin', 'branch_manager', 'kitchen_staff');

CREATE TABLE employees (
    firebase_uid VARCHAR(128) PRIMARY KEY, -- Firebase Auth User ID
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'kitchen_staff' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Menu Items Catalog
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_veg BOOLEAN DEFAULT TRUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    customization_schema JSONB DEFAULT '[]'::jsonb NOT NULL
);

-- 4. Customer Accounts Table
CREATE TABLE customers (
    firebase_uid VARCHAR(128) PRIMARY KEY, -- Firebase Auth User ID
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    fcm_token VARCHAR(255), -- Saved for push notifications
    cod_rejection_count INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Customer Addresses
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(128) REFERENCES customers(firebase_uid) ON DELETE CASCADE NOT NULL,
    label VARCHAR(50) NOT NULL,
    address_line TEXT NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_customer_addresses_loc ON customer_addresses USING GIST (location);

-- 6. Orders Ledger
CREATE TYPE order_status AS ENUM ('Pending', 'Accepted', 'Preparing', 'Ready', 'Out_For_Delivery', 'Delivered', 'Rejected');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) NOT NULL,
    customer_id VARCHAR(128) REFERENCES customers(firebase_uid) NOT NULL,
    driver_id VARCHAR(128), -- Driver firebase_uid
    status order_status DEFAULT 'Pending' NOT NULL,
    payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('COD', 'Online')),
    payment_status VARCHAR(15) DEFAULT 'Pending',
    item_total DECIMAL(10, 2) NOT NULL,
    grand_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    base_price DECIMAL(10, 2) NOT NULL,
    selected_customizations JSONB DEFAULT '[]'::jsonb NOT NULL
);
```

---

## 4. Firebase Firestore Schema & Security Rules

### 4.1 Firestore Tracking Collection Document Structure
* **Path**: `/orders/{orderId}`
```json
{
  "order_id": "7ca64703-a5ff-4da2-bb17-7422b406e232",
  "customer_id": "customer_firebase_uid_102",
  "branch_id": "br_mg_road",
  "status": "Out_For_Delivery",
  "driver_id": "driver_firebase_uid_891",
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

### 4.2 Firestore Security Rules (Direct Auth Integration)
Security rules validate client calls directly against the Firebase Authentication token (`request.auth`).

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Order tracking validation
    match /orders/{orderId} {
      // Customers can create orders; UIDs must match their Auth Token
      allow create: if request.auth != null && request.resource.data.customer_id == request.auth.uid;
      
      // Read access allowed only for the specific customer or assigned driver
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.customer_id || 
        request.auth.uid == resource.data.driver_id
      );
      
      // Drivers can accept a delivery, change status, and update their location coordinates
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.driver_id || 
        (resource.data.driver_id == null && request.resource.data.driver_id == request.auth.uid)
      );
    }

    // Active driver locations
    match /active_drivers/{driverId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == driverId;
    }
  }
}
```

---

## 5. Python Event Sync Daemon (With Firebase Auth Sync)

This background service runs continuously. It monitors Firestore active orders, synchronizes status changes directly to PostgreSQL, and automates push notification alerts via FCM.

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

def get_customer_fcm_token(customer_uid: str):
    """
    Retrieves the customer's push notification token from PostgreSQL
    """
    with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT fcm_token FROM customers WHERE firebase_uid = %s;", (customer_uid,))
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
        customer_uid = doc_data["customer_id"]
        
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
                    fcm_token = get_customer_fcm_token(customer_uid)
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
                    fcm_token = get_customer_fcm_token(customer_uid)
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
