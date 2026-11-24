import {
  DISPENSASI_STATUS,
  type DispensasiStatus,
} from '../types/dispensasi';

/**
 * Warna dan ikon per status dispensasi.
 * Status TIDAK hanya dibedakan oleh warna — selalu ada teks statusnya
 * (aksesibilitas, sesuai instruksi Bagian 9).
 */
const statusConfig: Record<
  DispensasiStatus,
  { bg: string; text: string; dot: string }
> = {
  [DISPENSASI_STATUS.MENUNGGU_KAPUS]: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  [DISPENSASI_STATUS.SUDAH_DIBERIKAN]: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  [DISPENSASI_STATUS.DITOLAK]: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  [DISPENSASI_STATUS.DIBATALKAN]: {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-500',
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5
        text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}
