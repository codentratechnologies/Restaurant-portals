# Restaurant Order Management System — Admin Portal

## UI/UX Screen Specification & Wireframes

This document details the visual layouts, interactive components, screen fields, and user flows for the **Admin Portal (Web)** of the Restaurant Order Management System (ROMS).

---

## Table of Contents

1. [Global UI/UX Standards](#1-global-uiux-standards)
2. [Module 1 — Home & Analytics](#2-module-1--home--analytics)
3. [Module 2 — Branch Management](#3-module-2--branch-management)
4. [Module 3 — Employee Management](#4-module-3--employee-management)
5. [Module 4 — Order Report](#5-module-4--order-report)
6. [Module 5 — Food Management](#6-module-5--food-management)

---

# 1. Global UI/UX Standards

### 1.1 Layout Structure

The Admin Portal uses a responsive three-pane layout featuring a fixed sidebar, a flexible topbar, and a scrollable main content area.

```text
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR: Logo | Search | Notifications | Profile Dropdown    │
├────────────┬─────────────────────────────────────────────────┤
│            │  BREADCRUMB: Home > Module > Screen             │
│  SIDEBAR   ├─────────────────────────────────────────────────┤
│            │                                                 │
│  • Home    │  MAIN CONTENT AREA                              │
│  • Branches│                                                 │
│  • Employees│  ┌─────────────────────────────────────────┐   │
│  • Orders  │  │  Page Title + Action Buttons             │   │
│  • Food    │  ├─────────────────────────────────────────┤   │
│  • Settings│  │  Filters / Search Bar                    │   │
│            │  ├─────────────────────────────────────────┤   │
│            │  │  Data Table / Cards / Content            │   │
│            │  │                                          │   │
│            │  ├─────────────────────────────────────────┤   │
│            │  │  Pagination                              │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
├────────────┴─────────────────────────────────────────────────┤
│  FOOTER: © 2026 ROMS | Version 1.0.0                         │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Design Tokens

| Token | Value | Usage |
|---|---|---|
| Primary Color | `#2563EB` (Blue 600) | Buttons, links, active states |
| Secondary Color | `#16A34A` (Green 600) | Success states, positive metrics |
| Warning Color | `#F59E0B` (Amber 500) | Warnings, pending states |
| Danger Color | `#DC2626` (Red 600) | Errors, delete actions, negative metrics |
| Neutral BG | `#F8FAFC` (Slate 50) | Page background |
| Card BG | `#FFFFFF` | Card surfaces |
| Text Primary | `#1E293B` (Slate 800) | Headings, primary text |
| Text Secondary | `#64748B` (Slate 500) | Labels, descriptions |
| Border Color | `#E2E8F0` (Slate 200) | Dividers, card borders |
| Font Family | `Inter, system-ui, sans-serif` | All text typography |
| Border Radius | `8px` | Cards, buttons, inputs |

### 1.3 Global States

- **Loading State**: Shimmering skeleton cards and placeholders matching the expected content layout.
- **Empty State**: Centered illustration, descriptive status label, and a primary call-to-action (CTA) button.
- **Error State**: Red top banner with description and a retry action button.
- **Success State**: Toast notification appearing at the top-right (dismisses automatically in 4s).
- **Confirmation State**: Centered dialog modal showing warning icon, descriptive message, destructive action (Red), and Cancel (Outline).

### 1.4 Status Badge Standards

| Status | Color | Badge Style |
|---|---|---|
| Active | Green `#16A34A` | Filled pill |
| Inactive | Gray `#94A3B8` | Filled pill |
| Pending | Amber `#F59E0B` | Filled pill |
| Assigned | Blue `#2563EB` | Filled pill |
| Delivered | Green `#16A34A` | Outlined pill |
| Cancelled | Red `#DC2626` | Filled pill |
| Processing | Blue `#2563EB` | Outlined pill with pulse |
| Out for Delivery | Indigo `#6366F1` | Filled pill |

### 1.5 Responsive Breakpoints

- **Desktop (≥ 1280px)**: Expanded sidebar with full labels.
- **Tablet (768px – 1279px)**: Collapsed sidebar showing only icons.
- **Mobile (< 768px)**: Hidden sidebar with hamburger menu toggle.

---

# 2. Module 1 — Home & Analytics

## 2.1 Overview & Flow

The Home Dashboard is the default landing page. It provides a real-time operational dashboard for system administrators to view revenue metrics, active branch summaries, and order statuses.

### User Flow
1. Admin logs into the portal and lands on the **Dashboard**.
2. Admin applies filters (date range, branch selector, time period).
3. The dashboard widgets update with relevant data.
4. Admin can click the export button to pull statistics or click a recent order row to inspect details.

---

## 2.2 UI/UX Layout Description

- **Header Section**: Page title, Date Range Picker, Multi-Select Branch Dropdown, Period Selector (Daily/Weekly/Monthly), and Export Button.
- **KPI Metrics Row**: 4 cards showing total revenue, total orders, active branches, and active employees.
- **Analytics Charts**:
  - **Left (60% width)**: Interactive Area Chart displaying revenue trends.
  - **Right (40% width)**: Doughnut Chart representing order status distribution.
- **Lower Section**:
  - **Left Column**: Branch Performance compared side-by-side using a horizontal bar chart.
  - **Right Column**: Top 10 selling food items listed with image thumbnails and rank.
- **Recent Orders Table**: A data table displaying the last 20 orders placed across all selected branches.

---

## 2.3 Screen Preview — Admin Dashboard

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Home > Dashboard                                           │
│  ▶ Home    │─────────────────────────────────────────────────────────────│
│    Dashboard│  Welcome back, John          📅 01 May - 26 May  │All Branches ▼│
│    Analytics│                              [Daily|Weekly|Monthly] [Export ▼]│
│  ○ Branches│─────────────────────────────────────────────────────────────│
│  ○ Employees│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│  ○ Orders  │ │ 💰 Revenue   │ │ 📦 Orders    │ │ 🏪 Branches  │ │ 👥 Staff   ││
│  ○ Food    │ │ ₹12,45,600   │ │ 3,842        │ │ 12 Active    │ │ 86 Active  ││
│            │ │ ▲ 12.5%      │ │ ▲ 8.3%       │ │              │ │            ││
│            │ └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘│
│            │─────────────────────────────────────────────────────────────│
│            │ ┌──────────────────────────────┐ ┌────────────────────────┐│
│            │ │  Revenue Trend (Line Chart)  │ │  Order Status (Donut)  ││
│            │ │  ___/\___/\___               │ │     ╭───╮              ││
│            │ │ /            \               │ │    │     │             ││
│            │ │/              \_____         │ │     ╰───╯              ││
│            │ │                              │ │ ● Delivered  72%       ││
│            │ │ Jan Feb Mar Apr May          │ │ ● Cancelled   8%       ││
│            │ └──────────────────────────────┘ │ ● Pending    12%       ││
│            │                                  │ ● Processing  8%       ││
│            │                                  └────────────────────────┘│
│            │─────────────────────────────────────────────────────────────│
│            │  Recent Orders                              [View All →]    │
│            │ ┌──────┬──────────┬──────────┬─────┬────────┬───────────┐   │
│            │ │ ID   │ Customer │ Branch   │ Qty │ Amount │ Status    │   │
│            │ ├──────┼──────────┼──────────┼─────┼────────┼───────────┤   │
│            │ │#4021 │ Rahul S. │ Koramang.│  3  │ ₹450   │ ● Deliver.│   │
│            │ │#4020 │ Priya K. │ MG Road  │  5  │ ₹820   │ ● Pending │   │
│            │ │#4019 │ Amit R.  │ Whitefld.│  2  │ ₹320   │ ● Process.│   │
│            │ └──────┴──────────┴──────────┴─────┴────────┴───────────┘   │
│            │                       [1] [2] [3] ... [→]                   │
└────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2.4 Screen Fields & Actions

### Dashboard Filter Bar
- **Date Picker**: Start and End calendar dropdowns.
- **Branch Dropdown**: Multi-select panel listing all active branches.
- **Period Toggle**: Tabbed control options (Daily | Weekly | Monthly).
- **Export Trigger**: Dropdown option button (Export as PDF / Export as CSV).

### Recent Orders Table Columns
- **Order ID**: Formatted order code linking to the specific order detail card.
- **Customer Name**: Plain text label of the user who ordered.
- **Branch**: Assigned restaurant location name.
- **Items**: Text counting number of items ordered.
- **Total Amount**: Formatted currency showing net price.
- **Status**: Visual status badge using global standard colors.

---

# 3. Module 2 — Branch Management

## 3.1 Overview & Flow

The Branch Management module enables administrators to add new branch locations, adjust address/timing details, and map menu availability at a branch level.

### User Flows
- **Branch Setup**: Admin click `+ Add Branch` → fills out coordinates and operations → saves.
- **Menu Customization**: Admin selects `Assign Menu` → searches items → checks or unchecks available food options → saves mappings.

---

## 3.2 UI/UX Layout Description

- **Branch Dashboard (List View)**: Main grid containing the list of branches, status indicators, and actions for quick editing or viewing.
- **Create & Update Form**: Grouped layouts split into Basic Info, Address Coordinates, and Operational Hours.
- **Branch Detail Page**: Multi-tabbed window containing overview data, assigned menu tables, and mapped employee rosters.
- **Assign Menu Screen**: Multi-select interface displaying items by category to map to the branch menu list.

---

## 3.3 Screen Previews

### 3.3.1 Branch Dashboard (List View)
```text
┌─────────────────────────────────────────────────────────────┐
│  Branches                                   [+ Add Branch]  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search by Name/Code...  [Status: All ▼] [City: All ▼]   │
├─────────────────────────────────────────────────────────────┤
│ Code  │ Name        │ City      │ Status     │ Actions      │
│-------│-------------│-----------│------------│--------------│
│ B001  │ MG Road     │ Bangalore │ ● Active   │ [View][Edit] │
│ B002  │ Andheri W   │ Mumbai    │ ● Active   │ [View][Edit] │
│ B003  │ CP          │ Delhi     │ ● Inactive │ [View][Edit] │
├─────────────────────────────────────────────────────────────┤
│  Showing 1-10 of 24                        [<] [1] [2] [>]  │
└─────────────────────────────────────────────────────────────┘
```

### 3.3.2 Create / Update Branch Form
```text
┌─────────────────────────────────────────────────────────────┐
│  Create New Branch                                          │
├─────────────────────────────────────────────────────────────┤
│  Basic Information                                          │
│  [ Branch Code       ]  [ Branch Name        ]              │
│  [ Contact Email     ]  [ Contact Phone      ]              │
│                                                             │
│  Location Details                                           │
│  [ Address Line 1                            ]              │
│  [ City ▼            ]  [ State ▼            ] [ Pincode  ] │
│                                                             │
│  Operational Details                                        │
│  [ Opening Time ▼    ]  [ Closing Time ▼     ]              │
│                                                             │
│                                           [Cancel] [Save]   │
└─────────────────────────────────────────────────────────────┘
```

### 3.3.3 Assign Menu Screen
```text
┌─────────────────────────────────────────────────────────────┐
│  Assign Menu — MG Road (B001)                [Save Changes] │
├─────────────────────────────────────────────────────────────┤
│  Category: [All ▼]   🔍 Search Food Item...                 │
├─────────────────────────────────────────────────────────────┤
│ [x] Select All                                              │
│                                                             │
│ [x] Margherita Pizza     | Category: Pizza    | ₹299        │
│ [ ] Farmhouse Pizza      | Category: Pizza    | ₹399        │
│ [x] Garlic Bread         | Category: Sides    | ₹149        │
│ [ ] Choco Lava Cake      | Category: Desserts | ₹129        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.4 Screen Fields & Actions

### Branch Details Form
- **Branch Code**: Input text. Must be unique.
- **Branch Name**: Input text.
- **Contact Email**: Input text (valid email format).
- **Contact Phone**: Input text (exactly 10 digits).
- **Address Line 1**: Input text.
- **City / State**: Dropdown selectors.
- **Pincode**: Input text (6 digits).
- **Opening / Closing Time**: Dropdown time selectors.

### Assign Menu Controls
- **Category Filter**: Dropdown menu.
- **Search bar**: Input text query.
- **Checkbox grid**: Toggle fields mapping items to branch inventory.

---

# 4. Module 3 — Employee Management

## 4.1 Overview & Flow

This module is used to onboarding employees (managers, kitchen staff, delivery partners) and assign them to respective branch nodes.

### User Flow
1. Admin navigates to the **Employee Directory**.
2. Selects `+ Add Employee` or chooses an existing profile.
3. Inputs employee credentials, tags a system Role, and assigns a target Branch.
4. Saving triggers profile creation. Deactivating revokes system access.

---

## 4.2 UI/UX Layout Description

- **Employee List View**: Tabular list showing name, contact details, assigned branch, operational role, and status toggle.
- **Employee Form Card**: 2-column input card highlighting personal info, credential passwords, and operational metrics.
- **Deactivate Modal**: Centered confirmation pop-up that alerts about immediate session revocation.

---

## 4.3 Screen Previews

### 4.3.1 Employee Dashboard (List View)
```text
┌─────────────────────────────────────────────────────────────┐
│  Employees                                [+ Add Employee]  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search by Name/Email... [Role: All ▼] [Branch: All ▼]   │
├─────────────────────────────────────────────────────────────┤
│ ID    │ Name        │ Role    │ Branch  │ Status   │ Action │
│-------│-------------│---------│---------│----------│--------│
│ E101  │ John Doe    │ Manager │ MG Road │ ● Active │ [Edit] │
│ E102  │ Jane Smith  │ Kitchen │ MG Road │ ● Active │ [Edit] │
│ E103  │ Bob Martin  │ Delivery│ CP Delhi│ ● Inactiv│ [Edit] │
├─────────────────────────────────────────────────────────────┤
│  Showing 1-10 of 42                        [<] [1] [2] [>]  │
└─────────────────────────────────────────────────────────────┘
```

### 4.3.2 Create / Update Employee Form
```text
┌─────────────────────────────────────────────────────────────┐
│  Create New Employee                                        │
├─────────────────────────────────────────────────────────────┤
│  Personal Details                                           │
│  [ First Name        ]  [ Last Name         ]               │
│  [ Email Address     ]  [ Phone Number      ]               │
│                                                             │
│  Employment Details                                         │
│  [ Role ▼            ]  [ Assign Branch ▼   ]               │
│  [ Date of Joining   ]                                      │
│                                                             │
│  Authentication Details                                     │
│  [ Password          ]  [ Confirm Password  ]               │
│                                                             │
│                                      [Cancel] [Save Profile]│
└─────────────────────────────────────────────────────────────┘
```

---

## 4.4 Screen Fields & Actions

### Employee Fields
- **First / Last Name**: Input text.
- **Email Address**: Input text (used for login authentication).
- **Phone Number**: Input text (10 digits).
- **Role Dropdown**: Enum field containing: Manager | Kitchen Staff | Delivery Partner.
- **Assign Branch**: Dropdown menu containing active branches (hidden if role is Global Admin).
- **Date of Joining**: Date selection picker.
- **Password / Confirm Password**: Secure input texts with visual visibility toggle (eye icon).

---

# 5. Module 4 — Order Report

## 5.1 Overview & Flow

Provides read-only summaries of historical orders. The entry screen utilizes a visual Calendar View showing revenue aggregates, which leads into paginated tables and split order timeline details.

### User Flow
1. Admin enters **Order Reports** and selects a target date on the Calendar.
2. The UI switches to the **Order List** filtered by the chosen date.
3. Clicking a row slide-opens the **Order Details drawer** showing item break-downs and real-time tracking milestones.

---

## 5.2 UI/UX Layout Description

- **Calendar View**: Month grid layout with dates. Active cells display order volume and revenue aggregates. Future dates are greyed out.
- **Order List Screen**: Paginated data grid with sorting filters and a primary CSV exporter button.
- **Detail Drawer / Modal**: Left-side card showing customer order totals, item tables, and right-side tracking stepper showing exact delivery timestamps.

---

## 5.3 Screen Previews

### 5.3.1 Calendar View
```text
┌─────────────────────────────────────────────────────────────┐
│  Order Reports                             [<] May 2026 [>] │
├─────────────────────────────────────────────────────────────┤
│  Sun    │  Mon    │  Tue    │  Wed    │  Thu    │  Fri    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│         │         │         │         │ 1       │ 2       │
│         │         │         │         │ Ord: 12 │ Ord: 15 │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ 3       │ 4       │ 5       │ 6       │ 7       │ 8       │
│ Ord: 8  │ Ord: 14 │ Ord: 22 │ Ord: 19 │ Ord: 11 │ Ord: 25 │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

### 5.3.2 Order List Screen
```text
┌─────────────────────────────────────────────────────────────┐
│  Orders for May 5, 2026                  [Export to CSV ▼]  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search Order ID...   [Branch: All ▼] [Status: All ▼]    │
├─────────────────────────────────────────────────────────────┤
│ Order ID │ Branch  │ Customer │ Amount │ Status     │ Action│
│----------│---------│----------│--------│------------│-------│
│ #ORD101  │ MG Road │ John D.  │ ₹450   │ ● Delivered│ [View]│
│ #ORD102  │ CP Delhi│ Sara K.  │ ₹120   │ ● Cancelled│ [View]│
├─────────────────────────────────────────────────────────────┤
│  Showing 1-20 of 220                       [<] [1] [2] [>]  │
└─────────────────────────────────────────────────────────────┘
```

### 5.3.3 Order Detail View
```text
┌─────────────────────────────────────────────────────────────┐
│  < Back to List | Order #ORD101               ● Delivered   │
├─────────────────────────────────────────────────────────────┤
│  Customer Details                    |  Order Timeline      │
│  John Doe (9876543210)               |  [x] Placed 12:00 PM │
│  123 Main St, Bangalore              |  [x] Kitchen12:05 PM │
│                                      |  [x] Out    12:20 PM │
│  Order Items                         |  [x] Deliv. 12:45 PM │
│  1x Margherita Pizza - ₹299          |                      │
│  2x Coke             - ₹100          |  Delivery Agent      │
│                                      |  Mike (9998887776)   │
│  Bill Summary                        |                      │
│  Subtotal: ₹399 | Tax: ₹20 | Total: ₹419                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5.4 Screen Fields & Actions

### Order Detail Fields (Read-Only)
- **Order Metadata**: ID, Status badge, Timestamp.
- **Customer details**: Name, Phone, Delivery Address (hidden for takeaways).
- **Billing breakdown**: Subtotal, Taxes, Delivery charges, discounts, Grand total.
- **Timeline stepper**: Visual nodes detailing transaction transitions from kitchen processing to final delivery agent handoff.

---

# 6. Module 5 — Food Management

## 6.1 Overview & Flow

Food Management provides a master menu repository. Items are cataloged here, assigned pricing and categories, and are then available for branch-level menu allocations.

### User Flow
- **Creation**: Admin opens **Food Catalog** → selects `+ Add Food Item` → fills description and uploads images → saves.
- **Disabling**: Admin marks a food item inactive in the global list. It instantly disappears from customer-facing menus in all branches.

---

## 6.2 UI/UX Layout Description

- **Food Dashboard**: Screen containing a List/Grid toggle switch. Shows items as rows or visual cards with large image thumbnails.
- **Food Form Split Layout**: Form fields on the left column; dedicated drag-and-drop file uploader area with visual thumbnail previews on the right column.
- **View Drawer**: Slides out from the right pane showing base prices, description tags, and a summary list of branches currently carrying the item.

---

## 6.3 Screen Previews

### 6.3.1 Food Dashboard (Grid View)
```text
┌─────────────────────────────────────────────────────────────┐
│  Food Catalog                            [+ Add Food Item]  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search Item...     [Category: All ▼] [Type: All ▼]      │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│ │ [Image]      │  │ [Image]      │  │ [Image]      │        │
│ │ Veg Burger   │  │ Choco Lava   │  │ Coke 300ml   │        │
│ │ ₹150 | 🟢 Veg │  │ ₹99  | 🟢 Veg │  │ ₹60 | 🟢 Veg  │        │
│ │ [Edit][View] │  │ [Edit][View] │  │ [Edit][View] │        │
│ └──────────────┘  └──────────────┘  └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  Showing 1-12 of 85                        [<] [1] [2] [>]  │
└─────────────────────────────────────────────────────────────┘
```

### 6.3.2 Create / Edit Food Item Form
```text
┌─────────────────────────────────────────────────────────────┐
│  Create Food Item                                           │
├─────────────────────────────────────────────────────────────┤
│  Item Details                  |  Item Image                │
│  [ Item Name         ]         |  ┌──────────────────────┐  │
│  [ Category ▼        ]         |  │                      │  │
│  [ Dietary Type ▼    ]         |  │  Drop Image Here     │  │
│  [ Base Price (₹)    ]         |  │  or Browse Files     │  │
│  [ Description               ] |  │                      │  │
│  [                           ] |  └──────────────────────┘  │
│                                |                            │
│                       [Cancel] [Save Food Item]             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6.4 Screen Fields & Actions

### Food Form Fields
- **Item Name**: Input text (must be globally unique).
- **Category Dropdown**: Selector populated from food categories.
- **Dietary Type Dropdown**: Selector options: Veg | Non-Veg | Egg | Vegan.
- **Base Price**: Input currency decimal (minimum > 0).
- **Description**: Text area (maximum 500 characters).
- **Item Image**: Interactive file drop uploader (supports JPG/PNG under 2MB).

***End of Document***
