'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FeaturedCategoriesProps {
  onSelectCategory: (cat: string) => void;
}

export default function FeaturedCategories({ onSelectCategory }: FeaturedCategoriesProps) {
  const collections = [
    {
      title: 'Outerwear & Jackets',
      category: 'Men',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
      subtitle: 'Vintage leather, fleece hoodies & bombers',
      badge: 'POPULAR DROPS',
    },
    {
      title: 'Silk Tops & Shirts',
      category: 'Women',
      image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
      subtitle: '100% Mulberry silk & tailored formal cuts',
      badge: 'NEW ARRIVALS',
    },
    {
      title: 'Selvedge Denim & Pants',
      category: 'Products',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
      subtitle: 'Comfortable stretch denim & slim fit jeans',
      badge: 'EVERYDAY WEAR',
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-black uppercase tracking-widest mb-2 border border-zinc-200">
              COLLECTIONS SHOWCASE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight brand-title uppercase">
              Explore What We Have
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('Products')}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:text-emerald-600 group"
          >
            <span>Browse All Collections</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 3 Large Featured Cards with Solid Overlays */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((c, i) => (
            <div
              key={i}
              onClick={() => onSelectCategory(c.category)}
              className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 bg-zinc-950 flex flex-col justify-end p-8 border border-zinc-200"
            >
              {/* Background Image */}
              <img
                src={c.image}
                alt={c.title}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
              />

              {/* Solid Contrast Bottom Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-zinc-950/80" />

              {/* Card Content */}
              <div className="relative z-10 space-y-2">
                <span className="inline-block px-3 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-[10px] font-extrabold uppercase tracking-widest text-orange-400">
                  {c.badge}
                </span>

                <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                  {c.title}
                </h3>

                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  {c.subtitle}
                </p>

                <div className="pt-3 flex items-center gap-2 text-xs font-extrabold text-white uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>Shop Collection</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
