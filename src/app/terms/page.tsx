"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Navbar } from "@/components/organisms/Navbar";

export default function TermsPage() {
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
              LEGAL AGREEMENT
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-light text-charcoal uppercase">
              Terms & Conditions
            </h1>
            <p className="text-[10px] text-charcoal-light uppercase tracking-wider mt-2">
              Last Updated: June 22, 2026
            </p>
          </div>

          <div className="text-xs md:text-sm font-light leading-relaxed space-y-6 text-charcoal-light">
            <p>
              Welcome to <strong>PraVaDhya Foods</strong>. These terms and conditions outline the rules and regulations for the use of PraVaDhya Foods' Website, located at the root domain. By accessing this website, we assume you accept these terms.
            </p>

            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-wider">
              1. Online Ordering & Payments
            </h3>
            <p>
              We currently operate exclusively under a <strong>Cash on Delivery (COD)</strong> payment model. When you place an order, you agree to pay the delivery personnel in cash (or local mobile UPI transfer if supported by the delivery driver) upon arrival.
            </p>

            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-wider">
              2. Table Reservations
            </h3>
            <p>
              Table reservation requests submitted online are initially set in a <strong>PENDING</strong> status. Reservations are only finalized once they are reviewed and marked as <strong>APPROVED</strong> by our administrative staff, who will allocate physical dining tables.
            </p>

            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-wider">
              3. Double Bookings & Conflict resolution
            </h3>
            <p>
              While we run automated reservation conflict detection to prevent double bookings within 2 hours, we reserve the right to reschedule or modify reservations in the event of unforeseen kitchen constraints or branch operational issues.
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
