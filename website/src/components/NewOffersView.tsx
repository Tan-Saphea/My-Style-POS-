'use client';

import React, { useState } from 'react';
import { Tag, Copy, Check, Eye, ShoppingBag, ArrowRight } from 'lucide-react';
import { ProductItem, ProductColor } from '@/types/store';

interface NewOffersViewProps {
  allProducts: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
  onQuickView: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem, color: ProductColor, size: string, quantity: number) => void;
}

interface OfferProduct extends ProductItem {
  discountPercent: number;
  originalPrice: number;
  promoTag: string;
}

export default function NewOffersView({
  allProducts,
  onSelectProduct,
  onQuickView,
}: NewOffersViewProps) {
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  // Generate clean promotional offers from current live products
  const offerProducts: OfferProduct[] = allProducts.map((p, idx) => {
    const discounts = [15, 20, 10, 25, 30];
    const discountPercent = discounts[idx % discounts.length];
    const originalPrice = p.price;
    const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100) * 100) / 100;
    const tags = ['15% OFF', '20% OFF', '10% OFF', '25% OFF', '30% OFF'];

    return {
      ...p,
      discountPercent,
      originalPrice,
      price: discountedPrice,
      promoTag: tags[idx % tags.length],
    };
  });

  const filteredOffers = offerProducts.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'big_discount') return item.discountPercent >= 20;
    if (filterType === 'under50') return item.price < 50;
    if (filterType === 'under100') return item.price < 100;
    return true;
  });

  const coupons = [
    {
      code: 'MYSTYLE10',
      discount: '10% OFF',
      desc: 'Applied automatically on orders over $150',
    },
    {
      code: 'WELCOME20',
      discount: '20% OFF',
      desc: 'Exclusive voucher for new online orders',
    },
  ];

  return (
    <div className="bg-white py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Simple & Clean Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            Special Promotions
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight uppercase">
            New Offers & Deals
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-medium">
            Explore seasonal discounts, promotional vouchers, and limited offers across our luxury collection.
          </p>
        </div>

        {/* Promo Coupons Bar (Simple White Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-zinc-300 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-emerald-600">{c.discount}</span>
                  <span className="text-xs font-bold text-zinc-900 font-mono bg-zinc-100 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">{c.desc}</p>
              </div>
              <button
                onClick={() => handleCopy(c.code)}
                className="py-2 px-3.5 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-emerald-600 transition flex items-center gap-1.5 shrink-0"
              >
                {copiedCoupon === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {[
            { label: 'All Offers', value: 'all' },
            { label: '20%+ Discounts', value: 'big_discount' },
            { label: 'Under $50', value: 'under50' },
            { label: 'Under $100', value: 'under100' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterType(tab.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                filterType === tab.value
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid (Clean White Style) */}
        {filteredOffers.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-100">
            <p className="text-xs text-zinc-500 font-medium">No offer items matching this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredOffers.map((product) => {
              const mainColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
              const displayImage = mainColor?.image || product.colors?.[0]?.image || '/logo.png';

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-zinc-100 overflow-hidden flex flex-col hover:border-zinc-300 hover:shadow-sm transition"
                >
                  {/* Product Image Area */}
                  <div className="relative aspect-[4/5] bg-zinc-50 overflow-hidden">
                    {/* Discount Badge */}
                    <span className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      -{product.discountPercent}% OFF
                    </span>

                    {/* Quick View Button on Hover */}
                    <button
                      onClick={() => onQuickView(product)}
                      className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur text-zinc-900 p-2 rounded-xl shadow opacity-0 group-hover:opacity-100 transition hover:bg-white"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                      onClick={() => onSelectProduct(product)}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      {product.brand} • {product.category}
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="text-xs sm:text-sm font-bold text-zinc-900 mt-1 line-clamp-1 cursor-pointer hover:text-emerald-600 transition"
                    >
                      {product.title}
                    </h3>

                    {/* Price Section */}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-zinc-950">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Colors Indicator */}
                    {product.colors && product.colors.length > 1 && (
                      <div className="mt-3 flex items-center gap-1.5">
                        {product.colors.slice(0, 4).map((col) => (
                          <span
                            key={col.id}
                            className="w-3 h-3 rounded-full border border-zinc-200"
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          />
                        ))}
                        {product.colors.length > 4 && (
                          <span className="text-[10px] text-zinc-400 font-medium">
                            +{product.colors.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View Details Action Button */}
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="mt-4 w-full py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-bold hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition flex items-center justify-center gap-1"
                    >
                      <span>View Item</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
