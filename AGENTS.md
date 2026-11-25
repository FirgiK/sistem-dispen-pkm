MULAI INSTRUKSI UNTUK AGEN
============================================================

------------------------------------------------------------
2. SIAPA KAMU DAN CARA KERJAMU DI PROYEK INI
------------------------------------------------------------

Kamu adalah agen coding untuk proyek magang ini.
Pemilik proyek: peserta MagangHub Batch 3, jurusan
Informatika, penempatan Pranata Komputer di
UPTD Puskesmas Cipatujah, Kabupaten Tasikmalaya.

Bahasa:
- Penjelasan, rencana, dan laporan ke pemilik: Bahasa
  Indonesia, singkat, jelas, bisa dibaca di HP.
- Kode, nama variabel/fungsi/file, dan komentar kode:
  Bahasa Inggris.
- Teks antarmuka (UI) untuk petugas: Bahasa Indonesia.

Cara kerja wajib:
1. DEBAT DULU, BANGUN KEMUDIAN. Untuk fitur baru,
   perubahan arsitektur, pilihan database, atau
   perubahan alur pengguna: sampaikan rencana,
   2-3 opsi beserta trade-off-nya, risiko, dan satu
   rekomendasi. Tunggu keputusan pemilik sebelum
   menulis kode. Pengecualian: perbaikan kecil /
   bugfix pada kode yang sudah ada.
2. SATU PERTANYAAN SEKALIGU. Kalau butuh fakta untuk
   memutuskan, tanya satu hal paling penting dulu,
   jangan daftar pertanyaan panjang.
3. JANGAN MENGARANG KEPUTUSAN YANG BELUM DIKUNCI.
   Bagian yang ditandai BELUM DIKUNCI / DRAF di file
   ini belum final. Usulkan, jangan bangun seolah
   sudah final, dan jangan tulis di UI sebagai fakta.
4. AKUI YANG BELUM KAMU CEK. Kalau belum membaca
   file / belum menjalankan perintah, katakan itu.
   Jangan mengklaim "sudah bisa" tanpa bukti hasil
   run / build / test.
5. LANGKAH KECIL DAN BISA DICEK. Kerjakan per potong
   kecil, jelaskan file apa yang diubah dan kenapa,
   lalu cara memverifikasinya.

------------------------------------------------------------
3. PROYEK APA INI
------------------------------------------------------------

Nama kerja: Dashboard Puskesmas Cipatujah.
Ini adalah proyek akhir / last project magang.

Masalah inti yang mau diselesaikan:
Petugas puskesmas menginput data ke banyak aplikasi
berbeda, dan data itu langsung terkirim ke pusat /
Dinas Kabupaten. Akibatnya puskesmas sendiri TIDAK
punya database lokal untuk melihat datanya sendiri,
tidak punya histori pelayanan, dan tidak punya alat
bantu keputusan berbasis data sendiri.

Model dashboard yang disepakati:
- Dashboard adalah SATU PINTU / SATU JENDELA, bukan
  aplikasi pengganti semua aplikasi yang sudah ada.
- Aplikasi lama seperti SIMADU (posyandu, AppSheet)
  dan e-KIR (barang / inventaris ruangan) tetap
  berjalan sendiri. Dashboard tidak menggantikannya.
- Fitur yang dibangun di dalam dashboard sejak awal
  (dispensasi) memang hidup di dalam dashboard.
- Target besar: integrasi dan visualisasi data lokal
  agar petugas tidak selalu input manual berulang.

Pengguna utama:
- Petugas puskesmas: mengisi form pengajuan /
  laporan dari HP, kadang di zona luar jaringan /
  sinyal lemah.
- Kepala Puskesmas (Kapus): melihat dashboard,
  memeriksa pengajuan, memberi keputusan / memantau
  laporan masuk.
- BUKAN untuk pasien. BUKAN untuk publik umum.

------------------------------------------------------------
4. DUA FITUR UTAMA + COMING SOON
------------------------------------------------------------

FITUR 1 - DISPENSASI (sudah dirancang, lihat Bagian 6)
FITUR 2 - PELAPORAN BENCANA (fokus saat ini,
         sebagian BELUM DIKUNCI, lihat Bagian 7)

COMING SOON (hanya kartu / menu placeholder di UI,
JANGAN dibangun fungsinya sekarang):
- Dashboard kinerja per periode.
Tampilkan sebagai kartu "Coming Soon" saja: judul,
satu kalimat deskripsi, tanpa halaman, tanpa query
database, tanpa form, tanpa data palsu / dummy yang
terlihat seperti data asli.

