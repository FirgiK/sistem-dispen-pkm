import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Upload file lampiran (foto/surat tugas) ke Supabase Storage.
 * Otomatis mengembalikan Public URL file.
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
      .from('lampiran-dispensasi')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('Supabase Storage notice:', uploadError.message);
      return null;
    }

    const { data } = supabase.storage
      .from('lampiran-dispensasi')
      .getPublicUrl(filePath);

    return data.publicUrl || null;
  } catch (err) {
    console.warn('Kesalahan saat upload lampiran:', err);
    return null;
  }
}
