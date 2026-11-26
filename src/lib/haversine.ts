import type { SigapBencanaReport } from '../types/bencana';
import type { MapLayerId, TitikLapangan } from '../types/peta';

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Menghitung jarak antara dua koordinat geografis dalam satuan meter
 * menggunakan rumus Haversine mandiri.
 */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export interface PointCluster<T> {
  id: string;
  lat: number;
  lng: number;
  count: number;
  items: T[];
}

export interface DisasterCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  reports: SigapBencanaReport[];
}

export interface FieldPointCluster {
  id: string;
  lapisan: MapLayerId;
  lat: number;
  lng: number;
  count: number;
  points: TitikLapangan[];
}

/**
 * Mengelompokkan item berkoordinat dengan jarak < radiusMeters (default 1.000 m).
 * Saat zoomLevel >= 14, titik dipecah kembali ke koordinat aslinya.
 */
function clusterPointsByDistance<T>(
  items: T[],
  getId: (item: T) => string | number,
  getLat: (item: T) => number | null | undefined,
  getLng: (item: T) => number | null | undefined,
  zoomLevel: number,
  radiusMeters = 1000
): PointCluster<T>[] {
  const validItems = items.filter((item) => {
    const lat = getLat(item);
    const lng = getLng(item);
    return (
      typeof lat === 'number' &&
      Number.isFinite(lat) &&
      typeof lng === 'number' &&
      Number.isFinite(lng)
    );
  });

  if (zoomLevel >= 14) {
    return validItems.map((item) => ({
      id: `single-${getId(item)}`,
      lat: getLat(item) as number,
      lng: getLng(item) as number,
      count: 1,
      items: [item],
    }));
  }

  const clusters: PointCluster<T>[] = [];

  for (const item of validItems) {
    const lat = getLat(item) as number;
    const lng = getLng(item) as number;
    let matchedCluster: PointCluster<T> | null = null;

    for (const cluster of clusters) {
      if (haversineDistanceMeters(cluster.lat, cluster.lng, lat, lng) < radiusMeters) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {
      const nextCount = matchedCluster.count + 1;
      matchedCluster.lat = (matchedCluster.lat * matchedCluster.count + lat) / nextCount;
      matchedCluster.lng = (matchedCluster.lng * matchedCluster.count + lng) / nextCount;
      matchedCluster.count = nextCount;
      matchedCluster.items.push(item);
    } else {
      clusters.push({
        id: `cluster-${getId(item)}`,
        lat,
        lng,
        count: 1,
        items: [item],
      });
    }
  }

  return clusters;
}

/**
 * Mengelompokkan titik bencana dengan jarak < radiusMeters (default 1.000 m / 1 km).
 */
export function clusterDisasterPoints(
  reports: SigapBencanaReport[],
  zoomLevel: number,
  radiusMeters = 1000
): DisasterCluster[] {
  return clusterPointsByDistance(
    reports,
    (r) => r.id,
    (r) => r.latitude,
    (r) => r.longitude,
    zoomLevel,
    radiusMeters
  ).map((c) => ({
    id: c.id,
    lat: c.lat,
    lng: c.lng,
    count: c.count,
    reports: c.items,
  }));
}

/**
 * Mengelompokkan titik lapangan per lapisan dengan jarak < radiusMeters (default 1.000 m).
 */
export function clusterFieldPoints(
  points: TitikLapangan[],
  zoomLevel: number,
  radiusMeters = 1000
): FieldPointCluster[] {
  const byLayer = new Map<MapLayerId, TitikLapangan[]>();

  for (const pt of points) {
    const group = byLayer.get(pt.lapisan) ?? [];
    group.push(pt);
    byLayer.set(pt.lapisan, group);
  }

  const result: FieldPointCluster[] = [];

  for (const [lapisan, layerPoints] of byLayer.entries()) {
    const clusters = clusterPointsByDistance(
      layerPoints,
      (p) => p.id,
      (p) => p.lat,
      (p) => p.lng,
      zoomLevel,
      radiusMeters
    );

    for (const c of clusters) {
      result.push({
        id: `${lapisan}-${c.id}`,
        lapisan,
        lat: c.lat,
        lng: c.lng,
        count: c.count,
        points: c.items,
      });
    }
  }

  return result;
}

/**
 * Menghitung radius lingkaran klaster berdasarkan jumlah titik (sama untuk semua lapisan).
 */
export function getClusterRadius(count: number): number {
  if (count <= 1) return 6;
  if (count <= 4) return 11;
  return Math.min(14 + (count - 4) * 1.5, 22);
}

/**
 * Aturan warna & ukuran titik bencana:
 * 1 laporan = kuning kecil (tanpa hijau).
 * Makin banyak laporan = radius membesar dan warna bergeser ke merah pekat.
 */
export function getDisasterMarkerStyle(count: number): {
  radius: number;
  color: string;
  fillColor: string;
  fillOpacity: number;
} {
  const radius = getClusterRadius(count);
  if (count <= 1) {
    return {
      radius,
      color: '#B45309',
      fillColor: '#F59E0B',
      fillOpacity: 0.7,
    };
  }
  if (count <= 4) {
    return {
      radius,
      color: '#C2410C',
      fillColor: '#EA580C',
      fillOpacity: 0.85,
    };
  }
  return {
    radius,
    color: '#7F1D1D',
    fillColor: '#DC2626',
    fillOpacity: 0.95,
  };
}

/**
 * Aturan ukuran & kepekatan warna untuk klaster 8 lapisan titik lapangan.
 */
export function getFieldClusterStyle(
  count: number,
  layerColor: string,
  matchesVillage: boolean
): {
  radius: number;
  color: string;
  fillColor: string;
  fillOpacity: number;
  weight: number;
} {
  const radius = getClusterRadius(count);
  const baseOpacity = count <= 1 ? 0.55 : count <= 4 ? 0.8 : 0.95;

  return {
    radius,
    color: count >= 5 || matchesVillage ? '#0F172A' : layerColor,
    fillColor: layerColor,
    fillOpacity: matchesVillage ? baseOpacity : 0.2,
    weight: count >= 5 ? 2.5 : matchesVillage ? 2 : 1,
  };
}
