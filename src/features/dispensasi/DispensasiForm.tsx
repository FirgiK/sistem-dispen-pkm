import { useState, type FormEvent } from 'react';
import { Input, Select, Textarea, Button, Card, SyncStatusIndicator } from '../../components';
import {
  DISPENSASI_TYPES,
  SHIFT_SUBTYPES,
  TEMPORARY_JOB_LIST,
} from '../../config/dispensasi';
import { DISPENSASI_STATUS } from '../../types/dispensasi';
import type { DispensasiType, ShiftSubtype } from '../../types/dispensasi';
import {
  validateDispensasiForm,
  isFormValid,
  INITIAL_FORM_DATA,
  type DispensasiFormData,
  type DispensasiFormErrors,
} from './validation';
import { saveDispensasiDraft, type SyncStatus } from '../../lib/offline-storage';
import { syncSingleDraft } from '../../lib/dispensasi-sync';

type SubmitState = 'idle' | 'saving' | 'saved' | 'error';

interface DispensasiFormProps {
  onSubmitted?: () => void;
}

export default function DispensasiForm({ onSubmitted }: DispensasiFormProps) {
  const [formData, setFormData] = useState<DispensasiFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<DispensasiFormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [draftSyncStatus, setDraftSyncStatus] = useState<SyncStatus | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Helper untuk update field
  function updateField<K extends keyof DispensasiFormData>(
    key: K,
    value: DispensasiFormData[K],
  ) {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      // Reset sub-jenis saat jenis berubah
      if (key === 'jenisDispensasi') {
        next.subJenisShift = '';
        next.keteranganIzinLainnya = '';
      }

      return next;
    });

    // Hapus error field ini saat user mulai mengetik
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  // Opsi-opsi untuk Select
  const jobOptions = TEMPORARY_JOB_LIST.map((j) => ({ value: j, label: j }));
  const jenisOptions = DISPENSASI_TYPES.map((d) => ({
    value: d.type,
    label: d.label,
  }));
  const shiftOptions = SHIFT_SUBTYPES.map((s) => ({ value: s, label: s }));

  // Cek apakah jenis yang dipilih butuh sub-jenis atau keterangan
  const selectedJenis = DISPENSASI_TYPES.find(
    (d) => d.type === formData.jenisDispensasi,
  );
  const showShiftSubtype = selectedJenis?.hasSubtype === true;
  const showCustomNote = selectedJenis?.requiresCustomNote === true;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Validasi
    const validationErrors = validateDispensasiForm(formData);
    setErrors(validationErrors);

    if (!isFormValid(validationErrors)) {
      // Scroll ke error pertama
      const firstErrorKey = Object.keys(validationErrors)[0];
      const el =
        document.getElementById(`input-${firstErrorKey}`) ||
        document.getElementById(`select-${firstErrorKey}`) ||
        document.getElementById(`textarea-${firstErrorKey}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitState('saving');
    setSubmitError('');

    try {
      // 1. Simpan ke IndexedDB sebagai draft offline lokal terlebih dahulu (aman dari koneksi mati)
      const draft = await saveDispensasiDraft({
        namaPengaju: formData.namaPengaju.trim(),
        jobBagian: formData.jobBagian,
        jenisDispensasi: formData.jenisDispensasi as DispensasiType,
        ...(showShiftSubtype && formData.subJenisShift
          ? { subJenisShift: formData.subJenisShift as ShiftSubtype }
          : {}),
        ...(showCustomNote && formData.keteranganIzinLainnya.trim()
          ? { keteranganIzinLainnya: formData.keteranganIzinLainnya.trim() }
          : {}),
        tanggalMulai: formData.tanggalMulai,
        tanggalSelesai: formData.tanggalSelesai,
        alasan: formData.alasan.trim(),
        status: DISPENSASI_STATUS.MENUNGGU_KAPUS,
        createdAt: new Date().toISOString(),
      });

      setDraftSyncStatus(draft.syncStatus);
      setSubmitState('saved');

      // 2. Jika online dan Supabase siap, langsung sinkronkan ke server secara background
      syncSingleDraft(draft).then((synced) => {
        if (synced) {
          setDraftSyncStatus('synced');
        }
      });

      // Reset form setelah berhasil
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
      onSubmitted?.();
    } catch (err) {
      setSubmitState('error');
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan draft. Coba lagi.',
      );
    }
  }

  // Kalau baru saja berhasil submit, tampilkan konfirmasi
  if (submitState === 'saved' && draftSyncStatus) {
    return (
      <Card className="text-center">
        <div className="py-6">
          <span className="text-5xl" aria-hidden="true">✅</span>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Pengajuan Berhasil Disimpan
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Pengajuan dispensasi Anda telah tercatat dalam sistem.
          </p>
          <div className="mt-3 flex justify-center">
            <SyncStatusIndicator syncStatus={draftSyncStatus} />
          </div>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => {
                setSubmitState('idle');
                setDraftSyncStatus(null);
              }}
            >
              Buat Pengajuan Baru
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Error submit global */}
      {submitState === 'error' && submitError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {submitError}
        </div>
      )}

      {/* 1. Nama Pengaju */}
      <Input
        label="Nama Pengaju"
        placeholder="Masukkan nama lengkap"
        value={formData.namaPengaju}
        onChange={(e) => updateField('namaPengaju', e.target.value)}
        error={errors.namaPengaju}
        required
        autoComplete="name"
        id="input-namaPengaju"
      />

      {/* 2. Job / Bagian */}
      <Select
        label="Job / Bagian"
        options={jobOptions}
        value={formData.jobBagian}
        onChange={(e) => updateField('jobBagian', e.target.value)}
        error={errors.jobBagian}
        required
        hint="Daftar ini masih sementara dan bisa berubah"
        id="select-jobBagian"
      />

      {/* 3. Jenis Dispensasi */}
      <Select
        label="Jenis Dispensasi"
        options={jenisOptions}
        value={formData.jenisDispensasi}
        onChange={(e) =>
          updateField('jenisDispensasi', e.target.value as DispensasiType | '')
        }
        error={errors.jenisDispensasi}
        required
        id="select-jenisDispensasi"
      />

      {/* 3a. Sub-jenis Shift (muncul hanya jika Shift Kerja) */}
      {showShiftSubtype && (
        <Select
          label="Sub-jenis Shift"
          options={shiftOptions}
          value={formData.subJenisShift}
          onChange={(e) =>
            updateField('subJenisShift', e.target.value as ShiftSubtype | '')
          }
          error={errors.subJenisShift}
          required
          id="select-subJenisShift"
        />
      )}

      {/* 3b. Keterangan Izin Lainnya (muncul hanya jika Izin Lainnya) */}
      {showCustomNote && (
        <Textarea
          label="Keterangan Izin"
          placeholder="Jelaskan jenis izin yang diajukan"
          value={formData.keteranganIzinLainnya}
          onChange={(e) =>
            updateField('keteranganIzinLainnya', e.target.value)
          }
          error={errors.keteranganIzinLainnya}
          required
          id="textarea-keteranganIzinLainnya"
        />
      )}

      {/* 4. Tanggal Mulai & Selesai */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Tanggal Mulai"
          type="date"
          value={formData.tanggalMulai}
          onChange={(e) => updateField('tanggalMulai', e.target.value)}
          error={errors.tanggalMulai}
          required
          id="input-tanggalMulai"
        />
        <Input
          label="Tanggal Selesai"
          type="date"
          value={formData.tanggalSelesai}
          onChange={(e) => updateField('tanggalSelesai', e.target.value)}
          error={errors.tanggalSelesai}
          required
          id="input-tanggalSelesai"
        />
      </div>

      {/* 5. Alasan */}
      <Textarea
        label="Alasan"
        placeholder="Tuliskan alasan pengajuan dispensasi"
        value={formData.alasan}
        onChange={(e) => updateField('alasan', e.target.value)}
        error={errors.alasan}
        required
        id="textarea-alasan"
      />

      {/* 6. Lampiran (opsional, placeholder - upload belum aktif) */}
      <Input
        label="Lampiran"
        type="file"
        accept="image/*,.pdf"
        hint="Opsional. Maks 2 MB. Foto atau PDF."
        disabled
        id="input-lampiran"
      />
      <p className="!mt-1 text-xs text-slate-400 italic">
        Upload lampiran belum tersedia — fitur ini akan diaktifkan setelah
        koneksi Supabase siap.
      </p>

      {/* Tombol Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitState === 'saving'}
          className="w-full"
        >
          {submitState === 'saving' ? 'Menyimpan…' : 'Ajukan Dispensasi'}
        </Button>
      </div>
    </form>
  );
}
