import { useState } from 'react';
import { Button, Textarea } from '../../components';

interface RejectModalProps {
  isOpen: boolean;
  applicantName: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function RejectModal({
  isOpen,
  applicantName,
  onClose,
  onConfirm,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleConfirm() {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Alasan penolakan WAJIB diisi sesuai aturan alur dispensasi.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onConfirm(trimmed);
      setReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menolak pengajuan');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl border border-slate-200">
        <h3 id="reject-title" className="text-base font-semibold text-slate-800">
          Tolak Pengajuan Dispensasi
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Pengaju: <strong>{applicantName}</strong>
        </p>

        <div className="mt-4">
          <Textarea
            label="Alasan Penolakan"
            placeholder="Tuliskan alasan penolakan secara jelas dan objektif..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            error={error}
            required
            id="textarea-alasan-penolakan"
          />
          <p className="mt-1 text-[11px] text-amber-600">
            * Catatan: Alasan penolakan wajib dicatat dan dapat dilihat oleh pengaju.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={isSubmitting}
            onClick={handleConfirm}
          >
            Tolak Pengajuan
          </Button>
        </div>
      </div>
    </div>
  );
}
