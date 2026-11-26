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
    ? 'max-w-6xl'
    : isForm
    ? 'max-w-2xl'
    : 'max-w-3xl';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        {/* ─── HEADER RESMI FLAT (TANPA GRADIENT) ─── */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className={`mx-auto px-4 py-3 sm:px-6 ${containerWidth}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {typeof title === 'string' ? (
                    <h1 className="truncate text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
                      {title}
                    </h1>
                  ) : (
                    title
                  )}
                </div>

                {subtitle && (
                  <p className="truncate text-xs text-slate-500 mt-0.5">
                    {subtitle}
                  </p>
                )}

                {headerMeta && <div className="mt-1.5">{headerMeta}</div>}
              </div>

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

      {!hideFooter && <Footer maxWidth={variant} />}
    </div>
  );
}
