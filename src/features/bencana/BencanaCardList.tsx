import { AlertTriangle, ExternalLink, MapPin, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button, Card } from '../../components';
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
      {/* Status Koneksi API SIGAP */}
      {!isConfigured && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" strokeWidth={1.75} />
            <div className="space-y-1">
              <p className="font-semibold text-amber-900 text-sm">
                API SIGAP belum terhubung
              </p>
              <p className="text-amber-800 leading-relaxed">
                Total laporan aktif ditampilkan sebagai <span className="font-mono font-semibold">0</span> karena endpoint resmi belum dikonfigurasi. Tidak ada data simulasi yang dimasukkan ke hitungan dashboard.
              </p>
              <p className="text-[11px] text-amber-800">
                Hubungkan dengan mengisi <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SIGAP_API_URL</code> pada file <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Daftar Laporan Bencana */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Pantauan Laporan Bencana (SIGAP)
            </h2>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 tabular-nums">
              {items.length} LAPORAN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Urutan berdasarkan waktu kejadian terbaru • Sumber: API SIGAP Cipatujah
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={SIGAP_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Buka Portal SIGAP</span>
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          </a>
          <Button
            variant="secondary"
            size="sm"
            onClick={refresh}
            disabled={isLoading || !isConfigured}
            title="Muat ulang data dari SIGAP"
            className="inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            <span>Muat Ulang</span>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-slate-200 bg-white py-10 text-center text-xs text-slate-500">
          Mengambil data dari server SIGAP...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShieldCheck className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium text-slate-700">
              {isConfigured ? 'Belum ada laporan bencana aktif' : 'API SIGAP belum terhubung'}
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              {isConfigured
                ? 'Laporan kejadian bencana yang masuk melalui web SIGAP akan tampil otomatis di daftar ini.'
                : 'Daftar laporan dan grafik bencana tetap kosong (0) sampai koneksi API SIGAP resmi diaktifkan.'}
            </p>
          </div>
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
              <Card key={b.id}>
                <div className="flex flex-col gap-3">
                  {/* Baris Judul & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm sm:text-base">
                          {b.jenis_bencana}
                        </span>
                        <span
                          className={`font-mono uppercase tracking-wider text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {b.status || 'BELUM DIVERIFIKASI'}
                        </span>
                      </div>
                      <p className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" strokeWidth={1.75} />
                        <span className="font-medium">{b.lokasi}</span>
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-[11px] font-medium text-slate-500 block">
                        Waktu Kejadian
                      </span>
                      <span className="font-mono text-xs text-slate-800 font-medium tabular-nums">
                        {formatDateTimeID(b.waktu_kejadian)}
                      </span>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700">
                    <span className="font-medium text-slate-500 block mb-0.5">
                      Deskripsi Lapangan:
                    </span>
                    <p className="whitespace-pre-wrap leading-relaxed">{b.deskripsi}</p>
                  </div>

                  {/* Kondisi Korban & Kebutuhan Bantuan */}
                  {(b.kondisi_korban || b.kebutuhan_bantuan) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border border-amber-200 bg-amber-50/70 rounded-md p-2.5">
                      {b.kondisi_korban && (
                        <div>
                          <span className="font-semibold text-amber-900 block">Kondisi Korban:</span>
                          <span className="text-amber-950">{b.kondisi_korban}</span>
                        </div>
                      )}
                      {b.kebutuhan_bantuan && (
                        <div>
                          <span className="font-semibold text-amber-900 block">Kebutuhan Bantuan:</span>
                          <span className="text-amber-950">{b.kebutuhan_bantuan}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info Pelapor & Waktu Laporan */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>
                      Pelapor: <strong className="text-slate-700">{b.nama_pelapor}</strong> ({b.bagian_pos_tugas})
                    </span>
                    <span className="font-mono tabular-nums">
                      Diterima: {formatDateTimeID(b.waktu_laporan)}
                    </span>
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
