import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dh-bg-page)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variant === "primary" &&
            "bg-[var(--dh-brand)] text-white hover:bg-[var(--dh-brand-hover)] hover:shadow-[0_0_15px_var(--dh-brand-glow)] active:scale-[0.98] focus-visible:ring-[var(--dh-brand)]",
          variant === "secondary" &&
            "bg-[var(--dh-bg-muted)] text-[var(--dh-text-main)] border border-[var(--dh-border)] hover:bg-[var(--dh-border)] active:scale-[0.98] focus-visible:ring-[var(--dh-text-muted)]",
          variant === "ghost" &&
            "bg-transparent text-[var(--dh-text-sub)] hover:bg-[var(--dh-bg-muted)] hover:text-[var(--dh-text-main)] active:scale-[0.98]",
          variant === "danger" &&
            "bg-[var(--dh-danger)] text-white hover:bg-red-700 focus-visible:ring-[var(--dh-danger)]",
          size === "sm" && "h-9 px-4 text-xs rounded-lg",
          size === "md" && "h-11 px-6 text-sm",
          size === "lg" && "h-12 px-8 text-base rounded-2xl",
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export { Button };
