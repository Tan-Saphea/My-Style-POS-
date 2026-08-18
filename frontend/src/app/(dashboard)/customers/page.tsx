'use client';

import React, { useState } from 'react';
import { App, Avatar, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { customerService, type CustomerPayload } from '@/services/resources.service';
import type { Customer } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';

export default function CustomersPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<CustomerPayload>();

  const query = useQuery({ queryKey: queryKeys.customers.all, queryFn: () => customerService.list() });

  const save = useMutation({
    mutationFn: (values: CustomerPayload) =>
      editing ? customerService.update(editing._id, values) : customerService.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      message.success(editing ? 'Customer updated successfully' : 'Customer created successfully');
      setOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: customerService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      message.success('Customer deleted successfully');
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const filtered = (query.data || []).filter((item) => {
    const term = search.toLowerCase();
    return [item.name, item.phone || '', item.email || ''].some((value) => value.toLowerCase().includes(term));
  });

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load customers"
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
      form.setFieldsValue({ gender: 'female', status: 'active' });
    }, 0);
  };

  const openEdit = (record: Customer) => {
    setEditing(record);
    setOpen(true);
    setTimeout(() => {
      form.setFieldsValue(record);
    }, 0);
  };

  return (
    <PageContainer
      title="Customer Directory"
      subtitle="Manage customer profiles, contact information, and purchase history"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ backgroundColor: '#09090b', borderColor: '#09090b' }}
        >
          Add Customer
        </Button>
      }
    >
      <Card variant="borderless">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Input
            aria-label="Search customers"
            placeholder="Search customers by name, phone, or email..."
            prefix={<SearchOutlined style={{ color: '#a1a1aa' }} />}
            style={{ maxWidth: 360, borderRadius: 8 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />
          <div style={{ fontSize: 12, color: '#71717a' }}>
            Showing <b>{filtered.length}</b> registered customers
          </div>
        </div>

        <Table<Customer>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
          columns={[
            {
              title: 'Customer',
              dataIndex: 'name',
              width: 240,
              render: (name: string, record: Customer) => {
                const initials = name
                  .trim()
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'CU';

                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar
                      style={{
                        backgroundColor: '#18181b',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#09090b', fontSize: 13 }} className="truncate">
                        {name.trim()}
                      </div>
                      <div style={{ fontSize: 11, color: '#71717a', marginTop: 1 }} className="truncate">
                        {record.email || 'No email registered'}
                      </div>
                    </div>
                  </div>
                );
              },
            },
            {
              title: 'Phone',
              dataIndex: 'phone',
              width: 140,
              render: (value?: string) => (
                <span style={{ fontSize: 13, fontWeight: 500, color: '#27272a' }}>
                  {value || '—'}
                </span>
              ),
            },
            {
              title: 'Address & Delivery Pin',
              dataIndex: 'address',
              width: 280,
              render: (value?: string) => {
                if (!value) return <span style={{ color: '#a1a1aa' }}>—</span>;
                const isHome = value.toUpperCase().includes('[HOME]');
                const isWork = value.toUpperCase().includes('[WORK]');
                const directMapMatch = value.match(/https?:\/\/[^\s\]]+/i);
                const cleanAddress = value
                  .replace(/\[(HOME|WORK|OTHER)\]/gi, '')
                  .replace(/\[Maps:[^\]]+\]/gi, '')
                  .trim();

                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {isHome && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                          }}
                        >
                          HOME
                        </span>
                      )}
                      {isWork && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            backgroundColor: '#faf5ff',
                            color: '#7e22ce',
                          }}
                        >
                          WORK
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: '#3f3f46', fontWeight: 500 }}>
                        {cleanAddress || value}
                      </span>
                    </div>

                    {directMapMatch && (
                      <div style={{ marginTop: 4 }}>
                        <a
                          href={directMapMatch[0]}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#15803d',
                            textDecoration: 'underline',
                          }}
                        >
                          <EnvironmentOutlined /> Open Pinned Location
                        </a>
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              title: 'Orders',
              dataIndex: 'totalOrders',
              width: 100,
              align: 'center',
              render: (value?: number) => (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: '#f4f4f5',
                    color: '#3f3f46',
                  }}
                >
                  {value || 0} orders
                </span>
              ),
            },
            {
              title: 'Total Spent',
              dataIndex: 'totalSpending',
              width: 120,
              render: (value?: number) => (
                <span style={{ fontWeight: 700, color: '#09090b', fontSize: 13 }}>
                  ${(value || 0).toFixed(2)}
                </span>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 100,
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
                    title="Delete Customer"
                    description="Customers with sales history must be deactivated instead. Continue?"
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
        title={editing ? 'Edit Customer Profile' : 'Add New Customer'}
        open={open}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        confirmLoading={save.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={(values) => save.mutate(values)}>
          <Form.Item label="Full Name" name="name" rules={[{ required: true, whitespace: true }, { max: 200 }]}>
            <Input placeholder="e.g. Sokha Chan" />
          </Form.Item>
          <Form.Item label="Gender" name="gender">
            <Select
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Phone Number" name="phone" rules={[{ max: 40 }]}>
            <Input placeholder="012 345 678" />
          </Form.Item>
          <Form.Item label="Email Address" name="email" rules={[{ type: 'email' }, { max: 254 }]}>
            <Input placeholder="customer@example.com" />
          </Form.Item>
          <Form.Item label="Delivery Address" name="address" rules={[{ max: 500 }]}>
            <Input.TextArea rows={2} placeholder="Street, house number, district, landmark..." />
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
