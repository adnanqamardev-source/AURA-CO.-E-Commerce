import React, { useState, useEffect } from "react";
import { Sparkles, ShoppingBag, ArrowRight, Star, Heart, Check, HelpCircle, Flame } from "lucide-react";
import { PRODUCTS, Product } from "./products";
import { CartItem, Order, ShippingDetails } from "./types";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import CartSidebar from "./components/CartSidebar";
import AiConcierge from "./components/AiConcierge";
import OrderHistoryModal from "./components/OrderHistoryModal";
import OwnerPanelModal, { UpiSettings } from "./components/OwnerPanelModal";
import { CurrencyCode } from "./utils/currency";

export default function App() {
  // --- Editable Products Catalog with LocalStorage Persistence ---
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("aura_products");
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  // --- Active Currency State ---
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  // --- Active UPI India Payments Settings ---
  const [upiSettings, setUpiSettings] = useState<UpiSettings>(() => {
    try {
      const saved = localStorage.getItem("aura_upi_settings");
      return saved ? JSON.parse(saved) : { enabled: true, upiId: "aura.boutique@okaxis", upiName: "Aura & Co." };
    } catch {
      return { enabled: true, upiId: "aura.boutique@okaxis", upiName: "Aura & Co." };
    }
  });

  // --- Cart & Orders States with Client-Side LocalStorage Persistence ---
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("aura_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("aura_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- Filtering States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Home" | "Wellness" | "Work">("All");

  // --- Modal Overlay states ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("aura_owner_logged_in") === "true";
    } catch {
      return false;
    }
  });

  // --- Notification Toast states ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Save to localStorage ---
  useEffect(() => {
    localStorage.setItem("aura_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("aura_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("aura_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("aura_upi_settings", JSON.stringify(upiSettings));
  }, [upiSettings]);

  useEffect(() => {
    localStorage.setItem("aura_owner_logged_in", String(isOwnerLoggedIn));
  }, [isOwnerLoggedIn]);

  // --- Calculate total loyalty points ---
  const totalPoints = orders.reduce((acc, order) => {
    // 10 points for every $10 spent on subtotal
    return acc + Math.floor(order.subtotal / 10) * 10;
  }, 0);

  // --- Handler triggers ---
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: Product, selectedOption?: string) => {
    const chosenOption = selectedOption || product.options?.values[0] || "";
    const cartItemId = `${product.id}-${chosenOption}`;

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === cartItemId);
      if (existing) {
        return prevItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          optionName: product.options?.name,
          selectedOption: chosenOption || undefined,
          quantity: 1,
        };
        return [...prevItems, newItem];
      }
    });

    showToast(`Added ${product.name} (${chosenOption || "Standard"}) to your curated bag!`);
  };

  // Quick-add trigger from product grid or chat commands (defaults to first option if available)
  const handleQuickAdd = (product: Product) => {
    const chosenOption = product.options?.values[0] || "";
    handleAddToCart(product, chosenOption);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      showToast(`Removed ${item.name} from your bag.`);
    }
  };

  const handlePlaceOrder = (shipping: ShippingDetails, promoDiscount: number) => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingFee = subtotal > 150 ? 0 : 15;
    const total = Math.max(0, subtotal + shippingFee - promoDiscount);

    const newOrder: Order = {
      id: `AURA-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      items: [...cartItems],
      subtotal,
      discount: promoDiscount,
      shipping: shippingFee,
      total,
      shippingDetails: shipping,
      status: "Processing", // Statuses will progress as simulated
      trackingNumber: `TRK${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]); // Clear cart
    setIsCartOpen(false);

    // Show luxurious checkout feedback
    showToast(`✨ Exquisite Choice! Order ${newOrder.id} has been secured! Check order history for tracking details.`);
  };

  // Opens detail view for a product when requested by product list or by AI action tags
  const handleViewProductDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleViewProductDetailsById = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  // --- Dynamic Filtering Logic ---
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#1a1a1a]">
      
      {/* Top promotional banner ticker */}
      <div className="bg-[#1a1a1a] text-white text-[11px] font-mono py-2.5 text-center px-4 tracking-widest uppercase flex items-center justify-center gap-3">
        <span>✨ Welcome to Aura & Co. • Free shipping on orders over $150</span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline font-semibold text-amber-300">Promo codes WELCOME20 ($20 off) & AURA10 ($10 off) active</span>
      </div>

      {/* Main Navigation bar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        points={totalPoints}
        currency={currency}
        setCurrency={setCurrency}
        onOpenOwnerPanel={() => setIsOwnerOpen(true)}
        isOwnerLoggedIn={isOwnerLoggedIn}
        onOwnerLogout={() => setIsOwnerLoggedIn(false)}
      />

      {/* Hero Curated Showcase Section */}
      <section className="relative overflow-hidden bg-white py-12 md:py-20 border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            
            {/* Launch AI Guide Tag */}
            <button
              onClick={() => setIsAiOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Let "Aura Guide" personalize your lifestyle upgrade</span>
            </button>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-none">
              Aesthetic tools for <br />
              <span className="text-gray-400 font-normal italic">mindful spaces.</span>
            </h1>

            <p className="mt-6 text-gray-500 text-sm sm:text-base max-w-xl leading-relaxed">
              Curating raw, tactile, organic, and exceptionally functional tools. Handcrafted from solid walnut, stone clay ceramics, brushed brass, and shade-grown Kyoto Matcha.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  window.scrollTo({ top: 500, behavior: "smooth" });
                }}
                className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-medium rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Lifestyle Essentials</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setIsAiOpen(true)}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 border border-[#e2e8f0] font-medium rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Talk to Aura Guide AI</span>
              </button>
            </div>

          </div>
        </div>

        {/* Ambient absolute background vectors */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:block pointer-events-none opacity-20">
          <div className="h-full w-full bg-gradient-to-tr from-amber-100 via-indigo-50 to-blue-50 rounded-l-[100px]" />
        </div>
      </section>

      {/* Main Grid: Filters & Catalogs */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-gray-900">
              {selectedCategory === "All" ? "Complete Lifestyle Collection" : `${selectedCategory} Essentials`}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Showing {filteredProducts.length} beautifully sourced products
            </p>
          </div>

          {/* Quick search status / query info reset */}
          {searchQuery && (
            <div className="text-xs text-gray-500 font-mono bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-2 self-start md:self-auto">
              <span>Filtering search: "{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-red-500 font-bold hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Product Grid section */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#e2e8f0] p-8">
            <HelpCircle className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <h3 className="font-display font-bold text-lg text-gray-900">No products match your filters</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
              Try typing something else, changing your curated category tabs, or ask Aura Guide to suggest compatible matches.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-6 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewProductDetails}
                onQuickAdd={handleQuickAdd}
                currency={currency}
              />
            ))}
          </div>
        )}

        {/* Loyalty Milestones & FAQ Banner */}
        <section className="mt-16 bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-8 grid md:grid-cols-3 gap-8">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-gray-900">10% Loyalty Rebates</h4>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Earn 10 points for every $10 spent on subtotal. Track loyalty milestones on your Order History menu.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-700 shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-gray-900">Immersive Store Assistant</h4>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Need color recommendations? Press the **Aura Guide** button to consult our real-time Gemini personal shopper.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 shrink-0">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-gray-900">Artisanal Materials</h4>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                We design with real Portuguese Terracotta, solid unlacquered American Walnut, and shade-grown Kyoto Matcha.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Toast Notification HUD */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-black text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm text-xs border border-neutral-800">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* --- ALL SIDEBARS AND MODAL OVERLAYS --- */}
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        currency={currency}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onPlaceOrder={handlePlaceOrder}
        currency={currency}
        upiSettings={upiSettings}
      />

      {/* Interactive AI Chat Concierge Overlay */}
      <AiConcierge
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onAddToCart={handleQuickAdd}
        onViewProduct={handleViewProductDetails}
        products={products}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        onViewProductDetails={handleViewProductDetailsById}
        currency={currency}
      />

      {/* Owner Panel Catalog Manager Modal */}
      <OwnerPanelModal
        isOpen={isOwnerOpen}
        onClose={() => setIsOwnerOpen(false)}
        products={products}
        onUpdateProducts={(newProds) => setProducts(newProds)}
        onResetProducts={() => {
          setProducts(PRODUCTS);
          localStorage.removeItem("aura_products");
        }}
        upiSettings={upiSettings}
        onUpdateUpiSettings={(newSettings) => setUpiSettings(newSettings)}
        isOwnerLoggedIn={isOwnerLoggedIn}
        onLogin={() => setIsOwnerLoggedIn(true)}
        onLogout={() => setIsOwnerLoggedIn(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e8f0] py-8 text-center text-xs text-gray-400 font-mono tracking-widest mt-auto">
        <p>© 2026 AURA & CO. ALL RIGHTS RESERVED.</p>
        <p className="text-[10px] text-gray-300 mt-1">CRAFTED FOR PEAK MINIMALIST LIFESTYLE REFINEMENT</p>
      </footer>

    </div>
  );
}
