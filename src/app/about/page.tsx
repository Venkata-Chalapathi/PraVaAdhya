"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Award, Heart, Utensils } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Navbar } from "@/components/organisms/Navbar";

export default function AboutPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-cream-light text-charcoal flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow py-24 px-6 max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-bold hover:text-gold transition-colors mb-8 cursor-pointer focus:outline-none"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <article className="space-y-12">
          {/* Header */}
          <div className="border-b border-gold/15 pb-6">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-semibold block mb-3">
              {language === "TE" ? "మా కథ" : "OUR HERITAGE"}
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-light text-charcoal uppercase">
              {language === "TE" ? "ప్రావధ్య ఫుడ్స్ గురించి" : "About PraVaDhya Foods"}
            </h1>
          </div>

          {/* Story Paragraphs */}
          <div className="font-sans font-normal text-charcoal-light text-sm md:text-base leading-relaxed space-y-6">
            <p>
              {language === "TE"
                ? "ప్రావధ్య ఫుడ్స్ కేవలం ఒక రెస్టారెంట్ మాత్రమే కాదు; ఇది అచ్చమైన తెలుగు సంస్కృతి, సాంప్రదాయ రుచులు మరియు కుటుంబ బంధాల కలయిక. సంప్రదాయ వంటకాలను వాటి అసలైన రుచితో నేటి తరానికి అందించాలనే లక్ష్యంతో మేము ప్రయాణాన్ని ప్రారంభించాము."
                : "PraVaDhya Foods is not just a dining destination; it is an authentic homage to Telugu culture, traditional flavors, and familial hospitality. We embarked on this culinary journey with a singular vision: to preserve age-old secret recipes and serve them in their purest form to this generation."}
            </p>
            <p>
              {language === "TE"
                ? "మా వంటగదిలో ఉపయోగించే మసాలా పొడులన్నీ అమరావతి, గుంటూరు మరియు కోనసీమ ప్రాంతాల నుండి సేకరించిన సాంప్రదాయ దినుసులతో స్వయంగా తయారు చేయబడినవి. సేంద్రీయ పద్ధతిలో పండించిన కూరగాయలు, తాజా మాంసాన్ని మాత్రమే మేము ఉపయోగిస్తాము."
                : "Every spice blend used in our kitchen is freshly hand-ground utilizing traditional methods, sourced directly from trusted farmers in Amaravati, Guntur, and Konaseema. We source organic, farm-fresh vegetables and premium local meats to guarantee that every bite is filled with health and rich taste."}
            </p>
          </div>

          {/* Visual Grid of Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="border border-gold/15 p-6 bg-cream">
              <Award className="text-gold mb-4" size={24} />
              <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-3">
                {language === "TE" ? "నాణ్యత ప్రమాణాలు" : "Authentic Heritage"}
              </h3>
              <p className="text-xs text-charcoal-light font-light leading-relaxed">
                {language === "TE" 
                  ? "తరతరాల అనుభవంతో కూడిన వంటల సూత్రాలను ఏమాత్రం మార్చకుండా అందిస్తాము."
                  : "We adhere strictly to generational cooking manuals without compromising on traditional flavors."}
              </p>
            </div>

            <div className="border border-gold/15 p-6 bg-cream">
              <Heart className="text-gold mb-4" size={24} />
              <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-3">
                {language === "TE" ? "ప్రేమతో ఆతిథ్యం" : "Warm Hospitality"}
              </h3>
              <p className="text-xs text-charcoal-light font-light leading-relaxed">
                {language === "TE"
                  ? "తెలుగువారి సాంప్రదాయక మర్యాదలు, ఆప్యాయతతో కూడిన సేవ మా ప్రత్యేకత."
                  : "Experience genuine, affectionate Telugu style service that makes you feel at home."}
              </p>
            </div>

            <div className="border border-gold/15 p-6 bg-cream">
              <Utensils className="text-gold mb-4" size={24} />
              <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-3">
                {language === "TE" ? "తాజా పదార్థాలు" : "Farm to Table"}
              </h3>
              <p className="text-xs text-charcoal-light font-light leading-relaxed">
                {language === "TE"
                  ? "రసాయనాలు లేని సేంద్రీయ కూరగాయలు మరియు నాణ్యమైన నూనెలను మాత్రమే ఉపయోగిస్తాము."
                  : "We prioritize local organic produce and premium quality oils to serve healthy meals."}
              </p>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 px-6 text-center text-xs font-sans">
        © {new Date().getFullYear()} {t("brand_name")}. All Rights Reserved.
      </footer>
    </div>
  );
}