Fitur lain di luar tiga di atas: jangan ditambahkan
sendiri. Usulkan dulu ke pemilik.

------------------------------------------------------------
5. TEKNOLOGI
------------------------------------------------------------

SUDAH DIPUTUSKAN:
- Database utama: Supabase (PostgreSQL).
  Keputusan Fase 5 dispensasi, 22 Nov 2026.
- Form dan dashboard adalah aplikasi web sendiri
  (bukan Google Form, bukan AppSheet).
- Prinsip biaya: tekan biaya, pakai tier gratis /
  alat yang sudah ada dulu. Jangan mengusulkan
  layanan berbayar tanpa menyebut biayanya dan
  meminta persetujuan.
- Tanpa Docker untuk pengembangan lokal. Alasan:
  laptop kedua pemilik RAM 4 GB, Docker terlalu
  berat di mesin itu.

REKOMENDASI STACK (belum dikunci sebagai keputusan
final - jangan mengganti tanpa debat dulu):
- Vite + React untuk frontend.
- Supabase client (@supabase/supabase-js) untuk
  akses database.
- IndexedDB di browser untuk draft offline.
- Hosting statis gratis: Vercel atau Netlify.
Kalau repo yang dibuka ternyata sudah memakai stack
lain, IKUTI stack yang sudah ada di repo itu.
Jangan menulis ulang proyek hanya demi mengganti
framework.

LINGKUNGAN KERJA:
- Laptop 1 (utama membangun dispensasi): Windows.
- Laptop 2: Lenovo, Linux Mint, RAM 4 GB, prosesor
  Celeron. Node dikelola dengan nvm.
  Versi yang tercatat pemilik: Node v26.13.1.
  npm yang menyertainya pernah tercatat 11.20.0,
  dan di layar pemilik juga pernah tampil npm
  v12.2.3 saat "nvm use node". Karena itu JANGAN
  mengandalkan ingatan versi: selalu cek dengan
  "node --version" dan "npm --version" di mesin
  yang sedang dipakai sebelum memberi saran upgrade.
  Node/npm versi itu sudah cukup untuk Vite.
  Jangan menyuruh "npm install -g npm@latest"
  sebagai langkah rutin.
- Kode disinkronkan antar-laptop lewat GitHub
  (git clone / pull / push), bukan copy folder
  node_modules.
- Jaringan laptop Mint tidak stabil (WiFi putus-
  nyambung). Saran yang butuh download besar harus
  menyebut risiko putus dan opsi tethering HP.

FILE YANG TIDAK BOLEH MASUK GIT:
- node_modules/   (selalu ada di .gitignore)
- .env dan .env.* kecuali .env.example
  (.env berisi URL dan key Supabase = rahasia)
- file build (dist/), log, dan file OS/editor.
Kalau .gitignore belum ada / belum lengkap,
perbaiki itu dulu sebelum commit pertama.
Buat .env.example yang hanya berisi NAMA variabel
(contoh: VITE_SUPABASE_URL=, VITE_SUPABASE_ANON_KEY=)
tanpa nilai asli apa pun.

CATATAN SUPABASE:
Per 22 Nov 2026 belum ada proyek Supabase live
(belum ada URL / key). Jadi:
- Jangan mengarang URL, key, nama tabel final, atau
  kredensial Supabase.
- Kalau .env belum ada, katakan proyek Supabase-nya
  perlu dibuat dulu, dan kerjakan bagian yang tidak
  butuh koneksi live (struktur UI, validasi form,
  penyimpanan draft lokal) tanpa data palsu yang
  diklaim sebagai data asli.

------------------------------------------------------------
6. FITUR 1 - DISPENSASI (KEPUTUSAN SUDAH DIKUNCI)
------------------------------------------------------------

Jangan mengubah keputusan di bagian ini tanpa
meminta persetujuan pemilik terlebih dulu.

Alur yang benar (v3):
1. Petugas mengisi Form Pengajuan SENDIRI lewat
   satu link, tanpa login.
2. Pengajuan masuk ke Dashboard Kapus.
3. Kapus memeriksa: nama, job/bagian, alasan,
   jenis dan tanggal mulai dispensasi.
4. Kapus memberikan dispensasi di Sadasbor SECARA
   TERPISAH, di luar sistem ini (manual oleh Kapus).
5. Kapus menandai di dashboard ini salah satu:
   - "Sudah Diberikan di Sadasbor", atau
   - "Ditolak" (alasan penolakan WAJIB diisi).
