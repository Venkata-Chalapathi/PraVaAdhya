import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PraVaDhya Foods | సంప్రదాయ రుచులకు కొత్త చిరునామా!",
    template: "%s | PraVaDhya Foods",
  },
  description: "Experience authentic Telugu cuisine and traditional flavors at PraVaDhya Foods. Enjoy farm-fresh organic ingredients, family dining, and Guntur recipes in a premium atmosphere.",
  keywords: [
    "PraVaDhya Foods",
    "Telugu cuisine",
    "Andhra restaurant",
    "traditional Telugu food",
    "Guntur Biryani",
    "Gongura Mutton",
    "Natu Kodi Pulusu",
    "Andhra Meals",
    "Pesarattu",
    "family dining",
    "fine dining",
  ],
  authors: [{ name: "PraVaDhya Culinary Team" }],
  creator: "PraVaDhya Foods Group",
  metadataBase: new URL("https://pravadhya-foods.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pravadhya-foods.vercel.app",
    title: "PraVaDhya Foods | సంప్రదాయ రుచులకు కొత్త చిరునామా!",
    description: "Experience the finest authentic Telugu cuisine, prepared with organic farm-fresh ingredients and traditional recipes.",
    siteName: "PraVaDhya Foods",
    images: [
      {
        url: "/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "PraVaDhya Foods Dining Room",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PraVaDhya Foods | సంప్రదాయ రుచులకు కొత్త చిరునామా!",
    description: "Experience the finest authentic Telugu cuisine, prepared with organic farm-fresh ingredients and traditional recipes.",
    images: ["/hero-bg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
