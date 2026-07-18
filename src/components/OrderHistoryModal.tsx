import React from "react";
import { X, Check, Clock, Truck, Award, ShoppingBag, Eye, ShieldCheck, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Order } from "../types";
import { CurrencyCode, formatPrice } from "../utils/currency";

interface OrderTrackerProps {
  key?: string;
  order: Order;
  onViewProductDetails: (productId: string) => void;
  currency: CurrencyCode;
}

function OrderTracker({ order, onViewProductDetails, currency }: OrderTrackerProps) {
  const [currentStatus, setCurrentStatus] = React.useState<"Processing" | "Shipped" | "Delivered">(order.status);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [speed, setSpeed] = React.useState<"normal" | "fast">("normal");

  const intervalDuration = speed === "normal" ? 3000 : 1200;

  React.useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isSimulating) {
      timer = setInterval(() => {
        setCurrentStatus((prev) => {
          if (prev === "Processing") return "Shipped";
          if (prev === "Shipped") return "Delivered";
          return "Processing"; // loops back
        });
      }, intervalDuration);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulating, intervalDuration]);

  const getProgressWidth = (status: "Processing" | "Shipped" | "Delivered") => {
    switch (status) {
      case "Processing": return "15%";
      case "Shipped": return "60%";
      case "Delivered": return "100%";
      default: return "0%";
    }
  };

  const getStepState = (status: "Processing" | "Shipped" | "Delivered", stepKey: "Processing" | "Shipped" | "Delivered") => {
    const orderOfSteps = ["Processing", "Shipped", "Delivered"];
    const currentIndex = orderOfSteps.indexOf(status);
    const stepIndex = orderOfSteps.indexOf(stepKey);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const STATUS_STEPS = [
    {
      key: "Processing" as const,
      label: "Processing",
      description: "Artisanal preparation & quality curation",
      icon: ShieldCheck,
      colorClass: "text-blue-600 bg-blue-50 border-blue-200",
      activeColorClass: "bg-blue-600 text-white shadow-lg shadow-blue-200",
    },
    {
      key: "Shipped" as const,
      label: "Shipped",
      description: "Dispatched from Mumbai Hub",
      icon: Truck,
      colorClass: "text-amber-600 bg-amber-50 border-amber-200",
      activeColorClass: "bg-amber-600 text-white shadow-lg shadow-amber-200",
    },
    {
      key: "Delivered" as const,
      label: "Delivered",
      description: "Safely received & completed",
      icon: Check,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
      activeColorClass: "bg-emerald-600 text-white shadow-lg shadow-emerald-200",
    }
  ];

  const getAccumulatedLogs = (status: "Processing" | "Shipped" | "Delivered") => {
    const logs: { time: string; text: string; icon: any; color: string }[] = [];

    // Confirmed logs (always present)
    logs.push(
      { time: "09:30 AM", text: "Secure payment verified by Aura Merchant.", icon: ShieldCheck, color: "text-emerald-500" },
      { time: "10:15 AM", text: "Quality curated package prepared by boutique artisans.", icon: Clock, color: "text-blue-500" }
    );

    if (status === "Shipped" || status === "Delivered") {
      logs.push(
        { time: "02:00 PM", text: "Scanned & dispatched from central logistics center.", icon: Truck, color: "text-amber-500" },
        { time: "05:30 PM", text: "Departure scan; transit underway to customer hub.", icon: Truck, color: "text-amber-500" }
      );
    }

    if (status === "Delivered") {
      logs.push(
        { time: "09:45 AM", text: "Assigned to delivery courier agent for dispatch.", icon: Truck, color: "text-emerald-500" },
        { time: "02:15 PM", text: "Secure delivery completed & receipt updated.", icon: Check, color: "text-emerald-600" }
      );
    }

    return [...logs].reverse();
  };

  const loyaltyPointsEarned = Math.floor(order.subtotal / 10) * 10;

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-xs">
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

      {/* HORIZONTAL STEPPER BANNER */}
      <div className="p-4 md:px-8 bg-gray-50/20 border-b border-gray-100">
        <div className="max-w-xl mx-auto my-3 relative">
          {/* Background Line */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 rounded-full" />
          
          {/* Animated Progress Line */}
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `calc(${getProgressWidth(currentStatus)} - 32px)` }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          />

          <div className="relative flex justify-between items-center">
            {STATUS_STEPS.map((step) => {
              const state = getStepState(currentStatus, step.key);
              const StepIcon = step.icon;

              return (
                <button
                  key={step.key}
                  onClick={() => {
                    setCurrentStatus(step.key);
                    setIsSimulating(false); // pause play when manually override
                  }}
                  className="flex flex-col items-center focus:outline-none z-10 group"
                  title={`Change status to ${step.label}`}
                >
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                      state === "active"
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                        : state === "completed"
                        ? "bg-emerald-50 border-emerald-50 text-white"
                        : "bg-white border-gray-300 text-gray-400 group-hover:border-gray-400"
                    }`}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {state === "active" ? (
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
                        <StepIcon className="h-3.5 w-3.5 relative z-10" />
                      </span>
                    ) : state === "completed" ? (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    ) : (
                      <StepIcon className="h-3.5 w-3.5" />
                    )}
                  </motion.div>
                  <span className={`text-[9px] font-mono mt-1.5 transition-colors ${
                    state === "active"
                      ? "text-emerald-700 font-bold"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order main items & tracking details content */}
      <div className="p-4 md:p-5 grid md:grid-cols-12 gap-6">
        
        {/* Left: Items list */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
              Purchased Items ({order.items.length})
            </h4>
          </div>
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
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
                className="self-center p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all"
                title="Review item details"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Simulated Shipment Console */}
        <div className="md:col-span-5 md:border-l border-gray-100 md:pl-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
              Interactive Tracking Console
            </h4>
            
            {/* Play/Pause controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`p-1 rounded-md border text-[10px] font-mono font-medium flex items-center gap-1 transition-all ${
                  isSimulating
                    ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
                title={isSimulating ? "Pause Simulation" : "Start Auto Simulation"}
              >
                {isSimulating ? (
                  <>
                    <Pause className="h-2.5 w-2.5 text-amber-600 fill-amber-600 animate-pulse" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-2.5 w-2.5 text-gray-600 fill-gray-600" />
                    <span>Simulate</span>
                  </>
                )}
              </button>

              {/* Speed toggle */}
              <button
                onClick={() => setSpeed(speed === "normal" ? "fast" : "normal")}
                className="px-1.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-[9px] font-mono text-gray-500 transition-all"
                title="Simulation speed interval"
              >
                {speed === "normal" ? "1x (3s)" : "2.5x (1.2s)"}
              </button>
            </div>
          </div>

          {/* Current state box with summary */}
          <div className="bg-[#faf9f6] p-3 rounded-lg border border-[#e2e8f0] relative overflow-hidden">
            <div className="absolute right-2 top-2">
              {isSimulating && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`p-1 rounded-md border ${
                currentStatus === "Delivered"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : currentStatus === "Shipped"
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}>
                {currentStatus === "Delivered" ? (
                  <Check className="h-3 w-3" />
                ) : currentStatus === "Shipped" ? (
                  <Truck className="h-3 w-3" />
                ) : (
                  <ShieldCheck className="h-3 w-3" />
                )}
              </span>
              <div>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  Active Stage
                </p>
                <h5 className="text-xs font-semibold text-gray-800">
                  {currentStatus === "Delivered" && "Package Delivered"}
                  {currentStatus === "Shipped" && "Package In-Transit"}
                  {currentStatus === "Processing" && "Preparing & Curation"}
                </h5>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 leading-normal mt-2">
              {currentStatus === "Delivered" && "Your fine luxury selection has been hand-delivered and signed securely. Enjoy your boutique items."}
              {currentStatus === "Shipped" && "Package has left the warehouse. Dynamic tracking signals departure scan from central transport dispatch."}
              {currentStatus === "Processing" && "Aura boutique designers are validating credentials, performing quality controls, and curating customized luxury packing."}
            </p>
          </div>

          {/* Detailed logs terminal */}
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            <h5 className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">
              Live Delivery Log Feed:
            </h5>
            <div className="space-y-2 pl-2 border-l border-gray-100">
              <AnimatePresence initial={false}>
                {getAccumulatedLogs(currentStatus).map((log, index) => {
                  const LogIcon = log.icon;
                  return (
                    <motion.div
                      key={log.text}
                      initial={{ opacity: 0, x: -10, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-2 text-[10px] leading-relaxed relative"
                    >
                      {index === 0 && (
                        <div className="absolute -left-[11px] top-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      )}
                      <span className="font-mono text-gray-400 shrink-0 mt-0.5">{log.time}</span>
                      <span className={`shrink-0 mt-0.5 ${log.color}`}>
                        <LogIcon className="h-3 w-3" />
                      </span>
                      <span className="text-gray-600 font-sans">{log.text}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

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
              orders.map((order) => (
                <OrderTracker
                  key={order.id}
                  order={order}
                  onViewProductDetails={onViewProductDetails}
                  currency={currency}
                />
              ))
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