6. Pengaju bisa membatalkan pengajuannya sendiri:
   status "Dibatalkan".

Status yang boleh ada (hanya empat ini):
- Menunggu Kapus
- Sudah Diberikan di Sadasbor
- Ditolak
- Dibatalkan
TIDAK ada status / tahap admin. TIDAK ada peran
admin dalam alur ini.

Jenis dispensasi:
- Shift Kerja, dengan sub-jenis:
  shift malam, shift sore, pengganti petugas cuti.
- Tugas Lapangan.
- Izin Lainnya (keterangan custom WAJIB diisi).

Field form pengajuan:
- Nama pengaju (wajib)
- Job / bagian (wajib) - satu field ini saja yang
  menjawab "bagian mana".
- Jenis + sub-jenis dispensasi (wajib)
- Tanggal mulai dan tanggal selesai / durasi (wajib)
- Alasan (wajib)
- Bukti / lampiran: TIDAK wajib.
TIDAK ada field klaster di form. Klaster ILP
(1 Manajemen, 2 Ibu dan Anak, 3 Usia Dewasa dan
Lansia, 4 Penanggulangan Penyakit Menular,
5 Lintas Klaster) hanya referensi umum organisasi,
bukan isian form. Alasan klaster dibuang: job sudah
cukup, dan pemetaan klaster-job itu many-to-many
sehingga ambigu dan butuh tabel pemetaan yang
harus dirawat terus.
Daftar job final Cipatujah BELUM dikonfirmasi.
Jangan mengunci daftar job hasil karanganmu.
Pakai daftar sementara yang mudah diubah dari satu
file konfigurasi / data master, dan tandai jelas
sebagai daftar sementara.

Login dan identitas:
- TANPA login sama sekali. Login Google DIBATALKAN:
  akun Google siapa pun bisa mengisi form, jadi
  login itu tidak membuktikan identitas pengaju.
- TANPA ID pegawai. Field itu juga dibatalkan:
  belum jelas ID-nya ada / berbentuk apa, dan
  nama + job + alasan sudah cukup jelas.
- Form dibuka lewat satu link saja.

Jalur yang DILARANG dibangun kembali:
- Jalur personal ke Kapus dalam bentuk apa pun:
  chat WhatsApp, lisan, telepon sebagai jalur
  pengajuan resmi. Itu sudah dipangkas total di v3.
- Tab / fitur "Catat Kapus" atau pencatatan manual
  oleh orang lain atas nama pengaju.
- Integrasi API Sadasbor. Belum tentu API-nya bisa
  didapat. Sistem ini hanya mencatat KAPAN Kapus
  menandai sudah diberikan, bukan data dari Sadasbor.
  Sadasbor adalah aplikasi presensi Pemkab
  Tasikmalaya berbasis lokasi (geofencing).

Offline (Fase 3, sudah diputuskan: opsi A):
- Form harus bisa diisi saat tidak ada sinyal.
- Draft tersimpan lokal di perangkat (IndexedDB),
  lalu OTOMATIS terkirim saat sinyal kembali.
- Tampilkan status draft dengan jujur: masih lokal /
  sedang mengirim / sudah terkirim. Jangan tampilkan
  draft lokal seolah sudah diterima server.

Dashboard Kapus (Fase 4, sudah diputuskan: opsi B):
- Urutan daftar: yang paling mendesak dulu,
  berdasarkan tanggal mulai dispensasi terdekat.
- Filter yang tersedia: status (empat status di
  atas), tanggal, dan jenis dispensasi.
- Uji coba Fase 7: hanya pemilik + Kapus (opsi A).
- Siapa yang mengelola sistem setelah magang
  selesai (Fase 8): DITUNDA, jangan diputuskan
  dan jangan dibangun fitur serah-terima sekarang.

Ditunda, JANGAN dibangun sekarang:
- Dispensasi shift otomatis dari catatan mentor
  (catatan harian bagian keperawatan yang semi
  real-time). Kompleks dan secara eksplisit ditunda.

Penyimpanan data:
- Data utama ada di database aplikasi (Supabase).
- Google Sheet (jika ada) hanya untuk laporan /
  ekspor, BUKAN database utama.

------------------------------------------------------------
7. FITUR 2 - PELAPORAN BENCANA (FOKUS SAAT INI)
------------------------------------------------------------

Tujuan: laporan bencana bisa dibuat dengan cepat
di lapangan, lalu terlihat di dashboard supaya
bisa dipantau. Dashboard bencana adalah halaman
untuk MELIHAT laporan yang masuk: waktu, lokasi,
dan statusnya.

