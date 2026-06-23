"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, LogOut, ClipboardList, Calendar, MapPin, Phone, Mail, 
  User, Star, Plus, Trash2, CheckCircle, MessageSquare 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { LuxuryButton } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";

interface OrderType {
  id: string;
  totalAmount: number;
  status: string;
  notes: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    menuItem: {
      name: string;
    };
  }>;
}

interface ReservationType {
  id: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  notes: string | null;
  status: string;
  table: {
    number: number;
  } | null;
}

interface ReviewType {
  id: string;
  rating: number;
  comment: string;
  status: string;
  orderId: string | null;
  createdAt: string;
}

type TabType = "orders" | "reservations" | "addresses" | "reviews" | "profile";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, logout, checking } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [reservations, setReservations] = useState<ReservationType[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Address Form State
  const [newAddress, setNewAddress] = useState("");
  const [addingAddress, setAddingAddress] = useState(false);

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState<OrderType | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Security Check: Redirect if guest session doesn't exist
  useEffect(() => {
    if (!checking && (!user || user.role !== "CUSTOMER")) {
      toast("Please log in to view your profile.", "info");
      router.push("/login");
    }
  }, [user, checking, router, toast]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const ordersRes = await fetch("/api/customer/orders");
      const reservationsRes = await fetch("/api/customer/reservations");
      
      // Fetch customer reviews history
      let customerReviews: ReviewType[] = [];
      if (user.customerId) {
        const reviewsRes = await fetch(`/api/reviews?customerId=${user.customerId}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          customerReviews = reviewsData.reviews || [];
        }
      }
      setReviews(customerReviews);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
      if (reservationsRes.ok) {
        const reservationsData = await reservationsRes.json();
        setReservations(reservationsData.reservations || []);
      }

      // Load saved addresses from localStorage
      const saved = localStorage.getItem(`addresses_${user.id}`);
      if (saved) {
        setAddresses(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load customer histories:", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast("Logged out successfully.", "success");
    router.push("/");
  };

  const handleCancelReservation = async (resId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    
    try {
      const response = await fetch("/api/customer/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: resId, action: "CANCEL" }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast("Reservation cancelled successfully.", "success");
        fetchHistory();
      } else {
        toast(result.error || "Failed to cancel booking.", "error");
      }
    } catch (err) {
      toast("Connection failure. Unable to cancel booking.", "error");
    }
  };

  // Address logic
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim() || !user) return;
    const updated = [...addresses, newAddress.trim()];
    setAddresses(updated);
    localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    setNewAddress("");
    setAddingAddress(false);
    toast("Delivery address saved successfully.", "success");
  };

  const handleDeleteAddress = (index: number) => {
    if (!user) return;
    const updated = addresses.filter((_, idx) => idx !== index);
    setAddresses(updated);
    localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    toast("Address deleted.", "info");
  };

  // Review submission
  const handleOpenReview = (order: OrderType) => {
    setReviewOrder(order);
    setRating(5);
    setComment("");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !user) return;
    if (comment.trim().length < 5) {
      toast("Review comment must be at least 5 characters.", "error");
      return;
    }
    setSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          rating,
          comment: comment.trim(),
          orderId: reviewOrder.id,
          customerId: user.customerId || undefined,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast(result.message || "Review submitted successfully!", "success");
        setReviewOrder(null);
        fetchHistory(); // Reload data
      } else {
        toast(result.message || "Failed to submit review.", "error");
      }
    } catch (err) {
      toast("Connection error. Try again later.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-charcoal">
        <p className="animate-pulse tracking-widest text-xs uppercase text-gold font-sans">
          Verifying session status...
        </p>
      </div>
    );
  }

  // Helper to check if order already has a review
  const isOrderReviewed = (orderId: string) => {
    return reviews.some((r) => r.orderId === orderId);
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal py-20 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Back Navigation & Log out row */}
          <div className="lg:col-span-12 flex justify-between items-center border-b border-gold/15 pb-6">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-bold hover:text-gold transition-colors focus:outline-none cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back to Home
            </button>
            <h2 className="font-serif text-xl tracking-wider uppercase font-bold text-gold hidden md:block">
              {t("brand_name")} Guest Portal
            </h2>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-bold hover:text-rose-500 transition-colors focus:outline-none cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

          {/* Profile Overview Card (Sidebar) */}
          <div className="lg:col-span-4 bg-white p-6 border border-gold/15 shadow-md flex flex-col gap-6 h-fit font-sans">
            <div className="border-b border-gold/10 pb-4 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold text-2xl font-bold mb-3 border border-gold/25">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">
                {user.name}
              </h3>
              <span className="text-[10px] uppercase tracking-wider bg-gold/15 text-gold px-2 py-0.5 mt-1 font-bold">
                Customer Profile
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <User size={14} className="text-gold" />
                <span className="font-bold text-charcoal">{user.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-gold" />
                <span className="break-all text-charcoal-light">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-gold" />
                <span className="text-charcoal-light">{addresses.length} Saved Addresses</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare size={14} className="text-gold" />
                <span className="text-charcoal-light">{reviews.length} Reviews Submitted</span>
              </div>
            </div>
          </div>

          {/* History Lists Panel */}
          <div className="lg:col-span-8 bg-white p-8 border border-gold/15 shadow-xl min-h-[500px]">
            {/* Tabs Header */}
            <div className="flex gap-6 mb-8 border-b border-gold/10 pb-4 overflow-x-auto scrollbar-none">
              {[
                { key: "orders", label: "My Orders" },
                { key: "reservations", label: "Reservations" },
                { key: "addresses", label: "Saved Addresses" },
                { key: "reviews", label: "My Reviews" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`relative px-2 py-1 text-xs uppercase tracking-wider font-sans font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.key ? "text-gold" : "text-charcoal-light hover:text-gold"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.span
                      layoutId="activeProfileTabUnderline"
                      className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-gold"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {loadingData ? (
              <div className="space-y-6 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border-b border-gold/5 pb-4 space-y-2">
                    <div className="h-4 bg-charcoal/10 w-1/3" />
                    <div className="h-3 bg-charcoal/10 w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === "orders" && (
                  <motion.div
                    key="orders-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {orders.length === 0 ? (
                      <p className="text-xs uppercase tracking-widest font-sans font-bold text-charcoal-light py-10 text-center">
                        You have not placed any orders yet.
                      </p>
                    ) : (
                      orders.map((order) => {
                        const showReviewButton = order.status === "DELIVERED" && !isOrderReviewed(order.id);
                        return (
                          <div
                            key={order.id}
                            className="border-b border-gold/10 pb-6 last:border-0 last:pb-0"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="font-sans text-[10px] uppercase font-bold text-gold block">
                                  Order #{order.id.slice(-6).toUpperCase()}
                                </span>
                                <span className="text-[10px] text-charcoal-light font-sans">
                                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {showReviewButton && (
                                  <button
                                    onClick={() => handleOpenReview(order)}
                                    className="text-[10px] uppercase font-sans font-bold border border-gold text-gold px-2.5 py-1 hover:bg-gold hover:text-white transition-colors cursor-pointer"
                                  >
                                    Review Order
                                  </button>
                                )}
                                {isOrderReviewed(order.id) && (
                                  <span className="text-[9px] uppercase font-sans font-bold text-emerald-500 flex items-center gap-1">
                                    <CheckCircle size={10} /> Reviewed
                                  </span>
                                )}
                                <Badge status={order.status} />
                              </div>
                            </div>

                            <div className="pl-3 border-l border-gold/15 space-y-2 mb-3">
                              {order.items.map((item) => (
                                <p
                                  key={item.id}
                                  className="text-xs font-sans font-normal text-charcoal-light"
                                >
                                  {item.menuItem.name} <span className="font-bold text-gold">×{item.quantity}</span>
                                </p>
                              ))}
                            </div>

                            <div className="flex justify-between items-center text-xs font-sans font-bold">
                              <span className="text-charcoal-light">Total Amount:</span>
                              <span className="text-gold font-bold text-sm">₹{order.totalAmount}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}

                {activeTab === "reservations" && (
                  <motion.div
                    key="reservations-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {reservations.length === 0 ? (
                      <p className="text-xs uppercase tracking-widest font-sans font-bold text-charcoal-light py-10 text-center">
                        You have no reservations booked.
                      </p>
                    ) : (
                      reservations.map((res) => {
                        const canCancel = res.status === "PENDING" || res.status === "APPROVED";
                        return (
                          <div
                            key={res.id}
                            className="border-b border-gold/10 pb-6 last:border-0 last:pb-0"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="font-sans text-[10px] uppercase font-bold text-gold block">
                                  Booking #{res.id.slice(-6).toUpperCase()}
                                </span>
                                <span className="text-[10px] text-charcoal-light font-sans">
                                  Date: {res.date} | Time: {res.time}
                                </span>
                              </div>
                              <Badge status={res.status} />
                            </div>

                            <div className="text-xs font-sans text-charcoal-light space-y-1 mb-4">
                              <p>Guests: <strong>{res.guests} people</strong></p>
                              {res.table ? (
                                <p>Allocated Table: <strong className="text-gold">Table #{res.table.number}</strong></p>
                              ) : (
                                <p>Table Status: <span className="italic text-charcoal-light">Waiting Allocation</span></p>
                              )}
                              {res.notes && <p className="italic text-charcoal-light mt-2">Notes: "{res.notes}"</p>}
                            </div>

                            {canCancel && (
                              <button
                                onClick={() => handleCancelReservation(res.id)}
                                className="text-[10px] uppercase tracking-widest font-sans font-bold text-rose-500 hover:underline cursor-pointer focus:outline-none"
                              >
                                Cancel Reservation
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}

                {activeTab === "addresses" && (
                  <motion.div
                    key="addresses-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center border-b border-gold/5 pb-4 mb-4">
                      <h4 className="font-sans text-xs uppercase tracking-wider font-bold text-charcoal-light">
                        Saved Locations ({addresses.length})
                      </h4>
                      <button
                        onClick={() => setAddingAddress(!addingAddress)}
                        className="inline-flex items-center gap-1.5 text-xs text-gold font-bold hover:underline cursor-pointer"
                      >
                        <Plus size={14} /> Add Address
                      </button>
                    </div>

                    {addingAddress && (
                      <form onSubmit={handleAddAddress} className="bg-cream border border-gold/15 p-4 space-y-4 mb-6">
                        <textarea
                          placeholder="Type detailed delivery address (eg: House No, Flat, Street, City)..."
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          className="w-full bg-white border border-gold/25 p-3 font-sans text-xs text-charcoal focus:outline-none focus:border-gold h-20 rounded-none resize-none"
                          required
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setAddingAddress(false);
                              setNewAddress("");
                            }}
                            className="px-3 py-1.5 text-xs font-sans text-charcoal-light uppercase tracking-wider hover:underline"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-gold text-white px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-wider hover:bg-gold-dark"
                          >
                            Save Location
                          </button>
                        </div>
                      </form>
                    )}

                    {addresses.length === 0 ? (
                      <p className="text-xs uppercase tracking-widest font-sans font-bold text-charcoal-light py-10 text-center">
                        No saved delivery addresses yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-cream border border-gold/10 p-4 font-sans text-xs"
                          >
                            <div className="flex items-start gap-3">
                              <MapPin size={16} className="text-gold flex-shrink-0 mt-0.5" />
                              <p className="text-charcoal-light leading-relaxed">
                                {address}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteAddress(idx)}
                              className="text-charcoal-light hover:text-rose-500 transition-colors p-2 cursor-pointer"
                              title="Delete location"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {reviews.length === 0 ? (
                      <p className="text-xs uppercase tracking-widest font-sans font-bold text-charcoal-light py-10 text-center">
                        You have not submitted any reviews.
                      </p>
                    ) : (
                      reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="bg-cream border border-gold/10 p-4 font-sans text-xs flex flex-col gap-2"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < rev.rating ? "fill-gold text-gold" : "text-gold/20"}
                                />
                              ))}
                            </div>
                            <span className={`text-[9px] font-sans font-bold uppercase tracking-wider ${
                              rev.status === "APPROVED" 
                                ? "text-emerald-500" 
                                : rev.status === "HIDDEN" 
                                  ? "text-rose-500" 
                                  : "text-amber-500 animate-pulse"
                            }`}>
                              {rev.status}
                            </span>
                          </div>
                          
                          <p className="text-charcoal-light leading-relaxed italic">
                            "{rev.comment}"
                          </p>

                          <span className="text-[9px] text-charcoal-light block mt-1 self-end">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal Dialog */}
      <AnimatePresence>
        {reviewOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewOrder(null)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-[2px]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-6 bottom-6 md:inset-x-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto w-full max-w-md bg-white border border-gold/25 p-6 z-50 shadow-2xl font-sans text-charcoal text-xs"
            >
              <h3 className="font-serif text-lg font-bold border-b border-gold/15 pb-3 mb-4 uppercase tracking-wide">
                Review Your Order
              </h3>
              
              <div className="bg-cream p-3 border border-gold/5 mb-4 text-[11px] leading-relaxed">
                <p className="font-bold text-gold mb-1">
                  Order Reference: #{reviewOrder.id.slice(-6).toUpperCase()}
                </p>
                <div className="flex flex-wrap gap-x-3 text-charcoal-light">
                  {reviewOrder.items.map((i, idx) => (
                    <span key={idx}>{i.menuItem.name} ({i.quantity})</span>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Stars selector */}
                <div className="flex flex-col gap-2">
                  <span className="uppercase tracking-wider font-bold text-charcoal-light text-[9px]">
                    Select Star Rating
                  </span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={24}
                          className={star <= rating ? "fill-gold text-gold" : "text-gold/20"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment area */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="review-comment" className="uppercase tracking-wider font-bold text-charcoal-light text-[9px]">
                    Tell Us Your Experience
                  </label>
                  <textarea
                    id="review-comment"
                    placeholder="Write details about the taste, packaging, and delivery service..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-cream border border-gold/25 p-3 text-xs text-charcoal focus:outline-none focus:border-gold h-28 rounded-none resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewOrder(null)}
                    className="px-4 py-2 uppercase font-bold tracking-widest text-[9px] text-charcoal-light hover:underline"
                  >
                    Cancel
                  </button>
                  <LuxuryButton
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </LuxuryButton>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
