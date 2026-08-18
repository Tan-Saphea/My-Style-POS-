'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { App, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import ErrorState from '@/components/common/ErrorState';
import { productService, type ProductPayload } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import type { Product } from '@/types/models';
import { ROUTES } from '@/constants/routes';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';
import { useAuthStore } from '@/lib/store/auth';
import { UserRole } from '@/types/auth';

type EditProductForm = Pick<ProductPayload, 'name' | 'brand' | 'description' | 'category' | 'audience' | 'status'> & { imageUrl?: string };

export default function ProductsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { role } = useAuthStore();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<EditProductForm>();

  const canManage = role === UserRole.ADMIN;

  const products = useQuery({ queryKey: queryKeys.products.all, queryFn: () => productService.getProducts() });
  const categories = useQuery({ queryKey: queryKeys.categories.all, queryFn: categoryService.getCategories });

  const update = useMutation({
    mutationFn: (values: EditProductForm) => {
      if (!editing) throw new Error('No product selected for update');
      const { imageUrl, ...rest } = values;
      const images = imageUrl ? [imageUrl] : editing.images || [];
      return productService.updateProduct(editing._id, { ...rest, images });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      message.success('Product updated successfully');
      setOpen(false);
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      message.success('Product deleted successfully');
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const filtered = (products.data || []).filter((product) => {
    const term = search.toLowerCase();
    return [product.name, product.brand || '', ...(product.variants || []).map((v) => v.sku)].some((val) =>
      val.toLowerCase().includes(term)
    );
  });

  if (products.isError) {
    return (
      <ErrorState
        title="Unable to load products"
        message={getErrorMessage(products.error)}
        onRetry={() => void products.refetch()}
      />
    );
  }

  const openEdit = (record: Product) => {
    setEditing(record);
    setOpen(true);
    setTimeout(() => {
      form.setFieldsValue({
        name: record.name,
        brand: record.brand,
        description: record.description,
        category: record.category._id,
        audience: record.audience || 'unisex',
        status: record.status,
        imageUrl: record.images?.[0] || '',
      });
    }, 0);
  };

  return (
    <PageContainer
      title="Product Catalog"
      subtitle="Master catalog for apparel lines, style descriptions, and variant SKUs"
      extra={
        canManage ? (
          <Link href={ROUTES.PRODUCTS_CREATE}>
            <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#09090b', borderColor: '#09090b' }}>
              Create Product
            </Button>
          </Link>
        ) : null
      }
    >
      <Card variant="borderless">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Input
            aria-label="Search products"
            placeholder="Search product name, brand, or SKU..."
            prefix={<SearchOutlined style={{ color: '#a1a1aa' }} />}
            style={{ maxWidth: 360, borderRadius: 8 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />
          <div style={{ fontSize: 12, color: '#71717a' }}>
            Showing <b>{filtered.length}</b> apparel items
          </div>
        </div>

        <Table<Product>
          rowKey="_id"
          loading={products.isLoading}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1000 }}
          columns={[
            {
              title: 'Product',
              dataIndex: 'name',
              width: 280,
              render: (name: string, record: Product) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 56,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#f4f4f5',
                      border: '1px solid #e4e4e7',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {record.images?.[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={record.images[0]}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                      />
                    ) : (
                      <PictureOutlined style={{ color: '#a1a1aa', fontSize: 18 }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#09090b', fontSize: 13 }} className="truncate" title={name}>
                      {name}
                    </div>
                    <div style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 2 }}>
                      {record.brand || 'MY STYLE'}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: 'Category',
              dataIndex: 'category',
              width: 140,
              render: (category: Product['category']) => (
                <span style={{ fontSize: 12, color: '#3f3f46', fontWeight: 500 }}>
                  {category?.name || '—'}
                </span>
              ),
            },
            {
              title: 'Audience',
              dataIndex: 'audience',
              width: 110,
              render: (value?: string) => {
                const aud = (value || 'unisex').toLowerCase();
                const bg =
                  aud === 'men'
                    ? '#eff6ff'
                    : aud === 'women'
                    ? '#fdf2f8'
                    : aud === 'children'
                    ? '#fff7ed'
                    : '#f4f4f5';
                const color =
                  aud === 'men'
                    ? '#1d4ed8'
                    : aud === 'women'
                    ? '#be185d'
                    : aud === 'children'
                    ? '#c2410c'
                    : '#3f3f46';

                return (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      backgroundColor: bg,
                      color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {aud}
                  </span>
                );
              },
            },
            {
              title: 'Variants',
              dataIndex: 'variants',
              width: 90,
              align: 'center',
              render: (variants: Product['variants']) => (
                <span style={{ fontWeight: 600, color: '#09090b' }}>{variants?.length || 0}</span>
              ),
            },
            {
              title: 'SKUs',
              dataIndex: 'variants',
              width: 180,
              render: (variants: Product['variants']) => {
                const list = variants || [];
                const firstTwo = list.slice(0, 2);
                const remaining = list.length - 2;

                return (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    {firstTwo.map((v) => (
                      <span
                        key={v._id}
                        style={{
                          fontSize: 10,
                          fontFamily: 'monospace',
                          background: '#f4f4f5',
                          border: '1px solid #e4e4e7',
                          padding: '1px 5px',
                          borderRadius: 4,
                          color: '#27272a',
                        }}
                      >
                        {v.sku}
                      </span>
                    ))}
                    {remaining > 0 && (
                      <Tooltip title={list.slice(2).map((v) => v.sku).join(', ')}>
                        <span
                          style={{
                            fontSize: 10,
                            background: '#e4e4e7',
                            padding: '1px 5px',
                            borderRadius: 4,
                            color: '#52525b',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          +{remaining}
                        </span>
                      </Tooltip>
                    )}
                  </div>
                );
              },
            },
            {
              title: 'Price',
              dataIndex: 'variants',
              width: 100,
              render: (variants: Product['variants']) => {
                if (!variants || variants.length === 0) return '—';
                const prices = variants.map((v) => v.salePrice);
                const minPrice = Math.min(...prices);
                return <span style={{ fontWeight: 700, color: '#09090b' }}>${minPrice.toFixed(2)}</span>;
              },
            },
            {
              title: 'Stock',
              dataIndex: 'totalStock',
              width: 110,
              render: (value?: number) => {
                const stock = value || 0;
                if (stock <= 0) {
                  return (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#e11d48', background: '#ffe4e6', padding: '2px 8px', borderRadius: 6 }}>
                      Out of Stock
                    </span>
                  );
                }
                if (stock <= 5) {
                  return (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', background: '#ffedd5', padding: '2px 8px', borderRadius: 6 }}>
                      Low ({stock})
                    </span>
                  );
                }
                return (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: 6 }}>
                    {stock} Units
                  </span>
                );
              },
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 100,
              render: (value: string) => {
                const isActive = value === 'active';
                return (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: isActive ? '#15803d' : '#71717a',
                      background: isActive ? '#f0fdf4' : '#f4f4f5',
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: `1px solid ${isActive ? '#bbf7d0' : '#e4e4e7'}`,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#15803d' : '#a1a1aa' }} />
                    <span>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                  </span>
                );
              },
            },
            ...(canManage
              ? [
                  {
                    title: 'Actions',
                    fixed: 'right' as const,
                    width: 90,
                    render: (_: unknown, record: Product) => (
                      <Space size={4}>
                        <Button
                          aria-label={`Edit ${record.name}`}
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openEdit(record)}
                          style={{ borderRadius: 6 }}
                        />
                        <Popconfirm
                          title="Delete Product"
                          description="Products with sales history must be deactivated instead. Continue?"
                          onConfirm={() => remove.mutate(record._id)}
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            aria-label={`Delete ${record.name}`}
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            style={{ borderRadius: 6 }}
                          />
                        </Popconfirm>
                      </Space>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>

      <Modal
        title="Edit Product Details"
        open={open}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        confirmLoading={update.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={(values) => update.mutate(values)}>
          <Form.Item label="Product Name" name="name" rules={[{ required: true, whitespace: true }, { max: 200 }]}>
            <Input placeholder="e.g. Denim Trucker Jacket" />
          </Form.Item>

          <Form.Item label="Brand" name="brand" rules={[{ max: 100 }]}>
            <Input placeholder="e.g. My Style" />
          </Form.Item>

          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Select
              placeholder="Select apparel category"
              options={(categories.data || []).map((cat) => ({ value: cat._id, label: cat.name }))}
            />
          </Form.Item>

          <Form.Item label="Target Audience" name="audience">
            <Select
              options={[
                { value: 'unisex', label: 'Unisex' },
                { value: 'men', label: 'Men' },
                { value: 'women', label: 'Women' },
                { value: 'children', label: 'Children / Kids' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Description" name="description" rules={[{ max: 2000 }]}>
            <Input.TextArea rows={3} placeholder="Detailed garment description, styling notes..." />
          </Form.Item>

          <Form.Item label="Product Image URL" name="imageUrl">
            <Input placeholder="https://images.unsplash.com/..." />
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select
              options={[
                { value: 'active', label: 'Active (Available in Catalog)' },
                { value: 'inactive', label: 'Inactive (Hidden)' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
