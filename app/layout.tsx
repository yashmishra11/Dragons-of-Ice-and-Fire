import { AuthProvider } from "@/components/AuthProvider";
import { DragonTransitionProvider } from "@/components/DragonTransition";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import type { Metadata } from "next";

import "./globals.css";

import FooterCredits from "@/components/FooterCredits";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dragons-of-ice-and-fire.vercel.app"),
  title: "Dragons of Ice & Fire — Interactive Westeros Dragon Map & Lore",
  description: "Explore the legendary dragons of House Targaryen, wild dragons of Dragonstone, and their riders across Westeros.",
  icons: {
    icon: "/logo-emblem.png",
    apple: "/logo-emblem.png",
  },
  openGraph: {
    title: "Dragons of Ice & Fire — Interactive Westeros Dragon Map & Lore",
    description: "Explore the legendary dragons of House Targaryen, wild dragons of Dragonstone, and their riders across Westeros.",
    images: [{ url: "/logo-full.png", width: 1024, height: 1024, alt: "Dragons of Ice & Fire Logo" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#08070b] text-zinc-100 min-h-screen flex flex-col font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <AuthProvider>
          <DragonTransitionProvider>
            <SmoothScroll />
            <Header />
            <div className="flex-1">{children}</div>
            <FooterCredits />
          </DragonTransitionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
