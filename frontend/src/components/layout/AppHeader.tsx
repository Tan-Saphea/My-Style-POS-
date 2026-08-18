'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Dropdown, Avatar, Space, Typography, Tag } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useSidebarStore } from '@/lib/store/sidebar';
import { useAuthStore } from '@/lib/store/auth';
import { UserRole } from '@/types/auth';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles';

import OrderNotificationBell from './OrderNotificationBell';

const { Header } = Layout;
const { Text } = Typography;

// ============================================================
// AppHeader
// Top header with left sidebar toggle button, breadcrumbs, notification bell, and user dropdown avatar
// ============================================================

export default function AppHeader() {
  const router = useRouter();
  const { collapsed, toggle, toggleMobile } = useSidebarStore();
  const { user, role, logout } = useAuthStore();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div style={{ padding: '6px 4px' }}>
          <Text strong style={{ display: 'block', fontSize: 13 }}>{user?.name || 'User'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: 'Change Password',
    },
    ...(role === UserRole.ADMIN ? [{ key: 'settings', icon: <SettingOutlined />, label: 'Store Settings' }] : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = async ({ key }) => {
    switch (key) {
      case 'logout':
        await logout();
        router.replace('/login');
        break;
      case 'profile':
        router.push('/profile');
        break;
      case 'change-password':
        router.push('/change-password');
        break;
      case 'settings':
        router.push('/settings');
        break;
    }
  };

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      toggleMobile();
    } else {
      toggle();
    }
  };

  const roleColor = ROLE_COLORS[role] || 'blue';
  const roleLabel = ROLE_LABELS[role] || 'User';

  return (
    <Header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', background: '#ffffff', borderBottom: '1px solid #f0f0f0' }}>
      {/* Left section: Single clean sidebar toggle button */}
      <div className="app-header__left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={handleToggle}
          className="app-header__toggle"
          style={{ fontSize: 18, marginLeft: -8 }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        />
      </div>

      {/* Right section: Live Online Order Notification Bell + User profile dropdown with live avatar */}
      <div className="app-header__right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <OrderNotificationBell />

        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Space className="app-header__user" style={{ cursor: 'pointer', gap: 10 }}>
            <Avatar
              size={36}
              src={user?.avatar}
              icon={<UserOutlined />}
              style={{
                backgroundColor: role === UserRole.ADMIN ? '#09090b' : role === UserRole.CASHIER ? '#15803d' : '#262626',
                border: '1px solid #e8e8e8',
              }}
            />
            <div className="app-header__user-info" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Text strong style={{ fontSize: 13, lineHeight: 1.2 }}>
                  {user?.name || 'User'}
                </Text>
                <Tag color={roleColor} style={{ fontSize: 10, padding: '0 5px', lineHeight: '16px', margin: 0 }}>
                  {roleLabel}
                </Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.2 }}>
                {user?.email || 'mystyle.com'}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
}
