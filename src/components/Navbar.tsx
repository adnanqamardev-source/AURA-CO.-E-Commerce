import React from "react";
import { ShoppingBag, Search, Sparkles, Clock, ShieldCheck, LogOut, User as UserIcon } from "lucide-react";
import { motion } from "motion/react";
import { CurrencyCode } from "../utils/currency";
import { User as FirebaseUser } from "firebase/auth";

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
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
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
  currentUser,
  onOpenAuth,
  onLogout,
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

          {/* Action Buttons & Consolidated Portal Groups */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 1. Real-time Search Box & AI Concierge Group (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-neutral-400" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search curation..."
                  className="w-40 xl:w-52 pl-9 pr-3 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:border-neutral-950 rounded-full text-xs placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950 transition-all duration-300"
                />
              </div>

              <button
                onClick={onOpenAi}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f4] hover:bg-neutral-200 border border-neutral-200 text-neutral-800 text-[11px] font-bold rounded-full shadow-2xs transition-all shrink-0 cursor-pointer"
                title="Aura Guide AI Assistant"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                <span>Aura Guide</span>
              </button>
            </div>

            {/* 2. Currency Selector Toggle */}
            <div className="hidden sm:flex items-center px-2.5 py-1 border border-neutral-200 bg-white rounded-full">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent border-none text-neutral-600 hover:text-neutral-950 text-[10px] font-mono font-bold focus:outline-none transition-all cursor-pointer"
                title="Change Store Currency"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* 3. Consolidated Portal & Profile Group (Owner + Customer) */}
            <div className="flex items-center gap-1 border border-neutral-200 bg-[#f5f5f4]/80 rounded-full p-1 transition-all">
              {/* Boutique Owner Action */}
              <button
                onClick={onOpenOwnerPanel}
                className={`p-1.5 rounded-full transition-all relative ${
                  isOwnerLoggedIn
                    ? "text-emerald-700 bg-white shadow-2xs"
                    : "text-neutral-400 hover:text-neutral-900 hover:bg-white/40"
                }`}
                title={isOwnerLoggedIn ? "Store Owner Panel (Authenticated)" : "Store Owner Portal"}
              >
                <ShieldCheck className="h-4 w-4" />
                {isOwnerLoggedIn && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white animate-pulse" />
                )}
              </button>

              <div className="w-[1px] h-3.5 bg-neutral-200" />

              {/* Customer Profile Action */}
              {currentUser ? (
                <div className="flex items-center gap-1 bg-white pl-2 pr-1 py-0.5 rounded-full shadow-2xs">
                  <span 
                    className="text-[10px] font-mono font-bold tracking-wider text-neutral-800 uppercase max-w-[65px] truncate" 
                    title={currentUser.displayName || currentUser.email || ""}
                  >
                    {currentUser.displayName?.split(" ")[0] || currentUser.email?.split("@")[0]}
                  </span>
                  {points > 0 && (
                    <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1 rounded-full font-bold flex items-center gap-0.5 shrink-0" title={`${points} loyalty points`}>
                      {points}p
                    </span>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Sign out of your Aura profile?")) {
                        onLogout();
                      }
                    }}
                    className="p-1 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-full transition-all cursor-pointer"
                    title="Sign Out of Customer Profile"
                  >
                    <LogOut className="h-2.5 w-2.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-white/40 rounded-full transition-all cursor-pointer"
                  title="Customer Profile Login / Sign Up"
                >
                  <UserIcon className="h-4 w-4" />
                </button>
              )}

              {/* Owner Portal Active Logout */}
              {isOwnerLoggedIn && (
                <>
                  <div className="w-[1px] h-3.5 bg-neutral-200" />
                  <button
                    onClick={() => {
                      if (confirm("Log out of Boutique Owner session?")) {
                        onOwnerLogout();
                      }
                    }}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-full transition-colors"
                    title="Log Out of Owner Session"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* 4. Shopping & History Group */}
            <div className="flex items-center gap-1 border border-neutral-200 bg-white rounded-full p-1 shadow-2xs">
              {/* Order History */}
              <button
                onClick={onOpenOrders}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all relative"
                title="Curated Purchase History"
              >
                <Clock className="h-4 w-4" />
              </button>

              <div className="w-[1px] h-3.5 bg-neutral-100" />

              {/* Shopping Bag */}
              <button
                onClick={onOpenCart}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all relative flex items-center justify-center"
                aria-label="Shopping Bag"
                title="Curated Bag"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-4 w-4 bg-neutral-900 text-white rounded-full flex items-center justify-center font-mono text-[9px] font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Categories & Search */}
        <div className="py-3 border-t border-[#e2e8f0] md:hidden flex flex-col gap-2.5 bg-[#faf9f6]">
          {/* Mobile Search & AI Guide Row */}
          <div className="flex items-center gap-2 px-1">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex-1 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:border-gray-900"
              />
            </div>
            
            {/* Mobile AI Guide Button */}
            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
              <span>Guide</span>
            </button>
          </div>

          {/* Mobile Category Scroll */}
          <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full shrink-0 transition-colors ${
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
