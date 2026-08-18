# MY STYLE — Omni-Channel Clothing Sales & Management Information System
> **Department of Management Information Systems (MIS) — Year IV / Semester II**  
> **Regional Polytechnic Institute Techo Sen Siem Reap (RPITSSR)**

---

## Slide Presentation Deck (Capstone Defense)

Below is the complete 12-slide presentation structure prepared for the final MIS degree defense.

---

### Slide 1: Title & Overview
```
+-------------------------------------------------------------------------+
|                                                                         |
|                MY STYLE CLOTHING SALES MANAGEMENT SYSTEM                |
|           Omni-Channel Fashion Retail, Real-Time POS & E-Commerce       |
|                                                                         |
|  Presenter: Tan Saphea                                                  |
|  Major: Management Information Systems (MIS)                            |
|  Academic Level: Year IV, Semester II                                   |
|  Institution: Regional Polytechnic Institute Techo Sen Siem Reap       |
|                                                                         |
+-------------------------------------------------------------------------+
```
- **Overview**: An enterprise omni-channel MIS solution unifying in-store retail checkout (POS), centralized warehouse inventory, localized e-commerce web storefront, and mobile shopping app.

---

### Slide 2: Problem Statement & Market Context
- **Inventory Discrepancy**: Manual stock recording leads to stock-outs and overselling across brick-and-mortar stores and online channels.
- **Checkout Bottlenecks**: Lack of hardware barcode scanning and parked-cart capabilities slows down high-volume peak retail hours.
- **Cambodian Delivery Friction**: Traditional e-commerce tools fail to handle informal Cambodian addresses lacking street numbers.
- **Delayed Decision Support**: Retail owners lack real-time visibility into Gross Profit, Net Margins, and Inventory Turnover.

---

### Slide 3: Project Objectives & Scope
- **Centralized Data Master**: Unified single source of truth for Products, Multi-SKU Variants (Size & Color), Customers, and Suppliers.
- **High-Speed Point of Sale (POS)**: In-store terminal with hardware barcode scanner integration, cart holding, and atomic inventory deduction.
- **Localized Cambodian E-Commerce**: Dual-mode delivery (Structured Address + 1-Click Live GPS Pinning) and instant ABA KHQR (Bakong) payment rails.
- **Automated Management Reporting**: Time-series revenue analytics, net profit calculation (`Revenue - COGS - Discount`), and inventory valuation.

---

### Slide 4: 4-Tier System Architecture
```
+-------------------------------------------------------------------------+
|                              CLIENT CHANNELS                            |
|                                                                         |
|   +--------------------+  +--------------------+  +-----------------+   |
|   | Customer Storefront|  | Flutter Mobile App |  | Admin & POS App |   |
|   | Next.js 16         |  | iOS & Android      |  | Next.js 16      |   |
|   | Port 3002          |  | Mobile Devices     |  | Port 3001       |   |
|   +---------+----------+  +---------+----------+  +--------+--------+   |
+-------------|-----------------------|----------------------|------------+
              |                       |                      |
              |       RESTful JSON API Requests (HTTPS)      |
              +-----------------------+----------------------+
                                      |
                                      v
+-------------------------------------------------------------------------+
|                            BACKEND API TIER                             |
|   Node.js, Express.js & TypeScript (Port 5001)                          |
|   - JWT Token Authentication & HTTP-Only Refresh Rotation               |
|   - Zod Schema Sanitization & Rate Limiting                             |
|   - Role-Based Access Control: Admin | Cashier | User                   |
+-------------------------------------+-----------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------+
|                           DATABASE STORAGE                              |
|   MongoDB Cluster (Atomic Transactions & Stock Movement Isolation)      |
+-------------------------------------------------------------------------+
```

---

### Slide 5: Technology Stack Justification

| Layer | Technologies Selected | Key Rationale |
|---|---|---|
| **Backend API** | Node.js, Express.js, TypeScript | Asynchronous non-blocking architecture, high concurrency, strict type safety |
| **Database** | MongoDB & Mongoose | Document flexibility for multi-variant fashion attributes (Size, Color, SKU) |
| **Admin & POS** | Next.js 16 (Turbopack), Ant Design, TanStack Query | Optimized table data grids, instant sub-second page loads, and memory caching |
| **Storefront Web** | Next.js 16, Tailwind CSS | High-definition 3:4 lookbook gallery, SEO optimization, and responsive design |
| **Mobile App** | Flutter / Dart | Native cross-platform performance (60fps) on iOS and Android smartphones |

---

