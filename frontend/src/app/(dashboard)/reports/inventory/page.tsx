'use client';

import React from 'react';
import { Button, Card, Col, Row, Space, Statistic, Typography } from 'antd';
import { DownloadOutlined, PrinterOutlined, InboxOutlined, DollarOutlined, RiseOutlined, WarningOutlined } from '@ant-design/icons';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { getReport } from '@/services/resources.service';
import type { InventoryReport } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { exportToCsv } from '@/utils/export';

const { Text } = Typography;

export default function InventoryReportPage() {
  const query = useQuery({
    queryKey: queryKeys.reports.inventory,
    queryFn: () => getReport<InventoryReport>('inventory'),
  });

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load inventory report"
        message={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const data = query.data;
  const potentialProfit = (data?.retailValue || 0) - (data?.stockCostValue || 0);

  const chartData = [
    { metric: 'Stock Cost Value', amount: data?.stockCostValue || 0 },
    { metric: 'Retail Market Value', amount: data?.retailValue || 0 },
    { metric: 'Potential Gross Margin', amount: potentialProfit > 0 ? potentialProfit : 0 },
  ];

  const handleExportCSV = () => {
    if (!data) return;
    exportToCsv(
      `inventory_valuation_report_${new Date().toISOString().slice(0, 10)}`,
      [
        { label: 'Inventory Valuation Metric', key: 'metric' },
        { label: 'Value / Amount', key: 'amount' },
      ],
      [
        { metric: 'Total Physical Units in Stock', amount: String(data.stockQuantity || 0) },
        { metric: 'Inventory Cost Basis ($)', amount: (data.stockCostValue || 0).toFixed(2) },
        { metric: 'Retail Market Value ($)', amount: (data.retailValue || 0).toFixed(2) },
        { metric: 'Potential Gross Margin ($)', amount: potentialProfit.toFixed(2) },
        { metric: 'Low Stock SKU Count', amount: String(data.lowStockCount || 0) },
        { metric: 'Out of Stock SKU Count', amount: String(data.outOfStockCount || 0) },
      ]
    );
  };

  return (
    <PageContainer
      title="Inventory Asset Valuation Report"
      subtitle="Live stock quantity valuation, asset cost basis, retail market value, and inventory risk indicators"
    >
      {/* Header Actions */}
      <Card variant="borderless" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Real-time snapshot generated from active database stock records
            </Text>
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

      {/* Valuation Metrics Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Total Units in Stock"
              value={data?.stockQuantity || 0}
              prefix={<InboxOutlined />}
              precision={0}
              styles={{ content: { color: '#09090b', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Inventory Asset Cost Basis"
              value={data?.stockCostValue || 0}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#ea580c', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Retail Market Value"
              value={data?.retailValue || 0}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#005a32', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Potential Gross Retail Margin"
              value={potentialProfit}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#005a32', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Low Stock Variants Alert"
              value={data?.lowStockCount || 0}
              prefix={<WarningOutlined />}
              precision={0}
              styles={{ content: { color: (data?.lowStockCount || 0) > 0 ? '#ea580c' : '#005a32', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Out of Stock Variants"
              value={data?.outOfStockCount || 0}
              precision={0}
              styles={{ content: { color: (data?.outOfStockCount || 0) > 0 ? '#cf1322' : '#8c8c8c', fontWeight: 700 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Asset Valuation Chart */}
      <Card title="Asset Valuation Comparison (Cost vs Retail Value)" variant="borderless" loading={query.isLoading}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="metric" tick={{ fontSize: 13, fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            <Bar dataKey="amount" fill="#005a32" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </PageContainer>
  );
}
