'use client';

import React, { useState, useMemo } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  GlobalOutlined,
  InboxOutlined,
  PhoneOutlined,
  PrinterOutlined,
  SearchOutlined,
  SendOutlined,
  ShopOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { salesService } from '@/services/resources.service';
import type { Sale, FulfillmentStatus } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { formatDateTime } from '@/utils/format';
import { useAuthStore } from '@/lib/store/auth';
import { UserRole } from '@/types/auth';
import { exportToCsv } from '@/utils/export';

const { Text, Title } = Typography;

export default function SalesPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);

  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'online' | 'pos'>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Sale | null>(null);
  const [waybillModalOpen, setWaybillModalOpen] = useState(false);

  const [deliveryForm] = Form.useForm<{
    fulfillmentStatus: FulfillmentStatus;
    deliveryCarrier?: string;
    trackingNumber?: string;
    notes?: string;
  }>();

  const query = useQuery({ queryKey: queryKeys.sales.all, queryFn: () => salesService.list() });

  const cancel = useMutation({
    mutationFn: salesService.cancel,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
      ]);
      message.success('Order cancelled and inventory stock restored');
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const updateDelivery = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      salesService.updateDelivery(id, payload),
    onSuccess: async (updatedSale) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sales.all });
      message.success('Delivery & fulfillment status updated successfully');
      setSelected(updatedSale);
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const allSales = query.data || [];

  // Summary Metrics
  const metrics = useMemo(() => {
    const onlineOrders = allSales.filter((s) => s.invoiceNumber.startsWith('INV-ONLINE'));
    const posSales = allSales.filter((s) => !s.invoiceNumber.startsWith('INV-ONLINE'));
    const totalRevenue = allSales
      .filter((s) => s.saleStatus === 'completed')
      .reduce((sum, s) => sum + s.grandTotal, 0);
    const onlineRevenue = onlineOrders
      .filter((s) => s.saleStatus === 'completed')
      .reduce((sum, s) => sum + s.grandTotal, 0);
    const pendingFulfillment = onlineOrders.filter(
      (s) => !s.fulfillmentStatus || s.fulfillmentStatus === 'pending' || s.fulfillmentStatus === 'processing'
    ).length;

    return {
      totalCount: allSales.length,
      totalRevenue,
      onlineCount: onlineOrders.length,
      onlineRevenue,
      posCount: posSales.length,
      pendingFulfillment,
    };
  }, [allSales]);

  // Filtered Sales List
  const filtered = useMemo(() => {
    return allSales.filter((sale) => {
      const isOnline = sale.invoiceNumber.startsWith('INV-ONLINE');

      // Channel Filter
      if (channelFilter === 'online' && !isOnline) return false;
      if (channelFilter === 'pos' && isOnline) return false;

      // Fulfillment Filter
      if (fulfillmentFilter !== 'all') {
        const currentFulfillment = sale.fulfillmentStatus || 'pending';
        if (currentFulfillment !== fulfillmentFilter) return false;
      }

      // Payment Filter
      if (paymentFilter !== 'all' && sale.paymentMethod !== paymentFilter) return false;

      // Search
      const term = search.toLowerCase().trim();
      if (!term) return true;

      const customerName = sale.customer?.name || '';
      const customerPhone = sale.customer?.phone || '';
      const customerAddress = sale.customer?.address || '';
      const invoiceNo = sale.invoiceNumber || '';
      const carrier = sale.deliveryCarrier || '';
      const tracking = sale.trackingNumber || '';
      const notes = sale.notes || '';

      return (
        invoiceNo.toLowerCase().includes(term) ||
        customerName.toLowerCase().includes(term) ||
        customerPhone.toLowerCase().includes(term) ||
        customerAddress.toLowerCase().includes(term) ||
        carrier.toLowerCase().includes(term) ||
        tracking.toLowerCase().includes(term) ||
        notes.toLowerCase().includes(term)
      );
    });
  }, [allSales, channelFilter, fulfillmentFilter, paymentFilter, search]);

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load sales & orders"
        message={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const renderPaymentTag = (method?: string) => {
    switch (method) {
      case 'aba_khqr':
        return <Tag color="#15803d">ABA KHQR</Tag>;
      case 'cod':
        return <Tag color="#ea580c">COD (Cash on Delivery)</Tag>;
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

  const renderFulfillmentBadge = (status?: string) => {
    switch (status) {
      case 'processing':
        return (
          <Tag color="processing" icon={<SyncOutlined spin />}>
            PACKING
          </Tag>
        );
      case 'out_for_delivery':
        return (
          <Tag color="purple" icon={<CarOutlined />}>
            OUT FOR DELIVERY
          </Tag>
        );
      case 'delivered':
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            DELIVERED
          </Tag>
        );
      case 'cancelled':
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            CANCELLED
          </Tag>
        );
      default:
        return (
          <Tag color="warning" icon={<InboxOutlined />}>
            PENDING
          </Tag>
        );
    }
  };

  const handleOpenDetail = (record: Sale) => {
    setSelected(record);
    deliveryForm.setFieldsValue({
      fulfillmentStatus: record.fulfillmentStatus || 'pending',
      deliveryCarrier: record.deliveryCarrier || '',
      trackingNumber: record.trackingNumber || '',
      notes: record.notes || '',
    });
  };

  const handleQuickStatusChange = (saleId: string, newStatus: string) => {
    updateDelivery.mutate({
      id: saleId,
      payload: { fulfillmentStatus: newStatus },
    });
  };

  const handleSaveDeliveryForm = (values: any) => {
    if (!selected) return;
    updateDelivery.mutate({
      id: selected._id,
      payload: values,
    });
  };

  const handleExportCSV = () => {
    exportToCsv<Sale>(
      `sales_transactions_${new Date().toISOString().slice(0, 10)}`,
      [
        { label: 'Invoice Number', key: 'invoiceNumber' },
        { label: 'Date & Time', key: (r) => formatDateTime(r.createdAt) },
        { label: 'Channel', key: (r) => (r.invoiceNumber?.startsWith('INV-ONLINE') ? 'Online Store' : 'POS Counter') },
        { label: 'Customer Name', key: (r) => r.customer?.name || 'Walk-in Customer' },
        { label: 'Customer Phone', key: (r) => r.customer?.phone || '-' },
        { label: 'Customer Address', key: (r) => r.customer?.address || '-' },
        { label: 'Carrier', key: (r) => r.deliveryCarrier || '-' },
        { label: 'Tracking #', key: (r) => r.trackingNumber || '-' },
        { label: 'Payment Method', key: (r) => r.paymentMethod?.toUpperCase() || 'CASH' },
        { label: 'Sale Status', key: (r) => r.saleStatus?.toUpperCase() || 'COMPLETED' },
        { label: 'Fulfillment Status', key: (r) => r.fulfillmentStatus?.toUpperCase() || 'DELIVERED' },
        { label: 'Items Count', key: (r) => r.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0 },
        { label: 'Subtotal ($)', key: (r) => (r.subtotal || 0).toFixed(2) },
        { label: 'Discount ($)', key: (r) => (r.discount || 0).toFixed(2) },
        { label: 'Tax Amount ($)', key: (r) => (r.tax || 0).toFixed(2) },
        { label: 'Grand Total ($)', key: (r) => (r.grandTotal || 0).toFixed(2) },
      ],
      filtered
    );
  };

  return (
    <PageContainer
      title="Sales & Online Order Fulfillment"
      subtitle="Track online customer orders, verify payments, manage delivery dispatch & tracking, and print shipping waybills"
      extra={
        <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
          Export CSV ({filtered.length})
        </Button>
      }
    >
      {/* 1. Summary Metric Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ background: '#ffffff' }}>
            <Statistic
              title="Total Store Revenue"
              value={metrics.totalRevenue}
              precision={2}
              prefix="$"
              styles={{ content: { color: '#09090b', fontWeight: 'bold' } }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {metrics.totalCount} Total Transactions
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ background: '#ffffff' }}>
            <Statistic
              title="Online Store Orders"
              value={metrics.onlineRevenue}
              precision={2}
              prefix="$"
              styles={{ content: { color: '#15803d', fontWeight: 'bold' } }}
            />
            <Text style={{ color: '#15803d', fontSize: 12, fontWeight: 500 }}>
              {metrics.onlineCount} Online Orders Total
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ background: '#ffffff' }}>
            <Statistic
              title="Pending Delivery Dispatch"
              value={metrics.pendingFulfillment}
              styles={{ content: { color: '#ea580c', fontWeight: 'bold' } }}
            />
            <Text style={{ color: '#ea580c', fontSize: 12 }}>
              Need Packing or Delivery
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ background: '#ffffff' }}>
            <Statistic
              title="Active Customers"
              value={allSales.filter((s) => s.customer).length}
              styles={{ content: { color: '#09090b', fontWeight: 'bold' } }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Recorded in Database
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 2. Main Table & Filters */}
      <Card variant="borderless">
        <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Radio.Group
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">
                All Orders ({metrics.totalCount})
              </Radio.Button>
              <Radio.Button value="online">
                Online Store ({metrics.onlineCount})
              </Radio.Button>
              <Radio.Button value="pos">
                In-Store POS ({metrics.posCount})
              </Radio.Button>
            </Radio.Group>
          </Col>

          <Col xs={24} md={12}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Select
                value={fulfillmentFilter}
                onChange={setFulfillmentFilter}
                style={{ width: 170 }}
                options={[
                  { value: 'all', label: 'All Delivery Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Packing' },
                  { value: 'out_for_delivery', label: 'Out for Delivery' },
                  { value: 'delivered', label: 'Delivered' },
                ]}
              />
              <Select
                value={paymentFilter}
                onChange={setPaymentFilter}
                style={{ width: 150 }}
                options={[
                  { value: 'all', label: 'All Payments' },
                  { value: 'aba_khqr', label: 'ABA KHQR' },
                  { value: 'cod', label: 'Cash on Delivery' },
                  { value: 'cash', label: 'Cash (POS)' },
                  { value: 'card', label: 'Credit Card' },
                ]}
              />
              <Input
                aria-label="Search orders"
                placeholder="Search invoice, customer, address, carrier..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ width: 260 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </Space>
          </Col>
        </Row>

        <Table<Sale>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          columns={[
            {
              title: 'Invoice / Order #',
              dataIndex: 'invoiceNumber',
              render: (value: string) => {
                const isOnline = value.startsWith('INV-ONLINE');
                return (
                  <div>
                    <b style={{ color: '#09090b' }}>{value}</b>
                    <div style={{ marginTop: 2 }}>
                      {isOnline ? (
                        <Tag color="green" icon={<GlobalOutlined />}>
                          Online Store
                        </Tag>
                      ) : (
                        <Tag color="default" icon={<ShopOutlined />}>
                          In-Store POS
                        </Tag>
                      )}
                    </div>
                  </div>
                );
              },
            },
            {
              title: 'Date & Time',
              dataIndex: 'saleDate',
              render: (value: string) => formatDateTime(value),
            },
            {
              title: 'Customer & Delivery Location',
              dataIndex: 'customer',
              render: (customer: Sale['customer']) => {
                if (!customer) {
                  return (
                    <Text type="secondary">
                      <i>Walk-in Customer</i>
                    </Text>
                  );
                }
                return (
                  <div style={{ maxWidth: 240 }}>
                    <div style={{ fontWeight: 600, color: '#09090b' }}>{customer.name}</div>
                    {customer.phone && (
                      <div style={{ fontSize: 12, color: '#15803d' }}>
                        <a href={`tel:${customer.phone}`} style={{ color: '#15803d' }}>
                          <PhoneOutlined style={{ marginRight: 4 }} />
                          {customer.phone}
                        </a>
                      </div>
                    )}
                    {customer.address && (
                      <div style={{ fontSize: 11, color: '#595959', marginTop: 2 }}>
                        <EnvironmentOutlined style={{ marginRight: 4, color: '#ea580c' }} />
                        <span>{customer.address}</span>
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              title: 'Total Amount',
              dataIndex: 'grandTotal',
              render: (value: number) => <b style={{ fontSize: 14 }}>${value.toFixed(2)}</b>,
            },
            {
              title: 'Payment Method',
              dataIndex: 'paymentMethod',
              render: (value?: string) => renderPaymentTag(value),
            },
            {
              title: 'Delivery & Fulfillment',
              dataIndex: 'fulfillmentStatus',
              render: (value: string | undefined, record) => {
                const isOnline = record.invoiceNumber.startsWith('INV-ONLINE');
                if (!isOnline) {
                  return <Tag color="default">IN-STORE PICKUP</Tag>;
                }
                return (
                  <div>
                    <div>{renderFulfillmentBadge(value)}</div>
                    {/* Fast Status Switcher */}
                    <div style={{ marginTop: 4 }}>
                      <Select
                        size="small"
                        value={value || 'pending'}
                        onChange={(newVal) => handleQuickStatusChange(record._id, newVal)}
                        style={{ width: 130, fontSize: 11 }}
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'processing', label: 'Packing' },
                          { value: 'out_for_delivery', label: 'Out for Deliv.' },
                          { value: 'delivered', label: 'Delivered' },
                        ]}
                      />
                    </div>
                  </div>
                );
              },
            },
            {
              title: 'Actions',
              fixed: 'right',
              render: (_, record) => (
                <Space>
                  <Button
                    aria-label={`View ${record.invoiceNumber}`}
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleOpenDetail(record)}
                  >
                    Manage
                  </Button>
                  <Button
                    aria-label={`Waybill ${record.invoiceNumber}`}
                    size="small"
                    icon={<PrinterOutlined />}
                    title="Print Delivery Waybill & Shipping Slip"
                    onClick={() => {
                      setSelected(record);
                      setWaybillModalOpen(true);
                    }}
                  >
                    Waybill
                  </Button>
                  {role === UserRole.ADMIN && record.saleStatus === 'completed' && (
                    <Popconfirm
                      title="Cancel Order & Restore Stock"
                      description="This will mark the order cancelled, refund payment, and automatically return all items to inventory. Continue?"
                      onConfirm={() => cancel.mutate(record._id)}
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        aria-label={`Cancel ${record.invoiceNumber}`}
                        size="small"
                        danger
                        icon={<CloseCircleOutlined />}
                      />
                    </Popconfirm>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* 3. Comprehensive Order & Delivery Dispatch Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{selected?.invoiceNumber || 'Order Details'}</span>
            {selected?.invoiceNumber.startsWith('INV-ONLINE') ? (
              <Tag color="green">Online Store Order</Tag>
            ) : (
              <Tag color="default">In-Store POS Sale</Tag>
            )}
          </div>
        }
        open={Boolean(selected) && !waybillModalOpen}
        onCancel={() => setSelected(null)}
        footer={
          <Space>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => {
                setWaybillModalOpen(true);
              }}
            >
              Print Shipping Waybill Slip
            </Button>
            <Button type="primary" onClick={() => setSelected(null)}>
              Close
            </Button>
          </Space>
        }
        width={820}
      >
        {selected && (
          <div>
            {/* Customer & Location Tools */}
            <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
              Customer Information & Delivery Location
            </Title>
            <Descriptions
              bordered
              size="small"
              column={{ xs: 1, sm: 2 }}
              items={[
                {
                  key: 'customer',
                  label: 'Customer Name',
                  children: <b>{selected.customer?.name || 'Walk-in Customer'}</b>,
                },
                {
                  key: 'phone',
                  label: 'Contact Phone',
                  children: selected.customer?.phone ? (
                    <Space>
                      <a href={`tel:${selected.customer.phone}`} style={{ color: '#15803d', fontWeight: 600 }}>
                        <PhoneOutlined /> {selected.customer.phone}
                      </a>
                      <a
                        href={`https://t.me/+855${selected.customer.phone.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Tag color="#0284c7" style={{ cursor: 'pointer' }}>
                          <SendOutlined /> Telegram
                        </Tag>
                      </a>
                    </Space>
                  ) : (
                    '—'
                  ),
                },
                {
                  key: 'date',
                  label: 'Order Date & Time',
                  children: formatDateTime(selected.saleDate),
                },
                {
                  key: 'email',
                  label: 'Email',
                  children: selected.customer?.email || '—',
                },
                {
                  key: 'address',
                  label: 'Delivery Address & GPS Pin',
                  span: 2,
                  children: (() => {
                    const rawAddress = selected.shippingAddress || selected.customer?.address || '';
                    const combined = `${rawAddress} ${selected.notes || ''}`;
                    const directMapMatch = combined.match(/https?:\/\/(?:www\.)?(?:google\.com\/maps[^\s\]]+|maps\.app\.goo\.gl\/[^\s\]]+|maps\.google\.com[^\s\]]+)/i);
                    const mapUrl = directMapMatch
                      ? directMapMatch[0]
                      : rawAddress
                      ? `https://maps.google.com/?q=${encodeURIComponent(rawAddress.replace(/\[Maps:[^\]]+\]/i, '').trim() + ', Cambodia')}`
                      : null;

                    return (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#09090b' }}>
                          {rawAddress || 'In-store Pickup / Walk-in'}
                        </div>
                        {mapUrl && (
                          <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <a href={mapUrl} target="_blank" rel="noreferrer">
                              <Tag color="#15803d" style={{ cursor: 'pointer', fontWeight: 600 }}>
                                <EnvironmentOutlined /> {directMapMatch ? 'Open Pinned GPS Location on Google Maps' : 'Search Address on Google Maps'}
                              </Tag>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })(),
                },
                ...(selected.notes
                  ? [
                      {
                        key: 'notes',
                        label: 'Customer Order Notes',
                        span: 2,
                        children: (
                          <Text style={{ color: '#ea580c', fontWeight: 500 }}>
                            {selected.notes}
                          </Text>
                        ),
                      },
                    ]
                  : []),
              ]}
            />

            {/* Delivery Tracking & Carrier Management Form */}
            <Title level={5} style={{ marginTop: 18, marginBottom: 8 }}>
              Delivery Dispatch & Carrier Tracking
            </Title>
            <Card variant="borderless" style={{ background: '#fafafa', marginBottom: 16 }}>
              <Form
                form={deliveryForm}
                layout="vertical"
                onFinish={handleSaveDeliveryForm}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Fulfillment Status" name="fulfillmentStatus" rules={[{ required: true }]}>
                      <Select
                        options={[
                          { value: 'pending', label: 'Pending (Waiting)' },
                          { value: 'processing', label: 'Processing / Packing' },
                          { value: 'out_for_delivery', label: 'Out for Delivery' },
                          { value: 'delivered', label: 'Delivered to Customer' },
                          { value: 'cancelled', label: 'Cancelled' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Delivery Carrier / Driver" name="deliveryCarrier">
                      <Select
                        placeholder="Select or type carrier"
                        allowClear
                        options={[
                          { value: 'Virak Buntham (VET)', label: 'Virak Buntham Express (VET)' },
                          { value: 'J&T Express', label: 'J&T Express' },
                          { value: 'Grab Express', label: 'Grab Express' },
                          { value: 'Foodpanda Shops', label: 'Foodpanda Courier' },
                          { value: 'Internal Store Driver', label: 'Internal Store Driver' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Carrier Tracking #" name="trackingNumber">
                      <Input placeholder="e.g. VET-9821882" />
                    </Form.Item>
                  </Col>
                </Row>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateDelivery.isPending}
                  style={{ backgroundColor: '#15803d', borderColor: '#15803d' }}
                >
                  Save Delivery & Dispatch Status
                </Button>
              </Form>
            </Card>

            {/* Ordered Items Table */}
            <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>
              Ordered Items Breakdown
            </Title>
            <Table
              rowKey={(item) => item.sku}
              size="small"
              pagination={false}
              dataSource={selected.items}
              columns={[
                { title: 'Product Name', dataIndex: 'productName', render: (val) => <b>{val}</b> },
                { title: 'SKU', dataIndex: 'sku', render: (val) => <code>{val}</code> },
                { title: 'Size / Color', render: (_, item) => `${item.size} / ${item.color}` },
                { title: 'Qty', dataIndex: 'quantity', align: 'center' },
                {
                  title: 'Unit Price',
                  dataIndex: 'unitPrice',
                  align: 'right',
                  render: (value: number) => `$${value.toFixed(2)}`,
                },
                {
                  title: 'Subtotal',
                  dataIndex: 'subtotal',
                  align: 'right',
                  render: (value: number) => <b>${value.toFixed(2)}</b>,
                },
              ]}
            />

            {/* Financial Summary */}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 280 }}>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Subtotal">
                    ${selected.subtotal.toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="VAT / Tax (10%)">
                    ${selected.tax.toFixed(2)}
                  </Descriptions.Item>
                  {selected.discount > 0 && (
                    <Descriptions.Item label="Discount Applied">
                      <span style={{ color: '#16a34a' }}>-${selected.discount.toFixed(2)}</span>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label={<b style={{ fontSize: 15 }}>Grand Total</b>}>
                    <b style={{ fontSize: 16, color: '#09090b' }}>
                      ${selected.grandTotal.toFixed(2)}
                    </b>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 4. Printable Parcel Waybill / Shipping Slip Sticker */}
      <Modal
        title="Delivery Shipping Waybill Slip (ប័ណ្ណដឹកជញ្ជូនទំនិញ)"
        open={waybillModalOpen}
        onCancel={() => setWaybillModalOpen(false)}
        footer={
          <Space>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              style={{ backgroundColor: '#15803d', borderColor: '#15803d' }}
            >
              Print Waybill Sticker
            </Button>
            <Button onClick={() => setWaybillModalOpen(false)}>Close</Button>
          </Space>
        }
        width={600}
      >
        {selected && (
          <div
            id="shipping-waybill-slip"
            style={{
              padding: 20,
              border: '2px dashed #09090b',
              borderRadius: 8,
              background: '#ffffff',
              color: '#09090b',
              fontFamily: 'sans-serif',
            }}
          >
            {/* Waybill Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #09090b', paddingBottom: 10, marginBottom: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
                  MY STYLE BOUTIQUE
                </h2>
                <div style={{ fontSize: 11, color: '#595959' }}>Express Nationwide Delivery Service</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <b style={{ fontSize: 14 }}>{selected.invoiceNumber}</b>
                <div style={{ fontSize: 11 }}>{formatDateTime(selected.saleDate)}</div>
              </div>
            </div>

            {/* Sender & Receiver Box */}
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={12} style={{ borderRight: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase' }}>FROM (SENDER):</div>
                <b style={{ fontSize: 13 }}>My Style Store Cambodia</b>
                <div style={{ fontSize: 12 }}>Phnom Penh City, Cambodia</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Tel: 012 345 678</div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#ea580c', textTransform: 'uppercase', fontWeight: 600 }}>
                  DELIVER TO (RECEIVER):
                </div>
                <b style={{ fontSize: 14, color: '#09090b' }}>
                  {selected.customer?.name || 'Customer'}
                </b>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#15803d', marginTop: 2 }}>
                  TEL: {selected.customer?.phone || '—'}
                </div>
                <div style={{ fontSize: 12, marginTop: 2, background: '#f5f5f5', padding: '4px 6px', borderRadius: 4, fontWeight: 500 }}>
                  {selected.shippingAddress || selected.customer?.address || 'Phnom Penh'}
                </div>
              </Col>
            </Row>

            {/* Carrier & Payment Banner */}
            <div
              style={{
                background: selected.paymentMethod === 'cod' ? '#fff7ed' : '#f0fdf4',
                border: selected.paymentMethod === 'cod' ? '1px solid #fdba74' : '1px solid #86efac',
                padding: '8px 12px',
                borderRadius: 6,
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#595959' }}>Payment Method:</div>
                <b style={{ fontSize: 13, textTransform: 'uppercase' }}>
                  {selected.paymentMethod?.replace('_', ' ') || 'PAID'}
                </b>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#595959' }}>
                  {selected.paymentMethod === 'cod' ? 'COLLECT FROM CUSTOMER (COD):' : 'AMOUNT (PAID):'}
                </div>
                <b style={{ fontSize: 18, color: selected.paymentMethod === 'cod' ? '#ea580c' : '#15803d' }}>
                  ${selected.grandTotal.toFixed(2)}
                </b>
              </div>
            </div>

            {/* Package Contents */}
            <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#595959', marginBottom: 4 }}>
                PACKAGE CONTENTS ({selected.items.reduce((s, it) => s + it.quantity, 0)} items):
              </div>
              {selected.items.map((it, idx) => (
                <div key={idx} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>
                    [ ] {it.productName} ({it.size}/{it.color})
                  </span>
                  <b>x{it.quantity}</b>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div style={{ marginTop: 10, padding: 6, background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 4, fontSize: 11 }}>
                <b>Note:</b> {selected.notes}
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}

