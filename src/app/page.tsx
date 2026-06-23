"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, Star, Quote, Utensils, Heart, Award, ShieldCheck, 
  MapPin, Phone, Mail, Clock, Plus, Check 
} from "lucide-react";
import { Navbar } from "@/components/organisms/Navbar";
import { HeroSection } from "@/components/organisms/HeroSection";
import { ReservationForm } from "@/components/organisms/ReservationForm";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { LuxuryButton } from "@/components/atoms/Button";

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
  category: {
    name: string;
  };
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
}

export default function Home() {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [popularDishes, setPopularDishes] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeReview, setActiveReview] = useState(0);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const fallbackImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";

  // Mock backup reviews in case db is empty initially
  const backupReviews = [
    {
      id: "backup-1",
      name: "Srinivas R.",
      rating: 5,
      comment: language === "TE"
        ? "గొంగూర మటన్ రుచి అద్భుతంగా ఉంది. మా నాన్నమ్మ చేసిన వంటకం గుర్తొచ్చింది! ప్రావధ్య ఫుడ్స్ కి ధన్యవాదాలు."
        : "The Gongura Mutton here tastes exactly like my grandmother's recipe in Tenali! Truly authentic Telugu flavors.",
    },
    {
      id: "backup-2",
      name: "Lakshmi K.",
      rating: 5,
      comment: language === "TE"
        ? "పెసరట్టు మరియు ఫిల్టర్ కాఫీ అద్భుతం. ఇక్కడి వాతావరణం మరియు సేవ చాలా బాగున్నాయి. వీకెండ్స్ లో ఫ్యామిలీతో రావడానికి ఉత్తమమైన ప్రదేశం."
        : "Best Pesarattu and filter coffee in town. The premium ambiance and quick service make it a weekly spot for our family.",
    },
    {
      id: "backup-3",
      name: "Anirudh G.",
      rating: 5,
      comment: language === "TE"
        ? "మేము ఫ్యామిలీ డిన్నర్ కోసం టేబుల్ బుక్ చేసాము. గుంటూరు చికెన్ బిర్యానీ స్పెషల్! సాంప్రదాయ పద్ధతిలో వడ్డించడం చాలా నచ్చింది."
        : "We booked a table for a family dinner. Outstanding Telugu hospitality and the Guntur Chicken Biryani was spectacular.",
    }
  ];

  useEffect(() => {
    // 1. Fetch Featured Menu Items (Popular Dishes)
    const fetchPopularDishes = async () => {
      try {
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const featured = (data.items || []).filter((item: MenuItem) => item.isFeatured && item.isAvailable);
            setPopularDishes(featured.slice(0, 3)); // show top 3 featured items
          }
        }
      } catch (err) {
        console.error("Failed to fetch popular dishes:", err);
      } finally {
        setLoadingDishes(false);
      }
    };

    // 2. Fetch Public Reviews (Testimonials)
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/reviews");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
          } else {
            setReviews(backupReviews);
          }
        } else {
          setReviews(backupReviews);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviews(backupReviews);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchPopularDishes();
    fetchReviews();
  }, [language]);

  // Autoplay reviews slider
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews]);

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

  const currentReview = reviews[activeReview] || backupReviews[0];

  return (
    <div className="flex flex-col min-h-screen bg-cream-light text-charcoal selection:bg-gold selection:text-charcoal transition-colors duration-300">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Banner Section */}
        <HeroSection />

        {/* ====================================================
            SECTION 1: POPULAR DISHES
           ==================================================== */}
        <section className="py-24 px-6 bg-cream border-b border-gold/15 transition-colors duration-300" id="popular-dishes">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold mb-4">
                {language === "TE" ? "మా అత్యంత ప్రజాదరణ పొందిన వంటకాలు" : "Signature Delicacies"}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-extrabold text-charcoal mb-6">
                {language === "TE" ? "టాప్ సిగ్నేచర్ డిషెస్" : "Popular Dishes"}
              </h2>
              <p className="font-sans font-normal text-charcoal-light text-sm max-w-lg leading-relaxed">
                {language === "TE" 
                  ? "మా అతిథులు ఎక్కువగా ఇష్టపడే అచ్చమైన గుంటూరు మసాలాల సాంప్రదాయ రుచులు."
                  : "Hand-selected signature Telugu dishes prepared with fresh organic ground spices."}
              </p>
            </div>

            {loadingDishes ? (
              // Loading skeletons
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="border border-gold/10 bg-cream-light flex flex-col gap-4 p-4 animate-pulse">
                    <div className="aspect-[4/3] w-full bg-gold/10" />
                    <div className="h-4 bg-gold/15 w-2/3" />
                    <div className="h-3 bg-gold/10 w-1/2" />
                  </div>
                ))}
              </div>
            ) : popularDishes.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gold/20">
                <p className="text-xs uppercase tracking-widest font-sans text-gold">
                  No featured items available. Check back soon!
                </p>
              </div>
            ) : (
              // Popular dishes cards
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {popularDishes.map((item) => (
                  <div
                    key={item.id}
                    className="bg-cream-light border border-cream-dark rounded-2xl overflow-hidden flex flex-col justify-between group shadow-md hover:shadow-xl hover:border-gold transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal">
                      <div className="absolute top-4 left-4 z-10">
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
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = fallbackImage;
                        }}
                      />
                      <div className="absolute bottom-4 right-4 bg-charcoal/70 backdrop-blur-sm text-cream-light text-[9px] uppercase tracking-wider font-sans font-bold px-2.5 py-1">
                        {item.prepTime} Mins
                      </div>
                    </div>

                    <div className="p-6 flex flex-col gap-4 flex-grow justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div>
                            <h3 className="font-serif text-base font-bold text-charcoal">
                              {item.name}
                            </h3>
                            {item.teluguName && (
                              <span className="text-xs text-gold font-serif block">
                                {item.teluguName}
                              </span>
                            )}
                          </div>
                          <span className="font-sans text-sm font-bold text-gold whitespace-nowrap">
                            ₹{item.price}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-light font-sans leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className={`w-full py-3.5 text-center text-[9px] uppercase tracking-widest font-sans font-bold transition-all duration-300 flex items-center justify-center gap-2 border select-none cursor-pointer ${
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
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/menu">
                <LuxuryButton variant="secondary">
                  {language === "TE" ? "పూర్తి మెనూ చూడండి" : "View Entire Menu"}
                </LuxuryButton>
              </Link>
            </div>
          </div>
        </section>


        {/* ====================================================
            SECTION 2: WHY CHOOSE PRAVADHYA FOODS
           ==================================================== */}
        <section className="py-24 px-6 bg-cream-light border-b border-gold/15 transition-colors duration-300" id="why-choose-us">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold mb-4">
                {t("why_choose_us")}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-extrabold text-charcoal">
                {language === "TE" ? "మా ప్రత్యేకతలు" : "Why PraVaDhya Foods"}
              </h2>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: t("traditional_recipes"),
                  desc: t("traditional_recipes_desc"),
                  icon: <Utensils className="text-gold" size={24} />
                },
                {
                  title: t("fresh_ingredients"),
                  desc: t("fresh_ingredients_desc"),
                  icon: <Heart className="text-gold" size={24} />
                },
                {
                  title: t("family_dining"),
                  desc: t("family_dining_desc"),
                  icon: <Award className="text-gold" size={24} />
                },
                {
                  title: t("fast_service"),
                  desc: t("fast_service_desc"),
                  icon: <ShieldCheck className="text-gold" size={24} />
                }
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-cream p-8 border border-gold/10 hover:border-gold/30 hover:shadow-xl transition-all duration-300 flex flex-col items-start"
                >
                  <div className="p-3 bg-gold/10 mb-6 rounded-none">
                    {card.icon}
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-4 text-charcoal uppercase tracking-wide">
                    {card.title}
                  </h3>
                  <p className="font-sans font-normal text-charcoal-light text-xs leading-relaxed">
                    {card.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* ====================================================
            SECTION 3: CUSTOMER REVIEWS
           ==================================================== */}
        <section className="py-24 px-6 bg-cream border-b border-gold/15 transition-colors duration-300" id="customer-reviews">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold mb-4">
                {t("testimonials")}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-extrabold text-charcoal">
                {language === "TE" ? "కస్టమర్ల మాటలలో..." : "Guest Diaries"}
              </h2>
            </div>

            {loadingReviews ? (
              <div className="h-64 flex items-center justify-center border border-gold/10">
                <span className="animate-pulse tracking-widest text-[9px] uppercase text-gold font-sans">
                  Retrieving Reviews...
                </span>
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-center text-xs uppercase tracking-widest font-sans text-gold">No reviews submitted yet.</p>
            ) : (
              /* Testimonial slider card */
              <div className="bg-cream-light border border-gold/15 p-8 md:p-16 shadow-2xl relative">
                <Quote className="absolute top-8 left-8 text-gold/10" size={80} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: currentReview.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-gold text-gold" />
                    ))}
                  </div>

                  <p className="font-serif text-lg md:text-xl italic font-normal text-charcoal leading-relaxed mb-8 max-w-2xl">
                    "{currentReview.comment}"
                  </p>

                  <div>
                    <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-gold mb-1">
                      {currentReview.name}
                    </h4>
                    <span className="text-[10px] font-sans text-charcoal-light uppercase tracking-wider">
                      Verified Guest
                    </span>
                  </div>
                </div>

                {/* Slider Dots Indicator */}
                <div className="flex justify-center gap-3 mt-10">
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveReview(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeReview === idx ? "bg-gold w-6" : "bg-gold/25"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>


        {/* ====================================================
            SECTION 4: RESERVE YOUR TABLE
           ==================================================== */}
        <div id="reserve-section">
          <ReservationForm />
        </div>


        {/* ====================================================
            SECTION 5: CONTACT INFORMATION
           ==================================================== */}
        <section className="py-24 px-6 bg-cream transition-colors duration-300" id="contact-info">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold mb-4">
                {t("contact_us")}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-extrabold text-charcoal">
                {language === "TE" ? "మమ్మల్ని సంప్రదించండి" : "Reach Our Branch"}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Address details */}
              <div className="lg:col-span-5 flex flex-col gap-8 font-sans">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-gold/10 text-gold">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-gold mb-2">Our Address</h4>
                    <p className="text-xs text-charcoal-light leading-relaxed font-normal">
                      19/243, Rani Nagar,<br />
                      Anantapur, Andhra Pradesh, India
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-gold/10 text-gold">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-gold mb-2">Phone Contacts</h4>
                    <p className="text-xs text-charcoal-light leading-relaxed font-normal">
                      Reservations: +91 97004 00024<br />
                      Events: +91 86884 77090
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-gold/10 text-gold">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-gold mb-2">Email Desk</h4>
                    <p className="text-xs text-charcoal-light leading-relaxed font-normal">
                      contact@pravadhya.com<br />
                      catering@pravadhya.com
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-gold/10 text-gold">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-gold mb-2">Business Hours</h4>
                    <p className="text-xs text-charcoal-light leading-relaxed font-normal">
                      Every Day: 11:00 AM - 11:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Map embed / visual block */}
              <div className="lg:col-span-7 h-96 bg-cream-light border border-gold/15 overflow-hidden relative flex items-center justify-center p-8 group shadow-lg">
                <div className="absolute inset-0 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                <div className="text-center z-10 flex flex-col items-center gap-4">
                  <h3 className="font-serif text-lg text-charcoal uppercase tracking-wide">
                    PraVaDhya Foods Anantapur Branch Map
                  </h3>
                  <p className="text-[10px] text-charcoal-light uppercase tracking-widest max-w-sm">
                    Interactive mapping location. Find us opposite to KIMS Saveera Hospital, Anantapur.
                  </p>
                  <a
                    href="https://maps.google.com/?q=Anantapur"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-[0.2em] font-sans font-bold border border-gold text-gold px-6 py-3.5 hover:bg-gold hover:text-charcoal transition-all duration-300"
                  >
                    Open Google Maps
                  </a>
                </div>
                <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-gold/30" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-gold/30" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Reusable premium minimal footer */}
      <footer className="w-full border-t border-gold/15 bg-charcoal py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-serif text-xl tracking-wider text-white uppercase font-bold">
              {t("brand_name")}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-sans font-semibold">
              {t("tagline")}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-[10px] uppercase tracking-[0.2em] font-sans text-cream-light/60">
            <Link href="/privacy" className="hover:text-gold transition-colors text-[#A1A1A1]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gold transition-colors text-[#A1A1A1]">Terms of Service</Link>
            <Link href="/contact" className="hover:text-gold transition-colors text-[#A1A1A1]">Contact</Link>
          </div>

          <p className="text-[10px] tracking-wider text-[#A1A1A1] font-sans font-normal">
            © {new Date().getFullYear()} {t("brand_name")}. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp chat launcher */}
      <a
        href="https://wa.me/919700400024?text=Hi%20PraVaDhya%20Foods%2C%20I'd%20like%20to%20inquire%20about%20a%20table%20reservation."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-cream-light p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border border-emerald-400/35 cursor-pointer pointer-events-auto"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle size={24} className="fill-current text-white" />
      </a>
    </div>
  );
}
