import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Lock, LogOut } from 'lucide-react';
import { Button, Footer, PuskesmasLogo } from '../../components';

interface LoginPageProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  authError: string | null;
  authenticatedWithoutAccess?: {
    email: string;
    isInactive: boolean;
    onSignOut: () => Promise<void>;
  };
}

export default function LoginPage({
  onSignIn,
  authError,
  authenticatedWithoutAccess,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Email dan kata sandi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSignIn(email, password);
      if (res.error) {
        setLocalError(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 space-y-5">
          {/* Identitas instansi terintegrasi di pucuk kartu */}
          <div className="border-b border-slate-200 pb-4">
            <PuskesmasLogo
              size="md"
              textColor="dark"
              showText={true}
              title="UPTD PUSKESMAS CIPATUJAH"
              subtitle="Dashboard Pimpinan & Manajemen Sistem"
            />
          </div>

          {authenticatedWithoutAccess ? (
            <div className="space-y-4">
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>
                    {authenticatedWithoutAccess.isInactive
                      ? 'Akun Dinonaktifkan'
                      : 'Akun Belum Memiliki Izin Akses'}
                  </span>
                </div>
                <p className="leading-relaxed">
                  Akun <span className="font-mono font-medium">{authenticatedWithoutAccess.email}</span>{' '}
                  {authenticatedWithoutAccess.isInactive
                    ? 'saat ini berstatus nonaktif.'
                    : 'belum diberikan role atau izin akses ke dashboard.'}{' '}
                  Silakan hubungi Administrator IT Puskesmas Cipatujah.
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={authenticatedWithoutAccess.onSignOut}
                className="w-full justify-center gap-2"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                <span>Keluar dari Akun Ini</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Lock className="h-4 w-4 text-slate-700" strokeWidth={1.75} />
                  <h1>Masuk Dashboard Internal</h1>
                </div>
                <p className="text-xs text-slate-500">
                  Khusus Kepala Puskesmas dan Administrator IT. Petugas pengaju dispensasi tidak perlu login.
                </p>
              </div>

              {displayError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
                >
                  {displayError}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-medium text-slate-700"
                >
                  Email Akun
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@puskesmas.id"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-slate-700"
                >
                  Kata Sandi
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                className="w-full justify-center"
              >
                {isSubmitting ? 'Memverifikasi...' : 'Masuk Dashboard'}
              </Button>
            </form>
          )}

          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs text-slate-500">
            <Link to="/dispensasi" className="hover:text-slate-900 underline">
              Buka Form Dispensasi
            </Link>
            <Link to="/layanan" className="hover:text-slate-900 underline">
              Portal Layanan
            </Link>
          </div>
        </div>
      </main>

      <Footer maxWidth="form" />
    </div>
  );
}
