'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/lib/store/auth';
import { getErrorMessage } from '@/lib/api/error-handler';

const { Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await login(values);
      router.replace('/dashboard');
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card" variant="borderless">
        <div className="login-card__header">
          <div className="login-card__logo-wrapper">
            <Image src="/logo.png" alt="My Style" width={280} height={112} className="login-card__logo-img" priority />
          </div>
          <div className="login-card__title">Welcome Back</div>
          <Text className="login-card__subtitle">Sign in to your My Style account</Text>
        </div>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          name="login"
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="on"
          requiredMark={false}
          size="large"
          initialValues={{ username: 'admin' }}
        >
          <Form.Item
            name="username"
            label="Username or email"
            rules={[
              { required: true, message: 'Please enter your username or email' },
              { max: 100, message: 'Username must be less than 100 characters' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter your username or email"
              autoComplete="username"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { max: 128, message: 'Password must be less than 128 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 44, fontWeight: 600 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>My Style — Clothing Sales Management System</Text>
        </div>
      </Card>
    </div>
  );
}
