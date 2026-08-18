'use client';

import React, { useState } from 'react';
import { App, Avatar, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { employeeService, type EmployeePayload } from '@/services/resources.service';
import type { User } from '@/types/auth';
import { UserRole } from '@/types/auth';
import { ROLE_COLORS, ROLE_LABELS } from '@/constants/roles';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';

export default function EmployeesPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<EmployeePayload>();
  const query = useQuery({ queryKey: queryKeys.employees.all, queryFn: () => employeeService.list() });
  const save = useMutation({
    mutationFn: (values: EmployeePayload) => editing ? employeeService.update(editing._id, values) : employeeService.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      message.success(editing ? 'Employee updated successfully' : 'Employee created successfully');
      setOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: employeeService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      message.success('Employee account deleted successfully');
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });
  const filtered = (query.data || []).filter((item) => {
    const term = search.toLowerCase();
    return [item.name, item.username, item.email, item.role].some((value) => value.toLowerCase().includes(term));
  });
  if (query.isError) return <ErrorState title="Unable to load employees" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({ role: UserRole.CASHIER, status: 'active' });
    }, 0);
  };
  const openEdit = (record: User) => {
    setEditing(record);
    setOpen(true);
    setTimeout(() => {
      form.setFieldsValue({ name: record.name, username: record.username, email: record.email, phone: record.phone, gender: record.gender, position: record.position, role: record.role, status: record.status });
    }, 0);
  };

  return (
    <PageContainer title="Staff & Role Management" subtitle="Manage employee accounts and enforce system roles" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Employee</Button>
    }>
      <Card variant="borderless">
        <Input aria-label="Search employees" placeholder="Search employees by name, username, email, or role..." prefix={<SearchOutlined />} style={{ maxWidth: 400, marginBottom: 16 }} value={search} onChange={(event) => setSearch(event.target.value)} allowClear />
        <Table<User>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          columns={[
            { title: 'Employee', dataIndex: 'name', render: (name: string, record) => <Space><Avatar icon={<UserOutlined />} style={{ backgroundColor: record.role === UserRole.ADMIN ? '#722ed1' : record.role === UserRole.CASHIER ? '#005a32' : '#1677ff' }} /><div><b>{name}</b><div style={{ fontSize: 12, color: '#8c8c8c' }}>@{record.username}</div></div></Space> },
            { title: 'Email', dataIndex: 'email' },
            { title: 'Position', dataIndex: 'position', render: (value?: string) => value || '—' },
            { title: 'Role', dataIndex: 'role', render: (role: UserRole) => <Tag color={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</Tag> },
            { title: 'Status', dataIndex: 'status', render: (value: string) => <Tag color={value === 'active' ? 'success' : value === 'suspended' ? 'error' : 'default'}>{value.toUpperCase()}</Tag> },
            { title: 'Actions', fixed: 'right', render: (_, record) => <Space>
              <Button aria-label={`Edit ${record.name}`} size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
              <Popconfirm title="Delete Employee" description="Employees with transaction history must be deactivated instead." onConfirm={() => remove.mutate(record._id)} okButtonProps={{ danger: true }}>
                <Button aria-label={`Delete ${record.name}`} size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space> },
          ]}
        />
      </Card>
      <Modal title={editing ? 'Edit Employee Account' : 'Add New Employee'} open={open} onOk={() => form.submit()} onCancel={() => setOpen(false)} confirmLoading={save.isPending} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={(values) => save.mutate(values)}>
          <Form.Item label="Full Name" name="name" rules={[{ required: true, whitespace: true }, { max: 100 }]}><Input /></Form.Item>
          <Form.Item label="Username" name="username" rules={[{ required: true }, { min: 3 }, { max: 30 }, { pattern: /^[a-zA-Z0-9_.-]+$/, message: 'Use letters, numbers, dot, dash, or underscore only' }]}><Input /></Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }, { max: 254 }]}><Input /></Form.Item>
          <Form.Item label={editing ? 'New Password (optional)' : 'Password'} name="password" rules={[{ required: !editing, message: 'Password is required' }, { min: 8 }, { max: 128 }]}><Input.Password autoComplete="new-password" /></Form.Item>
          <Form.Item label="Position" name="position" rules={[{ max: 100 }]}><Input /></Form.Item>
          <Form.Item label="System Role" name="role" rules={[{ required: true }]}><Select options={[{ value: UserRole.ADMIN, label: 'Admin — full access' }, { value: UserRole.CASHIER, label: 'Cashier — POS and sales' }, { value: UserRole.USER, label: 'User — read-only operations' }]} /></Form.Item>
          <Form.Item label="Status" name="status"><Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' }]} /></Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
