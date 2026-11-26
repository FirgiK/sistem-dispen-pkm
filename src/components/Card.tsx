import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Card({
  title,
  subtitle,
  children,
  className = '',
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white ${className}`}
    >
      {(title || subtitle) && (
        <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
          {title && (
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 sm:p-5'}>{children}</div>
    </div>
  );
}
