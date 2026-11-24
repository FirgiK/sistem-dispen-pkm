export const DISPENSASI_STATUS = {
  MENUNGGU_KAPUS: 'Menunggu Kapus',
  SUDAH_DIBERIKAN: 'Sudah Diberikan di Sadasbor',
  DITOLAK: 'Ditolak',
  DIBATALKAN: 'Dibatalkan',
} as const;

export type DispensasiStatus = typeof DISPENSASI_STATUS[keyof typeof DISPENSASI_STATUS];

export type ShiftSubtype = 'shift malam' | 'shift sore' | 'pengganti petugas cuti';

export type DispensasiType = 'Shift Kerja' | 'Tugas Lapangan' | 'Izin Lainnya';

export interface DispensasiSubmission {
  id?: string;
  localId?: string; // Unique ID untuk draft lokal & deduplikasi sync
  namaPengaju: string;
  jobBagian: string;
  jenisDispensasi: DispensasiType;
  subJenisShift?: ShiftSubtype;
  keteranganIzinLainnya?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  lampiranUrl?: string;
  status: DispensasiStatus;
  alasanPenolakan?: string;
  createdAt: string;
  updatedAt?: string;
  isOfflineDraft?: boolean;
}
