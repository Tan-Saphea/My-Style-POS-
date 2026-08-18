import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Sale Model — POS Sales Transactions
// ============================================================

export interface ISaleItem {
  variant: Types.ObjectId;
  productName: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  subtotal: number;
}

export type FulfillmentStatus = 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface ISale extends Document {
  invoiceNumber: string;
  customer?: Types.ObjectId;
  cashier: Types.ObjectId;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod?: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  saleStatus: 'completed' | 'cancelled' | 'refunded';
  fulfillmentStatus: FulfillmentStatus;
  shippingAddress?: string;
  deliveryCarrier?: string;
  trackingNumber?: string;
  notes?: string;
  saleDate: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    cashier: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: 'cash' },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
    },
    saleStatus: {
      type: String,
      enum: ['completed', 'cancelled', 'refunded'],
      default: 'completed',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: { type: String, trim: true, maxlength: 500 },
    deliveryCarrier: { type: String, trim: true, maxlength: 100 },
    trackingNumber: { type: String, trim: true, maxlength: 100 },
    notes: { type: String, trim: true },
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

saleSchema.index({ saleDate: -1 });
saleSchema.index({ cashier: 1 });
saleSchema.index({ saleStatus: 1 });

// Generate a concurrency-safe invoice number from the document ObjectId.
saleSchema.pre('validate', function (next) {
  if (!this.invoiceNumber) {
    const today = new Date();
    const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    this.invoiceNumber = `${prefix}-${String(this._id).slice(-6).toUpperCase()}`;
  }
  next();
});

export const Sale = mongoose.model<ISale>('Sale', saleSchema);
