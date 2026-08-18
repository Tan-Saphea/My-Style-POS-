import apiClient from '@/lib/api/client';
import { Product, ProductAudience } from '@/types/models';

export interface ProductPayload {
  name: string;
  brand?: string;
  description?: string;
  category: string;
  audience?: ProductAudience;
  images?: string[];
  status?: 'active' | 'inactive';
  variants: Array<{
    _id?: string;
    size: string;
    color: string;
    sku: string;
    barcode?: string;
    costPrice: number;
    salePrice: number;
    quantity: number;
    lowStockLevel: number;
    image?: string;
  }>;
}

export const productService = {
  async getProducts(params?: { category?: string; search?: string; status?: 'active' | 'inactive' }): Promise<Product[]> {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
        )
      : undefined;
    const response = await apiClient.get('/products', { params: cleanParams });
    return response.data?.data || [];
  },

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data?.data;
  },

  async createProduct(payload: ProductPayload): Promise<Product> {
    const response = await apiClient.post('/products', payload);
    return response.data?.data;
  },

  async updateProduct(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    const response = await apiClient.put(`/products/${id}`, payload);
    return response.data?.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
