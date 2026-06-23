"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Navbar } from "@/components/organisms/Navbar";

export default function PrivacyPage() {
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
              LEGAL INFORMATION
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-light text-charcoal uppercase">
              Privacy Policy
            </h1>
            <p className="text-[10px] text-charcoal-light uppercase tracking-wider mt-2">
              Last Updated: June 22, 2026
            </p>
          </div>

          <div className="text-xs md:text-sm font-light leading-relaxed space-y-6 text-charcoal-light">
            <p>
              At <strong>PraVaDhya Foods</strong>, accessible from our online portal, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by PraVaDhya Foods and how we use it.
            </p>

            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-wider">
              1. Information We Collect
            </h3>
            <p>
              We collect information that you provide directly to us when placing orders or requesting table reservations. This may include your Full Name, Email Address, Phone Number, delivery location address, and billing details (payment mode).
            </p>

            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-wider">
              2. How We Use Your Information
            </h3>
            <p>
              We utilize the collected information to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process your food orders and Cash on Delivery (COD) dispatches.</li>
              <li>Secure and assign dining tables for reservations.</li>
              <li>Authenticate your account logins and manage customer profiles.</li>
              <li>Send prioritized notifications regarding booking confirmations or system updates.</li>
              <li>Protect against fraud, database errors, and security issues.</li>
            </ul>

            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-wider">
              3. Secure Cookies Policy
            </h3>
            <p>
              We use secure, HttpOnly, and SameSite=Lax cookies to manage user login sessions and tokens. These cookies protect against cross-site scripting (XSS) and cross-site request forgery (CSRF) exploits. No personal demographic details are leaked to external trackers.
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
