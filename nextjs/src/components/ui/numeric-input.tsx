"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

export interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number | "";
  onChange: (value: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
  parseValue?: (value: string) => number;
  error?: boolean;
  errorMessage?: string;
  showControls?: boolean;
  controlStyle?: "side-by-side" | "increment-decrement";
  iconLeft?: React.ReactNode;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      className,
      value,
      onChange,
      min = 0,
      max = Infinity,
      step = 1,
      label,
      formatValue = (val) => val.toString(),
      parseValue = (val) => parseFloat(val) || 0,
      error = false,
      errorMessage,
      showControls = true,
      controlStyle = "increment-decrement",
      iconLeft,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>(
      value === "" ? "" : formatValue(value as number)
    );
    const [isFocused, setIsFocused] = React.useState(false);

    // Update display value when the value prop changes
    React.useEffect(() => {
      if (value === "") {
        setDisplayValue("");
      } else {
        setDisplayValue(formatValue(value as number));
      }
    }, [value, formatValue]);

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

      let parsedValue = parseValue(displayValue);

      // Enforce bounds
      if (parsedValue > max) parsedValue = max;
      if (parsedValue < min) parsedValue = min;

      // Update with the new value
      onChange(parsedValue);

      // Update display value with formatted value
      setDisplayValue(formatValue(parsedValue));
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

    if (controlStyle === "side-by-side") {
      return (
        <div className="relative flex flex-col w-full">
          {label && (
            <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
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
              disabled={value === min || props.disabled}
            >
              <span className="sr-only">Decrease</span>
              <Minus className="h-4 w-4" />
            </motion.button>
            <div className="relative flex-1">
              {iconLeft && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  {iconLeft}
                </div>
              )}
              <input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={cn(
                  "w-full h-full border-0 text-center focus:ring-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  iconLeft && "pl-10"
                )}
                ref={ref}
                {...props}
              />
            </div>
            <motion.button
              type="button"
              onClick={increment}
              className="flex items-center justify-center h-full aspect-square border-l border-input bg-transparent hover:bg-muted transition-colors"
              whileTap={{ scale: 0.95 }}
              disabled={value === max || props.disabled}
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

    return (
      <div className="relative flex flex-col">
        {label && (
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
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
          {iconLeft && (
            <div className="flex items-center justify-center pl-3">
              {iconLeft}
            </div>
          )}
          <input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex h-full w-full bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              !showControls && "rounded-md",
              iconLeft && "pl-2"
            )}
            ref={ref}
            {...props}
          />
          {showControls && (
            <div className="flex flex-col border-l border-input">
              <motion.button
                type="button"
                onClick={increment}
                className="flex h-5 w-8 items-center justify-center border-b border-input text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                whileTap={{ scale: 0.95 }}
                disabled={value === max || props.disabled}
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
                disabled={value === min || props.disabled}
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
          )}
        </div>
        {error && errorMessage && (
          <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }
);

NumericInput.displayName = "NumericInput";

export { NumericInput };
