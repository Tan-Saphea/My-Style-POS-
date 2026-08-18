'use client';

import React, { useState } from 'react';
import { App, Button, Card, ColorPicker, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { colorService, type ColorPayload } from '@/services/resources.service';
import type { Color } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';

type ColorForm = Omit<ColorPayload, 'hexCode'> & { hexCode: string | { toHexString: () => string } };

export default function ColorsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Color | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<ColorForm>();
  const query = useQuery({ queryKey: queryKeys.colors.all, queryFn: () => colorService.list() });
  const save = useMutation({
    mutationFn: (values: ColorPayload) => editing ? colorService.update(editing._id, values) : colorService.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.colors.all });
      message.success(editing ? 'Color updated successfully' : 'Color added successfully');
      setOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: colorService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.colors.all });
      message.success('Color deleted successfully');
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });
  const filtered = (query.data || []).filter((item) => {
    const term = search.toLowerCase();
    return item.name.toLowerCase().includes(term) || (item.description || '').toLowerCase().includes(term);
  });
  if (query.isError) return <ErrorState title="Unable to load colors" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({ hexCode: '#1677ff', status: 'active' });
    }, 0);
  };
  const openEdit = (record: Color) => {
    setEditing(record);
    setOpen(true);
    setTimeout(() => {
      form.setFieldsValue(record);
    }, 0);
  };

  return (
    <PageContainer title="Color Options" subtitle="Manage garment color palette definitions and hex swatch codes" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Color</Button>
    }>
      <Card variant="borderless">
        <Input aria-label="Search colors" placeholder="Search color options..." prefix={<SearchOutlined />} style={{ maxWidth: 320, marginBottom: 16 }} value={search} onChange={(event) => setSearch(event.target.value)} allowClear />
        <Table<Color>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'Color', dataIndex: 'name', render: (name: string, record) => <Space><span aria-hidden style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: record.hexCode, border: '1px solid #d9d9d9' }} /><b>{name}</b></Space> },
            { title: 'HEX Code', dataIndex: 'hexCode', render: (hex: string) => <code>{hex}</code> },
            { title: 'Description', dataIndex: 'description', render: (value?: string) => value || '—' },
            { title: 'Status', dataIndex: 'status', render: (value: string) => <Tag color={value === 'active' ? 'success' : 'default'}>{value.toUpperCase()}</Tag> },
            { title: 'Actions', render: (_, record) => <Space>
              <Button aria-label={`Edit ${record.name}`} size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
              <Popconfirm title="Delete Color" description="Delete this color? Colors used by variants cannot be deleted." onConfirm={() => remove.mutate(record._id)} okButtonProps={{ danger: true }}>
                <Button aria-label={`Delete ${record.name}`} size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space> },
          ]}
        />
      </Card>
      <Modal title={editing ? 'Edit Color' : 'Add New Color'} open={open} onOk={() => form.submit()} onCancel={() => setOpen(false)} confirmLoading={save.isPending} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={(values) => save.mutate({ ...values, hexCode: typeof values.hexCode === 'string' ? values.hexCode : values.hexCode.toHexString() })}>
          <Form.Item label="Color Name" name="name" rules={[{ required: true, whitespace: true }, { max: 50 }]}><Input placeholder="e.g. Royal Blue" /></Form.Item>
          <Form.Item label="Color Swatch" name="hexCode" rules={[{ required: true }]}><ColorPicker showText /></Form.Item>
          <Form.Item label="Description" name="description" rules={[{ max: 200 }]}><Input placeholder="e.g. Dark vibrant shade" /></Form.Item>
          <Form.Item label="Status" name="status"><Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} /></Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
