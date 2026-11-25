import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout, Card, StatusBadge, Button, Select, ComingSoonCard, PuskesmasLogo, Dialog } from '../../components';
import { useDispensasiList, RejectModal } from '../dispensasi';
import { useSigapBencanaList, BencanaCardList } from '../bencana';
import { DISPENSASI_STATUS } from '../../types/dispensasi';
import { DISPENSASI_TYPES } from '../../config/dispensasi';
import { SIGAP_PORTAL_URL } from '../../config/bencana';
import SummaryCards from './SummaryCards';
import type { MergedDispensasiItem } from '../../lib/dispensasi-sync';

type ActiveTab = 'dispensasi' | 'bencana' | 'kinerja';

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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dispensasi');

  const {
    items,
    isLoading,
    isSyncing,
    error,
    isOnline,
    isConfigured,
    pendingDraftsCount,
    lastSyncTime,
    refresh,
    triggerSync,
    giveDecision,
  } = useDispensasiList();

  const {
    items: sigapReports,
    isConfigured: isSigapConfigured,
  } = useSigapBencanaList();

  // State Filter
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterJenis, setFilterJenis] = useState<string>('all');

  // State Modal Penolakan & Konfirmasi Persetujuan
  const [rejectingItem, setRejectingItem] = useState<MergedDispensasiItem | null>(null);
  const [approvingItem, setApprovingItem] = useState<MergedDispensasiItem | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // State Accordion Detail Form (Klik kartu untuk tampilkan detail)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Perhitungan Data Ringkasan
  const pendingCount = useMemo(() => {
    return items.filter((item) => item.status === DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN).length;
  }, [items]);

  const givenCount = useMemo(() => {
    return items.filter((item) => item.status === DISPENSASI_STATUS.SUDAH_DIBERIKAN).length;
  }, [items]);

  const rejectedCount = useMemo(() => {
    return items.filter((item) => item.status === DISPENSASI_STATUS.DITOLAK).length;
  }, [items]);

  const cancelledCount = useMemo(() => {
    return items.filter((item) => item.status === DISPENSASI_STATUS.DIBATALKAN).length;
  }, [items]);

  const givenCount30Days = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return items.filter((item) => {
      if (item.status !== DISPENSASI_STATUS.SUDAH_DIBERIKAN) return false;
      const d = new Date(item.tanggalMulai || item.createdAt);
      return d >= thirtyDaysAgo;
    }).length;
  }, [items]);

  const activeBencanaCount = useMemo(() => {
    if (!isSigapConfigured) return null;
    return sigapReports.filter((r) => r.status !== 'Selesai' && r.status !== 'Ditolak').length;
  }, [sigapReports, isSigapConfigured]);

  const handlingBencanaCount = useMemo(() => {
    if (!isSigapConfigured) return 0;
    return sigapReports.filter((r) => r.status === 'Sedang Ditangani' || r.status === 'Terverifikasi').length;
  }, [sigapReports, isSigapConfigured]);

  const completedBencanaCount = useMemo(() => {
    if (!isSigapConfigured) return 0;
    return sigapReports.filter((r) => r.status === 'Selesai').length;
  }, [sigapReports, isSigapConfigured]);

  const totalBencanaCount = useMemo(() => {
    if (!isSigapConfigured) return 0;
    return sigapReports.length;
  }, [sigapReports, isSigapConfigured]);

  // Status Chips Filter Options
  const statusChips = [
    { value: 'all', label: 'Semua Status', count: items.length, activeBg: 'bg-slate-800 text-white border-slate-800' },
    { value: DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN, label: 'Menunggu', count: pendingCount, activeBg: 'bg-amber-600 text-white border-amber-600' },
    { value: DISPENSASI_STATUS.SUDAH_DIBERIKAN, label: 'Sudah Diberikan', count: givenCount, activeBg: 'bg-emerald-600 text-white border-emerald-600' },
    { value: DISPENSASI_STATUS.DITOLAK, label: 'Ditolak', count: rejectedCount, activeBg: 'bg-rose-600 text-white border-rose-600' },
    { value: DISPENSASI_STATUS.DIBATALKAN, label: 'Dibatalkan', count: cancelledCount, activeBg: 'bg-slate-600 text-white border-slate-600' },
  ];

  // Opsi filter jenis
  const jenisOptions = [
    { value: 'all', label: 'Semua Jenis Dispensasi' },
    ...DISPENSASI_TYPES.map((d) => ({ value: d.type, label: d.label })),
  ];

  // Filter items & Urutkan: Paling mendesak dulu (tanggal mulai terdekat)
  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }
      if (filterJenis !== 'all' && item.jenisDispensasi !== filterJenis) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      // Prioritaskan yang menunggu persetujuan
      if (a.status === DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN && b.status !== DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN) {
        return -1;
      }
      if (a.status !== DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN && b.status === DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN) {
        return 1;
      }
      // Urutkan berdasarkan tanggal mulai terdekat
      const timeA = new Date(a.tanggalMulai).getTime() || 0;
      const timeB = new Date(b.tanggalMulai).getTime() || 0;
      return timeA - timeB;
    });
  }, [items, filterStatus, filterJenis]);

  function handleApprove(item: MergedDispensasiItem) {
    setApprovingItem(item);
  }

  async function handleConfirmApprove() {
    if (!approvingItem) return;
    setIsApproving(true);
    try {
      await giveDecision(approvingItem, DISPENSASI_STATUS.SUDAH_DIBERIKAN);
      setApprovingItem(null);
    } finally {
      setIsApproving(false);
    }
  }

  async function handleConfirmReject(reason: string) {
    if (!rejectingItem) return;
    await giveDecision(rejectingItem, DISPENSASI_STATUS.DITOLAK, reason);
  }

  // Format tanggal Indonesia untuk header
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <PageLayout
      variant="dashboard"
      title={
        <PuskesmasLogo
          size="md"
          textColor="light"
          showText={true}
          title="UPTD PUSKESMAS CIPATUJAH"
          subtitle="Satu Jendela Layanan & Pemantauan Internal"
        />
      }
      headerMeta={
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs pt-1">
          {/* Tanggal Hari Ini */}
          <span className="text-teal-100 font-medium">
            📅 {todayFormatted}
          </span>

          <span className="text-teal-300">•</span>

          {/* Badge Peran */}
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
            Peran: Kapus
          </span>

          <span className="text-teal-300">•</span>

          {/* Badge Koneksi */}
          {!isOnline ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/30 px-2 py-0.5 text-[11px] font-medium text-rose-100 border border-rose-300/40">
              🔴 Offline
            </span>
          ) : isConfigured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 px-2 py-0.5 text-[11px] font-medium text-emerald-100 border border-emerald-300/40">
              🟢 Terhubung Supabase
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/30 px-2 py-0.5 text-[11px] font-medium text-amber-100 border border-amber-300/40">
              🟡 Mode Lokal
            </span>
          )}

          {/* Waktu Sinkron Terakhir */}
          {lastSyncTime && (
            <span className="text-teal-200 text-[11px]">
              Sync: {lastSyncTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
          )}

          {/* Pending Drafts Warning Badge */}
          {pendingDraftsCount > 0 && (
            <span className="rounded-full bg-amber-400 text-amber-950 font-bold px-2 py-0.5 text-[10px]">
              {pendingDraftsCount} Draft Offline
            </span>
          )}
        </div>
      }
      headerRight={
        <div className="flex items-center gap-2">
          <Link
            to="/layanan"
            className="rounded-lg border border-white/30 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors hidden md:flex items-center gap-1.5 backdrop-blur-xs"
            title="Buka Portal Layanan Mandiri Petugas"
          >
            <span>📱</span>
            <span>Portal Layanan</span>
          </Link>
          <Link
            to="/dispensasi"
            className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <span>+</span>
            <span>Form Dispensasi</span>
          </Link>
          <a
            href={SIGAP_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#DC2626] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors flex items-center gap-1"
          >
            <span>🚨</span>
            <span>Lapor Bencana</span>
          </a>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ─── 1. TAB NAVIGASI DASHBOARD (DI ATAS KARTU RINGKASAN) ─── */}
        <div className="flex border-b border-slate-200 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('dispensasi')}
            className={`cursor-pointer px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'dispensasi'
                ? 'border-[#2563EB] text-[#2563EB] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>📋 Dispensasi</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bencana')}
            className={`cursor-pointer px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'bencana'
                ? 'border-[#DC2626] text-[#DC2626] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>🚨 Pantauan Bencana</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kinerja')}
            className={`cursor-pointer px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'kinerja'
                ? 'border-slate-800 text-slate-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>📊 Kinerja</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
              Soon
            </span>
          </button>
        </div>

        {/* ─── 2. KARTU RINGKASAN SPESIFIK FUNGSI AKTIF ─── */}
        <SummaryCards
          activeTab={activeTab}
          pendingCount={pendingCount}
          givenCount30Days={givenCount30Days}
          rejectedCount={rejectedCount}
          pendingDraftsCount={pendingDraftsCount}
          isSigapConfigured={isSigapConfigured}
          activeBencanaCount={activeBencanaCount}
          handlingBencanaCount={handlingBencanaCount}
          completedBencanaCount={completedBencanaCount}
          totalBencanaCount={totalBencanaCount}
        />

        {/* ─── TAB 1: DISPENSASI ─── */}
        {activeTab === 'dispensasi' && (
          <div className="space-y-4">
            {/* Filter Bar (Chip / Pill + Dropdown Jenis) */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-2">Filter Status:</span>
                <div className="flex flex-wrap gap-2">
                  {statusChips.map((chip) => {
                    const isActive = filterStatus === chip.value;
                    return (
                      <button
                        key={chip.value}
                        type="button"
                        onClick={() => setFilterStatus(chip.value)}
                        className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                          isActive
                            ? chip.activeBg
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{chip.label}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {chip.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Dropdown Jenis & Tombol Sinkronisasi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="w-full sm:w-64">
                  <Select
                    label=""
                    options={jenisOptions}
                    value={filterJenis}
                    onChange={(e) => setFilterJenis(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isConfigured && isOnline && (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={isSyncing}
                      onClick={triggerSync}
                    >
                      {isSyncing ? 'Menyinkronkan…' : 'Sinkronkan'}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refresh}
                    title="Muat Ulang Data"
                    disabled={isLoading || isSyncing}
                  >
                    🔄 Muat Ulang
                  </Button>
                </div>
              </div>
            </div>

            {/* State: Loading */}
            {isLoading && (
              <div className="py-12 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
                <span className="inline-block animate-spin mr-2">⏳</span>
                Memuat daftar pengajuan...
              </div>
            )}

            {/* State: Error */}
            {!isLoading && error && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                role="alert"
              >
                <p className="font-semibold">Gagal memuat data</p>
                <p className="text-xs mt-1">{error}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={refresh}
                  className="mt-3"
                >
                  Coba Lagi
                </Button>
              </div>
            )}

            {/* State: Kosong (Empty State Informatif) */}
            {!isLoading && !error && filteredAndSortedItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl mb-3">
                  📋
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {items.length === 0 ? 'Belum Ada Pengajuan Dispensasi' : 'Tidak Ada Pengajuan Sesuai Filter'}
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  {items.length === 0
                    ? 'Belum ada data 30 hari terakhir. Pengajuan dispensasi yang dikirim oleh petugas akan otomatis muncul di sini.'
                    : 'Tidak ada pengajuan yang cocok dengan filter yang Anda pilih. Coba pilih status atau jenis lain.'}
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  {items.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterJenis('all');
                      }}
                      className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Reset Filter
                    </button>
                  ) : (
                    <Link
                      to="/dispensasi"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      + Buat Pengajuan Pertama
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* State: Daftar Dispensasi */}
            {!isLoading && !error && filteredAndSortedItems.length > 0 && (
              <div className="space-y-2.5">
                {filteredAndSortedItems.map((item) => {
                  const isPending = item.status === DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN;
                  const isExpanded = expandedIds.has(item.id);

                  return (
                    <Card
                      key={item.id}
                      noPadding={true}
                      className={`transition-all duration-150 overflow-hidden ${
                        isPending
                          ? 'border-amber-300 ring-1 ring-amber-200/80 bg-white'
                          : 'hover:border-slate-300'
                      }`}
                    >
                      {/* ─── BARIS UTAMA (RINGKAS): NAMA - JABATAN - JENIS DISPEN - TOLAK - TERIMA ─── */}
                      <div
                        onClick={() => toggleExpand(item.id)}
                        className="cursor-pointer p-3 sm:p-4 hover:bg-slate-50/70 transition-colors select-none"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Sisi Kiri: Nama, Jabatan, Jenis Dispen */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                {item.namaPengaju}
                              </h3>
                              <span className="text-xs text-slate-300">•</span>
                              <span className="text-xs font-medium text-slate-500">
                                {item.jobBagian}
                              </span>
                              <span
                                className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                  item.source === 'server'
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {item.source}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {item.jenisDispensasi}
                                {item.subJenisShift && ` (${item.subJenisShift})`}
                              </span>
                              <span className="text-[11px] text-teal-700 font-medium">
                                {isExpanded ? 'Tutup detail' : 'Klik untuk lihat detail'}
                              </span>
                            </div>
                          </div>

                          {/* Sisi Kanan: Status & Tombol Tolak/Terima */}
                          <div
                            className="flex items-center gap-2 shrink-0 self-start sm:self-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <StatusBadge status={item.status} />

                            {isPending && (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRejectingItem(item);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-3 py-1 text-xs font-semibold"
                                >
                                  Tolak
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(item);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-semibold text-white"
                                >
                                  Terima
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ─── DETAIL FORM LENGKAP: HANYA MUNCUL SAAT CARD DI-KLIK ─── */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/40 p-3.5 sm:p-5 space-y-3.5 text-xs animate-in fade-in duration-150">
                          {/* Grid Periode & Keterangan Tambahan */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                              <span className="text-slate-400 block font-medium">Periode Dispensasi:</span>
                              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                                {formatDate(item.tanggalMulai)} s/d {formatDate(item.tanggalSelesai)}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                              <span className="text-slate-400 block font-medium">Detail Izin / Sub-Jenis:</span>
                              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                                {item.subJenisShift || item.keteranganIzinLainnya || '-'}
                              </span>
                            </div>
                          </div>

                          {/* Alasan Pengajuan Form */}
                          <div className="p-3 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700">
                            <span className="font-semibold text-slate-500 block mb-1">Alasan Pengajuan:</span>
                            <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">{item.alasan}</p>
                          </div>

                          {/* Slot Bukti / Lampiran (Wajib ada slotnya, isi jika ada / keterangan jika kosong) */}
                          <div className="p-3 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700">
                            <span className="font-semibold text-slate-500 block mb-1">Bukti / Lampiran:</span>
                            {item.lampiranUrl ? (
                              <div className="flex items-center gap-2 mt-1">
                                <a
                                  href={item.lampiranUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 font-bold text-xs transition-colors"
                                  title="Buka lampiran bukti di tab baru"
                                >
                                  <span>Lihat Berkas Lampiran</span>
                                </a>
                                <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                  {item.lampiranUrl.split('/').pop()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px] block mt-0.5">
                                Tidak ada lampiran bukti
                              </span>
                            )}
                          </div>

                          {/* Catatan Alasan Penolakan (Jika status Ditolak) */}
                          {item.status === DISPENSASI_STATUS.DITOLAK && item.alasanPenolakan && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                              <span className="font-bold block mb-1">Catatan Penolakan dari Pimpinan:</span>
                              <p className="whitespace-pre-wrap">{item.alasanPenolakan}</p>
                            </div>
                          )}

                          {/* Footer Detail: Waktu Submit & ID */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/70">
                            <span>Diajukan pada: {formatDateTime(item.createdAt)}</span>
                            <span className="truncate max-w-[150px]">ID: {item.id}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: PANTAUAN BENCANA ─── */}
        {activeTab === 'bencana' && (
          <BencanaCardList />
        )}

        {/* ─── TAB 3: KINERJA PUSKESMAS (COMING SOON) ─── */}
        {activeTab === 'kinerja' && (
          <ComingSoonCard />
        )}
      </div>

      {/* Modal Penolakan */}
      <RejectModal
        isOpen={Boolean(rejectingItem)}
        applicantName={rejectingItem?.namaPengaju || ''}
        onClose={() => setRejectingItem(null)}
        onConfirm={handleConfirmReject}
      />

      {/* Dialog Konfirmasi Persetujuan di Sadasbor */}
      <Dialog
        isOpen={Boolean(approvingItem)}
        onClose={() => setApprovingItem(null)}
        title="Konfirmasi Pemberian Dispensasi"
        description={`Pastikan Anda telah memberikan dispensasi untuk "${approvingItem?.namaPengaju}" secara manual di aplikasi Sadasbor Pemkab Tasikmalaya.`}
        confirmText="Ya, Sudah Diberikan di Sadasbor"
        confirmVariant="primary"
        onConfirm={handleConfirmApprove}
        isConfirmLoading={isApproving}
        cancelText="Batal"
        icon={<span className="text-emerald-600">✅</span>}
      />
    </PageLayout>
  );
}
