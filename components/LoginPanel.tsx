"use client";

import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import Link from "next/link";

export default function LoginPanel() {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState("");

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800/80 px-3 py-1.5 rounded-full backdrop-blur-md text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-200 font-medium">{user.email || "Guest"}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              user.role === "admin"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
          >
            {user.role}
          </span>
        </div>

        {user.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-600/30 hover:border-amber-500/50 transition-all text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Dashboard
          </Link>
        )}

        <button
          onClick={logout}
          className="text-zinc-400 hover:text-red-400 transition-colors ml-1 font-medium text-xs px-2 py-0.5 rounded hover:bg-red-950/30"
        >
          Logout
        </button>
      </div>
    );
  }

  const handleLogin = (role: "viewer" | "admin") => {
    const loginEmail = email.trim() || (role === "admin" ? "admin@dragonstone.gov" : "maester@citadel.edu");
    login(role, loginEmail);
  };

  return (
    <div className="flex items-center gap-2 bg-zinc-950/70 border border-zinc-800/80 p-1 rounded-full backdrop-blur-md text-xs shadow-xl">
      <input
        type="email"
        placeholder="Enter email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-zinc-900/90 border border-zinc-800 px-3 py-1 text-xs text-zinc-100 placeholder-zinc-500 rounded-full focus:outline-none focus:border-amber-500/50 w-36 sm:w-44 transition-all"
      />

      <div className="flex gap-1">
        <button
          onClick={() => handleLogin("viewer")}
          className="bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded-full font-medium transition-colors border border-zinc-700/50 hover:border-zinc-500"
          title="Login as Viewer"
        >
          Viewer
        </button>

        <button
          onClick={() => handleLogin("admin")}
          className="bg-gradient-to-r from-amber-600 to-red-700 hover:from-amber-500 hover:to-red-600 text-white px-3 py-1 rounded-full font-semibold transition-all shadow-md shadow-amber-900/20 border border-amber-500/30"
          title="Login as Admin to manage submissions"
        >
          Admin
        </button>
      </div>
    </div>
  );
}

