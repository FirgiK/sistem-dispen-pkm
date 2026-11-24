import { Link } from 'react-router-dom';
import { PageLayout, Card } from '../../components';
import BencanaForm from './BencanaForm';

export default function BencanaFormPage() {
  return (
    <PageLayout
      title="Pelaporan Bencana"
      subtitle="UPTD Puskesmas Cipatujah"
      headerRight={
        <Link
          to="/dashboard"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Lihat Dashboard →
        </Link>
      }
    >
      <Card
        title="Form Laporan Darurat"
        subtitle="Form ini dirancang offline-first. Laporan akan tersimpan di perangkat dan terkirim ke server secara otomatis saat sinyal kembali."
        className="border-red-100"
      >
        <BencanaForm />
      </Card>
    </PageLayout>
  );
}
