import type { BencanaType, StatusKorban, KoordinatGPS } from '../../types/bencana';

export interface BencanaFormData {
  jenisBencana: BencanaType | '';
  keteranganJenisLainnya: string;
  lokasi: string;
  koordinatGPS?: KoordinatGPS;
  waktuKejadian: string;
  namaPelapor: string;
  jobBagian: string;
  deskripsi: string;
  statusKorban: StatusKorban;
  perkiraanJumlahKorban: string;
  kebutuhanMendesak: string;
}

export type BencanaFormErrors = Partial<Record<keyof BencanaFormData, string>>;

export function getInitialBencanaFormData(): BencanaFormData {
  const now = new Date();
  // Format YYYY-MM-DDTHH:mm untuk input datetime-local
  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return {
    jenisBencana: '',
    keteranganJenisLainnya: '',
    lokasi: '',
    waktuKejadian: localIso,
    namaPelapor: '',
    jobBagian: '',
    deskripsi: '',
    statusKorban: 'belum_diketahui',
    perkiraanJumlahKorban: '',
    kebutuhanMendesak: '',
  };
}

export function validateBencanaForm(data: BencanaFormData): BencanaFormErrors {
  const errors: BencanaFormErrors = {};

  if (!data.jenisBencana) {
    errors.jenisBencana = 'Jenis bencana wajib dipilih';
  } else if (data.jenisBencana === 'Lainnya' && !data.keteranganJenisLainnya.trim()) {
    errors.keteranganJenisLainnya = 'Keterangan jenis bencana wajib diisi';
  }

  if (!data.lokasi.trim()) {
    errors.lokasi = 'Lokasi kejadian wajib diisi';
  }

  if (!data.waktuKejadian) {
    errors.waktuKejadian = 'Waktu kejadian wajib diisi';
  }

  if (!data.namaPelapor.trim()) {
    errors.namaPelapor = 'Nama pelapor wajib diisi';
  }

  if (!data.jobBagian) {
    errors.jobBagian = 'Bagian / pos tugas wajib dipilih';
  }

  if (!data.deskripsi.trim()) {
    errors.deskripsi = 'Deskripsi singkat kejadian wajib diisi';
  }

  return errors;
}

export function isBencanaFormValid(errors: BencanaFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
