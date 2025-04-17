/**
 * File: use-theme.tsx
 *
 * Responsibility:
 * Manages application theme preferences and switching functionality
 *
 * Key features:
 * - Detects and applies user's system theme preference
 * - Provides functionality to switch between light and dark themes
 * - Persists theme selection in local storage
 * - Synchronizes theme across browser tabs/windows
 *
 * Components:
 * - useTheme: Hook that provides theme state and control methods
 */

import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  // Initialize theme from localStorage or default to 'system'
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Effect to initialize theme from localStorage and set up listeners
  useEffect(() => {
    // Function to determine the current system theme
    const getSystemTheme = (): "light" | "dark" => {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "system";
    setThemeState(initialTheme);

    // Set the initial resolved theme
    if (initialTheme === "system") {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(initialTheme);
    }

    // Apply theme to document
    applyTheme(initialTheme === "system" ? getSystemTheme() : initialTheme);

    // Set up system theme change listener
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        const newSystemTheme = getSystemTheme();
        setResolvedTheme(newSystemTheme);
        applyTheme(newSystemTheme);
      }
    };

    // Add event listener for system theme changes
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    // Set up storage event listener to sync theme across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        const newTheme = e.newValue as Theme;
        setThemeState(newTheme);

        if (newTheme === "system") {
          const systemTheme = getSystemTheme();
          setResolvedTheme(systemTheme);
          applyTheme(systemTheme);
        } else {
          setResolvedTheme(newTheme);
          applyTheme(newTheme);
        }
      }
    };

    // Add event listener for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Clean up event listeners on unmount
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [theme]);

  // Function to apply theme to document by adding/removing class
  const applyTheme = (theme: "light" | "dark") => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Function to set theme and save it to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setResolvedTheme(systemTheme);
      applyTheme(systemTheme);
    } else {
      setResolvedTheme(newTheme);
      applyTheme(newTheme);
    }
  };

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
