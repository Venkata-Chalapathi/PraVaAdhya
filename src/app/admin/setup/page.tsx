"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ShieldAlert, User, Mail, Lock, CheckCircle } from "lucide-react";
import { LuxuryButton } from "@/components/atoms/Button";

const setupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SetupData = z.infer<typeof setupSchema>;

export default function AdminSetup() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupData>({
    resolver: zodResolver(setupSchema),
  });

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await fetch("/api/admin/setup");
        const data = await response.json();
        
        if (!data.setupRequired) {
          router.push("/admin/login");
        } else {
          setChecking(false);
        }
      } catch (err) {
        setError("Could not connect to the database. Make sure PostgreSQL is configured.");
        setChecking(false);
      }
    };

    checkSetup();
  }, [router]);

  const onSubmit = async (data: SetupData) => {
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/login");
        }, 3000);
      } else {
        setError(result.error || "Failed to create administrator account.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-charcoal font-sans">
        <p className="animate-pulse tracking-widest text-xs uppercase text-gold">
          Verifying Database Status...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-12 text-charcoal">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="bg-white max-w-md w-full p-8 md:p-12 shadow-2xl border border-gold/15 relative z-10">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 flex flex-col items-center"
          >
            <div className="mb-6 p-3 bg-gold/15 rounded-full text-gold">
              <CheckCircle size={44} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">
              Setup Completed
            </h2>
            <p className="font-sans font-normal text-charcoal-light text-sm max-w-sm leading-relaxed mb-6">
              The primary administrator account has been configured. Redirecting you to login...
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10 flex flex-col items-center">
              <ShieldAlert size={36} className="text-gold mb-3" />
              <h2 className="font-serif text-2xl font-extrabold tracking-wide text-charcoal">
                Owner Setup Wizard
              </h2>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-sans font-bold mt-2">
                PraVaDhya Foods
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-2 border-red-500 p-4 mb-6">
                <p className="text-xs text-red-600 font-sans">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Full Name */}
              <div className="relative w-full">
                <div className="flex items-center border-b border-charcoal/20 focus-within:border-gold transition-colors duration-300">
                  <User size={16} className="text-charcoal-light mr-3" />
                  <input
                    type="text"
                    id="name"
                    className="block w-full py-3 bg-transparent text-charcoal font-sans text-sm focus:outline-none peer placeholder-transparent"
                    placeholder="Owner Name"
                    {...register("name")}
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-7 top-3 text-charcoal-light font-sans text-xs md:text-sm uppercase tracking-wider transition-all duration-300 pointer-events-none origin-[0] transform -translate-y-6 scale-75 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold"
                  >
                    Owner Name
                  </label>
                </div>
                {errors.name && (
                  <span className="text-[10px] text-red-600 font-sans tracking-wide absolute mt-1">
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="relative w-full mt-6">
                <div className="flex items-center border-b border-charcoal/20 focus-within:border-gold transition-colors duration-300">
                  <Mail size={16} className="text-charcoal-light mr-3" />
                  <input
                    type="email"
                    id="email"
                    className="block w-full py-3 bg-transparent text-charcoal font-sans text-sm focus:outline-none peer placeholder-transparent"
                    placeholder="Email Address"
                    {...register("email")}
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-7 top-3 text-charcoal-light font-sans text-xs md:text-sm uppercase tracking-wider transition-all duration-300 pointer-events-none origin-[0] transform -translate-y-6 scale-75 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold"
                  >
                    Email Address
                  </label>
                </div>
                {errors.email && (
                  <span className="text-[10px] text-red-600 font-sans tracking-wide absolute mt-1">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="relative w-full mt-6">
                <div className="flex items-center border-b border-charcoal/20 focus-within:border-gold transition-colors duration-300">
                  <Lock size={16} className="text-charcoal-light mr-3" />
                  <input
                    type="password"
                    id="password"
                    className="block w-full py-3 bg-transparent text-charcoal font-sans text-sm focus:outline-none peer placeholder-transparent"
                    placeholder="Setup Password"
                    {...register("password")}
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-7 top-3 text-charcoal-light font-sans text-xs md:text-sm uppercase tracking-wider transition-all duration-300 pointer-events-none origin-[0] transform -translate-y-6 scale-75 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold"
                  >
                    Setup Password
                  </label>
                </div>
                {errors.password && (
                  <span className="text-[10px] text-red-600 font-sans tracking-wide absolute mt-1">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div className="pt-6">
                <LuxuryButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-center"
                >
                  {isSubmitting ? "Configuring System..." : "Initialize Platform"}
                </LuxuryButton>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
