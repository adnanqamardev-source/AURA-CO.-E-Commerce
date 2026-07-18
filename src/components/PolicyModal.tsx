import React from "react";
import { X, Shield, ScrollText, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PolicyModalProps {
  type: "terms" | "privacy" | null;
  onClose: () => void;
}

export default function PolicyModal({ type, onClose }: PolicyModalProps) {
  if (!type) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black text-white rounded-lg">
                {type === "terms" ? (
                  <ScrollText className="h-5 w-5" />
                ) : (
                  <Shield className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-sans font-medium text-base text-gray-900">
                  {type === "terms" ? "Terms & Conditions" : "Privacy Policy"}
                </h3>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  Last Updated: July 2026 • Version 1.2
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-8 overflow-y-auto space-y-6 text-sm text-gray-600 leading-relaxed max-h-[50vh]">
            {type === "terms" ? (
              <>
                <section className="space-y-2">
                  <h4 className="font-sans font-medium text-xs text-gray-900 uppercase tracking-wider font-mono">
                    1. Introduction & Agreement
                  </h4>
                  <p className="text-xs">
                    Welcome to AURA & CO. By accessing our platform, browsing our boutique products, or placing an order, you agree to comply with and be bound by these Terms and Conditions. Please review them carefully.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-sans font-medium text-xs text-gray-900 uppercase tracking-wider font-mono">
                    2. Purchases & Currency Payments
                  </h4>
                  <p className="text-xs">
                    All prices are dynamically listed according to your local currency choice (USD or INR). Payment transactions made via our tokenized credit card processors or direct UPI Gateways are secured, encrypted, and processed instantly. Orders will only be processed upon clear confirmation of funds.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-sans font-medium text-xs text-gray-900 uppercase tracking-wider font-mono">
                    3. Fulfillment & Deliveries
                  </h4>
                  <p className="text-xs">
                    We process orders with absolute precision within 1-2 business days. Delivery dates are estimated and depend entirely on the courier services. Tracking numbers are assigned directly once products are handed off to our logistics partners.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-sans font-medium text-xs text-gray-900 uppercase tracking-wider font-mono">
                    4. Loyalty Points Rewards
                  </h4>
                  <p className="text-xs">
                    Customers participating in our Loyalty Tier earn 10 points for every $10 of transaction value. These points are tracked locally or securely linked in our cloud database for authenticated accounts. Loyalty rebates are redeemable in accordance with current catalog promotions.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-sans font-medium text-xs text-gray-900 uppercase tracking-wider font-mono">
                    5. Compliance & Local Laws
                  </h4>
                  <p className="text-xs">
                    Transactions are audited under domestic commerce regulations. In India, payment gateways comply with direct Reserve Bank of India (RBI) mandates and Section 194-O guidelines.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-2">
                  <h4 className="font-sans font-medium text-xs text-gray-900 uppercase tracking-wider font-mono">
                    1. Personal Information We Collect
                  </h4>
                  <p className="text-xs">
                    We collect essential profile data including your name, email address, phone number (for secure SMS Access authentication), and delivery addresses to fulfill purchases. We never store credit card numbers or pin details.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-sans font-medium text-xs text-gray-900 uppercase tracking-wider font-mono">
                    2. How We Use Your Data
                  </h4>
                  <p className="text-xs">
                    Your data is solely used to process payments, coordinate deliveries with couriers, personalize your shopping cart synchronization across devices, and power our real-time smart personal assistant (Aura Guide) to give customized material recommendation answers.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-sans font-medium text-xs text-gray-900 uppercase tracking-wider font-mono">
                    3. Cloud Synchronization Protection
                  </h4>
                  <p className="text-xs">
                    When you are signed in, your shopping cart is synchronized directly to our cloud servers via secure Firebase Firestore endpoints. We employ strong authentication constraints to prevent unauthorized profile lookups or data breaches.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-sans font-medium text-xs text-gray-900 uppercase tracking-wider font-mono">
                    4. Third-Party Integrations
                  </h4>
                  <p className="text-xs">
                    We utilize tokenized third-party APIs (such as Google GenAI, Firebase, and optional merchant gateways). These services maintain strict standalone compliance criteria to keep your credentials confidential.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-sans font-medium text-xs text-gray-900 uppercase tracking-wider font-mono">
                    5. Account Ownership & Deletions
                  </h4>
                  <p className="text-xs">
                    At any time, you can request full profile termination by reaching out to support or by resetting your client local data structures. We honor the right to be forgotten in complete accordance with local privacy mandates.
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Footer controls */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Acknowledge & Close</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
