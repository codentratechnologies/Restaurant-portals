# ROMS / DineOs: Direct-to-Database Specification
## PostgreSQL + Firebase Firestore Architectural Design (No Client APIs)

This document details the architectural integration, structural schemas, and database designs for combining **PostgreSQL** and **Firebase Firestore** in a **Direct-to-Database Push** model. In this architecture, client applications read and write directly to the databases, and the Python backend functions exclusively as a background synchronisation daemon.

---

## 1. Architectural Overview

To eliminate API layers and reduce latency, the client applications interact directly with the databases:
* **Mobile Clients (Customer & Delivery Apps)**: Read and write directly to **Firebase Firestore** using the Firestore Client SDK. Security is enforced through Firestore Security Rules.
* **Web Portals (Admin & Restaurant Portals)**: Connect directly to **PostgreSQL** to manage menus, rosters, and operational states, and read/write to **Firestore** directly for active logistics mapping.
* **Python Backend (Sync Daemon)**: Runs as a persistent server-side background service (not an API server). It listens directly to Firestore document write events and reconciles them into the PostgreSQL transactional database.

```text
  ┌────────────────────────────────────────────────────────┐
  │                  Client Applications                   │
  │     (Admin Portal, Restaurant Portal, Mobile Apps)     │
  └───────────┬────────────────────────────────┬───────────┘
              │                                │
      [Direct SQL / Pool]           [Direct Firestore SDK Client]
              │                                │
              ▼                                ▼
    ┌──────────────────┐             ┌───────────────────┐
    │    PostgreSQL    │             │ Firebase Firestore│
    │ (Transactional)  │             │ (Real-Time Sync)  │
    └────────▲─────────┘             └─────────┬─────────┘
             │                                 │
             │     ┌─────────────────────┐     │
             └─────┤ Python Sync Daemon  ◄─────┘
                   │  (Background Task)  │
                   └─────────────────────┘
```

---

## 2. Responsibility Split Matrix

| Data Domain | PostgreSQL (Primary DB) | Firebase Firestore (Real-Time) | Direct Client Actions |
|---|---|---|---|
| **Auth Profiles** | Sourced directly from Postgres or Firebase Auth | Checked via Security Rules | Mobile writes to Firebase Auth; Web writes to Postgres |
| **Menu Catalog** | Structured relational catalog (DDL) | Cache mapping (read-only for mobile) | Web Portals write directly to Postgres |
| **Inventory Status** | Master availability state | Real-time cache toggles | Restro Web toggles Postgres & Firestore directly |
| **Active Orders** | Stored on creation and completed on delivery | **Live tracking ticket** (Deleted upon delivery) | Customer App pushes directly to Firestore |
| **Driver Telemetry** | Historical aggregates | **Active coordinates** (Updated every 10s) | Driver App pushes coordinates directly to Firestore |
| **Delivery PIN** | *None* (Transient) | **Dynamic 4-digit code** | Driver App generates/writes; Customer App reads |

---

## 3. Direct-Push Database Sync Flow

```text
[Customer App]
   │
   ▼ (Direct push via SDK)
1. Customer App creates order document directly in Firestore "/orders/{orderId}"
   │
   ▼
2. Python Sync Daemon detects new Firestore document:
   ├─► Validates pricing logic and active database transactions
   └─► Pushes order directly to PostgreSQL ("status": "Pending")
   │
   ▼
3. Restro Web Portal accepts order:
   ├─► Updates Postgres order status to "Accepted"
   └─► Updates Firestore order status to "Accepted"
   │
   ▼
4. Driver App accepts delivery:
   ├─► Generates 4-digit PIN locally
   └─► Writes PIN and "Out_For_Delivery" directly to Firestore order document
   │
   ▼
5. Driver arrives at Customer location and validates PIN locally:
   ├─► Driver App writes status "Delivered" directly to Firestore
   └─► Driver App clears "delivery_pin" from Firestore
   │
   ▼
6. Python Sync Daemon detects status transition to "Delivered" in Firestore:
   ├─► Commits final order status, driver details, and payment states to PostgreSQL
   └─► Safely deletes the active tracking document in Firestore
```

---

## 4. PostgreSQL Database Schema DDL

The PostgreSQL database houses the master audit history, financials, and configurations. It uses the `postgis` spatial extension for geo-indexing.

### 4.1 System Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### 4.2 Branch Management Table
```sql
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
    location GEOGRAPHY(Point, 4326) NOT NULL, -- Spatial coordinates (Longitude, Latitude)
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_branches_location ON branches USING GIST (location);
```

### 4.3 Employee Auth Table (Direct DB Connection)
```sql
CREATE TYPE user_role AS ENUM ('admin', 'branch_manager', 'kitchen_staff');

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'kitchen_staff' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 4.4 Master Food Catalog & Availability
```sql
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
    category VARCHAR(50) NOT NULL,
    is_veg BOOLEAN DEFAULT TRUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    customization_schema JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE branch_menu_availability (
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (branch_id, menu_item_id)
);
```

### 4.5 Customer Records
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    cod_rejection_count INT DEFAULT 0 NOT NULL,
    total_completed_orders INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    label VARCHAR(50) NOT NULL,
    address_line TEXT NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_customer_addresses_loc ON customer_addresses USING GIST (location);
```

