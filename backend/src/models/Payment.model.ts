import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Payment Model
// ============================================================

export interface IPayment extends Document {
  sale: Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  method: 'cash' | 'aba_khqr' | 'acleda' | 'wing' | 'card' | 'bank_transfer' | 'cod';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  receivedBy?: Types.ObjectId;
  notes?: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    sale: { type: Schema.Types.ObjectId, ref: 'Sale', required: true },
    invoiceNumber: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['cash', 'aba_khqr', 'acleda', 'wing', 'card', 'bank_transfer', 'cod'],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed', 'refunded'],
      default: 'completed',
    },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

paymentSchema.index({ sale: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
