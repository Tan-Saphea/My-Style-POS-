import { QueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api/error-handler';

// ============================================================
// TanStack Query Client Configuration
// ============================================================

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,     // 5 minutes
        gcTime: 10 * 60 * 1000,       // 10 minutes (garbage collection)
        retry: 1,                      // Retry once on failure
        refetchOnWindowFocus: false,   // Don't refetch when tab regains focus
        refetchOnReconnect: true,      // Refetch when network reconnects
      },
      mutations: {
        retry: 0,                      // Don't retry mutations
        onError: (error) => {
          // Global mutation error handler
          // Individual components can override this
          const message = getErrorMessage(error);
          console.error('Mutation error:', message);
        },
      },
    },
  });
}

/**
 * Standard query key factories for consistent cache management.
 * Usage: queryKeys.products.list({ page: 1, search: 'shirt' })
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params?: Record<string, unknown>) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (params?: Record<string, unknown>) => ['categories', 'list', params] as const,
  },
  sizes: {
    all: ['sizes'] as const,
    list: (params?: Record<string, unknown>) => ['sizes', 'list', params] as const,
  },
  colors: {
    all: ['colors'] as const,
    list: (params?: Record<string, unknown>) => ['colors', 'list', params] as const,
  },
  suppliers: {
    all: ['suppliers'] as const,
    list: (params?: Record<string, unknown>) => ['suppliers', 'list', params] as const,
    detail: (id: string) => ['suppliers', 'detail', id] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (params?: Record<string, unknown>) => ['customers', 'list', params] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: (params?: Record<string, unknown>) => ['inventory', 'list', params] as const,
    lowStock: ['inventory', 'low-stock'] as const,
    history: (params?: Record<string, unknown>) => ['inventory', 'history', params] as const,
  },
  purchases: {
    all: ['purchases'] as const,
    list: (params?: Record<string, unknown>) => ['purchases', 'list', params] as const,
    detail: (id: string) => ['purchases', 'detail', id] as const,
  },
  sales: {
    all: ['sales'] as const,
    list: (params?: Record<string, unknown>) => ['sales', 'list', params] as const,
    detail: (id: string) => ['sales', 'detail', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    list: (params?: Record<string, unknown>) => ['payments', 'list', params] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: (params?: Record<string, unknown>) => ['employees', 'list', params] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
  settings: ['settings'] as const,
  reports: {
    sales: (params?: Record<string, unknown>) => ['reports', 'sales', params] as const,
    profit: (params?: Record<string, unknown>) => ['reports', 'profit', params] as const,
    purchases: (params?: Record<string, unknown>) => ['reports', 'purchases', params] as const,
    inventory: ['reports', 'inventory'] as const,
    topProducts: (params?: Record<string, unknown>) => ['reports', 'top-products', params] as const,
  },
  auditLogs: {
    list: (params?: Record<string, unknown>) => ['audit-logs', 'list', params] as const,
  },
} as const;