Prinsip "instan tanpa internet" - katakan dengan
jujur, jangan menjanjikan yang tidak mungkin:
- Jika benar-benar tidak ada sinyal apa pun,
  laporan TIDAK bisa sampai ke server saat itu juga.
  Tidak ada teknologi di proyek ini yang mengubah itu.
- Yang dibangun adalah OFFLINE-FIRST: form bisa
  diisi penuh tanpa internet, laporan tersimpan
  lokal lengkap dengan waktu kejadian dan lokasi,
  lalu otomatis terkirim saat sinyal kembali.
- Bagi pelapor, mengisi laporan tidak boleh menunggu
  sinyal. Bagi dashboard, laporan yang baru masuk
  setelah tertunda harus tetap menampilkan WAKTU
  KEJADIAN asli, bukan hanya waktu sampainya.
- Bedakan dan tampilkan status pengiriman:
  Terkirim, Tertunda (masih offline), dan jika
  nanti disetujui pemilik, Via SMS.
- Jalur SMS dan radio mesh / LoRa adalah USULAN
  fase berikutnya, BUKAN bagian yang sudah disetujui.
  Jangan membangunnya dan jangan membelikan /
  menyarankan pembelian alat tanpa persetujuan.

YANG BELUM DIKUNCI (tanya / usulkan dulu, jangan
dibangun sebagai keputusan final):
- Daftar field final laporan bencana.
- Daftar jenis pelaporan final.
- Apakah setelah laporan muncul di dashboard ada
  TINDAK LANJUT formal, atau hanya pemberitahuan /
  pemantauan saja.
- Siapa yang berhak mengubah status tindak lanjut.

DRAF USULAN field (untuk didiskusikan, bukan final):
- Jenis bencana (pilihan tunggal)
- Lokasi kejadian (teks + titik GPS jika perangkat
  mengizinkan; GPS tidak boleh menghalangi pengiriman
  laporan jika gagal didapat)
- Waktu kejadian (otomatis, bisa dikoreksi pelapor)
- Nama pelapor dan job / bagian
- Deskripsi singkat kejadian (satu hal per field,
  jangan menggabungkan banyak pertanyaan jadi satu)
- Korban: ada / tidak, jumlah perkiraan bila tahu
- Kerusakan: ringkasan singkat bila tahu
- Kebutuhan bantuan yang diminta
- Foto: opsional, jangan wajib (foto besar akan
  gagal terkirim di sinyal lemah; bila ada, kompres
  dan izinkan terkirim menyusul setelah teks sampai)

DRAF USULAN jenis (untuk didiskusikan, bukan final):
banjir, tanah longsor, gempa bumi, kebakaran,
pohon tumbang, lainnya (dengan keterangan wajib).

DRAF USULAN status tindak lanjut (hanya jika pemilik
menyetujui ada tindak lanjut, bukan final):
Baru Masuk, Sudah Dilihat, Sedang Ditangani, Selesai.
Sampai pemilik memutuskan, bangun dulu sisi yang
pasti: form offline-first + daftar laporan masuk
dengan waktu, lokasi, dan status pengiriman.

Aturan form bencana (dari prinsip desain form):
- Sesingkat mungkin. Di situasi bencana, setiap
  field tambahan menurunkan peluang laporan selesai.
- Field wajib hanya yang membuat laporan bisa
  ditindaklanjuti: jenis, lokasi, waktu, pelapor,
  deskripsi singkat. Sisanya opsional.
- Satu pertanyaan untuk satu hal. Wording netral.
- Pilihan tunggal untuk jawaban yang saling lepas
  (jenis bencana), teks bebas hanya bila daftar
  pilihan pasti melewatkan informasi penting.
- Uji alurnya dengan jawaban tidak lengkap dan
  tanpa sinyal sebelum menyatakan form selesai.

------------------------------------------------------------
8. STRUKTUR PROYEK YANG DIHARAPKAN
------------------------------------------------------------

Ikuti struktur yang sudah ada di repo bila repo
sudah berjalan. Untuk repo baru, pakai pola ini
dan sesuaikan dengan stack yang dipilih:

  src/
    components/   Komponen UI kecil, satu tanggung
                  jawab per komponen.
    features/
      dispensasi/ Kode khusus dispensasi: form,
                  dashboard Kapus, status, validasi.
      bencana/    Kode khusus bencana: form laporan,
                  daftar laporan, status pengiriman.
    lib/          Client Supabase, penyimpanan draft
                  offline (IndexedDB), util bersama.
    config/       Daftar pilihan yang sering berubah
                  (jenis dispensasi, daftar job
                  sementara, jenis bencana draf) -
                  satu tempat, jangan disebar hardcode.
  public/
  .env.example
  .gitignore
  package.json
  AGENTS.md       File aturan ini.
  GEMINI.md       Satu baris menunjuk ke AGENTS.md.

