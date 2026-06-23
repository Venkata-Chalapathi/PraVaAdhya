"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, LogOut, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { CartDrawer } from "./CartDrawer";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  const { cart } = useCart();
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "TE" : "EN");
  };

  const navLinks = [
    { label: t("nav_home"), href: "/" },
    { label: t("nav_menu"), href: "/menu" },
    { label: t("nav_reservations"), href: "/#reserve-section" },
    { label: t("nav_contact"), href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gold/15 bg-cream-light/95 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          
          {/* Logo and Brand Identity */}
          <Link href="/" className="flex flex-col items-start gap-1 group">
            <span className="font-serif text-2xl font-bold tracking-wider text-charcoal group-hover:text-gold transition-colors duration-300">
              {t("brand_name")}
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-sans font-semibold">
              {t("tagline")}
            </span>
          </Link>

          {/* Navigation and Utilities Container */}
          <div className="hidden lg:flex items-center gap-10 ml-auto">
            {/* Desktop Navigation Links */}
            <nav className="flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href.startsWith("/#") && pathname === "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs uppercase tracking-[0.2em] font-sans transition-colors duration-300 relative group py-2 font-bold ${
                      isActive
                        ? "text-gold"
                        : "text-charcoal hover:text-gold"
                    }`}
                  >
                    {link.label}
                    <span className={`absolute bottom-0 left-0 h-[2px] bg-gold transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`} />
                  </Link>
                );
              })}
              {/* Show Admin Dashboard Link if admin */}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-gold hover:text-gold-dark transition-colors flex items-center gap-1.5"
                >
                  <Shield size={14} />
                  {t("nav_admin")}
                </Link>
              )}
            </nav>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-gold/15" />

            {/* Toolbar Utilities */}
            <div className="flex items-center gap-5 xl:gap-6">
              {/* Language Selector */}
              <button
                onClick={toggleLanguage}
                className="text-[10px] tracking-widest font-sans font-bold border border-gold text-gold px-3.5 py-2 transition-all hover:bg-gold hover:text-cream-light cursor-pointer uppercase"
                title="Toggle Language"
              >
                {language === "EN" ? "తెలుగు" : "English"}
              </button>

              {/* Cart Icon & Badge */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-charcoal/80 hover:text-gold transition-colors focus:outline-none cursor-pointer"
                aria-label="View Cart"
              >
                <ShoppingBag size={18} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-charcoal text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-cream-light animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Auth Session Info */}
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(!userDropdownOpen);
                        setLoginDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-bold text-charcoal/90 hover:text-gold cursor-pointer"
                    >
                      <User size={16} className="text-gold" />
                      <span className="max-w-[120px] truncate">{user.name}</span>
                    </button>

                    <AnimatePresence>
                      {userDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setUserDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-3 w-48 bg-cream-light border border-gold/15 shadow-xl py-2 z-20"
                          >
                            <Link
                              href={user.role === "ADMIN" ? "/admin/dashboard" : "/profile/dashboard"}
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-charcoal hover:bg-gold/10 hover:text-gold transition-colors font-bold"
                            >
                              <User size={14} />
                              Dashboard
                            </Link>
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false);
                                logout();
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-rose-500 hover:bg-rose-500/10 transition-colors font-bold text-left cursor-pointer"
                            >
                              <LogOut size={14} />
                              Logout
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setLoginDropdownOpen(!loginDropdownOpen);
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-sans font-bold text-charcoal hover:text-gold py-1.5 cursor-pointer"
                    >
                      <User size={14} className="text-gold" />
                      Sign In
                    </button>

                    <AnimatePresence>
                      {loginDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setLoginDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-3 w-48 bg-cream-light border border-gold/15 shadow-xl py-2 z-20"
                          >
                            <Link
                              href="/login"
                              onClick={() => setLoginDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-charcoal hover:bg-gold/10 hover:text-gold transition-colors font-bold"
                            >
                              <User size={14} />
                              Guest Login
                            </Link>
                            <Link
                              href="/admin/login"
                              onClick={() => setLoginDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-gold hover:bg-gold/10 hover:text-gold-dark transition-colors font-bold"
                            >
                              <Shield size={14} />
                              Admin Login
                            </Link>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Desktop Reserve Button (Filled Orange CTA) */}
              <Link
                href="/#reserve-section"
                className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold bg-gold text-charcoal px-5 py-3.5 hover:bg-gold-dark transition-all duration-300 border border-gold"
              >
                {t("reserve_table")}
              </Link>
            </div>
          </div>

          {/* Mobile Menu & Utility Bar Toggle */}
          <div className="flex lg:hidden items-center gap-4">
            {/* Mobile Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-charcoal/80 hover:text-gold transition-colors focus:outline-none"
              aria-label="View Cart"
            >
              <ShoppingBag size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-charcoal text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-cream-light">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-24 left-0 w-full bg-cream-light border-b border-gold/15 px-6 py-8 flex flex-col gap-6 lg:hidden shadow-xl z-40 text-charcoal"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href.startsWith("/#") && pathname === "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm uppercase tracking-[0.2em] font-sans transition-colors ${
                      isActive
                        ? "text-gold font-extrabold"
                        : "text-charcoal font-bold hover:text-gold"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-[0.2em] font-sans font-bold text-gold flex items-center gap-2"
                >
                  <Shield size={16} />
                  {t("nav_admin")}
                </Link>
              )}

              <hr className="border-gold/15" />

              {/* Utility Grid inside Mobile Drawer */}
              <div className="flex justify-between items-center">
                {/* Language Switch */}
                <button
                  onClick={() => {
                    toggleLanguage();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs tracking-widest font-sans font-bold border border-gold text-gold px-4 py-2 hover:bg-gold hover:text-cream-light"
                >
                  {language === "EN" ? "తెలుగు" : "English"}
                </button>
              </div>

              {/* Login / Register or Profile */}
              {user ? (
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-gold">
                    <User size={16} />
                    Logged in as: {user.name}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href={user.role === "ADMIN" ? "/admin/dashboard" : "/profile/dashboard"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center text-xs uppercase tracking-[0.2em] font-sans font-bold border border-charcoal/30 py-3 hover:bg-charcoal hover:text-cream-light transition-all"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-center text-xs uppercase tracking-[0.2em] font-sans font-bold border border-rose-500/30 text-rose-500 py-3 hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center text-xs uppercase tracking-[0.1em] font-sans font-bold bg-gold text-cream-light py-3 hover:bg-gold-dark transition-all"
                  >
                    Guest Login
                  </Link>
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center text-xs uppercase tracking-[0.1em] font-sans font-bold border border-gold text-gold py-3 hover:bg-gold/10 transition-all"
                  >
                    Admin Login
                  </Link>
                </div>
              )}

              {/* Reserve CTA */}
              <Link
                href="/#reserve-section"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs uppercase tracking-[0.2em] font-sans font-bold bg-gold text-charcoal py-4 hover:bg-gold-dark transition-all duration-300 border border-gold"
              >
                {t("reserve_table")}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Sidebar Drawer Panel */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};
export default Navbar;
