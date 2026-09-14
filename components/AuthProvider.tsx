"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { SafeUser } from "@/types/user";
import AuthModal from "@/components/AuthModal";
import AccountDrawer from "@/components/AccountDrawer";

export type ClientRole = "visitor" | "viewer" | "admin";

type AuthContextType = {
  user: SafeUser | null;
  role: ClientRole;
  loading: boolean;
  login: (
    identifier: string,
    passphrase: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: SafeUser) => void;
  openAuthModal: (tab?: "login" | "signup") => void;
  closeAuthModal: () => void;
  openAccountDrawer: () => void;
  closeAccountDrawer: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal & Drawer State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  // Check persistent session cookie on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Error loading session:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const role: ClientRole = !user
    ? "visitor"
    : user.role === "admin"
    ? "admin"
    : "viewer";

  const login = async (
    identifier: string,
    passphrase: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier, password: passphrase }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: "Network error during login" };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setIsAccountDrawerOpen(false);
    }
  };

  const updateUser = (updated: SafeUser) => {
    setUser(updated);
  };

  const openAuthModal = (tab: "login" | "signup" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openAccountDrawer = () => {
    setIsAccountDrawerOpen(true);
  };

  const closeAccountDrawer = () => {
    setIsAccountDrawerOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        logout,
        updateUser,
        openAuthModal,
        closeAuthModal,
        openAccountDrawer,
        closeAccountDrawer,
      }}
    >
      {children}

      {/* Global Auth Modal for visitors */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={closeAuthModal}
      />

      {/* Global Account Drawer for members & admin */}
      <AccountDrawer
        isOpen={isAccountDrawerOpen}
        onClose={closeAccountDrawer}
      />
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
