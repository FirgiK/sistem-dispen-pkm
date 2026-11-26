import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Baby,
  BarChart3,
  Building2,
  ClipboardCheck,
  ExternalLink,
  LayoutDashboard,
  Package,
} from 'lucide-react';
import { PageLayout, PuskesmasLogo } from '../../components';
import { SIGAP_PORTAL_URL } from '../../config/bencana';

interface ServiceGridItem {
  id: string;
  title: string;
  description: string;
  icon: typeof ClipboardCheck;
  status: 'active' | 'pending';
  statusText: string;
  href: string;
  isExternal?: boolean;
}

const serviceList: ServiceGridItem[] = [
  {
    id: 'dispensasi',
    title: 'Pengajuan Dispensasi',
    description:
      'Pengajuan izin shift kerja malam/sore, dinas luar, tugas lapangan, dan pengganti cuti.',
    icon: ClipboardCheck,
    status: 'active',
    statusText: 'AKTIF',
    href: '/dispensasi',
  },
  {
    id: 'sigap',
    title: 'Pelaporan Bencana (SIGAP)',
    description:
      'Portal resmi pelaporan kejadian bencana dan respon tanggap darurat bencana di wilayah kerja.',
    icon: AlertTriangle,
    status: 'active',
    statusText: 'AKTIF',
    href: SIGAP_PORTAL_URL,
    isExternal: true,
  },
  {
    id: 'ekir',
    title: 'Inventaris Ruangan (e-KIR)',
    description:
      'Pencatatan dan kartu inventaris barang ruangan di lingkungan UPTD Puskesmas Cipatujah.',
    icon: Package,
    status: 'pending',
    statusText: 'TAHAP INTEGRASI',
    href: '/coming-soon?app=e-KIR',
  },
  {
    id: 'simadu',
    title: 'Layanan Posyandu (SIMADU)',
    description:
      'Aplikasi pendataan dan pelayanan posyandu serta pemantauan kesehatan ibu dan anak.',
    icon: Baby,
    status: 'pending',
    statusText: 'TAHAP INTEGRASI',
    href: '/coming-soon?app=SIMADU',
  },
  {
    id: 'kinerja',
    title: 'Laporan Kinerja Periode',
    description:
      'Dashboard rekapitulasi capaian indikator pelayanan kesehatan dan pelaporan puskesmas.',
    icon: BarChart3,
    status: 'pending',
    statusText: 'TAHAP INTEGRASI',
    href: '/coming-soon?app=Laporan%20Kinerja',
  },
  {
    id: 'lainnya',
    title: 'Layanan Mandiri Lainnya',
    description:
      'Integrasi sistem administrasi umum dan pelayanan pendukung kesehatan tambahan.',
    icon: Building2,
    status: 'pending',
    statusText: 'TAHAP INTEGRASI',
    href: '/coming-soon?app=Layanan%20Lainnya',
  },
];

export default function PortalLayananPage() {
  return (
    <PageLayout
      variant="dashboard"
      title={
        <PuskesmasLogo
          size="md"
          textColor="dark"
          showText={true}
          title="UPTD PUSKESMAS CIPATUJAH"
          subtitle="Portal Layanan Mandiri Petugas"
        />
      }
      headerRight={
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Dashboard Pimpinan</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Ringkasan Portal */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
            Satu Pintu Layanan Petugas
          </p>
          <h1 className="mt-1 text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            Pusat Pelaporan & Aplikasi Pelayanan
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Pilih layanan di bawah ini untuk memulai pengajuan tugas atau pelaporan data.
            Sistem bertanda <span className="font-mono text-xs font-semibold text-amber-800">TAHAP INTEGRASI</span> tetap berjalan di masing-masing aplikasi.
          </p>
        </div>

        {/* 6 Grid Layanan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceList.map((service) => {
            const Icon = service.icon;
            const isActive = service.status === 'active';

            const cardContent = (
              <div
                className={`h-full flex flex-col justify-between rounded-lg border p-5 transition-colors ${
                  isActive
                    ? 'border-slate-200 bg-white hover:border-slate-400'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <span
                      className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {service.statusText}
                    </span>
                  </div>

                  <h2 className="font-semibold text-sm sm:text-base text-slate-900">
                    {service.title}
                  </h2>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                  <span className={isActive ? 'text-slate-900' : 'text-slate-500'}>
                    {isActive
                      ? service.isExternal
                        ? 'Buka Portal SIGAP'
                        : 'Buka Formulir'
                      : 'Cek Status Integrasi'}
                  </span>
                  {service.isExternal ? (
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
                  )}
                </div>
              </div>
            );

            return service.isExternal ? (
              <a
                key={service.id}
                href={service.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full focus:outline-none"
              >
                {cardContent}
              </a>
            ) : (
              <Link
                key={service.id}
                to={service.href}
                className="block h-full focus:outline-none"
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
