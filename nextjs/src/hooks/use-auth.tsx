/**
 * File: use-auth.tsx
 *
 * Responsibility:
 * Manages user authentication state and authentication-related functionality
 *
 * Key features:
 * - Provides access to the current authenticated user
 * - Handles user login, logout, and registration
 * - Manages authentication loading state
 * - Abstracts Supabase authentication interactions
 * - Supports Multi-Factor Authentication (MFA)
 *
 * Components:
 * - useAuth: Hook that provides authentication state and methods
 */

import { useState, useEffect } from "react";
import { createSPASassClient } from "@/lib/supabase/client";

type User = {
  email: string;
  id: string;
  registered_at: Date;
};

interface AuthResult {
  success: boolean;
  requiresMFA?: boolean;
  error?: Error;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  checkMFA: () => Promise<{ requiresMFA: boolean; error?: Error }>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize user state on mount
  useEffect(() => {
    async function initializeAuth() {
      try {
        setLoading(true);
        const supabase = await createSPASassClient();
        const client = supabase.getSupabaseClient();

        // Get initial user
        const {
          data: { user },
        } = await client.auth.getUser();

        // Set user if exists
        if (user) {
          setUser({
            email: user.email!,
            id: user.id,
            registered_at: new Date(user.created_at),
          });
        }

        // Set up auth state change listener
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            setUser({
              email: session.user.email!,
              id: session.user.id,
              registered_at: new Date(session.user.created_at),
            });
          } else {
            setUser(null);
          }
        });

        // Clean up subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Authentication error")
        );
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();
  }, []);

  // Check if MFA verification is required
  const checkMFA = async () => {
    try {
      const supabase = await createSPASassClient();
      const client = supabase.getSupabaseClient();

      const { data, error } =
        await client.auth.mfa.getAuthenticatorAssuranceLevel();

      if (error) throw error;

      // MFA is required if the next level is 'aal2' and we're not already at that level
      const requiresMFA =
        data.nextLevel === "aal2" && data.nextLevel !== data.currentLevel;

      return { requiresMFA };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("MFA check failed");
      console.error("MFA check error:", error);
      return { requiresMFA: false, error };
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const supabase = await createSPASassClient();
      const client = supabase.getSupabaseClient();

      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check MFA requirements after successful login
      const { requiresMFA, error: mfaError } = await checkMFA();

      if (mfaError) throw mfaError;

      return { success: true, requiresMFA };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Login failed");
      setError(error);
      console.error("Login error:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout current user
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = await createSPASassClient();
      const client = supabase.getSupabaseClient();

      const { error } = await client.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Logout failed");
      setError(error);
      console.error("Logout error:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const supabase = await createSPASassClient();
      const client = supabase.getSupabaseClient();

      const { error } = await client.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Registration failed");
      setError(error);
      console.error("Registration error:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const supabase = await createSPASassClient();
      const client = supabase.getSupabaseClient();

      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) throw error;

      return { success: true };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Password reset failed");
      setError(error);
      console.error("Password reset error:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    resetPassword,
    checkMFA,
  };
}
