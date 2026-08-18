// ============================================================
// Domain Model Types
// Matches MongoDB/Mongoose schemas from the backend
// ============================================================

// ---- Base ----

export interface BaseModel {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Category ----

export interface Category extends BaseModel {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

// ---- Size ----

export interface Size extends BaseModel {
  name: string;
  description?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
}

// ---- Color ----

export interface Color extends BaseModel {
  name: string;
  hexCode: string;
  description?: string;
  status: 'active' | 'inactive';
}

// ---- Product ----

export type ProductStatus = 'active' | 'inactive';

export type ProductAudience = 'men' | 'women' | 'children' | 'unisex';

export interface Product extends BaseModel {
  name: string;
  brand?: string;
  description?: string;
  category: Category;
  audience: ProductAudience;
  images: string[];
  status: ProductStatus;
  variants?: ProductVariant[];
  totalStock?: number;
}

export interface ProductVariant extends BaseModel {
  product: Product | string;
  size: Size;
  color: Color;
  sku: string;
  barcode?: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  lowStockLevel: number;
  image?: string;
}

// ---- Supplier ----

export interface Supplier extends BaseModel {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
}

// ---- Customer ----

export interface Customer extends BaseModel {
  name: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  totalOrders?: number;
  totalSpending?: number;
  status: 'active' | 'inactive';
}

// ---- Purchase ----

export type PurchaseStatus = 'draft' | 'ordered' | 'received' | 'cancelled';

export interface PurchaseItem {
  variant: ProductVariant;
  productName: string;
  sku: string;
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface Purchase extends BaseModel {
  purchaseNumber: string;
  supplier: Supplier;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: PurchaseStatus;
  notes?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  receivedAt?: string;
  receivedBy?: {
    _id: string;
    name: string;
  };
}

// ---- Sale ----

export type SaleStatus = 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'refunded';

export interface SaleItem {
  variant: ProductVariant;
  productName: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export type FulfillmentStatus = 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Sale extends BaseModel {
  invoiceNumber: string;
  customer?: Customer;
  cashier?: {
    _id: string;
    name: string;
  };
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  saleStatus: SaleStatus;
  fulfillmentStatus?: FulfillmentStatus;
  shippingAddress?: string;
  deliveryCarrier?: string;
  trackingNumber?: string;
  saleDate: string;
  notes?: string;
}

// ---- Payment ----

export type PaymentMethod = 'cash' | 'aba_khqr' | 'acleda' | 'wing' | 'card' | 'bank_transfer' | 'cod';

export interface Payment extends BaseModel {
  sale: Sale | string;
  invoiceNumber: string;
  customer?: Customer;
  amount: number;
  method: PaymentMethod;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  receivedBy: {
    _id: string;
    name: string;
  };
}

// ---- Inventory ----

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type StockAdjustmentType = 'purchase' | 'sale' | 'return' | 'adjustment' | 'damaged' | 'lost';

export interface InventoryItem {
  _id: string;
  product: Product;
  variant: ProductVariant;
  sku: string;
  currentStock: number;
  lowStockLevel: number;
  stockStatus: StockStatus;
}

export interface StockHistory extends BaseModel {
  variant: ProductVariant;
  type: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGED' | 'LOST';
  previousStock: number;
  change: number;
  newStock: number;
  reference?: string;
  reason?: string;
  user: {
    _id: string;
    name: string;
    username: string;
  };
}

export interface StockAdjustment {
  variantId: string;
  type: StockAdjustmentType;
  quantity: number;
  reason: string;
  notes?: string;
}

// ---- Employee ----

export interface Employee extends BaseModel {
  name: string;
  username: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  position?: string;
  role: 'admin' | 'cashier' | 'user';
  status: 'active' | 'inactive';
  lastLogin?: string;
}

// ---- Audit Log ----

export interface AuditLog extends BaseModel {
  user: {
    _id: string;
    name: string;
    username: string;
  };
  action: string;
  entity: string;
  entityId: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
}

// ---- Dashboard ----

export interface DashboardData {
  todayRevenue: number;
  todaySalesCount: number;
  todayProfit: number;
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalPurchases: number;
  recentSales: Array<{
    _id: string;
    invoiceNumber: string;
    customer: string;
    grandTotal: number;
    paymentMethod: string;
    saleStatus: SaleStatus;
    saleDate: string;
  }>;
  salesTrend: Array<{ date: string; day: string; sales: number; orders: number; profit: number }>;
  categoryDistribution: Array<{ category: string; sales: number }>;
}

export type DashboardStats = DashboardData;

export interface StoreSettings extends BaseModel {
  key: 'store';
  storeName: string;
  tagline?: string;
  currency: 'USD';
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

// ---- Reports ----

export interface SalesReport {
  date: string;
  revenue: number;
  orders: number;
  averageOrder: number;
}

export interface ProfitReport {
  revenue: number;
  cost: number;
  grossProfit: number;
  profitMargin: number;
}

export interface PurchaseReport {
  supplier: string;
  amount: number;
  purchaseCount: number;
}

export interface InventoryReport {
  stockQuantity: number;
  stockCostValue: number;
  retailValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface BestSellingProduct {
  product: string;
  unitsSold: number;
  revenue: number;
}

// ---- POS Cart (client-side) ----

export interface CartItem {
  variantId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  availableStock: number;
  image?: string;
}

export interface CheckoutPayload {
  customerId?: string;
  items: {
    variantId: string;
    quantity: number;
  }[];
  discount?: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
  notes?: string;
}
