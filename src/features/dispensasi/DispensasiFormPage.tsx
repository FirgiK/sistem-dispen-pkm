import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout, PuskesmasLogo } from '../../components';
import DispensasiForm from './DispensasiForm';
import DispensasiStatusView from './DispensasiStatusView';
import {
  fetchSubmissionStatus,
  cancelDispensasi,
  deleteDispensasiDraft,
  clearSyncedDispensasiDrafts,
  type MergedDispensasiItem,
} from '../../lib/dispensasi-sync';
import { DISPENSASI_STATUS } from '../../types/dispensasi';

const STORAGE_KEY = 'cipatujah_last_dispensasi';
// Batas pelacakan otomatis: 12 jam setelah dispensasi disetujui di Sadasbor
const APPROVED_TRACKING_WINDOW_MS = 12 * 60 * 60 * 1000;
// Batas pelacakan untuk pengajuan yang ditolak / dibatalkan: 24 jam
const FINISHED_TRACKING_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function DispensasiFormPage() {
  const [activeSubmission, setActiveSubmission] = useState<MergedDispensasiItem | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFormAnyway, setShowFormAnyway] = useState(false);

  // Ambil data pengajuan aktif dari localStorage saat halaman pertama kali dibuka
  const loadSavedSubmission = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoadingStatus(true);
    try {
      // Rutinitas pembersihan sampah draft IndexedDB yang sudah tersinkron ke Supabase
      await clearSyncedDispensasiDrafts().catch(() => {});

      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (!savedRaw) {
        setActiveSubmission(null);
        return;
      }

      const saved = JSON.parse(savedRaw) as { localId?: string; remoteId?: string };
      if (!saved.localId && !saved.remoteId) {
        setActiveSubmission(null);
        return;
      }

      const item = await fetchSubmissionStatus(saved.localId, saved.remoteId);
      if (item) {
        // ── ATURAN 1: 12 JAM SETELAH DISETUJUI, OTOMATIS BERSIHKAN & BUKA FORM BARU ──
        if (item.status === DISPENSASI_STATUS.SUDAH_DIBERIKAN) {
          const approvedTime = new Date(item.updatedAt || item.createdAt).getTime();
          const elapsed = Date.now() - approvedTime;

          if (!isNaN(approvedTime) && elapsed >= APPROVED_TRACKING_WINDOW_MS) {
            // Hapus pelacakan di wilayah pengguna agar browser tidak lag
            localStorage.removeItem(STORAGE_KEY);
            if (item.localId) {
              await deleteDispensasiDraft(item.localId).catch(() => {});
            }
            setActiveSubmission(null);
            return;
          }
        }

        // ── ATURAN 2: BERSIHKAN STATUS DIBATALKAN / DITOLAK SETELAH 24 JAM ──
        if (
          item.status === DISPENSASI_STATUS.DIBATALKAN ||
          item.status === DISPENSASI_STATUS.DITOLAK
        ) {
          const finishedTime = new Date(item.updatedAt || item.createdAt).getTime();
          const elapsed = Date.now() - finishedTime;

          if (!isNaN(finishedTime) && elapsed >= FINISHED_TRACKING_WINDOW_MS) {
            localStorage.removeItem(STORAGE_KEY);
            if (item.localId) {
              await deleteDispensasiDraft(item.localId).catch(() => {});
            }
            setActiveSubmission(null);
            return;
          }
        }

        setActiveSubmission(item);
      } else {
        // Data tidak ditemukan lagi di server maupun lokal: hapus pointer kadaluwarsa
        localStorage.removeItem(STORAGE_KEY);
        setActiveSubmission(null);
      }
    } catch {
      setActiveSubmission(null);
    } finally {
      if (showLoading) setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadSavedSubmission(true);
  }, [loadSavedSubmission]);

  // Handler saat form baru berhasil dikirim
  async function handleFormSubmitted(info: { localId: string; remoteId?: string }) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    setShowFormAnyway(false);
    await loadSavedSubmission(false);
  }

  // Handler saat petugas membatalkan pengajuan (setelah konfirmasi Dialog)
  async function handleCancelSubmission() {
    if (!activeSubmission) return;
    await cancelDispensasi(activeSubmission.localId, activeSubmission.remoteId);
    setActiveSubmission((prev) =>
      prev ? { ...prev, status: DISPENSASI_STATUS.DIBATALKAN, updatedAt: new Date().toISOString() } : null,
    );
  }

  // Handler tombol refresh status manual
  async function handleRefreshStatus() {
    setIsRefreshing(true);
    try {
      await loadSavedSubmission(false);
    } finally {
      setIsRefreshing(false);
    }
  }

  // Handler buka form baru (setelah konfirmasi Dialog): bersihkan wilayah user
  async function handleOpenNewForm() {
    localStorage.removeItem(STORAGE_KEY);
    if (activeSubmission?.localId) {
      await deleteDispensasiDraft(activeSubmission.localId).catch(() => {});
    }
    await clearSyncedDispensasiDrafts().catch(() => {});
    setActiveSubmission(null);
    setShowFormAnyway(false);
  }

  return (
    <PageLayout
      variant="form"
      title={
        <PuskesmasLogo
          size="md"
          textColor="light"
          showText={true}
          title="UPTD PUSKESMAS CIPATUJAH"
          subtitle="Dinas Kesehatan Kabupaten Tasikmalaya"
        />
      }
      headerRight={
        <Link
          to="/layanan"
          className="rounded-lg bg-white/20 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors flex items-center backdrop-blur-xs"
          title="Buka Pusat Layanan Mandiri Petugas"
        >
          <span>Layanan Mandiri Petugas</span>
        </Link>
      }
    >
      {/* ─── KONDISI 1: MEMUAT STATUS DARI MEMORI HP ─── */}
      {isLoadingStatus && (
        <div className="py-16 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
          <span className="inline-block animate-spin mr-2">⏳</span>
          Memeriksa riwayat pengajuan di perangkat Anda...
        </div>
      )}

      {/* ─── KONDISI 2: PETUGAS SUDAH MEMILIKI PENGAJUAN AKTIF (RELOAD AMAN) ─── */}
      {!isLoadingStatus && activeSubmission && !showFormAnyway && (
        <DispensasiStatusView
          submission={activeSubmission}
          onCancel={handleCancelSubmission}
          onNewForm={handleOpenNewForm}
          onRefresh={handleRefreshStatus}
          isRefreshing={isRefreshing}
        />
      )}

      {/* ─── KONDISI 3: TAMPILKAN FORM ISIAN KOSONG ─── */}
      {!isLoadingStatus && (!activeSubmission || showFormAnyway) && (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          {/* Garis Aksen Halus di Pucuk Kartu */}
          <div className="h-1.5 w-full bg-gradient-to-r from-teal-700 via-emerald-600 to-green-600" />

          <div className="p-6 sm:p-8">
            {/* Header Internal Formulir */}
            <div className="pb-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Formulir Pengajuan Dispensasi
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Silakan lengkapi data permohonan dispensasi dinas atau shift kerja Anda.
                  Kolom dengan tanda bintang (<span className="text-red-500 font-bold">*</span>) wajib diisi.
                </p>
              </div>

              {activeSubmission && showFormAnyway && (
                <button
                  type="button"
                  onClick={() => setShowFormAnyway(false)}
                  className="shrink-0 text-xs text-teal-700 hover:text-teal-800 font-bold underline cursor-pointer"
                >
                  Lihat Status Pengajuan Sebelumnya
                </button>
              )}
            </div>

            {/* Kolom Isian Form */}
            <div className="pt-6">
              <DispensasiForm onSubmitted={handleFormSubmitted} />
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
