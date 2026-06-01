# ROMS / DineOs: Hybrid Database Specification
## PostgreSQL + Firebase Firestore Architectural Design

This document details the architectural integration, structural schemas, data synchronisation flows, and database designs for combining **PostgreSQL** (the transactional Source of Truth) with **Firebase Firestore** (the real-time coordination layer) for the Restaurant Order Management System (ROMS).

---

## 1. Architectural Overview

To deliver both enterprise-grade financial consistency and lag-free, real-time client tracking, ROMS uses a hybrid database design:

* **PostgreSQL (Transactional Engine)**: Handles all relational data, ACID transactions, complex reporting analytics, financial balances, catalog schemas, authentication records, and historical logs.
* **Firebase Firestore (Real-Time Coordination Layer)**: Handles active delivery tracking, real-time driver coordinate broadcasts, and serverless PIN handshakes. Clients (Customer & Delivery Apps) read/write directly to Firestore during a delivery, avoiding load on the Python backend.

```text
               ┌────────────────────────────────────────┐
               │         Client Applications            │
               │ (Admin Web, Restro Web, Mobile Apps)   │
               └────────────┬──────────────┬────────────┘
                            │              │
       [REST APIs / WebSockets]          [Real-Time Listeners & Direct PIN updates]
                            │              │
                            ▼              ▼
               ┌─────────────────┐   ┌───────────────────┐
               │ Python Backend  ├───►│ Firebase Firestore│
               │ (FastAPI / ORM) │   │ (Real-Time Sync)  │
               └────────┬────────┘   └───────────────────┘
                        │
                        ▼
               ┌─────────────────┐
               │   PostgreSQL    │
               │  (Primary DB)   │
               └─────────────────┘
```

---

## 2. Responsibility Split Matrix

| Data Domain | PostgreSQL (Primary DB) | Firebase Firestore (Real-Time) | Sync Direction |
|---|---|---|---|
| **User & Auth Profiles** | **Source of Truth** (Credentials, details) | *None* | — |
| **Menu Master Catalog** | **Source of Truth** (Base price, options) | *None* | — |
| **Branch Menu Availability** | **Source of Truth** (Stock status toggles) | Cache representation for fast Customer App menu queries | Postgres ➔ Firestore (on toggle) |
| **Coupon Definitions** | **Source of Truth** (Usage caps, validity dates) | *None* | — |
| **Active Order States** | Saved at placement and finalized at delivery | **Live Tracking state** (Active orders only, deleted on completion) | Postgres ➔ Firestore (on accept) ➔ Postgres (on complete) |
| **Driver Telemetry** | Historically aggregated logs only | **Live Coordinates** (Active coordinates updated every 10s) | Driver App ➔ Firestore ➔ Python API (optional logs) |
| **Delivery OTP/PIN** | *None* (Purely transient verification element) | **Generated & validated directly** on client nodes | Driver App ➔ Firestore ➔ Customer App |
| **Reviews & Ratings** | **Source of Truth** (Analytic dashboards) | *None* | — |

---

## 3. Real-Time Order & Telemetry Sync Flow

```text
[Customer Checkout]
      │
      ▼
1. Python Backend writes Order to PostgreSQL ("status": "Pending")
      │
      ▼
2. Restaurant accepts Order via Web UI
      │
      ▼
3. Python Backend transitions status to "Accepted" in PostgreSQL and creates active tracking document in Firestore
      │
      ▼
4. Delivery Partner accepts Order on mobile app
   ├─► Write "Out_For_Delivery" & random 4-digit PIN directly to Firestore order document
   └─► Customer App instantly displays the PIN via Firestore listener (onSnapshot)
      │
      ▼
5. Driver arrives at Customer location and validates PIN locally on device
      │
      ▼
6. Driver App writes "Delivered" and clears PIN from Firestore
      │
      ▼
7. Firestore Trigger / Python Sync Worker detects update:
   ├─► Updates Order status to "Delivered" in PostgreSQL
   ├─► Writes payment collection logs (COD / Online) to PostgreSQL
   └─► Cleans up (deletes) the active tracking document in Firestore
```

