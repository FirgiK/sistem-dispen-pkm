import fs from 'fs';
import path from 'path';

// ─── 1. GENERATE 100 DUMMY BENCANA ──────────────────────────────
const villages = [
  { name: 'Desa Cipatujah', lat: -7.7452, lng: 108.0125, spots: ['Dusun Cipatujah RT 02/01 (Dekat Muara)', 'Dusun Kalapagenep RW 03', 'Jalan Raya Cipatujah Depan Pasar', 'Dusun Ciandum RT 04'] },
  { name: 'Desa Sindangkerta', lat: -7.7580, lng: 108.0560, spots: ['Kawasan Konservasi Penyu Pantai Sindangkerta', 'Dusun Sindanglaut RT 01/02', 'Dusun Pamotan RW 04', 'Muara Sindangkerta'] },
  { name: 'Desa Ciheras', lat: -7.7710, lng: 108.1120, spots: ['Pesisir Muara Ciheras', 'Dusun Lemburtengah RW 02', 'Dusun Sukasari Ciheras RT 05', 'Jalur Lintas Selatan Ciheras'] },
  { name: 'Desa Cipanas', lat: -7.7120, lng: 108.0280, spots: ['Kompleks Pemandian Cipanas', 'Dusun Cipanas Girang RT 03/01', 'Perbukitan Cipanas Tonggoh', 'Blok Mata Air Panas'] },
  { name: 'Desa Padawaras', lat: -7.6850, lng: 108.0420, spots: ['Tanjakan Padawaras KM 12', 'Dusun Padawaras Kidul RW 01', 'Tebing Pasir Gede', 'Jalan Penghubung Padawaras - Cipanas'] },
  { name: 'Desa Nangelasari', lat: -7.6720, lng: 108.0650, spots: ['Tebing Cisereh Nangelasari', 'Dusun Cisereh Girang RT 02', 'Perbukitan Nangelasari RW 03', 'Blok Pasir Honje'] },
  { name: 'Desa Nagrog', lat: -7.6610, lng: 108.0820, spots: ['Lereng Bukit Pasirpanjang Nagrog', 'Dusun Nagrog Hilir RW 01', 'Jalan Poros Desa Nagrog', 'Tebing Cikadu Nagrog'] },
  { name: 'Desa Sukahurip', lat: -7.6530, lng: 108.0510, spots: ['Wilayah Hutan Rakyat Sukahurip', 'Dusun Sukamaju RW 02', 'Blok Pasir Kiara RT 01', 'Tebing Cikupa'] },
  { name: 'Desa Darawati', lat: -7.6950, lng: 108.0920, spots: ['Lembah Darawati RW 02', 'Dusun Darawati Wetan RT 03', 'Bantaran Sungai Cilangla Darawati', 'Jembatan Gantung Darawati'] },
  { name: 'Desa Toblongan', lat: -7.7380, lng: 108.0790, spots: ['Muara Sungai Toblongan', 'Dusun Toblongan Pesisir RW 01', 'Jalur Tambak Garam Toblongan', 'Jalan Lingkar Toblongan'] },
  { name: 'Desa Cikawungading', lat: -7.6820, lng: 108.1150, spots: ['Dusun Cikawung RW 03', 'Perbukitan Cikawungading Kidul', 'Blok Hutan Pinus', 'Tebing Cikole'] },
  { name: 'Desa Pameutingan', lat: -7.7210, lng: 108.1280, spots: ['Perbukitan Pameutingan RT 01', 'Dusun Pameutingan Laut RW 02', 'Jalur Perkebunan Karet', 'Muara Pameutingan'] },
  { name: 'Desa Bantarkalong', lat: -7.6410, lng: 108.0320, spots: ['Jalur Cipatujah - Karangnunggal KM 8', 'Dusun Karangsari RT 04', 'Tebing Tikungan Bantarkalong', 'Bantaran Sungai Cipatujah Hulu'] }
];

