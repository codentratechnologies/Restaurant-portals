# Restaurant Order Management System — Admin Portal

## Product Requirement Document (PRD) + UI/UX Specification + Development Handover

| Document Property | Value |
|---|---|
| **Product Name** | Restaurant Order Management System (ROMS) |
| **Portal** | Admin Portal (Web) |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Created Date** | 2026-05-26 |
| **Last Updated** | 2026-05-26 |
| **Author** | Product & Engineering Team |
| **Audience** | Developers, QA, Designers, Stakeholders |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview & Architecture](#2-system-overview--architecture)
3. [Global UI/UX Standards](#3-global-uiux-standards)
4. [Module 1 — Home & Analytics](#4-module-1--home--analytics)
5. [Module 2 — Branch Management](#5-module-2--branch-management)
6. [Module 3 — Employee Management](#6-module-3--employee-management)
7. [Module 4 — Order Report](#7-module-4--order-report)
8. [Module 5 — Food Management](#8-module-5--food-management)
9. [Global Database Schema](#9-global-database-schema)
10. [Global Role & Permission Matrix](#10-global-role--permission-matrix)
11. [Appendix — Reusable UI Components Library](#11-appendix--reusable-ui-components-library)
12. [Appendix — Notification & Toast Messages Catalog](#12-appendix--notification--toast-messages-catalog)
13. [Appendix — Suggested Tech Notes](#13-appendix--suggested-tech-notes)

---

# 1. Executive Summary

The **Restaurant Order Management System (ROMS)** is a multi-portal SaaS platform designed to manage end-to-end restaurant operations across multiple branches. The platform consists of four portals:

| Portal | Platform | Purpose |
|---|---|---|
| Admin Portal | Web | Centralized management of branches, menus, employees, orders, and analytics |
| Restaurant Portal | Web | Branch-level order processing, kitchen management, and local operations |
| Customer App | Mobile | Food browsing, ordering, payments, and order tracking |
| Delivery App | Mobile | Delivery assignment, route management, and delivery status updates |

**This document covers the Admin Portal exclusively.**

### Business Goals

- Provide a centralized command center for restaurant chain administrators
- Enable real-time visibility into multi-branch operations
- Streamline food menu management and branch-level menu assignment
- Deliver actionable analytics for data-driven decision making
- Maintain audit trails for all administrative actions
- Support scalability for franchise and multi-role expansion

### Target Users

| User Role | Description |
|---|---|
| Super Admin | Full system access; manages all modules |
| Admin | Manages branches, employees, food items, and views reports |
| Manager | Limited access; views reports and branch-specific data |

---

# 2. System Overview & Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN PORTAL (Web)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │ Home &   │ │ Branch   │ │ Employee │ │ Order    │ │ Food │ │
│  │ Analytics│ │ Mgmt     │ │ Mgmt     │ │ Report   │ │ Mgmt │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──┬───┘ │
│       │             │            │             │          │     │
│  ┌────▼─────────────▼────────────▼─────────────▼──────────▼───┐ │
│  │                    API Gateway / BFF Layer                  │ │
│  └────────────────────────┬───────────────────────────────────┘ │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      Backend Microservices                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │ Auth     │ │ Branch   │ │ Employee │ │ Order    │ │ Food │ │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │Svc   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──┬───┘ │
│       └─────────────┴────────────┴─────────────┴──────────┘     │
│                              │                                   │
│                    ┌─────────▼──────────┐                        │
│                    │   Database Layer   │                        │
│                    │  (PostgreSQL/MySQL) │                        │
│                    └────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### Module Dependency Map

```
Food Management ──────► Branch Management (Assign Menu)
       │
       ▼
Order Report ◄──────── Branch Management
       │
       ▼
Home & Analytics ◄──── All Modules (aggregated data)

Employee Management ──► Branch Management (branch assignment)
```

### Key Workflow

1. **Admin creates Food Items** in Food Management module
2. **Admin creates Branches** in Branch Management module
3. **Admin assigns Food Items to Branches** via Assign Menu screen
4. **Admin creates Employees** and assigns them to branches
5. **Orders flow in** from Customer App → Restaurant Portal → tracked in Order Report
6. **Home & Analytics** aggregates all data for dashboards and reports

---

# 3. Global UI/UX Standards

### 3.1 Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR: Logo | Search | Notifications | Profile Dropdown   │
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
│            │  │                                          │   │
│            │  ├─────────────────────────────────────────┤   │
│            │  │  Pagination                              │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
├────────────┴─────────────────────────────────────────────────┤
│  FOOTER: © 2026 ROMS | Version 1.0.0                        │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Design Tokens

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
| Font Family | `Inter, system-ui, sans-serif` | All text |
| Border Radius | `8px` | Cards, buttons, inputs |

### 3.3 Global States

| State | Visual Treatment |
|---|---|
| **Loading** | Skeleton placeholders matching content layout; spinner on buttons |
| **Empty** | Illustration + descriptive text + primary CTA button |
| **Error** | Red alert banner with retry action; inline field errors in red |
| **Success** | Green toast notification (auto-dismiss 4s) |
| **Confirmation** | Centered modal with destructive action in red, cancel in outline |

### 3.4 Status Badge Standards

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

### 3.5 Responsive Breakpoints

| Breakpoint | Width | Sidebar Behavior |
|---|---|---|
| Desktop | ≥ 1280px | Expanded sidebar with labels |
| Tablet | 768px–1279px | Collapsed sidebar (icons only) |
| Mobile | < 768px | Hidden sidebar (hamburger toggle) |

### 3.6 Audit Fields (All Entities)

Every create/update form and detail view must include:

| Field | Type | Auto-populated | Display |
|---|---|---|---|
| `created_by` | UUID | Yes | Show as username in detail views |
| `created_at` | Timestamp | Yes | Format: `DD MMM YYYY, hh:mm A` |
| `updated_by` | UUID | Yes | Show as username in detail views |
| `updated_at` | Timestamp | Yes | Format: `DD MMM YYYY, hh:mm A` |

---

# 4. Module 1 — Home & Analytics

## 4.1 Overview

### Purpose
The Home & Analytics module serves as the **central command dashboard** for the Admin Portal. It provides a consolidated, real-time overview of all restaurant operations including revenue, orders, branch performance, and key business metrics.

### Business Goal
- Enable administrators to make data-driven decisions from a single screen
- Provide early visibility into operational bottlenecks (underperforming branches, declining order trends)
- Reduce the time required to gather business insights from multiple modules

### User Flow
1. Admin logs into the portal → lands on the **Dashboard** (default home screen)
2. Dashboard shows KPI cards, charts, recent orders, and top-selling items
3. Admin can filter data by **date range**, **branch**, and **time period** (daily/weekly/monthly)
4. Admin can click any KPI card or chart element to drill down into detailed analytics
5. Admin can export reports as **PDF** or **CSV**

### Main Actions
- View real-time KPI metrics
- Filter analytics by date range, branch, and period
- Drill down into specific analytics sections
- Export reports
- View recent orders with quick status overview
- Monitor branch performance comparisons

---

## 4.2 UI/UX Layout Description

### Header Section
- **Page Title**: "Dashboard" with a welcome message: "Welcome back, {Admin Name}"
- **Date Range Picker**: Top-right, allowing custom date range selection
- **Branch Filter Dropdown**: Multi-select dropdown to filter by specific branches or "All Branches"
- **Period Toggle**: Segmented control — Daily | Weekly | Monthly
- **Export Button**: Dropdown with options for PDF and CSV export

### Main Content Area

#### Row 1 — KPI Summary Cards (4 cards, equal width)
| Card | Metric | Icon | Trend Indicator |
|---|---|---|---|
| Total Revenue | ₹ amount | 💰 | ▲/▼ % vs previous period |
| Total Orders | Count | 📦 | ▲/▼ % vs previous period |
| Active Branches | Count | 🏪 | Static count |
| Active Employees | Count | 👥 | Static count |

Each card shows:
- Metric label
- Current value (large, bold)
- Trend percentage with up/down arrow (green for positive, red for negative)
- Sparkline chart (last 7 data points)

#### Row 2 — Charts Section (2 columns: 60/40 split)
- **Left (60%)**: Revenue Trend Chart — Line/Area chart showing revenue over selected period
- **Right (40%)**: Order Status Distribution — Doughnut chart (Delivered, Cancelled, Pending, Processing)

#### Row 3 — Branch Performance + Top Selling Items (2 columns: 50/50 split)
- **Left (50%)**: Branch Performance — Horizontal bar chart comparing revenue across branches
- **Right (50%)**: Top Selling Food Items — Ranked list (Top 10) with item name, image thumbnail, total orders, and revenue

#### Row 4 — Recent Orders Table
- Shows last 20 orders with columns: Order ID, Customer Name, Branch, Items Count, Total Amount, Status, Order Time
- Each row is clickable → navigates to Order Detail View (Module 4)
- Status column uses color-coded badges

#### Row 5 — Active Branches Summary
- Card grid (3 columns) showing each active branch with:
  - Branch name and code
  - Today's order count
  - Today's revenue
  - Active employee count
  - Status badge

### Sidebar
- Standard sidebar as per global layout
- "Home" menu item is highlighted/active
- Sub-items: Dashboard, Business Analytics, Revenue Analytics, Order Analytics

### Empty States
- **No data for selected period**: "No data available for the selected date range. Try adjusting your filters."
- **No branches created**: "No branches found. Create your first branch to see analytics." + CTA: "Create Branch"
- **No orders yet**: "No orders have been placed yet. Orders will appear here once customers start ordering."

### Loading States
- Skeleton loaders for each KPI card (rectangle pulse)
- Chart areas show skeleton with muted chart outline
- Table shows 5 skeleton rows

### Error States
- API failure: Red banner at top — "Unable to load dashboard data. Please try again." + Retry button
- Partial failure: Affected widget shows inline error with retry link

---

## 4.3 Screen Preview — Admin Dashboard

```
┌──────────────────────────────────────────────────────────────────────────┐
│  🍽 ROMS          🔍 Search...        🔔 (3)    👤 Admin ▼             │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │  Home > Dashboard                                          │
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
│            │ │  Revenue Trend (Line Chart)  │ │  Order Status (Donut) ││
│            │ │  ___/\___/\___               │ │     ╭───╮             ││
│            │ │ /            \               │ │    │     │            ││
│            │ │/              \_____         │ │     ╰───╯             ││
│            │ │                              │ │ ● Delivered  72%      ││
│            │ │ Jan Feb Mar Apr May          │ │ ● Cancelled   8%      ││
│            │ └──────────────────────────────┘ │ ● Pending    12%      ││
│            │                                  │ ● Processing  8%      ││
│            │                                  └────────────────────────┘│
│            │─────────────────────────────────────────────────────────────│
│            │  Recent Orders                              [View All →]  │
│            │ ┌──────┬──────────┬──────────┬─────┬────────┬───────────┐ │
│            │ │ ID   │ Customer │ Branch   │ Qty │ Amount │ Status    │ │
│            │ ├──────┼──────────┼──────────┼─────┼────────┼───────────┤ │
│            │ │#4021 │ Rahul S. │ Koramang.│  3  │ ₹450   │ ● Deliver.│ │
│            │ │#4020 │ Priya K. │ MG Road  │  5  │ ₹820   │ ● Pending │ │
│            │ │#4019 │ Amit R.  │ Whitefld.│  2  │ ₹320   │ ● Process.│ │
│            │ └──────┴──────────┴──────────┴─────┴────────┴───────────┘ │
│            │                       [1] [2] [3] ... [→]                  │
└────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 4.4 Screen Fields — Dashboard Filters

| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Date Range Start | Date Picker | No | Cannot be future date; must be ≤ end date | `2026-05-01` | Defaults to 30 days ago |
| Date Range End | Date Picker | No | Cannot be future date; must be ≥ start date | `2026-05-26` | Defaults to today |
| Branch Filter | Multi-select Dropdown | No | Must be valid branch IDs | `All Branches` | Defaults to "All Branches" |
| Period Toggle | Segmented Control | No | One of: Daily, Weekly, Monthly | `Monthly` | Defaults to "Monthly" |
| Export Format | Dropdown | No | One of: PDF, CSV | `PDF` | Triggered via Export button |

---

## 4.5 KPI Card Data Structure

| KPI | Source | Calculation | Trend Comparison |
|---|---|---|---|
| Total Revenue | `orders` table | `SUM(total_amount)` WHERE status = 'Delivered' | vs. previous equivalent period |
| Total Orders | `orders` table | `COUNT(*)` for selected period | vs. previous equivalent period |
| Active Branches | `branches` table | `COUNT(*)` WHERE status = 'Active' | N/A (static) |
| Active Employees | `employees` table | `COUNT(*)` WHERE status = 'Active' | N/A (static) |

---

## 4.6 Validation Rules

- Date range cannot exceed 365 days
- Start date must be on or before end date
- Branch filter IDs must exist in the system
- Export triggers must have at least some data; show warning if export is attempted on empty dataset
- Chart data points must gracefully handle zero values (show flat line, not break)

---

## 4.7 Dependencies

| Dependency Type | Details |
|---|---|
| **Module Dependencies** | Depends on Branch Management (branch data), Food Management (food item data), Order Report (order data), Employee Management (employee data) |
| **Data Dependencies** | Requires aggregated data from `orders`, `branches`, `employees`, `food_items`, `order_items` tables |
| **API Dependencies** | Analytics aggregation APIs; real-time or near-real-time data refresh |
| **Workflow Dependencies** | Dashboard is read-only; no write operations. All source data is managed in respective modules |

---

## 4.8 API Requirement Suggestions

### GET /api/admin/dashboard/kpis

**Description**: Fetch KPI summary cards data

**Query Parameters**:
```
?start_date=2026-05-01&end_date=2026-05-26&branch_ids=1,2,3&period=monthly
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "total_revenue": {
      "current": 1245600,
      "previous": 1107200,
      "trend_percentage": 12.5,
      "trend_direction": "up",
      "sparkline": [980000, 1020000, 1100000, 1050000, 1150000, 1200000, 1245600]
    },
    "total_orders": {
      "current": 3842,
      "previous": 3547,
      "trend_percentage": 8.3,
      "trend_direction": "up",
      "sparkline": [480, 520, 560, 530, 590, 570, 592]
    },
    "active_branches": {
      "current": 12
    },
    "active_employees": {
      "current": 86
    }
  }
}
```

### GET /api/admin/dashboard/revenue-trend

**Description**: Fetch revenue trend chart data

**Query Parameters**:
```
?start_date=2026-05-01&end_date=2026-05-26&branch_ids=all&period=daily
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "labels": ["01 May", "02 May", "03 May"],
    "datasets": [
      {
        "label": "Revenue",
        "data": [42000, 38500, 51200]
      }
    ]
  }
}
```

### GET /api/admin/dashboard/order-status-distribution

**Description**: Fetch order status breakdown for doughnut chart

**Response**:
```json
{
  "status": "success",
  "data": {
    "delivered": { "count": 2766, "percentage": 72 },
    "cancelled": { "count": 307, "percentage": 8 },
    "pending": { "count": 461, "percentage": 12 },
    "processing": { "count": 308, "percentage": 8 }
  }
}
```

### GET /api/admin/dashboard/branch-performance

**Description**: Fetch branch-wise revenue comparison

**Response**:
```json
{
  "status": "success",
  "data": [
    { "branch_id": 1, "branch_name": "Koramangala", "revenue": 245000, "orders": 620 },
    { "branch_id": 2, "branch_name": "MG Road", "revenue": 198000, "orders": 510 }
  ]
}
```

### GET /api/admin/dashboard/top-selling-items

**Description**: Fetch top 10 selling food items

**Query Parameters**:
```
?limit=10&start_date=2026-05-01&end_date=2026-05-26
```

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "food_item_id": 12,
      "name": "Chicken Biryani",
      "image_url": "/uploads/food/chicken-biryani.jpg",
      "total_orders": 842,
      "total_revenue": 210500,
      "rank": 1
    }
  ]
}
```

### GET /api/admin/dashboard/recent-orders

**Description**: Fetch most recent orders

**Query Parameters**:
```
?limit=20&page=1
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "order_id": "ORD-4021",
        "customer_name": "Rahul Sharma",
        "branch_name": "Koramangala",
        "items_count": 3,
        "total_amount": 450,
        "status": "Delivered",
        "order_time": "2026-05-26T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_records": 100
    }
  }
}
```

### GET /api/admin/dashboard/active-branches-summary

**Description**: Fetch summary cards for all active branches

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "branch_id": 1,
      "branch_name": "Koramangala",
      "branch_code": "KRM-001",
      "todays_orders": 45,
      "todays_revenue": 12500,
      "active_employees": 8,
      "status": "Active"
    }
  ]
}
```

---

## 4.9 Database Tables (Analytics Views)

> Analytics data is derived from core tables in other modules. Suggested materialized views for performance:

### View: `v_daily_revenue_summary`

| Column | Type | Description |
|---|---|---|
| `summary_date` | DATE | The date of aggregation |
| `branch_id` | INT (FK) | References `branches.id` |
| `total_orders` | INT | Count of orders for the day |
| `total_revenue` | DECIMAL(12,2) | Sum of delivered order amounts |
| `cancelled_orders` | INT | Count of cancelled orders |
| `avg_order_value` | DECIMAL(10,2) | Average order value |

### View: `v_top_selling_items`

| Column | Type | Description |
|---|---|---|
| `food_item_id` | INT (FK) | References `food_items.id` |
| `food_name` | VARCHAR(150) | Name of the food item |
| `total_quantity_sold` | INT | Total units sold |
| `total_revenue` | DECIMAL(12,2) | Revenue from this item |
| `period_start` | DATE | Start of aggregation period |
| `period_end` | DATE | End of aggregation period |

---

## 4.10 Role & Permission Logic

| Action | Super Admin | Admin | Manager |
|---|---|---|---|
| View Dashboard | ✅ | ✅ | ✅ |
| Filter by All Branches | ✅ | ✅ | ❌ (own branch only) |
| Export Reports | ✅ | ✅ | ✅ |
| View Revenue Data | ✅ | ✅ | ✅ (own branch) |
| Access Business Analytics | ✅ | ✅ | ❌ |

---

## 4.11 Development Notes

### Frontend Behavior
- Dashboard is the **default landing page** after login
- Use **lazy loading** for chart components to improve initial page load
- KPI cards should load independently; do not block the entire dashboard if one API fails
- Charts should use `Chart.js` or `Recharts` (React) / `ApexCharts` (Vue) for interactive visualizations
- Implement **client-side caching** (5-minute TTL) for dashboard data to reduce API calls on tab switches
- Period toggle should trigger a re-fetch of all dashboard data with the new period parameter

### Backend Logic
- Use **materialized views** or **pre-aggregated tables** for dashboard queries to avoid expensive real-time aggregations
- Schedule a **cron job** (every 15 minutes) to refresh materialized views
- Revenue calculations must only include orders with status = `Delivered`
- Trend percentages: `((current - previous) / previous) * 100`, handle division by zero gracefully
- Branch performance data should be sorted by revenue descending

### Suggested Architecture
- Implement a **Dashboard Service** that orchestrates calls to Branch, Order, Food, and Employee services
- Use **parallel API calls** on the frontend to fetch KPI, charts, and table data simultaneously
- Consider **WebSocket** or **Server-Sent Events** for real-time order count updates (Phase 2)

### Reusable Components
- `<KpiCard>` — Reusable metric card with icon, value, trend, sparkline
- `<DateRangePicker>` — Global date range selector
- `<BranchFilter>` — Multi-select branch dropdown
- `<PeriodToggle>` — Segmented control for Daily/Weekly/Monthly
- `<DataTable>` — Sortable, paginated table (used across all modules)
- `<StatusBadge>` — Color-coded status pill
- `<ChartContainer>` — Wrapper with loading/error states for charts
- `<ExportButton>` — Dropdown button for PDF/CSV export

### State Handling
- Store selected filters (date range, branch, period) in **URL query parameters** for shareable/bookmarkable URLs
- Use global state management (Redux/Vuex/Zustand) for filter state shared across dashboard widgets
- Cache API responses with TTL; invalidate on filter change

### Pagination
- Recent Orders table: Server-side pagination, 20 records per page
- Top Selling Items: Fixed at 10 items, no pagination needed

### Search Optimization
- Global search in topbar should support searching by Order ID, Customer Name, Branch Name
- Implement **debounced search** (300ms delay) to avoid excessive API calls

### Security Considerations
- All dashboard APIs must validate the admin's JWT token and role
- Manager role must only receive data for their assigned branch(es)
- Export endpoints must log audit trail entries
- Rate limit dashboard API calls to prevent abuse (100 requests/minute per user)

---

## 4.12 UI Components Required

| Component | Usage in This Module |
|---|---|
| KPI Card | Revenue, Orders, Branches, Employees summary |
| Line/Area Chart | Revenue trend visualization |
| Doughnut Chart | Order status distribution |
| Horizontal Bar Chart | Branch performance comparison |
| Ranked List | Top selling food items |
| Data Table | Recent orders listing |
| Date Range Picker | Date filtering |
| Multi-select Dropdown | Branch filtering |
| Segmented Control | Period toggle |
| Export Dropdown Button | PDF/CSV export |
| Skeleton Loader | Loading state placeholders |
| Status Badge | Order status indicators |
| Empty State Illustration | No data scenarios |
| Error Banner | API failure alerts |

---

## 4.13 Edge Cases

| Edge Case | Handling |
|---|---|
| No orders exist in the system | Show empty state with illustration; KPI cards show ₹0 / 0 |
| No branches created yet | Show prompt to create first branch |
| All branches are inactive | Show warning: "All branches are currently inactive" |
| Date range returns no data | Show "No data for selected period" message in each widget |
| Single branch selected with no orders | Show zero values, not an error |
| API timeout on one widget | Show error only on affected widget; other widgets render normally |
| Export with no data | Show toast: "No data available to export for the selected filters" |
| Extremely large dataset (1M+ orders) | Use pre-aggregated data; never run raw aggregations on request |
| Timezone differences across branches | All times stored in UTC; displayed in admin's local timezone |
| Currency formatting for large numbers | Use Indian numbering system: ₹12,45,600 (configurable per locale) |

---

## 4.14 Notifications & Toast Messages

| Trigger | Type | Message |
|---|---|---|
| Dashboard loaded successfully | — | No toast (silent success) |
| Export initiated | Info | "Preparing your export..." |
| Export completed | Success | "Report exported successfully" |
| Export failed | Error | "Failed to export report. Please try again." |
| Data refresh | Info | "Dashboard data refreshed" |
| API error (partial) | Warning | "Some dashboard widgets failed to load. Retrying..." |
| API error (full) | Error | "Unable to load dashboard. Please check your connection and try again." |
| No data for filters | Info | "No data found for the selected filters" |

---

# 5. Module 2 — Branch Management

## 1. Overview
### Purpose
The Branch Management module is responsible for the end-to-end lifecycle of restaurant locations (branches). It handles branch creation, updates, status toggling, and menu assignments.

### Business Goal
To allow administrators to seamlessly scale operations by adding new locations, managing their operational details (address, timings, contact), and controlling the availability of specific food items at each location.

### User Flow
1. Admin navigates to the **Branches** section from the sidebar.
2. The Branch Dashboard (List View) displays all branches.
3. Admin clicks **Create Branch** to add a new location or selects an existing branch to view details.
4. From the detail view or list actions, the Admin can **Update**, **Deactivate**, or **Assign Menu** to the branch.

### Main Actions
- View all branches with search, filter, and pagination
- Create Branch
- Update Branch
- Deactivate (Inactive) Branch
- View Branch Details
- Assign Menu (Map food items to a specific branch)

---

## 2. UI/UX Layout Description

### 2.1 Branch Dashboard (List View)
- **Header Section**: Title "Branches" with a primary "Add New Branch" button.
- **Filters/Search**: Search bar for Name/Code; Dropdown filters for Status (Active/Inactive) and City.
- **Data Table**: Columns for Branch Code, Name, City, Manager, Phone, Status, and Actions (View, Edit, More options).
- **Pagination**: Standard bottom-right pagination.

### 2.2 Create / Update Branch Form
- **Layout**: Centered card with a 2-column grid layout for fields.
- **Sections**: Grouped into "Basic Information", "Location Details", and "Operational Details".
- **Buttons**: "Save Branch" (Primary, Bottom-right), "Cancel" (Outline).

### 2.3 View Branch Details
- **Header Section**: Branch Name, Code, and Status Badge.
- **Tabs**: "Overview", "Assigned Menu", "Employees".
- **Overview Content**: Info cards displaying Address, Contact Info, and Operating Hours.
- **Action Buttons**: "Edit Branch", "Deactivate Branch" located at the top right.

### 2.4 Assign Menu Screen / Modal
- **Layout**: Full-screen modal or dedicated page with a dual-list or data table containing checkboxes.
- **Filters**: Category dropdown filter and Search bar for food items.
- **Selection**: "Select All" checkbox.
- **Action**: "Save Menu Assignment" button.

### 2.5 Inactive Branch (Confirmation Modal)
- **Modal Behavior**: Pops up when clicking "Deactivate".
- **Content**: Warning icon with text: "Are you sure you want to deactivate this branch? This will stop all new orders from being placed here."
- **Buttons**: "Deactivate" (Danger Red), "Cancel" (Neutral).

---

## 3. Screen Previews (Text Wireframes)

### 3.1 Branch Dashboard
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

### 3.2 Assign Menu
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

## 4. Screen Fields Table

### Branch Form Fields (Create/Update)
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Branch Code | Text | Yes | Min 3 chars, Alphanumeric, Unique | B001 | Can be auto-generated |
| Branch Name | Text | Yes | Min 3 chars, Max 100 chars | MG Road Branch | |
| Contact Email | Email | Yes | Valid email format | mgroad@roms.com | Used for branch alerts |
| Phone Number | Phone | Yes | Exactly 10 digits | 9876543210 | |
| Address Line 1| Text | Yes | Min 10 chars | 123, Main Street | |
| City | Dropdown | Yes | Must select valid city | Bangalore | Linked to City Master |
| State | Dropdown | Yes | Must select valid state | Karnataka | Linked to State Master|
| Pincode | Text | Yes | 6 digits (India logic) | 560001 | |
| Opening Time | Time | Yes | Valid time | 10:00 AM | |
| Closing Time | Time | Yes | Valid time > Opening | 11:00 PM | |

---

## 5. Validation Rules
- **Branch Code**: Must be strictly unique across the system database. Check uniqueness `onBlur`.
- **Email**: Standard regex validation `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`.
- **Phone Number**: Must contain only numeric characters and be exactly 10 digits long.
- **Time Validation**: `Closing Time` must be logically after `Opening Time`. (e.g., 10:00 AM to 11:00 PM). Handle cross-midnight logic if applicable.
- **Status**: Defaults to Active upon creation. Can only be toggled via the Update or Deactivate action.

---

## 6. Dependencies
| Dependency Type | Details |
|---|---|
| **Module Dependencies** | Relies on **Food Management** for the "Assign Menu" functionality. Relies on **Employee Management** to display branch staff. |
| **Data Dependencies** | State/City master data must be available for address selection. Food items must exist to assign a menu. |
| **API Dependencies** | Relies on Core Branch APIs, Food Master APIs, and Employee mapping APIs. |
| **Workflow Dependencies** | A branch must be created and active before it can process any orders via the Restaurant Portal. |

---

## 7. API Requirement Suggestions

- `GET /api/admin/branches`
  - **Purpose**: Fetch list of branches with pagination, search, and filters.
- `POST /api/admin/branches`
  - **Purpose**: Create a new branch.
  - **Payload**: `{ "code": "B001", "name": "...", "email": "...", "phone": "..." }`
- `GET /api/admin/branches/{id}`
  - **Purpose**: Fetch details of a single branch.
- `PUT /api/admin/branches/{id}`
  - **Purpose**: Update branch details.
- `PATCH /api/admin/branches/{id}/status`
  - **Purpose**: Activate or Inactivate a branch.
  - **Payload**: `{ "status": "Inactive" }`
- `POST /api/admin/branches/{id}/menu`
  - **Purpose**: Assign or update food items available at the branch.
  - **Payload**: `{ "food_item_ids": [1, 2, 5, 8] }`

---

## 8. Database Table Suggestions

### Table: `branches`
| Column Name | Type | Keys/Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary Key | |
| `code` | VARCHAR(20) | Unique, Not Null | Indexed for search |
| `name` | VARCHAR(100) | Not Null | |
| `email` | VARCHAR(100) | Not Null | |
| `phone` | VARCHAR(15) | Not Null | |
| `address` | TEXT | Not Null | |
| `city` | VARCHAR(50) | Not Null | |
| `state` | VARCHAR(50) | Not Null | |
| `pincode` | VARCHAR(10) | Not Null | |
| `open_time` | TIME | Not Null | |
| `close_time` | TIME | Not Null | |
| `status` | ENUM | Not Null | 'Active', 'Inactive' |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

### Table: `branch_menus` (Mapping Table)
| Column Name | Type | Keys/Constraints | Notes |
|---|---|---|---|
| `branch_id` | UUID | PK, FK | References `branches.id` |
| `food_item_id` | UUID | PK, FK | References `food_items.id` |
| `is_available` | BOOLEAN | | Default TRUE; handles daily stock-outs |

---

## 9. Role & Permission Logic
| Role | Permissions |
|---|---|
| **Super Admin** | Full access (Create, View, Update, Deactivate, Assign Menu). |
| **Admin** | Full access. |
| **Manager** | Read-only access to their assigned branch details. Cannot create, update, deactivate branches, or assign menus. |

---

## 10. Development Notes
- **Backend Validation**: Ensure branch code uniqueness at the database level (Unique Constraint) and service level.
- **Assign Menu Logic**: When updating the assigned menu, use a transaction. The standard approach is to delete all existing mappings for the branch and insert the new array, or carefully diff the arrays to insert/delete mapping rows.
- **Soft Delete/Inactive**: Do not permanently drop branch rows, as this breaks historical order and revenue data. Use the `status = 'Inactive'` flag (Soft Delete logic).
- **Pagination**: Implement cursor-based or offset-based server-side pagination for the branch list to ensure scalability.

---

## 11. UI Components Required
- `<DataTable>`: Resizable columns, sortable headers, integrated pagination.
- `<FormInput>`, `<FormSelect>`, `<TimePicker>`: Standardized form controls with error state handling.
- `<CheckboxGroup>` / `<DualListBox>`: For Assign Menu functionality.
- `<ConfirmationModal>`: For critical actions like deactivating a branch.
- `<StatusBadge>`: Reusable component mapping status strings to colors.

---

## 12. Edge Cases
- **Duplicate Branch Code**: Handled gracefully with inline form error.
- **Deactivating an Active Branch with Ongoing Orders**: If a branch is set to inactive while orders are processing, the API should either reject the action or allow it but flag the branch to not receive *new* orders while finishing current ones.
- **Zero Food Items Assigned**: A newly created branch with no menu assigned should display a prominent warning banner in the Detail View.
- **Search Term Yields No Results**: Show standard empty state graphic.

---

## 13. Notifications & Toast Messages
| Trigger | Message | Type |
|---|---|---|
| Branch created | "Branch '[Branch Name]' has been created successfully." | Success |
| Branch updated | "Branch details updated successfully." | Success |
| Menu assigned | "Menu assignment for '[Branch Name]' updated." | Success |
| Branch deactivated | "Branch deactivated. It will no longer accept new orders." | Warning |
| Code duplication | "Branch code already exists. Please choose a unique code." | Error |
| Active orders warning | "Cannot deactivate branch. There are 5 ongoing orders." | Error |

---

## 14. Suggested Tech Notes
- **Frontend Optimization**: Use debouncing (300ms) on the Branch Search input and Assign Menu Search input to prevent rapid API calls.
- **Form Management**: Utilize libraries like `react-hook-form` paired with `yup` or `zod` for robust client-side validation schemas.
- **Caching**: The list of Active Branches is frequently accessed by other modules (e.g., Dashboard). Consider caching this endpoint via Redis or client-side React Query/SWR.

---

# 6. Module 3 — Employee Management

## 1. Overview
### Purpose
Manage all staff profiles including managers, kitchen staff, and delivery personnel. Assign them to specific branches with proper role-based access.

### Business Goal
To streamline workforce management, ensuring branches are properly staffed and access control is tightly integrated with operational roles.

### User Flow
1. Admin navigates to the **Employees** section.
2. The Dashboard displays the Employee List Table.
3. Admin clicks **Create Employee** to onboard a new staff member.
4. Admin can **Update Employee** details or mark them as **Inactive** if they leave the organization.

### Main Actions
- View employee list (Dashboard)
- Create new employee profile
- Update existing employee details
- Deactivate (Inactive) employee access

---

## 2. UI/UX Layout Description

### 2.1 Dashboard (Employee List Table)
- **Header Section**: "Employees" title and primary "+ Add Employee" button.
- **Filters/Search**: Search by Name, Email, or Phone. Dropdowns for Role (Manager, Kitchen Staff, Delivery) and Branch assignment.
- **Data Table**: Columns for Employee ID, Name, Role, Assigned Branch, Contact Info, Status (Active/Inactive), and Actions.
- **Pagination**: Included at the bottom.

### 2.2 Create / Update Employee Form
- **Layout**: Simple 2-column form structure inside a white card layout.
- **Sections**: "Personal Details", "Authentication", "Employment Details".
- **Buttons**: "Save Employee" (Primary), "Cancel" (Outline).

### 2.3 Inactive Employee (Confirmation)
- **Modal Behavior**: Pops up when Admin clicks "Deactivate".
- **Content**: Warning: "Deactivating this employee will immediately revoke their access to all portals."
- **Buttons**: "Deactivate" (Danger Red), "Cancel".

---

## 3. Screen Previews (Text Wireframes)

### 3.1 Employee Dashboard
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

### 3.2 Create Employee Form
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
│  Authentication                                             │
│  [ Password          ]  [ Confirm Password  ]               │
│                                                             │
│                                      [Cancel] [Save Profile]│
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Screen Fields Table

### Employee Form Fields
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| First Name | Text | Yes | Min 2 chars | John | |
| Last Name | Text | Yes | Min 2 chars | Doe | |
| Email Address | Email | Yes | Valid format, Unique | john@roms.com | Used as login username |
| Phone Number | Phone | Yes | 10 digits | 9876543210 | |
| Role | Dropdown | Yes | Valid Role Enum | Manager | E.g. Admin, Manager, Kitchen, Delivery |
| Assign Branch | Dropdown | Yes*| Valid Branch ID | MG Road | Required unless role is Admin/Super Admin |
| Date of Joining| Date | Yes | Valid Date | 2026-05-26 | Default to Today |
| Password | Password | Yes*| Min 8 chars, 1 Special, 1 Num | ******** | Only required on Create |

---

## 5. Validation Rules
- **Email Uniqueness**: Email must be unique across the entire users table.
- **Phone Validation**: Only digits, exactly 10 length.
- **Branch Assignment**: If Role = "Manager" or "Kitchen Staff", assigning a branch is strictly required. If Role = "Admin", branch might be left blank (Global access).
- **Password Strength**: Minimum 8 characters containing at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.

---

## 6. Dependencies
| Dependency Type | Details |
|---|---|
| **Module Dependencies** | Depends on Branch Management (to assign employees to branches). |
| **Data Dependencies** | Active Branch list must be loaded for the "Assign Branch" dropdown. |
| **API Dependencies** | Auth/User Service for credential creation and role assignment. |

---

## 7. API Requirement Suggestions

- `GET /api/admin/employees` (Fetch list with pagination & filters)
- `POST /api/admin/employees` (Create employee)
- `GET /api/admin/employees/{id}` (View employee)
- `PUT /api/admin/employees/{id}` (Update employee details)
- `PATCH /api/admin/employees/{id}/status` (Toggle Active/Inactive state)

---

## 8. Database Table Suggestions

### Table: `employees` (or `users`)
| Column Name | Type | Keys/Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary Key | |
| `emp_id` | VARCHAR(20) | Unique | Auto-generated (e.g. E101) |
| `first_name` | VARCHAR(50) | Not Null | |
| `last_name` | VARCHAR(50) | Not Null | |
| `email` | VARCHAR(100) | Unique, Not Null | |
| `phone` | VARCHAR(15) | Not Null | |
| `password_hash` | VARCHAR(255) | Not Null | Hashed securely (bcrypt/argon2) |
| `role` | ENUM | Not Null | 'Admin', 'Manager', 'Kitchen', 'Delivery' |
| `branch_id` | UUID | FK | References `branches.id`. Nullable for Admins. |
| `date_of_joining`| DATE | Not Null | |
| `status` | ENUM | Not Null | 'Active', 'Inactive' |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

---

## 9. Role & Permission Logic
| Role | Permissions |
|---|---|
| **Super Admin** | Can manage all employee profiles globally. |
| **Admin** | Can manage all employee profiles globally. |
| **Manager** | Read-only view of employees assigned to their own branch. Cannot edit roles or passwords. |

---

## 10. Development Notes
- **Authentication Handling**: Never return password hashes in the API response. Passwords should be handled solely by the Auth Service.
- **Soft Deletion**: Employees are marked as 'Inactive' rather than being deleted, preserving audit logs (e.g., who created a specific order).
- **Session Revocation**: When an employee is marked Inactive, the backend must immediately invalidate/revoke all their active JWT sessions.

---

## 11. UI Components Required
- `<DataTable>`: Standard list view.
- `<FormPassword>`: Input with visibility toggle (Eye icon).
- `<FormSelect>`: Dropdowns for Roles and Branches.
- `<StatusBadge>`: Active/Inactive markers.
- `<ConfirmationModal>`: For deactivation warnings.

---

## 12. Edge Cases
- **Deleted Employee Login Attempt**: Returning specific error "Account is deactivated. Contact Administrator."
- **Assigning to Inactive Branch**: Form should either exclude inactive branches from the dropdown, or show a warning if an employee is assigned to one.
- **Email Update**: If an email is updated, trigger a verification flow (optional/future phase) or force immediate re-login.

---

## 13. Notifications & Toast Messages
| Trigger | Message | Type |
|---|---|---|
| Employee created | "Employee John Doe onboarded successfully." | Success |
| Employee updated | "Employee details updated successfully." | Success |
| Employee deactivated | "Employee access revoked successfully." | Warning |
| Duplicate email | "An account with this email already exists." | Error |

---

## 14. Suggested Tech Notes
- Utilize `bcrypt` (factor 10 or 12) for password hashing in the backend.
- Role-based UI rendering: Hide the "Assign Branch" field dynamically if the "Admin" or "Super Admin" role is selected in the dropdown.

---

# 7. Module 4 — Order Report

## 1. Overview
### Purpose
Provides comprehensive visibility into all historical and active orders across branches. It acts as the primary tool for auditing order accuracy, handling disputes, and analyzing daily performance.

### Business Goal
To ensure administrators can easily trace any order, check its status, view its items, and reconcile payments seamlessly.

### User Flow
1. Admin opens the **Order Report** module.
2. The default screen is a **Calendar View**, showing a high-level summary of total orders per day.
3. Admin clicks a specific date on the calendar.
4. The system navigates to the **Order List**, filtered for that specific date.
5. Admin clicks an order from the list to open the **Order Detail View**.

### Main Actions
- Browse order history via Calendar.
- View filtered list of orders for a specific day.
- Drill down into specific Order Details (items, totals, customer info, delivery info).

---

## 2. UI/UX Layout Description

### 2.1 Calendar View (Default Screen)
- **Header Section**: Title "Order Reports" with a Month/Year selector (e.g., "May 2026").
- **Calendar Grid**: Standard 7-column grid (Sun-Sat).
- **Day Cells**: Each cell shows the date and a mini-metric (e.g., "Orders: 420 | Rev: ₹1.2L").
- **Empty States**: Future dates are disabled/greyed out.

### 2.2 Order List Screen
- **Header Section**: Breadcrumb (Reports > May 26, 2026). Filters for Branch, Status, and Payment Type.
- **Search**: Global search by Order ID or Customer Phone.
- **Data Table**: Columns: Order ID, Branch, Customer, Time, Items Qty, Total Amount, Payment Mode, Status, Action (View).
- **Export**: Button to export the displayed list as CSV.

### 2.3 Order Detail View
- **Layout**: 2-column layout (Left: 70%, Right: 30%).
- **Left Column**:
  - Customer Information Card.
  - Order Items Table (Item name, Unit price, Qty, Total).
  - Bill Breakdown Card (Subtotal, Taxes, Delivery Fee, Discount, Grand Total).
- **Right Column**:
  - Order Timeline (Vertical stepper: Placed → Processing → Out for Delivery → Delivered).
  - Delivery Executive Info Card (If applicable).

---

## 3. Screen Previews (Text Wireframes)

### 3.1 Calendar View
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

### 3.2 Order List
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

### 3.3 Order Detail View
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

## 4. Screen Fields Table

### Order Detail Fields (Read-Only)
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Order ID | Text | Yes | - | #ORD-101 | Alphanumeric |
| Customer Name | Text | Yes | - | John Doe | |
| Customer Phone | Phone | Yes | - | 9876543210 | |
| Delivery Address| Text | Yes*| - | 123 Main St | Null if Dine-in/Pickup |
| Item Name | Text | Yes | - | Chicken Pizza | |
| Quantity | Number | Yes | - | 2 | |
| Item Price | Currency| Yes | - | ₹250 | |
| Subtotal | Currency| Yes | - | ₹500 | |
| Tax Amount | Currency| Yes | - | ₹25 | |
| Grand Total | Currency| Yes | - | ₹525 | |
| Payment Status | Text | Yes | - | Paid | Paid, Pending, Failed |

---

## 5. Validation Rules
- **Date Constraints**: Users cannot click on future dates in the Calendar View.
- **Data Integrity**: Orders cannot be modified from the Admin portal; they are strictly read-only.
- **Refund Logic**: (If applicable) Refunding a cancelled order must ensure the amount does not exceed the Grand Total.

---

## 6. Dependencies
| Dependency Type | Details |
|---|---|
| **Module Dependencies** | Relies on Restaurant Portal/Customer App for order generation. |
| **Data Dependencies** | Relies on Food Management (for item names) and Branch Management (for branch names). |
| **API Dependencies** | Heavy reliance on the Orders microservice for historical data. |

---

## 7. API Requirement Suggestions

- `GET /api/admin/reports/calendar?month=05&year=2026` (Fetch daily order counts for calendar generation)
- `GET /api/admin/orders` (Fetch paginated orders, filter by `date=2026-05-05`)
- `GET /api/admin/orders/{id}` (Fetch deep details of a specific order including items and timeline)

---

## 8. Database Table Suggestions

### Table: `orders`
| Column Name | Type | Keys/Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary Key | |
| `order_number` | VARCHAR(20) | Unique | e.g. ORD-101 |
| `branch_id` | UUID | FK | |
| `customer_id` | UUID | FK | |
| `total_amount` | DECIMAL(10,2)| Not Null | |
| `tax_amount` | DECIMAL(10,2)| Not Null | |
| `status` | ENUM | Not Null | Pending, Processing, Out, Delivered, Cancelled |
| `payment_status`| ENUM | Not Null | Paid, Pending, Failed |
| `created_at` | TIMESTAMP | Not Null | Indexed for date filtering |

### Table: `order_items`
| Column Name | Type | Keys/Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary Key | |
| `order_id` | UUID | FK | |
| `food_item_id` | UUID | FK | |
| `quantity` | INT | Not Null | |
| `unit_price` | DECIMAL(10,2)| Not Null | Captured at time of order |

---

## 9. Role & Permission Logic
| Role | Permissions |
|---|---|
| **Super Admin** | Can view all orders across all branches. |
| **Admin** | Can view all orders across all branches. |
| **Manager** | Can only view the Calendar and Orders for their assigned branch. |

---

## 10. Development Notes
- **Pagination Strategy**: The order list must be server-side paginated. Searching through millions of historical orders requires proper indexing on `created_at`, `branch_id`, and `order_number`.
- **Archiving**: Consider moving orders older than 6 months to cold storage or an archiving table to maintain query speed on the active `orders` table.
- **Read Replicas**: Route these report queries to a database Read Replica so complex filtering doesn't impact write performance during peak ordering hours.

---

## 11. UI Components Required
- `<CalendarPicker>`: Custom calendar component capable of rendering sub-text (metrics) inside day cells.
- `<VerticalStepper>`: For visual representation of the order timeline.
- `<DataTable>`: Reusable list component.
- `<ExportDropdown>`: For CSV/PDF report generation.

---

## 12. Edge Cases
- **Missing Data**: An order where the assigned delivery boy is deleted. The UI must handle null relationships gracefully (e.g., "Agent: Unassigned or Deleted").
- **Missing Customer Address**: For takeaway orders, hide the address card entirely.
- **API Timeout**: Large date ranges might time out. Limit CSV exports to 31-day windows.

---

## 13. Notifications & Toast Messages
| Trigger | Message | Type |
|---|---|---|
| Export CSV triggered | "Generating your report, please wait..." | Info |
| Export CSV success | "Order report downloaded successfully." | Success |
| Order Detail API fail| "Failed to load order details. Retrying..." | Error |

---

## 14. Suggested Tech Notes
- Use `date-fns` or `dayjs` on the frontend for timezone-safe calendar rendering.
- For the Calendar API, return a hashmap of `{ "YYYY-MM-DD": { count, revenue } }` rather than an array, for O(1) rendering lookups on the frontend.

---

# 8. Module 5 — Food Management

## 1. Overview
### Purpose
Act as the central master repository for all food items. Admins can create, categorize, and price items here before assigning them to specific branches.

### Business Goal
Maintain a unified, standardized menu catalog across the entire restaurant chain to ensure pricing consistency, accurate descriptions, and high-quality imagery.

### User Flow
1. Admin opens **Food Management**.
2. Views the master list of all food items.
3. Clicks **Create Food Item** to add a new dish (with image upload).
4. Assigns categories (e.g., Starters, Main Course) and dietary tags (Veg/Non-Veg).
5. Edits or Deactivates items. Deactivating here removes it globally from all branches.

### Main Actions
- View Food Catalog (Dashboard)
- Create Food Item (with Image)
- Update Food Item
- View Food Item Details
- Deactivate (Inactive) Food Item

---

## 2. UI/UX Layout Description

### 2.1 Dashboard (Food Item Table)
- **Header Section**: Title "Food Catalog" and "+ Add Food Item" button.
- **Filters/Search**: Search by Name. Dropdowns for Category and Dietary Preference (Veg/Non-Veg/Vegan).
- **Data Table**: Image Thumbnail, Item Code, Name, Category, Price, Dietary Tag, Status, Actions.
- **View Toggle**: Ability to toggle between List View (Data Table) and Grid View (Card layout).

### 2.2 Create / Update Food Item
- **Layout**: 2-column layout.
- **Left Column**: Form fields (Name, Category, Description, Price, Dietary Tag).
- **Right Column**: Drag-and-drop Image Uploader component with a preview window.
- **Buttons**: "Save Item", "Cancel".

### 2.3 View Food Item
- **Layout**: Modal or Drawer sliding from the right.
- **Content**: Large image banner at the top. Below it, the Title, Price, Description, and a list of branches this item is currently assigned to.

### 2.4 Inactive Food Item (Confirmation)
- **Modal Behavior**: Standard warning modal.
- **Content**: "Warning: Deactivating this item will immediately hide it from all assigned branches. Proceed?"

---

## 3. Screen Previews (Text Wireframes)

### 3.1 Food Dashboard (Grid View Example)
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

### 3.2 Create Food Item
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

## 4. Screen Fields Table

### Food Item Fields
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Item Name | Text | Yes | Max 100 chars | Veg Supreme Pizza | |
| Category | Dropdown | Yes | Valid ID | Pizza | Fetched from Categories table |
| Dietary Type | Dropdown | Yes | Enum | Veg | Veg, Non-Veg, Egg, Vegan |
| Base Price | Currency | Yes | > 0 | ₹450 | Cannot be negative |
| Description | Text Area| No | Max 500 chars | Delicious cheese pizza..| |
| Item Image | File | Yes*| JPG/PNG, < 2MB | pizza.jpg | Required on create |

---

## 5. Validation Rules
- **Price**: Cannot be a negative number or zero.
- **Image**: Must strictly be JPEG, JPG, or PNG. Maximum size limit of 2MB to ensure fast loading on the customer app.
- **Name**: Must be unique to prevent confusion (e.g., cannot have two items named exactly "Coke").

---

## 6. Dependencies
| Dependency Type | Details |
|---|---|
| **Module Dependencies** | Branch Management (Assign Menu relies on this module). |
| **Data Dependencies** | Relies on Master Categories (e.g., Starters, Main Course). |
| **API Dependencies** | Image storage service (AWS S3, Cloudinary). |

---

## 7. API Requirement Suggestions

- `GET /api/admin/food-items` (Fetch catalog with filters)
- `POST /api/admin/food-items` (Create new item, requires `multipart/form-data` for image)
- `PUT /api/admin/food-items/{id}` (Update text details)
- `PUT /api/admin/food-items/{id}/image` (Update image only)
- `PATCH /api/admin/food-items/{id}/status` (Activate/Deactivate)

---

## 8. Database Table Suggestions

### Table: `food_items`
| Column Name | Type | Keys/Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary Key | |
| `name` | VARCHAR(100) | Unique, Not Null | |
| `category_id` | UUID | FK | References `categories.id` |
| `description` | TEXT | | |
| `price` | DECIMAL(8,2) | Not Null, > 0 | |
| `dietary_type`| ENUM | Not Null | 'Veg', 'Non-Veg', 'Egg', 'Vegan' |
| `image_url` | VARCHAR(255) | | CDN link |
| `status` | ENUM | Not Null | 'Active', 'Inactive' |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

---

## 9. Role & Permission Logic
| Role | Permissions |
|---|---|
| **Super Admin** | Full access to manage catalog. |
| **Admin** | Full access to manage catalog. |
| **Manager** | Read-only access to view what items exist. Cannot edit or create. |

---

## 10. Development Notes
- **Image Uploads**: Upload images directly to S3/Cloudinary using pre-signed URLs from the frontend, or pass through the backend. Save the resulting CDN URL in the database.
- **Global Inactive State**: If a food item is marked Inactive globally, it must automatically filter out of all Customer App menus, regardless of branch mappings.

---

## 11. UI Components Required
- `<ImageUploader>`: Drag-and-drop zone with preview and size validation.
- `<ToggleSwitch>`: For list/grid view toggle.
- `<TextArea>`: For descriptions.
- `<Drawer>`: For slide-out View Details screen.

---

## 12. Edge Cases
- **Image Upload Failure**: Handle timeouts gracefully with a "Retry Upload" state.
- **Price Change Impact**: Changing a price affects *future* orders, but must not alter historical data in the `order_items` table (which is why `order_items` stores `unit_price` at the time of purchase).

---

## 13. Notifications & Toast Messages
| Trigger | Message | Type |
|---|---|---|
| Item Created | "Veg Burger added to the catalog." | Success |
| Image too large | "Image exceeds 2MB limit. Please compress and retry." | Error |
| Invalid File type| "Only JPG/PNG files are allowed." | Error |

---

## 14. Suggested Tech Notes
- Use `react-dropzone` for the image upload component.
- Implement progressive image loading (`loading="lazy"`) in the grid view to improve performance when scrolling through hundreds of items.

---

# 9. Global Database Schema (Summary)

For a holistic view, here are the core relationships:
- `users` (1:N) `branches`
- `branches` (M:N) `food_items` (via `branch_menus`)
- `orders` (N:1) `branches`
- `order_items` (N:1) `orders`
- `order_items` (N:1) `food_items`

# 10. Global Role & Permission Matrix

| Module | Super Admin | Admin | Manager |
|---|:---:|:---:|:---:|
| **Dashboard / Analytics** | All | All | Branch Only |
| **Branch Management** | Full Access | Full Access | View Branch Only |
| **Employee Management**| Full Access | Full Access | View Branch Only |
| **Order Reports** | Full Access | Full Access | View Branch Only |
| **Food Management** | Full Access | Full Access | Read Only |

# 11. Appendix — Reusable UI Components Library

For UI/UX consistency across the portal, developers must implement the following atomic components:
1. **Button**: Variants (Primary, Secondary, Outline, Danger, Ghost).
2. **InputGroup**: Wraps inputs with Labels and inline Error messages.
3. **DataTable**: Generic table accepting `columns` and `data` props, with built-in sorting/pagination.
4. **StatusBadge**: Generic badge component taking `status` string and mapping to appropriate Tailwind colors.
5. **Modal/Dialog**: Wrapper for confirmation alerts and popups.

# 12. Appendix — Notification & Toast Messages Catalog

- **Placement**: Top-Right corner.
- **Animation**: Slide-in right, slide-out right.
- **Timeout**: Auto-dismiss after 4000ms.
- **Actionable**: Allow manual "X" close.

# 13. Appendix — Suggested Tech Notes

### Suggested Tech Stack
- **Frontend**: React.js (Next.js or Vite) / Vue.js
- **Styling**: Tailwind CSS for rapid, scalable UI development.
- **State Management**: Redux Toolkit or Zustand (React) / Pinia (Vue).
- **Data Fetching**: React Query (TanStack Query) / SWR for intelligent caching and re-fetching.
- **Backend API**: Node.js / Python / Go.
- **Database**: PostgreSQL (highly recommended for relational complexity).

### Final Handover Checklist
- [ ] Ensure all forms use schema-based validation (Zod/Yup).
- [ ] Ensure API endpoints validate JWT tokens and Roles.
- [ ] Ensure UUIDs are used for primary keys to prevent enumeration attacks.
- [ ] Ensure timezone configurations are standardized to UTC in the backend.

***End of Document***
