import { Card, EmptyState, Button } from '../../components';
import { useSigapBencanaList } from './useSigapBencanaList';
import { SIGAP_PORTAL_URL, SIGAP_STATUS_COLORS } from '../../config/bencana';

function formatDateTimeID(dateStr: string): string {
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
  const { items, isConfigured, isLoading, error, refresh } = useSigapBencanaList();

  return (
    <div className="space-y-4">
      {/* Status Bar Konfigurasi API SIGAP */}
      {!isConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 shadow-xs">
          <div className="flex items-start gap-2">
            <span className="text-base">⚠️</span>
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">
                Wadah Terpasang: API SIGAP Belum Terhubung
              </p>
              <p className="text-amber-800 leading-relaxed">
                Modul pantauan bencana sudah siap menampung data dari sistem SIGAP. Begitu endpoint API resmi tersedia, masukkan ke variabel <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-medium">VITE_SIGAP_API_URL</code> di file <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-medium">.env</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Aksi Tab Pantauan */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>🚨 Pantauan Laporan Bencana (SIGAP)</span>
            <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-semibold">
              {items.length} Laporan
            </span>
          </h2>
          <p className="text-xs text-slate-500">Urutan: Waktu kejadian terbaru dari SIGAP</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={SIGAP_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-xs"
          >
            <span>+ Lapor di SIGAP</span>
            <span className="text-[10px]">↗</span>
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading || !isConfigured}
            title="Muat ulang data dari SIGAP"
          >
            🔄
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="py-8 text-center text-sm text-slate-500">
          <span className="inline-block animate-spin mr-2">⏳</span> Mengambil data dari server SIGAP...
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
            title="Belum ada laporan bencana aktif"
            description="Laporan kejadian bencana yang masuk melalui web SIGAP akan tampil secara otomatis di sini."
          />
        </Card>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((b) => {
            const statusStyle = SIGAP_STATUS_COLORS[b.status] || {
              bg: 'bg-slate-50',
              text: 'text-slate-700',
              border: 'border-slate-300',
            };

            return (
              <Card
                key={b.id}
                className="border-l-4 border-l-red-500 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col gap-2.5">
                  {/* Baris Judul & Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {b.jenis_bencana}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {b.status || 'Belum Diverifikasi'}
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
                        {formatDateTimeID(b.waktu_kejadian)}
                      </span>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
                    <span className="font-semibold text-slate-500 block mb-0.5">
                      Deskripsi Lapangan:
                    </span>
                    <p className="whitespace-pre-wrap leading-relaxed">{b.deskripsi}</p>
                  </div>

                  {/* Kondisi Korban & Kebutuhan Bantuan */}
                  {(b.kondisi_korban || b.kebutuhan_bantuan) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5">
                      {b.kondisi_korban && (
                        <div>
                          <span className="font-bold text-amber-800 block">Kondisi Korban:</span>
                          <span className="text-amber-950">{b.kondisi_korban}</span>
                        </div>
                      )}
                      {b.kebutuhan_bantuan && (
                        <div>
                          <span className="font-bold text-amber-800 block">Kebutuhan Bantuan:</span>
                          <span className="text-amber-950">{b.kebutuhan_bantuan}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info Pelapor & Waktu Laporan */}
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>
                      Pelapor: <strong className="text-slate-600">{b.nama_pelapor}</strong>{' '}
                      ({b.bagian_pos_tugas})
                    </span>
                    <span>Laporan diterima: {formatDateTimeID(b.waktu_laporan)}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
