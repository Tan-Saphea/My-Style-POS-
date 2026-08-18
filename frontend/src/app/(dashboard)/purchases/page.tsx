'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { App, Button, Card, Descriptions, Input, Modal, Popconfirm, Space, Table, Tag } from 'antd';
import { CheckOutlined, CloseCircleOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { purchaseService } from '@/services/resources.service';
import type { Purchase } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';

export default function PurchasesPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Purchase | null>(null);
  const query = useQuery({ queryKey: queryKeys.purchases.all, queryFn: () => purchaseService.list() });
  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock }),
    ]);
  };
  const receive = useMutation({ mutationFn: purchaseService.receive, onSuccess: async () => { await refreshAll(); message.success('Purchase received and inventory updated'); }, onError: (error) => message.error(getErrorMessage(error)) });
  const cancel = useMutation({ mutationFn: purchaseService.cancel, onSuccess: async () => { await refreshAll(); message.success('Purchase order cancelled'); }, onError: (error) => message.error(getErrorMessage(error)) });
  const remove = useMutation({ mutationFn: purchaseService.remove, onSuccess: async () => { await refreshAll(); message.success('Draft purchase deleted'); }, onError: (error) => message.error(getErrorMessage(error)) });
  const filtered = (query.data || []).filter((item) => {
    const term = search.toLowerCase();
    return item.purchaseNumber.toLowerCase().includes(term) || item.supplier?.name.toLowerCase().includes(term);
  });
  if (query.isError) return <ErrorState title="Unable to load purchases" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  return (
    <PageContainer title="Purchase Orders" subtitle="Manage supplier orders and receive stock exactly once" extra={<Link href={ROUTES.PURCHASES_CREATE}><Button type="primary" icon={<PlusOutlined />}>New Purchase</Button></Link>}>
      <Card variant="borderless">
        <Input aria-label="Search purchases" placeholder="Search by PO number or supplier..." prefix={<SearchOutlined />} style={{ maxWidth: 360, marginBottom: 16 }} value={search} onChange={(event) => setSearch(event.target.value)} allowClear />
        <Table<Purchase> rowKey="_id" loading={query.isLoading} dataSource={filtered} pagination={{ pageSize: 10 }} scroll={{ x: 950 }} columns={[
          { title: 'PO Number', dataIndex: 'purchaseNumber', render: (value: string) => <b>{value}</b> },
          { title: 'Date', dataIndex: 'purchaseDate', render: formatDate },
          { title: 'Supplier', dataIndex: 'supplier', render: (supplier: Purchase['supplier']) => supplier?.name || '—' },
          { title: 'Total Items', dataIndex: 'items', render: (items: Purchase['items']) => items.reduce((sum, item) => sum + item.quantity, 0) },
          { title: 'Total Cost', dataIndex: 'total', render: (value: number) => `$${value.toFixed(2)}` },
          { title: 'Status', dataIndex: 'status', render: (value: string) => <Tag color={value === 'received' ? 'success' : value === 'ordered' ? 'processing' : value === 'cancelled' ? 'error' : 'default'}>{value.toUpperCase()}</Tag> },
          { title: 'Actions', fixed: 'right', render: (_, item) => <Space>
            <Button aria-label={`View ${item.purchaseNumber}`} size="small" icon={<EyeOutlined />} onClick={() => setSelected(item)} />
            {item.status === 'ordered' && <Popconfirm title="Receive Purchase" description="This permanently adds every line quantity to inventory. Continue?" onConfirm={() => receive.mutate(item._id)}><Button aria-label={`Receive ${item.purchaseNumber}`} size="small" type="primary" icon={<CheckOutlined />}>Receive</Button></Popconfirm>}
            {['draft', 'ordered'].includes(item.status) && <Popconfirm title="Cancel Purchase" onConfirm={() => cancel.mutate(item._id)} okButtonProps={{ danger: true }}><Button aria-label={`Cancel ${item.purchaseNumber}`} size="small" danger icon={<CloseCircleOutlined />} /></Popconfirm>}
            {item.status === 'draft' && <Popconfirm title="Delete Draft" onConfirm={() => remove.mutate(item._id)} okButtonProps={{ danger: true }}><Button aria-label={`Delete ${item.purchaseNumber}`} size="small" danger icon={<DeleteOutlined />} /></Popconfirm>}
          </Space> },
        ]} />
      </Card>
      <Modal title={selected?.purchaseNumber || 'Purchase Details'} open={Boolean(selected)} onCancel={() => setSelected(null)} footer={<Button onClick={() => setSelected(null)}>Close</Button>} width={720}>
        {selected && <><Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} items={[{ key: 'supplier', label: 'Supplier', children: selected.supplier?.name }, { key: 'status', label: 'Status', children: selected.status.toUpperCase() }, { key: 'date', label: 'Order Date', children: formatDate(selected.purchaseDate) }, { key: 'total', label: 'Total', children: `$${selected.total.toFixed(2)}` }]} /><Table rowKey={(item) => item.sku} size="small" pagination={false} style={{ marginTop: 16 }} dataSource={selected.items} columns={[{ title: 'SKU', dataIndex: 'sku' }, { title: 'Product', dataIndex: 'productName' }, { title: 'Qty', dataIndex: 'quantity' }, { title: 'Unit Cost', dataIndex: 'costPrice', render: (value: number) => `$${value.toFixed(2)}` }, { title: 'Subtotal', dataIndex: 'subtotal', render: (value: number) => `$${value.toFixed(2)}` }]} /></>}
      </Modal>
    </PageContainer>
  );
}
