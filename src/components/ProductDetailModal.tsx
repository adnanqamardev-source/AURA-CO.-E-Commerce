import React, { useState } from "react";
import { X, Star, Check, ShoppingBag, Info, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../products";
import { CurrencyCode, formatPrice } from "../utils/currency";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedOption?: string) => void;
  currency: CurrencyCode;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  currency,
}: ProductDetailModalProps) {
  if (!product) return null;

  const [selectedOption, setSelectedOption] = useState<string>(
    product.options?.values[0] || ""
  );
  const [activeTab, setActiveTab] = useState<"details" | "specs" | "reviews">(
    "details"
  );
  const [addedMessage, setAddedMessage] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedOption);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  };

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

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-[#faf9f6] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-[#e2e8f0] flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md hover:bg-black hover:text-white rounded-full transition-all border border-gray-100 shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Column: Image Section */}
          <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-[#e2e8f0] h-[300px] md:h-auto">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-4 left-4 bg-black text-white font-mono text-[9px] tracking-widest uppercase px-3 py-1 rounded">
              {product.category}
            </span>
          </div>

          {/* Right Column: Information Section */}
          <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between max-h-[60vh] md:max-h-[90vh]">
            <div>
              {/* Star Rating Header */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating) ? "fill-current" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs text-gray-500">
                  {product.rating} stars / {product.reviewCount} customer reviews
                </span>
              </div>

              {/* Title and Price */}
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 leading-tight">
                {product.name}
              </h2>
              <div className="font-mono text-xl font-bold mt-2 text-[#1a1a1a]">
                {formatPrice(product.price, currency)}
              </div>

              {/* Tagline Description */}
              <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Interactive Color/Style Options */}
              {product.options && (
                <div className="mt-6">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                    Select {product.options.name}:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.options.values.map((val) => (
                      <button
                        key={val}
                        onClick={() => setSelectedOption(val)}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                          selectedOption === val
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-gray-700 border-[#e2e8f0] hover:border-gray-900"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specification Tabs */}
              <div className="mt-8 border-b border-[#e2e8f0] flex space-x-6 text-sm font-medium">
                {(["details", "specs", "reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 capitalize transition-all relative ${
                      activeTab === tab ? "text-black font-semibold" : "text-gray-400 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeModalTab"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Dynamic Tab Content Panel */}
              <div className="py-4 text-sm text-gray-600 min-h-[140px]">
                {activeTab === "details" && (
                  <ul className="space-y-2.5">
                    {product.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === "specs" && (
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {Object.entries(product.specs).map(([key, val]) => (
                        <tr key={key} className="border-b border-gray-100 last:border-0">
                          <td className="py-2.5 font-mono text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">
                            {key}
                          </td>
                          <td className="py-2.5 text-gray-900 font-medium">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    {product.reviews.map((review, idx) => (
                      <div key={idx} className="border-b border-gray-100 last:border-0 pb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-gray-900 text-xs">
                            {review.author}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400">
                            {review.date}
                          </span>
                        </div>
                        <div className="flex text-amber-400 mb-1">
                          {Array.from({ length: 5 }).map((_, rIdx) => (
                            <Star
                              key={rIdx}
                              className={`h-3 w-3 ${
                                rIdx < review.rating ? "fill-current" : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed italic">
                          "{review.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky/Bottom Footer: Add to Cart */}
            <div className="pt-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAdd}
                className="w-full py-4 bg-black hover:bg-neutral-800 text-white font-medium rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Add to Shopping Cart — {formatPrice(product.price, currency)}</span>
              </button>

              <AnimatePresence>
                {addedMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white px-5 py-3 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2"
                  >
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Added to your curated cart!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
