import { useEffect, useState, useCallback } from 'react';
import { getAllBencanaDrafts, type BencanaDraft } from '../../lib/offline-storage';

export interface BencanaListItem {
  id: string;
  jenisBencana: string;
  keteranganJenisLainnya?: string;
  lokasi: string;
  koordinatGPS?: { latitude: number; longitude: number };
  waktuKejadian: string;
  namaPelapor: string;
  jobBagian: string;
  deskripsi: string;
  statusKorban: string;
  perkiraanJumlahKorban?: string;
  kebutuhanMendesak?: string;
  createdAt: string;
  syncStatus: string;
}

export function useBencanaList() {
  const [items, setItems] = useState<BencanaListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const drafts: BencanaDraft[] = await getAllBencanaDrafts();
      const mapped: BencanaListItem[] = drafts.map((d) => ({
        id: d.localId,
        jenisBencana: d.data.jenisBencana,
        keteranganJenisLainnya: d.data.keteranganJenisLainnya,
        lokasi: d.data.lokasi,
        koordinatGPS: d.data.koordinatGPS,
        waktuKejadian: d.data.waktuKejadian,
        namaPelapor: d.data.namaPelapor,
        jobBagian: d.data.jobBagian,
        deskripsi: d.data.deskripsi,
        statusKorban: d.data.statusKorban,
        perkiraanJumlahKorban: d.data.perkiraanJumlahKorban,
        kebutuhanMendesak: d.data.kebutuhanMendesak,
        createdAt: d.createdAt,
        syncStatus: d.syncStatus,
      }));

      // Urutan: Kejadian terbaru di atas
      mapped.sort((a, b) => new Date(b.waktuKejadian).getTime() - new Date(a.waktuKejadian).getTime());
      setItems(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan bencana');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { items, isLoading, error, refresh: fetchList };
}
