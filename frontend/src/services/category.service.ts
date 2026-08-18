import apiClient from '@/lib/api/client';
import { Category } from '@/types/models';

export interface CategoryPayload {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/categories');
    return response.data?.data || [];
  },

  async createCategory(payload: CategoryPayload): Promise<Category> {
    const response = await apiClient.post('/categories', payload);
    return response.data?.data;
  },

  async updateCategory(id: string, payload: CategoryPayload): Promise<Category> {
    const response = await apiClient.put(`/categories/${id}`, payload);
    return response.data?.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
