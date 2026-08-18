import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Purchase Model — Supplier Purchase Orders
// ============================================================

export interface IPurchaseItem {
  variant: Types.ObjectId;
  productName: string;
  sku: string;
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface IPurchase extends Document {
  purchaseNumber: string;
  supplier: Types.ObjectId;
  purchaseDate: Date;
  items: IPurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
  createdBy: Types.ObjectId;
  receivedAt?: Date;
  receivedBy?: Types.ObjectId;
}

const purchaseItemSchema = new Schema<IPurchaseItem>(
  {
    variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    costPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseSchema = new Schema<IPurchase>(
  {
    purchaseNumber: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    purchaseDate: { type: Date, default: Date.now },
    items: [purchaseItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'ordered', 'received', 'cancelled'],
      default: 'draft',
    },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receivedAt: { type: Date },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

purchaseSchema.index({ supplier: 1 });
purchaseSchema.index({ status: 1 });

// Generate a concurrency-safe purchase number from the document ObjectId.
purchaseSchema.pre('validate', function (next) {
  if (!this.purchaseNumber) {
    const today = new Date();
    const prefix = `PO-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    this.purchaseNumber = `${prefix}-${String(this._id).slice(-6).toUpperCase()}`;
  }
  next();
});

export const Purchase = mongoose.model<IPurchase>('Purchase', purchaseSchema);
