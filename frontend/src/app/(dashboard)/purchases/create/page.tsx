'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import { App, Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import { ROUTES } from '@/constants/routes';
import { inventoryService, purchaseService, supplierService, type PurchasePayload } from '@/services/resources.service';
import type { Product } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';

type PurchaseForm = Omit<PurchasePayload, 'purchaseDate'> & { purchaseDate: Dayjs };

export default function CreatePurchasePage() {
  const { message } = App.useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<PurchaseForm>();
  const suppliers = useQuery({ queryKey: queryKeys.suppliers.all, queryFn: () => supplierService.list({ status: 'active' }) });
  const inventory = useQuery({ queryKey: queryKeys.inventory.all, queryFn: () => inventoryService.list() });
  const create = useMutation({
    mutationFn: purchaseService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      message.success('Purchase order created successfully');
      router.replace(ROUTES.PURCHASES);
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });
  const submit = (values: PurchaseForm) => create.mutate({ ...values, purchaseDate: values.purchaseDate.toISOString() });

  return (
    <PageContainer title="Create Purchase Order" subtitle="Order specific product variants from an active supplier" extra={<Link href={ROUTES.PURCHASES}><Button icon={<ArrowLeftOutlined />}>Back to Purchases</Button></Link>}>
      <Form<PurchaseForm> form={form} layout="vertical" onFinish={submit} initialValues={{ purchaseDate: dayjs(), status: 'ordered', discount: 0, items: [{ quantity: 1, costPrice: 0 }] }}>
        <Card title="Order Information" variant="borderless" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item label="Supplier" name="supplierId" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" loading={suppliers.isLoading} options={(suppliers.data || []).map((item) => ({ value: item._id, label: item.name }))} /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Order Date" name="purchaseDate" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Initial Status" name="status"><Select options={[{ value: 'ordered', label: 'Ordered' }, { value: 'draft', label: 'Draft' }]} /></Form.Item></Col>
          </Row>
          <Form.Item label="Remarks / Note" name="notes" rules={[{ max: 1000 }]}><Input.TextArea rows={2} /></Form.Item>
        </Card>
        <Card title="Order Items" variant="borderless">
          <Form.List name="items">
            {(fields, { add, remove }) => <Space orientation="vertical" style={{ width: '100%' }}>
              {fields.map((field, index) => <Row gutter={12} key={field.key} align="middle">
                <Col xs={24} md={12}><Form.Item label={index === 0 ? 'Product Variant' : undefined} name={[field.name, 'variantId']} rules={[{ required: true }]}><Select showSearch optionFilterProp="label" loading={inventory.isLoading} onChange={(id) => { const variant = inventory.data?.find((item) => item._id === id); if (variant) form.setFieldValue(['items', field.name, 'costPrice'], variant.costPrice); }} options={(inventory.data || []).map((item) => ({ value: item._id, label: `${item.sku} — ${(item.product as Product)?.name || ''}` }))} /></Form.Item></Col>
                <Col xs={10} md={5}><Form.Item label={index === 0 ? 'Quantity' : undefined} name={[field.name, 'quantity']} rules={[{ required: true }]}><InputNumber min={1} precision={0} style={{ width: '100%' }} /></Form.Item></Col>
                <Col xs={10} md={5}><Form.Item label={index === 0 ? 'Unit Cost ($)' : undefined} name={[field.name, 'costPrice']} rules={[{ required: true }]}><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item></Col>
                <Col xs={4} md={2}><Button aria-label={`Remove item ${index + 1}`} danger type="text" icon={<DeleteOutlined />} disabled={fields.length === 1} onClick={() => remove(field.name)} /></Col>
              </Row>)}
              <Button block type="dashed" icon={<PlusOutlined />} onClick={() => add({ quantity: 1, costPrice: 0 })}>Add Line Item</Button>
            </Space>}
          </Form.List>
          <Form.Item label="Order Discount ($)" name="discount" style={{ maxWidth: 240, marginTop: 16 }}><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
          <Space><Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={create.isPending}>Submit Purchase Order</Button><Link href={ROUTES.PURCHASES}><Button>Cancel</Button></Link></Space>
        </Card>
      </Form>
    </PageContainer>
  );
}
