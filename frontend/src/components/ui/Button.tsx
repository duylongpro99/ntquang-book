"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      href,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2.5 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-2.5",
    };

    const variantClasses = {
      primary: "bg-primary hover:bg-primary-hover text-primary-contrast font-semibold shadow-e1",
      secondary: "bg-surface text-content border border-border hover:bg-surface-muted font-medium",
      ghost: "bg-transparent text-content hover:bg-surface-muted font-medium",
      danger: "bg-danger hover:opacity-90 text-white font-semibold",
    };

    const baseClasses =
      "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

    const computedClass = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    if (href && !disabled && !loading) {
      return (
        <a href={href} className={computedClass} role="button">
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} disabled={disabled || loading} className={computedClass} {...props}>
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
