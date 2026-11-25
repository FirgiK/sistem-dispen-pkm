/**
 * Tipe data laporan bencana resmi dari API SIGAP Puskesmas Cipatujah
 * Berdasarkan formulir pelaporan bencana resmi (13 field).
 */

export type SigapBencanaStatus =
  | 'Belum Diverifikasi'
  | 'Terverifikasi'
  | 'Sedang Ditangani'
  | 'Selesai'
  | 'Ditolak'
  | string;

export interface SigapBencanaReport {
  /** 1. ID unik laporan (contoh: SIGAP-2026-0001) */
  id: string | number;
  /** 2. Jenis bencana (Banjir, Longsor, Gempa, Kebakaran, Pohon Tumbang, dll) */
  jenis_bencana: string;
  /** 3. Nama desa / wilayah tempat kejadian */
  lokasi: string;
  /** 4. Koordinat lintang lokasi (nullable jika API belum mengirim) */
  latitude: number | null;
  /** 5. Koordinat bujur lokasi (nullable jika API belum mengirim) */
  longitude: number | null;
  /** 6. Waktu bencana terjadi (ISO datetime) */
  waktu_kejadian: string;
  /** 7. Waktu laporan diterima di SIGAP (ISO datetime) */
  waktu_laporan: string;
  /** 8. Nama pelapor */
  nama_pelapor: string;
  /** 9. Bagian / Pos Tugas pelapor (contoh: Bidan, Pustu, dll) */
  bagian_pos_tugas: string;
  /** 10. Deskripsi kejadian di lapangan */
  deskripsi: string;
  /** 11. Kondisi korban terdampak */
  kondisi_korban: string;
  /** 12. Kebutuhan bantuan yang diminta */
  kebutuhan_bantuan: string;
  /** 13. Status penanganan di SIGAP */
  status: SigapBencanaStatus;
}
