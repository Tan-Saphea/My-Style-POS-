import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Must be a valid identifier');

const optionalTrimmed = (max: number) => z.string().trim().max(max).optional();
const requiredTrimmed = (max: number) => z.string().trim().min(1).max(max);
const status = z.enum(['active', 'inactive']);

export const idParamsSchema = z.object({ id: objectId }).strict();

const emptyToUndefined = (val: unknown) => (val === '' || val === null ? undefined : val);
const optionalObjectId = z.preprocess(emptyToUndefined, objectId.optional());
const optionalStatus = z.preprocess(emptyToUndefined, status.optional());
const optionalSearch = z.preprocess(emptyToUndefined, z.string().trim().max(100).optional());

export const listQuerySchema = z
  .object({
    search: optionalSearch,
    status: optionalStatus,
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .passthrough();

const audienceEnum = z.enum(['men', 'women', 'children', 'unisex']);

export const productListQuerySchema = listQuerySchema.extend({
  category: optionalObjectId,
  audience: z.preprocess(emptyToUndefined, audienceEnum.optional()),
});

export const loginBodySchema = z
  .object({
    username: requiredTrimmed(100),
    password: z.string().min(1).max(128),
  })
  .strict();

export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.confirmPassword && value.confirmPassword !== value.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
    if (value.currentPassword === value.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newPassword'],
        message: 'New password must be different from the current password',
      });
    }
  });

const categoryFields = {
  name: requiredTrimmed(100),
  description: optionalTrimmed(500),
  status: status.optional(),
};

