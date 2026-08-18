'use client';

import React from 'react';
import { ConfigProvider, App as AntApp } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import themeConfig from '@/lib/theme/themeConfig';

// ============================================================
// Ant Design Provider
// Wraps the app with AntdRegistry (SSR styles) + ConfigProvider (theme)
// ============================================================

interface AntdProviderProps {
  children: React.ReactNode;
}

export default function AntdProvider({ children }: AntdProviderProps) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={themeConfig}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
