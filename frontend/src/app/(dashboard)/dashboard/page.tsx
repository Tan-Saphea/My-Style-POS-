'use client';

import React from 'react';
import { Card, Col, Row, Table, Tag, Typography } from 'antd';
import {
  DollarOutlined,
  InboxOutlined,
  RiseOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { getDashboard } from '@/services/resources.service';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { useAuthStore } from '@/lib/store/auth';
import { UserRole } from '@/types/auth';
import { formatDateTime } from '@/utils/format';

const { Text } = Typography;

export default function DashboardPage() {
  const role = useAuthStore((state) => state.role);
  const query = useQuery({ queryKey: queryKeys.dashboard.stats, queryFn: getDashboard, refetchInterval: 60_000 });

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        message={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const data = query.data;

  const stats = [
    {
      title: "Today's Revenue",
      value: `$${(data?.todayRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarOutlined />,
      color: '#005a32',
      bgColor: 'rgba(0, 90, 50, 0.1)',
      subtext: 'Live POS sales today',
    },
    {
      title: "Today's Sales",
      value: (data?.todaySalesCount || 0).toLocaleString('en-US'),
      icon: <ShoppingCartOutlined />,
      color: '#1890ff',
      bgColor: 'rgba(24, 144, 255, 0.1)',
      subtext: 'Completed transactions',
    },
    ...(role === UserRole.ADMIN
      ? [
          {
            title: "Today's Gross Profit",
            value: `$${(data?.todayProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: <RiseOutlined />,
            color: '#fa8c16',
            bgColor: 'rgba(250, 140, 22, 0.1)',
            subtext: 'Net profit after cost',
          },
        ]
      : []),
    {
      title: 'Units in Stock',
      value: (data?.totalStock || 0).toLocaleString('en-US'),
      icon: <InboxOutlined />,
      color: '#13c2c2',
      bgColor: 'rgba(19, 194, 194, 0.1)',
      subtext: 'Total available inventory',
    },
    {
      title: 'Products Catalog',
      value: (data?.totalProducts || 0).toLocaleString('en-US'),
      icon: <ShoppingOutlined />,
      color: '#722ed1',
      bgColor: 'rgba(114, 46, 209, 0.1)',
      subtext: 'Active catalog items',
    },
    {
      title: 'Low Stock Variants',
      value: (data?.lowStockCount || 0).toLocaleString('en-US'),
      icon: <WarningOutlined />,
      color: (data?.lowStockCount || 0) > 0 ? '#ff4d4f' : '#238b45',
      bgColor: (data?.lowStockCount || 0) > 0 ? 'rgba(255, 77, 79, 0.1)' : 'rgba(35, 139, 69, 0.1)',
      subtext: (data?.lowStockCount || 0) > 0 ? 'Action required' : 'Stock levels healthy',
    },
    {
      title: 'Customers',
      value: (data?.totalCustomers || 0).toLocaleString('en-US'),
      icon: <TeamOutlined />,
      color: '#eb2f96',
      bgColor: 'rgba(235, 47, 150, 0.1)',
      subtext: 'Registered clients',
    },
    {
      title: 'Suppliers',
      value: (data?.totalSuppliers || 0).toLocaleString('en-US'),
      icon: <ShopOutlined />,
      color: '#2f54eb',
      bgColor: 'rgba(47, 84, 235, 0.1)',
      subtext: 'Active supply vendors',
    },
  ];

  return (
    <PageContainer
      title="Dashboard Overview"
      subtitle="Live sales, inventory, and store performance metrics"
    >
      {/* KPI Stat Cards Grid */}
      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <div className="dash-stat-card">
              <div className="dash-stat-card__top">
                <span className="dash-stat-card__title">{stat.title}</span>
                <div
                  className="dash-stat-card__icon-box"
                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="dash-stat-card__value">{stat.value}</div>
              <div className="dash-stat-card__subtext">{stat.subtext}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Analytics Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={15}>
          <Card title="Seven-Day Sales Trend" variant="borderless" loading={query.isLoading}>
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={data?.salesTrend || []}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005a32" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#005a32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#595959' }} />
                <YAxis tick={{ fontSize: 12, fill: '#595959' }} />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#005a32"
                  fill="url(#salesFill)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card title="Units Sold by Category" variant="borderless" loading={query.isLoading}>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={data?.categoryDistribution || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#595959' }} />
                <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 11, fill: '#595959' }} />
                <Tooltip />
                <Bar dataKey="sales" fill="#722ed1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Table */}
      <Card title="Recent POS Sales" variant="borderless" style={{ marginTop: 20 }}>
        <Table
          rowKey="_id"
          loading={query.isLoading}
          pagination={false}
          dataSource={data?.recentSales || []}
          columns={[
            {
              title: 'Invoice Number',
              dataIndex: 'invoiceNumber',
              render: (value: string) => (
                <Text code style={{ fontSize: 13, fontWeight: 600, color: '#141414' }}>
                  {value}
                </Text>
              ),
            },
            { title: 'Date & Time', dataIndex: 'saleDate', render: formatDateTime },
            {
              title: 'Customer',
              dataIndex: 'customer',
              render: (value?: { name?: string } | string) => {
                if (typeof value === 'object' && value?.name) return value.name;
                return typeof value === 'string' && value ? value : 'Walk-in Customer';
              },
            },
            {
              title: 'Total Amount',
              dataIndex: 'grandTotal',
              render: (value: number) => (
                <Text style={{ fontWeight: 700, color: '#005a32' }}>
                  ${value.toFixed(2)}
                </Text>
              ),
            },
            {
              title: 'Payment Method',
              dataIndex: 'paymentMethod',
              render: (value: string) => (
                <Tag color="blue">{value ? value.replaceAll('_', ' ').toUpperCase() : 'CASH'}</Tag>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'saleStatus',
              render: (value: string) => (
                <Tag color={value === 'completed' ? 'success' : 'error'}>
                  {(value || 'completed').toUpperCase()}
                </Tag>
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