const disasterTypes = [
  { type: 'Tanah Longsor', desk: 'Material tanah dan bebatuan menutupi akses jalan desa akibat hujan deras semalaman.', korban: 'Tidak ada korban jiwa, 2 KK sempat mengungsi sementara', butuh: 'Alat berat / cangkul gotong royong dan bronjong kawat' },
  { type: 'Banjir Luapan Sungai', desk: 'Air sungai meluap menggenangi pemukiman warga setinggi 30 - 60 cm.', korban: '12 KK terdampak genangan, nihil korban luka berat', butuh: 'Perahu karet, obat-obatan gatal, dan posko pemeriksaan kesehatan darurat' },
  { type: 'Pohon Tumbang', desk: 'Pohon trembesi/kelapa tumbang menimpa kabel listrik dan menghalangi badan jalan utama.', korban: 'Nihil korban, akses jalan sempat terputus 2 jam', butuh: 'Chainsaw, penanganan PLN, dan pembersihan ranting jalan' },
  { type: 'Gelombang Pasang & Abrasi', desk: 'Gelombang tinggi pesisir selatan menghantam tanggul penahan dan warung wisata tepi pantai.', korban: '3 warung nelayan rusak ringan, nihil korban jiwa', butuh: 'Pemasangan karung pasir penahan dan imbauan peringatan nelayan' },
  { type: 'Gempa Bumi Terasa', desk: 'Guncangan gempa bumi pesisir selatan Tasikmalaya berdurasi 4 detik, terasa di pemukiman.', korban: 'Dinding 1 rumah warga retak rambut, nihil korban luka', butuh: 'Pemeriksaan struktur bangunan dan penyuluhan kesiapsiagaan' },
  { type: 'Kebakaran Pemukiman', desk: 'Kebakaran rumah panggung kayu akibat korsleting arus pendek listrik.', korban: '1 unit rumah hangus 70%, 1 warga luka bakar ringan telah diobati di PKM', butuh: 'Bantuan sembako darurat, terpal, dan pakaian layak pakai' }
];

const reporters = [
  { name: 'Bidan Elis Susanti, A.Md.Keb', post: 'Bidan Desa Pustu Cipanas' },
  { name: 'Asep Saepuloh, S.Kep', post: 'Perawat Lapangan Desa Ciheras' },
  { name: 'Dedi Kurniawan', post: 'Relawan KSB Cipatujah' },
  { name: 'Bidan Neni Triana, S.Tr.Keb', post: 'Bidan Desa Sindangkerta' },
  { name: 'Iwan Hendrawan, S.Kep', post: 'Perawat Pustu Padawaras' },
  { name: 'Agus Sunarya', post: 'Kepala Dusun Cisereh Nangelasari' },
  { name: 'Heni Rohaeni, A.Md.Keb', post: 'Bidan Desa Sukahurip' },
  { name: 'Ujang Mulyadi', post: 'Ketua RT 02 Ciandum Cipatujah' },
  { name: 'Yayan Sopian, A.Md.Kep', post: 'Perawat Poskesdes Nagrog' },
  { name: 'Rina Marlina, S.Tr.Keb', post: 'Bidan Desa Darawati' }
];

const statusesBencana = [
  'Sedang Ditangani', 'Sedang Ditangani', 'Belum Diverifikasi', 'Terverifikasi',
  'Selesai', 'Selesai', 'Selesai', 'Selesai', 'Ditolak'
];

const reports = [];
const now = Date.now();

for (let i = 1; i <= 100; i++) {
  const v = villages[i % villages.length];
  const spot = v.spots[i % v.spots.length];
  const d = disasterTypes[i % disasterTypes.length];
  const r = reporters[i % reporters.length];
  const status = statusesBencana[i % statusesBencana.length];
  
  const offsetHours = Math.floor((i * 5.8) + (i % 7));
  const eventTime = new Date(now - offsetHours * 3600 * 1000);
  const reportTime = new Date(eventTime.getTime() + 15 * 60 * 1000);
  
  const latVar = ((i % 10) - 5) * 0.0015;
  const lngVar = (((i * 3) % 10) - 5) * 0.0015;

  reports.push({
    id: `SIGAP-2026-${String(i).padStart(4, '0')}`,
    jenis_bencana: d.type,
    lokasi: `${spot}, ${v.name}`,
    latitude: Number((v.lat + latVar).toFixed(6)),
    longitude: Number((v.lng + lngVar).toFixed(6)),
    waktu_kejadian: eventTime.toISOString(),
    waktu_laporan: reportTime.toISOString(),
    nama_pelapor: r.name,
    bagian_pos_tugas: r.post,
    deskripsi: `${d.desk} Terjadi di area ${spot}.`,
    kondisi_korban: d.korban,
    kebutuhan_bantuan: d.butuh,
    status: status
  });
}

fs.mkdirSync('src/data', { recursive: true });
const bencanaFileContent = `import type { SigapBencanaReport } from '../types/bencana';

/**
 * 100 Data Dummy Laporan Bencana Resmi SIGAP di Berbagai Titik Kecamatan Cipatujah
 */
export const DUMMY_SIGAP_BENCANA: SigapBencanaReport[] = ${JSON.stringify(reports, null, 2)};
`;

