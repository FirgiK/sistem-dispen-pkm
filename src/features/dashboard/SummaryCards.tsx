interface SummaryCardsProps {
  activeTab: 'dispensasi' | 'bencana' | 'kinerja';
  // Metrik Dispensasi
  pendingCount: number;
  givenCount30Days: number;
  rejectedCount: number;
  pendingDraftsCount: number;
  // Metrik Bencana SIGAP
  isSigapConfigured: boolean;
  activeBencanaCount: number | null;
  handlingBencanaCount: number;
  completedBencanaCount: number;
  totalBencanaCount: number;
}

export default function SummaryCards({
  activeTab,
  pendingCount,
  givenCount30Days,
  rejectedCount,
  pendingDraftsCount,
  isSigapConfigured,
  activeBencanaCount,
  handlingBencanaCount,
  completedBencanaCount,
  totalBencanaCount,
}: SummaryCardsProps) {
  // Jika tab Kinerja (Coming Soon), tidak perlu kartu ringkasan
  if (activeTab === 'kinerja') {
    return null;
  }

  // ─── KARTU RINGKASAN KHUSUS TAB DISPENSASI ───
  if (activeTab === 'dispensasi') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Kartu 1: Menunggu Persetujuan */}
        <div className="rounded-xl bg-white border border-slate-200/80 border-l-4 border-l-[#2563EB] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Menunggu
            </span>
            <span className="text-base" title="Menunggu Tindakan Kapus">📋</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {pendingCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {pendingCount > 0 ? `${pendingCount} perlu tindakan` : 'Semua tertangani'}
          </p>
        </div>

        {/* Kartu 2: Disetujui 30 Hari Terakhir */}
        <div className="rounded-xl bg-white border border-slate-200/80 border-l-4 border-l-[#16A34A] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Disetujui 30 Hari
            </span>
            <span className="text-base" title="Diberikan di Sadasbor">✅</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {givenCount30Days}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {givenCount30Days > 0 ? 'Diberikan di Sadasbor' : 'Belum ada data 30 hari'}
          </p>
        </div>

        {/* Kartu 3: Pengajuan Ditolak */}
        <div className="rounded-xl bg-white border border-slate-200/80 border-l-4 border-l-[#E11D48] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Ditolak
            </span>
            <span className="text-base" title="Permohonan Ditolak">❌</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {rejectedCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {rejectedCount > 0 ? `${rejectedCount} permohonan ditolak` : 'Tidak ada penolakan'}
          </p>
        </div>

        {/* Kartu 4: Draft Offline Belum Terkirim */}
        <div className="rounded-xl bg-white border border-slate-200/80 border-l-4 border-l-[#D97706] p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Draft Offline
            </span>
            <span className="text-base" title="Draft Lokal">💾</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {pendingDraftsCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {pendingDraftsCount > 0 ? 'Menunggu koneksi internet' : 'Semua tersinkron'}
          </p>
        </div>
      </div>
    );
  }

  // ─── KARTU RINGKASAN KHUSUS TAB PANTAUAN BENCANA ───
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Kartu 1: Laporan Bencana Aktif */}
      <div className="rounded-xl bg-white border border-slate-200/80 border-l-4 border-l-[#DC2626] p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Bencana Aktif
          </span>
          <span className="text-base" title="Laporan Aktif">🚨</span>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          {isSigapConfigured ? (activeBencanaCount ?? 0) : '0'}
        </p>
        <p className="text-[11px] text-slate-500 mt-1 truncate">
          {isSigapConfigured
            ? activeBencanaCount && activeBencanaCount > 0
              ? `${activeBencanaCount} laporan aktif`
              : 'Tidak ada bencana aktif'
            : 'API SIGAP belum terhubung'}
        </p>
      </div>

      {/* Kartu 2: Sedang Ditangani */}
      <div className="rounded-xl bg-white border border-slate-200/80 border-l-4 border-l-[#D97706] p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Sedang Ditangani
          </span>
          <span className="text-base" title="Proses Penanganan Lapangan">⏳</span>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          {isSigapConfigured ? handlingBencanaCount : '0'}
        </p>
        <p className="text-[11px] text-slate-500 mt-1 truncate">
          {isSigapConfigured
            ? handlingBencanaCount > 0
              ? `${handlingBencanaCount} dalam penanganan`
              : 'Belum ada proses berjalan'
            : 'Menunggu koneksi SIGAP'}
        </p>
      </div>

      {/* Kartu 3: Selesai Ditangani */}
      <div className="rounded-xl bg-white border border-slate-200/80 border-l-4 border-l-[#16A34A] p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Selesai
          </span>
          <span className="text-base" title="Penanganan Tuntas">🏁</span>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          {isSigapConfigured ? completedBencanaCount : '0'}
        </p>
        <p className="text-[11px] text-slate-500 mt-1 truncate">
          {isSigapConfigured
            ? completedBencanaCount > 0
              ? `${completedBencanaCount} penanganan tuntas`
              : 'Belum ada laporan selesai'
            : 'Menunggu koneksi SIGAP'}
        </p>
      </div>

      {/* Kartu 4: Total Laporan Masuk */}
      <div className="rounded-xl bg-white border border-slate-200/80 border-l-4 border-l-[#475569] p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total Laporan
          </span>
          <span className="text-base" title="Total Seluruh Laporan">📑</span>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          {isSigapConfigured ? totalBencanaCount : '0'}
        </p>
        <p className="text-[11px] text-slate-500 mt-1 truncate">
          {isSigapConfigured ? `${totalBencanaCount} data di portal SIGAP` : 'Portal Mandiri SIGAP'}
        </p>
      </div>
    </div>
  );
}
