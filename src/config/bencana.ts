/**
 * Konfigurasi modul Pantauan Bencana & Integrasi SIGAP
 */

export const SIGAP_PORTAL_URL = 'https://sigap-pkmcipatujah.netlify.app/';

export const SIGAP_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Belum Diverifikasi': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
  },
  'Terverifikasi': {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
  'Sedang Ditangani': {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-300',
  },
  'Selesai': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
  },
  'Ditolak': {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-300',
  },
};
