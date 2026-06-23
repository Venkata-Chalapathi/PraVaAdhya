"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "EN" | "TE";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    brand_name: "PraVaDhya Foods",
    tagline: "The new address for traditional flavors!",
    explore_menu: "Explore Menu",
    reserve_table: "Reserve Table",
    order_online: "Order Online",
    welcome: "Welcome to PraVaDhya Foods",
    our_curated_menu: "Our Curated Menu",
    securing_table: "Securing Your Table",
    make_reservation: "Make a Reservation",
    why_choose_us: "Why Choose Us",
    traditional_recipes: "Traditional Recipes",
    traditional_recipes_desc: "Aged secret family recipes handed down across generations, preserved with authentic taste profiles.",
    fresh_ingredients: "Fresh Ingredients",
    fresh_ingredients_desc: "We pick farm-fresh organic vegetables and premium hand-selected locally sourced meats.",
    family_dining: "Family Dining",
    family_dining_desc: "Comfortable, warm and spacious seating arrangements optimized for memorable family get-togethers.",
    fast_service: "Fast Service",
    fast_service_desc: "Efficient staff and kitchen pipelines ensuring your hot food reaches the table within 15-20 minutes.",
    testimonials: "Customer Reviews",
    contact_us: "Contact Us",
    nav_experience: "The Experience",
    nav_home: "Home",
    nav_contact: "Contact",
    nav_menu: "Our Menu",
    nav_reservations: "Reservations",
    nav_private: "Private Dining",
    nav_story: "Our Story",
    nav_admin: "Admin Portal",
    cart_title: "Your Cart",
    cart_empty: "Your shopping cart is empty.",
    checkout_cta: "Proceed to Checkout",
    add_to_cart: "Add to Cart",
    reserve_table_cta: "Book Reservation",
    subtotal: "Subtotal",
    tax: "GST (Tax)",
    delivery: "Delivery Charge",
    total: "Total",
  },
  TE: {
    brand_name: "ప్రావధ్య ఫుడ్స్",
    tagline: "సంప్రదాయ రుచులకు కొత్త చిరునామా!",
    explore_menu: "మెనూ చూడండి",
    reserve_table: "టేబుల్ బుకింగ్",
    order_online: "ఆన్‌లైన్ ఆర్డర్",
    welcome: "ప్రావధ్య ఫుడ్స్ కి స్వాగతం",
    our_curated_menu: "మా ప్రత్యేక మెనూ",
    securing_table: "మీ టేబుల్ రిజర్వేషన్",
    make_reservation: "టేబుల్ బుక్ చేయండి",
    why_choose_us: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి",
    traditional_recipes: "సాంప్రదాయ వంటకాలు",
    traditional_recipes_desc: "తరతరాలుగా వస్తున్న రహస్య కుటుంబ వంటల సూత్రాలు, అచ్చమైన సంప్రదాయ రుచితో.",
    fresh_ingredients: "తాజా పదార్థాలు",
    fresh_ingredients_desc: "తాజా సేంద్రీయ కూరగాయలు మరియు ప్రత్యేకంగా ఎంపిక చేసిన స్థానిక నాణ్యమైన మాంసం.",
    family_dining: "కుటుంబ భోజనం",
    family_dining_desc: "కుటుంబ సభ్యులందరితో కలిసి ప్రశాంతంగా కూర్చుని ఆస్వాదించడానికి అనువైన వాతావరణం.",
    fast_service: "వేగవంతమైన సేవ",
    fast_service_desc: "రుచికరమైన వేడి వేడి భోజనాన్ని 15-20 నిమిషాలలోనే మీ ముందుకు తెచ్చే అనుభవజ్ఞులైన సిబ్బంది.",
    testimonials: "కస్టమర్ అభిప్రాయాలు",
    contact_us: "మమ్మల్ని సంప్రదించండి",
    nav_experience: "అనుభవం",
    nav_home: "హోమ్",
    nav_contact: "సంప్రదించండి",
    nav_menu: "మా మెనూ",
    nav_reservations: "రిజర్వేషన్లు",
    nav_private: "ప్రైవేట్ డైనింగ్",
    nav_story: "మా కథ",
    nav_admin: "అడ్మిన్ పోర్టల్",
    cart_title: "మీ కార్ట్",
    cart_empty: "మీ కార్ట్ ఖాళీగా ఉంది.",
    checkout_cta: "చెకౌట్ చేయండి",
    add_to_cart: "కార్ట్ లో చేర్చండి",
    reserve_table_cta: "టేబుల్ రిజర్వ్ చేయండి",
    subtotal: "ఉప-మొత్తం",
    tax: "జిఎస్టి (పన్ను)",
    delivery: "డెలివరీ ఛార్జీ",
    total: "మొత్తం",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("EN");

  useEffect(() => {
    const savedLang = localStorage.getItem("app_lang") as Language;
    if (savedLang === "EN" || savedLang === "TE") {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations["EN"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
