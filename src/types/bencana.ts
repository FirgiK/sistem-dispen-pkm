export type BencanaType =
  | 'Banjir'
  | 'Tanah Longsor'
  | 'Gempa Bumi'
  | 'Kebakaran'
  | 'Pohon Tumbang'
  | 'Lainnya';

export type StatusKorban = 'tidak_ada' | 'ada' | 'belum_diketahui';

export interface KoordinatGPS {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface BencanaReport {
  id?: string;
  localId: string;
  jenisBencana: BencanaType;
  keteranganJenisLainnya?: string;
  lokasi: string;
  koordinatGPS?: KoordinatGPS;
  waktuKejadian: string; // ISO date-time string
  namaPelapor: string;
  jobBagian: string;
  deskripsi: string;
  statusKorban: StatusKorban;
  perkiraanJumlahKorban?: string;
  kebutuhanMendesak?: string;
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
}
