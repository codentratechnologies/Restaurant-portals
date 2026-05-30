# DineOs Delivery Partner Application — Product Requirement Document (PRD) & UI/UX Specification

| Document Property | Value |
|---|---|
| **Product Name** | DineOs Restaurant Order Management System |
| **Portal/App** | Delivery Partner Application (Mobile App) |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-05-30 |
| **Audience** | Product Managers, Mobile Engineers (Flutter), Backend Engineers, QA Engineers, UI/UX Designers |

---

## Table of Contents

1. [Executive Summary & System Overview](#executive-summary--system-overview)
2. [Global UI/UX Design Tokens & Standards](#global-uiux-design-tokens--standards)
3. [Driver & Order Lifecycle States](#driver--order-lifecycle-states)
4. [Delivery Module (Screens 1 - 5)](#delivery-module-screens-1---5)
   - [Screen 1: Home & Duty Status Screen](#screen-1-home--duty-status-screen)
   - [Screen 2: Delivery Request Overlay](#screen-2-delivery-request-overlay)
   - [Screen 3: Restaurant Pickup Screen](#screen-3-restaurant-pickup-screen)
   - [Screen 4: Customer Delivery & Dropoff Screen](#screen-4-customer-delivery--dropoff-screen)
   - [Screen 5: Earnings Ledger & History Screen](#screen-5-earnings-ledger--history-screen)
5. [Real-Time Tracking & Telemetry Flow](#real-time-tracking--telemetry-flow)
6. [Role & Permission Logic](#role--permission-logic)

---

# Executive Summary & System Overview

The **Delivery Partner Application** is the mobile companion app (iOS/Android) designed for delivery agents. It handles driver authentication, duty state management, order assignment notifications, pickup checking, client navigation, live GPS coordinate publishing, COD financial collection, and drop-off verification.

---

# Global UI/UX Design Tokens & Standards

To align with DineOs standards, the Delivery Partner Mobile App operates under the following visual and operational tokens:

### Design Tokens
* **Primary Color**: `#3B82F6` (Electric Blue) — Brand voice for delivery actions, navigation highlights, online status indicators.
* **Success Color**: `#10B981` (Emerald Green) — Delivery complete buttons, checkmarks, positive earnings.
* **Warning Color**: `#F59E0B` (Amber Orange) — Countdown timers, pending orders, cash collection alerts.
* **Danger Color**: `#EF4444` (Coral Red) — Decline requests, offline indicators, cancellations.
* **Neutral Background**: `#0F172A` (Dark Mode Canvas / Night Riding Comfort), `#F8FAFC` (Light Mode Canvas).
* **Card Surface**: `#1E293B` (Dark Mode Surface), `#FFFFFF` (Light Mode Surface).
* **Typography**: Primary Font: `Outfit` (Google Fonts); Secondary Font: `Inter` (UI statistics, tabular ledgers).

### Micro-Animations
* **Interactive Toggles**: Duty toggle switches slide smoothly with a `200ms` spring transition.
* **Request Bouncing**: The request overlay card bounces gently (`scale: 1.02`) on the screen at a periodic interval of 1 second when active.

---

# Driver & Order Lifecycle States

The following map defines the synchronized states between the order entity and the delivery partner status:

```text
[ Driver Offline ] ──(Duty Toggle On)──> [ Driver Online (Idle) ]
                                                   │
                                            (Order Assigned)
                                                   │
                                                   ▼
[ Arrived Store ] <──(Arrived store)─── [ Assigned En Route ]
        │
(Checklist Verified & Pick Up clicked)
        │
        ▼
[ Out For Delivery ] ──(Arrived Customer)──> [ Arrived Customer ]
                                                   │
                                            (OTP Verified / Paid)
                                                   │
                                                   ▼
                                            [ Order Delivered ]
```

---

# Delivery Module (Screens 1 - 5)

## Screen 1: Home & Duty Status Screen

### 1. Overview
Allows the delivery partner to toggle their operational availability ("On Duty" or "Off Duty"). When on duty, the app tracks and streams coordinates, displays summaries of today's earnings, and awaits assignments.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│  DineOs Driver App           📢 [ONLINE] │
├──────────────────────────────────────────┤
│  Welcome, Rajesh Kumar!                  │
│  Duty State: [● On Duty] (Toggle Offline)│
│                                          │
│  Today's Overview:                       │
│  ┌────────────────────────────────────┐  │
│  │ Deliveries: 8 | Hours Online: 4.5h │  │
│  │ Base Earnings: ₹640.00             │  │
│  │ Tips Collected: ₹120.00            │  │
│  │ Total Earnings: ₹760.00            │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Waiting for incoming orders...          │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Duty Toggle | Switch | Yes | Boolean | `true` | When true, transitions state to Online (Idle) and starts GPS tracking |
| Today's Overview Card | Container | Read-only | Renders daily analytics | Today's card | Aggregated distance, earnings, and delivery count |
| Status Header | Badge | Read-only | Online / Offline | `[ONLINE]` | Electric Blue `#3B82F6` if online, else Slate Gray |

### 4. Validations
* **Battery & Location Check**: Transition to "On Duty" is blocked if device location services are disabled or if battery level falls below 10% (unless charging).

### 5. Dependencies
* **Driver Location Database**: Stores online status registers and tracking intervals.

### 6. API Requirement Suggestions
* **POST** `/api/v1/driver/duty-status`
  * *Payload*: `{"driver_id": "drv_29102", "is_online": true}`
  * *Response*: `{"status": "success", "gps_tracking_interval_seconds": 10}`

---

## Screen 2: Delivery Request Overlay

### 1. Overview
A persistent overlay sheet that interrupts the screen when the backend assigns an order. Accompanied by a continuous ringtone alert and a 30-second accept countdown.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│  New Delivery Request!            (0:24) │
├──────────────────────────────────────────┤
│  Restaurant:                             │
│  MG Road Branch                          │
│  123 Main St, Bangalore                  │
│                                          │
│  Dropoff:                                │
│  Oakwood Apts, MG Road (1.2 KM)          │
│                                          │
│  Estimated Earnings: ₹65.00              │
│                                          │
│                                          │
│   [ DECLINE (X) ]      [ ACCEPT (✓) ]    │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Timer Countdown | Progress Indicator | Yes | Integer between 30 and 0 seconds | `0:24` | Triggers auto-rejection when 0 reached |
| Restaurant Details | Label | Yes | Min 3 characters | `MG Road Branch` | Name and address of branch |
| Dropoff Location | Label | Yes | Min 10 characters | `Oakwood Apts` | Target dropoff address and distance from driver |
| Estimated Earnings | Label | Yes | Positive currency | `₹65.00` | Calculated payout for the delivery trip |
| Accept Button | Button | Yes | Requires active online status | `[ ACCEPT (✓) ]` | Accepts order; navigates to Screen 3 |
| Decline Button | Button | Yes | — | `[ DECLINE (X) ]` | Declines request; dismisses modal |

### 4. Validations
* **Timeout Check**: If the rider does not interact within 30 seconds, the app auto-declines and returns to Screen 1.

### 5. API Requirement Suggestions
* **POST** `/api/v1/driver/orders/respond`
  * *Payload*: `{"driver_id": "drv_29102", "order_id": "ord_99018", "accept": true}`
  * *Response*: `{"status": "success", "assigned_order_id": "ord_99018"}`

---

## Screen 3: Restaurant Pickup Screen

### 1. Overview
Guides the driver to the restaurant branch, confirms store arrival, and provides an itemized verification checklist before starting the delivery.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│  Pickup: Order #ORD-99018            [🗺] │
├──────────────────────────────────────────┤
│  Store: MG Road Branch                   │
│  Address: 123 Main St, Bangalore         │
│                                          │
│  [       ARRIVED AT RESTAURANT       ]   │
│                                          │
│  Verification Checklist:                 │
│  [ ] 2x Veg Margherita Pizza             │
│      └ Extra Cheese                      │
│  [ ] 1x Coke 300ml                       │
│                                          │
│  [           CONFIRM PICK UP         ]   │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Map Action | Button/Icon | Yes | Opens maps intent | `[🗺]` | Launches Google Maps navigation |
| Store Details | Label | Yes | Min 3 characters | `MG Road Branch` | Restaurant branch details |
| Arrived Button | Button | Yes | GPS coordinates matches restaurant radius | `[ ARRIVED AT RESTAURANT ]` | Updates status to Arrived Store |
| Items Checklist | Checkbox List | Yes | Requires all checked | Checkboxes | Check off items and modifications (customizations) |
| Confirm Pick Up | Button | Yes | Requires checklist verified | `[ CONFIRM PICK UP ]` | Starts delivery transit; navigates to Screen 4 |

### 4. Validations
* **Pickup Availability Lock**: The rider cannot click `Confirm Pick Up` until:
  - The kitchen has marked the order as `Ready For Pickup` (checks real-time status).
  - Every checkbox in the items checklist is ticked by the driver.
* **Geofence Check**: `Arrived at Restaurant` button remains disabled unless driver is within 200 meters of restaurant coordinates.

### 5. API Requirement Suggestions
* **POST** `/api/v1/driver/orders/pickup`
  * *Payload*: `{"driver_id": "drv_29102", "order_id": "ord_99018", "checklist_verified": true}`
  * *Response*: `{"status": "success", "new_order_state": "OUT_FOR_DELIVERY"}`

---

## Screen 4: Customer Delivery & Dropoff Screen

### 1. Overview
Guides the driver to the customer dropoff address, handles Cash on Delivery (COD) collection when applicable, and uses OTP authorization for secure handover verification.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│  Deliver: Order #ORD-99018           [🗺] │
├──────────────────────────────────────────┤
│  Customer: John Doe                      │
│  Address: Flat 101, Oakwood Apartments   │
│  [📞 Call Customer]                      │
│                                          │
│  Payment Mode: Cash on Delivery (COD)    │
│  ⚠️ Collect Cash: ₹727.40                │
│                                          │
│  Enter Delivery Verification OTP:        │
│  [ _ _ _ _ ]                             │
│                                          │
│  [        COMPLETE DELIVERY (✓)      ]   │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Map Action | Button/Icon | Yes | Opens maps intent | `[🗺]` | Navigates to customer address |
| Customer Details | Label | Yes | Min 2 characters | `John Doe` | Customer billing name |
| Call Customer | Button | Yes | Opens phone intent | `[📞 Call Customer]` | Initiates masked phone call |
| Cash Collection Banner | Alert Banner | Yes* | Currency amount | `₹727.40` | Only visible on COD payment mode orders |
| OTP Field | Text Input | Yes | Numeric, exactly 4 digits | `4821` | OTP shared by customer at handover |
| Complete Delivery | Button | Yes | Requires valid OTP check | `[ COMPLETE DELIVERY (✓) ]` | Concludes delivery; returns to Screen 1 |

### 4. Validations
* **OTP Handshake Verification**: The `Complete Delivery` action fails if the 4-digit code does not match the hashed OTP generated on order checkout.
* **Geofence Check**: Dropoff submission is allowed only when the driver is within 250m of the delivery location (resolves status to Arrived Customer).

### 5. API Requirement Suggestions
* **POST** `/api/v1/driver/orders/complete`
  * *Payload*: `{"driver_id": "drv_29102", "order_id": "ord_99018", "otp_hash": "a6c4b2...", "cash_collected": 727.40}`
  * *Response*: `{"status": "success", "delivered_at": "2026-05-30T10:15:00Z"}`

---

## Screen 5: Earnings Ledger & History Screen

### 1. Overview
Provides historical delivery audits, itemizing pay records, distance rates, tips collected, and weekly totals.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│  [←] Earnings Ledger                     │
├──────────────────────────────────────────┤
│  Weekly Total: ₹3,840.00                 │
│  Period: 2026-05-24 to 2026-05-30        │
│                                          │
│  History Ledger:                         │
│  ┌────────────────────────────────────┐  │
│  │ May 29 | #ORD-99018      +₹65.00   │  │
│  │ Status: Delivered | Tip: ₹20.00    │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ May 28 | #ORD-98921      +₹80.00   │  │
│  │ Status: Delivered | Tip: ₹0.00     │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Back Button | Link | Yes | Navigates to Screen 1 | `[←]` | Returns to driver home screen |
| Weekly Total | Label | Read-only | Positive currency | `₹3,840.00` | Sum of earnings for active payroll week |
| Ledger Item Row | Container | Read-only | Valid ledger entry details | Pay card history | Holds date, order ID, payout rate, status, and tips |

---

# Real-Time Tracking & Telemetry Flow

When a driver is active (`is_online = true`) and carrying an order (`OUT_FOR_DELIVERY`), the app streams location updates to feed the live maps view on the customer app:

```text
[ Delivery App ] ──(Publish Lat/Long via WS)──> [ DineOs Backend Gateway ]
                                                          │
                                                    (Broadcast)
                                                          │
                                                          ▼
                                                   [ Customer App ]
                                                 (Render Map steppers)
```

- **Frequency**: Every 10 seconds.
- **WebSocket Event**: `driver_location_update` on namespace `/orders/track`.

---

# Role & Permission Logic

* **Approved Driver**: Role granted after background check. Allowed to go on duty, receive alerts, accept orders, verify checklists, collect COD cash, and update statuses.
* **Suspended/Blocked Driver**: Renders blocked login overlay, rejects status changes, and halts order assignments.
