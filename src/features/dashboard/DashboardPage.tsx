import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Loader2,
  Map as MapIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  Button,
  Card,
  ComingSoonCard,
  Dialog,
  Footer,
  PuskesmasLogo,
  Select,
  StatusBadge,
} from '../../components';
import { DISPENSASI_TYPES } from '../../config/dispensasi';
import { SIGAP_PORTAL_URL } from '../../config/bencana';
import type { MergedDispensasiItem } from '../../lib/dispensasi-sync';
import { DISPENSASI_STATUS } from '../../types/dispensasi';
import { BencanaCardList, useSigapBencanaList } from '../bencana';
import { RejectModal, useDispensasiList } from '../dispensasi';
import TopicSummarySection from './TopicSummarySection';
import TrendSection from './TrendSection';

const CipatujahMapView = lazy(() => import('../peta/CipatujahMapView'));

type MainTab = 'grafik' | 'peta';
type SideMenuSection = 'dashboard' | 'dispensasi' | 'bencana' | 'tren' | 'peta';

const PAGE_SIZE = 10;

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

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DashboardPage() {
  const [mainTab, setMainTab] = useState<MainTab>('grafik');
  const [activeNav, setActiveNav] = useState<SideMenuSection>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [visibleDispensasiCount, setVisibleDispensasiCount] = useState(PAGE_SIZE);

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

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterJenis, setFilterJenis] = useState<string>('all');

  const [rejectingItem, setRejectingItem] = useState<MergedDispensasiItem | null>(null);
  const [approvingItem, setApprovingItem] = useState<MergedDispensasiItem | null>(null);
  const [isApproving, setIsApproving] = useState(false);

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

  function handleSelectNav(section: SideMenuSection) {
    setActiveNav(section);
    setMainTab(section === 'peta' ? 'peta' : 'grafik');
    setIsMobileMenuOpen(false);
  }

  // Semua pengajuan berstatus MENUNGGU
  const allPendingItems = useMemo(() => {
    return items
      .filter((item) => item.status === DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN)
      .sort((a, b) => {
        const timeA = new Date(a.tanggalMulai).getTime() || 0;
        const timeB = new Date(b.tanggalMulai).getTime() || 0;
        return timeA - timeB;
      });
  }, [items]);

  // Antrean Mendesak "Perlu Keputusan Hari Ini": hanya yang tanggalMulai <= besok (hari ini, besok, atau terlewat)
  const urgentPendingQueue = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = toLocalDateKey(tomorrow);

    return allPendingItems.filter((item) => {
      const startKey = item.tanggalMulai ? item.tanggalMulai.slice(0, 10) : '';
      return startKey !== '' && startKey <= tomorrowKey;
    });
  }, [allPendingItems]);

  const givenCount30Days = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return items.filter((item) => {
      if (item.status !== DISPENSASI_STATUS.SUDAH_DIBERIKAN) return false;
      const d = new Date(item.tanggalMulai || item.createdAt);
      return d >= thirtyDaysAgo;
    }).length;
  }, [items]);

  const givenCount = useMemo(
    () => items.filter((i) => i.status === DISPENSASI_STATUS.SUDAH_DIBERIKAN).length,
    [items]
  );
  const rejectedCount = useMemo(
    () => items.filter((i) => i.status === DISPENSASI_STATUS.DITOLAK).length,
    [items]
  );
  const cancelledCount = useMemo(
    () => items.filter((i) => i.status === DISPENSASI_STATUS.DIBATALKAN).length,
    [items]
  );

  const activeBencanaCount = useMemo(() => {
    if (!isSigapConfigured) return 0;
    return sigapReports.filter((r) => r.status !== 'Selesai' && r.status !== 'Ditolak').length;
  }, [sigapReports, isSigapConfigured]);

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (filterJenis !== 'all' && item.jenisDispensasi !== filterJenis) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (
        a.status === DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN &&
        b.status !== DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN
      ) {
        return -1;
      }
      if (
        a.status !== DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN &&
        b.status === DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN
      ) {
        return 1;
      }
      const timeA = new Date(a.tanggalMulai).getTime() || 0;
      const timeB = new Date(b.tanggalMulai).getTime() || 0;
      return timeA - timeB;
    });
  }, [items, filterStatus, filterJenis]);

  const paginatedItems = useMemo(
    () => filteredAndSortedItems.slice(0, visibleDispensasiCount),
    [filteredAndSortedItems, visibleDispensasiCount]
  );

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

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const navItems: {
    id: SideMenuSection;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'dispensasi',
      label: 'Dispensasi',
      icon: ClipboardCheck,
      badge: allPendingItems.length > 0 ? allPendingItems.length : undefined,
    },
    { id: 'bencana', label: 'Bencana', icon: AlertTriangle },
    { id: 'tren', label: 'Tren', icon: BarChart3 },
    { id: 'peta', label: 'Peta', icon: MapIcon },
  ];

  const statusChips = [
    { value: 'all', label: 'Semua', count: items.length },
    { value: DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN, label: 'Menunggu', count: allPendingItems.length },
    { value: DISPENSASI_STATUS.SUDAH_DIBERIKAN, label: 'Disetujui', count: givenCount },
    { value: DISPENSASI_STATUS.DITOLAK, label: 'Ditolak', count: rejectedCount },
    { value: DISPENSASI_STATUS.DIBATALKAN, label: 'Dibatalkan', count: cancelledCount },
  ];

  const jenisOptions = [
    { value: 'all', label: 'Semua Jenis Dispensasi' },
    ...DISPENSASI_TYPES.map((d) => ({ value: d.type, label: d.label })),
  ];

  function renderExpandedDetail(item: MergedDispensasiItem) {
    return (
      <div className="border-t border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded border border-slate-200 bg-white p-2.5">
            <span className="text-slate-500 block">Periode Dispensasi</span>
            <span className="font-mono font-semibold text-slate-900 mt-0.5 block tabular-nums">
              {formatDate(item.tanggalMulai)} s/d {formatDate(item.tanggalSelesai)}
            </span>
          </div>
          <div className="rounded border border-slate-200 bg-white p-2.5">
            <span className="text-slate-500 block">Sub-Jenis / Keterangan</span>
            <span className="font-medium text-slate-900 mt-0.5 block">
              {item.subJenisShift || item.keteranganIzinLainnya || '-'}
            </span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2.5">
          <span className="text-slate-500 block mb-1">Alasan Pengajuan</span>
          <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">
            {item.alasan}
          </p>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2.5">
          <span className="text-slate-500 block mb-1">Bukti / Lampiran</span>
          {item.lampiranUrl ? (
            <a
              href={item.lampiranUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-100"
            >
              <span>Lihat Berkas Lampiran</span>
              <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
            </a>
          ) : (
            <span className="text-slate-400">Tidak ada lampiran bukti</span>
          )}
        </div>

        {item.status === DISPENSASI_STATUS.DITOLAK && item.alasanPenolakan && (
          <div className="rounded border border-red-200 bg-red-50 p-2.5 text-red-800">
            <span className="font-semibold block mb-0.5">Alasan Penolakan</span>
            <p className="whitespace-pre-wrap">{item.alasanPenolakan}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 font-mono tabular-nums">
          <span>Diajukan: {formatDateTime(item.createdAt)}</span>
          <span className="truncate max-w-[200px]">ID: {item.id}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* ─── HEADER RESMI FLAT ─── */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="cursor-pointer lg:hidden rounded-md border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50"
              aria-label="Buka menu navigasi"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>

            <PuskesmasLogo
              size="md"
              textColor="dark"
              showText={true}
              title="UPTD PUSKESMAS CIPATUJAH"
              subtitle="Satu Peta, Banyak Lapisan • Jendela Pimpinan"
            />
          </div>

          <div className="hidden md:flex items-center gap-2.5 text-xs">
            <span className="font-mono text-slate-600 tabular-nums">{todayFormatted}</span>
            <span className="text-slate-300">|</span>
            {!isOnline ? (
              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 font-mono text-[11px] font-medium text-red-700">
                OFFLINE
              </span>
            ) : isConfigured ? (
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-700">
                SUPABASE AKTIF
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-[11px] font-medium text-amber-800">
                MODE LOKAL
              </span>
            )}
            {lastSyncTime && (
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                Sync {lastSyncTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/layanan"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Portal Layanan
            </Link>
            <Link
              to="/dispensasi"
              className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Form Dispensasi</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── SHELL UTAMA: SIDE MENU KIRI COLLAPSIBLE (TOMBOL TUTUP DI ATAS) ─── */}
      <div className="flex-1 mx-auto w-full max-w-7xl flex relative">
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } fixed lg:static inset-y-0 left-0 z-20 pt-16 lg:pt-4 pb-6 bg-white lg:bg-transparent border-r border-slate-200 transition-all duration-150 shrink-0 ${
            isSidebarCollapsed ? 'lg:w-16' : 'w-56'
          }`}
        >
          <div className="px-3 flex flex-col gap-3">
            {/* Tombol Tutup / Buka Menu di ATAS Sidebar */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex cursor-pointer items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              title={isSidebarCollapsed ? 'Perlebar menu' : 'Tutup menu'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4 mx-auto" strokeWidth={1.75} />
              ) : (
                <>
                  <span>Tutup Menu</span>
                  <PanelLeftClose className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                </>
              )}
            </button>

            <nav className="space-y-1" aria-label="Menu Dashboard">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    title={item.label}
                    className={`cursor-pointer w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </span>
                    {!isSidebarCollapsed && item.badge !== undefined && (
                      <span
                        className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-3 mt-3 border-t border-slate-200">
                <a
                  href={SIGAP_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {!isSidebarCollapsed && <span className="truncate">Portal SIGAP</span>}
                  </span>
                </a>
              </div>
            </nav>
          </div>
        </aside>

        {/* ─── KONTEN UTAMA ─── */}
        <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 space-y-5">
          {/* 2 TAB UTAMA: GRAFIK VS PETA */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mainTab === 'grafik'}
                onClick={() => {
                  setMainTab('grafik');
                  if (activeNav === 'peta') setActiveNav('dashboard');
                }}
                className={`cursor-pointer inline-flex items-center gap-1.5 rounded px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  mainTab === 'grafik'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Grafik</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mainTab === 'peta'}
                onClick={() => {
                  setMainTab('peta');
                  setActiveNav('peta');
                }}
                className={`cursor-pointer inline-flex items-center gap-1.5 rounded px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  mainTab === 'peta'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Peta</span>
              </button>
            </div>

            {pendingDraftsCount > 0 && (
              <span className="font-mono text-[11px] font-medium rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-amber-800">
                {pendingDraftsCount} DRAFT OFFLINE LOKAL
              </span>
            )}
          </div>

          {/* ─── TAB 1: GRAFIK ─── */}
          {mainTab === 'grafik' && (
            <div className="space-y-6">
              {/* HERO SECTION: PERLU KEPUTUSAN HARI INI (URGENT: HARI INI & BESOK, BISA DI-EXPAND) */}
              {activeNav === 'dashboard' && (
                <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                        Antrean Mendesak (Hari Ini & Besok)
                      </p>
                      <h1 className="text-base sm:text-lg font-semibold text-slate-900">
                        Perlu Keputusan Hari Ini
                      </h1>
                      <p className="text-xs text-slate-500">
                        Hanya menampilkan pengajuan menunggu dengan tanggal mulai hari ini, besok, atau yang sudah lewat. Klik baris untuk detail.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-800 self-start sm:self-center tabular-nums">
                      {urgentPendingQueue.length} MENDESAK
                    </span>
                  </div>

                  {urgentPendingQueue.length === 0 ? (
                    <div className="rounded border border-dashed border-slate-200 bg-slate-50 py-6 px-4 text-center text-xs text-slate-500">
                      Tidak ada pengajuan mendesak untuk hari ini maupun besok.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-md overflow-hidden">
                      {urgentPendingQueue.map((item) => {
                        const isExpanded = expandedIds.has(item.id);
                        return (
                          <div key={item.id} className="bg-white">
                            <div
                              onClick={() => toggleExpand(item.id)}
                              className="cursor-pointer p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm text-slate-900">
                                    {item.namaPengaju}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {item.jobBagian}
                                  </span>
                                  <StatusBadge status={item.status} />
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                  <span className="font-medium text-slate-800">
                                    {item.jenisDispensasi}
                                    {item.subJenisShift ? ` (${item.subJenisShift})` : ''}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="font-mono text-[11px] font-semibold text-amber-800 tabular-nums">
                                    Mulai: {formatDate(item.tanggalMulai)}
                                  </span>
                                  <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                                        <span>Tutup</span>
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                                        <span>Detail</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div
                                className="flex items-center gap-2 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setRejectingItem(item)}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  Tolak
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => setApprovingItem(item)}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                                >
                                  Terima
                                </Button>
                              </div>
                            </div>

                            {isExpanded && renderExpandedDetail(item)}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tautan Ringkas ke Daftar Lengkap (Opsi A) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
                    <span>
                      {allPendingItems.length > urgentPendingQueue.length
                        ? `${allPendingItems.length - urgentPendingQueue.length} pengajuan menunggu lainnya (jadwal > besok) ada di menu Dispensasi.`
                        : `Total seluruh pengajuan tercatat: ${items.length}.`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectNav('dispensasi')}
                      className="cursor-pointer inline-flex items-center gap-1 font-medium text-slate-800 hover:text-slate-950"
                    >
                      <span>Buka daftar lengkap ({items.length})</span>
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </section>
              )}

              {/* KARTU TOPIK ALA UKHSA */}
              {activeNav === 'dashboard' && (
                <TopicSummarySection
                  pendingCount={allPendingItems.length}
                  givenCount30Days={givenCount30Days}
                  pendingDraftsCount={pendingDraftsCount}
                  isSupabaseConfigured={isConfigured}
                  isSigapConfigured={isSigapConfigured}
                  activeBencanaCount={activeBencanaCount}
                  todayLabel={todayFormatted}
                  onNavigateSection={(sec) => handleSelectNav(sec)}
                />
              )}

              {/* GRAFIK TREN ALA OWID */}
              {(activeNav === 'dashboard' || activeNav === 'tren') && (
                <TrendSection
                  dispensasiItems={items}
                  sigapReports={sigapReports}
                  isSigapConfigured={isSigapConfigured}
                />
              )}

              {/* DAFTAR LENGKAP DISPENSASI (HANYA DI MENU DISPENSASI - OPSI A, DENGAN PAGINASI) */}
              {activeNav === 'dispensasi' && (
                <section className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {statusChips.map((chip) => {
                        const isActive = filterStatus === chip.value;
                        return (
                          <button
                            key={chip.value}
                            type="button"
                            onClick={() => {
                              setFilterStatus(chip.value);
                              setVisibleDispensasiCount(PAGE_SIZE);
                            }}
                            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                              isActive
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{chip.label}</span>
                            <span
                              className={`font-mono text-[10px] tabular-nums px-1 rounded ${
                                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {chip.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-48">
                        <Select
                          label=""
                          options={jenisOptions}
                          value={filterJenis}
                          onChange={(e) => {
                            setFilterJenis(e.target.value);
                            setVisibleDispensasiCount(PAGE_SIZE);
                          }}
                        />
                      </div>
                      {isConfigured && isOnline && (
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={isSyncing}
                          onClick={triggerSync}
                        >
                          Sinkronkan
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={refresh}
                        disabled={isLoading || isSyncing}
                        title="Muat ulang data"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
                          strokeWidth={1.75}
                        />
                      </Button>
                    </div>
                  </div>

                  {isLoading && (
                    <div className="rounded-lg border border-slate-200 bg-white py-10 text-center text-xs text-slate-500">
                      Memuat daftar pengajuan dispensasi...
                    </div>
                  )}

                  {!isLoading && error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700" role="alert">
                      <p className="font-semibold">Gagal memuat data</p>
                      <p className="mt-1">{error}</p>
                    </div>
                  )}

                  {!isLoading && !error && filteredAndSortedItems.length === 0 && (
                    <Card>
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="h-7 w-7 text-slate-400" strokeWidth={1.5} />
                        <p className="mt-2.5 text-sm font-medium text-slate-800">
                          {items.length === 0
                            ? 'Belum ada pengajuan dispensasi'
                            : 'Tidak ada pengajuan sesuai filter'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 max-w-md">
                          {items.length === 0
                            ? 'Pengajuan yang dikirim petugas melalui tautan formulir akan tampil di sini.'
                            : 'Ubah pilihan status atau jenis dispensasi untuk melihat data lain.'}
                        </p>
                      </div>
                    </Card>
                  )}

                  {!isLoading && !error && paginatedItems.length > 0 && (
                    <div className="space-y-2">
                      {paginatedItems.map((item) => {
                        const isPending = item.status === DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN;
                        const isExpanded = expandedIds.has(item.id);

                        return (
                          <Card key={item.id} noPadding={true}>
                            <div
                              onClick={() => toggleExpand(item.id)}
                              className="cursor-pointer p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm text-slate-900">
                                      {item.namaPengaju}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {item.jobBagian}
                                    </span>
                                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600">
                                      {item.source}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                                    <span className="font-medium text-slate-800">
                                      {item.jenisDispensasi}
                                      {item.subJenisShift ? ` (${item.subJenisShift})` : ''}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-mono text-[11px] tabular-nums">
                                      {formatDate(item.tanggalMulai)} – {formatDate(item.tanggalSelesai)}
                                    </span>
                                    <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
                                      {isExpanded ? (
                                        <>
                                          <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                                          <span>Tutup</span>
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                                          <span>Detail</span>
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  className="flex items-center gap-2 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <StatusBadge status={item.status} />
                                  {isPending && (
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setRejectingItem(item)}
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                      >
                                        Tolak
                                      </Button>
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setApprovingItem(item)}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white"
                                      >
                                        Terima
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isExpanded && renderExpandedDetail(item)}
                          </Card>
                        );
                      })}

                      {filteredAndSortedItems.length > paginatedItems.length && (
                        <div className="pt-2 flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setVisibleDispensasiCount((prev) => prev + PAGE_SIZE)}
                          >
                            Tampilkan {Math.min(PAGE_SIZE, filteredAndSortedItems.length - paginatedItems.length)} lagi ({paginatedItems.length}/{filteredAndSortedItems.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* PANTAUAN BENCANA */}
              {activeNav === 'bencana' && <BencanaCardList />}

              {/* KINERJA PER PERIODE (COMING SOON PLACEHOLDER) */}
              {activeNav === 'dashboard' && <ComingSoonCard />}
            </div>
          )}

          {/* ─── TAB 2: PETA TERPADU CIPATUJAH (9 LAPISAN) ─── */}
          {mainTab === 'peta' && (
            <Suspense
              fallback={
                <div className="min-h-[420px] flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" strokeWidth={1.75} />
                    <span className="font-medium">Memuat peta Cipatujah...</span>
                  </div>
                </div>
              }
            >
              <CipatujahMapView
                sigapReports={sigapReports}
                isSigapConfigured={isSigapConfigured}
              />
            </Suspense>
          )}
        </main>
      </div>

      <Footer maxWidth="full" />

      <RejectModal
        isOpen={Boolean(rejectingItem)}
        applicantName={rejectingItem?.namaPengaju || ''}
        onClose={() => setRejectingItem(null)}
        onConfirm={handleConfirmReject}
      />

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
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" strokeWidth={1.75} />}
      />
    </div>
  );
}
