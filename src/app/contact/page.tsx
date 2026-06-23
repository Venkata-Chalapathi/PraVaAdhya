"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, MessageSquare, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { Navbar } from "@/components/organisms/Navbar";
import { LuxuryButton } from "@/components/atoms/Button";

export default function ContactPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast("Inquiry message successfully sent. We will contact you soon.", "success");
      setName("");
      setEmail("");
      setMsg("");
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-cream-light text-charcoal flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow py-24 px-6 max-w-4xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-bold hover:text-gold transition-colors mb-8 cursor-pointer focus:outline-none"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Header & Details Column */}
          <div className="md:col-span-6 space-y-8">
            <div className="border-b border-gold/15 pb-6">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-semibold block mb-3">
                {language === "TE" ? "సంప్రదించండి" : "CONNECT WITH US"}
              </span>
              <h1 className="font-serif text-3xl md:text-5xl font-light text-charcoal uppercase">
                {language === "TE" ? "చిరునామా & వివరాలు" : "Get In Touch"}
              </h1>
            </div>

            <div className="space-y-6 font-sans text-xs md:text-sm">
              <div className="flex items-start gap-4">
                <MapPin size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-gold mb-1">Our Location</h4>
                  <p className="text-charcoal-light leading-relaxed">
                    19/243, Rani Nagar, Anantapur,<br />
                    Andhra Pradesh, India - 515001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-gold mb-1">Phone Number</h4>
                  <p className="text-charcoal-light font-semibold">+91 97004 00024</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-gold mb-1">Email address</h4>
                  <p className="text-charcoal-light">info@pravadhyafoods.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-gold mb-1">Business Hours</h4>
                  <p className="text-charcoal-light">11:00 AM - 11:00 PM (Monday - Sunday)</p>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp trigger */}
            <div className="pt-4">
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 shadow-md"
              >
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-6 bg-cream-light p-8 border border-gold/15 shadow-xl font-sans text-xs">
            <h3 className="font-serif text-lg font-medium text-charcoal mb-6 uppercase tracking-wide border-b border-gold/10 pb-3">
              Send an Inquiry
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase font-bold text-gold">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-cream border border-gold/25 p-2.5 text-xs text-charcoal focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase font-bold text-gold">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-cream border border-gold/25 p-2.5 text-xs text-charcoal focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase font-bold text-gold">Message</label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="bg-cream border border-gold/25 p-3 text-xs text-charcoal focus:outline-none h-28 resize-none"
                  required
                />
              </div>

              <div className="pt-2">
                <LuxuryButton
                  type="submit"
                  disabled={sending}
                  className="w-full text-center py-3"
                >
                  {sending ? "Sending..." : "Submit Inquiry"}
                </LuxuryButton>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 px-6 text-center text-xs font-sans">
        © {new Date().getFullYear()} {t("brand_name")}. All Rights Reserved.
      </footer>
    </div>
  );
}
