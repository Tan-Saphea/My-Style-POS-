'use client';

import React from 'react';
import { Layout, Drawer } from 'antd';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import AppBreadcrumb from './AppBreadcrumb';
import { useSidebarStore } from '@/lib/store/sidebar';

const { Content } = Layout;

// ============================================================
// AppLayout
// Main dashboard layout: Sidebar + Header + Content
// Responsive: collapsible sidebar on desktop, drawer on mobile
// ============================================================

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { collapsed, mobileOpen, closeMobile } = useSidebarStore();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <div className="app-layout__sidebar--desktop">
        <AppSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        placement="left"
        onClose={closeMobile}
        open={mobileOpen}
        styles={{
          wrapper: { width: 256 },
          body: { padding: 0, background: '#001529' },
        }}
        className="app-layout__sidebar--mobile"
      >
        <AppSidebar />
      </Drawer>

      {/* Main Area */}
      <Layout
        className="app-layout__main"
        style={{
          marginLeft: collapsed ? 80 : 256,
          transition: 'margin-left 0.2s ease',
        }}
      >
        <AppHeader />
        <Content className="app-layout__content">
          <AppBreadcrumb />
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
