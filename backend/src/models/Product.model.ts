import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Product Model — Core Clothing Product
// ============================================================

export type ProductAudience = 'men' | 'women' | 'children' | 'unisex';

export interface IProduct extends Document {
  name: string;
  brand?: string;
  description?: string;
  category: Types.ObjectId;
  audience: ProductAudience;
  images: string[];
  status: 'active' | 'inactive';
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    brand: { type: String, trim: true, maxlength: 100, default: 'My Style' },
    description: { type: String, trim: true, maxlength: 2000 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    audience: { type: String, enum: ['men', 'women', 'children', 'unisex'], default: 'unisex' },
    images: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for variants
productSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'product',
});

productSchema.index({ name: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ audience: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);

