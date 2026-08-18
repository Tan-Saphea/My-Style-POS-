import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInventoryTransaction extends Document {
  variant: Types.ObjectId;
  type: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGED' | 'LOST';
  previousStock: number;
  change: number;
  newStock: number;
  reference?: string;
  reason?: string;
  user: Types.ObjectId;
}

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    type: {
      type: String,
      enum: ['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'DAMAGED', 'LOST'],
      required: true,
    },
    previousStock: { type: Number, required: true, min: 0 },
    change: { type: Number, required: true },
    newStock: { type: Number, required: true, min: 0 },
    reference: { type: String, trim: true, maxlength: 100 },
    reason: { type: String, trim: true, maxlength: 500 },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

inventoryTransactionSchema.index({ variant: 1, createdAt: -1 });
inventoryTransactionSchema.index({ type: 1, createdAt: -1 });
inventoryTransactionSchema.index({ reference: 1 });

export const InventoryTransaction = mongoose.model<IInventoryTransaction>(
  'InventoryTransaction',
  inventoryTransactionSchema
);
