import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className }) => {
  const normStatus = status.toUpperCase();
  
  const baseStyles = 
    "inline-flex items-center px-3 py-1 text-[9px] uppercase tracking-widest font-sans font-semibold border select-none";
  
  const statusStyles: Record<string, string> = {
    // Orders & Booking statuses
    PENDING: "bg-yellow-50/70 text-yellow-700 border-yellow-200/50",
    APPROVED: "bg-green-50/70 text-green-700 border-green-200/50",
    CONFIRMED: "bg-blue-50/70 text-blue-700 border-blue-200/50",
    PREPARING: "bg-orange-50/70 text-orange-700 border-orange-200/50",
    READY: "bg-teal-50/70 text-teal-700 border-teal-200/50",
    OUT_FOR_DELIVERY: "bg-purple-50/70 text-purple-700 border-purple-200/50",
    DELIVERED: "bg-emerald-50/70 text-emerald-700 border-emerald-200/50",
    REJECTED: "bg-red-50/70 text-red-700 border-red-200/50",
    CANCELLED: "bg-zinc-100/70 text-zinc-500 border-zinc-300/50",
    
    // Dining Table statuses
    AVAILABLE: "bg-emerald-50/70 text-emerald-700 border-emerald-200/50",
    RESERVED: "bg-amber-50/70 text-amber-700 border-amber-200/50",
    OCCUPIED: "bg-rose-50/70 text-rose-700 border-rose-200/50",
    MAINTENANCE: "bg-zinc-100/70 text-zinc-600 border-zinc-300/50",
  };

  return (
    <span className={twMerge(clsx(baseStyles, statusStyles[normStatus] || "bg-zinc-50 text-zinc-700 border-zinc-200", className))}>
      {status.replace(/_/g, " ")}
    </span>
  );
};
export default Badge;
