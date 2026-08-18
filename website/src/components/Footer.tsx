'use client';

import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { StoreSettings } from '@/lib/api';

interface FooterProps {
  settings?: StoreSettings | null;
}

export default function Footer({ settings }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const storeName = settings?.storeName || 'My Style Boutique';
  const address = settings?.address || 'Street 271, Sangkat TTP, Phnom Penh, Cambodia';
  const phone = settings?.phone || '+855 12 345 678';
  const returnDays = settings?.returnPolicyDays ?? 30;

  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-zinc-800 text-xs">
          
          {/* Col 1: Store Bio & Newsletter */}
          <div className="md:col-span-4 space-y-3">
            <img
              src="/logo.png"
              alt={storeName}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            <p className="text-zinc-400 max-w-sm leading-relaxed">
              Curated clothing and everyday apparel store based in Phnom Penh. Quality materials, modern fits, and fast delivery nationwide.
            </p>

            <div className="pt-2">
              <span className="block font-semibold text-zinc-300 mb-1.5">
                Subscribe for new arrivals & offers
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 bg-zinc-900 border border-emerald-800 p-2.5 rounded-lg">
                  <Check className="w-4 h-4" />
                  <span>Subscribed! Use code MYSTYLE10 at checkout.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    placeholder="Your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    type="submit"
                    className="py-2 px-3.5 bg-white text-zinc-950 font-semibold text-xs rounded-lg hover:bg-zinc-200 transition"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider">Categories</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><span className="hover:text-white cursor-pointer">Men&apos;s Collection</span></li>
              <li><span className="hover:text-white cursor-pointer">Women&apos;s Collection</span></li>
              <li><span className="hover:text-white cursor-pointer">Kids & Children</span></li>
              <li><span className="hover:text-white cursor-pointer">Jackets & Outerwear</span></li>
              <li><span className="hover:text-white cursor-pointer">Shirts & Tops</span></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider">Customer Service</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><span>Nationwide Express Delivery</span></li>
              <li><span>{returnDays}-Day Return Policy</span></li>
              <li><span>Hotline: {phone}</span></li>
              <li><span>Hours: {settings?.businessHours || '08:00 AM - 09:00 PM'}</span></li>
            </ul>
          </div>

          {/* Col 4: Store Location & Payments */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider">Store Location</h4>
            <p className="text-zinc-400 leading-relaxed">
              {address}
            </p>

            <div className="pt-2">
              <span className="block font-semibold text-zinc-400 mb-1.5">Payment Methods</span>
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium flex-wrap">
                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[11px]">
                  {settings?.merchantName || 'ABA KHQR'}
                </span>
                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[11px]">ACLEDA</span>
                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[11px]">VISA / Card</span>
                {settings?.cashOnDeliveryEnabled && (
                  <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[11px]">COD</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
          <p>© 2026 {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {settings?.telegramChannel && (
              <a href={settings.telegramChannel} target="_blank" rel="noreferrer" className="hover:text-white transition">
                Telegram
              </a>
            )}
            {settings?.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-white transition">
                Facebook
              </a>
            )}
            {settings?.tiktokUrl && (
              <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="hover:text-white transition">
                TikTok
              </a>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
