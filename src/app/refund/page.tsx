"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Navbar } from "@/components/organisms/Navbar";

export default function RefundPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-cream-light text-charcoal flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow py-24 px-6 max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-bold hover:text-gold transition-colors mb-8 cursor-pointer focus:outline-none"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <article className="space-y-8 font-sans">
          {/* Header */}
          <div className="border-b border-gold/15 pb-6">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-semibold block mb-3">
              RESTAURANT POLICIES
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-light text-charcoal uppercase">
              Cancellation & Refund Policy
            </h1>
            <p className="text-[10px] text-charcoal-light uppercase tracking-wider mt-2">
              Last Updated: June 22, 2026
            </p>
          </div>

          <div className="text-xs md:text-sm font-light leading-relaxed space-y-6 text-charcoal-light">
            <p>
              Thank you for dining with <strong>PraVaDhya Foods</strong>. Please review our policies regarding food order cancellations and table reservation adjustments.
            </p>

            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-wider">
              1. Food Order Cancellations
            </h3>
            <p>
              Because we prepare all dishes fresh from scratch using organic ingredients on order demand, once an order status progresses to <strong>PREPARING</strong>, cancellation requests cannot be processed.
            </p>
            <p>
              To cancel an order, you must do so from your customer portal profile dashboard immediately while the status is still <strong>PENDING</strong>, or by calling our customer service hotline (+91 99999 99999) within 5 minutes of order placement.
            </p>

            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-wider">
              2. Cash on Delivery (COD) Refunds
            </h3>
            <p>
              As all online sales are fulfilled exclusively via Cash on Delivery, there are no digital credit card refunds. In the event of a damaged order, missing items, or quality issues:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Our delivery driver will verify and replace the item immediately.</li>
              <li>Or we will adjust the total bill amount directly before you make the cash payment.</li>
              <li>For post-delivery quality complaints, please contact our support team to register a credit voucher for your next order.</li>
            </ul>

            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-wider">
              3. Table Reservations adjustments
            </h3>
            <p>
              We kindly request that table cancellations or time adjustments be submitted at least 2 hours in advance of the booking slot. Cancellations can be triggered directly in your guest dashboard under "My Reservations".
            </p>
          </div>
        </article>
      </main>

      <footer className="w-full py-10 px-6 text-center text-xs font-sans">
        © {new Date().getFullYear()} {t("brand_name")}. All Rights Reserved.
      </footer>
    </div>
  );
}
