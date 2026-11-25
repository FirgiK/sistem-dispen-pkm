import { useState } from 'react';
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
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
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
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
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
      {/* Banner Status Terkini */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status Pengajuan Anda
              </span>
              <span className="text-xs text-slate-300">•</span>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                title="Cek status terbaru dari server"
              >
                <span>{isRefreshing ? '⏳' : '🔄'}</span>
                <span>{isRefreshing ? 'Memperbarui...' : 'Perbarui Status'}</span>
              </button>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              {submission.namaPengaju}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Bagian / Job: {submission.jobBagian}
            </p>
          </div>

          <div className="self-start sm:self-center">
            <StatusBadge status={submission.status} />
          </div>
        </div>

        {/* Detail Pengajuan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Jenis Dispensasi:</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {submission.jenisDispensasi}
              {submission.subJenisShift && (
                <span className="text-blue-600 font-normal ml-1">
                  ({submission.subJenisShift})
                </span>
              )}
              {submission.keteranganIzinLainnya && (
                <span className="text-slate-600 font-normal ml-1 italic">
                  - {submission.keteranganIzinLainnya}
                </span>
              )}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Periode Dispensasi:</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {formatDate(submission.tanggalMulai)} s/d {formatDate(submission.tanggalSelesai)}
            </span>
          </div>
        </div>

        {/* Alasan */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <span className="text-slate-400 block font-medium mb-0.5">Alasan:</span>
          <p className="text-slate-700 whitespace-pre-wrap">{submission.alasan}</p>
        </div>

        {/* Slot Bukti / Lampiran */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <span className="text-slate-400 block font-medium mb-1">Bukti / Lampiran:</span>
          {submission.lampiranUrl ? (
            <a
              href={submission.lampiranUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-900 font-bold hover:underline"
              title="Buka lampiran bukti di tab baru"
            >
              <span>Lihat Berkas Lampiran</span>
            </a>
          ) : (
            <span className="text-slate-400 italic text-[11px]">
              Tidak ada lampiran bukti
            </span>
          )}
        </div>

        {/* Catatan Alasan Penolakan Jika Ditolak */}
        {submission.status === DISPENSASI_STATUS.DITOLAK && submission.alasanPenolakan && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <span className="font-bold block mb-1">Catatan Penolakan dari Pimpinan:</span>
            <p className="whitespace-pre-wrap">{submission.alasanPenolakan}</p>
          </div>
        )}

        {/* Catatan Status Diberikan di Sadasbor */}
        {submission.status === DISPENSASI_STATUS.SUDAH_DIBERIKAN && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <span className="font-bold block mb-0.5">✅ Dispensasi Telah Disetujui</span>
            <p>
              Kepala Puskesmas telah memberikan dispensasi presensi Anda secara terpisah di aplikasi Sadasbor.
            </p>
          </div>
        )}

        {/* Footer Card: Waktu Submit */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Diajukan pada: {formatDateTime(submission.createdAt)}</span>
          <span className="truncate max-w-[140px]">ID: {submission.id}</span>
        </div>
      </div>

      {/* Tombol Aksi Bawah */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div>
          {isPending && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCancelDialogOpen(true)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 w-full sm:w-auto"
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
          className="bg-[#0F766E] hover:bg-[#0b5852] w-full sm:w-auto"
        >
          Buat Pengajuan Baru
        </Button>
      </div>

      {/* ─── DIALOG KONFIRMASI PEMBATALAN ─── */}
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
        icon={<span className="text-rose-600">⚠️</span>}
      />

      {/* ─── DIALOG KONFIRMASI BUAT FORM BARU ─── */}
      <Dialog
        isOpen={isNewFormDialogOpen}
        onClose={() => setIsNewFormDialogOpen(false)}
        title="Buat Pengajuan Dispensasi Baru?"
        description="Formulir isian kosong baru akan dibuka dan memori pelacakan lokal di perangkat Anda akan dibersihkan agar browser tetap ringan. Anda dapat membuat pengajuan tanggal atau tugas lain."
        confirmText="Ya, Buka Formulir Baru"
        confirmVariant="primary"
        onConfirm={() => {
          setIsNewFormDialogOpen(false);
          onNewForm();
        }}
        cancelText="Tetap di Status Ini"
        icon={<span className="text-teal-700">📋</span>}
      />
    </div>
  );
}
