'use client';

import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, Check } from 'lucide-react';
import { CartItem, StoreCurrency } from '@/types/store';
import { StoreSettings } from '@/lib/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onProceedToCheckout: () => void;
  settings?: StoreSettings | null;
  currency?: StoreCurrency;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  settings,
  currency = 'USD',
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 150;
  const standardFee = settings?.standardShippingFee ?? 12;
  const exchangeRate = settings?.exchangeRateKHR ?? 4100;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const formatPrice = (usd: number) => {
    if (currency === 'KHR') {
      return `${Math.round(usd * exchangeRate).toLocaleString()} ៛`;
    }
    return `$${usd.toFixed(2)}`;
  };

  const handleApplyCoupon = () => {
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (code === 'MYSTYLE10') {
      setAppliedCoupon('MYSTYLE10');
      setCouponDiscountPercent(10);
    } else if (code === 'VIP20') {
      setAppliedCoupon('VIP20');
      setCouponDiscountPercent(20);
    } else {
      setCouponError('Invalid code. Try "MYSTYLE10" for 10% off.');
    }
  };

  const discountAmount = (subtotal * couponDiscountPercent) / 100;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardFee;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-200">

          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900">
                Shopping Bag
              </h2>
              <span className="text-xs font-bold text-white bg-zinc-900 px-2 py-0.5 rounded-full">
                {totalItemsCount}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Banner */}
          <div className="bg-zinc-50 border-b border-zinc-200 p-3 sm:p-4 text-xs">
            <div className="flex items-center justify-between font-medium text-zinc-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                {remainingForFreeShipping > 0
                  ? `Add ${formatPrice(remainingForFreeShipping)} more for FREE shipping`
                  : 'You unlocked free express shipping'}
              </span>
              <span className="text-emerald-800 font-bold">{Math.round(shippingProgress)}%</span>
            </div>
            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-zinc-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 mb-1">Your bag is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mb-4">
                  Browse our catalog and add your favorite items.
                </p>
                <button
                  onClick={onClose}
                  className="py-2.5 px-5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.cartId} className="py-3.5 first:pt-0 last:pb-0 flex gap-3.5">
                  <img
                    src={item.selectedColor.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                    alt={item.title}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.cartId)}
                          className="text-zinc-400 hover:text-red-600 transition p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-medium">
                        <span>Color: <strong>{item.selectedColor.name}</strong></span>
                        <span>•</span>
                        <span>Size: <strong>{item.selectedSize}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-zinc-300 rounded-md bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, -1)}
                          className="p-1 text-zinc-600 hover:text-zinc-950"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-zinc-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, 1)}
                          disabled={item.availableStock !== undefined && item.quantity >= item.availableStock}
                          className="p-1 text-zinc-600 hover:text-zinc-950 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs sm:text-sm font-bold text-zinc-950">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50 space-y-3">
              
              {/* Promo code input */}
              <div className="space-y-1">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Promo applied: <strong>{appliedCoupon} ({couponDiscountPercent}% OFF)</strong>
                    </span>
                    <button
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponDiscountPercent(0);
                      }}
                      className="text-zinc-500 hover:text-zinc-900 text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. MYSTYLE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white border border-zinc-300 px-3 py-1.5 rounded-lg text-xs uppercase focus:outline-none focus:border-zinc-900"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-1.5 bg-zinc-900 text-white font-semibold text-xs rounded-lg hover:bg-zinc-800 transition"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1 text-xs text-zinc-600 border-t border-zinc-200 pt-2 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({couponDiscountPercent}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{shippingCost === 0 ? <strong className="text-emerald-700">Free</strong> : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-950 border-t border-zinc-200 pt-1.5">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3 bg-zinc-950 text-white hover:bg-zinc-800 font-bold text-xs uppercase tracking-wider rounded-lg transition"
              >
                Proceed to Checkout
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