Aturan struktur:
- Fitur dispensasi dan bencana tidak saling mengimpor
  secara berputar (circular). Kode bersama naik ke
  lib/ atau components/.
- Konstanta status HARUS satu sumber kebenaran.
  Contoh nama konstanta: DISPENSASI_STATUS,
  dengan nilai persis teks status di Bagian 6.
  Jangan mengetik ulang string status di banyak file.
- Jangan membuat file raksasa yang mencampur form,
  tabel, query database, dan styling sekaligus.

------------------------------------------------------------
9. ATURAN PENULISAN KODE DAN CLEAN CODE
------------------------------------------------------------

Umum:
- Satu fungsi / komponen = satu tanggung jawab.
  Kalau sebuah fungsi butuh komentar "dan juga..."
  untuk menjelaskan tugas keduanya, pecah jadi dua.
- Nama itu dokumentasi pertama. Pakai nama lengkap
  dan bisa dicari: submitDispensasiForm,
  pendingOfflineReports. Hindari singkatan samar
  (data2, tmp, handleStuff, x).
- Standar Penamaan Universal (Clean Code):
  Gunakan istilah standar industri internasional dan W3C/HTML5
  resmi untuk penamaan komponen dan file (contoh: gunakan
  `Dialog` bukan `Modal` kustom, `Select`, `Button`, `Input`).
  Jangan menciptakan istilah ciptaan sendiri yang menyulitkan
  perawatan kode oleh pengembang lain.
- Konfirmasi Sebelum Eksekusi Aksi Kritis:
  Setiap tindakan destruktif, pembatalan pengajuan, atau reset
  formulir WAJIB menyertakan dialog konfirmasi (jangan klik
  langsung eksekusi tanpa kepastian dari pengguna).
- Jangan mengulang (DRY) untuk logika, tapi jangan
  membuat abstraksi sebelum pola yang sama muncul
  minimal dua kali dan benar-benar sama.
- Hapus kode mati, impor tak terpakai, console.log
  sisa debugging, dan blok kode yang dikomentari.
  Riwayat ada di git, bukan di dalam file.
- Komentar hanya untuk alasan yang tidak terlihat
  dari kode (kenapa, bukan apa). Kode yang baik
  menjelaskan "apa" lewat namanya sendiri.
- Fungsi pendek dan bisa dites. Logika murni
  (validasi, urutan urgensi, format tanggal) dipisah
  dari UI dan dari panggilan jaringan, supaya bisa
  dites tanpa membuka browser.

TypeScript / JavaScript (bila stack React dipilih):
- Utamakan TypeScript. Hindari "any" kecuali ada
  alasan tertulis; definisikan tipe / interface
  untuk bentuk data dispensasi dan laporan bencana.
- Jangan mengubah (mutate) state secara langsung.
  Buat objek / array baru.
- Tangani semua keadaan async secara eksplisit:
  loading, sukses, error, dan kosong (empty state).
  Tidak ada janji (Promise) yang dibiarkan tanpa
  penanganan error.
- Validasi di dua tempat dengan peran berbeda:
  di form untuk pengalaman pengguna, dan di sisi
  database / server (constraint / RLS Supabase)
  untuk keamanan. Validasi UI saja tidak cukup.

React (bila dipakai):
- Komponen presentasi tidak memanggil Supabase
  langsung. Panggilan data lewat fungsi di lib/
  atau hook khusus fitur (contoh: useDispensasiList).
- Jangan menaruh logika bisnis di dalam JSX.
  Hitung dulu di atas return, tampilkan hasilnya.
- Daftar yang dirender memakai key stabil dari id
  data, bukan indeks array.
- Form memakai label yang terhubung ke input-nya,
  pesan error di dekat field yang salah, dan
  tombol submit yang nonaktif saat sedang mengirim
  (cegah kirim ganda).

Styling dan UI:
- Mobile-first. Pengguna utama membuka dari HP.
  Uji tampilan sempit dulu, baru layar lebar.
- Konsisten: satu sistem spasi, warna status yang
  sama maknanya di semua halaman (contoh: status
  menunggu selalu warna yang sama).
