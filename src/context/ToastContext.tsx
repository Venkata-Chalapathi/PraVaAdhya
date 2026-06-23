"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const icons = {
    success: <CheckCircle className="text-emerald-600 mr-3 flex-shrink-0" size={18} />,
    error: <AlertCircle className="text-rose-600 mr-3 flex-shrink-0" size={18} />,
    info: <Info className="text-blue-600 mr-3 flex-shrink-0" size={18} />,
  };

  const themeStyles = {
    success: "bg-cream text-charcoal border-emerald-500/30 shadow-emerald-500/5",
    error: "bg-cream text-charcoal border-rose-500/30 shadow-rose-500/5",
    info: "bg-cream text-charcoal border-blue-500/30 shadow-blue-500/5",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Container holding active toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-6 md:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={`p-4 border shadow-xl flex items-center pointer-events-auto rounded-none font-sans text-xs uppercase tracking-wider font-semibold border-l-4 ${
                t.type === "success" ? "border-l-emerald-500" : t.type === "error" ? "border-l-rose-500" : "border-l-blue-500"
              } ${themeStyles[t.type]}`}
            >
              {icons[t.type]}
              <span className="flex-1 leading-normal">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
