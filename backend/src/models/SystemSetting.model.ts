import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSetting extends Document {
  key: 'store';
  storeName: string;
  tagline?: string;
  currency: 'USD';
  exchangeRateKHR: number;
  taxRate: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  deliveryNotes?: string;
  merchantName?: string;
  bakongAccountId?: string;
  cashOnDeliveryEnabled: boolean;
  bankTransferDetails?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  receiptNote?: string;
  returnPolicyDays: number;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  businessHours?: string;
  facebookUrl?: string;
  telegramChannel?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, enum: ['store'], default: 'store', unique: true },
    storeName: { type: String, required: true, trim: true, maxlength: 200, default: 'My Style Boutique' },
    tagline: { type: String, trim: true, maxlength: 300, default: 'Official Luxury Streetwear & Tailored Clothing Store' },
    currency: { type: String, enum: ['USD'], default: 'USD' },
    exchangeRateKHR: { type: Number, min: 1000, max: 10000, default: 4100 },
    taxRate: { type: Number, min: 0, max: 100, default: 10 },
    freeShippingThreshold: { type: Number, min: 0, max: 10000, default: 150 },
    standardShippingFee: { type: Number, min: 0, max: 1000, default: 12 },
    deliveryNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: 'Express nationwide delivery across Cambodia via Virak Buntham & J&T Express within 1-2 business days.',
    },
    merchantName: { type: String, trim: true, maxlength: 200, default: 'MY STYLE BOUTIQUE' },
    bakongAccountId: { type: String, trim: true, maxlength: 100, default: 'mystyle@aclb' },
    cashOnDeliveryEnabled: { type: Boolean, default: true },
    bankTransferDetails: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: 'ABA Bank: 000 123 456 (MY STYLE BOUTIQUE) • ACLEDA: 1234-5678-9012-34',
    },
    receiptHeader: { type: String, trim: true, maxlength: 300, default: 'MY STYLE BOUTIQUE - Flagship Store' },
    receiptFooter: { type: String, trim: true, maxlength: 500, default: 'Thank you for shopping with My Style Boutique!' },
    receiptNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: 'Items can be exchanged within 30 days with original tags and valid receipt.',
    },
    returnPolicyDays: { type: Number, min: 0, max: 365, default: 30 },
    logoUrl: { type: String, maxlength: 10000000 },
    phone: { type: String, trim: true, maxlength: 40, default: '+855 12 345 678' },
    email: { type: String, trim: true, lowercase: true, maxlength: 254, default: 'contact@mystyle.com' },
    address: { type: String, trim: true, maxlength: 500, default: 'Street 271, Sangkat TTP, Phnom Penh, Cambodia' },
    city: { type: String, trim: true, maxlength: 100, default: 'Phnom Penh' },
    country: { type: String, trim: true, maxlength: 100, default: 'Cambodia' },
    businessHours: { type: String, trim: true, maxlength: 200, default: 'Mon - Sun: 08:00 AM - 09:00 PM' },
    facebookUrl: { type: String, trim: true, maxlength: 500, default: 'https://facebook.com/mystylecambodia' },
    telegramChannel: { type: String, trim: true, maxlength: 500, default: 'https://t.me/mystyleboutique' },
    tiktokUrl: { type: String, trim: true, maxlength: 500, default: 'https://tiktok.com/@mystyle.kh' },
    instagramUrl: { type: String, trim: true, maxlength: 500, default: 'https://instagram.com/mystyle.kh' },
  },
  { timestamps: true }
);

export const SystemSetting = mongoose.model<ISystemSetting>('SystemSetting', systemSettingSchema);
