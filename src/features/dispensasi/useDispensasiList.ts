import { useEffect, useState, useCallback } from 'react';
import {
  fetchMergedDispensasiList,
  updateDispensasiDecision,
  syncPendingDrafts,
  type MergedDispensasiItem,
} from '../../lib/dispensasi-sync';
import { getPendingDispensasiDrafts } from '../../lib/offline-storage';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { DispensasiStatus } from '../../types/dispensasi';

export function useDispensasiList() {
  const [items, setItems] = useState<MergedDispensasiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingDraftsCount, setPendingDraftsCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const checkPendingDrafts = useCallback(async () => {
    try {
      const drafts = await getPendingDispensasiDrafts();
      setPendingDraftsCount(drafts.length);
    } catch {
      setPendingDraftsCount(0);
    }
  }, []);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMergedDispensasiList();
      setItems(data);
      await checkPendingDrafts();
      if (isSupabaseConfigured && navigator.onLine) {
        setLastSyncTime(new Date());
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat daftar pengajuan',
      );
    } finally {
      setIsLoading(false);
    }
  }, [checkPendingDrafts]);

  const triggerSync = useCallback(async () => {
    if (!isSupabaseConfigured || !navigator.onLine) return;
    setIsSyncing(true);
    try {
      await syncPendingDrafts();
      await fetchList();
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, [fetchList]);

  const giveDecision = useCallback(
    async (
      item: MergedDispensasiItem,
      newStatus: DispensasiStatus,
      alasanPenolakan?: string,
    ) => {
      await updateDispensasiDecision(item, newStatus, alasanPenolakan);
      await fetchList();
    },
    [fetchList],
  );

  // Monitor status online / offline
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      triggerSync();
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    items,
    isLoading,
    isSyncing,
    error,
    isOnline,
    isConfigured: isSupabaseConfigured,
    pendingDraftsCount,
    lastSyncTime,
    refresh: fetchList,
    triggerSync,
    giveDecision,
  };
}
