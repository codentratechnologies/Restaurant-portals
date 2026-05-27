# DineOS — Customer Mobile Application

## Product Requirement Document (PRD) + UI/UX Specification + Developer Handover Document

| Document Property | Value |
|---|---|
| **Product Name** | DineOS Restaurant Order Management System |
| **Portal / Client** | Customer App (Mobile - iOS & Android) |
| **Version** | 1.0.0 |
| **Status** | Draft for Review |
| **Last Updated** | 2026-05-27 |
| **Audience** | Frontend/Mobile Engineers, Backend Engineers, UI/UX Designers, Product Managers, QA Engineers |

---

## Table of Contents
1. [Executive Summary & Global Standards](#executive-summary--global-standards)
2. [Module 1 — Signup Screen](#module-1--signup-screen)
3. [Module 2 — Login Screen](#module-2--login-screen)
4. [Module 3 — Home Screen](#module-3--home-screen)
5. [Module 4 — Food Detail Screen](#module-4--food-detail-screen)
6. [Module 5 — Add to Cart Screen](#module-5--add-to-cart-screen)
7. [Module 6 — Order Status & Delivery Tracking Screen](#module-6--order-status--delivery-tracking-screen)
8. [Module 7 — Profile Screen](#module-7--profile-screen)

---

## Executive Summary & Global Standards

### Project Goals
**DineOS Customer App** is a native-feel cross-platform mobile application designed to provide a premium, friction-free food ordering experience. The app interfaces dynamically with the DineOS branch-level Restaurant Portal, the Delivery Partner App, and central admin systems to facilitate real-time tracking, seamless cart customizations, instant payment options, and automated multi-branch routing.

### Global Design Tokens
*   **Primary Accent**: `#E11D48` (Rose 600) — Main CTAs, selection states, active indicators.
*   **Secondary Accent**: `#EA580C` (Orange 600) — Highlights, category badges, secondary actions.
*   **Success Tone**: `#10B981` (Emerald 500) — Successful payments, order delivered, veg food badge.
*   **Warning Tone**: `#F59E0B` (Amber 500) — Preparing food, refund initiated, pending confirmations.
*   **Danger Tone**: `#EF4444` (Red 500) — Rejections, cancellation buttons, non-veg badge.
*   **Neutral Backgrounds**:
    *   *Light Mode*: `#FAFAFA` (Zinc 50) app backdrop, `#FFFFFF` cards/sheets.
    *   *Dark Mode*: `#09090B` (Zinc 950) app backdrop, `#18181B` (Zinc 900) cards/sheets.
*   **Typography**: `Outfit` for headers and headlines, `Inter` for functional data, body paragraphs, and forms.

---

## Module 1 — Signup Screen

### 1. Overview
*   **Purpose**: Register new users into the DineOS ecosystem.
*   **Business Goal**: Maximize user conversion rates by offering both secure manual signup and low-friction Google Social Sign-in, followed by instant security validation.
*   **User Workflow**: User opens the app ➔ Selects Signup ➔ Fills details or selects Google ➔ Receives and verifies 6-digit OTP ➔ Setups session.
*   **Main Actions**: Manual Submit, Google Auth Trigger, OTP Validation, Resend OTP.

### 2. UI/UX Layout Description
*   **Header**: Brand logo (DineOS) centered, with a clean back navigation arrow top-left if navigated from Login.
*   **Forms**: Inset text fields with floating labels, inline status checks (tick/cross), and clear password toggles (show/hide eye icon).
*   **Buttons**: Rose-colored primary CTA block button ("Create Account"), Google secondary button.
*   **Modals**: Slide-up Bottom Sheet for OTP verification containing 6 numeric fields, a countdown timer, and a disabled "Resend OTP" label that activates after 120 seconds.
*   **Empty / Error States**: Fields highlight red with inline message cards underneath.
*   **Loading States**: The submit button transforms into a spinning loading ring, locking all fields during API request.
*   **Responsive Behavior**: Scrollable viewport preventing keyboard overlays.

### 3. Screen Preview (Text Wireframe)
```text
┌──────────────────────────────────────────┐
│  [<-]                                    │
│                 DineOS                   │
│          Create Your Account             │
│                                          │
│   Full Name                              │
│   [ Amit Kumar                       ]   │
│                                          │
│   Mobile Number                          │
│   [ +91 9876543210                   ]   │
│                                          │
│   Email Address                          │
│   [ amit.kumar@example.com           ]   │
│                                          │
│   Gender                                 │
│   (●) Male     ( ) Female    ( ) Other   │
│                                          │
│   Password                               │
│   [ **********                     [o] ] │
│                                          │
│   [          CREATE ACCOUNT            ] │
│                                          │
│   --------------- OR ---------------     │
│                                          │
│   [        Sign up with Google         ] │
│                                          │
│   Already have an account? Log In        │
└──────────────────────────────────────────┘
```

### 4. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Full Name | Text | Yes | Min 3, max 50 chars, alphabets and spaces only | `Amit Kumar` | Split into first/last in DB |
| Mobile Number | Phone | Yes | E.164 format, exactly 10 digits for local validation | `9876543210` | Unique system key |
| Email Address | Email | Yes | Valid RFC 5322 regex string | `amit.kumar@example.com` | Unique system key |
| Gender | Radio | Yes | Must be 'Male', 'Female', or 'Other' | `Male` | Used for profile metadata |
| Password | Password | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special | `SecurePass1!` | Hashed using bcrypt/argon2 |

### 5. Validation Rules
*   **Mobile Uniqueness**: Pre-flight API check triggers when focus shifts from phone input field.
*   **Password Complexity**: Dynamic indicator bars change color (Red -> Yellow -> Green) as requirements are met.
*   **OTP Timer**: 120 seconds countdown. Blocks "Resend OTP" action until elapsed.

### 6. Dependencies
*   **Notification Service**: SMS gateway integration (e.g., Twilio) to deliver OTP instantly.
*   **Google Auth Client SDK**: Google Sign-In SDK configuration for iOS/Android client-side token acquisition.

### 7. API Requirement Suggestions
*   **POST** `/api/v1/customer/auth/pre-signup`
    *   *Payload*: `{"phone": "+919876543210", "email": "amit.kumar@example.com"}`
    *   *Response*: `{"status": "success", "otp_session_id": "otp_882910398"}`
*   **POST** `/api/v1/customer/auth/signup/verify`
    *   *Payload*: `{"otp_session_id": "otp_882910398", "otp_code": "482019", "name": "Amit Kumar", "gender": "Male", "password": "hashed_string"}`
    *   *Response*: `{"status": "success", "token": "jwt_access_token", "refresh_token": "jwt_refresh_token"}`

### 8. Database Table Suggestions
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9. Role & Permission Logic
*   **Guest Mode**: Allowed to view menu items, filter foods, but restricted from calling checkout APIs.
*   **Registered Customer**: full access to profile, cart, payment, and orders tracking.

### 10. Development Notes
*   **State Management**: Store JWT securely in native keychain/Keystore. Maintain logged-in status state globally.
*   **Autofill**: Support iOS Keychain autofill and Android Credential Manager integration.

### 11. UI Components Required
*   Custom Form Input text field wrapper, block button component, OTP bottom sheet modal.

### 12. Edge Cases
*   **Delayed SMS Gateway**: Support fallback email verification if OTP SMS is not delivered in 180 seconds.
*   **App Backgrounded during OTP**: Save OTP session state in local storage to prevent session loss if app restarts.

### 13. Notifications & Toast Messages
*   *Success*: "Account created successfully!"
*   *Error*: "Mobile number already registered." / "Incorrect OTP. Please try again."

### 14. Real-Time Event Flow
*   OTP verification pushes user logging parameters to Analytics service via background dispatchers.

### 15. Status Management System
| Status | Color | Description | Next Status |
|---|---|---|---|
| `Unverified` | Grey | Input stage | `Verifying` |
| `Verifying` | Yellow | OTP sent, checking inputs | `Verified` or `Failed` |
| `Verified` | Green | Authorized | `Active Session` |

### 16. Payment Flow
*   *Not applicable to this screen.*

### 17. Address Management Flow
*   *Not applicable to this screen.*

### 18. Suggested Tech Notes
*   **Secure Storage**: Keychain (iOS) and Shared Preferences with MasterKey cryptography (Android).

---

## Module 2 — Login Screen

### 1. Overview
*   **Purpose**: Authenticate returning users securely.
*   **Business Goal**: Enable instant entry to drive repeat sales, reducing abandoned carts by maintaining long-lived active login sessions.
*   **User Workflow**: Open App ➔ Enter Mobile/Email/Username ➔ Enter Password ➔ Submit ➔ Authenticate.
*   **Main Actions**: Credentials Submit, Google Sign In, Forgot Password (trigger reset OTP).

### 2. UI/UX Layout Description
*   **Header**: Elegant brand tagline under DineOS logo.
*   **Forms**: Username/Email/Phone single field (auto-detects type), password field with clear action link text ("Forgot Password?") positioned right-aligned above it.
*   **Buttons**: Rose-colored primary CTA block button ("Login"), Google Icon Login.
*   **State Settings**: "Remember Me" checkbox using a smooth toggle switch component.
*   **Error Indicators**: Red form outlines with micro-animations (shake effect on failed logins).

### 3. Screen Preview (Text Wireframe)
```text
┌──────────────────────────────────────────┐
│                 DineOS                   │
│             Welcome Back!                │
│                                          │
│   Email, Username, or Phone              │
│   [ amit.kumar@example.com           ]   │
│                                          │
│   Password             [Forgot Password?]│
│   [ **********                     [o] ]   │
│                                          │
│   [x] Remember Me                        │
│                                          │
│   [             SIGN IN                ] │
│                                          │
│   --------------- OR ---------------     │
│                                          │
│   [        Sign in with Google         ] │
│                                          │
│   Don't have an account? Sign Up         │
└──────────────────────────────────────────┘
```

### 4. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Identifier | Text | Yes | Alphanumeric, email validation or 10-digit check | `amit.kumar@example.com` | Accepts Phone, Email, or Username |
| Password | Password | Yes | Minimum 1 character | `SecurePass1!` | Standard credential check |
| Remember Me | Toggle | No | Boolean | `true` | Extends refresh token expiry |

### 5. Validation Rules
*   **Detection**: JS-based auto-detection to verify if identifier matches standard email syntax or telephone digits.

### 6. Dependencies
*   **Token Service**: Backend identity provider to validate password matching and generate signed JSON Web Tokens.

### 7. API Requirement Suggestions
*   **POST** `/api/v1/customer/auth/login`
    *   *Payload*: `{"identifier": "amit.kumar@example.com", "password": "plain_password"}`
    *   *Response*: `{"status": "success", "token": "jwt_access_token", "refresh_token": "jwt_refresh_token", "user": {"id": "uuid", "name": "Amit Kumar"}}`

### 8. Database Table Suggestions
```sql
CREATE TABLE customer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    device_info VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9. Role & Permission Logic
*   Logs user in as a verified `Customer` role.

### 10. Development Notes
*   Implement JWT expiration interceptors. When a request returns `401 Unauthorized`, invoke the refresh token rotation endpoints in the background before retrying original API query.

### 11. UI Components Required
*   Dynamic text input, password text box with eye toggle, social identity buttons.

### 12. Edge Cases
*   **Session Hijacking**: Revoke all active sessions of a customer if a token refresh is requested with an expired or compromised refresh token.

### 13. Notifications & Toast Messages
*   *Error*: "Invalid credentials. Please verify username and password."

### 14. Real-Time Event Flow
*   On login, register the FCM Push Token via WebSocket/API call to associate notifications with the current device.

### 15. Status Management System
| Status | Color | Description | Next Status |
|---|---|---|---|
| `Unauthenticated` | Red | Access restricted | `Authenticating` |
| `Authenticating` | Yellow | Querying credentials | `Authenticated` |
| `Authenticated` | Green | Access granted | `Active Session` |

### 16. Payment Flow
*   *Not applicable to this screen.*

### 17. Address Management Flow
*   *Not applicable to this screen.*

### 18. Suggested Tech Notes
*   Biometric credentials integration (FaceID / Fingerprint) can bypass password inputs on returning customer flows.

---

## Module 3 — Home Screen

### 1. Overview
*   **Purpose**: Display available branches, categories, food items, promotions, and nearest delivery points based on location.
*   **Business Goal**: Drive immediate food discovery, boost average order value (AOV) via promotional banners, and provide a path to checking out via a floating cart button.
*   **User Workflow**: User opens app ➔ GPS checks nearest branch ➔ Lists menu items ➔ Filter/Search ➔ Add to cart.
*   **Main Actions**: Change Delivery Location, Filter Categories, Search Menu, Carousel Banner Click, Floating Cart Open.

### 2. UI/UX Layout Description
*   **Header**: High-profile location widget at top with dropdown icon. Profile avatar top-right.
*   **Search**: Sticky search bar under header with filter button nested inside.
*   **Filters**: Horizontal scrolling tags for "Veg Only", "Under ₹200", "Fast Delivery", "Rating 4.0+".
*   **Banners**: Parallax horizontal slider for promotional discount cards.
*   **Categories**: Circular avatar buttons with dynamic food illustrations.
*   **Food Cards**: Grid/List cards with high-res food image, Veg/Non-Veg icon badge, item title, price, discount price, and clear "+ Add" CTA.
*   **Cart section**: Floating Rose bar at the bottom containing quantity count, subtotal, and "View Cart [->]" label.

### 3. Screen Preview (Text Wireframe)
```text
┌──────────────────────────────────────────┐
│ [📍 Home: MG Road... ▼]         [👤 Avatar]│
│ ┌──────────────────────────────────────┐ │
│ │ 🔍 Search food, cuisine...    [Filter]│ │
│ └──────────────────────────────────────┘ │
│  (Veg Only) (Rating 4+) (Offers)         │
│ ┌──────────────────────────────────────┐ │
│ │ Banner Slider: 50% OFF on Pizzas!    │ │
│ └──────────────────────────────────────┘ │
│ Categories:                              │
│  (🍔) Burgers   (🍕) Pizza   (🥤) Drinks  │
│                                          │
│ Popular Dishes                           │
│ ┌──────────────────────────────────────┐ │
│ │ 🍕 Veg Margherita Pizza      ₹299    │ │
│ │ Fresh tomato basil sauce     [+ ADD] │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ 🍔 Spicy Chicken Burger      ₹189    │ │
│ │ Crispy chicken breast patty  [+ ADD] │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ 🛒 1 Item | ₹299            VIEW CART│ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### 4. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Location Selector | Button | Yes | Must resolve to valid geocode | `12.9716, 77.5946` | Defaults to current device GPS coordinates |
| Search Input | Text | No | Debounced, max 100 characters | `Pizza` | Triggers sub-second search API query |
| Category Filter | Tag | No | Must be valid category database ID | `cat_pizza` | Restricts displayed cards |

### 5. Validation Rules
*   **Location Validation**: If geocode falls outside operational radius of all branches, disable checkout and show warning bottom sheet: "Delivery Address out of range."
*   **Search Debounce**: Strict 300ms debounce on keystrokes.

### 6. Dependencies
*   **Maps API (Google Maps/Mapbox)**: Handles GPS retrieval, reverse geocoding to string address, and branch distance calculation.
*   **Restaurant Portal Availability Status**: Fetches live disabled/enabled items list from target branch.

### 7. API Requirement Suggestions
*   **GET** `/api/v1/customer/branches/nearest?lat=12.9716&lng=77.5946`
    *   *Response*: `{"status": "success", "branch_id": "br_mg_road", "name": "MG Road Branch"}`
*   **GET** `/api/v1/customer/menu?branch_id=br_mg_road&search=Pizza&category=pizza&veg_only=true`
    *   *Response*: `{"status": "success", "items": [{"id": "item_1", "name": "Veg Pizza", "price": 299, "is_available": true}]}`

### 8. Database Table Suggestions
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    operating_hours_start TIME NOT NULL,
    operating_hours_end TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 9. Role & Permission Logic
*   **Guest**: Can search and browse items, view banners. Blocked from opening the cart.
*   **Customer**: Full browsing and cart modification permissions.

### 10. Development Notes
*   **Caching**: Cache the master menu structure locally for 15 minutes. Cache categories indefinitely until manual revision version increments.
*   **Offline Mode**: Store last loaded menu. Display message: "Offline - displaying cached menu, prices may vary."

### 11. UI Components Required
*   Location picker button, Search bar widget, Carousel view, Scrollable horizontal filter tags, Food card layout, Floating cart bar.

### 12. Edge Cases
*   **No Active Branches Nearby**: Show empty state screen with visual vector art and prompt user to input different location manually.
*   **Closed Branch**: If branch is outside operating hours, show banner over screen: "Branch is currently closed. Accepting pre-orders for tomorrow."

### 13. Notifications & Toast Messages
*   *Warning*: "Unable to access GPS. Using last saved location."
*   *Success*: "Added Veg Margherita Pizza to cart."

### 14. Real-Time Event Flow
*   WebSockets listen to live stock changes. If item is toggled disabled in the Restaurant Portal, instantly grey out item card and block "+ Add" interactions.

### 15. Status Management System
| Status | Color | Description | Next Status |
|---|---|---|---|
| `Locating` | Yellow | Fetching GPS geocodes | `Ready` or `Out of Bounds` |
| `Ready` | Green | Displays local food menus | `Cart Modifying` |
| `Out of Bounds` | Red | Displays warning fallback menu | `Locating` |

### 16. Payment Flow
*   *Not applicable to this screen.*

### 17. Address Management Flow
*   Location Selector opens GPS map pin selector or saved address bottom sheet picker.

### 18. Suggested Tech Notes
*   Use native mobile geofencing checks. Set Google Maps API usage quotas to prevent expensive overcharging.

---

## Module 4 — Food Detail Screen

### 1. Overview
*   **Purpose**: Display high-definition assets, ingredients, ratings, customizations, and watchlist saves for specific food items.
*   **Business Goal**: Convince user of item quality through visual layout and collect user customizations to maximize item revenue.
*   **User Workflow**: Click food card on Home ➔ Load Food Detail screen ➔ Toggle Favorites ➔ Select customizations ➔ Enter cooking requests ➔ Add to cart.
*   **Main Actions**: Add to Favorite/Watchlist, Add/Subtract Quantity, Configure Customizations, Submit Cooking Request.

### 2. UI/UX Layout Description
*   **Header**: Transparent overlay showing back arrow left, and Heart favorite button right, positioned over a high-resolution food image.
*   **Food Information**: Title, rating block (stars + reviews count), description paragraph, base price label.
*   **Customization Section**: Grouped cards listing customizations (e.g., "Select Size [Required - Pick 1]", "Add Ons [Optional]"). Radio selectors for single choice; checkboxes for multiple choices.
*   **Cooking Request**: Plain text field box with a character counter.
*   **Sticky Footer Action**: Floating control container with a quantity selector counter (`-` 1 `+`) on the left, and block Rose colored button ("Add to Cart — ₹350") on the right.

### 3. Screen Preview (Text Wireframe)
```text
┌──────────────────────────────────────────┐
│ [<-]                                 [🤍]│
│                                          │
│           [ Food Image Preview ]         │
│                                          │
│ 🍕 Veg Margherita Pizza      ⭐ 4.8 (120)│
│ Classic mozzarella, tomato, fresh basil  │
│                                          │
│ Select Size (Required)                   │
│ (●) Small  (+₹0)   ( ) Large (+₹120)     │
│                                          │
│ Extra Toppings (Optional)                │
│ [x] Extra Cheese (+₹45)                  │
│ [ ] Mushrooms (+₹30)                     │
│                                          │
│ Cooking Instructions                     │
│ [ Make it crispy!                      ] │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │  [-]  1  [+]     [ ADD TO CART - ₹344 ]│
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### 4. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Size Selector | Radio | Yes | Must select exactly one option | `Large` | Mapped to sub-pricing model |
| Extra Toppings | Checkbox | No | Can select multiple | `Extra Cheese` | Multi-select options |
| Cooking Request | Text | No | Max 150 characters, strips HTML tags | `Make it crispy!` | Passed directly to kitchen ticket |
| Watchlist Toggle | Button | No | Boolean | `true` | Persists item to favorites database |

### 5. Validation Rules
*   **Required Customizations**: "Add to Cart" button remains disabled, or prompts validation error banner, until all mandatory customizable categories are selected.
*   **Character Limits**: Cooking instructions text area input truncated at 150 characters.

### 6. Dependencies
*   **Database Customization Maps**: Fetches master customization relational tables for item ID from backend.

### 7. API Requirement Suggestions
*   **GET** `/api/v1/customer/menu/item/item_1/details`
    *   *Response*: `{"id": "item_1", "name": "Veg Pizza", "base_price": 299, "customizations": [{"id": "cust_size", "name": "Size", "required": true, "options": [{"id": "sz_sm", "name": "Small", "price": 0}]}]}`
*   **POST** `/api/v1/customer/watchlist`
    *   *Payload*: `{"item_id": "item_1", "action": "add"}`
    *   *Response*: `{"status": "success"}`

### 8. Database Table Suggestions
```sql
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (customer_id, food_item_id)
);
```

### 9. Role & Permission Logic
*   **Guest**: Watchlist button disabled (prompts Login prompt modal). Customization selection permitted, but checkout redirects to Login.
*   **Customer**: Full access.

### 10. Development Notes
*   **Optimistic Watchlist**: Heart icon changes color instantly (Rose) when clicked. If the server fails to update watchlist, revert heart state to transparent outline and prompt error toast.

### 11. UI Components Required
*   Parallax Scroll View, Radio Button Group, Checkbox Group, Quantity Toggle, Plain Text Input Area.

### 12. Edge Cases
*   **Ingredient Stock Out**: If a selected customization addon (e.g. "Extra Cheese") is marked out of stock in real-time, disable checkbox and display label next to it: "(Out of Stock)".

### 13. Notifications & Toast Messages
*   *Success*: "Added to Watchlist!" / "Removed from Watchlist."
*   *Warning*: "Please select a Size configuration before adding to cart."

### 14. Real-Time Event Flow
*   Updates from the Admin portal push changes to menu pricing. If price changes while user is browsing, dynamically update footer price label.

### 15. Status Management System
| Status | Color | Description | Next Status |
|---|---|---|---|
| `Viewing` | Grey | Loading details | `Configuring` |
| `Configuring` | Yellow | Checking mandatory selectors | `Ready to Add` |
| `Ready to Add`| Green | Validation passed | `Viewing` (after add) |

### 16. Payment Flow
*   *Not applicable to this screen.*

### 17. Address Management Flow
*   *Not applicable to this screen.*

### 18. Suggested Tech Notes
*   Ensure smooth high-resolution image rendering using image caching libraries (e.g. FastImage for React Native or CachedNetworkImage for Flutter) to prevent screen flicker.

---

## Module 5 — Add to Cart Screen

### 1. Overview
*   **Purpose**: Orchestrate checkout process, including quantity confirmation, cross-selling, coupons, delivery cost computation, address validation, and payment selection.
*   **Business Goal**: Minimize order friction while maximizing delivery efficiency, ensuring valid deliveries by checking locations prior to payment.
*   **User Workflow**: Open Cart ➔ View items ➔ Apply Coupon ➔ Select/Validate Address ➔ Select Payment Method ➔ Initiate Checkout.
*   **Main Actions**: Remove Cart Item, Apply Coupon, Tip Delivery Partner, Change Address, Complete checkout (COD/Online).

### 2. UI/UX Layout Description
*   **Header**: Title ("My Cart") with close action button and dynamic branch identifier subtitle.
*   **Cart Section**: Scrollable card list showing custom item summaries, specific pricing, and integrated sub-quantity counters.
*   **Forms**: Coupon input with code tag box and "Apply" button link. Special restaurant instruction text area.
*   **Modals**: Bottom Sheet for Address Selector and Payment Selector options.
*   **Bill Details**: Stacked key-value list displaying Item Total, Packaging Charge, Delivery Fee (calculated via routing geocodes), GST taxes, Delivery Partner Tip buttons (₹10, ₹20, ₹30), and Grand Total.
*   **Sticky Footer Action**: Rose primary CTA block button displaying final price and checkout action ("Place Order — ₹394").

### 3. Screen Preview (Text Wireframe)
```text
┌──────────────────────────────────────────┐
│ My Cart                                  │
│ From: DineOS MG Road Branch              │
│                                          │
│ 🍕 Veg Margherita Pizza         [ - 1 + ]│
│    Size: Large, Extra Cheese      ₹464   │
│                                          │
│ 🏷 [ Dine50        ]            [APPLIED]│
│    ₹50 discount applied!                 │
│                                          │
│ Delivery Address                         │
│ Home: 123 Main St, Bangalore [CHANGE]    │
│                                          │
│ Bill Details                             │
│ Item Total: ₹464 | Delivery Fee: ₹30     │
│ Packaging: ₹10   | Taxes: ₹15            │
│ Grand Total: ₹469 (Promo Applied)        │
│                                          │
│ Payment Method                           │
│ (●) Online Payment   ( ) Cash on Delivery│
│                                          │
│ [         PLACE ORDER - ₹469           ] │
└──────────────────────────────────────────┘
```

### 4. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Coupon Code | Text | No | Uppercase alphanumeric validation | `DINE50` | Case-insensitive |
| Delivery Address ID | UUID | Yes | Active checked address record | `addr_88192` | Must pass address verification check |
| Delivery Tip | Number | No | Real integer >= 0 | `20` | Paid directly to driver |
| Payment Method | Enum | Yes | Must match 'Online' or 'COD' | `Online` | Determines checkout routing flow |

### 5. Validation Rules
*   **Empty Cart**: If items list count is 0, render dynamic empty state template with CTA "Browse Menu".
*   **Address Check**: Order submission blocked unless valid address geocode matches current nearest branch bounds.
*   **Coupon Expiry**: Real-time coupon validity validation before cart total recalculation.

### 6. Dependencies
*   **Payment Gateway SDK (Razorpay/Stripe)**: Handles credit card processing, redirection flows, and webhook authentication.
*   **Google Maps Distance Matrix**: Computes path routing length to calculate variable Delivery Fee.

### 7. API Requirement Suggestions
*   **POST** `/api/v1/customer/cart/calculate`
    *   *Payload*: `{"items": [{"id": "item_1", "quantity": 1, "customizations": ["sz_lg"]}], "coupon": "DINE50", "address_id": "addr_88192"}`
    *   *Response*: `{"item_total": 464, "delivery_fee": 30, "packaging": 10, "tax": 15, "discount": 50, "grand_total": 469}`
*   **POST** `/api/v1/customer/orders/create`
    *   *Payload*: `{"address_id": "addr_88192", "payment_method": "Online", "coupon_code": "DINE50"}`
    *   *Response*: `{"order_id": "ord_99018", "payment_required": true, "payment_txn_token": "txn_88291"}`

### 8. Database Table Suggestions
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL,
    quantity INT CHECK (quantity > 0),
    customization_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    discount_type VARCHAR(10) CHECK (discount_type IN ('Fixed', 'Percent')),
    min_order_value DECIMAL(10,2) DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 9. Role & Permission Logic
*   **Guest**: Prohibited from saving cart items to server DB. Cache cart locally in Redux/AsyncStorage. On click "Checkout", trigger Redirect to Login Screen, then restore local cart state post-auth.
*   **Customer**: Server-synchronized cart.

### 10. Development Notes
*   **Concurrency Handling**: If an item in cart goes out of stock while checkout is loaded, intercept "Place Order" click, display warning pop-up: "Some items in your cart are no longer available", and update cart items.

### 11. UI Components Required
*   Cart list row card, Coupon text box, Bill details table, Address display block, Checkout payment button.

### 12. Edge Cases
*   **Online Payment Interrupted**: User backgrounds app or receives call during gateway verification. On resume, call backend order transaction status poll.
*   **Address Change**: Recalculate delivery fee dynamically if user changes checkout address.

### 13. Notifications & Toast Messages
*   *Success*: "Coupon applied successfully!"
*   *Error*: "Minimum order value for DINE50 is ₹300." / "Order placed successfully!"

### 14. Real-Time Event Flow
*   On checkout creation, lock quantities in branch catalog DB. Emit WebSocket notice to Restaurant Portal: "New Order Pending".

### 15. Status Management System
| Status | Color | Description | Next Status |
|---|---|---|---|
| `Reviewing` | Grey | Displaying item list | `Applying Promos` |
| `Applying Promos` | Yellow | recalculating coupon values | `Validating Address` |
| `Validating Address`| Blue | Checking GPS geofence bounds | `Ready for Payment` |
| `Ready for Payment` | Green | Displaying final Grand Total | `Processing Order` |

### 16. Payment Flow
*   **COD**: Order immediately placed, status transitions to `Pending`.
*   **Online**: Redirect to payment gateway. If payment fails, route back to Cart with warning toast; if success, transition status to `Pending` and trigger order routing engine.

### 17. Address Management Flow
*   Integrate Address selection bottom sheet with option to quick-add address using GPS location pin drop.

### 18. Suggested Tech Notes
*   Implement Stripe/Razorpay webhooks to process payments asynchronously. If user app crashes after payment but before order placement API returns, the webhook captures state and completes order in DB.

---

## Module 6 — Order Status & Delivery Tracking Screen

### 1. Overview
*   **Purpose**: Provide real-time location mapping and status lifecycle tracking for placed orders.
*   **Business Goal**: Build user trust, reduce customer support calls, and manage customer expectations during peak demand windows.
*   **User Workflow**: Complete checkout ➔ Display live map ➔ Track progress tracker milestones ➔ Delivery partner assigned ➔ Live rider tracking on map.
*   **Main Actions**: Call Delivery Partner, Call Support, Cancel Order (only if status is `Pending`).

### 2. UI/UX Layout Description
*   **Header**: Title showing Order ID and status badge. ETA ticker box ("Arriving in 15 mins") centered.
*   **Search**: *Not applicable to this screen.*
*   **Live Tracking Map**: Interactive map filling top 60% of viewport. Renders Branch pin, Rider bike icon, Customer address pin, and active route polyline.
*   **Status Indicators**: Vertical/horizontal milestone stepper displaying state updates. Passed milestones highlighted green, current milestone flashes amber.
*   **Buttons**: Floating circular buttons over map to center location, call driver, or contact DineOS support.
*   **Empty / Error States**: Banner alert overlay displayed if GPS coordinate streams fail.

### 3. Screen Preview (Text Wireframe)
```text
┌──────────────────────────────────────────┐
│ Order #ORD-99018            ● Preparing  │
│ ETA: 12 Mins               [Call Driver] │
├──────────────────────────────────────────┤
│                                          │
│              [ Live Map ]                │
│    (Branch Pin) === (Rider) === [Home]   │
│                                          │
├──────────────────────────────────────────┤
│ Order Status:                            │
│  [✔] Placed    [✔] Accepted  [●] Preparing│
│                                          │
│ Delivery Partner Assigned:               │
│ Name: Mike | Phone: +91 9998887776       │
│ Vehicle: Hero Splendor (KA-03-EX-1234)   │
│                                          │
│ [            VIEW BILL DETAILS         ] │
└──────────────────────────────────────────┘
```

### 4. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| Order ID | Label | Yes | Unique alphanumeric string | `ORD-99018` | Used for lookup queries |
| Rider Lat | coordinate | No | Latitude value | `12.9720` | Updated in real-time via WebSocket |
| Rider Lng | coordinate | No | Longitude value | `77.5950` | Updated in real-time via WebSocket |

### 5. Validation Rules
*   **Cancellation Check**: Display "Cancel Order" button only if status is strictly `Pending`. Once status changes to `Accepted`, remove the button.

### 6. Dependencies
*   **Delivery Partner App Location Stream**: Relies on background location telemetry broadcast from the Delivery Partner App.
*   **Notification Engine**: Integration with FCM (Firebase Cloud Messaging) and APNS (Apple Push Notification Service) for status state alerts.

### 7. API Requirement Suggestions
*   **GET** `/api/v1/customer/orders/ord_99018/track`
    *   *Response*: `{"status": "Preparing", "eta_minutes": 12, "rider": {"name": "Mike", "phone": "+919998887776", "lat": 12.9720, "lng": 77.5950}}`

### 8. Database Table Suggestions
```sql
CREATE TABLE customer_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    branch_id UUID REFERENCES branches(id),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    total_amount DECIMAL(10,2) NOT NULL,
    rider_id UUID,
    delivery_address_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES customer_orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9. Role & Permission Logic
*   Only the customer who placed the order (owner check matching `customer_id` token scope) is authorized to query status coordinates.

### 10. Development Notes
*   **Real-Time Synchronization**: Connect to WebSocket namespace `/orders/track` using client socket libraries. Listen for event `rider_location_update`.
*   **GPS Smoothing**: Implement linear interpolation (lerp) on the client side to move the rider map marker smoothly between coordinate points.

### 11. UI Components Required
*   Interactive Maps wrapper, Status timeline stepper, Rider info overlay card, Call action button.

### 12. Edge Cases
*   **Order Rejection**: If restaurant portal sends `Rejected` event, update map to empty state, display reason (e.g. "Kitchen Overloaded"), display status `Refund Initiated` if prepaid, and send push notification.

### 13. Notifications & Toast Messages
*   *Push Notification*: "Your order #ORD-99018 has been accepted and is being prepared!"
*   *Push Notification*: "Delivery Partner Mike has picked up your food and is heading your way."

### 14. Real-Time Event Flow
*   `order_status_changed` websocket payload format:
    `{"order_id": "ord_99018", "status": "Preparing", "timestamp": "2026-05-27T12:45:00Z"}`

### 15. Status Management System
| Status | Color | Description | Next Status |
|---|---|---|---|
| `Pending` | Orange | Awaiting restaurant response | `Accepted` or `Rejected` |
| `Accepted` | Yellow | Branch accepted order | `Preparing Food` |
| `Preparing Food`| Amber | Food is in kitchen | `Delivery Partner Assigned` |
| `Partner Assigned`| Blue | Rider is matching / heading to branch | `Picked Up` |
| `Picked Up` | Indigo | Rider has food, out for delivery | `Arrived` |
| `Arrived` | Cyan | Rider reached customer address | `Delivered` |
| `Delivered` | Green | Order complete | None (Terminal) |
| `Rejected` | Red | Restaurant declined order | `Refund Initiated` / `Closed` |
| `Cancelled` | Dark Red| Customer / Admin aborted order | `Refund Initiated` / `Closed` |

### 16. Payment Flow
*   If status transitions to `Cancelled` or `Rejected` and payment was online, backend automatically creates a refund payload object and posts to gateway provider, shifting status in payments table to `Refund Initiated`.

### 17. Address Management Flow
*   Read-only delivery geocode mapping locks after order confirmation. User cannot change delivery address after checkout.

### 18. Suggested Tech Notes
*   Use Socket.io or AWS AppSync WebSockets for coordinate broadcast routing. Set rider update ping interval to 5 seconds to manage network data charges.

---

## Module 7 — Profile Screen

### 1. Overview
*   **Purpose**: Manage user details, address directory, watchlist items, past order logs, and sign-out states.
*   **Business Goal**: Increase lifetime value (LTV) by enabling single-tap reordering of favorite meals and saving delivery address configurations.
*   **User Workflow**: Open Profile ➔ Edit details OR Select Address Book OR Select Watchlist OR Click Reorder on past order item.
*   **Main Actions**: Edit User Information, Add/Edit Address, Delete Address, Favorite Item Click, Reorder CTA click, Logout.

### 2. UI/UX Layout Description
*   **Header**: Rounded user avatar layout, customer name, email address, edit profile button.
*   **Profile Features**: List navigation menus styled with clean icons: "My Orders", "Saved Addresses", "Watchlist", "Logout".
*   **Past Orders Cards**: Summary blocks listing branch name, items ordered, order date, total price, status badge, and Rose-colored button ("Reorder").
*   **Address Book Cards**: Grid listing Home, Work, and Other addresses with quick Edit and Delete icon options.
*   **Modals**: Custom edit profile forms and GPS address pin selection screens.

### 3. Screen Preview (Text Wireframe)
```text
┌──────────────────────────────────────────┐
│ Profile                                  │
│                                          │
│   (👤)  Amit Kumar                       │
│         amit.kumar@example.com           │
│         [ Edit Profile ]                 │
│                                          │
│ 📁 Saved Addresses                       │
│   🏡 Home: 123 Main St, Bangalore [Edit] │
│   🏢 Work: Tech Park, Indiranagar [Edit] │
│                                          │
│ 🍔 Watchlist / Favorites                 │
│   - Veg Margherita Pizza                 │
│   - Spicy Chicken Burger                 │
│                                          │
│ 📦 Recent Orders                         │
│   DineOS MG Road - 26 May                │
│   1x Veg Margherita Pizza (₹299)         │
│   [ REORDER ]         ● Delivered        │
│                                          │
│ [               LOG OUT                ] │
└──────────────────────────────────────────┘
```

### 4. Screen Fields Table
| Field Name | Type | Required | Validation | Example | Notes |
|---|---|---|---|---|---|
| User Name | Text | Yes | Min 3, max 50 characters | `Amit Kumar` | Editable |
| Mobile Number | Phone | Yes | E.164 verification required | `+919876543210` | Requires OTP validation if updated |
| Email Address | Email | Yes | Valid email regex structure | `amit.kumar@example.com` | Requires validation link if updated |
| DOB | Date | No | Must be in past | `1995-10-15` | Used for birthday promotions |

### 5. Validation Rules
*   **Address Fields**: When adding or editing an address, Pincode must be exactly 6 digits, and Address label must have a minimum of 10 characters.
*   **Reorder Logic**: Reorder CTA validates if items from original order are currently in-stock at nearest branch before copying items to active cart.

### 6. Dependencies
*   **Auth Manager**: Revokes device token sessions from redis cache DB when user triggers logout.

### 7. API Requirement Suggestions
*   **GET** `/api/v1/customer/profile`
    *   *Response*: `{"name": "Amit Kumar", "phone": "9876543210", "email": "amit.kumar@example.com", "dob": "1995-10-15"}`
*   **POST** `/api/v1/customer/profile/addresses`
    *   *Payload*: `{"label": "Home", "address_line_1": "123 Main St", "city": "Bangalore", "pincode": "560001", "lat": 12.9716, "lng": 77.5946}`
    *   *Response*: `{"status": "success", "address_id": "addr_9901"}`

### 8. Database Table Suggestions
```sql
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL, -- 'Home', 'Work', 'Other'
    address_line_1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9. Role & Permission Logic
*   **Guest**: Screen shows "Please Login to View Profile" card.
*   **Customer**: full write permission to linked addresses, favorites, and profile configurations.

### 10. Development Notes
*   **Reorder Workflow**: On click Reorder ➔ Query `/api/v1/customer/orders/{id}/reorder-validate` ➔ Returns list of in-stock items ➔ Populates cart context ➔ Navigates to Add to Cart Screen.

### 11. UI Components Required
*   Profile navigation list, Address details card, Past orders card, Watchlist item list row.

### 12. Edge Cases
*   **Profile Save during Offline**: Cache updates in local database and queue synchronization payload. Once connection is restored, push profile updates to backend server.

### 13. Notifications & Toast Messages
*   *Success*: "Profile updated successfully!" / "Address deleted."
*   *Warning*: "Some items in this order are currently out of stock."

### 14. Real-Time Event Flow
*   *Not applicable to this screen.*

### 15. Status Management System
| Status | Color | Description | Next Status |
|---|---|---|---|
| `Viewing` | Grey | Standard display mode | `Editing Profile` or `Adding Address` |
| `Editing Profile`| Yellow | Form input active | `Saving Changes` |
| `Saving Changes`| Green | Querying updates to DB | `Viewing` |

### 16. Payment Flow
*   *Not applicable to this screen.*

### 17. Address Management Flow
*   **Default Address**: Toggling a saved address as default flags all other addresses associated with `customer_id` as `is_default = false` in a database transaction block.

### 18. Suggested Tech Notes
*   Store user profile properties in global state managers (Redux/Zustand) to ensure profile picture and names update across the sidebar navigation layouts instantly.

***End of Handover Document***
