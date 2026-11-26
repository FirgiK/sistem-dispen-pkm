# Dashboard UPTD Puskesmas Cipatujah

Proyek Sistem Dashboard Terpadu dan Pengajuan Dispensasi Presensi Pegawai di lingkungan **UPTD Puskesmas Cipatujah, Dinas Kesehatan Kabupaten Tasikmalaya**.  
Dikembangkan dalam program **MagangHub Kemnaker Batch 3** — Posisi: *Pranata Komputer*.

---

## 🏥 Latar Belakang Masalah
Petugas puskesmas menginput data pelayanan ke banyak aplikasi berbeda yang langsung terkirim ke sistem pusat/Dinas Kesehatan, sehingga Puskesmas Cipatujah tidak memiliki database lokal sendiri untuk memantau histori pelayanan dan bahan pengambilan keputusan berbasis data.

Dashboard ini hadir sebagai **Satu Pintu / Satu Jendela (Single Window)** untuk integrasi dan visualisasi data lokal puskesmas, bukan menggantikan aplikasi yang sudah berjalan.

---

## 🚀 Fitur Utama

### 1. Pengajuan & Pemantauan Dispensasi (Fitur 1 — Alur v3)
- **Akses Mandiri Tanpa Login**: Petugas mengisi formulir pengajuan dispensasi lewat satu link resmi.
- **Offline-First**: Formulir tetap dapat diisi penuh saat tidak ada sinyal internet. Draft tersimpan lokal di IndexedDB dan otomatis tersinkron ke server saat sinyal kembali.
- **4 Status Resmi**:
  1. `Menunggu Persetujuan`
  2. `Sudah Diberikan di Sadasbor` (manual oleh Kepala Puskesmas di aplikasi Sadasbor)
  3. `Ditolak` (wajib mencantumkan alasan penolakan)
  4. `Dibatalkan` (dapat dibatalkan oleh pengaju sendiri)
- **Pelacakan Pengajuan**: Perangkat pengguna menyimpan status pengajuan aktif. Setelah 12 jam sejak disetujui, memori pelacakan browser dibersihkan secara otomatis (*silent cleanup*) agar HP petugas bebas lag.
- **Dukungan Bukti / Lampiran**: Kompresi otomatis gambar di sisi browser (*HTML5 Canvas client-side*) untuk menghemat kuota penyimpanan.

### 2. Pantauan Bencana Terpadu (Fitur 2 — Integrasi SIGAP)
- Menampilkan data pemantauan kejadian bencana di wilayah kerja Kecamatan Cipatujah (13 desa).
- Terintegrasi dengan sistem resmi **SIGAP Puskesmas Cipatujah**.
- Dilengkapi mode simulasi data titik Cipatujah jika endpoint API belum dihubungkan.

### 3. Portal Layanan Mandiri Petugas
- Halaman satu pintu (`/layanan`) yang mengarahkan petugas ke berbagai aplikasi operasional (Dispensasi, SIGAP, e-KIR, SIMADU, dan Kinerja Puskesmas).

---

## 🛠️ Stack Teknologi & Dependensi

Proyek ini dibangun menggunakan arsitektur modern web application yang dirancang ringan, responsif untuk perangkat mobile petugas (*mobile-first*), mendukung mode luring (*offline-first*), serta memiliki visualisasi data interaktif:

### 1. Dependensi Utama (Production Dependencies)
- **[React 19](https://react.dev/) (`react`, `react-dom`)**: Fondasi antarmuka pengguna berbasis komponen modular, memanfaatkan React Hooks terbaru untuk manajemen status lokal dan reaktivitas data.
- **[Recharts](https://recharts.org/) (`recharts`)**: Pustaka visualisasi grafik deklaratif berbasis SVG responsif. Digunakan pada Fase 2 untuk menampilkan grafik tren harian pengajuan dispensasi pegawai (stacked bar) dan tren sebaran kejadian bencana alam wilayah Cipatujah dengan toggle 7/30 hari serta kesimpulan otomatis.
- **[React Router v7](https://reactrouter.com/) (`react-router-dom`)**: Manajemen routing aplikasi SPA (*Single Page Application*), dipadukan dengan *Route-level code splitting* (`React.lazy`) untuk memastikan ukuran bundle halaman awal tetap kecil dan cepat dimuat.
- **[Supabase JS Client](https://supabase.com/docs/reference/javascript) (`@supabase/supabase-js`)**: Klien SDK resmi untuk komunikasi dengan database PostgreSQL Supabase, autentikasi berbasis Google OAuth & allowlist, penyimpanan bukti/lampiran (*Storage Bucket*), dan Row Level Security (RLS).
- **[idb](https://github.com/jakearchibald/idb) (`idb`)**: Pembungkus (*wrapper*) Promise ringan untuk IndexedDB browser, menjamin pengisian formulir dispensasi tetap berjalan mulus tanpa koneksi internet (*offline draft storage*) dan otomatis tersinkron saat jaringan kembali pulih.
- **[Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`, `tailwindcss`)**: Mesin CSS utility-first generasi terbaru dengan kompilasi instan via Vite plugin untuk menghasilkan antarmuka bersih, konsisten, dan berkecepatan tinggi.
- **[Lucide React](https://lucide.dev/) (`lucide-react`)**: Kumpulan ikon SVG modern dan konsisten untuk indikator visual status, filter, navigasi, dan tombol aksi.

### 2. Dependensi Pengembangan (Development Tools & Tooling)
- **[Vite 8](https://vitejs.dev/) (`vite`, `@vitejs/plugin-react`)**: Toolchain build dan bundler ultra-cepat dengan Hot Module Replacement (HMR) instan dan optimasi vendor chunking mandiri (`vendor-react`, `vendor-recharts`, `vendor-supabase`).
- **[TypeScript 7](https://www.typescriptlang.org/) (`typescript`, `@types/react`, `@types/react-dom`, `@types/node`)**: Pengetikan statis ketat (*strict static typing*) untuk mencegah kesalahan logika saat kompilasi serta memastikan integritas struktur data dispensasi dan laporan bencana.
- **[Oxlint](https://oxc.rs/docs/guide/usage/linter.html) (`oxlint`)**: Linter JavaScript/TypeScript berkecepatan tinggi berbasis Rust untuk menjaga kebersihan kode dan mendeteksi kode mati.
- **[PostCSS Tooling](https://postcss.org/) (`postcss`, `autoprefixer`)**: Pemrosesan CSS dan penambahan vendor prefixing otomatis untuk kompatibilitas peramban mobile.

---

## ⚙️ Panduan Menjalankan Proyek di Lokal

### 1. Prasyarat
- [Node.js](https://nodejs.org/) (versi LTS yang terpasang, misal v20+ atau v24+)
- npm

### 2. Pemasangan Dependensi
Pastikan berada di direktori proyek yang memiliki berkas `package.json`:
```bash
npm install
```

### 3. Konfigurasi Lingkungan (.env)
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel dengan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key-anda>
VITE_SIGAP_API_URL=
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Untuk menguji tampilan langsung dari perangkat HP di jaringan WiFi yang sama:
```bash
npm run dev -- --host
```

### 5. Build Produksi
```bash
npm run build
```
*(Menghasilkan berkas teroptimasi di folder `dist/` dengan vendor chunking dan code splitting).*

---

## 📜 Lisensi & Hak Cipta
Hak cipta proyek magang milik **UPTD Puskesmas Cipatujah, Kabupaten Tasikmalaya**.  
Dikembangkan untuk kepentingan peningkatan mutu pelayanan kesehatan masyarakat.
