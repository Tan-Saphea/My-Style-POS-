# CLOTHING SALES MANAGEMENT SYSTEM (MY STYLE)
## Master Presentation Guide & Defense Strategy
### Department of Management Information Systems (MIS) — Year IV / Semester II

---

## 1. Project Overview & Academic Metadata

- **Institution**: Regional Polytechnic Institute Techo Sen Siem Reap (RPITSSR)
- **Academic Program**: Bachelor of Science in Management Information Systems (MIS)
- **Academic Year**: Year IV, Semester II
- **Project Title**: Omni-Channel Clothing Sales Management System (MY STYLE)
- **Project Type**: Final Capstone & Enterprise MIS Solution
- **Target Domain**: Fashion Apparel Retail, In-Store Point of Sale (POS), and Online Storefront E-Commerce

---

## 2. Slide-by-Slide Presentation Structure (12 Slides)

This outline is designed for a 15 to 20-minute slide deck presentation followed by a 5-minute live system demo.

```
Slide 1: Title & Introduction
Slide 2: Background & Problem Statement
Slide 3: Business Objectives & Scope
Slide 4: System Architecture (4-Tier Omni-Channel)
Slide 5: Technology Stack Justification
Slide 6: Core Feature 1 — Storefront E-Commerce & Cambodian Localization
Slide 7: Core Feature 2 — Point of Sale (POS) & Inventory Automation
Slide 8: Core Feature 3 — Dispatch & Smart Google Maps Delivery
Slide 9: Core Feature 4 — MIS Business Reports & Financial Analytics
Slide 10: System Security & Role-Based Access Control (RBAC)
Slide 11: Live Demonstration Plan
Slide 12: Conclusion & Future Enhancements
```

---

### Slide 1: Title & Introduction

- **Slide Title**: Omni-Channel Clothing Sales & Management Information System
- **Subtitle**: A Modern 4-Tier Solution for Fashion Retail, Real-Time POS, and E-Commerce in Cambodia
- **Key Talking Points**:
  - Introduce yourself and state your department (MIS, Year IV, Semester II).
  - Briefly introduce the brand "MY STYLE" as a modern apparel brand that operates both a physical boutique store and digital shopping channels (Web and Mobile).
  - State the thesis: How this MIS solution solves the fragmentation between warehouse inventory, in-store checkout, and online order fulfillment.

---

### Slide 2: Background & Problem Statement

- **Slide Title**: Industry Challenges in Fashion Retail Management
- **Key Talking Points**:
  - **Inventory Discrepancy**: When selling through physical stores, Facebook pages, and websites simultaneously, stock counts get out of sync, leading to overselling or lost sales.
  - **Inefficient Checkout**: Traditional manual cash registers slow down transactions and lack barcode scanning or parked cart capabilities.
  - **Delivery Friction in Cambodia**: Standard e-commerce platforms fail to capture local Cambodian addresses (house numbers without street names, landmarks, or exact GPS pins for drivers).
  - **Lack of Real-Time Decision Support**: Business owners cannot track daily gross margins, net profit, and inventory turnover in real-time.

---

### Slide 3: Business Objectives & Scope

- **Slide Title**: Objectives of the MY STYLE MIS Platform
- **Key Talking Points**:
  - **Single Source of Truth**: Centralize product catalog, variants (Size, Color, SKU), and warehouse stock levels across all sales channels.
  - **High-Speed In-Store Operations**: Deploy an intuitive POS interface with barcode scanner support, dynamic variant picker, and held carts.
  - **Seamless Localized Shopping**: Provide Cambodian customers with instant ABA KHQR (Bakong) payment, COD options, and 1-Click Live GPS pinning.
  - **Automated Management Reporting**: Generate real-time financial statements (Sales, Profit, Purchases, Stock Audits) for data-driven management decisions.

---

### Slide 4: System Architecture (4-Tier Architecture)

- **Slide Title**: System Architecture & Data Flow
- **Key Talking Points**:
  - **Tier 1 — Central Backend API**: Express.js REST API on Node.js and TypeScript, connected to MongoDB with atomic transactions for inventory safety.
  - **Tier 2 — Admin Dashboard & POS**: Next.js 16 (Turbopack) with Ant Design and TanStack Query for high-speed store management.
  - **Tier 3 — Customer Web Storefront**: Next.js 16 with Tailwind CSS, offering an editorial lookbook and instant checkout.
  - **Tier 4 — Customer Mobile App**: Flutter (Dart) cross-platform mobile application for on-the-go browsing and order tracking.

---

### Slide 5: Technology Stack Justification

