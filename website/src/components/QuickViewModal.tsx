'use client';

import React, { useState } from 'react';
import { X, Check, Minus, Plus, ExternalLink } from 'lucide-react';
import { ProductItem, ProductColor, StoreCurrency } from '@/types/store';

interface QuickViewModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: ProductItem, color: ProductColor, size: string, quantity: number, variantId?: string) => void;
  onBuyNow: (product: ProductItem, color: ProductColor, size: string, quantity: number, variantId?: string) => void;
  onOpenFullDetail: (product: ProductItem) => void;
  onOpenSizeGuide: () => void;
  currency?: StoreCurrency;
  exchangeRate?: number;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenFullDetail,
  onOpenSizeGuide,
  currency = 'USD',
  exchangeRate = 4100,
}: QuickViewModalProps) {
  if (!isOpen || !product) return null;

  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors[0] || {
      id: 'default',
      name: 'Standard',
      hex: '#000000',
      image: '',
      thumbnails: [],
    }
  );
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeThumb, setActiveThumb] = useState<string>(selectedColor.image);

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

  const handleColorChange = (color: ProductColor) => {
    setSelectedColor(color);
    setActiveThumb(color.image);
    setQuantity(1);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const maxAllowedQty = Math.max(1, availableStock);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-white text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition shadow-sm border border-zinc-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Product Photo */}
        <div className="w-full md:w-1/2 bg-zinc-100 p-6 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[3/4] max-h-[380px] rounded-xl overflow-hidden bg-white border border-zinc-200">
            <img
              src={activeThumb || selectedColor.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Color Thumbnails */}
          {selectedColor.thumbnails && selectedColor.thumbnails.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full">
              {selectedColor.thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveThumb(thumb)}
                  className={`w-10 h-12 rounded-md overflow-hidden border transition shrink-0 ${
                    activeThumb === thumb ? 'border-zinc-950' : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={thumb} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            
            {/* Title & Brand */}
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {product.brand}
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 mt-0.5">
                {product.title}
              </h2>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="text-xl font-bold text-zinc-950">
                  {formatPrice(currentPrice)}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  isOutOfStock
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {isOutOfStock ? 'Out of Stock' : `${availableStock} in stock`}
                </span>
              </div>
            </div>

            {/* Color Swatches */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-zinc-600">Color:</span>
                <span className="text-zinc-900 font-bold">{selectedColor.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((color) => {
                  const isSelected = selectedColor.id === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => handleColorChange(color)}
                      className={`relative w-7 h-7 rounded-full border-2 transition flex items-center justify-center ${
                        isSelected ? 'border-zinc-950' : 'border-transparent hover:border-zinc-300'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-zinc-200 block"
                        style={{ backgroundColor: color.hex }}
                      />
                      {isSelected && (
                        <Check className="w-3 h-3 absolute text-white drop-shadow" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-zinc-600">Size:</span>
                {onOpenSizeGuide && (
                  <button
                    onClick={onOpenSizeGuide}
                    className="text-zinc-400 hover:text-zinc-900 underline font-normal"
                  >
                    Size Guide
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-950'
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
              <span className="block text-xs font-semibold text-zinc-600 mb-2">Quantity:</span>
              <div className="flex items-center border border-zinc-300 rounded-lg w-max bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  className="p-1.5 text-zinc-600 hover:text-zinc-950 disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold text-zinc-950">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(q + 1, maxAllowedQty))}
                  disabled={isOutOfStock || quantity >= maxAllowedQty}
                  className="p-1.5 text-zinc-600 hover:text-zinc-950 disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-6 space-y-2">
            <button
              onClick={() => {
                onAddToCart(product, selectedColor, selectedSize, quantity, matchedVariant?._id);
                onClose();
              }}
              disabled={isOutOfStock}
              className="w-full py-2.5 bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 font-bold text-xs uppercase tracking-wider rounded-lg transition"
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </button>

            <button
              onClick={() => onOpenFullDetail(product)}
              className="w-full py-2 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <span>View Full Details</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