### Slide 6: Core Feature 1 — Localized E-Commerce Storefront
- **Dual Delivery Destination**:
  - *Option 1 (Structured Address)*: Province selection, Khan/Sangkat, street, and Home/Work presets.
  - *Option 2 (Live GPS Pin)*: 1-Click HTML5 geolocation pin capturing exact coordinates without API costs.
- **Cambodian Payment Rails**: Direct ABA KHQR (Bakong NBC standard) scanning and Cash on Delivery (COD).
- **Self-Service Order Tracking**: Real-time status lookup using Invoice Number or Customer Phone Number.

---

### Slide 7: Core Feature 2 — Point of Sale (POS) & Inventory Engine
- **Grouped Product View**: Consolidates multiple size/color variants into unified product cards with an instant **Variant Selector Modal**.
- **Hardware Barcode Integration**: Direct keyboard-wedge scanner listener adds scanned SKUs to the cart in under 50 milliseconds.
- **Parked / Held Orders**: Allows cashiers to pause active carts and restore them anytime.
- **Stock Decrement Safety**: Atomic database updates guarantee inventory cannot be sold below zero.

---

### Slide 8: Core Feature 3 — Dispatch Center & Smart Waybills
- **Live Order Chime**: Automated Web Audio chime and top notification bell notify operators when online orders arrive.
- **Google Maps Driver Link**: Automatically extracts GPS coordinates from addresses to generate direct navigation links for courier drivers.
- **Printable Courier Waybill**: Ready-to-print delivery slips formatted for Virak Buntham, J&T Express, and local drivers.

---

### Slide 9: Core Feature 4 — MIS Business Reports & Analytics
- **Sales Revenue Statement**: Filterable by Day, Week, Month, Year, and Custom Date Ranges.
- **Profit & Loss Analysis**: Real-time formula: `Gross Profit = Total Revenue - Cost of Goods Sold (COGS)`.
- **Inventory Valuation**: Current asset valuation calculation (`Sum(Quantity * Cost Price)`) with automated low-stock warnings.
- **Top Performing Styles**: Identifies best-selling garments by volume and revenue contribution.

---

### Slide 10: Security Architecture & Role-Based Access Control (RBAC)

| Role | Access Level & Permissions |
|---|---|
| **Admin** | Full system control: Financial Reports, Inventory Adjustments, User Roles, Store Settings, Audit Logs |
| **Cashier** | Operational access: Point of Sale (POS) Terminal, Sales Center, Customer Registration |
| **Customer / User** | Storefront access: Catalog Browsing, Shopping Cart, Checkout, Order Tracking |

---

### Slide 11: Live 5-Step Demonstration Script

```
[Step 1: Online Order]   Customer buys on Website/Mobile -> Selects GPS Pin & ABA KHQR
         |
         v
[Step 2: Real-time Alert] Admin Dashboard plays Chime -> Bell Notification lights up
         |
         v
[Step 3: Dispatch Slip]   Admin clicks Order -> Opens Google Maps Pin & Prints Waybill
         |
         v
[Step 4: POS Retail Sale] Cashier scans barcode at POS -> Stock atomically deducts
         |
         v
[Step 5: MIS Report]      Admin opens Profit Report -> Views updated Revenue & Margins
```

---

### Slide 12: Conclusion & Future Roadmap
- **Project Summary**: Successfully engineered a robust, high-performance Omni-Channel MIS solution answering real retail needs in Cambodia.
- **Future Enhancements**:
  - AI-driven predictive demand forecasting for seasonal collections.
  - Automated Telegram / SMS order status push notifications.
  - Multi-branch warehouse synchronization across provincial outlets.

---

## Running the Project Locally

### 1. Prerequisites
- Node.js (v18 or newer)
- MongoDB running on `mongodb://127.0.0.1:27017`
- Flutter SDK (v3.19+) for Mobile

### 2. Startup Commands

```bash
# 1. Backend REST API (Port 5001)
cd backend
npm install
npm run build
npm start

# 2. Admin Dashboard & POS (Port 3001)
cd frontend
npm install
npm run dev

# 3. Customer Website Storefront (Port 3002)
cd website
npm install
npm run dev

# 4. Mobile App (Flutter)
cd mobile
flutter pub get
flutter run
```

### 3. Default Credentials
- **Admin**: `username: admin`, `password: admin123`
- **Cashier**: `username: cashier1`, `password: cashier123`

---

## Production Verification

```bash
# Backend TypeScript & Build
cd backend && npm run build

# Frontend Admin TypeScript Check
cd frontend && npx tsc --noEmit

# Website Storefront TypeScript Check
cd website && npx tsc --noEmit

# Flutter Mobile Analysis
cd mobile && flutter analyze
```

---
Developed for **RPITSSR MIS Capstone Assignment (Year IV, Semester II)**.