- **Slide Title**: Technology Stack Selection
- **Key Talking Points**:

| Component | Technology | Rationale / Academic Justification |
|---|---|---|
| Backend | Node.js, Express, TypeScript | Type safety, asynchronous non-blocking I/O for concurrent order processing |
| Database | MongoDB & Mongoose | Flexible document schema for multi-variant clothing products (Size, Color, SKU) |
| Frontend Admin | Next.js 16, Ant Design, React Query | Fast compilation with Turbopack, enterprise table grids, and optimistic UI caching |
| Web Storefront | Next.js 16, Tailwind CSS | High performance, responsive layout, SEO optimization |
| Mobile App | Flutter / Dart | Native compile performance, smooth 60fps animations on iOS and Android |
| Security | JWT (Access & Refresh), Argon2 / Bcrypt | Secure authentication, HTTP-only cookie refresh rotation |

---

### Slide 6: Core Feature 1 — E-Commerce & Cambodian Localization

- **Slide Title**: Localized E-Commerce Storefront
- **Key Talking Points**:
  - **Dual Delivery Destination**:
    - *Option 1 (Structured Address)*: Province/City selection, district, street, and home/work presets.
    - *Option 2 (Live GPS Pin)*: 1-Click HTML5 geolocation without expensive API keys, generating exact coordinates for couriers.
  - **Dual Currency Support**: Dynamic real-time calculation in USD ($) and Khmer Riel (៛) based on system exchange rate.
  - **Payment Rails**: Direct integration with ABA KHQR (Bakong standard) for instant verification and Cash on Delivery (COD) for flexible shopping.
  - **Order Tracking**: Customers can check status anytime using their invoice number or phone number.

---

### Slide 7: Core Feature 2 — Point of Sale (POS) & Inventory Automation

- **Slide Title**: In-Store POS & Variant Management
- **Key Talking Points**:
  - **Grouped Product View**: Eliminates duplicate visual clutter by consolidating variants into single product cards with a 1-click Variant Picker Modal.
  - **Hardware Barcode Integration**: Cashiers can scan physical garment barcodes (SKUs) to instantly add the exact variant to the active cart.
  - **Parked / Held Carts**: Ability to pause and hold multiple carts when a customer steps away, restoring it later without losing input.
  - **Real-Time Stock Decrement**: POS checkouts atomically decrement variant stock and record stock audit logs immediately.

---

### Slide 8: Core Feature 3 — Dispatch & Smart Waybill System

- **Slide Title**: Order Fulfillment & Driver Waybills
- **Key Talking Points**:
  - **Live Web Audio Chime & Notification Bell**: Alerts store staff instantly when an online order is placed via website or mobile app.
  - **Google Maps Integration**: Automatically extracts GPS coordinates from shipping addresses to render direct Google Maps links on the dashboard.
  - **Printable Courier Waybill**: Formatted delivery slip with product list, customer contact, and delivery route ready for Virak Buntham or J&T Express drivers.

---

### Slide 9: Core Feature 4 — MIS Business Reports & Financial Analytics

- **Slide Title**: Management Information & Analytics
- **Key Talking Points**:
  - **Sales Revenue Report**: Filterable by Day, Week, Month, Year, and Custom Date ranges.
  - **Gross & Net Profit Analysis**: Real-time formula: `Revenue - Cost of Goods Sold (COGS) - Discounts = Net Profit`.
  - **Inventory Turnover & Valuation**: Asset valuation calculation (`Sum(Quantity * Cost Price)`) and low-stock alerts.
  - **Top Selling Products**: Identifies top performers by volume and revenue to assist merchandising procurement.

---

### Slide 10: System Security & Role-Based Access Control (RBAC)

- **Slide Title**: Security Architecture & Access Control
- **Key Talking Points**:
  - **Role Hierarchy**:
    - `Admin`: Full access to Financial Statements, Supplier Management, User Roles, Settings, and System Audit Logs.
    - `Cashier`: Dedicated access to Point of Sale (POS), Sales processing, and Customer Registration.
    - `User / Customer`: Storefront browsing, cart, and self-service order tracking.
  - **Audit Logging**: Every sensitive operation (stock adjustments, cancellations, role changes) is recorded with timestamp and operator identity.

---

### Slide 11: Live Demonstration Plan

- **Slide Title**: Live System Demonstration
- **Key Talking Points**:
  - Announce transition to the live system walkthrough covering the 5-step end-to-end transaction cycle.

---

### Slide 12: Conclusion & Future Enhancements

