"use client";

import React from "react";
import useRouter from "next/navigation"; // Wait, next/navigation uses default import or destructuring? Destructuring!
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { LuxuryButton } from "@/components/atoms/Button";
import { useRouter as useNextRouter } from "next/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const router = useNextRouter();
  const { cart, updateQuantity, removeFromCart, subtotal, gstAmount, deliveryFee, totalAmount } = useCart();
  const { t, language } = useLanguage();

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-[2px]"
          />

          {/* Cart Sidebar Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-cream-light text-charcoal z-50 shadow-2xl border-l border-gold/15 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-6 border-b border-gold/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-gold" size={20} />
                <h3 className="font-serif text-lg font-medium tracking-wide uppercase">
                  {t("cart_title")}
                </h3>
                <span className="text-[10px] bg-gold/15 text-gold px-2 py-0.5 font-bold">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-charcoal-light hover:text-gold transition-colors focus:outline-none cursor-pointer"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={48} className="text-gold/20 mb-4 animate-bounce" />
                  <p className="font-light text-sm text-charcoal-light/70 uppercase tracking-widest">
                    {t("cart_empty")}
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex gap-4 border-b border-gold/5 pb-6 items-center"
                  >
                    <div className="flex-1">
                      <h4 className="font-serif text-base font-medium mb-1 text-charcoal">
                        {item.name}
                      </h4>
                      <span className="text-xs font-semibold text-gold font-sans block mb-3">
                        ₹{item.price}
                      </span>
                      
                      {/* Quantity Toggles */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          className="p-1.5 border border-gold/20 hover:border-gold hover:text-gold transition-all focus:outline-none cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          className="p-1.5 border border-gold/20 hover:border-gold hover:text-gold transition-all focus:outline-none cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between h-full gap-6">
                      <span className="text-xs font-bold text-charcoal">
                        ₹{item.price * item.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="text-charcoal-light/40 hover:text-rose-500 transition-colors focus:outline-none cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gold/15 bg-cream space-y-4">
                <div className="space-y-2 text-xs uppercase tracking-wider font-bold text-charcoal-light">
                  <div className="flex justify-between">
                    <span>{t("subtotal")}</span>
                    <span className="text-charcoal">₹{subtotal}</span>
                  </div>
                  {gstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>{t("tax")}</span>
                      <span className="text-charcoal">₹{gstAmount}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>{t("delivery")}</span>
                      <span className="text-charcoal">₹{deliveryFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-charcoal font-bold pt-3 border-t border-gold/15">
                    <span>{t("total")}</span>
                    <span className="text-gold">₹{totalAmount}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <LuxuryButton onClick={handleCheckout} className="w-full text-center py-4">
                    {t("checkout_cta")}
                  </LuxuryButton>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
