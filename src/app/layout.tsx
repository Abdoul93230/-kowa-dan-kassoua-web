import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { QuickAuthProvider } from "@/contexts/QuickAuthContext";
import QuickAuthModal from "@/components/QuickAuthModal";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TakTak - Marketplace Niger",
  description: "La plateforme qui connecte vendeurs et acheteurs au Niger",
  icons: {
    icon: "/branding/flogo-removebg-preview.png",
    shortcut: "/branding/logo10-removebg-preview.png",
    apple: "/branding/logo10-removebg-preview.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QuickAuthProvider>
          <FavoritesProvider>
            {children}
            <ScrollToTop />
            <Toaster position="top-right" richColors />
            <QuickAuthModal />
          </FavoritesProvider>
        </QuickAuthProvider>
      </body>
    </html>
  );
}
