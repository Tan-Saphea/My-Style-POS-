'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
  Upload,
} from 'antd';
import {
  BankOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  FileTextOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  RocketOutlined,
  SaveOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { getSettings, updateSettings } from '@/services/resources.service';
import type { StoreSettings } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';

const { Title, Text, Paragraph } = Typography;

type SettingsPayload = Omit<StoreSettings, '_id' | 'createdAt' | 'updatedAt' | 'key'>;

export default function SettingsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<SettingsPayload>();
  const [activeTab, setActiveTab] = useState('branding');

  const logoWatch = Form.useWatch('logoUrl', form);
  const storeNameWatch = Form.useWatch('storeName', form);
  const exchangeRateWatch = Form.useWatch('exchangeRateKHR', form) || 4100;
  const taxRateWatch = Form.useWatch('taxRate', form) ?? 10;
  const freeShipWatch = Form.useWatch('freeShippingThreshold', form) ?? 150;

  const query = useQuery({ queryKey: queryKeys.settings, queryFn: getSettings });

  useEffect(() => {
    if (query.data) {
      form.setFieldsValue({
        storeName: query.data.storeName || 'My Style Boutique',
        tagline: query.data.tagline || 'Official Luxury Streetwear & Tailored Clothing Store',
        currency: query.data.currency || 'USD',
        exchangeRateKHR: query.data.exchangeRateKHR ?? 4100,
        taxRate: query.data.taxRate ?? 10,
        freeShippingThreshold: query.data.freeShippingThreshold ?? 150,
        standardShippingFee: query.data.standardShippingFee ?? 12,
        deliveryNotes:
          query.data.deliveryNotes ||
          'Express nationwide delivery across Cambodia via Virak Buntham & J&T Express within 1-2 business days.',
        merchantName: query.data.merchantName || 'MY STYLE BOUTIQUE',
        bakongAccountId: query.data.bakongAccountId || 'mystyle@aclb',
        cashOnDeliveryEnabled: query.data.cashOnDeliveryEnabled ?? true,
        bankTransferDetails:
          query.data.bankTransferDetails ||
          'ABA Bank: 000 123 456 (MY STYLE BOUTIQUE) • ACLEDA: 1234-5678-9012-34',
        receiptHeader: query.data.receiptHeader || 'MY STYLE BOUTIQUE - Flagship Store',
        receiptFooter: query.data.receiptFooter || 'Thank you for shopping with My Style Boutique!',
        receiptNote:
          query.data.receiptNote || 'Items can be exchanged within 30 days with original tags and valid receipt.',
        returnPolicyDays: query.data.returnPolicyDays ?? 30,
        logoUrl: query.data.logoUrl || '',
        phone: query.data.phone || '+855 12 345 678',
        email: query.data.email || 'contact@mystyle.com',
        address: query.data.address || 'Street 271, Sangkat TTP, Phnom Penh, Cambodia',
        city: query.data.city || 'Phnom Penh',
        country: query.data.country || 'Cambodia',
        businessHours: query.data.businessHours || 'Mon - Sun: 08:00 AM - 09:00 PM',
        facebookUrl: query.data.facebookUrl || 'https://facebook.com/mystylecambodia',
        telegramChannel: query.data.telegramChannel || 'https://t.me/mystyleboutique',
        tiktokUrl: query.data.tiktokUrl || 'https://tiktok.com/@mystyle.kh',
        instagramUrl: query.data.instagramUrl || 'https://instagram.com/mystyle.kh',
      });
    }
  }, [form, query.data]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: async (settings) => {
      queryClient.setQueryData(queryKeys.settings, settings);
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      message.success('Store & system settings saved successfully across all platforms');
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const handleLogoUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error('Logo image must be smaller than 5MB');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        form.setFieldValue('logoUrl', result);
        message.success('Store logo loaded successfully');
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load store settings"
        message={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const tabItems = [
    {
      key: 'branding',
      label: (
        <span>
          <ShopOutlined /> Store Profile & Branding
        </span>
      ),
      children: (
        <div>
          {/* Store Branding Header Preview */}
          <div
            style={{
              marginBottom: 24,
              padding: '20px 24px',
              borderRadius: 12,
              background: '#ffffff',
              border: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div
                style={{
                  background: '#fafafa',
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: '1px solid #e4e4e7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 120,
                  height: 70,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoWatch && !logoWatch.includes('unsplash.com') ? logoWatch : '/logo.png'}
                  alt="My Style Logo"
                  style={{ maxHeight: 50, maxWidth: 110, objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: '#09090b', letterSpacing: 0.5 }}>
                  {storeNameWatch || 'My Style Boutique'}
                </Title>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
                  {form.getFieldValue('tagline') || 'Official Luxury Streetwear & Tailored Clothing Store'}
                </Text>
                <div style={{ marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#71717a' }}>
                  <span>Location: {form.getFieldValue('city') || 'Phnom Penh, Cambodia'}</span>
                  <span>•</span>
                  <span>Hours: {form.getFieldValue('businessHours') || '08:00 AM - 09:00 PM'}</span>
                  <span>•</span>
                  <span>Hotline: {form.getFieldValue('phone') || '+855 12 345 678'}</span>
                </div>
              </div>
            </div>
          </div>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Official Store Name"
                name="storeName"
                rules={[{ required: true, whitespace: true, message: 'Store name is required' }, { max: 200 }]}
                help="Appears on Admin, Website header, Mobile App, and POS receipts"
              >
                <Input placeholder="e.g. My Style Boutique" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Store Slogan / Tagline"
                name="tagline"
                rules={[{ max: 300 }]}
                help="Official subtitle for website and mobile application"
              >
                <Input placeholder="e.g. Official Luxury Streetwear & Tailored Clothing Store" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={18}>
              <Form.Item
                label="Store Logo (Image URL or Base64)"
                name="logoUrl"
                help="Enter direct image URL or click 'Upload Logo' to select a high-resolution logo"
              >
                <Input placeholder="https://... or upload from local drive" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Upload Local File">
                <Upload accept="image/*" showUploadList={false} beforeUpload={handleLogoUpload}>
                  <Button icon={<CameraOutlined />} block>
                    Upload Logo
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0 20px' }} />

          <Title level={5} style={{ marginBottom: 16, color: '#09090b' }}>
            Flagship Location & Operating Hours
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Store Hotline Phone"
                name="phone"
                rules={[{ max: 40 }]}
                help="Customer care phone displayed on contact headers"
              >
                <Input prefix={<PhoneOutlined />} placeholder="+855 12 345 678" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Support Email"
                name="email"
                rules={[{ type: 'email' }, { max: 254 }]}
                help="Official contact email for inquiries and receipts"
              >
                <Input prefix={<GlobalOutlined />} placeholder="contact@mystyle.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                label="Physical Boutique Address"
                name="address"
                rules={[{ max: 500 }]}
                help="Full street address of flagship boutique"
              >
                <Input placeholder="Street 271, Sangkat TTP, Phnom Penh, Cambodia" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item label="City" name="city" rules={[{ max: 100 }]}>
                <Input placeholder="Phnom Penh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item label="Country" name="country" rules={[{ max: 100 }]}>
                <Input placeholder="Cambodia" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Operating Hours"
            name="businessHours"
            rules={[{ max: 200 }]}
            help="Displayed on website footer and mobile profile"
          >
            <Input placeholder="Mon - Sun: 08:00 AM - 09:00 PM" />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'financials',
      label: (
        <span>
          <DollarOutlined /> Financials & Currency
        </span>
      ),
      children: (
        <div>
          <Alert
            type="info"
            showIcon
            title="Dual-Currency System (USD & KHR)"
            description="System base currency is USD ($). All product listings, customer checkouts, and KHQR payments support real-time conversion to Khmer Riel (៛) based on the exchange rate configured below."
            style={{ marginBottom: 20 }}
          />

          <Row gutter={20}>
            <Col xs={24} md={8}>
              <Form.Item
                label="System Base Currency"
                name="currency"
                rules={[{ required: true }]}
                help="Default currency for master accounting and pricing"
              >
                <Select disabled options={[{ value: 'USD', label: 'USD ($) — United States Dollar' }]} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Exchange Rate to KHR (៛)"
                name="exchangeRateKHR"
                rules={[{ required: true }]}
                help="1 USD = X Khmer Riel (used for dual currency & KHQR)"
              >
                <InputNumber min={1000} max={10000} precision={0} style={{ width: '100%' }} prefix="៛" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Standard VAT / Tax Rate (%)"
                name="taxRate"
                rules={[{ required: true }]}
                help="Calculated during sales and checkout"
              >
                <InputNumber min={0} max={100} precision={2} suffix="%" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Quick Rate Calculation Summary */}
          <Card size="small" style={{ background: '#f8fafc', borderRadius: 8, marginTop: 8 }}>
            <Text strong style={{ color: '#09090b', display: 'block', marginBottom: 6 }}>
              Live Conversion Preview:
            </Text>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Text type="secondary">Sample Product ($28.00):</Text>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#16a34a' }}>
                  $28.00 = {(28 * exchangeRateWatch).toLocaleString()} KHR
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <Text type="secondary">Tax on $100.00 ({taxRateWatch}%):</Text>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#09090b' }}>
                  +${((100 * taxRateWatch) / 100).toFixed(2)} (Total: ${(100 + (100 * taxRateWatch) / 100).toFixed(2)})
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <Text type="secondary">Free Shipping Threshold:</Text>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#f97316' }}>
                  Orders over ${freeShipWatch}.00 ({ (freeShipWatch * exchangeRateWatch).toLocaleString()} KHR)
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      ),
    },
    {
      key: 'shipping',
      label: (
        <span>
          <RocketOutlined /> Shipping & Express Delivery
        </span>
      ),
      children: (
        <div>
          <Title level={5} style={{ marginBottom: 16, color: '#09090b' }}>
            Nationwide Shipping Rules & Logistics Partners
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Free Shipping Threshold ($ USD)"
                name="freeShippingThreshold"
                rules={[{ required: true }]}
                help="Minimum subtotal amount required for customer to receive free delivery"
              >
                <InputNumber min={0} max={10000} precision={2} prefix="$" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Standard Delivery Fee ($ USD)"
                name="standardShippingFee"
                rules={[{ required: true }]}
                help="Flat rate shipping charge when order total is below free shipping threshold"
              >
                <InputNumber min={0} max={1000} precision={2} prefix="$" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Nationwide Delivery Guarantee & Logistics Note"
            name="deliveryNotes"
            rules={[{ max: 1000 }]}
            help="Displays on product detail pages, checkout summary, and mobile app"
          >
            <Input.TextArea
              rows={3}
              placeholder="e.g. Express nationwide delivery across 25 provinces via Virak Buntham & J&T Express within 1-2 business days."
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'payments',
      label: (
        <span>
          <CreditCardOutlined /> Payment Gateways & KHQR
        </span>
      ),
      children: (
        <div>
          <Title level={5} style={{ marginBottom: 16, color: '#09090b' }}>
            KHQR (Bakong / ABA PAY) & Checkout Methods
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="KHQR Merchant Display Name"
                name="merchantName"
                rules={[{ max: 200 }]}
                help="Official merchant title encoded in Bakong KHQR generator"
              >
                <Input placeholder="e.g. MY STYLE BOUTIQUE" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Bakong Account ID / Phone"
                name="bakongAccountId"
                rules={[{ max: 100 }]}
                help="Your registered Bakong identifier (e.g. mystyle@aclb or phone)"
              >
                <Input placeholder="e.g. mystyle@aclb" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Cash on Delivery (COD)"
                name="cashOnDeliveryEnabled"
                valuePropName="checked"
                help="Allow customers to pay cash upon parcel handover"
              >
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Bank Wire & Direct Transfer Instructions"
            name="bankTransferDetails"
            rules={[{ max: 1000 }]}
            help="Bank account numbers displayed on checkout for manual bank slip transfers"
          >
            <Input.TextArea
              rows={3}
              placeholder="e.g. ABA Bank: 000 123 456 (MY STYLE BOUTIQUE) • ACLEDA: 1234-5678-9012-34"
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'receipts',
      label: (
        <span>
          <FileTextOutlined /> POS Receipts & Policies
        </span>
      ),
      children: (
        <div>
          <Title level={5} style={{ marginBottom: 16, color: '#09090b' }}>
            POS Thermal Printing & Store Policies
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Receipt Header Title"
                name="receiptHeader"
                rules={[{ max: 300 }]}
                help="Top line printed on 80mm/58mm thermal receipts"
              >
                <Input placeholder="MY STYLE BOUTIQUE - Flagship Store" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Exchange & Return Window (Days)"
                name="returnPolicyDays"
                rules={[{ required: true }]}
                help="Number of days allowed for customer item exchanges"
              >
                <InputNumber min={0} max={365} precision={0} suffix="Days" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Receipt Footer Thank You Message"
            name="receiptFooter"
            rules={[{ max: 500 }]}
            help="Printed immediately after total and payment breakdown"
          >
            <Input placeholder="Thank you for shopping with My Style Boutique!" />
          </Form.Item>

          <Form.Item
            label="Receipt Exchange Terms & Conditions"
            name="receiptNote"
            rules={[{ max: 1000 }]}
            help="Legal disclaimer and return instructions printed at the bottom of customer receipts"
          >
            <Input.TextArea
              rows={3}
              placeholder="e.g. Items can be exchanged within 30 days with original tags and valid receipt."
            />
          </Form.Item>

          <Divider style={{ margin: '16px 0' }} />

          <Title level={5} style={{ marginBottom: 16, color: '#09090b' }}>
            Social Media & Customer Community Channels
          </Title>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Telegram Channel / Group" name="telegramChannel" rules={[{ max: 500 }]}>
                <Input placeholder="https://t.me/mystyleboutique" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Facebook Page" name="facebookUrl" rules={[{ max: 500 }]}>
                <Input placeholder="https://facebook.com/mystylecambodia" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="TikTok Profile" name="tiktokUrl" rules={[{ max: 500 }]}>
                <Input placeholder="https://tiktok.com/@mystyle.kh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Instagram Profile" name="instagramUrl" rules={[{ max: 500 }]}>
                <Input placeholder="https://instagram.com/mystyle.kh" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Store & System Settings"
      subtitle="Master control panel for store branding, dual currency (USD/KHR), nationwide shipping, KHQR payments, and POS receipts"
    >
      <Alert
        type="info"
        showIcon
        title="Live Real-Time Synchronization Across All Platforms"
        description="Changes saved here are instantly applied across the Admin Dashboard, POS Register, Customer Website, and Flutter Mobile App."
        style={{ marginBottom: 20 }}
      />

      <Card variant="borderless" loading={query.isLoading}>
        <Form form={form} layout="vertical" onFinish={(values) => mutation.mutate(values)}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

          <Divider style={{ margin: '24px 0 16px' }} />

          <Space size="middle">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={mutation.isPending}
              size="large"
              style={{ minWidth: 160 }}
            >
              Save All Settings
            </Button>
            <Button size="large" onClick={() => form.resetFields()}>
              Reset Changes
            </Button>
          </Space>
        </Form>
      </Card>
    </PageContainer>
  );
}
