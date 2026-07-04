import React, { useState, useEffect } from "react";
import { X, Trash2, ArrowRight, Minus, Plus, ShoppingBag, CreditCard, Check, Ticket, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem, ShippingDetails } from "../types";
import { CurrencyCode, formatPrice } from "../utils/currency";
import { UpiSettings } from "./OwnerPanelModal";
import { User as FirebaseUser } from "firebase/auth";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onPlaceOrder: (shipping: ShippingDetails, promoDiscount: number) => void;
  currency: CurrencyCode;
  upiSettings?: UpiSettings;
  currentUser?: FirebaseUser | null;
  onOpenAuth?: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  currency,
  upiSettings,
  currentUser = null,
  onOpenAuth,
}: CartSidebarProps) {
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "confirm" | "paying">("cart");
  const [couponCode, setCouponCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0); // dollar discount
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  // Card secure inputs
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardError, setCardError] = useState("");
  const [paymentProcessStep, setPaymentProcessStep] = useState<number>(0);

  useEffect(() => {
    if (currentUser) {
      setShipping((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.displayName || "",
        email: prev.email || currentUser.email || "",
      }));
    }
  }, [currentUser]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [upiRefNo, setUpiRefNo] = useState("");
  const [upiFormError, setUpiFormError] = useState("");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatCardExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  // Payment simulated processing steps
  useEffect(() => {
    if (checkoutStep !== "paying") {
      setPaymentProcessStep(0);
      return;
    }

    const intervals = [1200, 1500, 1800, 1200];
    let currentStep = 0;

    const runSteps = () => {
      if (currentStep < 4) {
        setTimeout(() => {
          currentStep += 1;
          setPaymentProcessStep(currentStep);
          runSteps();
        }, intervals[currentStep]);
      } else {
        // Complete the order!
        setTimeout(() => {
          onPlaceOrder(shipping, discount);
          // Reset wizard
          setCheckoutStep("cart");
          setPromoDiscount(0);
          setCouponCode("");
          setCouponSuccess("");
          setPaymentMethod("card");
          setUpiRefNo("");
          setCardHolder("");
          setCardNumber("");
          setCardExpiry("");
          setCardCvc("");
          onClose();
        }, 1000);
      }
    };

    runSteps();
  }, [checkoutStep]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const discount = promoDiscount > 0 ? Math.min(promoDiscount, subtotal) : 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  const applyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    const normalized = couponCode.trim().toUpperCase();
    if (normalized === "AURA10") {
      setPromoDiscount(10);
      setCouponSuccess(`Promo code AURA10 applied: ${formatPrice(10, currency)} off your order!`);
    } else if (normalized === "WELCOME20") {
      setPromoDiscount(20);
      setCouponSuccess(`Promo code WELCOME20 applied: ${formatPrice(20, currency)} off your order!`);
    } else {
      setCouponError("Invalid or expired promo code. Try 'AURA10' or 'WELCOME20'!");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateShippingForm = () => {
    const errors: Record<string, string> = {};
    if (!shipping.fullName.trim()) errors.fullName = "Full name is required";
    if (!shipping.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(shipping.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!shipping.address.trim()) errors.address = "Street address is required";
    if (!shipping.city.trim()) errors.city = "City is required";
    if (!shipping.zipCode.trim()) errors.zipCode = "Zip code is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const proceedToShipping = () => {
    if (cartItems.length === 0) return;
    if (!currentUser) {
      onOpenAuth?.();
      return;
    }
    setCheckoutStep("shipping");
  };

  const proceedToConfirm = () => {
    if (!currentUser) {
      onOpenAuth?.();
      return;
    }
    if (validateShippingForm()) {
      setCheckoutStep("confirm");
    }
  };

  const startPaying = () => {
    if (!currentUser) {
      onOpenAuth?.();
      return;
    }

    if (paymentMethod === "card") {
      if (!cardHolder.trim()) {
        setCardError("Cardholder name is required.");
        return;
      }
      const rawNum = cardNumber.replace(/\s/g, "");
      if (rawNum.length !== 16) {
        setCardError("Card number must be exactly 16 digits.");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setCardError("Expiry must be in MM/YY format.");
        return;
      }
      const [month, year] = cardExpiry.split("/").map(Number);
      if (month < 1 || month > 12) {
        setCardError("Expiry month must be between 01 and 12.");
        return;
      }
      if (cardCvc.length < 3 || cardCvc.length > 4) {
        setCardError("CVC must be 3 or 4 digits.");
        return;
      }
      setCardError("");
    }

    setCheckoutStep("paying");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-out Sidebar Panel */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-[#faf9f6] shadow-2xl flex flex-col h-full border-l border-[#e2e8f0]"
          >
            {/* Header section with step indicator */}
            <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between">
              <div>
                <h2 className="font-display font-semibold text-lg text-gray-900">
                  {checkoutStep === "cart" && "Your Curated Bag"}
                  {checkoutStep === "shipping" && "Shipping Details"}
                  {checkoutStep === "confirm" && "Review & Submit"}
                  {checkoutStep === "paying" && "Processing Payment"}
                </h2>
                {/* Step Indicators */}
                <div className="flex items-center space-x-1.5 mt-2">
                  <div className={`h-1.5 w-8 rounded-full ${checkoutStep === "cart" ? "bg-black" : "bg-gray-200"}`} />
                  <div className={`h-1.5 w-8 rounded-full ${checkoutStep === "shipping" ? "bg-black" : "bg-gray-200"}`} />
                  <div className={`h-1.5 w-8 rounded-full ${checkoutStep === "confirm" ? "bg-black" : "bg-gray-200"}`} />
                  <div className={`h-1.5 w-8 rounded-full ${checkoutStep === "paying" ? "bg-black animate-pulse" : "bg-gray-200"}`} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main scrollable body */}
            <div className="flex-1 overflow-y-auto p-6">
              {checkoutStep === "cart" && (
                <>
                  {currentUser ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-900 text-xs flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">Profile Linked ({currentUser.displayName || currentUser.email})</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Option B</span>
                    </div>
                  ) : (
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-indigo-900 text-xs flex flex-col gap-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">✨ Sync & Secure Your Curation</span>
                        <span className="text-[9px] font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">Option A/B</span>
                      </div>
                      <p className="text-[11px] text-indigo-800 leading-relaxed">
                        Sign in to automatically synchronize your curated shopping bag and check past order history across devices!
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenAuth?.()}
                        className="w-full mt-1 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                      >
                        Authorize Profile Access
                      </button>
                    </div>
                  )}

                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-sm font-medium">Your shopping bag is completely empty.</p>
                      <button
                        onClick={onClose}
                        className="mt-4 text-xs font-semibold text-black underline hover:text-gray-600"
                      >
                        Browse Curated Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {item.name}
                            </h4>
                            {item.selectedOption && (
                              <p className="font-mono text-[10px] text-gray-400 mt-0.5">
                                {item.optionName}: {item.selectedOption}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2.5">
                              {/* Quantity Control Buttons */}
                              <div className="flex items-center border border-[#e2e8f0] rounded-md bg-white">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, -1)}
                                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-l"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="px-2.5 font-mono text-xs text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, 1)}
                                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-r"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center space-x-3">
                                <span className="font-mono text-xs font-semibold text-gray-900">
                                  {formatPrice(item.price * item.quantity, currency)}
                                </span>
                                <button
                                  onClick={() => onRemoveItem(item.id)}
                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                  title="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Promo Code section */}
                      <div className="pt-4 mt-6 border-t border-gray-100">
                        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-2">
                          Have a promotional coupon?
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="e.g. AURA10, WELCOME20"
                            className="flex-1 px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs placeholder-gray-400 uppercase tracking-widest focus:outline-none focus:border-black"
                          />
                          <button
                            onClick={applyCoupon}
                            className="px-4 py-1.5 bg-gray-200 hover:bg-black hover:text-white transition-colors rounded-lg text-xs font-semibold"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                            <span>{couponError}</span>
                          </p>
                        )}
                        {couponSuccess && (
                          <p className="text-emerald-600 text-xs mt-1.5 font-medium flex items-center gap-1">
                            <span>{couponSuccess}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {checkoutStep === "shipping" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shipping.fullName}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className={`w-full px-4 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:border-black ${
                        formErrors.fullName ? "border-red-500" : "border-[#e2e8f0]"
                      }`}
                    />
                    {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={shipping.email}
                      onChange={handleInputChange}
                      placeholder="jane.doe@example.com"
                      className={`w-full px-4 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:border-black ${
                        formErrors.email ? "border-red-500" : "border-[#e2e8f0]"
                      }`}
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={shipping.address}
                      onChange={handleInputChange}
                      placeholder="123 Serene Valley Rd"
                      className={`w-full px-4 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:border-black ${
                        formErrors.address ? "border-red-500" : "border-[#e2e8f0]"
                      }`}
                    />
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={shipping.city}
                        onChange={handleInputChange}
                        placeholder="Portland"
                        className={`w-full px-4 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:border-black ${
                          formErrors.city ? "border-red-500" : "border-[#e2e8f0]"
                        }`}
                      />
                      {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Zip Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shipping.zipCode}
                        onChange={handleInputChange}
                        placeholder="97201"
                        className={`w-full px-4 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:border-black ${
                          formErrors.zipCode ? "border-red-500" : "border-[#e2e8f0]"
                        }`}
                      />
                      {formErrors.zipCode && <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-6 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                      🔒 Secured Checkout Simulation. No real money will be charged. Place order to simulate shipment timelines.
                    </p>
                  </div>
                </div>
              )}

              {checkoutStep === "confirm" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Deliver To:
                    </h3>
                    <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] text-sm space-y-1">
                      <p className="font-semibold text-gray-900">{shipping.fullName}</p>
                      <p className="text-gray-600">{shipping.email}</p>
                      <p className="text-gray-600">{shipping.address}</p>
                      <p className="text-gray-600">{shipping.city}, {shipping.zipCode}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Order Breakdown:
                    </h3>
                    <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs text-gray-600">
                          <span className="truncate max-w-[200px] font-medium">
                            {item.name} <span className="text-gray-400 font-mono">x{item.quantity}</span>
                          </span>
                          <span className="font-mono">{formatPrice(item.price * item.quantity, currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  {upiSettings?.enabled ? (
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                        Choose Payment Option:
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card")}
                          className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                            paymentMethod === "card"
                              ? "border-black bg-black text-white shadow-sm"
                              : "border-[#e2e8f0] bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          <span>💳 Card Payment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("upi")}
                          className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                            paymentMethod === "upi"
                              ? "border-black bg-black text-white shadow-sm"
                              : "border-[#e2e8f0] bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          <span>🇮🇳 UPI QR Code</span>
                        </button>
                      </div>

                      {paymentMethod === "card" ? (
                        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider">
                              Stripe secure payment inputs
                            </span>
                            <div className="flex gap-1 text-[10px] font-mono font-bold text-gray-400">
                              <span>VISA</span>
                              <span>•</span>
                              <span>MC</span>
                              <span>•</span>
                              <span>AMEX</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider mb-1">
                                Cardholder Name
                              </label>
                              <input
                                type="text"
                                placeholder="Jane Doe"
                                value={cardHolder}
                                onChange={(e) => {
                                  setCardHolder(e.target.value);
                                  setCardError("");
                                }}
                                className="w-full px-3 py-2 bg-[#faf9f6] border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black"
                              />
                            </div>

                            <div className="p-3 bg-[#faf9f6] border border-gray-200 rounded-lg space-y-3 relative">
                              <div className="absolute right-2 top-2 bg-indigo-50 text-indigo-600 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                                stripe.js iframe
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono font-bold uppercase text-gray-400 tracking-wider mb-1">
                                  Card Number
                                </label>
                                <input
                                  type="text"
                                  placeholder="4242 4242 4242 4242"
                                  maxLength={19}
                                  value={cardNumber}
                                  onChange={(e) => {
                                    setCardNumber(formatCardNumber(e.target.value));
                                    setCardError("");
                                  }}
                                  className="w-full bg-transparent text-xs font-mono tracking-widest focus:outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                <div>
                                  <label className="block text-[9px] font-mono font-bold uppercase text-gray-400 tracking-wider mb-1">
                                    Expiration Date
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="MM / YY"
                                    maxLength={5}
                                    value={cardExpiry}
                                    onChange={(e) => {
                                      setCardExpiry(formatCardExpiry(e.target.value));
                                      setCardError("");
                                    }}
                                    className="w-full bg-transparent text-xs font-mono tracking-widest focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-mono font-bold uppercase text-gray-400 tracking-wider mb-1">
                                    CVC
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="•••"
                                    maxLength={4}
                                    value={cardCvc}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, "");
                                      setCardCvc(val);
                                      setCardError("");
                                    }}
                                    className="w-full bg-transparent text-xs font-mono tracking-widest focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-[10px] text-gray-400 leading-normal flex gap-1.5 items-start">
                            <span className="text-emerald-500 font-bold">🔒</span>
                            <span>
                              Aura & Co. complies fully with PCI-DSS. Raw card numbers are tokenized in the Stripe Elements sandbox iframe and never touch our servers.
                            </span>
                          </div>

                          {cardError && (
                            <p className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-[10px] font-medium rounded-lg">
                              ⚠️ {cardError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl space-y-4">
                          <div className="text-center">
                            <span className="bg-indigo-50 text-indigo-700 text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                              Indian UPI instant settlement
                            </span>
                          </div>

                          {/* Calculate UPI INR amount */}
                          {(() => {
                            const rate = currency === "USD" ? 83.5 : currency === "EUR" ? 90.0 : currency === "GBP" ? 106.0 : 1;
                            const inrAmount = Math.round(total * rate);
                            const upiUri = `upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.upiName)}&am=${inrAmount}&cu=INR&tn=AuraOrder`;
                            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;

                            return (
                              <div className="space-y-4 flex flex-col items-center">
                                <div className="text-center space-y-0.5">
                                  <p className="font-semibold text-xs text-gray-900">{upiSettings.upiName}</p>
                                  <p className="font-mono text-[9px] text-gray-500">{upiSettings.upiId}</p>
                                  <p className="text-sm font-bold text-emerald-600 font-mono mt-1">
                                    ₹{inrAmount.toLocaleString("en-IN")} INR
                                  </p>
                                  <p className="text-[9px] text-gray-400 font-mono">
                                    Converted from {formatPrice(total, currency)} at 1 {currency} = ₹{rate} INR
                                  </p>
                                </div>
                                <div className="hidden md:flex bg-gray-50 p-2 rounded-lg border border-gray-100 items-center justify-center w-[160px] h-[160px]">
                                  <img
                                    src={qrCodeUrl}
                                    alt="UPI Payment QR Code"
                                    className="w-full h-full object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                
                                <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 space-y-1 text-center font-medium">
                                  <p>📱 Mobile: Deep-linking allows direct redirection to your payment apps.</p>
                                  <p>💻 Desktop: Scan the QR code using BHIM, GPay, PhonePe or Paytm.</p>
                                </div>

                                <a
                                  href={upiUri}
                                  className="w-full md:hidden py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                                >
                                  <span>Pay with UPI App</span>
                                </a>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider">
                          Stripe secure payment inputs
                        </span>
                        <div className="flex gap-1 text-[10px] font-mono font-bold text-gray-400">
                          <span>VISA</span>
                          <span>•</span>
                          <span>MC</span>
                          <span>•</span>
                          <span>AMEX</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            placeholder="Jane Doe"
                            value={cardHolder}
                            onChange={(e) => {
                              setCardHolder(e.target.value);
                              setCardError("");
                            }}
                            className="w-full px-3 py-2 bg-[#faf9f6] border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black"
                          />
                        </div>

                        <div className="p-3 bg-[#faf9f6] border border-gray-200 rounded-lg space-y-3 relative">
                          <div className="absolute right-2 top-2 bg-indigo-50 text-indigo-600 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                            stripe.js iframe
                          </div>

                          <div>
                            <label className="block text-[9px] font-mono font-bold uppercase text-gray-400 tracking-wider mb-1">
                              Card Number
                            </label>
                            <input
                              type="text"
                              placeholder="4242 4242 4242 4242"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => {
                                setCardNumber(formatCardNumber(e.target.value));
                                setCardError("");
                              }}
                              className="w-full bg-transparent text-xs font-mono tracking-widest focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                              <label className="block text-[9px] font-mono font-bold uppercase text-gray-400 tracking-wider mb-1">
                                Expiration Date
                              </label>
                              <input
                                type="text"
                                placeholder="MM / YY"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => {
                                  setCardExpiry(formatCardExpiry(e.target.value));
                                  setCardError("");
                                }}
                                className="w-full bg-transparent text-xs font-mono tracking-widest focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono font-bold uppercase text-gray-400 tracking-wider mb-1">
                                CVC
                              </label>
                              <input
                                type="text"
                                placeholder="•••"
                                maxLength={4}
                                value={cardCvc}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  setCardCvc(val);
                                  setCardError("");
                                }}
                                className="w-full bg-transparent text-xs font-mono tracking-widest focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-gray-400 leading-normal flex gap-1.5 items-start">
                        <span className="text-emerald-500 font-bold">🔒</span>
                        <span>
                          Aura & Co. complies fully with PCI-DSS. Raw card numbers are tokenized in the Stripe Elements sandbox iframe and never touch our servers.
                        </span>
                      </div>

                      {cardError && (
                        <p className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-[10px] font-medium rounded-lg">
                          ⚠️ {cardError}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setCheckoutStep("shipping")}
                    className="text-xs font-semibold text-[#1a1a1a] underline cursor-pointer hover:text-gray-600"
                  >
                    Edit Shipping Information
                  </button>
                </div>
              )}

              {checkoutStep === "paying" && (
                <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="relative">
                    {/* Pulsing secure lock animation */}
                    <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl scale-125 animate-pulse" />
                    <div className="relative bg-white border border-indigo-100 p-5 rounded-full shadow-md text-indigo-600">
                      <CreditCard className="h-8 w-8 animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-base text-gray-900">Secure Checkout in Progress</h3>
                    <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                      We are processing your payment securely with standard PCI DSS end-to-end cryptographic flows.
                    </p>
                  </div>

                  {/* High fidelity log container mimicking real backend webhook verification */}
                  <div className="w-full bg-[#1a1a1a] text-[#a7f3d0] font-mono text-[10px] p-4 rounded-xl shadow-inner text-left space-y-2 border border-neutral-800">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 mb-1 text-gray-500">
                      <span>GATEWAY JOURNAL (SANDBOX)</span>
                      <span className="text-[9px] animate-pulse">● LIVE CONNECTION</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={paymentProcessStep >= 0 ? "text-emerald-400 font-bold" : "text-gray-600"}>
                        {paymentProcessStep > 0 ? "✓" : "▶"}
                      </span>
                      <span className={paymentProcessStep >= 0 ? "text-gray-100" : "text-gray-500"}>
                        [0] Creating Stripe secure elements token...
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={paymentProcessStep >= 1 ? "text-emerald-400 font-bold" : "text-gray-600"}>
                        {paymentProcessStep > 1 ? "✓" : paymentProcessStep === 1 ? "▶" : "○"}
                      </span>
                      <span className={paymentProcessStep >= 1 ? "text-gray-100" : "text-gray-500"}>
                        [1] Transmitting secure token to gateway node...
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={paymentProcessStep >= 2 ? "text-emerald-400 font-bold" : "text-gray-600"}>
                        {paymentProcessStep > 2 ? "✓" : paymentProcessStep === 2 ? "▶" : "○"}
                      </span>
                      <span className={paymentProcessStep >= 2 ? "text-gray-100" : "text-gray-500"}>
                        [2] Awaiting cryptographic Webhook Mirror...
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={paymentProcessStep >= 3 ? "text-emerald-400 font-bold" : "text-gray-600"}>
                        {paymentProcessStep > 3 ? "✓" : paymentProcessStep === 3 ? "▶" : "○"}
                      </span>
                      <span className={paymentProcessStep >= 3 ? "text-gray-100" : "text-gray-500"}>
                        [3] Verifying payment.intent.succeeded payload...
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={paymentProcessStep >= 4 ? "text-emerald-400 font-bold" : "text-gray-600"}>
                        {paymentProcessStep === 4 ? "▶" : "○"}
                      </span>
                      <span className={paymentProcessStep >= 4 ? "text-emerald-400 font-semibold" : "text-gray-500"}>
                        [4] Webhook verified! Finalizing order ledger...
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-400 leading-relaxed max-w-xs">
                    ℹ️ Do not close this panel. A cryptographically verified webhook callback from the gateway triggers the official database write.
                  </div>
                </div>
              )}
            </div>

            {/* Static calculations & dynamic checkout trigger button footer */}
            {cartItems.length > 0 && checkoutStep !== "paying" && (
              <div className="p-6 border-t border-[#e2e8f0] bg-white space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(subtotal, currency)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                      <span>Promo Discount</span>
                      <span className="font-mono">-{formatPrice(discount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-semibold uppercase font-mono text-xs">Free Shipping</span>
                    ) : (
                      <span className="font-mono">{formatPrice(shippingFee, currency)}</span>
                    )}
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-[10px] text-gray-400">Add {formatPrice(150 - subtotal, currency)} more for free shipping!</p>
                  )}
                  <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total Amount</span>
                    <span className="font-mono">{formatPrice(total, currency)}</span>
                  </div>
                </div>

                {/* Main Action Call Trigger Button */}
                {checkoutStep === "cart" && (
                  <div className="space-y-3">
                    {!currentUser && (
                      <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-[11px] text-amber-800 font-medium">
                          ⚠️ Profile Authentication Required to Checkout
                        </p>
                      </div>
                    )}
                    <button
                      onClick={proceedToShipping}
                      className="w-full py-4 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                    >
                      <span>{currentUser ? "Proceed to Shipping" : "Sign In to Checkout"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {checkoutStep === "shipping" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCheckoutStep("cart")}
                      className="flex-1 py-3 border border-[#e2e8f0] hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={proceedToConfirm}
                      className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl transition-all"
                    >
                      Confirm Order
                    </button>
                  </div>
                )}

                {checkoutStep === "confirm" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCheckoutStep("shipping")}
                      className="flex-1 py-3 border border-[#e2e8f0] hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={startPaying}
                      className="flex-1 py-4 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Place Secure Order</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
