/**
 * File: GlobalContext.tsx
 *
 * Responsibility:
 * Provides global state management and context for the application
 *
 * Key features:
 * - Manages authentication state using useAuth hook
 * - Provides loading state for the application
 * - Creates a central context for global application state
 *
 * Components:
 * - GlobalProvider: Provider component that wraps the application and supplies context
 * - useGlobal: Hook to access the global context from any component
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

interface GlobalContextType {
  loading: boolean;
  user: {
    email: string;
    id: string;
    registered_at: Date;
  } | null;
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  // Use the auth hook for authentication state
  const { user, loading: authLoading } = useAuth();

  // Use the theme hook for theme state
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  // Combine loading states from different sources
  const [loading, setLoading] = useState(true);

  // Update loading state when auth state changes
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  return (
    <GlobalContext.Provider
      value={{
        loading,
        user,
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
