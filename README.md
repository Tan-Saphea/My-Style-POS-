# Clothing Sales Management System

Full-stack clothing retail management system with authenticated role-based access, catalog and master-data CRUD, live inventory, purchase receiving, POS sales, payment records, audit logs, dashboards, and reports.

## Requirements

- Node.js 20 or newer
- MongoDB replica set (required for atomic sales, stock movements, and purchase receiving)
- npm

The included `docker-compose.yml` starts an isolated development replica set on port `27029`:

```bash
docker compose up -d mongo mongo-init
```

Use this backend URI:

```text
mongodb://127.0.0.1:27029/clothing_sales_db?replicaSet=rs0
```

## Run locally

1. **Backend API (`backend/`)**:
   - `cd backend && npm run dev` (Runs on `http://localhost:5001`)
2. **Frontend Admin (`frontend/`)**:
   - `cd frontend && npm run dev` (Runs on `http://localhost:3000`)
3. **Customer Website (`website/`)**:
   - `cd website && npm run dev` (Runs on `http://localhost:3001`)
4. **Flutter Mobile App (`mobile/`)**:
   - `cd mobile && flutter run` (Runs on iOS / Android / macOS / Web)

Demo seed accounts for Admin POS are `admin/admin123`, `cashier/cashier123`, and `user/user123`.

## Verification

```bash
# Backend TypeScript & Build
cd backend && npm run build

# Frontend Admin TypeScript
cd ../frontend && npx tsc --noEmit

# Customer Website TypeScript
cd ../website && npx tsc --noEmit

# Flutter Mobile Analysis & Tests
cd ../mobile && flutter analyze && flutter test
```

Warning: `npm run seed` clears the application collections in the configured database before inserting demo data.