- Status tidak boleh hanya dibedakan oleh warna:
  selalu ada teks statusnya (aksesibilitas).
- Jangan memakai data contoh yang terlihat seperti
  data petugas / pasien asli di screenshot / demo.
- Identitas & Logo Puskesmas:
  Selalu gunakan komponen PuskesmasLogo (src/components/PuskesmasLogo.tsx)
  yang membaca file resmi lokal "/logo-puskesmas.png".
  Jangan menempelkan logo dari URL eksternal (agar offline-ready).
  Di halaman form publik, gunakan Opsi A (identitas instansi dan logo
  terintegrasi di pucuk kartu formulir dalam satu garis pandang vertikal,
  tanpa banner tebal yang terputus).
  Di halaman dashboard, tampilkan logo berdampingan dengan judul di header.
  Sertakan komponen Footer resmi (src/components/Footer.tsx) di bagian bawah.

Keamanan dan privasi:
- Tidak ada secret, key privat, atau kredensial di
  kode, di commit, atau di file aturan. Key Supabase
  yang boleh ada di frontend hanya anon key, dan
  itu pun lewat variabel .env, bukan hardcode.
- Data nama petugas dan laporan bencana adalah data
  internal. Jangan mengirimnya ke layanan pihak
  ketiga mana pun di luar Supabase / hosting yang
  disetujui, dan jangan mencatatnya (log) berlebihan.
- Asumsikan link form bisa tersebar: jangan tampilkan
  daftar pengajuan / laporan orang lain di halaman
  form publik. Halaman daftar dan dashboard adalah
  tampilan terpisah dari form pengisian.
- Aktifkan / rancang Row Level Security (RLS)
  Supabase sejak awal bila tabel dibuat; jangan
  menunda dengan alasan "nanti saja" tanpa mencatat
  risikonya ke pemilik.

Penanganan error dan offline:
- Setiap kegagalan jaringan harus menghasilkan
  pesan yang bisa dimengerti petugas (Bahasa
  Indonesia), bukan pesan error mentah dari library.
- Operasi offline tidak boleh menghilangkan data:
  draft yang gagal terkirim tetap tersimpan dan
  bisa dicoba lagi, bukan terhapus.
- Cegah duplikat: pengiriman ulang draft yang sama
  tidak boleh membuat dua pengajuan / laporan
  identik di database (pakai id lokal unik per draft).

Git:
- Commit kecil, satu tujuan per commit, pesan commit
  dalam Bahasa Inggris yang menjelaskan kenapa.
  Contoh pola: feat(dispensasi): ..., fix(bencana): ...
- Jangan commit .env, node_modules, dist, atau
  file hasil generate yang tidak perlu.
- Jangan force-push dan jangan menulis ulang
  riwayat cabang bersama tanpa persetujuan pemilik.

------------------------------------------------------------
10. PERINTAH TERMINAL - ATURAN VERIFIKASI
------------------------------------------------------------

Aturan ini mencegah kesalahan yang sudah pernah
terjadi di proyek ini (npm install dijalankan di
folder tanpa package.json):

1. Sebelum menyuruh / menjalankan perintah yang
   bergantung pada sebuah file atau folder, CEK
   dulu keberadaannya dengan satu perintah diagnostik
   dan baca hasilnya. Contoh urutan yang benar:
     ls -la
   lalu, hanya jika package.json benar-benar ada
   di folder itu, baru:
     npm install
2. "npm install" hanya valid di folder yang berisi
   package.json. Error ENOENT / "Could not read
   package.json" artinya foldernya salah atau
   proyeknya memang belum dibuat (belum di-scaffold),
   BUKAN artinya npm rusak. Jangan mengulang perintah
   yang sama; periksa isi foldernya dulu.
   Tiga kemungkinan dari hasil "ls -la":
   a. Folder kosong: proyek belum ada. Debat dulu
      cara scaffold-nya, jangan scaffold diam-diam.
   b. Ada subfolder proyek: masuk ke subfolder itu
      (cd <nama-subfolder>) lalu cek package.json lagi.
   c. package.json ada: baru jalankan npm install.
3. Jangan memakai wildcard buta untuk nama file
   yang diunduh / diinstal (contoh berbahaya:
   code_*.deb). Selalu "ls" dulu, pakai nama file
   persis yang terlihat, dan curigai nama yang mirip
   tapi beda produk.
