'use client';

import React from 'react';
import { Space, Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

// ============================================================
// PageHeader
// Page title with optional back button, description, and actions
// ============================================================

interface PageHeaderProps {
  title: string;
  description?: string;
  showBack?: boolean;
  backPath?: string;
  extra?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  showBack = false,
  backPath,
  extra,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backPath) {
      router.push(backPath);
    } else {
      router.back();
    }
  };

  return (
    <div className="page-header">
      <div className="page-header__left">
        {showBack && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginRight: 8 }}
          />
        )}
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            {title}
          </Title>
          {description && (
            <Text type="secondary" style={{ marginTop: 2, display: 'block' }}>
              {description}
            </Text>
          )}
        </div>
      </div>
      {extra && <Space>{extra}</Space>}
    </div>
  );
}
