import { ProductItem, ProductColor, ProductVariantItem } from '@/types/store';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export interface ApiBackendVariant {
  _id: string;
  size: { _id: string; name: string };
  color: { _id: string; name: string; hexCode: string };
  sku: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  image?: string;
}

export interface ApiBackendProduct {
  _id: string;
  name: string;
  brand?: string;
  description?: string;
  category?: { _id: string; name: string };
  audience?: 'men' | 'women' | 'children' | 'unisex';
  images?: string[];
  status: 'active' | 'inactive';
  variants: ApiBackendVariant[];
  totalStock: number;
}

export async function fetchLiveProducts(): Promise<ProductItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?status=active`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch products from backend');
    const json = await res.json();
    const data: ApiBackendProduct[] = json.data || [];

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item) => {
      // Map variants to distinct colors
      const colorMap = new Map<string, ProductColor>();
      const sizesSet = new Set<string>();

      (item.variants || []).forEach((v) => {
        if (v.size?.name) sizesSet.add(v.size.name);

        const colorName = v.color?.name || 'Standard';
        const colorHex = v.color?.hexCode || '#18181b';
        const colorId = v.color?._id || 'default-color';
        const variantImg = v.image && typeof v.image === 'string' && v.image.trim() !== '' ? v.image.trim() : '';

        if (!colorMap.has(colorId)) {
          const colorIndex = colorMap.size;
          const mainImg = variantImg.length > 0
            ? variantImg
            : item.images && colorIndex < item.images.length
            ? item.images[colorIndex]
            : item.images && item.images.length > 0
            ? item.images[0]
            : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

          const otherImages = (item.images || []).filter((img) => img !== mainImg);
          colorMap.set(colorId, {
            id: colorId,
            name: colorName,
            hex: colorHex,
            image: mainImg,
            thumbnails: [mainImg, ...otherImages],
          });
        } else if (variantImg.length > 0 && colorMap.get(colorId)!.image !== variantImg) {
          const otherImages = (item.images || []).filter((img) => img !== variantImg);
          colorMap.set(colorId, {
            id: colorId,
            name: colorName,
            hex: colorHex,
            image: variantImg,
            thumbnails: [variantImg, ...otherImages],
          });
        }
      });

      const colorsList = Array.from(colorMap.values());
      const sizesList = Array.from(sizesSet.values());

      const minPrice = item.variants && item.variants.length > 0
        ? Math.min(...item.variants.map((v) => v.salePrice))
        : 99.0;

      // Map backend audience or category name to website tab category
      const rawAudience = (item.audience || '').toLowerCase();
      const categoryName = (item.category?.name || '').toLowerCase();
      const productName = (item.name || '').toLowerCase();

      let websiteCategory = 'Products';
      if (rawAudience === 'men' || categoryName.includes('men') || productName.includes("men's") || productName.includes("men ")) {
        websiteCategory = 'Men';
      } else if (rawAudience === 'women' || categoryName.includes('women') || productName.includes("women's") || productName.includes("women ")) {
        websiteCategory = 'Women';
      } else if (
        rawAudience === 'children' ||
        rawAudience === 'kids' ||
        categoryName.includes('child') ||
        categoryName.includes('kid') ||
        productName.includes('kid') ||
        productName.includes('junior')
      ) {
        websiteCategory = 'Children';
      } else if (rawAudience === 'unisex') {
        websiteCategory = 'Products';
      }

      const defaultImg =
        item.images && item.images.length > 0
          ? item.images[0]
          : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

      return {
        id: item._id,
        title: item.name,
        subtitle: `${item.brand || 'MY STYLE'} • ${item.category?.name || 'Apparel'}`,
        price: minPrice,
        rating: 5.0,
        reviewCount: item.variants?.reduce((s, v) => s + v.quantity, 0) > 0 ? 24 : 8,
        category: websiteCategory,
        brand: item.brand || 'MY STYLE',
        description: item.description || 'Official luxury tailored garment engineered for style, comfort, and durability.',
        shippingInfo: 'Express nationwide delivery across Cambodia within 1-2 business days. Free returns within 30 days.',
        details: [
          'High performance premium certified fabric',
          'Precision tailored modern fit silhouette',
          'Colorfast wash-tested material',
        ],
        sizes: sizesList.length > 0 ? sizesList : ['S', 'M', 'L', 'XL'],
        colors:
          colorsList.length > 0
            ? colorsList
            : [
                {
                  id: 'c-default',
                  name: 'Onyx Black',
                  hex: '#18181b',
                  image: defaultImg,
                  thumbnails: item.images && item.images.length > 0 ? item.images : [defaultImg],
                },
              ],
        variants: item.variants || [],
        totalStock: item.totalStock ?? item.variants?.reduce((acc, v) => acc + (v.quantity || 0), 0) ?? 0,
      };
    });
  } catch (error) {
    console.error('Error fetching live backend products:', error);
    return [];
  }
}

export async function submitOnlineOrder(orderData: {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  paymentMethod: string;
  notes?: string;
  items: Array<{ variantId: string; quantity: number }>;
}) {
  const res = await fetch(`${API_BASE_URL}/sales/online`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to submit online order');
  }

  return json.data;
}

export async function trackOnlineOrder(query: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/sales/track?search=${encodeURIComponent(query.trim())}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export interface StoreSettings {
  storeName: string;
  tagline?: string;
  currency: string;
  exchangeRateKHR: number;
  taxRate: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  deliveryNotes?: string;
  merchantName?: string;
  bakongAccountId?: string;
  cashOnDeliveryEnabled: boolean;
  bankTransferDetails?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  receiptNote?: string;
  returnPolicyDays: number;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  businessHours?: string;
  facebookUrl?: string;
  telegramChannel?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch store settings');
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching live store settings:', error);
    return {
      storeName: 'My Style Boutique',
      tagline: 'Official Luxury Streetwear & Tailored Clothing Store',
      currency: 'USD',
      exchangeRateKHR: 4100,
      taxRate: 10,
      freeShippingThreshold: 150,
      standardShippingFee: 12,
      deliveryNotes:
        'Express nationwide delivery across Cambodia via Virak Buntham & J&T Express within 1-2 business days.',
      merchantName: 'MY STYLE BOUTIQUE',
      bakongAccountId: 'mystyle@aclb',
      cashOnDeliveryEnabled: true,
      bankTransferDetails: 'ABA Bank: 000 123 456 (MY STYLE BOUTIQUE)',
      returnPolicyDays: 30,
      phone: '+855 12 345 678',
      email: 'contact@mystyle.com',
      address: 'Street 271, Sangkat TTP, Phnom Penh, Cambodia',
      city: 'Phnom Penh',
      country: 'Cambodia',
      businessHours: 'Mon - Sun: 08:00 AM - 09:00 PM',
      facebookUrl: 'https://facebook.com/mystylecambodia',
      telegramChannel: 'https://t.me/mystyleboutique',
      tiktokUrl: 'https://tiktok.com/@mystyle.kh',
      instagramUrl: 'https://instagram.com/mystyle.kh',
    };
  }
}
