'use client';

import { Result, Button } from 'antd';

// ============================================================
// Global Error Boundary
// Catches unhandled errors — never exposes internal details
// ============================================================

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  // Log to monitoring service in production (not to console with sensitive data)
  // In development, Next.js already shows the error overlay

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
      }}
    >
      <Result
        status="500"
        title="Something went wrong"
        subTitle="An unexpected error occurred. Please try again."
        extra={
          <Button type="primary" onClick={reset}>
            Try Again
          </Button>
        }
      />
    </div>
  );
}