4. Beri perintah sebagai teks copy-paste persis,
   satu langkah dalam satu blok, tanpa nilai yang
   harus diketik ulang dari ingatan (pemilik pernah
   salah ketik alamat IP karena harus mengetik ulang).
   Jelaskan output yang diharapkan dan apa yang
   harus dilaporkan bila outputnya berbeda.
5. Perintah gagal = bukti baru, bukan alasan mengulang
   perintah yang sama. Ubah satu hal saja per percobaan.
6. Perintah standar proyek ini (di folder yang sudah
   terverifikasi berisi package.json):
     git clone <url-repo>      Mengambil repo pertama kali
     npm install               Memasang semua dependency
                               dari package.json +
                               package-lock.json (Vite,
                               React, dll. ikut terpasang
                               dari sini, tidak perlu
                               instal satu per satu)
     npm run dev               Menjalankan server lokal
     npm run dev -- --host     Sama, tapi bisa dibuka
                               dari HP di jaringan yang sama
                               untuk tes tanpa deploy
   Setelah clone: .env TIDAK ikut dari GitHub.
   Pemilik harus menyalin / membuat .env secara
   manual di mesin baru dari .env.example.
   node_modules juga tidak ikut; itulah gunanya
   npm install setelah clone.

------------------------------------------------------------
11. SKILL YANG RELEVAN UNTUK AGEN INI
------------------------------------------------------------

Maksud "skill" di sini ada dua lapis. Keduanya
dimasukkan supaya agen tidak salah paham.

A. SKILL LOKAL PEMILIK (di lingkungan Muse pemilik,
   BUKAN file yang otomatis ada di Antigravity):
   Isinya sudah diringkas menjadi aturan di file ini,
   jadi agen Antigravity cukup mengikuti ringkasannya:
   1. debate_before_building
      Ringkasan: Bagian 2 aturan 1 di file ini.
      Debat arsitektur dulu (opsi, trade-off, risiko,
      rekomendasi), tunggu keputusan, baru bangun.
   2. verify_terminal_commands
      Ringkasan: Bagian 10 di file ini.
      Cek path / nama file / versi dulu, satu langkah
      copy-paste, pulihkan dari error dengan bukti.
   3. form-design (skill sistem form_design)
      Ringkasan: dipakai di Bagian 6 dan 7.
      Satu field untuk satu hal, wajib hanya bila
      tujuan tidak jalan tanpanya, pilihan tunggal
      untuk jawaban saling lepas, uji alur dengan
      jawaban tidak lengkap sebelum selesai.

B. SKILL FORMAT ANTIGRAVITY (yang bisa benar-benar
   dipasang di repo ini):
   Antigravity membaca skill dari:
     .agents/skills/<nama-skill>/SKILL.md
   Formatnya standar terbuka Agent Skills: folder
   per skill, file SKILL.md wajib, diawali frontmatter
   YAML berisi name (huruf kecil, tanda hubung) dan
   description (WAJIB - satu-dua kalimat, orang ketiga,
   menyebut KAPAN skill dipakai; inilah sinyal yang
   dipakai agen untuk memutuskan memuat skill itu).
   Subfolder opsional: scripts/, examples/, resources/.
   Skill dimuat bertahap (progressive disclosure):
   awalnya hanya nama + deskripsi, isi penuh dibaca
   saat tugasnya cocok.
   Sumber: https://antigravity.google/docs/skills?authuser=7&hl=vi

   Tiga skill di bawah ini SIAP DISALIN ke repo.
   Buat folder dan file persis seperti tertulis.
   Jangan memasang skill acak dari internet tanpa
   membaca isinya dan persetujuan pemilik.

--- SALIN 1: .agents/skills/debate-before-building/SKILL.md
---
name: debate-before-building
description: Challenges a build, prototype, flow, or
  architecture choice with options, trade-offs, and
  risks, then waits for the owner's decision before
  any code is written. Use when a new feature, data
  store, or user flow is requested.
---
# Debate Before Building
1. Name the requested approach in one line.
2. Offer 2-3 options with trade-offs: who does the
   work, where data lives, what breaks first.
3. Name the risks (double work, fragile store,
   stale data, no audit trail).
4. Recommend one option and say why it fits.
5. Wait for the owner's pick. Build only that pick.
Pengecualian: small fixes to existing code.

--- SALIN 2: .agents/skills/verify-terminal-commands/SKILL.md
---
name: verify-terminal-commands
description: Verifies a path, exact filename, and
  version before giving or running a terminal command.
  Use for installs, clones, scaffolding, and any
  command that depends on a file existing.
---
# Verify Terminal Commands
1. Run one diagnostic first (example: ls -la) and
   read its output before acting on it.
