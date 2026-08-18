'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface HeroSectionProps {
  onShopClick: () => void;
  onServicesClick: () => void;
}

export default function HeroSection({ onShopClick, onServicesClick }: HeroSectionProps) {
  const tickerItems = [
    'LIMITED DROPS',
    'ICONIC STYLING',
    'THIS SEASON',
    'PREMIUM TEXTILES',
    'EXPRESS DELIVERY NATIONWIDE',
    '100% AUTHENTIC GARMENTS',
  ];

  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden border-b border-zinc-800">
      {/* High-Contrast Editorial Photography Overlay */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80"
          alt="Luxury Streetwear Editorial"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-zinc-950/80" />
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col items-center text-center">
        
        {/* Brand Logo Showcase */}
        <div className="mb-6 flex flex-col items-center">
          <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md">
            <img
              src="/logo.png"
              alt="My Style Official Logo"
              className="h-12 sm:h-16 w-auto object-contain brightness-0 invert"
            />
          </div>
        </div>

        {/* Top Minimal Badge with Orange accent */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-black uppercase tracking-widest text-orange-400 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Autumn / Winter 2026 Collection</span>
        </div>

        {/* Main Headline with Solid Colors (NO GRADIENTS) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.95] text-white brand-title max-w-5xl">
          LOOKS YOU <br className="hidden sm:inline" />
          <span className="text-emerald-500">
            REMEMBER
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl font-medium leading-relaxed">
          Official luxury streetwear & modern apparel order portal. Crafted with premium textiles, precision tailored cuts, and express delivery nationwide.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onShopClick}
            className="w-full sm:w-auto py-4 px-8 rounded-full bg-white text-zinc-950 font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2 group"
          >
            <span>Shop Collection</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          <button
            onClick={onServicesClick}
            className="w-full sm:w-auto py-4 px-8 rounded-full bg-zinc-900 text-white border border-zinc-700 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition flex items-center justify-center gap-2"
          >
            <span className="text-emerald-400 font-black">●</span>
            <span>Our Services & Guarantees</span>
          </button>
        </div>
      </div>

      {/* Marquee Ticker Strip */}
      <div className="relative z-10 bg-zinc-900 border-t border-zinc-800 py-3 overflow-hidden">
        <div className="flex gap-8 items-center whitespace-nowrap animate-marquee">
          {tickerItems.concat(tickerItems).map((item, index) => (
            <div key={index} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-zinc-400">
              <span>{item}</span>
              <span className="text-emerald-500 font-black">★</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
