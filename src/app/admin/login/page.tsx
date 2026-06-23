"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LuxuryButton } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { useToast } from "@/context/ToastContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { toast } = useToast();
  
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  // Check if system setup is required on mount
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch("/api/admin/setup");
        if (res.ok) {
          const data = await res.json();
          if (data.setupRequired) {
            toast("Initial setup required. Redirecting...", "info");
            router.push("/admin/setup");
          }
        }
      } catch (err) {
        console.error("Failed to check database setup status:", err);
      }
    };
    checkSetup();
  }, [router, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setError(null);
    const result = await login(data.email, data.password);
    
    if (result.success) {
      toast("Admin login successful!", "success");
      router.push("/admin/dashboard");
    } else {
      setError(result.error || "Invalid credentials.");
      toast(result.error || "Authentication failed.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal py-20 px-6 transition-colors duration-300 flex flex-col justify-center items-center relative">
      {/* Background soft lighting glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-bold hover:text-gold transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>

        {/* Login Box */}
        <div className="bg-white p-8 md:p-12 shadow-2xl border border-gold/15">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10 flex flex-col items-center">
              <ShieldAlert size={36} className="text-gold mb-3" />
              <h2 className="font-serif text-2xl font-extrabold tracking-wide text-charcoal">
                Admin Portal
              </h2>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-sans font-semibold mt-2">
                PraVaDhya Foods
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border-l-2 border-rose-500 p-4 mb-6">
                <p className="text-xs text-rose-600 font-sans">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <Input
                label="Email Address"
                id="email"
                type="email"
                icon={<Mail size={16} />}
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                id="password"
                type="password"
                icon={<Lock size={16} />}
                error={errors.password?.message}
                {...register("password")}
              />

              <div className="pt-6">
                <LuxuryButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-center"
                >
                  {isSubmitting ? "Authenticating..." : "Login to Portal"}
                </LuxuryButton>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
