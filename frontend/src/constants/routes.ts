import React from 'react';
import {
  DashboardOutlined,
  ShoppingOutlined,
  InboxOutlined,
  WarningOutlined,
  SwapOutlined,
  HistoryOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  FileAddOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined,
  UserOutlined,
  SafetyOutlined,
  AuditOutlined,
  SettingOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

// ============================================================
// Route Path Constants
// ============================================================

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',

  // Products
  PRODUCTS: '/products',
  PRODUCTS_CREATE: '/products/create',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_EDIT: (id: string) => `/products/${id}/edit`,

  // Master data
  CATEGORIES: '/categories',
  SIZES: '/sizes',
  COLORS: '/colors',

  // Inventory
  INVENTORY: '/inventory',
  INVENTORY_LOW_STOCK: '/inventory/low-stock',
  INVENTORY_ADJUSTMENTS: '/inventory/adjustments',
  INVENTORY_HISTORY: '/inventory/history',

  // Suppliers
  SUPPLIERS: '/suppliers',

  // Purchases
  PURCHASES: '/purchases',
  PURCHASES_CREATE: '/purchases/create',
  PURCHASE_DETAIL: (id: string) => `/purchases/${id}`,

  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: (id: string) => `/customers/${id}`,

  // POS & Sales
  POS: '/pos',
  SALES: '/sales',
  SALE_DETAIL: (id: string) => `/sales/${id}`,

  // Payments
  PAYMENTS: '/payments',

  // Reports
  REPORTS: '/reports',
  REPORTS_SALES: '/reports/sales',
  REPORTS_PROFIT: '/reports/profit',
  REPORTS_PURCHASES: '/reports/purchases',
  REPORTS_INVENTORY: '/reports/inventory',
  REPORTS_TOP_PRODUCTS: '/reports/top-products',

  // Administration
  EMPLOYEES: '/employees',
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',

  // Profile
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/change-password',

  // Error pages
  FORBIDDEN: '/403',
} as const;

// ============================================================
// Sidebar Menu Structure
// Each item has a permission key to filter by role
// ============================================================

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  permission?: string;
  children?: MenuItem[];
}

