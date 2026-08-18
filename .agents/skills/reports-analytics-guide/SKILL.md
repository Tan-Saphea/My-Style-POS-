---
name: reports-analytics-guide
description: >-
  Standardized guide for implementing, maintaining, and extending Business Reports,
  Financial Statements, Data Visualizations, and MongoDB Aggregations in the system.
  Use this skill when modifying reporting APIs, financial calculations, date filtering,
  Recharts visualizations, or printing/exporting statements.
---

# Business Reports & Analytics Guide

This skill documents the architecture and standards for financial reporting, inventory asset valuation, data aggregation, and analytics visualizations in the **My Style** system.

---

## 📊 Business Reports Sitemap & Endpoints

| Report Name | Frontend Route | Backend Endpoint | Key Visualizations & Features |
| :--- | :--- | :--- | :--- |
| **Sales Performance** | `/reports/sales` | `GET /api/v1/reports/sales` | Revenue trend area chart, completed orders, order size, date filter, export |
| **Profit & Loss** | `/reports/profit` | `GET /api/v1/reports/profit` | Net sales, COGS cost basis, gross profit, margin %, P&L bar chart |
| **Purchase & Spend** | `/reports/purchases` | `GET /api/v1/reports/purchases` | Restocking spend, supplier order volume, vendor breakdown table |
| **Inventory Valuation**| `/reports/inventory` | `GET /api/v1/reports/inventory` | Stock asset cost value, retail value, potential margin, low stock alerts |
| **Best-Selling Products**| `/reports/top-products` | `GET /api/v1/reports/top-products` | Top 10 products horizontal bar chart, leaderboard table, Gold/Silver/Bronze badges |

---

## 🛠️ Implementation Standards

### 1. Date Range Filtering & TanStack Query Keys
All time-series reports accept `startDate` and `endDate` query parameters (in `YYYY-MM-DD` format).
When invoking `queryKeys.reports`, pass query parameters as a unified object to ensure correct cache invalidation:

```typescript
const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

const startDateStr = dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
const endDateStr = dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;

const query = useQuery({
  queryKey: queryKeys.reports.sales({ startDate: startDateStr, endDate: endDateStr }),
  queryFn: () => getReport<SalesReport[]>('sales', { startDate: startDateStr, endDate: endDateStr }),
});
```

---

### 2. Ant Design `<Statistic>` Styling
Use `styles={{ content: { ... } }}` instead of the deprecated `valueStyle` prop:

```tsx
<Statistic
  title="Total Sales Revenue"
  value={totalRevenue}
  prefix="$"
  precision={2}
  styles={{ content: { color: '#005a32', fontWeight: 700 } }}
/>
```

---

### 3. Recharts Visualizations & Color Tokens
Incorporate the official 4-tier brand palette for report charts:
* **Primary Deep Green (`#005a32`)**: Revenue trends, retail value bars, gross profit.
* **Emerald Accent (`#238b45`)**: Profit margins, positive growth indicators.
* **Secondary Purple (`#722ed1`)**: Supplier procurement spend.
* **Quaternary Pink / Orange (`#eb2f96` / `#fa8c16`)**: Best-selling products ranking, low stock warnings.

```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={reportsData}>
    <defs>
      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#005a32" stopOpacity={0.4} />
        <stop offset="95%" stopColor="#005a32" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
    <Area type="monotone" dataKey="revenue" stroke="#005a32" fill="url(#salesGradient)" strokeWidth={3} />
  </AreaChart>
</ResponsiveContainer>
```

---

### 4. Statement Printing & Exporting
Provide a clean print button using standard `window.print()` triggers for financial statement printouts:

```tsx
<Button icon={<PrinterOutlined />} onClick={() => window.print()}>
  Print / Export Statement
</Button>
```
