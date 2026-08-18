'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductOrderingView from '@/components/ProductOrderingView';
import ProductCatalogGrid from '@/components/ProductCatalogGrid';
import NewOffersView from '@/components/NewOffersView';
import QuickViewModal from '@/components/QuickViewModal';
import SizeGuideModal from '@/components/SizeGuideModal';
import AboutView from '@/components/AboutView';
import ContactView from '@/components/ContactView';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderTrackerModal from '@/components/OrderTrackerModal';
import Footer from '@/components/Footer';
import { fetchLiveProducts, fetchStoreSettings, StoreSettings } from '@/lib/api';
import { ProductItem, ProductColor, CartItem, StoreCurrency } from '@/types/store';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function StoreHomePage() {
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Products');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currency, setCurrency] = useState<StoreCurrency>('USD');

  // Initial Data Fetching from Live Backend API
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [live, storeConfig] = await Promise.all([
          fetchLiveProducts(),
          fetchStoreSettings(),
        ]);
        setProductsList(live);
        setSettings(storeConfig);

        // Check URL parameters once live products are loaded
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const catParam = params.get('category');
          const prodParam = params.get('product');

          if (catParam) {
            const normalized = catParam.replace(/\+/g, ' ');
            const matched = ['New offers', 'Products', 'Men', 'Women', 'Children', 'Brands', 'About', 'Contact'].find(
              (c) => c.toLowerCase() === normalized.toLowerCase()
            );
            setActiveCategory(matched || normalized);
          }
          if (prodParam) {
            const found = live.find((p) => p.id === prodParam);
            if (found) setSelectedProduct(found);
          }
        }
      } catch (err) {
        console.error('Failed to load live backend products or settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Handle browser Back / Forward history buttons
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        const p = new URLSearchParams(window.location.search);
        const rawCat = p.get('category') || 'Products';
        const normalizedCat = rawCat.replace(/\+/g, ' ');
        const matched = ['New offers', 'Products', 'Men', 'Women', 'Children', 'Brands', 'About', 'Contact'].find(
          (c) => c.toLowerCase() === normalizedCat.toLowerCase()
        );
        setActiveCategory(matched || normalizedCat);

        const pr = p.get('product');
        if (pr) {
          setProductsList((currentList) => {
            const item = currentList.find((x) => x.id === pr);
            setSelectedProduct(item || null);
            return currentList;
          });
        } else {
          setSelectedProduct(null);
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'USD' ? 'KHR' : 'USD'));
  };

  // Update browser URL query without reloading
  const updateUrlState = (category: string, product: ProductItem | null) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (category && category !== 'Products') {
        url.searchParams.set('category', category);
      } else {
        url.searchParams.delete('category');
      }

      if (product) {
        url.searchParams.set('product', product.id);
      } else {
        url.searchParams.delete('product');
      }

      window.history.pushState({}, '', url.toString());
    }
  };

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    setSelectedProduct(null);
    updateUrlState(cat, null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (prod: ProductItem) => {
    setSelectedProduct(prod);
    updateUrlState(activeCategory, prod);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setSelectedProduct(null);
    updateUrlState(activeCategory, null);
  };
  
  // Cart state starts empty until the customer adds products
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [trackerQuery, setTrackerQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Strict Category Isolation Filter
  const filteredProducts = productsList.filter((prod) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    const cat = activeCategory.toLowerCase();

    if (cat === 'products' || cat === 'new offers') {
      return matchesSearch;
    }
    if (cat === 'men') {
      return matchesSearch && (prod.category.toLowerCase() === 'men' || prod.category.toLowerCase() === 'products');
    }
    if (cat === 'women') {
      return matchesSearch && (prod.category.toLowerCase() === 'women' || prod.category.toLowerCase() === 'products');
    }
    if (cat === 'children' || cat === 'kids') {
      return (
        matchesSearch &&
        (prod.category.toLowerCase() === 'children' ||
          prod.category.toLowerCase() === 'kids' ||
          prod.category.toLowerCase() === 'products')
      );
    }
    if (cat === 'brands') {
      return matchesSearch && !!prod.brand;
    }

    return matchesSearch && prod.category.toLowerCase() === cat;
  });

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (
    product: ProductItem,
    color: ProductColor,
    size: string,
    quantity: number,
    variantId?: string
  ) => {
    const cartItemId = `${product.id}-${color.id}-${size}`;

    // Find live stock for this variant
    let matchedVariant = product.variants?.find((v) => {
      const matchColor =
        v.color?.name?.toLowerCase() === color.name?.toLowerCase() ||
        v.color?._id === color.id;
      const matchSize = v.size?.name?.toLowerCase() === size.toLowerCase();
      return matchColor && matchSize;
    });

    if (!matchedVariant && product.variants && product.variants.length > 0) {
      matchedVariant = product.variants.find((v) => v.size?.name?.toLowerCase() === size.toLowerCase()) || product.variants[0];
    }

    const vId = variantId || matchedVariant?._id || product.id;
    const stockAvailable = matchedVariant !== undefined ? matchedVariant.quantity : (product.totalStock ?? 10);

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.cartId === cartItemId);
      if (existingItemIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(updated[existingItemIndex].quantity + quantity, stockAvailable);
        updated[existingItemIndex].quantity = newQty;
        return updated;
      }
      return [
        ...prevItems,
        {
          cartId: cartItemId,
          productId: product.id,
          variantId: vId,
          title: product.title,
          price: matchedVariant?.salePrice || product.price,
          selectedColor: color,
          selectedSize: size,
          quantity,
          availableStock: stockAvailable,
        },
      ];
    });

    showToast(`Added ${quantity}x "${product.title}" (${size}) to your bag`);
  };

  const handleQuickAddToCart = (product: ProductItem) => {
    const defaultColor = product.colors[0] || {
      id: 'default-color',
      name: 'Standard',
      hex: '#09090b',
      image: '',
      thumbnails: [],
    };
    const defaultSize = product.sizes[0] || 'M';
    handleAddToCart(product, defaultColor, defaultSize, 1);
  };

  const handleBuyNow = (
    product: ProductItem,
    color: ProductColor,
    size: string,
    quantity: number,
    variantId?: string
  ) => {
    handleAddToCart(product, color, size, quantity, variantId);
    setCartOpen(true);
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const maxStock = item.availableStock ?? 99;
            const newQty = Math.min(item.quantity + delta, maxStock);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleOrderSuccess = () => {
    setCartItems([]);
  };

  const isAboutView = activeCategory.toLowerCase() === 'about';
  const isContactView = activeCategory.toLowerCase() === 'contact';
  const isNewOffersView = activeCategory.toLowerCase() === 'new offers';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* Top Header Navigation */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenTracker={() => setTrackerOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q) setSelectedProduct(null);
        }}
        allProducts={productsList}
        onSelectProduct={handleSelectProduct}
        settings={settings}
        currency={currency}
        onToggleCurrency={toggleCurrency}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {isLoading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
            <Loader2 className="w-6 h-6 text-zinc-800 animate-spin mb-3" />
            <p className="text-xs font-semibold text-zinc-600">
              Loading catalog...
            </p>
          </div>
        ) : selectedProduct ? (
          <ProductOrderingView
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onBackToCatalog={handleBackToCatalog}
            onOpenSizeGuide={() => setSizeGuideOpen(true)}
            currency={currency}
            exchangeRate={settings?.exchangeRateKHR}
          />
        ) : isAboutView ? (
          /* Dedicated About Us Section */
          <AboutView onShopClick={() => handleSelectCategory('Products')} />
        ) : isContactView ? (
          /* Dedicated Contact Section */
          <ContactView settings={settings} />
        ) : isNewOffersView ? (
          /* Dedicated New Offers View */
          <NewOffersView
            allProducts={productsList}
            onSelectProduct={handleSelectProduct}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            onAddToCart={handleAddToCart}
          />
        ) : (
          /* Direct, Clean E-Commerce Catalog Grid */
          <ProductCatalogGrid
            products={filteredProducts}
            selectedProductId=""
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            onQuickAddToCart={handleQuickAddToCart}
            currency={currency}
            exchangeRate={settings?.exchangeRateKHR}
          />
        )}
      </main>

      {/* Footer */}
      <Footer settings={settings} />

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onOpenFullDetail={(prod) => {
          setQuickViewProduct(null);
          handleSelectProduct(prod);
        }}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        currency={currency}
        exchangeRate={settings?.exchangeRateKHR}
      />

      {/* Sizing Chart Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={activeCategory}
      />

      {/* Slide-out Shopping Bag Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        settings={settings}
        currency={currency}
      />

      {/* Customer Express Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={(invoiceNo) => {
          handleOrderSuccess();
          if (invoiceNo) {
            setTrackerQuery(invoiceNo);
            setTrackerOpen(true);
          }
        }}
        settings={settings}
        currency={currency}
      />

      {/* Customer Live Order Dispatch Tracker Modal */}
      <OrderTrackerModal
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        initialQuery={trackerQuery}
      />

      {/* Added to Bag Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-zinc-800 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setCartOpen(true)}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider underline ml-2"
          >
            View Bag
          </button>
        </div>
      )}

    </div>
  );
}
