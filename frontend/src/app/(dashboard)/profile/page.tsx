'use client';

import React, { useEffect } from 'react';
import { App, Avatar, Button, Card, Col, Form, Input, Row, Select, Space, Tag, Typography, Upload } from 'antd';
import { CameraOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import { updateProfile } from '@/services/auth.service';
import { useAuthStore } from '@/lib/store/auth';
import type { User } from '@/types/auth';
import { getErrorMessage } from '@/lib/api/error-handler';
import { ROLE_COLORS, ROLE_LABELS } from '@/constants/roles';

const { Title, Text } = Typography;

type ProfilePayload = Pick<User, 'name' | 'email'> &
  Partial<Pick<User, 'phone' | 'gender' | 'position' | 'avatar'>>;

export default function ProfilePage() {
  const { message } = App.useApp();
  const { user, setUser } = useAuthStore();
  const [form] = Form.useForm<ProfilePayload>();
  const avatarWatch = Form.useWatch('avatar', form);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        gender: user.gender,
        position: user.position || '',
        avatar: user.avatar || '',
      });
    }
  }, [form, user]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      setUser(updated);
      message.success('Profile updated successfully');
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const handleFileUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      message.error('Avatar image must be smaller than 2MB');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        form.setFieldValue('avatar', result);
        message.success('Avatar image loaded');
      }
    };
    reader.readAsDataURL(file);
    return false; // Prevent automatic HTTP upload
  };

  return (
    <PageContainer
      title="User Profile"
      subtitle="View and update your personal account information and avatar"
    >
      <Card variant="borderless">
        <Space size="large" style={{ marginBottom: 28, width: '100%' }} align="center">
          <Avatar
            size={84}
            src={avatarWatch || user?.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#005a32', fontSize: 36 }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {user?.name || 'User Profile'}
            </Title>
            <Space style={{ marginTop: 4 }}>
              <Tag color={user ? ROLE_COLORS[user.role] : 'default'}>
                {user ? ROLE_LABELS[user.role] : 'User'}
              </Tag>
              <Text type="secondary">@{user?.username}</Text>
            </Space>
          </div>
        </Space>

        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const payload = {
              ...values,
              gender: values.gender || undefined,
              phone: values.phone || undefined,
              position: values.position || undefined,
              avatar: values.avatar || undefined,
            };
            mutation.mutate(payload);
          }}
          initialValues={{ gender: 'male' }}
        >
          <Row gutter={16}>
            <Col xs={24} md={18}>
              <Form.Item
                label="Avatar Image URL or Base64"
                name="avatar"
                help="Paste an image URL or click Upload to select a local picture"
              >
                <Input placeholder="https://... or select file" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Upload Local File">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleFileUpload}
                >
                  <Button icon={<CameraOutlined />} block>
                    Upload Image
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, whitespace: true, message: 'Full name is required' }, { max: 100 }]}
              >
                <Input placeholder="e.g. Admin User" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Username">
                <Input value={user?.username} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Email address is required' },
                  { type: 'email', message: 'Enter a valid email address' },
                  { max: 254 },
                ]}
              >
                <Input placeholder="admin@mystyle.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Phone Number" name="phone" rules={[{ max: 40 }]}>
                <Input placeholder="+855 12 345 678" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Gender" name="gender">
                <Select
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Job Position / Title" name="position" rules={[{ max: 100 }]}>
                <Input placeholder="e.g. Store Manager" />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={mutation.isPending}
            style={{ marginTop: 8 }}
          >
            Save Profile Changes
          </Button>
        </Form>
      </Card>
    </PageContainer>
  );
}