export const SIDEBAR_MENU: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: React.createElement(DashboardOutlined),
    path: ROUTES.DASHBOARD,
    permission: 'dashboard',
  },
  {
    key: 'products-group',
    label: 'Products',
    icon: React.createElement(ShoppingOutlined),
    permission: 'products',
    children: [
      {
        key: 'products',
        label: 'Product List',
        path: ROUTES.PRODUCTS,
        permission: 'products',
      },
      {
        key: 'products-create',
        label: 'Add Product',
        path: ROUTES.PRODUCTS_CREATE,
        permission: 'products.create',
      },
      {
        key: 'categories',
        label: 'Categories',
        path: ROUTES.CATEGORIES,
        permission: 'categories',
      },
      {
        key: 'sizes',
        label: 'Sizes',
        path: ROUTES.SIZES,
        permission: 'sizes',
      },
      {
        key: 'colors',
        label: 'Colors',
        path: ROUTES.COLORS,
        permission: 'colors',
      },
    ],
  },
  {
    key: 'inventory-group',
    label: 'Inventory',
    icon: React.createElement(InboxOutlined),
    permission: 'inventory',
    children: [
      {
        key: 'inventory',
        label: 'Current Stock',
        icon: React.createElement(InboxOutlined),
        path: ROUTES.INVENTORY,
        permission: 'inventory',
      },
      {
        key: 'low-stock',
        label: 'Low Stock',
        icon: React.createElement(WarningOutlined),
        path: ROUTES.INVENTORY_LOW_STOCK,
        permission: 'inventory.low-stock',
      },
      {
        key: 'adjustments',
        label: 'Stock Adjustment',
        icon: React.createElement(SwapOutlined),
        path: ROUTES.INVENTORY_ADJUSTMENTS,
        permission: 'inventory.adjustments',
      },
      {
        key: 'stock-history',
        label: 'Stock History',
        icon: React.createElement(HistoryOutlined),
        path: ROUTES.INVENTORY_HISTORY,
        permission: 'inventory.history',
      },
    ],
  },
  {
    key: 'purchases-group',
    label: 'Purchases',
    icon: React.createElement(ShopOutlined),
    permission: 'purchases',
    children: [
      {
        key: 'purchases',
        label: 'Purchase List',
        path: ROUTES.PURCHASES,
        permission: 'purchases',
      },
      {
        key: 'purchases-create',
        label: 'New Purchase',
        icon: React.createElement(FileAddOutlined),
        path: ROUTES.PURCHASES_CREATE,
        permission: 'purchases.create',
      },
      {
        key: 'suppliers',
        label: 'Suppliers',
        icon: React.createElement(ShopOutlined),
        path: ROUTES.SUPPLIERS,
        permission: 'suppliers',
      },
    ],
  },
  {
    key: 'sales-group',
    label: 'Sales',
    icon: React.createElement(ShoppingCartOutlined),
    permission: 'pos',
    children: [
      {
        key: 'pos',
        label: 'POS',
        icon: React.createElement(CreditCardOutlined),
        path: ROUTES.POS,
        permission: 'pos',
      },
      {
        key: 'sales',
        label: 'Sales & Online Orders',
        path: ROUTES.SALES,
        permission: 'sales',
      },
      {
        key: 'customers',
        label: 'Customers',
        icon: React.createElement(TeamOutlined),
        path: ROUTES.CUSTOMERS,
        permission: 'customers',
      },
    ],
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: React.createElement(DollarOutlined),
    path: ROUTES.PAYMENTS,
    permission: 'payments',
  },
  {
    key: 'reports-group',
    label: 'Reports',
    icon: React.createElement(BarChartOutlined),
    permission: 'reports',
    children: [
      {
        key: 'reports-sales',
        label: 'Sales Report',
        path: ROUTES.REPORTS_SALES,
        permission: 'reports.sales',
      },
      {
        key: 'reports-profit',
        label: 'Profit Report',
        path: ROUTES.REPORTS_PROFIT,
        permission: 'reports.profit',
      },
      {
        key: 'reports-purchases',
        label: 'Purchase Report',
        path: ROUTES.REPORTS_PURCHASES,
        permission: 'reports.purchases',
      },
      {
        key: 'reports-inventory',
        label: 'Inventory Report',
        path: ROUTES.REPORTS_INVENTORY,
        permission: 'reports.inventory',
      },
      {
        key: 'reports-top-products',
        label: 'Best Selling',
        path: ROUTES.REPORTS_TOP_PRODUCTS,
        permission: 'reports.top-products',
      },
    ],
  },
  {
    key: 'admin-group',
    label: 'Administration',
    icon: React.createElement(SafetyOutlined),
    permission: 'employees',
    children: [
      {
        key: 'employees',
        label: 'Employees',
        icon: React.createElement(UserOutlined),
        path: ROUTES.EMPLOYEES,
        permission: 'employees',
      },
      {
        key: 'audit-logs',
        label: 'Audit Logs',
        icon: React.createElement(AuditOutlined),
        path: ROUTES.AUDIT_LOGS,
        permission: 'audit-logs',
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: React.createElement(SettingOutlined),
        path: ROUTES.SETTINGS,
        permission: 'settings',
      },
    ],
  },
];

/**
 * Map from route path to breadcrumb label.
 */
export const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/products/create': 'Add Product',
  '/categories': 'Categories',
  '/sizes': 'Sizes',
  '/colors': 'Colors',
  '/inventory': 'Inventory',
  '/inventory/low-stock': 'Low Stock',
  '/inventory/adjustments': 'Stock Adjustment',
  '/inventory/history': 'Stock History',
  '/suppliers': 'Suppliers',
  '/purchases': 'Purchases',
  '/purchases/create': 'New Purchase',
  '/customers': 'Customers',
  '/pos': 'POS',
  '/sales': 'Sales',
  '/payments': 'Payments',
  '/reports': 'Reports',
  '/reports/sales': 'Sales Report',
  '/reports/profit': 'Profit Report',
  '/reports/purchases': 'Purchase Report',
  '/reports/inventory': 'Inventory Report',
  '/reports/top-products': 'Best Selling Products',
  '/employees': 'Employees',
  '/audit-logs': 'Audit Logs',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/change-password': 'Change Password',
};
