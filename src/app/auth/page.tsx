"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-light text-charcoal">
      <p className="animate-pulse tracking-widest text-xs uppercase text-gold font-sans">
        Redirecting to login...
      </p>
    </div>
  );
}
