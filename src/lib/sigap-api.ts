import type { SigapBencanaReport } from '../types/bencana';

const sigapApiUrl = import.meta.env.VITE_SIGAP_API_URL;

/**
 * Status konfigurasi endpoint API SIGAP.
 * True hanya jika VITE_SIGAP_API_URL diatur dengan URL HTTP(S) valid di .env.
 */
export const isSigapConfigured = Boolean(
  sigapApiUrl &&
  typeof sigapApiUrl === 'string' &&
  sigapApiUrl.trim().length > 0 &&
  sigapApiUrl.trim().startsWith('http')
);

export interface SigapFetchResult {
  data: SigapBencanaReport[];
  isConfigured: boolean;
  error: string | null;
}

/**
 * Mengambil laporan bencana resmi dari API SIGAP.
 * Jika VITE_SIGAP_API_URL belum dikonfigurasi, mengembalikan array kosong (0 data)
 * agar metrik dan grafik tetap jujur tanpa data dummy.
 */
export async function fetchSigapBencanaReports(): Promise<SigapFetchResult> {
  if (!isSigapConfigured) {
    return {
      data: [],
      isConfigured: false,
      error: null,
    };
  }

  try {
    const response = await fetch(sigapApiUrl.trim(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const reports: SigapBencanaReport[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
      ? json.data
      : [];

    return {
      data: reports,
      isConfigured: true,
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      isConfigured: true,
      error: err instanceof Error ? err.message : 'Gagal menghubungi server API SIGAP',
    };
  }
}
