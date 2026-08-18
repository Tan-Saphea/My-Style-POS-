'use client';

import React, { useState } from 'react';
import { Button, Card, Col, DatePicker, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { DownloadOutlined, PrinterOutlined, TrophyOutlined, ShoppingOutlined, DollarOutlined } from '@ant-design/icons';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { getReport } from '@/services/resources.service';
import type { BestSellingProduct } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { exportToCsv } from '@/utils/export';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function TopProductsReportPage() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const startDateStr = dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
  const endDateStr = dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;

  const query = useQuery({
    queryKey: queryKeys.reports.topProducts({ startDate: startDateStr, endDate: endDateStr }),
    queryFn: () => {
      const params: Record<string, string> = {};
      if (startDateStr) params.startDate = startDateStr;
      if (endDateStr) params.endDate = endDateStr;
      return getReport<BestSellingProduct[]>('top-products', params);
    },
  });

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load best-selling products"
        message={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const reportsData = query.data || [];
  const topProduct = reportsData[0];
  const totalUnitsSold = reportsData.reduce((sum, item) => sum + item.unitsSold, 0);
  const totalRevenue = reportsData.reduce((sum, item) => sum + item.revenue, 0);

  const handleExportCSV = () => {
    exportToCsv<BestSellingProduct>(
      `top_products_ranking_${startDateStr || 'all'}_to_${endDateStr || 'all'}`,
      [
        { label: 'Rank', key: (_, index) => (index !== undefined ? index + 1 : 1) },
        { label: 'Product Name', key: 'product' },
        { label: 'Units Sold', key: 'unitsSold' },
        { label: 'Revenue ($)', key: (r) => r.revenue.toFixed(2) },
      ],
      reportsData
    );
  };

  return (
    <PageContainer
      title="Best-Selling Products Ranking"
      subtitle="Top performing garment styles, highest units sold, and product revenue ranking"
    >
      {/* Filter Header */}
      <Card variant="borderless" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
              Filter Sales Ranking Date Range:
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
              Print Ranking Report
            </Button>
          </Space>
        </div>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="#1 Top Garment Item"
              value={topProduct?.product || 'None'}
              prefix={<TrophyOutlined style={{ color: '#ea580c' }} />}
              styles={{ content: { fontSize: 18, fontWeight: 700, color: '#09090b' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Total Units Sold"
              value={totalUnitsSold}
              prefix={<ShoppingOutlined />}
              precision={0}
              styles={{ content: { color: '#09090b', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Top Products Total Revenue"
              value={totalRevenue}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#005a32', fontWeight: 700 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Top 10 Horizontal Bar Chart */}
      <Card title="Top 10 Products by Units Sold" variant="borderless" style={{ marginBottom: 20 }} loading={query.isLoading}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={reportsData.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis dataKey="product" type="category" width={140} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="unitsSold" fill="#005a32" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Leaderboard Table */}
      <Card title="Product Sales Leaderboard Table" variant="borderless">
        <Table<BestSellingProduct>
          rowKey="product"
          loading={query.isLoading}
          dataSource={reportsData}
          columns={[
            {
              title: 'Rank',
              width: 90,
              render: (_, __, index) => {
                const rank = index + 1;
                if (rank === 1) return <Tag color="gold" style={{ fontWeight: 700 }}>#1 Rank</Tag>;
                if (rank === 2) return <Tag color="default" style={{ fontWeight: 700 }}>#2 Rank</Tag>;
                if (rank === 3) return <Tag color="orange" style={{ fontWeight: 700 }}>#3 Rank</Tag>;
                return <Tag style={{ fontWeight: 500 }}>#{rank}</Tag>;
              },
            },
            {
              title: 'Product Name',
              dataIndex: 'product',
              render: (value: string) => <Text strong style={{ fontSize: 14 }}>{value}</Text>,
            },
            {
              title: 'Units Sold',
              dataIndex: 'unitsSold',
              render: (value: number) => <Text style={{ fontWeight: 600 }}>{value} units</Text>,
            },
            {
              title: 'Generated Revenue',
              dataIndex: 'revenue',
              render: (value: number) => (
                <Text style={{ fontWeight: 700, color: '#005a32' }}>${value.toFixed(2)}</Text>
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
