'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingBag, Eye, SlidersHorizontal, Check } from 'lucide-react';
import { ProductItem, StoreCurrency } from '@/types/store';

interface ProductCatalogGridProps {
  products: ProductItem[];
  selectedProductId: string;
  onSelectProduct: (product: ProductItem) => void;
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  onQuickView?: (product: ProductItem) => void;
  onQuickAddToCart?: (product: ProductItem) => void;
  currency?: StoreCurrency;
  exchangeRate?: number;
}

export default function ProductCatalogGrid({
  products,
  selectedProductId,
  onSelectProduct,
  activeCategory = 'Products',
  onSelectCategory,
  onQuickView,
  onQuickAddToCart,
  currency = 'USD',
  exchangeRate = 4100,
}: ProductCatalogGridProps) {
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [hoveredColorMap, setHoveredColorMap] = useState<Record<string, string>>({});

  const categories = ['Products', 'Men', 'Women', 'Children', 'Brands'];

  const formatPrice = (usd: number) => {
    if (currency === 'KHR') {
      return `${Math.round(usd * exchangeRate).toLocaleString()} ៛`;
    }
    return `$${usd.toFixed(2)}`;
  };

  const displayedProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!inStockOnly) return true;
        const stock = p.totalStock ?? p.variants?.reduce((s, v) => s + (v.quantity || 0), 0) ?? 1;
        return stock > 0;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'name_asc') return a.title.localeCompare(b.title);
        if (sortBy === 'name_desc') return b.title.localeCompare(a.title);
        return 0;
      });
  }, [products, inStockOnly, sortBy]);

  const getCategoryTitle = (cat: string) => {
    if (cat === 'Products') return 'All Collections';
    if (cat === 'Men') return "Men's Collection";
    if (cat === 'Women') return "Women's Collection";
    if (cat === 'Children') return "Kids & Children";
    if (cat === 'Brands') return 'Brand Showcase';
    if (cat === 'New offers') return 'Exclusive Offers';
    return `${cat}`;
  };

  const getCategorySubtitle = (cat: string) => {
    if (cat === 'Products') return 'Tailored luxury streetwear, outerwear, and modern wardrobe essentials.';
    if (cat === 'Men') return 'Premium denim, jackets, oxford shirts, and tailored trousers.';
    if (cat === 'Women') return 'Silk blouses, outerwear, dresses, and contemporary essentials.';
    if (cat === 'Children') return 'Durable, soft, and playful garments crafted for kids.';
    if (cat === 'Brands') return 'Explore curated designer pieces and certified apparel.';
    if (cat === 'New offers') return 'Seasonal promotional pieces with limited stock availability.';
    return 'Quality apparel crafted for comfort, style, and longevity.';
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Category Header */}
      <div className="border-b border-zinc-200 pb-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              {getCategoryTitle(activeCategory)}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {getCategorySubtitle(activeCategory)}
            </p>
          </div>

          {/* Category Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const label = cat === 'Products' ? 'All' : cat === 'Children' ? 'Kids' : cat;
              const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory && onSelectCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 sm:p-4 mb-8 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-zinc-700 hover:text-zinc-900">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 h-4 w-4"
            />
            <span>In Stock Only</span>
          </label>

          <span className="text-zinc-300">|</span>

          <span className="text-zinc-500 font-medium">
            Showing <strong className="text-zinc-900 font-bold">{displayedProducts.length}</strong> styles
          </span>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 font-medium focus:outline-none focus:border-zinc-900"
          >
            <option value="featured">Featured Styles</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {displayedProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-50 rounded-2xl border border-zinc-200">
          <p className="text-sm font-bold text-zinc-900">No products matching criteria</p>
          <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters or selecting a different category.</p>
          <button
            onClick={() => {
              setInStockOnly(false);
              setSortBy('featured');
              if (onSelectCategory) onSelectCategory('Products');
            }}
            className="mt-4 px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Standard 4-Column Product Lookbook Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedProducts.map((product) => {
            const previewImg =
              hoveredColorMap[product.id] ||
              product.colors[0]?.image ||
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
            const totalStock = product.totalStock ?? product.variants?.reduce((s, v) => s + (v.quantity || 0), 0) ?? 1;
            const isOutOfStock = totalStock <= 0;

            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white border border-zinc-200/90 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all duration-200"
              >
                {/* 3:4 Vertical Fashion Card Container */}
                <div
                  onClick={() => onSelectProduct(product)}
                  className="relative aspect-[3/4] bg-[#f4f4f5] overflow-hidden cursor-pointer"
                >
                  <img
                    src={previewImg}
                    alt={product.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Stock Status Badge */}
                  {isOutOfStock ? (
                    <span className="absolute top-2.5 left-2.5 bg-zinc-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      Out of Stock
                    </span>
                  ) : totalStock <= 5 ? (
                    <span className="absolute top-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      Only {totalStock} Left
                    </span>
                  ) : null}

                  {/* Quick Action Overlay (Desktop Hover) */}
                  <div className="absolute inset-x-2.5 bottom-2.5 hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {onQuickView && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white/95 text-zinc-900 hover:bg-white text-xs font-bold py-2.5 px-2 rounded-xl shadow-md backdrop-blur transition"
                        title="Quick View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View</span>
                      </button>
                    )}

                    {onQuickAddToCart && !isOutOfStock && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAddToCart(product);
                        }}
                        className="flex items-center justify-center p-2.5 bg-zinc-950 text-white hover:bg-emerald-700 rounded-xl shadow-md transition"
                        title="Quick Add to Bag"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Product Card Details */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>{product.brand}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">{product.category}</span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="text-xs sm:text-sm font-bold text-zinc-900 hover:text-emerald-700 cursor-pointer mt-1 line-clamp-1 transition-colors"
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between">
                    <div className="text-sm sm:text-base font-bold text-zinc-950">
                      {formatPrice(product.price)}
                    </div>

                    {/* Interactive Color Swatch Dots */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {product.colors.slice(0, 4).map((col) => {
                          const isHovered = hoveredColorMap[product.id] === col.image;
                          return (
                            <button
                              key={col.id}
                              onMouseEnter={() => {
                                if (col.image) {
                                  setHoveredColorMap((prev) => ({ ...prev, [product.id]: col.image }));
                                }
                              }}
                              onMouseLeave={() => {
                                setHoveredColorMap((prev) => {
                                  const updated = { ...prev };
                                  delete updated[product.id];
                                  return updated;
                                });
                              }}
                              className={`w-3 h-3 rounded-full border transition-all ${
                                isHovered ? 'ring-1 ring-zinc-900 scale-125' : 'border-zinc-300'
                              }`}
                              style={{ backgroundColor: col.hex }}
                              title={col.name}
                            />
                          );
                        })}
                        {product.colors.length > 4 && (
                          <span className="text-[10px] text-zinc-400 font-semibold">
                            +{product.colors.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
