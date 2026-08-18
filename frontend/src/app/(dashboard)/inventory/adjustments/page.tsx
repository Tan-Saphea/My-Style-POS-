'use client';

import React, { useState } from 'react';
import { App, Button, Card, Form, Input, InputNumber, Modal, Select, Table, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { inventoryService } from '@/services/resources.service';
import type { Product, StockHistory } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { formatDateTime } from '@/utils/format';

interface AdjustmentForm {
  variantId: string;
  type: 'ADJUSTMENT' | 'DAMAGED' | 'LOST' | 'RETURN';
  change: number;
  reason: string;
}

export default function StockAdjustmentsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<AdjustmentForm>();
  const history = useQuery({ queryKey: queryKeys.inventory.history({ adjustments: true }), queryFn: () => inventoryService.history() });
  const inventory = useQuery({ queryKey: queryKeys.inventory.all, queryFn: () => inventoryService.list(), enabled: open });
  const adjust = useMutation({
    mutationFn: inventoryService.adjust,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
        queryClient.invalidateQueries({ queryKey: ['inventory', 'history'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock }),
      ]);
      message.success('Stock adjusted successfully');
      setOpen(false);
      form.resetFields();
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });
  const adjustments = (history.data || []).filter((item) => ['ADJUSTMENT', 'DAMAGED', 'LOST', 'RETURN'].includes(item.type)).filter((item) => {
    const term = search.toLowerCase();
    return [item.variant?.sku || '', item.reason || '', item.reference || ''].some((value) => value.toLowerCase().includes(term));
  });
  if (history.isError) return <ErrorState title="Unable to load adjustments" message={getErrorMessage(history.error)} onRetry={() => void history.refetch()} />;

  const openCreate = () => {
    setOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({ type: 'ADJUSTMENT' });
    }, 0);
  };

  return (
    <PageContainer title="Stock Adjustments" subtitle="Verified manual corrections with a permanent stock ledger entry" extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Adjustment</Button>}>
      <Card variant="borderless">
        <Input aria-label="Search stock adjustments" placeholder="Search adjustments..." prefix={<SearchOutlined />} style={{ maxWidth: 340, marginBottom: 16 }} value={search} onChange={(event) => setSearch(event.target.value)} allowClear />
        <Table<StockHistory> rowKey="_id" loading={history.isLoading} dataSource={adjustments} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} columns={[
          { title: 'Date', dataIndex: 'createdAt', render: formatDateTime },
          { title: 'SKU / Product', render: (_, item) => `${item.variant?.sku || '—'} — ${(item.variant?.product as Product)?.name || '—'}` },
          { title: 'Type', dataIndex: 'type', render: (value: string) => <Tag color={value === 'DAMAGED' || value === 'LOST' ? 'error' : value === 'RETURN' ? 'success' : 'blue'}>{value}</Tag> },
          { title: 'Change', dataIndex: 'change', render: (value: number) => <b style={{ color: value > 0 ? '#389e0d' : '#cf1322' }}>{value > 0 ? `+${value}` : value}</b> },
          { title: 'Balance', dataIndex: 'newStock' },
          { title: 'Reason', dataIndex: 'reason' },
          { title: 'Adjusted By', render: (_, item) => item.user?.name || '—' },
        ]} />
      </Card>
      <Modal title="New Stock Adjustment" open={open} onOk={() => form.submit()} onCancel={() => setOpen(false)} confirmLoading={adjust.isPending} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={(values) => adjust.mutate(values)}>
          <Form.Item label="Product Variant" name="variantId" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" loading={inventory.isLoading} options={(inventory.data || []).map((item) => ({ value: item._id, label: `${item.sku} — ${(item.product as Product)?.name || ''} (${item.quantity} in stock)` }))} /></Form.Item>
          <Form.Item label="Adjustment Type" name="type" rules={[{ required: true }]}><Select options={[{ value: 'ADJUSTMENT', label: 'Physical count correction' }, { value: 'DAMAGED', label: 'Damaged stock' }, { value: 'LOST', label: 'Lost stock' }, { value: 'RETURN', label: 'Customer/supplier return' }]} /></Form.Item>
          <Form.Item label="Quantity Change" name="change" dependencies={['type']} rules={[
            { required: true, message: 'Enter a non-zero stock change' },
            ({ getFieldValue }) => ({ validator: (_, value) => {
              if (!Number.isInteger(value) || value === 0) return Promise.reject(new Error('Use a non-zero whole number'));
              if (['DAMAGED', 'LOST'].includes(getFieldValue('type')) && value > 0) return Promise.reject(new Error('Damaged and lost adjustments must be negative'));
              return Promise.resolve();
            } }),
          ]}><InputNumber precision={0} style={{ width: '100%' }} placeholder="Use + to add or - to remove" /></Form.Item>
          <Form.Item label="Reason" name="reason" rules={[{ required: true, whitespace: true }, { max: 500 }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