---

## 4. PostgreSQL Database Schema DDL

The primary PostgreSQL database must use the `postgis` extension for high-performance spatial queries (e.g., retrieving branches within 5 KM).

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

-- Index for spatial proximity queries (within 5 KM)
CREATE INDEX idx_branches_location ON branches USING GIST (location);
```

### 4.3 Employee & Role-Based Auth Table
```sql
CREATE TYPE user_role AS ENUM ('admin', 'branch_manager', 'kitchen_staff');

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL, -- Admin has NULL branch
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'kitchen_staff' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_employees_branch ON employees(branch_id);
```

### 4.4 Master Food Catalog & Branch Menu Availability
```sql
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
    category VARCHAR(50) NOT NULL,
    is_veg BOOLEAN DEFAULT TRUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    customization_schema JSONB DEFAULT '[]'::jsonb NOT NULL, -- Describes allowed options, groups, prices
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

CREATE INDEX idx_branch_availability_item ON branch_menu_availability(menu_item_id);
```

### 4.5 Customer Account & Proximity Profile
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cod_rejection_count INT DEFAULT 0 NOT NULL,
    total_completed_orders INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    label VARCHAR(50) NOT NULL, -- 'Home', 'Office', 'Other'
    address_line TEXT NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL, -- Point for delivery geofence validations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_customer_addresses_loc ON customer_addresses USING GIST (location);
```

### 4.6 Coupon Configuration Tables
```sql
CREATE TYPE coupon_discount_type AS ENUM ('percentage', 'flat');

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    discount_type coupon_discount_type NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    max_discount_amount DECIMAL(10, 2) CHECK (max_discount_amount >= 0), -- Cap for percentage coupons
    min_order_value DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (min_order_value >= 0),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    max_uses_per_user INT DEFAULT 1 NOT NULL,
    total_usage_limit INT, -- Global limit across all customers
    current_usage_count INT DEFAULT 0 NOT NULL,
    applicable_branches UUID[], -- Array of branch IDs, NULL or empty means applicable chain-wide
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);
```

### 4.7 Order Ledger, Items & Financial Aggregates
```sql
CREATE TYPE order_status AS ENUM ('Pending', 'Accepted', 'Preparing', 'Ready', 'Out_For_Delivery', 'Delivered', 'Rejected');
CREATE TYPE payment_channel AS ENUM ('COD', 'Online');
CREATE TYPE payment_state AS ENUM ('Pending', 'Paid', 'Refunded', 'Failed');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    driver_id UUID, -- Sourced from Firestore driver ID on final sync
    status order_status DEFAULT 'Pending' NOT NULL,
    payment_method payment_channel NOT NULL,
    payment_status payment_state DEFAULT 'Pending' NOT NULL,
    item_total DECIMAL(10, 2) NOT NULL CHECK (item_total >= 0),
    package_charge DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (package_charge >= 0),
    tax DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (tax >= 0),
    coupon_id UUID REFERENCES coupons(id),
    discount_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (discount_amount >= 0),
    grand_total DECIMAL(10, 2) NOT NULL CHECK (grand_total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    base_price DECIMAL(10, 2) NOT NULL,
    selected_customizations JSONB DEFAULT '[]'::jsonb NOT NULL -- Snapshots customization add-ons: [{"name": "Cheese", "price": 60}]
);

CREATE TABLE order_rejections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    rejected_by_employee_id UUID REFERENCES employees(id),
    reason_code VARCHAR(50) NOT NULL, -- 'out_of_stock', 'delivery_unavailable', 'kitchen_closed', etc.
    additional_notes TEXT,
    refund_transaction_id VARCHAR(100),
    rejected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_orders_branch_status ON orders(branch_id, status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
```

---

## 5. Firebase Firestore Schema Configuration

Active tracking documents should be modeled as flat, high-throughput documents inside collections. Use the following structures in Firestore.

### 5.1 `orders` Collection
Tracks active deliveries in real-time. Created on order acceptance and removed upon delivery confirmation.

