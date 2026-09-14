"use client";

import { useAuth } from "@/components/AuthProvider";
import { notFound } from "next/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08070b] text-amber-400 font-cinzel">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-amber-600/30 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs tracking-widest uppercase text-zinc-400">
            Consulting Archmaester Scrolls...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    notFound(); // hides admin existence
  }

  return <>{children}</>;
}
