'use client';

import React, { useState } from 'react';
import { Button, Card, Col, DatePicker, Row, Space, Statistic, Table, Typography } from 'antd';
import { DownloadOutlined, PrinterOutlined, ShopOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { getReport } from '@/services/resources.service';
import type { PurchaseReport } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { exportToCsv } from '@/utils/export';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function PurchaseReportPage() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const startDateStr = dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
  const endDateStr = dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;

  const query = useQuery({
    queryKey: queryKeys.reports.purchases({ startDate: startDateStr, endDate: endDateStr }),
    queryFn: () => {
      const params: Record<string, string> = {};
      if (startDateStr) params.startDate = startDateStr;
      if (endDateStr) params.endDate = endDateStr;
      return getReport<PurchaseReport[]>('purchases', params);
    },
  });

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load purchase report"
        message={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const reportsData = query.data || [];
  const totalSpend = reportsData.reduce((sum, item) => sum + item.amount, 0);
  const totalOrders = reportsData.reduce((sum, item) => sum + item.purchaseCount, 0);

  const handleExportCSV = () => {
    exportToCsv<PurchaseReport>(
      `purchase_report_${startDateStr || 'all'}_to_${endDateStr || 'all'}`,
      [
        { label: 'Supplier Name', key: 'supplier' },
        { label: 'Received PO Count', key: 'purchaseCount' },
        { label: 'Total Spend ($)', key: (r) => r.amount.toFixed(2) },
        {
          label: 'Share of Total Spend (%)',
          key: (r) => (totalSpend > 0 ? `${((r.amount / totalSpend) * 100).toFixed(1)}%` : '0%'),
        },
      ],
      reportsData
    );
  };

  return (
    <PageContainer
      title="Purchase & Supplier Spend Report"
      subtitle="Restocking expenditure, received purchase orders, and supplier procurement analytics"
    >
      {/* Date Filter & Actions Header */}
      <Card variant="borderless" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
              Filter Procurement Date Range:
            </Text>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 280 }}
            />
          </div>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV} disabled={reportsData.length === 0}>
              Export CSV
            </Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              Print Report
            </Button>
          </Space>
        </div>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Total Restocking Spend"
              value={totalSpend}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#09090b', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Received Purchase Orders"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
              precision={0}
              styles={{ content: { color: '#ea580c', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Active Suppliers Count"
              value={reportsData.length}
              prefix={<ShopOutlined />}
              precision={0}
              styles={{ content: { color: '#005a32', fontWeight: 700 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Supplier Spend Bar Chart */}
      <Card title="Restocking Spend by Supplier" variant="borderless" style={{ marginBottom: 20 }} loading={query.isLoading}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportsData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="supplier" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            <Bar dataKey="amount" fill="#005a32" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Supplier Table */}
      <Card title="Supplier Procurement Breakdown" variant="borderless">
        <Table<PurchaseReport>
          rowKey="supplier"
          loading={query.isLoading}
          dataSource={reportsData}
          columns={[
            {
              title: 'Supplier Name',
              dataIndex: 'supplier',
              render: (value: string) => <b>{value}</b>,
            },
            {
              title: 'Received Orders',
              dataIndex: 'purchaseCount',
              render: (value: number) => <Text style={{ fontWeight: 600 }}>{value} orders</Text>,
            },
            {
              title: 'Total Spend',
              dataIndex: 'amount',
              render: (value: number) => (
                <Text style={{ fontWeight: 700, color: '#005a32' }}>${value.toFixed(2)}</Text>
              ),
            },
            {
              title: 'Share of Total Spend',
              render: (_, record) => {
                const percent = totalSpend > 0 ? (record.amount / totalSpend) * 100 : 0;
                return <Text type="secondary">{percent.toFixed(1)}%</Text>;
              },
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
