import PuskesmasLogo from './PuskesmasLogo';

interface FooterProps {
  className?: string;
  maxWidth?: 'dashboard' | 'form' | 'default';
}

export default function Footer({
  className = '',
  maxWidth = 'dashboard',
}: FooterProps) {
  const containerClass =
    maxWidth === 'form'
      ? 'max-w-2xl'
      : maxWidth === 'dashboard'
      ? 'max-w-5xl'
      : 'max-w-3xl';

  return (
    <footer
      className={`border-t border-[#0d4f47] bg-[#0A3832] text-slate-200 py-8 sm:py-10 mt-12 shadow-inner ${className}`}
    >
      <div className={`mx-auto px-4 sm:px-6 ${containerClass}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-teal-900/60">
          {/* Identitas Instansi */}
          <div className="flex items-center gap-3.5">
            <PuskesmasLogo
              size="lg"
              textColor="light"
              showText={true}
              title="UPTD PUSKESMAS CIPATUJAH"
              subtitle="Dinas Kesehatan Kabupaten Tasikmalaya"
            />
          </div>

          {/* Info Sistem & Status */}
          <div className="text-left sm:text-right space-y-1">
            <p className="text-xs font-semibold text-white tracking-wide">
              Satu Jendela Layanan & Pemantauan Internal
            </p>
            <p className="text-[11px] text-teal-200/80">
              Jl. Raya Cipatujah, Kec. Cipatujah, Kab. Tasikmalaya, Jawa Barat 46189
            </p>
            <div className="flex items-center sm:justify-end gap-2 pt-1 text-[11px] text-emerald-300 font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistem Aktif & Terlindungi</span>
            </div>
          </div>
        </div>

        {/* Baris Bawah: Hak Cipta & MagangHub */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 text-[11px] text-teal-200/60 text-center sm:text-left">
          <p>© 2026 UPTD Puskesmas Cipatujah. Hak Cipta Dilindungi.</p>
          <p>Pengembangan Terintegrasi • MagangHub Batch 3 Pranata Komputer</p>
        </div>
      </div>
    </footer>
  );
}
