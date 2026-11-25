import { Link } from "react-router-dom";
import { PageLayout, PuskesmasLogo } from "../../components";
import { SIGAP_PORTAL_URL } from "../../config/bencana";

interface ServiceGridItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: "active" | "pending";
  statusText: string;
  href: string;
  isExternal?: boolean;
}

const serviceList: ServiceGridItem[] = [
  {
    id: "dispensasi",
    title: "Pengajuan Dispensasi",
    description:
      "Pengajuan izin shift kerja malam/sore, dinas luar, tugas lapangan, dan pengganti cuti.",
    icon: "📋",
    status: "active",
    statusText: "Aktif",
    href: "/dispensasi",
  },
  {
    id: "sigap",
    title: "Pelaporan Bencana (SIGAP)",
    description:
      "Portal resmi pelaporan kejadian bencana dan respon tanggap darurat bencana di wilayah kerja.",
    icon: "🚨",
    status: "active",
    statusText: "Aktif",
    href: SIGAP_PORTAL_URL,
    isExternal: true,
  },
  {
    id: "ekir",
    title: "Inventaris Ruangan (e-KIR)",
    description:
      "Pencatatan dan kartu inventaris barang ruangan di lingkungan UPTD Puskesmas Cipatujah.",
    icon: "📦",
    status: "pending",
    statusText: "Belum Aktif",
    href: "/coming-soon?app=e-KIR",
  },
  {
    id: "simadu",
    title: "Layanan Posyandu (SIMADU)",
    description:
      "Aplikasi pendataan dan pelayanan posyandu serta pemantauan kesehatan ibu dan anak.",
    icon: "👶",
    status: "pending",
    statusText: "Belum Aktif",
    href: "/coming-soon?app=SIMADU",
  },
  {
    id: "kinerja",
    title: "Laporan Kinerja Periode",
    description:
      "Dashboard rekapitulasi capaian indikator pelayanan kesehatan dan pelaporan puskesmas.",
    icon: "📊",
    status: "pending",
    statusText: "Belum Aktif",
    href: "/coming-soon?app=Laporan%20Kinerja",
  },
  {
    id: "lainnya",
    title: "Layanan Mandiri Lainnya",
    description:
      "Integrasi sistem administrasi umum dan pelayanan pendukung kesehatan tambahan.",
    icon: "🏥",
    status: "pending",
    statusText: "Belum Aktif",
    href: "/coming-soon?app=Layanan%20Lainnya",
  },
];

export default function PortalLayananPage() {
  return (
    <PageLayout
      variant="dashboard"
      title={
        <PuskesmasLogo
          size="md"
          textColor="light"
          showText={true}
          title="UPTD PUSKESMAS CIPATUJAH"
          subtitle="Portal Layanan Mandiri Petugas"
        />
      }
      headerRight={
        <Link
          to="/dashboard"
          className="rounded-lg bg-white/20 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors flex items-center gap-1.5 backdrop-blur-xs"
        >
          <span>📊</span>
          <span>Buka Dashboard Pimpinan</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Banner Selamat Datang */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            <span>Satu Pintu Layanan Petugas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pusat Pelaporan & Aplikasi Pelayanan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Pilih layanan atau aplikasi di bawah ini untuk memulai pengajuan
            tugas atau pelaporan data. Sistem yang bertanda{" "}
            <span className="font-semibold text-amber-700">"Belum Aktif"</span>{" "}
            sedang dalam tahap integrasi bertahap.
          </p>
        </div>

        {/* 6 Grid Layanan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {serviceList.map((service) => {
            const isActive = service.status === "active";

            const cardContent = (
              <div
                className={`h-full flex flex-col justify-between rounded-2xl border bg-white p-5 transition-all ${
                  isActive
                    ? "border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-500 hover:-translate-y-0.5"
                    : "border-slate-200/70 bg-slate-50/50 hover:border-amber-400 hover:bg-white hover:shadow-sm"
                }`}
              >
                <div>
                  {/* Baris Atas: Ikon & Badge Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-100/80 inline-block">
                      {service.icon}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {service.statusText}
                    </span>
                  </div>

                  {/* Judul & Deskripsi */}
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Tombol Aksi di Bawah */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span
                    className={
                      isActive ? "text-teal-700 font-bold" : "text-slate-500"
                    }
                  >
                    {isActive
                      ? service.isExternal
                        ? "Buka Portal SIGAP"
                        : "Buka Formulir"
                      : "Cek Status Integrasi"}
                  </span>
                </div>
              </div>
            );

            return service.isExternal ? (
              <a
                key={service.id}
                href={service.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full cursor-pointer focus:outline-none"
              >
                {cardContent}
              </a>
            ) : (
              <Link
                key={service.id}
                to={service.href}
                className="group block h-full cursor-pointer focus:outline-none"
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
