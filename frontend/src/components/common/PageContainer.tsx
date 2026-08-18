'use client';

import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

// ============================================================
// PageContainer
// Consistent page wrapper with title, subtitle, and extra actions
// ============================================================

interface PageContainerProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageContainer({
  title,
  subtitle,
  extra,
  children,
}: PageContainerProps) {
  return (
    <div className="page-container">
      <div className="page-container__header">
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
              {subtitle}
            </Text>
          )}
        </div>
        {extra && <div className="page-container__actions">{extra}</div>}
      </div>
      <div className="page-container__body">{children}</div>
    </div>
  );
}
