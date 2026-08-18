import { UserRole } from '@/types/auth';

// ============================================================
// Role-Based Access Control Constants
// 3 Primary Roles: ADMIN, CASHIER, USER
// ============================================================

/**
 * Menu/route permissions per role.
 * This controls UI visibility and feature accessibility.
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'dashboard',
    'products',
    'products.create',
    'products.edit',
    'categories',
    'sizes',
    'colors',
    'inventory',
    'inventory.low-stock',
    'inventory.adjustments',
    'inventory.history',
    'suppliers',
    'purchases',
    'purchases.create',
    'customers',
    'pos',
    'sales',
    'payments',
    'reports',
    'reports.sales',
    'reports.profit',
    'reports.purchases',
    'reports.inventory',
    'reports.top-products',
    'employees',
    'audit-logs',
    'settings',
    'profile',
  ],
  [UserRole.CASHIER]: [
    'dashboard',
    'products',
    'inventory',
    'customers',
    'pos',
    'sales',
    'payments',
    'profile',
  ],
  [UserRole.USER]: [
    'dashboard',
    'products',
    'inventory',
    'profile',
  ],
};

/**
 * Role display labels.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.CASHIER]: 'Cashier',
  [UserRole.USER]: 'User',
};

/**
 * Role tag colors for UI display.
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'purple',
  [UserRole.CASHIER]: 'green',
  [UserRole.USER]: 'blue',
};
