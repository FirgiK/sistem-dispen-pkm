import PuskesmasLogo from './PuskesmasLogo';

interface FooterProps {
  className?: string;
  maxWidth?: 'dashboard' | 'form' | 'default' | 'full';
}

export default function Footer({
  className = '',
  maxWidth = 'dashboard',
}: FooterProps) {
  const containerClass =
    maxWidth === 'form'
      ? 'max-w-2xl'
      : maxWidth === 'full'
      ? 'max-w-7xl'
      : maxWidth === 'dashboard'
      ? 'max-w-6xl'
      : 'max-w-3xl';

  return (
    <footer
      className={`border-t border-slate-200 bg-white text-slate-600 py-6 sm:py-8 ${className}`}
    >
      <div className={`mx-auto px-4 sm:px-6 ${containerClass}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <PuskesmasLogo
            size="md"
            textColor="dark"
            showText={true}
            title="UPTD PUSKESMAS CIPATUJAH"
            subtitle="Dinas Kesehatan Kabupaten Tasikmalaya"
          />

          <div className="text-left sm:text-right space-y-0.5">
            <p className="text-xs font-semibold text-slate-800">
              Satu Jendela Layanan & Pemantauan Internal
            </p>
            <p className="text-[11px] text-slate-500">
              Jl. Raya Cipatujah, Kec. Cipatujah, Kab. Tasikmalaya, Jawa Barat 46189
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 text-[11px] text-slate-500 text-center sm:text-left">
          <p>© 2026 UPTD Puskesmas Cipatujah. Hak Cipta Dilindungi.</p>
          <p>MagangHub Batch 3 — Pranata Komputer</p>
        </div>
      </div>
    </footer>
  );
}
