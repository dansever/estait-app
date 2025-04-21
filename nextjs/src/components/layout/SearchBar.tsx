"use client";

import { Input } from "@/components/ui/input";
import React, { useRef, useState, useEffect, forwardRef } from "react";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
};

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      placeholder = "Search... (Press / to focus)",
      className = "",
      onChange,
      defaultValue,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = ref && typeof ref !== "function" ? ref : internalRef;
    const [searchQuery, setSearchQuery] = useState(defaultValue || "");

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === "/" &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [inputRef]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onChange?.(value);
    };

    return (
      <Input
        ref={inputRef}
        type="search"
        value={searchQuery}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full max-w-md ${className}`}
      />
    );
  }
);

SearchBar.displayName = "SearchBar";
export default SearchBar;
