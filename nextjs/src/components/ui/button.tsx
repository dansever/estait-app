import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-600)]",
        secondary:
          "bg-[var(--color-secondary-400)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-secondary-600)]",
        destructive:
          "bg-[var(--color-danger)] text-[var(--color-text-inverted)] hover:bg-[var(--color-danger-600)]",
        outline:
          "border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-[var(--color-heading)]",
        outlineDestructive:
          "border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-100)] hover:font-semibold",
        ghost:
          "text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-[var(--color-heading)]",
        link: "text-[var(--color-primary)] underline underline-offset-4 hover:text-[var(--color-primary-700)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
