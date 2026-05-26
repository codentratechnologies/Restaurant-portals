# Restaurant Order Management System — Restaurant Portal

## Product Requirement Document (PRD) + UI/UX Specification

| Document Property | Value |
|---|---|
| **Product Name** | Restaurant Order Management System (ROMS) |
| **Portal** | Restaurant Portal (Web) |
| **Version** | 2.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-05-26 |
| **Audience** | Branch Managers, Kitchen Staff, UI/UX Designers, QA, Frontend Developers |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Global UI/UX Standards](#2-global-uiux-standards)
3. [Module 1 — Home & Analytics](#3-module-1--home--analytics)
   - [Screen 1.1: Branch Dashboard (Home)](#screen-11-branch-dashboard-home)
4. [Module 2 — Food Item List](#4-module-2--food-item-list)
   - [Screen 2.1: Menu Availability (List View)](#screen-21-menu-availability-list-view)
5. [Module 3 — Order Management](#5-module-3--order-management)
   - [Screen 3.1: Active Orders Queue Screen](#screen-31-active-orders-queue-screen)
   - [Screen 3.2: Rejection Reason Modal](#screen-32-rejection-reason-modal)
   - [Screen 3.3: Order Detail View](#screen-33-order-detail-view)
   - [Screen 3.4: Delivery Partner Search Radar Modal](#screen-34-delivery-partner-search-radar-modal)
6. [Status Management System](#6-status-management-system)
7. [Role & Permission Logic](#7-role--permission-logic)

---

# 1. Executive Summary

The **Restaurant Portal** is a web-based operational dashboard designed specifically for branch-level management. While the Admin Portal controls global configurations, this portal is strictly localized to a single branch's day-to-day order processing and menu control.

### Business Goals
- **Operational Speed**: Enable managers and kitchen staff to process incoming orders with zero latency.
- **Inventory Control**: Allow branches to toggle live menu availability instantly to prevent customer dissatisfaction from stock-outs.
- **Delivery Coordination**: Fully track the assignment of orders to third-party delivery partners and manage the physical handover.

### Target Roles
- **Branch Manager**: Full access. Manages orders, analytics, refunds, and menu availability.
- **Kitchen Staff**: Restricted access. Interacts with the active order queue to update preparation statuses.

---

# 2. Global UI/UX Standards

### 2.1 Design Tokens
- **Primary Color**: `#2563EB` (Blue 600) — Active states, default CTA buttons
- **Success Color**: `#16A34A` (Green 600) — Accept actions, Delivered, Active/In-Stock items
- **Warning Color**: `#F59E0B` (Amber 500) — Pending/Preparing states, Warnings
- **Danger Color**: `#DC2626` (Red 600) — Reject/Cancel actions, Out-of-Stock items
- **Neutral BG**: `#F8FAFC` (Slate 50) — General app background
- **Card BG**: `#FFFFFF` — Cards, modals, dropdowns

### 2.2 Modern Restaurant SaaS UX Rules
- **Audio Prompts**: Critical incoming events (New Orders) must trigger an audible ping.
- **Zero-Refresh UI**: The interface must utilize real-time sockets. Active queues must update immediately without manual page refreshes.
- **Kitchen-Legible Typography**: Use clean typography (`Inter`, `system-ui`) with large font sizing to ensure legibility from a distance in a busy kitchen environment.
- **Click to Start Shift**: Modern browsers block audio autoplay. On log in, staff must click a primary "Start Shift" button to initialize audio playback permissions.

---

# 3. Module 1 — Home & Analytics

## Screen 1.1: Branch Dashboard (Home)

### 1. Overview
Displays the branch landing dashboard, containing current daily statistics and a live view of active kitchen statuses. It acts as an overview panel for current daily shifts.

### 2. Screen Preview
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

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Sales Metric | Currency | Read-only | Positive decimal value | `₹45,200` | Displays today's total sales |
| Orders Count | Number | Read-only | Integer >= 0 | `124` | Today's total order count |
| Cancelled Count | Number | Read-only | Integer >= 0 | `3` | Today's cancelled order count |
| Pending Counter | Number | Read-only | Integer >= 0 | `4` | Live order count in Pending queue |
| Preparing Counter| Number | Read-only | Integer >= 0 | `12` | Live order count in Preparing queue |
| Ready Counter | Number | Read-only | Integer >= 0 | `2` | Live order count in Ready queue |

### 4. Validations
- Metrics update dynamically in real time through WebSocket push events.
- Sales Metric is masked/hidden if the logged-in user role is Kitchen Staff.

### 5. Dependencies
- **Data Dependencies**: Relies on real-time transaction updates pushed from the Customer App ordering flows.
- **Auth Dependencies**: Mapped branch details are restricted by the branch employee's login token scope.

---

# 4. Module 2 — Food Item List

## Screen 2.1: Menu Availability (List View)

### 1. Overview
Allows kitchen staff or managers to toggle the availability of menu items at the branch level in real time. Items toggled off will instantly be disabled on user ordering apps.

### 2. Screen Preview
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

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Search Input | Text | No | Max 50 characters | `Pizza` | Filters list by food item name |
| Category Filter | Dropdown | No | Valid master category ID or 'All' | `Pizza` | Filters list by category classification |
| Status Filter | Dropdown | No | 'All', 'Enabled', or 'Disabled' | `Enabled` | Filters list by stock state |
| Table Column: Image | Image | Read-only | Valid image CDN URL | `[Img]` | Display thumbnail of item |
| Table Column: Name | Text | Read-only | Min 3 chars | `Chicken Pizza` | Food item title |
| Table Column: Category| Text | Read-only | Valid category | `Pizza` | Food category label |
| Table Column: Price | Currency | Read-only | Positive decimal | `₹350` | Item price value |
| Table Column: Toggle | Switch | Yes | Boolean (true/false) | `true` | Optimistic UI toggle for stock availability |

### 4. Validations
- Search utilizes a minimum of `2 characters` before invoking the query.
- Toggling the availability switch invokes an immediate WebSocket/API broadcast. If the API request fails, the switch reverts to its prior visual state and triggers an error toast message.

### 5. Dependencies
- **Module Dependencies**: Relies on the Admin Portal's master food catalog (Module 5) to pull list items currently assigned to the branch.

---

# 5. Module 3 — Order Management

## Screen 3.1: Active Orders Queue Screen

### 1. Overview
Operational queue view for receiving and updating incoming branch orders. Separated into queues for `Incoming`, `Preparing`, and `Ready`.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  Orders         [Incoming (2)]  [Preparing (5)]  [Ready (1)]│
├─────────────────────────────────────────────────────────────┤
│  🔍 Search Order...                     Sort: [Oldest ▼]    │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────────────────┐ ┌────────────────────────┐       │
│ │ 🚨 NEW                 │ │ #ORD-102               │       │
│ │ #ORD-101               │ │ 1 min ago              │       │
│ │ 3 mins ago             │ │ 1x Veg Pizza           │       │
│ │ 2x Chicken Burger      │ │ 1x Garlic Bread        │       │
│ │ 1x Coke                │ │ Subt: ₹320 | Tax: ₹16  │       │
│ │ Subt: ₹450 | Tax: ₹22  │ │ Total: ₹336 | COD      │       │
│ │ Total: ₹472 | Card Paid│ │                        │       │
│ │                        │ │                        │       │
│ │ [❌ Reject] [✅ Accept] │ │ [❌ Reject] [✅ Accept] │       │
│ └────────────────────────┘ └────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Search Input | Text | No | Alphanumeric characters | `ORD-101` | Filters active queues by Order ID |
| Sort Dropdown | Dropdown | No | 'Oldest First' or 'Newest First' | `Oldest` | Orders queue sorting priority |
| Queue Tab | Tab Buttons | Yes | 'Incoming', 'Preparing', or 'Ready' | `Incoming` | Switches active view panels |
| Card: Order ID | Text | Read-only | Alphanumeric unique format | `#ORD-101` | Clickable to open detailed order panel |
| Card: Time | Text | Read-only | Elapsed duration string | `3 mins ago` | Counter from creation timestamp |
| Card: Items List | Text List | Read-only | List of line items | `2x Chicken Burger` | Summary of order components |
| Card: Subtotal | Currency | Read-only | Positive decimal | `₹450` | Sum of all item subtotals |
| Card: Tax Amount | Currency | Read-only | Positive decimal | `₹22` | Computed tax amount |
| Card: Total | Currency | Read-only | Positive decimal | `₹472` | Total billing value including tax |
| Card: Payment Status| Badge | Read-only | COD, Card Paid, UPI Paid | `Card Paid` | Payment status indicator badge |
| Button: Accept | Button | Yes | Invokes accept API transaction | `[Accept]` | Advances status to Preparing (Green) |
| Button: Reject | Button | Yes | Opens rejection reason drawer | `[Reject]` | Opens Screen 3.2 modal (Red) |

### 4. Validations
- Real-time sound effects trigger when new incoming orders enter the `Incoming` tab.
- Orders must be accepted within a set threshold (e.g. 5 minutes) before a warning indicator flashes on the card.

### 5. Dependencies
- **System Dependencies**: Directly dependent on customer order submissions created via the Customer Mobile App.

---

## Screen 3.2: Rejection Reason Modal

### 1. Overview
Modal overlay to specify the reason for rejecting a customer order.

### 2. Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Reject Order #ORD-101                                               [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Select Rejection Reason:                                                │
│  ( ) Out of Stock (select unavailable items next)                        │
│  ( ) Branch Overloaded (too many active orders)                          │
│  ( ) Closing Soon / Kitchen Closed                                       │
│  ( ) Other Reason (specify below)                                        │
│                                                                          │
│  Additional Notes:                                                       │
│  [____________________________________________________________________]  │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                [ Cancel ]  [ Reject Order ]│
└──────────────────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Rejection Reason | Radio Group | Yes | Selection must be one of the enum reasons | `Out of Stock` | System rejection code |
| Additional Notes | Text Area | No | Max 250 characters | `Kitchen running low on dough.` | Required only if 'Other Reason' is selected |
| Button: Reject | Button | Yes | Confirmation action | `[Reject Order]` | Submits rejection and issues API refund command |
| Button: Cancel | Button | Yes | Close overlay | `[Cancel]` | Discards modal changes |

### 4. Validations
- If 'Other Reason' is selected, `Additional Notes` becomes strictly mandatory with a minimum of `5 characters`.
- Pre-paid orders trigger an automated refund API call upon submission.

---

## Screen 3.3: Order Detail View

### 1. Overview
Redesigned detailed layout showing customer credentials, itemized list, pricing breakdown, delivery partner locator, and a vertical order status stepper timeline.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  < Back | Order #ORD-101               ● Preparing          │
├─────────────────────────────────────────────────────────────┤
│  Items (3)                     |  Order Lifecycle           │
│  2x Chicken Burger    ₹300     |  [✔] Placed    12:00 PM    │
│  1x Coke              ₹150     |  [✔] Accepted  12:05 PM    │
│  Subtotal: ₹450 | Tax: ₹22     |  [●] Preparing             │
│  Grand Total: ₹472             |  [ ] Ready for Pickup      │
│                                |  [ ] Out for Delivery      │
│  Customer Details              |  [ ] Delivered             │
│  John Doe (9876543210)         |                            │
│  123, Main Rd, Bangalore       |      [ Mark as Ready ]     │
│                                |                            │
│  Delivery Partner              |                            │
│  Name: Mike (9998887776)       |                            │
│  Status: Out for Delivery      |                            │
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Order Status Badge | Status Badge | Read-only | Color-coded status | `● Preparing` | Mapped from database status value |
| Customer Name | Text | Read-only | Min 2 chars | `John Doe` | Customer display name |
| Customer Phone | Phone | Read-only | Numeric digits | `9876543210` | Contact phone |
| Customer Address | Text | Read-only | Min 10 chars | `123, Main Rd, Bangalore` | Mapped delivery location |
| Delivery Partner | Text | Read-only | Name of courier | `Mike` | Shows searching status if unassigned |
| Partner Contact | Phone | Read-only | Numeric digits | `9998887776` | Phone number of courier |
| Item Table Column: Qty | Number | Read-only | Integer >= 1 | `2x` | Quantity of items |
| Item Table Column: Name| Text | Read-only | Min 3 chars | `Chicken Burger` | Name of dish |
| Item Table Column: Total| Currency | Read-only | Positive decimal | `₹300` | Subtotal for line item |
| Bill Subtotal | Currency | Read-only | Positive decimal | `₹450` | Sum of all item subtotals |
| Tax Amount | Currency | Read-only | Positive decimal | `₹22` | Computed tax amount |
| Grand Total | Currency | Read-only | Positive decimal | `₹472` | Total billing amount |
| Timeline Stepper | Step Tracker | Read-only | Step checkmarks | `[✔] Accepted` | Mapped history with timestamps |
| Button: Ready | Button | Yes* | Active when status is Preparing | `[Mark as Ready]` | Advances state to Ready (Blue) |

### 4. Validations
- The customer address card is hidden for Takeaway or Dine-in orders.
- The "Mark as Ready" button is visible and active only when the order status is currently `Preparing`.

### 5. Dependencies
- **System Dependencies**: Relies on the Delivery Partner Portal/Service for live geo-matching tracking data.
- **Workflow Dependencies**: Status updates to `Picked Up` and `Delivered` are dependent on actions executed by the Delivery App operator.

---

## Screen 3.4: Delivery Partner Search Radar Modal

### 1. Overview
Visual tracking popup showing delivery runner assignment status.

### 2. Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Delivery Partner Search                                             [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Assigning Delivery Partner for Order #ORD-101                           │
│                                                                          │
│                     .  *  .                                              │
│                  .     *     .                                           │
│                .      (●)      .                                         │
│                  .   Pulse   .                                           │
│                     .  *  .                                              │
│                                                                          │
│  Pinging nearby delivery partners within 3km...                          │
│  Time Elapsed: 00:45                                                     │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                            [ Cancel ]  [ Assign Manual ] │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Elapsed Counter | Timer | Read-only | MM:SS time format | `00:45` | Counter tracking search duration |
| Button: Manual | Button | Yes | Opens manual assignment listing | `[Assign Manual]` | Overrides radar search |
| Button: Cancel | Button | Yes | Discards modal search | `[Cancel]` | Aborts search |

### 4. Validations
- If searching duration exceeds `10 minutes`, the modal updates to an alert state, forcing the manager to either select manual mapping or cancel and refund the order.

### 5. Dependencies
- **System Dependencies**: Directly tied to the Delivery Partner matching microservice network to query active couriers within a 3km radius.

---

# 6. Status Management System

The order status flow is strictly governed by the following state transitions:

| Current Status | Next Allowed Status | Action Trigger | UI Treatment |
|---|---|---|---|
| `Pending` | `Preparing` | Accept Order button clicked | Yellow badge |
| `Pending` | `Rejected` | Reject Order submitted in modal | Red badge (Terminal) |
| `Preparing` | `Ready` | Mark as Ready button clicked | Blue badge |
| `Ready` | `Picked Up` | Delivery Partner confirms pickup | Green badge |
| `Picked Up` | `Delivered` | Delivery Partner confirms delivery | Purple badge |
| `Picked Up` | `Cancelled` | Cancelled by Admin/Manager | Red badge (Terminal) |

---

# 7. Role & Permission Logic

Permissions are strictly enforced based on the branch role:

| Feature / Action | Branch Manager | Kitchen Staff |
|---|:---:|:---:|
| View Sales & Financial KPIs | ✅ | ❌ |
| Toggle Menu Item Availability | ✅ | ✅ |
| Accept / Reject Incoming Orders | ✅ | ❌ |
| Mark Order as Ready | ✅ | ✅ |
| Cancel Order & Trigger Refund | ✅ | ❌ |

***End of Document***
