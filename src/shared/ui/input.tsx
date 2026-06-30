import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--dh-text-sub)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dh-text-dim)]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-xl border bg-[var(--dh-bg-card)] px-4 py-3 text-sm text-[var(--dh-text-main)] placeholder:text-[var(--dh-text-dim)]",
              "transition-all duration-200 outline-none",
              "border-[var(--dh-border)] hover:border-[var(--dh-text-dim)] focus:border-[var(--dh-brand)] focus:ring-2 focus:ring-[var(--dh-brand-glow)]",
              leftIcon && "pr-10",
              rightIcon && "pl-10",
              error &&
                "border-[var(--dh-danger)] focus:border-[var(--dh-danger)] focus:ring-[var(--dh-danger)]/20",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dh-text-dim)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[var(--dh-danger)]">⚠ {error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export { Input };
