import type { ReactNode } from 'react';
import Footer from './Footer';

interface PageLayoutProps {
  title?: ReactNode;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  headerMeta?: ReactNode;
  variant?: 'dashboard' | 'form' | 'default';
  hideFooter?: boolean;
}

export default function PageLayout({
  title,
  subtitle,
  children,
  headerRight,
  headerMeta,
  variant = 'dashboard',
  hideFooter = false,
}: PageLayoutProps) {
  const isDashboard = variant === 'dashboard';
  const isForm = variant === 'form';

  const containerWidth = isDashboard
    ? 'max-w-5xl'
    : isForm
    ? 'max-w-2xl'
    : 'max-w-3xl';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <div>
        {/* ─── HEADER TERPADU DENGAN GRADIEN RESMI ─── */}
        <header className="sticky top-0 z-20 bg-gradient-to-r from-[#0F766E] to-[#16A34A] text-white shadow-md border-b border-teal-800/30">
          <div className={`mx-auto px-4 py-3 sm:px-6 ${containerWidth}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {/* Kolom Kiri: Judul / Identitas Brand */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {typeof title === 'string' ? (
                    <h1 className="truncate text-lg sm:text-xl font-extrabold text-white tracking-tight">
                      {title}
                    </h1>
                  ) : (
                    title
                  )}
                </div>

                {subtitle && (
                  <p className="truncate text-xs text-teal-100 font-medium mt-0.5">
                    {subtitle}
                  </p>
                )}

                {/* Baris Meta (Tanggal, Peran, Status Koneksi) */}
                {headerMeta && <div className="mt-1.5">{headerMeta}</div>}
              </div>

              {/* Kolom Kanan: Tombol Aksi */}
              {headerRight && (
                <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
                  {headerRight}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── KONTEN UTAMA ─── */}
        <main className={`mx-auto px-4 py-6 sm:py-8 ${containerWidth}`}>
          {children}
        </main>
      </div>

      {/* ─── FOOTER TERPADU DENGAN LATAR RESMI ─── */}
      {!hideFooter && <Footer maxWidth={variant} />}
    </div>
  );
}
