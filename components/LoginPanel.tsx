"use client";

import { useAuth } from "@/components/AuthProvider";

export default function LoginPanel() {
  const { user, role, loading, openAuthModal, openAccountDrawer } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800/80 px-3 py-1.5 rounded-full text-xs">
        <span className="w-2 h-2 rounded-full bg-amber-500/50 animate-ping" />
        <span className="text-zinc-500 font-cinzel text-[11px]">Citadel...</span>
      </div>
    );
  }

  // Authenticated Member or Admin -> Display Account Icon button
  if (user) {
    const isHighAdmin = user.role === "admin";

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={openAccountDrawer}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all group border shadow-lg ${
            isHighAdmin
              ? "bg-gradient-to-r from-amber-950/80 via-zinc-900/90 to-amber-950/60 border-amber-600/50 hover:border-amber-400 hover:shadow-amber-900/30"
              : "bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 hover:border-amber-600/40"
          }`}
          title="Open Citadel Account Archives"
        >
          {/* Circular Maester / Avatar Seal */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-cinzel font-bold text-xs shadow-inner transition-transform group-hover:scale-105 ${
              isHighAdmin
                ? "bg-gradient-to-br from-amber-500 to-red-600 text-black ring-1 ring-amber-300"
                : "bg-gradient-to-br from-amber-700/60 to-zinc-800 text-amber-300 ring-1 ring-amber-700/50"
            }`}
          >
            {user.username ? user.username.slice(0, 1).toUpperCase() : "Maester"}
          </div>

          {/* User Display Name */}
          <span className="font-cinzel text-xs font-semibold text-zinc-200 group-hover:text-amber-300 transition-colors">
            {user.username}
          </span>

          {/* Role Pill */}
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
              isHighAdmin
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50"
            }`}
          >
            {isHighAdmin ? "Admin" : "Member"}
          </span>

          {/* Subtle dropdown / open indicator */}
          <svg
            className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  // Visitor -> Sleek Login / Sign Up CTA
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => openAuthModal("login")}
        className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-full transition-all shadow-md"
      >
        <span>⚔️</span>
        <span>Log In</span>
      </button>

      <button
        onClick={() => openAuthModal("signup")}
        className="flex items-center gap-1.5 text-xs font-cinzel font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-red-700 hover:from-amber-500 hover:to-red-600 text-white px-3.5 py-1.5 rounded-full transition-all shadow-md shadow-amber-950/40 border border-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
      >
        <span>🛡️</span>
        <span>Sign Up</span>
      </button>
    </div>
  );
}
