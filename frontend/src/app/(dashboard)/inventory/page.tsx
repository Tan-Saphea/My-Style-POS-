'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Input, Table, Tag, Button } from 'antd';
import { SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { inventoryService } from '@/services/resources.service';
import type { Product, ProductVariant } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/lib/store/auth';
import { UserRole } from '@/types/auth';

type InventoryRow = ProductVariant & { stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' };
const productOf = (row: ProductVariant) => row.product as Product;

export default function InventoryPage() {
  const canViewCost = useAuthStore((state) => state.role === UserRole.ADMIN);
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: queryKeys.inventory.all, queryFn: () => inventoryService.list() });
  const filtered = (query.data || []).filter((row) => {
    const term = search.toLowerCase();
    const product = productOf(row);
    return [row.sku, product?.name || '', row.size?.name || '', row.color?.name || ''].some((value) => value.toLowerCase().includes(term));
  }) as InventoryRow[];
  if (query.isError) return <ErrorState title="Unable to load inventory" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;

  return (
    <PageContainer title="Current Inventory" subtitle="Live stock quantities and values across all clothing variants" extra={<Link href={ROUTES.INVENTORY_LOW_STOCK}><Button danger icon={<WarningOutlined />}>View Low Stock</Button></Link>}>
      <Card variant="borderless">
        <Input aria-label="Search inventory" placeholder="Search by SKU, product, size, or color..." prefix={<SearchOutlined />} style={{ maxWidth: 380, marginBottom: 16 }} value={search} onChange={(event) => setSearch(event.target.value)} allowClear />
        <Table<InventoryRow>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
          columns={[
            { title: 'SKU', dataIndex: 'sku', render: (value: string) => <code>{value}</code> },
            { title: 'Product', render: (_, row) => productOf(row)?.name || '—' },
            { title: 'Size', render: (_, row) => row.size?.name || '—' },
            { title: 'Color', render: (_, row) => row.color?.name || '—' },
            ...(canViewCost ? [{ title: 'Cost', dataIndex: 'costPrice', render: (value: number) => `$${value.toFixed(2)}` }] : []),
            { title: 'Sale Price', dataIndex: 'salePrice', render: (value: number) => `$${value.toFixed(2)}` },
            { title: 'Current Stock', dataIndex: 'quantity', render: (value: number) => <b>{value}</b> },
            { title: 'Status', dataIndex: 'stockStatus', render: (value: InventoryRow['stockStatus']) => <Tag color={value === 'in_stock' ? 'success' : value === 'low_stock' ? 'warning' : 'error'}>{value.replaceAll('_', ' ').toUpperCase()}</Tag> },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
