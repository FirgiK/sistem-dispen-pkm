import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
}

export default function Select({
  label,
  options,
  placeholder = '— Pilih —',
  error,
  hint,
  id,
  className = '',
  ...rest
}: SelectProps) {
  const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-slate-700"
      >
        {label}
        {rest.required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      <select
        id={selectId}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900
          bg-white transition-colors appearance-none
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]
          bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300'
          }
          disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
          ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
        }
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {hint && !error && (
        <p id={`${selectId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${selectId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
