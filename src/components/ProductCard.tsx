import React from "react";
import { Star, ArrowRight, Eye, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../products";
import { CurrencyCode, formatPrice } from "../utils/currency";

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  currency: CurrencyCode;
}

export default function ProductCard({
  product,
  onViewDetails,
  onQuickAdd,
  currency,
}: ProductCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group bg-white border border-[#e2e8f0] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 border-b border-[#e2e8f0]">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#1a1a1a] font-mono text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border border-gray-100 tracking-wider shadow-sm">
          {product.category}
        </span>

        {/* Quick action buttons overlays */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={() => onViewDetails(product)}
            className="flex items-center gap-1 bg-white hover:bg-black hover:text-white text-[#1a1a1a] text-xs font-semibold px-3 py-2 rounded-full shadow-md transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Details</span>
          </button>
          <button
            onClick={() => onQuickAdd(product)}
            className="flex items-center gap-1 bg-black hover:bg-white hover:text-black text-white text-xs font-semibold px-3 py-2 rounded-full shadow-md transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? "fill-current"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] text-gray-500">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-medium text-base text-gray-900 line-clamp-1 group-hover:text-black transition-colors">
            {product.name}
          </h3>

          {/* Slogan Description */}
          <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action button */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
          <span className="font-mono font-semibold text-gray-900">
            {formatPrice(product.price, currency)}
          </span>

          <button
            onClick={() => onViewDetails(product)}
            className="flex items-center gap-1 text-xs font-medium text-gray-900 group-hover:translate-x-1 transition-transform cursor-pointer"
          >
            <span>Explore</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
