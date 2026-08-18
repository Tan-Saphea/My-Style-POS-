import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// Customer Model
// ============================================================

export interface ICustomer extends Document {
  name: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpending: number;
  status: 'active' | 'inactive';
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true, maxlength: 500 },
    totalOrders: { type: Number, default: 0, min: 0 },
    totalSpending: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text' });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
