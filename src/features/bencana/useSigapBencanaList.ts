import { useState, useEffect, useCallback } from 'react';
import { fetchSigapBencanaReports, isSigapConfigured } from '../../lib/sigap-api';
import type { SigapBencanaReport } from '../../types/bencana';

export function useSigapBencanaList() {
  const [items, setItems] = useState<SigapBencanaReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const res = await fetchSigapBencanaReports();

    if (res.error) {
      setError(res.error);
      setItems([]);
    } else {
      const sorted = [...res.data].sort((a, b) => {
        const tA = new Date(a.waktu_kejadian || a.waktu_laporan).getTime();
        const tB = new Date(b.waktu_kejadian || b.waktu_laporan).getTime();
        return tB - tA;
      });
      setItems(sorted);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    items,
    isConfigured: isSigapConfigured,
    isLoading,
    error,
    refresh: fetchReports,
  };
}