* **Path**: `/orders/{orderId}`
* **Document Structure**:
```json
{
  "order_id": "ORD_99201",
  "customer_id": "cust_alice",
  "branch_id": "br_mg_road",
  "status": "Out_For_Delivery", 
  "driver_id": "driver_rajesh_102",
  "delivery_pin": "5821",
  "amount_due": 727.40,
  "payment_method": "COD",
  "restaurant_location": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "customer_location": {
    "latitude": 12.9815,
    "longitude": 77.6041
  },
  "driver_location": {
    "latitude": 12.9754,
    "longitude": 77.5992,
    "updated_at": "2026-06-01T13:24:00Z"
  }
}
```

### 5.2 `active_drivers` Collection
Maintains real-time availability queues for the order matching engine.

* **Path**: `/active_drivers/{driverId}`
* **Document Structure**:
```json
{
  "driver_id": "driver_rajesh_102",
  "name": "Rajesh Kumar",
  "branch_id": "br_mg_road",
  "is_online": true,
  "status": "Idle", // 'Idle', 'Assigned', 'Offline'
  "battery_percentage": 84,
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "updated_at": "2026-06-01T13:24:00Z"
}
```

### 5.3 Firestore Security Rules
Ensure only authorised drivers and clients can update coordinates or read the secure verification PIN.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Order tracking access rules
    match /orders/{orderId} {
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.customer_id || 
        request.auth.uid == resource.data.driver_id
      );
      
      // Driver updates state, coordinates, or PIN on accepting/delivering
      allow update: if request.auth != null && 
        request.auth.uid == request.resource.data.driver_id;
        
      // Python backend has full permissions via Admin SDK bypass
    }
    
    // Driver availability telemetry
    match /active_drivers/{driverId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == driverId;
    }
  }
}
```

---

## 6. Python Backend Implementation Examples (FastAPI + SQLModel)

Here are examples of how the Python backend connects to both databases using standard packages:

* PostgreSQL integration: `sqlmodel` (built on SQLAlchemy) and `asyncpg` (async driver).
* Firebase integration: `firebase-admin` library.

### 6.1 Proximity Query (FastAPI Endpoint: Finding Branches within 5 KM)
This endpoint handles customer branch discovery using spatial PostGIS functions:

```python
from fastapi import FastAPI, Depends
from sqlmodel import SQLModel, Field, Session, create_engine, select, text
from geoalchemy2 import Geometry
from typing import List

app = FastAPI()
DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/roms_db"
engine = create_engine(DATABASE_URL)

@app.get("/branches/nearby")
async def get_nearby_branches(customer_lon: float, customer_lat: float, radius_meters: float = 5000.0):
    """
    Retrieves active branches located within the specified radius of the customer coordinates
    """
    async with Session(engine) as session:
        # Construct spatial ST_DWithin query using SRID 4326 (WGS84)
        query = text("""
            SELECT id, name, code, pincode, 
                   ST_X(location::geometry) as longitude, 
                   ST_Y(location::geometry) as latitude
            FROM branches
            WHERE is_active = TRUE
              AND ST_DWithin(
                  location, 
                  ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 
                  :radius
              )
            ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326));
        """)
        
        result = await session.execute(query, {"lon": customer_lon, "lat": customer_lat, "radius": radius_meters})
        branches = []
        for row in result:
            branches.append({
                "id": str(row[0]),
                "name": row[1],
                "code": row[2],
                "pincode": row[3],
                "coordinates": {"longitude": row[4], "latitude": row[5]}
            })
            
        return {"success": True, "count": len(branches), "data": branches}
```

### 6.2 Active Tracking Initialization (Syncing Postgres to Firestore)
When the kitchen updates the order to `Ready`, the backend syncs the details to Firestore to initialize live tracking:

```python
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import HTTPException

# Initialise Firebase Admin SDK
cred = credentials.Certificate("path/to/firebase-service-account.json")
firebase_admin.initialize_app(cred)
db_firestore = firestore.client()

