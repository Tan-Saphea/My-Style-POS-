'use client';

import React from 'react';
import { Result, Button, Card, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles';

export default function ForbiddenPage() {
  const router = useRouter();
  const { role } = useAuthStore();

  const roleColor = ROLE_COLORS[role] || 'blue';
  const roleLabel = ROLE_LABELS[role] || 'User';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: 24 }}>
      <Card variant="borderless" style={{ maxWidth: 520, width: '100%', textAlign: 'center', borderRadius: 12 }}>
        <Result
          status="403"
          title="403 — Access Denied"
          subTitle={
            <div>
              <p style={{ marginBottom: 12 }}>
                Sorry, your active account role <Tag color={roleColor}>{roleLabel}</Tag> does not have permission to view this page.
              </p>
              <p style={{ color: '#8c8c8c', fontSize: 13 }}>
                Contact your store administrator or switch roles in the top-right header menu.
              </p>
            </div>
          }
          extra={
            <Button type="primary" size="large" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          }
        />
      </Card>
    </div>
  );
}
