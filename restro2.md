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

The **Restaurant Portal** is a web-based operational dashboard designed specifically for branch-level management. While the Admin Portal controls global operations, this portal is strictly localized to a single branch.

### Business Goals
- **Operational Speed**: Enable managers and kitchen staff to process incoming orders with zero latency.
- **Inventory Control**: Allow branches to toggle live menu availability instantly to prevent customer dissatisfaction from stock-outs.
- **Delivery Coordination**: Fully track the assignment of orders to third-party delivery partners and manage the handover.

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

### Screen Preview
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

### Screen Description & Layout
- **Purpose**: Displays the branch landing dashboard, containing current daily statistics and a live view of active kitchen statuses.
- **Header Section**: Displays the Branch Name, Live Digital Clock, Notification Bell, and profile avatar.
- **Row 1 (Metrics)**: Summary cards for Today's Sales, Orders Count, and Cancelled Orders with comparative indicators against the previous period.
- **Row 2 (Kitchen Load Status)**: Funnel visualizer that maps orders currently in `Pending`, `Preparing`, and `Ready` states.
- **Row 3 (Analytics Charts)**: Peak Hours bar chart (shows orders per hour) and a ranked list of Top Selling Items (with total order quantities).

### Screen Fields & Controls
- **Today's Sales**: Currency text showing total income. Disabled for Kitchen Staff roles.
- **Live Summary Counters**: Live-updated numeric totals for active statuses. Updates via WebSocket.

### Validation Rules
- All daily calculations are relative to the branch's local timezone.
- No data belonging to other branches can be queried.

### Edge Cases
- **No Orders Placed Yet**: Metric cards show ₹0 / 0. Funnel displays zero numbers and chart area displays *"Waiting for the first order..."*

---

# 4. Module 2 — Food Item List

## Screen 2.1: Menu Availability (List View)

### Screen Preview
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
│ ├───────────────────────────────────────────────────────────┤
│  Showing 1-15 of 80                        [<] [1] [2] [>]  │
└─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Allows kitchen staff or managers to toggle the availability of menu items at the branch level in real time.
- **Filters/Search**: Text search by item name. Dropdowns to filter by Category and stock availability.
- **Data Table**: Columns showing Item Image, Name, Category, Price, and a prominent Toggle Switch (Enabled = In Stock, Disabled = Out of Stock).

### Screen Fields & Controls
- **Availability Toggle Switch**: Updates the item availability. Displays an optimistic UI toggle effect (switches instantly, rolls back if the save request fails).

### Validation Rules
- **Toggling Sync**: Setting an item to disabled must instantly broadcast the update to prevent customers from adding it to their carts.
- **Checkout Integrity**: If a customer checks out with an item that was toggled to disabled while in their cart, checkout will fail with a warning message.

---

# 5. Module 3 — Order Management

## Screen 3.1: Active Orders Queue Screen

### Screen Preview
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

### Screen Description & Layout
- **Purpose**: Operational command view for receiving and tracking current live orders.
- **Navigation Tabs**: Filter queues for `Incoming`, `Preparing`, and `Ready` orders.
- **Queue Cards**: Render the Order ID, elapsed time (e.g., "3m ago"), item details, total price, payment method, and primary action buttons.
- **Incoming Tab Actions**: "Accept" button (advances state and triggers delivery assignment) and "Reject" button (opens Rejection Modal).

---

## Screen 3.2: Rejection Reason Modal

### Screen Preview
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

### Screen Description & Layout
- **Purpose**: Modal to collect reasons for rejecting a customer's order.
- **Triggers**: Opens when the "Reject" button is clicked on an incoming order.
- **Fields**: Radio button selections for common reasons and a text input field for additional comments.
- **Actions**: "Reject Order" (solid red, requires reason selection) and "Cancel".

### Validation Rules
- Selecting "Other Reason" requires additional notes of at least 5 characters.
- Submitting a rejection triggers an automatic refund process for pre-paid orders.

---

## Screen 3.3: Order Detail View

### Screen Preview
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

### Screen Description & Layout
- **Purpose**: Displays the complete details of a single order.
- **Left Column**: Displays the line items list, customer contact details, and the delivery partner block (shows search status or name).
- **Right Column**: Displays the vertical lifecycle timeline and the primary status advancement action ("Mark as Ready").

---

## Screen 3.4: Delivery Partner Search Radar Modal

### Screen Preview
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

### Screen Description & Layout
- **Purpose**: Displays delivery partner search radar progress.
- **Triggers**: Automatically opens when an order is accepted, or when searching is manually re-initiated.
- **Layout**: Centered popup containing a pulsing radar graphic, a live clock indicating search duration, and a cancel button.

### Edge Cases
- **No Agent Accepts**: If search exceeds 10 minutes, the modal shifts to a warning state, prompting the manager to cancel/refund or assign a manual courier partner.

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
