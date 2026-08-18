'use client';

import React, { useState } from 'react';
import { App, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { categoryService, type CategoryPayload } from '@/services/category.service';
import type { Category } from '@/types/models';
import { getErrorMessage } from '@/lib/api/error-handler';
import { queryKeys } from '@/lib/query/client';

type CategoryRow = Category & { productCount?: number };

export default function CategoriesPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<CategoryRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<CategoryPayload & { status?: Category['status'] }>();

  const query = useQuery({ queryKey: queryKeys.categories.all, queryFn: () => categoryService.getCategories() });
  const saveMutation = useMutation({
    mutationFn: (values: CategoryPayload & { status?: Category['status'] }) =>
      editingItem
        ? categoryService.updateCategory(editingItem._id, values)
        : categoryService.createCategory(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      message.success(editingItem ? 'Category updated successfully' : 'Category created successfully');
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });
  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      message.success('Category deleted successfully');
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({ status: 'active' });
    }, 0);
  };
  const openEdit = (item: CategoryRow) => {
    setEditingItem(item);
    setIsModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue({ name: item.name, description: item.description, status: item.status });
    }, 0);
  };

  const data = (query.data || []).filter((item) => {
    const term = search.toLowerCase();
    return item.name.toLowerCase().includes(term) || (item.description || '').toLowerCase().includes(term);
  }) as CategoryRow[];

  if (query.isError) return <ErrorState title="Unable to load categories" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;

  return (
    <PageContainer
      title="Category Management"
      subtitle="Organize product lines, apparel classifications, and catalog sections"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Category</Button>}
    >
      <Card variant="borderless">
        <Input
          aria-label="Search categories"
          placeholder="Search categories by name or description..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          style={{ maxWidth: 360, marginBottom: 16 }}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          allowClear
        />
        <Table<CategoryRow>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'Category Name', dataIndex: 'name', render: (name: string) => <b>{name}</b> },
            { title: 'Description', dataIndex: 'description', render: (value?: string) => value || '—' },
            { title: 'Products', dataIndex: 'productCount', render: (count?: number) => <Tag color="blue">{count || 0} items</Tag> },
            { title: 'Status', dataIndex: 'status', render: (value: string) => <Tag color={value === 'active' ? 'success' : 'default'}>{value.toUpperCase()}</Tag> },
            {
              title: 'Actions',
              render: (_, record) => (
                <Space>
                  <Button aria-label={`Edit ${record.name}`} size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                  <Popconfirm title="Delete Category" description="Delete this category? Categories used by products cannot be deleted." onConfirm={() => deleteMutation.mutate(record._id)} okButtonProps={{ danger: true }}>
                    <Button aria-label={`Delete ${record.name}`} size="small" danger icon={<DeleteOutlined />} loading={deleteMutation.isPending && deleteMutation.variables === record._id} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingItem ? 'Edit Category' : 'Create New Category'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={saveMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}>
          <Form.Item label="Category Name" name="name" rules={[{ required: true, whitespace: true, message: 'Please enter category name' }, { max: 100 }]}>
            <Input placeholder="e.g. Dresses & Skirts" />
          </Form.Item>
          <Form.Item label="Description" name="description" rules={[{ max: 500 }]}>
            <Input.TextArea placeholder="Enter category details..." rows={3} />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
