/**
 * Application Constants
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  USER: 'user'
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const PURCHASE_STATUS = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  RECEIVED: 'received',
  CANCELLED: 'cancelled'
} as const;

export type PurchaseStatus = (typeof PURCHASE_STATUS)[keyof typeof PURCHASE_STATUS];

export const SALE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export type SaleStatus = (typeof SALE_STATUS)[keyof typeof SALE_STATUS];

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded'
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHODS = {
  CASH: 'cash',
  ABA_KHQR: 'aba_khqr',
  ACLEDA: 'acleda',
  WING: 'wing',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer'
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const INVENTORY_TRANSACTION_TYPES = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  RETURN: 'RETURN',
  ADJUSTMENT: 'ADJUSTMENT',
  DAMAGED: 'DAMAGED',
  LOST: 'LOST'
} as const;

export type InventoryTransactionType =
  (typeof INVENTORY_TRANSACTION_TYPES)[keyof typeof INVENTORY_TRANSACTION_TYPES];

export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  CHANGE_ROLE: 'CHANGE_ROLE',
  CREATE_PRODUCT: 'CREATE_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  CREATE_PURCHASE: 'CREATE_PURCHASE',
  RECEIVE_PURCHASE: 'RECEIVE_PURCHASE',
  CREATE_SALE: 'CREATE_SALE',
  CANCEL_SALE: 'CANCEL_SALE',
  STOCK_ADJUSTMENT: 'STOCK_ADJUSTMENT',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND'
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;
