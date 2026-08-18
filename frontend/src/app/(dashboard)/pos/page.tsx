'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  App,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  QrcodeOutlined,
  ScanOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { productService } from '@/services/product.service';
import { customerService, getSettings, salesService } from '@/services/resources.service';
import type { Customer, Product, ProductVariant, Sale } from '@/types/models';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';

const { Text, Title } = Typography;

interface SaleableVariant {
  product: Product;
  variant: ProductVariant;
}

interface CartRow extends SaleableVariant {
  quantity: number;
}

interface HeldCart {
  id: string;
  timestamp: string;
  customerId?: string;
  customerName?: string;
  cart: CartRow[];
  discount: number;
}

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export default function POSPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'product' | 'variant'>('product');
  const [cart, setCart] = useState<CartRow[]>([]);
  const [customerId, setCustomerId] = useState<string>();
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'aba_khqr'>('cash');
  const [amountReceived, setAmountReceived] = useState<number>();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<{ invoiceNumber: string; grandTotal: number } | null>(null);

  // Variant Picker Modal State
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);

  // Quick Add Customer State
  const [quickCustomerModalOpen, setQuickCustomerModalOpen] = useState(false);
  const [customerForm] = Form.useForm<{ name: string; phone: string; gender?: 'male' | 'female' | 'other'; address?: string }>();

  // Parked / Held Carts State
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);
  const [heldCartsDrawerOpen, setHeldCartsDrawerOpen] = useState(false);

  // Barcode Scanner Buffer
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list({ status: 'active' }),
    queryFn: () => productService.getProducts({ status: 'active' }),
  });
  const customersQuery = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: () => customerService.list({ status: 'active' }),
  });
  const settingsQuery = useQuery({ queryKey: queryKeys.settings, queryFn: getSettings });

  const saleableVariants = useMemo<SaleableVariant[]>(() => {
    return (productsQuery.data || []).flatMap((product) =>
      (product.variants || []).filter((variant) => variant.quantity > 0).map((variant) => ({ product, variant }))
    );
  }, [productsQuery.data]);

  const categories = useMemo(() => {
    return Array.from(new Map((productsQuery.data || []).map((product) => [product.category._id, product.category])).values());
  }, [productsQuery.data]);

  // Filtered Products for Grouped Product View
  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return (productsQuery.data || []).filter((product) => {
      const inStockVariants = (product.variants || []).filter((v) => v.quantity > 0);
      if (inStockVariants.length === 0) return false;

      const matchesCat = activeCategory === 'all' || product.category._id === activeCategory;
      if (!matchesCat) return false;

      if (!term) return true;
      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        (product.brand || '').toLowerCase().includes(term) ||
        product.variants?.some((v) => v.sku.toLowerCase().includes(term));
      return matchesSearch;
    });
  }, [productsQuery.data, search, activeCategory]);

  // Filtered Variants for Detailed List View
  const filteredVariants = useMemo(() => {
    const term = search.toLowerCase().trim();
    return saleableVariants.filter(({ product, variant }) => {
      const matchesCat = activeCategory === 'all' || product.category._id === activeCategory;
      if (!matchesCat) return false;

      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        (product.brand || '').toLowerCase().includes(term) ||
        variant.sku.toLowerCase().includes(term)
      );
    });
  }, [saleableVariants, search, activeCategory]);

  const addToCart = (item: SaleableVariant) => {
    setCart((current) => {
      const existing = current.find((row) => row.variant._id === item.variant._id);
      if (existing) {
        if (existing.quantity >= item.variant.quantity) {
          message.warning(`Only ${item.variant.quantity} units of ${item.variant.sku} are available`);
          return current;
        }
        return current.map((row) => (row.variant._id === item.variant._id ? { ...row, quantity: row.quantity + 1 } : row));
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const handleProductCardClick = (product: Product) => {
    const inStockVariants = (product.variants || []).filter((v) => v.quantity > 0);
    if (inStockVariants.length === 1) {
      addToCart({ product, variant: inStockVariants[0] });
      message.success(`Added ${product.name} (${inStockVariants[0].sku}) to cart`);
    } else if (inStockVariants.length > 1) {
      setSelectedProductForVariants(product);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((current) =>
      current
        .map((row) => (row.variant._id === id ? { ...row, quantity: Math.min(quantity, row.variant.quantity) } : row))
        .filter((row) => row.quantity > 0)
    );
  };

  // Barcode Scanner Listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTimeRef.current > 200) {
        barcodeBufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (event.key === 'Enter') {
        const barcode = barcodeBufferRef.current.trim().toUpperCase();
        barcodeBufferRef.current = '';
        if (barcode) {
          const match = saleableVariants.find((v) => v.variant.sku.toUpperCase() === barcode);
          if (match) {
            addToCart(match);
            message.success(`Scanned: ${match.product.name} (${match.variant.sku})`);
          } else {
            message.warning(`No in-stock item found for SKU: ${barcode}`);
          }
        }
      } else if (event.key.length === 1) {
        barcodeBufferRef.current += event.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saleableVariants]);

  // Quick Customer Creation Mutation
  const createCustomerMutation = useMutation({
    mutationFn: (values: { name: string; phone: string; gender?: 'male' | 'female' | 'other'; address?: string }) =>
      customerService.create({ ...values, status: 'active' }),
    onSuccess: async (newCustomer) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      setCustomerId(newCustomer._id);
      setQuickCustomerModalOpen(false);
      customerForm.resetFields();
      message.success(`Customer "${newCustomer.name}" created and selected!`);
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const selectedCustomer = (customersQuery.data || []).find((c) => c._id === customerId);
    const newHeldCart: HeldCart = {
      id: `held_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerId,
      customerName: selectedCustomer?.name,
      cart: [...cart],
      discount,
    };
    setHeldCarts((prev) => [newHeldCart, ...prev]);
    setCart([]);
    setCustomerId(undefined);
    setDiscount(0);
    message.info('Current order parked. You can restore it anytime from Held Orders.');
  };

  const handleRestoreCart = (held: HeldCart) => {
    if (cart.length > 0) {
      Modal.confirm({
        title: 'Replace Current Cart?',
        content: 'Your current active cart items will be replaced by the held order.',
        onOk: () => {
          setCart(held.cart);
          setCustomerId(held.customerId);
          setDiscount(held.discount);
          setHeldCarts((prev) => prev.filter((item) => item.id !== held.id));
          setHeldCartsDrawerOpen(false);
          message.success('Held order restored to active cart.');
        },
      });
    } else {
      setCart(held.cart);
      setCustomerId(held.customerId);
      setDiscount(held.discount);
      setHeldCarts((prev) => prev.filter((item) => item.id !== held.id));
      setHeldCartsDrawerOpen(false);
      message.success('Held order restored to active cart.');
    }
  };

  const handleDeleteHeldCart = (heldId: string) => {
    setHeldCarts((prev) => prev.filter((item) => item.id !== heldId));
    message.success('Parked cart removed.');
  };

  const checkout = useMutation({
    mutationFn: (payload: {
      customerId?: string;
      discount: number;
      paymentMethod: string;
      amountReceived: number;
      items: { variantId: string; quantity: number }[];
    }) => salesService.create(payload),
    onSuccess: async (sale: Sale) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
      ]);
      setCompletedSale({ invoiceNumber: sale.invoiceNumber, grandTotal: sale.grandTotal });
      setCart([]);
      setCustomerId(undefined);
      setDiscount(0);
      setPaymentOpen(false);
      message.success(`Sale completed - Invoice: ${sale.invoiceNumber}`);
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const subtotal = money(cart.reduce((sum, row) => sum + row.variant.salePrice * row.quantity, 0));
  const taxRate = settingsQuery.data?.taxRate ?? 10;
  const tax = money(subtotal * (taxRate / 100));
  const total = money(Math.max(0, subtotal + tax - discount));
  const change = paymentMethod === 'cash' && amountReceived !== undefined ? money(Math.max(0, amountReceived - total)) : 0;

  if (productsQuery.isError) {
    return <ErrorState title="Unable to load products" message={getErrorMessage(productsQuery.error)} onRetry={() => void productsQuery.refetch()} />;
  }

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <PageContainer
      title="Point of Sale (POS)"
      subtitle="Create verified retail sales with barcode scanning, live stock, and customer checkout"
      extra={
        <Space>
          <Tag color="green" icon={<ScanOutlined />} style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6 }}>
            Barcode Scanner Ready
          </Tag>
          <Button
            icon={<FolderOpenOutlined />}
            onClick={() => setHeldCartsDrawerOpen(true)}
            style={{ borderRadius: 8 }}
          >
            Held Orders ({heldCarts.length})
          </Button>
        </Space>
      }
    >
      <Row gutter={16}>
        {/* Left: Product Lookbook Catalog */}
        <Col xs={24} lg={15}>
          <Card variant="borderless" styles={{ body: { padding: '16px' } }}>
            {/* Search, View Mode Toggle, and Category Tabs */}
            <Flex gap={12} align="center" justify="space-between" style={{ marginBottom: 12 }} wrap="wrap">
              <Input
                aria-label="Search catalog"
                prefix={<SearchOutlined style={{ color: '#a1a1aa' }} />}
                placeholder="Search product name, brand, or SKU..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                allowClear
                style={{ maxWidth: 360, borderRadius: 8 }}
              />

              <Segmented
                value={viewMode}
                onChange={(val) => setViewMode(val as 'product' | 'variant')}
                options={[
                  { label: 'Group by Product', value: 'product', icon: <AppstoreOutlined /> },
                  { label: 'All Variants', value: 'variant', icon: <UnorderedListOutlined /> },
                ]}
              />
            </Flex>

            <Tabs
              activeKey={activeCategory}
              onChange={setActiveCategory}
              items={[
                { key: 'all', label: 'All Items' },
                ...categories.map((category) => ({ key: category._id, label: category.name })),
              ]}
              style={{ marginBottom: 12 }}
            />

            {/* View Mode 1: Clean Grouped Product Grid (No Duplicates) */}
            {viewMode === 'product' && (
              <Row gutter={[12, 12]}>
                {filteredProducts.map((product) => {
                  const inStockVariants = (product.variants || []).filter((v) => v.quantity > 0);
                  const totalStock = inStockVariants.reduce((sum, v) => sum + v.quantity, 0);
                  const minPrice = Math.min(...inStockVariants.map((v) => v.salePrice));
                  const maxPrice = Math.max(...inStockVariants.map((v) => v.salePrice));
                  const priceLabel = minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;

                  return (
                    <Col xs={12} sm={8} key={product._id}>
                      <Card
                        hoverable
                        onClick={() => handleProductCardClick(product)}
                        style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0', backgroundColor: '#ffffff' }}
                        cover={
                          product.images?.[0] ? (
                            <div style={{ position: 'relative', height: 140, backgroundColor: '#ffffff', borderBottom: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            </div>
                          ) : (
                            <div style={{ height: 140, backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Text type="secondary">No Image</Text>
                            </div>
                          )
                        }
                        styles={{ body: { padding: '10px 12px' } }}
                      >
                        <Text strong style={{ display: 'block', fontSize: 13, color: '#09090b' }} className="truncate" title={product.name}>
                          {product.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          {product.brand || product.category.name}
                        </Text>

                        <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#f4f4f5', color: '#3f3f46' }}>
                            {inStockVariants.length} {inStockVariants.length === 1 ? 'Variant' : 'Variants'}
                          </span>
                          <span style={{ fontWeight: 800, color: '#09090b', fontSize: 13 }}>
                            {priceLabel}
                          </span>
                        </Flex>

                        <div style={{ marginTop: 4, fontSize: 11, color: '#15803d', fontWeight: 600 }}>
                          {totalStock} in stock
                        </div>
                      </Card>
                    </Col>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <Col span={24}>
                    <div style={{ padding: '32px 0', textAlign: 'center', color: '#71717a' }}>
                      No apparel products matching filters
                    </div>
                  </Col>
                )}
              </Row>
            )}

            {/* View Mode 2: Detailed All Variants View */}
            {viewMode === 'variant' && (
              <Row gutter={[12, 12]}>
                {filteredVariants.map(({ product, variant }) => (
                  <Col xs={12} sm={8} key={variant._id}>
                    <Card
                      hoverable
                      onClick={() => addToCart({ product, variant })}
                      style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0', backgroundColor: '#ffffff' }}
                      cover={
                        product.images?.[0] ? (
                          <div style={{ position: 'relative', height: 130, backgroundColor: '#ffffff', borderBottom: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        ) : undefined
                      }
                      styles={{ body: { padding: '10px 12px' } }}
                    >
                      <Text strong style={{ display: 'block', fontSize: 13, color: '#09090b' }} className="truncate" title={product.name}>
                        {product.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10, fontFamily: 'monospace' }}>
                        {variant.sku}
                      </Text>
                      <Flex justify="space-between" align="center" style={{ marginTop: 6 }}>
                        <Tag style={{ margin: 0, fontSize: 10 }}>
                          {variant.size?.name} / {variant.color?.name}
                        </Tag>
                        <span style={{ fontWeight: 800, color: '#09090b', fontSize: 13 }}>
                          ${variant.salePrice.toFixed(2)}
                        </span>
                      </Flex>
                      <div style={{ marginTop: 4, fontSize: 11, color: '#15803d', fontWeight: 600 }}>
                        {variant.quantity} in stock
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>

        {/* Right: Cart & Checkout Column */}
        <Col xs={24} lg={9}>
          <Card variant="borderless" style={{ borderRadius: 14 }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
              <Space>
                <ShoppingCartOutlined style={{ fontSize: 18, color: '#09090b' }} />
                <Title level={5} style={{ margin: 0 }}>
                  Current Cart
                </Title>
              </Space>
              <Space>
                {cart.length > 0 && (
                  <Button size="small" icon={<PauseCircleOutlined />} onClick={handleHoldCart} style={{ borderRadius: 6 }}>
                    Hold Cart
                  </Button>
                )}
                <Badge count={cart.length} style={{ backgroundColor: '#09090b' }} />
              </Space>
            </Flex>

            <Table<CartRow>
              rowKey={(row) => row.variant._id}
              size="small"
              pagination={false}
              dataSource={cart}
              locale={{ emptyText: 'Select product variant or scan SKU' }}
              columns={[
                {
                  title: 'Item',
                  render: (_, row) => (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{row.product.name}</div>
                      <div style={{ fontSize: 10, color: '#71717a' }}>
                        {row.variant.size?.name} · {row.variant.color?.name} ({row.variant.sku})
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Qty',
                  width: 70,
                  render: (_, row) => (
                    <InputNumber
                      aria-label={`Quantity for ${row.variant.sku}`}
                      min={1}
                      max={row.variant.quantity}
                      value={row.quantity}
                      onChange={(value) => updateQuantity(row.variant._id, Number(value || 0))}
                      size="small"
                      style={{ width: 60, borderRadius: 4 }}
                    />
                  ),
                },
                {
                  title: 'Total',
                  width: 75,
                  align: 'right',
                  render: (_, row) => <span style={{ fontWeight: 600 }}>${money(row.variant.salePrice * row.quantity).toFixed(2)}</span>,
                },
                {
                  title: '',
                  width: 35,
                  render: (_, row) => (
                    <Button
                      aria-label={`Remove ${row.variant.sku}`}
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => setCart((current) => current.filter((item) => item.variant._id !== row.variant._id))}
                    />
                  ),
                },
              ]}
            />

            {/* Customer Selector & Quick Add Button */}
            <Flex gap={8} align="center" style={{ marginTop: 16 }}>
              <Select
                aria-label="Select customer"
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Walk-in customer"
                value={customerId}
                onChange={setCustomerId}
                loading={customersQuery.isLoading}
                options={(customersQuery.data || []).map((customer) => ({
                  value: customer._id,
                  label: `${customer.name}${customer.phone ? ` - ${customer.phone}` : ''}`,
                }))}
                style={{ flex: 1 }}
              />
              <Button icon={<UserAddOutlined />} onClick={() => setQuickCustomerModalOpen(true)} title="Add New Customer" style={{ borderRadius: 6 }}>
                New
              </Button>
            </Flex>

            <Flex justify="space-between" style={{ marginTop: 16, fontSize: 13 }}>
              <Text type="secondary">Subtotal</Text>
              <Text strong>${subtotal.toFixed(2)}</Text>
            </Flex>
            <Flex justify="space-between" style={{ marginTop: 6, fontSize: 13 }}>
              <Text type="secondary">VAT ({taxRate}%)</Text>
              <Text>${tax.toFixed(2)}</Text>
            </Flex>
            <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
              <Text type="secondary">Discount</Text>
              <InputNumber
                aria-label="Sale discount"
                min={0}
                max={subtotal + tax}
                precision={2}
                value={discount}
                onChange={(value) => setDiscount(Number(value || 0))}
                prefix="$"
                style={{ width: 110, borderRadius: 6 }}
              />
            </Flex>

            <Divider style={{ margin: '14px 0' }} />

            <Flex justify="space-between" align="baseline">
              <Text strong style={{ fontSize: 15 }}>
                Grand Total
              </Text>
              <Text strong style={{ fontSize: 24, color: '#15803d' }}>
                ${total.toFixed(2)}
              </Text>
            </Flex>

            <Flex vertical gap={8} style={{ marginTop: 16 }}>
              <Button
                type="primary"
                size="large"
                icon={<CreditCardOutlined />}
                disabled={!cart.length || total <= 0}
                onClick={() => {
                  setPaymentMethod('cash');
                  setAmountReceived(total);
                  setPaymentOpen(true);
                }}
                style={{ backgroundColor: '#09090b', borderColor: '#09090b', height: 44, borderRadius: 8, fontWeight: 700 }}
              >
                Pay with Cash / Card
              </Button>
              <Button
                size="large"
                icon={<QrcodeOutlined />}
                disabled={!cart.length || total <= 0}
                onClick={() => {
                  setPaymentMethod('aba_khqr');
                  setPaymentOpen(true);
                }}
                style={{ borderColor: '#15803d', color: '#15803d', height: 44, borderRadius: 8, fontWeight: 700 }}
              >
                Record ABA KHQR Payment
              </Button>
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Variant Selector Modal for Multiple Variants */}
      <Modal
        title={null}
        open={Boolean(selectedProductForVariants)}
        onCancel={() => setSelectedProductForVariants(null)}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <div style={{ padding: '4px 0' }}>
          {/* Header Banner with Product Photo & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottom: '1px solid #f0f0f0', marginBottom: 14 }}>
            <div style={{ width: 50, height: 60, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f4f4f5', border: '1px solid #e4e4e7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
              {selectedProductForVariants?.images?.[0] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedProductForVariants.images[0]}
                  alt={selectedProductForVariants.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Text type="secondary">No Image</Text>
              )}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#09090b' }}>
                {selectedProductForVariants?.name}
              </div>
              <div style={{ fontSize: 12, color: '#71717a', textTransform: 'uppercase', marginTop: 2 }}>
                {selectedProductForVariants?.brand || selectedProductForVariants?.category.name} · Choose Variant:
              </div>
            </div>
          </div>

          <Row gutter={[10, 10]}>
            {(selectedProductForVariants?.variants || [])
              .filter((v) => v.quantity > 0)
              .map((variant) => (
                <Col span={12} key={variant._id}>
                  <Button
                    block
                    style={{
                      height: 'auto',
                      padding: '12px 14px',
                      textAlign: 'left',
                      borderRadius: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid #e4e4e7',
                      backgroundColor: '#ffffff',
                    }}
                    onClick={() => {
                      if (selectedProductForVariants) {
                        addToCart({ product: selectedProductForVariants, variant });
                        message.success(`Added ${variant.size?.name} / ${variant.color?.name} (${variant.sku})`);
                        setSelectedProductForVariants(null);
                      }
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#09090b' }}>
                        {variant.size?.name} · {variant.color?.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#71717a', fontFamily: 'monospace' }}>
                        {variant.sku}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#15803d', fontSize: 13 }}>
                        ${variant.salePrice.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 10, color: '#71717a' }}>
                        {variant.quantity} left
                      </div>
                    </div>
                  </Button>
                </Col>
              ))}
          </Row>
        </div>
      </Modal>

      {/* Held / Parked Carts Drawer */}
      <Drawer
        title="Held / Parked Orders"
        open={heldCartsDrawerOpen}
        onClose={() => setHeldCartsDrawerOpen(false)}
        size={420}
      >
        {heldCarts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
            <FolderOpenOutlined style={{ fontSize: 36, marginBottom: 8 }} />
            <div>No parked orders currently.</div>
          </div>
        ) : (
          <Flex vertical gap={12}>
            {heldCarts.map((held) => {
              const heldTotal = money(
                held.cart.reduce((sum, r) => sum + r.variant.salePrice * r.quantity, 0)
              );
              return (
                <Card key={held.id} size="small" style={{ borderRadius: 8 }}>
                  <Flex justify="space-between" align="center">
                    <div>
                      <Text strong>{held.customerName || 'Walk-in Customer'}</Text>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>Parked at {held.timestamp}</div>
                    </div>
                    <Text strong style={{ color: '#09090b', fontSize: 14 }}>
                      ${heldTotal.toFixed(2)}
                    </Text>
                  </Flex>

                  <Divider style={{ margin: '8px 0' }} />

                  <div style={{ fontSize: 12, color: '#595959', marginBottom: 10 }}>
                    {held.cart.map((i) => `${i.quantity}x ${i.product.name} (${i.variant.sku})`).join(', ')}
                  </div>

                  <Flex gap={8} justify="end">
                    <Button size="small" danger onClick={() => handleDeleteHeldCart(held.id)}>
                      Delete
                    </Button>
                    <Button size="small" type="primary" onClick={() => handleRestoreCart(held)} style={{ backgroundColor: '#09090b' }}>
                      Restore Cart
                    </Button>
                  </Flex>
                </Card>
              );
            })}
          </Flex>
        )}
      </Drawer>

      {/* Quick Add Customer Modal */}
      <Modal
        title="Quick Add Customer"
        open={quickCustomerModalOpen}
        onOk={() => customerForm.submit()}
        onCancel={() => setQuickCustomerModalOpen(false)}
        confirmLoading={createCustomerMutation.isPending}
        destroyOnHidden
      >
        <Form
          form={customerForm}
          layout="vertical"
          onFinish={(values) => createCustomerMutation.mutate(values)}
        >
          <Form.Item label="Customer Full Name" name="name" rules={[{ required: true, whitespace: true }, { max: 200 }]}>
            <Input placeholder="e.g. Bopha Chan" />
          </Form.Item>
          <Form.Item label="Phone Number" name="phone" rules={[{ required: true, whitespace: true }, { max: 40 }]}>
            <Input placeholder="e.g. 012 345 678" />
          </Form.Item>
          <Form.Item label="Gender" name="gender" initialValue="female">
            <Select
              options={[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Address / Note" name="address" rules={[{ max: 500 }]}>
            <Input.TextArea rows={2} placeholder="Optional delivery or physical address note" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Processing Modal */}
      <Modal
        title="Process POS Payment"
        open={paymentOpen}
        onCancel={() => setPaymentOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Flex vertical gap="middle" style={{ width: '100%' }}>
          <Flex justify="space-between">
            <Text>Amount Due:</Text>
            <Text strong style={{ fontSize: 18 }}>${total.toFixed(2)}</Text>
          </Flex>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Payment Method</Text>
            <Radio.Group value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              <Radio.Button value="cash">Cash</Radio.Button>
              <Radio.Button value="aba_khqr">ABA KHQR</Radio.Button>
            </Radio.Group>
          </div>

          {paymentMethod === 'cash' ? (
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Amount Received</Text>
              <InputNumber
                aria-label="Amount received"
                min={total}
                precision={2}
                value={amountReceived}
                onChange={(value) => setAmountReceived(Number(value || 0))}
                prefix="$"
                style={{ width: '100%' }}
              />
              <Flex justify="space-between" style={{ marginTop: 12 }}>
                <Text>Change Due:</Text>
                <Text strong style={{ color: '#15803d' }}>${change.toFixed(2)}</Text>
              </Flex>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <QrcodeOutlined style={{ fontSize: 72, color: '#15803d' }} />
              <div style={{ marginTop: 8, fontWeight: 700, color: '#15803d' }}>Scan with ABA Mobile / KHQR</div>
              <div style={{ fontSize: 12, color: '#71717a' }}>Amount: ${total.toFixed(2)}</div>
            </div>
          )}

          <Button
            type="primary"
            block
            size="large"
            loading={checkout.isPending}
            onClick={() =>
              checkout.mutate({
                customerId,
                discount,
                paymentMethod,
                amountReceived: paymentMethod === 'cash' ? (amountReceived || total) : total,
                items: cart.map((row) => ({
                  variantId: row.variant._id,
                  quantity: row.quantity,
                })),
              })
            }
            style={{ backgroundColor: '#09090b', borderColor: '#09090b', height: 44, borderRadius: 8, fontWeight: 700 }}
          >
            Confirm & Complete Order
          </Button>
        </Flex>
      </Modal>

      {/* Completed Sale Receipt Modal */}
      <Modal
        title={null}
        open={Boolean(completedSale)}
        onCancel={() => setCompletedSale(null)}
        footer={null}
        centered
        width={420}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#15803d' }} />
          <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>Sale Completed!</Title>
          <Text type="secondary">Invoice: <b>{completedSale?.invoiceNumber}</b></Text>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#09090b', margin: '12px 0' }}>
            ${completedSale?.grandTotal.toFixed(2)}
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <Flex gap={8} justify="center">
            <Button onClick={handlePrintReceipt}>Print Receipt</Button>
            <Button type="primary" onClick={() => setCompletedSale(null)} style={{ backgroundColor: '#09090b' }}>
              New Sale
            </Button>
          </Flex>
        </div>
      </Modal>
    </PageContainer>
  );
}
