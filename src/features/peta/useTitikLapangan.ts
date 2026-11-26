import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { TitikLapangan } from '../../types/peta';

export function useTitikLapangan() {
  const [points, setPoints] = useState<TitikLapangan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setPoints([]);
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

      setPoints((data as TitikLapangan[]) || []);
    } catch (err) {
      setPoints([]);
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
    isSupabaseConfigured,
    isLoading,
    error,
    refresh: fetchPoints,
  };
}
