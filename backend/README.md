# Clothing Sales Management API

Express, TypeScript, Mongoose, Zod, JWT, and role-based authorization API for the Clothing Sales Management System.

## Important database requirement

MongoDB must run as a replica set. Sales, sale cancellation, product creation/deletion, inventory adjustments, and purchase receiving use multi-document transactions. A standalone MongoDB server is not a safe production configuration for this application.

Example development URI:

```text
mongodb://127.0.0.1:27029/clothing_sales_db?replicaSet=rs0
```

## Commands

```bash
npm install
npm run typecheck
npm run build
npm run dev
npm run seed
SMOKE_API_URL=http://127.0.0.1:5001/api/v1 npm run smoke
```

`npm run seed` is destructive for the configured application database. It recreates demo users, settings, master data, products, inventory, customers, suppliers, and a sample sale.

## API modules

- Authentication: login, refresh, logout, profile, password change
- Master data: categories, sizes, colors, customers, suppliers, employees
- Catalog: products and size/color variants
- Inventory: current stock, low-stock alerts, adjustments, immutable history
- Purchasing: draft/ordered purchase CRUD, cancellation, one-time receiving
- Sales: POS checkout, history, detail, administrator cancellation
- Finance and control: payments, dashboard, settings, reports, audit log

The API calculates prices, tax, discounts, totals, historical cost, invoice numbers, and stock changes on the server. Clients cannot supply authoritative totals.
