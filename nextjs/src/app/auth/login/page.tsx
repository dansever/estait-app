/**
 * File: login/page.tsx
 *
 * Responsibility:
 * Handles user login functionality and redirects based on authentication state
 *
 * Key features:
 * - Uses useAuth hook for authentication logic
 * - Provides form for email/password login
 * - Handles MFA redirect when needed
 * - Supports SSO authentication via SSOButtons component
 *
 * Components:
 * - LoginPage: Main login form and authentication flow
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SSOButtons from "@/components/SSOButtons";
import { useAuth } from "@/hooks/use-auth";
import {
  useFormValidation,
  validationRules,
} from "@/hooks/use-form-validation";

export default function LoginPage() {
  const router = useRouter();
  const [showMFAPrompt, setShowMFAPrompt] = useState(false);
  const { login, error: authError, loading } = useAuth();

  // Form validation using our custom hook
  const { values, errors, handleChange, handleBlur, validateForm } =
    useFormValidation(
      { email: "", password: "" },
      {
        email: [
          validationRules.required("Email is required"),
          validationRules.email("Please enter a valid email address"),
        ],
        password: [validationRules.required("Password is required")],
      }
    );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form before submission
    if (!validateForm()) return;

    const { success, error, requiresMFA } = await login(
      values.email,
      values.password
    );

    if (success) {
      if (requiresMFA) {
        setShowMFAPrompt(true);
      } else {
        router.push("/app");
      }
    }
  };

  // Handle MFA redirect
  useEffect(() => {
    if (showMFAPrompt) {
      router.push("/auth/2fa");
    }
  }, [showMFAPrompt, router]);

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {authError && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {authError.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full appearance-none rounded-md border ${
                errors.email ? "border-red-300" : "border-gray-300"
              } px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full appearance-none rounded-md border ${
                errors.password ? "border-red-300" : "border-gray-300"
              } px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>

      <SSOButtons onError={(message) => console.error(message)} />

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Don&#39;t have an account?</span>{" "}
        <Link
          href="/auth/register"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
