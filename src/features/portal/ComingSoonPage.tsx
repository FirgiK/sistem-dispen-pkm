import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { PageLayout, PuskesmasLogo } from '../../components';

export default function ComingSoonPage() {
  const [searchParams] = useSearchParams();
  const appName = searchParams.get('app') || 'Layanan Internal';

  return (
    <PageLayout
      variant="dashboard"
      title={
        <PuskesmasLogo
          size="md"
          textColor="dark"
          showText={true}
          title="UPTD PUSKESMAS CIPATUJAH"
          subtitle="Status Integrasi Sistem"
        />
      }
      headerRight={
        <Link
          to="/layanan"
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Kembali ke Portal</span>
        </Link>
      }
    >
      <div className="max-w-xl mx-auto py-4 sm:py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 mb-4">
            <Clock className="h-5 w-5" strokeWidth={1.75} />
          </div>

          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-800 mb-3">
            TAHAP INTEGRASI
          </span>

          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            Layanan {appName} Belum Dihubungkan
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Aplikasi ini tetap berjalan secara terpisah dan akan dihubungkan
            secara bertahap tanpa mengganggu operasional sistem yang sudah ada.
          </p>

          <div className="mt-6 p-4 rounded-md bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800">Catatan Sistem:</p>
            <p>Data saat ini masih diinput langsung pada aplikasi masing-masing.</p>
            <p>Tidak ada data palsu / dummy yang dimuat di halaman ini.</p>
            <p>Tim Pranata Komputer sedang mempersiapkan integrasi data lokal.</p>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to="/layanan"
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Kembali ke Portal Layanan</span>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
