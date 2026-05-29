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
      - [Screen 2.2: Create Branch — Multi-Step Wizard](#screen-22-create-branch--multi-step-wizard)
      - [Screen 2.3: Update Branch — Multi-Step Wizard](#screen-23-update-branch--multi-step-wizard)
      - [Screen 2.4: View Branch Details Screen](#screen-24-view-branch-details-screen)
      - [Screen 2.5: Deactivate Branch Confirmation Modal](#screen-25-deactivate-branch-confirmation-modal)
   5. [Module 3 — Employee Management](#5-module-3--employee-management)
      - [Screen 3.1: Employee Dashboard (List View)](#screen-31-employee-dashboard-list-view)
      - [Screen 3.2: Create Employee Screen](#screen-32-create-employee-screen)
      - [Screen 3.3: Update Employee Screen](#screen-33-update-employee-screen)
      - [Screen 3.4: View Employee Details Screen](#screen-34-view-employee-details-screen)
      - [Screen 3.5: Deactivate Employee Confirmation Modal](#screen-35-deactivate-employee-confirmation-modal)
   6. [Module 4 — Order Report](#6-module-4--order-report)
      - [Screen 4.1: Order Calendar View (Default)](#screen-41-order-calendar-view-default)
      - [Screen 4.2: Order List Screen](#screen-42-order-list-screen)
      - [Screen 4.3: Order Detail View Screen](#screen-43-order-detail-view-screen)
   7. [Module 5 — Food Management](#7-module-5--food-management)
      - [Screen 5.1: Food Catalog Dashboard](#screen-51-food-catalog-dashboard)
      - [Screen 5.2: Create Food Item Screen](#screen-52-create-food-item-screen)
      - [Section A: Item Details & Image](#section-a-item-details--image)
      - [Section B: Customize Food Item (Customization Builder)](#section-b-customize-food-item-customization-builder)
      - [Screen 5.3: Update Food Item Screen](#screen-53-update-food-item-screen)
      - [Screen 5.4: View Food Item Slide-out Drawer](#screen-54-view-food-item-slide-out-drawer)
      - [Screen 5.5: Deactivate Food Item Confirmation Modal](#screen-55-deactivate-food-item-confirmation-modal)
   8. [Module 6 — Coupon & Promotion Management](#8-module-6--coupon--promotion-management)
      - [Screen 6.1: Coupon Dashboard (List View)](#screen-61-coupon-dashboard-list-view)
      - [Screen 6.2: Create Coupon Screen](#screen-62-create-coupon-screen)
      - [Screen 6.3: Update Coupon Screen](#screen-63-update-coupon-screen)
      - [Screen 6.4: View Coupon Details Screen](#screen-64-view-coupon-details-screen)
      - [Screen 6.5: Deactivate Coupon Confirmation Modal](#screen-65-deactivate-coupon-confirmation-modal)
   9. [Global Role & Permission Matrix](#9-global-role--permission-matrix)

   ---

   # 1. Executive Summary

   The **Admin Portal** is a web-based central command panel of the Restaurant Order Management System (ROMS). It provides owners and corporate administrators with absolute control over the organization's branches, master menus, employee rosters, and financial performance analytics.

   ### Business Goals
   - **Centralized Control**: Single interface to manage global parameters across all branch locations.
   - **Roster & Audit Trail**: Oversee employees and track key operational analytics securely.
   - **Unified Menu Catalog**: Maintain pricing consistency and dietary classification on food items chain-wide.

   ---

   # 2. Global UI/UX Standards

   ### 2.1 Design Tokens
   - **Primary Color**: `#2563EB` (Blue 600) — Default call-to-action buttons, active navigation, hyperlinks
   - **Success Color**: `#16A34A` (Green 600) — Save, activate, successful confirmations, active status pills
   - **Warning Color**: `#F59E0B` (Amber 500) — Warning states, pending status pills
   - **Danger Color**: `#DC2626` (Red 600) — Destructive actions, delete, deactivate, error banners
   - **Neutral BG**: `#F8FAFC` (Slate 50) — App layout backdrop
   - **Card BG**: `#FFFFFF` — Table grids, forms, detail summaries

   ### 2.2 Global Interaction Rules
   - **Optimistic UI Updates**: Toggles and simple configuration switches should display visual updates instantly, with automatic state rollback if the server API responds with an error.
   - **Search Debounce**: Text search bars must run with a standard `300ms` debounce duration to prevent server overloading.
   - **Modals**: Destructive confirmations must require a clear double-click or confirmation button click before API execution.

   ### 2.3 Tabbed Interface Specification Standard
   To ensure maximum clarity for frontend developers and UI/UX designers, screens containing tabbed views (e.g., within dashboards, tables, or detail panels) must follow a rigorous **Two-Section Structure** in their requirements definitions:

   1. **Section A: Persistent Screen Shell & Tab Navigation**
      - **Persistent Visual Elements**: Define elements that are always visible regardless of the active tab (e.g., page title, breadcrumbs, primary global actions, audit metadata).
      - **Tab Bar Controller / Switcher**: Specify the navigation mechanism (labels, dynamic counts in badges, active/inactive states, and URL routing state persistence).
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
   Central branch management landing page that lists active and inactive restaurant locations. Admins can filter locations and access creation, detail view, edit, or inactivate/activate actions.

   ### 2. Screen Preview
   ```text
   ┌──────────────────────────────────────────────────────────────────────┐
   │  Branches                                          [+ Add Branch]   │
   ├──────────────────────────────────────────────────────────────────────┤
   │  🔍 Search by Name/Code...  [Status: All ▼] [City: All ▼]            │
   ├──────────────────────────────────────────────────────────────────────┤
   │ Code  │ Name        │ City      │ Status     │ Actions               │
   │-------│-------------│-----------│------------│-----------------------│
   │ B001  │ MG Road     │ Bangalore │ ● Active   │ [View][Edit][Inactivate]│
   │ B002  │ Andheri W   │ Mumbai    │ ● Active   │ [View][Edit][Inactivate]│
   │ B003  │ CP Delhi    │ New Delhi │ ● Inactive │ [View][Edit][Activate]  │
   ├──────────────────────────────────────────────────────────────────────┤
   │  Showing 1-10 of 24                               [<] [1] [2] [>]   │
   └──────────────────────────────────────────────────────────────────────┘
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
   | Row Action: Edit | Link | — | Triggers page change | `[Edit]` | Navigates to Screen 2.3 (Update — Multi-Step Wizard) |
   | Row Action: Inactivate | Button | — | Triggers deactivation confirmation modal (Screen 2.5) | `[Inactivate]` | Shown only for `Active` branches. Opens Deactivate Branch Confirmation Modal |
   | Row Action: Activate | Button | — | Triggers activation API call | `[Activate]` | Shown only for `Inactive` branches. Directly activates the branch with optimistic UI update |

   ### 4. Validations
   - Search box input must contain at least `2 characters` before querying database records.

   ---

   ## Screen 2.2: Create Branch — Multi-Step Wizard

   ### 1. Overview
   A two-step guided wizard for registering a new restaurant branch. **Step 1** captures branch details (basic info, location, operational hours). Upon successful creation, **Step 2** presents the menu assignment interface where the admin maps food items to the newly created branch. Menu assignment is mandatory — the admin must assign at least one menu item before completing the wizard.

   ### 2. Wizard Step Indicator
   A horizontal step progress bar is displayed at the top of the screen throughout both steps. The indicator visually communicates the current position in the workflow.

   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │     ① Branch Creation ─────────── ② Assign Menu             │
   │     ● (Active)                    ○ (Upcoming)              │
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
   ```

   | State | Visual Style |
   |---|---|
   | Completed Step | Filled circle with checkmark (`✓`), primary color `#2563EB` |
   | Active Step | Filled circle with step number, primary color `#2563EB`, bold label |
   | Upcoming Step | Hollow circle with step number, neutral gray `#94A3B8` |
   | Connector Line (completed) | Solid line, primary color `#2563EB` |
   | Connector Line (upcoming) | Dashed line, neutral gray `#94A3B8` |

   ---

   ### STEP 1: Branch Creation

   #### 1. Overview
   Input form to register the new branch's basic information, location details, and operational hours. This is the same form content as the original create branch screen.

   #### 2. Screen Preview
   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │  Create New Branch                                          │
   │     ① Branch Creation ─────────── ② Assign Menu             │
   │     ● (Active)                    ○ (Upcoming)              │
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
   │                                          [Cancel] [Next →]   │
   └─────────────────────────────────────────────────────────────┘
   ```

   #### 3. Step 1 Fields Table
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
   | Button: Cancel | Button | Yes | Navigates back to Branch Dashboard (Screen 2.1) | `[Cancel]` | Discards form data |
   | Button: Next | Button | Yes | Validates all fields, creates branch via API, proceeds to Step 2 | `[Next →]` | Triggers branch creation API call on click |

   #### 4. Step 1 Validations
   - **Duplicate Code**: System checks that the inputted `Branch Code` is unique before allowing registration.
   - **Operating Hours**: Closing time must be chronologically after the opening time.
   - **Data Format**: Phone number must contain only numeric characters.
   - **API Call**: Branch is created (persisted) when the admin clicks `Next →`. If creation fails, the admin remains on Step 1 with error feedback.

   ---

   ### STEP 2: Assign Menu

   #### 1. Overview
   After the branch is successfully created in Step 1, this step presents the menu assignment interface. The admin maps food items from the master catalog to the newly created branch. At least one menu item must be assigned — this step cannot be skipped.

   #### 2. Screen Preview
   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │  Create New Branch — Indiranagar (B004)                      │
   │     ✓ Branch Creation ─────────── ② Assign Menu             │
   │       (Completed)                 ● (Active)                │
   ├─────────────────────────────────────────────────────────────┤
   │  Assign Menu Items to Branch                                │
   │  Category: [All Categories ▼]   🔍 Search Food Item...       │
   ├─────────────────────────────────────────────────────────────┤
   │ [x] Select All                                              │
   │                                                             │
   │ [x] Margherita Pizza     | Category: Pizza    | ₹299        │
   │ [x] Farmhouse Pizza      | Category: Pizza    | ₹399        │
   │ [ ] Garlic Bread         | Category: Sides    | ₹149        │
   │ [ ] Choco Lava Cake      | Category: Desserts | ₹129        │
   │                                                             │
   │                                  [← Back] [Save & Finish]   │
   └─────────────────────────────────────────────────────────────┘
   ```

   #### 3. Step 2 Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Selection Checkbox | Checkbox | No | Checked state maps item to branch | `true` | Select individual item |
   | Select All Checkbox | Checkbox | No | Boolean | `true` | Selects all currently filtered items |
   | Item Name | Text | Read-only | Min 3 chars | `Margherita Pizza` | Master food item name |
   | Item Category | Text | Read-only | Valid category tag | `Pizza` | Master category classification |
   | Item Price | Currency | Read-only | Positive decimal | `₹299` | Item selling price |
   | Category Filter | Dropdown | No | Must match active master category | `All Categories` | Filters list by food category |
   | Search Bar | Text | No | Max 50 characters | `Pizza` | Filters list by food name |
   | Button: Back | Button | Yes | Returns to Step 1 in read-only summary mode | `[← Back]` | Branch already created — Step 1 fields are non-editable on return |
   | Button: Save & Finish | Button | Yes | Saves menu assignments and redirects to Branch Dashboard | `[Save & Finish]` | Requires at least 1 item selected |

   #### 4. Step 2 Validations
   - At least **one menu item** must be selected before the admin can click `Save & Finish`.
   - Attempting to save with zero selections displays an inline error: _"Please assign at least one menu item to continue."_
   - The `← Back` button returns to Step 1, but since the branch is already created, all Step 1 fields are displayed as **read-only summary** (non-editable).

   #### 5. Dependencies
   - **Module Dependencies**: Relies directly on Module 5 (Food Management) master catalog to query the list of active food items available to assign.

   ---

   ## Screen 2.3: Update Branch — Multi-Step Wizard

   ### 1. Overview
   A two-step guided wizard for updating an existing branch. **Step 1** displays the editable branch configuration form (Branch Code is permanently locked). Upon saving changes, **Step 2** presents the menu assignment interface showing current menu assignments with the ability to add or remove items. Menu assignment is mandatory — the branch must retain at least one assigned menu item.

   ### 2. Wizard Step Indicator
   Uses the same horizontal step progress bar as Screen 2.2 (Create Branch Wizard). Visual states are identical.

   ---

   ### STEP 1: Update Branch Details

   #### 1. Overview
   Interface to update the configuration of an existing branch. The unique Branch Code is permanently locked to preserve data records. All other fields are pre-filled with current values and fully editable.

   #### 2. Screen Preview
   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │  Update Branch — MG Road (B001)                             │
   │     ① Branch Details ─────────── ② Assign Menu              │
   │     ● (Active)                   ○ (Upcoming)               │
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
   │                                          [Cancel] [Next →]   │
   └─────────────────────────────────────────────────────────────┘
   ```

   #### 3. Step 1 Fields Table
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
   | Button: Cancel | Button | Yes | Navigates back to Branch Dashboard (Screen 2.1) | `[Cancel]` | Discards unsaved changes |
   | Button: Next | Button | Yes | Validates all fields, saves changes via API, proceeds to Step 2 | `[Next →]` | Triggers branch update API call on click |

   #### 4. Step 1 Validations
   - Closing time must be chronologically after the opening time.
   - Changes are saved (persisted via API) when the admin clicks `Next →`. If the update fails, the admin remains on Step 1 with error feedback.
   - Changes must be saved using an active database transaction.

   ---

   ### STEP 2: Assign Menu

   #### 1. Overview
   After branch details are saved in Step 1, this step displays the current menu assignments for the branch. The admin can add or remove food item mappings. Pre-existing assignments are shown with checkboxes already checked. At least one menu item must remain assigned.

   #### 2. Screen Preview
   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │  Update Branch — MG Road (B001)                             │
   │     ✓ Branch Details ─────────── ② Assign Menu              │
   │       (Completed)                ● (Active)                 │
   ├─────────────────────────────────────────────────────────────┤
   │  Assign Menu Items to Branch                                │
   │  Category: [All Categories ▼]   🔍 Search Food Item...       │
   ├─────────────────────────────────────────────────────────────┤
   │ [ ] Select All                                              │
   │                                                             │
   │ [x] Margherita Pizza     | Category: Pizza    | ₹299        │
   │ [x] Farmhouse Pizza      | Category: Pizza    | ₹399        │
   │ [x] Garlic Bread         | Category: Sides    | ₹149        │
   │ [ ] Choco Lava Cake      | Category: Desserts | ₹129        │
   │                                                             │
   │                                  [← Back] [Save & Finish]   │
   └─────────────────────────────────────────────────────────────┘
   ```

   #### 3. Step 2 Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Selection Checkbox | Checkbox | No | Checked state maps item to branch | `true` | Select individual item. Pre-checked for currently assigned items |
   | Select All Checkbox | Checkbox | No | Boolean | `false` | Selects all currently filtered items |
   | Item Name | Text | Read-only | Min 3 chars | `Margherita Pizza` | Master food item name |
   | Item Category | Text | Read-only | Valid category tag | `Pizza` | Master category classification |
   | Item Price | Currency | Read-only | Positive decimal | `₹299` | Item selling price |
   | Category Filter | Dropdown | No | Must match active master category | `All Categories` | Filters list by food category |
   | Search Bar | Text | No | Max 50 characters | `Pizza` | Filters list by food name |
   | Button: Back | Button | Yes | Returns to Step 1 with editable fields (update mode) | `[← Back]` | Step 1 fields remain editable since this is an update flow |
   | Button: Save & Finish | Button | Yes | Saves menu assignments and redirects to Branch Dashboard | `[Save & Finish]` | Requires at least 1 item selected |

   #### 4. Step 2 Validations
   - At least **one menu item** must remain assigned before the admin can click `Save & Finish`.
   - Attempting to save with zero selections displays an inline error: _"Please assign at least one menu item to continue."_
   - The `← Back` button returns to Step 1 with all fields **editable** (since this is an update flow, the admin may continue editing branch details).

   #### 5. Dependencies
   - **Module Dependencies**: Relies directly on Module 5 (Food Management) master catalog to query the list of active food items available to assign.

   ---

   ## Screen 2.4: View Branch Details Screen

   ### 1. Overview
   A read-only detail screen for viewing all information related to a specific branch. The screen is divided into two zones: a **persistent header card** displaying the branch's core identity (name, code, email, status) with only a Back button, and an **internal tabbed panel** below it with two read-only tabs. This is a pure view-only screen — no edit, delete, or deactivate actions are available.

   ### 2. Screen Layout

   The screen is composed of two visual zones stacked vertically:

   **Zone 1 — Branch Identity Header Card (Always Visible)**
   A non-scrollable summary card pinned at the top of the screen. Displays core branch identity fields and a Back navigation link. This zone never changes when switching tabs.

   **Zone 2 — Internal Tabbed Content Panel**
   A tab bar immediately below the header card with two read-only tabs:

   | Tab Label | Badge Count | Description |
   |---|---|---|
   | Branch Information | — | Detailed branch configuration and audit trail |
   | Branch Menu | Dynamic (e.g. `25`) | Food items currently assigned to this branch |

   ### 3. Screen Preview (Full Composite View — Branch Information Tab Active)
   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │  ‹ Back to Branches                                         │
   ├─────────────────────────────────────────────────────────────┤
   │                                                             │
   │  MG Road Branch (B001)                                      │
   │  Branch Name:  MG Road Branch                               │
   │  Branch Code:  B001                                         │
   │  Email:        mgroad@roms.com                              │
   │  Status:       ● Active                                     │
   │                                                             │
   │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
   │  [Branch Information]    Branch Menu (25)                    │
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

   ---

   ### SECTION A: Branch Identity Header Card (Persistent — Always Visible)

   This zone remains fixed at the top regardless of which tab is active. It displays branch identity and a Back navigation link only — no management actions.

   #### 1. Header Card Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Back Button | Link | Yes | Navigates back to Branch Dashboard (Screen 2.1) | `‹ Back to Branches` | Top-left navigation link. Preserves previously applied dashboard filters |
   | Branch Title | Label | Read-only | Format: `{Name} ({Code})` | `MG Road Branch (B001)` | Main page heading, prominent display |
   | Branch Name | Label | Read-only | Min 3 characters | `MG Road Branch` | Displayed below title |
   | Branch Code | Label | Read-only | Unique alphanumeric code | `B001` | Displayed below branch name |
   | Email | Label | Read-only | Valid email format | `mgroad@roms.com` | Branch contact email |
   | Status Indicator | Badge | Read-only | Green pill for `Active`, Red pill for `Inactive` | `● Active` | Color-coded status pill next to identity |

   ---

   ### SECTION B: Internal Tab Bar Controller

   The tab bar sits directly below the header card, acting as the switcher for the content panel. Only one tab is active at a time. The active tab displays an **underline highlight** (primary color `#2563EB`) beneath its label.

   #### 1. Tab Bar Behavior
   | Property | Specification |
   |---|---|
   | Default Active Tab | `Branch Information` (first tab) |
   | Active Tab Indicator | Bottom border underline, `2px solid #2563EB` |
   | Inactive Tab Style | Neutral gray text, no underline |
   | Badge Counts | Dynamic numeric count shown in parentheses for `Branch Menu` tab |
   | URL State Persistence | Active tab selection must be reflected in the URL query parameter (e.g. `?tab=menu`) so that page refresh preserves the selected tab |
   | Keyboard Navigation | Supports `←` / `→` arrow key navigation between tabs, `Enter` to activate |

   ---

   ### SECTION C: Tab Content Viewports

   Each tab renders its own dedicated content area below the tab bar. When a tab is selected, only the content viewport area swaps — the header card and tab bar remain static. Both tabs are **read-only** with no editable fields or action buttons.

   ---

   #### Tab 1: Branch Information

   Displays the full operational configuration of the branch in a **vertical key-value detail card** format (label on left, value on right). Includes address details, contact information, operating hours, and system audit trail.

   ##### 1. Branch Information Tab Preview
   ```text
   ├─────────────────────────────────────────────────────────────┤
   │  [Branch Information]    Branch Menu (25)                    │
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

   #### Tab 2: Branch Menu

   Displays the list of food items currently assigned to this branch in a **read-only tabular format**. This tab provides visibility into the branch's menu without any edit or assignment capabilities — menu management is handled through the Edit flow (Screen 2.3, Step 2).

   ##### 1. Branch Menu Tab Preview
   ```text
   ├─────────────────────────────────────────────────────────────┤
   │   Branch Information    [Branch Menu (25)]                   │
   │                         ─────────────────                    │
   ├─────────────────────────────────────────────────────────────┤
   │                                                             │
   │  Assigned Menu Items                                        │
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

   ##### 2. Branch Menu Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Menu Table: Item Code | Text | Read-only | Alphanumeric unique code | `F012` | Linked food item code |
   | Menu Table: Food Item Name | Text | Read-only | Minimum 3 characters | `Chicken Biryani` | Master food item title |
   | Menu Table: Price | Currency | Read-only | Positive decimal format | `₹299` | Branch selling price |
   | Pagination | Control | Yes | Standard page navigation | `Showing 1-10 of 25` | Paginated at 10 items per page |

   ---

   ### SECTION D: Business Validations & Rules

   1. **Audit Trail Integrity**: Audit tracking fields (Created By, Edited By) are system-managed and cannot be edited by any user.
   2. **Dynamic Badge Count**: The numeric count displayed in the `Branch Menu` tab label (e.g. `Branch Menu (25)`) must automatically recalculate whenever items are added or removed via the Edit flow.
   3. **Tab State Persistence**: The currently active tab must be preserved in the URL query string (e.g. `?tab=menu`) so that browser refresh or shared links restore the correct tab view.
   4. **Back Navigation**: The `‹ Back to Branches` link must return the user to the Branch Dashboard (Screen 2.1), preserving any previously applied filters.
   5. **Read-Only Screen**: This screen has no edit, delete, deactivate, or assign actions. All management actions are accessible from the Branch Dashboard table (Screen 2.1) or through the Edit flow (Screen 2.3).

   ### SECTION E: Dependencies

   - **Module Dependencies**: Depends directly on Module 5 (Food Management) to query master menu catalog items mapped to this branch.

   ---

   ## Screen 2.5: Deactivate Branch Confirmation Modal

   ### 1. Overview
   Confirmation dialog when an Admin deactivates a branch. Halts online checkout operations at that specific branch immediately. This modal is triggered from the `[Inactivate]` action in the Branch Dashboard table (Screen 2.1).

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
   ┌──────────────────────────────────────────────────────────────────────┐
   │  Employees                                        [+ Add Employee]  │
   ├──────────────────────────────────────────────────────────────────────┤
   │  🔍 Search by Name/Email... [Role: All ▼] [Branch: All ▼]            │
   ├──────────────────────────────────────────────────────────────────────┤
   │ ID    │ Name        │ Role    │ Branch  │ Status     │ Actions               │
   │-------│-------------│---------│---------│------------│-----------------------│
   │ E101  │ John Doe    │ Manager │ MG Road │ ● Active   │ [View][Edit][Inactivate]│
   │ E102  │ Jane Smith  │ Kitchen │ MG Road │ ● Active   │ [View][Edit][Inactivate]│
   │ E103  │ Bob Martin  │ Delivery│ CP Delhi│ ● Inactive │ [View][Edit][Activate]  │
   ├──────────────────────────────────────────────────────────────────────┤
   │  Showing 1-10 of 42                                  [<] [1] [2] [>] │
   └──────────────────────────────────────────────────────────────────────┘
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
   | Row Action: View | Link | — | Triggers page change | `[View]` | Navigates to Screen 3.4 (View Employee Details) |
   | Row Action: Edit | Link | — | Triggers page change | `[Edit]` | Navigates to Screen 3.3 |
   | Row Action: Inactivate | Button | — | Triggers deactivation confirmation modal (Screen 3.5) | `[Inactivate]` | Shown only for `Active` employees. Opens Deactivate Employee Confirmation Modal |
   | Row Action: Activate | Button | — | Triggers activation API call | `[Activate]` | Shown only for `Inactive` employees. Directly activates the employee with optimistic UI update |

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
   Interface to update staff profiles. The form is divided into two sections: **Personal & Employment Details** (always visible) and **Reset Password** (collapsed by default, expandable on demand). Password entry is entirely optional — the admin can save profile changes without touching the password section.

   ### 2. Screen Preview (Default State — Password Section Collapsed)
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
   │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
   │  🔒 Reset Password                                    [▶ Expand]│
   │                                                             │
   │                                      [Cancel] [Save Changes]│
   └─────────────────────────────────────────────────────────────┘
   ```

   ### 3. Screen Preview (Expanded State — Password Fields Visible)
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
   │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
   │  🔓 Reset Password                                  [▼ Collapse]│
   │                                                             │
   │  ⚠️ Setting a new password will immediately invalidate the    │
   │  employee's current sessions and require re-login.          │
   │                                                             │
   │  [New Password: ********** ]  [Confirm Password: **********] │
   │                                                             │
   │  Password Requirements:                                     │
   │  ✓ Minimum 8 characters                                     │
   │  ✓ At least 1 uppercase letter                              │
   │  ✓ At least 1 lowercase letter                              │
   │  ✓ At least 1 digit                                         │
   │  ✓ At least 1 special character (!@#$%^&*)                  │
   │                                                             │
   │                                      [Cancel] [Save Changes]│
   └─────────────────────────────────────────────────────────────┘
   ```

   ### 4. Screen Fields Table

   #### Personal & Employment Details Fields
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Employee ID | Label | — | Locked read-only display element | `E101` | Non-editable |
   | First Name | Text | Yes | Min 2, max 50 characters | `John` | Given name |
   | Last Name | Text | Yes | Min 2, max 50 characters | `Doe` | Surname |
   | Email Address | Label | — | Locked read-only | `john@roms.com` | Cannot modify username |
   | Phone Number | Phone | Yes | Numeric, exactly 10 digits | `9811223344` | Contact number |
   | Role Selection | Dropdown | Yes | Valid system role | `Manager` | System permission |
   | Assign Branch | Dropdown | Yes* | Mapped branch ID | `MG Road` | Required if role is Manager, Kitchen, or Delivery |
   | Date of Joining | Date | Yes | Cannot be future date | `2026-05-01` | Start date |

   #### Reset Password Section Fields
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Reset Password Toggle | Toggle / Accordion | No | Collapsed by default; click to expand | `[▶ Expand]` / `[▼ Collapse]` | Toggles visibility of password fields |
   | New Password | Password | Yes* | Min 8 characters; 1 upper, 1 lower, 1 digit, 1 special character | `**********` | *Required only when Reset Password section is expanded. Hashed securely before storage |
   | Confirm Password | Password | Yes* | Must exactly match New Password | `**********` | *Required only when Reset Password section is expanded. Verification check |

   ### 5. Reset Password Flow

   The reset password functionality follows a **progressive disclosure pattern** — password fields are hidden by default and only shown when the admin explicitly opts to reset:

   #### Flow Steps

   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │  1. Admin opens Update Employee screen                      │
   │     → Password section is COLLAPSED (default)               │
   │     → Admin can save profile changes without touching       │
   │       passwords                                             │
   ├─────────────────────────────────────────────────────────────┤
   │  2. Admin clicks [▶ Expand] on "Reset Password"            │
   │     → Section expands with animation (slide-down)           │
   │     → Warning banner is displayed:                          │
   │       "Setting a new password will immediately invalidate   │
   │        the employee's current sessions and require re-login"│
   │     → New Password and Confirm Password fields appear       │
   │     → Password requirements checklist appears (live updates)│
   ├─────────────────────────────────────────────────────────────┤
   │  3. Admin fills in New Password                             │
   │     → Requirements checklist updates in real-time:          │
   │       ✓ Green check when requirement is met                 │
   │       ✗ Red cross when requirement is not met               │
   ├─────────────────────────────────────────────────────────────┤
   │  4. Admin fills in Confirm Password                         │
   │     → Inline validation: shows match/mismatch indicator     │
   │       ✓ "Passwords match" (green text)                      │
   │       ✗ "Passwords do not match" (red text)                 │
   ├─────────────────────────────────────────────────────────────┤
   │  5. Admin clicks [Save Changes]                             │
   │     → Profile fields are validated first                    │
   │     → If password section is expanded AND has values:       │
   │       • Password rules are validated                        │
   │       • Confirm Password match is validated                 │
   │       • On success: password is hashed and updated          │
   │       • All active JWT sessions for this employee are       │
   │         immediately revoked (forced re-login)               │
   │     → If password section is collapsed OR empty:            │
   │       • Password is NOT changed                             │
   │       • Only profile fields are updated                     │
   ├─────────────────────────────────────────────────────────────┤
   │  6. Admin clicks [▼ Collapse] (optional)                    │
   │     → Section collapses, any entered password values        │
   │       are cleared (security measure)                        │
   └─────────────────────────────────────────────────────────────┘
   ```

   #### Password Requirements (Real-Time Checklist)
   | Requirement | Rule | Live Indicator |
   |---|---|---|
   | Minimum Length | At least 8 characters | ✓ / ✗ updates as user types |
   | Uppercase Letter | At least 1 uppercase letter (A-Z) | ✓ / ✗ updates as user types |
   | Lowercase Letter | At least 1 lowercase letter (a-z) | ✓ / ✗ updates as user types |
   | Digit | At least 1 numeric digit (0-9) | ✓ / ✗ updates as user types |
   | Special Character | At least 1 special character (!@#$%^&*) | ✓ / ✗ updates as user types |
   | Password Match | Confirm Password must exactly match New Password | ✓ / ✗ shown below Confirm Password field |

   ### 6. Validations
   - Email and Employee ID fields are locked and non-editable.
   - If the Reset Password section is **collapsed** (default), the admin can save profile changes without any password validation — password is not modified.
   - If the Reset Password section is **expanded** and contains values, full password validation is enforced:
   - New Password must meet all requirements (min 8 chars, 1 upper, 1 lower, 1 digit, 1 special).
   - Confirm Password must exactly match New Password.
   - Both fields become required when the section is expanded.
   - If the admin **collapses** the Reset Password section after entering values, the entered password data is immediately cleared from the form (security measure to prevent accidental submission).
   - On successful password reset, all active JWT tokens for the employee are **immediately revoked**, forcing a re-login on all devices.

   ### 7. Dependencies
   - **Module Dependencies**: Relies on Module 2 (Branch Management) to populate the active branch selection choices.

   ---

   ## Screen 3.4: View Employee Details Screen

   ### 1. Overview
   A read-only detail screen for viewing all information related to a specific employee. The screen is divided into two zones: a **persistent header card** displaying the employee's core identity (name, ID, email, role, status) with only a Back button, and an **internal tabbed panel** below it with two read-only tabs. This is a pure view-only screen — no edit, delete, or deactivate actions are available.

   ### 2. Screen Layout

   The screen is composed of two visual zones stacked vertically:

   **Zone 1 — Employee Identity Header Card (Always Visible)**
   A non-scrollable summary card pinned at the top of the screen. Displays core employee identity fields and a Back navigation link. This zone never changes when switching tabs.

   **Zone 2 — Internal Tabbed Content Panel**
   A tab bar immediately below the header card with two read-only tabs:

   | Tab Label | Badge Count | Description |
   |---|---|---|
   | Employee Information | — | Detailed employee profile, employment details, and audit trail |
   | Assigned Branch | — | Branch location currently assigned to this employee |

   ### 3. Screen Preview (Full Composite View — Employee Information Tab Active)
   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │  ‹ Back to Employees                                        │
   ├─────────────────────────────────────────────────────────────┤
   │                                                             │
   │  John Doe (E101)                                            │
   │  Employee Name:  John Doe                                   │
   │  Employee ID:    E101                                       │
   │  Email:          john@roms.com                              │
   │  Role:           Manager                                    │
   │  Status:         ● Active                                   │
   │                                                             │
   │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
   │  [Employee Information]    Assigned Branch                   │
   │  ───────────────────────                                    │
   ├─────────────────────────────────────────────────────────────┤
   │                                                             │
   │  ┌───────────────────┬─────────────────────────────────────┐│
   │  │ Employee ID       │ E101                                ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ First Name        │ John                                ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Last Name         │ Doe                                 ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Email Address     │ john@roms.com                       ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Phone Number      │ +91 9811223344                      ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Role              │ Manager                             ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Date of Joining   │ 2026-05-01                          ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Created By        │ admin_user on 2026-05-01 10:00 AM   ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Edited By         │ admin_user on 2026-05-20 03:30 PM   ││
   │  └───────────────────┴─────────────────────────────────────┘│
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
   ```

   ---

   ### SECTION A: Employee Identity Header Card (Persistent — Always Visible)

   This zone remains fixed at the top regardless of which tab is active. It displays employee identity and a Back navigation link only — no management actions.

   #### 1. Header Card Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Back Button | Link | Yes | Navigates back to Employee Dashboard (Screen 3.1) | `‹ Back to Employees` | Top-left navigation link. Preserves previously applied dashboard filters |
   | Employee Title | Label | Read-only | Format: `{First Name} {Last Name} ({ID})` | `John Doe (E101)` | Main page heading, prominent display |
   | Employee Name | Label | Read-only | Min 2 characters | `John Doe` | Full name displayed below title |
   | Employee ID | Label | Read-only | Unique alphanumeric code | `E101` | Displayed below employee name |
   | Email | Label | Read-only | Valid email format | `john@roms.com` | Employee login email |
   | Role | Label | Read-only | Valid system role | `Manager` | Assigned operational role |
   | Status Indicator | Badge | Read-only | Green pill for `Active`, Red pill for `Inactive` | `● Active` | Color-coded status pill next to identity |

   ---

   ### SECTION B: Internal Tab Bar Controller

   The tab bar sits directly below the header card, acting as the switcher for the content panel. Only one tab is active at a time. The active tab displays an **underline highlight** (primary color `#2563EB`) beneath its label.

   #### 1. Tab Bar Behavior
   | Property | Specification |
   |---|---|
   | Default Active Tab | `Employee Information` (first tab) |
   | Active Tab Indicator | Bottom border underline, `2px solid #2563EB` |
   | Inactive Tab Style | Neutral gray text, no underline |
   | URL State Persistence | Active tab selection must be reflected in the URL query parameter (e.g. `?tab=branch`) so that page refresh preserves the selected tab |
   | Keyboard Navigation | Supports `←` / `→` arrow key navigation between tabs, `Enter` to activate |

   ---

   ### SECTION C: Tab Content Viewports

   Each tab renders its own dedicated content area below the tab bar. When a tab is selected, only the content viewport area swaps — the header card and tab bar remain static. Both tabs are **read-only** with no editable fields or action buttons.

   ---

   #### Tab 1: Employee Information

   Displays the full profile and employment configuration of the employee in a **vertical key-value detail card** format (label on left, value on right). Includes personal details, role information, and system audit trail.

   ##### 1. Employee Information Tab Preview
   ```text
   ├─────────────────────────────────────────────────────────────┤
   │  [Employee Information]    Assigned Branch                   │
   │  ───────────────────────                                    │
   ├─────────────────────────────────────────────────────────────┤
   │                                                             │
   │  ┌───────────────────┬─────────────────────────────────────┐│
   │  │ Employee ID       │ E101                                ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ First Name        │ John                                ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Last Name         │ Doe                                 ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Email Address     │ john@roms.com                       ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Phone Number      │ +91 9811223344                      ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Role              │ Manager                             ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Date of Joining   │ 2026-05-01                          ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Created By        │ admin_user on 2026-05-01 10:00 AM   ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Edited By         │ admin_user on 2026-05-20 03:30 PM   ││
   │  └───────────────────┴─────────────────────────────────────┘│
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
   ```

   ##### 2. Employee Information Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Employee ID | Text | Read-only | Unique alphanumeric code | `E101` | Unique employee identifier |
   | First Name | Text | Read-only | Min 2 characters | `John` | Employee given name |
   | Last Name | Text | Read-only | Min 2 characters | `Doe` | Employee surname |
   | Email Address | Email | Read-only | Valid email format | `john@roms.com` | Login and notification email |
   | Phone Number | Phone | Read-only | Exactly 10 digits, displayed with `+91` prefix | `+91 9811223344` | Employee contact number |
   | Role | Text | Read-only | Valid system role | `Manager` | Assigned operational role |
   | Date of Joining | Date | Read-only | Valid date format | `2026-05-01` | Employment start date |
   | Created By | Text | Read-only | Format: `{user} on {timestamp}` | `admin_user on 2026-05-01 10:00 AM` | Audit trail — creator identity and timestamp combined |
   | Edited By | Text | Read-only | Format: `{user} on {timestamp}` | `admin_user on 2026-05-20 03:30 PM` | Audit trail — last editor identity and timestamp combined |

   ---

   #### Tab 2: Assigned Branch

   Displays the branch location currently assigned to this employee in a **read-only detail card** format. This tab provides visibility into the employee's mapped branch without any edit capabilities — branch assignment is managed through the Edit flow (Screen 3.3).

   ##### 1. Assigned Branch Tab Preview
   ```text
   ├─────────────────────────────────────────────────────────────┤
   │   Employee Information    [Assigned Branch]                  │
   │                           ─────────────────                  │
   ├─────────────────────────────────────────────────────────────┤
   │                                                             │
   │  Assigned Branch Details                                    │
   │  ┌───────────────────┬─────────────────────────────────────┐│
   │  │ Branch Code       │ B001                                ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Branch Name       │ MG Road Branch                      ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ City              │ Bangalore                           ││
   │  ├───────────────────┼─────────────────────────────────────┤│
   │  │ Branch Status     │ ● Active                            ││
   │  └───────────────────┴─────────────────────────────────────┘│
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
   ```

   ##### 2. Assigned Branch Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Branch Code | Text | Read-only | Alphanumeric unique code | `B001` | Assigned branch identifier |
   | Branch Name | Text | Read-only | Minimum 3 characters | `MG Road Branch` | Assigned branch location name |
   | City | Text | Read-only | Valid city name | `Bangalore` | Branch city |
   | Branch Status | Badge | Read-only | 'Active' or 'Inactive' badge | `Active` | Color-coded branch status badge |

   ---

   ### SECTION D: Business Validations & Rules

   1. **Audit Trail Integrity**: Audit tracking fields (Created By, Edited By) are system-managed and cannot be edited by any user.
   2. **Tab State Persistence**: The currently active tab must be preserved in the URL query string (e.g. `?tab=branch`) so that browser refresh or shared links restore the correct tab view.
   3. **Back Navigation**: The `‹ Back to Employees` link must return the user to the Employee Dashboard (Screen 3.1), preserving any previously applied filters.
   4. **Read-Only Screen**: This screen has no edit, delete, deactivate, or assign actions. All management actions are accessible from the Employee Dashboard table (Screen 3.1) or through the Edit flow (Screen 3.3).
   5. **Unassigned Branch Handling**: If the employee's role does not require a branch assignment (e.g., Super Admin), the Assigned Branch tab displays a message: _"This employee is not assigned to any branch."_

   ### SECTION E: Dependencies

   - **Module Dependencies**: Depends directly on Module 2 (Branch Management) to query branch details for the employee's assigned location.

   ---

   ## Screen 3.5: Deactivate Employee Confirmation Modal

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
   Form used to add a new food item to the system. The screen is divided into two major sections: **Section A — Item Details & Image** (core food metadata) and **Section B — Customize Food Item** (the customization builder used by the admin to configure the customer-facing "Customize" experience for this item, e.g. add-ons). Customization options configured here are exclusively managed by the admin and automatically surfaced on the customer-facing ordering interface whenever this food item is shown.

   ---

   ### Section A: Item Details & Image

   #### 1. Overview
   Captures the core metadata for the food item: name, category, dietary classification, base price, description, and a primary image.

   #### 2. Screen Preview
   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │  Create Food Item                                           │
   ├─────────────────────────────────────────────────────────────┤
   │  ── Section A: Item Details ─────────────────────────────── │
   │                                                             │
   │  Item Details                  |  Item Image                │
   │  [Item Name: Paneer Tikka    ] |  ┌──────────────────────┐  │
   │  [Category: Starters      ▼]   |  │ [Image Preview]      │  │
   │  [Dietary Type: Veg       ▼]   |  │ paneer_tikka.png     │  │
   │  [Base Price (₹): 249.00     ] |  │                      │  │
   │  [Description: Spiced cottage] |  │ [Change Image]       │  │
   │  [cheese grilled in tandoor  ] |  └──────────────────────┘  │
   │                                                             │
   ├─────────────────────────────────────────────────────────────┤
   │  ── Section B: Customize Food Item ──────────────────────── │
   │  (See Section B below)                                      │
   ├─────────────────────────────────────────────────────────────┤
   │                                          [Cancel] [Save Food Item] │
   └─────────────────────────────────────────────────────────────┘
   ```

   #### 3. Section A Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Item Name | Text | Yes | Min 3, max 100 characters, Unique | `Paneer Tikka` | Display name of the item |
   | Category | Dropdown | Yes | Must match active categories master | `Starters` | Item classification |
   | Dietary Type | Dropdown | Yes | Veg, Non-Veg, Egg, Vegan | `Veg` | Dietary classification |
   | Base Price | Currency | Yes | Numeric, greater than zero | `249.00` | Default customer pricing (before any customization add-ons) |
   | Description | Text Area | No | Max 500 characters | `Spiced cottage cheese...` | Item description shown to customers |
   | Item Image | File | Yes | PNG or JPG format, size < 2MB | `paneer_tikka.png` | Primary thumbnail upload |

   #### 4. Section A Validations
   - **Price Limit**: Price must be greater than zero.
   - **Image Check**: Only JPG or PNG formats are allowed, under `2MB` max size.
   - **Item Name**: Must be unique globally to avoid duplication.

   ---

   ### Section B: Customize Food Item (Customization Builder)

   #### 1. Overview
   This section allows the admin to define **Customization Options** directly for the food item. Each option represents a customer-facing add-on (e.g., "Add Cheese", "Add Mushrooms"). Customers can select multiple options (multi-select checkboxes). The admin only needs to define the option label and its price add-on.

   > **Key Design Principle**: All customization data is created and managed entirely by the admin at the food item level. The customer-facing ordering screens (Customer App / POS / Kiosk) simply read and render these options as a single list of checkboxes — no customization configuration happens on the customer side.

   #### 2. Concept Glossary
   | Term | Definition |
   |---|---|
   | **Customization Option** | An individual add-on choice configured for the food item (e.g., "Add Cheese", "Add Mushrooms") |
   | **Price Add-on** | Extra price added to the item's Base Price when the customer selects this option (can be ₹0 for free add-ons) |

   #### 3. Customization Builder UI — Full Screen Preview
   ```text
   ┌─────────────────────────────────────────────────────────────────────┐
   │  ── Section B: Customize Food Item ─────────────────────────────── │
   │                                                     [+ Add Option]  │
   ├─────────────────────────────────────────────────────────────────────┤
   │                                                                     │
   │  No customizations added yet.                                       │
   │  Click [+ Add Option] to allow customers to add extras to this item.│
   │                                                                     │
   └─────────────────────────────────────────────────────────────────────┘

   ── After clicking [+ Add Option] — Options table appears: ────────────

   ┌─────────────────────────────────────────────────────────────────────┐
   │  ── Section B: Customize Food Item ─────────────────────────────── │
   │                                                     [+ Add Option]  │
   ├─────────────────────────────────────────────────────────────────────┤
   │  Option Label                  │ Price Add-on (₹)   │ Actions       │
   ├────────────────────────────────┼────────────────────┼───────────────┤
   │  [Add Cheese                 ] │ [30.00          ]  │ [🗑]           │
   │  [Add Mushrooms              ] │ [25.00          ]  │ [🗑]           │
   │  [Add Olives                 ] │ [20.00          ]  │ [🗑]           │
   └────────────────────────────────┴────────────────────┴───────────────┘
   ```

   #### 4. Customization Options — Interaction Behavior
   | Action | Trigger | Behavior |
   |---|---|---|
   | **Add Option** | Click `[+ Add Option]` | Appends a new blank option row inline within the options table. |
   | **Delete Option** | Click `[🗑]` on option row | Removes that option row immediately (no confirmation required). |

   #### 5. Section B — Customization Option Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Option Label | Text | Yes (per option) | Min 1, max 60 characters, Unique | `Add Cheese` | Text label shown to customer for this add-on option |
   | Option Price Add-on | Currency | Yes (per option) | Numeric ≥ 0 | `30.00` | Additional charge added to the item's Base Price when this option is selected. Enter `0` for free add-ons |

   #### 6. Section B — Validations
   - **Option Minimum**: If customizations are added, each must have a valid label and price.
   - **Option Label Uniqueness**: Option labels must be unique within the food item.
   - **Price Non-Negative**: Option price add-on must be `≥ 0`. Negative prices are rejected.
   - **No Customizations**: Having zero options is valid — it means the item has no customer-facing add-ons (e.g., a plain soft drink). The customer interface will not show a customization panel for such items.

   #### 7. Customer-Side Rendering Contract
   > This section documents how the admin-configured customization data is consumed on the customer-facing interface.

   | Admin Configuration | Customer-Facing Rendering |
   |---|---|
   | Every customization option | Rendered as a **checkbox list** — customer can tick any combination of options |
   | Option `Price Add-on = 0` | Displayed as a free add-on (e.g., `Extra Sauce — Free`) |
   | Option `Price Add-on > 0` | Displayed with the extra charge next to the label (e.g., `Add Cheese (+₹30)`) |
   | Ordering | Customer sees options in the same top-to-bottom order as configured by admin |
   | Item with zero options | No "Customize" section is shown to the customer; item is directly added to cart |

   #### 8. Calling Section (Branch / POS Context)
   > In non-customer contexts (e.g., Branch POS screen, Kitchen display, Waiter app), the customization data is used for **calling/order confirmation** purposes:
   - When an order is placed, all selected add-on option labels are stored with the order line item.
   - Branch-side screens (e.g., Kitchen Order Tickets, POS Order Summary) **display the selected add-ons** alongside the food item name so kitchen staff know exactly what extras to include.
   - Example kitchen ticket display:
   ```
   Margherita Pizza  × 1
      › Customizations: Add Cheese, Add Mushrooms
   ```
   - The branch POS does **not** manage customization setup — only admin does.

   #### 9. Dependencies
   - **Data Dependencies**: Relies on categories master mapping tables (e.g. Starters, Sides, Desserts) to resolve Category dropdown in Section A.
   - **Customer App**: Customer ordering interface reads customizations from the food item API response and renders them as checkbox lists.
   - **Branch/POS Interface**: Kitchen order tickets and branch order summaries read saved add-on selections from completed order records.

   ---

   ## Screen 5.3: Update Food Item Screen

   ### 1. Overview
   Edit existing menu item details. The screen mirrors the **Create Food Item Screen (5.2)** in structure — it contains the same two sections: **Section A — Item Details & Image** (all fields pre-populated with the current item's saved data) and **Section B — Customize Food Item** (pre-populated with all previously saved customization options). Admins can add, edit, or delete customization options.

   ### 2. Screen Preview
   ```text
   ┌─────────────────────────────────────────────────────────────────────┐
   │  Update Food Item — Paneer Tikka                                    │
   ├─────────────────────────────────────────────────────────────────────┤
   │  ── Section A: Item Details ─────────────────────────────────────── │
   │                                                                     │
   │  Item Details                  |  Item Image                       │
   │  [Item Name: Paneer Tikka    ] |  ┌──────────────────────┐         │
   │  [Category: Starters      ▼]   |  │ [Current Image]      │         │
   │  [Dietary Type: Veg       ▼]   |  │ paneer_tikka.png     │         │
   │  [Base Price (₹): 279.00     ] |  │                      │         │
   │  [Description: Spiced cottage] |  │ [Upload New Image]   │         │
   │  [cheese grilled in tandoor  ] |  └──────────────────────┘         │
   │                                                                     │
   ├─────────────────────────────────────────────────────────────────────┤
   │  ── Section B: Customize Food Item ──────────────────────────────── │
   │                                                     [+ Add Option]  │
   ├─────────────────────────────────────────────────────────────────────┤
   │  Option Label                  │ Price Add-on (₹)   │ Actions       │
   ├────────────────────────────────┼────────────────────┼───────────────┤
   │  [Add Cheese                 ] │ [30.00          ]  │ [🗑]           │
   │  [Add Mushrooms              ] │ [25.00          ]  │ [🗑]           │
   │  [Add Olives                 ] │ [20.00          ]  │ [🗑]           │
   └────────────────────────────────┴────────────────────┴───────────────┘
   ├─────────────────────────────────────────────────────────────────────┤
   │                                          [Cancel] [Save Changes]    │
   └─────────────────────────────────────────────────────────────────────┘
   ```

   ### 3. Section A Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Item Name | Text | Yes | Min 3, max 100 characters, Unique | `Paneer Tikka` | Display name of the item |
   | Category | Dropdown | Yes | Must match active categories master | `Starters` | Item classification |
   | Dietary Type | Dropdown | Yes | Veg, Non-Veg, Egg, Vegan | `Veg` | Dietary classification |
   | Base Price | Currency | Yes | Numeric, greater than zero | `279.00` | Default customer pricing |
   | Description | Text Area | No | Max 500 characters | `Spiced cottage cheese...` | Item description |
   | Item Image | File | No | PNG or JPG format, size < 2MB | `paneer_tikka.png` | Optional — replaces current thumbnail only if a new file is uploaded |

   ### 4. Section B — Customize Food Item (Customization Option Builder)
   #### 1. Overview
   In the Update/Edit Screen, Section B pre-loads all previously saved customization options for the food item. The admin can edit existing option labels and price add-ons, add new options inline, or delete options.
   #### 2. Interaction Behavior
   | Action | Trigger | Behavior |
   |---|---|---|
   | **Add Option** | Click `[+ Add Option]` | Appends a new blank option row inline within the options table. |
   | **Delete Option** | Click `[🗑]` on option row | Removes that option row immediately (no confirmation required). |
   #### 3. Section B — Customization Option Fields Table
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Option Label | Text | Yes (per option) | Min 1, max 60 characters, Unique | `Add Cheese` | Text label shown to customer for this add-on option |
   | Option Price Add-on | Currency | Yes (per option) | Numeric ≥ 0 | `30.00` | Additional charge added to the item's Base Price when this option is selected. Enter `0` for free add-ons |
   #### 4. Validations
   - **Option Minimum**: If customizations are added, each must have a valid label and price.
   - **Option Label Uniqueness**: Option labels must be unique within the food item.
   - **Price Non-Negative**: Option price add-on must be `≥ 0`. Negative prices are rejected.
   #### 5. Update-Specific Validations
   - Item image upload is optional for updates — if no new file is selected, the existing image is retained.
   - Modifying `Base Price` only affects future orders; historical order items tables retain the checkout price details captured at order time.
   - Deleting a customization option that was previously available does **not** retroactively alter past order records; the selected option label is stored as a text snapshot on the order line item.
   ---

   ## Screen 5.4: View Food Item Slide-out Drawer

   ### 1. Overview
   Redesigned detailed drawer panel sliding from the right edge. Displays CDN image preview, item configurations, and a mapping table showing which branch locations have this item active on their menu.

   ### 2. Screen Preview
   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │  Paneer Tikka Detail View                                [X]│
   ├─────────────────────────────────────────────────────────────┤
   │  [Image: Paneer Tikka CDN URL]                              │
   │  Name: Paneer Tikka | Price: ₹249.00 | Tag: 🟢 Veg           │
   │  Category: Starters                                         │
   │  Description: Spiced cottage cheese grilled in tandoor.     │
   │                                                             │
   │  Customization Options (3)                                  │
   │  ┌─────────────────────────────────────┬──────────────────────┐│
   │  │ Option                              │ Price Add-on         ││
   │  ├─────────────────────────────────────┼──────────────────────┤│
   │  │ Add Cheese                          │ +₹30.00              ││
   │  │ Add Mushrooms                       │ +₹25.00              ││
   │  │ Add Olives                          │ +₹20.00              ││
   │  └─────────────────────────────────────┴──────────────────────┘│
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
   | Customization Options Count | Number | Read-only | Integer ≥ 0 | `3` | Badge count showing total number of customization options configured for this item |
   | Customization Option: Label | Text | Read-only | Min 1 chars | `Add Cheese` | Name of configured customization option |
   | Customization Option: Price | Currency | Read-only | Numeric ≥ 0 | `₹30.00` | Additional charge added to the item's Base Price when this option is selected |

   ### 5. Validations
   - Mapped branch list queries active `branch_menus` tables to generate locations data dynamically.
   - If the item has no customization options, the "Customization Options" section in the drawer is hidden entirely (not shown as an empty block).

   ### 6. Dependencies
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

   # 8. Module 6 — Coupon & Promotion Management

   ## Screen 6.1: Coupon Dashboard (List View)

   ### 1. Overview
   Central landing page for marketing promotions. Lists all active and inactive discount codes, including basic metadata like discount value and status. Admins can view, edit, or toggle the status of coupons here.

   ### 2. Screen Preview
   ```text
   ┌──────────────────────────────────────────────────────────────────────┐
   │  Coupons & Promotions                              [+ Create Coupon] │
   ├──────────────────────────────────────────────────────────────────────┤
   │  🔍 Search Code...          [Status: All ▼] [Type: All ▼]            │
   ├──────────────────────────────────────────────────────────────────────┤
   │ Code        │ Discount │ Valid Until │ Status     │ Actions          │
   │-------------│----------│-------------│------------│------------------│
   │ WELCOME50   │ 50% Off  │ 2026-12-31  │ ● Active   │ [View][Edit][De] │
   │ FESTIVE20   │ ₹200 Off │ 2026-10-30  │ ● Inactive │ [View][Edit][Ac] │
   ├──────────────────────────────────────────────────────────────────────┤
   │  Showing 1-10 of 15                               [<] [1] [2] [>]    │
   └──────────────────────────────────────────────────────────────────────┘
   ```

   ### 3. Screen Fields Table

   #### Header Fields
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Create Coupon Button | Button | — | Triggers page change | `[+ Create Coupon]` | Navigates to Screen 6.2 |
   | Search Box | Text | No | Max 50 characters | `WELCOME50` | Search by coupon code |
   | Status Filter | Dropdown | No | Active, Inactive, All | `Active` | Filters list by status |
   | Type Filter | Dropdown | No | Percentage, Flat, All | `All` | Filters list by discount type |

   #### Table Fields
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Table Column: Code | Text | Read-only | Alphanumeric | `WELCOME50` | The promotion code |
   | Table Column: Discount | Text | Read-only | Percentage or Flat rate | `50% Off` | Display format based on type |
   | Table Column: Valid Until | Date | Read-only | Valid date | `2026-12-31` | Expiration date |
   | Table Column: Status | Badge | Read-only | Active or Inactive | `Active` | Current status of coupon |
   | Row Action: View | Link | — | Triggers page change | `[View]` | Navigates to Screen 6.4 |
   | Row Action: Edit | Link | — | Triggers page change | `[Edit]` | Navigates to Screen 6.3 |
   | Row Action: Deactivate | Button | — | Triggers modal | `[De]` | Opens Screen 6.5 |
   | Row Action: Activate | Button | — | Triggers API call | `[Ac]` | Activates an inactive coupon |
   | Pagination Info | Label | Read-only | Shows record count | `Showing 1-10 of 15` | Current records being viewed |
   | Pagination Controls| Buttons | — | Changes page | `[<] [1] [2] [>]` | Table navigation |

   ---

   ## Screen 6.2: Create Coupon Screen

   ### 1. Overview
   Input form for creating hyper-personalized, targeted promotions based on modern trends. Admins set up both the **Basic Details** (what the discount is) and the **Conditions** (who gets it and when).

   ### 2. Screen Preview
   ```text
   ┌─────────────────────────────────────────────────────────────┐
   │  Create New Coupon                                          │
   ├─────────────────────────────────────────────────────────────┤
   │  Basic Details                                              │
   │  [Coupon Code: SUMMER20     ]  [Status: Active           ▼] │
   │  [Discount Type: Percentage ▼]  [Discount Value: 20       ] │
   │  [Max Discount Amount: ₹150  ]                              │
   │                                                             │
   │  Conditions & Targeting                                     │
   │  [Minimum Order Value: ₹500  ]  [Usage Limit (Total): 1000] │
   │  [Valid From: 2026-06-01    ]  [Valid Until: 2026-06-30  ] │
   │  [Target Audience: Loyalty Tier 1 & 2                    ▼] │
   │  [Applicable Branches: All Branches                      ▼] │
   │                                                             │
   │                                      [Cancel] [Save Coupon] │
   └─────────────────────────────────────────────────────────────┘
   ```

   ### 3. Screen Fields Table

   #### Basic Details Fields
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Coupon Code | Text | Yes | Alphanumeric, uppercase, min 4 | `SUMMER20` | Customer-facing code |
   | Status | Dropdown | Yes | Active, Inactive | `Active` | Initial status |
   | Discount Type | Dropdown | Yes | Flat, Percentage | `Percentage` | Determines calculation |
   | Discount Value | Number | Yes | >0 | `20` | Flat amt or % value 

   #### Conditions & Targeting Fields
   | Field Name | Type | Required | Validation | Example | Notes |
   |---|---|---|---|---|---|
   | Minimum Order Value | Currency | No | >=0 | `₹500` | Minimum cart total |
   | Valid From | Date | Yes | Cannot be in past | `2026-06-01` | Start date |
   | Valid Until | Date | Yes | >= Valid From | `2026-06-30` | End date |
   | Target Audience | Dropdown | No | All, New Users, Loyalty | `Loyalty` | Personalization cohort |
   | Applicable Branches | Dropdown | No | Multi-select valid branches | `All Branches` | Location restriction |
   | Cancel Button | Button | — | Returns to Dashboard | `[Cancel]` | Discards changes |
   | Save Coupon Button | Button | — | Submits form | `[Save Coupon]` | Saves coupon data |

   ### 4. Validations
   - **Code Uniqueness**: Code must not exist in the database.
   - **Percentages**: If type is Percentage, value cannot exceed 100.
   - **Dates**: Valid Until must be chronologically after or same as Valid From.

   ---

   ## Screen 6.3: Update Coupon Screen

   ### 1. Overview
   Configuration form to adjust an existing coupon's settings. The Coupon Code itself is permanently locked to preserve analytics integrity, but conditions and validity can be updated.

   ### 2. Validations
   - Coupon Code is a read-only Label element.
   - Saving updates applies immediately to all subsequent checkouts.

   ---

   ## Screen 6.4: View Coupon Details Screen

   ### 1. Overview
   Read-only detail screen for viewing coupon configuration and basic usage metrics (e.g., total redemptions). No edit or delete actions.

   ---

   ## Screen 6.5: Deactivate Coupon Confirmation Modal

   ### 1. Overview
   Warning panel triggered when suspending an active coupon campaign to prevent further redemptions immediately.

   ### 2. Screen Preview
   ```text
   ┌───────────────────────────────────────────────────────────┐
   │  Deactivate Coupon — SUMMER20?                         [X]│
   ├───────────────────────────────────────────────────────────┤
   │  ⚠️ WARNING: Deactivating this coupon will instantly prevent │
   │  any future customers from redeeming it at checkout.       │
   │                                                           │
   │                       [Cancel]  [Confirm Deactivation]    │
   └───────────────────────────────────────────────────────────┘
   ```

   ---

   # 9. Global Role & Permission Matrix

   Permissions are strictly enforced based on the system roles:

   | Module | Super Admin | Admin | Manager |
   |---|:---:|:---:|:---:|
   | **Dashboard / Analytics** | Full Access | Full Access | Branch Only |
   | **Branch Management** | Full Access | Full Access | View Branch Only |
   | **Employee Management**| Full Access | Full Access | View Branch Only |
   | **Order Reports** | Full Access | Full Access | View Branch Only |
   | **Food Management** | Full Access | Full Access | Read Only |
   | **Coupon & Promotion Management** | Full Access | Full Access | Read Only |

   ***End of Document***
