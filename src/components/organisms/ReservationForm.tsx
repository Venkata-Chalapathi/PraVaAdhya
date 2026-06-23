"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, User, Mail, Phone, MessageSquare, CheckCircle } from "lucide-react";
import { LuxuryButton } from "@/components/atoms/Button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  date: z.string().min(1, "Please select a date."),
  time: z.string().min(1, "Please select a time."),
  partySize: z.number()
    .min(1, "Party size must be at least 1.")
    .max(12, "For parties larger than 12, please contact us directly."),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const ReservationForm: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      partySize: 2,
      notes: "",
    },
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          customerId: user?.customerId || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setServerMessage(result.message);
        setSuccess(true);
      } else {
        setServerMessage(result.message || "Failed to make reservation.");
      }
    } catch (err) {
      setServerMessage("Unable to connect to the server. Please try again.");
    }
  };

  const handleReset = () => {
    reset({
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      date: "",
      time: "",
      partySize: 2,
      notes: "",
    });
    setSuccess(false);
    setServerMessage(null);
  };

  return (
    <section className="py-28 px-6 bg-cream text-charcoal relative overflow-hidden" id="reserve-section">
      {/* Soft decorative background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold mb-4">
            {t("securing_table")}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-extrabold mb-6">
            {t("make_reservation")}
          </h2>
          <p className="font-sans font-normal text-charcoal-light text-sm max-w-md leading-relaxed">
            {language === "TE"
              ? "మా ప్రత్యేక డైనింగ్ అనుభవం కోసం ముందుగానే మీ టేబుల్ రిజర్వ్ చేసుకోండి."
              : "Join us for an evening of sophisticated culinary exploration. Kindly complete the form below to request a table."}
          </p>
        </div>

        {/* Form Card Container */}
        <div className="bg-white text-charcoal max-w-xl mx-auto p-8 md:p-12 shadow-2xl border border-gold/15 rounded-2xl relative min-h-[520px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form
                key="reservation-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                {/* Full Name Field */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="name" className="text-charcoal font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-2">
                    <User size={12} className="text-gold" />
                    {language === "TE" ? "పూర్తి పేరు" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 bg-white border border-cream-dark text-charcoal placeholder-charcoal-light/60 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gold rounded-md transition-all duration-300"
                    placeholder={language === "TE" ? "ఉదాహరణ: శ్రీనివాస్" : "e.g. Srinivas"}
                    {...register("name")}
                  />
                  {errors.name && (
                    <span className="text-[10px] text-red-600 font-sans tracking-wide mt-1 block">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="email" className="text-charcoal font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-2">
                    <Mail size={12} className="text-gold" />
                    {language === "TE" ? "ఇమెయిల్ అడ్రస్" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 bg-white border border-cream-dark text-charcoal placeholder-charcoal-light/60 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gold rounded-md transition-all duration-300"
                    placeholder="e.g. name@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <span className="text-[10px] text-red-600 font-sans tracking-wide mt-1 block">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Phone Field */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="phone" className="text-charcoal font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-2">
                    <Phone size={12} className="text-gold" />
                    {language === "TE" ? "ఫోన్ నెంబర్" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 bg-white border border-cream-dark text-charcoal placeholder-charcoal-light/60 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gold rounded-md transition-all duration-300"
                    placeholder="e.g. +91 99999 99999"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <span className="text-[10px] text-red-600 font-sans tracking-wide mt-1 block">
                      {errors.phone.message}
                    </span>
                  )}
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select Date */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="date" className="text-charcoal font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-2">
                      <Calendar size={12} className="text-gold" />
                      {language === "TE" ? "తేదీ" : "Select Date"}
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="w-full px-4 py-3 bg-white border border-cream-dark text-charcoal placeholder-charcoal-light/60 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gold rounded-md transition-all duration-300"
                      {...register("date")}
                    />
                    {errors.date && (
                      <span className="text-[10px] text-red-600 font-sans tracking-wide mt-1 block">
                        {errors.date.message}
                      </span>
                    )}
                  </div>

                  {/* Select Time */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="time" className="text-charcoal font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-2">
                      <Clock size={12} className="text-gold" />
                      {language === "TE" ? "సమయం" : "Select Time"}
                    </label>
                    <input
                      type="time"
                      id="time"
                      className="w-full px-4 py-3 bg-white border border-cream-dark text-charcoal placeholder-charcoal-light/60 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gold rounded-md transition-all duration-300"
                      {...register("time")}
                    />
                    {errors.time && (
                      <span className="text-[10px] text-red-600 font-sans tracking-wide mt-1 block">
                        {errors.time.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Guest Count Field */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="partySize" className="text-charcoal font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-2">
                    <Users size={12} className="text-gold" />
                    {language === "TE" ? "అతిథుల సంఖ్య" : "Number of Guests"}
                  </label>
                  <input
                    type="number"
                    id="partySize"
                    min="1"
                    max="12"
                    className="w-full px-4 py-3 bg-white border border-cream-dark text-charcoal placeholder-charcoal-light/60 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gold rounded-md transition-all duration-300"
                    placeholder="2"
                    {...register("partySize", { valueAsNumber: true })}
                  />
                  {errors.partySize && (
                    <span className="text-[10px] text-red-600 font-sans tracking-wide mt-1 block">
                      {errors.partySize.message}
                    </span>
                  )}
                </div>

                {/* Special Notes Field */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="notes" className="text-charcoal font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={12} className="text-gold" />
                    {language === "TE" ? "ప్రత్యేక సూచనలు (ఐచ్ఛికం)" : "Special Requests (Optional)"}
                  </label>
                  <input
                    type="text"
                    id="notes"
                    className="w-full px-4 py-3 bg-white border border-cream-dark text-charcoal placeholder-charcoal-light/60 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gold rounded-md transition-all duration-300"
                    placeholder={language === "TE" ? "ఉదాహరణ: విండో సీటు కావాలి" : "e.g. Prefer window seat"}
                    {...register("notes")}
                  />
                </div>

                {/* Submission CTA */}
                <div className="pt-6">
                  <LuxuryButton
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-center py-4"
                  >
                    {isSubmitting
                      ? (language === "TE" ? "టేబుల్ బుక్ అవుతోంది..." : "Securing Table...")
                      : t("reserve_table_cta")}
                  </LuxuryButton>
                </div>
              </motion.form>
            ) : (
              // Success Panel
              <motion.div
                key="reservation-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center py-6 flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-6 p-3 bg-gold/15 rounded-full text-gold"
                >
                  <CheckCircle size={44} />
                </motion.div>

                <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal mb-4 uppercase">
                  {language === "TE" ? "అభ్యర్థన పంపబడింది" : "Request Submitted"}
                </h3>

                <p className="font-sans font-normal text-charcoal-light text-sm max-w-sm leading-relaxed mb-10">
                  {serverMessage}
                </p>

                <LuxuryButton variant="secondary" onClick={handleReset}>
                  {language === "TE" ? "మరొక టేబుల్ బుక్ చేయండి" : "Book Another Table"}
                </LuxuryButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
export default ReservationForm;
