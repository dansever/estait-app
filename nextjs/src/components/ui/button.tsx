import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 transform ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
        secondary:
          "bg-secondary-500 text-white hover:bg-secondary-700 active:bg-secondary-800 shadow-sm hover:shadow-200 active:bg-primary-300 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-300",
        destructive:
          "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700 shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-danger-400",
        outline:
          "bg-secondary-100 border border-gray-200 text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gray-300",
        outlineDestructive:
          "bg-danger-50 border border-danger-400 text-danger-600 hover:bg-danger-100 active:bg-danger-100 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-danger-400",
        ghost:
          "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gray-300",
        link: "text-primary-600 hover:text-primary-700 underline underline-offset-4 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        pill: "h-10 px-6 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
