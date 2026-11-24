import { Link } from 'react-router-dom';
import { PageLayout, Card } from '../../components';
import DispensasiForm from './DispensasiForm';

/**
 * Halaman Form Pengajuan Dispensasi.
 * Dibuka lewat satu link saja, tanpa login.
 */
export default function DispensasiFormPage() {
  return (
    <PageLayout
      title="Pengajuan Dispensasi"
      subtitle="UPTD Puskesmas Cipatujah"
      headerRight={
        <Link
          to="/kapus"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Dashboard Kapus →
        </Link>
      }
    >
      <Card
        title="Form Pengajuan"
        subtitle="Isi form berikut untuk mengajukan dispensasi. Semua field bertanda (*) wajib diisi."
      >
        <DispensasiForm />
      </Card>
    </PageLayout>
  );
}
