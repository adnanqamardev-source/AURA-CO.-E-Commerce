import React from "react";
import { ShoppingBag, Search, Sparkles, Clock, ShieldCheck, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { CurrencyCode } from "../utils/currency";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: "All" | "Home" | "Wellness" | "Work";
  setSelectedCategory: (category: "All" | "Home" | "Wellness" | "Work") => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenAi: () => void;
  points: number;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  onOpenOwnerPanel: () => void;
  isOwnerLoggedIn: boolean;
  onOwnerLogout: () => void;
}

export default function Navbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  cartCount,
  onOpenCart,
  onOpenOrders,
  onOpenAi,
  points,
  currency,
  setCurrency,
  onOpenOwnerPanel,
  isOwnerLoggedIn,
  onOwnerLogout,
}: NavbarProps) {
  const categories: ("All" | "Home" | "Wellness" | "Work")[] = [
    "All",
    "Home",
    "Wellness",
    "Work",
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Section */}
          <div className="flex-1 md:flex-none flex items-center">
            <span className="font-display font-bold text-xl sm:text-2xl tracking-widest text-[#1a1a1a]">
              AURA & CO.
            </span>
            <span className="hidden sm:inline-block ml-3 font-mono text-[9px] bg-[#1a1a1a] text-white px-1.5 py-0.5 rounded tracking-wider uppercase">
              Boutique
            </span>
          </div>

          {/* Navigation Category Tabs (Desktop) */}
          <nav className="hidden md:flex space-x-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative ${
                  selectedCategory === cat
                    ? "text-[#1a1a1a]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {cat}
                {selectedCategory === cat && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#1a1a1a]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Search bar & Action Buttons */}
          <div className="flex items-center space-x-4">
            
            {/* Real-time Search Box */}
            <div className="relative hidden sm:block w-48 md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#e2e8f0] rounded-full text-xs placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200"
              />
            </div>

            {/* AI Concierge Shortcut Button */}
            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#cbd5e1] border border-[#cbd5e1] text-[#1a1a1a] text-xs font-semibold rounded-full shadow-sm transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
              <span className="hidden md:inline">Aura Guide</span>
            </button>

            {/* Loyalty Points Badge */}
            {points > 0 && (
              <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-medium">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>{points} pts</span>
              </div>
            )}

            {/* Currency Selector Toggle */}
            <div className="flex items-center">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-white border border-[#e2e8f0] hover:border-gray-400 text-[#1a1a1a] text-xs font-mono font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-black transition-all cursor-pointer"
                title="Select Shop Currency"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Owner Portal Trigger Button */}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenOwnerPanel}
                className={`p-2 rounded-full transition-colors relative ${
                  isOwnerLoggedIn
                    ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                    : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                }`}
                title={isOwnerLoggedIn ? "Store Owner Panel (Authenticated)" : "Store Owner Portal"}
              >
                <ShieldCheck className="h-5 w-5" />
                {isOwnerLoggedIn && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {isOwnerLoggedIn && (
                <button
                  onClick={() => {
                    if (confirm("Log out of Store Owner session?")) {
                      onOwnerLogout();
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout Store Owner Session"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Order History Trigger */}
            <button
              onClick={onOpenOrders}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative"
              title="Order History"
            >
              <Clock className="h-5 w-5" />
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-black text-white rounded-full flex items-center justify-center font-mono text-[10px] font-bold"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Categories & Search */}
        <div className="py-2 border-t border-[#e2e8f0] md:hidden flex flex-col gap-2">
          {/* Mobile Search */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#e2e8f0] rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:border-gray-900"
            />
          </div>

          {/* Mobile Category Scroll */}
          <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-full shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? "bg-black text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
