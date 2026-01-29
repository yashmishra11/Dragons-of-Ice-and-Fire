"use client";

import { createContext, useContext, useState } from "react";
import { User, Role } from "@/types/auth";

type AuthContextType = {
  user: User | null;
  login: (role: Role, email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function login(role: Role, email: string) {
    setUser({
      id: crypto.randomUUID(),
      email,
      role,
    });
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
