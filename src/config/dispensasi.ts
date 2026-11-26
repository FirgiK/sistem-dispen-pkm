import { DISPENSASI_STATUS, type DispensasiType, type ShiftSubtype } from '../types/dispensasi';

export { DISPENSASI_STATUS };

export const SHIFT_SUBTYPES: readonly ShiftSubtype[] = [
  'shift malam',
  'shift sore',
  'pengganti petugas cuti',
] as const;

export const DISPENSASI_TYPES: readonly {
  type: DispensasiType;
  label: string;
  hasSubtype?: boolean;
  requiresCustomNote?: boolean;
}[] = [
  {
    type: 'Shift Kerja',
    label: 'Shift Kerja',
    hasSubtype: true,
  },
  {
    type: 'Tugas Lapangan',
    label: 'Tugas Lapangan',
  },
  {
    type: 'Izin Lainnya',
    label: 'Izin Lainnya',
    requiresCustomNote: true,
  },
] as const;

/**
 * DAFTAR JOB / BAGIAN SEMENTARA
 * PENTING: Daftar ini BELUM DIKUNCI / belum final dari Puskesmas Cipatujah.
 * Disediakan sebagai referensi sementara yang mudah diubah dari satu tempat.
 */
export const TEMPORARY_JOB_LIST: readonly string[] = [
  'Dokter',
  'Dokter Gigi',
  'Perawat',
  'Bidan',
  'Kesmas',
  'Kesling',
  'ATLM',
  'Gizi',
  'Kefarmasian',
  'Non-Kesehatan',
] as const;
