import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { AlertCircle, Layers, MapPin, RefreshCw, X } from "lucide-react";
import {
  CIPATUJAH_BOUNDS,
  CIPATUJAH_DEFAULT_ZOOM,
  CIPATUJAH_MAP_CENTER,
  CIPATUJAH_MAX_ZOOM,
  CIPATUJAH_MIN_ZOOM,
  CIPATUJAH_VILLAGES,
  MAP_LAYERS,
} from "../../config/peta";
import {
  clusterDisasterPoints,
  clusterFieldPoints,
  getDisasterMarkerStyle,
  getFieldClusterStyle,
} from "../../lib/haversine";
import type { SigapBencanaReport } from "../../types/bencana";
import type {
  CipatujahVillage,
  MapLayerId,
  TitikLapangan,
} from "../../types/peta";
import { useTitikLapangan } from "./useTitikLapangan";

interface CipatujahMapViewProps {
  sigapReports: SigapBencanaReport[];
  isSigapConfigured: boolean;
}

interface MapControllerProps {
  selectedVillage: CipatujahVillage | null;
  onZoomChange: (zoom: number) => void;
}

function MapController({ selectedVillage, onZoomChange }: MapControllerProps) {
  const map = useMap();

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    if (selectedVillage) {
      map.setView([selectedVillage.lat, selectedVillage.lng], 14, {
        animate: true,
      });
    } else {
      map.setView(CIPATUJAH_MAP_CENTER, CIPATUJAH_DEFAULT_ZOOM, {
        animate: true,
      });
    }
  }, [map, selectedVillage]);

  return null;
}

