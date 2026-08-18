'use client';

import React from 'react';
import Link from 'next/link';
import { Alert, Button, Card, Table } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { inventoryService } from '@/services/resources.service';
import type { Product, ProductVariant } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { ROUTES } from '@/constants/routes';

export default function LowStockPage() {
  const query = useQuery({ queryKey: queryKeys.inventory.lowStock, queryFn: inventoryService.lowStock });
  if (query.isError) return <ErrorState title="Unable to load low-stock items" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  return (
    <PageContainer title="Low Stock Alerts" subtitle="Variants at or below their configured safety threshold" extra={<Link href={ROUTES.INVENTORY}><Button icon={<ArrowLeftOutlined />}>Back to Inventory</Button></Link>}>
      <Alert title={`${query.data?.length || 0} variant(s) require attention`} description="Create a purchase order or adjust the stock count after a verified physical recount." type={(query.data?.length || 0) > 0 ? 'warning' : 'success'} showIcon style={{ marginBottom: 16 }} />
      <Card variant="borderless">
        <Table<ProductVariant> rowKey="_id" loading={query.isLoading} dataSource={query.data || []} pagination={{ pageSize: 10 }} columns={[
          { title: 'SKU', dataIndex: 'sku', render: (value: string) => <code>{value}</code> },
          { title: 'Product', render: (_, row) => (row.product as Product)?.name || '—' },
          { title: 'Variant', render: (_, row) => `${row.size?.name || '—'} / ${row.color?.name || '—'}` },
          { title: 'Current Stock', dataIndex: 'quantity', render: (value: number) => <b style={{ color: '#cf1322' }}>{value}</b> },
          { title: 'Threshold', dataIndex: 'lowStockLevel' },
          { title: 'Action', render: () => <Link href={ROUTES.PURCHASES_CREATE}><Button size="small" type="primary" icon={<ShoppingCartOutlined />}>Reorder</Button></Link> },
        ]} />
      </Card>
    </PageContainer>
  );
}
