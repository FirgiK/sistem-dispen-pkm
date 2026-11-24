import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DispensasiSubmission } from '../types/dispensasi';
import type { BencanaReport } from '../types/bencana';

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

export interface BencanaDraft {
  localId: string;
  data: Omit<BencanaReport, 'id' | 'localId' | 'syncStatus'>;
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
  bencanaDrafts: {
    key: string;
    value: BencanaDraft;
    indexes: {
      'by-sync-status': SyncStatus;
      'by-created-at': string;
    };
  };
}

const DB_NAME = 'dashboard-puskesmas-cipatujah';
const DB_VERSION = 1;

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

      if (!db.objectStoreNames.contains('bencanaDrafts')) {
        const bencanaStore = db.createObjectStore('bencanaDrafts', {
          keyPath: 'localId',
        });
        bencanaStore.createIndex('by-sync-status', 'syncStatus');
        bencanaStore.createIndex('by-created-at', 'createdAt');
      }
    },
  });

  return dbInstance;
}

export function generateLocalId(prefix: 'disp' | 'bencana' = 'disp'): string {
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

// ─── Bencana Operations ─────────────────────────────────────

export async function saveBencanaDraft(
  data: BencanaDraft['data'],
): Promise<BencanaDraft> {
  const db = await getDB();
  const draft: BencanaDraft = {
    localId: generateLocalId('bencana'),
    data,
    syncStatus: 'pending',
    createdAt: new Date().toISOString(),
  };
  await db.put('bencanaDrafts', draft);
  return draft;
}

export async function getAllBencanaDrafts(): Promise<BencanaDraft[]> {
  const db = await getDB();
  return db.getAllFromIndex('bencanaDrafts', 'by-created-at');
}

export async function getPendingBencanaDrafts(): Promise<BencanaDraft[]> {
  const db = await getDB();
  const pending = await db.getAllFromIndex('bencanaDrafts', 'by-sync-status', 'pending');
  const failed = await db.getAllFromIndex('bencanaDrafts', 'by-sync-status', 'failed');
  return [...pending, ...failed];
}

export async function updateBencanaDraftSync(
  localId: string,
  update: { syncStatus: SyncStatus; remoteId?: string; syncError?: string },
): Promise<void> {
  const db = await getDB();
  const draft = await db.get('bencanaDrafts', localId);
  if (!draft) return;

  const updated: BencanaDraft = {
    ...draft,
    syncStatus: update.syncStatus,
    lastSyncAttempt: new Date().toISOString(),
    ...(update.remoteId !== undefined && { remoteId: update.remoteId }),
    ...(update.syncError !== undefined && { syncError: update.syncError }),
  };
  await db.put('bencanaDrafts', updated);
}
