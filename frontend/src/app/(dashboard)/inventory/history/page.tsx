'use client';

import React, { useState } from 'react';
import { Card, Input, Table, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { inventoryService } from '@/services/resources.service';
import type { Product, StockHistory } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { formatDateTime } from '@/utils/format';

export default function StockHistoryPage() {
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: queryKeys.inventory.history(), queryFn: () => inventoryService.history() });
  const filtered = (query.data || []).filter((item) => {
    const term = search.toLowerCase();
    return [item.variant?.sku || '', item.reference || '', item.reason || ''].some((value) => value.toLowerCase().includes(term));
  });
  if (query.isError) return <ErrorState title="Unable to load stock history" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  return (
    <PageContainer title="Stock History & Ledger" subtitle="Chronological, auditable inventory movements from sales, purchases, returns, and adjustments">
      <Card variant="borderless">
        <Input aria-label="Search stock history" placeholder="Search stock history by SKU or reference..." prefix={<SearchOutlined />} style={{ maxWidth: 380, marginBottom: 16 }} value={search} onChange={(event) => setSearch(event.target.value)} allowClear />
        <Table<StockHistory> rowKey="_id" loading={query.isLoading} dataSource={filtered} pagination={{ pageSize: 10 }} scroll={{ x: 950 }} columns={[
          { title: 'Date & Time', dataIndex: 'createdAt', render: formatDateTime },
          { title: 'SKU / Product', render: (_, item) => `${item.variant?.sku || '—'} — ${(item.variant?.product as Product)?.name || '—'}` },
          { title: 'Action', dataIndex: 'type', render: (value: string) => <Tag color={value === 'SALE' ? 'error' : value === 'PURCHASE' || value === 'RETURN' ? 'success' : 'gold'}>{value}</Tag> },
          { title: 'Before', dataIndex: 'previousStock' },
          { title: 'Change', dataIndex: 'change', render: (value: number) => <b>{value > 0 ? `+${value}` : value}</b> },
          { title: 'After', dataIndex: 'newStock' },
          { title: 'Reference', dataIndex: 'reference', render: (value?: string) => value || '—' },
          { title: 'User', render: (_, item) => item.user?.name || '—' },
        ]} />
      </Card>
    </PageContainer>
  );
}
