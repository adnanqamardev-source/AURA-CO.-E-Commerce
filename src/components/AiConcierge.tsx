import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, ShoppingBag, Eye, Bot, User, CornerDownLeft, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage } from "../types";
import { PRODUCTS, Product } from "../products";

interface AiConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  products: Product[];
}

export default function AiConcierge({
  isOpen,
  onClose,
  onAddToCart,
  onViewProduct,
  products,
}: AiConciergeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Welcome to **Aura & Co.** I am **Aura Guide**, your lifestyle concierge. I can recommend premium diffusers, organic sheets, custom walnut keyboards, ceremonial matcha, or milled brass trays to elevate your environment. What mood or style are you looking to cultivate today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  // Starter suggestion chips
  const suggestions = [
    "Recommend a calming wellness routine",
    "Compare the wood keyboard and brass tray",
    "I want to upgrade my bedding",
    "Show me matching terracotta items"
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorText("");
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Map frontend messages format to standard Gemini API format expected by /api/gemini/chat
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to communicate with Aura Guide server.");
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Helper to parse message text and find action tags, yielding rendered JSX
  const renderMessageContent = (message: ChatMessage) => {
    const text = message.text;

    // Regular expressions for action tags
    const actionRegex = /\[ACTION:(ADD_TO_CART|VIEW_PRODUCT):([^\]]+)\]/g;
    
    // Split text by the tags so we can insert custom UI buttons inline/at the end of sections
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Create a copy of regex to execute safely
    const regex = new RegExp(actionRegex);

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      
      // Push text before the match
      if (matchIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed">
            {renderMarkdownBold(text.substring(lastIndex, matchIndex))}
          </span>
        );
      }

      const actionType = match[1];
      const productId = match[2].trim();
      const product = products.find((p) => p.id === productId);

      if (product) {
        if (actionType === "ADD_TO_CART") {
          parts.push(
            <span key={`action-add-${matchIndex}`} className="inline-block mx-1">
              <button
                onClick={() => onAddToCart(product)}
                className="inline-flex items-center gap-1 bg-black text-white hover:bg-neutral-800 text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm transition-all"
              >
                <ShoppingBag className="h-3 w-3" />
                <span>Add {product.name} to Cart</span>
              </button>
            </span>
          );
        } else if (actionType === "VIEW_PRODUCT") {
          parts.push(
            <span key={`action-view-${matchIndex}`} className="inline-block mx-1">
              <button
                onClick={() => onViewProduct(product)}
                className="inline-flex items-center gap-1 bg-[#e2e8f0] text-gray-900 hover:bg-black hover:text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm transition-all"
              >
                <Eye className="h-3 w-3" />
                <span>Explore Spec Details</span>
              </button>
            </span>
          );
        }
      }

      lastIndex = regex.lastIndex;
    }

    // Push any remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-end-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed">
          {renderMarkdownBold(text.substring(lastIndex))}
        </span>
      );
    }

    return parts;
  };

  // Crude helper to format simple markdown bold strings like **product name**
  const renderMarkdownBold = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-[#faf9f6] shadow-2xl flex flex-col h-full border-l border-[#e2e8f0]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#e2e8f0] bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[#1a1a1a] flex items-center gap-1">
                    <span>Aura Guide</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Online AI Guide" />
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono">POWERED BY GEMINI 3.5 FLASH</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Message Thread Panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "model" && (
                    <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-indigo-600" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-xs ${
                      msg.role === "user"
                        ? "bg-[#1a1a1a] text-white rounded-tr-none"
                        : "bg-white text-gray-700 border border-[#e2e8f0] rounded-tl-none shadow-sm"
                    }`}
                  >
                    <div>{renderMessageContent(msg)}</div>
                    <div
                      className={`text-[9px] mt-1.5 font-mono ${
                        msg.role === "user" ? "text-gray-400 text-right" : "text-gray-400"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming loading typing indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="bg-white border border-[#e2e8f0] rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[80%] flex items-center space-x-1.5">
                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}

              {/* Server connection error box */}
              {errorText && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Concierge Connection Error</p>
                    <p className="text-[11px] mt-1 text-red-600/90 leading-relaxed">{errorText}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Shelf & Form Input Area */}
            <div className="p-4 bg-white border-t border-[#e2e8f0] space-y-3">
              {/* Suggestions chips */}
              {messages.length < 5 && !isLoading && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(s)}
                      className="px-3 py-1.5 bg-gray-50 border border-[#e2e8f0] hover:bg-black hover:text-white transition-colors rounded-full text-[10px] font-semibold text-gray-600 shrink-0"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Form Input Container */}
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage(inputValue);
                  }}
                  disabled={isLoading}
                  placeholder="Ask Aura Guide to recommend, compare, or view..."
                  className="w-full pl-4 pr-12 py-3 bg-white border border-[#e2e8f0] rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2.5 top-2 p-1.5 bg-black hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-30 disabled:bg-black"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[9px] text-center text-gray-400 font-mono tracking-wide">
                TIP: Aura Guide can interactively trigger item spec details & add to cart!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
