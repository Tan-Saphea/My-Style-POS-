import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// Size Model — Clothing Size Definitions
// ============================================================

export interface ISize extends Document {
  name: string;
  description?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
}

const sizeSchema = new Schema<ISize>(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 20 },
    description: { type: String, trim: true, maxlength: 200 },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

sizeSchema.index({ sortOrder: 1 });

export const Size = mongoose.model<ISize>('Size', sizeSchema);
