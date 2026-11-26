import { CIPATUJAH_VILLAGES, MAP_LAYERS } from '../../config/peta';
import type { SigapBencanaReport } from '../../types/bencana';
import type { MapLayerId, TitikLapangan } from '../../types/peta';

const POINTS_PER_LAYER = 50;

const SIMULATED_DISASTER_TYPES = [
  'Banjir',
  'Tanah Longsor',
  'Pohon Tumbang',
  'Angin Kencang',
  'Kebakaran',
];

const SIMULATED_DISASTER_STATUSES = [
  'Belum Diverifikasi',
  'Terverifikasi',
  'Sedang Ditangani',
  'Selesai',
];

/**
 * Menghasilkan koordinat deterministik di daratan sekitar desa acuan.
 * Offset lintang dibuat >= 0 (ke arah utara/darat) agar desa pesisir tidak jatuh ke laut.
 */
function getSafeInlandCoordinates(
  villageIndex: number,
  pointIndex: number,
): { lat: number; lng: number } {
  const village = CIPATUJAH_VILLAGES[villageIndex % CIPATUJAH_VILLAGES.length];
  const latOffset = ((pointIndex * 7 + villageIndex * 3) % 10) * 0.0007;
  const lngOffset = (((pointIndex * 11 + villageIndex * 5) % 9) - 4) * 0.0008;

  return {
    lat: Number((village.lat + latOffset).toFixed(5)),
    lng: Number((village.lng + lngOffset).toFixed(5)),
  };
}

/**
 * Generator data simulasi UI (50 titik per lapisan x 9 lapisan = 450 titik).
 * Hanya untuk pengujian tampilan peta di mode development.
 */
export function generateSimulatedMapData(): {
  bencana: SigapBencanaReport[];
  fieldPoints: TitikLapangan[];
} {
  const baseDate = '2026-11-25T08:00:00+07:00';

  const bencana: SigapBencanaReport[] = Array.from(
    { length: POINTS_PER_LAYER },
    (_, idx) => {
      const village = CIPATUJAH_VILLAGES[idx % CIPATUJAH_VILLAGES.length];
      const coords = getSafeInlandCoordinates(idx, idx);
      const num = String(idx + 1).padStart(2, '0');
      const jenis =
        SIMULATED_DISASTER_TYPES[idx % SIMULATED_DISASTER_TYPES.length];
      const status =
        SIMULATED_DISASTER_STATUSES[idx % SIMULATED_DISASTER_STATUSES.length];

      return {
        id: `SIM-BENCANA-${num}`,
        jenis_bencana: `[SIMULASI] ${jenis}`,
        lokasi: `Desa ${village.name} (Titik Uji #${num})`,
        latitude: coords.lat,
        longitude: coords.lng,
        waktu_kejadian: baseDate,
        waktu_laporan: baseDate,
        nama_pelapor: `Pelapor Simulasi ${num}`,
        bagian_pos_tugas: 'Uji Peta',
        deskripsi: 'Data simulasi untuk pengujian tampilan klaster peta.',
        kondisi_korban: 'Simulasi',
        kebutuhan_bantuan: 'Simulasi',
        status,
      };
    },
  );

  const nonDisasterLayers = MAP_LAYERS.filter(
    (layer) => layer.id !== 'bencana',
  );

  const fieldPoints: TitikLapangan[] = [];

  nonDisasterLayers.forEach((layer, layerIdx) => {
    for (let idx = 0; idx < POINTS_PER_LAYER; idx += 1) {
      const villageIdx = (idx + layerIdx * 2) % CIPATUJAH_VILLAGES.length;
      const village = CIPATUJAH_VILLAGES[villageIdx];
      const coords = getSafeInlandCoordinates(villageIdx, idx + layerIdx);
      const num = String(idx + 1).padStart(2, '0');

      fieldPoints.push({
        id: `SIM-${layer.id.toUpperCase()}-${num}`,
        lapisan: layer.id as MapLayerId,
        nama_titik: `[SIMULASI] ${layer.shortLabel} #${num}`,
        desa: village.name,
        lat: coords.lat,
        lng: coords.lng,
        status: idx % 3 === 0 ? 'Perlu Pantauan' : 'Aktif',
        tanggal: '2026-11-25',
        sumber: 'Simulasi UI (Lokal)',
        meta: {},
      });
    }
  });

  return { bencana, fieldPoints };
}
