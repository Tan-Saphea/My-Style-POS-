'use client';

import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, X, ArrowRight, AlertCircle } from 'lucide-react';
import { trackOnlineOrder } from '@/lib/api';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function OrderTrackerModal({ isOpen, onClose, initialQuery = '' }: OrderTrackerModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [orders, setOrders] = useState<any[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMsg(null);
    setOrders(null);

    try {
      const data = await trackOnlineOrder(searchQuery.trim());
      if (data && data.length > 0) {
        setOrders(data);
      } else {
        setErrorMsg('No order found matching your invoice number or phone number.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to find order. Please verify your invoice number.');
    } finally {
      setIsSearching(false);
    }
  };

  const getFulfillmentStep = (status?: string) => {
    switch (status) {
      case 'processing':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 1; // pending
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full z-10 overflow-hidden border border-zinc-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900">
            Track Your Order
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Box */}
        <div className="p-4 sm:p-5 bg-zinc-50 border-b border-zinc-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Enter invoice # (e.g. INV-...) or phone #"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs focus:outline-none focus:border-zinc-900 text-zinc-900"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {/* Modal Content / Results */}
        <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!orders && !errorMsg && (
            <div className="text-center py-10 text-zinc-500">
              <Package className="w-10 h-10 mx-auto mb-2 text-zinc-300 stroke-1" />
              <p className="text-xs">Enter your invoice or phone number above to check delivery status.</p>
            </div>
          )}

          {orders && orders.map((order) => {
            const step = getFulfillmentStep(order.fulfillmentStatus);

            return (
              <div key={order._id} className="border border-zinc-200 rounded-xl p-4 space-y-4 bg-white">
                
                {/* Order Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium">Invoice Number</span>
                    <h4 className="text-sm font-bold text-zinc-900">{order.invoiceNumber}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-400 font-medium">Total</span>
                    <div className="text-sm font-bold text-zinc-900">${(order.grandTotal || 0).toFixed(2)}</div>
                  </div>
                </div>

                {/* Stepper Status Indicator */}
                <div className="py-2">
                  <div className="grid grid-cols-4 gap-1 text-center text-[11px]">
                    <div className={`p-2 rounded-lg border ${step >= 1 ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-zinc-200 text-zinc-400'}`}>
                      Order Placed
                    </div>
                    <div className={`p-2 rounded-lg border ${step >= 2 ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-zinc-200 text-zinc-400'}`}>
                      Processing
                    </div>
                    <div className={`p-2 rounded-lg border ${step >= 3 ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-zinc-200 text-zinc-400'}`}>
                      On the Way
                    </div>
                    <div className={`p-2 rounded-lg border ${step >= 4 ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-zinc-200 text-zinc-400'}`}>
                      Delivered
                    </div>
                  </div>
                </div>

                {/* Customer & Delivery Summary */}
                <div className="bg-zinc-50 rounded-lg p-3 space-y-1.5 text-zinc-600 text-xs">
                  <div className="flex justify-between">
                    <span>Customer Name:</span>
                    <strong className="text-zinc-900">{order.customer?.name || order.customerName || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone Number:</span>
                    <strong className="text-zinc-900">{order.customer?.phone || order.phone || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Address:</span>
                    <strong className="text-zinc-900">{order.shippingAddress || 'Store Pickup'}</strong>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
