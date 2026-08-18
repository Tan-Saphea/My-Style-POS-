'use client';

import React from 'react';
import { App, Button, Card, Form, Input } from 'antd';
import { KeyOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import { changePassword } from '@/services/auth.service';
import type { ChangePasswordRequest } from '@/types/auth';
import { getErrorMessage } from '@/lib/api/error-handler';

export default function ChangePasswordPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<ChangePasswordRequest>();
  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => { message.success('Password changed successfully'); form.resetFields(); },
    onError: (error) => message.error(getErrorMessage(error)),
  });
  return (
    <PageContainer title="Change Password" subtitle="Update your account security password">
      <Card variant="borderless" style={{ maxWidth: 520 }}>
        <Form form={form} layout="vertical" onFinish={(values) => mutation.mutate(values)}>
          <Form.Item label="Current Password" name="currentPassword" rules={[{ required: true }, { max: 128 }]}><Input.Password prefix={<LockOutlined />} autoComplete="current-password" /></Form.Item>
          <Form.Item label="New Password" name="newPassword" rules={[{ required: true }, { min: 8 }, { max: 128 }]}><Input.Password prefix={<KeyOutlined />} autoComplete="new-password" /></Form.Item>
          <Form.Item label="Confirm New Password" name="confirmPassword" dependencies={['newPassword']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator: (_, value) => !value || getFieldValue('newPassword') === value ? Promise.resolve() : Promise.reject(new Error('The passwords do not match')) })]}><Input.Password prefix={<KeyOutlined />} autoComplete="new-password" /></Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>Change Password</Button>
        </Form>
      </Card>
    </PageContainer>
  );
}
