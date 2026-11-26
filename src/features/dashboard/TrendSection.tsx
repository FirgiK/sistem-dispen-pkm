import { useMemo, useState } from 'react';
import type { MergedDispensasiItem } from '../../lib/dispensasi-sync';
import type { SigapBencanaReport } from '../../types/bencana';

type WindowDays = 7 | 30;

interface DailyBarPoint {
  dateKey: string;
  label: string;
  count: number;
}

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildDailySeries(dates: string[], days: WindowDays): DailyBarPoint[] {
  const countsByKey = new Map<string, number>();

  for (const raw of dates) {
    if (!raw) continue;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) continue;
    const key = toLocalDateKey(parsed);
    countsByKey.set(key, (countsByKey.get(key) || 0) + 1);
  }

  const today = new Date();
  const series: DailyBarPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toLocalDateKey(d);
    series.push({
      dateKey: key,
      label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      count: countsByKey.get(key) || 0,
    });
  }

  return series;
}

interface OwidBarChartProps {
  title: string;
  headline: string;
  series: DailyBarPoint[];
  barColorClass: string;
  caveat: string;
  source: string;
  days: WindowDays;
  onChangeDays: (days: WindowDays) => void;
  emptyMessage?: string;
}

function OwidBarChartCard({
  title,
  headline,
  series,
  barColorClass,
  caveat,
  source,
  days,
  onChangeDays,
  emptyMessage,
}: OwidBarChartProps) {
  const totalInWindow = series.reduce((sum, pt) => sum + pt.count, 0);
  const maxCount = Math.max(...series.map((pt) => pt.count), 1);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-4">
      {/* 1. Headline Ringkas + Toggle 7 / 30 Hari */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="text-base font-semibold text-slate-900 mt-0.5">
            {headline}
          </h3>
          <p className="font-mono text-xs text-slate-600 mt-1 tabular-nums">
            Total {days} hari terakhir: <strong className="text-slate-900">{totalInWindow}</strong>
          </p>
        </div>

        <div
          className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 self-start shrink-0"
          role="group"
          aria-label={`Rentang waktu ${title}`}
        >
          {([7, 30] as WindowDays[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChangeDays(option)}
              className={`cursor-pointer rounded px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                days === option
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option}H
            </button>
          ))}
        </div>
      </div>

      {/* 2. Visual Grafik Batang (Tanpa Recharts) */}
      {emptyMessage ? (
        <div className="h-36 rounded border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center px-4 text-center">
          <p className="text-xs text-slate-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="h-36 flex items-end gap-1 border-b border-slate-200 pb-1 pt-4">
            {series.map((pt) => {
              const heightPct = pt.count > 0 ? Math.max((pt.count / maxCount) * 100, 8) : 2;
              return (
                <div
                  key={pt.dateKey}
                  className="flex-1 h-full flex flex-col justify-end group relative"
                  title={`${pt.label}: ${pt.count}`}
                >
                  <div
                    className={`w-full rounded-t-xs transition-opacity ${
                      pt.count > 0 ? barColorClass : 'bg-slate-200'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between font-mono text-[10px] text-slate-500 tabular-nums">
            <span>{series[0]?.label}</span>
            <span>{series[Math.floor(series.length / 2)]?.label}</span>
            <span>{series[series.length - 1]?.label}</span>
          </div>
        </div>
      )}

      {/* 3. Caveat Kejujuran Data + 4. Sumber Resmi */}
      <div className="border-t border-slate-100 pt-3 space-y-1 text-[11px] text-slate-500">
        <p className="leading-relaxed">
          <span className="font-semibold text-slate-700">Catatan data:</span> {caveat}
        </p>
        <p className="font-mono text-[10px] text-slate-500">
          Sumber: {source}
        </p>
      </div>
    </section>
  );
}

interface TrendSectionProps {
  dispensasiItems: MergedDispensasiItem[];
  sigapReports: SigapBencanaReport[];
  isSigapConfigured: boolean;
}

export default function TrendSection({
  dispensasiItems,
  sigapReports,
  isSigapConfigured,
}: TrendSectionProps) {
  const [dispensasiDays, setDispensasiDays] = useState<WindowDays>(30);
  const [bencanaDays, setBencanaDays] = useState<WindowDays>(30);

  const dispensasiSeries = useMemo(() => {
    const dates = dispensasiItems.map((item) => item.tanggalMulai || item.createdAt);
    return buildDailySeries(dates, dispensasiDays);
  }, [dispensasiItems, dispensasiDays]);

  const bencanaSeries = useMemo(() => {
    if (!isSigapConfigured) return buildDailySeries([], bencanaDays);
    const dates = sigapReports.map((r) => r.waktu_kejadian || r.waktu_laporan);
    return buildDailySeries(dates, bencanaDays);
  }, [sigapReports, isSigapConfigured, bencanaDays]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <OwidBarChartCard
        title="Tren Dispensasi Pegawai"
        headline="Volume pengajuan berdasarkan tanggal mulai dispensasi"
        series={dispensasiSeries}
        barColorClass="bg-slate-800 hover:bg-slate-900"
        days={dispensasiDays}
        onChangeDays={setDispensasiDays}
        caveat="Mencakup data server dan draft lokal perangkat yang belum tersinkronisasi."
        source="Supabase (tabel dispensasi) + IndexedDB lokal"
      />

      <OwidBarChartCard
        title="Tren Kejadian Bencana"
        headline="Frekuensi kejadian berdasarkan waktu kejadian asli"
        series={bencanaSeries}
        barColorClass="bg-amber-600 hover:bg-amber-700"
        days={bencanaDays}
        onChangeDays={setBencanaDays}
        emptyMessage={
          !isSigapConfigured
            ? 'API SIGAP belum terhubung — grafik tren bencana kosong (0 data).'
            : sigapReports.length === 0
            ? 'Belum ada laporan bencana yang tercatat pada rentang ini.'
            : undefined
        }
        caveat={
          isSigapConfigured
            ? 'Waktu dihitung dari waktu kejadian asli di lapangan, bukan waktu tiba di server.'
            : 'Endpoint VITE_SIGAP_API_URL belum diatur. Tidak ada data simulasi yang ditampilkan.'
        }
        source="API SIGAP Puskesmas Cipatujah"
      />
    </div>
  );
}
