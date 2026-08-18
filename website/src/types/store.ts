export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  image: string;
  thumbnails: string[];
}

export interface ProductVariantItem {
  _id: string;
  size: { _id: string; name: string };
  color: { _id: string; name: string; hexCode: string };
  sku: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  image?: string;
}

export interface ProductItem {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  rating: number;
  reviewCount: number;
  category: string;
  brand: string;
  description: string;
  shippingInfo: string;
  details: string[];
  colors: ProductColor[];
  sizes: string[];
  variants?: ProductVariantItem[];
  totalStock?: number;
}

export interface CartItem {
  cartId: string;
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  selectedColor: ProductColor;
  selectedSize: string;
  quantity: number;
  availableStock?: number;
}

export interface OrderDetails {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  paymentMethod: 'cod' | 'aba_khqr' | 'acleda' | 'card';
  notes?: string;
  discountCode?: string;
  discountAmount?: number;
}

export type StoreCurrency = 'USD' | 'KHR';
