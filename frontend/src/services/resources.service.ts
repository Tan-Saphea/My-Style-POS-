import apiClient from '@/lib/api/client';
import type {
  AuditLog,
  Color,
  Customer,
  Payment,
  ProductVariant,
  Purchase,
  Sale,
  Size,
  StockHistory,
  Supplier,
  StoreSettings,
} from '@/types/models';
import type { User } from '@/types/auth';
import type { DashboardData } from '@/types/models';

function crudService<T, TPayload>(base: string) {
  return {
    async list(params?: Record<string, unknown>): Promise<T[]> {
      const response = await apiClient.get(base, { params });
      return response.data?.data || [];
    },
    async create(payload: TPayload): Promise<T> {
      const response = await apiClient.post(base, payload);
      return response.data.data;
    },
    async update(id: string, payload: Partial<TPayload>): Promise<T> {
      const response = await apiClient.put(`${base}/${id}`, payload);
      return response.data.data;
    },
    async remove(id: string): Promise<void> {
      await apiClient.delete(`${base}/${id}`);
    },
  };
}

export type SizePayload = Pick<Size, 'name'> & Partial<Pick<Size, 'description' | 'sortOrder' | 'status'>>;
export type ColorPayload = Pick<Color, 'name' | 'hexCode'> & Partial<Pick<Color, 'description' | 'status'>>;
export type CustomerPayload = Pick<Customer, 'name'> & Partial<Pick<Customer, 'gender' | 'phone' | 'email' | 'address' | 'status'>>;
export type SupplierPayload = Pick<Supplier, 'name'> & Partial<Pick<Supplier, 'contactPerson' | 'phone' | 'email' | 'address' | 'status'>>;
export type EmployeePayload = Pick<User, 'name' | 'username' | 'email' | 'role'> &
  Partial<Pick<User, 'phone' | 'gender' | 'position' | 'status'>> & { password?: string };

export const sizeService = crudService<Size, SizePayload>('/sizes');
export const colorService = crudService<Color, ColorPayload>('/colors');
export const customerService = crudService<Customer, CustomerPayload>('/customers');
export const supplierService = crudService<Supplier, SupplierPayload>('/suppliers');
export const employeeService = crudService<User, EmployeePayload>('/users');

export const salesService = {
  async list(params?: Record<string, unknown>): Promise<Sale[]> {
    const response = await apiClient.get('/sales', { params });
    return response.data.data || [];
  },
  async create(payload: Record<string, unknown>): Promise<Sale> {
    const response = await apiClient.post('/sales', payload);
    return response.data.data;
  },
  async updateDelivery(
    id: string,
    payload: {
      fulfillmentStatus?: string;
      deliveryCarrier?: string;
      trackingNumber?: string;
      notes?: string;
    }
  ): Promise<Sale> {
    const response = await apiClient.patch(`/sales/${id}/delivery`, payload);
    return response.data.data;
  },
  async cancel(id: string): Promise<Sale> {
    const response = await apiClient.patch(`/sales/${id}/cancel`);
    return response.data.data;
  },
};

export interface PurchasePayload {
  supplierId: string;
  purchaseDate?: string;
  items: Array<{ variantId: string; quantity: number; costPrice: number }>;
  discount?: number;
  status?: 'draft' | 'ordered';
  notes?: string;
}

export const purchaseService = {
  ...crudService<Purchase, PurchasePayload>('/purchases'),
  async receive(id: string): Promise<Purchase> {
    const response = await apiClient.patch(`/purchases/${id}/receive`);
    return response.data.data;
  },
  async cancel(id: string): Promise<Purchase> {
    const response = await apiClient.patch(`/purchases/${id}/cancel`);
    return response.data.data;
  },
};

export const inventoryService = {
  async list(params?: Record<string, unknown>): Promise<ProductVariant[]> {
    const response = await apiClient.get('/inventory', { params });
    return response.data.data || [];
  },
  async lowStock(): Promise<ProductVariant[]> {
    const response = await apiClient.get('/inventory/low-stock');
    return response.data.data || [];
  },
  async history(params?: Record<string, unknown>): Promise<StockHistory[]> {
    const response = await apiClient.get('/inventory/history', { params });
    return response.data.data || [];
  },
  async adjust(payload: { variantId: string; change: number; reason: string; type: string }) {
    const response = await apiClient.post('/inventory/adjustments', payload);
    return response.data.data;
  },
};

export async function getPayments(params?: Record<string, unknown>): Promise<Payment[]> {
  const response = await apiClient.get('/payments', { params });
  return response.data.data || [];
}

export async function getAuditLogs(params?: Record<string, unknown>): Promise<AuditLog[]> {
  const response = await apiClient.get('/audit-logs', { params });
  return response.data.data || [];
}

export async function getDashboard(): Promise<DashboardData> {
  const response = await apiClient.get('/dashboard/stats');
  return response.data.data;
}

export async function getReport<T>(name: 'sales' | 'profit' | 'purchases' | 'inventory' | 'top-products', params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get(`/reports/${name}`, { params });
  return response.data.data;
}

export async function getSettings(): Promise<StoreSettings> {
  const response = await apiClient.get('/settings');
  return response.data.data;
}

export async function updateSettings(payload: Pick<StoreSettings, 'storeName' | 'currency' | 'taxRate' | 'receiptNote'>): Promise<StoreSettings> {
  const response = await apiClient.put('/settings', payload);
  return response.data.data;
}
