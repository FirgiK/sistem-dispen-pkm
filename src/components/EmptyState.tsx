import type { ReactNode } from 'react';
import { FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

/** Tampilan saat daftar kosong (empty state). */
export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400">
        {icon ?? <FileText className="h-5 w-5" strokeWidth={1.75} />}
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700">{title}</p>
      {description && (
        <p className="mt-1 max-w-md text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}