- **Slide Title**: Conclusion & Future Roadmap
- **Key Talking Points**:
  - **Academic Summary**: Successfully built a fully operational, unified omni-channel MIS platform fulfilling all academic and business objectives.
  - **Future Roadmap**:
    - AI-based demand forecasting for seasonal fashion trends.
    - Automated Telegram / SMS order status notifications.
    - Multi-warehouse inventory synchronization for nationwide branches.
  - Open the floor for Questions & Answers.

---

## 3. Step-by-Step Live Demonstration Script (5 Minutes)

Follow this exact flow during your presentation to guarantee a seamless live demonstration:

### Step 1: Customer Online Order (Website Storefront)
1. Open the Storefront at `http://localhost:3002`.
2. Browse the Lookbook catalog and select `Denim Trucker Jacket`.
3. Choose Color: `Navy Blue`, Size: `XL`.
4. Click **Buy It Now** to open the Checkout Modal.
5. In Delivery Mode, select **Option 2 (Live GPS Pin)** to demonstrate automatic coordinate detection.
6. Select **ABA KHQR Payment** and click **Place Order & Pay**.
7. Point out the instant invoice generation (`INV-ONLINE-...`) and printable receipt.

### Step 2: Real-Time Store Notification (Admin Dashboard)
1. Switch window to Admin Dashboard at `http://localhost:3001`.
2. Notice the audible notification chime and the notification badge count on the top bar.
3. Click the **Notification Bell** to reveal the new online order with customer details and ABA KHQR badge.
4. Click the order item to navigate directly to the filtered order in the Sales Center.

### Step 3: Order Dispatch & Waybill Generation
1. In the Sales table, click to view order details.
2. Show the green **"Open Pinned Location on Google Maps"** link and click it to demonstrate how drivers find the customer.
3. Update fulfillment status to `Dispatched` and demonstrate the printed courier waybill slip.

### Step 4: In-Store POS Checkout
1. Click **POS** on the left navigation bar.
2. Demonstrate the **Group by Product** view (point out that products are clean and non-duplicate).
3. Click `Denim Trucker Jacket` to open the **Variant Selector Modal**.
4. Choose `L · Black ($200.00)` to add to cart.
5. Demonstrate the **Barcode Scanner** by typing a SKU (e.g., `MS-SHRT-L-BLK`) and pressing Enter.
6. Click **Pay with Cash / Card**, enter amount received, and click **Confirm Sale**.

### Step 5: Real-Time MIS Analytics & Profit Report
1. Navigate to **Reports -> Sales Report** and **Profit Report**.
2. Show the professors the updated daily revenue, gross profit calculation, and inventory audit logs.
3. Conclude the demonstration.

---

## 4. Anticipated Defense Questions & Winning Answers

### Question 1: "How does your system prevent overselling when an item is bought in the store and online at the same time?"
- **Answer**:
  "Our backend uses MongoDB atomic transactional operations. When a sale is processed (either through POS or Online Checkout), the system executes an atomic decrement on the specific variant's `quantity` field with a condition `quantity >= requestedQuantity`. If stock reaches zero, subsequent checkout attempts receive a 400 Bad Request error, guaranteeing data integrity without race conditions."

### Question 2: "Why did you choose a 4-tier omni-channel architecture instead of a single monolithic web app?"
- **Answer**:
  "In modern MIS design, decoupling concerns provides scalability and reliability. The central Backend API acts as a unified data gateway. The Admin Dashboard is optimized for desktop keyboard shortcuts and high-volume data tables using Ant Design. The Web Storefront is optimized for customer SEO and mobile responsiveness using Next.js and Tailwind CSS. The Flutter Mobile App provides native performance on smartphones. If one channel experiences high traffic, the others remain unaffected."

### Question 3: "How does your system handle Cambodian address formatting and delivery?"
- **Answer**:
  "Cambodian residential addresses often lack formal street numbers. We solved this by implementing a dual-mode delivery selector. Option 1 allows structured text entry with Province, Khan, and landmark notes. Option 2 utilizes HTML5 Geolocation to capture exact latitude and longitude coordinates. On the Admin dispatch center, these coordinates are converted into a 1-click Google Maps URL printed on courier waybills, allowing drivers to navigate directly via GPS."

### Question 4: "How are profits calculated in your financial reports?"
- **Answer**:
  "Each product variant carries both a `costPrice` (procurement expense from suppliers) and a `salePrice` (retail customer price). When an order is completed, the system calculates revenue, Cost of Goods Sold (COGS), discounts, and tax. The Gross Profit is computed as `Revenue - COGS`, and Net Profit accounts for discounts and operational returns, giving management an exact financial picture."
