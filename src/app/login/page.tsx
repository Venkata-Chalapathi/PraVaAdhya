"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Phone, ArrowLeft, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { LuxuryButton } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

type AuthMode = "login" | "register" | "forgot";

export default function CustomerAuthPage() {
  const router = useRouter();
  const { login, registerCustomer, user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState<string | null>(null);

  // Redirect if user already logged in as customer
  useEffect(() => {
    if (user && user.role === "CUSTOMER") {
      router.push("/profile/dashboard");
    }
  }, [user, router]);

  // Form Hooks
  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const onLoginSubmit = async (data: LoginData) => {
    setError(null);
    const result = await login(data.email, data.password);
    if (result.success) {
      toast("Welcome back!", "success");
      router.push("/profile/dashboard");
    } else {
      setError(result.error || "Login failed.");
      toast(result.error || "Login failed.", "error");
    }
  };

  const onRegisterSubmit = async (data: RegisterData) => {
    setError(null);
    const result = await registerCustomer(data.name, data.email, data.password, data.phone);
    if (result.success) {
      toast("Account registered successfully!", "success");
      router.push("/profile/dashboard");
    } else {
      setError(result.error || "Sign-up failed.");
      toast(result.error || "Registration failed.", "error");
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("A password reset link has been dispatched to your inbox (Simulation).", "info");
    setMode("login");
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal py-20 px-6 transition-colors duration-300 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Back Link */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-bold hover:text-gold transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
        </div>

        {/* Auth Box */}
        <div className="bg-white p-8 md:p-12 border border-gold/15 shadow-xl">
          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal">Login</h2>
                  <p className="text-[9px] uppercase tracking-widest text-gold mt-2 font-sans font-bold">
                    PraVaDhya Foods
                  </p>
                </div>

                {error && (
                  <div className="bg-rose-50 border-l-2 border-rose-500 p-3 mb-6">
                    <p className="text-xs text-rose-600 font-sans">{error}</p>
                  </div>
                )}

                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6" noValidate>
                  <Input
                    label="Email Address"
                    id="login-email"
                    type="email"
                    icon={<Mail size={16} />}
                    error={loginForm.formState.errors.email?.message}
                    {...loginForm.register("email")}
                  />

                  <Input
                    label="Password"
                    id="login-password"
                    type="password"
                    icon={<Lock size={16} />}
                    error={loginForm.formState.errors.password?.message}
                    {...loginForm.register("password")}
                  />

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[10px] uppercase tracking-wider font-sans font-bold text-gold hover:underline focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <LuxuryButton
                    type="submit"
                    disabled={loginForm.formState.isSubmitting}
                    className="w-full py-4 text-center"
                  >
                    {loginForm.formState.isSubmitting ? "Logging in..." : "Login"}
                  </LuxuryButton>

                  <div className="text-center pt-4 border-t border-gold/10 mt-6">
                    <p className="text-xs text-charcoal-light font-sans">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("register")}
                        className="font-bold text-gold hover:underline focus:outline-none"
                      >
                        Register Here
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {mode === "register" && (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal">Register</h2>
                  <p className="text-[9px] uppercase tracking-widest text-gold mt-2 font-sans font-bold">
                    Create Guest Profile
                  </p>
                </div>

                {error && (
                  <div className="bg-rose-50 border-l-2 border-rose-500 p-3 mb-6">
                    <p className="text-xs text-rose-600 font-sans">{error}</p>
                  </div>
                )}

                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6" noValidate>
                  <Input
                    label="Full Name"
                    id="reg-name"
                    icon={<User size={16} />}
                    error={registerForm.formState.errors.name?.message}
                    {...registerForm.register("name")}
                  />

                  <Input
                    label="Email Address"
                    id="reg-email"
                    type="email"
                    icon={<Mail size={16} />}
                    error={registerForm.formState.errors.email?.message}
                    {...registerForm.register("email")}
                  />

                  <Input
                    label="Mobile Number"
                    id="reg-phone"
                    type="tel"
                    icon={<Phone size={16} />}
                    error={registerForm.formState.errors.phone?.message}
                    placeholder="9876543210"
                    {...registerForm.register("phone")}
                  />

                  <Input
                    label="Password"
                    id="reg-password"
                    type="password"
                    icon={<Lock size={16} />}
                    error={registerForm.formState.errors.password?.message}
                    {...registerForm.register("password")}
                  />

                  <LuxuryButton
                    type="submit"
                    disabled={registerForm.formState.isSubmitting}
                    className="w-full py-4 text-center"
                  >
                    {registerForm.formState.isSubmitting ? "Creating Account..." : "Create Account"}
                  </LuxuryButton>

                  <div className="text-center pt-4 border-t border-gold/10 mt-6">
                    <p className="text-xs text-charcoal-light font-sans">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="font-bold text-gold hover:underline focus:outline-none"
                      >
                        Login Here
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {mode === "forgot" && (
              <motion.div
                key="forgot-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <KeyRound size={28} className="text-gold mx-auto mb-2" />
                  <h2 className="font-serif text-2xl font-bold text-charcoal">Reset Password</h2>
                  <p className="text-xs text-charcoal-light mt-2 font-sans">
                    Provide your email to receive recovery instructions.
                  </p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-6">
                  <Input
                    label="Email Address"
                    id="forgot-email"
                    type="email"
                    icon={<Mail size={16} />}
                    required
                  />

                  <LuxuryButton type="submit" className="w-full py-4 text-center">
                    Send Reset Link
                  </LuxuryButton>

                  <div className="text-center pt-4 border-t border-gold/10 mt-6">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-xs font-bold text-gold hover:underline focus:outline-none"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
