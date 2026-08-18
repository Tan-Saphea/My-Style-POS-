import { UserRole } from '@/types/auth';
import { ROLE_PERMISSIONS } from '@/constants/roles';

// ============================================================
// Permission Utilities
// Frontend-only — backend enforces real authorization
// ============================================================

/**
 * Check if a role has a specific permission.
 * This is for UI display only, not security.
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Check if a role can access a specific route path.
 * Maps route paths to permission keys.
 */
export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  // Route-to-permission mapping
  const routePermissionMap: Record<string, string> = {
    '/dashboard': 'dashboard',
    '/products': 'products',
    '/products/create': 'products.create',
    '/categories': 'categories',
    '/sizes': 'sizes',
    '/colors': 'colors',
    '/inventory': 'inventory',
    '/inventory/low-stock': 'inventory.low-stock',
    '/inventory/adjustments': 'inventory.adjustments',
    '/inventory/history': 'inventory.history',
    '/suppliers': 'suppliers',
    '/purchases': 'purchases',
    '/purchases/create': 'purchases.create',
    '/customers': 'customers',
    '/pos': 'pos',
    '/sales': 'sales',
    '/payments': 'payments',
    '/reports': 'reports',
    '/reports/sales': 'reports.sales',
    '/reports/profit': 'reports.profit',
    '/reports/purchases': 'reports.purchases',
    '/reports/inventory': 'reports.inventory',
    '/reports/top-products': 'reports.top-products',
    '/employees': 'employees',
    '/audit-logs': 'audit-logs',
    '/settings': 'settings',
    '/profile': 'profile',
    '/change-password': 'profile',
  };

  // Direct match
  const permission = routePermissionMap[pathname];
  if (permission) {
    return permissions.includes(permission);
  }

  // Dynamic route matching (e.g., /products/[id], /products/[id]/edit)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 1) {
    const basePermission = routePermissionMap[`/${segments[0]}`];
    if (basePermission) {
      return permissions.includes(basePermission);
    }
  }

  // Default: allow access (let backend enforce)
  return true;
}

/**
 * Check if a role is admin.
 */
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if a role can view cost/profit information.
 * Cashiers should not see cost prices or profit margins.
 */
export function canViewCostInfo(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}
