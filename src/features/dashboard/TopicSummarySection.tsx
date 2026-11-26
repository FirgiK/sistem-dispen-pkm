import { ArrowRight } from 'lucide-react';

interface TopicCardProps {
  title: string;
  value: number | string;
  unit: string;
  dateLabel: string;
  source: string;
  caveat: string;
  onDetailClick: () => void;
  detailLabel: string;
  statusTone?: 'neutral' | 'warning' | 'danger';
}

function TopicCard({
  title,
  value,
  unit,
  dateLabel,
  source,
  caveat,
  onDetailClick,
  detailLabel,
  statusTone = 'neutral',
}: TopicCardProps) {
  const valueToneClass =
    statusTone === 'warning'
      ? 'text-amber-700'
      : statusTone === 'danger'
      ? 'text-red-700'
      : 'text-slate-900';

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between gap-3">
      <div>
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={onDetailClick}
            className="cursor-pointer group inline-flex items-center gap-1 text-left text-sm font-semibold text-slate-900 hover:text-slate-700"
          >
            <span>{title}</span>
            <ArrowRight
              className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={1.75}
            />
          </button>
          <span className="font-mono text-[10px] text-slate-500 shrink-0 tabular-nums">
            {dateLabel}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className={`font-mono text-2xl font-bold tabular-nums ${valueToneClass}`}>
            {value}
          </span>
          <span className="text-xs text-slate-600">{unit}</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-2.5 space-y-1 text-[11px] text-slate-500">
        <p className="leading-relaxed">{caveat}</p>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="font-mono text-[10px] text-slate-500 truncate">
            Sumber: {source}
          </span>
          <button
            type="button"
            onClick={onDetailClick}
            className="cursor-pointer font-medium text-slate-700 hover:text-slate-900 shrink-0"
          >
            {detailLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

interface TopicSummarySectionProps {
  pendingCount: number;
  givenCount30Days: number;
  pendingDraftsCount: number;
  isLoading?: boolean;
  isSupabaseConfigured: boolean;
  isSigapConfigured: boolean;
  activeBencanaCount: number;
  todayLabel: string;
  onNavigateSection: (section: 'dispensasi' | 'bencana' | 'peta') => void;
}

export default function TopicSummarySection({
  pendingCount,
  givenCount30Days,
  pendingDraftsCount,
  isLoading = false,
  isSupabaseConfigured,
  isSigapConfigured,
  activeBencanaCount,
  todayLabel,
  onNavigateSection,
}: TopicSummarySectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TopicCard
        title="Antrean Dispensasi Menunggu"
        value={isLoading ? '...' : pendingCount}
        unit="pengajuan menunggu keputusan"
        dateLabel={todayLabel}
        source={isSupabaseConfigured ? 'Supabase: dispensasi' : 'IndexedDB Lokal'}
        caveat={
          pendingDraftsCount > 0
            ? `Termasuk ${pendingDraftsCount} draft lokal yang belum tersinkron ke server.`
            : 'Diurutkan di antrean utama berdasarkan tanggal mulai terdekat.'
        }
        statusTone={pendingCount > 0 ? 'warning' : 'neutral'}
        onDetailClick={() => onNavigateSection('dispensasi')}
        detailLabel="Lihat antrean"
      />

      <TopicCard
        title="Dispensasi Disetujui (30 Hari)"
        value={isLoading ? '...' : givenCount30Days}
        unit="sudah diberikan di Sadasbor"
        dateLabel="30 hari terakhir"
        source={isSupabaseConfigured ? 'Supabase: dispensasi' : 'IndexedDB Lokal'}
        caveat="Menghitung status Sudah Diberikan di Sadasbor dalam 30 hari terakhir."
        onDetailClick={() => onNavigateSection('dispensasi')}
        detailLabel="Rincian dispensasi"
      />

      <TopicCard
        title="Pantauan Bencana SIGAP"
        value={isSigapConfigured ? activeBencanaCount : 0}
        unit={isSigapConfigured ? 'laporan aktif' : 'API SIGAP belum terhubung'}
        dateLabel={todayLabel}
        source="API SIGAP Cipatujah"
        caveat={
          isSigapConfigured
            ? 'Menampilkan laporan berstatus selain Selesai dan Ditolak.'
            : 'Nilai 0 karena VITE_SIGAP_API_URL belum diatur. Tanpa data simulasi.'
        }
        statusTone={isSigapConfigured && activeBencanaCount > 0 ? 'danger' : 'neutral'}
        onDetailClick={() => onNavigateSection('bencana')}
        detailLabel="Buka pantauan"
      />
    </div>
  );
}
