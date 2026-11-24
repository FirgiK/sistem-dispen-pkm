import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  id,
  className = '',
  ...rest
}: InputProps) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-slate-700"
      >
        {label}
        {rest.required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      <input
        id={inputId}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900
          placeholder:text-slate-400 transition-colors
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300'
          }
          disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
          ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...rest}
      />

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
