'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { App, Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Typography, Upload } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, PictureOutlined, PlusOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/common/PageContainer';
import { ROUTES } from '@/constants/routes';
import { categoryService } from '@/services/category.service';
import { colorService, sizeService } from '@/services/resources.service';
import { productService, type ProductPayload } from '@/services/product.service';
import { queryKeys } from '@/lib/query/client';
import { getErrorMessage } from '@/lib/api/error-handler';

const { Text } = Typography;

type ProductForm = Omit<ProductPayload, 'images'> & { imageUrl?: string };

export default function CreateProductPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ProductForm>();

  const imageUrlWatch = Form.useWatch('imageUrl', form);
  const variantsWatch = Form.useWatch('variants', form) || [];

  const categories = useQuery({ queryKey: queryKeys.categories.all, queryFn: categoryService.getCategories });
  const sizes = useQuery({ queryKey: queryKeys.sizes.all, queryFn: () => sizeService.list({ status: 'active' }) });
  const colors = useQuery({ queryKey: queryKeys.colors.all, queryFn: () => colorService.list({ status: 'active' }) });

  const create = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      message.success('Product created successfully');
      router.replace(ROUTES.PRODUCTS);
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const handleMainFileUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Please upload an image file (PNG, JPG, WEBP)');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image size must be smaller than 5MB');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        form.setFieldValue('imageUrl', result);
        message.success('Main product image loaded from computer');
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleVariantFileUpload = (file: File, fieldIndex: number) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Please upload an image file (PNG, JPG, WEBP)');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image size must be smaller than 5MB');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const currentVariants = form.getFieldValue('variants') || [];
        if (currentVariants[fieldIndex]) {
          currentVariants[fieldIndex].image = result;
          form.setFieldsValue({ variants: [...currentVariants] });
          message.success(`Image uploaded for Variant ${fieldIndex + 1}`);
        }
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const submit = (values: ProductForm) => {
    const { imageUrl, variants, ...payload } = values;

    const variantImages = (variants || [])
      .map((v) => v.image)
      .filter((img): img is string => Boolean(img && img.trim().length > 0));

    const allImages = Array.from(
      new Set([
        ...(imageUrl ? [imageUrl] : []),
        ...variantImages,
      ])
    );

    create.mutate({
      name: payload.name.trim(),
      brand: payload.brand?.trim() || 'My Style',
      description: payload.description?.trim() || undefined,
      category: payload.category,
      audience: payload.audience || 'unisex',
      status: payload.status || 'active',
      images: allImages,
      variants: (variants || []).map((v) => ({
        size: v.size,
        color: v.color,
        sku: (v.sku || '').trim().toUpperCase(),
        barcode: v.barcode?.trim() || undefined,
        costPrice: Number(v.costPrice) || 0,
        salePrice: Number(v.salePrice) || 0,
        quantity: Number(v.quantity) || 0,
        lowStockLevel: Number(v.lowStockLevel) || 5,
        image: v.image || imageUrl || undefined,
      })),
    });
  };

  return (
    <PageContainer
      title="Add New Product"
      subtitle="Create a product item, upload main and per-variant color images, and set up saleable size/color combinations"
      extra={
        <Link href={ROUTES.PRODUCTS}>
          <Button icon={<ArrowLeftOutlined />}>Back to Products</Button>
        </Link>
      }
    >
      <Form<ProductForm>
        form={form}
        layout="vertical"
        onFinish={submit}
        initialValues={{
          brand: 'My Style',
          status: 'active',
          variants: [{ quantity: 0, lowStockLevel: 5, costPrice: 0, salePrice: 0 }],
        }}
      >
        <Card title="Product Information" variant="borderless" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Product Name" name="name" rules={[{ required: true, whitespace: true }, { max: 200 }]}>
                <Input placeholder="e.g. Cotton Cargo Shorts" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Brand" name="brand" rules={[{ max: 100 }]}>
                <Input placeholder="e.g. My Style" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Category" name="category" rules={[{ required: true }]}>
                <Select
                  loading={categories.isLoading}
                  placeholder="Select category"
                  options={(categories.data || [])
                    .filter((item) => item.status === 'active')
                    .map((item) => ({ value: item._id, label: item.name }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Target Customer" name="audience" rules={[{ required: true, message: 'Please select a target customer' }]}>
                <Select
                  placeholder="Select audience"
                  options={[
                    { value: 'men', label: 'Men' },
                    { value: 'women', label: 'Women' },
                    { value: 'children', label: 'Children' },
                    { value: 'unisex', label: 'Unisex' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Status" name="status">
                <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
              </Form.Item>
            </Col>
          </Row>

          {/* Main Product Image Section */}
          <Row gutter={16} align="top" style={{ marginBottom: 16 }}>
            <Col xs={24} md={16}>
              <Row gutter={12}>
                <Col xs={24} sm={16}>
                  <Form.Item
                    label="Main Product Image (Default/Cover)"
                    name="imageUrl"
                    help="Default product cover photo. You can also upload specific color photos for each variant below."
                  >
                    <Input placeholder="https://... or select a local image" allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item label="Upload Cover Photo">
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={handleMainFileUpload}
                    >
                      <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                        Upload from Computer
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* Live Main Image Preview */}
            <Col xs={24} md={8}>
              <Text style={{ display: 'block', fontSize: 13, marginBottom: 8, color: '#595959' }}>
                Cover Image Preview:
              </Text>
              <div
                style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 8,
                  border: '1px dashed #d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: '#fafafa',
                  position: 'relative',
                }}
              >
                {imageUrlWatch ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imageUrlWatch}
                    alt="Product Cover Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#bfbfbf' }}>
                    <PictureOutlined style={{ fontSize: 32 }} />
                    <div style={{ fontSize: 12, marginTop: 4 }}>No cover image selected</div>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Form.Item label="Description" name="description" rules={[{ max: 2000 }]}>
            <Input.TextArea rows={3} placeholder="Materials, fit, and care instructions" />
          </Form.Item>
        </Card>

        {/* Product Variants Section (With Per-Variant Color Photo Upload) */}
        <Card
          title={
            <div>
              <div>Product Variants & Color Photos</div>
              <div style={{ fontSize: 12, fontWeight: 'normal', color: '#8c8c8c' }}>
                Configure size, color, stock, and upload individual photos for each color variant (e.g. 4 colors = 4 photos)
              </div>
            </div>
          }
          variant="borderless"
        >
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                {fields.map((field, index) => {
                  const variantImg = variantsWatch[index]?.image || form.getFieldValue(['variants', index, 'image']);

                  return (
                    <Card
                      key={field.key}
                      size="small"
                      title={`Variant ${index + 1}`}
                      extra={
                        fields.length > 1 ? (
                          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)}>
                            Remove
                          </Button>
                        ) : null
                      }
                    >
                      <Row gutter={12}>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item label="Size" name={[field.name, 'size']} rules={[{ required: true }]}>
                            <Select
                              loading={sizes.isLoading}
                              placeholder="Select size"
                              options={(sizes.data || []).map((item) => ({ value: item._id, label: item.name }))}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item label="Color" name={[field.name, 'color']} rules={[{ required: true }]}>
                            <Select
                              loading={colors.isLoading}
                              placeholder="Select color"
                              options={(colors.data || []).map((item) => ({ value: item._id, label: item.name }))}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item label="SKU" name={[field.name, 'sku']} rules={[{ required: true, whitespace: true }, { max: 80 }]}>
                            <Input placeholder="e.g. MS-SHORTS-BLK-L" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item label="Barcode" name={[field.name, 'barcode']} rules={[{ max: 100 }]}>
                            <Input placeholder="Optional barcode" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={12}>
                        <Col xs={12} md={6}>
                          <Form.Item label="Cost Price ($)" name={[field.name, 'costPrice']} rules={[{ required: true }]}>
                            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Item
                            label="Sale Price ($)"
                            name={[field.name, 'salePrice']}
                            dependencies={[[field.name, 'costPrice']]}
                            rules={[{ required: true }]}
                          >
                            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Item label="Opening Stock" name={[field.name, 'quantity']} rules={[{ required: true }]}>
                            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Item label="Low Stock Level" name={[field.name, 'lowStockLevel']} rules={[{ required: true }]}>
                            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Dedicated Variant Color Image Row */}
                      <div style={{ marginTop: 8, paddingTop: 10, borderTop: '1px dashed #e8e8e8' }}>
                        <Row gutter={12} align="middle">
                          <Col xs={24} md={18}>
                            <Row gutter={8} align="bottom">
                              <Col xs={24} sm={16}>
                                <Form.Item
                                  label={`Variant ${index + 1} Color Photo (URL or Upload)`}
                                  name={[field.name, 'image']}
                                  style={{ marginBottom: 0 }}
                                  help="Specific image for this color (shows on website/mobile when customer selects this color)"
                                >
                                  <Input placeholder="Image URL or click upload button" allowClear />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={8}>
                                <Upload
                                  accept="image/*"
                                  showUploadList={false}
                                  beforeUpload={(file) => handleVariantFileUpload(file, index)}
                                >
                                  <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                                    Upload Variant Photo
                                  </Button>
                                </Upload>
                              </Col>
                            </Row>
                          </Col>

                          {/* Variant Thumbnail Preview */}
                          <Col xs={24} md={6}>
                            <div
                              style={{
                                width: '100%',
                                height: 64,
                                borderRadius: 6,
                                border: '1px dashed #d9d9d9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                background: '#fafafa',
                              }}
                            >
                              {variantImg ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={variantImg}
                                  alt={`Variant ${index + 1} Preview`}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  No color photo
                                </Text>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  );
                })}
                <Button
                  block
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add({ quantity: 0, lowStockLevel: 5, costPrice: 0, salePrice: 0 })}
                >
                  Add Variant (Next Color / Size)
                </Button>
              </Space>
            )}
          </Form.List>

          <Space style={{ marginTop: 20 }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={create.isPending}>
              Save Product & Variants
            </Button>
            <Link href={ROUTES.PRODUCTS}>
              <Button>Cancel</Button>
            </Link>
          </Space>
        </Card>
      </Form>
    </PageContainer>
  );
}
