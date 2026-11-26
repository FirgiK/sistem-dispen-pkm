import {
  DISPENSASI_STATUS,
  type DispensasiStatus,
} from '../types/dispensasi';

/**
 * Konfigurasi badge status dispensasi:
 * Pill monospace kapital dengan warna fungsional saja + selalu menyertakan teks status.
 */
const statusConfig: Record<
  DispensasiStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  [DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN]: {
    label: 'MENUNGGU',
    bg: 'bg-amber-50 border-amber-300',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  [DISPENSASI_STATUS.SUDAH_DIBERIKAN]: {
    label: 'DISETUJUI',
    bg: 'bg-emerald-50 border-emerald-300',
    text: 'text-emerald-800',
    dot: 'bg-emerald-600',
  },
  [DISPENSASI_STATUS.DITOLAK]: {
    label: 'DITOLAK',
    bg: 'bg-red-50 border-red-300',
    text: 'text-red-800',
    dot: 'bg-red-600',
  },
  [DISPENSASI_STATUS.DIBATALKAN]: {
    label: 'DIBATALKAN',
    bg: 'bg-slate-100 border-slate-300',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
};

interface StatusBadgeProps {
  status: DispensasiStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      title={status}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5
        font-mono text-[11px] font-semibold uppercase tracking-wider ${config.bg} ${config.text} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
