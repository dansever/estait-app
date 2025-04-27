"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NumericInput } from "./numeric-input";
import { Label } from "./label";

interface UnitInputProps {
  value: number | "";
  onChange: (value: number | "") => void;
  unitSymbol: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  name?: string;
}

export function UnitInput({
  value,
  onChange,
  unitSymbol,
  label,
  min = 0,
  max = Infinity,
  step = 1,
  required = false,
  className,
  placeholder = "0",
  disabled = false,
  error = false,
  errorMessage,
  id,
  name,
}: UnitInputProps) {
  // Convert between string or empty value and numeric value
  const handleChange = (newValue: number) => {
    onChange(newValue);
  };

  const numericValue = value === "" ? 0 : value;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <NumericInput
          id={id}
          name={name}
          value={numericValue}
          onChange={handleChange}
          className={cn(
            `pr-${unitSymbol.length > 2 ? "10" : "8"}`,
            error && "border-destructive bg-destructive/10",
            className
          )}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <span className="text-gray-500">{unitSymbol}</span>
        </div>
      </div>
      {error && errorMessage && (
        <p className="text-destructive text-xs">{errorMessage}</p>
      )}
    </div>
  );
}
