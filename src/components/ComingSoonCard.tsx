import Card from './Card';

export default function ComingSoonCard() {
  return (
    <Card className="border-dashed border-2 border-slate-300 bg-slate-50/50 text-center py-8">
      <div className="mx-auto max-w-md">
        <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
          Coming Soon
        </span>
        <h3 className="mt-3 text-base font-bold text-slate-800">
          Dashboard Kinerja per Periode
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Visualisasi indikator kinerja dan histori pelayanan puskesmas per periode akan hadir pada fase integrasi data berikutnya.
        </p>
      </div>
    </Card>
  );
}
