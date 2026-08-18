'use client';

import React from 'react';
import { Result, Button } from 'antd';

// ============================================================
// ErrorState
// Error display with retry button
// Does not expose internal error details
// ============================================================

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state">
      <Result
        status="error"
        title={title}
        subTitle={message}
        extra={
          onRetry && (
            <Button type="primary" onClick={onRetry}>
              Try Again
            </Button>
          )
        }
      />
    </div>
  );
}
