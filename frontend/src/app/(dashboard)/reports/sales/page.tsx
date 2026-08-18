'use client';

import React, { useState } from 'react';
import { Button, Card, Col, DatePicker, Row, Space, Statistic, Table, Typography } from 'antd';
import { DollarOutlined, DownloadOutlined, PrinterOutlined, ShoppingCartOutlined, RiseOutlined } from '@ant-design/icons';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { getReport } from '@/services/resources.service';
import type { SalesReport } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { formatDate } from '@/utils/format';
import { exportToCsv } from '@/utils/export';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export default function SalesReportPage() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const startDateStr = dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
  const endDateStr = dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;

  const query = useQuery({
    queryKey: queryKeys.reports.sales({ startDate: startDateStr, endDate: endDateStr }),
    queryFn: () => {
      const params: Record<string, string> = {};
      if (startDateStr) params.startDate = startDateStr;
      if (endDateStr) params.endDate = endDateStr;
      return getReport<SalesReport[]>('sales', params);
    },
  });

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load sales report"
        message={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const reportsData = query.data || [];
  const totalRevenue = reportsData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = reportsData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const handleExportCSV = () => {
    exportToCsv<SalesReport>(
      `sales_report_${startDateStr || 'all'}_to_${endDateStr || 'all'}`,
      [
        { label: 'Business Date', key: (r) => formatDate(r.date) },
        { label: 'Completed Orders', key: 'orders' },
        { label: 'Total Revenue ($)', key: (r) => r.revenue.toFixed(2) },
        { label: 'Average Order Value ($)', key: (r) => r.averageOrder.toFixed(2) },
      ],
      reportsData
    );
  };

  return (
    <PageContainer
      title="Sales Performance Report"
      subtitle="Completed POS sales volume, revenue breakdown, and daily transaction analytics"
    >
      {/* Date Filter & Actions Header */}
      <Card variant="borderless" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
              Filter Report Date Range:
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

      {/* Metric Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Total Revenue (incl. tax)"
              value={totalRevenue}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#005a32', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Total Completed Orders"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
              precision={0}
              styles={{ content: { color: '#09090b', fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" loading={query.isLoading}>
            <Statistic
              title="Average Order Value"
              value={avgOrderValue}
              prefix="$"
              precision={2}
              styles={{ content: { color: '#ea580c', fontWeight: 700 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Daily Revenue Area Chart */}
      <Card title="Daily Sales Trend" variant="borderless" style={{ marginBottom: 20 }} loading={query.isLoading}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={reportsData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            <Area type="monotone" dataKey="revenue" stroke="#005a32" fill="#005a32" fillOpacity={0.15} strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Sales Table */}
      <Card title="Daily Breakdown Table" variant="borderless">
        <Table<SalesReport>
          rowKey="date"
          loading={query.isLoading}
          dataSource={reportsData}
          pagination={{ pageSize: 15 }}
          columns={[
            {
              title: 'Business Date',
              dataIndex: 'date',
              render: formatDate,
            },
            {
              title: 'Orders Count',
              dataIndex: 'orders',
              render: (value: number) => <Text style={{ fontWeight: 600 }}>{value}</Text>,
            },
            {
              title: 'Total Revenue',
              dataIndex: 'revenue',
              render: (value: number) => (
                <Text style={{ fontWeight: 700, color: '#005a32' }}>${value.toFixed(2)}</Text>
              ),
            },
            {
              title: 'Average Order Size',
              dataIndex: 'averageOrder',
              render: (value: number) => `$${value.toFixed(2)}`,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
