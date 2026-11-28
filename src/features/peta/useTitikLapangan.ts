import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { DUMMY_TITIK_LAPANGAN } from '../../config/peta-dummy';
import type { TitikLapangan } from '../../types/peta';

export function useTitikLapangan() {
  const [points, setPoints] = useState<TitikLapangan[]>([]);
  const [isDummyMode, setIsDummyMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setPoints(DUMMY_TITIK_LAPANGAN);
      setIsDummyMode(true);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('titik_lapangan')
        .select('id, lapisan, nama_titik, desa, lat, lng, status, tanggal, sumber, meta')
        .order('tanggal', { ascending: false });

      if (queryError) {
        throw new Error(queryError.message);
      }

      const rows = (data as TitikLapangan[]) || [];
      if (rows.length === 0) {
        setPoints(DUMMY_TITIK_LAPANGAN);
        setIsDummyMode(true);
      } else {
        setPoints(rows);
        setIsDummyMode(false);
      }
    } catch (err) {
      setPoints(DUMMY_TITIK_LAPANGAN);
      setIsDummyMode(true);
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengambil data titik lapangan dari Supabase'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  return {
    points,
    isDummyMode,
    isSupabaseConfigured,
    isLoading,
    error,
    refresh: fetchPoints,
  };
}
