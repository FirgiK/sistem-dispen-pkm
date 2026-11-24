import { Link } from 'react-router-dom';
import { Card, EmptyState, Button } from '../../components';
import { useBencanaList } from './useBencanaList';

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

export default function BencanaCardList() {
  const { items, isLoading, error, refresh } = useBencanaList();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>🚨 Pantauan Laporan Bencana</span>
            <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">
              {items.length} Laporan
            </span>
          </h2>
          <p className="text-xs text-slate-500">Urutan: Waktu kejadian terbaru</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/bencana"
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-xs"
          >
            + Lapor Bencana
          </Link>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
            🔄
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="py-8 text-center text-sm text-slate-500">
          <span className="inline-block animate-spin mr-2">⏳</span> Memuat pantauan bencana...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <Card>
          <EmptyState
            icon="🛡️"
            title="Tidak ada laporan bencana aktif"
            description="Laporan kejadian bencana yang dikirim petugas lapangan akan muncul di sini secara real-time / setelah sinkronisasi."
          />
        </Card>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((b) => (
            <Card key={b.id} className="border-l-4 border-l-red-500 hover:border-slate-300 transition-colors">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        {b.jenisBencana}
                        {b.keteranganJenisLainnya && ` (${b.keteranganJenisLainnya})`}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                        {b.syncStatus === 'synced' ? 'Terkirim' : 'Lokal (Pending)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      📍 <strong>{b.lokasi}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-red-600 block">
                      Waktu Kejadian:
                    </span>
                    <span className="text-xs text-slate-700 font-medium">
                      {formatDateTime(b.waktuKejadian)}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                  <span className="font-semibold text-slate-500 block mb-0.5">Deskripsi Lapangan:</span>
                  <p className="whitespace-pre-wrap">{b.deskripsi}</p>
                </div>

                {(b.statusKorban === 'ada' || b.kebutuhanMendesak) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5">
                    {b.statusKorban === 'ada' && (
                      <div>
                        <span className="font-bold text-amber-800 block">Korban:</span>
                        <span className="text-amber-900">{b.perkiraanJumlahKorban || 'Ada korban (jumlah belum pasti)'}</span>
                      </div>
                    )}
                    {b.kebutuhanMendesak && (
                      <div>
                        <span className="font-bold text-amber-800 block">Kebutuhan Bantuan:</span>
                        <span className="text-amber-900">{b.kebutuhanMendesak}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                  <span>Pelapor: {b.namaPelapor} ({b.jobBagian})</span>
                  {b.koordinatGPS && (
                    <span>GPS: {b.koordinatGPS.latitude}, {b.koordinatGPS.longitude}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
