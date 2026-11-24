import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout, Card, StatusBadge, EmptyState, Button, Select, ComingSoonCard } from '../../components';
import { useDispensasiList } from './useDispensasiList';
import { DISPENSASI_STATUS } from '../../types/dispensasi';
import { DISPENSASI_TYPES } from '../../config/dispensasi';
import RejectModal from './RejectModal';
import { BencanaCardList } from '../bencana';
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
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function KapusDashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dispensasi');

  const {
    items,
    isLoading,
    isSyncing,
    error,
    isOnline,
    isConfigured,
    refresh,
    triggerSync,
    giveDecision,
  } = useDispensasiList();

  // State Filter
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterJenis, setFilterJenis] = useState<string>('all');

  // State Modal Penolakan
  const [rejectingItem, setRejectingItem] = useState<MergedDispensasiItem | null>(null);

  // Opsi filter status
  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: DISPENSASI_STATUS.MENUNGGU_KAPUS, label: 'Menunggu Kapus' },
    { value: DISPENSASI_STATUS.SUDAH_DIBERIKAN, label: 'Sudah Diberikan di Sadasbor' },
    { value: DISPENSASI_STATUS.DITOLAK, label: 'Ditolak' },
    { value: DISPENSASI_STATUS.DIBATALKAN, label: 'Dibatalkan' },
  ];

  // Opsi filter jenis
  const jenisOptions = [
    { value: 'all', label: 'Semua Jenis' },
    ...DISPENSASI_TYPES.map((d) => ({ value: d.type, label: d.label })),
  ];

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }
      if (filterJenis !== 'all' && item.jenisDispensasi !== filterJenis) {
        return false;
      }
      return true;
    });
  }, [items, filterStatus, filterJenis]);

  // Hitung jumlah yang butuh tindakan (Menunggu Kapus)
  const pendingCount = useMemo(() => {
    return items.filter((item) => item.status === DISPENSASI_STATUS.MENUNGGU_KAPUS).length;
  }, [items]);

  async function handleApprove(item: MergedDispensasiItem) {
    if (!window.confirm(`Konfirmasi: Tandai pengajuan dari "${item.namaPengaju}" sebagai Sudah Diberikan di Sadasbor?`)) {
      return;
    }
    await giveDecision(item, DISPENSASI_STATUS.SUDAH_DIBERIKAN);
  }

  async function handleConfirmReject(reason: string) {
    if (!rejectingItem) return;
    await giveDecision(rejectingItem, DISPENSASI_STATUS.DITOLAK, reason);
  }

  return (
    <PageLayout
      title="Dashboard Puskesmas Cipatujah"
      subtitle="Satu Jendela Pemantauan Layanan & Darurat"
      headerRight={
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/dispensasi"
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            + Form Dispensasi
          </Link>
          <Link
            to="/bencana"
            className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            🚨 Lapor Bencana
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner Status Koneksi & Sinkronisasi */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Koneksi:</span>
            {!isOnline ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-rose-700 font-medium border border-rose-200">
                🔴 Offline
              </span>
            ) : isConfigured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 font-medium border border-emerald-200">
                🟢 Server Supabase Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 font-medium border border-amber-200">
                🟡 Mode Lokal (.env belum diisi)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                {pendingCount} Dispensasi Menunggu
              </span>
            )}
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
              title="Muat Ulang"
              disabled={isLoading || isSyncing}
            >
              🔄
            </Button>
          </div>
        </div>

        {/* Tab Navigasi Dashboard */}
        <div className="flex border-b border-slate-200 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('dispensasi')}
            className={`cursor-pointer px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'dispensasi'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>📋 Dispensasi</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 text-white text-[10px] px-1.5 py-0.2">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bencana')}
            className={`cursor-pointer px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'bencana'
                ? 'border-red-600 text-red-600 font-bold'
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
            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded">
              Soon
            </span>
          </button>
        </div>

        {/* ─── TAB 1: DISPENSASI ─── */}
        {activeTab === 'dispensasi' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <Select
                label="Filter Status"
                options={statusOptions}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
              <Select
                label="Filter Jenis"
                options={jenisOptions}
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
              />
            </div>

            {/* State: Loading */}
            {isLoading && (
              <div className="py-12 text-center text-sm text-slate-500">
                <span className="inline-block animate-spin mr-2">⏳</span>
                Memuat daftar pengajuan...
              </div>
            )}

            {/* State: Error */}
            {!isLoading && error && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                role="alert"
              >
                <p className="font-medium">Gagal memuat data</p>
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

            {/* State: Kosong */}
            {!isLoading && !error && filteredItems.length === 0 && (
              <Card>
                <EmptyState
                  icon="📥"
                  title="Tidak ada pengajuan yang sesuai"
                  description={
                    items.length === 0
                      ? 'Pengajuan dispensasi yang diisi oleh petugas akan muncul di sini.'
                      : 'Coba ubah filter di atas untuk melihat data lain.'
                  }
                />
              </Card>
            )}

            {/* State: Ada Data */}
            {!isLoading && !error && filteredItems.length > 0 && (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const isPending = item.status === DISPENSASI_STATUS.MENUNGGU_KAPUS;

                  return (
                    <Card
                      key={item.id}
                      className={`transition-colors ${
                        isPending ? 'border-amber-300 ring-1 ring-amber-200/60' : 'hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        {/* Baris Atas */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 text-base">
                                {item.namaPengaju}
                              </h3>
                              <span
                                className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                  item.source === 'server'
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {item.source}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500">
                              {item.jobBagian}
                            </p>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>

                        {/* Baris Tengah: Info Dispensasi */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block">Jenis Dispensasi:</span>
                            <span className="font-medium text-slate-800">
                              {item.jenisDispensasi}
                              {item.subJenisShift && (
                                <span className="text-blue-600 ml-1">
                                  ({item.subJenisShift})
                                </span>
                              )}
                              {item.keteranganIzinLainnya && (
                                <span className="text-slate-600 ml-1 italic">
                                  - {item.keteranganIzinLainnya}
                                </span>
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Periode Dispensasi:</span>
                            <span className="font-medium text-slate-800">
                              {formatDate(item.tanggalMulai)} s/d {formatDate(item.tanggalSelesai)}
                            </span>
                          </div>
                        </div>

                        {/* Alasan Pengajuan */}
                        <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
                          <span className="font-medium text-slate-500 block mb-0.5">Alasan:</span>
                          <p className="whitespace-pre-wrap">{item.alasan}</p>
                        </div>

                        {/* Alasan Penolakan */}
                        {item.status === DISPENSASI_STATUS.DITOLAK && item.alasanPenolakan && (
                          <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                            <span className="font-bold block mb-0.5">Alasan Penolakan:</span>
                            <p className="whitespace-pre-wrap">{item.alasanPenolakan}</p>
                          </div>
                        )}

                        {/* Baris Aksi Keputusan Kapus */}
                        {isPending && (
                          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setRejectingItem(item)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              Tolak
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(item)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              Sudah Diberikan di Sadasbor
                            </Button>
                          </div>
                        )}

                        {/* Baris Footer: Waktu & ID */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                          <span>Diajukan: {formatDateTime(item.createdAt)}</span>
                          <span className="text-slate-400 truncate max-w-[150px]">ID: {item.id}</span>
                        </div>
                      </div>
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
    </PageLayout>
  );
}
