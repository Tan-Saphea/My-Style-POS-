import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// ProductVariant Model — Size/Color/Price/Stock Combinations
// ============================================================

export interface IProductVariant extends Document {
  product: Types.ObjectId;
  size: Types.ObjectId;
  color: Types.ObjectId;
  sku: string;
  barcode?: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  lowStockLevel: number;
  image?: string;
}

const productVariantSchema = new Schema<IProductVariant>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: Schema.Types.ObjectId, ref: 'Size', required: true },
    color: { type: Schema.Types.ObjectId, ref: 'Color', required: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    barcode: { type: String, trim: true },
    costPrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockLevel: { type: Number, default: 5, min: 0 },
    image: { type: String, trim: true },
  },
  { timestamps: true }
);

productVariantSchema.index({ product: 1 });
productVariantSchema.index({ quantity: 1 });
productVariantSchema.index({ product: 1, size: 1, color: 1 }, { unique: true });

export const ProductVariant = mongoose.model<IProductVariant>('ProductVariant', productVariantSchema);
