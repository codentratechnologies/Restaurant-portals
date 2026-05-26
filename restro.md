# Restaurant Order Management System — Restaurant Portal

## Product Requirement Document (PRD) + UI/UX Specification + Developer Handover

| Document Property | Value |
|---|---|
| **Product Name** | Restaurant Order Management System (ROMS) |
| **Portal** | Restaurant Portal (Web) |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Created Date** | 2026-05-26 |
| **Author** | Product & Engineering Team |
| **Audience** | Branch Managers, Kitchen Staff, Developers, QA |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview & Architecture](#2-system-overview--architecture)
3. [Global UI/UX Standards](#3-global-uiux-standards)
4. [Module 1 — Home & Analytics](#4-module-1--home--analytics)
5. [Module 2 — Food Item List](#5-module-2--food-item-list)
6. [Module 3 — Order Management](#6-module-3--order-management)
7. [Order Flow Logic & Real-Time Events](#7-order-flow-logic--real-time-events)
8. [Status Management System](#8-status-management-system)
9. [Global Database Schema Suggestions](#9-global-database-schema-suggestions)
10. [Role & Permission Logic](#10-role--permission-logic)
11. [Appendix — Reusable UI Components](#11-appendix--reusable-ui-components)
12. [Appendix — Edge Cases & Error Handling](#12-appendix--edge-cases--error-handling)
13. [Appendix — Suggested Tech Notes](#13-appendix--suggested-tech-notes)

---

# 1. Executive Summary

The **Restaurant Portal** is a web-based operational dashboard designed specifically for branch-level management. While the Admin Portal controls global operations, this portal is strictly localized to a single branch.

### Business Goals
- **Operational Speed**: Enable managers and kitchen staff to process incoming orders with zero latency.
- **Inventory Control**: Allow branches to toggle live menu availability instantly to prevent customer dissatisfaction from stock-outs.
- **Delivery Coordination**: Fully automate and track the assignment of orders to third-party delivery partners.

### Target Users
| User Role | Description |
|---|---|
| Branch Manager | Full access. Manages orders, analytics, refunds, and menu availability. |
| Kitchen Staff | Restricted access. Primarily interacts with the active order queue to update preparation statuses. |

---

# 2. System Overview & Architecture

### High-Level Interaction Flow
```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Customer App   │ ────► │ RESTAURANT PORT │ ────► │ Delivery App    │
│  (Places Order) │       │ (Accepts Order) │       │ (Delivers Food) │
└─────────────────┘       └────────┬────────┘       └─────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │   Admin Portal  │
                          │(Global Tracking)│
                          └─────────────────┘
```

### Module Dependency Rules
- **Branch Isolation**: The portal must NEVER load data belonging to another branch. Every API call must explicitly scope to the authenticated user's `branch_id`.
- **Menu Hierarchy**: Food items are created centrally in the Admin Portal. The Restaurant Portal can only toggle the `is_available` boolean.

---

# 3. Global UI/UX Standards

### Design Tokens
| Token | Hex Value | Usage |
|---|---|---|
| Primary | `#2563EB` | Active states, default CTA buttons |
| Success | `#16A34A` | Accept actions, Delivered, Active items |
| Warning | `#F59E0B` | Pending/Preparing states, Warnings |
| Danger | `#DC2626` | Reject/Cancel actions, Inactive items |
| Surface | `#FFFFFF` | Cards, modals, dropdowns |
| Background| `#F8FAFC` | General app background |

### Modern Restaurant SaaS UX
- **Audio Prompts**: Critical incoming events (New Order) must trigger an audible ping.
- **Zero-Refresh UI**: The interface must utilize WebSockets. Users should never have to manually click a "Refresh" button to see new orders.
- **Kitchen-Friendly Typography**: Large, highly legible fonts (e.g., Inter or Roboto) to ensure readability from a distance in a busy kitchen.

---

# 4. Module 1 — Home & Analytics

## 1. Overview
### Purpose
The Branch Dashboard is the landing page. It provides a real-time summary of today's financial and operational metrics.

### Business Goal
Allow branch managers to assess current kitchen load, identify peak periods, and track daily revenue at a single glance.

### User Workflow
1. User logs in and lands on the Dashboard.
2. Views top KPI cards (Sales, Orders).
3. Analyzes the live funnel of active orders (Pending → Preparing → Ready).
4. Reviews peak hour charts to anticipate kitchen staffing needs.

### Primary Actions
- View real-time KPIs.
- Monitor Live Order Summary.
- Toggle Weekly/Monthly historical data.

---

## 2. UI/UX Layout Description
- **Header**: Branch Name, Live Digital Clock, Notification Bell, User Avatar.
- **Sidebar**: Standard navigation (Home, Menu, Orders).
- **Dashboard Cards**: Grid of 4 top-level metrics.
- **Live Status Indicators**: A visual funnel showing how many orders are in which state.
- **Charts**: A bar chart for Peak Order Hours.
- **Tables**: A ranked list for Top Selling Items.
- **Empty States**: If no sales today, show "Waiting for the first order..."
- **Loading States**: Skeleton loaders on initial fetch.
- **Responsive Behavior**: Stack charts vertically on tablets.

---

## 3. Screen Preview (Text Wireframe)
```text
┌─────────────────────────────────────────────────────────────┐
│  🍽 MG Road Branch       12:45 PM | 26 May     🔔(2)  👤 ▼  │
├────────────┬────────────────────────────────────────────────┤
│            │  Dashboard                                     │
│  ▶ Home    │────────────────────────────────────────────────│
│  ○ Menu    │ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  ○ Orders  │ │ 💰 Sales   │ │ 📦 Orders  │ │ ❌ Cancelled │   │
│            │ │ ₹45,200    │ │ 124        │ │ 3            │   │
│            │ │ ▲ 12%      │ │ ▲ 5%       │ │ ▼ 2%         │   │
│            │ └────────────┘ └────────────┘ └────────────┘   │
│            │────────────────────────────────────────────────│
│            │  Live Order Summary                            │
│            │  [ Pending: 4 ] ➔ [ Preparing: 12 ] ➔ [ Ready: 2]│
│            │────────────────────────────────────────────────│
│            │ ┌──────────────────────┐ ┌───────────────────┐ │
│            │ │ Peak Hours (Today)   │ │ Top Selling Items │ │
│            │ │ 12PM ▇▇▇▇▇▇ 60       │ │ 1. Chicken Pizza  │ │
│            │ │  1PM ▇▇▇▇ 40         │ │ 2. Garlic Bread   │ │
│            │ │  2PM ▇▇ 20           │ │ 3. Coke 300ml     │ │
│            │ └──────────────────────┘ └───────────────────┘ │
└────────────┴────────────────────────────────────────────────┘
```

---

## 4. Screen Fields Table

| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Today's Sales | Currency | Yes | Read-only | ₹45,200 | Excludes cancelled/rejected orders |
| Today's Orders | Number | Yes | Read-only | 124 | Total orders received today |
| Cancelled Orders| Number | Yes | Read-only | 3 | Orders cancelled by user or rejected |
| Live Summary | Numeric | Yes | Real-time sync | Pending: 4 | Must update via WebSocket |

---

## 5. Validation Rules
- **Timezone**: "Today" is strictly defined by the branch's local timezone.
- **Data Isolation**: Must only calculate data where `branch_id = current_user.branch_id`.

---

## 6. Dependencies
- **Data Dependencies**: Relies heavily on the `orders` table.
- **Real-Time Dependencies**: The Live Order Summary relies on Socket.io/WebSocket events from the backend to increment/decrement counts.

---

## 7. API Requirement Suggestions

- `GET /api/restaurant/dashboard/kpis`
  - **Purpose**: Fetch top cards for today.
- `GET /api/restaurant/dashboard/live-summary`
  - **Purpose**: Fetch current active states (fallback for WebSocket connection).
- `GET /api/restaurant/dashboard/analytics`
  - **Purpose**: Fetch charts (peak hours, top items).

---

## 8. Role & Permission Logic
- **Branch Manager**: Full access to view all financial data.
- **Kitchen Staff**: Financial KPIs (Sales, Revenue) are hidden. They only see operational metrics (Live Order Summary).

---

## 9. Development Notes
- **State Management**: Use React Context or Redux to store the live order summary, which is updated by socket event listeners globally.
- **Polling vs WebSocket**: Use WebSockets for the Live Summary. Use polling (every 5 mins) or SWR `refreshInterval` for Sales and Charts to conserve server resources.

---

# 5. Module 2 — Food Item List

## 1. Overview
### Purpose
Allows branch staff to manage the real-time availability of their assigned menu. 

### Business Goal
Prevent customers from ordering out-of-stock items, which leads to immediate cancellations, refunds, and poor reviews.

### User Workflow
1. User clicks **Menu** in the sidebar.
2. Views the list of all food items assigned to this branch by the Admin.
3. If an item runs out of stock, the user clicks the toggle switch to disable it.
4. The item is instantly marked unavailable on the Customer App.

### Primary Actions
- Search and filter assigned food items.
- Enable Food Item (In Stock).
- Disable Food Item (Out of Stock).
- Bulk update availability.

---

## 2. UI/UX Layout Description
- **Header**: "Menu Availability".
- **Filters/Search**: Search bar for Item Name. Dropdowns for Category and Status (In Stock / Out of Stock).
- **Tables**: List view containing Thumbnail, Item Name, Category, Price, and a prominent Toggle Switch.
- **Status Chips**: Green "In Stock", Red "Out of Stock".
- **Responsive Behavior**: Table collapses to a card-based list on mobile/tablet views.
- **Empty States**: "No items assigned to this branch yet. Contact Admin."

---

## 3. Screen Preview (Text Wireframe)
```text
┌─────────────────────────────────────────────────────────────┐
│  Menu Availability                                          │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search Food Item... [Category: All ▼] [Status: All ▼]   │
├─────────────────────────────────────────────────────────────┤
│ Image │ Item Name       │ Category │ Price │ Availability   │
│-------│-----------------│----------│-------│----------------│
│ [Img] │ Chicken Pizza   │ Pizza    │ ₹350  │ [● Enabled]    │
│ [Img] │ Garlic Bread    │ Sides    │ ₹120  │ [○ Disabled]   │
│ [Img] │ Choco Lava Cake │ Desserts │ ₹99   │ [● Enabled]    │
├─────────────────────────────────────────────────────────────┤
│  Showing 1-15 of 80                        [<] [1] [2] [>]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Screen Fields Table

| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Item Name | Text | Yes | Read-only | Chicken Pizza | Managed by Admin |
| Category | Text | Yes | Read-only | Pizza | |
| Price | Currency | Yes | Read-only | ₹350 | Managed by Admin |
| Availability | Toggle | Yes | Boolean | TRUE | Updates instantly |

---

## 5. Validation Rules
- **Sync**: Toggling availability must trigger a real-time update event to the Customer App to lock out the item from carts.
- **Cart Edge Case**: If a customer has the item in their cart when it is disabled, the Customer App must validate availability during checkout and reject the cart.

---

## 6. Dependencies
- **Admin Dependency**: The Restaurant Portal cannot add new items or change prices. It only reads the mapping from the Admin portal.
- **Customer App Dependency**: Real-time sync required.

---

## 7. API Requirement Suggestions

- `GET /api/restaurant/menu`
  - **Purpose**: Fetch branch-specific menu.
- `PATCH /api/restaurant/menu/{id}/availability`
  - **Payload**: `{ "is_available": false }`
  - **Response**: Triggers socket broadcast to Customer Apps.

---

## 8. Role & Permission Logic
- **Branch Manager**: Can toggle availability.
- **Kitchen Staff**: Can toggle availability (kitchen knows stock best).

---

## 9. Development Notes
- **Frontend Behavior**: The toggle switch should use an optimistic UI approach (toggle instantly visually, revert if API fails).
- **Debouncing**: Ensure bulk rapid toggling doesn't overwhelm the server.

---

# 6. Module 3 — Order Management

## 1. Overview
### Purpose
The core operational heart of the restaurant portal. It manages the real-time influx of orders, their lifecycle transitions, and coordinates the hand-off to delivery partners.

### Business Goal
Ensure zero missed orders, minimize preparation delays, and maintain transparent communication with customers and delivery agents regarding order status.

### User Workflow
1. A loud audible ping alerts staff of a new **Incoming Order**.
2. Manager clicks the order, reviews items, and clicks **Accept Order** (or Reject if out of capacity).
3. Status changes to **Preparing**. Kitchen starts cooking.
4. (Behind the scenes: System triggers Delivery Partner assignment).
5. Kitchen finishes cooking and clicks **Mark as Ready**.
6. Delivery Agent arrives, staff clicks **Handed Over** (Status changes to Out for Delivery).

### Primary Actions
- View Incoming / Active / Completed / Cancelled order lists.
- Accept or Reject pending orders.
- Advance order state (Preparing → Ready).
- View full order details (Customer info, Delivery agent info, Items).

---

## 2. UI/UX Layout Description
- **Header**: Standard.
- **Sidebar**: Standard.
- **Order Queues (Tabs)**:
  - `[Incoming (4)]` `[Preparing (12)]` `[Ready (2)]` `[Completed]`
- **Incoming Orders List**: A grid of large, high-visibility cards showing Order ID, Time elapsed (e.g., "3m ago"), and Item count.
- **Order Card**: Contains quick-actions (Accept ✅, Reject ❌).
- **Popups**:
  - Rejection Reason Modal.
  - Delivery Partner Assignment Modal (shows live searching radar UI).
- **Real-Time Indicators**: Pulsing red dots on new incoming orders.
- **Empty States**: "No active orders right now."

---

## 3. Screen Previews (Text Wireframes)

### 3.1 Active Orders Screen
```text
┌─────────────────────────────────────────────────────────────┐
│  Orders         [Incoming (2)]  [Preparing (5)]  [Ready (1)]│
├─────────────────────────────────────────────────────────────┤
│  🔍 Search Order...                     Sort: [Oldest ▼]    │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────────────────┐ ┌────────────────────────┐       │
│ │ 🚨 NEW                 │ │ 🚨 NEW                 │       │
│ │ #ORD-101               │ │ #ORD-102               │       │
│ │ 3 mins ago             │ │ 1 min ago              │       │
│ │ 2x Chicken Burger      │ │ 1x Veg Pizza           │       │
│ │ 1x Coke                │ │ 1x Garlic Bread        │       │
│ │ ₹450 | Card Paid       │ │ ₹320 | COD             │       │
│ │                        │ │                        │       │
│ │ [❌ Reject] [✅ Accept] │ │ [❌ Reject] [✅ Accept] │       │
│ └────────────────────────┘ └────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Order Detail View & Status Progress
```text
┌─────────────────────────────────────────────────────────────┐
│  < Back | Order #ORD-101               ● Preparing          │
├─────────────────────────────────────────────────────────────┤
│  Items (3)                     |  Order Lifecycle           │
│  2x Chicken Burger    ₹300     |  [✔] Accepted 12:05 PM     │
│  1x Coke              ₹150     |  [●] Preparing             │
│  Total: ₹450                   |  [ ] Ready for Pickup      │
│                                |                            │
│  Customer Details              |                            │
│  John Doe (9876543210)         |      [ Mark as Ready ]     │
│                                |                            │
│  Delivery Partner              |                            │
│  [🔍 Searching nearby agents...]                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Screen Fields Table

### Order Detail Fields
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Order ID | Text | Yes | - | #ORD-101 | |
| Elapsed Time | Timer | Yes | Updates live | 3m 45s | Time since placed |
| Order Items | Array | Yes | - | 2x Burger | Includes modifiers |
| Total Amount | Currency | Yes | - | ₹450 | |
| Payment Mode | Text | Yes | - | Pre-paid / COD | Critical for hand-off |
| Customer Info | Text | Yes | - | John (98..) | Hidden if privacy rules apply |

---

## 5. Validation Rules
- **Lifecycle Sequence**: An order cannot skip steps (e.g., Pending cannot jump straight to Delivered).
- **Rejection Reason**: If Reject is clicked, a reason string > 5 chars must be provided.
- **Double Acceptance**: The system must use optimistic locking or atomic DB transactions so two staff members clicking "Accept" simultaneously doesn't trigger two delivery assignment flows.

---

## 6. Dependencies
- **Real-Time Dependency**: Absolutely requires WebSockets/Server-Sent Events. Polling is too slow for 30-second acceptance SLA windows.
- **Delivery App Dependency**: The Delivery Assignment microservice is invoked instantly upon clicking "Accept".

---

## 7. API Requirement Suggestions

- `GET /api/restaurant/orders/live`
  - **Purpose**: Fetch current active queue on initial load.
- `POST /api/restaurant/orders/{id}/accept`
  - **Purpose**: Triggers status change and delivery broadcasting.
- `POST /api/restaurant/orders/{id}/reject`
  - **Payload**: `{ "reason_code": "ITEM_UNAVAILABLE", "notes": "No buns left" }`
- `PATCH /api/restaurant/orders/{id}/status`
  - **Payload**: `{ "status": "Ready" }`

---

## 8. Database Table Suggestions (Restaurant Context)

### Table: `order_status_logs`
| Column Name | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `order_id` | UUID | FK |
| `status` | ENUM | E.g. 'Accepted' |
| `updated_by`| UUID | User ID who clicked |
| `timestamp` | TIMESTAMP | |

### Table: `delivery_assignments`
| Column Name | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `order_id` | UUID | FK |
| `delivery_agent_id`| UUID | FK |
| `status` | ENUM | 'Searching', 'Assigned', 'Arrived' |

---

## 9. Role & Permission Logic
- **Branch Manager**: Can Accept, Reject, and advance all states.
- **Kitchen Staff**: Can only advance states (`Preparing` → `Ready`). Cannot Accept/Reject orders.

---

## 10. Development Notes
- **Audio Autoplay Blockers**: Browsers block audio until the user interacts with the page. Require a "Click to Start Shift" button upon login to initialize the audio context for order rings.
- **Redundancy**: If WebSocket connection drops, implement a long-polling fallback automatically.

---

# 7. Order Flow Logic & Real-Time Events

### Complete Event Lifecycle

1. **`customer_placed_order`**
   - *Trigger*: Customer app pays/confirms.
   - *Backend*: Inserts to DB `status='Pending'`.
   - *Socket*: Emits to `room_branch_{id}`.
   - *UI*: Adds to "Incoming" tab, plays audio ring.

2. **`restaurant_accepted_order`**
   - *Trigger*: Manager clicks Accept.
   - *Backend*: Updates DB `status='Preparing'`. Triggers Delivery Assignment queue worker.
   - *Socket*: Emits to Customer app ("Food is being prepared"). Emits to Delivery Agents matching radius.

3. **`delivery_agent_assigned`**
   - *Trigger*: Delivery app clicks Accept.
   - *Backend*: Locks assignment.
   - *Socket*: Emits agent details to Restaurant Portal and Customer App.
   - *UI*: Updates Order Details view with Agent Name/Photo/Phone.

4. **`restaurant_marked_ready`**
   - *Trigger*: Kitchen staff clicks "Ready".
   - *Backend*: Updates DB `status='Ready'`.
   - *Socket*: Alerts assigned Delivery Agent ("Food is ready for pickup").

---

# 8. Status Management System

| Current Status | UI Color | Next Allowed Actions / Statuses |
|----------------|----------|---------------------------------|
| `Pending`      | Yellow   | `Accepted` (Preparing), `Rejected` |
| `Preparing`    | Blue     | `Ready` |
| `Ready`        | Green    | `Picked Up` (Triggered by Agent usually) |
| `Picked Up`    | Purple   | `Delivered` (Triggered by Agent) |
| `Rejected`     | Red      | *Terminal state. Triggers Refund.* |
| `Cancelled`    | Red      | *Terminal state.* |

---

# 9. Global Database Schema Suggestions
*These tables are shared across all portals but deeply impact the Restaurant Portal.*

- **`branch_orders`**: (id, branch_id, customer_id, total_amt, status, created_at).
- **`food_item_availability`**: (branch_id, food_item_id, is_available) -> Much faster than storing in a monolithic catalog table.
- **`refund_logs`**: (id, order_id, amount, status, gateway_ref).

---

# 10. Role & Permission Logic

| Feature | Branch Manager | Kitchen Staff | Admin (Read-Only Proxy) |
|---|:---:|:---:|:---:|
| View Analytics | ✅ | ❌ | ✅ |
| Toggle Food Menu | ✅ | ✅ | ❌ |
| Accept/Reject Orders| ✅ | ❌ | ❌ |
| Mark as Ready | ✅ | ✅ | ❌ |
| Issue Manual Refund| ✅ | ❌ | ✅ (Global) |

---

# 11. Appendix — Reusable UI Components

1. **`OrderCard`**: A highly optimized React/Vue component displaying order summary, time elapsed, and action buttons.
2. **`Timer`**: A live counting string (e.g., `05:22`) that turns red if time > 10 mins.
3. **`RejectionModal`**: Form containing standard rejection reason radio buttons + text input.
4. **`AgentRadar`**: A visual pulsing dot UI indicating the system is pinging nearby delivery partners.

---

# 12. Appendix — Edge Cases & Error Handling

- **Delivery Partner Timeout**: If no agent accepts within 10 minutes, the portal alerts the Manager. Manager can choose to cancel/refund or switch to a third-party fallback (Dunzo/Shadowfax).
- **Branch Goes Offline**: If internet fails, the backend must detect WebSocket disconnection (ping/pong timeout). The system automatically stops accepting new orders (marks branch temporarily unavailable on Customer App).
- **Food Disabled While in Cart**: Customer attempts to checkout, backend validates against `food_item_availability`. Returns 409 Conflict error to customer.

---

# 13. Appendix — Suggested Tech Notes

### Recommended Tech Stack
- **Frontend**: React (Next.js/Vite) + Tailwind CSS.
- **State/Caching**: React Query (for analytics/menu) + Zustand/Redux (for live order arrays).
- **Real-Time Framework**: Socket.io (Node.js) or Pusher/Ably for managed WebSockets.
- **Queue Handling (Backend)**: Redis + BullMQ (for handling the delivery assignment broadcasting reliably).

### Offline Handling Architecture
Utilize Service Workers (PWA capabilities) to cache the static assets of the portal. If the connection drops, show a highly visible red banner: `"⚠️ YOU ARE OFFLINE. New orders cannot be received. Please check your internet connection."`

### Scalability Considerations
- Do not poll the database for active orders. Push state to clients via Redis pub/sub → WebSocket layer.
- Keep the `food_item_availability` checks in a Redis cache (Key: `branch:{id}:menu`) for sub-millisecond validation during customer checkouts.

***End of Document***
