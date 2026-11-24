import {
  CloudOff,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { SyncStatus } from '../lib/offline-storage';

/**
 * Label sync status dalam Bahasa Indonesia.
 * Menampilkan status pengiriman draft secara jujur:
 * masih lokal / sedang mengirim / sudah terkirim / gagal.
 */
const syncConfig: Record<
  SyncStatus,
  { label: string; color: string; Icon: typeof CloudOff }
> = {
  pending: {
    label: 'Tersimpan lokal, menunggu sinyal',
    color: 'text-amber-600',
    Icon: CloudOff,
  },
  syncing: {
    label: 'Sedang mengirim…',
    color: 'text-blue-600',
    Icon: Loader2,
  },
  synced: {
    label: 'Sudah terkirim ke server',
    color: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  failed: {
    label: 'Gagal terkirim, akan dicoba lagi',
    color: 'text-red-600',
    Icon: AlertTriangle,
  },
};

interface SyncStatusIndicatorProps {
  syncStatus: SyncStatus;
  className?: string;
}

export default function SyncStatusIndicator({
  syncStatus,
  className = '',
}: SyncStatusIndicatorProps) {
  const config = syncConfig[syncStatus];
  const { Icon } = config;

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs font-medium
        ${config.color} ${className}`}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${
          syncStatus === 'syncing' ? 'animate-spin' : ''
        }`}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </div>
  );
}
