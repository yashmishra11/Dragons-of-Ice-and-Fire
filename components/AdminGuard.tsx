"use client";

import { useAuth } from "@/components/AuthProvider";
import { notFound } from "next/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    notFound(); // hides admin existence
  }

  return <>{children}</>;
}