async def initialize_firestore_order_tracking(db_session, order_id: str):
    """
    Fetches the finalized Postgres order details and instantiates the tracking
    document in Firebase Firestore for real-time mobile notifications.
    """
    # 1. Fetch order details from Postgres
    order = db_session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    customer = db_session.get(Customer, order.customer_id)
    address = db_session.get(CustomerAddress, order.address_id)
    branch = db_session.get(Branch, order.branch_id)
    
    # Extract coordinates using ST_X / ST_Y values
    cust_coords = db_session.scalar(text("SELECT ST_X(location::geometry), ST_Y(location::geometry) FROM customer_addresses WHERE id = :id"), {"id": address.id})
    rest_coords = db_session.scalar(text("SELECT ST_X(location::geometry), ST_Y(location::geometry) FROM branches WHERE id = :id"), {"id": branch.id})

    # 2. Package tracking payload
    payload = {
        "order_id": str(order.id),
        "customer_id": str(order.customer_id),
        "branch_id": str(order.branch_id),
        "status": "Accepted",
        "driver_id": None,
        "delivery_pin": None,
        "amount_due": float(order.grand_total),
        "payment_method": order.payment_method,
        "restaurant_location": {
            "latitude": rest_coords[1],
            "longitude": rest_coords[0]
        },
        "customer_location": {
            "latitude": cust_coords[1],
            "longitude": cust_coords[0]
        },
        "driver_location": None
    }
    
    # 3. Create document in Firestore (instant real-time availability to mobile devices)
    doc_ref = db_firestore.collection("orders").document(str(order.id))
    doc_ref.set(payload)
```

---

## 7. Migration & Local Database Seeding

To bootstrap the development workspace, execute the following Postgres migrations to create the required tables, seed test data, and configure spatial coordinates.

### 7.1 Seed Migration Script
Create a scratch script in your project named `seed_db.py` to populate initial test data:

```python
import psycopg2
from psycopg2.extras import RealDictCursor

# Connect to Postgres database
conn = psycopg2.connect(
    dbname="roms_db",
    user="postgres",
    password="password",
    host="localhost",
    port="5432"
)
cur = conn.cursor(cursor_factory=RealDictCursor)

def seed_database():
    try:
        # 1. Insert Core Test Branch (MG Road Branch, Bangalore)
        cur.execute("""
            INSERT INTO branches (code, name, email, phone, address_line_1, city, state, pincode, location, opening_time, closing_time)
            VALUES (
                'B001', 
                'MG Road Branch', 
                'mgroad@roms.com', 
                '9811223344', 
                '123, Main Street, MG Road', 
                'Bangalore', 
                'Karnataka', 
                '560001',
                ST_GeographyFromText('SRID=4326;POINT(77.5946 12.9716)'), -- Longitude, Latitude
                '10:00:00',
                '23:00:00'
            ) ON CONFLICT (code) DO NOTHING;
        """)
        
        # 2. Insert Core Menu Item (Margherita Pizza)
        cur.execute("""
            INSERT INTO menu_items (name, description, base_price, category, is_veg, customization_schema)
            VALUES (
                'Margherita Pizza',
                'Classic cheese pizza with fresh tomato sauce and organic basil leaves.',
                299.00,
                'Pizza',
                TRUE,
                '[
                    {"name": "Extra Cheese", "price": 60.00},
                    {"name": "Extra Sauce", "price": 20.00}
                ]'::jsonb
            ) ON CONFLICT DO NOTHING;
        """)
        
        conn.commit()
        print("✅ Database tables successfully seeded with test records!")
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_database()
```

---

## 8. Failure Recovery & Event Reconciliations

To prevent database desynchronisation if a device loses network connection:

1. **Firestore-to-PostgreSQL Sync Daemon**: Write a lightweight background worker in FastAPI that runs every 60 seconds to pull completed orders from Firestore and update PostgreSQL. If an order in Firestore is marked `Delivered` but is still listed as `Out_For_Delivery` in PostgreSQL, the worker reconciles the state and deletes the Firestore document.
2. **Transaction Rollbacks**: Ensure all writes to PostgreSQL uses atomic sessions. If the Postgres update fails, the Python API must catch the exception, roll back the transaction, and revert the Firestore document state to prevent inconsistent tracking states.