2. Never assume a filename, version, or folder name.
3. Give one exact copy-paste step at a time and
   state the expected output.
4. A failed command is new evidence: change one
   thing, never repeat the same command blindly.
5. Label any unverified part of a command as a guess.

--- SALIN 3: .agents/skills/form-design-check/SKILL.md
---
name: form-design-check
description: Checks a form's questions, required
  fields, and respondent path before it is built or
  changed. Use when creating or editing the
  dispensasi form or the disaster report form.
---
# Form Design Check
1. One question per field, neutral wording.
2. Required only when the purpose fails without it.
3. Single choice for mutually exclusive answers,
   free text only when a list would miss real cases.
4. Easy questions first; group related fields.
5. Test with an incomplete answer and, for this
   project, with no network connection.

------------------------------------------------------------
12. BATASAN KERAS (JANGAN DILANGGAR)
------------------------------------------------------------

- Jangan pakai Docker untuk dev lokal proyek ini.
- Jangan ganti database utama dari Supabase, dan
  jangan jadikan Google Sheet sebagai database utama.
- Jangan bangun login (termasuk login Google) dan
  jangan tambahkan field ID pegawai.
- Jangan pakai Google Form untuk form dispensasi
  atau form bencana.
- Jangan bangun integrasi API Sadasbor.
- Jangan tambahkan peran / alur / status admin
  di dispensasi.
- Jangan kembalikan jalur pengajuan personal ke
  Kapus (chat / lisan / telepon) sebagai fitur.
- Jangan tambahkan field klaster ke form dispensasi.
- Jangan bangun fungsi Dashboard Kinerja per Periode;
  kartu Coming Soon saja.
- Jangan bangun dispensasi shift otomatis dari
  catatan mentor (ditunda).
- Jangan bangun jalur SMS / LoRa / satelit tanpa
  persetujuan pemilik (baru usulan fase berikutnya).
- Jangan mengarang: URL/key Supabase, daftar job
  final, field bencana final, atau data contoh yang
  terlihat seperti data asli.
- Jangan menyimpan secret apa pun di repo / aturan.
- Jangan menghapus data / draft pengguna sebagai
  cara memperbaiki error sync.
- Jangan mengambil keputusan Fase 8 (pengelola
  setelah magang) atas nama pemilik.

------------------------------------------------------------
13. DEFINISI SELESAI DAN CHECKLIST LAPORAN
------------------------------------------------------------

Sebuah tugas baru boleh disebut selesai bila:
[ ] Kode berjalan: perintah run / build yang relevan
    benar-benar dijalankan dan hasilnya dilaporkan
    (bukan hanya "seharusnya bisa").
[ ] Alur utama dites, termasuk satu alur gagal:
    form tidak lengkap, dan untuk fitur offline,
    pengiriman saat tidak ada jaringan lalu saat
    jaringan kembali.
[ ] Tidak ada secret, .env, atau node_modules
    yang ikut ter-commit.
[ ] Tidak ada kode mati / console.log sisa.
[ ] Keputusan yang DIKUNCI di file ini tidak berubah.
[ ] Hal BELUM DIKUNCI tidak disajikan sebagai final.

Format laporan ke pemilik (Bahasa Indonesia, singkat):
- Yang dikerjakan: ...
- File yang diubah / dibuat: ...
- Yang sudah diverifikasi dan hasilnya: ...
- Yang belum dikerjakan / belum bisa diverifikasi: ...
- Keputusan yang kubutuhkan darimu: ... (bila ada,
  satu saja yang paling penting)

------------------------------------------------------------
14. TUGAS PERTAMA YANG AMAN UNTUK AGEN
------------------------------------------------------------

Jangan langsung membangun fitur. Tugas pertama agen
setelah membaca file ini:
1. Ringkas pemahamanmu tentang proyek ini dalam
   maksimal 10 poin (fitur, teknologi, batasan).
2. Sebutkan mana keputusan yang sudah dikunci dan
   mana yang belum dikunci, menurut file ini.
3. Periksa repo saat ini: apakah package.json ada,
   stack apa yang sudah terpasang, apakah .gitignore
   sudah mencakup node_modules dan .env, apakah
   .env.example ada. Laporkan hasil pemeriksaan
   file-nya, jangan menebak dari nama folder.
4. Usulkan rencana langkah berikutnya dalam potongan
   kecil, dan TUNGGU keputusan pemilik sebelum
   menulis kode apa pun.

============================================================
SELESAI INSTRUKSI UNTUK AGEN
