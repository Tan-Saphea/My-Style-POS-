'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, Truck, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductItem, ProductColor, StoreCurrency } from '@/types/store';

interface ProductOrderingViewProps {
  product: ProductItem;
  onAddToCart: (product: ProductItem, color: ProductColor, size: string, quantity: number, variantId?: string) => void;
  onBuyNow: (product: ProductItem, color: ProductColor, size: string, quantity: number, variantId?: string) => void;
  onBackToCatalog?: () => void;
  onOpenSizeGuide?: () => void;
  currency?: StoreCurrency;
  exchangeRate?: number;
}

export default function ProductOrderingView({
  product,
  onAddToCart,
  onBuyNow,
  onBackToCatalog,
  onOpenSizeGuide,
  currency = 'USD',
  exchangeRate = 4100,
}: ProductOrderingViewProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors[0] || {
      id: 'default',
      name: 'Standard',
      hex: '#09090b',
      image: '',
      thumbnails: [],
    }
  );
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [openSection, setOpenSection] = useState<'desc' | 'materials' | 'shipping' | null>('desc');

  // Match live variant stock
  const matchedVariant = product.variants?.find((v) => {
    const matchColor =
      v.color?.name?.toLowerCase() === selectedColor.name?.toLowerCase() ||
      v.color?._id === selectedColor.id;
    const matchSize = v.size?.name?.toLowerCase() === selectedSize?.toLowerCase();
    return matchColor && matchSize;
  });

  const availableStock = matchedVariant !== undefined ? matchedVariant.quantity : (product.totalStock ?? 10);
  const isOutOfStock = availableStock <= 0;
  const currentPrice = matchedVariant?.salePrice || product.price;

  const formatPrice = (usd: number) => {
    if (currency === 'KHR') {
      return `${Math.round(usd * exchangeRate).toLocaleString()} ៛`;
    }
    return `$${usd.toFixed(2)}`;
  };

  const currentImages = selectedColor.thumbnails && selectedColor.thumbnails.length > 0
    ? selectedColor.thumbnails
    : [selectedColor.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'];

  const currentMainImage = currentImages[activeImageIndex] || currentImages[0];

  const handleColorChange = (color: ProductColor) => {
    setSelectedColor(color);
    setActiveImageIndex(0);
    setQuantity(1);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const maxAllowedQty = Math.max(1, availableStock);
  const handleQuantityIncrement = () => setQuantity((q) => Math.min(q + 1, maxAllowedQty));
  const handleQuantityDecrement = () => setQuantity((q) => Math.max(q - 1, 1));

  return (
    <div className="bg-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between text-xs">
            {onBackToCatalog && (
              <button
                onClick={onBackToCatalog}
                className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 font-bold transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Catalog</span>
              </button>
            )}
            <div className="text-zinc-400 font-normal">
              Store / {product.category} / <span className="text-zinc-900 font-bold">{product.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          
          {/* Left 7 Cols: High-Fashion Lookbook Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            
            {/* Vertical Thumbnail Strip */}
            {currentImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[620px] scrollbar-none pb-2 md:pb-0">
                {currentImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-16 h-22 sm:w-20 sm:h-28 rounded-xl overflow-hidden bg-[#f4f4f5] border-2 transition shrink-0 ${
                      activeImageIndex === index
                        ? 'border-zinc-950 shadow-sm'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* High-Definition 3:4 Vertical Lookbook Portrait */}
            <div className="flex-1 relative aspect-[3/4] bg-[#f4f4f5] rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
              <img
                src={currentMainImage}
                alt={product.title}
                className="w-full h-full object-cover object-top transition-all duration-300"
              />

              {isOutOfStock && (
                <div className="absolute top-4 left-4 bg-zinc-950/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                  Currently Out of Stock
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Sticky Commerce Purchase Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="space-y-6 bg-white p-2">
              
              {/* Title & Price Header */}
              <div className="border-b border-zinc-200 pb-5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <span>{product.brand}</span>
                  <span className="text-zinc-500 font-normal">{product.category}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 mt-1 tracking-tight">
                  {product.title}
                </h1>
                
                <div className="mt-3.5 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-zinc-950">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    isOutOfStock
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {isOutOfStock ? 'Out of Stock' : `${availableStock} in stock`}
                  </span>
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2.5">
                  <span className="text-zinc-700">Selected Color:</span>
                  <span className="text-zinc-950">{selectedColor.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor.id === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => handleColorChange(color)}
                        className={`relative w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected ? 'border-zinc-950 scale-110 shadow-sm' : 'border-transparent hover:border-zinc-300'
                        }`}
                        title={color.name}
                      >
                        <span
                          className="w-7 h-7 rounded-full border border-zinc-300 block"
                          style={{ backgroundColor: color.hex }}
                        />
                        {isSelected && (
                          <Check className="w-4 h-4 absolute text-white drop-shadow" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2.5">
                  <span className="text-zinc-700">Select Size:</span>
                  {onOpenSizeGuide && (
                    <button
                      onClick={onOpenSizeGuide}
                      className="text-zinc-500 hover:text-zinc-950 underline font-medium"
                    >
                      Size Guide
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    const sizeVariant = product.variants?.find((v) => {
                      const matchColor =
                        v.color?.name?.toLowerCase() === selectedColor.name?.toLowerCase() ||
                        v.color?._id === selectedColor.id;
                      return matchColor && v.size?.name?.toLowerCase() === size.toLowerCase();
                    });
                    const sizeOutOfStock = sizeVariant ? sizeVariant.quantity <= 0 : false;

                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                            : sizeOutOfStock
                            ? 'bg-zinc-50 text-zinc-300 border-zinc-200 line-through cursor-not-allowed'
                            : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-950'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div>
                <span className="block text-xs font-bold text-zinc-700 mb-2">Quantity:</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-300 rounded-xl bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={handleQuantityDecrement}
                      disabled={isOutOfStock || quantity <= 1}
                      className="p-2.5 text-zinc-600 hover:text-zinc-950 disabled:opacity-30 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-bold text-zinc-950">{quantity}</span>
                    <button
                      onClick={handleQuantityIncrement}
                      disabled={isOutOfStock || quantity >= maxAllowedQty}
                      className="p-2.5 text-zinc-600 hover:text-zinc-950 disabled:opacity-30 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Max: {availableStock} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={() => onAddToCart(product, selectedColor, selectedSize, quantity, matchedVariant?._id)}
                  disabled={isOutOfStock}
                  className="w-full py-3.5 px-6 bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
                </button>

                <button
                  onClick={() => onBuyNow(product, selectedColor, selectedSize, quantity, matchedVariant?._id)}
                  disabled={isOutOfStock}
                  className="w-full py-3.5 px-6 bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-zinc-200 disabled:text-zinc-400 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
                >
                  {isOutOfStock ? 'Sold Out' : 'Buy It Now'}
                </button>
              </div>

              {/* Trust Features Strip */}
              <div className="pt-4 border-t border-zinc-200 grid grid-cols-3 gap-2 text-center text-[11px] text-zinc-600">
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <Truck className="w-4 h-4 mx-auto mb-1 text-zinc-800" />
                  <span className="font-semibold">Fast Delivery</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-zinc-800" />
                  <span className="font-semibold">100% Authentic</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <RotateCcw className="w-4 h-4 mx-auto mb-1 text-zinc-800" />
                  <span className="font-semibold">Easy Returns</span>
                </div>
              </div>

              {/* Information Accordions */}
              <div className="border-t border-zinc-200 divide-y divide-zinc-200 pt-2 text-xs">
                {/* Description */}
                <div>
                  <button
                    onClick={() => setOpenSection(openSection === 'desc' ? null : 'desc')}
                    className="w-full py-3.5 flex items-center justify-between font-bold text-zinc-900 text-left"
                  >
                    <span>Product Description</span>
                    {openSection === 'desc' ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </button>
                  {openSection === 'desc' && (
                    <div className="pb-3.5 text-zinc-600 leading-relaxed font-normal">
                      {product.description || 'Quality tailored garment designed for style, durability, and daily comfort.'}
                    </div>
                  )}
                </div>

                {/* Materials & Care */}
                <div>
                  <button
                    onClick={() => setOpenSection(openSection === 'materials' ? null : 'materials')}
                    className="w-full py-3.5 flex items-center justify-between font-bold text-zinc-900 text-left"
                  >
                    <span>Fabric & Care Details</span>
                    {openSection === 'materials' ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </button>
                  {openSection === 'materials' && (
                    <ul className="pb-3.5 space-y-1 text-zinc-600 list-disc list-inside">
                      {product.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Delivery & Returns */}
                <div>
                  <button
                    onClick={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
                    className="w-full py-3.5 flex items-center justify-between font-bold text-zinc-900 text-left"
                  >
                    <span>Shipping & Returns</span>
                    {openSection === 'shipping' ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </button>
                  {openSection === 'shipping' && (
                    <div className="pb-3.5 text-zinc-600 leading-relaxed space-y-1.5 font-normal">
                      <p>Express nationwide delivery across Cambodia (1-2 business days via J&T and Virak Buntham).</p>
                      <p>Returns and exchanges accepted within 30 days of purchase.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