### 4.6 Active Order Ledger & Rejections
```sql
CREATE TYPE order_status AS ENUM ('Pending', 'Accepted', 'Preparing', 'Ready', 'Out_For_Delivery', 'Delivered', 'Rejected');
CREATE TYPE payment_channel AS ENUM ('COD', 'Online');
CREATE TYPE payment_state AS ENUM ('Pending', 'Paid', 'Refunded', 'Failed');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    driver_id UUID,
    status order_status DEFAULT 'Pending' NOT NULL,
    payment_method payment_channel NOT NULL,
    payment_status payment_state DEFAULT 'Pending' NOT NULL,
    item_total DECIMAL(10, 2) NOT NULL,
    package_charge DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    coupon_code VARCHAR(30),
    discount_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    grand_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    base_price DECIMAL(10, 2) NOT NULL,
    selected_customizations JSONB DEFAULT '[]'::jsonb NOT NULL
);
```

---

## 5. Firebase Firestore Schema Configuration

### 5.1 `/orders/{orderId}` Document Schema
```json
{
  "order_id": "7ca64703-a5ff-4da2-bb17-7422b406e232",
  "customer_id": "cust_82839120",
  "branch_id": "br_mg_road",
  "status": "Pending", // Pending -> Accepted -> Preparing -> Ready -> Out_For_Delivery -> Delivered
  "driver_id": null,
  "delivery_pin": null, 
  "amount_due": 727.40,
  "payment_method": "COD",
  "items": [
    {
      "menu_item_id": "food_margherita",
      "quantity": 2,
      "base_price": 299.00,
      "customizations": [{"name": "Extra Cheese", "price": 60.00}]
    }
  ]
}
```

### 5.2 Firestore Security Rules
Allows mobile clients to write directly while preventing tampering.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /orders/{orderId} {
      // Customers can create new orders directly and read their own
      allow create: if request.auth != null && request.resource.data.customer_id == request.auth.uid;
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.customer_id || 
        request.auth.uid == resource.data.driver_id
      );
      
      // Drivers can update order status and PIN details during pickup
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.driver_id || 
        (resource.data.driver_id == null && request.resource.data.driver_id == request.auth.uid)
      );
    }
  }
}
```

---

## 6. Python Sync Daemon (Background Listener Task)

This background service runs continuously, listening to changes in Firestore and updating PostgreSQL without using REST APIs.

```python
import time
import psycopg2
from psycopg2.extras import Json
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize databases
cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred)
db_firestore = firestore.client()

pg_conn = psycopg2.connect(
    dbname="roms_db", user="postgres", password="password", host="localhost"
)

def on_firestore_order_changed(doc_snapshot, changes, read_time):
    """
    Callback fired automatically by Firestore when an order document changes.
    """
    for doc in doc_snapshot:
        order_data = doc.to_dict()
        status = order_data["status"]
        order_id = order_data["order_id"]
        
        with pg_conn.cursor() as cur:
            if status == "Pending":
                # 1. Direct sync: Insert new order directly into PostgreSQL
                cur.execute("""
                    INSERT INTO orders (id, branch_id, customer_id, status, payment_method, item_total, grand_total)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING;
                """, (
                    order_id, 
                    order_data["branch_id"], 
                    order_data["customer_id"], 
                    status, 
                    order_data["payment_method"], 
                    order_data["amount_due"], 
                    order_data["amount_due"]
                ))
                
                # Insert order items
                for item in order_data.get("items", []):
                    cur.execute("""
                        INSERT INTO order_items (order_id, menu_item_id, quantity, base_price, selected_customizations)
                        VALUES (%s, %s, %s, %s, %s);
                    """, (order_id, item["menu_item_id"], item["quantity"], item["base_price"], Json(item["customizations"])))
                
                pg_conn.commit()
                print(f"📥 New order {order_id} recorded in Postgres directly.")
                
            elif status == "Delivered":
                # 2. Reconcile complete order state inside PostgreSQL
                cur.execute("""
                    UPDATE orders
                    SET status = 'Delivered',
                        driver_id = %s,
                        payment_status = 'Paid',
                        updated_at = NOW()
                    WHERE id = %s;
                """, (order_data["driver_id"], order_id))
                pg_conn.commit()
                print(f"💾 Order {order_id} reconciled in Postgres.")
                
                # Delete tracking document from Firestore
                db_firestore.collection("orders").document(order_id).delete()
                print(f"🗑 Active tracking document {order_id} cleaned up from Firestore.")

# Start live background listener
order_watch = db_firestore.collection("orders").on_snapshot(on_firestore_order_changed)

print("🚀 Python Direct-to-Database Sync Daemon is active and listening...")
while True:
    time.sleep(1)
```

---

## 7. Failure Recovery

1. **Auto-Reconciler**: If the background daemon drops connection, it performs a complete sync scan on startup, comparing all active Firestore `/orders` documents with PostgreSQL records to update states.
2. **Postgres RLS (Row Level Security)**: Since web portals write to PostgreSQL directly, strict database policies restrict employees to actions within their assigned `branch_id`.
