'use client';

import React, { useState } from 'react';
import { Card, Input, Table, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { getAuditLogs } from '@/services/resources.service';
import type { AuditLog } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { formatDateTime } from '@/utils/format';

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: queryKeys.auditLogs.list(), queryFn: getAuditLogs });
  const filtered = (query.data || []).filter((item) => [item.action, item.entity, item.user?.name || '', item.user?.username || ''].some((value) => value.toLowerCase().includes(search.toLowerCase())));
  if (query.isError) return <ErrorState title="Unable to load audit logs" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  return (
    <PageContainer title="Security & System Audit Logs" subtitle="Read-only event trail of authentication, administrative, stock, and financial actions">
      <Card variant="borderless">
        <Input aria-label="Search audit logs" placeholder="Search logs by user, action, or entity..." prefix={<SearchOutlined />} style={{ maxWidth: 380, marginBottom: 16 }} value={search} onChange={(event) => setSearch(event.target.value)} allowClear />
        <Table<AuditLog> rowKey="_id" loading={query.isLoading} dataSource={filtered} pagination={{ pageSize: 10 }} scroll={{ x: 950 }} columns={[
          { title: 'Timestamp', dataIndex: 'createdAt', render: formatDateTime },
          { title: 'User', render: (_, item) => item.user ? `${item.user.name} (@${item.user.username})` : 'System / deleted user' },
          { title: 'Action', dataIndex: 'action', render: (value: string) => <Tag color={value.includes('DELETE') || value.includes('CANCEL') ? 'error' : value.includes('CREATE') || value.includes('RECEIVE') ? 'success' : 'blue'}>{value}</Tag> },
          { title: 'Entity', dataIndex: 'entity' },
          { title: 'Details', dataIndex: 'details', render: (details?: Record<string, unknown>) => <Typography.Text ellipsis={{ tooltip: details ? JSON.stringify(details) : '—' }} style={{ maxWidth: 300 }}>{details ? JSON.stringify(details) : '—'}</Typography.Text> },
          { title: 'IP Address', dataIndex: 'ipAddress', render: (value?: string) => value || '—' },
        ]} />
      </Card>
    </PageContainer>
  );
}
