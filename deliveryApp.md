# DineOs Delivery Partner Application — Product Requirement Document (PRD) & UI/UX Specification

| Document Property | Value |
|---|---|
| **Product Name** | DineOs Restaurant Order Management System |
| **Portal/App** | Delivery Partner Application (Mobile App) |
| **Version** | 1.0.0 |
| **Status** | Approved for Execution |
| **Last Updated** | 2026-06-01 |
| **Audience** | Product Managers, Mobile Engineers (Flutter), Backend Engineers, QA Engineers, UI/UX Designers |

---

## Table of Contents

1. [Executive Summary & System Overview](#executive-summary--system-overview)
2. [Global UI/UX Design Tokens & Standards](#global-uiux-design-tokens--standards)
3. [Complete Delivery Flow](#complete-delivery-flow)
4. [Authentication Module (Screen 1)](#authentication-module-screen-1)
5. [Delivery Module (Screens 2 - 3.1)](#delivery-module-screens-2---31)
   - [Screen 2: Home Screen](#screen-2-home-screen)
   - [Screen 2.1: Order Request Popup](#screen-21-order-request-popup)
   - [Screen 3: Accepted Order Screen](#screen-3-accepted-order-screen)
   - [Screen 3.1: Collect Payment Screen](#screen-31-collect-payment-screen)
6. [Delivery History Module (Screens 4 - 4.1)](#delivery-history-module-screens-4---41)
   - [Screen 4: Delivered Orders Screen](#screen-4-delivered-orders-screen)
   - [Screen 4.1: Delivered Order Detail Screen](#screen-41-delivered-order-detail-screen)
7. [Profile Module (Screens 5 - 5.2)](#profile-module-screens-5---52)
   - [Screen 5: Profile Screen](#screen-5-profile-screen)
   - [Screen 5.1: View Profile Screen](#screen-51-view-profile-screen)
   - [Screen 5.2: Edit Profile Screen](#screen-52-edit-profile-screen)
8. [Session Module (Logout Flow)](#session-module-logout-flow)
9. [Database Table Suggestions](#database-table-suggestions)
10. [Backend Development Notes](#backend-development-notes)
11. [Role & Permission Logic](#role--permission-logic)
12. [UI Components Required](#ui-components-required)
13. [Edge Cases & Failure Recovery](#edge-cases--failure-recovery)
14. [Notifications & Toast Messages](#notifications--toast-messages)
15. [Real-Time Event Flow](#real-time-event-flow)
16. [Status Management System](#status-management-system)
17. [Payment Collection Flow](#payment-collection-flow)
18. [GPS Tracking & Geofencing Logic](#gps-tracking--geofencing-logic)
19. [Suggested Tech Notes](#suggested-tech-notes)

---

# Executive Summary & System Overview

The **DineOs Delivery Partner Application** is the native mobile companion app (built with Flutter) designed for delivery executives assigned to restaurant branches. It manages driver login authentication, duty availability toggling, real-time order broadcast acceptance, live GPS route navigation, customer/kitchen status synchronizations, cash-on-delivery (COD) collections, OTP handshakes, and digital proof-of-delivery uploads.

The system interacts directly with the **Admin Portal**, the **Restaurant Portal**, and the **Customer Application** to ensure seamless order lifecycle tracking.

---

# Global UI/UX Design Tokens & Standards

To align with DineOs standards, the Delivery Partner Mobile App operates under the following visual and operational tokens:

### Design Tokens
* **Primary Accent Color**: `#3B82F6` (Electric Blue) — Brand voice for delivery actions, navigation highlights, online status indicators.
* **Success Color**: `#10B981` (Emerald Green) — Delivery complete buttons, checkmarks, tips collected, cash received.
* **Warning Color**: `#F59E0B` (Amber Orange) — Countdown timers, pending orders, cash collection alerts.
* **Danger Color**: `#EF4444` (Coral Red) — Decline requests, offline indicators, cancellations.
* **Neutral Background**: `#0F172A` (Dark Mode Canvas / Night Riding Comfort) & `#F8FAFC` (Light Mode Canvas).
* **Card Surface**: `#1E293B` (Dark Mode Surface) & `#FFFFFF` (Light Mode Surface).
* **Typography**: Primary Font: `Outfit` (Google Fonts); Secondary Font: `Inter` (UI statistics, tabular ledgers).

### Micro-Animations
* **Interactive Toggles**: Duty toggle switches slide smoothly with a `200ms` spring transition.
* **Request Bouncing**: The request overlay card bounces gently (`scale: 1.02` with a `1s` cycle) when active to capture attention.
* **Status Fade**: Status chips transition between color states using a `300ms` cross-fade animation.

---

# Complete Delivery Flow

The operational lifecycle of the delivery partner follows this path:

```text
Delivery Partner Login
  ➔ Go Online (Status = Idle)
  ➔ Receive Delivery Request Popup
  ➔ Accept Delivery Request (First-to-Respond wins)
  ➔ Order Assigned (Status = Assigned)
  ➔ Navigate To Restaurant (En Route to Store)
  ➔ Arrive at Restaurant (Status = Arrived Store)
  ➔ Verify Checklist & Pickup Order (Status = Out For Delivery)
  ➔ Navigate To Customer (En Route to Customer)
  ➔ Arrive At Customer Location (Status = Arrived Customer)
  ➔ Verify OTP (Customer validation)
  ➔ Upload Delivery Proof (Image capture)
  ➔ Collect COD Payment (If COD Order Type)
  ➔ Mark Order Delivered (Status = Delivered)
  ➔ Status Back To Idle (Ready for next order)
  ➔ Order archived in History Ledger
```

---

# Authentication Module (Screen 1)

## Screen 1: Login Screen

### 1. Overview
* **Purpose**: Authenticates delivery partners using accounts created by the administrator.
* **Business Objective**: Secure access to the platform, ensuring only authorized riders can access customer coordinates and update order states.
* **User Workflow**: Open App ➔ Enter Username/Email and Password ➔ Click Log In ➔ Redirect to Home Dashboard.
* **Primary Actions**: Enter credentials, toggle password visibility, submit login, trigger Support help contact.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│                 DineOs                   │
│           Delivery Partner               │
├──────────────────────────────────────────┤
│                                          │
│  Username or Email:                      │
│  [ rajesh.k@dineos.com                 ] │
│                                          │
│  Password:                               │
│  [ **********                       [👁] ] │
│                                          │
│  [              LOG IN                  ]  │
│                                          │
│  Need help logging in? Contact Admin.    │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Username / Email | Text Input | Yes | Must be a valid email or alphanumeric username | `rajesh.k@dineos.com` | Supplied by Admin |
| Password | Text Input | Yes | Minimum 8 characters | `Password123!` | Secure password field; masked by default |
| Login Button | Button | Yes | Form must contain no validation errors | `[ LOG IN ]` | Submits payload to backend |

### 4. Validations
* **Formatting**: Standard email check regex or minimum 3-character alphanumeric username check.
* **Security lock**: 5 failed attempts locks the login screen for 15 minutes, prompting an admin help message.
* **Token Storage**: Generates a secure JSON Web Token (JWT) on success, saved in the mobile device's encrypted storage (Flutter Secure Storage).

### 5. Dependencies
* **Admin Portal Core API**: Authenticates logins and retrieves branch assignment properties.
* **Network Status**: Requires an active internet connection to authenticate.

### 6. UI/UX Layout Description
* **Header**: Large logo placeholder, styled in Electric Blue `#3B82F6`.
* **Form Inputs**: Soft rounded borders with clear validation error highlights in Coral Red `#EF4444`.
* **Button**: Prominent Electric Blue container, changing to `#2563EB` on tap.
* **Loading State**: Disables form inputs and replaces button text with a circular loading spinner.

### 7. API Requirement Suggestions
* **POST** `/api/v1/delivery/login`
  * *Request Payload*:
    ```json
    {
      "username": "rajesh.k@dineos.com",
      "password": "Password123!"
    }
    ```
  * *Response (Success)*:
    ```json
    {
      "status": "success",
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "partner": {
        "id": "drv_102",
        "name": "Rajesh Kumar",
        "mobile": "+919876543210",
        "branch_id": "br_mg_road",
        "branch_name": "MG Road Branch"
      }
    }
    ```

---

# Delivery Module (Screens 2 - 3.1)

## Screen 2: Home Screen

### 1. Overview
* **Purpose**: Serves as the driver's default landing interface, showing shift analytics and handling availability states.
* **Business Objective**: Maintain accurate driver statuses (online/offline) for the backend assignment matching system.
* **User Workflow**: Log in ➔ View dashboard ➔ Swipe "Go Online" toggle ➔ Status changes to Idle.
* **Primary Actions**: Swipe Availability, view daily summaries, navigate to history/profile.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│ DineOs Delivery Portal        [● ONLINE] │
├──────────────────────────────────────────┤
│  👤 Rajesh Kumar   | MG Road Branch      │
│  📞 +91 98765 43210                      │
│  Shift: 10:00 AM - 10:00 PM              │
├──────────────────────────────────────────┤
│  Swipe to Go Offline:                    │
│  ========================[<<< SWIPE]     │
│                                          │
│  Today's Shift:                          │
│  ┌────────────────────────────────────┐  │
│  │ Deliveries: 5 | Hours Online: 6h   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Status: Idle (Waiting for orders...)   │
├──────────────────────────────────────────┤
│  [🏠 Home]    [📜 History]    [👤 Profile]│
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Profile Image | Image | Yes | Valid image URL or asset | `profile.jpg` | Thumbnail of delivery partner |
| Partner Name | Label | Yes | Alphabetic | `Rajesh Kumar` | Sourced from authenticated session |
| Mobile Number | Label | Yes | 10 numeric digits | `+91 98765 43210` | Sourced from authenticated session |
| Branch Name | Label | Yes | Alphanumeric | `MG Road Branch` | Assigned branch from Admin |
| Shift Time | Label | Yes | Valid shift format | `10:00 AM - 10:00 PM` | Sourced from branch configurations |
| Availability Swipe | Slider Toggle | Yes | Full horizontal drag completed | `true` | Changes duty state to Idle/Offline |
| Deliveries Count | Label | Yes | Integer >= 0 | `5` | Today's completed orders |
| Online Hours | Label | Yes | Positive decimal | `6h` | Total hours active on duty today |
| Status Header Badge | Badge | Yes | Online / Offline | `[● ONLINE]` | Visual status indicator (Electric Blue when online) |
| Home Navigation Tab | Icon Button | Yes | Navigates to Home screen | `[🏠 Home]` | Active navigation tab |
| History Navigation Tab | Icon Button | Yes | Navigates to History list | `[📜 History]` | Navigates to Screen 4 |
| Profile Navigation Tab | Icon Button | Yes | Navigates to Profile settings | `[👤 Profile]` | Navigates to Screen 5 |

### 4. Validations
* **System Hardware Validation**: Toggling to "Online" is blocked if Location (GPS) services are disabled on the mobile phone, or if battery drops below 5% without charging.
* **State Check**: While carrying an active order, the availability swipe is locked and cannot be toggled to offline.

### 5. Dependencies
* **GPS Telemetry API**: Must continuously publish coordinates when online.
* **WebSocket Service**: Essential for receiving instant order matching broadcasts.

### 6. UI/UX Layout Description
* **Header**: Profile picture, branch label, and active status chip (Electric Blue `#3B82F6` for online, Dark Gray `#64748B` for offline).
* **Availability Toggle**: A slider requiring a full horizontal drag gesture, showing a color change from Red to Green on swipe success.
* **Shift Cards**: Elegant card shadows with high-contrast text metrics using the `Inter` font.
* **Navigation Bar**: Fixed bottom bar featuring Home, History, and Profile icons.

### 7. API Requirement Suggestions
* **POST** `/api/v1/delivery/availability`
  * *Request Payload*:
    ```json
    {
      "driver_id": "drv_102",
      "is_online": true,
      "latitude": 12.9716,
      "longitude": 77.5946
    }
    ```
  * *Response (Success)*:
    ```json
    {
      "status": "success",
      "driver_status": "Idle",
      "gps_interval_seconds": 10
    }
    ```

---

## Screen 2.1: Order Request Popup

### 1. Overview
* **Purpose**: Interrupts the interface when a delivery request matches the driver's location.
* **Business Objective**: Enable quick driver feedback to keep dispatch times low.
* **User Workflow**: Notification sounds ➔ Popup displays ➔ Check order payload ➔ Click Accept before countdown expires.
* **Primary Actions**: Accept Request, Decline Request.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│ 🚨 NEW DELIVERY REQUEST!         (0:24)  │
├──────────────────────────────────────────┤
│  Order ID: #ORD-99018                    │
│  Branch: MG Road Branch                  │
│  Distance to Branch: 1.5 KM              │
│                                          │
│  Customer Dropoff:                       │
│  Oakwood Apts, MG Road (2.4 KM)          │
│                                          │
│  Items Summary:                          │
│  2x Veg Pizza, 1x Coke                   │
│                                          │
│  Payment Mode: Cash on Delivery (COD)    │
│  Collect Amount: ₹727.40                 │
├──────────────────────────────────────────┤
│      [ DECLINE ]        [ ACCEPT ]       │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Countdown Timer | Progress Bar | Yes | 30 to 0 decrement timer | `24s` | Automatically declines at 0 |
| Order ID | Badge | Yes | Alphanumeric | `#ORD-99018` | Shared reference ID |
| Branch Distance | Text Label | Yes | Floating point KM | `1.5 KM` | Mapped from driver GPS to restaurant branch |
| Dropoff Location | Text Label | Yes | Full string address | `Oakwood Apts` | Target dropoff address |
| Items Summary | Label / Text Block | Yes | List of items and quantities | `2x Veg Pizza, 1x Coke` | Brief overview of items in the order |
| Payment Mode | Badge | Yes | Must be COD or Prepaid | `COD` | Critical for collection awareness |
| Collect Amount | Label | Yes | Positive decimal currency | `₹727.40` | Total bill amount including taxes |
| Accept Button | Button | Yes | User tap trigger | `[ ACCEPT ]` | Accepts order; navigates to Screen 3 |
| Decline Button | Button | Yes | User tap trigger | `[ DECLINE ]` | Declines request; dismisses popup |

### 4. Validations
* **Timeout**: If the rider does not interact within 30 seconds, the app auto-declines and returns to the Idle Home state.
* **First-to-Respond lock**: If another driver accepts first, the popup is dismissed with a "Task assigned to another partner" notice.

### 5. Dependencies
* **Push Notifications & WebSockets**: Triggers the popup view.
* **Ringtone Audio Service**: Continuous ring alert audio playback.

### 6. UI/UX Layout Description
* **Structure**: Full-screen modal overlay with a semi-transparent dark backdrop.
* **Animation**: Bouncing request card utilizing spring physics.
* **Action Buttons**: Large side-by-side buttons: decline (`#EF4444`) and accept (`#10B981`).

### 7. API Requirement Suggestions
* **POST** `/api/v1/delivery/order/respond`
  * *Request Payload*:
    ```json
    {
      "driver_id": "drv_102",
      "order_id": "ord_99018",
      "action": "accept"
    }
    ```
  * *Response (Success)*:
    ```json
    {
      "status": "success",
      "assigned_order_id": "ord_99018",
      "assigned_at": "2026-06-01T00:10:00Z"
    }
    ```

---

## Screen 3: Accepted Order Screen

### 1. Overview
* **Purpose**: Tracks active deliveries from branch arrival to customer hand-off.
* **Business Objective**: Standardize the order handoff process by using geo-validation checks and itemized checklists.
* **User Workflow**: Accept order ➔ View Google Maps to Branch ➔ Click "Arrived" at store ➔ Check off items checklist ➔ Swipe "Confirm Pickup" ➔ View navigation to customer ➔ Click "Arrived" at location.
* **Primary Actions**: Open Map Navigation, Confirm Store Arrival, Tick checklist items, Confirm Order Pickup, Confirm Customer Location Arrival.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│ Active Order: #ORD-99018             [🗺] │
├──────────────────────────────────────────┤
│  Store: MG Road Branch                   │
│  Status: [En Route to Store]             │
│                                          │
│  [       ARRIVED AT RESTAURANT       ]   │
├──────────────────────────────────────────┤
│  Items Verification Checklist:           │
│  [ ] 2x Veg Margherita Pizza             │
│      └ Extra Cheese                      │
│  [ ] 1x Coca Cola 300ml                  │
│                                          │
│  [           CONFIRM PICK UP         ]   │
├──────────────────────────────────────────┤
│  Customer: John Doe                      │
│  Address: Flat 101, Oakwood Apartments   │
│                                          │
│  [         ARRIVED AT CUSTOMER       ]   │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Map Action Icon | Button | Yes | Launches external navigation | `[🗺]` | Launches Google Maps or Apple Maps |
| Arrived Store Button | Button | Yes | Driver within 200m of restaurant coordinates | `[ ARRIVED AT RESTAURANT ]` | Updates state to `Arrived Store` |
| Items Checklist | Checkbox List | Yes | All checkboxes checked | Checked checkboxes | Verifies items are physically received |
| Confirm Pickup Button | Button | Yes | Checklist complete & kitchen state ready | `[ CONFIRM PICK UP ]` | Transitions order to `Picked Up` / `Out for Delivery` |
| Arrived Customer Button | Button | Yes | Driver within 250m of customer address | `[ ARRIVED AT CUSTOMER ]` | Transitions order state to `Arrived` |

### 4. Validations
* **Checklist Lock**: The "Confirm Pickup" action remains disabled until every item in the checklist is ticked by the driver.
* **Kitchen Status Check**: Driver cannot confirm pickup unless the restaurant portal has updated the order status to `Ready For Pickup`.
* **Geofence Check**: "Arrived at Restaurant" is disabled unless the driver is within 200m of the store. "Arrived at Customer" is disabled unless the driver is within 250m of the delivery address.

### 5. Dependencies
* **Google Maps API**: Draws routing paths and checks coordinates.
* **Restaurant Portal Sync**: Feeds kitchen status changes.

### 6. UI/UX Layout Description
* **Progress Steps**: Visual timeline progress stepper along the top (`Assigned ➔ Arrived Restaurant ➔ Picked Up ➔ Arrived Customer`).
* **Active CTA**: Primary actions are styled as sticky, full-width buttons at the bottom.
* **Map Display**: Embedded map showing route path, updating dynamically as coordinates shift.

### 7. API Requirement Suggestions
* **POST** `/api/v1/delivery/order/status-update`
  * *Request Payload*:
    ```json
    {
      "driver_id": "drv_102",
      "order_id": "ord_99018",
      "status": "ARRIVED_STORE",
      "latitude": 12.9718,
      "longitude": 77.5944
    }
    ```
  * *Response (Success)*:
    ```json
    {
      "status": "success",
      "next_allowed_status": "PICKED_UP"
    }
    ```

---

## Screen 3.1: Collect Payment Screen

### 1. Overview
* **Purpose**: Collects COD payments before concluding the delivery.
* **Business Objective**: Verify financial transfers for COD orders, preventing driver revenue losses.
* **User Workflow**: Arrive at customer ➔ COD prompts payment options ➔ Select Cash or UPI ➔ Generate dynamic QR or collect cash ➔ Click Confirm Payment.
* **Primary Actions**: Select payment mode, view UPI QR code, confirm cash collection.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│ Collect Payment: #ORD-99018              │
├──────────────────────────────────────────┤
│  Total Amount Due: ₹727.40               │
│                                          │
│  Select Payment Method:                  │
│  [ ] Cash                                │
│  [ ] UPI / Dynamic QR Code               │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ QR Code (Scan to Pay):              │  │
│  │          [ QR CODE PLACEHOLDER ]    │  │
│  │                                     │  │
│  │ Status: [Waiting for Payment...]    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [         CONFIRM CASH RECEIVED     ]   │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Payment Mode Selection | Radio Button | Yes | Cash or UPI QR selected | `UPI` | Determines subsequent UI and API flow |
| QR Code Image | Component | Yes* | Displays dynamic UPI layout | Dynamic QR | Only visible if UPI is selected |
| Confirm Cash Button | Button | Yes* | Active only if Cash mode selected | `[ CONFIRM CASH RECEIVED ]` | Logs cash transfer validation |

### 4. Validations
* **Dynamic pricing**: The dynamic UPI QR must embed the exact order total bill (`₹727.40`) inside the payload to prevent manual typing errors by the customer.
* **Lock completion**: The delivery handshake cannot be finalized until payment success matches in the DB.

### 5. Dependencies
* **Dynamic UPI Generation Engine**: Generates QR images dynamically.
* **Payment Gateway Webhook**: Checks status from the bank channel.

### 6. UI/UX Layout Description
* **Typography**: Bold billing values in HSL warn color `#F59E0B`.
* **QR Layout**: Centered widget, surrounded by an animated loading overlay during code generation.
* **Button**: Prominent Emerald Green `#10B981` confirmation button.

### 7. API Requirement Suggestions
* **POST** `/api/v1/delivery/payment/verify`
  * *Request Payload*:
    ```json
    {
      "driver_id": "drv_102",
      "order_id": "ord_99018",
      "payment_method": "UPI",
      "amount_collected": 727.40
    }
    ```
  * *Response (Success)*:
    ```json
    {
      "status": "success",
      "payment_verified": true,
      "transaction_id": "txn_892102"
    }
    ```

---

# Delivery History Module (Screens 4 - 4.1)

## Screen 4: Delivered Orders Screen

### 1. Overview
* **Purpose**: Displays historical delivery performance logs and customer tip records.
* **Business Objective**: Provide drivers with a transparent record of daily and monthly earnings, minimizing payout disputes.
* **User Workflow**: Open History ➔ View today's summary card ➔ Toggle date filters ➔ Scroll history feed.
* **Primary Actions**: Filter by date range, select order details.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│ Delivered History            [ Filter ▼ ]│
├──────────────────────────────────────────┤
│  Summary:                                │
│  📅 Today: 5 Orders  | Month: 124 Orders  │
├──────────────────────────────────────────┤
│  Filter: [ Today ] [ Week ] [ Month ]    │
├──────────────────────────────────────────┤
│  Delivered Orders (Today):               │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ #ORD-99018 | John Doe               │  │
│  │ Amount: ₹727.40 (COD)              │  │
│  │ Delivered: 10:15 AM                │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ #ORD-98921 | Alice Smith            │  │
│  │ Amount: ₹450.00 (Prepaid)          │  │
│  │ Delivered: 08:30 AM                │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Filter Toggle | Segmented Control| Yes | Must match: Today, Week, Month | `Today` | Triggers immediate local/API search filter |
| Order Detail Row | Clickable Card | Yes | Navigates to Screen 4.1 | - | Clicking opens details |

### 4. Validations
* **Rider Scope Check**: Display is restricted to order rows where `driver_id` matches the active token session.
* **Default filter**: Default view must fall back to today's active window to limit excessive network load.

### 5. Dependencies
* **Delivered Orders Database**: Pulls archived transaction entries.

### 6. UI/UX Layout Description
* **Cards**: Outlined boxes with clean borders.
* **Indicators**: Small color-coded chips for payment types (Blue for Prepaid, Gold for COD).
* **Empty State**: Displays a vector graphic of a package with "No deliveries recorded in this period."

### 7. API Requirement Suggestions
* **GET** `/api/v1/delivery/orders/history?driver_id=drv_102&range=today`
  * *Response (Success)*:
    ```json
    {
      "status": "success",
      "summary": {
        "today_count": 5,
        "monthly_count": 124
      },
      "orders": [
        {
          "order_id": "ord_99018",
          "customer_name": "John Doe",
          "amount": 727.40,
          "payment_type": "COD",
          "delivered_at": "2026-06-01T10:15:00Z"
        }
      ]
    }
    ```

---

## Screen 4.1: Delivered Order Detail Screen

### 1. Overview
* **Purpose**: Details customer information, items summary, and proof-of-delivery images for past transactions.
* **Business Objective**: Provides auditing capabilities for resolved orders.
* **User Workflow**: Click order row on Screen 4 ➔ Review details, timing logs, and uploaded image.
* **Primary Actions**: Click Back button.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│ [←] Delivered Order Detail               │
├──────────────────────────────────────────┤
│  Order ID: #ORD-99018                    │
│  Restaurant: MG Road Branch              │
│  Customer: John Doe (Masked: +91 ******45)│
│  Address: Flat 101, Oakwood Apartments   │
├──────────────────────────────────────────┤
│  Items Details:                          │
│  • 2x Veg Margherita Pizza (₹598.00)     │
│  • 1x Coca Cola 300ml (₹30.00)           │
│  --------------------------------------  │
│  Bill Amount: ₹727.40 (COD Paid)         │
├──────────────────────────────────────────┤
│  Delivered At: 2026-06-01 10:15 AM       │
│                                          │
│  Delivery Proof:                         │
│  ┌────────────────────────────────────┐  │
│  │        [ PROOF IMAGE PREVIEW ]      │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Back Icon | Button | Yes | Returns to History list | `[←]` | Navigation control |
| Photo Frame | Image Container | Yes | Valid image URL | Proof photo | Display of uploaded delivery proof |

### 4. Validations
* **Information Masking**: Customer phone numbers must be masked (e.g. `+91 ******45`) to protect customer privacy.
* **Read-only state**: Modification tools are disabled; details are strictly archival.

### 5. Dependencies
* **Secure Image Hosting Service**: Fetches uploaded images from storage (e.g., AWS S3).

### 6. UI/UX Layout Description
* **Aesthetics**: Premium layout with structured info groups.
* **Visual Status**: Displays a green `Delivered` status chip in the top right.
* **Image View**: Interactive thumbnail with pinch-to-zoom capabilities.

### 7. API Requirement Suggestions
* **GET** `/api/v1/delivery/orders/details?order_id=ord_99018`
  * *Response (Success)*:
    ```json
    {
      "status": "success",
      "data": {
        "order_id": "ord_99018",
        "restaurant_name": "MG Road Branch",
        "customer_name": "John Doe",
        "customer_phone_masked": "+91 ******45",
        "delivery_address": "Flat 101, Oakwood Apartments",
        "items": [
          { "name": "Veg Margherita Pizza", "qty": 2, "price": 598.00 },
          { "name": "Coca Cola 300ml", "qty": 1, "price": 30.00 }
        ],
        "bill_amount": 727.40,
        "payment_type": "COD",
        "delivered_timestamp": "2026-06-01T10:15:00Z",
        "proof_image_url": "https://s3.amazonaws.com/dineos-proofs/ord_99018.jpg"
      }
    }
    ```

---

# Profile Module (Screens 5 - 5.2)

## Screen 5: Profile Screen

### 1. Overview
* **Purpose**: Central hub containing account configurations, shift properties, and support routes.
* **Business Objective**: Provide profile summaries and access to account edits.
* **User Workflow**: Select Profile tab ➔ Inspect profile card ➔ Click View Profile, Edit Profile, or Log Out.
* **Primary Actions**: Open View Profile details, Open Edit Profile inputs, Log Out of session.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│ Account & Profile                        │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ 👤 [ Profile Image ]                │  │
│  │ Rajesh Kumar                       │  │
│  │ ID: DRV-102 | +91 98765 43210       │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  Menu Options:                           │
│  [⚙️ View Full Profile               [>] ]│
│  [✏️ Edit Profile                    [>] ]│
│                                          │
│  [🚪 LOGOUT                              ]│
├──────────────────────────────────────────┤
│  [🏠 Home]    [📜 History]    [👤 Profile]│
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| View Full Profile | Clickable List Item | Yes | Navigates to Screen 5.1 | - | Redirects to full read-only detail view |
| Edit Profile | Clickable List Item | Yes | Navigates to Screen 5.2 | - | Redirects to form modification view |
| Logout Button | Button | Yes | Session status checks complete | `[🚪 LOGOUT]` | Logs the user out of the app |

### 4. Validations
* **Logout Safety Interlocking**: Logout is disabled if the driver's active state is `Assigned` or `Delivering` (i.e. holding an active order).

### 5. Dependencies
* **Local Session Manager**: Erases JWT tokens on logout.

### 6. UI/UX Layout Description
* **Profile Card**: Top block with rounded corners, featuring an Electric Blue background gradient.
* **Menu Options**: Simple list items with icons on the left and chevron arrows on the right.
* **Logout Button**: High-contrast Coral Red `#EF4444` icon with bold text.

### 7. API Requirement Suggestions
* None (uses local navigation).

---

## Screen 5.1: View Profile Screen

### 1. Overview
* **Purpose**: Displays full read-only contractual details and assign properties.
* **Business Objective**: Provide drivers with clear information regarding their assigned branch, shift parameters, and monthly salary.
* **User Workflow**: Open View Profile ➔ Inspect fields ➔ Click Back.
* **Primary Actions**: Click Back button.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│ [←] Full Profile Details                 │
├──────────────────────────────────────────┤
│  Profile Photo:                          │
│  [ Photo Preview ]                       │
│                                          │
│  Name: Rajesh Kumar                      │
│  Mobile Number: +91 98765 43210          │
│  Username: rajesh_k                      │
│  Email: rajesh.k@dineos.com              │
│                                          │
│  Operational Assignment:                 │
│  Branch: MG Road Branch                  │
│  Shift Time: 10:00 AM - 10:00 PM         │
│  Monthly Salary: ₹15,000.00              │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Back Icon | Button | Yes | Returns to Profile Home | `[←]` | Navigation control |
| Profile Fields | Text Blocks | Yes | Read-only | `₹15,000.00` | Displays salary, shifts, and branch details |

### 4. Validations
* **Read-Only**: Inputs are disabled on this screen to prevent accidental updates.
* **Shift logic**: Displays shift times configured in the Admin Portal.

### 5. Dependencies
* **Admin Database**: Supplies contractual variables (salary, branch constraints).

### 6. UI/UX Layout Description
* **Visuals**: Clean card elements with thin borders.
* **Colors**: Text labels in light Slate Blue (`#64748B`), value text in high-contrast Slate White/Dark.

### 7. API Requirement Suggestions
* **GET** `/api/v1/delivery/profile/full`
  * *Response (Success)*:
    ```json
    {
      "status": "success",
      "profile": {
        "name": "Rajesh Kumar",
        "username": "rajesh_k",
        "email": "rajesh.k@dineos.com",
        "mobile": "+919876543210",
        "branch": "MG Road Branch",
        "salary": 15000.00,
        "shift_hours": "10:00 AM - 10:00 PM"
      }
    }
    ```

---

## Screen 5.2: Edit Profile Screen

### 1. Overview
* **Purpose**: Allows updating editable driver information (Name and Mobile).
* **Business Objective**: Maintain accurate contact details for active orders and emergencies.
* **User Workflow**: Open screen ➔ Update input fields ➔ Click Save ➔ Sync changes to backend.
* **Primary Actions**: Enter Name, Enter Mobile Number, Submit form.

### 2. Screen Preview
```text
┌──────────────────────────────────────────┐
│ [←] Edit Profile                         │
├──────────────────────────────────────────┤
│  Full Name:                              │
│  [ Rajesh Kumar                        ] │
│                                          │
│  Mobile Number:                          │
│  [ +91 98765 43210                     ] │
│                                          │
│  Non-Editable Details:                   │
│  Email: rajesh.k@dineos.com              │
│  Branch: MG Road Branch                  │
│                                          │
│  [            UPDATE PROFILE           ]  │
└──────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Full Name | Text Input | Yes | Alphabetic letters only, minimum 3 chars | `Rajesh Kumar` | Editable field |
| Mobile Number | Text Input | Yes | 10 numeric digits only | `9876543210` | Editable field |
| Update Button | Button | Yes | Form validations complete | `[ UPDATE PROFILE ]` | Dispatches PUT request |

### 4. Validations
* **Mobile**: Validates numeric input is exactly 10 digits.
* **Name**: Sanitizes inputs to prevent SQL injection or cross-site scripting (XSS).
* **Non-editable fields**: Emails, Usernames, Branch, and Salary settings are read-only to prevent unauthorized updates.

### 5. Dependencies
* **Partner Profile API**: Receives and processes contact details updates.

### 6. UI/UX Layout Description
* **Form styling**: Active inputs display an Electric Blue border shadow. Read-only inputs are grayed out with a lock icon.
* **Status Action**: Displays an overlay spinner while updating values.

### 7. API Requirement Suggestions
* **PUT** `/api/v1/delivery/profile/update`
  * *Request Payload*:
    ```json
    {
      "driver_id": "drv_102",
      "full_name": "Rajesh Kumar",
      "mobile": "9876543210"
    }
    ```
  * *Response (Success)*:
    ```json
    {
      "status": "success",
      "message": "Profile updated successfully"
    }
    ```

---

# Session Module (Logout Flow)

* **Purpose**: Closes driver session, wipes tokens, and changes status to offline.
* **Business Objective**: Clean active worker listings, preventing ghost coordinate streams.
* **User Workflow**: Select Logout ➔ Confirm ➔ Terminate socket connections ➔ Redirect to login.
* **Validations**: Block action during active order assignments.
* **API Suggestion**:
  * **POST** `/api/v1/delivery/logout`
    * *Payload*: `{"driver_id": "drv_102"}`
    * *Response*: `{"status": "success"}`

---

# Database Table Suggestions

The relational schema for the delivery management system includes the following table structures:

```sql
-- 1. Delivery Partners Table
CREATE TABLE delivery_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    profile_photo_url VARCHAR(255),
    branch_id UUID NOT NULL, -- Assigned Restaurant Branch
    salary DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'Offline' CHECK (status IN ('Offline', 'Idle', 'Assigned', 'Delivering')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Delivery Partner Sessions Table
CREATE TABLE delivery_partner_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES delivery_partners(id) ON DELETE CASCADE,
    device_token VARCHAR(255), -- For Firebase Push Alerts
    jwt_token VARCHAR(500) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Delivery Assignments Table
CREATE TABLE delivery_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL, -- Links to Restaurant Order
    partner_id UUID REFERENCES delivery_partners(id) ON DELETE SET NULL,
    assignment_status VARCHAR(20) NOT NULL CHECK (assignment_status IN ('Assigned', 'Picked_Up', 'Arrived_Customer', 'Delivered', 'Failed')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Delivery Tracking Logs Table (Timeseries / Geospatial queries)
CREATE TABLE delivery_tracking_logs (
    id BIGSERIAL PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES delivery_partners(id) ON DELETE CASCADE,
    order_id UUID REFERENCES delivery_assignments(order_id) ON DELETE CASCADE,
    location POINT NOT NULL, -- Point coordinates (Latitude, Longitude)
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tracking_location ON delivery_tracking_logs USING gist(location);

-- 5. Delivered Orders Archive Table
CREATE TABLE delivered_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL,
    partner_id UUID REFERENCES delivery_partners(id) ON DELETE SET NULL,
    branch_id UUID NOT NULL,
    total_bill DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(10) CHECK (payment_type IN ('Prepaid', 'COD')),
    tips_amount DECIMAL(10, 2) DEFAULT 0.00,
    delivered_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. COD Collections Table
CREATE TABLE cod_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES delivered_orders(order_id) ON DELETE CASCADE,
    partner_id UUID REFERENCES delivery_partners(id),
    amount_due DECIMAL(10, 2) NOT NULL,
    collected_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('Cash', 'UPI')),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Settled', 'Failed')),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Delivery Proofs Table
CREATE TABLE delivery_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES delivery_assignments(order_id) ON DELETE CASCADE,
    proof_image_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Key Relationships
* `delivery_partners.branch_id` links to the restaurant branch entity.
* `delivery_assignments.order_id` links to the restaurant order entity.
* `delivery_tracking_logs` acts as a historical telemetry log, with geospatial indexing (GIST) for mapping routes.

---

# Backend Development Notes

### 1. Login Authentication
* Passwords must be hashed using `bcrypt` (work factor 12) before storage.
* Sessions require short-lived JWT tokens (e.g., 24-hour expiry) stored in device secure storage, matched against active database sessions.

### 2. Online/Offline Status Management
* When a driver goes Online, update `delivery_partners.status` to `Idle`.
* Start logging coordinates to the Redis geo-cache database, allowing quick location-based matching calculations.

### 3. Order Assignment Engine
* When a branch prepares an order, query nearby `Idle` drivers using a Redis `GEORADIUS` search (e.g., within a 3km radius).
* Broadcast the request payload to matching drivers using WebSocket rooms.
* First-to-Respond wins: Write a Postgres transaction lock (`SELECT FOR UPDATE`) to prevent duplicate driver allocations.

### 4. GPS Tracking
* Collect coordinates every 10 seconds while the driver is carrying an active order (`Out for Delivery`).
* Write logs directly to Redis to minimize database write loads, batching coordinates to Postgres every 2 minutes.

### 5. Delivery Status Flow
* Maintain state validation constraints:
  `Offline ➔ Idle ➔ Assigned ➔ Picked_Up ➔ Arrived_Customer ➔ Delivered`

### 6. OTP Verification
* Generate a random 4-digit code during order checkout. Store a salted `SHA-256` hash of this OTP in the database.
* When the driver inputs the OTP, hash the input string and compare it with the stored hash to complete the verification.

### 7. Delivery Proof Upload
* Require image uploads in `.jpg` or `.png` format.
* Compress images client-side before uploading to AWS S3 to minimize data usage, logging the generated URL in `delivery_proofs`.

### 8. COD Collection
* Generate a dynamic UPI payment QR using dynamic links.
* Check payment completion using webhook listeners, updating status fields on success.

### 9. Earnings Calculation
* Tips are calculated per-order, updating the daily database cache. Base salaries are tracked on monthly intervals.

### 10. Notification Triggers
* Trigger push notifications (using Firebase Cloud Messaging) for events such as order assignments, customer updates, and cancellations.

---

# Role & Permission Logic

* **Delivery Partner**
  * **Allowed Actions**: Go Online/Offline, view assigned order requests, accept/decline offers, view customer maps, verify checklist items, capture delivery proofs, verify OTP, record payments, and view profile history.
  * **Restricted Actions**: Cannot modify order items, change billing totals, alter customer contact information, or adjust system configuration settings.

---

# UI Components Required

1. **Status Switch**: A swipeable switch with custom drag animations.
2. **Order Overlay**: A modal popup card featuring a countdown progress bar.
3. **Map Navigation Card**: Integrates Google Maps, displaying route paths and markers.
4. **OTP Modal**: An input widget featuring automatic focus shifting and character validation.
5. **Dynamic QR Code Card**: Generates and displays UPI QR codes, featuring an embedded loading overlay.
6. **Camera Proof Widget**: Native camera view wrapper featuring image compression utilities.
7. **Profile Summary block**: A dashboard card showing name, status, and earnings metrics.

---

# Edge Cases & Failure Recovery

### 1. Multiple Partners Accepting Same Order
* Implement Postgres transaction locks (`SELECT FOR UPDATE`) on the assignment table. The first write succeeds, while subsequent accept requests return a "Order already assigned" error.

### 2. GPS Services Disabled
* Display a full-screen blocking overlay: "Please enable location services to use the DineOs Delivery App."

### 3. Internet Disconnection En Route
* Store actions locally in SQLite. The app will retry syncing status changes (arrived, picked up) to the backend when a network connection is re-established.

### 4. Customer Not Available
* Show a "Customer Unavailable" button, triggering a 5-minute countdown and an automated call. If unresolved, the driver can return the order to the store, updating the status to `Returned`.

### 5. Wrong OTP Code Submitted
* Lock inputs for 2 minutes after 3 incorrect OTP attempts. The driver can request a code resend to the customer's phone.

### 6. COD Payment Failed / No Cash
* Enable payment method toggling, allowing the driver to change the payment type from UPI QR to Cash from the payment screen.

### 7. Image Upload Fails
* Cache the image locally in the app directory, retrying the upload in the background while allowing the delivery flow to complete.

### 8. Order Cancelled During Transit
* Display an interrupt dialog: "Order Cancelled by Customer. Please return items to store."

---

# Notifications & Toast Messages

* **Success Alerts**
  * *Toast*: "Order assigned successfully. Navigate to branch."
  * *Toast*: "Payment collection verified."
  * *Toast*: "Delivery completed."
* **Error Alerts**
  * *Toast*: "Incorrect OTP. Please check code."
  * *Toast*: "Network connection lost. Retrying sync..."
* **Warning Alerts**
  * *Toast*: "Please enable location services to go online."
  * *Toast*: "Battery low. Location updates may be impacted."
* **Push Notifications**
  * *Push*: "🚨 New order assignment near your location!"
  * *Push*: "⚠️ Active Order #ORD-99018 has been cancelled."

---

# Real-Time Event Flow

The system coordinates real-time updates between components using Socket.io namespaces:

```text
[Customer Checkout] ➔ Broadcast: `order:created` (Redis Geo-Pub)
                         ➔ Emit: `order:assigned` to matching drivers
[Driver Clicks Accept] ➔ Emit: `order:accepted` to server
                         ➔ Broadcast: `order:status` to Customer & Restaurant
[Driver Telemetry] ➔ Emit: `driver:location:update` every 10s
                         ➔ Broadcasts live coordinates to Customer Map
[Driver Click Arrived] ➔ Emit: `driver:arrived`
                         ➔ Triggers arrival notification on Customer App
```

---

# Status Management System

Status values map across portals as follows:

| Status Value | Theme Color | Description | Allowed Next States |
|---|---|---|---|
| `Offline` | Slate Gray (`#64748B`) | Driver offline; hidden from assignment engine | `Idle` |
| `Idle` | Electric Blue (`#3B82F6`) | Online and awaiting order assignments | `Assigned`, `Offline` |
| `Assigned` | Orange (`#F59E0B`) | Order accepted; en route to restaurant | `Arrived_Store`, `Offline` (on cancel) |
| `Arrived_Store` | Yellow (`#EAB308`) | Arrived at restaurant; verifying order checklist | `Picked_Up` |
| `Picked_Up` | Emerald Green (`#10B981`) | Checklist confirmed; order out for delivery | `Arrived_Customer` |
| `Arrived_Customer` | Purple (`#A855F7`) | Arrived at customer location; verifying OTP | `Delivered` |
| `Delivered` | Success Green (`#059669`) | OTP verified, payment complete. Ready for next order | `Idle` |

---

# Payment Collection Flow

The collection process follows this path:

```text
Order Arrived (Status: Arrived_Customer)
  ➔ Payment Check: Prepaid? ➔ Verify OTP ➔ Complete Delivery
  ➔ Payment Check: COD? ➔ Open Collect Payment Screen
                             ➔ Select Mode: UPI QR ➔ Generate UPI URL ➔ Wait for Webhook
                             ➔ Select Mode: Cash ➔ Handover Cash ➔ Click Confirm Cash Received
                             ➔ Verification Complete ➔ Verify OTP ➔ Complete Delivery
```

---

# GPS Tracking & Geofencing Logic

* **Geofence Constraints**
  * *Restaurant Geofence*: Coordinates checked within a 200m radius of restaurant location to enable store arrival actions.
  * *Customer Geofence*: Coordinates checked within a 250m radius of customer location to enable customer arrival actions.
* **Geofence Calculation (Haversine Formula)**:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  where $\phi$ is latitude, $\lambda$ is longitude, and $R = 6371\text{ km}$ (Earth's radius).

---

# Suggested Tech Notes

### 1. Flutter Mobile Architecture
* **State Management**: BloC or Provider pattern for clean separation of concerns.
* **Persistent Cache**: SQLite / Hive for caching offline logs.
* **Location Service**: `geolocator` plugin configured for high-accuracy background location updates.

### 2. Backend Infrastructure
* **Engine**: Node.js with TypeScript and Fastify/Express.
* **Data Caching**: Redis (incorporating geospatial queries `GEOADD` and `GEORADIUS`).
* **Real-time Engine**: Socket.io using a Redis Adapter for multi-instance scaling.

### 3. Security Best Practices
* Store JWT tokens securely. Include token expiration validation on every request.
* Handovers require OTP matches. Customer mobile numbers are masked in all logs.
* Encrypt API payloads using TLS 1.3. Prevent unauthorized requests using rate limit controls.
