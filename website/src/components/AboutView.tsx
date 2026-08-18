'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface AboutViewProps {
  onShopClick: () => void;
}

export default function AboutView({ onShopClick }: AboutViewProps) {
  const highlights = [
    {
      title: 'Quality Fabrics',
      description: 'Carefully selected cottons, denim, and silks designed for durability and everyday comfort.',
      icon: ShieldCheck,
    },
    {
      title: 'Fast Local Delivery',
      description: 'Quick nationwide shipping across all 25 provinces in Cambodia with tracking support.',
      icon: Truck,
    },
    {
      title: 'Hassle-Free Returns',
      description: '30-day exchange and return policy to make sure you get the perfect fit every time.',
      icon: RefreshCw,
    },
  ];

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Story */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
            About My Style Boutique
          </h1>
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            Welcome to <strong>My Style</strong>. We are a fashion boutique based in Phnom Penh, Cambodia, offering curated collections of modern apparel, casual wear, outerwear, and accessories for men, women, and kids.
          </p>
        </div>

        {/* Store Photo */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 mb-12">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
            alt="My Style Storefront"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-zinc-200">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <div key={i} className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-1.5">{h.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{h.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="pt-12 text-center">
          <h2 className="text-lg font-bold text-zinc-900 mb-2">
            Ready to explore our new arrivals?
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            Discover our full catalog of shirts, jackets, jeans, and accessories.
          </p>
          <button
            onClick={onShopClick}
            className="inline-flex items-center gap-2 py-3 px-6 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition"
          >
            <span>Shop All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
