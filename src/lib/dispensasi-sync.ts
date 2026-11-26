import { supabase, isSupabaseConfigured } from './supabase';
import {
  getAllDispensasiDrafts,
  getPendingDispensasiDrafts,
  updateDispensasiDraftSync,
  getDispensasiDraft,
  deleteDispensasiDraft,
  clearSyncedDispensasiDrafts,
  purgeLocalUserData,
  type DispensasiDraft,
} from './offline-storage';
import { DISPENSASI_STATUS, type DispensasiStatus } from '../types/dispensasi';

export { deleteDispensasiDraft, clearSyncedDispensasiDrafts, purgeLocalUserData };

export interface MergedDispensasiItem {
  id: string; // remoteId atau localId
  localId?: string;
  remoteId?: string;
  namaPengaju: string;
  jobBagian: string;
  jenisDispensasi: string;
  subJenisShift?: string;
  keteranganIzinLainnya?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  lampiranUrl?: string;
  status: DispensasiStatus;
  alasanPenolakan?: string;
  createdAt: string;
  updatedAt?: string;
  source: 'server' | 'local';
  syncStatus?: string;
}

/**
 * Mengirim satu draft ke Supabase.
 */
export async function syncSingleDraft(draft: DispensasiDraft): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
    return false;
  }

  await updateDispensasiDraftSync(draft.localId, { syncStatus: 'syncing' });

  try {
    const { data: remoteId, error } = await supabase.rpc('submit_dispensasi_draft', {
      p_local_id: draft.localId,
      p_nama_pengaju: draft.data.namaPengaju,
      p_job_bagian: draft.data.jobBagian,
      p_jenis_dispensasi: draft.data.jenisDispensasi,
      p_sub_jenis_shift: draft.data.subJenisShift || null,
      p_keterangan_izin_lainnya: draft.data.keteranganIzinLainnya || null,
      p_tanggal_mulai: draft.data.tanggalMulai,
      p_tanggal_selesai: draft.data.tanggalSelesai,
      p_alasan: draft.data.alasan,
      p_lampiran_url: draft.data.lampiranUrl || null,
      p_created_at: draft.createdAt,
    });

    if (error) {
      throw error;
    }

    await updateDispensasiDraftSync(draft.localId, {
      syncStatus: 'synced',
      remoteId: typeof remoteId === 'string' ? remoteId : undefined,
    });

    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal sinkronisasi';
    await updateDispensasiDraftSync(draft.localId, {
      syncStatus: 'failed',
      syncError: errorMsg,
    });
    return false;
  }
}

/**
 * Menyinkronkan semua draft yang tertunda (pending / failed) ke Supabase.
 */
export async function syncPendingDrafts(): Promise<{ synced: number; failed: number }> {
  if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const pendingDrafts = await getPendingDispensasiDrafts();
  let synced = 0;
  let failed = 0;

  for (const draft of pendingDrafts) {
    const success = await syncSingleDraft(draft);
    if (success) {
      synced++;
    } else {
      failed++;
    }
  }

  return { synced, failed };
}

/**
 * Mengambil daftar pengajuan gabungan (Supabase + draft lokal IndexedDB).
 * Selalu diurutkan berdasarkan tanggalMulai terdekat (paling mendesak).
 */
