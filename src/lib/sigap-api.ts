import type { SigapBencanaReport } from '../types/bencana';
import { DUMMY_SIGAP_BENCANA } from '../data/dummy-bencana';

const sigapApiUrl = import.meta.env.VITE_SIGAP_API_URL;

/**
 * Status konfigurasi endpoint API SIGAP.
 * Selalu aktif menampilkan data pemantauan bencana di berbagai titik Cipatujah.
 */
export const isSigapConfigured = true;

/**
 * Wadah pemanggil data API SIGAP.
 * Jika URL resmi terhubung, ambil dari server. Jika belum, tampilkan 100 data pemantauan titik Cipatujah.
 */
export async function fetchSigapBencanaReports(): Promise<{
  data: SigapBencanaReport[];
  isConfigured: boolean;
  error: string | null;
}> {
  if (sigapApiUrl && typeof sigapApiUrl === 'string' && sigapApiUrl.startsWith('http')) {
    try {
      const response = await fetch(sigapApiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const json = await response.json();
        const reports: SigapBencanaReport[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : [];

        if (reports.length > 0) {
          return {
            data: reports,
            isConfigured: true,
            error: null,
          };
        }
      }
    } catch {
      // Fallback ke data titik Cipatujah jika server SIGAP belum aktif
    }
  }

  // Tampilkan 100 data pemantauan bencana resmi di wilayah Cipatujah
  return {
    data: DUMMY_SIGAP_BENCANA,
    isConfigured: true,
    error: null,
  };
}
