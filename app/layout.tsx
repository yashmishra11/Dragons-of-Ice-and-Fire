import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";
import type { Metadata } from "next";
// @ts-ignore: CSS module type declarations are not present in this project
import "./globals.css";

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
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-zinc-900 bg-black/90 py-6 text-center text-xs text-zinc-400 font-cinzel">
            <p>Dragons of Ice & Fire &copy; {new Date().getFullYear()} — A Song of Ice and Fire / Game of Thrones Lore Archive</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}