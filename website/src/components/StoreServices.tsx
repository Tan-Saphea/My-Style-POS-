'use client';

import React from 'react';
import { Truck, ShieldCheck, RefreshCw, CreditCard } from 'lucide-react';

export default function StoreServices() {
  const services = [
    {
      icon: Truck,
      title: 'Express Nationwide Delivery',
      subtitle: 'Phnom Penh Same-Day & 24h Express',
      description: 'Fast, secure doorstep delivery across all 25 provinces. Free shipping on orders over $150.',
      badge: 'FREE OVER $150',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      icon: ShieldCheck,
      title: '100% Authentic Guarantee',
      subtitle: 'Hand-Checked Garments & Fabrics',
      description: 'Every piece is crafted from certified Mulberry silk, Polartec fleece, or full-grain leather.',
      badge: 'VERIFIED ORIGINAL',
      badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    },
    {
      icon: RefreshCw,
      title: '30-Day Hassle-Free Returns',
      subtitle: 'Easy Size & Color Exchange',
      description: 'Wrong fit or size? Exchange or return within 30 days of delivery with fast customer refunds.',
      badge: 'MONEY BACK',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      icon: CreditCard,
      title: 'Flexible Local Payments',
      subtitle: 'ABA KHQR, ACLEDA, Cards & COD',
      description: 'Pay instantly via KHQR banking apps, major international credit cards, or cash on delivery.',
      badge: 'INSTANT KHQR',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  const highlights = [
    { label: 'Happy Customers', value: '5,000+' },
    { label: 'Average Rating', value: '4.9 / 5.0' },
    { label: 'Premium Fabrics', value: '100% Certified' },
    { label: 'Customer Hotline', value: '24/7 Active' },
  ];

  return (
    <section id="services-section" className="bg-zinc-50 py-16 md:py-24 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3.5 py-1 rounded-full bg-zinc-950 text-white text-xs font-black uppercase tracking-widest mb-3">
            WHAT WE OFFER & OUR SERVICES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-950 tracking-tight brand-title uppercase">
            Designed for Convenience & Quality
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
            We provide a premium e-commerce shopping experience with instant local KHQR checkout, certified authentic textiles, and express nationwide delivery.
          </p>
        </div>

        {/* 4-Card Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, idx) => {
            const IconComponent = srv.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white flex items-center justify-center group-hover:bg-emerald-600 transition-colors shadow-md">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border ${srv.badgeColor}`}>
                      {srv.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg font-extrabold text-zinc-950 tracking-tight mb-1 group-hover:text-emerald-600 transition-colors">
                    {srv.title}
                  </h3>
                  <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    {srv.subtitle}
                  </span>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-zinc-950 uppercase tracking-wider">
                  <span>Guaranteed Service</span>
                  <span className="text-emerald-600 font-extrabold">Official</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlights Bar */}
        <div className="mt-12 bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center border border-zinc-800 shadow-xl">
          {highlights.map((h, i) => (
            <div key={i} className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">{h.value}</span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-orange-400">{h.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
