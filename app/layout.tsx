import { AuthProvider } from "@/components/AuthProvider";
import { DragonTransitionProvider } from "@/components/DragonTransition";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import type { Metadata } from "next";

import "./globals.css";

import FooterCredits from "@/components/FooterCredits";

export const metadata: Metadata = {
  title: "Dragons of Ice & Fire — Interactive Westeros Dragon Map & Lore",
  description: "Explore the legendary dragons of House Targaryen, wild dragons of Dragonstone, and their riders across Westeros.",
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
