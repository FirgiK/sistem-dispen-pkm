import { useState, type FormEvent, type ChangeEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
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
import { compressImage, formatBytes } from '../../lib/image-compressor';
import { uploadLampiranToSupabase } from '../../lib/storage-upload';

type SubmitState = 'idle' | 'saving' | 'saved' | 'error';

interface DispensasiFormProps {
  onSubmitted?: (info: { localId: string; remoteId?: string }) => void;
}

export default function DispensasiForm({ onSubmitted }: DispensasiFormProps) {
  const [formData, setFormData] = useState<DispensasiFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<DispensasiFormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [draftSyncStatus, setDraftSyncStatus] = useState<SyncStatus | null>(null);
  const [submitError, setSubmitError] = useState('');

  // State Lampiran & Kompresi Otomatis
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

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

  // Handler Pemilihan File, Validasi Ketat 3 Format (JPG, PNG, PDF), & Kompresi Otomatis
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      setCompressionInfo(null);
      return;
    }

    // 1. Ekstensi & MIME Type yang Resmi Diizinkan: JPG, JPEG, PNG, PDF
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    const isValidExtension = extension && allowedExtensions.includes(extension);
    const isValidMime = allowedMimeTypes.includes(file.type) || (file.type === '' && isValidExtension);

    if (!isValidExtension || !isValidMime) {
      setSelectedFile(null);
      setCompressionInfo(null);
      setFileError(
        `Format "${extension ? '.' + extension : file.name}" ditolak. Lampiran hanya menerima foto (JPG, JPEG, PNG) atau dokumen PDF.`,
      );
      e.target.value = '';
      return;
    }

    // 2. Batas Ukuran Khusus PDF (Maksimal 5 MB)
    if (extension === 'pdf' || file.type === 'application/pdf') {
      const maxPdfBytes = 5 * 1024 * 1024;
      if (file.size > maxPdfBytes) {
        setSelectedFile(null);
        setCompressionInfo(null);
        setFileError(
          `Dokumen PDF terlalu besar (${formatBytes(file.size)}). Batas maksimal dokumen PDF adalah 5 MB.`,
        );
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setCompressionInfo(`Dokumen PDF siap: ${file.name} (${formatBytes(file.size)})`);
      return;
    }

    // 3. Foto (JPG, PNG): Kompres Otomatis di Browser
    setIsCompressing(true);
    try {
      const result = await compressImage(file);
      setSelectedFile(result.file);
      if (result.reductionPercentage > 0) {
        setCompressionInfo(
          `Foto dikompres otomatis dari ${formatBytes(result.originalSize)} menjadi ${formatBytes(result.compressedSize)} (Hemat ${result.reductionPercentage}%)`,
        );
      } else {
        setCompressionInfo(`Ukuran optimal: ${formatBytes(result.compressedSize)}`);
      }
    } catch {
      setSelectedFile(file);
    } finally {
      setIsCompressing(false);
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
      // 0. Upload file lampiran jika ada (otomatis diunggah jika online)
      let lampiranUrl: string | undefined = undefined;
      if (selectedFile) {
        const uploadedUrl = await uploadLampiranToSupabase(selectedFile);
        if (uploadedUrl) {
          lampiranUrl = uploadedUrl;
        }
      }

      // 1. Simpan ke IndexedDB sebagai draft offline lokal (aman walau koneksi terputus)
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
        lampiranUrl,
        status: DISPENSASI_STATUS.MENUNGGU_PERSETUJUAN,
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
      setSelectedFile(null);
      setCompressionInfo(null);
      setErrors({});
      onSubmitted?.({ localId: draft.localId, remoteId: draft.remoteId });
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Pengajuan Berhasil Disimpan
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            Pengajuan dispensasi Anda telah tercatat dalam sistem.
          </p>
          <div className="mt-3 flex justify-center">
            <SyncStatusIndicator syncStatus={draftSyncStatus} />
          </div>
          <div className="mt-6">
            <Button
              variant="primary"
              className="bg-slate-900 hover:bg-slate-800"
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

      {/* 4. Tanggal Mulai dan Tanggal Selesai */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* 6. Lampiran (Aktif dengan Kompresi Otomatis) */}
      <div className="space-y-1.5">
        <Input
          label="Bukti / Lampiran (Opsional)"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={handleFileChange}
          id="input-lampiran"
          disabled={isCompressing || submitState === 'saving'}
        />

        {/* Pesan Error Validasi File */}
        {fileError && (
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 font-medium">
            {fileError}
          </p>
        )}

        {/* Status Kompresi Sedang Berjalan */}
        {isCompressing && (
          <p className="text-xs text-amber-700 flex items-center gap-1.5 font-medium">
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
            <span>Mengompres foto otomatis untuk menghemat kuota data...</span>
          </p>
        )}

        {/* Info Sukses Kompresi / Dokumen */}
        {compressionInfo && !isCompressing && !fileError && (
          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md p-2 font-medium">
            {compressionInfo}
          </p>
        )}

        <p className="text-[11px] text-slate-500">
          Hanya menerima file <strong>JPG, PNG</strong> (foto otomatis dikompres) atau <strong>PDF</strong> (maks. 5 MB).
        </p>
      </div>

      {/* Tombol Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitState === 'saving'}
          className="w-full bg-slate-900 hover:bg-slate-800"
        >
          {submitState === 'saving' ? 'Menyimpan Pengajuan…' : 'Kirim Pengajuan Dispensasi'}
        </Button>
      </div>
    </form>
  );
}
