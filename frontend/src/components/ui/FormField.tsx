"use client";

import type React from "react";
import { useId } from "react";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldProps {
  id?: string;
  label: string;
  type?: "text" | "email" | "password" | "select" | "textarea" | "tel";
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  error?: string | null;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  options?: FormFieldOption[];
  rows?: number;
  className?: string;
  autoComplete?: string;
}

export function FormField({
  id,
  label,
  type = "text",
  name,
  placeholder,
  value,
  defaultValue,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  options = [],
  rows = 4,
  className = "",
  autoComplete,
}: FormFieldProps) {
  const generatedId = useId();
  const inputId = id || name || generatedId;
  const errorId = `${inputId}-error`;

  const inputBaseClasses =
    "w-full rounded-md border bg-surface px-3.5 py-2 text-content text-base placeholder:text-content-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 disabled:opacity-50 disabled:bg-surface-muted";

  const stateClasses = error
    ? "border-danger focus-visible:ring-danger"
    : "border-border hover:border-border/80";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-content flex items-center justify-between"
      >
        <span>
          {label} {required && <span className="text-danger">*</span>}
        </span>
      </label>

      {type === "textarea" ? (
        <textarea
          id={inputId}
          name={name}
          rows={rows}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`${inputBaseClasses} ${stateClasses} resize-y`}
        />
      ) : type === "select" ? (
        <select
          id={inputId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`${inputBaseClasses} ${stateClasses}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`${inputBaseClasses} ${stateClasses}`}
        />
      )}

      {error ? (
        <p id={errorId} className="text-xs text-danger font-medium mt-0.5" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-content-muted mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
