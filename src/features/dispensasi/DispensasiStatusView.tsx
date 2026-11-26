import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge, Button, Dialog } from '../../components';
import { DISPENSASI_STATUS } from '../../types/dispensasi';
import type { MergedDispensasiItem } from '../../lib/dispensasi-sync';

interface DispensasiStatusViewProps {
  submission: MergedDispensasiItem;
  onCancel: () => Promise<void>;
  onNewForm: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    return (
      new Date(dateStr).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    );
  } catch {
    return dateStr;
  }
}

export default function DispensasiStatusView({
  submission,
  onCancel,
  onNewForm,
  onRefresh,
  isRefreshing = false,
}: DispensasiStatusViewProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isNewFormDialogOpen, setIsNewFormDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isPending = submission.status === DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN;

  async function handleConfirmCancel() {
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      setIsCancelling(false);
      setIsCancelDialogOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Status Pengajuan Anda
              </span>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 font-medium cursor-pointer disabled:opacity-50"
                title="Cek status terbaru dari server"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                  strokeWidth={1.75}
                />
                <span>{isRefreshing ? 'Memperbarui...' : 'Perbarui Status'}</span>
              </button>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mt-1">
              {submission.namaPengaju}
            </h2>
            <p className="text-xs text-slate-500">
              Bagian / Job: {submission.jobBagian}
            </p>
          </div>

          <div className="self-start sm:self-center">
            <StatusBadge status={submission.status} />
          </div>
        </div>

        {/* Detail Pengajuan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block font-medium">Jenis Dispensasi</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
              {submission.jenisDispensasi}
              {submission.subJenisShift && (
                <span className="text-slate-600 font-normal ml-1">
                  ({submission.subJenisShift})
                </span>
              )}
              {submission.keteranganIzinLainnya && (
                <span className="text-slate-600 font-normal ml-1">
                  - {submission.keteranganIzinLainnya}
                </span>
              )}
            </span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block font-medium">Periode Dispensasi</span>
            <span className="font-mono font-semibold text-slate-900 text-sm mt-0.5 block tabular-nums">
              {formatDate(submission.tanggalMulai)} s/d {formatDate(submission.tanggalSelesai)}
            </span>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500 block font-medium mb-0.5">Alasan</span>
          <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{submission.alasan}</p>
        </div>

        <div className="mt-3 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500 block font-medium mb-1">Bukti / Lampiran</span>
          {submission.lampiranUrl ? (
            submission.lampiranUrl.startsWith('http') ? (
              <a
                href={submission.lampiranUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-800 hover:text-slate-950 font-medium underline"
                title="Buka lampiran bukti di tab baru"
              >
                <span>Lihat Berkas Lampiran</span>
                <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
              </a>
            ) : (
              <span className="text-slate-700 font-medium">
                Lampiran bukti terunggah (privat, dapat dilihat Pimpinan)
              </span>
            )
          ) : (
            <span className="text-slate-400 text-[11px]">Tidak ada lampiran bukti</span>
          )}
        </div>

        {submission.status === DISPENSASI_STATUS.DITOLAK && submission.alasanPenolakan && (
          <div className="mt-3 p-3.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-800">
            <span className="font-semibold block mb-1">Catatan Penolakan dari Pimpinan</span>
            <p className="whitespace-pre-wrap">{submission.alasanPenolakan}</p>
          </div>
        )}

        {submission.status === DISPENSASI_STATUS.SUDAH_DIBERIKAN && (
          <div className="mt-3 p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <span className="font-semibold block mb-0.5">Dispensasi Telah Disetujui</span>
              <p>
                Kepala Puskesmas telah memberikan dispensasi presensi Anda secara terpisah di aplikasi Sadasbor.
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono tabular-nums">
          <span>Diajukan: {formatDateTime(submission.createdAt)}</span>
          <span className="truncate max-w-[160px]">ID: {submission.id}</span>
        </div>
      </div>

      {/* Tombol Aksi Bawah */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div>
          {isPending && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCancelDialogOpen(true)}
              className="text-red-700 hover:bg-red-50 border-red-300 w-full sm:w-auto"
            >
              Batalkan Pengajuan Saya
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsNewFormDialogOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 w-full sm:w-auto"
        >
          Buat Pengajuan Baru
        </Button>
      </div>

      {/* Dialog Konfirmasi Pembatalan */}
      <Dialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        title="Batalkan Pengajuan Dispensasi?"
        description="Pengajuan ini akan ditandai sebagai 'Dibatalkan' dan pimpinan tidak akan memprosesnya di Sadasbor. Tindakan ini tidak dapat diurungkan."
        confirmText="Ya, Batalkan Pengajuan"
        confirmVariant="danger"
        onConfirm={handleConfirmCancel}
        isConfirmLoading={isCancelling}
        cancelText="Jangan Batalkan"
        icon={<AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={1.75} />}
      />

      {/* Dialog Konfirmasi Buat Form Baru */}
      <Dialog
        isOpen={isNewFormDialogOpen}
        onClose={() => setIsNewFormDialogOpen(false)}
        title="Buat Pengajuan Dispensasi Baru?"
        description="Formulir isian kosong baru akan dibuka dan memori pelacakan lokal di perangkat Anda akan dibersihkan agar browser tetap ringan."
        confirmText="Ya, Buka Formulir Baru"
        confirmVariant="primary"
        onConfirm={() => {
          setIsNewFormDialogOpen(false);
          onNewForm();
        }}
        cancelText="Tetap di Status Ini"
        icon={<FileText className="h-5 w-5 text-slate-700" strokeWidth={1.75} />}
      />
    </div>
  );
}
