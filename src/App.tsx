import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Dynamic Import (Code Splitting): hanya unduh halaman saat dibuka pengguna
const DispensasiFormPage = lazy(() =>
  import('./features/dispensasi/DispensasiFormPage')
);
const DashboardPage = lazy(() =>
  import('./features/dashboard/DashboardPage')
);
const PortalLayananPage = lazy(() =>
  import('./features/portal/PortalLayananPage')
);
const ComingSoonPage = lazy(() =>
  import('./features/portal/ComingSoonPage')
);

function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-slate-500" strokeWidth={1.75} />
        <span className="font-medium">Memuat halaman...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Halaman utama default diarahkan ke /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Portal 6 Grid Layanan Mandiri Petugas */}
          <Route path="/layanan" element={<PortalLayananPage />} />
          <Route path="/portal" element={<Navigate to="/layanan" replace />} />

          {/* Template Halaman Coming Soon untuk layanan yang belum dihubungkan */}
          <Route path="/coming-soon" element={<ComingSoonPage />} />

          {/* Form pengajuan dispensasi — satu link, tanpa login */}
          <Route path="/dispensasi" element={<DispensasiFormPage />} />

          {/* Dashboard Terpadu Puskesmas */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Catch-all: semua rute tidak dikenal otomatis diarahkan ke /dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
