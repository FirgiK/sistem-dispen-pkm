export type MapLayerId =
  | 'bencana'
  | 'penyakit_menular'
  | 'posyandu_kia'
  | 'imunisasi'
  | 'sanitasi'
  | 'penyuluhan'
  | 'kesehatan_sekolah'
  | 'ptm_lansia'
  | 'fasilitas_jaringan';

export interface MapLayerConfig {
  id: MapLayerId;
  label: string;
  shortLabel: string;
  description: string;
  source: string;
  color: string;
}

export interface TitikLapangan {
  id: string;
  lapisan: MapLayerId;
  nama_titik: string;
  desa: string;
  lat: number;
  lng: number;
  status: string;
  tanggal: string;
  sumber: string;
  meta: Record<string, unknown>;
}

export interface CipatujahVillage {
  id: string;
  name: string;
  lat: number;
  lng: number;
}