export async function fetchMergedDispensasiList(): Promise<MergedDispensasiItem[]> {
  const localDrafts = await getAllDispensasiDrafts();
  const resultMap = new Map<string, MergedDispensasiItem>();

  // 1. Jika Supabase terkonfigurasi dan online, ambil dari server
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('dispensasi')
        .select('*')
        .order('tanggal_mulai', { ascending: true });

      if (!error && data) {
        for (const row of data) {
          const itemKey = row.local_id || row.id;
          resultMap.set(itemKey, {
            id: row.id,
            localId: row.local_id || undefined,
            remoteId: row.id,
            namaPengaju: row.nama_pengaju,
            jobBagian: row.job_bagian,
            jenisDispensasi: row.jenis_dispensasi,
            subJenisShift: row.sub_jenis_shift || undefined,
            keteranganIzinLainnya: row.keterangan_izin_lainnya || undefined,
            tanggalMulai: row.tanggal_mulai,
            tanggalSelesai: row.tanggal_selesai,
            alasan: row.alasan,
            lampiranUrl: row.lampiran_url || undefined,
            status: row.status as DispensasiStatus,
            alasanPenolakan: row.alasan_penolakan || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at || row.created_at,
            source: 'server',
            syncStatus: 'synced',
          });
        }
      }
    } catch {
      // Jika jaringan server gagal, lanjut baca lokal
    }
  }

  // 2. Gabungkan dengan draft lokal yang belum ada di server atau status lokal lebih baru
  for (const draft of localDrafts) {
    const itemKey = draft.localId;
    if (!resultMap.has(itemKey)) {
      resultMap.set(itemKey, {
        id: draft.remoteId || draft.localId,
        localId: draft.localId,
        remoteId: draft.remoteId,
        namaPengaju: draft.data.namaPengaju,
        jobBagian: draft.data.jobBagian,
        jenisDispensasi: draft.data.jenisDispensasi,
        subJenisShift: draft.data.subJenisShift,
        keteranganIzinLainnya: draft.data.keteranganIzinLainnya,
        tanggalMulai: draft.data.tanggalMulai,
        tanggalSelesai: draft.data.tanggalSelesai,
        alasan: draft.data.alasan,
        lampiranUrl: draft.data.lampiranUrl || undefined,
        status: draft.data.status,
        alasanPenolakan: draft.data.alasanPenolakan,
        createdAt: draft.createdAt,
        source: 'local',
        syncStatus: draft.syncStatus,
      });
    }
  }

  const items = Array.from(resultMap.values());

  // Urutkan: Paling mendesak dulu (tanggalMulai terdekat)
  items.sort((a, b) => {
    const dateA = new Date(a.tanggalMulai).getTime();
    const dateB = new Date(b.tanggalMulai).getTime();
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return items;
}

/**
 * Update keputusan pada pengajuan (baik di Supabase maupun lokal).
 */
export async function updateDispensasiDecision(
  item: MergedDispensasiItem,
  newStatus: DispensasiStatus,
  alasanPenolakan?: string,
): Promise<void> {
  // 1. Update di Supabase jika server tersedia
  if (isSupabaseConfigured && supabase && item.remoteId && navigator.onLine) {
    const { error } = await supabase
      .from('dispensasi')
      .update({
        status: newStatus,
        alasan_penolakan: alasanPenolakan || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.remoteId);

    if (error) {
      throw error;
    }
  }

  // 2. Update di IndexedDB jika ada draft lokal
  if (item.localId) {
    const draft = await getDispensasiDraft(item.localId);
    if (draft) {
      draft.data.status = newStatus;
      if (alasanPenolakan) {
        draft.data.alasanPenolakan = alasanPenolakan;
      }
      await updateDispensasiDraftSync(item.localId, {
        syncStatus: draft.syncStatus,
      });
    }
  }
}

/**
 * Menghapus pengajuan dispensasi (khusus Kapus dari panel detail).
 */
export async function deleteDispensasi(item: MergedDispensasiItem): Promise<void> {
  if (isSupabaseConfigured && supabase && item.remoteId && navigator.onLine) {
    const { error } = await supabase
      .from('dispensasi')
      .delete()
      .eq('id', item.remoteId);

    if (error) {
      throw error;
    }
  }

  if (item.localId) {
    await deleteDispensasiDraft(item.localId);
  }
}


/**
 * Membatalkan pengajuan dispensasi oleh pengaju sendiri (Alur v3: Status 'Dibatalkan').
 */
export async function cancelDispensasi(
  localId?: string,
  _remoteId?: string,
): Promise<boolean> {
  const newStatus = DISPENSASI_STATUS.DIBATALKAN;

  // 1. Update ke Supabase via RPC terbatas jika localId ada dan online
  if (isSupabaseConfigured && supabase && localId && navigator.onLine) {
    try {
      await supabase.rpc('cancel_my_dispensasi', {
        p_local_id: localId,
      });
    } catch {
      // Tetap lanjut update di IndexedDB lokal
    }
  }

  // 2. Update di IndexedDB lokal
  if (localId) {
    try {
      const draft = await getDispensasiDraft(localId);
      if (draft) {
        draft.data.status = newStatus;
        await updateDispensasiDraftSync(localId, {
          syncStatus: draft.syncStatus,
        });
      }
    } catch (err) {
      console.warn('Gagal membatalkan di lokal:', err);
    }
  }

  return true;
}

/**
 * Mengambil status satu pengajuan aktif (cek status live dari server atau lokal).
 */
export async function fetchSubmissionStatus(
  localId?: string,
  _remoteId?: string,
): Promise<MergedDispensasiItem | null> {
  // Cek server via RPC terbatas jika online dan punya localId
  if (isSupabaseConfigured && supabase && localId && navigator.onLine) {
    try {
      const { data: rows, error } = await supabase.rpc('get_my_dispensasi_status', {
        p_local_id: localId,
      });

      const data = Array.isArray(rows) ? rows[0] : null;
      if (!error && data) {
        return {
          id: data.id,
          localId: data.local_id || undefined,
          remoteId: data.id,
          namaPengaju: data.nama_pengaju,
          jobBagian: data.job_bagian,
          jenisDispensasi: data.jenis_dispensasi,
          subJenisShift: data.sub_jenis_shift || undefined,
          keteranganIzinLainnya: data.keterangan_izin_lainnya || undefined,
          tanggalMulai: data.tanggal_mulai,
          tanggalSelesai: data.tanggal_selesai,
          alasan: data.alasan,
          lampiranUrl: data.lampiran_url || undefined,
          status: data.status as DispensasiStatus,
          alasanPenolakan: data.alasan_penolakan || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at || data.created_at,
          source: 'server',
        };
      }
    } catch {
      // Fallback ke penyimpanan lokal jika jaringan gagal
    }
  }

  // Fallback: baca dari IndexedDB
  if (localId) {
    try {
      const draft = await getDispensasiDraft(localId);
      if (draft) {
        return {
          id: draft.localId,
          localId: draft.localId,
          remoteId: draft.remoteId,
          namaPengaju: draft.data.namaPengaju,
          jobBagian: draft.data.jobBagian,
          jenisDispensasi: draft.data.jenisDispensasi,
          subJenisShift: draft.data.subJenisShift,
          keteranganIzinLainnya: draft.data.keteranganIzinLainnya,
          tanggalMulai: draft.data.tanggalMulai,
          tanggalSelesai: draft.data.tanggalSelesai,
          alasan: draft.data.alasan,
          lampiranUrl: draft.data.lampiranUrl || undefined,
          status: draft.data.status,
          alasanPenolakan: draft.data.alasanPenolakan,
          createdAt: draft.createdAt,
          updatedAt: draft.lastSyncAttempt || draft.createdAt,
          source: 'local',
        };
      }
    } catch {
      // Gagal membaca IndexedDB
    }
  }

  return null;
}
