'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, ArrowRight, Globe } from 'lucide-react';
import { ProductItem, StoreCurrency } from '@/types/store';
import { StoreSettings } from '@/lib/api';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracker: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allProducts?: ProductItem[];
  onSelectProduct?: (product: ProductItem) => void;
  settings?: StoreSettings | null;
  currency?: StoreCurrency;
  onToggleCurrency?: () => void;
}

export default function Header({
  cartCount,
  onOpenCart,
  onOpenTracker,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  allProducts = [],
  onSelectProduct,
  settings,
  currency = 'USD',
  onToggleCurrency,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navLinks = [
    { label: 'All Products', value: 'Products' },
    { label: 'Men', value: 'Men' },
    { label: 'Women', value: 'Women' },
    { label: 'Kids', value: 'Children' },
    { label: 'Brands', value: 'Brands' },
    { label: 'About Us', value: 'About' },
    { label: 'Contact', value: 'Contact' },
  ];

  // Real-time matched products for search autocomplete popover
  const liveMatches = searchQuery.trim()
    ? allProducts
        .filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 4)
    : [];

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      {/* Top Announcement Bar */}
      <div className="bg-zinc-950 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1 text-center sm:text-left text-[11px] sm:text-xs text-zinc-300">
            <span>Free shipping on orders over ${settings?.freeShippingThreshold ?? 150}</span>
            <span className="hidden md:inline mx-2 text-zinc-600">•</span>
            <span className="hidden md:inline text-zinc-400">
              Use code <strong className="text-white font-bold">MYSTYLE10</strong> for 10% off
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <button
              onClick={onOpenTracker}
              className="text-zinc-300 hover:text-white text-xs font-medium underline underline-offset-4 hidden sm:inline"
            >
              Track Order
            </button>

            {onToggleCurrency && (
              <button
                onClick={onToggleCurrency}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-2.5 py-1 rounded transition"
                title="Switch Currency"
              >
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>{currency === 'USD' ? 'USD ($)' : 'KHR (៛)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Left: Mobile Menu & Desktop Brand Logo */}
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                onSelectCategory('Products');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 hover:opacity-90 transition"
            >
              <img
                src="/logo.png"
                alt="My Style"
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => {
                const isActive = activeCategory.toLowerCase() === link.value.toLowerCase();
                return (
                  <button
                    key={link.value}
                    onClick={() => onSelectCategory(link.value)}
                    className={`text-sm font-semibold transition py-1 relative ${
                      isActive
                        ? 'text-zinc-950 font-bold border-b-2 border-zinc-950'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search & Cart Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Toggle */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search catalog"
                className={`p-2 rounded-lg transition ${
                  searchOpen ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              aria-label="Open cart"
              className="flex items-center gap-2 bg-zinc-950 text-white hover:bg-zinc-800 px-3.5 py-2 rounded-lg transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Bag</span>
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <div className="py-3 border-t border-zinc-100 animate-in slide-in-from-top-2 duration-200">
            <div className="relative max-w-xl mx-auto">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products by name, brand, or category..."
                className="w-full bg-zinc-50 border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Autocomplete Results Popover */}
              {liveMatches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="p-2 divide-y divide-zinc-100">
                    {liveMatches.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (onSelectProduct) onSelectProduct(item);
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 rounded text-left transition"
                      >
                        <img
                          src={item.colors[0]?.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                          alt={item.title}
                          className="w-10 h-12 object-cover rounded bg-zinc-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-zinc-500">{item.brand} • ${item.price.toFixed(2)}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[90px] bg-white z-50 overflow-y-auto p-6 flex flex-col justify-between border-t border-zinc-200">
          <nav className="space-y-4">
            {navLinks.map((link) => {
              const isActive = activeCategory.toLowerCase() === link.value.toLowerCase();
              return (
                <button
                  key={link.value}
                  onClick={() => {
                    onSelectCategory(link.value);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-2.5 text-base font-semibold transition border-b border-zinc-100 ${
                    isActive ? 'text-zinc-950 font-bold' : 'text-zinc-600'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-zinc-200 space-y-3">
            <button
              onClick={() => {
                onOpenTracker();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2.5 text-sm font-semibold text-zinc-800 bg-zinc-100 rounded-lg"
            >
              Track Order Status
            </button>
            <p className="text-xs text-center text-zinc-400">
              Customer Hotline: {settings?.phone || '+855 12 345 678'}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
