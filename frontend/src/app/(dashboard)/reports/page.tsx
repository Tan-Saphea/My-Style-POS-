'use client';

import React from 'react';
import { Card, Row, Col, Typography, Tag, Button } from 'antd';
import {
  DollarOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import PageContainer from '@/components/common/PageContainer';
import { ROUTES } from '@/constants/routes';

const { Title, Text } = Typography;

export default function ReportsPage() {
  const reportCards = [
    {
      title: 'Sales Report',
      desc: 'Daily revenue, completed order volume, and average invoice size analytics',
      icon: <DollarOutlined />,
      path: ROUTES.REPORTS_SALES,
      color: '#005a32',
      category: 'FINANCIAL',
    },
    {
      title: 'Profit & Loss Statement',
      desc: 'Gross profit margins, historical COGS breakdown, and tax collection summary',
      icon: <RiseOutlined />,
      path: ROUTES.REPORTS_PROFIT,
      color: '#238b45',
      category: 'FINANCIAL',
    },
    {
      title: 'Purchase Report',
      desc: 'Supplier procurement volume, restocking expenditure, and vendor totals',
      icon: <ShoppingCartOutlined />,
      path: ROUTES.REPORTS_PURCHASES,
      color: '#722ed1',
      category: 'PROCUREMENT',
    },
    {
      title: 'Inventory Valuation',
      desc: 'Stock asset cost value, potential retail value, and out-of-stock risk metrics',
      icon: <InboxOutlined />,
      path: ROUTES.REPORTS_INVENTORY,
      color: '#fa8c16',
      category: 'INVENTORY',
    },
    {
      title: 'Best-Selling Products',
      desc: 'Top performing clothing styles, colors, and high-demand garment sizes ranking',
      icon: <TrophyOutlined />,
      path: ROUTES.REPORTS_TOP_PRODUCTS,
      color: '#eb2f96',
      category: 'ANALYTICS',
    },
  ];

  return (
    <PageContainer
      title="Business Reports & Analytics"
      subtitle="Comprehensive financial statements, inventory asset valuation, and store sales performance reports"
    >
      <Row gutter={[20, 20]}>
        {reportCards.map((r) => (
          <Col xs={24} sm={12} lg={8} key={r.title}>
            <Link href={r.path} style={{ textDecoration: 'none' }}>
              <Card
                hoverable
                variant="borderless"
                style={{
                  height: '100%',
                  borderRadius: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 26,
                        color: r.color,
                        background: `${r.color}15`,
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {r.icon}
                    </div>
                    <Tag color={r.category === 'FINANCIAL' ? 'green' : r.category === 'INVENTORY' ? 'orange' : r.category === 'PROCUREMENT' ? 'purple' : 'magenta'}>
                      {r.category}
                    </Tag>
                  </div>
                  <Title level={5} style={{ margin: 0, fontSize: 16 }}>
                    {r.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 6, lineHeight: 1.4 }}>
                    {r.desc}
                  </Text>
                </div>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', color: r.color, fontWeight: 600, fontSize: 13 }}>
                  <span>View Full Report</span>
                  <ArrowRightOutlined style={{ marginLeft: 6 }} />
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
}
