"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NumericInput } from "./numeric-input";
import { Label } from "./label";
import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface CurrencyInputProps {
  value: number | "";
  onChange: (value: number | "") => void;
  currency: string;
  currencySymbol: string;
  label?: string;
  min?: number;
  max?: number;
  required?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  name?: string;
  controlStyle?: "side-by-side" | "increment-decrement" | "none";
  step?: number;
}

export function CurrencyInput({
  value,
  onChange,
  currency,
  currencySymbol,
  label,
  min = 0,
  max = Infinity,
  required = false,
  className,
  placeholder = "0.00",
  disabled = false,
  error = false,
  errorMessage,
  id,
  name,
  controlStyle = "increment-decrement",
  step = 100,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState<string>(
    value === "" ? "" : formatCurrency(value as number)
  );
  const [isFocused, setIsFocused] = React.useState(false);

  // Format currency with proper localization
  function formatCurrency(val: number): string {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Parse string input to number
  function parseCurrency(val: string): number {
    // Remove all non-numeric characters except decimal point
    const sanitized = val.replace(/[^\d.]/g, "");
    return parseFloat(sanitized) || 0;
  }

  // Update display value when the value prop changes
  React.useEffect(() => {
    if (value === "") {
      setDisplayValue("");
    } else {
      setDisplayValue(formatCurrency(value as number));
    }
  }, [value]);

  const increment = () => {
    const currentValue = value === "" ? 0 : value;
    const newValue = Math.min(currentValue + step, max);
    onChange(newValue);
  };

  const decrement = () => {
    const currentValue = value === "" ? 0 : value;
    const newValue = Math.max(currentValue - step, min);
    onChange(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Empty string handling
    if (displayValue === "") {
      onChange("");
      return;
    }

    let parsedValue = parseCurrency(displayValue);

    // Enforce bounds
    if (parsedValue > max) parsedValue = max;
    if (parsedValue < min) parsedValue = min;

    // Update with the new value
    onChange(parsedValue);

    // Update display value with formatted value
    setDisplayValue(formatCurrency(parsedValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      increment();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      decrement();
    } else if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  // If using NumericInput component
  if (controlStyle === "none") {
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">{currencySymbol}</span>
          </div>
          <NumericInput
            id={id}
            name={name}
            value={value === "" ? "" : value}
            onChange={onChange}
            className={cn(
              "pl-7",
              error && "border-destructive bg-destructive/10",
              className
            )}
            min={min}
            max={max}
            step={step}
            formatValue={formatCurrency}
            parseValue={parseCurrency}
            disabled={disabled}
            placeholder={placeholder}
            error={error}
            errorMessage={errorMessage}
            showControls={false}
          />
        </div>
      </div>
    );
  }

  // Side-by-side style (with +/- buttons on the sides)
  if (controlStyle === "side-by-side") {
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <div
          className={cn(
            "flex h-10 w-full rounded-md border overflow-hidden transition-all duration-200",
            isFocused
              ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-950"
              : error
              ? "border-red-500 bg-red-50"
              : "border-input bg-background",
            className
          )}
        >
          <motion.button
            type="button"
            onClick={decrement}
            className="flex items-center justify-center h-full aspect-square border-r border-input bg-transparent hover:bg-muted transition-colors"
            whileTap={{ scale: 0.95 }}
            disabled={value === min || disabled}
          >
            <span className="sr-only">Decrease</span>
            <Minus className="h-4 w-4" />
          </motion.button>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">{currencySymbol}</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id={id}
              name={name}
              value={displayValue}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full border-0 pl-7 focus:ring-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              disabled={disabled}
              placeholder={placeholder}
            />
          </div>
          <motion.button
            type="button"
            onClick={increment}
            className="flex items-center justify-center h-full aspect-square border-l border-input bg-transparent hover:bg-muted transition-colors"
            whileTap={{ scale: 0.95 }}
            disabled={value === max || disabled}
          >
            <span className="sr-only">Increase</span>
            <Plus className="h-4 w-4" />
          </motion.button>
        </div>
        {error && errorMessage && (
          <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }

  // Default increment-decrement style (with +/- buttons on the right)
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <div
          className={cn(
            "flex h-10 w-full rounded-md border bg-background transition-all duration-200",
            isFocused
              ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-950"
              : error
              ? "border-red-500 bg-red-50"
              : "border-input",
            className
          )}
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">{currencySymbol}</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id={id}
              name={name}
              value={displayValue}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full border-0 pl-7 pr-2 py-2 focus:ring-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              disabled={disabled}
              placeholder={placeholder}
            />
          </div>
          <div className="flex flex-col border-l border-input">
            <motion.button
              type="button"
              onClick={increment}
              className="flex h-5 w-8 items-center justify-center border-b border-input text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              whileTap={{ scale: 0.95 }}
              disabled={value === max || disabled}
            >
              <span className="sr-only">Increase</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 2.25V12.75M2.25 7.5H12.75"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
            <motion.button
              type="button"
              onClick={decrement}
              className="flex h-5 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              whileTap={{ scale: 0.95 }}
              disabled={value === min || disabled}
            >
              <span className="sr-only">Decrease</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.25 7.5H12.75"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </div>
        </div>
        {error && errorMessage && (
          <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
