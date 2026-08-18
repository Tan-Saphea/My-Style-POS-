import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// Color Model — Color Definitions with Hex Codes
// ============================================================

export interface IColor extends Document {
  name: string;
  hexCode: string;
  description?: string;
  status: 'active' | 'inactive';
}

const colorSchema = new Schema<IColor>(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    hexCode: { type: String, required: true, match: /^#[0-9A-Fa-f]{6}$/ },
    description: { type: String, trim: true, maxlength: 200 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Color = mongoose.model<IColor>('Color', colorSchema);
