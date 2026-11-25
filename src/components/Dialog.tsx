import { useEffect, type ReactNode } from 'react';
import Button from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger' | 'secondary';
  onConfirm?: () => void;
  isConfirmLoading?: boolean;
  cancelText?: string;
  icon?: ReactNode;
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText,
  confirmVariant = 'primary',
  onConfirm,
  isConfirmLoading = false,
  cancelText = 'Batal',
  icon,
}: DialogProps) {
  // Tutup dengan tombol Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const confirmButtonClass =
    confirmVariant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : confirmVariant === 'secondary'
      ? 'bg-slate-700 hover:bg-slate-800 text-white'
      : 'bg-[#0F766E] hover:bg-[#0b5852] text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop dengan blur lembut */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Konten Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-200/90 z-10">
        {/* Tombol Tutup X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Tutup dialog"
        >
          ✕
        </button>

        {/* Header Dialog */}
        <div className="flex items-start gap-3.5">
          {icon && (
            <div className="shrink-0 p-2.5 rounded-xl bg-slate-100 text-xl">
              {icon}
            </div>
          )}
          <div className="min-w-0 pr-6">
            <h2
              id="dialog-title"
              className="text-base sm:text-lg font-bold text-slate-900 leading-tight"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Isi Tambahan (Jika Ada) */}
        {children && <div className="mt-4">{children}</div>}

        {/* Tombol Aksi */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isConfirmLoading}
          >
            {cancelText}
          </Button>

          {onConfirm && confirmText && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onConfirm}
              loading={isConfirmLoading}
              className={confirmButtonClass}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
