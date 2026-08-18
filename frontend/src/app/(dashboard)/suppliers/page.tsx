'use client';

import React, { useState } from 'react';
import { App, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { supplierService, type SupplierPayload } from '@/services/resources.service';
import type { Supplier } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';

export default function SuppliersPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<SupplierPayload>();

  const query = useQuery({ queryKey: queryKeys.suppliers.all, queryFn: () => supplierService.list() });

  const save = useMutation({
    mutationFn: (values: SupplierPayload) =>
      editing ? supplierService.update(editing._id, values) : supplierService.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      message.success(editing ? 'Supplier updated successfully' : 'Supplier added successfully');
      setOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: supplierService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      message.success('Supplier deleted successfully');
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const filtered = (query.data || []).filter((item) => {
    const term = search.toLowerCase();
    return [item.name, item.contactPerson || '', item.email || '', item.phone || ''].some((val) =>
      val.toLowerCase().includes(term)
    );
  });

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load suppliers"
        message={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({ status: 'active' });
    }, 0);
  };

  const openEdit = (record: Supplier) => {
    setEditing(record);
    setOpen(true);
    setTimeout(() => {
      form.setFieldsValue(record);
    }, 0);
  };

  return (
    <PageContainer
      title="Suppliers & Fabric Vendors"
      subtitle="Manage garment factories, raw material vendors, and purchase contacts"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ backgroundColor: '#09090b', borderColor: '#09090b' }}
        >
          Add Supplier
        </Button>
      }
    >
      <Card variant="borderless">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Input
            aria-label="Search suppliers"
            placeholder="Search suppliers by name, contact, phone, or email..."
            prefix={<SearchOutlined style={{ color: '#a1a1aa' }} />}
            style={{ maxWidth: 380, borderRadius: 8 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />
          <div style={{ fontSize: 12, color: '#71717a' }}>
            Showing <b>{filtered.length}</b> suppliers & vendors
          </div>
        </div>

        <Table<Supplier>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
          columns={[
            {
              title: 'Supplier Name',
              dataIndex: 'name',
              width: 220,
              render: (value: string) => (
                <span style={{ fontWeight: 600, color: '#09090b', fontSize: 13 }}>
                  {value}
                </span>
              ),
            },
            {
              title: 'Contact Person',
              dataIndex: 'contactPerson',
              width: 160,
              render: (value?: string) => (
                <span style={{ fontSize: 13, color: '#3f3f46' }}>{value || '—'}</span>
              ),
            },
            {
              title: 'Phone',
              dataIndex: 'phone',
              width: 150,
              render: (value?: string) => (
                <span style={{ fontSize: 13, fontWeight: 500, color: '#27272a' }}>{value || '—'}</span>
              ),
            },
            {
              title: 'Email',
              dataIndex: 'email',
              width: 200,
              render: (value?: string) => (
                <span style={{ fontSize: 12, color: '#52525b' }}>{value || '—'}</span>
              ),
            },
            {
              title: 'Address',
              dataIndex: 'address',
              width: 240,
              render: (value?: string) => (
                <span style={{ fontSize: 12, color: '#52525b' }}>{value || '—'}</span>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 110,
              render: (value: string) => {
                const isActive = value === 'active';
                return (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: isActive ? '#15803d' : '#71717a',
                      background: isActive ? '#f0fdf4' : '#f4f4f5',
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: `1px solid ${isActive ? '#bbf7d0' : '#e4e4e7'}`,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#15803d' : '#a1a1aa' }} />
                    <span>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                  </span>
                );
              },
            },
            {
              title: 'Actions',
              fixed: 'right',
              width: 90,
              render: (_, record) => (
                <Space size={4}>
                  <Button
                    aria-label={`Edit ${record.name}`}
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEdit(record)}
                    style={{ borderRadius: 6 }}
                  />
                  <Popconfirm
                    title="Delete Supplier"
                    description="Suppliers with purchase history must be deactivated instead. Continue?"
                    onConfirm={() => remove.mutate(record._id)}
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      aria-label={`Delete ${record.name}`}
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ borderRadius: 6 }}
                    />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Supplier' : 'Add New Supplier'}
        open={open}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        confirmLoading={save.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={(values) => save.mutate(values)}>
          <Form.Item
            label="Supplier / Company Name"
            name="name"
            rules={[{ required: true, whitespace: true }, { max: 200 }]}
          >
            <Input placeholder="e.g. Angkor Textile Mills Ltd" />
          </Form.Item>

          <Form.Item label="Contact Person" name="contactPerson" rules={[{ max: 100 }]}>
            <Input placeholder="e.g. Sophea Chan" />
          </Form.Item>

          <Form.Item label="Phone Number" name="phone" rules={[{ max: 40 }]}>
            <Input placeholder="+855 12 345 678" />
          </Form.Item>

          <Form.Item label="Email Address" name="email" rules={[{ type: 'email' }, { max: 254 }]}>
            <Input placeholder="sales@example.com" />
          </Form.Item>

          <Form.Item label="Office / Factory Address" name="address" rules={[{ max: 500 }]}>
            <Input.TextArea rows={2} placeholder="Factory address, SEZ, building..." />
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
