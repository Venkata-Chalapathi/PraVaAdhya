"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check, Clock } from "lucide-react";
import { Navbar } from "@/components/organisms/Navbar";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

interface MenuItem {
  id: string;
  name: string;
  teluguName: string | null;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isVeg: boolean;
  prepTime: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
}

export default function MenuPage() {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const fallbackImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";

  const categories = useMemo(() => [
    "All",
    "Starters",
    "Veg Curries",
    "Non-Veg Curries",
    "Biryanis",
    "Rice Items",
    "Tiffins",
    "Snacks",
    "Desserts",
    "Beverages",
  ], []);

  const getCategoryCount = (catName: string) => {
    if (catName === "All") {
      return items.filter((item) => item.isAvailable).length;
    }
    return items.filter((item) => item.category?.name === catName && item.isAvailable).length;
  };

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setItems(data);
          } else if (data && data.success) {
            setItems(data.items || []);
          }
        }
      } catch (err) {
        console.error("Failed to load menu items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Filter and search logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category.name === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.teluguName && item.teluguName.includes(searchQuery));
      return matchesCategory && matchesSearch && item.isAvailable;
    });
  }, [items, activeCategory, searchQuery]);

  const handleAddToCart = (item: MenuItem) => {
    setAddingToCartId(item.id);
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || fallbackImage,
    });
    
    toast(`${item.name} added to cart!`, "success");
    
    setTimeout(() => {
      setAddingToCartId(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-cream-light text-charcoal transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-12">
        {/* Banner Section */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-extrabold tracking-wide mb-3">
            {language === "TE" ? "మా ప్రత్యేక సాంప్రదాయ మెనూ" : "Our Traditional Menu"}
          </h1>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-gold font-sans font-bold">
            {t("tagline")}
          </p>
        </div>

        {/* Filter Toolbar (Search & Categories) */}
        <div className="flex flex-col gap-6 mb-12 border-b border-gold/15 pb-8">
          {/* Search bar */}
          <div className="relative max-w-md w-full mx-auto">
            <input
              type="text"
              placeholder={language === "TE" ? "రుచులను శోధించండి..." : "Search delicious flavors..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream border border-gold/20 focus:border-gold px-12 py-3.5 text-xs font-sans tracking-wide uppercase outline-none transition-colors text-charcoal"
            />
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 overflow-x-auto py-2 no-scrollbar">
            {categories.map((cat) => {
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-sans font-bold border transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                    activeCategory === cat
                      ? "bg-gold text-white border-gold shadow-md shadow-gold/25"
                      : "bg-transparent border-gold/20 hover:border-gold/60 text-charcoal-light hover:text-gold"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded-full transition-colors ${
                    activeCategory === cat
                      ? "bg-white/20 text-white"
                      : "bg-gold/10 text-gold"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Grid / State Handling */}
        {loading ? (
          // Loading Skeletons
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="border border-gold/10 bg-cream flex flex-col gap-4 p-4 animate-pulse">
                <div className="aspect-[4/3] w-full bg-gold/10 relative" />
                <div className="h-4 bg-gold/15 w-2/3" />
                <div className="h-3 bg-gold/10 w-1/2" />
                <div className="h-10 bg-gold/10 w-full mt-2" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          // Empty State
          <div className="text-center py-20 border border-dashed border-gold/20 bg-cream/50">
            <p className="text-sm font-sans tracking-widest uppercase text-gold">
              {language === "TE" ? "క్షమించండి! వంటకాలు ఏవీ కనుగొనబడలేదు" : "No culinary delights match your selection."}
            </p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="mt-4 text-xs font-sans font-bold tracking-widest text-charcoal hover:text-gold uppercase underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          // Dynamic Menu Cards Grid
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-cream-dark rounded-2xl overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(197,168,128,0.15)] hover:border-gold/60 transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Food Card Image section */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal">
                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      <span className={`text-[9px] uppercase tracking-widest font-sans font-extrabold px-2.5 py-1 border ${
                        item.isVeg
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                      }`}>
                        {item.isVeg ? (language === "TE" ? "శాకాహారం" : "Veg") : (language === "TE" ? "మాంసాహారం" : "Non-Veg")}
                      </span>
                    </div>

                    <Image
                      src={item.image || fallbackImage}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      unoptimized
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = fallbackImage;
                      }}
                    />

                    {/* Preparation Time Overlay */}
                    <div className="absolute bottom-4 right-4 bg-charcoal/70 backdrop-blur-sm text-cream-light text-[9px] uppercase tracking-wider font-sans font-bold px-2.5 py-1.5 flex items-center gap-1">
                      <Clock size={10} className="text-gold" />
                      {item.prepTime} Mins
                    </div>
                  </div>

                  {/* Card Content details */}
                  <div className="p-6 flex flex-col gap-4 flex-grow justify-between">
                    <div>
                      {/* Name Row */}
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-charcoal">
                            {item.name}
                          </h3>
                          {item.teluguName && (
                            <span className="text-xs text-gold font-serif mt-0.5 block">
                              {item.teluguName}
                            </span>
                          )}
                        </div>
                        <span className="font-sans text-sm font-bold text-gold whitespace-nowrap">
                          ₹{item.price}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-charcoal-light font-sans leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Add to Cart button */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`w-full py-3.5 text-center text-[10px] uppercase tracking-widest font-sans font-bold transition-all duration-300 flex items-center justify-center gap-2 border select-none cursor-pointer ${
                          addingToCartId === item.id
                            ? "bg-gold text-charcoal border-gold"
                            : "bg-transparent hover:bg-gold hover:text-charcoal border-gold/40 text-charcoal hover:border-gold"
                        }`}
                      >
                        {addingToCartId === item.id ? (
                          <>
                            <Check size={12} className="animate-bounce" />
                            Added!
                          </>
                        ) : (
                          <>
                            <Plus size={12} />
                            {t("add_to_cart")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gold/15 bg-charcoal py-16 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-serif text-xl tracking-wider text-white uppercase font-bold">
              {t("brand_name")}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-sans font-semibold">
              {t("tagline")}
            </span>
          </div>

          <p className="text-[10px] tracking-wider text-[#A1A1A1] font-sans font-normal">
            © {new Date().getFullYear()} {t("brand_name")}. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
