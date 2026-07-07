import React, { useState, useEffect } from "react";
import { X, Edit2, Plus, RefreshCw, Check, AlertCircle, Trash2, ArrowRight, ShieldCheck, Landmark, ToggleLeft, ToggleRight, Info, Lock, Key, LogOut, Users, ShoppingCart, TrendingUp, Filter, Award, Shield, CheckCircle, Package, Truck, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../products";
import { Order } from "../types";

export interface UpiSettings {
  enabled: boolean;
  upiId: string;
  upiName: string;
}

interface OwnerPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (newProducts: Product[]) => void;
  onResetProducts: () => void;
  upiSettings: UpiSettings;
  onUpdateUpiSettings: (settings: UpiSettings) => void;
  isOwnerLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  allOrders?: Order[];
  onUpdateOrder?: (orderId: string, updatedFields: Partial<Order>) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export default function OwnerPanelModal({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  onResetProducts,
  upiSettings,
  onUpdateUpiSettings,
  isOwnerLoggedIn,
  onLogin,
  onLogout,
  allOrders = [],
  onUpdateOrder,
  onDeleteOrder,
}: OwnerPanelModalProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Authentication Form States
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Add Product form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    category: "Home",
    image: "https://picsum.photos/seed/custom/600/600",
    description: "",
    details: ["Premium handcrafted detail", "Ethically and sustainably sourced"],
    specs: { "Material": "Natural Materials" },
    rating: 5.0,
    reviewCount: 1,
    reviews: [
      { author: "Verified Customer", rating: 5, date: "2026-07-04", content: "Absolutely wonderful addition to my minimalist collection." }
    ]
  });

  const [activeTab, setActiveTab] = useState<"catalog" | "upi" | "orders" | "users" | "financials">("catalog");
  const [localUpiEnabled, setLocalUpiEnabled] = useState(upiSettings.enabled);
  const [localUpiId, setLocalUpiId] = useState(upiSettings.upiId);
  const [localUpiName, setLocalUpiName] = useState(upiSettings.upiName);

  // --- Customer / User Management State ---
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("aura_admin_users");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "u-1", name: "Aura Patron", email: "patron@aura.com", role: "Patron", permissions: "Read, Purchase", status: "Active" },
      { id: "u-2", name: "Legendary Ace", email: "legendaryace590@gmail.com", role: "Owner", permissions: "Full Suite", status: "Active" },
      { id: "u-3", name: "Siddharth Mehta", email: "siddharth@example.com", role: "Support", permissions: "Read, Update Orders", status: "Active" },
      { id: "u-4", name: "Ananya Iyer", email: "ananya@example.com", role: "Member", permissions: "Read, Purchase", status: "Active" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("aura_admin_users", JSON.stringify(users));
  }, [users]);

  // States for user addition/editing
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Member");
  const [newUserStatus, setNewUserStatus] = useState("Active");

  // States for order tracking details editing
  const [editingOrderTracking, setEditingOrderTracking] = useState<string | null>(null);
  const [tempTrackingNumber, setTempTrackingNumber] = useState("");

  // States for financials
  const [payoutAmount, setPayoutAmount] = useState("1000");
  const [payoutsList, setPayoutsList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("aura_payouts");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "pay-1", date: "2026-07-01", amount: 1450, status: "Cleared", bank: "State Bank of India" },
      { id: "pay-2", date: "2026-07-05", amount: 890, status: "Processing", bank: "HDFC Bank" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("aura_payouts", JSON.stringify(payoutsList));
  }, [payoutsList]);

  // Order filtration state
  const [orderFilter, setOrderFilter] = useState<"All" | "Processing" | "Shipped" | "Delivered">("All");

  if (!isOpen) return null;

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    onUpdateProducts(updated);
    setEditingProduct(null);
    triggerSuccess(`Successfully updated ${editingProduct.name}!`);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert("Please provide a name and price.");
      return;
    }

    const created: Product = {
      id: `prod-custom-${Date.now()}`,
      name: newProduct.name,
      price: Number(newProduct.price),
      category: (newProduct.category as any) || "Home",
      image: newProduct.image || "https://picsum.photos/seed/default/600/600",
      description: newProduct.description || "A gorgeous custom-curated addition to the Aura catalog.",
      details: newProduct.details || ["Custom crafted element"],
      specs: newProduct.specs || { "Material": "Natural custom alloy" },
      rating: 5.0,
      reviewCount: 1,
      reviews: newProduct.reviews || []
    };

    onUpdateProducts([...products, created]);
    setShowAddForm(false);
    // Reset form
    setNewProduct({
      name: "",
      price: 0,
      category: "Home",
      image: "https://picsum.photos/seed/custom/600/600",
      description: "",
      details: ["Premium handcrafted detail", "Ethically and sustainably sourced"],
      specs: { "Material": "Natural Materials" },
      rating: 5.0,
      reviewCount: 1,
      reviews: [
        { author: "Verified Customer", rating: 5, date: "2026-07-04", content: "Absolutely wonderful addition to my minimalist collection." }
      ]
    });
    triggerSuccess(`Successfully added custom product: ${created.name}!`);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product from the catalog?")) {
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
      triggerSuccess("Product deleted successfully.");
    }
  };

  const handleSaveUpiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localUpiId.trim() || !localUpiName.trim()) {
      alert("Please provide both a valid UPI ID and Merchant Name.");
      return;
    }
    onUpdateUpiSettings({
      enabled: localUpiEnabled,
      upiId: localUpiId.trim(),
      upiName: localUpiName.trim(),
    });
    triggerSuccess("UPI Merchant Settings updated successfully!");
  };

  // --- User management logic handlers ---
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert("Please specify user name and email.");
      return;
    }
    const created = {
      id: `u-custom-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      permissions: newUserRole === "Owner" ? "Full Suite" : newUserRole === "Support" ? "Read, Update Orders" : "Read, Purchase",
      status: newUserStatus
    };
    setUsers([...users, created]);
    setShowAddUserForm(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("Member");
    setNewUserStatus("Active");
    triggerSuccess(`Successfully registered customer account for ${created.name}`);
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
    triggerSuccess(`Successfully updated customer details for ${editingUser.name}`);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this customer account?")) {
      setUsers(users.filter((u) => u.id !== userId));
      triggerSuccess("User account has been deleted successfully.");
    }
  };

  // --- Financial helper handlers ---
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid payout amount.");
      return;
    }
    const created = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      amount: amt,
      status: "Processing",
      bank: "State Bank of India"
    };
    setPayoutsList([created, ...payoutsList]);
    setPayoutAmount("1000");
    triggerSuccess(`Payout request for ₹${amt.toLocaleString()} INR initiated successfully.`);
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setLoginError("");

    try {
      const response = await fetch("/api/owner/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, passcode: passwordInput }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLogin();
        setUsernameInput("");
        setPasswordInput("");
        setLoginError("");
        triggerSuccess("Authorized successfully as Store Owner.");
      } else {
        setLoginError(data.error || "Invalid credentials. Please verify your passcode.");
      }
    } catch (err) {
      setLoginError("Failed to connect to authentication server. Please verify your backend is running.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOwnerLoggedIn) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Panel Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#faf9f6] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-[#e2e8f0] flex flex-col p-6 md:p-8"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white hover:bg-black hover:text-white rounded-full transition-all border border-[#e2e8f0]"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Gateway Logo Header */}
            <div className="text-center mt-4 mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="font-display font-bold text-lg text-gray-900 tracking-wider uppercase">Store Owner Gateway</h2>
              <p className="text-gray-400 text-[10px] uppercase font-mono tracking-widest mt-1">Aura & Co. Secure Portal</p>
            </div>

            {/* Login form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Key className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    disabled={isVerifying}
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="e.g. admin"
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Passcode / Owner Key</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="password"
                    required
                    disabled={isVerifying}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="e.g. admin123"
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[11px] leading-relaxed flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Demo Help Banner */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-indigo-900 text-[11px] leading-relaxed space-y-1">
                <p className="font-semibold flex items-center gap-1 text-indigo-950">
                  <Info className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Sandbox Testing Credentials</span>
                </p>
                <p className="text-indigo-700">
                  Use Username: <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-100 font-mono font-bold">admin</code>
                </p>
                <p className="text-indigo-700">
                  Use Passcode: <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-100 font-mono font-bold">admin123</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize Store Access</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6 text-[9px] text-gray-400 font-mono tracking-wider">
              AURA & CO. SECURE ADMINISTRATION HUB
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Panel Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#faf9f6] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[85vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white hover:bg-black hover:text-white rounded-full transition-all border border-[#e2e8f0]"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="p-6 md:p-8 border-b border-[#e2e8f0] bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-gray-900 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-indigo-600 shrink-0" />
                <span>Owner Dashboard</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider animate-pulse">
                  Logged In
                </span>
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                Manage your boutique's catalog inventory and direct UPI payments in India.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {activeTab === "catalog" && (
                <>
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Product</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Reset catalog back to original 8 products? Any custom edits will be lost.")) {
                        onResetProducts();
                        triggerSuccess("Catalog reset to standard boutique inventory!");
                      }
                    }}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset Inventory</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  if (confirm("Log out of your Store Owner session?")) {
                    onLogout();
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-red-100 transition-all cursor-pointer"
                title="Log Out of Store Owner Session"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap border-b border-[#e2e8f0] bg-[#f8fafc] px-6 md:px-8 gap-y-1">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "catalog"
                  ? "border-black text-black font-bold"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              📦 Catalog
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "orders"
                  ? "border-black text-black font-bold"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              🛍️ Orders Tracking
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "users"
                  ? "border-black text-black font-bold"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              👥 Users & Roles
            </button>
            <button
              onClick={() => setActiveTab("financials")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "financials"
                  ? "border-black text-black font-bold"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              📈 Financials & Payouts
            </button>
            <button
              onClick={() => setActiveTab("upi")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "upi"
                  ? "border-black text-black font-bold"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              🇮🇳 UPI Gateway
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {activeTab === "catalog" && (
              <>
                {/* Conditionally render ADD Product Form */}
                {showAddForm && (
                  <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-xl border border-indigo-200 mb-6 space-y-4">
                    <h3 className="font-display font-semibold text-sm text-indigo-900 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Create New Curated Product Arrival</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name</label>
                        <input
                          type="text"
                          required
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="e.g. Kyoto Brass Incense Holder"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Price (Base USD)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={newProduct.price || ""}
                          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                          placeholder="e.g. 65"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                        >
                          <option value="Home">Home</option>
                          <option value="Wellness">Wellness</option>
                          <option value="Work">Work</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                          placeholder="Image address"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Description Slogan</label>
                      <input
                        type="text"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Short exquisite description of the item"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
                      >
                        Add to Catalog
                      </button>
                    </div>
                  </form>
                )}

                {/* Conditionally render EDIT Product Form */}
                {editingProduct && (
                  <form onSubmit={handleSaveEdit} className="bg-white p-6 rounded-xl border border-amber-300 mb-6 space-y-4">
                    <h3 className="font-display font-semibold text-sm text-amber-900 flex items-center gap-2">
                      <Edit2 className="h-4 w-4" />
                      <span>Edit Product: {editingProduct.name}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Price (Base USD)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                        >
                          <option value="Home">Home</option>
                          <option value="Wellness">Wellness</option>
                          <option value="Work">Work</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={editingProduct.image}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* List of existing products */}
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Catalog Items List
                </h3>

                <div className="space-y-3">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-gray-900 truncate">
                              {p.name}
                            </h4>
                            <span className="font-mono text-[8px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase">
                              {p.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            Base Price: <span className="font-bold text-gray-700">${p.price} USD</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setShowAddForm(false);
                          }}
                          className="p-1.5 hover:bg-amber-50 hover:text-amber-700 text-gray-400 rounded transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400">All Orders</span>
                    <h4 className="font-bold text-xl text-gray-900 mt-1">{allOrders.length}</h4>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-indigo-500">Processing</span>
                    <h4 className="font-bold text-xl text-indigo-700 mt-1">{allOrders.filter(o => o.status === "Processing").length}</h4>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500">Shipped</span>
                    <h4 className="font-bold text-xl text-amber-700 mt-1">{allOrders.filter(o => o.status === "Shipped").length}</h4>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-500">Delivered</span>
                    <h4 className="font-bold text-xl text-emerald-700 mt-1">{allOrders.filter(o => o.status === "Delivered").length}</h4>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-[#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-semibold text-gray-400 flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5" />
                      Filter Status:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(["All", "Processing", "Shipped", "Delivered"] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setOrderFilter(filter)}
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                            orderFilter === filter
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {allOrders.filter(o => orderFilter === "All" || o.status === orderFilter).length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-[#e2e8f0] text-gray-400 text-xs">
                      No customer orders match this status criteria.
                    </div>
                  ) : (
                    allOrders
                      .filter(o => orderFilter === "All" || o.status === orderFilter)
                      .map((order) => (
                        <div
                          key={order.id}
                          className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm"
                        >
                          {/* Order Header */}
                          <div className="p-4 bg-gray-50 border-b border-gray-150 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-gray-900">{order.id}</span>
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  order.status === "Processing"
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                    : order.status === "Shipped"
                                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                Placed on {order.date} • Customer: {order.shippingDetails?.fullName} ({order.shippingDetails?.email})
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Workflow Actions */}
                              {order.status === "Processing" && (
                                <button
                                  onClick={() => onUpdateOrder?.(order.id, { status: "Shipped" })}
                                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Truck className="h-3 w-3" />
                                  <span>Mark Shipped</span>
                                </button>
                              )}
                              {order.status === "Shipped" && (
                                <button
                                  onClick={() => onUpdateOrder?.(order.id, { status: "Delivered" })}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Mark Delivered</span>
                                </button>
                              )}
                              
                              <button
                                onClick={() => onDeleteOrder?.(order.id)}
                                className="p-1.5 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded transition-colors"
                                title="Delete/Purge Order"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Order Body Details */}
                          <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Products summary */}
                            <div className="md:col-span-6 space-y-2">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Items Purchased</span>
                              {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-2 text-xs text-gray-700">
                                  <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded border border-gray-100" />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium truncate">{item.name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">
                                      {item.selectedOption ? `Option: ${item.selectedOption}` : "Standard"} • Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <span className="font-mono text-gray-500">${item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>

                            {/* Shipping Details */}
                            <div className="md:col-span-3 text-xs text-gray-600 space-y-1">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Fulfillment Address</span>
                              <p className="font-semibold text-gray-900">{order.shippingDetails?.fullName}</p>
                              <p className="text-gray-500 truncate">{order.shippingDetails?.address}</p>
                              <p className="text-gray-500">{order.shippingDetails?.city} {order.shippingDetails?.zipCode}</p>
                            </div>

                            {/* Finance / tracking summaries */}
                            <div className="md:col-span-3 text-xs text-gray-600 space-y-2 border-l border-gray-100 pl-4">
                              <div>
                                <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Financial Receipt</span>
                                <div className="flex justify-between font-mono text-[11px]">
                                  <span>Total Charged:</span>
                                  <span className="font-bold text-gray-900">${order.total}</span>
                                </div>
                              </div>

                              {/* Editable Tracking number */}
                              <div>
                                <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Fulfillment Tracking</span>
                                {editingOrderTracking === order.id ? (
                                  <div className="flex gap-1.5 mt-1">
                                    <input
                                      type="text"
                                      value={tempTrackingNumber}
                                      onChange={(e) => setTempTrackingNumber(e.target.value)}
                                      className="w-full px-2 py-1 text-[10px] font-mono border border-gray-300 rounded focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onUpdateOrder?.(order.id, { trackingNumber: tempTrackingNumber });
                                        setEditingOrderTracking(null);
                                      }}
                                      className="bg-black text-white px-2 py-1 rounded text-[9px] font-bold"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between font-mono text-[10px] bg-gray-50 p-1.5 rounded border border-gray-100">
                                    <span className="truncate">{order.trackingNumber || "No Tracking Set"}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingOrderTracking(order.id);
                                        setTempTrackingNumber(order.trackingNumber || "");
                                      }}
                                      className="text-indigo-600 hover:underline text-[9px] font-bold"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
                  <div>
                    <h3 className="font-display font-bold text-sm text-gray-900">Manage Store Profiles & Accounts</h3>
                    <p className="text-gray-400 text-[10px]">Create, edit roles, and oversee permissions for registered boutique accounts.</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddUserForm(true);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create User Account</span>
                  </button>
                </div>

                {/* Create/Edit User Form */}
                {showAddUserForm && (
                  <form onSubmit={handleAddUser} className="bg-white p-5 rounded-xl border border-indigo-200 mb-6 space-y-4 shadow-sm">
                    <h3 className="font-display font-semibold text-xs text-indigo-900 flex items-center gap-1.5 border-b pb-2">
                      <Plus className="h-4 w-4" />
                      <span>Register New User Account</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Full Display Name</label>
                        <input
                          type="text"
                          required
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Boutique Authorization Role</label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white font-mono"
                        >
                          <option value="Member">Member (Standard Customer)</option>
                          <option value="Patron">Patron (Loyalty Tier)</option>
                          <option value="Support">Support Staff</option>
                          <option value="Owner">Store Owner / Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Account Status</label>
                        <select
                          value={newUserStatus}
                          onChange={(e) => setNewUserStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white font-mono"
                        >
                          <option value="Active">Active</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddUserForm(false)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
                      >
                        Add User Account
                      </button>
                    </div>
                  </form>
                )}

                {/* Edit User Form */}
                {editingUser && (
                  <form onSubmit={handleSaveUserEdit} className="bg-white p-5 rounded-xl border border-amber-300 mb-6 space-y-4 shadow-sm">
                    <h3 className="font-display font-semibold text-xs text-amber-900 flex items-center gap-1.5 border-b pb-2">
                      <Edit2 className="h-4 w-4 text-amber-600" />
                      <span>Edit Account Role: {editingUser.name}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Role</label>
                        <select
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({
                            ...editingUser,
                            role: e.target.value,
                            permissions: e.target.value === "Owner" ? "Full Suite" : e.target.value === "Support" ? "Read, Update Orders" : "Read, Purchase"
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white font-mono"
                        >
                          <option value="Member">Member</option>
                          <option value="Patron">Patron</option>
                          <option value="Support">Support</option>
                          <option value="Owner">Owner</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Status</label>
                        <select
                          value={editingUser.status}
                          onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white font-mono"
                        >
                          <option value="Active">Active</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Users List Grid */}
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-gray-900">{user.name}</h4>
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                              user.role === "Owner"
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : user.role === "Support"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{user.email}</p>
                        </div>
                      </div>

                      {/* Readout of Permissions & status */}
                      <div className="flex items-center gap-6">
                        <div className="hidden sm:block text-right">
                          <p className="text-[9px] font-mono uppercase text-gray-400 font-bold">Authorized Permissions</p>
                          <p className="text-[11px] font-mono text-gray-600 mt-0.5">{user.permissions}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-mono uppercase text-gray-400 font-bold">Status</p>
                          <span className={`text-[9px] font-mono font-bold ${
                            user.status === "Active" ? "text-emerald-600" : "text-red-500"
                          }`}>{user.status}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowAddUserForm(false);
                            }}
                            className="p-1.5 hover:bg-amber-50 hover:text-amber-700 text-gray-400 rounded transition-colors"
                            title="Edit User Role"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "financials" && (
              <div className="space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-600 font-bold">Gross Revenue</span>
                      <h4 className="font-display font-black text-2xl text-emerald-900 mt-1">
                        ${allOrders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}
                      </h4>
                      <p className="text-[9px] text-gray-400 font-mono mt-1">Total transaction settlements</p>
                    </div>
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400">Total Transactions</span>
                      <h4 className="font-display font-black text-2xl text-gray-900 mt-1">{allOrders.length}</h4>
                      <p className="text-[9px] text-gray-400 font-mono mt-1">Direct card, UTR, or UPI payments</p>
                    </div>
                    <div className="p-3 bg-gray-50 text-gray-700 rounded-xl">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400">Average Order Value</span>
                      <h4 className="font-display font-black text-2xl text-gray-900 mt-1">
                        ${allOrders.length ? Math.round(allOrders.reduce((acc, o) => acc + o.total, 0) / allOrders.length) : 0}
                      </h4>
                      <p className="text-[9px] text-gray-400 font-mono mt-1">Average order cart subtotal</p>
                    </div>
                    <div className="p-3 bg-gray-50 text-gray-700 rounded-xl">
                      <Landmark className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                {/* Main section: direct payouts */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Settlement / payout requester */}
                  <div className="md:col-span-7 bg-white p-6 rounded-xl border border-[#e2e8f0] space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xs text-gray-900 uppercase tracking-wider">Settlements & Direct Merchant Payouts</h4>
                        <p className="text-gray-400 text-[10px]">RBI direct settlement to linked bank accounts in India.</p>
                      </div>
                    </div>

                    <form onSubmit={handleRequestPayout} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-700 mb-1">Linked Bank Account</label>
                          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none bg-gray-50 font-mono text-gray-600" disabled>
                            <option>State Bank of India (***3482)</option>
                            <option>HDFC Bank (***9812)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-700 mb-1">Request Amount (INR)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 font-mono font-semibold text-xs">₹</span>
                            <input
                              type="number"
                              required
                              value={payoutAmount}
                              onChange={(e) => setPayoutAmount(e.target.value)}
                              className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white font-mono"
                              placeholder="1000"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
                      >
                        Initiate direct bank payout
                      </button>
                    </form>

                    <div className="space-y-2.5 pt-4">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Historic Payout Settlements</span>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto font-sans">
                        {payoutsList.map((p) => (
                          <div key={p.id} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 rounded-lg border border-gray-150">
                            <div>
                              <p className="font-mono font-bold text-gray-900">₹{p.amount.toLocaleString()} INR</p>
                              <p className="text-[9px] text-gray-400 font-mono mt-0.5">{p.date} • Sent to {p.bank}</p>
                            </div>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              p.status === "Cleared" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            }`}>{p.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Compliance & RBI compliance card */}
                  <div className="md:col-span-5 bg-[#fafafa] p-6 rounded-xl border border-gray-150 space-y-4">
                    <h4 className="font-display font-semibold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1 pb-2 border-b">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span>Security Playbook</span>
                    </h4>

                    <div className="space-y-3.5 text-xs text-gray-600 leading-relaxed">
                      <div>
                        <p className="font-bold text-gray-900 font-mono text-[10px] uppercase">1. PCI-DSS Compliance Guidelines</p>
                        <p className="text-gray-400 text-[11px] mt-0.5">
                          Never store card numbers, CVVs, or pins directly in Firestore. Use tokenized gateways (Stripe, Razorpay) to preserve security.
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 font-mono text-[10px] uppercase">2. Financial Reporting & Auditing</p>
                        <p className="text-gray-400 text-[11px] mt-0.5">
                          Every settlement request triggers an automated ledgring entry in direct accordance with Section 194-O of Indian IT Act.
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 font-mono text-[10px] uppercase">3. Customer Refunds Policy</p>
                        <p className="text-gray-400 text-[11px] mt-0.5">
                          Refunds are directly routed via UPI API or linked card processors and clear back to customer bank accounts within 3-5 business days.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "upi" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 via-white to-emerald-50 p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-gray-900">Configure Instant UPI Payments</h3>
                        <p className="text-gray-400 text-[10px] font-mono uppercase tracking-wider">Direct Indian Settlement Mode</p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveUpiSettings} className="space-y-4 pt-2">
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                        <div>
                          <label className="block text-xs font-semibold text-gray-800">Enable UPI Payments</label>
                          <p className="text-gray-400 text-[10px]">Show UPI QR code payment method to buyers at checkout.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLocalUpiEnabled(!localUpiEnabled)}
                          className="text-gray-600 hover:text-indigo-600 transition-colors focus:outline-none"
                        >
                          {localUpiEnabled ? (
                            <ToggleRight className="h-10 w-10 text-emerald-600 cursor-pointer" />
                          ) : (
                            <ToggleLeft className="h-10 w-10 text-gray-300 cursor-pointer" />
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Merchant UPI VPA ID</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. aura.boutique@okaxis"
                            value={localUpiId}
                            onChange={(e) => setLocalUpiId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono bg-white focus:outline-none focus:border-black"
                          />
                          <p className="text-[9px] text-gray-400 font-mono mt-1">Accepts any real handle: @okaxis, @ybl, @upi, etc.</p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Merchant Legal Display Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Aura & Co."
                            value={localUpiName}
                            onChange={(e) => setLocalUpiName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-black"
                          />
                          <p className="text-[9px] text-gray-400 font-mono mt-1">Legal name connected to your merchant bank KYC.</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                        >
                          Save UPI Gateway Settings
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* QR Code Real-Time Live Preview */}
                  <div className="w-full md:w-64 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center shrink-0">
                    <span className="font-mono text-[9px] font-bold tracking-widest text-indigo-600 uppercase mb-3">Live VPA QR Preview</span>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center justify-center relative w-[160px] h-[160px]">
                      {localUpiEnabled ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                            `upi://pay?pa=${localUpiId}&pn=${encodeURIComponent(localUpiName)}&am=5000&cu=INR&tn=Verification`
                          )}`}
                          alt="UPI Verification QR Code"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <AlertCircle className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                          <p className="text-[9px] text-gray-400">Gateway Disabled</p>
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-3 space-y-1">
                      <p className="font-semibold text-xs text-gray-900 truncate max-w-[200px]">{localUpiName || "No Name Set"}</p>
                      <p className="font-mono text-[9px] text-gray-400 truncate max-w-[200px]">{localUpiId || "No UPI ID Set"}</p>
                      <div className="bg-gray-100 px-2 py-0.5 rounded text-[8px] font-mono text-gray-500 inline-block">Demo Amount: ₹5,000 INR</div>
                    </div>
                  </div>
                </div>

                {/* Legal Playbook & Tech Specs */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 space-y-4">
                  <h4 className="font-display font-semibold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <Info className="h-4 w-4 text-indigo-600" />
                    <span>Accepting UPI Payments in India: Technical & Legal Compliance Blueprint</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 leading-relaxed">
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-bold text-gray-900 font-mono text-[10px] uppercase">1. Legal & RBI Compliance</h5>
                        <p className="text-gray-500 mt-1">
                          In India, Unified Payments Interface (UPI) is governed strictly by the **National Payments Corporation of India (NPCI)** and the **Reserve Bank of India (RBI)**.
                        </p>
                        <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-gray-400">
                          <li><strong>Merchant KYC:</strong> To legalise direct peer-to-merchant (P2M) payments, your VPA must link to a Current Bank Account with active Business KYC.</li>
                          <li><strong>GST Compliance:</strong> GST legislation mandates high-revenue merchants to embed UPI QR codes directly on invoices. For general sales, each purchase should be recorded alongside its unique 12-digit UPI Transaction Ref (UTR) number for tax auditing.</li>
                          <li><strong>IT Act Section 194O:</strong> E-commerce marketplaces operating in India are required to deduct 1% TDS on payment settlements to sub-merchants.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="font-bold text-gray-900 font-mono text-[10px] uppercase">2. Technical & Production Integration</h5>
                        <p className="text-gray-500 mt-1">
                          While visual static QR codes are excellent for instant wire transfers, high-scale digital checkouts necessitate automated deep-linking and webhooks.
                        </p>
                        <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-gray-400">
                          <li><strong>Mobile Intent Flows:</strong> On smartphones, instead of scanning a QR, the client triggers intent links (e.g., <code className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-[10px]">upi://pay?...</code>). This natively launches GPay, Paytm, or PhonePe apps immediately.</li>
                          <li><strong>Autopay Mandates:</strong> For subscriptions or recurring bills, UPI Autopay provides robust recurring e-mandates, requiring a secondary 2-Factor authentication pin.</li>
                          <li><strong>Automated Webhooks:</strong> Rather than manual UTR approvals, integrating gateways like Razorpay, Cashfree, or Paytm provides real-time transaction webhook updates, automatically converting pending orders to processing instantly.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky footer */}
          <div className="p-4 bg-white border-t border-[#e2e8f0] text-center text-[10px] text-gray-400 font-mono tracking-wider">
            AURA & CO. • Local Storage Sandbox Database Mode
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
