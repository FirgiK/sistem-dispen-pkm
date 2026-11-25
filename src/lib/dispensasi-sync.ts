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
    const payload = {
      local_id: draft.localId,
      nama_pengaju: draft.data.namaPengaju,
      job_bagian: draft.data.jobBagian,
      jenis_dispensasi: draft.data.jenisDispensasi,
      sub_jenis_shift: draft.data.subJenisShift || null,
      keterangan_izin_lainnya: draft.data.keteranganIzinLainnya || null,
      tanggal_mulai: draft.data.tanggalMulai,
      tanggal_selesai: draft.data.tanggalSelesai,
      alasan: draft.data.alasan,
      status: draft.data.status,
      created_at: draft.createdAt,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('dispensasi')
      .upsert(payload, { onConflict: 'local_id' })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    await updateDispensasiDraftSync(draft.localId, {
      syncStatus: 'synced',
      remoteId: data.id,
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
 * Membatalkan pengajuan dispensasi oleh pengaju sendiri (Alur v3: Status 'Dibatalkan').
 */
export async function cancelDispensasi(
  localId?: string,
  remoteId?: string,
): Promise<boolean> {
  const newStatus = DISPENSASI_STATUS.DIBATALKAN;

  // 1. Update ke Supabase jika remoteId ada dan online
  if (isSupabaseConfigured && supabase && remoteId && navigator.onLine) {
    try {
      await supabase
        .from('dispensasi')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', remoteId);
    } catch (err) {
      console.warn('Gagal membatalkan di Supabase:', err);
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
  remoteId?: string,
): Promise<MergedDispensasiItem | null> {
  // Cek server jika online dan punya remoteId atau localId
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      let query = supabase.from('dispensasi').select('*');
      if (remoteId) {
        query = query.eq('id', remoteId);
      } else if (localId) {
        query = query.eq('local_id', localId);
      }

      const { data, error } = await query.single();
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
