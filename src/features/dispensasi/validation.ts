import type { DispensasiType, ShiftSubtype } from '../../types/dispensasi';

export interface DispensasiFormData {
  namaPengaju: string;
  jobBagian: string;
  jenisDispensasi: DispensasiType | '';
  subJenisShift: ShiftSubtype | '';
  keteranganIzinLainnya: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
}

export type DispensasiFormErrors = Partial<Record<keyof DispensasiFormData, string>>;

export const INITIAL_FORM_DATA: DispensasiFormData = {
  namaPengaju: '',
  jobBagian: '',
  jenisDispensasi: '',
  subJenisShift: '',
  keteranganIzinLainnya: '',
  tanggalMulai: '',
  tanggalSelesai: '',
  alasan: '',
};

/**
 * Validasi form dispensasi — logika murni, bisa dites tanpa browser.
 * Mengembalikan objek error. Objek kosong = valid.
 */
export function validateDispensasiForm(
  data: DispensasiFormData,
): DispensasiFormErrors {
  const errors: DispensasiFormErrors = {};

  // Nama pengaju
  const nama = data.namaPengaju.trim();
  if (!nama) {
    errors.namaPengaju = 'Nama pengaju wajib diisi';
  } else if (nama.length < 3) {
    errors.namaPengaju = 'Nama minimal 3 karakter';
  }

  // Job / bagian
  if (!data.jobBagian) {
    errors.jobBagian = 'Job / bagian wajib dipilih';
  }

  // Jenis dispensasi
  if (!data.jenisDispensasi) {
    errors.jenisDispensasi = 'Jenis dispensasi wajib dipilih';
  }

  // Sub-jenis shift (wajib jika jenis = Shift Kerja)
  if (data.jenisDispensasi === 'Shift Kerja' && !data.subJenisShift) {
    errors.subJenisShift = 'Sub-jenis shift wajib dipilih';
  }

  // Keterangan izin lainnya (wajib jika jenis = Izin Lainnya)
  if (
    data.jenisDispensasi === 'Izin Lainnya' &&
    !data.keteranganIzinLainnya.trim()
  ) {
    errors.keteranganIzinLainnya = 'Keterangan izin wajib diisi';
  }

  // Tanggal mulai
  if (!data.tanggalMulai) {
    errors.tanggalMulai = 'Tanggal mulai wajib diisi';
  }

  // Tanggal selesai
  if (!data.tanggalSelesai) {
    errors.tanggalSelesai = 'Tanggal selesai wajib diisi';
  }

  // Tanggal selesai >= tanggal mulai
  if (
    data.tanggalMulai &&
    data.tanggalSelesai &&
    data.tanggalSelesai < data.tanggalMulai
  ) {
    errors.tanggalSelesai = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
  }

  // Alasan
  if (!data.alasan.trim()) {
    errors.alasan = 'Alasan wajib diisi';
  }

  return errors;
}

/** Mengecek apakah form valid (tidak ada error). */
export function isFormValid(errors: DispensasiFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
