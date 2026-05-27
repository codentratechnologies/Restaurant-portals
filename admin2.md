# Restaurant Order Management System — Admin Portal

## Product Requirement Document (PRD) + UI/UX Specification

| Document Property | Value |
|---|---|
| **Product Name** | Restaurant Order Management System (ROMS) |
| **Portal** | Admin Portal (Web) |
| **Version** | 2.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-05-26 |
| **Audience** | Administrators, Product Managers, UI/UX Designers, QA, Frontend Developers |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Global UI/UX Standards](#2-global-uiux-standards)
3. [Module 1 — Home & Analytics](#3-module-1--home--analytics)
   - [Screen 1.1: Admin Dashboard](#screen-11-admin-dashboard)
4. [Module 2 — Branch Management](#4-module-2--branch-management)
   - [Screen 2.1: Branch Dashboard (List View)](#screen-21-branch-dashboard-list-view)
   - [Screen 2.2: Create Branch Screen](#screen-22-create-branch-screen)
   - [Screen 2.3: Update Branch Screen](#screen-23-update-branch-screen)
   - [Screen 2.4: View Branch Details Screen](#screen-24-view-branch-details-screen)
   - [Screen 2.5: Assign Menu Screen](#screen-25-assign-menu-screen)
   - [Screen 2.6: Deactivate Branch Confirmation Modal](#screen-26-deactivate-branch-confirmation-modal)
5. [Module 3 — Employee Management](#5-module-3--employee-management)
   - [Screen 3.1: Employee Dashboard (List View)](#screen-31-employee-dashboard-list-view)
   - [Screen 3.2: Create Employee Screen](#screen-32-create-employee-screen)
   - [Screen 3.3: Update Employee Screen](#screen-33-update-employee-screen)
   - [Screen 3.4: Deactivate Employee Confirmation Modal](#screen-34-deactivate-employee-confirmation-modal)
6. [Module 4 — Order Report](#6-module-4--order-report)
   - [Screen 4.1: Order Calendar View (Default)](#screen-41-order-calendar-view-default)
   - [Screen 4.2: Order List Screen](#screen-42-order-list-screen)
   - [Screen 4.3: Order Detail View Screen](#screen-43-order-detail-view-screen)
7. [Module 5 — Food Management](#7-module-5--food-management)
   - [Screen 5.1: Food Catalog Dashboard](#screen-51-food-catalog-dashboard)
   - [Screen 5.2: Create Food Item Screen](#screen-52-create-food-item-screen)
   - [Screen 5.3: Update Food Item Screen](#screen-53-update-food-item-screen)
   - [Screen 5.4: View Food Item Slide-out Drawer](#screen-54-view-food-item-slide-out-drawer)
   - [Screen 5.5: Deactivate Food Item Confirmation Modal](#screen-55-deactivate-food-item-confirmation-modal)
8. [Global Role & Permission Matrix](#8-global-role--permission-matrix)

---

# 1. Executive Summary

The **Admin Portal** is a web-based central command panel of the Restaurant Order Management System (ROMS). It provides owners and corporate administrators with absolute control over the organization's branches, master menus, employee rosters, and financial performance analytics.

### Business Goals
- **Centralized Control**: Single interface to manage global parameters across all branch locations.
- **Roster & Audit Trail**: Oversee employees and track key operational analytics securely.
- **Unified Menu Catalog**: Maintain pricing consistency and dietary classification on food items chain-wide.

---

# 2. Global UI/UX Standards — DineOS Design Language

The DineOS Admin Portal follows a cohesive visual identity derived from the **DineOS brand mark** — a warm orange-gold circular emblem enclosing a spoon & fork motif, accented with fresh green leaves, and anchored by dark navy typography. Every screen, component, and interaction in the portal must adhere to these brand-aligned standards.

### 2.1 Design Tokens (DineOS Brand Palette)
- **Primary Color**: `#F28C28` (DineOS Orange) — Default call-to-action buttons, active navigation highlights, hyperlinks, and interactive focus rings. Derived from the warm orange gradient of the DineOS logo emblem.
- **Primary Gradient**: `linear-gradient(135deg, #F7A825 0%, #F28C28 50%, #E8751A 100%)` — Used for prominent CTAs, header accents, and branded UI surfaces. Mirrors the golden-to-deep-orange sweep of the circular logo ring.
- **Accent Color**: `#4CAF50` (DineOS Leaf Green) — Fresh, organic accent drawn from the twin leaves atop the logo. Used for success states, active status pills, save confirmations, and health indicators.
- **Text Primary**: `#1B2A4A` (DineOS Navy) — Primary heading and body text color, drawn from the dark navy "Dine" wordmark in the logo. Ensures strong readability and brand consistency.
- **Warning Color**: `#F59E0B` (Amber 500) — Warning states, pending status pills, and cautionary alerts.
- **Danger Color**: `#DC2626` (Red 600) — Destructive actions (delete, deactivate), error banners, and critical alerts.
- **Neutral BG**: `#FFF9F2` (Warm Cream) — App layout backdrop with a subtle warm undertone to complement the orange brand palette.
- **Card BG**: `#FFFFFF` — Table grids, forms, and detail summary cards.
- **Border / Divider**: `#F0E6D9` (Warm Sand) — Subtle dividers and card borders that harmonize with the warm color system.

### 2.2 Typography & Iconography
- **Font Family**: `'Inter', 'Segoe UI', sans-serif` — Clean, modern typeface for all UI elements.
- **Logo Mark**: The DineOS circular spoon-and-fork emblem must appear in the sidebar header and login screen. It should always be rendered at a minimum size of `32×32px` to preserve legibility of the utensil details.
- **Icon Style**: Outlined icons with `1.5px` stroke weight. Active navigation icons adopt the `Primary Color (#F28C28)` fill. Inactive icons use `#94A3B8` (Slate 400).

### 2.3 Global Interaction Rules
- **Optimistic UI Updates**: Toggles and simple configuration switches should display visual updates instantly, with automatic state rollback if the server API responds with an error.
- **Search Debounce**: Text search bars must run with a standard `300ms` debounce duration to prevent server overloading.
- **Modals**: Destructive confirmations must require a clear double-click or confirmation button click before API execution.
- **Button Hover States**: Primary action buttons use a slightly deepened shade (`#E8751A`) on hover with a `150ms ease` transition for tactile feedback.

### 2.4 Tabbed Interface Specification Standard
To ensure maximum clarity for frontend developers and UI/UX designers, screens containing tabbed views (e.g., within dashboards, tables, or detail panels) must follow a rigorous **Two-Section Structure** in their requirements definitions:

1. **Section A: Persistent Screen Shell & Tab Navigation**
   - **Persistent Visual Elements**: Define elements that are always visible regardless of the active tab (e.g., page title, breadcrumbs, primary global actions, audit metadata).
   - **Tab Bar Controller / Switcher**: Specify the navigation mechanism (labels, dynamic counts in badges, active/inactive states, and URL routing state persistence).
   - **Active Tab Indicator**: Bottom border underline, `3px solid #F28C28` (DineOS Orange) — replaces the default blue to maintain brand alignment.
   - **Persistent Elements Field Table**: Fields for global header buttons, title elements, and navigation selectors.

2. **Section B: Tab-Specific Content Viewports**
   - **Segmented Viewports**: List distinct subsections for *each tab* with their own high-fidelity ASCII wireframes/previews.
   - **Context-Specific Fields Table**: Provide unique fields tables mapped strictly to each individual tab's viewport content. This eliminates ambiguity around which filters, tables, and actions are local to a specific tab versus global to the screen.

---

# 3. Module 1 — Home & Analytics

## Screen 1.1: Admin Dashboard

### 1. Overview
Central dashboard that serves as the landing interface for ROMS Administrators. Displays aggregated metrics, revenue trends, top items, and recent orders. Supports date range, branch, and period-based filters.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  🍽 ROMS Admin    Search...           🔔 (3)  👤 Admin User ▼ │
├────────────┬────────────────────────────────────────────────┤
│            │  Dashboard                                     │
│  ▶ Home    │────────────────────────────────────────────────│
│  ○ Branches│ Welcome back, John          📅 May 1 - May 26  │
│  ○ Staff   │ Filter Branch: [All Branches ▼]   Period: [D|W|M]│
│  ○ Orders  │────────────────────────────────────────────────│
│  ○ Food    │ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│            │ │ 💰 Revenue  │ │ 📦 Orders  │ │ 🏪 Branches│   │
│            │ │ ₹12,45,600 │ │ 3,842      │ │ 12 Active  │   │
│            │ │ ▲ 12.5%    │ │ ▲ 8.3%     │ │            │   │
│            │ └────────────┘ └────────────┘ └────────────┘   │
│            │────────────────────────────────────────────────│
│            │  Revenue Trend Chart (Line Chart)              │
│            │  ₹ |       _/\_                                │
│            │  0 |______/____\_________________              │
│            │     May 1  May 7  May 14  May 21               │
│            │────────────────────────────────────────────────│
│            │ ┌──────────────────────┐ ┌───────────────────┐ │
│            │ │ Top Selling Items    │ │ Recent Orders     │ │
│            │ │ 1. Chicken Biryani   │ │ #ORD4021 - ₹450   │ │
│            │ │ 2. Margherita Pizza  │ │ #ORD4020 - ₹820   │ │
│            │ │ 3. Garlic Bread      │ │ #ORD4019 - ₹320   │ │
│            │ └──────────────────────┘ └───────────────────┘ │
└────────────┴────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Date Range Start | Date | No | Must be <= Date Range End; Cannot be in future | `2026-05-01` | Defaults to 30 days ago |
| Date Range End | Date | No | Must be >= Date Range Start; Cannot be in future | `2026-05-26` | Defaults to today |
| Filter Branch | Dropdown | No | Must exist in active branches table | `All Branches` | Supports multi-select or single branch |
| Period Toggle | Segmented | No | Must be Daily, Weekly, or Monthly | `Monthly` | Controls trend chart aggregation |
| Metric: Revenue | Currency | Read-only | Positive decimal | `₹12,45,600` | Displays total revenue of delivered orders |
| Metric: Orders | Number | Read-only | Integer >= 0 | `3,842` | Total orders count for selected filters |
| Metric: Branches | Number | Read-only | Integer >= 0 | `12 Active` | Count of currently active branches |
| Top Items Column: Rank| Number | Read-only | Integer >= 1 | `1` | Ranking of item by order volume |
| Top Items Column: Name| Text | Read-only | Min 3 chars | `Chicken Biryani` | Mapped food item title |
| Recent Orders: Order ID| Text | Read-only | Unique ID | `#ORD4021` | Clickable link to Screen 4.3 |
| Recent Orders: Amount | Currency | Read-only | Positive decimal | `₹450` | Billing total of order |

### 4. Validations
- Date range query interval cannot exceed `365 days`.
- Trend analytics calculations must safely handle division-by-zero check (e.g., zero sales in reference previous period).

### 5. Dependencies
- **Module Dependencies**: Depends on aggregated metrics provided by Module 2 (Branch data), Module 3 (Staff counts), Module 4 (Order details), and Module 5 (Food details).

---

# 4. Module 2 — Branch Management

## Screen 2.1: Branch Dashboard (List View)

### 1. Overview
Central branch management landing page that lists active and inactive restaurant locations. Admins can filter locations and access creation, detail view, or edit actions.

### 2. Screen Preview
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
│ B003  │ CP Delhi    │ New Delhi │ ● Inactive │ [View][Edit] │
├─────────────────────────────────────────────────────────────┤
│  Showing 1-10 of 24                        [<] [1] [2] [>]  │
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Search Box | Text | No | Max 50 characters | `MG Road` | Filters table columns by Branch Name or Code |
| Status Filter | Dropdown | No | Must match 'Active', 'Inactive', or 'All' | `Active` | Filters branch listings |
| City Filter | Dropdown | No | Must exist in systems city master database | `Bangalore` | Filters branch listings |
| Table Column: Code | Text | Read-only | Unique alphanumeric code | `B001` | Unique branch identifier |
| Table Column: Name | Text | Read-only | Min 3 chars | `MG Road` | Branch branch name |
| Table Column: City | Text | Read-only | Valid city | `Bangalore` | Branch city location |
| Table Column: Status | Badge | Read-only | 'Active' or 'Inactive' badge | `Active` | Color-coded status badge |
| Row Action: View | Link | — | Triggers page change | `[View]` | Navigates to Screen 2.4 (Detail) |
| Row Action: Edit | Link | — | Triggers page change | `[Edit]` | Navigates to Screen 2.3 (Update) |

### 4. Validations
- Search box input must contain at least `2 characters` before querying database records.

---

## Screen 2.2: Create Branch Screen

### 1. Overview
Input form used to register a new physical restaurant location in the system database.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  Create New Branch                                          │
├─────────────────────────────────────────────────────────────┤
│  Basic Information                                          │
│  [Branch Code: B004     ]   [Branch Name: Indiranagar      ]  │
│  [Contact Email: indira@roms.com] [Phone Number: 9876543210]  │
│                                                             │
│  Location Details                                           │
│  [Address Line 1: 100 Feet Rd, 4th Block                    ]  │
│  [City: Bangalore      ▼]   [State: Karnataka        ▼]     │
│  [Pincode: 560038       ]                                   │
│                                                             │
│  Operational Details                                        │
│  [Opening Time: 10:00 AM]   [Closing Time: 11:00 PM ]       │
│                                                             │
│                                       [Cancel] [Create Branch]│
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Branch Code | Text | Yes | Unique, alphanumeric, min 3 / max 10 characters | `B004` | Identifier |
| Branch Name | Text | Yes | Min 3, max 100 characters | `Indiranagar` | Official location name |
| Contact Email | Email | Yes | Valid email format | `indira@roms.com` | Alerts sent to this address |
| Phone Number | Phone | Yes | Numeric, exactly 10 digits | `9876543210` | Contact phone |
| Address Line 1 | Text | Yes | Min 10, max 255 characters | `100 Feet Rd, 4th Block` | Location address |
| City | Dropdown | Yes | Selected value must match active city list | `Bangalore` | City list |
| State | Dropdown | Yes | Selected value must match active state list | `Karnataka` | State list |
| Pincode | Text | Yes | Numeric, exactly 6 digits | `560038` | Local postal code |
| Opening Time | Time | Yes | Valid 12-hour/24-hour time format | `10:00 AM` | Start of shift |
| Closing Time | Time | Yes | Valid time format, chronologically after Opening | `11:00 PM` | End of shift |

### 4. Validations
- **Duplicate Code**: System checks that the inputted `Branch Code` is unique before allow registration.
- **Operating Hours**: Closing time must be chronologically after the opening time.
- **Data Format**: Phone number must contain only numeric characters.

---

## Screen 2.3: Update Branch Screen

### 1. Overview
Interface used to update the configuration of an existing branch. The unique Branch Code is permanently locked to preserve data records.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  Update Branch — MG Road (B001)                             │
├─────────────────────────────────────────────────────────────┤
│  Basic Information                                          │
│  Branch Code: B001 (Locked) [Branch Name: MG Road Branch   ]  │
│  [Contact Email: mgroad@roms.com] [Phone Number: 9811223344]  │
│                                                             │
│  Location Details                                           │
│  [Address Line 1: 123, Main Street, MG Road                 ]  │
│  [City: Bangalore      ▼]   [State: Karnataka        ▼]     │
│  [Pincode: 560001       ]                                   │
│                                                             │
│  Operational Details                                        │
│  [Opening Time: 10:00 AM]   [Closing Time: 11:00 PM ]       │
│                                                             │
│                                       [Cancel] [Save Changes]│
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Branch Code | Label | — | Locked read-only display element | `B001` | Non-editable |
| Branch Name | Text | Yes | Min 3, max 100 characters | `MG Road Branch` | Location name |
| Contact Email | Email | Yes | Valid email format | `mgroad@roms.com` | Alerts email |
| Phone Number | Phone | Yes | Numeric, exactly 10 digits | `9811223344` | Contact phone |
| Address Line 1 | Text | Yes | Min 10, max 255 characters | `123, Main Street` | Location address |
| City | Dropdown | Yes | Selected value must match active city list | `Bangalore` | City list |
| State | Dropdown | Yes | Selected value must match active state list | `Karnataka` | State list |
| Pincode | Text | Yes | Numeric, exactly 6 digits | `560001` | Postal code |
| Opening Time | Time | Yes | Valid time format | `10:00 AM` | Opening hours |
| Closing Time | Time | Yes | Valid time format, chronologically after Opening | `11:00 PM` | Closing hours |

### 4. Validations
- Closing time must be chronologically after the opening time.
- Changes must be saved using an active database transaction.

---

## Screen 2.4: View Branch Details Screen

### 1. Overview
A single-page detail screen for viewing all information related to a specific branch. The screen is divided into two zones: a **persistent header card** that always displays the branch's core identity (name, code, email, status), and an **internal tabbed panel** below it that allows switching between different detail views without leaving the page. This follows the pattern shown in the reference design — a clean header section followed by an inline tab switcher.

### 2. Screen Layout

The screen is composed of two visual zones stacked vertically:

**Zone 1 — Branch Identity Header Card (Always Visible)**
A non-scrollable summary card pinned at the top of the screen. Displays core branch identity fields and primary action buttons. This zone never changes when switching tabs.

**Zone 2 — Internal Tabbed Content Panel**
A tab bar immediately below the header card. Each tab renders its own content viewport inline, replacing only the area below the tab bar. The active tab is visually indicated with an underline highlight. The screen supports three tabs:

| Tab Label | Badge Count | Description |
|---|---|---|
| Branch Information | — | Detailed branch configuration and audit trail |
| Assigned Menu | Dynamic (e.g. `25`) | Food items mapped to this branch |
| Employees | Dynamic (e.g. `8`) | Staff assigned to this branch |

### 3. Screen Preview (Full Composite View — Branch Information Tab Active)
```text
┌─────────────────────────────────────────────────────────────┐
│  ‹ Back                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MG Road Branch (B001)                    [Edit] [Deactivate]│
│  Branch Name:  MG Road Branch                               │
│  Branch Code:  B001                                         │
│  Email:        mgroad@roms.com                              │
│  Status:       ● Active                                     │
│                                                             │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│  [Branch Information]    Assigned Menu (25)    Employees (8) │
│  ─────────────────────                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Branch Code        │ B001                               ││
│  │ Address Details    │ 123, Main Street, MG Road          ││
│  │ City               │ Bangalore                          ││
│  │ State              │ Karnataka                          ││
│  │ Pincode            │ 560001                             ││
│  │ Contact Phone      │ +91 9811223344                     ││
│  │ Operating Hours    │ 10:00 AM to 11:00 PM               ││
│  │ Created By         │ admin_user on 2026-05-01 10:00 AM  ││
│  │ Updated By         │ admin_user on 2026-05-20 03:30 PM  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### SECTION A: Branch Identity Header Card (Persistent — Always Visible)

This zone remains fixed at the top regardless of which tab is active. It provides instant identification and primary management actions.

#### 1. Header Card Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Back Button | Link | Yes | Navigates back to Branch Dashboard (Screen 2.1) | `‹ Back` | Top-left navigation link |
| Branch Title | Label | Read-only | Format: `{Name} ({Code})` | `MG Road Branch (B001)` | Main page heading, prominent display |
| Branch Name | Label | Read-only | Min 3 characters | `MG Road Branch` | Displayed below title |
| Branch Code | Label | Read-only | Unique alphanumeric code | `B001` | Displayed below branch name |
| Email | Label | Read-only | Valid email format | `mgroad@roms.com` | Branch contact email |
| Status Indicator | Badge | Read-only | Green pill for `Active`, Red pill for `Inactive` | `● Active` | Color-coded status pill next to identity |
| Button: Edit | Button | Yes | Navigates to Update Branch (Screen 2.3) | `[Edit]` | Primary action — top-right |
| Button: Deactivate | Button | Yes | Triggers confirmation modal (Screen 2.6) | `[Deactivate]` | Destructive action — top-right |

---

### SECTION B: Internal Tab Bar Controller

The tab bar sits directly below the header card, acting as the switcher for the content panel. Only one tab is active at a time. The active tab displays an **underline highlight** (primary color `#2563EB`) beneath its label.

#### 1. Tab Bar Behavior
| Property | Specification |
|---|---|
| Default Active Tab | `Branch Information` (first tab) |
| Active Tab Indicator | Bottom border underline, `2px solid #2563EB` |
| Inactive Tab Style | Neutral gray text, no underline |
| Badge Counts | Dynamic numeric counts shown in parentheses for `Assigned Menu` and `Employees` tabs |
| URL State Persistence | Active tab selection must be reflected in the URL query parameter (e.g. `?tab=menu`) so that page refresh preserves the selected tab |
| Keyboard Navigation | Supports `←` / `→` arrow key navigation between tabs, `Enter` to activate |

---

### SECTION C: Tab Content Viewports

Each tab renders its own dedicated content area below the tab bar. When a tab is selected, only the content viewport area swaps — the header card and tab bar remain static.

---

#### Tab 1: Branch Information

Displays the full operational configuration of the branch in a **vertical key-value detail card** format (label on left, value on right), matching the reference design layout. Includes address details, contact information, operating hours, and system audit trail.

##### 1. Branch Information Tab Preview
```text
├─────────────────────────────────────────────────────────────┤
│  [Branch Information]    Assigned Menu (25)    Employees (8) │
│  ─────────────────────                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────┬─────────────────────────────────────┐│
│  │ Branch Code       │ B001                                ││
│  ├───────────────────┼─────────────────────────────────────┤│
│  │ Address Details   │ 123, Main Street, MG Road           ││
│  ├───────────────────┼─────────────────────────────────────┤│
│  │ City              │ Bangalore                           ││
│  ├───────────────────┼─────────────────────────────────────┤│
│  │ State             │ Karnataka                           ││
│  ├───────────────────┼─────────────────────────────────────┤│
│  │ Pincode           │ 560001                              ││
│  ├───────────────────┼─────────────────────────────────────┤│
│  │ Contact Phone     │ +91 9811223344                      ││
│  ├───────────────────┼─────────────────────────────────────┤│
│  │ Contact Email     │ mgroad@roms.com                     ││
│  ├───────────────────┼─────────────────────────────────────┤│
│  │ Operating Hours   │ 10:00 AM to 11:00 PM                ││
│  ├───────────────────┼─────────────────────────────────────┤│
│  │ Created By        │ admin_user on 2026-05-01 10:00 AM   ││
│  ├───────────────────┼─────────────────────────────────────┤│
│  │ Edited By         │ admin_user on 2026-05-20 03:30 PM   ││
│  └───────────────────┴─────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

##### 2. Branch Information Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Branch Code | Text | Read-only | Unique alphanumeric code | `B001` | Unique branch identifier |
| Address Details | Text | Read-only | Minimum 10 characters | `123, Main Street, MG Road` | Full street address |
| City | Text | Read-only | Valid city name | `Bangalore` | Branch city |
| State | Text | Read-only | Valid state name | `Karnataka` | Branch state |
| Pincode | Text | Read-only | Exactly 6 digits | `560001` | Postal code |
| Contact Phone | Phone | Read-only | Exactly 10 digits, displayed with `+91` prefix | `+91 9811223344` | Branch contact number |
| Contact Email | Email | Read-only | Valid email format | `mgroad@roms.com` | Notification email |
| Operating Hours | Text | Read-only | Format: `{Open Time} to {Close Time}` | `10:00 AM to 11:00 PM` | Daily operational window |
| Created By | Text | Read-only | Format: `{user} on {timestamp}` | `admin_user on 2026-05-01 10:00 AM` | Audit trail — creator identity and timestamp combined |
| Edited By | Text | Read-only | Format: `{user} on {timestamp}` | `admin_user on 2026-05-20 03:30 PM` | Audit trail — last editor identity and timestamp combined |

---

#### Tab 2: Assigned Menu

Displays the list of food items currently mapped to this branch in a tabular format. Includes an action button to navigate to the menu assignment screen.

##### 1. Assigned Menu Tab Preview
```text
├─────────────────────────────────────────────────────────────┤
│   Branch Information    [Assigned Menu (25)]    Employees (8)│
│                         ─────────────────────                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Assigned Menu Items                           [+ Assign Menu]│
│  ┌─────────────┬───────────────────────────────┬────────────┐│
│  │ Item Code   │ Food Item Name                │ Price      ││
│  ├─────────────┼───────────────────────────────┼────────────┤│
│  │ F012        │ Chicken Biryani               │ ₹299       ││
│  │ F045        │ Margherita Pizza              │ ₹199       ││
│  │ F023        │ Garlic Bread                  │ ₹149       ││
│  └─────────────┴───────────────────────────────┴────────────┘│
│  Showing 1-10 of 25                       [<] [1] [2] [>]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

##### 2. Assigned Menu Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Button: Assign Menu | Button | Yes | Redirects to Assign Menu (Screen 2.5) | `[+ Assign Menu]` | Tab-specific action to manage menu mappings |
| Menu Table: Item Code | Text | Read-only | Alphanumeric unique code | `F012` | Linked food item code |
| Menu Table: Name | Text | Read-only | Minimum 3 characters | `Chicken Biryani` | Master food item title |
| Menu Table: Price | Currency | Read-only | Positive decimal format | `₹299` | Branch selling price |
| Pagination | Control | Yes | Standard page navigation | `Showing 1-10 of 25` | Paginated at 10 items per page |

---

#### Tab 3: Employees

Lists the staff members currently assigned to this branch in a tabular format.

##### 1. Employees Tab Preview
```text
├─────────────────────────────────────────────────────────────┤
│   Branch Information    Assigned Menu (25)    [Employees (8)]│
│                                               ──────────────│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Branch Employees                                           │
│  ┌──────────┬──────────────────┬────────────────┬──────────┐│
│  │ ID       │ Full Name        │ Role           │ Status   ││
│  ├──────────┼──────────────────┼────────────────┼──────────┤│
│  │ E101     │ John Doe         │ Manager        │ ● Active ││
│  │ E102     │ Jane Smith       │ Kitchen Staff  │ ● Active ││
│  │ E103     │ Ravi Patel       │ Delivery       │ ● Active ││
│  └──────────┴──────────────────┴────────────────┴──────────┘│
│  Showing 1-8 of 8                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

##### 2. Employees Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Employee Table: ID | Text | Read-only | Unique alphanumeric staff code | `E101` | Unique employee ID |
| Employee Table: Name | Text | Read-only | Minimum 2 characters | `John Doe` | Combined first and last name |
| Employee Table: Role | Text | Read-only | Valid operational system role | `Manager` | Role description |
| Employee Table: Status | Badge | Read-only | `Active` or `Inactive` state | `● Active` | Color-coded status badge |
| Pagination | Control | Yes | Standard page navigation | `Showing 1-8 of 8` | Paginated at 10 items per page |

---

### SECTION D: Business Validations & Rules

1. **Audit Trail Integrity**: Audit tracking fields (Created By, Edited By) are system-managed and cannot be edited by any user.
2. **Dynamic Badge Counts**: The numeric counts displayed in the tab labels (e.g. `Assigned Menu (25)`, `Employees (8)`) must automatically recalculate whenever items are added or removed.
3. **Tab State Persistence**: The currently active tab must be preserved in the URL query string (e.g. `?tab=menu`) so that browser refresh or shared links restore the correct tab view.
4. **Back Navigation**: The `‹ Back` link must return the user to the Branch Dashboard (Screen 2.1), preserving any previously applied filters.

### SECTION E: Dependencies

- **Module Dependencies**: Depends directly on Module 3 (Employee Management) to retrieve staff roster records and Module 5 (Food Management) to query master menu catalog items mapped to this branch.

---

## Screen 2.5: Assign Menu Screen

### 1. Overview
Map food items from the master menu catalog to be available at this branch.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  Assign Menu — MG Road (B001)                [Save Changes] │
├─────────────────────────────────────────────────────────────┤
│  Category: [Pizza     ▼]   🔍 Search Food Item...            │
├─────────────────────────────────────────────────────────────┤
│ [x] Select All                                              │
│                                                             │
│ [x] Margherita Pizza     | Category: Pizza    | ₹299        │
│ [x] Farmhouse Pizza      | Category: Pizza    | ₹399        │
│ [ ] Garlic Bread         | Category: Sides    | ₹149        │
│ [ ] Choco Lava Cake      | Category: Desserts | ₹129        │
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Selection Checkbox | Checkbox | No | Checked state maps item to branch | `true` | Select individual item |
| Select All Checkbox| Checkbox | No | Boolean | `true` | Selects all currently filtered items |
| Item Name | Text | Read-only | Min 3 chars | `Margherita Pizza` | Master food item name |
| Item Category | Text | Read-only | Valid category tag | `Pizza` | Master category classification |
| Item Price | Currency | Read-only | Positive decimal | `₹299` | Item selling price |
| Category Filter | Dropdown | No | Must match active master category | `Pizza` | Filters list |
| Search Bar | Text | No | Max 50 characters | `Pizza` | Filters list by food name |

### 4. Validations
- Saving an empty menu selection must trigger a warning confirmation before execution.

### 5. Dependencies
- **Module Dependencies**: Relies directly on Module 5 (Food Management) master catalog to query the list of active food items available to assign.

---

## Screen 2.6: Deactivate Branch Confirmation Modal

### 1. Overview
Confirmation dialog when an Admin deactivates a branch. Halts online checkout operations at that specific branch immediately.

### 2. Screen Preview
```text
┌───────────────────────────────────────────────────────────┐
│  Deactivate Branch — MG Road?                          [X]│
├───────────────────────────────────────────────────────────┤
│  ⚠️ WARNING: Deactivating this branch will immediately stop  │
│  all customer applications from placing new orders here.   │
│  Active orders (5) will still be processed.               │
│                                                           │
│                       [Cancel]  [Confirm Deactivation]    │
└───────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
None. (Dialog confirmation buttons only).

### 4. Validations
- Executing the deactivation automatically flags the database status indicator to `Inactive`, disabling the branch for consumer search.

---

# 5. Module 3 — Employee Management

## Screen 3.1: Employee Dashboard (List View)

### 1. Overview
Tabular display containing the profile records of all system workers. Allows filtering by role type and branch assignment.

### 2. Screen Preview
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
│ E103  │ Bob Martin  │ Delivery│ CP Delhi│ ● Inactive│ [Edit] │
├─────────────────────────────────────────────────────────────┤
│  Showing 1-10 of 42                        [<] [1] [2] [>]  │
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Search Bar | Text | No | Max 50 characters | `John` | Filters by employee name, email, or employee code |
| Role Filter | Dropdown | No | Must match 'Manager', 'Kitchen', 'Delivery', or 'All' | `Manager` | Filters rows by operational role |
| Branch Filter | Dropdown | No | Must match active branch ID | `MG Road` | Filters rows by mapped location |
| Table Column: ID | Text | Read-only | Alphanumeric unique code | `E101` | Employee unique code |
| Table Column: Name | Text | Read-only | Min 2 chars | `John Doe` | Employee name |
| Table Column: Role | Text | Read-only | Mapped enum role | `Manager` | Mapped employee role |
| Table Column: Branch | Text | Read-only | Mapped branch location | `MG Road` | Mapped branch location |
| Table Column: Status | Badge | Read-only | 'Active' or 'Inactive' badge | `Active` | Status pill indicator |
| Row Action: Edit | Link | — | Triggers page change | `[Edit]` | Navigates to Screen 3.3 |

### 4. Validations
- Standard alphanumeric search. Debounced at client level.

---

## Screen 3.2: Create Employee Screen

### 1. Overview
Registration form to onboard system operators and managers, mapping them to explicit branch environments.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  Create New Employee                                        │
├─────────────────────────────────────────────────────────────┤
│  Personal Details                                           │
│  [First Name: Amit     ]      [Last Name: Kumar         ]   │
│  [Email: amit@roms.com ]      [Phone Number: 9876543211 ]   │
│                                                             │
│  Employment Details                                         │
│  [Role: Manager       ▼]      [Assign Branch: MG Road   ▼]  │
│  [Date of Joining: 2026-05-26]                              │
│                                                             │
│  Authentication                                             │
│  [Password: ********** ]      [Confirm Password: *******]   │
│                                                             │
│                                      [Cancel] [Save Profile]│
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| First Name | Text | Yes | Min 2, max 50 characters; letters only | `Amit` | Staff given name |
| Last Name | Text | Yes | Min 2, max 50 characters; letters only | `Kumar` | Staff surname |
| Email Address | Email | Yes | Valid unique email syntax | `amit@roms.com` | Used for portal credentials |
| Phone Number | Phone | Yes | Numeric, exactly 10 digits | `9876543211` | Contact phone |
| Role Selection | Dropdown | Yes | Role must be in validated system enum | `Manager` | Determines portal permissions |
| Assign Branch | Dropdown | Yes* | Mapped branch ID | `MG Road` | Required if role is Manager, Kitchen, or Delivery |
| Date of Joining| Date | Yes | Cannot be future date | `2026-05-26` | Start date record |
| Password | Password | Yes | Min 8 characters; 1 upper, 1 lower, 1 digit, 1 special | `**********` | Hashed securely |
| Confirm Password| Password| Yes | Must match Password exactly | `**********` | Verification check |

### 4. Validations
- Email must be unique globally across users.
- Confirm Password must match Password exactly.
- Assign Branch is dynamically required if the user role selected is Manager, Kitchen Staff, or Delivery Executive.

### 5. Dependencies
- **Module Dependencies**: Relies on Module 2 (Branch Management) to load active physical branches inside the dropdown selection.

---

## Screen 3.3: Update Employee Screen

### 1. Overview
Interface to update staff profiles. Password entry is hidden by default and can be bypassed unless explicitly resetting credentials.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  Update Employee — John Doe (E101)                          │
├─────────────────────────────────────────────────────────────┤
│  Personal & Employment Details                              │
│  Employee ID: E101 (Locked)                                 │
│  [First Name: John     ]      [Last Name: Doe           ]   │
│  [Email: john@roms.com (Locked)] [Phone Number: 9811223344]  │
│  [Role: Manager       ▼]      [Assign Branch: MG Road   ▼]  │
│  [Date of Joining: 2026-05-01]                              │
│                                                             │
│  [ Reset Password (Optional) ]                              │
│                                                             │
│                                      [Cancel] [Save Changes]│
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| First Name | Text | Yes | Min 2, max 50 characters | `John` | Given name |
| Last Name | Text | Yes | Min 2, max 50 characters | `Doe` | Surname |
| Email Address | Label | — | Locked read-only | `john@roms.com` | Cannot modify username |
| Phone Number | Phone | Yes | Numeric, exactly 10 digits | `9811223344` | Contact number |
| Role Selection | Dropdown | Yes | Valid system role | `Manager` | System permission |
| Assign Branch | Dropdown | Yes* | Mapped branch ID | `MG Road` | Mapped location |
| Date of Joining| Date | Yes | Cannot be future date | `2026-05-01` | Start date |

### 4. Validations
- Email and Employee ID fields are locked and non-editable.
- If password reset is toggled, new password validation rules are enforced.

### 5. Dependencies
- **Module Dependencies**: Relies on Module 2 (Branch Management) to populate the active branch selection choices.

---

## Screen 3.4: Deactivate Employee Confirmation Modal

### 1. Overview
Warning panel triggered when suspending employee accounts, revoking portal permissions immediately.

### 2. Screen Preview
```text
┌───────────────────────────────────────────────────────────┐
│  Deactivate Employee — John Doe?                       [X]│
├───────────────────────────────────────────────────────────┤
│  ⚠️ WARNING: Deactivating this employee will immediately     │
│  revoke all access to active ROMS portals and sessions.    │
│  Active orders handled by them will not be deleted.       │
│                                                           │
│                       [Cancel]  [Confirm Deactivation]    │
└───────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
None.

### 4. Validations
- On confirmation, the employee's status in the database switches to `Inactive`, and all active user JWT tokens are revoked instantly.

---

# 6. Module 4 — Order Report

## Screen 4.1: Order Calendar View (Default)

### 1. Overview
A calendar dashboard displaying aggregated daily totals of completed orders and sales figures. Admins can click any date cell to browse that day's orders.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  Order Reports                             [<] May 2026 [>] │
├─────────────────────────────────────────────────────────────┤
│  Sun    │  Mon    │  Tue    │  Wed    │  Thu    │  Fri    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│         │         │         │         │ 1       │ 2       │
│         │         │         │         │ Ord: 12 │ Ord: 15 │
│         │         │         │         │ ₹4,500  │ ₹5,200  │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ 3       │ 4       │ 5       │ 6       │ 7       │ 8       │
│ Ord: 8  │ Ord: 14 │ Ord: 22 │ Ord: 19 │ Ord: 11 │ Ord: 25 │
│ ₹2,100  │ ₹4,200  │ ₹8,500  │ ₹6,100  │ ₹3,800  │ ₹9,500  │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Month Selector | Buttons | Yes | Calendar boundary navigation | `May 2026` | Switches month and queries daily summary metrics |
| Calendar Day Cell| Button | Yes | Interactive date click trigger | `Ord: 22` | Clicking cell redirects to Screen 4.2 |

### 4. Validations
- Clicking future dates is disabled.
- Calendar renders only aggregated metrics.

---

## Screen 4.2: Order List Screen

### 1. Overview
Lists orders that were logged on a specific day. Admins can filter the orders and export the visible records.

### 2. Screen Preview
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

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Search Input | Text | No | Alphanumeric characters | `ORD101` | Search by Order ID or customer phone |
| Branch Filter | Dropdown | No | Must be valid branch ID or All | `MG Road` | Filters lists by branch location |
| Status Filter | Dropdown | No | Valid order status values | `Delivered` | Filters orders by status |
| Table Column: ID | Text | Read-only | Unique alphanumeric code | `#ORD101` | Clickable link to details |
| Table Column: Branch | Text | Read-only | Valid branch | `MG Road` | Branch location label |
| Table Column: Customer| Text | Read-only | Min 2 characters | `John D.` | Customer billing name |
| Table Column: Amount| Currency | Read-only | Positive decimal | `₹450` | Total billing value |
| Table Column: Status| Badge | Read-only | Valid status badge pill | `Delivered` | Color-coded status badge |
| Row Action: View | Link | — | Triggers detail page change | `[View]` | Navigates to Screen 4.3 |
| Button: Export | Button | Yes | Invokes CSV creation | `[Export to CSV]` | Triggers CSV download |

### 4. Validations
- CSV Exports are limited to a maximum range of `31 days` of order records in a single query block to prevent backend response timeouts.

### 5. Dependencies
- **System Dependencies**: Dependent on historical order data generated from Customer App checkout transactions and branch-level order states.

---

## Screen 4.3: Order Detail View Screen

### 1. Overview
Redesigned detailed layout showing the customer details, order itemization table, billing calculation block, vertical order lifecycle stepper, and delivery executive tracking metadata.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  < Back to List | Order #ORD101               ● Delivered   │
├─────────────────────────────────────────────────────────────┤
│  Customer Details                    |  Order Timeline      │
│  John Doe (9876543210)               |  [x] Placed 12:00 PM │
│  123 Main St, Bangalore              |  [x] Kitchen12:05 PM │
│                                      |  [x] Out    12:20 PM │
│  Order Items                         |  [x] Deliv. 12:45 PM │
│  ┌────────────────────────┬───────┬──────┬──────────────┐   │
│  │ Item Name              │ Price │ Qty  │ Subtotal     │   │
│  ├────────────────────────┼───────┼──────┼──────────────┤   │
│  │ Margherita Pizza       │ ₹299  │ 1    │ ₹299         │   │
│  │ Coke                   │ ₹50   │ 2    │ ₹100         │   │
│  └────────────────────────┴───────┴──────┴──────────────┘   │
│  Bill Summary                        |  Delivery Agent      │
│  Subtotal: ₹399 | Tax: ₹20 | Total: ₹419  Mike (9998887776) │
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Order Status Badge | Status Badge | Read-only | Color-coded status | `● Delivered` | Current database state |
| Customer Name | Text | Read-only | Min 2 chars | `John Doe` | Customer display name |
| Customer Phone | Phone | Read-only | Numeric digits | `9876543210` | Contact phone |
| Customer Address | Text | Read-only | Min 10 chars | `123 Main St, Bangalore` | Mapped delivery location |
| Delivery Agent | Text | Read-only | Name of courier | `Mike` | Display courier name |
| Agent Contact | Phone | Read-only | Numeric digits | `9998887776` | Phone number of courier |
| Item Table: Name | Text | Read-only | Min 3 characters | `Margherita Pizza` | Mapped food item title |
| Item Table: Price | Currency | Read-only | Positive decimal | `₹299` | Captured selling price |
| Item Table: Qty | Number | Read-only | Integer >= 1 | `1` | Ordered quantity count |
| Item Table: Subtotal| Currency | Read-only | Positive decimal | `₹299` | Line item total subtotal |
| Subtotal | Currency | Read-only | Positive decimal | `₹399` | Sum of all subtotals |
| Tax Amount | Currency | Read-only | Positive decimal | `₹20` | Computed taxes |
| Total Amount | Currency | Read-only | Positive decimal | `₹419` | Grand total billing price |
| Timeline Stepper | Step Tracker | Read-only | Step checkmarks | `[x] Placed` | Order tracking history |

### 4. Validations
- Historical records are read-only and cannot be altered by admins.
- Delivery address is hidden for takeaway or dine-in orders.

### 5. Dependencies
- **Module Dependencies**: Relies on Module 2 (Branch details) and Module 5 (Food item details) to fetch location and menu metadata.
- **System Dependencies**: Linked to delivery status events tracked by the Delivery App system.

---

# 7. Module 5 — Food Management

## Screen 5.1: Food Catalog Dashboard

### 1. Overview
Catalog repository listing all master items. Supports list and grid layouts.

### 2. Screen Preview
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

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Search Bar | Text | No | Alphanumeric characters | `Burger` | Search by item name |
| Category Filter | Dropdown | No | Must be valid Category ID | `Pizza` | Filters by food category |
| Dietary Filter | Dropdown | No | Must match Veg, Non-Veg, Egg, Vegan | `Veg` | Filters by type |
| Item Card: Name | Text | Read-only | Min 3 chars | `Veg Burger` | Display name of food |
| Item Card: Price | Currency | Read-only | Positive decimal | `₹150` | Base selling price |
| Item Card: Dietary | Badge | Read-only | Veg, Non-Veg, Egg, Vegan | `Veg` | Dietary badge pill |
| Row Action: Edit | Link | — | Triggers page change | `[Edit]` | Navigates to Screen 5.3 |
| Row Action: View | Link | — | Opens slide-out panel | `[View]` | Navigates to Screen 5.4 |

### 4. Validations
- Standard debounced query validations.

---

## Screen 5.2: Create Food Item Screen

### 1. Overview
Form used to add a new food item to the system.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  Create Food Item                                           │
├─────────────────────────────────────────────────────────────┤
│  Item Details                  |  Item Image                │
│  [Item Name: Paneer Tikka    ] |  ┌──────────────────────┐  │
│  [Category: Starters      ▼]   |  │ [Image Preview]      │  │
│  [Dietary Type: Veg       ▼]   |  │ paneer_tikka.png     │  │
│  [Base Price (₹): 249.00     ] |  │                      │  │
│  [Description: Spiced cottage] |  │ [Change Image]       │  │
│  [cheese grilled in tandoor  ] |  └──────────────────────┘  │
│                                |                            │
│                       [Cancel] [Save Food Item]             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Item Name | Text | Yes | Min 3, max 100 characters, Unique | `Paneer Tikka` | Display name of the item |
| Category | Dropdown | Yes | Must match active categories master | `Starters` | Item classification |
| Dietary Type | Dropdown | Yes | Veg, Non-Veg, Egg, Vegan | `Veg` | Dietary classification |
| Base Price | Currency | Yes | Numeric, greater than zero | `249.00` | Default customer pricing |
| Description | Text Area | No | Max 500 characters | `Spiced cottage cheese...` | Item description |
| Item Image | File | Yes | PNG or JPG format, size < 2MB | `paneer_tikka.png` | Thumbnail upload |

### 4. Validations
- **Price Limit**: Price must be greater than zero.
- **Image Check**: Only JPG or PNG formats are allowed, under `2MB` max size.
- **Item Name**: Must be unique globally to avoid duplication.

### 5. Dependencies
- **Data Dependencies**: Relies on categories master mapping tables (e.g. Starters, Sides, Desserts) to resolve Category dropdown.

---

## Screen 5.3: Update Food Item Screen

### 1. Overview
Edit existing menu item details. Highlights current image and allows replacing it.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  Update Food Item — Paneer Tikka                            │
├─────────────────────────────────────────────────────────────┤
│  Item Details                  |  Item Image                │
│  [Item Name: Paneer Tikka    ] |  ┌──────────────────────┐  │
│  [Category: Starters      ▼]   |  │ [Current Image]      │  │
│  [Dietary Type: Veg       ▼]   |  │ paneer_tikka.png     │  │
│  [Base Price (₹): 279.00     ] |  │                      │  │
│  [Description: Spiced cottage] |  │ [Upload New Image]   │  │
│  [cheese grilled in tandoor  ] |  └──────────────────────┘  │
│                                |                            │
│                       [Cancel] [Save Changes]               │
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Item Name | Text | Yes | Min 3, max 100 characters, Unique | `Paneer Tikka` | Display name of the item |
| Category | Dropdown | Yes | Must match active categories master | `Starters` | Item classification |
| Dietary Type | Dropdown | Yes | Veg, Non-Veg, Egg, Vegan | `Veg` | Dietary classification |
| Base Price | Currency | Yes | Numeric, greater than zero | `279.00` | Default customer pricing |
| Description | Text Area | No | Max 500 characters | `Spiced cottage cheese...` | Item description |
| Item Image | File | No | PNG or JPG format, size < 2MB | `paneer_tikka.png` | Replaces current thumbnail |

### 4. Validations
- Item image upload is optional for updates.
- Modifying price only affects future orders; historical order items tables retain checkout price details.

### 5. Dependencies
- **Data Dependencies**: Relies on categories configuration tables to resolve Category dropdown.

---

## Screen 5.4: View Food Item Slide-out Drawer

### 1. Overview
Redesigned detailed drawer panel sliding from the right edge. Displays CDN image preview, item configurations, and a mapping table showing which branch locations have this item active on their menu.

### 2. Screen Preview
```text
┌─────────────────────────────────────────────────────────────┐
│  Paneer Tikka Detail View                                [X]│
├─────────────────────────────────────────────────────────────┤
│  [Image: Paneer Tikka CDN URL]                             │
│  Name: Paneer Tikka | Price: ₹279.00 | Tag: 🟢 Veg          │
│  Category: Starters                                         │
│  Description: Spiced cottage cheese grilled in tandoor.     │
│                                                             │
│  Assigned Locations Mappings                                │
│  ┌─────────────┬─────────────────────┬──────────────────┐   │
│  │ Branch Code │ Branch Name         │ Branch Status    │   │
│  ├─────────────┼─────────────────────┼──────────────────┤   │
│  │ B001        │ MG Road Branch      │ ● Active         │   │
│  │ B004        │ Indiranagar Branch  │ ● Active         │   │
│  └─────────────┴─────────────────────┴──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Item Name | Text | Read-only | Min 3 chars | `Paneer Tikka` | Food item title |
| Base Price | Currency | Read-only | Positive decimal | `₹279.00` | Current base pricing |
| Category Label | Text | Read-only | Min 3 chars | `Starters` | Category classification |
| Description | Text | Read-only | Max 500 chars | `Spiced cottage cheese...` | Description notes |
| Branch Table: Code | Text | Read-only | Valid alphanumeric code | `B001` | Mapped branch code |
| Branch Table: Name | Text | Read-only | Min 3 chars | `MG Road Branch` | Mapped branch name |
| Branch Table: Status| Badge | Read-only | 'Active' or 'Inactive' badge | `Active` | Branch status badge |

### 4. Validations
- Mapped branch list queries active `branch_menus` tables to generate locations data dynamically.

### 5. Dependencies
- **Module Dependencies**: Relies on Module 2 (Branch Management) relationship tables to pull assigned branches mapping logs.

---

## Screen 5.5: Deactivate Food Item Confirmation Modal

### 1. Overview
Confirmation panel verifying global item deactivation, which removes it from customer-facing menus globally.

### 2. Screen Preview
```text
┌───────────────────────────────────────────────────────────┐
│  Deactivate Food Item Globally?                        [X]│
├───────────────────────────────────────────────────────────┤
│  ⚠️ WARNING: Deactivating this item will instantly remove    │
│  it from customer menus at all assigned branches.          │
│                                                           │
│                       [Cancel]  [Confirm Deactivation]    │
└───────────────────────────────────────────────────────────┘
```

### 3. Screen Fields Table
None.

### 4. Validations
- Requires explicit confirmation click.

---

# 8. Global Role & Permission Matrix

Permissions are strictly enforced based on the system roles:

| Module | Super Admin | Admin | Manager |
|---|:---:|:---:|:---:|
| **Dashboard / Analytics** | Full Access | Full Access | Branch Only |
| **Branch Management** | Full Access | Full Access | View Branch Only |
| **Employee Management**| Full Access | Full Access | View Branch Only |
| **Order Reports** | Full Access | Full Access | View Branch Only |
| **Food Management** | Full Access | Full Access | Read Only |

***End of Document***
