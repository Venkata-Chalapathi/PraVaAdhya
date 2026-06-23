"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, MapPin, Phone, Mail, User, CheckCircle, ArrowLeft, ClipboardList } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { LuxuryButton } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

// Zod validation schema for checkout inputs
const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."),
  address: z.string().min(10, "Please enter a detailed delivery address (min 10 characters)."),
  notes: z.string().optional(),
});

type CheckoutData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, gstAmount, deliveryFee, totalAmount, clearCart } = useCart();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [success, setSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{ id: string; total: number } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
  });

  // Pre-fill fields if user is logged in
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setValue("name", data.user.name);
            setValue("email", data.user.email);
            // Fetch phone from profile if possible
            const profileRes = await fetch(`/api/customer/profile`);
            if (profileRes.ok) {
              const profile = await profileRes.json();
              if (profile && profile.phone) {
                setValue("phone", profile.phone);
              }
            }
          }
        }
      } catch (e) {
        console.warn("Failed to autofill authenticated user profile details");
      }
    };
    fetchUser();
  }, [setValue]);

  // Redirect to home if cart is empty and checkout hasn't succeeded yet
  useEffect(() => {
    if (cart.length === 0 && !success) {
      toast("Your cart is empty. Redirecting to menu...", "info");
      router.push("/");
    }
  }, [cart, success, router, toast]);

  const onSubmit = async (data: CheckoutData) => {
    try {
      setServerError(null);
      
      const payload = {
        ...data,
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          price: i.price,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setOrderInfo({ id: result.orderId, total: result.totalAmount });
        setSuccess(true);
        clearCart();
        toast("Order placed successfully!", "success");
      } else {
        setServerError(result.message || "Failed to place order. Please try again.");
        toast(result.message || "Checkout failed.", "error");
      }
    } catch (err) {
      setServerError("Network error occurred during checkout. Please verify your connection.");
      toast("Network connection failed.", "error");
    }
  };

  if (cart.length === 0 && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-light text-charcoal">
        <p className="animate-pulse tracking-widest text-xs uppercase text-gold font-sans">
          Loading checkout portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-light text-charcoal py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="checkout-form-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Back Link */}
              <div className="lg:col-span-12">
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-semibold hover:text-gold transition-colors focus:outline-none cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Back to Menu
                </button>
              </div>

              {/* Checkout Form Card */}
              <div className="lg:col-span-7 bg-cream-light p-8 md:p-12 border border-gold/15 shadow-xl">
                <h2 className="font-serif text-2xl md:text-3xl font-light text-charcoal mb-8">
                  Delivery Details
                </h2>

                {serverError && (
                  <div className="bg-rose-50 border-l-2 border-rose-500 p-4 mb-8">
                    <p className="text-xs text-rose-600 font-sans">{serverError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
                  <Input
                    label="Full Name"
                    id="name"
                    icon={<User size={16} />}
                    error={errors.name?.message}
                    {...register("name")}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      label="Email Address"
                      id="email"
                      type="email"
                      icon={<Mail size={16} />}
                      error={errors.email?.message}
                      {...register("email")}
                    />

                    <Input
                      label="Mobile Number"
                      id="phone"
                      type="tel"
                      icon={<Phone size={16} />}
                      error={errors.phone?.message}
                      placeholder="9876543210"
                      {...register("phone")}
                    />
                  </div>

                  <Input
                    label="Delivery Address"
                    id="address"
                    icon={<MapPin size={16} />}
                    error={errors.address?.message}
                    {...register("address")}
                  />

                  <Input
                    label="Special Instructions (Optional)"
                    id="notes"
                    icon={<ClipboardList size={16} />}
                    error={errors.notes?.message}
                    {...register("notes")}
                  />

                  {/* Payment Method - Cash On Delivery for Phase 1 */}
                  <div className="pt-6 border-t border-gold/10">
                    <h3 className="font-sans text-xs uppercase tracking-widest font-bold text-charcoal-light mb-4">
                      Payment Mode
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Active COD option */}
                      <div className="border border-gold p-4 flex items-center justify-between bg-gold/5 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="text-gold" size={16} />
                          <span className="font-sans text-xs uppercase tracking-wider font-semibold">
                            Cash On Delivery (CoD)
                          </span>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-gold" />
                      </div>

                      {/* Coming Soon options */}
                      <div className="border border-charcoal/10 p-4 flex items-center justify-between opacity-45 cursor-not-allowed select-none bg-charcoal/5">
                        <div className="flex items-center gap-3">
                          <CreditCard size={16} />
                          <span className="font-sans text-xs uppercase tracking-wider font-semibold">
                            Online Payments (UPI, Card)
                          </span>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-gold">
                          Soon
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <LuxuryButton
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 text-center"
                    >
                      {isSubmitting ? "Placing Order..." : `Confirm Order (₹${totalAmount})`}
                    </LuxuryButton>
                  </div>
                </form>
              </div>

              {/* Order Summary sidebar */}
              <div className="lg:col-span-5 bg-cream-light p-8 border border-gold/15 shadow-xl h-fit">
                <h3 className="font-serif text-xl font-light text-charcoal mb-6 border-b border-gold/10 pb-4">
                  Order Summary
                </h3>

                <div className="divide-y divide-gold/10 space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between py-3 text-xs font-sans">
                      <div>
                        <h4 className="font-semibold text-charcoal">{item.name}</h4>
                        <span className="text-charcoal-light block mt-1">
                          Qty: {item.quantity} × ₹{item.price}
                        </span>
                      </div>
                      <span className="font-semibold text-gold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gold/15 pt-4 mt-6 space-y-3 text-xs font-sans uppercase tracking-wider font-bold text-charcoal-light">
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
              </div>
            </motion.div>
          ) : (
            // Success view
            <motion.div
              key="checkout-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-xl mx-auto bg-cream-light p-8 md:p-12 text-center border border-gold/20 shadow-2xl flex flex-col items-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-6 p-4 bg-gold/10 rounded-full text-gold"
              >
                <CheckCircle size={48} />
              </motion.div>

              <h2 className="font-serif text-3xl font-light text-charcoal mb-4">
                Order Placed!
              </h2>

              <p className="font-sans font-normal text-charcoal-light text-sm max-w-sm leading-relaxed mb-6">
                Thank you for ordering from <strong>PraVaDhya Foods</strong>. Your request is registered and the kitchen is warming up.
              </p>

              <div className="bg-cream border border-gold/15 p-4 w-full mb-8 font-sans text-xs uppercase tracking-wider font-semibold text-charcoal-light space-y-2">
                <div className="flex justify-between">
                  <span>Order Reference</span>
                  <span className="text-gold font-bold">
                    #{orderInfo?.id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Amount</span>
                  <span className="text-charcoal">₹{orderInfo?.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="text-charcoal">Cash On Delivery</span>
                </div>
              </div>

              <LuxuryButton onClick={() => router.push("/")} className="w-full text-center">
                Return to Menu
              </LuxuryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
