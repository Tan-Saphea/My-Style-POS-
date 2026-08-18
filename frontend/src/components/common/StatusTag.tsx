'use client';

import React from 'react';
import { Tag } from 'antd';
import { getStatusColor, formatStatus } from '@/utils/helpers';

// ============================================================
// StatusTag
// Colored status indicator using Ant Design Tag
// ============================================================

interface StatusTagProps {
  status: string;
  label?: string;
}

export default function StatusTag({ status, label }: StatusTagProps) {
  return (
    <Tag color={getStatusColor(status)}>
      {label || formatStatus(status)}
    </Tag>
  );
}
