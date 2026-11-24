import { useState, type FormEvent } from 'react';
import { Input, Select, Textarea, Button, Card, SyncStatusIndicator } from '../../components';
import { BENCANA_TYPES, STATUS_KORBAN_OPTIONS } from '../../config/bencana';
import { TEMPORARY_JOB_LIST } from '../../config/dispensasi';
import type { BencanaType, StatusKorban, KoordinatGPS } from '../../types/bencana';
import {
  getInitialBencanaFormData,
  validateBencanaForm,
  isBencanaFormValid,
  type BencanaFormData,
  type BencanaFormErrors,
} from './validation';
import { saveBencanaDraft, type SyncStatus } from '../../lib/offline-storage';

type SubmitState = 'idle' | 'saving' | 'saved' | 'error';

interface BencanaFormProps {
  onSubmitted?: () => void;
}

export default function BencanaForm({ onSubmitted }: BencanaFormProps) {
  const [formData, setFormData] = useState<BencanaFormData>(getInitialBencanaFormData());
  const [errors, setErrors] = useState<BencanaFormErrors>({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [draftSyncStatus, setDraftSyncStatus] = useState<SyncStatus | null>(null);
  const [submitError, setSubmitError] = useState('');

  function updateField<K extends keyof BencanaFormData>(key: K, value: BencanaFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function handleGetGPS() {
    if (!navigator.geolocation) {
      setGpsNotice('Perangkat ini tidak mendukung deteksi GPS.');
      return;
    }

    setGpsLoading(true);
    setGpsNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: KoordinatGPS = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracyMeters: Math.round(pos.coords.accuracy),
        };
        updateField('koordinatGPS', coords);
        setGpsNotice(`GPS terkunci: ${coords.latitude}, ${coords.longitude} (Akurasi: ~${coords.accuracyMeters}m)`);
        setGpsLoading(false);
      },
      (err) => {
        setGpsNotice(`Gagal mendeteksi GPS: ${err.message}. Tetap bisa diisi manual.`);
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateBencanaForm(formData);
    setErrors(validationErrors);

    if (!isBencanaFormValid(validationErrors)) {
      const firstKey = Object.keys(validationErrors)[0];
      const el =
        document.getElementById(`input-${firstKey}`) ||
        document.getElementById(`select-${firstKey}`) ||
        document.getElementById(`textarea-${firstKey}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitState('saving');
    setSubmitError('');

    try {
      const draft = await saveBencanaDraft({
        jenisBencana: formData.jenisBencana as BencanaType,
        keteranganJenisLainnya: formData.keteranganJenisLainnya.trim() || undefined,
        lokasi: formData.lokasi.trim(),
        koordinatGPS: formData.koordinatGPS,
        waktuKejadian: new Date(formData.waktuKejadian).toISOString(),
        namaPelapor: formData.namaPelapor.trim(),
        jobBagian: formData.jobBagian,
        deskripsi: formData.deskripsi.trim(),
        statusKorban: formData.statusKorban,
        perkiraanJumlahKorban: formData.perkiraanJumlahKorban.trim() || undefined,
        kebutuhanMendesak: formData.kebutuhanMendesak.trim() || undefined,
        createdAt: new Date().toISOString(),
      });

      setDraftSyncStatus(draft.syncStatus);
      setSubmitState('saved');
      setFormData(getInitialBencanaFormData());
      setGpsNotice(null);
      setErrors({});
      onSubmitted?.();
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan laporan.');
    }
  }

  const jenisOptions = BENCANA_TYPES.map((b) => ({ value: b.type, label: b.label }));
  const jobOptions = TEMPORARY_JOB_LIST.map((j) => ({ value: j, label: j }));
  const korbanOptions = STATUS_KORBAN_OPTIONS.map((k) => ({ value: k.value, label: k.label }));

  const showCustomJenis = formData.jenisBencana === 'Lainnya';
  const showKorbanDetail = formData.statusKorban === 'ada';

  if (submitState === 'saved' && draftSyncStatus) {
    return (
      <Card className="text-center border-emerald-200">
        <div className="py-6">
          <span className="text-5xl" aria-hidden="true">🚨</span>
          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Laporan Bencana Berhasil Disimpan
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Laporan darurat Anda telah dicatat secara lokal dan akan terkirim ke server saat terhubung.
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
              Buat Laporan Baru
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {submitState === 'error' && submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {submitError}
        </div>
      )}

      {/* 1. Jenis Bencana */}
      <Select
        label="Jenis Bencana"
        options={jenisOptions}
        value={formData.jenisBencana}
        onChange={(e) => updateField('jenisBencana', e.target.value as BencanaType | '')}
        error={errors.jenisBencana}
        required
        id="select-jenisBencana"
      />

      {showCustomJenis && (
        <Input
          label="Keterangan Jenis Bencana"
          placeholder="Sebutkan jenis kejadian..."
          value={formData.keteranganJenisLainnya}
          onChange={(e) => updateField('keteranganJenisLainnya', e.target.value)}
          error={errors.keteranganJenisLainnya}
          required
          id="input-keteranganJenisLainnya"
        />
      )}

      {/* 2. Lokasi Kejadian & GPS */}
      <div>
        <Input
          label="Lokasi / Patokan Kejadian"
          placeholder="Contoh: Kp. Cipatujah RT 02/01, dekat jembatan..."
          value={formData.lokasi}
          onChange={(e) => updateField('lokasi', e.target.value)}
          error={errors.lokasi}
          required
          id="input-lokasi"
        />
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleGetGPS}
            disabled={gpsLoading}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:text-slate-400 cursor-pointer flex items-center gap-1"
          >
            {gpsLoading ? '⏳ Mendeteksi GPS...' : '📍 Ambil Koordinat GPS (Opsional)'}
          </button>
          {formData.koordinatGPS && (
            <span className="text-[11px] text-emerald-700 font-medium">
              GPS: {formData.koordinatGPS.latitude}, {formData.koordinatGPS.longitude}
            </span>
          )}
        </div>
        {gpsNotice && !formData.koordinatGPS && (
          <p className="mt-1 text-[11px] text-slate-500">{gpsNotice}</p>
        )}
      </div>

      {/* 3. Waktu Kejadian */}
      <Input
        label="Waktu Kejadian"
        type="datetime-local"
        value={formData.waktuKejadian}
        onChange={(e) => updateField('waktuKejadian', e.target.value)}
        error={errors.waktuKejadian}
        required
        id="input-waktuKejadian"
        hint="Default waktu sekarang, dapat disesuaikan bila kejadian sudah lewat"
      />

      {/* 4. Nama Pelapor & Bagian */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Nama Pelapor"
          placeholder="Nama Anda"
          value={formData.namaPelapor}
          onChange={(e) => updateField('namaPelapor', e.target.value)}
          error={errors.namaPelapor}
          required
          id="input-namaPelapor"
        />
        <Select
          label="Bagian / Pos Tugas"
          options={jobOptions}
          value={formData.jobBagian}
          onChange={(e) => updateField('jobBagian', e.target.value)}
          error={errors.jobBagian}
          required
          id="select-jobBagian"
        />
      </div>

      {/* 5. Deskripsi Singkat */}
      <Textarea
        label="Deskripsi Kejadian"
        placeholder="Jelaskan kondisi saat ini secara ringkas..."
        value={formData.deskripsi}
        onChange={(e) => updateField('deskripsi', e.target.value)}
        error={errors.deskripsi}
        required
        id="textarea-deskripsi"
      />

      {/* 6. Dampak Korban (Opsional/Cepat) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
        <Select
          label="Kondisi Korban Jiwa / Luka"
          options={korbanOptions}
          value={formData.statusKorban}
          onChange={(e) => updateField('statusKorban', e.target.value as StatusKorban)}
          id="select-statusKorban"
        />

        {showKorbanDetail && (
          <Input
            label="Perkiraan Jumlah Korban"
            placeholder="Contoh: 3 orang luka ringan, 1 butuh rujukan..."
            value={formData.perkiraanJumlahKorban}
            onChange={(e) => updateField('perkiraanJumlahKorban', e.target.value)}
            id="input-perkiraanJumlahKorban"
          />
        )}

        <Input
          label="Kebutuhan Bantuan Mendesak (Opsional)"
          placeholder="Contoh: Ambulans, perban, oksigen, tenda darurat..."
          value={formData.kebutuhanMendesak}
          onChange={(e) => updateField('kebutuhanMendesak', e.target.value)}
          id="input-kebutuhanMendesak"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="danger"
          size="lg"
          loading={submitState === 'saving'}
          className="w-full font-bold shadow-md"
        >
          {submitState === 'saving' ? 'Menyimpan Laporan…' : 'Kirim Laporan Bencana'}
        </Button>
      </div>
    </form>
  );
}