fs.writeFileSync('src/data/dummy-bencana.ts', bencanaFileContent, 'utf8');
console.log(`[1/3] Successfully generated src/data/dummy-bencana.ts with ${reports.length} reports!`);


// ─── 2. GENERATE 100 DUMMY DISPENSASI ────────────────────────────
const names = [
  'dr. H. Rahmat Hidayat', 'dr. Siti Fatimah', 'Ns. Ahmad Fauzi, S.Kep', 'Bidan Sri Wahyuni, S.Tr.Keb',
  'Asep Kurnia, A.Md.Kep', 'Dewi Lestari, S.Farm., Apt.', 'Bidan Ani Suryani, A.Md.Keb', 'Rian Hidayat, A.Md.AK',
  'Yayan Mulyana, S.Kep', 'Nurul Hasanah, S.Gz', 'Bidan Elis Susanti, A.Md.Keb', 'Dedi Hendrawan, S.Kom',
  'Iis Rosita, S.KM', 'Agus Supriatna, A.Md.Far', 'Bidan Neni Triana, S.Tr.Keb', 'Bambang Irawan, A.Md.Kep',
  'Teti Rohaeti, S.Tr.Keb', 'Mulyadi, A.Md.Kep', 'Rina Marlina, S.Tr.Keb', 'Cecep Hidayat, S.Kep'
];

const jobs = [
  'Pelayanan Medis (Dokter Umum / Gigi)', 'Keperawatan (IGD & Rawat Inap)', 'Keperawatan (Rawat Jalan)',
  'Kebidanan (Poned & VK)', 'Kebidanan (KIA & Posyandu)', 'Laboratorium (Pranata Labkes)',
  'Farmasi & Gudang Obat', 'Administrasi & Tata Usaha', 'Pranata Komputer & Rekam Medis',
  'Promosi Kesehatan (Promkes)', 'Sanitasi Lingkungan (Kesling)', 'Tenaga Gizi Puskesmas',
  'Bidan Desa Pustu Cipanas', 'Perawat Poskesdes Ciheras', 'Bidan Pustu Sindangkerta'
];

const dispensasiTypes = [
  { type: 'Shift Kerja', subtypes: ['shift malam', 'shift sore', 'pengganti petugas cuti'], reasons: ['Melaksanakan dinas shift malam di Ruang Rawat Inap & Poned Puskesmas Cipatujah.', 'Pengganti dinas jaga sore petugas yang sedang cuti melahirkan.', 'Tugas piket shift malam IGD Puskesmas Cipatujah.'] },
  { type: 'Tugas Lapangan', subtypes: [null], reasons: ['Pemeriksaan jentik berkala dan penyuluhan DBD bersama kader Posyandu Ciheras.', 'Pelayanan imunisasi balita dan skrining lansia di Posyandu Melati Sindangkerta.', 'Kunjungan rumah (home care) pasien rawat pasca-stroke di Desa Padawaras.', 'Pendampingan rujukan pasien darurat maternal ke RSUD SMC Singaparna.', 'Pengambilan sampel air bersih dan inspeksi sanitasi lingkungan di Desa Cipanas.'] },
  { type: 'Izin Lainnya', subtypes: [null], reasons: ['Mengikuti Pelatihan Teknis Penanganan Gawat Darurat Maternal di Dinas Kesehatan Kabupaten Tasikmalaya.', 'Rapat Koordinasi ILP (Integrasi Layanan Primer) tingkat puskesmas di Aula Dinkes.', 'Menghadiri undangan kedinasan verifikasi data program kesehatan di Tasikmalaya.'] }
];

const dispensasiStatuses = [
  'Menunggu Persetujuan', 'Menunggu Persetujuan',
  'Sudah Diberikan di Sadasbor', 'Sudah Diberikan di Sadasbor', 'Sudah Diberikan di Sadasbor',
  'Sudah Diberikan di Sadasbor', 'Sudah Diberikan di Sadasbor',
  'Ditolak',
  'Dibatalkan'
];

const sampleAttachments = [
  '/logo-puskesmas.png',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
  null, null, null, null // ~30% ada lampiran, sisanya kosong sesuai instruksi
];

const dummyDispensasiList = [];
const sqlInserts = [];