export const createCategoryBodySchema = z.object(categoryFields).strict();
export const updateCategoryBodySchema = z
  .object({
    name: requiredTrimmed(100).optional(),
    description: optionalTrimmed(500),
    status: status.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

const optionalImage = z.preprocess(emptyToUndefined, z.string().max(10_000_000).optional());
const optionalBarcode = z.preprocess(emptyToUndefined, z.string().trim().max(100).optional());
const optionalBrand = z.preprocess(emptyToUndefined, z.string().trim().max(100).optional());
const optionalDescription = z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional());

const variantObjectSchema = z.object({
  _id: z.preprocess(emptyToUndefined, objectId.optional()),
  size: objectId,
  color: objectId,
  sku: requiredTrimmed(80).transform((value) => value.toUpperCase()),
  barcode: optionalBarcode,
  costPrice: z.coerce.number().finite().nonnegative(),
  salePrice: z.coerce.number().finite().nonnegative(),
  quantity: z.coerce.number().int().nonnegative(),
  lowStockLevel: z.coerce.number().int().nonnegative().default(5),
  image: optionalImage,
});

const variantSchema = variantObjectSchema.refine((value) => value.salePrice >= value.costPrice, {
  path: ['salePrice'],
  message: 'Sale price must be greater than or equal to cost price',
});

export const createProductBodySchema = z.object({
  name: requiredTrimmed(200),
  brand: optionalBrand,
  description: optionalDescription,
  category: objectId,
  audience: z.preprocess(emptyToUndefined, audienceEnum.optional()),
  images: z.preprocess(
    (val) => (Array.isArray(val) ? val.filter((item) => typeof item === 'string' && item.trim().length > 0) : undefined),
    z.array(z.string().max(10_000_000)).max(50).optional()
  ),
  status: optionalStatus,
  variants: z.array(variantSchema).min(1).max(100),
});

export const updateProductBodySchema = z
  .object({
    name: requiredTrimmed(200).optional(),
    brand: optionalBrand,
    description: optionalDescription,
    category: optionalObjectId,
    audience: z.preprocess(emptyToUndefined, audienceEnum.optional()),
    images: z.preprocess(
      (val) => (Array.isArray(val) ? val.filter((item) => typeof item === 'string' && item.trim().length > 0) : undefined),
      z.array(z.string().max(10_000_000)).max(50).optional()
    ),
    status: optionalStatus,
    variants: z.array(variantSchema).min(1).max(100).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const createSizeBodySchema = z
  .object({
    name: requiredTrimmed(20),
    description: optionalTrimmed(200),
    sortOrder: z.coerce.number().int().min(0).max(10000).optional(),
    status: status.optional(),
  })
  .strict();

export const updateSizeBodySchema = createSizeBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const createColorBodySchema = z
  .object({
    name: requiredTrimmed(50),
    hexCode: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Use a six-digit HEX color'),
    description: optionalTrimmed(200),
    status: status.optional(),
  })
  .strict();

export const updateColorBodySchema = createColorBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const createCustomerBodySchema = z
  .object({
    name: requiredTrimmed(200),
    gender: z.enum(['male', 'female', 'other']).optional(),
    phone: optionalTrimmed(40),
    email: z.string().trim().email().max(254).or(z.literal('')).optional(),
    address: optionalTrimmed(500),
    status: status.optional(),
  })
  .strict();

export const updateCustomerBodySchema = createCustomerBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const createSupplierBodySchema = z
  .object({
    name: requiredTrimmed(200),
    contactPerson: optionalTrimmed(100),
    phone: optionalTrimmed(40),
    email: z.string().trim().email().max(254).or(z.literal('')).optional(),
    address: optionalTrimmed(500),
    status: status.optional(),
  })
  .strict();

export const updateSupplierBodySchema = createSupplierBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const createUserBodySchema = z
  .object({
    name: requiredTrimmed(100),
    username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_.-]+$/),
    email: z.string().trim().email().max(254),
    phone: optionalTrimmed(40),
    gender: z.enum(['male', 'female', 'other']).optional(),
    position: optionalTrimmed(100),
    role: z.enum(['admin', 'cashier', 'user']),
    password: z.string().min(8).max(128),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  })
  .strict();

export const updateUserBodySchema = createUserBodySchema
  .omit({ password: true })
  .partial()
  .extend({ password: z.string().min(8).max(128).optional() })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const updateProfileBodySchema = z.object({
  name: requiredTrimmed(100).optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().max(40).or(z.literal('')).nullable().optional(),
  gender: z.enum(['male', 'female', 'other', '']).nullable().optional(),
  position: z.string().trim().max(100).or(z.literal('')).nullable().optional(),
  avatar: z.string().max(2000000).or(z.literal('')).nullable().optional(),
});

const saleItemSchema = z
  .object({
    variantId: objectId,
    quantity: z.coerce.number().int().positive().max(10000),
  })
  .strict();

export const createSaleBodySchema = z
  .object({
    items: z.array(saleItemSchema).min(1).max(100),
    customerId: objectId.optional(),
    discount: z.coerce.number().finite().nonnegative().default(0),
    paymentMethod: z
      .enum(['cash', 'aba_khqr', 'acleda', 'wing', 'card', 'bank_transfer', 'cod'])
      .default('cash'),
    amountReceived: z.coerce.number().finite().nonnegative().optional(),
    notes: optionalTrimmed(1000),
  })
  .strict()
  .refine(
    (value) => new Set(value.items.map((item) => item.variantId)).size === value.items.length,
    { path: ['items'], message: 'Duplicate variants must be combined into one cart item' }
  );

export const createOnlineSaleBodySchema = z
  .object({
    customerName: requiredTrimmed(200),
    phone: requiredTrimmed(40),
    email: z.string().trim().email().max(254).or(z.literal('')).optional(),
    address: requiredTrimmed(500),
    paymentMethod: z
      .enum(['cash', 'aba_khqr', 'acleda', 'wing', 'card', 'bank_transfer', 'cod'])
      .default('cod'),
    notes: optionalTrimmed(1000),
    items: z.array(saleItemSchema).min(1).max(100),
  })
  .strict();

export const updateDeliveryStatusSchema = z
  .object({
    fulfillmentStatus: z.enum(['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled']).optional(),
    deliveryCarrier: optionalTrimmed(100),
    trackingNumber: optionalTrimmed(100),
    notes: optionalTrimmed(1000),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const saleListQuerySchema = z
  .object({
    search: optionalSearch,
    status: z.preprocess(emptyToUndefined, z.enum(['completed', 'cancelled', 'refunded']).optional()),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .passthrough();

const purchaseItemSchema = z
  .object({
    variantId: objectId,
    quantity: z.coerce.number().int().positive().max(100000),
    costPrice: z.coerce.number().finite().nonnegative(),
  })
  .strict();

const purchaseFields = {
    supplierId: objectId,
    purchaseDate: z.coerce.date().optional(),
    items: z.array(purchaseItemSchema).min(1).max(200),
    discount: z.coerce.number().finite().nonnegative().default(0),
    status: z.enum(['draft', 'ordered']).default('ordered'),
    notes: optionalTrimmed(1000),
};

export const createPurchaseBodySchema = z
  .object(purchaseFields)
  .strict()
  .refine(
    (value) => new Set(value.items.map((item) => item.variantId)).size === value.items.length,
    { path: ['items'], message: 'Duplicate variants must be combined into one line item' }
  );

export const updatePurchaseBodySchema = z
  .object({
    supplierId: objectId.optional(),
    purchaseDate: z.coerce.date().optional(),
    items: z.array(purchaseItemSchema).min(1).max(200).optional(),
    discount: z.coerce.number().finite().nonnegative().optional(),
    status: z.enum(['draft', 'ordered']).optional(),
    notes: optionalTrimmed(1000),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const purchaseListQuerySchema = z
  .object({
    search: optionalSearch,
    status: z.preprocess(emptyToUndefined, z.enum(['draft', 'ordered', 'received', 'cancelled']).optional()),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .passthrough();

export const adjustStockBodySchema = z
  .object({
    variantId: objectId,
    change: z.coerce.number().int().min(-100000).max(100000).refine((value) => value !== 0),
    reason: requiredTrimmed(500),
    type: z.enum(['ADJUSTMENT', 'DAMAGED', 'LOST', 'RETURN']).default('ADJUSTMENT'),
  })
  .strict();

export const searchQuerySchema = z
  .object({ search: optionalSearch })
  .passthrough();

export const inventoryHistoryQuerySchema = z
  .object({
    search: optionalSearch,
    type: z.preprocess(emptyToUndefined, z.enum(['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'DAMAGED', 'LOST']).optional()),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .passthrough();

export const reportQuerySchema = z
  .object({
    startDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
    endDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  })
  .passthrough()
  .refine((value) => !value.startDate || !value.endDate || value.startDate <= value.endDate, {
    path: ['endDate'],
    message: 'End date must be on or after start date',
  });

export const updateSettingsBodySchema = z.object({
  storeName: requiredTrimmed(200),
  tagline: z.preprocess(emptyToUndefined, z.string().trim().max(300).optional()),
  currency: z.literal('USD').default('USD'),
  exchangeRateKHR: z.coerce.number().finite().min(1000).max(10000).default(4100),
  taxRate: z.coerce.number().finite().min(0).max(100).default(10),
  freeShippingThreshold: z.coerce.number().finite().min(0).max(10000).default(150),
  standardShippingFee: z.coerce.number().finite().min(0).max(1000).default(12),
  deliveryNotes: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
  merchantName: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  bakongAccountId: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  cashOnDeliveryEnabled: z.boolean().default(true),
  bankTransferDetails: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
  receiptHeader: z.preprocess(emptyToUndefined, z.string().trim().max(300).optional()),
  receiptFooter: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  receiptNote: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
  returnPolicyDays: z.coerce.number().int().min(0).max(365).default(30),
  logoUrl: z.preprocess(emptyToUndefined, z.string().max(10000000).optional()),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(40).optional()),
  email: z.preprocess(emptyToUndefined, z.string().trim().email().max(254).optional()),
  address: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  city: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  country: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  businessHours: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  facebookUrl: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  telegramChannel: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  tiktokUrl: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  instagramUrl: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
});
