"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LuxuryButton } from "@/components/atoms/Button";
import { useLanguage } from "@/context/LanguageContext";

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen w-full bg-cream-light flex items-center justify-center overflow-hidden py-12 lg:py-0 select-none transition-colors duration-300" id="experience">
      
      {/* Food Background Image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-[0.08] mix-blend-multiply transition-opacity duration-300">
        <Image
          src="/hero-food-bg.png"
          alt="Traditional Indian Spices Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Background decoration with traditional dot pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#FEA116_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none z-0" />
      
      {/* Decorative orange ambient lights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-gold/10 to-transparent blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-gold/5 to-transparent blur-[150px] pointer-events-none z-0" />

      {/* Content Area */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-24 lg:pt-0">
        
        {/* Left Side Content - col span 6 */}
        <div className="lg:col-span-6 text-left flex flex-col items-start justify-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-gold font-sans font-bold mb-4"
          >
            {t("welcome") || "సంప్రదాయ రుచుల సమాహారం"}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-charcoal tracking-tight leading-tight mb-6 uppercase"
          >
            {t("brand_name") || "PraVaDhya Foods"} <br />
            <span className="italic font-normal text-gold text-2xl md:text-3xl lg:text-4xl xl:text-5xl lowercase tracking-normal block mt-2">
              {t("tagline") || "సంప్రదాయ రుచులకు కొత్త చిరునామా!"}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans font-normal text-charcoal-light text-sm md:text-base lg:text-lg max-w-xl leading-relaxed mb-8"
          >
            Experience authentic, farm-fresh traditional Telugu cuisine made from organic spices and recipes handed down through generations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.6,
            }}
            className="flex flex-row gap-4 items-center"
          >
            <Link href="/menu">
              <LuxuryButton variant="primary">
                {t("explore_menu") || "Explore Menu"}
              </LuxuryButton>
            </Link>
            <Link href="/#reserve-section">
              <LuxuryButton variant="secondary">
                {t("reserve_table") || "Reserve Table"}
              </LuxuryButton>
            </Link>
          </motion.div>
        </div>

        {/* Right Side - Premium Rotating Food Plate - col span 6 */}
        <div className="lg:col-span-6 flex items-center justify-center relative w-full h-[320px] md:h-[450px] lg:h-[550px]">
          
          {/* Ambient Orange glow behind the plate */}
          <motion.div 
            className="absolute w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full bg-gold/10 blur-[80px] pointer-events-none z-0"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1.5 }}
          />

          {/* Wrapper 1: Entrance Animation */}
          <motion.div
            className="relative z-10 w-72 h-72 md:w-[380px] md:h-[380px] lg:w-[480px] lg:h-[480px] xl:w-[530px] xl:h-[530px] flex items-center justify-center"
            initial={{ x: "100vw", rotate: -15, scale: 0.9, opacity: 0 }}
            animate={{ x: 0, rotate: 0, scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 45,
              damping: 14,
              duration: 1.4,
              ease: "easeOut"
            }}
          >
            {/* Wrapper 2: Floating Animation (y-axis) */}
            <motion.div
              className="w-full h-full relative flex items-center justify-center"
              animate={{ y: [0, -14, 0] }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut"
              }}
            >
              {/* Wrapper 3: Infinite Rotation with soft orange drop shadow */}
              <motion.div
                className="w-full h-full relative drop-shadow-[0_20px_45px_rgba(254,161,22,0.35)]"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 50,
                  ease: "linear"
                }}
              >
                <Image
                  src="/menu/telugu_thali_v3.png"
                  alt="Guntur Chicken Biryani"
                  fill
                  priority
                  sizes="(max-width: 768px) 280px, (max-width: 1024px) 380px, 530px"
                  className="object-contain pointer-events-none select-none rounded-full"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative subtle bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cream-light via-cream-light/20 to-transparent pointer-events-none z-10" />
    </section>
  );
};
export default HeroSection;
