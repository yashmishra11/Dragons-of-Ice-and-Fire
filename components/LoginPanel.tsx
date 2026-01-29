"use client";

import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";

export default function LoginPanel() {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState("");

  if (user) {
    return (
      <div className="text-sm text-zinc-300 flex gap-3 items-center">
        <span>{user.email} ({user.role})</span>
        <button
          onClick={logout}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-zinc-900 border border-zinc-800 px-2 py-1 text-sm rounded"
      />

      <button
        onClick={() => login("viewer", email)}
        className="text-xs bg-zinc-800 px-2 py-1 rounded"
      >
        Viewer Login
      </button>

      <button
        onClick={() => login("admin", email)}
        className="text-xs bg-white text-black px-2 py-1 rounded"
      >
        Admin Login
      </button>
    </div>
  );
}
