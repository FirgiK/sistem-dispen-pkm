import { Link, useSearchParams } from "react-router-dom";
import { PageLayout, PuskesmasLogo } from "../../components";

export default function ComingSoonPage() {
  const [searchParams] = useSearchParams();
  const appName = searchParams.get("app") || "Layanan Internal";

  return (
    <PageLayout
      variant="dashboard"
      title={
        <PuskesmasLogo
          size="md"
          textColor="light"
          showText={true}
          title="UPTD PUSKESMAS CIPATUJAH"
          subtitle="Status Integrasi Sistem"
        />
      }
      headerRight={
        <Link
          to="/layanan"
          className="rounded-lg bg-white/20 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors flex items-center backdrop-blur-xs"
        >
          <span>Kembali ke Portal</span>
        </Link>
      }
    >
      <div className="max-w-xl mx-auto py-6 sm:py-10">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-10 text-center shadow-sm">
          {/* Ikon Status */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl mb-4 border border-amber-200/80">
            ⏳
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/70 border border-amber-300 px-3 py-0.5 text-xs font-bold text-amber-900 mb-3">
            <span>Tahap Integrasi</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Layanan {appName} Belum Dihubungkan
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Aplikasi ini tetap berjalan secara terpisah dan akan dihubungkan
            secara bertahap tanpa mengganggu operasional sistem yang sudah ada.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800">Catatan Sistem:</p>
            <p>
              • Data saat ini masih diinput langsung pada aplikasi
              masing-masing.
            </p>
            <p>• Tidak ada data palsu / dummy yang dimuat di halaman ini.</p>
            <p>
              • Tim Pranata Komputer sedang mempersiapkan integrasi data lokal.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/layanan"
              className="rounded-xl bg-[#0F766E] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0b5852] transition-colors shadow-xs"
            >
              Kembali ke Portal Layanan
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
