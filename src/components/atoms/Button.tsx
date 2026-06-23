"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface LuxuryButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const LuxuryButton: React.FC<LuxuryButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled = false,
}) => {
  // Base classes utilizing Inter font (mapped to font-sans), uppercase tracking, and focus styles
  const baseStyles = 
    "px-8 py-4 font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  // Specific variant configurations
  const variants = {
    primary: "bg-[#FEA116] text-white hover:bg-[#E08E0B] hover:text-white transition-all duration-300",
    secondary: "bg-white border border-[#FEA116] text-[#FEA116] hover:bg-[#FEA116]/5 transition-all duration-300",
  };

  // framer-motion physical feedback animations for interaction
  const hoverAnimation = disabled 
    ? {} 
    : {
        scale: 1.02,
        y: -2,
        boxShadow: variant === "primary" 
          ? "0 10px 25px rgba(197, 168, 128, 0.3)" 
          : "0 10px 25px rgba(18, 18, 18, 0.06)"
      };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={hoverAnimation}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={twMerge(clsx(baseStyles, variants[variant], className))}
    >
      {children}
    </motion.button>
  );
};
