interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

/** Tampilan saat daftar kosong (empty state). */
export default function EmptyState({
  icon = '📋',
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <p className="mt-3 text-sm font-medium text-slate-600">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}
