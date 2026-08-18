'use client';

import React, { useState } from 'react';
import { App, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { sizeService, type SizePayload } from '@/services/resources.service';
import type { Size } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';

export default function SizesPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Size | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<SizePayload>();
  const query = useQuery({ queryKey: queryKeys.sizes.all, queryFn: () => sizeService.list() });
  const save = useMutation({
    mutationFn: (values: SizePayload) => editing ? sizeService.update(editing._id, values) : sizeService.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sizes.all });
      message.success(editing ? 'Size updated successfully' : 'Size added successfully');
      setOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: sizeService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sizes.all });
      message.success('Size deleted successfully');
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const filtered = (query.data || []).filter((item) => {
    const term = search.toLowerCase();
    return item.name.toLowerCase().includes(term) || (item.description || '').toLowerCase().includes(term);
  });
  if (query.isError) return <ErrorState title="Unable to load sizes" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({ status: 'active', sortOrder: (query.data?.length || 0) + 1 });
    }, 0);
  };
  const openEdit = (record: Size) => {
    setEditing(record);
    setOpen(true);
    setTimeout(() => {
      form.setFieldsValue(record);
    }, 0);
  };

  return (
    <PageContainer title="Clothing Sizes" subtitle="Manage standard and custom sizing options across garment lines" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Size</Button>
    }>
      <Card variant="borderless">
        <Input aria-label="Search sizes" placeholder="Search sizes..." prefix={<SearchOutlined />} style={{ maxWidth: 320, marginBottom: 16 }} value={search} onChange={(event) => setSearch(event.target.value)} allowClear />
        <Table<Size>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'Size Code', dataIndex: 'name', render: (name: string) => <b>{name}</b> },
            { title: 'Description', dataIndex: 'description', render: (value?: string) => value || '—' },
            { title: 'Order', dataIndex: 'sortOrder' },
            { title: 'Status', dataIndex: 'status', render: (value: string) => <Tag color={value === 'active' ? 'success' : 'default'}>{value.toUpperCase()}</Tag> },
            { title: 'Actions', render: (_, record) => <Space>
              <Button aria-label={`Edit ${record.name}`} size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
              <Popconfirm title="Delete Size" description="Delete this size? Sizes used by variants cannot be deleted." onConfirm={() => remove.mutate(record._id)} okButtonProps={{ danger: true }}>
                <Button aria-label={`Delete ${record.name}`} size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space> },
          ]}
        />
      </Card>
      <Modal title={editing ? 'Edit Size' : 'Add New Size'} open={open} onOk={() => form.submit()} onCancel={() => setOpen(false)} confirmLoading={save.isPending} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={(values) => save.mutate(values)}>
          <Form.Item label="Size Code / Name" name="name" rules={[{ required: true, whitespace: true }, { max: 20 }]}><Input placeholder="e.g. XXXL" /></Form.Item>
          <Form.Item label="Description" name="description" rules={[{ max: 200 }]}><Input placeholder="e.g. Triple Extra Large" /></Form.Item>
          <Form.Item label="Sort Order" name="sortOrder" rules={[{ required: true }]}><InputNumber min={0} precision={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Status" name="status"><Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} /></Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
