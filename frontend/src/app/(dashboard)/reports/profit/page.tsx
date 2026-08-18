'use client';

import React, { useState } from 'react';
import { Button, Card, Col, DatePicker, Row, Space, Statistic, Typography } from 'antd';
import { DownloadOutlined, PrinterOutlined, RiseOutlined, DollarOutlined, FallOutlined, PercentageOutlined } from '@ant-design/icons';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { getReport } from '@/services/resources.service';
import type { ProfitReport } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { exportToCsv } from '@/utils/export';

const { RangePicker } = DatePicker;
const { Text } = Typography;

type ProfitData = ProfitReport & { taxCollected: number };

export default function ProfitReportPage() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const startDateStr = dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
  const endDateStr = dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;

  const query = useQuery({
    queryKey: queryKeys.reports.profit({ startDate: startDateStr, endDate: endDateStr }),
    queryFn: () => {
      const params: Record<string, string> = {};
      if (startDateStr) params.startDate = startDateStr;
      if (endDateStr) params.endDate = endDateStr;
      return getReport<ProfitData>('profit', params);
    },
  });

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load profit report"
        message={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const data = query.data;

  const chartData = [
    { category: 'Net Sales', amount: data?.revenue || 0 },
    { category: 'COGS (Cost)', amount: data?.cost || 0 },
    { category: 'Gross Profit', amount: data?.grossProfit || 0 },
  ];

  const handleExportCSV = () => {
    if (!data) return;
    exportToCsv(
      `profit_loss_statement_${startDateStr || 'all'}_to_${endDateStr || 'all'}`,
      [
        { label: 'Financial Metric', key: 'metric' },
        { label: 'Amount ($)', key: 'amount' },
      ],
      [
        { metric: 'Net Sales Revenue (Excl. Tax)', amount: (data.revenue || 0).toFixed(2) },
        { metric: 'Cost of Goods Sold (COGS)', amount: (data.cost || 0).toFixed(2) },
        { metric: 'Gross Profit', amount: (data.grossProfit || 0).toFixed(2) },
        { metric: 'Profit Margin (%)', amount: `${(data.profitMargin || 0).toFixed(2)}%` },
        { metric: 'Sales Tax Collected', amount: (data.taxCollected || 0).toFixed(2) },
      ]
    );
  };

  return (
    <PageContainer
      title="Gross Profit & Loss Statement"
      subtitle="Net store sales revenue excluding tax minus historical cost of goods sold (COGS)"
    >
      {/* Date Filter Header */}
      <Card variant="borderless" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
              Filter Statement Date Range:
            </Text>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 280 }}
            />
          </div>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV} disabled={!data}>
              Export CSV
            </Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              Print Statement
            </Button>
          </Space>
        </div>
      </Card>

      {/* KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Net Sales (Excl. Tax)"
              value={data?.revenue || 0}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#09090b', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Cost of Goods Sold (COGS)"
              value={data?.cost || 0}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#ea580c', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Gross Profit Margin ($)"
              value={data?.grossProfit || 0}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#005a32', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Gross Profit Margin (%)"
              value={data?.profitMargin || 0}
              suffix="%"
              precision={2}
              styles={{ content: { color: '#005a32', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Sales Tax Collected"
              value={data?.taxCollected || 0}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#09090b', fontWeight: 700 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Visual Profit Chart */}
      <Card title="Revenue vs COGS vs Gross Profit Comparison" variant="borderless" loading={query.isLoading}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 13, fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            <Bar dataKey="amount" fill="#005a32" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </PageContainer>
  );
}
