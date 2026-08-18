# CLOTHING SALES MANAGEMENT SYSTEM (MY STYLE)
## Comprehensive Technical & Business Documentation
### Management Information Systems (MIS) — Year IV / Semester II

---

## 1. Executive Summary

The **Clothing Sales Management System (MY STYLE)** is an enterprise-grade, omni-channel software ecosystem designed to manage retail fashion boutique operations, warehouse inventory, in-store Point of Sale (POS) checkout, and consumer digital storefronts across web and mobile platforms.

The solution directly addresses common inefficiencies in the Cambodian retail apparel industry:
- Disconnected online and offline stock levels.
- Slow checkout speeds and lack of hardware barcode scanning.
- Delivery failure due to unstandardized residential addresses.
- Delayed financial reporting and inaccurate profit estimation.

---

## 2. System Architecture & Topology

```
+-------------------------------------------------------------------------+
|                              CLIENT CHANNELS                            |
|                                                                         |
|   +--------------------+  +--------------------+  +-----------------+   |
|   | Customer Storefront|  | Flutter Mobile App |  | Admin & POS App |   |
|   | Next.js 16 (Port   |  | iOS & Android      |  | Next.js 16      |   |
|   | 3002)              |  | Mobile Devices     |  | (Port 3001)     |   |
|   +---------+----------+  +---------+----------+  +--------+--------+   |
+-------------|-----------------------|----------------------|------------+
              |                       |                      |
              |       RESTful JSON API Requests (HTTPS)      |
              +-----------------------+----------------------+
                                      |
                                      v
+-------------------------------------------------------------------------+
|                            BACKEND API TIER                             |
|                                                                         |
|   Node.js & Express.js REST API (Port 5001)                             |
|   - Authentication: JWT (Access Token & HTTP-Only Refresh Cookie)       |
|   - Validation: Zod Schema Sanitization Middleware                      |
|   - Rate Limiting: Sensitive Operation Protection                       |
|   - Role-Based Access Control: Admin, Cashier, User                     |
|   - Controllers: Auth, Products, Sales, Inventory, Reports, Settings    |
+-------------------------------------+-----------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------+
|                           DATABASE TIER                                 |
|                                                                         |
|   MongoDB Database Cluster                                              |
|   - Collections: Users, Products, Variants, Categories, Sizes, Colors,   |
|     Suppliers, Purchases, Customers, Sales, Payments, Audits, Settings  |
|   - Atomic Transactions & Stock Decrement Verification                  |
+-------------------------------------------------------------------------+
```

---

## 3. Database Schema & Data Models

### 3.1 Core Collections Overview

| Collection Name | Key Attributes | Description |
|---|---|---|
| `users` | `_id`, `name`, `username`, `email`, `role`, `password`, `status` | System operators, admins, and cashiers |
| `categories` | `_id`, `name`, `description`, `slug`, `status` | Apparel categories (Men, Women, Kids, Outerwear, Denim) |
| `sizes` | `_id`, `name`, `description`, `sortOrder`, `status` | Standard sizing standards (XS, S, M, L, XL, XXL) |
| `colors` | `_id`, `name`, `hexCode`, `status` | Fabric color swatches |
| `products` | `_id`, `name`, `brand`, `category`, `audience`, `images`, `status` | Master product parent record |
| `productvariants` | `_id`, `product`, `size`, `color`, `sku`, `costPrice`, `salePrice`, `quantity`, `lowStockLevel` | Individual sellable SKUs with dedicated stock counts |
| `customers` | `_id`, `name`, `phone`, `email`, `address`, `totalSpending`, `totalOrders` | Registered retail and online customers |
| `suppliers` | `_id`, `name`, `contactPerson`, `phone`, `email`, `address` | Textile mills, garment factories, and apparel vendors |
| `purchases` | `_id`, `purchaseNumber`, `supplier`, `items`, `grandTotal`, `status` | Inward inventory procurement transactions |
| `sales` | `_id`, `invoiceNumber`, `customer`, `items`, `subtotal`, `discount`, `taxAmount`, `grandTotal`, `paymentStatus`, `fulfillmentStatus`, `shippingAddress` | In-store POS and online e-commerce transactions |
| `payments` | `_id`, `sale`, `amount`, `paymentMethod`, `status`, `referenceNumber` | Financial payment settlement logs |
| `auditlogs` | `_id`, `user`, `action`, `collectionName`, `recordId`, `details`, `timestamp` | Compliance tracking of all critical modifications |
| `storesettings` | `_id`, `storeName`, `currency`, `taxRate`, `exchangeRateUSDToKHR` | Global business configuration |

---

## 4. Key Business Modules & Workflows

### 4.1 In-Store POS (Point of Sale)
1. **Catalog Exploration**: Displays active inventory grouped by product with total available stock across variants.
2. **Barcode Scanner**: Hardware scanners input SKU codes directly into the buffer, triggering instant 1-touch line item addition.
3. **Parked Carts**: Cashiers can hold orders indefinitely and restore them with a single click.
4. **Checkout Settlement**: Computes subtotal, VAT tax, promotional discounts, and handles Cash and ABA KHQR payments with automated receipt printing.

### 4.2 Customer Storefront & Mobile App
1. **Lookbook Catalog**: High-definition 3:4 portrait presentation with interactive color swatch switching.
2. **Dual Delivery Options**:
   - Option 1: Structured address with Home/Work presets.
   - Option 2: Live HTML5 GPS Pinning for driver delivery accuracy.
3. **Real-time Order Tracking**: Self-service tracking by invoice number or phone number.

### 4.3 Management Information Systems (MIS) Reporting
- **Sales Revenue Statement**: Dynamic time-series aggregation of revenue across date ranges.
- **Profit & Loss Analysis**: Tracks Cost of Goods Sold (COGS), Gross Profit, Net Profit, and Profit Margins.
- **Inventory Valuation**: Current asset value calculation based on weighted procurement cost.
- **Inventory Audit Logs**: Complete traceability for stock additions, sales deductions, and manual adjustments.

---

## 5. Localized Cambodian Market Features

1. **ABA KHQR & Bakong Integration**: Direct support for National Bank of Cambodia (NBC) KHQR standards.
2. **Dual Currency Engine**: Automatic conversion between United States Dollar ($) and Khmer Riel (៛) at customizable exchange rates (e.g. 4,100 KHR / USD).
3. **Dispatch Waybills with Google Maps**: Smart extraction of GPS coordinates for instant navigation by local courier drivers (Virak Buntham, J&T Express, Delivery Drivers).

---

## 6. How to Run & Verify the System

### Prerequisites:
- Node.js (v18+)
- MongoDB running locally on `localhost:27017`
- Flutter SDK (v3.19+) for Mobile

### Terminal 1: Backend API
```bash
cd backend
npm install
npm run build
npm start # Runs on http://localhost:5001
```

### Terminal 2: Admin Dashboard & POS
```bash
cd frontend
npm install
npm run dev # Runs on http://localhost:3001
```

### Terminal 3: Customer Web Storefront
```bash
cd website
npm install
npm run dev # Runs on http://localhost:3002
```

### Terminal 4: Mobile App (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```

### Default Credentials:
- **Admin**: `username: admin`, `password: admin123`
- **Cashier**: `username: cashier1`, `password: cashier123`
