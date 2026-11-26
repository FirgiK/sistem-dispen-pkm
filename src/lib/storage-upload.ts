import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET_NAME = 'lampiran-dispensasi';

/**
 * Upload file lampiran (foto/surat tugas) ke Supabase Storage (bucket private).
 * Mengembalikan storage path (contoh: pengajuan/12345-abc.jpg).
 */
export async function uploadLampiranToSupabase(file: File): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `pengajuan/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return null;
    }

    return filePath;
  } catch {
    return null;
  }
}

/**
 * Membuat Signed URL sementara (5 menit) untuk membaca lampiran di bucket private.
 * Hanya berhasil untuk pengguna dashboard yang sudah login dengan izin dispensasi:read.
 */
export async function getLampiranSignedUrl(pathOrUrl: string): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
    return null;
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(pathOrUrl, 300);

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}
