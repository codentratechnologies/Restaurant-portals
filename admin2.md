# Restaurant Order Management System — Admin Portal

## Product Requirement Document (PRD) + UI/UX Specification

| Document Property | Value |
|---|---|
| **Product Name** | Restaurant Order Management System (ROMS) |
| **Portal** | Admin Portal (Web) |
| **Version** | 2.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-05-26 |
| **Audience** | Product Managers, UI/UX Designers, Frontend Developers, QA |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Global UI/UX Standards](#2-global-uiux-standards)
3. [Module 1 — Home & Analytics](#3-module-1--home--analytics)
   - [Screen 1.1: Admin Dashboard (Home)](#screen-11-admin-dashboard-home)
4. [Module 2 — Branch Management](#4-module-2--branch-management)
   - [Screen 2.1: Branch Dashboard (List View)](#screen-21-branch-dashboard-list-view)
   - [Screen 2.2: Create Branch](#screen-22-create-branch)
   - [Screen 2.3: Update Branch](#screen-23-update-branch)
   - [Screen 2.4: View Branch Details](#screen-24-view-branch-details)
   - [Screen 2.5: Assign Menu Screen](#screen-25-assign-menu-screen)
   - [Screen 2.6: Deactivate Branch Modal](#screen-26-deactivate-branch-modal)
5. [Module 3 — Employee Management](#5-module-3--employee-management)
   - [Screen 3.1: Employee Dashboard (List View)](#screen-31-employee-dashboard-list-view)
   - [Screen 3.2: Create Employee](#screen-32-create-employee)
   - [Screen 3.3: Update Employee](#screen-33-update-employee)
   - [Screen 3.4: Deactivate Employee Modal](#screen-34-deactivate-employee-modal)
6. [Module 4 — Order Report](#6-module-4--order-report)
   - [Screen 4.1: Calendar View (Default Screen)](#screen-41-calendar-view-default-screen)
   - [Screen 4.2: Order List Screen](#screen-42-order-list-screen)
   - [Screen 4.3: Order Detail View](#screen-43-order-detail-view)
7. [Module 5 — Food Management](#7-module-5--food-management)
   - [Screen 5.1: Food Dashboard (Grid/List View)](#screen-51-food-dashboard-gridlist-view)
   - [Screen 5.2: Create Food Item](#screen-52-create-food-item)
   - [Screen 5.3: Update Food Item](#screen-53-update-food-item)
   - [Screen 5.4: View Food Item Details Drawer](#screen-54-view-food-item-details-drawer)
   - [Screen 5.5: Deactivate Food Item Modal](#screen-55-deactivate-food-item-modal)

---

# 1. Executive Summary

The **Restaurant Order Management System (ROMS)** is a multi-portal SaaS platform designed to manage end-to-end restaurant operations across multiple branches. The platform consists of four portals: Admin Portal, Restaurant Portal, Customer App, and Delivery App.

**This document covers the Admin Portal exclusively, with a focus on UI/UX product flows.**

### Business Goals
- Provide a centralized command center for restaurant chain administrators.
- Enable real-time visibility into multi-branch operations, orders, and revenue.
- Streamline food menu management and branch-level menu assignment.
- Deliver actionable analytics for data-driven decision making.

### Target Users
- **Super Admin / Admin**: Full system access; manages all modules, branches, employees, food items, and reports.
- **Manager**: Assigned to specific branches; views local reports and branch-specific details.

---

# 2. Global UI/UX Standards

### 2.1 Layout Structure
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
└────────────┴─────────────────────────────────────────────────┘
```

### 2.2 Design Tokens
- **Primary Color**: `#2563EB` (Blue 600) — Buttons, links, active states
- **Secondary Color**: `#16A34A` (Green 600) — Success states, positive metrics
- **Warning Color**: `#F59E0B` (Amber 500) — Warnings, pending states
- **Danger Color**: `#DC2626` (Red 600) — Errors, delete actions, negative metrics
- **Neutral BG**: `#F8FAFC` (Slate 50) — Page background
- **Card BG**: `#FFFFFF` — Card surfaces
- **Text Primary**: `#1E293B` (Slate 800) — Headings, primary text
- **Text Secondary**: `#64748B` (Slate 500) — Labels, descriptions
- **Border Color**: `#E2E8F0` (Slate 200) — Dividers, card borders
- **Font Family**: `Inter, system-ui, sans-serif`
- **Border Radius**: `8px` — Cards, buttons, inputs

### 2.3 Global States
- **Loading**: Skeleton placeholders matching content layout; spinner on buttons.
- **Empty**: Illustration + descriptive text + primary CTA button.
- **Error**: Red alert banner with retry action; inline field errors in red.
- **Success**: Green toast notification (auto-dismiss after 4 seconds).
- **Confirmation**: Centered modal with destructive action in red, cancel in outline.

### 2.4 Status Badge Standards
- **Active**: Green `#16A34A` (Filled pill)
- **Inactive**: Gray `#94A3B8` (Filled pill)
- **Pending**: Amber `#F59E0B` (Filled pill)
- **Assigned**: Blue `#2563EB` (Filled pill)
- **Delivered**: Green `#16A34A` (Outlined pill)
- **Cancelled**: Red `#DC2626` (Filled pill)
- **Processing**: Blue `#2563EB` (Outlined pill with pulse)
- **Out for Delivery**: Indigo `#6366F1` (Filled pill)

### 2.5 Audit Fields (All Details Views)
All detail pages display the following audit trail metadata:
- `created_by` (Username) | `created_at` (`DD MMM YYYY, hh:mm A`)
- `updated_by` (Username) | `updated_at` (`DD MMM YYYY, hh:mm A`)

---

# 3. Module 1 — Home & Analytics

## Screen 1.1: Admin Dashboard (Home)

### Screen Preview
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

### Screen Description & Layout
- **Purpose**: Serves as the central command dashboard. It provides a real-time overview of revenue, orders, branch status, staff activity, and performance trends.
- **Top Filters Bar**: Contains Date Range Picker, Multi-select Branch Filter dropdown, Period Toggle (Daily/Weekly/Monthly), and Export Button (PDF/CSV options).
- **Row 1 (KPI Cards)**: Displays Revenue, Total Orders, Active Branches, and Active Staff. Shows comparison indicators (▲/▼ % vs previous period) with sparkline trends.
- **Row 2 (Charts Section)**: Split layout showing Revenue Trend (interactive Line Chart) on the left (60%) and Order Status distribution (Doughnut Chart) on the right (40%).
- **Row 3 (Recent Orders)**: Data table displaying the latest 20 orders with columns for ID, Customer, Branch, Qty, Amount, and Status Badge. Clicking a row navigates to the Order Detail View.

### Screen Fields & Controls
- **Date Range Picker**: Select custom start and end dates. Start date must be before or equal to today.
- **Branch Filter**: Dropdown allowing search and selection of "All Branches" or specific branch IDs.
- **Period Toggle**: Segmented control switching between `Daily`, `Weekly`, and `Monthly`.
- **Export Trigger**: Button that initiates download. Shows a temporary loading status on the button during PDF/CSV compilation.

### Validation Rules
- Date range selection must not exceed 365 days.
- Triggering an export on a filter criteria that yields zero data displays a warning toast.

### Edge Cases & Toasts
- **No Branches Created**: Displays empty state in place of charts with illustration and CTA "Create Your First Branch".
- **Export Initiated**: Information Toast: *"Preparing your export. Please wait..."*
- **Export Completed**: Success Toast: *"Report exported successfully."*
- **Export Failed**: Error Toast: *"Failed to export report. Please try again."*

---

# 4. Module 2 — Branch Management

## Screen 2.1: Branch Dashboard (List View)

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Branches > List                                            │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ▶ Branches│  Branches                                    [+ Add Branch] │
│    List    │─────────────────────────────────────────────────────────────│
│    Create  │  🔍 Search Code/Name...   [Status: All ▼]   [City: All ▼]   │
│  ○ Employees│─────────────────────────────────────────────────────────────│
│  ○ Orders  │ ┌──────┬──────────────┬───────────┬────────────┬──────────┐ │
│  ○ Food    │ │ Code │ Name         │ City      │ Status     │ Actions  │ │
│            │ ├──────┼──────────────┼───────────┼────────────┼──────────┤ │
│            │ │ B001 │ MG Road      │ Bangalore │ ● Active   │ [View]   │ │
│            │ │ B002 │ Andheri West │ Mumbai    │ ● Active   │ [Edit]   │ │
│            │ │ B003 │ CP Delhi     │ Delhi     │ ● Inactive │ [Menu]   │ │
│            │ └──────┴──────────────┴───────────┴────────────┴──────────┘ │
│            │  Showing 1-10 of 24                        [<] [1] [2] [>]  │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Displays the list of all restaurant branch locations. Provides filters to quickly query by operational status or location.
- **Header Bar**: Title "Branches" and a primary CTA "+ Add Branch" button.
- **Search & Filters**: Search bar queries by Branch Code or Branch Name. Status dropdown filters by `All`, `Active`, `Inactive`. City dropdown filters by cities loaded from active branch locations.
- **Branches Table**: Displays Code, Name, City, Status Badge, and Actions dropdown. Clicking "View" opens the Branch Detail view, "Edit" opens the Update screen, and "Menu" opens the Assign Menu screen.

---

## Screen 2.2: Create Branch

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Branches > Create Branch                                   │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ▶ Branches│  Create New Branch                                          │
│    List    │─────────────────────────────────────────────────────────────│
│    Create  │  ┌───────────────────────────┐ ┌──────────────────────────┐ │
│  ○ Employees│  │ Basic Information         │ │ Operational Details      │ │
│  ○ Orders  │  │ Name:   [_______________] │ │ Open Time:  [10:00 AM]   │ │
│  ○ Food    │  │ Code:   [_______________] │ │ Close Time: [11:00 PM]   │ │
│            │  │ Email:  [_______________] │ │ Status:     [Active  ▼]  │ │
│            │  │ Phone:  [_______________] │ └──────────────────────────┘ │
│            │  └───────────────────────────┘ ┌──────────────────────────┐ │
│            │  ┌───────────────────────────┐ │ Location Details         │ │
│            │  │ Address:                  │ │ City:       [Select   ▼] │ │
│            │  │ [_______________________] │ │ State:      [Select   ▼] │ │
│            │  │ [_______________________] │ │ Pincode:    [______]     │ │
│            │  └───────────────────────────┘ └──────────────────────────┘ │
│            │                                 [ Cancel ]  [ Save Branch ] │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Enables admins to register a new branch location with contact details, operating times, and physical address.
- **Form Layout**: 2-column grid categorized into "Basic Information", "Operational Details", "Address", and "Location Details".
- **Primary Actions**: "Save Branch" button (solid color, bottom right) and "Cancel" button (outlined, cancels form edit and redirects to List view).

### Screen Fields & Controls
- **Name**: Text box. Maximum 100 characters.
- **Code**: Text box. Unique ID (e.g., B004). Can be edited on creation but locked thereafter.
- **Email**: Text box. Valid email string.
- **Phone**: Text box. Standard 10-digit number.
- **Open / Close Time**: Time pickers (HH:MM AM/PM).
- **Status**: Dropdown containing `Active` (default) and `Inactive`.
- **Address / Pincode**: Text area for address, 6-digit numeric input for Pincode.
- **City / State**: Dropdowns loaded with regional constants.

### Validation Rules
- **Branch Code**: Must be unique (checked inline `onBlur` or during submit).
- **Time Logic**: Close Time must be chronologically after Open Time.
- **Pincode**: Exactly 6 digits.

### Toasts
- **Creation Success**: Success Toast: *"Branch 'MG Road' has been created successfully."*
- **Code Conflict**: Error Toast: *"Branch code already exists. Please choose a unique code."*

---

## Screen 2.3: Update Branch

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Branches > Edit Branch                                     │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ▶ Branches│  Edit Branch: MG Road (B001)                                │
│    List    │─────────────────────────────────────────────────────────────│
│    Create  │  ┌───────────────────────────┐ ┌──────────────────────────┐ │
│  ○ Employees│  │ Basic Information         │ │ Operational Details      │ │
│  ○ Orders  │  │ Name:   [MG Road        ] │ │ Open Time:  [10:00 AM]   │ │
│  ○ Food    │  │ Code:   [B001 (Locked)]   │ │ Close Time: [11:00 PM]   │ │
│            │  │ Email:  [mgroad@roms.com] │ │ Status:     [Active  ▼]  │ │
│            │  │ Phone:  [9876543210     ] │ └──────────────────────────┘ │
│            │  └───────────────────────────┘ ┌──────────────────────────┐ │
│            │  ┌───────────────────────────┐ │ Location Details         │ │
│            │  │ Address:                  │ │ City:       [Bangalore▼] │ │
│            │  │ [123, Main Street       ] │ │ State:      [Karnataka▼] │ │
│            │  │ [                       ] │ │ Pincode:    [560001]     │ │
│            │  └───────────────────────────┘ └──────────────────────────┘ │
│            │                                 [ Cancel ]  [ Save Changes ]│
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Modifies details of an existing branch.
- **Key Difference from Create**:
  - The "Branch Code" input field is permanently disabled/greyed-out to preserve relational database mapping.
  - Page title includes the current Branch Code.
- **Primary Actions**: "Save Changes" (Primary blue) and "Cancel" (Outlined).

### Validation Rules
- All fields (except Code) follow the same rules as the Create screen.
- Changing status to `Inactive` triggers the Deactivate Branch Modal if there are active ongoing orders.

---

## Screen 2.4: View Branch Details

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Branches > Branch Details                                  │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ▶ Branches│  MG Road (B001)                                 ● Active    │
│    List    │  [ Edit Branch ] [ Deactivate ]                             │
│    Create  │─────────────────────────────────────────────────────────────│
│  ○ Employees│  [ Overview ]  | Assigned Menu | Employees                 │
│  ○ Orders  │─────────────────────────────────────────────────────────────│
│  ○ Food    │  ┌───────────────────────────┐ ┌──────────────────────────┐ │
│            │  │ Contact Information       │ │ Operating Timings        │ │
│            │  │ Phone: +91 9876543210     │ │ Daily: 10:00 AM - 11:00PM│ │
│            │  │ Email: mgroad@roms.com    │ │                          │ │
│            │  └───────────────────────────┘ └──────────────────────────┘ │
│            │  ┌────────────────────────────────────────────────────────┐ │
│            │  │ Address                                                │ │
│            │  │ 123, Main Street, Bangalore, Karnataka - 560001        │ │
│            │  └────────────────────────────────────────────────────────┘ │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: A read-only overview page of a branch's configuration, menu, and personnel.
- **Header Section**: Displays branch name, unique code, active status badge, and action triggers: "Edit Branch" and "Deactivate".
- **Tabs Selection**:
  - **Overview**: Shows basic information cards, contact details, operating hours, and address details.
  - **Assigned Menu**: Lists food items mapped to this branch with local availability toggles.
  - **Employees**: Lists employees currently mapped to this branch.

---

## Screen 2.5: Assign Menu Screen

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Branches > MG Road > Assign Menu                           │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ▶ Branches│  Assign Menu: MG Road (B001)               [ Save Menu ]    │
│            │─────────────────────────────────────────────────────────────│
│  ○ Employees│  Category: [All           ▼]  🔍 Search items...            │
│  ○ Orders  │─────────────────────────────────────────────────────────────│
│  ○ Food    │  [x] Select All (12 items)                                  │
│            │  ┌────────────────────────────────────────────────────────┐ │
│            │  │ [x] Margherita Pizza     | Category: Pizza    | ₹299   │ │
│            │  │ [ ] Farmhouse Pizza      | Category: Pizza    | ₹399   │ │
│            │  │ [x] Garlic Bread         | Category: Sides    | ₹149   │ │
│            │  │ [ ] Choco Lava Cake      | Category: Desserts | ₹129   │ │
│            │  │ [x] Coca Cola 300ml      | Category: Beverages| ₹60    │ │
│            │  └────────────────────────────────────────────────────────┘ │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Maps food items from the global food catalog to be available at this specific branch.
- **Layout**: Simple checkbox list with food name, category, and base price. 
- **Filters**: Category dropdown filter and text search for food items.
- **Primary Actions**: "Save Menu" (Primary green, top right) updates the branch menu mapping.

---

## Screen 2.6: Deactivate Branch Modal

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Deactivate Branch                                                   [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ⚠️  Warning: Are you sure you want to deactivate 'MG Road (B001)'?     │
│                                                                          │
│  This action will:                                                       │
│  - Prevent customers from placing new orders from this branch.           │
│  - Allow existing processing orders (5 active) to be completed.          │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                            [ Cancel ]  [ Yes, Deactivate]│
└──────────────────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Visual modal prompt to confirm branch deactivation.
- **Trigger**: Clicked "Deactivate" button in List view, Update form, or Detail view.
- **Actions**: "Cancel" (dismisses modal) and "Yes, Deactivate" (sets branch status to Inactive).

---

# 5. Module 3 — Employee Management

## Screen 3.1: Employee Dashboard (List View)

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Employees > List                                           │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ○ Branches│  Employees                                   [+ Add Member] │
│  ▶ Employees│─────────────────────────────────────────────────────────────│
│    List    │  🔍 Search Name/Email...   [Role: All ▼]   [Branch: All ▼]   │
│    Create  │─────────────────────────────────────────────────────────────│
│  ○ Orders  │ ┌──────┬──────────────┬──────────┬───────────┬────────────┐ │
│  ○ Food    │ │ ID   │ Name         │ Role     │ Branch    │ Status     │ │
│            │ ├──────┼──────────────┼──────────┼───────────┼────────────┤ │
│            │ │ E101 │ John Doe     │ Manager  │ MG Road   │ ● Active   │ │
│            │ │ E102 │ Jane Smith   │ Kitchen  │ MG Road   │ ● Active   │ │
│            │ │ E103 │ Bob Martin   │ Delivery │ CP Delhi  │ ● Inactive │ │
│            │ └──────┴──────────────┴──────────┴───────────┴────────────┘ │
│            │  Showing 1-10 of 42                        [<] [1] [2] [>]  │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Displays profiles of all onboarded restaurant staff (Managers, Kitchen, Delivery executives).
- **Header Section**: Title "Employees" and CTA "+ Add Member".
- **Filters**: Search by Name or Email. Dropdown filter by Role (Manager, Kitchen, Delivery, Admin) and Assigned Branch.
- **Action Item**: Clicking an employee row opens their edit profile screen.

---

## Screen 3.2: Create Employee

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Employees > Add Member                                     │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ○ Branches│  Onboard New Employee                                       │
│  ▶ Employees│─────────────────────────────────────────────────────────────│
│    List    │  ┌───────────────────────────┐ ┌──────────────────────────┐ │
│    Create  │  │ Personal Details          │ │ Employment Details       │ │
│            │  │ First Name: [___________] │ │ Role:       [Select   ▼] │ │
│  ○ Orders  │  │ Last Name:  [___________] │ │ Branch:     [Select   ▼] │ │
│  ○ Food    │  │ Email:      [___________] │ │ Date Join:  [2026-05-26] │ │
│            │  │ Phone:      [___________] │ └──────────────────────────┘ │
│            │  └───────────────────────────┘ ┌──────────────────────────┐ │
│            │                                │ Credentials              │ │
│            │                                │ Password:   [********]   │ │
│            │                                │ Confirm PW: [********]   │ │
│            │                                └──────────────────────────┘ │
│            │                                 [ Cancel ]  [ Save Profile] │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Form to onboard staff. Includes basic info, credentials, and business operational assignments.
- **Layout**: Dual columns. Left column contains Personal Details. Right column contains Employment assignments and Authentication setup.
- **Actions**: "Save Profile" (solid blue) and "Cancel".

### Validation Rules
- **Email**: Must be unique globally.
- **Password Strength**: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.
- **Branch Assignment**: Required for "Manager" and "Kitchen Staff" roles. Left blank/ignored for Global Admin roles.

---

## Screen 3.3: Update Employee

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Employees > Edit Profile                                   │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ○ Branches│  Edit Profile: John Doe (E101)                              │
│  ▶ Employees│─────────────────────────────────────────────────────────────│
│    List    │  ┌───────────────────────────┐ ┌──────────────────────────┐ │
│    Create  │  │ Personal Details          │ │ Employment Details       │ │
│            │  │ First Name: [John       ] │ │ Role:       [Manager  ▼] │ │
│  ○ Orders  │  │ Last Name:  [Doe        ] │ │ Branch:     [MG Road  ▼] │ │
│  ○ Food    │  │ Email:  [john@roms.com(L)]│ │ Date Join:  [2025-01-10] │ │
│            │  │ Phone:      [9876543210   ] │ │ Status:     [Active   ▼] │ │
│            │  └───────────────────────────┘ └──────────────────────────┘ │
│            │                                ┌──────────────────────────┐ │
│            │                                │ Reset Password (Optional)│ │
│            │                                │ New PW:     [********]   │ │
│            │                                └──────────────────────────┘ │
│            │                                 [ Cancel ]  [ Save Changes] │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Modifies an existing employee's details and active state.
- **Key Modifications**:
  - Employee's login email field is locked (read-only) to preserve identification mappings.
  - Option to type a new password to trigger an override reset.
  - Dropdown menu contains a status selector (`Active`/`Inactive`). Toggling to `Inactive` launches the Deactivation Modal.

---

## Screen 3.4: Deactivate Employee Modal

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Deactivate Employee Account                                         [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ⚠️  Warning: Are you sure you want to deactivate John Doe (E101)?      │
│                                                                          │
│  This action will:                                                       │
│  - Immediately revoke all active login sessions.                         │
│  - Prevent user access to all associated portals (Web/Mobile).           │
│  - Maintain historical logs associated with this user.                   │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                            [ Cancel ]  [ Yes, Deactivate]│
└──────────────────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Prompt to verify employee deactivation.
- **Behavior**: Toggling an employee to Inactive prompts this confirmation window. Once confirmed, the employee status shifts to Inactive, and active session tokens are invalidated.

---

# 6. Module 4 — Order Report

## Screen 4.1: Calendar View (Default Screen)

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Orders > Calendar View                                     │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ○ Branches│  Order Reports                             [<] May 2026 [>] │
│  ○ Employees│─────────────────────────────────────────────────────────────│
│  ▶ Orders  │  Sun    │  Mon    │  Tue    │  Wed    │  Thu    │  Fri    │ │
│    Calendar│ ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤ │
│    List    │ │         │         │         │         │ 1       │ 2       │ │
│  ○ Food    │ │         │         │         │         │ Ord: 12 │ Ord: 15 │ │
│            │ │         │         │         │         │ Rev: 6k │ Rev: 9k │ │
│            │ ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤ │
│            │ │ 3       │ 4       │ 5       │ 6       │ 7       │ 8       │ │
│            │ │ Ord: 8  │ Ord: 14 │ Ord: 22 │ Ord: 19 │ Ord: 11 │ Ord: 25 │ │
│            │ │ Rev: 4k │ Rev: 7k │ Rev: 11k│ Rev: 9.5│ Rev: 5k │ Rev: 13k│ │
│            │ └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘ │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: High-level calendar representation showing daily order volumes and aggregate revenues.
- **Top Header**: Title and Month/Year navigation control arrows (`<` and `>`).
- **Calendar Grid**: Shows a 7-day grid week alignment. Active cells render the day's index, aggregate order counts, and revenue.
- **Navigation Action**: Clicking any calendar cell date navigates to the Order List Screen, filtered specifically for that day. Future dates are disabled/greyed-out.

---

## Screen 4.2: Order List Screen

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Orders > Reports > May 5, 2026                             │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ○ Branches│  Orders: May 5, 2026                        [Export CSV]    │
│  ○ Employees│─────────────────────────────────────────────────────────────│
│  ▶ Orders  │  🔍 Order ID/Customer Phone...  [Branch: All ▼] [Status:All▼]│
│    Calendar│─────────────────────────────────────────────────────────────│
│    List    │ ┌──────────┬──────────┬──────────┬────────┬──────────┬──────┐│
│  ○ Food    │ │ Order ID │ Branch   │ Customer │ Amount │ Status   │Action││
│            │ ├──────────┼──────────┼──────────┼────────┼──────────┼──────┤│
│            │ │ #ORD101  │ MG Road  │ John D.  │ ₹450   │ ● Deliv. │[View]││
│            │ │ #ORD102  │ CP Delhi │ Sara K.  │ ₹120   │ ● Cancel │[View]││
│            │ └──────────┴──────────┴──────────┴────────┴──────────┴──────┘│
│            │  Showing 1-20 of 220                       [<] [1] [2] [>]  │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Displays detailed entries of orders registered on the selected date.
- **Filters**: Search field queries Order ID or Customer Phone. Dropdowns filter list by Branch and status.
- **Actions**: Clicking "View" opens the read-only Order Detail View. "Export CSV" downloads the daily list.

---

## Screen 4.3: Order Detail View

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Orders > Reports > Order #ORD101                           │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ○ Branches│  < Back to List | Order #ORD101                 ● Delivered │
│  ○ Employees│─────────────────────────────────────────────────────────────│
│  ▶ Orders  │  ┌───────────────────────────┐ ┌──────────────────────────┐ │
│    Calendar│  │ Customer & Delivery Info  │ │ Order Tracking Timeline  │ │
│    List    │  │ Name:   John Doe          │ │ [x] Placed    (12:00 PM) │ │
│  ○ Food    │  │ Phone:  9876543210        │ │ [x] Kitchen   (12:05 PM) │ │
│            │  │ Address: 123 Main St      │ │ [x] Out/Deliv (12:20 PM) │ │
│            │  │ Agent:  Mike (9998887776) │ │ [x] Delivered (12:45 PM) │ │
│            │  └───────────────────────────┘ └──────────────────────────┘ │
│            │  ┌────────────────────────────────────────────────────────┐ │
│            │  │ Order Items & Bill Breakdown                           │ │
│            │  │ 1x Margherita Pizza ............................ ₹299  │ │
│            │  │ 2x Coca Cola 300ml ............................. ₹100  │ │
│            │  │ ------------------------------------------------------ │ │
│            │  │ Subtotal: ₹399 | GST Tax: ₹20 | Total Paid: ₹419       │ │
│            │  └────────────────────────────────────────────────────────┘ │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Displays a read-only layout of customer parameters, line items, timestamps, pricing breakdown, and logistics tracking.
- **Grid Layout**: Split layout.
  - **Left Section**: Customer information card (delivery address omitted if takeout) and Order Items Table with full price adjustments.
  - **Right Section**: Real-time delivery/kitchen vertical timeline and assigned delivery executive contact metrics.

---

# 7. Module 5 — Food Management

## Screen 5.1: Food Dashboard (Grid/List View)

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Food Management > Master Catalog                           │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ○ Branches│  Food Catalog                           [+ Add Food Item]   │
│  ○ Employees│─────────────────────────────────────────────────────────────│
│  ○ Orders  │  🔍 Search Item Name...   [Category: All ▼] [Type: All ▼]   │
│  ▶ Food    │─────────────────────────────────────────────────────────────│
│            │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│            │ │ [Image]      │  │ [Image]      │  │ [Image]      │        │
│            │ │ Veg Burger   │  │ Choco Lava   │  │ Coke 300ml   │        │
│            │ │ ₹150 | 🟢 Veg │  │ ₹99  | 🟢 Veg │  │ ₹60 | 🟢 Veg  │        │
│            │ │ [Edit][View] │  │ [Edit][View] │  │ [Edit][View] │        │
│            │ └──────────────┘  └──────────────┘  └──────────────┘        │
│            │  Showing 1-12 of 85                        [<] [1] [2] [>]  │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: The master food repository. Admins can view, edit, categorize, and price items globally before mapping them to branches.
- **Top Actions**: "+ Add Food Item" button and layout switch control (switches between Grid view and Table list view).
- **Grid Display**: Shows image thumbnail, title, price, dietary tags (Veg green, Non-veg red, Vegan green outline), and actions. Clicking "Edit" opens the Update screen, and "View" slides out the Drawer detail.

---

## Screen 5.2: Create Food Item

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Food Management > Create Food Item                         │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ○ Branches│  Create Master Food Item                                    │
│  ○ Employees│─────────────────────────────────────────────────────────────│
│  ○ Orders  │  ┌───────────────────────────┐ ┌──────────────────────────┐ │
│  ▶ Food    │  │ Item Details              │ │ Item Image               │ │
│            │  │ Name:       [___________] │ │ ┌──────────────────────┐ │ │
│            │  │ Category:   [Select   ▼]  │ │ │                      │ │ │
│            │  │ Base Price: [______] (₹)  │ │ │ Drag & Drop Image    │ │ │
│            │  │ Dietary:    [Veg      ▼]  │ │ │ or Browse (Max 2MB)  │ │ │
│            │  │ Description:              │ │ │                      │ │ │
│            │  │ [_______________________] │ │ └──────────────────────┘ │ │
│            │  └───────────────────────────┘ └──────────────────────────┘ │
│            │                                 [ Cancel ]  [ Save Item ]   │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Creates a new recipe master profile in the system database.
- **Layout**: 2 columns. Left column collects text metadata. Right column contains an interactive drop-zone block supporting file drags (JPG/PNG).
- **Actions**: "Save Item" (solid green) and "Cancel".

### Validation Rules
- **Base Price**: Must be a positive number greater than zero.
- **Image Upload**: Restricted to `.jpg`, `.jpeg`, `.png` files under 2MB.

---

## Screen 5.3: Update Food Item

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Food Management > Edit Food Item                           │
│  ○ Home    │─────────────────────────────────────────────────────────────│
│  ○ Branches│  Edit Master Food Item: Veg Burger                          │
│  ○ Employees│─────────────────────────────────────────────────────────────│
│  ○ Orders  │  ┌───────────────────────────┐ ┌──────────────────────────┐ │
│  ▶ Food    │  │ Item Details              │ │ Item Image               │ │
│            │  │ Name:       [Veg Burger ] │ │ ┌──────────────────────┐ │ │
│            │  │ Category:   [Burgers  ▼]  │ │ │ [ Current Image ]    │ │ │
│            │  │ Base Price: [150   ] (₹)  │ │ │                      │ │ │
│            │  │ Dietary:    [Veg      ▼]  │ │ │ [Replace Image]      │ │ │
│            │  │ Status:     [Active   ▼]  │ │ └──────────────────────┘ │ │
│            │  │ Description:              │ └──────────────────────────┘ │
│            │  │ [Classic vegetable patty] │                              │
│            │  └───────────────────────────┘  [ Cancel ]  [ Save Changes ]│
└────────────┴─────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Edits an existing food catalog item.
- **Key Modifications**:
  - Name uniqueness validation prevents duplicate designations.
  - Image block displays the current active CDN image thumbnail with a "Replace Image" option.
  - Displays a status selector (`Active`/`Inactive`). Toggling to `Inactive` launches the Global Deactivation Modal.

---

## Screen 5.4: View Food Item Details Drawer

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────┐
│  🍽 ROMS Master Food Catalog                      [Close X]   │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │                     [ Veg Burger Image ]               │  │
│  └────────────────────────────────────────────────────────┘  │
│  Veg Burger                                        ● Active  │
│  Category: Burgers | Price: ₹150                             │
│                                                              │
│  Description:                                                │
│  Classic vegetable patty with cheese slice and visual garnish.│
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Assigned Branches (Active at 3 locations)               │  │
│  │ - MG Road (B001)                                       │  │
│  │ - Andheri West (B002)                                  │  │
│  │ - CP Delhi (B003)                                      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Slides in from the right edge when an admin clicks "View" on a food card.
- **Layout**: Full-height drawer presenting the high-resolution image banner, description, and list of branches where this item is assigned.

---

## Screen 5.5: Deactivate Food Item Modal

### Screen Preview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Deactivate Master Food Item                                         [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ⚠️  Warning: Are you sure you want to deactivate 'Veg Burger'?         │
│                                                                          │
│  This action will:                                                       │
│  - Deactivate this item in the master catalog.                           │
│  - Automatically hide it from all assigned branch menus.                 │
│  - Prevent customers from ordering this item across all active branches. │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                            [ Cancel ]  [ Yes, Deactivate]│
└──────────────────────────────────────────────────────────────────────────┘
```

### Screen Description & Layout
- **Purpose**: Confirmation prompt before removing an item globally.
- **Behavior**: Once confirmed, the item status changes to Inactive, and the system filters it out of all branch-level customer menus.

***End of Document***