export default function CipatujahMapView({
  sigapReports,
  isSigapConfigured,
}: CipatujahMapViewProps) {
  const {
    points: fieldPoints,
    isDummyMode,
    isSupabaseConfigured,
    isLoading: isLoadingFieldPoints,
    error: fieldPointsError,
    refresh: refreshFieldPoints,
  } = useTitikLapangan();

  const [activeLayers, setActiveLayers] = useState<Set<MapLayerId>>(
    () => new Set<MapLayerId>(["bencana", "fasilitas_jaringan"]),
  );
  const [selectedVillage, setSelectedVillage] =
    useState<CipatujahVillage | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(CIPATUJAH_DEFAULT_ZOOM);

  function toggleLayer(layerId: MapLayerId) {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  }

  // Hitung jumlah titik per lapisan
  const layerCounts = useMemo(() => {
    const counts: Record<MapLayerId, number> = {
      bencana: isSigapConfigured ? sigapReports.length : 0,
      penyakit_menular: 0,
      posyandu_kia: 0,
      imunisasi: 0,
      sanitasi: 0,
      penyuluhan: 0,
      kesehatan_sekolah: 0,
      ptm_lansia: 0,
      fasilitas_jaringan: 0,
    };

    for (const pt of fieldPoints) {
      if (pt.lapisan in counts) {
        counts[pt.lapisan] += 1;
      }
    }
    return counts;
  }, [fieldPoints, isSigapConfigured, sigapReports.length]);

  // Klaster titik bencana dengan Haversine 1 km
  const disasterClusters = useMemo(() => {
    if (!activeLayers.has("bencana") || !isSigapConfigured) return [];
    return clusterDisasterPoints(sigapReports, zoomLevel, 1000);
  }, [activeLayers, isSigapConfigured, sigapReports, zoomLevel]);

  // Klaster 8 lapisan titik lapangan dengan Haversine 1 km
  const visibleFieldClusters = useMemo(() => {
    const filtered = fieldPoints.filter(
      (pt) => pt.lapisan !== "bencana" && activeLayers.has(pt.lapisan),
    );
    return clusterFieldPoints(filtered, zoomLevel, 1000);
  }, [fieldPoints, activeLayers, zoomLevel]);

  // Rincian titik untuk desa yang sedang dipilih
  const selectedVillageDetails = useMemo(() => {
    if (!selectedVillage) return { disasters: [], fieldItems: [] };
    const needle = selectedVillage.name.toLowerCase();

    const disasters = isSigapConfigured
      ? sigapReports.filter((r) => r.lokasi.toLowerCase().includes(needle))
      : [];

    const fieldItems = fieldPoints.filter(
      (pt) =>
        pt.desa.toLowerCase().includes(needle) && activeLayers.has(pt.lapisan),
    );

    return { disasters, fieldItems };
  }, [
    selectedVillage,
    isSigapConfigured,
    sigapReports,
    fieldPoints,
    activeLayers,
  ]);

  const layerColorMap = useMemo(() => {
    const map = new Map<MapLayerId, string>();
    for (const layer of MAP_LAYERS) {
      map.set(layer.id, layer.color);
    }
    return map;
  }, []);

  return (
    <div className="space-y-4">
      {/* Header Kontrol Peta */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-700" strokeWidth={1.75} />
              <h2 className="text-sm font-semibold text-slate-900">
                Peta Terpadu Kecamatan Cipatujah (9 Lapisan)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Batas wilayah kerja 15 desa • Tile OpenStreetMap • Klaster bencana
              radius <span className="font-mono">1.000 m</span> (zoom{" "}
              <span className="font-mono">≥14</span> pecah)
            </p>
          </div>

          <button
            type="button"
            onClick={refreshFieldPoints}
            disabled={isLoadingFieldPoints || !isSupabaseConfigured}
            className="cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoadingFieldPoints ? "animate-spin" : ""}`}
              strokeWidth={1.75}
            />
            <span>Muat Ulang Lapisan</span>
          </button>
        </div>

        {/* Toggle Filter 9 Lapisan */}
        <div className="pt-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
            Filter Lapisan Data ({activeLayers.size}/9 aktif)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {MAP_LAYERS.map((layer) => {
              const isActive = activeLayers.has(layer.id);
              const count = layerCounts[layer.id];

              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => toggleLayer(layer.id)}
                  title={layer.description}
                  className={`cursor-pointer inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: layer.color }}
                    aria-hidden="true"
                  />
                  <span>{layer.shortLabel}</span>
                  <span
                    className={`font-mono text-[10px] tabular-nums px-1 rounded ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Peringatan Kejujuran Data & Flag Data Simulasi */}
        <div className="mt-3 flex flex-col gap-2 text-[11px] text-slate-600">
          {isDummyMode && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-950">
              <AlertCircle
                className="h-4 w-4 text-amber-700 shrink-0 mt-0.5"
                strokeWidth={1.75}
              />
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-200/80 px-1.5 py-0.5 text-amber-900 mr-1.5">
                  DATA SIMULASI / DUMMY
                </span>
                <span>
                  {isSupabaseConfigured
                    ? "Tabel titik_lapangan di Supabase masih kosong, sehingga 8 lapisan kesehatan menampilkan titik contoh sementara."
                    : "Supabase belum terhubung, sehingga 8 lapisan kesehatan menampilkan titik contoh sementara."}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {!isSigapConfigured && activeLayers.has("bencana") && (
              <span className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-amber-900">
                <AlertCircle
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.75}
                />
                Lapisan Bencana: API SIGAP belum terhubung (0 titik).
              </span>
            )}
            {fieldPointsError && (
              <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-red-700">
                <AlertCircle
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.75}
                />
                {fieldPointsError}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid Peta Utama + Panel Desa */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Kanvas Peta Leaflet */}
        <div className="lg:col-span-3 rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="h-[440px] sm:h-[540px] w-full relative">
            <MapContainer
              center={CIPATUJAH_MAP_CENTER}
              zoom={CIPATUJAH_DEFAULT_ZOOM}
              minZoom={CIPATUJAH_MIN_ZOOM}
              maxZoom={CIPATUJAH_MAX_ZOOM}
              maxBounds={CIPATUJAH_BOUNDS}
              maxBoundsViscosity={0.9}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController
                selectedVillage={selectedVillage}
                onZoomChange={setZoomLevel}
              />

              {/* Marker Acuan 15 Desa */}
              {CIPATUJAH_VILLAGES.map((village) => {
                const isSelected = selectedVillage?.id === village.id;
                return (
                  <CircleMarker
                    key={village.id}
                    center={[village.lat, village.lng]}
                    radius={isSelected ? 7 : 4}
                    pathOptions={{
                      color: isSelected ? "#0F172A" : "#64748B",
                      fillColor: isSelected ? "#0F172A" : "#CBD5E1",
                      fillOpacity: isSelected ? 0.9 : 0.6,
                      weight: isSelected ? 2 : 1,
                    }}
                    eventHandlers={{
                      click: () => setSelectedVillage(village),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -4]}>
                      <span className="text-xs font-medium">
                        Desa {village.name}
                      </span>
                    </Tooltip>
                  </CircleMarker>
                );
              })}

              {/* Lapisan Bencana (Klaster Haversine 1 km, Kuning -> Merah, Tanpa Hijau) */}
              {disasterClusters.map((cluster) => {
                const style = getDisasterMarkerStyle(cluster.count);
                const matchesVillage =
                  !selectedVillage ||
                  cluster.reports.some((r) =>
                    r.lokasi
                      .toLowerCase()
                      .includes(selectedVillage.name.toLowerCase()),
                  );

                return (
                  <CircleMarker
                    key={cluster.id}
                    center={[cluster.lat, cluster.lng]}
                    radius={style.radius}
                    pathOptions={{
                      color: style.color,
                      fillColor: style.fillColor,
                      fillOpacity: matchesVillage ? style.fillOpacity : 0.2,
                      weight: matchesVillage ? 2 : 1,
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-1 min-w-[180px]">
                        <p className="font-semibold text-slate-900">
                          {cluster.count > 1
                            ? `Klaster Bencana (${cluster.count} laporan)`
                            : cluster.reports[0]?.jenis_bencana}
                        </p>
                        {cluster.reports.slice(0, 3).map((rep) => (
                          <div
                            key={rep.id}
                            className="border-t border-slate-200 pt-1"
                          >
                            <p className="font-medium text-slate-800">
                              {rep.lokasi}
                            </p>
                            <p className="font-mono text-[10px] text-slate-500">
                              {rep.status} • {rep.waktu_kejadian}
                            </p>
                          </div>
                        ))}
                        {cluster.count > 3 && (
                          <p className="text-[11px] text-slate-500">
                            +{cluster.count - 3} laporan lain dalam radius 1 km
                          </p>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* 8 Lapisan Titik Lapangan Lainnya (Klaster Haversine 1 km) */}
              {visibleFieldClusters.map((cluster) => {
                const layerColor = layerColorMap.get(cluster.lapisan) || "#334155";
                const matchesVillage =
                  !selectedVillage ||
                  cluster.points.some((pt) =>
                    pt.desa
                      .toLowerCase()
                      .includes(selectedVillage.name.toLowerCase()),
                  );
                const style = getFieldClusterStyle(
                  cluster.count,
                  layerColor,
                  matchesVillage,
                );

                return (
                  <CircleMarker
                    key={cluster.id}
                    center={[cluster.lat, cluster.lng]}
                    radius={style.radius}
                    pathOptions={{
                      color: style.color,
                      fillColor: style.fillColor,
                      fillOpacity: style.fillOpacity,
                      weight: style.weight,
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-1 min-w-[180px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-slate-900">
                            {cluster.count > 1
                              ? `Klaster (${cluster.count} titik)`
                              : cluster.points[0]?.nama_titik}
                          </p>
                          {isDummyMode && (
                            <span className="font-mono text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              SIMULASI
                            </span>
                          )}
                        </div>
                        {cluster.points.slice(0, 3).map((pt: TitikLapangan) => (
                          <div
                            key={pt.id}
                            className="border-t border-slate-200 pt-1"
                          >
                            <p className="font-medium text-slate-800">
                              {pt.nama_titik}
                            </p>
                            <p className="text-slate-600">Desa {pt.desa}</p>
                            <p className="font-mono text-[10px] text-slate-500">
                              {pt.status} • {pt.tanggal}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Sumber: {pt.sumber}
                            </p>
                          </div>
                        ))}
                        {cluster.count > 3 && (
                          <p className="text-[11px] text-slate-500">
                            +{cluster.count - 3} titik lain dalam radius 1 km
                          </p>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Legenda Bawah Peta */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-slate-700">Skala Bencana:</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 border border-amber-700" />
                1 laporan (kuning)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-orange-600 border border-orange-800" />
                2–4 laporan
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-3.5 w-3.5 rounded-full bg-red-600 border border-red-900" />
                5+ laporan (merah pekat)
              </span>
            </div>
            <span className="font-mono tabular-nums text-slate-500">
              Zoom: {zoomLevel}
            </span>
          </div>
        </div>

        {/* Panel Samping: Daftar 15 Desa & Detail Desa Terpilih */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-700" strokeWidth={1.75} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                15 Desa Cipatujah
              </h3>
            </div>
            {selectedVillage && (
              <button
                type="button"
                onClick={() => setSelectedVillage(null)}
                className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900"
              >
                <X className="h-3 w-3" strokeWidth={1.75} />
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1 max-h-56 overflow-y-auto pr-1">
            {CIPATUJAH_VILLAGES.map((village) => {
              const isSelected = selectedVillage?.id === village.id;
              return (
                <button
                  key={village.id}
                  type="button"
                  onClick={() =>
                    setSelectedVillage(isSelected ? null : village)
                  }
                  className={`cursor-pointer text-left rounded px-2.5 py-1.5 text-xs font-medium transition-colors border ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  {village.name}
                </button>
              );
            })}
          </div>

          {/* Panel Detail Desa Terpilih */}
          <div className="border-t border-slate-200 pt-3 mt-auto min-h-[132px]">
            {selectedVillage ? (
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-slate-900">
                  Kondisi Desa {selectedVillage.name}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded border border-slate-200 bg-slate-50 p-2">
                    <span className="text-[11px] text-slate-500 block">
                      Bencana SIGAP
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {selectedVillageDetails.disasters.length}
                    </span>
                  </div>
                  <div className="rounded border border-slate-200 bg-slate-50 p-2">
                    <span className="text-[11px] text-slate-500 block">
                      Titik Lapisan
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {selectedVillageDetails.fieldItems.length}
                    </span>
                  </div>
                </div>
                {selectedVillageDetails.disasters.length === 0 &&
                  selectedVillageDetails.fieldItems.length === 0 && (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Belum ada titik aktif pada lapisan yang dipilih di Desa{" "}
                      {selectedVillage.name}.
                    </p>
                  )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pilih salah satu desa di atas atau klik titik desa pada peta
                untuk menyorot sebaran data wilayah tersebut.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
