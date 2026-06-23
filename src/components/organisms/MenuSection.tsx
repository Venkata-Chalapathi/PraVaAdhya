"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { LuxuryButton } from "@/components/atoms/Button";
import { MenuItemSkeleton } from "@/components/atoms/Skeletons";

const CATEGORIES = [
  "All",
  "Starters",
  "Soups",
  "Vegetarian",
  "Non-Vegetarian",
  "Biryani",
  "Chinese",
  "Tandoori",
  "Desserts",
  "Beverages"
] as const;

type CategoryType = typeof CATEGORIES[number];

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  prepTime: number;
  category: {
    name: string;
  };
}

export const MenuSection: React.FC = () => {
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState<CategoryType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch menu data from database with active category and search queries
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeCategory !== "All") {
          queryParams.append("category", activeCategory);
        }
        if (searchQuery) {
          queryParams.append("search", searchQuery);
        }

        const res = await fetch(`/api/menu?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMenuItems(data.items);
          }
        }
      } catch (error) {
        console.error("Failed to load menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    // Minor debounce on typing search queries
    const delayDebounceFn = setTimeout(() => {
      fetchMenu();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchQuery]);

  return (
    <section className="py-28 px-6 bg-cream-light text-charcoal relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-semibold mb-4">
            {t("securing_table")}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light mb-6">
            {t("our_curated_menu")}
          </h2>
          <p className="font-sans font-normal text-charcoal-light text-sm max-w-lg leading-relaxed">
            {language === "TE"
              ? "అచ్చమైన తెలుగు రుచులు, గుమగుమలాడే బిర్యానీలు మరియు సంప్రదాయ పిండివంటల కలయిక."
              : "Discover the heritage of authentic Telugu cuisine, layered with local Guntur spices and traditional cooking methods."}
          </p>
        </div>

        {/* Search Bar & Category filter Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-gold/15 pb-6">
          {/* Categories Tab Scroll */}
          <div className="flex gap-2 pb-2 overflow-x-auto w-full md:w-auto scrollbar-none snap-x">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative px-4 py-2 text-xs uppercase tracking-[0.2em] font-sans font-medium transition-colors duration-300 focus:outline-none cursor-pointer whitespace-nowrap snap-start ${
                    isActive ? "text-gold" : "text-charcoal-light font-bold hover:text-gold"
                  }`}
                >
                  {category}
                  {isActive && (
                    <motion.span
                      layoutId="activeMenuUnderline"
                      className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder={language === "TE" ? "వంటకాల కోసం వెతకండి..." : "Search menu..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream border border-gold/25 pl-10 pr-4 py-3 font-sans text-xs uppercase tracking-wider text-charcoal focus:outline-none focus:border-gold transition-colors duration-300 rounded-none placeholder-charcoal-light/60"
            />
            <Search className="absolute left-3 top-3.5 text-gold/60" size={14} />
          </div>
        </div>

        {/* Menu Grid Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <MenuItemSkeleton key={i} />
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-sans font-light text-charcoal-light text-sm tracking-widest uppercase">
              {language === "TE" ? "వంటకాలు ఏవీ లభించలేదు" : "No dishes matches your query"}
            </p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 items-start"
          >
            <AnimatePresence mode="popLayout">
              {menuItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{
                    layout: { type: "spring", stiffness: 350, damping: 32 },
                    opacity: { duration: 0.2 },
                    y: { duration: 0.2 }
                  }}
                  key={item.id}
                  className="group flex flex-col justify-between border-b border-gold/10 pb-8 hover:border-gold/30 transition-colors duration-300"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-3 gap-2">
                        <h3 className="font-serif text-lg font-medium text-charcoal group-hover:text-gold transition-colors duration-300">
                          {item.name}
                        </h3>
                        <span className="flex-grow border-b border-dotted border-gold/25 h-[1px] self-end opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
                        <span className="font-sans text-sm font-semibold text-gold tracking-wide">
                          ₹{item.price}
                        </span>
                      </div>
                      <p className="font-sans font-normal text-charcoal-light text-sm leading-relaxed mb-4">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-6">
                        <span className="flex items-center text-[10px] uppercase tracking-wider text-charcoal-light font-sans">
                          <Clock size={12} className="text-gold mr-1.5" />
                          {item.prepTime} mins
                        </span>

                        {!item.isAvailable && (
                          <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-red-500">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart button */}
                    <div className="self-center">
                      <motion.button
                        disabled={!item.isAvailable}
                        whileHover={item.isAvailable ? { scale: 1.05 } : {}}
                        whileTap={item.isAvailable ? { scale: 0.95 } : {}}
                        onClick={() => {
                          addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
                          toast(`${item.name} added to cart!`, "success");
                        }}
                        className={`p-3 rounded-full border border-gold/30 flex items-center justify-center transition-all duration-300 ${
                          item.isAvailable
                            ? "bg-gold text-charcoal hover:bg-gold-dark hover:text-cream-light cursor-pointer"
                            : "bg-charcoal/10 text-charcoal/30 border-charcoal/10 cursor-not-allowed"
                        }`}
                        title={t("add_to_cart")}
                      >
                        <Plus size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
};
