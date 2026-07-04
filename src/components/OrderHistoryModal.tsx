import React from "react";
import { X, Check, Clock, Truck, Award, ShoppingBag, Eye, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Order } from "../types";
import { CurrencyCode, formatPrice } from "../utils/currency";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onViewProductDetails: (productId: string) => void;
  currency: CurrencyCode;
}

export default function OrderHistoryModal({
  isOpen,
  onClose,
  orders,
  onViewProductDetails,
  currency,
}: OrderHistoryModalProps) {
  if (!isOpen) return null;

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

        {/* Modal Main container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#faf9f6] w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[85vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white hover:bg-black hover:text-white rounded-full transition-all border border-[#e2e8f0]"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header Title section */}
          <div className="p-6 md:p-8 border-b border-[#e2e8f0] bg-white">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-gray-900 flex items-center gap-2">
              <Clock className="h-5.5 w-5.5 text-gray-700" />
              <span>Your Boutique Order History</span>
            </h2>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              Track delivery logs, simulate shipment intervals, and check loyalty milestones.
            </p>
          </div>

          {/* Order listing body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            {orders.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm font-medium">You haven't placed any boutique orders yet.</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                  Go ahead and add items to your cart, fill in shipping details, and secure your first checkout!
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const loyaltyPointsEarned = Math.floor(order.subtotal / 10) * 10;
                
                return (
                  <div key={order.id} className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-xs">
                    {/* Top Order header information */}
                    <div className="p-4 md:p-5 bg-gray-50/50 border-b border-[#e2e8f0] flex flex-col sm:flex-row justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900">ORDER {order.id}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                          <span className="text-gray-500">{order.date}</span>
                        </div>
                        <p className="text-gray-400 font-mono mt-1 text-[10px]">
                          TRACKING NO: <span className="font-semibold text-gray-600">{order.trackingNumber}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right sm:text-left">
                          <span className="text-gray-500 block text-[10px] font-mono">Loyalty Reward Points</span>
                          <span className="font-semibold text-amber-700 font-mono flex items-center justify-end sm:justify-start gap-1">
                            <Award className="h-3 w-3" />
                            +{loyaltyPointsEarned} pts
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500 block text-[10px] font-mono">Total paid</span>
                          <span className="font-semibold text-gray-900 font-mono">{formatPrice(order.total, currency)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order main items content */}
                    <div className="p-4 md:p-5 grid md:grid-cols-12 gap-6">
                      
                      {/* Left: Items list */}
                      <div className="md:col-span-7 space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs text-gray-900 truncate">
                                {item.name}
                              </h4>
                              {item.selectedOption && (
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                  {item.optionName}: {item.selectedOption}
                                </p>
                              )}
                              <p className="text-[10px] text-gray-500 font-mono mt-1">
                                {item.quantity} x {formatPrice(item.price, currency)}
                              </p>
                            </div>
                            <button
                              onClick={() => onViewProductDetails(item.productId)}
                              className="self-center p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900"
                              title="Review item details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Right: Simulated Shipment Timeline & Tracking Logs */}
                      <div className="md:col-span-5 md:border-l border-gray-100 md:pl-6 space-y-4">
                        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
                          Simulated Tracking Status:
                        </h4>

                        <div className="relative pl-6 space-y-4">
                          {/* Vertical timeline connector */}
                          <div className="absolute top-1 bottom-1 left-2 w-0.5 bg-gray-200" />

                          {/* Shipment timeline step 3 */}
                          <div className="relative">
                            <div className={`absolute -left-[21px] p-0.5 rounded-full ${order.status === "Delivered" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-400"}`}>
                              <Check className="h-3 w-3" />
                            </div>
                            <div>
                              <p className={`text-xs font-semibold ${order.status === "Delivered" ? "text-emerald-800" : "text-gray-400"}`}>
                                Delivered
                              </p>
                              <p className="text-[10px] text-gray-400 leading-normal">
                                Shipment successfully left at front door or porch mailbox.
                              </p>
                            </div>
                          </div>

                          {/* Shipment timeline step 2 */}
                          <div className="relative">
                            <div className={`absolute -left-[21px] p-0.5 rounded-full ${order.status === "Shipped" || order.status === "Delivered" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-400"}`}>
                              <Truck className="h-3 w-3" />
                            </div>
                            <div>
                              <p className={`text-xs font-semibold ${order.status === "Shipped" || order.status === "Delivered" ? "text-amber-800" : "text-gray-400"}`}>
                                Shipped & In-Transit
                              </p>
                              <p className="text-[10px] text-gray-400 leading-normal">
                                Departure scan at central logistics fulfillment center.
                              </p>
                            </div>
                          </div>

                          {/* Shipment timeline step 1 */}
                          <div className="relative font-sans">
                            <div className="absolute -left-[21px] p-0.5 rounded-full bg-blue-100 text-blue-800">
                              <ShieldCheck className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-blue-800">
                                Order Confirmed & Packing
                              </p>
                              <p className="text-[10px] text-gray-400 leading-normal">
                                Payment authorized successfully. Curating custom packaging.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky footer info */}
          <div className="p-4 bg-white border-t border-[#e2e8f0] text-center text-[10px] text-gray-400 font-mono tracking-wider">
            Aura & Co. • Simulated Shipping Engine • Standard Local Storage Persistence
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