for (let i = 1; i <= 100; i++) {
  const name = names[i % names.length];
  const job = jobs[i % jobs.length];
  const dt = dispensasiTypes[i % dispensasiTypes.length];
  const sub = dt.subtypes[i % dt.subtypes.length];
  const reason = dt.reasons[i % dt.reasons.length];
  const status = dispensasiStatuses[i % dispensasiStatuses.length];
  const attachment = sampleAttachments[i % sampleAttachments.length];
  
  // Tanggal mulai berkisar dari 20 hari lalu hingga 7 hari ke depan
  const dayOffset = (i % 28) - 20; 
  const startDate = new Date(now + dayOffset * 24 * 3600 * 1000);
  const endDate = new Date(startDate.getTime() + (i % 3 === 0 ? 24 * 3600 * 1000 : 0)); // 1 atau 2 hari
  
  const createdDate = new Date(startDate.getTime() - 24 * 3600 * 1000); // diajukan 1 hari sebelumnya
  const updatedDate = new Date(createdDate.getTime() + 6 * 3600 * 1000);
  
  const fmtDate = (d) => d.toISOString().split('T')[0];
  const rejectionReason = status === 'Ditolak' 
    ? 'Jadwal shift bentrok dengan kegiatan akreditasi puskesmas. Silakan koordinasikan kembali dengan koordinator keperawatan.'
    : null;

  const localId = `disp-dummy-${String(i).padStart(4, '0')}`;

  dummyDispensasiList.push({
    id: `dummy-remote-${String(i).padStart(4, '0')}`,
    localId: localId,
    namaPengaju: name,
    jobBagian: job,
    jenisDispensasi: dt.type,
    subJenisShift: sub || undefined,
    keteranganIzinLainnya: dt.type === 'Izin Lainnya' ? 'Kegiatan Dinas Resmi Dinkes' : undefined,
    tanggalMulai: fmtDate(startDate),
    tanggalSelesai: fmtDate(endDate),
    alasan: reason,
    lampiranUrl: attachment || undefined,
    status: status,
    alasanPenolakan: rejectionReason || undefined,
    createdAt: createdDate.toISOString(),
    updatedAt: updatedDate.toISOString(),
    source: 'server',
    syncStatus: 'synced'
  });

  // SQL format
  const sqlSub = sub ? `'${sub}'` : 'NULL';
  const sqlKet = dt.type === 'Izin Lainnya' ? `'Kegiatan Dinas Resmi Dinkes'` : 'NULL';
  const sqlAttach = attachment ? `'${attachment}'` : 'NULL';
  const sqlRejection = rejectionReason ? `'${rejectionReason}'` : 'NULL';

  sqlInserts.push(
    `('${localId}', '${name}', '${job}', '${dt.type}', ${sqlSub}, ${sqlKet}, '${fmtDate(startDate)}', '${fmtDate(endDate)}', '${reason.replace(/'/g, "''")}', ${sqlAttach}, '${status}', ${sqlRejection}, '${createdDate.toISOString()}', '${updatedDate.toISOString()}')`
  );
}

const dispensasiFileContent = `import type { MergedDispensasiItem } from '../lib/dispensasi-sync';

/**
 * 100 Data Dummy Pengajuan Dispensasi Resmi Puskesmas Cipatujah
 */
export const DUMMY_DISPENSASI_LIST: MergedDispensasiItem[] = ${JSON.stringify(dummyDispensasiList, null, 2)};
`;

fs.writeFileSync('src/data/dummy-dispensasi.ts', dispensasiFileContent, 'utf8');
console.log(`[2/3] Successfully generated src/data/dummy-dispensasi.ts with ${dummyDispensasiList.length} items!`);

// ─── 3. GENERATE SQL SEED FILE ──────────────────────────────────
fs.mkdirSync('supabase', { recursive: true });
const sqlContent = `-- ============================================================
-- SEED DATA: 100 DATA DUMMY PENGAJUAN DISPENSASI UPTD PKM CIPATUJAH
-- Jalankan di SQL Editor Supabase untuk mengisi 100 data simulasi
-- ============================================================

INSERT INTO public.dispensasi (
  local_id, nama_pengaju, job_bagian, jenis_dispensasi, sub_jenis_shift,
  keterangan_izin_lainnya, tanggal_mulai, tanggal_selesai, alasan,
  lampiran_url, status, alasan_penolakan, created_at, updated_at
) VALUES
${sqlInserts.join(',\n')}
ON CONFLICT (local_id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
`;

fs.writeFileSync('supabase/seed_dummy_dispensasi.sql', sqlContent, 'utf8');
console.log(`[3/3] Successfully generated supabase/seed_dummy_dispensasi.sql with ${sqlInserts.length} SQL insert rows!`);
