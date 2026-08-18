'use client';

import React, { useState } from 'react';
import { Card, Input, Table, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { getPayments } from '@/services/resources.service';
import type { Payment } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { formatDateTime } from '@/utils/format';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: queryKeys.payments.all, queryFn: getPayments });
  const filtered = (query.data || []).filter((item) => [item.invoiceNumber, item.method].some((value) => value.toLowerCase().includes(search.toLowerCase())));
  if (query.isError) return <ErrorState title="Unable to load payments" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;

  const renderMethodBadge = (method: string) => {
    switch (method) {
      case 'aba_khqr':
        return <Tag color="#15803d">ABA KHQR</Tag>;
      case 'cod':
        return <Tag color="#ea580c">COD (Cash on Del.)</Tag>;
      case 'card':
        return <Tag color="#7c3aed">Credit / Debit</Tag>;
      case 'acleda':
        return <Tag color="#0284c7">ACLEDA</Tag>;
      case 'wing':
        return <Tag color="#ca8a04">Wing Bank</Tag>;
      default:
        return <Tag color="#09090b">Cash (POS)</Tag>;
    }
  };

  return (
    <PageContainer title="Payment Ledger" subtitle="Server-recorded financial audit trail for Online Website checkouts, KHQR payments, and in-store POS cash registers">
      <Card variant="borderless">
        <Input aria-label="Search payments" placeholder="Search payments by invoice or method..." prefix={<SearchOutlined />} style={{ maxWidth: 360, marginBottom: 16 }} value={search} onChange={(event) => setSearch(event.target.value)} allowClear />
        <Table<Payment> rowKey="_id" loading={query.isLoading} dataSource={filtered} pagination={{ pageSize: 10 }} columns={[
          { title: 'Payment Ref', dataIndex: '_id', render: (value: string) => <code>PAY-{value.slice(-8).toUpperCase()}</code> },
          { title: 'Date & Time', dataIndex: 'createdAt', render: formatDateTime },
          {
            title: 'Invoice / Order #',
            dataIndex: 'invoiceNumber',
            render: (value: string) => {
              const isOnline = value.startsWith('INV-ONLINE');
              return (
                <div>
                  <b>{value}</b>
                  <div style={{ marginTop: 2 }}>
                    <Tag color={isOnline ? 'green' : 'default'}>
                      {isOnline ? 'Online Store' : 'In-Store POS'}
                    </Tag>
                  </div>
                </div>
              );
            },
          },
          { title: 'Payment Method', dataIndex: 'method', render: (value: string) => renderMethodBadge(value) },
          { title: 'Amount Paid', dataIndex: 'amount', render: (value: number) => <b style={{ fontSize: 14 }}>${value.toFixed(2)}</b> },
          { title: 'Received By', render: (_, item) => item.receivedBy?.name || (item.invoiceNumber.startsWith('INV-ONLINE') ? 'Online Gateway' : '—') },
          { title: 'Verification Status', dataIndex: 'status', render: (value: string) => <Tag color={value === 'completed' ? 'success' : value === 'refunded' ? 'error' : 'warning'}>{value.toUpperCase()}</Tag> },
        ]} />
      </Card>
    </PageContainer>
  );
}
