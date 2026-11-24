import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DispensasiFormPage, KapusDashboardPage } from './features/dispensasi';
import { BencanaFormPage } from './features/bencana';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Form pengajuan dispensasi — satu link, tanpa login */}
        <Route path="/dispensasi" element={<DispensasiFormPage />} />

        {/* Form pelaporan bencana — offline-first */}
        <Route path="/bencana" element={<BencanaFormPage />} />

        {/* Dashboard Terpadu Kapus */}
        <Route path="/kapus" element={<KapusDashboardPage />} />
        <Route path="/dashboard" element={<Navigate to="/kapus" replace />} />

        {/* Default route redirect ke /dispensasi */}
        <Route path="/" element={<Navigate to="/dispensasi" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
