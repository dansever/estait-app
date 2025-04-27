"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
  parseValue?: (value: string) => number;
  withControls?: boolean;
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
      withControls = true,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>(
      formatValue(value)
    );
    const [isFocused, setIsFocused] = React.useState(false);

    // Update display value when the value prop changes
    React.useEffect(() => {
      setDisplayValue(formatValue(value));
    }, [value, formatValue]);

    const increment = () => {
      const newValue = Math.min(value + step, max);
      onChange(newValue);
    };

    const decrement = () => {
      const newValue = Math.max(value - step, min);
      onChange(newValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayValue(e.target.value);
    };

    const handleBlur = () => {
      setIsFocused(false);

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
              : "border-input",
            className
          )}
        >
          <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex h-full w-full bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              !withControls && "rounded-md"
            )}
            ref={ref}
            {...props}
          />
          {withControls && (
            <div className="flex flex-col border-l border-input">
              <motion.button
                type="button"
                onClick={increment}
                className="flex h-5 w-8 items-center justify-center border-b border-input text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                whileTap={{ scale: 0.95 }}
                disabled={value >= max}
              >
                <ChevronUp className="h-3 w-3" />
              </motion.button>
              <motion.button
                type="button"
                onClick={decrement}
                className="flex h-5 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                whileTap={{ scale: 0.95 }}
                disabled={value <= min}
              >
                <ChevronDown className="h-3 w-3" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

NumericInput.displayName = "NumericInput";

export { NumericInput };
