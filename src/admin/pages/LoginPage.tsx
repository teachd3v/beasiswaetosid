import { useState } from 'react';
import { loginAdmin } from '../../services/adminApi';
import type { AdminUser } from '../../services/adminApi';

interface LoginPageProps {
  readonly onSuccess: (user: AdminUser) => void;
  readonly onBackHome: () => void;
}

export function LoginPage({ onSuccess, onBackHome }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await loginAdmin(email.trim(), password);
      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
            Beasiswa ETOS ID
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
            Login Admin CMS
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Kelola Media Foto, Profil Etoser, Berita, Testimoni, dan Tim Kami.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-neutral-700">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@etos-id.net"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-[var(--brand-green)] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-neutral-700"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-[var(--brand-green)] focus:outline-none"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--brand-green-dark)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="mt-6 border-t border-neutral-100 pt-4 text-center">
          <button
            type="button"
            onClick={onBackHome}
            className="text-xs font-semibold text-neutral-500 transition-colors hover:text-[var(--brand-green-dark)]"
          >
            ← Kembali ke Website Publik
          </button>
        </div>
      </div>
    </div>
  );
}
