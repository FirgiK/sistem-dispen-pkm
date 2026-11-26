import type { CipatujahVillage, MapLayerConfig } from "../types/peta";

/** Batas koordinat & titik tengah Kecamatan Cipatujah, Kab. Tasikmalaya */
export const CIPATUJAH_MAP_CENTER: [number, number] = [-7.745, 108.015];
export const CIPATUJAH_DEFAULT_ZOOM = 12;
export const CIPATUJAH_MIN_ZOOM = 11;
export const CIPATUJAH_MAX_ZOOM = 17;
export const CIPATUJAH_BOUNDS: [[number, number], [number, number]] = [
  [-7.86, 107.86],
  [-7.62, 108.17],
];

/** 9 Lapisan Data Kesehatan Terpadu Puskesmas Cipatujah */
export const MAP_LAYERS: MapLayerConfig[] = [
  {
    id: "bencana",
    label: "Bencana (Integrasi SIGAP)",
    shortLabel: "Bencana",
    description:
      "Titik kejadian bencana dari API SIGAP dengan klastering radius 1 km.",
    source: "API SIGAP",
    color: "#D97706",
  },
  {
    id: "penyakit_menular",
    label: "Penyakit Menular",
    shortLabel: "Penyakit Menular",
    description: "Sebaran kasus DBD, TB, dan Diare di wilayah kerja.",
    source: "Supabase: titik_lapangan",
    color: "#E11D48",
  },
  {
    id: "posyandu_kia",
    label: "Posyandu & KIA",
    shortLabel: "Posyandu & KIA",
    description: "Titik layanan Posyandu serta Kesehatan Ibu dan Anak.",
    source: "Supabase: titik_lapangan",
    color: "#0284C7",
  },
  {
    id: "imunisasi",
    label: "Imunisasi",
    shortLabel: "Imunisasi",
    description: "Cakupan imunisasi rutin per desa.",
    source: "Supabase: titik_lapangan",
    color: "#0D9488",
  },
  {
    id: "sanitasi",
    label: "Sanitasi Lingkungan",
    shortLabel: "Sanitasi",
    description: "Pemantauan 5 Pilar STBM dan sanitasi desa.",
    source: "Supabase: titik_lapangan",
    color: "#4F46E5",
  },
  {
    id: "penyuluhan",
    label: "Penyuluhan Kesehatan",
    shortLabel: "Penyuluhan",
    description: "Lokasi kegiatan promosi dan penyuluhan kesehatan masyarakat.",
    source: "Supabase: titik_lapangan",
    color: "#7C3AED",
  },
  {
    id: "kesehatan_sekolah",
    label: "Kesehatan Sekolah (CKG/UKS)",
    shortLabel: "Sekolah (UKS)",
    description: "Cek Kesehatan Gratis (CKG) dan pembinaan UKS sekolah.",
    source: "Supabase: titik_lapangan",
    color: "#2563EB",
  },
  {
    id: "ptm_lansia",
    label: "PTM & Lansia",
    shortLabel: "PTM & Lansia",
    description: "Posbindu Penyakit Tidak Menular dan layanan lansia.",
    source: "Supabase: titik_lapangan",
    color: "#9333EA",
  },
  {
    id: "fasilitas_jaringan",
    label: "Fasilitas Jaringan",
    shortLabel: "Faskes Jaringan",
    description: "Pustu, Poskesdes, dan Polindes di Kecamatan Cipatujah.",
    source: "Supabase: titik_lapangan",
    color: "#0F172A",
  },
];

/**
 * Daftar referensi 15 desa di wilayah kerja Puskesmas Cipatujah.
 * Koordinat diambil dari OpenStreetMap (Nominatim) per desa.
 */
export const CIPATUJAH_VILLAGES: CipatujahVillage[] = [
  { id: "bantarkalong", name: "Bantarkalong", lat: -7.66014, lng: 108.07856 },
  { id: "ciandum", name: "Ciandum", lat: -7.73325, lng: 107.99371 },
  { id: "ciheras", name: "Ciheras", lat: -7.73421, lng: 107.96292 },
  { id: "cikawungading", name: "Cikawungading", lat: -7.7703, lng: 108.10138 },
  { id: "cipanas", name: "Cipanas", lat: -7.71723, lng: 107.9677 },
  { id: "cipatujah", name: "Cipatujah", lat: -7.74696, lng: 108.01398 },
  { id: "darawati", name: "Darawati", lat: -7.68216, lng: 108.05086 },
  { id: "kertasari", name: "Kertasari", lat: -7.71759, lng: 108.07672 },
  { id: "nagrog", name: "Nagrog", lat: -7.66089, lng: 108.02598 },
  { id: "nangelasari", name: "Nangelasari", lat: -7.65917, lng: 108.05218 },
  { id: "padawaras", name: "Padawaras", lat: -7.69252, lng: 108.04716 },
  { id: "pameutingan", name: "Pameutingan", lat: -7.67915, lng: 107.9669 },
  { id: "sindangkerta", name: "Sindangkerta", lat: -7.76525, lng: 108.07121 },
  { id: "sukahurip", name: "Sukahurip", lat: -7.6731, lng: 107.98814 },
  { id: "tobongjaya", name: "Tobongjaya", lat: -7.6436, lng: 108.08727 },
];
