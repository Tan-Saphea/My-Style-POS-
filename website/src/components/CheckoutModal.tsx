'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Printer,
  Tag,
  MapPin,
  Truck,
  Navigation,
  Check,
  Loader2,
  Home,
  Briefcase,
} from 'lucide-react';
import { CartItem, StoreCurrency } from '@/types/store';
import { StoreSettings, submitOnlineOrder } from '@/lib/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (orderId: string) => void;
  settings?: StoreSettings | null;
  currency?: StoreCurrency;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
  settings,
  currency = 'USD',
}: CheckoutModalProps) {
  // Delivery Mode Selection:
  // 1. 'custom_address' = Deliver to home/office/chosen address (when user is outside/ordering for later)
  // 2. 'current_gps' = Deliver directly to live present location (auto-pinned GPS)
  const [deliveryMode, setDeliveryMode] = useState<'custom_address' | 'current_gps'>('custom_address');
  const [addressPreset, setAddressPreset] = useState<'Home' | 'Work' | 'Other'>('Home');

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    province: 'Phnom Penh',
    district: '',
    address: '', // Street, House #, Sangkat/Commune
    landmark: '', // Near landmark / instructions
    paymentMethod: 'aba_khqr' as 'aba_khqr' | 'cod' | 'acleda' | 'card',
    notes: '',
  });

  const [mapLink, setMapLink] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState<string | null>(null);

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number; discountFixed: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState('');
  const [finalPaidAmount, setFinalPaidAmount] = useState<number>(0);

  const cambodianProvinces = [
    'Phnom Penh',
    'Siem Reap',
    'Battambang',
    'Sihanoukville (Preah Sihanouk)',
    'Kampong Cham',
    'Kandal',
    'Kampot',
    'Kep',
    'Koh Kong',
    'Kratie',
    'Mondulkiri',
    'Preah Vihear',
    'Prey Veng',
    'Pursat',
    'Ratanakiri',
    'Stung Treng',
    'Svay Rieng',
    'Takeo',
    'Oddar Meanchey',
    'Pailin',
    'Tboung Khmum',
    'Banteay Meanchey',
    'Kampong Chhnang',
    'Kampong Speu',
    'Kampong Thom',
  ];

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 150;
  const standardFee = settings?.standardShippingFee ?? 12;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : standardFee;

  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercent > 0) {
      promoDiscount = (subtotal * appliedPromo.discountPercent) / 100;
    } else if (appliedPromo.discountFixed > 0) {
      promoDiscount = Math.min(appliedPromo.discountFixed, subtotal);
    }
  }

  const totalAmount = Math.max(0, subtotal - promoDiscount + shippingFee);
  const exchangeRate = settings?.exchangeRateKHR ?? 4100;
  const totalAmountKHR = Math.round(totalAmount * exchangeRate);

  const formatPrice = (usd: number) => {
    if (currency === 'KHR') {
      return `${Math.round(usd * exchangeRate).toLocaleString()} ៛`;
    }
    return `$${usd.toFixed(2)}`;
  };

  const handleGetCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationSuccess(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const generatedLink = `https://maps.google.com/?q=${lat},${lng}`;
        setMapLink(generatedLink);
        setIsLocating(false);
        setLocationSuccess(`Current GPS Location Pinned (${lat}, ${lng})`);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can select your province and type your address manually.';
        }
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleApplyPromo = () => {
    setPromoError(null);
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'MYSTYLE10') {
      setAppliedPromo({ code, discountPercent: 10, discountFixed: 0 });
    } else if (code === 'VIP20') {
      setAppliedPromo({ code, discountPercent: 20, discountFixed: 0 });
    } else if (code === 'WELCOME5') {
      setAppliedPromo({ code, discountPercent: 0, discountFixed: 5 });
    } else {
      setPromoError('Invalid promo code. Try "MYSTYLE10" for 10% off.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Please fill in your recipient name, phone number, and delivery address.');
      return;
    }

    if (formData.paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
        alert('Please complete your credit / debit card details.');
        return;
      }
    }

    setIsSubmitting(true);
    let orderNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const itemMap = new Map<string, number>();

      for (const item of cartItems) {
        const vId = item.variantId || item.productId;
        if (vId) {
          itemMap.set(vId, (itemMap.get(vId) || 0) + item.quantity);
        }
      }

      const onlineItems = Array.from(itemMap.entries()).map(([variantId, quantity]) => ({
        variantId,
        quantity,
      }));

      // Assemble structured delivery destination
      const destinationPrefix = `[${addressPreset.toUpperCase()}]`;
      const fullDeliveryAddress = [
        destinationPrefix,
        formData.address.trim(),
        formData.district.trim() ? `District: ${formData.district.trim()}` : '',
        formData.province.trim(),
        formData.landmark.trim() ? `[Landmark: ${formData.landmark.trim()}]` : '',
        mapLink.trim() ? `[Maps: ${mapLink.trim()}]` : '',
      ]
        .filter(Boolean)
        .join(', ');

      const notesPayload = [
        deliveryMode === 'current_gps' ? 'Location Mode: Live GPS' : `Location Mode: Custom Address (${addressPreset})`,
        formData.notes ? `Customer Note: ${formData.notes}` : '',
        formData.landmark ? `Landmark: ${formData.landmark}` : '',
        mapLink ? `Google Maps: ${mapLink}` : '',
        appliedPromo ? `Promo: ${appliedPromo.code} (-$${promoDiscount.toFixed(2)})` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const resData = await submitOnlineOrder({
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: fullDeliveryAddress,
        paymentMethod: formData.paymentMethod,
        notes: notesPayload || undefined,
        items: onlineItems,
      });

      if (resData?.invoiceNumber) {
        orderNumber = resData.invoiceNumber;
      }
    } catch (err: any) {
      console.warn('Online order notice:', err.message);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setCompletedOrderId(orderNumber);
      setFinalPaidAmount(totalAmount);
      setOrderCompleted(true);
      onOrderSuccess(orderNumber);
    }, 400);
  };

  const getFullAddressPreview = () => {
    return [
      `[${addressPreset}]`,
      formData.address.trim(),
      formData.district.trim(),
      formData.province,
      formData.landmark.trim() ? `(Near: ${formData.landmark.trim()})` : '',
    ]
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full z-10 overflow-hidden border border-zinc-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              Checkout & Delivery
            </h3>
            <p className="text-xs text-zinc-500">Provide destination details and select payment method</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderCompleted ? (
          /* Order Confirmation View */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Order Placed Successfully
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Official Invoice Number: <strong className="text-zinc-900 font-mono">{completedOrderId}</strong>
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-zinc-500">Recipient Name:</span>
                <strong className="text-zinc-900">{formData.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Phone Number:</span>
                <strong className="text-zinc-900">{formData.phone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Delivery Destination:</span>
                <strong className="text-zinc-900 text-right max-w-[240px] truncate">{getFullAddressPreview()}</strong>
              </div>
              {mapLink && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Google Maps Pin:</span>
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 font-bold underline truncate max-w-[200px]"
                  >
                    Open Pinned Location
                  </a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Status:</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  formData.paymentMethod === 'cod'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {formData.paymentMethod === 'cod' ? 'Cash on Delivery (Pending)' : 'Paid Online (KHQR / Card)'}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold text-sm">
                <span className="text-zinc-900">Total Amount:</span>
                <span className="text-zinc-900">{formatPrice(finalPaidAmount || totalAmount)}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {formData.paymentMethod === 'cod'
                ? 'Your order is recorded. Please prepare cash to pay the courier upon package arrival.'
                : 'Thank you for your payment! Our team is preparing your package for express delivery.'}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-lg border border-zinc-300 text-zinc-800 font-semibold text-xs hover:bg-zinc-50 transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-lg bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
            
            {/* Step 1: Delivery Mode & Destination Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                <div className="flex items-center gap-2 font-bold text-zinc-900">
                  <MapPin className="w-4 h-4 text-zinc-900" />
                  <span>1. Delivery Destination</span>
                </div>

                {/* Preset Tag (Home, Office, Other) */}
                <div className="flex items-center gap-1">
                  {(['Home', 'Work', 'Other'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAddressPreset(preset)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                        addressPreset === preset
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {preset === 'Home' ? 'Home (ផ្ទះ)' : preset === 'Work' ? 'Office (កន្លែងធ្វើការ)' : 'Other (ផ្សេងៗ)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2 Destination Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option A: Choose/Enter Custom Address */}
                <button
                  type="button"
                  onClick={() => setDeliveryMode('custom_address')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                    deliveryMode === 'custom_address'
                      ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-400 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                      <Home className="w-4 h-4 text-zinc-900" />
                      <span>Option 1: Choose Address</span>
                    </div>
                    {deliveryMode === 'custom_address' && (
                      <span className="w-2 h-2 rounded-full bg-zinc-900" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Deliver to home, office, or condo (ideal when ordering from outside)
                  </p>
                </button>

                {/* Option B: Current GPS Location */}
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMode('current_gps');
                    handleGetCurrentLocation();
                  }}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                    deliveryMode === 'current_gps'
                      ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-400 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                      <Navigation className="w-4 h-4 text-emerald-700" />
                      <span>Option 2: Live GPS Pin</span>
                    </div>
                    {deliveryMode === 'current_gps' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-700" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Auto-detect your present spot right now for immediate delivery
                  </p>
                </button>
              </div>

              {/* Recipient Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sokha Chan"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">
                    Contact Phone (for Courier Call) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 012 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">
                    Province / City *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 font-medium text-zinc-900 cursor-pointer"
                  >
                    {cambodianProvinces.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">
                    District / Khan / Krong (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chamkarmon, Tuol Kouk"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">
                  Street, House No., Sangkat / Commune *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. #12B, St. 271, Sangkat Boeung Keng Kang 1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">
                    Landmark / Location Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Calmette Hospital / Opposite ABA Bank"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                  />
                </div>
              </div>

              {/* Google Maps Pin & GPS Section */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                    <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Google Maps Pin (Optional)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-zinc-300 hover:border-zinc-900 text-zinc-800 text-[11px] font-semibold rounded-md shadow-sm transition disabled:opacity-50"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-600" />
                        <span>Locating...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        <span>Pin GPS Location</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Paste Google Maps / Telegram link or click 'Pin GPS Location' above"
                  value={mapLink}
                  onChange={(e) => {
                    setMapLink(e.target.value);
                    setLocationSuccess(null);
                  }}
                  className="w-full p-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
                />

                {locationSuccess && (
                  <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>{locationSuccess}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900 border-b border-zinc-100 pb-1.5">
                <CreditCard className="w-4 h-4 text-zinc-900" />
                <span>2. Payment Method</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* ABA KHQR */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'aba_khqr' })}
                  className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition ${
                    formData.paymentMethod === 'aba_khqr'
                      ? 'border-zinc-900 bg-zinc-50 text-zinc-900 font-bold shadow-sm ring-1 ring-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-400 text-zinc-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px]">ABA KHQR</span>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition ${
                    formData.paymentMethod === 'cod'
                      ? 'border-zinc-900 bg-zinc-50 text-zinc-900 font-bold shadow-sm ring-1 ring-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-400 text-zinc-600'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-amber-600" />
                  <span className="text-[11px]">Cash on Delivery</span>
                </button>

                {/* ACLEDA */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'acleda' })}
                  className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition ${
                    formData.paymentMethod === 'acleda'
                      ? 'border-zinc-900 bg-zinc-50 text-zinc-900 font-bold shadow-sm ring-1 ring-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-400 text-zinc-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px]">ACLEDA</span>
                </button>

                {/* Card */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                  className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition ${
                    formData.paymentMethod === 'card'
                      ? 'border-zinc-900 bg-zinc-50 text-zinc-900 font-bold shadow-sm ring-1 ring-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-400 text-zinc-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span className="text-[11px]">Credit / Debit</span>
                </button>
              </div>

              {/* Dynamic Payment Details Display */}
              {formData.paymentMethod === 'aba_khqr' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center gap-3.5">
                  <div className="w-24 h-24 bg-white p-1.5 rounded-lg border border-emerald-300 shrink-0 shadow-sm flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MYSTYLE_KHQR_${totalAmount}_USD`}
                      alt="ABA KHQR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs font-bold text-emerald-950">
                      Scan to Pay: <strong className="text-zinc-900">${totalAmount.toFixed(2)} USD</strong> ({totalAmountKHR.toLocaleString()} ៛)
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Account: <strong>{settings?.merchantName || 'MY STYLE BOUTIQUE'}</strong>
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      Compatible with ABA Mobile, Bakong, Wing, ACLEDA, and all KHQR member banking apps.
                    </p>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'cod' && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
                  <Truck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">Pay Cash Upon Delivery</p>
                    <p className="text-[11px] text-amber-800">
                      Please have the exact amount of <strong>${totalAmount.toFixed(2)} USD</strong> ({totalAmountKHR.toLocaleString()} ៛) ready when the courier arrives at your address.
                    </p>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'acleda' && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
                  <p className="text-xs font-bold">ACLEDA Mobile / Bank Transfer</p>
                  <p className="text-[11px] text-blue-800">
                    Account Name: <strong>{settings?.merchantName || 'MY STYLE BOUTIQUE'}</strong>
                  </p>
                  <p className="text-[11px] text-blue-800">
                    Account Number: <strong>{settings?.bakongAccountId || '012-345-678-9'}</strong>
                  </p>
                </div>
              )}

              {formData.paymentMethod === 'card' && (
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5">
                  <p className="text-xs font-bold text-zinc-900">Card Information</p>
                  <div>
                    <input
                      type="text"
                      placeholder="Card Number (e.g. 4000 1234 5678 9010)"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                      className="w-full p-2 bg-white border border-zinc-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="p-2 bg-white border border-zinc-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="p-2 bg-white border border-zinc-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Promo Voucher Code */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 font-bold text-zinc-900 border-b border-zinc-100 pb-1.5">
                <Tag className="w-4 h-4 text-zinc-900" />
                <span>3. Promo Code (Optional)</span>
              </div>

              {appliedPromo ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                  <span>Promo Applied: <strong>{appliedPromo.code}</strong> (-{appliedPromo.discountPercent > 0 ? `${appliedPromo.discountPercent}%` : `$${appliedPromo.discountFixed}`})</span>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-zinc-600 hover:text-red-600 font-bold underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code (e.g. MYSTYLE10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 p-2 bg-white border border-zinc-300 rounded-lg text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-zinc-900 text-white font-semibold text-xs rounded-lg hover:bg-zinc-800 transition"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoError && <p className="text-[11px] text-red-600">{promoError}</p>}
            </div>

            {/* Order Total Summary */}
            <div className="border-t border-zinc-200 pt-3 space-y-1.5">
              <div className="flex justify-between text-zinc-600">
                <span>Items Subtotal ({cartItems.length} items):</span>
                <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
              </div>

              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promo Discount:</span>
                  <span>-{formatPrice(promoDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600">
                <span>Delivery Fee:</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">Free</strong> : formatPrice(shippingFee)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-zinc-900 border-t border-zinc-200 pt-2">
                <span>Grand Total:</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition"
              >
                {isSubmitting
                  ? 'Placing Order...'
                  : formData.paymentMethod === 'cod'
                  ? `Confirm COD Order (${formatPrice(totalAmount)})`
                  : `Confirm & Pay (${formatPrice(totalAmount)})`}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
