import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DispensasiSubmission } from '../types/dispensasi';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface DispensasiDraft {
  localId: string;
  data: Omit<DispensasiSubmission, 'id' | 'localId' | 'isOfflineDraft'>;
  syncStatus: SyncStatus;
  createdAt: string;
  lastSyncAttempt?: string;
  syncError?: string;
  remoteId?: string;
}

interface DashboardDB extends DBSchema {
  dispensasiDrafts: {
    key: string;
    value: DispensasiDraft;
    indexes: {
      'by-sync-status': SyncStatus;
      'by-created-at': string;
    };
  };
}

const DB_NAME = 'dashboard-puskesmas-cipatujah';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<DashboardDB> | null = null;

async function getDB(): Promise<IDBPDatabase<DashboardDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DashboardDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('dispensasiDrafts')) {
        const dispensasiStore = db.createObjectStore('dispensasiDrafts', {
          keyPath: 'localId',
        });
        dispensasiStore.createIndex('by-sync-status', 'syncStatus');
        dispensasiStore.createIndex('by-created-at', 'createdAt');
      }
    },
  });

  return dbInstance;
}

export function generateLocalId(prefix: 'disp' = 'disp'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Dispensasi Operations ──────────────────────────────────

export async function saveDispensasiDraft(
  data: DispensasiDraft['data'],
): Promise<DispensasiDraft> {
  const db = await getDB();
  const draft: DispensasiDraft = {
    localId: generateLocalId('disp'),
    data,
    syncStatus: 'pending',
    createdAt: new Date().toISOString(),
  };
  await db.put('dispensasiDrafts', draft);
  return draft;
}

export async function getAllDispensasiDrafts(): Promise<DispensasiDraft[]> {
  const db = await getDB();
  return db.getAllFromIndex('dispensasiDrafts', 'by-created-at');
}

export async function getPendingDispensasiDrafts(): Promise<DispensasiDraft[]> {
  const db = await getDB();
  const pending = await db.getAllFromIndex('dispensasiDrafts', 'by-sync-status', 'pending');
  const failed = await db.getAllFromIndex('dispensasiDrafts', 'by-sync-status', 'failed');
  return [...pending, ...failed];
}

export async function getDispensasiDraft(localId: string): Promise<DispensasiDraft | undefined> {
  const db = await getDB();
  return db.get('dispensasiDrafts', localId);
}

export async function updateDispensasiDraftSync(
  localId: string,
  update: { syncStatus: SyncStatus; remoteId?: string; syncError?: string },
): Promise<void> {
  const db = await getDB();
  const draft = await db.get('dispensasiDrafts', localId);
  if (!draft) return;

  const updated: DispensasiDraft = {
    ...draft,
    syncStatus: update.syncStatus,
    lastSyncAttempt: new Date().toISOString(),
    ...(update.remoteId !== undefined && { remoteId: update.remoteId }),
    ...(update.syncError !== undefined && { syncError: update.syncError }),
  };
  await db.put('dispensasiDrafts', updated);
}

/**
 * Menghapus satu draft dispensasi dari IndexedDB browser.
 */
export async function deleteDispensasiDraft(localId: string): Promise<void> {
  const db = await getDB();
  await db.delete('dispensasiDrafts', localId);
}

/**
 * Menghapus seluruh draft lokal yang sudah tersinkronisasi ('synced') ke Supabase.
 * Mencegah penumpukan data di browser pengguna agar HP tetap ringan dan bebas lag.
 */
export async function clearSyncedDispensasiDrafts(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll('dispensasiDrafts');
  let deletedCount = 0;
  for (const draft of all) {
    if (draft.syncStatus === 'synced') {
      await db.delete('dispensasiDrafts', draft.localId);
      deletedCount++;
    }
  }
  return deletedCount;
}

/**
 * Pembersihan total wilayah pengguna (IndexedDB + pointer localStorage).
 */
export async function purgeLocalUserData(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear('dispensasiDrafts');
  } catch (err) {
    console.warn('Gagal membersihkan IndexedDB:', err);
  }
  try {
    localStorage.removeItem('cipatujah_last_dispensasi');
  } catch (err) {
    console.warn('Gagal membersihkan localStorage:', err);
  }
}

