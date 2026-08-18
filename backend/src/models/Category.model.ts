import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// Category Model — Product Classification
// ============================================================

export interface ICategory extends Document {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', categorySchema);
