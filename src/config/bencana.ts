import type { BencanaType, StatusKorban } from '../types/bencana';

export const BENCANA_TYPES: readonly { type: BencanaType; label: string; requiresCustomNote?: boolean }[] = [
  { type: 'Banjir', label: 'Banjir' },
  { type: 'Tanah Longsor', label: 'Tanah Longsor' },
  { type: 'Gempa Bumi', label: 'Gempa Bumi' },
  { type: 'Kebakaran', label: 'Kebakaran' },
  { type: 'Pohon Tumbang', label: 'Pohon Tumbang' },
  { type: 'Lainnya', label: 'Lainnya (Wajib isi keterangan)', requiresCustomNote: true },
] as const;

export const STATUS_KORBAN_OPTIONS: readonly { value: StatusKorban; label: string }[] = [
  { value: 'belum_diketahui', label: 'Belum Diketahui' },
  { value: 'tidak_ada', label: 'Tidak Ada Korban' },
  { value: 'ada', label: 'Ada Korban (Perlu Evakuasi / Medis)' },
] as const;
