'use client';

import React from 'react';
import { Empty, Button } from 'antd';

// ============================================================
// EmptyState
// Reusable empty state with icon, description, and action
// ============================================================

interface EmptyStateProps {
  description?: string;
  actionText?: string;
  onAction?: () => void;
  image?: React.ReactNode;
}

export default function EmptyState({
  description = 'No data found',
  actionText,
  onAction,
  image,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        description={description}
      >
        {actionText && onAction && (
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
}
